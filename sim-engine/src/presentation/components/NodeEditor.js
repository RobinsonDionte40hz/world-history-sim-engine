import React, { useState, useCallback, useEffect } from 'react';
import WorldValidator from '../../domain/services/WorldValidator';
import { Save, Upload } from 'lucide-react';
import useTemplates from '../hooks/useTemplates';
import TemplateLibraryPanel from './TemplateLibraryPanel';
import EnvironmentalPresetSelector from './EnvironmentalPresetSelector';
import EnvironmentalPresetService from '../../domain/services/EnvironmentalPresetService';
import Environment from '../../domain/value-objects/Environment';
import { TerrainTypes, TERRAIN_DESCRIPTIONS } from '../../shared/constants/TerrainTypes';
import { ClimateTypes, CLIMATE_DESCRIPTIONS } from '../../shared/constants/ClimateTypes';
import { LightingTypes, LIGHTING_DESCRIPTIONS } from '../../shared/constants/LightingTypes';
import { HazardTypes, HAZARD_DESCRIPTIONS, getHazardCategory } from '../../shared/constants/HazardTypes';
import EnvironmentalHazard from '../../domain/entities/EnvironmentalHazard';
import BulkControls from './BulkControls';

// Node types with their characteristics
const NODE_TYPES = [
  {
    id: 'settlement',
    label: 'Settlement',
    icon: '🏘️',
    description: 'Towns, cities, villages',
    defaultCapacity: 1000
  },
  {
    id: 'wilderness',
    label: 'Wilderness',
    icon: '🌲',
    description: 'Forests, mountains, deserts',
    defaultCapacity: 100
  },
  {
    id: 'dungeon',
    label: 'Dungeon',
    icon: '⚔️',
    description: 'Caves, ruins, dangerous areas',
    defaultCapacity: 50
  },
  {
    id: 'landmark',
    label: 'Landmark',
    icon: '🗿',
    description: 'Important locations, monuments',
    defaultCapacity: 200
  },
  {
    id: 'resource',
    label: 'Resource',
    icon: '💎',
    description: 'Mines, farms, production sites',
    defaultCapacity: 150
  },
  {
    id: 'sacred',
    label: 'Sacred',
    icon: '⛪',
    description: 'Temples, shrines, holy sites',
    defaultCapacity: 100
  }
];

// Node features
const NODE_FEATURES = [
  {
    id: 'trade_hub',
    label: 'Trade Hub',
    icon: '💰',
    modifiers: { economy: 2, population_growth: 1.5 }
  },
  {
    id: 'fortified',
    label: 'Fortified',
    icon: '🛡️',
    modifiers: { defense: 3, military_strength: 2 }
  },
  {
    id: 'cultural_center',
    label: 'Cultural Center',
    icon: '🎭',
    modifiers: { culture: 2, happiness: 1.5 }
  },
  {
    id: 'industrial',
    label: 'Industrial',
    icon: '🏭',
    modifiers: { production: 3, pollution: 1.5 }
  },
  {
    id: 'agricultural',
    label: 'Agricultural',
    icon: '🌾',
    modifiers: { food_production: 3, population_capacity: 1.5 }
  },
  {
    id: 'mystical',
    label: 'Mystical',
    icon: '🔮',
    modifiers: { magic: 2, consciousness: 1.5 }
  },
  {
    id: 'lawless',
    label: 'Lawless',
    icon: '🏴‍☠️',
    modifiers: { crime: 2, freedom: 1.5, law: -2 }
  },
  {
    id: 'educational',
    label: 'Educational',
    icon: '📚',
    modifiers: { education: 3, research: 2 }
  }
];

// Resource types
const RESOURCE_TYPES = [
  'Gold', 'Iron', 'Wood', 'Stone', 'Food', 'Water',
  'Gems', 'Herbs', 'Magic Crystals', 'Oil', 'Coal', 'Rare Metals'
];

