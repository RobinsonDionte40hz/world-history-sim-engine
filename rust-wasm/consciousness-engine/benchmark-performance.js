/**
 * Performance Benchmarking Suite for WASM Consciousness Engine
 * 
 * Establishes baseline performance metrics and tracks optimizations
 */

import { ConsciousnessEngineWasm } from './src/wrapper/ConsciousnessEngineWasm.js';

class PerformanceBenchmark {
    constructor() {
        this.results = [];
        this.engine = null;
    }

    async initialize() {
        this.engine = new ConsciousnessEngineWasm();
        await this.engine.initialize();
    }

    /**
     * Run a benchmark multiple times and collect statistics
     */
    async benchmark(name, fn, iterations = 1000) {
        console.log(`\n📊 Benchmarking: ${name}`);
        console.log(`   Iterations: ${iterations}`);
        
        // Warm-up
        for (let i = 0; i < 10; i++) {
            await fn();
        }

        // Actual benchmark
        const times = [];
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            await fn();
            const end = performance.now();
            times.push(end - start);
        }

        // Calculate statistics
        times.sort((a, b) => a - b);
        const stats = {
            name,
            iterations,
            min: times[0],
            max: times[times.length - 1],
            mean: times.reduce((a, b) => a + b, 0) / times.length,
            median: times[Math.floor(times.length / 2)],
            p95: times[Math.floor(times.length * 0.95)],
            p99: times[Math.floor(times.length * 0.99)],
            total: times.reduce((a, b) => a + b, 0)
        };

        this.results.push(stats);

        console.log(`   Min:    ${stats.min.toFixed(4)}ms`);
        console.log(`   Mean:   ${stats.mean.toFixed(4)}ms`);
        console.log(`   Median: ${stats.median.toFixed(4)}ms`);
        console.log(`   P95:    ${stats.p95.toFixed(4)}ms`);
        console.log(`   P99:    ${stats.p99.toFixed(4)}ms`);
        console.log(`   Max:    ${stats.max.toFixed(4)}ms`);

