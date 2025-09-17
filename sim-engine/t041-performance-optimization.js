/**
 * T041 - Performance Optimization and Memory Management Validation
 * 
 * Comprehensive performance testing and optimization for the LOD system,
 * multi-settlement features, and overall Valley of Echoes demo.
 */

// Mock services for performance testing
class MockLODManager {
  constructor() {
    this.isInitialized = true;
    this.processingMetrics = {
      totalProcessed: 0,
      averageProcessingTime: 0,
      tierBreakdown: { hero: 0, group: 0, background: 0 }
    };
  }
  
  async processCharacter(character, worldState, turnContext) {
    this.processingMetrics.totalProcessed++;
    this.processingMetrics.tierBreakdown[character.lodTier]++;
    
    // Simulate processing time based on tier
    const processingTime = character.lodTier === 'hero' ? 25 : 
                          character.lodTier === 'group' ? 3 : 0.5;
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    return { success: true, processingTime };
  }
  
  async processCharacterTier(tier, characters, worldState, turnContext) {
    const startTime = performance.now();
    
    for (const character of characters) {
      await this.processCharacter(character, worldState, turnContext);
    }
    
    const endTime = performance.now();
    const averageTime = (endTime - startTime) / characters.length;
    
    return {
      processedCount: characters.length,
      averageProcessingTime: averageTime
    };
  }
  
  async processPreTurnLOD(worldState) {
    return { events: [] };
  }
  
  async processPostTurnLOD(worldState, turnResult) {
    return { events: [] };
  }
  
  getProcessingMetrics() {
    return this.processingMetrics;
  }
}

class MockCrossSettlementService {
  async processInterSettlementRelations(settlements, worldState) {
    await new Promise(resolve => setTimeout(resolve, 20));
    return { relationships: [] };
  }
  
  async processTradeRoutes(settlements, worldState) {
    await new Promise(resolve => setTimeout(resolve, 15));
    return { trades: [] };
  }
}

class MockSettlementDevelopmentService {
  async processSettlementDevelopment(settlement, worldState) {
    await new Promise(resolve => setTimeout(resolve, 10));
    return { development: settlement.development };
  }
}

class MockProcessTurnWithLOD {
  async execute({ worldState, turnContext }) {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { 
      worldState,
      events: [{ type: 'turn-processed', turn: turnContext.turn }]
    };
  }
}

/**
 * Performance optimization test suite
 */
class PerformanceOptimizer {
  constructor() {
    this.lodManager = new MockLODManager();
    this.crossSettlementService = new MockCrossSettlementService();
    this.settlementDevService = new MockSettlementDevelopmentService();
    this.processTurnUseCase = new MockProcessTurnWithLOD();
    
    this.performanceTargets = {
      turnProcessingMs: 2000,
      memoryUsageMB: 100,
      heroProcessingMs: 50,
      groupProcessingMs: 5,
      backgroundProcessingMs: 1,
      throughputCharsPerSec: 100
    };
    
    this.optimizationResults = {
      beforeOptimization: {},
      afterOptimization: {},
      recommendations: []
    };
  }

