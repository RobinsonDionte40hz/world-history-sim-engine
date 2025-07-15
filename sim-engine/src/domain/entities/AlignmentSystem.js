// src/entities/AlignmentSystem.js
import React, { useState } from 'react';
import { Plus, Trash2, Save, X, Edit, ChevronDown, ChevronUp, Scale, ArrowLeft, ArrowRight } from 'lucide-react';

// Class to manage player alignment across different axes
export class AlignmentManager {
  constructor(alignmentAxes = []) {
    this.axes = alignmentAxes;
    this.playerAlignment = {};
    this.history = {};
    
    // Initialize values from axes
    for (const axis of alignmentAxes) {
      this.playerAlignment[axis.id] = axis.defaultValue || 0;
      this.history[axis.id] = [];
    }
  }
  
  // Get current alignment for an axis
  getAlignment(axisId) {
    return this.playerAlignment[axisId] || 0;
  }
  
  // Get the current zone in an alignment axis
  getAlignmentZone(axisId) {
    const value = this.getAlignment(axisId);
    const axis = this.axes.find(a => a.id === axisId);
    
    if (!axis || !axis.zones || axis.zones.length === 0) return null;
    
    // Find the zone that contains the current value
    for (const zone of axis.zones) {
      if (value >= zone.min && value <= zone.max) {
        return zone;
      }
    }
    
    // If no zone matches (should not happen if zones cover the entire range)
    return null;
  }
  
  // Modify alignment with a reason
  changeAlignment(axisId, amount, reason) {
    // Find the axis
    const axis = this.axes.find(a => a.id === axisId);
    if (!axis) return false;
    
    // Calculate new value
    let newValue = (this.playerAlignment[axisId] || 0) + amount;
    
    // Clamp to axis limits
    newValue = Math.max(axis.min, Math.min(axis.max, newValue));
    
    // Record history
    this.history[axisId] = this.history[axisId] || [];
    this.history[axisId].push({
      timestamp: new Date(),
      change: amount,
      newValue,
      reason
    });
    
    // Update current value
    this.playerAlignment[axisId] = newValue;
    
    return true;
  }
  
  // Apply effects when completing an interaction
  applyInteractionEffects(interaction) {
    if (!interaction.effects?.alignmentChanges) return;
    
    for (const change of interaction.effects.alignmentChanges) {
      this.changeAlignment(
        change.axisId, 
        change.change, 
        change.description || `Completed interaction: ${interaction.title}`
      );
    }
  }
  
  // Get a player state object with alignment data for prerequisite checking
  getPlayerStateWithAlignment(basePlayerState = {}) {
    return {
      ...basePlayerState,
      alignment: Object.keys(this.playerAlignment).reduce((acc, axisId) => {
        acc[axisId] = {
          value: this.playerAlignment[axisId],
          zone: this.getAlignmentZone(axisId)
        };
        return acc;
      }, {})
    };
  }
}

