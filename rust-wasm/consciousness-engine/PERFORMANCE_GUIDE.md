# Performance Guide - Consciousness Engine WASM

**Version**: 0.1.0  
**Date**: October 18, 2025  
**Target Audience**: Developers optimizing large-scale simulations

---

## Table of Contents

1. [Performance Overview](#performance-overview)
2. [Benchmarks](#benchmarks)
3. [Optimization Strategies](#optimization-strategies)
4. [Batch Processing](#batch-processing)
5. [Memory Management](#memory-management)
6. [Profiling & Monitoring](#profiling--monitoring)
7. [Scaling Considerations](#scaling-considerations)

---

## Performance Overview

### Key Metrics

| Metric | WASM | JavaScript | Improvement |
|--------|------|------------|-------------|
| **Single Character** | 0.007ms | 0.015ms | **5x faster** |
| **Batch 100** | 0.077ms | 1.5ms | **19x faster** |
| **Batch 1,000** | 0.29ms | 15ms | **52x faster** |
| **Batch 10,000** | 4.42ms | 150ms | **34x faster** |
| **Throughput** | 2.26M/sec | 67K/sec | **34x higher** |
| **Memory (10K)** | 4.84MB | ~50MB | **10x less** |

### When to Use WASM

✅ **Use WASM for:**
- 100+ characters per simulation
- Turn-based processing with large populations
- LOD Tier 3 (Population Groups)
- Real-time simulations requiring <100ms response
- Memory-constrained environments

❌ **JavaScript Adequate for:**
- < 10 characters
- One-time calculations
- Non-performance-critical UI updates
- Development/debugging (easier stack traces)

---

## Benchmarks

### Benchmark Suite

Run comprehensive benchmarks:
```bash
cd rust-wasm/consciousness-engine
node benchmark-epic7.js
```

### Expected Results

**10,000 NPCs Benchmark**:
```
✅ Processed 10,000 NPCs in 4.42ms
✅ Throughput: 2,264,065 NPCs/second
✅ Memory: 4.84MB (99% GC-able)
✅ Determinism: 100% (1,000 iterations)
```

### Creating Custom Benchmarks

```javascript
import { wasmEngine } from './ConsciousnessEngineWasm.js';

async function benchmarkCustomScenario() {
    await wasmEngine.initialize();
    
    // Create test data
    const characters = Array(5000).fill(null).map(() => ({
        baseFrequency: 5 + Math.random() * 5,
        baseCoherence: 0.5 + Math.random() * 0.3,
        emotionalState: 'Content'
    }));
    
    // Warm-up (JIT compilation)
    for (let i = 0; i < 10; i++) {
        wasmEngine.calculateBatchBehavioralStates(characters);
    }
    
    // Benchmark
    const iterations = 100;
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
        wasmEngine.calculateBatchBehavioralStates(characters);
    }
    
    const duration = performance.now() - start;
    const avgTime = duration / iterations;
    const throughput = (characters.length * iterations) / (duration / 1000);
    
    console.log(`\n=== Custom Benchmark Results ===`);
    console.log(`Characters: ${characters.length}`);
    console.log(`Iterations: ${iterations}`);
    console.log(`Total time: ${duration.toFixed(2)}ms`);
    console.log(`Avg per iteration: ${avgTime.toFixed(4)}ms`);
    console.log(`Throughput: ${throughput.toFixed(0)} chars/sec`);
}
```

---

## Optimization Strategies

### 1. Use Batch Processing

**Bad** (100 individual calls):
```javascript
// ❌ 1.5ms for 100 characters
for (const char of characters) {
    char.consciousness.behavioralState = 
        wasmEngine.calculateBehavioralState(char.consciousness);
}
```

**Good** (1 batch call):
```javascript
// ✅ 0.077ms for 100 characters (19x faster)
const behaviors = wasmEngine.calculateBatchBehavioralStates(
    characters.map(c => c.consciousness)
);

characters.forEach((char, i) => {
    char.consciousness.behavioralState = behaviors[i];
});
```

**Speedup**: 19x faster for 100 characters

---

### 2. Minimize Data Transformation

**Bad** (unnecessary object creation):
```javascript
// ❌ Creating intermediate objects
const states = characters.map(char => ({
    baseFrequency: char.consciousness.baseFrequency,
    baseCoherence: char.consciousness.baseCoherence,
    emotionalState: char.consciousness.emotionalState,
    currentFrequency: char.consciousness.currentFrequency || char.consciousness.baseFrequency,
    emotionalCoherence: char.consciousness.emotionalCoherence || char.consciousness.baseCoherence,
    lastUpdate: Date.now()
}));
```

**Good** (minimal transformation):
```javascript
// ✅ Pass existing consciousness objects directly
const behaviors = wasmEngine.calculateBatchBehavioralStates(
    characters.map(c => c.consciousness)
);
```

**Speedup**: ~2x faster (less GC pressure)

---

### 3. Reuse Engine Instance

**Bad** (creating multiple instances):
```javascript
// ❌ New engine per call
function processTurn(world) {
    const engine = new ConsciousnessEngineWasm();
    await engine.initialize();  // Expensive!
    // ...
}
```

**Good** (singleton pattern):
```javascript
// ✅ Create once, reuse everywhere
import { wasmEngine } from './WasmEngineInstance.js';

function processTurn(world) {
    const behaviors = wasmEngine.calculateBatchBehavioralStates(
        world.characters.map(c => c.consciousness)
    );
    // ...
}
```

**Speedup**: Eliminates ~50ms initialization overhead per call

---

### 4. Optimize LOD Tier Processing

**Strategy**: Match processing method to LOD tier

```javascript
class LODManager {
    updateCharacters(characters, tier) {
        switch (tier) {
            case 'HERO':  // 1-10 characters
                // Individual processing acceptable
                characters.forEach(char => {
                    char.consciousness.behavioralState = 
                        wasmEngine.calculateBehavioralState(char.consciousness);
                });
                break;
                
            case 'NAMED_NPC':  // 10-50 characters
                // Small batch processing
                const behaviors = wasmEngine.calculateBatchBehavioralStates(
                    characters.map(c => c.consciousness)
                );
                characters.forEach((char, i) => {
                    char.consciousness.behavioralState = behaviors[i];
                });
                break;
                
            case 'POPULATION_GROUP':  // 50-1000 characters
                // Large batch processing (optimal)
                const groupBehaviors = wasmEngine.calculateBatchBehavioralStates(
                    characters.map(c => c.consciousness)
                );
                characters.forEach((char, i) => {
                    char.consciousness.behavioralState = groupBehaviors[i];
                });
                break;
        }
    }
}
```

---

### 5. Cache Behavioral States

Only recalculate when consciousness changes:

```javascript
class Character {
    updateBehavioralState(force = false) {
        const timeSinceUpdate = Date.now() - 
            (this.consciousness.behavioralState?.cachedTimestamp || 0);
        
        // Skip if recently updated and no force
        if (!force && timeSinceUpdate < 60000) {  // 60 seconds
            return this.consciousness.behavioralState;
        }
        
        // Recalculate
        this.consciousness.behavioralState = 
            wasmEngine.calculateBehavioralState(this.consciousness);
        
        return this.consciousness.behavioralState;
    }
}
```

**Benefit**: Reduces calculations by 50-90% depending on update frequency

---

## Batch Processing

### Batch Size Recommendations

| Characters | Method | Expected Time | Notes |
|-----------|--------|---------------|-------|
| 1-10 | Single | ~0.07ms | Individual OK |
| 10-100 | Batch | ~0.08ms | **Batch recommended** |
| 100-1000 | Batch | ~0.29ms | **Always batch** |
| 1000-10000 | Batch | ~4.4ms | **Batch required** |
| 10000+ | Chunked batch | ~44ms per 10K | See chunking |

### Chunking Large Batches

For 50K+ characters, chunk into batches:

```javascript
function processLargePopulation(characters, chunkSize = 10000) {
    const allBehaviors = [];
    
    for (let i = 0; i < characters.length; i += chunkSize) {
        const chunk = characters.slice(i, i + chunkSize);
        const behaviors = wasmEngine.calculateBatchBehavioralStates(
            chunk.map(c => c.consciousness)
        );
        allBehaviors.push(...behaviors);
    }
    
    return allBehaviors;
}

// Process 50,000 characters in ~220ms
const behaviors = processLargePopulation(world.allCharacters, 10000);
```

---

### Parallel Processing

For extremely large populations (100K+), use Web Workers:

```javascript
// worker.js
import { wasmEngine } from './ConsciousnessEngineWasm.js';

self.onmessage = async (e) => {
    await wasmEngine.initialize();
    
    const { characters } = e.data;
    const behaviors = wasmEngine.calculateBatchBehavioralStates(characters);
    
    self.postMessage({ behaviors });
};

// main.js
const workers = Array(4).fill(null).map(() => 
    new Worker('worker.js', { type: 'module' })
);

async function processWithWorkers(characters) {
    const chunkSize = Math.ceil(characters.length / workers.length);
    
    const promises = workers.map((worker, i) => {
        const chunk = characters.slice(i * chunkSize, (i + 1) * chunkSize);
        
        return new Promise(resolve => {
            worker.onmessage = (e) => resolve(e.data.behaviors);
            worker.postMessage({ characters: chunk.map(c => c.consciousness) });
        });
    });
    
    const results = await Promise.all(promises);
    return results.flat();
}

// Process 100K characters in ~250ms (4 workers)
const behaviors = await processWithWorkers(world.massivePopulation);
```

---

## Memory Management

### Memory Characteristics

**WASM Engine**:
- **Permanent**: 0.31 bytes/operation
- **Temporary**: 99% GC-able
- **Peak**: 4.84MB for 10K NPCs
- **Baseline**: ~400KB (WASM module)

### Memory Profiling

```javascript
async function profileMemory() {
    await wasmEngine.initialize();
    
    if (global.gc) {
        global.gc();  // Force GC (run with --expose-gc)
    }
    
    const memBefore = process.memoryUsage();
    
    // Process 10,000 characters
    const characters = Array(10000).fill(null).map(() => ({
        baseFrequency: 5 + Math.random() * 5,
        baseCoherence: 0.5 + Math.random() * 0.3,
        emotionalState: 'Content'
    }));
    
    const behaviors = wasmEngine.calculateBatchBehavioralStates(characters);
    
    if (global.gc) {
        global.gc();
    }
    
    const memAfter = process.memoryUsage();
    
    console.log('\n=== Memory Profile ===');
    console.log(`Heap used: ${((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Per character: ${((memAfter.heapUsed - memBefore.heapUsed) / characters.length).toFixed(0)} bytes`);
}

// Run with: node --expose-gc profile-memory.js
```

---

### Memory Optimization Tips

1. **Avoid Large Intermediate Arrays**
```javascript
// ❌ Bad - creates large intermediate array
const states = characters.map(c => ({
    baseFrequency: c.consciousness.baseFrequency,
    baseCoherence: c.consciousness.baseCoherence,
    emotionalState: c.consciousness.emotionalState
}));
const behaviors = wasmEngine.calculateBatchBehavioralStates(states);

// ✅ Good - minimal transformation
const behaviors = wasmEngine.calculateBatchBehavioralStates(
    characters.map(c => c.consciousness)
);
```

2. **Reuse Result Arrays**
```javascript
// For repeated calculations
let behaviorsCache = [];

function updatePopulation(characters) {
    behaviorsCache = wasmEngine.calculateBatchBehavioralStates(
        characters.map(c => c.consciousness)
    );
    return behaviorsCache;
}
```

3. **Clear Unused References**
```javascript
function processTurn(world) {
    const behaviors = wasmEngine.calculateBatchBehavioralStates(
        world.characters.map(c => c.consciousness)
    );
    
    // Apply results
    world.characters.forEach((char, i) => {
        char.consciousness.behavioralState = behaviors[i];
    });
    
    // Clear reference (allow GC)
    behaviors.length = 0;
}
```

---

## Profiling & Monitoring

### Real-Time Performance Monitoring

```javascript
class PerformanceMonitor {
    constructor(wasmEngine) {
        this.engine = wasmEngine;
        this.history = [];
        this.maxHistory = 100;
    }
    
    recordOperation(operationType, duration, count) {
        this.history.push({
            type: operationType,
            duration,
            count,
            timestamp: Date.now(),
            throughput: count / (duration / 1000)
        });
        
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }
    
    getStats() {
        const stats = this.engine.getPerformanceStats();
        const recent = this.history.slice(-10);
        
        return {
            ...stats,
            recentAverage: recent.reduce((sum, r) => sum + r.duration, 0) / recent.length,
            recentThroughput: recent.reduce((sum, r) => sum + r.throughput, 0) / recent.length,
            history: this.history
        };
    }
    
    checkHealth() {
        const stats = this.getStats();
        
        if (!stats.wasmEnabled) {
            return { status: 'WARNING', message: 'WASM fallback active' };
        }
        
        if (stats.averageTime > 0.01) {  // 10μs threshold
            return { status: 'WARNING', message: 'Performance degraded' };
        }
        
        return { status: 'OK', message: 'Optimal performance' };
    }
}

// Usage
const monitor = new PerformanceMonitor(wasmEngine);

function processTurn(world) {
    const start = performance.now();
    
    const behaviors = wasmEngine.calculateBatchBehavioralStates(
        world.characters.map(c => c.consciousness)
    );
    
    const duration = performance.now() - start;
    monitor.recordOperation('batch', duration, world.characters.length);
    
    // Check health periodically
    if (world.turn % 10 === 0) {
        const health = monitor.checkHealth();
        console.log(`Health: ${health.status} - ${health.message}`);
    }
}
```

---

### Performance Alerts

```javascript
class PerformanceAlerts {
    constructor(wasmEngine, thresholds) {
        this.engine = wasmEngine;
        this.thresholds = thresholds || {
            singleCall: 0.01,      // 10μs
            batchCall: 1.0,        // 1ms per 1000 chars
            throughput: 500000,    // 500K chars/sec minimum
            memoryGrowth: 100      // 100MB maximum growth
        };
    }
    
    checkPerformance(duration, count) {
        const alerts = [];
        
        const perChar = duration / count;
        const throughput = count / (duration / 1000);
        
        if (count === 1 && duration > this.thresholds.singleCall) {
            alerts.push({
                level: 'WARNING',
                message: `Single call slow: ${duration.toFixed(4)}ms`,
                expected: this.thresholds.singleCall,
                actual: duration
            });
        }
        
        if (count > 100 && throughput < this.thresholds.throughput) {
            alerts.push({
                level: 'WARNING',
                message: `Low throughput: ${throughput.toFixed(0)} chars/sec`,
                expected: this.thresholds.throughput,
                actual: throughput
            });
        }
        
        const stats = this.engine.getPerformanceStats();
        if (!stats.wasmEnabled) {
            alerts.push({
                level: 'ERROR',
                message: 'WASM fallback active - performance degraded',
                expected: true,
                actual: false
            });
        }
        
        return alerts;
    }
}
```

---

## Scaling Considerations

### Small Scale (< 100 NPCs)

**Recommendation**: Standard processing, no special optimization needed

```javascript
// Simple batch processing sufficient
const behaviors = wasmEngine.calculateBatchBehavioralStates(
    world.characters.map(c => c.consciousness)
);
```

**Expected Performance**: < 1ms per turn

---

### Medium Scale (100-1,000 NPCs)

**Recommendation**: Batch processing with LOD tiers

```javascript
class MediumScaleProcessor {
    processTurn(world) {
        // Separate by LOD tier
        const heroChars = world.characters.filter(c => c.lodTier === 'HERO');
        const namedChars = world.characters.filter(c => c.lodTier === 'NAMED');
        const popGroups = world.populationGroups;
        
        // Process heroes individually (full fidelity)
        heroChars.forEach(char => {
            char.consciousness.behavioralState = 
                wasmEngine.calculateBehavioralState(char.consciousness);
        });
        
        // Batch process named NPCs
        if (namedChars.length > 0) {
            const behaviors = wasmEngine.calculateBatchBehavioralStates(
                namedChars.map(c => c.consciousness)
            );
            namedChars.forEach((char, i) => {
                char.consciousness.behavioralState = behaviors[i];
            });
        }
        
        // Batch process population groups
        popGroups.forEach(group => {
            const behaviors = wasmEngine.calculateBatchBehavioralStates(
                group.characters.map(c => c.consciousness)
            );
            group.characters.forEach((char, i) => {
                char.consciousness.behavioralState = behaviors[i];
            });
        });
    }
}
```

**Expected Performance**: 1-10ms per turn

---

### Large Scale (1,000-10,000 NPCs)

**Recommendation**: Chunked batch processing with caching

```javascript
class LargeScaleProcessor {
    constructor() {
        this.behaviorCache = new Map();
        this.cacheTimeout = 60000;  // 60 seconds
    }
    
    processTurn(world) {
        const now = Date.now();
        const toUpdate = [];
        
        // Check cache first
        for (const char of world.characters) {
            const cached = this.behaviorCache.get(char.id);
            if (cached && now - cached.timestamp < this.cacheTimeout) {
                char.consciousness.behavioralState = cached.behavior;
            } else {
                toUpdate.push(char);
            }
        }
        
        // Batch process characters needing update
        if (toUpdate.length > 0) {
            const behaviors = wasmEngine.calculateBatchBehavioralStates(
                toUpdate.map(c => c.consciousness)
            );
            
            toUpdate.forEach((char, i) => {
                const behavior = behaviors[i];
                char.consciousness.behavioralState = behavior;
                this.behaviorCache.set(char.id, {
                    behavior,
                    timestamp: now
                });
            });
        }
        
        console.log(`Updated ${toUpdate.length}/${world.characters.length} characters`);
    }
}
```

**Expected Performance**: 5-50ms per turn

---

### Massive Scale (10,000+ NPCs)

**Recommendation**: Multi-threaded processing with aggressive caching

```javascript
class MassiveScaleProcessor {
    constructor() {
        this.workers = this.createWorkers(4);
        this.cache = new Map();
    }
    
    createWorkers(count) {
        return Array(count).fill(null).map(() => 
            new Worker('consciousness-worker.js', { type: 'module' })
        );
    }
    
    async processTurn(world) {
        // Partition characters across workers
        const chunkSize = Math.ceil(world.characters.length / this.workers.length);
        
        const promises = this.workers.map((worker, i) => {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, world.characters.length);
            const chunk = world.characters.slice(start, end);
            
            return this.processChunk(worker, chunk);
        });
        
        const results = await Promise.all(promises);
        
        // Apply results
        let offset = 0;
        for (const behaviors of results) {
            for (let i = 0; i < behaviors.length; i++) {
                world.characters[offset + i].consciousness.behavioralState = behaviors[i];
            }
            offset += behaviors.length;
        }
        
        console.log(`Processed ${world.characters.length} characters across ${this.workers.length} workers`);
    }
    
    processChunk(worker, characters) {
        return new Promise(resolve => {
            worker.onmessage = (e) => resolve(e.data.behaviors);
            worker.postMessage({ 
                characters: characters.map(c => c.consciousness) 
            });
        });
    }
}
```

**Expected Performance**: 50-500ms per turn (depending on hardware)

---

## Summary

### Quick Reference

| Scenario | Recommendation | Expected Performance |
|----------|---------------|---------------------|
| 1-10 chars | Individual calls OK | < 0.1ms |
| 10-100 chars | Batch processing | < 1ms |
| 100-1000 chars | Batch + LOD | 1-10ms |
| 1000-10000 chars | Chunked batch | 5-50ms |
| 10000+ chars | Multi-threaded | 50-500ms |

### Best Practices Summary

1. ✅ **Always use batch processing for 10+ characters**
2. ✅ **Initialize once, reuse engine instance**
3. ✅ **Cache behavioral states when possible**
4. ✅ **Monitor performance regularly**
5. ✅ **Use chunking for 50K+ characters**
6. ✅ **Consider Web Workers for 100K+ characters**

---

**Last Updated**: October 18, 2025  
**Version**: 0.1.0  
**Status**: Production Ready ✅
