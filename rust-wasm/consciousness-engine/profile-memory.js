/**
 * Task 7.2.2: Memory Growth Investigation
 * 
 * This script profiles memory allocations during consciousness engine operations
 * to identify the source of +6.87MB growth during 100K operation stress test.
 * 
 * Focus Areas:
 * 1. Object pool lifecycle and release logic
 * 2. WASM memory allocation patterns
 * 3. JavaScript-side memory retention
 * 4. Garbage collection effectiveness
 */

import { ConsciousnessEngineWasm } from './src/wrapper/ConsciousnessEngineWasm.js';

class MemoryProfiler {
    constructor() {
        this.engine = null;
        this.snapshots = [];
        this.results = {
            timestamp: new Date().toISOString(),
            tests: [],
            recommendations: []
        };
    }

    async initialize() {
        console.log('💾 Memory Growth Investigation Tool');
        console.log('='.repeat(70));
        console.log('\n🎯 Target: Understand +6.87MB growth during 100K operations');
        console.log('   Baseline: Initial memory state');
        console.log('   Goal: Identify allocation sources and optimize\n');

        this.engine = new ConsciousnessEngineWasm();
        await this.engine.initialize();
        
        const stats = this.engine.getPerformanceStats();
        console.log(`✅ Engine initialized: ${stats.module} mode\n`);
    }

    /**
     * Take a detailed memory snapshot
     */
    captureSnapshot(label, metadata = {}) {
        const mem = process.memoryUsage();
        const snapshot = {
            label,
            timestamp: Date.now(),
            heapUsed: mem.heapUsed,
            heapTotal: mem.heapTotal,
            external: mem.external,
            rss: mem.rss,
            arrayBuffers: mem.arrayBuffers || 0,
            metadata
        };
        
        this.snapshots.push(snapshot);
        return snapshot;
    }

    /**
     * Format bytes to human-readable
     */
    formatBytes(bytes) {
        return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
    }

    /**
     * Calculate delta between snapshots
     */
    calculateDelta(before, after) {
        return {
            heapUsed: after.heapUsed - before.heapUsed,
            heapTotal: after.heapTotal - before.heapTotal,
            external: after.external - before.external,
            rss: after.rss - before.rss,
            arrayBuffers: after.arrayBuffers - before.arrayBuffers
        };
    }

