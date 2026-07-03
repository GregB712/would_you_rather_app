import "dotenv/config";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Prisma, PrismaClient } from "@prisma/client";

type QuestionMode = "FAMILY" | "DEEP_DIVE";

type ImportQuestion = {
  sourceIndex: number;
  id: string;
  optionA: string;
  optionB: string;
  mode: QuestionMode | null;
  votesA: number;
  votesB: number;
  isActive: boolean;
};

type ExistingQuestionConflict = {
  id: string;
  optionA: string;
  optionB: string;
  similarityScore: number;
};

type ImportSummary = {
  imported: number;
  skipped: number;
};

const VALID_MODES = new Set<QuestionMode>(["FAMILY", "DEEP_DIVE"]);

class ImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportError";
  }
}

function usage() {
  return "Usage: npm run questions:import -- ./data/questions.example.json";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStringField(
  item: Record<string, unknown>,
  field: "optionA" | "optionB",
  index: number
) {
  const value = item[field];

  if (typeof value !== "string" || value.trim() === "") {
    throw new ImportError(
      `Question ${index + 1}: ${field} must be a non-empty string.`
    );
  }

  return value.trim();
}

function readOptionalId(item: Record<string, unknown>, index: number) {
  const value = item.id;

  if (value === undefined) {
    return randomUUID();
  }

  if (typeof value !== "string" || value.trim() === "") {
    throw new ImportError(
      `Question ${index + 1}: id must be a non-empty string when provided.`
    );
  }

  return value.trim();
}

function readOptionalMode(item: Record<string, unknown>, index: number) {
  const value = item.mode;

  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string" || !VALID_MODES.has(value as QuestionMode)) {
    throw new ImportError(
      `Question ${index + 1}: mode must be FAMILY, DEEP_DIVE, null, or omitted.`
    );
  }

  return value as QuestionMode;
}

function readOptionalNonNegativeInteger(
  item: Record<string, unknown>,
  field: "votesA" | "votesB",
  index: number
) {
  const value = item[field];

  if (value === undefined) {
    return 0;
  }

  if (!Number.isInteger(value) || typeof value !== "number" || value < 0) {
    throw new ImportError(
      `Question ${index + 1}: ${field} must be a non-negative integer when provided.`
    );
  }

  return value;
}

function readOptionalBoolean(
  item: Record<string, unknown>,
  field: "isActive",
  index: number
) {
  const value = item[field];

  if (value === undefined) {
    return true;
  }

  if (typeof value !== "boolean") {
    throw new ImportError(
      `Question ${index + 1}: ${field} must be a boolean when provided.`
    );
  }

  return value;
}

function validatePayload(payload: unknown) {
  if (!isRecord(payload)) {
    throw new ImportError("JSON root must be an object.");
  }

  if (!Array.isArray(payload.questions)) {
    throw new ImportError('JSON root must include a "questions" array.');
  }

  if (payload.questions.length === 0) {
    throw new ImportError("The questions array must contain at least one question.");
  }

  const seenIds = new Set<string>();
  return payload.questions.map((item, index): ImportQuestion => {
    if (!isRecord(item)) {
      throw new ImportError(`Question ${index + 1}: item must be an object.`);
    }

    const question = {
      sourceIndex: index,
      id: readOptionalId(item, index),
      optionA: readStringField(item, "optionA", index),
      optionB: readStringField(item, "optionB", index),
      mode: readOptionalMode(item, index),
      votesA: readOptionalNonNegativeInteger(item, "votesA", index),
      votesB: readOptionalNonNegativeInteger(item, "votesB", index),
      isActive: readOptionalBoolean(item, "isActive", index)
    };

    if (seenIds.has(question.id)) {
      throw new ImportError(`Question ${index + 1}: duplicate id "${question.id}".`);
    }

    seenIds.add(question.id);

    return question;
  });
}

function normalizeQuestionText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function getNormalizedPairKey(optionA: string, optionB: string) {
  const normalizedA = normalizeQuestionText(optionA);
  const normalizedB = normalizeQuestionText(optionB);
  return [normalizedA, normalizedB].sort().join("\u0000");
}

function formatQuestion(question: Pick<ImportQuestion, "optionA" | "optionB">) {
  return `A: ${question.optionA}\nB: ${question.optionB}`;
}

function formatDatabaseInsertError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const metaCode =
      typeof error.meta?.code === "string" ? error.meta.code : undefined;
    const metaMessage =
      typeof error.meta?.message === "string" ? error.meta.message : error.message;

    if (
      metaCode === "23505" ||
      /duplicate|too similar|unique/i.test(metaMessage)
    ) {
      return `Database rejected the import because a question is duplicate or too similar. ${metaMessage}`;
    }

    return `Database insert failed. ${metaMessage}`;
  }

  return error instanceof Error ? error.message : "Unknown database insert error.";
}

