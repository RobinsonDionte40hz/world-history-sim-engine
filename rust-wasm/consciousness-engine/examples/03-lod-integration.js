// LOD Integration Example - Consciousness Engine WASM

import { ConsciousnessEngineWasm } from '../src/wrapper/ConsciousnessEngineWasm.js';

class LODManager {
    constructor(engine) {
        this.engine = engine;
    }
    
    // Process Hero tier (individual processing for full fidelity)
    processHeroTier(heroes) {
        console.log(`   Processing ${heroes.length} hero characters individually...`);
        const start = performance.now();
        
        heroes.forEach(hero => {
            hero.consciousness.behavioralState = 
                this.engine.calculateBehavioralState(hero.consciousness);
        });
        
        const duration = performance.now() - start;
        console.log(`   ✅ Heroes processed in ${duration.toFixed(4)}ms\n`);
        return duration;
    }
    
    // Process Named NPC tier (small batch)
    processNamedNPCTier(namedNPCs) {
        console.log(`   Processing ${namedNPCs.length} named NPCs in batch...`);
        const start = performance.now();
        
        const behaviors = this.engine.calculateBatchBehavioralStates(
            namedNPCs.map(npc => npc.consciousness)
        );
        
        namedNPCs.forEach((npc, i) => {
            npc.consciousness.behavioralState = behaviors[i];
        });
        
        const duration = performance.now() - start;
        console.log(`   ✅ Named NPCs processed in ${duration.toFixed(4)}ms\n`);
        return duration;
    }
    
    // Process Population Group tier (large batch)
    processPopulationGroupTier(populationGroups) {
        let totalProcessed = 0;
        let totalDuration = 0;
        
        populationGroups.forEach((group, groupIndex) => {
            console.log(`   Processing population group ${groupIndex + 1} (${group.characters.length} characters)...`);
            const start = performance.now();
            
            const behaviors = this.engine.calculateBatchBehavioralStates(
                group.characters.map(c => c.consciousness)
            );
            
            group.characters.forEach((char, i) => {
                char.consciousness.behavioralState = behaviors[i];
            });
            
            const duration = performance.now() - start;
            totalProcessed += group.characters.length;
            totalDuration += duration;
            
            console.log(`   ✅ Group ${groupIndex + 1} processed in ${duration.toFixed(4)}ms`);
        });
        
        console.log(`   Total: ${totalProcessed} characters in ${totalDuration.toFixed(4)}ms\n`);
        return totalDuration;
    }
}

async function main() {
    console.log('=== LOD Integration Example ===\n');
    
    // Initialize engine
    const engine = new ConsciousnessEngineWasm();
    await engine.initialize();
    const lodManager = new LODManager(engine);
    
    // Create multi-tier world
    console.log('1. Creating multi-tier world...\n');
    
    // Tier 1: Hero characters (2 characters)
    const heroes = [
        {
            name: 'Aldric',
            tier: 'HERO',
            consciousness: { baseFrequency: 8.5, baseCoherence: 0.85, emotionalState: 'Content' }
        },
        {
            name: 'Elena',
            tier: 'HERO',
            consciousness: { baseFrequency: 9.0, baseCoherence: 0.8, emotionalState: 'Excited' }
        }
    ];
    
    // Tier 2: Named NPCs (10 characters)
    const namedNPCs = Array(10).fill(null).map((_, i) => ({
        name: `NPC_${i}`,
        tier: 'NAMED_NPC',
        consciousness: {
            baseFrequency: 6 + Math.random() * 3,
            baseCoherence: 0.6 + Math.random() * 0.2,
            emotionalState: 'Content'
        }
    }));
    
    // Tier 3: Population groups (3 groups of 50 characters each)
    const populationGroups = Array(3).fill(null).map((_, groupIndex) => ({
        id: `group_${groupIndex}`,
        characters: Array(50).fill(null).map((_, i) => ({
            id: `citizen_${groupIndex}_${i}`,
            tier: 'POPULATION_GROUP',
            consciousness: {
                baseFrequency: 5 + Math.random() * 4,
                baseCoherence: 0.5 + Math.random() * 0.3,
                emotionalState: 'Content'
            }
        }))
    }));
    
    console.log(`   Tier 1 (HERO): ${heroes.length} characters`);
    console.log(`   Tier 2 (NAMED_NPC): ${namedNPCs.length} characters`);
    console.log(`   Tier 3 (POPULATION_GROUP): ${populationGroups.length} groups (${populationGroups.reduce((sum, g) => sum + g.characters.length, 0)} characters)`);
    console.log(`   Total: ${heroes.length + namedNPCs.length + populationGroups.reduce((sum, g) => sum + g.characters.length, 0)} characters\n`);
    
    // Process each tier
    console.log('2. Processing by LOD tier:\n');
    
    const overallStart = performance.now();
    
    const heroTime = lodManager.processHeroTier(heroes);
    const namedTime = lodManager.processNamedNPCTier(namedNPCs);
    const popTime = lodManager.processPopulationGroupTier(populationGroups);
    
    const overallDuration = performance.now() - overallStart;
    
    // Summary
    console.log('3. Performance summary:');
    console.log(`   Total characters: ${heroes.length + namedNPCs.length + populationGroups.reduce((sum, g) => sum + g.characters.length, 0)}`);
    console.log(`   Total time: ${overallDuration.toFixed(4)}ms`);
    console.log(`   Throughput: ${((heroes.length + namedNPCs.length + populationGroups.reduce((sum, g) => sum + g.characters.length, 0)) / (overallDuration / 1000)).toFixed(0)} chars/sec\n`);
    
    console.log('✅ LOD integration example complete!');
}

main();
