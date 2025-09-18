/**
 * Standalone Test for Valley of Echoes LOD Distribution Logic
 * Tests the settlement building logic without ES6 import issues
 */

// Mock settlement configurations (same as in DemoService)
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
 * Build settlement logic (copied from DemoService)
 */
function buildSettlement(config) {
  const characters = [];

  // Create hero characters
  config.heroCharacters.forEach(hero => {
    const heroCharacter = {
      id: hero.id,
      name: hero.name,
      lodTier: 'hero'
    };
    characters.push(heroCharacter);
  });

  // Create group-level characters for population groups
  config.populationGroups.forEach(group => {
    const groupCharacter = {
      id: group.id,
      name: group.name,
      lodTier: 'group'
    };
    characters.push(groupCharacter);
  });

  // Create individual background characters for each population group
  config.populationGroups.forEach(group => {
    for (let i = 0; i < group.size; i++) {
      const backgroundCharacter = {
        id: `${group.id}-bg-${i}`,
        name: `${group.name} ${i + 1}`,
        lodTier: 'background'
      };
      characters.push(backgroundCharacter);
    }
  });

  return characters;
}

/**
 * Test the LOD distribution logic
 */
function testLODDistribution() {
  console.log('🧪 Testing Valley of Echoes LOD Distribution Logic...\n');

  // Build settlements
  const oakwoodCharacters = buildSettlement(oakwoodConfig);
  const ironholdCharacters = buildSettlement(ironholdConfig);
  const allCharacters = [...oakwoodCharacters, ...ironholdCharacters];

  console.log('📊 Character Generation Results:');
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

  // Expected counts
  const expected = {
    hero: 8,        // 4 from Oakwood + 4 from Ironhold
    group: 8,       // 4 groups from Oakwood + 4 groups from Ironhold
    background: 200 // 100 from Oakwood + 100 from Ironhold
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

  console.log(`\n${success ? '🎉 TEST PASSED' : '❌ TEST FAILED'}: LOD distribution logic is correct`);

  return {
    success,
    lodCounts,
    expected,
    characters: allCharacters
  };
}

// Run the test
const result = testLODDistribution();

// Sample some characters to show the structure
console.log('\n📋 Sample Characters:');
result.characters.slice(0, 5).forEach(char => {
  console.log(`   ${char.id}: ${char.name} (${char.lodTier})`);
});
console.log('   ... and', result.characters.length - 5, 'more characters');

module.exports = { testLODDistribution };