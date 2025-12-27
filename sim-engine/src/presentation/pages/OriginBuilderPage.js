import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Save, ArrowLeft, Plus, Trash2, Clock, 
  User, Sparkles, AlertCircle, Check
} from 'lucide-react';
import Origin from '../../domain/entities/Origin.js';
import OriginTemplates from '../../domain/services/OriginTemplates.js';
import Navigation from '../UI/Navigation.js';

/**
 * OriginBuilderPage - Standalone page for creating and editing character origins
 * 
 * Features:
 * - Create new origins from scratch or templates
 * - Edit origin properties (name, description, ages, difficulty)
 * - Manage backstory events timeline
 * - Configure attribute/skill modifiers
 * - Save/load origins to localStorage
 */
const OriginBuilderPage = () => {
  const navigate = useNavigate();
  
  // Origin state
  const [origin, setOrigin] = useState(null);
  const [originName, setOriginName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Custom');
  const [difficulty, setDifficulty] = useState('normal');
  const [startAge, setStartAge] = useState(0);
  const [playableAge, setPlayableAge] = useState(16);
  const [backstorySpeed, setBackstorySpeed] = useState(1.0);
  
  // Backstory events
  const [backstoryEvents, setBackstoryEvents] = useState([]);
  const [showEventEditor, setShowEventEditor] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // New event form
  const [newEventAge, setNewEventAge] = useState(0);
  const [newEventType, setNewEventType] = useState('milestone');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventSignificant, setNewEventSignificant] = useState(false);
  
  // Modifiers
  const [attributeModifiers, setAttributeModifiers] = useState({
    strength: 0, dexterity: 0, constitution: 0,
    intelligence: 0, wisdom: 0, charisma: 0
  });
  const [skillModifiers, setSkillModifiers] = useState([]);
  const [personalityModifiers, setPersonalityModifiers] = useState([]);
  const [initialInventory, setInitialInventory] = useState([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('basic');
  const [savedOrigins, setSavedOrigins] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Load saved origins from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customOrigins');
    if (saved) {
      try {
        const origins = JSON.parse(saved);
        setSavedOrigins(origins);
      } catch (error) {
        console.error('Failed to load saved origins:', error);
      }
    }
  }, []);

  // Validate origin
  useEffect(() => {
    const errors = [];
    if (!originName.trim()) errors.push('Origin name is required');
    if (startAge < 0) errors.push('Start age must be non-negative');
    if (playableAge <= startAge) errors.push('Playable age must be greater than start age');
    if (backstorySpeed <= 0) errors.push('Backstory speed must be positive');
    setValidationErrors(errors);
  }, [originName, startAge, playableAge, backstorySpeed]);

  // Handle template selection
  const handleLoadTemplate = (templateId) => {
    const template = Object.values(OriginTemplates).find(t => t.id === templateId);
    if (template) {
      setOriginName(template.name);
      setDescription(template.description);
      setCategory(template.category);
      setDifficulty(template.difficulty);
      setStartAge(template.startAge);
      setPlayableAge(template.playableAge);
      setBackstorySpeed(template.backstorySpeed);
      setBackstoryEvents([...template.backstoryEvents]);
      setAttributeModifiers({...template.initialAttributes});
      setSkillModifiers([...template.initialSkills]);
      setPersonalityModifiers([...template.personalityModifiers]);
      setInitialInventory([...template.initialInventory]);
      setOrigin(template);
      setHasUnsavedChanges(false);
    }
  };

  // Add backstory event
  const handleAddEvent = () => {
    if (!newEventDescription.trim()) return;
    
    const event = {
      age: parseInt(newEventAge),
      type: newEventType,
      description: newEventDescription,
      isSignificant: newEventSignificant,
      effects: {}
    };
    
    const updatedEvents = [...backstoryEvents, event].sort((a, b) => a.age - b.age);
    setBackstoryEvents(updatedEvents);
    
    // Reset form
    setNewEventAge(startAge);
    setNewEventType('milestone');
    setNewEventDescription('');
    setNewEventSignificant(false);
    setShowEventEditor(false);
    setHasUnsavedChanges(true);
  };

  // Delete backstory event
  const handleDeleteEvent = (index) => {
    const updatedEvents = backstoryEvents.filter((_, i) => i !== index);
    setBackstoryEvents(updatedEvents);
    setHasUnsavedChanges(true);
  };

  // Add skill modifier
  const handleAddSkill = () => {
    const skillName = prompt('Skill name:');
    const skillValue = parseInt(prompt('Skill value (0-100):'));
    if (skillName && !isNaN(skillValue)) {
      setSkillModifiers([...skillModifiers, { skill: skillName, value: skillValue }]);
      setHasUnsavedChanges(true);
    }
  };

  // Save origin
  const handleSave = () => {
    if (validationErrors.length > 0) {
      alert('Please fix validation errors before saving');
      return;
    }

    const newOrigin = new Origin({
      name: originName,
      description: description,
      category: category,
      difficulty: difficulty,
      startAge: parseInt(startAge),
      playableAge: parseInt(playableAge),
      backstorySpeed: parseFloat(backstorySpeed),
      backstoryEvents: backstoryEvents,
      initialAttributes: attributeModifiers,
      initialSkills: skillModifiers,
      personalityModifiers: personalityModifiers,
      initialInventory: initialInventory
    });

    // Save to localStorage
    const saved = localStorage.getItem('customOrigins');
    const origins = saved ? JSON.parse(saved) : [];
    
    // Update existing or add new
    const existingIndex = origins.findIndex(o => o.id === newOrigin.id || o.name === originName);
    if (existingIndex >= 0) {
      origins[existingIndex] = newOrigin.toJSON();
    } else {
      origins.push(newOrigin.toJSON());
    }
    
    localStorage.setItem('customOrigins', JSON.stringify(origins));
    setSavedOrigins(origins);
    setOrigin(newOrigin);
    setHasUnsavedChanges(false);
    
    alert('Origin saved successfully!');
  };

  // Create new origin
  const handleNew = () => {
    if (hasUnsavedChanges && !window.confirm('Discard unsaved changes?')) return;
    
    setOrigin(null);
    setOriginName('');
    setDescription('');
    setCategory('Custom');
    setDifficulty('normal');
    setStartAge(0);
    setPlayableAge(16);
    setBackstorySpeed(1.0);
    setBackstoryEvents([]);
    setAttributeModifiers({
      strength: 0, dexterity: 0, constitution: 0,
      intelligence: 0, wisdom: 0, charisma: 0
    });
    setSkillModifiers([]);
    setPersonalityModifiers([]);
    setInitialInventory([]);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-slate-800/90 backdrop-blur-md border border-purple-500/30 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-purple-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-purple-400" />
                  Origin Builder
                </h1>
                <p className="text-purple-200 text-sm mt-1">
                  Create character backstories and starting conditions
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleNew}
                className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
              >
                New Origin
              </button>
              <button
                onClick={() => navigate('/editors/characters')}
                className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Back to Character Editor
              </button>
              <button
                onClick={handleSave}
                disabled={validationErrors.length > 0}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  validationErrors.length > 0
                    ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <Save className="w-4 h-4" />
                Save Origin
              </button>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-medium">Validation Errors:</p>
                  <ul className="text-red-200 text-sm mt-1 list-disc list-inside">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {hasUnsavedChanges && (
            <div className="mt-4 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-300 text-sm text-center">
              ⚠ You have unsaved changes
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-800/90 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
          <div className="flex gap-2 mb-6 border-b border-purple-500/30">
            {['basic', 'timeline', 'modifiers', 'templates'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-purple-300 border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-purple-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Origin Name *
                  </label>
                  <input
                    type="text"
                    value={originName}
                    onChange={(e) => {
                      setOriginName(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="e.g., Noble's Child"
                    className="w-full px-4 py-2 bg-slate-700 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="e.g., Noble, Military, Scholar"
                    className="w-full px-4 py-2 bg-slate-700 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  rows={4}
                  placeholder="Describe this origin's backstory and theme..."
                  className="w-full px-4 py-2 bg-slate-700 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Age
                  </label>
                  <input
                    type="number"
                    value={startAge}
                    onChange={(e) => {
                      setStartAge(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    min="0"
                    className="w-full px-4 py-2 bg-slate-700 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Playable Age
                  </label>
                  <input
                    type="number"
                    value={playableAge}
                    onChange={(e) => {
                      setPlayableAge(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    min={parseInt(startAge) + 1}
                    className="w-full px-4 py-2 bg-slate-700 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => {
                      setDifficulty(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-4 py-2 bg-slate-700 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="easy">Easy</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Backstory Speed
                  </label>
                  <input
                    type="number"
                    value={backstorySpeed}
                    onChange={(e) => {
                      setBackstorySpeed(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    step="0.1"
                    min="0.1"
                    className="w-full px-4 py-2 bg-slate-700 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="p-4 bg-purple-500/10 rounded-lg">
                <p className="text-purple-300 text-sm">
                  <strong>Tip:</strong> Backstory speed controls how fast time passes during origin simulation.
                  1.0 = normal, 10.0 = 10x faster, 0.1 = 10x slower.
                </p>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Backstory Events ({backstoryEvents.length})
                </h3>
                <button
                  onClick={() => setShowEventEditor(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Event
                </button>
              </div>

              {/* Event Editor */}
              {showEventEditor && (
                <div className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/30 space-y-3">
                  <h4 className="text-purple-300 font-medium">New Backstory Event</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Age</label>
                      <input
                        type="number"
                        value={newEventAge}
                        onChange={(e) => setNewEventAge(e.target.value)}
                        min={startAge}
                        max={playableAge}
                        className="w-full px-3 py-2 bg-slate-800 border border-purple-400/30 rounded text-white text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Type</label>
                      <select
                        value={newEventType}
                        onChange={(e) => setNewEventType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-purple-400/30 rounded text-white text-sm"
                      >
                        <option value="milestone">Milestone</option>
                        <option value="tragedy">Tragedy</option>
                        <option value="achievement">Achievement</option>
                        <option value="relationship">Relationship</option>
                        <option value="training">Training</option>
                        <option value="loss">Loss</option>
                        <option value="discovery">Discovery</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Description</label>
                    <textarea
                      value={newEventDescription}
                      onChange={(e) => setNewEventDescription(e.target.value)}
                      rows={3}
                      placeholder="What happened at this age?"
                      className="w-full px-3 py-2 bg-slate-800 border border-purple-400/30 rounded text-white text-sm"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={newEventSignificant}
                      onChange={(e) => setNewEventSignificant(e.target.checked)}
                      className="rounded"
                    />
                    Mark as significant event
                  </label>

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddEvent}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                    >
                      Add Event
                    </button>
                    <button
                      onClick={() => setShowEventEditor(false)}
                      className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Event Timeline */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {backstoryEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No backstory events yet. Add events to build the character's history.</p>
                  </div>
                ) : (
                  backstoryEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-700/50 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-purple-600/30 text-purple-300 text-xs rounded">
                              Age {event.age}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-600/50 text-gray-300 text-xs rounded">
                              {event.type}
                            </span>
                            {event.isSignificant && (
                              <Sparkles className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                          <p className="text-gray-300 text-sm">{event.description}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(idx)}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Modifiers Tab */}
          {activeTab === 'modifiers' && (
            <div className="space-y-6">
              {/* Attribute Modifiers */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Attribute Modifiers</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(attributeModifiers).map(([attr, value]) => (
                    <div key={attr}>
                      <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                        {attr}
                      </label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => {
                          setAttributeModifiers({
                            ...attributeModifiers,
                            [attr]: parseInt(e.target.value) || 0
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-4 py-2 bg-slate-700 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Modifiers */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">Initial Skills</h3>
                  <button
                    onClick={handleAddSkill}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Skill
                  </button>
                </div>
                <div className="space-y-2">
                  {skillModifiers.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">
                      No skills defined yet
                    </p>
                  ) : (
                    skillModifiers.map((skill, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                      >
                        <span className="text-gray-300">{skill.skill}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-purple-300 font-medium">{skill.value}</span>
                          <button
                            onClick={() => {
                              setSkillModifiers(skillModifiers.filter((_, i) => i !== idx));
                              setHasUnsavedChanges(true);
                            }}
                            className="p-1 hover:bg-red-500/20 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Initial Inventory */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Initial Inventory</h3>
                <textarea
                  value={initialInventory.join('\n')}
                  onChange={(e) => {
                    setInitialInventory(e.target.value.split('\n').filter(i => i.trim()));
                    setHasUnsavedChanges(true);
                  }}
                  rows={4}
                  placeholder="One item per line..."
                  className="w-full px-4 py-2 bg-slate-700 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">Load from Template</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.values(OriginTemplates).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleLoadTemplate(template.id)}
                    className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-purple-500/30 rounded-lg text-left transition-colors"
                  >
                    <h4 className="text-purple-300 font-medium mb-1">{template.name}</h4>
                    <p className="text-gray-400 text-sm mb-2">{template.description}</p>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded">
                        {template.category}
                      </span>
                      <span className="px-2 py-1 bg-slate-600/50 text-gray-300 rounded">
                        {template.difficulty}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {savedOrigins.length > 0 && (
                <>
                  <h3 className="text-xl font-semibold text-white mt-8 mb-4">Saved Origins</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {savedOrigins.map((saved, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const origin = Origin.fromJSON(saved);
                          handleLoadTemplate(origin.id);
                        }}
                        className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-purple-500/30 rounded-lg text-left transition-colors"
                      >
                        <h4 className="text-purple-300 font-medium mb-1">{saved.name}</h4>
                        <p className="text-gray-400 text-sm">{saved.description}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OriginBuilderPage;
