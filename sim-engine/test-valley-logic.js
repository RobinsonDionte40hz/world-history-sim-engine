/**
 * Simple test to verify Valley of Echoes character generation logic
 * without complex imports
 */

function testValleyOfEchoesLogic() {
  console.log('🧪 Testing Valley of Echoes Character Generation Logic\n');

  // Mock the config data (simplified version)
  const oakwoodConfig = {
    id: 'oakwood-federation',
    heroCharacters: [
      { id: 'hero1', name: 'Hero 1' },
      { id: 'hero2', name: 'Hero 2' },
      { id: 'hero3', name: 'Hero 3' },
      { id: 'hero4', name: 'Hero 4' }
    ],
    populationGroups: [
      { id: 'farmers', name: 'Farmers', size: 45 },
      { id: 'artisans', name: 'Artisans', size: 28 },
      { id: 'merchants', name: 'Merchants', size: 15 },
      { id: 'admins', name: 'Admins', size: 12 }
    ]
  };

  const ironholdConfig = {
    id: 'ironhold-dominion',
    heroCharacters: [
      { id: 'hero5', name: 'Hero 5' },
      { id: 'hero6', name: 'Hero 6' },
      { id: 'hero7', name: 'Hero 7' },
      { id: 'hero8', name: 'Hero 8' }
    ],
    populationGroups: [
      { id: 'miners', name: 'Miners', size: 38 },
      { id: 'smiths', name: 'Smiths', size: 22 },
      { id: 'soldiers', name: 'Soldiers', size: 32 },
      { id: 'engineers', name: 'Engineers', size: 8 }
    ]
  };

  // Simulate the character generation logic from DemoService
  function generateCharacters(config) {
    // Create hero characters
    const heroCharacters = config.heroCharacters.map(char => ({
      ...char,
      lodTier: 'hero'
    }));

    // Create group-level characters
    const groupCharacters = config.populationGroups.map(group => ({
      id: group.id,
      name: group.name,
      lodTier: 'group',
      populationGroupId: group.id
    }));

    // Create individual background characters
    const backgroundCharacters = [];
    config.populationGroups.forEach(group => {
      for (let i = 0; i < group.size; i++) {
        backgroundCharacters.push({
          id: `${group.id}-bg-${i}`,
          name: `${group.name} ${i + 1}`,
          lodTier: 'background',
          populationGroupId: group.id
        });
      }
    });

    return [...heroCharacters, ...groupCharacters, ...backgroundCharacters];
  }

  // Generate characters for both settlements
  const oakwoodChars = generateCharacters(oakwoodConfig);
  const ironholdChars = generateCharacters(ironholdConfig);
  const allCharacters = [...oakwoodChars, ...ironholdChars];

  // Count by LOD tier
  const lodCounts = allCharacters.reduce((acc, char) => {
    acc[char.lodTier] = (acc[char.lodTier] || 0) + 1;
    return acc;
  }, {});

  console.log('Character Generation Results:');
  console.log(`Oakwood Characters: ${oakwoodChars.length}`);
  console.log(`Ironhold Characters: ${ironholdChars.length}`);
  console.log(`Total Characters: ${allCharacters.length}`);

  console.log('\nLOD Distribution:');
  console.log(`Hero NPCs: ${lodCounts.hero || 0}`);
  console.log(`Group NPCs: ${lodCounts.group || 0}`);
  console.log(`Background NPCs: ${lodCounts.background || 0}`);

  // Expected values
  const expected = {
    total: 216,
    hero: 8,
    group: 8,
    background: 200
  };

  console.log('\nExpected Values:');
  console.log(`Total Characters: ${expected.total}`);
  console.log(`Hero NPCs: ${expected.hero}`);
  console.log(`Group NPCs: ${expected.group}`);
  console.log(`Background NPCs: ${expected.background}`);

  // Validation
  const isValid =
    allCharacters.length === expected.total &&
    (lodCounts.hero || 0) === expected.hero &&
    (lodCounts.group || 0) === expected.group &&
    (lodCounts.background || 0) === expected.background;

  console.log(`\n✅ Logic Validation: ${isValid ? 'PASSED' : 'FAILED'}`);

  if (!isValid) {
    console.log('❌ Issues found:');
    if (allCharacters.length !== expected.total) {
      console.log(`  - Total: ${allCharacters.length} vs ${expected.total}`);
    }
    if ((lodCounts.hero || 0) !== expected.hero) {
      console.log(`  - Heroes: ${lodCounts.hero || 0} vs ${expected.hero}`);
    }
    if ((lodCounts.group || 0) !== expected.group) {
      console.log(`  - Groups: ${lodCounts.group || 0} vs ${expected.group}`);
    }
    if ((lodCounts.background || 0) !== expected.background) {
      console.log(`  - Background: ${lodCounts.background || 0} vs ${expected.background}`);
    }
  }

  // Show sample background characters
  console.log('\n👥 Sample Background Characters:');
  const backgroundChars = allCharacters.filter(c => c.lodTier === 'background').slice(0, 5);
  backgroundChars.forEach(char => {
    console.log(`  - ${char.name} (${char.id}) - Group: ${char.populationGroupId}`);
  });

  return isValid;
}

// Run the test
testValleyOfEchoesLogic();