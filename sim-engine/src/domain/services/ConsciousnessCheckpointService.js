import BaseDomainService from './BaseDomainService.js';
import EventSignificanceService from './EventSignificanceService.js';
import ConsciousnessMigrationService from './ConsciousnessMigrationService.js';

/**
 * ConsciousnessCheckpointService
 * 
 * Handles state persistence and restoration for consciousness states to ensure
 * behavioral continuity across sessions. Provides checkpoint creation, restoration,
 * and maintenance functionality with graceful error handling.
 * 
 * Key Features:
 * - Complete consciousness state persistence
 * - Graceful recovery from corrupted states
 * - Automatic maintenance and cleanup
 * - Baseline drift for inactive characters
 */

class ConsciousnessCheckpointService {
  /**
   * Create a comprehensive checkpoint of all consciousness states
   * @param {Object} worldState - The current world state containing NPCs
   * @returns {Object} Checkpoint data structure
   */
  static saveCheckpoint(worldState) {
    if (!worldState || !worldState.npcs) {
      throw new Error('Invalid world state provided for checkpoint');
    }

    const checkpoint = {
      timestamp: Date.now(),
      version: '2.0',
      characterStates: new Map()
    };

    // Process each NPC and capture their consciousness state
    worldState.npcs.forEach(npc => {
      if (!npc.id) {
        console.warn('NPC missing ID, skipping checkpoint save');
        return;
      }

      try {
        const consciousnessState = this.extractConsciousnessState(npc);
        checkpoint.characterStates.set(npc.id, consciousnessState);
      } catch (error) {
        console.error(`Failed to save consciousness state for NPC ${npc.id}:`, error);
        // Continue with other NPCs even if one fails
      }
    });

    return checkpoint;
  }

  /**
   * Extract consciousness state data from an NPC
   * @param {Object} npc - The NPC to extract state from
   * @returns {Object} Consciousness state data
   */
  static extractConsciousnessState(npc) {
    const consciousness = npc.consciousness;
    
    if (!consciousness) {
      throw new Error(`NPC ${npc.id} missing consciousness system`);
    }

    return {
      baseFrequency: consciousness.baseFrequency || 7.5,
      baseCoherence: consciousness.baseCoherence || 0.7,
      behavioralState: consciousness.behavioralState ? 
        { ...consciousness.behavioralState } : 
        this.generateDefaultBehavioralState(),
      significantEvents: consciousness.significantEvents ? 
        [...consciousness.significantEvents.slice(-10)] : [],
      lastUpdate: consciousness.lastUpdate || Date.now(),
      updateTriggerThreshold: consciousness.updateTriggerThreshold || 0.3,
      activeGoals: npc.goals ? [...npc.goals] : [],
      significantMemories: npc.significantMemories ? 
        [...npc.significantMemories.slice(-20)] : []
    };
  }

  /**
   * Restore consciousness states from checkpoint data
   * @param {Object} worldState - The world state to restore into
   * @param {Object} checkpoint - The checkpoint data to restore from
   * @returns {Object} Restoration result with success/failure details
   */
  static restoreCheckpoint(worldState, checkpoint) {
    if (!worldState || !worldState.npcs) {
      throw new Error('Invalid world state provided for restoration');
    }

    if (!checkpoint || !checkpoint.characterStates) {
      throw new Error('Invalid checkpoint data provided');
    }

    const result = {
      success: true,
      restoredCount: 0,
      failedCount: 0,
      errors: []
    };

    // Process each character state in the checkpoint
    checkpoint.characterStates.forEach((state, npcId) => {
      try {
        const npc = worldState.npcs.find(n => n.id === npcId);
        
        if (!npc) {
          result.errors.push(`NPC ${npcId} not found in world state`);
          result.failedCount++;
          result.success = false;
          return;
        }

        this.restoreNPCConsciousnessState(npc, state);
        result.restoredCount++;
        
      } catch (error) {
        result.errors.push(`Failed to restore NPC ${npcId}: ${error.message}`);
        result.failedCount++;
        result.success = false;
      }
    });

    return result;
  }

