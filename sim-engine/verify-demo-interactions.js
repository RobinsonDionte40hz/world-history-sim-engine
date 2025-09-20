/**
 * Quick verification that Valley of Echoes demo assigns interactions to characters
 */

const DemoService = require('./src/application/services/DemoService.js');

async function verifyDemoInteractions() {
  console.log('🔍 Verifying Valley of Echoes Demo Interaction Assignments...\n');

  try {
    // Generate the demo world using the correct method
    const world = DemoService.generateDemoWorld('valley_of_echoes_demo');

    console.log('📊 World Generation Complete');
    console.log(`   World: ${world.worldProperties.name}`);
    console.log(`   Description: ${world.worldProperties.description}`);
    console.log('');

    // Check interactions in world
    const interactionCount = world.interactions ? world.interactions.size : 0;
    console.log(`🎯 World Interactions: ${interactionCount}`);

    if (interactionCount > 0) {
      console.log('   Available interactions:');
      world.interactions.forEach((interaction, id) => {
        console.log(`   - ${interaction.name} (${id})`);
      });
    } else {
      console.log('   ❌ No interactions found in world!');
    }
    console.log('');

    // Check character interaction assignments
    const characters = world.characters ? Array.from(world.characters.values()) : [];
    console.log(`👥 Character Interaction Assignments (${characters.length} characters):`);

    let totalInteractionsAssigned = 0;
    let charactersWithInteractions = 0;
    let charactersWithoutInteractions = 0;

    characters.forEach(char => {
      const interactionCount = char.assignments?.interactions?.size || 0;
      totalInteractionsAssigned += interactionCount;

      if (interactionCount > 0) {
        charactersWithInteractions++;
        console.log(`   ✅ ${char.name}: ${interactionCount} interactions`);
      } else {
        charactersWithoutInteractions++;
        console.log(`   ❌ ${char.name}: 0 interactions`);
      }
    });

    console.log('');
    console.log('📈 Summary:');
    console.log(`   Total characters: ${characters.length}`);
    console.log(`   Characters with interactions: ${charactersWithInteractions}`);
    console.log(`   Characters without interactions: ${charactersWithoutInteractions}`);
    console.log(`   Total interactions assigned: ${totalInteractionsAssigned}`);

    if (charactersWithInteractions > 0) {
      console.log('');
      console.log('✅ SUCCESS: Demo successfully assigns interactions to characters!');
      return true;
    } else {
      console.log('');
      console.log('❌ FAILURE: No characters have interactions assigned');
      return false;
    }

  } catch (error) {
    console.error('❌ Verification failed with error:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run verification
verifyDemoInteractions().then(success => {
  console.log('');
  console.log('🏁 Verification completed!');
  if (success) {
    console.log('🎊 Demo interaction assignment is working correctly!');
  } else {
    console.log('💥 Demo interaction assignment needs fixing!');
  }
}).catch(console.error);