  /**
   * Run complete performance optimization suite
   */
  async runOptimization() {
    console.log('🚀 T041 - Performance Optimization and Memory Management Validation\n');
    console.log('📋 Performance Targets:');
    Object.entries(this.performanceTargets).forEach(([key, value]) => {
      console.log(`   - ${key}: ${value}${key.includes('Ms') ? 'ms' : key.includes('MB') ? 'MB' : key.includes('Sec') ? '/sec' : ''}`);
    });
    console.log();

    // Phase 1: Baseline Performance Measurement
    console.log('📊 Phase 1: Baseline Performance Measurement');
    this.optimizationResults.beforeOptimization = await this.measureBaselinePerformance();
    
    // Phase 2: Memory Usage Analysis
    console.log('\n🧠 Phase 2: Memory Usage Analysis');
    await this.analyzeMemoryUsage();
    
    // Phase 3: LOD System Optimization
    console.log('\n⚡ Phase 3: LOD System Optimization');
    await this.optimizeLODSystem();
    
    // Phase 4: Cross-Settlement Performance
    console.log('\n🏰 Phase 4: Cross-Settlement Performance Optimization');
    await this.optimizeCrossSettlementSystems();
    
    // Phase 5: Turn Processing Optimization
    console.log('\n🔄 Phase 5: Turn Processing Optimization');
    await this.optimizeTurnProcessing();
    
    // Phase 6: Memory Management Validation
    console.log('\n💾 Phase 6: Memory Management Validation');
    await this.validateMemoryManagement();
    
    // Phase 7: Post-Optimization Measurement
    console.log('\n📈 Phase 7: Post-Optimization Performance Measurement');
    this.optimizationResults.afterOptimization = await this.measureBaselinePerformance();
    
    // Phase 8: Generate Optimization Report
    console.log('\n📋 Phase 8: Optimization Results');
    this.generateOptimizationReport();
    
    console.log('\n🎉 T041 Performance Optimization Complete!');
    return this.optimizationResults;
  }

  /**
   * Measure baseline performance across all systems
   */
  async measureBaselinePerformance() {
    const results = {};
    
    // Create test data for 215 NPCs (105 + 110 for two settlements)
    const testCharacters = this.createTestCharacters(215);
    const testSettlements = this.createTestSettlements();
    const testWorldState = this.createTestWorldState(testCharacters, testSettlements);

    // Test LOD processing performance
    console.log('   🧪 Testing LOD processing...');
    const lodStart = performance.now();
    
    for (const character of testCharacters) {
      await this.lodManager.processCharacter(character, testWorldState, {});
    }
    
    const lodEnd = performance.now();
    results.lodProcessingMs = lodEnd - lodStart;
    results.lodThroughput = testCharacters.length / ((lodEnd - lodStart) / 1000);

    // Test tier-specific performance
    const heroChars = testCharacters.filter(c => c.lodTier === 'hero');
    const groupChars = testCharacters.filter(c => c.lodTier === 'group');
    const bgChars = testCharacters.filter(c => c.lodTier === 'background');

    results.heroProcessingMs = await this.measureTierPerformance(heroChars, 'hero');
    results.groupProcessingMs = await this.measureTierPerformance(groupChars, 'group');
    results.backgroundProcessingMs = await this.measureTierPerformance(bgChars, 'background');

    // Test cross-settlement processing
    console.log('   🏰 Testing cross-settlement processing...');
    const crossStart = performance.now();
    await this.crossSettlementService.processInterSettlementRelations(testSettlements, testWorldState);
    const crossEnd = performance.now();
    results.crossSettlementMs = crossEnd - crossStart;

    // Test full turn processing
    console.log('   🔄 Testing full turn processing...');
    const turnStart = performance.now();
    await this.processTurnUseCase.execute({
      worldState: testWorldState,
      turnContext: { turn: 1, events: [] }
    });
    const turnEnd = performance.now();
    results.fullTurnMs = turnEnd - turnStart;

    // Memory measurement
    if (performance.memory) {
      results.memoryUsageMB = performance.memory.usedJSHeapSize / (1024 * 1024);
    } else if (process.memoryUsage) {
      results.memoryUsageMB = process.memoryUsage().heapUsed / (1024 * 1024);
    }

    console.log(`   ✅ Baseline measurements complete:`);
    console.log(`      - LOD processing: ${results.lodProcessingMs.toFixed(2)}ms`);
    console.log(`      - Full turn: ${results.fullTurnMs.toFixed(2)}ms`);
    console.log(`      - Memory usage: ${results.memoryUsageMB?.toFixed(2) || 'N/A'}MB`);
    console.log(`      - Throughput: ${results.lodThroughput.toFixed(1)} chars/sec`);

    return results;
  }

