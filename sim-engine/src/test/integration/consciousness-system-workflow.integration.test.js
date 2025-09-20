/**
 * Consciousness System Workflow Integration Tests
 * 
 * Comprehensive end-to-end tests for the complete consciousness system workflow,
 * including event-driven updates, cached behavioral states, memory integration,
 * and performance validation.
 */

import Character from '../../domain/entities/Character.js';
import ConsciousnessSystem from '../../domain/value-objects/ConsciousnessSystem.js';
import BehavioralStateService from '../../domain/services/BehavioralStateService.js';
import EventSignificanceService from '../../domain/services/EventSignificanceService.js';
import ConsciousnessUpdateService from '../../domain/services/ConsciousnessUpdateService.js';
import SignificantMemoryService from '../../domain/services/SignificantMemoryService.js';
import ConsciousnessCheckpointService from '../../domain/services/ConsciousnessCheckpointService.js';
import EfficientTurnProcessor from '../../domain/services/EfficientTurnProcessor.js';
import PerformanceMonitoringService from '../../domain/services/PerformanceMonitoringService.js';

describe('Consciousness System Workflow Integration', () => {
  let testCharacter;
  let worldState;
  let performanceMonitor;
  let behavioralStateService;
  let eventSignificanceService;
  let consciousnessUpdateService;
  let significantMemoryService;
  let consciousnessCheckpointService;

  beforeEach(() => {
    // Initialize services
    behavioralStateService = new BehavioralStateService();
    eventSignificanceService = new EventSignificanceService();
    consciousnessUpdateService = new ConsciousnessUpdateService();
    significantMemoryService = new SignificantMemoryService();
    consciousnessCheckpointService = new ConsciousnessCheckpointService();
    // Create test character with consciousness system
    testCharacter = new Character({
      id: 'test-char-001',
      name: 'Integration Test Character',
      consciousness: new ConsciousnessSystem({
        baseFrequency: 8.5,
        baseCoherence: 0.75
      }),
      personality: {
        traits: {
          empathy: 0.7,
          aggression: 0.3,
          patience: 0.8,
          ambition: 0.6,
          loyalty: 0.9,
          curiosity: 0.5
        }
      },
      attributes: {
        strength: { score: 12, modifier: 1 },
        dexterity: { score: 14, modifier: 2 },
        constitution: { score: 13, modifier: 1 },
        intelligence: { score: 16, modifier: 3 },
        wisdom: { score: 15, modifier: 2 },
        charisma: { score: 14, modifier: 2 }
      }
    });

    // Create minimal world state
    worldState = {
      characters: new Map([[testCharacter.id, testCharacter]]),
      nodes: new Map([
        ['test-node', {
          id: 'test-node',
          name: 'Test Location',
          type: 'settlement',
          assignedCharacters: [testCharacter.id]
        }]
      ]),
      interactions: new Map([
        ['test-interaction', {
          id: 'test-interaction',
          name: 'Test Action',
          type: 'social',
          requirements: [],
          effects: []
        }]
      ])
    };

    // Initialize performance monitoring
    performanceMonitor = new PerformanceMonitoringService();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('Complete Workflow Tests', () => {
    test('should process complete consciousness workflow from event to behavioral change', async () => {
      // 1. Initial state verification
      expect(testCharacter.consciousness).toBeDefined();
      expect(testCharacter.consciousness.behavioralState).toBeDefined();
      
      const initialBehavioralState = { ...testCharacter.consciousness.behavioralState };
      const initialFrequency = testCharacter.consciousness.baseFrequency;

      // 2. Create significant event
      const significantEvent = {
        type: 'goal_completion',
        outcome: 'critical_success',
        emotionalImpact: 0.8,
        participants: [testCharacter.id],
        timestamp: Date.now()
      };

      // 3. Calculate event significance
      const significance = eventSignificanceService.calculateEventSignificance(significantEvent);
      expect(significance).toBeGreaterThanOrEqual(0.3);

      // 4. Process consciousness update
      const updateResult = consciousnessUpdateService.processEvent(testCharacter, significantEvent);
      expect(updateResult.updated).toBe(true);
      expect(updateResult.significanceScore).toBe(significance);

      // 5. Verify consciousness parameters changed
      expect(testCharacter.consciousness.baseFrequency).not.toBe(initialFrequency);
      
      // 6. Verify behavioral state was regenerated
      expect(testCharacter.consciousness.behavioralState).not.toEqual(initialBehavioralState);

      // 7. Test decision factor calculation with new state
      const decisionFactor = behavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );
      expect(decisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(decisionFactor).toBeLessThanOrEqual(3.0);

      // 8. Add memory if significant
      const memoryAdded = significantMemoryService.addMemoryIfSignificant(
        testCharacter,
        { id: 'test-interaction', type: 'social' },
        { success: true, significance: significance }
      );
      expect(memoryAdded).toBe(true);
    });

    test('should maintain behavioral consistency across multiple events', async () => {
      const events = [
        { type: 'social_success', outcome: 'success', emotionalImpact: 0.4 },
        { type: 'goal_failure', outcome: 'failure', emotionalImpact: 0.5 },
        { type: 'relationship_improvement', outcome: 'success', emotionalImpact: 0.6 },
        { type: 'economic_gain', outcome: 'success', emotionalImpact: 0.3 }
      ];

      const behavioralStates = [];
      const decisionFactors = [];

      // Process each event and track behavioral changes
      for (const event of events) {
        const significance = EventSignificanceService.calculateEventSignificance(event);
        
        if (significance >= 0.3) {
          ConsciousnessUpdateService.processEvent(testCharacter, event);
        }

        behavioralStates.push({ ...testCharacter.consciousness.behavioralState });
        
        const decisionFactor = BehavioralStateService.calculateDecisionFactor(
          testCharacter,
          'social',
          { nodeType: 'settlement' }
        );
        decisionFactors.push(decisionFactor);
      }

      // Verify behavioral consistency
      expect(behavioralStates.length).toBe(4);
      expect(decisionFactors.length).toBe(4);
      
      // All decision factors should be within bounds
      decisionFactors.forEach(factor => {
        expect(factor).toBeGreaterThanOrEqual(0.1);
        expect(factor).toBeLessThanOrEqual(3.0);
      });

      // Behavioral states should show logical progression
      const energyLevels = behavioralStates.map(state => state.energy);
      expect(energyLevels.every(level => ['low', 'moderate', 'high'].includes(level))).toBe(true);
    });

    test('should integrate memory influence with decision making', async () => {
      // Add several memories with different outcomes
      const memories = [
        { interaction: { type: 'social' }, outcome: { success: true, significance: 0.7 } },
        { interaction: { type: 'social' }, outcome: { success: false, significance: 0.5 } },
        { interaction: { type: 'economic' }, outcome: { success: true, significance: 0.6 } }
      ];

      memories.forEach(memory => {
        SignificantMemoryService.addMemoryIfSignificant(
          testCharacter,
          memory.interaction,
          memory.outcome
        );
      });

      // Calculate decision factor with memory influence
      const socialDecisionFactor = BehavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );

      const economicDecisionFactor = BehavioralStateService.calculateDecisionFactor(
        testCharacter,
        'economic',
        { nodeType: 'settlement' }
      );

      // Both should be valid but potentially different due to memory influence
      expect(socialDecisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(socialDecisionFactor).toBeLessThanOrEqual(3.0);
      expect(economicDecisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(economicDecisionFactor).toBeLessThanOrEqual(3.0);

      // Verify memories are stored
      const storedMemories = testCharacter.consciousness.significantMemories || [];
      expect(storedMemories.length).toBeGreaterThan(0);
    });
  });

  describe('Turn Processing Integration', () => {
    test('should process NPC turn with consciousness system integration', async () => {
      const turnProcessor = new EfficientTurnProcessor();
      
      // Mock interaction for turn processing
      const mockInteraction = {
        id: 'test-interaction',
        type: 'social',
        name: 'Test Social Interaction',
        effects: [
          { type: 'attribute', target: 'self', operation: 'add', value: 1 }
        ]
      };

      // Process turn
      const turnResult = turnProcessor.processNPCTurn(testCharacter, worldState);

      expect(turnResult).toBeDefined();
      expect(turnResult.characterId).toBe(testCharacter.id);
      
      // Verify performance metrics were collected
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.turnProcessingTimes).toBeDefined();
    });

    test('should handle batch processing of multiple NPCs', async () => {
      // Create additional test characters
      const characters = [];
      for (let i = 0; i < 10; i++) {
        const character = new Character({
          id: `batch-char-${i}`,
          name: `Batch Character ${i}`,
          consciousness: new ConsciousnessSystem({
            baseFrequency: 7 + Math.random() * 4,
            baseCoherence: 0.5 + Math.random() * 0.4
          }),
          personality: {
            traits: {
              empathy: Math.random(),
              aggression: Math.random(),
              patience: Math.random(),
              ambition: Math.random(),
              loyalty: Math.random(),
              curiosity: Math.random()
            }
          }
        });
        characters.push(character);
        worldState.characters.set(character.id, character);
      }

      const turnProcessor = new EfficientTurnProcessor();
      const startTime = performance.now();

      // Process all characters
      const results = [];
      for (const character of characters) {
        const result = turnProcessor.processNPCTurn(character, worldState);
        results.push(result);
      }

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Verify all characters were processed
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.characterId).toBeDefined();
      });

      // Verify reasonable performance (should be fast with cached states)
      expect(processingTime).toBeLessThan(1000); // Less than 1 second for 10 NPCs
    });
  });

  describe('Checkpoint and Recovery Integration', () => {
    test('should save and restore complete consciousness state', async () => {
      // Modify character state
      const event = {
        type: 'major_achievement',
        outcome: 'critical_success',
        emotionalImpact: 0.9
      };

      ConsciousnessUpdateService.processEvent(testCharacter, event);
      SignificantMemoryService.addMemoryIfSignificant(
        testCharacter,
        { type: 'achievement' },
        { success: true, significance: 0.9 }
      );

      // Save checkpoint
      const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);
      expect(checkpoint).toBeDefined();
      expect(checkpoint.characterStates).toBeDefined();
      expect(checkpoint.characterStates.has(testCharacter.id)).toBe(true);

      // Modify character further
      const anotherEvent = {
        type: 'social_failure',
        outcome: 'failure',
        emotionalImpact: 0.4
      };
      ConsciousnessUpdateService.processEvent(testCharacter, anotherEvent);

      const modifiedFrequency = testCharacter.consciousness.baseFrequency;

      // Restore from checkpoint
      const restoreResult = ConsciousnessCheckpointService.restoreCheckpoint(worldState, checkpoint);
      expect(restoreResult.success).toBe(true);

      // Verify state was restored
      expect(testCharacter.consciousness.baseFrequency).not.toBe(modifiedFrequency);
    });

    test('should handle checkpoint corruption gracefully', async () => {
      // Create corrupted checkpoint
      const corruptedCheckpoint = {
        timestamp: Date.now(),
        version: '2.0',
        characterStates: new Map([
          [testCharacter.id, {
            // Missing required fields
            baseFrequency: null,
            baseCoherence: undefined
          }]
        ])
      };

      // Attempt restore
      const restoreResult = ConsciousnessCheckpointService.restoreCheckpoint(worldState, corruptedCheckpoint);
      
      // Should handle gracefully
      expect(restoreResult.success).toBe(false);
      expect(restoreResult.errors).toBeDefined();
      expect(restoreResult.errors.length).toBeGreaterThan(0);

      // Character should still have valid consciousness state
      expect(testCharacter.consciousness.baseFrequency).toBeGreaterThan(0);
      expect(testCharacter.consciousness.baseCoherence).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability Integration', () => {
    test('should maintain performance with large memory sets', async () => {
      // Add many memories
      for (let i = 0; i < 100; i++) {
        SignificantMemoryService.addMemoryIfSignificant(
          testCharacter,
          { type: 'social', id: `memory-${i}` },
          { success: i % 2 === 0, significance: 0.3 + Math.random() * 0.4 }
        );
      }

      const startTime = performance.now();

      // Calculate decision factor multiple times
      for (let i = 0; i < 50; i++) {
        BehavioralStateService.calculateDecisionFactor(
          testCharacter,
          'social',
          { nodeType: 'settlement' }
        );
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 50;

      // Should maintain reasonable performance even with many memories
      expect(avgTime).toBeLessThan(10); // Less than 10ms per calculation

      // Verify memory limit enforcement
      const memories = testCharacter.consciousness.significantMemories || [];
      expect(memories.length).toBeLessThanOrEqual(50); // Memory limit enforced
    });

    test('should handle event-driven updates efficiently', async () => {
      const events = [];
      
      // Create mix of significant and insignificant events
      for (let i = 0; i < 100; i++) {
        events.push({
          type: 'minor_interaction',
          outcome: 'success',
          emotionalImpact: Math.random() * 0.8 // Mix of significant and insignificant
        });
      }

      const startTime = performance.now();
      let updateCount = 0;

      // Process all events
      events.forEach(event => {
        const significance = EventSignificanceService.calculateEventSignificance(event);
        if (significance >= 0.3) {
          ConsciousnessUpdateService.processEvent(testCharacter, event);
          updateCount++;
        }
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should process efficiently
      expect(totalTime).toBeLessThan(500); // Less than 500ms for 100 events
      
      // Should only update on significant events
      expect(updateCount).toBeLessThan(100); // Not all events should trigger updates
      expect(updateCount).toBeGreaterThan(0); // But some should
    });
  });

  describe('Error Handling and Recovery Integration', () => {
    test('should recover from consciousness calculation errors', async () => {
      // Corrupt consciousness state
      testCharacter.consciousness.baseFrequency = NaN;
      testCharacter.consciousness.baseCoherence = -1;

      // Attempt to calculate decision factor
      const decisionFactor = BehavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );

      // Should return valid fallback value
      expect(decisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(decisionFactor).toBeLessThanOrEqual(3.0);
      expect(Number.isFinite(decisionFactor)).toBe(true);
    });

    test('should handle memory service errors gracefully', async () => {
      // Corrupt memory structure
      testCharacter.consciousness.significantMemories = null;

      // Should not throw when adding memory
      expect(() => {
        SignificantMemoryService.addMemoryIfSignificant(
          testCharacter,
          { type: 'social' },
          { success: true, significance: 0.5 }
        );
      }).not.toThrow();

      // Should not throw when calculating decision factor
      expect(() => {
        BehavioralStateService.calculateDecisionFactor(
          testCharacter,
          'social',
          { nodeType: 'settlement' }
        );
      }).not.toThrow();
    });
  });
});