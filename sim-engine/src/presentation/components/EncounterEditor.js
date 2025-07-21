/**
 * EncounterEditor - Component for creating and editing encounters
 * 
 * Provides a comprehensive interface for encounter creation with:
 * - Turn-based simulation integration
 * - Trigger condition configuration
 * - Outcome and reward management
 * - Integration with interaction system
 */

import React, { useState, useEffect } from 'react';
import { Plus, X, Settings, Dice6, Clock, Users, Target, Gift, AlertTriangle, Info } from 'lucide-react';

const EncounterEditor = ({ 
  initialEncounter = null, 
  onChange, 
  onSave, 
  onCancel, 
  mode = 'create' 
}) => {
  const [encounter, setEncounter] = useState(initialEncounter || {
    name: '',
    description: '',
    type: 'combat',
    difficulty: 'medium',
    challengeRating: 1,
    turnBased: {
      duration: 1,
      initiative: 'random',
      timing: 'immediate',
      sequencing: 'simultaneous'
    },
    triggers: [],
    participants: [],
    outcomes: [],
    prerequisites: [],
    rewards: [],
    cooldown: 0,
    nodeRestrictions: []
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState({});

  // Encounter types with descriptions
  const encounterTypes = [
    { value: 'combat', label: 'Combat', icon: '⚔️', description: 'Physical confrontations and battles' },
    { value: 'social', label: 'Social', icon: '💬', description: 'Diplomatic interactions and negotiations' },
    { value: 'exploration', label: 'Exploration', icon: '🗺️', description: 'Discovery and investigation encounters' },
    { value: 'puzzle', label: 'Puzzle', icon: '🧩', description: 'Mental challenges and riddles' },
    { value: 'environmental', label: 'Environmental', icon: '🌪️', description: 'Natural hazards and obstacles' }
  ];

  // Difficulty levels
  const difficultyLevels = [
    { value: 'trivial', label: 'Trivial', color: 'text-green-400' },
    { value: 'easy', label: 'Easy', color: 'text-blue-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'hard', label: 'Hard', color: 'text-orange-400' },
    { value: 'deadly', label: 'Deadly', color: 'text-red-400' }
  ];

  // Initiative types
  const initiativeTypes = [
    { value: 'random', label: 'Random', description: 'Random turn order each encounter' },
    { value: 'attribute', label: 'Attribute-based', description: 'Based on character attributes (e.g., Dexterity)' },
    { value: 'fixed', label: 'Fixed Order', description: 'Predetermined turn order' }
  ];

  // Timing options
  const timingOptions = [
    { value: 'immediate', label: 'Immediate', description: 'Happens right away' },
    { value: 'delayed', label: 'Delayed', description: 'Happens after a delay' },
    { value: 'conditional', label: 'Conditional', description: 'Happens when conditions are met' }
  ];

  // Sequencing options
  const sequencingOptions = [
    { value: 'simultaneous', label: 'Simultaneous', description: 'All participants act at once' },
    { value: 'sequential', label: 'Sequential', description: 'Participants act in turn order' }
  ];

  useEffect(() => {
    validateEncounter();
    if (onChange) {
      onChange(encounter);
    }
  }, [encounter]);

  const validateEncounter = () => {
    const errors = {};
    
    if (!encounter.name?.trim()) {
      errors.name = 'Encounter name is required';
    }
    
    if (!encounter.description?.trim()) {
      errors.description = 'Description is required';
    }
    
    if (encounter.outcomes.length === 0) {
      errors.outcomes = 'At least one outcome is required';
    }
    
    if (encounter.challengeRating < 1 || encounter.challengeRating > 30) {
      errors.challengeRating = 'Challenge rating must be between 1 and 30';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateEncounter = (updates) => {
    setEncounter(prev => ({ ...prev, ...updates }));
  };

  const addTrigger = () => {
    const newTrigger = {
      id: Date.now(),
      type: 'probability',
      probability: 0.5,
      description: ''
    };
    updateEncounter({
      triggers: [...encounter.triggers, newTrigger]
    });
  };

  const updateTrigger = (index, updates) => {
    const updatedTriggers = encounter.triggers.map((trigger, i) => 
      i === index ? { ...trigger, ...updates } : trigger
    );
    updateEncounter({ triggers: updatedTriggers });
  };

  const removeTrigger = (index) => {
    const updatedTriggers = encounter.triggers.filter((_, i) => i !== index);
    updateEncounter({ triggers: updatedTriggers });
  };

  const addOutcome = () => {
    const newOutcome = {
      id: Date.now(),
      description: '',
      probability: 1.0,
      effects: [],
      turnDuration: 1,
      timing: 'immediate'
    };
    updateEncounter({
      outcomes: [...encounter.outcomes, newOutcome]
    });
  };

  const updateOutcome = (index, updates) => {
    const updatedOutcomes = encounter.outcomes.map((outcome, i) => 
      i === index ? { ...outcome, ...updates } : outcome
    );
    updateEncounter({ outcomes: updatedOutcomes });
  };

  const removeOutcome = (index) => {
    const updatedOutcomes = encounter.outcomes.filter((_, i) => i !== index);
    updateEncounter({ outcomes: updatedOutcomes });
  };

  const addPrerequisite = () => {
    const newPrerequisite = {
      id: Date.now(),
      type: 'attribute',
      attribute: 'strength',
      value: 10
    };
    updateEncounter({
      prerequisites: [...encounter.prerequisites, newPrerequisite]
    });
  };

  const updatePrerequisite = (index, updates) => {
    const updatedPrerequisites = encounter.prerequisites.map((prereq, i) => 
      i === index ? { ...prereq, ...updates } : prereq
    );
    updateEncounter({ prerequisites: updatedPrerequisites });
  };

  const removePrerequisite = (index) => {
    const updatedPrerequisites = encounter.prerequisites.filter((_, i) => i !== index);
    updateEncounter({ prerequisites: updatedPrerequisites });
  };

  const addReward = () => {
    const newReward = {
      id: Date.now(),
      type: 'experience',
      value: 100,
      description: ''
    };
    updateEncounter({
      rewards: [...encounter.rewards, newReward]
    });
  };

  const updateReward = (index, updates) => {
    const updatedRewards = encounter.rewards.map((reward, i) => 
      i === index ? { ...reward, ...updates } : reward
    );
    updateEncounter({ rewards: updatedRewards });
  };

  const removeReward = (index) => {
    const updatedRewards = encounter.rewards.filter((_, i) => i !== index);
    updateEncounter({ rewards: updatedRewards });
  };

  const renderBasicTab = () => (
    <div className="space-y-6">
      {/* Name and Description */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Encounter Name *
          </label>
          <input
            type="text"
            value={encounter.name}
            onChange={(e) => updateEncounter({ name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter encounter name..."
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description *
          </label>
          <textarea
            value={encounter.description}
            onChange={(e) => updateEncounter({ description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe what happens in this encounter..."
          />
          {validationErrors.description && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.description}</p>
          )}
        </div>
      </div>

      {/* Type and Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Encounter Type
          </label>
          <select
            value={encounter.type}
            onChange={(e) => updateEncounter({ type: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {encounterTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">
            {encounterTypes.find(t => t.value === encounter.type)?.description}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Difficulty Level
          </label>
          <select
            value={encounter.difficulty}
            onChange={(e) => updateEncounter({ difficulty: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {difficultyLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Challenge Rating and Cooldown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Challenge Rating
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={encounter.challengeRating}
            onChange={(e) => updateEncounter({ challengeRating: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {validationErrors.challengeRating && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.challengeRating}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Cooldown (turns)
          </label>
          <input
            type="number"
            min="0"
            value={encounter.cooldown}
            onChange={(e) => updateEncounter({ cooldown: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-slate-400">
            0 = Can only happen once, >0 = Can repeat after cooldown
          </p>
        </div>
      </div>
    </div>
  );

  const renderTurnBasedTab = () => (
    <div className="space-y-6">
      <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Turn-Based Configuration</h3>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Configure how this encounter integrates with the turn-based simulation system.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Duration (turns)
            </label>
            <input
              type="number"
              min="1"
              value={encounter.turnBased.duration}
              onChange={(e) => updateEncounter({
                turnBased: {
                  ...encounter.turnBased,
                  duration: parseInt(e.target.value) || 1
                }
              })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Initiative Type
            </label>
            <select
              value={encounter.turnBased.initiative}
              onChange={(e) => updateEncounter({
                turnBased: {
                  ...encounter.turnBased,
                  initiative: e.target.value
                }
              })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {initiativeTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              {initiativeTypes.find(t => t.value === encounter.turnBased.initiative)?.description}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Timing
            </label>
            <select
              value={encounter.turnBased.timing}
              onChange={(e) => updateEncounter({
                turnBased: {
                  ...encounter.turnBased,
                  timing: e.target.value
                }
              })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {timingOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              {timingOptions.find(t => t.value === encounter.turnBased.timing)?.description}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sequencing
            </label>
            <select
              value={encounter.turnBased.sequencing}
              onChange={(e) => updateEncounter({
                turnBased: {
                  ...encounter.turnBased,
                  sequencing: e.target.value
                }
              })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {sequencingOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              {sequencingOptions.find(t => t.value === encounter.turnBased.sequencing)?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTriggersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Trigger Conditions</h3>
          <p className="text-sm text-slate-400">Define when this encounter can occur</p>
        </div>
        <button
          onClick={addTrigger}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Trigger
        </button>
      </div>
      
      {encounter.triggers.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No triggers defined. This encounter will never occur automatically.</p>
          <p className="text-sm">Add triggers to define when this encounter can happen.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {encounter.triggers.map((trigger, index) => (
            <div key={trigger.id} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">Trigger {index + 1}</h4>
                <button
                  onClick={() => removeTrigger(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Trigger Type
                  </label>
                  <select
                    value={trigger.type}
                    onChange={(e) => updateTrigger(index, { type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="probability">Probability</option>
                    <option value="time">Time-based</option>
                    <option value="location">Location</option>
                    <option value="interaction">After Interaction</option>
                    <option value="condition">Custom Condition</option>
                  </select>
                </div>
                
                {trigger.type === 'probability' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Probability (0.0 - 1.0)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={trigger.probability || 0.5}
                      onChange={(e) => updateTrigger(index, { probability: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
                
                {trigger.type === 'time' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Turn Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={trigger.turn || 1}
                      onChange={(e) => updateTrigger(index, { turn: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderOutcomesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Encounter Outcomes</h3>
          <p className="text-sm text-slate-400">Define possible results of this encounter</p>
        </div>
        <button
          onClick={addOutcome}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Outcome
        </button>
      </div>
      
      {encounter.outcomes.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Dice6 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No outcomes defined.</p>
          <p className="text-sm">Add at least one outcome to complete the encounter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {encounter.outcomes.map((outcome, index) => (
            <div key={outcome.id} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">Outcome {index + 1}</h4>
                <button
                  onClick={() => removeOutcome(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={outcome.description}
                    onChange={(e) => updateOutcome(index, { description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe what happens with this outcome..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Probability
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={outcome.probability}
                      onChange={(e) => updateOutcome(index, { probability: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Turn Duration
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={outcome.turnDuration || 1}
                      onChange={(e) => updateOutcome(index, { turnDuration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Timing
                    </label>
                    <select
                      value={outcome.timing || 'immediate'}
                      onChange={(e) => updateOutcome(index, { timing: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="delayed">Delayed</option>
                      <option value="end_of_turn">End of Turn</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {validationErrors.outcomes && (
        <p className="text-sm text-red-400">{validationErrors.outcomes}</p>
      )}
    </div>
  );

  const renderPrerequisitesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Prerequisites</h3>
          <p className="text-sm text-slate-400">Requirements that must be met for this encounter</p>
        </div>
        <button
          onClick={addPrerequisite}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Prerequisite
        </button>
      </div>
      
      {encounter.prerequisites.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No prerequisites defined.</p>
          <p className="text-sm">This encounter can happen to any character.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {encounter.prerequisites.map((prereq, index) => (
            <div key={prereq.id} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">Prerequisite {index + 1}</h4>
                <button
                  onClick={() => removePrerequisite(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Type
                  </label>
                  <select
                    value={prereq.type}
                    onChange={(e) => updatePrerequisite(index, { type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="attribute">Attribute</option>
                    <option value="skill">Skill</option>
                    <option value="level">Level</option>
                    <option value="quest">Quest Status</option>
                    <option value="item">Has Item</option>
                  </select>
                </div>
                
                {prereq.type === 'attribute' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Attribute
                      </label>
                      <select
                        value={prereq.attribute || 'strength'}
                        onChange={(e) => updatePrerequisite(index, { attribute: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="strength">Strength</option>
                        <option value="dexterity">Dexterity</option>
                        <option value="constitution">Constitution</option>
                        <option value="intelligence">Intelligence</option>
                        <option value="wisdom">Wisdom</option>
                        <option value="charisma">Charisma</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Minimum Value
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={prereq.value || 10}
                        onChange={(e) => updatePrerequisite(index, { value: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </>
                )}
                
                {prereq.type === 'level' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Minimum Level
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={prereq.value || 1}
                      onChange={(e) => updatePrerequisite(index, { value: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRewardsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Rewards</h3>
          <p className="text-sm text-slate-400">What characters gain from this encounter</p>
        </div>
        <button
          onClick={addReward}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Reward
        </button>
      </div>
      
      {encounter.rewards.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No rewards defined.</p>
          <p className="text-sm">Add rewards to motivate character participation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {encounter.rewards.map((reward, index) => (
            <div key={reward.id} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">Reward {index + 1}</h4>
                <button
                  onClick={() => removeReward(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Reward Type
                  </label>
                  <select
                    value={reward.type}
                    onChange={(e) => updateReward(index, { type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="experience">Experience Points</option>
                    <option value="attribute">Attribute Increase</option>
                    <option value="skill">Skill Increase</option>
                    <option value="item">Item</option>
                    <option value="influence">Influence</option>
                    <option value="prestige">Prestige</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Value/Amount
                  </label>
                  <input
                    type="number"
                    value={reward.value || 0}
                    onChange={(e) => updateReward(index, { value: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={reward.description || ''}
                    onChange={(e) => updateReward(index, { description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Optional description..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'turnbased', label: 'Turn-Based', icon: Clock },
    { id: 'triggers', label: 'Triggers', icon: Target },
    { id: 'outcomes', label: 'Outcomes', icon: Dice6 },
    { id: 'prerequisites', label: 'Prerequisites', icon: AlertTriangle },
    { id: 'rewards', label: 'Rewards', icon: Gift }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-slate-600">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'basic' && renderBasicTab()}
        {activeTab === 'turnbased' && renderTurnBasedTab()}
        {activeTab === 'triggers' && renderTriggersTab()}
        {activeTab === 'outcomes' && renderOutcomesTab()}
        {activeTab === 'prerequisites' && renderPrerequisitesTab()}
        {activeTab === 'rewards' && renderRewardsTab()}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-600">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave && onSave(encounter)}
          disabled={Object.keys(validationErrors).length > 0}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mode === 'create' ? 'Create Encounter' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default EncounterEditor;