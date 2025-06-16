// src/InfluenceSystem.js
import React, { useState } from 'react';
import { Plus, Trash2, Save, X, Edit, ChevronDown, ChevronUp } from 'lucide-react';

// Class to manage player influence across different domains
export class InfluenceManager {
  constructor(influenceDomains = []) {
    this.domains = influenceDomains;
    this.playerInfluence = {};
    this.history = {};
    
    // Initialize values from domains
    for (const domain of influenceDomains) {
      this.playerInfluence[domain.id] = domain.defaultValue;
      this.history[domain.id] = [];
    }
  }
  
  // Get current influence for a domain
  getInfluence(domainId) {
    return this.playerInfluence[domainId] || 0;
  }
  
  // Modify influence with a reason
  changeInfluence(domainId, amount, reason) {
    // Find the domain
    const domain = this.domains.find(d => d.id === domainId);
    if (!domain) return false;
    
    // Calculate new value
    let newValue = (this.playerInfluence[domainId] || 0) + amount;
    
    // Clamp to domain limits
    newValue = Math.max(domain.min, Math.min(domain.max, newValue));
    
    // Record history
    this.history[domainId] = this.history[domainId] || [];
    this.history[domainId].push({
      timestamp: new Date(),
      change: amount,
      newValue,
      reason
    });
    
    // Update current value
    this.playerInfluence[domainId] = newValue;
    
    return true;
  }
  
  // Get influence tier (for UI display or gameplay effects)
  getInfluenceTier(domainId) {
    const value = this.getInfluence(domainId);
    const domain = this.domains.find(d => d.id === domainId);
    
    if (!domain) return "Unknown";
    
    // Map the value to a tier based on percentage of max possible value
    const max = domain.max;
    const min = domain.min;
    const range = max - min;
    const percent = ((value - min) / range) * 100;
    
    if (percent >= 90) return "Exalted";
    if (percent >= 75) return "Revered";
    if (percent >= 60) return "Honored";
    if (percent >= 45) return "Friendly";
    if (percent >= 35) return "Neutral";
    if (percent >= 25) return "Indifferent";
    if (percent >= 15) return "Unfriendly";
    if (percent >= 5) return "Hostile";
    return "Hated";
  }
  
  // Apply effects when completing an interaction
  applyInteractionEffects(interaction) {
    if (!interaction.effects?.influenceChanges) return;
    
    for (const change of interaction.effects.influenceChanges) {
      this.changeInfluence(
        change.domainId, 
        change.change, 
        `Completed interaction: ${interaction.title}`
      );
    }
  }
  
  // Get a player state object with influence data for prerequisite checking
  getPlayerStateWithInfluence(basePlayerState = {}) {
    return {
      ...basePlayerState,
      influence: { ...this.playerInfluence }
    };
  }
}

