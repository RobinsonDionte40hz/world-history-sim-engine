/**
 * Backward Compatibility Tests for Interaction Class
 *
 * Tests to ensure the existing Interaction class maintains exact backward compatibility
 * after extending ContentInteraction. All existing functionality must work identically.
 */

import Interaction from '../../domain/entities/Interaction.js';

describe('Interaction Backward Compatibility', () => {
  describe('Constructor - Existing Behavior', () => {
    test('should create instance with exact same properties as before', () => {
      const config = {
        id: 'test-id',
        nodeId: 'node-123',
        name: 'Test Interaction',
        description: 'Test description',
        type: 'dialogue',
        requirements: [{ attr: 'charisma', min: 12 }],
        branches: [{ text: 'Hello', effects: [] }],
        effects: [{ type: 'influence', value: 5 }],
        participants: ['char1', 'char2'],
        cooldown: 5,
        repeatable: true,
        lastUsed: 10
      };

      const interaction = new Interaction(config);

      expect(interaction.id).toBe('test-id');
      expect(interaction.nodeId).toBe('node-123');
      expect(interaction.name).toBe('Test Interaction');
      expect(interaction.description).toBe('Test description');
      expect(interaction.type).toBe('dialogue');
      expect(interaction.requirements).toEqual([{ attr: 'charisma', min: 12 }]);
      expect(interaction.branches).toEqual([{ text: 'Hello', effects: [] }]);
      expect(interaction.effects).toEqual([{ type: 'influence', value: 5 }]);
      expect(interaction.participants).toEqual(['char1', 'char2']);
      expect(interaction.cooldown).toBe(5);
      expect(interaction.repeatable).toBe(true);
      expect(interaction.lastUsed).toBe(10);
    });

    test('should generate UUID when no id provided', () => {
      const interaction = new Interaction();
      expect(interaction.id).toBeDefined();
      expect(typeof interaction.id).toBe('string');
      expect(interaction.id.length).toBeGreaterThan(0);
    });

    test('should have null nodeId by default', () => {
      const interaction = new Interaction();
      expect(interaction.nodeId).toBe(null);
    });
  });

  describe('meetsRequirements - Existing Behavior', () => {
    test('should return true when all requirements met', () => {
      const interaction = new Interaction({
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

      expect(interaction.meetsRequirements(character)).toBe(true);
    });

    test('should return false when requirements not met', () => {
      const interaction = new Interaction({
        requirements: [{ attr: 'charisma', min: 12 }]
      });

      const character = {
        attributes: {
          charisma: { score: 10 }
        }
      };

      expect(interaction.meetsRequirements(character)).toBe(false);
    });

    test('should handle missing attributes gracefully', () => {
      const interaction = new Interaction({
        requirements: [{ attr: 'charisma', min: 12 }]
      });

      const character = {};
      expect(interaction.meetsRequirements(character)).toBe(false);
    });
  });

  describe('selectBranch - Existing Weighted Selection', () => {
    let interaction;
    let character;

    beforeEach(() => {
      interaction = new Interaction({
        branches: [
          { text: 'Branch 1', requiredEnergy: 5, matchFactor: 1 },
          { text: 'Branch 2', requiredEnergy: 15, matchFactor: 2 },
          { text: 'Branch 3', requiredEnergy: 10, matchFactor: 1.5 }
        ]
      });

      character = {
        attributes: {
          intelligence: { score: 12 }
        },
        consciousness: {
          frequency: 40,
          coherence: 0.8
        },
        personality: {
          traits: [
            { value: 0.5 },
            { value: 0.3 }
          ]
        }
      };
    });

    test('should return null for empty branches', () => {
      const emptyInteraction = new Interaction();
      expect(emptyInteraction.selectBranch(character)).toBe(null);
    });

    test('should select a branch using weighted algorithm', () => {
      const branch = interaction.selectBranch(character);
      expect(branch).toBeDefined();
      expect(typeof branch.text).toBe('string');
      expect(branch.text.startsWith('Branch')).toBe(true);
    });

    test('should handle branches with conditions', () => {
      interaction.branches[0].condition = () => true;
      interaction.branches[1].condition = () => false;
      interaction.branches[2].condition = () => false;

      const branch = interaction.selectBranch(character);
      expect(branch.text).toBe('Branch 1');
    });

    test('should return null when no branches meet conditions', () => {
      interaction.branches.forEach(branch => {
        branch.condition = () => false;
      });

      expect(interaction.selectBranch(character)).toBe(null);
    });
  });

  describe('applyEffects - Existing Behavior', () => {
    let character;

    beforeEach(() => {
      character = {
        influence: { value: 10 },
        relationships: new Map([['npc1', 5]]),
        attributes: {
          charisma: { score: 12, modifier: 1 },
          strength: { score: 14, modifier: 2 }
        }
      };
    });

    test('should apply influence effects', () => {
      const interaction = new Interaction({
        effects: [{ type: 'influence', value: 5 }]
      });

      interaction.applyEffects(character);
      expect(character.influence.value).toBe(15);
    });

    test('should apply relationship effects', () => {
      const interaction = new Interaction({
        effects: [{ type: 'relationship', target: 'npc1', value: 3 }]
      });

      interaction.applyEffects(character);
      expect(character.relationships.get('npc1')).toBe(8);
    });

    test('should apply attribute effects with modifier calculation', () => {
      const interaction = new Interaction({
        effects: [{ type: 'attribute', target: 'charisma', value: 2 }]
      });

      interaction.applyEffects(character);
      expect(character.attributes.charisma.score).toBe(14);
      expect(character.attributes.charisma.modifier).toBe(2); // floor((14-10)/2) = 2
    });

    test('should handle unknown effect types with console warning', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const interaction = new Interaction({
        effects: [{ type: 'unknown', value: 1 }]
      });

      interaction.applyEffects(character);
      expect(consoleSpy).toHaveBeenCalledWith('Unknown effect type: unknown');

      consoleSpy.mockRestore();
    });
  });

  describe('Availability and Cooldown - Existing Behavior', () => {
    test('should be available when repeatable', () => {
      const interaction = new Interaction({
        repeatable: true,
        lastUsed: 100,
        cooldown: 10
      });

      expect(interaction.isAvailable(95)).toBe(true);
    });

    test('should be available when cooldown expired', () => {
      const interaction = new Interaction({
        repeatable: false,
        lastUsed: 90,
        cooldown: 5
      });

      expect(interaction.isAvailable(96)).toBe(true);
    });

    test('should not be available during cooldown', () => {
      const interaction = new Interaction({
        repeatable: false,
        lastUsed: 90,
        cooldown: 10
      });

      expect(interaction.isAvailable(95)).toBe(false);
    });

    test('should update lastUsed timestamp', () => {
      const interaction = new Interaction();
      interaction.markUsed(123);
      expect(interaction.lastUsed).toBe(123);
    });
  });

  describe('Serialization - Exact Existing Format', () => {
    test('should serialize to exact existing JSON format', () => {
      const interaction = new Interaction({
        id: 'test-id',
        nodeId: 'node-123',
        name: 'Test Interaction',
        description: 'Test description',
        type: 'dialogue',
        requirements: [{ attr: 'charisma', min: 12 }],
        branches: [{ text: 'Hello' }],
        effects: [{ type: 'influence', value: 5 }],
        participants: ['char1'],
        cooldown: 5,
        repeatable: true,
        lastUsed: 10
      });

      const json = interaction.toJSON();

      expect(json).toEqual({
        id: 'test-id',
        nodeId: 'node-123',
        name: 'Test Interaction',
        description: 'Test description',
        type: 'dialogue',
        requirements: [{ attr: 'charisma', min: 12 }],
        branches: [{ text: 'Hello' }],
        effects: [{ type: 'influence', value: 5 }],
        participants: ['char1'],
        cooldown: 5,
        repeatable: true,
        lastUsed: 10
      });
    });

    test('should include nodeId in serialization', () => {
      const interaction = new Interaction({
        nodeId: 'special-node'
      });

      const json = interaction.toJSON();
      expect(json.nodeId).toBe('special-node');
    });
  });

  describe('Inheritance from ContentInteraction', () => {
    test('should inherit isContentInteraction property', () => {
      const interaction = new Interaction();
      expect(interaction.isContentInteraction).toBe(true);
    });

    test('should have access to ContentInteraction methods', () => {
      const interaction = new Interaction({
        tags: ['test', 'dialogue']
      });

      expect(interaction.hasTag('test')).toBe(true);
      expect(interaction.hasTag('nonexistent')).toBe(false);
    });

    test('should support ContentInteraction properties', () => {
      const interaction = new Interaction({
        category: 'social',
        author: 'system',
        tags: ['test']
      });

      expect(interaction.category).toBe('social');
      expect(interaction.author).toBe('system');
      expect(interaction.tags).toEqual(['test']);
    });
  });

  describe('Existing Save File Compatibility', () => {
    test('should deserialize existing JSON format correctly', () => {
      const existingJson = {
        id: 'old-id',
        nodeId: 'old-node',
        name: 'Old Interaction',
        description: 'From old save file',
        type: 'dialogue',
        requirements: [{ attr: 'strength', min: 14 }],
        branches: [{ text: 'Old branch' }],
        effects: [{ type: 'attribute', target: 'strength', value: 1 }],
        participants: ['old-char'],
        cooldown: 3,
        repeatable: false,
        lastUsed: 5
      };

      const interaction = Interaction.fromJSON(existingJson);

      expect(interaction.id).toBe('old-id');
      expect(interaction.nodeId).toBe('old-node');
      expect(interaction.name).toBe('Old Interaction');
      expect(interaction.description).toBe('From old save file');
      expect(interaction.type).toBe('dialogue');
      expect(interaction.requirements).toEqual([{ attr: 'strength', min: 14 }]);
      expect(interaction.branches).toEqual([{ text: 'Old branch' }]);
      expect(interaction.effects).toEqual([{ type: 'attribute', target: 'strength', value: 1 }]);
      expect(interaction.participants).toEqual(['old-char']);
      expect(interaction.cooldown).toBe(3);
      expect(interaction.repeatable).toBe(false);
      expect(interaction.lastUsed).toBe(5);
    });

    test('should handle missing properties in old save files', () => {
      const minimalJson = {
        id: 'minimal-id',
        name: 'Minimal Interaction'
      };

      const interaction = Interaction.fromJSON(minimalJson);

      expect(interaction.id).toBe('minimal-id');
      expect(interaction.name).toBe('Minimal Interaction');
      expect(interaction.nodeId).toBe(null);
      expect(interaction.description).toBe('');
      expect(interaction.type).toBe('dialogue');
      expect(interaction.requirements).toEqual([]);
      expect(interaction.branches).toEqual([]);
      expect(interaction.effects).toEqual([]);
      expect(interaction.participants).toEqual([]);
      expect(interaction.cooldown).toBe(0);
      expect(interaction.repeatable).toBe(false);
      expect(interaction.lastUsed).toBe(0);
    });
  });

  describe('Runtime Behavior Preservation', () => {
    test('should maintain exact meetsRequirements behavior', () => {
      const interaction = new Interaction({
        requirements: [{ attr: 'charisma', min: 12 }]
      });

      const character = {
        attributes: {
          charisma: { score: 12 }
        }
      };

      // Should return true for exact match
      expect(interaction.meetsRequirements(character)).toBe(true);

      // Should return false for below minimum
      character.attributes.charisma.score = 11;
      expect(interaction.meetsRequirements(character)).toBe(false);
    });

    test('should maintain exact isAvailable behavior', () => {
      const interaction = new Interaction({
        cooldown: 10,
        lastUsed: 100
      });

      // Should be available after cooldown
      expect(interaction.isAvailable(111)).toBe(true);

      // Should not be available during cooldown
      expect(interaction.isAvailable(105)).toBe(false);
    });

    test('should maintain exact applyEffects behavior', () => {
      const interaction = new Interaction({
        effects: [{ type: 'attribute', target: 'charisma', value: 2 }]
      });

      const character = {
        attributes: {
          charisma: { score: 12, modifier: 1 }
        }
      };

      interaction.applyEffects(character);

      // Should have exact same result as before
      expect(character.attributes.charisma.score).toBe(14);
      expect(character.attributes.charisma.modifier).toBe(2);
    });
  });
});