    /**
     * Print snapshot details
     */
    printSnapshot(snapshot, showDelta = null) {
        console.log(`\n📸 ${snapshot.label}`);
        console.log(`   Heap Used:     ${this.formatBytes(snapshot.heapUsed)}`);
        console.log(`   Heap Total:    ${this.formatBytes(snapshot.heapTotal)}`);
        console.log(`   External:      ${this.formatBytes(snapshot.external)}`);
        console.log(`   RSS:           ${this.formatBytes(snapshot.rss)}`);
        console.log(`   Array Buffers: ${this.formatBytes(snapshot.arrayBuffers)}`);
        
        if (showDelta) {
            const delta = this.calculateDelta(showDelta, snapshot);
            console.log(`\n   📊 Delta from ${showDelta.label}:`);
            console.log(`      Heap Used:     ${this.formatBytes(delta.heapUsed)} (${delta.heapUsed > 0 ? '+' : ''}${((delta.heapUsed/showDelta.heapUsed)*100).toFixed(1)}%)`);
            console.log(`      External:      ${this.formatBytes(delta.external)} (${delta.external > 0 ? '+' : ''}${((delta.external/showDelta.external)*100).toFixed(1)}%)`);
            console.log(`      Array Buffers: ${this.formatBytes(delta.arrayBuffers)}`);
        }
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
     * Test 1: Baseline memory behavior (small scale)
     */
    async testBaseline() {
        console.log('\n' + '='.repeat(70));
        console.log('📊 Test 1: Baseline Memory Behavior (1,000 operations)');
        console.log('='.repeat(70));
        
        if (global.gc) {
            global.gc();
            console.log('♻️  Forced garbage collection before test');
        }
        
        await new Promise(resolve => setTimeout(resolve, 100)); // Let GC settle
        
        const before = this.captureSnapshot('Before baseline test');
        this.printSnapshot(before);
        
        // Run 1,000 operations
        console.log('\n🔄 Running 1,000 single operations...');
        for (let i = 0; i < 1000; i++) {
            const state = this.generateState(i);
            this.engine.calculateBehavioralState(state);
        }
        
        const after = this.captureSnapshot('After 1,000 operations');
        this.printSnapshot(after, before);
        
        const delta = this.calculateDelta(before, after);
        const perOp = delta.heapUsed / 1000;
        
        console.log(`\n📈 Per-operation memory cost: ${perOp.toFixed(2)} bytes`);
        
        if (Math.abs(perOp) < 100) {
            console.log('   ✅ Excellent - minimal per-operation overhead');
        } else if (Math.abs(perOp) < 500) {
            console.log('   ⚠️  Moderate - some memory allocation per operation');
        } else {
            console.log('   🔴 High - significant memory allocation per operation');
        }
        
        this.results.tests.push({
            name: 'Baseline (1K ops)',
            operations: 1000,
            memoryDelta: delta.heapUsed,
            perOpCost: perOp
        });
    }

    /**
     * Test 2: Batch processing memory efficiency
     */
    async testBatchProcessing() {
        console.log('\n' + '='.repeat(70));
        console.log('📊 Test 2: Batch Processing Memory Efficiency');
        console.log('='.repeat(70));
        
        if (global.gc) {
            global.gc();
            console.log('♻️  Forced garbage collection before test');
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const before = this.captureSnapshot('Before batch test');
        this.printSnapshot(before);
        
        // Test different batch sizes
        const batchSizes = [10, 100, 1000];
        
        for (const size of batchSizes) {
            console.log(`\n🔄 Testing batch size: ${size}...`);
            
            const batchBefore = this.captureSnapshot(`Before batch ${size}`);
            
            // Run 10 batches
            for (let i = 0; i < 10; i++) {
                const batch = Array.from({ length: size }, (_, j) => 
                    this.generateState(i * size + j)
                );
                this.engine.calculateBatchBehavioralStates(batch);
            }
            
            const batchAfter = this.captureSnapshot(`After batch ${size}`);
            const batchDelta = this.calculateDelta(batchBefore, batchAfter);
            
            const totalOps = size * 10;
            const perOp = batchDelta.heapUsed / totalOps;
            
            console.log(`   Operations: ${totalOps}`);
            console.log(`   Memory delta: ${this.formatBytes(batchDelta.heapUsed)}`);
            console.log(`   Per-op: ${perOp.toFixed(2)} bytes`);
            
            this.results.tests.push({
                name: `Batch ${size}`,
                operations: totalOps,
                batchSize: size,
                memoryDelta: batchDelta.heapUsed,
                perOpCost: perOp
            });
        }
        
        const after = this.captureSnapshot('After all batch tests');
        this.printSnapshot(after, before);
    }

    /**
     * Test 3: Stress test with periodic measurement
     */
    async testStressGrowth() {
        console.log('\n' + '='.repeat(70));
        console.log('📊 Test 3: Stress Test Memory Growth (100K operations)');
        console.log('='.repeat(70));
        
        if (global.gc) {
            global.gc();
            console.log('♻️  Forced garbage collection before test');
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const start = this.captureSnapshot('Stress test start');
        this.printSnapshot(start);
        
        const iterations = 100;
        const batchSize = 1000;
        const totalOps = iterations * batchSize;
        const checkpoints = [10, 25, 50, 75, 100];
        
        console.log(`\n🔄 Running ${totalOps.toLocaleString()} operations in ${iterations} batches...`);
        console.log('   Measuring memory at checkpoints...\n');
        
        for (let i = 0; i < iterations; i++) {
            const batch = Array.from({ length: batchSize }, (_, j) => 
                this.generateState(i * batchSize + j)
            );
            this.engine.calculateBatchBehavioralStates(batch);
            
            // Take snapshots at checkpoints
            if (checkpoints.includes(i + 1)) {
                const progress = ((i + 1) / iterations * 100).toFixed(0);
                const checkpoint = this.captureSnapshot(
                    `Checkpoint ${i + 1}/${iterations}`,
                    { iteration: i + 1, operations: (i + 1) * batchSize }
                );
                
                const delta = this.calculateDelta(start, checkpoint);
                const currentPerOp = delta.heapUsed / ((i + 1) * batchSize);
                
                console.log(`   [${progress}%] Iteration ${i + 1}/${iterations}: ` +
                           `Heap Δ ${this.formatBytes(delta.heapUsed)}, ` +
                           `Per-op: ${currentPerOp.toFixed(2)} bytes`);
            }
        }
        
        console.log('\n⏳ Letting memory stabilize...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const beforeGC = this.captureSnapshot('Before GC');
        
        if (global.gc) {
            console.log('♻️  Forcing garbage collection...');
            global.gc();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const afterGC = this.captureSnapshot('After GC');
        
        console.log('\n📊 Final Results:');
        this.printSnapshot(beforeGC, start);
        this.printSnapshot(afterGC, start);
        
        const deltaBeforeGC = this.calculateDelta(start, beforeGC);
        const deltaAfterGC = this.calculateDelta(start, afterGC);
        const gcReclaimed = beforeGC.heapUsed - afterGC.heapUsed;
        
        console.log(`\n♻️  Garbage Collection Impact:`);
        console.log(`   Before GC: ${this.formatBytes(deltaBeforeGC.heapUsed)} growth`);
        console.log(`   After GC:  ${this.formatBytes(deltaAfterGC.heapUsed)} growth`);
        console.log(`   Reclaimed: ${this.formatBytes(gcReclaimed)} (${((gcReclaimed/beforeGC.heapUsed)*100).toFixed(1)}%)`);
        
        const finalPerOp = deltaAfterGC.heapUsed / totalOps;
        console.log(`\n📈 Final per-operation cost: ${finalPerOp.toFixed(2)} bytes`);
        
        if (finalPerOp < 50) {
            console.log('   ✅ Excellent - memory stable after GC');
        } else if (finalPerOp < 100) {
            console.log('   ⚠️  Moderate - some memory retention');
        } else {
            console.log('   🔴 High - significant memory retention (leak?)');
        }
        
        this.results.tests.push({
            name: 'Stress test (100K ops)',
            operations: totalOps,
            memoryDeltaBeforeGC: deltaBeforeGC.heapUsed,
            memoryDeltaAfterGC: deltaAfterGC.heapUsed,
            gcReclaimed: gcReclaimed,
            perOpCost: finalPerOp
        });
    }

    /**
     * Test 4: WASM memory analysis
     */
    async testWASMMemory() {
        console.log('\n' + '='.repeat(70));
        console.log('📊 Test 4: WASM Memory Analysis');
        console.log('='.repeat(70));
        
        if (global.gc) {
            global.gc();
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const before = this.captureSnapshot('Before WASM test');
        
        console.log('\n📊 Initial WASM Memory:');
        console.log(`   External memory: ${this.formatBytes(before.external)}`);
        console.log(`   Array buffers:   ${this.formatBytes(before.arrayBuffers)}`);
        
        // Run operations focusing on WASM
        console.log('\n🔄 Running 50,000 operations to stress WASM memory...');
        
        const checkpoints = [10000, 25000, 50000];
        for (let i = 0; i < 50000; i++) {
            const state = this.generateState(i);
            this.engine.calculateBehavioralState(state);
            
            if (checkpoints.includes(i + 1)) {
                const snapshot = this.captureSnapshot(`WASM checkpoint ${i + 1}`);
                const delta = this.calculateDelta(before, snapshot);
                console.log(`   [${i + 1}] External Δ: ${this.formatBytes(delta.external)}, ` +
                           `ArrayBuffer Δ: ${this.formatBytes(delta.arrayBuffers)}`);
            }
        }
        
        const after = this.captureSnapshot('After WASM test');
        const delta = this.calculateDelta(before, after);
        
        console.log('\n📊 WASM Memory Growth:');
        console.log(`   External delta:     ${this.formatBytes(delta.external)}`);
        console.log(`   ArrayBuffer delta:  ${this.formatBytes(delta.arrayBuffers)}`);
        console.log(`   Total WASM growth:  ${this.formatBytes(delta.external + delta.arrayBuffers)}`);
        
        const wasmGrowth = delta.external + delta.arrayBuffers;
        if (wasmGrowth < 1024 * 1024) { // < 1MB
            console.log('   ✅ Minimal WASM memory growth');
        } else if (wasmGrowth < 5 * 1024 * 1024) { // < 5MB
            console.log('   ⚠️  Moderate WASM memory growth');
        } else {
            console.log('   🔴 High WASM memory growth - investigate');
        }
        
        this.results.tests.push({
            name: 'WASM memory (50K ops)',
            operations: 50000,
            wasmGrowth: wasmGrowth,
            externalDelta: delta.external,
            arrayBufferDelta: delta.arrayBuffers
        });
    }

    /**
     * Test 5: Object lifetime analysis
     */
    async testObjectLifetime() {
        console.log('\n' + '='.repeat(70));
        console.log('📊 Test 5: Object Lifetime Analysis');
        console.log('='.repeat(70));
        
        if (global.gc) {
            global.gc();
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('\n🔄 Testing object creation and cleanup patterns...');
        
        // Test 1: Create and immediately discard
        const test1Before = this.captureSnapshot('Test5.1 - Before create/discard');
        
        for (let i = 0; i < 10000; i++) {
            const state = this.generateState(i);
            const result = this.engine.calculateBehavioralState(state);
            // Immediately discard result - should be GC-able
        }
        
        if (global.gc) global.gc();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const test1After = this.captureSnapshot('Test5.1 - After create/discard + GC');
        const delta1 = this.calculateDelta(test1Before, test1After);
        
        console.log(`\n   Test 5.1 - Create & Discard (10K ops):`);
        console.log(`      Memory delta: ${this.formatBytes(delta1.heapUsed)}`);
        console.log(`      Per-op: ${(delta1.heapUsed / 10000).toFixed(2)} bytes`);
        
        // Test 2: Accumulate references (no cleanup)
        const test2Before = this.captureSnapshot('Test5.2 - Before accumulate');
        const accumulated = [];
        
        for (let i = 0; i < 10000; i++) {
            const state = this.generateState(i);
            const result = this.engine.calculateBehavioralState(state);
            accumulated.push(result); // Keep reference - prevent GC
        }
        
        const test2After = this.captureSnapshot('Test5.2 - After accumulate');
        const delta2 = this.calculateDelta(test2Before, test2After);
        
        console.log(`\n   Test 5.2 - Accumulate (10K ops):`);
        console.log(`      Memory delta: ${this.formatBytes(delta2.heapUsed)}`);
        console.log(`      Per-op: ${(delta2.heapUsed / 10000).toFixed(2)} bytes`);
        
        // Clear accumulated and GC
        accumulated.length = 0;
        if (global.gc) global.gc();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const test2AfterGC = this.captureSnapshot('Test5.2 - After clear + GC');
        const delta2GC = this.calculateDelta(test2Before, test2AfterGC);
        
        console.log(`      After cleanup: ${this.formatBytes(delta2GC.heapUsed)}`);
        
        // Analysis
        const gcableRatio = (delta2.heapUsed - delta1.heapUsed) / delta2.heapUsed;
        console.log(`\n   📊 Analysis:`);
        console.log(`      GC-able ratio: ${(gcableRatio * 100).toFixed(1)}%`);
        
        if (gcableRatio > 0.9) {
            console.log('      ✅ Excellent - most memory is GC-able');
        } else if (gcableRatio > 0.7) {
            console.log('      ⚠️  Moderate - some memory retained');
        } else {
            console.log('      🔴 Poor - significant memory retention');
        }
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        console.log('\n\n' + '='.repeat(70));
        console.log('📋 MEMORY GROWTH ANALYSIS REPORT');
        console.log('='.repeat(70));
        
        console.log('\n📊 Test Results Summary:\n');
        
        for (const test of this.results.tests) {
            console.log(`   ${test.name}:`);
            console.log(`      Operations: ${test.operations.toLocaleString()}`);
            
            if (test.perOpCost !== undefined) {
                console.log(`      Per-op cost: ${test.perOpCost.toFixed(2)} bytes`);
            }
            
            if (test.memoryDelta !== undefined) {
                console.log(`      Total delta: ${this.formatBytes(test.memoryDelta)}`);
            }
            
            if (test.gcReclaimed !== undefined) {
                console.log(`      GC reclaimed: ${this.formatBytes(test.gcReclaimed)}`);
            }
            
            if (test.wasmGrowth !== undefined) {
                console.log(`      WASM growth: ${this.formatBytes(test.wasmGrowth)}`);
            }
            
            console.log('');
        }
        
        // Generate recommendations
        console.log('🔍 Key Findings:\n');
        
        const stressTest = this.results.tests.find(t => t.name.includes('Stress'));
        if (stressTest) {
            console.log(`   1. Stress Test (100K operations):`);
            console.log(`      - Growth before GC: ${this.formatBytes(stressTest.memoryDeltaBeforeGC)}`);
            console.log(`      - Growth after GC:  ${this.formatBytes(stressTest.memoryDeltaAfterGC)}`);
            console.log(`      - GC effectiveness: ${((stressTest.gcReclaimed / stressTest.memoryDeltaBeforeGC) * 100).toFixed(1)}%`);
            console.log(`      - Per-op retention: ${stressTest.perOpCost.toFixed(2)} bytes`);
            
            if (stressTest.perOpCost < 50) {
                console.log(`      ✅ Assessment: Excellent memory management`);
                this.results.recommendations.push('Memory growth is minimal and acceptable');
            } else if (stressTest.perOpCost < 100) {
                console.log(`      ⚠️  Assessment: Moderate memory retention`);
                this.results.recommendations.push('Consider optimizing object pooling or cleanup');
            } else {
                console.log(`      🔴 Assessment: High memory retention`);
                this.results.recommendations.push('CRITICAL: Investigate memory leak');
            }
        }
        
        const wasmTest = this.results.tests.find(t => t.name.includes('WASM'));
        if (wasmTest && wasmTest.wasmGrowth) {
            console.log(`\n   2. WASM Memory Growth:`);
            console.log(`      - Total growth: ${this.formatBytes(wasmTest.wasmGrowth)}`);
            console.log(`      - External: ${this.formatBytes(wasmTest.externalDelta)}`);
            console.log(`      - Array buffers: ${this.formatBytes(wasmTest.arrayBufferDelta)}`);
            
            if (wasmTest.wasmGrowth < 1024 * 1024) {
                console.log(`      ✅ Assessment: WASM memory stable`);
            } else if (wasmTest.wasmGrowth < 5 * 1024 * 1024) {
                console.log(`      ⚠️  Assessment: Some WASM growth observed`);
                this.results.recommendations.push('Monitor WASM memory in long-running scenarios');
            } else {
                console.log(`      🔴 Assessment: Significant WASM growth`);
                this.results.recommendations.push('Investigate WASM object pool or memory management');
            }
        }
        
        console.log('\n💡 Recommendations:\n');
        
        if (this.results.recommendations.length === 0) {
            this.results.recommendations.push('No critical issues found - memory management is acceptable');
        }
        
        this.results.recommendations.forEach((rec, i) => {
            console.log(`   ${i + 1}. ${rec}`);
        });
        
        console.log('\n' + '='.repeat(70));
    }

    /**
     * Export results
     */
    async exportResults() {
        const fs = await import('fs');
        fs.writeFileSync(
            'memory-analysis.json',
            JSON.stringify({
                ...this.results,
                snapshots: this.snapshots
            }, null, 2)
        );
        console.log('\n💾 Results exported to memory-analysis.json');
    }

    /**
     * Run all tests
     */
    async runAll() {
        await this.initialize();
        
        await this.testBaseline();
        await this.testBatchProcessing();
        await this.testStressGrowth();
        await this.testWASMMemory();
        await this.testObjectLifetime();
        
        this.generateReport();
        await this.exportResults();
        
        console.log('\n✅ Memory profiling complete!');
        console.log('\n📋 Next steps:');
        console.log('   1. Review memory-analysis.json for detailed data');
        console.log('   2. Implement recommendations if needed');
        console.log('   3. Proceed to Task 7.2.3: SIMD evaluation');
    }
}

// Main execution
async function main() {
    const profiler = new MemoryProfiler();
    await profiler.runAll();
}

main().catch(error => {
    console.error('❌ Memory profiling failed:', error);
    console.error(error.stack);
    process.exit(1);
});
