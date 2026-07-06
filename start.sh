#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL is set"
elif [ -n "$DATABASE_PRIVATE_URL" ]; then
  export DATABASE_URL="$DATABASE_PRIVATE_URL"
  echo "Using DATABASE_PRIVATE_URL as DATABASE_URL"
elif [ -n "$PGHOST" ]; then
  export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT:-5432}/${PGDATABASE:-railway}"
  echo "Built DATABASE_URL from PG* variables"
else
  echo "WARNING: no DATABASE_URL, DATABASE_PRIVATE_URL, or PGHOST found"
  echo "DB-related env keys:"
  env | cut -d= -f1 | grep -E 'DATABASE|POSTGRES|^PG' || echo "none"
fi

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
