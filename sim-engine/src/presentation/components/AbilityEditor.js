import React, { useState, useCallback, useMemo } from 'react';
import { Save, Upload, Plus, X, Trash2, Zap, Target } from 'lucide-react';
import useTemplates from '../hooks/useTemplates';
import TemplateLibraryPanel from './TemplateLibraryPanel';
import PlaceholderEditor from './text-templating/PlaceholderEditor';
import EditorContextService from '../../application/services/EditorContextService';
import { useWorldContext } from '../contexts/WorldContext';

// Ability categories
const ABILITY_CATEGORIES = [
  { id: 'combat', label: 'Combat', icon: '⚔️', color: 'red' },
  { id: 'utility', label: 'Utility', icon: '🔧', color: 'blue' },
  { id: 'social', label: 'Social', icon: '💬', color: 'green' },
  { id: 'crafting', label: 'Crafting', icon: '🔨', color: 'yellow' },
  { id: 'magic', label: 'Magic', icon: '✨', color: 'purple' },
  { id: 'special', label: 'Special', icon: '⭐', color: 'orange' }
];

// Ability types
const ABILITY_TYPES = [
  { id: 'active', label: 'Active', description: 'Must be manually activated' },
  { id: 'passive', label: 'Passive', description: 'Always active' },
  { id: 'triggered', label: 'Triggered', description: 'Activates on condition' },
  { id: 'channeled', label: 'Channeled', description: 'Requires concentration' },
  { id: 'ritual', label: 'Ritual', description: 'Takes extended time' }
];

// Activation types
const ACTIVATION_TYPES = [
  { id: 'action', label: 'Action' },
  { id: 'bonus_action', label: 'Bonus Action' },
  { id: 'reaction', label: 'Reaction' },
  { id: 'free', label: 'Free Action' },
  { id: 'passive', label: 'Passive' }
];

// Range types
const RANGE_TYPES = [
  { id: 'self', label: 'Self', distance: 0 },
  { id: 'touch', label: 'Touch', distance: 5 },
  { id: 'ranged', label: 'Ranged', distance: 30 },
  { id: 'sight', label: 'Sight', distance: 120 }
];

// Targeting types
const TARGETING_TYPES = [
  { id: 'self', label: 'Self' },
  { id: 'single', label: 'Single Target' },
  { id: 'multiple', label: 'Multiple Targets' },
  { id: 'area', label: 'Area of Effect' },
  { id: 'line', label: 'Line' },
  { id: 'cone', label: 'Cone' }
];

// Effect types
const EFFECT_TYPES = [
  { id: 'damage', label: 'Damage', icon: '💥' },
  { id: 'healing', label: 'Healing', icon: '💚' },
  { id: 'buff', label: 'Buff', icon: '⬆️' },
  { id: 'debuff', label: 'Debuff', icon: '⬇️' },
  { id: 'summon', label: 'Summon', icon: '👹' },
  { id: 'environmental', label: 'Environmental', icon: '🌪️' },
  { id: 'special', label: 'Special', icon: '✨' }
];

// D&D Attributes
const DND_ATTRIBUTES = [
  { id: 'strength', label: 'Strength', abbr: 'STR' },
  { id: 'dexterity', label: 'Dexterity', abbr: 'DEX' },
  { id: 'constitution', label: 'Constitution', abbr: 'CON' },
  { id: 'intelligence', label: 'Intelligence', abbr: 'INT' },
  { id: 'wisdom', label: 'Wisdom', abbr: 'WIS' },
  { id: 'charisma', label: 'Charisma', abbr: 'CHA' }
];

/**
 * AbilityEditor - Component for creating and editing abilities
 * Follows the pattern from ItemEditor and InteractionEditor
 */
