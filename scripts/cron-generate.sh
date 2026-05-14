#!/bin/bash
# Menshly Wire — Daily Article Generation Cron Script
# 
# This script calls the cron API endpoint to generate a new article.
# Set up as a daily cron job:
#   crontab -e
#   0 6 * * * /home/z/my-project/scripts/cron-generate.sh >> /home/z/my-project/logs/cron.log 2>&1
#
# Or run manually:
#   bash scripts/cron-generate.sh

set -e

PROJECT_DIR="/home/z/my-project"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/cron.log"
CRON_SECRET="menshly-wire-cron-2024"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

echo "=== $(date -u) ===" >> "$LOG_FILE"
echo "Starting daily article generation..." >> "$LOG_FILE"

# Check if the dev server is running, if not start it
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "Starting Next.js dev server..." >> "$LOG_FILE"
  cd "$PROJECT_DIR"
  npm run dev &
  DEV_PID=$!
  
  # Wait for server to be ready (up to 60 seconds)
  echo "Waiting for server to start..." >> "$LOG_FILE"
  for i in $(seq 1 30); do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
      echo "Server ready after ${i}s" >> "$LOG_FILE"
      break
    fi
    sleep 2
  done
fi

# Call the cron API
RESPONSE=$(curl -s -X POST "http://localhost:3000/api/cron?secret=$CRON_SECRET" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  --max-time 300)

echo "API Response: $RESPONSE" >> "$LOG_FILE"

# Check if generation was successful
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ Article generated successfully!" >> "$LOG_FILE"
else
  echo "⚠️ Article generation response: $RESPONSE" >> "$LOG_FILE"
fi

echo "Cron job completed at $(date -u)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
