#!/usr/bin/env node

/**
 * Debug Batch Processing Determinism
 * 
 * Purpose: Investigate why batch vs individual processing produces different results
 */

import { ConsciousnessEngineWasm } from './src/wrapper/ConsciousnessEngineWasm.js';
import crypto from 'crypto';

async function debug() {
    console.log('🔍 Debugging Batch Processing Determinism\n');
    
    const engine = new ConsciousnessEngineWasm();
    await engine.initialize();
    
    // Generate deterministic test state
    const generateState = (seed) => {
        const lcg = (s) => (s * 1103515245 + 12345) % 2147483648;
        let rng = seed;
        const next = () => {
            rng = lcg(rng);
            return rng / 2147483648;
        };

        return {
            baseFrequency: 3 + Math.floor(next() * 12),
            baseCoherence: 0.2 + next() * 0.6,
            emotionalState: ['Content', 'Excited', 'Anxious', 'Depressed', 'Joyful'][Math.floor(next() * 5)],
            currentFrequency: 3 + Math.floor(next() * 12),
            emotionalCoherence: 0.2 + next() * 0.6,
            lastUpdate: Date.now()
        };
    };
    
    const state1 = generateState(111);
    const state2 = generateState(222);
    
    console.log('Test State 1:');
    console.log(JSON.stringify(state1, null, 2));
    console.log();
    
    // Process individually
    console.log('Processing individually...');
    const result1_individual = engine.calculateBehavioralState(state1);
    const result2_individual = engine.calculateBehavioralState(state2);
    
    console.log('Result 1 (individual):');
    console.log(JSON.stringify(result1_individual, null, 2));
    console.log();
    
    console.log('Result 2 (individual):');
    console.log(JSON.stringify(result2_individual, null, 2));
    console.log();
    
    // Check if batch method exists
    console.log('Checking for batch method...');
    console.log(`calculateBatchBehavioralStates exists: ${typeof engine.calculateBatchBehavioralStates === 'function'}`);
    console.log();
    
    if (typeof engine.calculateBatchBehavioralStates === 'function') {
        console.log('Processing as batch...');
        const batchResults = engine.calculateBatchBehavioralStates([state1, state2]);
        
        console.log('Result 1 (batch):');
        console.log(JSON.stringify(batchResults[0], null, 2));
        console.log();
        
        console.log('Result 2 (batch):');
        console.log(JSON.stringify(batchResults[1], null, 2));
        console.log();
        
        // Compare
        console.log('═══════════════════════════════════════');
        console.log('COMPARISON:');
        console.log('═══════════════════════════════════════');
        
        const compareResults = (r1, r2, label) => {
            const keys = new Set([...Object.keys(r1), ...Object.keys(r2)]);
            let differences = [];
            
            for (const key of keys) {
                if (JSON.stringify(r1[key]) !== JSON.stringify(r2[key])) {
                    differences.push({
                        key,
                        individual: r1[key],
                        batch: r2[key]
                    });
                }
            }
            
            if (differences.length === 0) {
                console.log(`${label}: ✅ IDENTICAL`);
            } else {
                console.log(`${label}: ❌ DIFFERENT`);
                differences.forEach(diff => {
                    console.log(`  Field: ${diff.key}`);
                    console.log(`    Individual: ${JSON.stringify(diff.individual)}`);
                    console.log(`    Batch:      ${JSON.stringify(diff.batch)}`);
                });
            }
            console.log();
        };
        
        compareResults(result1_individual, batchResults[0], 'Result 1');
        compareResults(result2_individual, batchResults[1], 'Result 2');
        
    } else {
        console.log('⚠️  Batch method not implemented');
        console.log('This explains the test failure - falling back to sequential processing');
        console.log('creates timing differences in timestamps.');
    }
}

debug().catch(console.error);
