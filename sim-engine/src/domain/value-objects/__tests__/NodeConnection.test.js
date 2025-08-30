// src/domain/value-objects/__tests__/NodeConnection.test.js

import NodeConnection from '../NodeConnection.js';
import { ConnectionTypes } from '../../../shared/constants/ConnectionTypes.js';
import { ValidationError } from '../../../shared/types/ValueObjectTypes.js';

describe('NodeConnection', () => {
  describe('constructor', () => {
    it('should create connection with valid parameters', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        type: ConnectionTypes.ROAD,
        difficulty: 3,
        distance: 2.5,
        bidirectional: true,
        conditions: [
          { type: 'level', value: 5, operator: 'gte' }
        ],
        modifiers: {
          speed_bonus: 0.1
        }
      });

      expect(connection.targetNodeId).toBe('node-123');
      expect(connection.type).toBe(ConnectionTypes.ROAD);
      expect(connection.difficulty).toBe(3);
      expect(connection.distance).toBe(2.5);
      expect(connection.bidirectional).toBe(true);
      expect(connection.conditions).toHaveLength(1);
      expect(connection.conditions[0].type).toBe('level');
      expect(connection.modifiers.speed_bonus).toBe(0.1);
    });

    it('should throw error for missing target node ID', () => {
      expect(() => new NodeConnection({})).toThrow(ValidationError);
      expect(() => new NodeConnection({ targetNodeId: '' })).toThrow(ValidationError);
      expect(() => new NodeConnection({ targetNodeId: '   ' })).toThrow(ValidationError);
      expect(() => new NodeConnection({ targetNodeId: null })).toThrow(ValidationError);
    });

    it('should use default values for missing optional parameters', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123'
      });

      expect(connection.type).toBe(ConnectionTypes.ROAD);
      expect(connection.difficulty).toBe(1); // Default for road
      expect(connection.distance).toBe(1);
      expect(connection.bidirectional).toBe(true);
      expect(connection.conditions).toEqual([]);
      expect(connection.modifiers).toEqual({});
    });

    it('should validate and correct invalid difficulty values', () => {
      const connection1 = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: -1 // Too low
      });

      const connection2 = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 15 // Too high
      });

      const connection3 = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 'invalid' // Not a number
      });

      expect(connection1.difficulty).toBe(1); // Default
      expect(connection2.difficulty).toBe(1); // Default
      expect(connection3.difficulty).toBe(1); // Default
    });

    it('should validate and correct invalid distance values', () => {
      const connection1 = new NodeConnection({
        targetNodeId: 'node-123',
        distance: -1 // Negative
      });

      const connection2 = new NodeConnection({
        targetNodeId: 'node-123',
        distance: 0 // Zero
      });

      const connection3 = new NodeConnection({
        targetNodeId: 'node-123',
        distance: 'invalid' // Not a number
      });

      expect(connection1.distance).toBe(1); // Default
      expect(connection2.distance).toBe(1); // Default
      expect(connection3.distance).toBe(1); // Default
    });

    it('should use default connection type for invalid types', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        type: 'invalid_type'
      });

      expect(connection.type).toBe(ConnectionTypes.ROAD);
    });

    it('should filter out invalid conditions', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        conditions: [
          { type: 'level', value: 5 }, // Valid
          { value: 10 }, // Invalid: missing type
          'invalid', // Invalid: not an object
          { type: 'strength', value: 12 }, // Valid
          null // Invalid: null
        ]
      });

      expect(connection.conditions).toHaveLength(2);
      expect(connection.conditions[0].type).toBe('level');
      expect(connection.conditions[1].type).toBe('strength');
    });

    it('should limit conditions to 10 maximum', () => {
      const conditions = Array(15).fill().map((_, i) => ({
        type: `condition_${i}`,
        value: i
      }));

      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        conditions
      });

      expect(connection.conditions).toHaveLength(10);
    });

    it('should filter out invalid modifiers', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        modifiers: {
          valid_modifier: 0.5, // Valid
          invalid_string: 'invalid', // Invalid: not a number
          invalid_null: null, // Invalid: null
          valid_negative: -0.2, // Valid: negative numbers allowed
          invalid_nan: NaN // Invalid: NaN
        }
      });

      expect(Object.keys(connection.modifiers)).toHaveLength(2);
      expect(connection.modifiers.valid_modifier).toBe(0.5);
      expect(connection.modifiers.valid_negative).toBe(-0.2);
    });

    it('should round difficulty to integer', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 3.7
      });

      expect(connection.difficulty).toBe(4);
    });

    it('should enforce minimum distance of 0.1', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        distance: 0.05
      });

      expect(connection.distance).toBe(0.1);
    });

    it('should be immutable after construction', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123'
      });

      expect(() => {
        connection.targetNodeId = 'new-node';
      }).toThrow();

      expect(() => {
        connection.difficulty = 5;
      }).toThrow();

      expect(() => {
        connection.conditions.push({ type: 'new', value: 1 });
      }).toThrow();
    });
  });

  describe('getTravelTime', () => {
    it('should calculate travel time correctly', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 5,
        distance: 2
      });

      const travelTime = connection.getTravelTime(1);
      expect(travelTime).toBe(2); // 1 * 2 * (5/5)
    });

    it('should use default base time of 1', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 4,
        distance: 3
      });

      const travelTime = connection.getTravelTime();
      expect(travelTime).toBeCloseTo(2.4); // 1 * 3 * (4/5)
    });

    it('should handle invalid base time', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 5,
        distance: 2
      });

      const travelTime1 = connection.getTravelTime(-1);
      const travelTime2 = connection.getTravelTime('invalid');
      const travelTime3 = connection.getTravelTime(0);

      expect(travelTime1).toBe(2); // Uses default base time of 1
      expect(travelTime2).toBe(2); // Uses default base time of 1
      expect(travelTime3).toBe(2); // Uses default base time of 1
    });

    it('should scale with difficulty correctly', () => {
      const easyConnection = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 1,
        distance: 1
      });

      const hardConnection = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 10,
        distance: 1
      });

      const easyTime = easyConnection.getTravelTime(1);
      const hardTime = hardConnection.getTravelTime(1);

      expect(hardTime).toBeGreaterThan(easyTime);
      expect(hardTime).toBe(2); // 1 * 1 * (10/5)
      expect(easyTime).toBe(0.2); // 1 * 1 * (1/5)
    });
  });

  describe('isPassable', () => {
    it('should return true when no conditions are required', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        conditions: []
      });

      expect(connection.isPassable()).toBe(true);
      expect(connection.isPassable({})).toBe(true);
    });

    it('should return true when all conditions are met', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        conditions: [
          { type: 'level', value: 5, operator: 'gte' },
          { type: 'strength', value: 12, operator: 'gte' }
        ]
      });

      const currentConditions = {
        level: 7,
        strength: 15
      };

      expect(connection.isPassable(currentConditions)).toBe(true);
    });

    it('should return false when any condition is not met', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        conditions: [
          { type: 'level', value: 5, operator: 'gte' },
          { type: 'strength', value: 12, operator: 'gte' }
        ]
      });

      const currentConditions = {
        level: 3, // Too low
        strength: 15
      };

      expect(connection.isPassable(currentConditions)).toBe(false);
    });

    it('should return false when required condition is missing', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        conditions: [
          { type: 'magic_key', value: true, operator: 'eq' }
        ]
      });

      const currentConditions = {
        level: 10
        // magic_key is missing
      };

      expect(connection.isPassable(currentConditions)).toBe(false);
    });

    it('should handle different operators correctly', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        conditions: [
          { type: 'level', value: 5, operator: 'eq' },
          { type: 'strength', value: 10, operator: 'gt' },
          { type: 'dexterity', value: 15, operator: 'lt' },
          { type: 'class', value: ['warrior', 'paladin'], operator: 'in' },
          { type: 'alignment', value: ['evil'], operator: 'nin' }
        ]
      });

      const validConditions = {
        level: 5, // eq
        strength: 12, // gt 10
        dexterity: 13, // lt 15
        class: 'warrior', // in array
        alignment: 'good' // not in evil array
      };

      const invalidConditions = {
        level: 6, // not eq 5
        strength: 12,
        dexterity: 13,
        class: 'warrior',
        alignment: 'good'
      };

      expect(connection.isPassable(validConditions)).toBe(true);
      expect(connection.isPassable(invalidConditions)).toBe(false);
    });

    it('should default to gte operator for unknown operators', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        conditions: [
          { type: 'level', value: 5, operator: 'unknown_operator' }
        ]
      });

      expect(connection.isPassable({ level: 5 })).toBe(true);
      expect(connection.isPassable({ level: 6 })).toBe(true);
      expect(connection.isPassable({ level: 4 })).toBe(false);
    });
  });

  describe('getEffectiveDifficulty', () => {
    it('should return base difficulty when no modifiers', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 5
      });

      expect(connection.getEffectiveDifficulty()).toBe(5);
    });

    it('should apply connection modifiers', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 5,
        modifiers: {
          difficulty_bonus: 2,
          other_modifier: 1 // Should not affect difficulty
        }
      });

      expect(connection.getEffectiveDifficulty()).toBe(7);
    });

    it('should apply character modifiers', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 6
      });

      const characterModifiers = {
        travel_skill: 0.2, // 20% reduction
        movement_bonus: 0.1 // 10% reduction
      };

      const effectiveDifficulty = connection.getEffectiveDifficulty(characterModifiers);
      expect(effectiveDifficulty).toBe(4); // 6 * (1 - 0.2) * (1 - 0.1) = 4.32, rounded to 4
    });

    it('should clamp difficulty between 1 and 10', () => {
      const connection1 = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 1,
        modifiers: {
          difficulty_penalty: -5 // Would make it negative
        }
      });

      const connection2 = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 8,
        modifiers: {
          difficulty_bonus: 5 // Would make it > 10
        }
      });

      expect(connection1.getEffectiveDifficulty()).toBe(1);
      expect(connection2.getEffectiveDifficulty()).toBe(10);
    });
  });

  describe('getTravelCost', () => {
    it('should calculate travel costs correctly', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 5,
        distance: 2
      });

      const cost = connection.getTravelCost({
        baseTimeCost: 1,
        baseEnergyCost: 2,
        baseResourceCost: 0.5
      });

      expect(cost.time).toBe(2); // 1 * 2 * (5/5)
      expect(cost.energy).toBe(2); // 2 * (5/5)
      expect(cost.resources).toBe(1); // 0.5 * 2
    });

    it('should use default cost factors', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 4,
        distance: 3
      });

      const cost = connection.getTravelCost();

      expect(cost.time).toBeCloseTo(2.4); // 1 * 3 * (4/5)
      expect(cost.energy).toBeCloseTo(0.8); // 1 * (4/5)
      expect(cost.resources).toBe(0); // 0 * 3
    });
  });

  describe('isReverseOf', () => {
    it('should identify reverse connections correctly', () => {
      const connection1 = new NodeConnection({
        targetNodeId: 'node-b',
        type: ConnectionTypes.ROAD
      });

      const connection2 = new NodeConnection({
        targetNodeId: 'node-a',
        type: ConnectionTypes.ROAD
      });

      expect(connection1.isReverseOf(connection2, 'node-a')).toBe(true);
      expect(connection2.isReverseOf(connection1, 'node-b')).toBe(true);
    });

    it('should return false for non-reverse connections', () => {
      const connection1 = new NodeConnection({
        targetNodeId: 'node-b',
        type: ConnectionTypes.ROAD
      });

      const connection2 = new NodeConnection({
        targetNodeId: 'node-c', // Different target
        type: ConnectionTypes.ROAD
      });

      expect(connection1.isReverseOf(connection2, 'node-a')).toBe(false);
    });

    it('should return false for different connection types', () => {
      const connection1 = new NodeConnection({
        targetNodeId: 'node-b',
        type: ConnectionTypes.ROAD
      });

      const connection2 = new NodeConnection({
        targetNodeId: 'node-a',
        type: ConnectionTypes.RIVER // Different type
      });

      expect(connection1.isReverseOf(connection2, 'node-a')).toBe(false);
    });

    it('should return false for invalid input', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-b'
      });

      expect(connection.isReverseOf(null, 'node-a')).toBe(false);
      expect(connection.isReverseOf('invalid', 'node-a')).toBe(false);
      expect(connection.isReverseOf({}, 'node-a')).toBe(false);
    });
  });

  describe('createReverse', () => {
    it('should create reverse connection for bidirectional connection', () => {
      const original = new NodeConnection({
        targetNodeId: 'node-b',
        type: ConnectionTypes.ROAD,
        difficulty: 3,
        distance: 2,
        bidirectional: true,
        conditions: [{ type: 'level', value: 5 }],
        modifiers: { speed: 0.1 }
      });

      const reverse = original.createReverse('node-a');

      expect(reverse.targetNodeId).toBe('node-a');
      expect(reverse.type).toBe(ConnectionTypes.ROAD);
      expect(reverse.difficulty).toBe(3);
      expect(reverse.distance).toBe(2);
      expect(reverse.bidirectional).toBe(true);
      expect(reverse.conditions).toEqual([{ type: 'level', value: 5 }]);
      expect(reverse.modifiers).toEqual({ speed: 0.1 });
    });

    it('should throw error for unidirectional connection', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-b',
        bidirectional: false
      });

      expect(() => connection.createReverse('node-a')).toThrow('Cannot create reverse connection for unidirectional connection');
    });
  });

  describe('validateConnection', () => {
    it('should return valid for correct connection', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 5,
        distance: 2
      });

      const result = connection.validateConnection(['node-123', 'node-456']);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect missing target node', () => {
      const connection = new NodeConnection({
        targetNodeId: 'missing-node'
      });

      const result = connection.validateConnection(['node-123', 'node-456']);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Target node missing-node does not exist');
    });

    it('should skip node validation when no available nodes provided', () => {
      const connection = new NodeConnection({
        targetNodeId: 'any-node'
      });

      const result = connection.validateConnection([]);

      expect(result.isValid).toBe(true);
    });

    it('should validate difficulty range during construction', () => {
      // Test that invalid difficulty values are corrected during construction
      const connection1 = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: -1 // Invalid
      });
      
      const connection2 = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 15 // Invalid
      });

      expect(connection1.difficulty).toBe(1); // Default
      expect(connection2.difficulty).toBe(1); // Default
    });

    it('should validate distance range during construction', () => {
      // Test that invalid distance values are corrected during construction
      const connection1 = new NodeConnection({
        targetNodeId: 'node-123',
        distance: -1 // Invalid
      });
      
      const connection2 = new NodeConnection({
        targetNodeId: 'node-123',
        distance: 0 // Invalid
      });

      expect(connection1.distance).toBe(1); // Default
      expect(connection2.distance).toBe(1); // Default
    });
  });

  describe('serialization', () => {
    describe('toJSON', () => {
      it('should serialize connection to JSON', () => {
        const connection = new NodeConnection({
          targetNodeId: 'node-123',
          type: ConnectionTypes.MOUNTAIN_PASS,
          difficulty: 6,
          distance: 3,
          bidirectional: false,
          conditions: [{ type: 'climbing', value: 5 }],
          modifiers: { altitude: 0.2 }
        });

        const json = connection.toJSON();

        expect(json.targetNodeId).toBe('node-123');
        expect(json.type).toBe(ConnectionTypes.MOUNTAIN_PASS);
        expect(json.difficulty).toBe(6);
        expect(json.distance).toBe(3);
        expect(json.bidirectional).toBe(false);
        expect(json.conditions).toEqual([{ type: 'climbing', value: 5 }]);
        expect(json.modifiers).toEqual({ altitude: 0.2 });
      });

      it('should create deep copies of arrays and objects', () => {
        const conditions = [{ type: 'level', value: 5 }];
        const modifiers = { speed: 0.1 };

        const connection = new NodeConnection({
          targetNodeId: 'node-123',
          conditions,
          modifiers
        });

        const json = connection.toJSON();

        // Modify original arrays/objects
        conditions.push({ type: 'strength', value: 10 });
        modifiers.power = 0.2;

        // JSON should not be affected
        expect(json.conditions).toHaveLength(1);
        expect(json.modifiers.power).toBeUndefined();
      });
    });

    describe('fromJSON', () => {
      it('should deserialize connection from JSON', () => {
        const jsonData = {
          targetNodeId: 'node-456',
          type: ConnectionTypes.RIVER,
          difficulty: 4,
          distance: 1.5,
          bidirectional: true,
          conditions: [{ type: 'swimming', value: 3 }],
          modifiers: { current: -0.1 }
        };

        const connection = NodeConnection.fromJSON(jsonData);

        expect(connection.targetNodeId).toBe('node-456');
        expect(connection.type).toBe(ConnectionTypes.RIVER);
        expect(connection.difficulty).toBe(4);
        expect(connection.distance).toBe(1.5);
        expect(connection.bidirectional).toBe(true);
        expect(connection.conditions).toEqual([{ type: 'swimming', value: 3 }]);
        expect(connection.modifiers).toEqual({ current: -0.1 });
      });

      it('should throw ValidationError for invalid JSON data', () => {
        expect(() => NodeConnection.fromJSON(null)).toThrow(ValidationError);
        expect(() => NodeConnection.fromJSON('invalid')).toThrow(ValidationError);
        expect(() => NodeConnection.fromJSON(123)).toThrow(ValidationError);
      });

      it('should handle missing optional properties', () => {
        const jsonData = {
          targetNodeId: 'node-789'
        };

        const connection = NodeConnection.fromJSON(jsonData);

        expect(connection.targetNodeId).toBe('node-789');
        expect(connection.type).toBe(ConnectionTypes.ROAD);
        expect(connection.difficulty).toBe(1);
        expect(connection.distance).toBe(1);
        expect(connection.bidirectional).toBe(true);
        expect(connection.conditions).toEqual([]);
        expect(connection.modifiers).toEqual({});
      });
    });
  });

  describe('static factory methods', () => {
    describe('createRoad', () => {
      it('should create a basic road connection', () => {
        const connection = NodeConnection.createRoad('target-node');

        expect(connection.targetNodeId).toBe('target-node');
        expect(connection.type).toBe(ConnectionTypes.ROAD);
        expect(connection.difficulty).toBe(1);
        expect(connection.distance).toBe(1);
        expect(connection.bidirectional).toBe(true);
        expect(connection.conditions).toEqual([]);
        expect(connection.modifiers).toEqual({});
      });
    });

    describe('createMountainPass', () => {
      it('should create a mountain pass connection', () => {
        const connection = NodeConnection.createMountainPass('mountain-node');

        expect(connection.targetNodeId).toBe('mountain-node');
        expect(connection.type).toBe(ConnectionTypes.MOUNTAIN_PASS);
        expect(connection.difficulty).toBe(6);
        expect(connection.distance).toBe(2);
        expect(connection.bidirectional).toBe(true);
        expect(connection.conditions).toHaveLength(2);
        expect(connection.conditions[0].type).toBe('climbing_skill');
        expect(connection.conditions[1].type).toBe('constitution');
        expect(connection.modifiers.altitude_sickness).toBe(0.2);
        expect(connection.modifiers.weather_risk).toBe(0.3);
      });
    });

    describe('createTeleport', () => {
      it('should create a teleport connection', () => {
        const connection = NodeConnection.createTeleport('teleport-target');

        expect(connection.targetNodeId).toBe('teleport-target');
        expect(connection.type).toBe(ConnectionTypes.TELEPORT);
        expect(connection.difficulty).toBe(1);
        expect(connection.distance).toBe(0.1);
        expect(connection.bidirectional).toBe(false);
        expect(connection.conditions).toHaveLength(1);
        expect(connection.conditions[0].type).toBe('magic_access');
        expect(connection.modifiers.mana_cost).toBe(10);
      });
    });
  });

  describe('withModifications', () => {
    it('should create new connection with modifications', () => {
      const original = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: 3,
        distance: 2
      });

      const modified = original.withModifications({
        difficulty: 5,
        bidirectional: false
      });

      expect(original.difficulty).toBe(3);
      expect(original.bidirectional).toBe(true);
      expect(modified.difficulty).toBe(5);
      expect(modified.bidirectional).toBe(false);
      expect(modified.targetNodeId).toBe('node-123');
      expect(modified.distance).toBe(2);
      expect(modified).not.toBe(original);
    });
  });

  describe('immutability', () => {
    it('should be immutable after construction', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        conditions: [{ type: 'level', value: 5 }],
        modifiers: { speed: 0.1 }
      });

      expect(() => {
        connection.targetNodeId = 'new-node';
      }).toThrow();

      expect(() => {
        connection.difficulty = 10;
      }).toThrow();

      expect(() => {
        connection.conditions.push({ type: 'new', value: 1 });
      }).toThrow();

      expect(() => {
        connection.modifiers.new_modifier = 0.5;
      }).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle extreme values gracefully', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: Number.MAX_VALUE,
        distance: Number.POSITIVE_INFINITY
      });

      expect(connection.difficulty).toBe(1); // Default due to validation
      expect(connection.distance).toBe(1); // Default due to validation
    });

    it('should handle NaN values', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        difficulty: NaN,
        distance: NaN
      });

      expect(connection.difficulty).toBe(1); // Default
      expect(connection.distance).toBe(1); // Default
    });

    it('should handle empty conditions and modifiers', () => {
      const connection = new NodeConnection({
        targetNodeId: 'node-123',
        conditions: [],
        modifiers: {}
      });

      expect(connection.conditions).toEqual([]);
      expect(connection.modifiers).toEqual({});
      expect(connection.isPassable()).toBe(true);
    });
  });
});