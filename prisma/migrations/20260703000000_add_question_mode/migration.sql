CREATE TYPE "QuestionMode" AS ENUM ('FAMILY', 'DEEP_DIVE');

ALTER TABLE "Question"
ADD COLUMN "mode" "QuestionMode" NOT NULL DEFAULT 'FAMILY';

DROP INDEX IF EXISTS "Question_isActive_createdAt_idx";

CREATE INDEX "Question_isActive_mode_createdAt_idx" ON "Question"("isActive", "mode", "createdAt");
