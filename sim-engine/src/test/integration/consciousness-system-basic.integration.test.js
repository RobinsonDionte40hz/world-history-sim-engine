/**
 * Basic Consciousness System Integration Tests
 * 
 * Simplified integration tests for the consciousness system workflow
 * focusing on core functionality and service integration.
 */

import Character from '../../domain/entities/Character.js';
import BehavioralStateService from '../../domain/services/BehavioralStateService.js';
import EventSignificanceService from '../../domain/services/EventSignificanceService.js';
import ConsciousnessUpdateService from '../../domain/services/ConsciousnessUpdateService.js';
import SignificantMemoryService from '../../domain/services/SignificantMemoryService.js';
import ConsciousnessCheckpointService from '../../domain/services/ConsciousnessCheckpointService.js';

describe('Basic Consciousness System Integration', () => {
  let testCharacter;
  let worldState;
  let behavioralStateService;
  let eventSignificanceService;
  let consciousnessUpdateService;
  let significantMemoryService;

  beforeEach(() => {
    // Initialize services
    significantMemoryService = new SignificantMemoryService();
    behavioralStateService = new BehavioralStateService(significantMemoryService);
    eventSignificanceService = new EventSignificanceService();
    consciousnessUpdateService = new ConsciousnessUpdateService();

    // Create test character with consciousness system
    testCharacter = new Character({
      id: 'test-char-001',
      name: 'Integration Test Character',
      consciousness: {
        baseFrequency: 8.5,
        baseCoherence: 0.75
      },
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
      npcs: new Map([[testCharacter.id, testCharacter]]),
      nodes: new Map([
        ['test-node', {
          id: 'test-node',
          name: 'Test Location',
          type: 'settlement',
          assignedCharacters: [testCharacter.id]
        }]
      ])
    };
  });

  describe('Core Service Integration', () => {
    test('should calculate event significance correctly', () => {
      const event = {
        type: 'major_achievement',
        outcome: 'critical_success',
        emotionalImpact: 0.8,
        participants: [testCharacter.id]
      };

      const significance = eventSignificanceService.calculateEventSignificance(event);
      
      expect(significance).toBeGreaterThan(0);
      expect(significance).toBeLessThanOrEqual(1.0);
      expect(typeof significance).toBe('number');
    });

    test('should process consciousness updates', () => {
      const event = {
        type: 'major_achievement',
        outcome: 'critical_success',
        emotionalImpact: 0.8,
        participants: [testCharacter.id]
      };

      const updateResult = consciousnessUpdateService.processEvent(testCharacter, event);

      expect(updateResult).toBeDefined();
      expect(updateResult.updated).toBe(true);
      expect(testCharacter.consciousness.frequency).toBeGreaterThanOrEqual(3);
      expect(testCharacter.consciousness.frequency).toBeLessThanOrEqual(15);
    });

    test('should calculate behavioral decision factors', () => {
      const result = behavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );

      expect(result).toBeDefined();
      expect(result.finalFactor).toBeGreaterThanOrEqual(0.1);
      expect(result.finalFactor).toBeLessThanOrEqual(3.0);
      expect(typeof result.finalFactor).toBe('number');
      expect(Number.isFinite(result.finalFactor)).toBe(true);
    });

    test('should manage significant memories', () => {
      const interaction = { type: 'social', id: 'test-interaction' };
      const outcome = 'success'; // String outcome as expected by the service

      const memoryAdded = significantMemoryService.addMemoryIfSignificant(
        testCharacter,
        interaction,
        outcome,
        { emotionalImpact: 0.6 } // Pass significance as context
      );

      expect(memoryAdded).toBe(true);
      
      // Verify memory was stored
      const memories = testCharacter.significantMemories || [];
      expect(memories.length).toBeGreaterThan(0);
    });

    test('should create and restore checkpoints', () => {
      // Modify character state
      const event = {
        type: 'major_achievement',
        outcome: 'critical_success',
        emotionalImpact: 0.9
      };

      consciousnessUpdateService.processEvent(testCharacter, event);
      const modifiedFrequency = testCharacter.consciousness.baseFrequency;

      // Save checkpoint (static method)
      const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);
      expect(checkpoint).toBeDefined();
      expect(checkpoint.characterStates).toBeDefined();

      // Modify character further
      const anotherEvent = {
        type: 'social_failure',
        outcome: 'failure',
        emotionalImpact: 0.4
      };
      consciousnessUpdateService.processEvent(testCharacter, anotherEvent);

      // Restore from checkpoint (static method)
      const restoreResult = ConsciousnessCheckpointService.restoreCheckpoint(worldState, checkpoint);
      expect(restoreResult.success).toBe(true);

      // Verify state was restored (approximately, due to potential rounding)
      expect(Math.abs(testCharacter.consciousness.baseFrequency - modifiedFrequency)).toBeLessThan(0.1);
    });
  });

  describe('Workflow Integration', () => {
    test('should process complete event-to-behavior workflow', () => {
      // 1. Create significant event
      const event = {
        type: 'goal_completion',
        outcome: 'critical_success',
        emotionalImpact: 0.8,
        participants: [testCharacter.id]
      };

      // 2. Calculate significance
      const significance = eventSignificanceService.calculateEventSignificance(event);
      expect(significance).toBeGreaterThan(0.3);

      // 3. Process consciousness update
      const updateResult = consciousnessUpdateService.processEvent(testCharacter, event);
      expect(updateResult.updated).toBe(true);

      // 4. Calculate decision factor
      const result = behavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );
      expect(result.finalFactor).toBeGreaterThanOrEqual(0.1);
      expect(result.finalFactor).toBeLessThanOrEqual(3.0);

      // 5. Add memory
      const memoryAdded = significantMemoryService.addMemoryIfSignificant(
        testCharacter,
        { type: 'goal_completion', id: 'test-goal' },
        'success',
        { emotionalImpact: significance }
      );
      expect(memoryAdded).toBe(true);
    });

    test('should handle multiple events consistently', () => {
      const events = [
        { type: 'social_success', outcome: 'success', emotionalImpact: 0.4 },
        { type: 'goal_failure', outcome: 'failure', emotionalImpact: 0.5 },
        { type: 'relationship_improvement', outcome: 'success', emotionalImpact: 0.6 }
      ];

      const decisionFactors = [];

      events.forEach((event, index) => {
        const significance = eventSignificanceService.calculateEventSignificance(event);
        
        if (significance >= 0.3) {
          consciousnessUpdateService.processEvent(testCharacter, event);
        }

        const result = behavioralStateService.calculateDecisionFactor(
          testCharacter,
          'social',
          { nodeType: 'settlement' }
        );
        decisionFactors.push(result.finalFactor);
      });

      // All decision factors should be valid
      decisionFactors.forEach(factor => {
        expect(factor).toBeGreaterThanOrEqual(0.1);
        expect(factor).toBeLessThanOrEqual(3.0);
        expect(Number.isFinite(factor)).toBe(true);
      });

      // Character should maintain valid consciousness state
      expect(testCharacter.consciousness.baseFrequency).toBeGreaterThanOrEqual(3);
      expect(testCharacter.consciousness.baseFrequency).toBeLessThanOrEqual(15);
      expect(testCharacter.consciousness.baseCoherence).toBeGreaterThanOrEqual(0.2);
      expect(testCharacter.consciousness.baseCoherence).toBeLessThanOrEqual(1.0);
    });

    test('should handle memory influence on decisions', () => {
      // Add several memories with different outcomes
      const memories = [
        { interaction: { type: 'social' }, outcome: 'success', context: { emotionalImpact: 0.7 } },
        { interaction: { type: 'social' }, outcome: 'failure', context: { emotionalImpact: 0.5 } },
        { interaction: { type: 'economic' }, outcome: 'success', context: { emotionalImpact: 0.6 } }
      ];

      memories.forEach(memory => {
        significantMemoryService.addMemoryIfSignificant(
          testCharacter,
          memory.interaction,
          memory.outcome,
          memory.context
        );
      });

      // Calculate decision factors for different interaction types
      const socialResult = behavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );

      const economicResult = behavioralStateService.calculateDecisionFactor(
        testCharacter,
        'economic',
        { nodeType: 'settlement' }
      );

      // Both should be valid
      expect(socialResult.finalFactor).toBeGreaterThanOrEqual(0.1);
      expect(socialResult.finalFactor).toBeLessThanOrEqual(3.0);
      expect(economicResult.finalFactor).toBeGreaterThanOrEqual(0.1);
      expect(economicResult.finalFactor).toBeLessThanOrEqual(3.0);

      // Verify memories are stored
      const storedMemories = testCharacter.significantMemories || [];
      expect(storedMemories.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle corrupted consciousness state gracefully', () => {
      // Corrupt consciousness state
      testCharacter.consciousness.baseFrequency = NaN;
      testCharacter.consciousness.baseCoherence = -1;

      // Services should handle gracefully and return valid values
      const result = behavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );

      expect(result.finalFactor).toBeGreaterThanOrEqual(0.1);
      expect(result.finalFactor).toBeLessThanOrEqual(3.0);
      expect(Number.isFinite(result.finalFactor)).toBe(true);
    });

    test('should handle missing behavioral state', () => {
      // Remove behavioral state
      testCharacter.consciousness.behavioralState = null;

      // Should not throw and should return valid decision factor
      expect(() => {
        const result = behavioralStateService.calculateDecisionFactor(
          testCharacter,
          'social',
          { nodeType: 'settlement' }
        );
        expect(result.finalFactor).toBeGreaterThanOrEqual(0.1);
        expect(result.finalFactor).toBeLessThanOrEqual(3.0);
      }).not.toThrow();
    });

    test('should handle memory service errors gracefully', () => {
      // Corrupt memory structure
      testCharacter.consciousness.significantMemories = null;

      // Should not throw when adding memory
      expect(() => {
        significantMemoryService.addMemoryIfSignificant(
          testCharacter,
          { type: 'social' },
          'success',
          { emotionalImpact: 0.5 }
        );
      }).not.toThrow();

      // Should not throw when calculating decision factor
      expect(() => {
        behavioralStateService.calculateDecisionFactor(
          testCharacter,
          'social',
          { nodeType: 'settlement' }
        );
      }).not.toThrow();
    });
  });

  describe('Performance Integration', () => {
    test('should maintain performance with multiple operations', () => {
      const startTime = performance.now();
      
      // Perform multiple operations
      for (let i = 0; i < 50; i++) {
        const event = {
          type: 'minor_interaction',
          outcome: 'success',
          emotionalImpact: Math.random() * 0.6
        };

        const significance = eventSignificanceService.calculateEventSignificance(event);
        if (significance >= 0.3) {
          consciousnessUpdateService.processEvent(testCharacter, event);
        }

        behavioralStateService.calculateDecisionFactor(
          testCharacter,
          'social',
          { nodeType: 'settlement' }
        );
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(1000); // Less than 1 second for 50 operations

      // Character should maintain valid state
      expect(testCharacter.consciousness.frequency).toBeGreaterThanOrEqual(3);
      expect(testCharacter.consciousness.frequency).toBeLessThanOrEqual(15);
    });

    test('should handle memory limit enforcement', () => {
      // Add many memories to test limit enforcement
      for (let i = 0; i < 100; i++) {
        significantMemoryService.addMemoryIfSignificant(
          testCharacter,
          { type: 'test', id: `memory-${i}` },
          'success',
          { emotionalImpact: 0.4 }
        );
      }

      // Memory limit should be enforced
      const memories = testCharacter.significantMemories || [];
      expect(memories.length).toBeLessThanOrEqual(50); // Default memory limit

      // Decision calculation should still work efficiently
      const startTime = performance.now();
      const result = behavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );
      const endTime = performance.now();

      expect(result.finalFactor).toBeGreaterThanOrEqual(0.1);
      expect(result.finalFactor).toBeLessThanOrEqual(3.0);
      expect(endTime - startTime).toBeLessThan(50); // Should be fast even with many memories
    });
  });
});