// debug-dashboard-persistence.js
// Diagnose dashboard data persistence issues through turn processing

// Simple test to understand the data flow issue
console.log('=== DASHBOARD PERSISTENCE DIAGNOSTIC ===\n');

// Simulate the data flow problem
console.log('1. Testing Map vs Array data structure handling...');

// Simulate what might be happening in the pipeline
const mapWorldState = {
  time: 1,
  nodes: new Map([
    ['node1', { id: 'node1', name: 'Test Location', type: 'settlement' }]
  ]),
  characters: new Map([
    ['char1', { id: 'char1', name: 'Test Character', currentNodeId: 'node1' }]
  ]),
  interactions: new Map([
    ['int1', { id: 'int1', title: 'Test Interaction' }]
  ]),
  events: [
    { id: 'event1', description: 'Test Event', turn: 1 }
  ]
};

const arrayWorldState = {
  time: 1,
  nodes: [
    { id: 'node1', name: 'Test Location', type: 'settlement' }
  ],
  npcs: [  // Note: SimulationService uses 'npcs', not 'characters'
    { id: 'char1', name: 'Test Character', currentNodeId: 'node1' }
  ],
  events: [
    { id: 'event1', description: 'Test Event', turn: 1 }
  ]
};

console.log('Map structure (SimulationContext):');
console.log('- nodes:', mapWorldState.nodes instanceof Map ? 'Map' : 'Array', 'with', mapWorldState.nodes.size, 'items');
console.log('- characters:', mapWorldState.characters instanceof Map ? 'Map' : 'Array', 'with', mapWorldState.characters.size, 'items');
console.log('- events:', Array.isArray(mapWorldState.events) ? 'Array' : 'Other', 'with', mapWorldState.events.length, 'items');

console.log('\nArray structure (SimulationService):');
console.log('- nodes:', Array.isArray(arrayWorldState.nodes) ? 'Array' : 'Other', 'with', arrayWorldState.nodes.length, 'items');
console.log('- npcs:', Array.isArray(arrayWorldState.npcs) ? 'Array' : 'Other', 'with', arrayWorldState.npcs.length, 'items');
console.log('- events:', Array.isArray(arrayWorldState.events) ? 'Array' : 'Other', 'with', arrayWorldState.events.length, 'items');

console.log('\n2. Testing Dashboard data extraction...');

// Simulate DashboardView logic
const simulateDashboardView = (worldState) => {
  const displayWorldState = worldState || {
    time: 0,
    npcs: [],
    characters: [],
    nodes: [],
    events: []
  };

  // Dashboard fallback logic
  const characters = Array.isArray(displayWorldState.characters)
    ? displayWorldState.characters
    : Array.isArray(displayWorldState.npcs)
    ? displayWorldState.npcs
    : [];

  const nodes = Array.isArray(displayWorldState.nodes) 
    ? displayWorldState.nodes 
    : displayWorldState.nodes instanceof Map 
    ? Array.from(displayWorldState.nodes.values()) 
    : [];

  const events = Array.isArray(displayWorldState.events) ? displayWorldState.events : [];

  return {
    charactersCount: characters.length,
    nodesCount: nodes.length,
    eventsCount: events.length,
    timeValue: displayWorldState.time
  };
};

console.log('Dashboard extraction from Map structure:');
const mapResult = simulateDashboardView(mapWorldState);
console.log(mapResult);

console.log('\nDashboard extraction from Array structure:');
const arrayResult = simulateDashboardView(arrayWorldState);
console.log(arrayResult);

console.log('\n3. Diagnosing potential sync issues...');

// Simulate what happens when structures don't match
const mixedWorldState = {
  time: 2,
  nodes: new Map([['node1', { id: 'node1', name: 'Location' }]]), // Map
  npcs: [{ id: 'char1', name: 'Character' }], // Array
  events: [] // Array but empty
};

console.log('Mixed structure result:');
const mixedResult = simulateDashboardView(mixedWorldState);
console.log(mixedResult);

console.log('\n=== DIAGNOSTIC SUMMARY ===');
console.log('🔍 Potential Issues Found:');
console.log('1. SimulationService uses "npcs" but contexts might expect "characters"');
console.log('2. Maps from contexts need conversion to Arrays for dashboard display');
console.log('3. Events array might not be properly carried through turn processing');
console.log('4. Time progression might not be reflected in dashboard state');

console.log('\n🎯 Recommended Fixes:');
console.log('1. Ensure SimulationContext converts Map data to Array format for dashboard');
console.log('2. Verify SimulationService worldState updates are propagated to contexts');
console.log('3. Add data structure validation in turn processing pipeline');
console.log('4. Ensure events persist and accumulate through turns');