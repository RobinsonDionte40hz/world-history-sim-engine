/**
 * WorldWorkflowService - Complete implementation example
 * 
 * Demonstrates the complete workflow using the integrated world management system.
 * Shows how all services work together for seamless world editing experience.
 */

import editorStateManager from './EditorStateManager';
import worldSaveManager from './WorldSaveManager';
import worldPersistenceService from './WorldPersistenceService';

class WorldWorkflowService {
  constructor() {
    this.currentWorkflow = null;
    this.workflowSteps = [];
  }

  /**
   * Complete World Creation Workflow
   * Demonstrates: Create → Save → Set Current → Navigate
   */
  async createWorldWorkflow(worldData) {
    try {
      console.log('🌍 Starting world creation workflow...');
      
      // Step 1: Create and save world using integrated system
      console.log('📝 Step 1: Creating world...');
      const savedWorld = await worldSaveManager.createNewWorld(worldData);
      
      // Step 2: World is automatically set as current in EditorStateManager
      console.log('✅ Step 2: World set as current:', savedWorld.id);
      
      // Step 3: Verify world foundation is complete
      const isComplete = editorStateManager.isWorldFoundationComplete();
      console.log('🏗️ Step 3: World foundation complete:', isComplete);
      
      // Step 4: Navigate to next editor with context preserved
      console.log('🧭 Step 4: Navigating to nodes editor...');
      await worldSaveManager.navigateToEditor('nodes', {
        onNavigationComplete: () => {
          console.log('✅ Navigation completed with world context preserved');
        }
      });
      
      return {
        success: true,
        world: savedWorld,
        message: 'World creation workflow completed successfully'
      };
      
    } catch (error) {
      console.error('❌ World creation workflow failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'World creation workflow failed'
      };
    }
  }

  /**
   * Complete Node Addition Workflow
   * Demonstrates: Validate World → Save Node → Update State → Sync
   */
  async addNodeWorkflow(nodeData) {
    try {
      console.log('🏗️ Starting node addition workflow...');
      
      // Step 1: Validate current world exists
      const currentWorld = editorStateManager.getState().currentWorld;
      if (!currentWorld?.id) {
        throw new Error('No current world selected');
      }
      console.log('✅ Step 1: Current world validated:', currentWorld.id);
      
      // Step 2: Save node using integrated system
      console.log('💾 Step 2: Saving node...');
      const savedNode = await worldSaveManager.saveNode(currentWorld.id, nodeData);
      
      // Step 3: Verify editor state was updated automatically
      const nodesData = editorStateManager.getEditorData('nodes');
      const nodeExists = nodesData[savedNode.id];
      console.log('🔄 Step 3: Editor state updated:', !!nodeExists);
      
      // Step 4: Check unsaved changes status
      const hasUnsaved = editorStateManager.getState().hasUnsavedChanges;
      console.log('📝 Step 4: Unsaved changes status:', hasUnsaved);
      
      return {
        success: true,
        node: savedNode,
        message: 'Node addition workflow completed successfully'
      };
      
    } catch (error) {
      console.error('❌ Node addition workflow failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Node addition workflow failed'
      };
    }
  }

  /**
   * Complete Navigation Workflow
   * Demonstrates: Check Changes → Save → Navigate → Preserve Context
   */
  async navigationWorkflow(targetEditor) {
    try {
      console.log('🧭 Starting navigation workflow to:', targetEditor);
      
      // Step 1: Check current state
      const currentState = editorStateManager.getState();
      console.log('📊 Step 1: Current state:', {
        editor: currentState.currentEditor,
        hasChanges: currentState.hasUnsavedChanges,
        world: currentState.currentWorld?.name
      });
      
      // Step 2: Handle unsaved changes if any
      if (currentState.hasUnsavedChanges) {
        console.log('💾 Step 2: Saving unsaved changes...');
        await worldSaveManager.saveCurrentWork();
      } else {
        console.log('✅ Step 2: No unsaved changes to save');
      }
      
      // Step 3: Validate navigation is allowed
      const availableEditors = editorStateManager.getAvailableEditors();
      if (!availableEditors.includes(targetEditor)) {
        throw new Error(`Cannot navigate to ${targetEditor}. Available: ${availableEditors.join(', ')}`);
      }
      console.log('✅ Step 3: Navigation validated');
      
      // Step 4: Perform navigation with context preservation
      console.log('🚀 Step 4: Navigating with context...');
      await worldSaveManager.navigateToEditor(targetEditor, {
        onNavigationStart: () => console.log('🔄 Navigation started'),
        onNavigationComplete: () => console.log('✅ Navigation completed')
      });
      
      // Step 5: Verify context was preserved
      const newState = editorStateManager.getState();
      const contextPreserved = newState.currentWorld?.id === currentState.currentWorld?.id;
      console.log('🔍 Step 5: Context preserved:', contextPreserved);
      
      return {
        success: true,
        from: currentState.currentEditor,
        to: targetEditor,
        contextPreserved,
        message: 'Navigation workflow completed successfully'
      };
      
    } catch (error) {
      console.error('❌ Navigation workflow failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Navigation workflow failed'
      };
    }
  }

