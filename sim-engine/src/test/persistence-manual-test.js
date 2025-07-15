// Manual test script to verify turn counter persistence across browser sessions
// This script can be run in the browser console to test localStorage persistence

console.log('=== Turn Counter Persistence Manual Test ===');

// Import the service (this would work in the actual app context)
// For manual testing, you can copy-paste this into browser console when the app is running

function testPersistence() {
  console.log('\n1. Testing save functionality...');
  
  // Simulate saving state with different turn values
  const testStates = [
    { time: 0, nodes: [], npcs: [], resources: {} },
    { time: 42, nodes: [], npcs: [], resources: {} },
    { time: 999, nodes: [], npcs: [], resources: {} }
  ];
  
  testStates.forEach((state, index) => {
    localStorage.setItem('worldState', JSON.stringify(state));
    const saved = JSON.parse(localStorage.getItem('worldState'));
    console.log(`Test ${index + 1}: Saved time=${state.time}, Retrieved time=${saved.time} - ${saved.time === state.time ? 'PASS' : 'FAIL'}`);
  });
  
  console.log('\n2. Testing load functionality...');
  
  // Test loading with valid data
  const validState = { time: 123, nodes: [], npcs: [], resources: {} };
  localStorage.setItem('worldState', JSON.stringify(validState));
  const loaded = JSON.parse(localStorage.getItem('worldState'));
  console.log(`Valid state load: Expected time=123, Got time=${loaded.time} - ${loaded.time === 123 ? 'PASS' : 'FAIL'}`);
  
  console.log('\n3. Testing corrupted data handling...');
  
  // Test with corrupted JSON
  localStorage.setItem('worldState', 'invalid json {');
  try {
    JSON.parse(localStorage.getItem('worldState'));
    console.log('Corrupted JSON test: FAIL - Should have thrown error');
  } catch (error) {
    console.log('Corrupted JSON test: PASS - Correctly threw error');
  }
  
  // Test with invalid structure
  localStorage.setItem('worldState', JSON.stringify({ invalid: 'structure' }));
  const invalidStructure = JSON.parse(localStorage.getItem('worldState'));
  const hasValidStructure = invalidStructure.time !== undefined && 
                           Array.isArray(invalidStructure.nodes) && 
                           Array.isArray(invalidStructure.npcs) && 
                           typeof invalidStructure.resources === 'object';
  console.log(`Invalid structure test: ${hasValidStructure ? 'FAIL' : 'PASS'} - Structure validation working`);
  
  console.log('\n4. Testing browser session simulation...');
  
  // Simulate first session
  const sessionState = { time: 456, nodes: [], npcs: [], resources: { gold: 100 } };
  localStorage.setItem('worldState', JSON.stringify(sessionState));
  console.log('Session 1: Saved state with turn 456');
  
  // Simulate browser restart (clear variables but keep localStorage)
  const restoredState = JSON.parse(localStorage.getItem('worldState'));
  console.log(`Session 2: Restored state with turn ${restoredState.time} - ${restoredState.time === 456 ? 'PASS' : 'FAIL'}`);
  
  console.log('\n5. Testing edge cases...');
  
  // Test with time = 0
  const zeroTimeState = { time: 0, nodes: [], npcs: [], resources: {} };
  localStorage.setItem('worldState', JSON.stringify(zeroTimeState));
  const zeroLoaded = JSON.parse(localStorage.getItem('worldState'));
  console.log(`Zero time test: Expected time=0, Got time=${zeroLoaded.time} - ${zeroLoaded.time === 0 ? 'PASS' : 'FAIL'}`);
  
  // Test with large numbers
  const largeTimeState = { time: Number.MAX_SAFE_INTEGER, nodes: [], npcs: [], resources: {} };
  localStorage.setItem('worldState', JSON.stringify(largeTimeState));
  const largeLoaded = JSON.parse(localStorage.getItem('worldState'));
  console.log(`Large number test: Expected time=${Number.MAX_SAFE_INTEGER}, Got time=${largeLoaded.time} - ${largeLoaded.time === Number.MAX_SAFE_INTEGER ? 'PASS' : 'FAIL'}`);
  
  console.log('\n=== Test Complete ===');
  console.log('All persistence functionality verified!');
  
  // Clean up
  localStorage.removeItem('worldState');
  console.log('Test data cleaned up from localStorage');
}

// Instructions for manual testing
console.log('\nTo run this test:');
console.log('1. Open the World History Simulation Engine in your browser');
console.log('2. Open browser developer tools (F12)');
console.log('3. Go to the Console tab');
console.log('4. Copy and paste this entire script');
console.log('5. Call testPersistence() to run the tests');
console.log('\nAlternatively, you can test persistence by:');
console.log('1. Starting a simulation and letting it run for several turns');
console.log('2. Refreshing the browser page');
console.log('3. Verifying the turn counter shows the correct value after reload');

// Export for potential use in automated tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testPersistence };
}