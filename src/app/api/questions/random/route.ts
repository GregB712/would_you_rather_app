import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { isPlayMode } from "@/lib/gameModes";
import { prisma } from "@/lib/prisma";
import type { PlayMode } from "@/types/game";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_EXCLUDED_IDS = 50;

function parseExcludedIds(value: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^[a-z0-9_-]{8,64}$/i.test(id))
    .slice(0, MAX_EXCLUDED_IDS);
}

function getWhere(mode: PlayMode, excludedIds: string[]) {
  const where: Prisma.QuestionWhereInput = {
    isActive: true
  };

  if (mode !== "RANDOM") {
    where.mode = mode;
  }

  if (excludedIds.length > 0) {
    where.id = {
      notIn: excludedIds
    };
  }

  return where;
}

async function getRandomQuestion(mode: PlayMode, excludedIds: string[]) {
  const where = getWhere(mode, excludedIds);
  let count = await prisma.question.count({ where });
  let effectiveWhere: Prisma.QuestionWhereInput = where;

  if (count === 0 && excludedIds.length > 0) {
    effectiveWhere = getWhere(mode, []);
    count = await prisma.question.count({ where: effectiveWhere });
  }

  if (count === 0) {
    return null;
  }

  const skip = Math.floor(Math.random() * count);

  return prisma.question.findFirst({
    where: effectiveWhere,
    orderBy: {
      createdAt: "asc"
    },
    skip,
    select: {
      id: true,
      optionA: true,
      optionB: true,
      votesA: true,
      votesB: true,
      mode: true
    }
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");

    if (!isPlayMode(mode)) {
      return NextResponse.json(
        { error: 'Mode must be "FAMILY", "DEEP_DIVE", or "RANDOM".' },
        { status: 400 }
      );
    }

    const excludedIds = parseExcludedIds(url.searchParams.get("exclude"));
    const question = await getRandomQuestion(mode, excludedIds);

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Failed to load random question", error);

    return NextResponse.json(
      { error: "Could not load a question right now." },
      { status: 500 }
    );
  }
}
