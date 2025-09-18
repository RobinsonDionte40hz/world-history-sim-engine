/**
 * Simple test to verify Valley of Echoes demo character creation
 */

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

/**
 * Build settlement with fixed character creation logic
 */
function buildSettlement(config) {
  // Create hero characters
  const heroCharacters = config.heroCharacters.map(char => ({
    ...char,
    lodTier: 'hero'
  }));

  // Create group-level characters for population groups
  const groupCharacters = config.populationGroups.map(group => ({
    id: group.id,
    name: group.name,
    lodTier: 'group',
    populationGroupId: group.id
  }));

  // Create individual background characters for each population group
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

  return {
    characters: [
      ...heroCharacters,
      ...groupCharacters,
      ...backgroundCharacters
    ]
  };
}

/**
 * Test the character creation
 */
function testCharacterCreation() {
  console.log('🧪 Testing Valley of Echoes Character Creation\n');

  const oakwood = buildSettlement(oakwoodConfig);
  const ironhold = buildSettlement(ironholdConfig);

  // Count characters by LOD tier
  const countByTier = (characters) => {
    return characters.reduce((acc, char) => {
      acc[char.lodTier] = (acc[char.lodTier] || 0) + 1;
      return acc;
    }, {});
  };

  const oakwoodCounts = countByTier(oakwood.characters);
  const ironholdCounts = countByTier(ironhold.characters);

  console.log('Oakwood Federation:');
  console.log(`  Heroes: ${oakwoodCounts.hero || 0}`);
  console.log(`  Groups: ${oakwoodCounts.group || 0}`);
  console.log(`  Background: ${oakwoodCounts.background || 0}`);
  console.log(`  Total: ${oakwood.characters.length}`);

  console.log('\nIronhold Dominion:');
  console.log(`  Heroes: ${ironholdCounts.hero || 0}`);
  console.log(`  Groups: ${ironholdCounts.group || 0}`);
  console.log(`  Background: ${ironholdCounts.background || 0}`);
  console.log(`  Total: ${ironhold.characters.length}`);

  const totalCharacters = oakwood.characters.length + ironhold.characters.length;
  const totalHeroes = (oakwoodCounts.hero || 0) + (ironholdCounts.hero || 0);
  const totalGroups = (oakwoodCounts.group || 0) + (ironholdCounts.group || 0);
  const totalBackground = (oakwoodCounts.background || 0) + (ironholdCounts.background || 0);

  console.log('\nCombined Totals:');
  console.log(`  Heroes: ${totalHeroes}`);
  console.log(`  Groups: ${totalGroups}`);
  console.log(`  Background: ${totalBackground}`);
  console.log(`  Total: ${totalCharacters}`);

  // Expected values
  const expected = {
    heroes: 8,
    groups: 8,
    background: 200,
    total: 216
  };

  console.log('\nExpected Values:');
  console.log(`  Heroes: ${expected.heroes}`);
  console.log(`  Groups: ${expected.groups}`);
  console.log(`  Background: ${expected.background}`);
  console.log(`  Total: ${expected.total}`);

  // Validation
  const isValid = totalHeroes === expected.heroes &&
                  totalGroups === expected.groups &&
                  totalBackground === expected.background &&
                  totalCharacters === expected.total;

  console.log(`\n✅ Validation: ${isValid ? 'PASSED' : 'FAILED'}`);

  if (!isValid) {
    console.log('❌ Issues found:');
    if (totalHeroes !== expected.heroes) console.log(`  - Heroes: ${totalHeroes} vs ${expected.heroes}`);
    if (totalGroups !== expected.groups) console.log(`  - Groups: ${totalGroups} vs ${expected.groups}`);
    if (totalBackground !== expected.background) console.log(`  - Background: ${totalBackground} vs ${expected.background}`);
    if (totalCharacters !== expected.total) console.log(`  - Total: ${totalCharacters} vs ${expected.total}`);
  }

  return isValid;
}

// Run the test
testCharacterCreation();