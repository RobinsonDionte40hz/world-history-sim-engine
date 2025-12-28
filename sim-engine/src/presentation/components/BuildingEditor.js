import React, { useState, useCallback, useMemo } from 'react';
import { Save, Upload, Plus, X, Trash2, Building2, Users, Wrench, TrendingUp } from 'lucide-react';
import useTemplates from '../hooks/useTemplates';
import TemplateLibraryPanel from './TemplateLibraryPanel';
import PlaceholderEditor from './text-templating/PlaceholderEditor';
import EditorContextService from '../../application/services/EditorContextService';
import { ResourceCategory } from '../../domain/value-objects/ResourceCategory';

// Building categories
const BUILDING_CATEGORIES = [
  { id: 'production', label: 'Production', icon: '🏭', color: 'blue' },
  { id: 'service', label: 'Service', icon: '🏪', color: 'green' },
  { id: 'defense', label: 'Defense', icon: '🏰', color: 'red' },
  { id: 'civic', label: 'Civic', icon: '🏛️', color: 'purple' },
  { id: 'residential', label: 'Residential', icon: '🏘️', color: 'yellow' },
  { id: 'special', label: 'Special', icon: '✨', color: 'orange' }
];

// Service types
const SERVICE_TYPES = [
  { id: 'training', label: 'Training', description: 'Improves character skills' },
  { id: 'healing', label: 'Healing', description: 'Restores health and removes ailments' },
  { id: 'entertainment', label: 'Entertainment', description: 'Increases happiness' },
  { id: 'research', label: 'Research', description: 'Generates knowledge and discoveries' },
  { id: 'storage', label: 'Storage', description: 'Stores resources' },
  { id: 'administration', label: 'Administration', description: 'Improves governance' },
  { id: 'trade', label: 'Trade', description: 'Enables commerce' }
];

// Rarity levels
const RARITY_LEVELS = [
  { id: 'common', label: 'Common', color: 'gray' },
  { id: 'uncommon', label: 'Uncommon', color: 'green' },
  { id: 'rare', label: 'Rare', color: 'blue' },
  { id: 'unique', label: 'Unique', color: 'purple' }
];

/**
 * BuildingEditor - Component for creating and editing building types
 */
