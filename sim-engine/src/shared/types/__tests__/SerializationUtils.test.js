// src/shared/types/__tests__/SerializationUtils.test.js

import { SerializationUtils } from '../ValueObjectTypes';

describe('SerializationUtils', () => {
  describe('Map Serialization', () => {
    test('should serialize and deserialize Maps correctly', () => {
      const originalMap = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', 'value3']
      ]);

      const serialized = SerializationUtils.serializeMap(originalMap);
      const deserialized = SerializationUtils.deserializeMap(serialized);

      expect(deserialized).toEqual(originalMap);
      expect(deserialized.get('key1')).toBe('value1');
      expect(deserialized.get('key2')).toBe('value2');
      expect(deserialized.get('key3')).toBe('value3');
      expect(deserialized.size).toBe(3);
    });

    test('should handle empty Maps', () => {
      const emptyMap = new Map();
      const serialized = SerializationUtils.serializeMap(emptyMap);
      const deserialized = SerializationUtils.deserializeMap(serialized);

      expect(deserialized).toEqual(emptyMap);
      expect(deserialized.size).toBe(0);
    });

    test('should handle Maps with complex values', () => {
      const complexMap = new Map([
        ['obj1', { id: 1, name: 'Object 1' }],
        ['obj2', { id: 2, name: 'Object 2' }],
        ['arr1', [1, 2, 3]]
      ]);

      const serialized = SerializationUtils.serializeMap(complexMap);
      const deserialized = SerializationUtils.deserializeMap(serialized);

      expect(deserialized).toEqual(complexMap);
      expect(deserialized.get('obj1')).toEqual({ id: 1, name: 'Object 1' });
      expect(deserialized.get('arr1')).toEqual([1, 2, 3]);
    });
  });

  describe('Set Serialization', () => {
    test('should serialize and deserialize Sets correctly', () => {
      const originalSet = new Set(['value1', 'value2', 'value3']);

      const serialized = SerializationUtils.serializeSet(originalSet);
      const deserialized = SerializationUtils.deserializeSet(serialized);

      expect(deserialized).toEqual(originalSet);
      expect(deserialized.has('value1')).toBe(true);
      expect(deserialized.has('value2')).toBe(true);
      expect(deserialized.has('value3')).toBe(true);
      expect(deserialized.size).toBe(3);
    });

    test('should handle empty Sets', () => {
      const emptySet = new Set();
      const serialized = SerializationUtils.serializeSet(emptySet);
      const deserialized = SerializationUtils.deserializeSet(serialized);

      expect(deserialized).toEqual(emptySet);
      expect(deserialized.size).toBe(0);
    });

    test('should handle Sets with complex values', () => {
      const complexSet = new Set([
        { id: 1, name: 'Object 1' },
        { id: 2, name: 'Object 2' },
        [1, 2, 3]
      ]);

      const serialized = SerializationUtils.serializeSet(complexSet);
      const deserialized = SerializationUtils.deserializeSet(serialized);

      expect(deserialized).toEqual(complexSet);
      expect(deserialized.size).toBe(3);
    });
  });

  describe('Deep Freeze', () => {
    test('should freeze objects deeply', () => {
      const obj = {
        level1: {
          level2: {
            value: 'test',
            array: [1, 2, 3]
          }
        },
        simpleValue: 'simple'
      };

      const frozen = SerializationUtils.deepFreeze(obj);

      expect(Object.isFrozen(frozen)).toBe(true);
      expect(Object.isFrozen(frozen.level1)).toBe(true);
      expect(Object.isFrozen(frozen.level1.level2)).toBe(true);
      expect(Object.isFrozen(frozen.level1.level2.array)).toBe(true);
    });

    test('should handle null and undefined values', () => {
      const obj = {
        nullValue: null,
        undefinedValue: undefined,
        normalValue: 'test'
      };

      expect(() => SerializationUtils.deepFreeze(obj)).not.toThrow();
      expect(Object.isFrozen(obj)).toBe(true);
    });

    test('should handle circular references gracefully', () => {
      const obj = { value: 'test' };
      obj.self = obj;

      expect(() => SerializationUtils.deepFreeze(obj)).not.toThrow();
      expect(Object.isFrozen(obj)).toBe(true);
    });
  });

  describe('Round-trip Serialization', () => {
    test('should maintain data integrity through serialization cycles', () => {
      const complexData = {
        map: new Map([
          ['key1', { nested: 'value1' }],
          ['key2', [1, 2, 3]]
        ]),
        set: new Set(['item1', 'item2', 'item3']),
        array: [1, 2, 3],
        object: { nested: { deep: 'value' } }
      };

      // Serialize Maps and Sets
      const serializedMap = SerializationUtils.serializeMap(complexData.map);
      const serializedSet = SerializationUtils.serializeSet(complexData.set);

      // Create serialized version
      const serializedData = {
        map: serializedMap,
        set: serializedSet,
        array: complexData.array,
        object: complexData.object
      };

      // Deserialize Maps and Sets
      const deserializedMap = SerializationUtils.deserializeMap(serializedData.map);
      const deserializedSet = SerializationUtils.deserializeSet(serializedData.set);

      // Verify integrity
      expect(deserializedMap).toEqual(complexData.map);
      expect(deserializedSet).toEqual(complexData.set);
      expect(deserializedMap.get('key1')).toEqual({ nested: 'value1' });
      expect(deserializedSet.has('item1')).toBe(true);
    });
  });
});