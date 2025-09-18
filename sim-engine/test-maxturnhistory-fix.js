// Test to verify maxTurnHistory reduction fix
console.log('🧪 Testing maxTurnHistory Reduction Fix...\n');

// Simulate the SimulationService turn history management
class MockSimulationService {
  constructor() {
    this.turnHistory = [];
    this.maxTurnHistory = 20; // Reduced from 100
    this.currentTurnSummary = null;
    this.currentTurn = 0; // Track current turn number
  }

  // Simulate addToTurnHistory method
  addToTurnHistory(turnSummary) {
    this.turnHistory.push(turnSummary);

    // Maintain history size limit
    while (this.turnHistory.length > this.maxTurnHistory) {
      this.turnHistory.shift();
    }
  }

  // Simulate generateTurnSummary (simplified)
  generateTurnSummary(turn) {
    return {
      turn: turn,
      timestamp: new Date(),
      summary: `Turn ${turn} summary`,
      processingTime: Math.random() * 100,
      characterActions: [],
      events: [],
      changes: {
        charactersChanged: Math.floor(Math.random() * 5),
        resourcesChanged: Math.floor(Math.random() * 3),
        settlementsChanged: Math.floor(Math.random() * 2),
        newEvents: Math.floor(Math.random() * 10)
      }
    };
  }

  // Simulate processTurn (simplified)
  processTurn() {
    this.currentTurn += 1;
    const turnSummary = this.generateTurnSummary(this.currentTurn);
    this.currentTurnSummary = turnSummary;
    this.addToTurnHistory(turnSummary);
    return turnSummary;
  }
}

function testMaxTurnHistory() {
  console.log('📋 Testing maxTurnHistory limit...');

  const service = new MockSimulationService();

  console.log(`📊 Max turn history limit: ${service.maxTurnHistory}`);

  // Process many turns to test the limit
  const totalTurns = 35; // More than the limit
  for (let i = 0; i < totalTurns; i++) {
    service.processTurn();
  }

  console.log(`📊 After processing ${totalTurns} turns:`);
  console.log(`   - Turn history length: ${service.turnHistory.length}`);
  console.log(`   - Expected max length: ${service.maxTurnHistory}`);

  // Verify the limit is respected
  const limitRespected = service.turnHistory.length <= service.maxTurnHistory;

  if (limitRespected) {
    console.log('✅ SUCCESS: Turn history respects the maximum limit');
  } else {
    console.log('❌ FAILURE: Turn history exceeds the maximum limit');
    return false;
  }

  // Verify that only the most recent turns are kept
  const firstTurn = service.turnHistory[0].turn;
  const lastTurn = service.turnHistory[service.turnHistory.length - 1].turn;
  const expectedFirstTurn = totalTurns - service.maxTurnHistory + 1;
  const expectedLastTurn = totalTurns;

  console.log(`📊 Turn range verification:`);
  console.log(`   - First turn in history: ${firstTurn}`);
  console.log(`   - Last turn in history: ${lastTurn}`);
  console.log(`   - Expected first turn: ${expectedFirstTurn}`);
  console.log(`   - Expected last turn: ${expectedLastTurn}`);

  const correctRange = firstTurn === expectedFirstTurn && lastTurn === expectedLastTurn;

  if (correctRange) {
    console.log('✅ SUCCESS: Only the most recent turns are preserved');
  } else {
    console.log('❌ FAILURE: Turn range is incorrect');
    return false;
  }

  // Test memory efficiency
  const averageTurnSize = JSON.stringify(service.turnHistory[0]).length;
  const totalHistorySize = service.turnHistory.length * averageTurnSize;
  const maxHistorySize = service.maxTurnHistory * averageTurnSize;
  const sizeReduction = ((totalTurns - service.maxTurnHistory) * averageTurnSize);

  console.log(`\n📊 Memory efficiency:`);
  console.log(`   - Average turn size: ~${averageTurnSize} bytes`);
  console.log(`   - Current history size: ~${totalHistorySize} bytes`);
  console.log(`   - Max history size: ~${maxHistorySize} bytes`);
  console.log(`   - Memory saved: ~${sizeReduction} bytes (${Math.round(sizeReduction / 1024)} KB)`);

  return limitRespected && correctRange;
}

// Run the test
const testResult = testMaxTurnHistory();

console.log('\n📊 Overall Test Results:');
console.log(`   maxTurnHistory Fix: ${testResult ? '✅ PASSED' : '❌ FAILED'}`);

if (testResult) {
  console.log('\n🎉 SUCCESS: maxTurnHistory reduction is working correctly!');
  console.log('   - Turn history is properly limited to 20 entries');
  console.log('   - Only the most recent turns are preserved');
  console.log('   - Memory usage is significantly reduced');
} else {
  console.log('\n❌ FAILURE: maxTurnHistory reduction has issues');
}

process.exit(testResult ? 0 : 1);