  /**
   * Restore consciousness state for a single NPC
   * @param {Object} npc - The NPC to restore state into
   * @param {Object} state - The consciousness state data
   */
  static restoreNPCConsciousnessState(npc, state) {
    // Initialize consciousness if missing
    if (!npc.consciousness) {
      npc.consciousness = {};
    }

    // Migrate consciousness state data if needed
    const migrationService = new ConsciousnessMigrationService();
    const migrationResult = migrationService.migrateConsciousnessData(state, { repairCorrupted: true });

    if (migrationResult.migrated) {
      console.log(`Migrated consciousness state for NPC ${npc.id} from ${migrationResult.fromVersion} to ${migrationResult.toVersion}`);
    }

    const migratedState = migrationResult.data;

    // Restore consciousness parameters with validation
    npc.consciousness.baseFrequency = this.validateFrequency(migratedState.baseFrequency);
    npc.consciousness.baseCoherence = this.validateCoherence(migratedState.baseCoherence);
    
    // Restore or regenerate behavioral state
    if (migratedState.behavioralState && this.isValidBehavioralState(migratedState.behavioralState)) {
      npc.consciousness.behavioralState = { ...migratedState.behavioralState };
    } else {
      // Regenerate behavioral state from consciousness parameters
      npc.consciousness.behavioralState = this.generateBehavioralStateFromParameters(
        npc.consciousness.baseFrequency,
        npc.consciousness.baseCoherence
      );
    }

    // Restore event history and metadata
    npc.consciousness.significantEvents = migratedState.significantEvents || [];
    npc.consciousness.lastUpdate = migratedState.lastUpdate || Date.now();
    npc.consciousness.updateTriggerThreshold = migratedState.updateTriggerThreshold || 0.3;

    // Restore goals and memories
    npc.goals = migratedState.activeGoals || [];
    npc.significantMemories = migratedState.significantMemories || [];
  }

  /**
   * Perform periodic maintenance on consciousness states
   * @param {Object} worldState - The world state to maintain
   * @returns {Object} Maintenance result summary
   */
  static performMaintenance(worldState) {
    if (!worldState || !worldState.npcs) {
      throw new Error('Invalid world state provided for maintenance');
    }

    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    const result = {
      processedNPCs: 0,
      prunedEvents: 0,
      prunedMemories: 0,
      driftedNPCs: 0
    };

    worldState.npcs.forEach(npc => {
      if (!npc.consciousness) return;

      result.processedNPCs++;

      // Clean old events (keep last 20)
      const originalEventCount = npc.consciousness.significantEvents?.length || 0;
      if (npc.consciousness.significantEvents) {
        npc.consciousness.significantEvents = 
          npc.consciousness.significantEvents.slice(-20);
        result.prunedEvents += originalEventCount - npc.consciousness.significantEvents.length;
      }

      // Clean old memories (keep last 50)
      const originalMemoryCount = npc.significantMemories?.length || 0;
      if (npc.significantMemories) {
        npc.significantMemories = npc.significantMemories.slice(-50);
        result.prunedMemories += originalMemoryCount - npc.significantMemories.length;
      }

      // Apply baseline drift for inactive NPCs
      const timeSinceUpdate = now - (npc.consciousness.lastUpdate || now);
      if (timeSinceUpdate > oneWeek) {
        this.applyBaselineDrift(npc, timeSinceUpdate, oneWeek);
        result.driftedNPCs++;
      }
    });

    return result;
  }

  /**
   * Apply gradual drift toward baseline values for inactive characters
   * @param {Object} npc - The NPC to apply drift to
   * @param {number} timeSinceUpdate - Time since last consciousness update
   * @param {number} oneWeek - One week in milliseconds
   */
  static applyBaselineDrift(npc, timeSinceUpdate, oneWeek) {
    const driftFactor = Math.min(0.1, timeSinceUpdate / (oneWeek * 4));
    
    // Baseline values (7.5 Hz frequency, 0.7 coherence)
    const baselineFrequency = 7.5;
    const baselineCoherence = 0.7;
    
    // Calculate drift amounts
    const freqDrift = (baselineFrequency - npc.consciousness.baseFrequency) * driftFactor;
    const cohDrift = (baselineCoherence - npc.consciousness.baseCoherence) * driftFactor;
    
    // Apply drift
    npc.consciousness.baseFrequency += freqDrift;
    npc.consciousness.baseCoherence += cohDrift;
    
    // Ensure bounds are maintained
    npc.consciousness.baseFrequency = this.validateFrequency(npc.consciousness.baseFrequency);
    npc.consciousness.baseCoherence = this.validateCoherence(npc.consciousness.baseCoherence);
    
    // Regenerate behavioral state if significant drift occurred
    if (Math.abs(freqDrift) > 0.1 || Math.abs(cohDrift) > 0.01) {
      npc.consciousness.behavioralState = this.generateBehavioralStateFromParameters(
        npc.consciousness.baseFrequency,
        npc.consciousness.baseCoherence
      );
      npc.consciousness.lastUpdate = Date.now();
    }
  }

