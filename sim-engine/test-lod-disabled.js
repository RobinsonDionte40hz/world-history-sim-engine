// test-lod-disabled.js - Test if disabling LOD prevents character demotion
console.log('🧪 Testing LOD Disabled - Character Tier Preservation...\n');

const DemoService = require('./src/application/services/DemoService.js');
const SimulationService = require('./src/application/use-cases/services/SimulationService.js');
const WorldBuilder = require('./src/domain/services/WorldBuilder.js');
const LocalStorageWorldRepository = require('./src/infrastructure/LocalStorageWorldRepository.js');

// Mock localStorage for Node.js environment
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

async function testLODDisabled() {
  try {
    console.log('📋 Step 1: Creating Valley of Echoes demo world...');
    
    // Create demo world
    const demoService = new DemoService();
    const preparedWorld = await demoService.createValleyOfEchoesDemoWorld();
    
    console.log(`   ✅ Demo world created with ${preparedWorld.characters.size} characters`);
    
    // Initialize simulation
    const repository = new LocalStorageWorldRepository();
    const simulationService = new SimulationService(
      new WorldBuilder(repository),
      null, // historyGenerator
      null, // turnManager
      repository
    );
    
    console.log('📋 Step 2: Initialize simulation...');
    await simulationService.initializeSimulation(preparedWorld);
    const initialState = await simulationService.getCurrentState();
    
    // Check initial LOD tiers
    const initialTiers = {
      hero: initialState.characters.filter(c => c.lodTier === 'hero').length,
      group: initialState.characters.filter(c => c.lodTier === 'group').length,
      background: initialState.characters.filter(c => c.lodTier === 'background').length
    };
    
    console.log('📊 Initial LOD Distribution:');
    console.log(`   Hero: ${initialTiers.hero}`);
    console.log(`   Group: ${initialTiers.group}`);
    console.log(`   Background: ${initialTiers.background}`);
    
    console.log('\n📋 Step 3: Process turn (with LOD disabled)...');
    const turnResult = await simulationService.processTurn();
    
    if (!turnResult.success) {
      throw new Error(`Turn processing failed: ${turnResult.error}`);
    }
    
    const finalState = turnResult.worldState;
    const finalTiers = {
      hero: finalState.characters.filter(c => c.lodTier === 'hero').length,
      group: finalState.characters.filter(c => c.lodTier === 'group').length,
      background: finalState.characters.filter(c => c.lodTier === 'background').length
    };
    
    console.log('📊 Final LOD Distribution:');
    console.log(`   Hero: ${finalTiers.hero}`);
    console.log(`   Group: ${finalTiers.group}`);
    console.log(`   Background: ${finalTiers.background}`);
    
    // Check for character tier changes
    const heroChange = finalTiers.hero - initialTiers.hero;
    const groupChange = finalTiers.group - initialTiers.group;
    const backgroundChange = finalTiers.background - initialTiers.background;
    
    console.log('\n📈 Tier Changes:');
    console.log(`   Hero: ${heroChange > 0 ? '+' : ''}${heroChange}`);
    console.log(`   Group: ${groupChange > 0 ? '+' : ''}${groupChange}`);
    console.log(`   Background: ${backgroundChange > 0 ? '+' : ''}${backgroundChange}`);
    
    // Verify no tier changes occurred
    if (heroChange === 0 && groupChange === 0 && backgroundChange === 0) {
      console.log('\n✅ SUCCESS: All character tiers preserved!');
      console.log('   LOD processing has been successfully disabled.');
    } else {
      console.log('\n❌ ISSUE: Character tiers changed during turn processing');
      console.log('   This indicates LOD processing is still active somewhere.');
      
      // Find which characters changed tiers
      console.log('\n🔍 Analyzing character tier changes...');
      for (const initialChar of initialState.characters) {
        const finalChar = finalState.characters.find(c => c.id === initialChar.id);
        if (finalChar && finalChar.lodTier !== initialChar.lodTier) {
          console.log(`   ${initialChar.name}: ${initialChar.lodTier} → ${finalChar.lodTier}`);
        }
      }
    }
    
    console.log('\n🎯 Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the test
testLODDisabled();