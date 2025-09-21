// Test the Character instance conversion fix
const SimulationService = require('./src/application/use-cases/services/SimulationService.js');
const DemoService = require('./src/application/services/DemoService.js');
const Character = require('./src/domain/entities/Character.js');

console.log('Testing Character instance conversion fix...\n');

async function testFix() {
  try {
    // Create demo world
    const demoService = new DemoService();
    const valleyDemo = await demoService.generateDemoWorld('valley-of-echoes');
    
    console.log('Demo world generated successfully');
    console.log('Characters from demo:');
    if (valleyDemo.characters && Array.isArray(valleyDemo.characters)) {
      valleyDemo.characters.forEach((char, index) => {
        console.log(`  ${index}: ${char.name} - Instance: ${char instanceof Character}, Constructor: ${char.constructor.name}`);
      });
    }
    
    // Initialize simulation service
    const simulationService = new SimulationService();
    await simulationService.initializeWithWorldData(valleyDemo);
    
    console.log('\nSimulation initialized successfully');
    console.log('Characters in simulation state:');
    const worldState = simulationService.getCurrentWorldState();
    if (worldState.characters instanceof Map) {
      Array.from(worldState.characters.values()).forEach((char, index) => {
        console.log(`  ${index}: ${char.name} - Instance: ${char instanceof Character}, Constructor: ${char.constructor.name}`);
        if (char.attributes) {
          console.log(`    Attributes: ${char.attributes.constructor.name}, hasGetTotalModifier: ${typeof char.attributes.getTotalModifier === 'function'}`);
        }
      });
    }
    
    // Try to process a turn
    console.log('\nProcessing turn...');
    await simulationService.processTurn();
    console.log('Turn processed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
    console.error(error.stack);
  }
}

testFix();