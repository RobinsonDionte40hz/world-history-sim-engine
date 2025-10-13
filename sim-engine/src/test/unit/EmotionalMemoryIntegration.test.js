/**
 * Emotional Memory Integration Test Suite
 * 
 * Tests for emotional memory creation, retrieval, and integration
 * with the existing memory service and consciousness system.
 */

import * as EmotionalUtils from '../../shared/utils/EmotionalUtils.js';

describe('Emotional Memory Integration', () => {
  let mockCharacter, mockEvent, mockEmotionalState;

  beforeEach(() => {
    mockCharacter = {
      id: 'memory-test-char',
      decisionHistory: [],
      consciousness: {
        frequency: 42,
        coherence: 0.8
      }
    };

    mockEvent = {
      id: 'test-event',
      type: 'social',
      description: 'Had a conversation with friend',
      timestamp: Date.now(),
      participants: ['friend-1'],
      outcome: 'positive'
    };

    mockEmotionalState = {
      primary: 'happy',
      secondary: 'content',
      intensity: 0.7,
      frequency: 42,
      coherence: 0.8,
      isComplex: false
    };
  });

  describe('createEmotionalMemory', () => {
    test('should create basic emotional memory', () => {
      const emotionalMemory = EmotionalUtils.createEmotionalMemory(mockEvent, mockEmotionalState);
      
      expect(emotionalMemory.id).toBe(mockEvent.id);
      expect(emotionalMemory.emotionalContext).toBeDefined();
      expect(emotionalMemory.emotionalContext.state).toBe('happy');
      expect(emotionalMemory.emotionalContext.intensity).toBe(0.7);
      expect(emotionalMemory.memorySalience).toBeGreaterThan(1.0);
      expect(emotionalMemory.retrievalTriggers).toBeDefined();
      expect(emotionalMemory.retrievalTriggers.length).toBeGreaterThan(0);
    });

    test('should enhance salience for complex emotions', () => {
      const complexEmotionalState = {
        ...mockEmotionalState,
        primary: 'bittersweet',
        isComplex: true,
        description: 'Mixed feelings'
      };
      
      const emotionalMemory = EmotionalUtils.createEmotionalMemory(mockEvent, complexEmotionalState);
      const basicMemory = EmotionalUtils.createEmotionalMemory(mockEvent, mockEmotionalState);
      
      expect(emotionalMemory.memorySalience).toBeGreaterThan(basicMemory.memorySalience);
      expect(emotionalMemory.emotionalContext.isComplex).toBe(true);
    });

    test('should create appropriate retrieval triggers', () => {
      const emotionalMemory = EmotionalUtils.createEmotionalMemory(mockEvent, mockEmotionalState);
      
      const triggers = emotionalMemory.retrievalTriggers;
      expect(triggers.some(t => t.type === 'emotional_state' && t.value === 'happy')).toBe(true);
      expect(triggers.some(t => t.type === 'emotional_state' && t.value === 'content')).toBe(true);
      expect(triggers.some(t => t.type === 'frequency_range')).toBe(true);
    });

    test('should handle extreme emotional states', () => {
      const extremeState = {
        ...mockEmotionalState,
        primary: 'manic',
        intensity: 0.9,
        frequency: 75
      };
      
      const emotionalMemory = EmotionalUtils.createEmotionalMemory(mockEvent, extremeState);
      
      expect(emotionalMemory.memorySalience).toBeGreaterThan(2.0);
      expect(emotionalMemory.decayRate).toBeLessThan(0.05);
    });

    test('should assign correct emotional valence', () => {
      const positiveMemory = EmotionalUtils.createEmotionalMemory(mockEvent, {
        ...mockEmotionalState,
        primary: 'joyful'
      });
      
      const negativeMemory = EmotionalUtils.createEmotionalMemory(mockEvent, {
        ...mockEmotionalState,
        primary: 'sad'
      });
      
      expect(positiveMemory.valence).toBeGreaterThan(0);
      expect(negativeMemory.valence).toBeLessThan(0);
    });
  });

  describe('retrieveEmotionalMemories', () => {
    beforeEach(() => {
      // Add some test memories to character
      mockCharacter.decisionHistory = [
        EmotionalUtils.createEmotionalMemory(
          { ...mockEvent, id: 'happy-memory', description: 'Happy event' },
          { ...mockEmotionalState, primary: 'happy', intensity: 0.8 }
        ),
        EmotionalUtils.createEmotionalMemory(
          { ...mockEvent, id: 'sad-memory', description: 'Sad event' },
          { ...mockEmotionalState, primary: 'sad', intensity: 0.6 }
        ),
        EmotionalUtils.createEmotionalMemory(
          { ...mockEvent, id: 'complex-memory', description: 'Complex event' },
          { ...mockEmotionalState, primary: 'bittersweet', isComplex: true, intensity: 0.7 }
        )
      ];
    });

    test('should retrieve memories matching current emotional state', () => {
      const currentState = { primary: 'happy', intensity: 0.7, frequency: 42 };
      const memories = EmotionalUtils.retrieveEmotionalMemories(mockCharacter, currentState);
      
      expect(memories.length).toBeGreaterThan(0);
      expect(memories[0].memory.id).toBe('happy-memory'); // Should match happy state
      expect(memories[0].relevanceScore).toBeGreaterThan(0.5);
    });

    test('should rank memories by relevance', () => {
      const currentState = { primary: 'happy', intensity: 0.7, frequency: 42 };
      const memories = EmotionalUtils.retrieveEmotionalMemories(mockCharacter, currentState);
      
      // Should be sorted by relevance score
      for (let i = 1; i < memories.length; i++) {
        expect(memories[i-1].relevanceScore).toBeGreaterThanOrEqual(memories[i].relevanceScore);
      }
    });

    test('should consider frequency similarity', () => {
      const currentState = { primary: 'content', intensity: 0.5, frequency: 44 }; // Similar frequency
      const memories = EmotionalUtils.retrieveEmotionalMemories(mockCharacter, currentState);
      
      expect(memories.length).toBeGreaterThan(0);
      expect(memories.some(m => m.relevanceScore > 0.3)).toBe(true);
    });

    test('should handle complex emotional state matching', () => {
      const currentState = { primary: 'conflicted', isComplex: true, intensity: 0.6, frequency: 40 };
      const memories = EmotionalUtils.retrieveEmotionalMemories(mockCharacter, currentState);
      
      // Should find the complex memory due to isComplex match
      expect(memories.some(m => m.memory.id === 'complex-memory')).toBe(true);
    });

    test('should limit results to maxResults', () => {
      const currentState = { primary: 'happy', intensity: 0.7, frequency: 42 };
      const memories = EmotionalUtils.retrieveEmotionalMemories(mockCharacter, currentState, 2);
      
      expect(memories.length).toBeLessThanOrEqual(2);
    });

    test('should calculate emotional resonance', () => {
      const currentState = { primary: 'happy', intensity: 0.8, frequency: 43 };
      const memories = EmotionalUtils.retrieveEmotionalMemories(mockCharacter, currentState);
      
      memories.forEach(memory => {
        expect(memory.emotionalResonance).toBeDefined();
        expect(memory.emotionalResonance).toBeGreaterThanOrEqual(0);
        expect(memory.emotionalResonance).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('enhanceMemoryWithEmotion', () => {
    test('should add emotional memory to character history', () => {
      const initialHistoryLength = mockCharacter.decisionHistory.length;
      
      EmotionalUtils.enhanceMemoryWithEmotion(mockCharacter, mockEvent, mockEmotionalState);
      
      expect(mockCharacter.decisionHistory.length).toBe(initialHistoryLength + 1);
      expect(mockCharacter.decisionHistory[0].emotionalContext).toBeDefined();
      expect(mockCharacter.decisionHistory[0].memorySalience).toBeDefined();
    });

    test('should sort memories by salience', () => {
      // Add a low salience memory first
      const lowSalienceState = { ...mockEmotionalState, intensity: 0.2 };
      EmotionalUtils.enhanceMemoryWithEmotion(mockCharacter, mockEvent, lowSalienceState);
      
      // Add a high salience memory
      const highSalienceState = { ...mockEmotionalState, intensity: 0.9 };
      EmotionalUtils.enhanceMemoryWithEmotion(mockCharacter, mockEvent, highSalienceState);
      
      expect(mockCharacter.decisionHistory[0].memorySalience)
        .toBeGreaterThan(mockCharacter.decisionHistory[1].memorySalience);
    });

    test('should limit memory storage', () => {
      // Fill up memory beyond limit
      for (let i = 0; i < 60; i++) {
        EmotionalUtils.enhanceMemoryWithEmotion(
          mockCharacter, 
          { ...mockEvent, id: `event-${i}` }, 
          mockEmotionalState
        );
      }
      
      expect(mockCharacter.decisionHistory.length).toBeLessThanOrEqual(50);
    });

    test('should return the created emotional memory', () => {
      const result = EmotionalUtils.enhanceMemoryWithEmotion(mockCharacter, mockEvent, mockEmotionalState);
      
      expect(result).toBeDefined();
      expect(result.emotionalContext).toBeDefined();
      expect(result.memorySalience).toBeDefined();
      expect(result.id).toBe(mockEvent.id);
    });
  });

  describe('Memory Decay and Persistence', () => {
    test('should assign lower decay rates to traumatic memories', () => {
      const traumaState = {
        ...mockEmotionalState,
        primary: 'ashamed',
        intensity: 0.9
      };
      
      const traumaMemory = EmotionalUtils.createEmotionalMemory(mockEvent, traumaState);
      const normalMemory = EmotionalUtils.createEmotionalMemory(mockEvent, mockEmotionalState);
      
      expect(traumaMemory.decayRate).toBeLessThan(normalMemory.decayRate);
    });

    test('should assign higher salience to intense emotions', () => {
      const intenseState = { ...mockEmotionalState, intensity: 0.95 };
      const mildState = { ...mockEmotionalState, intensity: 0.3 };
      
      const intenseMemory = EmotionalUtils.createEmotionalMemory(mockEvent, intenseState);
      const mildMemory = EmotionalUtils.createEmotionalMemory(mockEvent, mildState);
      
      expect(intenseMemory.memorySalience).toBeGreaterThan(mildMemory.memorySalience);
    });

    test('should handle low coherence states', () => {
      const lowCoherenceState = {
        ...mockEmotionalState,
        coherence: 0.2
      };
      
      const memory = EmotionalUtils.createEmotionalMemory(mockEvent, lowCoherenceState);
      
      expect(memory.memorySalience).toBeLessThan(1.5 * mockEmotionalState.intensity);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle character without decision history', () => {
      const emptyCharacter = { id: 'empty-char' };
      
      expect(() => {
        EmotionalUtils.enhanceMemoryWithEmotion(emptyCharacter, mockEvent, mockEmotionalState);
      }).not.toThrow();
      
      expect(emptyCharacter.decisionHistory).toBeDefined();
      expect(emptyCharacter.decisionHistory.length).toBe(1);
    });

    test('should handle character without consciousness data', () => {
      const incompleteCharacter = { id: 'incomplete', decisionHistory: [] };
      
      const memories = EmotionalUtils.retrieveEmotionalMemories(incompleteCharacter, mockEmotionalState);
      
      expect(memories).toEqual([]);
    });

    test('should handle missing emotional state properties', () => {
      const incompleteState = { primary: 'happy' }; // Missing other properties
      
      const memory = EmotionalUtils.createEmotionalMemory(mockEvent, incompleteState);
      
      expect(memory.emotionalContext.state).toBe('happy');
      expect(memory.memorySalience).toBeGreaterThan(0);
    });

    test('should handle unknown emotions gracefully', () => {
      const unknownState = {
        primary: 'unknown_emotion',
        intensity: 0.7,
        frequency: 42
      };
      
      const memory = EmotionalUtils.createEmotionalMemory(mockEvent, unknownState);
      
      expect(memory.valence).toBe(0.0); // Default valence
      expect(memory.memorySalience).toBeGreaterThan(0);
    });
  });
});
