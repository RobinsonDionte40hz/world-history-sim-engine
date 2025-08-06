/**
 * Debug World Flow Utility
 * 
 * Provides debugging tools to verify data flow through the world management system.
 * Helps troubleshoot issues with world saving, loading, and state management.
 */

import editorStateManager from '../../application/services/EditorStateManager';
import worldPersistenceService from '../../application/services/WorldPersistenceService';

/**
 * Debug helper to verify the complete data flow
 */
export const debugWorldFlow = () => {
  console.group('🌍 World Data Flow Debug');
  
  try {
    // 1. Check Editor State Manager
    const state = editorStateManager.getState();
    console.log('📊 Current Editor State:', {
      currentWorld: state.currentWorld,
      hasUnsavedChanges: state.hasUnsavedChanges,
      saveStatus: state.saveStatus,
      currentEditor: state.currentEditor,
      worldData: state.editorData.world,
      nodesCount: Object.keys(state.editorData.nodes || {}).length,
      charactersCount: Object.keys(state.editorData.characters || {}).length,
      interactionsCount: Object.keys(state.editorData.interactions || {}).length,
      encountersCount: Object.keys(state.editorData.encounters || {}).length
    });

    // 2. Check localStorage - Worlds List
    const worldsKey = 'worldHistorySimulator_worlds';
    const worldsData = localStorage.getItem(worldsKey);
    const worlds = worldsData ? JSON.parse(worldsData) : [];
    console.log('💾 Stored Worlds List:', worlds);

    // 3. Check current world in localStorage
    if (state.currentWorld?.id) {
      const worldKey = `worldHistorySimulator_world_${state.currentWorld.id}`;
      const storedWorldData = localStorage.getItem(worldKey);
      const storedWorld = storedWorldData ? JSON.parse(storedWorldData) : null;
      
      console.log('🗂️ Current World in Storage:', {
        key: worldKey,
        exists: !!storedWorldData,
        data: storedWorld,
        dataStructure: storedWorld ? {
          hasId: !!storedWorld.id,
          hasName: !!storedWorld.name,
          hasDescription: !!storedWorld.description,
          hasNodes: Array.isArray(storedWorld.nodes),
          nodesCount: storedWorld.nodes?.length || 0,
          hasCharacters: Array.isArray(storedWorld.characters),
          charactersCount: storedWorld.characters?.length || 0,
          hasInteractions: Array.isArray(storedWorld.interactions),
          interactionsCount: storedWorld.interactions?.length || 0,
          hasEncounters: Array.isArray(storedWorld.encounters),
          encountersCount: storedWorld.encounters?.length || 0,
          hasRules: typeof storedWorld.rules === 'object',
          hasInitialConditions: typeof storedWorld.initialConditions === 'object',
          hasNodePopulations: typeof storedWorld.nodePopulations === 'object',
          version: storedWorld.version,
          lastModified: storedWorld.lastModified,
          currentStep: storedWorld.currentStep,
          isComplete: storedWorld.isComplete,
          isValid: storedWorld.isValid
        } : null
      });

      // 4. Compare editor state vs stored data
      if (storedWorld && state.currentWorld) {
        const differences = compareWorldData(state.currentWorld, storedWorld);
        if (differences.length > 0) {
          console.warn('⚠️ Differences between editor state and stored data:', differences);
        } else {
          console.log('✅ Editor state and stored data are in sync');
        }
      }
    } else {
      console.log('ℹ️ No current world selected');
    }

    // 5. Check WorldBuilder state
    if (editorStateManager.worldBuilder) {
      const worldBuilderConfig = editorStateManager.worldBuilder.worldConfig;
      console.log('🏗️ WorldBuilder State:', {
        currentStep: editorStateManager.worldBuilder.currentStep,
        worldConfig: worldBuilderConfig,
        isValid: worldBuilderConfig?.isValid,
        isComplete: worldBuilderConfig?.isComplete
      });
    }

    // 6. Check all localStorage keys related to world simulation
    const allKeys = Object.keys(localStorage);
    const worldKeys = allKeys.filter(key => key.startsWith('worldHistorySimulator_'));
    console.log('🔑 All World-Related Storage Keys:', worldKeys);

  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
  
  console.groupEnd();
};

/**
 * Compare two world data objects and return differences
 */
const compareWorldData = (world1, world2) => {
  const differences = [];
  
  // Compare basic properties
  const basicProps = ['id', 'name', 'description', 'version', 'lastModified', 'currentStep', 'isComplete', 'isValid'];
  basicProps.forEach(prop => {
    if (world1[prop] !== world2[prop]) {
      differences.push({
        property: prop,
        editorValue: world1[prop],
        storedValue: world2[prop]
      });
    }
  });

  // Compare array lengths
  const arrayProps = ['nodes', 'characters', 'interactions', 'encounters'];
  arrayProps.forEach(prop => {
    const len1 = world1[prop]?.length || 0;
    const len2 = world2[prop]?.length || 0;
    if (len1 !== len2) {
      differences.push({
        property: `${prop}.length`,
        editorValue: len1,
        storedValue: len2
      });
    }
  });

  return differences;
};

/**
 * Debug specific world by ID
 */
export const debugWorldById = (worldId) => {
  console.group(`🌍 Debug World: ${worldId}`);
  
  try {
    const worldKey = `worldHistorySimulator_world_${worldId}`;
    const storedWorldData = localStorage.getItem(worldKey);
    
    if (!storedWorldData) {
      console.error('❌ World not found in storage');
      return;
    }

    const storedWorld = JSON.parse(storedWorldData);
    console.log('📋 World Data:', storedWorld);
    
    // Validate structure
    const validation = worldPersistenceService.validateWorldData(storedWorld);
    console.log('✅ Validation Result:', validation);
    
    // Check completeness
    const completeWorld = worldPersistenceService.ensureCompleteWorldStructure(storedWorld);
    const wasIncomplete = JSON.stringify(storedWorld) !== JSON.stringify(completeWorld);
    
    if (wasIncomplete) {
      console.warn('⚠️ World data was incomplete, here\'s the complete version:', completeWorld);
    } else {
      console.log('✅ World data structure is complete');
    }

  } catch (error) {
    console.error('❌ Error debugging world:', error);
  }
  
  console.groupEnd();
};

/**
 * Debug the save/load cycle
 */
export const debugSaveLoadCycle = async () => {
  console.group('🔄 Debug Save/Load Cycle');
  
  try {
    const state = editorStateManager.getState();
    
    if (!state.currentWorld) {
      console.error('❌ No current world to test save/load cycle');
      return;
    }

    console.log('1️⃣ Starting with current world:', state.currentWorld);

    // Test save
    console.log('2️⃣ Testing save...');
    const savedWorld = await worldPersistenceService.saveWorld(state.currentWorld);
    console.log('💾 Saved world:', savedWorld);

    // Test load
    console.log('3️⃣ Testing load...');
    const loadedWorld = await worldPersistenceService.loadWorld(savedWorld.id);
    console.log('📂 Loaded world:', loadedWorld);

    // Compare
    const areSame = JSON.stringify(savedWorld) === JSON.stringify(loadedWorld);
    if (areSame) {
      console.log('✅ Save/Load cycle successful - data is identical');
    } else {
      console.warn('⚠️ Save/Load cycle has differences:', {
        saved: savedWorld,
        loaded: loadedWorld
      });
    }

  } catch (error) {
    console.error('❌ Error during save/load cycle test:', error);
  }
  
  console.groupEnd();
};

/**
 * Debug world context hook state
 */
export const debugWorldContext = () => {
  console.group('🎣 Debug World Context Hook');
  
  try {
    // This would need to be called from within a component that uses useWorldContext
    console.log('ℹ️ This function should be called from within a React component that uses useWorldContext');
    console.log('Example usage in component:');
    console.log(`
      const worldContext = useWorldContext();
      console.log('World Context State:', {
        currentWorld: worldContext.currentWorld,
        worldNodes: worldContext.worldNodes,
        worldCharacters: worldContext.worldCharacters,
        worldInteractions: worldContext.worldInteractions,
        isLoading: worldContext.isLoading,
        error: worldContext.error,
        hasWorld: worldContext.hasWorld
      });
    `);
  } catch (error) {
    console.error('❌ Error debugging world context:', error);
  }
  
  console.groupEnd();
};

/**
 * Clear all world data (for testing purposes)
 */
export const clearAllWorldData = () => {
  console.group('🗑️ Clear All World Data');
  
  try {
    const allKeys = Object.keys(localStorage);
    const worldKeys = allKeys.filter(key => key.startsWith('worldHistorySimulator_'));
    
    console.log('🔑 Found world keys to remove:', worldKeys);
    
    worldKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`❌ Removed: ${key}`);
    });
    
    // Reset editor state
    editorStateManager.reset();
    console.log('🔄 Reset editor state');
    
    console.log('✅ All world data cleared');
  } catch (error) {
    console.error('❌ Error clearing world data:', error);
  }
  
  console.groupEnd();
};

