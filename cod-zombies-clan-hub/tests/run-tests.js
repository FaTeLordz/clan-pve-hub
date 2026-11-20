const { runDbTests } = require('./db.test');
const { runApiTests } = require('./api.test');
const { runBotTests } = require('./bot.test');

async function main() {
  console.log('====================================================');
  console.log('🚀 Running Clan Survival & Horde Hub Automated Tests');
  console.log('====================================================\n');

  try {
    runDbTests();
    await runApiTests();
    runBotTests();

    console.log('====================================================');
    console.log('🎉 ALL AUTOMATED TEST SUITES PASSED (100% SUCCESS)');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

main();
