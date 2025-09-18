// Quick test to verify Valley of Echoes demo loads
const DemoService = require('./src/application/services/DemoService.js');

console.log('Testing Valley of Echoes demo generation...');

try {
  const demo = DemoService.generateDemoWorld('valley_of_echoes_demo');
  console.log('✅ Valley of Echoes demo generated successfully!');
  console.log(`📊 Characters: ${demo.characters.size}`);
  console.log(`🏛️ Settlements: ${demo.settlements.length}`);
  console.log(`🗺️ Nodes: ${demo.nodes.size}`);
  console.log(`💬 Interactions: ${demo.interactions.size}`);

  // Check if we have the expected number of characters
  const expectedCharacters = 8 + 8 + 200; // 8 heroes + 8 groups + 200 background
  if (demo.characters.size >= expectedCharacters) {
    console.log(`✅ All ${expectedCharacters}+ characters loaded successfully!`);
  } else {
    console.log(`⚠️ Only ${demo.characters.size} characters loaded (expected ${expectedCharacters}+)`);
  }

} catch (error) {
  console.error('❌ Error generating demo:', error.message);
  console.error('Stack trace:', error.stack);
}