const BuildingEditor = ({ 
  initialBuilding = null, 
  onChange, 
  onSave, 
  onCancel, 
  mode = 'create',
  currentWorld = null
}) => {
  const [building, setBuilding] = useState(() => {
    const baseBuilding = initialBuilding || {
      name: '',
      description: '',
      category: 'production',
      icon: '🏢',
      color: 'gray',
      constructionCost: {
        resources: [],
        gold: 0,
        constructionTime: 1
      },
      prerequisites: {
        settlementLevel: 0,
        population: 0,
        buildings: [],
        technologies: [],
        reputation: null
      },
      workerCapacity: {
        min: 1,
        max: 5,
        optimal: 3,
        efficiency: {
          underStaffed: 0.5,
          optimal: 1.0,
          overStaffed: 0.8
        }
      },
      production: {
        enabled: false,
        recipes: [],
        simultaneousRecipes: 1,
        productionBonus: 0,
        qualityBonus: 0,
        speedMultiplier: 1.0
      },
      service: {
        enabled: false,
        type: null,
        capacity: 0,
        effects: []
      },
      storage: {
        enabled: false,
        capacity: 0,
        categories: [],
        preservationBonus: 0
      },
      maintenance: {
        resources: [],
        gold: 0,
        workers: 0
      },
      upgrades: {
        enabled: true,
        maxLevel: 5,
        levelBenefits: []
      },
      placement: {
        size: 1,
        terrainTypes: [],
        exclusive: false,
        adjacencyRules: []
      },
      settlementEffects: {
        populationCapacity: 0,
        happinessModifier: 0,
        defenseBonus: 0,
        prestigeGain: 0,
        cultureGeneration: 0
      },
      environmentalRequirements: {
        climate: [],
        nearResource: null,
        nearWater: false,
        nearForest: false
      },
      automation: {
        autoAssignWorkers: true,
        autoSelectRecipes: false,
        priorityScore: 5
      },
      tags: [],
      rarity: 'common'
    };

    return baseBuilding;
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState({});
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);

  // Context detection for text templating
  const editorContext = useMemo(() => {
    return EditorContextService.detectContext('building', {
      building,
      world: currentWorld
    });
  }, [currentWorld, building]);

  // Template management
  const {
    templates: buildingTemplates,
    saveTemplate,
    loadTemplate,
    deleteTemplate
  } = useTemplates('building');

  // Update building data
  const updateBuilding = useCallback((updates) => {
    setBuilding(prev => {
      const updated = { ...prev, ...updates };
      if (onChange) onChange(updated);
      return updated;
    });
  }, [onChange]);

  // Update nested properties
  const updateNested = useCallback((path, value) => {
    setBuilding(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      
      if (onChange) onChange(updated);
      return updated;
    });
  }, [onChange]);

  // Handle save
  const handleSave = useCallback(() => {
    const errors = validateBuilding(building);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (onSave) {
      onSave(building);
    }
  }, [building, onSave]);

  // Validate building
  const validateBuilding = (buildingData) => {
    const errors = {};

    if (!buildingData.name || buildingData.name.trim() === '') {
      errors.name = 'Building name is required';
    }

    if (buildingData.workerCapacity.min > buildingData.workerCapacity.max) {
      errors.workerCapacity = 'Minimum workers cannot exceed maximum';
    }

    if (buildingData.production.enabled && buildingData.production.recipes.length === 0) {
      errors.production = 'Production enabled but no recipes specified';
    }

    return errors;
  };

  // Tab configuration
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'construction', label: 'Construction', icon: '🔨' },
    { id: 'workers', label: 'Workers', icon: '👷' },
    { id: 'production', label: 'Production', icon: '🏭' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { id: 'effects', label: 'Effects', icon: '✨' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {mode === 'create' ? 'Create Building Type' : 'Edit Building Type'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Define custom buildings for settlements
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplateLibrary(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Load Template
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Building
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/20 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 whitespace-nowrap transition-all
              ${activeTab === tab.id
                ? 'border-b-2 border-indigo-500 text-white font-medium'
                : 'text-gray-400 hover:text-white'
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <BasicInfoTab
            building={building}
            updateBuilding={updateBuilding}
            validationErrors={validationErrors}
            editorContext={editorContext}
          />
        )}

        {/* Construction Tab */}
        {activeTab === 'construction' && (
          <ConstructionTab
            building={building}
            updateBuilding={updateBuilding}
            updateNested={updateNested}
          />
        )}

        {/* Workers Tab */}
        {activeTab === 'workers' && (
          <WorkersTab
            building={building}
            updateNested={updateNested}
          />
        )}

        {/* Production Tab */}
        {activeTab === 'production' && (
          <ProductionTab
            building={building}
            updateNested={updateNested}
          />
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <MaintenanceTab
            building={building}
            updateNested={updateNested}
          />
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <EffectsTab
            building={building}
            updateNested={updateNested}
          />
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <AdvancedTab
            building={building}
            updateBuilding={updateBuilding}
            updateNested={updateNested}
          />
        )}
      </div>

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <TemplateLibraryPanel
          type="building"
          templates={buildingTemplates}
          onLoad={(template) => {
            setBuilding(template.data);
            setShowTemplateLibrary(false);
          }}
          onDelete={deleteTemplate}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}
    </div>
  );
};

/**
 * Basic Info Tab Component
 */
