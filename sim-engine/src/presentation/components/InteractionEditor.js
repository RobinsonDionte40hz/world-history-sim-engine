import React, { useState, useCallback } from 'react';

// Note: Redux integration will need to be implemented when store is available
// import { useDispatch } from 'react-redux';
// import { createInteractionTemplate, updateInteractionTemplate } from '../store/actions/interactionActions';

// Placeholder functions for interaction management
const createInteractionTemplate = (interactionData) => {
  // TODO: Implement actual Redux action or API call
  console.log('Creating interaction template:', interactionData);
  return { type: 'CREATE_INTERACTION_TEMPLATE', payload: interactionData };
};

const updateInteractionTemplate = (interactionData) => {
  // TODO: Implement actual Redux action or API call
  console.log('Updating interaction template:', interactionData);
  return { type: 'UPDATE_INTERACTION_TEMPLATE', payload: interactionData };
};

// Placeholder dispatch function
const useDispatch = () => {
  return (action) => {
    console.log('Dispatching action:', action);
    // TODO: Replace with actual Redux dispatch
  };
};

// Interaction categories
const INTERACTION_CATEGORIES = [
  { id: 'dialogue', label: 'Dialogue', icon: '💬', color: 'blue' },
  { id: 'trade', label: 'Trade', icon: '🤝', color: 'green' },
  { id: 'combat', label: 'Combat', icon: '⚔️', color: 'red' },
  { id: 'exploration', label: 'Exploration', icon: '🗺️', color: 'purple' },
  { id: 'social', label: 'Social', icon: '👥', color: 'yellow' },
  { id: 'quest', label: 'Quest', icon: '📜', color: 'orange' },
  { id: 'diplomacy', label: 'Diplomacy', icon: '🕊️', color: 'indigo' },
  { id: 'event', label: 'Event', icon: '✨', color: 'pink' }
];

// D&D Attributes for checks
const DND_ATTRIBUTES = [
  { id: 'strength', label: 'Strength', abbr: 'STR' },
  { id: 'dexterity', label: 'Dexterity', abbr: 'DEX' },
  { id: 'constitution', label: 'Constitution', abbr: 'CON' },
  { id: 'intelligence', label: 'Intelligence', abbr: 'INT' },
  { id: 'wisdom', label: 'Wisdom', abbr: 'WIS' },
  { id: 'charisma', label: 'Charisma', abbr: 'CHA' }
];

// Effect types
const EFFECT_TYPES = [
  { id: 'attribute', label: 'Modify Attribute', icon: '📊' },
  { id: 'relationship', label: 'Change Relationship', icon: '❤️' },
  { id: 'quest', label: 'Quest Progress', icon: '📜' },
  { id: 'item', label: 'Give/Take Item', icon: '🎒' },
  { id: 'influence', label: 'Influence Change', icon: '👑' },
  { id: 'prestige', label: 'Prestige Change', icon: '⭐' },
  { id: 'alignment', label: 'Alignment Shift', icon: '⚖️' },
  { id: 'consciousness', label: 'Consciousness Effect', icon: '🧠' },
  { id: 'memory', label: 'Create Memory', icon: '💭' },
  { id: 'trigger', label: 'Trigger Event', icon: '⚡' }
];

// Prerequisite editor component
const PrerequisiteEditor = ({ prerequisites, onChange }) => {
  const [activeType, setActiveType] = useState('attribute');
  
  const prerequisiteTypes = [
    { id: 'attribute', label: 'Attribute Check' },
    { id: 'skill', label: 'Skill Requirement' },
    { id: 'quest', label: 'Quest State' },
    { id: 'relationship', label: 'Relationship Level' },
    { id: 'item', label: 'Item Possession' },
    { id: 'influence', label: 'Influence Level' },
    { id: 'alignment', label: 'Alignment Range' },
    { id: 'personality', label: 'Personality Trait' }
  ];

  const handleAddPrerequisite = (type, data) => {
    const newPrereq = {
      id: Date.now(),
      type,
      ...data
    };
    onChange([...prerequisites, newPrereq]);
  };

  const handleRemovePrerequisite = (id) => {
    onChange(prerequisites.filter(p => p.id !== id));
  };

  const renderPrerequisiteForm = () => {
    switch (activeType) {
      case 'attribute':
        return <AttributeCheckForm onAdd={(data) => handleAddPrerequisite('attribute', data)} />;
      case 'skill':
        return <SkillRequirementForm onAdd={(data) => handleAddPrerequisite('skill', data)} />;
      case 'quest':
        return <QuestStateForm onAdd={(data) => handleAddPrerequisite('quest', data)} />;
      case 'relationship':
        return <RelationshipForm onAdd={(data) => handleAddPrerequisite('relationship', data)} />;
      case 'item':
        return <ItemRequirementForm onAdd={(data) => handleAddPrerequisite('item', data)} />;
      case 'influence':
        return <InfluenceForm onAdd={(data) => handleAddPrerequisite('influence', data)} />;
      case 'alignment':
        return <AlignmentForm onAdd={(data) => handleAddPrerequisite('alignment', data)} />;
      case 'personality':
        return <PersonalityForm onAdd={(data) => handleAddPrerequisite('personality', data)} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing prerequisites */}
      {prerequisites.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Current Prerequisites</h4>
          {prerequisites.map(prereq => (
            <PrerequisiteCard
              key={prereq.id}
              prerequisite={prereq}
              onRemove={() => handleRemovePrerequisite(prereq.id)}
            />
          ))}
        </div>
      )}

      {/* Add new prerequisite */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <h4 className="font-medium mb-3">Add Prerequisite</h4>
        
        {/* Type selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {prerequisiteTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`
                px-3 py-1 rounded-lg text-sm font-medium transition-colors
                ${activeType === type.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Type-specific form */}
        {renderPrerequisiteForm()}
      </div>
    </div>
  );
};