        return stats;
    }

    /**
     * Generate test data
     */
    generateConsciousnessState(index = 0) {
        const seed = index * 123456;
        return {
            baseFrequency: 3 + (seed % 12),
            baseCoherence: 0.2 + (seed % 80) / 100,
            emotionalState: ['Content', 'Excited', 'Anxious', 'Depressed', 'Joyful'][seed % 5],
            currentFrequency: 3 + (seed % 12),
            emotionalCoherence: 0.2 + (seed % 80) / 100,
            lastUpdate: Date.now()
        };
    }

    /**
     * Generate batch test data
     */
    generateBatch(size) {
        return Array.from({ length: size }, (_, i) => this.generateConsciousnessState(i));
    }

    /**
     * Run all benchmarks
     */
    async runAll() {
        console.log('🚀 Performance Benchmark Suite');
        console.log('='.repeat(70));

        // Benchmark 1: Single character calculation
        await this.benchmark(
            'Single Character Calculation',
            () => {
                const state = this.generateConsciousnessState(0);
                this.engine.calculateBehavioralState(state);
            },
            10000
        );

        // Benchmark 2: Batch processing (10 characters)
        const batch10 = this.generateBatch(10);
        await this.benchmark(
            'Batch Processing (10 characters)',
            () => {
                this.engine.calculateBatchBehavioralStates(batch10);
            },
            1000
        );

        // Benchmark 3: Batch processing (100 characters)
        const batch100 = this.generateBatch(100);
        await this.benchmark(
            'Batch Processing (100 characters)',
            () => {
                this.engine.calculateBatchBehavioralStates(batch100);
            },
            1000
        );

        // Benchmark 4: Batch processing (1000 characters)
        const batch1000 = this.generateBatch(1000);
        await this.benchmark(
            'Batch Processing (1000 characters)',
            () => {
                this.engine.calculateBatchBehavioralStates(batch1000);
            },
            100
        );

        // Benchmark 5: Emotional coherence calculation
        await this.benchmark(
            'Emotional Coherence Calculation',
            () => {
                this.engine.calculateEmotionalCoherence(7.5, 0.7);
            },
            10000
        );

        // Benchmark 6: Emotional state determination
        await this.benchmark(
            'Emotional State Determination',
            () => {
                this.engine.determineEmotionalState(0.7, 0.5);
            },
            10000
        );

        // Benchmark 7: Sequential single calculations (simulates real usage)
        await this.benchmark(
            'Sequential Single Calculations (100)',
            () => {
                for (let i = 0; i < 100; i++) {
                    const state = this.generateConsciousnessState(i);
                    this.engine.calculateBehavioralState(state);
                }
            },
            100
        );

        // Benchmark 8: Mixed operations (realistic workload)
        await this.benchmark(
            'Mixed Operations (realistic workload)',
            () => {
                // Calculate 10 single characters
                for (let i = 0; i < 10; i++) {
                    const state = this.generateConsciousnessState(i);
                    this.engine.calculateBehavioralState(state);
                }
                
                // Calculate emotional states
                for (let i = 0; i < 5; i++) {
                    this.engine.calculateEmotionalCoherence(7.5 + i, 0.7);
                    this.engine.determineEmotionalState(0.7, 0.5 + i * 0.1);
                }
                
                // Batch process 50 characters
                const batch = this.generateBatch(50);
                this.engine.calculateBatchBehavioralStates(batch);
            },
            100
        );

        this.printSummary();
    }

    /**
     * Print summary table
     */
    printSummary() {
        console.log('\n\n' + '='.repeat(70));
        console.log('📈 Performance Summary');
        console.log('='.repeat(70));

        console.log('\n Performance Metrics:');
        console.log('┌─────────────────────────────────────────┬──────────┬──────────┬──────────┐');
        console.log('│ Benchmark                               │   Mean   │  Median  │   P95    │');
        console.log('├─────────────────────────────────────────┼──────────┼──────────┼──────────┤');

        for (const result of this.results) {
            const name = result.name.padEnd(39);
            const mean = `${result.mean.toFixed(4)}ms`.padStart(8);
            const median = `${result.median.toFixed(4)}ms`.padStart(8);
            const p95 = `${result.p95.toFixed(4)}ms`.padStart(8);
            console.log(`│ ${name} │ ${mean} │ ${median} │ ${p95} │`);
        }

        console.log('└─────────────────────────────────────────┴──────────┴──────────┴──────────┘');

        // Calculate throughput
        const singleCalc = this.results.find(r => r.name === 'Single Character Calculation');
        if (singleCalc) {
            const throughput = Math.floor(1000 / singleCalc.mean);
            console.log(`\n⚡ Single Character Throughput: ${throughput.toLocaleString()} calculations/second`);
        }

        const batch100 = this.results.find(r => r.name === 'Batch Processing (100 characters)');
        if (batch100) {
            const throughput = Math.floor(100 * 1000 / batch100.mean);
            console.log(`⚡ Batch Processing Throughput: ${throughput.toLocaleString()} characters/second`);
        }

        // Memory stats
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const mem = process.memoryUsage();
            console.log('\n💾 Memory Usage:');
            console.log(`   Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Heap Total: ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   External: ${(mem.external / 1024 / 1024).toFixed(2)} MB`);
        }

        // Engine stats
        const engineStats = this.engine.getPerformanceStats();
        console.log('\n🔧 Engine Statistics:');
        console.log(`   Module: ${engineStats.module}`);
        console.log(`   WASM Enabled: ${engineStats.wasmEnabled ? '✅' : '❌'}`);
        console.log(`   Total Operations: ${engineStats.wasmCalls + engineStats.fallbackCalls}`);
        console.log(`   WASM Calls: ${engineStats.wasmCalls}`);
        console.log(`   Fallback Calls: ${engineStats.fallbackCalls}`);

        console.log('\n' + '='.repeat(70));
    }

    /**
     * Export results to JSON
     */
    async exportResults(filename = 'benchmark-results.json') {
        const fs = await import('fs');
        const data = {
            timestamp: new Date().toISOString(),
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            wasmEnabled: this.engine.getPerformanceStats().wasmEnabled,
            results: this.results,
            memoryUsage: process.memoryUsage()
        };
        
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`\n💾 Results exported to ${filename}`);
    }

    /**
     * Compare with previous benchmark
     */
    async compareWithBaseline(baselineFile) {
        try {
            const fs = await import('fs');
            const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
            
            console.log('\n\n' + '='.repeat(70));
            console.log('📊 Comparison with Baseline');
            console.log('='.repeat(70));

            console.log('\n Performance Changes:');
            console.log('┌─────────────────────────────────────────┬──────────┬──────────┬──────────┐');
            console.log('│ Benchmark                               │ Baseline │  Current │  Change  │');
            console.log('├─────────────────────────────────────────┼──────────┼──────────┼──────────┤');

            for (const current of this.results) {
                const baselineResult = baseline.results.find(r => r.name === current.name);
                if (baselineResult) {
                    const name = current.name.padEnd(39);
                    const baselineMean = `${baselineResult.mean.toFixed(4)}ms`.padStart(8);
                    const currentMean = `${current.mean.toFixed(4)}ms`.padStart(8);
                    const change = ((current.mean - baselineResult.mean) / baselineResult.mean * 100);
                    const changeStr = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`.padStart(8);
                    const indicator = change < -5 ? '🟢' : change > 5 ? '🔴' : '🟡';
                    console.log(`│ ${name} │ ${baselineMean} │ ${currentMean} │ ${changeStr} ${indicator}│`);
                }
            }

            console.log('└─────────────────────────────────────────┴──────────┴──────────┴──────────┘');
            console.log('\n🟢 Improvement  🟡 No significant change  🔴 Regression');

        } catch (error) {
            console.log(`\n⚠️  Could not load baseline file: ${error.message}`);
        }
    }
}

// Run benchmarks
async function main() {
    const benchmark = new PerformanceBenchmark();
    await benchmark.initialize();
    
    await benchmark.runAll();
    
    // Export results
    await benchmark.exportResults('benchmark-baseline.json');
    
    // Compare with previous baseline if it exists
    try {
        const fs = await import('fs');
        if (fs.existsSync('benchmark-previous.json')) {
            await benchmark.compareWithBaseline('benchmark-previous.json');
        }
    } catch (error) {
        // Baseline doesn't exist yet
    }
}

main().catch(error => {
    console.error('❌ Benchmark failed:', error);
    console.error(error.stack);
    process.exit(1);
});
