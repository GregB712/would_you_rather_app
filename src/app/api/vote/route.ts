import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Choice } from "@/types/game";

export const dynamic = "force-dynamic";

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

function isChoice(value: unknown): value is Choice {
  return value === "A" || value === "B";
}

async function parseBody(request: Request) {
  try {
    return (await request.json()) as {
      questionId?: unknown;
      choice?: unknown;
    };
  } catch {
    throw new ApiError("Request body must be valid JSON.", 400);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);

    if (typeof body.questionId !== "string" || body.questionId.trim() === "") {
      throw new ApiError("A valid questionId is required.", 400);
    }

    if (!isChoice(body.choice)) {
      throw new ApiError('Choice must be either "A" or "B".', 400);
    }

    const questionId = body.questionId.trim();
    const selectedChoice = body.choice;

    const question = await prisma.$transaction(async (tx) => {
      const activeQuestion = await tx.question.findFirst({
        where: {
          id: questionId,
          isActive: true
        },
        select: {
          id: true
        }
      });

      if (!activeQuestion) {
        const existingQuestion = await tx.question.findUnique({
          where: {
            id: questionId
          },
          select: {
            isActive: true
          }
        });

        if (!existingQuestion) {
          throw new ApiError("Question was not found.", 404);
        }

        throw new ApiError("This question is no longer active.", 409);
      }

      return tx.question.update({
        where: {
          id: questionId
        },
        data:
          selectedChoice === "A"
            ? {
                votesA: {
                  increment: 1
                }
              }
            : {
                votesB: {
                  increment: 1
                }
              },
        select: {
          id: true,
          optionA: true,
          optionB: true,
          votesA: true,
          votesB: true,
          mode: true
        }
      });
    });

    return NextResponse.json({ question, selectedChoice });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Failed to save vote", error);

    return NextResponse.json(
      { error: "Could not save your vote right now." },
      { status: 500 }
    );
  }
}