/**
 * Export all world data for backup
 */
export const exportWorldData = () => {
  console.group('📤 Export World Data');
  
  try {
    const allKeys = Object.keys(localStorage);
    const worldKeys = allKeys.filter(key => key.startsWith('worldHistorySimulator_'));
    
    const exportData = {};
    worldKeys.forEach(key => {
      const data = localStorage.getItem(key);
      exportData[key] = data ? JSON.parse(data) : null;
    });
    
    console.log('📋 Exported world data:', exportData);
    
    // Create downloadable JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `world-data-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    console.log('💾 Export file downloaded');
  } catch (error) {
    console.error('❌ Error exporting world data:', error);
  }
  
  console.groupEnd();
};

/**
 * Simple debug helper as requested - minimal version for quick debugging
 */
export const simpleDebugWorldFlow = () => {
  const state = editorStateManager.getState();
  console.log('Current Editor State:', {
    currentWorld: state.currentWorld,
    hasUnsavedChanges: state.hasUnsavedChanges,
    worldData: state.editorData.world
  });

  // Check localStorage
  const worlds = localStorage.getItem('worldHistorySimulator_worlds');
  console.log('Stored Worlds:', JSON.parse(worlds || '[]'));

  // Check current world in localStorage
  if (state.currentWorld?.id) {
    const worldKey = `worldHistorySimulator_world_${state.currentWorld.id}`;
    const worldData = localStorage.getItem(worldKey);
    console.log('Stored World Data:', JSON.parse(worldData || '{}'));
  }
};

// Make debug functions available globally for easy access in browser console
if (typeof window !== 'undefined') {
  window.debugWorldFlow = debugWorldFlow;
  window.debugWorldById = debugWorldById;
  window.debugSaveLoadCycle = debugSaveLoadCycle;
  window.debugWorldContext = debugWorldContext;
  window.clearAllWorldData = clearAllWorldData;
  window.exportWorldData = exportWorldData;
  window.simpleDebugWorldFlow = simpleDebugWorldFlow; // Add the simple version
  
  console.log('🛠️ World debug utilities loaded. Available functions:');
  console.log('- debugWorldFlow() - Complete data flow analysis');
  console.log('- debugWorldById(id) - Debug specific world');
  console.log('- debugSaveLoadCycle() - Test save/load cycle');
  console.log('- debugWorldContext() - Debug world context hook');
  console.log('- clearAllWorldData() - Clear all world data');
  console.log('- exportWorldData() - Export world data as JSON');
  console.log('- simpleDebugWorldFlow() - Quick debug (as requested)');
}

export default {
  debugWorldFlow,
  debugWorldById,
  debugSaveLoadCycle,
  debugWorldContext,
  clearAllWorldData,
  exportWorldData
};