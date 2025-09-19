class ConsciousnessState {
    constructor(config) {
        this.id = config.id;
        this.baseFrequency = config.baseFrequency || 7.5;
        this.currentFrequency = config.currentFrequency || this.baseFrequency;
        this.emotionalCoherence = config.emotionalCoherence || 0.7;
        this.fieldRadius = config.fieldRadius || 2.5;
        this.shortTermMemory = config.shortTermMemory || [];
        this.emotionalImprints = config.emotionalImprints || [];
        this.primaryDrive = config.primaryDrive || 'survive';
        this.activeGoals = config.activeGoals || [];
        this.hiddenAgendas = config.hiddenAgendas || [];
        this.relationships = config.relationships || new Map();
        this.lastUpdate = Date.now();
        
        // Enhanced emotional state tracking
        this.baseEmotionalState = config.baseEmotionalState || 'content';
        this.emotionalModifiers = config.emotionalModifiers || new Map();
        this.emotionalDecayRate = config.emotionalDecayRate || 0.05;
    }

    toJSON() {
        return {
            id: this.id,
            baseFrequency: this.baseFrequency,
            currentFrequency: this.currentFrequency,
            emotionalCoherence: this.emotionalCoherence,
            fieldRadius: this.fieldRadius,
            shortTermMemory: this.shortTermMemory,
            emotionalImprints: this.emotionalImprints,
            primaryDrive: this.primaryDrive,
            activeGoals: this.activeGoals,
            hiddenAgendas: this.hiddenAgendas,
            relationships: Array.from(this.relationships.entries()),
            lastUpdate: this.lastUpdate,
            baseEmotionalState: this.baseEmotionalState,
            emotionalModifiers: Array.from(this.emotionalModifiers.entries()),
            emotionalDecayRate: this.emotionalDecayRate
        };
    }

    // Map frequency bands to practical emotional states
    getCurrentEmotionalState() {
        const freq = this.currentFrequency;
        let baseEmotion;
        
        // Practical emotion mapping with content as baseline
        if (freq < 5) baseEmotion = { primary: 'tired', secondary: 'cautious', energy: 0.4 };
        else if (freq < 8) baseEmotion = { primary: 'content', secondary: 'stable', energy: 0.6 }; // Normal baseline
        else if (freq < 10) baseEmotion = { primary: 'alert', secondary: 'engaged', energy: 0.8 };
        else if (freq < 12) baseEmotion = { primary: 'energized', secondary: 'motivated', energy: 0.9 };
        else if (freq < 14) baseEmotion = { primary: 'excited', secondary: 'ambitious', energy: 1.0 };
        else baseEmotion = { primary: 'manic', secondary: 'reckless', energy: 1.2 }; // Dangerous high state
        
        // Apply temporary emotional modifiers
        const modifiedEmotion = this._applyEmotionalModifiers(baseEmotion);
        
        return {
            ...modifiedEmotion,
            intensity: this._calculateEmotionalIntensity(),
            coherence: this.emotionalCoherence,
            frequency: this.currentFrequency
        };
    }

    // Apply emotional events that temporarily shift the character's state
    applyEmotionalEvent(eventType, intensity, duration = 60) {
        // Parameter validation
        intensity = Math.max(0, Math.min(1.0, intensity)); // Clamp intensity to 0-1 range
        duration = Math.max(1, duration); // Minimum 1 minute duration
        
        const emotionalShift = this._calculateEmotionalShift(eventType, intensity);
        
        this.emotionalModifiers.set(eventType, {
            shift: emotionalShift,
            intensity: intensity,
            type: eventType,
            startTime: Date.now(),
            duration: duration * 60000, // Convert to milliseconds
            decayRate: this.emotionalDecayRate
        });
        
        // Record emotional imprint with enhanced memory context
        const emotionalImprint = {
            eventType,
            intensity,
            timestamp: Date.now(),
            frequencyBefore: this.currentFrequency,
            frequencyAfter: this.currentFrequency, // No change to frequency
            emotionalShift: emotionalShift
        };
        
        this.emotionalImprints.push(emotionalImprint);
        
        // Return the emotional imprint for potential memory enhancement
        return emotionalImprint;
    }
    
    /**
     * Create emotional memory for a character with current emotional state
     * This integrates with the MemoryService for enhanced memory formation
     */
    createEmotionalMemoryForCharacter(character, event) {
        const currentEmotionalState = this.getCurrentEmotionalState();
        
        // Use EmotionalUtils to create enhanced memory
        try {
            // Dynamic import to avoid circular dependencies
            import('../../shared/utils/EmotionalUtils.js').then(module => {
                const enhancedMemory = module.enhanceMemoryWithEmotion(character, event, currentEmotionalState);
                return enhancedMemory;
            });
        } catch (error) {
            console.warn('Could not enhance memory with emotional context:', error);
            // Fallback to basic memory storage
            if (!character.decisionHistory) {
                character.decisionHistory = [];
            }
            character.decisionHistory.push({
                ...event,
                emotionalContext: {
                    state: currentEmotionalState.primary,
                    intensity: currentEmotionalState.intensity,
                    frequency: currentEmotionalState.frequency
                }
            });
        }
    }
    
    /**
     * Retrieve emotionally relevant memories for current state
     */
    getEmotionallyRelevantMemories(character, maxResults = 5) {
        const currentEmotionalState = this.getCurrentEmotionalState();
        
        try {
            // Dynamic import to avoid circular dependencies
            import('../../shared/utils/EmotionalUtils.js').then(module => {
                return module.retrieveEmotionalMemories(character, currentEmotionalState, maxResults);
            });
        } catch (error) {
            console.warn('Could not retrieve emotional memories:', error);
            return [];
        }
    }

    // Define how different events affect emotional state
    _calculateEmotionalShift(eventType, intensity) {
        const emotionalEvents = {
            // Positive events
            'success': { 
                primary: 'proud', 
                secondary: 'confident', 
                frequencyDelta: +2 * intensity,
                energyModifier: 1.2 
            },
            'love': { 
                primary: 'joyful', 
                secondary: 'warm', 
                frequencyDelta: +1.5 * intensity,
                energyModifier: 1.1 
            },
            'friendship': { 
                primary: 'happy', 
                secondary: 'social', 
                frequencyDelta: +1 * intensity,
                energyModifier: 1.05 
            },
            'achievement': { 
                primary: 'satisfied', 
                secondary: 'motivated', 
                frequencyDelta: +1.5 * intensity,
                energyModifier: 1.15 
            },
            'discovery': { 
                primary: 'curious', 
                secondary: 'excited', 
                frequencyDelta: +1 * intensity,
                energyModifier: 1.1 
            },
            
            // Negative events
            'betrayal': { 
                primary: 'angry', 
                secondary: 'distrustful', 
                frequencyDelta: +0.5 * intensity, // Anger can increase frequency
                energyModifier: 0.9 
            },
            'loss': { 
                primary: 'sad', 
                secondary: 'withdrawn', 
                frequencyDelta: -2 * intensity,
                energyModifier: 0.7 
            },
            'failure': { 
                primary: 'disappointed', 
                secondary: 'doubtful', 
                frequencyDelta: -1.5 * intensity,
                energyModifier: 0.8 
            },
            'conflict': { 
                primary: 'stressed', 
                secondary: 'aggressive', 
                frequencyDelta: +1 * intensity, // Stress increases frequency
                energyModifier: 0.9 
            },
            'fear': { 
                primary: 'anxious', 
                secondary: 'cautious', 
                frequencyDelta: -1 * intensity,
                energyModifier: 0.8 
            },
            'embarrassment': { 
                primary: 'ashamed', 
                secondary: 'withdrawn', 
                frequencyDelta: -1 * intensity,
                energyModifier: 0.85 
            }
        };
        
        return emotionalEvents[eventType] || { 
            primary: 'neutral', 
            secondary: 'stable', 
            frequencyDelta: 0,
            energyModifier: 1.0 
        };
    }

    // Apply active emotional modifiers to base emotion
    _applyEmotionalModifiers(baseEmotion) {
        let modifiedEmotion = { ...baseEmotion };
        
        // Collect all active emotional modifiers
        const activeEmotions = [];
        
        // Add base emotion as starting point
        activeEmotions.push({
            primary: baseEmotion.primary,
            intensity: 0.5, // Base emotion has moderate intensity
            duration: Infinity // Base emotion is persistent
        });
        
        // Add all active modifiers as separate emotions
        this.emotionalModifiers.forEach((modifier, eventType) => {
            if (modifier.intensity > 0.1) { // Only include significant modifiers
                activeEmotions.push({
                    primary: modifier.shift.primary,
                    secondary: modifier.shift.secondary,
                    intensity: modifier.intensity,
                    duration: modifier.duration,
                    energy: modifier.shift.energyModifier
                });
            }
        });
        
        // Simple conflict detection for basic cases
        if (activeEmotions.length > 1) {
            const emotions = activeEmotions.map(e => e.primary);
            
            // Check for basic conflict patterns
            if (emotions.includes('joyful') && emotions.includes('sad')) {
                modifiedEmotion.primary = 'bittersweet';
                modifiedEmotion.isComplex = true;
                modifiedEmotion.description = 'Mixed feelings of joy and sadness';
                return modifiedEmotion;
            }
            
            if (emotions.includes('angry') && emotions.includes('content')) {
                modifiedEmotion.primary = 'conflicted';
                modifiedEmotion.isComplex = true;
                modifiedEmotion.description = 'Internal struggle between anger and contentment';
                return modifiedEmotion;
            }
            
            if (emotions.includes('excited') && emotions.includes('anxious')) {
                modifiedEmotion.primary = 'nervous_excitement';
                modifiedEmotion.isComplex = true;
                modifiedEmotion.description = 'Excited but with underlying anxiety';
                return modifiedEmotion;
            }
        }
        
        // Fallback to strongest modifier approach if no conflicts detected
        let strongestModifier = null;
        let maxIntensity = 0;
        
        this.emotionalModifiers.forEach((modifier, eventType) => {
            if (modifier.intensity > maxIntensity) {
                maxIntensity = modifier.intensity;
                strongestModifier = modifier;
            }
        });
        
        // If we have a strong emotional modifier, override the base emotion
        if (strongestModifier && maxIntensity > 0.3) {
            modifiedEmotion.primary = strongestModifier.shift.primary;
            modifiedEmotion.secondary = strongestModifier.shift.secondary;
            modifiedEmotion.energy *= strongestModifier.shift.energyModifier;
        }
        
        return modifiedEmotion;
    }

    // Calculate overall emotional intensity based on coherence and active modifiers
    _calculateEmotionalIntensity() {
        // Base intensity from coherence
        let intensity = this.emotionalCoherence;
        
        // Add modifier intensities
        this.emotionalModifiers.forEach(modifier => {
            intensity += modifier.intensity * 0.3; // Modifiers have less impact than base coherence
        });
        
        return Math.min(1.0, Math.max(0.0, intensity)); // Ensure 0-1 range
    }

    // Update and decay emotional modifiers over time
    updateEmotionalState() {
        const now = Date.now();
        const expiredModifiers = [];
        
        this.emotionalModifiers.forEach((modifier, eventType) => {
            const elapsed = now - modifier.startTime;
            
            if (elapsed >= modifier.duration) {
                expiredModifiers.push(eventType);
            } else {
                // Decay the modifier over time
                const decayFactor = Math.exp(-modifier.decayRate * elapsed / modifier.duration);
                modifier.intensity *= decayFactor;
                
                // If intensity is very low, mark for removal
                if (modifier.intensity < 0.1) {
                    expiredModifiers.push(eventType);
                }
            }
        });
        
        // Remove expired modifiers and adjust frequency back toward baseline
        expiredModifiers.forEach(eventType => {
            const modifier = this.emotionalModifiers.get(eventType);
            this.currentFrequency -= modifier.shift.frequencyDelta * modifier.intensity;
            this.emotionalModifiers.delete(eventType);
        });
        
        // Drift frequency back toward baseline
        const driftRate = 0.1;
        const driftDirection = this.baseFrequency - this.currentFrequency;
        this.currentFrequency += driftDirection * driftRate;
        
        this.lastUpdate = Date.now();
    }
}

