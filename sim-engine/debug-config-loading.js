/**
 * Debug DemoService Config Loading
 * Checks if config files are being loaded and processed correctly
 */

const oakwoodConfig = require('./src/data/demos/valley-of-echoes/oakwood-federation-config.js');
const ironholdConfig = require('./src/data/demos/valley-of-echoes/ironhold-dominion-config.js');

console.log('🔍 Debugging Config File Loading...\n');

console.log('📊 Oakwood Config:');
console.log(`- ID: ${oakwoodConfig.id}`);
console.log(`- Name: ${oakwoodConfig.name}`);
console.log(`- Nodes: ${oakwoodConfig.nodes?.length || 0}`);

if (oakwoodConfig.nodes) {
  oakwoodConfig.nodes.forEach(node => {
    const interactions = node.contentInteractions || [];
    console.log(`  - Node ${node.id}: ${interactions.length} content interactions`);
    interactions.forEach(interaction => {
      console.log(`    * ${interaction.name} (${interaction.id})`);
    });
  });
}

console.log('\n📊 Ironhold Config:');
console.log(`- ID: ${ironholdConfig.id}`);
console.log(`- Name: ${ironholdConfig.name}`);
console.log(`- Nodes: ${ironholdConfig.nodes?.length || 0}`);

if (ironholdConfig.nodes) {
  ironholdConfig.nodes.forEach(node => {
    const interactions = node.contentInteractions || [];
    console.log(`  - Node ${node.id}: ${interactions.length} content interactions`);
    interactions.forEach(interaction => {
      console.log(`    * ${interaction.name} (${interaction.id})`);
    });
  });
}

console.log('\n✅ Config loading test complete!');