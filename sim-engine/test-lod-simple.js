/**
 * Simple test for LODManager WASM batch processing
 */

const LODManager = require('./src/domain/services/LODManager.js').default;
const Character = require('./src/domain/entities/Character.js').default;
const { ConsciousnessEngineWasm } = require('@world-history-sim/consciousness-engine-wasm');

async function simpleTest() {
    console.log('🧪 Simple LODManager WASM Test\n');
    
    try {
        // Initialize WASM
        console.log('Initializing WASM engine...');
        const wasmEngine = new ConsciousnessEngineWasm();
        await wasmEngine.initialize();
        console.log('✅ WASM initialized\n');
        
        // Create LOD manager with WASM
        const lodManager = new LODManager(wasmEngine);
        console.log('LOD Manager created');
        console.log('WASM Batch Enabled:', lodManager.useWasmBatch, '\n');
        
        // Create 15 test characters
        console.log('Creating 15 test characters...');
        const characters = [];
        for (let i = 0; i < 15; i++) {
            const char = new Character({
                name: `Test ${i}`,
                race: 'human',
                attributes: {
                    strength: 10,
                    dexterity: 10,
                    constitution: 10,
                    intelligence: 10,
                    wisdom: 10,
                    charisma: 10
                }
            });
            
            char.lodTier = 'group';
            char.consciousness = {
                frequency: 7.5,
                baseFrequency: 7.5,
                coherence: 0.7,
                baseCoherence: 0.7,
                emotionalState: 'Content'
            };
            
            characters.push(char);
        }
        console.log('✅ Characters created\n');
        
        // Process characters
        console.log('Processing characters with WASM batch...');
        const world = {};
        const turnContext = {};
        
        const startTime = performance.now();
        const result = lodManager.processCharacterTier('group', characters, world, turnContext);
        const endTime = performance.now();
        
        console.log('\n📊 Results:');
        console.log('  Processed:', result.processedCount, 'characters');
        console.log('  WASM Batch Used:', result.wasmBatchUsed);
        console.log('  Total Time:', (endTime - startTime).toFixed(2), 'ms');
        console.log('  Avg Time:', result.averageProcessingTime.toFixed(3), 'ms per character');
        console.log('  Results Length:', result.results.length);
        
        if (result.wasmBatchUsed && result.processedCount === 15) {
            console.log('\n✅ Test PASSED!\n');
            process.exit(0);
        } else {
            console.log('\n❌ Test FAILED!\n');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

simpleTest();
