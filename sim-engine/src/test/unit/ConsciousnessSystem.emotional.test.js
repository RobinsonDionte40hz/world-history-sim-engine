/**
 * ConsciousnessSystem Emotional Features Unit Test Suite
 * 
 * Tests for emotional state tracking and event processing in the consciousness system.
 */

import ConsciousnessSystem from '../../domain/value-objects/ConsciousnessSystem.js';

describe('ConsciousnessSystem - Emotional Features', () => {
  let consciousnessSystem;
  let mockCharacter;

  beforeEach(() => {
    consciousnessSystem = new ConsciousnessSystem();
    
    mockCharacter = {
      id: 'test-char',
      consciousness: {
        frequency: 42,
        coherence: 0.75,
        emotionalModifiers: new Map()
      },
      personality: {
        traits: {
          empathy: 0.6,
          volatility: 0.4,
          resilience: 0.7
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

  describe('getCurrentEmotionalState', () => {
    test('should determine emotional state based on frequency', () => {
      // Test tired state (low frequency)
      const tiredChar = { ...mockCharacter, consciousness: { frequency: 25, coherence: 0.6 } };
      const tiredState = consciousnessSystem.getCurrentEmotionalState(tiredChar);
      expect(tiredState.primaryEmotion).toBe('tired');

      // Test content state (normal frequency)
      const contentChar = { ...mockCharacter, consciousness: { frequency: 40, coherence: 0.8 } };
      const contentState = consciousnessSystem.getCurrentEmotionalState(contentChar);
      expect(contentState.primaryEmotion).toBe('content');

      // Test alert state (high frequency)
      const alertChar = { ...mockCharacter, consciousness: { frequency: 55, coherence: 0.9 } };
      const alertState = consciousnessSystem.getCurrentEmotionalState(alertChar);
      expect(alertState.primaryEmotion).toBe('alert');

      // Test energized state (very high frequency)
      const energizedChar = { ...mockCharacter, consciousness: { frequency: 70, coherence: 0.95 } };
      const energizedState = consciousnessSystem.getCurrentEmotionalState(energizedChar);
      expect(energizedState.primaryEmotion).toBe('energized');
    });

    test('should calculate intensity based on coherence', () => {
      const lowCoherence = { ...mockCharacter, consciousness: { frequency: 40, coherence: 0.3 } };
      const highCoherence = { ...mockCharacter, consciousness: { frequency: 40, coherence: 0.9 } };

      const lowState = consciousnessSystem.getCurrentEmotionalState(lowCoherence);
      const highState = consciousnessSystem.getCurrentEmotionalState(highCoherence);

      expect(highState.intensity).toBeGreaterThan(lowState.intensity);
      expect(lowState.intensity).toBeGreaterThan(0);
      expect(highState.intensity).toBeLessThanOrEqual(1);
    });

    test('should include emotional modifiers in state calculation', () => {
      const characterWithModifiers = {
        ...mockCharacter,
        consciousness: {
          frequency: 40,
          coherence: 0.7,
          emotionalModifiers: new Map([
            ['success', { intensity: 0.8, duration: 5, type: 'success' }],
            ['social_positive', { intensity: 0.6, duration: 3, type: 'social_positive' }]
          ])
        }
      };

      const state = consciousnessSystem.getCurrentEmotionalState(characterWithModifiers);
      
      expect(state.modifiers).toBeDefined();
      expect(state.modifiers.length).toBe(2);
      expect(state.modifiers.some(m => m.type === 'success')).toBe(true);
      expect(state.modifiers.some(m => m.type === 'social_positive')).toBe(true);
    });

    test('should handle missing consciousness data', () => {
      const incompleteChar = { ...mockCharacter, consciousness: null };
      
      expect(() => {
        const state = consciousnessSystem.getCurrentEmotionalState(incompleteChar);
        expect(state.primaryEmotion).toBe('content'); // Should default to content
        expect(state.intensity).toBe(0.5); // Default intensity
      }).not.toThrow();
    });

    test('should handle extreme frequency values', () => {
      const extremeChar = { ...mockCharacter, consciousness: { frequency: 1000, coherence: 1.0 } };
      const state = consciousnessSystem.getCurrentEmotionalState(extremeChar);
      
      expect(state.primaryEmotion).toBeDefined();
      expect(state.intensity).toBeGreaterThan(0);
      expect(state.intensity).toBeLessThanOrEqual(1);
    });

    test('should include frequency and coherence in state output', () => {
      const state = consciousnessSystem.getCurrentEmotionalState(mockCharacter);
      
      expect(state.frequency).toBe(42);
      expect(state.coherence).toBe(0.75);
      expect(state.primaryEmotion).toBeDefined();
      expect(state.intensity).toBeDefined();
      expect(Array.isArray(state.modifiers)).toBe(true);
    });
  });

  describe('applyEmotionalEvent', () => {
    test('should apply positive emotional events', () => {
      const updatedChar = consciousnessSystem.applyEmotionalEvent(
        mockCharacter,
        'success',
        0.8,
        10
      );

      expect(updatedChar.consciousness.emotionalModifiers.has('success')).toBe(true);
      const modifier = updatedChar.consciousness.emotionalModifiers.get('success');
      expect(modifier.intensity).toBe(0.8);
      expect(modifier.duration).toBe(10);
      expect(modifier.type).toBe('success');
    });

    test('should apply negative emotional events', () => {
      const updatedChar = consciousnessSystem.applyEmotionalEvent(
        mockCharacter,
        'failure',
        0.6,
        8
      );

      expect(updatedChar.consciousness.emotionalModifiers.has('failure')).toBe(true);
      const modifier = updatedChar.consciousness.emotionalModifiers.get('failure');
      expect(modifier.intensity).toBe(0.6);
      expect(modifier.duration).toBe(8);
      expect(modifier.type).toBe('failure');
    });

    test('should handle multiple emotional events', () => {
      let character = consciousnessSystem.applyEmotionalEvent(mockCharacter, 'success', 0.7, 5);
      character = consciousnessSystem.applyEmotionalEvent(character, 'social_positive', 0.5, 8);

      expect(character.consciousness.emotionalModifiers.size).toBe(2);
      expect(character.consciousness.emotionalModifiers.has('success')).toBe(true);
      expect(character.consciousness.emotionalModifiers.has('social_positive')).toBe(true);
    });

    test('should replace existing events of same type', () => {
      let character = consciousnessSystem.applyEmotionalEvent(mockCharacter, 'success', 0.5, 5);
      character = consciousnessSystem.applyEmotionalEvent(character, 'success', 0.8, 10);

      expect(character.consciousness.emotionalModifiers.size).toBe(1);
      const modifier = character.consciousness.emotionalModifiers.get('success');
      expect(modifier.intensity).toBe(0.8);
      expect(modifier.duration).toBe(10);
    });

    test('should preserve other character properties', () => {
      const updatedChar = consciousnessSystem.applyEmotionalEvent(
        mockCharacter,
        'achievement',
        0.7,
        6
      );

      expect(updatedChar.id).toBe(mockCharacter.id);
      expect(updatedChar.consciousness.frequency).toBe(mockCharacter.consciousness.frequency);
      expect(updatedChar.consciousness.coherence).toBe(mockCharacter.consciousness.coherence);
      expect(updatedChar.personality).toEqual(mockCharacter.personality);
    });

    test('should handle invalid event parameters', () => {
      // Test with negative intensity
      const negativeIntensity = consciousnessSystem.applyEmotionalEvent(
        mockCharacter,
        'test',
        -0.5,
        5
      );
      expect(negativeIntensity.consciousness.emotionalModifiers.get('test').intensity).toBe(0);

      // Test with zero duration
      const zeroDuration = consciousnessSystem.applyEmotionalEvent(
        mockCharacter,
        'test',
        0.5,
        0
      );
      expect(zeroDuration.consciousness.emotionalModifiers.get('test').duration).toBe(1);

      // Test with very high intensity
      const highIntensity = consciousnessSystem.applyEmotionalEvent(
        mockCharacter,
        'test',
        2.0,
        5
      );
      expect(highIntensity.consciousness.emotionalModifiers.get('test').intensity).toBe(1.0);
    });

    test('should create new character instance without mutating original', () => {
      const originalModifiersSize = mockCharacter.consciousness.emotionalModifiers.size;
      
      const updatedChar = consciousnessSystem.applyEmotionalEvent(
        mockCharacter,
        'success',
        0.7,
        5
      );

      expect(mockCharacter.consciousness.emotionalModifiers.size).toBe(originalModifiersSize);
      expect(updatedChar.consciousness.emotionalModifiers.size).toBe(originalModifiersSize + 1);
      expect(updatedChar).not.toBe(mockCharacter); // Different instances
    });

    test('should handle character without existing emotional modifiers', () => {
      const charWithoutModifiers = {
        ...mockCharacter,
        consciousness: {
          frequency: 40,
          coherence: 0.7
          // No emotionalModifiers property
        }
      };

      const updatedChar = consciousnessSystem.applyEmotionalEvent(
        charWithoutModifiers,
        'success',
        0.8,
        5
      );

      expect(updatedChar.consciousness.emotionalModifiers).toBeDefined();
      expect(updatedChar.consciousness.emotionalModifiers.has('success')).toBe(true);
    });
  });

  describe('Emotional State Transitions', () => {
    test('should maintain emotional state consistency across frequency changes', () => {
      let character = mockCharacter;
      
      // Apply events that should influence frequency
      character = consciousnessSystem.applyEmotionalEvent(character, 'success', 0.8, 5);
      const successState = consciousnessSystem.getCurrentEmotionalState(character);
      
      character = consciousnessSystem.applyEmotionalEvent(character, 'failure', 0.7, 8);
      const failureState = consciousnessSystem.getCurrentEmotionalState(character);
      
      // States should reflect the applied modifiers
      expect(successState.modifiers.some(m => m.type === 'success')).toBe(true);
      expect(failureState.modifiers.some(m => m.type === 'failure')).toBe(true);
      expect(failureState.modifiers.some(m => m.type === 'success')).toBe(true); // Previous event still there
    });

    test('should handle rapid emotional state changes', () => {
      let character = mockCharacter;
      const events = [
        ['success', 0.8, 3],
        ['social_positive', 0.6, 5],
        ['conflict', 0.7, 4],
        ['achievement', 0.9, 6],
        ['failure', 0.5, 3]
      ];

      events.forEach(([type, intensity, duration]) => {
        character = consciousnessSystem.applyEmotionalEvent(character, type, intensity, duration);
      });

      const finalState = consciousnessSystem.getCurrentEmotionalState(character);
      
      expect(finalState.modifiers.length).toBe(events.length);
      expect(finalState.primaryEmotion).toBeDefined();
      expect(finalState.intensity).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle null character gracefully', () => {
      expect(() => {
        consciousnessSystem.getCurrentEmotionalState(null);
      }).not.toThrow();

      expect(() => {
        consciousnessSystem.applyEmotionalEvent(null, 'success', 0.5, 5);
      }).not.toThrow();
    });

    test('should handle missing personality data', () => {
      const charWithoutPersonality = {
        id: 'test',
        consciousness: { frequency: 40, coherence: 0.7, emotionalModifiers: new Map() }
      };

      const state = consciousnessSystem.getCurrentEmotionalState(charWithoutPersonality);
      expect(state.primaryEmotion).toBeDefined();
      expect(state.intensity).toBeGreaterThan(0);
    });

    test('should handle empty event type', () => {
      const updatedChar = consciousnessSystem.applyEmotionalEvent(
        mockCharacter,
        '',
        0.5,
        5
      );

      expect(updatedChar.consciousness.emotionalModifiers.has('')).toBe(true);
    });

    test('should maintain system stability with extreme values', () => {
      const extremeChar = {
        ...mockCharacter,
        consciousness: {
          frequency: -1000,
          coherence: 10.0,
          emotionalModifiers: new Map()
        }
      };

      const state = consciousnessSystem.getCurrentEmotionalState(extremeChar);
      expect(state.primaryEmotion).toBeDefined();
      expect(state.intensity).toBeGreaterThan(0);
      expect(state.intensity).toBeLessThanOrEqual(1);

      const updatedChar = consciousnessSystem.applyEmotionalEvent(
        extremeChar,
        'extreme_test',
        100,
        -5
      );
      
      expect(updatedChar.consciousness.emotionalModifiers.has('extreme_test')).toBe(true);
    });
  });
});
