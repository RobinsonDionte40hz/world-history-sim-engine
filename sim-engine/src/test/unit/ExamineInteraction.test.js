/**
 * Unit Tests for ExamineInteraction Class
 *
 * Tests the core functionality of the ExamineInteraction class,
 * including attribute integration, target validation, range checking,
 * and examination effectiveness for different target types.
 */

import ExamineInteraction from '../../domain/entities/interactions/ExamineInteraction.js';
import SystemInteraction from '../../domain/entities/interactions/SystemInteraction.js';
import Environment from '../../domain/value-objects/Environment.js';

describe('ExamineInteraction', () => {
  describe('Constructor', () => {
    test('should create instance with default values', () => {
      const interaction = new ExamineInteraction({
        targetType: 'item',
        targetId: 'item-123'
      });

      expect(interaction.isSystemInteraction).toBe(true);
      expect(interaction.name).toBe('Examine');
      expect(interaction.description).toBe('Examine an object, character, or feature to gather information');
      expect(interaction.baseEnergyCost).toBe(5);
      expect(interaction.targetType).toBe('item');
      expect(interaction.targetId).toBe('item-123');
      expect(interaction.range).toBe(5);
    });

    test('should create instance with provided config', () => {
      const config = {
        name: 'Custom Examine',
        description: 'Custom examination interaction',
        targetType: 'character',
        targetId: 'char-456',
        range: 10,
        environment: Environment.createDefault()
      };

      const interaction = new ExamineInteraction(config);

      expect(interaction.name).toBe('Custom Examine');
      expect(interaction.description).toBe('Custom examination interaction');
      expect(interaction.targetType).toBe('character');
      expect(interaction.targetId).toBe('char-456');
      expect(interaction.range).toBe(10);
      expect(interaction.environment).toBe(config.environment);
    });

    test('should be immutable after creation', () => {
      const interaction = new ExamineInteraction({
        targetType: 'feature',
        targetId: 'feat-789'
      });

      expect(() => {
        interaction.name = 'Modified Name';
      }).toThrow();

      expect(() => {
        interaction.targetType = 'modified';
      }).toThrow();

      expect(() => {
        interaction.range = 20;
      }).toThrow();
    });
  });

  describe('Environmental Integration', () => {
    let interaction;
    let mockEnvironment;

    beforeEach(() => {
      mockEnvironment = {
        getVisibilityModifier: jest.fn(() => 1.0),
        humidity: 0.5,
        windStrength: 0.3
      };

      interaction = new ExamineInteraction({
        targetType: 'item',
        targetId: 'item-123',
        environment: mockEnvironment
      });
    });

    test('should return normal modifier for standard conditions', () => {
      mockEnvironment.getVisibilityModifier.mockReturnValue(1.0);
      mockEnvironment.humidity = 0.5;
      mockEnvironment.windStrength = 0.3;

      const modifier = interaction.getEnvironmentalModifier(mockEnvironment);
      expect(modifier).toBe(1.0);
    });

    test('should apply lighting modifiers', () => {
      mockEnvironment.getVisibilityModifier.mockReturnValue(1.3); // Bright lighting

      const modifier = interaction.getEnvironmentalModifier(mockEnvironment);
      expect(modifier).toBe(1.3);
    });

    test('should apply humidity modifiers', () => {
      mockEnvironment.humidity = 0.9; // High humidity

      const modifier = interaction.getEnvironmentalModifier(mockEnvironment);
      expect(modifier).toBe(0.9);
    });

    test('should apply wind modifiers', () => {
      mockEnvironment.windStrength = 0.8; // Strong wind

      const modifier = interaction.getEnvironmentalModifier(mockEnvironment);
      expect(modifier).toBe(0.95);
    });

    test('should combine multiple environmental factors', () => {
      mockEnvironment.getVisibilityModifier.mockReturnValue(1.2);
      mockEnvironment.humidity = 0.9;
      mockEnvironment.windStrength = 0.8;

      const modifier = interaction.getEnvironmentalModifier(mockEnvironment);
      expect(modifier).toBe(1.026); // 1.2 * 0.9 * 0.95
    });

    test('should handle missing environment', () => {
      const noEnvInteraction = new ExamineInteraction({
        targetType: 'item',
        targetId: 'item-123'
      });

      const modifier = noEnvInteraction.getEnvironmentalModifier();
      expect(modifier).toBe(1.0);
    });

    test('should clamp modifier within bounds', () => {
      mockEnvironment.getVisibilityModifier.mockReturnValue(3.0); // Extreme lighting

      const modifier = interaction.getEnvironmentalModifier(mockEnvironment);
      expect(modifier).toBe(2.0); // Clamped to max 2.0
    });
  });

  describe('Attribute Integration', () => {
    let interaction;
    let mockCharacter;

    beforeEach(() => {
      interaction = new ExamineInteraction({
        targetType: 'item',
        targetId: 'item-123'
      });

      mockCharacter = {
        attributes: {
          intelligence: 15,
          wisdom: 12
        }
      };
    });

    test('should calculate effectiveness from Intelligence and Wisdom', () => {
      const effectiveness = interaction.getExaminationEffectiveness(mockCharacter);
      expect(effectiveness).toBe(0.675); // (15 + 12) / 40 * 1.0 = 27/40 = 0.675
    });

    test('should handle missing attributes gracefully', () => {
      const characterNoAttributes = {};
      const effectiveness = interaction.getExaminationEffectiveness(characterNoAttributes);
      expect(effectiveness).toBe(0.5); // (10 + 10) / 40 = 0.5
    });

    test('should apply environmental modifiers to effectiveness', () => {
      const comfortableEnv = Environment.createSafe();
      const envInteraction = new ExamineInteraction({
        targetType: 'item',
        targetId: 'item-123',
        environment: comfortableEnv
      });

      const effectiveness = envInteraction.getExaminationEffectiveness(mockCharacter);
      expect(effectiveness).toBeGreaterThan(0.675); // Should be boosted by environment
    });

    test('should apply target type modifiers', () => {
      const characterInteraction = new ExamineInteraction({
        targetType: 'character',
        targetId: 'char-123'
      });

      const itemInteraction = new ExamineInteraction({
        targetType: 'item',
        targetId: 'item-123'
      });

      const featureInteraction = new ExamineInteraction({
        targetType: 'feature',
        targetId: 'feat-123'
      });

      const charEffectiveness = characterInteraction.getExaminationEffectiveness(mockCharacter);
      const itemEffectiveness = itemInteraction.getExaminationEffectiveness(mockCharacter);
      const featureEffectiveness = featureInteraction.getExaminationEffectiveness(mockCharacter);

      expect(charEffectiveness).toBeLessThan(itemEffectiveness); // Characters harder
      expect(featureEffectiveness).toBeGreaterThan(itemEffectiveness); // Features easier
    });

    test('should clamp effectiveness within bounds', () => {
      mockCharacter.attributes.intelligence = 20;
      mockCharacter.attributes.wisdom = 20;

      const comfortableEnv = Environment.createSafe();
      const envInteraction = new ExamineInteraction({
        targetType: 'feature',
        targetId: 'feat-123',
        environment: comfortableEnv
      });

      const effectiveness = envInteraction.getExaminationEffectiveness(mockCharacter);
      expect(effectiveness).toBe(1.0); // Should be clamped to max 1.0
    });
  });

  describe('Target Validation', () => {
    let interaction;
    let mockCharacter;
    let mockWorld;

    beforeEach(() => {
      interaction = new ExamineInteraction({
        targetType: 'character',
        targetId: 'char-456'
      });

      mockCharacter = {
        id: 'char-123',
        attributes: { intelligence: 10, wisdom: 10 },
        currentNodeId: 'node-1'
      };

      mockWorld = {
        characters: [
          { id: 'char-123', name: 'Self' },
          { id: 'char-456', name: 'Target' }
        ],
        nodes: [{ id: 'node-1' }]
      };
    });

    test('should validate character targets', () => {
      const isValid = interaction._isTargetValid({ character: mockCharacter, world: mockWorld });
      expect(isValid).toBe(true);
    });

    test('should reject examining self', () => {
      const selfInteraction = new ExamineInteraction({
        targetType: 'character',
        targetId: 'char-123'
      });

      const isValid = selfInteraction._isTargetValid({ character: mockCharacter, world: mockWorld });
      expect(isValid).toBe(false);
    });

    test('should reject non-existent character targets', () => {
      const invalidInteraction = new ExamineInteraction({
        targetType: 'character',
        targetId: 'char-999'
      });

      const isValid = invalidInteraction._isTargetValid({ character: mockCharacter, world: mockWorld });
      expect(isValid).toBe(false);
    });

    test('should validate item targets in inventory', () => {
      mockCharacter.inventory = [{ id: 'item-123', name: 'Test Item' }];

      const itemInteraction = new ExamineInteraction({
        targetType: 'item',
        targetId: 'item-123'
      });

      const isValid = itemInteraction._isTargetValid({ character: mockCharacter, world: mockWorld });
      expect(isValid).toBe(true);
    });

    test('should validate item targets in node', () => {
      mockWorld.nodes[0].resources = [{ id: 'item-123', name: 'Test Item' }];

      const itemInteraction = new ExamineInteraction({
        targetType: 'item',
        targetId: 'item-123'
      });

      const isValid = itemInteraction._isTargetValid({ character: mockCharacter, world: mockWorld });
      expect(isValid).toBe(true);
    });

    test('should reject non-existent item targets', () => {
      const itemInteraction = new ExamineInteraction({
        targetType: 'item',
        targetId: 'item-999'
      });

      const isValid = itemInteraction._isTargetValid({ character: mockCharacter, world: mockWorld });
      expect(isValid).toBe(false);
    });

    test('should validate feature targets', () => {
      const featureInteraction = new ExamineInteraction({
        targetType: 'feature',
        targetId: 'feat-123'
      });

      const isValid = featureInteraction._isTargetValid({ character: mockCharacter, world: mockWorld });
      expect(isValid).toBe(true);
    });
  });

  describe('Execution Availability', () => {
    let interaction;
    let mockCharacter;
    let mockWorld;

    beforeEach(() => {
      interaction = new ExamineInteraction({
        targetType: 'character',
        targetId: 'char-456'
      });

      mockCharacter = {
        id: 'char-123',
        attributes: { intelligence: 10, wisdom: 10 },
        energy: 50
      };

      mockWorld = {
        characters: [
          { id: 'char-123', name: 'Self' },
          { id: 'char-456', name: 'Target' }
        ],
        nodes: [{ id: 'node-1' }]
      };
    });

    test('should be available when character has sufficient energy', () => {
      const available = interaction.canExecute(mockCharacter, mockWorld);
      expect(available).toBe(true);
    });

    test('should not be available when character lacks energy', () => {
      mockCharacter.energy = 3; // Below required 5

      const available = interaction.canExecute(mockCharacter, mockWorld);
      expect(available).toBe(false);
    });

    test('should not be available without valid target', () => {
      const invalidInteraction = new ExamineInteraction({
        targetType: 'character',
        targetId: 'char-999' // Non-existent
      });

      const available = invalidInteraction.canExecute(mockCharacter, mockWorld);
      expect(available).toBe(false);
    });

    test('should not be available for self-examination', () => {
      const selfInteraction = new ExamineInteraction({
        targetType: 'character',
        targetId: 'char-123'
      });

      const available = selfInteraction.canExecute(mockCharacter, mockWorld);
      expect(available).toBe(false);
    });
  });

  describe('Execution Logic', () => {
    let interaction;
    let mockCharacter;
    let mockWorld;

    beforeEach(() => {
      interaction = new ExamineInteraction({
        targetType: 'character',
        targetId: 'char-456'
      });

      mockCharacter = {
        id: 'char-123',
        attributes: { intelligence: 15, wisdom: 12 },
        energy: 50
      };

      mockWorld = {
        characters: [
          {
            id: 'char-123',
            name: 'Self',
            age: 25,
            racialTraits: { race: 'human' },
            health: 80,
            mood: 60,
            inventory: [{ id: 'weapon-1', name: 'Sword' }]
          },
          {
            id: 'char-456',
            name: 'Target Character',
            age: 30,
            racialTraits: { race: 'elf' },
            health: 90,
            mood: 70,
            inventory: [
              { id: 'weapon-2', name: 'Bow' },
              { id: 'armor-1', name: 'Leather Armor' }
            ]
          }
        ],
        nodes: [{ id: 'node-1' }]
      };
    });

    test('should execute successfully and consume energy', () => {
      const result = interaction.execute(mockCharacter, mockWorld);

      expect(result.success).toBe(true);
      expect(result.energyConsumed).toBe(5);
      expect(result.details.targetType).toBe('character');
      expect(result.details.targetId).toBe('char-456');
      expect(result.details.effectiveness).toBeDefined();
      expect(result.details.examinationResult).toBeDefined();
    });

    test('should examine character with basic information', () => {
      const result = interaction.execute(mockCharacter, mockWorld);

      expect(result.details.examinationResult.success).toBe(true);
      expect(result.details.examinationResult.information.name).toBe('Target Character');
      expect(result.details.examinationResult.information.appearance).toBeDefined();
    });

    test('should provide detailed information based on effectiveness', () => {
      // High effectiveness character
      mockCharacter.attributes.intelligence = 18;
      mockCharacter.attributes.wisdom = 16;

      const result = interaction.execute(mockCharacter, mockWorld);

      expect(result.details.examinationResult.information.health).toBeDefined();
      expect(result.details.examinationResult.information.equipment).toBeDefined();
      expect(result.details.examinationResult.quality).toBe('good'); // 0.68 effectiveness = good quality
    });

    test('should examine items correctly', () => {
      mockCharacter.inventory = [{ id: 'item-123', name: 'Magic Sword', type: 'weapon' }];

      const itemInteraction = new ExamineInteraction({
        targetType: 'item',
        targetId: 'item-123'
      });

      const result = itemInteraction.execute(mockCharacter, mockWorld);

      expect(result.details.examinationResult.success).toBe(true);
      expect(result.details.examinationResult.information.name).toBe('Magic Sword');
      expect(result.details.examinationResult.information.type).toBe('weapon');
    });

    test('should examine features correctly', () => {
      const featureInteraction = new ExamineInteraction({
        targetType: 'feature',
        targetId: 'feat-123'
      });

      const result = featureInteraction.execute(mockCharacter, mockWorld);

      expect(result.details.examinationResult.success).toBe(true);
      expect(result.details.examinationResult.information.name).toBe('Feature feat-123');
      expect(result.details.examinationResult.information.type).toBe('environmental');
    });

    test('should fail execution for invalid targets', () => {
      const invalidInteraction = new ExamineInteraction({
        targetType: 'character',
        targetId: 'char-999'
      });

      // First check that canExecute returns false
      const canExecute = invalidInteraction.canExecute(mockCharacter, mockWorld);
      expect(canExecute).toBe(false);

      // Then check that execute also fails
      const result = invalidInteraction.execute(mockCharacter, mockWorld);
      expect(result.success).toBe(false);
    });
  });

  describe('Serialization', () => {
    test('should serialize to JSON correctly', () => {
      const interaction = new ExamineInteraction({
        id: 'examine-123',
        name: 'Test Examine',
        description: 'A test examination interaction',
        targetType: 'character',
        targetId: 'char-456',
        range: 10,
        environment: Environment.createDefault()
      });

      const json = interaction.toJSON();

      expect(json).toEqual({
        id: 'examine-123',
        name: 'Test Examine',
        description: 'A test examination interaction',
        type: 'ExamineInteraction',
        targetType: 'character',
        targetId: 'char-456',
        range: 10,
        environment: Environment.createDefault().toJSON()
      });
    });

    test('should deserialize from JSON correctly', () => {
      const data = {
        id: 'examine-123',
        name: 'Test Examine',
        description: 'A test examination interaction',
        targetType: 'item',
        targetId: 'item-456',
        range: 8,
        environment: Environment.createDefault().toJSON()
      };

      const interaction = ExamineInteraction.fromJSON(data);

      expect(interaction.id).toBe('examine-123');
      expect(interaction.name).toBe('Test Examine');
      expect(interaction.description).toBe('A test examination interaction');
      expect(interaction.targetType).toBe('item');
      expect(interaction.targetId).toBe('item-456');
      expect(interaction.range).toBe(8);
    });
  });

  describe('Inheritance', () => {
    test('should inherit from SystemInteraction', () => {
      const interaction = new ExamineInteraction({
        targetType: 'item',
        targetId: 'item-123'
      });

      expect(interaction).toBeInstanceOf(ExamineInteraction);
      expect(interaction).toBeInstanceOf(SystemInteraction);
      expect(interaction).toBeInstanceOf(Object);
    });

    test('should allow further subclassing', () => {
      class SpecializedExamineInteraction extends ExamineInteraction {
        getExaminationEffectiveness(character) {
          return 0.9; // Always high effectiveness
        }
      }

      const interaction = new SpecializedExamineInteraction({
        targetType: 'character',
        targetId: 'char-123'
      });

      const mockCharacter = { attributes: { intelligence: 10, wisdom: 10 } };
      const effectiveness = interaction.getExaminationEffectiveness(mockCharacter);

      expect(effectiveness).toBe(0.9);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very low attribute characters', () => {
      const interaction = new ExamineInteraction({
        targetType: 'item',
        targetId: 'item-123'
      });

      const lowAttributeCharacter = {
        attributes: { intelligence: 3, wisdom: 3 }
      };

      const effectiveness = interaction.getExaminationEffectiveness(lowAttributeCharacter);
      expect(effectiveness).toBeGreaterThan(0); // Should still have some effectiveness
      expect(effectiveness).toBeLessThan(0.2); // But very low
    });

    test('should handle maximum attribute characters', () => {
      const interaction = new ExamineInteraction({
        targetType: 'feature',
        targetId: 'feat-123',
        environment: Environment.createSafe()
      });

      const maxAttributeCharacter = {
        attributes: { intelligence: 20, wisdom: 20 }
      };

      const effectiveness = interaction.getExaminationEffectiveness(maxAttributeCharacter);
      expect(effectiveness).toBe(1.0); // Should be clamped to maximum
    });

    test('should handle extreme environmental conditions', () => {
      const hostileEnv = Environment.createHostile();
      const interaction = new ExamineInteraction({
        targetType: 'character',
        targetId: 'char-123',
        environment: hostileEnv
      });

      const mockCharacter = { attributes: { intelligence: 10, wisdom: 10 } };
      const effectiveness = interaction.getExaminationEffectiveness(mockCharacter);

      expect(effectiveness).toBeLessThan(0.5); // Should be reduced by hostile environment
    });

    test('should handle missing world state gracefully', () => {
      const interaction = new ExamineInteraction({
        targetType: 'character',
        targetId: 'char-123'
      });

      const mockCharacter = { attributes: { intelligence: 10, wisdom: 10 } };
      const mockWorld = {}; // Empty world

      const available = interaction.canExecute(mockCharacter, mockWorld);
      expect(available).toBe(false);
    });
  });
});
