/**
 * Consciousness System Component Integration Tests
 * 
 * Tests for integration between all consciousness system components,
 * ensuring they work together correctly in various scenarios.
 */

import Character from '../../domain/entities/Character.js';
import ConsciousnessSystem from '../../domain/value-objects/ConsciousnessSystem.js';
import BehavioralStateService from '../../domain/services/BehavioralStateService.js';
import EventSignificanceService from '../../domain/services/EventSignificanceService.js';
import ConsciousnessUpdateService from '../../domain/services/ConsciousnessUpdateService.js';
import SignificantMemoryService from '../../domain/services/SignificantMemoryService.js';
import ConsciousnessCheckpointService from '../../domain/services/ConsciousnessCheckpointService.js';
import ConsciousnessInspectionService from '../../domain/services/ConsciousnessInspectionService.js';
import ConsciousnessErrorHandlingService from '../../domain/services/ConsciousnessErrorHandlingService.js';
import MemoryManagementService from '../../domain/services/MemoryManagementService.js';
import BatchProcessingService from '../../domain/services/BatchProcessingService.js';
import PerformanceMonitoringService from '../../domain/services/PerformanceMonitoringService.js';
import ConsciousnessConfigurationService from '../../domain/services/ConsciousnessConfigurationService.js';

describe('Consciousness System Component Integration', () => {
  let testCharacter;
  let worldState;
  let performanceMonitor;

  beforeEach(() => {
    testCharacter = new Character({
      id: 'integration-char',
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

    worldState = {
      characters: new Map([[testCharacter.id, testCharacter]]),
      nodes: new Map([
        ['test-node', {
          id: 'test-node',
          name: 'Test Location',
          type: 'settlement',
          assignedCharacters: [testCharacter.id]
        }]
      ])
    };

    performanceMonitor = new PerformanceMonitoringService();
    performanceMonitor.startMonitoring();
  });

  afterEach(() => {
    performanceMonitor.stopMonitoring();
  });

  describe('Service Integration Tests', () => {
    test('should integrate all consciousness services in complete workflow', async () => {
      // 1. Configuration Service - Set up custom configuration
      const customConfig = {
        significanceThreshold: 0.25,
        memoryLimit: 40,
        updateFrequency: 'event-driven',
        behavioralStateMapping: {
          energy: { low: [0, 0.3], moderate: [0.3, 0.7], high: [0.7, 1.0] },
          focus: { scattered: [0, 0.4], balanced: [0.4, 0.8], focused: [0.8, 1.0] }
        }
      };

      ConsciousnessConfigurationService.updateConfiguration(customConfig);
      const config = ConsciousnessConfigurationService.getConfiguration();
      expect(config.significanceThreshold).toBe(0.25);

      // 2. Event Significance Service - Calculate significance
      const event = {
        type: 'major_achievement',
        outcome: 'critical_success',
        emotionalImpact: 0.8,
        participants: [testCharacter.id]
      };

      const significance = EventSignificanceService.calculateEventSignificance(event);
      expect(significance).toBeGreaterThan(config.significanceThreshold);

      // 3. Consciousness Update Service - Process event
      const updateResult = ConsciousnessUpdateService.processEvent(testCharacter, event);
      expect(updateResult.updated).toBe(true);
      expect(updateResult.significanceScore).toBe(significance);

      // 4. Behavioral State Service - Calculate decision factor
      const decisionFactor = BehavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );
      expect(decisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(decisionFactor).toBeLessThanOrEqual(3.0);

      // 5. Significant Memory Service - Add memory
      const memoryAdded = SignificantMemoryService.addMemoryIfSignificant(
        testCharacter,
        { type: 'achievement', id: 'test-achievement' },
        { success: true, significance }
      );
      expect(memoryAdded).toBe(true);

      // 6. Inspection Service - Analyze state
      const inspection = ConsciousnessInspectionService.inspectBehavioralState(testCharacter);
      expect(inspection.isValid).toBe(true);
      expect(inspection.behavioralState).toBeDefined();

      // 7. Checkpoint Service - Save state
      const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);
      expect(checkpoint.characterStates.has(testCharacter.id)).toBe(true);

      // 8. Performance Monitoring - Verify metrics
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toBeDefined();
    });

    test('should handle error recovery across all services', async () => {
      // Introduce errors in character state
      testCharacter.consciousness.baseFrequency = NaN;
      testCharacter.consciousness.baseCoherence = -1;
      testCharacter.consciousness.behavioralState = null;
      testCharacter.consciousness.significantMemories = undefined;

      // Error Handling Service should detect and fix issues
      const errorReport = ConsciousnessErrorHandlingService.validateAndRepair(testCharacter);
      expect(errorReport.errorsFound).toBeGreaterThan(0);
      expect(errorReport.repairsApplied).toBeGreaterThan(0);

      // All services should work after repair
      const decisionFactor = BehavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );
      expect(decisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(decisionFactor).toBeLessThanOrEqual(3.0);

      const memoryAdded = SignificantMemoryService.addMemoryIfSignificant(
        testCharacter,
        { type: 'recovery_test' },
        { success: true, significance: 0.5 }
      );
      expect(memoryAdded).toBe(true);

      const inspection = ConsciousnessInspectionService.inspectBehavioralState(testCharacter);
      expect(inspection.isValid).toBe(true);
    });

    test('should integrate batch processing with all services', async () => {
      // Create multiple characters for batch processing
      const characters = [];
      for (let i = 0; i < 10; i++) {
        const character = new Character({
          id: `batch-char-${i}`,
          name: `Batch Character ${i}`,
          consciousness: new ConsciousnessSystem({
            baseFrequency: 6 + Math.random() * 4,
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
      }

      const batchWorldState = {
        characters: new Map(characters.map(c => [c.id, c]))
      };

      // Create batch operations
      const operations = characters.map(character => ({
        type: 'consciousness_update',
        characterId: character.id,
        event: {
          type: 'batch_event',
          outcome: 'success',
          emotionalImpact: 0.6
        }
      }));

      // Process batch
      const batchResults = await BatchProcessingService.processBatch(operations, batchWorldState);
      expect(batchResults.length).toBe(characters.length);

      // Verify all characters were processed correctly
      batchResults.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.characterId).toBe(characters[index].id);
      });

      // Verify inspection works on all characters
      characters.forEach(character => {
        const inspection = ConsciousnessInspectionService.inspectBehavioralState(character);
        expect(inspection.isValid).toBe(true);
      });

      // Verify checkpoint includes all characters
      const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(batchWorldState);
      expect(checkpoint.characterStates.size).toBe(characters.length);
    });
  });

  describe('Memory Management Integration', () => {
    test('should integrate memory management with all consciousness services', async () => {
      // Add many memories to trigger management
      for (let i = 0; i < 80; i++) {
        SignificantMemoryService.addMemoryIfSignificant(
          testCharacter,
          { type: 'memory_test', id: `memory-${i}` },
          { success: i % 2 === 0, significance: 0.4 }
        );
      }

      // Verify memory limit enforcement
      let memories = testCharacter.consciousness.significantMemories || [];
      expect(memories.length).toBeLessThanOrEqual(50);

      // Memory management should work with decision calculations
      const decisionFactor = BehavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );
      expect(decisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(decisionFactor).toBeLessThanOrEqual(3.0);

      // Perform world-level cleanup
      MemoryManagementService.performWorldLevelCleanup(worldState);

      // Verify cleanup worked
      memories = testCharacter.consciousness.significantMemories || [];
      expect(memories.length).toBeLessThanOrEqual(50);

      // All services should still work after cleanup
      const inspection = ConsciousnessInspectionService.inspectBehavioralState(testCharacter);
      expect(inspection.isValid).toBe(true);

      const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);
      expect(checkpoint.characterStates.has(testCharacter.id)).toBe(true);
    });

    test('should handle memory management during consciousness updates', async () => {
      // Fill character with memories
      for (let i = 0; i < 45; i++) {
        SignificantMemoryService.addMemoryIfSignificant(
          testCharacter,
          { type: 'pre_update', id: `pre-${i}` },
          { success: true, significance: 0.4 }
        );
      }

      const initialMemoryCount = (testCharacter.consciousness.significantMemories || []).length;

      // Process events that should add more memories
      const events = [
        { type: 'major_success', outcome: 'critical_success', emotionalImpact: 0.9 },
        { type: 'relationship_gain', outcome: 'success', emotionalImpact: 0.7 },
        { type: 'goal_achievement', outcome: 'success', emotionalImpact: 0.8 }
      ];

      events.forEach(event => {
        const significance = EventSignificanceService.calculateEventSignificance(event);
        if (significance >= 0.3) {
          ConsciousnessUpdateService.processEvent(testCharacter, event);
          SignificantMemoryService.addMemoryIfSignificant(
            testCharacter,
            { type: event.type, id: `event-${event.type}` },
            { success: true, significance }
          );
        }
      });

      // Memory limit should still be enforced
      const finalMemoryCount = (testCharacter.consciousness.significantMemories || []).length;
      expect(finalMemoryCount).toBeLessThanOrEqual(50);

      // Decision factor should reflect new memories
      const decisionFactor = BehavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );
      expect(decisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(decisionFactor).toBeLessThanOrEqual(3.0);
    });
  });

  describe('Configuration Integration', () => {
    test('should apply configuration changes across all services', async () => {
      // Set custom configuration
      const customConfig = {
        significanceThreshold: 0.2,
        memoryLimit: 30,
        behavioralStateMapping: {
          energy: { low: [0, 0.2], moderate: [0.2, 0.8], high: [0.8, 1.0] }
        },
        decisionFactorBounds: { min: 0.2, max: 2.5 }
      };

      ConsciousnessConfigurationService.updateConfiguration(customConfig);

      // Test significance threshold change
      const lowSignificanceEvent = {
        type: 'minor_event',
        outcome: 'success',
        emotionalImpact: 0.25
      };

      const significance = EventSignificanceService.calculateEventSignificance(lowSignificanceEvent);
      expect(significance).toBeGreaterThan(0.2); // Should be significant with new threshold

      // Test memory limit change
      for (let i = 0; i < 40; i++) {
        SignificantMemoryService.addMemoryIfSignificant(
          testCharacter,
          { type: 'config_test', id: `config-${i}` },
          { success: true, significance: 0.3 }
        );
      }

      const memories = testCharacter.consciousness.significantMemories || [];
      expect(memories.length).toBeLessThanOrEqual(30); // New limit should be enforced

      // Test decision factor bounds
      const decisionFactor = BehavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );
      expect(decisionFactor).toBeGreaterThanOrEqual(0.2);
      expect(decisionFactor).toBeLessThanOrEqual(2.5);

      // Reset configuration
      ConsciousnessConfigurationService.resetToDefaults();
    });

    test('should validate configuration changes across services', async () => {
      // Try invalid configuration
      const invalidConfig = {
        significanceThreshold: -0.5, // Invalid
        memoryLimit: 0, // Invalid
        decisionFactorBounds: { min: 5, max: 2 } // Invalid range
      };

      expect(() => {
        ConsciousnessConfigurationService.updateConfiguration(invalidConfig);
      }).toThrow();

      // Verify services still work with default configuration
      const decisionFactor = BehavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );
      expect(decisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(decisionFactor).toBeLessThanOrEqual(3.0);

      const memoryAdded = SignificantMemoryService.addMemoryIfSignificant(
        testCharacter,
        { type: 'validation_test' },
        { success: true, significance: 0.5 }
      );
      expect(memoryAdded).toBe(true);
    });
  });

  describe('Performance Integration', () => {
    test('should maintain performance across all integrated services', async () => {
      const iterations = 100;
      const performanceResults = {
        eventProcessing: [],
        decisionCalculation: [],
        memoryOperations: [],
        inspections: []
      };

      for (let i = 0; i < iterations; i++) {
        // Event processing performance
        const event = {
          type: 'performance_test',
          outcome: i % 2 === 0 ? 'success' : 'failure',
          emotionalImpact: Math.random() * 0.8
        };

        const eventStart = performance.now();
        const significance = EventSignificanceService.calculateEventSignificance(event);
        if (significance >= 0.3) {
          ConsciousnessUpdateService.processEvent(testCharacter, event);
        }
        const eventEnd = performance.now();
        performanceResults.eventProcessing.push(eventEnd - eventStart);

        // Decision calculation performance
        const decisionStart = performance.now();
        BehavioralStateService.calculateDecisionFactor(
          testCharacter,
          'social',
          { nodeType: 'settlement' }
        );
        const decisionEnd = performance.now();
        performanceResults.decisionCalculation.push(decisionEnd - decisionStart);

        // Memory operation performance
        const memoryStart = performance.now();
        SignificantMemoryService.addMemoryIfSignificant(
          testCharacter,
          { type: 'perf_test', id: `perf-${i}` },
          { success: true, significance: 0.4 }
        );
        const memoryEnd = performance.now();
        performanceResults.memoryOperations.push(memoryEnd - memoryStart);

        // Inspection performance
        const inspectionStart = performance.now();
        ConsciousnessInspectionService.inspectBehavioralState(testCharacter);
        const inspectionEnd = performance.now();
        performanceResults.inspections.push(inspectionEnd - inspectionStart);
      }

      // Analyze performance results
      Object.entries(performanceResults).forEach(([operation, times]) => {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const maxTime = Math.max(...times);
        
        console.log(`${operation}: avg=${avgTime.toFixed(3)}ms, max=${maxTime.toFixed(3)}ms`);
        
        // Performance thresholds
        expect(avgTime).toBeLessThan(5); // Average should be under 5ms
        expect(maxTime).toBeLessThan(50); // Max should be under 50ms
      });
    });

    test('should handle integrated service failures gracefully', async () => {
      // Simulate various failure conditions
      const originalFrequency = testCharacter.consciousness.baseFrequency;

      // Test with corrupted consciousness state
      testCharacter.consciousness.baseFrequency = null;
      testCharacter.consciousness.behavioralState = undefined;

      // All services should handle gracefully
      expect(() => {
        BehavioralStateService.calculateDecisionFactor(
          testCharacter,
          'social',
          { nodeType: 'settlement' }
        );
      }).not.toThrow();

      expect(() => {
        SignificantMemoryService.addMemoryIfSignificant(
          testCharacter,
          { type: 'failure_test' },
          { success: true, significance: 0.5 }
        );
      }).not.toThrow();

      expect(() => {
        ConsciousnessInspectionService.inspectBehavioralState(testCharacter);
      }).not.toThrow();

      // Error handling should repair the state
      const errorReport = ConsciousnessErrorHandlingService.validateAndRepair(testCharacter);
      expect(errorReport.errorsFound).toBeGreaterThan(0);
      expect(errorReport.repairsApplied).toBeGreaterThan(0);

      // Services should work normally after repair
      const decisionFactor = BehavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social',
        { nodeType: 'settlement' }
      );
      expect(decisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(decisionFactor).toBeLessThanOrEqual(3.0);
    });
  });
});