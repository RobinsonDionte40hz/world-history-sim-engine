/**
 * useWorldContext Cleanup Tests
 * 
 * Specific tests for the cleanup functionality to ensure
 * the unsubscribeSaveManager error is fixed.
 */

import { renderHook } from '@testing-library/react';
import { useWorldContext } from '../presentation/hooks/useWorldContext';
import editorStateManager from '../application/services/EditorStateManager';
import worldPersistenceService from '../application/services/WorldPersistenceService';

// Mock the services
jest.mock('../application/services/EditorStateManager');
jest.mock('../application/services/WorldPersistenceService');

describe('useWorldContext - Cleanup Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    editorStateManager.getState = jest.fn(() => ({
      currentWorld: null,
      editorData: {
        world: null,
        nodes: {},
        characters: {},
        interactions: {},
        encounters: {}
      }
    }));
    
    editorStateManager.subscribe = jest.fn(() => jest.fn()); // Return unsubscribe function
    worldPersistenceService.loadWorld = jest.fn();
  });

  test('should not throw error when unmounting before WorldSaveManager loads', () => {
    // This test specifically addresses the unsubscribeSaveManager error
    const { unmount } = renderHook(() => useWorldContext());

    // Should not throw "unsubscribeSaveManager is not a function" error
    expect(() => unmount()).not.toThrow();
  });

  test('should handle multiple rapid mount/unmount cycles safely', () => {
    // Test rapid mounting and unmounting to ensure no race conditions
    for (let i = 0; i < 5; i++) {
      const { unmount } = renderHook(() => useWorldContext());
      expect(() => unmount()).not.toThrow();
    }
  });

  test('should properly clean up all subscriptions', () => {
    const unsubscribeMocks = [jest.fn(), jest.fn(), jest.fn()];
    let callIndex = 0;
    
    editorStateManager.subscribe.mockImplementation(() => {
      return unsubscribeMocks[callIndex++];
    });

    const { unmount } = renderHook(() => useWorldContext());

    // Unmount should not throw
    expect(() => unmount()).not.toThrow();

    // All unsubscribe functions should have been called
    unsubscribeMocks.forEach(unsubscribe => {
      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  test('should handle WorldSaveManager import failure gracefully', () => {
    // Mock dynamic import to fail
    const originalImport = global.import;
    global.import = jest.fn().mockRejectedValue(new Error('Import failed'));

    const { unmount } = renderHook(() => useWorldContext());

    // Should not throw error even if import fails
    expect(() => unmount()).not.toThrow();

    // Restore original import
    global.import = originalImport;
  });
});