import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, Eye, ChevronDown, ChevronUp, X, Users, UserPlus, Tag, Crown, Target, Smile } from 'lucide-react';
import { InfluenceDomainManager, InfluenceEffectsEditor } from './systems/interaction/InfluenceSystem';
import { PrestigeTrackManager, PrestigeEffectsEditor } from './systems/interaction/PrestigeSystem';
import { AlignmentAxisManager, AlignmentEffectsEditor } from './systems/interaction/AlignmentSystem';

const InteractionManager = ({ 
  initialTab = 'interactions',
  influenceSystem,
  influenceDomains,
  setInfluenceDomains,
  prestigeSystem,
  prestigeTracks,
  setPrestigeTracks,
  alignmentSystem,
  alignmentAxes,
  setAlignmentAxes
}) => {
  // Main data states
  const [interactions, setInteractions] = useState([]);
  const [characterTypes, setCharacterTypes] = useState([]);
  
  // UI states
  const [currentInteraction, setCurrentInteraction] = useState(null);
  const [currentCharacterType, setCurrentCharacterType] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [expandedInteraction, setExpandedInteraction] = useState(null);
  const [characterTypeMode, setCharacterTypeMode] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab); // Use initialTab prop
  const [activeSystemTab, setActiveSystemTab] = useState('influence'); // 'influence', 'prestige', or 'alignment'

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedInteractions = localStorage.getItem('interactions');
    const savedCharacterTypes = localStorage.getItem('characterTypes');
    
    if (savedInteractions) {
      setInteractions(JSON.parse(savedInteractions));
    }
    
    if (savedCharacterTypes) {
      setCharacterTypes(JSON.parse(savedCharacterTypes));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('interactions', JSON.stringify(interactions));
  }, [interactions]);
  
  useEffect(() => {
    localStorage.setItem('characterTypes', JSON.stringify(characterTypes));
  }, [characterTypes]);

  // ======= Interaction Management Functions =======
  const createNewInteraction = () => {
    const newInteraction = {
      id: `interaction_${Date.now()}`,
      title: "New Interaction",
      description: "",
      content: "",
      characterTypeId: "", // Field to link to a character type
      options: [],
      effects: {
        influence: [],
        prestige: [],
        alignment: []
      }
    };
    setCurrentInteraction(newInteraction);
    setEditMode(true);
    setViewMode(false);
    setCharacterTypeMode(false);
  };

  const editInteraction = (interaction) => {
    setCurrentInteraction({...interaction});
    setEditMode(true);
    setViewMode(false);
    setCharacterTypeMode(false);
  };

  const viewInteraction = (interaction) => {
    setCurrentInteraction({...interaction});
    setViewMode(true);
    setEditMode(false);
    setCharacterTypeMode(false);
  };

  const deleteInteraction = (id) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      setInteractions(interactions.filter(item => item.id !== id));
      if (currentInteraction && currentInteraction.id === id) {
        setCurrentInteraction(null);
        setEditMode(false);
        setViewMode(false);
      }
    }
  };

  const saveInteraction = () => {
    // Make sure the ID is valid
    if (!currentInteraction.id.trim()) {
      alert('ID cannot be empty');
      return;
    }

    // Check if this is an update or a new addition
    const existingIndex = interactions.findIndex(i => i.id === currentInteraction.id);
    
    if (existingIndex >= 0) {
      // Update existing
      const updatedInteractions = [...interactions];
      updatedInteractions[existingIndex] = currentInteraction;
      setInteractions(updatedInteractions);
    } else {
      // Add new
      setInteractions([...interactions, currentInteraction]);
    }
    
    setEditMode(false);
    setCurrentInteraction(null);
  };

  const addOption = () => {
    const newOption = {
      id: `option_${Date.now()}`,
      text: "",
      nextInteractionId: ""
    };
    
    setCurrentInteraction({
      ...currentInteraction,
      options: [...currentInteraction.options, newOption]
    });
  };

  const updateOption = (index, field, value) => {
    const updatedOptions = [...currentInteraction.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value
    };
    
    setCurrentInteraction({
      ...currentInteraction,
      options: updatedOptions
    });
  };

  const removeOption = (index) => {
    const updatedOptions = [...currentInteraction.options];
    updatedOptions.splice(index, 1);
    
    setCurrentInteraction({
      ...currentInteraction,
      options: updatedOptions
    });
  };

  // ======= Character Type Management Functions =======
  const createNewCharacterType = () => {
    const newCharacterType = {
      id: `character_${Date.now()}`,
      name: "New Character Type",
      description: "",
      color: "#" + Math.floor(Math.random()*16777215).toString(16) // Random color
    };
    setCurrentCharacterType(newCharacterType);
    setCharacterTypeMode(true);
    setEditMode(false);
    setViewMode(false);
  };

  const editCharacterType = (characterType) => {
    setCurrentCharacterType({...characterType});
    setCharacterTypeMode(true);
    setEditMode(false);
    setViewMode(false);
  };

  const deleteCharacterType = (id) => {
    if (window.confirm('Are you sure you want to delete this character type?')) {
      // Remove character type
      setCharacterTypes(characterTypes.filter(item => item.id !== id));
      
      // Also remove references to this character type from interactions
      const updatedInteractions = interactions.map(interaction => {
        if (interaction.characterTypeId === id) {
          return {...interaction, characterTypeId: ""};
        }
        return interaction;
      });
      
      setInteractions(updatedInteractions);
      
      if (currentCharacterType && currentCharacterType.id === id) {
        setCurrentCharacterType(null);
        setCharacterTypeMode(false);
      }
    }
  };

  const saveCharacterType = () => {
    // Make sure the ID and name are valid
    if (!currentCharacterType.id.trim() || !currentCharacterType.name.trim()) {
      alert('ID and name cannot be empty');
      return;
    }

    // Check if this is an update or a new addition
    const existingIndex = characterTypes.findIndex(n => n.id === currentCharacterType.id);
    
    if (existingIndex >= 0) {
      // Update existing
      const updatedCharacterTypes = [...characterTypes];
      updatedCharacterTypes[existingIndex] = currentCharacterType;
      setCharacterTypes(updatedCharacterTypes);
    } else {
      // Add new
      setCharacterTypes([...characterTypes, currentCharacterType]);
    }
    
    setCharacterTypeMode(false);
    setCurrentCharacterType(null);
  };

  const assignInteractionsToCharacterType = (characterTypeId, interactionIds) => {
    const updatedInteractions = interactions.map(interaction => {
      if (interactionIds.includes(interaction.id)) {
        return {...interaction, characterTypeId};
      }
      return interaction;
    });
    
    setInteractions(updatedInteractions);
  };

  // ======= Utility Functions =======
  const toggleExpand = (id) => {
    if (expandedInteraction === id) {
      setExpandedInteraction(null);
    } else {
      setExpandedInteraction(id);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setCurrentInteraction(null);
  };

  const cancelCharacterTypeEdit = () => {
    setCharacterTypeMode(false);
    setCurrentCharacterType(null);
  };

  const exportData = () => {
    const data = {
      interactions,
      characterTypes
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'interaction_manager_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (importedData.interactions) {
          setInteractions(importedData.interactions);
        }
        
        if (importedData.characterTypes) {
          setCharacterTypes(importedData.characterTypes);
        }
        
        alert('Import successful!');
      } catch (error) {
        alert('Failed to import data. Make sure the file is valid JSON.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  // Get character type data for a specific interaction
  const getCharacterTypeForInteraction = (interaction) => {
    if (!interaction || !interaction.characterTypeId) return null;
    return characterTypes.find(character => character.id === interaction.characterTypeId);
  };

  // Get count of interactions for a character type
  const getInteractionCountForCharacterType = (characterTypeId) => {
    return interactions.filter(interaction => interaction.characterTypeId === characterTypeId).length;
  };

  // Filter interactions by character type
  const filterInteractionsByCharacterType = (characterTypeId) => {
    if (!characterTypeId) return interactions;
    return interactions.filter(interaction => interaction.characterTypeId === characterTypeId);
  };

  const renderSystemEffects = () => {
    if (!currentInteraction) return null;

    return (
      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveSystemTab('influence')}
            className={`px-3 py-1 rounded ${
              activeSystemTab === 'influence' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            <Crown size={16} className="inline mr-1" />
            Influence
          </button>
          <button
            onClick={() => setActiveSystemTab('prestige')}
            className={`px-3 py-1 rounded ${
              activeSystemTab === 'prestige' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            <Target size={16} className="inline mr-1" />
            Prestige
          </button>
          <button
            onClick={() => setActiveSystemTab('alignment')}
            className={`px-3 py-1 rounded ${
              activeSystemTab === 'alignment' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            <Smile size={16} className="inline mr-1" />
            Alignment
          </button>
        </div>

        {activeSystemTab === 'influence' && (
          <InfluenceEffectsEditor
            interaction={currentInteraction}
            updateInteraction={(updatedInteraction) => {
              setCurrentInteraction(updatedInteraction);
            }}
            influenceDomains={influenceDomains}
          />
        )}

        {activeSystemTab === 'prestige' && (
          <PrestigeEffectsEditor
            interaction={currentInteraction}
            updateInteraction={(updatedInteraction) => {
              setCurrentInteraction(updatedInteraction);
            }}
            prestigeTracks={prestigeTracks}
          />
        )}

        {activeSystemTab === 'alignment' && (
          <AlignmentEffectsEditor
            interaction={currentInteraction}
            updateInteraction={(updatedInteraction) => {
              setCurrentInteraction(updatedInteraction);
            }}
            alignmentAxes={alignmentAxes}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-blue-600 dark:bg-blue-800 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Branching Interaction Manager</h1>
      </header>
      
      {/* Tabs for navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex px-4">
          <button 
            className={`py-3 px-4 font-medium transition-colors duration-200 ${
              activeTab === 'interactions' 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('interactions')}
          >
            Interactions
          </button>
          <button 
            className={`py-3 px-4 font-medium transition-colors duration-200 ${
              activeTab === 'characters' 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('characters')}
          >
            Character Types
          </button>
          <button 
            className={`py-3 px-4 font-medium transition-colors duration-200 ${
              activeTab === 'systems' 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('systems')}
          >
            Systems
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/4 bg-white dark:bg-gray-800 p-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
          {/* Export/Import controls */}
          <div className="mb-4 flex space-x-2">
            <button 
              onClick={exportData}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex-1 transition-colors duration-200"
            >
              Export
            </button>
            <label className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex-1 text-center cursor-pointer transition-colors duration-200">
              Import
              <input 
                type="file" 
                accept=".json" 
                onChange={importData} 
                className="hidden"
              />
            </label>
          </div>
          
          {activeTab === 'interactions' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Interactions</h2>
                <button 
                  onClick={createNewInteraction} 
                  className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white p-2 rounded transition-colors duration-200"
                  title="Create new interaction"
                >
                  <Plus size={18} />
                </button>
              </div>
              
              {/* Character Type filter dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Character Type</label>
                <select 
                  onChange={(e) => setExpandedInteraction(null)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Character Types</option>
                  {characterTypes.map(characterType => (
                    <option key={characterType.id} value={characterType.id}>
                      {characterType.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                {interactions.map(interaction => {
                  const characterType = getCharacterTypeForInteraction(interaction);
                  
                  return (
                    <div 
                      key={interaction.id} 
                      className="bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200"
                      style={characterType ? {borderLeft: `4px solid ${characterType.color}`} : {}}
                    >
                      <div 
                        className="p-2 cursor-pointer flex justify-between items-center"
                        onClick={() => toggleExpand(interaction.id)}
                      >
                        <span className="text-gray-900 dark:text-white">{interaction.title}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              editInteraction(interaction);
                            }}
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteInteraction(interaction.id);
                            }}
                            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </button>
                          <ChevronDown 
                            size={16} 
                            className={`transform transition-transform duration-200 ${
                              expandedInteraction === interaction.id ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          
          {activeTab === 'systems' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Interaction Systems</h2>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSystemTab('influence')}
                  className={`w-full p-3 rounded flex items-center space-x-2 transition-colors duration-200 ${
                    activeSystemTab === 'influence' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  <Crown size={18} />
                  <span>Influence System</span>
                </button>
                
                <button
                  onClick={() => setActiveSystemTab('prestige')}
                  className={`w-full p-3 rounded flex items-center space-x-2 transition-colors duration-200 ${
                    activeSystemTab === 'prestige' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  <Target size={18} />
                  <span>Prestige System</span>
                </button>
                
                <button
                  onClick={() => setActiveSystemTab('alignment')}
                  className={`w-full p-3 rounded flex items-center space-x-2 transition-colors duration-200 ${
                    activeSystemTab === 'alignment' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  <Smile size={18} />
                  <span>Alignment System</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Main content area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {!editMode && !viewMode && !characterTypeMode && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                {activeTab === 'interactions' ? (
                  <>
                    <h2 className="text-xl font-semibold mb-2">Welcome to the Interaction Manager</h2>
                    <p className="mb-4">Create or select an interaction to get started</p>
                    <button 
                      onClick={createNewInteraction}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Create New Interaction
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-2">Character Type Manager</h2>
                    <p className="mb-4">Create character types to organize your interactions</p>
                    <button 
                      onClick={createNewCharacterType}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Create New Character Type
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Edit Interaction Form */}
          {editMode && currentInteraction && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {currentInteraction.id ? 'Edit Interaction' : 'Create New Interaction'}
                </h2>
                <button 
                  onClick={cancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                    <input
                      type="text"
                      value={currentInteraction.id}
                      onChange={(e) => setCurrentInteraction({...currentInteraction, id: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="unique_id"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Character Type</label>
                    <select
                      value={currentInteraction.characterTypeId || ""}
                      onChange={(e) => setCurrentInteraction({...currentInteraction, characterTypeId: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="">No Character Type</option>
                      {characterTypes.map(characterType => (
                        <option key={characterType.id} value={characterType.id}>
                          {characterType.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={currentInteraction.title}
                    onChange={(e) => setCurrentInteraction({...currentInteraction, title: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Interaction Title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={currentInteraction.description}
                    onChange={(e) => setCurrentInteraction({...currentInteraction, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Brief description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={currentInteraction.content}
                    onChange={(e) => setCurrentInteraction({...currentInteraction, content: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded h-24"
                    placeholder="Main content of the interaction"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Response Options</label>
                    <button 
                      onClick={addOption}
                      className="bg-green-500 hover:bg-green-600 text-white p-1 rounded text-xs"
                    >
                      <Plus size={16} /> Add Option
                    </button>
                  </div>
                  
                  {currentInteraction.options.length === 0 && (
                    <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded">
                      No options yet. Add your first option.
                    </div>
                  )}
                  
                  {currentInteraction.options.map((option, index) => (
                    <div key={option.id} className="p-3 border border-gray-200 rounded mb-3 bg-gray-50">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Option {index + 1}</span>
                        <button 
                          onClick={() => removeOption(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-700 mb-1">Option ID</label>
                          <input
                            type="text"
                            value={option.id}
                            onChange={(e) => updateOption(index, 'id', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            placeholder="option_id"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-700 mb-1">Text</label>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => updateOption(index, 'text', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            placeholder="What the player can say/do"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-700 mb-1">Next Interaction ID</label>
                          <select
                            value={option.nextInteractionId}
                            onChange={(e) => updateOption(index, 'nextInteractionId', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Select next interaction...</option>
                            {interactions.map(interaction => (
                              <option key={interaction.id} value={interaction.id}>
                                {interaction.title} ({interaction.id})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end pt-4">
                  <button 
                    onClick={cancelEdit}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveInteraction}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                  >
                    <Save size={18} className="mr-1" /> Save
                  </button>
                </div>
              </div>
              {renderSystemEffects()}
            </div>
          )}
          
          {/* Character Type Edit Form */}
          {characterTypeMode && currentCharacterType && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {currentCharacterType.id ? 'Edit Character Type' : 'Create New Character Type'}
                </h2>
                <button 
                  onClick={cancelCharacterTypeEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                  <input
                    type="text"
                    value={currentCharacterType.id}
                    onChange={(e) => setCurrentCharacterType({...currentCharacterType, id: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="unique_id"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={currentCharacterType.name}
                    onChange={(e) => setCurrentCharacterType({...currentCharacterType, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Character Type Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={currentCharacterType.description}
                    onChange={(e) => setCurrentCharacterType({...currentCharacterType, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Brief description of this character type"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={currentCharacterType.color}
                      onChange={(e) => setCurrentCharacterType({...currentCharacterType, color: e.target.value})}
                      className="p-1 border border-gray-300 rounded h-10 w-20"
                    />
                    <span className="text-sm text-gray-600">{currentCharacterType.color}</span>
                  </div>
                </div>
                
                {/* Associated Interactions section */}
                {currentCharacterType.id && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Associated Interactions</h3>
                    
                    {/* List of interactions associated with this character type */}
                    <div className="border border-gray-200 rounded">
                      {interactions.filter(interaction => interaction.characterTypeId === currentCharacterType.id).map(interaction => (
                        <div key={interaction.id} className="p-2 border-b border-gray-200 last:border-b-0 flex justify-between items-center">
                          <span>{interaction.title}</span>
                          <button
                            onClick={() => {
                              const updatedInteractions = [...interactions];
                              const index = updatedInteractions.findIndex(i => i.id === interaction.id);
                              updatedInteractions[index] = {...interaction, characterTypeId: ""};
                              setInteractions(updatedInteractions);
                            }}
                            className="text-red-500 hover:text-red-700 text-xs p-1"
                            title="Remove association"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      
                      {interactions.filter(interaction => interaction.characterTypeId === currentCharacterType.id).length === 0 && (
                        <div className="p-3 text-center text-gray-500 text-sm">
                          No interactions associated with this character type yet.
                        </div>
                      )}
                    </div>
                    
                    {/* Assign interactions to this character type */}
                    <div className="mt-4">
                      <h4 className="text-xs font-medium text-gray-700 mb-1">Assign Interactions</h4>
                      <div className="flex items-center space-x-2">
                        <select
                          className="flex-1 p-2 border border-gray-300 rounded text-sm"
                          defaultValue=""
                          id="interactionToAssign"
                        >
                          <option value="" disabled>Select an interaction...</option>
                          {interactions.filter(interaction => interaction.characterTypeId !== currentCharacterType.id).map(interaction => (
                            <option key={interaction.id} value={interaction.id}>
                              {interaction.title}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const select = document.getElementById('interactionToAssign');
                            if (select.value) {
                              const updatedInteractions = [...interactions];
                              const index = updatedInteractions.findIndex(i => i.id === select.value);
                              updatedInteractions[index] = {...updatedInteractions[index], characterTypeId: currentCharacterType.id};
                              setInteractions(updatedInteractions);
                              // Reset the select
                              select.value = "";
                            }
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end pt-4">
                  <button 
                    onClick={cancelCharacterTypeEdit}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveCharacterType}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                  >
                    <Save size={18} className="mr-1" /> Save
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* View Mode */}
          {viewMode && currentInteraction && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold">{currentInteraction.title}</h2>
                  
                  {/* Display character type tag if applicable */}
                  {currentInteraction.characterTypeId && (
                    <div className="ml-3">
                      {(() => {
                        const characterType = characterTypes.find(n => n.id === currentInteraction.characterTypeId);
                        if (characterType) {
                          return (
                            <span 
                              className="text-xs px-2 py-1 rounded-full" 
                              style={{backgroundColor: characterType.color, color: '#fff'}}
                            >
                              {characterType.name}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => editInteraction(currentInteraction)}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-2 rounded"
                    title="Edit this interaction"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode(false)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500">ID:</span>
                  <p className="font-mono bg-gray-100 p-1 rounded">{currentInteraction.id}</p>
                </div>
                
                <div>
                  <span className="text-xs text-gray-500">Description:</span>
                  <p>{currentInteraction.description || <em className="text-gray-400">No description</em>}</p>
                </div>
                
                <div>
                  <span className="text-xs text-gray-500">Content:</span>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mt-1">
                    {currentInteraction.content || <em className="text-gray-400">No content</em>}
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-gray-500">Response Options:</span>
                  
                  {currentInteraction.options.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No response options defined.
                    </div>
                  )}
                  
                  {currentInteraction.options.map((option, index) => {
                    // Find the linked interaction
                    const nextInteraction = interactions.find(i => i.id === option.nextInteractionId);
                    // Get the character type for the linked interaction, if any
                    const nextCharacterType = nextInteraction?.characterTypeId ? 
                      characterTypes.find(n => n.id === nextInteraction.characterTypeId) : null;
                    
                    return (
                      <div 
                        key={option.id} 
                        className="p-3 border border-gray-200 hover:bg-gray-50 rounded mb-2 cursor-pointer"
                        style={nextCharacterType ? {borderLeft: `4px solid ${nextCharacterType.color}`} : {}}
                      >
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{option.text || <em className="text-gray-400">No text</em>}</div>
                            <div className="text-xs text-gray-500">ID: {option.id}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs">Leads to:</div>
                            {nextInteraction ? (
                              <div>
                                <button 
                                  className="text-blue-600 hover:underline text-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    viewInteraction(nextInteraction);
                                  }}
                                >
                                  {nextInteraction.title}
                                </button>
                                {nextCharacterType && (
                                  <span 
                                    className="ml-2 text-xs px-1.5 py-0.5 rounded-full" 
                                    style={{backgroundColor: nextCharacterType.color, color: '#fff'}}
                                  >
                                    {nextCharacterType.name}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-red-500 text-sm">
                                {option.nextInteractionId ? 'Missing interaction' : 'Not set'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'systems' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              {activeSystemTab === 'influence' && (
                <InfluenceDomainManager
                  influenceDomains={influenceDomains}
                  setInfluenceDomains={setInfluenceDomains}
                />
              )}
              
              {activeSystemTab === 'prestige' && (
                <PrestigeTrackManager
                  prestigeTracks={prestigeTracks}
                  setPrestigeTracks={setPrestigeTracks}
                />
              )}
              
              {activeSystemTab === 'alignment' && (
                <AlignmentAxisManager
                  alignmentAxes={alignmentAxes}
                  setAlignmentAxes={setAlignmentAxes}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractionManager;