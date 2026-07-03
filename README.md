# Would You Rather?

A small full-stack Next.js 15 app for the classic "Would You Rather?" game. It uses App Router route handlers, Prisma, PostgreSQL, and Tailwind CSS. There are no accounts or login flows: visitors choose a mode, vote anonymously, and immediately see the result breakdown.

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- Vercel-compatible serverless API routes
- Neon PostgreSQL assumed for production

## Install

```bash
npm install
```

## Environment

Copy the example file and set your database connection string:

```bash
cp .env.example .env
```

`.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

For a local PostgreSQL database without SSL, your URL may look like:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/would_you_rather"
```

## Run PostgreSQL Locally

One simple Docker option:

```bash
docker run --name would-you-rather-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=would_you_rather \
  -p 5432:5432 \
  -d postgres:16
```

Then use:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/would_you_rather"
```

## Prisma

Create or update the tables locally:

```bash
npm run prisma:migrate
```

Generate Prisma Client manually if needed:

```bash
npm run prisma:generate
```

Seed sample questions for all play pools:

```bash
npm run prisma:seed
```

Deploy existing migrations to a production database:

```bash
npm run prisma:deploy
```

## Database Duplicate Protection

Questions are protected at the PostgreSQL level so direct SQL inserts, seed scripts, and import scripts all go through the same sanity checks.

Exact duplicate rule:

- `optionA` and `optionB` are normalized with lowercasing, trimming, and whitespace collapsing.
- The two options are treated as an unordered pair.
- A database unique index rejects exact duplicates even when the options are swapped.
- This protection is race-safe because it is enforced by PostgreSQL.

Near-duplicate rule:

- The `pg_trgm` extension is enabled by migration.
- A trigger checks inserts and updates to `optionA`/`optionB`.
- The trigger compares both same-order and swapped-order option pair similarity.
- The threshold is `0.92`, chosen to be conservative and catch only high-confidence near duplicates.
- A transaction-level advisory lock serializes the similarity check so concurrent inserts cannot easily bypass it.
- Trigram similarity is not AI semantic matching. It catches strongly text-similar questions, not every paraphrase.

The migration that adds this protection fails if existing data already violates the new exact or near-duplicate rules. Diagnose exact duplicates before applying it:

```sql
WITH normalized AS (
  SELECT
    "id",
    least(
      lower(trim(regexp_replace("optionA", '\s+', ' ', 'g'))),
      lower(trim(regexp_replace("optionB", '\s+', ' ', 'g')))
    ) AS first_option,
    greatest(
      lower(trim(regexp_replace("optionA", '\s+', ' ', 'g'))),
      lower(trim(regexp_replace("optionB", '\s+', ' ', 'g')))
    ) AS second_option
  FROM "Question"
)
SELECT
  first_option,
  second_option,
  array_agg("id" ORDER BY "id") AS question_ids,
  count(*) AS duplicate_count
FROM normalized
GROUP BY first_option, second_option
HAVING count(*) > 1;
```

Diagnose high-confidence near duplicates before applying it:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

WITH pairs AS (
  SELECT
    q1."id" AS question_id_a,
    q2."id" AS question_id_b,
    greatest(
      (
        similarity(lower(trim(regexp_replace(q1."optionA", '\s+', ' ', 'g'))), lower(trim(regexp_replace(q2."optionA", '\s+', ' ', 'g')))) +
        similarity(lower(trim(regexp_replace(q1."optionB", '\s+', ' ', 'g'))), lower(trim(regexp_replace(q2."optionB", '\s+', ' ', 'g'))))
      ) / 2.0,
      (
        similarity(lower(trim(regexp_replace(q1."optionA", '\s+', ' ', 'g'))), lower(trim(regexp_replace(q2."optionB", '\s+', ' ', 'g')))) +
        similarity(lower(trim(regexp_replace(q1."optionB", '\s+', ' ', 'g'))), lower(trim(regexp_replace(q2."optionA", '\s+', ' ', 'g'))))
      ) / 2.0
    ) AS similarity_score
  FROM "Question" q1
  JOIN "Question" q2 ON q1."id" < q2."id"
)
SELECT *
FROM pairs
WHERE similarity_score >= 0.92
ORDER BY similarity_score DESC;
```

Manually delete, edit, or deactivate duplicate rows before running:

```bash
npm run prisma:migrate
```

### Python Maintenance Scripts

The repo includes Python helpers for local database cleanup. They connect directly to PostgreSQL with `psycopg` and read `DATABASE_URL` from `.env` or the environment.

Install the Python dependency once:

```bash
python3 -m pip install -r scripts/requirements.txt
```

Find exact duplicate question pairs without deleting anything:

```bash
python3 scripts/cleanup_exact_duplicates.py
```

Delete duplicate extras while keeping the oldest row in each duplicate group:

```bash
python3 scripts/cleanup_exact_duplicates.py --delete-extras
```

Skip the interactive confirmation:

```bash
python3 scripts/cleanup_exact_duplicates.py --delete-extras --yes
```

Delete every question from the database:

```bash
python3 scripts/cleanup_all_questions.py
```

This asks you to type `DELETE ALL QUESTIONS` before removing rows. To skip confirmation:

```bash
python3 scripts/cleanup_all_questions.py --yes
```

Pass a database URL explicitly if needed:

```bash
python3 scripts/cleanup_all_questions.py --database-url "postgresql://postgres:postgres@localhost:5432/would_you_rather"
```

## Run the App

```bash
npm run dev
```

Open the local URL printed by Next.js.

Production build:

```bash
npm run build
npm run start
```

## Add Questions Manually

New active rows in the `Question` table are available immediately because the frontend fetches questions from `/api/questions/random?mode=...` at runtime.

The app has three play modes:

- `FAMILY`: light, safe, broadly appropriate questions.
- `DEEP_DIVE`: thoughtful, intense, philosophical, or personal questions.
- `RANDOM`: a gameplay mode that can draw from all active questions.

The database `mode` field is optional:

- `mode = 'FAMILY'` appears in Family Friendly and Random / All Modes.
- `mode = 'DEEP_DIVE'` appears in Deep Dive and Random / All Modes.
- `mode IS NULL` appears only in Random / All Modes.

Family Friendly example:

```sql
INSERT INTO "Question" ("id", "optionA", "optionB", "mode", "isActive", "createdAt", "updatedAt")
VALUES (
  'example-family-id',
  'Have unlimited pizza for life',
  'Have unlimited ice cream for life',
  'FAMILY',
  true,
  NOW(),
  NOW()
);
```

Trying to insert the same question again fails. Trying to insert it with swapped options also fails:

```sql
INSERT INTO "Question" ("id", "optionA", "optionB", "mode", "isActive", "createdAt", "updatedAt")
VALUES (
  'example-family-id-swapped',
  'Have unlimited ice cream for life',
  'Have unlimited pizza for life',
  'FAMILY',
  true,
  NOW(),
  NOW()
);
```

A very similar question can also fail with an error like:

```text
Question is too similar to existing question id ... (similarity score ...).
```

Deep Dive example:

```sql
INSERT INTO "Question" ("id", "optionA", "optionB", "mode", "isActive", "createdAt", "updatedAt")
VALUES (
  'example-deep-id',
  'Know the full truth about your past',
  'Know one important truth about your future',
  'DEEP_DIVE',
  true,
  NOW(),
  NOW()
);
```

Random-only / uncategorized example:

```sql
INSERT INTO "Question" ("id", "optionA", "optionB", "mode", "isActive", "createdAt", "updatedAt")
VALUES (
  'example-random-id',
  'Always know when someone is lying',
  'Never be able to lie yourself',
  NULL,
  true,
  NOW(),
  NOW()
);
```

Use any unique text ID when inserting manually. Prisma-created rows use CUIDs automatically. If you omit `mode` during a direct insert, PostgreSQL stores `NULL`, and the question is available only in Random / All Modes.

Prisma Studio is also a convenient manual option:

```bash
npx prisma studio
```

Create a `Question` row and set `mode` to `FAMILY`, `DEEP_DIVE`, or leave it empty for Random / All Modes only.

To hide a question without deleting it:

```sql
UPDATE "Question"
SET "isActive" = false
WHERE "id" = 'QUESTION_ID';
```

## Import Questions from JSON

The repo includes a SQL-based import script for loading question rows from a JSON file. Configure `DATABASE_URL` and run migrations before importing:

