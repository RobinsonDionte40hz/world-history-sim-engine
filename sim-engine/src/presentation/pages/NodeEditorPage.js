/**
 * NodeEditorPage - Dedicated full-page interface for node editing
 * 
 * Provides a focused environment for creating and editing nodes
 * with visual relationship mapping and template integration.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Settings,
  AlertTriangle,
  Download,
  Upload,
  ArrowRight,
  CheckCircle,
  Copy,
  Trash2,
  Edit3,
  Search,
  X
} from 'lucide-react';
import Navigation from '../UI/Navigation';
import NodeEditor from '../components/NodeEditor';
import WorldStateViewer from '../components/WorldStateViewer';
import WorldDropdown from '../UI/WorldDropdown';
import { useWorldContext } from '../contexts/WorldContext';
import WorldValidator from '../../domain/services/WorldValidator';
import useAutoSave from '../hooks/useAutoSave';

const NodeEditorPage = () => {
  const navigate = useNavigate();
  const { 
    currentWorldId,
    currentWorld,
    updateWorldConfig,
    error: worldError
  } = useWorldContext();
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentNode, setCurrentNode] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Node Management States
  const [showNodeList, setShowNodeList] = useState(false);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [worldNodes, setWorldNodes] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Load nodes from current world
  useEffect(() => {
    if (currentWorldId && currentWorld) {
      // Get nodes from world config
      const worldConfigNodes = currentWorld.worldConfig?.nodes || [];
      setWorldNodes(worldConfigNodes);
    } else {
      setWorldNodes([]);
    }
  }, [currentWorldId, currentWorld]);

  // Simple addNode function that works with WorldContext
  const addNode = useCallback((nodeData) => {
    if (!currentWorld) {
      throw new Error('No current world selected');
    }

    // Transform NodeEditor data to world config format
    const worldNodeData = {
      id: nodeData.id,
      name: nodeData.name,
      type: nodeData.type,
      description: nodeData.description,
      environmentalProperties: {
        environment: nodeData.environment,
        features: nodeData.features,
        developmentLevel: nodeData.developmentLevel,
        ...nodeData.modifiers
      },
      resourceAvailability: nodeData.resources?.reduce((acc, resource) => {
        acc[resource] = 'available';
        return acc;
      }, {}) || {},
      culturalContext: {
        populationCapacity: nodeData.populationCapacity,
        currentPopulation: nodeData.currentPopulation,
        tags: nodeData.tags
      },
      connections: nodeData.connections || [],
      metadata: nodeData.metadata || {}
    };

    // Add node to current world's config
    const updatedNodes = [...(currentWorld.worldConfig.nodes || []), worldNodeData];
    updateWorldConfig({
      ...currentWorld.worldConfig,
      nodes: updatedNodes
    });

    // Update local state for immediate UI feedback
    setWorldNodes(updatedNodes);

    console.log('Added node to world:', nodeData.name);
  }, [currentWorld, updateWorldConfig]);

  // Auto-save functionality
  const autoSaveFunction = useCallback(async (nodeData) => {
    if (!currentWorldId || !currentWorld) {
      return; // Don't auto-save if no world selected
    }

    // Validate before auto-saving
    const validation = WorldValidator.validateSingleNode(nodeData);
    if (!validation.isValid) {
      console.warn('Auto-save skipped due to validation errors:', validation.errors);
      return;
    }

    // Save using our addNode function
    addNode(nodeData);
    console.log('Auto-saved node:', nodeData.name);
  }, [currentWorldId, currentWorld, addNode]);

  // Auto-save hook - saves every 30 seconds, only if node is valid
  const {
    isSaving: isAutoSaving,
    lastSaved,
    saveError: autoSaveError,
    hasUnsavedChanges: hasAutoSaveChanges,
    saveNow: saveNowAuto
  } = useAutoSave(
    currentNode, 
    autoSaveFunction, 
    30000, // 30 seconds
    currentNode && currentWorldId && currentWorld // Only enable if world is selected
  );

  // Validation using centralized domain validator
  const validateNode = useCallback(() => {
    const errors = [];

    // Check world-level prerequisites first
    if (!currentWorldId) {
      errors.push({ field: 'world', message: 'No world selected. Please create or select a world first.' });
    }

    if (!currentWorld) {
      errors.push({ field: 'world', message: 'Current world not found.' });
    }

    // Add world error if present
    if (worldError) {
      errors.push({ field: 'world', message: worldError });
    }

    // Use centralized domain validation for node data
    if (currentNode) {
      const nodeValidation = WorldValidator.validateSingleNode(currentNode);
      if (!nodeValidation.isValid) {
        errors.push(...nodeValidation.errors);
      }
      
      // Log warnings to console but don't block saving
      if (nodeValidation.warnings.length > 0) {
        console.warn('Node validation warnings:', nodeValidation.warnings);
      }
    } else {
      errors.push({ field: 'node', message: 'Node data is required' });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [currentNode, worldError, currentWorldId, currentWorld]);

  // Node Management Functions
  const handleDuplicateNode = (node) => {
    const duplicatedNode = {
      ...node,
      id: `node_${Date.now()}`,
      name: `${node.name} (Copy)`
    };
    
    // Add duplicated node to world config
    if (currentWorld && updateWorldConfig) {
      const updatedNodes = [...(currentWorld.worldConfig?.nodes || []), duplicatedNode];
      updateWorldConfig({
        ...currentWorld.worldConfig,
        nodes: updatedNodes
      });
    }
    
    // Refresh world nodes
    setWorldNodes([...worldNodes, duplicatedNode]);
  };

  const handleDeleteNode = (nodeId) => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      // Remove from world config
      if (currentWorld && updateWorldConfig) {
        const worldConfigNodes = currentWorld.worldConfig?.nodes || [];
        const updatedWorldNodes = worldConfigNodes.filter(node => node.id !== nodeId);
        
        updateWorldConfig({
          ...currentWorld.worldConfig,
          nodes: updatedWorldNodes
        });
      }
      
      // Update local state
      setWorldNodes(worldNodes.filter(node => node.id !== nodeId));
      
      // If we're deleting the current node, clear it
      if (currentNode?.id === nodeId) {
        setCurrentNode(null);
        setHasUnsavedChanges(false);
      }
    }
  };

  const handleEditNode = (node) => {
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm('You have unsaved changes. Switch to editing this node?');
      if (!confirmSwitch) return;
    }
    
    setCurrentNode(node);
    setHasUnsavedChanges(false);
    setShowNodeList(false);
  };

  const handleBatchDelete = () => {
    if (selectedNodes.length === 0) return;
    
    const confirmDelete = window.confirm(`Delete ${selectedNodes.length} selected nodes?`);
    if (!confirmDelete) return;
    
    // Remove from world config
    if (currentWorld && updateWorldConfig) {
      const worldConfigNodes = currentWorld.worldConfig?.nodes || [];
      const updatedWorldNodes = worldConfigNodes.filter(node => !selectedNodes.includes(node.id));
      
      updateWorldConfig({
        ...currentWorld.worldConfig,
        nodes: updatedWorldNodes
      });
    }
    
    // Update local state
    setWorldNodes(worldNodes.filter(node => !selectedNodes.includes(node.id)));
    setSelectedNodes([]);
  };

  const handleBatchExport = () => {
    if (selectedNodes.length === 0) return;
    
    const nodesToExport = worldNodes.filter(node => selectedNodes.includes(node.id));
    const dataStr = JSON.stringify(nodesToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `nodes-batch-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Filter nodes based on search and type
  const filteredNodes = worldNodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || node.type === filterType;
    return matchesSearch && matchesType;
  });





  const handleSave = async (nodeData) => {
    if (!validateNode()) {
      return;
    }

    // Check if we have a current world
    if (!currentWorldId || !currentWorld) {
      setValidationErrors([{ 
        field: 'world', 
        message: 'No world selected. Please create or select a world first.' 
      }]);
      return;
    }

    setIsSaving(true);
    try {
      // Save using our addNode function
      addNode(nodeData);
      
      // Force auto-save to update its state
      await saveNowAuto();
      
      setSaveSuccess(true);
      console.log('Node saved manually to world:', currentWorldId, nodeData);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Save failed:', error);
      setValidationErrors([{ 
        field: 'save', 
        message: error.message || 'Failed to save node' 
      }]);
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

  const handleNodeChange = (nodeData) => {
    setCurrentNode(nodeData);
    // Clear any previous success messages when editing
    setSaveSuccess(false);
  };

  // Update hasUnsavedChanges based on auto-save state
  useEffect(() => {
    setHasUnsavedChanges(hasAutoSaveChanges);
  }, [hasAutoSaveChanges]);



  const handleExportTemplate = () => {
    if (currentNode) {
      const dataStr = JSON.stringify(currentNode, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

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

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-600/10 border-b border-green-600/30 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="text-green-400 text-sm font-medium">
              Node saved successfully to your world!
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
            
            {/* World Selection Section */}
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <WorldDropdown 
                  label="Add Node To"
                  showCreateButton={true}
                />
              </div>
            </div>
            
            {/* World Selection Status */}
            <div className="mt-4 max-w-2xl mx-auto">
              {!currentWorldId ? (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <div className="text-center">
                      <p className="text-red-300 text-sm mb-2">
                        No world selected. Please create or select a world first.
                      </p>
                      <button
                        onClick={() => navigate('/editors/world')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Create World
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    <div className="text-center">
                      <p className="text-blue-300 text-sm mb-1">
                        <strong>Target World:</strong> {currentWorld?.name || 'Unknown'}
                      </p>
                      <p className="text-blue-200 text-xs">
                        Nodes will be added to this world
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {currentWorldId && currentWorld && (!currentWorld.worldConfig.name || !currentWorld.worldConfig.description) && (
              <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg max-w-2xl mx-auto">
                <div className="flex items-center gap-2 justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-300 text-sm">
                    World properties must be set before creating nodes. Please complete world setup first.
                  </p>
                </div>
              </div>
            )}
            
            {currentWorldId && currentWorld && currentWorld.worldConfig.name && currentWorld.worldConfig.description && (!currentWorld.worldConfig.nodes || currentWorld.worldConfig.nodes.length === 0) && (
              <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg max-w-2xl mx-auto">
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-green-300 text-sm">
                    Ready to create nodes! Your world is properly configured.
                  </p>
                </div>
              </div>
            )}
            
            {/* World Details Panel */}
            {currentWorldId && currentWorld && (
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg max-w-2xl mx-auto">
                <h4 className="text-white font-medium mb-2 text-center">World Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-400">Nodes</div>
                    <div className="text-white font-medium">
                      {currentWorld.worldConfig?.nodes?.length || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Characters</div>
                    <div className="text-white font-medium">
                      {currentWorld.worldConfig?.characters?.length || 0}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="text-gray-400 text-xs">Description</div>
                  <div className="text-gray-300 text-xs mt-1">
                    {currentWorld.description || currentWorld.worldConfig?.description || 'No description'}
                  </div>
                </div>
              </div>
            )}
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

            {/* Node Management Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNodeList(true)}
                disabled={!currentWorldId}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MapPin className="w-4 h-4" />
                View All Nodes
              </button>

              <button
                onClick={() => setShowBatchActions(true)}
                disabled={!currentWorldId}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Settings className="w-4 h-4" />
                Batch Actions
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => currentNode && handleSave(currentNode)}
                disabled={!hasUnsavedChanges || isSaving || validationErrors.length > 0 || !currentNode || !currentWorldId || !currentWorld}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  hasUnsavedChanges && !isSaving && validationErrors.length === 0 && currentNode && currentWorldId && currentWorld
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isSaving ? 'Saving...' : (saveSuccess ? 'Saved!' : (hasUnsavedChanges ? 'Save Node' : 'Save Node'))}
              </button>

              {hasUnsavedChanges && !isSaving && currentNode && currentWorldId && currentWorld && (
                <button
                  onClick={() => saveNowAuto()}
                  disabled={isAutoSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                  title="Save immediately (don't wait for auto-save)"
                >
                  {isAutoSaving ? 'Saving...' : 'Save Now'}
                </button>
              )}
            </div>

            <button
              onClick={() => navigate('/editors/world')}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
            >
              <ArrowRight className="w-4 h-4" />
              Next Steps
            </button>
          </div>

          {/* Auto-save Status */}
          {currentNode && currentWorldId && (
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              {isAutoSaving && (
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Auto-saving...</span>
                </div>
              )}
              
              {lastSaved && !isAutoSaving && (
                <div className="text-green-400">
                  <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
              
              {autoSaveError && (
                <div className="text-red-400">
                  <span>Auto-save failed: {autoSaveError}</span>
                </div>
              )}
              
              {hasUnsavedChanges && !isAutoSaving && (
                <div className="text-yellow-400">
                  <span>Unsaved changes (auto-save in 30s)</span>
                </div>
              )}
            </div>
          )}

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
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onChange={handleNodeChange}
                  mode={currentNode ? 'edit' : 'create'}
                />
              </div>
            )}
          </div>

          {/* World State Viewer */}
          <div className="mt-12">
            <WorldStateViewer />
          </div>

          {/* Current World Nodes */}
          {currentWorld && currentWorld.worldConfig && currentWorld.worldConfig.nodes && currentWorld.worldConfig.nodes.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white text-center mb-8">
                Current World Nodes ({currentWorld.worldConfig.nodes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentWorld.worldConfig.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl"
                  >
                    <h3 className="text-xl font-semibold text-white mb-2">{node.name}</h3>
                    <p className="text-gray-300 text-sm mb-3">{node.description}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-blue-500/20 rounded text-blue-300">
                        {node.type}
                      </span>
                      {node.environmentalProperties?.environment && (
                        <span className="px-2 py-1 bg-green-500/20 rounded text-green-300">
                          {typeof node.environmentalProperties.environment === 'object' 
                            ? node.environmentalProperties.environment.terrain || 'Environment'
                            : node.environmentalProperties.environment}
                        </span>
                      )}
                    </div>
                    {node.resourceAvailability && Object.keys(node.resourceAvailability).length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-1">Resources:</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(node.resourceAvailability).slice(0, 3).map((resource) => (
                            <span key={resource} className="px-1 py-0.5 bg-yellow-500/20 rounded text-xs text-yellow-300">
                              {resource}
                            </span>
                          ))}
                          {Object.keys(node.resourceAvailability).length > 3 && (
                            <span className="px-1 py-0.5 bg-gray-500/20 rounded text-xs text-gray-300">
                              +{Object.keys(node.resourceAvailability).length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Next Steps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <button
                onClick={() => navigate('/editors/characters')}
                className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                    <Settings className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create Characters</h3>
                </div>
                <p className="text-gray-300 text-sm text-left">
                  Design NPCs with personalities and attributes
                </p>
              </button>

              <button
                onClick={() => navigate('/editors/interactions')}
                className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                    <Settings className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create Interactions</h3>
                </div>
                <p className="text-gray-300 text-sm text-left">
                  Define actions and capabilities for your world
                </p>
              </button>

              <button
                onClick={() => navigate('/editors/encounters')}
                className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                    <Settings className="w-5 h-5 text-indigo-400" />
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

      {/* Node List Modal */}
      {showNodeList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/20 max-w-6xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold text-white">All Nodes</h2>
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm">
                    {worldNodes.length} total
                  </span>
                </div>
                <button
                  onClick={() => setShowNodeList(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search nodes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="all" className="bg-gray-800">All Types</option>
                  <option value="settlement" className="bg-gray-800">Settlement</option>
                  <option value="wilderness" className="bg-gray-800">Wilderness</option>
                  <option value="dungeon" className="bg-gray-800">Dungeon</option>
                  <option value="landmark" className="bg-gray-800">Landmark</option>
                  <option value="resource" className="bg-gray-800">Resource</option>
                  <option value="sacred" className="bg-gray-800">Sacred</option>
                </select>
              </div>

              {/* Node Grid */}
              {filteredNodes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNodes.map(node => (
                    <div key={node.id} className="p-4 bg-white/10 rounded-lg border border-white/20">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{node.name}</h3>
                          <p className="text-sm text-gray-300 capitalize">{node.type}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditNode(node)}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicateNode(node)}
                            className="p-1 text-green-400 hover:text-green-300 transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNode(node.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {node.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Population: {node.culturalContext?.currentPopulation || 0}/{node.culturalContext?.populationCapacity || 0}</span>
                        <span>Resources: {Object.keys(node.resourceAvailability || {}).length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">
                    {worldNodes.length === 0 ? 'No nodes in this world yet' : 'No nodes match your search'}
                  </p>
                  {worldNodes.length === 0 && (
                    <button
                      onClick={() => {
                        setShowNodeList(false);
                        setCurrentNode(null);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Create First Node
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Batch Actions Modal */}
      {showBatchActions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-white">Batch Actions</h2>
                </div>
                <button
                  onClick={() => setShowBatchActions(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Selection Area */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Select Nodes</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedNodes(worldNodes.map(n => n.id))}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedNodes([])}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {worldNodes.map(node => (
                    <label key={node.id} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedNodes.includes(node.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNodes([...selectedNodes, node.id]);
                          } else {
                            setSelectedNodes(selectedNodes.filter(id => id !== node.id));
                          }
                        }}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-white">{node.name}</div>
                        <div className="text-sm text-gray-400 capitalize">{node.type}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-4 text-sm text-gray-400">
                  {selectedNodes.length} of {worldNodes.length} nodes selected
                </div>
              </div>

              {/* Batch Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleBatchExport}
                    disabled={selectedNodes.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Export Selected
                  </button>
                  
                  <button
                    onClick={handleBatchDelete}
                    disabled={selectedNodes.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeEditorPage;
