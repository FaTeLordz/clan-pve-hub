require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { commands } = require('./commands');

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  console.error('❌ Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID in .env file.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`⏳ Registering ${commands.length} slash commands...`);

    const commandPayload = commands.map(c => c.toJSON());

    if (guildId) {
      // Guild-specific (updates instantly, ideal for private clan server)
      console.log(`📌 Registering to specific Discord Guild ID: ${guildId}`);
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commandPayload }
      );
      console.log('✅ Successfully registered guild slash commands!');
    } else {
      // Global commands (takes ~1 hour to propagate across Discord, but works in any server)
      console.log('🌐 Registering global slash commands (may take up to 1 hr to cache)...');
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commandPayload }
      );
      console.log('✅ Successfully registered global slash commands!');
    }
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
})();
