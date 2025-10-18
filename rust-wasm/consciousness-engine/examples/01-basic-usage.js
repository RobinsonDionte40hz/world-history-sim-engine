// Basic Usage Example - Consciousness Engine WASM

import { ConsciousnessEngineWasm } from '../src/wrapper/ConsciousnessEngineWasm.js';

async function main() {
    console.log('=== Basic Usage Example ===\n');
    
    // Step 1: Create engine instance
    const engine = new ConsciousnessEngineWasm();
    
    // Step 2: Initialize
    console.log('1. Initializing engine...');
    const ready = await engine.initialize();
    console.log(ready ? '   ✅ WASM initialized' : '   ⚠️  Using JavaScript fallback');
    
    // Step 3: Calculate behavioral state for a single character
    console.log('\n2. Calculate single character behavioral state...');
    const character = {
        name: 'Aldric',
        consciousness: {
            baseFrequency: 8.5,
            baseCoherence: 0.8,
            emotionalState: 'Content'
        }
    };
    
    const behavioral = engine.calculateBehavioralState(character.consciousness);
    
    console.log(`\n   Character: ${character.name}`);
    console.log(`   - Energy: ${behavioral.energy}`);
    console.log(`   - Focus: ${behavioral.focus}`);
    console.log(`   - Mood: ${behavioral.mood}`);
    console.log(`   - Social Drive: ${behavioral.socialDrive.toFixed(2)}`);
    console.log(`   - Risk Tolerance: ${behavioral.riskTolerance.toFixed(2)}`);
    console.log(`   - Ambition: ${behavioral.ambition.toFixed(2)}`);
    
    // Step 4: Get performance stats
    console.log('\n3. Performance statistics...');
    const stats = engine.getPerformanceStats();
    console.log(`   Module: ${stats.module}`);
    console.log(`   WASM Calls: ${stats.wasmCalls}`);
    console.log(`   Fallback Calls: ${stats.fallbackCalls}`);
    console.log(`   Average Time: ${stats.averageTime.toFixed(4)}ms`);
    
    console.log('\n✅ Basic usage complete!');
}

main();
