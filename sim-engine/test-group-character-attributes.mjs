// Test to verify character attribute fixes
import Character from './src/domain/entities/Character.js';

console.log('🔧 Testing Character Attribute Fixes\n');

// Simulate how DemoService creates group characters
const groupCharacterConfig = {
  id: 'test-group',
  name: 'Test Farmers',
  lodTier: 'group',
  populationGroupId: 'test-group',
  characterType: { typeId: 'group', category: 'npc' },
  demographics: {
    ageGroup: 'adult',
    occupation: 'farmer',
    economicClass: 'working'
  },
  groupStatistics: {
    morale: 0.85,
    productivity: 0.9,
    loyalty: 0.9
  },
  assignments: {
    nodes: new Set(['test-node']),
    interactions: new Set(),
    settlements: new Set(['test-settlement'])
  },
  currentNodeId: 'test-node',
  background: 'Population group representing 45 test farmers',
  // Add default attributes for group characters
  baseAttributes: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  }
};

console.log('📋 Testing group character creation...');

try {
  const groupCharacter = new Character(groupCharacterConfig);
  
  console.log('✅ Group character creation successful!');
  console.log(`   - Name: ${groupCharacter.name}`);
  console.log(`   - LOD Tier: ${groupCharacter.lodTier}`);
  console.log(`   - Has attributes: ${!!groupCharacter.attributes}`);
  console.log(`   - Attributes type: ${groupCharacter.attributes?.constructor?.name || 'undefined'}`);
  
  if (groupCharacter.attributes) {
    console.log(`   - Has getTotalModifier method: ${typeof groupCharacter.attributes.getTotalModifier === 'function'}`);
    console.log(`   - Strength modifier: ${groupCharacter.attributes.getTotalModifier('strength')}`);
    console.log(`   - Intelligence modifier: ${groupCharacter.attributes.getTotalModifier('intelligence')}`);
  }
  
  // Test serialization round-trip to simulate RunTick.js behavior
  console.log('\n📋 Testing serialization round-trip...');
  const serialized = groupCharacter.toJSON();
  const restored = Character.fromJSON(serialized);
  
  console.log('✅ Serialization round-trip successful!');
  console.log(`   - Restored has attributes: ${!!restored.attributes}`);
  
  if (restored.attributes) {
    console.log(`   - Restored has getTotalModifier method: ${typeof restored.attributes.getTotalModifier === 'function'}`);
    console.log(`   - Restored strength modifier: ${restored.attributes.getTotalModifier('strength')}`);
  }
  
} catch (error) {
  console.log('❌ Group character test failed:', error.message);
  console.log('   Stack:', error.stack);
}

console.log('\n🎉 Character attribute fixes test completed!');