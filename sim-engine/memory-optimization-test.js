// memory-optimization-test.js - Memory usage and optimization test

const LODManager = require('./src/domain/services/LODManager.js');

/**
 * Test memory usage and identify optimization opportunities
 */
async function runMemoryOptimizationTest() {
  console.log('🧠 Memory Optimization Test for LOD System\n');

  const lodManager = new LODManager();

  // Test 1: Memory usage with increasing character counts
  console.log('📈 Testing memory scaling with character count...');

  const characterCounts = [10, 50, 100, 200, 500];

  for (const count of characterCounts) {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const initialMemory = process.memoryUsage().heapUsed;

    // Create characters
    const characters = Array.from({ length: count }, (_, i) => ({
      id: `char-${i}`,
      name: `Character ${i}`,
      lodTier: i < count * 0.1 ? 'hero' : i < count * 0.3 ? 'group' : 'background',
      consciousness: { frequency: 0.7, coherence: 0.8 },
      attributes: { strength: 12, dexterity: 14, constitution: 13, intelligence: 15, wisdom: 12, charisma: 16 },
      assignments: {
        nodes: new Set(['node-1']),
        interactions: new Set(['interact-1']),
        settlements: new Set(['settlement-1'])
      },
      currentNode: 'node-1'
    }));

    // Process characters
    const startTime = performance.now();
    for (const character of characters) {
      lodManager.processCharacter(character, {}, {});
    }
    const endTime = performance.now();

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryDelta = finalMemory - initialMemory;
    const memoryDeltaMB = memoryDelta / (1024 * 1024);

    console.log(`   ${count} characters:`);
    console.log(`     - Processing time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`     - Memory delta: ${memoryDeltaMB.toFixed(2)}MB`);
    console.log(`     - Memory per character: ${(memoryDelta / count / 1024).toFixed(2)}KB`);
    console.log(`     - Throughput: ${(count / ((endTime - startTime) / 1000)).toFixed(0)} chars/sec\n`);
  }

  // Test 2: Memory leak detection
  console.log('🔍 Testing for memory leaks...');

  let leakTestMemory = [];
  for (let i = 0; i < 10; i++) {
    if (global.gc) global.gc();

    const characters = Array.from({ length: 100 }, (_, j) => ({
      id: `leak-test-${i}-${j}`,
      name: `Leak Test ${i}-${j}`,
      lodTier: 'background',
      assignments: { settlements: new Set(['settlement-1']) }
    }));

    for (const character of characters) {
      lodManager.processCharacter(character, {}, {});
    }

    const memUsage = process.memoryUsage().heapUsed / (1024 * 1024);
    leakTestMemory.push(memUsage);
    console.log(`   Iteration ${i + 1}: ${memUsage.toFixed(2)}MB`);
  }

  const memoryIncrease = leakTestMemory[leakTestMemory.length - 1] - leakTestMemory[0];
  console.log(`\n📊 Memory leak analysis:`);
  console.log(`   - Initial memory: ${leakTestMemory[0].toFixed(2)}MB`);
  console.log(`   - Final memory: ${leakTestMemory[leakTestMemory.length - 1].toFixed(2)}MB`);
  console.log(`   - Net increase: ${memoryIncrease.toFixed(2)}MB`);
  console.log(`   - Memory stable: ${Math.abs(memoryIncrease) < 5 ? '✅ YES' : '❌ NO'}`);

  // Test 3: Object reuse optimization
  console.log('\n🔄 Testing object reuse optimization...');

  const reusableWorldState = {
    turn: 1,
    events: [],
    settlements: [{ id: 'settlement-1', name: 'Test Settlement' }]
  };

  const reusableTurnContext = {
    availableInteractions: new Map(),
    environmentalFactors: { season: 'spring', weather: 'clear' }
  };

  const characters = Array.from({ length: 100 }, (_, i) => ({
    id: `reuse-${i}`,
    name: `Reuse Character ${i}`,
    lodTier: 'background',
    assignments: { settlements: new Set(['settlement-1']) }
  }));

  const startTime = performance.now();
  for (const character of characters) {
    lodManager.processCharacter(character, reusableWorldState, reusableTurnContext);
  }
  const endTime = performance.now();

  console.log(`   - Object reuse processing: ${(endTime - startTime).toFixed(2)}ms`);
  console.log(`   - Throughput with reuse: ${(characters.length / ((endTime - startTime) / 1000)).toFixed(0)} chars/sec`);

  // Test 4: Performance metrics analysis
  console.log('\n📊 Performance Metrics Analysis:');
  const metrics = lodManager.getProcessingMetrics();

  console.log(`   - Total characters processed: ${metrics.totalProcessed}`);
  console.log(`   - Average processing time: ${metrics.averageProcessingTime.toFixed(3)}ms`);
  console.log(`   - Tier breakdown:`, metrics.tierBreakdown);

  // Recommendations
  console.log('\n💡 Optimization Recommendations:');

  if (metrics.averageProcessingTime > 1) {
    console.log('   ⚠️  Consider optimizing processing logic for better performance');
  } else {
    console.log('   ✅ Processing performance is excellent');
  }

  if (memoryIncrease > 10) {
    console.log('   ⚠️  Potential memory leak detected - investigate object retention');
  } else {
    console.log('   ✅ Memory usage appears stable');
  }

  const heroRatio = metrics.tierBreakdown.hero / metrics.totalProcessed;
  if (heroRatio > 0.2) {
    console.log('   ⚠️  High ratio of hero characters - consider LOD tier balancing');
  } else {
    console.log('   ✅ LOD tier distribution looks good');
  }

  console.log('\n🎉 Memory Optimization Test Complete!');
}

// Enable garbage collection for testing
if (typeof global !== 'undefined' && !global.gc) {
  console.log('💡 Note: Run with --expose-gc for better memory testing');
}

// Run the test
runMemoryOptimizationTest().catch(console.error);