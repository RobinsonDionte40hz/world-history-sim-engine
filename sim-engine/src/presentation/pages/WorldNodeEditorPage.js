/**
 * WorldNodeEditorPage - Central foundation editor for world creation
 * 
 * This page serves as the foundation where users define the world context
 * that everything else (nodes, characters, interactions) exists within.
 * Follows the mappless design principle with rules and initial conditions.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, 
  Settings, 
  Clock, 
  Sparkles,
  Save,
  AlertCircle,
  ChevronRight,
  FileText,
  RefreshCw,
  Zap
} from 'lucide-react';
import { Navigation } from '../UI';
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

const WorldNodeEditorPage = () => {
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

  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Load existing world data on component mount
  useEffect(() => {
    // Try to load from localStorage first
    const savedWorlds = Object.keys(localStorage)
      .filter(key => key.startsWith('world_'))
      .map(key => {
        try {
          return JSON.parse(localStorage.getItem(key));
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    
    // If there's a saved world, load the most recent one
    if (savedWorlds.length > 0) {
      const mostRecent = savedWorlds.sort((a, b) => 
        new Date(b.lastModified || 0) - new Date(a.lastModified || 0)
      )[0];
      
      if (mostRecent) {
        setWorldData(prevData => ({
          name: mostRecent.name || '',
          description: mostRecent.description || '',
          rules: mostRecent.rules || prevData.rules,
          initialConditions: mostRecent.initialConditions || prevData.initialConditions
        }));
      }
    }
  }, []); // Run only once on mount

  // Mark as having unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
    setSaveStatus(null);
  }, [worldData]);

  // Validation
  const validateWorld = useCallback(() => {
    const newErrors = {};
    
    if (!worldData.name.trim()) {
      newErrors.name = 'World name is required';
    } else if (worldData.name.length < 3) {
      newErrors.name = 'World name must be at least 3 characters';
    }
    
    if (!worldData.description.trim()) {
      newErrors.description = 'World description is required';
    } else if (worldData.description.length < 10) {
      newErrors.description = 'World description must be at least 10 characters';
    }
    
    if (!worldData.rules.timeProgression) {
      newErrors.timeProgression = 'Time progression setting is required';
    }
    
    if (worldData.initialConditions.startingYear < 0) {
      newErrors.startingYear = 'Starting year must be positive';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [worldData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateWorld()) {
      setSaveStatus({ type: 'error', message: 'Please fix validation errors' });
      return;
    }

    try {
      setSaveStatus({ type: 'saving', message: 'Saving world...' });
      
      // Save to world builder state
      if (worldBuilder) {
        worldBuilder.setWorldProperties(worldData.name, worldData.description);
        worldBuilder.setRules(worldData.rules);
        worldBuilder.setInitialConditions(worldData.initialConditions);
      }
      
      // Also save to localStorage for persistence
      const worldKey = `world_${worldData.name.toLowerCase().replace(/\s+/g, '_')}`;
      localStorage.setItem(worldKey, JSON.stringify({
        ...worldData,
        lastModified: new Date().toISOString(),
        version: 1
      }));
      
      setHasUnsavedChanges(false);
      setSaveStatus({ type: 'success', message: 'World saved successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Failed to save world' });
      console.error('Error saving world:', error);
    }
  }, [worldData, worldBuilder, validateWorld]);

  // Handle navigation with unsaved changes warning
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
  }, []);

  // Add custom rule
  const addCustomRule = useCallback(() => {
    const newRule = prompt('Enter a custom rule for your world:');
    if (newRule && newRule.trim()) {
      updateWorldData({
        rules: {
          ...worldData.rules,
          customRules: [...worldData.rules.customRules, newRule.trim()]
        }
      });
    }
  }, [worldData.rules, updateWorldData]);

  // Add global event
  const addGlobalEvent = useCallback(() => {
    const eventName = prompt('Enter a global event (e.g., "The Great War", "Magic Returns"):');
    if (eventName && eventName.trim()) {
      updateWorldData({
        initialConditions: {
          ...worldData.initialConditions,
          globalEvents: [...worldData.initialConditions.globalEvents, eventName.trim()]
        }
      });
    }
  }, [worldData.initialConditions, updateWorldData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      {/* Header with save status */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  World Foundation Editor
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Define the core rules and context for your world
                </p>
              </div>
            </div>
            
            {/* Save button and status */}
            <div className="flex items-center gap-4">
              {saveStatus && (
                <div className={`
                  px-4 py-2 rounded-lg text-sm font-medium
                  ${saveStatus.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                  ${saveStatus.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                  ${saveStatus.type === 'saving' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                `}>
                  {saveStatus.message}
                </div>
              )}
              
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className={`
                  px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                  ${hasUnsavedChanges 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  }
                `}
              >
                <Save className="w-4 h-4" />
                {hasUnsavedChanges ? 'Save World' : 'Saved'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['basic', 'rules', 'initial'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                {tab === 'basic' && 'Basic Information'}
                {tab === 'rules' && 'World Rules'}
                {tab === 'initial' && 'Initial Conditions'}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-lg p-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    World Name *
                  </label>
                  <input
                    type="text"
                    value={worldData.name}
                    onChange={(e) => updateWorldData({ name: e.target.value })}
                    placeholder="Enter a name for your world"
                    className={`
                      w-full px-4 py-2 border rounded-lg transition-colors
                      ${errors.name 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'
                      }
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2
                    `}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    World Description *
                  </label>
                  <textarea
                    value={worldData.description}
                    onChange={(e) => updateWorldData({ description: e.target.value })}
                    placeholder="Describe your world's setting, theme, and key characteristics"
                    rows={4}
                    className={`
                      w-full px-4 py-2 border rounded-lg transition-colors
                      ${errors.description 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'
                      }
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2
                    `}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>

              {/* World Foundation Info */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-indigo-900 dark:text-indigo-200">
                      About World Foundations
                    </h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                      Your world serves as the central foundation that all nodes, characters, and interactions exist within. 
                      It defines the core rules, time progression, and initial conditions that shape how your simulation evolves.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* World Rules Tab */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              {/* Time Progression */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Time Progression
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(TIME_PROGRESSION_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => updateWorldData({
                        rules: { ...worldData.rules, timeProgression: preset }
                      })}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${worldData.rules.timeProgression.name === preset.name
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                        }
                      `}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {preset.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulation Parameters */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Simulation Complexity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(SIMULATION_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => updateWorldData({
                        rules: { ...worldData.rules, simulationParams: preset.params }
                      })}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${JSON.stringify(worldData.rules.simulationParams) === JSON.stringify(preset.params)
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                        }
                      `}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {preset.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Rules */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Custom Rules
                </h3>
                <div className="space-y-3">
                  {worldData.rules.customRules.length > 0 ? (
                    worldData.rules.customRules.map((rule, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                        <span className="flex-1 text-gray-700 dark:text-gray-300">{rule}</span>
                        <button
                          onClick={() => updateWorldData({
                            rules: {
                              ...worldData.rules,
                              customRules: worldData.rules.customRules.filter((_, i) => i !== index)
                            }
                          })}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No custom rules defined yet
                    </p>
                  )}
                  <button
                    onClick={addCustomRule}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add Custom Rule
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Initial Conditions Tab */}
          {activeTab === 'initial' && (
            <div className="space-y-6">
              {/* Starting Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className={`
                    w-full max-w-xs px-4 py-2 border rounded-lg transition-colors
                    ${errors.startingYear 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'
                    }
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2
                  `}
                />
                {errors.startingYear && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.startingYear}
                  </p>
                )}
              </div>

              {/* Starting Season */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Starting Season
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['spring', 'summer', 'autumn', 'winter'].map((season) => (
                    <button
                      key={season}
                      onClick={() => updateWorldData({
                        initialConditions: {
                          ...worldData.initialConditions,
                          season
                        }
                      })}
                      className={`
                        px-4 py-2 rounded-lg border-2 transition-all capitalize
                        ${worldData.initialConditions.season === season
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                        }
                      `}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>

              {/* Global Events */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Global Events
                </h3>
                <div className="space-y-3">
                  {worldData.initialConditions.globalEvents.length > 0 ? (
                    worldData.initialConditions.globalEvents.map((event, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <RefreshCw className="w-4 h-4 text-indigo-500" />
                        <span className="flex-1 text-gray-700 dark:text-gray-300">{event}</span>
                        <button
                          onClick={() => updateWorldData({
                            initialConditions: {
                              ...worldData.initialConditions,
                              globalEvents: worldData.initialConditions.globalEvents.filter((_, i) => i !== index)
                            }
                          })}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No global events defined yet
                    </p>
                  )}
                  <button
                    onClick={addGlobalEvent}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add Global Event
                  </button>
                </div>
              </div>

              {/* Initial Conditions Info */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-900 dark:text-amber-200">
                      Setting the Stage
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Initial conditions define the starting state of your world. Global events represent major 
                      historical moments that have already occurred and will influence how characters and 
                      civilizations develop.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Next Steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleNavigate('/editors/nodes')}
              className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/70 transition-colors">
                  <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">Create Nodes</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Define locations and contexts within your world
              </p>
            </button>

            <button
              onClick={() => handleNavigate('/editors/characters')}
              className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/70 transition-colors">
                  <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">Create Characters</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Design NPCs with personalities and attributes
              </p>
            </button>

            <button
              onClick={() => handleNavigate('/editors/interactions')}
              className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/70 transition-colors">
                  <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">Create Interactions</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Define actions and capabilities for your world
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldNodeEditorPage;