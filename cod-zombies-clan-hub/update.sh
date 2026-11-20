#!/bin/bash
# ===================================================
# Clan Hub 1-Command Updater for ZimaOS / Linux
# ===================================================

set -e

echo "⬇️  Pulling latest code changes from GitHub..."
git pull origin main || git pull

echo "🐳 Rebuilding and restarting Docker containers..."
docker compose down
docker compose up -d --build

echo "🔄 Re-registering slash commands (if updated)..."
docker compose exec -T zombies-hub npm run register-commands || true

echo "✅ Clan Hub successfully updated to the latest version!"
docker compose ps
