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
            lastUpdate: this.lastUpdate
        };
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