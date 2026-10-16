CREATE TABLE "SeenQuestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeenQuestion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SeenQuestion_userId_questionId_key" ON "SeenQuestion"("userId", "questionId");

CREATE INDEX "SeenQuestion_userId_idx" ON "SeenQuestion"("userId");

ALTER TABLE "SeenQuestion"
    ADD CONSTRAINT "SeenQuestion_questionId_fkey"
    FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
