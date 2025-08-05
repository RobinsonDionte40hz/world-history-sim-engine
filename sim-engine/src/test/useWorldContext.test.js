/**
 * useWorldContext Tests
 * 
 * Tests the enhanced world context hook with immediate updates
 * and manual refresh capabilities.
 */

import { renderHook, act } from '@testing-library/react';
import { useWorldContext } from '../presentation/hooks/useWorldContext';
import editorStateManager from '../application/services/EditorStateManager';
import worldPersistenceService from '../application/services/WorldPersistenceService';

// Mock the services
jest.mock('../application/services/EditorStateManager');
jest.mock('../application/services/WorldPersistenceService');

describe('useWorldContext - Enhanced with Immediate Updates', () => {
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

  describe('Manual Refresh Capability', () => {
    test('should provide refreshWorldContext function', () => {
      const { result } = renderHook(() => useWorldContext());
      
      expect(result.current.refreshWorldContext).toBeDefined();
      expect(typeof result.current.refreshWorldContext).toBe('function');
    });

    test('should refresh world context when called manually', async () => {
      const mockWorld = {
        id: 'world-123',
        name: 'Test World',
        nodes: [{ id: 'node1', name: 'Test Node' }],
        characters: [{ id: 'char1', name: 'Test Character' }],
        interactions: [{ id: 'int1', name: 'Test Interaction' }],
        encounters: []
      };

      editorStateManager.getState.mockReturnValue({
        currentWorld: { id: 'world-123' },
        editorData: { world: mockWorld, nodes: {}, characters: {}, interactions: {}, encounters: {} }
      });
      
      worldPersistenceService.loadWorld.mockResolvedValue(mockWorld);

      const { result } = renderHook(() => useWorldContext());

      await act(async () => {
        await result.current.refreshWorldContext();
      });

      expect(worldPersistenceService.loadWorld).toHaveBeenCalledWith('world-123');
      expect(result.current.currentWorld).toEqual(mockWorld);
      expect(result.current.worldNodes).toEqual(mockWorld.nodes);
      expect(result.current.worldCharacters).toEqual(mockWorld.characters);
      expect(result.current.worldInteractions).toEqual(mockWorld.interactions);
    });

    test('should handle refresh errors gracefully', async () => {
      const error = new Error('Failed to load world');
      
      editorStateManager.getState.mockReturnValue({
        currentWorld: { id: 'world-123' },
        editorData: { world: null, nodes: {}, characters: {}, interactions: {}, encounters: {} }
      });
      
      worldPersistenceService.loadWorld.mockRejectedValue(error);

      const { result } = renderHook(() => useWorldContext());

      await act(async () => {
        await result.current.refreshWorldContext();
      });

      expect(result.current.error).toBe(error.message);
      expect(result.current.currentWorld).toBeNull();
    });
  });

  describe('Event Listening', () => {
    test('should subscribe to multiple editor state events', () => {
      renderHook(() => useWorldContext());

      expect(editorStateManager.subscribe).toHaveBeenCalledWith('worldChanged', expect.any(Function));
      expect(editorStateManager.subscribe).toHaveBeenCalledWith('editorDataChanged', expect.any(Function));
      expect(editorStateManager.subscribe).toHaveBeenCalledWith('saveStatusChanged', expect.any(Function));
    });

    test('should refresh on world changed event', async () => {
      let worldChangedCallback;
      editorStateManager.subscribe.mockImplementation((event, callback) => {
        if (event === 'worldChanged') {
          worldChangedCallback = callback;
        }
        return jest.fn(); // Return unsubscribe function
      });

      const mockWorld = {
        id: 'world-456',
        name: 'New World',
        nodes: [],
        characters: [],
        interactions: [],
        encounters: []
      };

      worldPersistenceService.loadWorld.mockResolvedValue(mockWorld);

      renderHook(() => useWorldContext());

      // Simulate world changed event
      editorStateManager.getState.mockReturnValue({
        currentWorld: { id: 'world-456' },
        editorData: { world: mockWorld, nodes: {}, characters: {}, interactions: {}, encounters: {} }
      });

      await act(async () => {
        await worldChangedCallback(mockWorld);
      });

      expect(worldPersistenceService.loadWorld).toHaveBeenCalledWith('world-456');
    });

    test('should refresh on save status changed to saved', async () => {
      let saveStatusCallback;
      editorStateManager.subscribe.mockImplementation((event, callback) => {
        if (event === 'saveStatusChanged') {
          saveStatusCallback = callback;
        }
        return jest.fn(); // Return unsubscribe function
      });

      const mockWorld = {
        id: 'world-789',
        name: 'Saved World',
        nodes: [],
        characters: [],
        interactions: [],
        encounters: []
      };

      editorStateManager.getState.mockReturnValue({
        currentWorld: { id: 'world-789' },
        editorData: { world: mockWorld, nodes: {}, characters: {}, interactions: {}, encounters: {} }
      });

      worldPersistenceService.loadWorld.mockResolvedValue(mockWorld);

      renderHook(() => useWorldContext());

      // Simulate save completed event
      await act(async () => {
        await saveStatusCallback({ status: 'saved' });
      });

      expect(worldPersistenceService.loadWorld).toHaveBeenCalledWith('world-789');
    });
  });

  describe('Sync with Editor State', () => {
    test('should provide syncWithEditorState function', () => {
      const { result } = renderHook(() => useWorldContext());
      
      expect(result.current.syncWithEditorState).toBeDefined();
      expect(typeof result.current.syncWithEditorState).toBe('function');
    });

    test('should sync with editor state without persistence call', () => {
      const mockWorldData = {
        id: 'world-sync',
        name: 'Sync World'
      };

      const mockNodesData = {
        'node1': { id: 'node1', name: 'Node 1' },
        'node2': { id: 'node2', name: 'Node 2' }
      };

      editorStateManager.getState.mockReturnValue({
        currentWorld: { id: 'world-sync' },
        editorData: {
          world: mockWorldData,
          nodes: mockNodesData,
          characters: {},
          interactions: {},
          encounters: {}
        }
      });

      const { result } = renderHook(() => useWorldContext());

      act(() => {
        result.current.syncWithEditorState();
      });

      expect(result.current.currentWorld).toEqual(mockWorldData);
      expect(result.current.worldNodes).toEqual(Object.values(mockNodesData));
      expect(worldPersistenceService.loadWorld).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    test('should unsubscribe from events on unmount', () => {
      const unsubscribeMocks = [jest.fn(), jest.fn(), jest.fn()];
      let callIndex = 0;
      
      editorStateManager.subscribe.mockImplementation(() => {
        return unsubscribeMocks[callIndex++];
      });

      const { unmount } = renderHook(() => useWorldContext());

      unmount();

      unsubscribeMocks.forEach(unsubscribe => {
        expect(unsubscribe).toHaveBeenCalled();
      });
    });

    test('should handle async WorldSaveManager unsubscribe safely', () => {
      // This test ensures that the async nature of WorldSaveManager import
      // doesn't cause errors during cleanup
      const { unmount } = renderHook(() => useWorldContext());

      // Should not throw error even if WorldSaveManager hasn't loaded yet
      expect(() => unmount()).not.toThrow();
    });
  });
});