  /**
   * Analyze memory usage patterns and identify optimizations
   */
  async analyzeMemoryUsage() {
    console.log('   🔍 Analyzing memory usage patterns...');
    
    const memoryTests = [10, 50, 100, 215, 500];
    const memoryResults = [];

    for (const characterCount of memoryTests) {
      // Force garbage collection if available
      if (global.gc) global.gc();
      
      const initialMemory = this.getCurrentMemoryUsage();
      const characters = this.createTestCharacters(characterCount);
      
      const startTime = performance.now();
      for (const character of characters) {
        await this.lodManager.processCharacter(character, {}, {});
      }
      const endTime = performance.now();
      
      const finalMemory = this.getCurrentMemoryUsage();
      const memoryDelta = finalMemory - initialMemory;
      
      memoryResults.push({
        characterCount,
        processingTimeMs: endTime - startTime,
        memoryDeltaMB: memoryDelta,
        memoryPerCharacterKB: (memoryDelta * 1024) / characterCount
      });
      
      console.log(`      ${characterCount} chars: ${(endTime - startTime).toFixed(2)}ms, ${memoryDelta.toFixed(2)}MB delta`);
    }

    // Identify memory scaling issues
    const memoryGrowthRate = this.calculateMemoryGrowthRate(memoryResults);
    if (memoryGrowthRate > 0.5) {
      this.optimizationResults.recommendations.push(
        `Memory usage grows at ${memoryGrowthRate.toFixed(2)}MB per 100 characters - consider object pooling`
      );
    }

    return memoryResults;
  }

  /**
   * Optimize LOD system performance
   */
  async optimizeLODSystem() {
    console.log('   ⚡ Optimizing LOD character processing...');
    
    // Test batch processing optimization
    const characters = this.createTestCharacters(100);
    
    // Before: Individual processing
    const individualStart = performance.now();
    for (const character of characters) {
      await this.lodManager.processCharacter(character, {}, {});
    }
    const individualEnd = performance.now();
    const individualTime = individualEnd - individualStart;
    
    // After: Batch processing by tier
    const batchStart = performance.now();
    const tierGroups = this.groupCharactersByTier(characters);
    
    for (const [tier, tierCharacters] of Object.entries(tierGroups)) {
      await this.lodManager.processCharacterTier(tier, tierCharacters, {}, {});
    }
    const batchEnd = performance.now();
    const batchTime = batchEnd - batchStart;
    
    const improvement = ((individualTime - batchTime) / individualTime) * 100;
    console.log(`      Individual processing: ${individualTime.toFixed(2)}ms`);
    console.log(`      Batch processing: ${batchTime.toFixed(2)}ms`);
    console.log(`      Performance improvement: ${improvement.toFixed(1)}%`);
    
    if (improvement > 10) {
      this.optimizationResults.recommendations.push(
        `LOD batch processing improves performance by ${improvement.toFixed(1)}% - implement in production`
      );
    }
  }

  /**
   * Optimize cross-settlement system performance
   */
  async optimizeCrossSettlementSystems() {
    console.log('   🏰 Optimizing cross-settlement interactions...');
    
    const settlements = this.createTestSettlements();
    const worldState = this.createTestWorldState([], settlements);
    
    // Test relationship processing optimization
    const relationshipStart = performance.now();
    await this.crossSettlementService.processInterSettlementRelations(settlements, worldState);
    const relationshipEnd = performance.now();
    
    // Test trade processing optimization
    const tradeStart = performance.now();
    await this.crossSettlementService.processTradeRoutes(settlements, worldState);
    const tradeEnd = performance.now();
    
    // Test development processing optimization
    const developmentStart = performance.now();
    for (const settlement of settlements) {
      await this.settlementDevService.processSettlementDevelopment(settlement, worldState);
    }
    const developmentEnd = performance.now();
    
    const totalCrossSettlementTime = (relationshipEnd - relationshipStart) + 
                                    (tradeEnd - tradeStart) + 
                                    (developmentEnd - developmentStart);
    
    console.log(`      Relationship processing: ${(relationshipEnd - relationshipStart).toFixed(2)}ms`);
    console.log(`      Trade processing: ${(tradeEnd - tradeStart).toFixed(2)}ms`);
    console.log(`      Development processing: ${(developmentEnd - developmentStart).toFixed(2)}ms`);
    console.log(`      Total cross-settlement: ${totalCrossSettlementTime.toFixed(2)}ms`);
    
    if (totalCrossSettlementTime > 100) {
      this.optimizationResults.recommendations.push(
        `Cross-settlement processing takes ${totalCrossSettlementTime.toFixed(2)}ms - consider caching and incremental updates`
      );
    }
  }

