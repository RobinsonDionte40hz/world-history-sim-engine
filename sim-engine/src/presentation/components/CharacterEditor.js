import React, { useState, useCallback } from 'react';
import InteractionAssignmentPanel from './InteractionAssignmentPanel.js';
import InvestmentEditor from './InvestmentEditor.js';
import { validateCharacterForSave } from '../../shared/utils/characterSaveUtils';
import { Users, User, Save, Upload } from 'lucide-react';
import useTemplates from '../hooks/useTemplates';
import TemplateLibraryPanel from './TemplateLibraryPanel';

// Character creation modes
const CHARACTER_CREATION_MODES = {
  TEMPLATE: 'template',    // Quick NPC template creation
  DETAILED: 'detailed'     // Full character creation
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
const GoalEditor = ({ goals, onChange }) => {
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
const ArchetypeSelector = ({ selectedArchetype, onSelect }) => (
  <div>
    <label className="block text-sm font-medium text-white mb-3">
      Character Archetype <span className="text-red-500">*</span>
    </label>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                {(personality.traits?.[trait.id] || 0.5).toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={personality.traits?.[trait.id] || 0.5}
              onChange={(e) => onChange({
                ...personality,
                traits: {
                  ...personality.traits,
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
  errors = {} 
}) => {
  const handleArchetypeSelect = (archetypeId) => {
    const archetype = CHARACTER_ARCHETYPES.find(a => a.id === archetypeId);
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
  };

  return (
    <div className="space-y-6">
      {/* Quick Setup */}
      <ArchetypeSelector
        selectedArchetype={characterData.archetype}
        onSelect={handleArchetypeSelect}
      />
      
      {errors.archetype && (
        <p className="text-red-500 text-sm">{errors.archetype}</p>
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
    id: initialCharacter?.id || `character_${Date.now()}`,
    name: initialCharacter?.name || '',
    description: initialCharacter?.description || '',
    archetype: initialCharacter?.archetype || 'warrior',
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
  
  const { saveTemplate, loadTemplate } = useTemplates();

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
    
    setErrors(newErrors);
    return validationResult.isValid && Object.keys(newErrors).length === 0;
  }, [characterData, creationMode]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateCharacter()) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Check if we're creating a template or regular character
      if (mode === 'create' && creationMode === CHARACTER_CREATION_MODES.TEMPLATE) {
        // Call template creation handler
        if (onCreateTemplate) {
          await onCreateTemplate(characterData);
          setSaveSuccess(true);
          
          // Clear success message after 3 seconds
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } else {
        // Call regular save handler
        if (onSave) {
          await onSave(characterData);
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
        { id: 'attributes', label: 'Attributes', icon: '💪' },
        { id: 'personality', label: 'Personality', icon: '🧠' },
        { id: 'skills', label: 'Skills', icon: '⭐' },
        { id: 'goals', label: 'Goals', icon: '🎯' },
        { id: 'interactions', label: 'Interactions', icon: '⚡' },
        { id: 'investments', label: 'Investments', icon: '💰' },
        { id: 'equipment', label: 'Equipment', icon: '🎒' },
        { id: 'relationships', label: 'Relationships', icon: '🤝' },
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
      <div className="flex gap-2 mb-6 p-1 bg-white/10 rounded-lg border border-white/20 w-fit">
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
      </div>

      {/* Mode Description */}
      <div className="mb-6 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
        <p className="text-blue-200 text-sm">
          {creationMode === CHARACTER_CREATION_MODES.TEMPLATE
            ? '🚀 Quick mode for creating NPC templates with essential attributes, personality, and goals. Perfect for rapid world population.'
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
                Character ID
              </label>
              <input
                type="text"
                value={characterData.id}
                disabled
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-400"
              />
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

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Archetype
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CHARACTER_ARCHETYPES.map(archetype => (
                  <button
                    key={archetype.id}
                    onClick={() => handleArchetypeSelect(archetype.id)}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${characterData.archetype === archetype.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/20 hover:border-white/40 bg-white/5'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{archetype.icon}</div>
                    <div className="text-sm font-medium text-white">{archetype.label}</div>
                  </button>
                ))}
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
    </div>
  );
};

export default CharacterEditor;
