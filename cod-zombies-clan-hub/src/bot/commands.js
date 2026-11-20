const { SlashCommandBuilder } = require('discord.js');

const submitCommand = new SlashCommandBuilder()
  .setName('submit-round')
  .setDescription('Submit a high round, wave, or set for clan verification')
  .addStringOption(option =>
    option.setName('franchise')
      .setDescription('Game Universe / Franchise')
      .setRequired(true)
      .addChoices(
        { name: 'Call of Duty [Zombies]', value: 'cod' },
        { name: 'Halo [Firefight]', value: 'halo' },
        { name: 'Gears of War [Horde]', value: 'gears' }
      )
  )
  .addStringOption(option =>
    option.setName('game')
      .setDescription('Specific title (e.g. BO6, Infinite, Gears 5, BO3, Reach)')
      .setRequired(true)
      .addChoices(
        // CoD
        { name: 'CoD: Black Ops 7 (BO7)', value: 'bo7' },
        { name: 'CoD: Black Ops 6 (BO6)', value: 'bo6' },
        { name: 'CoD: Modern Warfare Zombies (MWZ)', value: 'mwz' },
        { name: 'CoD: Vanguard (VG)', value: 'vg' },
        { name: 'CoD: Black Ops Cold War (BOCW)', value: 'bocw' },
        { name: 'CoD: Black Ops 4 (BO4)', value: 'bo4' },
        { name: 'CoD: WWII (WWII)', value: 'ww2' },
        { name: 'CoD: Infinite Warfare (IW)', value: 'iw' },
        { name: 'CoD: Black Ops 3 (BO3)', value: 'bo3' },
        { name: 'CoD: Advanced Warfare (AW)', value: 'aw' },
        { name: 'CoD: Black Ops 2 (BO2)', value: 'bo2' },
        { name: 'CoD: Black Ops 1 (BO1)', value: 'bo1' },
        { name: 'CoD: World at War (WAW)', value: 'waw' },
        // Halo
        { name: 'Halo: Infinite (H-INF)', value: 'halo-inf' },
        { name: 'Halo: Reach MCC (REACH)', value: 'halo-reach' },
        { name: 'Halo: 3 ODST (ODST)', value: 'halo-odst' },
        { name: 'Halo: 5 Warzone (H5)', value: 'halo-5' },
        // Gears
        { name: 'Gears: Gears 5 (G5)', value: 'gears-5' },
        { name: 'Gears: Gears of War 4 (G4)', value: 'gears-4' },
        { name: 'Gears: Gears of War 3 (G3)', value: 'gears-3' },
        { name: 'Gears: Gears of War 2 (G2)', value: 'gears-2' }
      )
  )
  .addStringOption(option =>
    option.setName('map')
      .setDescription('Map name (e.g. Terminus, Kusini Bay, District, Blood Drive)')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addIntegerOption(option =>
    option.setName('score')
      .setDescription('Highest Round (CoD), Set/Wave (Halo), or Wave (Gears) reached')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(9999)
  )
  .addStringOption(option =>
    option.setName('players')
      .setDescription('Team size')
      .setRequired(true)
      .addChoices(
        { name: 'Solo', value: 'Solo' },
        { name: '2-Player Co-op', value: '2-Player' },
        { name: '3-Player Co-op', value: '3-Player' },
        { name: '4-Player Co-op', value: '4-Player' },
        { name: '5-Player Co-op (Gears Horde)', value: '5-Player' }
      )
  )
  .addStringOption(option =>
    option.setName('mode')
      .setDescription('Ruleset / Mode (e.g. Standard, Rogue Run, Master 50-Waves, Heroic, Classic)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('gamertag')
      .setDescription('Your in-game Gamertag / Clan Tag / Name')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('proof')
      .setDescription('Proof URL (Twitch VOD/Clip, YouTube, or Screenshot link)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('teammates')
      .setDescription('Teammate names (if Co-op)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('twitch')
      .setDescription('Your Twitch channel name or link (e.g. twitch.tv/yourname)')
      .setRequired(false)
  );

const leaderboardCommand = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View clan leaderboards across Call of Duty, Halo, or Gears')
  .addStringOption(option =>
    option.setName('franchise')
      .setDescription('Franchise to view')
      .setRequired(false)
      .addChoices(
        { name: 'Call of Duty [Zombies]', value: 'cod' },
        { name: 'Halo [Firefight]', value: 'halo' },
        { name: 'Gears of War [Horde]', value: 'gears' }
      )
  )
  .addStringOption(option =>
    option.setName('map')
      .setDescription('Filter by map name')
      .setRequired(false)
      .setAutocomplete(true)
  )
  .addStringOption(option =>
    option.setName('players')
      .setDescription('Filter by team size')
      .setRequired(false)
      .addChoices(
        { name: 'Solo', value: 'Solo' },
        { name: '2-Player', value: '2-Player' },
        { name: '3-Player', value: '3-Player' },
        { name: '4-Player', value: '4-Player' },
        { name: '5-Player', value: '5-Player' }
      )
  );

const pendingCommand = new SlashCommandBuilder()
  .setName('pending')
  .setDescription('[Admin/Mod] View pending submissions waiting for review');

const statsCommand = new SlashCommandBuilder()
  .setName('clan-stats')
  .setDescription('View overall clan PvE survival statistics across all games');

const addMapCommand = new SlashCommandBuilder()
  .setName('add-map')
  .setDescription('[Admin] Add a new map to any title')
  .addStringOption(option =>
    option.setName('game')
      .setDescription('Game code (e.g. bo6, halo-inf, gears-5)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('name')
      .setDescription('Name of the new map')
      .setRequired(true)
  );

module.exports = {
  commands: [submitCommand, leaderboardCommand, pendingCommand, statsCommand, addMapCommand]
};