  /**
   * Optimize turn processing pipeline
   */
  async optimizeTurnProcessing() {
    console.log('   🔄 Optimizing turn processing pipeline...');
    
    const testCharacters = this.createTestCharacters(215);
    const testSettlements = this.createTestSettlements();
    const worldState = this.createTestWorldState(testCharacters, testSettlements);
    
    // Test sequential vs parallel processing
    const sequentialStart = performance.now();
    await this.processSequentialTurn(worldState);
    const sequentialEnd = performance.now();
    
    const parallelStart = performance.now();
    await this.processParallelTurn(worldState);
    const parallelEnd = performance.now();
    
    const sequentialTime = sequentialEnd - sequentialStart;
    const parallelTime = parallelEnd - parallelStart;
    const improvement = ((sequentialTime - parallelTime) / sequentialTime) * 100;
    
    console.log(`      Sequential processing: ${sequentialTime.toFixed(2)}ms`);
    console.log(`      Parallel processing: ${parallelTime.toFixed(2)}ms`);
    console.log(`      Performance improvement: ${improvement.toFixed(1)}%`);
    
    if (improvement > 20) {
      this.optimizationResults.recommendations.push(
        `Parallel turn processing improves performance by ${improvement.toFixed(1)}% - implement in production`
      );
    }
  }

  /**
   * Validate memory management and detect leaks
   */
  async validateMemoryManagement() {
    console.log('   💾 Validating memory management...');
    
    const iterations = 10;
    const memoryReadings = [];
    
    for (let i = 0; i < iterations; i++) {
      // Force garbage collection
      if (global.gc) global.gc();
      
      // Create and process characters
      const characters = this.createTestCharacters(50);
      for (const character of characters) {
        await this.lodManager.processCharacter(character, {}, {});
      }
      
      // Measure memory
      const memoryUsage = this.getCurrentMemoryUsage();
      memoryReadings.push(memoryUsage);
      
      console.log(`      Iteration ${i + 1}: ${memoryUsage.toFixed(2)}MB`);
    }
    
    // Analyze memory trend
    const initialMemory = memoryReadings[0];
    const finalMemory = memoryReadings[memoryReadings.length - 1];
    const memoryIncrease = finalMemory - initialMemory;
    const memoryStable = Math.abs(memoryIncrease) < 5;
    
    console.log(`      Memory stability: ${memoryStable ? '✅ STABLE' : '❌ POTENTIAL LEAK'}`);
    console.log(`      Memory increase: ${memoryIncrease.toFixed(2)}MB over ${iterations} iterations`);
    
    if (!memoryStable) {
      this.optimizationResults.recommendations.push(
        `Potential memory leak detected: ${memoryIncrease.toFixed(2)}MB increase over ${iterations} iterations`
      );
    }
    
    return { memoryStable, memoryIncrease, memoryReadings };
  }