// Prerequisite card component
const PrerequisiteCard = ({ prerequisite, onRemove }) => {
  const getPrerequisiteDescription = () => {
    switch (prerequisite.type) {
      case 'attribute':
        return `${prerequisite.attribute} check DC ${prerequisite.difficulty}`;
      case 'skill':
        return `Skill: ${prerequisite.skill} ≥ ${prerequisite.minLevel}`;
      case 'quest':
        return `Quest "${prerequisite.questId}" ${prerequisite.state}`;
      case 'relationship':
        return `Relationship with ${prerequisite.targetId} ${prerequisite.operator} ${prerequisite.value}`;
      case 'item':
        return `${prerequisite.quantity}× ${prerequisite.itemId}`;
      case 'influence':
        return `${prerequisite.faction} influence ≥ ${prerequisite.minValue}`;
      case 'alignment':
        return `Alignment: ${prerequisite.axis} ${prerequisite.min}-${prerequisite.max}`;
      case 'personality':
        return `Personality: ${prerequisite.trait} ${prerequisite.operator} ${prerequisite.value}`;
      default:
        return 'Unknown prerequisite';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <span className="text-sm">{getPrerequisiteDescription()}</span>
      <button
        onClick={onRemove}
        className="text-red-600 hover:text-red-800 ml-2"
      >
        ×
      </button>
    </div>
  );
};

// Attribute check form
const AttributeCheckForm = ({ onAdd }) => {
  const [data, setData] = useState({
    attribute: 'strength',
    difficulty: 10,
    advantage: false,
    disadvantage: false
  });

  const handleSubmit = () => {
    onAdd(data);
    setData({ attribute: 'strength', difficulty: 10, advantage: false, disadvantage: false });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-sm font-medium">Attribute</label>
        <select
          value={data.attribute}
          onChange={(e) => setData({...data, attribute: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        >
          {DND_ATTRIBUTES.map(attr => (
            <option key={attr.id} value={attr.id}>
              {attr.label} ({attr.abbr})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">DC</label>
        <input
          type="number"
          min="1"
          max="30"
          value={data.difficulty}
          onChange={(e) => setData({...data, difficulty: parseInt(e.target.value) || 10})}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>
      <div className="col-span-2 flex gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.advantage}
            onChange={(e) => setData({...data, advantage: e.target.checked, disadvantage: false})}
            className="mr-2"
          />
          Advantage
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.disadvantage}
            onChange={(e) => setData({...data, disadvantage: e.target.checked, advantage: false})}
            className="mr-2"
          />
          Disadvantage
        </label>
      </div>
      <button
        onClick={handleSubmit}
        className="col-span-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Add Attribute Check
      </button>
    </div>
  );
};

// Other prerequisite forms (simplified for brevity)
const SkillRequirementForm = ({ onAdd }) => {
  const [data, setData] = useState({ skill: '', minLevel: 1 });
  return (
    <div className="grid grid-cols-2 gap-3">
      <input
        type="text"
        placeholder="Skill name"
        value={data.skill}
        onChange={(e) => setData({...data, skill: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <input
        type="number"
        placeholder="Min level"
        min="1"
        value={data.minLevel}
        onChange={(e) => setData({...data, minLevel: parseInt(e.target.value) || 1})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <button
        onClick={() => data.skill && onAdd(data)}
        className="col-span-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Add Skill Requirement
      </button>
    </div>
  );
};

const QuestStateForm = ({ onAdd }) => {
  const [data, setData] = useState({ questId: '', state: 'completed' });
  return (
    <div className="grid grid-cols-2 gap-3">
      <input
        type="text"
        placeholder="Quest ID"
        value={data.questId}
        onChange={(e) => setData({...data, questId: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <select
        value={data.state}
        onChange={(e) => setData({...data, state: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      >
        <option value="not_started">Not Started</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
      </select>
      <button
        onClick={() => data.questId && onAdd(data)}
        className="col-span-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Add Quest Requirement
      </button>
    </div>
  );
};

const RelationshipForm = ({ onAdd }) => {
  const [data, setData] = useState({ targetId: '', operator: '≥', value: 50 });
  return (
    <div className="grid grid-cols-3 gap-3">
      <input
        type="text"
        placeholder="Character ID"
        value={data.targetId}
        onChange={(e) => setData({...data, targetId: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <select
        value={data.operator}
        onChange={(e) => setData({...data, operator: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      >
        <option value="≥">≥</option>
        <option value="≤">≤</option>
        <option value="=">=</option>
      </select>
      <input
        type="number"
        min="-100"
        max="100"
        value={data.value}
        onChange={(e) => setData({...data, value: parseInt(e.target.value) || 0})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <button
        onClick={() => data.targetId && onAdd(data)}
        className="col-span-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Add Relationship Requirement
      </button>
    </div>
  );
};

const ItemRequirementForm = ({ onAdd }) => {
  const [data, setData] = useState({ itemId: '', quantity: 1 });
  return (
    <div className="grid grid-cols-2 gap-3">
      <input
        type="text"
        placeholder="Item ID"
        value={data.itemId}
        onChange={(e) => setData({...data, itemId: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <input
        type="number"
        placeholder="Quantity"
        min="1"
        value={data.quantity}
        onChange={(e) => setData({...data, quantity: parseInt(e.target.value) || 1})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <button
        onClick={() => data.itemId && onAdd(data)}
        className="col-span-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Add Item Requirement
      </button>
    </div>
  );
};

const InfluenceForm = ({ onAdd }) => {
  const [data, setData] = useState({ faction: '', minValue: 0 });
  return (
    <div className="grid grid-cols-2 gap-3">
      <input
        type="text"
        placeholder="Faction name"
        value={data.faction}
        onChange={(e) => setData({...data, faction: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <input
        type="number"
        placeholder="Min influence"
        min="0"
        value={data.minValue}
        onChange={(e) => setData({...data, minValue: parseInt(e.target.value) || 0})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <button
        onClick={() => data.faction && onAdd(data)}
        className="col-span-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Add Influence Requirement
      </button>
    </div>
  );
};

const AlignmentForm = ({ onAdd }) => {
  const [data, setData] = useState({ axis: 'lawChaos', min: -100, max: 100 });
  return (
    <div className="space-y-3">
      <select
        value={data.axis}
        onChange={(e) => setData({...data, axis: e.target.value})}
        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      >
        <option value="lawChaos">Law-Chaos</option>
        <option value="goodEvil">Good-Evil</option>
      </select>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          placeholder="Min"
          min="-100"
          max="100"
          value={data.min}
          onChange={(e) => setData({...data, min: parseInt(e.target.value) || -100})}
          className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
        <input
          type="number"
          placeholder="Max"
          min="-100"
          max="100"
          value={data.max}
          onChange={(e) => setData({...data, max: parseInt(e.target.value) || 100})}
          className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>
      <button
        onClick={() => onAdd(data)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Add Alignment Requirement
      </button>
    </div>
  );
};

const PersonalityForm = ({ onAdd }) => {
  const [data, setData] = useState({ trait: '', operator: '≥', value: 0.5 });
  const personalityTraits = [
    'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism',
    'courage', 'loyalty', 'honesty', 'ambition', 'compassion'
  ];
  
  return (
    <div className="grid grid-cols-3 gap-3">
      <select
        value={data.trait}
        onChange={(e) => setData({...data, trait: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      >
        <option value="">Select trait</option>
        {personalityTraits.map(trait => (
          <option key={trait} value={trait}>{trait}</option>
        ))}
      </select>
      <select
        value={data.operator}
        onChange={(e) => setData({...data, operator: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      >
        <option value="≥">≥</option>
        <option value="≤">≤</option>
      </select>
      <input
        type="number"
        step="0.1"
        min="0"
        max="1"
        value={data.value}
        onChange={(e) => setData({...data, value: parseFloat(e.target.value) || 0})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <button
        onClick={() => data.trait && onAdd(data)}
        className="col-span-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Add Personality Requirement
      </button>
    </div>
  );
};

// Effect editor component
const EffectEditor = ({ effects, onChange }) => {
  const [activeType, setActiveType] = useState('attribute');

  const handleAddEffect = (type, data) => {
    const newEffect = {
      id: Date.now(),
      type,
      ...data
    };
    onChange([...effects, newEffect]);
  };

  const handleRemoveEffect = (id) => {
    onChange(effects.filter(e => e.id !== id));
  };

  const renderEffectForm = () => {
    switch (activeType) {
      case 'attribute':
        return <AttributeEffectForm onAdd={(data) => handleAddEffect('attribute', data)} />;
      case 'relationship':
        return <RelationshipEffectForm onAdd={(data) => handleAddEffect('relationship', data)} />;
      case 'quest':
        return <QuestEffectForm onAdd={(data) => handleAddEffect('quest', data)} />;
      case 'item':
        return <ItemEffectForm onAdd={(data) => handleAddEffect('item', data)} />;
      case 'influence':
        return <InfluenceEffectForm onAdd={(data) => handleAddEffect('influence', data)} />;
      case 'prestige':
        return <PrestigeEffectForm onAdd={(data) => handleAddEffect('prestige', data)} />;
      case 'alignment':
        return <AlignmentEffectForm onAdd={(data) => handleAddEffect('alignment', data)} />;
      case 'consciousness':
        return <ConsciousnessEffectForm onAdd={(data) => handleAddEffect('consciousness', data)} />;
      case 'memory':
        return <MemoryEffectForm onAdd={(data) => handleAddEffect('memory', data)} />;
      case 'trigger':
        return <TriggerEffectForm onAdd={(data) => handleAddEffect('trigger', data)} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing effects */}
      {effects.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Current Effects</h4>
          {effects.map(effect => (
            <EffectCard
              key={effect.id}
              effect={effect}
              onRemove={() => handleRemoveEffect(effect.id)}
            />
          ))}
        </div>
      )}

      {/* Add new effect */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <h4 className="font-medium mb-3">Add Effect</h4>
        
        {/* Type selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {EFFECT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`
                px-3 py-1 rounded-lg text-sm font-medium transition-colors
                ${activeType === type.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              <span className="mr-1">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Type-specific form */}
        {renderEffectForm()}
      </div>
    </div>
  );
};

// Effect card component
const EffectCard = ({ effect, onRemove }) => {
  const getEffectDescription = () => {
    switch (effect.type) {
      case 'attribute':
        return `${effect.attribute} ${effect.modifier >= 0 ? '+' : ''}${effect.modifier}`;
      case 'relationship':
        return `Relationship with ${effect.targetId} ${effect.change >= 0 ? '+' : ''}${effect.change}`;
      case 'quest':
        return `Quest "${effect.questId}" → ${effect.action}`;
      case 'item':
        return `${effect.action} ${effect.quantity}× ${effect.itemId}`;
      case 'influence':
        return `${effect.faction} influence ${effect.change >= 0 ? '+' : ''}${effect.change}`;
      case 'prestige':
        return `Prestige ${effect.change >= 0 ? '+' : ''}${effect.change}`;
      case 'alignment':
        return `${effect.axis}: ${effect.shift >= 0 ? '+' : ''}${effect.shift}`;
      case 'consciousness':
        return `Consciousness: ${effect.aspect} ${effect.change}`;
      case 'memory':
        return `Create memory: "${effect.description}"`;
      case 'trigger':
        return `Trigger: ${effect.eventId}`;
      default:
        return 'Unknown effect';
    }
  };

  const effectType = EFFECT_TYPES.find(t => t.id === effect.type);

  return (
    <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-lg">{effectType?.icon}</span>
        <span className="text-sm">{getEffectDescription()}</span>
      </div>
      <button
        onClick={onRemove}
        className="text-red-600 hover:text-red-800 ml-2"
      >
        ×
      </button>
    </div>
  );
};

// Effect forms (simplified for brevity)
const AttributeEffectForm = ({ onAdd }) => {
  const [data, setData] = useState({ attribute: 'strength', modifier: 1, permanent: false });
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <select
        value={data.attribute}
        onChange={(e) => setData({...data, attribute: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      >
        {DND_ATTRIBUTES.map(attr => (
          <option key={attr.id} value={attr.id}>{attr.label}</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Modifier"
        value={data.modifier}
        onChange={(e) => setData({...data, modifier: parseInt(e.target.value) || 0})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <label className="col-span-2 flex items-center">
        <input
          type="checkbox"
          checked={data.permanent}
          onChange={(e) => setData({...data, permanent: e.target.checked})}
          className="mr-2"
        />
        Permanent change
      </label>
      <button
        onClick={() => onAdd(data)}
        className="col-span-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Add Attribute Effect
      </button>
    </div>
  );
};

const RelationshipEffectForm = ({ onAdd }) => {
  const [data, setData] = useState({ targetId: '', change: 10 });
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <input
        type="text"
        placeholder="Character ID"
        value={data.targetId}
        onChange={(e) => setData({...data, targetId: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <input
        type="number"
        placeholder="Change"
        min="-100"
        max="100"
        value={data.change}
        onChange={(e) => setData({...data, change: parseInt(e.target.value) || 0})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <button
        onClick={() => data.targetId && onAdd(data)}
        className="col-span-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Add Relationship Effect
      </button>
    </div>
  );
};

const QuestEffectForm = ({ onAdd }) => {
  const [data, setData] = useState({ questId: '', action: 'progress' });
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <input
        type="text"
        placeholder="Quest ID"
        value={data.questId}
        onChange={(e) => setData({...data, questId: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <select
        value={data.action}
        onChange={(e) => setData({...data, action: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      >
        <option value="start">Start</option>
        <option value="progress">Progress</option>
        <option value="complete">Complete</option>
        <option value="fail">Fail</option>
      </select>
      <button
        onClick={() => data.questId && onAdd(data)}
        className="col-span-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Add Quest Effect
      </button>
    </div>
  );
};

const ItemEffectForm = ({ onAdd }) => {
  const [data, setData] = useState({ itemId: '', quantity: 1, action: 'give' });
  
  return (
    <div className="grid grid-cols-3 gap-3">
      <input
        type="text"
        placeholder="Item ID"
        value={data.itemId}
        onChange={(e) => setData({...data, itemId: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <input
        type="number"
        placeholder="Qty"
        min="1"
        value={data.quantity}
        onChange={(e) => setData({...data, quantity: parseInt(e.target.value) || 1})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <select
        value={data.action}
        onChange={(e) => setData({...data, action: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      >
        <option value="give">Give</option>
        <option value="take">Take</option>
      </select>
      <button
        onClick={() => data.itemId && onAdd(data)}
        className="col-span-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Add Item Effect
      </button>
    </div>
  );
};

const InfluenceEffectForm = ({ onAdd }) => {
  const [data, setData] = useState({ faction: '', change: 10 });
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <input
        type="text"
        placeholder="Faction"
        value={data.faction}
        onChange={(e) => setData({...data, faction: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <input
        type="number"
        placeholder="Change"
        value={data.change}
        onChange={(e) => setData({...data, change: parseInt(e.target.value) || 0})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <button
        onClick={() => data.faction && onAdd(data)}
        className="col-span-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Add Influence Effect
      </button>
    </div>
  );
};

const PrestigeEffectForm = ({ onAdd }) => {
  const [data, setData] = useState({ change: 10, scope: 'local' });
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <input
        type="number"
        placeholder="Change"
        value={data.change}
        onChange={(e) => setData({...data, change: parseInt(e.target.value) || 0})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <select
        value={data.scope}
        onChange={(e) => setData({...data, scope: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      >
        <option value="local">Local</option>
        <option value="regional">Regional</option>
        <option value="global">Global</option>
      </select>
      <button
        onClick={() => onAdd(data)}
        className="col-span-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Add Prestige Effect
      </button>
    </div>
  );
};

const AlignmentEffectForm = ({ onAdd }) => {
  const [data, setData] = useState({ axis: 'lawChaos', shift: 10 });
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <select
        value={data.axis}
        onChange={(e) => setData({...data, axis: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      >
        <option value="lawChaos">Law-Chaos</option>
        <option value="goodEvil">Good-Evil</option>
      </select>
      <input
        type="number"
        placeholder="Shift"
        min="-100"
        max="100"
        value={data.shift}
        onChange={(e) => setData({...data, shift: parseInt(e.target.value) || 0})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <button
        onClick={() => onAdd(data)}
        className="col-span-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Add Alignment Effect
      </button>
    </div>
  );
};

const ConsciousnessEffectForm = ({ onAdd }) => {
  const [data, setData] = useState({ aspect: 'coherence', change: 0.1 });
  const aspects = ['coherence', 'frequency', 'awareness', 'stability'];
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <select
        value={data.aspect}
        onChange={(e) => setData({...data, aspect: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      >
        {aspects.map(aspect => (
          <option key={aspect} value={aspect}>{aspect}</option>
        ))}
      </select>
      <input
        type="number"
        step="0.1"
        placeholder="Change"
        value={data.change}
        onChange={(e) => setData({...data, change: parseFloat(e.target.value) || 0})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <button
        onClick={() => onAdd(data)}
        className="col-span-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Add Consciousness Effect
      </button>
    </div>
  );
};

const MemoryEffectForm = ({ onAdd }) => {
  const [data, setData] = useState({ description: '', importance: 'normal', emotion: 'neutral' });
  
  return (
    <div className="space-y-3">
      <textarea
        placeholder="Memory description..."
        value={data.description}
        onChange={(e) => setData({...data, description: e.target.value})}
        rows={2}
        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          value={data.importance}
          onChange={(e) => setData({...data, importance: e.target.value})}
          className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="trivial">Trivial</option>
          <option value="normal">Normal</option>
          <option value="important">Important</option>
          <option value="core">Core</option>
        </select>
        <select
          value={data.emotion}
          onChange={(e) => setData({...data, emotion: e.target.value})}
          className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="neutral">Neutral</option>
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>
      <button
        onClick={() => data.description && onAdd(data)}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Add Memory Effect
      </button>
    </div>
  );
};

const TriggerEffectForm = ({ onAdd }) => {
  const [data, setData] = useState({ eventId: '', delay: 0 });
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <input
        type="text"
        placeholder="Event ID"
        value={data.eventId}
        onChange={(e) => setData({...data, eventId: e.target.value})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <input
        type="number"
        placeholder="Delay (ticks)"
        min="0"
        value={data.delay}
        onChange={(e) => setData({...data, delay: parseInt(e.target.value) || 0})}
        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
      />
      <button
        onClick={() => data.eventId && onAdd(data)}
        className="col-span-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Add Trigger Effect
      </button>
    </div>
  );
};

// Choice editor component
const ChoiceEditor = ({ choices, onChange }) => {
  const [editingChoice, setEditingChoice] = useState(null);

  const handleAddChoice = () => {
    const newChoice = {
      id: Date.now(),
      text: 'New Choice',
      prerequisites: [],
      effects: [],
      nextNodeId: null
    };
    onChange([...choices, newChoice]);
    setEditingChoice(newChoice.id);
  };

  const handleUpdateChoice = (id, updates) => {
    onChange(choices.map(choice => 
      choice.id === id ? { ...choice, ...updates } : choice
    ));
  };

  const handleRemoveChoice = (id) => {
    onChange(choices.filter(choice => choice.id !== id));
    if (editingChoice === id) setEditingChoice(null);
  };

  return (
    <div className="space-y-4">
      {/* Choice list */}
      <div className="space-y-2">
        {choices.map((choice, index) => (
          <div
            key={choice.id}
            className={`
              p-4 border-2 rounded-lg cursor-pointer transition-all
              ${editingChoice === choice.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
              }
            `}
            onClick={() => setEditingChoice(choice.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium">Choice {index + 1}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {choice.text}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>{choice.prerequisites.length} prerequisites</span>
                  <span>{choice.effects.length} effects</span>
                  {choice.nextNodeId && <span>→ {choice.nextNodeId}</span>}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveChoice(choice.id);
                }}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add choice button */}
      <button
        onClick={handleAddChoice}
        className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 transition-colors"
      >
        + Add Choice
      </button>

      {/* Choice editor */}
      {editingChoice && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <ChoiceDetailEditor
            choice={choices.find(c => c.id === editingChoice)}
            onUpdate={(updates) => handleUpdateChoice(editingChoice, updates)}
          />
        </div>
      )}
    </div>
  );
};

// Choice detail editor
const ChoiceDetailEditor = ({ choice, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Choice Text</label>
        <input
          type="text"
          value={choice.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Next Node ID (optional)</label>
        <input
          type="text"
          value={choice.nextNodeId || ''}
          onChange={(e) => onUpdate({ nextNodeId: e.target.value || null })}
          placeholder="Leave empty to stay at current node"
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      <div>
        <h4 className="font-medium mb-2">Prerequisites</h4>
        <PrerequisiteEditor
          prerequisites={choice.prerequisites}
          onChange={(prerequisites) => onUpdate({ prerequisites })}
        />
      </div>

      <div>
        <h4 className="font-medium mb-2">Effects</h4>
        <EffectEditor
          effects={choice.effects}
          onChange={(effects) => onUpdate({ effects })}
        />
      </div>
    </div>
  );
};

// Main InteractionEditor component
const InteractionEditor = ({ 
  initialInteraction = null, 
  onSave,
  onCancel,
  mode = 'create' // 'create' or 'edit'
}) => {
  const dispatch = useDispatch();
  
  // Form state
  const [interactionData, setInteractionData] = useState({
    id: initialInteraction?.id || `interaction_${Date.now()}`,
    name: initialInteraction?.name || '',
    description: initialInteraction?.description || '',
    category: initialInteraction?.category || 'dialogue',
    nodeId: initialInteraction?.nodeId || '',
    prerequisites: initialInteraction?.prerequisites || [],
    choices: initialInteraction?.choices || [],
    effects: initialInteraction?.effects || [],
    priority: initialInteraction?.priority || 50,
    repeatable: initialInteraction?.repeatable || false,
    cooldown: initialInteraction?.cooldown || 0,
    tags: initialInteraction?.tags || [],
    metadata: initialInteraction?.metadata || {}
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  // Validation
  const validateInteraction = useCallback(() => {
    const newErrors = {};
    
    if (!interactionData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!interactionData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (interactionData.choices.length === 0) {
      newErrors.choices = 'At least one choice is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [interactionData]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!validateInteraction()) {
      return;
    }

    const action = mode === 'create' 
      ? createInteractionTemplate(interactionData)
      : updateInteractionTemplate(interactionData);
    
    dispatch(action);
    
    if (onSave) {
      onSave(interactionData);
    }
  }, [interactionData, mode, dispatch, onSave, validateInteraction]);

  // Tabs configuration
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'prerequisites', label: 'Prerequisites', icon: '🔒' },
    { id: 'choices', label: 'Choices', icon: '🔀' },
    { id: 'effects', label: 'Global Effects', icon: '⚡' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {mode === 'create' ? 'Create Interaction Template' : 'Edit Interaction Template'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Define interactive encounters and decision points
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Interaction ID
                </label>
                <input
                  type="text"
                  value={interactionData.id}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Node ID
                </label>
                <input
                  type="text"
                  value={interactionData.nodeId}
                  onChange={(e) => setInteractionData({...interactionData, nodeId: e.target.value})}
                  placeholder="Node where this interaction occurs"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={interactionData.name}
                onChange={(e) => setInteractionData({...interactionData, name: e.target.value})}
                className={`
                  w-full px-4 py-2 border rounded-lg dark:bg-gray-800
                  ${errors.name ? 'border-red-500' : 'dark:border-gray-600'}
                `}
                placeholder="Enter interaction name..."
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
                value={interactionData.description}
                onChange={(e) => setInteractionData({...interactionData, description: e.target.value})}
                rows={4}
                className={`
                  w-full px-4 py-2 border rounded-lg dark:bg-gray-800
                  ${errors.description ? 'border-red-500' : 'dark:border-gray-600'}
                `}
                placeholder="Describe what happens in this interaction..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INTERACTION_CATEGORIES.map(cat => {
                  // Create proper class names for each color
                  const getColorClasses = (color) => {
                    switch (color) {
                      case 'blue':
                        return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
                      case 'green':
                        return 'border-green-500 bg-green-50 dark:bg-green-950';
                      case 'red':
                        return 'border-red-500 bg-red-50 dark:bg-red-950';
                      case 'purple':
                        return 'border-purple-500 bg-purple-50 dark:bg-purple-950';
                      case 'yellow':
                        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
                      case 'orange':
                        return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
                      case 'indigo':
                        return 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950';
                      case 'pink':
                        return 'border-pink-500 bg-pink-50 dark:bg-pink-950';
                      default:
                        return 'border-gray-500 bg-gray-50 dark:bg-gray-950';
                    }
                  };

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setInteractionData({...interactionData, category: cat.id})}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${interactionData.category === cat.id
                          ? getColorClasses(cat.color)
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-sm font-medium">{cat.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tags
              </label>
              <input
                type="text"
                placeholder="Add tags separated by commas..."
                value={interactionData.tags.join(', ')}
                onChange={(e) => setInteractionData({
                  ...interactionData, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
          </div>
        )}

        {/* Prerequisites Tab */}
        {activeTab === 'prerequisites' && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Define conditions that must be met for this interaction to be available
            </p>
            <PrerequisiteEditor
              prerequisites={interactionData.prerequisites}
              onChange={(prerequisites) => setInteractionData({...interactionData, prerequisites})}
            />
          </div>
        )}

        {/* Choices Tab */}
        {activeTab === 'choices' && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Define the choices available to characters in this interaction
            </p>
            {errors.choices && (
              <p className="text-red-500 text-sm mb-4">{errors.choices}</p>
            )}
            <ChoiceEditor
              choices={interactionData.choices}
              onChange={(choices) => setInteractionData({...interactionData, choices})}
            />
          </div>
        )}

        {/* Global Effects Tab */}
        {activeTab === 'effects' && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Define effects that apply when this interaction is triggered (before any choice is made)
            </p>
            <EffectEditor
              effects={interactionData.effects}
              onChange={(effects) => setInteractionData({...interactionData, effects})}
            />
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Priority (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={interactionData.priority}
                  onChange={(e) => setInteractionData({...interactionData, priority: parseInt(e.target.value) || 50})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher priority interactions are selected first by NPCs
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Cooldown (ticks)
                </label>
                <input
                  type="number"
                  min="0"
                  value={interactionData.cooldown}
                  onChange={(e) => setInteractionData({...interactionData, cooldown: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Time before this interaction can be triggered again
                </p>
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={interactionData.repeatable}
                  onChange={(e) => setInteractionData({...interactionData, repeatable: e.target.checked})}
                  className="mr-2"
                />
                <span className="font-medium">Repeatable</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Can this interaction be triggered multiple times?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Custom Metadata (JSON)
              </label>
              <textarea
                value={JSON.stringify(interactionData.metadata, null, 2)}
                onChange={(e) => {
                  try {
                    const metadata = JSON.parse(e.target.value);
                    setInteractionData({...interactionData, metadata});
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={6}
                className="w-full px-4 py-2 border rounded-lg font-mono text-sm dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-3">Preview</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Category:</span> {interactionData.category}
          </div>
          <div>
            <span className="font-medium">Priority:</span> {interactionData.priority}
          </div>
          <div>
            <span className="font-medium">Prerequisites:</span> {interactionData.prerequisites.length}
          </div>
          <div>
            <span className="font-medium">Choices:</span> {interactionData.choices.length}
          </div>
          <div>
            <span className="font-medium">Global Effects:</span> {interactionData.effects.length}
          </div>
          <div>
            <span className="font-medium">Repeatable:</span> {interactionData.repeatable ? 'Yes' : 'No'}
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
          {mode === 'create' ? 'Create Interaction' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default InteractionEditor;