/**
 * Unit Tests for InteractionFactory Class
 *
 * Tests the core functionality of the InteractionFactory class,
 * including type-based creation, convenience methods, validation,
 * and error handling for all interaction types.
 */

import InteractionFactory from '../../domain/entities/interactions/InteractionFactory.js';
import SystemInteraction from '../../domain/entities/interactions/SystemInteraction.js';
import ContentInteraction from '../../domain/entities/interactions/ContentInteraction.js';
import WaitInteraction from '../../domain/entities/interactions/WaitInteraction.js';
import RestInteraction from '../../domain/entities/interactions/RestInteraction.js';
import ExamineInteraction from '../../domain/entities/interactions/ExamineInteraction.js';
import MovementInteraction from '../../domain/entities/interactions/MovementInteraction.js';
import PerceptionInteraction from '../../domain/entities/interactions/PerceptionInteraction.js';

describe('InteractionFactory', () => {
  describe('create()', () => {
    test('should create WaitInteraction', () => {
      const interaction = InteractionFactory.create('wait');
      expect(interaction).toBeInstanceOf(WaitInteraction);
      expect(interaction.name).toBe('Wait');
    });

    test('should create RestInteraction', () => {
      const interaction = InteractionFactory.create('rest');
      expect(interaction).toBeInstanceOf(RestInteraction);
      expect(interaction.name).toBe('Rest');
    });

    test('should create ExamineInteraction', () => {
      const interaction = InteractionFactory.create('examine');
      expect(interaction).toBeInstanceOf(ExamineInteraction);
      expect(interaction.name).toBe('Examine');
    });

    test('should create MovementInteraction', () => {
      const interaction = InteractionFactory.create('movement');
      expect(interaction).toBeInstanceOf(MovementInteraction);
      expect(interaction.name).toBe('Move');
    });

    test('should create PerceptionInteraction', () => {
      const interaction = InteractionFactory.create('perception');
      expect(interaction).toBeInstanceOf(PerceptionInteraction);
      expect(interaction.name).toBe('Perceive');
    });

    test('should create ContentInteraction', () => {
      const interaction = InteractionFactory.create('content');
      expect(interaction).toBeInstanceOf(ContentInteraction);
    });

    test('should create SystemInteraction', () => {
      const interaction = InteractionFactory.create('system');
      expect(interaction).toBeInstanceOf(SystemInteraction);
    });

    test('should create InteractionBase', () => {
      expect(() => InteractionFactory.create('base')).toThrow('InteractionBase is an abstract class and cannot be instantiated directly');
    });

    test('should handle case-insensitive type names', () => {
      const interaction = InteractionFactory.create('WAIT');
      expect(interaction).toBeInstanceOf(WaitInteraction);
    });

    test('should handle trimmed type names', () => {
      const interaction = InteractionFactory.create('  wait  ');
      expect(interaction).toBeInstanceOf(WaitInteraction);
    });

    test('should pass config to created interaction', () => {
      const config = { name: 'Custom Wait', baseEnergyCost: 5 };
      const interaction = InteractionFactory.create('wait', config);
      expect(interaction.name).toBe('Custom Wait');
      expect(interaction.baseEnergyCost).toBe(5);
    });

    test('should throw error for invalid type', () => {
      expect(() => InteractionFactory.create('invalid')).toThrow('Unknown interaction type: invalid');
    });

    test('should throw error for empty type', () => {
      expect(() => InteractionFactory.create('')).toThrow('Interaction type must be a non-empty string');
    });

    test('should throw error for non-string type', () => {
      expect(() => InteractionFactory.create(123)).toThrow('Interaction type must be a non-empty string');
      expect(() => InteractionFactory.create(null)).toThrow('Interaction type must be a non-empty string');
      expect(() => InteractionFactory.create(undefined)).toThrow('Interaction type must be a non-empty string');
    });
  });

  describe('Convenience Methods', () => {
    test('createWait() should create WaitInteraction', () => {
      const interaction = InteractionFactory.createWait({ name: 'Test Wait' });
      expect(interaction).toBeInstanceOf(WaitInteraction);
      expect(interaction.name).toBe('Test Wait');
    });

    test('createRest() should create RestInteraction', () => {
      const interaction = InteractionFactory.createRest({ name: 'Test Rest' });
      expect(interaction).toBeInstanceOf(RestInteraction);
      expect(interaction.name).toBe('Test Rest');
    });

    test('createExamine() should create ExamineInteraction with parameters', () => {
      const interaction = InteractionFactory.createExamine('character', 'char-123', { range: 15 });
      expect(interaction).toBeInstanceOf(ExamineInteraction);
      expect(interaction.targetType).toBe('character');
      expect(interaction.targetId).toBe('char-123');
      expect(interaction.range).toBe(15);
    });

    test('createMovement() should create MovementInteraction with parameters', () => {
      const interaction = InteractionFactory.createMovement('node-456', 'run', { baseEnergyCost: 20 });
      expect(interaction).toBeInstanceOf(MovementInteraction);
      expect(interaction.targetNodeId).toBe('node-456');
      expect(interaction.movementType).toBe('run');
      expect(interaction.baseEnergyCost).toBe(20);
    });

    test('createPerception() should create PerceptionInteraction with parameters', () => {
      const interaction = InteractionFactory.createPerception('listen', 'target-789', { range: 20 });
      expect(interaction).toBeInstanceOf(PerceptionInteraction);
      expect(interaction.perceptionType).toBe('listen');
      expect(interaction.targetId).toBe('target-789');
      expect(interaction.range).toBe(20);
    });

    test('createPerception() should handle optional targetId', () => {
      const interaction = InteractionFactory.createPerception('look');
      expect(interaction).toBeInstanceOf(PerceptionInteraction);
      expect(interaction.perceptionType).toBe('look');
      expect(interaction.targetId).toBeUndefined();
    });

    test('createContent() should create ContentInteraction', () => {
      const interaction = InteractionFactory.createContent({ name: 'Test Content' });
      expect(interaction).toBeInstanceOf(ContentInteraction);
      expect(interaction.name).toBe('Test Content');
    });
  });

  describe('Type Validation', () => {
    test('isValidType() should return true for valid types', () => {
      expect(InteractionFactory.isValidType('wait')).toBe(true);
      expect(InteractionFactory.isValidType('rest')).toBe(true);
      expect(InteractionFactory.isValidType('examine')).toBe(true);
      expect(InteractionFactory.isValidType('movement')).toBe(true);
      expect(InteractionFactory.isValidType('perception')).toBe(true);
      expect(InteractionFactory.isValidType('content')).toBe(true);
      expect(InteractionFactory.isValidType('system')).toBe(true);
      expect(InteractionFactory.isValidType('base')).toBe(true);
    });

    test('isValidType() should return false for invalid types', () => {
      expect(InteractionFactory.isValidType('invalid')).toBe(false);
      expect(InteractionFactory.isValidType('')).toBe(false);
      expect(InteractionFactory.isValidType(null)).toBe(false);
      expect(InteractionFactory.isValidType(undefined)).toBe(false);
      expect(InteractionFactory.isValidType(123)).toBe(false);
    });

    test('isValidType() should handle case-insensitive types', () => {
      expect(InteractionFactory.isValidType('WAIT')).toBe(true);
      expect(InteractionFactory.isValidType('  wait  ')).toBe(true);
    });

    test('getSupportedTypes() should return all supported types', () => {
      const types = InteractionFactory.getSupportedTypes();
      expect(types).toContain('wait');
      expect(types).toContain('rest');
      expect(types).toContain('examine');
      expect(types).toContain('movement');
      expect(types).toContain('perception');
      expect(types).toContain('content');
      expect(types).toContain('system');
      expect(types).toContain('base');
    });

    test('getSystemTypes() should return system interaction types', () => {
      const types = InteractionFactory.getSystemTypes();
      expect(types).toEqual(['wait', 'rest', 'examine', 'movement', 'perception']);
    });

    test('getContentTypes() should return content interaction types', () => {
      const types = InteractionFactory.getContentTypes();
      expect(types).toEqual(['content']);
    });

    test('isSystemType() should identify system types correctly', () => {
      expect(InteractionFactory.isSystemType('wait')).toBe(true);
      expect(InteractionFactory.isSystemType('rest')).toBe(true);
      expect(InteractionFactory.isSystemType('examine')).toBe(true);
      expect(InteractionFactory.isSystemType('movement')).toBe(true);
      expect(InteractionFactory.isSystemType('perception')).toBe(true);
      expect(InteractionFactory.isSystemType('content')).toBe(false);
      expect(InteractionFactory.isSystemType('invalid')).toBe(false);
    });

    test('isContentType() should identify content types correctly', () => {
      expect(InteractionFactory.isContentType('content')).toBe(true);
      expect(InteractionFactory.isContentType('wait')).toBe(false);
      expect(InteractionFactory.isContentType('invalid')).toBe(false);
    });
  });

  describe('JSON Serialization', () => {
    test('fromJSON() should deserialize WaitInteraction', () => {
      const json = {
        type: 'WaitInteraction',
        name: 'Test Wait',
        baseEnergyCost: 5
      };
      const interaction = InteractionFactory.fromJSON(json);
      expect(interaction).toBeInstanceOf(WaitInteraction);
      expect(interaction.name).toBe('Test Wait');
    });

    test('fromJSON() should deserialize RestInteraction', () => {
      const json = {
        type: 'RestInteraction',
        name: 'Test Rest'
      };
      const interaction = InteractionFactory.fromJSON(json);
      expect(interaction).toBeInstanceOf(RestInteraction);
    });

    test('fromJSON() should deserialize ExamineInteraction', () => {
      const json = {
        type: 'ExamineInteraction',
        targetType: 'item',
        targetId: 'item-123'
      };
      const interaction = InteractionFactory.fromJSON(json);
      expect(interaction).toBeInstanceOf(ExamineInteraction);
      expect(interaction.targetType).toBe('item');
    });

    test('fromJSON() should deserialize MovementInteraction', () => {
      const json = {
        type: 'MovementInteraction',
        targetNodeId: 'node-456'
      };
      const interaction = InteractionFactory.fromJSON(json);
      expect(interaction).toBeInstanceOf(MovementInteraction);
      expect(interaction.targetNodeId).toBe('node-456');
    });

    test('fromJSON() should deserialize PerceptionInteraction', () => {
      const json = {
        type: 'PerceptionInteraction',
        perceptionType: 'listen'
      };
      const interaction = InteractionFactory.fromJSON(json);
      expect(interaction).toBeInstanceOf(PerceptionInteraction);
      expect(interaction.perceptionType).toBe('listen');
    });

    test('fromJSON() should deserialize ContentInteraction', () => {
      const json = {
        type: 'ContentInteraction',
        name: 'Test Content'
      };
      const interaction = InteractionFactory.fromJSON(json);
      expect(interaction).toBeInstanceOf(ContentInteraction);
    });

    test('fromJSON() should throw error for invalid JSON', () => {
      expect(() => InteractionFactory.fromJSON(null)).toThrow('Invalid JSON: must be an object');
      expect(() => InteractionFactory.fromJSON({})).toThrow('Invalid JSON: missing type property');
      expect(() => InteractionFactory.fromJSON({ type: 'InvalidType' })).toThrow('Unknown interaction type in JSON');
    });
  });

  describe('Bulk Operations', () => {
    test('createMultiple() should create multiple interactions', () => {
      const configs = [
        { type: 'wait', config: { name: 'Wait 1' } },
        { type: 'rest', config: { name: 'Rest 1' } },
        { type: 'examine', config: { targetType: 'item' } }
      ];

      const interactions = InteractionFactory.createMultiple(configs);

      expect(interactions).toHaveLength(3);
      expect(interactions[0]).toBeInstanceOf(WaitInteraction);
      expect(interactions[1]).toBeInstanceOf(RestInteraction);
      expect(interactions[2]).toBeInstanceOf(ExamineInteraction);
      expect(interactions[0].name).toBe('Wait 1');
    });

    test('createMultiple() should throw error for invalid configs', () => {
      const configs = [
        { config: { name: 'Test' } } // Missing type
      ];

      expect(() => InteractionFactory.createMultiple(configs)).toThrow('Each config must have a type property');
    });

    test('createMultiple() should throw error for non-array input', () => {
      expect(() => InteractionFactory.createMultiple('not an array')).toThrow('Configs must be an array');
    });

    test('fromJSONArray() should deserialize multiple interactions', () => {
      const jsonArray = [
        { type: 'WaitInteraction', name: 'Wait 1' },
        { type: 'RestInteraction', name: 'Rest 1' }
      ];

      const interactions = InteractionFactory.fromJSONArray(jsonArray);

      expect(interactions).toHaveLength(2);
      expect(interactions[0]).toBeInstanceOf(WaitInteraction);
      expect(interactions[1]).toBeInstanceOf(RestInteraction);
    });

    test('fromJSONArray() should throw error for non-array input', () => {
      expect(() => InteractionFactory.fromJSONArray('not an array')).toThrow('JSON array must be an array');
    });
  });

  describe('Error Handling', () => {
    test('should handle all create method errors gracefully', () => {
      // Test various invalid inputs
      expect(() => InteractionFactory.create()).toThrow();
      expect(() => InteractionFactory.create(null)).toThrow();
      expect(() => InteractionFactory.create('')).toThrow();
      expect(() => InteractionFactory.create('nonexistent')).toThrow();
    });

    test('should handle JSON deserialization errors', () => {
      expect(() => InteractionFactory.fromJSON()).toThrow();
      expect(() => InteractionFactory.fromJSON('not json')).toThrow();
      expect(() => InteractionFactory.fromJSON({})).toThrow();
      expect(() => InteractionFactory.fromJSON({ type: 'UnknownType' })).toThrow();
    });
  });
});
