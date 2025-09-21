// Test to verify all characters in Valley of Echoes demo have proper attributes
import DemoService from './src/application/services/DemoService.js';

console.log('🔧 Testing Valley of Echoes Character Attributes\n');

try {
  // Generate fresh demo world
  console.log('📋 Generating fresh Valley of Echoes demo...');
  const demoWorld = DemoService.generateDemoWorld('valley_of_echoes_demo');
  
  console.log('✅ Demo world generated successfully!');
  console.log(`   - Total characters: ${demoWorld.characters.size}`);
  
  // Convert Map to Array for easier processing
  const allCharacters = Array.from(demoWorld.characters.values());
  
  // Group by LOD tier
  const byTier = {
    hero: allCharacters.filter(c => c.lodTier === 'hero'),
    group: allCharacters.filter(c => c.lodTier === 'group'),
    background: allCharacters.filter(c => c.lodTier === 'background')
  };
  
  console.log('\n📊 Character breakdown:');
  console.log(`   - Heroes: ${byTier.hero.length}`);
  console.log(`   - Groups: ${byTier.group.length}`);
  console.log(`   - Background: ${byTier.background.length}`);
  
  // Check each tier for attribute issues
  let totalProblems = 0;
  
  Object.entries(byTier).forEach(([tier, characters]) => {
    console.log(`\n🔍 Checking ${tier} characters...`);
    
    const problems = characters.filter(char => {
      // Check if character has valid attributes
      if (!char.attributes) {
        return true; // No attributes at all
      }
      
      // Check if attributes have the getTotalModifier method
      if (typeof char.attributes.getTotalModifier !== 'function') {
        return true; // Not a proper Attributes instance
      }
      
      return false;
    });
    
    if (problems.length > 0) {
      console.log(`   ❌ Found ${problems.length} characters with attribute issues:`);
      problems.slice(0, 10).forEach(char => { // Show first 10
        console.log(`      - ${char.name} (${char.id})`);
        console.log(`        * Has attributes: ${!!char.attributes}`);
        console.log(`        * Has baseAttributes: ${!!char.baseAttributes}`);
        console.log(`        * Attributes type: ${char.attributes?.constructor?.name || 'undefined'}`);
      });
      
      if (problems.length > 10) {
        console.log(`      ... and ${problems.length - 10} more`);
      }
      
      totalProblems += problems.length;
    } else {
      console.log(`   ✅ All ${characters.length} ${tier} characters have valid attributes`);
    }
  });
  
  if (totalProblems === 0) {
    console.log('\n🎉 SUCCESS: All characters have proper attributes!');
    console.log('The issue must be with cached data in the browser.');
    console.log('Try clearing localStorage in the browser console:');
    console.log('  localStorage.clear()');
  } else {
    console.log(`\n❌ PROBLEM: Found ${totalProblems} characters with attribute issues`);
    console.log('There may be additional character creation paths that need fixing.');
  }
  
} catch (error) {
  console.log('❌ Demo generation failed:', error.message);
  console.log('   Stack:', error.stack);
}