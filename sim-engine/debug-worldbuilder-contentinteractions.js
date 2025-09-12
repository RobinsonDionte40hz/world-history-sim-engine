// Debug WorldBuilder ContentInteractions Population
// Test the actual WorldBuilder.js to see why contentInteractions aren't being populated
// Using dynamic import to work with ES modules

async function debugWorldBuilder() {
  console.log('🔍 Debugging WorldBuilder contentInteractions population...\n');

  try {
    // Dynamic import to handle ES modules
    const { default: WorldBuilder } = await import('./src/domain/services/WorldBuilder.js');

    // Create a real WorldBuilder instance
    const worldBuilder = new WorldBuilder();

    // Set up world foundation
    worldBuilder.setWorldProperties('Test World', 'A test world for debugging');
    worldBuilder.setRules({ timeProgression: 'standard' });
    worldBuilder.setInitialConditions({ season: 'spring' });

    console.log('✓ World foundation set up');

    // Add nodes
    worldBuilder.addNode({
      id: 'village',
      name: 'Oakwood Village',
      type: 'settlement',
      description: 'A peaceful village surrounded by forests',
      environment: { climate: 'temperate', terrain: 'plains' },
      size: 100,
      population: 50
    });

    worldBuilder.addNode({
      id: 'forest',
      name: 'Darkwood Forest',
      type: 'wilderness',
      description: 'A dense forest with hidden dangers',
      environment: { climate: 'temperate', terrain: 'forest' },
      size: 200,
      population: 0
    });

    console.log('✓ Nodes added');

    // Add interactions
    worldBuilder.addInteraction({
      id: 'work',
      name: 'Work',
      type: 'economic',
      description: 'Perform daily work to earn resources',
      requirements: { energy: 20 },
      branches: [{ id: 'success', description: 'Work completed successfully' }],
      effects: { gold: 5, energy: -10 },
      context: ['settlement']
    });

    worldBuilder.addInteraction({
      id: 'explore',
      name: 'Explore',
      type: 'exploration',
      description: 'Explore the surrounding area',
      requirements: { energy: 15 },
      branches: [{ id: 'success', description: 'Found something interesting' }],
      effects: { experience: 2, energy: -8 },
      context: ['wilderness', 'settlement']
    });

    console.log('✓ Interactions added');

    // Add characters
    worldBuilder.addCharacter({
      id: 'alice',
      name: 'Alice',
      age: 28,
      level: 2,
      attributes: { strength: 12, dexterity: 14, constitution: 13, intelligence: 10, wisdom: 11, charisma: 15 },
      assignedInteractions: [],
      currentNodeId: null,
      energy: 80,
      health: 100,
      mood: 70
    });

    worldBuilder.addCharacter({
      id: 'bob',
      name: 'Bob',
      age: 35,
      level: 3,
      attributes: { strength: 15, dexterity: 10, constitution: 16, intelligence: 8, wisdom: 12, charisma: 9 },
      assignedInteractions: [],
      currentNodeId: null,
      energy: 60,
      health: 100,
      mood: 60
    });

    console.log('✓ Characters added');

    // Assign characters to nodes
    worldBuilder.assignCharacterToNode('alice', 'village');
    worldBuilder.assignCharacterToNode('bob', 'forest');

    console.log('✓ Characters assigned to nodes');

    // Check current state before auto-assignment
    console.log('\n📊 State before auto-assignment:');
    worldBuilder.worldConfig.characters.forEach(char => {
      console.log(`  - ${char.name}: assignedInteractions = ${JSON.stringify(char.assignedInteractions)}`);
    });

    console.log('\n🔧 Running autoAssignInteractionsToCharacters...');
    worldBuilder.autoAssignInteractionsToCharacters();

    // Check state after auto-assignment
    console.log('\n📊 State after auto-assignment:');
    worldBuilder.worldConfig.characters.forEach(char => {
      console.log(`  - ${char.name}: assignedInteractions = ${JSON.stringify(char.assignedInteractions)}`);
    });

    // Check node populations
    console.log('\n📊 Node populations:');
    Object.entries(worldBuilder.worldConfig.nodePopulations).forEach(([nodeId, characterIds]) => {
      console.log(`  - ${nodeId}: ${JSON.stringify(characterIds)}`);
    });

    // Now prepare for simulation
    console.log('\n🚀 Preparing for simulation...');
    const preparedWorldData = worldBuilder.prepareForSimulation();

    console.log('\n📊 Prepared world data:');
    console.log(`  - Nodes: ${preparedWorldData.nodes.size}`);
    console.log(`  - Characters: ${preparedWorldData.characters.size}`);
    console.log(`  - Interactions: ${preparedWorldData.interactions.size}`);

    // Check character assignments in prepared data
    console.log('\n📊 Character assignments in prepared data:');
    preparedWorldData.characters.forEach((character, charId) => {
      console.log(`  - ${character.name} (${charId}): assignedInteractions = ${JSON.stringify(character.assignedInteractions)}`);
    });

    // Check node contentInteractions in prepared data
    console.log('\n📊 Node contentInteractions in prepared data:');
    preparedWorldData.nodes.forEach((node, nodeId) => {
      console.log(`  - ${node.name} (${nodeId}): contentInteractions = ${node.contentInteractions.length} items`);
      node.contentInteractions.forEach(interaction => {
        console.log(`    * ${interaction.name} (${interaction.id})`);
      });
    });

    // Debug the population logic step by step
    console.log('\n🔍 Debugging population logic:');
    preparedWorldData.nodes.forEach((node, nodeId) => {
      console.log(`\nNode: ${node.name} (${nodeId})`);

      // Get character IDs for this node from original nodePopulations
      const characterIds = worldBuilder.worldConfig.nodePopulations[nodeId] || [];
      console.log(`  Character IDs: ${JSON.stringify(characterIds)}`);

      characterIds.forEach(characterId => {
        const character = preparedWorldData.characters.get(characterId);
        console.log(`  Character ${characterId}: ${character ? character.name : 'NOT FOUND'}`);
        if (character) {
          console.log(`    assignedInteractions: ${JSON.stringify(character.assignedInteractions)}`);
          if (character.assignedInteractions && character.assignedInteractions.length > 0) {
            character.assignedInteractions.forEach(interactionId => {
              const interaction = preparedWorldData.interactions.get(interactionId);
              console.log(`    Interaction ${interactionId}: ${interaction ? interaction.name : 'NOT FOUND'}`);
            });
          }
        }
      });
    });

    console.log('\n✨ Debug complete!');

  } catch (error) {
    console.error('❌ Error during debugging:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the debug function
debugWorldBuilder();