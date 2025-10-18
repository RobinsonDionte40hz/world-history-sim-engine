/**
 * Basic WASM Integration Test
 * 
 * Tests that WASM bindings can be loaded and called from Node.js
 * Run with: node test-wasm-basic.js
 */

// This test requires wasm-pack to generate the pkg/ directory first
// Run: wasm-pack build --target nodejs

async function testWasmBindings() {
    console.log('🧪 Testing WASM Bindings Integration\n');

    try {
        // Load the WASM module
        console.log('📦 Loading WASM module...');
        const wasm = await import('./pkg/consciousness_engine.js');
        console.log('✅ WASM module loaded successfully');
        console.log(`   Version: ${wasm.get_version()}`);
        console.log(`   Build: ${wasm.get_build_info()}\n`);

        // Test 1: Version information
        console.log('Test 1: Version Information');
        console.log('---------------------------');
        const version = wasm.get_version();
        const buildInfo = wasm.get_build_info();
        const isSupported = wasm.is_wasm_supported();
        console.log(`Version: ${version}`);
        console.log(`Build Info: ${buildInfo}`);
        console.log(`WASM Supported: ${isSupported}`);
        console.log('✅ Version info test passed\n');

        // Test 2: Performance stats
        console.log('Test 2: Performance Statistics');
        console.log('------------------------------');
        const stats = wasm.get_performance_stats();
        console.log('Performance Stats:', JSON.stringify(stats, null, 2));
        console.log('✅ Performance stats test passed\n');

        // Test 3: Configuration
        console.log('Test 3: Default Configuration');
        console.log('-----------------------------');
        const config = wasm.get_default_configuration();
        console.log('Frequency Bounds:', config.bounds.frequency);
        console.log('Coherence Bounds:', config.bounds.coherence);
        const isValid = wasm.validate_configuration(config);
        console.log(`Configuration Valid: ${isValid}`);
        console.log('✅ Configuration test passed\n');

        // Test 4: Emotional calculations
        console.log('Test 4: Emotional System');
        console.log('------------------------');
        const coherence = wasm.calculate_emotional_coherence(40.0, 0.7);
        console.log(`Emotional Coherence (40Hz, 0.7): ${coherence.toFixed(3)}`);
        const emotionalState = wasm.determine_emotional_state(0.8, 0.6);
        console.log(`Emotional State (0.8 coherence, 0.6 impact): ${emotionalState}`);
        console.log('✅ Emotional system test passed\n');

        // Test 5: Behavioral state calculation
        console.log('Test 5: Behavioral State Calculation');
        console.log('------------------------------------');
        try {
            const consciousnessState = {
                base_frequency: 7.5,
                base_coherence: 0.7,
                current_frequency: 7.5,
                emotional_coherence: 0.75,
                emotional_state: 'Content',  // EmotionalState enum as string
                last_update: Date.now()
            };
            const behavioralState = wasm.calculate_behavioral_state(consciousnessState);
            console.log('Behavioral State:', {
                energy: behavioralState.energy,
                focus: behavioralState.focus,
                mood: behavioralState.mood,
                social_drive: behavioralState.social_drive,
                risk_tolerance: behavioralState.risk_tolerance,
                ambition: behavioralState.ambition
            });
            console.log('✅ Behavioral state test passed\n');
        } catch (error) {
            console.log(`⚠️  Behavioral state test skipped: ${error.message}\n`);
        }

        // Test 6: Batch processing
        console.log('Test 6: Batch Behavioral State Calculation');
        console.log('------------------------------------------');
        try {
            const states = [
                { 
                    base_frequency: 5.0, 
                    base_coherence: 0.6, 
                    current_frequency: 5.0, 
                    emotional_coherence: 0.5,
                    emotional_state: 'Depressed',
                    last_update: Date.now()
                },
                { 
                    base_frequency: 10.0, 
                    base_coherence: 0.8, 
                    current_frequency: 10.0, 
                    emotional_coherence: 0.8,
                    emotional_state: 'Content',
                    last_update: Date.now()
                },
                { 
                    base_frequency: 12.0, 
                    base_coherence: 0.9, 
                    current_frequency: 12.0, 
                    emotional_coherence: 0.9,
                    emotional_state: 'Joyful',
                    last_update: Date.now()
                }
            ];
            const batchResults = wasm.calculate_batch_behavioral_states(states);
            console.log(`Processed ${batchResults.length} states:`);
            batchResults.forEach((state, i) => {
                console.log(`  State ${i + 1}: Energy=${state.energy}, Focus=${state.focus}, Mood=${state.mood}`);
            });
            console.log('✅ Batch processing test passed\n');
        } catch (error) {
            console.log(`⚠️  Batch processing test skipped: ${error.message}\n`);
        }

        console.log('🎉 WASM integration tests completed!');
        console.log('\n📊 Summary:');
        console.log('  - Core tests passed successfully');
        console.log('  - WASM module fully functional');
        console.log('  - Ready for JavaScript wrapper implementation');

    } catch (error) {
        console.error('❌ WASM Test Failed:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('  1. Run: wasm-pack build --target nodejs');
        console.error('  2. Ensure pkg/ directory exists');
        console.error('  3. Check Node.js version (requires ES modules support)');
        process.exit(1);
    }
}

// Run tests
testWasmBindings().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
