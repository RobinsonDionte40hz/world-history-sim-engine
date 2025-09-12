/**
 * EmotionalBatchProcessor
 * 
 * High-performance batch processing system for emotional updates
 * in large-scale simulations. Optimizes memory usage and CPU cycles
 * by grouping similar emotional states and processing them together.
 */

class EmotionalBatchProcessor {
    constructor(options = {}) {
        this.batchSize = options.batchSize || 1000;
        this.updateThreshold = options.updateThreshold || 0.01; // Minimum change to warrant update
        this.memoryPoolSize = options.memoryPoolSize || 10000;
        this.enableCaching = options.enableCaching !== false;
        
        // Performance optimization pools
        this.updatePool = new Map();
        this.stateCache = new Map();
        this.decayCache = new Map();
        
        // Statistics tracking
        this.stats = {
            processedCharacters: 0,
            batchesProcessed: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageProcessingTime: 0
        };
    }

    /**
     * Main batch processing method for emotional updates
     * @param {Array} characters - Array of character objects
     * @param {number} deltaTime - Time elapsed since last update
     * @param {Object} options - Processing options
     * @returns {Map} Map of character IDs to their emotional updates
     */
    processEmotionalUpdates(characters, deltaTime, options = {}) {
        const startTime = performance.now();
        
        // Clear previous updates
        this.updatePool.clear();
        
        // Group characters by emotional state for efficient batch processing
        const grouped = this.groupByEmotionalState(characters);
        
        // Process each group in batches
        for (const [stateKey, chars] of grouped) {
            this.processBatch(chars, stateKey, deltaTime, options);
        }
        
        // Update statistics
        const processingTime = performance.now() - startTime;
        this.updateStats(characters.length, processingTime);
        
        return this.updatePool;
    }

    /**
     * Groups characters by their emotional state for batch processing
     * @param {Array} characters - Characters to group
     * @returns {Map} Map of state keys to character arrays
     */
    groupByEmotionalState(characters) {
        const grouped = new Map();
        
        for (const character of characters) {
            if (!character.consciousness?.emotionalState) continue;
            
            const stateKey = this.generateStateKey(character.consciousness.emotionalState);
            
            if (!grouped.has(stateKey)) {
                grouped.set(stateKey, []);
            }
            grouped.get(stateKey).push(character);
        }
        
        return grouped;
    }

    /**
     * Process a batch of characters with similar emotional states
     * @param {Array} characters - Characters in this batch
     * @param {string} stateKey - Emotional state key
     * @param {number} deltaTime - Time delta
     * @param {Object} options - Processing options
     */
    processBatch(characters, stateKey, deltaTime, options) {
        // Check cache for pre-calculated decay values
        const cacheKey = `${stateKey}_${deltaTime}`;
        let batchDecay = this.getCachedDecay(cacheKey);
        
        if (!batchDecay) {
            // Calculate decay for this emotional state
            const sampleState = characters[0].consciousness.emotionalState;
            batchDecay = this.calculateBatchDecay(sampleState, deltaTime);
            
            if (this.enableCaching) {
                this.setCachedDecay(cacheKey, batchDecay);
            }
            this.stats.cacheMisses++;
        } else {
            this.stats.cacheHits++;
        }
        
        // Apply batch updates to all characters in group
        for (let i = 0; i < characters.length; i += this.batchSize) {
            const batch = characters.slice(i, i + this.batchSize);
            this.applyBatchUpdates(batch, batchDecay, deltaTime, options);
        }
        
        this.stats.batchesProcessed++;
    }

    /**
     * Calculate emotional decay for a batch of similar states
     * @param {Object} emotionalState - Sample emotional state
     * @param {number} deltaTime - Time delta
     * @returns {Object} Batch decay calculations
     */
    calculateBatchDecay(emotionalState, deltaTime) {
        const baseDecay = this.calculateBaseDecay(emotionalState, deltaTime);
        
        return {
            intensityDecay: baseDecay.intensity,
            coherenceDecay: baseDecay.coherence,
            frequencyShift: baseDecay.frequency,
            memoryConsolidation: this.calculateMemoryConsolidation(emotionalState, deltaTime),
            conflictResolution: this.calculateConflictResolution(emotionalState)
        };
    }

