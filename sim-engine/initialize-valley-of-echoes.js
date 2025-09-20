/**
 * Simple Valley of Echoes Demo Initialization for UI
 * This script properly initializes the simulation for the React UI
 */

const DemoService = require('./src/application/services/DemoService.js');
const WorldBuilder = require('./src/domain/services/WorldBuilder.js');

async function initializeValleyOfEchoesForUI() {
  console.log('🌍 Initializing Valley of Echoes Demo for UI...\n');

  try {
    // Step 1: Generate demo world using DemoService
    console.log('📦 Generating demo world...');
    const demoWorld = DemoService.generateDemoWorld('valley_of_echoes_demo');

    console.log('✅ Demo world generated:');
    console.log(`   - ${demoWorld.characters?.length || 0} characters`);
    console.log(`   - ${demoWorld.nodes?.length || 0} nodes`);
    console.log(`   - ${demoWorld.interactions?.length || 0} interactions`);

    // Step 2: Prepare world for simulation using WorldBuilder
    console.log('\n🏗️ Preparing world for simulation...');
    const worldBuilder = new WorldBuilder();
    const preparedWorld = await worldBuilder.prepareForSimulation(demoWorld);

    console.log('✅ World prepared for simulation:');
    console.log(`   - World name: ${preparedWorld.worldProperties?.name || 'Unknown'}`);
    console.log(`   - Characters: ${preparedWorld.characters?.size || 0}`);
    console.log(`   - Nodes: ${preparedWorld.nodes?.size || 0}`);
    console.log(`   - Interactions: ${preparedWorld.interactions?.size || 0}`);

    // Step 3: Add simulation metadata
    preparedWorld.simulationMetadata = {
      source: 'DemoService',
      preparedAt: new Date().toISOString(),
      description: 'Valley of Echoes demo world prepared for simulation'
    };

    console.log('\n🎯 Simulation-ready world created!');
    console.log('📋 To use in UI:');
    console.log('   1. Start the React app: npm start');
    console.log('   2. Use SimulationContext.acceptPreparedWorld() with this data');
    console.log('   3. Then you can process turns normally');

    return preparedWorld;

  } catch (error) {
    console.error('❌ Failed to initialize Valley of Echoes demo:', error);
    throw error;
  }
}

// Export for use in other scripts
module.exports = { initializeValleyOfEchoesForUI };

// CLI execution
if (require.main === module) {
  initializeValleyOfEchoesForUI().catch(console.error);
}