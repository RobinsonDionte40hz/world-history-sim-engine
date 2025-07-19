import React, { useState, useCallback } from 'react';
// import { useDispatch } from '../../store/selectors/templateSelectors.js'; // TODO: Use when Redux actions are needed

// Placeholder functions for node management
const createNodeTemplate = (nodeData) => {
  // TODO: Implement actual Redux action or API call
  console.log('Creating node template:', nodeData);
  return { type: 'CREATE_NODE_TEMPLATE', payload: nodeData };
};

const updateNodeTemplate = (nodeData) => {
  // TODO: Implement actual Redux action or API call
  console.log('Updating node template:', nodeData);
  return { type: 'UPDATE_NODE_TEMPLATE', payload: nodeData };
};

// Environment type constants
const ENVIRONMENT_TYPES = [
  { id: 'forest', label: 'Forest', icon: '🌲' },
  { id: 'plains', label: 'Plains', icon: '🌾' },
  { id: 'mountains', label: 'Mountains', icon: '⛰️' },
  { id: 'desert', label: 'Desert', icon: '🏜️' },
  { id: 'tundra', label: 'Tundra', icon: '❄️' },
  { id: 'swamp', label: 'Swamp', icon: '🌿' },
  { id: 'coastal', label: 'Coastal', icon: '🏖️' },
  { id: 'urban', label: 'Urban', icon: '🏛️' },
  { id: 'underground', label: 'Underground', icon: '⛏️' },
  { id: 'magical', label: 'Magical', icon: '✨' }
];

// Resource categories
const RESOURCE_CATEGORIES = {
  natural: {
    label: 'Natural Resources',
    icon: '🌿',
    examples: ['Wood', 'Stone', 'Iron Ore', 'Gold', 'Fresh Water', 'Fertile Soil']
  },
  agricultural: {
    label: 'Agricultural',
    icon: '🌾',
    examples: ['Wheat', 'Livestock', 'Fruits', 'Vegetables', 'Herbs', 'Spices']
  },
  trade: {
    label: 'Trade Goods',
    icon: '💎',
    examples: ['Silk', 'Gems', 'Pottery', 'Textiles', 'Wine', 'Salt']
  },
  strategic: {
    label: 'Strategic',
    icon: '⚔️',
    examples: ['Weapons', 'Armor', 'Horses', 'Ships', 'Fortifications']
  }
};

// Feature types
const FEATURE_TYPES = [
  { id: 'river', label: 'River', modifiers: { movementSpeed: 1.2, trade: 1.3 } },
  { id: 'road', label: 'Road', modifiers: { movementSpeed: 1.5, trade: 1.2 } },
  { id: 'harbor', label: 'Harbor', modifiers: { trade: 1.5, naval: 2.0 } },
  { id: 'ruins', label: 'Ancient Ruins', modifiers: { exploration: 1.5, danger: 1.2 } },
  { id: 'fortress', label: 'Fortress', modifiers: { defense: 2.0, control: 1.5 } },
  { id: 'market', label: 'Market', modifiers: { trade: 1.4, prosperity: 1.3 } },
  { id: 'temple', label: 'Temple', modifiers: { faith: 1.5, culture: 1.2 } },
  { id: 'mine', label: 'Mine', modifiers: { resources: 1.5, prosperity: 1.2 } }
];

