// test-valley-echoes-content-interactions.js
// Test to verify content interactions work in Valley of Echoes demo

const DemoService = require('./src/application/services/DemoService.js');
const SimulationService = require('./src/application/use-cases/services/SimulationService.js');
const generateBehavior = require('./src/application/use-cases/npc/GenerateBehavior.js').default;

console.log('🧪 Testing Valley of Echoes Content Interactions...\n');

async function testValleyOfEchoesInteractions() {
  const results = [];

  try {
    // Step 1: Generate Valley of Echoes demo
    console.log('Step 1: Generating Valley of Echoes demo...');
    const demoWorld = DemoService.generateDemoWorld('valley_of_echoes_demo');
    results.push(`✅ Generated Valley of Echoes demo`);
    results.push(`📊 Demo structure:`);
    results.push(`   - Nodes: ${demoWorld.nodes.size}`);
    results.push(`   - Characters: ${demoWorld.characters.size}`);
    results.push(`   - Interactions: ${demoWorld.interactions.length}`);

    // Step 2: Initialize simulation
    console.log('\nStep 2: Initializing simulation...');
    const simulationState = SimulationService.initialize(demoWorld);
    results.push(`✅ Simulation initialized`);
    results.push(`📊 Simulation state:`);
    results.push(`   - Nodes: ${simulationState.nodes.length}`);
    results.push(`   - Characters: ${simulationState.characters.length}`);
    results.push(`   - Interactions: ${simulationState.interactions.length}`);

    // Step 3: Check character assignments
    console.log('\nStep 3: Checking character interaction assignments...');
    let charactersWithInteractions = 0;
    simulationState.characters.forEach(character => {
      if (character.assignments?.interactions?.size > 0) {
        charactersWithInteractions++;
        console.log(`Character ${character.name} has ${character.assignments.interactions.size} interactions assigned`);
      }
    });
    results.push(`✅ ${charactersWithInteractions} characters have interaction assignments`);

    // Step 4: Check node content interactions
    console.log('\nStep 4: Checking node content interactions...');
    let nodesWithContentInteractions = 0;
    simulationState.nodes.forEach(node => {
      if (node.contentInteractions && node.contentInteractions.length > 0) {
        nodesWithContentInteractions++;
        console.log(`Node ${node.name} has ${node.contentInteractions.length} content interactions`);
        node.contentInteractions.forEach(interaction => {
          console.log(`  - ${interaction.name} (${interaction.id})`);
        });
      }
    });
    results.push(`✅ ${nodesWithContentInteractions} nodes have content interactions`);

    // Step 5: Test GenerateBehavior on hero characters
    console.log('\nStep 5: Testing GenerateBehavior on hero characters...');
    const heroCharacters = simulationState.characters.filter(char => char.lodTier === 'hero');
    results.push(`📊 Found ${heroCharacters.length} hero characters`);

    for (const character of heroCharacters) {
      console.log(`\nTesting GenerateBehavior for ${character.name}...`);
      const behavior = generateBehavior(character, simulationState);

      if (behavior) {
        results.push(`✅ ${character.name}: Generated behavior - ${behavior.interaction?.name || 'unknown'}`);
        if (behavior.resolution) {
          results.push(`   - Resolution: ${behavior.resolution.outcome}`);
        }
      } else {
        results.push(`❌ ${character.name}: No behavior generated`);
      }
    }

    // Step 6: Process a turn to see if interactions execute
    console.log('\nStep 6: Processing a turn...');
    const turnResult = SimulationService.processTurn();
    results.push(`✅ Turn processed successfully`);
    results.push(`📊 Turn result:`);
    results.push(`   - New time: ${turnResult.worldState.time}`);
    results.push(`   - Events: ${turnResult.worldState.events.length}`);

    // Check for interaction events
    const interactionEvents = turnResult.worldState.events.filter(event =>
      event.type === 'interaction' || event.interaction
    );
    results.push(`✅ ${interactionEvents.length} interaction events generated`);

    if (interactionEvents.length > 0) {
      interactionEvents.forEach(event => {
        results.push(`   - ${event.character?.name || 'Unknown'} performed ${event.interaction?.name || 'unknown interaction'}`);
      });
    }

  } catch (error) {
    results.push(`❌ Error during test: ${error.message}`);
    console.error('Full error:', error);
  }

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📋 VALLEY OF ECHOES CONTENT INTERACTIONS TEST RESULTS:');
  console.log('='.repeat(60));
  results.forEach(result => console.log(result));

  return results;
}

// Run the test
testValleyOfEchoesInteractions().then(() => {
  console.log('\n🎉 Valley of Echoes content interactions test completed!');
}).catch(error => {
  console.error('❌ Test failed:', error);
});