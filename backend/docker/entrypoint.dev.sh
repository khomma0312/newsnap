#!/bin/sh
set -e

echo "Installing dependencies..."
npm install

echo "Waiting for database to be ready..."
until node -e "require('net').createConnection(5432,'${DB_HOST:-db}').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))" 2>/dev/null; do
  sleep 1
done

echo "Running database migrations..."
npm run db:migrate

echo "Starting dev server..."
exec npm run dev
