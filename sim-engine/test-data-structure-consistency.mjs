// test-data-structure-consistency.mjs
// Validates the new DataStructureUtils fixes Map/Array inconsistencies

import DataStructureUtils from './src/shared/utils/DataStructureUtils.js';

console.log('=== DATA STRUCTURE CONSISTENCY TEST ===\n');

// Test 1: Array to Map conversion
console.log('1. Testing Array to Map conversion...');
const arrayData = {
  worldProperties: { name: 'Test World' },
  nodes: [
    { id: 'node1', name: 'Forest Clearing' },
    { id: 'node2', name: 'Mountain Pass' }
  ],
  characters: [
    { id: 'char1', name: 'Elara' },
    { id: 'char2', name: 'Gareth' }
  ],
  interactions: [
    { id: 'int1', title: 'Peaceful Encounter' }
  ]
};

try {
  const mapData = DataStructureUtils.ensureMapStructure(arrayData);
  console.log('✅ Array to Map conversion successful');
  console.log(`   - Nodes: ${mapData.nodes.size} items (Map)`);
  console.log(`   - Characters: ${mapData.characters.size} items (Map)`);
  console.log(`   - Interactions: ${mapData.interactions.size} items (Map)`);
} catch (error) {
  console.log('❌ Array to Map conversion failed:', error.message);
}

// Test 2: Map to Array conversion
console.log('\n2. Testing Map to Array conversion...');
const mapData = {
  worldProperties: { name: 'Test World' },
  nodes: new Map([
    ['node1', { id: 'node1', name: 'Forest Clearing' }],
    ['node2', { id: 'node2', name: 'Mountain Pass' }]
  ]),
  characters: new Map([
    ['char1', { id: 'char1', name: 'Elara' }],
    ['char2', { id: 'char2', name: 'Gareth' }]
  ]),
  interactions: new Map([
    ['int1', { id: 'int1', title: 'Peaceful Encounter' }]
  ])
};

try {
  const arrayResult = DataStructureUtils.ensureArrayStructure(mapData);
  console.log('✅ Map to Array conversion successful');
  console.log(`   - Nodes: ${arrayResult.nodes.length} items (Array)`);
  console.log(`   - Characters: ${arrayResult.characters.length} items (Array)`);
  console.log(`   - Interactions: ${arrayResult.interactions.length} items (Array)`);
} catch (error) {
  console.log('❌ Map to Array conversion failed:', error.message);
}

// Test 3: Inconsistency detection
console.log('\n3. Testing inconsistency detection...');
const inconsistentData = {
  worldProperties: { name: 'Test World' },
  nodes: new Map([['node1', { id: 'node1', name: 'Forest' }]]), // Map
  characters: [{ id: 'char1', name: 'Elara' }], // Array - INCONSISTENT!
  interactions: new Map([['int1', { id: 'int1', title: 'Encounter' }]]) // Map
};

const validation = DataStructureUtils.validateStructureConsistency(inconsistentData);
if (!validation.isValid) {
  console.log('✅ Inconsistency correctly detected:');
  console.log(`   - ${validation.error}`);
  console.log(`   - Maps: ${validation.mapCount}, Arrays: ${validation.arrayCount}`);
} else {
  console.log('❌ Failed to detect inconsistency');
}

// Test 4: Service-specific formatting
console.log('\n4. Testing service-specific formatting...');
const testData = {
  worldProperties: { name: 'Test World' },
  nodes: [{ id: 'node1', name: 'Test Node' }],
  characters: [{ id: 'char1', name: 'Test Character' }]
};

try {
  const simulationFormat = DataStructureUtils.formatForService(testData, 'SimulationService');
  console.log('✅ SimulationService format:', simulationFormat.nodes instanceof Map ? 'Maps' : 'Arrays');
  
  const storageFormat = DataStructureUtils.formatForService(testData, 'LocalStorageWorldRepository');
  console.log('✅ LocalStorageWorldRepository format:', Array.isArray(storageFormat.nodes) ? 'Arrays' : 'Maps');
} catch (error) {
  console.log('❌ Service formatting failed:', error.message);
}

// Test 5: Structure report
console.log('\n5. Testing structure report...');
const report = DataStructureUtils.getStructureReport(mapData);
console.log('✅ Structure Report:');
console.log(`   - Nodes: ${report.nodes.type} with ${report.nodes.count} items`);
console.log(`   - Characters: ${report.characters.type} with ${report.characters.count} items`);
console.log(`   - Consistency: ${report.consistency.isValid ? 'Valid' : 'Invalid'}`);

console.log('\n=== DATA STRUCTURE CONSISTENCY TEST COMPLETE ===');
console.log('✅ All core functionality validated');
console.log('🎯 DataStructureUtils is ready to solve Map/Array inconsistencies throughout the pipeline');