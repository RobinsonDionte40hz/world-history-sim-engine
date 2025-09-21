// Simple test to verify value object fixes
import { Character } from './src/domain/entities/Character.js';

console.log('🔧 Testing Value Object Deserialization Fixes\n');

// Test data that simulates what might be in corrupted localStorage
const testCharacterData = {
  id: 'test-character',
  name: 'Test Character',
  description: 'A test character for verification',
  
  // These value objects might have empty or missing configuration
  alignment: {},  // Missing axes
  influence: {},  // Missing domains  
  prestige: {},   // Missing tracks
  racialTraits: {}, // Missing raceId
  
  // Basic required fields
  baseAttributes: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  },
  level: 1,
  experience: 0
};

console.log('📋 Testing Character.fromJSON with empty value objects...');

try {
  const character = Character.fromJSON(testCharacterData);
  
  console.log('✅ Character deserialization successful!');
  console.log(`   - Name: ${character.name}`);
  console.log(`   - Alignment axes: ${character.alignment?.axes?.length || 0}`);
  console.log(`   - Influence domains: ${character.influence?.domains?.length || 0}`);
  console.log(`   - Prestige tracks: ${character.prestige?.tracks?.length || 0}`);
  console.log(`   - Race: ${character.racialTraits?.raceId || 'unknown'}`);
  
  // Test serialization round-trip
  const serialized = character.toJSON();
  const restored = Character.fromJSON(serialized);
  
  console.log('✅ Round-trip serialization successful!');
  console.log(`   - Restored name: ${restored.name}`);
  
} catch (error) {
  console.log('❌ Character deserialization failed:', error.message);
  console.log('   Stack:', error.stack);
}

console.log('\n🎉 Value object fix verification completed!');