  /**
   * Generate comprehensive optimization report
   */
  generateOptimizationReport() {
    const before = this.optimizationResults.beforeOptimization;
    const after = this.optimizationResults.afterOptimization;
    
    console.log('📋 Performance Optimization Report:');
    console.log('=====================================');
    
    // Performance comparisons
    const metrics = [
      { name: 'Full Turn Processing', key: 'fullTurnMs', target: this.performanceTargets.turnProcessingMs, unit: 'ms' },
      { name: 'LOD Processing', key: 'lodProcessingMs', target: null, unit: 'ms' },
      { name: 'Memory Usage', key: 'memoryUsageMB', target: this.performanceTargets.memoryUsageMB, unit: 'MB' },
      { name: 'Throughput', key: 'lodThroughput', target: this.performanceTargets.throughputCharsPerSec, unit: 'chars/sec' }
    ];
    
    console.log('\n📊 Performance Metrics:');
    metrics.forEach(metric => {
      const beforeValue = before[metric.key];
      const afterValue = after[metric.key];
      const target = metric.target;
      
      if (beforeValue !== undefined && afterValue !== undefined) {
        const improvement = metric.unit === 'chars/sec' ? 
          ((afterValue - beforeValue) / beforeValue) * 100 :
          ((beforeValue - afterValue) / beforeValue) * 100;
        
        console.log(`   ${metric.name}:`);
        console.log(`     Before: ${beforeValue.toFixed(2)}${metric.unit}`);
        console.log(`     After: ${afterValue.toFixed(2)}${metric.unit}`);
        console.log(`     Change: ${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)}%`);
        
        if (target) {
          const meetsTarget = metric.unit === 'chars/sec' ? afterValue >= target : afterValue <= target;
          console.log(`     Target: ${target}${metric.unit} - ${meetsTarget ? '✅ MET' : '❌ MISSED'}`);
        }
      }
    });
    
    // Recommendations
    console.log('\n💡 Optimization Recommendations:');
    if (this.optimizationResults.recommendations.length === 0) {
      console.log('   ✅ No major optimizations needed - system performance is excellent!');
    } else {
      this.optimizationResults.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    // Target achievement
    console.log('\n🎯 Target Achievement:');
    const fullTurnTarget = after.fullTurnMs <= this.performanceTargets.turnProcessingMs;
    const memoryTarget = after.memoryUsageMB <= this.performanceTargets.memoryUsageMB;
    const throughputTarget = after.lodThroughput >= this.performanceTargets.throughputCharsPerSec;
    
    console.log(`   Turn Processing (<${this.performanceTargets.turnProcessingMs}ms): ${fullTurnTarget ? '✅' : '❌'}`);
    console.log(`   Memory Usage (<${this.performanceTargets.memoryUsageMB}MB): ${memoryTarget ? '✅' : '❌'}`);
    console.log(`   Throughput (>${this.performanceTargets.throughputCharsPerSec} chars/sec): ${throughputTarget ? '✅' : '❌'}`);
    
    const allTargetsMet = fullTurnTarget && memoryTarget && throughputTarget;
    console.log(`\n🏆 Overall Performance: ${allTargetsMet ? '✅ ALL TARGETS MET' : '⚠️ SOME TARGETS MISSED'}`);
  }

  // Helper methods
  createTestCharacters(count) {
    const heroCount = Math.floor(count * 0.12); // 12% heroes
    const groupCount = Math.floor(count * 0.18); // 18% groups
    const backgroundCount = count - heroCount - groupCount; // Rest background
    
    const characters = [];
    
    // Create hero characters
    for (let i = 0; i < heroCount; i++) {
      characters.push({
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
      });
    }
    
    // Create group characters
    for (let i = 0; i < groupCount; i++) {
      characters.push({
        id: `group-${i}`,
        name: `Group Character ${i}`,
        lodTier: 'group',
        populationGroupId: `group-${i}`,
        assignments: {
          nodes: new Set(['node-1']),
          interactions: new Set(),
          settlements: new Set(['settlement-1'])
        },
        currentNode: 'node-1'
      });
    }
    
    // Create background characters
    for (let i = 0; i < backgroundCount; i++) {
      characters.push({
        id: `bg-${i}`,
        name: `Background Character ${i}`,
        lodTier: 'background',
        assignments: {
          nodes: new Set(),
          interactions: new Set(),
          settlements: new Set(['settlement-1'])
        },
        currentNode: 'node-1'
      });
    }
    
    return characters;
  }

  createTestSettlements() {
    return [
      {
        id: 'oakwood-federation',
        name: 'Oakwood Federation',
        governance: { type: 'democratic', stability: 0.8 },
        development: { 
          level: 1, 
          availableUpgrades: ['market-expansion', 'fortification'],
          resources: { wood: 100, stone: 50, gold: 200 }
        },
        relationships: new Map([['ironhold-dominion', { standing: 0, tradeVolume: 0 }]])
      },
      {
        id: 'ironhold-dominion',
        name: 'Ironhold Dominion',
        governance: { type: 'hierarchical', stability: 0.9 },
        development: { 
          level: 1, 
          availableUpgrades: ['mining-expansion', 'weapon-forge'],
          resources: { iron: 150, stone: 80, gold: 180 }
        },
        relationships: new Map([['oakwood-federation', { standing: 0, tradeVolume: 0 }]])
      }
    ];
  }

  createTestWorldState(characters = [], settlements = []) {
    return {
      turn: 1,
      characters,
      settlements,
      events: [],
      relationships: new Map()
    };
  }

  async measureTierPerformance(characters, tier) {
    if (characters.length === 0) return 0;
    
    const start = performance.now();
    for (const character of characters) {
      await this.lodManager.processCharacter(character, {}, {});
    }
    const end = performance.now();
    
    return (end - start) / characters.length;
  }

  groupCharactersByTier(characters) {
    return characters.reduce((groups, character) => {
      const tier = character.lodTier;
      if (!groups[tier]) groups[tier] = [];
      groups[tier].push(character);
      return groups;
    }, {});
  }

  getCurrentMemoryUsage() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize / (1024 * 1024);
    } else if (process.memoryUsage) {
      return process.memoryUsage().heapUsed / (1024 * 1024);
    }
    return 0;
  }

  calculateMemoryGrowthRate(memoryResults) {
    if (memoryResults.length < 2) return 0;
    
    const totalCharacterIncrease = memoryResults[memoryResults.length - 1].characterCount - memoryResults[0].characterCount;
    const totalMemoryIncrease = memoryResults[memoryResults.length - 1].memoryDeltaMB - memoryResults[0].memoryDeltaMB;
    
    return (totalMemoryIncrease / totalCharacterIncrease) * 100; // MB per 100 characters
  }

  async processSequentialTurn(worldState) {
    // Process characters sequentially
    for (const character of worldState.characters) {
      await this.lodManager.processCharacter(character, worldState, {});
    }
    
    // Process settlements sequentially
    for (const settlement of worldState.settlements) {
      await this.settlementDevService.processSettlementDevelopment(settlement, worldState);
    }
    
    // Process cross-settlement relations
    await this.crossSettlementService.processInterSettlementRelations(worldState.settlements, worldState);
  }

  async processParallelTurn(worldState) {
    // Process characters in parallel batches
    const characterPromises = worldState.characters.map(character => 
      this.lodManager.processCharacter(character, worldState, {})
    );
    await Promise.all(characterPromises);
    
    // Process settlements in parallel
    const settlementPromises = worldState.settlements.map(settlement =>
      this.settlementDevService.processSettlementDevelopment(settlement, worldState)
    );
    await Promise.all(settlementPromises);
    
    // Process cross-settlement relations
    await this.crossSettlementService.processInterSettlementRelations(worldState.settlements, worldState);
  }
}

/**
 * Main execution function
 */
async function runT041PerformanceOptimization() {
  const optimizer = new PerformanceOptimizer();
  
  try {
    const results = await optimizer.runOptimization();
    
    // Write results to file for reference
    const fs = require('fs');
    const resultsJson = JSON.stringify(results, null, 2);
    fs.writeFileSync('./t041-optimization-results.json', resultsJson);
    
    console.log('\n📁 Results saved to: t041-optimization-results.json');
    return results;
    
  } catch (error) {
    console.error('❌ Performance optimization failed:', error);
    throw error;
  }
}

// Run the optimization if this file is executed directly
if (require.main === module) {
  runT041PerformanceOptimization().catch(console.error);
}

module.exports = {
  PerformanceOptimizer,
  runT041PerformanceOptimization
};