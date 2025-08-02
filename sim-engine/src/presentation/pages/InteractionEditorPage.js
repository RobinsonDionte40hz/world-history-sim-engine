/**
 * InteractionEditorPage - Dedicated full-page interface for interaction editing
 * 
 * Provides a focused environment for creating and editing interactions
 * with branching design, effect configuration, and testing tools.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestTube } from 'lucide-react';
import InteractionEditor from '../components/InteractionEditor';
import EditorLayout from '../components/EditorLayout';

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
  const [validationErrors, setValidationErrors] = useState({});

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && currentInteraction) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, currentInteraction, autoSaveEnabled]);

  // Real-time validation
  useEffect(() => {
    if (currentInteraction) {
      validateInteraction(currentInteraction);
    }
  }, [currentInteraction]);

  const validateInteraction = (interaction) => {
    const errors = {};
    
    if (!interaction.name?.trim()) {
      errors.name = 'Interaction name is required';
    }
    
    if (!interaction.description?.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!interaction.branches || interaction.branches.length === 0) {
      errors.branches = 'At least one branch is required';
    }
    
    // Validate branches
    if (interaction.branches) {
      interaction.branches.forEach((branch, index) => {
        if (!branch.text?.trim()) {
          errors[`branch_${index}_text`] = `Branch ${index + 1} text is required`;
        }
      });
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges || !validateInteraction(currentInteraction)) return;
    
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
  };

  const handleSave = async () => {
    if (!validateInteraction(currentInteraction)) {
      alert('Please fix validation errors before saving.');
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
    navigate('/builder');
  };

  const handleChange = (interactionData) => {
    setHasUnsavedChanges(true);
    setCurrentInteraction(interactionData);
  };

  const handleTest = () => {
    if (!currentInteraction) {
      alert('No interaction to test. Please create an interaction first.');
      return;
    }
    
    if (!validateInteraction(currentInteraction)) {
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

  // Custom header actions for interaction editor
  const headerActions = [
    // Interaction Templates
    <div key="templates" className="flex items-center gap-2">
      <button
        onClick={() => loadTemplate('dialogue')}
        className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
      >
        💬 Dialogue
      </button>
      <button
        onClick={() => loadTemplate('trade')}
        className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
      >
        🤝 Trade
      </button>
      <button
        onClick={() => loadTemplate('quest')}
        className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
      >
        📜 Quest
      </button>
    </div>,
    // Test Button
    <button
      key="test"
      onClick={handleTest}
      disabled={!currentInteraction || Object.keys(validationErrors).length > 0}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <TestTube className="w-4 h-4" />
      Test
    </button>
  ];

  return (
    <EditorLayout
      title="Interaction Editor"
      editorType="interactions"
      onSave={handleSave}
      onCancel={handleCancel}
      hasUnsavedChanges={hasUnsavedChanges}
      isSaving={isSaving}
      validationErrors={Object.values(validationErrors)}
      previewMode={previewMode}
      onPreviewToggle={() => setPreviewMode(!previewMode)}
      autoSaveEnabled={autoSaveEnabled}
      onAutoSaveToggle={setAutoSaveEnabled}
      saveStatus={lastSaved ? { status: 'saved', timestamp: lastSaved } : null}
      headerActions={headerActions}
      exportImportConfig={{
        onExport: handleExportTemplate,
        onImport: handleImportTemplate,
        exportDisabled: !currentInteraction,
        acceptedFileTypes: '.json'
      }}
    >
      {testMode && testResults ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Test Results</h2>
            <button
              onClick={() => setTestMode(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
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
                  <div key={index} className="p-3 bg-slate-700/50 rounded border border-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">Branch {index + 1}: {branch.text}</span>
                      <span className={`text-sm ${
                        branch.accessible ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {branch.accessible ? '✓ Accessible' : '✗ Blocked'}
                      </span>
                    </div>
                    {branch.effects.length > 0 && (
                      <div className="mt-2 text-sm text-slate-400">
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
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Interaction Preview</h2>
          {currentInteraction ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/50 rounded border border-slate-600">
                <h3 className="font-semibold text-white mb-2">
                  Interaction: {currentInteraction.name || 'Unnamed Interaction'}
                </h3>
                <p className="text-slate-300 mb-4">
                  {currentInteraction.description || 'No description provided'}
                </p>
                
                {currentInteraction.branches && currentInteraction.branches.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-sm text-slate-400 mb-2">Available responses:</div>
                    {currentInteraction.branches.map((branch, index) => (
                      <button 
                        key={index}
                        className="block w-full text-left p-3 bg-slate-600/50 hover:bg-slate-600 rounded border border-slate-500 text-slate-200 transition-colors"
                      >
                        → {branch.text || `Branch ${index + 1}`}
                        {branch.effects && branch.effects.length > 0 && (
                          <span className="text-xs text-slate-400 ml-2">
                            ({branch.effects.length} effect{branch.effects.length !== 1 ? 's' : ''})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 italic">No branches defined</div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-slate-300">
              No interaction data to preview. Create or load an interaction to see the preview.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Interaction Configuration</h2>
            
            {/* Validation Errors Summary */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-3">
                <div className="text-red-400 text-sm font-medium mb-2">
                  Please fix the following errors:
                </div>
                <ul className="text-red-300 text-xs space-y-1">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
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
    </EditorLayout>
  );
};

export default InteractionEditorPage;