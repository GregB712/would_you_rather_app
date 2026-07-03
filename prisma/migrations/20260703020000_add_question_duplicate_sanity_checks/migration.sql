CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION normalize_question_text(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
AS $$
  SELECT lower(trim(regexp_replace(input, '\s+', ' ', 'g')));
$$;

CREATE OR REPLACE FUNCTION question_pair_similarity(
  new_option_a text,
  new_option_b text,
  existing_option_a text,
  existing_option_b text
)
RETURNS real
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
AS $$
  SELECT GREATEST(
    (
      similarity(normalize_question_text(new_option_a), normalize_question_text(existing_option_a)) +
      similarity(normalize_question_text(new_option_b), normalize_question_text(existing_option_b))
    ) / 2.0,
    (
      similarity(normalize_question_text(new_option_a), normalize_question_text(existing_option_b)) +
      similarity(normalize_question_text(new_option_b), normalize_question_text(existing_option_a))
    ) / 2.0
  );
$$;

DO $$
DECLARE
  duplicate_ids text;
BEGIN
  SELECT ids
  INTO duplicate_ids
  FROM (
    SELECT array_to_string(array_agg("id" ORDER BY "createdAt", "id"), ', ') AS ids
    FROM "Question"
    GROUP BY
      least(normalize_question_text("optionA"), normalize_question_text("optionB")),
      greatest(normalize_question_text("optionA"), normalize_question_text("optionB"))
    HAVING count(*) > 1
    LIMIT 1
  ) duplicate_group;

  IF duplicate_ids IS NOT NULL THEN
    RAISE EXCEPTION
      'Cannot add question duplicate prevention: existing exact duplicate question pair found for ids: %',
      duplicate_ids
      USING ERRCODE = 'unique_violation';
  END IF;
END $$;

DO $$
DECLARE
  conflict text;
  threshold real := 0.92;
BEGIN
  SELECT format(
    'ids %s and %s have similarity score %s',
    q1."id",
    q2."id",
    round(question_pair_similarity(q1."optionA", q1."optionB", q2."optionA", q2."optionB")::numeric, 4)
  )
  INTO conflict
  FROM "Question" q1
  JOIN "Question" q2 ON q1."id" < q2."id"
  WHERE question_pair_similarity(q1."optionA", q1."optionB", q2."optionA", q2."optionB") >= threshold
  LIMIT 1;

  IF conflict IS NOT NULL THEN
    RAISE EXCEPTION
      'Cannot add question near-duplicate prevention: existing questions are too similar: %',
      conflict
      USING ERRCODE = 'unique_violation';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "Question_normalized_unordered_pair_unique_idx"
ON "Question" (
  least(normalize_question_text("optionA"), normalize_question_text("optionB")),
  greatest(normalize_question_text("optionA"), normalize_question_text("optionB"))
);

CREATE INDEX IF NOT EXISTS "Question_optionA_trgm_idx"
ON "Question"
USING gin (normalize_question_text("optionA") gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Question_optionB_trgm_idx"
ON "Question"
USING gin (normalize_question_text("optionB") gin_trgm_ops);

CREATE OR REPLACE FUNCTION prevent_similar_question()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  threshold real := 0.92;
  conflict_id text;
  conflict_score real;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('would_you_rather_question_similarity_check')::bigint);

  SELECT existing."id",
         question_pair_similarity(NEW."optionA", NEW."optionB", existing."optionA", existing."optionB")
  INTO conflict_id, conflict_score
  FROM "Question" existing
  WHERE existing."id" <> NEW."id"
    AND question_pair_similarity(NEW."optionA", NEW."optionB", existing."optionA", existing."optionB") >= threshold
  ORDER BY question_pair_similarity(NEW."optionA", NEW."optionB", existing."optionA", existing."optionB") DESC
  LIMIT 1;

  IF conflict_id IS NOT NULL THEN
    RAISE EXCEPTION
      'Question is too similar to existing question id % (similarity score %).',
      conflict_id,
      round(conflict_score::numeric, 4)
      USING ERRCODE = 'unique_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "Question_prevent_similar_insert_update" ON "Question";

CREATE TRIGGER "Question_prevent_similar_insert_update"
BEFORE INSERT OR UPDATE OF "optionA", "optionB"
ON "Question"
FOR EACH ROW
EXECUTE FUNCTION prevent_similar_question();
