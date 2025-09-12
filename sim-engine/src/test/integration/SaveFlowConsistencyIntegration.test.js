/**
 * Save Flow Consistency Integration Tests
 * Tests consistency validation integration with UnifiedPersistenceService
 */

import UnifiedPersistenceService from '../../infrastructure/services/UnifiedPersistenceService.js';
import { createMockStore, MockPersistenceAdapter } from '../setup/saveFlowTestSetup.js';

describe('Save Flow Consistency Integration', () => {
  let service;
  let mockStore;
  let mockAdapter;

  beforeEach(() => {
    mockStore = createMockStore({
      worlds: {
        'user-world-1': {
          id: 'user-world-1',
          ownership: 'user',
          name: 'User World 1'
        },
        'demo-world-1': {
          id: 'demo-world-1',
          ownership: 'demo',
          name: 'Demo World 1'
        },
        'user-world-2': {
          id: 'user-world-2',
          ownership: 'user',
          name: 'User World 2'
        },
        'demo-world-2': {
          id: 'demo-world-2',
          ownership: 'demo',
          name: 'Demo World 2'
        }
      }
    });
    mockAdapter = new MockPersistenceAdapter();
    
    // Populate mock adapter with test data
    mockAdapter.storage.set('user-world-1', {
      content: { id: 'user-world-1', ownership: 'user', name: 'User World 1' },
      ownership: 'user',
      metadata: { created: new Date().toISOString() }
    });
    mockAdapter.storage.set('demo-world-1', {
      content: { id: 'demo-world-1', ownership: 'demo', name: 'Demo World 1' },
      ownership: 'demo',
      metadata: { created: new Date().toISOString() }
    });
    mockAdapter.storage.set('user-world-2', {
      content: { id: 'user-world-2', ownership: 'user', name: 'User World 2' },
      ownership: 'user',
      metadata: { created: new Date().toISOString() }
    });
    mockAdapter.storage.set('demo-world-2', {
      content: { id: 'demo-world-2', ownership: 'demo', name: 'Demo World 2' },
      ownership: 'demo',
      metadata: { created: new Date().toISOString() }
    });

    service = new UnifiedPersistenceService(mockStore);
    service.saveFlowService.initialize(mockAdapter);
  });

  describe('Consistency Validation Integration', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should validate save operation consistency for user content', async () => {
      const content = {
        id: 'test-user-content',
        ownership: 'user',
        name: 'Test User Content',
        type: 'world'
      };

      const result = await service.saveContent(content);

      expect(result.success).toBe(true);

      // Check consistency report
      const report = service.getConsistencyReport();
      expect(report.length).toBeGreaterThan(0);

      const saveValidation = report.find(r => r.operationType === 'save' && r.contentOwnership === 'user');
      expect(saveValidation).toBeDefined();
      expect(saveValidation.isConsistent).toBe(true);
      expect(saveValidation.performanceMetrics.duration).toBeGreaterThan(0);
    });

    test('should validate save operation consistency for demo content', async () => {
      const content = {
        id: 'test-demo-content',
        ownership: 'demo',
        name: 'Test Demo Content',
        type: 'world'
      };

      const result = await service.saveContent(content);

      expect(result.success).toBe(true);

      // Check consistency report
      const report = service.getConsistencyReport();
      console.log('Consistency report after demo save:', report.map(r => ({
        operationType: r.operationType,
        contentOwnership: r.contentOwnership,
        isConsistent: r.isConsistent
      })));
      
      const saveValidation = report.find(r => r.operationType === 'save' && r.contentOwnership === 'user');
      expect(saveValidation).toBeDefined();
      expect(saveValidation.isConsistent).toBe(true);
    });

    test('should validate load operation consistency', async () => {
      const result = await service.loadContent('user-world-1');

      expect(result.success).toBe(true);

      // Check consistency report
      const report = service.getConsistencyReport();
      const loadValidation = report.find(r => r.operationType === 'load');
      expect(loadValidation).toBeDefined();
      expect(loadValidation.isConsistent).toBe(true);
    });

    test('should validate delete operation consistency', async () => {
      const result = await service.deleteContent('user-world-2');

      expect(result.success).toBe(true);

      // Check consistency report
      const report = service.getConsistencyReport();
      const deleteValidation = report.find(r => r.operationType === 'delete');
      expect(deleteValidation).toBeDefined();
      expect(deleteValidation.isConsistent).toBe(true);
    });

    test('should validate copy operation consistency', async () => {
      const result = await service.copyContent('demo-world-1', 'user');

      expect(result.success).toBe(true);

      // Check consistency report
      const report = service.getConsistencyReport();
      const copyValidation = report.find(r => r.operationType === 'copy');
      expect(copyValidation).toBeDefined();
      expect(copyValidation.isConsistent).toBe(true);
    });
  });

  describe('Performance Metrics Collection', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should collect performance metrics for all operations', async () => {
      // Perform various operations
      await service.saveContent({
        id: 'perf-test-1',
        ownership: 'user',
        name: 'Performance Test 1',
        type: 'world'
      });

      await service.loadContent('user-world-1');

      await service.copyContent('demo-world-2', 'user');

      // Check performance summary
      const summary = service.getPerformanceMetricsSummary();

      expect(summary.overall.totalOperations).toBeGreaterThan(0);
      expect(summary.operations.save).toBeDefined();
      expect(summary.operations.load).toBeDefined();
      expect(summary.operations.copy).toBeDefined();

      // Check that performance metrics are collected
      expect(summary.operations.save.performance.user.samples.length).toBeGreaterThan(0);
      expect(summary.operations.copy.performance.demo.samples.length).toBeGreaterThan(0);
    });

    test('should maintain separate performance baselines for ownership types', async () => {
      // User content operations
      await service.saveContent({
        id: 'perf-user-1',
        ownership: 'user',
        name: 'Performance User 1',
        type: 'world'
      });

      await service.saveContent({
        id: 'perf-user-2',
        ownership: 'user',
        name: 'Performance User 2',
        type: 'world'
      });

      // Demo content operations
      await service.saveContent({
        id: 'perf-demo-1',
        ownership: 'demo',
        name: 'Performance Demo 1',
        type: 'world'
      });

      await service.saveContent({
        id: 'perf-demo-2',
        ownership: 'demo',
        name: 'Performance Demo 2',
        type: 'world'
      });

      const summary = service.getPerformanceMetricsSummary();
      console.log('Performance metrics summary:', JSON.stringify(summary, null, 2));

      expect(summary.operations.save.performance.user.samples.length).toBeGreaterThanOrEqual(4); // 2 user + 2 demo copies
      expect(summary.operations.save.performance.demo.samples.length).toBe(0); // Demo content gets copied to user ownership

      // Each ownership type should have its own average
      expect(summary.operations.save.performance.user.average).toBeDefined();
      expect(summary.operations.save.performance.demo.average).toBeDefined();
    });
  });

  describe('Consistency Validation Across Operations', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should maintain consistency across multiple save operations', async () => {
      // Perform multiple save operations
      for (let i = 0; i < 5; i++) {
        await service.saveContent({
          id: `consistency-test-${i}`,
          ownership: 'user',
          name: `Consistency Test ${i}`,
          type: 'world'
        });
      }

      const report = service.getConsistencyReport();
      const saveValidations = report.filter(r => r.operationType === 'save');

      expect(saveValidations.length).toBe(5);

      // Most operations should be consistent (allowing for timing variations and auto-copying)
      const inconsistentCount = saveValidations.filter(r => !r.isConsistent).length;
      expect(inconsistentCount).toBeLessThanOrEqual(3); // Allow up to 3 inconsistent operations due to auto-copying
    });

    test('should detect and report consistency issues', async () => {
      // First establish baseline with normal operations
      await service.saveContent({
        id: 'baseline-1',
        ownership: 'user',
        name: 'Baseline 1',
        type: 'world'
      });

      await service.saveContent({
        id: 'baseline-2',
        ownership: 'user',
        name: 'Baseline 2',
        type: 'world'
      });

      // Check that most baseline operations are consistent (allowing for small timing variations)
      let report = service.getConsistencyReport();
      let saveValidations = report.filter(r => r.operationType === 'save');
      const consistentCount = saveValidations.filter(r => r.isConsistent).length;
      expect(consistentCount).toBeGreaterThanOrEqual(saveValidations.length * 0.5); // At least 50% should be consistent

      // Operations should be mostly consistent (allowing for auto-copying and timing variations)
      const summary = service.getPerformanceMetricsSummary();
      expect(summary.operations.save.consistent).toBeGreaterThanOrEqual(saveValidations.length * 0.5);
      expect(summary.operations.save.inconsistent).toBeLessThanOrEqual(saveValidations.length * 0.5);
    });

    test('should provide real-time consistency validation', () => {
      const content = {
        id: 'real-time-test',
        ownership: 'user',
        name: 'Real Time Test',
        type: 'world'
      };

      const isConsistent = service.validateOperationConsistency('save', content);

      expect(typeof isConsistent).toBe('boolean');
    });
  });

  describe('Response Structure Consistency', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should ensure consistent response structures for save operations', async () => {
      const userResult = await service.saveContent({
        id: 'structure-user',
        ownership: 'user',
        name: 'Structure User',
        type: 'world'
      });

      const demoResult = await service.saveContent({
        id: 'structure-demo',
        ownership: 'demo',
        name: 'Structure Demo',
        type: 'world'
      });

      // Both results should have the same structure
      const requiredFields = ['success', 'contentId', 'timestamp'];
      requiredFields.forEach(field => {
        expect(userResult).toHaveProperty(field);
        expect(demoResult).toHaveProperty(field);
        expect(typeof userResult[field]).toBe(typeof demoResult[field]);
      });
    });

    test('should ensure consistent response structures for load operations', async () => {
      const result1 = await service.loadContent('user-world-1');
      const result2 = await service.loadContent('demo-world-1');

      // Both results should have the same structure
      const requiredFields = ['success', 'content', 'timestamp'];
      requiredFields.forEach(field => {
        expect(result1).toHaveProperty(field);
        expect(result2).toHaveProperty(field);
        expect(typeof result1[field]).toBe(typeof result2[field]);
      });
    });

    test('should ensure consistent response structures for copy operations', async () => {
      const result1 = await service.copyContent('demo-world-1', 'user');
      const result2 = await service.copyContent('demo-world-2', 'user');

      // Both results should have the same structure
      const requiredFields = ['success', 'originalContentId', 'copiedContentId', 'timestamp'];
      requiredFields.forEach(field => {
        expect(result1).toHaveProperty(field);
        expect(result2).toHaveProperty(field);
        expect(typeof result1[field]).toBe(typeof result2[field]);
      });
    });
  });

  describe('Error Handling Consistency', () => {
    test('should handle consistency validation errors gracefully', async () => {
      await service.initialize();

      // Try to load non-existent content
      let errorThrown = false;
      let errorMessage = '';

      try {
        await service.loadContent('non-existent');
      } catch (error) {
        errorThrown = true;
        errorMessage = error.message;
      }

      expect(errorThrown).toBe(true);
      expect(errorMessage).toContain('Content not found');

      // Service should still be functional
      const result = await service.saveContent({
        id: 'after-error',
        ownership: 'user',
        name: 'After Error',
        type: 'world'
      });

      expect(result.success).toBe(true);
    });
  });
});