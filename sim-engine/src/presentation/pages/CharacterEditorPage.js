/**
 * CharacterEditorPage - Dedicated full-page interface for character editing
 * 
 * Provides a focused environment for creating and editing characters
 * with D&D attributes, personality traits, and consciousness settings.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Dice6, 
  AlertTriangle,
  Download,
  Upload,
  TestTube,
  ArrowRight,
  CheckCircle,
  X,
  Settings
} from 'lucide-react';
import Navigation from '../UI/Navigation';
import CharacterEditor from '../components/CharacterEditor';
import WorldSelector from '../components/WorldSelector';
import { useWorldContext } from '../contexts/WorldContext';
import { useSimulationContext } from '../contexts/SimulationContext';
import Character from '../../domain/entities/Character';
import { saveCharacter } from '../../shared/utils/characterSaveUtils';

const CharacterEditorPage = () => {
  const navigate = useNavigate();
  
  // WorldContext integration
  const { 
    currentWorldId,
    currentWorld,
    updateWorldConfig,
    error: worldError
  } = useWorldContext();
  
  // SimulationContext integration for WorldBuilder
  const { worldBuilder } = useSimulationContext();
  
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

  // Get available interactions from current world
  const availableInteractions = currentWorld?.worldConfig?.interactions || [];

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
    
    if (!currentCharacter?.description?.trim()) {
      errors.push({ field: 'description', message: 'Character description is required' });
    } else if (currentCharacter.description.length < 10) {
      errors.push({ field: 'description', message: 'Character description must be at least 10 characters' });
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
  }, [currentCharacter, currentWorldId, currentWorld, worldError]);

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

  const loadArchetype = (archetypeId) => {
    const archetypes = {
      warrior: {
        id: Date.now().toString(),
        name: 'Warrior Template',
        description: 'A strong and brave fighter dedicated to protecting others',
        attributes: { 
          strength: 16, 
          dexterity: 12, 
          constitution: 15, 
          intelligence: 10, 
          wisdom: 13, 
          charisma: 11 
        },
        consciousness: {
          frequency: 45,
          coherence: 0.7
        },
        personality: {
          aggression: 0.6,
          curiosity: 0.3,
          empathy: 0.7,
          ambition: 0.5,
          caution: 0.4
        },
        skills: { 
          'Melee Combat': 5, 
          'Defense': 4, 
          'Tactics': 3,
          'Athletics': 4,
          'Intimidation': 3
        },
        goals: [
          { 
            id: Date.now(), 
            description: 'Protect the innocent from harm', 
            priority: 'high', 
            type: 'ideological' 
          },
          { 
            id: Date.now() + 1, 
            description: 'Master combat techniques', 
            priority: 'medium', 
            type: 'personal' 
          }
        ]
      },
      scholar: {
        id: Date.now().toString(),
        name: 'Scholar Template',
        description: 'A wise and knowledgeable researcher seeking truth and understanding',
        attributes: { 
          strength: 8, 
          dexterity: 10, 
          constitution: 12, 
          intelligence: 16, 
          wisdom: 15, 
          charisma: 13 
        },
        consciousness: {
          frequency: 50,
          coherence: 0.9
        },
        personality: {
          aggression: 0.2,
          curiosity: 0.9,
          empathy: 0.6,
          ambition: 0.7,
          caution: 0.8
        },
        skills: { 
          'History': 5, 
          'Arcana': 4, 
          'Medicine': 3,
          'Investigation': 5,
          'Insight': 4
        },
        goals: [
          { 
            id: Date.now(), 
            description: 'Discover ancient knowledge and secrets', 
            priority: 'high', 
            type: 'personal' 
          },
          { 
            id: Date.now() + 1, 
            description: 'Share knowledge with others', 
            priority: 'medium', 
            type: 'ideological' 
          }
        ]
      },
      merchant: {
        id: Date.now().toString(),
        name: 'Merchant Template',
        description: 'A charismatic and cunning trader focused on building wealth and influence',
        attributes: { 
          strength: 10, 
          dexterity: 12, 
          constitution: 13, 
          intelligence: 14, 
          wisdom: 11, 
          charisma: 16 
        },
        consciousness: {
          frequency: 42,
          coherence: 0.6
        },
        personality: {
          aggression: 0.4,
          curiosity: 0.6,
          empathy: 0.4,
          ambition: 0.9,
          caution: 0.7
        },
        skills: { 
          'Persuasion': 5, 
          'Deception': 3, 
          'Leadership': 4,
          'Insight': 3,
          'Economics': 5
        },
        goals: [
          { 
            id: Date.now(), 
            description: 'Build a vast trading empire', 
            priority: 'high', 
            type: 'professional' 
          },
          { 
            id: Date.now() + 1, 
            description: 'Accumulate wealth and influence', 
            priority: 'high', 
            type: 'personal' 
          }
        ]
      }
    };
    
    const template = archetypes[archetypeId];
    if (template) {
      setCurrentCharacter(template);
      setHasUnsavedChanges(true);
    }
  };

  const rollAttributes = () => {
    // Roll 4d6, drop lowest for each attribute
    const rollAttribute = () => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    const rolledAttributes = {
      strength: rollAttribute(),
      dexterity: rollAttribute(),
      constitution: rollAttribute(),
      intelligence: rollAttribute(),
      wisdom: rollAttribute(),
      charisma: rollAttribute()
    };

    const newCharacter = {
      ...currentCharacter,
      attributes: rolledAttributes
    };

    setCurrentCharacter(newCharacter);
    setHasUnsavedChanges(true);
  };

  const handleNextSteps = () => {
    setShowNextSteps(true);
  };

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

      {/* Success Message */}
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
                Character Editor
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Design NPCs with personalities, attributes, and consciousness
            </p>
            
            {/* World Selection Section */}
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3 text-center">
                  Select Target World
                </h3>
                <p className="text-gray-300 text-sm text-center mb-4">
                  Choose which world this character will be added to
                </p>
                <WorldSelector compact={true} />
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

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>

            {/* Character Archetypes */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadArchetype('warrior')}
                className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                ⚔️ Warrior
              </button>
              <button
                onClick={() => loadArchetype('scholar')}
                className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                📚 Scholar
              </button>
              <button
                onClick={() => loadArchetype('merchant')}
                className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                💰 Merchant
              </button>
            </div>

            <button
              onClick={rollAttributes}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Dice6 className="w-4 h-4" />
              Roll Attributes
            </button>

            <button
              onClick={handleTest}
              disabled={!currentCharacter || validationErrors.length > 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TestTube className="w-4 h-4" />
              Test
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
                  initialCharacter={currentCharacter}
                  onChange={handleChange}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  mode={currentCharacter ? 'edit' : 'create'}
                  availableInteractions={availableInteractions}
                  onCreateInteraction={handleCreateInteraction}
                  onEditInteraction={handleEditInteraction}
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
    </div>
  );
};

export default CharacterEditorPage;
