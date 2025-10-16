/**
 * Unit Tests for PerceptionInteraction Class
 *
 * Tests the core functionality of the PerceptionInteraction class,
 * including perception types, environmental modifiers,
 * effectiveness calculations, and target validation.
 */

import PerceptionInteraction from '../../domain/entities/interactions/PerceptionInteraction.js';
import Environment from '../../domain/value-objects/Environment.js';

describe('PerceptionInteraction', () => {
  describe('Constructor', () => {
    test('should create instance with default values', () => {
      const interaction = new PerceptionInteraction({});

      expect(interaction.isSystemInteraction).toBe(true);
      expect(interaction.name).toBe('Perceive');
      expect(interaction.description).toBe('Use perception to gather information about surroundings');
      expect(interaction.baseEnergyCost).toBe(8);
      expect(interaction.perceptionType).toBe('look');
      expect(interaction.range).toBe(10);
    });

    test('should create instance with provided config', () => {
      const config = {
        name: 'Custom Perceive',
        description: 'Custom perception interaction',
        perceptionType: 'listen',
        targetId: 'target-123',
        range: 15,
        environment: Environment.createDefault()
      };

      const interaction = new PerceptionInteraction(config);

      expect(interaction.name).toBe('Custom Perceive');
      expect(interaction.description).toBe('Custom perception interaction');
      expect(interaction.perceptionType).toBe('listen');
      expect(interaction.targetId).toBe('target-123');
      expect(interaction.range).toBe(15);
      expect(interaction.environment).toBe(config.environment);
    });

    test('should be immutable after creation', () => {
      const interaction = new PerceptionInteraction({
        perceptionType: 'look'
      });

      expect(() => {
        interaction.perceptionType = 'listen';
      }).toThrow();
    });
  });

  describe('Environmental Modifier', () => {
    test('should return default modifier when no environment provided', () => {
      const interaction = new PerceptionInteraction({
        perceptionType: 'look'
      });

      const modifier = interaction.getEnvironmentalModifier();
      expect(modifier).toBe(1.0);
    });

    test('should apply visual perception modifiers', () => {
      const mockEnvironment = {
        getVisibilityModifier: jest.fn().mockReturnValue(0.8),
        lightLevel: 0.2 // Very dark
      };

      const interaction = new PerceptionInteraction({
        perceptionType: 'look',
        environment: mockEnvironment
      });

      const modifier = interaction.getEnvironmentalModifier();
      expect(modifier).toBe(0.4); // 0.8 * 0.5 = 0.4
      expect(mockEnvironment.getVisibilityModifier).toHaveBeenCalled();
    });

    test('should apply auditory perception modifiers', () => {
      const mockEnvironment = {
        ambientNoise: 0.8,
        windStrength: 0.8
      };

      const interaction = new PerceptionInteraction({
        perceptionType: 'listen',
        environment: mockEnvironment
      });

      const modifier = interaction.getEnvironmentalModifier();
      expect(modifier).toBe(0.48); // (1.0 - 0.8 * 0.5) * 0.8 = 0.6 * 0.8 = 0.48
    });

    test('should apply general sensing modifiers', () => {
      const mockEnvironment = {
        getVisibilityModifier: jest.fn().mockReturnValue(1.0)
      };

      const interaction = new PerceptionInteraction({
        perceptionType: 'sense',
        environment: mockEnvironment
      });

      const modifier = interaction.getEnvironmentalModifier();
      expect(modifier).toBe(0.9); // General sensing baseline
    });

    test('should clamp modifier within bounds', () => {
      const mockEnvironment = {
        getVisibilityModifier: jest.fn().mockReturnValue(5.0) // Very high modifier
      };

      const interaction = new PerceptionInteraction({
        perceptionType: 'look',
        environment: mockEnvironment
      });

      const modifier = interaction.getEnvironmentalModifier();
      expect(modifier).toBe(2.0); // Should be clamped to max 2.0
    });
  });

  describe('Perception Effectiveness', () => {
    test('should calculate visual perception effectiveness', () => {
      const mockEnvironment = {
        getVisibilityModifier: jest.fn().mockReturnValue(1.0)
      };

      const interaction = new PerceptionInteraction({
        perceptionType: 'look',
        environment: mockEnvironment
      });

      const mockCharacter = {
        attributes: {
          intelligence: 15,
          wisdom: 12,
          perception: 10,
          getTotalModifier: jest.fn((attr) => {
            const values = { intelligence: 15, wisdom: 12, perception: 10 };
            return values[attr] || 10;
          })
        }
      };

      const effectiveness = interaction.getPerceptionEffectiveness(mockCharacter, mockEnvironment);
      expect(effectiveness).toBe((15 + 12) / 40); // 0.675
    });

    test('should calculate auditory perception effectiveness', () => {
      const interaction = new PerceptionInteraction({
        perceptionType: 'listen'
      });

      const mockCharacter = {
        attributes: {
          intelligence: 10,
          wisdom: 16,
          perception: 14,
          getTotalModifier: jest.fn((attr) => {
            const values = { intelligence: 10, wisdom: 16, perception: 14 };
            return values[attr] || 10;
          })
        }
      };

      const effectiveness = interaction.getPerceptionEffectiveness(mockCharacter);
      expect(effectiveness).toBe((16 + 14) / 40); // 0.75
    });

    test('should calculate general sensing effectiveness', () => {
      const interaction = new PerceptionInteraction({
        perceptionType: 'sense'
      });

      const mockCharacter = {
        attributes: {
          intelligence: 10,
          wisdom: 10,
          perception: 18,
          getTotalModifier: jest.fn((attr) => {
            const values = { intelligence: 10, wisdom: 10, perception: 18 };
            return values[attr] || 10;
          })
        }
      };

      const effectiveness = interaction.getPerceptionEffectiveness(mockCharacter);
      expect(effectiveness).toBe(18 / 20); // 0.9
    });

    test('should handle missing attributes', () => {
      const interaction = new PerceptionInteraction({
        perceptionType: 'look'
      });

      const mockCharacter = { attributes: {} };

      const effectiveness = interaction.getPerceptionEffectiveness(mockCharacter);
      expect(effectiveness).toBe((10 + 10) / 40); // Default attributes
    });
  });

  describe('Execution Validation', () => {
    test('should validate perception type', () => {
      const interaction = new PerceptionInteraction({
        perceptionType: 'invalid'
      });

      const mockCharacter = { currentNodeId: 'node-1', energy: 100 };
      const mockWorld = { nodes: [{ id: 'node-1' }] };

      const canExecute = interaction.canExecute(mockCharacter, mockWorld);
      expect(canExecute).toBe(false);
    });

    test('should validate target exists', () => {
      const interaction = new PerceptionInteraction({
        perceptionType: 'look',
        targetId: 'nonexistent'
      });

      const mockCharacter = { currentNodeId: 'node-1', energy: 100 };
      const mockWorld = {
        nodes: [{ id: 'node-1', features: [] }],
        characters: []
      };

      const canExecute = interaction.canExecute(mockCharacter, mockWorld);
      expect(canExecute).toBe(false);
    });

    test('should allow perception without target', () => {
      const interaction = new PerceptionInteraction({
        perceptionType: 'look'
      });

      const mockCharacter = { currentNodeId: 'node-1', energy: 100 };
      const mockWorld = { nodes: [{ id: 'node-1' }] };

      const canExecute = interaction.canExecute(mockCharacter, mockWorld);
      expect(canExecute).toBe(true);
    });

    test('should require sufficient energy', () => {
      const interaction = new PerceptionInteraction({
        perceptionType: 'look'
      });

      const mockCharacter = { currentNodeId: 'node-1', energy: 5 }; // Less than required
      const mockWorld = { nodes: [{ id: 'node-1' }] };

      const canExecute = interaction.canExecute(mockCharacter, mockWorld);
      expect(canExecute).toBe(false);
    });
  });

  describe('Execution', () => {
    test('should execute visual perception successfully', () => {
      const interaction = new PerceptionInteraction({
        perceptionType: 'look'
      });

      const mockCharacter = {
        id: 'char-1',
        currentNodeId: 'node-1',
        energy: 100,
        attributes: { intelligence: 15, wisdom: 15, perception: 10 }
      };
      const mockWorld = {
        nodes: [{ id: 'node-1', resources: [] }],
        characters: []
      };

      const result = interaction.execute(mockCharacter, mockWorld);

      expect(result.success).toBe(true);
      expect(result.energyConsumed).toBe(8);
      expect(result.details.perceptionType).toBe('look');
      expect(result.details.effectiveness).toBeGreaterThan(0);
      expect(result.details.perceptionResult.success).toBe(true);
      expect(result.details.perceptionResult.information.type).toBe('visual');
    });

    test('should execute auditory perception successfully', () => {
      const interaction = new PerceptionInteraction({
        perceptionType: 'listen'
      });

      const mockCharacter = {
        id: 'char-1',
        currentNodeId: 'node-1',
        energy: 100,
        attributes: { intelligence: 10, wisdom: 15, perception: 15 }
      };
      const mockWorld = {
        nodes: [{ id: 'node-1' }],
        characters: []
      };

      const result = interaction.execute(mockCharacter, mockWorld);

      expect(result.success).toBe(true);
      expect(result.details.perceptionType).toBe('listen');
      expect(result.details.perceptionResult.information.type).toBe('auditory');
    });

    test('should execute general sensing successfully', () => {
      const interaction = new PerceptionInteraction({
        perceptionType: 'sense'
      });

      const mockCharacter = {
        id: 'char-1',
        currentNodeId: 'node-1',
        energy: 100,
        attributes: { intelligence: 10, wisdom: 10, perception: 18 }
      };
      const mockWorld = {
        nodes: [{ id: 'node-1' }],
        characters: []
      };

      const result = interaction.execute(mockCharacter, mockWorld);

      expect(result.success).toBe(true);
      expect(result.details.perceptionType).toBe('sense');
      expect(result.details.perceptionResult.information.type).toBe('general');
    });

    test('should fail execution when validation fails', () => {
      const interaction = new PerceptionInteraction({
        perceptionType: 'invalid'
      });

      const mockCharacter = { currentNodeId: 'node-1', energy: 100 };
      const mockWorld = { nodes: [{ id: 'node-1' }] };

      const result = interaction.execute(mockCharacter, mockWorld);

      expect(result.success).toBe(false);
      expect(result.energyConsumed).toBe(0);
    });
  });

  describe('Serialization', () => {
    test('should serialize to JSON', () => {
      const interaction = new PerceptionInteraction({
        perceptionType: 'listen',
        targetId: 'target-123',
        range: 15
      });

      const json = interaction.toJSON();

      expect(json.type).toBe('PerceptionInteraction');
      expect(json.perceptionType).toBe('listen');
      expect(json.targetId).toBe('target-123');
      expect(json.range).toBe(15);
      // isSystemInteraction removed - it's an internal flag
    });

    test('should deserialize from JSON', () => {
      const originalInteraction = new PerceptionInteraction({
        perceptionType: 'sense',
        targetId: 'target-456',
        range: 20
      });

      const json = originalInteraction.toJSON();
      const deserializedInteraction = PerceptionInteraction.fromJSON(json);

      expect(deserializedInteraction.perceptionType).toBe('sense');
      expect(deserializedInteraction.targetId).toBe('target-456');
      expect(deserializedInteraction.range).toBe(20);
      expect(deserializedInteraction.isSystemInteraction).toBe(true);
    });
  });
});