// Custom modifier editor
const CustomModifierEditor = ({ modifiers, onChange }) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newKey && newValue) {
      onChange({
        ...modifiers,
        [newKey]: parseFloat(newValue) || 0
      });
      setNewKey('');
      setNewValue('');
    }
  };

  const handleRemove = (key) => {
    const updated = { ...modifiers };
    delete updated[key];
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Existing modifiers */}
      {Object.keys(modifiers).length > 0 && (
        <div className="space-y-2">
          {Object.entries(modifiers).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full"
            >
              <span className="text-sm text-white">{key}: {value}</span>
              <button
                onClick={() => handleRemove(key)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new modifier */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Modifier name"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
        />
        <input
          type="number"
          step="0.1"
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Add
        </button>
      </div>
    </div>
  );
};

// Resource selector
const ResourceSelector = ({ resources, onChange }) => {
  const [customResource, setCustomResource] = useState('');

  const handleToggleResource = (resource) => {
    if (resources.includes(resource)) {
      onChange(resources.filter(r => r !== resource));
    } else {
      onChange([...resources, resource]);
    }
  };

  const handleAddCustom = () => {
    if (customResource && !resources.includes(customResource)) {
      onChange([...resources, customResource]);
      setCustomResource('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Predefined resources */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {RESOURCE_TYPES.map(resource => (
          <button
            key={resource}
            onClick={() => handleToggleResource(resource)}
            className={`
              px-3 py-2 rounded-lg text-sm transition-colors
              ${resources.includes(resource)
                ? 'bg-green-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
              }
            `}
          >
            {resource}
          </button>
        ))}
      </div>

      {/* Custom resource */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Custom resource..."
          value={customResource}
          onChange={(e) => setCustomResource(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
        />
        <button
          onClick={handleAddCustom}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Add Custom
        </button>
      </div>

      {/* Selected resources summary */}
      {resources.length > 0 && (
        <div className="p-3 bg-white/10 rounded-lg border border-white/20">
          <p className="text-sm font-medium text-white mb-2">Selected Resources:</p>
          <div className="flex flex-wrap gap-2">
            {resources.map(resource => (
              <span
                key={resource}
                className="px-2 py-1 bg-green-500/20 rounded text-sm text-white"
              >
                {resource}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Hazard management component
const HazardManager = ({ hazards, onChange }) => {
  const [newHazard, setNewHazard] = useState({
    type: HazardTypes.EXTREME_HEAT,
    severity: 0.3,
    description: ''
  });

  const hazardTypes = Object.values(HazardTypes);

  const handleAddHazard = () => {
    if (newHazard.type) {
      try {
        const hazardInstance = new EnvironmentalHazard({
          type: newHazard.type,
          severity: newHazard.severity,
          description: newHazard.description || HAZARD_DESCRIPTIONS[newHazard.type]
        });
        
        onChange([...hazards, hazardInstance]);
        setNewHazard({
          type: HazardTypes.EXTREME_HEAT,
          severity: 0.3,
          description: ''
        });
      } catch (error) {
        console.error('Failed to create hazard:', error);
        alert(`Failed to create hazard: ${error.message}`);
      }
    }
  };

  const handleRemoveHazard = (index) => {
    onChange(hazards.filter((_, i) => i !== index));
  };

  const handleUpdateHazard = (index, field, value) => {
    const updatedHazards = [...hazards];
    try {
      const currentHazard = updatedHazards[index];
      const hazardData = currentHazard.toJSON ? currentHazard.toJSON() : currentHazard;
      
      const newHazardData = { ...hazardData, [field]: value };
      const updatedHazard = new EnvironmentalHazard(newHazardData);
      
      updatedHazards[index] = updatedHazard;
      onChange(updatedHazards);
    } catch (error) {
      console.error('Failed to update hazard:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-white mb-3">Environmental Hazards</h4>
      
      {/* Existing hazards */}
      {hazards.length > 0 && (
        <div className="space-y-3">
          {hazards.map((hazard, index) => {
            const hazardData = hazard.toJSON ? hazard.toJSON() : hazard;
            const category = getHazardCategory(hazardData.type);
            
            return (
              <div
                key={index}
                className="p-4 bg-white/10 rounded-lg border border-white/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${category === 'environmental' ? 'bg-green-500/20 text-green-400' :
                        category === 'supernatural' ? 'bg-purple-500/20 text-purple-400' :
                        category === 'biological' ? 'bg-orange-500/20 text-orange-400' :
                        category === 'social' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'}
                    `}>
                      {category}
                    </span>
                    <h5 className="font-medium text-white">
                      {HAZARD_DESCRIPTIONS[hazardData.type]}
                    </h5>
                  </div>
                  <button
                    onClick={() => handleRemoveHazard(index)}
                    className="text-red-400 hover:text-red-300 px-2 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Hazard Type</label>
                    <select
                      value={hazardData.type}
                      onChange={(e) => handleUpdateHazard(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    >
                      {hazardTypes.map(type => (
                        <option key={type} value={type} className="bg-gray-800">
                          {HAZARD_DESCRIPTIONS[type]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Severity ({Math.round(hazardData.severity * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={hazardData.severity}
                      onChange={(e) => handleUpdateHazard(index, 'severity', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={hazardData.description}
                    onChange={(e) => handleUpdateHazard(index, 'description', e.target.value)}
                    placeholder="Custom hazard description..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-gray-400"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new hazard */}
      <div className="p-4 border-2 border-dashed border-white/20 rounded-lg">
        <h5 className="font-medium text-white mb-3">Add New Hazard</h5>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Hazard Type</label>
            <select
              value={newHazard.type}
              onChange={(e) => setNewHazard({ ...newHazard, type: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
            >
              {hazardTypes.map(type => (
                <option key={type} value={type} className="bg-gray-800">
                  {HAZARD_DESCRIPTIONS[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Severity ({Math.round(newHazard.severity * 100)}%)
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={newHazard.severity}
              onChange={(e) => setNewHazard({ ...newHazard, severity: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-sm text-gray-400 mb-1">Custom Description (optional)</label>
          <textarea
            value={newHazard.description}
            onChange={(e) => setNewHazard({ ...newHazard, description: e.target.value })}
            placeholder={HAZARD_DESCRIPTIONS[newHazard.type]}
            rows={2}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-gray-400"
          />
        </div>

        <button
          onClick={handleAddHazard}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Add Hazard
        </button>
      </div>

      {/* Hazard Summary */}
      {hazards.length > 0 && (
        <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
          <p className="text-sm font-medium text-white mb-2">
            Hazard Summary ({hazards.length} hazard{hazards.length !== 1 ? 's' : ''})
          </p>
          <div className="flex flex-wrap gap-2">
            {hazards.map((hazard, index) => {
              const hazardData = hazard.toJSON ? hazard.toJSON() : hazard;
              return (
                <span
                  key={index}
                  className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs border border-red-500/30"
                  title={hazardData.description}
                >
                  {hazardData.type} ({Math.round(hazardData.severity * 100)}%)
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Connection editor
const ConnectionEditor = ({ connections, onChange, availableNodes = [] }) => {
  const [newConnection, setNewConnection] = useState({
    targetNodeId: '',
    type: 'road',
    distance: 1,
    difficulty: 1
  });

  const connectionTypes = [
    { id: 'road', label: 'Road', icon: '🛤️' },
    { id: 'river', label: 'River', icon: '🌊' },
    { id: 'mountain_pass', label: 'Mountain Pass', icon: '⛰️' },
    { id: 'sea_route', label: 'Sea Route', icon: '⛵' },
    { id: 'tunnel', label: 'Tunnel', icon: '🚇' },
    { id: 'teleport', label: 'Teleport', icon: '✨' }
  ];

  const handleAddConnection = () => {
    if (newConnection.targetNodeId) {
      onChange([...connections, { ...newConnection, id: Date.now() }]);
      setNewConnection({
        targetNodeId: '',
        type: 'road',
        distance: 1,
        difficulty: 1
      });
    }
  };

  const handleRemoveConnection = (id) => {
    onChange(connections.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Existing connections */}
      {connections.length > 0 && (
        <div className="space-y-2">
          {connections.map(conn => (
            <div
              key={conn.id}
              className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20"
            >
              <div>
                <p className="font-medium text-white">To: {conn.targetNodeId}</p>
                <p className="text-sm text-gray-400">
                  {conn.type} • Distance: {conn.distance} • Difficulty: {conn.difficulty}
                </p>
              </div>
              <button
                onClick={() => handleRemoveConnection(conn.id)}
                className="text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new connection */}
      <div className="p-4 border-2 border-dashed border-white/20 rounded-lg">
        <h4 className="font-medium text-white mb-3">Add Connection</h4>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Target Node ID"
            value={newConnection.targetNodeId}
            onChange={(e) => setNewConnection({ ...newConnection, targetNodeId: e.target.value })}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
          />

          <select
            value={newConnection.type}
            onChange={(e) => setNewConnection({ ...newConnection, type: e.target.value })}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            {connectionTypes.map(type => (
              <option key={type.id} value={type.id} className="bg-gray-800">
                {type.label}
              </option>
            ))}
          </select>

          <div>
            <label className="text-sm text-gray-400">Distance</label>
            <input
              type="number"
              min="1"
              value={newConnection.distance}
              onChange={(e) => setNewConnection({ ...newConnection, distance: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Difficulty</label>
            <input
              type="number"
              min="1"
              max="10"
              value={newConnection.difficulty}
              onChange={(e) => setNewConnection({ ...newConnection, difficulty: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
        </div>

        <button
          onClick={handleAddConnection}
          className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Connection
        </button>
      </div>
    </div>
  );
};

/**
 * NodeEditor - Comprehensive node template editor component
 * 
 * @param {Object} initialNode - Existing node data for editing (optional)
 * @param {Function} onSave - Callback when node is saved (required)
 * @param {Function} onCancel - Callback when editing is cancelled (optional)
 * @param {Function} onChange - Callback when node data changes (optional)
 * @param {string} mode - 'create' or 'edit' mode (default: 'create')
 */
const NodeEditor = ({
  initialNode = null,
  onSave,
  onCancel,
  onChange,
  mode = 'create'
}) => {
  // Form state
  const [nodeData, setNodeData] = useState({
    id: mode === 'create' ? '' : (initialNode?.id || `node_${Date.now()}`),
    name: initialNode?.name || '',
    description: initialNode?.description || '',
    type: initialNode?.type || 'settlement',
    environment: initialNode?.environment || Environment.createDefault(),
    size: initialNode?.size || 100,
    populationCapacity: initialNode?.populationCapacity || 1000,
    currentPopulation: initialNode?.currentPopulation || 0,
    developmentLevel: initialNode?.developmentLevel || 1,
    features: initialNode?.features || [],
    resources: initialNode?.resources || [],
    modifiers: initialNode?.modifiers || {},
    connections: initialNode?.connections || [],
    tags: initialNode?.tags || [],
    metadata: initialNode?.metadata || {}
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [bulkOptions, setBulkOptions] = useState({ count: 5, distribution: 'random' });
  const [selectedNodes, setSelectedNodes] = useState([]);
  
  const { saveTemplate, loadTemplate } = useTemplates();

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(nodeData);
    }
  }, [nodeData, onChange]);

  // Handle ID initialization for edit mode
  useEffect(() => {
    if (mode === 'edit' && initialNode?.id && !nodeData.id) {
      setNodeData(prev => ({ ...prev, id: initialNode.id }));
    }
  }, [mode, initialNode?.id, nodeData.id]);

  // Validation using centralized domain validator
  const validateNode = useCallback(() => {
    const validation = WorldValidator.validateSingleNode(nodeData);
    
    // Convert validation errors to component error format
    const newErrors = {};
    validation.errors.forEach(error => {
      newErrors[error.field] = error.message;
    });

    // Add ID validation for create mode
    if (mode === 'create' && !nodeData.id.trim()) {
      newErrors.id = 'Node ID is required';
    }

    // Log warnings to console
    if (validation.warnings.length > 0) {
      console.warn('Node validation warnings:', validation.warnings);
    }

    setErrors(newErrors);
    return validation.isValid && Object.keys(newErrors).length === 0;
  }, [nodeData, mode]);

  // Handle save
  const handleSave = useCallback(() => {
    // Auto-generate ID if empty
    const finalNodeData = {
      ...nodeData,
      id: nodeData.id.trim() || `node_${Date.now()}`
    };

    // Update state with final data
    setNodeData(finalNodeData);

    if (!validateNode()) {
      return;
    }

    if (onSave) {
      onSave(finalNodeData);
    }
  }, [nodeData, onSave, validateNode]);

  // Template functions
  const handleSaveAsTemplate = useCallback(async () => {
    if (!validateNode()) {
      return;
    }

    const templateName = prompt('Enter template name:', `${nodeData.name} Template`);
    if (!templateName) return;

    const templateDescription = prompt('Enter template description (optional):', 
      `Template based on ${nodeData.name}`);

    try {
      const templateData = {
        ...nodeData,
        name: templateName,
        description: templateDescription || `Template based on ${nodeData.name}`,
        metadata: {
          ...nodeData.metadata,
          isTemplate: true,
          originalNodeId: nodeData.id,
          category: nodeData.type || 'general',
          difficulty: 'intermediate',
          author: 'User',
          version: '1.0.0'
        }
      };

      await saveTemplate('nodes', templateData);
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert(`Failed to save template: ${error.message}`);
    }
  }, [nodeData, validateNode, saveTemplate]);

  const handleLoadFromTemplate = useCallback((template) => {
    try {
      const instance = loadTemplate('nodes', template.id, {
        name: `${template.name} Instance`,
        id: `node_${Date.now()}`
      });

      setNodeData(instance);
      setShowTemplateLibrary(false);
    } catch (error) {
      console.error('Failed to load template:', error);
      alert(`Failed to load template: ${error.message}`);
    }
  }, [loadTemplate]);

  // Handle type selection
  const handleTypeSelect = (typeId) => {
    const type = NODE_TYPES.find(t => t.id === typeId);
    if (type) {
      setNodeData({
        ...nodeData,
        type: typeId,
        populationCapacity: type.defaultCapacity
      });
    }
  };

  // Handle environmental preset selection
  const handleEnvironmentalPresetSelect = useCallback((preset) => {
    try {
      // Apply the preset to current node data
      const enhancedData = EnvironmentalPresetService.applyPreset(nodeData, preset.id);
      
      // Create Environment instance from preset data
      const environmentInstance = Environment.fromJSON(enhancedData.environment);
      
      setNodeData({
        ...nodeData,
        environment: environmentInstance,
        type: enhancedData.type || nodeData.type,
        size: enhancedData.size || nodeData.size
      });
    } catch (error) {
      console.error('Failed to apply environmental preset:', error);
      alert(`Failed to apply preset: ${error.message}`);
    }
  }, [nodeData]);

  // Handle environmental preset preview
  const handleEnvironmentalPresetPreview = useCallback((preset) => {
    // For now, just show an alert with preset info
    // In a full implementation, this could show a preview modal
    alert(`Preview: ${preset.name}\n${preset.description}\nTerrain: ${preset.environment.terrain}\nClimate: ${preset.environment.climate}`);
  }, []);

  // Handle environmental property changes
  const handleEnvironmentChange = useCallback((property, value) => {
    const currentEnv = nodeData.environment instanceof Environment 
      ? nodeData.environment.toJSON() 
      : nodeData.environment;
    
    const updatedEnvData = {
      ...currentEnv,
      [property]: value
    };
    
    try {
      const newEnvironment = Environment.fromJSON(updatedEnvData);
      setNodeData({
        ...nodeData,
        environment: newEnvironment
      });
    } catch (error) {
      console.error('Failed to update environment:', error);
    }
  }, [nodeData]);

  // Handle hazard changes
  const handleHazardsChange = useCallback((hazards) => {
    const currentEnv = nodeData.environment instanceof Environment 
      ? nodeData.environment.toJSON() 
      : nodeData.environment;
    
    const updatedEnvData = {
      ...currentEnv,
      hazards: hazards.map(hazard => hazard.toJSON ? hazard.toJSON() : hazard)
    };
    
    try {
      const newEnvironment = Environment.fromJSON(updatedEnvData);
      setNodeData({
        ...nodeData,
        environment: newEnvironment
      });
    } catch (error) {
      console.error('Failed to update hazards:', error);
    }
  }, [nodeData]);

  // Tabs configuration
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'environment', label: 'Environment', icon: '🌍' },
    { id: 'features', label: 'Features', icon: '⭐' },
    { id: 'resources', label: 'Resources', icon: '💎' },
    { id: 'modifiers', label: 'Modifiers', icon: '⚙️' },
    { id: 'settlement', label: 'Settlement', icon: '🏘️' },
    { id: 'connections', label: 'Connections', icon: '🔗' },
    { id: 'bulk', label: 'Bulk Operations', icon: '📦' },
    { id: 'advanced', label: 'Advanced', icon: '🔧' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          {mode === 'create' ? 'Create Node Template' : 'Edit Node Template'}
        </h2>
        <p className="text-gray-400 mt-1">
          Define a location template for world generation
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors
              ${activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Node ID {mode === 'create' && <span className="text-red-500">*</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nodeData.id}
                  onChange={(e) => setNodeData({ ...nodeData, id: e.target.value })}
                  disabled={mode === 'edit'}
                  className={`
                    flex-1 px-4 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400
                    ${errors.id ? 'border-red-500' : 'border-white/20'}
                    ${mode === 'edit' ? 'text-gray-400' : ''}
                  `}
                  placeholder={mode === 'create' ? 'Enter custom node ID...' : ''}
                />
                {mode === 'create' && (
                  <button
                    onClick={() => setNodeData({ ...nodeData, id: `node_${Date.now()}` })}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm whitespace-nowrap"
                    title="Auto-generate ID"
                  >
                    Auto ID
                  </button>
                )}
              </div>
              {errors.id && (
                <p className="text-red-500 text-sm mt-1">{errors.id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nodeData.name}
                onChange={(e) => setNodeData({ ...nodeData, name: e.target.value })}
                className={`
                  w-full px-4 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400
                  ${errors.name ? 'border-red-500' : 'border-white/20'}
                `}
                placeholder="Enter node name..."
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={nodeData.description}
                onChange={(e) => setNodeData({ ...nodeData, description: e.target.value })}
                rows={4}
                className={`
                  w-full px-4 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400
                  ${errors.description ? 'border-red-500' : 'border-white/20'}
                `}
                placeholder="Describe this location..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Node Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {NODE_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${nodeData.type === type.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/20 hover:border-white/40 bg-white/5'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium text-white">{type.label}</div>
                    <div className="text-xs text-gray-400">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Population Capacity
                </label>
                <input
                  type="number"
                  min="0"
                  value={nodeData.populationCapacity}
                  onChange={(e) => setNodeData({ ...nodeData, populationCapacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Development Level
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={nodeData.developmentLevel}
                  onChange={(e) => setNodeData({ ...nodeData, developmentLevel: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tags
              </label>
              <input
                type="text"
                placeholder="Add tags separated by commas..."
                value={nodeData.tags.join(', ')}
                onChange={(e) => setNodeData({
                  ...nodeData,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
          </div>
        )}

        {/* Environment Tab */}
        {activeTab === 'environment' && (
          <div className="space-y-6">
            {/* Environmental Preset Selector */}
            <div>
              <EnvironmentalPresetSelector
                currentNodeData={nodeData}
                onPresetSelect={handleEnvironmentalPresetSelect}
                onPresetPreview={handleEnvironmentalPresetPreview}
                showRecommendations={true}
              />
            </div>

            {/* Manual Environmental Controls */}
            <div className="border-t border-white/20 pt-6">
              <h4 className="font-medium text-white mb-4">Manual Environmental Configuration</h4>
              
              {/* Get current environment data */}
              {(() => {
                const currentEnv = nodeData.environment instanceof Environment 
                  ? nodeData.environment.toJSON() 
                  : nodeData.environment;

                return (
                  <div className="space-y-4">
                    {/* Terrain Type */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Terrain Type
                      </label>
                      <select
                        value={currentEnv.terrain || TerrainTypes.PLAINS}
                        onChange={(e) => handleEnvironmentChange('terrain', e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      >
                        {Object.entries(TERRAIN_DESCRIPTIONS).map(([type, description]) => (
                          <option key={type} value={type} className="bg-gray-800">
                            {description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Climate Type */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Climate Type
                      </label>
                      <select
                        value={currentEnv.climate || ClimateTypes.TEMPERATE}
                        onChange={(e) => handleEnvironmentChange('climate', e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      >
                        {Object.entries(CLIMATE_DESCRIPTIONS).map(([type, description]) => (
                          <option key={type} value={type} className="bg-gray-800">
                            {description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Lighting Conditions */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Lighting Conditions
                      </label>
                      <select
                        value={currentEnv.lighting || LightingTypes.NORMAL}
                        onChange={(e) => handleEnvironmentChange('lighting', e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      >
                        {Object.entries(LIGHTING_DESCRIPTIONS).map(([type, description]) => (
                          <option key={type} value={type} className="bg-gray-800">
                            {description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Environmental Properties Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Density */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Density ({Math.round((currentEnv.density || 0.5) * 100)}%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={currentEnv.density || 0.5}
                          onChange={(e) => handleEnvironmentChange('density', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      {/* Shelter Quality */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Shelter Quality ({Math.round((currentEnv.shelterQuality || 0.5) * 100)}%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={currentEnv.shelterQuality || 0.5}
                          onChange={(e) => handleEnvironmentChange('shelterQuality', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      {/* Air Quality */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Air Quality ({Math.round((currentEnv.airQuality || 0.8) * 100)}%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={currentEnv.airQuality || 0.8}
                          onChange={(e) => handleEnvironmentChange('airQuality', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      {/* Water Availability */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Water Availability ({Math.round((currentEnv.waterAvailability || 0.7) * 100)}%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={currentEnv.waterAvailability || 0.7}
                          onChange={(e) => handleEnvironmentChange('waterAvailability', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      {/* Humidity */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Humidity ({Math.round((currentEnv.humidity || 0.5) * 100)}%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={currentEnv.humidity || 0.5}
                          onChange={(e) => handleEnvironmentChange('humidity', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      {/* Wind Strength */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Wind Strength ({Math.round((currentEnv.windStrength || 0.3) * 100)}%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={currentEnv.windStrength || 0.3}
                          onChange={(e) => handleEnvironmentChange('windStrength', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Temperature */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Temperature ({currentEnv.temperature || 15}°C)
                      </label>
                      <input
                        type="range"
                        min="-30"
                        max="50"
                        step="1"
                        value={currentEnv.temperature || 15}
                        onChange={(e) => handleEnvironmentChange('temperature', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Node Size */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Node Size
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        value={nodeData.size || 100}
                        onChange={(e) => setNodeData({ ...nodeData, size: parseInt(e.target.value) || 100 })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Hazard Management */}
            <div className="border-t border-white/20 pt-6">
              {(() => {
                const currentEnv = nodeData.environment instanceof Environment 
                  ? nodeData.environment.toJSON() 
                  : nodeData.environment;

                return (
                  <HazardManager
                    hazards={currentEnv.hazards || []}
                    onChange={handleHazardsChange}
                  />
                );
              })()}
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Select features that define this location's special characteristics
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {NODE_FEATURES.map(feature => (
                <button
                  key={feature.id}
                  onClick={() => {
                    const hasFeature = nodeData.features.some(f => f.id === feature.id);
                    if (hasFeature) {
                      setNodeData({
                        ...nodeData,
                        features: nodeData.features.filter(f => f.id !== feature.id)
                      });
                    } else {
                      setNodeData({
                        ...nodeData,
                        features: [...nodeData.features, feature]
                      });
                    }
                  }}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${nodeData.features.some(f => f.id === feature.id)
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 hover:border-white/40 bg-white/5'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="font-medium text-white mb-1">{feature.label}</div>
                  <div className="text-xs text-gray-400">
                    {Object.entries(feature.modifiers)
                      .map(([key, value]) => `${key}: ${value > 0 ? '+' : ''}${value}`)
                      .join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Select or add resources available at this location
            </p>
            <ResourceSelector
              resources={nodeData.resources}
              onChange={(resources) => setNodeData({ ...nodeData, resources })}
            />
          </div>
        )}

        {/* Modifiers Tab */}
        {activeTab === 'modifiers' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Define custom modifiers that affect characters and interactions at this location
            </p>
            <CustomModifierEditor
              modifiers={nodeData.modifiers}
              onChange={(modifiers) => setNodeData({ ...nodeData, modifiers })}
            />
          </div>
        )}

        {/* Settlement Tab */}
        {activeTab === 'settlement' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Settlement Integration</h3>
              <p className="text-sm text-gray-400 mb-4">
                Configure how this node integrates with settlements in the multi-node settlement system
              </p>
            </div>

            {/* Settlement Assignment */}
            <div className="p-4 bg-white/10 rounded-lg border border-white/20">
              <h4 className="font-medium text-white mb-3">Settlement Assignment</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Settlement ID
                  </label>
                  <input
                    type="text"
                    value={nodeData.settlementId || ''}
                    onChange={(e) => setNodeData({ ...nodeData, settlementId: e.target.value || null })}
                    placeholder="Enter settlement ID..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Leave empty if this node is not part of a settlement
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Settlement Role
                  </label>
                  <select
                    value={nodeData.settlementRole || ''}
                    onChange={(e) => setNodeData({ ...nodeData, settlementRole: e.target.value || null })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="">No Role Assigned</option>
                    <option value="core">Core (Settlement Center)</option>
                    <option value="district">District (Main Area)</option>
                    <option value="outpost">Outpost (Remote Area)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Settlement Effects Display */}
            {nodeData.settlementEffects && Object.keys(nodeData.settlementEffects).length > 0 && (
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h4 className="font-medium text-white mb-3">Settlement Effects</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(nodeData.settlementEffects).map(([effect, value]) => (
                    <div key={effect} className="flex justify-between items-center">
                      <span className="text-sm text-gray-300 capitalize">
                        {effect.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <span className={`text-sm font-medium ${
                        typeof value === 'number' && value > 0 ? 'text-green-400' :
                        typeof value === 'number' && value < 0 ? 'text-red-400' :
                        'text-blue-400'
                      }`}>
                        {typeof value === 'number' ? 
                          (value > 0 ? `+${value}` : value) : 
                          String(value)
                        }
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  These effects are applied by the settlement this node belongs to
                </p>
              </div>
            )}

            {/* Settlement Info */}
            {nodeData.settlementId && (
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h4 className="font-medium text-white mb-2">Settlement Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Settlement ID:</span>
                    <span className="text-white font-mono">{nodeData.settlementId}</span>
                  </div>
                  {nodeData.settlementRole && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Role:</span>
                      <span className="text-white capitalize">{nodeData.settlementRole}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Integration Status:</span>
                    <span className="text-green-400">Active</span>
                  </div>
                </div>
              </div>
            )}

            {/* Settlement Management Tips */}
            <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
              <h4 className="font-medium text-white mb-2">Settlement Management Tips</h4>
              <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                <li><strong>Core nodes</strong> are the heart of a settlement and provide the most bonuses</li>
                <li><strong>District nodes</strong> are main areas that contribute to settlement growth</li>
                <li><strong>Outpost nodes</strong> are remote areas that extend settlement influence</li>
                <li>Settlement effects automatically apply bonuses to all assigned nodes</li>
                <li>Development level determines maximum number of nodes a settlement can have</li>
              </ul>
            </div>
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Define connections to other nodes
            </p>
            <ConnectionEditor
              connections={nodeData.connections}
              onChange={(connections) => setNodeData({ ...nodeData, connections })}
            />
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Custom Metadata (JSON)
              </label>
              <textarea
                value={JSON.stringify(nodeData.metadata, null, 2)}
                onChange={(e) => {
                  try {
                    const metadata = JSON.parse(e.target.value);
                    setNodeData({ ...nodeData, metadata });
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={8}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg font-mono text-sm text-white"
              />
            </div>

            <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
              <h4 className="font-medium text-white mb-2">Node Usage Notes</h4>
              <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                <li>Nodes represent locations in your world</li>
                <li>Population capacity determines maximum NPCs</li>
                <li>Features and modifiers affect interactions</li>
                <li>Resources enable economic systems</li>
                <li>Connections define travel between nodes</li>
              </ul>
            </div>
          </div>
        )}

        {/* Bulk Operations Tab */}
        {activeTab === 'bulk' && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Create multiple nodes at once with batch operations
            </p>
            <BulkControls
              title="Bulk Node Operations"
              itemType="node"
              itemTypePlural="nodes"
              bulkOptions={bulkOptions}
              onBulkOptionsChange={setBulkOptions}
              selectedItems={selectedNodes}
              totalItems={1} // Current node being edited
              onSelectAll={() => setSelectedNodes([nodeData.id])}
              onDeselectAll={() => setSelectedNodes([])}
              onPreview={() => {
                console.log('Preview bulk nodes:', bulkOptions);
                // TODO: Implement preview functionality
              }}
              onGenerate={() => {
                console.log('Generate bulk nodes:', bulkOptions);
                // TODO: Implement bulk generation
              }}
              onDuplicate={(items) => {
                console.log('Duplicate nodes:', items);
                // TODO: Implement duplication
              }}
              onDeleteSelected={(items) => {
                console.log('Delete selected nodes:', items);
                // TODO: Implement deletion
              }}
              showGeneration={true}
              showSelection={false}
              showPreview={true}
              showDuplicate={false}
              showDelete={false}
            />
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
        <h3 className="font-semibold text-white mb-3">Preview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-300">Type:</span>{' '}
            <span className="text-white">
              {NODE_TYPES.find(t => t.id === nodeData.type)?.label}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Environment:</span>{' '}
            <span className="text-white">
              {(() => {
                const env = nodeData.environment instanceof Environment 
                  ? nodeData.environment.toJSON() 
                  : nodeData.environment;
                return env.terrain || 'Unknown';
              })()}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Climate:</span>{' '}
            <span className="text-white">
              {(() => {
                const env = nodeData.environment instanceof Environment 
                  ? nodeData.environment.toJSON() 
                  : nodeData.environment;
                return env.climate || 'Unknown';
              })()}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Size:</span>{' '}
            <span className="text-white">{nodeData.size || 100}</span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Capacity:</span>{' '}
            <span className="text-white">{nodeData.populationCapacity}</span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Features:</span>{' '}
            <span className="text-white">{nodeData.features.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Resources:</span>{' '}
            <span className="text-white">{nodeData.resources.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Connections:</span>{' '}
            <span className="text-white">{nodeData.connections.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Temperature:</span>{' '}
            <span className="text-white">
              {(() => {
                const env = nodeData.environment instanceof Environment 
                  ? nodeData.environment.toJSON() 
                  : nodeData.environment;
                return `${env.temperature || 15}°C`;
              })()}
            </span>
          </div>
        </div>
        
        {/* Environmental Status Indicators */}
        {(() => {
          const env = nodeData.environment instanceof Environment 
            ? nodeData.environment 
            : Environment.fromJSON(nodeData.environment || {});
          
          return (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  env.isHospitable() ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {env.isHospitable() ? 'Hospitable' : 'Inhospitable'}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  env.isDangerous() ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {env.isDangerous() ? 'Dangerous' : 'Safe'}
                </span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                  Comfort: {Math.round(env.getComfortLevel() * 100)}%
                </span>
                {env.hazards && env.hazards.length > 0 && (
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                    {env.hazards.length} Hazard{env.hazards.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-6">
        {/* Template Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowTemplateLibrary(true)}
            className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 text-gray-300 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Load Template
          </button>
          {mode !== 'create' && (
            <button
              onClick={handleSaveAsTemplate}
              className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 text-gray-300 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save as Template
            </button>
          )}
        </div>

        {/* Main Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-white/20 rounded-lg hover:bg-white/10 text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {mode === 'create' ? 'Create Node' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-white/20 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-white/20 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Node Templates</h3>
              <button
                onClick={() => setShowTemplateLibrary(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              <TemplateLibraryPanel
                selectedType="nodes"
                onTemplateSelect={handleLoadFromTemplate}
                showRecommendations={true}
                enableBulkOperations={false}
                className="border-0 bg-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeEditor;
