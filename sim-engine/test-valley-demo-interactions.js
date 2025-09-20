const DemoService = require('./src/application/services/DemoService.js');

console.log('Testing Valley of Echoes Demo Interactions...\n');

try {
  const demo = DemoService.generateDemoWorld('valley_of_echoes_demo');

  console.log('Demo interactions:');
  demo.interactions.forEach((interaction, index) => {
    console.log(`${index + 1}. ${interaction.name} (${interaction.type}) - ${interaction.category}`);
  });

  console.log(`\nTotal interactions: ${demo.interactions.size}`);

  // Check for job interactions (convert Map to Array)
  const interactionsArray = Array.from(demo.interactions.values());
  const jobInteractions = interactionsArray.filter(i =>
    i.type === 'labor' ||
    i.category === 'craft' ||
    i.category === 'mining' ||
    i.category === 'agricultural' ||
    i.name.toLowerCase().includes('work') ||
    i.name.toLowerCase().includes('smith') ||
    i.name.toLowerCase().includes('farm') ||
    i.name.toLowerCase().includes('mine')
  );

  console.log(`\nJob/Work interactions found: ${jobInteractions.length}`);
  jobInteractions.forEach((interaction, index) => {
    console.log(`  ${index + 1}. ${interaction.name} (${interaction.category})`);
  });

} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
}