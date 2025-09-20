/**
 * Debug script for RoutineInteractionManager
 */

const RoutineInteractionManager = require('./src/domain/services/RoutineInteractionManager.js');
const DailyScheduleService = require('./src/domain/services/DailyScheduleService.js');
const oakwoodConfig = require('./src/configs/valley-of-echoes/oakwood-config.js');

console.log('🔍 Debugging Routine Interaction Manager...\n');

// Setup
const routineManager = new RoutineInteractionManager();
const scheduleService = new DailyScheduleService();

// Convert nodes array to Map for compatibility
const nodesMap = new Map();
oakwoodConfig.nodes.forEach(node => {
  nodesMap.set(node.id, node);
});

const worldState = {
  time: 8,
  nodes: nodesMap,
  characters: []
};

const testCharacter = {
  id: 'test-character',
  name: 'Test Character',
  lodTier: 'hero',
  energy: 100,
  maxEnergy: 100,
  wealth: 50,
  currentNodeId: 'oakwood-residential-quarter',
  assignments: {
    homeNodeId: 'oakwood-residential-quarter',
    workNodeId: 'oakwood-market-district',
    nodes: new Set(['oakwood-market-district'])
  },
  attributes: {
    strength: 12,
    dexterity: 14,
    constitution: 13,
    intelligence: 15,
    wisdom: 14,
    charisma: 16
  },
  personality: {
    traits: new Map([
      ['extrovert', { value: 0.7 }],
      ['conscientious', { value: 0.8 }]
    ])
  },
  consciousness: {
    frequency: 0.8,
    coherence: 0.85
  }
};

console.log('Character setup:');
console.log(`- Current location: ${testCharacter.currentNodeId}`);
console.log(`- Home: ${testCharacter.assignments.homeNodeId}`);
console.log(`- Work: ${testCharacter.assignments.workNodeId}`);
console.log(`- LOD Tier: ${testCharacter.lodTier}`);
console.log(`- Energy: ${testCharacter.energy}`);
console.log(`- Wealth: ${testCharacter.wealth}`);

console.log('\nTesting commute generation (morning, at home):');
console.log(`Time: ${worldState.time}`);
console.log(`Time of day: ${scheduleService.getTimeOfDay(worldState.time)}`);

const commuteInteractions = routineManager.generateRoutineInteractions(
  testCharacter, worldState, 'morning'
);

console.log(`Generated ${commuteInteractions.length} interactions:`);
commuteInteractions.forEach((interaction, index) => {
  console.log(`  ${index + 1}. ${interaction.name} (${interaction.type})`);
  if (interaction.type === 'commute') {
    console.log(`     - Description: ${interaction.description}`);
  }
});

console.log('\nTesting work generation (morning, at work location):');
worldState.time = 10;
testCharacter.currentNodeId = 'oakwood-market-district'; // Move to work

console.log(`Time: ${worldState.time}`);
console.log(`Time of day: ${scheduleService.getTimeOfDay(worldState.time)}`);
console.log(`Current location: ${testCharacter.currentNodeId}`);

const workInteractions = routineManager.generateRoutineInteractions(
  testCharacter, worldState, 'morning'
);

console.log(`Generated ${workInteractions.length} interactions:`);
workInteractions.forEach((interaction, index) => {
  console.log(`  ${index + 1}. ${interaction.name} (${interaction.type})`);
  if (interaction.type === 'work') {
    console.log(`     - Description: ${interaction.description}`);
  }
});

console.log('\nTesting commerce generation (afternoon, at market):');
worldState.time = 14;
testCharacter.currentNodeId = 'oakwood-market-district';

console.log(`Time: ${worldState.time}`);
console.log(`Time of day: ${scheduleService.getTimeOfDay(worldState.time)}`);
console.log(`Current location: ${testCharacter.currentNodeId}`);

const commerceInteractions = routineManager.generateRoutineInteractions(
  testCharacter, worldState, 'afternoon'
);

console.log(`Generated ${commerceInteractions.length} interactions:`);
commerceInteractions.forEach((interaction, index) => {
  console.log(`  ${index + 1}. ${interaction.name} (${interaction.type})`);
  if (interaction.type === 'commerce') {
    console.log(`     - Description: ${interaction.description}`);
  }
});

console.log('\nDebug complete.');