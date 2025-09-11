/**
 * EmotionalUtils Unit Test Suite
 * 
 * Tests for emotional utility functions including behavioral modifiers,
 * emotional reactions, and contagion calculations.
 */

import EmotionalUtils from '../../shared/utils/EmotionalUtils.js';

describe('EmotionalUtils', () => {
  describe('getEmotionalModifier', () => {
    test('should return correct modifiers for tired emotion', () => {
      const modifier = EmotionalUtils.getEmotionalModifier('tired', 0.8);
      
      expect(modifier).toEqual({
        socialInteraction: 0.6,
        riskTaking: 0.5,
        energyEfficiency: 0.7,
        conflictAvoidance: 1.4,
        decisionSpeed: 0.8,
        creativity: 0.6,
        patience: 1.2
      });
    });

    test('should return correct modifiers for content emotion', () => {
      const modifier = EmotionalUtils.getEmotionalModifier('content', 0.7);
      
      expect(modifier).toEqual({
        socialInteraction: 1.0,
        riskTaking: 0.9,
        energyEfficiency: 1.1,
        conflictAvoidance: 1.1,
        decisionSpeed: 1.0,
        creativity: 1.0,
        patience: 1.2
      });
    });

    test('should return correct modifiers for alert emotion', () => {
      const modifier = EmotionalUtils.getEmotionalModifier('alert', 0.9);
      
      expect(modifier).toEqual({
        socialInteraction: 1.2,
        riskTaking: 1.1,
        energyEfficiency: 1.2,
        conflictAvoidance: 0.8,
        decisionSpeed: 1.3,
        creativity: 1.1,
        patience: 0.9
      });
    });

    test('should return correct modifiers for energized emotion', () => {
      const modifier = EmotionalUtils.getEmotionalModifier('energized', 0.85);
      
      expect(modifier).toEqual({
        socialInteraction: 1.4,
        riskTaking: 1.3,
        energyEfficiency: 1.3,
        conflictAvoidance: 0.6,
        decisionSpeed: 1.4,
        creativity: 1.3,
        patience: 0.7
      });
    });

    test('should return neutral modifiers for unknown emotion', () => {
      const modifier = EmotionalUtils.getEmotionalModifier('unknown', 0.5);
      
      expect(modifier).toEqual({
        socialInteraction: 1.0,
        riskTaking: 1.0,
        energyEfficiency: 1.0,
        conflictAvoidance: 1.0,
        decisionSpeed: 1.0,
        creativity: 1.0,
        patience: 1.0
      });
    });

    test('should handle edge case intensities', () => {
      const zeroIntensity = EmotionalUtils.getEmotionalModifier('alert', 0);
      const maxIntensity = EmotionalUtils.getEmotionalModifier('alert', 1.0);
      const overMaxIntensity = EmotionalUtils.getEmotionalModifier('alert', 1.5);
      
      expect(zeroIntensity.socialInteraction).toBe(1.0); // Should return neutral at 0 intensity
      expect(maxIntensity.socialInteraction).toBeGreaterThan(1.0);
      expect(overMaxIntensity.socialInteraction).toBe(maxIntensity.socialInteraction); // Should cap at 1.0
    });
  });

  describe('getEmotionalReaction', () => {
    let mockCharacter;

    beforeEach(() => {
      mockCharacter = {
        personality: {
          traits: {
            empathy: 0.7,
            aggression: 0.3,
            patience: 0.8,
            volatility: 0.4
          },
          emotionalTendencies: new Map([
            ['happiness', 0.6],
            ['anger', 0.3],
            ['fear', 0.4],
            ['sadness', 0.2]
          ])
        }
      };
    });

    test('should calculate reaction for success event', () => {
      const reaction = EmotionalUtils.getEmotionalReaction(mockCharacter, 'success', 0.8);
      
      expect(reaction.intensity).toBeGreaterThan(0);
      expect(reaction.intensity).toBeLessThanOrEqual(1);
      expect(reaction.duration).toBeGreaterThan(0);
      expect(typeof reaction.frequencyChange).toBe('number');
    });

    test('should calculate reaction for failure event', () => {
      const reaction = EmotionalUtils.getEmotionalReaction(mockCharacter, 'failure', 0.7);
      
      expect(reaction.intensity).toBeGreaterThan(0);
      expect(reaction.duration).toBeGreaterThan(0);
      expect(reaction.frequencyChange).toBeLessThan(0); // Failure should decrease frequency
    });

    test('should calculate reaction for social_positive event', () => {
      const reaction = EmotionalUtils.getEmotionalReaction(mockCharacter, 'social_positive', 0.6);
      
      expect(reaction.intensity).toBeGreaterThan(0);
      expect(reaction.duration).toBeGreaterThan(0);
      expect(reaction.frequencyChange).toBeGreaterThan(0); // Positive social should increase frequency
    });

    test('should consider empathy in social reactions', () => {
      const highEmpathyChar = {
        ...mockCharacter,
        personality: {
          ...mockCharacter.personality,
          traits: { ...mockCharacter.personality.traits, empathy: 0.9 }
        }
      };

      const lowEmpathyChar = {
        ...mockCharacter,
        personality: {
          ...mockCharacter.personality,
          traits: { ...mockCharacter.personality.traits, empathy: 0.2 }
        }
      };

      const highEmpathyReaction = EmotionalUtils.getEmotionalReaction(
        highEmpathyChar, 'social_positive', 0.7
      );
      const lowEmpathyReaction = EmotionalUtils.getEmotionalReaction(
        lowEmpathyChar, 'social_positive', 0.7
      );

      expect(highEmpathyReaction.intensity).toBeGreaterThan(lowEmpathyReaction.intensity);
    });

    test('should consider volatility in reaction intensity', () => {
      const highVolatilityChar = {
        ...mockCharacter,
        personality: {
          ...mockCharacter.personality,
          traits: { ...mockCharacter.personality.traits, volatility: 0.9 }
        }
      };

      const lowVolatilityChar = {
        ...mockCharacter,
        personality: {
          ...mockCharacter.personality,
          traits: { ...mockCharacter.personality.traits, volatility: 0.2 }
        }
      };

      const highVolatilityReaction = EmotionalUtils.getEmotionalReaction(
        highVolatilityChar, 'conflict', 0.7
      );
      const lowVolatilityReaction = EmotionalUtils.getEmotionalReaction(
        lowVolatilityChar, 'conflict', 0.7
      );

      expect(highVolatilityReaction.intensity).toBeGreaterThan(lowVolatilityReaction.intensity);
    });

    test('should handle unknown event types', () => {
      const reaction = EmotionalUtils.getEmotionalReaction(mockCharacter, 'unknown_event', 0.5);
      
      expect(reaction.intensity).toBeGreaterThan(0);
      expect(reaction.duration).toBeGreaterThan(0);
      expect(reaction.frequencyChange).toBe(0); // Unknown events should have neutral frequency change
    });
  });

  describe('calculateEmotionalContagion', () => {
    let sourceCharacter, targetCharacter;

    beforeEach(() => {
      sourceCharacter = {
        consciousness: { frequency: 55, coherence: 0.8 },
        personality: {
          traits: { empathy: 0.6, charisma: 0.7 },
          emotionalTendencies: new Map([['happiness', 0.7]])
        }
      };

      targetCharacter = {
        consciousness: { frequency: 40, coherence: 0.7 },
        personality: {
          traits: { empathy: 0.5, suggestibility: 0.6 },
          emotionalTendencies: new Map([['happiness', 0.5]])
        }
      };
    });

    test('should calculate basic emotional contagion', () => {
      const contagion = EmotionalUtils.calculateEmotionalContagion(
        sourceCharacter,
        targetCharacter,
        0.7
      );

      expect(contagion.effect).toBeGreaterThan(0);
      expect(contagion.effect).toBeLessThanOrEqual(1);
      expect(contagion.targetEmotion).toBeDefined();
      expect(contagion.intensity).toBeGreaterThan(0);
      expect(contagion.intensity).toBeLessThanOrEqual(1);
      expect(typeof contagion.frequencyShift).toBe('number');
    });

    test('should consider empathy in contagion strength', () => {
      const highEmpathyTarget = {
        ...targetCharacter,
        personality: {
          ...targetCharacter.personality,
          traits: { ...targetCharacter.personality.traits, empathy: 0.9 }
        }
      };

      const lowEmpathyTarget = {
        ...targetCharacter,
        personality: {
          ...targetCharacter.personality,
          traits: { ...targetCharacter.personality.traits, empathy: 0.2 }
        }
      };

      const highEmpathyContagion = EmotionalUtils.calculateEmotionalContagion(
        sourceCharacter,
        highEmpathyTarget,
        0.7
      );

      const lowEmpathyContagion = EmotionalUtils.calculateEmotionalContagion(
        sourceCharacter,
        lowEmpathyTarget,
        0.7
      );

      expect(highEmpathyContagion.effect).toBeGreaterThan(lowEmpathyContagion.effect);
    });

    test('should consider interaction strength', () => {
      const strongInteraction = EmotionalUtils.calculateEmotionalContagion(
        sourceCharacter,
        targetCharacter,
        0.9
      );

      const weakInteraction = EmotionalUtils.calculateEmotionalContagion(
        sourceCharacter,
        targetCharacter,
        0.3
      );

      expect(strongInteraction.effect).toBeGreaterThan(weakInteraction.effect);
    });

    test('should handle characters with similar emotional states', () => {
      const similarTarget = {
        ...targetCharacter,
        consciousness: { frequency: 54, coherence: 0.8 } // Very similar to source
      };

      const contagion = EmotionalUtils.calculateEmotionalContagion(
        sourceCharacter,
        similarTarget,
        0.7
      );

      // Should still have some effect but potentially reduced due to similarity
      expect(contagion.effect).toBeGreaterThan(0);
      expect(Math.abs(contagion.frequencyShift)).toBeLessThan(5); // Small shift due to similarity
    });

    test('should handle extreme frequency differences', () => {
      const extremeSource = {
        ...sourceCharacter,
        consciousness: { frequency: 80, coherence: 0.9 }
      };

      const lowTarget = {
        ...targetCharacter,
        consciousness: { frequency: 20, coherence: 0.5 }
      };

      const contagion = EmotionalUtils.calculateEmotionalContagion(
        extremeSource,
        lowTarget,
        0.8
      );

      expect(contagion.effect).toBeGreaterThan(0);
      expect(contagion.frequencyShift).toBeGreaterThan(0); // Should shift toward higher frequency
    });

    test('should handle missing personality data gracefully', () => {
      const incompleteSource = {
        consciousness: { frequency: 45, coherence: 0.7 },
        personality: { traits: {}, emotionalTendencies: new Map() }
      };

      const contagion = EmotionalUtils.calculateEmotionalContagion(
        incompleteSource,
        targetCharacter,
        0.5
      );

      expect(contagion.effect).toBeGreaterThan(0);
      expect(contagion.targetEmotion).toBeDefined();
      expect(contagion.intensity).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle null/undefined inputs gracefully', () => {
      expect(() => EmotionalUtils.getEmotionalModifier(null, 0.5)).not.toThrow();
      expect(() => EmotionalUtils.getEmotionalModifier('alert', null)).not.toThrow();
      expect(() => EmotionalUtils.getEmotionalReaction(null, 'success', 0.5)).not.toThrow();
      expect(() => EmotionalUtils.calculateEmotionalContagion(null, null, 0.5)).not.toThrow();
    });

    test('should handle negative intensities', () => {
      const modifier = EmotionalUtils.getEmotionalModifier('alert', -0.5);
      expect(modifier.socialInteraction).toBe(1.0); // Should default to neutral
    });

    test('should handle very large intensities', () => {
      const modifier = EmotionalUtils.getEmotionalModifier('energized', 10.0);
      // Should cap the effect at reasonable levels
      expect(modifier.socialInteraction).toBeGreaterThan(1.0);
      expect(modifier.socialInteraction).toBeLessThan(2.0); // Should not be extremely high
    });

    test('should handle empty personality data', () => {
      const emptyPersonalityChar = {
        personality: {
          traits: {},
          emotionalTendencies: new Map()
        }
      };

      const reaction = EmotionalUtils.getEmotionalReaction(
        emptyPersonalityChar,
        'success',
        0.7
      );

      expect(reaction.intensity).toBeGreaterThan(0);
      expect(reaction.duration).toBeGreaterThan(0);
    });

    test('should handle consciousness data edge cases', () => {
      const extremeConsciousness = {
        consciousness: { frequency: -10, coherence: 2.0 },
        personality: { traits: { empathy: 0.5 }, emotionalTendencies: new Map() }
      };

      const normalChar = {
        consciousness: { frequency: 40, coherence: 0.7 },
        personality: { traits: { empathy: 0.5 }, emotionalTendencies: new Map() }
      };

      const contagion = EmotionalUtils.calculateEmotionalContagion(
        extremeConsciousness,
        normalChar,
        0.5
      );

      expect(contagion.effect).toBeGreaterThan(0);
      expect(contagion.targetEmotion).toBeDefined();
    });
  });
});
