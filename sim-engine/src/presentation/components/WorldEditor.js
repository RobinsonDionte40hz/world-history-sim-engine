/**
 * WorldEditor - Example component demonstrating integrated world saving
 * 
 * Shows how to use the WorldSaveManager through the useWorldSave hook
 * for smooth world editing with automatic save status management.
 */

import React, { useState, useEffect } from 'react';
import { Save, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useWorldSave } from '../hooks/useWorldSave';
import SaveStatusIndicator from './SaveStatusIndicator';
import editorStateManager from '../../application/services/EditorStateManager';

const WorldEditor = () => {
  const [worldName, setWorldName] = useState('');
  const [worldDescription, setWorldDescription] = useState('');
  const [rules, setRules] = useState('');
  const [initialConditions, setInitialConditions] = useState('');

  const {
    saveWorld,
    loadWorld,
    createNewWorld,
    navigateToEditor,
    saveCurrentWork,
    canSave,
    hasUnsavedChanges,
    isSaving,
    error,
    clearError,
    saveStatus,
    addNode
  } = useWorldSave();

  // Load current world data on mount
  useEffect(() => {
    const currentWorld = editorStateManager.getState().currentWorld;
    if (currentWorld) {
      setWorldName(currentWorld.name || '');
      setWorldDescription(currentWorld.description || '');
      setRules(currentWorld.rules ? JSON.stringify(currentWorld.rules, null, 2) : '');
      setInitialConditions(currentWorld.initialConditions ? JSON.stringify(currentWorld.initialConditions, null, 2) : '');
    }
  }, []);

  // Update editor state when form changes
  useEffect(() => {
    const worldData = {
      name: worldName,
      description: worldDescription,
      rules: rules ? JSON.parse(rules || '{}') : undefined,
      initialConditions: initialConditions ? JSON.parse(initialConditions || '{}') : undefined
    };

    // Only update if we have at least name and description
    if (worldName && worldDescription) {
      editorStateManager.updateEditorData('world', null, worldData);
      editorStateManager.setUnsavedChanges(true);
    }
  }, [worldName, worldDescription, rules, initialConditions]);

  const handleSave = async () => {
    try {
      await saveWorld();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleCreateNew = async () => {
    try {
      const worldData = {
        name: worldName || 'New World',
        description: worldDescription || 'A new world for simulation'
      };

      await createNewWorld(worldData);
    } catch (error) {
      console.error('Create new world failed:', error);
    }
  };

  const handleLoadExample = async () => {
    try {
      // This would typically come from a world selection dialog
      const exampleWorldId = 'example-world-123';
      await loadWorld(exampleWorldId);
    } catch (error) {
      console.error('Load world failed:', error);
    }
  };

  const handleNavigateToNodes = async () => {
    try {
      await navigateToEditor('nodes', {
        forceSave: false, // Let user decide about saving
        onNavigationStart: () => console.log('Navigating to nodes editor...'),
        onNavigationComplete: () => console.log('Navigation to nodes completed')
      });
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  const handleNavigateToCharacters = async () => {
    try {
      await navigateToEditor('characters');
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  const handleSaveAndNavigate = async (targetEditor) => {
    try {
      await saveCurrentWork();
      await navigateToEditor(targetEditor, { skipSavePrompt: true });
    } catch (error) {
      console.error('Save and navigate failed:', error);
    }
  };

  // Complete implementation example methods
  const handleCreateWorldComplete = async (worldData) => {
    try {
      // 1. Create/Save world using integrated system
      await createNewWorld(worldData);

      // 2. World is automatically set as current in EditorStateManager
      // 3. Navigate to next step with context preserved
      await navigateToEditor('nodes', {
        onNavigationComplete: () => {
          console.log('World created and navigated to nodes editor');
        }
      });

    } catch (error) {
      console.error('World creation flow failed:', error);
    }
  };

  const handleAddNodeComplete = async (nodeData) => {
    try {
      // 1. Save node using the hook's addNode method (integrates with persistence)
      const savedNode = await addNode(nodeData);

      // 2. Editor state is automatically updated by the hook
      // 3. Unsaved changes are automatically managed

      console.log('Node added successfully:', savedNode);

    } catch (error) {
      console.error('Add node failed:', error);
    }
  };

  const handleNavigateWithContext = async (targetEditor) => {
    try {
      // 1. Check for unsaved changes and save if needed
      if (hasUnsavedChanges) {
        await saveCurrentWork();
      }

      // 2. Navigate with world context preserved
      await navigateToEditor(targetEditor, {
        onNavigationStart: () => console.log(`Navigating to ${targetEditor} with world context`),
        onNavigationComplete: () => console.log(`Navigation to ${targetEditor} completed`)
      });

      // 3. World context is automatically maintained by EditorStateManager

    } catch (error) {
      console.error('Context navigation failed:', error);
    }
  };

  const handleWorldSelection = async (selectedWorld) => {
    try {
      // 1. Load complete world data using integrated system
      const fullWorld = await loadWorld(selectedWorld.id);

      // 2. World is automatically set as current in EditorStateManager
      // 3. All associated data is automatically loaded and synced
      // 4. Editor state is populated with world data

      console.log('World loaded successfully:', fullWorld);

      // 5. Navigate to appropriate editor based on world state
      const availableEditors = editorStateManager.getAvailableEditors();
      if (availableEditors.includes('nodes')) {
        await navigateToEditor('nodes');
      }

    } catch (error) {
      console.error('World selection failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              World Editor
            </h2>
            <SaveStatusIndicator compact={true} />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                World Name *
              </label>
              <input
                type="text"
                value={worldName}
                onChange={(e) => setWorldName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Enter world name..."
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={worldDescription}
                onChange={(e) => setWorldDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Describe your world..."
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rules (JSON)
              </label>
              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 font-mono text-sm"
                placeholder='{"timeProgression": "manual", "simulationSpeed": 1}'
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Initial Conditions (JSON)
              </label>
              <textarea
                value={initialConditions}
                onChange={(e) => setInitialConditions(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 font-mono text-sm"
                placeholder='{"startingYear": 1000, "population": 100}'
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && (
                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                  Unsaved changes
                </span>
              )}
              {!hasUnsavedChanges && worldName && (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  All changes saved
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateNew}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Create New
              </button>

              <button
                onClick={handleLoadExample}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Load Example
              </button>

              <button
                onClick={handleSave}
                disabled={!canSave || isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save World
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Panel */}
      {worldName && worldDescription && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Next Steps
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Continue building your world by adding nodes, characters, and interactions
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleNavigateToNodes}
                disabled={isSaving}
                className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Nodes Editor</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Create locations and contexts for your world
                </p>
              </button>

              <button
                onClick={handleNavigateToCharacters}
                disabled={isSaving}
                className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Characters Editor</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Design NPCs with attributes and personalities
                </p>
              </button>

              <button
                onClick={() => handleSaveAndNavigate('interactions')}
                disabled={isSaving}
                className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Interactions Editor</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Define character capabilities and actions
                </p>
              </button>
            </div>

            {hasUnsavedChanges && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  💡 <strong>Tip:</strong> Your changes will be automatically saved when navigating to other editors.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Status Panel */}
      <SaveStatusIndicator />

      {/* Complete Implementation Example */}
      {worldName && worldDescription && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Complete Workflow Example
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Demonstration of the integrated world management system
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">World Management</h4>

                <button
                  onClick={() => handleCreateWorldComplete({
                    name: `${worldName} (Copy)`,
                    description: `Copy of ${worldDescription}`,
                    rules: { timeProgression: 'manual' }
                  })}
                  disabled={isSaving}
                  className="w-full px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50"
                >
                  Create World Copy & Navigate
                </button>

                <button
                  onClick={() => handleWorldSelection({ id: 'example-world', name: 'Example World' })}
                  disabled={isSaving}
                  className="w-full px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50"
                >
                  Load Example World
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Content Management</h4>

                <button
                  onClick={() => handleAddNodeComplete({
                    name: 'Example Node',
                    type: 'location',
                    description: 'An example location node'
                  })}
                  disabled={isSaving}
                  className="w-full px-3 py-2 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-50"
                >
                  Add Example Node
                </button>

                <button
                  onClick={() => handleNavigateWithContext('characters')}
                  disabled={isSaving}
                  className="w-full px-3 py-2 text-sm bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/30 disabled:opacity-50"
                >
                  Navigate with Context
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Current System State</h5>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>Current Editor: <span className="font-mono">{editorStateManager.getState().currentEditor || 'none'}</span></div>
                <div>Has Unsaved Changes: <span className="font-mono">{hasUnsavedChanges ? 'true' : 'false'}</span></div>
                <div>Save Status: <span className="font-mono">{saveStatus?.saveStatus || 'unknown'}</span></div>
                <div>Auto-save: <span className="font-mono">{saveStatus?.autoSaveEnabled ? 'enabled' : 'disabled'}</span></div>
                <div>Available Editors: <span className="font-mono">{editorStateManager.getAvailableEditors().join(', ')}</span></div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Integration Features</h6>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>✅ Automatic world context preservation across navigation</li>
                <li>✅ Smart auto-save with unsaved changes detection</li>
                <li>✅ Integrated state management between all services</li>
                <li>✅ Real-time synchronization of world data</li>
                <li>✅ Error handling and recovery mechanisms</li>
                <li>✅ Loading states and user feedback</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldEditor;