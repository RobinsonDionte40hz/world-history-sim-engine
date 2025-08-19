/**
 * useWorldBuilder Hook - Core hook functionality for holistic simulation readiness validation
 * 
 * Implements state management for mappless world configuration with simulation compatibility assessment.
 * Provides template loading and management for world, node, interaction, character, composite templates.
 * Creates methods for preparation phases: world foundation, locations, capabilities, actors, assignments.
 * Adds simulation readiness validation and performance assessment for simulation engines.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import WorldBuilder from '../../domain/services/WorldBuilder';

/**
 * Custom hook for managing simulation-ready world building process
 * @param {Object} templateManager - Template manager instance for template operations
 * @returns {Object} World builder state and methods for simulation readiness
 */
const useWorldBuilder = (templateManager = null) => {
  // Initialize WorldBuilder instance
  const [worldBuilder] = useState(() => new WorldBuilder(templateManager));
  
  // State management for mappless world configuration with simulation readiness tracking
  const [worldConfig, setWorldConfig] = useState(worldBuilder.worldConfig);
  const [preparationPhase, setPreparationPhase] = useState('worldFoundation');
  const [simulationReadiness, setSimulationReadiness] = useState(worldBuilder.worldConfig.simulationReadiness);
  const [simulationCompatibility, setSimulationCompatibility] = useState(null);
  const [performanceAssessment, setPerformanceAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Template loading and management for all template types
  const [availableTemplates, setAvailableTemplates] = useState({
    worlds: [],
    nodes: [],
    interactions: [],
    characters: [],
    composite: []
  });

  // Load templates from template manager
  const loadTemplates = useCallback(async () => {
    if (!templateManager) {
      setAvailableTemplates({
        worlds: [],
        nodes: [],
        interactions: [],
        characters: [],
        composite: []
      });
      return;
    }

    try {
      setIsLoading(true);
      const templates = {
        worlds: templateManager.getAllTemplates('worlds') || [],
        nodes: templateManager.getAllTemplates('nodes') || [],
        interactions: templateManager.getAllTemplates('interactions') || [],
        characters: templateManager.getAllTemplates('characters') || [],
        composite: templateManager.getAllTemplates('composite') || []
      };
      setAvailableTemplates(templates);
      setError(null);
    } catch (err) {
      setError(`Failed to load templates: ${err.message}`);
      console.error('Template loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [templateManager]);

  // Load templates on mount and when templateManager changes
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Holistic simulation compatibility assessment
  const assessSimulationCompatibility = useCallback((config) => {
    const issues = [];
    const warnings = [];
    const recommendations = [];

    // Core compatibility checks
    if (!config.name || !config.description) {
      issues.push('World foundation incomplete - missing name or description');
    }

    if (!config.nodes || config.nodes.length === 0) {
      issues.push('No locations defined - simulation requires at least one location');
    }

    if (!config.interactions || config.interactions.length === 0) {
      issues.push('No capabilities defined - characters need interaction capabilities');
    }

    if (!config.characters || config.characters.length === 0) {
      issues.push('No actors defined - simulation requires characters');
    }

    // Advanced compatibility checks
    if (config.nodes && config.characters) {
      const unassignedCharacters = config.characters.filter(char => {
        return !Object.values(config.nodePopulations || {}).some(pop => pop.includes(char.id));
      });
      
      if (unassignedCharacters.length > 0) {
        issues.push(`${unassignedCharacters.length} characters not assigned to locations`);
      }
    }

    // Simulation engine specific checks
    if (config.interactions) {
      const complexInteractions = config.interactions.filter(i => 
        i.branches && i.branches.length > 10
      );
      if (complexInteractions.length > 0) {
        warnings.push(`${complexInteractions.length} interactions have high complexity (>10 branches)`);
      }
    }

    // Data structure validation for simulation
    if (config.characters) {
      const invalidCharacters = config.characters.filter(char => 
        !char.id || !char.name || !char.attributes
      );
      if (invalidCharacters.length > 0) {
        issues.push(`${invalidCharacters.length} characters have invalid data structure`);
      }
    }

    // Recommendations for better simulation
    if (config.nodes && config.nodes.length < 3) {
      recommendations.push('Consider adding more locations for richer world interactions');
    }

    if (config.characters && config.characters.length < 5) {
      recommendations.push('Consider adding more characters for dynamic interactions');
    }

    if (config.interactions && config.interactions.length < 3) {
      recommendations.push('Consider adding more interaction types for diverse behaviors');
    }

    return {
      isCompatible: issues.length === 0,
      issues,
      warnings,
      recommendations,
      score: issues.length === 0 ? 1.0 : Math.max(0, 1.0 - (issues.length * 0.2))
    };
  }, []);

  // Performance assessment for simulation engines
  const assessPerformanceForSimulation = useCallback((config) => {
    const metrics = {
      characterCount: config.characters?.length || 0,
      nodeCount: config.nodes?.length || 0,
      interactionCount: config.interactions?.length || 0,
      totalPopulation: Object.values(config.nodePopulations || {}).reduce((sum, pop) => sum + pop.length, 0)
    };

    const warnings = [];
    const recommendations = [];
    let performanceScore = 1.0;

    // Character limit checks
    if (metrics.characterCount > 1000) {
      warnings.push('High character count may impact simulation performance');
      performanceScore *= 0.8;
    } else if (metrics.characterCount > 500) {
      warnings.push('Moderate character count - monitor performance');
      performanceScore *= 0.9;
    }

    // Node complexity checks
    if (metrics.nodeCount > 100) {
      warnings.push('High node count may increase memory usage');
      performanceScore *= 0.9;
    }

    // Interaction complexity assessment
    const complexityScore = config.interactions?.reduce((score, interaction) => {
      const branches = interaction.branches?.length || 1;
      const effects = interaction.effects ? Object.keys(interaction.effects).length : 1;
      return score + (branches * effects);
    }, 0) || 0;

    if (complexityScore > 5000) {
      warnings.push('High interaction complexity may slow simulation processing');
      performanceScore *= 0.7;
    } else if (complexityScore > 2000) {
      warnings.push('Moderate interaction complexity detected');
      performanceScore *= 0.85;
    }

    // Memory usage estimation
    const estimatedMemoryMB = (
      metrics.characterCount * 0.1 + 
      metrics.nodeCount * 0.05 + 
      metrics.interactionCount * 0.02
    );

    if (estimatedMemoryMB > 100) {
      warnings.push(`High estimated memory usage: ${estimatedMemoryMB.toFixed(1)}MB`);
    }

    // Performance recommendations
    if (metrics.characterCount > 100 && metrics.nodeCount < 5) {
      recommendations.push('Consider adding more locations to distribute character load');
    }

    if (complexityScore / metrics.interactionCount > 50) {
      recommendations.push('Consider simplifying interaction complexity for better performance');
    }

    return {
      score: performanceScore,
      metrics,
      warnings,
      recommendations,
      estimatedMemoryMB,
      isOptimal: performanceScore > 0.8 && warnings.length === 0
    };
  }, []);

  // Sync world config with builder state and assess simulation readiness
  const syncWorldConfig = useCallback(() => {
    // Create a deep copy to ensure React detects the change
    const newWorldConfig = JSON.parse(JSON.stringify(worldBuilder.worldConfig));
    setWorldConfig(newWorldConfig);
    
    // Update simulation readiness state
    setSimulationReadiness(newWorldConfig.simulationReadiness);
    
    // Determine current preparation phase based on readiness
    const readiness = newWorldConfig.simulationReadiness;
    if (!readiness.worldFoundationDefined) {
      setPreparationPhase('worldFoundation');
    } else if (!readiness.locationsDefined) {
      setPreparationPhase('locations');
    } else if (!readiness.capabilitiesDefined) {
      setPreparationPhase('capabilities');
    } else if (!readiness.actorsDefined) {
      setPreparationPhase('actors');
    } else if (!readiness.actorsAssigned) {
      setPreparationPhase('assignments');
    } else {
      setPreparationPhase('simulationReady');
    }
    
    // Assess simulation compatibility and performance
    const compatibility = assessSimulationCompatibility(newWorldConfig);
    setSimulationCompatibility(compatibility);
    
    const performance = assessPerformanceForSimulation(newWorldConfig);
    setPerformanceAssessment(performance);
    
  }, [worldBuilder, assessSimulationCompatibility, assessPerformanceForSimulation]);

  // Phase 1: World properties methods (no dimensions)
  const setWorldProperties = useCallback((name, description) => {
    try {
      // Only validate and sync if both name and description are provided
      if (name && description) {
        worldBuilder.setWorldProperties(name, description);
        syncWorldConfig();
        setError(null);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  const setRules = useCallback((rules) => {
    try {
      worldBuilder.setRules(rules);
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  const setInitialConditions = useCallback((conditions) => {
    try {
      worldBuilder.setInitialConditions(conditions);
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  // Phase 2: Node creation methods (abstract locations, no coordinates)
  const addNode = useCallback((nodeConfig) => {
    try {
      worldBuilder.addNode(nodeConfig);
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  const addNodeFromTemplate = useCallback((templateId, customizations = {}) => {
    try {
      worldBuilder.addNodeFromTemplate(templateId, customizations);
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  const removeNode = useCallback((nodeId) => {
    try {
      // Remove node from config
      worldBuilder.worldConfig.nodes = worldBuilder.worldConfig.nodes.filter(n => n.id !== nodeId);
      
      // Remove any character assignments to this node
      if (worldBuilder.worldConfig.nodePopulations[nodeId]) {
        delete worldBuilder.worldConfig.nodePopulations[nodeId];
      }
      
      // Revalidate preparation phases
      worldBuilder.validatePreparationPhase('locationsDefined');
      worldBuilder.validatePreparationPhase('actorsAssigned');
      
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  // Phase 3: Interaction creation methods (character capabilities)
  const addInteraction = useCallback((interactionConfig) => {
    try {
      worldBuilder.addInteraction(interactionConfig);
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  const addInteractionFromTemplate = useCallback((templateId, customizations = {}) => {
    try {
      worldBuilder.addInteractionFromTemplate(templateId, customizations);
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  const removeInteraction = useCallback((interactionId) => {
    try {
      // Remove interaction from config
      worldBuilder.worldConfig.interactions = worldBuilder.worldConfig.interactions.filter(i => i.id !== interactionId);
      
      // Remove interaction from character assignments
      worldBuilder.worldConfig.characters.forEach(character => {
        if (character.assignedInteractions) {
          character.assignedInteractions = character.assignedInteractions.filter(id => id !== interactionId);
        }
      });
      
      // Revalidate preparation phases
      worldBuilder.validatePreparationPhase('capabilitiesDefined');
      worldBuilder.validatePreparationPhase('actorsDefined');
      
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  // Phase 4: Character creation methods (with capability assignment)
  const addCharacter = useCallback((characterConfig) => {
    try {
      worldBuilder.addCharacter(characterConfig);
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  const addCharacterFromTemplate = useCallback((templateId, customizations = {}) => {
    try {
      worldBuilder.addCharacterFromTemplate(templateId, customizations);
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  const removeCharacter = useCallback((characterId) => {
    try {
      // Remove character from config
      worldBuilder.worldConfig.characters = worldBuilder.worldConfig.characters.filter(c => c.id !== characterId);
      
      // Remove character from node populations
      Object.keys(worldBuilder.worldConfig.nodePopulations).forEach(nodeId => {
        worldBuilder.worldConfig.nodePopulations[nodeId] = 
          worldBuilder.worldConfig.nodePopulations[nodeId].filter(id => id !== characterId);
      });
      
      // Revalidate preparation phases
      worldBuilder.validatePreparationPhase('actorsDefined');
      worldBuilder.validatePreparationPhase('actorsAssigned');
      
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  // Phase 5: Node population methods (assign characters to nodes)
  const assignCharacterToNode = useCallback((characterId, nodeId) => {
    try {
      worldBuilder.assignCharacterToNode(characterId, nodeId);
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  const populateNode = useCallback((nodeId, characterIds) => {
    try {
      worldBuilder.populateNode(nodeId, characterIds);
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  // Preparation phase navigation and validation
  const canProceedToPhase = useCallback((phaseName) => {
    return worldBuilder._canProceedToPhase(phaseName);
  }, [worldBuilder]);

  const proceedToPhase = useCallback((phaseName) => {
    if (!canProceedToPhase(phaseName)) {
      const error = `Cannot proceed to ${phaseName} phase. Previous phases must be completed first.`;
      setError(error);
      throw new Error(error);
    }
    
    setPreparationPhase(phaseName);
    setError(null);
  }, [canProceedToPhase, setPreparationPhase]);

  const validateCurrentPhase = useCallback(() => {
    try {
      const isValid = worldBuilder.validatePreparationPhase(preparationPhase);
      syncWorldConfig();
      setError(null);
      return isValid;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [worldBuilder, preparationPhase, syncWorldConfig]);

  // Template management methods
  const saveAsTemplate = useCallback((type, name, description) => {
    try {
      const template = worldBuilder.saveAsTemplate(type, name, description);
      // Reload templates to include the new one
      loadTemplates();
      setError(null);
      return template;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, loadTemplates]);

  const loadFromTemplate = useCallback((templateId) => {
    try {
      worldBuilder.loadFromTemplate(templateId);
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  // Search and query methods
  const searchNodes = useCallback((query) => {
    if (!query || typeof query !== 'string') {
      return worldConfig.nodes;
    }
    
    const searchTerm = query.toLowerCase();
    return worldConfig.nodes.filter(node => 
      node.name.toLowerCase().includes(searchTerm) ||
      node.description.toLowerCase().includes(searchTerm) ||
      node.type.toLowerCase().includes(searchTerm) ||
      (node.tags && node.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }, [worldConfig.nodes]);

  const searchCharacters = useCallback((query) => {
    if (!query || typeof query !== 'string') {
      return worldConfig.characters;
    }
    
    const searchTerm = query.toLowerCase();
    return worldConfig.characters.filter(character => 
      character.name.toLowerCase().includes(searchTerm) ||
      (character.description && character.description.toLowerCase().includes(searchTerm))
    );
  }, [worldConfig.characters]);

  const searchInteractions = useCallback((query) => {
    if (!query || typeof query !== 'string') {
      return worldConfig.interactions;
    }
    
    const searchTerm = query.toLowerCase();
    return worldConfig.interactions.filter(interaction => 
      interaction.name.toLowerCase().includes(searchTerm) ||
      interaction.type.toLowerCase().includes(searchTerm) ||
      (interaction.description && interaction.description.toLowerCase().includes(searchTerm))
    );
  }, [worldConfig.interactions]);

  const getNodeById = useCallback((nodeId) => {
    return worldConfig.nodes.find(node => node.id === nodeId);
  }, [worldConfig.nodes]);

  const getCharacterById = useCallback((characterId) => {
    return worldConfig.characters.find(character => character.id === characterId);
  }, [worldConfig.characters]);

  const getInteractionById = useCallback((interactionId) => {
    return worldConfig.interactions.find(interaction => interaction.id === interactionId);
  }, [worldConfig.interactions]);

  // Final world validation and preparation for simulation
  const validateWorldForSimulation = useCallback(() => {
    try {
      const result = worldBuilder.validate();
      syncWorldConfig();
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      return { isValid: false, errors: [err.message], warnings: [], simulationReadiness: {}, completeness: 0 };
    }
  }, [worldBuilder, syncWorldConfig]);

  const prepareWorldForSimulation = useCallback(() => {
    try {
      // This is the exclusive gateway to simulation-ready data
      const simulationWorld = worldBuilder.prepareForSimulation();
      setError(null);
      return simulationWorld;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder]);

  const resetBuilder = useCallback(() => {
    try {
      worldBuilder.reset();
      syncWorldConfig();
      setPreparationPhase('worldFoundation');
      setSimulationCompatibility(null);
      setPerformanceAssessment(null);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  // Computed value for overall simulation readiness
  const isSimulationReady = useMemo(() => {
    return simulationCompatibility ? simulationCompatibility.isCompatible : false;
  }, [simulationCompatibility]);

  // Computed value for current preparation phase requirements
  const currentPhaseRequirements = useMemo(() => {
    switch (preparationPhase) {
      case 'worldFoundation':
        return {
          title: 'Define World Foundation',
          description: 'Set world name, description, rules, and initial conditions',
          required: ['name', 'description', 'rules', 'initialConditions'],
          completed: simulationReadiness.worldFoundationDefined
        };
      case 'locations':
        return {
          title: 'Define Locations',
          description: 'Add abstract locations/contexts to your world',
          required: ['At least one location'],
          completed: simulationReadiness.locationsDefined
        };
      case 'capabilities':
        return {
          title: 'Define Capabilities',
          description: 'Define character capabilities and actions',
          required: ['At least one interaction type'],
          completed: simulationReadiness.capabilitiesDefined
        };
      case 'actors':
        return {
          title: 'Define Actors',
          description: 'Add characters with assigned capabilities',
          required: ['At least one character with capabilities'],
          completed: simulationReadiness.actorsDefined
        };
      case 'assignments':
        return {
          title: 'Assign Actors',
          description: 'Assign characters to locations',
          required: ['All characters assigned to locations'],
          completed: simulationReadiness.actorsAssigned
        };
      case 'simulationReady':
        return {
          title: 'Simulation Ready',
          description: 'World is ready for simulation',
          required: ['All preparation phases completed'],
          completed: simulationReadiness.readyForSimulation
        };
      default:
        return null;
    }
  }, [preparationPhase, simulationReadiness]);

  return {
    // State
    worldConfig,
    preparationPhase,
    simulationReadiness,
    simulationCompatibility,
    performanceAssessment,
    availableTemplates,
    isLoading,
    error,
    isSimulationReady,
    currentPhaseRequirements,

    // Template management
    loadTemplates,

    // Phase 1: World foundation methods
    setWorldProperties,
    setRules,
    setInitialConditions,

    // Phase 2: Location methods
    addNode,
    addNodeFromTemplate,
    removeNode,

    // Phase 3: Capability methods
    addInteraction,
    addInteractionFromTemplate,
    removeInteraction,

    // Phase 4: Actor methods
    addCharacter,
    addCharacterFromTemplate,
    removeCharacter,

    // Phase 5: Assignment methods
    assignCharacterToNode,
    populateNode,

    // Preparation phase navigation and validation
    canProceedToPhase,
    proceedToPhase,
    validateCurrentPhase,

    // Template management
    saveAsTemplate,
    loadFromTemplate,

    // Search and query methods
    searchNodes,
    searchCharacters,
    searchInteractions,
    getNodeById,
    getCharacterById,
    getInteractionById,

    // Final simulation preparation
    validateWorldForSimulation,
    prepareWorldForSimulation,
    resetBuilder
  };
};

export default useWorldBuilder;