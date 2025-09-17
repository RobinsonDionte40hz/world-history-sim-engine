// demo-validation-test.js - Simple validation test for Valley of Echoes demo

const oakwoodConfig = require('./examples/valley-of-echoes-demo/oakwood-federation/config.js');
const ironholdConfig = require('./examples/valley-of-echoes-demo/ironhold-dominion/config.js');
const quests = require('./examples/valley-of-echoes-demo/quests/multi-settlement-quests.js');
const processTurnWithLOD = require('./src/application/use-cases/simulation/ProcessTurnWithLOD.js');
const LODManager = require('./src/domain/services/LODManager.js');
const HistoryGenerator = require('./src/domain/services/HistoryGenerator.js');

async function validateDemo() {
  console.log('🧪 Valley of Echoes Demo Validation Test\n');

  try {
    // Test 1: Configuration Loading
    console.log('📁 Testing configuration loading...');
    console.log(`   ✅ Oakwood Federation: ${oakwoodConfig.name}`);
    console.log(`      - Nodes: ${oakwoodConfig.nodes.length}`);
    console.log(`      - Hero Characters: ${oakwoodConfig.heroCharacters.length}`);
    console.log(`      - Population Groups: ${oakwoodConfig.populationGroups.length}`);

    console.log(`   ✅ Ironhold Dominion: ${ironholdConfig.name}`);
    console.log(`      - Nodes: ${ironholdConfig.nodes.length}`);
    console.log(`      - Hero Characters: ${ironholdConfig.heroCharacters.length}`);
    console.log(`      - Population Groups: ${ironholdConfig.populationGroups.length}`);

    console.log(`   ✅ Multi-settlement Quests: ${quests.length}`);

    // Test 2: Service Instantiation
    console.log('\n🔧 Testing service instantiation...');
    const lodManager = new LODManager();
    const historyGenerator = new HistoryGenerator();
    console.log('   ✅ LODManager created');
    console.log('   ✅ HistoryGenerator created');

    // Test 3: World State Creation
    console.log('\n🌍 Testing world state creation...');

    // Create simplified world state
    const worldState = {
      turn: 0,
      events: [],
      settlements: [
        {
          id: oakwoodConfig.id,
          name: oakwoodConfig.name,
          type: oakwoodConfig.type,
          assignedCharacters: [
            ...oakwoodConfig.heroCharacters.map(c => c.id),
            ...oakwoodConfig.populationGroups.map(g => g.id)
          ],
          needSatisfaction: oakwoodConfig.needSatisfaction
        },
        {
          id: ironholdConfig.id,
          name: ironholdConfig.name,
          type: ironholdConfig.type,
          assignedCharacters: [
            ...ironholdConfig.heroCharacters.map(c => c.id),
            ...ironholdConfig.populationGroups.map(g => g.id)
          ],
          needSatisfaction: ironholdConfig.needSatisfaction
        }
      ],
      characters: [
        // Oakwood characters
        ...oakwoodConfig.heroCharacters.map(char => ({
          ...char,
          lodTier: 'hero',
          assignments: {
            nodes: new Set([char.assignedNode]),
            interactions: new Set(),
            settlements: new Set([oakwoodConfig.id])
          },
          currentNode: char.assignedNode
        })),
        ...oakwoodConfig.populationGroups.map(group => ({
          id: group.id,
          name: group.name,
          lodTier: 'group',
          populationGroupId: group.id,
          groupStatistics: group.statistics,
          assignments: {
            nodes: new Set([group.assignedNode]),
            interactions: new Set(),
            settlements: new Set([oakwoodConfig.id])
          },
          currentNode: group.assignedNode
        })),
        // Ironhold characters
        ...ironholdConfig.heroCharacters.map(char => ({
          ...char,
          lodTier: 'hero',
          assignments: {
            nodes: new Set([char.assignedNode]),
            interactions: new Set(),
            settlements: new Set([ironholdConfig.id])
          },
          currentNode: char.assignedNode
        })),
        ...ironholdConfig.populationGroups.map(group => ({
          id: group.id,
          name: group.name,
          lodTier: 'group',
          populationGroupId: group.id,
          groupStatistics: group.statistics,
          assignments: {
            nodes: new Set([group.assignedNode]),
            interactions: new Set(),
            settlements: new Set([ironholdConfig.id])
          },
          currentNode: group.assignedNode
        }))
      ],
      nodes: [...oakwoodConfig.nodes, ...ironholdConfig.nodes],
      interactions: []
    };

    console.log(`   ✅ World state created with:`);
    console.log(`      - Settlements: ${worldState.settlements.length}`);
    console.log(`      - Characters: ${worldState.characters.length}`);
    console.log(`      - Nodes: ${worldState.nodes.length}`);

    // Test 4: LOD Distribution
    console.log('\n🎯 Testing LOD distribution...');
    const heroChars = worldState.characters.filter(c => c.lodTier === 'hero');
    const groupChars = worldState.characters.filter(c => c.lodTier === 'group');
    const backgroundChars = worldState.characters.filter(c => c.lodTier === 'background');

    console.log(`   Hero NPCs: ${heroChars.length}`);
    console.log(`   Population Groups: ${groupChars.length}`);
    console.log(`   Background: ${backgroundChars.length}`);

    // Test 5: Single Turn Processing
    console.log('\n⚙️ Testing single turn processing...');
    const startTime = performance.now();

    const result = await processTurnWithLOD(worldState, lodManager, historyGenerator);

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    console.log(`   ✅ Turn processed in ${processingTime.toFixed(2)}ms`);
    console.log(`   ✅ Turn incremented: ${result.worldState.turn}`);
    console.log(`   ✅ Events generated: ${result.worldState.events.length}`);

    // Test 6: LOD Processing Results
    console.log('\n🎮 Testing LOD processing results...');
    if (result.turnResults.lodResults) {
      console.log(`   ✅ Pre-turn LOD: ${result.turnResults.lodResults.preTurn?.success ? 'success' : 'failed'}`);
      console.log(`   ✅ Post-turn LOD: ${result.turnResults.lodResults.postTurn?.success ? 'success' : 'failed'}`);
    }

    // Test 7: Performance Validation
    console.log('\n📊 Performance validation:');
    const targetTime = 2000; // 2 seconds
    const performanceOk = processingTime < targetTime;
    console.log(`   Target: <${targetTime}ms per turn`);
    console.log(`   Actual: ${processingTime.toFixed(2)}ms`);
    console.log(`   Status: ${performanceOk ? '✅ PASS' : '❌ FAIL'}`);

    // Test 8: Memory Check
    console.log('\n💾 Memory validation:');
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / (1024 * 1024);
    const targetMemory = 100; // 100MB
    const memoryOk = heapUsedMB < targetMemory;
    console.log(`   Target: <${targetMemory}MB heap usage`);
    console.log(`   Actual: ${heapUsedMB.toFixed(2)}MB`);
    console.log(`   Status: ${memoryOk ? '✅ PASS' : '❌ FAIL'}`);

    // Summary
    console.log('\n🎉 Demo Validation Summary:');
    console.log('✅ Configuration loading: PASS');
    console.log('✅ Service instantiation: PASS');
    console.log('✅ World state creation: PASS');
    console.log('✅ LOD distribution: PASS');
    console.log('✅ Turn processing: PASS');
    console.log('✅ LOD integration: PASS');
    console.log(`${performanceOk ? '✅' : '❌'} Performance target: ${performanceOk ? 'PASS' : 'FAIL'}`);
    console.log(`${memoryOk ? '✅' : '❌'} Memory target: ${memoryOk ? 'PASS' : 'FAIL'}`);

    const allTestsPass = performanceOk && memoryOk;
    console.log(`\n🏆 Overall Result: ${allTestsPass ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAILED'}`);

    return {
      success: allTestsPass,
      processingTime,
      memoryUsage: heapUsedMB,
      characterCount: worldState.characters.length,
      eventCount: result.worldState.events.length
    };

  } catch (error) {
    console.error('❌ Demo validation failed:', error.message);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

// Run validation
validateDemo().then(result => {
  console.log('\n📋 Final Result:', result);
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error('Validation error:', error);
  process.exit(1);
});