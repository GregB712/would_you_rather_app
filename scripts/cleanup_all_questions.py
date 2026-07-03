#!/usr/bin/env python3
"""
Delete every question from the Would You Rather database.

This script connects directly to PostgreSQL with psycopg. It reads DATABASE_URL
from the environment or from .env.
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path


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
            '  python3 -m pip install -r scripts/requirements.txt'
        ) from error

    return psycopg.connect(database_url)


def count_questions(database_url: str) -> int:
    with connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute('SELECT count(*) FROM "Question";')
            row = cursor.fetchone()

    return int(row[0]) if row else 0


def delete_all_questions(database_url: str) -> int:
    with connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute('DELETE FROM "Question";')
            deleted_count = cursor.rowcount

    return deleted_count


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Delete every row from the Question table."
    )
    parser.add_argument(
        "--database-url",
        default=None,
        help="PostgreSQL connection string. Defaults to DATABASE_URL env or .env.",
    )
    parser.add_argument(
        "--yes",
        action="store_true",
        help="Skip the interactive confirmation.",
    )
    args = parser.parse_args()

    database_url = args.database_url or load_env_database_url()
    if not database_url:
        print("DATABASE_URL was not found in the environment or .env.", file=sys.stderr)
        return 1

    question_count = count_questions(database_url)
    if question_count == 0:
        print("Question table is already empty.")
        return 0

    print(f"This will permanently delete {question_count} question row(s).")

    if not args.yes:
        answer = input('Type "DELETE ALL QUESTIONS" to continue: ')
        if answer != "DELETE ALL QUESTIONS":
            print("Aborted. No rows were deleted.")
            return 1

    deleted_count = delete_all_questions(database_url)
    print(f"Deleted {deleted_count} question row(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
