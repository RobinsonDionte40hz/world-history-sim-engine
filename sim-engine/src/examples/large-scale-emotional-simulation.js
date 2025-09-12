/**
 * Large-Scale Emotional Simulation Integration Example
 * 
 * Demonstrates how to integrate EmotionalBatchProcessor with the existing
 * consciousness system for high-performance emotional updates in large
 * simulations with thousands of NPCs.
 */

import EmotionalBatchProcessor from '../shared/utils/EmotionalBatchProcessor.js';
import ConsciousnessSystem from '../shared/utils/ConsciousnessSystem.js';
import EmotionalUtils from '../shared/utils/EmotionalUtils.js';

class LargeScaleEmotionalSimulation {
    constructor(options = {}) {
        this.batchProcessor = new EmotionalBatchProcessor({
            batchSize: options.batchSize || 500,
            updateThreshold: options.updateThreshold || 0.02,
            enableCaching: options.enableCaching !== false,
            memoryPoolSize: options.memoryPoolSize || 5000
        });
        
        this.consciousnessSystem = new ConsciousnessSystem();
        this.simulationTime = 0;
        this.timeStep = options.timeStep || 1.0;
        
        // Performance monitoring
        this.performanceMetrics = {
            frameTime: 0,
            charactersProcessed: 0,
            updatesApplied: 0,
            emotionalEvents: 0
        };
        
        console.log('🧠 Large-Scale Emotional Simulation initialized');
        console.log(`📊 Batch size: ${this.batchProcessor.batchSize}`);
        console.log(`⚡ Caching: ${this.batchProcessor.enableCaching ? 'enabled' : 'disabled'}`);
    }

    /**
     * Main simulation step - processes emotional updates for all NPCs
     * @param {Array} characters - All characters in the simulation
     * @param {Array} events - Emotional events that occurred this step
     * @returns {Object} Simulation results
     */
    simulationStep(characters, events = []) {
        const stepStartTime = performance.now();
        
        console.log(`\n🎯 Simulation Step ${Math.floor(this.simulationTime)}`);
        console.log(`👥 Processing ${characters.length} characters`);
        console.log(`📋 ${events.length} emotional events`);
        
        // Phase 1: Process emotional events (transitions)
        const transitionResults = this.processEmotionalEvents(characters, events);
        
        // Phase 2: Process natural emotional decay and updates
        const decayResults = this.processEmotionalDecay(characters);
        
        // Phase 3: Apply results to characters
        const applicationResults = this.applyEmotionalUpdates(characters, transitionResults, decayResults);
        
        // Phase 4: Update memory systems
        this.updateEmotionalMemories(characters, events);
        
        // Update simulation time
        this.simulationTime += this.timeStep;
        
        // Calculate performance metrics
        const stepEndTime = performance.now();
        this.updatePerformanceMetrics(stepEndTime - stepStartTime, characters.length, 
                                     transitionResults.size + decayResults.size, events.length);
        
        return {
            transitionsProcessed: transitionResults.size,
            decayUpdatesProcessed: decayResults.size,
            charactersUpdated: applicationResults.updated,
            emotionalEventsProcessed: events.length,
            performanceMetrics: this.getPerformanceSnapshot(),
            simulationTime: this.simulationTime
        };
    }

    /**
     * Process emotional events that cause state transitions
     * @param {Array} characters - Characters in simulation
     * @param {Array} events - Emotional events
     * @returns {Map} Character ID to transition data
     */
    processEmotionalEvents(characters, events) {
        if (events.length === 0) return new Map();
        
        console.log('🎭 Processing emotional transitions...');
        
        // Use batch processor for efficient event handling
        const transitions = this.batchProcessor.processBatchTransitions(characters, events);
        
        console.log(`✨ ${transitions.size} emotional transitions calculated`);
        
        return transitions;
    }

    /**
     * Process natural emotional decay for all characters
     * @param {Array} characters - Characters in simulation
     * @returns {Map} Character ID to decay update data
     */
    processEmotionalDecay(characters) {
        console.log('🍂 Processing emotional decay...');
        
        // Use batch processor for efficient decay calculations
        const decayUpdates = this.batchProcessor.processEmotionalUpdates(characters, this.timeStep);
        
        console.log(`📉 ${decayUpdates.size} decay updates calculated`);
        
        return decayUpdates;
    }

    /**
     * Apply calculated emotional updates to characters
     * @param {Array} characters - Characters to update
     * @param {Map} transitions - Transition updates
     * @param {Map} decayUpdates - Decay updates
     * @returns {Object} Application results
     */
    applyEmotionalUpdates(characters, transitions, decayUpdates) {
        console.log('🔄 Applying emotional updates...');
        
        let updated = 0;
        let significantChanges = 0;
        
        for (const character of characters) {
            let hasUpdate = false;
            let newEmotionalState = character.consciousness?.emotionalState;
            
            // Apply transition if present
            if (transitions.has(character.id)) {
                const transition = transitions.get(character.id);
                newEmotionalState = this.applyTransition(character, transition);
                hasUpdate = true;
            }
            
            // Apply decay if present
            if (decayUpdates.has(character.id)) {
                const decay = decayUpdates.get(character.id);
                newEmotionalState = this.applyDecay(newEmotionalState || character.consciousness?.emotionalState, decay);
                hasUpdate = true;
            }
            
            // Update character if changes occurred
            if (hasUpdate && newEmotionalState) {
                // Calculate significance of change
                const significance = this.calculateOverallSignificance(
                    character.consciousness?.emotionalState,
                    newEmotionalState
                );
                
                if (significance > 0.05) { // Significant change threshold
                    this.updateCharacterEmotionalState(character, newEmotionalState);
                    updated++;
                    
                    if (significance > 0.3) {
                        significantChanges++;
                    }
                }
            }
        }
        
        console.log(`🎯 ${updated} characters updated (${significantChanges} significant changes)`);
        
        return { updated, significantChanges };
    }

    /**
     * Apply emotional transition to character's state
     * @param {Object} character - Character to update
     * @param {Object} transition - Transition data
     * @returns {Object} New emotional state
     */
    applyTransition(character, transition) {
        const currentState = character.consciousness?.emotionalState || {
            primary: 'neutral',
            intensity: 0.5,
            coherence: 0.7,
            frequency: 40
        };
        
        // Blend transition with current state
        const transitionWeight = Math.min(1.0, transition.intensity * transition.personalityInfluence);
        
        return {
            primary: transition.targetEmotion,
            secondary: currentState.primary, // Previous becomes secondary
            intensity: Math.min(1.0, currentState.intensity + (transition.intensity * transitionWeight)),
            coherence: currentState.coherence * (1 - transitionWeight * 0.3), // Slight coherence impact
            frequency: currentState.frequency + ((transition.valence > 0 ? 5 : -5) * transitionWeight),
            isComplex: this.shouldBeComplex(transition.targetEmotion, currentState.primary),
            lastUpdate: Date.now(),
            transitionSource: 'event'
        };
    }

    /**
     * Apply natural decay to emotional state
     * @param {Object} currentState - Current emotional state
     * @param {Object} decay - Decay data
     * @returns {Object} New emotional state
     */
    applyDecay(currentState, decay) {
        if (!currentState) return null;
        
        return {
            ...currentState,
            ...decay.emotionalState,
            lastUpdate: Date.now(),
            transitionSource: 'decay'
        };
    }

    /**
     * Update emotional memories for characters involved in events
     * @param {Array} characters - All characters
     * @param {Array} events - Events that occurred
     */
    updateEmotionalMemories(characters, events) {
        if (events.length === 0) return;
        
        console.log('🧠 Updating emotional memories...');
        
        let memoriesCreated = 0;
        
        for (const event of events) {
            if (!event.participants) continue;
            
            for (const participantId of event.participants) {
                const character = characters.find(c => c.id === participantId);
                if (!character?.consciousness?.emotionalState) continue;
                
                // Create emotional memory for significant events
                const eventSignificance = (event.emotionalIntensity || 0.5) * Math.abs(event.emotionalValence || 0);
                
                if (eventSignificance > 0.3) { // Only memorable events
                    try {
                        EmotionalUtils.enhanceMemoryWithEmotion(
                            character,
                            event,
                            character.consciousness.emotionalState
                        );
                        memoriesCreated++;
                    } catch (error) {
                        console.warn(`Failed to create memory for ${participantId}:`, error.message);
                    }
                }
            }
        }
        
        console.log(`💭 ${memoriesCreated} emotional memories created`);
    }

    /**
     * Update character's emotional state using consciousness system
     * @param {Object} character - Character to update
     * @param {Object} newState - New emotional state
     */
    updateCharacterEmotionalState(character, newState) {
        if (!character.consciousness) {
            character.consciousness = {};
        }
        
        // Update using consciousness system for consistency
        try {
            this.consciousnessSystem.applyEmotionalEvent(character, {
                type: 'state_update',
                targetState: newState.primary,
                intensity: newState.intensity,
                duration: this.timeStep
            });
            
            // Override with our calculated state
            character.consciousness.emotionalState = newState;
        } catch (error) {
            console.warn(`Failed to update emotional state for ${character.id}:`, error.message);
            // Fallback: direct assignment
            character.consciousness.emotionalState = newState;
        }
    }

