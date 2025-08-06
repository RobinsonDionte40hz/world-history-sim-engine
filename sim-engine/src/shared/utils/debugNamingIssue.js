/**
 * Debug Naming Issue Utility
 * 
 * Helps debug the naming confusion between "world", "world node", and "world foundation"
 * and identify why worlds aren't persisting or showing up in the sidebar.
 */

import editorStateManager from '../../application/services/EditorStateManager';
import worldPersistenceService from '../../application/services/WorldPersistenceService';

export const debugNamingIssue = () => {
  console.group('🔍 DEBUGGING WORLD NAMING & PERSISTENCE ISSUE');
  
  try {
    // 1. Check localStorage directly for all possible naming variations
    console.log('1️⃣ CHECKING LOCALSTORAGE FOR NAMING VARIATIONS:');
    
    const allKeys = Object.keys(localStorage);
    console.log('All localStorage keys:', allKeys);
    
    // Check for different naming patterns
    const worldKeys = allKeys.filter(key => 
      key.includes('world') || 
      key.includes('World') ||
      key.includes('foundation') ||
      key.includes('Foundation')
    );
    console.log('World-related keys:', worldKeys);
    
    // Check the official world keys
    const officialWorldKeys = allKeys.filter(key => key.startsWith('worldHistorySimulator_'));
    console.log('Official world keys:', officialWorldKeys);
    
    // 2. Check the worlds list
    console.log('\n2️⃣ CHECKING WORLDS LIST:');
    const worldsListKey = 'worldHistorySimulator_worlds';
    const worldsData = localStorage.getItem(worldsListKey);
    const worldsList = worldsData ? JSON.parse(worldsData) : [];
    console.log('Worlds list from localStorage:', worldsList);
    
    // 3. Check each world's data
    console.log('\n3️⃣ CHECKING INDIVIDUAL WORLD DATA:');
    worldsList.forEach((world, index) => {
      console.log(`World ${index + 1}:`, world);
      const worldKey = `worldHistorySimulator_world_${world.id}`;
      const worldData = localStorage.getItem(worldKey);
      if (worldData) {
        const parsedWorld = JSON.parse(worldData);
        console.log(`  Full data for "${world.name}":`, parsedWorld);
      } else {
        console.warn(`  ⚠️ No data found for world "${world.name}" with key: ${worldKey}`);
      }
    });
    
    // 4. Check editor state
    console.log('\n4️⃣ CHECKING EDITOR STATE:');
    const editorState = editorStateManager.getState();
    console.log('Current editor state:', {
      currentWorld: editorState.currentWorld,
      currentEditor: editorState.currentEditor,
      hasUnsavedChanges: editorState.hasUnsavedChanges,
      worldData: editorState.editorData.world
    });
    
    // 5. Check for naming confusion in the data
    console.log('\n5️⃣ CHECKING FOR NAMING CONFUSION:');
    if (editorState.editorData.world) {
      const worldData = editorState.editorData.world;
      console.log('World data naming analysis:', {
        hasName: !!worldData.name,
        name: worldData.name,
        hasDescription: !!worldData.description,
        description: worldData.description,
        containsFoundation: worldData.name?.toLowerCase().includes('foundation'),
        containsWorld: worldData.name?.toLowerCase().includes('world'),
        allProperties: Object.keys(worldData)
      });
    }
    
    // 6. Test the persistence service directly
    console.log('\n6️⃣ TESTING PERSISTENCE SERVICE:');
    worldPersistenceService.getAllWorlds().then(worlds => {
      console.log('Worlds from persistence service:', worlds);
    }).catch(error => {
      console.error('Error from persistence service:', error);
    });
    
    // 7. Check for any route/URL naming issues
    console.log('\n7️⃣ CHECKING ROUTE/URL CONTEXT:');
    console.log('Current URL:', window.location.href);
    console.log('Current pathname:', window.location.pathname);
    console.log('URL search params:', window.location.search);
    
    // 8. Look for any "foundation" vs "world" confusion in the UI
    console.log('\n8️⃣ CHECKING FOR UI NAMING CONFUSION:');
    const foundationElements = document.querySelectorAll('*');
    let foundationCount = 0;
    let worldCount = 0;
    
    foundationElements.forEach(el => {
      if (el.textContent?.toLowerCase().includes('foundation')) foundationCount++;
      if (el.textContent?.toLowerCase().includes('world')) worldCount++;
    });
    
    console.log('UI text analysis:', {
      elementsWithFoundation: foundationCount,
      elementsWithWorld: worldCount
    });
    
  } catch (error) {
    console.error('❌ Error during naming debug:', error);
  }
  
  console.groupEnd();
};

export const debugWorldCreationFlow = () => {
  console.group('🏗️ DEBUGGING WORLD CREATION FLOW');
  
  try {
    console.log('This function should be called right after creating a world to trace the flow');
    
    // Check if world was saved
    const editorState = editorStateManager.getState();
    console.log('Editor state after creation:', editorState);
    
    // Check if it's in localStorage
    const worldsList = JSON.parse(localStorage.getItem('worldHistorySimulator_worlds') || '[]');
    console.log('Worlds in localStorage after creation:', worldsList);
    
    // Check for the specific world
    if (editorState.currentWorld?.id) {
      const worldKey = `worldHistorySimulator_world_${editorState.currentWorld.id}`;
      const worldData = localStorage.getItem(worldKey);
      console.log(`World data for ${editorState.currentWorld.id}:`, worldData ? JSON.parse(worldData) : 'NOT FOUND');
    }
    
  } catch (error) {
    console.error('❌ Error during creation flow debug:', error);
  }
  
  console.groupEnd();
};

// Make available globally
if (typeof window !== 'undefined') {
  window.debugNamingIssue = debugNamingIssue;
  window.debugWorldCreationFlow = debugWorldCreationFlow;
  
  console.log('🛠️ Naming debug utilities loaded:');
  console.log('- window.debugNamingIssue() - Debug naming confusion');
  console.log('- window.debugWorldCreationFlow() - Debug world creation');
}

export default {
  debugNamingIssue,
  debugWorldCreationFlow
};