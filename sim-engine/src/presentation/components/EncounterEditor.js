/**
 * EncounterEditor - Component for creating and editing encounters
 * 
 * Provides a comprehensive interface for encounter creation with:
 * - Turn-based simulation integration
 * - Trigger condition configuration
 * - Outcome and reward management
 * - Integration with interaction system
 * - Text templating with PlaceholderEditor integration
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, X, Settings, Dice6, Clock, Target, Gift, AlertTriangle, Info, MapPin, Route } from 'lucide-react';
import PlaceholderEditor from './text-templating/PlaceholderEditor';
import EditorContextService from '../../application/services/EditorContextService';
import QuestTextTemplatingService from '../../application/services/QuestTextTemplatingService';

const EncounterEditor = ({ 
  initialEncounter = null, 
  onChange, 
  onSave, 
  onCancel, 
  mode = 'create',
  // Context props for text templating
  currentNode = null,
  currentCharacter = null,
  currentWorld = null,
  participants = []
}) => {
  const [encounter, setEncounter] = useState(() => {
    const baseEncounter = initialEncounter || {
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
      nodeRestrictions: [],
      connectionRestrictions: [],
      // Quest integration fields
      questObjectives: [],
      completionMessage: '',
      questRewards: []
    };

    // Ensure all required arrays are initialized
    return {
      ...baseEncounter,
      nodeRestrictions: baseEncounter.nodeRestrictions || [],
      connectionRestrictions: baseEncounter.connectionRestrictions || [],
      triggers: baseEncounter.triggers || [],
      outcomes: baseEncounter.outcomes || [],
      prerequisites: baseEncounter.prerequisites || [],
      rewards: baseEncounter.rewards || [],
      questObjectives: baseEncounter.questObjectives || [],
      questRewards: baseEncounter.questRewards || []
    };
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState({});

  // Context detection for text templating
  const editorContext = useMemo(() => {
    return EditorContextService.detectEncounterContext({
      node: currentNode,
      character: currentCharacter,
      world: currentWorld,
      participants: participants || encounter.participants,
      encounter: encounter
    });
  }, [currentNode, currentCharacter, currentWorld, participants, encounter]);

  // Quest text templating service
  const questTemplatingService = useMemo(() => new QuestTextTemplatingService(), []);

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

  const validateEncounter = useCallback(() => {
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

    // Quest integration validation
    const questValidation = questTemplatingService.validateQuestIntegration(encounter);
    if (!questValidation.isValid) {
      errors.questIntegration = questValidation.errors.join('; ');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [encounter, questTemplatingService]);

  useEffect(() => {
    validateEncounter();
    if (onChange) {
      onChange(encounter);
    }
  }, [encounter, onChange, validateEncounter]);

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

  // Quest objective management
  const addQuestObjective = () => {
    const newObjective = {
      id: Date.now(),
      text: '',
      type: 'primary',
      completed: false
    };
    updateEncounter({
      questObjectives: [...(encounter.questObjectives || []), newObjective]
    });
  };

  const updateQuestObjective = (index, updates) => {
    const updatedObjectives = (encounter.questObjectives || []).map((objective, i) => 
      i === index ? { ...objective, ...updates } : objective
    );
    updateEncounter({ questObjectives: updatedObjectives });
  };

  const removeQuestObjective = (index) => {
    const updatedObjectives = (encounter.questObjectives || []).filter((_, i) => i !== index);
    updateEncounter({ questObjectives: updatedObjectives });
  };

  const renderBasicTab = () => (
    <div className="space-y-6">
      {/* Name and Description */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Encounter Name *
          </label>
          <input
            type="text"
            value={encounter.name}
            onChange={(e) => updateEncounter({ name: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter encounter name..."
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description *
          </label>
          <PlaceholderEditor
            value={encounter.description}
            onChange={(description) => updateEncounter({ description })}
            context={editorContext}
            placeholder="Describe what happens in this encounter... Use {{placeholders}} for dynamic content."
            className="text-templating-editor"
            rows={3}
            showSuggestions={true}
            showPreview={true}
            showValidation={true}
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
          <p className="mt-1 text-xs text-gray-400">
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
          <p className="mt-1 text-xs text-gray-400">
            0 = Can only happen once, &gt;0 = Can repeat after cooldown
          </p>
        </div>
      </div>

      {/* Quest Integration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Quest Integration</h3>
            <p className="text-sm text-gray-400">Connect this encounter with quest objectives</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const sampleQuest = questTemplatingService.generateSampleQuestTemplates(encounter.type);
                updateEncounter({
                  questObjectives: sampleQuest.objectives,
                  completionMessage: sampleQuest.completionMessage,
                  questRewards: sampleQuest.rewards
                });
              }}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              Generate Sample
            </button>
            <button
              onClick={addQuestObjective}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Objective
            </button>
          </div>
        </div>

        {/* Quest Objectives */}
        {encounter.questObjectives && encounter.questObjectives.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-md font-medium text-gray-300">Quest Objectives</h4>
            {encounter.questObjectives.map((objective, index) => (
              <div key={objective.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-white">Objective {index + 1}</h5>
                  <button
                    onClick={() => removeQuestObjective(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Objective Text
                    </label>
                    <PlaceholderEditor
                      value={objective.text}
                      onChange={(text) => updateQuestObjective(index, { text })}
                      context={editorContext}
                      placeholder="Enter quest objective... Use {{placeholders}} for dynamic content."
                      rows={2}
                      showSuggestions={true}
                      showPreview={true}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Type
                      </label>
                      <select
                        value={objective.type || 'primary'}
                        onChange={(e) => updateQuestObjective(index, { type: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="optional">Optional</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={objective.completed || false}
                          onChange={(e) => updateQuestObjective(index, { completed: e.target.checked })}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-300">Completed by default</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completion Message */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Completion Message
          </label>
          <PlaceholderEditor
            value={encounter.completionMessage || ''}
            onChange={(completionMessage) => updateEncounter({ completionMessage })}
            context={editorContext}
            placeholder="Message shown when encounter completes... Use {{placeholders}} for dynamic content."
            rows={2}
            showSuggestions={true}
            showPreview={true}
          />
          <p className="mt-1 text-xs text-gray-400">
            This message will be displayed when the encounter is completed
          </p>
        </div>

        {/* Quest Rewards */}
        {encounter.questRewards && encounter.questRewards.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-300 mb-3">Quest Rewards</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {encounter.questRewards.map((reward, index) => (
                <div key={index} className="bg-white/10 border border-white/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white capitalize">{reward.type}</span>
                    <button
                      onClick={() => {
                        const updatedRewards = encounter.questRewards.filter((_, i) => i !== index);
                        updateEncounter({ questRewards: updatedRewards });
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  {reward.value !== undefined && (
                    <div className="text-sm text-gray-300">
                      Value: {reward.value}
                    </div>
                  )}
                  {reward.description && (
                    <div className="text-xs text-gray-400 mt-1">
                      {reward.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quest Integration Validation */}
        {validationErrors.questIntegration && (
          <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">Quest Integration Issues:</span>
            </div>
            <p className="text-red-300 text-sm mt-1">{validationErrors.questIntegration}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTurnBasedTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 border border-white/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Turn-Based Configuration</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Configure how this encounter integrates with the turn-based simulation system.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
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
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <p className="mt-1 text-xs text-gray-400">
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
          <p className="mt-1 text-xs text-gray-400">
              {timingOptions.find(t => t.value === encounter.turnBased.timing)?.description}
            </p>
          </div>
          
          <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
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
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <p className="text-sm text-gray-400">Define when this encounter can occur</p>
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
        <div className="text-center py-8 text-gray-400">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No triggers defined. This encounter will never occur automatically.</p>
          <p className="text-sm">Add triggers to define when this encounter can happen.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {encounter.triggers.map((trigger, index) => (
            <div key={trigger.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Trigger Type
                  </label>
                  <select
                    value={trigger.type}
                    onChange={(e) => updateTrigger(index, { type: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <p className="text-sm text-gray-400">Define possible results of this encounter</p>
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
        <div className="text-center py-8 text-gray-400">
          <Dice6 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No outcomes defined.</p>
          <p className="text-sm">Add at least one outcome to complete the encounter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {encounter.outcomes.map((outcome, index) => (
            <div key={outcome.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <PlaceholderEditor
                    value={outcome.description}
                    onChange={(description) => updateOutcome(index, { description })}
                    context={editorContext}
                    placeholder="Describe what happens with this outcome... Use {{placeholders}} for dynamic content."
                    rows={2}
                    showSuggestions={true}
                    showPreview={true}
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
          <p className="text-sm text-gray-400">Requirements that must be met for this encounter</p>
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
        <div className="text-center py-8 text-gray-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No prerequisites defined.</p>
          <p className="text-sm">This encounter can happen to any character.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {encounter.prerequisites.map((prereq, index) => (
            <div key={prereq.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
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
          <p className="text-sm text-gray-400">What characters gain from this encounter</p>
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
        <div className="text-center py-8 text-gray-400">
          <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No rewards defined.</p>
          <p className="text-sm">Add rewards to motivate character participation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {encounter.rewards.map((reward, index) => (
            <div key={reward.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
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
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

  const renderLocationsTab = () => {
    // Get available nodes from current world
    const availableNodes = currentWorld?.worldConfig?.nodes || [];
    
    const addNodeRestriction = (nodeId) => {
      if (!encounter.nodeRestrictions.includes(nodeId)) {
        updateEncounter({
          nodeRestrictions: [...encounter.nodeRestrictions, nodeId]
        });
      }
    };

    const removeNodeRestriction = (nodeId) => {
      updateEncounter({
        nodeRestrictions: encounter.nodeRestrictions.filter(id => id !== nodeId)
      });
    };

    const clearAllRestrictions = () => {
      updateEncounter({ nodeRestrictions: [] });
    };

    const addAllNodes = () => {
      const allNodeIds = availableNodes.map(node => node.id);
      updateEncounter({ nodeRestrictions: allNodeIds });
    };

    return (
      <div className="space-y-6">
        <div className="bg-white/10 border border-white/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Location Restrictions</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Control where this encounter can occur by restricting it to specific nodes (locations).
            If no nodes are selected, the encounter can occur anywhere.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={addAllNodes}
              disabled={availableNodes.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Plus className="w-4 h-4" />
              Add All Nodes
            </button>
            <button
              onClick={clearAllRestrictions}
              disabled={encounter.nodeRestrictions.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>

          {/* Current Restrictions */}
          {encounter.nodeRestrictions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-300 mb-3">
                Restricted to {encounter.nodeRestrictions.length} location{encounter.nodeRestrictions.length !== 1 ? 's' : ''}:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {encounter.nodeRestrictions.map(nodeId => {
                  const node = availableNodes.find(n => n.id === nodeId);
                  return (
                    <div key={nodeId} className="bg-indigo-600/20 border border-indigo-600/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">
                          {node?.name || `Node ${nodeId}`}
                        </span>
                        <button
                          onClick={() => removeNodeRestriction(nodeId)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {node?.type && (
                        <div className="text-xs text-gray-400 capitalize">
                          {node.type}
                        </div>
                      )}
                      {node?.description && (
                        <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {node.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Nodes */}
          <div>
            <h4 className="text-md font-medium text-gray-300 mb-3">
              Available Locations ({availableNodes.length}):
            </h4>
            
            {availableNodes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No nodes available in the current world.</p>
                <p className="text-sm">Create nodes first to restrict encounters to specific locations.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableNodes.map(node => {
                  const isSelected = encounter.nodeRestrictions.includes(node.id);
                  return (
                    <div
                      key={node.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-600/50'
                          : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                      }`}
                      onClick={() => isSelected ? removeNodeRestriction(node.id) : addNodeRestriction(node.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">
                          {node.name || `Node ${node.id}`}
                        </span>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600'
                            : 'border-gray-400'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                      {node.type && (
                        <div className="text-xs text-gray-400 capitalize mb-1">
                          {node.type}
                        </div>
                      )}
                      {node.description && (
                        <div className="text-xs text-gray-400 line-clamp-2">
                          {node.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-300">
                <strong>Location Restrictions:</strong> If you select specific nodes, this encounter can only occur at those locations.
                If no nodes are selected, the encounter can occur at any location in the world.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConnectionsTab = () => {
    // Get all available connections from the world
    const availableConnections = [];
    const availableNodes = currentWorld?.worldConfig?.nodes || [];
    
    // Build list of all connections from all nodes
    availableNodes.forEach(node => {
      if (node.connections && Array.isArray(node.connections)) {
        node.connections.forEach(connection => {
          // Create a unique ID for the connection
          const connectionId = `${node.id}-${connection.targetNodeId}-${connection.type}`;
          const targetNode = availableNodes.find(n => n.id === connection.targetNodeId);
          
          availableConnections.push({
            id: connectionId,
            sourceNode: node,
            targetNode: targetNode,
            connection: connection,
            displayName: `${node.name || node.id} → ${targetNode?.name || connection.targetNodeId} (${connection.type})`
          });
        });
      }
    });

    const addConnectionRestriction = (connectionId) => {
      if (!encounter.connectionRestrictions.includes(connectionId)) {
        updateEncounter({
          connectionRestrictions: [...encounter.connectionRestrictions, connectionId]
        });
      }
    };

    const removeConnectionRestriction = (connectionId) => {
      updateEncounter({
        connectionRestrictions: encounter.connectionRestrictions.filter(id => id !== connectionId)
      });
    };

    const clearAllConnectionRestrictions = () => {
      updateEncounter({ connectionRestrictions: [] });
    };

    return (
      <div className="space-y-6">
        <div className="bg-white/10 border border-white/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Route className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Travel Route Restrictions</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Control where this encounter can occur during travel by restricting it to specific routes between locations.
            If no routes are selected, the encounter can occur on any travel route.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={clearAllConnectionRestrictions}
              disabled={encounter.connectionRestrictions.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>

          {/* Current Restrictions */}
          {encounter.connectionRestrictions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-300 mb-3">
                Restricted to {encounter.connectionRestrictions.length} route{encounter.connectionRestrictions.length !== 1 ? 's' : ''}:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {encounter.connectionRestrictions.map(connectionId => {
                  const connection = availableConnections.find(c => c.id === connectionId);
                  return (
                    <div key={connectionId} className="bg-indigo-600/20 border border-indigo-600/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">
                          {connection?.displayName || `Route ${connectionId}`}
                        </span>
                        <button
                          onClick={() => removeConnectionRestriction(connectionId)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {connection && (
                        <div className="text-xs text-gray-400">
                          Difficulty: {connection.connection.difficulty}, Distance: {connection.connection.distance}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Connections */}
          <div>
            <h4 className="text-md font-medium text-gray-300 mb-3">
              Available Travel Routes ({availableConnections.length}):
            </h4>
            
            {availableConnections.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Route className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No travel routes available in the current world.</p>
                <p className="text-sm">Create nodes with connections first to restrict encounters to specific travel routes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableConnections.map(connection => {
                  const isSelected = encounter.connectionRestrictions.includes(connection.id);
                  return (
                    <div
                      key={connection.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-600/50'
                          : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                      }`}
                      onClick={() => isSelected ? removeConnectionRestriction(connection.id) : addConnectionRestriction(connection.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">
                          {connection.displayName}
                        </span>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600'
                            : 'border-gray-400'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Difficulty: {connection.connection.difficulty}, Distance: {connection.connection.distance}
                      </div>
                      {connection.connection.conditions && connection.connection.conditions.length > 0 && (
                        <div className="text-xs text-orange-400 mt-1">
                          Has special conditions
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-300">
                <strong>Travel Route Restrictions:</strong> If you select specific routes, this encounter can only occur while traveling along those routes.
                If no routes are selected, the encounter can occur on any travel route in the world.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'turnbased', label: 'Turn-Based', icon: Clock },
    { id: 'triggers', label: 'Triggers', icon: Target },
    { id: 'outcomes', label: 'Outcomes', icon: Dice6 },
    { id: 'prerequisites', label: 'Prerequisites', icon: AlertTriangle },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'connections', label: 'Travel Routes', icon: Route },
    { id: 'rewards', label: 'Rewards', icon: Gift }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-white/20">
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
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
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
        {activeTab === 'locations' && renderLocationsTab()}
        {activeTab === 'connections' && renderConnectionsTab()}
        {activeTab === 'rewards' && renderRewardsTab()}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/20">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
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
