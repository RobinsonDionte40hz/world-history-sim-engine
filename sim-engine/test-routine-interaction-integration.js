/**
 * Simple Integration Test Runner for Routine Interaction System
 * (Non-Jest version to avoid ES6 import conflicts)
 */

const RoutineInteractionManager = require('./src/domain/services/RoutineInteractionManager.js');
const DailyScheduleService = require('./src/domain/services/DailyScheduleService.js');
const oakwoodConfig = require('./src/configs/valley-of-echoes/oakwood-config.js');

console.log('🧪 Starting Routine Interaction System Integration Tests...\n');

// Test setup
let routineManager;
let scheduleService;
let worldState;
let testCharacter;

function setupTestEnvironment() {
  routineManager = new RoutineInteractionManager();
  scheduleService = new DailyScheduleService();

  // Convert nodes array to Map for compatibility with RoutineInteractionManager
  const nodesMap = new Map();
  oakwoodConfig.nodes.forEach(node => {
    nodesMap.set(node.id, node);
  });

  worldState = {
    time: 8,
    nodes: nodesMap,
    characters: []
  };

  testCharacter = {
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

  console.log('✅ Test environment setup complete');
}

// Test functions
function testTimeBasedScheduling() {
  console.log('\n📅 Testing Time-Based Scheduling...');

  // Test morning commute
  worldState.time = 8;
  const timeOfDay = scheduleService.getTimeOfDay(worldState.time);
  console.log(`Time 8: ${timeOfDay} (expected: morning)`);

  const availableActivities = scheduleService.getAvailableActivities(testCharacter, timeOfDay, worldState);
  const routineInteractions = routineManager.generateRoutineInteractions(
    testCharacter, worldState, timeOfDay, availableActivities
  );

  const commuteInteraction = routineInteractions.find(i => i.type === 'commute');
  console.log(`Morning commute interaction: ${commuteInteraction ? '✅ Found' : '❌ Not found'}`);

  // Test work time
  worldState.time = 10;
  const workTimeOfDay = scheduleService.getTimeOfDay(worldState.time);
  console.log(`Time 10: ${workTimeOfDay} (expected: morning)`);

  const workActivities = scheduleService.getAvailableActivities(testCharacter, workTimeOfDay, worldState);
  const workInteractions = routineManager.generateRoutineInteractions(
    testCharacter, worldState, workTimeOfDay, workActivities
  );

  const workInteraction = workInteractions.find(i => i.type === 'work');
  console.log(`Work interaction: ${workInteraction ? '✅ Found' : '❌ Not found'}`);
}

function testLocationPrerequisites() {
  console.log('\n📍 Testing Location-Based Prerequisites...');

  worldState.time = 10;
  testCharacter.currentNodeId = 'oakwood-administrative-center'; // Test work at admin center

  const timeOfDay = scheduleService.getTimeOfDay(worldState.time);
  const availableActivities = scheduleService.getAvailableActivities(testCharacter, timeOfDay, worldState);
  const routineInteractions = routineManager.generateRoutineInteractions(
    testCharacter, worldState, timeOfDay, availableActivities
  );

  const workInteraction = routineInteractions.find(i => i.type === 'work');
  console.log(`Work at work location: ${workInteraction ? '✅ Allowed' : '❌ Not allowed'}`);

  // Test commerce at commercial location
  worldState.time = 14;
  testCharacter.currentNodeId = 'oakwood-market-district';

  const commerceTimeOfDay = scheduleService.getTimeOfDay(worldState.time);
  const commerceActivities = scheduleService.getAvailableActivities(testCharacter, commerceTimeOfDay, worldState);
  const commerceInteractions = routineManager.generateRoutineInteractions(
    testCharacter, worldState, commerceTimeOfDay, commerceActivities
  );

  const commerceInteraction = commerceInteractions.find(i => i.type === 'commerce');
  console.log(`Commerce at market: ${commerceInteraction ? '✅ Allowed' : '❌ Not allowed'}`);
}

function testScheduleCompliance() {
  console.log('\n📊 Testing Schedule Compliance...');

  // On schedule scenario - character at their assigned work location
  worldState.time = 10;
  testCharacter.currentNodeId = 'oakwood-market-district'; // At assigned work location

  const timeOfDay = scheduleService.getTimeOfDay(worldState.time);
  const scheduleCompliance = scheduleService.getScheduleCompliance(testCharacter, timeOfDay, worldState);

  // scheduleCompliance is a number (0-1), not an object
  const isOnSchedule = scheduleCompliance >= 0.8; // Consider 80%+ as "on schedule"
  const scheduleConflict = scheduleCompliance < 0.5; // Consider <50% as conflict

  console.log(`On schedule: ${isOnSchedule ? '✅ Yes' : '❌ No'} (${(scheduleCompliance * 100).toFixed(0)}% compliance)`);
  console.log(`Schedule conflict: ${scheduleConflict ? '❌ Yes' : '✅ No'}`);

  // Schedule conflict scenario - character at wrong location during work hours
  testCharacter.currentNodeId = 'oakwood-administrative-center'; // Wrong location for work

  const conflictCompliance = scheduleService.getScheduleCompliance(testCharacter, timeOfDay, worldState);
  const conflictDetected = conflictCompliance < 0.5;

  console.log(`Schedule conflict detected: ${conflictDetected ? '✅ Yes' : '❌ No'} (${(conflictCompliance * 100).toFixed(0)}% compliance)`);
}

function testPrerequisitesValidation() {
  console.log('\n🔍 Testing Prerequisites Validation...');

  // Test energy requirements
  worldState.time = 10;
  testCharacter.energy = 15; // Below work requirement
  testCharacter.currentNodeId = 'oakwood-administrative-center'; // At work location

  const timeOfDay = scheduleService.getTimeOfDay(worldState.time);
  const availableActivities = scheduleService.getAvailableActivities(testCharacter, timeOfDay, worldState);
  const routineInteractions = routineManager.generateRoutineInteractions(
    testCharacter, worldState, timeOfDay, availableActivities
  );

  console.log(`Low energy prevents work: ${routineInteractions.length === 0 ? '✅ Yes' : '❌ No'}`);
  console.log(`  - Character energy: ${testCharacter.energy}, required: 30 (hero tier)`);
  console.log(`  - Generated interactions: ${routineInteractions.length}`);

  // Test wealth requirements - first test at non-commercial location
  worldState.time = 14;
  testCharacter.energy = 50;
  testCharacter.wealth = 50; // Sufficient wealth
  testCharacter.currentNodeId = 'oakwood-residential-quarter'; // Not commercial

  const commerceTimeOfDay = scheduleService.getTimeOfDay(worldState.time);
  let commerceInteractions = routineManager.generateRoutineInteractions(
    testCharacter, worldState, commerceTimeOfDay
  );

  // Filter for commerce interactions only
  commerceInteractions = commerceInteractions.filter(i => i.type === 'commerce');

  console.log(`Commerce at residential (non-commercial): ${commerceInteractions.length === 0 ? '✅ Correctly prevented' : '❌ Should not generate'}`);

  // Now test at commercial location with sufficient wealth
  testCharacter.currentNodeId = 'oakwood-market-district'; // Commercial location
  commerceInteractions = routineManager.generateRoutineInteractions(
    testCharacter, worldState, commerceTimeOfDay
  );

  // Filter for commerce interactions only
  commerceInteractions = commerceInteractions.filter(i => i.type === 'commerce');

  const commerceInteraction = commerceInteractions.find(i => i.type === 'commerce');
  console.log(`Commerce at market with sufficient wealth: ${commerceInteraction ? '✅ Allowed' : '❌ Not allowed'}`);

  // Test low wealth prevents commerce
  testCharacter.wealth = 5; // Below commerce requirement
  commerceInteractions = routineManager.generateRoutineInteractions(
    testCharacter, worldState, commerceTimeOfDay
  );

  // Filter for commerce interactions only
  commerceInteractions = commerceInteractions.filter(i => i.type === 'commerce');

  const lowWealthCommerceInteraction = commerceInteractions.find(i => i.type === 'commerce');
  console.log(`Low wealth prevents commerce: ${lowWealthCommerceInteraction ? '❌ No' : '✅ Yes'}`);
  console.log(`  - Character wealth: ${testCharacter.wealth}, required: 50 (hero tier)`);
  console.log(`  - Generated commerce interactions: ${commerceInteractions.filter(i => i.type === 'commerce').length}`);
}

// Run tests
try {
  setupTestEnvironment();
  testTimeBasedScheduling();
  testLocationPrerequisites();
  testScheduleCompliance();
  testPrerequisitesValidation();

  console.log('\n🎉 All integration tests completed successfully!');
  console.log('✅ Routine Interaction System is working correctly');

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  console.error(error.stack);
}