#!/bin/bash
set -e

echo "=== Study Abroad CRM Deployment ==="

# Prerequisites check
command -v docker >/dev/null 2>&1 || { echo "Docker required"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose required"; exit 1; }

# Load environment
if [ -f .env.production ]; then
  set -a; source .env.production; set +a
elif [ -f .env ]; then
  set -a; source .env; set +a
fi

# Build
echo "Building application..."
docker-compose build

# Run migrations
echo "Running database migrations..."
docker-compose run --rm app npx prisma migrate deploy

# Seed
echo "Seeding database..."
docker-compose run --rm app npx tsx prisma/seed.ts

# Start
echo "Starting services..."
docker-compose up -d

echo "=== Deployment complete ==="
echo "Application: http://localhost:3000"
echo "Health check: http://localhost:3000/api/health"
