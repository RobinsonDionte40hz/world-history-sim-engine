/**
 * Task 4 Validation Tests
 * Memory Querying System Development
 *
 * Tests for MemoryQuery value object, MemoryQueryService, and BehavioralStateService integration
 */

import MemoryQuery from '../../valueObjects/MemoryQuery.js';
import MemoryQueryService from '../MemoryQueryService.js';
import BehavioralStateService from '../BehavioralStateService.js';
import SignificantMemoryService from '../SignificantMemoryService.js';

describe('Task 4: Memory Querying System Development', () => {
  let memoryQueryService;
  let behavioralStateService;
  let significantMemoryService;

  // Test data
  let testCharacter;
  let testSettlement;
  let testMemories;

  beforeEach(() => {
    // Initialize services
    significantMemoryService = new SignificantMemoryService();
    memoryQueryService = new MemoryQueryService(significantMemoryService, significantMemoryService);
    behavioralStateService = new BehavioralStateService(significantMemoryService);

    // Create test character
    testCharacter = {
      id: 'test-character-1',
      name: 'Test Character',
      consciousness: {
        frequency: 40,
        coherence: 0.8,
        behavioralState: {
          energy: 0.8,
          focus: 0.7,
          socialDrive: 0.6
        }
      },
      personality: {
        traits: {
          empathy: 0.7,
          aggression: 0.3,
          curiosity: 0.8
        }
      },
      attributes: {
        strength: 15,
        dexterity: 12,
        intelligence: 13,
        wisdom: 11,
        charisma: 10,
        constitution: 14
      },
      significantMemories: []
    };

    // Create test settlement
    testSettlement = {
      id: 'test-settlement-1',
      name: 'Test Settlement',
      characters: [testCharacter.id]
    };

    // Create test memories
    testMemories = [
      {
        id: 'mem-1',
        interactionType: 'social',
        outcome: 'success',
        significance: 0.8,
        timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
        participants: ['other-char-1'],
        location: 'tavern',
        emotionalImpact: 0.7,
        contextTags: ['friendly', 'conversation'],
        description: 'Had a pleasant conversation at the tavern'
      },
      {
        id: 'mem-2',
        interactionType: 'combat',
        outcome: 'failure',
        significance: 0.9,
        timestamp: Date.now() - (6 * 60 * 60 * 1000), // 6 hours ago
        participants: ['enemy-1'],
        location: 'forest',
        emotionalImpact: 0.8,
        contextTags: ['dangerous', 'defeat'],
        description: 'Lost a fight in the forest'
      },
      {
        id: 'mem-3',
        interactionType: 'social',
        outcome: 'critical_success',
        significance: 0.7,
        timestamp: Date.now() - (30 * 60 * 1000), // 30 minutes ago
        participants: ['friend-1'],
        location: 'market',
        emotionalImpact: 0.9,
        contextTags: ['celebration', 'success'],
        description: 'Made a great impression at the market'
      }
    ];

    // Add memories to character
    testCharacter.significantMemories = testMemories;

    // Rebuild indexes
    memoryQueryService.rebuildIndexes([testCharacter], [testSettlement]);
  });

  describe('MemoryQuery Value Object', () => {
    test('should create valid query with type filter', () => {
      const query = new MemoryQuery({ type: 'social' });

      expect(query.type).toEqual(['social']);
      expect(query.matches(testMemories[0])).toBe(true);
      expect(query.matches(testMemories[1])).toBe(false);
    });

    test('should create valid query with time range', () => {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      const query = new MemoryQuery({
        timeRange: { start: oneHourAgo }
      });

      expect(query.timeRange.start).toBe(oneHourAgo);
      expect(query.matches(testMemories[0])).toBe(false); // 2 hours ago
      expect(query.matches(testMemories[2])).toBe(true);  // 1 hour ago
    });

    test('should create valid query with significance range', () => {
      const query = new MemoryQuery({
        significance: { min: 0.8 }
      });

      expect(query.significance.min).toBe(0.8);
      expect(query.matches(testMemories[0])).toBe(true);  // 0.8
      expect(query.matches(testMemories[2])).toBe(false); // 0.7
    });

    test('should create valid query with multiple criteria', () => {
      const query = new MemoryQuery({
        type: 'social',
        outcome: ['success', 'critical_success'],
        limit: 5,
        sortBy: 'significance',
        sortOrder: 'desc'
      });

      expect(query.type).toEqual(['social']);
      expect(query.outcome).toEqual(['success', 'critical_success']);
      expect(query.limit).toBe(5);
      expect(query.sortBy).toBe('significance');
      expect(query.sortOrder).toBe('desc');
    });

    test('should validate query parameters', () => {
      expect(() => new MemoryQuery({ type: 123 })).toThrow();
      expect(() => new MemoryQuery({ limit: 'invalid' })).toThrow();
      expect(() => new MemoryQuery({ sortBy: 'invalid' })).toThrow();
    });

    test('should provide static factory methods', () => {
      const recentQuery = MemoryQuery.recent(24);
      expect(recentQuery.timeRange.start).toBeDefined();

      const significantQuery = MemoryQuery.significant(0.8);
      expect(significantQuery.significance.min).toBe(0.8);

      const participantQuery = MemoryQuery.involving('char-1');
      expect(participantQuery.participants).toEqual(['char-1']);

      const locationQuery = MemoryQuery.atLocation('tavern');
      expect(locationQuery.location).toEqual(['tavern']);

      const typeQuery = MemoryQuery.ofType('social');
      expect(typeQuery.type).toEqual(['social']);
    });
  });

  describe('MemoryQueryService - Personal Memory Queries', () => {
    test('should query personal memories by type', () => {
      const memories = memoryQueryService.queryPersonalMemories(
        testCharacter,
        { type: 'social' }
      );

      expect(memories).toHaveLength(2);
      expect(memories.every(m => m.interactionType === 'social')).toBe(true);
    });

    test('should query personal memories by time range', () => {
      const threeHoursAgo = Date.now() - (3 * 60 * 60 * 1000);
      const memories = memoryQueryService.queryPersonalMemories(
        testCharacter,
        { timeRange: { start: threeHoursAgo } }
      );

      expect(memories).toHaveLength(2); // Recent memories
    });

    test('should query personal memories by significance', () => {
      const memories = memoryQueryService.queryPersonalMemories(
        testCharacter,
        { significance: { min: 0.8 } }
      );

      expect(memories).toHaveLength(2); // High significance memories
      expect(memories.every(m => m.significance >= 0.8)).toBe(true);
    });

    test('should respect query limits', () => {
      const memories = memoryQueryService.queryPersonalMemories(
        testCharacter,
        { limit: 1 }
      );

      expect(memories).toHaveLength(1);
    });

    test('should sort memories correctly', () => {
      const memories = memoryQueryService.queryPersonalMemories(
        testCharacter,
        { sortBy: 'significance', sortOrder: 'desc' }
      );

      expect(memories[0].significance).toBeGreaterThanOrEqual(memories[1].significance);
    });
  });

  describe('MemoryQueryService - Settlement Memory Queries', () => {
    test('should query settlement memories', () => {
      const memories = memoryQueryService.querySettlementHistory(
        testSettlement,
        { type: 'social' }
      );

      expect(memories.length).toBeGreaterThan(0);
      expect(memories.every(m => m.settlementId === testSettlement.id)).toBe(true);
    });
  });

  describe('MemoryQueryService - Global Memory Queries', () => {
    test('should query global memories', () => {
      const memories = memoryQueryService.queryGlobalHistory(
        { type: 'combat' }
      );

      expect(memories).toHaveLength(1);
      expect(memories[0].interactionType).toBe('combat');
    });
  });

  describe('MemoryQueryService - Specialized Queries', () => {
    test('should query relationship memories', () => {
      const memories = memoryQueryService.queryRelationshipMemories(
        testCharacter,
        'friend-1'
      );

      expect(memories.length).toBeGreaterThan(0);
      expect(memories.every(m => m.participants.includes('friend-1'))).toBe(true);
    });

    test('should analyze interaction patterns', () => {
      const analysis = memoryQueryService.queryInteractionPatterns(
        testCharacter,
        'social'
      );

      expect(analysis.interactionType).toBe('social');
      expect(analysis.totalMemories).toBe(2);
      expect(analysis).toHaveProperty('successRate');
      expect(analysis).toHaveProperty('trend');
      expect(analysis).toHaveProperty('recommendation');
    });

    test('should query emotional memories', () => {
      const memories = memoryQueryService.queryEmotionalMemories(
        testCharacter,
        'positive'
      );

      expect(memories.every(m => ['success', 'critical_success'].includes(m.outcome))).toBe(true);
    });

    test('should query temporal memories', () => {
      const memories = memoryQueryService.queryTemporalMemories(
        testCharacter,
        'recent'
      );

      expect(memories.length).toBeGreaterThan(0);
      // Recent memories should be within last 24 hours
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      expect(memories.every(m => m.timestamp > oneDayAgo)).toBe(true);
    });
  });

  describe('MemoryQueryService - Statistics and Analysis', () => {
    test('should provide memory statistics', () => {
      const stats = memoryQueryService.getMemoryStatistics(testCharacter);

      expect(stats.totalMemories).toBe(3);
      expect(stats).toHaveProperty('averageSignificance');
      expect(stats).toHaveProperty('outcomeDistribution');
      expect(stats).toHaveProperty('typeDistribution');
      expect(stats).toHaveProperty('mostSignificant');
    });
  });

  describe('BehavioralStateService - Enhanced Memory Integration', () => {
    test('should use advanced memory querying for behavioral modifiers', () => {
      const modifier = behavioralStateService.getBehavioralModifier(
        testCharacter,
        'social',
        { location: 'tavern' }
      );

      expect(typeof modifier).toBe('number');
      expect(modifier).toBeGreaterThanOrEqual(0.1);
      expect(modifier).toBeLessThanOrEqual(3.0);
    });

    test('should provide comprehensive decision factor analysis', () => {
      const analysis = behavioralStateService.calculateDecisionFactor(
        testCharacter,
        'social'
      );

      expect(analysis).toHaveProperty('finalFactor');
      expect(analysis).toHaveProperty('breakdown');
      expect(analysis.breakdown).toHaveProperty('memory');
      expect(analysis.breakdown.memory).toBeDefined();
    });

    test('should enhance memory influence with contextual analysis', () => {
      const memoryAnalysis = behavioralStateService.getMemoryAnalysis(
        testCharacter,
        'social'
      );

      expect(memoryAnalysis.hasMemories).toBe(true);
      expect(memoryAnalysis).toHaveProperty('memoryModifier');
      expect(memoryAnalysis).toHaveProperty('analysis');
    });
  });

  describe('Index Management', () => {
    test('should rebuild indexes correctly', () => {
      const result = memoryQueryService.rebuildIndexes([testCharacter], [testSettlement]);

      expect(result.success).toBe(true);
      expect(result.totalMemories).toBe(3);
      expect(result.characterCount).toBe(1);
      expect(result.settlementCount).toBe(1);
    });

    test('should update character index incrementally', () => {
      const newMemory = {
        id: 'mem-4',
        interactionType: 'economic',
        outcome: 'success',
        significance: 0.6,
        timestamp: Date.now(),
        participants: [],
        location: 'market',
        emotionalImpact: 0.5,
        contextTags: ['trade'],
        description: 'Successful trade at market'
      };

      memoryQueryService.updateCharacterIndex(testCharacter.id, [...testMemories, newMemory]);

      const memories = memoryQueryService.queryPersonalMemories(
        testCharacter,
        { type: 'economic' }
      );

      expect(memories).toHaveLength(1);
      expect(memories[0].interactionType).toBe('economic');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid character gracefully', () => {
      const memories = memoryQueryService.queryPersonalMemories(null, {});
      expect(memories).toEqual([]);
    });

    test('should handle invalid settlement gracefully', () => {
      const memories = memoryQueryService.querySettlementHistory(null, {});
      expect(memories).toEqual([]);
    });

    test('should handle invalid query parameters gracefully', () => {
      const memories = memoryQueryService.queryPersonalMemories(testCharacter, {});
      expect(memories).toHaveLength(3); // Returns all memories with default query
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large memory sets efficiently', () => {
      // Create character with many memories
      const largeCharacter = {
        ...testCharacter,
        id: 'large-char',
        significantMemories: Array.from({ length: 100 }, (_, i) => ({
          id: `mem-${i}`,
          interactionType: i % 2 === 0 ? 'social' : 'combat',
          outcome: 'success',
          significance: 0.5 + (i % 50) / 100,
          timestamp: Date.now() - (i * 60 * 1000), // Spread over time
          participants: [],
          location: 'various',
          emotionalImpact: 0.5,
          contextTags: [],
          description: `Memory ${i}`
        }))
      };

      const startTime = Date.now();
      const memories = memoryQueryService.queryPersonalMemories(
        largeCharacter,
        { type: 'social', limit: 10 }
      );
      const endTime = Date.now();

      expect(memories).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });
  });
});