import React, { useState, useCallback, useMemo } from 'react';
import { Save, Upload, Plus, X, Trash2, BookOpen, TrendingUp } from 'lucide-react';
import useTemplates from '../hooks/useTemplates';
import TemplateLibraryPanel from './TemplateLibraryPanel';
import PlaceholderEditor from './text-templating/PlaceholderEditor';
import EditorContextService from '../../application/services/EditorContextService';
import { useWorldContext } from '../contexts/WorldContext';

// Skill categories
const SKILL_CATEGORIES = [
  { id: 'combat', label: 'Combat', icon: '⚔️', color: 'red' },
  { id: 'crafting', label: 'Crafting', icon: '🔨', color: 'orange' },
  { id: 'social', label: 'Social', icon: '💬', color: 'green' },
  { id: 'knowledge', label: 'Knowledge', icon: '📚', color: 'blue' },
  { id: 'survival', label: 'Survival', icon: '🏕️', color: 'yellow' },
  { id: 'magic', label: 'Magic', icon: '✨', color: 'purple' },
  { id: 'physical', label: 'Physical', icon: '💪', color: 'red' },
  { id: 'technical', label: 'Technical', icon: '🔧', color: 'gray' }
];

// Progression curves
const PROGRESSION_CURVES = [
  { id: 'fast', label: 'Fast', multiplier: 0.8, description: 'Quick progression, easier to master' },
  { id: 'standard', label: 'Standard', multiplier: 1.0, description: 'Balanced progression rate' },
  { id: 'slow', label: 'Slow', multiplier: 1.25, description: 'Slower progression, harder to master' }
];

