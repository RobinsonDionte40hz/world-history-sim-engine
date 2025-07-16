/**
 * WorldValidator - Comprehensive validation service for world configurations
 * Validates dimensions, nodes, characters, interactions, events and their relationships
 * Provides real-time validation feedback with detailed error messages
 */
class WorldValidator {
  /**
   * Validates a complete world configuration
   * @param {Object} worldConfig - The world configuration to validate
   * @returns {Object} Validation result with errors, warnings, and completeness score
   */
  static validate(worldConfig) {
    const errors = [];
    const warnings = [];
    const details = {};

    // Validate dimensions (required)
    const dimensionResult = this.validateDimensions(worldConfig.dimensions);
    details.dimensions = dimensionResult;
    if (!dimensionResult.valid) {
      errors.push(...dimensionResult.errors);
    }
    if (dimensionResult.warnings.length > 0) {
      warnings.push(...dimensionResult.warnings);
    }

    // Validate nodes (required)
    const nodeResult = this.validateNodes(worldConfig.nodes);
    details.nodes = nodeResult;
    if (!nodeResult.valid) {
      errors.push(...nodeResult.errors);
    }
    if (nodeResult.warnings.length > 0) {
      warnings.push(...nodeResult.warnings);
    }

    // Validate characters (optional but recommended)
    const characterResult = this.validateCharacters(worldConfig.characters);
    details.characters = characterResult;
    if (!characterResult.valid) {
      errors.push(...characterResult.errors);
    }
    if (characterResult.warnings.length > 0) {
      warnings.push(...characterResult.warnings);
    }

    // Validate interactions (optional)
    const interactionResult = this.validateInteractions(worldConfig.interactions);
    details.interactions = interactionResult;
    if (!interactionResult.valid) {
      errors.push(...interactionResult.errors);
    }
    if (interactionResult.warnings.length > 0) {
      warnings.push(...interactionResult.warnings);
    }

    // Validate events (optional)
    const eventResult = this.validateEvents(worldConfig.events);
    details.events = eventResult;
    if (!eventResult.valid) {
      errors.push(...eventResult.errors);
    }
    if (eventResult.warnings.length > 0) {
      warnings.push(...eventResult.warnings);
    }

    // Validate character-node relationships
    const relationshipResult = this.validateCharacterNodeRelationships(
      worldConfig.characters, 
      worldConfig.nodes
    );
    details.relationships = relationshipResult;
    if (!relationshipResult.valid) {
      errors.push(...relationshipResult.errors);
    }
    if (relationshipResult.warnings.length > 0) {
      warnings.push(...relationshipResult.warnings);
    }

    // Validate rules and initial conditions
    const rulesResult = this.validateRules(worldConfig.rules);
    details.rules = rulesResult;
    if (!rulesResult.valid) {
      errors.push(...rulesResult.errors);
    }
    if (rulesResult.warnings.length > 0) {
      warnings.push(...rulesResult.warnings);
    }

    const initialConditionsResult = this.validateInitialConditions(worldConfig.initialConditions);
    details.initialConditions = initialConditionsResult;
    if (!initialConditionsResult.valid) {
      errors.push(...initialConditionsResult.errors);
    }
    if (initialConditionsResult.warnings.length > 0) {
      warnings.push(...initialConditionsResult.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness: this.calculateCompleteness(worldConfig, details),
      details
    };
  }

  /**
   * Validates world dimensions
   * @param {Object} dimensions - Dimensions configuration
   * @returns {Object} Validation result
   */
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