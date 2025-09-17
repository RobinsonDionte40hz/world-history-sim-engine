// test-process-turn-with-lod.js - Simple test runner for ProcessTurnWithLOD

console.log('🧪 Testing ProcessTurnWithLOD Use Case...\n');

async function runTests() {
  try {
    console.log('Testing CommonJS imports...');

    // Use CommonJS require for compatibility
    const processTurnWithLOD = require('./src/application/use-cases/simulation/ProcessTurnWithLOD.js');
    const LODManager = require('./src/domain/services/LODManager.js');
    const HistoryGenerator = require('./src/domain/services/HistoryGenerator.js');

    console.log('✅ Imports successful');

    // Test basic instantiation
    const lodManager = new LODManager();
    const historyGenerator = new HistoryGenerator();

    console.log('✅ Service instantiation successful');

    // Test basic world state
    const mockWorldState = {
      turn: 1,
      events: [],
      characters: [
        {
          id: 'char-hero-001',
          name: 'Hero Merchant',
          lodTier: 'hero',
          consciousness: { frequency: 0.8, coherence: 0.7 },
          attributes: { strength: 12, dexterity: 14, constitution: 13, intelligence: 15, wisdom: 12, charisma: 16 },
          assignments: { nodes: new Set(['node-market']), interactions: new Set(['interact-trade']), settlements: new Set(['settlement-oakwood']) },
          currentNode: 'settlement-oakwood',
          playerInteractionCount: 3,
          inactivityTurns: 0
        }
      ],
      settlements: [
        {
          id: 'settlement-oakwood',
          name: 'Oakwood Village',
          type: 'village',
          needSatisfaction: {
            current: {
              overall: 0.75,
              needs: {
                food: 0.8,
                water: 0.9,
                shelter: 0.7,
                security: 0.6,
                goods: 0.8,
                services: 0.7
              }
            },
            activeConsequences: []
          },
          assignedCharacters: ['char-hero-001'],
          environmentalProperties: { climate: 'temperate', season: 'spring' }
        }
      ]
    };

    console.log('Testing ProcessTurnWithLOD execution...');

    const startTime = performance.now();
    const result = await processTurnWithLOD(mockWorldState, lodManager, historyGenerator);
    const endTime = performance.now();

    console.log('✅ ProcessTurnWithLOD executed successfully');
    console.log(`   - Processing time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`   - Turn incremented: ${result.worldState.turn - 1} → ${result.worldState.turn}`);
    console.log(`   - Events generated: ${result.worldState.events.length}`);

    // Check LOD results
    if (result.turnResults.lodResults) {
      console.log('✅ LOD processing results present');
      console.log(`   - Pre-turn: ${result.turnResults.lodResults.preTurn?.success ? 'success' : 'failed'}`);
      console.log(`   - Post-turn: ${result.turnResults.lodResults.postTurn?.success ? 'success' : 'failed'}`);
    }

    console.log('\n🎉 ProcessTurnWithLOD test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

runTests();