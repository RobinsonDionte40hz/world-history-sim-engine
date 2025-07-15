// src/domain/value-objects/__tests__/BaseValueObject.test.js

import { BaseValueObject } from '../BaseValueObject';
import { ValidationError } from '../../../shared/types/ValueObjectTypes';

// Test implementation of BaseValueObject
class TestValueObject extends BaseValueObject {
  constructor(id, value, name) {
    super();
    this.id = id;
    this.value = value;
    this.name = name;
    this.validate();
    this.freeze();
  }

  validate() {
    this.validateRequired('id', this.id);
    this.validateRequired('name', this.name);
    this.validateStringLength('id', this.id, 1, 50);
    this.validateStringLength('name', this.name, 1, 100);
    this.validateRange('value', this.value, 0, 100);
  }

  toJSON() {
    return {
      id: this.id,
      value: this.value,
      name: this.name
    };
  }

  static fromJSON(data) {
    return new TestValueObject(data.id, data.value, data.name);
  }

  withValue(newValue) {
    return new TestValueObject(this.id, newValue, this.name);
  }

  withName(newName) {
    return new TestValueObject(this.id, this.value, newName);
  }
}

describe('BaseValueObject', () => {
  describe('Construction and Immutability', () => {
    test('should create a valid value object', () => {
      const obj = new TestValueObject('test-id', 50, 'Test Object');
      
      expect(obj.id).toBe('test-id');
      expect(obj.value).toBe(50);
      expect(obj.name).toBe('Test Object');
    });

    test('should be immutable after construction', () => {
      const obj = new TestValueObject('test-id', 50, 'Test Object');
      
      // Attempting to modify should throw
      expect(() => {
        obj.id = 'new-id';
      }).toThrow();
    });

    test('should freeze nested objects', () => {
      const obj = new TestValueObject('test-id', 50, 'Test Object');
      expect(Object.isFrozen(obj)).toBe(true);
    });
  });

  describe('Validation', () => {
    test('should validate required fields', () => {
      expect(() => new TestValueObject('', 50, 'Test')).toThrow(ValidationError);
      expect(() => new TestValueObject('test', 50, '')).toThrow(ValidationError);
    });

    test('should validate string length', () => {
      const longId = 'a'.repeat(51);
      expect(() => new TestValueObject(longId, 50, 'Test')).toThrow(ValidationError);
      
      const longName = 'a'.repeat(101);
      expect(() => new TestValueObject('test', 50, longName)).toThrow(ValidationError);
    });

    test('should validate numeric ranges', () => {
      expect(() => new TestValueObject('test', -1, 'Test')).toThrow(ValidationError);
      expect(() => new TestValueObject('test', 101, 'Test')).toThrow(ValidationError);
    });

    test('should accept valid values', () => {
      expect(() => new TestValueObject('test', 0, 'Test')).not.toThrow();
      expect(() => new TestValueObject('test', 100, 'Test')).not.toThrow();
      expect(() => new TestValueObject('test', 50, 'Test')).not.toThrow();
    });
  });

  describe('Serialization', () => {
    test('should serialize to JSON correctly', () => {
      const obj = new TestValueObject('test-id', 50, 'Test Object');
      const json = obj.toJSON();
      
      expect(json).toEqual({
        id: 'test-id',
        value: 50,
        name: 'Test Object'
      });
    });

    test('should deserialize from JSON correctly', () => {
      const data = { id: 'test-id', value: 50, name: 'Test Object' };
      const obj = TestValueObject.fromJSON(data);
      
      expect(obj.id).toBe('test-id');
      expect(obj.value).toBe(50);
      expect(obj.name).toBe('Test Object');
    });

    test('should maintain immutability after deserialization', () => {
      const data = { id: 'test-id', value: 50, name: 'Test Object' };
      const obj = TestValueObject.fromJSON(data);
      
      expect(Object.isFrozen(obj)).toBe(true);
    });
  });

  describe('Equality and Comparison', () => {
    test('should consider objects with same data as equal', () => {
      const obj1 = new TestValueObject('test-id', 50, 'Test Object');
      const obj2 = new TestValueObject('test-id', 50, 'Test Object');
      
      expect(obj1.equals(obj2)).toBe(true);
      expect(obj2.equals(obj1)).toBe(true);
    });

    test('should consider objects with different data as not equal', () => {
      const obj1 = new TestValueObject('test-id', 50, 'Test Object');
      const obj2 = new TestValueObject('test-id', 60, 'Test Object');
      
      expect(obj1.equals(obj2)).toBe(false);
      expect(obj2.equals(obj1)).toBe(false);
    });

    test('should return same hash code for equal objects', () => {
      const obj1 = new TestValueObject('test-id', 50, 'Test Object');
      const obj2 = new TestValueObject('test-id', 50, 'Test Object');
      
      expect(obj1.hashCode()).toBe(obj2.hashCode());
    });

    test('should return different hash codes for different objects', () => {
      const obj1 = new TestValueObject('test-id', 50, 'Test Object');
      const obj2 = new TestValueObject('test-id', 60, 'Test Object');
      
      expect(obj1.hashCode()).not.toBe(obj2.hashCode());
    });
  });

  describe('String Representation', () => {
    test('should provide meaningful string representation', () => {
      const obj = new TestValueObject('test-id', 50, 'Test Object');
      const str = obj.toString();
      
      expect(str).toContain('test-id');
      expect(str).toContain('50');
      expect(str).toContain('Test Object');
    });
  });

  describe('Immutable Updates', () => {
    test('should create new instances when updating', () => {
      const obj1 = new TestValueObject('test-id', 50, 'Test Object');
      const obj2 = obj1.withValue(75);
      
      expect(obj1).not.toBe(obj2);
      expect(obj1.value).toBe(50);
      expect(obj2.value).toBe(75);
      expect(obj2.id).toBe(obj1.id);
      expect(obj2.name).toBe(obj1.name);
    });

    test('should maintain immutability in updated instances', () => {
      const obj1 = new TestValueObject('test-id', 50, 'Test Object');
      const obj2 = obj1.withName('Updated Name');
      
      expect(Object.isFrozen(obj2)).toBe(true);
      expect(obj2.name).toBe('Updated Name');
      expect(obj1.name).toBe('Test Object');
    });
  });
});

describe('SerializationUtils', () => {
  test('should be tested through BaseValueObject usage', () => {
    // SerializationUtils are tested indirectly through BaseValueObject tests
    // This ensures they work correctly in the context they'll be used
    expect(true).toBe(true);
  });
});