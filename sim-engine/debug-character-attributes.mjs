// Debug script to check character attribute initialization
import pkg from './src/domain/entities/Character.js';
const { Character } = pkg;

console.log('🔧 Testing Character Attribute Initialization');
console.log('==============================================');

// Test 1: Create a background character like DemoService does
console.log('1. Testing background character creation...');
const backgroundConfig = {
  id: 'test-merchants',
  name: 'Test Merchants',
  lodTier: 'background',
  populationGroupId: 'test-group',
  characterType: { typeId: 'background', category: 'npc' },
  baseAttributes: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  }
};

try {
  const backgroundChar = new Character(backgroundConfig);
  console.log(`✅ Background character created: ${backgroundChar.name}`);
  console.log(`   - Is Character instance: ${backgroundChar instanceof Character}`);
  console.log(`   - Has attributes: ${!!backgroundChar.attributes}`);
  console.log(`   - Attributes type: ${backgroundChar.attributes?.constructor?.name}`);
  console.log(`   - Has getTotalModifier: ${typeof backgroundChar.attributes?.getTotalModifier === 'function'}`);
  
  if (backgroundChar.attributes && typeof backgroundChar.attributes.getTotalModifier === 'function') {
    console.log(`   - Intelligence modifier: ${backgroundChar.attributes.getTotalModifier('intelligence')}`);
    console.log('🎉 Background character has proper attributes!');
  } else {
    console.log('❌ Background character missing proper attributes');
  }
} catch (error) {
  console.error('❌ Failed to create background character:', error);
}

// Test 2: Create a group character like DemoService does
console.log('\n2. Testing group character creation...');
const groupConfig = {
  id: 'test-group-char',
  name: 'Test Group Character',
  lodTier: 'group',
  populationGroupId: 'test-group',
  characterType: { typeId: 'group', category: 'npc' },
  baseAttributes: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  }
};

try {
  const groupChar = new Character(groupConfig);
  console.log(`✅ Group character created: ${groupChar.name}`);
  console.log(`   - Is Character instance: ${groupChar instanceof Character}`);
  console.log(`   - Has attributes: ${!!groupChar.attributes}`);
  console.log(`   - LOD Tier: ${groupChar.lodTier}`);
  
  if (groupChar.attributes && typeof groupChar.attributes.getTotalModifier === 'function') {
    console.log('⚠️  Group character unexpectedly has full attributes');
  } else {
    console.log('✅ Group character correctly has no full attributes (expected)');
  }
} catch (error) {
  console.error('❌ Failed to create group character:', error);
}

// Test 3: Test JSON serialization/deserialization
console.log('\n3. Testing JSON serialization...');
try {
  const testChar = new Character({
    name: 'Test JSON Character',
    baseAttributes: { intelligence: 12, wisdom: 14 }
  });
  
  const serialized = JSON.stringify(testChar);
  const deserialized = Character.fromJSON(JSON.parse(serialized));
  
  console.log(`✅ Serialization test: ${deserialized.name}`);
  console.log(`   - Has attributes after deserialization: ${!!deserialized.attributes}`);
  console.log(`   - Has getTotalModifier: ${typeof deserialized.attributes?.getTotalModifier === 'function'}`);
  
  if (deserialized.attributes && typeof deserialized.attributes.getTotalModifier === 'function') {
    console.log('🎉 JSON serialization preserves attributes!');
  } else {
    console.log('❌ JSON serialization corrupts attributes');
  }
} catch (error) {
  console.error('❌ JSON serialization test failed:', error);
}