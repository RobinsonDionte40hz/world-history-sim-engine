/**
 * Emotional System Integration Test Suite
 * 
 * Tests for emotional state tracking, frequency-to-emotion mapping,
 * behavioral modifiers, and integration with consciousness and decision-making systems.
 */

import ConsciousnessSystem from '../../domain/value-objects/ConsciousnessSystem.js';
import EmotionalUtils from '../../shared/utils/EmotionalUtils.js';

describe('Emotional System Integration', () => {
  let consciousnessSystem;
  let mockCharacter;

  beforeEach(() => {
    consciousnessSystem = new ConsciousnessSystem();
    
    // Create a simple mock character without complex mocking
    mockCharacter = {
      id: 'emotional-test-char',
      name: 'Emotional Test Character',
      energy: 60,
      maxEnergy: 100,
      consciousness: { 
        frequency: 42, 
        coherence: 0.75,
        emotionalModifiers: new Map()
      },
      personality: {
        traits: {
          empathy: 0.7,
          aggression: 0.2,
          patience: 0.8,
          ambition: 0.5,
          loyalty: 0.9,
          curiosity: 0.6,
          volatility: 0.4
        },
        emotionalTendencies: new Map([
          ['happiness', 0.7],
          ['anger', 0.2],
          ['fear', 0.3],
          ['sadness', 0.3]
        ])
      },
      goals: [
        { id: 'socialize', priority: 7 },
        { id: 'rest', priority: 5 }
      ],
      decisionHistory: []
    };
  });

  describe('Frequency-to-Emotion Mapping', () => {
    test('should map low frequency to tired state', () => {
      const lowFreqCharacter = { ...mockCharacter, consciousness: { frequency: 25, coherence: 0.6 } };
      const emotionalState = consciousnessSystem.getCurrentEmotionalState(lowFreqCharacter);
      
      expect(emotionalState.primaryEmotion).toBe('tired');
      expect(emotionalState.intensity).toBeGreaterThan(0);
      expect(emotionalState.intensity).toBeLessThanOrEqual(1);
    });

    test('should map moderate frequency to content state', () => {
      const modFreqCharacter = { ...mockCharacter, consciousness: { frequency: 40, coherence: 0.8 } };
      const emotionalState = consciousnessSystem.getCurrentEmotionalState(modFreqCharacter);
      
      expect(emotionalState.primaryEmotion).toBe('content');
      expect(emotionalState.intensity).toBeGreaterThan(0);
    });

    test('should map high frequency to alert state', () => {
      const highFreqCharacter = { ...mockCharacter, consciousness: { frequency: 55, coherence: 0.9 } };
      const emotionalState = consciousnessSystem.getCurrentEmotionalState(highFreqCharacter);
      
      expect(emotionalState.primaryEmotion).toBe('alert');
      expect(emotionalState.intensity).toBeGreaterThan(0);
    });

    test('should map very high frequency to energized state', () => {
      const veryHighFreqCharacter = { ...mockCharacter, consciousness: { frequency: 70, coherence: 0.95 } };
      const emotionalState = consciousnessSystem.getCurrentEmotionalState(veryHighFreqCharacter);
      
      expect(emotionalState.primaryEmotion).toBe('energized');
      expect(emotionalState.intensity).toBeGreaterThan(0);
    });

    test('should consider coherence in emotional intensity calculation', () => {
      const lowCoherenceChar = { ...mockCharacter, consciousness: { frequency: 40, coherence: 0.3 } };
      const highCoherenceChar = { ...mockCharacter, consciousness: { frequency: 40, coherence: 0.9 } };
      
      const lowCoherenceState = consciousnessSystem.getCurrentEmotionalState(lowCoherenceChar);
      const highCoherenceState = consciousnessSystem.getCurrentEmotionalState(highCoherenceChar);
      
      expect(highCoherenceState.intensity).toBeGreaterThan(lowCoherenceState.intensity);
    });
  });

  describe('Emotional Event Processing', () => {
    test('should apply positive emotional events correctly', () => {
      const updatedCharacter = consciousnessSystem.applyEmotionalEvent(
        mockCharacter,
        'success',
        0.8,
        10
      );
      
      expect(updatedCharacter.consciousness.emotionalModifiers.has('success')).toBe(true);
      const modifier = updatedCharacter.consciousness.emotionalModifiers.get('success');
      expect(modifier.intensity).toBe(0.8);
      expect(modifier.duration).toBe(10);
      expect(modifier.type).toBe('success');
    });

    test('should apply negative emotional events correctly', () => {
      const updatedCharacter = consciousnessSystem.applyEmotionalEvent(
        mockCharacter,
        'failure',
        0.6,
        8
      );
      
      expect(updatedCharacter.consciousness.emotionalModifiers.has('failure')).toBe(true);
      const modifier = updatedCharacter.consciousness.emotionalModifiers.get('failure');
      expect(modifier.intensity).toBe(0.6);
      expect(modifier.duration).toBe(8);
      expect(modifier.type).toBe('failure');
    });

    test('should handle multiple overlapping emotional events', () => {
      let character = consciousnessSystem.applyEmotionalEvent(mockCharacter, 'success', 0.7, 5);
      character = consciousnessSystem.applyEmotionalEvent(character, 'social_positive', 0.5, 8);
      
      expect(character.consciousness.emotionalModifiers.size).toBe(2);
      expect(character.consciousness.emotionalModifiers.has('success')).toBe(true);
      expect(character.consciousness.emotionalModifiers.has('social_positive')).toBe(true);
    });
  });

  describe('Behavioral Modifiers', () => {
    test('should provide appropriate modifiers for tired emotion', () => {
      const modifier = EmotionalUtils.getEmotionalModifier('tired', 0.8);
      
      expect(modifier.socialInteraction).toBeLessThan(1.0);
      expect(modifier.riskTaking).toBeLessThan(1.0);
      expect(modifier.energyEfficiency).toBeLessThan(1.0);
      expect(modifier.conflictAvoidance).toBeGreaterThan(1.0);
    });

    test('should provide appropriate modifiers for energized emotion', () => {
      const modifier = EmotionalUtils.getEmotionalModifier('energized', 0.9);
      
      expect(modifier.socialInteraction).toBeGreaterThan(1.0);
      expect(modifier.riskTaking).toBeGreaterThan(1.0);
      expect(modifier.energyEfficiency).toBeGreaterThan(1.0);
      expect(modifier.decisionSpeed).toBeGreaterThan(1.0);
    });

    test('should scale modifiers with emotion intensity', () => {
      const lowIntensity = EmotionalUtils.getEmotionalModifier('alert', 0.3);
      const highIntensity = EmotionalUtils.getEmotionalModifier('alert', 0.9);
      
      expect(Math.abs(highIntensity.socialInteraction - 1.0)).toBeGreaterThan(
        Math.abs(lowIntensity.socialInteraction - 1.0)
      );
    });
  });

  describe('Emotional Reactions', () => {
    test('should calculate appropriate reactions for different event types', () => {
      const successReaction = EmotionalUtils.getEmotionalReaction(mockCharacter, 'success', 0.8);
      const failureReaction = EmotionalUtils.getEmotionalReaction(mockCharacter, 'failure', 0.7);
      
      expect(successReaction.intensity).toBeGreaterThan(0);
      expect(successReaction.duration).toBeGreaterThan(0);
      expect(successReaction.frequencyChange).toBeGreaterThan(0);
      
      expect(failureReaction.intensity).toBeGreaterThan(0);
      expect(failureReaction.duration).toBeGreaterThan(0);
      expect(failureReaction.frequencyChange).toBeLessThan(0);
    });

    test('should consider personality traits in emotional reactions', () => {
      const empathicCharacter = {
        ...mockCharacter,
        personality: {
          ...mockCharacter.personality,
          traits: {
            ...mockCharacter.personality.traits,
            empathy: 0.9
          }
        }
      };

      const lowEmpathyCharacter = {
        ...mockCharacter,
        personality: {
          ...mockCharacter.personality,
          traits: {
            ...mockCharacter.personality.traits,
            empathy: 0.2
          }
        }
      };

      const empathicReaction = EmotionalUtils.getEmotionalReaction(empathicCharacter, 'social_positive', 0.7);
      const lowEmpathyReaction = EmotionalUtils.getEmotionalReaction(lowEmpathyCharacter, 'social_positive', 0.7);

      expect(empathicReaction.intensity).toBeGreaterThan(lowEmpathyReaction.intensity);
    });
  });

  describe('Emotional Contagion', () => {
    test('should calculate emotional contagion between characters', () => {
      const happyCharacter = {
        ...mockCharacter,
        consciousness: { frequency: 50, coherence: 0.8 }
      };

      const neutralCharacter = {
        ...mockCharacter,
        id: 'neutral-char',
        consciousness: { frequency: 40, coherence: 0.7 }
      };

      const contagion = EmotionalUtils.calculateEmotionalContagion(
        happyCharacter,
        neutralCharacter,
        0.5
      );

      expect(contagion.effect).toBeGreaterThan(0);
      expect(contagion.targetEmotion).toBeDefined();
      expect(contagion.intensity).toBeGreaterThan(0);
      expect(contagion.intensity).toBeLessThanOrEqual(1);
    });

    test('should consider empathy in emotional contagion', () => {
      const sourceChar = {
        ...mockCharacter,
        consciousness: { frequency: 55, coherence: 0.9 }
      };

      const highEmpathyTarget = {
        ...mockCharacter,
        id: 'high-empathy',
        personality: {
          ...mockCharacter.personality,
          traits: { ...mockCharacter.personality.traits, empathy: 0.9 }
        }
      };

      const lowEmpathyTarget = {
        ...mockCharacter,
        id: 'low-empathy',
        personality: {
          ...mockCharacter.personality,
          traits: { ...mockCharacter.personality.traits, empathy: 0.2 }
        }
      };

      const highEmpathyContagion = EmotionalUtils.calculateEmotionalContagion(sourceChar, highEmpathyTarget, 0.7);
      const lowEmpathyContagion = EmotionalUtils.calculateEmotionalContagion(sourceChar, lowEmpathyTarget, 0.7);

      expect(highEmpathyContagion.effect).toBeGreaterThan(lowEmpathyContagion.effect);
    });
  });

  describe('System Integration', () => {
    test('should handle characters with missing consciousness data', () => {
      const incompleteCharacter = {
        ...mockCharacter,
        consciousness: null
      };

      expect(() => {
        consciousnessSystem.getCurrentEmotionalState(incompleteCharacter);
      }).not.toThrow();
    });

    test('should maintain emotional state consistency across multiple updates', () => {
      let character = mockCharacter;
      
      character = consciousnessSystem.applyEmotionalEvent(character, 'success', 0.7, 5);
      character = consciousnessSystem.applyEmotionalEvent(character, 'social_positive', 0.6, 8);
      
      const firstState = consciousnessSystem.getCurrentEmotionalState(character);
      
      character = consciousnessSystem.applyEmotionalEvent(character, 'achievement', 0.8, 6);
      
      const secondState = consciousnessSystem.getCurrentEmotionalState(character);
      
      expect(firstState.primaryEmotion).toBeDefined();
      expect(secondState.primaryEmotion).toBeDefined();
      expect(typeof firstState.intensity).toBe('number');
      expect(typeof secondState.intensity).toBe('number');
    });

    test('should handle extreme values gracefully', () => {
      const extremeCharacter = {
        ...mockCharacter,
        consciousness: { frequency: 1000, coherence: 1.0 }
      };

      const emotionalState = consciousnessSystem.getCurrentEmotionalState(extremeCharacter);
      expect(emotionalState.primaryEmotion).toBeDefined();
      expect(emotionalState.intensity).toBeGreaterThan(0);
      expect(emotionalState.intensity).toBeLessThanOrEqual(1);
    });
  });
});
