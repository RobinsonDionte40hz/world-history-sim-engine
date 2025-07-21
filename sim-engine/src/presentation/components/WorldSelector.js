/**
 * WorldSelector Component - Choose existing worlds or create new ones
 * 
 * Provides a unified interface for selecting existing worlds or creating new ones,
 * with world metadata display and management capabilities.
 * 
 * Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  FileText, 
  Trash2, 
  Download, 
  Upload,
  Search,
  Clock
} from 'lucide-react';
import worldPersistenceService from '../../application/services/WorldPersistenceService';
import editorStateManager from '../../application/services/EditorStateManager';

const WorldSelector = ({ 
  onWorldSelected, 
  onCreateNew, 
  className = '',
  showCreateButton = true,
  showManagementActions = true 
}) => {
  const [worlds, setWorlds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [error, setError] = useState(null);

  // Load worlds on component mount
  useEffect(() => {
    loadWorlds();
  }, []);

  const loadWorlds = async () => {
    try {
      setLoading(true);
      setError(null);
      const worldsList = await worldPersistenceService.getAllWorlds();
      setWorlds(worldsList);
    } catch (err) {
      setError('Failed to load worlds: ' + err.message);
      console.error('Error loading worlds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWorldSelect = async (world) => {
    try {
      setSelectedWorld(world);
      
      // Load full world data
      const fullWorldData = await worldPersistenceService.loadWorld(world.id);
      
      // Update editor state manager
      editorStateManager.setCurrentWorld(fullWorldData);
      
      if (onWorldSelected) {
        onWorldSelected(fullWorldData);
      }
    } catch (err) {
      setError('Failed to load world: ' + err.message);
      console.error('Error loading world:', err);
    }
  };

  const handleCreateNew = () => {
    setSelectedWorld(null);
    editorStateManager.reset();
    
    if (onCreateNew) {
      onCreateNew();
    }
  };

  const handleDeleteWorld = async (worldId, worldName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${worldName}"? This action cannot be undone.`
    );
    
    if (confirmed) {
      try {
        await worldPersistenceService.deleteWorld(worldId);
        await loadWorlds(); // Refresh the list
        
        // If the deleted world was selected, clear selection
        if (selectedWorld?.id === worldId) {
          setSelectedWorld(null);
          editorStateManager.reset();
        }
      } catch (err) {
        setError('Failed to delete world: ' + err.message);
        console.error('Error deleting world:', err);
      }
    }
  };

  const handleExportWorld = async (worldId, worldName) => {
    try {
      const exportData = await worldPersistenceService.exportWorld(worldId);
      
      // Create download link
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${worldName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export world: ' + err.message);
      console.error('Error exporting world:', err);
    }
  };

  const handleImportWorld = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        await worldPersistenceService.importWorld(importData);
        await loadWorlds(); // Refresh the list
      } catch (err) {
        setError('Failed to import world: ' + err.message);
        console.error('Error importing world:', err);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredWorlds = worlds.filter(world =>
    world.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    world.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-slate-400">Loading worlds...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Globe className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">World Selector</h2>
        </div>
        
        {showManagementActions && (
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImportWorld}
                className="hidden"
              />
              <div className="p-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500 rounded-lg transition-colors">
                <Upload className="w-4 h-4 text-slate-400" />
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search worlds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Create New World Button */}
      {showCreateButton && (
        <button
          onClick={handleCreateNew}
          className="w-full mb-4 p-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/30 rounded-lg transition-colors group"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="p-2 bg-indigo-500/20 group-hover:bg-indigo-500/30 rounded-lg transition-colors">
              <Plus className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-indigo-400 group-hover:text-indigo-300">
                Create New World
              </h3>
              <p className="text-sm text-indigo-400/70">
                Start building a new world from scratch
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Worlds List */}
      <div className="space-y-3">
        {filteredWorlds.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">
              {searchQuery ? 'No worlds match your search' : 'No worlds found'}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {!searchQuery && 'Create your first world to get started'}
            </p>
          </div>
        ) : (
          filteredWorlds.map((world) => (
            <div
              key={world.id}
              className={`
                p-4 border rounded-lg transition-all duration-200 cursor-pointer
                ${selectedWorld?.id === world.id
                  ? 'bg-indigo-500/10 border-indigo-500/30'
                  : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50 hover:border-slate-500/50'
                }
              `}
              onClick={() => handleWorldSelect(world)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Globe className={`w-5 h-5 ${
                      selectedWorld?.id === world.id ? 'text-indigo-400' : 'text-slate-400'
                    }`} />
                    <h3 className={`font-medium ${
                      selectedWorld?.id === world.id ? 'text-indigo-300' : 'text-white'
                    }`}>
                      {world.name}
                    </h3>
                  </div>
                  
                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                    {world.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(world.lastModified)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3 h-3" />
                      <span>v{world.version}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {showManagementActions && (
                  <div className="flex items-center space-x-1 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportWorld(world.id, world.name);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-600/50 rounded-lg transition-colors"
                      title="Export World"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorld(world.id, world.name);
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete World"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected World Info */}
      {selectedWorld && (
        <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
          <h4 className="text-sm font-medium text-indigo-400 mb-2">Selected World</h4>
          <p className="text-sm text-slate-300">{selectedWorld.name}</p>
          <p className="text-xs text-slate-400 mt-1">
            Last modified: {formatDate(selectedWorld.lastModified)}
          </p>
        </div>
      )}
    </div>
  );
};

export default WorldSelector;