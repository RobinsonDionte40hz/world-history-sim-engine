// Batch Processing Example - Consciousness Engine WASM

import { ConsciousnessEngineWasm } from '../src/wrapper/ConsciousnessEngineWasm.js';

async function main() {
    console.log('=== Batch Processing Example ===\n');
    
    // Initialize engine
    const engine = new ConsciousnessEngineWasm();
    await engine.initialize();
    
    // Create population of 100 characters
    console.log('1. Creating population of 100 characters...');
    const population = Array(100).fill(null).map((_, i) => ({
        id: `citizen_${i}`,
        name: `Citizen ${i}`,
        consciousness: {
            baseFrequency: 5 + Math.random() * 5,
            baseCoherence: 0.5 + Math.random() * 0.3,
            emotionalState: 'Content'
        }
    }));
    
    console.log(`   ✅ ${population.length} characters created\n`);
    
    // Method 1: Individual processing (slow)
    console.log('2. Processing individually (not recommended)...');
    const individualStart = performance.now();
    population.forEach(char => {
        char.consciousness.behavioralState = 
            engine.calculateBehavioralState(char.consciousness);
    });
    const individualDuration = performance.now() - individualStart;
    console.log(`   Time: ${individualDuration.toFixed(4)}ms\n`);
    
    // Method 2: Batch processing (fast)
    console.log('3. Processing with batch (recommended)...');
    const batchStart = performance.now();
    const behaviors = engine.calculateBatchBehavioralStates(
        population.map(c => c.consciousness)
    );
    population.forEach((char, i) => {
        char.consciousness.behavioralState = behaviors[i];
    });
    const batchDuration = performance.now() - batchStart;
    console.log(`   Time: ${batchDuration.toFixed(4)}ms\n`);
    
    // Compare performance
    const speedup = (individualDuration / batchDuration).toFixed(1);
    console.log('4. Performance comparison:');
    console.log(`   Individual: ${individualDuration.toFixed(4)}ms`);
    console.log(`   Batch: ${batchDuration.toFixed(4)}ms`);
    console.log(`   ✅ Batch is ${speedup}x faster!\n`);
    
    // Calculate throughput
    const throughput = (population.length / (batchDuration / 1000)).toFixed(0);
    console.log(`5. Throughput: ${throughput} characters/second\n`);
    
    console.log('✅ Batch processing example complete!');
}

main();
