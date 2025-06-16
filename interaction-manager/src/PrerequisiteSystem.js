// src/PrerequisiteSystem.js
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Check } from 'lucide-react';

// Predefined prerequisite types
export const PREREQUISITE_TYPES = [
  {
    id: "level",
    name: "Player Level",
    operators: [
      { id: "gte", name: "≥ (Greater than or equal)", displaySymbol: "≥" },
      { id: "eq", name: "= (Exactly)", displaySymbol: "=" },
      { id: "lte", name: "≤ (Less than or equal)", displaySymbol: "≤" },
      { id: "gt", name: "> (Greater than)", displaySymbol: ">" },
      { id: "lt", name: "< (Less than)", displaySymbol: "<" }
    ],
    valueType: "number",
    validate: (operator, value, playerState) => {
      const playerLevel = playerState.level || 0;
      const numValue = parseInt(value);
      
      switch(operator) {
        case "gte": return playerLevel >= numValue;
        case "eq": return playerLevel === numValue;
        case "lte": return playerLevel <= numValue;
        case "gt": return playerLevel > numValue;
        case "lt": return playerLevel < numValue;
        default: return false;
      }
    },
    generateMessage: (operator, value) => {
      const op = PREREQUISITE_TYPES.find(t => t.id === "level")
                  .operators.find(o => o.id === operator);
      return `Requires player level ${op?.displaySymbol || operator} ${value}`;
    }
  },
  {
    id: "skill",
    name: "Skill Mastery",
    operators: [
      { id: "gte", name: "≥ (At least)", displaySymbol: "≥" },
      { id: "eq", name: "= (Exactly)", displaySymbol: "=" }
    ],
    valueType: "skill_level",
    validate: (operator, value, skillId, playerState) => {
      const skillLevel = playerState.skills?.[skillId] || 0;
      const numValue = parseInt(value);
      
      switch(operator) {
        case "gte": return skillLevel >= numValue;
        case "eq": return skillLevel === numValue;
        default: return false;
      }
    },
    generateMessage: (operator, value, skillId) => {
      const op = PREREQUISITE_TYPES.find(t => t.id === "skill")
                  .operators.find(o => o.id === operator);
      return `Requires ${skillId} skill level ${op?.displaySymbol || operator} ${value}`;
    }
  },
  {
    id: "quest",
    name: "Quest Completion",
    operators: [
      { id: "completed", name: "Completed", displaySymbol: "✓" },
      { id: "not_completed", name: "Not Completed", displaySymbol: "✗" }
    ],
    valueType: "quest_id",
    validate: (operator, questId, playerState) => {
      const isCompleted = playerState.completedQuests?.includes(questId) || false;
      
      switch(operator) {
        case "completed": return isCompleted;
        case "not_completed": return !isCompleted;
        default: return false;
      }
    },
    generateMessage: (operator, questId) => {
      return operator === "completed" 
        ? `Requires quest '${questId}' to be completed` 
        : `Requires quest '${questId}' to not be completed`;
    }
  },
  {
    id: "item",
    name: "Item Possession",
    operators: [
      { id: "has", name: "Has Item", displaySymbol: "✓" },
      { id: "not_has", name: "Doesn't Have", displaySymbol: "✗" },
      { id: "has_quantity", name: "Has Quantity ≥", displaySymbol: "≥" }
    ],
    valueType: "item_quantity",
    validate: (operator, value, itemId, playerState) => {
      const itemCount = playerState.inventory?.[itemId] || 0;
      
      switch(operator) {
        case "has": return itemCount > 0;
        case "not_has": return itemCount === 0;
        case "has_quantity": return itemCount >= parseInt(value);
        default: return false;
      }
    },
    generateMessage: (operator, value, itemId) => {
      switch(operator) {
        case "has": return `Requires possession of '${itemId}'`;
        case "not_has": return `Requires not having '${itemId}'`;
        case "has_quantity": return `Requires at least ${value} of '${itemId}'`;
        default: return `Item requirement: ${itemId}`;
      }
    }
  },
  {
    id: "influence",
    name: "Influence Level",
    operators: [
      { id: "gte", name: "≥ (At least)", displaySymbol: "≥" },
      { id: "lte", name: "≤ (At most)", displaySymbol: "≤" },
      { id: "between", name: "Between", displaySymbol: "↔" }
    ],
    valueType: "influence_level",
    validate: (operator, value, domainId, playerState) => {
      const influenceLevel = playerState.influence?.[domainId] || 0;
      
      switch(operator) {
        case "gte": return influenceLevel >= parseInt(value);
        case "lte": return influenceLevel <= parseInt(value);
        case "between": {
          const [min, max] = value.split(',').map(v => parseInt(v.trim()));
          return influenceLevel >= min && influenceLevel <= max;
        }
        default: return false;
      }
    },
    generateMessage: (operator, value, domainId) => {
      switch(operator) {
        case "gte": return `Requires ${domainId} influence ≥ ${value}`;
        case "lte": return `Requires ${domainId} influence ≤ ${value}`;
        case "between": {
          const [min, max] = value.split(',').map(v => v.trim());
          return `Requires ${domainId} influence between ${min} and ${max}`;
        }
        default: return `Influence requirement: ${domainId}`;
      }
    }
  }
];