const AbilityEditor = ({ 
  initialAbility = null, 
  onChange, 
  onSave, 
  onCancel, 
  mode = 'create',
  currentCharacter = null,
  currentWorld = null
}) => {
  const [ability, setAbility] = useState(() => {
    const baseAbility = initialAbility || {
      name: '',
      description: '',
      category: 'combat',
      type: 'active',
      school: null,
      rarity: 'common',
      activationType: 'action',
      range: { type: 'self', distance: 0 },
      targeting: 'self',
      areaOfEffect: null,
      costs: {},
      cooldown: 0,
      currentCooldown: 0,
      maxUsesPerDay: null,
      currentUsesToday: 0,
      duration: 'instant',
      concentrationRequired: false,
      effects: [],
      scaling: [],
      requirements: {},
      conditions: {},
      successRate: 1.0,
      criticalChance: 0.05,
      criticalMultiplier: 2.0,
      failureEffects: [],
      criticalEffects: [],
      level: 1,
      maxLevel: 10,
      upgradeEffects: {},
      icon: '⚡',
      flavorText: '',
      tags: [],
      source: 'custom',
      learnMethod: 'automatic',
      trainable: false
    };

    return {
      ...baseAbility,
      effects: baseAbility.effects || [],
      scaling: baseAbility.scaling || [],
      requirements: baseAbility.requirements || {},
      conditions: baseAbility.conditions || {},
      failureEffects: baseAbility.failureEffects || [],
      criticalEffects: baseAbility.criticalEffects || [],
      tags: baseAbility.tags || []
    };
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState({});
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);

  // Context detection
  const editorContext = useMemo(() => {
    return EditorContextService.detectContext('ability', {
      ability,
      character: currentCharacter,
      world: currentWorld
    });
  }, [currentCharacter, currentWorld, ability]);

  // Template management
  const {
    templates: abilityTemplates,
    saveTemplate,
    loadTemplate,
    deleteTemplate
  } = useTemplates('ability');

  const updateAbility = useCallback((updates) => {
    setAbility(prev => {
      const updated = { ...prev, ...updates };
      if (onChange) onChange(updated);
      return updated;
    });
  }, [onChange]);

  const handleSave = useCallback(() => {
    const errors = validateAbility(ability);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    if (onSave) onSave(ability);
  }, [ability, onSave]);

  const validateAbility = (abilityData) => {
    const errors = {};
    if (!abilityData.name || abilityData.name.trim() === '') {
      errors.name = 'Ability name is required';
    }
    if (abilityData.cooldown < 0) {
      errors.cooldown = 'Cooldown cannot be negative';
    }
    return errors;
  };

  // Effect management
  const addEffect = useCallback((effect) => {
    updateAbility({
      effects: [...ability.effects, { ...effect, id: Date.now() }]
    });
  }, [ability.effects, updateAbility]);

  const removeEffect = useCallback((effectId) => {
    updateAbility({
      effects: ability.effects.filter(e => e.id !== effectId)
    });
  }, [ability.effects, updateAbility]);

  // Tab configuration
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'activation', label: 'Activation', icon: '⚡' },
    { id: 'costs', label: 'Costs & Limits', icon: '💰' },
    { id: 'effects', label: 'Effects', icon: '✨' },
    { id: 'requirements', label: 'Requirements', icon: '🔒' },
    { id: 'advanced', label: 'Advanced', icon: '🔧' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {mode === 'create' ? 'Create Ability' : 'Edit Ability'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Define character abilities, spells, and special actions
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
            Save Ability
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ability Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ability.name}
                  onChange={(e) => updateAbility({ name: e.target.value })}
                  placeholder="Enter ability name..."
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
                  value={ability.category}
                  onChange={(e) => updateAbility({ category: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  {ABILITY_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-gray-800">
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ability Type
                </label>
                <select
                  value={ability.type}
                  onChange={(e) => updateAbility({ type: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  {ABILITY_TYPES.map(type => (
                    <option key={type.id} value={type.id} className="bg-gray-800">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Icon
                </label>
                <input
                  type="text"
                  value={ability.icon}
                  onChange={(e) => updateAbility({ icon: e.target.value })}
                  placeholder="⚡"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ability Level
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max={ability.maxLevel}
                    value={ability.level}
                    onChange={(e) => updateAbility({ level: parseInt(e.target.value) || 1 })}
                    className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                  <span className="px-3 py-2 text-gray-400">/ {ability.maxLevel}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <PlaceholderEditor
                value={ability.description}
                onChange={(description) => updateAbility({ description })}
                context={editorContext}
                placeholder="Describe the ability..."
                rows={3}
                showSuggestions={true}
                showPreview={true}
              />
            </div>

            {/* Flavor Text */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Flavor Text
              </label>
              <textarea
                value={ability.flavorText}
                onChange={(e) => updateAbility({ flavorText: e.target.value })}
                placeholder="Add atmospheric flavor text..."
                rows={2}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none"
              />
            </div>
          </div>
        )}

        {/* Activation Tab */}
        {activeTab === 'activation' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Activation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Activation Type
                </label>
                <select
                  value={ability.activationType}
                  onChange={(e) => updateAbility({ activationType: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  {ACTIVATION_TYPES.map(type => (
                    <option key={type.id} value={type.id} className="bg-gray-800">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Range Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Range
                </label>
                <select
                  value={ability.range.type}
                  onChange={(e) => {
                    const selectedRange = RANGE_TYPES.find(r => r.id === e.target.value);
                    updateAbility({ 
                      range: { 
                        type: e.target.value, 
                        distance: selectedRange?.distance || 0 
                      }
                    });
                  }}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  {RANGE_TYPES.map(range => (
                    <option key={range.id} value={range.id} className="bg-gray-800">
                      {range.label} ({range.distance} ft)
                    </option>
                  ))}
                </select>
              </div>

              {/* Targeting */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Targeting
                </label>
                <select
                  value={ability.targeting}
                  onChange={(e) => updateAbility({ targeting: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  {TARGETING_TYPES.map(target => (
                    <option key={target.id} value={target.id} className="bg-gray-800">
                      {target.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={ability.duration}
                  onChange={(e) => updateAbility({ duration: e.target.value })}
                  placeholder="instant, 10 turns, concentration..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>

            {/* Concentration */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ability.concentrationRequired}
                  onChange={(e) => updateAbility({ concentrationRequired: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Requires Concentration
              </label>
            </div>

            {/* Success/Critical */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Success Rate
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ability.successRate}
                  onChange={(e) => updateAbility({ successRate: parseFloat(e.target.value) || 1.0 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Critical Chance
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ability.criticalChance}
                  onChange={(e) => updateAbility({ criticalChance: parseFloat(e.target.value) || 0.05 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Critical Multiplier
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={ability.criticalMultiplier}
                  onChange={(e) => updateAbility({ criticalMultiplier: parseFloat(e.target.value) || 2.0 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Costs & Limits Tab */}
        {activeTab === 'costs' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Resource Costs</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Energy Cost
                </label>
                <input
                  type="number"
                  min="0"
                  value={ability.costs.energy || ''}
                  onChange={(e) => updateAbility({
                    costs: { ...ability.costs, energy: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  placeholder="0"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Health Cost
                </label>
                <input
                  type="number"
                  min="0"
                  value={ability.costs.health || ''}
                  onChange={(e) => updateAbility({
                    costs: { ...ability.costs, health: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  placeholder="0"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mana Cost
                </label>
                <input
                  type="number"
                  min="0"
                  value={ability.costs.mana || ''}
                  onChange={(e) => updateAbility({
                    costs: { ...ability.costs, mana: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  placeholder="0"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mt-6">Usage Limits</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cooldown (turns)
                </label>
                <input
                  type="number"
                  min="0"
                  value={ability.cooldown}
                  onChange={(e) => updateAbility({ cooldown: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Uses Per Day
                </label>
                <input
                  type="number"
                  min="0"
                  value={ability.maxUsesPerDay || ''}
                  onChange={(e) => updateAbility({ 
                    maxUsesPerDay: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  placeholder="Unlimited"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <EffectsEditor
            effects={ability.effects}
            onAdd={addEffect}
            onRemove={removeEffect}
          />
        )}

        {/* Requirements Tab */}
        {activeTab === 'requirements' && (
          <RequirementsEditor
            requirements={ability.requirements}
            onChange={(requirements) => updateAbility({ requirements })}
          />
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={ability.tags.join(', ')}
                onChange={(e) => updateAbility({ 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="spell, fire, offensive..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>

            {/* Source & Learn Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Source
                </label>
                <select
                  value={ability.source}
                  onChange={(e) => updateAbility({ source: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="custom" className="bg-gray-800">Custom</option>
                  <option value="racial" className="bg-gray-800">Racial</option>
                  <option value="class" className="bg-gray-800">Class</option>
                  <option value="item" className="bg-gray-800">Item</option>
                  <option value="quest" className="bg-gray-800">Quest</option>
                  <option value="training" className="bg-gray-800">Training</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Learn Method
                </label>
                <select
                  value={ability.learnMethod}
                  onChange={(e) => updateAbility({ learnMethod: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="automatic" className="bg-gray-800">Automatic</option>
                  <option value="training" className="bg-gray-800">Training</option>
                  <option value="quest" className="bg-gray-800">Quest</option>
                  <option value="item" className="bg-gray-800">Item</option>
                </select>
              </div>
            </div>

            {/* Trainable */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ability.trainable}
                  onChange={(e) => updateAbility({ trainable: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Can be improved through training
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <TemplateLibraryPanel
          type="ability"
          templates={abilityTemplates}
          onLoad={(template) => {
            setAbility(template.data);
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
 * Effects Editor Component
 */
const EffectsEditor = ({ effects, onAdd, onRemove }) => {
  const [newEffect, setNewEffect] = useState({
    type: 'damage',
    target: 'target',
    value: '1d6',
    damageType: 'physical',
    description: ''
  });

  const handleAdd = () => {
    if (newEffect.value) {
      onAdd(newEffect);
      setNewEffect({
        type: 'damage',
        target: 'target',
        value: '1d6',
        damageType: 'physical',
        description: ''
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Ability Effects</h3>
      
      {/* Add New Effect */}
      <div className="p-4 bg-white/10 rounded-lg border border-white/20 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Effect Type</label>
            <select
              value={newEffect.type}
              onChange={(e) => setNewEffect({ ...newEffect, type: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            >
              {EFFECT_TYPES.map(type => (
                <option key={type.id} value={type.id} className="bg-gray-800">
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Value</label>
            <input
              type="text"
              value={newEffect.value}
              onChange={(e) => setNewEffect({ ...newEffect, value: e.target.value })}
              placeholder="1d6, 10, etc."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Target</label>
            <select
              value={newEffect.target}
              onChange={(e) => setNewEffect({ ...newEffect, target: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            >
              <option value="self" className="bg-gray-800">Self</option>
              <option value="target" className="bg-gray-800">Target</option>
              <option value="all" className="bg-gray-800">All</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Description</label>
            <input
              type="text"
              value={newEffect.description}
              onChange={(e) => setNewEffect({ ...newEffect, description: e.target.value })}
              placeholder="Brief description..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Effect
        </button>
      </div>

      {/* Effects List */}
      <div className="space-y-2">
        {effects.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No effects added yet</p>
          </div>
        ) : (
          effects.map(effect => (
            <div
              key={effect.id}
              className="p-3 bg-white/10 rounded-lg border border-white/20 flex items-start justify-between gap-3"
            >
              <div className="flex-1 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs">
                    {effect.type}
                  </span>
                  <span className="text-white font-medium">{effect.value}</span>
                  <span className="text-gray-400">→ {effect.target}</span>
                </div>
                <div className="text-xs text-gray-400">{effect.description}</div>
              </div>
              <button
                onClick={() => onRemove(effect.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Requirements Editor Component
 */
const RequirementsEditor = ({ requirements, onChange }) => {
  const updateRequirement = (key, value) => {
    onChange({
      ...requirements,
      [key]: value
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Ability Requirements</h3>
      
      {/* Level Requirement */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Minimum Level
        </label>
        <input
          type="number"
          min="0"
          value={requirements.level || ''}
          onChange={(e) => updateRequirement('level', e.target.value ? parseInt(e.target.value) : null)}
          placeholder="No level requirement"
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
        />
      </div>

      {/* Attribute Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Attribute Requirements
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DND_ATTRIBUTES.map(attr => (
            <div key={attr.id}>
              <label className="block text-xs text-gray-400 mb-1">{attr.label}</label>
              <input
                type="number"
                min="0"
                max="30"
                value={requirements.attributes?.[attr.id] || ''}
                onChange={(e) => updateRequirement('attributes', {
                  ...(requirements.attributes || {}),
                  [attr.id]: e.target.value ? parseInt(e.target.value) : undefined
                })}
                placeholder="--"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AbilityEditor;