// Modifier input component
const ModifierInput = ({ modifiers, onChange, onRemove }) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newKey && newValue) {
      onChange({ ...modifiers, [newKey]: parseFloat(newValue) || newValue });
      setNewKey('');
      setNewValue('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {Object.entries(modifiers).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900 rounded-full"
          >
            <span className="text-sm font-medium">{key}: {value}</span>
            <button
              onClick={() => onRemove(key)}
              className="text-red-600 dark:text-red-400 hover:text-red-800"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Modifier name"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
        <input
          type="text"
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="w-24 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
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

// Resource selector component
const ResourceSelector = ({ resources, onChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('natural');
  const [customResource, setCustomResource] = useState('');

  const handleToggleResource = (resource) => {
    const updated = resources.includes(resource)
      ? resources.filter(r => r !== resource)
      : [...resources, resource];
    onChange(updated);
  };

  const handleAddCustom = () => {
    if (customResource && !resources.includes(customResource)) {
      onChange([...resources, customResource]);
      setCustomResource('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {Object.entries(RESOURCE_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`
              px-3 py-2 rounded-lg font-medium whitespace-nowrap
              ${selectedCategory === key
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Resource examples */}
      <div className="flex flex-wrap gap-2">
        {RESOURCE_CATEGORIES[selectedCategory].examples.map(resource => (
          <button
            key={resource}
            onClick={() => handleToggleResource(resource)}
            className={`
              px-3 py-1 rounded-full text-sm transition-colors
              ${resources.includes(resource)
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            {resource}
          </button>
        ))}
      </div>

      {/* Custom resource input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add custom resource..."
          value={customResource}
          onChange={(e) => setCustomResource(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
        <button
          onClick={handleAddCustom}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Add
        </button>
      </div>

      {/* Selected resources */}
      {resources.length > 0 && (
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm font-medium mb-2">Selected Resources:</p>
          <div className="flex flex-wrap gap-2">
            {resources.map(resource => (
              <span
                key={resource}
                className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-sm"
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

// Connection editor component
const ConnectionEditor = ({ connections, onChange }) => {
  const [newConnection, setNewConnection] = useState({
    targetNodeId: '',
    type: 'road',
    difficulty: 1,
    distance: 1
  });

  const connectionTypes = [
    { id: 'road', label: 'Road', icon: '🛤️' },
    { id: 'river', label: 'River', icon: '🌊' },
    { id: 'mountain_pass', label: 'Mountain Pass', icon: '⛰️' },
    { id: 'sea_route', label: 'Sea Route', icon: '⛵' },
    { id: 'portal', label: 'Portal', icon: '🌀' }
  ];

  const handleAddConnection = () => {
    if (newConnection.targetNodeId) {
      onChange([...connections, { ...newConnection, id: Date.now() }]);
      setNewConnection({
        targetNodeId: '',
        type: 'road',
        difficulty: 1,
        distance: 1
      });
    }
  };

  const handleRemoveConnection = (id) => {
    onChange(connections.filter(conn => conn.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Existing connections */}
      {connections.length > 0 && (
        <div className="space-y-2">
          {connections.map(conn => (
            <div
              key={conn.id}
              className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {connectionTypes.find(t => t.id === conn.type)?.icon || '🛤️'}
                </span>
                <div>
                  <p className="font-medium">To: {conn.targetNodeId}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {conn.type} • Distance: {conn.distance} • Difficulty: {conn.difficulty}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveConnection(conn.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new connection */}
      <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <h4 className="font-medium mb-3">Add Connection</h4>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Target Node ID"
            value={newConnection.targetNodeId}
            onChange={(e) => setNewConnection({...newConnection, targetNodeId: e.target.value})}
            className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
          <select
            value={newConnection.type}
            onChange={(e) => setNewConnection({...newConnection, type: e.target.value})}
            className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          >
            {connectionTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Distance</label>
            <input
              type="number"
              min="1"
              value={newConnection.distance}
              onChange={(e) => setNewConnection({...newConnection, distance: parseInt(e.target.value) || 1})}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Difficulty</label>
            <input
              type="number"
              min="1"
              max="10"
              value={newConnection.difficulty}
              onChange={(e) => setNewConnection({...newConnection, difficulty: parseInt(e.target.value) || 1})}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
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

// Main NodeEditor component
const NodeEditor = ({ 
  initialNode = null, 
  onSave,
  onCancel,
  mode = 'create' // 'create' or 'edit'
}) => {
  // const dispatch = useDispatch(); // TODO: Use when Redux actions are needed
  
  // Form state
  const [nodeData, setNodeData] = useState({
    id: initialNode?.id || `node_${Date.now()}`,
    name: initialNode?.name || '',
    description: initialNode?.description || '',
    environment: initialNode?.environment || 'plains',
    resources: initialNode?.resources || [],
    features: initialNode?.features || [],
    modifiers: initialNode?.modifiers || {},
    connections: initialNode?.connections || [],
    populationCapacity: initialNode?.populationCapacity || 100,
    developmentLevel: initialNode?.developmentLevel || 0,
    tags: initialNode?.tags || [],
    metadata: initialNode?.metadata || {}
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  // Validation
  const validateNode = useCallback(() => {
    const newErrors = {};
    
    if (!nodeData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!nodeData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (nodeData.populationCapacity < 0) {
      newErrors.populationCapacity = 'Population capacity must be positive';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [nodeData]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!validateNode()) {
      return;
    }

    const action = mode === 'create' 
      ? createNodeTemplate(nodeData)
      : updateNodeTemplate(nodeData);
    
    // dispatch(action); // TODO: Use when Redux is properly set up
    console.log('Would dispatch action:', action);
    
    if (onSave) {
      onSave(nodeData);
    }
  }, [nodeData, mode, onSave, validateNode]);

  // Handle feature toggle
  const handleToggleFeature = (featureId) => {
    const feature = FEATURE_TYPES.find(f => f.id === featureId);
    const updatedFeatures = nodeData.features.some(f => f.id === featureId)
      ? nodeData.features.filter(f => f.id !== featureId)
      : [...nodeData.features, feature];
    
    // Update modifiers based on features
    const newModifiers = { ...nodeData.modifiers };
    if (!nodeData.features.some(f => f.id === featureId)) {
      // Adding feature - merge modifiers
      Object.entries(feature.modifiers).forEach(([key, value]) => {
        newModifiers[key] = (newModifiers[key] || 1) * value;
      });
    } else {
      // Removing feature - divide out modifiers
      Object.entries(feature.modifiers).forEach(([key, value]) => {
        if (newModifiers[key]) {
          newModifiers[key] = newModifiers[key] / value;
          if (Math.abs(newModifiers[key] - 1) < 0.01) {
            delete newModifiers[key];
          }
        }
      });
    }
    
    setNodeData({
      ...nodeData,
      features: updatedFeatures,
      modifiers: newModifiers
    });
  };

  // Tabs configuration
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'environment', label: 'Environment', icon: '🌍' },
    { id: 'resources', label: 'Resources', icon: '💎' },
    { id: 'features', label: 'Features', icon: '🏛️' },
    { id: 'connections', label: 'Connections', icon: '🔗' },
    { id: 'modifiers', label: 'Modifiers', icon: '⚡' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {mode === 'create' ? 'Create Node Template' : 'Edit Node Template'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
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
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Node ID
              </label>
              <input
                type="text"
                value={nodeData.id}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nodeData.name}
                onChange={(e) => setNodeData({...nodeData, name: e.target.value})}
                className={`
                  w-full px-4 py-2 border rounded-lg dark:bg-gray-800
                  ${errors.name ? 'border-red-500' : 'dark:border-gray-600'}
                `}
                placeholder="Enter node name..."
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={nodeData.description}
                onChange={(e) => setNodeData({...nodeData, description: e.target.value})}
                rows={4}
                className={`
                  w-full px-4 py-2 border rounded-lg dark:bg-gray-800
                  ${errors.description ? 'border-red-500' : 'dark:border-gray-600'}
                `}
                placeholder="Describe this location..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Population Capacity
                </label>
                <input
                  type="number"
                  min="0"
                  value={nodeData.populationCapacity}
                  onChange={(e) => setNodeData({...nodeData, populationCapacity: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Development Level (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={nodeData.developmentLevel}
                  onChange={(e) => setNodeData({...nodeData, developmentLevel: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Environment Tab */}
        {activeTab === 'environment' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Environment Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ENVIRONMENT_TYPES.map(env => (
                  <button
                    key={env.id}
                    onClick={() => setNodeData({...nodeData, environment: env.id})}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${nodeData.environment === env.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{env.icon}</div>
                    <div className="text-sm font-medium">{env.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Environmental Tags
              </label>
              <input
                type="text"
                placeholder="Add tags separated by commas..."
                value={nodeData.tags.join(', ')}
                onChange={(e) => setNodeData({
                  ...nodeData, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <ResourceSelector
            resources={nodeData.resources}
            onChange={(resources) => setNodeData({...nodeData, resources})}
          />
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select features that define this location's special characteristics
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FEATURE_TYPES.map(feature => (
                <button
                  key={feature.id}
                  onClick={() => handleToggleFeature(feature.id)}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${nodeData.features.some(f => f.id === feature.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }
                  `}
                >
                  <div className="font-medium mb-1">{feature.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {Object.entries(feature.modifiers)
                      .map(([k, v]) => `${k}: ×${v}`)
                      .join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <ConnectionEditor
            connections={nodeData.connections}
            onChange={(connections) => setNodeData({...nodeData, connections})}
          />
        )}

        {/* Modifiers Tab */}
        {activeTab === 'modifiers' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Define custom modifiers that affect characters and interactions at this location
            </p>
            <ModifierInput
              modifiers={nodeData.modifiers}
              onChange={(modifiers) => setNodeData({...nodeData, modifiers})}
              onRemove={(key) => {
                const newModifiers = { ...nodeData.modifiers };
                delete newModifiers[key];
                setNodeData({...nodeData, modifiers: newModifiers});
              }}
            />
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-3">Preview</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Environment:</span> {nodeData.environment}
          </div>
          <div>
            <span className="font-medium">Capacity:</span> {nodeData.populationCapacity}
          </div>
          <div>
            <span className="font-medium">Resources:</span> {nodeData.resources.length}
          </div>
          <div>
            <span className="font-medium">Features:</span> {nodeData.features.length}
          </div>
          <div>
            <span className="font-medium">Connections:</span> {nodeData.connections.length}
          </div>
          <div>
            <span className="font-medium">Modifiers:</span> {Object.keys(nodeData.modifiers).length}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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
  );
};

export default NodeEditor;