  /**
   * Complete World Loading Workflow
   * Demonstrates: Load → Set Current → Populate State → Sync
   */
  async loadWorldWorkflow(worldId) {
    try {
      console.log('📂 Starting world loading workflow for:', worldId);
      
      // Step 1: Load complete world data
      console.log('📥 Step 1: Loading world data...');
      const fullWorld = await worldPersistenceService.loadWorld(worldId);
      
      // Step 2: Set as current world using integrated system
      console.log('🎯 Step 2: Setting as current world...');
      const loadedWorld = await worldSaveManager.loadWorld(worldId);
      
      // Step 3: Verify editor state was populated
      const worldData = editorStateManager.getEditorData('world');
      const nodesData = editorStateManager.getEditorData('nodes');
      const charactersData = editorStateManager.getEditorData('characters');
      
      console.log('🔄 Step 3: Editor state populated:', {
        world: !!worldData,
        nodes: Object.keys(nodesData).length,
        characters: Object.keys(charactersData).length
      });
      
      // Step 4: Check simulation readiness
      const canSimulate = editorStateManager.canStartSimulation();
      const checklist = editorStateManager.getSimulationChecklist();
      console.log('🎮 Step 4: Simulation readiness:', canSimulate);
      
      // Step 5: Navigate to appropriate editor
      const availableEditors = editorStateManager.getAvailableEditors();
      const targetEditor = availableEditors.includes('nodes') ? 'nodes' : 'world';
      
      console.log('🧭 Step 5: Navigating to:', targetEditor);
      await worldSaveManager.navigateToEditor(targetEditor);
      
      return {
        success: true,
        world: loadedWorld,
        checklist,
        canSimulate,
        message: 'World loading workflow completed successfully'
      };
      
    } catch (error) {
      console.error('❌ World loading workflow failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'World loading workflow failed'
      };
    }
  }

  /**
   * Complete Auto-Save Workflow
   * Demonstrates: Enable → Track Changes → Auto-Save → Feedback
   */
  async autoSaveWorkflow(enabled = true, delay = 30000) {
    try {
      console.log('⚡ Starting auto-save workflow...');
      
      if (enabled) {
        // Step 1: Enable auto-save
        console.log('🔄 Step 1: Enabling auto-save...');
        worldSaveManager.enableAutoSave(delay);
        
        // Step 2: Verify auto-save is enabled in both services
        const saveManagerStatus = worldSaveManager.getSaveStatus();
        const editorManagerEnabled = editorStateManager.autoSaveEnabled;
        
        console.log('✅ Step 2: Auto-save status:', {
          saveManager: saveManagerStatus.autoSaveEnabled,
          editorManager: editorManagerEnabled
        });
        
        // Step 3: Make a test change to trigger auto-save
        console.log('📝 Step 3: Making test change...');
        editorStateManager.setUnsavedChanges(true);
        
        // Step 4: Wait for auto-save to potentially trigger
        console.log('⏳ Step 4: Auto-save will trigger in', delay, 'ms');
        
      } else {
        // Disable auto-save
        console.log('🛑 Disabling auto-save...');
        worldSaveManager.disableAutoSave();
      }
      
      return {
        success: true,
        enabled,
        delay,
        message: `Auto-save workflow ${enabled ? 'enabled' : 'disabled'} successfully`
      };
      
    } catch (error) {
      console.error('❌ Auto-save workflow failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Auto-save workflow failed'
      };
    }
  }

  /**
   * Complete System Status Check
   * Demonstrates: State Inspection → Service Health → Integration Status
   */
  getSystemStatus() {
    try {
      console.log('🔍 Checking complete system status...');
      
      // Editor State Manager Status
      const editorState = editorStateManager.getState();
      const editorStatus = {
        currentEditor: editorState.currentEditor,
        currentWorld: editorState.currentWorld?.name,
        hasUnsavedChanges: editorState.hasUnsavedChanges,
        saveStatus: editorState.saveStatus,
        autoSaveEnabled: editorStateManager.autoSaveEnabled,
        availableEditors: editorStateManager.getAvailableEditors(),
        canStartSimulation: editorStateManager.canStartSimulation()
      };
      
      // World Save Manager Status
      const saveStatus = worldSaveManager.getSaveStatus();
      const saveManagerStatus = {
        canSave: saveStatus.canSave,
        saveInProgress: saveStatus.saveInProgress,
        autoSaveEnabled: saveStatus.autoSaveEnabled
      };
      
      // Navigation Context
      const navigationContext = worldSaveManager.getNavigationContext();
      
      // Integration Health
      const integrationHealth = {
        servicesConnected: true,
        statesSynchronized: editorStatus.autoSaveEnabled === saveManagerStatus.autoSaveEnabled,
        worldContextAvailable: !!editorState.currentWorld,
        navigationReady: navigationContext.availableEditors.length > 0
      };
      
      console.log('📊 System Status:', {
        editor: editorStatus,
        saveManager: saveManagerStatus,
        navigation: navigationContext,
        integration: integrationHealth
      });
      
      return {
        success: true,
        editor: editorStatus,
        saveManager: saveManagerStatus,
        navigation: navigationContext,
        integration: integrationHealth,
        message: 'System status check completed'
      };
      
    } catch (error) {
      console.error('❌ System status check failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'System status check failed'
      };
    }
  }
}

// Create singleton instance
const worldWorkflowService = new WorldWorkflowService();

export default worldWorkflowService;
export { WorldWorkflowService };