// Component for editing a single influence domain
export const InfluenceDomainEditor = ({ domain, updateDomain, deleteDomain, onCancel }) => {
  // Create local state for editing
  const [editingDomain, setEditingDomain] = useState({...domain});
  
  const handleChange = (field, value) => {
    setEditingDomain({
      ...editingDomain,
      [field]: value
    });
  };

  const handleSave = () => {
    updateDomain(editingDomain);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {domain.id ? 'Edit Influence Domain' : 'Create New Domain'}
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
            value={editingDomain.id}
            onChange={(e) => handleChange('id', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="unique_id"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={editingDomain.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Domain Name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={editingDomain.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="What this influence type represents"
            rows="3"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={editingDomain.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="p-1 border border-gray-300 rounded h-10 w-20"
            />
            <span className="text-sm text-gray-600">{editingDomain.color}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
            <input
              type="number"
              value={editingDomain.min}
              onChange={(e) => handleChange('min', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
            <input
              type="number"
              value={editingDomain.max}
              onChange={(e) => handleChange('max', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default</label>
            <input
              type="number"
              value={editingDomain.defaultValue}
              onChange={(e) => handleChange('defaultValue', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
        <button 
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
        >
          Cancel
        </button>
        {domain.id && (
          <button 
            onClick={() => deleteDomain(domain.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
          >
            Delete
          </button>
        )}
        <button 
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <Save size={18} className="mr-1" /> Save
        </button>
      </div>
    </div>
  );
};

// Component for managing influence domains
export const InfluenceDomainManager = ({ influenceDomains, setInfluenceDomains }) => {
  const [currentDomain, setCurrentDomain] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedDomain, setExpandedDomain] = useState(null);
  
  const createNewDomain = () => {
    const newDomain = {
      id: `influence_${Date.now()}`,
      name: "New Influence Domain",
      description: "",
      color: "#" + Math.floor(Math.random()*16777215).toString(16),
      min: -100,
      max: 100,
      defaultValue: 0
    };
    
    setCurrentDomain(newDomain);
    setIsEditing(true);
  };
  
  const editDomain = (domain) => {
    setCurrentDomain({...domain});
    setIsEditing(true);
  };
  
  const deleteDomain = (id) => {
    if (window.confirm('Are you sure you want to delete this influence domain?')) {
      setInfluenceDomains(influenceDomains.filter(domain => domain.id !== id));
      setIsEditing(false);
      setCurrentDomain(null);
    }
  };
  
  const saveDomain = (domain) => {
    // Trim and validate inputs
    const trimmedId = domain.id.trim();
    const trimmedName = domain.name.trim();
    
    if (!trimmedId) {
      alert("Domain ID is required");
      return;
    }
    
    if (!trimmedName) {
      alert("Domain name is required");
      return;
    }
    
    // Create cleaned domain object
    const cleanedDomain = {
      ...domain,
      id: trimmedId,
      name: trimmedName
    };
    
    const existingIndex = influenceDomains.findIndex(d => d.id === cleanedDomain.id);
    
    if (existingIndex >= 0) {
      // Update existing
      const updatedDomains = [...influenceDomains];
      updatedDomains[existingIndex] = cleanedDomain;
      setInfluenceDomains(updatedDomains);
    } else {
      // Add new
      setInfluenceDomains([...influenceDomains, cleanedDomain]);
    }
    
    setIsEditing(false);
    setCurrentDomain(null);
  };
  
  const toggleDomainExpand = (id) => {
    if (expandedDomain === id) {
      setExpandedDomain(null);
    } else {
      setExpandedDomain(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Influence Domains</h2>
        <button 
          onClick={createNewDomain}
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
          title="Create new influence domain"
        >
          <Plus size={18} />
        </button>
      </div>

      {isEditing && currentDomain && (
        <InfluenceDomainEditor
          domain={currentDomain}
          updateDomain={saveDomain}
          deleteDomain={deleteDomain}
          onCancel={() => {
            setIsEditing(false);
            setCurrentDomain(null);
          }}
        />
      )}

      {!isEditing && (
        <div className="space-y-2">
          {influenceDomains.map(domain => (
            <div 
              key={domain.id} 
              className="bg-gray-50 rounded border border-gray-200"
              style={{borderLeft: `4px solid ${domain.color}`}}
            >
              <div 
                className="p-2 cursor-pointer flex justify-between items-center"
                onClick={() => toggleDomainExpand(domain.id)}
              >
                <div className="flex items-center">
                  <span className="font-medium">{domain.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      editDomain(domain);
                    }}
                    className="text-amber-500 hover:text-amber-700"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDomain(domain.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {influenceDomains.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No influence domains defined yet. Create your first one!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Component for managing influence effects in an interaction
export const InfluenceEffectsEditor = ({ interaction, updateInteraction, influenceDomains }) => {
  const addInfluenceChange = () => {
    const newChange = {
      id: `influence_change_${Date.now()}`,
      domainId: "",
      change: 0,
      description: ""
    };
    
    updateInteraction({
      ...interaction,
      effects: {
        ...interaction.effects,
        influenceChanges: [...(interaction.effects?.influenceChanges || []), newChange]
      }
    });
  };
  
  const updateInfluenceChange = (index, updatedChange) => {
    const updatedChanges = [...(interaction.effects?.influenceChanges || [])];
    updatedChanges[index] = updatedChange;
    
    updateInteraction({
      ...interaction,
      effects: {
        ...interaction.effects,
        influenceChanges: updatedChanges
      }
    });
  };
  
  const removeInfluenceChange = (index) => {
    const updatedChanges = [...(interaction.effects?.influenceChanges || [])];
    updatedChanges.splice(index, 1);
    
    updateInteraction({
      ...interaction,
      effects: {
        ...interaction.effects,
        influenceChanges: updatedChanges
      }
    });
  };
  
  // Ensure effects structure exists
  if (!interaction.effects) {
    updateInteraction({
      ...interaction,
      effects: {
        influenceChanges: []
      }
    });
    return null;
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Influence Effects</h2>
        <button 
          onClick={addInfluenceChange}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center text-sm"
        >
          <Plus size={16} className="mr-1" /> Add Effect
        </button>
      </div>
      
      {(interaction.effects?.influenceChanges || []).map((change, index) => (
        <div key={change.id} className="p-4 border border-gray-200 rounded mb-3 bg-gray-50">
          <div className="flex justify-between mb-3">
            <span className="font-medium">Influence Change</span>
            <button 
              onClick={() => removeInfluenceChange(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <select
                value={change.domainId}
                onChange={(e) => updateInfluenceChange(index, { ...change, domainId: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select domain...</option>
                {influenceDomains.map(domain => (
                  <option key={domain.id} value={domain.id}>
                    {domain.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Change Amount</label>
              <input
                type="number"
                value={change.change}
                onChange={(e) => updateInfluenceChange(index, { ...change, change: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={change.description}
              onChange={(e) => updateInfluenceChange(index, { ...change, description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="E.g., 'Showed kindness to villagers'"
            />
          </div>
        </div>
      ))}
      
      {(!interaction.effects?.influenceChanges || interaction.effects.influenceChanges.length === 0) && (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded">
          No influence changes defined. This interaction will not affect any influence domains.
        </div>
      )}
    </div>
  );
};

// Export influence record type definition
export const InfluenceRecord = {
  source: String,
  target: String,
  domain: String,
  magnitude: { min: -100, max: 100, weight: 1 },
  duration: { min: 0, max: 100, weight: 1 },
  decayRate: { min: 0, max: 1, weight: 1 },
  conditions: Object
};