  /**
   * Validate frequency parameter and clamp to valid range
   * @param {number} frequency - The frequency value to validate
   * @returns {number} Valid frequency value (3-15 Hz)
   */
  static validateFrequency(frequency) {
    if (typeof frequency !== 'number' || isNaN(frequency)) {
      return 7.5; // Default frequency
    }
    return Math.max(3, Math.min(15, frequency));
  }

  /**
   * Validate coherence parameter and clamp to valid range
   * @param {number} coherence - The coherence value to validate
   * @returns {number} Valid coherence value (0.2-1.0)
   */
  static validateCoherence(coherence) {
    if (typeof coherence !== 'number' || isNaN(coherence)) {
      return 0.7; // Default coherence
    }
    return Math.max(0.2, Math.min(1.0, coherence));
  }

  /**
   * Check if behavioral state object is valid
   * @param {Object} behavioralState - The behavioral state to validate
   * @returns {boolean} True if valid, false otherwise
   */
  static isValidBehavioralState(behavioralState) {
    if (!behavioralState || typeof behavioralState !== 'object') {
      return false;
    }

    const requiredFields = ['energy', 'focus', 'mood', 'socialDrive', 'riskTolerance', 'ambition'];
    return requiredFields.every(field => behavioralState.hasOwnProperty(field));
  }

  /**
   * Generate default behavioral state
   * @returns {Object} Default behavioral state
   */
  static generateDefaultBehavioralState() {
    return {
      energy: 'moderate',
      focus: 'balanced',
      mood: 'content',
      socialDrive: 0.6,
      riskTolerance: 0.5,
      ambition: 0.7
    };
  }

  /**
   * Generate behavioral state from consciousness parameters
   * @param {number} frequency - Consciousness frequency (3-15 Hz)
   * @param {number} coherence - Consciousness coherence (0.2-1.0)
   * @returns {Object} Generated behavioral state
   */
  static generateBehavioralStateFromParameters(frequency, coherence) {
    return {
      energy: this.mapFrequencyToEnergy(frequency),
      focus: this.mapCoherenceToFocus(coherence),
      mood: this.calculateMoodFromState(frequency, coherence),
      socialDrive: Math.max(0, Math.min(1, (frequency - 4) / 8)),
      riskTolerance: Math.max(0, Math.min(1, (frequency - 6) / 6)),
      ambition: Math.max(0, Math.min(1, coherence * (frequency / 10)))
    };
  }

  /**
   * Map frequency to energy level
   * @param {number} frequency - Consciousness frequency
   * @returns {string} Energy level (low, moderate, high)
   */
  static mapFrequencyToEnergy(frequency) {
    if (frequency < 6) return 'low';
    if (frequency > 10) return 'high';
    return 'moderate';
  }

  /**
   * Map coherence to focus level
   * @param {number} coherence - Consciousness coherence
   * @returns {string} Focus level (scattered, balanced, focused)
   */
  static mapCoherenceToFocus(coherence) {
    if (coherence < 0.5) return 'scattered';
    if (coherence > 0.8) return 'focused';
    return 'balanced';
  }

  /**
   * Calculate mood from frequency and coherence
   * @param {number} frequency - Consciousness frequency
   * @param {number} coherence - Consciousness coherence
   * @returns {string} Mood state (depressed, content, optimistic, excited)
   */
  static calculateMoodFromState(frequency, coherence) {
    const moodScore = (frequency / 15) + (coherence * 0.5);
    
    if (moodScore < 0.5) return 'depressed';
    if (moodScore < 0.75) return 'content';
    if (moodScore < 1.0) return 'optimistic';
    return 'excited';
  }
}

module.exports = ConsciousnessCheckpointService;