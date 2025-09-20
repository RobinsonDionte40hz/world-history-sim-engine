const DemoService = require('./src/application/services/DemoService.js');

console.log('🔍 Verifying Citizen Tiers and Content Interactions Implementation\n');

// Generate Valley of Echoes demo
const worldData = DemoService.generateDemoWorld('valley_of_echoes_demo');

console.log('📊 World Overview:');
console.log(`Name: ${worldData.worldProperties.name}`);
console.log(`Total Characters: ${worldData.characters.size}`);
console.log(`Total Nodes: ${worldData.nodes.size}`);
console.log();

// Check citizen tiers
console.log('👥 Citizen Tier Analysis:');
let leaderCount = 0;
let specialistCount = 0;
let citizenCount = 0;
let noTierCount = 0;

const sampleCharacters = [];
for (const [, character] of worldData.characters) {
  if (character.citizenTier) {
    switch (character.citizenTier) {
      case 'LEADER': leaderCount++; break;
      case 'SPECIALIST': specialistCount++; break;
      case 'CITIZEN': citizenCount++; break;
      default: noTierCount++; break;
    }

    // Collect sample characters for display
    if (sampleCharacters.length < 10) {
      sampleCharacters.push({
        name: character.name,
        lodTier: character.lodTier,
        citizenTier: character.citizenTier,
        wealth: character.wealth,
        economicInfluence: character.economicInfluence
      });
    }
  } else {
    noTierCount++;
  }
}

console.log(`LEADER tier: ${leaderCount} characters`);
console.log(`SPECIALIST tier: ${specialistCount} characters`);
console.log(`CITIZEN tier: ${citizenCount} characters`);
console.log(`No tier assigned: ${noTierCount} characters`);
console.log();

// Display sample characters
console.log('📋 Sample Characters with Citizen Tiers:');
sampleCharacters.forEach(char => {
  console.log(`  ${char.name} (${char.lodTier}) - ${char.citizenTier} - Wealth: ${char.wealth} - Influence: ${char.economicInfluence}`);
});
console.log();

// Check content interactions
console.log('🎮 Content Interactions Analysis:');
let totalInteractions = 0;
let nodesWithInteractions = 0;

for (const [, node] of worldData.nodes) {
  if (node.contentInteractions && node.contentInteractions.length > 0) {
    nodesWithInteractions++;
    totalInteractions += node.contentInteractions.length;

    if (nodesWithInteractions <= 3) { // Show first 3 nodes with interactions
      console.log(`  ${node.name}: ${node.contentInteractions.length} interactions`);
      node.contentInteractions.slice(0, 2).forEach(interaction => {
        console.log(`    - ${interaction.name} (${interaction.type})`);
      });
    }
  }
}

console.log(`\n📈 Summary:`);
console.log(`Nodes with content interactions: ${nodesWithInteractions}/${worldData.nodes.size}`);
console.log(`Total content interactions: ${totalInteractions}`);
console.log(`Characters with citizen tiers: ${leaderCount + specialistCount + citizenCount}/${worldData.characters.size}`);

// Final validation
const success = (leaderCount + specialistCount + citizenCount) > 0 && totalInteractions > 0;
console.log(`\n${success ? '✅' : '❌'} Implementation Status: ${success ? 'SUCCESS' : 'FAILED'}`);

if (success) {
  console.log('🎉 Citizen tiers and content interactions are properly implemented!');
} else {
  console.log('⚠️  Some features may not be working correctly.');
}