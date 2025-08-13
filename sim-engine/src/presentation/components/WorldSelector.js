/**
 * WorldSelector - Component for creating and selecting worlds
 * 
 * Provides UI for world management including creation, selection, and deletion.
 * Integrates with WorldContext for state management.
 */

import React, { useState } from 'react';
import { Plus, Globe, Trash2, Calendar, Users } from 'lucide-react';
import { useWorldContext } from '../contexts/WorldContext';

const WorldSelector = ({ onWorldSelected, showCreateButton = true, compact = false }) => {
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

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Current World Display */}
        {currentWorldId && (
          <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <div className="flex-1">
                <span className="text-blue-300 text-sm font-medium">
                  {worlds.find(w => w.id === currentWorldId)?.name || 'Unknown World'}
                </span>
                <div className="text-blue-200 text-xs mt-1">
                  {(() => {
                    const world = worlds.find(w => w.id === currentWorldId);
                    if (!world) return 'Unknown world';
                    const nodeCount = world.worldConfig?.nodes?.length || 0;
                    const charCount = world.worldConfig?.characters?.length || 0;
                    return `${nodeCount} nodes, ${charCount} characters`;
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          {showCreateButton && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              New World
            </button>
          )}

          {worlds.length > 0 && (
            <div className="flex-1">
              <select
                value={currentWorldId || ''}
                onChange={(e) => e.target.value && handleSelectWorld(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                title={worlds.length === 1 ? "Only one world available" : "Select a world"}
              >
                <option value="">Select World</option>
                {worlds.map(world => (
                  <option key={world.id} value={world.id} className="bg-gray-800">
                    {world.name} ({world.worldConfig?.nodes?.length || 0} nodes)
                  </option>
                ))}
              </select>
              
              {/* World Selection Hint */}
              {worlds.length === 1 && currentWorldId && (
                <div className="mt-1 text-xs text-gray-400 text-center">
                  Only one world available - automatically selected
                </div>
              )}
              
              {worlds.length > 1 && (
                <div className="mt-1 text-xs text-gray-400 text-center">
                  {worlds.length} worlds available - choose target for new nodes
                </div>
              )}
            </div>
          )}
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {worlds.map((world) => (
              <div
                key={world.id}
                onClick={() => handleSelectWorld(world.id)}
                className={`
                  p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200
                  ${world.id === currentWorldId
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className={`w-5 h-5 ${world.id === currentWorldId ? 'text-blue-400' : 'text-gray-400'}`} />
                    <h4 className="font-semibold text-white">{world.name}</h4>
                  </div>

                  <button
                    onClick={(e) => handleDeleteWorld(world.id, e)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete World"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {world.description || 'No description'}
                </p>

                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Modified {new Date(world.lastModified).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    <span>
                      {world.worldConfig?.nodes?.length || 0} nodes, {' '}
                      {world.worldConfig?.characters?.length || 0} characters
                    </span>
                  </div>
                </div>

                {world.id === currentWorldId && (
                  <div className="mt-3 px-2 py-1 bg-blue-500/30 rounded text-xs text-blue-300 text-center">
                    Current World
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldSelector;