const { Client, GatewayIntentBits } = require('discord.js');
const { handleAutocomplete, handleChatInputCommand, handleButton } = require('./handlers');

function initBot() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.warn('⚠️ DISCORD_BOT_TOKEN not provided in .env. Bot will not start (Web server only).');
    return null;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages
    ]
  });

  client.once('ready', () => {
    console.log(`🤖 Discord Bot logged in as ${client.user.tag}!`);
  });

  client.on('interactionCreate', async (interaction) => {
    try {
      if (interaction.isAutocomplete()) {
        await handleAutocomplete(interaction);
      } else if (interaction.isChatInputCommand()) {
        await handleChatInputCommand(interaction, client);
      } else if (interaction.isButton()) {
        await handleButton(interaction, client);
      }
    } catch (error) {
      console.error('Error handling interaction:', error);
      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ An error occurred processing your request.', ephemeral: true });
      }
    }
  });

  client.login(token).catch(err => {
    console.error('❌ Failed to log into Discord:', err.message);
  });

  return client;
}

module.exports = { initBot };
