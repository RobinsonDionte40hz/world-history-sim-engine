/**
 * Emotional Conflict Resolution Test Suite
 * 
 * Tests for complex emotional state handling when multiple emotions overlap.
 */

import EmotionalUtils from '../../shared/utils/EmotionalUtils.js';

describe('Emotional Conflict Resolution', () => {
  describe('resolveEmotionalConflicts', () => {
    test('should handle single emotion without conflicts', () => {
      const emotions = [{ primary: 'happy', intensity: 0.7, duration: 60 }];
      const result = EmotionalUtils.resolveEmotionalConflicts(emotions);
      
      expect(result.primary).toBe('happy');
      expect(result.intensity).toBe(0.7);
    });

    test('should resolve joyful + sad conflict to bittersweet', () => {
      const emotions = [
        { primary: 'joyful', intensity: 0.8, duration: 120 },
        { primary: 'sad', intensity: 0.6, duration: 180 }
      ];
      const result = EmotionalUtils.resolveEmotionalConflicts(emotions);
      
      expect(result.primary).toBe('bittersweet');
      expect(result.isComplex).toBe(true);
      expect(result.conflictedEmotions).toContain('joyful');
      expect(result.conflictedEmotions).toContain('sad');
      expect(result.description).toBe('Mixed feelings of joy and sadness');
      expect(result.intensity).toBeGreaterThan(0.6); // Should be amplified by conflict
    });

    test('should resolve angry + content conflict to conflicted', () => {
      const emotions = [
        { primary: 'angry', intensity: 0.7, duration: 90 },
        { primary: 'content', intensity: 0.5, duration: 150 }
      ];
      const result = EmotionalUtils.resolveEmotionalConflicts(emotions);
      
      expect(result.primary).toBe('conflicted');
      expect(result.isComplex).toBe(true);
      expect(result.conflictedEmotions).toContain('angry');
      expect(result.conflictedEmotions).toContain('content');
      expect(result.description).toBe('Internal struggle between anger and contentment');
    });

    test('should resolve excited + anxious to nervous_excitement', () => {
      const emotions = [
        { primary: 'excited', intensity: 0.9, duration: 60 },
        { primary: 'anxious', intensity: 0.7, duration: 120 }
      ];
      const result = EmotionalUtils.resolveEmotionalConflicts(emotions);
      
      expect(result.primary).toBe('nervous_excitement');
      expect(result.isComplex).toBe(true);
      expect(result.description).toBe('Excited but with underlying anxiety');
    });

    test('should handle multiple conflicts and choose first match', () => {
      const emotions = [
        { primary: 'joyful', intensity: 0.6, duration: 90 },
        { primary: 'sad', intensity: 0.5, duration: 120 },
        { primary: 'angry', intensity: 0.4, duration: 80 }
      ];
      const result = EmotionalUtils.resolveEmotionalConflicts(emotions);
      
      // Should resolve joyful + sad first (appears first in conflict pairs)
      expect(result.primary).toBe('bittersweet');
      expect(result.isComplex).toBe(true);
    });

    test('should blend emotions when no conflicts found', () => {
      const emotions = [
        { primary: 'happy', intensity: 0.8, duration: 100 },
        { primary: 'satisfied', intensity: 0.6, duration: 80 },
        { primary: 'curious', intensity: 0.4, duration: 60 }
      ];
      const result = EmotionalUtils.resolveEmotionalConflicts(emotions);
      
      expect(result.primary).toBe('happy'); // Strongest emotion
      expect(result.secondary).toBe('satisfied'); // Second strongest
      expect(result.isBlended).toBe(true);
      expect(result.components).toHaveLength(3);
    });

    test('should include non-conflicting emotions as modifiers', () => {
      const emotions = [
        { primary: 'joyful', intensity: 0.7, duration: 90 },
        { primary: 'sad', intensity: 0.5, duration: 120 },
        { primary: 'curious', intensity: 0.4, duration: 60 }
      ];
      const result = EmotionalUtils.resolveEmotionalConflicts(emotions);
      
      expect(result.primary).toBe('bittersweet');
      expect(result.modifiers).toHaveLength(1);
      expect(result.modifiers[0].primary).toBe('curious');
    });

    test('should handle edge cases gracefully', () => {
      expect(EmotionalUtils.resolveEmotionalConflicts(null)).toBeNull();
      expect(EmotionalUtils.resolveEmotionalConflicts([])).toEqual([]);
      expect(EmotionalUtils.resolveEmotionalConflicts([{}])).toEqual({});
    });
  });

  describe('getComplexEmotionalModifier', () => {
    test('should provide modifiers for bittersweet emotion', () => {
      const emotion = {
        primary: 'bittersweet',
        intensity: 0.8,
        isComplex: true
      };
      const interaction = { type: 'creative' };
      
      const modifier = EmotionalUtils.getComplexEmotionalModifier(emotion, interaction);
      expect(modifier).toBeGreaterThan(1.0); // Enhanced creativity
    });

    test('should provide modifiers for conflicted emotion', () => {
      const emotion = {
        primary: 'conflicted',
        intensity: 0.7,
        isComplex: true
      };
      const interaction = { type: 'decision_making' };
      
      const modifier = EmotionalUtils.getComplexEmotionalModifier(emotion, interaction);
      expect(modifier).toBeLessThan(1.0); // Poor decision making when conflicted
    });

    test('should provide modifiers for nervous_excitement', () => {
      const emotion = {
        primary: 'nervous_excitement',
        intensity: 0.9,
        isComplex: true
      };
      const interaction = { type: 'impulsive' };
      
      const modifier = EmotionalUtils.getComplexEmotionalModifier(emotion, interaction);
      expect(modifier).toBeGreaterThan(1.0); // More impulsive when nervous excited
    });

    test('should handle frantic emotion', () => {
      const emotion = {
        primary: 'frantic',
        intensity: 0.8,
        isComplex: true
      };
      const interaction = { type: 'focus' };
      
      const modifier = EmotionalUtils.getComplexEmotionalModifier(emotion, interaction);
      expect(modifier).toBeLessThan(1.0); // Poor focus when frantic
    });

    test('should scale modifiers with intensity', () => {
      const lowIntensity = {
        primary: 'ambivalent',
        intensity: 0.3,
        isComplex: true
      };
      const highIntensity = {
        primary: 'ambivalent',
        intensity: 0.9,
        isComplex: true
      };
      const interaction = { type: 'hesitation' };
      
      const lowModifier = EmotionalUtils.getComplexEmotionalModifier(lowIntensity, interaction);
      const highModifier = EmotionalUtils.getComplexEmotionalModifier(highIntensity, interaction);
      
      expect(Math.abs(highModifier - 1.0)).toBeGreaterThan(Math.abs(lowModifier - 1.0));
    });

    test('should clamp modifiers to reasonable bounds', () => {
      const extremeEmotion = {
        primary: 'frantic',
        intensity: 1.0,
        isComplex: true
      };
      const interaction = { type: 'hyperactive' };
      
      const modifier = EmotionalUtils.getComplexEmotionalModifier(extremeEmotion, interaction);
      expect(modifier).toBeGreaterThan(0.1);
      expect(modifier).toBeLessThan(3.0);
    });

    test('should fallback to regular modifier for non-complex emotions', () => {
      const regularEmotion = {
        primary: 'happy',
        intensity: 0.7
      };
      const interaction = { type: 'social' };
      
      const modifier = EmotionalUtils.getComplexEmotionalModifier(regularEmotion, interaction);
      expect(modifier).toBeDefined();
      expect(typeof modifier).toBe('number');
    });

    test('should handle unknown complex emotions', () => {
      const unknownEmotion = {
        primary: 'unknown_complex_emotion',
        intensity: 0.6,
        isComplex: true
      };
      const interaction = { type: 'social' };
      
      const modifier = EmotionalUtils.getComplexEmotionalModifier(unknownEmotion, interaction);
      expect(modifier).toBe(1.0); // Should default to neutral
    });
  });

  describe('Emotional Blend Scenarios', () => {
    test('should properly blend similar intensity emotions', () => {
      const emotions = [
        { primary: 'happy', intensity: 0.7, duration: 100 },
        { primary: 'content', intensity: 0.6, duration: 120 },
        { primary: 'satisfied', intensity: 0.5, duration: 90 }
      ];
      const result = EmotionalUtils.resolveEmotionalConflicts(emotions);
      
      expect(result.isBlended).toBe(true);
      expect(result.primary).toBe('happy');
      expect(result.secondary).toBe('content');
      expect(result.intensity).toBeCloseTo(0.67, 1); // 0.7 * 0.7 + 0.6 * 0.3
    });

    test('should handle emotions with varying durations', () => {
      const emotions = [
        { primary: 'excited', intensity: 0.9, duration: 30 }, // Short but intense
        { primary: 'content', intensity: 0.5, duration: 300 } // Long but mild
      ];
      const result = EmotionalUtils.resolveEmotionalConflicts(emotions);
      
      expect(result.duration).toBe(300); // Should take max duration
      expect(result.primary).toBe('excited'); // Should prioritize intensity
    });

    test('should limit component emotions to top 3', () => {
      const emotions = [
        { primary: 'happy', intensity: 0.8, duration: 100 },
        { primary: 'excited', intensity: 0.7, duration: 90 },
        { primary: 'content', intensity: 0.6, duration: 120 },
        { primary: 'satisfied', intensity: 0.5, duration: 80 },
        { primary: 'curious', intensity: 0.4, duration: 60 }
      ];
      const result = EmotionalUtils.resolveEmotionalConflicts(emotions);
      
      expect(result.components).toHaveLength(3);
      expect(result.components[0].primary || result.components[0]).toBe('happy');
      expect(result.components[1].primary || result.components[1]).toBe('excited');
      expect(result.components[2].primary || result.components[2]).toBe('content');
    });
  });

  describe('Real-World Conflict Scenarios', () => {
    test('should handle graduation scenario (proud + anxious)', () => {
      const emotions = [
        { primary: 'proud', intensity: 0.8, duration: 180 },
        { primary: 'anxious', intensity: 0.6, duration: 240 }
      ];
      const result = EmotionalUtils.resolveEmotionalConflicts(emotions);
      
      // Should blend since proud + anxious isn't a defined conflict pair
      expect(result.isBlended).toBe(true);
      expect(result.primary).toBe('proud');
      expect(result.secondary).toBe('anxious');
    });

    test('should handle breakup scenario (sad + angry)', () => {
      const emotions = [
        { primary: 'sad', intensity: 0.7, duration: 300 },
        { primary: 'angry', intensity: 0.8, duration: 120 }
      ];
      const result = EmotionalUtils.resolveEmotionalConflicts(emotions);
      
      // Should blend since sad + angry isn't a defined conflict pair
      expect(result.isBlended).toBe(true);
      expect(result.primary).toBe('angry'); // Stronger intensity
      expect(result.secondary).toBe('sad');
    });

    test('should handle achievement with loss scenario', () => {
      const emotions = [
        { primary: 'joyful', intensity: 0.6, duration: 120 }, // Achievement
        { primary: 'sad', intensity: 0.7, duration: 200 }     // Loss
      ];
      const result = EmotionalUtils.resolveEmotionalConflicts(emotions);
      
      expect(result.primary).toBe('bittersweet');
      expect(result.isComplex).toBe(true);
      expect(result.description).toBe('Mixed feelings of joy and sadness');
    });
  });
});
