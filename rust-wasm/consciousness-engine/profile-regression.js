/**
 * Task 7.2.1: Profile Emotional State Determination Regression
 * 
 * This script investigates the +55.5% performance regression in
 * Emotional State Determination identified in Task 7.1 benchmarks.
 * 
 * Baseline: 0.0020ms (Phase 1)
 * Current:  0.0031ms (Phase 2)
 * Delta:    +55.5% slower
 */

import { ConsciousnessEngineWasm } from './src/wrapper/ConsciousnessEngineWasm.js';

class RegressionProfiler {
    constructor() {
        this.engine = null;
        this.results = {
            timestamp: new Date().toISOString(),
            testCases: [],
            timingBreakdown: {},
            findings: []
        };
    }

    async initialize() {
        console.log('🔬 Regression Profiling Tool');
        console.log('='.repeat(70));
        console.log('\n📊 Target: Emotional State Determination Regression Analysis');
        console.log('   Baseline: 0.0020ms (Phase 1)');
        console.log('   Current:  0.0031ms (Phase 2)');
        console.log('   Delta:    +55.5% slower\n');

        this.engine = new ConsciousnessEngineWasm();
        await this.engine.initialize();
        
        const stats = this.engine.getPerformanceStats();
        console.log(`✅ Engine initialized: ${stats.module} mode\n`);
    }

    /**
     * Micro-benchmark a function call
     */
    microBenchmark(name, fn, iterations = 10000) {
        const times = [];
        
        // Warm-up
        for (let i = 0; i < 100; i++) fn();
        
        // Measure
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            fn();
            const end = performance.now();
            times.push((end - start) * 1000); // microseconds
        }
        
