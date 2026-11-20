const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Set isolated test database
const TEST_DATA_DIR = path.join(__dirname, 'test-data');
if (!fs.existsSync(TEST_DATA_DIR)) {
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
}
process.env.DATA_DIR = TEST_DATA_DIR;

const db = require('../src/db');

function runDbTests() {
  console.log('🧪 Running Database Tests...');

  // 1. Verify Franchises
  const franchises = db.getFranchises();
  assert.strictEqual(franchises.length, 3, 'Should have 3 franchises (CoD, Halo, Gears)');
  const franchiseIds = franchises.map(f => f.id);
  assert.ok(franchiseIds.includes('cod'), 'Must include Call of Duty');
  assert.ok(franchiseIds.includes('halo'), 'Must include Halo');
  assert.ok(franchiseIds.includes('gears'), 'Must include Gears of War');
  console.log('  ✅ Franchises seeded correctly (CoD, Halo, Gears)');

  // 2. Verify Games
  const codGames = db.getGames('cod');
  assert.ok(codGames.length >= 13, 'Should have at least 13 Call of Duty titles');
  assert.ok(codGames.some(g => g.id === 'bo6'), 'Should include Black Ops 6');
  assert.ok(codGames.some(g => g.id === 'bo7'), 'Should include Black Ops 7');

  const haloGames = db.getGames('halo');
  assert.ok(haloGames.length >= 4, 'Should have at least 4 Halo titles');
  assert.ok(haloGames.some(g => g.id === 'halo-inf'), 'Should include Halo Infinite');

  const gearsGames = db.getGames('gears');
  assert.ok(gearsGames.length >= 4, 'Should have at least 4 Gears titles');
  assert.ok(gearsGames.some(g => g.id === 'gears-5'), 'Should include Gears 5');
  console.log(`  ✅ Games verified (${codGames.length} CoD, ${haloGames.length} Halo, ${gearsGames.length} Gears)`);

  // 3. Verify Maps
  const bo6Maps = db.getMapsForGame('bo6');
  assert.ok(bo6Maps.some(m => m.name === 'Terminus'), 'BO6 must include Terminus');
  assert.ok(bo6Maps.some(m => m.name === 'Liberty Falls'), 'BO6 must include Liberty Falls');

  const reachMaps = db.getMapsForGame('halo-reach');
  assert.ok(reachMaps.some(m => m.name === 'Courtyard'), 'Halo Reach must include Courtyard');

  const gears5Maps = db.getMapsForGame('gears-5');
  assert.ok(gears5Maps.some(m => m.name === 'District'), 'Gears 5 must include District');
  console.log('  ✅ Maps verified across all titles');

  // 4. Test Submission Creation
  const subId = db.createSubmission({
    franchise_id: 'cod',
    game_id: 'bo6',
    map_name: 'Terminus',
    player_count: 'Solo',
    game_mode: 'Rogue Run',
    round: 99,
    player_name: 'Test_Player',
    proof_url: 'https://twitch.tv/videos/test',
    status: 'pending'
  });
  assert.ok(subId > 0, 'Submission ID should be a positive integer');

  const pending = db.getPendingSubmissions(10);
  assert.ok(pending.some(p => p.id === subId), 'Newly created submission should appear in pending queue');
  console.log('  ✅ Run submission created with pending status');

  // 5. Test Approval Workflow
  db.updateSubmissionStatus(subId, 'approved', 'AdminMod', 'Verified clean run');
  const approvedItem = db.getSubmissionById(subId);
  assert.strictEqual(approvedItem.status, 'approved', 'Status should be updated to approved');
  assert.strictEqual(approvedItem.reviewed_by, 'AdminMod');

  // 6. Test Leaderboard Sorting & Filtering
  const leaderboard = db.getLeaderboard({ franchise_id: 'cod', game_id: 'bo6' });
  assert.ok(leaderboard.length > 0, 'Leaderboard should return approved run');
  assert.strictEqual(leaderboard[0].round, 99, 'Top round should be 99');

  // 7. Test Clan Stats
  const stats = db.getClanStats('cod');
  assert.ok(stats.totalRounds >= 99, 'Total rounds should include approved run');
  console.log('  ✅ Approval workflow, leaderboard querying, and clan stats verified');

  // Cleanup test db
  try {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  } catch (e) {}

  console.log('✅ All Database Tests Passed Successfully!\n');
}

module.exports = { runDbTests };
