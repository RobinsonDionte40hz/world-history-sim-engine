import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Users, Crown, Scale, X } from 'lucide-react';
import { validatePrerequisites } from './PrerequisiteSystem';
import { InfluenceManager, InfluenceDomainManager } from './InfluenceSystem';
import { PrestigeManager, PrestigeTrackManager } from './PrestigeSystem';
import { AlignmentManager, AlignmentAxisManager } from './AlignmentSystem';
import NodeTypeCreator from './NodeTypeCreator';
import NodeTypeSystem from './NodeTypeSystem';
import characterTabStyles from './components/features/CharacterTab.module.css';
import CharacterTabInfo from './components/features/CharacterTabInfo';
import Tooltip from './components/common/Tooltip';
import { Info } from 'lucide-react';

const InteractionManagerWithSystems = ({ initialTab = 'interactions' }) => {
  const [nodeTypeSystem] = useState(() => new NodeTypeSystem());
  
  // Main data states
  const [interactions, setInteractions] = useState([]);
  const [characterTypes, setCharacterTypes] = useState([]);
  const [personalityTraits, setPersonalityTraits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [influenceDomains, setInfluenceDomains] = useState([]);
  const [prestigeTracks, setPrestigeTracks] = useState([]);
  const [alignmentAxes, setAlignmentAxes] = useState([]);
  
  // UI states
  const [currentInteraction, setCurrentInteraction] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [characterTypeMode, setCharacterTypeMode] = useState('list');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editorTab, setEditorTab] = useState('details');
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [filterCharacterType, setFilterCharacterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentCharacterType, setCurrentCharacterType] = useState(null);
  const [currentTrait, setCurrentTrait] = useState(null);

  // Testing states
  const [testPlayerState, setTestPlayerState] = useState({
    level: 1,
    skills: {},
    completedQuests: [],
    inventory: {},
    influence: {},
    prestige: {},
    alignment: {}
  });
  
  // Initialize system managers
  const [influenceManager] = useState(new InfluenceManager([]));
  const [prestigeManager] = useState(new PrestigeManager([]));
  const [alignmentManager] = useState(new AlignmentManager([]));

  // Load data from localStorage on component mount
  useEffect(() => {
    setLoading(true);
    try {
      const savedInteractions = localStorage.getItem('interactions');
      const savedCharacterTypes = localStorage.getItem('characterTypes');
      const savedCategories = localStorage.getItem('categories');
      const savedInfluenceDomains = localStorage.getItem('influenceDomains');
      const savedPrestigeTracks = localStorage.getItem('prestigeTracks');
      const savedAlignmentAxes = localStorage.getItem('alignmentAxes');
      
      if (savedInteractions) {
        const parsedInteractions = JSON.parse(savedInteractions);
        const updatedInteractions = parsedInteractions.map(interaction => ({
          ...interaction,
          prerequisites: interaction.prerequisites || {
            groups: [],
            showWhenUnavailable: true,
            unavailableMessage: ""
          },
          effects: {
            influenceChanges: interaction.effects?.influenceChanges || [],
            prestigeChanges: interaction.effects?.prestigeChanges || [],
            alignmentChanges: interaction.effects?.alignmentChanges || [],
            ...interaction.effects
          }
        }));
        setInteractions(updatedInteractions);
      }
      
      if (savedCharacterTypes) {
        setCharacterTypes(JSON.parse(savedCharacterTypes));
      }
      
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
      
      if (savedInfluenceDomains) {
        const domains = JSON.parse(savedInfluenceDomains);
        setInfluenceDomains(domains);
        influenceManager.domains = domains;
      }
      
      if (savedPrestigeTracks) {
        const tracks = JSON.parse(savedPrestigeTracks);
        setPrestigeTracks(tracks);
        prestigeManager.tracks = tracks;
      }
      
      if (savedAlignmentAxes) {
        const axes = JSON.parse(savedAlignmentAxes);
        setAlignmentAxes(axes);
        alignmentManager.axes = axes;
      }
      
      window.prestigeTracks = JSON.parse(savedPrestigeTracks || '[]');
      window.alignmentAxes = JSON.parse(savedAlignmentAxes || '[]');
      
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, [influenceManager, prestigeManager, alignmentManager]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('interactions', JSON.stringify(interactions));
  }, [interactions]);
  
  useEffect(() => {
    localStorage.setItem('characterTypes', JSON.stringify(characterTypes));
  }, [characterTypes]);
  
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);
  
  useEffect(() => {
    localStorage.setItem('influenceDomains', JSON.stringify(influenceDomains));
    influenceManager.domains = influenceDomains;
  }, [influenceDomains, influenceManager]);
  
  useEffect(() => {
    localStorage.setItem('prestigeTracks', JSON.stringify(prestigeTracks));
    prestigeManager.tracks = prestigeTracks;
    window.prestigeTracks = prestigeTracks;
  }, [prestigeTracks, prestigeManager]);
  
  useEffect(() => {
    localStorage.setItem('alignmentAxes', JSON.stringify(alignmentAxes));
    alignmentManager.axes = alignmentAxes;
    window.alignmentAxes = alignmentAxes;
  }, [alignmentAxes, alignmentManager]);

  // Update test results when prerequisites or test player state changes
  useEffect(() => {
    if (currentInteraction?.prerequisites && editorTab === 'prerequisites') {
      const combinedPlayerState = {
        ...testPlayerState,
        ...influenceManager.getPlayerStateWithInfluence(testPlayerState),
        ...prestigeManager.getPlayerStateWithPrestige(testPlayerState),
        ...alignmentManager.getPlayerStateWithAlignment(testPlayerState)
      };
      
      validatePrerequisites(currentInteraction, combinedPlayerState);
    }
  }, [currentInteraction, testPlayerState, editorTab, influenceManager, prestigeManager, alignmentManager]);

  // ======= Interaction Management Functions =======
  const createNewInteraction = () => {
    const newInteraction = {
      id: `interaction_${Date.now()}`,
      title: "New Interaction",
      description: "",
      content: "",
      characterTypeId: "",
      categoryId: "",
      options: [],
      prerequisites: {
        groups: [],
        showWhenUnavailable: true,
        unavailableMessage: ""
      },
      effects: {
        influenceChanges: [],
        prestigeChanges: [],
        alignmentChanges: []
      }
    };
    setCurrentInteraction(newInteraction);
    setEditMode(true);
    setViewMode(false);
    setCharacterTypeMode(false);
    setEditorTab('details');
  };

  const editInteraction = (interaction) => {
    const updatedInteraction = {
      ...interaction,
      prerequisites: interaction.prerequisites || {
        groups: [],
        showWhenUnavailable: true,
        unavailableMessage: ""
      },
      effects: {
        influenceChanges: interaction.effects?.influenceChanges || [],
        prestigeChanges: interaction.effects?.prestigeChanges || [],
        alignmentChanges: interaction.effects?.alignmentChanges || [],
        ...interaction.effects
      }
    };
    
    setCurrentInteraction(updatedInteraction);
    setEditMode(true);
    setViewMode(false);
    setCharacterTypeMode(false);
    setEditorTab('details');
  };

  const viewInteraction = (interaction) => {
    const completeInteraction = {
      ...interaction,
      prerequisites: interaction.prerequisites || {
        groups: [],
        showWhenUnavailable: true,
        unavailableMessage: ""
      },
      effects: {
        influenceChanges: interaction.effects?.influenceChanges || [],
        prestigeChanges: interaction.effects?.prestigeChanges || [],
        alignmentChanges: interaction.effects?.alignmentChanges || [],
        ...interaction.effects
      }
    };
    
    setCurrentInteraction(completeInteraction);
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
    if (!currentInteraction.id.trim()) {
      alert('ID cannot be empty');
      return;
    }
    
    if (!currentInteraction.title.trim()) {
      alert('Title cannot be empty');
      return;
    }

    const existingIndex = interactions.findIndex(i => i.id === currentInteraction.id);
    const isNew = existingIndex < 0;
    
    if (isNew && interactions.some(i => i.id === currentInteraction.id)) {
      alert('An interaction with this ID already exists. Please choose a unique ID.');
      return;
    }
    
    setLoading(true);
    
    try {
      if (existingIndex >= 0) {
        const updatedInteractions = [...interactions];
        updatedInteractions[existingIndex] = currentInteraction;
        setInteractions(updatedInteractions);
      } else {
        setInteractions([...interactions, currentInteraction]);
      }
      
      setEditMode(false);
      setCurrentInteraction(null);
    } catch (error) {
      console.error("Error saving interaction:", error);
      alert('Failed to save interaction.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
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

  // eslint-disable-next-line no-unused-vars
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

  // eslint-disable-next-line no-unused-vars
  const removeOption = (index) => {
    if (window.confirm('Are you sure you want to remove this option?')) {
      const updatedOptions = [...currentInteraction.options];
      updatedOptions.splice(index, 1);
      
      setCurrentInteraction({
        ...currentInteraction,
        options: updatedOptions
      });
    }
  };

  // eslint-disable-next-line no-unused-vars
  const updateTestPlayerState = (field, value) => {
    setTestPlayerState({
      ...testPlayerState,
      [field]: value
    });
  };

  // eslint-disable-next-line no-unused-vars
  const updateTestPrestige = (trackId, value) => {
    setTestPlayerState(prevState => {
      const newState = {...prevState};
      newState.prestige = {...prevState.prestige};
      newState.prestige[trackId] = {
        value: parseInt(value),
        level: prestigeTracks.find(t => t.id === trackId)?.levels
          .sort((a, b) => b.threshold - a.threshold)
          .find(l => parseInt(value) >= l.threshold)
      };
      return newState;
    });
  };

  // eslint-disable-next-line no-unused-vars
  const updateTestAlignment = (axisId, value) => {
    setTestPlayerState(prevState => {
      const newState = {...prevState};
      newState.alignment = {...prevState.alignment};
      
      const axis = alignmentAxes.find(a => a.id === axisId);
      const numValue = parseInt(value);
      
      if (axis && axis.zones) {
        newState.alignment[axisId] = {
          value: numValue,
          zone: axis.zones.find(z => numValue >= z.min && numValue <= z.max)
        };
      } else {
        newState.alignment[axisId] = {
          value: numValue
        };
      }
      return newState;
    });
  };

  // eslint-disable-next-line no-unused-vars
  const getCharacterTypeForInteraction = (interaction) => {
    if (!interaction || !interaction.characterTypeId) return null;
    return characterTypes.find(character => character.id === interaction.characterTypeId);
  };

  const getCategoryForInteraction = (interaction) => {
    if (!interaction || !interaction.categoryId) return null;
    return categories.find(c => c.id === interaction.categoryId);
  };

  // eslint-disable-next-line no-unused-vars
  const getInteractionCountForCharacterType = (characterTypeId) => {
    return interactions.filter(interaction => interaction.characterTypeId === characterTypeId).length;
  };

  const getFilteredInteractions = () => {
    let filtered = interactions;
    if (filterCharacterType) {
      filtered = filtered.filter(interaction => interaction.characterTypeId === filterCharacterType);
    }
    if (filterCategory) {
      filtered = filtered.filter(interaction => {
        const category = getCategoryForInteraction(interaction);
        if (!category) return false;
        // Fix unsafe parent reference by creating a closure-safe recursive function
        const isInCategory = (function() {
          const checkCategory = (categoryId) => {
            const cat = categories.find(c => c.id === categoryId);
            if (!cat) return false;
            if (cat.id === filterCategory) return true;
            if (cat.parentId) return checkCategory(cat.parentId);
            return false;
          };
          return checkCategory;
        })();
        return isInCategory(interaction.categoryId);
      });
    }
    return filtered;
  };

  const cancelEdit = () => {
    if (hasUnsavedChanges()) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        return;
      }
    }
    
    setEditMode(false);
    setCurrentInteraction(null);
  };
  
  const hasUnsavedChanges = () => {
    if (!currentInteraction) return false;
    
    if (!interactions.some(i => i.id === currentInteraction.id) && 
        currentInteraction.title === "New Interaction" &&
        !currentInteraction.description &&
        !currentInteraction.content &&
        currentInteraction.options.length === 0) {
      return false;
    }
    
    return true;
  };

  const exportData = () => {
    const data = {
      interactions,
      characterTypes,
      categories,
      influenceDomains,
      prestigeTracks,
      alignmentAxes
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
        setLoading(true);
        const importedData = JSON.parse(e.target.result);
        
        if (importedData.interactions) {
          const updatedInteractions = importedData.interactions.map(interaction => ({
            ...interaction,
            categoryId: interaction.categoryId || "", // Ensure categoryId exists
            prerequisites: interaction.prerequisites || {
              groups: [],
              showWhenUnavailable: true,
              unavailableMessage: ""
            },
            effects: {
              influenceChanges: interaction.effects?.influenceChanges || [],
              prestigeChanges: interaction.effects?.prestigeChanges || [],
              alignmentChanges: interaction.effects?.alignmentChanges || [],
              ...interaction.effects
            }
          }));
          
          setInteractions(updatedInteractions);
        }
        
        if (importedData.categories) {
          const updatedCategories = importedData.categories.map(category => ({
            ...category,
            parentId: category.parentId || "", // Ensure parentId exists
            order: typeof category.order === 'number' ? category.order : 0 // Ensure order exists
          }));
          setCategories(updatedCategories);
        }
        
        if (importedData.characterTypes) {
          setCharacterTypes(importedData.characterTypes);
        }
        
        if (importedData.influenceDomains) {
          setInfluenceDomains(importedData.influenceDomains);
        }
        
        if (importedData.prestigeTracks) {
          setPrestigeTracks(importedData.prestigeTracks);
        }
        
        if (importedData.alignmentAxes) {
          setAlignmentAxes(importedData.alignmentAxes);
        }
        
        alert('Import successful!');
      } catch (error) {
        alert('Failed to import data. Make sure the file is valid JSON.');
        console.error('Import error:', error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Character Type Management Functions
  const createNewCharacterType = () => {
    const newCharacterType = {
      id: `character_${Date.now()}`,
      name: "New Character Type",
      description: "",
      color: "#" + Math.floor(Math.random()*16777215).toString(16) // Random color
    };
    setCurrentCharacterType(newCharacterType);
    setCharacterTypeMode('edit');
    setEditMode(false);
    setViewMode(false);
  };

  const editCharacterType = (characterType) => {
    setCurrentCharacterType({...characterType});
    setCharacterTypeMode('edit');
    setEditMode(false);
    setViewMode(false);
  };

  const deleteCharacterType = (id) => {
    if (window.confirm('Are you sure you want to delete this character type?')) {
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
        setCharacterTypeMode('list');
      }
    }
  };

  const saveCharacterType = () => {
    if (!currentCharacterType.id.trim() || !currentCharacterType.name.trim()) {
      alert('ID and name cannot be empty');
      return;
    }

    const existingIndex = characterTypes.findIndex(n => n.id === currentCharacterType.id);
    
    if (existingIndex >= 0) {
      const updatedCharacterTypes = [...characterTypes];
      updatedCharacterTypes[existingIndex] = currentCharacterType;
      setCharacterTypes(updatedCharacterTypes);
    } else {
      setCharacterTypes([...characterTypes, currentCharacterType]);
    }
    
    setCharacterTypeMode('list');
    setCurrentCharacterType(null);
  };

  const cancelCharacterTypeEdit = () => {
    setCharacterTypeMode('list');
    setCurrentCharacterType(null);
  };

  // Personality Trait Management Functions
  const createNewTrait = () => {
    const newTrait = {
      id: `trait_${Date.now()}`,
      name: "New Trait",
      description: "",
      category: "",
      impact: {}
    };
    setCurrentTrait(newTrait);
    setEditMode(true);
  };

  const editTrait = (trait) => {
    setCurrentTrait(trait);
    setEditMode(true);
  };

  const deleteTrait = (traitId) => {
    setPersonalityTraits(prevTraits => prevTraits.filter(trait => trait.id !== traitId));
  };

  const saveTrait = () => {
    if (!currentTrait) return;

    setPersonalityTraits(prevTraits => {
      const existingIndex = prevTraits.findIndex(t => t.id === currentTrait.id);
      if (existingIndex >= 0) {
        const updated = [...prevTraits];
        updated[existingIndex] = currentTrait;
        return updated;
      } else {
        return [...prevTraits, currentTrait];
      }
    });

    setEditMode(false);
    setCurrentTrait(null);
  };

  const cancelTraitEdit = () => {
    setEditMode(false);
    setCurrentTrait(null);
  };

  // Load personality traits from localStorage on component mount
  useEffect(() => {
    const savedTraits = localStorage.getItem('personalityTraits');
    if (savedTraits) {
      setPersonalityTraits(JSON.parse(savedTraits));
    }
  }, []);

  // Save personality traits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('personalityTraits', JSON.stringify(personalityTraits));
  }, [personalityTraits]);

  return (
    <div className="interaction-manager">
      <div className="tab-container">
        <button 
          className={`tab ${activeTab === 'interactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('interactions')}
        >
          <span className="tab-icon"><Edit /></span>
          Interactions
        </button>
        <button 
          className={`tab ${activeTab === 'nodes' ? 'active' : ''}`}
          onClick={() => setActiveTab('nodes')}
        >
          <span className="tab-icon"><Plus /></span>
          Nodes
        </button>
        <button 
          className={`tab ${activeTab === 'characters' ? 'active' : ''}`}
          onClick={() => setActiveTab('characters')}
        >
          <span className="tab-icon"><Users /></span>
          Characters
        </button>
        <button 
          className={`tab ${activeTab === 'influence' ? 'active' : ''}`}
          onClick={() => setActiveTab('influence')}
        >
          <span className="tab-icon"><Scale /></span>
          Influence
        </button>
        <button 
          className={`tab ${activeTab === 'prestige' ? 'active' : ''}`}
          onClick={() => setActiveTab('prestige')}
        >
          <span className="tab-icon"><Crown /></span>
          Prestige
        </button>
        <button 
          className={`tab ${activeTab === 'alignment' ? 'active' : ''}`}
          onClick={() => setActiveTab('alignment')}
        >
          <span className="tab-icon"><Scale /></span>
          Alignment
        </button>
      </div>

      <div className="content-area">
        {activeTab === 'interactions' && (
          <div className="interactions-content">
            {!editMode && !viewMode && (
              <>
                <div className="controls">
                  <div className="mb-4 flex space-x-2">
                    <button 
                      onClick={exportData}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex-1"
                    >
                      Export
                    </button>
                    <label className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm flex-1 text-center cursor-pointer">
                      Import
                      <input 
                        type="file" 
                        accept=".json" 
                        onChange={importData} 
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Interactions</h2>
                    <button 
                      onClick={createNewInteraction} 
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                      title="Create new interaction"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Character Type</label>
                      <select 
                        value={filterCharacterType}
            onChange={(e) => setFilterCharacterType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="">All Character Types</option>
                        {characterTypes.map(characterType => (
                          <option key={characterType.id} value={characterType.id}>
                            {characterType.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
                      <select 
                        value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="interaction-list">
                  {getFilteredInteractions().map(interaction => {
                    const characterType = getCharacterTypeForInteraction(interaction);
                    const category = getCategoryForInteraction(interaction);
                    
                    return (
                      <div key={interaction.id} className="interaction-card">
                        <h3 className="title">{interaction.title}</h3>
                        <p className="description">{interaction.description || "No description provided."}</p>
                        
                        <div className="meta">
                          {characterType && (
                            <span 
                              className="character-tag"
                              style={{
                                backgroundColor: `${characterType.color}20`,
                                color: characterType.color
                              }}
                            >
                              <Users size={14} className="mr-1" />
                              {characterType.name}
                            </span>
                          )}
                          
                          {category && (
                            <span 
                              className="category-tag"
                              style={{
                                backgroundColor: `${category.color}20`,
                                color: category.color
                              }}
                            >
                              {category.name}
                            </span>
                          )}
                        </div>

                        <div className="stat-pills">
                          {interaction.prerequisites?.groups?.length > 0 && (
                            <span className="stat-pill">
                              <Users size={14} />
                              {interaction.prerequisites.groups.length} Prerequisites
                            </span>
                          )}
                          
                          {interaction.effects?.influenceChanges?.length > 0 && (
                            <span className="stat-pill">
                              <Users size={14} />
                              {interaction.effects.influenceChanges.length} Influence
                            </span>
                          )}
                          
                          {interaction.effects?.prestigeChanges?.length > 0 && (
                            <span className="stat-pill">
                              <Crown size={14} />
                              {interaction.effects.prestigeChanges.length} Prestige
                            </span>
                          )}
                          
                          {interaction.effects?.alignmentChanges?.length > 0 && (
                            <span className="stat-pill">
                              <Scale size={14} />
                              {interaction.effects.alignmentChanges.length} Alignment
                            </span>
                          )}
                        </div>

                        <div className="actions">
                          <button 
                            onClick={() => viewInteraction(interaction)}
                            className="action-btn view"
                          >
                            <Eye size={16} />
                            View
                          </button>
                          <button 
                            onClick={() => editInteraction(interaction)}
                            className="action-btn edit"
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteInteraction(interaction.id)}
                            className="action-btn delete"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {getFilteredInteractions().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {filterCharacterType || filterCategory ? 'No interactions for this filter.' : 'No interactions yet. Create your first one!'}
                    </div>
                  )}
                </div>
              </>
            )}
            
            {(editMode || viewMode) && currentInteraction && (
              <div className="interaction-editor p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {viewMode ? "View Interaction" : editMode ? "Edit Interaction" : ""}
                  </h2>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setViewMode(false);
                      setCurrentInteraction(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={currentInteraction.title}
                      onChange={(e) => setCurrentInteraction({
                        ...currentInteraction,
                        title: e.target.value
                      })}
                      disabled={viewMode}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={currentInteraction.description}
                      onChange={(e) => setCurrentInteraction({
                        ...currentInteraction,
                        description: e.target.value
                      })}
                      disabled={viewMode}
                      className="w-full p-2 border border-gray-300 rounded h-24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Character Type</label>
                    <select
                      value={currentInteraction.characterTypeId}
                      onChange={(e) => setCurrentInteraction({
                        ...currentInteraction,
                        characterTypeId: e.target.value
                      })}
                      disabled={viewMode}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="">Select Character Type</option>
                      {characterTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={currentInteraction.categoryId}
                      onChange={(e) => setCurrentInteraction({
                        ...currentInteraction,
                        categoryId: e.target.value
                      })}
                      disabled={viewMode}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  {!viewMode && (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveInteraction}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'nodes' && (
          <div className="nodes-content">
            <NodeTypeCreator nodeTypeSystem={nodeTypeSystem} />
          </div>
        )}

        {activeTab === 'influence' && (
          <div className="influence-content p-4">
            <h2 className="text-lg font-semibold mb-4">Influence System</h2>
            <InfluenceDomainManager 
              influenceDomains={influenceDomains} 
              setInfluenceDomains={(domains) => {
                setInfluenceDomains(domains);
                influenceManager.domains = domains;
                localStorage.setItem('influenceDomains', JSON.stringify(domains));
              }} 
            />
          </div>
        )}

        {activeTab === 'prestige' && (
          <div className="prestige-content p-4">
            <h2 className="text-lg font-semibold mb-4">Prestige System</h2>
            <PrestigeTrackManager 
              prestigeTracks={prestigeTracks} 
              setPrestigeTracks={(tracks) => {
                setPrestigeTracks(tracks);
                prestigeManager.tracks = tracks;
                localStorage.setItem('prestigeTracks', JSON.stringify(tracks));
              }} 
            />
          </div>
        )}

        {activeTab === 'alignment' && (
          <div className="alignment-content p-4">
            <h2 className="text-lg font-semibold mb-4">Alignment System</h2>
            <AlignmentAxisManager 
              alignmentAxes={alignmentAxes} 
              setAlignmentAxes={(axes) => {
                setAlignmentAxes(axes);
                alignmentManager.axes = axes;
                localStorage.setItem('alignmentAxes', JSON.stringify(axes));
              }} 
            />
          </div>
        )}
        
        {activeTab === 'characters' && (
          <div className="characters-content">
            <div className={characterTabStyles.characterTabBar}>
              <Tooltip content="View and manage the different character types in your world. Connect them to interactions to control who can perform actions."><button
                className={`${characterTabStyles.tabButton} ${characterTypeMode === 'types' ? characterTabStyles.active : ''}`}
                onClick={() => setCharacterTypeMode('types')}
              >
                Character Types <Info size={16} style={{marginLeft: 4, verticalAlign: 'middle'}} />
              </button></Tooltip>
              <Tooltip content="Define personality traits that can be assigned to character types. Traits can influence behavior and interactions."><button
                className={`${characterTabStyles.tabButton} ${characterTypeMode === 'traits' ? characterTabStyles.active : ''}`}
                onClick={() => setCharacterTypeMode('traits')}
              >
                Personality Traits <Info size={16} style={{marginLeft: 4, verticalAlign: 'middle'}} />
              </button></Tooltip>
              <div className={characterTabStyles.tabBarSpacer} />
              <Tooltip content="Create a new character type. You can assign a name, description, and color."><button
                className={characterTabStyles.addButton}
                onClick={createNewCharacterType}
                title="Create new character type"
              >
                <Plus size={22} />
              </button></Tooltip>
            </div>
            {characterTypeMode === 'types' && <CharacterTabInfo />}

            {characterTypeMode === 'traits' && (
              <div className="personality-traits-content p-4">
                {editMode && currentTrait ? (
                  <div className="trait-editor p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">
                        {currentTrait.id ? "Edit Trait" : "New Trait"}
                      </h2>
                      <button
                        onClick={cancelTraitEdit}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={currentTrait.name}
                          onChange={(e) => setCurrentTrait({
                            ...currentTrait,
                            name: e.target.value
                          })}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={currentTrait.description}
                          onChange={(e) => setCurrentTrait({
                            ...currentTrait,
                            description: e.target.value
                          })}
                          className="w-full p-2 border border-gray-300 rounded h-24"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                          type="text"
                          value={currentTrait.category}
                          onChange={(e) => setCurrentTrait({
                            ...currentTrait,
                            category: e.target.value
                          })}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={cancelTraitEdit}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveTrait}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {personalityTraits.map(trait => (
                        <div
                          key={trait.id}
                          className="bg-white rounded border border-gray-200 p-3"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{trait.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{trait.description}</p>
                              {trait.category && (
                                <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
                                  {trait.category}
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => editTrait(trait)}
                                className="text-amber-600 hover:text-amber-700"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteTrait(trait.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {personalityTraits.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No personality traits yet. Create your first one!
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Character Type Edit Form */}
            {characterTypeMode === 'edit' && currentCharacterType && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {currentCharacterType.id ? 'Edit Character Type' : 'Create New Character Type'}
                  </h3>
                  <button
                    onClick={cancelCharacterTypeEdit}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID</label>
                    <input
                      type="text"
                      value={currentCharacterType.id}
                      onChange={(e) => setCurrentCharacterType({...currentCharacterType, id: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="unique_id"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={currentCharacterType.name}
                      onChange={(e) => setCurrentCharacterType({...currentCharacterType, name: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Character Type Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      value={currentCharacterType.description}
                      onChange={(e) => setCurrentCharacterType({...currentCharacterType, description: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Brief description of this character type"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={currentCharacterType.color}
                        onChange={(e) => setCurrentCharacterType({...currentCharacterType, color: e.target.value})}
                        className="p-1 border border-gray-300 dark:border-gray-600 rounded-lg h-10 w-20"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{currentCharacterType.color}</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={cancelCharacterTypeEdit}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveCharacterType}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractionManagerWithSystems;