    /**
     * Calculate overall significance of emotional change
     * @param {Object} oldState - Previous state
     * @param {Object} newState - New state
     * @returns {number} Significance score (0-1)
     */
    calculateOverallSignificance(oldState, newState) {
        if (!oldState || !newState) return 1.0; // New state is always significant
        
        // Emotion change significance
        const emotionChange = oldState.primary !== newState.primary ? 0.5 : 0;
        
        // Intensity change significance
        const intensityChange = Math.abs((oldState.intensity || 0.5) - (newState.intensity || 0.5));
        
        // Coherence change significance
        const coherenceChange = Math.abs((oldState.coherence || 0.7) - (newState.coherence || 0.7)) * 0.5;
        
        // Frequency change significance (scaled)
        const frequencyChange = Math.abs((oldState.frequency || 40) - (newState.frequency || 40)) / 100;
        
        return Math.min(1.0, emotionChange + intensityChange + coherenceChange + frequencyChange);
    }

    /**
     * Determine if emotional state should be complex
     * @param {string} primary - Primary emotion
     * @param {string} secondary - Secondary emotion
     * @returns {boolean} Whether state should be complex
     */
    shouldBeComplex(primary, secondary) {
        if (!secondary || primary === secondary) return false;
        
        const complexCombinations = [
            ['happy', 'sad'], ['sad', 'happy'], // Bittersweet
            ['excited', 'afraid'], ['afraid', 'excited'], // Nervous excitement
            ['angry', 'sad'], ['sad', 'angry'], // Frustrated grief
            ['happy', 'angry'], ['angry', 'happy'] // Conflicted joy
        ];
        
        return complexCombinations.some(([p, s]) => p === primary && s === secondary);
    }

    /**
     * Update performance metrics
     * @param {number} frameTime - Time for this frame
     * @param {number} characters - Characters processed
     * @param {number} updates - Updates applied
     * @param {number} events - Events processed
     */
    updatePerformanceMetrics(frameTime, characters, updates, events) {
        // Moving average with 0.1 alpha
        const alpha = 0.1;
        this.performanceMetrics.frameTime = 
            (alpha * frameTime) + ((1 - alpha) * this.performanceMetrics.frameTime);
        
        this.performanceMetrics.charactersProcessed = characters;
        this.performanceMetrics.updatesApplied = updates;
        this.performanceMetrics.emotionalEvents = events;
    }

    /**
     * Get current performance snapshot
     * @returns {Object} Performance data
     */
    getPerformanceSnapshot() {
        const batchStats = this.batchProcessor.getPerformanceStats();
        
        return {
            frameTime: this.performanceMetrics.frameTime,
            charactersPerSecond: this.performanceMetrics.frameTime > 0 
                ? (this.performanceMetrics.charactersProcessed / this.performanceMetrics.frameTime) * 1000
                : 0,
            updatesPerSecond: this.performanceMetrics.frameTime > 0
                ? (this.performanceMetrics.updatesApplied / this.performanceMetrics.frameTime) * 1000
                : 0,
            batchProcessor: {
                cacheHitRate: batchStats.cacheHitRate,
                averageProcessingTime: batchStats.averageProcessingTime,
                memoryUsage: batchStats.memoryUsage
            },
            efficiency: {
                charactersProcessed: this.performanceMetrics.charactersProcessed,
                updatesApplied: this.performanceMetrics.updatesApplied,
                updateRatio: this.performanceMetrics.charactersProcessed > 0
                    ? this.performanceMetrics.updatesApplied / this.performanceMetrics.charactersProcessed
                    : 0
            }
        };
    }

    /**
     * Print detailed performance report
     */
    printPerformanceReport() {
        const snapshot = this.getPerformanceSnapshot();
        
        console.log('\n📊 Performance Report');
        console.log('═'.repeat(50));
        console.log(`⏱️  Frame Time: ${snapshot.frameTime.toFixed(2)}ms`);
        console.log(`👥 Characters/sec: ${snapshot.charactersPerSecond.toFixed(0)}`);
        console.log(`🔄 Updates/sec: ${snapshot.updatesPerSecond.toFixed(0)}`);
        console.log(`📈 Update Efficiency: ${(snapshot.efficiency.updateRatio * 100).toFixed(1)}%`);
        console.log(`🎯 Cache Hit Rate: ${(snapshot.batchProcessor.cacheHitRate * 100).toFixed(1)}%`);
        console.log(`💾 Memory Usage: ${JSON.stringify(snapshot.batchProcessor.memoryUsage)}`);
    }

    /**
     * Run performance benchmark with varying character counts
     * @param {Array} characterCounts - Array of character counts to test
     * @returns {Array} Benchmark results
     */
    async runPerformanceBenchmark(characterCounts = [100, 500, 1000, 2500, 5000]) {
        console.log('\n🏃‍♂️ Running Performance Benchmark');
        console.log('═'.repeat(50));
        
        const results = [];
        
        for (const count of characterCounts) {
            console.log(`\n🧪 Testing with ${count} characters...`);
            
            // Create test characters
            const testCharacters = this.createTestCharacters(count);
            const testEvents = this.createTestEvents(Math.floor(count * 0.1)); // 10% event rate
            
            // Reset batch processor
            this.batchProcessor.reset();
            
            // Run simulation step
            this.simulationStep(testCharacters, testEvents);
            const snapshot = this.getPerformanceSnapshot();
            
            results.push({
                characterCount: count,
                frameTime: snapshot.frameTime,
                charactersPerSecond: snapshot.charactersPerSecond,
                cacheHitRate: snapshot.batchProcessor.cacheHitRate,
                memoryUsage: snapshot.batchProcessor.memoryUsage
            });
            
            console.log(`✅ ${count} chars: ${snapshot.frameTime.toFixed(2)}ms (${snapshot.charactersPerSecond.toFixed(0)} chars/sec)`);
        }
        
        // Print summary
        console.log('\n📈 Benchmark Summary');
        console.log('Character Count | Frame Time | Chars/Sec | Cache Hit Rate');
        console.log('─'.repeat(60));
        for (const result of results) {
            console.log(`${result.characterCount.toString().padStart(12)} | ${result.frameTime.toFixed(2).padStart(8)}ms | ${result.charactersPerSecond.toFixed(0).padStart(7)} | ${(result.cacheHitRate * 100).toFixed(1).padStart(12)}%`);
        }
        
        return results;
    }

    /**
     * Create test characters for benchmarking
     * @param {number} count - Number of characters to create
     * @returns {Array} Test characters
     */
    createTestCharacters(count) {
        const emotions = ['happy', 'sad', 'angry', 'afraid', 'excited', 'content', 'anxious', 'surprised'];
        const characters = [];
        
        for (let i = 0; i < count; i++) {
            characters.push({
                id: `test-char-${i}`,
                consciousness: {
                    emotionalState: {
                        primary: emotions[i % emotions.length],
                        secondary: emotions[(i + 1) % emotions.length],
                        intensity: 0.2 + (Math.random() * 0.6),
                        coherence: 0.4 + (Math.random() * 0.4),
                        frequency: 30 + (Math.random() * 30),
                        isComplex: Math.random() > 0.85
                    }
                },
                personalityProfile: {
                    traits: {
                        volatility: Math.random()
                    },
                    emotionalTendencies: new Map([
                        ['happy', Math.random()],
                        ['sad', Math.random()],
                        ['angry', Math.random()]
                    ])
                },
                decisionHistory: []
            });
        }
        
        return characters;
    }

    /**
     * Create test events for benchmarking
     * @param {number} count - Number of events to create
     * @returns {Array} Test events
     */
    createTestEvents(count) {
        const eventTypes = ['social', 'economic', 'political', 'environmental'];
        const emotions = ['happy', 'sad', 'angry', 'afraid', 'excited'];
        const events = [];
        
        for (let i = 0; i < count; i++) {
            const participantCount = 2 + Math.floor(Math.random() * 5); // 2-6 participants
            const participants = [];
            
            for (let j = 0; j < participantCount; j++) {
                participants.push(`test-char-${Math.floor(Math.random() * 1000)}`);
            }
            
            events.push({
                id: `test-event-${i}`,
                type: eventTypes[i % eventTypes.length],
                participants: participants,
                emotionalIntensity: 0.3 + (Math.random() * 0.5),
                emotionalValence: (Math.random() - 0.5) * 2, // -1 to 1
                primaryEmotion: emotions[i % emotions.length],
                timestamp: Date.now() + i
            });
        }
        
        return events;
    }
}

// Example usage and demonstration
export default function demonstrateLargeScaleSimulation() {
    console.log('🚀 Large-Scale Emotional Simulation Demo');
    console.log('═'.repeat(50));
    
    // Create simulation with optimized settings
    const simulation = new LargeScaleEmotionalSimulation({
        batchSize: 500,
        updateThreshold: 0.02,
        enableCaching: true,
        memoryPoolSize: 10000,
        timeStep: 1.0
    });
    
    // Create a large population of NPCs
    const characters = simulation.createTestCharacters(2000);
    console.log(`👥 Created ${characters.length} NPCs for simulation`);
    
    // Simulate several time steps
    for (let step = 0; step < 5; step++) {
        const events = simulation.createTestEvents(Math.floor(characters.length * 0.05)); // 5% event rate
        
        simulation.simulationStep(characters, events);
        
        if (step % 2 === 0) { // Print every other step
            simulation.printPerformanceReport();
        }
    }
    
    // Run comprehensive benchmark
    return simulation.runPerformanceBenchmark([500, 1000, 2000, 3000, 5000]);
}

export { LargeScaleEmotionalSimulation };