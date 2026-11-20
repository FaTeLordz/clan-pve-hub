require('dotenv').config();
const { createServer } = require('./server/api');
const { initBot } = require('./bot/client');

const PORT = process.env.PORT || 3000;

// 1. Start Express Web Server & API
const app = createServer();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Clan Zombies Leaderboard Web Server running on http://0.0.0.0:${PORT}`);
});

// 2. Start Discord Bot (if token provided)
initBot();
