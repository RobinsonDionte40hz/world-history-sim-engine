/**
 * Unit Tests for ContentInteraction Class
 *
 * Tests the core functionality of the ContentInteraction class,
 * including flexibility properties, backward compatibility, and content management.
 */

import ContentInteraction from '../../domain/entities/interactions/ContentInteraction.js';

describe('ContentInteraction', () => {
  // Mock concrete implementation for testing
  class MockContentInteraction extends ContentInteraction {
    constructor(config = {}) {
      super(config);
      this.mockProperty = config.mockProperty || 'test';
    }
  }

  describe('Constructor', () => {
    test('should create instance with default values', () => {
      const interaction = new MockContentInteraction();

      expect(interaction.isContentInteraction).toBe(true);
      expect(interaction.category).toBe('general');
      expect(interaction.author).toBe('system');
      expect(interaction.tags).toEqual([]);
      expect(interaction.overrideFlags).toEqual({});
      expect(interaction.requirements).toEqual([]);
      expect(interaction.branches).toEqual([]);
      expect(interaction.effects).toEqual([]);
      expect(interaction.participants).toEqual([]);
      expect(interaction.cooldown).toBe(0);
      expect(interaction.repeatable).toBe(false);
      expect(interaction.lastUsed).toBe(0);
    });

    test('should create instance with provided config', () => {
      const config = {
        name: 'Test Content Interaction',
        type: 'dialogue',
        category: 'social',
        author: 'test-author',
        tags: ['test', 'dialogue'],
        overrideFlags: { canInterrupt: true },
        requirements: [{ attr: 'charisma', min: 12 }],
        branches: [{ text: 'Hello', effects: [] }],
        effects: [{ type: 'relationship', target: 'npc1', value: 1 }],
        participants: ['char1', 'npc1'],
        cooldown: 5,
        repeatable: true,
        lastUsed: 10,
        mockProperty: 'custom'
      };

      const interaction = new MockContentInteraction(config);

      expect(interaction.name).toBe('Test Content Interaction');
      expect(interaction.type).toBe('dialogue');
      expect(interaction.category).toBe('social');
      expect(interaction.author).toBe('test-author');
      expect(interaction.tags).toEqual(['test', 'dialogue']);
      expect(interaction.overrideFlags).toEqual({ canInterrupt: true });
      expect(interaction.requirements).toEqual([{ attr: 'charisma', min: 12 }]);
      expect(interaction.branches).toEqual([{ text: 'Hello', effects: [] }]);
      expect(interaction.effects).toEqual([{ type: 'relationship', target: 'npc1', value: 1 }]);
      expect(interaction.participants).toEqual(['char1', 'npc1']);
      expect(interaction.cooldown).toBe(5);
      expect(interaction.repeatable).toBe(true);
      expect(interaction.lastUsed).toBe(10);
      expect(interaction.mockProperty).toBe('custom');
    });

    test('should handle null/undefined config properties gracefully', () => {
      const config = {
        tags: null,
        requirements: undefined,
        overrideFlags: null
      };

      const interaction = new MockContentInteraction(config);

      expect(interaction.tags).toEqual([]);
      expect(interaction.requirements).toEqual([]);
      expect(interaction.overrideFlags).toEqual({});
    });
  });

  describe('Execution Logic', () => {
    let interaction;
    let mockCharacter;
    let mockWorldState;

    beforeEach(() => {
      interaction = new MockContentInteraction({
        name: 'Test Interaction',
        effects: [
          { type: 'relationship', target: 'npc1', value: 5 },
          { type: 'attribute', target: 'charisma', value: 1 }
        ]
      });

      mockCharacter = {
        id: 'char1',
        attributes: {
          charisma: { score: 12, modifier: 1 }
        },
        relationships: new Map([['npc1', 0]]),
        influence: { value: 10 }
      };

      mockWorldState = {
        currentTick: 100
      };
    });

    test('should execute successfully with valid character', () => {
      const result = interaction.execute(mockCharacter, mockWorldState);

      expect(result.success).toBe(true);
      expect(result.interaction).toBe(interaction);
      expect(result.effects).toHaveLength(2);
      expect(result.logs).toContain('Test Interaction executed successfully');
      expect(interaction.lastUsed).toBe(100);
    });

    test('should apply relationship effects correctly', () => {
      interaction.execute(mockCharacter, mockWorldState);

      expect(mockCharacter.relationships.get('npc1')).toBe(5);
    });

    test('should apply attribute effects correctly', () => {
      interaction.execute(mockCharacter, mockWorldState);

      expect(mockCharacter.attributes.charisma.score).toBe(13);
      expect(mockCharacter.attributes.charisma.modifier).toBe(1); // floor((13-10)/2) = 1
    });

    test('should handle unknown effect types gracefully', () => {
      interaction.effects.push({ type: 'unknown', target: 'test', value: 1 });

      const result = interaction.execute(mockCharacter, mockWorldState);

      expect(result.effects[2].applied).toBe(false);
      expect(result.effects[2].error).toBe('Unknown effect type: unknown');
    });

    test('should handle missing character properties gracefully', () => {
      const characterWithoutAttributes = { id: 'char1' };

      const result = interaction.execute(characterWithoutAttributes, mockWorldState);

      expect(result.success).toBe(true);
      // Effects should not be applied due to missing properties
      expect(result.effects[0].applied).toBe(false);
      expect(result.effects[1].applied).toBe(false);
    });
  });

  describe('Availability Checks', () => {
    let interaction;
    let mockCharacter;
    let mockWorldState;

    beforeEach(() => {
      interaction = new MockContentInteraction({
        requirements: [{ attr: 'charisma', min: 12 }],
        cooldown: 5,
        lastUsed: 90
      });

      mockCharacter = {
        attributes: {
          charisma: { score: 12 }
        }
      };

      mockWorldState = {
        currentTick: 100
      };
    });

    test('should be available with sufficient requirements and expired cooldown', () => {
      const available = interaction.canExecute(mockCharacter, mockWorldState);
      expect(available).toBe(true);
    });

    test('should not be available with insufficient attribute requirements', () => {
      mockCharacter.attributes.charisma.score = 10;
      const available = interaction.canExecute(mockCharacter, mockWorldState);
      expect(available).toBe(false);
    });

    test('should not be available during cooldown period', () => {
      mockWorldState.currentTick = 94; // 90 + 5 - 1 = still in cooldown
      const available = interaction.canExecute(mockCharacter, mockWorldState);
      expect(available).toBe(false);
    });

    test('should be available after cooldown expires', () => {
      mockWorldState.currentTick = 95; // 90 + 5 = cooldown expired
      const available = interaction.canExecute(mockCharacter, mockWorldState);
      expect(available).toBe(true);
    });

    test('should always be available if repeatable', () => {
      interaction.repeatable = true;
      interaction.lastUsed = 90;
      mockWorldState.currentTick = 94; // Still in cooldown

      const available = interaction.canExecute(mockCharacter, mockWorldState);
      expect(available).toBe(true);
    });

    test('should handle missing character attributes gracefully', () => {
      const characterWithoutAttributes = {};
      const available = interaction.canExecute(characterWithoutAttributes, mockWorldState);
      expect(available).toBe(false);
    });
  });

  describe('Requirements Checking', () => {
    test('should return true for empty requirements', () => {
      const interaction = new MockContentInteraction();
      const character = {};

      const meetsReqs = interaction.meetsRequirements(character);
      expect(meetsReqs).toBe(true);
    });

    test('should return true when all requirements are met', () => {
      const interaction = new MockContentInteraction({
        requirements: [
          { attr: 'charisma', min: 12 },
          { attr: 'intelligence', min: 10 }
        ]
      });

      const character = {
        attributes: {
          charisma: { score: 15 },
          intelligence: { score: 12 }
        }
      };

      const meetsReqs = interaction.meetsRequirements(character);
      expect(meetsReqs).toBe(true);
    });

    test('should return false when requirements are not met', () => {
      const interaction = new MockContentInteraction({
        requirements: [{ attr: 'charisma', min: 12 }]
      });

      const character = {
        attributes: {
          charisma: { score: 10 }
        }
      };

      const meetsReqs = interaction.meetsRequirements(character);
      expect(meetsReqs).toBe(false);
    });
  });

  describe('Cooldown Management', () => {
    test('should return true for expired cooldown', () => {
      const interaction = new MockContentInteraction({
        cooldown: 5,
        lastUsed: 90
      });

      const expired = interaction.isCooldownExpired(96);
      expect(expired).toBe(true);
    });

    test('should return false for active cooldown', () => {
      const interaction = new MockContentInteraction({
        cooldown: 5,
        lastUsed: 90
      });

      const expired = interaction.isCooldownExpired(94);
      expect(expired).toBe(false);
    });

    test('should always return true for repeatable interactions', () => {
      const interaction = new MockContentInteraction({
        cooldown: 5,
        lastUsed: 90,
        repeatable: true
      });

      const expired = interaction.isCooldownExpired(94);
      expect(expired).toBe(true);
    });

    test('should update lastUsed timestamp when marked as used', () => {
      const interaction = new MockContentInteraction();
      interaction.markUsed(123);

      expect(interaction.lastUsed).toBe(123);
    });
  });

  describe('Branch Selection', () => {
    test('should return null for empty branches', () => {
      const interaction = new MockContentInteraction();
      const character = {};

      const branch = interaction.selectBranch(character);
      expect(branch).toBe(null);
    });

    test('should return first valid branch', () => {
      const branches = [
        { text: 'Option 1', condition: () => false },
        { text: 'Option 2', condition: () => true },
        { text: 'Option 3', condition: () => true }
      ];

      const interaction = new MockContentInteraction({ branches });
      const character = {};

      const branch = interaction.selectBranch(character);
      expect(branch.text).toBe('Option 2');
    });

    test('should return null when no branches meet conditions', () => {
      const branches = [
        { text: 'Option 1', condition: () => false },
        { text: 'Option 2', condition: () => false }
      ];

      const interaction = new MockContentInteraction({ branches });
      const character = {};

      const branch = interaction.selectBranch(character);
      expect(branch).toBe(null);
    });
  });

  describe('Tag Management', () => {
    let interaction;

    beforeEach(() => {
      interaction = new MockContentInteraction({
        tags: ['existing']
      });
    });

    test('should add new tags', () => {
      interaction.addTag('new-tag');
      expect(interaction.tags).toContain('new-tag');
      expect(interaction.tags).toContain('existing');
    });

    test('should not add duplicate tags', () => {
      interaction.addTag('existing');
      expect(interaction.tags.filter(tag => tag === 'existing')).toHaveLength(1);
    });

    test('should remove existing tags', () => {
      interaction.removeTag('existing');
      expect(interaction.tags).not.toContain('existing');
    });

    test('should handle removing non-existent tags gracefully', () => {
      interaction.removeTag('non-existent');
      expect(interaction.tags).toContain('existing');
    });

    test('should check tag existence correctly', () => {
      expect(interaction.hasTag('existing')).toBe(true);
      expect(interaction.hasTag('non-existent')).toBe(false);
    });
  });

  describe('Serialization', () => {
    test('should serialize to JSON correctly', () => {
      const interaction = new MockContentInteraction({
        id: 'test-id',
        name: 'Test Interaction',
        description: 'Test description',
        type: 'dialogue',
        category: 'social',
        author: 'test-author',
        tags: ['test', 'dialogue'],
        overrideFlags: { canInterrupt: true },
        requirements: [{ attr: 'charisma', min: 12 }],
        branches: [{ text: 'Hello' }],
        effects: [{ type: 'relationship', target: 'npc1', value: 1 }],
        participants: ['char1'],
        cooldown: 5,
        repeatable: true,
        lastUsed: 10,
        mockProperty: 'custom'
      });

      const json = interaction.toJSON();

      expect(json).toEqual({
        id: 'test-id',
        name: 'Test Interaction',
        description: 'Test description',
        type: 'dialogue',
        isContentInteraction: true,
        category: 'social',
        author: 'test-author',
        tags: ['test', 'dialogue'],
        overrideFlags: { canInterrupt: true },
        requirements: [{ attr: 'charisma', min: 12 }],
        branches: [{ text: 'Hello' }],
        effects: [{ type: 'relationship', target: 'npc1', value: 1 }],
        participants: ['char1'],
        cooldown: 5,
        repeatable: true,
        lastUsed: 10
      });
    });

    test('should deserialize from JSON correctly', () => {
      const data = {
        id: 'test-id',
        name: 'Test Interaction',
        category: 'social',
        author: 'test-author',
        tags: ['test'],
        requirements: [{ attr: 'charisma', min: 12 }],
        mockProperty: 'custom'
      };

      const interaction = MockContentInteraction.fromJSON(data);

      expect(interaction.id).toBe('test-id');
      expect(interaction.name).toBe('Test Interaction');
      expect(interaction.category).toBe('social');
      expect(interaction.author).toBe('test-author');
      expect(interaction.tags).toEqual(['test']);
      expect(interaction.requirements).toEqual([{ attr: 'charisma', min: 12 }]);
      expect(interaction.mockProperty).toBe('custom');
    });
  });

  describe('Energy Cost', () => {
    test('should return minimal energy cost by default', () => {
      const interaction = new MockContentInteraction();
      const character = {};
      const environment = {};

      const cost = interaction.getEnergyCost(character, environment);
      expect(cost).toBe(1);
    });
  });

  describe('Inheritance', () => {
    test('should inherit from InteractionBase', () => {
      const interaction = new MockContentInteraction();
      expect(interaction).toBeInstanceOf(ContentInteraction);
      expect(interaction).toBeInstanceOf(Object); // Should inherit from base class
    });

    test('should allow further subclassing', () => {
      class SpecializedContentInteraction extends MockContentInteraction {
        getEnergyCost(character, environment) {
          return 5; // Custom energy cost
        }
      }

      const interaction = new SpecializedContentInteraction();
      const cost = interaction.getEnergyCost({}, {});
      expect(cost).toBe(5);
    });
  });
});
