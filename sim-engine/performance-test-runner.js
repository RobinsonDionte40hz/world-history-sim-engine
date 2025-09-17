// performance-test-runner.js - Simple performance test for LOD system

const LODManager = require('./src/domain/services/LODManager.js');

/**
 * Simple performance test for LOD system
 */
async function runLODPerformanceTest() {
  console.log('🚀 Starting LOD Performance Test...\n');

  const lodManager = new LODManager();

  // Create test characters
  const characters = [
    // Hero characters (full processing)
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `hero-${i}`,
      name: `Hero Character ${i}`,
      lodTier: 'hero',
      consciousness: { frequency: 0.7 + Math.random() * 0.3, coherence: 0.6 + Math.random() * 0.4 },
      attributes: {
        strength: 10 + Math.floor(Math.random() * 10),
        dexterity: 10 + Math.floor(Math.random() * 10),
        constitution: 10 + Math.floor(Math.random() * 10),
        intelligence: 10 + Math.floor(Math.random() * 10),
        wisdom: 10 + Math.floor(Math.random() * 10),
        charisma: 10 + Math.floor(Math.random() * 10)
      },
      assignments: {
        nodes: new Set(['node-1']),
        interactions: new Set(['interact-1']),
        settlements: new Set(['settlement-1'])
      },
      currentNode: 'node-1'
    })),

    // Group characters (statistical processing)
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `group-${i}`,
      name: `Group Character ${i}`,
      lodTier: 'group',
      populationGroupId: `group-${i}`,
      groupStatistics: {
        size: 10 + Math.floor(Math.random() * 20),
        averageWealth: 100 + Math.random() * 200,
        morale: Math.random(),
        productivity: Math.random()
      },
      assignments: {
        nodes: new Set(['node-1']),
        interactions: new Set(),
        settlements: new Set(['settlement-1'])
      },
      currentNode: 'node-1'
    })),

    // Background characters (minimal processing)
    ...Array.from({ length: 50 }, (_, i) => ({
      id: `bg-${i}`,
      name: `Background Character ${i}`,
      lodTier: 'background',
      assignments: {
        nodes: new Set(),
        interactions: new Set(),
        settlements: new Set(['settlement-1'])
      },
      currentNode: 'node-1',
      demographicData: {
        ageGroup: ['young', 'adult', 'elder'][Math.floor(Math.random() * 3)],
        occupation: ['farmer', 'merchant', 'craftsman', 'guard'][Math.floor(Math.random() * 4)],
        count: 5 + Math.floor(Math.random() * 15)
      }
    }))
  ];

  console.log(`📊 Testing with ${characters.length} characters:`);
  console.log(`   - ${characters.filter(c => c.lodTier === 'hero').length} Hero characters`);
  console.log(`   - ${characters.filter(c => c.lodTier === 'group').length} Group characters`);
  console.log(`   - ${characters.filter(c => c.lodTier === 'background').length} Background characters\n`);

  // Test individual character processing
  console.log('⚡ Testing individual character processing...');
  const individualStart = performance.now();

  for (const character of characters) {
    const result = lodManager.processCharacter(character, {}, {});
    if (result.error) {
      console.log(`❌ Error processing ${character.name}: ${result.error}`);
    }
  }

  const individualEnd = performance.now();
  const individualTime = individualEnd - individualStart;
  const avgIndividualTime = individualTime / characters.length;

  console.log(`✅ Individual processing: ${individualTime.toFixed(2)}ms total`);
  console.log(`📈 Average per character: ${avgIndividualTime.toFixed(2)}ms`);
  console.log(`🚀 Throughput: ${(characters.length / (individualTime / 1000)).toFixed(1)} characters/second\n`);

  // Test tier-based processing
  console.log('🎯 Testing tier-based processing...');
  const tierStart = performance.now();

  const heroChars = characters.filter(c => c.lodTier === 'hero');
  const groupChars = characters.filter(c => c.lodTier === 'group');
  const bgChars = characters.filter(c => c.lodTier === 'background');

  const heroResult = lodManager.processCharacterTier('hero', heroChars, {}, {});
  const groupResult = lodManager.processCharacterTier('group', groupChars, {}, {});
  const bgResult = lodManager.processCharacterTier('background', bgChars, {}, {});

  const tierEnd = performance.now();
  const tierTime = tierEnd - tierStart;

  console.log(`✅ Tier processing: ${tierTime.toFixed(2)}ms total`);
  console.log(`📊 Hero tier: ${heroResult.averageProcessingTime.toFixed(2)}ms avg (${heroResult.processedCount} chars)`);
  console.log(`📊 Group tier: ${groupResult.averageProcessingTime.toFixed(2)}ms avg (${groupResult.processedCount} chars)`);
  console.log(`📊 Background tier: ${bgResult.averageProcessingTime.toFixed(2)}ms avg (${bgResult.processedCount} chars)\n`);

  // Test pre/post turn processing
  console.log('🔄 Testing pre/post turn LOD processing...');

  const mockWorldState = {
    turn: 1,
    characters,
    settlements: [{
      id: 'settlement-1',
      name: 'Test Settlement',
      assignedCharacters: characters.map(c => c.id)
    }],
    events: []
  };

  const preTurnStart = performance.now();
  const preTurnResult = await lodManager.processPreTurnLOD(mockWorldState);
  const preTurnEnd = performance.now();

  const postTurnStart = performance.now();
  const postTurnResult = await lodManager.processPostTurnLOD(mockWorldState, { events: [] });
  const postTurnEnd = performance.now();

  console.log(`✅ Pre-turn processing: ${(preTurnEnd - preTurnStart).toFixed(2)}ms`);
  console.log(`✅ Post-turn processing: ${(postTurnEnd - postTurnStart).toFixed(2)}ms`);
  console.log(`📊 Pre-turn events: ${preTurnResult.events.length}`);
  console.log(`📊 Post-turn events: ${postTurnResult.events.length}\n`);

  // Performance analysis
  console.log('📋 Performance Analysis:');
  console.log(`🎯 Hero processing target: <50ms per character`);
  console.log(`   Actual: ${heroResult.averageProcessingTime.toFixed(2)}ms - ${heroResult.averageProcessingTime < 50 ? '✅ PASS' : '❌ FAIL'}`);

  console.log(`🎯 Group processing target: <5ms per character`);
  console.log(`   Actual: ${groupResult.averageProcessingTime.toFixed(2)}ms - ${groupResult.averageProcessingTime < 5 ? '✅ PASS' : '❌ FAIL'}`);

  console.log(`🎯 Background processing target: <1ms per character`);
  console.log(`   Actual: ${bgResult.averageProcessingTime.toFixed(2)}ms - ${bgResult.averageProcessingTime < 1 ? '✅ PASS' : '❌ FAIL'}`);

  console.log(`🎯 Total turn target: <2000ms for ${characters.length} characters`);
  const totalTurnTime = individualTime + tierTime + (preTurnEnd - preTurnStart) + (postTurnEnd - postTurnStart);
  console.log(`   Actual: ${totalTurnTime.toFixed(2)}ms - ${totalTurnTime < 2000 ? '✅ PASS' : '❌ FAIL'}`);

  // Memory usage check (if available)
  if (performance.memory) {
    const memUsage = performance.memory.usedJSHeapSize / (1024 * 1024);
    console.log(`\n💾 Memory usage: ${memUsage.toFixed(2)}MB`);
    console.log(`🎯 Memory target: <100MB - ${memUsage < 100 ? '✅ PASS' : '❌ FAIL'}`);
  }

  // Get LOD metrics
  const metrics = lodManager.getProcessingMetrics();
  console.log(`\n📊 LOD Processing Metrics:`);
  console.log(`   Total processed: ${metrics.totalProcessed}`);
  console.log(`   Average processing time: ${metrics.averageProcessingTime.toFixed(2)}ms`);
  console.log(`   Tier breakdown:`, metrics.tierBreakdown);

  console.log('\n🎉 LOD Performance Test Complete!');
}

// Run the test
runLODPerformanceTest().catch(console.error);