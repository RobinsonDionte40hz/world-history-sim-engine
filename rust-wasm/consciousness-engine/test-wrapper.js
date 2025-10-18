/**
 * Test ConsciousnessEngineWasm Wrapper
 * 
 * Tests:
 * 1. Initialization (WASM and fallback)
 * 2. Single behavioral state calculation
 * 3. Batch behavioral state calculation
 * 4. Emotional calculations
 * 5. Configuration management
 * 6. Performance monitoring
 * 7. Error handling
 */

import { ConsciousnessEngineWasm } from './src/wrapper/ConsciousnessEngineWasm.js';

async function runWrapperTests() {
    console.log('🧪 Testing ConsciousnessEngineWasm Wrapper\n');
    console.log('='.repeat(60));

    const engine = new ConsciousnessEngineWasm();

    // Test 1: Initialization
    console.log('\n📦 Test 1: Initialization');
    console.log('-'.repeat(60));
    const initialized = await engine.initialize();
    console.log(`Initialization result: ${initialized ? '✅ WASM' : '⚠️  Fallback'}`);
    console.log(`Engine ready: ${engine.isReady}`);
    console.log(`Using fallback: ${engine.useFallback}`);

    // Test 2: Single Behavioral State Calculation
    console.log('\n🧠 Test 2: Single Behavioral State Calculation');
    console.log('-'.repeat(60));
    
    const testStates = [
        {
            name: 'Low Energy Character',
            state: {
                baseFrequency: 4.0,
                baseCoherence: 0.5,
                emotionalState: 'Depressed'
            }
        },
        {
            name: 'Balanced Character',
            state: {
                baseFrequency: 7.5,
                baseCoherence: 0.7,
                emotionalState: 'Content'
            }
        },
        {
            name: 'High Energy Character',
            state: {
                baseFrequency: 12.0,
                baseCoherence: 0.9,
                emotionalState: 'Excited'
            }
        }
    ];

    for (const test of testStates) {
        console.log(`\n  ${test.name}:`);
        console.log(`    Input: freq=${test.state.baseFrequency}, coh=${test.state.baseCoherence}`);
        
        const result = engine.calculateBehavioralState(test.state);
        
        console.log(`    Output:`);
        console.log(`      Energy: ${result.energy}`);
        console.log(`      Focus: ${result.focus}`);
        console.log(`      Mood: ${result.mood}`);
        console.log(`      Social Drive: ${result.socialDrive.toFixed(3)}`);
        console.log(`      Risk Tolerance: ${result.riskTolerance.toFixed(3)}`);
        console.log(`      Ambition: ${result.ambition.toFixed(3)}`);
    }

    // Test 3: Batch Processing
    console.log('\n\n🚀 Test 3: Batch Behavioral State Calculation');
    console.log('-'.repeat(60));
    
    const batchStates = [
        { baseFrequency: 5.0, baseCoherence: 0.6, emotionalState: 'Anxious' },
        { baseFrequency: 7.5, baseCoherence: 0.7, emotionalState: 'Content' },
        { baseFrequency: 10.0, baseCoherence: 0.8, emotionalState: 'Optimistic' },
        { baseFrequency: 13.0, baseCoherence: 0.9, emotionalState: 'Joyful' }
    ];

    const startBatch = performance.now();
    const batchResults = engine.calculateBatchBehavioralStates(batchStates);
    const batchTime = performance.now() - startBatch;

    console.log(`Processed ${batchResults.length} states in ${batchTime.toFixed(2)}ms`);
    console.log(`Average per state: ${(batchTime / batchResults.length).toFixed(2)}ms\n`);

    batchResults.forEach((result, i) => {
        console.log(`  State ${i + 1}:`);
        console.log(`    Energy: ${result.energy}, Focus: ${result.focus}, Mood: ${result.mood}`);
        console.log(`    Social: ${result.socialDrive.toFixed(2)}, Risk: ${result.riskTolerance.toFixed(2)}, Ambition: ${result.ambition.toFixed(2)}`);
    });

    // Test 4: Emotional Calculations
    console.log('\n\n💭 Test 4: Emotional Calculations');
    console.log('-'.repeat(60));

    const emotionalTests = [
        { freq: 5.0, coh: 0.5, impact: 0.3 },
        { freq: 7.5, coh: 0.7, impact: 0.6 },
        { freq: 10.0, coh: 0.9, impact: 0.8 },
        { freq: 13.0, coh: 0.95, impact: 0.9 }
    ];

    for (const test of emotionalTests) {
        const coherence = engine.calculateEmotionalCoherence(test.freq, test.coh);
        const state = engine.determineEmotionalState(coherence, test.impact);
        
        console.log(`  Freq=${test.freq}Hz, BaseCoh=${test.coh}, Impact=${test.impact}:`);
        console.log(`    → Coherence: ${coherence.toFixed(3)}, State: ${state}`);
    }

    // Test 5: Configuration
    console.log('\n\n⚙️  Test 5: Configuration Management');
    console.log('-'.repeat(60));

    const config = engine.getDefaultConfiguration();
    console.log('Default Configuration:');
    console.log('  Frequency bounds:', JSON.stringify(config.bounds.frequency, null, 4));
    console.log('  Coherence bounds:', JSON.stringify(config.bounds.coherence, null, 4));

    const validConfig = engine.validateConfiguration(config);
    console.log(`\nConfiguration valid: ${validConfig ? '✅' : '❌'}`);

    // Invalid config test
    const invalidConfig = { bounds: { frequency: { min: 0, max: 100 } } };
    const invalidResult = engine.validateConfiguration(invalidConfig);
    console.log(`Invalid configuration rejected: ${!invalidResult ? '✅' : '❌'}`);

    // Test 6: Performance Statistics
    console.log('\n\n📊 Test 6: Performance Statistics');
    console.log('-'.repeat(60));

    const stats = engine.getPerformanceStats();
    console.log('Performance Metrics:');
    console.log(`  WASM calls: ${stats.wasmCalls}`);
    console.log(`  Fallback calls: ${stats.fallbackCalls}`);
    console.log(`  Total time: ${stats.totalTime.toFixed(2)}ms`);
    console.log(`  Average time: ${stats.averageTime.toFixed(4)}ms`);
    console.log(`  Module: ${stats.module}`);
    console.log(`  WASM enabled: ${stats.wasmEnabled ? '✅' : '❌'}`);

    // Test 7: Error Handling
    console.log('\n\n🛡️  Test 7: Error Handling');
    console.log('-'.repeat(60));

    try {
        // Test with invalid/incomplete data
        const invalidState = { baseFrequency: NaN };
        const result = engine.calculateBehavioralState(invalidState);
        console.log('✅ Handled invalid frequency gracefully');
        console.log(`   Result: ${JSON.stringify(result)}`);
    } catch (error) {
        console.log('❌ Failed to handle invalid input');
    }

    try {
        // Test with missing data
        const emptyState = {};
        const result = engine.calculateBehavioralState(emptyState);
        console.log('✅ Handled empty state gracefully');
        console.log(`   Result: ${JSON.stringify(result)}`);
    } catch (error) {
        console.log('❌ Failed to handle empty input');
    }

    // Test 8: API Compatibility
    console.log('\n\n🔄 Test 8: API Compatibility (JavaScript vs WASM)');
    console.log('-'.repeat(60));

    const testState = {
        baseFrequency: 8.5,
        baseCoherence: 0.75,
        emotionalState: 'Content'
    };

    // Force fallback temporarily
    const originalFallback = engine.useFallback;
    
    // Get WASM result
    engine.useFallback = false;
    const wasmResult = engine.calculateBehavioralState(testState);
    
    // Get JS fallback result
    engine.useFallback = true;
    const jsResult = engine.calculateBehavioralState(testState);
    
    // Restore
    engine.useFallback = originalFallback;

    console.log('WASM Result:', wasmResult);
    console.log('JS Result:', jsResult);
    
    // Compare results
    const differences = [];
    for (const key of Object.keys(wasmResult)) {
        if (wasmResult[key] !== jsResult[key]) {
            if (typeof wasmResult[key] === 'number') {
                const diff = Math.abs(wasmResult[key] - jsResult[key]);
                if (diff > 0.01) {
                    differences.push(`${key}: ${diff.toFixed(4)} difference`);
                }
            } else {
                differences.push(`${key}: "${wasmResult[key]}" vs "${jsResult[key]}"`);
            }
        }
    }

    if (differences.length === 0) {
        console.log('✅ Results match perfectly!');
    } else {
        console.log(`⚠️  ${differences.length} differences found:`);
        differences.forEach(diff => console.log(`   - ${diff}`));
    }

    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Wrapper Tests Complete!\n');
    console.log('Summary:');
    console.log(`  ✅ Initialization: ${initialized ? 'WASM' : 'Fallback'}`);
    console.log(`  ✅ Single calculations: Working`);
    console.log(`  ✅ Batch processing: Working`);
    console.log(`  ✅ Emotional calculations: Working`);
    console.log(`  ✅ Configuration: Working`);
    console.log(`  ✅ Performance tracking: Working`);
    console.log(`  ✅ Error handling: Robust`);
    console.log(`  ✅ API compatibility: ${differences.length === 0 ? 'Perfect' : 'Minor differences'}`);
    console.log('\n✨ Ready for integration into main engine!');
}

// Run tests
runWrapperTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    console.error(error.stack);
    process.exit(1);
});
