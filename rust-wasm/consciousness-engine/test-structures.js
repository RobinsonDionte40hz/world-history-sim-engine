/**
 * Test Behavioral State with Proper Data Structures
 */

async function testProperStructures() {
    console.log('🔍 Testing with Proper Rust Structures\n');

    try {
        const wasm = await import('./pkg/consciousness_engine.js');
        console.log('✅ WASM module loaded\n');

        // Test 1: Create ConsciousnessState properly
        console.log('Test 1: Using WASM ConsciousnessState Constructor');
        console.log('--------------------------------------------------');
        try {
            // Check if ConsciousnessState constructor exists
            if (typeof wasm.ConsciousnessState === 'function') {
                console.log('ConsciousnessState constructor found!');
                console.log('Constructor:', wasm.ConsciousnessState.toString());
                
                // Try to create an instance
                const state = new wasm.ConsciousnessState();
                console.log('Created state:', state);
            } else {
                console.log('⚠️  ConsciousnessState is not a constructor');
            }
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
        console.log('');

        // Test 2: Try with manual object matching Rust struct
        console.log('Test 2: Manual Object with All Required Fields');
        console.log('-----------------------------------------------');
        try {
            const state = {
                base_frequency: 7.5,
                base_coherence: 0.7,
                current_frequency: 7.5,
                emotional_coherence: 0.75,
                emotional_state: 'Content',  // String enum
                last_update: Date.now()
            };
            console.log('Input state:', JSON.stringify(state, null, 2));
            
            const result = wasm.calculate_behavioral_state(state);
            console.log('Result:', result);
            console.log('Result type:', typeof result);
            console.log('Result JSON:', JSON.stringify(result, null, 2));
            console.log('✅ Test 2 passed\n');
        } catch (error) {
            console.error('❌ Test 2 failed:', error.message);
            if (error.stack) console.error('Stack:', error.stack);
            console.log('');
        }

        // Test 3: Check TypeScript definitions
        console.log('Test 3: Reading TypeScript Definitions');
        console.log('--------------------------------------');
        const fs = await import('fs');
        const dts = fs.readFileSync('./pkg/consciousness_engine.d.ts', 'utf8');
        
        // Find ConsciousnessState definition
        const stateDefMatch = dts.match(/export class ConsciousnessState[\s\S]*?^}/m);
        if (stateDefMatch) {
            console.log('ConsciousnessState definition:');
            console.log(stateDefMatch[0]);
        }
        
        // Find BehavioralState definition
        const behavDefMatch = dts.match(/export class BehavioralState[\s\S]*?^}/m);
        if (behavDefMatch) {
            console.log('\nBehavioralState definition:');
            console.log(behavDefMatch[0]);
        }
        console.log('');

        // Test 4: Check if we can create instances using constructors
        console.log('Test 4: Using Exported Constructors');
        console.log('------------------------------------');
        try {
            // List all classes/constructors
            const classes = Object.keys(wasm).filter(key => {
                return typeof wasm[key] === 'function' && 
                       key[0] === key[0].toUpperCase() && 
                       !key.startsWith('__');
            });
            console.log('Available classes:', classes);
            
            // Try to use them
            for (const className of classes) {
                try {
                    const instance = new wasm[className]();
                    console.log(`✅ Created ${className}:`, instance);
                } catch (e) {
                    console.log(`⚠️  ${className} requires parameters:`, e.message);
                }
            }
        } catch (error) {
            console.error('Error:', error.message);
        }

    } catch (error) {
        console.error('Fatal error:', error.message);
        process.exit(1);
    }
}

testProperStructures();
