# 🛡️ Clan Survival & Horde Hub (CoD • Halo • Gears)

A complete, self-hosted web leaderboard and Discord bot tailored for gaming clans. Features an interactive landing page with clickable game tiles for:
* **Call of Duty [Zombies]** (All 13 titles from WAW to BO7, Rogue Run, and Outbreak)
* **HALO [Firefight]** (Halo Infinite, Reach MCC, ODST, and Halo 5 Warzone)
* **Gears of War [Horde]** (Gears 5, 4, 3, and 2 with 50-wave fortifications and up to 5-player co-op)

---

## 📑 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Step 1: Push this Project to Your GitHub](#-step-1-push-this-project-to-your-github)
3. [Step 2: Discord Bot Setup](#-step-2-discord-bot-setup)
4. [Step 3: Initial Deployment on ZimaOS from GitHub](#-step-3-initial-deployment-on-zimaos-from-github)
5. [Step 4: How to Update from GitHub (Zero Downtime / 1-Command)](#-step-4-how-to-update-from-github)
6. [Step 5: Connect to Your IONOS Domain (Free & Secure)](#-step-5-connect-to-your-ionos-domain)
7. [Discord Bot Commands Reference](#-discord-bot-commands-reference)
8. [Data Persistence & Backups](#-data-persistence--backups)

---

## 🏛️ Architecture Overview

The entire system is containerized via **Docker Compose**:
* **Web Frontend:** Responsive dark-mode HTML5 + Tailwind CSS with Twitch/YouTube proof modal players.
* **REST API:** Express.js endpoints serving dynamic game, map, and leaderboard queries.
* **Discord Bot:** Discord.js v14 client listening for slash commands and admin interactive review buttons.
* **SQLite Database:** Local `./data/leaderboard.db` file mapped via Docker volumes (preserves all records across updates and container restarts).

---

## 🐙 Step 1: Push this Project to Your GitHub

Putting this on GitHub gives you full version control and lets you deploy/update your ZimaOS directly from your repository.

### 1. Create a Repository on GitHub:
1. Log in to [GitHub](https://github.com).
2. Click **New Repository** (`+` icon in the top right).
3. Name it (e.g. `clan-pve-hub` or `zombies-leaderboard`).
4. Choose **Private** (recommended) or Public.
5. **Do not** initialize with a README, .gitignore, or license (we already created them for you).
6. Click **Create repository** and copy your repository URL (e.g. `https://github.com/yourusername/clan-pve-hub.git`).

### 2. Initialize Git and Push Your Files (Run in this folder):
Open your terminal inside `cod-zombies-clan-hub`:
```bash
git init
git add .
git commit -m "Initial commit of Clan Survival Hub with CoD, Halo, and Gears"
git branch -M main
git remote add origin https://github.com/yourusername/clan-pve-hub.git
git push -u origin main
```

> [!IMPORTANT]
> **Your Secrets & Database are Protected!**  
> We have pre-configured [`.gitignore`](file:///.gitignore) to ensure that your `.env` (Discord bot tokens) and `./data/` (leaderboard database) are **never** committed or leaked to GitHub.

---

## 🤖 Step 2: Discord Bot Setup

### 1. Create the Bot in Discord Developer Portal:
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application**, name it (e.g. `Clan Record Book`), and accept terms.
3. Click on the **Bot** tab on the left menu:
   - Click **Reset Token** and copy your **Bot Token** (save this for your `.env` file).
   - Under **Privileged Gateway Intents**, enable:
     - ✅ **Server Members Intent**
     - ✅ **Message Content Intent**
   - Click **Save Changes**.
4. Click on the **General Information** tab on the left menu:
   - Copy the **Application ID** (Client ID) (save this for your `.env` file).
5. Click on **OAuth2 > URL Generator**:
   - Under **Scopes**, select: `bot` and `applications.commands`.
   - Under **Bot Permissions**, select:
     - `Send Messages`
     - `Embed Links`
     - `Attach Files`
     - `Read Message History`
     - `Use Slash Commands`
   - Copy the generated URL at the bottom and open it in your browser to invite the bot to your clan Discord server.

### 2. Prepare Your `.env` File:
In the project directory, make a copy of `.env.example` as `.env`:
```bash
cp .env.example .env
```
Fill in the values:
```env
PORT=3000
DISCORD_BOT_TOKEN=paste_your_bot_token_here
DISCORD_CLIENT_ID=paste_your_application_id_here

# (Optional) Your Discord Server ID (synchronizes slash commands instantly)
DISCORD_GUILD_ID=

# Discord Channel ID where admin approval embeds & buttons appear (e.g. #mod-review)
ADMIN_CHANNEL_ID=your_mod_review_channel_id

# (Optional) Channel ID where approved high scores get shouted out to the clan
PUBLIC_ANNOUNCE_CHANNEL_ID=your_announcements_channel_id
```

---

## 🚀 Step 3: Initial Deployment on ZimaOS from GitHub

Because ZimaOS is built on Debian Linux with native Docker, you can clone your GitHub repo straight onto ZimaOS storage.

### Method A: Terminal / SSH on ZimaOS (Recommended)
1. Open an SSH session to your ZimaOS:
   ```bash
   ssh root@<YOUR-ZIMAOS-IP>
   ```
2. Navigate to your app storage directory:
   ```bash
   cd /DATA/AppData
   ```
3. Clone your GitHub repository:
   ```bash
   git clone https://github.com/yourusername/clan-pve-hub.git
   cd clan-pve-hub
   ```
4. Create your `.env` file:
   ```bash
   cp .env.example .env
   nano .env
   # Paste your Discord tokens, then press Ctrl+O (Enter) to save, and Ctrl+X to exit.
   ```
5. Seed initial sample records (optional, for instant preview):
   ```bash
   npm run seed-samples || docker compose run --rm zombies-hub npm run seed-samples
   ```
6. Build and launch the container:
   ```bash
   docker compose up -d --build
   ```
7. Register Discord slash commands:
   ```bash
   docker compose exec zombies-hub npm run register-commands
   ```

Your hub is now running live at: `http://<YOUR-ZIMAOS-IP>:3000`

---

## 🔄 Step 4: How to Update from GitHub

Whenever you edit files on your computer (e.g., custom colors, new maps, new features) and push to GitHub:
```bash
git add .
git commit -m "Added custom clan banner and styles"
git push origin main
```

### The 1-Command Update on ZimaOS:
We built an automated [`update.sh`](file:///update.sh) script for you. Inside your ZimaOS terminal, simply run:
```bash
cd /DATA/AppData/clan-pve-hub
bash update.sh
```

**What `update.sh` does automatically:**
1. Runs `git pull origin main` to pull your latest code.
2. Gracefully rebuilds and restarts the Docker container (`docker compose up -d --build`).
3. Re-registers any updated slash commands with Discord.
4. **Preserves your database:** Your `./data/leaderboard.db` is outside the git tree and volume-mounted, so **zero records or scores are ever lost during updates!**

---

## 🌐 Step 5: Connect to Your IONOS Domain

To let your clan and website visitors access the leaderboard at `games.yourclandomain.com` **without opening router ports or exposing your home IP**, use a **Free Cloudflare Tunnel**:

### 1. Set Up the Tunnel (Takes ~3 minutes):
1. Sign in to your [Cloudflare Dashboard](https://dash.cloudflare.com) and go to **Zero Trust > Networks > Tunnels**.
2. Click **Create a Tunnel**, name it (e.g. `zima-clan-hub`), and click **Save Tunnel**.
3. Choose **Docker** as the environment.
4. Copy the one-line `docker run ...` command shown on screen.
5. Paste and run that command in your ZimaOS SSH terminal. Cloudflare will immediately report "Status: Connected".

### 2. Route Your Domain:
1. In the Tunnel setup on Cloudflare, click the **Public Hostnames** tab.
2. Click **Add a Public Hostname**:
   * **Subdomain:** `games` (or `zombies` / `leaderboard`)
   * **Domain:** Select your domain (managed through Cloudflare or IONOS)
   * **Service Type:** `HTTP`
   * **URL:** `localhost:3000` (or `<ZIMAOS-IP>:3000`)
3. Click **Save Hostname**.

### 3. Connect IONOS DNS:
* In your **IONOS Domain Management**, go to **DNS**:
* Add a `CNAME` record:
  * **Host Name:** `games`
  * **Points to:** The `<tunnel-id>.cfargotunnel.com` target provided by Cloudflare.
  * **TTL:** Automatic / 1 Hour.
* **Done!** Your hub is now accessible over secure SSL at `https://games.yourclandomain.com`.

### 4. Embed on Your Main IONOS Site:
If you want to display this directly inside your existing IONOS clan webpage, paste this iframe:
```html
<iframe src="https://games.yourclandomain.com" width="100%" height="950px" frameborder="0" allowfullscreen></iframe>
```

---

## 🎮 Discord Bot Commands Reference

| Command | Permission | Description |
| :--- | :---: | :--- |
| `/submit-round` | Everyone | Submit a high round/wave with proof link, team size, and Twitch handle. |
| `/leaderboard` | Everyone | View top 10 verified records for CoD Zombies, Halo Firefight, or Gears Horde. |
| `/clan-stats` | Everyone | View clan survival totals and all-time record holders. |
| `/pending` | Admin / Mod | View unreviewed submissions queue. |
| `/add-map` | Admin / Mod | Instantly add a new map to any game title without editing code. |

---

## 💾 Data Persistence & Backups

All clan data is stored inside a single SQLite file:
```
/DATA/AppData/clan-pve-hub/data/leaderboard.db
```
### How to Backup:
To create a backup of all clan high scores:
```bash
cp data/leaderboard.db data/leaderboard-backup-$(date +%F).db
```
Because SQLite is a single file, you can copy it to Google Drive, a USB stick, or another machine in 1 second.
