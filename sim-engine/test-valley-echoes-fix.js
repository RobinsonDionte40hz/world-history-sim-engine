const DemoService = require('./src/application/services/DemoService.js');

const testValleyOfEchoes = () => {
  console.log('🧪 Testing Valley of Echoes Demo Data Processing\n');

  // Generate the demo world
  const demoWorld = DemoService.generateDemoWorld('fantasy_village_demo');

  console.log('📊 Demo World Structure:');
  console.log(`  - Nodes: ${demoWorld.nodes.size}`);
  console.log(`  - Characters: ${demoWorld.characters.size}`);
  console.log(`  - Interactions: ${demoWorld.interactions.size}\n`);

  // Check character assignments
  console.log('👥 Character Interaction Assignments:');
  demoWorld.characters.forEach((character, id) => {
    console.log(`\n  ${character.name} (${id}):`);

    // Check both assignment formats
    const setAssignments = character.assignments?.interactions ?
      Array.from(character.assignments.interactions) : [];
    const arrayAssignments = character.assignedInteractions || [];

    console.log(`    - assignments.interactions: ${setAssignments.length} items`);
    console.log(`      ${setAssignments.join(', ') || '(none)'}`);
    console.log(`    - assignedInteractions: ${arrayAssignments.length} items`);
    console.log(`      ${arrayAssignments.join(', ') || '(none)'}`);
  });

  console.log('\n🎯 Interaction Character Assignments:');
  demoWorld.interactions.forEach((interaction, id) => {
    if (interaction.assignedCharacterIds) {
      console.log(`  ${interaction.name}: ${interaction.assignedCharacterIds.join(', ')}`);
    }
  });

  // Test if interactions appear in nodes after simulation prep
  console.log('\n🔄 Simulating Node Content Population...');

  // This would happen in SimulationService.processPreparedWorldData
  demoWorld.nodes.forEach((node, nodeId) => {
    node.contentInteractions = [];

    // Find characters at this node
    const nodeCharacters = Array.from(demoWorld.characters.values()).filter(char =>
      char.currentNodeId === nodeId
    );

    // Collect interactions from characters
    nodeCharacters.forEach(character => {
      const interactionIds = character.assignedInteractions ||
        (character.assignments?.interactions ? Array.from(character.assignments.interactions) : []);

      interactionIds.forEach(intId => {
        const interaction = demoWorld.interactions.get(intId);
        if (interaction && !node.contentInteractions.some(i => i.id === intId)) {
          node.contentInteractions.push(interaction);
        }
      });
    });

    console.log(`  ${node.name}: ${node.contentInteractions.length} content interactions`);
  });

  const success = Array.from(demoWorld.nodes.values()).some(n => n.contentInteractions.length > 0);
  console.log(`\n✅ Test ${success ? 'PASSED' : 'FAILED'}: Interactions ${success ? 'are' : 'are NOT'} properly assigned`);
};

testValleyOfEchoes();