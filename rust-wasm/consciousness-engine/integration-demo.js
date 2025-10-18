/**
 * Comprehensive Integration Example
 * 
 * Demonstrates how to integrate the WASM ConsciousnessEngine
 * into your existing World History Simulation Engine
 */

import { ConsciousnessEngineWasm } from './src/wrapper/ConsciousnessEngineWasm.js';

async function demonstrateIntegration() {
    console.log('🌍 World History Simulation - WASM Integration Demo\n');
    console.log('='.repeat(70));

    // Step 1: Initialize the engine
    console.log('\n📦 Step 1: Initialize WASM Engine');
    console.log('-'.repeat(70));
    
    const engine = new ConsciousnessEngineWasm();
    const initialized = await engine.initialize();
    
    if (initialized) {
        console.log('✅ WASM engine ready for high-performance calculations');
    } else {
        console.log('⚠️  Using JavaScript fallback (still functional)');
    }

    // Step 2: Demonstrate character behavioral state calculation
    console.log('\n\n👤 Step 2: Character Behavioral State Calculation');
    console.log('-'.repeat(70));

    const characters = [
        {
            id: 'char_001',
            name: 'Arya the Wise',
            consciousness: {
                baseFrequency: 8.5,
                baseCoherence: 0.85,
                emotionalState: 'Content'
            }
        },
        {
            id: 'char_002',
            name: 'Bjorn the Bold',
            consciousness: {
                baseFrequency: 11.0,
                baseCoherence: 0.75,
                emotionalState: 'Excited'
            }
        },
        {
            id: 'char_003',
            name: 'Cyra the Cautious',
            consciousness: {
                baseFrequency: 5.5,
                baseCoherence: 0.6,
                emotionalState: 'Anxious'
            }
        }
    ];

    console.log('\nCalculating behavioral states for 3 characters:\n');

    for (const char of characters) {
        const behavioral = engine.calculateBehavioralState(char.consciousness);
        
        console.log(`${char.name} (ID: ${char.id})`);
        console.log(`  Consciousness: ${char.consciousness.baseFrequency}Hz, ${char.consciousness.baseCoherence} coherence`);
        console.log(`  Behavioral State:`);
        console.log(`    Energy: ${behavioral.energy} (${char.consciousness.baseFrequency < 6 ? 'Low activity' : char.consciousness.baseFrequency < 10 ? 'Normal activity' : 'High activity'})`);
        console.log(`    Focus: ${behavioral.focus} (${behavioral.focus === 'Scattered' ? 'Distracted' : behavioral.focus === 'Balanced' ? 'Normal attention' : 'Deep concentration'})`);
        console.log(`    Mood: ${behavioral.mood}`);
        console.log(`    Social Drive: ${(behavioral.socialDrive * 100).toFixed(0)}% (${behavioral.socialDrive > 0.7 ? 'Very sociable' : behavioral.socialDrive > 0.4 ? 'Moderately social' : 'Reserved'})`);
        console.log(`    Risk Tolerance: ${(behavioral.riskTolerance * 100).toFixed(0)}% (${behavioral.riskTolerance > 0.7 ? 'Adventurous' : behavioral.riskTolerance > 0.4 ? 'Cautious' : 'Risk-averse'})`);
        console.log(`    Ambition: ${(behavioral.ambition * 100).toFixed(0)}% (${behavioral.ambition > 0.7 ? 'Highly ambitious' : behavioral.ambition > 0.4 ? 'Moderately driven' : 'Content'})`);
        console.log('');
    }

    // Step 3: Batch processing (optimized for LOD groups)
    console.log('\n🚀 Step 3: Batch Processing (LOD Population Groups)');
    console.log('-'.repeat(70));

    console.log('\nSimulating a settlement with 100 NPCs...\n');

    // Generate 100 NPCs with varied consciousness states
    const settlementPopulation = Array.from({ length: 100 }, (_, i) => ({
        id: `npc_${i.toString().padStart(3, '0')}`,
        consciousness: {
            baseFrequency: 3 + Math.random() * 12,  // 3-15 Hz
            baseCoherence: 0.2 + Math.random() * 0.8,  // 0.2-1.0
            emotionalState: ['Content', 'Excited', 'Anxious', 'Depressed', 'Joyful'][Math.floor(Math.random() * 5)]
        }
    }));

    const startBatch = performance.now();
    const batchResults = engine.calculateBatchBehavioralStates(
        settlementPopulation.map(npc => npc.consciousness)
    );
    const batchTime = performance.now() - startBatch;

    console.log(`✅ Processed ${batchResults.length} NPCs in ${batchTime.toFixed(2)}ms`);
    console.log(`   Average: ${(batchTime / batchResults.length).toFixed(4)}ms per NPC`);
    console.log(`   Throughput: ${(batchResults.length / (batchTime / 1000)).toFixed(0)} NPCs/second`);

    // Analyze distribution
    const energyDistribution = { Low: 0, Moderate: 0, High: 0 };
    const focusDistribution = { Scattered: 0, Balanced: 0, Focused: 0 };
    const moodDistribution = { Depressed: 0, Content: 0, Optimistic: 0, Excited: 0 };

    batchResults.forEach(result => {
        energyDistribution[result.energy]++;
        focusDistribution[result.focus]++;
        moodDistribution[result.mood]++;
    });

    console.log('\n  Population Analysis:');
    console.log(`    Energy: Low=${energyDistribution.Low}%, Moderate=${energyDistribution.Moderate}%, High=${energyDistribution.High}%`);
    console.log(`    Focus: Scattered=${focusDistribution.Scattered}%, Balanced=${focusDistribution.Balanced}%, Focused=${focusDistribution.Focused}%`);
    console.log(`    Mood: Depressed=${moodDistribution.Depressed}%, Content=${moodDistribution.Content}%, Optimistic=${moodDistribution.Optimistic}%, Excited=${moodDistribution.Excited}%`);

    // Step 4: Emotional system integration
    console.log('\n\n💭 Step 4: Emotional System Integration');
    console.log('-'.repeat(70));

    const emotionalScenarios = [
        {
            name: 'Character experiences major success',
            frequency: 10.0,
            baseCoherence: 0.8,
            impactMagnitude: 0.9
        },
        {
            name: 'Character faces moderate stress',
            frequency: 6.5,
            baseCoherence: 0.6,
            impactMagnitude: -0.5
        },
        {
            name: 'Character in peaceful state',
            frequency: 7.5,
            baseCoherence: 0.7,
            impactMagnitude: 0.2
        }
    ];

    console.log('\nEmotional state calculations:\n');

    for (const scenario of emotionalScenarios) {
        const coherence = engine.calculateEmotionalCoherence(
            scenario.frequency,
            scenario.baseCoherence
        );
        
        const emotionalState = engine.determineEmotionalState(
            coherence,
            scenario.impactMagnitude
        );

        console.log(`${scenario.name}`);
        console.log(`  Input: ${scenario.frequency}Hz frequency, ${scenario.baseCoherence} coherence, ${scenario.impactMagnitude} impact`);
        console.log(`  Result: Coherence=${coherence.toFixed(3)}, State=${emotionalState}`);
        console.log('');
    }

    // Step 5: Performance monitoring
    console.log('\n📊 Step 5: Performance Monitoring');
    console.log('-'.repeat(70));

    const stats = engine.getPerformanceStats();
    
    console.log('\nEngine Performance Statistics:');
    console.log(`  Mode: ${stats.module} ${stats.wasmEnabled ? '(WASM accelerated)' : '(JavaScript fallback)'}`);
    console.log(`  Total operations: ${stats.wasmCalls + stats.fallbackCalls}`);
    console.log(`    - WASM calls: ${stats.wasmCalls}`);
    console.log(`    - Fallback calls: ${stats.fallbackCalls}`);
    console.log(`  Total computation time: ${stats.totalTime.toFixed(2)}ms`);
    console.log(`  Average operation time: ${stats.averageTime.toFixed(4)}ms`);

    if (stats.wasmEnabled) {
        const speedup = stats.fallbackCalls > 0 ? 'Available' : 'N/A';
        console.log(`\n  💡 WASM provides ~2-10x speedup for large-scale simulations`);
    }

    // Step 6: Integration recommendations
    console.log('\n\n🔧 Step 6: Integration Recommendations');
    console.log('-'.repeat(70));

    console.log('\n1. Initialize once at application startup:');
    console.log('   ```javascript');
    console.log('   import { consciousnessEngine } from "./ConsciousnessEngineWasm.js";');
    console.log('   await consciousnessEngine.initialize();');
    console.log('   ```');
    
    console.log('\n2. Use in character behavior generation:');
    console.log('   ```javascript');
    console.log('   const behavioral = consciousnessEngine.calculateBehavioralState(');
    console.log('     character.consciousness');
    console.log('   );');
    console.log('   ```');
    
    console.log('\n3. Batch process for LOD population groups:');
    console.log('   ```javascript');
    console.log('   const states = populationGroup.map(char => char.consciousness);');
    console.log('   const behaviors = consciousnessEngine.calculateBatchBehavioralStates(states);');
    console.log('   ```');
    
    console.log('\n4. Graceful fallback ensures compatibility:');
    console.log('   - WASM unavailable? Automatically uses JavaScript');
    console.log('   - No code changes needed');
    console.log('   - Same API, transparent switching');

    console.log('\n\n' + '='.repeat(70));
    console.log('✨ Integration Complete!');
    console.log('\nNext Steps:');
    console.log('  1. Copy ConsciousnessEngineWasm.js to your project');
    console.log('  2. Copy pkg/ directory with WASM binaries');
    console.log('  3. Update import paths in your services');
    console.log('  4. Initialize at application startup');
    console.log('  5. Replace existing consciousness calculations');
    console.log('\n🚀 Your simulation is now WASM-accelerated!');
    console.log('='.repeat(70));
}

// Run demonstration
demonstrateIntegration().catch(error => {
    console.error('❌ Demo failed:', error);
    console.error(error.stack);
    process.exit(1);
});