    /**
     * Calculate base decay rates for emotional properties
     * @param {Object} state - Emotional state
     * @param {number} deltaTime - Time delta
     * @returns {Object} Base decay values
     */
    calculateBaseDecay(state, deltaTime) {
        const intensity = state.intensity || 0.5;
        const coherence = state.coherence || 0.7;
        const frequency = state.frequency || 40;
        
        // Natural decay rates (optimized for batch processing)
        const intensityDecayRate = this.getIntensityDecayRate(state.primary);
        const coherenceDecayRate = 0.02; // Standard coherence decay
        const frequencyReturnRate = 0.05; // Return to baseline frequency
        
        return {
            intensity: Math.max(0, intensity - (intensityDecayRate * deltaTime)),
            coherence: Math.max(0.1, coherence - (coherenceDecayRate * deltaTime)),
            frequency: frequency + ((40 - frequency) * frequencyReturnRate * deltaTime)
        };
    }

    /**
     * Get decay rate for specific emotional intensity
     * @param {string} emotion - Primary emotion
     * @returns {number} Decay rate
     */
    getIntensityDecayRate(emotion) {
        const decayRates = {
            // Fast decay emotions
            'surprised': 0.08,
            'startled': 0.1,
            'excited': 0.06,
            
            // Medium decay emotions
            'happy': 0.04,
            'sad': 0.03,
            'angry': 0.05,
            'afraid': 0.04,
            
            // Slow decay emotions
            'ashamed': 0.015,
            'guilty': 0.02,
            'depressed': 0.025,
            'anxious': 0.03,
            
            // Complex emotions
            'bittersweet': 0.035,
            'conflicted': 0.04,
            'nostalgic': 0.02
        };
        
        return decayRates[emotion] || 0.04; // Default decay rate
    }

    /**
     * Calculate memory consolidation effects during emotional processing
     * @param {Object} state - Emotional state
     * @param {number} deltaTime - Time delta
     * @returns {Object} Memory consolidation data
     */
    calculateMemoryConsolidation(state, deltaTime) {
        const intensity = state.intensity || 0.5;
        const shouldConsolidate = intensity > 0.6 && deltaTime > 5; // 5 time units
        
        return {
            shouldConsolidate,
            consolidationStrength: shouldConsolidate ? intensity * 0.8 : 0,
            memoryDecayReduction: intensity > 0.7 ? 0.5 : 0 // Reduce decay for strong emotions
        };
    }

    /**
     * Calculate conflict resolution for overlapping emotions
     * @param {Object} state - Emotional state
     * @returns {Object} Conflict resolution data
     */
    calculateConflictResolution(state) {
        if (!state.isComplex) {
            return { hasConflict: false };
        }
        
        // Simplified conflict resolution for batch processing
        const dominanceFactors = {
            'bittersweet': { primary: 0.6, secondary: 0.4 },
            'conflicted': { primary: 0.5, secondary: 0.5 },
            'nervous_excitement': { primary: 0.7, secondary: 0.3 },
            'melancholic_joy': { primary: 0.45, secondary: 0.55 }
        };
        
        const factors = dominanceFactors[state.primary] || { primary: 0.6, secondary: 0.4 };
        
        return {
            hasConflict: true,
            resolution: factors,
            stabilizationRate: 0.02
        };
    }

    /**
     * Apply calculated updates to a batch of characters
     * @param {Array} batch - Character batch
     * @param {Object} batchDecay - Pre-calculated decay values
     * @param {number} deltaTime - Time delta
     * @param {Object} options - Processing options
     */
    applyBatchUpdates(batch, batchDecay, deltaTime, options) {
        for (const character of batch) {
            const currentState = character.consciousness.emotionalState;
            
            // Apply decay with minor individual variations
            const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
            
            const updatedState = {
                ...currentState,
                intensity: Math.max(0, batchDecay.intensityDecay + variation),
                coherence: Math.max(0.1, batchDecay.coherenceDecay + (variation * 0.5)),
                frequency: batchDecay.frequencyShift + variation,
                lastUpdate: Date.now()
            };
            
            // Only store update if change is significant
            const changeSignificance = this.calculateChangeSignificance(currentState, updatedState);
            if (changeSignificance > this.updateThreshold) {
                this.updatePool.set(character.id, {
                    emotionalState: updatedState,
                    memoryConsolidation: batchDecay.memoryConsolidation,
                    conflictResolution: batchDecay.conflictResolution,
                    changeSignificance
                });
            }
        }
    }

