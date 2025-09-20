/**
 * Save Valley of Echoes Job Interactions as Templates
 * This script extracts job interactions from the Valley of Echoes demo and saves them as templates
 */

const DemoService = require('./src/application/services/DemoService.js');
const TemplateManager = require('./src/template/TemplateManager.js');

async function saveValleyJobTemplates() {
  console.log('🔨 Saving Valley of Echoes job interactions as templates...\n');

  try {
    // Generate demo world to extract interactions
    console.log('📦 Generating demo world to extract job interactions...');
    const demoWorld = DemoService.generateDemoWorld('valley_of_echoes_demo');

    // Filter for job interactions
    const jobInteractions = demoWorld.interactions.filter(interaction =>
      interaction.category === 'labor' ||
      interaction.category === 'craft' ||
      interaction.category === 'mining' ||
      interaction.category === 'agricultural'
    );

    console.log(`✅ Found ${jobInteractions.length} job interactions:`);
    jobInteractions.forEach((interaction, index) => {
      console.log(`   ${index + 1}. ${interaction.name} (${interaction.category})`);
    });

    // Save each job interaction as a template
    console.log('\n💾 Saving job interactions as templates...');
    let savedCount = 0;

    jobInteractions.forEach(interaction => {
      const templateData = {
        ...interaction,
        metadata: {
          ...interaction.metadata,
          isTemplate: true,
          category: interaction.category,
          difficulty: 'intermediate',
          author: 'Valley of Echoes Demo',
          version: '1.0.0',
          tags: ['job', 'work', interaction.category, 'valley-of-echoes'],
          description: interaction.description || `A ${interaction.category} job interaction from the Valley of Echoes demo`
        }
      };

      try {
        TemplateManager.addTemplate('interactions', templateData);
        console.log(`   ✅ Saved template: ${interaction.name}`);
        savedCount++;
      } catch (error) {
        console.warn(`   ❌ Failed to save template ${interaction.name}:`, error.message);
      }
    });

    console.log(`\n🎯 Successfully saved ${savedCount} job interaction templates!`);
    console.log('📋 These templates are now available in the InteractionEditor template library.');

    return savedCount;

  } catch (error) {
    console.error('❌ Failed to save Valley of Echoes job templates:', error);
    throw error;
  }
}

// Export for use in other scripts
module.exports = { saveValleyJobTemplates };

// CLI execution
if (require.main === module) {
  saveValleyJobTemplates().catch(console.error);
}