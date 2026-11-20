const db = require('./db');

const count = db.db.prepare('SELECT COUNT(*) as count FROM submissions').get().count;

if (count === 0) {
  console.log('Seeding sample runs across Call of Duty, Halo, and Gears of War...');

  // --- CALL OF DUTY [ZOMBIES] ---
  db.createSubmission({
    franchise_id: 'cod',
    game_id: 'bo6',
    map_name: 'Terminus',
    player_count: 'Solo',
    game_mode: 'Standard',
    round: 84,
    player_name: 'Vortex_Slayer',
    twitch_channel: 'vortex_slayer',
    proof_url: 'https://twitch.tv/videos/sample',
    status: 'approved'
  });

  db.createSubmission({
    franchise_id: 'cod',
    game_id: 'bo3',
    map_name: 'Der Eisendrache',
    player_count: 'Solo',
    game_mode: 'Standard',
    round: 105,
    player_name: 'Kronos_COD',
    twitch_channel: 'kronos_cod',
    proof_url: 'https://youtube.com/watch?v=sample',
    status: 'approved'
  });

  db.createSubmission({
    franchise_id: 'cod',
    game_id: 'bo6',
    map_name: 'Liberty Falls',
    player_count: 'Solo',
    game_mode: 'Rogue Run',
    round: 45,
    player_name: 'PhantomRogue',
    twitch_channel: 'phantomrogue',
    proof_url: 'https://twitch.tv/videos/sample',
    status: 'approved'
  });

  db.createSubmission({
    franchise_id: 'cod',
    game_id: 'iw',
    map_name: 'Zombies in Spaceland',
    player_count: '2-Player',
    game_mode: 'Standard',
    round: 72,
    player_name: 'RetroSpaceman',
    teammates: 'DiscoZombie',
    twitch_channel: 'retrospaceman',
    proof_url: 'https://twitch.tv/videos/sample',
    status: 'approved'
  });

  // --- HALO [FIREFIGHT] ---
  db.createSubmission({
    franchise_id: 'halo',
    game_id: 'halo-inf',
    map_name: 'Kusini Bay',
    player_count: '4-Player',
    game_mode: 'Heroic Firefight',
    round: 18, // 18 Sets survived
    player_name: 'Chief_Sierra117',
    teammates: 'Cortana_AI, SpartanLocke, Arbiter_Thel',
    twitch_channel: 'chief_sierra117',
    proof_url: 'https://twitch.tv/videos/sample',
    status: 'approved'
  });

  db.createSubmission({
    franchise_id: 'halo',
    game_id: 'halo-reach',
    map_name: 'Courtyard',
    player_count: 'Solo',
    game_mode: 'Legendary Classic',
    round: 12, // 12 Sets
    player_name: 'NobleSix_Ghost',
    proof_url: 'https://youtube.com/watch?v=sample',
    status: 'approved'
  });

  // --- GEARS OF WAR [HORDE] ---
  db.createSubmission({
    franchise_id: 'gears',
    game_id: 'gears-5',
    map_name: 'District',
    player_count: '5-Player',
    game_mode: 'Master 50-Waves',
    round: 50, // Wave 50 Cleared
    player_name: 'Marcus_FenixCOGG',
    teammates: 'Dom_Santiago, Baird_Eng, ColeTrain_Baby, Kait_Diaz',
    twitch_channel: 'marcus_fenix',
    proof_url: 'https://twitch.tv/videos/sample',
    status: 'approved'
  });

  db.createSubmission({
    franchise_id: 'gears',
    game_id: 'gears-3',
    map_name: 'Blood Drive',
    player_count: '4-Player',
    game_mode: 'Insane Horde',
    round: 50,
    player_name: 'LocustHunter99',
    teammates: 'Carmine_Survivor, Anya_Stroud',
    proof_url: 'https://youtube.com/watch?v=sample',
    status: 'approved'
  });

  console.log('✅ Successfully seeded sample records for Call of Duty, Halo, and Gears of War!');
} else {
  console.log('Database already has submissions. Skipping sample seed.');
}
