// Simple test to check contentInteractions population
const testContentInteractions = () => {
  console.log('🔍 Testing contentInteractions population...\n');

  // Mock data similar to what WorldBuilder would create
  const mockWorld = {
    nodes: [
      {
        id: 'village',
        name: 'Village',
        type: 'settlement',
        characters: [],
        contentInteractions: []
      }
    ],
    characters: [
      {
        id: 'char1',
        name: 'Test Character',
        currentNodeId: 'village',
        assignments: {
          nodes: new Set(['village']),
          interactions: new Set(['interact1', 'interact2']),
          quests: new Set(),
          settlements: new Set(),
          factions: new Set(),
          investments: new Set()
        }
      }
    ],
    interactions: [
      { id: 'interact1', name: 'Gather Resources', type: 'economic' },
      { id: 'interact2', name: 'Socialize', type: 'social' },
      { id: 'interact3', name: 'Explore', type: 'exploration' }
    ]
  };

  console.log('📊 Initial state:');
  console.log(`  - Node: ${mockWorld.nodes[0].name} (${mockWorld.nodes[0].id})`);
  console.log(`  - Characters: ${mockWorld.characters.length}`);
  console.log(`  - Interactions: ${mockWorld.interactions.length}`);
  console.log(`  - Character assignments:`, Array.from(mockWorld.characters[0].assignments.interactions));

  // Simulate WorldBuilder.prepareForSimulation() logic
  const simulationNodes = new Map(mockWorld.nodes.map(node => [node.id, { ...node, characters: [], contentInteractions: [] }]));
  const simulationCharacters = new Map(mockWorld.characters.map(char => [char.id, char]));
  const simulationInteractions = new Map(mockWorld.interactions.map(i => [i.id, i]));

  // Populate nodes with character references and content interactions
  for (const [nodeId, characterIds] of Object.entries({ village: ['char1'] })) {
    const node = simulationNodes.get(nodeId);
    if (node) {
      const characterIdArray = Array.isArray(characterIds) ? characterIds : [];

      // Add character references
      node.characters = characterIdArray
        .map(id => simulationCharacters.get(id))
        .filter(Boolean);

      // Populate contentInteractions from assigned characters
      node.contentInteractions = [];

      // Find all characters assigned to this node
      characterIdArray.forEach(characterId => {
        const character = simulationCharacters.get(characterId);
        if (character && character.assignments?.interactions) {
          let interactionIds = [];

          if (character.assignments.interactions instanceof Set) {
            interactionIds = Array.from(character.assignments.interactions);
          } else if (Array.isArray(character.assignments.interactions)) {
            interactionIds = character.assignments.interactions;
          }

          // Get the actual interaction objects
          const characterInteractions = interactionIds
            .map(interactionId => simulationInteractions.get(interactionId))
            .filter(Boolean);

          // Add to node's content interactions (avoid duplicates)
          characterInteractions.forEach(interaction => {
            if (interaction && interaction.id && !node.contentInteractions.some(existing => existing && existing.id === interaction.id)) {
              node.contentInteractions.push(interaction);
            }
          });
        }
      });

      console.log(`\n✅ Node ${nodeId} populated:`);
      console.log(`  - Characters: ${node.characters.length}`);
      console.log(`  - Content interactions: ${node.contentInteractions.length}`);
      node.contentInteractions.forEach(interaction => {
        console.log(`    * ${interaction.name} (${interaction.id})`);
      });
    }
  }

  // Convert back to array format (like formatWorldStateForDashboard does)
  const arrayNodes = Array.from(simulationNodes.values());

  console.log('\n📊 After conversion to array format:');
  arrayNodes.forEach(node => {
    console.log(`  - ${node.name} (${node.id}): ${node.contentInteractions.length} content interactions`);
    node.contentInteractions.forEach(interaction => {
      console.log(`    * ${interaction.name} (${interaction.id})`);
    });
  });

  return arrayNodes;
};

// Run the test
testContentInteractions();
console.log('\n🎯 Test completed successfully!');