class CollectiveConsciousness {
    constructor(config) {
        this.id = config.id;
        this.collectiveFrequency = config.collectiveFrequency || 7.5;
        this.sharedMemories = config.sharedMemories || [];
        this.currentEvents = config.currentEvents || [];
        this.mood = config.mood || 'neutral';
        this.members = config.members || new Set();
        this.lastUpdate = Date.now();
    }

    toJSON() {
        return {
            id: this.id,
            collectiveFrequency: this.collectiveFrequency,
            sharedMemories: this.sharedMemories,
            currentEvents: this.currentEvents,
            mood: this.mood,
            members: Array.from(this.members),
            lastUpdate: this.lastUpdate
        };
    }
}

class ConsciousnessSystem {
    constructor() {
        this.consciousnessStates = new Map();
        this.collectives = new Map();
        this.goalTypes = {
            survival: { minFreq: 3, maxFreq: 5 },
            social: { minFreq: 6, maxFreq: 8 },
            achievement: { minFreq: 9, maxFreq: 12 },
            transcendent: { minFreq: 13, maxFreq: 20 }
        };
    }

    // Individual Consciousness Management
    createConsciousnessState(id, config) {
        if (this.consciousnessStates.has(id)) {
            throw new Error(`Consciousness state with ID ${id} already exists`);
        }
        const state = new ConsciousnessState({ id, ...config });
        this.consciousnessStates.set(id, state);
        return state;
    }

