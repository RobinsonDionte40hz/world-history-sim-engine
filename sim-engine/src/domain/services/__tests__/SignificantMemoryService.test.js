/**
 * Tests for SignificantMemoryService
 * 
 * Tests memory storage with significance filtering, memory limits,
 * and retrieval functionality for the consciousness system refactor.
 */

import SignificantMemoryService from '../SignificantMemoryService.js';
import EventSignificanceService from '../EventSignificanceService.js';

// Mock character for testing
const createMockCharacter = (id = 'test-char', overrides = {}) => ({
  id,
  name: 'Test Character',
  currentNodeId: 'test-node',
  significantMemories: [],
  ...overrides
});

// Mock interaction for testing
const createMockInteraction = (type = 'social', overrides = {}) => ({
  id: 'test-interaction',
  type,
  name: 'Test Interaction',
  ...overrides
});

describe('SignificantMemoryService', () => {
  let memoryService;
  let mockCharacter;
  let mockInteraction;

  beforeEach(() => {
    memoryService = new SignificantMemoryService();
    mockCharacter = createMockCharacter();
    mockInteraction = createMockInteraction();
  });

  describe('Constructor', () => {
    it('should initialize with default significance threshold', () => {
      expect(memoryService.SIGNIFICANCE_THRESHOLD).toBe(0.3);
    });

    it('should initialize with default memory limit', () => {
      expect(memoryService.MAX_MEMORIES_PER_CHARACTER).toBe(50);
    });

    it('should initialize with EventSignificanceService instance', () => {
      expect(memoryService.eventSignificanceService).toBeInstanceOf(EventSignificanceService);
    });
  });

  describe('addMemoryIfSignificant', () => {
    it('should add memory for significant interactions', () => {
      const result = memoryService.addMemoryIfSignificant(
        mockCharacter,
        mockInteraction,
        'critical_success',
        { emotionalImpact: 0.8 }
      );

      expect(result).toBe(true);
      expect(mockCharacter.significantMemories).toHaveLength(1);
      expect(mockCharacter.significantMemories[0]).toMatchObject({
        interactionType: 'social',
        outcome: 'critical_success',
        significance: expect.any(Number)
      });
    });

    it('should not add memory for insignificant interactions', () => {
      const lowSignificanceInteraction = createMockInteraction('rest');
      
      const result = memoryService.addMemoryIfSignificant(
        mockCharacter,
        lowSignificanceInteraction,
        'neutral',
        { emotionalImpact: 0.1 }
      );

      expect(result).toBe(false);
      expect(mockCharacter.significantMemories).toHaveLength(0);
    });

    it('should initialize significantMemories array if not exists', () => {
      delete mockCharacter.significantMemories;
      
      memoryService.addMemoryIfSignificant(
        mockCharacter,
        mockInteraction,
        'success',
        { emotionalImpact: 0.6 }
      );

      expect(mockCharacter.significantMemories).toBeDefined();
      expect(Array.isArray(mockCharacter.significantMemories)).toBe(true);
    });

    it('should enforce memory limit', () => {
      // Set a lower limit for testing
      memoryService.MAX_MEMORIES_PER_CHARACTER = 3;
      
      // Add 5 significant memories
      for (let i = 0; i < 5; i++) {
        memoryService.addMemoryIfSignificant(
          mockCharacter,
          createMockInteraction('conflict', { id: `interaction-${i}` }),
          'success',
          { emotionalImpact: 0.7 }
        );
      }

      expect(mockCharacter.significantMemories).toHaveLength(3);
      // Should keep the most recent memories
      expect(mockCharacter.significantMemories[0].interactionId).toBe('interaction-2');
      expect(mockCharacter.significantMemories[2].interactionId).toBe('interaction-4');
    });

    it('should throw error for invalid character', () => {
      expect(() => {
        memoryService.addMemoryIfSignificant(null, mockInteraction, 'success');
      }).toThrow('Character must be a valid object');
    });

    it('should throw error for invalid interaction', () => {
      expect(() => {
        memoryService.addMemoryIfSignificant(mockCharacter, null, 'success');
      }).toThrow('Interaction must be a valid object');
    });

    it('should throw error for invalid outcome', () => {
      expect(() => {
        memoryService.addMemoryIfSignificant(mockCharacter, mockInteraction, null);
      }).toThrow('Outcome must be a valid string');
    });
  });

  describe('calculateInteractionSignificance', () => {
    it('should calculate higher significance for important interactions', () => {
      const conflictSignificance = memoryService.calculateInteractionSignificance(
        createMockInteraction('conflict'),
        'critical_success'
      );

      const restSignificance = memoryService.calculateInteractionSignificance(
        createMockInteraction('rest'),
        'success'
      );

      expect(conflictSignificance).toBeGreaterThan(restSignificance);
    });

    it('should apply context modifiers correctly', () => {
      const baseSignificance = memoryService.calculateInteractionSignificance(
        mockInteraction,
        'success'
      );

      const enhancedSignificance = memoryService.calculateInteractionSignificance(
        mockInteraction,
        'success',
        {
          isFirstTime: true,
          involvesImportantNPC: true,
          hasLongTermConsequences: true
        }
      );

      expect(enhancedSignificance).toBeGreaterThan(baseSignificance);
    });

    it('should handle unknown interaction types', () => {
      const unknownInteraction = createMockInteraction('unknown_type');
      
      const significance = memoryService.calculateInteractionSignificance(
        unknownInteraction,
        'success'
      );

      expect(significance).toBeGreaterThan(0);
      expect(significance).toBeLessThanOrEqual(1);
    });
  });

  describe('mapInteractionTypeToEventType', () => {
    it('should map known interaction types correctly', () => {
      expect(memoryService.mapInteractionTypeToEventType('social')).toBe('social_success');
      expect(memoryService.mapInteractionTypeToEventType('conflict')).toBe('conflict');
      expect(memoryService.mapInteractionTypeToEventType('trade')).toBe('trade_success');
      expect(memoryService.mapInteractionTypeToEventType('romance')).toBe('relationship_change');
    });

    it('should return default for unknown types', () => {
      expect(memoryService.mapInteractionTypeToEventType('unknown')).toBe('default');
    });
  });

  describe('calculateEmotionalImpact', () => {
    it('should calculate higher impact for critical outcomes', () => {
      const criticalImpact = memoryService.calculateEmotionalImpact(
        mockInteraction,
        'critical_success'
      );

      const normalImpact = memoryService.calculateEmotionalImpact(
        mockInteraction,
        'success'
      );

      expect(criticalImpact).toBeGreaterThan(normalImpact);
    });

    it('should consider interaction type in impact calculation', () => {
      const romanceImpact = memoryService.calculateEmotionalImpact(
        createMockInteraction('romance'),
        'success'
      );

      const restImpact = memoryService.calculateEmotionalImpact(
        createMockInteraction('rest'),
        'success'
      );

      expect(romanceImpact).toBeGreaterThan(restImpact);
    });

    it('should return bounded values', () => {
      const impact = memoryService.calculateEmotionalImpact(
        createMockInteraction('romance'),
        'critical_success'
      );

      expect(impact).toBeGreaterThanOrEqual(0);
      expect(impact).toBeLessThanOrEqual(1);
    });
  });

  describe('applyInteractionModifiers', () => {
    it('should apply first-time modifier', () => {
      const baseSignificance = 0.5;
      const modifiedSignificance = memoryService.applyInteractionModifiers(
        baseSignificance,
        mockInteraction,
        { isFirstTime: true }
      );

      expect(modifiedSignificance).toBeGreaterThan(baseSignificance);
    });

    it('should apply important NPC modifier', () => {
      const baseSignificance = 0.5;
      const modifiedSignificance = memoryService.applyInteractionModifiers(
        baseSignificance,
        mockInteraction,
        { involvesImportantNPC: true }
      );

      expect(modifiedSignificance).toBeGreaterThan(baseSignificance);
    });

    it('should apply repetition penalty', () => {
      const baseSignificance = 0.5;
      const modifiedSignificance = memoryService.applyInteractionModifiers(
        baseSignificance,
        mockInteraction,
        { repetitionCount: 5 }
      );

      expect(modifiedSignificance).toBeLessThan(baseSignificance);
    });

    it('should apply character importance modifier', () => {
      const baseSignificance = 0.5;
      
      const heroModified = memoryService.applyInteractionModifiers(
        baseSignificance,
        mockInteraction,
        { characterImportance: 'hero' }
      );

      const backgroundModified = memoryService.applyInteractionModifiers(
        baseSignificance,
        mockInteraction,
        { characterImportance: 'background' }
      );

      expect(heroModified).toBeGreaterThan(backgroundModified);
    });
  });

  describe('createMemoryObject', () => {
    it('should create complete memory object', () => {
      const memory = memoryService.createMemoryObject(
        mockCharacter,
        mockInteraction,
        'success',
        0.6,
        { participants: ['npc1', 'npc2'], location: 'test-location' }
      );

      expect(memory).toMatchObject({
        id: expect.any(String),
        interactionType: 'social',
        interactionId: 'test-interaction',
        outcome: 'success',
        significance: 0.6,
        timestamp: expect.any(Number),
        participants: ['npc1', 'npc2'],
        location: 'test-location',
        emotionalImpact: expect.any(Number),
        contextTags: expect.any(Array),
        description: expect.any(String)
      });
    });

    it('should generate unique memory IDs', () => {
      const memory1 = memoryService.createMemoryObject(mockCharacter, mockInteraction, 'success', 0.5);
      const memory2 = memoryService.createMemoryObject(mockCharacter, mockInteraction, 'success', 0.5);

      expect(memory1.id).not.toBe(memory2.id);
    });
  });

  describe('extractContextTags', () => {
    it('should extract basic tags', () => {
      const tags = memoryService.extractContextTags(
        mockInteraction,
        'success',
        {}
      );

      expect(tags).toContain('social');
      expect(tags).toContain('success');
    });

    it('should extract context-specific tags', () => {
      const tags = memoryService.extractContextTags(
        mockInteraction,
        'success',
        {
          isFirstTime: true,
          involvesImportantNPC: true,
          isPublic: true,
          participants: ['npc1', 'npc2']
        }
      );

      expect(tags).toContain('first_time');
      expect(tags).toContain('important_npc');
      expect(tags).toContain('public');
      expect(tags).toContain('multi_participant');
    });
  });

  describe('generateMemoryDescription', () => {
    it('should generate readable descriptions', () => {
      const description = memoryService.generateMemoryDescription(
        createMockInteraction('conflict'),
        'critical_success',
        { participants: ['npc1'], location: 'battlefield' }
      );

      expect(description).toContain('conflict');
      expect(description).toContain('remarkable success');
      expect(description).toContain('battlefield');
    });

    it('should handle different interaction types and outcomes', () => {
      const socialDesc = memoryService.generateMemoryDescription(
        createMockInteraction('social'),
        'failure',
        {}
      );

      expect(socialDesc).toContain('social interaction');
      expect(socialDesc).toContain('failed');
    });
  });

  describe('getRelevantMemories', () => {
    beforeEach(() => {
      // Add some test memories
      mockCharacter.significantMemories = [
        {
          id: 'mem1',
          interactionType: 'social',
          significance: 0.8,
          timestamp: Date.now() - 1000,
          contextTags: ['social', 'success'],
          participants: ['npc1']
        },
        {
          id: 'mem2',
          interactionType: 'conflict',
          significance: 0.6,
          timestamp: Date.now() - 2000,
          contextTags: ['conflict', 'failure'],
          participants: ['npc2']
        },
        {
          id: 'mem3',
          interactionType: 'social',
          significance: 0.9,
          timestamp: Date.now() - 3000,
          contextTags: ['social', 'critical_success'],
          participants: ['npc1']
        }
      ];
    });

    it('should return memories matching interaction type', () => {
      const relevantMemories = memoryService.getRelevantMemories(
        mockCharacter,
        'social',
        5
      );

      expect(relevantMemories).toHaveLength(2);
      expect(relevantMemories.every(m => m.interactionType === 'social')).toBe(true);
    });

    it('should sort by significance and recency', () => {
      const relevantMemories = memoryService.getRelevantMemories(
        mockCharacter,
        'social',
        5
      );

      // Should be sorted by significance (highest first)
      // Check that we have the right memories and they're sorted correctly
      expect(relevantMemories).toHaveLength(2);
      expect(relevantMemories[0].significance).toBeGreaterThanOrEqual(relevantMemories[1].significance);
      
      // The highest significance should be first
      const significances = relevantMemories.map(m => m.significance);
      const sortedSignificances = [...significances].sort((a, b) => b - a);
      expect(significances).toEqual(sortedSignificances);
    });

    it('should limit number of returned memories', () => {
      const relevantMemories = memoryService.getRelevantMemories(
        mockCharacter,
        'social',
        1
      );

      expect(relevantMemories).toHaveLength(1);
    });

    it('should match by context tags', () => {
      const relevantMemories = memoryService.getRelevantMemories(
        mockCharacter,
        'success',
        5
      );

      expect(relevantMemories.length).toBeGreaterThan(0);
      expect(relevantMemories.some(m => m.contextTags.includes('success'))).toBe(true);
    });

    it('should match by participants', () => {
      const relevantMemories = memoryService.getRelevantMemories(
        mockCharacter,
        'any_type',
        5,
        { participants: ['npc1'] }
      );

      expect(relevantMemories.length).toBeGreaterThan(0);
      expect(relevantMemories.every(m => m.participants.includes('npc1'))).toBe(true);
    });

    it('should return empty array for character with no memories', () => {
      const emptyCharacter = createMockCharacter('empty');
      delete emptyCharacter.significantMemories;

      const relevantMemories = memoryService.getRelevantMemories(
        emptyCharacter,
        'social',
        5
      );

      expect(relevantMemories).toEqual([]);
    });
  });

  describe('isSignificantEnoughToStore', () => {
    it('should return true for significant interactions', () => {
      const isSignificant = memoryService.isSignificantEnoughToStore(
        createMockInteraction('conflict'),
        'critical_success',
        { emotionalImpact: 0.8 }
      );

      expect(isSignificant).toBe(true);
    });

    it('should return false for insignificant interactions', () => {
      const isSignificant = memoryService.isSignificantEnoughToStore(
        createMockInteraction('rest'),
        'neutral',
        { emotionalImpact: 0.1 }
      );

      expect(isSignificant).toBe(false);
    });
  });

  describe('getMemoryStatistics', () => {
    it('should return correct statistics for character with memories', () => {
      mockCharacter.significantMemories = [
        {
          interactionType: 'social',
          significance: 0.8,
          timestamp: 1000
        },
        {
          interactionType: 'conflict',
          significance: 0.6,
          timestamp: 2000
        },
        {
          interactionType: 'social',
          significance: 0.7,
          timestamp: 3000
        }
      ];

      const stats = memoryService.getMemoryStatistics(mockCharacter);

      expect(stats).toMatchObject({
        totalMemories: 3,
        averageSignificance: 0.7,
        memoryTypes: {
          social: 2,
          conflict: 1
        },
        oldestMemory: expect.objectContaining({ timestamp: 1000 }),
        newestMemory: expect.objectContaining({ timestamp: 3000 })
      });
    });

    it('should return empty statistics for character with no memories', () => {
      delete mockCharacter.significantMemories;

      const stats = memoryService.getMemoryStatistics(mockCharacter);

      expect(stats).toMatchObject({
        totalMemories: 0,
        averageSignificance: 0,
        memoryTypes: {},
        oldestMemory: null,
        newestMemory: null
      });
    });
  });

  describe('pruneMemories', () => {
    beforeEach(() => {
      const now = Date.now();
      mockCharacter.significantMemories = [
        {
          id: 'old_low',
          significance: 0.1,
          timestamp: now - (400 * 24 * 60 * 60 * 1000) // 400 days old
        },
        {
          id: 'old_high',
          significance: 0.8,
          timestamp: now - (400 * 24 * 60 * 60 * 1000) // 400 days old
        },
        {
          id: 'new_low',
          significance: 0.1,
          timestamp: now - (10 * 24 * 60 * 60 * 1000) // 10 days old
        },
        {
          id: 'new_high',
          significance: 0.8,
          timestamp: now - (10 * 24 * 60 * 60 * 1000) // 10 days old
        }
      ];
    });

    it('should remove old memories', () => {
      const removed = memoryService.pruneMemories(mockCharacter, {
        maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
      });

      expect(removed).toBe(3); // Should remove old memories that are also low significance
      expect(mockCharacter.significantMemories).toHaveLength(1);
      expect(mockCharacter.significantMemories[0].id).toBe('new_high');
    });

    it('should remove low-significance memories', () => {
      const removed = memoryService.pruneMemories(mockCharacter, {
        minSignificance: 0.5
      });

      expect(removed).toBe(3); // Should remove low-significance memories that are also old
      expect(mockCharacter.significantMemories).toHaveLength(1);
      expect(mockCharacter.significantMemories[0].id).toBe('new_high');
    });

    it('should enforce memory limit', () => {
      // Add many memories
      for (let i = 0; i < 60; i++) {
        mockCharacter.significantMemories.push({
          id: `extra_${i}`,
          significance: 0.5,
          timestamp: Date.now()
        });
      }

      const removed = memoryService.pruneMemories(mockCharacter, {
        maxMemories: 50
      });

      expect(mockCharacter.significantMemories.length).toBeLessThanOrEqual(50);
      expect(removed).toBeGreaterThan(0);
    });

    it('should return 0 for character with no memories', () => {
      delete mockCharacter.significantMemories;

      const removed = memoryService.pruneMemories(mockCharacter);

      expect(removed).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle memory operations on character without significantMemories property', () => {
      delete mockCharacter.significantMemories;

      expect(() => {
        memoryService.getRelevantMemories(mockCharacter, 'social');
      }).not.toThrow();

      expect(() => {
        memoryService.getMemoryStatistics(mockCharacter);
      }).not.toThrow();

      expect(() => {
        memoryService.pruneMemories(mockCharacter);
      }).not.toThrow();
    });

    it('should handle interactions with missing properties', () => {
      const incompleteInteraction = { type: 'social' }; // Missing id and name

      expect(() => {
        memoryService.addMemoryIfSignificant(
          mockCharacter,
          incompleteInteraction,
          'success'
        );
      }).not.toThrow();
    });

    it('should handle context with missing properties', () => {
      expect(() => {
        memoryService.addMemoryIfSignificant(
          mockCharacter,
          mockInteraction,
          'success',
          {} // Empty context
        );
      }).not.toThrow();
    });
  });
});