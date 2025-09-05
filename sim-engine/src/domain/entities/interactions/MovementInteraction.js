import SystemInteraction from './SystemInteraction.js';

/**
 * MovementInteraction - Handles character movement between nodes
 * This is a stub implementation for future NavigationService integration
 */
class MovementInteraction extends SystemInteraction {
  /**
   * Creates a new MovementInteraction
   * @param {Object} params - Interaction parameters
   * @param {string} params.targetNodeId - ID of the target node to move to
   * @param {string} params.movementType - Type of movement ('walk', 'run', 'sneak')
   * @param {Environment} params.environment - Current environment context
   */
  constructor({ targetNodeId, movementType = 'walk', environment, ...baseParams }) {
    super({
      name: 'Move',
      description: 'Move to a different location',
      baseEnergyCost: 10, // Base cost, will be modified by distance and terrain
      targetNodeId,
      movementType,
      environment,
      ...baseParams
    });

    // Parameters will be handled in _initializeSubclassProperties
  }

  /**
   * Initialize subclass-specific properties before freezing
   * @param {Object} config - Configuration object
   * @override
   */
  _initializeSubclassProperties(config) {
    // Extract parameters from config (passed from constructor)
    const targetNodeId = config.targetNodeId;
    const movementType = config.movementType || 'walk';
    const environment = config.environment;

    this.targetNodeId = targetNodeId;
    this.movementType = movementType;
    this.environment = environment;
  }

  /**
   * Gets the environmental modifier for movement cost
   * @param {Object} environment - The current environment (optional, uses this.environment if not provided)
   * @returns {number} Modifier from 0.5 to 3.0 (1.0 = normal terrain)
   * @override
   */
  getEnvironmentalModifier(environment) {
    // Use provided environment or fall back to this.environment
    const env = environment || this.environment;

    if (!env) {
      return 1.0; // Default modifier if no environment
    }

    let modifier = 1.0;

    // Use environment's movement modifier if available
    if (env.getMovementModifier) {
      modifier *= env.getMovementModifier();
    }

    // Movement type affects energy cost
    switch (this.movementType) {
      case 'run':
        modifier *= 1.5; // Running costs more energy
        break;
      case 'sneak':
        modifier *= 1.2; // Sneaking costs slightly more energy
        break;
      case 'walk':
      default:
        // Normal walking, no additional modifier
        break;
    }

    // Terrain-specific modifiers (placeholder for future implementation)
    // These would be based on actual terrain data from the target node
    // For now, assume average terrain

    return Math.max(0.5, Math.min(3.0, modifier));
  }

  /**
   * Calculates movement distance/energy cost based on path
   * @param {Character} character - The character moving
   * @param {World} world - The world state
   * @returns {number} Distance multiplier (1.0 = adjacent node)
   */
  getMovementDistance(character, world) {
    // Placeholder for NavigationService integration
    // For now, assume movement to adjacent nodes costs 1.0
    // Future implementation would calculate actual path distance

    const currentNode = world.nodes?.find(node => node.id === character.currentNodeId);
    const targetNode = world.nodes?.find(node => node.id === this.targetNodeId);

    if (!currentNode || !targetNode) {
      return 1.0; // Default distance
    }

    // Simple distance calculation (placeholder)
    // In a real implementation, this would use NavigationService
    const distance = Math.abs(currentNode.x - targetNode.x) + Math.abs(currentNode.y - targetNode.y);

    // Normalize distance (adjacent nodes = 1.0, farther = higher)
    return Math.max(1.0, distance);
  }

  /**
   * Calculates the total energy cost for movement
   * @param {Object} character - The character executing the interaction
   * @param {Object} environment - The current environment
   * @param {World} world - The world state
   * @returns {number} Total energy cost
   * @override
   */
  getEnergyCost(character, environment, world) {
    const baseCost = this.baseEnergyCost;
    const environmentalModifier = this.getEnvironmentalModifier(environment);
    const distanceMultiplier = world ? this.getMovementDistance(character, world) : 1.0;

    // Calculate total cost: base * environmental * distance
    return Math.max(0, Math.round(baseCost * environmentalModifier * distanceMultiplier));
  }

