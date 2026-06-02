#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

# Seed only on first run (flag file stored in the same volume as the DB)
SEED_FLAG="$(dirname "$DATABASE_URL" | sed 's|file:||')/.seeded"
SEED_FLAG=$(echo "$DATABASE_URL" | sed 's|file:||' | sed 's|/[^/]*$||')/.seeded

if [ ! -f "$SEED_FLAG" ]; then
  echo "Seeding database with initial data..."
  npx ts-node prisma/seed.ts
  touch "$SEED_FLAG"
  echo "Seed complete."
else
  echo "Database already seeded, skipping."
fi

echo "Starting TaskFlow API..."
exec npx ts-node --transpile-only src/index.ts
