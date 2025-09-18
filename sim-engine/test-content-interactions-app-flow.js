// test-content-interactions-app-flow.js
// Test to verify contentInteractions flow in the actual app simulation

const WorldBuilder = require('./src/domain/services/WorldBuilder.js');
const SimulationService = require('./src/application/use-cases/services/SimulationService.js');
const generateBehavior = require('./src/application/use-cases/npc/GenerateBehavior.js');
const InteractionManager = require('./src/domain/services/InteractionManager.js');

console.log('🧪 Testing Content Interactions Flow in App Simulation...\n');

async function testAppFlow() {
  const results = [];

  try {
    // Step 1: Create world using WorldBuilder
    console.log('Step 1: Creating world with WorldBuilder...');
    const worldBuilder = new WorldBuilder();

    // Create a simple world
    const world = worldBuilder.createWorld('Test World', 'Testing content interactions flow');

    // Add a node
    const nodeData = {
      name: 'Village',
      type: 'settlement',
      environmentalProperties: {
        climate: 'temperate',
        season: 'spring',
        prosperous: true,
        crowded: false
      }
    };
    const node = worldBuilder.addNode(nodeData);
    results.push(`✅ Created node: ${node.name} (${node.id})`);

    // Add a character
    const characterData = {
      name: 'Test Character',
      consciousness: { frequency: 40, coherence: 0.8 },
      attributes: { strength: 15, dexterity: 12, constitution: 14, intelligence: 13, wisdom: 11, charisma: 10 },
      personality: { traits: [{ id: 'empathy', intensity: 0.7 }] }
    };
    const character = worldBuilder.addCharacter(characterData);
    results.push(`✅ Created character: ${character.name} (${character.id})`);

    // Add interactions
    const interact1 = worldBuilder.addInteraction({
      id: 'interact1',
      name: 'Gather Resources',
      type: 'resource_gathering',
      description: 'Collect resources from the environment'
    });

    const interact2 = worldBuilder.addInteraction({
      id: 'interact2',
      name: 'Socialize',
      type: 'social',
      description: 'Interact with other characters'
    });
    results.push(`✅ Created interactions: ${interact1.name}, ${interact2.name}`);

    // Assign character to node
    worldBuilder.assignCharacterToNode(character.id, node.id);
    results.push(`✅ Assigned character to node`);

    // Assign interactions to character
    worldBuilder.assignInteractionToCharacter(character.id, interact1.id);
    worldBuilder.assignInteractionToCharacter(character.id, interact2.id);
    results.push(`✅ Assigned interactions to character`);

    // Step 2: Prepare world for simulation
    console.log('\nStep 2: Preparing world for simulation...');
    const preparedWorld = worldBuilder.prepareForSimulation();
    results.push(`✅ World prepared for simulation`);
    results.push(`📊 Prepared world structure:`);
    results.push(`   - Nodes: ${preparedWorld.nodes.size}`);
    results.push(`   - Characters: ${preparedWorld.characters.size}`);
    results.push(`   - Interactions: ${preparedWorld.interactions.size}`);

    // Step 3: Initialize simulation
    console.log('\nStep 3: Initializing simulation...');
    const simulationState = SimulationService.initialize(preparedWorld);
    results.push(`✅ Simulation initialized`);
    results.push(`📊 Simulation state:`);
    results.push(`   - Nodes: ${simulationState.nodes.length}`);
    results.push(`   - Characters: ${simulationState.characters.length}`);
    results.push(`   - Interactions: ${simulationState.interactions.length}`);

    // Check contentInteractions on nodes
    console.log('\nStep 4: Checking contentInteractions on nodes...');
    simulationState.nodes.forEach(node => {
      console.log(`Node ${node.name}: contentInteractions =`, node.contentInteractions);
      if (node.contentInteractions && node.contentInteractions.length > 0) {
        results.push(`✅ Node ${node.name} has ${node.contentInteractions.length} content interactions`);
        node.contentInteractions.forEach(interaction => {
          results.push(`   - ${interaction.name} (${interaction.id})`);
        });
      } else {
        results.push(`❌ Node ${node.name} has no content interactions`);
      }
    });

    // Step 5: Test GenerateBehavior directly
    console.log('\nStep 5: Testing GenerateBehavior directly...');
    const testCharacter = simulationState.characters[0];
    const behavior = generateBehavior(testCharacter, simulationState);

    if (behavior) {
      results.push(`✅ GenerateBehavior returned behavior: ${behavior.interaction?.name || 'unknown'}`);
      if (behavior.resolution) {
        results.push(`   - Resolution: ${behavior.resolution.outcome}`);
      }
    } else {
      results.push(`❌ GenerateBehavior returned null`);
    }

    // Step 6: Test InteractionManager
    console.log('\nStep 6: Testing InteractionManager...');
    const interactionManager = new InteractionManager();
    const currentNode = simulationState.nodes.find(n => n.id === testCharacter.currentNodeId);

    if (currentNode) {
      console.log(`Current node for character: ${currentNode.name}`);
      console.log(`Current node contentInteractions:`, currentNode.contentInteractions);

      const availableInteractions = interactionManager.getAvailableInteractions(testCharacter, simulationState);
      results.push(`✅ InteractionManager returned ${availableInteractions.length} available interactions`);

      if (availableInteractions.length > 0) {
        availableInteractions.forEach(interaction => {
          results.push(`   - ${interaction.name} (${interaction.type})`);
        });
      } else {
        results.push(`❌ No available interactions found`);
      }
    } else {
      results.push(`❌ Could not find current node for character`);
    }

    // Step 7: Process a turn
    console.log('\nStep 7: Processing a turn...');
    const turnResult = SimulationService.processTurn();
    results.push(`✅ Turn processed successfully`);
    results.push(`📊 Turn result:`);
    results.push(`   - New time: ${turnResult.worldState.time}`);
    results.push(`   - Events: ${turnResult.worldState.events.length}`);

  } catch (error) {
    results.push(`❌ Error during test: ${error.message}`);
    console.error('Full error:', error);
  }

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📋 TEST RESULTS:');
  console.log('='.repeat(60));
  results.forEach(result => console.log(result));

  return results;
}

// Run the test
testAppFlow().then(() => {
  console.log('\n🎉 App flow test completed!');
}).catch(error => {
  console.error('❌ Test failed:', error);
});