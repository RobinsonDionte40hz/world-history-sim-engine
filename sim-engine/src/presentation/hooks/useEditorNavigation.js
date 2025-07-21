/**
 * useEditorNavigation Hook - Navigation logic for editors
 * 
 * Provides navigation functionality between editors with world foundation
 * requirements checking and unsaved changes handling.
 * 
 * Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import editorStateManager from '../../application/services/EditorStateManager';
import useNavigationGuard from './useNavigationGuard';

const useEditorNavigation = () => {
  const location = useLocation();
  const { navigate: guardedNavigate } = useNavigationGuard();
  const [editorState, setEditorState] = useState(editorStateManager.getState());

  // Subscribe to editor state changes
  useEffect(() => {
    const unsubscribeStateChange = editorStateManager.subscribe('editorChanged', (data) => {
      setEditorState(editorStateManager.getState());
    });

    const unsubscribeWorldChange = editorStateManager.subscribe('worldChanged', () => {
      setEditorState(editorStateManager.getState());
    });

    const unsubscribeUnsavedChanges = editorStateManager.subscribe('unsavedChangesChanged', () => {
      setEditorState(editorStateManager.getState());
    });

    return () => {
      unsubscribeStateChange();
      unsubscribeWorldChange();
      unsubscribeUnsavedChanges();
    };
  }, []);

  // Update current editor based on location
  useEffect(() => {
    const pathToEditorMap = {
      '/builder': 'world',
      '/editors/nodes': 'nodes',
      '/editors/characters': 'characters',
      '/editors/interactions': 'interactions',
      '/editors/encounters': 'encounters'
    };

    const currentEditor = pathToEditorMap[location.pathname];
    if (currentEditor && currentEditor !== editorState.currentEditor) {
      editorStateManager.setCurrentEditor(currentEditor);
    }
  }, [location.pathname, editorState.currentEditor]);

  /**
   * Navigate to a specific editor
   * @param {string} editorType - Type of editor to navigate to
   * @param {string} path - Path to navigate to
   */
  const navigateToEditor = useCallback((editorType, path) => {
    // Check if editor is available
    const availableEditors = editorStateManager.getAvailableEditors();
    if (!availableEditors.includes(editorType)) {
      console.warn(`Editor ${editorType} is not available`);
      return;
    }

    // Use guarded navigation to handle unsaved changes
    guardedNavigate(path);
  }, [guardedNavigate]);

  /**
   * Get current active editor
   * @returns {string|null} Current editor type
   */
  const getCurrentEditor = useCallback(() => {
    const pathToEditorMap = {
      '/builder': 'world',
      '/editors/nodes': 'nodes',
      '/editors/characters': 'characters',
      '/editors/interactions': 'interactions',
      '/editors/encounters': 'encounters'
    };

    return pathToEditorMap[location.pathname] || null;
  }, [location.pathname]);

  /**
   * Get list of available editors based on current state
   * @returns {Array} Array of available editor types
   */
  const getAvailableEditors = useCallback(() => {
    return editorStateManager.getAvailableEditors();
  }, []);

  /**
   * Check if world foundation is complete
   * @returns {boolean} Whether world foundation is complete
   */
  const isWorldFoundationComplete = useCallback(() => {
    return editorStateManager.isWorldFoundationComplete();
  }, []);

  /**
   * Get simulation readiness checklist
   * @returns {Object} Checklist of requirements
   */
  const getSimulationChecklist = useCallback(() => {
    return editorStateManager.getSimulationChecklist();
  }, []);

  /**
   * Check if simulation can be started
   * @returns {boolean} Whether simulation can be started
   */
  const canStartSimulation = useCallback(() => {
    return editorStateManager.canStartSimulation();
  }, []);

  /**
   * Get missing requirements for simulation
   * @returns {Array} Array of missing requirement descriptions
   */
  const getMissingRequirements = useCallback(() => {
    return editorStateManager.getMissingRequirements();
  }, []);

  /**
   * Navigate to next logical editor in the workflow
   */
  const navigateToNextEditor = useCallback(() => {
    const currentEditor = getCurrentEditor();
    const availableEditors = getAvailableEditors();
    
    const editorOrder = ['world', 'nodes', 'characters', 'interactions', 'encounters'];
    const currentIndex = editorOrder.indexOf(currentEditor);
    
    // Find next available editor
    for (let i = currentIndex + 1; i < editorOrder.length; i++) {
      const nextEditor = editorOrder[i];
      if (availableEditors.includes(nextEditor)) {
        const pathMap = {
          'world': '/builder',
          'nodes': '/editors/nodes',
          'characters': '/editors/characters',
          'interactions': '/editors/interactions',
          'encounters': '/editors/encounters'
        };
        
        navigateToEditor(nextEditor, pathMap[nextEditor]);
        return;
      }
    }
    
    // If no next editor, suggest simulation if ready
    if (canStartSimulation()) {
      guardedNavigate('/simulation');
    }
  }, [getCurrentEditor, getAvailableEditors, canStartSimulation, navigateToEditor, guardedNavigate]);

  /**
   * Navigate to previous editor in the workflow
   */
  const navigateToPreviousEditor = useCallback(() => {
    const currentEditor = getCurrentEditor();
    const availableEditors = getAvailableEditors();
    
    const editorOrder = ['world', 'nodes', 'characters', 'interactions', 'encounters'];
    const currentIndex = editorOrder.indexOf(currentEditor);
    
    // Find previous available editor
    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevEditor = editorOrder[i];
      if (availableEditors.includes(prevEditor)) {
        const pathMap = {
          'world': '/builder',
          'nodes': '/editors/nodes',
          'characters': '/editors/characters',
          'interactions': '/editors/interactions',
          'encounters': '/editors/encounters'
        };
        
        navigateToEditor(prevEditor, pathMap[prevEditor]);
        return;
      }
    }
  }, [getCurrentEditor, getAvailableEditors, navigateToEditor]);

  /**
   * Get navigation suggestions based on current state
   * @returns {Object} Navigation suggestions
   */
  const getNavigationSuggestions = useCallback(() => {
    const currentEditor = getCurrentEditor();
    const availableEditors = getAvailableEditors();
    const worldComplete = isWorldFoundationComplete();
    const canSimulate = canStartSimulation();
    const missingRequirements = getMissingRequirements();

    const suggestions = {
      current: currentEditor,
      next: null,
      previous: null,
      canSimulate,
      missingRequirements,
      recommendations: []
    };

    // Determine next/previous editors
    const editorOrder = ['world', 'nodes', 'characters', 'interactions', 'encounters'];
    const currentIndex = editorOrder.indexOf(currentEditor);

    // Find next available editor
    for (let i = currentIndex + 1; i < editorOrder.length; i++) {
      if (availableEditors.includes(editorOrder[i])) {
        suggestions.next = editorOrder[i];
        break;
      }
    }

    // Find previous available editor
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (availableEditors.includes(editorOrder[i])) {
        suggestions.previous = editorOrder[i];
        break;
      }
    }

    // Generate recommendations
    if (!worldComplete) {
      suggestions.recommendations.push({
        type: 'required',
        message: 'Complete World Foundation to unlock other editors',
        action: 'world'
      });
    } else if (missingRequirements.length > 0) {
      suggestions.recommendations.push({
        type: 'warning',
        message: `Complete ${missingRequirements.length} requirements to enable simulation`,
        action: 'checklist'
      });
    } else if (canSimulate) {
      suggestions.recommendations.push({
        type: 'success',
        message: 'All requirements met! Ready to run simulation',
        action: 'simulation'
      });
    }

    return suggestions;
  }, [getCurrentEditor, getAvailableEditors, isWorldFoundationComplete, canStartSimulation, getMissingRequirements]);

  /**
   * Get breadcrumb navigation data
   * @returns {Array} Breadcrumb items
   */
  const getBreadcrumbs = useCallback(() => {
    const currentEditor = getCurrentEditor();
    const breadcrumbs = [
      { label: 'Home', path: '/', active: false }
    ];

    const editorLabels = {
      'world': 'World Foundation',
      'nodes': 'Node Editor',
      'characters': 'Character Editor',
      'interactions': 'Interaction Editor',
      'encounters': 'Encounter Editor'
    };

    if (currentEditor && editorLabels[currentEditor]) {
      breadcrumbs.push({
        label: editorLabels[currentEditor],
        path: location.pathname,
        active: true
      });
    }

    return breadcrumbs;
  }, [getCurrentEditor, location.pathname]);

  /**
   * Reset navigation state
   */
  const resetNavigation = useCallback(() => {
    editorStateManager.reset();
  }, []);

  return {
    // Navigation functions
    navigateToEditor,
    navigateToNextEditor,
    navigateToPreviousEditor,
    
    // State getters
    getCurrentEditor,
    getAvailableEditors,
    isWorldFoundationComplete,
    getSimulationChecklist,
    canStartSimulation,
    getMissingRequirements,
    getNavigationSuggestions,
    getBreadcrumbs,
    
    // State data
    editorState,
    currentEditor: getCurrentEditor(),
    availableEditors: getAvailableEditors(),
    worldFoundationComplete: isWorldFoundationComplete(),
    simulationReady: canStartSimulation(),
    
    // Utilities
    resetNavigation
  };
};

export default useEditorNavigation;