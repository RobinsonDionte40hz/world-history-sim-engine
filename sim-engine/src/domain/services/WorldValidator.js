const EnvironmentalValidator = require('./EnvironmentalValidator.js');
const Node = require('../entities/Node.js');

/**
 * WorldValidator - Service for validating world configurations through preparation phases.
 * Ensures that a world is well-formed and ready for simulation.
 */
class WorldValidator {
  // Static validation cache for performance optimization
  static validationCache = null;

  /**
   * Validates a world configuration with caching to prevent re-validation of identical configs.
   * @param {Object} worldConfig - The world configuration to validate.
   * @returns {Object} A comprehensive validation result.
   */
  static validateWithCache(worldConfig) {
    const configHash = JSON.stringify(worldConfig);
    if (this.validationCache?.hash === configHash) {
      return this.validationCache.result;
    }
    
    const result = this.validate(worldConfig);
    this.validationCache = { hash: configHash, result };
    return result;
  }

  /**
   * Clears the validation cache. Useful when you want to force re-validation.
   */
  static clearValidationCache() {
    this.validationCache = null;
  }

  /**
   * Validates a complete world configuration against all preparation phases.
   * @param {Object} worldConfig - The world configuration to validate.
   * @returns {Object} A comprehensive validation result.
   */
  static validate(worldConfig) {
    const errors = [];
    const warnings = [];
    const phaseDetails = {};
    const simulationReadiness = {
      worldFoundationDefined: false,
      locationsDefined: false,
      capabilitiesDefined: false,
      actorsDefined: false,
      actorsAssigned: false,
      readyForSimulation: false
    };

    // Phase 1: World Foundation
    const foundationResult = this.validateWorldFoundation(worldConfig);
    phaseDetails.worldFoundation = foundationResult;
    simulationReadiness.worldFoundationDefined = foundationResult.valid;
    if (!foundationResult.valid) errors.push(...foundationResult.errors.map(e => ({ phase: 'World Foundation', ...e })));
    warnings.push(...foundationResult.warnings.map(w => ({ phase: 'World Foundation', ...w })));

    // Phase 2: Locations
    const locationsResult = this.validateLocations(worldConfig.nodes);
    phaseDetails.locations = locationsResult;
    simulationReadiness.locationsDefined = locationsResult.valid && simulationReadiness.worldFoundationDefined;
    if (!locationsResult.valid) errors.push(...locationsResult.errors.map(e => ({ phase: 'Locations', ...e })));
    warnings.push(...locationsResult.warnings.map(w => ({ phase: 'Locations', ...w })));

    // Phase 3: Capabilities
    const capabilitiesResult = this.validateCapabilities(worldConfig.interactions);
    phaseDetails.capabilities = capabilitiesResult;
    simulationReadiness.capabilitiesDefined = capabilitiesResult.valid && simulationReadiness.locationsDefined;
    if (!capabilitiesResult.valid) errors.push(...capabilitiesResult.errors.map(e => ({ phase: 'Capabilities', ...e })));
    warnings.push(...capabilitiesResult.warnings.map(w => ({ phase: 'Capabilities', ...w })));

    // Phase 4: Actors
    const actorsResult = this.validateActors(worldConfig.characters, worldConfig.interactions);
    phaseDetails.actors = actorsResult;
    simulationReadiness.actorsDefined = actorsResult.valid && simulationReadiness.capabilitiesDefined;
    if (!actorsResult.valid) errors.push(...actorsResult.errors.map(e => ({ phase: 'Actors', ...e })));
    warnings.push(...actorsResult.warnings.map(w => ({ phase: 'Actors', ...w })));

    // Phase 5: Actor Assignments
    const assignmentsResult = this.validateActorAssignments(worldConfig.nodePopulations, worldConfig.nodes, worldConfig.characters);
    phaseDetails.actorAssignments = assignmentsResult;
    simulationReadiness.actorsAssigned = assignmentsResult.valid && simulationReadiness.actorsDefined;
    if (!assignmentsResult.valid) errors.push(...assignmentsResult.errors.map(e => ({ phase: 'Actor Assignments', ...e })));
    warnings.push(...assignmentsResult.warnings.map(w => ({ phase: 'Actor Assignments', ...w })));

    // Final Readiness Check
    const readinessResult = this.validateSimulationReadiness(worldConfig);
    phaseDetails.simulationReadiness = readinessResult;
    simulationReadiness.readyForSimulation = readinessResult.valid && simulationReadiness.actorsAssigned;
    if (!readinessResult.valid) errors.push(...readinessResult.errors.map(e => ({ phase: 'Simulation Readiness', ...e })));
    warnings.push(...readinessResult.warnings.map(w => ({ phase: 'Simulation Readiness', ...w })));

    const completenessScore = this.calculateCompleteness(simulationReadiness);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness: completenessScore,
      simulationReadiness,
      phaseDetails,
    };
  }

  /**
   * Phase 1: Validates the world's foundational properties.
   * @param {Object} worldConfig - The world configuration.
   * @returns {Object} Validation result for this phase.
   */
  static validateWorldFoundation(worldConfig) {
    const errors = [];
    const warnings = [];

    // Required world properties (no spatial dimensions needed)
    if (!worldConfig.name || typeof worldConfig.name !== 'string' || worldConfig.name.trim().length === 0) {
      errors.push({ message: 'World name is required and must be a non-empty string', field: 'name' });
    }

    if (!worldConfig.description || typeof worldConfig.description !== 'string' || worldConfig.description.trim().length === 0) {
      warnings.push({ message: 'World description is recommended for better understanding', field: 'description' });
    }

    // Validate rules (optional but recommended)
    if (worldConfig.rules) {
      if (typeof worldConfig.rules !== 'object' || worldConfig.rules === null) {
        errors.push({ message: 'World rules must be an object if provided', field: 'rules' });
      }
    } else {
      warnings.push({ message: 'World rules are recommended for consistent simulation behavior', field: 'rules' });
    }

    // Validate initial conditions (optional but recommended)
    if (worldConfig.initialConditions) {
      if (typeof worldConfig.initialConditions !== 'object' || worldConfig.initialConditions === null) {
        errors.push({ message: 'Initial conditions must be an object if provided', field: 'initialConditions' });
      }
    } else {
      warnings.push({ message: 'Initial conditions are recommended for predictable world setup', field: 'initialConditions' });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      message: errors.length === 0 ? 'Valid world properties' : 'Invalid world properties'
    };
  }

  /**
   * Validates a single abstract node configuration.
   * @param {Object} node - The node configuration to validate.
   * @returns {Object} Validation result.
   */
  static validateSingleNode(node) {
    const errors = [];
    const warnings = [];

    if (!node || typeof node !== 'object') {
      errors.push({ field: 'node', message: 'Node data is required and must be an object' });
      return { isValid: false, errors, warnings };
    }

    // Required fields for abstract nodes
    if (!node.id || typeof node.id !== 'string') {
      errors.push({ field: 'id', message: 'Node ID is required and must be a string' });
    }

    if (!node.name || typeof node.name !== 'string') {
      errors.push({ field: 'name', message: 'Node name is required and must be a string' });
    } else {
      const trimmedName = node.name.trim();
      if (!trimmedName) {
        errors.push({ field: 'name', message: 'Node name cannot be empty' });
      } else if (trimmedName.length < 3) {
        errors.push({ field: 'name', message: 'Node name must be at least 3 characters long' });
      } else if (trimmedName.length > 100) {
        errors.push({ field: 'name', message: 'Node name cannot exceed 100 characters' });
      }
    }

    if (!node.type || typeof node.type !== 'string') {
      errors.push({ field: 'type', message: 'Node type is required and must be a string' });
    }

    if (!node.description || typeof node.description !== 'string') {
      errors.push({ field: 'description', message: 'Node description is required and must be a string' });
    } else {
      const trimmedDescription = node.description.trim();
      if (!trimmedDescription) {
        errors.push({ field: 'description', message: 'Node description cannot be empty' });
      } else if (trimmedDescription.length < 10) {
        errors.push({ field: 'description', message: 'Node description must be at least 10 characters long' });
      } else if (trimmedDescription.length > 1000) {
        errors.push({ field: 'description', message: 'Node description cannot exceed 1000 characters' });
      }
    }

    // Mapless architecture validation - NO spatial coordinates allowed
    if (node.position || node.x !== undefined || node.y !== undefined || node.coordinates) {
      errors.push({ 
        field: 'position', 
        message: 'Spatial coordinates not allowed in mapless system. Use abstract connections instead.' 
      });
    }

    // Enhanced environmental validation using EnvironmentalValidator
    if (node.environment) {
      try {
        const envValidation = EnvironmentalValidator.validateEnvironment(node.environment);
        if (!envValidation.isValid) {
          errors.push(...envValidation.errors.map(err => ({
            field: `environment.${err.field}`,
            message: err.message
          })));
        }
        warnings.push(...envValidation.warnings.map(warn => ({
          field: `environment.${warn.field}`,
          message: warn.message
        })));
      } catch (error) {
        errors.push({ field: 'environment', message: `Environmental validation failed: ${error.message}` });
      }
    }

    // Enhanced connections validation
    if (node.connections) {
      try {
        const connectionsValidation = EnvironmentalValidator.validateConnections(node.connections);
        if (!connectionsValidation.isValid) {
          errors.push(...connectionsValidation.errors.map(err => ({
            field: `connections.${err.field}`,
            message: err.message
          })));
        }
        warnings.push(...connectionsValidation.warnings.map(warn => ({
          field: `connections.${warn.field}`,
          message: warn.message
        })));
      } catch (error) {
        errors.push({ field: 'connections', message: `Connections validation failed: ${error.message}` });
      }
    }

    // Legacy environmental properties validation (for backward compatibility)
    if (node.environmentalProperties && typeof node.environmentalProperties !== 'object') {
      errors.push({ field: 'environmentalProperties', message: 'Environmental properties must be an object if provided' });
    }

    // Resource availability validation
    if (node.resourceAvailability && typeof node.resourceAvailability !== 'object') {
      errors.push({ field: 'resourceAvailability', message: 'Resource availability must be an object if provided' });
    }

    // Cultural context validation
    if (node.culturalContext && typeof node.culturalContext !== 'object') {
      errors.push({ field: 'culturalContext', message: 'Cultural context must be an object if provided' });
    }

    // Size validation for enhanced nodes
    if (node.size !== undefined) {
      if (typeof node.size !== 'number' || node.size <= 0) {
        errors.push({ field: 'size', message: 'Node size must be a positive number if provided' });
      }
    }

    // Resources validation (legacy format)
    if (node.resources && !Array.isArray(node.resources)) {
      errors.push({ field: 'resources', message: 'Resources must be an array if provided' });
    }

    // Capacity validation
    if (node.capacity !== undefined) {
      if (typeof node.capacity !== 'number' || node.capacity < 0) {
        errors.push({ field: 'capacity', message: 'Capacity must be a non-negative number if provided' });
      }
    }

    // Population capacity validation (new format)
    if (node.populationCapacity !== undefined) {
      if (typeof node.populationCapacity !== 'number' || node.populationCapacity < 0) {
        errors.push({ field: 'populationCapacity', message: 'Population capacity must be a non-negative number if provided' });
      } else if (node.populationCapacity > 1000000) {
        warnings.push({ field: 'populationCapacity', message: 'Population capacity seems very high. Consider if this is realistic.' });
      }
    }

    // Current population validation
    if (node.currentPopulation !== undefined) {
      if (typeof node.currentPopulation !== 'number' || node.currentPopulation < 0) {
        errors.push({ field: 'currentPopulation', message: 'Current population must be a non-negative number if provided' });
      } else {
        const capacity = node.populationCapacity || node.capacity;
        if (capacity !== undefined && node.currentPopulation > capacity) {
          errors.push({ field: 'currentPopulation', message: 'Current population cannot exceed population capacity' });
        }
      }
    }

    // Development level validation
    if (node.developmentLevel !== undefined) {
      if (typeof node.developmentLevel !== 'number' || node.developmentLevel < 1 || node.developmentLevel > 10) {
        errors.push({ field: 'developmentLevel', message: 'Development level must be a number between 1 and 10' });
      }
    }

    // Connections validation (abstract, not spatial)
    if (node.connections && !Array.isArray(node.connections)) {
      errors.push({ field: 'connections', message: 'Connections must be an array if provided' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Phase 2: Validates the locations (nodes) of the world.
   * @param {Array} nodes - An array of node configurations.
   * @returns {Object} Validation result for this phase.
   */
  static validateLocations(nodes) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(nodes)) {
      errors.push({ message: 'Nodes must be an array', field: 'nodes' });
      return { valid: false, errors, warnings, count: 0, message: 'Invalid nodes structure' };
    }

    if (nodes.length === 0) {
      errors.push({ message: 'At least one node is required for a valid world', field: 'nodes' });
      return { valid: false, errors, warnings, count: 0, message: 'No nodes defined' };
    }

    const nodeIds = new Set();
    const duplicateIds = new Set();

    nodes.forEach((node, index) => {
      const nodePrefix = `Node ${index + 1}`;

      // Required fields for abstract nodes
      if (!node.id) {
        errors.push({ message: `${nodePrefix}: ID is required`, field: 'id', index });
      } else {
        if (nodeIds.has(node.id)) {
          duplicateIds.add(node.id);
          errors.push({ message: `${nodePrefix}: Duplicate node ID '${node.id}'`, field: 'id', index });
        }
        nodeIds.add(node.id);
      }

      if (!node.name || typeof node.name !== 'string') {
        errors.push({ message: `${nodePrefix}: Name is required and must be a string`, field: 'name', index });
      }

      if (!node.type || typeof node.type !== 'string') {
        errors.push({ message: `${nodePrefix}: Type is required and must be a string`, field: 'type', index });
      }

      // Environmental properties validation (mappless - no coordinates)
      if (node.environment) {
        if (typeof node.environment !== 'object') {
          errors.push({ message: `${nodePrefix}: Environment must be an object if provided`, field: 'environment', index });
        }
      } else {
        warnings.push({ message: `${nodePrefix}: Environmental properties are recommended`, field: 'environment', index });
      }

      // Resources validation
      if (node.resources && !Array.isArray(node.resources)) {
        errors.push({ message: `${nodePrefix}: Resources must be an array if provided`, field: 'resources', index });
      }

      // Capacity validation
      if (node.capacity !== undefined) {
        if (typeof node.capacity !== 'number' || node.capacity < 0) {
          errors.push({ message: `${nodePrefix}: Capacity must be a non-negative number if provided`, field: 'capacity', index });
        }
      } else {
        warnings.push({ message: `${nodePrefix}: Population capacity is recommended for better simulation`, field: 'capacity', index });
      }
    });

    // Minimum nodes recommendation
    if (nodes.length < 3) {
      warnings.push({ message: 'At least 3 nodes are recommended for interesting interactions', field: 'nodes' });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      count: nodes.length,
      uniqueIds: nodeIds.size,
      duplicates: Array.from(duplicateIds),
      message: errors.length === 0 ? `${nodes.length} valid abstract nodes` : 'Invalid nodes'
    };
  }

  /**
   * Phase 3: Validates character capabilities (interactions).
   * @param {Array} interactions - An array of interaction configurations.
   * @returns {Object} Validation result for this phase.
   */
  static validateCapabilities(interactions) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(interactions)) {
      errors.push({ message: 'Interactions must be an array', field: 'interactions' });
      return { valid: false, errors, warnings, count: 0, message: 'Invalid interactions structure' };
    }

    if (interactions.length === 0) {
      errors.push({ message: 'At least one interaction type is required for character capabilities', field: 'interactions' });
      return { valid: false, errors, warnings, count: 0, message: 'No interactions defined' };
    }

    const interactionIds = new Set();
    const capabilityTypes = new Set();

    interactions.forEach((interaction, index) => {
      const interactionPrefix = `Interaction ${index + 1}`;

      // Required fields
      if (!interaction.id) {
        errors.push({ message: `${interactionPrefix}: ID is required`, field: 'id', index });
      } else {
        if (interactionIds.has(interaction.id)) {
          errors.push({ message: `${interactionPrefix}: Duplicate interaction ID '${interaction.id}'`, field: 'id', index });
        }
        interactionIds.add(interaction.id);
      }

      if (!interaction.name || typeof interaction.name !== 'string') {
        errors.push({ message: `${interactionPrefix}: Name is required and must be a string`, field: 'name', index });
      }

      if (!interaction.type || typeof interaction.type !== 'string') {
        errors.push({ message: `${interactionPrefix}: Type is required and must be a string`, field: 'type', index });
      } else {
        capabilityTypes.add(interaction.type);
      }

      // Capability category validation
      const validCategories = ['economic', 'social', 'combat', 'crafting', 'exploration', 'governance', 'religious', 'cultural'];
      if (interaction.category && !validCategories.includes(interaction.category)) {
        warnings.push({ message: `${interactionPrefix}: Category '${interaction.category}' is not a standard capability type`, field: 'category', index });
      }

      // Requirements validation
      if (interaction.requirements) {
        if (typeof interaction.requirements !== 'object') {
          errors.push({ message: `${interactionPrefix}: Requirements must be an object if provided`, field: 'requirements', index });
        }
      }

      // Effects validation
      if (interaction.effects) {
        if (typeof interaction.effects !== 'object') {
          errors.push({ message: `${interactionPrefix}: Effects must be an object if provided`, field: 'effects', index });
        }
      } else {
        warnings.push({ message: `${interactionPrefix}: Effects are recommended to define interaction outcomes`, field: 'effects', index });
      }
    });

    // Capability diversity recommendation
    if (capabilityTypes.size < 3) {
      warnings.push({ message: 'At least 3 different capability types are recommended for diverse character interactions', field: 'interactions' });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      count: interactions.length,
      uniqueTypes: capabilityTypes.size,
      types: Array.from(capabilityTypes),
      message: errors.length === 0 ? `${interactions.length} valid character capabilities` : 'Invalid interactions'
    };
  }

  /**
   * Phase 4: Validates the actors (characters) of the world.
   * @param {Array} characters - An array of character configurations.
   * @param {Array} interactions - An array of available interactions.
   * @returns {Object} Validation result for this phase.
   */
  static validateActors(characters, interactions) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(characters)) {
      errors.push({ message: 'Characters must be an array', field: 'characters' });
      return { valid: false, errors, warnings, count: 0, message: 'Invalid characters structure' };
    }

    if (characters.length === 0) {
      errors.push({ message: 'At least one character is required for world simulation', field: 'characters' });
      return { valid: false, errors, warnings, count: 0, message: 'No characters defined' };
    }

    const characterIds = new Set();
    const availableInteractionIds = new Set(interactions?.map(i => i.id) || []);
    const charactersWithoutCapabilities = [];

    characters.forEach((character, index) => {
      const characterPrefix = `Character ${index + 1}`;

      // Required fields
      if (!character.id) {
        errors.push({ message: `${characterPrefix}: ID is required`, field: 'id', index });
      } else {
        if (characterIds.has(character.id)) {
          errors.push({ message: `${characterPrefix}: Duplicate character ID '${character.id}'`, field: 'id', index });
        }
        characterIds.add(character.id);
      }

      if (!character.name || typeof character.name !== 'string') {
        errors.push({ message: `${characterPrefix}: Name is required and must be a string`, field: 'name', index });
      }

      // Capability validation (assigned interactions)
      if (!character.capabilities || !Array.isArray(character.capabilities) || character.capabilities.length === 0) {
        errors.push({ message: `${characterPrefix}: At least one capability must be assigned`, field: 'capabilities', index });
        charactersWithoutCapabilities.push(character.id || index);
      } else {
        character.capabilities.forEach((capabilityId, capIndex) => {
          if (!availableInteractionIds.has(capabilityId)) {
            errors.push({ message: `${characterPrefix}: Capability '${capabilityId}' is not available in defined interactions`, field: 'capabilities', index, capabilityIndex: capIndex });
          }
        });
      }

      // Attributes validation
      if (character.attributes) {
        if (typeof character.attributes !== 'object') {
          errors.push({ message: `${characterPrefix}: Attributes must be an object if provided`, field: 'attributes', index });
        }
      } else {
        warnings.push({ message: `${characterPrefix}: Attributes are recommended for character uniqueness`, field: 'attributes', index });
      }

      // Personality validation
      if (character.personality) {
        if (typeof character.personality !== 'object') {
          errors.push({ message: `${characterPrefix}: Personality must be an object if provided`, field: 'personality', index });
        }
      } else {
        warnings.push({ message: `${characterPrefix}: Personality profile is recommended for realistic behavior`, field: 'personality', index });
      }
    });

    // Character diversity recommendations
    if (characters.length < 5) {
      warnings.push({ message: 'At least 5 characters are recommended for dynamic interactions', field: 'characters' });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      count: characters.length,
      uniqueIds: characterIds.size,
      charactersWithoutCapabilities: charactersWithoutCapabilities.length,
      message: errors.length === 0 ? `${characters.length} valid characters with capabilities` : 'Invalid characters'
    };
  }

  /**
   * Phase 5: Validates actor assignments to locations.
   * @param {Object} nodePopulations - A map of node IDs to character ID arrays.
   * @param {Array} nodes - An array of available nodes.
   * @param {Array} characters - An array of available characters.
   * @returns {Object} Validation result for this phase.
   */
  static validateActorAssignments(nodePopulations, nodes, characters) {
    const errors = [];
    const warnings = [];

    if (!nodePopulations || typeof nodePopulations !== 'object') {
      errors.push({ message: 'Node populations must be an object mapping node IDs to character arrays', field: 'nodePopulations' });
      return { valid: false, errors, warnings, message: 'Invalid node populations structure' };
    }

    const availableNodeIds = new Set(nodes?.map(n => n.id) || []);
    const availableCharacterIds = new Set(characters?.map(c => c.id) || []);
    const assignedCharacters = new Set();
    const unassignedCharacters = new Set(availableCharacterIds);
    const unpopulatedNodes = new Set(availableNodeIds);

    // Validate each node population
    Object.entries(nodePopulations).forEach(([nodeId, characterIds]) => {
      const nodePrefix = `Node '${nodeId}'`;

      // Validate node exists
      if (!availableNodeIds.has(nodeId)) {
        errors.push({ message: `${nodePrefix}: Node does not exist`, field: 'nodeId', nodeId });
        return;
      }

      unpopulatedNodes.delete(nodeId);

      // Validate character array
      if (!Array.isArray(characterIds)) {
        errors.push({ message: `${nodePrefix}: Character list must be an array`, field: 'characters', nodeId });
        return;
      }

      if (characterIds.length === 0) {
        warnings.push({ message: `${nodePrefix}: Node has no assigned characters`, field: 'characters', nodeId });
        return;
      }

      // Validate each character assignment
      characterIds.forEach((characterId, index) => {
        if (!availableCharacterIds.has(characterId)) {
          errors.push({ message: `${nodePrefix}: Character '${characterId}' does not exist`, field: 'characterId', nodeId, characterIndex: index });
        } else {
          if (assignedCharacters.has(characterId)) {
            errors.push({ message: `${nodePrefix}: Character '${characterId}' is assigned to multiple nodes`, field: 'characterId', nodeId, characterIndex: index });
          } else {
            assignedCharacters.add(characterId);
            unassignedCharacters.delete(characterId);
          }
        }
      });

      // Node capacity validation
      const node = nodes?.find(n => n.id === nodeId);
      if (node && node.capacity && characterIds.length > node.capacity) {
        warnings.push({ message: `${nodePrefix}: Population (${characterIds.length}) exceeds capacity (${node.capacity})`, field: 'capacity', nodeId });
      }
    });

    // Check for unassigned characters
    if (unassignedCharacters.size > 0) {
      errors.push({ 
        message: `${unassignedCharacters.size} character(s) not assigned to any node: ${Array.from(unassignedCharacters).join(', ')}`, 
        field: 'unassigned', 
        unassignedCharacters: Array.from(unassignedCharacters) 
      });
    }

    // Check for unpopulated nodes
    if (unpopulatedNodes.size > 0) {
      warnings.push({ 
        message: `${unpopulatedNodes.size} node(s) have no assigned characters: ${Array.from(unpopulatedNodes).join(', ')}`, 
        field: 'unpopulated', 
        unpopulatedNodes: Array.from(unpopulatedNodes) 
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      populatedNodes: Object.keys(nodePopulations).length,
      assignedCharacters: assignedCharacters.size,
      unassignedCharacters: unassignedCharacters.size,
      unpopulatedNodes: unpopulatedNodes.size,
      message: errors.length === 0 ? 'Valid character-to-node assignments' : 'Invalid node populations'
    };
  }

  /**
   * Final Phase: Validates the overall readiness for simulation.
   * @param {Object} worldConfig - The complete world configuration.
   * @returns {Object} Validation result for this phase.
   */
  static validateSimulationReadiness(worldConfig) {
    const errors = [];
    const warnings = [];

    // Check all required components are present
    const requiredComponents = ['name', 'nodes', 'interactions', 'characters', 'nodePopulations'];
    const missingComponents = requiredComponents.filter(comp => {
      if (comp === 'nodePopulations') return !worldConfig[comp] || Object.keys(worldConfig[comp]).length === 0;
      if (Array.isArray(worldConfig[comp])) return !worldConfig[comp] || worldConfig[comp].length === 0;
      return !worldConfig[comp];
    });

    if (missingComponents.length > 0) {
      errors.push({ message: `Missing required components: ${missingComponents.join(', ')}`, field: 'completeness', missing: missingComponents });
    }

    // Check minimum quantities for viable simulation
    if (worldConfig.nodes && worldConfig.nodes.length < 2) {
      errors.push({ message: 'At least 2 nodes are required for world interactions', field: 'nodes' });
    }

    if (worldConfig.characters && worldConfig.characters.length < 2) {
      errors.push({ message: 'At least 2 characters are required for world interactions', field: 'characters' });
    }

    if (worldConfig.interactions && worldConfig.interactions.length < 1) {
      errors.push({ message: 'At least 1 interaction type is required for character capabilities', field: 'interactions' });
    }

    // Check for simulation readiness
    const hasRules = worldConfig.rules && typeof worldConfig.rules === 'object';
    const hasInitialConditions = worldConfig.initialConditions && typeof worldConfig.initialConditions === 'object';

    if (!hasRules) {
      warnings.push({ message: 'World rules are recommended for consistent simulation behavior', field: 'rules' });
    }

    if (!hasInitialConditions) {
      warnings.push({ message: 'Initial conditions are recommended for predictable simulation start', field: 'initialConditions' });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      readyForSimulation: errors.length === 0,
      message: errors.length === 0 ? 'World is complete and ready for simulation' : 'World is incomplete'
    };
  }

  /**
   * Calculates a completeness score based on validated phases.
   * @param {Object} simulationReadiness - An object with boolean flags for each phase.
   * @returns {number} A completeness score between 0 and 1.
   */
  static calculateCompleteness(simulationReadiness) {
    const validPhases = Object.values(simulationReadiness).filter(Boolean).length;
    const totalPhases = Object.keys(simulationReadiness).length;
    return totalPhases > 0 ? validPhases / totalPhases : 0;
  }

  // Legacy method compatibility (deprecated - use simulation preparation pipeline validation instead)
  static validateDimensions(dimensions) {
    const errors = [];
    const warnings = [];

    if (!dimensions) {
      errors.push('World dimensions are required');
      return { valid: false, errors, warnings, message: 'Missing dimensions' };
    }

    if (typeof dimensions.width !== 'number' || dimensions.width <= 0) {
      errors.push('World width must be a positive number');
    }

    if (typeof dimensions.height !== 'number' || dimensions.height <= 0) {
      errors.push('World height must be a positive number');
    }

    // Optional depth for 3D worlds
    if (dimensions.depth !== undefined && (typeof dimensions.depth !== 'number' || dimensions.depth <= 0)) {
      errors.push('World depth must be a positive number if specified');
    }

    // Performance warnings for very large worlds
    if (dimensions.width > 1000 || dimensions.height > 1000) {
      warnings.push('Large world dimensions may impact performance');
    }

    // Minimum size recommendations
    if (dimensions.width < 10 || dimensions.height < 10) {
      warnings.push('Very small world dimensions may limit simulation complexity');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      message: errors.length === 0 ? 'Valid dimensions' : 'Invalid dimensions'
    };
  }

  /**
   * Validates world nodes
   * @param {Array} nodes - Array of node configurations
   * @returns {Object} Validation result
   */
  static validateNodes(nodes) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(nodes)) {
      errors.push('Nodes must be an array');
      return { valid: false, errors, warnings, count: 0, message: 'Invalid nodes structure' };
    }

    if (nodes.length === 0) {
      errors.push('At least one node is required for a valid world');
      return { valid: false, errors, warnings, count: 0, message: 'No nodes defined' };
    }

    const nodeIds = new Set();
    const duplicateIds = new Set();

    nodes.forEach((node, index) => {
      const nodePrefix = `Node ${index + 1}`;

      // Required fields
      if (!node.id) {
        errors.push(`${nodePrefix}: ID is required`);
      } else {
        if (nodeIds.has(node.id)) {
          duplicateIds.add(node.id);
          errors.push(`${nodePrefix}: Duplicate node ID '${node.id}'`);
        }
        nodeIds.add(node.id);
      }

      if (!node.name || typeof node.name !== 'string') {
        errors.push(`${nodePrefix}: Name is required and must be a string`);
      }

      // Position validation
      if (!node.position) {
        errors.push(`${nodePrefix}: Position is required`);
      } else {
        if (typeof node.position.x !== 'number') {
          errors.push(`${nodePrefix}: Position x must be a number`);
        }
        if (typeof node.position.y !== 'number') {
          errors.push(`${nodePrefix}: Position y must be a number`);
        }
        // Optional z for 3D
        if (node.position.z !== undefined && typeof node.position.z !== 'number') {
          errors.push(`${nodePrefix}: Position z must be a number if specified`);
        }
      }

      // Optional but recommended fields
      if (!node.type) {
        warnings.push(`${nodePrefix}: Node type not specified, using default`);
      }

      if (!node.description) {
        warnings.push(`${nodePrefix}: Node description not provided`);
      }

      // Validate node properties if present
      if (node.properties && typeof node.properties !== 'object') {
        errors.push(`${nodePrefix}: Properties must be an object`);
      }

      // Validate resources if present
      if (node.resources && !Array.isArray(node.resources)) {
        errors.push(`${nodePrefix}: Resources must be an array`);
      }
    });

    // Performance warnings
    if (nodes.length > 100) {
      warnings.push('Large number of nodes may impact performance');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      count: nodes.length,
      message: errors.length === 0 ? `${nodes.length} valid nodes` : 'Invalid node configuration'
    };
  }

  /**
   * Validates world characters
   * @param {Array} characters - Array of character configurations
   * @returns {Object} Validation result
   */
  static validateCharacters(characters) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(characters)) {
      if (characters !== undefined) {
        errors.push('Characters must be an array');
      }
      return { 
        valid: characters === undefined, 
        errors, 
        warnings, 
        count: 0, 
        message: characters === undefined ? 'No characters defined' : 'Invalid characters structure' 
      };
    }

    if (characters.length === 0) {
      warnings.push('No characters defined - world may lack dynamic interactions');
      return { valid: true, errors, warnings, count: 0, message: 'No characters defined' };
    }

    const characterIds = new Set();

    characters.forEach((character, index) => {
      const charPrefix = `Character ${index + 1}`;

      // Required fields
      if (!character.id) {
        errors.push(`${charPrefix}: ID is required`);
      } else {
        if (characterIds.has(character.id)) {
          errors.push(`${charPrefix}: Duplicate character ID '${character.id}'`);
        }
        characterIds.add(character.id);
      }

      if (!character.name || typeof character.name !== 'string') {
        errors.push(`${charPrefix}: Name is required and must be a string`);
      }

      // Attributes validation
      if (!character.attributes) {
        errors.push(`${charPrefix}: Attributes are required`);
      } else if (typeof character.attributes !== 'object') {
        errors.push(`${charPrefix}: Attributes must be an object`);
      } else {
        // Validate common attributes
        const requiredAttributes = ['strength', 'intelligence', 'charisma'];
        requiredAttributes.forEach(attr => {
          if (character.attributes[attr] === undefined) {
            warnings.push(`${charPrefix}: Missing ${attr} attribute`);
          } else if (typeof character.attributes[attr] !== 'number') {
            errors.push(`${charPrefix}: ${attr} must be a number`);
          }
        });
      }

      // Current node validation (will be cross-validated later)
      if (character.currentNodeId && typeof character.currentNodeId !== 'string') {
        errors.push(`${charPrefix}: currentNodeId must be a string`);
      }

      // Optional fields validation
      if (character.race && typeof character.race !== 'string') {
        errors.push(`${charPrefix}: Race must be a string`);
      }

      if (character.background && typeof character.background !== 'object') {
        errors.push(`${charPrefix}: Background must be an object`);
      }

      if (character.personality && typeof character.personality !== 'object') {
        errors.push(`${charPrefix}: Personality must be an object`);
      }

      if (character.skills && !Array.isArray(character.skills)) {
        errors.push(`${charPrefix}: Skills must be an array`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      count: characters.length,
      message: errors.length === 0 ? `${characters.length} valid characters` : 'Invalid character configuration'
    };
  }

  /**
   * Validates world interactions
   * @param {Array} interactions - Array of interaction configurations
   * @returns {Object} Validation result
   */
  static validateInteractions(interactions) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(interactions)) {
      if (interactions !== undefined) {
        errors.push('Interactions must be an array');
      }
      return { 
        valid: interactions === undefined, 
        errors, 
        warnings, 
        count: 0, 
        message: interactions === undefined ? 'No interactions defined' : 'Invalid interactions structure' 
      };
    }

    if (interactions.length === 0) {
      warnings.push('No interactions defined - characters may have limited behaviors');
      return { valid: true, errors, warnings, count: 0, message: 'No interactions defined' };
    }

    const interactionIds = new Set();

    interactions.forEach((interaction, index) => {
      const intPrefix = `Interaction ${index + 1}`;

      // Required fields
      if (!interaction.id) {
        errors.push(`${intPrefix}: ID is required`);
      } else {
        if (interactionIds.has(interaction.id)) {
          errors.push(`${intPrefix}: Duplicate interaction ID '${interaction.id}'`);
        }
        interactionIds.add(interaction.id);
      }

      if (!interaction.name || typeof interaction.name !== 'string') {
        errors.push(`${intPrefix}: Name is required and must be a string`);
      }

      if (!interaction.type || typeof interaction.type !== 'string') {
        errors.push(`${intPrefix}: Type is required and must be a string`);
      }

      // Validate trigger conditions
      if (interaction.trigger && typeof interaction.trigger !== 'object') {
        errors.push(`${intPrefix}: Trigger must be an object`);
      }

      // Validate effects
      if (interaction.effects && !Array.isArray(interaction.effects)) {
        errors.push(`${intPrefix}: Effects must be an array`);
      }

      // Validate conditions
      if (interaction.conditions && !Array.isArray(interaction.conditions)) {
        errors.push(`${intPrefix}: Conditions must be an array`);
      }

      // Optional fields
      if (!interaction.description) {
        warnings.push(`${intPrefix}: Description not provided`);
      }

      if (interaction.probability !== undefined && 
          (typeof interaction.probability !== 'number' || 
           interaction.probability < 0 || 
           interaction.probability > 1)) {
        errors.push(`${intPrefix}: Probability must be a number between 0 and 1`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      count: interactions.length,
      message: errors.length === 0 ? `${interactions.length} valid interactions` : 'Invalid interaction configuration'
    };
  }

  /**
   * Validates world events
   * @param {Array} events - Array of event configurations
   * @returns {Object} Validation result
   */
  static validateEvents(events) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(events)) {
      if (events !== undefined) {
        errors.push('Events must be an array');
      }
      return { 
        valid: events === undefined, 
        errors, 
        warnings, 
        count: 0, 
        message: events === undefined ? 'No events defined' : 'Invalid events structure' 
      };
    }

    if (events.length === 0) {
      warnings.push('No events defined - world may lack dynamic occurrences');
      return { valid: true, errors, warnings, count: 0, message: 'No events defined' };
    }

    const eventIds = new Set();

    events.forEach((event, index) => {
      const eventPrefix = `Event ${index + 1}`;

      // Required fields
      if (!event.id) {
        errors.push(`${eventPrefix}: ID is required`);
      } else {
        if (eventIds.has(event.id)) {
          errors.push(`${eventPrefix}: Duplicate event ID '${event.id}'`);
        }
        eventIds.add(event.id);
      }

      if (!event.name || typeof event.name !== 'string') {
        errors.push(`${eventPrefix}: Name is required and must be a string`);
      }

      if (!event.trigger) {
        errors.push(`${eventPrefix}: Trigger is required`);
      } else if (typeof event.trigger !== 'object') {
        errors.push(`${eventPrefix}: Trigger must be an object`);
      }

      // Validate event type
      if (event.type && typeof event.type !== 'string') {
        errors.push(`${eventPrefix}: Type must be a string`);
      }

      // Validate frequency/timing
      if (event.frequency !== undefined && typeof event.frequency !== 'number') {
        errors.push(`${eventPrefix}: Frequency must be a number`);
      }

      // Validate effects
      if (event.effects && !Array.isArray(event.effects)) {
        errors.push(`${eventPrefix}: Effects must be an array`);
      }

      // Optional fields
      if (!event.description) {
        warnings.push(`${eventPrefix}: Description not provided`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      count: events.length,
      message: errors.length === 0 ? `${events.length} valid events` : 'Invalid event configuration'
    };
  }  /*
*
   * Validates character-node relationships
   * @param {Array} characters - Array of characters
   * @param {Array} nodes - Array of nodes
   * @returns {Object} Validation result
   */
  static validateCharacterNodeRelationships(characters, nodes) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(characters) || !Array.isArray(nodes)) {
      return { 
        valid: true, 
        errors, 
        warnings, 
        message: 'Skipping relationship validation - missing characters or nodes' 
      };
    }

    if (characters.length === 0 || nodes.length === 0) {
      return { 
        valid: true, 
        errors, 
        warnings, 
        message: 'No relationships to validate' 
      };
    }

    const nodeIds = new Set(nodes.map(node => node.id).filter(id => id));
    const unassignedCharacters = [];
    const invalidAssignments = [];

    characters.forEach((character, index) => {
      if (!character.currentNodeId) {
        unassignedCharacters.push(character.name || `Character ${index + 1}`);
      } else if (!nodeIds.has(character.currentNodeId)) {
        invalidAssignments.push({
          character: character.name || `Character ${index + 1}`,
          nodeId: character.currentNodeId
        });
      }
    });

    // Errors for invalid assignments
    invalidAssignments.forEach(({ character, nodeId }) => {
      errors.push(`Character '${character}' assigned to non-existent node '${nodeId}'`);
    });

    // Warnings for unassigned characters
    if (unassignedCharacters.length > 0) {
      warnings.push(`Characters not assigned to nodes: ${unassignedCharacters.join(', ')}`);
    }

    // Check for overcrowded nodes
    const nodeOccupancy = {};
    characters.forEach(character => {
      if (character.currentNodeId && nodeIds.has(character.currentNodeId)) {
        nodeOccupancy[character.currentNodeId] = (nodeOccupancy[character.currentNodeId] || 0) + 1;
      }
    });

    Object.entries(nodeOccupancy).forEach(([nodeId, count]) => {
      if (count > 10) { // Arbitrary threshold for overcrowding
        warnings.push(`Node '${nodeId}' may be overcrowded with ${count} characters`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      message: errors.length === 0 ? 'Valid character-node relationships' : 'Invalid character-node relationships'
    };
  }

  /**
   * Validates world rules configuration
   * @param {Object} rules - Rules configuration
   * @returns {Object} Validation result
   */
  static validateRules(rules) {
    const errors = [];
    const warnings = [];

    if (!rules) {
      warnings.push('No rules defined - using default simulation rules');
      return { valid: true, errors, warnings, message: 'No rules defined' };
    }

    if (typeof rules !== 'object') {
      errors.push('Rules must be an object');
      return { valid: false, errors, warnings, message: 'Invalid rules structure' };
    }

    // Validate physics rules
    if (rules.physics && typeof rules.physics !== 'object') {
      errors.push('Physics rules must be an object');
    }

    // Validate interaction rules
    if (rules.interactions && typeof rules.interactions !== 'object') {
      errors.push('Interaction rules must be an object');
    }

    // Validate evolution rules
    if (rules.evolution && typeof rules.evolution !== 'object') {
      errors.push('Evolution rules must be an object');
    }

    // Validate time scale
    if (rules.timeScale !== undefined && 
        (typeof rules.timeScale !== 'number' || rules.timeScale <= 0)) {
      errors.push('Time scale must be a positive number');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      message: errors.length === 0 ? 'Valid rules configuration' : 'Invalid rules configuration'
    };
  }

  /**
   * Validates initial conditions configuration
   * @param {Object} initialConditions - Initial conditions configuration
   * @returns {Object} Validation result
   */
  static validateInitialConditions(initialConditions) {
    const errors = [];
    const warnings = [];

    if (!initialConditions) {
      warnings.push('No initial conditions defined - using defaults');
      return { valid: true, errors, warnings, message: 'No initial conditions defined' };
    }

    if (typeof initialConditions !== 'object') {
      errors.push('Initial conditions must be an object');
      return { valid: false, errors, warnings, message: 'Invalid initial conditions structure' };
    }

    // Validate character count
    if (initialConditions.characterCount !== undefined && 
        (typeof initialConditions.characterCount !== 'number' || 
         initialConditions.characterCount < 0)) {
      errors.push('Character count must be a non-negative number');
    }

    // Validate resource types
    if (initialConditions.resourceTypes && !Array.isArray(initialConditions.resourceTypes)) {
      errors.push('Resource types must be an array');
    }

    // Validate starting resources
    if (initialConditions.startingResources && typeof initialConditions.startingResources !== 'object') {
      errors.push('Starting resources must be an object');
    }

    // Validate time scale
    if (initialConditions.timeScale !== undefined && 
        (typeof initialConditions.timeScale !== 'number' || initialConditions.timeScale <= 0)) {
      errors.push('Time scale must be a positive number');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      message: errors.length === 0 ? 'Valid initial conditions' : 'Invalid initial conditions'
    };
  }

  /**
   * Provides real-time validation feedback with categorized messages
   * @param {Object} validationResult - Result from validate() method
   * @returns {Object} Formatted feedback for UI display
   */
  static formatValidationFeedback(validationResult) {
    const { isValid, errors, warnings, completeness, details } = validationResult;

    // Categorize errors by severity
    const criticalErrors = errors.filter(error => 
      error.includes('required') || 
      error.includes('must be') ||
      error.includes('Duplicate')
    );

    const configurationErrors = errors.filter(error => 
      !criticalErrors.includes(error)
    );

    // Categorize warnings by type
    const performanceWarnings = warnings.filter(warning =>
      warning.includes('performance') ||
      warning.includes('Large') ||
      warning.includes('overcrowded')
    );

    const recommendationWarnings = warnings.filter(warning =>
      !performanceWarnings.includes(warning)
    );

    // Generate completion suggestions
    const suggestions = [];
    if (completeness < 0.5) {
      suggestions.push('Consider adding more essential components to improve world completeness');
    }
    if (details.characters && details.characters.count === 0) {
      suggestions.push('Add characters to create dynamic interactions in your world');
    }
    if (details.interactions && details.interactions.count === 0) {
      suggestions.push('Define interactions to specify how characters behave');
    }
    if (details.events && details.events.count === 0) {
      suggestions.push('Add events to create dynamic world occurrences');
    }

    return {
      status: isValid ? 'valid' : 'invalid',
      completeness: Math.round(completeness * 100),
      summary: {
        totalErrors: errors.length,
        totalWarnings: warnings.length,
        readyForSimulation: isValid
      },
      feedback: {
        critical: criticalErrors,
        configuration: configurationErrors,
        performance: performanceWarnings,
        recommendations: recommendationWarnings,
        suggestions
      },
      details
    };
  }

  /**
   * Validates an enhanced Node entity with environmental properties
   * @param {Node|Object} node - Node entity or node data
   * @returns {Object} Validation result
   */
  static validateEnhancedNode(node) {
    const errors = [];
    const warnings = [];

    try {
      // Convert to Node entity if needed
      let nodeEntity = node;
      if (!(node instanceof Node)) {
        nodeEntity = Node.fromJSON(node);
      }

      // Validate basic node structure
      const basicValidation = this.validateSingleNode(nodeEntity.toJSON());
      errors.push(...basicValidation.errors);
      warnings.push(...basicValidation.warnings);

      // Additional enhanced node validations
      if (nodeEntity.environment) {
        // Validate environmental danger calculation
        try {
          const danger = nodeEntity.getEnvironmentalDanger();
          if (typeof danger !== 'number' || danger < 0 || danger > 1) {
            warnings.push({ 
              field: 'environment', 
              message: 'Environmental danger calculation returned invalid value' 
            });
          }
        } catch (error) {
          warnings.push({ 
            field: 'environment', 
            message: `Environmental danger calculation failed: ${error.message}` 
          });
        }

        // Validate population capacity calculation
        try {
          const capacity = nodeEntity.getPopulationCapacity();
          if (typeof capacity !== 'number' || capacity < 0) {
            warnings.push({ 
              field: 'environment', 
              message: 'Population capacity calculation returned invalid value' 
            });
          }
        } catch (error) {
          warnings.push({ 
            field: 'environment', 
            message: `Population capacity calculation failed: ${error.message}` 
          });
        }
      }

      // Validate connections functionality
      if (nodeEntity.connections && nodeEntity.connections.length > 0) {
        try {
          const connectedIds = nodeEntity.getConnectedNodeIds();
          if (!Array.isArray(connectedIds)) {
            errors.push({ 
              field: 'connections', 
              message: 'Connected node IDs should return an array' 
            });
          }
        } catch (error) {
          errors.push({ 
            field: 'connections', 
            message: `Connection functionality failed: ${error.message}` 
          });
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        message: errors.length === 0 ? 'Enhanced node is valid' : 'Enhanced node validation failed'
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [{ field: 'node', message: `Enhanced node validation failed: ${error.message}` }],
        warnings: [],
        message: 'Enhanced node validation error'
      };
    }
  }

  /**
   * Validates abstract nodes (alias for validateLocations for backward compatibility)
   * @param {Array} nodes - Array of node configurations
   * @returns {Object} Validation result
   */
  static validateAbstractNodes(nodes) {
    return this.validateLocations(nodes);
  }

  /**
   * Quick validation check for specific world component
   * @param {string} component - Component type to validate
   * @param {*} data - Component data
   * @returns {Object} Quick validation result
   */
  static validateComponent(component, data) {
    switch (component) {
      case 'dimensions':
        return this.validateDimensions(data);
      case 'nodes':
        return this.validateNodes(data);
      case 'enhancedNode':
        return this.validateEnhancedNode(data);
      case 'characters':
        return this.validateCharacters(data);
      case 'interactions':
        return this.validateInteractions(data);
      case 'events':
        return this.validateEvents(data);
      case 'rules':
        return this.validateRules(data);
      case 'initialConditions':
        return this.validateInitialConditions(data);
      default:
        return {
          valid: false,
          errors: [`Unknown component type: ${component}`],
          warnings: [],
          message: 'Invalid component type'
        };
    }
  }
}

module.exports = WorldValidator;
