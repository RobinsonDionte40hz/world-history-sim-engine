/**
 * NodeEditorPage - Dedicated full-page interface for node editing
 * 
 * Provides a focused environment for creating and editing nodes
 * with visual relationship mapping and template integration.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NodeEditor from '../components/NodeEditor';
import EditorLayout from '../components/EditorLayout';

const NodeEditorPage = () => {
  const navigate = useNavigate();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentNode, setCurrentNode] = useState(null);

  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !currentNode) return;
    
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
  }, [hasUnsavedChanges, currentNode]);

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
    <EditorLayout
      title="Node Editor"
      editorType="nodes"
      onSave={handleSave}
      onCancel={handleCancel}
      hasUnsavedChanges={hasUnsavedChanges}
      isSaving={isSaving}
      previewMode={previewMode}
      onPreviewToggle={() => setPreviewMode(!previewMode)}
      autoSaveEnabled={autoSaveEnabled}
      onAutoSaveToggle={setAutoSaveEnabled}
      saveStatus={lastSaved ? { status: 'saved', timestamp: lastSaved } : null}
      exportImportConfig={{
        onExport: handleExportTemplate,
        onImport: handleImportTemplate,
        exportDisabled: !currentNode,
        acceptedFileTypes: '.json'
      }}
    >
      {previewMode ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Node Preview</h2>
          <p className="text-slate-300">
            Preview mode will show how the node appears in the simulation.
            This feature will be implemented with the actual node preview component.
          </p>
        </div>
      ) : (
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
      )}
    </EditorLayout>
  );
};

export default NodeEditorPage;