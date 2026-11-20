@echo off
echo ===================================================
echo Clan Hub 1-Click Updater for Windows
echo ===================================================

echo Pulling latest code from GitHub...
git pull origin main

echo Rebuilding and restarting Docker containers...
docker compose down
docker compose up -d --build

echo Re-registering slash commands...
docker compose exec -T zombies-hub npm run register-commands

echo.
echo Clan Hub successfully updated!
docker compose ps
pause
