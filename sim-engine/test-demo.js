const { runValleyOfEchoesDemo } = require('./examples/valley-of-echoes-demo/demo-script.js');

async function testDemo() {
  try {
    console.log('Starting Valley of Echoes demo test...');
    const result = await runValleyOfEchoesDemo(5);
    console.log('Demo completed successfully!');
    console.log('Results:', {
      turns: result.turns,
      events: result.events.length,
      quests: result.quests.length
    });
  } catch (error) {
    console.error('Demo failed:', error);
  }
}

testDemo();