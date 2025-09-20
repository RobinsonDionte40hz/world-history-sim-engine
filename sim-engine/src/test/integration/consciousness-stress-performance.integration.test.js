/**
 * Consciousness System Stress Testing and Performance Benchmarks
 * 
 * Comprehensive stress tests for large NPC populations, memory pressure,
 * and performance regression testing for the consciousness system.
 */

import Character from '../../domain/entities/Character.js';
import ConsciousnessSystem from '../../domain/value-objects/ConsciousnessSystem.js';
import BehavioralStateService from '../../domain/services/BehavioralStateService.js';
import EventSignificanceService from '../../domain/services/EventSignificanceService.js';
import ConsciousnessUpdateService from '../../domain/services/ConsciousnessUpdateService.js';
import SignificantMemoryService from '../../domain/services/SignificantMemoryService.js';
import ConsciousnessCheckpointService from '../../domain/services/ConsciousnessCheckpointService.js';
import MemoryManagementService from '../../domain/services/MemoryManagementService.js';
import BatchProcessingService from '../../domain/services/BatchProcessingService.js';
import PerformanceMonitoringService from '../../domain/services/PerformanceMonitoringService.js';

describe('Consciousness System Stress Testing and Performance', () => {
  let performanceMonitor;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitoringService();
    performanceMonitor.startMonitoring();
  });

  afterEach(() => {
    performanceMonitor.stopMonitoring();
  });

  describe('Large Population Stress Tests', () => {
    test('should handle 200 NPCs with consciousness updates', async () => {
      const populationSize = 200;
      const characters = [];

      // Create large population
      const startCreation = performance.now();
      for (let i = 0; i < populationSize; i++) {
        const character = new Character({
          id: `stress-char-${i}`,
          name: `Stress Character ${i}`,
          consciousness: new ConsciousnessSystem({
            baseFrequency: 4 + Math.random() * 8,
            baseCoherence: 0.3 + Math.random() * 0.6
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
      const endCreation = performance.now();

      console.log(`Created ${populationSize} characters in ${endCreation - startCreation}ms`);

      // Process consciousness updates for all characters
      const startProcessing = performance.now();
      let updateCount = 0;
      let decisionCalculations = 0;

      characters.forEach((character, index) => {
        // Generate events for each character
        const events = [
          {
            type: 'daily_activity',
            outcome: Math.random() > 0.5 ? 'success' : 'failure',
            emotionalImpact: Math.random() * 0.6
          },
          {
            type: 'social_interaction',
            outcome: Math.random() > 0.3 ? 'success' : 'failure',
            emotionalImpact: Math.random() * 0.8
          }
        ];

        events.forEach(event => {
          const significance = EventSignificanceService.calculateEventSignificance(event);
          if (significance >= 0.3) {
            ConsciousnessUpdateService.processEvent(character, event);
            updateCount++;
          }
        });

        // Calculate decision factor
        const decisionFactor = BehavioralStateService.calculateDecisionFactor(
          character,
          'social',
          { nodeType: 'settlement' }
        );
        decisionCalculations++;

        expect(decisionFactor).toBeGreaterThanOrEqual(0.1);
        expect(decisionFactor).toBeLessThanOrEqual(3.0);
      });

      const endProcessing = performance.now();
      const processingTime = endProcessing - startProcessing;

      console.log(`Processed ${updateCount} consciousness updates and ${decisionCalculations} decision calculations in ${processingTime}ms`);

      // Performance assertions
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(updateCount).toBeGreaterThan(0); // Some updates should occur
      expect(decisionCalculations).toBe(populationSize); // All characters should have decisions calculated

      // Verify all characters maintain valid states
      characters.forEach(character => {
        expect(character.consciousness.baseFrequency).toBeGreaterThanOrEqual(3);
        expect(character.consciousness.baseFrequency).toBeLessThanOrEqual(15);
        expect(character.consciousness.baseCoherence).toBeGreaterThanOrEqual(0.2);
        expect(character.consciousness.baseCoherence).toBeLessThanOrEqual(1.0);
      });
    });

    test('should handle batch processing of 100 NPCs efficiently', async () => {
      const batchSize = 100;
      const characters = [];

      // Create characters for batch processing
      for (let i = 0; i < batchSize; i++) {
        characters.push(new Character({
          id: `batch-${i}`,
          name: `Batch Character ${i}`,
          consciousness: new ConsciousnessSystem({
            baseFrequency: 5 + Math.random() * 6,
            baseCoherence: 0.4 + Math.random() * 0.5
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
        }));
      }

      // Create batch operations
      const operations = characters.map(character => ({
        type: 'consciousness_update',
        characterId: character.id,
        event: {
          type: 'batch_event',
          outcome: 'success',
          emotionalImpact: 0.5
        }
      }));

      const startBatch = performance.now();
      const results = await BatchProcessingService.processBatch(operations, { characters });
      const endBatch = performance.now();

      const batchTime = endBatch - startBatch;
      console.log(`Batch processed ${batchSize} operations in ${batchTime}ms`);

      // Verify batch processing results
      expect(results.length).toBe(batchSize);
      expect(batchTime).toBeLessThan(1000); // Should complete within 1 second

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.characterId).toBeDefined();
      });
    });
  });

  describe('Memory Pressure Tests', () => {
    test('should handle memory pressure with 1000 memories per character', async () => {
      const character = new Character({
        id: 'memory-stress-char',
        name: 'Memory Stress Character',
        consciousness: new ConsciousnessSystem({
          baseFrequency: 8,
          baseCoherence: 0.7
        }),
        personality: {
          traits: {
            empathy: 0.6,
            aggression: 0.4,
            patience: 0.7,
            ambition: 0.5,
            loyalty: 0.8,
            curiosity: 0.6
          }
        }
      });

      const startMemoryTest = performance.now();
      let memoriesAdded = 0;

      // Attempt to add 1000 memories
      for (let i = 0; i < 1000; i++) {
        const added = SignificantMemoryService.addMemoryIfSignificant(
          character,
          { type: 'stress_test', id: `memory-${i}` },
          { success: i % 2 === 0, significance: 0.3 + Math.random() * 0.4 }
        );
        if (added) memoriesAdded++;
      }

      const endMemoryTest = performance.now();
      const memoryTime = endMemoryTest - startMemoryTest;

      console.log(`Added ${memoriesAdded} memories in ${memoryTime}ms`);

      // Verify memory limit enforcement
      const actualMemories = character.consciousness.significantMemories || [];
      expect(actualMemories.length).toBeLessThanOrEqual(50); // Memory limit enforced
      expect(memoryTime).toBeLessThan(2000); // Should complete within 2 seconds

      // Test decision calculation with many memories
      const decisionStart = performance.now();
      const decisionFactor = BehavioralStateService.calculateDecisionFactor(
        character,
        'social',
        { nodeType: 'settlement' }
      );
      const decisionEnd = performance.now();

      expect(decisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(decisionFactor).toBeLessThanOrEqual(3.0);
      expect(decisionEnd - decisionStart).toBeLessThan(50); // Should be fast even with many memories
    });

    test('should handle memory cleanup efficiently', async () => {
      const characters = [];
      
      // Create characters with many memories
      for (let i = 0; i < 20; i++) {
        const character = new Character({
          id: `cleanup-char-${i}`,
          name: `Cleanup Character ${i}`,
          consciousness: new ConsciousnessSystem({
            baseFrequency: 6 + Math.random() * 4,
            baseCoherence: 0.5 + Math.random() * 0.4
          })
        });

        // Add many memories to each character
        for (let j = 0; j < 80; j++) {
          SignificantMemoryService.addMemoryIfSignificant(
            character,
            { type: 'cleanup_test', id: `memory-${i}-${j}` },
            { success: true, significance: 0.4 }
          );
        }

        characters.push(character);
      }

      const worldState = {
        characters: new Map(characters.map(c => [c.id, c]))
      };

      // Perform cleanup
      const cleanupStart = performance.now();
      MemoryManagementService.performWorldLevelCleanup(worldState);
      const cleanupEnd = performance.now();

      const cleanupTime = cleanupEnd - cleanupStart;
      console.log(`Cleaned up memories for ${characters.length} characters in ${cleanupTime}ms`);

      expect(cleanupTime).toBeLessThan(1000); // Should complete within 1 second

      // Verify cleanup was effective
      characters.forEach(character => {
        const memories = character.consciousness.significantMemories || [];
        expect(memories.length).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('Performance Regression Tests', () => {
    test('should maintain sub-millisecond decision factor calculation', async () => {
      const character = new Character({
        id: 'perf-test-char',
        name: 'Performance Test Character',
        consciousness: new ConsciousnessSystem({
          baseFrequency: 8,
          baseCoherence: 0.7
        }),
        personality: {
          traits: {
            empathy: 0.6,
            aggression: 0.4,
            patience: 0.7,
            ambition: 0.5,
            loyalty: 0.8,
            curiosity: 0.6
          }
        }
      });

      // Add some memories for realistic conditions
      for (let i = 0; i < 20; i++) {
        SignificantMemoryService.addMemoryIfSignificant(
          character,
          { type: 'performance_test', id: `perf-memory-${i}` },
          { success: i % 2 === 0, significance: 0.4 }
        );
      }

      const iterations = 1000;
      const times = [];

      // Measure decision factor calculation times
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const decisionFactor = BehavioralStateService.calculateDecisionFactor(
          character,
          'social',
          { nodeType: 'settlement' }
        );
        const end = performance.now();

        times.push(end - start);
        expect(decisionFactor).toBeGreaterThanOrEqual(0.1);
        expect(decisionFactor).toBeLessThanOrEqual(3.0);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      console.log(`Decision factor calculation: avg=${avgTime.toFixed(3)}ms, max=${maxTime.toFixed(3)}ms, min=${minTime.toFixed(3)}ms`);

      // Performance regression thresholds
      expect(avgTime).toBeLessThan(1); // Average should be under 1ms
      expect(maxTime).toBeLessThan(10); // No single calculation should exceed 10ms
    });

    test('should maintain efficient consciousness update performance', async () => {
      const character = new Character({
        id: 'update-perf-char',
        name: 'Update Performance Character',
        consciousness: new ConsciousnessSystem({
          baseFrequency: 8,
          baseCoherence: 0.7
        })
      });

      const events = [];
      for (let i = 0; i < 100; i++) {
        events.push({
          type: 'performance_event',
          outcome: i % 2 === 0 ? 'success' : 'failure',
          emotionalImpact: 0.3 + Math.random() * 0.5
        });
      }

      const updateTimes = [];
      let significantUpdates = 0;

      events.forEach(event => {
        const significance = EventSignificanceService.calculateEventSignificance(event);
        
        if (significance >= 0.3) {
          const start = performance.now();
          ConsciousnessUpdateService.processEvent(character, event);
          const end = performance.now();
          
          updateTimes.push(end - start);
          significantUpdates++;
        }
      });

      if (updateTimes.length > 0) {
        const avgUpdateTime = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;
        const maxUpdateTime = Math.max(...updateTimes);

        console.log(`Consciousness updates: ${significantUpdates} significant events, avg=${avgUpdateTime.toFixed(3)}ms, max=${maxUpdateTime.toFixed(3)}ms`);

        expect(avgUpdateTime).toBeLessThan(5); // Average update should be under 5ms
        expect(maxUpdateTime).toBeLessThan(20); // No update should exceed 20ms
      }
    });

    test('should maintain efficient checkpoint performance', async () => {
      const characters = [];
      
      // Create moderate population for checkpoint testing
      for (let i = 0; i < 50; i++) {
        const character = new Character({
          id: `checkpoint-char-${i}`,
          name: `Checkpoint Character ${i}`,
          consciousness: new ConsciousnessSystem({
            baseFrequency: 5 + Math.random() * 6,
            baseCoherence: 0.4 + Math.random() * 0.5
          })
        });

        // Add some memories and events
        for (let j = 0; j < 10; j++) {
          SignificantMemoryService.addMemoryIfSignificant(
            character,
            { type: 'checkpoint_test', id: `memory-${i}-${j}` },
            { success: true, significance: 0.4 }
          );
        }

        characters.push(character);
      }

      const worldState = {
        characters: new Map(characters.map(c => [c.id, c]))
      };

      // Test checkpoint save performance
      const saveStart = performance.now();
      const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(worldState);
      const saveEnd = performance.now();

      const saveTime = saveEnd - saveStart;
      console.log(`Checkpoint save for ${characters.length} characters: ${saveTime}ms`);

      expect(checkpoint).toBeDefined();
      expect(checkpoint.characterStates.size).toBe(characters.length);
      expect(saveTime).toBeLessThan(500); // Should save within 500ms

      // Test checkpoint restore performance
      const restoreStart = performance.now();
      const restoreResult = ConsciousnessCheckpointService.restoreCheckpoint(worldState, checkpoint);
      const restoreEnd = performance.now();

      const restoreTime = restoreEnd - restoreStart;
      console.log(`Checkpoint restore for ${characters.length} characters: ${restoreTime}ms`);

      expect(restoreResult.success).toBe(true);
      expect(restoreTime).toBeLessThan(500); // Should restore within 500ms
    });
  });

  describe('Concurrent Processing Tests', () => {
    test('should handle concurrent consciousness updates safely', async () => {
      const character = new Character({
        id: 'concurrent-char',
        name: 'Concurrent Character',
        consciousness: new ConsciousnessSystem({
          baseFrequency: 8,
          baseCoherence: 0.7
        })
      });

      const concurrentEvents = [];
      for (let i = 0; i < 20; i++) {
        concurrentEvents.push({
          type: 'concurrent_event',
          outcome: 'success',
          emotionalImpact: 0.5,
          id: i
        });
      }

      // Process events concurrently (simulated)
      const promises = concurrentEvents.map(async (event, index) => {
        // Add small delay to simulate concurrent processing
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
        
        const significance = EventSignificanceService.calculateEventSignificance(event);
        if (significance >= 0.3) {
          return ConsciousnessUpdateService.processEvent(character, event);
        }
        return { updated: false, reason: 'Not significant' };
      });

      const results = await Promise.all(promises);

      // Verify all operations completed successfully
      expect(results.length).toBe(concurrentEvents.length);
      
      // Character should maintain valid state despite concurrent updates
      expect(character.consciousness.baseFrequency).toBeGreaterThanOrEqual(3);
      expect(character.consciousness.baseFrequency).toBeLessThanOrEqual(15);
      expect(character.consciousness.baseCoherence).toBeGreaterThanOrEqual(0.2);
      expect(character.consciousness.baseCoherence).toBeLessThanOrEqual(1.0);

      // Decision factor should still work correctly
      const decisionFactor = BehavioralStateService.calculateDecisionFactor(
        character,
        'social',
        { nodeType: 'settlement' }
      );
      expect(decisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(decisionFactor).toBeLessThanOrEqual(3.0);
    });
  });

  describe('Edge Case Stress Tests', () => {
    test('should handle rapid successive events without degradation', async () => {
      const character = new Character({
        id: 'rapid-events-char',
        name: 'Rapid Events Character',
        consciousness: new ConsciousnessSystem({
          baseFrequency: 8,
          baseCoherence: 0.7
        })
      });

      const rapidEvents = [];
      for (let i = 0; i < 500; i++) {
        rapidEvents.push({
          type: 'rapid_event',
          outcome: i % 3 === 0 ? 'success' : 'failure',
          emotionalImpact: Math.random() * 0.8,
          timestamp: Date.now() + i
        });
      }

      const startRapid = performance.now();
      let processedCount = 0;

      rapidEvents.forEach(event => {
        const significance = EventSignificanceService.calculateEventSignificance(event);
        if (significance >= 0.3) {
          ConsciousnessUpdateService.processEvent(character, event);
          processedCount++;
        }
      });

      const endRapid = performance.now();
      const rapidTime = endRapid - startRapid;

      console.log(`Processed ${processedCount} significant events out of ${rapidEvents.length} in ${rapidTime}ms`);

      expect(rapidTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(processedCount).toBeGreaterThan(0); // Some events should be significant

      // Character should maintain valid state
      expect(character.consciousness.baseFrequency).toBeGreaterThanOrEqual(3);
      expect(character.consciousness.baseFrequency).toBeLessThanOrEqual(15);
      expect(character.consciousness.baseCoherence).toBeGreaterThanOrEqual(0.2);
      expect(character.consciousness.baseCoherence).toBeLessThanOrEqual(1.0);
    });

    test('should handle memory overflow gracefully', async () => {
      const character = new Character({
        id: 'memory-overflow-char',
        name: 'Memory Overflow Character',
        consciousness: new ConsciousnessSystem({
          baseFrequency: 8,
          baseCoherence: 0.7
        })
      });

      // Force memory overflow by adding many significant memories
      const overflowStart = performance.now();
      for (let i = 0; i < 200; i++) {
        SignificantMemoryService.addMemoryIfSignificant(
          character,
          { type: 'overflow_test', id: `overflow-${i}` },
          { success: true, significance: 0.8 } // High significance to ensure addition
        );
      }
      const overflowEnd = performance.now();

      const overflowTime = overflowEnd - overflowStart;
      console.log(`Memory overflow test completed in ${overflowTime}ms`);

      // Verify memory limit is enforced
      const memories = character.consciousness.significantMemories || [];
      expect(memories.length).toBeLessThanOrEqual(50);
      expect(overflowTime).toBeLessThan(1000); // Should handle overflow efficiently

      // Decision calculation should still work
      const decisionFactor = BehavioralStateService.calculateDecisionFactor(
        character,
        'social',
        { nodeType: 'settlement' }
      );
      expect(decisionFactor).toBeGreaterThanOrEqual(0.1);
      expect(decisionFactor).toBeLessThanOrEqual(3.0);
    });
  });
});