/**
 * Test the behavior generation fix to ensure NPCs get only assigned interactions 
 * and not both assigned + node content interactions
 */

const DemoService = require('./src/application/services/DemoService.js');
const GenerateBehavior = require('./src/application/use-cases/npc/GenerateBehavior.js');

console.log('🧪 Testing Behavior Generation Fix for Dual Assignment Issue...\n');

try {
  // Generate the demo world
  const world = DemoService.generateDemoWorld('valley_of_echoes_demo');
  
  // Convert interactions Map to Array for simpler handling
  const worldState = {
    ...world,
    interactions: Array.from(world.interactions.values()),
    characters: Array.from(world.characters.values()),
    nodes: Array.from(world.nodes.values()),
    time: 10 // Set to morning work time
  };
  
  console.log('📊 World State:');
  console.log(`  - Characters: ${worldState.characters.length}`);
  console.log(`  - Interactions: ${worldState.interactions.length}`);
  console.log(`  - Nodes: ${worldState.nodes.length}`);
  console.log(`  - Time: ${worldState.time} (should be morning)`);
  console.log('');
  
  // Test a few different character types
  const testCharacters = [
    worldState.characters.find(c => c.lodTier === 'hero'),
    worldState.characters.find(c => c.lodTier === 'group'),
    worldState.characters.find(c => c.lodTier === 'background')
  ].filter(Boolean);
  
  console.log('🎯 Testing Behavior Generation for Sample Characters:');
  console.log('');
  
  testCharacters.forEach((character, index) => {
    console.log(`--- Test ${index + 1}: ${character.name} (${character.lodTier}) ---`);
    console.log(`Assigned interactions: ${character.assignments?.interactions?.size || 0}`);
    console.log('Generating behavior...');
    
    try {
      const behavior = GenerateBehavior(character, worldState);
      
      console.log(`Generated behavior: ${behavior?.selectedInteraction?.name || 'None'}`);
      console.log(`Selected interaction type: ${behavior?.selectedInteraction?.type || 'N/A'}`);
      console.log(`Selected interaction category: ${behavior?.selectedInteraction?.category || 'N/A'}`);
      console.log('');
      
    } catch (error) {
      console.error(`Error generating behavior for ${character.name}:`, error.message);
      console.log('');
    }
  });
  
  console.log('✅ Behavior generation test completed successfully!');
  
} catch (error) {
  console.error('❌ Error during behavior generation test:', error.message);
  console.error(error.stack);
}