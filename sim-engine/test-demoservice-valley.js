/**
 * Test the updated DemoService Valley of Echoes generation
 */

const DemoService = require('./src/application/services/DemoService.js');

async function testDemoService() {
  console.log('🧪 Testing Updated DemoService - Valley of Echoes Generation\n');

  try {
    // Generate the Valley of Echoes demo world
    const worldData = DemoService.generateDemoWorld('valley_of_echoes_demo');

    console.log('World Generated Successfully!');
    console.log(`Name: ${worldData.worldProperties.name}`);
    console.log(`Description: ${worldData.worldProperties.description}`);

    // Count characters by LOD tier
    const characters = Array.from(worldData.characters.values());
    const lodCounts = characters.reduce((acc, char) => {
      acc[char.lodTier] = (acc[char.lodTier] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Character Distribution:');
    console.log(`Total Characters: ${characters.length}`);
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

    console.log('\n🎯 Expected Values:');
    console.log(`Total Characters: ${expected.total}`);
    console.log(`Hero NPCs: ${expected.hero}`);
    console.log(`Group NPCs: ${expected.group}`);
    console.log(`Background NPCs: ${expected.background}`);

    // Validation
    const isValid =
      characters.length === expected.total &&
      (lodCounts.hero || 0) === expected.hero &&
      (lodCounts.group || 0) === expected.group &&
      (lodCounts.background || 0) === expected.background;

    console.log(`\n✅ Validation: ${isValid ? 'PASSED' : 'FAILED'}`);

    if (!isValid) {
      console.log('❌ Issues found:');
      if (characters.length !== expected.total) {
        console.log(`  - Total: ${characters.length} vs ${expected.total}`);
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

    // Show sample characters
    console.log('\n👥 Sample Characters:');
    const sampleHeroes = characters.filter(c => c.lodTier === 'hero').slice(0, 3);
    const sampleBackground = characters.filter(c => c.lodTier === 'background').slice(0, 3);

    console.log('Heroes:');
    sampleHeroes.forEach(char => {
      console.log(`  - ${char.name} (${char.id})`);
    });

    console.log('Background NPCs:');
    sampleBackground.forEach(char => {
      console.log(`  - ${char.name} (${char.id}) - ${char.populationGroupId}`);
    });

    return isValid;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testDemoService().then(success => {
  console.log(`\n🏁 Test ${success ? 'PASSED' : 'FAILED'}`);
  process.exit(success ? 0 : 1);
});