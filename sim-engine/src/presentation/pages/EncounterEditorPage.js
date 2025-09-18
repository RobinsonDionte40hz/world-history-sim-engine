/**
 * EncounterEditorPage - Dedicated full-page interface for encounter editing
 * 
 * Provides a focused environment for creating and editing encounters with:
 * - Turn-based simulation integration
 * - Template system integration
 * - Save/load functionality
 * - Integration with interaction system
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Upload,
  TestTube,
  Swords,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  X,
  Settings
} from 'lucide-react';
import Navigation from '../UI/Navigation';
import EncounterEditor from '../components/EncounterEditor';
import WorldDropdown from '../UI/WorldDropdown';
import { useWorldContext } from '../contexts/WorldContext';
import Encounter from '../../domain/entities/Encounter';

const EncounterEditorPage = () => {
  const navigate = useNavigate();

  // WorldContext integration
  const {
    currentWorldId,
    currentWorld,
    updateWorldConfig,
    error: worldError
  } = useWorldContext();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSaveEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentEncounter, setCurrentEncounter] = useState(null);
  const [testMode, setTestMode] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showNextSteps, setShowNextSteps] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const validateEncounter = useCallback(() => {
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

    // Encounter validation
    if (!currentEncounter?.name?.trim()) {
      errors.push({ field: 'name', message: 'Encounter name is required' });
    }

    if (!currentEncounter?.description?.trim()) {
      errors.push({ field: 'description', message: 'Description is required' });
    }

    if (!currentEncounter?.outcomes || currentEncounter.outcomes.length === 0) {
      errors.push({ field: 'outcomes', message: 'At least one outcome is required' });
    }

    if (currentEncounter?.challengeRating < 1 || currentEncounter?.challengeRating > 30) {
      errors.push({ field: 'challengeRating', message: 'Challenge rating must be between 1 and 30' });
    }

    // Validate turn-based configuration
    if (currentEncounter?.turnBased?.duration < 1) {
      errors.push({ field: 'turnBasedDuration', message: 'Turn duration must be at least 1' });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [currentEncounter, currentWorldId, currentWorld, worldError]);

  // Real-time validation
  useEffect(() => {
    if (currentEncounter) {
      validateEncounter();
    }
  }, [currentEncounter, validateEncounter]);

  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !validateEncounter()) return;

    setIsSaving(true);
    try {
      // Save to localStorage
      const encounters = JSON.parse(localStorage.getItem('encounters') || '[]');
      const encounterIndex = encounters.findIndex(e => e.id === currentEncounter.id);

      if (encounterIndex >= 0) {
        encounters[encounterIndex] = currentEncounter;
      } else {
        encounters.push(currentEncounter);
      }

      localStorage.setItem('encounters', JSON.stringify(encounters));

      setHasUnsavedChanges(false);
      console.log('Auto-saved encounter...');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, validateEncounter, currentEncounter]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && currentEncounter) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, currentEncounter, autoSaveEnabled, handleAutoSave]);

  const handleSave = async () => {
    if (!validateEncounter()) {
      return;
    }

    setIsSaving(true);
    try {
      // Create Encounter entity
      const encounterEntity = new Encounter(currentEncounter);

      // Save to localStorage
      const encounters = JSON.parse(localStorage.getItem('encounters') || '[]');
      const encounterIndex = encounters.findIndex(e => e.id === encounterEntity.id);

      if (encounterIndex >= 0) {
        encounters[encounterIndex] = encounterEntity.toJSON();
      } else {
        encounters.push(encounterEntity.toJSON());
      }

      localStorage.setItem('encounters', JSON.stringify(encounters));

      // Generate and save interactions
      const generatedInteractions = encounterEntity.generateInteractions();
      const interactions = JSON.parse(localStorage.getItem('interactions') || '[]');

      generatedInteractions.forEach(interaction => {
        const existingIndex = interactions.findIndex(i => i.id === interaction.id);
        if (existingIndex >= 0) {
          interactions[existingIndex] = interaction;
        } else {
          interactions.push(interaction);
        }
      });

      localStorage.setItem('interactions', JSON.stringify(interactions));

      // Update world config with encounter reference if world is selected
      if (currentWorldId && currentWorld) {
        const updatedEncounters = [...(currentWorld.worldConfig.encounters || [])];
        const existingEncounterIndex = updatedEncounters.findIndex(e => e.id === encounterEntity.id);

        if (existingEncounterIndex >= 0) {
          updatedEncounters[existingEncounterIndex] = encounterEntity.toJSON();
        } else {
          updatedEncounters.push(encounterEntity.toJSON());
        }

        updateWorldConfig({
          ...currentWorld.worldConfig,
          encounters: updatedEncounters
        });
      }

      setHasUnsavedChanges(false);
      setSaveSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);

      console.log('Saved encounter and generated interactions:', generatedInteractions);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save encounter. Please try again.');
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

  const handleChange = (encounterData) => {
    setHasUnsavedChanges(true);
    setCurrentEncounter(encounterData);
  };

  const handleTest = () => {
    if (!currentEncounter) {
      alert('No encounter to test. Please create an encounter first.');
      return;
    }

    if (!validateEncounter()) {
      alert('Please fix validation errors before testing.');
      return;
    }

    // Create encounter entity for testing
    const encounterEntity = new Encounter(currentEncounter);

    // Simulate encounter testing with mock context
    const mockContext = {
      currentTurn: 1,
      nodeId: 'test_node',
      character: {
        id: 'test_character',
        level: 5,
        attributes: {
          strength: { score: 14 },
          dexterity: { score: 12 },
          constitution: { score: 13 },
          intelligence: { score: 10 },
          wisdom: { score: 11 },
          charisma: { score: 15 }
        },
        skills: {
          athletics: 3,
          stealth: 2,
          perception: 4
        },
        health: 100,
        energy: 80,
        mood: 60
      }
    };

    const canTrigger = encounterEntity.canTrigger(mockContext);
    const outcome = encounterEntity.resolveOutcome(mockContext);
    const generatedInteractions = encounterEntity.generateInteractions();

    const mockTestResults = {
      success: canTrigger,
      canTrigger,
      outcome,
      generatedInteractions: generatedInteractions.length,
      turnBasedIntegration: {
        duration: encounterEntity.turnBased.duration,
        initiative: encounterEntity.turnBased.initiative,
        timing: encounterEntity.turnBased.timing,
        sequencing: encounterEntity.turnBased.sequencing
      },
      warnings: [],
      errors: []
    };

    // Add warnings based on encounter configuration
    if (currentEncounter.outcomes?.length > 8) {
      mockTestResults.warnings.push('Many outcomes detected - consider simplifying for better balance');
    }

    if (currentEncounter.prerequisites?.length === 0 && currentEncounter.triggers?.length === 0) {
      mockTestResults.warnings.push('No prerequisites or triggers - encounter may be too accessible');
    }

    if (currentEncounter.turnBased?.duration > 10) {
      mockTestResults.warnings.push('Long encounter duration may impact simulation performance');
    }

    if (!canTrigger) {
      mockTestResults.errors.push('Encounter cannot trigger with current test conditions');
    }

    setTestResults(mockTestResults);
    setTestMode(true);
    console.log('Testing encounter...', mockTestResults);
  };

  const handleExportTemplate = () => {
    if (currentEncounter) {
      const encounterEntity = new Encounter(currentEncounter);
      const template = encounterEntity.toTemplate();

      const dataStr = JSON.stringify(template, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `encounter-template-${currentEncounter.name || 'unnamed'}.json`;

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
          const encounter = Encounter.fromTemplate(importedTemplate);
          setCurrentEncounter(encounter.toJSON());
          setHasUnsavedChanges(true);
          console.log('Imported encounter template:', encounter);
        } catch (error) {
          alert('Error importing template: Invalid JSON file');
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const loadTemplate = (templateType) => {
    const templates = {
      combat: {
        name: 'Combat Encounter',
        description: 'A tactical combat encounter with multiple participants',
        type: 'combat',
        difficulty: 'medium',
        challengeRating: 3,
        turnBased: {
          duration: 5,
          initiative: 'attribute',
          timing: 'immediate',
          sequencing: 'sequential'
        },
        outcomes: [
          {
            id: Date.now(),
            description: 'Victory - enemies defeated',
            probability: 0.6,
            effects: [{ type: 'experience', value: 200 }],
            turnDuration: 1,
            timing: 'immediate'
          },
          {
            id: Date.now() + 1,
            description: 'Tactical retreat - escape with minor losses',
            probability: 0.3,
            effects: [{ type: 'experience', value: 50 }],
            turnDuration: 1,
            timing: 'immediate'
          },
          {
            id: Date.now() + 2,
            description: 'Defeat - significant consequences',
            probability: 0.1,
            effects: [{ type: 'health', value: -20 }],
            turnDuration: 1,
            timing: 'immediate'
          }
        ],
        triggers: [
          { id: Date.now(), type: 'probability', probability: 0.3 }
        ]
      },
      social: {
        name: 'Diplomatic Encounter',
        description: 'A complex social interaction requiring negotiation skills',
        type: 'social',
        difficulty: 'medium',
        challengeRating: 2,
        turnBased: {
          duration: 3,
          initiative: 'random',
          timing: 'immediate',
          sequencing: 'simultaneous'
        },
        outcomes: [
          {
            id: Date.now(),
            description: 'Successful negotiation - favorable terms achieved',
            probability: 0.5,
            effects: [{ type: 'influence', value: 10 }],
            turnDuration: 1,
            timing: 'immediate'
          },
          {
            id: Date.now() + 1,
            description: 'Compromise reached - partial success',
            probability: 0.4,
            effects: [{ type: 'influence', value: 5 }],
            turnDuration: 1,
            timing: 'immediate'
          },
          {
            id: Date.now() + 2,
            description: 'Negotiations failed - relationship damaged',
            probability: 0.1,
            effects: [{ type: 'influence', value: -5 }],
            turnDuration: 1,
            timing: 'immediate'
          }
        ],
        prerequisites: [
          { id: Date.now(), type: 'attribute', attribute: 'charisma', value: 12 }
        ]
      },
      exploration: {
        name: 'Discovery Encounter',
        description: 'An exploration encounter revealing hidden secrets',
        type: 'exploration',
        difficulty: 'easy',
        challengeRating: 1,
        turnBased: {
          duration: 2,
          initiative: 'fixed',
          timing: 'immediate',
          sequencing: 'sequential'
        },
        outcomes: [
          {
            id: Date.now(),
            description: 'Significant discovery made',
            probability: 0.4,
            effects: [{ type: 'experience', value: 150 }],
            turnDuration: 1,
            timing: 'immediate'
          },
          {
            id: Date.now() + 1,
            description: 'Minor clue found',
            probability: 0.5,
            effects: [{ type: 'experience', value: 75 }],
            turnDuration: 1,
            timing: 'immediate'
          },
          {
            id: Date.now() + 2,
            description: 'Nothing of interest',
            probability: 0.1,
            effects: [],
            turnDuration: 1,
            timing: 'immediate'
          }
        ],
        prerequisites: [
          { id: Date.now(), type: 'attribute', attribute: 'wisdom', value: 10 }
        ]
      }
    };

    const template = templates[templateType];
    if (template) {
      setCurrentEncounter(template);
      setHasUnsavedChanges(true);
    }
  };

  const handleNextSteps = () => {
    setShowNextSteps(true);
  };

  const getNextStepsContent = () => {
    const steps = [];

    if (!currentEncounter) {
      steps.push({
        title: "Create Your First Encounter",
        description: "Start by creating an encounter using one of the templates or build from scratch",
        action: "Use the template buttons above to get started quickly",
        completed: false
      });
      return steps;
    }

    // Check if encounter is saved
    const isSaved = !hasUnsavedChanges;
    steps.push({
      title: "Save Your Encounter",
      description: "Save your encounter to make it available in the simulation",
      action: isSaved ? "✓ Encounter saved successfully" : "Click the 'Save Encounter' button above",
      completed: isSaved
    });

    if (isSaved) {
      steps.push({
        title: "Create Supporting Elements",
        description: "Ensure your world has nodes and characters for encounters",
        action: "Use the 'Next Steps' buttons below to create nodes and characters",
        completed: false
      });

      steps.push({
        title: "Test in Simulation",
        description: "Run the turn-based simulation to see your encounter in action",
        action: "Navigate to Simulation → Start turn-based simulation → Watch for encounter triggers",
        completed: false
      });

      steps.push({
        title: "Create More Encounters",
        description: "Build a diverse set of encounters for rich gameplay",
        action: "Create different types: combat, social, exploration, puzzle encounters",
        completed: false
      });

      steps.push({
        title: "Advanced Integration",
        description: "Connect encounters with quests and character progression",
        action: "Use prerequisites and rewards to create meaningful progression paths",
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
              Encounter saved successfully to your world!
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
              <Swords className="w-10 h-10 text-indigo-400" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Encounter Editor
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Create dynamic encounters with turn-based mechanics
            </p>

            {/* World Selection Section */}
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <WorldDropdown 
                  label="Add Encounter To"
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
                        Encounters will be added to this world
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

            {/* Encounter Templates */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadTemplate('combat')}
                className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                ⚔️ Combat
              </button>
              <button
                onClick={() => loadTemplate('social')}
                className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                💬 Social
              </button>
              <button
                onClick={() => loadTemplate('exploration')}
                className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                🗺️ Exploration
              </button>
            </div>

            <button
              onClick={handleTest}
              disabled={!currentEncounter || validationErrors.length > 0}
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
                id="import-encounter-template"
              />
              <label
                htmlFor="import-encounter-template"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Import
              </label>

              <button
                onClick={handleExportTemplate}
                disabled={!currentEncounter}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving || validationErrors.length > 0 || !currentEncounter || !currentWorldId || !currentWorld}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${hasUnsavedChanges && !isSaving && validationErrors.length === 0 && currentEncounter && currentWorldId && currentWorld
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isSaving ? 'Saving...' : (saveSuccess ? 'Saved!' : (hasUnsavedChanges ? 'Save Encounter' : 'Save Encounter'))}
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
                  <h2 className="text-xl font-semibold text-white">Encounter Test Results</h2>
                  <button
                    onClick={() => setTestMode(false)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors"
                  >
                    Back to Editor
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Test Status */}
                  <div className={`p-4 rounded-lg border ${testResults.success
                    ? 'bg-green-600/10 border-green-600/30'
                    : 'bg-red-600/10 border-red-600/30'
                    }`}>
                    <div className={`font-semibold ${testResults.success ? 'text-green-400' : 'text-red-400'
                      }`}>
                      {testResults.success ? '✓ Encounter Test Passed' : '✗ Encounter Test Failed'}
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      Can Trigger: {testResults.canTrigger ? 'Yes' : 'No'}
                    </div>
                  </div>

                  {/* Turn-Based Integration */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-400" />
                      Turn-Based Integration
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-white/10 rounded border border-white/20">
                        <div className="text-sm text-gray-400">Duration</div>
                        <div className="text-white font-medium">{testResults.turnBasedIntegration.duration} turns</div>
                      </div>
                      <div className="p-3 bg-white/10 rounded border border-white/20">
                        <div className="text-sm text-gray-400">Initiative</div>
                        <div className="text-white font-medium capitalize">{testResults.turnBasedIntegration.initiative}</div>
                      </div>
                      <div className="p-3 bg-white/10 rounded border border-white/20">
                        <div className="text-sm text-gray-400">Timing</div>
                        <div className="text-white font-medium capitalize">{testResults.turnBasedIntegration.timing}</div>
                      </div>
                      <div className="p-3 bg-white/10 rounded border border-white/20">
                        <div className="text-sm text-gray-400">Sequencing</div>
                        <div className="text-white font-medium capitalize">{testResults.turnBasedIntegration.sequencing}</div>
                      </div>
                    </div>
                  </div>

                  {/* Generated Interactions */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Interaction System Integration</h3>
                    <div className="p-3 bg-white/10 rounded border border-white/20">
                      <div className="text-sm text-gray-400">Generated Interactions</div>
                      <div className="text-white font-medium">{testResults.generatedInteractions} interaction(s) created</div>
                      <div className="text-xs text-gray-400 mt-1">
                        These interactions will be automatically created when the encounter is saved
                      </div>
                    </div>
                  </div>

                  {/* Outcome Test */}
                  {testResults.outcome && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Sample Outcome</h3>
                      <div className="p-4 bg-white/10 rounded border border-white/20">
                        <div className="text-white font-medium mb-2">{testResults.outcome.description}</div>
                        <div className="text-sm text-gray-400">
                          Turn Duration: {testResults.outcome.turnDuration} |
                          Timing: {testResults.outcome.timing}
                        </div>
                        {testResults.outcome.effects && testResults.outcome.effects.length > 0 && (
                          <div className="mt-2 text-sm text-gray-300">
                            Effects: {testResults.outcome.effects.length} effect(s)
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {testResults.warnings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-400 mb-3">Warnings</h3>
                      <div className="space-y-2">
                        {testResults.warnings.map((warning, index) => (
                          <div key={index} className="p-3 bg-yellow-600/10 border border-yellow-600/30 rounded">
                            <span className="text-yellow-300">{warning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {testResults.errors.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-red-400 mb-3">Errors</h3>
                      <div className="space-y-2">
                        {testResults.errors.map((error, index) => (
                          <div key={index} className="p-3 bg-red-600/10 border border-red-600/30 rounded">
                            <span className="text-red-300">{error}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : previewMode ? (
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-white mb-4">Encounter Preview</h2>
                {currentEncounter ? (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="p-4 bg-white/10 rounded border border-white/20">
                      <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <Swords className="w-5 h-5 text-indigo-400" />
                        {currentEncounter.name || 'Unnamed Encounter'}
                      </h3>
                      <p className="text-gray-300 mb-3">
                        {currentEncounter.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">Type: <span className="text-white capitalize">{currentEncounter.type}</span></span>
                        <span className="text-gray-400">Difficulty: <span className="text-white capitalize">{currentEncounter.difficulty}</span></span>
                        <span className="text-gray-400">CR: <span className="text-white">{currentEncounter.challengeRating}</span></span>
                      </div>
                    </div>

                    {/* Turn-Based Info */}
                    <div className="p-4 bg-white/10 rounded border border-white/20">
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-400" />
                        Turn-Based Configuration
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white ml-1">{currentEncounter.turnBased?.duration || 1} turns</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Initiative:</span>
                          <span className="text-white ml-1 capitalize">{currentEncounter.turnBased?.initiative || 'random'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Timing:</span>
                          <span className="text-white ml-1 capitalize">{currentEncounter.turnBased?.timing || 'immediate'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Sequencing:</span>
                          <span className="text-white ml-1 capitalize">{currentEncounter.turnBased?.sequencing || 'simultaneous'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Outcomes */}
                    {currentEncounter.outcomes && currentEncounter.outcomes.length > 0 && (
                      <div className="p-4 bg-white/10 rounded border border-white/20">
                        <h4 className="font-semibold text-white mb-3">Possible Outcomes</h4>
                        <div className="space-y-2">
                          {currentEncounter.outcomes.map((outcome, index) => (
                            <div key={outcome.id || index} className="p-3 bg-white/10 rounded border border-white/20">
                              <div className="flex items-center justify-between">
                                <span className="text-white">{outcome.description || `Outcome ${index + 1}`}</span>
                                <span className="text-xs text-gray-400">
                                  {Math.round((outcome.probability || 1.0) * 100)}% chance
                                </span>
                              </div>
                              {outcome.effects && outcome.effects.length > 0 && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {outcome.effects.length} effect(s) | Duration: {outcome.turnDuration || 1} turn(s)
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prerequisites */}
                    {currentEncounter.prerequisites && currentEncounter.prerequisites.length > 0 && (
                      <div className="p-4 bg-white/10 rounded border border-white/20">
                        <h4 className="font-semibold text-white mb-3">Prerequisites</h4>
                        <div className="space-y-1">
                          {currentEncounter.prerequisites.map((prereq, index) => (
                            <div key={prereq.id || index} className="text-sm text-gray-300">
                              • {prereq.type === 'attribute' ? `${prereq.attribute} ≥ ${prereq.value}` :
                                prereq.type === 'level' ? `Level ≥ ${prereq.value}` :
                                  `${prereq.type} requirement`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-300">
                    No encounter data to preview. Create or load an encounter to see the preview.
                  </p>
                )}
              </div>
            ) : (
              /* Edit Mode */
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Encounter Configuration</h2>

                {/* Use EncounterEditor component */}
                <EncounterEditor
                  initialEncounter={currentEncounter}
                  onChange={handleChange}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  mode={currentEncounter ? 'edit' : 'create'}
                  currentWorld={currentWorld}
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
                    <Settings className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create Nodes</h3>
                </div>
                <p className="text-gray-300 text-sm text-left">
                  Define locations and contexts within your world
                </p>
              </button>

              <button
                onClick={() => navigate('/editors/characters')}
                className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                    <Settings className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Create Characters</h3>
                </div>
                <p className="text-gray-300 text-sm text-left">
                  Design NPCs with personalities and attributes
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
                  Run the turn-based simulation to see encounters in action
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
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${step.completed
                      ? 'bg-emerald-600/10 border-emerald-600/30'
                      : 'bg-white/10 border-white/20'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${step.completed ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {step.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                            <span className="text-xs font-bold">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-2 ${step.completed ? 'text-emerald-400' : 'text-white'
                          }`}>
                          {step.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-2">
                          {step.description}
                        </p>
                        <p className={`text-sm ${step.completed ? 'text-emerald-300' : 'text-indigo-300'
                          }`}>
                          {step.action}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Complete these steps to integrate your encounter into the simulation
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/editors/world')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Go to World Editor
                  </button>
                  <button
                    onClick={() => setShowNextSteps(false)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors"
                  >
                    Close
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

export default EncounterEditorPage;