    getConsciousnessState(id) {
        return this.consciousnessStates.get(id);
    }

    getAllConsciousnessStates() {
        return Array.from(this.consciousnessStates.values());
    }

    updateConsciousnessState(id, config) {
        const state = this.getConsciousnessState(id);
        if (!state) {
            throw new Error(`Consciousness state with ID ${id} not found`);
        }
        Object.assign(state, config);
        state.lastUpdate = Date.now();
        return state;
    }

    deleteConsciousnessState(id) {
        return this.consciousnessStates.delete(id);
    }

    // Collective Consciousness Management
    createCollective(id, config) {
        if (this.collectives.has(id)) {
            throw new Error(`Collective with ID ${id} already exists`);
        }
        const collective = new CollectiveConsciousness({ id, ...config });
        this.collectives.set(id, collective);
        return collective;
    }

    getCollective(id) {
        return this.collectives.get(id);
    }

    getAllCollectives() {
        return Array.from(this.collectives.values());
    }

    updateCollective(id, config) {
        const collective = this.getCollective(id);
        if (!collective) {
            throw new Error(`Collective with ID ${id} not found`);
        }
        Object.assign(collective, config);
        collective.lastUpdate = Date.now();
        return collective;
    }

    deleteCollective(id) {
        return this.collectives.delete(id);
    }

