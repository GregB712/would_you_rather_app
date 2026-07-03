#!/usr/bin/env python3
"""
Find and optionally clean exact duplicate Would You Rather questions.

This script connects directly to PostgreSQL with psycopg. It reads DATABASE_URL
from the environment or from .env.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path


DUPLICATE_QUERY = r"""
WITH normalized AS (
  SELECT
    "id",
    "optionA",
    "optionB",
    "createdAt",
    least(
      lower(trim(regexp_replace("optionA", '\s+', ' ', 'g'))),
      lower(trim(regexp_replace("optionB", '\s+', ' ', 'g')))
    ) AS first_option,
    greatest(
      lower(trim(regexp_replace("optionA", '\s+', ' ', 'g'))),
      lower(trim(regexp_replace("optionB", '\s+', ' ', 'g')))
    ) AS second_option
  FROM "Question"
),
groups AS (
  SELECT
    first_option,
    second_option,
    json_agg(
      json_build_object(
        'id', "id",
        'optionA', "optionA",
        'optionB', "optionB",
        'createdAt', "createdAt"
      )
      ORDER BY "createdAt", "id"
    ) AS questions,
    count(*) AS duplicate_count
  FROM normalized
  GROUP BY first_option, second_option
  HAVING count(*) > 1
)
SELECT COALESCE(json_agg(groups), '[]'::json)
FROM groups;
"""


def load_env_database_url() -> str | None:
    if os.environ.get("DATABASE_URL"):
        return os.environ["DATABASE_URL"]

    env_path = Path(".env")
    if not env_path.exists():
        return None

    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        if key.strip() == "DATABASE_URL":
            return value.strip().strip('"').strip("'")

    return None


def connect(database_url: str):
    try:
        import psycopg
    except ImportError as error:
        raise RuntimeError(
            'The Python package "psycopg" is required. Install it with:\n'
            '  python3 -m pip install "psycopg[binary]"'
        ) from error

    return psycopg.connect(database_url)


def find_duplicate_groups(database_url: str) -> list[dict]:
    with connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(DUPLICATE_QUERY)
            row = cursor.fetchone()

    payload = row[0] if row else []
    if isinstance(payload, str):
        return json.loads(payload)

    return payload or []


def print_duplicate_groups(groups: list[dict]) -> None:
    if not groups:
        print("No exact duplicate question pairs found.")
        return

    print(f"Found {len(groups)} exact duplicate group(s):")
    for group_index, group in enumerate(groups, start=1):
        print(f"\nGroup {group_index}:")
        print(f"  normalized A: {group['first_option']}")
        print(f"  normalized B: {group['second_option']}")
        for row_index, question in enumerate(group["questions"], start=1):
            keep_marker = "KEEP" if row_index == 1 else "DELETE"
            print(f"  [{keep_marker}] {question['id']}")
            print(f"    A: {question['optionA']}")
            print(f"    B: {question['optionB']}")


def ids_to_delete(groups: list[dict]) -> list[str]:
    delete_ids: list[str] = []
    for group in groups:
        questions = group["questions"]
        delete_ids.extend(question["id"] for question in questions[1:])
    return delete_ids


def delete_questions(database_url: str, question_ids: list[str]) -> None:
    if not question_ids:
        return

    with connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                'DELETE FROM "Question" WHERE "id" = ANY(%s);',
                (question_ids,),
            )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Find and optionally delete exact duplicate question pairs."
    )
    parser.add_argument(
        "--database-url",
        default=None,
        help="PostgreSQL connection string. Defaults to DATABASE_URL env or .env.",
    )
    parser.add_argument(
        "--delete-extras",
        action="store_true",
        help="Delete every duplicate row except the oldest row in each group.",
    )
    parser.add_argument(
        "--yes",
        action="store_true",
        help="Skip the interactive confirmation when using --delete-extras.",
    )
    args = parser.parse_args()

    database_url = args.database_url or load_env_database_url()
    if not database_url:
        print("DATABASE_URL was not found in the environment or .env.", file=sys.stderr)
        return 1

    groups = find_duplicate_groups(database_url)
    print_duplicate_groups(groups)

    delete_ids = ids_to_delete(groups)
    if not args.delete_extras or not delete_ids:
        if delete_ids:
            print("\nDry run only. To delete duplicate extras, rerun with:")
            print("  python3 scripts/cleanup_exact_duplicates.py --delete-extras")
        return 0

    print("\nThis will delete these duplicate row ids:")
    for question_id in delete_ids:
        print(f"  {question_id}")

    if not args.yes:
        answer = input("\nType DELETE to continue: ")
        if answer != "DELETE":
            print("Aborted. No rows were deleted.")
            return 1

    delete_questions(database_url, delete_ids)
    print(f"Deleted {len(delete_ids)} duplicate row(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
