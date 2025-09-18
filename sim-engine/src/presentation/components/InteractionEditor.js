import React, { useState, useCallback, useMemo } from 'react';
import { Save, Upload } from 'lucide-react';
import useTemplates from '../hooks/useTemplates';
import TemplateLibraryPanel from './TemplateLibraryPanel';
import PlaceholderEditor from './text-templating/PlaceholderEditor';
import DialoguePatterns from './text-templating/DialoguePatterns';
import EditorContextService from '../../application/services/EditorContextService';
import BulkControls from './BulkControls';
import { useSimulationContext } from '../contexts/SimulationContext';

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
          <h4 className="font-medium text-white">Current Prerequisites</h4>
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
      <div className="border-2 border-dashed border-white/20 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">Add Prerequisite</h4>
        
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
                  : 'bg-white/10 hover:bg-white/20 text-gray-300'
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

const QuestEffectForm = ({ onAdd }) => {
  const [data, setData] = useState({ questId: '', action: 'progress' });
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <input
        type="text"
        placeholder="Quest ID"
        value={data.questId}
        onChange={(e) => setData({...data, questId: e.target.value})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <select
        value={data.action}
        onChange={(e) => setData({...data, action: e.target.value})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
      >
        <option value="start" className="bg-gray-800">Start</option>
        <option value="progress" className="bg-gray-800">Progress</option>
        <option value="complete" className="bg-gray-800">Complete</option>
        <option value="fail" className="bg-gray-800">Fail</option>
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
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <input
        type="number"
        placeholder="Qty"
        min="1"
        value={data.quantity}
        onChange={(e) => setData({...data, quantity: parseInt(e.target.value) || 1})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <select
        value={data.action}
        onChange={(e) => setData({...data, action: e.target.value})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
      >
        <option value="give" className="bg-gray-800">Give</option>
        <option value="take" className="bg-gray-800">Take</option>
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
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <input
        type="number"
        placeholder="Change"
        value={data.change}
        onChange={(e) => setData({...data, change: parseInt(e.target.value) || 0})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
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
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <select
        value={data.scope}
        onChange={(e) => setData({...data, scope: e.target.value})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
      >
        <option value="local" className="bg-gray-800">Local</option>
        <option value="regional" className="bg-gray-800">Regional</option>
        <option value="global" className="bg-gray-800">Global</option>
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
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
      >
        <option value="lawChaos" className="bg-gray-800">Law-Chaos</option>
        <option value="goodEvil" className="bg-gray-800">Good-Evil</option>
      </select>
      <input
        type="number"
        placeholder="Shift"
        min="-100"
        max="100"
        value={data.shift}
        onChange={(e) => setData({...data, shift: parseInt(e.target.value) || 0})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
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
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
      >
        {aspects.map(aspect => (
          <option key={aspect} value={aspect} className="bg-gray-800">{aspect}</option>
        ))}
      </select>
      <input
        type="number"
        step="0.1"
        placeholder="Change"
        value={data.change}
        onChange={(e) => setData({...data, change: parseFloat(e.target.value) || 0})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
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
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          value={data.importance}
          onChange={(e) => setData({...data, importance: e.target.value})}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
        >
          <option value="trivial" className="bg-gray-800">Trivial</option>
          <option value="normal" className="bg-gray-800">Normal</option>
          <option value="important" className="bg-gray-800">Important</option>
          <option value="core" className="bg-gray-800">Core</option>
        </select>
        <select
          value={data.emotion}
          onChange={(e) => setData({...data, emotion: e.target.value})}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
        >
          <option value="neutral" className="bg-gray-800">Neutral</option>
          <option value="positive" className="bg-gray-800">Positive</option>
          <option value="negative" className="bg-gray-800">Negative</option>
          <option value="mixed" className="bg-gray-800">Mixed</option>
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
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <input
        type="number"
        placeholder="Delay (ticks)"
        min="0"
        value={data.delay}
        onChange={(e) => setData({...data, delay: parseInt(e.target.value) || 0})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
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
const ChoiceEditor = ({ choices, onChange, context = {} }) => {
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
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/20 hover:border-white/40 bg-white/5'
              }
            `}
            onClick={() => setEditingChoice(choice.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-white">Choice {index + 1}</h4>
                <p className="text-sm text-gray-400 mt-1">
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
                className="text-red-400 hover:text-red-300"
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
        className="w-full p-4 border-2 border-dashed border-white/20 rounded-lg hover:border-white/40 transition-colors text-gray-400"
      >
        + Add Choice
      </button>

      {/* Choice editor */}
      {editingChoice && (
        <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
          <ChoiceDetailEditor
            choice={choices.find(c => c.id === editingChoice)}
            onUpdate={(updates) => handleUpdateChoice(editingChoice, updates)}
            context={context}
          />
        </div>
      )}
    </div>
  );
};

// Choice detail editor with text templating integration
const ChoiceDetailEditor = ({ choice, onUpdate, context = {} }) => {
  const [showDialoguePatterns, setShowDialoguePatterns] = useState(false);
  const [selectedPatternCategory, setSelectedPatternCategory] = useState('greetings');

  // Handle dialogue pattern insertion that appends to existing text
  const handlePatternInsert = (patternTemplate) => {
    const currentText = choice.text || '';
    let newText;
    
    if (currentText.trim()) {
      // If there's existing text, append with a space
      newText = `${currentText.trim()} ${patternTemplate}`;
    } else {
      // If no existing text, just use the pattern
      newText = patternTemplate;
    }
    
    onUpdate({ text: newText });
  };

  // Get contextual pattern categories based on interaction type
  const getRelevantCategories = () => {
    const baseCategories = ['greetings', 'farewells', 'questions', 'reactions'];
    
    // Add category-specific patterns based on interaction category
    if (context.interactionCategory) {
      switch (context.interactionCategory) {
        case 'dialogue':
          return ['greetings', 'questions', 'reactions', 'farewells'];
        case 'trade':
          return ['greetings', 'questions', 'reactions'];
        case 'social':
          return ['greetings', 'reactions', 'questions', 'farewells'];
        default:
          return baseCategories;
      }
    }
    
    return baseCategories;
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-white">Choice Text</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDialoguePatterns(!showDialoguePatterns)}
              className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                showDialoguePatterns 
                  ? 'bg-blue-600 text-white' 
                  : 'text-blue-400 hover:text-blue-300 hover:bg-blue-600/20'
              }`}
            >
              💬 Patterns
            </button>
          </div>
        </div>
        
        <PlaceholderEditor
          value={choice.text || ''}
          onChange={(text) => onUpdate({ text })}
          context={context}
          placeholder="Enter choice text with {{placeholders}}..."
          showPreview={true}
          showSuggestions={true}
          rows={3}
          className="mb-2"
        />

        {/* Enhanced Dialogue Patterns Panel */}
        {showDialoguePatterns && (
          <div className="mt-2 border border-white/20 rounded-lg bg-white/5">
            <div className="p-3 border-b border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Dialogue Patterns</span>
                <select
                  value={selectedPatternCategory}
                  onChange={(e) => setSelectedPatternCategory(e.target.value)}
                  className="text-xs bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                >
                  {getRelevantCategories().map(category => (
                    <option key={category} value={category} className="bg-gray-800">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-400">
                Click a pattern to append it to your choice text
              </p>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              <DialoguePatterns
                onInsert={handlePatternInsert}
                context={context}
                categories={[selectedPatternCategory]}
                compact={true}
                showSearch={false}
                className="border-0 bg-transparent"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Next Node ID (optional)</label>
        <input
          type="text"
          value={choice.nextNodeId || ''}
          onChange={(e) => onUpdate({ nextNodeId: e.target.value || null })}
          placeholder="Leave empty to stay at current node"
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
        />
      </div>

      <div>
        <h4 className="font-medium text-white mb-2">Prerequisites</h4>
        <PrerequisiteEditor
          prerequisites={choice.prerequisites}
          onChange={(prerequisites) => onUpdate({ prerequisites })}
        />
      </div>

      <div>
        <h4 className="font-medium text-white mb-2">Effects</h4>
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
  onChange, // For real-time updates to parent component
  mode = 'create', // 'create' or 'edit'
  // Context props for text templating
  character = null,
  node = null,
  world = null,
  // Additional context from parent components
  editorContext = {}
}) => {
  const dispatch = useDispatch();
  const { worldState } = useSimulationContext();
  
  // Form state
  const [interactionData, setInteractionData] = useState({
    id: initialInteraction?.id || (mode === 'create' ? '' : `interaction_${Date.now()}`),
    name: initialInteraction?.name || '',
    description: initialInteraction?.description || '',
    category: initialInteraction?.category || 'dialogue',
    type: initialInteraction?.type || 'content', // 'system' or 'content'
    nodeId: initialInteraction?.nodeId || '',
    assignedCharacters: initialInteraction?.assignedCharacters || [],
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
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [bulkOptions, setBulkOptions] = useState({ count: 5, distribution: 'random' });
  const [selectedInteractions, setSelectedInteractions] = useState([]);
  
  const { saveTemplate, loadTemplate } = useTemplates();

  // Detect context for text templating with enhanced interaction-specific context
  const detectedContext = useMemo(() => {
    const baseContext = EditorContextService.detectContext('interaction', {
      character,
      node,
      world,
      interaction: interactionData,
      ...editorContext
    });

    // Add interaction-specific context enhancements
    const enhancedContext = {
      ...baseContext,
      // Add interaction category-specific suggestions
      interactionCategory: interactionData.category,
      // Add available D&D attributes for checks
      availableAttributes: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'],
      // Add personality traits for conditional logic
      personalityTraits: ['aggression', 'curiosity', 'empathy'],
      // Add consciousness aspects
      consciousnessAspects: ['frequency', 'coherence'],
      // Add relationship context
      relationshipLevels: ['hostile', 'unfriendly', 'neutral', 'friendly', 'allied']
    };

    return enhancedContext;
  }, [character, node, world, interactionData, editorContext]);

  // Notify parent of changes
  const handleDataChange = useCallback((updates) => {
    const newData = { ...interactionData, ...updates };
    setInteractionData(newData);
    if (onChange) {
      onChange(newData);
    }
  }, [interactionData, onChange]);

  // Validation
  const validateInteraction = useCallback(() => {
    const newErrors = {};
    
    if (mode === 'create' && !interactionData.id.trim()) {
      newErrors.id = 'ID is required when creating a new interaction';
    }
    
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
  }, [interactionData, mode]);

  // Handle save
  const handleSave = useCallback(() => {
    // Auto-generate ID if empty in create mode
    let finalData = { ...interactionData };
    if (mode === 'create' && !finalData.id.trim()) {
      finalData.id = `interaction_${Date.now()}`;
    }
    
    if (!validateInteraction()) {
      return;
    }

    const action = mode === 'create' 
      ? createInteractionTemplate(finalData)
      : updateInteractionTemplate(finalData);
    
    dispatch(action);
    
    if (onSave) {
      onSave(finalData);
    }
  }, [interactionData, mode, dispatch, onSave, validateInteraction]);

  // Template functions
  const handleSaveAsTemplate = useCallback(async () => {
    if (!validateInteraction()) {
      return;
    }

    const templateName = prompt('Enter template name:', `${interactionData.name} Template`);
    if (!templateName) return;

    const templateDescription = prompt('Enter template description (optional):', 
      `Template based on ${interactionData.name}`);

    try {
      const templateData = {
        ...interactionData,
        name: templateName,
        description: templateDescription || `Template based on ${interactionData.name}`,
        metadata: {
          ...interactionData.metadata,
          isTemplate: true,
          originalInteractionId: interactionData.id,
          category: interactionData.category || 'general',
          difficulty: 'intermediate',
          author: 'User',
          version: '1.0.0'
        }
      };

      await saveTemplate('interactions', templateData);
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert(`Failed to save template: ${error.message}`);
    }
  }, [interactionData, validateInteraction, saveTemplate]);

  const handleLoadFromTemplate = useCallback((template) => {
    try {
      const instance = loadTemplate('interactions', template.id, {
        name: `${template.name} Instance`,
        id: `interaction_${Date.now()}`
      });

      setInteractionData(instance);
      if (onChange) {
        onChange(instance);
      }
      setShowTemplateLibrary(false);
    } catch (error) {
      console.error('Failed to load template:', error);
      alert(`Failed to load template: ${error.message}`);
    }
  }, [loadTemplate, onChange]);

  // Tabs configuration
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'characters', label: 'Characters', icon: '👥' },
    { id: 'prerequisites', label: 'Prerequisites', icon: '🔒' },
    { id: 'choices', label: 'Choices', icon: '🔀' },
    { id: 'effects', label: 'Global Effects', icon: '⚡' },
    { id: 'bulk', label: 'Bulk Operations', icon: '📦' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          {mode === 'create' ? 'Create Interaction Template' : 'Edit Interaction Template'}
        </h2>
        <p className="text-gray-400 mt-1">
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
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Interaction ID {mode === 'create' && <span className="text-red-500">*</span>}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={interactionData.id}
                    onChange={(e) => handleDataChange({ id: e.target.value })}
                    disabled={mode === 'edit'}
                    className={`flex-1 px-4 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 ${
                      mode === 'edit' 
                        ? 'border-gray-500 text-gray-400' 
                        : errors.id 
                          ? 'border-red-500' 
                          : 'border-white/20'
                    }`}
                    placeholder={mode === 'create' ? 'Enter custom ID or leave empty for auto-generation' : ''}
                  />
                  {mode === 'create' && (
                    <button
                      onClick={() => handleDataChange({ id: `interaction_${Date.now()}` })}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm whitespace-nowrap"
                      title="Generate a new auto ID"
                    >
                      🎲 Auto
                    </button>
                  )}
                </div>
                {mode === 'create' && (
                  <p className="text-xs text-gray-400 mt-1">
                    Choose a memorable ID or leave empty to auto-generate one
                  </p>
                )}
                {errors.id && (
                  <p className="text-red-500 text-sm mt-1">{errors.id}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={interactionData.name}
                onChange={(e) => handleDataChange({ name: e.target.value })}
                className={`
                  w-full px-4 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400
                  ${errors.name ? 'border-red-500' : 'border-white/20'}
                `}
                placeholder="Enter interaction name..."
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white">
                  Description <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={() => setShowTemplateLibrary(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  📚 Templates
                </button>
              </div>
              <PlaceholderEditor
                value={interactionData.description}
                onChange={(description) => handleDataChange({ description })}
                context={detectedContext}
                placeholder="Describe what happens in this interaction..."
                showPreview={true}
                showSuggestions={true}
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Interaction Type
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDataChange({ type: 'system' })}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    interactionData.type === 'system'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ⚙️ System
                </button>
                <button
                  onClick={() => handleDataChange({ type: 'content' })}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    interactionData.type === 'content'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📝 Content
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                System interactions are core engine behaviors. Content interactions are user-created.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INTERACTION_CATEGORIES.map(cat => {
                  // Create proper class names for each color
                  const getColorClasses = (color) => {
                    switch (color) {
                      case 'blue':
                        return 'border-blue-500 bg-blue-500/20';
                      case 'green':
                        return 'border-green-500 bg-green-500/20';
                      case 'red':
                        return 'border-red-500 bg-red-500/20';
                      case 'purple':
                        return 'border-purple-500 bg-purple-500/20';
                      case 'yellow':
                        return 'border-yellow-500 bg-yellow-500/20';
                      case 'orange':
                        return 'border-orange-500 bg-orange-500/20';
                      case 'indigo':
                        return 'border-indigo-500 bg-indigo-500/20';
                      case 'pink':
                        return 'border-pink-500 bg-pink-500/20';
                      default:
                        return 'border-gray-500 bg-gray-500/20';
                    }
                  };

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleDataChange({ category: cat.id })}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${interactionData.category === cat.id
                          ? getColorClasses(cat.color)
                          : 'border-white/20 hover:border-white/40 bg-white/5'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-sm font-medium text-white">{cat.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tags
              </label>
              <input
                type="text"
                placeholder="Add tags separated by commas..."
                value={interactionData.tags.join(', ')}
                onChange={(e) => handleDataChange({
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
          </div>
        )}

        {/* Characters Tab */}
        {activeTab === 'characters' && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Assign this interaction directly to specific characters instead of nodes
            </p>
            <CharacterAssignmentPanel
              assignedCharacters={interactionData.assignedCharacters}
              onAssign={(characterId) => handleDataChange({
                assignedCharacters: [...interactionData.assignedCharacters, characterId]
              })}
              onUnassign={(characterId) => handleDataChange({
                assignedCharacters: interactionData.assignedCharacters.filter(id => id !== characterId)
              })}
              availableCharacters={worldState?.characters ? Array.from(worldState.characters.values()).map(char => ({
                id: char.id,
                name: char.name,
                race: char.race || 'Unknown',
                role: char.role || 'Unknown'
              })) : []}
            />
          </div>
        )}

        {/* Prerequisites Tab */}
        {activeTab === 'prerequisites' && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Define conditions that must be met for this interaction to be available
            </p>
            <PrerequisiteEditor
              prerequisites={interactionData.prerequisites}
              onChange={(prerequisites) => handleDataChange({ prerequisites })}
            />
          </div>
        )}

        {/* Choices Tab */}
        {activeTab === 'choices' && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Define the choices available to characters in this interaction
            </p>
            {errors.choices && (
              <p className="text-red-500 text-sm mb-4">{errors.choices}</p>
            )}
            <ChoiceEditor
              choices={interactionData.choices}
              onChange={(choices) => handleDataChange({ choices })}
              context={detectedContext}
            />
          </div>
        )}

        {/* Global Effects Tab */}
        {activeTab === 'effects' && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Define effects that apply when this interaction is triggered (before any choice is made)
            </p>
            <EffectEditor
              effects={interactionData.effects}
              onChange={(effects) => handleDataChange({ effects })}
            />
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Priority (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={interactionData.priority}
                  onChange={(e) => handleDataChange({ priority: parseInt(e.target.value) || 50 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Higher priority interactions are selected first by NPCs
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Cooldown (ticks)
                </label>
                <input
                  type="number"
                  min="0"
                  value={interactionData.cooldown}
                  onChange={(e) => handleDataChange({ cooldown: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Time before this interaction can be triggered again
                </p>
              </div>
            </div>

            <div>
              <label className="flex items-center text-white">
                <input
                  type="checkbox"
                  checked={interactionData.repeatable}
                  onChange={(e) => handleDataChange({ repeatable: e.target.checked })}
                  className="mr-2"
                />
                <span className="font-medium">Repeatable</span>
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Can this interaction be triggered multiple times?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Custom Metadata (JSON)
              </label>
              <textarea
                value={JSON.stringify(interactionData.metadata, null, 2)}
                onChange={(e) => {
                  try {
                    const metadata = JSON.parse(e.target.value);
                    handleDataChange({ metadata });
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={6}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg font-mono text-sm text-white"
              />
            </div>
          </div>
        )}

        {/* Bulk Operations Tab */}
        {activeTab === 'bulk' && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Create multiple interactions at once with batch operations
            </p>
            <BulkControls
              title="Bulk Interaction Operations"
              itemType="interaction"
              itemTypePlural="interactions"
              bulkOptions={bulkOptions}
              onBulkOptionsChange={setBulkOptions}
              selectedItems={selectedInteractions}
              totalItems={1} // Current interaction being edited
              onSelectAll={() => setSelectedInteractions([interactionData.id])}
              onDeselectAll={() => setSelectedInteractions([])}
              onPreview={() => {
                console.log('Preview bulk interactions:', bulkOptions);
                // TODO: Implement preview functionality
              }}
              onGenerate={() => {
                console.log('Generate bulk interactions:', bulkOptions);
                // TODO: Implement bulk generation
              }}
              onDuplicate={(items) => {
                console.log('Duplicate interactions:', items);
                // TODO: Implement duplication
              }}
              onDeleteSelected={(items) => {
                console.log('Delete selected interactions:', items);
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
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-300">Type:</span>{' '}
            <span className={`px-2 py-1 rounded text-xs ${
              interactionData.type === 'system' 
                ? 'bg-red-500/20 text-red-300' 
                : 'bg-purple-500/20 text-purple-300'
            }`}>
              {interactionData.type}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Category:</span>{' '}
            <span className="text-white">{interactionData.category}</span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Priority:</span>{' '}
            <span className="text-white">{interactionData.priority}</span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Assigned Characters:</span>{' '}
            <span className="text-white">{interactionData.assignedCharacters.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Prerequisites:</span>{' '}
            <span className="text-white">{interactionData.prerequisites.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Choices:</span>{' '}
            <span className="text-white">{interactionData.choices.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Global Effects:</span>{' '}
            <span className="text-white">{interactionData.effects.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Repeatable:</span>{' '}
            <span className="text-white">{interactionData.repeatable ? 'Yes' : 'No'}</span>
          </div>
        </div>
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
            {mode === 'create' ? 'Create Interaction' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-white/20 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-white/20 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Interaction Templates</h3>
              <button
                onClick={() => setShowTemplateLibrary(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              <TemplateLibraryPanel
                selectedType="interactions"
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
    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20">
      <span className="text-sm text-white">{getPrerequisiteDescription()}</span>
      <button
        onClick={onRemove}
        className="text-red-400 hover:text-red-300 ml-2"
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
        <label className="text-sm font-medium text-white">Attribute</label>
        <select
          value={data.attribute}
          onChange={(e) => setData({...data, attribute: e.target.value})}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
        >
          {DND_ATTRIBUTES.map(attr => (
            <option key={attr.id} value={attr.id} className="bg-gray-800">
              {attr.label} ({attr.abbr})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-white">DC</label>
        <input
          type="number"
          min="1"
          max="30"
          value={data.difficulty}
          onChange={(e) => setData({...data, difficulty: parseInt(e.target.value) || 10})}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
        />
      </div>
      <div className="col-span-2 flex gap-4">
        <label className="flex items-center text-white">
          <input
            type="checkbox"
            checked={data.advantage}
            onChange={(e) => setData({...data, advantage: e.target.checked, disadvantage: false})}
            className="mr-2"
          />
          Advantage
        </label>
        <label className="flex items-center text-white">
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
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <input
        type="number"
        placeholder="Min level"
        min="1"
        value={data.minLevel}
        onChange={(e) => setData({...data, minLevel: parseInt(e.target.value) || 1})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
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
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <select
        value={data.state}
        onChange={(e) => setData({...data, state: e.target.value})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
      >
        <option value="not_started" className="bg-gray-800">Not Started</option>
        <option value="active" className="bg-gray-800">Active</option>
        <option value="completed" className="bg-gray-800">Completed</option>
        <option value="failed" className="bg-gray-800">Failed</option>
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
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <select
        value={data.operator}
        onChange={(e) => setData({...data, operator: e.target.value})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
      >
        <option value="≥" className="bg-gray-800">≥</option>
        <option value="≤" className="bg-gray-800">≤</option>
        <option value="=" className="bg-gray-800">=</option>
      </select>
      <input
        type="number"
        min="-100"
        max="100"
        value={data.value}
        onChange={(e) => setData({...data, value: parseInt(e.target.value) || 0})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
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
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <input
        type="number"
        placeholder="Quantity"
        min="1"
        value={data.quantity}
        onChange={(e) => setData({...data, quantity: parseInt(e.target.value) || 1})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
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
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <input
        type="number"
        placeholder="Min influence"
        min="0"
        value={data.minValue}
        onChange={(e) => setData({...data, minValue: parseInt(e.target.value) || 0})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
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
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
      >
        <option value="lawChaos" className="bg-gray-800">Law-Chaos</option>
        <option value="goodEvil" className="bg-gray-800">Good-Evil</option>
      </select>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          placeholder="Min"
          min="-100"
          max="100"
          value={data.min}
          onChange={(e) => setData({...data, min: parseInt(e.target.value) || -100})}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
        />
        <input
          type="number"
          placeholder="Max"
          min="-100"
          max="100"
          value={data.max}
          onChange={(e) => setData({...data, max: parseInt(e.target.value) || 100})}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
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
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
      >
        <option value="" className="bg-gray-800">Select trait</option>
        {personalityTraits.map(trait => (
          <option key={trait} value={trait} className="bg-gray-800">{trait}</option>
        ))}
      </select>
      <select
        value={data.operator}
        onChange={(e) => setData({...data, operator: e.target.value})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
      >
        <option value="≥" className="bg-gray-800">≥</option>
        <option value="≤" className="bg-gray-800">≤</option>
      </select>
      <input
        type="number"
        step="0.1"
        min="0"
        max="1"
        value={data.value}
        onChange={(e) => setData({...data, value: parseFloat(e.target.value) || 0})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
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
          <h4 className="font-medium text-white">Current Effects</h4>
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
      <div className="border-2 border-dashed border-white/20 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">Add Effect</h4>
        
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
                  : 'bg-white/10 hover:bg-white/20 text-gray-300'
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
    <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20">
      <div className="flex items-center gap-2">
        <span className="text-lg">{effectType?.icon}</span>
        <span className="text-sm text-white">{getEffectDescription()}</span>
      </div>
      <button
        onClick={onRemove}
        className="text-red-400 hover:text-red-300 ml-2"
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
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
      >
        {DND_ATTRIBUTES.map(attr => (
          <option key={attr.id} value={attr.id} className="bg-gray-800">{attr.label}</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Modifier"
        value={data.modifier}
        onChange={(e) => setData({...data, modifier: parseInt(e.target.value) || 0})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <label className="col-span-2 flex items-center text-white">
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
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
      />
      <input
        type="number"
        placeholder="Change"
        min="-100"
        max="100"
        value={data.change}
        onChange={(e) => setData({...data, change: parseInt(e.target.value) || 0})}
        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
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

// Character Assignment Panel Component
const CharacterAssignmentPanel = ({ assignedCharacters, onAssign, onUnassign, availableCharacters: propCharacters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailable, setShowAvailable] = useState(true);

  // Use provided characters or fallback to mock data
  const availableCharacters = useMemo(() => {
    if (propCharacters && Array.isArray(propCharacters)) {
      return propCharacters;
    }

    // Fallback mock data for development/testing
    return [
      { id: 'char_hero_001', name: 'Elara Voss', race: 'Human', role: 'Protagonist' },
      { id: 'char_guard_001', name: 'Marcus Ironfist', race: 'Dwarf', role: 'Guard Captain' },
      { id: 'char_merchant_001', name: 'Lira Goldweaver', race: 'Elf', role: 'Merchant' },
      { id: 'char_mage_001', name: 'Thorne Shadowcaster', race: 'Human', role: 'Court Mage' },
      { id: 'char_commoner_001', name: 'Bryn Meadowfarmer', race: 'Halfling', role: 'Farmer' },
      { id: 'char_noble_001', name: 'Lord Cedric Valtorius', race: 'Human', role: 'Noble' }
    ];
  }, [propCharacters]);

  const filteredCharacters = useMemo(() => {
    return availableCharacters.filter(character =>
      !assignedCharacters.includes(character.id) &&
      (character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       character.race.toLowerCase().includes(searchTerm.toLowerCase()) ||
       character.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [availableCharacters, assignedCharacters, searchTerm]);

  const assignedCharacterObjects = availableCharacters.filter(char =>
    assignedCharacters.includes(char.id)
  );

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search characters by name, race, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
          />
        </div>
        <button
          onClick={() => setShowAvailable(!showAvailable)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showAvailable
              ? 'bg-blue-600 text-white'
              : 'bg-white/10 hover:bg-white/20 text-gray-300'
          }`}
        >
          {showAvailable ? 'Show Assigned' : 'Show Available'}
        </button>
      </div>

      {/* Character Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Available Characters */}
        {showAvailable && (
          <div className="space-y-2">
            <h4 className="font-medium text-white">Available Characters</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredCharacters.length === 0 ? (
                <p className="text-gray-400 text-sm p-4 text-center">
                  {searchTerm ? 'No characters match your search' : 'All characters are already assigned'}
                </p>
              ) : (
                filteredCharacters.map(character => (
                  <div
                    key={character.id}
                    className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-white">{character.name}</div>
                      <div className="text-sm text-gray-400">
                        {character.race} • {character.role}
                      </div>
                    </div>
                    <button
                      onClick={() => onAssign(character.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Assign
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Assigned Characters */}
        <div className="space-y-2">
          <h4 className="font-medium text-white">Assigned Characters ({assignedCharacters.length})</h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {assignedCharacterObjects.length === 0 ? (
              <p className="text-gray-400 text-sm p-4 text-center">
                No characters assigned yet
              </p>
            ) : (
              assignedCharacterObjects.map(character => (
                <div
                  key={character.id}
                  className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">{character.name}</div>
                    <div className="text-sm text-gray-400">
                      {character.race} • {character.role}
                    </div>
                  </div>
                  <button
                    onClick={() => onUnassign(character.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-white/5 rounded-lg">
        <p className="text-sm text-gray-300">
          <span className="font-medium text-white">{assignedCharacters.length}</span> character{assignedCharacters.length !== 1 ? 's' : ''} assigned to this interaction.
          {assignedCharacters.length > 0 && (
            <span className="ml-2 text-blue-400">
              These characters will have access to this interaction regardless of their current location.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default InteractionEditor;
