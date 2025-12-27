import React, { useState, useCallback, useEffect, useMemo } from 'react';
import InteractionAssignmentPanel from './InteractionAssignmentPanel.js';
import InvestmentEditor from './InvestmentEditor.js';
import { validateCharacterForSave } from '../../shared/utils/characterSaveUtils';
import { Users, User, Save, Upload, BookOpen, Swords } from 'lucide-react';
import useTemplates from '../hooks/useTemplates';
import TemplateLibraryPanel from './TemplateLibraryPanel';
import Origin from '../../domain/entities/Origin';
import OriginTemplates from '../../domain/services/OriginTemplates';
import RacialTraits from '../../domain/value-objects/RacialTraits.js';
import EnemyRelationshipManager from './EnemyRelationshipManager.js';
import EntityEditor from './EntityEditor.js';
import Entity from '../../domain/entities/Entity.js';

// Character creation modes
const CHARACTER_CREATION_MODES = {
  TEMPLATE: 'template',    // Quick NPC template creation
  DETAILED: 'detailed',    // Full character creation
  ENTITY: 'entity'         // Entity (hostile NPC/creature) template creation
};

// Character archetypes
const CHARACTER_ARCHETYPES = [
  { id: 'warrior', label: 'Warrior', icon: '⚔️', primaryStats: ['strength', 'constitution'] },
  { id: 'scholar', label: 'Scholar', icon: '📚', primaryStats: ['intelligence', 'wisdom'] },
  { id: 'diplomat', label: 'Diplomat', icon: '🤝', primaryStats: ['charisma', 'wisdom'] },
  { id: 'rogue', label: 'Rogue', icon: '🗡️', primaryStats: ['dexterity', 'intelligence'] },
  { id: 'merchant', label: 'Merchant', icon: '💰', primaryStats: ['charisma', 'intelligence'] },
  { id: 'priest', label: 'Priest', icon: '🙏', primaryStats: ['wisdom', 'charisma'] },
  { id: 'artisan', label: 'Artisan', icon: '🔨', primaryStats: ['dexterity', 'wisdom'] },
  { id: 'noble', label: 'Noble', icon: '👑', primaryStats: ['charisma', 'constitution'] }
];

// Personality trait categories
const PERSONALITY_TRAITS = {
  bigFive: {
    label: 'Big Five Traits',
    traits: [
      { id: 'openness', label: 'Openness', min: 0, max: 1, step: 0.1 },
      { id: 'conscientiousness', label: 'Conscientiousness', min: 0, max: 1, step: 0.1 },
      { id: 'extraversion', label: 'Extraversion', min: 0, max: 1, step: 0.1 },
      { id: 'agreeableness', label: 'Agreeableness', min: 0, max: 1, step: 0.1 },
      { id: 'neuroticism', label: 'Neuroticism', min: 0, max: 1, step: 0.1 }
    ]
  },
  moral: {
    label: 'Moral Traits',
    traits: [
      { id: 'honesty', label: 'Honesty', min: 0, max: 1, step: 0.1 },
      { id: 'compassion', label: 'Compassion', min: 0, max: 1, step: 0.1 },
      { id: 'loyalty', label: 'Loyalty', min: 0, max: 1, step: 0.1 },
      { id: 'justice', label: 'Justice', min: 0, max: 1, step: 0.1 },
      { id: 'courage', label: 'Courage', min: 0, max: 1, step: 0.1 }
    ]
  },
  behavioral: {
    label: 'Behavioral Traits',
    traits: [
      { id: 'ambition', label: 'Ambition', min: 0, max: 1, step: 0.1 },
      { id: 'curiosity', label: 'Curiosity', min: 0, max: 1, step: 0.1 },
      { id: 'impulsiveness', label: 'Impulsiveness', min: 0, max: 1, step: 0.1 },
      { id: 'patience', label: 'Patience', min: 0, max: 1, step: 0.1 },
      { id: 'sociability', label: 'Sociability', min: 0, max: 1, step: 0.1 }
    ]
  }
};

// Skill categories
const SKILL_CATEGORIES = {
  combat: {
    label: 'Combat Skills',
    icon: '⚔️',
    skills: ['Melee Combat', 'Ranged Combat', 'Defense', 'Tactics', 'Dual Wielding']
  },
  social: {
    label: 'Social Skills',
    icon: '💬',
    skills: ['Persuasion', 'Deception', 'Intimidation', 'Leadership', 'Etiquette']
  },
  knowledge: {
    label: 'Knowledge Skills',
    icon: '📖',
    skills: ['History', 'Arcana', 'Religion', 'Nature', 'Medicine']
  },
  craft: {
    label: 'Craft Skills',
    icon: '🔨',
    skills: ['Smithing', 'Alchemy', 'Cooking', 'Tailoring', 'Engineering']
  },
  survival: {
    label: 'Survival Skills',
    icon: '🏕️',
    skills: ['Tracking', 'Foraging', 'Navigation', 'Animal Handling', 'Stealth']
  }
};

// D&D Attributes
const DND_ATTRIBUTES = [
  { id: 'strength', label: 'Strength', abbr: 'STR', description: 'Physical power' },
  { id: 'dexterity', label: 'Dexterity', abbr: 'DEX', description: 'Agility and reflexes' },
  { id: 'constitution', label: 'Constitution', abbr: 'CON', description: 'Endurance and health' },
  { id: 'intelligence', label: 'Intelligence', abbr: 'INT', description: 'Reasoning and memory' },
  { id: 'wisdom', label: 'Wisdom', abbr: 'WIS', description: 'Awareness and insight' },
  { id: 'charisma', label: 'Charisma', abbr: 'CHA', description: 'Force of personality' }
];

// Attribute editor component
const AttributeEditor = ({ attributes, onChange }) => {
  const calculateModifier = (value) => {
    return Math.floor((value - 10) / 2);
  };

  const handleAttributeChange = (attr, value) => {
    const numValue = parseInt(value) || 10;
    const clampedValue = Math.max(1, Math.min(20, numValue));
    onChange({ ...attributes, [attr]: clampedValue });
  };

  const handleRandomize = () => {
    const newAttributes = {};
    DND_ATTRIBUTES.forEach(attr => {
      // 3d6 roll simulation
      const roll = () => Math.floor(Math.random() * 6) + 1;
      newAttributes[attr.id] = roll() + roll() + roll();
    });
    onChange(newAttributes);
  };

  const handleRoll4d6 = () => {
    // Roll 4d6, drop lowest for each attribute (classic D&D method)
    const rollAttribute = () => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    const newAttributes = {};
    DND_ATTRIBUTES.forEach(attr => {
      newAttributes[attr.id] = rollAttribute();
    });
    onChange(newAttributes);
  };

  const handleStandardArray = () => {
    const standardArray = [15, 14, 13, 12, 10, 8];
    const shuffled = [...standardArray].sort(() => Math.random() - 0.5);
    const newAttributes = {};
    DND_ATTRIBUTES.forEach((attr, index) => {
      newAttributes[attr.id] = shuffled[index];
    });
    onChange(newAttributes);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleRoll4d6}
          className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-1"
        >
          <span>🎲</span> Roll 4d6
        </button>
        <button
          onClick={handleRandomize}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Roll 3d6
        </button>
        <button
          onClick={handleStandardArray}
          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          Standard Array
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {DND_ATTRIBUTES.map(attr => (
          <div key={attr.id} className="p-3 bg-white/10 rounded-lg border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-sm text-white">
                {attr.label} ({attr.abbr})
              </label>
              <span className="text-lg font-bold text-blue-400">
                {calculateModifier(attributes[attr.id] || 10) >= 0 ? '+' : ''}
                {calculateModifier(attributes[attr.id] || 10)}
              </span>
            </div>
            <input
              type="number"
              min="1"
              max="20"
              value={attributes[attr.id] || 10}
              onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center"
            />
            <p className="text-xs text-gray-400 mt-1">
              {attr.description}
            </p>
          </div>
        ))}
      </div>

      <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
        <p className="text-sm text-white">
          <strong>Total Points:</strong> {Object.values(attributes).reduce((sum, val) => sum + (val || 10), 0)}
          {' '}(Average: {(Object.values(attributes).reduce((sum, val) => sum + (val || 10), 0) / 6).toFixed(1)})
        </p>
      </div>
    </div>
  );
};

