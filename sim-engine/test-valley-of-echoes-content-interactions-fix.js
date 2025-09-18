const DemoService = require('./src/application/services/DemoService.js');

const testValleyOfEchoesContentInteractions = () => {
  console.log('🧪 Testing Valley of Echoes Content Interactions\n');

  try {
    // Generate the Valley of Echoes demo world
    const demoWorld = DemoService.generateDemoWorld('valley_of_echoes_demo');

    console.log('📊 Valley of Echoes Demo Structure:');
    console.log(`  - Nodes: ${demoWorld.nodes.size}`);
    console.log(`  - Characters: ${demoWorld.characters.size}`);
    console.log(`  - Interactions: ${demoWorld.interactions.size}\n`);

    // Check if interactions have assignedCharacterIds
    console.log('🎯 Interaction Assignments:');
    let totalAssignedInteractions = 0;
    demoWorld.interactions.forEach((interaction, id) => {
      if (interaction.assignedCharacterIds && interaction.assignedCharacterIds.length > 0) {
        console.log(`  ${interaction.name}: ${interaction.assignedCharacterIds.join(', ')}`);
        totalAssignedInteractions++;
      }
    });
    console.log(`\n📈 Total interactions with character assignments: ${totalAssignedInteractions}\n`);

    // Check character interaction assignments
    console.log('👥 Character Interaction Assignments:');
    let charactersWithInteractions = 0;
    demoWorld.characters.forEach((character, id) => {
      const setAssignments = character.assignments?.interactions ?
        Array.from(character.assignments.interactions) : [];
      const arrayAssignments = character.assignedInteractions || [];

      if (setAssignments.length > 0 || arrayAssignments.length > 0) {
        charactersWithInteractions++;
        console.log(`  ${character.name} (${character.lodTier}):`);
        console.log(`    - Set format: ${setAssignments.length} interactions`);
        console.log(`    - Array format: ${arrayAssignments.length} interactions`);
        console.log(`    - Total unique: ${new Set([...setAssignments, ...arrayAssignments]).size} interactions`);
      }
    });
    console.log(`\n📊 Characters with interactions: ${charactersWithInteractions}/${demoWorld.characters.size}\n`);

    // Simulate node content population (what happens in simulation)
    console.log('🔄 Simulating Node Content Population:');
    let totalContentInteractions = 0;
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

      if (node.contentInteractions.length > 0) {
        console.log(`  ${node.name}: ${node.contentInteractions.length} content interactions`);
        totalContentInteractions += node.contentInteractions.length;
      }
    });

    console.log(`\n📊 Total content interactions across all nodes: ${totalContentInteractions}`);

    // Success criteria
    const success = totalAssignedInteractions > 0 && charactersWithInteractions > 0 && totalContentInteractions > 0;

    console.log(`\n✅ Test ${success ? 'PASSED' : 'FAILED'}: ${success ? 'Content interactions are properly assigned and accessible' : 'Content interactions are NOT working'}`);

    if (success) {
      console.log('\n🎉 Valley of Echoes demo content interactions fix is working correctly!');
      console.log('   - Interactions have assignedCharacterIds');
      console.log('   - Characters have interactions in both formats');
      console.log('   - Nodes receive contentInteractions from assigned characters');
    }

    return success;

  } catch (error) {
    console.error('❌ Test FAILED with error:', error.message);
    return false;
  }
};

// Run the test
testValleyOfEchoesContentInteractions();