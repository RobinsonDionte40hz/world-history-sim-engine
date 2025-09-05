/**
 * Unit Tests for MovementInteraction Class
 *
 * Tests the core functionality of the MovementInteraction class,
 * including energy cost calculation, environmental modifiers,
 * path validation, and target node checking.
 */

import MovementInteraction from '../../domain/entities/interactions/MovementInteraction.js';
import Environment from '../../domain/value-objects/Environment.js';

describe('MovementInteraction', () => {
  describe('Constructor', () => {
    test('should create instance with default values', () => {
      const interaction = new MovementInteraction({
        targetNodeId: 'node-123'
      });

      expect(interaction.isSystemInteraction).toBe(true);
      expect(interaction.name).toBe('Move');
      expect(interaction.description).toBe('Move to a different location');
      expect(interaction.baseEnergyCost).toBe(10);
      expect(interaction.targetNodeId).toBe('node-123');
      expect(interaction.movementType).toBe('walk');
    });

    test('should create instance with provided config', () => {
      const config = {
        name: 'Custom Move',
        description: 'Custom movement interaction',
        targetNodeId: 'node-456',
        movementType: 'run',
        environment: Environment.createDefault()
      };

      const interaction = new MovementInteraction(config);

      expect(interaction.name).toBe('Custom Move');
      expect(interaction.description).toBe('Custom movement interaction');
      expect(interaction.targetNodeId).toBe('node-456');
      expect(interaction.movementType).toBe('run');
      expect(interaction.environment).toBe(config.environment);
    });

    test('should be immutable after creation', () => {
      const interaction = new MovementInteraction({
        targetNodeId: 'node-123'
      });

      expect(() => {
        interaction.targetNodeId = 'node-456';
      }).toThrow();
    });
  });

  describe('Environmental Modifier', () => {
    test('should return default modifier when no environment provided', () => {
      const interaction = new MovementInteraction({
        targetNodeId: 'node-123'
      });

      const modifier = interaction.getEnvironmentalModifier();
      expect(modifier).toBe(1.0);
    });

    test('should apply movement modifier from environment', () => {
      const mockEnvironment = {
        getMovementModifier: jest.fn().mockReturnValue(1.5)
      };

      const interaction = new MovementInteraction({
        targetNodeId: 'node-123',
        environment: mockEnvironment
      });

      const modifier = interaction.getEnvironmentalModifier();
      expect(modifier).toBe(1.5);
      expect(mockEnvironment.getMovementModifier).toHaveBeenCalled();
    });

    test('should apply movement type modifiers', () => {
      const mockEnvironment = {
        getMovementModifier: jest.fn().mockReturnValue(1.0)
      };

      const walkInteraction = new MovementInteraction({
        targetNodeId: 'node-123',
        movementType: 'walk',
        environment: mockEnvironment
      });

      const runInteraction = new MovementInteraction({
        targetNodeId: 'node-123',
        movementType: 'run',
        environment: mockEnvironment
      });

      const sneakInteraction = new MovementInteraction({
        targetNodeId: 'node-123',
        movementType: 'sneak',
        environment: mockEnvironment
      });

      expect(walkInteraction.getEnvironmentalModifier()).toBe(1.0);
      expect(runInteraction.getEnvironmentalModifier()).toBe(1.5);
      expect(sneakInteraction.getEnvironmentalModifier()).toBe(1.2);
    });

    test('should clamp modifier within bounds', () => {
      const mockEnvironment = {
        getMovementModifier: jest.fn().mockReturnValue(5.0) // Very high modifier
      };

      const interaction = new MovementInteraction({
        targetNodeId: 'node-123',
        environment: mockEnvironment
      });

      const modifier = interaction.getEnvironmentalModifier();
      expect(modifier).toBe(3.0); // Should be clamped to max 3.0
    });
  });

  describe('Movement Distance', () => {
    test('should calculate distance between nodes', () => {
      const interaction = new MovementInteraction({
        targetNodeId: 'node-2'
      });

      const mockCharacter = { currentNodeId: 'node-1' };
      const mockWorld = {
        nodes: [
          { id: 'node-1', x: 0, y: 0 },
          { id: 'node-2', x: 1, y: 1 }
        ]
      };

      const distance = interaction.getMovementDistance(mockCharacter, mockWorld);
      expect(distance).toBe(2.0); // |1-0| + |1-0| = 2
    });

    test('should return default distance when nodes not found', () => {
      const interaction = new MovementInteraction({
        targetNodeId: 'node-999'
      });

      const mockCharacter = { currentNodeId: 'node-1' };
      const mockWorld = {
        nodes: [{ id: 'node-1', x: 0, y: 0 }]
      };

      const distance = interaction.getMovementDistance(mockCharacter, mockWorld);
      expect(distance).toBe(1.0);
    });
  });

  describe('Energy Cost', () => {
    test('should calculate energy cost with environmental modifier', () => {
      const mockEnvironment = {
        getMovementModifier: jest.fn().mockReturnValue(1.5)
      };

      const interaction = new MovementInteraction({
        targetNodeId: 'node-123',
        environment: mockEnvironment
      });

      const mockCharacter = { currentNodeId: 'node-1' };
      const mockWorld = {
        nodes: [
          { id: 'node-1', x: 0, y: 0 },
          { id: 'node-123', x: 1, y: 0 }
        ]
      };

      const cost = interaction.getEnergyCost(mockCharacter, mockEnvironment, mockWorld);
      expect(cost).toBe(15); // 10 * 1.5 * 1 = 15
    });

    test('should handle missing world parameter', () => {
      const interaction = new MovementInteraction({
        targetNodeId: 'node-123'
      });

      const mockCharacter = { energy: 100 };
      const cost = interaction.getEnergyCost(mockCharacter, {});
      expect(cost).toBe(10); // Base cost only
    });
  });

  describe('Execution Validation', () => {
    test('should validate target node exists', () => {
      const interaction = new MovementInteraction({
        targetNodeId: 'node-999'
      });

      const mockCharacter = { currentNodeId: 'node-1', energy: 100 };
      const mockWorld = {
        nodes: [{ id: 'node-1', x: 0, y: 0 }]
      };

      const canExecute = interaction.canExecute({ character: mockCharacter, world: mockWorld });
      expect(canExecute).toBe(false);
    });

    test('should prevent moving to same node', () => {
      const interaction = new MovementInteraction({
        targetNodeId: 'node-1'
      });

      const mockCharacter = { currentNodeId: 'node-1', energy: 100 };
      const mockWorld = {
        nodes: [{ id: 'node-1', x: 0, y: 0 }]
      };

      const canExecute = interaction.canExecute({ character: mockCharacter, world: mockWorld });
      expect(canExecute).toBe(false);
    });

    test('should validate path exists (adjacent nodes)', () => {
      const interaction = new MovementInteraction({
        targetNodeId: 'node-2'
      });

      const mockCharacter = { currentNodeId: 'node-1', energy: 100 };
      const mockWorld = {
        nodes: [
          { id: 'node-1', x: 0, y: 0 },
          { id: 'node-2', x: 1, y: 0 }
        ]
      };

      const canExecute = interaction.canExecute({ character: mockCharacter, world: mockWorld });
      expect(canExecute).toBe(true);
    });

    test('should reject non-adjacent movement (placeholder)', () => {
      const interaction = new MovementInteraction({
        targetNodeId: 'node-3'
      });

      const mockCharacter = { currentNodeId: 'node-1', energy: 100 };
      const mockWorld = {
        nodes: [
          { id: 'node-1', x: 0, y: 0 },
          { id: 'node-3', x: 2, y: 2 } // Not adjacent
        ]
      };

      const canExecute = interaction.canExecute({ character: mockCharacter, world: mockWorld });
      expect(canExecute).toBe(false);
    });

    test('should require sufficient energy', () => {
      const interaction = new MovementInteraction({
        targetNodeId: 'node-2'
      });

      const mockCharacter = { currentNodeId: 'node-1', energy: 5 }; // Less than required
      const mockWorld = {
        nodes: [
          { id: 'node-1', x: 0, y: 0 },
          { id: 'node-2', x: 1, y: 0 }
        ]
      };

      const canExecute = interaction.canExecute({ character: mockCharacter, world: mockWorld });
      expect(canExecute).toBe(false);
    });
  });

  describe('Execution', () => {
    test('should execute movement successfully', () => {
      const interaction = new MovementInteraction({
        targetNodeId: 'node-2'
      });

      const mockCharacter = {
        id: 'char-1',
        currentNodeId: 'node-1',
        energy: 100
      };
      const mockWorld = {
        nodes: [
          { id: 'node-1', x: 0, y: 0 },
          { id: 'node-2', x: 1, y: 0 }
        ]
      };

      const result = interaction.execute({ character: mockCharacter, world: mockWorld });

      expect(result.success).toBe(true);
      expect(result.energyConsumed).toBe(10);
      expect(mockCharacter.currentNodeId).toBe('node-2');
      expect(result.details.targetNodeId).toBe('node-2');
      expect(result.details.previousNodeId).toBe('node-1');
      expect(result.details.movementType).toBe('walk');
    });

    test('should fail execution when validation fails', () => {
      const interaction = new MovementInteraction({
        targetNodeId: 'node-999' // Non-existent node
      });

      const mockCharacter = { currentNodeId: 'node-1', energy: 100 };
      const mockWorld = {
        nodes: [{ id: 'node-1', x: 0, y: 0 }]
      };

      const result = interaction.execute({ character: mockCharacter, world: mockWorld });

      expect(result.success).toBe(false);
      expect(result.energyConsumed).toBe(0);
      expect(mockCharacter.currentNodeId).toBe('node-1'); // Should not change
    });
  });

  describe('Serialization', () => {
    test('should serialize to JSON', () => {
      const interaction = new MovementInteraction({
        targetNodeId: 'node-123',
        movementType: 'run'
      });

      const json = interaction.toJSON();

      expect(json.type).toBe('MovementInteraction');
      expect(json.targetNodeId).toBe('node-123');
      expect(json.movementType).toBe('run');
      expect(json.isSystemInteraction).toBe(true);
    });

    test('should deserialize from JSON', () => {
      const originalInteraction = new MovementInteraction({
        targetNodeId: 'node-123',
        movementType: 'run'
      });

      const json = originalInteraction.toJSON();
      const deserializedInteraction = MovementInteraction.fromJSON(json);

      expect(deserializedInteraction.targetNodeId).toBe('node-123');
      expect(deserializedInteraction.movementType).toBe('run');
      expect(deserializedInteraction.isSystemInteraction).toBe(true);
    });
  });
});
