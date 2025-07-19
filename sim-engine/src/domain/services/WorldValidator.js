/**
 * WorldValidator - Six-step validation service for mappless world configurations
 * Implements step-by-step validation (world properties, nodes, interactions, characters, populations)
 * Removes spatial validation (no dimensions or coordinates in mappless system)
 * Adds character capability validation (ensure characters have assigned interactions)
 * Adds node population validation (ensure all nodes have assigned characters)
 * Creates completeness scoring system for six-step progression
 * Adds real-time validation feedback with step-specific error messages
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */
class WorldValidator {
  /**
   * Validates a complete world configuration using six-step mappless validation
   * @param {Object} worldConfig - The world configuration to validate
   * @returns {Object} Validation result with step-by-step errors, warnings, and completeness score
   */
  static validate(worldConfig) {
    const errors = [];
    const warnings = [];
    const stepDetails = {};
    const stepValidation = {
      1: false, // World properties
      2: false, // Nodes
      3: false, // Interactions
      4: false, // Characters
      5: false, // Node populations
      6: false  // Complete and ready
    };

    // Step 1: Validate world properties (no spatial dimensions)
    const worldPropertiesResult = this.validateWorldProperties(worldConfig);
    stepDetails.worldProperties = worldPropertiesResult;
    stepValidation[1] = worldPropertiesResult.valid;
    if (!worldPropertiesResult.valid) {
      errors.push(...worldPropertiesResult.errors.map(error => ({ step: 1, ...error })));
    }
    if (worldPropertiesResult.warnings.length > 0) {
      warnings.push(...worldPropertiesResult.warnings.map(warning => ({ step: 1, ...warning })));
    }

    // Step 2: Validate abstract nodes (no coordinates)
    const nodesResult = this.validateAbstractNodes(worldConfig.nodes);
    stepDetails.nodes = nodesResult;
    stepValidation[2] = nodesResult.valid && stepValidation[1];
    if (!nodesResult.valid) {
      errors.push(...nodesResult.errors.map(error => ({ step: 2, ...error })));
    }
    if (nodesResult.warnings.length > 0) {
      warnings.push(...nodesResult.warnings.map(warning => ({ step: 2, ...warning })));
    }

    // Step 3: Validate character interactions (capabilities)
    const interactionsResult = this.validateCharacterCapabilities(worldConfig.interactions);
    stepDetails.interactions = interactionsResult;
    stepValidation[3] = interactionsResult.valid && stepValidation[2];
    if (!interactionsResult.valid) {
      errors.push(...interactionsResult.errors.map(error => ({ step: 3, ...error })));
    }
    if (interactionsResult.warnings.length > 0) {
      warnings.push(...interactionsResult.warnings.map(warning => ({ step: 3, ...warning })));
    }

    // Step 4: Validate characters with assigned capabilities
    const charactersResult = this.validateCharactersWithCapabilities(worldConfig.characters, worldConfig.interactions);
    stepDetails.characters = charactersResult;
    stepValidation[4] = charactersResult.valid && stepValidation[3];
    if (!charactersResult.valid) {
      errors.push(...charactersResult.errors.map(error => ({ step: 4, ...error })));
    }
    if (charactersResult.warnings.length > 0) {
      warnings.push(...charactersResult.warnings.map(warning => ({ step: 4, ...warning })));
    }

    // Step 5: Validate node populations (character-to-node assignments)
    const populationsResult = this.validateNodePopulations(worldConfig.nodePopulations, worldConfig.nodes, worldConfig.characters);
    stepDetails.nodePopulations = populationsResult;
    stepValidation[5] = populationsResult.valid && stepValidation[4];
    if (!populationsResult.valid) {
      errors.push(...populationsResult.errors.map(error => ({ step: 5, ...error })));
    }
    if (populationsResult.warnings.length > 0) {
      warnings.push(...populationsResult.warnings.map(warning => ({ step: 5, ...warning })));
    }

    // Step 6: Final completeness validation
    const completenessResult = this.validateCompleteness(worldConfig);
    stepDetails.completeness = completenessResult;
    stepValidation[6] = completenessResult.valid && stepValidation[5];
    if (!completenessResult.valid) {
      errors.push(...completenessResult.errors.map(error => ({ step: 6, ...error })));
    }
    if (completenessResult.warnings.length > 0) {
      warnings.push(...completenessResult.warnings.map(warning => ({ step: 6, ...warning })));
    }

    // Calculate completeness score (0-1 based on completed steps)
    const completenessScore = this.calculateCompletenessScore(stepValidation, stepDetails);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness: completenessScore,
      stepValidation,
      stepDetails,
      currentStep: this.getCurrentStep(stepValidation),
      nextRequirements: this.getNextStepRequirements(stepValidation, stepDetails)
    };
  }

  /**
   * Validates world properties for step 1 (mappless - no spatial dimensions)
   * @param {Object} worldConfig - World configuration to validate
   * @returns {Object} Validation result
   */
  static validateWorldProperties(worldConfig) {
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
   * Validates abstract nodes for step 2 (mappless - no coordinates)
   * @param {Array} nodes - Array of abstract node configurations
   * @returns {Object} Validation result
   */
  static validateAbstractNodes(nodes) {
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
   * Validates character capabilities (interactions) for step 3
   * @param {Array} interactions - Array of interaction/capability configurations
   * @returns {Object} Validation result
   */
  static validateCharacterCapabilities(interactions) {
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
   * Validates characters with assigned capabilities for step 4
   * @param {Array} characters - Array of character configurations
   * @param {Array} interactions - Array of available interactions/capabilities
   * @returns {Object} Validation result
   */
  static validateCharactersWithCapabilities(characters, interactions) {
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
   * Validates node populations (character-to-node assignments) for step 5
   * @param {Object} nodePopulations - Object mapping node IDs to character arrays
   * @param {Array} nodes - Array of available nodes
   * @param {Array} characters - Array of available characters
   * @returns {Object} Validation result
   */
  static validateNodePopulations(nodePopulations, nodes, characters) {
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
   * Validates world completeness for step 6 (final validation)
   * @param {Object} worldConfig - Complete world configuration
   * @returns {Object} Validation result
   */
  static validateCompleteness(worldConfig) {
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
   * Calculates completeness score based on step validation results
   * @param {Object} stepValidation - Step validation status
   * @param {Object} stepDetails - Detailed step validation results
   * @returns {number} Completeness score (0-1)
   */
  static calculateCompletenessScore(stepValidation, stepDetails) {
    const weights = {
      1: 0.1,  // World properties
      2: 0.2,  // Nodes
      3: 0.2,  // Interactions
      4: 0.25, // Characters
      5: 0.15, // Populations
      6: 0.1   // Final completeness
    };

    let score = 0;
    for (let step = 1; step <= 6; step++) {
      if (stepValidation[step]) {
        score += weights[step];
      }
    }

    return Math.round(score * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Determines current step based on validation status
   * @param {Object} stepValidation - Step validation status
   * @returns {number} Current step (1-6)
   */
  static getCurrentStep(stepValidation) {
    for (let step = 1; step <= 6; step++) {
      if (!stepValidation[step]) {
        return step;
      }
    }
    return 6; // All steps complete
  }

  /**
   * Gets requirements for the next step
   * @param {Object} stepValidation - Step validation status
   * @param {Object} stepDetails - Detailed step validation results
   * @returns {Object} Next step requirements
   */
  static getNextStepRequirements(stepValidation, stepDetails) {
    const currentStep = this.getCurrentStep(stepValidation);
    
    const stepRequirements = {
      1: 'Set world name, description, rules, and initial conditions',
      2: 'Create at least one abstract node with name, type, and environment properties',
      3: 'Define at least one character interaction/capability type',
      4: 'Create at least one character with assigned capabilities',
      5: 'Assign all characters to nodes through node populations',
      6: 'Final validation - ensure all components are complete and consistent'
    };

    const stepErrors = stepDetails[Object.keys(stepDetails)[currentStep - 1]]?.errors || [];

    return {
      currentStep,
      requirement: stepRequirements[currentStep],
      errors: stepErrors.slice(0, 3), // Show top 3 errors
      isComplete: currentStep > 6
    };
  }

  // Legacy method compatibility (deprecated - use six-step validation instead)
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
   * Calculates completeness score for world configuration
   * @param {Object} worldConfig - World configuration
   * @param {Object} details - Validation details
   * @returns {number} Completeness score between 0 and 1
   */
  static calculateCompleteness(worldConfig, details) {
    let score = 0;
    let maxScore = 0;

    // Dimensions (required - 20 points)
    maxScore += 20;
    if (details.dimensions && details.dimensions.valid) {
      score += 20;
    }

    // Nodes (required - 25 points)
    maxScore += 25;
    if (details.nodes && details.nodes.valid && details.nodes.count > 0) {
      score += 25;
    }

    // Characters (recommended - 20 points)
    maxScore += 20;
    if (details.characters && details.characters.count > 0) {
      score += 20;
    }

    // Rules (recommended - 10 points)
    maxScore += 10;
    if (worldConfig.rules && Object.keys(worldConfig.rules).length > 0) {
      score += 10;
    }

    // Initial conditions (recommended - 10 points)
    maxScore += 10;
    if (worldConfig.initialConditions && Object.keys(worldConfig.initialConditions).length > 0) {
      score += 10;
    }

    // Interactions (optional - 10 points)
    maxScore += 10;
    if (details.interactions && details.interactions.count > 0) {
      score += 10;
    }

    // Events (optional - 5 points)
    maxScore += 5;
    if (details.events && details.events.count > 0) {
      score += 5;
    }

    return maxScore > 0 ? score / maxScore : 0;
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