    /**
     * Calculate how significant the emotional change is
     * @param {Object} oldState - Previous emotional state
     * @param {Object} newState - New emotional state
     * @returns {number} Significance score (0-1)
     */
    calculateChangeSignificance(oldState, newState) {
        const intensityChange = Math.abs((oldState.intensity || 0.5) - (newState.intensity || 0.5));
        const coherenceChange = Math.abs((oldState.coherence || 0.7) - (newState.coherence || 0.7));
        const frequencyChange = Math.abs((oldState.frequency || 40) - (newState.frequency || 40)) / 100;
        
        return (intensityChange + coherenceChange + frequencyChange) / 3;
    }

    /**
     * Generate a cache key for emotional state grouping
     * @param {Object} state - Emotional state
     * @returns {string} State key for grouping
     */
    generateStateKey(state) {
        const primary = state.primary || 'neutral';
        const intensityBucket = Math.floor((state.intensity || 0.5) * 10); // 0-9 buckets
        const coherenceBucket = Math.floor((state.coherence || 0.7) * 10);
        const frequencyBucket = Math.floor((state.frequency || 40) / 10); // 10Hz buckets
        const complex = state.isComplex ? 'C' : 'S'; // Complex or Simple
        
        return `${primary}_${intensityBucket}_${coherenceBucket}_${frequencyBucket}_${complex}`;
    }

    /**
     * Cache management for decay calculations
     */
    getCachedDecay(key) {
        return this.decayCache.get(key);
    }

    setCachedDecay(key, value) {
        // Implement LRU cache with size limit
        if (this.decayCache.size >= this.memoryPoolSize) {
            const firstKey = this.decayCache.keys().next().value;
            this.decayCache.delete(firstKey);
        }
        this.decayCache.set(key, value);
    }

    /**
     * Update performance statistics
     * @param {number} characterCount - Number of characters processed
     * @param {number} processingTime - Time taken to process
     */
    updateStats(characterCount, processingTime) {
        this.stats.processedCharacters += characterCount;
        
        // Moving average for processing time
        const alpha = 0.1;
        this.stats.averageProcessingTime = 
            (alpha * processingTime) + ((1 - alpha) * this.stats.averageProcessingTime);
    }

    /**
     * Get performance statistics
     * @returns {Object} Performance stats
     */
    getPerformanceStats() {
        const cacheHitRate = this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses);
        
