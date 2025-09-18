/**
 * Test Valley of Echoes Demo LOD Distribution
 * Verifies that the updated DemoService creates the correct character counts
 */

const DemoService = require('./src/application/services/DemoService.js');

async function testValleyOfEchoesLOD() {
  console.log('🧪 Testing Valley of Echoes Demo LOD Distribution...\n');

  try {
    // Generate the demo world
    const worldData = DemoService.generateDemoWorld('valley_of_echoes_demo');

    console.log('📊 Generated World Data:');
    console.log(`   World Name: ${worldData.name}`);
    console.log(`   Total Characters: ${worldData.characters.length}`);
    console.log(`   Total Nodes: ${worldData.nodes.length}`);
    console.log(`   Settlements: ${worldData.settlements.length}\n`);

    // Analyze LOD distribution
    const lodCounts = {
      hero: 0,
      group: 0,
      background: 0
    };

    const settlementCounts = {
      'oakwood-federation': { hero: 0, group: 0, background: 0, total: 0 },
      'ironhold-dominion': { hero: 0, group: 0, background: 0, total: 0 }
    };

    worldData.characters.forEach(char => {
      // Count by LOD tier
      if (char.lodTier) {
        lodCounts[char.lodTier]++;
      }

      // Count by settlement
      if (char.assignments?.settlements) {
        char.assignments.settlements.forEach(settlementId => {
          if (settlementCounts[settlementId]) {
            settlementCounts[settlementId][char.lodTier || 'background']++;
            settlementCounts[settlementId].total++;
          }
        });
      }
    });

    console.log('🎯 LOD Distribution:');
    console.log(`   Hero NPCs: ${lodCounts.hero}`);
    console.log(`   Population Groups: ${lodCounts.group}`);
    console.log(`   Background Characters: ${lodCounts.background}`);
    console.log(`   Total: ${lodCounts.hero + lodCounts.group + lodCounts.background}\n`);

    console.log('🏛️ Settlement Breakdown:');
    Object.entries(settlementCounts).forEach(([settlementId, counts]) => {
      console.log(`   ${settlementId}:`);
      console.log(`     Hero: ${counts.hero}`);
      console.log(`     Group: ${counts.group}`);
      console.log(`     Background: ${counts.background}`);
      console.log(`     Total: ${counts.total}`);
    });

    // Expected counts based on configuration
    const expected = {
      hero: 8,        // 4 from Oakwood + 4 from Ironhold
      group: 8,       // 4 groups from Oakwood + 4 groups from Ironhold
      background: 200 // 100 from Oakwood + 100 from Ironhold
    };

    console.log('\n✅ Expected vs Actual:');
    console.log(`   Hero: ${expected.hero} expected, ${lodCounts.hero} actual ${expected.hero === lodCounts.hero ? '✅' : '❌'}`);
    console.log(`   Group: ${expected.group} expected, ${lodCounts.group} actual ${expected.group === lodCounts.group ? '✅' : '❌'}`);
    console.log(`   Background: ${expected.background} expected, ${lodCounts.background} actual ${expected.background === lodCounts.background ? '✅' : '❌'}`);

    const totalExpected = expected.hero + expected.group + expected.background;
    const totalActual = lodCounts.hero + lodCounts.group + lodCounts.background;
    console.log(`   Total: ${totalExpected} expected, ${totalActual} actual ${totalExpected === totalActual ? '✅' : '❌'}`);

    // Test result
    const success = (
      lodCounts.hero === expected.hero &&
      lodCounts.group === expected.group &&
      lodCounts.background === expected.background
    );

    console.log(`\n${success ? '🎉 TEST PASSED' : '❌ TEST FAILED'}: Valley of Echoes demo generates correct LOD distribution`);

    return {
      success,
      lodCounts,
      expected,
      worldData
    };

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
if (require.main === module) {
  testValleyOfEchoesLOD().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { testValleyOfEchoesLOD };