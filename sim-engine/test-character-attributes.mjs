// Test character attribute initialization
import { Character } from './src/domain/entities/Character.js';

console.log('🔧 Testing Character Attribute Initialization\n');

// Test data that simulates what might be in corrupted localStorage
const testCharacterData = {
  id: 'test-character',
  name: 'Test Character',
  description: 'A test character for verification',
  
  // Missing attributes and skills data
  // baseAttributes: missing
  // attributes: missing
  // baseSkills: missing
  
  level: 1,
  experience: 0
};

console.log('📋 Testing Character.fromJSON with missing attributes...');

try {
  const character = Character.fromJSON(testCharacterData);
  
  console.log('✅ Character deserialization successful!');
  console.log(`   - Name: ${character.name}`);
  console.log(`   - Has baseAttributes: ${!!character.baseAttributes}`);
  console.log(`   - Has attributes: ${!!character.attributes}`);
  console.log(`   - Attributes type: ${character.attributes?.constructor?.name || 'undefined'}`);
  
  if (character.attributes) {
    console.log(`   - Has getTotalModifier method: ${typeof character.attributes.getTotalModifier === 'function'}`);
    console.log(`   - Strength modifier: ${character.attributes.getTotalModifier('strength')}`);
    console.log(`   - Intelligence modifier: ${character.attributes.getTotalModifier('intelligence')}`);
  }
  
  if (character.baseAttributes) {
    console.log(`   - Base strength: ${character.baseAttributes.strength}`);
    console.log(`   - Base intelligence: ${character.baseAttributes.intelligence}`);
  }
  
} catch (error) {
  console.log('❌ Character deserialization failed:', error.message);
  console.log('   Stack:', error.stack);
}

// Test with completely empty data
console.log('\n📋 Testing Character.fromJSON with completely empty data...');

try {
  const character2 = Character.fromJSON({});
  
  console.log('✅ Empty character deserialization successful!');
  console.log(`   - Has attributes: ${!!character2.attributes}`);
  console.log(`   - Attributes type: ${character2.attributes?.constructor?.name || 'undefined'}`);
  
  if (character2.attributes) {
    console.log(`   - Has getTotalModifier method: ${typeof character2.attributes.getTotalModifier === 'function'}`);
  }
  
} catch (error) {
  console.log('❌ Empty character deserialization failed:', error.message);
}

console.log('\n🎉 Character attribute initialization test completed!');