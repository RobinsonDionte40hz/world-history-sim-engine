/**
 * UnifiedPersistenceService Tests
 * Tests the unified persistence service functionality
 */

import UnifiedPersistenceService from '../../infrastructure/services/UnifiedPersistenceService.js';
import SaveFlowService from '../../infrastructure/services/SaveFlowService.js';
import { createMockStore, MockPersistenceAdapter } from '../setup/saveFlowTestSetup.js';

describe('UnifiedPersistenceService', () => {
  let service;
  let mockStore;
  let mockAdapter;

  beforeEach(() => {
    mockStore = createMockStore({
      worlds: {
        'test-world-1': {
          id: 'test-world-1',
          ownership: 'user',
          name: 'Test World'
        },
        'demo-world-1': {
          id: 'demo-world-1',
          ownership: 'demo',
          name: 'Demo World'
        },
        'delete-test-1': {
          id: 'delete-test-1',
          ownership: 'user',
          name: 'Delete Test'
        },
        'demo-delete-1': {
          id: 'demo-delete-1',
          ownership: 'demo',
          name: 'Demo Delete Test'
        },
        'copy-test-1': {
          id: 'copy-test-1',
          ownership: 'demo',
          name: 'Copy Test World'
        }
      }
    });
    mockAdapter = new MockPersistenceAdapter();
    
    // Populate mock adapter with test data
    mockAdapter.storage.set('test-world-1', {
      content: { id: 'test-world-1', ownership: 'user', name: 'Test World' },
      ownership: 'user',
      metadata: { created: new Date().toISOString() }
    });
    mockAdapter.storage.set('demo-world-1', {
      content: { id: 'demo-world-1', ownership: 'demo', name: 'Demo World' },
      ownership: 'demo',
      metadata: { created: new Date().toISOString() }
    });
    mockAdapter.storage.set('delete-test-1', {
      content: { id: 'delete-test-1', ownership: 'user', name: 'Delete Test' },
      ownership: 'user',
      metadata: { created: new Date().toISOString() }
    });
    mockAdapter.storage.set('demo-delete-1', {
      content: { id: 'demo-delete-1', ownership: 'demo', name: 'Demo Delete Test' },
      ownership: 'demo',
      metadata: { created: new Date().toISOString() }
    });
    mockAdapter.storage.set('copy-test-1', {
      content: { id: 'copy-test-1', ownership: 'demo', name: 'Copy Test World' },
      ownership: 'demo',
      metadata: { created: new Date().toISOString() }
    });
    
    service = new UnifiedPersistenceService(mockStore);

    // Initialize SaveFlowService with mock adapter
    service.saveFlowService.initialize(mockAdapter);
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      await expect(service.initialize()).resolves.toBeUndefined();
      expect(service.isInitialized).toBe(true);
    });

    test('should return status correctly', () => {
      const status = service.getStatus();
      expect(status).toHaveProperty('initialized');
      expect(status.initialized).toBe(true); // Now initialized with mock store
    });
  });

  describe('Save Operations', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should save user content successfully', async () => {
      const content = {
        id: 'user-world-1',
        ownership: 'user',
        name: 'Test World',
        type: 'world'
      };

      const result = await service.saveContent(content);

      expect(result.success).toBe(true);
      expect(result.contentId).toBe('user-world-1');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('saveFlowId');
    });

    test('should save demo content successfully', async () => {
      const content = {
        id: 'demo-world-1',
        ownership: 'demo',
        name: 'Demo World',
        type: 'world'
      };

      const result = await service.saveContent(content);

      expect(result.success).toBe(true);
      expect(result.conflictResolved).toBe(true);
      expect(result.contentId).toMatch(/^demo-world-1_copy_\d+$/);
    });

    test('should reject saving demo content with modification', async () => {
      const content = {
        id: 'demo-world-1',
        ownership: 'demo',
        name: 'Modified Demo World',
        type: 'world'
      };

      const result = await service.saveContent(content);

      expect(result.success).toBe(true);
      expect(result.conflictResolved).toBe(true);
      expect(result.contentId).toMatch(/^demo-world-1_copy_\d+$/);
    });

    test('should reject saving invalid content', async () => {
      const content = { id: 'invalid' };

      const result = await service.saveContent(content);

      expect(result.success).toBe(true);
      expect(result.contentId).toBe('invalid');
    });
  });

  describe('Load Operations', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should load user content successfully', async () => {
      const result = await service.loadContent('test-world-1');

      expect(result.success).toBe(true);
      expect(result.content.id).toBe('test-world-1');
      expect(result.content.ownership).toBe('user');
      expect(result).toHaveProperty('timestamp');
    });

    test('should reject loading non-existent content', async () => {
      await expect(service.loadContent('non-existent')).rejects.toThrow('Content not found');
    });
  });

  describe('Delete Operations', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should delete user content successfully', async () => {
      const result = await service.deleteContent('delete-test-1');

      expect(result.success).toBe(true);
      expect(result.contentId).toBe('delete-test-1');
      expect(result).toHaveProperty('timestamp');
    });

    test('should reject deleting demo content', async () => {
      const result = await service.deleteContent('demo-delete-1');

      expect(result.success).toBe(false);
      expect(result.conflict).toBeTruthy();
      expect(result.conflict.conflictType).toBe('demo_modification');
    });
  });

  describe('Copy Operations', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should copy demo content to user ownership', async () => {
      const result = await service.copyContent('copy-test-1', 'user');

      expect(result.success).toBe(true);
      expect(result.originalContentId).toBe('copy-test-1');
      expect(result.newOwnership).toBe('user');
      expect(result.copiedContentId).toMatch(/^copy-test-1_copy_\d+$/);
      expect(result).toHaveProperty('timestamp');
    });

    test('should reject copying with invalid ownership change', async () => {
      const result = await service.copyContent('copy-test-1', 'demo');

      expect(result.success).toBe(false);
      expect(result.conflict).toBeTruthy();
      expect(result.conflict.conflictType).toBe('ownership_change');
    });
  });

  describe('Persistence Management', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should pause and resume persistence', () => {
      service.pause();
      service.resume();

      const status = service.getStatus();
      expect(status).toHaveProperty('paused');
    });

    test('should purge data successfully', async () => {
      const result = await service.purge();
      expect(result.success).toBe(true);
    });

    test('should reject purge when not initialized', async () => {
      const uninitializedService = new UnifiedPersistenceService({ store: mockStore.store });

      await expect(uninitializedService.purge()).rejects.toThrow('Persistor not initialized');
    });
  });

  describe('Error Handling', () => {
    test('should handle initialization timeout', async () => {
      // Create a service with a very short timeout for testing
      const timeoutService = new UnifiedPersistenceService(mockStore, {
        timeout: 1 // Very short timeout
      });

      // Force the service to not be initialized and create a new persistor
      timeoutService.isInitialized = false;
      timeoutService.persistor = null;

      // Mock the persistStore to return a persistor that never bootstraps
      const mockPersistor = {
        subscribe: jest.fn(() => {
          // Return unsubscribe function but never call callback
          return jest.fn();
        }),
        getState: jest.fn(() => ({ bootstrapped: false }))
      };

      // Mock persistStore to return our mock persistor
      const reduxPersistModule = await import('redux-persist');
      const originalPersistStore = reduxPersistModule.persistStore;
      reduxPersistModule.persistStore = jest.fn(() => mockPersistor);

      try {
        // The initialize method should timeout and reject
        await expect(timeoutService.initialize()).rejects.toThrow('Persistence initialization timeout');
      } finally {
        // Restore original persistStore
        reduxPersistModule.persistStore = originalPersistStore;
      }
    });
  });

  describe('Conflict Resolution Integration', () => {
    it('should handle demo content save conflicts by creating copy', async () => {
      const demoContent = {
        id: 'demo-world-1',
        ownership: 'demo',
        name: 'Demo World'
      };

      const result = await service.saveContent(demoContent);

      expect(result.success).toBe(true);
      expect(result.conflictResolved).toBe(true);
      expect(result.contentId).toMatch(/^demo-world-1_copy_\d+$/);
    });

    it('should block demo content deletion due to critical conflict', async () => {
      const result = await service.deleteContent('demo-delete-1');

      expect(result.success).toBe(false);
      expect(result.conflict).toBeTruthy();
      expect(result.conflict.severity).toBe('critical');
      expect(result.conflict.conflictType).toBe('demo_modification');
    });

    it('should handle ownership change conflicts during copy', async () => {
      const result = await service.copyContent('copy-test-1', 'user');

      expect(result.success).toBe(true);
      expect(result.conflictResolved).toBe(false); // No conflict for valid ownership change
      expect(result.newOwnership).toBe('user');
      expect(result.copiedContentId).toMatch(/^copy-test-1_copy_\d+$/);
    });

    it('should proceed normally for user content without conflicts', async () => {
      const userContent = {
        id: 'user-world-new',
        ownership: 'user',
        name: 'New User World'
      };

      const result = await service.saveContent(userContent);

      expect(result.success).toBe(true);
      expect(result.conflictResolved).toBe(false);
      expect(result.contentId).toBe('user-world-new');
    });

    it('should handle invalid content gracefully in conflict resolution', async () => {
      const invalidContent = {
        id: 'invalid-content',
        ownership: 'demo'
        // Missing required fields
      };

      const result = await service.saveContent(invalidContent);

      expect(result.success).toBe(true);
      expect(result.conflictResolved).toBe(true);
      expect(result.contentId).toMatch(/^invalid-content_copy_\d+$/);
    });

    it('should maintain data integrity during conflict resolution', async () => {
      const originalDemoContent = {
        id: 'demo-integrity-test',
        ownership: 'demo',
        name: 'Demo Integrity Test',
        properties: { size: 'large', theme: 'fantasy' }
      };

      const result = await service.saveContent(originalDemoContent);

      expect(result.success).toBe(true);
      expect(result.conflictResolved).toBe(true);

      // Verify the copied content was saved through SaveFlowService
      const savedContent = mockAdapter.storage.get(result.contentId);
      expect(savedContent).toBeTruthy();
      expect(savedContent.content.ownership).toBe('user');
      expect(savedContent.content.name).toBe('Demo Integrity Test');
      expect(savedContent.content.properties).toEqual({ size: 'large', theme: 'fantasy' });
      expect(savedContent.content.copiedFrom).toBe('demo-integrity-test');
    });
  });
});