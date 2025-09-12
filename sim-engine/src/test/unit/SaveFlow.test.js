/**
 * SaveFlow Entity Tests
 * Tests the SaveFlow entity functionality
 */

import SaveFlow from '../../domain/entities/SaveFlow.js';

describe('SaveFlow Entity', () => {
  test('should create SaveFlow with default values', () => {
    const saveFlow = new SaveFlow();
    expect(saveFlow.id).toBeDefined();
    expect(saveFlow.ownership).toBe('user');
    expect(saveFlow.permissions).toContain('write');
    expect(saveFlow.createdAt).toBeDefined();
  });

  test('should create user SaveFlow with correct permissions', () => {
    const saveFlow = SaveFlow.createUserSaveFlow('content-1', 'world');
    expect(saveFlow.contentId).toBe('content-1');
    expect(saveFlow.contentType).toBe('world');
    expect(saveFlow.ownership).toBe('user');
    expect(saveFlow.canPerform('write')).toBe(true);
    expect(saveFlow.canPerform('delete')).toBe(true);
  });

  test('should create demo SaveFlow with restrictions', () => {
    const saveFlow = SaveFlow.createDemoSaveFlow('demo-1', 'world');
    expect(saveFlow.contentId).toBe('demo-1');
    expect(saveFlow.ownership).toBe('demo');
    expect(saveFlow.canPerform('read')).toBe(true);
    expect(saveFlow.canPerform('write')).toBe(false);
    expect(saveFlow.isRestricted('no-modify')).toBe(true);
  });

  test('should validate SaveFlow correctly', () => {
    const validSaveFlow = new SaveFlow({ contentId: 'test-1' });
    const validation = validSaveFlow.validate();
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);

    const invalidSaveFlow = new SaveFlow({ ownership: 'invalid' });
    const invalidValidation = invalidSaveFlow.validate();
    expect(invalidValidation.isValid).toBe(false);
    expect(invalidValidation.errors).toContain('Content ID is required');
    expect(invalidValidation.errors).toContain('Ownership must be either "user" or "demo"');
  });

  test('should track operations correctly', () => {
    const saveFlow = new SaveFlow({ contentId: 'test-1' });
    saveFlow.addOperation('save', { size: 1024 });
    saveFlow.addOperation('load', { duration: 150 });

    expect(saveFlow.operationHistory).toHaveLength(2);
    expect(saveFlow.operationHistory[0].operation).toBe('save');
    expect(saveFlow.operationHistory[1].operation).toBe('load');
  });

  test('should create copy with new ownership', () => {
    const original = SaveFlow.createDemoSaveFlow('demo-1');
    const copy = original.createCopy('user');

    expect(copy.contentId).toBe('demo-1');
    expect(copy.ownership).toBe('user');
    expect(copy.canPerform('write')).toBe(true);
    expect(copy.operationHistory[0].operation).toBe('copy');
  });

  test('should serialize and deserialize correctly', () => {
    const original = SaveFlow.createUserSaveFlow('test-1', 'world', {
      tags: ['test', 'sample'],
      size: 2048
    });

    const json = original.toJSON();
    const deserialized = SaveFlow.fromJSON(json);

    expect(deserialized.id).toBe(original.id);
    expect(deserialized.contentId).toBe(original.contentId);
    expect(deserialized.ownership).toBe(original.ownership);
    expect(deserialized.tags).toEqual(original.tags);
    expect(deserialized.size).toBe(original.size);
  });

  test('should update timestamps correctly', () => {
    const saveFlow = new SaveFlow({ contentId: 'test-1' });
    const originalModified = saveFlow.modifiedAt;
    const originalAccessed = saveFlow.lastAccessedAt;

    // Wait a bit to ensure different timestamp
    setTimeout(() => {
      saveFlow.updateModified();
      expect(saveFlow.modifiedAt).not.toBe(originalModified);
      expect(saveFlow.lastAccessedAt).not.toBe(originalAccessed);
    }, 1);
  });
});