/**
 * WorldSelector - Component for creating and selecting worlds
 * 
 * Provides UI for world management including creation, selection, and deletion.
 * Integrates with WorldContext for state management.
 */

import React, { useState } from 'react';
import { Plus, Globe, Trash2 } from 'lucide-react';
import { useWorldContext } from '../contexts/WorldContext';

const WorldSelector = ({ onWorldSelected, showCreateButton = true }) => {
  const {
    currentWorldId,
    worlds,
    createWorld,
    switchToWorld,
    deleteWorld,
    isLoading,
    error
  } = useWorldContext();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorldName, setNewWorldName] = useState('');
  const [newWorldDescription, setNewWorldDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorld = async (e) => {
    e.preventDefault();
    if (!newWorldName.trim()) return;

    setIsCreating(true);
    try {
      // createWorld is now async and returns immediately with optimistic update
      const worldId = await createWorld(newWorldName.trim(), newWorldDescription.trim());

      // UI updates immediately due to optimistic update
      setNewWorldName('');
      setNewWorldDescription('');
      setShowCreateForm(false);

      if (onWorldSelected) {
        onWorldSelected(worldId);
      }
    } catch (err) {
      console.error('Failed to create world:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectWorld = (worldId) => {
    try {
      const selectedWorld = worlds.find(w => w.id === worldId);
      const currentWorldName = worlds.find(w => w.id === currentWorldId)?.name;
      
      // Show confirmation if switching between different worlds
      if (currentWorldId && currentWorldId !== worldId && selectedWorld) {
        const confirmSwitch = window.confirm(
          `Switch from "${currentWorldName}" to "${selectedWorld.name}"?\n\n` +
          `This will change which world new nodes are added to.`
        );
        if (!confirmSwitch) {
          return;
        }
      }
      
      switchToWorld(worldId);
      if (onWorldSelected) {
        onWorldSelected(worldId);
      }
    } catch (err) {
      console.error('Failed to switch world:', err);
    }
  };

  const handleDeleteWorld = (worldId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this world? This action cannot be undone.')) {
      try {
        deleteWorld(worldId);
      } catch (err) {
        console.error('Failed to delete world:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-300">Loading worlds...</div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Create World Form */}
      {showCreateForm && (
        <div className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">Create New World</h3>

          <form onSubmit={handleCreateWorld} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                World Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newWorldName}
                onChange={(e) => setNewWorldName(e.target.value)}
                placeholder="Enter world name..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                required
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <textarea
                value={newWorldDescription}
                onChange={(e) => setNewWorldDescription(e.target.value)}
                placeholder="Describe your world..."
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                disabled={isCreating}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!newWorldName.trim() || isCreating}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create World'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewWorldName('');
                  setNewWorldDescription('');
                }}
                className="px-6 py-2 border border-white/20 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
                disabled={isCreating}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Worlds List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">
            Your Worlds ({worlds.length})
          </h3>

          {showCreateButton && !showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New World
            </button>
          )}
        </div>

        {worlds.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">No Worlds Yet</h4>
            <p className="text-gray-400 mb-6">Create your first world to get started</p>
            {showCreateButton && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Create Your First World
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {worlds.map((world) => (
              <div
                key={world.id}
                onClick={() => handleSelectWorld(world.id)}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all duration-200 group
                  ${world.id === currentWorldId
                    ? 'border-blue-500/50 bg-blue-500/20'
                    : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Globe className={`w-4 h-4 flex-shrink-0 ${world.id === currentWorldId ? 'text-blue-400' : 'text-gray-400'}`} />
                    <h4 className="font-medium text-white text-sm truncate">{world.name}</h4>
                    {world.id === currentWorldId && (
                      <span className="px-2 py-0.5 bg-blue-500/30 rounded text-xs text-blue-300 flex-shrink-0">
                        Active
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleDeleteWorld(world.id, e)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="Delete World"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {world.description && (
                  <p className="text-gray-300 text-xs mb-2 line-clamp-1">
                    {world.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    <span>{world.worldConfig?.nodes?.length || 0} nodes</span>
                    <span>{world.worldConfig?.characters?.length || 0} chars</span>
                  </div>
                  <span className="text-xs">
                    {new Date(world.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldSelector;