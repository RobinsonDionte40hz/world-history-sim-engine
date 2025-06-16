import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Crown, Scale, X } from 'lucide-react';
import { validatePrerequisites } from '../../../systems/interaction/PrerequisiteSystem';
import { InfluenceManager, InfluenceDomainManager } from '../../../systems/interaction/InfluenceSystem';
import { PrestigeManager, PrestigeTrackManager } from '../../../systems/interaction/PrestigeSystem';
import { AlignmentManager, AlignmentAxisManager } from '../../../systems/interaction/AlignmentSystem';
import Tooltip from '../../../components/common/Tooltip';
import { Info } from 'lucide-react';

const InteractionManagerWithSystems = ({ initialTab = 'interactions' }) => {
  // Main data states
  const [interactions, setInteractions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [influenceDomains, setInfluenceDomains] = useState([]);
  const [prestigeTracks, setPrestigeTracks] = useState([]);
  const [alignmentAxes, setAlignmentAxes] = useState([]);
  
  // UI states
  const [currentInteraction, setCurrentInteraction] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editorTab, setEditorTab] = useState('details');
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");

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

  const getCategoryForInteraction = (interaction) => {
    if (!interaction || !interaction.categoryId) return null;
    return categories.find(c => c.id === interaction.categoryId);
  };

  const getFilteredInteractions = () => {
    let filtered = interactions;
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

  return (
    <div className="interaction-manager bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="tab-container flex space-x-1 p-4 bg-white dark:bg-gray-800 shadow-sm">
        <button 
          className={`tab flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === 'interactions' 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => setActiveTab('interactions')}
        >
          <span className="tab-icon mr-2"><Edit size={18} /></span>
          Interactions
        </button>
        <button 
          className={`tab flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === 'influence' 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => setActiveTab('influence')}
        >
          <span className="tab-icon mr-2"><Scale size={18} /></span>
          Influence
        </button>
        <button 
          className={`tab flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === 'prestige' 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => setActiveTab('prestige')}
        >
          <span className="tab-icon mr-2"><Crown size={18} /></span>
          Prestige
        </button>
        <button 
          className={`tab flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === 'alignment' 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => setActiveTab('alignment')}
        >
          <span className="tab-icon mr-2"><Scale size={18} /></span>
          Alignment
        </button>
      </div>

      <div className="content-container p-4">
        {activeTab === 'interactions' && (
          <div className="interactions-content">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Interactions</h2>
              <button
                onClick={createNewInteraction}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-sm"
              >
                <Plus size={18} className="mr-2" />
                New Interaction
              </button>
            </div>

            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Category</label>
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <div className="interaction-list space-y-4">
              {getFilteredInteractions().map(interaction => {
                const category = getCategoryForInteraction(interaction);
                
                return (
                  <div 
                    key={interaction.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {interaction.title}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewInteraction(interaction)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => editInteraction(interaction)}
                            className="p-1 text-blue-500 hover:text-blue-600 transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => deleteInteraction(interaction.id)}
                            className="p-1 text-red-500 hover:text-red-600 transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {interaction.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {category && (
                          <span 
                            className="px-2 py-1 text-sm rounded-full"
                            style={{
                              backgroundColor: `${category.color}20`,
                              color: category.color
                            }}
                          >
                            {category.name}
                          </span>
                        )}
                        
                        {interaction.prerequisites?.groups?.length > 0 && (
                          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            {interaction.prerequisites.groups.length} Prerequisites
                          </span>
                        )}
                        
                        {interaction.effects?.influenceChanges?.length > 0 && (
                          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            {interaction.effects.influenceChanges.length} Influence
                          </span>
                        )}
                        
                        {interaction.effects?.prestigeChanges?.length > 0 && (
                          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            <Crown size={14} className="inline mr-1" />
                            {interaction.effects.prestigeChanges.length} Prestige
                          </span>
                        )}
                        
                        {interaction.effects?.alignmentChanges?.length > 0 && (
                          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            <Scale size={14} className="inline mr-1" />
                            {interaction.effects.alignmentChanges.length} Alignment
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {getFilteredInteractions().length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="text-gray-500 dark:text-gray-400 mb-2">
                    {filterCategory ? 'No interactions found for this filter.' : 'No interactions yet.'}
                  </div>
                  {!filterCategory && (
                    <button
                      onClick={createNewInteraction}
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      <Plus size={18} className="mr-2" />
                      Create your first interaction
                    </button>
                  )}
                </div>
              )}
            </div>
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

        {(editMode || viewMode) && currentInteraction && (
          <div className="interaction-editor bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {viewMode ? "View Interaction" : editMode ? "Edit Interaction" : ""}
              </h2>
              <button
                onClick={() => {
                  if (hasUnsavedChanges()) {
                    if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
                      setEditMode(false);
                      setViewMode(false);
                      setCurrentInteraction(null);
                    }
                  } else {
                    setEditMode(false);
                    setViewMode(false);
                    setCurrentInteraction(null);
                  }
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={currentInteraction.title}
                  onChange={(e) => setCurrentInteraction({
                    ...currentInteraction,
                    title: e.target.value
                  })}
                  disabled={viewMode}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter interaction title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={currentInteraction.description}
                  onChange={(e) => setCurrentInteraction({
                    ...currentInteraction,
                    description: e.target.value
                  })}
                  disabled={viewMode}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 min-h-[100px]"
                  placeholder="Enter interaction description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={currentInteraction.categoryId}
                  onChange={(e) => setCurrentInteraction({
                    ...currentInteraction,
                    categoryId: e.target.value
                  })}
                  disabled={viewMode}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {!viewMode && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveInteraction}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractionManagerWithSystems;