// Personality editor component
const PersonalityEditor = ({ personality, onChange }) => {
  const [activeCategory, setActiveCategory] = useState('bigFive');

  const handleTraitChange = (traitId, value) => {
    onChange({
      ...personality,
      traits: {
        ...personality.traits,
        [traitId]: parseFloat(value)
      }
    });
  };

  const handleRandomizeCategory = () => {
    const newTraits = { ...personality.traits };
    PERSONALITY_TRAITS[activeCategory].traits.forEach(trait => {
      newTraits[trait.id] = Math.round(Math.random() * 10) / 10;
    });
    onChange({ ...personality, traits: newTraits });
  };

  return (
    <div className="space-y-4">
      {/* Category selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {Object.entries(PERSONALITY_TRAITS).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`
                px-3 py-1 rounded-lg text-sm font-medium transition-colors
                ${activeCategory === key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }
              `}
            >
              {category.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleRandomizeCategory}
          className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
        >
          Randomize
        </button>
      </div>

      {/* Trait sliders */}
      <div className="space-y-3">
        {PERSONALITY_TRAITS[activeCategory].traits.map(trait => (
          <div key={trait.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">{trait.label}</label>
              <span className="text-sm font-mono text-gray-300">
                {(personality.traits?.[trait.id] || 0.5).toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={trait.min}
              max={trait.max}
              step={trait.step}
              value={personality.traits?.[trait.id] || 0.5}
              onChange={(e) => handleTraitChange(trait.id, e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        ))}
      </div>

      {/* Core beliefs */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-white mb-2">Core Beliefs</label>
        <textarea
          value={personality.beliefs || ''}
          onChange={(e) => onChange({ ...personality, beliefs: e.target.value })}
          placeholder="What does this character believe in? What drives them?"
          rows={3}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
        />
      </div>

      {/* Fears */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Fears</label>
        <input
          type="text"
          value={personality.fears?.join(', ') || ''}
          onChange={(e) => onChange({ 
            ...personality, 
            fears: e.target.value.split(',').map(f => f.trim()).filter(Boolean)
          })}
          placeholder="List fears separated by commas..."
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
        />
      </div>
    </div>
  );
};

// Skill editor component
const SkillEditor = ({ skills, onChange }) => {
  const [activeCategory, setActiveCategory] = useState('combat');

  const handleSkillLevel = (skillName, level) => {
    const newSkills = { ...skills };
    if (level > 0) {
      newSkills[skillName] = level;
    } else {
      delete newSkills[skillName];
    }
    onChange(newSkills);
  };

  const getSkillLevel = (skillName) => {
    return skills[skillName] || 0;
  };

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`
              px-3 py-2 rounded-lg font-medium whitespace-nowrap
              ${activeCategory === key
                ? 'bg-green-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
              }
            `}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SKILL_CATEGORIES[activeCategory].skills.map(skill => (
          <div key={skill} className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20">
            <span className="font-medium text-sm text-white">{skill}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSkillLevel(skill, Math.max(0, getSkillLevel(skill) - 1))}
                className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                -
              </button>
              <span className="w-8 text-center font-mono text-white">{getSkillLevel(skill)}</span>
              <button
                onClick={() => handleSkillLevel(skill, Math.min(10, getSkillLevel(skill) + 1))}
                className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Skill summary */}
      {Object.keys(skills).length > 0 && (
        <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
          <p className="text-sm font-medium mb-2 text-white">Active Skills:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(skills).map(([skill, level]) => (
              <span key={skill} className="px-2 py-1 bg-green-500/30 rounded text-sm text-white">
                {skill}: {level}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Goals editor component
const GoalEditor = ({ goals = [], onChange }) => {
  const [newGoal, setNewGoal] = useState({
    description: '',
    priority: 'medium',
    type: 'personal'
  });

  const goalTypes = [
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'social', label: 'Social', icon: '👥' },
    { id: 'ideological', label: 'Ideological', icon: '💭' },
    { id: 'survival', label: 'Survival', icon: '🛡️' }
  ];

  const priorities = [
    { id: 'low', label: 'Low', color: 'gray' },
    { id: 'medium', label: 'Medium', color: 'yellow' },
    { id: 'high', label: 'High', color: 'orange' },
    { id: 'critical', label: 'Critical', color: 'red' }
  ];

  const handleAddGoal = () => {
    if (newGoal.description.trim()) {
      onChange([...goals, { ...newGoal, id: Date.now() }]);
      setNewGoal({ description: '', priority: 'medium', type: 'personal' });
    }
  };

  const handleRemoveGoal = (id) => {
    onChange(goals.filter(goal => goal.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Existing goals */}
      {goals.length > 0 && (
        <div className="space-y-2">
          {goals.map(goal => {
            const type = goalTypes.find(t => t.id === goal.type);
            const priority = priorities.find(p => p.id === goal.priority);
            
            return (
              <div
                key={goal.id}
                className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{type?.icon}</span>
                  <div>
                    <p className="font-medium text-white">{goal.description}</p>
                    <p className="text-sm text-gray-400">
                      {type?.label} • Priority: {priority?.label}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveGoal(goal.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new goal */}
      <div className="border-2 border-dashed border-white/20 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">Add Goal</h4>
        
        <div className="space-y-3">
          <textarea
            value={newGoal.description}
            onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
            placeholder="Describe the character's goal..."
            rows={2}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-white mb-1 block">Type</label>
              <select
                value={newGoal.type}
                onChange={(e) => setNewGoal({...newGoal, type: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                {goalTypes.map(type => (
                  <option key={type.id} value={type.id} className="bg-gray-800">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-1 block">Priority</label>
              <select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id} className="bg-gray-800">
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleAddGoal}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Goal
          </button>
        </div>
      </div>
    </div>
  );
};

// Equipment editor component
const EquipmentEditor = ({ equipment, onChange }) => {
  const [newItem, setNewItem] = useState('');
  const [category, setCategory] = useState('general');

  const categories = [
    { id: 'weapons', label: 'Weapons', icon: '⚔️' },
    { id: 'armor', label: 'Armor', icon: '🛡️' },
    { id: 'tools', label: 'Tools', icon: '🔧' },
    { id: 'consumables', label: 'Consumables', icon: '🧪' },
    { id: 'valuables', label: 'Valuables', icon: '💎' },
    { id: 'general', label: 'General', icon: '🎒' }
  ];

  const handleAddItem = () => {
    if (newItem.trim()) {
      const currentCategory = equipment[category] || [];
      onChange({
        ...equipment,
        [category]: [...currentCategory, newItem.trim()]
      });
      setNewItem('');
    }
  };

  const handleRemoveItem = (category, index) => {
    const newEquipment = { ...equipment };
    newEquipment[category] = newEquipment[category].filter((_, i) => i !== index);
    if (newEquipment[category].length === 0) {
      delete newEquipment[category];
    }
    onChange(newEquipment);
  };

  return (
    <div className="space-y-4">
      {/* Add item form */}
      <div className="flex gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id} className="bg-gray-800">
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
          placeholder="Item name..."
          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
        />
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* Equipment by category */}
      <div className="space-y-3">
        {categories.map(cat => {
          const items = equipment[cat.id] || [];
          if (items.length === 0) return null;

          return (
            <div key={cat.id} className="p-3 bg-white/10 rounded-lg border border-white/20">
              <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                <span>{cat.icon}</span>
                {cat.label}
              </h4>
              <div className="flex flex-wrap gap-2">
                {items.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/20 rounded-full text-sm text-white flex items-center gap-2"
                  >
                    {item}
                    <button
                      onClick={() => handleRemoveItem(cat.id, index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// NPC Template Form Components
const ArchetypeSelector = ({ selectedArchetype, onSelect, customArchetypes = [] }) => (
  <div>
    <label className="block text-sm font-medium text-white mb-3">
      Character Archetype <span className="text-red-500">*</span>
    </label>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Built-in Archetypes */}
      {CHARACTER_ARCHETYPES.map(archetype => (
        <button
          key={archetype.id}
          onClick={() => onSelect(archetype.id)}
          className={`
            p-4 rounded-lg border-2 transition-all text-center
            ${selectedArchetype === archetype.id
              ? 'border-blue-500 bg-blue-500/20 shadow-lg'
              : 'border-white/20 hover:border-white/40 bg-white/5'
            }
          `}
        >
          <div className="text-3xl mb-2">{archetype.icon}</div>
          <div className="text-sm font-medium text-white">{archetype.label}</div>
          <div className="text-xs text-gray-400 mt-1">
            {archetype.primaryStats.map(stat => stat.toUpperCase()).join(', ')}
          </div>
          <div className="text-xs text-gray-500 mt-1">Built-in</div>
        </button>
      ))}

      {/* Custom Archetypes */}
      {customArchetypes.map(archetype => (
        <button
          key={archetype.id}
          onClick={() => onSelect(archetype.id)}
          className={`
            p-4 rounded-lg border-2 transition-all text-center
            ${selectedArchetype === archetype.id
              ? 'border-green-500 bg-green-500/20 shadow-lg'
              : 'border-green-500/30 hover:border-green-500/50 bg-green-500/5'
            }
          `}
        >
          <div className="text-3xl mb-2">{archetype.icon}</div>
          <div className="text-sm font-medium text-white">{archetype.label}</div>
          <div className="text-xs text-gray-400 mt-1">
            {archetype.primaryStats?.map(stat => stat.toUpperCase()).join(', ') || 'Custom'}
          </div>
          <div className="text-xs text-green-400 mt-1">Custom</div>
        </button>
      ))}
    </div>
  </div>
);

const NamePattern = ({ pattern, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-white mb-2">
      Name Generation Pattern
    </label>
    <div className="space-y-3">
      <input
        type="text"
        value={pattern.prefix || ''}
        onChange={(e) => onChange({ ...pattern, prefix: e.target.value })}
        placeholder="Name prefix (e.g., 'Sir', 'Lady', 'Captain')"
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <input
        type="text"
        value={pattern.suffix || ''}
        onChange={(e) => onChange({ ...pattern, suffix: e.target.value })}
        placeholder="Name suffix (e.g., 'the Bold', 'of Westmarch')"
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <div className="text-xs text-gray-400">
        Generated names will follow the pattern: [Prefix] [Random Name] [Suffix]
      </div>
    </div>
  </div>
);

const AttributeRange = ({ ranges, onChange }) => {
  const handleRollRanges = () => {
    // Roll 4d6 drop lowest for each attribute, then create ranges around those values
    const rollAttribute = () => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    const newRanges = {};
    DND_ATTRIBUTES.forEach(attr => {
      const baseValue = rollAttribute();
      newRanges[attr.id] = {
        min: Math.max(3, baseValue - 2),
        max: Math.min(18, baseValue + 2)
      };
    });
    onChange(newRanges);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-white">
          Attribute Ranges
        </label>
        <button
          onClick={handleRollRanges}
          className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-1"
        >
          <span>🎲</span> Roll Base Ranges
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {DND_ATTRIBUTES.map(attr => (
          <div key={attr.id} className="p-3 bg-white/10 rounded-lg border border-white/20">
            <div className="text-sm font-medium text-white mb-2">
              {attr.label} ({attr.abbr})
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="3"
                max="18"
                value={ranges[attr.id]?.min || 8}
                onChange={(e) => onChange({
                  ...ranges,
                  [attr.id]: {
                    ...ranges[attr.id],
                    min: parseInt(e.target.value) || 8
                  }
                })}
                className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-center text-sm"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                min="3"
                max="18"
                value={ranges[attr.id]?.max || 15}
                onChange={(e) => onChange({
                  ...ranges,
                  [attr.id]: {
                    ...ranges[attr.id],
                    max: parseInt(e.target.value) || 15
                  }
                })}
                className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-center text-sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PersonalitySliders = ({ personality, onChange }) => {
  const essentialTraits = [
    { id: 'aggression', label: 'Aggression', description: 'How confrontational' },
    { id: 'curiosity', label: 'Curiosity', description: 'How exploratory' },
    { id: 'empathy', label: 'Empathy', description: 'How caring' },
    { id: 'ambition', label: 'Ambition', description: 'How driven' },
    { id: 'sociability', label: 'Sociability', description: 'How social' }
  ];

  // Ensure personality and traits are initialized
  const safePersonality = personality || { traits: {}, beliefs: '', fears: [] };
  const safeTraits = safePersonality.traits || {};

  return (
    <div>
      <label className="block text-sm font-medium text-white mb-3">
        Core Personality Traits
      </label>
      <div className="space-y-3">
        {essentialTraits.map(trait => (
          <div key={trait.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-white">{trait.label}</span>
                <span className="text-xs text-gray-400 ml-2">{trait.description}</span>
              </div>
              <span className="text-sm font-mono text-gray-300">
                {(safeTraits[trait.id] || 0.5).toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={safeTraits[trait.id] || 0.5}
              onChange={(e) => onChange({
                ...safePersonality,
                traits: {
                  ...safeTraits,
                  [trait.id]: parseFloat(e.target.value)
                }
              })}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const VariationSettings = ({ variation, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-white mb-3">
      NPC Variation Settings
    </label>
    <div className="space-y-4 p-4 bg-white/10 rounded-lg border border-white/20">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white">Attribute Variation</span>
          <span className="text-sm font-mono text-gray-300">±{variation.attributes || 2}</span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={variation.attributes || 2}
          onChange={(e) => onChange({ ...variation, attributes: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="text-xs text-gray-400 mt-1">
          How much attributes can vary from template ranges
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white">Personality Variation</span>
          <span className="text-sm font-mono text-gray-300">±{((variation.personality || 0.2) * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="0.5"
          step="0.1"
          value={variation.personality || 0.2}
          onChange={(e) => onChange({ ...variation, personality: parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="text-xs text-gray-400 mt-1">
          How much personality traits can vary from template
        </div>
      </div>
    </div>
  </div>
);

const BulkGenerationOptions = ({ bulkOptions, onChange, onPreview, onGenerate }) => (
  <div className="border-2 border-dashed border-blue-500/30 rounded-lg p-4">
    <h4 className="font-medium text-white mb-4 flex items-center gap-2">
      <Users className="w-4 h-4" />
      Bulk NPC Generation
    </h4>
    
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-300">Number to Generate</label>
          <input
            type="number"
            min="1"
            max="50"
            value={bulkOptions.count || 5}
            onChange={(e) => onChange({ ...bulkOptions, count: parseInt(e.target.value) || 5 })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          />
        </div>
        
        <div>
          <label className="text-sm text-gray-300">Distribution Strategy</label>
          <select
            value={bulkOptions.distribution || 'random'}
            onChange={(e) => onChange({ ...bulkOptions, distribution: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="random" className="bg-gray-800">Random Distribution</option>
            <option value="even" className="bg-gray-800">Even Distribution</option>
            <option value="weighted" className="bg-gray-800">Population Weighted</option>
          </select>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onPreview}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
        >
          👁️ Preview NPCs
        </button>
        <button
          onClick={onGenerate}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
        >
          🚀 Generate & Place
        </button>
      </div>
    </div>
  </div>
);

const NPCTemplateForm = ({ 
  characterData, 
  onChange, 
  onPreview, 
  onBulkGenerate,
  errors = {},
  customArchetypes = [],
  onCreateArchetype
}) => {
  const [showCreateArchetype, setShowCreateArchetype] = useState(false);
  const [showArchetypeSelector, setShowArchetypeSelector] = useState(false);
  const [newArchetype, setNewArchetype] = useState({
    id: '',
    name: '',
    label: '',
    icon: '👤',
    description: '',
    primaryStats: [],
    tags: []
  });
  
  const handleArchetypeSelect = (archetypeId) => {
    const archetype = CHARACTER_ARCHETYPES.find(a => a.id === archetypeId) || customArchetypes.find(a => a.id === archetypeId);
    if (archetype) {
      // Set attribute ranges based on archetype
      const newRanges = {};
      DND_ATTRIBUTES.forEach(attr => {
        if (archetype.primaryStats.includes(attr.id)) {
          newRanges[attr.id] = { min: 12, max: 16 };
        } else {
          newRanges[attr.id] = { min: 8, max: 14 };
        }
      });
      
      onChange({
        ...characterData,
        archetype: archetypeId,
        templateSettings: {
          ...characterData.templateSettings,
          attributeRanges: newRanges
        }
      });
    }
    setShowArchetypeSelector(false);
  };

  const handleStatToggle = (stat) => {
    const currentStats = newArchetype.primaryStats || [];
    if (currentStats.includes(stat)) {
      setNewArchetype({
        ...newArchetype,
        primaryStats: currentStats.filter(s => s !== stat)
      });
    } else {
      setNewArchetype({
        ...newArchetype,
        primaryStats: [...currentStats, stat]
      });
    }
  };

  const handleCreateArchetype = async () => {
    if (!newArchetype.name || !newArchetype.label) {
      alert('Name and label are required');
      return;
    }

    try {
      await onCreateArchetype({
        ...newArchetype,
        id: newArchetype.id || `archetype_${Date.now()}`
      });
      setShowCreateArchetype(false);
      setNewArchetype({
        id: '',
        name: '',
        label: '',
        icon: '👤',
        description: '',
        primaryStats: [],
        tags: []
      });
    } catch (error) {
      console.error('Failed to create archetype:', error);
      alert(`Failed to create archetype: ${error.message}`);
    }
  };

  // Get current archetype info
  const currentArchetype = CHARACTER_ARCHETYPES.find(a => a.id === characterData.archetype) || 
                          customArchetypes.find(a => a.id === characterData.archetype);

  return (
    <div className="space-y-6">
      {/* Quick Setup */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Character Archetype <span className="text-red-500">*</span>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowArchetypeSelector(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
          >
            <span>🎯</span> Select Archetype
          </button>
          <button
            onClick={() => setShowCreateArchetype(true)}
            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
          >
            <span>+</span> Create Custom
          </button>
        </div>
      </div>
      
      {/* Current Archetype Display or Example */}
      {currentArchetype ? (
        <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30 mb-4">
          <div className="flex items-start gap-4">
            <div className="text-3xl">{currentArchetype.icon}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">{currentArchetype.label}</h3>
              <p className="text-gray-300 mb-3">
                {currentArchetype.description || 'A character archetype that defines fundamental traits and tendencies.'}
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-blue-500/30 text-blue-300 rounded text-sm">
                  Primary: {currentArchetype.primaryStats?.map(stat => stat.toUpperCase()).join(', ') || 'Custom'}
                </span>
                {currentArchetype.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-white/10 text-gray-300 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => onChange({...characterData, archetype: ''})}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}

      {/* Comprehensive Archetype Description - Always Visible */}
      <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🏛️</div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">Character Archetypes: Building Your World's Characters</h3>
            <p className="text-gray-300 mb-4">
              Archetypes define the fundamental roles, personalities, and capabilities of characters in your world. 
              They serve as templates that influence everything from attribute priorities to behavioral tendencies, 
              helping create consistent and believable characters across your simulation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="font-medium text-white mb-3">Classic Fantasy Archetypes</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚔️</span>
                    <span className="text-sm text-gray-300"><strong>Warrior</strong> - Strength & Constitution focused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📚</span>
                    <span className="text-sm text-gray-300"><strong>Scholar</strong> - Intelligence & Wisdom focused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤝</span>
                    <span className="text-sm text-gray-300"><strong>Diplomat</strong> - Charisma & Wisdom focused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🗡️</span>
                    <span className="text-sm text-gray-300"><strong>Rogue</strong> - Dexterity & Intelligence focused</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-white mb-3">Professional & Social Roles</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <span className="text-sm text-gray-300"><strong>Merchant</strong> - Charisma & Intelligence focused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🙏</span>
                    <span className="text-sm text-gray-300"><strong>Priest</strong> - Wisdom & Charisma focused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔨</span>
                    <span className="text-sm text-gray-300"><strong>Artisan</strong> - Dexterity & Wisdom focused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👑</span>
                    <span className="text-sm text-gray-300"><strong>Noble</strong> - Charisma & Constitution focused</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-white mb-2">Custom Archetypes You Can Create</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="font-medium text-blue-300 mb-1">Historical Figures</div>
                  <div className="text-gray-400">Philosophers, inventors, explorers, revolutionaries</div>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="font-medium text-green-300 mb-1">Fantasy Classes</div>
                  <div className="text-gray-400">Mages, rangers, paladins, necromancers</div>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="font-medium text-purple-300 mb-1">Modern Roles</div>
                  <div className="text-gray-400">Scientists, politicians, artists, entrepreneurs</div>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="font-medium text-orange-300 mb-1">Cultural Archetypes</div>
                  <div className="text-gray-400">Shamans, elders, warriors, healers</div>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="font-medium text-red-300 mb-1">Antagonists</div>
                  <div className="text-gray-400">Tyrants, thieves, cultists, warlords</div>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="font-medium text-cyan-300 mb-1">Specialized Roles</div>
                  <div className="text-gray-400">Spies, assassins, diplomats, merchants</div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              <p className="mb-2">
                <strong>What archetypes control:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Attribute Ranges:</strong> Minimum and maximum values for each D&D attribute</li>
                <li><strong>Personality Baseline:</strong> Core traits like bravery, curiosity, empathy</li>
                <li><strong>Behavioral Tendencies:</strong> How characters typically respond to situations</li>
                <li><strong>Social Roles:</strong> Expected behaviors in society and relationships</li>
                <li><strong>Skill Priorities:</strong> Which abilities the character naturally excels at</li>
                <li><strong>Cultural Context:</strong> How the archetype fits into your world's societies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {errors.archetype && (
        <p className="text-red-500 text-sm">{errors.archetype}</p>
      )}

      {/* Archetype Selector Modal */}
      {showArchetypeSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-white/20 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Select Character Archetype</h3>
                <button
                  onClick={() => setShowArchetypeSelector(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <ArchetypeSelector
                selectedArchetype={characterData.archetype}
                onSelect={handleArchetypeSelect}
                customArchetypes={customArchetypes}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Archetype Modal */}
      {showCreateArchetype && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-6 pt-12">
          <div className="bg-gray-900 rounded-lg border border-white/20 w-full max-w-4xl h-[70vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/20 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold text-white">Create Custom Archetype</h3>
              <button
                onClick={() => setShowCreateArchetype(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newArchetype.name}
                      onChange={(e) => setNewArchetype({...newArchetype, name: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="Archetype name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newArchetype.label}
                      onChange={(e) => setNewArchetype({...newArchetype, label: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="Display label"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={newArchetype.icon}
                    onChange={(e) => setNewArchetype({...newArchetype, icon: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center text-xl"
                    placeholder="👤"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={newArchetype.description}
                    onChange={(e) => setNewArchetype({...newArchetype, description: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                    placeholder="Describe this archetype..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Primary Stats
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DND_ATTRIBUTES.map(attr => (
                      <button
                        key={attr.id}
                        onClick={() => handleStatToggle(attr.id)}
                        className={`p-2 rounded-lg border text-sm transition-colors ${
                          newArchetype.primaryStats?.includes(attr.id)
                            ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                            : 'border-white/20 hover:border-white/40 text-gray-300'
                        }`}
                      >
                        {attr.abbr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/20 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowCreateArchetype(false)}
                className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateArchetype}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Archetype
              </button>
            </div>
          </div>
        </div>
      )}

      <NamePattern
        pattern={characterData.templateSettings?.namePattern || {}}
        onChange={(pattern) => onChange({
          ...characterData,
          templateSettings: {
            ...characterData.templateSettings,
            namePattern: pattern
          }
        })}
      />

      <AttributeRange
        ranges={characterData.templateSettings?.attributeRanges || {}}
        onChange={(ranges) => onChange({
          ...characterData,
          templateSettings: {
            ...characterData.templateSettings,
            attributeRanges: ranges
          }
        })}
      />

      <PersonalitySliders
        personality={characterData.personality}
        onChange={(personality) => onChange({ ...characterData, personality })}
      />

      {/* Goals Section */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Character Goals
        </label>
        <p className="text-sm text-gray-400 mb-4">
          Define the goals and motivations that will drive this NPC's behavior during simulation
        </p>
        <GoalEditor
          goals={characterData.goals}
          onChange={(goals) => onChange({ ...characterData, goals })}
        />
      </div>

      <VariationSettings
        variation={characterData.templateSettings?.variation || {}}
        onChange={(variation) => onChange({
          ...characterData,
          templateSettings: {
            ...characterData.templateSettings,
            variation
          }
        })}
      />

      {/* Bulk Creation */}
      <BulkGenerationOptions
        bulkOptions={characterData.templateSettings?.bulkOptions || {}}
        onChange={(bulkOptions) => onChange({
          ...characterData,
          templateSettings: {
            ...characterData.templateSettings,
            bulkOptions
          }
        })}
        onPreview={onPreview}
        onGenerate={onBulkGenerate}
      />
    </div>
  );
};

// Interaction template assignment panel
const InteractionTemplateAssignmentPanel = ({ 
  character, 
  assignedInteractionTemplates, 
  onAssignTemplate, 
  onUnassignTemplate 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Get available interaction templates from the template system
  const availableTemplates = useMemo(() => {
    // This would typically come from a hook or context that provides interaction templates
    // For now, we'll use a placeholder that would be replaced with actual template data
    return [
      {
        id: 'template_combat_basic',
        name: 'Basic Combat',
        description: 'Standard combat interactions including attacks and defenses',
        category: 'combat',
        tags: ['combat', 'physical', 'aggressive']
      },
      {
        id: 'template_social_greeting',
        name: 'Social Greeting',
        description: 'Basic social interactions for introductions and greetings',
        category: 'social',
        tags: ['social', 'communication', 'friendly']
      },
      {
        id: 'template_trade_merchant',
        name: 'Merchant Trading',
        description: 'Trading interactions for merchants and shopkeepers',
        category: 'economic',
        tags: ['trade', 'economic', 'negotiation']
      },
      {
        id: 'template_quest_giver',
        name: 'Quest Giver',
        description: 'Interactions for NPCs who give quests to players',
        category: 'quest',
        tags: ['quest', 'narrative', 'guidance']
      }
    ];
  }, []);

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    return availableTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [availableTemplates, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(availableTemplates.map(t => t.category))];
    return cats;
  }, [availableTemplates]);

  return (
    <div className="space-y-4">
      {/* Assigned Templates */}
      {assignedInteractionTemplates.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-white">Assigned Interaction Templates</h4>
          {assignedInteractionTemplates.map(templateId => {
            const template = availableTemplates.find(t => t.id === templateId);
            return (
              <div
                key={templateId}
                className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg border border-blue-500/30"
              >
                <div>
                  <p className="font-medium text-white">{template?.name || templateId}</p>
                  <p className="text-sm text-gray-400">
                    {template?.description || 'Template description'}
                  </p>
                  {template?.tags && (
                    <div className="flex gap-1 mt-1">
                      {template.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onUnassignTemplate(templateId)}
                  className="text-red-400 hover:text-red-300 px-3 py-1 rounded hover:bg-red-500/20"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Template Browser */}
      <div className="border-2 border-dashed border-white/20 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">Available Interaction Templates</h4>
        
        {/* Search and Filter */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800">
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Template List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredTemplates.map(template => {
            const isAssigned = assignedInteractionTemplates.includes(template.id);
            return (
              <div
                key={template.id}
                className={`
                  p-3 rounded-lg border transition-all
                  ${isAssigned 
                    ? 'bg-green-500/20 border-green-500/30' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-white">{template.name}</h5>
                      <span className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded">
                        {template.category}
                      </span>
                      {isAssigned && (
                        <span className="px-2 py-1 bg-green-500/20 text-xs text-green-400 rounded border border-green-500/30">
                          Assigned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                    <div className="flex gap-1 flex-wrap">
                      {template.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => isAssigned ? onUnassignTemplate(template.id) : onAssignTemplate(template.id)}
                    className={`
                      px-3 py-1 rounded text-sm font-medium transition-colors
                      ${isAssigned
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                      }
                    `}
                  >
                    {isAssigned ? 'Remove' : 'Assign'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No interaction templates found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

// Relationships template editor
const RelationshipTemplateEditor = ({ relationshipTemplates, onChange }) => {
  const [newTemplate, setNewTemplate] = useState({
    type: '',
    minValue: -50,
    maxValue: 50,
    tags: []
  });

  const relationshipTypes = [
    'family', 'friend', 'rival', 'mentor', 'student', 
    'employer', 'employee', 'romantic', 'enemy', 'ally'
  ];

  const handleAddTemplate = () => {
    if (newTemplate.type) {
      onChange([...relationshipTemplates, { ...newTemplate, id: Date.now() }]);
      setNewTemplate({ type: '', minValue: -50, maxValue: 50, tags: [] });
    }
  };

  const handleRemoveTemplate = (id) => {
    onChange(relationshipTemplates.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Existing templates */}
      {relationshipTemplates.length > 0 && (
        <div className="space-y-2">
          {relationshipTemplates.map(template => (
            <div
              key={template.id}
              className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20"
            >
              <div>
                <p className="font-medium text-white">{template.type}</p>
                <p className="text-sm text-gray-400">
                  Range: {template.minValue} to {template.maxValue}
                  {template.tags.length > 0 && ` • Tags: ${template.tags.join(', ')}`}
                </p>
              </div>
              <button
                onClick={() => handleRemoveTemplate(template.id)}
                className="text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new template */}
      <div className="border-2 border-dashed border-white/20 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">Add Relationship Template</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <select
              value={newTemplate.type}
              onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="" className="bg-gray-800">Select type...</option>
              {relationshipTypes.map(type => (
                <option key={type} value={type} className="bg-gray-800">{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-400">Min Value</label>
            <input
              type="number"
              value={newTemplate.minValue}
              onChange={(e) => setNewTemplate({...newTemplate, minValue: parseInt(e.target.value) || -100})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400">Max Value</label>
            <input
              type="number"
              value={newTemplate.maxValue}
              onChange={(e) => setNewTemplate({...newTemplate, maxValue: parseInt(e.target.value) || 100})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div className="col-span-2">
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={newTemplate.tags.join(', ')}
              onChange={(e) => setNewTemplate({
                ...newTemplate,
                tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
            />
          </div>
        </div>

        <button
          onClick={handleAddTemplate}
          className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Relationship Template
        </button>
      </div>
    </div>
  );
};

// Archetype Manager Component
const ArchetypeManager = ({
  archetypes,
  onCreateArchetype,
  onEditArchetype,
  onDeleteArchetype,
  onSaveArchetype,
  onLoadArchetype
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingArchetype, setEditingArchetype] = useState(null);
  const [newArchetype, setNewArchetype] = useState({
    id: '',
    name: '',
    label: '',
    icon: '👤',
    description: '',
    primaryStats: [],
    tags: []
  });

  const handleCreateNew = () => {
    setNewArchetype({
      id: `archetype_${Date.now()}`,
      name: '',
      label: '',
      icon: '👤',
      description: '',
      primaryStats: [],
      tags: []
    });
    setEditingArchetype(null);
    setShowCreateForm(true);
  };

  const handleEdit = (archetype) => {
    setNewArchetype({ ...archetype });
    setEditingArchetype(archetype);
    setShowCreateForm(true);
  };

  const handleSave = async () => {
    if (!newArchetype.name || !newArchetype.label) {
      alert('Name and label are required');
      return;
    }

    try {
      if (editingArchetype) {
        await onEditArchetype(newArchetype);
      } else {
        await onCreateArchetype(newArchetype);
      }
      setShowCreateForm(false);
      setNewArchetype({
        id: '',
        name: '',
        label: '',
        icon: '👤',
        description: '',
        primaryStats: [],
        tags: []
      });
    } catch (error) {
      alert(`Failed to save archetype: ${error.message}`);
    }
  };

  const handleDelete = async (archetype) => {
    // Remove confirmation dialog to avoid ESLint error
    try {
      await onDeleteArchetype(archetype.id);
    } catch (error) {
      alert(`Failed to delete archetype: ${error.message}`);
    }
  };

  const handleStatToggle = (stat) => {
    const currentStats = newArchetype.primaryStats || [];
    if (currentStats.includes(stat)) {
      setNewArchetype({
        ...newArchetype,
        primaryStats: currentStats.filter(s => s !== stat)
      });
    } else {
      setNewArchetype({
        ...newArchetype,
        primaryStats: [...currentStats, stat]
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-2">
            Create and manage custom character archetypes that can be used in character creation
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span>
          Create Archetype
        </button>
      </div>

      {/* Example Archetype with Description */}
      <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🏛️</div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">Character Archetypes: Building Your World's Characters</h3>
            <p className="text-gray-300 mb-4">
              Archetypes define the fundamental roles, personalities, and capabilities of characters in your world. 
              They serve as templates that influence everything from attribute priorities to behavioral tendencies, 
              helping create consistent and believable characters across your simulation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="font-medium text-white mb-3">Classic Fantasy Archetypes</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚔️</span>
                    <span className="text-sm text-gray-300"><strong>Warrior</strong> - Strength & Constitution focused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📚</span>
                    <span className="text-sm text-gray-300"><strong>Scholar</strong> - Intelligence & Wisdom focused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤝</span>
                    <span className="text-sm text-gray-300"><strong>Diplomat</strong> - Charisma & Wisdom focused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🗡️</span>
                    <span className="text-sm text-gray-300"><strong>Rogue</strong> - Dexterity & Intelligence focused</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-white mb-3">Professional & Social Roles</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <span className="text-sm text-gray-300"><strong>Merchant</strong> - Charisma & Intelligence focused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🙏</span>
                    <span className="text-sm text-gray-300"><strong>Priest</strong> - Wisdom & Charisma focused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔨</span>
                    <span className="text-sm text-gray-300"><strong>Artisan</strong> - Dexterity & Wisdom focused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👑</span>
                    <span className="text-sm text-gray-300"><strong>Noble</strong> - Charisma & Constitution focused</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-white mb-2">Custom Archetypes You Can Create</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="font-medium text-blue-300 mb-1">Historical Figures</div>
                  <div className="text-gray-400">Philosophers, inventors, explorers, revolutionaries</div>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="font-medium text-green-300 mb-1">Fantasy Classes</div>
                  <div className="text-gray-400">Mages, rangers, paladins, necromancers</div>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="font-medium text-purple-300 mb-1">Modern Roles</div>
                  <div className="text-gray-400">Scientists, politicians, artists, entrepreneurs</div>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="font-medium text-orange-300 mb-1">Cultural Archetypes</div>
                  <div className="text-gray-400">Shamans, elders, warriors, healers</div>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="font-medium text-red-300 mb-1">Antagonists</div>
                  <div className="text-gray-400">Tyrants, thieves, cultists, warlords</div>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="font-medium text-cyan-300 mb-1">Specialized Roles</div>
                  <div className="text-gray-400">Spies, assassins, diplomats, merchants</div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              <p className="mb-2">
                <strong>What archetypes control:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Attribute Ranges:</strong> Minimum and maximum values for each D&D attribute</li>
                <li><strong>Personality Baseline:</strong> Core traits like bravery, curiosity, empathy</li>
                <li><strong>Behavioral Tendencies:</strong> How characters typically respond to situations</li>
                <li><strong>Social Roles:</strong> Expected behaviors in society and relationships</li>
                <li><strong>Skill Priorities:</strong> Which abilities the character naturally excels at</li>
                <li><strong>Cultural Context:</strong> How the archetype fits into your world's societies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Archetypes List - Only show if there are any */}
      {archetypes.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-white">Your Custom Archetypes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {archetypes.map(archetype => (
              <div
                key={archetype.id}
                className="p-4 bg-white/10 rounded-lg border border-white/20"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{archetype.icon}</span>
                    <div>
                      <h4 className="font-medium text-white">{archetype.label}</h4>
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                        Custom
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(archetype)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(archetype)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  {archetype.description || 'No description'}
                </p>
                {archetype.primaryStats && archetype.primaryStats.length > 0 && (
                  <p className="text-sm text-gray-400">
                    Primary: {archetype.primaryStats.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-6 pt-12">
          <div className="bg-gray-900 rounded-lg border border-white/20 w-full max-w-4xl h-[70vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/20 flex items-center justify-between flex-shrink-0">
              <h3 className="text-xl font-semibold text-white">
                {editingArchetype ? 'Edit Archetype' : 'Create New Archetype'}
              </h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newArchetype.id}
                      onChange={(e) => setNewArchetype({...newArchetype, id: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="archetype_id"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Icon
                    </label>
                    <input
                      type="text"
                      value={newArchetype.icon}
                      onChange={(e) => setNewArchetype({...newArchetype, icon: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center text-xl"
                      placeholder="👤"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newArchetype.name}
                      onChange={(e) => setNewArchetype({...newArchetype, name: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="Archetype name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newArchetype.label}
                      onChange={(e) => setNewArchetype({...newArchetype, label: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="Display label"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={newArchetype.description}
                    onChange={(e) => setNewArchetype({...newArchetype, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                    placeholder="Describe this archetype..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Primary Stats
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {DND_ATTRIBUTES.map(attr => (
                      <button
                        key={attr.id}
                        onClick={() => handleStatToggle(attr.id)}
                        className={`p-2 rounded-lg border text-sm transition-colors ${
                          newArchetype.primaryStats?.includes(attr.id)
                            ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                            : 'border-white/20 hover:border-white/40 text-gray-300'
                        }`}
                      >
                        {attr.abbr}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={newArchetype.tags?.join(', ') || ''}
                    onChange={(e) => setNewArchetype({
                      ...newArchetype,
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/20 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingArchetype ? 'Update Archetype' : 'Create Archetype'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * CharacterEditor - A comprehensive character template editor component
 * 
 * This component follows clean architecture principles:
 * - Pure presentation layer - no domain logic
 * - Uses callbacks to communicate with parent components
 * - Maintains internal state for form management
 * - Validates user input before submission
 * 
 * @param {Object} initialCharacter - Existing character data for editing (optional)
 * @param {Function} onSave - Callback when character is saved (required)
 * @param {Function} onCancel - Callback when editing is cancelled (optional)
 * @param {string} mode - 'create' or 'edit' mode (default: 'create')
 */
const CharacterEditor = ({ 
  initialCharacter = null, 
  onSave,
  onCancel,
  mode = 'create', // 'create' or 'edit'
  availableInteractions = [], // Available interactions from world
  onCreateInteraction = null, // Callback to create new interactions
  onEditInteraction = null, // Callback to edit interactions
  onBulkGenerate = null, // Callback for bulk generation
  onCreateTemplate = null, // Callback for template creation
  isTemplate = false, // Whether this is a template
  templateMode = false // Whether we're in template creation/editing mode
}) => {
  // Form state
  const [characterData, setCharacterData] = useState({
    id: initialCharacter?.id || (mode === 'create' ? '' : `character_${Date.now()}`),
    name: initialCharacter?.name || '',
    description: initialCharacter?.description || '',
    archetype: initialCharacter?.archetype || 'warrior',
    raceId: initialCharacter?.raceId || 'human',
    subraceId: initialCharacter?.subraceId || null,
    attributes: initialCharacter?.attributes || {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    personality: initialCharacter?.personality || {
      traits: {},
      beliefs: '',
      fears: []
    },
    consciousness: initialCharacter?.consciousness || {
      baseFrequency: 40,
      coherence: 0.7,
      awareness: 0.5
    },
    skills: initialCharacter?.skills || {},
    goals: initialCharacter?.goals || [],
    assignedInteractions: initialCharacter?.assignedInteractions || [],
    assignedInteractionTemplates: initialCharacter?.assignedInteractionTemplates || [], // New field for interaction templates
    equipment: initialCharacter?.equipment || {},
    relationshipTemplates: initialCharacter?.relationshipTemplates || [],
    background: initialCharacter?.background || '',
    appearance: initialCharacter?.appearance || '',
    tags: initialCharacter?.tags || [],
    metadata: initialCharacter?.metadata || {},
    // Template-specific settings
    templateSettings: initialCharacter?.templateSettings || {
      namePattern: { prefix: '', suffix: '' },
      attributeRanges: {},
      variation: { attributes: 2, personality: 0.2 },
      bulkOptions: { count: 5, distribution: 'random' }
    }
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [creationMode, setCreationMode] = useState(CHARACTER_CREATION_MODES.TEMPLATE);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showArchetypeSelector, setShowArchetypeSelector] = useState(false);
  const [showCreateArchetype, setShowCreateArchetype] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [originApplied, setOriginApplied] = useState(false);
  const [customOrigins, setCustomOrigins] = useState([]);
  const [newArchetype, setNewArchetype] = useState({
    id: '',
    name: '',
    label: '',
    icon: '👤',
    description: '',
    primaryStats: [],
    tags: []
  });
  
  const { templates, saveTemplate, loadTemplate, deleteTemplate } = useTemplates();

  // Load custom origins from localStorage
  useEffect(() => {
    const loadCustomOrigins = () => {
      const saved = localStorage.getItem('customOrigins');
      if (saved) {
        try {
          const origins = JSON.parse(saved).map(o => Origin.fromJSON(o));
          setCustomOrigins(origins);
        } catch (error) {
          console.error('Failed to load custom origins:', error);
        }
      }
    };
    
    // Load on mount
    loadCustomOrigins();
    
    // Reload when window gains focus (user returns from Origin Builder)
    window.addEventListener('focus', loadCustomOrigins);
    
    return () => {
      window.removeEventListener('focus', loadCustomOrigins);
    };
  }, []);

  // Event listeners for archetype modals
  useEffect(() => {
    const handleOpenArchetypeSelector = () => setShowArchetypeSelector(true);
    const handleOpenCreateArchetype = () => setShowCreateArchetype(true);

    window.addEventListener('openArchetypeSelector', handleOpenArchetypeSelector);
    window.addEventListener('openCreateArchetype', handleOpenCreateArchetype);

    return () => {
      window.removeEventListener('openArchetypeSelector', handleOpenArchetypeSelector);
      window.removeEventListener('openCreateArchetype', handleOpenCreateArchetype);
    };
  }, []);

  // Sync character data when initialCharacter prop changes (for editing)
  useEffect(() => {
    if (initialCharacter) {
      setCharacterData({
        id: initialCharacter.id || (mode === 'create' ? '' : `character_${Date.now()}`),
        name: initialCharacter.name || '',
        description: initialCharacter.description || '',
        archetype: initialCharacter.archetype || 'warrior',
        attributes: initialCharacter.attributes || {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10
        },
        personality: initialCharacter.personality || {
          traits: {},
          beliefs: '',
          fears: []
        },
        consciousness: initialCharacter.consciousness || {
          baseFrequency: 40,
          coherence: 0.7,
          awareness: 0.5
        },
        skills: initialCharacter.skills || {},
        goals: initialCharacter.goals || [],
        assignedInteractions: initialCharacter.assignedInteractions || [],
        assignedInteractionTemplates: initialCharacter.assignedInteractionTemplates || [], // New field for interaction templates
        equipment: initialCharacter.equipment || {},
        relationshipTemplates: initialCharacter.relationshipTemplates || [],
        background: initialCharacter.background || '',
        appearance: initialCharacter.appearance || '',
        tags: initialCharacter.tags || [],
        metadata: initialCharacter.metadata || {},
        templateSettings: initialCharacter.templateSettings || {
          namePattern: { prefix: '', suffix: '' },
          attributeRanges: {},
          variation: { attributes: 2, personality: 0.2 },
          bulkOptions: { count: 5, distribution: 'random' }
        }
      });
      // Clear any previous errors
      setErrors({});
    }
  }, [initialCharacter, mode]);

  // Validation using unified utility with mode-specific requirements
  const validateCharacter = useCallback(() => {
    const validationResult = validateCharacterForSave(characterData);
    
    // Defensive check for validation result
    if (!validationResult || typeof validationResult !== 'object') {
      console.error('Invalid validation result:', validationResult);
      setErrors({ general: 'Validation failed - please check character data' });
      return false;
    }
    
    // Convert validation errors to component error format
    const newErrors = {};
    const errors = validationResult.errors || [];
    errors.forEach(error => {
      const fieldPath = error.field.split('.');
      if (fieldPath.length === 1) {
        newErrors[fieldPath[0]] = error.message;
      } else {
        // Handle nested fields like attributes.strength
        if (!newErrors[fieldPath[0]]) {
          newErrors[fieldPath[0]] = {};
        }
        newErrors[fieldPath[0]][fieldPath[1]] = error.message;
      }
    });
    
    // Mode-specific validation
    if (creationMode === CHARACTER_CREATION_MODES.TEMPLATE) {
      // Template mode: Only require essential fields
      if (!characterData.archetype) {
        newErrors.archetype = 'Please select a character archetype';
      }
      if (!characterData.name && !characterData.templateSettings?.namePattern?.prefix) {
        newErrors.name = 'Template name or name pattern is required';
      }
      // Remove validation for optional fields in template mode
      delete newErrors.skills;
      delete newErrors.equipment;
      delete newErrors.relationshipTemplates;
      delete newErrors.goals; // Goals are optional for templates
    } else {
      // Detailed mode: More comprehensive validation
      if (characterData.goals && characterData.goals.length === 0) {
        newErrors.goals = 'At least one goal is required';
      }
      if (Object.keys(characterData.skills).length === 0) {
        newErrors.skills = 'At least one skill should be defined';
      }
    }

    // ID validation for create mode
    if (mode === 'create' && !characterData.id?.trim()) {
      newErrors.id = 'Character ID is required';
    }
    
    setErrors(newErrors);
    return validationResult.isValid && Object.keys(newErrors).length === 0;
  }, [characterData, creationMode, mode]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateCharacter()) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Auto-generate ID if empty in create mode
      const finalCharacterData = {
        ...characterData,
        id: characterData.id?.trim() || `character_${Date.now()}`
      };

      // Check if we're creating a template or regular character
      if (mode === 'create' && creationMode === CHARACTER_CREATION_MODES.TEMPLATE) {
        // Call template creation handler
        if (onCreateTemplate) {
          await onCreateTemplate(finalCharacterData);
          setSaveSuccess(true);
          
          // Clear success message after 3 seconds
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } else {
        // Call regular save handler
        if (onSave) {
          await onSave(finalCharacterData);
          setSaveSuccess(true);
          
          // Clear success message after 3 seconds
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      }
    } catch (error) {
      console.error('Save failed:', error);
      setSaveError(error.message || 'Failed to save character');
      
      // Clear error message after 5 seconds
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [characterData, mode, creationMode, onSave, onCreateTemplate, validateCharacter]);

  // Handle archetype selection
  const handleArchetypeSelect = (archetypeId) => {
    const archetype = CHARACTER_ARCHETYPES.find(a => a.id === archetypeId);
    if (archetype) {
      // Boost primary stats for the archetype
      const newAttributes = { ...characterData.attributes };
      archetype.primaryStats.forEach(stat => {
        newAttributes[stat] = Math.min(18, newAttributes[stat] + 2);
      });
      
      setCharacterData({
        ...characterData,
        archetype: archetypeId,
        attributes: newAttributes
      });
    }
  };

  // Handle interaction assignment
  const handleAssignInteraction = useCallback((characterId, interactionId) => {
    if (!characterData.assignedInteractions.includes(interactionId)) {
      setCharacterData({
        ...characterData,
        assignedInteractions: [...characterData.assignedInteractions, interactionId]
      });
    }
  }, [characterData]);

  // Handle interaction unassignment
  const handleUnassignInteraction = useCallback((characterId, interactionId) => {
    setCharacterData({
      ...characterData,
      assignedInteractions: characterData.assignedInteractions.filter(id => id !== interactionId)
    });
  }, [characterData]);

  // Template functions
  const handleSaveAsTemplate = useCallback(async () => {
    if (!validateCharacter()) {
      return;
    }

    const templateName = prompt('Enter template name:', `${characterData.name} Template`);
    if (!templateName) return;

    const templateDescription = prompt('Enter template description (optional):', 
      `Template based on ${characterData.name}`);

    try {
      const templateData = {
        ...characterData,
        name: templateName,
        description: templateDescription || `Template based on ${characterData.name}`,
        metadata: {
          ...characterData.metadata,
          isTemplate: true,
          originalCharacterId: characterData.id,
          category: characterData.archetype || 'general',
          difficulty: 'intermediate',
          author: 'User',
          version: '1.0.0'
        }
      };

      await saveTemplate('characters', templateData);
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert(`Failed to save template: ${error.message}`);
    }
  }, [characterData, validateCharacter, saveTemplate]);

  const handleLoadFromTemplate = useCallback((template) => {
    try {
      const instance = loadTemplate('characters', template.id, {
        name: `${template.name} Instance`,
        id: `character_${Date.now()}`
      });

      setCharacterData(instance);
      setShowTemplateLibrary(false);
    } catch (error) {
      console.error('Failed to load template:', error);
      alert(`Failed to load template: ${error.message}`);
    }
  }, [loadTemplate]);

  // Get assigned interaction objects
  const getAssignedInteractions = useCallback(() => {
    return characterData.assignedInteractions
      .map(id => availableInteractions.find(interaction => interaction.id === id))
      .filter(Boolean);
  }, [characterData.assignedInteractions, availableInteractions]);

  // Archetype management handlers
  const handleCreateArchetype = useCallback(async (archetypeData) => {
    try {
      await saveTemplate('archetypes', archetypeData);
      console.log('Archetype created successfully');
    } catch (error) {
      console.error('Failed to create archetype:', error);
      throw error;
    }
  }, [saveTemplate]);

  const handleEditArchetype = useCallback(async (archetypeData) => {
    try {
      await saveTemplate('archetypes', archetypeData);
      console.log('Archetype updated successfully');
    } catch (error) {
      console.error('Failed to update archetype:', error);
      throw error;
    }
  }, [saveTemplate]);

  const handleDeleteArchetype = useCallback(async (archetypeId) => {
    try {
      await deleteTemplate('archetypes', archetypeId);
      console.log('Archetype deleted successfully');
    } catch (error) {
      console.error('Failed to delete archetype:', error);
      throw error;
    }
  }, [deleteTemplate]);

  const handleSaveArchetype = useCallback(async (archetypeData) => {
    try {
      await saveTemplate('archetypes', archetypeData);
      console.log('Archetype saved successfully');
    } catch (error) {
      console.error('Failed to save archetype:', error);
      throw error;
    }
  }, [saveTemplate]);

  const handleLoadArchetype = useCallback((archetypeId) => {
    try {
      const archetype = loadTemplate('archetypes', archetypeId);
      console.log('Archetype loaded:', archetype);
      return archetype;
    } catch (error) {
      console.error('Failed to load archetype:', error);
      throw error;
    }
  }, [loadTemplate]);

  // Template mode handlers
  const handlePreviewNPCs = useCallback(() => {
    // Generate sample NPCs based on template
    const sampleNPCs = [];
    const count = Math.min(characterData.templateSettings?.bulkOptions?.count || 3, 3);
    
    for (let i = 0; i < count; i++) {
      const npc = generateNPCFromTemplate(characterData, i);
      sampleNPCs.push(npc);
    }
    
    // Show preview modal or update state
    console.log('Preview NPCs:', sampleNPCs);
    // TODO: Implement preview modal
  }, [characterData]);

  const handleBulkGenerate = useCallback(async () => {
    if (onBulkGenerate) {
      try {
        await onBulkGenerate(characterData);
        console.log('Bulk generation completed successfully');
      } catch (error) {
        console.error('Bulk generation failed:', error);
      }
    } else {
      // Fallback - Generate and place NPCs in world locally
      const count = characterData.templateSettings?.bulkOptions?.count || 5;
      const distribution = characterData.templateSettings?.bulkOptions?.distribution || 'random';
      
      console.log(`Generating ${count} NPCs with ${distribution} distribution`);
      // TODO: Implement local bulk generation logic if needed
    }
  }, [characterData, onBulkGenerate]);

  // Helper function to generate NPC from template
  const generateNPCFromTemplate = (template, index) => {
    const variation = template.templateSettings?.variation || {};
    const attributeRanges = template.templateSettings?.attributeRanges || {};
    const namePattern = template.templateSettings?.namePattern || {};
    
    // Generate varied attributes
    const attributes = {};
    DND_ATTRIBUTES.forEach(attr => {
      const range = attributeRanges[attr.id] || { min: 8, max: 15 };
      const baseValue = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      const variationAmount = variation.attributes || 2;
      const finalValue = Math.max(3, Math.min(18, 
        baseValue + Math.floor(Math.random() * (variationAmount * 2 + 1)) - variationAmount
      ));
      attributes[attr.id] = finalValue;
    });

    // Generate varied personality
    const personality = { traits: {} };
    Object.entries(template.personality.traits || {}).forEach(([trait, value]) => {
      const variationAmount = variation.personality || 0.2;
      const finalValue = Math.max(0, Math.min(1,
        value + (Math.random() * (variationAmount * 2) - variationAmount)
      ));
      personality.traits[trait] = parseFloat(finalValue.toFixed(1));
    });

    // Generate name
    const randomNames = ['Aiden', 'Bella', 'Connor', 'Diana', 'Ethan', 'Fiona', 'Gabriel', 'Hannah'];
    const baseName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const fullName = [
      namePattern.prefix,
      baseName,
      namePattern.suffix
    ].filter(Boolean).join(' ');

    return {
      id: `${template.id}_generated_${index}`,
      name: fullName || `${template.name} ${index + 1}`,
      description: `Generated from ${template.name} template`,
      archetype: template.archetype,
      attributes,
      personality,
      consciousness: { ...template.consciousness },
      goals: [...template.goals],
      assignedInteractions: [...template.assignedInteractions]
    };
  };

  // Tabs configuration based on creation mode
  const getTabsForMode = () => {
    if (creationMode === CHARACTER_CREATION_MODES.TEMPLATE) {
      // Simplified tabs for quick NPC template creation
      return [
        { id: 'basic', label: 'Basic Info', icon: '📝' },
        { id: 'attributes', label: 'Attributes', icon: '💪' },
        { id: 'personality', label: 'Personality', icon: '🧠' },
        { id: 'goals', label: 'Goals', icon: '🎯' },
        { id: 'interactions', label: 'Interactions', icon: '⚡' }
      ];
    } else {
      // Full tabs for detailed character creation
      return [
        { id: 'basic', label: 'Basic Info', icon: '📝' },
        { id: 'origin', label: 'Origin', icon: '📖' },
        { id: 'attributes', label: 'Attributes', icon: '💪' },
        { id: 'personality', label: 'Personality', icon: '🧠' },
        { id: 'skills', label: 'Skills', icon: '⭐' },
        { id: 'goals', label: 'Goals', icon: '🎯' },
        { id: 'interactions', label: 'Interactions', icon: '⚡' },
        { id: 'interaction-templates', label: 'Interaction Templates', icon: '📋' },
        { id: 'investments', label: 'Investments', icon: '💰' },
        { id: 'equipment', label: 'Equipment', icon: '🎒' },
        { id: 'relationships', label: 'Relationships', icon: '🤝' },
        { id: 'enemies', label: 'Enemies', icon: '⚔️' },
        { id: 'archetypes', label: 'Archetypes', icon: '🏷️' },
        { id: 'advanced', label: 'Advanced', icon: '⚙️' }
      ];
    }
  };

  const tabs = getTabsForMode();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          {mode === 'create' ? 'Create Character Template' : 'Edit Character Template'}
        </h2>
        <p className="text-gray-400 mt-1">
          Define templates for NPC generation in your world
        </p>
      </div>

      {/* Creation Mode Selector */}
      <div className="flex gap-2 mb-6 p-1 bg-white/10 rounded-lg border border-white/20 w-fit flex-wrap">
        <button
          onClick={() => {
            setCreationMode(CHARACTER_CREATION_MODES.TEMPLATE);
            // Reset to basic tab when switching modes
            setActiveTab('basic');
          }}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${creationMode === CHARACTER_CREATION_MODES.TEMPLATE
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
            }
          `}
        >
          <Users className="w-4 h-4" />
          NPC Template Mode
        </button>
        <button
          onClick={() => {
            setCreationMode(CHARACTER_CREATION_MODES.DETAILED);
            // Reset to basic tab when switching modes
            setActiveTab('basic');
          }}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${creationMode === CHARACTER_CREATION_MODES.DETAILED
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
            }
          `}
        >
          <User className="w-4 h-4" />
          Detailed Character Mode
        </button>
        <button
          onClick={() => {
            setCreationMode(CHARACTER_CREATION_MODES.ENTITY);
            // Reset to basic tab when switching modes
            setActiveTab('basic');
          }}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${creationMode === CHARACTER_CREATION_MODES.ENTITY
              ? 'bg-red-600 text-white shadow-lg'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
            }
          `}
        >
          <Swords className="w-4 h-4" />
          Entity Template Mode
        </button>
      </div>

      {/* Mode Description */}
      <div className="mb-6 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
        <p className="text-blue-200 text-sm">
          {creationMode === CHARACTER_CREATION_MODES.TEMPLATE
            ? '🚀 Quick mode for creating NPC templates with essential attributes, personality, and goals. Perfect for rapid world population.'
            : creationMode === CHARACTER_CREATION_MODES.ENTITY
            ? '⚔️ Create hostile NPCs and creatures (orcs, bandits, guards, wolves) with combat stats, loot tables, and territorial behavior.'
            : '🔧 Comprehensive mode with full character customization including skills, equipment, relationships, and advanced settings.'
          }
        </p>
      </div>

      {/* Tabs - Only show in Detailed Mode */}
      {creationMode === CHARACTER_CREATION_MODES.DETAILED && (
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
      )}

      {/* Tab content */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        {/* Template Mode - Simplified Form */}
        {creationMode === CHARACTER_CREATION_MODES.TEMPLATE && (
          <NPCTemplateForm
            characterData={characterData}
            onChange={setCharacterData}
            onPreview={handlePreviewNPCs}
            onBulkGenerate={handleBulkGenerate}
            errors={errors}
            customArchetypes={templates.archetypes || []}
          />
        )}

        {/* Entity Template Mode - EntityEditor */}
        {creationMode === CHARACTER_CREATION_MODES.ENTITY && (
          <EntityEditor
            initialEntity={initialCharacter instanceof Entity ? initialCharacter : null}
            onSave={(entity) => {
              // Save entity template
              const templates = JSON.parse(localStorage.getItem('entity_templates') || '[]');
              const entityData = entity.toJSON ? entity.toJSON() : entity;
              entityData.isTemplate = true;
              entityData.metadata = {
                ...entityData.metadata,
                isTemplate: true,
                created: new Date().toISOString()
              };
              
              const existingIndex = templates.findIndex(t => t.id === entityData.id);
              if (existingIndex >= 0) {
                templates[existingIndex] = entityData;
              } else {
                templates.push(entityData);
              }
              
              localStorage.setItem('entity_templates', JSON.stringify(templates));
              
              // Call the onSave callback if provided
              if (onSave) {
                onSave(entity);
              }
            }}
            onCancel={onCancel}
            mode={initialCharacter && initialCharacter instanceof Entity ? 'edit' : 'create'}
            availableNodes={availableInteractions}
            availableGroups={[]}
          />
        )}

        {/* Detailed Mode - Full Tabs */}
        {creationMode === CHARACTER_CREATION_MODES.DETAILED && (
          <>
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Character ID {mode === 'create' && <span className="text-red-500">*</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={characterData.id}
                  onChange={(e) => setCharacterData({...characterData, id: e.target.value})}
                  disabled={mode === 'edit'}
                  className={`flex-1 px-4 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400
                    ${mode === 'edit' ? 'text-gray-400' : ''}
                    ${errors.id ? 'border-red-500' : 'border-white/20'}
                  `}
                  placeholder={mode === 'create' ? "Enter custom ID or leave empty for auto-generation..." : ""}
                />
                {mode === 'create' && (
                  <button
                    onClick={() => setCharacterData({...characterData, id: `character_${Date.now()}`})}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm whitespace-nowrap"
                    title="Auto-generate ID"
                  >
                    🎲 Generate
                  </button>
                )}
              </div>
              {errors.id && (
                <p className="text-red-500 text-sm mt-1">{errors.id}</p>
              )}
              {mode === 'create' && (
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty to auto-generate a unique ID, or enter a custom ID.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={characterData.name}
                onChange={(e) => setCharacterData({...characterData, name: e.target.value})}
                className={`
                  w-full px-4 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400
                  ${errors.name ? 'border-red-500' : 'border-white/20'}
                `}
                placeholder="Enter character template name..."
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
                value={characterData.description}
                onChange={(e) => setCharacterData({...characterData, description: e.target.value})}
                rows={4}
                className={`
                  w-full px-4 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400
                  ${errors.description ? 'border-red-500' : 'border-white/20'}
                `}
                placeholder="Describe this character template..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Race Selection */}
            <div className="space-y-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🧬</span>
                <h3 className="text-lg font-semibold text-white">Race & Heritage</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Race Selector */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Race <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={characterData.raceId || 'human'}
                    onChange={(e) => {
                      const newRaceId = e.target.value;
                      const subraces = RacialTraits.getSubraces(newRaceId);
                      setCharacterData({
                        ...characterData,
                        raceId: newRaceId,
                        subraceId: subraces.length > 0 ? subraces[0].name : null
                      });
                    }}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  >
                    {RacialTraits.getAllRaces().map(race => (
                      <option key={race.id} value={race.id} className="bg-gray-800">
                        {race.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subrace Selector */}
                {characterData.raceId && RacialTraits.getSubraces(characterData.raceId).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Subrace
                    </label>
                    <select
                      value={characterData.subraceId || ''}
                      onChange={(e) => setCharacterData({...characterData, subraceId: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    >
                      {RacialTraits.getSubraces(characterData.raceId).map(subrace => (
                        <option key={subrace.name} value={subrace.name} className="bg-gray-800">
                          {subrace.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Racial Bonuses Preview */}
              {characterData.raceId && (() => {
                const racialTraits = new RacialTraits(characterData.raceId, characterData.subraceId);
                const attributeMods = racialTraits.getAttributeModifiers();
                const skillMods = racialTraits.getSkillModifiers();
                const features = racialTraits.getFeatures();
                const race = racialTraits.race;
                
                return (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-sm font-semibold text-purple-300 mb-3">Racial Traits & Bonuses</h4>
                    
                    {/* Description */}
                    {race.description && (
                      <p className="text-xs text-gray-300 mb-3">{race.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Attribute Modifiers */}
                      {attributeMods.size > 0 && (
                        <div>
                          <div className="text-xs font-medium text-blue-300 mb-2">Attribute Bonuses</div>
                          <div className="space-y-1">
                            {Array.from(attributeMods.entries()).map(([attr, value]) => (
                              <div key={attr} className="flex items-center justify-between text-xs">
                                <span className="text-gray-300 capitalize">{attr}</span>
                                <span className={`font-mono ${value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {value > 0 ? '+' : ''}{value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skill Modifiers */}
                      {skillMods.size > 0 && (
                        <div>
                          <div className="text-xs font-medium text-green-300 mb-2">Skill Bonuses</div>
                          <div className="space-y-1">
                            {Array.from(skillMods.entries()).map(([skill, value]) => (
                              <div key={skill} className="flex items-center justify-between text-xs">
                                <span className="text-gray-300 capitalize">{skill}</span>
                                <span className={`font-mono ${value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {value > 0 ? '+' : ''}{value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Racial Features */}
                      {features.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-yellow-300 mb-2">Special Features</div>
                          <div className="space-y-1">
                            {features.map((feature, idx) => (
                              <div key={idx} className="text-xs text-gray-300">
                                • {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lifespan Info */}
                    {racialTraits.getLifespan() && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="text-xs text-gray-400">
                          <span className="font-medium text-gray-300">Lifespan:</span>{' '}
                          Average {racialTraits.getLifespan().average} years
                          {racialTraits.getLifespan().maximum && (
                            <span> (max {racialTraits.getLifespan().maximum})</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Archetype
              </label>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">
                    Select an archetype to define your character's fundamental traits and tendencies
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Use the existing archetype selector modal
                      const event = new CustomEvent('openArchetypeSelector');
                      window.dispatchEvent(event);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
                  >
                    <span>🎯</span> Select Archetype
                  </button>
                  <button
                    onClick={() => {
                      // Use the existing create archetype modal
                      const event = new CustomEvent('openCreateArchetype');
                      window.dispatchEvent(event);
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
                  >
                    <span>+</span> Create Custom
                  </button>
                </div>
              </div>
              
              {/* Current Archetype Display */}
              {characterData.archetype && (
                <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">
                      {CHARACTER_ARCHETYPES.find(a => a.id === characterData.archetype)?.icon || 
                       templates.archetypes?.find(a => a.id === characterData.archetype)?.icon || '👤'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {CHARACTER_ARCHETYPES.find(a => a.id === characterData.archetype)?.label || 
                         templates.archetypes?.find(a => a.id === characterData.archetype)?.label || 'Custom Archetype'}
                      </h3>
                      <p className="text-gray-300 mb-3">
                        {CHARACTER_ARCHETYPES.find(a => a.id === characterData.archetype)?.description || 
                         templates.archetypes?.find(a => a.id === characterData.archetype)?.description || 
                         'A character archetype that defines fundamental traits and tendencies.'}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-blue-500/30 text-blue-300 rounded text-sm">
                          Primary: {(CHARACTER_ARCHETYPES.find(a => a.id === characterData.archetype)?.primaryStats || 
                                   templates.archetypes?.find(a => a.id === characterData.archetype)?.primaryStats || [])
                                   .map(stat => stat.toUpperCase()).join(', ') || 'Custom'}
                        </span>
                        {(CHARACTER_ARCHETYPES.find(a => a.id === characterData.archetype)?.tags || 
                          templates.archetypes?.find(a => a.id === characterData.archetype)?.tags || [])
                          .map(tag => (
                          <span key={tag} className="px-2 py-1 bg-white/10 text-gray-300 rounded text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setCharacterData({...characterData, archetype: ''})}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
              
              {/* Comprehensive Archetype Description - Always Visible */}
              <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🏛️</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">Character Archetypes: Building Your World's Characters</h3>
                    <p className="text-gray-300 mb-4">
                      Archetypes define the fundamental roles, personalities, and capabilities of characters in your world. 
                      They serve as templates that influence everything from attribute priorities to behavioral tendencies, 
                      helping create consistent and believable characters across your simulation.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h4 className="font-medium text-white mb-3">Classic Fantasy Archetypes</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">⚔️</span>
                            <span className="text-sm text-gray-300"><strong>Warrior</strong> - Strength & Constitution focused</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📚</span>
                            <span className="text-sm text-gray-300"><strong>Scholar</strong> - Intelligence & Wisdom focused</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🤝</span>
                            <span className="text-sm text-gray-300"><strong>Diplomat</strong> - Charisma & Wisdom focused</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🗡️</span>
                            <span className="text-sm text-gray-300"><strong>Rogue</strong> - Dexterity & Intelligence focused</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-3">Professional & Social Roles</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💰</span>
                            <span className="text-sm text-gray-300"><strong>Merchant</strong> - Charisma & Intelligence focused</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🙏</span>
                            <span className="text-sm text-gray-300"><strong>Priest</strong> - Wisdom & Charisma focused</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🔨</span>
                            <span className="text-sm text-gray-300"><strong>Artisan</strong> - Dexterity & Wisdom focused</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">👑</span>
                            <span className="text-sm text-gray-300"><strong>Noble</strong> - Charisma & Constitution focused</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-white mb-2">Custom Archetypes You Can Create</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 bg-white/5 rounded border border-white/10">
                          <div className="font-medium text-blue-300 mb-1">Historical Figures</div>
                          <div className="text-gray-400">Philosophers, inventors, explorers, revolutionaries</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded border border-white/10">
                          <div className="font-medium text-green-300 mb-1">Fantasy Classes</div>
                          <div className="text-gray-400">Mages, rangers, paladins, necromancers</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded border border-white/10">
                          <div className="font-medium text-purple-300 mb-1">Modern Roles</div>
                          <div className="text-gray-400">Scientists, politicians, artists, entrepreneurs</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded border border-white/10">
                          <div className="font-medium text-orange-300 mb-1">Cultural Archetypes</div>
                          <div className="text-gray-400">Shamans, elders, warriors, healers</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded border border-white/10">
                          <div className="font-medium text-red-300 mb-1">Antagonists</div>
                          <div className="text-gray-400">Tyrants, thieves, cultists, warlords</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded border border-white/10">
                          <div className="font-medium text-cyan-300 mb-1">Specialized Roles</div>
                          <div className="text-gray-400">Spies, assassins, diplomats, merchants</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-400">
                      <p className="mb-2">
                        <strong>What archetypes control:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Attribute Ranges:</strong> Minimum and maximum values for each D&D attribute</li>
                        <li><strong>Personality Baseline:</strong> Core traits like bravery, curiosity, empathy</li>
                        <li><strong>Behavioral Tendencies:</strong> How characters typically respond to situations</li>
                        <li><strong>Social Roles:</strong> Expected behaviors in society and relationships</li>
                        <li><strong>Skill Priorities:</strong> Which abilities the character naturally excels at</li>
                        <li><strong>Cultural Context:</strong> How the archetype fits into your world's societies</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Background
              </label>
              <textarea
                value={characterData.background}
                onChange={(e) => setCharacterData({...characterData, background: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                placeholder="Character's background story..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Appearance
              </label>
              <textarea
                value={characterData.appearance}
                onChange={(e) => setCharacterData({...characterData, appearance: e.target.value})}
                rows={2}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                placeholder="Physical appearance description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tags
              </label>
              <input
                type="text"
                placeholder="Add tags separated by commas..."
                value={characterData.tags.join(', ')}
                onChange={(e) => setCharacterData({
                  ...characterData, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
          </div>
        )}

        {/* Origin Tab */}
        {activeTab === 'origin' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-blue-300 font-medium mb-1">Create Custom Origins</p>
                  <p className="text-blue-200 text-sm mb-3">
                    Origins are created independently in the Origin Builder. Create backstories, events, and starting conditions that can be reused across multiple characters.
                  </p>
                  <a
                    href="/origins/builder"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <BookOpen className="w-4 h-4" />
                    Open Origin Builder
                  </a>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-400">
              Select an existing origin to apply to this character, or skip to create a character without an origin backstory.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Select Origin Template (Optional)
              </label>
              <select
                value={selectedOrigin?.id || ''}
                onChange={(e) => {
                  const originId = e.target.value;
                  if (originId) {
                    // Check built-in templates first
                    let origin = Object.values(OriginTemplates).find(o => o.id === originId);
                    // Then check custom origins
                    if (!origin) {
                      origin = customOrigins.find(o => o.id === originId);
                    }
                    setSelectedOrigin(origin);
                    setOriginApplied(false);
                  } else {
                    setSelectedOrigin(null);
                    setOriginApplied(false);
                  }
                }}
                className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                style={{ backgroundColor: '#1e293b', color: '#ffffff' }}
              >
                <option value="" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>None (Create from scratch)</option>
                
                {/* Built-in Templates */}
                {Object.keys(OriginTemplates).length > 0 && (
                  <optgroup label="Built-in Templates" style={{ backgroundColor: '#334155', color: '#ffffff' }}>
                    {Object.values(OriginTemplates).map((origin) => (
                      <option key={origin.id} value={origin.id} style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                        {origin.name} - {origin.category} (Age {origin.startAge}→{origin.playableAge})
                      </option>
                    ))}
                  </optgroup>
                )}
                
                {/* Custom Origins */}
                {customOrigins.length > 0 && (
                  <optgroup label="Custom Origins" style={{ backgroundColor: '#334155', color: '#ffffff' }}>
                    {customOrigins.map((origin) => (
                      <option key={origin.id} value={origin.id} style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                        {origin.name} - {origin.category} (Age {origin.startAge}→{origin.playableAge})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Origin Preview */}
            {selectedOrigin && (
              <div className="space-y-3">
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <h4 className="text-purple-300 font-medium mb-2">{selectedOrigin.name}</h4>
                  <p className="text-gray-300 text-sm mb-3">{selectedOrigin.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-gray-400">
                      <span className="font-medium">Category:</span> {selectedOrigin.category}
                    </div>
                    <div className="text-gray-400">
                      <span className="font-medium">Difficulty:</span> {selectedOrigin.difficulty}
                    </div>
                    <div className="text-gray-400">
                      <span className="font-medium">Start Age:</span> {selectedOrigin.startAge}
                    </div>
                    <div className="text-gray-400">
                      <span className="font-medium">Playable Age:</span> {selectedOrigin.playableAge}
                    </div>
                    <div className="text-gray-400 col-span-2">
                      <span className="font-medium">Backstory Events:</span> {selectedOrigin.backstoryEvents.length}
                    </div>
                  </div>
                </div>

                {/* Apply Origin Button */}
                <button
                  onClick={() => {
                    if (selectedOrigin) {
                      // Create Character entity and apply origin
                      const Character = require('../../domain/entities/Character').default;
                      const tempChar = new Character(characterData);
                      selectedOrigin.applyToCharacter(tempChar);
                      
                      // Update character data with applied changes
                      setCharacterData({
                        ...characterData,
                        attributes: tempChar.attributes,
                        skills: tempChar.skills,
                        personality: tempChar.personality
                      });
                      setOriginApplied(true);
                    }
                  }}
                  disabled={originApplied}
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    originApplied
                      ? 'bg-green-600/50 text-green-200 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {originApplied ? '✓ Origin Applied' : 'Apply Origin to Character'}
                </button>

                {originApplied && (
                  <p className="text-green-400 text-sm text-center">
                    Character attributes and skills updated!
                  </p>
                )}

                {/* Origin Details */}
                <details className="mt-3">
                  <summary className="text-purple-300 text-sm cursor-pointer hover:text-purple-200">
                    View Backstory Events ({selectedOrigin.backstoryEvents.length})
                  </summary>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {selectedOrigin.backstoryEvents.map((event, idx) => (
                      <div key={idx} className="p-2 bg-slate-700/50 rounded text-xs">
                        <span className="text-purple-400 font-medium">Age {event.age}:</span>
                        <span className="text-gray-300 ml-2">{event.description}</span>
                        {event.isSignificant && (
                          <span className="ml-2 text-yellow-400">⭐</span>
                        )}
                      </div>
                    ))}
                  </div>
                </details>

                {/* Link to Origin Builder */}
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <p className="text-blue-300 text-sm">
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Want to create custom origins? Visit the <a href="/origins/builder" className="text-blue-400 hover:text-blue-300 underline">Origin Builder</a>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attributes Tab */}
        {activeTab === 'attributes' && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Set the D&D-style attributes for this character template
            </p>
            <AttributeEditor
              attributes={characterData.attributes}
              onChange={(attributes) => setCharacterData({...characterData, attributes})}
            />
          </div>
        )}

        {/* Personality Tab */}
        {activeTab === 'personality' && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Define the personality traits and consciousness parameters
            </p>
            <PersonalityEditor
              personality={characterData.personality}
              onChange={(personality) => setCharacterData({...characterData, personality})}
            />
            
            {/* Consciousness parameters */}
            <div className="mt-6 p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <h4 className="font-medium text-white mb-3">Consciousness Parameters</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-300">Base Frequency (Hz)</label>
                  <input
                    type="number"
                    value={characterData.consciousness.baseFrequency}
                    onChange={(e) => setCharacterData({
                      ...characterData,
                      consciousness: {
                        ...characterData.consciousness,
                        baseFrequency: parseFloat(e.target.value) || 40
                      }
                    })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Coherence (0-1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={characterData.consciousness.coherence}
                    onChange={(e) => setCharacterData({
                      ...characterData,
                      consciousness: {
                        ...characterData.consciousness,
                        coherence: parseFloat(e.target.value) || 0.7
                      }
                    })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Awareness (0-1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={characterData.consciousness.awareness}
                    onChange={(e) => setCharacterData({
                      ...characterData,
                      consciousness: {
                        ...characterData.consciousness,
                        awareness: parseFloat(e.target.value) || 0.5
                      }
                    })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab - Only in Detailed Mode */}
        {activeTab === 'skills' && creationMode === CHARACTER_CREATION_MODES.DETAILED && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Set skill levels for this character template (0-10 scale)
            </p>
            <SkillEditor
              skills={characterData.skills}
              onChange={(skills) => setCharacterData({...characterData, skills})}
            />
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Define the goals and motivations for this character
            </p>
            {errors.goals && (
              <p className="text-red-500 text-sm mb-4">{errors.goals}</p>
            )}
            <GoalEditor
              goals={characterData.goals}
              onChange={(goals) => setCharacterData({...characterData, goals})}
            />
          </div>
        )}

        {/* Interactions Tab */}
        {activeTab === 'interactions' && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Assign interactions that this character can perform. Interactions define what actions the character can take during simulation.
            </p>
            <InteractionAssignmentPanel
              character={characterData}
              assignedInteractions={getAssignedInteractions()}
              availableInteractions={availableInteractions}
              onAssignInteraction={handleAssignInteraction}
              onUnassignInteraction={handleUnassignInteraction}
              onCreateInteraction={onCreateInteraction}
              onEditInteraction={onEditInteraction}
            />
          </div>
        )}

        {/* Interaction Templates Tab */}
        {activeTab === 'interaction-templates' && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Assign interaction templates to this character template. When NPCs are generated from this template, they will automatically get interactions created from these templates.
            </p>
            <InteractionTemplateAssignmentPanel
              character={characterData}
              assignedInteractionTemplates={characterData.assignedInteractionTemplates}
              onAssignTemplate={(templateId) => {
                if (!characterData.assignedInteractionTemplates.includes(templateId)) {
                  setCharacterData({
                    ...characterData,
                    assignedInteractionTemplates: [...characterData.assignedInteractionTemplates, templateId]
                  });
                }
              }}
              onUnassignTemplate={(templateId) => {
                setCharacterData({
                  ...characterData,
                  assignedInteractionTemplates: characterData.assignedInteractionTemplates.filter(id => id !== templateId)
                });
              }}
            />
          </div>
        )}

        {/* Investments Tab - Only in Detailed Mode */}
        {activeTab === 'investments' && creationMode === CHARACTER_CREATION_MODES.DETAILED && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Manage character's economic investments, passive income, and financial goals
            </p>
            <InvestmentEditor
              character={characterData}
              onChange={(updatedCharacter) => setCharacterData(updatedCharacter)}
              availableInteractions={availableInteractions}
              worldState={null}
              currentNode={null}
            />
          </div>
        )}

        {/* Equipment Tab - Only in Detailed Mode */}
        {activeTab === 'equipment' && creationMode === CHARACTER_CREATION_MODES.DETAILED && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Define starting equipment for this character template
            </p>
            <EquipmentEditor
              equipment={characterData.equipment}
              onChange={(equipment) => setCharacterData({...characterData, equipment})}
            />
          </div>
        )}

        {/* Relationships Tab - Only in Detailed Mode */}
        {activeTab === 'relationships' && creationMode === CHARACTER_CREATION_MODES.DETAILED && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Define potential relationship templates for this character
            </p>
            <RelationshipTemplateEditor
              relationshipTemplates={characterData.relationshipTemplates}
              onChange={(relationshipTemplates) => setCharacterData({...characterData, relationshipTemplates})}
            />
          </div>
        )}

        {/* Enemies Tab - Only in Detailed Mode */}
        {activeTab === 'enemies' && creationMode === CHARACTER_CREATION_MODES.DETAILED && (
          <div>
            <EnemyRelationshipManager
              character={characterData}
              allCharacters={[]} // Will be populated when integrated with world context
              onRelationshipUpdate={(updatedCharacter) => {
                setCharacterData({
                  ...characterData,
                  relationships: updatedCharacter.relationships
                });
              }}
              readonly={mode === 'view'}
            />
          </div>
        )}

        {/* Archetypes Tab - Only in Detailed Mode */}
        {activeTab === 'archetypes' && creationMode === CHARACTER_CREATION_MODES.DETAILED && (
          <ArchetypeManager
            archetypes={templates.archetypes || []}
            onCreateArchetype={handleCreateArchetype}
            onEditArchetype={handleEditArchetype}
            onDeleteArchetype={handleDeleteArchetype}
            onSaveArchetype={handleSaveArchetype}
            onLoadArchetype={handleLoadArchetype}
          />
        )}

        {/* Advanced Tab - Only in Detailed Mode */}
        {activeTab === 'advanced' && creationMode === CHARACTER_CREATION_MODES.DETAILED && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Custom Metadata (JSON)
              </label>
              <textarea
                value={JSON.stringify(characterData.metadata, null, 2)}
                onChange={(e) => {
                  try {
                    const metadata = JSON.parse(e.target.value);
                    setCharacterData({...characterData, metadata});
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={8}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg font-mono text-sm text-white"
              />
            </div>

            <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
              <h4 className="font-medium text-white mb-2">Template Usage Notes</h4>
              <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                <li>This template will be used to generate NPCs during world simulation</li>
                <li>Attributes and skills may vary ±20% from template values</li>
                <li>Personality traits influence NPC decision-making</li>
                <li>Goals drive autonomous NPC behavior</li>
                <li>Relationship templates determine initial social connections</li>
              </ul>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* Preview Panel */}
      <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
        <h3 className="font-semibold text-white mb-3">
          {creationMode === CHARACTER_CREATION_MODES.TEMPLATE ? 'NPC Template Summary' : 'Character Summary'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-300">Archetype:</span> <span className="text-white">{
              CHARACTER_ARCHETYPES.find(a => a.id === characterData.archetype)?.label
            }</span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Avg. Attributes:</span> <span className="text-white">{
              characterData.attributes ? (Object.values(characterData.attributes).reduce((sum, val) => sum + val, 0) / 6).toFixed(1) : '0.0'
            }</span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Goals:</span> <span className="text-white">{characterData.goals?.length || 0}</span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Interactions:</span> <span className="text-white">{characterData.assignedInteractions?.length || 0}</span>
          </div>
          {creationMode === CHARACTER_CREATION_MODES.DETAILED && (
            <>
              <div>
                <span className="font-medium text-gray-300">Skills:</span> <span className="text-white">{Object.keys(characterData.skills || {}).length}</span>
              </div>
              <div>
                <span className="font-medium text-gray-300">Equipment:</span> <span className="text-white">{
                  Object.values(characterData.equipment).flat().length
                } items</span>
              </div>
              <div>
                <span className="font-medium text-gray-300">Relationships:</span> <span className="text-white">{characterData.relationshipTemplates?.length || 0}</span>
              </div>
            </>
          )}
        </div>
        
        {/* Mode-specific completion indicators */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-4 text-sm flex-wrap">
            {creationMode === CHARACTER_CREATION_MODES.TEMPLATE ? (
              <>
                <div className={`flex items-center gap-2 ${characterData.archetype ? 'text-green-400' : 'text-yellow-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${characterData.archetype ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  Archetype
                </div>
                <div className={`flex items-center gap-2 ${Object.keys(characterData.templateSettings?.attributeRanges || {}).length > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${Object.keys(characterData.templateSettings?.attributeRanges || {}).length > 0 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  Attributes
                </div>
                <div className={`flex items-center gap-2 ${Object.keys(characterData.personality?.traits || {}).length > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${Object.keys(characterData.personality?.traits || {}).length > 0 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  Personality
                </div>
                <div className="text-blue-400 text-xs ml-auto">
                  🚀 Template Mode: Ready for bulk NPC generation
                </div>
              </>
            ) : (
              <>
                <div className={`flex items-center gap-2 ${characterData.name && characterData.description ? 'text-green-400' : 'text-yellow-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${characterData.name && characterData.description ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  Basic Info
                </div>
                <div className={`flex items-center gap-2 ${(characterData.goals?.length || 0) > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${(characterData.goals?.length || 0) > 0 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  Goals
                </div>
                <div className={`flex items-center gap-2 ${(characterData.assignedInteractions?.length || 0) > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${(characterData.assignedInteractions?.length || 0) > 0 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  Interactions
                </div>
                <div className="text-purple-400 text-xs ml-auto">
                  🔧 Detailed Mode: Full character customization
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Save Feedback */}
      {(saveSuccess || saveError || isSaving) && (
        <div className="mb-4">
          {isSaving && (
            <div className="flex items-center gap-2 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              <span className="text-blue-400 text-sm">Saving character...</span>
            </div>
          )}
          
          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-green-900 text-xs">✓</span>
              </div>
              <span className="text-green-400 text-sm">
                Character {mode === 'create' ? 'created' : 'updated'} successfully!
              </span>
            </div>
          )}
          
          {saveError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                <span className="text-red-900 text-xs">!</span>
              </div>
              <span className="text-red-400 text-sm">{saveError}</span>
            </div>
          )}
        </div>
      )}

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
              disabled={isSaving}
              className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            disabled={isSaving}
            className="px-6 py-2 border border-white/20 rounded-lg hover:bg-white/10 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            {mode === 'create' 
              ? (creationMode === CHARACTER_CREATION_MODES.TEMPLATE ? 'Create NPC Template' : 'Create Character')
              : 'Save Changes'
            }
          </button>
        </div>
      </div>

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-white/20 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-white/20 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Character Templates</h3>
              <button
                onClick={() => setShowTemplateLibrary(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              <TemplateLibraryPanel
                selectedType="characters"
                onTemplateSelect={handleLoadFromTemplate}
                showRecommendations={true}
                enableBulkOperations={false}
                className="border-0 bg-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Archetype Selector Modal */}
      {showArchetypeSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-white/20 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Select Character Archetype</h3>
                <button
                  onClick={() => setShowArchetypeSelector(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <ArchetypeSelector
                selectedArchetype={characterData.archetype}
                onSelect={(archetypeId) => {
                  handleArchetypeSelect(archetypeId);
                  setShowArchetypeSelector(false);
                }}
                customArchetypes={templates.archetypes || []}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Archetype Modal */}
      {showCreateArchetype && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-6 pt-12">
          <div className="bg-gray-900 rounded-lg border border-white/20 w-full max-w-4xl h-[70vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/20 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold text-white">Create Custom Archetype</h3>
              <button
                onClick={() => setShowCreateArchetype(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newArchetype?.name || ''}
                      onChange={(e) => setNewArchetype({...newArchetype, name: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="Archetype name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newArchetype?.label || ''}
                      onChange={(e) => setNewArchetype({...newArchetype, label: e.target.value})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="Display label"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={newArchetype?.icon || '👤'}
                    onChange={(e) => setNewArchetype({...newArchetype, icon: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center text-xl"
                    placeholder="👤"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={newArchetype?.description || ''}
                    onChange={(e) => setNewArchetype({...newArchetype, description: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                    placeholder="Describe this archetype..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Primary Stats
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {DND_ATTRIBUTES.map(attr => (
                      <button
                        key={attr.id}
                        onClick={() => {
                          const currentStats = newArchetype?.primaryStats || [];
                          if (currentStats.includes(attr.id)) {
                            setNewArchetype({
                              ...newArchetype,
                              primaryStats: currentStats.filter(s => s !== attr.id)
                            });
                          } else {
                            setNewArchetype({
                              ...newArchetype,
                              primaryStats: [...currentStats, attr.id]
                            });
                          }
                        }}
                        className={`p-2 rounded-lg border text-sm transition-colors ${
                          (newArchetype?.primaryStats || []).includes(attr.id)
                            ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                            : 'border-white/20 hover:border-white/40 text-gray-300'
                        }`}
                      >
                        {attr.abbr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/20 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowCreateArchetype(false)}
                className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newArchetype?.name || !newArchetype?.label) {
                    alert('Name and label are required');
                    return;
                  }

                  try {
                    await handleCreateArchetype({
                      ...newArchetype,
                      id: newArchetype.id || `archetype_${Date.now()}`
                    });
                    setShowCreateArchetype(false);
                    setNewArchetype({
                      id: '',
                      name: '',
                      label: '',
                      icon: '👤',
                      description: '',
                      primaryStats: [],
                      tags: []
                    });
                  } catch (error) {
                    console.error('Failed to create archetype:', error);
                    alert(`Failed to create archetype: ${error.message}`);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Archetype
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterEditor;
