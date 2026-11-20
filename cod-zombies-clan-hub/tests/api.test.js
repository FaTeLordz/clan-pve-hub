const assert = require('assert');
const http = require('http');
const { createServer } = require('../src/server/api');

async function runApiTests() {
  console.log('🧪 Running Web & API Server Tests...');

  const app = createServer();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const fetchJson = async (endpoint) => {
    return new Promise((resolve, reject) => {
      http.get(`${baseUrl}${endpoint}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (err) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }).on('error', reject);
    });
  };

  try {
    // 1. GET /api/franchises
    const franchisesRes = await fetchJson('/api/franchises');
    assert.strictEqual(franchisesRes.status, 200);
    assert.strictEqual(franchisesRes.body.success, true);
    assert.strictEqual(franchisesRes.body.franchises.length, 3);
    console.log('  ✅ GET /api/franchises passed');

    // 2. GET /api/games?franchise=halo
    const gamesRes = await fetchJson('/api/games?franchise=halo');
    assert.strictEqual(gamesRes.status, 200);
    assert.ok(gamesRes.body.games.length >= 4);
    console.log('  ✅ GET /api/games?franchise=halo passed');

    // 3. GET /api/maps?game=bo6
    const mapsRes = await fetchJson('/api/maps?game=bo6');
    assert.strictEqual(mapsRes.status, 200);
    assert.ok(mapsRes.body.maps.some(m => m.name === 'Terminus'));
    console.log('  ✅ GET /api/maps?game=bo6 passed');

    // 4. GET /api/stats
    const statsRes = await fetchJson('/api/stats');
    assert.strictEqual(statsRes.status, 200);
    assert.ok(statsRes.body.stats !== undefined);
    console.log('  ✅ GET /api/stats passed');

    // 5. GET /api/leaderboard?franchise=cod
    const lbRes = await fetchJson('/api/leaderboard?franchise=cod');
    assert.strictEqual(lbRes.status, 200);
    assert.ok(Array.isArray(lbRes.body.leaderboard));
    console.log('  ✅ GET /api/leaderboard?franchise=cod passed');

    // 6. Test Static Frontend Assets
    const htmlRes = await new Promise((resolve) => {
      http.get(`${baseUrl}/`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
    });
    assert.strictEqual(htmlRes.status, 200);
    assert.ok(htmlRes.body.includes('Call of Duty'), 'HTML should contain Call of Duty');
    assert.ok(htmlRes.body.includes('Halo'), 'HTML should contain Halo');
    assert.ok(htmlRes.body.includes('Gears of War'), 'HTML should contain Gears of War');
    console.log('  ✅ Web frontend HTML served successfully at root /');

  } finally {
    server.close();
  }

  console.log('✅ All API & Web Tests Passed Successfully!\n');
}

module.exports = { runApiTests };
