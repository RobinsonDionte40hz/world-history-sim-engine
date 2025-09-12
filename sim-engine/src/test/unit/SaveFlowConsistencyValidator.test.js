/**
 * SaveFlowConsistencyValidator Tests
 * Tests the save flow consistency validation functionality
 */

import SaveFlowConsistencyValidator from '../../domain/services/SaveFlowConsistencyValidator.js';

describe('SaveFlowConsistencyValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new SaveFlowConsistencyValidator();
  });

  afterEach(() => {
    validator.clearResults();
  });

  describe('Save Operation Validation', () => {
    test('should validate consistent save operation successfully', () => {
      const content = {
        id: 'test-content-1',
        ownership: 'user',
        name: 'Test Content'
      };

      const context = { userId: 'user1' };
      const result = {
        success: true,
        contentId: 'test-content-1',
        timestamp: new Date().toISOString()
      };

      const metrics = {
        duration: 150,
        memoryUsage: 2048,
        databaseQueries: 1
      };

      const validationResult = validator.validateSaveConsistency(content, context, result, metrics);

      expect(validationResult.isConsistent).toBe(true);
      expect(validationResult.operationType).toBe('save');
      expect(validationResult.contentOwnership).toBe('user');
      expect(validationResult.performanceMetrics).toEqual(metrics);
    });

    test('should detect response structure inconsistency', () => {
      const content = {
        id: 'test-content-1',
        ownership: 'user',
        name: 'Test Content'
      };

      const context = { userId: 'user1' };
      const result = {
        success: true,
        // Missing required contentId field
        timestamp: new Date().toISOString()
      };

      const metrics = {
        duration: 150,
        memoryUsage: 2048,
        databaseQueries: 1
      };

      const validationResult = validator.validateSaveConsistency(content, context, result, metrics);

      expect(validationResult.isConsistent).toBe(false);
      expect(validationResult.inconsistencies).toContain('Response structure invalid: Missing required field: contentId');
    });

    test('should detect field type inconsistency', () => {
      const content = {
        id: 'test-content-1',
        ownership: 'user',
        name: 'Test Content'
      };

      const context = { userId: 'user1' };
      const result = {
        success: 'true', // Should be boolean, not string
        contentId: 'test-content-1',
        timestamp: new Date().toISOString()
      };

      const metrics = {
        duration: 150,
        memoryUsage: 2048,
        databaseQueries: 1
      };

      const validationResult = validator.validateSaveConsistency(content, context, result, metrics);

      expect(validationResult.isConsistent).toBe(false);
      expect(validationResult.inconsistencies).toContain('Response structure invalid: Field success has wrong type: expected boolean, got string');
    });
  });

  describe('Load Operation Validation', () => {
    test('should validate consistent load operation successfully', () => {
      const contentId = 'test-content-1';
      const context = { userId: 'user1' };
      const result = {
        success: true,
        content: { id: 'test-content-1', ownership: 'user', name: 'Test Content' },
        ownership: 'user',
        timestamp: new Date().toISOString()
      };

      const metrics = {
        duration: 100,
        memoryUsage: 1536,
        databaseQueries: 1
      };

      const validationResult = validator.validateLoadConsistency(contentId, context, result, metrics);

      expect(validationResult.isConsistent).toBe(true);
      expect(validationResult.operationType).toBe('load');
      expect(validationResult.contentOwnership).toBe('user');
    });

    test('should detect load response structure inconsistency', () => {
      const contentId = 'test-content-1';
      const context = { userId: 'user1' };
      const result = {
        success: true,
        // Missing required content field
        ownership: 'user',
        timestamp: new Date().toISOString()
      };

      const metrics = {
        duration: 100,
        memoryUsage: 1536,
        databaseQueries: 1
      };

      const validationResult = validator.validateLoadConsistency(contentId, context, result, metrics);

      expect(validationResult.isConsistent).toBe(false);
      expect(validationResult.inconsistencies).toContain('Response structure invalid: Missing required field: content');
    });
  });

  describe('Delete Operation Validation', () => {
    test('should validate consistent delete operation successfully', () => {
      const contentId = 'test-content-1';
      const context = { userId: 'user1', contentOwnership: 'user' };
      const result = {
        success: true,
        contentId: 'test-content-1',
        timestamp: new Date().toISOString()
      };

      const metrics = {
        duration: 80,
        memoryUsage: 1024,
        databaseQueries: 1
      };

      const validationResult = validator.validateDeleteConsistency(contentId, context, result, metrics);

      expect(validationResult.isConsistent).toBe(true);
      expect(validationResult.operationType).toBe('delete');
      expect(validationResult.contentOwnership).toBe('user');
    });
  });

  describe('Copy Operation Validation', () => {
    test('should validate consistent copy operation successfully', () => {
      const contentId = 'test-content-1';
      const newOwnership = 'user';
      const context = { userId: 'user1', originalOwnership: 'demo' };
      const result = {
        success: true,
        originalContentId: 'test-content-1',
        copiedContentId: 'test-content-1_copy_123456789',
        newOwnership: 'user',
        timestamp: new Date().toISOString()
      };

      const metrics = {
        duration: 200,
        memoryUsage: 3072,
        databaseQueries: 2
      };

      const validationResult = validator.validateCopyConsistency(contentId, newOwnership, context, result, metrics);

      expect(validationResult.isConsistent).toBe(true);
      expect(validationResult.operationType).toBe('copy');
      expect(validationResult.contentOwnership).toBe('demo');
    });
  });

  describe('Performance Consistency Validation', () => {
    test('should detect performance variance within acceptable range', () => {
      // First operation - establish baseline
      const content1 = { id: 'content-1', ownership: 'user' };
      const result1 = { success: true, contentId: 'content-1', timestamp: new Date().toISOString() };
      const metrics1 = { duration: 100, memoryUsage: 2048, databaseQueries: 1 };

      validator.validateSaveConsistency(content1, {}, result1, metrics1);

      // Second operation - within acceptable variance (5%)
      const content2 = { id: 'content-2', ownership: 'user' };
      const result2 = { success: true, contentId: 'content-2', timestamp: new Date().toISOString() };
      const metrics2 = { duration: 104, memoryUsage: 2048, databaseQueries: 1 }; // 4% variance

      const validationResult = validator.validateSaveConsistency(content2, {}, result2, metrics2);

      expect(validationResult.isConsistent).toBe(true);
    });

    test('should detect excessive performance variance', () => {
      // First operation - establish baseline
      const content1 = { id: 'content-1', ownership: 'user' };
      const result1 = { success: true, contentId: 'content-1', timestamp: new Date().toISOString() };
      const metrics1 = { duration: 100, memoryUsage: 2048, databaseQueries: 1 };

      validator.validateSaveConsistency(content1, {}, result1, metrics1);

      // Second operation - excessive variance (20%)
      const content2 = { id: 'content-2', ownership: 'user' };
      const result2 = { success: true, contentId: 'content-2', timestamp: new Date().toISOString() };
      const metrics2 = { duration: 120, memoryUsage: 2048, databaseQueries: 1 }; // 20% variance

      const validationResult = validator.validateSaveConsistency(content2, {}, result2, metrics2);

      expect(validationResult.isConsistent).toBe(false);
      expect(validationResult.inconsistencies[0]).toContain('Performance variance too high');
    });
  });

  describe('Consistency Reporting', () => {
    test('should generate consistency report', () => {
      // Add some validation results
      const content = { id: 'test-content', ownership: 'user' };
      const result = { success: true, contentId: 'test-content', timestamp: new Date().toISOString() };
      const metrics = { duration: 100, memoryUsage: 2048, databaseQueries: 1 };

      validator.validateSaveConsistency(content, {}, result, metrics);

      const report = validator.getConsistencyReport();

      expect(Array.isArray(report)).toBe(true);
      expect(report.length).toBe(1);
      expect(report[0].operationType).toBe('save');
      expect(report[0].isConsistent).toBe(true);
    });

    test('should generate performance metrics summary', () => {
      // Add validation results for different operations and ownership types
      const userContent = { id: 'user-content', ownership: 'user' };
      const demoContent = { id: 'demo-content', ownership: 'demo' };

      const userResult = { success: true, contentId: 'user-content', timestamp: new Date().toISOString() };
      const demoResult = { success: true, contentId: 'demo-content', timestamp: new Date().toISOString() };

      const metrics = { duration: 100, memoryUsage: 2048, databaseQueries: 1 };

      validator.validateSaveConsistency(userContent, {}, userResult, metrics);
      validator.validateSaveConsistency(demoContent, {}, demoResult, metrics);

      const summary = validator.getPerformanceMetricsSummary();

      expect(summary.operations.save).toBeDefined();
      expect(summary.operations.save.count).toBe(2);
      expect(summary.operations.save.consistent).toBe(2);
      expect(summary.operations.save.performance.user.samples).toHaveLength(1);
      expect(summary.operations.save.performance.demo.samples).toHaveLength(1);
    });

    test('should limit report results', () => {
      // Add many validation results
      for (let i = 0; i < 150; i++) {
        const content = { id: `content-${i}`, ownership: 'user' };
        const result = { success: true, contentId: `content-${i}`, timestamp: new Date().toISOString() };
        const metrics = { duration: 100 + i, memoryUsage: 2048, databaseQueries: 1 };

        validator.validateSaveConsistency(content, {}, result, metrics);
      }

      const report = validator.getConsistencyReport(50);

      expect(report.length).toBe(50);
    });
  });

  describe('Cross-Ownership Consistency', () => {
    test('should maintain separate performance baselines for different ownership types', () => {
      // User content operations
      const userContent = { id: 'user-content', ownership: 'user' };
      const userResult = { success: true, contentId: 'user-content', timestamp: new Date().toISOString() };
      const userMetrics = { duration: 100, memoryUsage: 2048, databaseQueries: 1 };

      validator.validateSaveConsistency(userContent, {}, userResult, userMetrics);

      // Demo content operations - different duration should be fine since it's a different baseline
      const demoContent = { id: 'demo-content', ownership: 'demo' };
      const demoResult = { success: true, contentId: 'demo-content', timestamp: new Date().toISOString() };
      const demoMetrics = { duration: 200, memoryUsage: 2048, databaseQueries: 1 }; // Different duration

      const demoValidation = validator.validateSaveConsistency(demoContent, {}, demoResult, demoMetrics);

      // Demo operation should be consistent with its own baseline (first demo operation)
      expect(demoValidation.isConsistent).toBe(true);
    });

    test('should compare performance within same ownership type', () => {
      // First user operation
      const content1 = { id: 'content-1', ownership: 'user' };
      const result1 = { success: true, contentId: 'content-1', timestamp: new Date().toISOString() };
      const metrics1 = { duration: 100, memoryUsage: 2048, databaseQueries: 1 };

      validator.validateSaveConsistency(content1, {}, result1, metrics1);

      // Second user operation with high variance
      const content2 = { id: 'content-2', ownership: 'user' };
      const result2 = { success: true, contentId: 'content-2', timestamp: new Date().toISOString() };
      const metrics2 = { duration: 160, memoryUsage: 2048, databaseQueries: 1 }; // 60% variance

      const validation2 = validator.validateSaveConsistency(content2, {}, result2, metrics2);

      expect(validation2.isConsistent).toBe(false);
    });
  });
});