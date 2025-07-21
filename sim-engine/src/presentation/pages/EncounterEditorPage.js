/**
 * EncounterEditorPage - Dedicated full-page interface for encounter editing
 * 
 * Provides a focused environment for creating and editing encounters with:
 * - Turn-based simulation integration
 * - Template system integration
 * - Save/load functionality
 * - Integration with interaction system
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Eye, Download, Upload, Home, ChevronRight, TestTube, Swords, Users, Clock, Target } from 'lucide-react';
import Navigation from '../UI/Navigation';
import EncounterEditor from '../components/EncounterEditor';
import Encounter from '../../domain/entities/Encounter';

const EncounterEditorPage = () => {
  const navigate = useNavigate();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentEncounter, setCurrentEncounter] = useState(null);
  const [testMode, setTestMode] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && currentEncounter) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, currentEncounter, autoSaveEnabled]);

  // Real-time validation
  useEffect(() => {
    if (currentEncounter) {
      validateEncounter(currentEncounter);
    }
  }, [currentEncounter]);

  const validateEncounter = (encounter) => {
    const errors = {};
    
    if (!encounter.name?.trim()) {
      errors.name = 'Encounter name is required';
    }
    
    if (!encounter.description?.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!encounter.outcomes || encounter.outcomes.length === 0) {
      errors.outcomes = 'At least one outcome is required';
    }
    
    if (encounter.challengeRating < 1 || encounter.challengeRating > 30) {
      errors.challengeRating = 'Challenge rating must be between 1 and 30';
    }
    
    // Validate turn-based configuration
    if (encounter.turnBased?.duration < 1) {
      errors.turnBasedDuration = 'Turn duration must be at least 1';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges || !validateEncounter(currentEncounter)) return;
    
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
      setLastSaved(new Date());
      console.log('Auto-saved encounter...');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!validateEncounter(currentEncounter)) {
      alert('Please fix validation errors before saving.');
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
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
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
    navigate('/builder');
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
    
    if (!validateEncounter(currentEncounter)) {
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
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
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

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))'
    }}>
      <Navigation />
      
      {/* Breadcrumb Navigation */}
      <div className="px-8 py-3 border-b border-slate-700/50 bg-slate-900/30">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <ChevronRight className="w-4 h-4" />
          <button 
            onClick={() => navigate('/builder')}
            className="hover:text-slate-200 transition-colors"
          >
            World Builder
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-200">Encounter Editor</span>
        </div>
      </div>
      
      {/* Editor Header */}
      <div className="px-8 py-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              Back to Builder
            </button>
            
            <div className="h-6 w-px bg-slate-600"></div>
            
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Swords className="w-6 h-6 text-indigo-400" />
              Encounter Editor
            </h1>
            
            <div className="flex items-center gap-2">
              {isSaving && (
                <span className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded flex items-center gap-1">
                  <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              )}
              
              {hasUnsavedChanges && !isSaving && (
                <span className="px-2 py-1 text-xs bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 rounded">
                  Unsaved Changes
                </span>
              )}
              
              {Object.keys(validationErrors).length > 0 && (
                <span className="px-2 py-1 text-xs bg-red-600/20 text-red-400 border border-red-600/30 rounded">
                  {Object.keys(validationErrors).length} Error{Object.keys(validationErrors).length !== 1 ? 's' : ''}
                </span>
              )}
              
              {lastSaved && !hasUnsavedChanges && !isSaving && Object.keys(validationErrors).length === 0 && (
                <span className="px-2 py-1 text-xs bg-green-600/20 text-green-400 border border-green-600/30 rounded">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              
              <label className="flex items-center gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="rounded"
                />
                Auto-save
              </label>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Encounter Templates */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadTemplate('combat')}
                className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                ⚔️ Combat
              </button>
              <button
                onClick={() => loadTemplate('social')}
                className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                💬 Social
              </button>
              <button
                onClick={() => loadTemplate('exploration')}
                className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                🗺️ Exploration
              </button>
            </div>
            
            <div className="h-6 w-px bg-slate-600"></div>
            
            {/* Template Import/Export */}
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
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Import
              </label>
              
              <button
                onClick={handleExportTemplate}
                disabled={!currentEncounter}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            
            <div className="h-6 w-px bg-slate-600"></div>
            
            <button
              onClick={handleTest}
              disabled={!currentEncounter || Object.keys(validationErrors).length > 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TestTube className="w-4 h-4" />
              Test
            </button>
            
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                previewMode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving || Object.keys(validationErrors).length > 0}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Encounter
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {testMode && testResults ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Encounter Test Results</h2>
                <button
                  onClick={() => setTestMode(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
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
                    {testResults.success ? '✓ Encounter Test Passed' : '✗ Encounter Test Failed'}
                  </div>
                  <div className="text-sm text-slate-300 mt-1">
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
                    <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                      <div className="text-sm text-slate-400">Duration</div>
                      <div className="text-white font-medium">{testResults.turnBasedIntegration.duration} turns</div>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                      <div className="text-sm text-slate-400">Initiative</div>
                      <div className="text-white font-medium capitalize">{testResults.turnBasedIntegration.initiative}</div>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                      <div className="text-sm text-slate-400">Timing</div>
                      <div className="text-white font-medium capitalize">{testResults.turnBasedIntegration.timing}</div>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                      <div className="text-sm text-slate-400">Sequencing</div>
                      <div className="text-white font-medium capitalize">{testResults.turnBasedIntegration.sequencing}</div>
                    </div>
                  </div>
                </div>
                
                {/* Generated Interactions */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Interaction System Integration</h3>
                  <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                    <div className="text-sm text-slate-400">Generated Interactions</div>
                    <div className="text-white font-medium">{testResults.generatedInteractions} interaction(s) created</div>
                    <div className="text-xs text-slate-400 mt-1">
                      These interactions will be automatically created when the encounter is saved
                    </div>
                  </div>
                </div>
                
                {/* Outcome Test */}
                {testResults.outcome && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Sample Outcome</h3>
                    <div className="p-4 bg-slate-700/50 rounded border border-slate-600">
                      <div className="text-white font-medium mb-2">{testResults.outcome.description}</div>
                      <div className="text-sm text-slate-400">
                        Turn Duration: {testResults.outcome.turnDuration} | 
                        Timing: {testResults.outcome.timing}
                      </div>
                      {testResults.outcome.effects && testResults.outcome.effects.length > 0 && (
                        <div className="mt-2 text-sm text-slate-300">
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
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-white mb-4">Encounter Preview</h2>
              {currentEncounter ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="p-4 bg-slate-700/50 rounded border border-slate-600">
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Swords className="w-5 h-5 text-indigo-400" />
                      {currentEncounter.name || 'Unnamed Encounter'}
                    </h3>
                    <p className="text-slate-300 mb-3">
                      {currentEncounter.description || 'No description provided'}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">Type: <span className="text-white capitalize">{currentEncounter.type}</span></span>
                      <span className="text-slate-400">Difficulty: <span className="text-white capitalize">{currentEncounter.difficulty}</span></span>
                      <span className="text-slate-400">CR: <span className="text-white">{currentEncounter.challengeRating}</span></span>
                    </div>
                  </div>
                  
                  {/* Turn-Based Info */}
                  <div className="p-4 bg-slate-700/50 rounded border border-slate-600">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      Turn-Based Configuration
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-slate-400">Duration:</span>
                        <span className="text-white ml-1">{currentEncounter.turnBased?.duration || 1} turns</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Initiative:</span>
                        <span className="text-white ml-1 capitalize">{currentEncounter.turnBased?.initiative || 'random'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Timing:</span>
                        <span className="text-white ml-1 capitalize">{currentEncounter.turnBased?.timing || 'immediate'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Sequencing:</span>
                        <span className="text-white ml-1 capitalize">{currentEncounter.turnBased?.sequencing || 'simultaneous'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Outcomes */}
                  {currentEncounter.outcomes && currentEncounter.outcomes.length > 0 && (
                    <div className="p-4 bg-slate-700/50 rounded border border-slate-600">
                      <h4 className="font-semibold text-white mb-3">Possible Outcomes</h4>
                      <div className="space-y-2">
                        {currentEncounter.outcomes.map((outcome, index) => (
                          <div key={outcome.id || index} className="p-3 bg-slate-600/50 rounded border border-slate-500">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-200">{outcome.description || `Outcome ${index + 1}`}</span>
                              <span className="text-xs text-slate-400">
                                {Math.round((outcome.probability || 1.0) * 100)}% chance
                              </span>
                            </div>
                            {outcome.effects && outcome.effects.length > 0 && (
                              <div className="text-xs text-slate-400 mt-1">
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
                    <div className="p-4 bg-slate-700/50 rounded border border-slate-600">
                      <h4 className="font-semibold text-white mb-3">Prerequisites</h4>
                      <div className="space-y-1">
                        {currentEncounter.prerequisites.map((prereq, index) => (
                          <div key={prereq.id || index} className="text-sm text-slate-300">
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
                <p className="text-slate-300">
                  No encounter data to preview. Create or load an encounter to see the preview.
                </p>
              )}
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Encounter Configuration</h2>
                  
                  {/* Validation Errors Summary */}
                  {Object.keys(validationErrors).length > 0 && (
                    <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-3">
                      <div className="text-red-400 text-sm font-medium mb-2">
                        Please fix the following errors:
                      </div>
                      <ul className="text-red-300 text-xs space-y-1">
                        {Object.entries(validationErrors).map(([field, error]) => (
                          <li key={field}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Use EncounterEditor component */}
                <EncounterEditor 
                  initialEncounter={currentEncounter}
                  onChange={handleChange}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  mode={currentEncounter ? 'edit' : 'create'}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EncounterEditorPage;