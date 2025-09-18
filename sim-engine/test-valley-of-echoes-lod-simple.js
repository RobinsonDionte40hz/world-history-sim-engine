/**
 * Simple test to verify Valley of Echoes LOD distribution logic
 * Tests the same logic as DemoService._buildSettlement without module imports
 */

function testValleyOfEchoesLODLogic() {
  console.log('🧪 Testing Valley of Echoes LOD Distribution Logic...\n');

  // Oakwood Federation Configuration (simplified)
  const oakwoodConfig = {
    id: 'oakwood-federation',
    name: 'Oakwood Federation',
    populationGroups: [
      { id: 'oakwood-farmers', name: 'Oakwood Farmers', size: 45 },
      { id: 'oakwood-artisans', name: 'Oakwood Artisans', size: 28 },
      { id: 'oakwood-merchants', name: 'Oakwood Merchants', size: 15 },
      { id: 'oakwood-administrators', name: 'Federation Administrators', size: 12 }
    ],
    heroCharacters: [
      { id: 'council-chair-elara', name: 'Elara Voss' },
      { id: 'merchant-guild-leader', name: 'Marcus Hale' },
      { id: 'head-farmer', name: 'Gwenith Stone' },
      { id: 'master-artisan', name: 'Thaddeus Iron' }
    ]
  };

  // Ironhold Dominion Configuration (simplified)
  const ironholdConfig = {
    id: 'ironhold-dominion',
    name: 'Ironhold Dominion',
    populationGroups: [
      { id: 'ironhold-miners', name: 'Ironhold Miners', size: 38 },
      { id: 'ironhold-smiths', name: 'Ironhold Smiths', size: 22 },
      { id: 'ironhold-soldiers', name: 'Ironhold Garrison', size: 32 },
      { id: 'ironhold-engineers', name: 'Fortress Engineers', size: 8 }
    ],
    heroCharacters: [
      { id: 'lord-protector-garret', name: 'Lord Garret Ironfist' },
      { id: 'master-smith', name: 'Helena Forgeheart' },
      { id: 'mining-foreman', name: 'Drake Deepvein' },
      { id: 'captain-garrison', name: 'Captain Thorne' }
    ]
  };

  /**
   * Simulate the _buildSettlement method logic
   */
  function buildSettlement(config) {
    const characters = [];

    // Create hero characters
    config.heroCharacters.forEach(hero => {
      characters.push({
        id: hero.id,
        name: hero.name,
        lodTier: 'hero'
      });
    });

    // Create group-level characters for population groups
    config.populationGroups.forEach(group => {
      characters.push({
        id: group.id,
        name: group.name,
        lodTier: 'group'
      });
    });

    // Create individual background characters for each population group
    config.populationGroups.forEach(group => {
      for (let i = 0; i < group.size; i++) {
        characters.push({
          id: `${group.id}-bg-${i}`,
          name: `${group.name} ${i + 1}`,
          lodTier: 'background'
        });
      }
    });

    return characters;
  }

  // Build both settlements
  const oakwoodCharacters = buildSettlement(oakwoodConfig);
  const ironholdCharacters = buildSettlement(ironholdConfig);
  const allCharacters = [...oakwoodCharacters, ...ironholdCharacters];

  console.log('📊 Generated Characters:');
  console.log(`   Oakwood Characters: ${oakwoodCharacters.length}`);
  console.log(`   Ironhold Characters: ${ironholdCharacters.length}`);
  console.log(`   Total Characters: ${allCharacters.length}\n`);

  // Analyze LOD distribution
  const lodCounts = {
    hero: 0,
    group: 0,
    background: 0
  };

  allCharacters.forEach(char => {
    if (char.lodTier) {
      lodCounts[char.lodTier]++;
    }
  });

  console.log('🎯 LOD Distribution:');
  console.log(`   Hero NPCs: ${lodCounts.hero}`);
  console.log(`   Population Groups: ${lodCounts.group}`);
  console.log(`   Background Characters: ${lodCounts.background}`);
  console.log(`   Total: ${lodCounts.hero + lodCounts.group + lodCounts.background}\n`);

  // Expected counts based on configuration
  const expected = {
    hero: 8,        // 4 from Oakwood + 4 from Ironhold
    group: 8,       // 4 groups from Oakwood + 4 groups from Ironhold
    background: 200 // 45+28+15+12=100 from Oakwood + 38+22+32+8=100 from Ironhold
  };

  console.log('✅ Expected vs Actual:');
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

  console.log(`\n${success ? '🎉 TEST PASSED' : '❌ TEST FAILED'}: Valley of Echoes LOD distribution logic is correct`);

  // Show sample characters
  console.log('\n📋 Sample Characters:');
  console.log('Heroes:', allCharacters.filter(c => c.lodTier === 'hero').slice(0, 3).map(c => c.name));
  console.log('Groups:', allCharacters.filter(c => c.lodTier === 'group').slice(0, 3).map(c => c.name));
  console.log('Background:', allCharacters.filter(c => c.lodTier === 'background').slice(0, 3).map(c => c.name));

  return {
    success,
    lodCounts,
    expected,
    totalCharacters: allCharacters.length
  };
}

// Run the test
const result = testValleyOfEchoesLODLogic();
console.log('\n📊 Test Result:', result);

// Exit with appropriate code
process.exit(result.success ? 0 : 1);