        return {
            ...this.stats,
            cacheHitRate: isNaN(cacheHitRate) ? 0 : cacheHitRate,
            charactersPerSecond: this.stats.averageProcessingTime > 0 
                ? (this.stats.processedCharacters / this.stats.averageProcessingTime) * 1000
                : 0,
            memoryUsage: {
                updatePool: this.updatePool.size,
                stateCache: this.stateCache.size,
                decayCache: this.decayCache.size
            }
        };
    }

    /**
     * Clear all caches and reset statistics
     */
    reset() {
        this.updatePool.clear();
        this.stateCache.clear();
        this.decayCache.clear();
        
        this.stats = {
            processedCharacters: 0,
            batchesProcessed: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageProcessingTime: 0
        };
    }

    /**
     * Memory-efficient emotional state transitions for large batches
     * @param {Array} characters - Characters to process
     * @param {Array} events - Emotional events to apply
     * @returns {Map} Batch transition results
     */
    processBatchTransitions(characters, events) {
        const transitionMap = new Map();
        
        // Group events by type for efficient processing
        const eventGroups = this.groupEventsByType(events);
        
        for (const [eventType, eventList] of eventGroups) {
            const affectedCharacters = this.findAffectedCharacters(characters, eventList);
            const batchTransition = this.calculateBatchTransition(eventType, eventList);
            
            for (const character of affectedCharacters) {
                const personalizedTransition = this.personalizeTransition(
                    character, 
                    batchTransition,
                    eventList.filter(e => this.isCharacterAffected(character, e))
                );
                
                transitionMap.set(character.id, personalizedTransition);
            }
        }
        
        return transitionMap;
    }

    /**
     * Group events by type for batch processing
     * @param {Array} events - Events to group
     * @returns {Map} Grouped events
     */
    groupEventsByType(events) {
        const grouped = new Map();
        
        for (const event of events) {
            const type = event.type || 'general';
            if (!grouped.has(type)) {
                grouped.set(type, []);
            }
            grouped.get(type).push(event);
        }
        
        return grouped;
    }

    /**
     * Find characters affected by a set of events
     * @param {Array} characters - All characters
     * @param {Array} events - Events to check
     * @returns {Array} Affected characters
     */
    findAffectedCharacters(characters, events) {
        const affectedIds = new Set();
        
        for (const event of events) {
            if (event.participants) {
                event.participants.forEach(id => affectedIds.add(id));
            }
            if (event.globalEffect) {
                characters.forEach(c => affectedIds.add(c.id));
            }
        }
        
        return characters.filter(c => affectedIds.has(c.id));
    }

    /**
     * Calculate batch transition for similar events
     * @param {string} eventType - Type of events
     * @param {Array} events - Events of this type
     * @returns {Object} Batch transition data
     */
    calculateBatchTransition(eventType, events) {
        // Aggregate emotional impact across events
        let totalIntensity = 0;
        let totalValence = 0;
        const emotionCounts = new Map();
        
        for (const event of events) {
            totalIntensity += event.emotionalIntensity || 0.5;
            totalValence += event.emotionalValence || 0;
            
            const emotion = event.primaryEmotion || 'neutral';
            emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
        }
        
        // Find dominant emotion
        let dominantEmotion = 'neutral';
        let maxCount = 0;
        for (const [emotion, count] of emotionCounts) {
            if (count > maxCount) {
                maxCount = count;
                dominantEmotion = emotion;
            }
        }
        
        return {
            dominantEmotion,
            averageIntensity: totalIntensity / events.length,
            averageValence: totalValence / events.length,
            eventCount: events.length,
            emotionDistribution: emotionCounts
        };
    }

    /**
     * Personalize batch transition for individual character
     * @param {Object} character - Character to personalize for
     * @param {Object} batchTransition - Batch transition data
     * @param {Array} characterEvents - Events affecting this character
     * @returns {Object} Personalized transition
     */
    personalizeTransition(character, batchTransition, characterEvents) {
        const personality = character.personalityProfile?.traits || {};
        const emotionalTendencies = character.personalityProfile?.emotionalTendencies || new Map();
        
        // Adjust intensity based on personality
        const volatility = personality.volatility || 0.5;
        const intensityModifier = 0.5 + (volatility * 0.5);
        
        // Adjust based on emotional tendencies
        const tendency = emotionalTendencies.get(batchTransition.dominantEmotion) || 0.5;
        const tendencyModifier = 0.7 + (tendency * 0.6);
        
        return {
            targetEmotion: batchTransition.dominantEmotion,
            intensity: Math.min(1.0, batchTransition.averageIntensity * intensityModifier * tendencyModifier),
            valence: batchTransition.averageValence,
            personalityInfluence: intensityModifier,
            tendencyInfluence: tendencyModifier,
            eventCount: characterEvents.length
        };
    }

    /**
     * Check if character is affected by specific event
     * @param {Object} character - Character to check
     * @param {Object} event - Event to check
     * @returns {boolean} Whether character is affected
     */
    isCharacterAffected(character, event) {
        if (event.participants && event.participants.includes(character.id)) {
            return true;
        }
        if (event.globalEffect) {
            return true;
        }
        if (event.locationEffect && character.location === event.location) {
            return true;
        }
        return false;
    }
}

export default EmotionalBatchProcessor;