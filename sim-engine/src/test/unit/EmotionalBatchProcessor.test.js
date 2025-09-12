/**
 * EmotionalBatchProcessor Performance Test Suite
 * 
 * Tests for high-performance batch processing of emotional updates
 * in large-scale simulations with thousands of NPCs.
 */

import EmotionalBatchProcessor from '../../shared/utils/EmotionalBatchProcessor.js';

describe('EmotionalBatchProcessor Performance', () => {
  let processor;
  let mockCharacters;

  beforeEach(() => {
    processor = new EmotionalBatchProcessor({
      batchSize: 100,
      updateThreshold: 0.01,
      enableCaching: true
    });

    // Create a large set of mock characters for performance testing
    mockCharacters = createMockCharacters(1000);
  });

  function createMockCharacters(count) {
    const characters = [];
    const emotions = ['happy', 'sad', 'angry', 'afraid', 'excited', 'content', 'anxious'];
    
    for (let i = 0; i < count; i++) {
      characters.push({
        id: `char-${i}`,
        consciousness: {
          emotionalState: {
            primary: emotions[i % emotions.length],
            secondary: emotions[(i + 1) % emotions.length],
            intensity: 0.3 + (Math.random() * 0.4), // 0.3-0.7
            coherence: 0.5 + (Math.random() * 0.3), // 0.5-0.8
            frequency: 35 + (Math.random() * 20), // 35-55 Hz
            isComplex: Math.random() > 0.8
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
        }
      });
    }
    
    return characters;
  }

  describe('Batch Processing Performance', () => {
    test('should process 1000 characters efficiently', () => {
      const startTime = performance.now();
      
      const updates = processor.processEmotionalUpdates(mockCharacters, 1.0);
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      expect(processingTime).toBeLessThan(100); // Should complete in under 100ms
      expect(updates.size).toBeGreaterThan(0);
      
      const stats = processor.getPerformanceStats();
      expect(stats.processedCharacters).toBe(1000);
      expect(stats.charactersPerSecond).toBeGreaterThan(10000); // 10k+ chars/sec
    });

    test('should group characters by emotional state efficiently', () => {
      const grouped = processor.groupByEmotionalState(mockCharacters);
      
      expect(grouped.size).toBeGreaterThan(1);
      expect(grouped.size).toBeLessThan(mockCharacters.length); // Should group similar states
      
      // Verify all characters are included
      let totalChars = 0;
      for (const chars of grouped.values()) {
        totalChars += chars.length;
      }
      expect(totalChars).toBe(mockCharacters.length);
    });

    test('should cache decay calculations for performance', () => {
      // First run
      processor.processEmotionalUpdates(mockCharacters, 1.0);
      const firstStats = processor.getPerformanceStats();
      
      // Second run with same delta time should use cache
      processor.processEmotionalUpdates(mockCharacters, 1.0);
      const secondStats = processor.getPerformanceStats();
      
      expect(secondStats.cacheHits).toBeGreaterThan(firstStats.cacheHits);
      expect(secondStats.cacheHitRate).toBeGreaterThan(0);
    });

    test('should handle memory efficiently with large character sets', () => {
      const largeCharacterSet = createMockCharacters(5000);
      
      const updates = processor.processEmotionalUpdates(largeCharacterSet, 1.0);
      const stats = processor.getPerformanceStats();
      
      expect(updates.size).toBeLessThanOrEqual(5000);
      expect(stats.memoryUsage.updatePool).toBeLessThanOrEqual(5000);
      expect(stats.averageProcessingTime).toBeLessThan(500); // Under 500ms for 5k chars
    });
  });

  describe('State Key Generation', () => {
    test('should generate consistent state keys', () => {
      const state1 = {
        primary: 'happy',
        intensity: 0.5,
        coherence: 0.7,
        frequency: 42,
        isComplex: false
      };
      
      const state2 = {
        primary: 'happy',
        intensity: 0.52, // Similar intensity should group together
        coherence: 0.73,
        frequency: 43,
        isComplex: false
      };
      
      const key1 = processor.generateStateKey(state1);
      const key2 = processor.generateStateKey(state2);
      
      expect(key1).toBe(key2); // Should generate same key for similar states
    });

    test('should differentiate complex vs simple emotions', () => {
      const simpleState = {
        primary: 'happy',
        intensity: 0.5,
        coherence: 0.7,
        frequency: 42,
        isComplex: false
      };
      
      const complexState = {
        primary: 'happy',
        intensity: 0.5,
        coherence: 0.7,
        frequency: 42,
        isComplex: true
      };
      
      const simpleKey = processor.generateStateKey(simpleState);
      const complexKey = processor.generateStateKey(complexState);
      
      expect(simpleKey).not.toBe(complexKey);
    });
  });

  describe('Batch Decay Calculations', () => {
    test('should calculate batch decay efficiently', () => {
      const sampleState = {
        primary: 'happy',
        intensity: 0.8,
        coherence: 0.7,
        frequency: 45
      };
      
      const batchDecay = processor.calculateBatchDecay(sampleState, 1.0);
      
      expect(batchDecay.intensityDecay).toBeLessThan(sampleState.intensity);
      expect(batchDecay.coherenceDecay).toBeLessThan(sampleState.coherence);
      expect(batchDecay.memoryConsolidation).toBeDefined();
      expect(batchDecay.conflictResolution).toBeDefined();
    });

    test('should handle different emotion decay rates', () => {
      const fastDecayState = { primary: 'surprised', intensity: 0.8 };
      const slowDecayState = { primary: 'ashamed', intensity: 0.8 };
      
      const fastDecay = processor.calculateBatchDecay(fastDecayState, 1.0);
      const slowDecay = processor.calculateBatchDecay(slowDecayState, 1.0);
      
      expect(fastDecay.intensityDecay).toBeLessThan(slowDecay.intensityDecay);
    });

    test('should calculate memory consolidation correctly', () => {
      const highIntensityState = { primary: 'happy', intensity: 0.9 };
      const lowIntensityState = { primary: 'happy', intensity: 0.3 };
      
      const highDecay = processor.calculateBatchDecay(highIntensityState, 6.0);
      const lowDecay = processor.calculateBatchDecay(lowIntensityState, 6.0);
      
      expect(highDecay.memoryConsolidation.shouldConsolidate).toBe(true);
      expect(lowDecay.memoryConsolidation.shouldConsolidate).toBe(false);
    });
  });

  describe('Batch Transitions', () => {
    test('should process batch transitions efficiently', () => {
      const events = [
        {
          type: 'social',
          participants: ['char-1', 'char-2', 'char-3'],
          emotionalIntensity: 0.7,
          emotionalValence: 0.5,
          primaryEmotion: 'happy'
        },
        {
          type: 'social',
          participants: ['char-2', 'char-4', 'char-5'],
          emotionalIntensity: 0.6,
          emotionalValence: 0.3,
          primaryEmotion: 'happy'
        }
      ];
      
      const transitions = processor.processBatchTransitions(mockCharacters.slice(0, 10), events);
      
      expect(transitions.size).toBeGreaterThan(0);
      expect(transitions.size).toBeLessThanOrEqual(5); // Only affected characters
    });

    test('should group events by type', () => {
      const events = [
        { type: 'social', primaryEmotion: 'happy' },
        { type: 'social', primaryEmotion: 'excited' },
        { type: 'combat', primaryEmotion: 'afraid' },
        { type: 'economic', primaryEmotion: 'anxious' }
      ];
      
      const grouped = processor.groupEventsByType(events);
      
      expect(grouped.get('social')).toHaveLength(2);
      expect(grouped.get('combat')).toHaveLength(1);
      expect(grouped.get('economic')).toHaveLength(1);
    });

    test('should personalize transitions based on personality', () => {
      const character = mockCharacters[0];
      character.personalityProfile.traits.volatility = 0.9; // High volatility
      character.personalityProfile.emotionalTendencies.set('happy', 0.8); // High tendency for happiness
      
      const batchTransition = {
        dominantEmotion: 'happy',
        averageIntensity: 0.5,
        averageValence: 0.3,
        eventCount: 1
      };
      
      const personalized = processor.personalizeTransition(character, batchTransition, []);
      
      expect(personalized.intensity).toBeGreaterThan(batchTransition.averageIntensity);
      expect(personalized.personalityInfluence).toBeGreaterThan(0.9); // Should reflect high volatility
      expect(personalized.tendencyInfluence).toBeGreaterThan(1.0); // Should reflect high tendency
    });
  });

  describe('Change Significance', () => {
    test('should calculate change significance correctly', () => {
      const oldState = {
        intensity: 0.5,
        coherence: 0.7,
        frequency: 40
      };
      
      const newState = {
        intensity: 0.6,
        coherence: 0.6,
        frequency: 45
      };
      
      const significance = processor.calculateChangeSignificance(oldState, newState);
      
      expect(significance).toBeGreaterThan(0);
      expect(significance).toBeLessThan(1);
    });

    test('should only store significant changes', () => {
      // Create characters with minimal changes
      const stableCharacters = mockCharacters.slice(0, 10).map(char => ({
        ...char,
        consciousness: {
          emotionalState: {
            primary: 'content',
            intensity: 0.5,
            coherence: 0.7,
            frequency: 40
          }
        }
      }));
      
      const updates = processor.processEmotionalUpdates(stableCharacters, 0.1); // Small time delta
      
      // Should have fewer updates due to significance threshold
      expect(updates.size).toBeLessThan(stableCharacters.length);
    });
  });

  describe('Performance Statistics', () => {
    test('should track performance statistics', () => {
      processor.processEmotionalUpdates(mockCharacters, 1.0);
      
      const stats = processor.getPerformanceStats();
      
      expect(stats.processedCharacters).toBeGreaterThan(0);
      expect(stats.batchesProcessed).toBeGreaterThan(0);
      expect(stats.averageProcessingTime).toBeGreaterThan(0);
      expect(stats.charactersPerSecond).toBeGreaterThan(0);
      expect(stats.memoryUsage).toBeDefined();
    });

    test('should reset statistics correctly', () => {
      processor.processEmotionalUpdates(mockCharacters, 1.0);
      processor.reset();
      
      const stats = processor.getPerformanceStats();
      
      expect(stats.processedCharacters).toBe(0);
      expect(stats.batchesProcessed).toBe(0);
      expect(stats.cacheHits).toBe(0);
      expect(stats.cacheMisses).toBe(0);
    });
  });

  describe('Memory Management', () => {
    test('should maintain cache size limits', () => {
      const smallProcessor = new EmotionalBatchProcessor({
        memoryPoolSize: 10
      });
      
      // Fill cache beyond limit
      for (let i = 0; i < 20; i++) {
        smallProcessor.setCachedDecay(`key-${i}`, { test: i });
      }
      
      const stats = smallProcessor.getPerformanceStats();
      expect(stats.memoryUsage.decayCache).toBeLessThanOrEqual(10);
    });

    test('should handle cache hits and misses', () => {
      const cacheKey = 'test_5_7_4_S_1.0';
      
      // First access should be a miss
      expect(processor.getCachedDecay(cacheKey)).toBeUndefined();
      
      // Set cache value
      processor.setCachedDecay(cacheKey, { intensity: 0.5 });
      
      // Second access should be a hit
      expect(processor.getCachedDecay(cacheKey)).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle characters without consciousness', () => {
      const incompleteCharacters = [
        { id: 'incomplete-1' },
        { id: 'incomplete-2', consciousness: {} },
        ...mockCharacters.slice(0, 3)
      ];
      
      const updates = processor.processEmotionalUpdates(incompleteCharacters, 1.0);
      
      expect(updates.size).toBeLessThanOrEqual(3); // Only complete characters processed
    });

    test('should handle empty character arrays', () => {
      const updates = processor.processEmotionalUpdates([], 1.0);
      
      expect(updates.size).toBe(0);
      
      const stats = processor.getPerformanceStats();
      expect(stats.processedCharacters).toBe(0);
    });

    test('should handle zero delta time', () => {
      const updates = processor.processEmotionalUpdates(mockCharacters.slice(0, 5), 0);
      
      // Should still process but with minimal changes
      expect(updates.size).toBeLessThanOrEqual(5);
    });

    test('should handle very large delta times', () => {
      const updates = processor.processEmotionalUpdates(mockCharacters.slice(0, 5), 100);
      
      // Should process with significant changes
      expect(updates.size).toBeGreaterThan(0);
    });
  });
});