// test-npc-scalability.js - NPC Scalability Test
// Tests how many NPCs the simulation can handle before failure

console.log('🧪 NPC Scalability Test - Finding Performance Limits...\n');

// Dynamic imports for ES modules
let WorldBuilder, SimulationService, LocalStorageWorldRepository;

async function loadModules() {
  try {
    const wb = await import('./src/domain/services/WorldBuilder.js');
    WorldBuilder = wb.default;

    const ss = await import('./src/application/use-cases/services/SimulationService.js');
    SimulationService = ss.default;

    const lsr = await import('./src/infrastructure/LocalStorageWorldRepository.js');
    LocalStorageWorldRepository = lsr.default;

    console.log('✅ Modules loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load modules:', error.message);
    process.exit(1);
  }
}

// Mock localStorage for Node.js environment
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// Test configuration
const NPC_COUNTS = [100, 300, 500, 1000, 2000, 5000, 10000];
const TURNS_PER_TEST = 3; // Process this many turns per NPC count
const MAX_TEST_TIME = 30000; // 30 seconds max per test

/**
 * Creates a test character with minimal required data
 */
function createTestCharacter(id, index) {
  return {
    id: `test-npc-${id}-${index}`,
    name: `Test NPC ${index}`,
    lodTier: 'background', // Use background tier for most NPCs
    attributes: {
      strength: 10 + Math.floor(Math.random() * 6),
      dexterity: 10 + Math.floor(Math.random() * 6),
      constitution: 10 + Math.floor(Math.random() * 6),
      intelligence: 10 + Math.floor(Math.random() * 6),
      wisdom: 10 + Math.floor(Math.random() * 6),
      charisma: 10 + Math.floor(Math.random() * 6)
    },
    consciousness: {
      frequency: 7.0 + (Math.random() * 2),
      coherence: 0.5 + (Math.random() * 0.3),
      behavioralState: {
        energy: 'moderate',
        focus: 'balanced',
        mood: 'content',
        socialDrive: 0.5 + (Math.random() * 0.4),
        riskTolerance: 0.4 + (Math.random() * 0.3),
        ambition: 0.5 + (Math.random() * 0.4)
      }
    },
    personality: {
      traits: [
        { id: 'empathy', intensity: Math.random() },
        { id: 'aggression', intensity: Math.random() }
      ]
    },
    assignments: {
      nodes: new Set(['test-node']),
      interactions: new Set(),
      settlements: new Set(['test-settlement'])
    },
    currentNodeId: 'test-node'
  };
}

/**
 * Creates a test world with specified number of NPCs
 */
function createTestWorld(npcCount) {
  console.log(`   Creating world with ${npcCount} NPCs...`);

  const repository = new LocalStorageWorldRepository();
  const worldBuilder = new WorldBuilder(repository);

  // Create world
  const world = worldBuilder.createWorld(
    `Scalability Test - ${npcCount} NPCs`,
    `Testing simulation performance with ${npcCount} characters`
  );

  // Create a test node
  const testNode = worldBuilder.addNode({
    id: 'test-node',
    name: 'Test Settlement',
    type: 'settlement',
    environmentalProperties: {
      climate: 'temperate',
      season: 'spring',
      prosperous: true,
      crowded: false
    },
    culturalContext: {
      language: 'common',
      traditions: []
    },
    resourceAvailability: {
      food: 'sufficient',
      water: 'sufficient',
      materials: 'sufficient'
    }
  });

  // Create a test settlement
  const testSettlement = worldBuilder.addSettlement({
    id: 'test-settlement',
    name: 'Test Settlement',
    government: {
      type: 'monarchy',
      leader: null,
      policies: []
    },
    economy: {
      currency: 'gold',
      trade: [],
      taxes: []
    },
    culture: {
      traits: [],
      traditions: []
    },
    resources: {
      food: 100,
      water: 100,
      materials: 100
    },
    buildings: [],
    population: {
      composition: {},
      growth: 0,
      migration: 0
    },
    relationships: {
      diplomatic: new Map(),
      trade: new Map(),
      conflict: new Map()
    }
  });

  // Add NPCs
  const startTime = performance.now();
  for (let i = 0; i < npcCount; i++) {
    const character = createTestCharacter(`world-${npcCount}`, i);
    worldBuilder.addCharacter(character);
  }
  const endTime = performance.now();

  console.log(`   ✅ World created in ${(endTime - startTime).toFixed(2)}ms`);
  console.log(`   - Nodes: ${world.nodes.size}`);
  console.log(`   - Characters: ${world.characters.size}`);
  console.log(`   - Settlements: ${world.settlements.size}`);

  return world;
}

/**
 * Gets current memory usage
 */
function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024) // MB
    };
  }
  return { rss: 0, heapUsed: 0, heapTotal: 0, external: 0 };
}

/**
 * Runs scalability test for a specific NPC count
 */
