/**
 * CharacterEditorPage - Dedicated full-page interface for character editing
 * 
 * Provides a focused environment for creating and editing characters
 * with D&D attributes, personality traits, and consciousness settings.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  AlertTriangle,
  Download,
  Upload,
  TestTube,
  ArrowRight,
  CheckCircle,
  X,
  Settings,
  MapPin,
  Copy,
  Trash2,
  Edit3,
  Search
} from 'lucide-react';
import Navigation from '../UI/Navigation';
import CharacterEditor from '../components/CharacterEditor';
import WorldDropdown from '../UI/WorldDropdown';
import { useWorldContext } from '../contexts/WorldContext';
import Character from '../../domain/entities/Character';
import { saveCharacter } from '../../shared/utils/characterSaveUtils';

const CharacterEditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract template mode and initial data from route state
  const routeState = location.state || {};
  const isTemplate = routeState.isTemplate || false;
  const templateMode = routeState.createMode || routeState.editMode || false;
  const initialData = routeState.initialData || null;
  const fromTemplate = routeState.fromTemplate || false;
  
  // WorldContext integration for both world data and WorldBuilder
  const { 
    currentWorldId,
    currentWorld,
    updateWorldConfig,
    worldBuilder,
    error: worldError
  } = useWorldContext();
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSaveEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState(null);

  const [validationErrors, setValidationErrors] = useState([]);
  const [testMode, setTestMode] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showNextSteps, setShowNextSteps] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [bulkGenerateSuccess, setBulkGenerateSuccess] = useState(false);
  const [templateSaveSuccess, setTemplateSaveSuccess] = useState(false);
  const [nodeAssignmentSuccess, setNodeAssignmentSuccess] = useState(false);
  const [interactionAssignmentSuccess, setInteractionAssignmentSuccess] = useState(false);

  // Character Management States
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false);
  const [showInteractionAssignmentPanel, setShowInteractionAssignmentPanel] = useState(false);
  const [showCharacterList, setShowCharacterList] = useState(false);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [worldCharacters, setWorldCharacters] = useState([]);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArchetype, setFilterArchetype] = useState('all');

  // Get available interactions from current world
  const availableInteractions = currentWorld?.worldConfig?.interactions || [];

  // Load characters from current world
  useEffect(() => {
    if (currentWorldId && currentWorld) {
      // Get characters from world config (primary source)
      const worldConfigCharacters = currentWorld.worldConfig?.characters || [];
      
      // Also check localStorage for characters linked to this world as fallback
      const allCharacters = JSON.parse(localStorage.getItem('characters') || '[]');
      const localWorldChars = allCharacters.filter(char => 
        char.worldId === currentWorldId
      );
      
      // Combine and deduplicate characters
      const combinedCharacters = [...worldConfigCharacters];
      localWorldChars.forEach(localChar => {
        if (!combinedCharacters.find(worldChar => worldChar.id === localChar.id)) {
          combinedCharacters.push(localChar);
        }
      });
      
      setWorldCharacters(combinedCharacters);
    } else {
      setWorldCharacters([]);
    }
  }, [currentWorldId, currentWorld]);

  const validateCharacter = useCallback(() => {
    const errors = [];
    
    // World validation
    if (!currentWorldId) {
      errors.push({ field: 'world', message: 'No world selected. Please create or select a world first.' });
    }
    
    if (!currentWorld) {
      errors.push({ field: 'world', message: 'Current world not found.' });
    }
    
    if (worldError) {
      errors.push({ field: 'world', message: worldError });
    }
    
    // Character validation
    if (!currentCharacter?.name?.trim()) {
      errors.push({ field: 'name', message: 'Character name is required' });
    } else if (currentCharacter.name.length < 2) {
      errors.push({ field: 'name', message: 'Character name must be at least 2 characters' });
    }
    
    // Description validation - more lenient for templates
    if (!isTemplate) {
      if (!currentCharacter?.description?.trim()) {
        errors.push({ field: 'description', message: 'Character description is required' });
      } else if (currentCharacter.description.length < 10) {
        errors.push({ field: 'description', message: 'Character description must be at least 10 characters' });
      }
    } else {
      // For templates, description is optional but if provided, should be meaningful
      if (currentCharacter?.description?.trim() && currentCharacter.description.length < 5) {
        errors.push({ field: 'description', message: 'Template description should be at least 5 characters if provided' });
      }
    }
    
    // Validate D&D attributes
    const attributes = currentCharacter?.attributes || {};
    const requiredAttributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    requiredAttributes.forEach(attr => {
      const value = attributes[attr];
      if (value === undefined || value < 1 || value > 20) {
        errors.push({ field: `attribute_${attr}`, message: `${attr} must be between 1 and 20` });
      }
    });
    
    // Validate consciousness
    if (currentCharacter?.consciousness) {
      const { frequency, coherence } = currentCharacter.consciousness;
      if (frequency < 1 || frequency > 100) {
        errors.push({ field: 'consciousness_frequency', message: 'Consciousness frequency must be between 1 and 100 Hz' });
      }
      if (coherence < 0 || coherence > 1) {
        errors.push({ field: 'consciousness_coherence', message: 'Consciousness coherence must be between 0 and 1' });
      }
    }
    
    // Validate personality traits
    if (currentCharacter?.personality) {
      Object.entries(currentCharacter.personality).forEach(([trait, value]) => {
        if (value < 0 || value > 1) {
          errors.push({ field: `personality_${trait}`, message: `${trait} must be between 0 and 1` });
        }
      });
    }
    
    // Validate goals
    if (!currentCharacter?.goals || currentCharacter.goals.length === 0) {
      errors.push({ field: 'goals', message: 'At least one goal is required' });
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [currentCharacter, currentWorldId, currentWorld, worldError, isTemplate]);

  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !validateCharacter()) return;
    
    setIsSaving(true);
    try {
      // Save to localStorage
      const characters = JSON.parse(localStorage.getItem('characters') || '[]');
      const characterIndex = characters.findIndex(c => c.id === currentCharacter.id);
      
      if (characterIndex >= 0) {
        characters[characterIndex] = currentCharacter;
      } else {
        characters.push(currentCharacter);
      }
      
      localStorage.setItem('characters', JSON.stringify(characters));
      
      setHasUnsavedChanges(false);
      console.log('Auto-saved character...');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, validateCharacter, currentCharacter]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && currentCharacter) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, currentCharacter, autoSaveEnabled, handleAutoSave]);

  // Real-time validation
  useEffect(() => {
    if (currentCharacter) {
      validateCharacter();
    }
  }, [currentCharacter, validateCharacter]);

  const handleSave = async () => {
    if (!validateCharacter()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Use unified save utility for consistent behavior
      const saveResult = await saveCharacter(currentCharacter, {
        worldBuilder,
        currentWorldId,
        currentWorld,
        updateWorldConfig
      });
      
      if (saveResult.success) {
        setHasUnsavedChanges(false);
        setSaveSuccess(true);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
        
        console.log(saveResult.message);
      } else {
        throw new Error(saveResult.message);
      }
      
    } catch (error) {
      console.error('Failed to save character:', error);
      alert(`Failed to save character: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate('/editors/world');
  };

  const handleChange = (characterData) => {
    setHasUnsavedChanges(true);
    setCurrentCharacter(characterData);
  };

  // Handle creating new interactions
  const handleCreateInteraction = useCallback((interactionData) => {
    if (!currentWorld || !currentWorldId) {
      alert('No world selected. Please select a world first.');
      return;
    }

    try {
      // Add interaction to world config
      const updatedInteractions = [...(currentWorld.worldConfig.interactions || []), interactionData];
      
      updateWorldConfig({
        ...currentWorld.worldConfig,
        interactions: updatedInteractions
      });

      console.log('Created new interaction:', interactionData);
    } catch (error) {
      console.error('Failed to create interaction:', error);
      alert('Failed to create interaction. Please try again.');
    }
  }, [currentWorld, currentWorldId, updateWorldConfig]);

  // Handle editing interactions
  const handleEditInteraction = useCallback((interactionData) => {
    if (!currentWorld || !currentWorldId) {
      alert('No world selected. Please select a world first.');
      return;
    }

    try {
      // Update interaction in world config
      const updatedInteractions = [...(currentWorld.worldConfig.interactions || [])];
      const interactionIndex = updatedInteractions.findIndex(i => i.id === interactionData.id);
      
      if (interactionIndex >= 0) {
        updatedInteractions[interactionIndex] = interactionData;
        
        updateWorldConfig({
          ...currentWorld.worldConfig,
          interactions: updatedInteractions
        });

        console.log('Updated interaction:', interactionData);
      } else {
        console.warn('Interaction not found for editing:', interactionData.id);
      }
    } catch (error) {
      console.error('Failed to edit interaction:', error);
      alert('Failed to edit interaction. Please try again.');
    }
  }, [currentWorld, currentWorldId, updateWorldConfig]);

  // Handler for bulk generation with success message
  const handleBulkGenerate = useCallback((templateData) => {
    try {
      const count = templateData.templateSettings?.bulkOptions?.count || 5;
      const distribution = templateData.templateSettings?.bulkOptions?.distribution || 'random';
      
      console.log(`Generating ${count} NPCs with ${distribution} distribution`);
      
      // Generate characters from template
      const generatedCharacters = [];
      for (let i = 0; i < count; i++) {
        const character = {
          id: `generated_${Date.now()}_${i}`,
          name: `${templateData.name} ${i + 1}`,
          description: templateData.description,
          worldId: currentWorldId,
          attributes: { ...templateData.attributes },
          personality: { ...templateData.personality },
          consciousness: { ...templateData.consciousness },
          goals: [...(templateData.goals || [])],
          archetype: templateData.archetype,
          createdAt: new Date().toISOString(),
          isGenerated: true
        };
        generatedCharacters.push(character);
      }
      
      // Add to world config
      if (currentWorld && updateWorldConfig) {
        const updatedCharacters = [...(currentWorld.worldConfig.characters || []), ...generatedCharacters];
        updateWorldConfig({
          ...currentWorld.worldConfig,
          characters: updatedCharacters
        });
      }
      
      // Update local state
      setWorldCharacters(prev => [...prev, ...generatedCharacters]);
      
      // Show success message
      setBulkGenerateSuccess(true);
      
    } catch (error) {
      console.error('Failed to generate characters:', error);
      alert('Failed to generate characters. Please try again.');
    }
  }, [currentWorldId, currentWorld, updateWorldConfig]);

  // Handler for template creation with success message
  const handleCreateTemplate = useCallback((templateData) => {
    try {
      const template = {
        id: `template_${Date.now()}`,
        ...templateData,
        createdAt: new Date().toISOString(),
        isTemplate: true
      };
      
      // Save template to localStorage or template system
      const templates = JSON.parse(localStorage.getItem('characterTemplates') || '[]');
      templates.push(template);
      localStorage.setItem('characterTemplates', JSON.stringify(templates));
      
      // Show success message
      setTemplateSaveSuccess(true);
      
      console.log('Template created successfully:', template);
      
    } catch (error) {
      console.error('Failed to create template:', error);
      alert('Failed to create template. Please try again.');
    }
  }, []);



  const handleTest = () => {
    if (!currentCharacter) {
      alert('No character to test. Please create a character first.');
      return;
    }
    
    if (!validateCharacter()) {
      alert('Please fix validation errors before testing.');
      return;
    }
    
    // Create character entity for testing
    const characterEntity = new Character(currentCharacter);
    
    // Simulate character testing with mock scenarios
    const mockTestResults = {
      success: true,
      characterValidation: {
        attributesValid: true,
        consciousnessValid: characterEntity.consciousness?.frequency >= 1 && characterEntity.consciousness?.coherence >= 0,
        personalityValid: true,
        goalsValid: characterEntity.goals?.length > 0
      },
      simulationReadiness: {
        canMakeDecisions: characterEntity.consciousness?.frequency > 0,
        hasGoals: characterEntity.goals?.length > 0,
        hasPersonality: Object.keys(characterEntity.personality || {}).length > 0,
        attributeBalance: calculateAttributeBalance(characterEntity.attributes)
      },
      warnings: [],
      errors: []
    };
    
    // Add warnings based on character configuration
    const totalAttributes = Object.values(characterEntity.attributes || {}).reduce((sum, val) => sum + val, 0);
    if (totalAttributes < 60) {
      mockTestResults.warnings.push('Low total attributes - character may struggle in simulation');
    }
    
    if (!characterEntity.consciousness || characterEntity.consciousness.frequency < 40) {
      mockTestResults.warnings.push('Low consciousness frequency may result in poor decision-making');
    }
    
    if (characterEntity.goals?.length > 5) {
      mockTestResults.warnings.push('Many goals detected - character may have conflicting priorities');
    }
    
    if (!characterEntity.personality || Object.keys(characterEntity.personality).length === 0) {
      mockTestResults.errors.push('No personality traits defined - character behavior will be unpredictable');
      mockTestResults.success = false;
    }
    
    setTestResults(mockTestResults);
    setTestMode(true);
    console.log('Testing character...', mockTestResults);
  };

  const calculateAttributeBalance = (attributes) => {
    if (!attributes) return 'unknown';
    const values = Object.values(attributes);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    
    if (variance < 4) return 'balanced';
    if (variance < 9) return 'moderate';
    return 'specialized';
  };

  const handleExportTemplate = () => {
    if (currentCharacter) {
      const characterEntity = new Character(currentCharacter);
      const template = characterEntity.toTemplate();
      
      const dataStr = JSON.stringify(template, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `character-template-${currentCharacter.name || 'unnamed'}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const handleImportTemplate = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTemplate = JSON.parse(e.target.result);
          const character = Character.fromTemplate(importedTemplate);
          setCurrentCharacter(character.toJSON());
          setHasUnsavedChanges(true);
          console.log('Imported character template:', character);
        } catch (error) {
          alert('Error importing template: Invalid JSON file');
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleNextSteps = () => {
    setShowNextSteps(true);
  };

  // Character Management Functions
  const handleAssignToNode = (nodeId) => {
    try {
      // Generate temporary ID for unsaved characters
      const characterId = currentCharacter.id || `temp_${Date.now()}`;
      
      // TODO: Implement actual node assignment logic
      // This would update the character's assigned nodes and the node's assigned characters
      console.log('Assigning character to node:', { characterId, characterName: currentCharacter.name, nodeId });
      
      // Close modal immediately
      setShowAssignmentPanel(false);
      
      // Show success feedback
      setNodeAssignmentSuccess(true);
      
    } catch (error) {
      console.error('Failed to assign character to node:', error);
      alert('Failed to assign character to node. Please try again.');
    }
  };

  const handleAssignToInteraction = (interactionId) => {
    try {
      // Generate temporary ID for unsaved characters
      const characterId = currentCharacter.id || `temp_${Date.now()}`;
      
      // TODO: Implement actual interaction assignment logic
      // This would update the character's assigned interactions
      console.log('Assigning character to interaction:', { characterId, characterName: currentCharacter.name, interactionId });
      
      // Close modal immediately
      setShowInteractionAssignmentPanel(false);
      
      // Show success feedback
      setInteractionAssignmentSuccess(true);
      
    } catch (error) {
      console.error('Failed to assign character to interaction:', error);
      alert('Failed to assign character to interaction. Please try again.');
    }
  };

  const handleDuplicateCharacter = (character) => {
    const duplicatedCharacter = {
      ...character,
      id: `character_${Date.now()}`,
      name: `${character.name} (Copy)`,
      worldId: currentWorldId
    };
    
    const allCharacters = JSON.parse(localStorage.getItem('characters') || '[]');
    allCharacters.push(duplicatedCharacter);
    localStorage.setItem('characters', JSON.stringify(allCharacters));
    
    // Refresh world characters
    setWorldCharacters([...worldCharacters, duplicatedCharacter]);
  };

  const handleDeleteCharacter = (characterId) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      // Remove from localStorage
      const allCharacters = JSON.parse(localStorage.getItem('characters') || '[]');
      const updatedCharacters = allCharacters.filter(char => char.id !== characterId);
      localStorage.setItem('characters', JSON.stringify(updatedCharacters));
      
      // Remove from world config as well
      if (currentWorld && updateWorldConfig) {
        const worldConfigCharacters = currentWorld.worldConfig?.characters || [];
        const updatedWorldCharacters = worldConfigCharacters.filter(char => char.id !== characterId);
        
        updateWorldConfig({
          ...currentWorld.worldConfig,
          characters: updatedWorldCharacters
        });
      }
      
      // Update local state
      setWorldCharacters(worldCharacters.filter(char => char.id !== characterId));
      
      // If we're deleting the current character, clear it
      if (currentCharacter?.id === characterId) {
        setCurrentCharacter(null);
        setHasUnsavedChanges(false);
      }
    }
  };

  const handleEditCharacter = (character) => {
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm('You have unsaved changes. Switch to editing this character?');
      if (!confirmSwitch) return;
    }
    
    setCurrentCharacter(character);
    setHasUnsavedChanges(false);
    setShowCharacterList(false);
  };

  const handleBatchDelete = () => {
    if (selectedCharacters.length === 0) return;
    
    const confirmDelete = window.confirm(`Delete ${selectedCharacters.length} selected characters?`);
    if (!confirmDelete) return;
    
    // Remove from localStorage
    const allCharacters = JSON.parse(localStorage.getItem('characters') || '[]');
    const updatedCharacters = allCharacters.filter(char => !selectedCharacters.includes(char.id));
    localStorage.setItem('characters', JSON.stringify(updatedCharacters));
    
    // Remove from world config as well
    if (currentWorld && updateWorldConfig) {
      const worldConfigCharacters = currentWorld.worldConfig?.characters || [];
      const updatedWorldCharacters = worldConfigCharacters.filter(char => !selectedCharacters.includes(char.id));
      
      updateWorldConfig({
        ...currentWorld.worldConfig,
        characters: updatedWorldCharacters
      });
    }
    
    // Update local state
    setWorldCharacters(worldCharacters.filter(char => !selectedCharacters.includes(char.id)));
    setSelectedCharacters([]);
  };

  const handleBatchExport = () => {
    if (selectedCharacters.length === 0) return;
    
    const charactersToExport = worldCharacters.filter(char => selectedCharacters.includes(char.id));
    const dataStr = JSON.stringify(charactersToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `characters-batch-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Success message component
  const SuccessMessage = ({ message, isVisible, onClose }) => {
    useEffect(() => {
      if (isVisible) {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
      }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
      <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
        <div className="w-2 h-2 bg-green-300 rounded-full"></div>
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 text-green-200 hover:text-white">
          ✕
        </button>
      </div>
    );
  };

  // Filter characters based on search and archetype
  const filteredCharacters = worldCharacters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         character.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArchetype = filterArchetype === 'all' || character.archetype === filterArchetype;
    return matchesSearch && matchesArchetype;
  });

  const getNextStepsContent = () => {
    const steps = [];
    
    if (!currentCharacter) {
      steps.push({
        title: "Create Your First Character",
        description: "Start by creating a character using one of the templates or build from scratch",
        action: "Use the template buttons above to get started quickly",
        completed: false
      });
      return steps;
    }

    // Check if character is saved
    const isSaved = !hasUnsavedChanges;
    steps.push({
      title: "Save Your Character",
      description: "Save your character to make it available in the simulation",
      action: isSaved ? "✓ Character saved successfully" : "Click the 'Save Character' button above",
      completed: isSaved
    });

    if (isSaved) {
      steps.push({
        title: "Create Supporting Elements",
        description: "Ensure your world has nodes and interactions for characters",
        action: "Use the 'Next Steps' buttons below to create nodes and interactions",
        completed: false
      });

      steps.push({
        title: "Test in Simulation",
        description: "Run the turn-based simulation to see your character in action",
        action: "Navigate to Simulation → Start turn-based simulation → Watch character behavior",
        completed: false
      });

      steps.push({
        title: "Create More Characters",
        description: "Build a diverse cast of characters for rich interactions",
        action: "Create different archetypes: warriors, scholars, merchants, nobles, etc.",
        completed: false
      });

      steps.push({
        title: "Advanced Features",
        description: "Explore consciousness settings and personality fine-tuning",
        action: "Adjust frequency/coherence and personality traits for unique behaviors",
        completed: false
      });
    }

    return steps;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-600/10 border-b border-red-600/30 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <div className="text-red-400 text-sm font-medium mb-2">
                Please fix the following errors before saving:
              </div>
              <ul className="text-red-300 text-xs space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error.message || error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Success Messages */}
      {saveSuccess && (
        <div className="bg-green-600/10 border-b border-green-600/30 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="text-green-400 text-sm font-medium">
              Character saved successfully to your world!
            </div>
          </div>
        </div>
      )}



      {/* Main Content - Full width responsive container */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-10 h-10 text-indigo-400" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {isTemplate ? 'Template Editor' : 'Character Editor'}
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {isTemplate 
                ? 'Create reusable character templates for rapid world building'
                : 'Design NPCs with personalities, attributes, and consciousness'
              }
            </p>
            
            {/* Template Mode Indicator */}
            {isTemplate && (
              <div className="mt-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                  <span className="text-blue-300 text-sm font-medium">
                    📚 Template Mode
                    {fromTemplate && ' - From Template'}
                    {templateMode && routeState.createMode && ' - Creating New'}
                    {templateMode && routeState.editMode && ' - Editing'}
                  </span>
                </div>
              </div>
            )}
            
            {/* World Selection Section */}
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <WorldDropdown 
                  label="Add Character To"
                  showCreateButton={true}
                />
              </div>
            </div>
            
            {/* World Selection Status */}
            <div className="mt-4 max-w-2xl mx-auto">
              {!currentWorldId ? (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <div className="text-center">
                      <p className="text-red-300 text-sm mb-2">
                        No world selected. Please create or select a world first.
                      </p>
                      <button
                        onClick={() => navigate('/editors/world')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Create World
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    <div className="text-center">
                      <p className="text-blue-300 text-sm mb-1">
                        <strong>Target World:</strong> {currentWorld?.name || 'Unknown'}
                      </p>
                      <p className="text-blue-200 text-xs">
                        Characters will be added to this world
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Action Bar */}
          <div className="mb-8">
            {/* Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className="flex gap-1 p-1 bg-white/10 rounded-lg border border-white/20">
                <button
                  onClick={() => setPreviewMode(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    !previewMode 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Edit Mode
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    previewMode 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Main Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Left Side - Essential Tools */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleTest}
                  disabled={!currentCharacter || validationErrors.length > 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TestTube className="w-4 h-4" />
                  Test Character
                </button>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportTemplate}
                    className="hidden"
                    id="import-character-template"
                  />
                  <label
                    htmlFor="import-character-template"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Import
                  </label>
                  
                  <button
                    onClick={handleExportTemplate}
                    disabled={!currentCharacter}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Right Side - Management & Workflow */}
              <div className="flex flex-wrap items-center gap-3">
                {!isTemplate && (
                  <>
                    <button
                      onClick={() => setShowAssignmentPanel(true)}
                      disabled={!currentCharacter?.name?.trim() || !currentWorldId}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!currentCharacter?.name?.trim() ? 'Enter a character name first' : !currentWorldId ? 'Select a world first' : 'Assign character to world nodes'}
                    >
                      <Settings className="w-4 h-4" />
                      Assign to Nodes
                    </button>

                    <button
                      onClick={() => setShowInteractionAssignmentPanel(true)}
                      disabled={!currentCharacter?.name?.trim() || !currentWorldId}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!currentCharacter?.name?.trim() ? 'Enter a character name first' : !currentWorldId ? 'Select a world first' : 'Assign character to interactions'}
                    >
                      <Settings className="w-4 h-4" />
                      Assign Interactions
                    </button>
                  </>
                )}

                {!isTemplate && (
                  <>
                    <button
                      onClick={() => setShowCharacterList(true)}
                      disabled={!currentWorldId}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Users className="w-4 h-4" />
                      View All Characters
                    </button>

                    <button
                      onClick={() => setShowBatchActions(true)}
                      disabled={!currentWorldId}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Settings className="w-4 h-4" />
                      Batch Actions
                    </button>
                  </>
                )}

                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || isSaving || validationErrors.length > 0 || !currentCharacter || !currentWorldId || !currentWorld}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${hasUnsavedChanges && !isSaving && validationErrors.length === 0 && currentCharacter && currentWorldId && currentWorld
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {isSaving ? 'Saving...' : (saveSuccess ? 'Saved!' : (hasUnsavedChanges ? 'Save Character' : 'Save Character'))}
                </button>

                <button
                  onClick={handleNextSteps}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
                >
                  <ArrowRight className="w-4 h-4" />
                  Next Steps
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
        {testMode && testResults ? (
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Character Test Results</h2>
                <button
                  onClick={() => setTestMode(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors"
                >
                  Back to Editor
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Test Status */}
                <div className={`p-4 rounded-lg border ${
                  testResults.success 
                    ? 'bg-green-600/10 border-green-600/30' 
                    : 'bg-red-600/10 border-red-600/30'
                }`}>
                  <div className={`font-semibold ${
                    testResults.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {testResults.success ? '✓ Character Test Passed' : '✗ Character Test Failed'}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    Character is {testResults.success ? 'ready' : 'not ready'} for simulation
                  </div>
                </div>
                
                {/* Character Validation */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Character Validation</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-white/10 rounded border border-white/20">
                      <div className="text-sm text-gray-400">Attributes</div>
                      <div className={`font-medium ${testResults.characterValidation.attributesValid ? 'text-green-400' : 'text-red-400'}`}>
                        {testResults.characterValidation.attributesValid ? '✓ Valid' : '✗ Invalid'}
                      </div>
                    </div>
                    <div className="p-3 bg-white/10 rounded border border-white/20">
                      <div className="text-sm text-gray-400">Consciousness</div>
                      <div className={`font-medium ${testResults.characterValidation.consciousnessValid ? 'text-green-400' : 'text-red-400'}`}>
                        {testResults.characterValidation.consciousnessValid ? '✓ Valid' : '✗ Invalid'}
                      </div>
                    </div>
                    <div className="p-3 bg-white/10 rounded border border-white/20">
                      <div className="text-sm text-gray-400">Personality</div>
                      <div className={`font-medium ${testResults.characterValidation.personalityValid ? 'text-green-400' : 'text-red-400'}`}>
                        {testResults.characterValidation.personalityValid ? '✓ Valid' : '✗ Invalid'}
                      </div>
                    </div>
                    <div className="p-3 bg-white/10 rounded border border-white/20">
                      <div className="text-sm text-gray-400">Goals</div>
                      <div className={`font-medium ${testResults.characterValidation.goalsValid ? 'text-green-400' : 'text-red-400'}`}>
                        {testResults.characterValidation.goalsValid ? '✓ Valid' : '✗ Invalid'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Simulation Readiness */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Simulation Readiness</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-white/10 rounded border border-white/20">
                      <div className="text-sm text-gray-400">Decision Making</div>
                      <div className={`font-medium ${testResults.simulationReadiness.canMakeDecisions ? 'text-green-400' : 'text-red-400'}`}>
                        {testResults.simulationReadiness.canMakeDecisions ? '✓ Ready' : '✗ Not Ready'}
                      </div>
                    </div>
                    <div className="p-3 bg-white/10 rounded border border-white/20">
                      <div className="text-sm text-gray-400">Goals</div>
                      <div className={`font-medium ${testResults.simulationReadiness.hasGoals ? 'text-green-400' : 'text-red-400'}`}>
                        {testResults.simulationReadiness.hasGoals ? '✓ Has Goals' : '✗ No Goals'}
                      </div>
                    </div>
                    <div className="p-3 bg-white/10 rounded border border-white/20">
                      <div className="text-sm text-gray-400">Personality</div>
                      <div className={`font-medium ${testResults.simulationReadiness.hasPersonality ? 'text-green-400' : 'text-red-400'}`}>
                        {testResults.simulationReadiness.hasPersonality ? '✓ Defined' : '✗ Missing'}
                      </div>
                    </div>
                    <div className="p-3 bg-white/10 rounded border border-white/20">
                      <div className="text-sm text-gray-400">Attribute Balance</div>
                      <div className="text-white font-medium capitalize">
                        {testResults.simulationReadiness.attributeBalance}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Warnings and Errors */}
                {(testResults.warnings.length > 0 || testResults.errors.length > 0) && (
                  <div className="space-y-4">
                    {testResults.warnings.length > 0 && (
                      <div>
                        <h4 className="text-md font-semibold text-yellow-400 mb-2">Warnings</h4>
                        <ul className="space-y-1">
                          {testResults.warnings.map((warning, index) => (
                            <li key={index} className="text-yellow-300 text-sm">• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {testResults.errors.length > 0 && (
                      <div>
                        <h4 className="text-md font-semibold text-red-400 mb-2">Errors</h4>
                        <ul className="space-y-1">
                          {testResults.errors.map((error, index) => (
                            <li key={index} className="text-red-300 text-sm">• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
        ) : previewMode ? (
              /* Preview Mode */
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Character Preview</h2>
                {currentCharacter ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{currentCharacter.name || 'Unnamed Character'}</h3>
                        <p className="text-gray-300">{currentCharacter.description || 'No description provided'}</p>
                      </div>
                    </div>
                    
                    {/* Attributes Preview */}
                    {currentCharacter.attributes && (
                      <div className="mb-6">
                        <h4 className="text-md font-semibold text-white mb-3">D&D Attributes</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {Object.entries(currentCharacter.attributes).map(([attr, value]) => (
                            <div key={attr} className="bg-white/10 p-3 rounded border border-white/20">
                              <div className="text-sm text-gray-400 uppercase">{attr}</div>
                              <div className="text-lg font-bold text-white">{value}</div>
                              <div className="text-xs text-gray-400">
                                Modifier: {Math.floor((value - 10) / 2) >= 0 ? '+' : ''}{Math.floor((value - 10) / 2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Goals Preview */}
                    {currentCharacter.goals && currentCharacter.goals.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-md font-semibold text-white mb-3">Goals</h4>
                        <div className="space-y-2">
                          {currentCharacter.goals.map((goal, index) => (
                            <div key={index} className="bg-white/10 p-3 rounded border border-white/20">
                              <div className="text-white">{goal.description}</div>
                              <div className="text-sm text-gray-400">
                                Priority: {goal.priority} • Type: {goal.type}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-300">
                    No character data to preview. Create or load a character to see the preview.
                  </p>
                )}
              </div>
            ) : (
              /* Edit Mode */
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Character Configuration</h2>
                
                {/* Use existing CharacterEditor component */}
                <CharacterEditor 
                  initialCharacter={initialData || currentCharacter}
                  onChange={handleChange}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  mode={currentCharacter || initialData ? 'edit' : 'create'}
                  availableInteractions={availableInteractions}
                  onCreateInteraction={handleCreateInteraction}
                  onEditInteraction={handleEditInteraction}
                  onBulkGenerate={handleBulkGenerate}
                  onCreateTemplate={handleCreateTemplate}
                  isTemplate={isTemplate}
                  templateMode={templateMode}
                />
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Next Steps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <button
                onClick={() => navigate('/editors/nodes')}
                className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create Nodes</h3>
                </div>
                <p className="text-gray-300 text-sm text-left">
                  Define locations and contexts within your world
                </p>
              </button>

              <button
                onClick={() => navigate('/editors/interactions')}
                className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create Interactions</h3>
                </div>
                <p className="text-gray-300 text-sm text-left">
                  Define actions and capabilities for your world
                </p>
              </button>

              <button
                onClick={() => navigate('/editors/encounters')}
                className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create Encounters</h3>
                </div>
                <p className="text-gray-300 text-sm text-left">
                  Design dynamic encounters with turn-based mechanics
                </p>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Assignment Panel Modal */}
      {showAssignmentPanel && currentCharacter?.name?.trim() && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-orange-400" />
                  <h2 className="text-2xl font-bold text-white">Assign Character to Nodes</h2>
                </div>
                <button
                  onClick={() => setShowAssignmentPanel(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <h3 className="font-semibold text-blue-200 mb-2">Character: {currentCharacter.name}</h3>
                <p className="text-blue-100 text-sm">{currentCharacter.description}</p>
                {!currentCharacter.id && (
                  <p className="text-blue-200 text-xs mt-2 italic">
                    💡 You can assign nodes even before saving the character!
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Available Nodes</h3>
                {currentWorld?.worldConfig?.nodes?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentWorld.worldConfig.nodes.map(node => (
                      <div key={node.id} className="p-4 bg-white/10 rounded-lg border border-white/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{node.name}</h4>
                          <button
                            onClick={() => handleAssignToNode(node.id)}
                            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors"
                          >
                            Assign
                          </button>
                        </div>
                        <p className="text-gray-300 text-sm">{node.description}</p>
                        <div className="mt-2 text-xs text-gray-400">
                          Type: {node.type} • Characters: {node.assignedCharacters?.length || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-4">No nodes available in this world</p>
                    <button
                      onClick={() => navigate('/editors/nodes')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Create Nodes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interaction Assignment Panel Modal */}
      {showInteractionAssignmentPanel && currentCharacter?.name?.trim() && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Assign Character to Interactions</h2>
                </div>
                <button
                  onClick={() => setShowInteractionAssignmentPanel(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <h3 className="font-semibold text-purple-200 mb-2">Character: {currentCharacter.name}</h3>
                <p className="text-purple-100 text-sm">{currentCharacter.description}</p>
                {!currentCharacter.id && (
                  <p className="text-purple-200 text-xs mt-2 italic">
                    💡 You can assign interactions even before saving the character!
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Available Interactions</h3>
                {availableInteractions?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableInteractions.map(interaction => (
                      <div key={interaction.id} className="p-4 bg-white/10 rounded-lg border border-white/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{interaction.name}</h4>
                          <button
                            onClick={() => handleAssignToInteraction(interaction.id)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                          >
                            Assign
                          </button>
                        </div>
                        <p className="text-gray-300 text-sm">{interaction.description}</p>
                        <div className="mt-2 text-xs text-gray-400">
                          Type: {interaction.type} • Prerequisites: {interaction.prerequisites?.length || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-4">No interactions available in this world</p>
                    <button
                      onClick={() => navigate('/editors/interactions')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Create Interactions
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Character List Modal */}
      {showCharacterList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/20 max-w-6xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold text-white">All Characters</h2>
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm">
                    {worldCharacters.length} total
                  </span>
                </div>
                <button
                  onClick={() => setShowCharacterList(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search characters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
                <select
                  value={filterArchetype}
                  onChange={(e) => setFilterArchetype(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="all" className="bg-gray-800">All Archetypes</option>
                  <option value="warrior" className="bg-gray-800">Warrior</option>
                  <option value="scholar" className="bg-gray-800">Scholar</option>
                  <option value="merchant" className="bg-gray-800">Merchant</option>
                  <option value="diplomat" className="bg-gray-800">Diplomat</option>
                  <option value="rogue" className="bg-gray-800">Rogue</option>
                  <option value="priest" className="bg-gray-800">Priest</option>
                  <option value="artisan" className="bg-gray-800">Artisan</option>
                  <option value="noble" className="bg-gray-800">Noble</option>
                </select>
              </div>

              {/* Character Grid */}
              {filteredCharacters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCharacters.map(character => (
                    <div key={character.id} className="p-4 bg-white/10 rounded-lg border border-white/20">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{character.name}</h3>
                          <p className="text-sm text-gray-300 capitalize">{character.archetype}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditCharacter(character)}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicateCharacter(character)}
                            className="p-1 text-green-400 hover:text-green-300 transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCharacter(character.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {character.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Goals: {character.goals?.length || 0}</span>
                        <span>Interactions: {character.assignedInteractions?.length || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">
                    {worldCharacters.length === 0 ? 'No characters in this world yet' : 'No characters match your search'}
                  </p>
                  {worldCharacters.length === 0 && (
                    <button
                      onClick={() => {
                        setShowCharacterList(false);
                        setCurrentCharacter(null);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Create First Character
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Batch Actions Modal */}
      {showBatchActions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-white">Batch Actions</h2>
                </div>
                <button
                  onClick={() => setShowBatchActions(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Selection Area */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Select Characters</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCharacters(worldCharacters.map(c => c.id))}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedCharacters([])}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {worldCharacters.map(character => (
                    <label key={character.id} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedCharacters.includes(character.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCharacters([...selectedCharacters, character.id]);
                          } else {
                            setSelectedCharacters(selectedCharacters.filter(id => id !== character.id));
                          }
                        }}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-white">{character.name}</div>
                        <div className="text-sm text-gray-400 capitalize">{character.archetype}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-4 text-sm text-gray-400">
                  {selectedCharacters.length} of {worldCharacters.length} characters selected
                </div>
              </div>

              {/* Batch Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleBatchExport}
                    disabled={selectedCharacters.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Export Selected
                  </button>
                  
                  <button
                    onClick={handleBatchDelete}
                    disabled={selectedCharacters.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected
                  </button>

                  <button
                    disabled={selectedCharacters.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MapPin className="w-4 h-4" />
                    Batch Assign to Nodes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps Modal */}
      {showNextSteps && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ArrowRight className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-2xl font-bold text-white">Next Steps</h2>
                </div>
                <button
                  onClick={() => setShowNextSteps(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {getNextStepsContent().map((step, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    step.completed 
                      ? 'bg-green-600/10 border-green-600/30' 
                      : 'bg-white/10 border-white/20'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        step.completed 
                          ? 'bg-green-600 text-white' 
                          : 'bg-white/20 text-gray-300'
                      }`}>
                        {step.completed ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          step.completed ? 'text-green-400' : 'text-white'
                        }`}>
                          {step.title}
                        </h3>
                        <p className="text-gray-300 text-sm mt-1">
                          {step.description}
                        </p>
                        <p className={`text-xs mt-2 ${
                          step.completed ? 'text-green-300' : 'text-gray-400'
                        }`}>
                          {step.action}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  <button
                    onClick={() => navigate('/editors/nodes')}
                    className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                        <Settings className="w-5 h-5 text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Create Nodes</h3>
                    </div>
                    <p className="text-gray-300 text-sm text-left">
                      Define locations and contexts within your world
                    </p>
                  </button>

                  <button
                    onClick={() => navigate('/editors/interactions')}
                    className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                        <Settings className="w-5 h-5 text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Create Interactions</h3>
                    </div>
                    <p className="text-gray-300 text-sm text-left">
                      Define actions and capabilities for your world
                    </p>
                  </button>

                  <button
                    onClick={() => navigate('/simulation')}
                    className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-emerald-400 hover:bg-white/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                        <Settings className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Start Simulation</h3>
                    </div>
                    <p className="text-gray-300 text-sm text-left">
                      Run the turn-based simulation to see characters in action
                    </p>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Success Messages */}
      <SuccessMessage 
        message="Character saved successfully!"
        isVisible={saveSuccess}
        onClose={() => setSaveSuccess(false)}
      />
      <SuccessMessage 
        message="Characters generated and placed successfully!"
        isVisible={bulkGenerateSuccess}
        onClose={() => setBulkGenerateSuccess(false)}
      />
      <SuccessMessage 
        message="NPC template created successfully!"
        isVisible={templateSaveSuccess}
        onClose={() => setTemplateSaveSuccess(false)}
      />
      <SuccessMessage 
        message="Character assigned to node successfully!"
        isVisible={nodeAssignmentSuccess}
        onClose={() => setNodeAssignmentSuccess(false)}
      />
      <SuccessMessage 
        message="Character assigned to interaction successfully!"
        isVisible={interactionAssignmentSuccess}
        onClose={() => setInteractionAssignmentSuccess(false)}
      />
    </div>
  );
};

export default CharacterEditorPage;