```bash
cd /home/gbarmpas/Downloads/Personal/would_you_rather_app
cp .env.example .env
```

Edit `.env` so `DATABASE_URL` points at your PostgreSQL database, then run:

```bash
npm run prisma:migrate
```

Import the included example file:

```bash
npm run questions:import -- ./data/questions.example.json
```

Or import your own file:

```bash
npm run questions:import -- /path/to/your/questions.json
```

The script reads the file path from the command line, validates every item, then inserts rows directly into the `Question` table using parameterized SQL inside one transaction. If validation or insertion fails, the import stops and the transaction is rolled back.

Expected JSON shape:

```json
{
  "questions": [
    {
      "optionA": "Have unlimited pizza for life",
      "optionB": "Have unlimited ice cream for life",
      "mode": "FAMILY"
    },
    {
      "optionA": "Know the full truth about your past",
      "optionB": "Know one important truth about your future",
      "mode": "DEEP_DIVE"
    },
    {
      "optionA": "Always know when someone is lying",
      "optionB": "Never be able to lie yourself",
      "mode": null
    },
    {
      "optionA": "Live in a treehouse",
      "optionB": "Live on a houseboat"
    }
  ]
}
```

Optional fields per question:

```json
{
  "id": "optional-custom-id",
  "optionA": "Question option A",
  "optionB": "Question option B",
  "mode": null,
  "votesA": 0,
  "votesB": 0,
  "isActive": true
}
```

Import rules:

- `mode` may be `FAMILY`, `DEEP_DIVE`, `null`, or omitted.
- Missing or null `mode` imports as SQL `NULL` and appears only in Random / All Modes.
- `optionA` and `optionB` must be non-empty strings and are trimmed.
- `votesA` and `votesB` default to `0` and must be non-negative integers if provided.
- `isActive` defaults to `true` and must be boolean if provided.
- `id` is generated with `crypto.randomUUID()` if omitted.

Imported questions appear in the app immediately because questions are fetched from PostgreSQL at runtime.

## API

### `GET /api/questions/random?mode=FAMILY`

### `GET /api/questions/random?mode=DEEP_DIVE`

### `GET /api/questions/random?mode=RANDOM`

Returns one random active question for the requested mode:

```json
{
  "question": {
    "id": "abc123",
    "optionA": "Travel to the past",
    "optionB": "Travel to the future",
    "votesA": 4,
    "votesB": 9,
    "mode": "DEEP_DIVE"
  }
}
```

For uncategorized questions, `mode` is `null`.

If there are no active questions:

```json
{
  "question": null
}
```

Invalid modes return HTTP 400 with a useful error. `mode=FAMILY` only returns `FAMILY` rows, `mode=DEEP_DIVE` only returns `DEEP_DIVE` rows, and `mode=RANDOM` returns any active row including `mode IS NULL`. The frontend may pass `&exclude=id1,id2` to reduce immediate repeats in the same browser for the selected play mode.

### `POST /api/vote`

Request:

```json
{
  "questionId": "abc123",
  "choice": "A"
}
```

Response:

```json
{
  "question": {
    "id": "abc123",
    "optionA": "Travel to the past",
    "optionB": "Travel to the future",
    "votesA": 5,
    "votesB": 9,
    "mode": "DEEP_DIVE"
  },
  "selectedChoice": "A"
}
```

The route validates input, rejects missing or inactive questions, and increments vote counts inside a Prisma transaction.

## Deploy to Vercel with Neon

1. Create a Neon PostgreSQL database.
2. Copy the Neon pooled or direct connection string.
3. Add `DATABASE_URL` to the Vercel project environment variables.
4. Deploy this project to Vercel.
5. Run migrations against production, for example from your machine:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require" npm run prisma:deploy
```

6. Seed initial questions if desired:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require" npm run prisma:seed
```

7. Open the deployed app and verify that questions load and votes persist.

Vercel assumptions:

- `DATABASE_URL` is configured for every environment that should run the app.
- Migrations are run before relying on the deployed API.
- No filesystem persistence, background jobs, WebSockets, or long-running processes are required.
- `postinstall` runs `prisma generate`, and `npm run build` also runs Prisma Client generation before `next build`.