async function runScalabilityTest(npcCount) {
  console.log(`\n🧪 Testing ${npcCount} NPCs...`);

  const testStartTime = performance.now();
  const initialMemory = getMemoryUsage();

  try {
    // Create world
    const world = createTestWorld(npcCount);
    const worldCreationTime = performance.now();

    // Initialize simulation
    console.log('   Initializing simulation...');
    const repository = new LocalStorageWorldRepository();
    const simulationService = new SimulationService(
      new WorldBuilder(repository),
      null, // historyGenerator
      null, // turnManager
      repository
    );

    await simulationService.initializeSimulation(world);
    const initTime = performance.now();

    console.log('   Processing turns...');

    // Process turns
    let totalTurnTime = 0;
    let turnResults = [];

    for (let turn = 1; turn <= TURNS_PER_TEST; turn++) {
      const turnStart = performance.now();

      try {
        const result = await simulationService.processTurn();
        const turnEnd = performance.now();
        const turnDuration = turnEnd - turnStart;

        if (!result.success) {
          throw new Error(`Turn ${turn} failed: ${result.error}`);
        }

        totalTurnTime += turnDuration;
        turnResults.push({
          turn,
          duration: turnDuration,
          success: true
        });

        console.log(`     Turn ${turn}: ${(turnDuration).toFixed(2)}ms`);

        // Check for timeout
        if (performance.now() - testStartTime > MAX_TEST_TIME) {
          throw new Error(`Test timeout exceeded ${MAX_TEST_TIME}ms`);
        }

      } catch (turnError) {
        console.log(`     Turn ${turn}: FAILED - ${turnError.message}`);
        turnResults.push({
          turn,
          duration: performance.now() - turnStart,
          success: false,
          error: turnError.message
        });
        break;
      }
    }

    const testEndTime = performance.now();
    const finalMemory = getMemoryUsage();

    const results = {
      npcCount,
      success: turnResults.every(r => r.success),
      totalTime: testEndTime - testStartTime,
      worldCreationTime: worldCreationTime - testStartTime,
      initTime: initTime - worldCreationTime,
      averageTurnTime: totalTurnTime / turnResults.length,
      totalTurnTime,
      turnsProcessed: turnResults.filter(r => r.success).length,
      memoryDelta: {
        rss: finalMemory.rss - initialMemory.rss,
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal
      },
      finalMemory,
      turnResults
    };

    console.log(`   ✅ Test completed in ${(results.totalTime).toFixed(2)}ms`);
    console.log(`   - Turns processed: ${results.turnsProcessed}/${TURNS_PER_TEST}`);
    console.log(`   - Average turn time: ${results.averageTurnTime.toFixed(2)}ms`);
    console.log(`   - Memory delta: +${results.memoryDelta.heapUsed}MB heap`);

    return results;

  } catch (error) {
    const testEndTime = performance.now();
    const finalMemory = getMemoryUsage();

    console.log(`   ❌ Test failed after ${(testEndTime - testStartTime).toFixed(2)}ms: ${error.message}`);

    return {
      npcCount,
      success: false,
      totalTime: testEndTime - testStartTime,
      error: error.message,
      memoryDelta: {
        rss: finalMemory.rss - initialMemory.rss,
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal
      },
      finalMemory
    };
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting NPC Scalability Tests...\n');

  // Load ES modules first
  await loadModules();

  const results = [];
  let failurePoint = null;

  for (const npcCount of NPC_COUNTS) {
    const result = await runScalabilityTest(npcCount);
    results.push(result);

    if (!result.success && !failurePoint) {
      failurePoint = npcCount;
      console.log(`\n⚠️  First failure detected at ${npcCount} NPCs`);
    }

    // Add a small delay between tests to allow cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n📊 Scalability Test Summary\n');

  console.log('Results:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const timeStr = result.totalTime ? `${result.totalTime.toFixed(2)}ms` : 'N/A';
    const memStr = result.memoryDelta ? `+${result.memoryDelta.heapUsed}MB` : 'N/A';
    const turnsStr = result.turnsProcessed !== undefined ? `${result.turnsProcessed}/${TURNS_PER_TEST}` : 'N/A';

    console.log(`${status} ${result.npcCount} NPCs: ${timeStr}, ${turnsStr} turns, ${memStr}`);
  });

  if (failurePoint) {
    console.log(`\n🎯 Performance Limit: System fails at ${failurePoint} NPCs`);
    console.log(`   Last successful: ${results.find(r => r.npcCount < failurePoint)?.npcCount || 'None'} NPCs`);
  } else {
    console.log(`\n🎉 All tests passed! System handles ${NPC_COUNTS[NPC_COUNTS.length - 1]} NPCs successfully`);
  }

  // Performance analysis
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 1) {
    console.log('\n📈 Performance Scaling Analysis:');
    successfulResults.forEach((result, index) => {
      if (index > 0) {
        const prev = successfulResults[index - 1];
        const npcRatio = result.npcCount / prev.npcCount;
        const timeRatio = result.averageTurnTime / prev.averageTurnTime;
        const scaling = timeRatio / npcRatio;

        console.log(`   ${prev.npcCount}→${result.npcCount}: ${scaling.toFixed(2)}x scaling factor`);
      }
    });
  }

  console.log('\n🏁 Scalability testing completed!');
}

// Run the tests
runAllTests().catch(error => {
  console.error('\n💥 Fatal error during testing:', error);
  process.exit(1);
});