const BasicInfoTab = ({ building, updateBuilding, validationErrors, editorContext }) => {
  const resourceCategories = ResourceCategory.getAllCategories();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Building Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={building.name}
            onChange={(e) => updateBuilding({ name: e.target.value })}
            placeholder="Enter building name..."
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <select
            value={building.category}
            onChange={(e) => updateBuilding({ category: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            {BUILDING_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id} className="bg-gray-800">
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Rarity */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rarity
          </label>
          <select
            value={building.rarity}
            onChange={(e) => updateBuilding({ rarity: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            {RARITY_LEVELS.map(rarity => (
              <option key={rarity.id} value={rarity.id} className="bg-gray-800">
                {rarity.label}
              </option>
            ))}
          </select>
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Icon (Emoji)
          </label>
          <input
            type="text"
            value={building.icon}
            onChange={(e) => updateBuilding({ icon: e.target.value })}
            placeholder="🏢"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Color Theme
          </label>
          <select
            value={building.color}
            onChange={(e) => updateBuilding({ color: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="gray" className="bg-gray-800">Gray</option>
            <option value="red" className="bg-gray-800">Red</option>
            <option value="blue" className="bg-gray-800">Blue</option>
            <option value="green" className="bg-gray-800">Green</option>
            <option value="yellow" className="bg-gray-800">Yellow</option>
            <option value="purple" className="bg-gray-800">Purple</option>
            <option value="orange" className="bg-gray-800">Orange</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <PlaceholderEditor
          value={building.description}
          onChange={(description) => updateBuilding({ description })}
          context={editorContext}
          placeholder="Describe this building type..."
          rows={3}
          showSuggestions={true}
          showPreview={true}
        />
        <p className="text-xs text-gray-400 mt-1">
          Use {'{{placeholders}}'} for dynamic content
        </p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tags
        </label>
        <input
          type="text"
          value={building.tags.join(', ')}
          onChange={(e) => updateBuilding({ 
            tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
          })}
          placeholder="industrial, medieval, magical..."
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
        />
        <p className="text-xs text-gray-400 mt-1">
          Comma-separated tags for organization
        </p>
      </div>
    </div>
  );
};

/**
 * Construction Tab Component
 */
const ConstructionTab = ({ building, updateBuilding, updateNested }) => {
  const [newResource, setNewResource] = useState({ resourceType: '', quantity: 1 });
  const [newPrereqBuilding, setNewPrereqBuilding] = useState('');

  const addConstructionResource = () => {
    if (newResource.resourceType && newResource.quantity > 0) {
      updateNested('constructionCost.resources', [
        ...building.constructionCost.resources,
        { ...newResource, id: Date.now() }
      ]);
      setNewResource({ resourceType: '', quantity: 1 });
    }
  };

  const removeConstructionResource = (id) => {
    updateNested('constructionCost.resources', 
      building.constructionCost.resources.filter(r => r.id !== id)
    );
  };

  const addPrereqBuilding = () => {
    if (newPrereqBuilding && !building.prerequisites.buildings.includes(newPrereqBuilding)) {
      updateNested('prerequisites.buildings', [
        ...building.prerequisites.buildings,
        newPrereqBuilding
      ]);
      setNewPrereqBuilding('');
    }
  };

  const removePrereqBuilding = (buildingType) => {
    updateNested('prerequisites.buildings',
      building.prerequisites.buildings.filter(b => b !== buildingType)
    );
  };

  return (
    <div className="space-y-6">
      {/* Construction Costs */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-white">Construction Costs</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Gold Cost
            </label>
            <input
              type="number"
              min="0"
              value={building.constructionCost.gold}
              onChange={(e) => updateNested('constructionCost.gold', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Construction Time (turns)
            </label>
            <input
              type="number"
              min="1"
              value={building.constructionCost.constructionTime}
              onChange={(e) => updateNested('constructionCost.constructionTime', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
        </div>

        {/* Resource Costs */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Resource Requirements
          </label>
          
          <div className="grid grid-cols-12 gap-2">
            <input
              type="text"
              value={newResource.resourceType}
              onChange={(e) => setNewResource({ ...newResource, resourceType: e.target.value })}
              placeholder="wood, stone, iron..."
              className="col-span-8 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <input
              type="number"
              min="1"
              value={newResource.quantity}
              onChange={(e) => setNewResource({ ...newResource, quantity: parseInt(e.target.value) || 1 })}
              placeholder="Qty"
              className="col-span-2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <button
              onClick={addConstructionResource}
              className="col-span-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {building.constructionCost.resources.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">
                No resource costs
              </div>
            ) : (
              building.constructionCost.resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20"
                >
                  <div className="text-sm">
                    <span className="text-white font-medium">{resource.resourceType}</span>
                    <span className="text-gray-400 ml-2">× {resource.quantity}</span>
                  </div>
                  <button
                    onClick={() => removeConstructionResource(resource.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-white">Prerequisites</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Minimum Settlement Level
            </label>
            <input
              type="number"
              min="0"
              value={building.prerequisites.settlementLevel}
              onChange={(e) => updateNested('prerequisites.settlementLevel', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Minimum Population
            </label>
            <input
              type="number"
              min="0"
              value={building.prerequisites.population}
              onChange={(e) => updateNested('prerequisites.population', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
        </div>

        {/* Required Buildings */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Required Buildings
          </label>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newPrereqBuilding}
              onChange={(e) => setNewPrereqBuilding(e.target.value)}
              placeholder="town-hall, barracks..."
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <button
              onClick={addPrereqBuilding}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {building.prerequisites.buildings.length === 0 ? (
              <p className="text-sm text-gray-400">No building prerequisites</p>
            ) : (
              building.prerequisites.buildings.map((buildingType, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center gap-2"
                >
                  {buildingType}
                  <button
                    onClick={() => removePrereqBuilding(buildingType)}
                    className="hover:text-purple-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Placement */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-300">Placement Rules</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Size (space units)
              </label>
              <input
                type="number"
                min="1"
                value={building.placement.size}
                onChange={(e) => updateNested('placement.size', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={building.placement.exclusive}
                  onChange={(e) => updateNested('placement.exclusive', e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Exclusive (one per settlement)
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Workers Tab Component
 */
const WorkersTab = ({ building, updateNested }) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-md font-medium text-white mb-4">Worker Configuration</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Minimum Workers
            </label>
            <input
              type="number"
              min="0"
              value={building.workerCapacity.min}
              onChange={(e) => updateNested('workerCapacity.min', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">Minimum to operate</p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Optimal Workers
            </label>
            <input
              type="number"
              min="1"
              value={building.workerCapacity.optimal}
              onChange={(e) => updateNested('workerCapacity.optimal', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">Best efficiency</p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Maximum Workers
            </label>
            <input
              type="number"
              min="1"
              value={building.workerCapacity.max}
              onChange={(e) => updateNested('workerCapacity.max', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">Maximum capacity</p>
          </div>
        </div>
      </div>

      {/* Efficiency Curve */}
      <div>
        <h5 className="text-sm font-medium text-gray-300 mb-3">Efficiency Modifiers</h5>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Under-staffed Efficiency
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={building.workerCapacity.efficiency.underStaffed}
              onChange={(e) => updateNested('workerCapacity.efficiency.underStaffed', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              {(building.workerCapacity.efficiency.underStaffed * 100).toFixed(0)}% efficiency
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Optimal Efficiency
            </label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={building.workerCapacity.efficiency.optimal}
              onChange={(e) => updateNested('workerCapacity.efficiency.optimal', parseFloat(e.target.value) || 1.0)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              {(building.workerCapacity.efficiency.optimal * 100).toFixed(0)}% efficiency
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Over-staffed Efficiency
            </label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={building.workerCapacity.efficiency.overStaffed}
              onChange={(e) => updateNested('workerCapacity.efficiency.overStaffed', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              {(building.workerCapacity.efficiency.overStaffed * 100).toFixed(0)}% efficiency
            </p>
          </div>
        </div>
      </div>

      {/* Automation */}
      <div>
        <h5 className="text-sm font-medium text-gray-300 mb-3">Automation Settings</h5>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={building.automation.autoAssignWorkers}
              onChange={(e) => updateNested('automation.autoAssignWorkers', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Auto-assign Workers
          </label>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Priority Score (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={building.automation.priorityScore}
              onChange={(e) => updateNested('automation.priorityScore', parseInt(e.target.value) || 5)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">For AI decision making</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Production Tab Component
 */
const ProductionTab = ({ building, updateNested }) => {
  const [newRecipe, setNewRecipe] = useState('');

  const addRecipe = () => {
    if (newRecipe && !building.production.recipes.includes(newRecipe)) {
      updateNested('production.recipes', [...building.production.recipes, newRecipe]);
      setNewRecipe('');
    }
  };

  const removeRecipe = (recipeId) => {
    updateNested('production.recipes', building.production.recipes.filter(r => r !== recipeId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-md font-medium text-white">Production Configuration</h4>
          <p className="text-sm text-gray-400">Configure this building to produce items</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={building.production.enabled}
            onChange={(e) => updateNested('production.enabled', e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="font-medium">Enable Production</span>
        </label>
      </div>

      {building.production.enabled ? (
        <>
          {/* Production Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Production Bonus (%)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={building.production.productionBonus}
                onChange={(e) => updateNested('production.productionBonus', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Quality Bonus (%)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={building.production.qualityBonus}
                onChange={(e) => updateNested('production.qualityBonus', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Speed Multiplier
              </label>
              <input
                type="number"
                min="0.1"
                max="5"
                step="0.1"
                value={building.production.speedMultiplier}
                onChange={(e) => updateNested('production.speedMultiplier', parseFloat(e.target.value) || 1.0)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Simultaneous Recipes
              </label>
              <input
                type="number"
                min="1"
                value={building.production.simultaneousRecipes}
                onChange={(e) => updateNested('production.simultaneousRecipes', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
              <p className="text-xs text-gray-400 mt-1">Recipes at once</p>
            </div>
          </div>

          {/* Production Recipes */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-300">Production Recipes</h5>
            <p className="text-sm text-gray-400">Recipe IDs this building can produce</p>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newRecipe}
                onChange={(e) => setNewRecipe(e.target.value)}
                placeholder="recipe_id or item_id..."
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
              <button
                onClick={addRecipe}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {building.production.recipes.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No recipes configured
                </div>
              ) : (
                building.production.recipes.map((recipeId, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20"
                  >
                    <span className="text-white text-sm">{recipeId}</span>
                    <button
                      onClick={() => removeRecipe(recipeId)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Service Configuration */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-300">Service Mode</h5>
                <p className="text-sm text-gray-400">Enable service functions instead</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={building.service.enabled}
                  onChange={(e) => updateNested('service.enabled', e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Enable Service
              </label>
            </div>

            {building.service.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Service Type
                  </label>
                  <select
                    value={building.service.type || ''}
                    onChange={(e) => updateNested('service.type', e.target.value || null)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="" className="bg-gray-800">Select type</option>
                    {SERVICE_TYPES.map(type => (
                      <option key={type.id} value={type.id} className="bg-gray-800">
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Service Capacity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={building.service.capacity}
                    onChange={(e) => updateNested('service.capacity', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Served per turn</p>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>Enable production to configure recipes and output</p>
        </div>
      )}
    </div>
  );
};

/**
 * Maintenance Tab Component
 */
const MaintenanceTab = ({ building, updateNested }) => {
  const [newMaintenanceResource, setNewMaintenanceResource] = useState({ 
    resourceType: '', 
    quantity: 1, 
    perTurns: 10 
  });

  const addMaintenanceResource = () => {
    if (newMaintenanceResource.resourceType && newMaintenanceResource.quantity > 0) {
      updateNested('maintenance.resources', [
        ...building.maintenance.resources,
        { ...newMaintenanceResource, id: Date.now() }
      ]);
      setNewMaintenanceResource({ resourceType: '', quantity: 1, perTurns: 10 });
    }
  };

  const removeMaintenanceResource = (id) => {
    updateNested('maintenance.resources',
      building.maintenance.resources.filter(r => r.id !== id)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-md font-medium text-white mb-4">Maintenance Costs</h4>
        <p className="text-sm text-gray-400 mb-4">
          Resources and gold required to maintain this building
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Gold Per Turn
            </label>
            <input
              type="number"
              min="0"
              value={building.maintenance.gold}
              onChange={(e) => updateNested('maintenance.gold', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Worker Hours Per Turn
            </label>
            <input
              type="number"
              min="0"
              value={building.maintenance.workers}
              onChange={(e) => updateNested('maintenance.workers', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* Resource Maintenance */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-300">Resource Maintenance</h5>
        
        <div className="grid grid-cols-12 gap-2">
          <input
            type="text"
            value={newMaintenanceResource.resourceType}
            onChange={(e) => setNewMaintenanceResource({ 
              ...newMaintenanceResource, 
              resourceType: e.target.value 
            })}
            placeholder="wood, stone..."
            className="col-span-6 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          />
          <input
            type="number"
            min="1"
            value={newMaintenanceResource.quantity}
            onChange={(e) => setNewMaintenanceResource({ 
              ...newMaintenanceResource, 
              quantity: parseInt(e.target.value) || 1 
            })}
            placeholder="Qty"
            className="col-span-2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          />
          <input
            type="number"
            min="1"
            value={newMaintenanceResource.perTurns}
            onChange={(e) => setNewMaintenanceResource({ 
              ...newMaintenanceResource, 
              perTurns: parseInt(e.target.value) || 10 
            })}
            placeholder="Turns"
            className="col-span-2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          />
          <button
            onClick={addMaintenanceResource}
            className="col-span-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {building.maintenance.resources.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">
              No resource maintenance costs
            </div>
          ) : (
            building.maintenance.resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20"
              >
                <div className="text-sm">
                  <span className="text-white font-medium">{resource.resourceType}</span>
                  <span className="text-gray-400 ml-2">
                    × {resource.quantity} every {resource.perTurns} turns
                  </span>
                </div>
                <button
                  onClick={() => removeMaintenanceResource(resource.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upgrades */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-300">Upgrade System</h5>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={building.upgrades.enabled}
              onChange={(e) => updateNested('upgrades.enabled', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Enable Upgrades
          </label>

          {building.upgrades.enabled && (
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Maximum Level
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={building.upgrades.maxLevel}
                onChange={(e) => updateNested('upgrades.maxLevel', parseInt(e.target.value) || 5)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Effects Tab Component
 */
const EffectsTab = ({ building, updateNested }) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-md font-medium text-white mb-4">Settlement Effects</h4>
        <p className="text-sm text-gray-400 mb-4">
          How this building affects the settlement
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Population Capacity
            </label>
            <input
              type="number"
              value={building.settlementEffects.populationCapacity}
              onChange={(e) => updateNested('settlementEffects.populationCapacity', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">Additional population capacity</p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Happiness Modifier
            </label>
            <input
              type="number"
              value={building.settlementEffects.happinessModifier}
              onChange={(e) => updateNested('settlementEffects.happinessModifier', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">Happiness change per turn</p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Defense Bonus
            </label>
            <input
              type="number"
              value={building.settlementEffects.defenseBonus}
              onChange={(e) => updateNested('settlementEffects.defenseBonus', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">Defense rating increase</p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Prestige Gain
            </label>
            <input
              type="number"
              value={building.settlementEffects.prestigeGain}
              onChange={(e) => updateNested('settlementEffects.prestigeGain', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">Prestige per turn</p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Culture Generation
            </label>
            <input
              type="number"
              value={building.settlementEffects.cultureGeneration}
              onChange={(e) => updateNested('settlementEffects.cultureGeneration', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">Culture points per turn</p>
          </div>
        </div>
      </div>

      {/* Storage */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h5 className="text-sm font-medium text-gray-300">Storage Capacity</h5>
            <p className="text-sm text-gray-400">Enable resource storage</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={building.storage.enabled}
              onChange={(e) => updateNested('storage.enabled', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Enable Storage
          </label>
        </div>

        {building.storage.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Storage Capacity (units)
              </label>
              <input
                type="number"
                min="0"
                value={building.storage.capacity}
                onChange={(e) => updateNested('storage.capacity', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Preservation Bonus (%)
              </label>
              <input
                type="number"
                min="0"
                value={building.storage.preservationBonus}
                onChange={(e) => updateNested('storage.preservationBonus', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
              <p className="text-xs text-gray-400 mt-1">Reduces spoilage rate</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Advanced Tab Component
 */
const AdvancedTab = ({ building, updateBuilding, updateNested }) => {
  const resourceCategories = ResourceCategory.getAllCategories();

  return (
    <div className="space-y-6">
      {/* Environmental Requirements */}
      <div>
        <h4 className="text-md font-medium text-white mb-4">Environmental Requirements</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={building.environmentalRequirements.nearWater}
              onChange={(e) => updateNested('environmentalRequirements.nearWater', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Requires Water Source
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={building.environmentalRequirements.nearForest}
              onChange={(e) => updateNested('environmentalRequirements.nearForest', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Requires Forest Nearby
          </label>
        </div>

        <div className="mt-3">
          <label className="block text-sm text-gray-300 mb-2">
            Near Resource (optional)
          </label>
          <input
            type="text"
            value={building.environmentalRequirements.nearResource || ''}
            onChange={(e) => updateNested('environmentalRequirements.nearResource', e.target.value || null)}
            placeholder="iron-ore, coal..."
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          />
          <p className="text-xs text-gray-400 mt-1">Specific resource requirement</p>
        </div>
      </div>

      {/* Storage Categories */}
      {building.storage.enabled && (
        <div>
          <h5 className="text-sm font-medium text-gray-300 mb-3">Allowed Storage Categories</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {resourceCategories.map(cat => (
              <label key={cat.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={building.storage.categories.includes(cat.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateNested('storage.categories', [...building.storage.categories, cat.id]);
                    } else {
                      updateNested('storage.categories', building.storage.categories.filter(c => c !== cat.id));
                    }
                  }}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="p-4 bg-white/10 rounded-lg border border-white/20">
        <h5 className="text-sm font-medium text-gray-300 mb-3">Building Summary</h5>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-400">Category:</span>
            <span className="text-white ml-2 font-medium">{building.category}</span>
          </div>
          <div>
            <span className="text-gray-400">Rarity:</span>
            <span className="text-white ml-2 font-medium">{building.rarity}</span>
          </div>
          <div>
            <span className="text-gray-400">Workers:</span>
            <span className="text-white ml-2 font-medium">
              {building.workerCapacity.min}-{building.workerCapacity.max}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Production:</span>
            <span className="text-white ml-2 font-medium">
              {building.production.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export the main component
export default BuildingEditor;

// Export additional components for potential standalone use
export { 
  BasicInfoTab, 
  ConstructionTab, 
  WorkersTab, 
  ProductionTab, 
  MaintenanceTab,
  EffectsTab,
  AdvancedTab 
};
