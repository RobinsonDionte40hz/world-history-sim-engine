/**
 * Tests for ConsciousnessCheckpointService
 * 
 * Comprehensive test suite covering checkpoint creation, restoration,
 * maintenance, and error handling scenarios.
 */

import ConsciousnessCheckpointService from '../ConsciousnessCheckpointService.js';

describe('ConsciousnessCheckpointService', () => {
  // Test data setup
  const createMockNPC = (id, overrides = {}) => ({
    id,
    consciousness: {
      baseFrequency: 8.0,
      baseCoherence: 0.75,
      behavioralState: {
        energy: 'moderate',
        focus: 'balanced',
        mood: 'content',
        socialDrive: 0.6,
        riskTolerance: 0.5,
        ambition: 0.7
      },
      significantEvents: [
        {
          type: 'goal_completion',
          significance: 0.8,
          timestamp: Date.now() - 1000,
          outcome: 'success'
        }
      ],
      lastUpdate: Date.now() - 500,
      updateTriggerThreshold: 0.3
    },
    goals: [
      { id: 'goal1', type: 'advancement', priority: 1 }
    ],
    significantMemories: [
      {
        id: 'mem1',
        interactionType: 'social',
        significance: 0.6,
        timestamp: Date.now() - 2000
      }
    ],
    ...overrides
  });

  const createMockWorldState = (npcs = []) => ({
    npcs
  });

  describe('saveCheckpoint', () => {
    test('should create checkpoint with all NPC consciousness states', () => {
      const npc1 = createMockNPC('npc1');
      const npc2 = createMockNPC('npc2', {
        consciousness: {
          ...npc1.consciousness,
          baseFrequency: 9.5,
          baseCoherence: 0.8
        }
      });
      const worldState = createMockWorldState([npc1, npc2]);

      const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);

      expect(checkpoint).toHaveProperty('timestamp');
      expect(checkpoint).toHaveProperty('version', '2.0');
      expect(checkpoint.characterStates).toBeInstanceOf(Map);
      expect(checkpoint.characterStates.size).toBe(2);
      
      const npc1State = checkpoint.characterStates.get('npc1');
      expect(npc1State.baseFrequency).toBe(8.0);
      expect(npc1State.baseCoherence).toBe(0.75);
      expect(npc1State.behavioralState).toEqual(npc1.consciousness.behavioralState);
      expect(npc1State.significantEvents).toHaveLength(1);
      expect(npc1State.activeGoals).toHaveLength(1);
      expect(npc1State.significantMemories).toHaveLength(1);
    });

    test('should limit significant events to last 10', () => {
      const events = Array.from({ length: 15 }, (_, i) => ({
        type: 'test_event',
        significance: 0.5,
        timestamp: Date.now() - (15 - i) * 1000
      }));
      
      const npc = createMockNPC('npc1', {
        consciousness: {
          ...createMockNPC('npc1').consciousness,
          significantEvents: events
        }
      });
      const worldState = createMockWorldState([npc]);

      const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);
      const npcState = checkpoint.characterStates.get('npc1');

      expect(npcState.significantEvents).toHaveLength(10);
      // Should keep the most recent events (last 10 from the array)
      expect(npcState.significantEvents[9].timestamp).toBeGreaterThan(
        npcState.significantEvents[0].timestamp
      );
    });

    test('should limit significant memories to last 20', () => {
      const memories = Array.from({ length: 25 }, (_, i) => ({
        id: `mem${i}`,
        interactionType: 'test',
        significance: 0.5,
        timestamp: Date.now() - (25 - i) * 1000
      }));
      
      const npc = createMockNPC('npc1', {
        significantMemories: memories
      });
      const worldState = createMockWorldState([npc]);

      const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);
      const npcState = checkpoint.characterStates.get('npc1');

      expect(npcState.significantMemories).toHaveLength(20);
      // Should keep the most recent memories (last 20 from the array)
      expect(npcState.significantMemories[19].timestamp).toBeGreaterThan(
        npcState.significantMemories[0].timestamp
      );
    });

    test('should handle NPCs with missing consciousness gracefully', () => {
      const npc = { id: 'npc1' }; // No consciousness property
      const worldState = createMockWorldState([npc]);

      expect(() => {
        ConsciousnessCheckpointService.saveCheckpoint(worldState);
      }).not.toThrow();
    });

    test('should handle NPCs with missing ID', () => {
      const npc = createMockNPC('npc1');
      delete npc.id;
      const worldState = createMockWorldState([npc]);

      const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);
      expect(checkpoint.characterStates.size).toBe(0);
    });

    test('should throw error for invalid world state', () => {
      expect(() => {
        ConsciousnessCheckpointService.saveCheckpoint(null);
      }).toThrow('Invalid world state provided for checkpoint');

      expect(() => {
        ConsciousnessCheckpointService.saveCheckpoint({});
      }).toThrow('Invalid world state provided for checkpoint');
    });
  });

  describe('restoreCheckpoint', () => {
    test('should restore all NPC consciousness states', () => {
      const npc1 = createMockNPC('npc1');
      const npc2 = createMockNPC('npc2');
      const worldState = createMockWorldState([npc1, npc2]);

      // Create checkpoint
      const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);
      
      // Modify NPCs
      npc1.consciousness.baseFrequency = 5.0;
      npc2.consciousness.baseCoherence = 0.3;

      // Restore
      const result = ConsciousnessCheckpointService.restoreCheckpoint(worldState, checkpoint);

      expect(result.success).toBe(true);
      expect(result.restoredCount).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(npc1.consciousness.baseFrequency).toBe(8.0);
      expect(npc2.consciousness.baseCoherence).toBe(0.75);
    });

    test('should regenerate behavioral state if corrupted', () => {
      const npc = createMockNPC('npc1');
      const worldState = createMockWorldState([npc]);
      const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);

      // Corrupt behavioral state in checkpoint
      checkpoint.characterStates.get('npc1').behavioralState = null;

      const result = ConsciousnessCheckpointService.restoreCheckpoint(worldState, checkpoint);

      expect(result.success).toBe(true);
      expect(npc.consciousness.behavioralState).toBeDefined();
      expect(npc.consciousness.behavioralState.energy).toBeDefined();
      expect(npc.consciousness.behavioralState.mood).toBeDefined();
    });

    test('should handle missing NPCs in world state', () => {
      const npc = createMockNPC('npc1');
      const worldState = createMockWorldState([npc]);
      const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);

      // Add extra NPC to checkpoint that doesn't exist in world
      checkpoint.characterStates.set('missing_npc', {
        baseFrequency: 7.5,
        baseCoherence: 0.7,
        behavioralState: {},
        significantEvents: [],
        lastUpdate: Date.now(),
        updateTriggerThreshold: 0.3,
        activeGoals: [],
        significantMemories: []
      });

      const result = ConsciousnessCheckpointService.restoreCheckpoint(worldState, checkpoint);

      expect(result.success).toBe(false);
      expect(result.restoredCount).toBe(1);
      expect(result.failedCount).toBe(1);
      expect(result.errors).toContain('NPC missing_npc not found in world state');
    });

    test('should validate and clamp consciousness parameters', () => {
      const npc = createMockNPC('npc1');
      const worldState = createMockWorldState([npc]);
      const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);

      // Set invalid values in checkpoint
      const npcState = checkpoint.characterStates.get('npc1');
      npcState.baseFrequency = 20; // Above max (15)
      npcState.baseCoherence = -0.5; // Below min (0.2)

      ConsciousnessCheckpointService.restoreCheckpoint(worldState, checkpoint);

      expect(npc.consciousness.baseFrequency).toBe(15); // Clamped to max
      expect(npc.consciousness.baseCoherence).toBe(0.2); // Clamped to min
    });

    test('should throw error for invalid inputs', () => {
      const worldState = createMockWorldState([]);

      expect(() => {
        ConsciousnessCheckpointService.restoreCheckpoint(null, {});
      }).toThrow('Invalid world state provided for restoration');

      expect(() => {
        ConsciousnessCheckpointService.restoreCheckpoint(worldState, null);
      }).toThrow('Invalid checkpoint data provided');

      expect(() => {
        ConsciousnessCheckpointService.restoreCheckpoint(worldState, {});
      }).toThrow('Invalid checkpoint data provided');
    });
  });

  describe('performMaintenance', () => {
    test('should prune old events and memories', () => {
      const events = Array.from({ length: 30 }, (_, i) => ({
        type: 'test_event',
        significance: 0.5,
        timestamp: Date.now() - i * 1000
      }));
      
      const memories = Array.from({ length: 60 }, (_, i) => ({
        id: `mem${i}`,
        interactionType: 'test',
        significance: 0.5,
        timestamp: Date.now() - i * 1000
      }));

      const npc = createMockNPC('npc1', {
        consciousness: {
          ...createMockNPC('npc1').consciousness,
          significantEvents: events
        },
        significantMemories: memories
      });
      const worldState = createMockWorldState([npc]);

      const result = ConsciousnessCheckpointService.performMaintenance(worldState);

      expect(result.processedNPCs).toBe(1);
      expect(result.prunedEvents).toBe(10); // 30 - 20 = 10
      expect(result.prunedMemories).toBe(10); // 60 - 50 = 10
      expect(npc.consciousness.significantEvents).toHaveLength(20);
      expect(npc.significantMemories).toHaveLength(50);
    });

    test('should apply baseline drift for inactive NPCs', () => {
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      const npc = createMockNPC('npc1', {
        consciousness: {
          ...createMockNPC('npc1').consciousness,
          baseFrequency: 12.0, // High frequency
          baseCoherence: 0.9,   // High coherence
          lastUpdate: Date.now() - (oneWeek * 2) // 2 weeks ago
        }
      });
      const worldState = createMockWorldState([npc]);

      const originalFreq = npc.consciousness.baseFrequency;
      const originalCoh = npc.consciousness.baseCoherence;

      const result = ConsciousnessCheckpointService.performMaintenance(worldState);

      expect(result.driftedNPCs).toBe(1);
      // Should drift toward baseline (7.5, 0.7)
      expect(npc.consciousness.baseFrequency).toBeLessThan(originalFreq);
      expect(npc.consciousness.baseCoherence).toBeLessThan(originalCoh);
      expect(npc.consciousness.lastUpdate).toBeGreaterThan(Date.now() - 1000);
    });

    test('should not drift recently active NPCs', () => {
      const npc = createMockNPC('npc1', {
        consciousness: {
          ...createMockNPC('npc1').consciousness,
          baseFrequency: 12.0,
          baseCoherence: 0.9,
          lastUpdate: Date.now() - 1000 // 1 second ago
        }
      });
      const worldState = createMockWorldState([npc]);

      const originalFreq = npc.consciousness.baseFrequency;
      const originalCoh = npc.consciousness.baseCoherence;

      const result = ConsciousnessCheckpointService.performMaintenance(worldState);

      expect(result.driftedNPCs).toBe(0);
      expect(npc.consciousness.baseFrequency).toBe(originalFreq);
      expect(npc.consciousness.baseCoherence).toBe(originalCoh);
    });

    test('should handle NPCs without consciousness', () => {
      const npc = { id: 'npc1' }; // No consciousness
      const worldState = createMockWorldState([npc]);

      expect(() => {
        ConsciousnessCheckpointService.performMaintenance(worldState);
      }).not.toThrow();
    });

    test('should throw error for invalid world state', () => {
      expect(() => {
        ConsciousnessCheckpointService.performMaintenance(null);
      }).toThrow('Invalid world state provided for maintenance');
    });
  });

  describe('parameter validation', () => {
    test('should validate frequency parameters', () => {
      expect(ConsciousnessCheckpointService.validateFrequency(5)).toBe(5);
      expect(ConsciousnessCheckpointService.validateFrequency(2)).toBe(3); // Clamped to min
      expect(ConsciousnessCheckpointService.validateFrequency(20)).toBe(15); // Clamped to max
      expect(ConsciousnessCheckpointService.validateFrequency(NaN)).toBe(7.5); // Default
      expect(ConsciousnessCheckpointService.validateFrequency('invalid')).toBe(7.5); // Default
    });

    test('should validate coherence parameters', () => {
      expect(ConsciousnessCheckpointService.validateCoherence(0.5)).toBe(0.5);
      expect(ConsciousnessCheckpointService.validateCoherence(0.1)).toBe(0.2); // Clamped to min
      expect(ConsciousnessCheckpointService.validateCoherence(1.5)).toBe(1.0); // Clamped to max
      expect(ConsciousnessCheckpointService.validateCoherence(NaN)).toBe(0.7); // Default
      expect(ConsciousnessCheckpointService.validateCoherence('invalid')).toBe(0.7); // Default
    });

    test('should validate behavioral state objects', () => {
      const validState = {
        energy: 'moderate',
        focus: 'balanced',
        mood: 'content',
        socialDrive: 0.6,
        riskTolerance: 0.5,
        ambition: 0.7
      };

      expect(ConsciousnessCheckpointService.isValidBehavioralState(validState)).toBe(true);
      expect(ConsciousnessCheckpointService.isValidBehavioralState(null)).toBe(false);
      expect(ConsciousnessCheckpointService.isValidBehavioralState({})).toBe(false);
      expect(ConsciousnessCheckpointService.isValidBehavioralState({ energy: 'high' })).toBe(false);
    });
  });

  describe('behavioral state generation', () => {
    test('should generate behavioral state from parameters', () => {
      const state = ConsciousnessCheckpointService.generateBehavioralStateFromParameters(8.0, 0.75);

      expect(state).toHaveProperty('energy');
      expect(state).toHaveProperty('focus');
      expect(state).toHaveProperty('mood');
      expect(state).toHaveProperty('socialDrive');
      expect(state).toHaveProperty('riskTolerance');
      expect(state).toHaveProperty('ambition');

      expect(typeof state.socialDrive).toBe('number');
      expect(state.socialDrive).toBeGreaterThanOrEqual(0);
      expect(state.socialDrive).toBeLessThanOrEqual(1);
    });

    test('should map frequency to energy correctly', () => {
      expect(ConsciousnessCheckpointService.mapFrequencyToEnergy(4)).toBe('low');
      expect(ConsciousnessCheckpointService.mapFrequencyToEnergy(8)).toBe('moderate');
      expect(ConsciousnessCheckpointService.mapFrequencyToEnergy(12)).toBe('high');
    });

    test('should map coherence to focus correctly', () => {
      expect(ConsciousnessCheckpointService.mapCoherenceToFocus(0.3)).toBe('scattered');
      expect(ConsciousnessCheckpointService.mapCoherenceToFocus(0.6)).toBe('balanced');
      expect(ConsciousnessCheckpointService.mapCoherenceToFocus(0.9)).toBe('focused');
    });

    test('should calculate mood from frequency and coherence', () => {
      expect(ConsciousnessCheckpointService.calculateMoodFromState(4, 0.3)).toBe('depressed');
      expect(ConsciousnessCheckpointService.calculateMoodFromState(6, 0.5)).toBe('content');
      expect(ConsciousnessCheckpointService.calculateMoodFromState(7, 0.6)).toBe('optimistic');
      expect(ConsciousnessCheckpointService.calculateMoodFromState(10, 0.8)).toBe('excited');
      expect(ConsciousnessCheckpointService.calculateMoodFromState(14, 0.9)).toBe('excited');
    });

    test('should generate default behavioral state', () => {
      const defaultState = ConsciousnessCheckpointService.generateDefaultBehavioralState();

      expect(defaultState.energy).toBe('moderate');
      expect(defaultState.focus).toBe('balanced');
      expect(defaultState.mood).toBe('content');
      expect(defaultState.socialDrive).toBe(0.6);
      expect(defaultState.riskTolerance).toBe(0.5);
      expect(defaultState.ambition).toBe(0.7);
    });
  });

  describe('integration scenarios', () => {
    test('should handle complete save/restore cycle', () => {
      const npc1 = createMockNPC('npc1');
      const npc2 = createMockNPC('npc2');
      const worldState = createMockWorldState([npc1, npc2]);

      // Save checkpoint
      const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);

      // Modify world state
      npc1.consciousness.baseFrequency = 5.0;
      npc2.consciousness.behavioralState.mood = 'excited';

      // Restore checkpoint
      const result = ConsciousnessCheckpointService.restoreCheckpoint(worldState, checkpoint);

      expect(result.success).toBe(true);
      expect(npc1.consciousness.baseFrequency).toBe(8.0);
      expect(npc2.consciousness.behavioralState.mood).toBe('content');
    });

    test('should handle maintenance after multiple operations', () => {
      const npc = createMockNPC('npc1');
      const worldState = createMockWorldState([npc]);

      // Add many events and memories
      npc.consciousness.significantEvents = Array.from({ length: 50 }, (_, i) => ({
        type: 'test',
        significance: 0.5,
        timestamp: Date.now() - i * 1000
      }));

      npc.significantMemories = Array.from({ length: 100 }, (_, i) => ({
        id: `mem${i}`,
        significance: 0.5,
        timestamp: Date.now() - i * 1000
      }));

      // Perform maintenance
      const result = ConsciousnessCheckpointService.performMaintenance(worldState);

      expect(result.prunedEvents).toBeGreaterThan(0);
      expect(result.prunedMemories).toBeGreaterThan(0);
      expect(npc.consciousness.significantEvents.length).toBeLessThanOrEqual(20);
      expect(npc.significantMemories.length).toBeLessThanOrEqual(50);
    });
  });
});