// Validator function for checking if prerequisites are met
export function validatePrerequisites(interaction, playerState) {
  // No prerequisites = always available
  if (!interaction.prerequisites || !interaction.prerequisites.groups || interaction.prerequisites.groups.length === 0) {
    return { passed: true };
  }
  
  // Check each group (groups are connected with OR logic)
  for (const group of interaction.prerequisites.groups) {
    let groupPassed = true;
    const failedPrereqs = [];
    
    // Check each prerequisite in group (connected with AND or OR logic based on group.logic)
    if (group.logic === "AND") {
      // All must pass
      for (const prereq of group.prerequisites) {
        const prereqType = PREREQUISITE_TYPES.find(type => type.id === prereq.type);
        if (!prereqType) continue;
        
        const isValid = prereqType.validate(prereq.operator, prereq.value, playerState);
        if (!isValid) {
          groupPassed = false;
          failedPrereqs.push(prereq);
        }
      }
    } else { // OR logic
      groupPassed = false;
      // Any can pass
      for (const prereq of group.prerequisites) {
        const prereqType = PREREQUISITE_TYPES.find(type => type.id === prereq.type);
        if (!prereqType) continue;
        
        const isValid = prereqType.validate(prereq.operator, prereq.value, playerState);
        if (isValid) {
          groupPassed = true;
          break;
        } else {
          failedPrereqs.push(prereq);
        }
      }
    }
    
    // If this group passed, the whole check passes (OR between groups)
    if (groupPassed) {
      return { passed: true };
    }
  }
  
  // If we got here, no group passed
  return { 
    passed: false,
    message: interaction.prerequisites.unavailableMessage || "Requirements not met"
  };
}

