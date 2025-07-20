/**
 * NodeEditorPage - Dedicated full-page interface for node editing
 * 
 * Provides a focused environment for creating and editing nodes
 * with visual relationship mapping and template integration.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Eye, Settings, Plus, ArrowLeft, Download, Upload, Home, ChevronRight } from 'lucide-react';
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

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && currentNode) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, currentNode, autoSaveEnabled]);

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges) return;
    
    setIsSaving(true);
    try {
      // TODO: Implement actual save functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('Auto-saved node...');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement save functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('Saving node...');
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

  const handleChange = (nodeData) => {
    setHasUnsavedChanges(true);
    setCurrentNode(nodeData);
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
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))'
    }}>
      <Navigation />
      
      {/* Breadcrumb Navigation */}
      <div className="px-8 py-3 border-b border-slate-700/50 bg-slate-900/30">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <ChevronRight className="w-4 h-4" />
          <button 
            onClick={() => navigate('/builder')}
            className="hover:text-slate-200 transition-colors"
          >
            World Builder
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-200">Node Editor</span>
        </div>
      </div>
      
      {/* Editor Header */}
      <div className="px-8 py-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Builder
            </button>
            
            <div className="h-6 w-px bg-slate-600"></div>
            
            <h1 className="text-2xl font-bold text-white">
              Node Editor
            </h1>
            
            <div className="flex items-center gap-2">
              {isSaving && (
                <span className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded flex items-center gap-1">
                  <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              )}
              
              {hasUnsavedChanges && !isSaving && (
                <span className="px-2 py-1 text-xs bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 rounded">
                  Unsaved Changes
                </span>
              )}
              
              {lastSaved && !hasUnsavedChanges && !isSaving && (
                <span className="px-2 py-1 text-xs bg-green-600/20 text-green-400 border border-green-600/30 rounded">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              
              <label className="flex items-center gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="rounded"
                />
                Auto-save
              </label>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Template Import/Export */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".json"
                onChange={handleImportTemplate}
                className="hidden"
                id="import-template"
              />
              <label
                htmlFor="import-template"
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Import
              </label>
              
              <button
                onClick={handleExportTemplate}
                disabled={!currentNode}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            
            <div className="h-6 w-px bg-slate-600"></div>
            
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                previewMode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Node
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {previewMode ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-white mb-4">Node Preview</h2>
              <p className="text-slate-300">
                Preview mode will show how the node appears in the simulation.
                This feature will be implemented with the actual node preview component.
              </p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Node Configuration</h2>
                
                {/* Use existing NodeEditor component */}
                <NodeEditor 
                  initialNode={currentNode}
                  onChange={handleChange}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  mode={currentNode ? 'edit' : 'create'}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeEditorPage;