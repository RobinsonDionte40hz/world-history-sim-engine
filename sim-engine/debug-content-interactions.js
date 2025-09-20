/**
 * Debug Content Interactions in Valley of Echoes Demo
 * Checks if content interactions are properly loaded and assigned
 */

const DemoService = require('./src/application/services/DemoService.js');

async function debugContentInteractions() {
  console.log('🔍 Debugging Valley of Echoes Content Interactions...\n');

  try {
    // Generate the demo world
    const world = DemoService.generateDemoWorld('valley_of_echoes_demo');
    
    console.log('📊 World Data Summary:');
    console.log('World structure:', typeof world);
    console.log('World keys:', Object.keys(world));
    
    // Check if world has the expected structure
    const nodes = world.nodes || [];
    const characters = world.characters || [];
    const interactions = world.interactions || [];
    
    console.log(`- Total Nodes: ${Array.isArray(nodes) ? nodes.length : 'Not an array'}`);
    console.log(`- Total Characters: ${Array.isArray(characters) ? characters.length : 'Not an array'}`);
    console.log(`- Total Interactions: ${Array.isArray(interactions) ? interactions.length : 'Not an array'}\n`);

    // If interactions is not an array, let's see what it is
    if (!Array.isArray(interactions)) {
      console.log('Interactions type:', typeof interactions);
      if (interactions && typeof interactions === 'object') {
        console.log('Interactions keys:', Object.keys(interactions));
        if (interactions instanceof Map) {
          console.log('Interactions is a Map with size:', interactions.size);
        }
      }
    }

    // Check interactions by type - handle both array and Map cases
    let systemInteractions, contentInteractions;
    
    if (Array.isArray(interactions)) {
      systemInteractions = interactions.filter(i => !i.associatedNodeId);
      contentInteractions = interactions.filter(i => i.associatedNodeId);
    } else if (interactions instanceof Map) {
      const interactionArray = Array.from(interactions.values());
      systemInteractions = interactionArray.filter(i => !i.associatedNodeId);
      contentInteractions = interactionArray.filter(i => i.associatedNodeId);
    } else {
      console.log('❌ Interactions is not in expected format\n');
      return;
    }
    
    console.log('🔧 Interaction Breakdown:');
    console.log(`- System Interactions: ${systemInteractions.length}`);
    console.log(`- Content Interactions: ${contentInteractions.length}\n`);

    // List content interactions
    if (contentInteractions.length > 0) {
      console.log('📋 Content Interactions Found:');
      contentInteractions.forEach(interaction => {
        console.log(`  - ${interaction.name} (${interaction.id})`);
        console.log(`    Type: ${interaction.type}, Category: ${interaction.category}`);
        console.log(`    Node: ${interaction.associatedNodeId}`);
        console.log(`    Tier: ${interaction.tierRequirement}\n`);
      });
    } else {
      console.log('❌ No content interactions found!\n');
    }

    // Check sample characters and their assignments
    console.log('👥 Sample Character Analysis:');
    
    // Handle both array and Map cases for characters
    let characterArray;
    if (Array.isArray(characters)) {
      characterArray = characters;
    } else if (characters instanceof Map) {
      characterArray = Array.from(characters.values());
    } else {
      console.log('❌ Characters is not in expected format');
      return;
    }
    
    // Look for engineers specifically
    const engineers = characterArray.filter(char => 
      char.name && char.name.includes('Engineers')
    );
    
    if (engineers.length > 0) {
      const engineer = engineers[0];
      console.log(`\n🔍 Engineer Character: ${engineer.name} (${engineer.id})`);
      console.log(`  LOD Tier: ${engineer.lodTier}`);
      console.log(`  Assigned Nodes: ${Array.from(engineer.assignments.nodes).join(', ')}`);
      console.log(`  Assigned Interactions: ${Array.from(engineer.assignments.interactions).join(', ')}`);
      
      // Check which interactions are available in their node
      const engineerNode = engineer.assignments.nodes.values().next().value;
      const nodeContentInteractions = contentInteractions.filter(i => i.associatedNodeId === engineerNode);
      console.log(`  Content Interactions in Node: ${nodeContentInteractions.map(i => i.name).join(', ')}`);
    }

    // Check smiths
    const smiths = characterArray.filter(char => 
      char.name && char.name.includes('Smith')
    );
    
    if (smiths.length > 0) {
      const smith = smiths[0];
      console.log(`\n🔨 Smith Character: ${smith.name} (${smith.id})`);
      console.log(`  LOD Tier: ${smith.lodTier}`);
      console.log(`  Assigned Nodes: ${Array.from(smith.assignments.nodes).join(', ')}`);
      console.log(`  Assigned Interactions: ${Array.from(smith.assignments.interactions).join(', ')}`);
      
      const smithNode = smith.assignments.nodes.values().next().value;
      const nodeContentInteractions = contentInteractions.filter(i => i.associatedNodeId === smithNode);
      console.log(`  Content Interactions in Node: ${nodeContentInteractions.map(i => i.name).join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Error during debug:', error);
    console.error(error.stack);
  }
}

// Run the debug
debugContentInteractions().then(() => {
  console.log('\n✅ Debug complete!');
}).catch(error => {
  console.error('\n❌ Debug failed:', error);
});