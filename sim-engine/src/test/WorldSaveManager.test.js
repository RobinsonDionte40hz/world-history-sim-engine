/**
 * WorldSaveManager Tests
 * 
 * Tests the integrated world saving functionality that bridges
 * EditorStateManager and WorldPersistenceService.
 */

import worldSaveManager, { WorldSaveManager } from '../application/services/WorldSaveManager';
import editorStateManager from '../application/services/EditorStateManager';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('WorldSaveManager', () => {
  beforeEach(() => {
    // Reset all services
    editorStateManager.reset();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    
    // Reset save manager state
    worldSaveManager.disableAutoSave();
    worldSaveManager.saveInProgress = false;
  });

  describe('Basic Functionality', () => {
    test('should be a singleton instance', () => {
      expect(worldSaveManager).toBeInstanceOf(WorldSaveManager);
    });

    test('should provide save status information', () => {
      const status = worldSaveManager.getSaveStatus();
      
      expect(status).toHaveProperty('canSave');
      expect(status).toHaveProperty('hasUnsavedChanges');
      expect(status).toHaveProperty('saveStatus');
      expect(status).toHaveProperty('saveInProgress');
      expect(status).toHaveProperty('autoSaveEnabled');
    });

    test('should detect when world can be saved', () => {
      // Initially cannot save (no world data)
      expect(worldSaveManager.canSaveWorld()).toBe(false);
      
      // Add world data
      editorStateManager.updateEditorData('world', null, {
        name: 'Test World',
        description: 'A test world'
      });
      
      // Now should be able to save
      expect(worldSaveManager.canSaveWorld()).toBe(true);
    });
  });

  describe('World Saving Flow', () => {
    test('should execute complete save flow successfully', async () => {
      // Setup world data
      const worldData = {
        name: 'Test World',
        description: 'A test world for testing',
        rules: { timeProgression: 'manual' }
      };
      
      editorStateManager.updateEditorData('world', null, worldData);
      editorStateManager.setUnsavedChanges(true);
      
      // Mock localStorage for persistence
      localStorageMock.getItem.mockReturnValue('[]'); // Empty worlds list
      
      // Execute save
      const savedWorld = await worldSaveManager.saveWorld();
      
      // Verify save flow
      expect(savedWorld).toHaveProperty('id');
      expect(savedWorld.name).toBe(worldData.name);
      expect(savedWorld.description).toBe(worldData.description);
      
      // Verify editor state updates
      const editorState = editorStateManager.getState();
      expect(editorState.currentWorld).toEqual(savedWorld);
      expect(editorState.hasUnsavedChanges).toBe(false);
      expect(editorState.saveStatus).toBe('saved');
    });

    test('should handle save errors gracefully', async () => {
      // Setup invalid world data
      editorStateManager.updateEditorData('world', null, {
        name: '', // Invalid: empty name
        description: 'Test'
      });
      
      // Attempt save
      await expect(worldSaveManager.saveWorld()).rejects.toThrow();
      
      // Verify error state
      const editorState = editorStateManager.getState();
      expect(editorState.saveStatus).toBe('error');
    });

    test('should prevent concurrent saves', async () => {
      // Setup world data
      editorStateManager.updateEditorData('world', null, {
        name: 'Test World',
        description: 'A test world'
      });
      
      localStorageMock.getItem.mockReturnValue('[]');
      
      // Start first save
      const savePromise1 = worldSaveManager.saveWorld();
      
      // Attempt second save while first is in progress
      await expect(worldSaveManager.saveWorld()).rejects.toThrow('Save already in progress');
      
      // Wait for first save to complete
      await savePromise1;
    });

    test('should collect all editor data for saving', async () => {
      // Setup comprehensive world data
      editorStateManager.updateEditorData('world', null, {
        name: 'Test World',
        description: 'A test world'
      });
      
      editorStateManager.updateEditorData('nodes', 'node1', {
        name: 'Test Node',
        type: 'location'
      });
      
      editorStateManager.updateEditorData('characters', 'char1', {
        name: 'Test Character',
        attributes: { strength: 10 }
      });
      
      editorStateManager.updateEditorData('interactions', 'int1', {
        name: 'Test Interaction',
        type: 'dialogue'
      });
      
      localStorageMock.getItem.mockReturnValue('[]');
      
      // Save world
      const savedWorld = await worldSaveManager.saveWorld();
      
      // Verify all data was collected
      expect(savedWorld.nodes).toHaveLength(1);
      expect(savedWorld.characters).toHaveLength(1);
      expect(savedWorld.interactions).toHaveLength(1);
      expect(savedWorld.nodes[0].name).toBe('Test Node');
      expect(savedWorld.characters[0].name).toBe('Test Character');
      expect(savedWorld.interactions[0].name).toBe('Test Interaction');
    });
  });

  describe('World Loading Flow', () => {
    test('should execute complete load flow successfully', async () => {
      // First, save a world to ensure it exists
      const worldData = {
        name: 'Loaded World',
        description: 'A loaded world'
      };
      
      editorStateManager.updateEditorData('world', null, worldData);
      localStorageMock.getItem.mockReturnValue('[]'); // Empty worlds list initially
      
      // Save the world first
      const savedWorld = await worldSaveManager.saveWorld();
      
      // Reset editor state
      editorStateManager.reset();
      
      // Now mock the load
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === `worldHistorySimulator_world_${savedWorld.id}`) {
          return JSON.stringify(savedWorld);
        }
        if (key === 'worldHistorySimulator_worlds') {
          return JSON.stringify([{
            id: savedWorld.id,
            name: savedWorld.name,
            description: savedWorld.description
          }]);
        }
        return null;
      });
      
      // Load world
      const loadedWorld = await worldSaveManager.loadWorld(savedWorld.id);
      
      // Verify load results
      expect(loadedWorld.name).toBe('Loaded World');
      expect(loadedWorld.description).toBe('A loaded world');
      
      // Verify editor state was populated
      const worldEditorData = editorStateManager.getEditorData('world');
      expect(worldEditorData.name).toBe('Loaded World');
      
      // Verify editor state
      const editorState = editorStateManager.getState();
      expect(editorState.currentWorld.name).toBe('Loaded World');
      expect(editorState.hasUnsavedChanges).toBe(false);
      expect(editorState.saveStatus).toBe('saved');
    });

    test('should handle load errors gracefully', async () => {
      // Mock persistence service to throw error
      localStorageMock.getItem.mockReturnValue(null);
      
      // Attempt load
      await expect(worldSaveManager.loadWorld('nonexistent-world')).rejects.toThrow();
      
      // Verify error state
      const editorState = editorStateManager.getState();
      expect(editorState.saveStatus).toBe('error');
    });
  });

  describe('Node Saving', () => {
    test('should save node and update editor state', async () => {
      const nodeData = {
        name: 'Test Node',
        type: 'location',
        description: 'A test node'
      };
      
      localStorageMock.getItem.mockReturnValue('[]'); // Empty nodes list
      
      // Save node
      const savedNode = await worldSaveManager.saveNode('world-123', nodeData);
      
      // Verify node was saved
      expect(savedNode).toHaveProperty('id');
      expect(savedNode.name).toBe(nodeData.name);
      expect(savedNode.worldId).toBe('world-123');
      
      // Verify editor state was updated
      const nodesData = editorStateManager.getEditorData('nodes');
      expect(nodesData[savedNode.id]).toEqual(savedNode);
      
      // Verify unsaved changes flag
      const editorState = editorStateManager.getState();
      expect(editorState.hasUnsavedChanges).toBe(true);
    });
  });

  describe('Auto-Save Functionality', () => {
    test('should enable and disable auto-save', () => {
      // Initially disabled
      expect(worldSaveManager.getSaveStatus().autoSaveEnabled).toBe(false);
      
      // Enable auto-save
      worldSaveManager.enableAutoSave(5000);
      expect(worldSaveManager.getSaveStatus().autoSaveEnabled).toBe(true);
      
      // Disable auto-save
      worldSaveManager.disableAutoSave();
      expect(worldSaveManager.getSaveStatus().autoSaveEnabled).toBe(false);
    });

    test('should trigger auto-save when conditions are met', async () => {
      // Setup world data
      editorStateManager.updateEditorData('world', null, {
        name: 'Test World',
        description: 'A test world'
      });
      editorStateManager.setUnsavedChanges(true);
      
      localStorageMock.getItem.mockReturnValue('[]');
      
      // Enable auto-save
      worldSaveManager.enableAutoSave();
      
      // Trigger auto-save
      await worldSaveManager.triggerAutoSave();
      
      // Verify save occurred
      const editorState = editorStateManager.getState();
      expect(editorState.hasUnsavedChanges).toBe(false);
      expect(editorState.saveStatus).toBe('saved');
    });

    test('should not auto-save when conditions are not met', async () => {
      // No world data setup
      editorStateManager.setUnsavedChanges(true);
      
      // Enable auto-save
      worldSaveManager.enableAutoSave();
      
      // Trigger auto-save
      await worldSaveManager.triggerAutoSave();
      
      // Verify no save occurred (still has unsaved changes)
      const editorState = editorStateManager.getState();
      expect(editorState.hasUnsavedChanges).toBe(true);
    });
  });

  describe('World Management', () => {
    test('should create new world with proper initialization', async () => {
      const worldData = {
        name: 'New World',
        description: 'A brand new world'
      };
      
      localStorageMock.getItem.mockReturnValue('[]');
      
      // Create new world
      const newWorld = await worldSaveManager.createNewWorld(worldData);
      
      // Verify world was created
      expect(newWorld).toHaveProperty('id');
      expect(newWorld.name).toBe(worldData.name);
      
      // Verify editor state was reset and initialized
      const editorState = editorStateManager.getState();
      expect(editorState.currentEditor).toBe('world');
      expect(editorState.currentWorld).toEqual(newWorld);
      expect(editorState.hasUnsavedChanges).toBe(false);
    });

    test('should delete world and cleanup state', async () => {
      // Setup current world
      const worldData = { id: 'world-to-delete', name: 'Test World' };
      editorStateManager.setCurrentWorld(worldData);
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify([worldData]));
      
      // Delete world
      await worldSaveManager.deleteWorld('world-to-delete');
      
      // Verify editor state was reset
      const editorState = editorStateManager.getState();
      expect(editorState.currentWorld).toBe(null);
      expect(editorState.currentEditor).toBe(null);
    });
  });

  describe('Event Emission', () => {
    test('should emit events during save process', async () => {
      const saveStartedSpy = jest.fn();
      const saveCompletedSpy = jest.fn();
      
      worldSaveManager.on('saveStarted', saveStartedSpy);
      worldSaveManager.on('saveCompleted', saveCompletedSpy);
      
      // Setup world data
      editorStateManager.updateEditorData('world', null, {
        name: 'Test World',
        description: 'A test world'
      });
      
      localStorageMock.getItem.mockReturnValue('[]');
      
      // Save world
      const savedWorld = await worldSaveManager.saveWorld();
      
      // Verify events were emitted
      expect(saveStartedSpy).toHaveBeenCalled();
      expect(saveCompletedSpy).toHaveBeenCalledWith(savedWorld);
      
      // Cleanup
      worldSaveManager.off('saveStarted', saveStartedSpy);
      worldSaveManager.off('saveCompleted', saveCompletedSpy);
    });

    test('should emit error events on save failure', async () => {
      const saveErrorSpy = jest.fn();
      
      worldSaveManager.on('saveError', saveErrorSpy);
      
      // Setup invalid world data
      editorStateManager.updateEditorData('world', null, {
        name: '', // Invalid
        description: 'Test'
      });
      
      // Attempt save
      try {
        await worldSaveManager.saveWorld();
      } catch (error) {
        // Expected to throw
      }
      
      // Verify error event was emitted
      expect(saveErrorSpy).toHaveBeenCalled();
      
      // Cleanup
      worldSaveManager.off('saveError', saveErrorSpy);
    });
  });

  describe('Navigation Functionality', () => {
    test('should navigate to editor with auto-save', async () => {
      // Setup world data with unsaved changes
      editorStateManager.updateEditorData('world', null, {
        name: 'Test World',
        description: 'A test world'
      });
      editorStateManager.setCurrentEditor('world');
      editorStateManager.setUnsavedChanges(true);
      
      localStorageMock.getItem.mockReturnValue('[]');
      
      // Navigate to nodes editor with force save
      const result = await worldSaveManager.navigateToEditor('nodes', { forceSave: true });
      
      // Verify navigation succeeded
      expect(result).toBe(true);
      
      // Verify editor was changed
      const state = editorStateManager.getState();
      expect(state.currentEditor).toBe('nodes');
      expect(state.hasUnsavedChanges).toBe(false); // Should be saved
    });

    test('should prevent navigation to unavailable editor', async () => {
      // Reset to clean state (only world editor available)
      editorStateManager.reset();
      editorStateManager.setCurrentEditor('world');
      
      // Attempt to navigate to nodes (not available without world foundation)
      await expect(
        worldSaveManager.navigateToEditor('nodes')
      ).rejects.toThrow('Cannot navigate to nodes. Editor not available');
    });

    test('should get navigation context', () => {
      // Setup state
      editorStateManager.setCurrentEditor('world');
      editorStateManager.setCurrentWorld({ id: 'test-world', name: 'Test' });
      editorStateManager.setUnsavedChanges(true);
      
      const context = worldSaveManager.getNavigationContext();
      
      expect(context).toHaveProperty('currentEditor', 'world');
      expect(context).toHaveProperty('currentWorld');
      expect(context).toHaveProperty('availableEditors');
      expect(context).toHaveProperty('hasUnsavedChanges', true);
      expect(context).toHaveProperty('canNavigate');
      expect(context).toHaveProperty('navigationHistory');
    });

    test('should save current work before navigation', async () => {
      // Setup world data with unsaved changes
      editorStateManager.updateEditorData('world', null, {
        name: 'Test World',
        description: 'A test world'
      });
      editorStateManager.setUnsavedChanges(true);
      
      localStorageMock.getItem.mockReturnValue('[]');
      
      // Save current work
      const result = await worldSaveManager.saveCurrentWork();
      
      // Verify save occurred
      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Test World');
      
      // Verify unsaved changes cleared
      const state = editorStateManager.getState();
      expect(state.hasUnsavedChanges).toBe(false);
    });

    test('should emit navigation events', async () => {
      const navigationStartedSpy = jest.fn();
      const navigationCompletedSpy = jest.fn();
      
      worldSaveManager.on('navigationStarted', navigationStartedSpy);
      worldSaveManager.on('navigationCompleted', navigationCompletedSpy);
      
      // Setup world foundation
      editorStateManager.updateEditorData('world', null, {
        name: 'Test World',
        description: 'A test world'
      });
      editorStateManager.setCurrentEditor('world');
      
      // Navigate to nodes
      await worldSaveManager.navigateToEditor('nodes');
      
      // Verify events were emitted
      expect(navigationStartedSpy).toHaveBeenCalledWith({
        from: 'world',
        to: 'nodes'
      });
      
      expect(navigationCompletedSpy).toHaveBeenCalledWith({
        from: 'world',
        to: 'nodes',
        worldId: undefined // No world ID in this test
      });
      
      // Cleanup
      worldSaveManager.off('navigationStarted', navigationStartedSpy);
      worldSaveManager.off('navigationCompleted', navigationCompletedSpy);
    });

    test('should navigate with context preservation', () => {
      // Setup world context
      editorStateManager.setCurrentWorld({ id: 'test-world-123' });
      editorStateManager.setCurrentEditor('world');
      
      const contextualNavigationSpy = jest.fn();
      worldSaveManager.on('contextualNavigation', contextualNavigationSpy);
      
      // Mock navigate function
      const mockNavigate = jest.fn();
      
      // Navigate with context
      worldSaveManager.navigateWithContext('/editors/nodes', { navigate: mockNavigate });
      
      // Verify context was preserved
      expect(contextualNavigationSpy).toHaveBeenCalledWith({
        path: '/editors/nodes?worldId=test-world-123&fromEditor=world',
        worldId: 'test-world-123',
        fromEditor: 'world'
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/editors/nodes?worldId=test-world-123&fromEditor=world');
      
      // Cleanup
      worldSaveManager.off('contextualNavigation', contextualNavigationSpy);
    });
  });
});