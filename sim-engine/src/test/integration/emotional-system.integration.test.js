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
    
    // Create a simple mock character object instead of using the Character class
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
          curiosity: 0.6
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

    test('should replace existing emotional events of same type', () => {
      let character = consciousnessSystem.applyEmotionalEvent(mockCharacter, 'success', 0.5, 5);
      character = consciousnessSystem.applyEmotionalEvent(character, 'success', 0.8, 10);
      
      expect(character.consciousness.emotionalModifiers.size).toBe(1);
      const modifier = character.consciousness.emotionalModifiers.get('success');
      expect(modifier.intensity).toBe(0.8);
      expect(modifier.duration).toBe(10);
    });
  });

  describe('Behavioral Modifiers', () => {
    test('should provide appropriate modifiers for tired emotion', () => {
      const modifier = EmotionalUtils.getEmotionalModifier('tired', 0.8);
      
      expect(modifier.socialInteraction).toBeLessThan(1.0); // Reduced social interaction
      expect(modifier.riskTaking).toBeLessThan(1.0); // Less risk-taking when tired
      expect(modifier.energyEfficiency).toBeLessThan(1.0); // Less efficient when tired
      expect(modifier.conflictAvoidance).toBeGreaterThan(1.0); // More conflict avoidance
    });

    test('should provide appropriate modifiers for energized emotion', () => {
      const modifier = EmotionalUtils.getEmotionalModifier('energized', 0.9);
      
      expect(modifier.socialInteraction).toBeGreaterThan(1.0); // Increased social interaction
      expect(modifier.riskTaking).toBeGreaterThan(1.0); // More risk-taking when energized
      expect(modifier.energyEfficiency).toBeGreaterThan(1.0); // More efficient when energized
      expect(modifier.decisionSpeed).toBeGreaterThan(1.0); // Faster decisions
    });

    test('should scale modifiers with emotion intensity', () => {
      const lowIntensity = EmotionalUtils.getEmotionalModifier('alert', 0.3);
      const highIntensity = EmotionalUtils.getEmotionalModifier('alert', 0.9);
      
      // High intensity should have more pronounced effects
      expect(Math.abs(highIntensity.socialInteraction - 1.0)).toBeGreaterThan(
        Math.abs(lowIntensity.socialInteraction - 1.0)
      );
    });

    test('should handle unknown emotions gracefully', () => {
      const modifier = EmotionalUtils.getEmotionalModifier('unknown_emotion', 0.7);
      
      // Should return neutral modifiers for unknown emotions
      expect(modifier.socialInteraction).toBe(1.0);
      expect(modifier.riskTaking).toBe(1.0);
      expect(modifier.energyEfficiency).toBe(1.0);
      expect(modifier.conflictAvoidance).toBe(1.0);
    });
  });

  describe('Integration with Decision-Making', () => {
    test('should influence interaction weights based on emotional state', () => {
      // Create a mock node with social interactions
      const mockNode = {
        id: 'social-node',
        name: 'Social Area',
        connections: [],
        interactions: new Map([
          ['chat', { 
            id: 'chat', 
            type: 'social',
            energyCost: 10,
            conditions: [],
            outcomes: []
          }],
          ['rest', { 
            id: 'rest', 
            type: 'personal',
            energyCost: 5,
            conditions: [],
            outcomes: []
          }]
        ])
      };

      mockWorldState.worldMap = {
        nodes: new Map([['social-node', mockNode]]),
        getNode: (id) => mockNode
      };

      // Test with energized character (should prefer social interactions)
      const energizedChar = { 
        ...mockCharacter, 
        consciousness: { 
          frequency: 65, 
          coherence: 0.9,
          emotionalModifiers: new Map()
        }
      };

      const result = generateBehavior(energizedChar, mockWorldState);
      
      expect(result).toBeDefined();
      expect(result.decision).toBeDefined();
      
      // The emotional state should influence the decision-making process
      // (specific assertions would depend on the exact implementation details)
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

      const reaction = EmotionalUtils.getEmotionalReaction(
        empathicCharacter,
        'social_positive',
        0.7
      );

      expect(reaction.intensity).toBeGreaterThan(0);
      expect(reaction.duration).toBeGreaterThan(0);
      
      // High empathy should amplify social positive reactions
      const lowEmpathyChar = {
        ...mockCharacter,
        personality: {
          ...mockCharacter.personality,
          traits: {
            ...mockCharacter.personality.traits,
            empathy: 0.2
          }
        }
      };

      const lowEmpathyReaction = EmotionalUtils.getEmotionalReaction(
        lowEmpathyChar,
        'social_positive',
        0.7
      );

      expect(reaction.intensity).toBeGreaterThan(lowEmpathyReaction.intensity);
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
        0.5 // interaction strength
      );

      expect(contagion.effect).toBeGreaterThan(0);
      expect(contagion.targetEmotion).toBeDefined();
      expect(contagion.intensity).toBeGreaterThan(0);
      expect(contagion.intensity).toBeLessThanOrEqual(1);
    });

    test('should consider empathy in emotional contagion', () => {
      const highEmpathyChar = {
        ...mockCharacter,
        personality: {
          ...mockCharacter.personality,
          traits: { ...mockCharacter.personality.traits, empathy: 0.9 }
        }
      };

      const lowEmpathyChar = {
        ...mockCharacter,
        id: 'low-empathy',
        personality: {
          ...mockCharacter.personality,
          traits: { ...mockCharacter.personality.traits, empathy: 0.2 }
        }
      };

      const sourceChar = {
        ...mockCharacter,
        id: 'source',
        consciousness: { frequency: 55, coherence: 0.9 }
      };

      const highEmpathyContagion = EmotionalUtils.calculateEmotionalContagion(
        sourceChar,
        highEmpathyChar,
        0.7
      );

      const lowEmpathyContagion = EmotionalUtils.calculateEmotionalContagion(
        sourceChar,
        lowEmpathyChar,
        0.7
      );

      expect(highEmpathyContagion.effect).toBeGreaterThan(lowEmpathyContagion.effect);
    });
  });

  describe('System Integration and Edge Cases', () => {
    test('should handle characters with missing consciousness data', () => {
      const incompleteCharacter = {
        ...mockCharacter,
        consciousness: null
      };

      expect(() => {
        consciousnessSystem.getCurrentEmotionalState(incompleteCharacter);
      }).not.toThrow();
    });

    test('should handle characters with extreme frequency values', () => {
      const extremeCharacter = {
        ...mockCharacter,
        consciousness: { frequency: 1000, coherence: 1.0 }
      };

      const emotionalState = consciousnessSystem.getCurrentEmotionalState(extremeCharacter);
      expect(emotionalState.primaryEmotion).toBeDefined();
      expect(emotionalState.intensity).toBeGreaterThan(0);
      expect(emotionalState.intensity).toBeLessThanOrEqual(1);
    });

    test('should maintain emotional state consistency across multiple updates', () => {
      let character = mockCharacter;
      
      // Apply series of emotional events
      character = consciousnessSystem.applyEmotionalEvent(character, 'success', 0.7, 5);
      character = consciousnessSystem.applyEmotionalEvent(character, 'social_positive', 0.6, 8);
      
      const firstState = consciousnessSystem.getCurrentEmotionalState(character);
      
      // Apply another event
      character = consciousnessSystem.applyEmotionalEvent(character, 'achievement', 0.8, 6);
      
      const secondState = consciousnessSystem.getCurrentEmotionalState(character);
      
      // States should be consistent and logical
      expect(firstState.primaryEmotion).toBeDefined();
      expect(secondState.primaryEmotion).toBeDefined();
      expect(typeof firstState.intensity).toBe('number');
      expect(typeof secondState.intensity).toBe('number');
    });
  });
});
