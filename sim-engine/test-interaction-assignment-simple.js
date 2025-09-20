/**
 * Simple Interaction Assignment Test
 *
 * Tests the core logic of assigning interactions to characters
 * without complex dependencies.
 */

/**
 * Creates sample system interactions for testing
 */
function createTestInteractions() {
  return [
    {
      id: 'wait_interaction',
      name: 'Wait',
      type: 'wait',
      requirements: { energy: 0 },
      branches: [{
        id: 'wait_success',
        name: 'Wait Successfully',
        conditions: [],
        effects: [{ type: 'energy', value: 10 }]
      }],
      effects: [],
      context: { duration: 1 }
    },
    {
      id: 'rest_interaction',
      name: 'Rest',
      type: 'rest',
      requirements: { energy: 20 },
      branches: [{
        id: 'rest_success',
        name: 'Rest Successfully',
        conditions: [],
        effects: [{ type: 'energy', value: 50 }]
      }],
      effects: [],
      context: { duration: 2 }
    },
    {
      id: 'examine_interaction',
      name: 'Examine',
      type: 'examine',
      requirements: { energy: 5 },
      branches: [{
        id: 'examine_success',
        name: 'Examine Successfully',
        conditions: [],
        effects: [{ type: 'knowledge', value: 10 }]
      }],
      effects: [],
      context: { targetType: 'environment' }
    }
  ];
}

/**
 * Creates sample characters for testing
 */
function createTestCharacters() {
  return [
    {
      id: 'hero_1',
      name: 'Test Hero',
      level: 3,
      lodTier: 'hero',
      assignments: {
        nodes: new Set(['node_1']),
        interactions: new Set(),
        settlements: new Set(),
        quests: new Set(),
        factions: new Set(),
        investments: new Set()
      }
    },
    {
      id: 'npc_1',
      name: 'Test NPC',
      level: 1,
      lodTier: 'background',
      assignments: {
        nodes: new Set(['node_1']),
        interactions: new Set(),
        settlements: new Set(),
        quests: new Set(),
        factions: new Set(),
        investments: new Set()
      }
    }
  ];
}

/**
 * Simplified interaction assignment logic (extracted from WorldBuilder)
 */
function assignInteractionsToCharacters(characters, interactions) {
  console.log('🎯 Assigning interactions to characters...');

  if (!interactions || interactions.length === 0) {
    console.warn('⚠️ No interactions available to assign');
    return characters;
  }

  return characters.map(character => {
    // Skip if character already has interaction assignments
    if (character.assignments?.interactions?.size > 0) {
      console.log(`Character ${character.name} already has ${character.assignments.interactions.size} interaction assignments`);
      return character;
    }

    // Initialize assignments.interactions if it doesn't exist
    if (!character.assignments) {
      character.assignments = {
        nodes: new Set(),
        interactions: new Set(),
        quests: new Set(),
        settlements: new Set(),
        factions: new Set(),
        investments: new Set()
      };
    }

    // Ensure assignments.interactions is a Set
    if (!character.assignments.interactions) {
      character.assignments.interactions = new Set();
    } else if (Array.isArray(character.assignments.interactions)) {
      character.assignments.interactions = new Set(character.assignments.interactions);
    }

    // Determine how many interactions to assign (1-3 based on character level/type)
    const maxAssignments = Math.min(3, Math.max(1, Math.floor(character.level / 2) || 1));
    const numToAssign = Math.min(maxAssignments, interactions.length);

    // Randomly select interactions to assign
    const shuffled = [...interactions].sort(() => 0.5 - Math.random());
    const selectedInteractions = shuffled.slice(0, numToAssign);

    // Assign interactions to character
    selectedInteractions.forEach(interaction => {
      character.assignments.interactions.add(interaction.id);
    });

    console.log(`Assigned ${selectedInteractions.length} interactions to character ${character.name}:`,
      selectedInteractions.map(i => i.name).join(', '));

    return character;
  });
}

/**
 * Simple test for interaction assignment
 */
function testInteractionAssignment() {
  console.log('🧪 Starting Simple Interaction Assignment Test...\n');

  try {
    // Create test data
    const testInteractions = createTestInteractions();
    const testCharacters = createTestCharacters();

    console.log('📋 Test Setup:');
    console.log(`   - ${testInteractions.length} interactions created`);
    console.log(`   - ${testCharacters.length} characters created`);
    console.log('');

    // Check initial state
    console.log('📊 Initial State:');
    testCharacters.forEach(char => {
      const interactionCount = char.assignments?.interactions?.size || 0;
      console.log(`   ${char.name}: ${interactionCount} interactions assigned`);
    });
    console.log('');

    // Assign interactions
    console.log('🎯 Assigning interactions to characters...');
    const charactersWithInteractions = assignInteractionsToCharacters(testCharacters, testInteractions);
    console.log('✅ Interaction assignment completed');
    console.log('');

    // Check final state
    console.log('📊 Final State:');
    let totalInteractionsAssigned = 0;

    charactersWithInteractions.forEach(char => {
      const interactionCount = char.assignments?.interactions?.size || 0;
      totalInteractionsAssigned += interactionCount;
      console.log(`   ${char.name}: ${interactionCount} interactions assigned`);

      // Show which interactions were assigned
      if (interactionCount > 0) {
        const interactionNames = Array.from(char.assignments.interactions)
          .map(interactionId => {
            const interaction = testInteractions.find(i => i.id === interactionId);
            return interaction ? interaction.name : interactionId;
          });
        console.log(`      └─ ${interactionNames.join(', ')}`);
      }
    });
    console.log('');

    // Test results
    console.log('🎉 Test Results:');
    console.log(`   Total interactions assigned: ${totalInteractionsAssigned}`);

    if (totalInteractionsAssigned > 0) {
      console.log('✅ SUCCESS: Interactions were successfully assigned to characters!');
      return true;
    } else {
      console.log('❌ FAILURE: No interactions were assigned to characters');
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run the test
const success = testInteractionAssignment();
console.log('');
console.log('🏁 Test completed!');

if (success) {
  console.log('🎊 All tests passed!');
  process.exit(0);
} else {
  console.log('💥 Test failed!');
  process.exit(1);
}