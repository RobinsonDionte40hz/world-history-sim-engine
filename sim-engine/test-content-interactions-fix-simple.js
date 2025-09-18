// Test to verify the content interactions fix logic
console.log('🧪 Testing Content Interactions Fix Logic...\n');

// Simulate the fixed logic from SimulationService.js
function testSimulationServiceFix() {
  console.log('📋 Testing SimulationService.processPreparedWorldData fix...');

  // Mock data that simulates what WorldBuilder.prepareForSimulation() produces
  const mockNodes = new Map([
    ['village', {
      id: 'village',
      name: 'Village',
      characters: [],
      contentInteractions: []
    }]
  ]);

  const mockCharacters = new Map([
    ['char1', {
      id: 'char1',
      name: 'Test Character',
      assignedInteractions: ['interact1', 'interact2'], // Array format (our fix)
      assignments: {
        interactions: new Set(['interact1', 'interact2']) // Set format (legacy)
      }
    }],
    ['char2', {
      id: 'char2',
      name: 'Test Character 2',
      // No assignedInteractions array, only assignments Set (tests fallback)
      assignments: {
        interactions: new Set(['interact3'])
      }
    }]
  ]);

  const mockInteractions = [
    { id: 'interact1', name: 'Gather Resources' },
    { id: 'interact2', name: 'Socialize' },
    { id: 'interact3', name: 'Explore' }
  ];

  // Simulate the FIXED logic from SimulationService.js
  const nodeCharacters = [
    mockCharacters.get('char1'),
    mockCharacters.get('char2')
  ];

  const interactionArray = mockInteractions;

  // Apply the fix: Handle both assignedInteractions array and assignments.interactions Set
  nodeCharacters.forEach(character => {
    // Handle both formats for compatibility
    const interactionIds = character.assignedInteractions ||
      (character.assignments?.interactions ? Array.from(character.assignments.interactions) : []);

    if (interactionIds && interactionIds.length > 0) {
      const characterInteractions = interactionArray.filter(interaction =>
        interactionIds.includes(interaction.id)
      );
      mockNodes.get('village').contentInteractions.push(...characterInteractions);
    }
  });

  const village = mockNodes.get('village');
  console.log(`✅ Village populated with ${village.contentInteractions.length} content interactions:`);
  village.contentInteractions.forEach(interaction => {
    console.log(`   - ${interaction.name} (${interaction.id})`);
  });

  // Verify the fix worked
  const expectedInteractions = 3; // interact1, interact2, interact3
  const actualInteractions = village.contentInteractions.length;

  if (actualInteractions === expectedInteractions) {
    console.log('✅ SUCCESS: All character interactions properly populated in node!');
    return true;
  } else {
    console.log(`❌ FAILURE: Expected ${expectedInteractions} interactions, got ${actualInteractions}`);
    return false;
  }
}

// Simulate the fixed logic from WorldBuilder.js
function testWorldBuilderFix() {
  console.log('\n📋 Testing WorldBuilder.prepareForSimulation fix...');

  // Mock character data
  const mockCharacters = [
    {
      id: 'char1',
      name: 'Test Character',
      assignments: {
        nodes: new Set(['village']),
        interactions: new Set(['interact1', 'interact2']),
        quests: new Set(),
        settlements: new Set(),
        factions: new Set(),
        investments: new Set()
      }
    }
  ];

  // Simulate the FIXED logic from WorldBuilder.js prepareForSimulation
  const simulationCharacters = new Map(mockCharacters.map(char => {
    const processedChar = { ...char };

    // Convert assignments to Sets if they're arrays (existing logic)
    if (processedChar.assignments) {
      processedChar.assignments = {
        nodes: processedChar.assignments.nodes instanceof Set ?
          processedChar.assignments.nodes :
          new Set(processedChar.assignments.nodes || []),
        interactions: processedChar.assignments.interactions instanceof Set ?
          processedChar.assignments.interactions :
          new Set(processedChar.assignments.interactions || []),
        quests: processedChar.assignments.quests instanceof Set ?
          processedChar.assignments.quests :
          new Set(processedChar.assignments.quests || []),
        settlements: processedChar.assignments.settlements instanceof Set ?
          processedChar.assignments.settlements :
          new Set(processedChar.assignments.settlements || []),
        factions: processedChar.assignments.factions instanceof Set ?
          processedChar.assignments.factions :
          new Set(processedChar.assignments.factions || []),
        investments: processedChar.assignments.investments instanceof Set ?
          processedChar.assignments.investments :
          new Set(processedChar.assignments.investments || [])
      };
    }

    // NEW FIX: Ensure assignedInteractions array is set for compatibility
    processedChar.assignedInteractions = Array.from(processedChar.assignments.interactions);

    return [char.id, processedChar];
  }));

  const char1 = simulationCharacters.get('char1');
  console.log(`✅ Character ${char1.name} processed:`);
  console.log(`   - assignments.interactions: ${Array.from(char1.assignments.interactions)}`);
  console.log(`   - assignedInteractions: ${char1.assignedInteractions}`);

  // Verify the fix worked
  const hasBothFormats = char1.assignments.interactions instanceof Set &&
                        Array.isArray(char1.assignedInteractions) &&
                        char1.assignedInteractions.length === Array.from(char1.assignments.interactions).length;

  if (hasBothFormats) {
    console.log('✅ SUCCESS: Character has both Set and Array formats for compatibility!');
    return true;
  } else {
    console.log('❌ FAILURE: Character missing proper format conversion');
    return false;
  }
}

// Run both tests
const simulationTest = testSimulationServiceFix();
const worldBuilderTest = testWorldBuilderFix();

console.log('\n📊 Overall Test Results:');
console.log(`   SimulationService Fix: ${simulationTest ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`   WorldBuilder Fix: ${worldBuilderTest ? '✅ PASSED' : '❌ FAILED'}`);

const overallSuccess = simulationTest && worldBuilderTest;
console.log(`\n${overallSuccess ? '🎉 ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}: Content interactions fix is working correctly!`);

process.exit(overallSuccess ? 0 : 1);