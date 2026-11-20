const assert = require('assert');
const { commands } = require('../src/bot/commands');

function runBotTests() {
  console.log('🧪 Running Discord Bot Command Tests...');

  assert.ok(Array.isArray(commands), 'commands should be an array');
  assert.ok(commands.length >= 4, 'should have at least 4 slash commands');

  const commandNames = commands.map(c => c.name);
  assert.ok(commandNames.includes('submit-round'), 'Must have /submit-round command');
  assert.ok(commandNames.includes('leaderboard'), 'Must have /leaderboard command');
  assert.ok(commandNames.includes('clan-stats'), 'Must have /clan-stats command');
  assert.ok(commandNames.includes('pending'), 'Must have /pending command');
  assert.ok(commandNames.includes('add-map'), 'Must have /add-map command');

  // Verify submit-round options
  const submitCmd = commands.find(c => c.name === 'submit-round').toJSON();
  const optionNames = submitCmd.options.map(o => o.name);
  assert.ok(optionNames.includes('franchise'), 'Should have franchise option');
  assert.ok(optionNames.includes('game'), 'Should have game option');
  assert.ok(optionNames.includes('map'), 'Should have map option');
  assert.ok(optionNames.includes('score'), 'Should have score option');
  assert.ok(optionNames.includes('players'), 'Should have players option');
  assert.ok(optionNames.includes('proof'), 'Should have proof option');

  console.log('  ✅ Slash command schemas and option choices verified');
  console.log('✅ All Discord Bot Tests Passed Successfully!\n');
}

module.exports = { runBotTests };
