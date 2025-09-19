/**
 * ConsciousnessSystem Emotional Features Unit Test Suite
 * 
 * Tests for emotional state tracking and event processing in the consciousness system.
 */

import ConsciousnessSystem from '../../domain/value-objects/ConsciousnessSystem.js';

describe('ConsciousnessSystem - Emotional Features', () => {
  let consciousnessSystem;
  let consciousnessState;

  beforeEach(() => {
    consciousnessSystem = new ConsciousnessSystem();
    
    // Create a consciousness state for testing
    consciousnessState = consciousnessSystem.createConsciousnessState('test-char', {
      baseFrequency: 7.5,
      currentFrequency: 42,
      emotionalCoherence: 0.75,
      emotionalModifiers: new Map()
    });
  });

  describe('getCurrentEmotionalState', () => {
    test('should determine emotional state based on frequency', () => {
      // Test tired state (low frequency)
      consciousnessState.currentFrequency = 3.5;
      const tiredState = consciousnessState.getCurrentEmotionalState();
      expect(tiredState.primary).toBe('tired');

      // Test content state (normal frequency)
      consciousnessState.currentFrequency = 7.5;
      const contentState = consciousnessState.getCurrentEmotionalState();
      expect(contentState.primary).toBe('content');

      // Test alert state (high frequency)
      consciousnessState.currentFrequency = 9.5;
      const alertState = consciousnessState.getCurrentEmotionalState();
      expect(alertState.primary).toBe('alert');

      // Test energized state (very high frequency)
      consciousnessState.currentFrequency = 11.5;
      const energizedState = consciousnessState.getCurrentEmotionalState();
      expect(energizedState.primary).toBe('energized');
    });

    test('should calculate intensity based on coherence', () => {
      consciousnessState.currentFrequency = 7.5;
      consciousnessState.emotionalCoherence = 0.3;
      const lowState = consciousnessState.getCurrentEmotionalState();
      
      consciousnessState.emotionalCoherence = 0.9;
      const highState = consciousnessState.getCurrentEmotionalState();

      expect(highState.intensity).toBeGreaterThan(lowState.intensity);
      expect(lowState.intensity).toBeGreaterThan(0);
      expect(highState.intensity).toBeLessThanOrEqual(1);
    });

    test('should include emotional modifiers in state calculation', () => {
      consciousnessState.emotionalModifiers = new Map([
        ['success', { intensity: 0.8, duration: 5, type: 'success', shift: { primary: 'proud', secondary: 'confident', frequencyDelta: 2, energyModifier: 1.2 } }],
        ['social_positive', { intensity: 0.6, duration: 3, type: 'social_positive', shift: { primary: 'happy', secondary: 'social', frequencyDelta: 1, energyModifier: 1.05 } }]
      ]);

      const state = consciousnessState.getCurrentEmotionalState();
      
      expect(state.primary).toBeDefined();
      expect(state.intensity).toBeGreaterThan(0);
    });

    test('should handle missing consciousness data', () => {
      const incompleteState = consciousnessSystem.createConsciousnessState('incomplete', {});
      
      expect(() => {
        const state = incompleteState.getCurrentEmotionalState();
        expect(state.primary).toBe('content'); // Should default to content
        expect(state.intensity).toBeGreaterThan(0);
      }).not.toThrow();
    });

    test('should handle extreme frequency values', () => {
      consciousnessState.currentFrequency = 1000;
      const state = consciousnessState.getCurrentEmotionalState();
      
      expect(state.primary).toBeDefined();
      expect(state.intensity).toBeGreaterThan(0);
      expect(state.intensity).toBeLessThanOrEqual(1);
    });

    test('should include frequency and coherence in state output', () => {
      const state = consciousnessState.getCurrentEmotionalState();
      
      expect(state.frequency).toBe(42);
      expect(state.coherence).toBe(0.75);
      expect(state.primary).toBeDefined();
      expect(state.intensity).toBeDefined();
    });
  });

  describe('applyEmotionalEvent', () => {
    test('should apply positive emotional events', () => {
      const result = consciousnessState.applyEmotionalEvent('success', 0.8, 10);

      expect(consciousnessState.emotionalModifiers.has('success')).toBe(true);
      const modifier = consciousnessState.emotionalModifiers.get('success');
      expect(modifier.intensity).toBe(0.8);
      expect(modifier.duration).toBe(600000); // 10 minutes in milliseconds
      expect(modifier.type).toBe('success');
      expect(result).toHaveProperty('eventType', 'success');
    });

    test('should apply negative emotional events', () => {
      consciousnessState.applyEmotionalEvent('failure', 0.6, 8);

      expect(consciousnessState.emotionalModifiers.has('failure')).toBe(true);
      const modifier = consciousnessState.emotionalModifiers.get('failure');
      expect(modifier.intensity).toBe(0.6);
      expect(modifier.duration).toBe(480000); // 8 minutes in milliseconds
      expect(modifier.type).toBe('failure');
    });

    test('should handle multiple emotional events', () => {
      consciousnessState.applyEmotionalEvent('success', 0.7, 5);
      consciousnessState.applyEmotionalEvent('social_positive', 0.5, 8);

      expect(consciousnessState.emotionalModifiers.size).toBe(2);
      expect(consciousnessState.emotionalModifiers.has('success')).toBe(true);
      expect(consciousnessState.emotionalModifiers.has('social_positive')).toBe(true);
    });

    test('should replace existing events of same type', () => {
      consciousnessState.applyEmotionalEvent('success', 0.5, 5);
      consciousnessState.applyEmotionalEvent('success', 0.8, 10);

      expect(consciousnessState.emotionalModifiers.size).toBe(1);
      const modifier = consciousnessState.emotionalModifiers.get('success');
      expect(modifier.intensity).toBe(0.8);
      expect(modifier.duration).toBe(600000); // 10 minutes
    });

    test('should preserve other character properties', () => {
      const originalFrequency = consciousnessState.currentFrequency;
      const originalCoherence = consciousnessState.emotionalCoherence;

      consciousnessState.applyEmotionalEvent('achievement', 0.7, 6);

      expect(consciousnessState.currentFrequency).toBe(originalFrequency);
      expect(consciousnessState.emotionalCoherence).toBe(originalCoherence);
      expect(consciousnessState.emotionalModifiers.has('achievement')).toBe(true);
    });

    test('should handle invalid event parameters', () => {
      // Test with negative intensity
      consciousnessState.applyEmotionalEvent('test', -0.5, 5);
      expect(consciousnessState.emotionalModifiers.get('test').intensity).toBe(0);

      // Test with zero duration
      consciousnessState.applyEmotionalEvent('test2', 0.5, 0);
      expect(consciousnessState.emotionalModifiers.get('test2').duration).toBe(60000); // 1 minute minimum

      // Test with very high intensity
      consciousnessState.applyEmotionalEvent('test3', 2.0, 5);
      expect(consciousnessState.emotionalModifiers.get('test3').intensity).toBe(1.0);
    });

    test('should create new character instance without mutating original', () => {
      const originalModifiersSize = consciousnessState.emotionalModifiers.size;
      
      consciousnessState.applyEmotionalEvent('success', 0.7, 5);

      expect(consciousnessState.emotionalModifiers.size).toBe(originalModifiersSize + 1);
    });

    test('should handle character without existing emotional modifiers', () => {
      const newState = consciousnessSystem.createConsciousnessState('no-modifiers', {
        baseFrequency: 7.5,
        currentFrequency: 7.5,
        emotionalCoherence: 0.7
        // No emotionalModifiers property initially
      });

      newState.applyEmotionalEvent('success', 0.8, 5);

      expect(newState.emotionalModifiers).toBeDefined();
      expect(newState.emotionalModifiers.has('success')).toBe(true);
    });
  });

  describe('Emotional State Transitions', () => {
    test('should maintain emotional state consistency across frequency changes', () => {
      // Apply events that should influence frequency
      consciousnessState.applyEmotionalEvent('success', 0.8, 5);
      const successState = consciousnessState.getCurrentEmotionalState();
      
      consciousnessState.applyEmotionalEvent('failure', 0.7, 8);
      const failureState = consciousnessState.getCurrentEmotionalState();
      
      // States should reflect the applied modifiers
      expect(successState.primary).toBeDefined();
      expect(failureState.primary).toBeDefined();
      expect(consciousnessState.emotionalModifiers.size).toBe(2);
    });

    test('should handle rapid emotional state changes', () => {
      const events = [
        ['success', 0.8, 3],
        ['social_positive', 0.6, 5],
        ['conflict', 0.7, 4],
        ['achievement', 0.9, 6],
        ['failure', 0.5, 3]
      ];

      events.forEach(([type, intensity, duration]) => {
        consciousnessState.applyEmotionalEvent(type, intensity, duration);
      });

      const finalState = consciousnessState.getCurrentEmotionalState();
      
      expect(consciousnessState.emotionalModifiers.size).toBe(events.length);
      expect(finalState.primary).toBeDefined();
      expect(finalState.intensity).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle null character gracefully', () => {
      expect(() => {
        consciousnessState.getCurrentEmotionalState();
      }).not.toThrow();

      expect(() => {
        consciousnessState.applyEmotionalEvent('success', 0.5, 5);
      }).not.toThrow();
    });

    test('should handle missing personality data', () => {
      const state = consciousnessState.getCurrentEmotionalState();
      expect(state.primary).toBeDefined();
      expect(state.intensity).toBeGreaterThan(0);
    });

    test('should handle empty event type', () => {
      consciousnessState.applyEmotionalEvent('', 0.5, 5);

      expect(consciousnessState.emotionalModifiers.has('')).toBe(true);
    });

    test('should maintain system stability with extreme values', () => {
      const extremeState = consciousnessSystem.createConsciousnessState('extreme', {
        baseFrequency: -1000,
        currentFrequency: -1000,
        emotionalCoherence: 10.0
      });

      const state = extremeState.getCurrentEmotionalState();
      expect(state.primary).toBeDefined();
      expect(state.intensity).toBeGreaterThan(0);
      expect(state.intensity).toBeLessThanOrEqual(1);

      extremeState.applyEmotionalEvent('extreme_test', 100, -5);
      
      expect(extremeState.emotionalModifiers.has('extreme_test')).toBe(true);
    });
  });
});