// Mastery tiers
const MASTERY_TIERS = [
  { id: 'novice', label: 'Novice', level: 0, color: 'gray' },
  { id: 'apprentice', label: 'Apprentice', level: 10, color: 'green' },
  { id: 'journeyman', label: 'Journeyman', level: 30, color: 'blue' },
  { id: 'expert', label: 'Expert', level: 50, color: 'purple' },
  { id: 'master', label: 'Master', level: 75, color: 'orange' },
  { id: 'grandmaster', label: 'Grandmaster', level: 90, color: 'red' }
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
 * SkillEditor - Component for creating and editing skills
 * Follows the pattern from ItemEditor and AbilityEditor
 */
const SkillEditor = ({ 
  initialSkill = null, 
  onChange, 
  onSave, 
  onCancel, 
  mode = 'create',
  currentCharacter = null,
  currentWorld = null
}) => {
  const [skill, setSkill] = useState(() => {
    const baseSkill = initialSkill || {
      name: '',
      description: '',
      category: 'knowledge',
      level: 0,
      experience: 0,
      progressionCurve: 'standard',
      governingAttribute: 'intelligence',
      synergies: [],
      passiveEffects: {},
      abilityUnlocks: {},
      difficultyModifier: 0,
      trainingCost: 10,
      trainingTime: 1,
      requiresTrainer: false,
      trainerRequirements: {},
      icon: '📖',
      flavorText: '',
      tags: [],
      maxLevel: 100
    };

    return {
      ...baseSkill,
      synergies: baseSkill.synergies || [],
      passiveEffects: baseSkill.passiveEffects || {},
      abilityUnlocks: baseSkill.abilityUnlocks || {},
      trainerRequirements: baseSkill.trainerRequirements || {},
      tags: baseSkill.tags || []
    };
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState({});
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);

  // Context detection
  const editorContext = useMemo(() => {
    return EditorContextService.detectContext('skill', {
      skill,
      character: currentCharacter,
      world: currentWorld
    });
  }, [currentCharacter, currentWorld, skill]);

  // Template management
  const {
    templates: skillTemplates,
    saveTemplate,
    loadTemplate,
    deleteTemplate
  } = useTemplates('skill');

  const updateSkill = useCallback((updates) => {
    setSkill(prev => {
      const updated = { ...prev, ...updates };
      if (onChange) onChange(updated);
      return updated;
    });
  }, [onChange]);

  const handleSave = useCallback(() => {
    const errors = validateSkill(skill);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    if (onSave) onSave(skill);
  }, [skill, onSave]);

  const validateSkill = (skillData) => {
    const errors = {};
    if (!skillData.name || skillData.name.trim() === '') {
      errors.name = 'Skill name is required';
    }
    if (skillData.level < 0 || skillData.level > 100) {
      errors.level = 'Level must be between 0 and 100';
    }
    return errors;
  };

  // Calculate mastery tier
  const masteryTier = useMemo(() => {
    const tiers = [...MASTERY_TIERS].reverse();
    return tiers.find(tier => skill.level >= tier.level) || MASTERY_TIERS[0];
  }, [skill.level]);

  // Tab configuration
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'progression', label: 'Progression', icon: '📈' },
    { id: 'passive', label: 'Passive Effects', icon: '✨' },
    { id: 'unlocks', label: 'Ability Unlocks', icon: '🔓' },
    { id: 'training', label: 'Training', icon: '🎓' },
    { id: 'advanced', label: 'Advanced', icon: '🔧' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {mode === 'create' ? 'Create Skill' : 'Edit Skill'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Define character skills and progression systems
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
            Save Skill
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
                  Skill Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => updateSkill({ name: e.target.value })}
                  placeholder="Enter skill name..."
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
                  value={skill.category}
                  onChange={(e) => updateSkill({ category: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  {SKILL_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-gray-800">
                      {cat.icon} {cat.label}
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
                  value={skill.icon}
                  onChange={(e) => updateSkill({ icon: e.target.value })}
                  placeholder="📖"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              {/* Governing Attribute */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Governing Attribute
                </label>
                <select
                  value={skill.governingAttribute}
                  onChange={(e) => updateSkill({ governingAttribute: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  {DND_ATTRIBUTES.map(attr => (
                    <option key={attr.id} value={attr.id} className="bg-gray-800">
                      {attr.label} ({attr.abbr})
                    </option>
                  ))}
                </select>
              </div>

              {/* Progression Curve */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Progression Speed
                </label>
                <select
                  value={skill.progressionCurve}
                  onChange={(e) => updateSkill({ progressionCurve: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  {PROGRESSION_CURVES.map(curve => (
                    <option key={curve.id} value={curve.id} className="bg-gray-800">
                      {curve.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {PROGRESSION_CURVES.find(c => c.id === skill.progressionCurve)?.description}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <PlaceholderEditor
                value={skill.description}
                onChange={(description) => updateSkill({ description })}
                context={editorContext}
                placeholder="Describe the skill..."
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
                value={skill.flavorText}
                onChange={(e) => updateSkill({ flavorText: e.target.value })}
                placeholder="Add atmospheric flavor text..."
                rows={2}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none"
              />
            </div>
          </div>
        )}

        {/* Progression Tab */}
        {activeTab === 'progression' && (
          <div className="space-y-6">
            {/* Current Level and Experience */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Current Progress
                </label>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium bg-${masteryTier.color}-500/20 text-${masteryTier.color}-300`}>
                  {masteryTier.label}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Level</label>
                  <input
                    type="number"
                    min="0"
                    max={skill.maxLevel}
                    value={skill.level}
                    onChange={(e) => updateSkill({ level: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={skill.experience}
                    onChange={(e) => updateSkill({ experience: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>Level {skill.level}</span>
                  <span>Max: {skill.maxLevel}</span>
                </div>
              </div>
            </div>

            {/* Mastery Tiers */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Mastery Tiers</h3>
              <div className="space-y-2">
                {MASTERY_TIERS.map((tier, index) => (
                  <div
                    key={tier.id}
                    className={`
                      p-3 rounded-lg border transition-all
                      ${skill.level >= tier.level
                        ? `bg-${tier.color}-500/20 border-${tier.color}-500/50`
                        : 'bg-white/5 border-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          ${skill.level >= tier.level
                            ? `bg-${tier.color}-500 text-white`
                            : 'bg-white/10 text-gray-400'
                          }
                        `}>
                          {skill.level >= tier.level ? '✓' : index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-white">{tier.label}</div>
                          <div className="text-xs text-gray-400">Level {tier.level}+</div>
                        </div>
                      </div>
                      {skill.level >= tier.level && (
                        <span className="text-green-400 text-sm">Achieved</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty Modifier */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty Modifier
              </label>
              <input
                type="number"
                step="0.1"
                value={skill.difficultyModifier}
                onChange={(e) => updateSkill({ difficultyModifier: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Positive values make checks easier, negative values make them harder
              </p>
            </div>
          </div>
        )}

        {/* Passive Effects Tab */}
        {activeTab === 'passive' && (
          <PassiveEffectsEditor
            passiveEffects={skill.passiveEffects}
            onChange={(passiveEffects) => updateSkill({ passiveEffects })}
            currentLevel={skill.level}
          />
        )}

        {/* Ability Unlocks Tab */}
        {activeTab === 'unlocks' && (
          <AbilityUnlocksEditor
            abilityUnlocks={skill.abilityUnlocks}
            onChange={(abilityUnlocks) => updateSkill({ abilityUnlocks })}
            currentLevel={skill.level}
          />
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Training Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Training Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Training Cost (Gold)
                </label>
                <input
                  type="number"
                  min="0"
                  value={skill.trainingCost}
                  onChange={(e) => updateSkill({ trainingCost: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              {/* Training Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Training Time (Hours)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={skill.trainingTime}
                  onChange={(e) => updateSkill({ trainingTime: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>

            {/* Requires Trainer */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skill.requiresTrainer}
                  onChange={(e) => updateSkill({ requiresTrainer: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Requires a trainer to improve
              </label>
            </div>

            {/* Trainer Requirements */}
            {skill.requiresTrainer && (
              <div className="p-4 bg-white/10 rounded-lg border border-white/20 space-y-3">
                <h4 className="text-sm font-medium text-white">Trainer Requirements</h4>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Minimum Trainer Skill Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={skill.trainerRequirements.minimumLevel || ''}
                    onChange={(e) => updateSkill({
                      trainerRequirements: {
                        ...skill.trainerRequirements,
                        minimumLevel: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })}
                    placeholder="No minimum"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Required Mastery Tier
                  </label>
                  <select
                    value={skill.trainerRequirements.masteryTier || ''}
                    onChange={(e) => updateSkill({
                      trainerRequirements: {
                        ...skill.trainerRequirements,
                        masteryTier: e.target.value || undefined
                      }
                    })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  >
                    <option value="" className="bg-gray-800">Any mastery level</option>
                    {MASTERY_TIERS.map(tier => (
                      <option key={tier.id} value={tier.id} className="bg-gray-800">
                        {tier.label} (Level {tier.level}+)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            {/* Synergies */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Skill Synergies
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Comma-separated list of related skills that provide bonuses
              </p>
              <input
                type="text"
                value={skill.synergies.join(', ')}
                onChange={(e) => updateSkill({ 
                  synergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="smithing, mining, crafting..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={skill.tags.join(', ')}
                onChange={(e) => updateSkill({ 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="combat, mental, physical..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>

            {/* Max Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Maximum Level
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={skill.maxLevel}
                onChange={(e) => updateSkill({ maxLevel: parseInt(e.target.value) || 100 })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <TemplateLibraryPanel
          type="skill"
          templates={skillTemplates}
          onLoad={(template) => {
            setSkill(template.data);
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
 * Passive Effects Editor Component
 */
const PassiveEffectsEditor = ({ passiveEffects, onChange, currentLevel }) => {
  const [newEffect, setNewEffect] = useState({
    level: 0,
    type: 'attribute_bonus',
    target: 'strength',
    value: 1,
    description: ''
  });

  const effectsArray = Object.entries(passiveEffects).map(([level, effects]) => ({
    level: parseInt(level),
    effects: Array.isArray(effects) ? effects : [effects]
  }));

  const handleAdd = () => {
    if (newEffect.level >= 0) {
      const levelKey = newEffect.level.toString();
      const currentEffects = passiveEffects[levelKey] || [];
      
      onChange({
        ...passiveEffects,
        [levelKey]: [...currentEffects, {
          type: newEffect.type,
          target: newEffect.target,
          value: newEffect.value,
          description: newEffect.description
        }]
      });

      setNewEffect({
        level: 0,
        type: 'attribute_bonus',
        target: 'strength',
        value: 1,
        description: ''
      });
    }
  };

  const handleRemove = (level, index) => {
    const levelKey = level.toString();
    const currentEffects = passiveEffects[levelKey] || [];
    const updatedEffects = currentEffects.filter((_, i) => i !== index);
    
    if (updatedEffects.length === 0) {
      const updated = { ...passiveEffects };
      delete updated[levelKey];
      onChange(updated);
    } else {
      onChange({
        ...passiveEffects,
        [levelKey]: updatedEffects
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Passive Effects by Level</h3>
      <p className="text-sm text-gray-400">
        Define bonuses and effects that activate at specific skill levels
      </p>

      {/* Add New Effect */}
      <div className="p-4 bg-white/10 rounded-lg border border-white/20 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Unlock at Level</label>
            <input
              type="number"
              min="0"
              max="100"
              value={newEffect.level}
              onChange={(e) => setNewEffect({ ...newEffect, level: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Effect Type</label>
            <select
              value={newEffect.type}
              onChange={(e) => setNewEffect({ ...newEffect, type: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            >
              <option value="attribute_bonus" className="bg-gray-800">Attribute Bonus</option>
              <option value="damage_bonus" className="bg-gray-800">Damage Bonus</option>
              <option value="armor_bonus" className="bg-gray-800">Armor Bonus</option>
              <option value="resistance" className="bg-gray-800">Resistance</option>
              <option value="special" className="bg-gray-800">Special</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Target/Stat</label>
            <input
              type="text"
              value={newEffect.target}
              onChange={(e) => setNewEffect({ ...newEffect, target: e.target.value })}
              placeholder="strength, fire, etc."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Value</label>
            <input
              type="number"
              value={newEffect.value}
              onChange={(e) => setNewEffect({ ...newEffect, value: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>
          <div className="md:col-span-2">
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
          Add Passive Effect
        </button>
      </div>

      {/* Effects List */}
      <div className="space-y-3">
        {effectsArray.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No passive effects defined yet</p>
          </div>
        ) : (
          effectsArray
            .sort((a, b) => a.level - b.level)
            .map(({ level, effects }) => (
              <div key={level} className="p-4 bg-white/10 rounded-lg border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    currentLevel >= level 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    Level {level}
                  </span>
                  {currentLevel >= level && (
                    <span className="text-xs text-green-400">✓ Unlocked</span>
                  )}
                </div>
                <div className="space-y-2">
                  {effects.map((effect, index) => (
                    <div key={index} className="flex items-start justify-between gap-2 text-sm">
                      <div className="flex-1">
                        <div className="text-white">
                          <span className="font-medium">{effect.type}</span>
                          {' '}→{' '}
                          <span className="text-indigo-300">{effect.target}</span>
                          {' '}+{effect.value}
                        </div>
                        <div className="text-xs text-gray-400">{effect.description}</div>
                      </div>
                      <button
                        onClick={() => handleRemove(level, index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

/**
 * Ability Unlocks Editor Component
 */
const AbilityUnlocksEditor = ({ abilityUnlocks, onChange, currentLevel }) => {
  const [newUnlock, setNewUnlock] = useState({
    level: 0,
    abilityId: '',
    abilityName: ''
  });

  const unlocksArray = Object.entries(abilityUnlocks).map(([level, abilities]) => ({
    level: parseInt(level),
    abilities: Array.isArray(abilities) ? abilities : [abilities]
  }));

  const handleAdd = () => {
    if (newUnlock.level >= 0 && (newUnlock.abilityId || newUnlock.abilityName)) {
      const levelKey = newUnlock.level.toString();
      const currentAbilities = abilityUnlocks[levelKey] || [];
      
      onChange({
        ...abilityUnlocks,
        [levelKey]: [...currentAbilities, {
          id: newUnlock.abilityId || newUnlock.abilityName.toLowerCase().replace(/\s+/g, '_'),
          name: newUnlock.abilityName
        }]
      });

      setNewUnlock({
        level: 0,
        abilityId: '',
        abilityName: ''
      });
    }
  };

  const handleRemove = (level, index) => {
    const levelKey = level.toString();
    const currentAbilities = abilityUnlocks[levelKey] || [];
    const updatedAbilities = currentAbilities.filter((_, i) => i !== index);
    
    if (updatedAbilities.length === 0) {
      const updated = { ...abilityUnlocks };
      delete updated[levelKey];
      onChange(updated);
    } else {
      onChange({
        ...abilityUnlocks,
        [levelKey]: updatedAbilities
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Ability Unlocks</h3>
      <p className="text-sm text-gray-400">
        Define abilities that become available at specific skill levels
      </p>

      {/* Add New Unlock */}
      <div className="p-4 bg-white/10 rounded-lg border border-white/20 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Unlock at Level</label>
            <input
              type="number"
              min="0"
              max="100"
              value={newUnlock.level}
              onChange={(e) => setNewUnlock({ ...newUnlock, level: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Ability ID</label>
            <input
              type="text"
              value={newUnlock.abilityId}
              onChange={(e) => setNewUnlock({ ...newUnlock, abilityId: e.target.value })}
              placeholder="ability_id"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Ability Name</label>
            <input
              type="text"
              value={newUnlock.abilityName}
              onChange={(e) => setNewUnlock({ ...newUnlock, abilityName: e.target.value })}
              placeholder="Power Strike"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Ability Unlock
        </button>
      </div>

      {/* Unlocks List */}
      <div className="space-y-3">
        {unlocksArray.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No ability unlocks defined yet</p>
          </div>
        ) : (
          unlocksArray
            .sort((a, b) => a.level - b.level)
            .map(({ level, abilities }) => (
              <div key={level} className="p-4 bg-white/10 rounded-lg border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    currentLevel >= level 
                      ? 'bg-purple-500/20 text-purple-300' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    Level {level}
                  </span>
                  {currentLevel >= level && (
                    <span className="text-xs text-purple-400">🔓 Unlocked</span>
                  )}
                </div>
                <div className="space-y-2">
                  {abilities.map((ability, index) => (
                    <div key={index} className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex-1">
                        <div className="text-white font-medium">{ability.name}</div>
                        <div className="text-xs text-gray-400">ID: {ability.id}</div>
                      </div>
                      <button
                        onClick={() => handleRemove(level, index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default SkillEditor;
