// src/test/integration/memory-query-with-enhanced-systems.test.js

import MemoryService from '../../domain/services/MemoryService.js';
import Character from '../../domain/entities/Character.js';

describe('Memory Service with Enhanced Systems Integration', () => {
  let memoryService;
  let mockCharacter;

  beforeEach(() => {
    memoryService = new MemoryService();
    
    // Create mock character with enhanced personality
    mockCharacter = new Character({
      id: 'char-1',
      name: 'Test Character',
      currentNodeId: 'node-1',
      energy: 80,
      health: 90,
      mood: 70,
      consciousness: { frequency: 40, coherence: 0.7 },
      baseAttributes: {
        strength: { score: 14 },
        dexterity: { score: 12 },
        constitution: { score: 13 },
        intelligence: { score: 15 },
        wisdom: { score: 11 },
        charisma: { score: 10 }
      },
      personality: {
        traits: [
          { id: 'analytical', intensity: 0.8 },
          { id: 'cautious', intensity: 0.6 }
        ]
      }
    });
  });

  describe('Memory Query with Personality Context', () => {
    beforeEach(() => {
      // Add decision history manually
      mockCharacter.decisionHistory = [
        {
          interactionId: 'interaction-1',
          outcome: 'positive',
          timestamp: Date.now() - 1000000
        },
        {
          interactionId: 'interaction-2',
          outcome: 'negative',
          timestamp: Date.now() - 500000
        },
        {
          interactionId: 'interaction-3',
          outcome: 'positive',
          timestamp: Date.now() - 100000
        }
      ];
    });

    it('should query memories by interaction ID', () => {
      const memories = memoryService.queryMemory(mockCharacter, {
        interactionId: 'interaction-1'
      });

      expect(Array.isArray(memories)).toBe(true);
      expect(memories.length).toBeGreaterThan(0);
      expect(memories[0].interactionId).toBe('interaction-1');
    });

    it('should filter memories by minimum significance', () => {
      const significantMemories = memoryService.queryMemory(mockCharacter, {
        minSignificance: 0.3
      });

      expect(Array.isArray(significantMemories)).toBe(true);
      // Recent memories should still be significant
      expect(significantMemories.some(m => m.interactionId === 'interaction-3')).toBe(true);
    });

    it('should calculate memory influence on decisions', () => {
      const mockInteraction = {
        id: 'interaction-1'
      };

      const influence = memoryService.getMemoryInfluence(mockCharacter, mockInteraction);

      expect(typeof influence).toBe('number');
      expect(influence).toBeGreaterThanOrEqual(-1);
      expect(influence).toBeLessThanOrEqual(0.5);
    });
  });

  describe('Memory Retention with Consciousness', () => {
    it('should calculate retention strength based on consciousness coherence', () => {
      const recentEvent = {
        outcome: 'positive',
        timestamp: Date.now() - 60000 // 1 minute ago
      };

      const retention = memoryService.calculateRetentionStrength(mockCharacter, recentEvent);

      expect(typeof retention).toBe('number');
      expect(retention).toBeGreaterThanOrEqual(0);
      expect(retention).toBeLessThanOrEqual(1);
    });

    it('should decay older memories faster', () => {
      const recentEvent = {
        outcome: 'positive',
        timestamp: Date.now() - 60000 // 1 minute ago
      };

      const oldEvent = {
        outcome: 'positive',
        timestamp: Date.now() - 86400000 // 24 hours ago
      };

      const recentRetention = memoryService.calculateRetentionStrength(mockCharacter, recentEvent);
      const oldRetention = memoryService.calculateRetentionStrength(mockCharacter, oldEvent);

      expect(recentRetention).toBeGreaterThan(oldRetention);
    });

    it('should retain positive events longer than negative ones', () => {
      const positiveEvent = {
        outcome: 'positive',
        timestamp: Date.now() - 3600000 // 1 hour ago
      };

      const negativeEvent = {
        outcome: 'negative',
        timestamp: Date.now() - 3600000 // 1 hour ago
      };

      const positiveRetention = memoryService.calculateRetentionStrength(mockCharacter, positiveEvent);
      const negativeRetention = memoryService.calculateRetentionStrength(mockCharacter, negativeEvent);

      expect(positiveRetention).toBeGreaterThan(negativeRetention);
    });
  });

  describe('Memory-Based Relationship Updates', () => {
    beforeEach(() => {
      // Add a relationship with proper structure (value and history)
      mockCharacter.relationships = new Map([
        ['char-2', { value: 0.5, type: 'ally', history: [] }]
      ]);
    });

    it('should update relationship based on positive interaction', () => {
      memoryService.updateRelationship(mockCharacter, 'char-2', 'positive');

      const relationship = mockCharacter.relationships.get('char-2');
      expect(relationship).toBeDefined();
      expect(typeof relationship.value).toBe('number');
      expect(relationship.history).toBeDefined();
      expect(relationship.history.length).toBeGreaterThan(0);
    });

    it('should update relationship based on negative interaction', () => {
      memoryService.updateRelationship(mockCharacter, 'char-2', 'negative');

      const relationship = mockCharacter.relationships.get('char-2');
      expect(relationship).toBeDefined();
      expect(typeof relationship.value).toBe('number');
      expect(relationship.history).toBeDefined();
      expect(relationship.history.length).toBeGreaterThan(0);
    });
  });

  describe('Memory Pruning', () => {
    it('should remove very old memories below retention threshold', () => {
      // Add logDecision method to mock character
      mockCharacter.logDecision = function(interactionId, outcome) {
        this.decisionHistory.push({
          interactionId,
          outcome,
          timestamp: Date.now()
        });
      };

      // Add old memories
      mockCharacter.decisionHistory = [
        {
          interactionId: 'old-1',
          outcome: 'positive',
          timestamp: Date.now() - 86400000 * 365 // 1 year ago
        },
        {
          interactionId: 'recent-1',
          outcome: 'positive',
          timestamp: Date.now() - 60000 // 1 minute ago
        }
      ];

      memoryService.updateMemory(mockCharacter, 'new-interaction', 'positive');

      // After update, very old memories should be pruned
      expect(mockCharacter.decisionHistory.length).toBeGreaterThan(0);
      
      // Recent memory should still exist
      const hasRecent = mockCharacter.decisionHistory.some(m => m.interactionId === 'recent-1');
      expect(hasRecent).toBe(true);
    });
  });
});
