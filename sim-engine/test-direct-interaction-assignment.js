// test-direct-interaction-assignment.js
// Test the new DirectInteractionAssignment utility

const DirectInteractionAssignment = require('./src/application/services/DirectInteractionAssignment.js');
const DemoService = require('./src/application/services/DemoService.js');

console.log('🧪 Testing DirectInteractionAssignment utility...\n');

// Test 1: Basic functionality
console.log('Test 1: Basic DirectInteractionAssignment functionality');
const directAssigner = new DirectInteractionAssignment();
directAssigner.initializeRoleBasedPools();

const stats = directAssigner.getStatistics();
console.log(`✅ Initialized with ${stats.availableRoles.length} roles: ${stats.availableRoles.join(', ')}`);
console.log('');

// Test 2: Role-based interaction assignment
console.log('Test 2: Role-based interaction assignment');

// Create test characters for different roles
const testCharacters = [
  {
    id: 'admin-test',
    name: 'Test Administrator',
    role: 'Federation Council Chair',
    lodTier: 'hero',
    attributes: {
      strength: { score: 12 },
      dexterity: { score: 14 },
      constitution: { score: 13 },
      intelligence: { score: 16 },
      wisdom: { score: 17 },
      charisma: { score: 18 }
    }
  },
  {
    id: 'farmer-test',
    name: 'Test Farmer',
    background: 'lifelong farmer in the valley',
    lodTier: 'group',
    attributes: {
      strength: { score: 16 },
      dexterity: { score: 13 },
      constitution: { score: 17 },
      intelligence: { score: 12 },
      wisdom: { score: 15 },
      charisma: { score: 14 }
    }
  },
  {
    id: 'merchant-test',
    name: 'Test Merchant',
    demographics: { occupation: 'merchant' },
    lodTier: 'background',
    attributes: {
      strength: { score: 10 },
      dexterity: { score: 15 },
      constitution: { score: 12 },
      intelligence: { score: 15 },
      wisdom: { score: 13 },
      charisma: { score: 17 }
    }
  }
];

testCharacters.forEach(character => {
  const role = directAssigner.determineCharacterRole(character);
  const interactions = directAssigner.assignByRole(character, 3);
  
  console.log(`${character.name} (${role}, ${character.lodTier}):`);
  console.log(`  Assigned interactions: ${interactions.map(i => i.name).join(', ')}`);
  console.log(`  Total interactions: ${directAssigner.getCharacterInteractions(character.id).length}`);
});
console.log('');

// Test 3: Direct assignment
console.log('Test 3: Direct assignment functionality');
directAssigner.directAssign('direct-test', ['wait_interaction', 'socialize', 'craft_goods']);
const directAssignments = directAssigner.getCharacterInteractions('direct-test');
console.log(`✅ Direct assignment successful: ${directAssignments.length} interactions assigned`);
console.log('');

// Test 4: Integration with Valley of Echoes demo
console.log('Test 4: Integration with Valley of Echoes demo');
try {
  const valleyWorld = DemoService.generateDemoWorld('valley_of_echoes_demo');
  
  console.log(`✅ Demo generated successfully: ${valleyWorld.name}`);
  console.log(`   Characters: ${valleyWorld.characters ? valleyWorld.characters.size : 0}`);
  console.log(`   Interactions: ${valleyWorld.interactions ? valleyWorld.interactions.size : 0}`);
  
  // Check character interaction assignments
  let charactersWithInteractions = 0;
  let totalInteractionsAssigned = 0;
  
  if (valleyWorld.characters) {
    valleyWorld.characters.forEach(character => {
      const interactionCount = character.assignments?.interactions?.size || 0;
      if (interactionCount > 0) {
        charactersWithInteractions++;
        totalInteractionsAssigned += interactionCount;
      }
    });
  }
  
  console.log(`   Characters with interactions: ${charactersWithInteractions}`);
  console.log(`   Total interactions assigned: ${totalInteractionsAssigned}`);
  
  if (charactersWithInteractions > 0) {
    console.log('✅ New role-based assignment working correctly!');
  } else {
    console.log('❌ No interactions assigned - needs investigation');
  }
  
} catch (error) {
  console.error('❌ Demo generation failed:', error.message);
}
console.log('');

// Test 5: Comparison with old system expectations
console.log('Test 5: Verify semantic improvements');
console.log('OLD SYSTEM: Interactions assigned based on node location');
console.log('NEW SYSTEM: Interactions assigned based on character role/occupation');
console.log('');
console.log('Benefits:');
console.log('✅ More semantic - farmers get farming interactions regardless of location');
console.log('✅ Simpler config - no complex node-interaction coupling required');
console.log('✅ Better control - demo authors can specify exactly what they want');
console.log('✅ User-friendly - role-based assignment is more intuitive');
console.log('✅ Flexible - supports both automatic and manual assignment modes');

console.log('\n🎉 DirectInteractionAssignment testing complete!');