/**
 * NodeEditorPage - Dedicated full-page interface for node editing
 * 
 * Provides a focused environment for creating and editing nodes
 * with visual relationship mapping and template integration.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Settings,
  AlertCircle,
  AlertTriangle,
  Download,
  Upload,
  ArrowRight,
  CheckCircle,
  X
} from 'lucide-react';
import Navigation from '../UI/Navigation';
import NodeEditor from '../components/NodeEditor';

const NodeEditorPage = () => {
  const navigate = useNavigate();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentNode, setCurrentNode] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showNextSteps, setShowNextSteps] = useState(false);

  // Validation
  const validateNode = useCallback(() => {
    const errors = [];

    if (!currentNode?.name?.trim()) {
      errors.push({ field: 'name', message: 'Node name is required' });
    } else if (currentNode.name.length < 3) {
      errors.push({ field: 'name', message: 'Node name must be at least 3 characters' });
    }

    if (!currentNode?.description?.trim()) {
      errors.push({ field: 'description', message: 'Node description is required' });
    } else if (currentNode.description.length < 10) {
      errors.push({ field: 'description', message: 'Node description must be at least 10 characters' });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [currentNode]);

  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !currentNode || !validateNode()) return;
    
    setIsSaving(true);
    try {
      // Auto-save is handled by the NodeEditor component
      // For now, we'll skip auto-save to avoid conflicts
      console.log('Auto-save skipped - manual save required');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, currentNode, validateNode]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && currentNode) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, currentNode, autoSaveEnabled, handleAutoSave]);

  const handleSave = async () => {
    if (!validateNode()) {
      return;
    }

    setIsSaving(true);
    try {
      // The actual save is handled by NodeEditor component
      // This is called when NodeEditor completes its save operation
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('Node saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save node: ' + error.message);
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

  const handleChange = (nodeData) => {
    setHasUnsavedChanges(true);
    setCurrentNode(nodeData);
  };

  // Get field-specific errors
  const getFieldError = (fieldName) => {
    const error = validationErrors.find(e => e.field === fieldName);
    return error ? error.message : null;
  };

  const handleExportTemplate = () => {
    if (currentNode) {
      const dataStr = JSON.stringify(currentNode, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `node-template-${currentNode.name || 'unnamed'}.json`;
      
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
          const importedNode = JSON.parse(e.target.result);
          setCurrentNode(importedNode);
          setHasUnsavedChanges(true);
          console.log('Imported node template:', importedNode);
        } catch (error) {
          alert('Error importing template: Invalid JSON file');
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
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
              <MapPin className="w-10 h-10 text-indigo-400" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Node Editor
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Create abstract locations and contexts for your world
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

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".json"
                onChange={handleImportTemplate}
                className="hidden"
                id="import-node-template"
              />
              <label
                htmlFor="import-node-template"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Import
              </label>
              
              <button
                onClick={handleExportTemplate}
                disabled={!currentNode}
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
              {isSaving ? 'Saving...' : (hasUnsavedChanges ? 'Save Node' : 'Saved')}
            </button>

            <button
              onClick={() => setShowNextSteps(true)}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
            >
              <ArrowRight className="w-4 h-4" />
              Next Steps
            </button>
          </div>

          {/* Main Content Area */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            {previewMode ? (
              /* Preview Mode */
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Node Preview</h2>
                {currentNode ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-300 mb-2">Name</h3>
                      <p className="text-white text-lg">{currentNode.name || 'Not set'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-300 mb-2">Description</h3>
                      <p className="text-white">{currentNode.description || 'Not set'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-300 mb-2">Type</h3>
                      <p className="text-white">{currentNode.type || 'Not set'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300">
                    No node data to preview. Create or load a node to see the preview.
                  </p>
                )}
              </div>
            ) : (
              /* Edit Mode */
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Node Configuration</h2>
                
                {/* Use existing NodeEditor component */}
                <NodeEditor 
                  initialNode={currentNode}
                  onChange={handleChange}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  mode={currentNode ? 'edit' : 'create'}
                />
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Next Steps
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 max-w-5xl mx-auto">
              <button
                onClick={() => navigate('/editors/characters')}
                className="w-full sm:w-80 p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
                    <Settings className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Create Characters</h3>
                </div>
                <p className="text-gray-300 text-left">
                  Design NPCs with personalities and attributes
                </p>
              </button>

              <button
                onClick={() => navigate('/editors/interactions')}
                className="w-full sm:w-80 p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
                    <Settings className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Create Interactions</h3>
                </div>
                <p className="text-gray-300 text-left">
                  Define actions and capabilities for your world
                </p>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NodeEditorPage;