  /**
   * Checks if the movement interaction can be executed
   * @param {Object} character - The character attempting to move
   * @param {Object} worldState - Current world state
   * @returns {boolean} True if movement can be executed
   * @override
   */
  canExecute(character, worldState) {
    // Basic system interaction checks
    if (!super.canExecute(character, worldState)) {
      return false;
    }

    // Must have a valid target node
    if (!this.targetNodeId) {
      return false;
    }

    // Check if target node exists
    const targetNode = worldState.nodes?.find(node => node.id === this.targetNodeId);
    if (!targetNode) {
      return false;
    }

    // Can't move to the same node
    if (this.targetNodeId === character.currentNodeId) {
      return false;
    }

    // Placeholder for path validation
    // Future: Use NavigationService to check if path exists
    return this._isPathValid(character, worldState);
  }

  /**
   * Validates that a path exists to the target node
   * @param {Object} character - The character
   * @param {Object} worldState - The world state
   * @returns {boolean} True if path is valid
   * @private
   */
  _isPathValid(character, worldState) {
    // Placeholder for NavigationService integration
    // For now, assume all nodes are connected (simple grid movement)
    // Future implementation would use NavigationService for pathfinding

    const currentNode = worldState.nodes?.find(node => node.id === character.currentNodeId);
    const targetNode = worldState.nodes?.find(node => node.id === this.targetNodeId);

    if (!currentNode || !targetNode) {
      return false;
    }

    // Simple adjacency check (placeholder)
    const dx = Math.abs(currentNode.x - targetNode.x);
    const dy = Math.abs(currentNode.y - targetNode.y);

    // Allow movement to adjacent nodes (including diagonals for now)
    return dx <= 1 && dy <= 1;
  }

  /**
   * Executes the movement interaction
   * @param {Object} character - The character moving
   * @param {Object} worldState - The current world state
   * @returns {Object} Execution result
   * @override
   */
  execute(character, worldState) {
    // Check if execution is allowed before proceeding
    if (!this.canExecute(character, worldState)) {
      return {
        success: false,
        interaction: this,
        energyConsumed: 0,
        logs: [`Cannot execute ${this.name}: execution conditions not met`]
      };
    }

    const energyCost = this.getEnergyCost(character, this.environment, worldState);
    const baseResult = super.execute(character, worldState);

    if (!baseResult.success) {
      return baseResult;
    }

    // Update character's current node
    const previousNodeId = character.currentNodeId;
    character.currentNodeId = this.targetNodeId;

    // Placeholder for NavigationService path execution
    // Future: Use NavigationService to execute the actual movement path

    return {
      ...baseResult,
      energyConsumed: energyCost,
      details: {
        ...baseResult.details,
        targetNodeId: this.targetNodeId,
        previousNodeId,
        movementType: this.movementType,
        distanceMultiplier: this.getMovementDistance(character, worldState),
        environmentalModifier: this.getEnvironmentalModifier(this.environment)
      }
    };
  }

  /**
   * Serializes the MovementInteraction to JSON
   * @returns {Object} JSON representation
   * @override
   */
  toJSON() {
    return {
      ...super.toJSON(),
      type: 'MovementInteraction',
      targetNodeId: this.targetNodeId,
      movementType: this.movementType,
      environment: this.environment ? this.environment.toJSON() : null
    };
  }

  /**
   * Creates a MovementInteraction from JSON data
   * @param {Object} data - JSON data
   * @returns {MovementInteraction} New instance
   * @static
   */
  static fromJSON(data) {
    // Reconstruct environment if present
    let environment = null;
    if (data.environment) {
      // Use import() for dynamic loading in test environment
      try {
        const Environment = require('../../domain/value-objects/Environment.js').default;
        environment = Environment.fromJSON(data.environment);
      } catch (error) {
        // In test environment, create a mock environment
        environment = {
          getMovementModifier: () => 1.0,
          toJSON: () => data.environment
        };
      }
    }

    return new MovementInteraction({
      ...data,
      targetNodeId: data.targetNodeId,
      movementType: data.movementType,
      environment
    });
  }
}

export default MovementInteraction;
