// src/PrestigeSystem.js
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Edit, ChevronDown, ChevronUp, Crown, ArrowUp, ArrowDown } from 'lucide-react';

// Class to manage player prestige across different tracks
export class PrestigeManager {
  constructor(prestigeTracks = []) {
    this.tracks = prestigeTracks;
    this.playerPrestige = {};
    this.history = {};
    
    // Initialize values from tracks
    for (const track of prestigeTracks) {
      this.playerPrestige[track.id] = 0; // Start at zero prestige
      this.history[track.id] = [];
    }
  }
  
  // Get current prestige for a track
  getPrestige(trackId) {
    return this.playerPrestige[trackId] || 0;
  }
  
  // Get the current level in a prestige track
  getPrestigeLevel(trackId) {
    const value = this.getPrestige(trackId);
    const track = this.tracks.find(t => t.id === trackId);
    
    if (!track || !track.levels || track.levels.length === 0) return null;
    
    // Sort levels by threshold for safety
    const sortedLevels = [...track.levels].sort((a, b) => a.threshold - b.threshold);
    
    // Find the highest threshold that the current value exceeds
    for (let i = sortedLevels.length - 1; i >= 0; i--) {
      if (value >= sortedLevels[i].threshold) {
        return sortedLevels[i];
      }
    }
    
    // If no level matches (should only happen if first threshold > 0)
    return null;
  }
  
  // Modify prestige with a reason
  changePrestige(trackId, amount, reason) {
    // Find the track
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) return false;
    
    // Calculate new value
    let newValue = (this.playerPrestige[trackId] || 0) + amount;
    
    // Record history
    this.history[trackId] = this.history[trackId] || [];
    this.history[trackId].push({
      timestamp: new Date(),
      change: amount,
      newValue,
      reason
    });
    
    // Update current value
    this.playerPrestige[trackId] = newValue;
    
    // Handle counter tracks - if configured, gaining prestige in one track
    // might reduce prestige in opposing tracks
    if (track.counterTracks && amount > 0) {
      for (const counterTrackId of track.counterTracks) {
        // Apply a penalty to the counter track (e.g., 25% of the gained amount)
        const counterPenalty = Math.floor(amount * -0.25);
        if (counterPenalty !== 0) {
          this.changePrestige(
            counterTrackId, 
            counterPenalty, 
            `Counter effect from gaining ${track.name} prestige`
          );
        }
      }
    }
    
    return true;
  }
  
  // Apply decay to prestige tracks that have decay rates
  applyDecay() {
    for (const track of this.tracks) {
      if (track.decayRate && track.decayRate > 0) {
        const currentValue = this.playerPrestige[track.id] || 0;
        if (currentValue > 0) {
          const decayAmount = -Math.min(currentValue, track.decayRate);
          if (decayAmount !== 0) {
            this.changePrestige(
              track.id,
              decayAmount,
              "Periodic prestige decay"
            );
          }
        }
      }
    }
  }
  
  // Apply effects when completing an interaction
  applyInteractionEffects(interaction) {
    if (!interaction.effects?.prestigeChanges) return;
    
    for (const change of interaction.effects.prestigeChanges) {
      this.changePrestige(
        change.trackId, 
        change.change, 
        change.description || `Completed interaction: ${interaction.title}`
      );
    }
  }
  
  // Get a player state object with prestige data for prerequisite checking
  getPlayerStateWithPrestige(basePlayerState = {}) {
    return {
      ...basePlayerState,
      prestige: Object.keys(this.playerPrestige).reduce((acc, trackId) => {
        acc[trackId] = {
          value: this.playerPrestige[trackId],
          level: this.getPrestigeLevel(trackId)
        };
        return acc;
      }, {})
    };
  }
}

