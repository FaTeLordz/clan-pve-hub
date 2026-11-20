const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dbPath = path.join(DATA_DIR, 'leaderboard.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS franchises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sub_label TEXT NOT NULL,
    description TEXT,
    metric_label TEXT DEFAULT 'Round',
    theme_color TEXT DEFAULT 'red',
    icon TEXT DEFAULT 'skull',
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    franchise_id TEXT DEFAULT 'cod',
    name TEXT NOT NULL,
    short_code TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (franchise_id) REFERENCES franchises (id)
  );

  CREATE TABLE IF NOT EXISTS maps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (game_id) REFERENCES games (id)
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    franchise_id TEXT DEFAULT 'cod',
    game_id TEXT NOT NULL,
    map_name TEXT NOT NULL,
    player_count TEXT NOT NULL, -- 'Solo', '2-Player', '3-Player', '4-Player', '5-Player'
    game_mode TEXT DEFAULT 'Standard',
    round INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    discord_user_id TEXT,
    teammates TEXT,
    proof_url TEXT,
    twitch_channel TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewed_by TEXT,
    reviewed_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions (status);
  CREATE INDEX IF NOT EXISTS idx_submissions_lookup ON submissions (franchise_id, game_id, map_name, player_count, status, round DESC);
`);

// Pre-seed Franchises (Call of Duty, Halo, Gears of War)
const defaultFranchises = [
  {
    id: 'cod',
    name: 'Call of Duty',
    sub_label: 'Zombies',
    description: 'Round-based horde survival, Rogue Run, and Outbreak across all 13 CoD titles.',
    metric_label: 'Round',
    theme_color: 'red',
    icon: 'skull',
    sort_order: 1
  },
  {
    id: 'halo',
    name: 'Halo',
    sub_label: 'Firefight',
    description: 'Spartan & ODST set defense across Halo Infinite, Reach, and ODST.',
    metric_label: 'Set / Wave',
    theme_color: 'cyan',
    icon: 'shield',
    sort_order: 2
  },
  {
    id: 'gears',
    name: 'Gears of War',
    sub_label: 'Horde',
    description: '50-wave fortified defensive warfare across Gears 5, Gears 4, Gears 3 & 2.',
    metric_label: 'Wave',
    theme_color: 'amber',
    icon: 'flame',
    sort_order: 3
  }
];

const syncFranchises = () => {
  const insertFranchise = db.prepare(`
    INSERT OR REPLACE INTO franchises (id, name, sub_label, description, metric_label, theme_color, icon, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const f of defaultFranchises) {
    insertFranchise.run(f.id, f.name, f.sub_label, f.description, f.metric_label, f.theme_color, f.icon, f.sort_order);
  }
};
syncFranchises();

// Pre-seed all Games & Maps across Call of Duty, Halo, and Gears of War
const defaultGamesAndMaps = [
  // --- CALL OF DUTY [ZOMBIES] ---
  {
    id: 'bo7',
    franchise_id: 'cod',
    name: 'Black Ops 7',
    short_code: 'BO7',
    sort_order: 1,
    maps: ['Launch Map 1', 'Launch Map 2', 'Rogue Run Arena']
  },
  {
    id: 'bo6',
    franchise_id: 'cod',
    name: 'Black Ops 6',
    short_code: 'BO6',
    sort_order: 2,
    maps: ['Terminus', 'Liberty Falls', 'Citadelle des Morts', 'Tomb of the Damned']
  },
  {
    id: 'mwz',
    franchise_id: 'cod',
    name: 'Modern Warfare Zombies',
    short_code: 'MWZ',
    sort_order: 3,
    maps: ['Urzikstan (Elder Rift)', 'Unstable Rift', 'Dark Aether Rift 1', 'Dark Aether Rift 2', 'Dark Aether Rift 3']
  },
  {
    id: 'vg',
    franchise_id: 'cod',
    name: 'Vanguard',
    short_code: 'VG',
    sort_order: 4,
    maps: ['Shi No Numa (Reborn)', 'Der Anfang', 'Terra Maledicta', 'The Archon']
  },
  {
    id: 'bocw',
    franchise_id: 'cod',
    name: 'Black Ops Cold War',
    short_code: 'BOCW',
    sort_order: 5,
    maps: ['Die Maschine', 'Firebase Z', 'Mauer der Toten', 'Forsaken', 'Outbreak (High World)', 'Onslaught']
  },
  {
    id: 'bo4',
    franchise_id: 'cod',
    name: 'Black Ops 4',
    short_code: 'BO4',
    sort_order: 6,
    maps: ['IX', 'Voyage of Despair', 'Blood of the Dead', 'Classified', 'Dead of the Night', 'Ancient Evil', 'Alpha Omega', 'Tag der Toten']
  },
  {
    id: 'ww2',
    franchise_id: 'cod',
    name: 'Call of Duty: WWII',
    short_code: 'WWII',
    sort_order: 7,
    maps: ['The Final Reich', 'Grösten Haus', 'The Darkest Shore', 'The Shadowed Throne', 'The Tortured Path', 'The Frozen Dawn']
  },
  {
    id: 'iw',
    franchise_id: 'cod',
    name: 'Infinite Warfare',
    short_code: 'IW',
    sort_order: 8,
    maps: ['Zombies in Spaceland', 'Rave in the Redwoods', 'Shaolin Shuffle', 'Attack of the Radioactive Thing', 'The Beast from Beyond']
  },
  {
    id: 'bo3',
    franchise_id: 'cod',
    name: 'Black Ops 3',
    short_code: 'BO3',
    sort_order: 9,
    maps: ['Shadows of Evil', 'The Giant', 'Der Eisendrache', 'Zetsubou No Shima', 'Gorod Krovi', 'Revelations', 'Kino der Toten (ZC)', 'Origins (ZC)', 'Nacht der Untoten (ZC)', 'Ascension (ZC)', 'Shangri-La (ZC)', 'Moon (ZC)', 'Shi No Numa (ZC)', 'Verrückt (ZC)', 'Dead Ops Arcade 2']
  },
  {
    id: 'aw',
    franchise_id: 'cod',
    name: 'Advanced Warfare (Exo)',
    short_code: 'AW',
    sort_order: 10,
    maps: ['Outbreak', 'Infection', 'Carrier', 'Descent']
  },
  {
    id: 'bo2',
    franchise_id: 'cod',
    name: 'Black Ops 2',
    short_code: 'BO2',
    sort_order: 11,
    maps: ['Origins', 'Mob of the Dead', 'Buried', 'Die Rise', 'TranZit', 'Town', 'Farm', 'Bus Depot', 'Nuketown Zombies']
  },
  {
    id: 'bo1',
    franchise_id: 'cod',
    name: 'Black Ops 1',
    short_code: 'BO1',
    sort_order: 12,
    maps: ['Kino der Toten', '"Five"', 'Ascension', 'Call of the Dead', 'Shangri-La', 'Moon', 'Nacht der Untoten', 'Verrückt', 'Shi No Numa', 'Der Riese', 'Dead Ops Arcade']
  },
  {
    id: 'waw',
    franchise_id: 'cod',
    name: 'World at War',
    short_code: 'WAW',
    sort_order: 13,
    maps: ['Nacht der Untoten', 'Verrückt', 'Shi No Numa', 'Der Riese']
  },

  // --- HALO [FIREFIGHT] ---
  {
    id: 'halo-inf',
    franchise_id: 'halo',
    name: 'Halo Infinite',
    short_code: 'H-INF',
    sort_order: 14,
    maps: ['Kusini Bay', 'Exiled', 'Live Fire', 'Deadlock', 'Behemoth', 'High Ground', 'Water Filtration', 'Scarr', 'House of Reckoning']
  },
  {
    id: 'halo-reach',
    franchise_id: 'halo',
    name: 'Halo Reach (MCC)',
    short_code: 'REACH',
    sort_order: 15,
    maps: ['Beachhead', 'Courtyard', 'Waterfront', 'Corvette', 'Outpost', 'Overlook', 'Glacier', 'Holdout', 'Unearthed']
  },
  {
    id: 'halo-odst',
    franchise_id: 'halo',
    name: 'Halo 3: ODST',
    short_code: 'ODST',
    sort_order: 16,
    maps: ['Lost Platoon', 'Security Zone', 'Alpha Site', 'Windward', 'Chasm Ten', 'Last Exit', 'Rally Point', 'Crater']
  },
  {
    id: 'halo-5',
    franchise_id: 'halo',
    name: 'Halo 5: Warzone Firefight',
    short_code: 'H5',
    sort_order: 17,
    maps: ['Escape from A.R.C.', 'Apex 7', 'March on Stormbreak', 'Skirmish at Darkstar', 'Attack on Sanctum']
  },

  // --- GEARS OF WAR [HORDE] ---
  {
    id: 'gears-5',
    franchise_id: 'gears',
    name: 'Gears 5',
    short_code: 'G5',
    sort_order: 18,
    maps: ['District', 'Blood Drive', 'Checkout', 'Foundation', 'Nexus', 'Asylum', 'Bunker', 'Exhibit', 'Icebound', 'Vasgar', 'Training Grounds', 'Atrium', 'Pahanu', 'Regency', 'Speyer', 'Village']
  },
  {
    id: 'gears-4',
    franchise_id: 'gears',
    name: 'Gears of War 4',
    short_code: 'G4',
    sort_order: 19,
    maps: ['Dam', 'Foundation', 'Gridlock', 'Harbor', 'Impact', 'Lift', 'Reclaimed', 'Relic', 'Subway', 'Dawn', 'Glory', 'Speyer']
  },
  {
    id: 'gears-3',
    franchise_id: 'gears',
    name: 'Gears of War 3',
    short_code: 'G3',
    sort_order: 20,
    maps: ['Blood Drive', 'Checkout', 'Drydock', 'Gridlock', 'Hotel', 'Mercy', 'Old Town', 'Overpass', 'Sandbar', 'Thrashball', 'Trenches']
  },
  {
    id: 'gears-2',
    franchise_id: 'gears',
    name: 'Gears of War 2',
    short_code: 'G2',
    sort_order: 21,
    maps: ['Blood Drive', 'Daybreak', 'Hail', 'Jacinto', 'Security', 'Subway', 'Wayward Cave', 'Memorial', 'Nowhere', 'River']
  }
];

// Ensure games & maps exist
const syncDefaultGamesAndMaps = () => {
  const insertGame = db.prepare('INSERT OR REPLACE INTO games (id, franchise_id, name, short_code, sort_order) VALUES (?, ?, ?, ?, ?)');
  const checkMap = db.prepare('SELECT id FROM maps WHERE game_id = ? AND name = ?');
  const insertMap = db.prepare('INSERT INTO maps (game_id, name, sort_order) VALUES (?, ?, ?)');

  const syncTx = db.transaction(() => {
    for (const game of defaultGamesAndMaps) {
      insertGame.run(game.id, game.franchise_id || 'cod', game.name, game.short_code, game.sort_order);
      game.maps.forEach((mapName, idx) => {
        const existing = checkMap.get(game.id, mapName);
        if (!existing) {
          insertMap.run(game.id, mapName, idx + 1);
        }
      });
    }
  });

  syncTx();
};
syncDefaultGamesAndMaps();

// Helper Functions
const getFranchises = () => {
  return db.prepare('SELECT * FROM franchises ORDER BY sort_order ASC').all();
};

const getGames = (franchise_id) => {
  if (franchise_id && franchise_id !== 'all') {
    return db.prepare('SELECT * FROM games WHERE franchise_id = ? ORDER BY sort_order ASC').all(franchise_id);
  }
  return db.prepare('SELECT * FROM games ORDER BY sort_order ASC').all();
};

const getMapsForGame = (gameId) => {
  return db.prepare('SELECT * FROM maps WHERE game_id = ? ORDER BY sort_order ASC, name ASC').all(gameId);
};

const getAllMaps = (franchise_id) => {
  let query = `
    SELECT maps.id, maps.name, maps.game_id, games.franchise_id, games.name as game_name, games.short_code 
    FROM maps 
    JOIN games ON maps.game_id = games.id 
  `;
  const params = [];
  if (franchise_id && franchise_id !== 'all') {
    query += ' WHERE games.franchise_id = ? ';
    params.push(franchise_id);
  }
  query += ' ORDER BY games.sort_order ASC, maps.sort_order ASC';
  return db.prepare(query).all(...params);
};

const addGame = (id, franchise_id, name, short_code) => {
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM games').get().m || 0;
  const stmt = db.prepare('INSERT INTO games (id, franchise_id, name, short_code, sort_order) VALUES (?, ?, ?, ?, ?)');
  stmt.run(id.toLowerCase().trim(), franchise_id || 'cod', name.trim(), short_code.toUpperCase().trim(), maxOrder + 1);
  return { id, franchise_id, name, short_code };
};

const addMap = (game_id, name) => {
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM maps WHERE game_id = ?').get(game_id).m || 0;
  const stmt = db.prepare('INSERT INTO maps (game_id, name, sort_order) VALUES (?, ?, ?)');
  const res = stmt.run(game_id, name.trim(), maxOrder + 1);
  return { id: res.lastInsertRowid, game_id, name: name.trim() };
};

const createSubmission = (data) => {
  // Infer franchise from game_id if not explicitly provided
  let franchise_id = data.franchise_id;
  if (!franchise_id) {
    const gameRow = db.prepare('SELECT franchise_id FROM games WHERE id = ?').get(data.game_id);
    franchise_id = gameRow ? gameRow.franchise_id : 'cod';
  }

  const stmt = db.prepare(`
    INSERT INTO submissions (
      franchise_id, game_id, map_name, player_count, game_mode, round, player_name, 
      discord_user_id, teammates, proof_url, twitch_channel, status
    ) VALUES (
      @franchise_id, @game_id, @map_name, @player_count, @game_mode, @round, @player_name, 
      @discord_user_id, @teammates, @proof_url, @twitch_channel, @status
    )
  `);
  const result = stmt.run({
    franchise_id,
    game_id: data.game_id,
    map_name: data.map_name,
    player_count: data.player_count,
    game_mode: data.game_mode || 'Standard',
    round: Number(data.round),
    player_name: data.player_name,
    discord_user_id: data.discord_user_id || null,
    teammates: data.teammates || null,
    proof_url: data.proof_url || null,
    twitch_channel: data.twitch_channel || null,
    status: data.status || 'pending'
  });
  return result.lastInsertRowid;
};

