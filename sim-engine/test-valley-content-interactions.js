// Simple test to verify Valley of Echoes demo has interactions
const DemoService = require('./src/application/services/DemoService.js');

console.log('🧪 Testing Valley of Echoes Demo Interactions...');

try {
  // Generate the Valley of Echoes demo
  const demo = DemoService.generateDemoWorld('valley_of_echoes_demo');
  console.log('✅ Valley of Echoes demo generated successfully!');
  console.log(`📊 Characters: ${demo.characters.size}`);
  console.log(`💬 Interactions: ${demo.interactions.size}`);
  console.log(`🗺️ Nodes: ${demo.nodes.size}`);

  // Check if interactions exist
  if (demo.interactions.size === 0) {
    console.log('❌ FAILURE: No interactions found in demo');
    process.exit(1);
  }

  console.log('\n� Interaction Details:');
  demo.interactions.forEach((interaction, id) => {
    console.log(`  - ${interaction.name} (${id})`);
    console.log(`    Category: ${interaction.category}`);
    console.log(`    Assigned to: ${interaction.assignedCharacterIds?.length || 0} characters`);
    if (interaction.assignedCharacterIds?.length > 0) {
      interaction.assignedCharacterIds.forEach(charId => {
        console.log(`      * ${charId}`);
      });
    }
    console.log('');
  });

  // Check hero characters
  const heroCharacters = Array.from(demo.characters.values())
    .filter(char => char.lodTier === 'hero');

  console.log(`👥 Hero Characters: ${heroCharacters.length}`);
  heroCharacters.forEach(char => {
    console.log(`  - ${char.name} (${char.id})`);
    console.log(`    LOD Tier: ${char.lodTier}`);
    console.log(`    Assigned Node: ${char.currentNodeId}`);
    console.log('');
  });

  console.log('✅ SUCCESS: Valley of Echoes demo has interactions and hero characters!');

} catch (error) {
  console.error('❌ Error testing Valley of Echoes:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}