// Component for editing a single prerequisite
export const PrerequisiteEditor = ({ prerequisite, updatePrerequisite, removePrerequisite }) => {
  const handleChange = (field, value) => {
    updatePrerequisite({
      ...prerequisite,
      [field]: value
    });
  };

  const currentType = PREREQUISITE_TYPES.find(type => type.id === prerequisite.type);

  return (
    <div className="p-3 border border-gray-200 rounded mb-3 bg-gray-50">
      <div className="flex justify-between mb-2">
        <span className="font-medium">Prerequisite</span>
        <button 
          onClick={removePrerequisite}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-700 mb-1">Type</label>
            <select
              value={prerequisite.type || ""}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              <option value="">Select type...</option>
              {PREREQUISITE_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-700 mb-1">Operator</label>
            <select
              value={prerequisite.operator || ""}
              onChange={(e) => handleChange('operator', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              disabled={!currentType}
            >
              <option value="">Select operator...</option>
              {currentType && 
                currentType.operators.map(op => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-gray-700 mb-1">Value</label>
          <input
            type="text"
            value={prerequisite.value || ""}
            onChange={(e) => handleChange('value', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            placeholder={currentType?.valueType === "number" ? "Numeric value" : "Required value"}
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={prerequisite.description || ""}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            placeholder="Human-readable description"
          />
        </div>
      </div>
    </div>
  );
};

// Component for editing a group of prerequisites with AND/OR logic
export const PrerequisiteGroupEditor = ({ group, updateGroup, removeGroup }) => {
  const addPrerequisite = () => {
    const newPrerequisite = {
      id: `prereq_${Date.now()}`,
      type: "",
      operator: "",
      value: "",
      description: ""
    };
    
    updateGroup({
      ...group,
      prerequisites: [...group.prerequisites, newPrerequisite]
    });
  };
  
  const updatePrerequisite = (index, updatedPrerequisite) => {
    const updatedPrerequisites = [...group.prerequisites];
    updatedPrerequisites[index] = updatedPrerequisite;
    
    updateGroup({
      ...group,
      prerequisites: updatedPrerequisites
    });
  };
  
  const removePrerequisite = (index) => {
    const updatedPrerequisites = [...group.prerequisites];
    updatedPrerequisites.splice(index, 1);
    
    updateGroup({
      ...group,
      prerequisites: updatedPrerequisites
    });
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg mb-4 bg-white">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <h3 className="font-medium">Prerequisite Group</h3>
          <select
            value={group.logic || "AND"}
            onChange={(e) => updateGroup({ ...group, logic: e.target.value })}
            className="ml-2 p-1 border border-gray-300 rounded text-sm"
          >
            <option value="AND">ALL must be met (AND)</option>
            <option value="OR">ANY can be met (OR)</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={addPrerequisite}
            className="bg-green-500 hover:bg-green-600 text-white p-1 rounded text-xs flex items-center"
          >
            <Plus size={14} className="mr-1" /> Add Requirement
          </button>
          <button 
            onClick={removeGroup}
            className="text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      {group.prerequisites.length === 0 && (
        <div className="text-center py-3 text-gray-500 border border-dashed border-gray-300 rounded">
          No prerequisites in this group yet.
        </div>
      )}
      
      {group.prerequisites.map((prerequisite, index) => (
        <PrerequisiteEditor 
          key={prerequisite.id}
          prerequisite={prerequisite}
          updatePrerequisite={(updated) => updatePrerequisite(index, updated)}
          removePrerequisite={() => removePrerequisite(index)}
        />
      ))}
      
      <div className="mt-2">
        <label className="block text-xs text-gray-700 mb-1">Group Description</label>
        <input
          type="text"
          value={group.description || ""}
          onChange={(e) => updateGroup({ ...group, description: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded text-sm"
          placeholder="Description of this requirement group"
        />
      </div>
    </div>
  );
};

// Main component for managing prerequisites for an interaction
export const PrerequisiteManager = ({ interaction, updateInteraction }) => {
  // Initialize prerequisites if not present
  const ensurePrerequisiteStructure = () => {
    if (!interaction.prerequisites) {
      updateInteraction({
        ...interaction,
        prerequisites: {
          groups: [],
          showWhenUnavailable: true,
          unavailableMessage: ""
        }
      });
    }
  };
  
  useEffect(() => {
    ensurePrerequisiteStructure();
  }, []);
  
  const addPrerequisiteGroup = () => {
    const newGroup = {
      id: `prereq_group_${Date.now()}`,
      logic: "AND",
      prerequisites: [],
      description: ""
    };
    
    updateInteraction({
      ...interaction,
      prerequisites: {
        ...interaction.prerequisites,
        groups: [...interaction.prerequisites.groups, newGroup]
      }
    });
  };
  
  const updatePrerequisiteGroup = (index, updatedGroup) => {
    const updatedGroups = [...interaction.prerequisites.groups];
    updatedGroups[index] = updatedGroup;
    
    updateInteraction({
      ...interaction,
      prerequisites: {
        ...interaction.prerequisites,
        groups: updatedGroups
      }
    });
  };
  
  const removePrerequisiteGroup = (index) => {
    const updatedGroups = [...interaction.prerequisites.groups];
    updatedGroups.splice(index, 1);
    
    updateInteraction({
      ...interaction,
      prerequisites: {
        ...interaction.prerequisites,
        groups: updatedGroups
      }
    });
  };
  
  const updateSettings = (field, value) => {
    updateInteraction({
      ...interaction,
      prerequisites: {
        ...interaction.prerequisites,
        [field]: value
      }
    });
  };

  if (!interaction.prerequisites) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Prerequisites</h2>
        <button 
          onClick={addPrerequisiteGroup}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center text-sm"
        >
          <Plus size={16} className="mr-1" /> Add Group
        </button>
      </div>
      
      {interaction.prerequisites.groups.map((group, index) => (
        <PrerequisiteGroupEditor 
          key={group.id}
          group={group}
          updateGroup={(updated) => updatePrerequisiteGroup(index, updated)}
          removeGroup={() => removePrerequisiteGroup(index)}
        />
      ))}
      
      {interaction.prerequisites.groups.length === 0 && (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded mb-4">
          No prerequisite groups defined. This interaction will always be available.
        </div>
      )}
      
      <div className="bg-gray-50 p-4 rounded-lg mt-4">
        <h3 className="font-medium mb-3">Availability Settings</h3>
        
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="showWhenUnavailable"
            checked={interaction.prerequisites.showWhenUnavailable}
            onChange={(e) => updateSettings('showWhenUnavailable', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="showWhenUnavailable" className="text-sm">
            Show this interaction even when prerequisites aren't met
          </label>
        </div>
        
        <div>
          <label className="block text-sm text-gray-700 mb-1">Message when unavailable</label>
          <input
            type="text"
            value={interaction.prerequisites.unavailableMessage || ""}
            onChange={(e) => updateSettings('unavailableMessage', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="E.g., 'You need to be level 10 to access this quest'"
          />
        </div>
      </div>
    </div>
  );
};

export default {
  PrerequisiteManager,
  PrerequisiteGroupEditor,
  PrerequisiteEditor,
  validatePrerequisites,
  PREREQUISITE_TYPES
};