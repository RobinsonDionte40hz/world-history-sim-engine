// test-demo-assignments.mjs
import DemoService from './src/application/services/DemoService.js';
import simulationService from './src/application/use-cases/services/SimulationService.js';

console.log('Testing demo world character assignments...');

// Generate demo world
const demoWorld = DemoService.generateDemoWorld('fantasy_village_demo');
console.log('Demo world generated');

// Check characters and nodes
console.log('\nCharacters in demo:');
demoWorld.characters.forEach((character, id) => {
  console.log(`- ${character.name} (${id})`);
  console.log(`  currentNodeId: ${character.currentNodeId}`);
  console.log(`  assignments.nodes: ${Array.from(character.assignments?.nodes || [])}`);
});

console.log('\nNodes in demo:');
demoWorld.nodes.forEach((node, id) => {
  console.log(`- ${node.name} (${id})`);
  console.log(`  characters: ${node.characters?.length || 0}`);
  console.log(`  contentInteractions: ${node.contentInteractions?.length || 0}`);
  if (node.characters && node.characters.length > 0) {
    node.characters.forEach(char => {
      console.log(`    - ${char.name}`);
    });
  }
});

console.log('\nInitializing simulation...');
const simulationState = simulationService.initialize(demoWorld);

console.log('\nSimulation state check:');
console.log(`Nodes: ${simulationState.nodes?.length || 0}`);
console.log(`NPCs: ${simulationState.npcs?.length || 0}`);

if (simulationState.nodes) {
  simulationState.nodes.forEach(node => {
    console.log(`Node ${node.name}: ${node.characters?.length || 0} characters, ${node.contentInteractions?.length || 0} interactions`);
  });
}

console.log('\nCharacter locations:');
if (simulationState.npcs) {
  simulationState.npcs.forEach(npc => {
    console.log(`${npc.name}: ${npc.currentNodeId}`);
  });
}