function formatConflictSkip(question: ImportQuestion, conflict: ExistingQuestionConflict) {
  return [
    `Skipped question ${question.sourceIndex + 1}: duplicate or too similar to existing question ${conflict.id}.`,
    `Similarity score: ${conflict.similarityScore.toFixed(4)}`,
    "",
    "Incoming question:",
    formatQuestion(question),
    "",
    "Existing question:",
    `A: ${conflict.optionA}`,
    `B: ${conflict.optionB}`
  ].join("\n");
}

async function loadQuestions(filePath: string) {
  const absolutePath = path.resolve(process.cwd(), filePath);

  try {
    await access(absolutePath);
  } catch {
    throw new ImportError(`File does not exist: ${absolutePath}`);
  }

  let rawJson: string;

  try {
    rawJson = await readFile(absolutePath, "utf8");
  } catch (error) {
    throw new ImportError(
      `Could not read file: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawJson);
  } catch (error) {
    throw new ImportError(
      `Invalid JSON: ${error instanceof Error ? error.message : "unknown parse error"}`
    );
  }

  return validatePayload(payload);
}

async function findExistingQuestionConflict(
  prisma: PrismaClient,
  question: ImportQuestion
) {
  const conflicts = await prisma.$queryRaw<ExistingQuestionConflict[]>`
    SELECT
      "id",
      "optionA",
      "optionB",
      question_pair_similarity(
        ${question.optionA},
        ${question.optionB},
        "optionA",
        "optionB"
      )::float AS "similarityScore"
    FROM "Question"
    WHERE question_pair_similarity(
      ${question.optionA},
      ${question.optionB},
      "optionA",
      "optionB"
    ) >= 0.92
    ORDER BY "similarityScore" DESC
    LIMIT 1
  `;

  return conflicts[0] ?? null;
}

async function insertQuestion(prisma: PrismaClient, question: ImportQuestion) {
  await prisma.$executeRaw`
    INSERT INTO "Question" (
      "id",
      "optionA",
      "optionB",
      "votesA",
      "votesB",
      "isActive",
      "mode"
    )
    VALUES (
      ${question.id},
      ${question.optionA},
      ${question.optionB},
      ${question.votesA},
      ${question.votesB},
      ${question.isActive},
      ${question.mode}::"QuestionMode"
    )
  `;
}

async function insertQuestions(questions: ImportQuestion[]): Promise<ImportSummary> {
  const prisma = new PrismaClient();
  const importedPairKeys = new Map<string, ImportQuestion>();
  let imported = 0;
  let skipped = 0;

  try {
    for (const question of questions) {
      const pairKey = getNormalizedPairKey(question.optionA, question.optionB);
      const fileConflict = importedPairKeys.get(pairKey);

      if (fileConflict) {
        skipped += 1;
        console.warn(
          [
            `Skipped question ${question.sourceIndex + 1}: duplicates imported question ${fileConflict.sourceIndex + 1} in the same file after normalizing/swapping options.`,
            "",
            "Incoming question:",
            formatQuestion(question),
            "",
            "Earlier imported question:",
            formatQuestion(fileConflict)
          ].join("\n")
        );
        continue;
      }

      const existingConflict = await findExistingQuestionConflict(prisma, question);

      if (existingConflict) {
        skipped += 1;
        console.warn(formatConflictSkip(question, existingConflict));
        continue;
      }

      try {
        await insertQuestion(prisma, question);
        imported += 1;
        importedPairKeys.set(pairKey, question);
      } catch (error) {
        skipped += 1;
        console.warn(
          [
            `Skipped question ${question.sourceIndex + 1}: ${formatDatabaseInsertError(error)}`,
            "",
            "Incoming question:",
            formatQuestion(question)
          ].join("\n")
        );
      }
    }

    return { imported, skipped };
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    throw new ImportError(`No JSON file path provided.\n${usage()}`);
  }

  const questions = await loadQuestions(filePath);

  if (!process.env.DATABASE_URL) {
    throw new ImportError("DATABASE_URL must be configured before importing.");
  }

  const summary = await insertQuestions(questions);

  console.log(
    `Import complete. Imported ${summary.imported} question(s), skipped ${summary.skipped} question(s).`
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown import error.";
  console.error(`Question import failed: ${message}`);
  process.exit(1);
});
