/**
 * WorldDropdown - Compact world selector for editor pages
 * 
 * A simple dropdown selector that allows users to choose which world
 * they're adding content to. Used in editor pages for a clean, compact UI.
 */

import React from 'react';
import { Globe, Plus } from 'lucide-react';
import { useWorldContext } from '../contexts/WorldContext';
import { useNavigate } from 'react-router-dom';

const WorldDropdown = ({ 
  label = "Target World",
  showCreateButton = true,
  className = ""
}) => {
  const {
    currentWorldId,
    worlds,
    switchToWorld,
    isLoading
  } = useWorldContext();
  
  const navigate = useNavigate();

  const handleWorldChange = (worldId) => {
    if (worldId && worldId !== currentWorldId) {
      const selectedWorld = worlds.find(w => w.id === worldId);
      const currentWorld = worlds.find(w => w.id === currentWorldId);
      
      if (currentWorld && selectedWorld) {
        const confirmSwitch = window.confirm(
          `Switch from "${currentWorld.name}" to "${selectedWorld.name}"?\n\n` +
          `New content will be added to "${selectedWorld.name}".`
        );
        if (!confirmSwitch) {
          return;
        }
      }
      
      switchToWorld(worldId);
    }
  };

  const handleCreateWorld = () => {
    navigate('/builder');
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
        <span className="text-sm text-gray-400">Loading worlds...</span>
      </div>
    );
  }

  const currentWorld = worlds.find(w => w.id === currentWorldId);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-white">
          {label}
        </label>
        {showCreateButton && (
          <button
            onClick={handleCreateWorld}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded border border-green-600/30 transition-colors"
            title="Create new world"
          >
            <Plus className="w-3 h-3" />
            New
          </button>
        )}
      </div>

      {/* Dropdown */}
      <div className="relative">
        <select
          value={currentWorldId || ''}
          onChange={(e) => handleWorldChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white text-sm appearance-none cursor-pointer hover:border-slate-500/50 focus:border-blue-500/50 focus:outline-none transition-colors"
          disabled={worlds.length === 0}
        >
          {worlds.length === 0 ? (
            <option value="">No worlds available</option>
          ) : (
            <>
              <option value="">Select a world...</option>
              {worlds.map(world => (
                <option key={world.id} value={world.id} className="bg-slate-800">
                  {world.name} ({world.worldConfig?.nodes?.length || 0} nodes, {world.worldConfig?.characters?.length || 0} chars)
                </option>
              ))}
            </>
          )}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Globe className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Current Selection Info */}
      {currentWorld && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">{currentWorld.name}</span>
          </div>
          {currentWorld.description && (
            <p className="text-blue-200/80 text-xs mb-2 line-clamp-2">
              {currentWorld.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-blue-200/60">
            <span>{currentWorld.worldConfig?.nodes?.length || 0} nodes</span>
            <span>{currentWorld.worldConfig?.characters?.length || 0} characters</span>
            <span>{currentWorld.worldConfig?.interactions?.length || 0} interactions</span>
          </div>
        </div>
      )}

      {/* No worlds message */}
      {worlds.length === 0 && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-300 text-sm">
            No worlds available. Create a world first to add content.
          </p>
        </div>
      )}

      {/* Selection hint */}
      {worlds.length > 0 && !currentWorldId && (
        <div className="p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg">
          <p className="text-gray-300 text-sm">
            Select a world to specify where new content will be added.
          </p>
        </div>
      )}
    </div>
  );
};

export default WorldDropdown;