/**
 * useWorldBuilder Hook - Core hook functionality for step-by-step progression
 * 
 * Implements state management for mappless world configuration with step tracking.
 * Provides template loading and management for world, node, interaction, character, composite templates.
 * Creates methods for six-step flow: world properties, nodes, interactions, characters, population.
 * Adds step navigation and dependency validation (cannot skip steps).
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import WorldBuilder from '../../domain/services/WorldBuilder';

/**
 * Custom hook for managing six-step world building process
 * @param {Object} templateManager - Template manager instance for template operations
 * @returns {Object} World builder state and methods
 */
const useWorldBuilder = (templateManager = null) => {
  // Initialize WorldBuilder instance
  const [worldBuilder] = useState(() => new WorldBuilder(templateManager));
  
  // State management for mappless world configuration with step tracking
  const [worldConfig, setWorldConfig] = useState(worldBuilder.worldConfig);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationStatus, setValidationStatus] = useState(null);
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

  // Sync world config with builder state
  const syncWorldConfig = useCallback(() => {
    // Create a deep copy to ensure React detects the change
    const newWorldConfig = JSON.parse(JSON.stringify(worldBuilder.worldConfig));
    setWorldConfig(newWorldConfig);
    setCurrentStep(worldBuilder.currentStep);
    
    // Update validation status after sync
    const validationResult = worldBuilder.validate();
    setValidationStatus(validationResult);
  }, [worldBuilder]);

  // Step 1: World properties methods (no dimensions)
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

  // Step 2: Node creation methods (abstract locations, no coordinates)
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
      
      // Revalidate affected steps using public methods
      worldBuilder.validateStep(2);
      worldBuilder.validateStep(5);
      
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  // Step 3: Interaction creation methods (character capabilities)
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
      
      // Revalidate affected steps using public methods
      worldBuilder.validateStep(3);
      worldBuilder.validateStep(4);
      
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  // Step 4: Character creation methods (with capability assignment)
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
      
      // Revalidate affected steps using public methods
      worldBuilder.validateStep(4);
      worldBuilder.validateStep(5);
      
      syncWorldConfig();
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  // Step 5: Node population methods (assign characters to nodes)
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

  // Step navigation and dependency validation (cannot skip steps)
  const canProceedToStep = useCallback((stepNumber) => {
    return worldBuilder.canProceedToStep(stepNumber);
  }, [worldBuilder]);

  const proceedToStep = useCallback((stepNumber) => {
    if (!canProceedToStep(stepNumber)) {
      const error = `Cannot proceed to step ${stepNumber}. Previous steps must be completed first.`;
      setError(error);
      throw new Error(error);
    }
    
    setCurrentStep(stepNumber);
    setError(null);
  }, [canProceedToStep]);

  const validateCurrentStep = useCallback(() => {
    try {
      const isValid = worldBuilder.validateStep(currentStep);
      syncWorldConfig();
      setError(null);
      return isValid;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [worldBuilder, currentStep, syncWorldConfig]);

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

  // Final world building and validation
  const validateWorld = useCallback(() => {
    try {
      const result = worldBuilder.validate();
      setValidationStatus(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      return { isValid: false, errors: [err.message], warnings: [], stepValidation: {}, completeness: 0 };
    }
  }, [worldBuilder]);

  const buildWorld = useCallback(() => {
    try {
      const worldState = worldBuilder.build();
      setError(null);
      return worldState;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder]);

  const resetBuilder = useCallback(() => {
    try {
      worldBuilder.reset();
      syncWorldConfig();
      setCurrentStep(1);
      setValidationStatus(null);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [worldBuilder, syncWorldConfig]);

  // Computed values for step validation status
  const stepValidationStatus = useMemo(() => {
    return {
      1: worldConfig.stepValidation[1],
      2: worldConfig.stepValidation[2],
      3: worldConfig.stepValidation[3],
      4: worldConfig.stepValidation[4],
      5: worldConfig.stepValidation[5],
      6: worldConfig.stepValidation[6]
    };
  }, [worldConfig.stepValidation]);

  // Computed value for overall completion status
  const isWorldComplete = useMemo(() => {
    return validationStatus ? validationStatus.isValid : false;
  }, [validationStatus]);

  // Computed value for current step requirements
  const currentStepRequirements = useMemo(() => {
    switch (currentStep) {
      case 1:
        return {
          title: 'Create World Properties',
          description: 'Set world name, description, rules, and initial conditions',
          required: ['name', 'description', 'rules', 'initialConditions'],
          completed: stepValidationStatus[1]
        };
      case 2:
        return {
          title: 'Create Nodes',
          description: 'Add abstract locations/contexts to your world',
          required: ['At least one node'],
          completed: stepValidationStatus[2]
        };
      case 3:
        return {
          title: 'Create Interactions',
          description: 'Define character capabilities and actions',
          required: ['At least one interaction'],
          completed: stepValidationStatus[3]
        };
      case 4:
        return {
          title: 'Create Characters',
          description: 'Add characters with assigned capabilities',
          required: ['At least one character with assigned interactions'],
          completed: stepValidationStatus[4]
        };
      case 5:
        return {
          title: 'Populate Nodes',
          description: 'Assign characters to nodes',
          required: ['All nodes must have at least one character'],
          completed: stepValidationStatus[5]
        };
      case 6:
        return {
          title: 'Simulation Ready',
          description: 'World is ready for simulation',
          required: ['All previous steps completed'],
          completed: stepValidationStatus[6]
        };
      default:
        return null;
    }
  }, [currentStep, stepValidationStatus]);

  return {
    // State
    worldConfig,
    currentStep,
    validationStatus,
    availableTemplates,
    isLoading,
    error,
    stepValidationStatus,
    isWorldComplete,
    currentStepRequirements,

    // Template management
    loadTemplates,

    // Step 1: World properties methods
    setWorldProperties,
    setRules,
    setInitialConditions,

    // Step 2: Node methods
    addNode,
    addNodeFromTemplate,
    removeNode,

    // Step 3: Interaction methods
    addInteraction,
    addInteractionFromTemplate,
    removeInteraction,

    // Step 4: Character methods
    addCharacter,
    addCharacterFromTemplate,
    removeCharacter,

    // Step 5: Population methods
    assignCharacterToNode,
    populateNode,

    // Step navigation and validation
    canProceedToStep,
    proceedToStep,
    validateCurrentStep,

    // Template management
    saveAsTemplate,
    loadFromTemplate,

    // Final world building
    validateWorld,
    buildWorld,
    resetBuilder
  };
};

export default useWorldBuilder;