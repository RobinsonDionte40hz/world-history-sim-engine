// src/test/lod/performance-metrics.js

/**
 * Performance measurement and benchmarking utilities for LOD system
 */

export class LODPerformanceMetrics {
  constructor() {
    this.metrics = new Map();
    this.benchmarks = new Map();
  }

  /**
   * Measure execution time of a function
   */
  measureExecutionTime(label, fn, iterations = 1) {
    const startTime = performance.now();
    let result;

    for (let i = 0; i < iterations; i++) {
      result = fn();
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;

    const metric = {
      label,
      totalTime,
      averageTime,
      iterations,
      timestamp: Date.now(),
      result
    };

    this.metrics.set(label, metric);
    return metric;
  }

  /**
   * Measure memory usage during function execution
   */
  async measureMemoryUsage(label, fn) {
    if (!performance.memory) {
      return { label, error: 'Memory measurement not available' };
    }

    const before = performance.memory.usedJSHeapSize;
    const result = await fn();
    const after = performance.memory.usedJSHeapSize;

    const metric = {
      label,
      memoryBefore: before,
      memoryAfter: after,
      memoryDifference: after - before,
      memoryDifferenceMB: (after - before) / (1024 * 1024),
      timestamp: Date.now(),
      result
    };

    this.metrics.set(`${label}-memory`, metric);
    return metric;
  }

  /**
   * Benchmark LOD character processing
   */
  benchmarkCharacterProcessing(characters, processor, options = {}) {
    const {
      batchSize = 10,
      iterations = 3,
      label = 'character-processing'
    } = options;

    const batches = this._createBatches(characters, batchSize);
    const results = [];

    for (const batch of batches) {
      const batchResult = this.measureExecutionTime(
        `${label}-batch-${batch.length}`,
        () => processor.processBatch(batch),
        iterations
      );
      batchResult.charactersProcessed = batch.length;
      batchResult.timePerCharacter = batchResult.averageTime / batch.length;
      results.push(batchResult);
    }

    const benchmark = {
      label,
      totalCharacters: characters.length,
      batchSize,
      iterations,
      batchResults: results,
      summary: this._summarizeBenchmark(results),
      timestamp: Date.now()
    };

    this.benchmarks.set(label, benchmark);
    return benchmark;
  }

  /**
   * Benchmark LOD tier processing
   */
  benchmarkTierProcessing(charactersByTier, processor, options = {}) {
    const { iterations = 3, label = 'tier-processing' } = options;
    const results = {};

    for (const [tier, characters] of Object.entries(charactersByTier)) {
      results[tier] = this.measureExecutionTime(
        `${label}-${tier}`,
        () => processor.processTier(tier, characters),
        iterations
      );
      results[tier].charactersProcessed = characters.length;
      results[tier].timePerCharacter = results[tier].averageTime / characters.length;
    }

    const benchmark = {
      label,
      tierResults: results,
      summary: this._summarizeTierBenchmark(results),
      timestamp: Date.now()
    };

    this.benchmarks.set(label, benchmark);
    return benchmark;
  }

  /**
   * Assert performance requirements
   */
  assertPerformanceRequirements(requirements) {
    const failures = [];

    for (const requirement of requirements) {
      const metric = this.metrics.get(requirement.label);

      if (!metric) {
        failures.push({
          requirement,
          error: `No metric found for label: ${requirement.label}`
        });
        continue;
      }

      if (requirement.maxTime && metric.averageTime > requirement.maxTime) {
        failures.push({
          requirement,
          metric,
          error: `Average time ${metric.averageTime.toFixed(2)}ms exceeds limit ${requirement.maxTime}ms`
        });
      }

      if (requirement.maxMemoryMB && metric.memoryDifferenceMB > requirement.maxMemoryMB) {
        failures.push({
          requirement,
          metric,
          error: `Memory usage ${metric.memoryDifferenceMB.toFixed(2)}MB exceeds limit ${requirement.maxMemoryMB}MB`
        });
      }

      if (requirement.minThroughput && metric.charactersProcessed) {
        const throughput = metric.charactersProcessed / (metric.averageTime / 1000); // chars per second
        if (throughput < requirement.minThroughput) {
          failures.push({
            requirement,
            metric,
            error: `Throughput ${throughput.toFixed(1)} chars/sec below minimum ${requirement.minThroughput}`
          });
        }
      }
    }

    if (failures.length > 0) {
      const errorMessage = failures.map(f => f.error).join('\n');
      throw new Error(`Performance requirements not met:\n${errorMessage}`);
    }

    return true;
  }

  /**
   * Get LOD system performance requirements
   */
  static getLODRequirements() {
    return [
      {
        label: 'hero-processing',
        maxTime: 50, // ms per hero character
        description: 'Individual hero character processing'
      },
      {
        label: 'group-processing',
        maxTime: 5, // ms per group
        description: 'Population group statistical processing'
      },
      {
        label: 'background-processing',
        maxTime: 1, // ms per background demographic
        description: 'Background demographic tracking'
      },
      {
        label: 'turn-processing-100-npcs',
        maxTime: 2000, // ms for full turn
        minThroughput: 50, // characters per second
        description: 'Complete turn processing for 100+ NPCs'
      },
      {
        label: 'memory-usage-peak',
        maxMemoryMB: 50, // MB
        description: 'Peak memory usage during processing'
      }
    ];
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const report = {
      summary: {
        totalMetrics: this.metrics.size,
        totalBenchmarks: this.benchmarks.size,
        timestamp: Date.now()
      },
      metrics: Array.from(this.metrics.entries()),
      benchmarks: Array.from(this.benchmarks.entries()),
      analysis: this._analyzePerformance()
    };

    return report;
  }

  /**
   * Export metrics to JSON
   */
  exportToJSON() {
    return JSON.stringify(this.generateReport(), null, 2);
  }

  /**
   * Private helper methods
   */
  _createBatches(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  _summarizeBenchmark(batchResults) {
    const totalTime = batchResults.reduce((sum, r) => sum + r.totalTime, 0);
    const totalCharacters = batchResults.reduce((sum, r) => sum + r.charactersProcessed, 0);
    const avgTimePerCharacter = totalTime / totalCharacters;

    return {
      totalBatches: batchResults.length,
      totalCharacters,
      totalTime,
      averageTimePerCharacter: avgTimePerCharacter,
      throughput: totalCharacters / (totalTime / 1000) // characters per second
    };
  }

  _summarizeTierBenchmark(tierResults) {
    const tierSummaries = {};
    let totalTime = 0;
    let totalCharacters = 0;

    for (const [tier, result] of Object.entries(tierResults)) {
      tierSummaries[tier] = {
        time: result.averageTime,
        characters: result.charactersProcessed,
        timePerCharacter: result.timePerCharacter
      };
      totalTime += result.averageTime;
      totalCharacters += result.charactersProcessed;
    }

    return {
      tierSummaries,
      totalTime,
      totalCharacters,
      overallTimePerCharacter: totalTime / totalCharacters,
      overallThroughput: totalCharacters / (totalTime / 1000)
    };
  }

  _analyzePerformance() {
    const analysis = {
      recommendations: [],
      bottlenecks: [],
      optimizations: []
    };

    // Analyze metrics for patterns
    const heroMetrics = Array.from(this.metrics.values()).filter(m =>
      m.label.includes('hero') && m.averageTime
    );

    const groupMetrics = Array.from(this.metrics.values()).filter(m =>
      m.label.includes('group') && m.averageTime
    );

    // Check for bottlenecks
    if (heroMetrics.length > 0) {
      const avgHeroTime = heroMetrics.reduce((sum, m) => sum + m.averageTime, 0) / heroMetrics.length;
      if (avgHeroTime > 50) {
        analysis.bottlenecks.push('Hero character processing is slow');
        analysis.recommendations.push('Consider optimizing consciousness calculations');
      }
    }

    if (groupMetrics.length > 0) {
      const avgGroupTime = groupMetrics.reduce((sum, m) => sum + m.averageTime, 0) / groupMetrics.length;
      if (avgGroupTime > 5) {
        analysis.bottlenecks.push('Group processing is slower than expected');
        analysis.recommendations.push('Review statistical calculation efficiency');
      }
    }

    // Performance is good
    if (analysis.bottlenecks.length === 0) {
      analysis.optimizations.push('Current performance meets requirements');
    }

    return analysis;
  }
}

/**
 * Convenience functions for common performance tests
 */
export const LODPerformanceUtils = {
  /**
   * Run standard LOD performance test suite
   */
  async runStandardPerformanceTests(testSuite) {
    const metrics = new LODPerformanceMetrics();
    const requirements = LODPerformanceMetrics.getLODRequirements();

    try {
      // Run the test suite
      await testSuite(metrics);

      // Assert requirements
      metrics.assertPerformanceRequirements(requirements);

      console.log('✅ All LOD performance requirements met');
      return {
        success: true,
        report: metrics.generateReport()
      };

    } catch (error) {
      console.error('❌ LOD performance requirements not met:', error.message);
      return {
        success: false,
        error: error.message,
        report: metrics.generateReport()
      };
    }
  },

  /**
   * Quick performance check for development
   */
  quickPerformanceCheck(characters, processor) {
    const metrics = new LODPerformanceMetrics();

    const result = metrics.benchmarkCharacterProcessing(
      characters,
      processor,
      { batchSize: 20, iterations: 1, label: 'quick-check' }
    );

    const summary = result.summary;
    const status = summary.averageTimePerCharacter < 20 ? '✅ Good' : '⚠️ Slow';

    console.log(`${status} Performance: ${summary.averageTimePerCharacter.toFixed(2)}ms per character`);
    console.log(`Throughput: ${summary.throughput.toFixed(1)} characters/second`);

    return result;
  }
};

export default LODPerformanceMetrics;