// Component for editing a single alignment axis
export const AlignmentAxisEditor = ({ axis, updateAxis, deleteAxis, onCancel }) => {
  const [zones, setZones] = useState(axis.zones || []);
  
  // Calculate the default min and max if not provided
  const axisMin = axis.min !== undefined ? axis.min : -1000;
  const axisMax = axis.max !== undefined ? axis.max : 1000;
  const axisDefault = axis.defaultValue !== undefined ? axis.defaultValue : 0;
  
  const addZone = () => {
    // Calculate a suggested range based on existing zones
    let minSuggestion = axisMin;
    let maxSuggestion = minSuggestion + Math.floor((axisMax - axisMin) / 5);
    
    // Check for gaps in the existing zones
    if (zones.length > 0) {
      const sortedZones = [...zones].sort((a, b) => a.min - b.min);
      let lastMax = null;
      
      for (const zone of sortedZones) {
        if (lastMax !== null && zone.min > lastMax) {
          // Found a gap
          minSuggestion = lastMax + 1;
          maxSuggestion = zone.min - 1;
          break;
        }
        lastMax = zone.max;
      }
      
      // If no gaps found, suggest a range after the last zone
      if (lastMax !== null && lastMax < axisMax) {
        minSuggestion = lastMax + 1;
        maxSuggestion = Math.min(lastMax + Math.floor((axisMax - axisMin) / 5), axisMax);
      }
    }
    
    const newZone = {
      id: `zone_${Date.now()}`,
      name: "New Zone",
      min: minSuggestion,
      max: maxSuggestion,
      description: ""
    };
    setZones([...zones, newZone]);
  };

  const updateZone = (index, field, value) => {
    const updatedZones = [...zones];
    
    // Handle numeric values
    if (field === 'min' || field === 'max') {
      value = parseInt(value);
      
      // Enforce constraints
      if (field === 'min' && value < axisMin) value = axisMin;
      if (field === 'min' && value > updatedZones[index].max) value = updatedZones[index].max;
      if (field === 'max' && value > axisMax) value = axisMax;
      if (field === 'max' && value < updatedZones[index].min) value = updatedZones[index].min;
    }
    
    updatedZones[index] = {
      ...updatedZones[index],
      [field]: value
    };
    
    setZones(updatedZones);
  };

  const removeZone = (index) => {
    if (window.confirm('Are you sure you want to remove this zone?')) {
      const updatedZones = [...zones];
      updatedZones.splice(index, 1);
      setZones(updatedZones);
    }
  };

  const saveAxis = () => {
    // Basic validation
    if (!axis.id.trim() || !axis.name.trim()) {
      alert("ID and name are required");
      return;
    }
    
    // Check for zone overlaps
    const sortedZones = [...zones].sort((a, b) => a.min - b.min);
    for (let i = 0; i < sortedZones.length - 1; i++) {
      if (sortedZones[i].max >= sortedZones[i + 1].min) {
        alert(`Zone "${sortedZones[i].name}" overlaps with "${sortedZones[i + 1].name}". Please fix the ranges.`);
        return;
      }
    }
    
    // Check for gaps
    let previousMax = axisMin - 1;
    for (const zone of sortedZones) {
      if (zone.min > previousMax + 1) {
        if (!window.confirm(`There's a gap between alignment values ${previousMax} and ${zone.min}. Continue anyway?`)) {
          return;
        }
      }
      previousMax = zone.max;
    }
    
    if (previousMax < axisMax) {
      if (!window.confirm(`There's a gap between alignment values ${previousMax} and ${axisMax}. Continue anyway?`)) {
        return;
      }
    }
    
    // Ensure defaultValue is within range
    const defaultValue = Math.max(axisMin, Math.min(axisMax, axis.defaultValue || 0));
    
    updateAxis({
      ...axis,
      min: axisMin,
      max: axisMax,
      defaultValue: defaultValue,
      zones: sortedZones
    });
  };

  // Generate a list of colors for the alignment spectrum visualization
  const generateSpectrumColors = () => {
    // Sort zones by min value
    const sortedZones = [...zones].sort((a, b) => a.min - b.min);
    
    // Create an array representing the full spectrum
    const totalPoints = axisMax - axisMin + 1;
    
    // Map each point to its zone's color or a default color for gaps
    return Array.from({ length: totalPoints }, (_, i) => {
      const value = axisMin + i;
      const zone = sortedZones.find(z => value >= z.min && value <= z.max);
      return zone ? hslToHex((value - axisMin) / totalPoints * 240, 70, 60) : '#cccccc';
    });
  };
  
  // Simple HSL to Hex conversion
  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-auto max-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {axis.id ? 'Edit Alignment Axis' : 'Create New Alignment Axis'}
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
            value={axis.id}
            onChange={(e) => updateAxis({...axis, id: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="unique_id"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={axis.name}
            onChange={(e) => updateAxis({...axis, name: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Alignment Axis Name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={axis.description}
            onChange={(e) => updateAxis({...axis, description: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="What this alignment axis represents"
            rows="3"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={axis.color}
              onChange={(e) => updateAxis({...axis, color: e.target.value})}
              className="p-1 border border-gray-300 rounded h-10 w-20"
            />
            <span className="text-sm text-gray-600">{axis.color}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
            <input
              type="number"
              value={axisMin}
              onChange={(e) => updateAxis({...axis, min: parseInt(e.target.value)})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
            <input
              type="number"
              value={axisMax}
              onChange={(e) => updateAxis({...axis, max: parseInt(e.target.value)})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default</label>
            <input
              type="number"
              value={axisDefault}
              onChange={(e) => updateAxis({...axis, defaultValue: parseInt(e.target.value)})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Negative Label</label>
            <input
              type="text"
              value={axis.negativeName || ""}
              onChange={(e) => updateAxis({...axis, negativeName: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="E.g., Chaos, Evil, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Positive Label</label>
            <input
              type="text"
              value={axis.positiveName || ""}
              onChange={(e) => updateAxis({...axis, positiveName: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="E.g., Order, Good, etc."
            />
          </div>
        </div>
        
        {/* Alignment Spectrum Visualization */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Axis Spectrum</label>
          <div className="relative h-10 border border-gray-300 rounded overflow-hidden mb-2">
            {/* Color gradient based on zones */}
            <div 
              className="absolute inset-0" 
              style={{
                background: `linear-gradient(to right, ${
                  zones.length > 0 ? 
                  generateSpectrumColors().join(',') : 
                  '#cccccc'
                })`
              }}
            />
            
            {/* Zone names */}
            {zones.sort((a, b) => a.min - b.min).map(zone => {
              const left = ((zone.min - axisMin) / (axisMax - axisMin)) * 100;
              const width = ((zone.max - zone.min) / (axisMax - axisMin)) * 100;
              
              return (
                <div 
                  key={zone.id}
                  className="absolute top-0 text-center text-xs font-bold"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textShadow: '0px 0px 2px white',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {zone.name}
                </div>
              );
            })}
            
            {/* Default value marker */}
            <div
              className="absolute w-0.5 h-full bg-black"
              style={{
                left: `${((axisDefault - axisMin) / (axisMax - axisMin)) * 100}%`,
              }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <div>{axis.negativeName || 'Negative'} ({axisMin})</div>
            <div>{axis.positiveName || 'Positive'} ({axisMax})</div>
          </div>
        </div>
        
        {/* Zones Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Alignment Zones</h3>
            <button 
              onClick={addZone}
              className="bg-green-500 hover:bg-green-600 text-white p-1 rounded text-xs flex items-center"
            >
              <Plus size={16} className="mr-1" /> Add Zone
            </button>
          </div>
          
          {zones.length === 0 && (
            <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded">
              No zones defined yet. Add your first zone.
            </div>
          )}
          
          {zones
            .sort((a, b) => a.min - b.min) // Display in order
            .map((zone, index) => (
            <div 
              key={zone.id} 
              className="p-3 border border-gray-200 rounded mb-3 bg-gray-50"
              style={{
                borderLeft: '4px solid',
                borderLeftColor: hslToHex(((zone.min + zone.max) / 2 - axisMin) / (axisMax - axisMin) * 240, 70, 60)
              }}
            >
              <div className="flex justify-between mb-2">
                <span className="font-medium">Zone {index + 1}</span>
                <button 
                  onClick={() => removeZone(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Zone ID</label>
                  <input
                    type="text"
                    value={zone.id}
                    onChange={(e) => updateZone(index, 'id', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={zone.name}
                    onChange={(e) => updateZone(index, 'name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Min Value</label>
                  <input
                    type="number"
                    value={zone.min}
                    onChange={(e) => updateZone(index, 'min', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    min={axisMin}
                    max={zone.max}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Max Value</label>
                  <input
                    type="number"
                    value={zone.max}
                    onChange={(e) => updateZone(index, 'max', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    min={zone.min}
                    max={axisMax}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={zone.description}
                    onChange={(e) => updateZone(index, 'description', e.target.value)}
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
        {axis.id && (
          <button 
            onClick={() => deleteAxis(axis.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
          >
            Delete
          </button>
        )}
        <button 
          onClick={saveAxis}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <Save size={18} className="mr-1" /> Save
        </button>
      </div>
    </div>
  );
};

// Component for managing alignment axes
export const AlignmentAxisManager = ({ alignmentAxes, setAlignmentAxes }) => {
  const [currentAxis, setCurrentAxis] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedAxis, setExpandedAxis] = useState(null);
  
  const createNewAxis = () => {
    const newAxis = {
      id: `alignment_${Date.now()}`,
      name: "New Alignment Axis",
      description: "",
      color: "#" + Math.floor(Math.random()*16777215).toString(16),
      min: -1000,
      max: 1000,
      defaultValue: 0,
      negativeName: "Negative",
      positiveName: "Positive",
      zones: [
        {
          id: "zone_neg",
          name: "Negative",
          min: -1000,
          max: -334,
          description: "The negative end of the spectrum"
        },
        {
          id: "zone_neutral",
          name: "Neutral",
          min: -333,
          max: 333,
          description: "The middle ground"
        },
        {
          id: "zone_pos",
          name: "Positive",
          min: 334,
          max: 1000,
          description: "The positive end of the spectrum"
        }
      ]
    };
    
    setCurrentAxis(newAxis);
    setIsEditing(true);
  };
  
  const editAxis = (axis) => {
    setCurrentAxis({...axis});
    setIsEditing(true);
  };
  
  const deleteAxis = (id) => {
    if (window.confirm('Are you sure you want to delete this alignment axis?')) {
      setAlignmentAxes(alignmentAxes.filter(axis => axis.id !== id));
      setIsEditing(false);
      setCurrentAxis(null);
    }
  };
  
  const saveAxis = (axis) => {
    if (!axis.id.trim() || !axis.name.trim()) {
      alert("ID and name are required");
      return;
    }
    
    const existingIndex = alignmentAxes.findIndex(a => a.id === axis.id);
    
    if (existingIndex >= 0) {
      // Update existing
      const updatedAxes = [...alignmentAxes];
      updatedAxes[existingIndex] = axis;
      setAlignmentAxes(updatedAxes);
    } else {
      // Add new
      setAlignmentAxes([...alignmentAxes, axis]);
    }
    
    setIsEditing(false);
    setCurrentAxis(null);
  };
  
  const toggleAxisExpand = (id) => {
    if (expandedAxis === id) {
      setExpandedAxis(null);
    } else {
      setExpandedAxis(id);
    }
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentAxis(null);
  };

  return (
    <div>
      {isEditing && currentAxis ? (
        <AlignmentAxisEditor
          axis={currentAxis}
          updateAxis={saveAxis}
          deleteAxis={deleteAxis}
          onCancel={cancelEdit}
        />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Alignment Axes</h2>
            <button 
              onClick={createNewAxis} 
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
              title="Create new alignment axis"
            >
              <Plus size={18} />
            </button>
          </div>
          
          <div className="space-y-2">
            {alignmentAxes.map(axis => (
              <div 
                key={axis.id} 
                className="bg-gray-50 rounded border border-gray-200"
                style={{borderLeft: `4px solid ${axis.color}`}}
              >
                <div 
                  className="p-2 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleAxisExpand(axis.id)}
                >
                  <div className="flex items-center">
                    <Scale size={18} className="mr-2 text-gray-600" />
                    <span className="font-medium">{axis.name}</span>
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                      {axis.zones?.length || 0} zones
                    </span>
                  </div>
                  {expandedAxis === axis.id ? 
                    <ChevronUp size={18} /> : 
                    <ChevronDown size={18} />
                  }
                </div>
                
                {expandedAxis === axis.id && (
                  <div className="p-2 pt-0 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">{axis.description}</p>
                    
                    {/* Alignment Spectrum Visualization */}
                    <div className="mt-2 mb-3">
                      <div className="relative h-8 border border-gray-300 rounded overflow-hidden">
                        {/* Color gradient representing the alignment axis */}
                        <div 
                          className="absolute inset-0" 
                          style={{
                            background: `linear-gradient(to right, 
                              hsl(240, 70%, 60%), 
                              hsl(180, 70%, 60%), 
                              hsl(120, 70%, 60%), 
                              hsl(60, 70%, 60%), 
                              hsl(0, 70%, 60%))`
                          }}
                        />
                        
                        {/* Default value marker */}
                        <div
                          className="absolute w-0.5 h-full bg-black"
                          style={{
                            left: `${((axis.defaultValue - axis.min) / (axis.max - axis.min)) * 100}%`,
                          }}
                        />
                        
                        {/* Zone names */}
                        {(axis.zones || []).sort((a, b) => a.min - b.min).map(zone => {
                          const left = ((zone.min - axis.min) / (axis.max - axis.min)) * 100;
                          const width = ((zone.max - zone.min) / (axis.max - axis.min)) * 100;
                          
                          return (
                            <div 
                              key={zone.id}
                              className="absolute top-0 text-center text-xs font-bold"
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textShadow: '0px 0px 2px white',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {zone.name}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <div>{axis.negativeName || 'Negative'} ({axis.min})</div>
                        <div>{axis.positiveName || 'Positive'} ({axis.max})</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          editAxis(axis);
                        }}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-1 rounded flex-1 text-xs"
                      >
                        <Edit size={14} className="inline mr-1" />
                        Edit
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAxis(axis.id);
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

            {alignmentAxes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No alignment axes defined yet. Create your first one!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Component for managing alignment effects in an interaction
export const AlignmentEffectsEditor = ({ interaction, updateInteraction, alignmentAxes }) => {
  const addAlignmentChange = () => {
    const newChange = {
      id: `alignment_change_${Date.now()}`,
      axisId: "",
      change: 0,
      description: ""
    };
    
    // Ensure the effects structure exists
    const currentEffects = interaction.effects || {};
    
    updateInteraction({
      ...interaction,
      effects: {
        ...currentEffects,
        alignmentChanges: [...(currentEffects.alignmentChanges || []), newChange]
      }
    });
  };
  
  const updateAlignmentChange = (index, updatedChange) => {
    const updatedChanges = [...(interaction.effects?.alignmentChanges || [])];
    updatedChanges[index] = updatedChange;
    
    updateInteraction({
      ...interaction,
      effects: {
        ...interaction.effects,
        alignmentChanges: updatedChanges
      }
    });
  };
  
  const removeAlignmentChange = (index) => {
    const updatedChanges = [...(interaction.effects?.alignmentChanges || [])];
    updatedChanges.splice(index, 1);
    
    updateInteraction({
      ...interaction,
      effects: {
        ...interaction.effects,
        alignmentChanges: updatedChanges
      }
    });
  };
  
  // Ensure effects structure exists
  if (!interaction.effects) {
    updateInteraction({
      ...interaction,
      effects: {
        alignmentChanges: []
      }
    });
    return null;
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Alignment Effects</h2>
        <button 
          onClick={addAlignmentChange}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center text-sm"
        >
          <Plus size={16} className="mr-1" /> Add Effect
        </button>
      </div>
      
      {(interaction.effects?.alignmentChanges || []).map((change, index) => {
        const axis = alignmentAxes.find(a => a.id === change.axisId);
        
        return (
          <div 
            key={change.id} 
            className="p-4 border border-gray-200 rounded mb-3 bg-gray-50"
            style={axis ? {borderLeft: `4px solid ${axis.color}`} : {}}
          >
            <div className="flex justify-between mb-3">
              <span className="font-medium">Alignment Change</span>
              <button 
                onClick={() => removeAlignmentChange(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alignment Axis</label>
                <select
                  value={change.axisId}
                  onChange={(e) => updateAlignmentChange(index, { ...change, axisId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select axis...</option>
                  {alignmentAxes.map(axis => (
                    <option key={axis.id} value={axis.id}>
                      {axis.name}
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
                    onChange={(e) => updateAlignmentChange(index, { ...change, change: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <div className="ml-2">
                    {change.change > 0 ? (
                      <ArrowRight className="text-green-500" size={18} title="Toward positive end" />
                    ) : change.change < 0 ? (
                      <ArrowLeft className="text-red-500" size={18} title="Toward negative end" />
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
                onChange={(e) => updateAlignmentChange(index, { ...change, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="E.g., 'Showed mercy to an enemy'"
              />
            </div>
            
            {/* Show impact on alignment if an axis is selected */}
            {axis && axis.zones && axis.zones.length > 0 && (
              <div className="mt-3 p-2 bg-gray-100 rounded">
                <p className="text-xs text-gray-600 mb-1">Impact:</p>
                {(() => {
                  // Display how change would affect alignment zone
                  
                  // In a real application, this would be the player's actual alignment value
                  const currentValue = axis.defaultValue; 
                  const newValue = Math.max(axis.min, Math.min(axis.max, currentValue + change.change));
                  
                  // Find current zone
                  const currentZone = axis.zones.find(
                    zone => currentValue >= zone.min && currentValue <= zone.max
                  );
                  
                  // Find new zone
                  const newZone = axis.zones.find(
                    zone => newValue >= zone.min && newValue <= zone.max
                  );
                  
                  if (!currentZone && !newZone) {
                    return <span className="text-xs">No defined zones at these values</span>;
                  }
                  
                  if (currentZone?.id === newZone?.id) {
                    return (
                      <span className="text-xs">
                        Remains in "{newZone.name}" zone ({newValue} points)
                      </span>
                    );
                  }
                  
                  if (!currentZone && newZone) {
                    return (
                      <span className="text-xs text-green-600">
                        Enters "{newZone.name}" zone ({newValue} points)
                      </span>
                    );
                  }
                  
                  if (currentZone && !newZone) {
                    return (
                      <span className="text-xs text-red-600">
                        Exits "{currentZone.name}" zone ({newValue} points)
                      </span>
                    );
                  }
                  
                  return (
                    <span className="text-xs font-medium text-blue-600">
                      Changes from "{currentZone.name}" to "{newZone.name}" zone ({newValue} points)
                    </span>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}
      
      {(!interaction.effects?.alignmentChanges || interaction.effects.alignmentChanges.length === 0) && (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded">
          No alignment changes defined. This interaction will not affect any alignment axes.
        </div>
      )}
    </div>
  );
};

// Export alignment record type definition
export const AlignmentRecord = {
  entity: String,
  axis: String,
  position: { min: -100, max: 100, weight: 1 },
  stability: { min: 0, max: 100, weight: 1 },
  influences: [String],
  consequences: Object
};