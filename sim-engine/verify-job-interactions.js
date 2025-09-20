/**
 * Detailed verification of job interaction assignments in Valley of Echoes demo
 */

const DemoService = require('./src/application/services/DemoService.js');

function verifyJobInteractions() {
  console.log('🔍 Detailed Job Interaction Verification for Valley of Echoes Demo\n');

  try {
    // Generate the demo world
    const world = DemoService.generateDemoWorld('valley_of_echoes_demo');

    console.log('📊 World Generated Successfully');
    console.log(`   World: ${world.worldProperties.name}`);
    console.log('');

    // Get all interactions for reference
    const interactions = world.interactions;

    // Define job interaction IDs we're looking for
    const jobInteractionIds = {
      farm_work: 'farm_work',
      smithing_work: 'smithing_work',
      mining_work: 'mining_work'
    };

    // Check if job interactions exist in world
    console.log('🎯 Job Interactions in World:');
    Object.entries(jobInteractionIds).forEach(([key, id]) => {
      const exists = interactions.has(id);
      const interaction = interactions.get(id);
      console.log(`   ${exists ? '✅' : '❌'} ${key}: ${interaction ? interaction.name : 'Not found'} (${id})`);
    });
    console.log('');

    // Analyze character assignments by type
    const characters = Array.from(world.characters.values());

    // Group characters by their population group or name pattern
    const characterGroups = {
      farmers: characters.filter(c => c.name.toLowerCase().includes('farmer') || c.populationGroupId?.includes('farmers')),
      smiths: characters.filter(c => c.name.toLowerCase().includes('smith') || c.populationGroupId?.includes('smiths')),
      miners: characters.filter(c => c.name.toLowerCase().includes('miner') || c.populationGroupId?.includes('miners')),
      heroes: characters.filter(c => c.lodTier === 'hero')
    };

    console.log('👥 Character Group Analysis:');
    Object.entries(characterGroups).forEach(([groupName, groupChars]) => {
      console.log(`   ${groupName}: ${groupChars.length} characters`);
    });
    console.log('');

    // Check specific assignments for each group
    console.log('🔧 Job Interaction Assignments by Group:');

    Object.entries(characterGroups).forEach(([groupName, groupChars]) => {
      if (groupChars.length === 0) return;

      console.log(`\n📋 ${groupName.toUpperCase()} GROUP (${groupChars.length} characters):`);

      // Sample first few characters from each group
      const sampleChars = groupChars.slice(0, 3);

      sampleChars.forEach(char => {
        const assignedInteractionIds = Array.from(char.assignments.interactions);
        const assignedInteractions = assignedInteractionIds.map(id => interactions.get(id)).filter(i => i);

        console.log(`   👤 ${char.name} (${char.id}):`);
        console.log(`      Assigned interactions: ${assignedInteractions.length}`);

        // Check for job interactions
        const hasFarmWork = assignedInteractionIds.includes('farm_work');
        const hasSmithingWork = assignedInteractionIds.includes('smithing_work');
        const hasMiningWork = assignedInteractionIds.includes('mining_work');

        console.log(`      ✅ Farm work: ${hasFarmWork}`);
        console.log(`      ✅ Smithing work: ${hasSmithingWork}`);
        console.log(`      ✅ Mining work: ${hasMiningWork}`);

        // Show all assigned interaction names
        if (assignedInteractions.length > 0) {
          console.log(`      Interactions: ${assignedInteractions.map(i => i.name).join(', ')}`);
        }
      });

      // Summary for the whole group
      const groupHasFarmWork = groupChars.some(c => c.assignments.interactions.has('farm_work'));
      const groupHasSmithingWork = groupChars.some(c => c.assignments.interactions.has('smithing_work'));
      const groupHasMiningWork = groupChars.some(c => c.assignments.interactions.has('mining_work'));

      console.log(`   📊 Group Summary:`);
      console.log(`      Any farm work: ${groupHasFarmWork}`);
      console.log(`      Any smithing work: ${groupHasSmithingWork}`);
      console.log(`      Any mining work: ${groupHasMiningWork}`);
    });

    // Overall verification
    console.log('\n🎯 VERIFICATION RESULTS:');

    const farmers = characterGroups.farmers;
    const smiths = characterGroups.smiths;
    const miners = characterGroups.miners;

    const farmersHaveFarmWork = farmers.some(c => c.assignments.interactions.has('farm_work'));
    const smithsHaveSmithingWork = smiths.some(c => c.assignments.interactions.has('smithing_work'));
    const minersHaveMiningWork = miners.some(c => c.assignments.interactions.has('mining_work'));

    console.log(`✅ Farmers have farm work: ${farmersHaveFarmWork}`);
    console.log(`✅ Smiths have smithing work: ${smithsHaveSmithingWork}`);
    console.log(`✅ Miners have mining work: ${minersHaveMiningWork}`);

    const allJobInteractionsAssigned = farmersHaveFarmWork && smithsHaveSmithingWork && minersHaveMiningWork;

    console.log(`\n🏁 OVERALL RESULT: ${allJobInteractionsAssigned ? 'SUCCESS' : 'PARTIAL SUCCESS'}`);

    if (allJobInteractionsAssigned) {
      console.log('🎊 All job interactions are properly assigned to appropriate character groups!');
    } else {
      console.log('⚠️  Some job interactions may not be assigned correctly.');
    }

    return allJobInteractionsAssigned;

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run the verification
verifyJobInteractions().then(success => {
  console.log('\n🏁 Detailed verification completed!');
  process.exit(success ? 0 : 1);
}).catch(console.error);