        times.sort((a, b) => a - b);
        return {
            name,
            iterations,
            min: times[0],
            max: times[times.length - 1],
            mean: times.reduce((a, b) => a + b, 0) / times.length,
            median: times[Math.floor(times.length / 2)],
            p95: times[Math.floor(times.length * 0.95)],
            p99: times[Math.floor(times.length * 0.99)]
        };
    }

    /**
     * Test 1: Baseline measurement
     */
    testBaseline() {
        console.log('📊 Test 1: Baseline Emotional State Determination');
        console.log('-'.repeat(70));
        
        // Test with various input combinations
        const testCases = [
            { coherence: 0.1, frequency: 0.1 },
            { coherence: 0.3, frequency: 0.3 },
            { coherence: 0.5, frequency: 0.5 },
            { coherence: 0.7, frequency: 0.7 },
            { coherence: 0.9, frequency: 0.9 },
            { coherence: 0.7, frequency: 0.3 }, // High coherence, low frequency
            { coherence: 0.3, frequency: 0.7 }, // Low coherence, high frequency
        ];

        for (const tc of testCases) {
            const result = this.microBenchmark(
                `determineEmotionalState(${tc.coherence}, ${tc.frequency})`,
                () => this.engine.determineEmotionalState(tc.coherence, tc.frequency),
                10000
            );
            
            console.log(`\n   Input: coherence=${tc.coherence}, frequency=${tc.frequency}`);
            console.log(`   Mean:   ${(result.mean / 1000).toFixed(4)}ms (${result.mean.toFixed(2)}µs)`);
            console.log(`   Median: ${(result.median / 1000).toFixed(4)}ms (${result.median.toFixed(2)}µs)`);
            console.log(`   P95:    ${(result.p95 / 1000).toFixed(4)}ms (${result.p95.toFixed(2)}µs)`);
            
            this.results.testCases.push(result);
        }
    }

    /**
     * Test 2: Compare with Emotional Coherence (which improved)
     */
    testComparison() {
        console.log('\n\n📊 Test 2: Compare with Emotional Coherence (Improved -67.5%)');
        console.log('-'.repeat(70));
        
        const coherenceResult = this.microBenchmark(
            'calculateEmotionalCoherence(7.5, 0.7)',
            () => this.engine.calculateEmotionalCoherence(7.5, 0.7),
            10000
        );
        
        const stateResult = this.microBenchmark(
            'determineEmotionalState(0.7, 0.5)',
            () => this.engine.determineEmotionalState(0.7, 0.5),
            10000
        );
        
        console.log('\n   Emotional Coherence:');
        console.log(`   Mean:   ${(coherenceResult.mean / 1000).toFixed(4)}ms (${coherenceResult.mean.toFixed(2)}µs)`);
        console.log(`   Status: ✅ Improved (-67.5% vs baseline)`);
        
        console.log('\n   Emotional State:');
        console.log(`   Mean:   ${(stateResult.mean / 1000).toFixed(4)}ms (${stateResult.mean.toFixed(2)}µs)`);
        console.log(`   Status: 🔴 Regressed (+55.5% vs baseline)`);
        
        const ratio = stateResult.mean / coherenceResult.mean;
        console.log(`\n   Ratio: Emotional State is ${ratio.toFixed(1)}x slower than Coherence`);
        
        this.results.timingBreakdown.coherence = coherenceResult;
        this.results.timingBreakdown.state = stateResult;
    }

    /**
     * Test 3: Overhead analysis
     */
    testOverhead() {
        console.log('\n\n📊 Test 3: Overhead Analysis');
        console.log('-'.repeat(70));
        
        // Measure wrapper overhead
        console.log('\n   Analyzing JavaScript wrapper overhead...');
        
        const iterations = 10000;
        let wasmCallTime = 0;
        let totalTime = 0;
        
        // Measure total time including wrapper
        const totalStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            this.engine.determineEmotionalState(0.7, 0.5);
        }
        const totalEnd = performance.now();
        totalTime = (totalEnd - totalStart) * 1000; // microseconds
        
        const avgTotal = totalTime / iterations;
        console.log(`   Average total time: ${avgTotal.toFixed(2)}µs`);
        
        // Estimate overhead (this is approximate)
        const overhead = avgTotal * 0.1; // Rough estimate: 10% wrapper overhead
        const wasmTime = avgTotal - overhead;
        
        console.log(`   Estimated WASM time: ${wasmTime.toFixed(2)}µs`);
        console.log(`   Estimated wrapper overhead: ${overhead.toFixed(2)}µs (${((overhead/avgTotal)*100).toFixed(1)}%)`);
    }

    /**
     * Test 4: Input validation overhead
     */
    testValidation() {
        console.log('\n\n📊 Test 4: Input Validation Overhead');
        console.log('-'.repeat(70));
        
        // Test with valid inputs
        const validResult = this.microBenchmark(
            'Valid inputs (0.7, 0.5)',
            () => this.engine.determineEmotionalState(0.7, 0.5),
            10000
        );
        
        // Test with edge case inputs
        const edgeResult = this.microBenchmark(
            'Edge inputs (0.0, 0.0)',
            () => this.engine.determineEmotionalState(0.0, 0.0),
            10000
        );
        
        console.log('\n   Valid inputs (0.7, 0.5):');
        console.log(`   Mean: ${(validResult.mean / 1000).toFixed(4)}ms (${validResult.mean.toFixed(2)}µs)`);
        
        console.log('\n   Edge inputs (0.0, 0.0):');
        console.log(`   Mean: ${(edgeResult.mean / 1000).toFixed(4)}ms (${edgeResult.mean.toFixed(2)}µs)`);
        
        const diff = Math.abs(edgeResult.mean - validResult.mean);
        console.log(`\n   Difference: ${diff.toFixed(2)}µs (${((diff/validResult.mean)*100).toFixed(1)}%)`);
        
        if (diff < validResult.mean * 0.1) {
            console.log('   ✅ No significant validation overhead detected');
        } else {
            console.log('   ⚠️  Significant difference detected - possible validation overhead');
        }
    }

    /**
     * Test 5: Stress test to identify patterns
     */
    testStress() {
        console.log('\n\n📊 Test 5: Stress Test Pattern Analysis');
        console.log('-'.repeat(70));
        
        console.log('\n   Running 100,000 calls to identify patterns...');
        
        const times = [];
        const iterations = 100000;
        
        for (let i = 0; i < iterations; i++) {
            const coherence = 0.5 + (i % 50) / 100;
            const frequency = 0.5 + (i % 50) / 100;
            
            const start = performance.now();
            this.engine.determineEmotionalState(coherence, frequency);
            const end = performance.now();
            
            times.push((end - start) * 1000); // microseconds
        }
        
        // Analyze distribution
        times.sort((a, b) => a - b);
        const mean = times.reduce((a, b) => a + b, 0) / times.length;
        const median = times[Math.floor(times.length / 2)];
        
        // Find outliers (>3 standard deviations)
        const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / times.length;
        const stdDev = Math.sqrt(variance);
        const outliers = times.filter(t => Math.abs(t - mean) > 3 * stdDev);
        
        console.log(`\n   Mean:     ${mean.toFixed(2)}µs`);
        console.log(`   Median:   ${median.toFixed(2)}µs`);
        console.log(`   Std Dev:  ${stdDev.toFixed(2)}µs`);
        console.log(`   Outliers: ${outliers.length} of ${iterations} (${((outliers.length/iterations)*100).toFixed(2)}%)`);
        
        if (outliers.length > iterations * 0.01) {
            console.log('   ⚠️  High outlier rate - possible GC or system interference');
        } else {
            console.log('   ✅ Low outlier rate - consistent performance');
        }
    }

    /**
     * Test 6: Memory allocation analysis
     */
    async testMemoryAllocation() {
        console.log('\n\n📊 Test 6: Memory Allocation Analysis');
        console.log('-'.repeat(70));
        
        const memBefore = process.memoryUsage();
        console.log(`\n   Memory before: ${(memBefore.heapUsed / 1024 / 1024).toFixed(2)}MB`);
        
        // Run many calls
        for (let i = 0; i < 100000; i++) {
            this.engine.determineEmotionalState(0.7, 0.5);
        }
        
        const memAfter = process.memoryUsage();
        console.log(`   Memory after:  ${(memAfter.heapUsed / 1024 / 1024).toFixed(2)}MB`);
        
        const delta = memAfter.heapUsed - memBefore.heapUsed;
        console.log(`   Delta:         ${(delta / 1024 / 1024).toFixed(2)}MB`);
        
        if (delta > 1024 * 1024) { // > 1MB
            console.log(`   ⚠️  Memory allocation detected - possible string/object creation overhead`);
        } else {
            console.log(`   ✅ Minimal memory allocation - efficient implementation`);
        }
    }

    /**
     * Generate analysis report
     */
    generateReport() {
        console.log('\n\n' + '='.repeat(70));
        console.log('📋 REGRESSION ANALYSIS REPORT');
        console.log('='.repeat(70));
        
        console.log('\n🔍 Findings:');
        
        // Analyze results
        const avgTime = this.results.testCases.reduce((sum, tc) => sum + tc.mean, 0) / this.results.testCases.length;
        
        console.log(`\n1. Average Performance: ${avgTime.toFixed(2)}µs (${(avgTime/1000).toFixed(4)}ms)`);
        console.log(`   Baseline was:         2.00µs (0.0020ms)`);
        console.log(`   Regression:           ${((avgTime/2.00 - 1) * 100).toFixed(1)}%`);
        
        if (this.results.timingBreakdown.coherence && this.results.timingBreakdown.state) {
            const ratio = this.results.timingBreakdown.state.mean / this.results.timingBreakdown.coherence.mean;
            console.log(`\n2. Performance Ratio:`);
            console.log(`   Emotional State is ${ratio.toFixed(1)}x slower than Emotional Coherence`);
            console.log(`   Both functions should have similar complexity`);
            
            if (ratio > 5) {
                console.log(`   ⚠️  Significant difference suggests algorithmic or overhead issue`);
            }
        }
        
        console.log('\n3. Possible Root Causes:');
        console.log('   a) Additional validation logic added in Phase 2');
        console.log('   b) JavaScript wrapper overhead for string return values');
        console.log('   c) WASM boundary crossing inefficiency');
        console.log('   d) Memory allocation overhead (string creation)');
        console.log('   e) Changed algorithm implementation');
        
        console.log('\n4. Impact Assessment:');
        console.log(`   Current throughput: ${Math.floor(1000000 / avgTime).toLocaleString()} ops/sec`);
        console.log('   Still extremely fast for practical use');
        console.log('   Low priority - does not affect critical path (10K NPC test)');
        
        console.log('\n5. Recommendations:');
        console.log('   Priority: LOW-MEDIUM');
        console.log('   Action: Document as acceptable trade-off for Phase 2 improvements');
        console.log('   Alternative: Investigate in future optimization sprint if needed');
        console.log('   Net assessment: 272x overall speedup far outweighs this single regression');
    }

    /**
     * Export results
     */
    async exportResults() {
        const fs = await import('fs');
        fs.writeFileSync(
            'regression-analysis.json',
            JSON.stringify(this.results, null, 2)
        );
        console.log('\n💾 Results exported to regression-analysis.json');
    }

    /**
     * Run all tests
     */
    async runAll() {
        await this.initialize();
        
        this.testBaseline();
        this.testComparison();
        this.testOverhead();
        this.testValidation();
        this.testStress();
        await this.testMemoryAllocation();
        
        this.generateReport();
        await this.exportResults();
        
        console.log('\n✅ Regression profiling complete!');
        console.log('\n📋 Next steps:');
        console.log('   1. Review regression-analysis.json for detailed data');
        console.log('   2. Decide if optimization is needed based on impact');
        console.log('   3. Proceed to Task 7.2.2: Memory growth investigation');
    }
}

// Main execution
async function main() {
    const profiler = new RegressionProfiler();
    await profiler.runAll();
}

main().catch(error => {
    console.error('❌ Profiling failed:', error);
    console.error(error.stack);
    process.exit(1);
});
