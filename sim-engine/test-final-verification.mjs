// Test to verify our character instance fixes are working
import { Character } from './src/domain/entities/Character.js';
import { DemoService } from './src/application/services/DemoService.js';

console.log('🔧 Testing Character Instance Fixes');
console.log('=====================================');

try {
  // Test 1: Create a demo and check character instances
  console.log('1. Creating Valley of Echoes demo...');
  const demoService = new DemoService();
  const world = await demoService.createValleyOfEchoesDemo();
  
  console.log(`✅ Demo created with ${world.characters.length} characters`);
  
  // Test 2: Check that characters are proper instances
  console.log('2. Checking character instances...');
  let properInstances = 0;
  let withAttributes = 0;
  let warnings = 0;
  
  world.characters.forEach((char, index) => {
    if (char instanceof Character) {
      properInstances++;
    }
    
    if (char.attributes && typeof char.attributes.getTotalModifier === 'function') {
      withAttributes++;
    } else if (char.lodTier === 'group') {
      // Expected for group characters
      console.log(`   📋 Group character "${char.name}" has no attributes (expected)`);
    } else {
      console.log(`   ⚠️  Character "${char.name}" missing attributes`);
      warnings++;
    }
  });
  
  console.log(`✅ ${properInstances}/${world.characters.length} are proper Character instances`);
  console.log(`✅ ${withAttributes}/${world.characters.length} have proper attributes`);
  
  if (warnings === 0) {
    console.log('🎉 All non-group characters have proper attributes!');
  } else {
    console.log(`⚠️  ${warnings} characters missing attributes`);
  }
  
  // Test 3: Test character creation with JSON serialization/deserialization
  console.log('3. Testing JSON serialization/deserialization...');
  const testChar = world.characters.find(c => c.lodTier === 'hero');
  if (testChar) {
    const serialized = JSON.stringify(testChar);
    const deserialized = Character.fromJSON(JSON.parse(serialized));
    
    if (deserialized instanceof Character && 
        deserialized.attributes && 
        typeof deserialized.attributes.getTotalModifier === 'function') {
      console.log('✅ JSON serialization/deserialization working correctly');
    } else {
      console.log('❌ JSON serialization/deserialization failed');
    }
  }
  
  console.log('\n🎯 Character Instance Fix Summary:');
  console.log('- DataStructureUtils: Fixed Map/Array conversions');
  console.log('- LocalStorageWorldRepository: Fixed localStorage loading');
  console.log('- Character.fromJSON(): Enhanced with attribute defaults');
  console.log('- Value Objects: Enhanced fromJSON() methods');
  console.log('- Group Characters: Expected to use default perception values');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
}