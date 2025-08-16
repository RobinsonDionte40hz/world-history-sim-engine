/**
 * InteractionEditorPage - Dedicated full-page interface for interaction editing
 * 
 * Provides a focused environment for creating and editing interactions
 * with branching design, effect configuration, and testing tools.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TestTube, 
  MessageSquare,
  AlertCircle,
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react';
import Navigation from '../UI/Navigation';
import InteractionEditor from '../components/InteractionEditor';
import WorldDropdown from '../UI/WorldDropdown';

const InteractionEditorPage = () => {
  const navigate = useNavigate();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentInteraction, setCurrentInteraction] = useState(null);
  const [testMode, setTestMode] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  // Validation
  const validateInteraction = useCallback(() => {
    const errors = [];
    
    if (!currentInteraction?.name?.trim()) {
      errors.push({ field: 'name', message: 'Interaction name is required' });
    } else if (currentInteraction.name.length < 3) {
      errors.push({ field: 'name', message: 'Interaction name must be at least 3 characters' });
    }
    
    if (!currentInteraction?.description?.trim()) {
      errors.push({ field: 'description', message: 'Description is required' });
    } else if (currentInteraction.description.length < 10) {
      errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
    }
    
    if (!currentInteraction?.branches || currentInteraction.branches.length === 0) {
      errors.push({ field: 'branches', message: 'At least one branch is required' });
    }
    
    // Validate branches
    if (currentInteraction?.branches) {
      currentInteraction.branches.forEach((branch, index) => {
        if (!branch.text?.trim()) {
          errors.push({ field: `branch_${index}_text`, message: `Branch ${index + 1} text is required` });
        }
      });
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [currentInteraction]);

  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !validateInteraction()) return;
    
    setIsSaving(true);
    try {
      // TODO: Implement actual save functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('Auto-saved interaction...');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, validateInteraction]);

  // Real-time validation
  useEffect(() => {
    if (currentInteraction) {
      validateInteraction();
    }
  }, [currentInteraction, validateInteraction]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && currentInteraction) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, currentInteraction, autoSaveEnabled, handleAutoSave]);

  const handleSave = async () => {
    if (!validateInteraction()) {
      return;
    }
    
    setIsSaving(true);
    try {
      // TODO: Implement save functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('Saving interaction...');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate('/editors/world');
  };

  const handleChange = (interactionData) => {
    setHasUnsavedChanges(true);
    setCurrentInteraction(interactionData);
  };

  // Get field-specific errors
  const getFieldError = (fieldName) => {
    const error = validationErrors.find(e => e.field === fieldName);
    return error ? error.message : null;
  };

  const handleTest = () => {
    if (!currentInteraction) {
      alert('No interaction to test. Please create an interaction first.');
      return;
    }
    
    if (!validateInteraction()) {
      alert('Please fix validation errors before testing.');
      return;
    }
    
    // Simulate interaction testing
    const mockTestResults = {
      success: true,
      branches: currentInteraction.branches?.map((branch, index) => ({
        id: index,
        text: branch.text,
        accessible: true,
        effects: branch.effects || [],
        prerequisites: branch.prerequisites || []
      })) || [],
      warnings: [],
      errors: []
    };
    
    // Add some mock warnings/errors for demonstration
    if (currentInteraction.branches?.length > 5) {
      mockTestResults.warnings.push('Many branches detected - consider simplifying for better user experience');
    }
    
    setTestResults(mockTestResults);
    setTestMode(true);
    console.log('Testing interaction...', mockTestResults);
  };

  const handleExportTemplate = () => {
    if (currentInteraction) {
      const dataStr = JSON.stringify(currentInteraction, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `interaction-template-${currentInteraction.name || 'unnamed'}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const handleImportTemplate = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedInteraction = JSON.parse(e.target.result);
          setCurrentInteraction(importedInteraction);
          setHasUnsavedChanges(true);
          console.log('Imported interaction template:', importedInteraction);
        } catch (error) {
          alert('Error importing template: Invalid JSON file');
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const loadTemplate = (templateType) => {
    const templates = {
      dialogue: {
        name: 'Basic Dialogue',
        description: 'A simple conversation with multiple response options',
        category: 'dialogue',
        branches: [
          { text: 'Tell me about yourself', effects: [] },
          { text: 'What do you need?', effects: [] },
          { text: 'Goodbye', effects: [] }
        ]
      },
      trade: {
        name: 'Trading Interaction',
        description: 'A merchant trading interface',
        category: 'trade',
        branches: [
          { text: 'What do you have for sale?', effects: [] },
          { text: 'I want to sell something', effects: [] },
          { text: 'Not interested', effects: [] }
        ]
      },
      quest: {
        name: 'Quest Giver',
        description: 'An NPC offering a quest',
        category: 'quest',
        branches: [
          { text: 'What task do you have for me?', effects: [] },
          { text: 'I accept the quest', effects: [{ type: 'quest', action: 'start' }] },
          { text: 'Maybe later', effects: [] }
        ]
      }
    };
    
    const template = templates[templateType];
    if (template) {
      setCurrentInteraction(template);
      setHasUnsavedChanges(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-600/10 border-b border-red-600/30 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <div className="text-red-400 text-sm font-medium mb-2">
                Please fix the following errors before saving:
              </div>
              <ul className="text-red-300 text-xs space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error.message || error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Full width responsive container */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageSquare className="w-10 h-10 text-indigo-400" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Interaction Editor
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Define actions and capabilities for your world characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>

            {/* Interaction Templates */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadTemplate('dialogue')}
                className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                💬 Dialogue
              </button>
              <button
                onClick={() => loadTemplate('trade')}
                className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                🤝 Trade
              </button>
              <button
                onClick={() => loadTemplate('quest')}
                className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                📜 Quest
              </button>
            </div>

            <button
              onClick={handleTest}
              disabled={!currentInteraction || validationErrors.length > 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TestTube className="w-4 h-4" />
              Test
            </button>

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".json"
                onChange={handleImportTemplate}
                className="hidden"
                id="import-interaction-template"
              />
              <label
                htmlFor="import-interaction-template"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Import
              </label>
              
              <button
                onClick={handleExportTemplate}
                disabled={!currentInteraction}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving || validationErrors.length > 0}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${hasUnsavedChanges && !isSaving && validationErrors.length === 0
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isSaving ? 'Saving...' : (hasUnsavedChanges ? 'Save Interaction' : 'Saved')}
            </button>
          </div>

          {/* Main Content Area */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            {testMode && testResults ? (
              /* Test Mode */
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white">Test Results</h2>
                <button
                  onClick={() => setTestMode(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors"
                >
                  Back to Editor
                </button>
                </div>
                
                <div className="space-y-6">
                  {/* Test Status */}
                  <div className={`p-4 rounded-lg border ${
                    testResults.success 
                      ? 'bg-green-600/10 border-green-600/30' 
                      : 'bg-red-600/10 border-red-600/30'
                  }`}>
                    <div className={`font-semibold ${
                      testResults.success ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {testResults.success ? '✓ Test Passed' : '✗ Test Failed'}
                    </div>
                  </div>
                  
                  {/* Branches Test */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Branch Validation</h3>
                    <div className="space-y-2">
                      {testResults.branches.map((branch, index) => (
                        <div key={index} className="p-3 bg-white/10 rounded border border-white/20">
                          <div className="flex items-center justify-between">
                            <span className="text-white">Branch {index + 1}: {branch.text}</span>
                            <span className={`text-sm ${
                              branch.accessible ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {branch.accessible ? '✓ Accessible' : '✗ Blocked'}
                            </span>
                          </div>
                          {branch.effects.length > 0 && (
                            <div className="mt-2 text-sm text-gray-400">
                              Effects: {branch.effects.length}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Warnings */}
                  {testResults.warnings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-400 mb-3">Warnings</h3>
                      <div className="space-y-2">
                        {testResults.warnings.map((warning, index) => (
                          <div key={index} className="p-3 bg-yellow-600/10 border border-yellow-600/30 rounded">
                            <span className="text-yellow-300">{warning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Errors */}
                  {testResults.errors.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-red-400 mb-3">Errors</h3>
                      <div className="space-y-2">
                        {testResults.errors.map((error, index) => (
                          <div key={index} className="p-3 bg-red-600/10 border border-red-600/30 rounded">
                            <span className="text-red-300">{error}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : previewMode ? (
              /* Preview Mode */
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Interaction Preview</h2>
                {currentInteraction ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/10 rounded border border-white/20">
                      <h3 className="font-semibold text-white mb-2">
                        Interaction: {currentInteraction.name || 'Unnamed Interaction'}
                      </h3>
                      <p className="text-gray-300 mb-4">
                        {currentInteraction.description || 'No description provided'}
                      </p>
                      
                      {currentInteraction.branches && currentInteraction.branches.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-400 mb-2">Available responses:</div>
                          {currentInteraction.branches.map((branch, index) => (
                            <button 
                              key={index}
                              className="block w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded border border-white/20 text-white transition-colors"
                            >
                              → {branch.text || `Branch ${index + 1}`}
                              {branch.effects && branch.effects.length > 0 && (
                                <span className="text-xs text-gray-400 ml-2">
                                  ({branch.effects.length} effect{branch.effects.length !== 1 ? 's' : ''})
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-400 italic">No branches defined</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300">
                    No interaction data to preview. Create or load an interaction to see the preview.
                  </p>
                )}
              </div>
            ) : (
              /* Edit Mode */
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Interaction Configuration</h2>
                
                {/* World Selection Section */}
                <div className="mb-6 max-w-2xl mx-auto">
                  <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                    <WorldDropdown 
                      label="Add Interaction To"
                      showCreateButton={true}
                    />
                  </div>
                </div>
                
                {/* Use existing InteractionEditor component */}
                <InteractionEditor 
                  initialInteraction={currentInteraction}
                  onChange={handleChange}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  mode={currentInteraction ? 'edit' : 'create'}
                />
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Next Steps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <button
                onClick={() => navigate('/editors/nodes')}
                className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create Nodes</h3>
                </div>
                <p className="text-gray-300 text-sm text-left">
                  Define locations and contexts within your world
                </p>
              </button>

              <button
                onClick={() => navigate('/editors/characters')}
                className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create Characters</h3>
                </div>
                <p className="text-gray-300 text-sm text-left">
                  Design NPCs with personalities and attributes
                </p>
              </button>

              <button
                onClick={() => navigate('/editors/encounters')}
                className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create Encounters</h3>
                </div>
                <p className="text-gray-300 text-sm text-left">
                  Design dynamic encounters with turn-based mechanics
                </p>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InteractionEditorPage;