    addMemberToCollective(collectiveId, memberId) {
        const collective = this.getCollective(collectiveId);
        if (!collective) {
            throw new Error(`Collective with ID ${collectiveId} not found`);
        }
        collective.members.add(memberId);
        return true;
    }

    removeMemberFromCollective(collectiveId, memberId) {
        const collective = this.getCollective(collectiveId);
        if (!collective) {
            throw new Error(`Collective with ID ${collectiveId} not found`);
        }
        return collective.members.delete(memberId);
    }

    // Goal Management
    addGoal(id, goal, type) {
        const state = this.getConsciousnessState(id);
        if (!state) {
            throw new Error(`No consciousness state found for ${id}`);
        }

        const goalType = this.goalTypes[type];
        if (!goalType) {
            throw new Error(`Invalid goal type: ${type}`);
        }

        if (state.currentFrequency >= goalType.minFreq && 
            state.currentFrequency <= goalType.maxFreq) {
            state.activeGoals.push(goal);
            return true;
        }
        return false;
    }

    removeGoal(id, goal) {
        const state = this.getConsciousnessState(id);
        if (!state) {
            throw new Error(`No consciousness state found for ${id}`);
        }

        const index = state.activeGoals.indexOf(goal);
        if (index > -1) {
            state.activeGoals.splice(index, 1);
            return true;
        }
        return false;
    }

    // Relationship Management
    updateRelationship(id, targetId, relationship) {
        const state = this.getConsciousnessState(id);
        if (!state) {
            throw new Error(`Consciousness state with ID ${id} not found`);
        }
        state.relationships.set(targetId, relationship);
        return true;
    }

    // Memory Management
    addMemoryToState(stateId, memory) {
        const state = this.getConsciousnessState(stateId);
        if (!state) {
            throw new Error(`Consciousness state with ID ${stateId} not found`);
        }
        state.shortTermMemory.push(memory);
        return true;
    }

    addEmotionalImprint(stateId, imprint) {
        const state = this.getConsciousnessState(stateId);
        if (!state) {
            throw new Error(`Consciousness state with ID ${stateId} not found`);
        }
        state.emotionalImprints.push(imprint);
        return true;
    }

    // Frequency and Coherence Management
    updateFrequency(id, newFrequency) {
        const state = this.getConsciousnessState(id);
        if (!state) {
            throw new Error(`Consciousness state with ID ${id} not found`);
        }
        state.currentFrequency = newFrequency;
        return true;
    }

    updateCoherence(id, newCoherence) {
        const state = this.getConsciousnessState(id);
        if (!state) {
            throw new Error(`Consciousness state with ID ${id} not found`);
        }
        state.emotionalCoherence = newCoherence;
        return true;
    }

    updateFieldRadius(id, newRadius) {
        const state = this.getConsciousnessState(id);
        if (!state) {
            throw new Error(`Consciousness state with ID ${id} not found`);
        }
        state.fieldRadius = newRadius;
        return true;
    }

    // Collective Influence
    updateCollectiveMood(collectiveId, event) {
        const collective = this.getCollective(collectiveId);
        if (!collective) {
            throw new Error(`Collective with ID ${collectiveId} not found`);
        }

        // Update collective frequency based on event
        const frequencyChange = this.calculateEventImpact(event);
        collective.collectiveFrequency += frequencyChange;
        collective.collectiveFrequency = Math.max(0, Math.min(20, collective.collectiveFrequency));

        // Update mood based on frequency
        collective.mood = this.determineMood(collective.collectiveFrequency);

        // Add event to shared memories
        collective.currentEvents.push({
            ...event,
            timestamp: Date.now()
        });

        // Update member frequencies
        for (const memberId of collective.members) {
            const state = this.getConsciousnessState(memberId);
            if (state) {
                // Members' frequencies drift toward collective
                const drift = (collective.collectiveFrequency - state.currentFrequency) * 0.1;
                this.updateFrequency(memberId, state.currentFrequency + drift);
            }
        }

        return collective;
    }

    calculateEventImpact(event) {
        // Implement event impact calculation based on event type and magnitude
        return 0; // Placeholder
    }

    determineMood(frequency) {
        if (frequency < 4) return 'depressed';
        if (frequency < 7) return 'neutral';
        if (frequency < 10) return 'hopeful';
        if (frequency < 13) return 'excited';
        return 'ecstatic';
    }

    // Data Persistence
    toJSON() {
        return {
            consciousnessStates: Array.from(this.consciousnessStates.entries()).map(([id, state]) => state.toJSON()),
            collectives: Array.from(this.collectives.entries()).map(([id, collective]) => collective.toJSON())
        };
    }

    fromJSON(data) {
        // Clear existing data
        this.consciousnessStates.clear();
        this.collectives.clear();

        // Restore consciousness states
        if (data.consciousnessStates) {
            data.consciousnessStates.forEach(stateData => {
                const state = new ConsciousnessState(stateData);
                this.consciousnessStates.set(state.id, state);
            });
        }

        // Restore collectives
        if (data.collectives) {
            data.collectives.forEach(collectiveData => {
                const collective = new CollectiveConsciousness(collectiveData);
                this.collectives.set(collective.id, collective);
            });
        }

        return this;
    }

    // Persistence methods for localStorage
    saveToLocalStorage(key = 'consciousnessSystem') {
        try {
            const data = this.toJSON();
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save ConsciousnessSystem to localStorage:', error);
            return false;
        }
    }

    static loadFromLocalStorage(key = 'consciousnessSystem') {
        try {
            const data = localStorage.getItem(key);
            if (!data) {
                return null;
            }
            return ConsciousnessSystem.fromJSON(JSON.parse(data));
        } catch (error) {
            console.error('Failed to load ConsciousnessSystem from localStorage:', error);
            return null;
        }
    }

    clearLocalStorage(key = 'consciousnessSystem') {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to clear ConsciousnessSystem from localStorage:', error);
            return false;
        }
    }
}

// Export consciousness state type definition
export const ConsciousnessStateType = {
  currentFrequency: { min: 0, max: 100, weight: 1 },
  emotionalCoherence: { min: 0, max: 100, weight: 1 },
  awarenessLevel: { min: 0, max: 100, weight: 1 },
  stability: { min: 0, max: 100, weight: 1 },
  resonance: { min: 0, max: 100, weight: 1 }
};

export default ConsciousnessSystem;