// Test to verify the content interactions fix in Valley of Echoes demo
const DemoService = require('./src/application/services/DemoService.js');
const WorldBuilder = require('./src/domain/services/WorldBuilder.js');

console.log('🧪 Testing Content Interactions Fix in Valley of Echoes Demo...\n');

try {
  // Generate the Valley of Echoes demo
  console.log('📦 Generating Valley of Echoes demo...');
  const demo = DemoService.generateDemoWorld('valley_of_echoes_demo');
  console.log('✅ Demo generated successfully!');

  // Create WorldBuilder and add the demo data
  console.log('🏗️ Building world from demo data...');
  const worldBuilder = new WorldBuilder();

  // Add nodes from demo
  demo.nodes.forEach((node, nodeId) => {
    worldBuilder.addNode({
      id: nodeId,
      name: node.name,
      type: node.type,
      environmentalProperties: node.environmentalProperties || {},
      culturalContext: node.culturalContext || {},
      resourceAvailability: node.resourceAvailability || {}
    });
  });

  // Add interactions from demo
  demo.interactions.forEach((interaction, interactionId) => {
    worldBuilder.addInteraction({
      id: interactionId,
      name: interaction.name,
      category: interaction.category,
      description: interaction.description || '',
      prerequisites: interaction.prerequisites || {},
      effects: interaction.effects || {}
    });
  });

  // Add characters from demo
  demo.characters.forEach((character, charId) => {
    const charConfig = {
      id: charId,
      name: character.name,
      characterTypeId: character.characterType?.typeId || 'generic',
      level: character.level || 1,
      age: character.age || 25,
      health: character.health || 100,
      attributes: character.attributes || {},
      personality: character.personality || {},
      consciousness: character.consciousness || {},
      assignedInteractions: character.assignedInteractions || []
    };

    // Add character to world
    worldBuilder.addCharacter(charConfig);

    // Assign character to their node
    if (character.currentNodeId) {
      worldBuilder.assignCharacterToNode(charId, character.currentNodeId);
    }
  });

  console.log('✅ World built successfully!');

  // Prepare for simulation (this is where our fix is applied)
  console.log('🚀 Preparing world for simulation...');
  const simulationData = worldBuilder.prepareForSimulation();
  console.log('✅ World prepared for simulation!');

  // Verify that content interactions are populated in nodes
  console.log('\n🔍 Verifying content interactions population...');

  let totalContentInteractions = 0;
  let nodesWithInteractions = 0;

  simulationData.nodes.forEach((node, nodeId) => {
    const contentInteractionCount = node.contentInteractions ? node.contentInteractions.length : 0;
    totalContentInteractions += contentInteractionCount;

    if (contentInteractionCount > 0) {
      nodesWithInteractions++;
      console.log(`📍 Node: ${node.name} (${nodeId})`);
      console.log(`   - Characters: ${node.characters ? node.characters.length : 0}`);
      console.log(`   - Content Interactions: ${contentInteractionCount}`);

      if (node.contentInteractions && node.contentInteractions.length > 0) {
        node.contentInteractions.forEach(interaction => {
          console.log(`     * ${interaction.name} (${interaction.id}) - ${interaction.category}`);
        });
      }
      console.log('');
    }
  });

  console.log('📊 Summary:');
  console.log(`   - Total nodes: ${simulationData.nodes.size}`);
  console.log(`   - Nodes with content interactions: ${nodesWithInteractions}`);
  console.log(`   - Total content interactions: ${totalContentInteractions}`);
  console.log(`   - Hero characters: ${Array.from(simulationData.characters.values()).filter(c => c.lodTier === 'hero').length}`);

  // Verify the fix worked
  const success = totalContentInteractions > 0 && nodesWithInteractions > 0;

  if (success) {
    console.log('\n🎉 SUCCESS: Content interactions are properly populated in nodes!');
    console.log('✅ The property name mismatch fix is working correctly.');
  } else {
    console.log('\n❌ FAILURE: No content interactions found in nodes.');
    console.log('❌ The fix may not be working properly.');
    process.exit(1);
  }

  // Additional verification: Check that hero characters have their assigned interactions
  console.log('\n👥 Verifying hero character interactions...');
  const heroCharacters = Array.from(simulationData.characters.values())
    .filter(c => c.lodTier === 'hero');

  heroCharacters.forEach(hero => {
    const interactionIds = hero.assignedInteractions || [];
    console.log(`   - ${hero.name}: ${interactionIds.length} assigned interactions`);
    if (interactionIds.length > 0) {
      interactionIds.forEach(interactionId => {
        const interaction = simulationData.interactions.get(interactionId);
        if (interaction) {
          console.log(`     * ${interaction.name} (${interactionId})`);
        }
      });
    }
  });

  console.log('\n✅ All verifications completed successfully!');

} catch (error) {
  console.error('❌ Error during test:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}