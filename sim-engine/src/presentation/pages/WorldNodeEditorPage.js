/**
 * WorldNodeEditorPageNew - Clean, responsive world editor from scratch
 * 
 * This is a complete rewrite of the world editor with proper responsive layout
 * without sidebar space reservation and clean CSS structure.
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Settings,
  Clock,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  X
} from 'lucide-react';
import Navigation from '../UI/Navigation';
import useWorldBuilder from '../hooks/useWorldBuilder';

// Time progression presets
const TIME_PROGRESSION_PRESETS = {
  realtime: {
    name: 'Real-time',
    ticksPerSecond: 60,
    minutesPerTick: 0.016,
    description: '1 second = 1 second in world time'
  },
  fast: {
    name: 'Fast',
    ticksPerSecond: 10,
    minutesPerTick: 1,
    description: '1 second = 10 minutes in world time'
  },
  daily: {
    name: 'Daily',
    ticksPerSecond: 1,
    minutesPerTick: 60,
    description: '1 second = 1 hour in world time'
  },
  weekly: {
    name: 'Weekly',
    ticksPerSecond: 0.1,
    minutesPerTick: 1440,
    description: '1 second = 1 day in world time'
  },
  monthly: {
    name: 'Monthly',
    ticksPerSecond: 0.033,
    minutesPerTick: 43200,
    description: '1 second = 1 month in world time'
  }
};

// Simulation parameter presets
const SIMULATION_PRESETS = {
  simple: {
    name: 'Simple',
    description: 'Basic simulation for beginners',
    params: {
      maxCharactersPerNode: 50,
      maxNodesPerWorld: 100,
      consciousnessEnabled: false,
      questGenerationRate: 'low',
      economyComplexity: 'simple'
    }
  },
  standard: {
    name: 'Standard',
    description: 'Balanced simulation for most users',
    params: {
      maxCharactersPerNode: 200,
      maxNodesPerWorld: 500,
      consciousnessEnabled: true,
      questGenerationRate: 'medium',
      economyComplexity: 'standard'
    }
  },
  complex: {
    name: 'Complex',
    description: 'Advanced simulation with all features',
    params: {
      maxCharactersPerNode: 1000,
      maxNodesPerWorld: 2000,
      consciousnessEnabled: true,
      questGenerationRate: 'high',
      economyComplexity: 'complex'
    }
  }
};

const WorldNodeEditorPageNew = () => {
  const navigate = useNavigate();
  const worldBuilder = useWorldBuilder();

  // Form state
  const [worldData, setWorldData] = useState({
    name: '',
    description: '',
    rules: {
      timeProgression: TIME_PROGRESSION_PRESETS.daily,
      simulationParams: SIMULATION_PRESETS.standard.params,
      customRules: []
    },
    initialConditions: {
      startingYear: 1000,
      season: 'spring',
      globalEvents: [],
      worldModifiers: []
    }
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [previewMode, setPreviewMode] = useState(false);
  const [showNextSteps, setShowNextSteps] = useState(false);

  // Validation
  const validateWorld = useCallback(() => {
    const errors = [];

    if (!worldData.name.trim()) {
      errors.push({ field: 'name', message: 'World name is required' });
    } else if (worldData.name.length < 3) {
      errors.push({ field: 'name', message: 'World name must be at least 3 characters' });
    }

    if (!worldData.description.trim()) {
      errors.push({ field: 'description', message: 'World description is required' });
    } else if (worldData.description.length < 10) {
      errors.push({ field: 'description', message: 'World description must be at least 10 characters' });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [worldData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateWorld()) {
      return;
    }

    try {
      setIsSaving(true);

      // Update world builder
      if (worldBuilder) {
        worldBuilder.setWorldProperties(worldData.name, worldData.description);
        worldBuilder.setRules(worldData.rules);
        worldBuilder.setInitialConditions(worldData.initialConditions);
      }

      setHasUnsavedChanges(false);
      console.log('World saved successfully!');
    } catch (error) {
      console.error('Error saving world:', error);
    } finally {
      setIsSaving(false);
    }
  }, [worldData, worldBuilder, validateWorld]);

  // Handle navigation
  const handleNavigate = useCallback((path) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate(path);
  }, [hasUnsavedChanges, navigate]);

  // Update world data
  const updateWorldData = useCallback((updates) => {
    setWorldData(prev => ({
      ...prev,
      ...updates
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Get field-specific errors
  const getFieldError = (fieldName) => {
    const error = validationErrors.find(e => e.field === fieldName);
    return error ? error.message : null;
  };

  // Next Steps functionality
  const getNextStepsContent = () => {
    const steps = [];
    
    if (!worldData.name?.trim()) {
      steps.push({
        title: "Name Your World",
        description: "Give your world a memorable name",
        action: "Fill in the world name in the Basic tab",
        completed: false
      });
      return steps;
    }

    // Check if world is saved
    const isSaved = !hasUnsavedChanges;
    steps.push({
      title: "Save Your World Foundation",
      description: "Save your world configuration to make it available for building",
      action: isSaved ? "✓ World foundation saved successfully" : "Click the 'Save World' button above",
      completed: isSaved
    });

    if (isSaved) {
      steps.push({
        title: "Create Nodes",
        description: "Define locations and contexts within your world",
        action: "Use the 'Create Nodes' button below or navigate to Node Editor",
        completed: false
      });

      steps.push({
        title: "Design Characters",
        description: "Create NPCs with personalities and attributes",
        action: "Use the 'Create Characters' button below or navigate to Character Editor",
        completed: false
      });

      steps.push({
        title: "Define Interactions",
        description: "Create actions and capabilities for your world",
        action: "Use the 'Create Interactions' button below or navigate to Interaction Editor",
        completed: false
      });

      steps.push({
        title: "Create Encounters",
        description: "Design dynamic encounters with turn-based mechanics",
        action: "Navigate to Encounter Editor to create engaging encounters",
        completed: false
      });

      steps.push({
        title: "Start Simulation",
        description: "Run the turn-based simulation to see your world come alive",
        action: "Once you have nodes, characters, and interactions, start the simulation",
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

      {/* Main Content - Full width responsive container */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Globe className="w-10 h-10 text-indigo-400" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                World Foundation Editor
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Define the core rules and context for your world simulation
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>

            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${hasUnsavedChanges && !isSaving
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isSaving ? 'Saving...' : (hasUnsavedChanges ? 'Save World' : 'Saved')}
            </button>

            <button
              onClick={() => setShowNextSteps(true)}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
            >
              <ArrowRight className="w-4 h-4" />
              Next Steps
            </button>
          </div>

          {/* Main Content Area */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">

            {previewMode ? (
              /* Preview Mode */
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">World Preview</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-300 mb-2">Name</h3>
                    <p className="text-white text-lg">{worldData.name || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-300 mb-2">Description</h3>
                    <p className="text-white">{worldData.description || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-300 mb-2">Time Progression</h3>
                    <p className="text-white">
                      {worldData.rules.timeProgression.name} - {worldData.rules.timeProgression.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <>
                {/* Tab Navigation */}
                <div className="border-b border-white/20">
                  <nav className="flex space-x-8 px-6 sm:px-8" aria-label="Tabs">
                    {['basic', 'rules', 'initial'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                          ? 'border-indigo-400 text-indigo-400'
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                          }`}
                      >
                        {tab === 'basic' && 'Basic Information'}
                        {tab === 'rules' && 'World Rules'}
                        {tab === 'initial' && 'Initial Conditions'}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6 sm:p-8">
                  {/* Basic Information Tab */}
                  {activeTab === 'basic' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          World Name *
                        </label>
                        <input
                          type="text"
                          value={worldData.name}
                          onChange={(e) => updateWorldData({ name: e.target.value })}
                          placeholder="Enter a name for your world"
                          className={`w-full px-4 py-3 rounded-lg bg-white/10 border transition-colors text-white placeholder-gray-400 ${getFieldError('name')
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-white/20 focus:ring-indigo-500 focus:border-indigo-500'
                            } focus:outline-none focus:ring-2`}
                        />
                        {getFieldError('name') && (
                          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {getFieldError('name')}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          World Description *
                        </label>
                        <textarea
                          value={worldData.description}
                          onChange={(e) => updateWorldData({ description: e.target.value })}
                          placeholder="Describe your world's setting, theme, and key characteristics"
                          rows={4}
                          className={`w-full px-4 py-3 rounded-lg bg-white/10 border transition-colors text-white placeholder-gray-400 ${getFieldError('description')
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-white/20 focus:ring-indigo-500 focus:border-indigo-500'
                            } focus:outline-none focus:ring-2`}
                        />
                        {getFieldError('description') && (
                          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {getFieldError('description')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rules Tab */}
                  {activeTab === 'rules' && (
                    <div className="space-y-8">
                      {/* Time Progression */}
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Time Progression
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(TIME_PROGRESSION_PRESETS).map(([key, preset]) => (
                            <button
                              key={key}
                              onClick={() => updateWorldData({
                                rules: { ...worldData.rules, timeProgression: preset }
                              })}
                              className={`p-4 rounded-lg border-2 transition-all text-left ${worldData.rules.timeProgression.name === preset.name
                                ? 'border-indigo-500 bg-indigo-500/20'
                                : 'border-white/20 hover:border-white/40 bg-white/5'
                                }`}
                            >
                              <div className="font-medium text-white mb-1">
                                {preset.name}
                              </div>
                              <div className="text-sm text-gray-400">
                                {preset.description}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Simulation Parameters */}
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                          <Settings className="w-5 h-5" />
                          Simulation Complexity
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(SIMULATION_PRESETS).map(([key, preset]) => (
                            <button
                              key={key}
                              onClick={() => updateWorldData({
                                rules: { ...worldData.rules, simulationParams: preset.params }
                              })}
                              className={`p-4 rounded-lg border-2 transition-all text-left ${JSON.stringify(worldData.rules.simulationParams) === JSON.stringify(preset.params)
                                ? 'border-indigo-500 bg-indigo-500/20'
                                : 'border-white/20 hover:border-white/40 bg-white/5'
                                }`}
                            >
                              <div className="font-medium text-white mb-1">
                                {preset.name}
                              </div>
                              <div className="text-sm text-gray-400">
                                {preset.description}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Initial Conditions Tab */}
                  {activeTab === 'initial' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Starting Year
                        </label>
                        <input
                          type="number"
                          value={worldData.initialConditions.startingYear}
                          onChange={(e) => updateWorldData({
                            initialConditions: {
                              ...worldData.initialConditions,
                              startingYear: parseInt(e.target.value) || 0
                            }
                          })}
                          className="w-full max-w-xs px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:ring-indigo-500 focus:border-indigo-500 text-white focus:outline-none focus:ring-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Starting Season
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {['spring', 'summer', 'autumn', 'winter'].map((season) => (
                            <button
                              key={season}
                              onClick={() => updateWorldData({
                                initialConditions: {
                                  ...worldData.initialConditions,
                                  season
                                }
                              })}
                              className={`px-4 py-2 rounded-lg border-2 transition-all capitalize ${worldData.initialConditions.season === season
                                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                                : 'border-white/20 hover:border-white/40 text-gray-300'
                                }`}
                            >
                              {season}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Next Steps - Centered with proper spacing */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Next Steps
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 max-w-5xl mx-auto">
              <button
                onClick={() => handleNavigate('/editors/nodes')}
                className="w-full sm:w-80 p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
                    <Settings className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Create Nodes</h3>
                </div>
                <p className="text-gray-300 text-left">
                  Define locations and contexts within your world
                </p>
              </button>

              <button
                onClick={() => handleNavigate('/editors/characters')}
                className="w-full sm:w-80 p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
                    <Settings className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Create Characters</h3>
                </div>
                <p className="text-gray-300 text-left">
                  Design NPCs with personalities and attributes
                </p>
              </button>

              <button
                onClick={() => handleNavigate('/editors/interactions')}
                className="w-full sm:w-80 p-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:border-indigo-400 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
                    <Settings className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Create Interactions</h3>
                </div>
                <p className="text-gray-300 text-left">
                  Define actions and capabilities for your world
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
                    className={`p-4 rounded-lg border ${
                      step.completed
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
                        <h3 className={`font-semibold mb-2 ${
                          step.completed ? 'text-emerald-400' : 'text-white'
                        }`}>
                          {step.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-2">
                          {step.description}
                        </p>
                        <p className={`text-sm ${
                          step.completed ? 'text-emerald-300' : 'text-indigo-300'
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
                  Follow these steps to build your complete world
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowNextSteps(false);
                      handleNavigate('/editors/nodes');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Create Nodes
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

export default WorldNodeEditorPageNew;