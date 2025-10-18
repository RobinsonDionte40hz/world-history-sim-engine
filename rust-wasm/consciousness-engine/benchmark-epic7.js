/**
 * Epic 7 Performance Benchmark Suite
 * 
 * Comprehensive performance testing including:
 * - 10,000 NPC processing validation
 * - JavaScript baseline comparison
 * - Memory usage monitoring
 * - Determinism validation
 * - Regression testing
 */

import { ConsciousnessEngineWasm } from './src/wrapper/ConsciousnessEngineWasm.js';
import fs from 'fs';

class Epic7Benchmark {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                memory: process.memoryUsage()
            },
            benchmarks: [],
            memorySnapshots: [],
            determinismResults: []
        };
        this.engine = null;
    }

    async initialize() {
        console.log('🚀 Epic 7 Performance Benchmark Suite');
        console.log('='.repeat(70));
        console.log('\n⚙️  Initializing WASM Consciousness Engine...');
        
        this.engine = new ConsciousnessEngineWasm();
        await this.engine.initialize();
        
        const stats = this.engine.getPerformanceStats();
        console.log(`   ✅ Engine initialized: ${stats.module} mode`);
        console.log(`   📦 WASM Enabled: ${stats.wasmEnabled ? '✅' : '❌'}`);
        
        if (!stats.wasmEnabled) {
            console.log('\n   ⚠️  WARNING: WASM not enabled, running in fallback mode');
        }
    }

    /**
     * Take a memory snapshot
     */
    captureMemorySnapshot(label) {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const mem = process.memoryUsage();
            const snapshot = {
                label,
                timestamp: Date.now(),
                heapUsed: mem.heapUsed,
                heapTotal: mem.heapTotal,
                external: mem.external,
                rss: mem.rss,
                arrayBuffers: mem.arrayBuffers || 0
            };
            this.results.memorySnapshots.push(snapshot);
            return snapshot;
        }
        return null;
    }

    /**
     * Generate test consciousness state
     */
    generateState(seed = 0) {
        const r = (seed * 9301 + 49297) % 233280;
        return {
            baseFrequency: 3 + (r % 12),
            baseCoherence: 0.2 + ((r * 7) % 80) / 100,
            emotionalState: ['Content', 'Excited', 'Anxious', 'Depressed', 'Joyful'][r % 5],
            currentFrequency: 3 + (r % 12),
            emotionalCoherence: 0.2 + ((r * 7) % 80) / 100,
            lastUpdate: Date.now()
        };
    }

    /**
     * Run benchmark with detailed timing
     */
    async benchmark(name, fn, options = {}) {
        const {
            iterations = 1000,
            warmup = 10,
            captureMemory = true,
            category = 'general'
        } = options;

        console.log(`\n📊 ${name}`);
        console.log(`   Category: ${category}`);
        console.log(`   Iterations: ${iterations.toLocaleString()}`);

        // Capture memory before
        const memBefore = captureMemory ? this.captureMemorySnapshot(`${name} - Before`) : null;

        // Warm-up
        for (let i = 0; i < warmup; i++) {
            await fn();
        }

        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }

        // Actual benchmark
        const times = [];
        const startTotal = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            await fn();
            const end = performance.now();
            times.push((end - start) * 1000); // Convert to microseconds
        }
        
        const endTotal = performance.now();
        const totalTime = endTotal - startTotal;

        // Capture memory after
        const memAfter = captureMemory ? this.captureMemorySnapshot(`${name} - After`) : null;

        // Calculate statistics
        times.sort((a, b) => a - b);
        const result = {
            name,
            category,
            iterations,
            times: {
                min: times[0],
                max: times[times.length - 1],
                mean: times.reduce((a, b) => a + b, 0) / times.length,
                median: times[Math.floor(times.length / 2)],
                p95: times[Math.floor(times.length * 0.95)],
                p99: times[Math.floor(times.length * 0.99)],
                total: totalTime * 1000 // microseconds
            },
            throughput: {
                opsPerSecond: Math.floor(1000000 / (times.reduce((a, b) => a + b, 0) / times.length)),
                totalOpsPerSecond: Math.floor((iterations / totalTime) * 1000)
            },
            memory: memBefore && memAfter ? {
                heapDelta: memAfter.heapUsed - memBefore.heapUsed,
                externalDelta: memAfter.external - memBefore.external
            } : null
        };

        this.results.benchmarks.push(result);

        // Print results
        console.log(`   ⏱️  Min:     ${(result.times.min / 1000).toFixed(4)}ms (${result.times.min.toFixed(2)}µs)`);
        console.log(`   ⏱️  Mean:    ${(result.times.mean / 1000).toFixed(4)}ms (${result.times.mean.toFixed(2)}µs)`);
        console.log(`   ⏱️  Median:  ${(result.times.median / 1000).toFixed(4)}ms (${result.times.median.toFixed(2)}µs)`);
        console.log(`   ⏱️  P95:     ${(result.times.p95 / 1000).toFixed(4)}ms (${result.times.p95.toFixed(2)}µs)`);
        console.log(`   ⏱️  P99:     ${(result.times.p99 / 1000).toFixed(4)}ms (${result.times.p99.toFixed(2)}µs)`);
        console.log(`   ⏱️  Max:     ${(result.times.max / 1000).toFixed(4)}ms (${result.times.max.toFixed(2)}µs)`);
        console.log(`   🚀 Throughput: ${result.throughput.opsPerSecond.toLocaleString()} ops/sec`);

        if (result.memory) {
            const heapMB = (result.memory.heapDelta / 1024 / 1024).toFixed(2);
            const extMB = (result.memory.externalDelta / 1024 / 1024).toFixed(2);
            console.log(`   💾 Heap Δ: ${heapMB > 0 ? '+' : ''}${heapMB}MB, External Δ: ${extMB > 0 ? '+' : ''}${extMB}MB`);
        }

        return result;
    }

    /**
     * Test determinism - same input should produce identical output
     */
    testDeterminism(iterations = 100) {
        console.log('\n🔬 Testing Determinism...');
        
        const testStates = Array.from({ length: 10 }, (_, i) => this.generateState(i));
        const results = [];

        for (let iter = 0; iter < iterations; iter++) {
            for (const state of testStates) {
                const result = this.engine.calculateBehavioralState(state);
                results.push({
                    iteration: iter,
                    input: JSON.stringify(state),
                    output: JSON.stringify(result)
                });
            }
        }

        // Check for consistency
        const grouped = {};
        for (const r of results) {
            if (!grouped[r.input]) {
                grouped[r.input] = [];
            }
            grouped[r.input].push(r.output);
        }

        let deterministic = true;
        let inconsistencies = 0;

        for (const [input, outputs] of Object.entries(grouped)) {
            const unique = new Set(outputs);
            if (unique.size > 1) {
                deterministic = false;
                inconsistencies++;
                console.log(`   ❌ Inconsistent output for input: ${input.substring(0, 50)}...`);
                console.log(`      Found ${unique.size} different outputs`);
            }
        }

        const determinismResult = {
            deterministic,
            testCases: testStates.length,
            iterations,
            totalTests: results.length,
            inconsistencies,
            successRate: ((results.length - inconsistencies * iterations) / results.length * 100).toFixed(2)
        };

        this.results.determinismResults.push(determinismResult);

        if (deterministic) {
            console.log(`   ✅ DETERMINISTIC: All ${results.length} tests produced consistent results`);
        } else {
            console.log(`   ⚠️  NON-DETERMINISTIC: Found ${inconsistencies} inconsistent cases`);
            console.log(`   Success rate: ${determinismResult.successRate}%`);
        }

        return determinismResult;
    }

    /**
     * Task 7.1.2: 10,000 NPC Processing Benchmark
     */
    async test10kNPCs() {
        console.log('\n' + '='.repeat(70));
        console.log('🎯 CRITICAL TEST: 10,000 NPC Processing');
        console.log('='.repeat(70));
        console.log('\nTarget: Process 10,000 NPCs in < 1 second\n');

        const npcCount = 10000;
        const states = Array.from({ length: npcCount }, (_, i) => this.generateState(i));

        // Capture baseline memory
        this.captureMemorySnapshot('10K NPCs - Start');

        console.log(`📦 Generated ${npcCount.toLocaleString()} NPC states`);
        console.log(`   Memory after generation: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`);

        // Test batch processing
        console.log('\n🔄 Testing batch processing...');
        const batchStart = performance.now();
        const batchResults = this.engine.calculateBatchBehavioralStates(states);
        const batchEnd = performance.now();
        const batchTime = batchEnd - batchStart;

        this.captureMemorySnapshot('10K NPCs - After Batch');

        console.log(`\n   ⏱️  Total Time: ${batchTime.toFixed(2)}ms (${(batchTime / 1000).toFixed(3)}s)`);
        console.log(`   📊 Per-NPC: ${(batchTime / npcCount).toFixed(4)}ms (${((batchTime / npcCount) * 1000).toFixed(2)}µs)`);
        console.log(`   🚀 Throughput: ${Math.floor(npcCount / (batchTime / 1000)).toLocaleString()} NPCs/second`);
        console.log(`   💾 Memory after processing: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`);

        const targetMet = batchTime < 1000;
        console.log(`\n   ${targetMet ? '✅' : '❌'} Target ${targetMet ? 'MET' : 'MISSED'}: ${batchTime < 1000 ? `${(1000 - batchTime).toFixed(0)}ms under` : `${(batchTime - 1000).toFixed(0)}ms over`} 1s target`);

        // Calculate performance factor vs JavaScript baseline
        const jsBaselinePerNPC = 0.12; // ms per NPC from original JavaScript implementation
        const wasmPerNPC = batchTime / npcCount;
        const speedup = jsBaselinePerNPC / wasmPerNPC;

        console.log(`\n   📈 Performance vs JavaScript baseline:`);
        console.log(`      JavaScript: ~${jsBaselinePerNPC}ms per NPC`);
        console.log(`      WASM:       ${wasmPerNPC.toFixed(4)}ms per NPC`);
        console.log(`      Speedup:    ${speedup.toFixed(1)}x faster`);

        // Test individual processing (for comparison)
        console.log('\n🔄 Testing sequential individual processing (sample 1000)...');
        const sampleSize = 1000;
        const sampleStates = states.slice(0, sampleSize);
        
        const seqStart = performance.now();
        for (const state of sampleStates) {
            this.engine.calculateBehavioralState(state);
        }
        const seqEnd = performance.now();
        const seqTime = seqEnd - seqStart;

        console.log(`   ⏱️  Time for ${sampleSize}: ${seqTime.toFixed(2)}ms`);
        console.log(`   📊 Per-NPC: ${(seqTime / sampleSize).toFixed(4)}ms`);
        console.log(`   📈 Batch is ${(seqTime / sampleSize / wasmPerNPC).toFixed(1)}x faster than sequential`);

        // Extrapolate to 10K
        const extrapolated = (seqTime / sampleSize) * npcCount;
        console.log(`   📊 Extrapolated 10K time: ${extrapolated.toFixed(2)}ms (${(extrapolated / 1000).toFixed(2)}s)`);

        const result = {
            name: '10K NPC Processing',
            npcCount,
            batchProcessing: {
                totalTime: batchTime,
                perNPC: wasmPerNPC,
                throughput: Math.floor(npcCount / (batchTime / 1000)),
                targetMet,
                speedupVsJS: speedup
            },
            sequentialProcessing: {
                sampleSize,
                totalTime: seqTime,
                perNPC: seqTime / sampleSize,
                extrapolatedTotal: extrapolated
            },
            memory: {
                before: this.results.memorySnapshots[this.results.memorySnapshots.length - 2],
                after: this.results.memorySnapshots[this.results.memorySnapshots.length - 1]
            }
        };

        this.results.benchmarks.push(result);
        return result;
    }

    /**
     * Run all Epic 7 benchmarks
     */
    async runAll() {
        console.log('\n📋 Starting comprehensive performance validation...\n');

        // 1. Single operation benchmarks
        console.log('\n' + '='.repeat(70));
        console.log('📊 Section 1: Single Operation Benchmarks');
        console.log('='.repeat(70));

        await this.benchmark(
            'Single Character Calculation',
            () => this.engine.calculateBehavioralState(this.generateState(0)),
            { iterations: 10000, category: 'single-op' }
        );

        await this.benchmark(
            'Emotional Coherence Calculation',
            () => this.engine.calculateEmotionalCoherence(7.5, 0.7),
            { iterations: 10000, category: 'single-op' }
        );

        await this.benchmark(
            'Emotional State Determination',
            () => this.engine.determineEmotionalState(0.7, 0.5),
            { iterations: 10000, category: 'single-op' }
        );

        // 2. Batch processing benchmarks
        console.log('\n' + '='.repeat(70));
        console.log('📊 Section 2: Batch Processing Benchmarks');
        console.log('='.repeat(70));

        const sizes = [10, 50, 100, 500, 1000];
        for (const size of sizes) {
            const batch = Array.from({ length: size }, (_, i) => this.generateState(i));
            await this.benchmark(
                `Batch Processing (${size} characters)`,
                () => this.engine.calculateBatchBehavioralStates(batch),
                { iterations: size <= 100 ? 1000 : 100, category: 'batch' }
            );
        }

        // 3. 10K NPC critical test
        await this.test10kNPCs();

        // 4. Determinism validation
        console.log('\n' + '='.repeat(70));
        console.log('📊 Section 3: Determinism Validation');
        console.log('='.repeat(70));
        
        this.testDeterminism(100);

        // 5. Memory stress test
        console.log('\n' + '='.repeat(70));
        console.log('📊 Section 4: Memory Stress Test');
        console.log('='.repeat(70));

        await this.memoryStressTest();

        // Generate final report
        this.generateReport();
    }

    /**
     * Memory stress test
     */
    async memoryStressTest() {
        console.log('\n🧪 Memory Stress Test');
        console.log('   Testing repeated allocations and deallocations...\n');

        const iterations = 100;
        const batchSize = 1000;

        this.captureMemorySnapshot('Memory Stress - Start');
        const startMem = process.memoryUsage().heapUsed;

        for (let i = 0; i < iterations; i++) {
            const batch = Array.from({ length: batchSize }, (_, j) => this.generateState(i * batchSize + j));
            this.engine.calculateBatchBehavioralStates(batch);

            if (i % 10 === 0) {
                const currentMem = process.memoryUsage().heapUsed;
                const delta = ((currentMem - startMem) / 1024 / 1024).toFixed(2);
                console.log(`   Iteration ${i}/${iterations}: Heap Δ ${delta > 0 ? '+' : ''}${delta}MB`);
            }
        }

        if (global.gc) {
            console.log('\n   Running garbage collection...');
            global.gc();
        }

        this.captureMemorySnapshot('Memory Stress - After GC');
        const endMem = process.memoryUsage().heapUsed;
        const totalDelta = ((endMem - startMem) / 1024 / 1024).toFixed(2);

        console.log(`\n   Total operations: ${iterations * batchSize} calculations`);
        console.log(`   Net memory change: ${totalDelta > 0 ? '+' : ''}${totalDelta}MB`);
        console.log(`   ${Math.abs(totalDelta) < 5 ? '✅' : '⚠️'} Memory usage ${Math.abs(totalDelta) < 5 ? 'stable' : 'increased significantly'}`);
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        console.log('\n\n' + '='.repeat(70));
        console.log('📈 EPIC 7 PERFORMANCE REPORT');
        console.log('='.repeat(70));

        // Overall statistics
        const engineStats = this.engine.getPerformanceStats();
        console.log('\n🔧 Engine Statistics:');
        console.log(`   Module: ${engineStats.module}`);
        console.log(`   WASM Enabled: ${engineStats.wasmEnabled ? '✅' : '❌'}`);
        console.log(`   Total Operations: ${engineStats.wasmCalls + engineStats.fallbackCalls}`);
        console.log(`   WASM Calls: ${engineStats.wasmCalls}`);
        console.log(`   Fallback Calls: ${engineStats.fallbackCalls}`);

        // Performance summary table
        console.log('\n📊 Performance Summary:');
        console.log('┌─────────────────────────────────────────┬──────────┬──────────┬──────────────┐');
        console.log('│ Benchmark                               │   Mean   │  Median  │   Throughput │');
        console.log('├─────────────────────────────────────────┼──────────┼──────────┼──────────────┤');

        for (const result of this.results.benchmarks.filter(r => r.times)) {
            const name = result.name.padEnd(39);
            const mean = `${(result.times.mean / 1000).toFixed(4)}ms`.padStart(8);
            const median = `${(result.times.median / 1000).toFixed(4)}ms`.padStart(8);
            const throughput = `${result.throughput.opsPerSecond.toLocaleString()} ops/s`.padStart(12);
            console.log(`│ ${name} │ ${mean} │ ${median} │ ${throughput} │`);
        }

        console.log('└─────────────────────────────────────────┴──────────┴──────────┴──────────────┘');

        // Memory analysis
        if (this.results.memorySnapshots.length > 0) {
            console.log('\n💾 Memory Analysis:');
            const first = this.results.memorySnapshots[0];
            const last = this.results.memorySnapshots[this.results.memorySnapshots.length - 1];
            const heapDelta = ((last.heapUsed - first.heapUsed) / 1024 / 1024).toFixed(2);
            const extDelta = ((last.external - first.external) / 1024 / 1024).toFixed(2);
            
            console.log(`   Initial Heap: ${(first.heapUsed / 1024 / 1024).toFixed(2)}MB`);
            console.log(`   Final Heap: ${(last.heapUsed / 1024 / 1024).toFixed(2)}MB`);
            console.log(`   Heap Delta: ${heapDelta > 0 ? '+' : ''}${heapDelta}MB`);
            console.log(`   External Delta: ${extDelta > 0 ? '+' : ''}${extDelta}MB`);
        }

        // Determinism results
        if (this.results.determinismResults.length > 0) {
            console.log('\n🔬 Determinism Results:');
            for (const result of this.results.determinismResults) {
                console.log(`   ${result.deterministic ? '✅' : '❌'} ${result.deterministic ? 'PASS' : 'FAIL'}: ${result.totalTests} tests, ${result.successRate}% success rate`);
            }
        }

        // 10K NPC result
        const tenKResult = this.results.benchmarks.find(r => r.name === '10K NPC Processing');
        if (tenKResult) {
            console.log('\n🎯 10K NPC Processing (Critical Metric):');
            console.log(`   Total Time: ${tenKResult.batchProcessing.totalTime.toFixed(2)}ms`);
            console.log(`   Per-NPC: ${(tenKResult.batchProcessing.perNPC * 1000).toFixed(2)}µs`);
            console.log(`   Throughput: ${tenKResult.batchProcessing.throughput.toLocaleString()} NPCs/second`);
            console.log(`   Speedup vs JS: ${tenKResult.batchProcessing.speedupVsJS.toFixed(1)}x`);
            console.log(`   ${tenKResult.batchProcessing.targetMet ? '✅' : '❌'} ${tenKResult.batchProcessing.targetMet ? 'PASS' : 'FAIL'}: < 1 second target`);
        }

        console.log('\n' + '='.repeat(70));
    }

    /**
     * Export results to JSON
     */
    async exportResults(filename = 'epic7-benchmark-results.json') {
        this.results.completedAt = new Date().toISOString();
        this.results.engineStats = this.engine.getPerformanceStats();
        
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Results exported to ${filename}`);
    }

    /**
     * Compare with Phase 1 baseline
     */
    async compareWithBaseline() {
        const baselineFile = 'benchmark-baseline.json';
        
        if (!fs.existsSync(baselineFile)) {
            console.log(`\n⚠️  Baseline file not found: ${baselineFile}`);
            return;
        }

        console.log('\n' + '='.repeat(70));
        console.log('📊 Comparison with Phase 1 Baseline');
        console.log('='.repeat(70));

        const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
        
        console.log('\n Performance Changes:');
        console.log('┌─────────────────────────────────────────┬──────────┬──────────┬──────────┐');
        console.log('│ Benchmark                               │ Baseline │  Current │  Change  │');
        console.log('├─────────────────────────────────────────┼──────────┼──────────┼──────────┤');

        for (const current of this.results.benchmarks.filter(r => r.times)) {
            const baselineResult = baseline.results?.find(r => r.name === current.name);
            if (baselineResult) {
                const name = current.name.padEnd(39);
                const baselineMean = `${baselineResult.mean.toFixed(4)}ms`.padStart(8);
                const currentMean = `${(current.times.mean / 1000).toFixed(4)}ms`.padStart(8);
                const change = ((current.times.mean / 1000 - baselineResult.mean) / baselineResult.mean * 100);
                const changeStr = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`.padStart(8);
                const indicator = change < -5 ? '🟢' : change > 5 ? '🔴' : '🟡';
                console.log(`│ ${name} │ ${baselineMean} │ ${currentMean} │ ${changeStr} ${indicator}│`);
            }
        }

        console.log('└─────────────────────────────────────────┴──────────┴──────────┴──────────┘');
        console.log('\n🟢 Improvement  🟡 No significant change  🔴 Regression');
    }
}

// Main execution
async function main() {
    const benchmark = new Epic7Benchmark();
    
    try {
        await benchmark.initialize();
        await benchmark.runAll();
        await benchmark.exportResults();
        await benchmark.compareWithBaseline();
        
        console.log('\n✅ Epic 7 Task 7.1 benchmark suite completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('   1. Review epic7-benchmark-results.json for detailed metrics');
        console.log('   2. Analyze any performance regressions');
        console.log('   3. Proceed to Task 7.2: Critical path optimization');
        
    } catch (error) {
        console.error('\n❌ Benchmark failed:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run with --expose-gc flag for memory testing
if (process.argv.includes('--help')) {
    console.log('Epic 7 Performance Benchmark Suite');
    console.log('\nUsage: node benchmark-epic7.js [--expose-gc]');
    console.log('\nOptions:');
    console.log('  --expose-gc    Enable manual garbage collection for memory testing');
    process.exit(0);
}

main();
