/**
 * ContentEntity Base Class Tests
 * Tests the ContentEntity abstract base class functionality
 */

import ContentEntity from '../../domain/entities/ContentEntity.js';

// Concrete implementation for testing
class TestContentEntity extends ContentEntity {
  constructor(config = {}) {
    super(config);
    this.testData = config.testData || 'test value';
    this.testNumber = config.testNumber || 42;
  }

  validate() {
    const errors = [];
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }
    if (this.testNumber < 0) {
      errors.push('Test number must be non-negative');
    }

    this.isValid = errors.length === 0;
    this.validationErrors = errors;

    return {
      isValid: this.isValid,
      errors
    };
  }

  getSize() {
    return JSON.stringify(this.getSaveData()).length;
  }

  copy() {
    const copyData = this.toJSON();
    delete copyData.id;
    return new TestContentEntity({
      ...copyData,
      testData: copyData.data.testData,
      testNumber: copyData.data.testNumber
    });
  }

  getSaveData() {
    return {
      ...super.getSaveData(),
      testData: this.testData,
      testNumber: this.testNumber
    };
  }

  static load(saveData) {
    return new TestContentEntity({
      ...saveData,
      testData: saveData.data?.testData,
      testNumber: saveData.data?.testNumber
    });
  }
}

describe('ContentEntity Base Class', () => {
  test('should not allow direct instantiation of abstract class', () => {
    expect(() => {
      new ContentEntity();
    }).toThrow('ContentEntity is an abstract class and cannot be instantiated directly');
  });

  test('should create concrete implementation with default values', () => {
    const entity = new TestContentEntity();
    expect(entity.id).toBeDefined();
    expect(entity.type).toBe('content');
    expect(entity.name).toBe('Unnamed Content');
    expect(entity.ownership).toBe('user');
    expect(entity.createdAt).toBeDefined();
  });

  test('should validate content correctly', () => {
    const validEntity = new TestContentEntity({ name: 'Valid Content' });
    const validResult = validEntity.validate();
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toHaveLength(0);

    const invalidEntity = new TestContentEntity({ name: '', testNumber: -1 });
    // Manually set name to empty to test validation
    invalidEntity.name = '';
    const invalidResult = invalidEntity.validate();
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toHaveLength(2);
    expect(invalidResult.errors).toContain('Name is required');
    expect(invalidResult.errors).toContain('Test number must be non-negative');
  });

  test('should calculate size correctly', () => {
    const entity = new TestContentEntity({
      name: 'Test',
      testData: 'hello world',
      testNumber: 123
    });
    const size = entity.getSize();
    expect(size).toBeGreaterThan(0);
    expect(typeof size).toBe('number');
  });

  test('should create copy correctly', () => {
    const original = new TestContentEntity({
      name: 'Original',
      testData: 'original data'
    });
    const copy = original.copy();

    expect(copy.name).toBe(original.name);
    expect(copy.testData).toBe(original.testData);
    expect(copy.id).not.toBe(original.id); // Should have new ID
    expect(copy.createdAt).toBe(original.createdAt);
  });

  test('should check permissions correctly', () => {
    const userEntity = new TestContentEntity({ ownership: 'user' });
    expect(userEntity.canModify()).toBe(true);
    expect(userEntity.canDelete()).toBe(true);
    expect(userEntity.canCopy()).toBe(true);

    const demoEntity = new TestContentEntity({ ownership: 'demo' });
    expect(demoEntity.canModify()).toBe(false);
    expect(demoEntity.canDelete()).toBe(false);
    expect(demoEntity.canCopy()).toBe(true);
  });

  test('should update name correctly', () => {
    const userEntity = new TestContentEntity({ name: 'Original' });
    const originalModified = userEntity.modifiedAt;
    
    // Small delay to ensure different timestamp
    setTimeout(() => {
      const result = userEntity.updateName('Updated Name');
      expect(result).toBe(true);
      expect(userEntity.name).toBe('Updated Name');
      expect(userEntity.modifiedAt).not.toBe(originalModified);
    }, 1);

    const demoEntity = new TestContentEntity({ ownership: 'demo', name: 'Demo' });
    const demoResult = demoEntity.updateName('Should Fail');
    expect(demoResult).toBe(false);
    expect(demoEntity.name).toBe('Demo');
  });

  test('should manage tags correctly', () => {
    const entity = new TestContentEntity();

    // Add tag
    const addResult = entity.addTag('test-tag');
    expect(addResult).toBe(true);
    expect(entity.tags).toContain('test-tag');

    // Try to add duplicate tag
    const duplicateResult = entity.addTag('test-tag');
    expect(duplicateResult).toBe(false);

    // Remove tag
    const removeResult = entity.removeTag('test-tag');
    expect(removeResult).toBe(true);
    expect(entity.tags).not.toContain('test-tag');

    // Try to remove non-existent tag
    const nonExistentResult = entity.removeTag('non-existent');
    expect(nonExistentResult).toBe(false);
  });

  test('should serialize and deserialize correctly', () => {
    const original = new TestContentEntity({
      name: 'Test Entity',
      testData: 'test data',
      testNumber: 99,
      tags: ['tag1', 'tag2']
    });

    const json = original.toJSON();
    const deserialized = TestContentEntity.fromJSON(json);

    expect(deserialized.id).toBe(original.id);
    expect(deserialized.name).toBe(original.name);
    expect(deserialized.testData).toBe(original.testData);
    expect(deserialized.testNumber).toBe(original.testNumber);
    expect(deserialized.tags).toEqual(original.tags);
  });

  test('should get summary correctly', () => {
    const entity = new TestContentEntity({
      name: 'Summary Test',
      ownership: 'demo'
    });

    const summary = entity.getSummary();
    expect(summary.id).toBe(entity.id);
    expect(summary.name).toBe('Summary Test');
    expect(summary.ownership).toBe('demo');
    expect(summary.canModify).toBe(false);
    expect(summary.canDelete).toBe(false);
    expect(summary.canCopy).toBe(true);
  });
});