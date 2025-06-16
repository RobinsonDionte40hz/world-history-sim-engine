import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Crown, Scale, X, List, Star } from 'lucide-react';
import { validatePrerequisites } from '../../../systems/interaction/PrerequisiteSystem';
import { InfluenceManager, InfluenceDomainManager } from '../../../systems/interaction/InfluenceSystem';
import { PrestigeManager, PrestigeTrackManager } from '../../../systems/interaction/PrestigeSystem';
import { AlignmentManager, AlignmentAxisManager } from '../../../systems/interaction/AlignmentSystem';
import Tooltip from '../../../components/common/Tooltip';
import { Info } from 'lucide-react';
import styles from './InteractionManager.module.css';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    saveInteraction();
  };

  const updateInteraction = (field, value) => {
    setCurrentInteraction(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'interactions':
        return (
          <div className={styles.content}>
            <div className={styles.interactionList}>
              {getFilteredInteractions().map(interaction => (
                <div key={interaction.id} className={styles.interactionCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{interaction.title}</h3>
                    <div className={styles.cardActions}>
                      <button 
                        className={`${styles.actionButton} ${styles.view}`}
                        onClick={() => viewInteraction(interaction)}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className={`${styles.actionButton} ${styles.edit}`}
                        onClick={() => editInteraction(interaction)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className={`${styles.actionButton} ${styles.delete}`}
                        onClick={() => deleteInteraction(interaction.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className={styles.cardDescription}>{interaction.description}</p>
                  <div className={styles.cardMeta}>
                    {interaction.categoryId && (
                      <span className={styles.tag}>
                        {getCategoryForInteraction(interaction)?.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'influence':
        return (
          <InfluenceDomainManager 
            influenceDomains={influenceDomains}
            setInfluenceDomains={setInfluenceDomains}
          />
        );
      case 'prestige':
        return (
          <PrestigeTrackManager 
            prestigeTracks={prestigeTracks}
            setPrestigeTracks={setPrestigeTracks}
          />
        );
      case 'alignment':
        return (
          <AlignmentAxisManager 
            alignmentAxes={alignmentAxes}
            setAlignmentAxes={setAlignmentAxes}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Interaction Manager</h1>
        <button className={styles.button} onClick={createNewInteraction}>
          <Plus size={18} />
          New Interaction
        </button>
      </div>

      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'interactions' ? styles.active : ''}`}
          onClick={() => setActiveTab('interactions')}
        >
          <List size={18} />
          Interactions
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'influence' ? styles.active : ''}`}
          onClick={() => setActiveTab('influence')}
        >
          <Crown size={18} />
          Influence
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'prestige' ? styles.active : ''}`}
          onClick={() => setActiveTab('prestige')}
        >
          <Star size={18} />
          Prestige
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'alignment' ? styles.active : ''}`}
          onClick={() => setActiveTab('alignment')}
        >
          <Scale size={18} />
          Alignment
        </button>
      </div>

      <div className={styles.content}>
        {renderContent()}
      </div>

      {editMode && currentInteraction && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Title</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={currentInteraction.title}
                  onChange={(e) => updateInteraction('title', e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={styles.formInput}
                  value={currentInteraction.description}
                  onChange={(e) => updateInteraction('description', e.target.value)}
                />
              </div>
              {/* Add more form fields as needed */}
              <div className={styles.cardActions}>
                <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
                  Save
                </button>
                <button 
                  type="button" 
                  className={styles.button}
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractionManagerWithSystems;
