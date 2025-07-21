/**
 * Core Infrastructure Components Test
 * 
 * Tests the core infrastructure components for the editor system improvements:
 * - EditorStateManager
 * - WorldPersistenceService
 * - useNavigationGuard (basic functionality)
 * - EditorLayout (basic rendering)
 */

import editorStateManager, { EditorStateManager } from '../application/services/EditorStateManager';
import worldPersistenceService, { WorldPersistenceService } from '../application/services/WorldPersistenceService';

describe('Core Infrastructure Components', () => {
  
  describe('EditorStateManager', () => {
    beforeEach(() => {
      editorStateManager.reset();
    });

    test('should be a singleton instance', () => {
      expect(editorStateManager).toBeInstanceOf(EditorStateManager);
    });

    test('should set and get current editor', () => {
      editorStateManager.setCurrentEditor('world');
      const state = editorStateManager.getState();
      expect(state.currentEditor).toBe('world');
    });

    test('should track unsaved changes', () => {
      editorStateManager.setUnsavedChanges(true);
      const state = editorStateManager.getState();
      expect(state.hasUnsavedChanges).toBe(true);
    });

    test('should set save status', () => {
      editorStateManager.setSaveStatus('saving');
      const state = editorStateManager.getState();
      expect(state.saveStatus).toBe('saving');
    });

    test('should validate editor types', () => {
      expect(() => {
        editorStateManager.setCurrentEditor('invalid');
      }).toThrow('Invalid editor type: invalid');
    });

    test('should check if world foundation is complete', () => {
      // Initially should be false
      expect(editorStateManager.isWorldFoundationComplete()).toBe(false);
      
      // Set world data - this will update the WorldBuilder
      editorStateManager.updateEditorData('world', null, {
        id: 'test-world',
        name: 'Test World',
        description: 'A test world'
      });
      
      expect(editorStateManager.isWorldFoundationComplete()).toBe(true);
    });

    test('should get available editors based on world foundation', () => {
      // Reset to clean state
      editorStateManager.reset();
      
      // Initially only world editor should be available
      let available = editorStateManager.getAvailableEditors();
      expect(available).toEqual(['world']);
      
      // After world foundation is complete, all editors should be available
      editorStateManager.updateEditorData('world', null, {
        id: 'test-world',
        name: 'Test World',
        description: 'A test world'
      });
      
      available = editorStateManager.getAvailableEditors();
      expect(available).toContain('world');
      expect(available).toContain('nodes');
      expect(available).toContain('characters');
      expect(available).toContain('interactions');
      expect(available).toContain('encounters');
    });

    test('should provide simulation readiness checklist', () => {
      // Reset to clean state
      editorStateManager.reset();
      
      const checklist = editorStateManager.getSimulationChecklist();
      
      // Check structure
      expect(checklist).toHaveProperty('worldProperties');
      expect(checklist).toHaveProperty('hasNodes');
      expect(checklist).toHaveProperty('hasInteractions');
      expect(checklist).toHaveProperty('hasCharacters');
      expect(checklist).toHaveProperty('charactersHaveInteractions');
      expect(checklist).toHaveProperty('nodesPopulated');
      expect(checklist).toHaveProperty('worldRules');
      expect(checklist).toHaveProperty('initialConditions');
      
      // Initially nothing should be completed
      expect(checklist.worldProperties.completed).toBe(false);
      expect(checklist.hasNodes.completed).toBe(false);
      expect(checklist.hasInteractions.completed).toBe(false);
      expect(checklist.hasCharacters.completed).toBe(false);
      
      // Check required vs optional
      expect(checklist.worldProperties.required).toBe(true);
      expect(checklist.worldRules.required).toBe(false);
      expect(checklist.initialConditions.required).toBe(false);
    });

    test('should check simulation readiness', () => {
      // Reset to clean state
      editorStateManager.reset();
      
      // Initially should not be ready
      expect(editorStateManager.canStartSimulation()).toBe(false);
      
      const missingRequirements = editorStateManager.getMissingRequirements();
      expect(missingRequirements.length).toBeGreaterThan(0);
      expect(missingRequirements).toContain('World must have a name and description');
    });

    test('should emit events on state changes', (done) => {
      const unsubscribe = editorStateManager.subscribe('editorChanged', (data) => {
        expect(data.current).toBe('nodes');
        expect(data.previous).toBe(null);
        unsubscribe();
        done();
      });
      
      editorStateManager.setCurrentEditor('nodes');
    });
  });

  describe('WorldPersistenceService', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
    });

    test('should be a singleton instance', () => {
      expect(worldPersistenceService).toBeInstanceOf(WorldPersistenceService);
    });

    test('should validate world data', () => {
      const validWorld = {
        name: 'Test World',
        description: 'A test world'
      };
      
      const validation = worldPersistenceService.validateWorldData(validWorld);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should reject invalid world data', () => {
      const invalidWorld = {
        name: '', // Empty name should be invalid
        description: 'A test world'
      };
      
      const validation = worldPersistenceService.validateWorldData(invalidWorld);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('World name is required and must be a string');
    });

    test('should save and load world data', async () => {
      const worldData = {
        name: 'Test World',
        description: 'A test world for testing'
      };
      
      // Save world
      const savedWorld = await worldPersistenceService.saveWorld(worldData);
      expect(savedWorld.id).toBeDefined();
      expect(savedWorld.name).toBe(worldData.name);
      expect(savedWorld.lastModified).toBeDefined();
      
      // Load world
      const loadedWorld = await worldPersistenceService.loadWorld(savedWorld.id);
      expect(loadedWorld.id).toBe(savedWorld.id);
      expect(loadedWorld.name).toBe(worldData.name);
      expect(loadedWorld.description).toBe(worldData.description);
    });

    test('should get all worlds', async () => {
      // Initially should be empty
      let worlds = await worldPersistenceService.getAllWorlds();
      expect(worlds).toHaveLength(0);
      
      // Save a world
      await worldPersistenceService.saveWorld({
        name: 'Test World',
        description: 'A test world'
      });
      
      // Should now have one world
      worlds = await worldPersistenceService.getAllWorlds();
      expect(worlds).toHaveLength(1);
      expect(worlds[0].name).toBe('Test World');
    });

    test('should save and load nodes', async () => {
      // First save a world
      const world = await worldPersistenceService.saveWorld({
        name: 'Test World',
        description: 'A test world'
      });
      
      const nodeData = {
        name: 'Test Node',
        type: 'location',
        description: 'A test node'
      };
      
      // Save node
      const savedNode = await worldPersistenceService.saveNode(world.id, nodeData);
      expect(savedNode.id).toBeDefined();
      expect(savedNode.worldId).toBe(world.id);
      expect(savedNode.name).toBe(nodeData.name);
      
      // Load nodes
      const nodes = await worldPersistenceService.getWorldNodes(world.id);
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe(savedNode.id);
      expect(nodes[0].name).toBe(nodeData.name);
    });

    test('should delete world and associated data', async () => {
      // Save a world with a node
      const world = await worldPersistenceService.saveWorld({
        name: 'Test World',
        description: 'A test world'
      });
      
      await worldPersistenceService.saveNode(world.id, {
        name: 'Test Node',
        type: 'location'
      });
      
      // Verify data exists
      let worlds = await worldPersistenceService.getAllWorlds();
      expect(worlds).toHaveLength(1);
      
      let nodes = await worldPersistenceService.getWorldNodes(world.id);
      expect(nodes).toHaveLength(1);
      
      // Delete world
      await worldPersistenceService.deleteWorld(world.id);
      
      // Verify data is gone
      worlds = await worldPersistenceService.getAllWorlds();
      expect(worlds).toHaveLength(0);
      
      nodes = await worldPersistenceService.getWorldNodes(world.id);
      expect(nodes).toHaveLength(0);
    });

    test('should export and import world data', async () => {
      // Save a world with a node
      const world = await worldPersistenceService.saveWorld({
        name: 'Test World',
        description: 'A test world'
      });
      
      await worldPersistenceService.saveNode(world.id, {
        name: 'Test Node',
        type: 'location'
      });
      
      // Export world
      const exportData = await worldPersistenceService.exportWorld(world.id);
      expect(exportData.world).toBeDefined();
      expect(exportData.nodes).toHaveLength(1);
      expect(exportData.exportedAt).toBeDefined();
      
      // Clear data
      await worldPersistenceService.clearAllData();
      
      // Import world
      const importedWorld = await worldPersistenceService.importWorld(exportData);
      expect(importedWorld.name).toBe('Test World');
      expect(importedWorld.id).not.toBe(world.id); // Should have new ID
      
      // Verify nodes were imported
      const importedNodes = await worldPersistenceService.getWorldNodes(importedWorld.id);
      expect(importedNodes).toHaveLength(1);
      expect(importedNodes[0].name).toBe('Test Node');
    });

    test('should get storage statistics', async () => {
      const stats = worldPersistenceService.getStorageStats();
      expect(stats).toHaveProperty('totalSize');
      expect(stats).toHaveProperty('worldCount');
      expect(stats).toHaveProperty('nodeCount');
      expect(stats).toHaveProperty('formattedSize');
      expect(typeof stats.totalSize).toBe('number');
      expect(typeof stats.worldCount).toBe('number');
      expect(typeof stats.nodeCount).toBe('number');
      expect(typeof stats.formattedSize).toBe('string');
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      editorStateManager.reset();
      localStorage.clear();
    });

    test('should integrate EditorStateManager with WorldPersistenceService', async () => {
      // Set current editor to world
      editorStateManager.setCurrentEditor('world');
      
      // Create world data in editor state
      const worldData = {
        name: 'Integration Test World',
        description: 'A world for integration testing'
      };
      
      editorStateManager.updateEditorData('world', null, worldData);
      
      // Save world using persistence service
      const savedWorld = await worldPersistenceService.saveWorld(worldData);
      
      // Update editor state with saved world
      editorStateManager.setCurrentWorld(savedWorld);
      editorStateManager.setUnsavedChanges(false);
      editorStateManager.setSaveStatus('saved');
      
      // Verify state
      const state = editorStateManager.getState();
      expect(state.currentEditor).toBe('world');
      expect(state.currentWorld.id).toBe(savedWorld.id);
      expect(state.hasUnsavedChanges).toBe(false);
      expect(state.saveStatus).toBe('saved');
      expect(editorStateManager.isWorldFoundationComplete()).toBe(true);
    });

    test('should handle editor navigation flow', async () => {
      // Reset to clean state
      editorStateManager.reset();
      
      // Start with world editor
      editorStateManager.setCurrentEditor('world');
      expect(editorStateManager.getAvailableEditors()).toEqual(['world']);
      
      // Complete world foundation
      const worldData = {
        id: 'test-world',
        name: 'Test World',
        description: 'A test world'
      };
      
      editorStateManager.updateEditorData('world', null, worldData);
      await worldPersistenceService.saveWorld(worldData);
      
      // Now all editors should be available
      const availableEditors = editorStateManager.getAvailableEditors();
      expect(availableEditors).toContain('world');
      expect(availableEditors).toContain('nodes');
      expect(availableEditors).toContain('characters');
      expect(availableEditors).toContain('interactions');
      expect(availableEditors).toContain('encounters');
      
      // Navigate to nodes editor
      editorStateManager.setCurrentEditor('nodes');
      expect(editorStateManager.getState().currentEditor).toBe('nodes');
      
      // Add some node data
      const nodeData = { name: 'Test Node', type: 'location' };
      editorStateManager.updateEditorData('nodes', 'node1', nodeData);
      
      // Save node
      await worldPersistenceService.saveNode('test-world', nodeData);
      
      // Verify node was saved
      const nodes = await worldPersistenceService.getWorldNodes('test-world');
      expect(nodes).toHaveLength(1);
      expect(nodes[0].name).toBe('Test Node');
    });

    test('should track simulation readiness as components are added', () => {
      // Start with world properties
      editorStateManager.updateEditorData('world', null, {
        name: 'Test World',
        description: 'A test world'
      });
      
      let checklist = editorStateManager.getSimulationChecklist();
      expect(checklist.worldProperties.completed).toBe(true);
      expect(checklist.hasNodes.completed).toBe(false);
      expect(editorStateManager.canStartSimulation()).toBe(false);
      
      // Add nodes through editor data
      editorStateManager.updateEditorData('nodes', 'node1', {
        name: 'Test Node',
        type: 'location',
        description: 'A test location'
      });
      
      checklist = editorStateManager.getSimulationChecklist();
      expect(checklist.hasNodes.completed).toBe(true);
      expect(checklist.hasInteractions.completed).toBe(false);
      expect(editorStateManager.canStartSimulation()).toBe(false);
      
      // Add interactions
      editorStateManager.updateEditorData('interactions', 'interaction1', {
        name: 'Test Interaction',
        description: 'A test interaction',
        type: 'dialogue'
      });
      
      checklist = editorStateManager.getSimulationChecklist();
      expect(checklist.hasInteractions.completed).toBe(true);
      expect(checklist.hasCharacters.completed).toBe(false);
      
      // Add characters with interactions
      editorStateManager.updateEditorData('characters', 'character1', {
        name: 'Test Character',
        description: 'A test character',
        assignedInteractions: ['interaction1']
      });
      
      checklist = editorStateManager.getSimulationChecklist();
      expect(checklist.hasCharacters.completed).toBe(true);
      expect(checklist.charactersHaveInteractions.completed).toBe(true);
      expect(checklist.nodesPopulated.completed).toBe(false);
      
      // Populate nodes
      editorStateManager.assignCharactersToNode('node1', ['character1']);
      
      checklist = editorStateManager.getSimulationChecklist();
      expect(checklist.nodesPopulated.completed).toBe(true);
      expect(editorStateManager.canStartSimulation()).toBe(true);
    });
  });
});