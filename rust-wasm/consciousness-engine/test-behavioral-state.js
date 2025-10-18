/**
 * Test Behavioral State Functions in Detail
 */

async function testBehavioralState() {
    console.log('🔍 Testing Behavioral State Functions\n');

    try {
        const wasm = await import('./pkg/consciousness_engine.js');
        console.log('✅ WASM module loaded\n');

        // Test 1: Simple behavioral state calculation
        console.log('Test 1: Direct Behavioral State Calculation');
        console.log('-------------------------------------------');
        try {
            const state = {
                current_frequency: 7.5,
                emotional_coherence: 0.75,
                base_frequency: 7.5,
                resonance_factor: 1.0
            };
            console.log('Input state:', JSON.stringify(state, null, 2));
            
            const result = wasm.calculate_behavioral_state(state);
            console.log('Result:', JSON.stringify(result, null, 2));
            console.log('✅ Test 1 passed\n');
        } catch (error) {
            console.error('❌ Test 1 failed:', error.message);
            console.error('Stack:', error.stack);
            console.log('');
        }

        // Test 2: Try with minimal state
        console.log('Test 2: Minimal State');
        console.log('---------------------');
        try {
            const minState = {
                current_frequency: 10.0,
                emotional_coherence: 0.8
            };
            console.log('Input state:', JSON.stringify(minState, null, 2));
            
            const result = wasm.calculate_behavioral_state(minState);
            console.log('Result:', JSON.stringify(result, null, 2));
            console.log('✅ Test 2 passed\n');
        } catch (error) {
            console.error('❌ Test 2 failed:', error.message);
            console.error('Stack:', error.stack);
            console.log('');
        }

        // Test 3: Check what the function signature expects
        console.log('Test 3: Function Inspection');
        console.log('---------------------------');
        console.log('Function name:', wasm.calculate_behavioral_state.name);
        console.log('Function length:', wasm.calculate_behavioral_state.length);
        console.log('Function toString:', wasm.calculate_behavioral_state.toString());
        console.log('');

        // Test 4: Try batch processing with one item
        console.log('Test 4: Batch Processing (Single Item)');
        console.log('---------------------------------------');
        try {
            const states = [{
                current_frequency: 7.5,
                emotional_coherence: 0.75,
                base_frequency: 7.5,
                resonance_factor: 1.0
            }];
            console.log('Input states:', JSON.stringify(states, null, 2));
            
            const results = wasm.calculate_batch_behavioral_states(states);
            console.log('Results:', JSON.stringify(results, null, 2));
            console.log('✅ Test 4 passed\n');
        } catch (error) {
            console.error('❌ Test 4 failed:', error.message);
            console.error('Stack:', error.stack);
            console.log('');
        }

        // Test 5: Check all available functions
        console.log('Test 5: Available WASM Functions');
        console.log('--------------------------------');
        const functions = Object.keys(wasm).filter(key => typeof wasm[key] === 'function');
        console.log('Total functions:', functions.length);
        functions.forEach(fn => {
            console.log(`  - ${fn}`);
        });

    } catch (error) {
        console.error('Fatal error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testBehavioralState();
