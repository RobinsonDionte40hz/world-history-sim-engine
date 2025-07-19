import React, { useState, useCallback } from 'react';

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
          onClick={handleRandomize}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Roll 3d6
        </button>
        <button
          onClick={handleStandardArray}
          className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
        >
          Standard Array
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {DND_ATTRIBUTES.map(attr => (
          <div key={attr.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-sm">
                {attr.label} ({attr.abbr})
              </label>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
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
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-center"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {attr.description}
            </p>
          </div>
        ))}
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <p className="text-sm">
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
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
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
              <label className="text-sm font-medium">{trait.label}</label>
              <span className="text-sm font-mono">
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
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        ))}
      </div>

      {/* Core beliefs */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Core Beliefs</label>
        <textarea
          value={personality.beliefs || ''}
          onChange={(e) => onChange({ ...personality, beliefs: e.target.value })}
          placeholder="What does this character believe in? What drives them?"
          rows={3}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      {/* Fears */}
      <div>
        <label className="block text-sm font-medium mb-2">Fears</label>
        <input
          type="text"
          value={personality.fears?.join(', ') || ''}
          onChange={(e) => onChange({ 
            ...personality, 
            fears: e.target.value.split(',').map(f => f.trim()).filter(Boolean)
          })}
          placeholder="List fears separated by commas..."
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
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
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
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
          <div key={skill} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="font-medium text-sm">{skill}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSkillLevel(skill, Math.max(0, getSkillLevel(skill) - 1))}
                className="w-8 h-8 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                -
              </button>
              <span className="w-8 text-center font-mono">{getSkillLevel(skill)}</span>
              <button
                onClick={() => handleSkillLevel(skill, Math.min(10, getSkillLevel(skill) + 1))}
                className="w-8 h-8 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Skill summary */}
      {Object.keys(skills).length > 0 && (
        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
          <p className="text-sm font-medium mb-2">Active Skills:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(skills).map(([skill, level]) => (
              <span key={skill} className="px-2 py-1 bg-green-200 dark:bg-green-800 rounded text-sm">
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
                className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{type?.icon}</span>
                  <div>
                    <p className="font-medium">{goal.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {type?.label} • Priority: {priority?.label}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveGoal(goal.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new goal */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <h4 className="font-medium mb-3">Add Goal</h4>
        
        <div className="space-y-3">
          <textarea
            value={newGoal.description}
            onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
            placeholder="Describe the character's goal..."
            rows={2}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <select
                value={newGoal.type}
                onChange={(e) => setNewGoal({...newGoal, type: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              >
                {goalTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Priority</label>
              <select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              >
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id}>
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
          className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
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
          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
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
            <div key={cat.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <span>{cat.icon}</span>
                {cat.label}
              </h4>
              <div className="flex flex-wrap gap-2">
                {items.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {item}
                    <button
                      onClick={() => handleRemoveItem(cat.id, index)}
                      className="text-red-600 hover:text-red-800"
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
              className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <div>
                <p className="font-medium">{template.type}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Range: {template.minValue} to {template.maxValue}
                  {template.tags.length > 0 && ` • Tags: ${template.tags.join(', ')}`}
                </p>
              </div>
              <button
                onClick={() => handleRemoveTemplate(template.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new template */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <h4 className="font-medium mb-3">Add Relationship Template</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <select
              value={newTemplate.type}
              onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="">Select type...</option>
              {relationshipTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm">Min Value</label>
            <input
              type="number"
              value={newTemplate.minValue}
              onChange={(e) => setNewTemplate({...newTemplate, minValue: parseInt(e.target.value) || -100})}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label className="text-sm">Max Value</label>
            <input
              type="number"
              value={newTemplate.maxValue}
              onChange={(e) => setNewTemplate({...newTemplate, maxValue: parseInt(e.target.value) || 100})}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
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
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
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
  mode = 'create' // 'create' or 'edit'
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
    equipment: initialCharacter?.equipment || {},
    relationshipTemplates: initialCharacter?.relationshipTemplates || [],
    background: initialCharacter?.background || '',
    appearance: initialCharacter?.appearance || '',
    tags: initialCharacter?.tags || [],
    metadata: initialCharacter?.metadata || {}
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  // Validation
  const validateCharacter = useCallback(() => {
    const newErrors = {};
    
    if (!characterData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!characterData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (characterData.goals.length === 0) {
      newErrors.goals = 'At least one goal is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [characterData]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!validateCharacter()) {
      return;
    }

    // Let parent component handle the actual save operation
    // This maintains clean architecture - presentation layer doesn't know about domain services
    if (onSave) {
      onSave(characterData);
    }
  }, [characterData, onSave, validateCharacter]);

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

  // Tabs configuration
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'attributes', label: 'Attributes', icon: '💪' },
    { id: 'personality', label: 'Personality', icon: '🧠' },
    { id: 'skills', label: 'Skills', icon: '⭐' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'equipment', label: 'Equipment', icon: '🎒' },
    { id: 'relationships', label: 'Relationships', icon: '🤝' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {mode === 'create' ? 'Create Character Template' : 'Edit Character Template'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Define templates for NPC generation in your world
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
                Character ID
              </label>
              <input
                type="text"
                value={characterData.id}
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
                value={characterData.name}
                onChange={(e) => setCharacterData({...characterData, name: e.target.value})}
                className={`
                  w-full px-4 py-2 border rounded-lg dark:bg-gray-800
                  ${errors.name ? 'border-red-500' : 'dark:border-gray-600'}
                `}
                placeholder="Enter character template name..."
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
                value={characterData.description}
                onChange={(e) => setCharacterData({...characterData, description: e.target.value})}
                rows={4}
                className={`
                  w-full px-4 py-2 border rounded-lg dark:bg-gray-800
                  ${errors.description ? 'border-red-500' : 'dark:border-gray-600'}
                `}
                placeholder="Describe this character template..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
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
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{archetype.icon}</div>
                    <div className="text-sm font-medium">{archetype.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Background
              </label>
              <textarea
                value={characterData.background}
                onChange={(e) => setCharacterData({...characterData, background: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                placeholder="Character's background story..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Appearance
              </label>
              <textarea
                value={characterData.appearance}
                onChange={(e) => setCharacterData({...characterData, appearance: e.target.value})}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                placeholder="Physical appearance description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
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
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
          </div>
        )}

        {/* Attributes Tab */}
        {activeTab === 'attributes' && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Define the personality traits and consciousness parameters
            </p>
            <PersonalityEditor
              personality={characterData.personality}
              onChange={(personality) => setCharacterData({...characterData, personality})}
            />
            
            {/* Consciousness parameters */}
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <h4 className="font-medium mb-3">Consciousness Parameters</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm">Base Frequency (Hz)</label>
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
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-sm">Coherence (0-1)</label>
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
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-sm">Awareness (0-1)</label>
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
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Define starting equipment for this character template
            </p>
            <EquipmentEditor
              equipment={characterData.equipment}
              onChange={(equipment) => setCharacterData({...characterData, equipment})}
            />
          </div>
        )}

        {/* Relationships Tab */}
        {activeTab === 'relationships' && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Define potential relationship templates for this character
            </p>
            <RelationshipTemplateEditor
              relationshipTemplates={characterData.relationshipTemplates}
              onChange={(relationshipTemplates) => setCharacterData({...characterData, relationshipTemplates})}
            />
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
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
                className="w-full px-4 py-2 border rounded-lg font-mono text-sm dark:bg-gray-800 dark:border-gray-600"
              />
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <h4 className="font-medium mb-2">Template Usage Notes</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>This template will be used to generate NPCs during world simulation</li>
                <li>Attributes and skills may vary ±20% from template values</li>
                <li>Personality traits influence NPC decision-making</li>
                <li>Goals drive autonomous NPC behavior</li>
                <li>Relationship templates determine initial social connections</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-3">Template Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Archetype:</span> {
              CHARACTER_ARCHETYPES.find(a => a.id === characterData.archetype)?.label
            }
          </div>
          <div>
            <span className="font-medium">Avg. Attributes:</span> {
              (Object.values(characterData.attributes).reduce((sum, val) => sum + val, 0) / 6).toFixed(1)
            }
          </div>
          <div>
            <span className="font-medium">Skills:</span> {Object.keys(characterData.skills).length}
          </div>
          <div>
            <span className="font-medium">Goals:</span> {characterData.goals.length}
          </div>
          <div>
            <span className="font-medium">Equipment:</span> {
              Object.values(characterData.equipment).flat().length
            } items
          </div>
          <div>
            <span className="font-medium">Relationships:</span> {characterData.relationshipTemplates.length}
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
          {mode === 'create' ? 'Create Character' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default CharacterEditor;