// Component for editing a single prestige track
export const PrestigeTrackEditor = ({ track, updateTrack, deleteTrack, onCancel }) => {
  const [levels, setLevels] = useState(track.levels || []);
  const [counterTracks, setCounterTracks] = useState(track.counterTracks || []);
  const [allTracks, setAllTracks] = useState([]);

  // Load all tracks for counter track selection
  useEffect(() => {
    const savedTracks = localStorage.getItem('prestigeTracks');
    if (savedTracks) {
      const parsedTracks = JSON.parse(savedTracks);
      setAllTracks(parsedTracks.filter(t => t.id !== track.id)); // Exclude current track
    }
  }, [track.id]);

  const addLevel = () => {
    // Calculate a suggested threshold based on existing levels
    let suggestedThreshold = 0;
    if (levels.length > 0) {
      const maxThreshold = Math.max(...levels.map(l => l.threshold));
      suggestedThreshold = maxThreshold + 100; // Arbitrary increment
    }
    
    const newLevel = {
      id: `level_${Date.now()}`,
      name: "New Level",
      threshold: suggestedThreshold,
      description: ""
    };
    setLevels([...levels, newLevel]);
  };

  const updateLevel = (index, field, value) => {
    const updatedLevels = [...levels];
    updatedLevels[index] = {
      ...updatedLevels[index],
      [field]: field === 'threshold' ? parseInt(value) : value
    };
    setLevels(updatedLevels);
  };

  const removeLevel = (index) => {
    if (window.confirm('Are you sure you want to remove this level?')) {
      const updatedLevels = [...levels];
      updatedLevels.splice(index, 1);
      setLevels(updatedLevels);
    }
  };

  const addCounterTrack = (trackId) => {
    if (trackId && !counterTracks.includes(trackId)) {
      setCounterTracks([...counterTracks, trackId]);
    }
  };

  const removeCounterTrack = (trackId) => {
    setCounterTracks(counterTracks.filter(id => id !== trackId));
  };

  const saveTrack = () => {
    // Sort levels by threshold
    const sortedLevels = [...levels].sort((a, b) => a.threshold - b.threshold);
    
    updateTrack({
      ...track,
      levels: sortedLevels,
      counterTracks
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {track.id ? 'Edit Prestige Track' : 'Create New Prestige Track'}
        </h2>
        <button 
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
          <input
            type="text"
            value={track.id}
            onChange={(e) => updateTrack({...track, id: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="unique_id"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={track.name}
            onChange={(e) => updateTrack({...track, name: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Prestige Track Name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={track.description}
            onChange={(e) => updateTrack({...track, description: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="What this prestige track represents"
            rows="3"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={track.color}
              onChange={(e) => updateTrack({...track, color: e.target.value})}
              className="p-1 border border-gray-300 rounded h-10 w-20"
            />
            <span className="text-sm text-gray-600">{track.color}</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Decay Rate (per period)</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={track.decayRate || 0}
              onChange={(e) => updateTrack({...track, decayRate: parseInt(e.target.value)})}
              className="p-2 border border-gray-300 rounded w-20"
              min="0"
            />
            <span className="text-sm text-gray-600">
              Points lost per time period (0 = no decay)
            </span>
          </div>
        </div>
        
        {/* Counter Tracks Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Counter Tracks</label>
          <p className="text-xs text-gray-500 mb-2">
            Gaining prestige in this track will reduce prestige in these counter tracks
          </p>
          
          <div className="flex items-center space-x-2 mb-2">
            <select
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
              defaultValue=""
              id="counterTrackToAdd"
            >
              <option value="" disabled>Select a counter track...</option>
              {allTracks
                .filter(t => !counterTracks.includes(t.id))
                .map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))
              }
            </select>
            <button
              onClick={() => {
                const select = document.getElementById('counterTrackToAdd');
                if (select.value) {
                  addCounterTrack(select.value);
                  select.value = "";
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
            >
              Add
            </button>
          </div>
          
          <div className="space-y-2">
            {counterTracks.length === 0 ? (
              <p className="text-center py-2 text-gray-500 italic">No counter tracks selected</p>
            ) : (
              counterTracks.map(trackId => {
                const counterTrack = allTracks.find(t => t.id === trackId);
                return (
                  <div 
                    key={trackId} 
                    className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <span>{counterTrack ? counterTrack.name : trackId}</span>
                    <button
                      onClick={() => removeCounterTrack(trackId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Levels Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Prestige Levels</h3>
            <button 
              onClick={addLevel}
              className="bg-green-500 hover:bg-green-600 text-white p-1 rounded text-xs flex items-center"
            >
              <Plus size={16} className="mr-1" /> Add Level
            </button>
          </div>
          
          {levels.length === 0 && (
            <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded">
              No levels defined yet. Add your first level.
            </div>
          )}
          
          {levels
            .sort((a, b) => a.threshold - b.threshold) // Display in threshold order
            .map((level, index) => (
            <div key={level.id} className="p-3 border border-gray-200 rounded mb-3 bg-gray-50">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Level {index + 1}</span>
                <button 
                  onClick={() => removeLevel(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Level ID</label>
                  <input
                    type="text"
                    value={level.id}
                    onChange={(e) => updateLevel(index, 'id', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={level.name}
                    onChange={(e) => updateLevel(index, 'name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Threshold</label>
                  <input
                    type="number"
                    value={level.threshold}
                    onChange={(e) => updateLevel(index, 'threshold', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={level.description}
                    onChange={(e) => updateLevel(index, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
        <button 
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
        >
          Cancel
        </button>
        {track.id && (
          <button 
            onClick={() => deleteTrack(track.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
          >
            Delete
          </button>
        )}
        <button 
          onClick={saveTrack}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <Save size={18} className="mr-1" /> Save
        </button>
      </div>
    </div>
  );
};

// Component for managing prestige tracks
export const PrestigeTrackManager = ({ prestigeTracks, setPrestigeTracks }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedTrack, setExpandedTrack] = useState(null);
  
  const createNewTrack = () => {
    const newTrack = {
      id: `prestige_${Date.now()}`,
      name: "New Prestige Track",
      description: "",
      color: "#" + Math.floor(Math.random()*16777215).toString(16),
      decayRate: 0,
      counterTracks: [],
      levels: [
        {
          id: "level_1",
          name: "Novice",
          threshold: 0,
          description: "Just starting out"
        },
        {
          id: "level_2",
          name: "Recognized",
          threshold: 100,
          description: "Beginning to be noticed"
        }
      ]
    };
    
    setCurrentTrack(newTrack);
    setIsEditing(true);
  };
  
  const editTrack = (track) => {
    setCurrentTrack({...track});
    setIsEditing(true);
  };
  
  const deleteTrack = (id) => {
    if (window.confirm('Are you sure you want to delete this prestige track?')) {
      setPrestigeTracks(prestigeTracks.filter(track => track.id !== id));
      setIsEditing(false);
      setCurrentTrack(null);
    }
  };
  
  const saveTrack = (track) => {
    if (!track.id.trim() || !track.name.trim()) {
      alert("ID and name are required");
      return;
    }
    
    const existingIndex = prestigeTracks.findIndex(d => d.id === track.id);
    
    if (existingIndex >= 0) {
      // Update existing
      const updatedTracks = [...prestigeTracks];
      updatedTracks[existingIndex] = track;
      setPrestigeTracks(updatedTracks);
    } else {
      // Add new
      setPrestigeTracks([...prestigeTracks, track]);
    }
    
    setIsEditing(false);
    setCurrentTrack(null);
  };
  
  const toggleTrackExpand = (id) => {
    if (expandedTrack === id) {
      setExpandedTrack(null);
    } else {
      setExpandedTrack(id);
    }
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentTrack(null);
  };
  
  return (
    <div>
      {isEditing && currentTrack ? (
        <PrestigeTrackEditor
          track={currentTrack}
          updateTrack={saveTrack}
          deleteTrack={deleteTrack}
          onCancel={cancelEdit}
        />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Prestige Tracks</h2>
            <button 
              onClick={createNewTrack} 
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
              title="Create new prestige track"
            >
              <Plus size={18} />
            </button>
          </div>
          
          <div className="space-y-2">
            {prestigeTracks.map(track => (
              <div 
                key={track.id} 
                className="bg-gray-50 rounded border border-gray-200"
                style={{borderLeft: `4px solid ${track.color}`}}
              >
                <div 
                  className="p-2 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleTrackExpand(track.id)}
                >
                  <div className="flex items-center">
                    <Crown size={18} className="mr-2 text-gray-600" />
                    <span className="font-medium">{track.name}</span>
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                      {track.levels?.length || 0} levels
                    </span>
                    {track.decayRate > 0 && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Decay: {track.decayRate}/period
                      </span>
                    )}
                  </div>
                  {expandedTrack === track.id ? 
                    <ChevronUp size={18} /> : 
                    <ChevronDown size={18} />
                  }
                </div>
                
                {expandedTrack === track.id && (
                  <div className="p-2 pt-0 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">{track.description}</p>
                    
                    {/* Display Counter Tracks */}
                    {track.counterTracks?.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-500">Counter Tracks:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {track.counterTracks.map(counterId => {
                            const counterTrack = prestigeTracks.find(t => t.id === counterId);
                            return (
                              <span 
                                key={counterId}
                                className="text-xs px-2 py-0.5 rounded-full bg-gray-200"
                                style={counterTrack ? {borderLeft: `2px solid ${counterTrack.color}`} : {}}
                              >
                                {counterTrack ? counterTrack.name : counterId}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Display Levels */}
                    <div className="mb-2">
                      <span className="text-xs text-gray-500">Levels:</span>
                      <div className="flex flex-col gap-1 mt-1">
                        {(track.levels || [])
                          .sort((a, b) => a.threshold - b.threshold)
                          .map(level => (
                            <div 
                              key={level.id}
                              className="text-xs p-1 rounded bg-gray-100 flex justify-between"
                            >
                              <span className="font-medium">{level.name}</span>
                              <span className="text-gray-500">
                                {level.threshold}+ points
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          editTrack(track);
                        }}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-1 rounded flex-1 text-xs"
                      >
                        <Edit size={14} className="inline mr-1" />
                        Edit
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTrack(track.id);
                        }}
                        className="bg-red-100 hover:bg-red-200 text-red-700 p-1 rounded flex-1 text-xs"
                      >
                        <Trash2 size={14} className="inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {prestigeTracks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No prestige tracks defined yet. Create your first one!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Component for managing prestige effects in an interaction
export const PrestigeEffectsEditor = ({ interaction, updateInteraction, prestigeTracks }) => {
  const addPrestigeChange = () => {
    const newChange = {
      id: `prestige_change_${Date.now()}`,
      trackId: "",
      change: 0,
      description: ""
    };
    
    // Ensure the effects structure exists
    const currentEffects = interaction.effects || {};
    
    updateInteraction({
      ...interaction,
      effects: {
        ...currentEffects,
        prestigeChanges: [...(currentEffects.prestigeChanges || []), newChange]
      }
    });
  };
  
  const updatePrestigeChange = (index, updatedChange) => {
    const updatedChanges = [...(interaction.effects?.prestigeChanges || [])];
    updatedChanges[index] = updatedChange;
    
    updateInteraction({
      ...interaction,
      effects: {
        ...interaction.effects,
        prestigeChanges: updatedChanges
      }
    });
  };
  
  const removePrestigeChange = (index) => {
    const updatedChanges = [...(interaction.effects?.prestigeChanges || [])];
    updatedChanges.splice(index, 1);
    
    updateInteraction({
      ...interaction,
      effects: {
        ...interaction.effects,
        prestigeChanges: updatedChanges
      }
    });
  };
  
  // Ensure effects structure exists
  if (!interaction.effects) {
    updateInteraction({
      ...interaction,
      effects: {
        prestigeChanges: []
      }
    });
    return null;
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Prestige Effects</h2>
        <button 
          onClick={addPrestigeChange}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center text-sm"
        >
          <Plus size={16} className="mr-1" /> Add Effect
        </button>
      </div>
      
      {(interaction.effects?.prestigeChanges || []).map((change, index) => {
        const track = prestigeTracks.find(t => t.id === change.trackId);
        
        return (
          <div 
            key={change.id} 
            className="p-4 border border-gray-200 rounded mb-3 bg-gray-50"
            style={track ? {borderLeft: `4px solid ${track.color}`} : {}}
          >
            <div className="flex justify-between mb-3">
              <span className="font-medium">Prestige Change</span>
              <button 
                onClick={() => removePrestigeChange(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prestige Track</label>
                <select
                  value={change.trackId}
                  onChange={(e) => updatePrestigeChange(index, { ...change, trackId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select track...</option>
                  {prestigeTracks.map(track => (
                    <option key={track.id} value={track.id}>
                      {track.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Change Amount</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={change.change}
                    onChange={(e) => updatePrestigeChange(index, { ...change, change: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <div className="ml-2">
                    {change.change > 0 ? (
                      <ArrowUp className="text-green-500" size={18} />
                    ) : change.change < 0 ? (
                      <ArrowDown className="text-red-500" size={18} />
                    ) : (
                      <span className="text-gray-400">±0</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={change.description}
                onChange={(e) => updatePrestigeChange(index, { ...change, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="E.g., 'Impressed the noble with your manners'"
              />
            </div>
            
            {/* Show impact on prestige level if a track is selected */}
            {track && track.levels && track.levels.length > 0 && (
              <div className="mt-3 p-2 bg-gray-100 rounded">
                <p className="text-xs text-gray-600 mb-1">Impact:</p>
                {(() => {
                  // Display how prestige change would affect level
                  const sortedLevels = [...track.levels].sort((a, b) => a.threshold - b.threshold);
                  
                  // Let's say 50 is our example current value
                  // In a real application, this would be the player's actual prestige value
                  const currentValue = 50;
                  const newValue = currentValue + change.change;
                  
                  // Find current level
                  let currentLevel = null;
                  for (let i = sortedLevels.length - 1; i >= 0; i--) {
                    if (currentValue >= sortedLevels[i].threshold) {
                      currentLevel = sortedLevels[i];
                      break;
                    }
                  }
                  
                  // Find new level
                  let newLevel = null;
                  for (let i = sortedLevels.length - 1; i >= 0; i--) {
                    if (newValue >= sortedLevels[i].threshold) {
                      newLevel = sortedLevels[i];
                      break;
                    }
                  }
                  
                  if (!currentLevel && !newLevel) {
                    return <span className="text-xs">Not enough prestige to reach any level</span>;
                  }
                  
                  if (currentLevel?.id === newLevel?.id) {
                    return (
                      <span className="text-xs">
                        Remains at "{newLevel.name}" level ({newValue} points)
                      </span>
                    );
                  }
                  
                  if (!currentLevel && newLevel) {
                    return (
                      <span className="text-xs text-green-600">
                        Reaches "{newLevel.name}" level ({newValue} points)
                      </span>
                    );
                  }
                  
                  if (currentLevel && !newLevel) {
                    return (
                      <span className="text-xs text-red-600">
                        Drops below "{currentLevel.name}" level ({newValue} points)
                      </span>
                    );
                  }
                  
                  if (newValue > currentValue) {
                    return (
                      <span className="text-xs text-green-600">
                        Increases from "{currentLevel.name}" to "{newLevel.name}" level ({newValue} points)
                      </span>
                    );
                  } else {
                    return (
                      <span className="text-xs text-red-600">
                        Decreases from "{currentLevel.name}" to "{newLevel.name}" level ({newValue} points)
                      </span>
                    );
                  }
                })()}
              </div>
            )}
          </div>
        );
      })}
      
      {(!interaction.effects?.prestigeChanges || interaction.effects.prestigeChanges.length === 0) && (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded">
          No prestige changes defined. This interaction will not affect any prestige tracks.
        </div>
      )}
    </div>
  );
};

// Export prestige record type definition
export const PrestigeRecord = {
  entity: String,
  track: String,
  level: { min: 0, max: 100, weight: 1 },
  progress: { min: 0, max: 100, weight: 1 },
  benefits: [String],
  requirements: Object
};