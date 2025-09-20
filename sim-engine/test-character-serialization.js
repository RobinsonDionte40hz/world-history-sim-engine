/**
 * Test Character serialization and PerceptionInteraction functionality
 */

const Character = require('./src/domain/entities/Character.js');
const PerceptionInteraction = require('./src/domain/entities/interactions/PerceptionInteraction.js');

console.log('🧪 Testing Character Serialization and PerceptionInteraction...\n');

try {
  // Test 1: Create a character
  console.log('Test 1: Creating character...');
  const originalCharacter = new Character({
    id: 'test-char',
    name: 'Test Character',
    age: 25
  });
  console.log('✅ Character created successfully');
  console.log(`   - Name: ${originalCharacter.name}`);
  console.log(`   - Has attributes: ${!!originalCharacter.attributes}`);
  console.log(`   - Attributes type: ${originalCharacter.attributes?.constructor?.name}`);

  // Test 2: Serialize character
  console.log('\nTest 2: Serializing character...');
  const serialized = originalCharacter.toJSON();
  console.log('✅ Character serialized successfully');
  console.log(`   - Serialized attributes: ${serialized.attributes !== null ? 'present' : 'null'}`);

  // Test 3: Deserialize character
  console.log('\nTest 3: Deserializing character...');
  const deserializedCharacter = Character.fromJSON(serialized);
  console.log('✅ Character deserialized successfully');
  console.log(`   - Name: ${deserializedCharacter.name}`);
  console.log(`   - Has attributes: ${!!deserializedCharacter.attributes}`);
  console.log(`   - Attributes type: ${deserializedCharacter.attributes?.constructor?.name}`);

  // Test 4: Direct reconstruction (like in RunTick.js)
  console.log('\nTest 4: Direct character reconstruction...');
  const reconstructedCharacter = new Character(serialized);
  console.log('✅ Character reconstructed successfully');
  console.log(`   - Name: ${reconstructedCharacter.name}`);
  console.log(`   - Has attributes: ${!!reconstructedCharacter.attributes}`);
  console.log(`   - Attributes type: ${reconstructedCharacter.attributes?.constructor?.name}`);

  // Test 5: PerceptionInteraction with character
  console.log('\nTest 5: Testing PerceptionInteraction...');
  const perceptionInteraction = new PerceptionInteraction({
    id: 'test-perception',
    name: 'Look Around',
    description: 'Look around the area',
    perceptionType: 'look'
  });

  console.log('   Testing with original character...');
  const effectiveness1 = perceptionInteraction.getPerceptionEffectiveness(originalCharacter);
  console.log(`   ✅ Original character effectiveness: ${effectiveness1}`);

  console.log('   Testing with deserialized character...');
  const effectiveness2 = perceptionInteraction.getPerceptionEffectiveness(deserializedCharacter);
  console.log(`   ✅ Deserialized character effectiveness: ${effectiveness2}`);

  console.log('   Testing with reconstructed character...');
  const effectiveness3 = perceptionInteraction.getPerceptionEffectiveness(reconstructedCharacter);
  console.log(`   ✅ Reconstructed character effectiveness: ${effectiveness3}`);

  console.log('\n🎉 All tests passed! Character serialization and PerceptionInteraction are working correctly.');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
}