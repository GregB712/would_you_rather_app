import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { isPlayMode } from "@/lib/gameModes";
import { prisma } from "@/lib/prisma";
import type { PlayMode, Question } from "@/types/game";

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

async function queryRandomQuestion(
  mode: PlayMode,
  excludedIds: string[],
  userId: string | null
) {
  const conditions = [Prisma.sql`"isActive" = true`];

  if (mode !== "RANDOM") {
    conditions.push(Prisma.sql`"mode" = ${mode}::"QuestionMode"`);
  }

  if (userId) {
    // Signed-in users never see a question they have already voted on.
    conditions.push(
      Prisma.sql`NOT EXISTS (
        SELECT 1 FROM "SeenQuestion" s
        WHERE s."questionId" = "Question"."id" AND s."userId" = ${userId}
      )`
    );
  }

  // A soft, client-provided de-duplication of recently served questions. It
  // applies to everyone, so a prefetched "next" never repeats the current one.
  if (excludedIds.length > 0) {
    conditions.push(Prisma.sql`"id" NOT IN (${Prisma.join(excludedIds)})`);
  }

  // A single query picks a random matching row, halving the per-question round
  // trips compared to a separate count + skip. random() sorts only the already
  // filtered subset, which stays small for this app.
  const rows = await prisma.$queryRaw<Question[]>(Prisma.sql`
    SELECT "id", "optionA", "optionB", "votesA", "votesB", "mode"
    FROM "Question"
    WHERE ${Prisma.join(conditions, " AND ")}
    ORDER BY random()
    LIMIT 1
  `);

  return rows[0] ?? null;
}

async function getRandomQuestion(
  mode: PlayMode,
  excludedIds: string[],
  userId: string | null
) {
  const question = await queryRandomQuestion(mode, excludedIds, userId);

  // Guests fall back to ignoring their local exclusions when the pool is
  // otherwise empty. Signed-in users do not fall back: an empty result means
  // they have seen everything and should refresh their pool.
  if (!question && !userId && excludedIds.length > 0) {
    return queryRandomQuestion(mode, [], userId);
  }

  return question;
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

    const { userId } = await auth();
    const excludedIds = parseExcludedIds(url.searchParams.get("exclude"));
    const question = await getRandomQuestion(mode, excludedIds, userId);

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Failed to load random question", error);

    return NextResponse.json(
      { error: "Could not load a question right now." },
      { status: 500 }
    );
  }
}