const getSubmissionById = (id) => {
  return db.prepare(`
    SELECT s.*, g.name as game_name, g.short_code, f.name as franchise_name, f.sub_label, f.metric_label
    FROM submissions s 
    JOIN games g ON s.game_id = g.id 
    JOIN franchises f ON s.franchise_id = f.id
    WHERE s.id = ?
  `).get(id);
};

const updateSubmissionStatus = (id, status, reviewerName, notes = '') => {
  const stmt = db.prepare(`
    UPDATE submissions 
    SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, notes = ? 
    WHERE id = ?
  `);
  return stmt.run(status, reviewerName, notes, id);
};

const getLeaderboard = ({ franchise_id, game_id, map_name, player_count, game_mode, limit = 50 }) => {
  let query = `
    SELECT s.*, g.name as game_name, g.short_code, f.name as franchise_name, f.sub_label, f.metric_label 
    FROM submissions s 
    JOIN games g ON s.game_id = g.id 
    JOIN franchises f ON s.franchise_id = f.id
    WHERE s.status = 'approved'
  `;
  const params = [];

  if (franchise_id && franchise_id !== 'all') {
    query += ' AND s.franchise_id = ?';
    params.push(franchise_id);
  }

  if (game_id && game_id !== 'all') {
    query += ' AND s.game_id = ?';
    params.push(game_id);
  }

  if (map_name && map_name !== 'all') {
    query += ' AND s.map_name = ?';
    params.push(map_name);
  }

  if (player_count && player_count !== 'all') {
    query += ' AND s.player_count = ?';
    params.push(player_count);
  }

  if (game_mode && game_mode !== 'all') {
    query += ' AND s.game_mode = ?';
    params.push(game_mode);
  }

  query += ' ORDER BY s.round DESC, s.created_at ASC LIMIT ?';
  params.push(limit);

  return db.prepare(query).all(...params);
};

const getPendingSubmissions = (limit = 10) => {
  return db.prepare(`
    SELECT s.*, g.name as game_name, g.short_code, f.name as franchise_name, f.sub_label 
    FROM submissions s 
    JOIN games g ON s.game_id = g.id 
    JOIN franchises f ON s.franchise_id = f.id
    WHERE s.status = 'pending' 
    ORDER BY s.created_at ASC 
    LIMIT ?
  `).all(limit);
};

const getClanStats = (franchise_id) => {
  let filter = ' WHERE s.status = "approved" ';
  const params = [];
  if (franchise_id && franchise_id !== 'all') {
    filter += ' AND s.franchise_id = ? ';
    params.push(franchise_id);
  }

  const totalRounds = db.prepare(`SELECT SUM(round) as total FROM submissions s ${filter}`).get(...params).total || 0;
  const totalSubmissions = db.prepare(`SELECT COUNT(*) as count FROM submissions s ${filter}`).get(...params).count || 0;
  const highestRound = db.prepare(`
    SELECT s.round, s.player_name, s.map_name, g.short_code, f.metric_label, f.sub_label
    FROM submissions s 
    JOIN games g ON s.game_id = g.id 
    JOIN franchises f ON s.franchise_id = f.id
    ${filter}
    ORDER BY s.round DESC 
    LIMIT 1
  `).get(...params) || null;

  // Stats grouped by franchise for the Hub cards
  const franchiseSummaries = db.prepare(`
    SELECT f.id, f.name, f.sub_label, f.description, f.metric_label, f.theme_color, f.icon,
           COUNT(s.id) as run_count,
           COALESCE(MAX(s.round), 0) as max_score,
           COALESCE(SUM(s.round), 0) as total_score
    FROM franchises f
    LEFT JOIN submissions s ON f.id = s.franchise_id AND s.status = 'approved'
    GROUP BY f.id
    ORDER BY f.sort_order ASC
  `).all();

  return {
    totalRounds,
    totalSubmissions,
    highestRound,
    franchises: franchiseSummaries
  };
};

module.exports = {
  db,
  getFranchises,
  getGames,
  getMapsForGame,
  getAllMaps,
  addGame,
  addMap,
  createSubmission,
  getSubmissionById,
  updateSubmissionStatus,
  getLeaderboard,
  getPendingSubmissions,
  getClanStats
};
