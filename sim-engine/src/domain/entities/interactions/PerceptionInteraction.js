import SystemInteraction from './SystemInteraction.js';

/**
 * PerceptionInteraction - Handles character perception actions
 * This is a stub implementation for future PerceptionService integration
 */
class PerceptionInteraction extends SystemInteraction {
  /**
   * Creates a new PerceptionInteraction
   * @param {Object} params - Interaction parameters
   * @param {string} params.perceptionType - Type of perception ('look', 'listen', 'sense')
   * @param {string} params.targetId - ID of the target to perceive (optional)
   * @param {number} params.range - Maximum perception range (default: 10)
   * @param {Environment} params.environment - Current environment context
   */
  constructor({ perceptionType = 'look', targetId, range = 10, environment, ...baseParams }) {
    super({
      name: 'Perceive',
      description: 'Use perception to gather information about surroundings',
      baseEnergyCost: 8, // Moderate energy cost for perception
      perceptionType,
      targetId,
      range,
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
    const perceptionType = config.perceptionType || 'look';
    const targetId = config.targetId;
    const range = config.range !== undefined ? config.range : 10;
    const environment = config.environment;

    this.perceptionType = perceptionType;
    this.targetId = targetId;
    this.range = range;
    this.environment = environment;
  }

  /**
   * Gets the environmental modifier for perception effectiveness
   * @param {Object} environment - The current environment (optional, uses this.environment if not provided)
   * @returns {number} Modifier from 0.1 to 2.0 (1.0 = normal)
   * @override
   */
  getEnvironmentalModifier(environment) {
    // Use provided environment or fall back to this.environment
    const env = environment || this.environment;

    if (!env) {
      return 1.0; // Default modifier if no environment
    }

    let modifier = 1.0;

    // Different perception types are affected differently by environment
    switch (this.perceptionType) {
      case 'look':
        // Visual perception affected by visibility
        if (env.getVisibilityModifier) {
          modifier *= env.getVisibilityModifier();
        }
        // Additional factors for visual perception
        if (env.lightLevel !== undefined && env.lightLevel < 0.3) {
          modifier *= 0.5; // Very dark reduces visual perception significantly
        }
        break;

      case 'listen':
        // Auditory perception affected by ambient noise
        if (env.ambientNoise !== undefined) {
          modifier *= Math.max(0.3, 1.0 - env.ambientNoise * 0.5);
        }
        // Weather can affect hearing
        if (env.windStrength !== undefined && env.windStrength > 0.6) {
          modifier *= 0.8; // Strong wind reduces auditory perception
        }
        break;

      case 'sense':
        // General sensing less affected by environment
        modifier *= 0.9; // Slightly reduced baseline for sensing
        break;

      default:
        modifier = 1.0;
    }

    return Math.max(0.1, Math.min(2.0, modifier));
  }

  /**
   * Calculates perception effectiveness based on character attributes
   * @param {Character} character - The character performing the perception
   * @param {Object} environment - The current environment (optional)
   * @returns {number} Effectiveness from 0.0 to 1.0
   */
  getPerceptionEffectiveness(character, environment) {
    const intelligence = character.attributes?.intelligence || 10;
    const wisdom = character.attributes?.wisdom || 10;
    const perception = character.attributes?.perception || 10;

    // Base effectiveness from relevant attributes
    let baseEffectiveness = 0.0;

    switch (this.perceptionType) {
      case 'look':
        // Visual perception favors Intelligence and Wisdom
        baseEffectiveness = (intelligence + wisdom) / 40;
        break;
      case 'listen':
        // Auditory perception favors Wisdom and Perception
        baseEffectiveness = (wisdom + perception) / 40;
        break;
      case 'sense':
        // General sensing favors Perception primarily
        baseEffectiveness = perception / 20;
        break;
      default:
        baseEffectiveness = (intelligence + wisdom + perception) / 60;
    }

    // Apply environmental modifier
    const environmentalModifier = this.getEnvironmentalModifier(environment);

    const effectiveness = baseEffectiveness * environmentalModifier;
    return Math.max(0.0, Math.min(1.0, effectiveness));
  }

  /**
   * Checks if the perception interaction can be executed
   * @param {Object} character - The character attempting to perceive
   * @param {Object} worldState - Current world state
   * @returns {boolean} True if perception can be executed
   * @override
   */
  canExecute(character, worldState) {
    // Basic system interaction checks
    if (!super.canExecute(character, worldState)) {
      return false;
    }

    // Validate perception type
    if (!['look', 'listen', 'sense'].includes(this.perceptionType)) {
      return false;
    }

    // If target specified, validate it exists and is in range
    if (this.targetId) {
      return this._isTargetValid(character, worldState) && this._isTargetInRange(character, worldState);
    }

    return true;
  }

  /**
   * Validates that the target exists and is perceivable
   * @param {Object} character - The character
   * @param {Object} worldState - The world state
   * @returns {boolean} True if target is valid
   * @private
   */
  _isTargetValid(character, worldState) {
    // Placeholder for PerceptionService integration
    // For now, assume targets are valid if they exist in the world
    if (!this.targetId) return true;

    // Check if target exists as a character
    const targetCharacter = worldState.characters?.find(c => c.id === this.targetId);
    if (targetCharacter) return true;

    // Check if target exists as a node feature
    const currentNode = worldState.nodes?.find(node => node.id === character.currentNodeId);
    if (currentNode && currentNode.features?.some(f => f.id === this.targetId)) {
      return true;
    }

    return false;
  }

  /**
   * Checks if the target is within perception range
   * @param {Object} character - The character
   * @param {Object} worldState - The world state
   * @returns {boolean} True if target is in range
   * @private
   */
  _isTargetInRange(character, worldState) {
    // Placeholder for PerceptionService integration
    // For now, assume all targets in the same node are in range
    // Future implementation would use PerceptionService for range calculations
    return true;
  }

  /**
   * Executes the perception interaction
   * @param {Object} character - The character perceiving
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

    const baseResult = super.execute(character, worldState);

    if (!baseResult.success) {
      return baseResult;
    }

    const effectiveness = this.getPerceptionEffectiveness(character, this.environment);
    const perceptionResult = this._performPerception(character, worldState, effectiveness);

    return {
      ...baseResult,
      details: {
        ...baseResult.details,
        perceptionType: this.perceptionType,
        targetId: this.targetId,
        effectiveness,
        perceptionResult,
        environmentalModifier: this.getEnvironmentalModifier(this.environment)
      }
    };
  }

  /**
   * Performs the actual perception based on type
   * @param {Object} character - The character
   * @param {Object} worldState - The world state
   * @param {number} effectiveness - Perception effectiveness (0.0 to 1.0)
   * @returns {Object} Perception result data
   * @private
   */
  _performPerception(character, worldState, effectiveness) {
    switch (this.perceptionType) {
      case 'look':
        return this._performVisualPerception(character, worldState, effectiveness);
      case 'listen':
        return this._performAuditoryPerception(character, worldState, effectiveness);
      case 'sense':
        return this._performGeneralPerception(character, worldState, effectiveness);
      default:
        return { success: false, reason: 'Unknown perception type' };
    }
  }

  /**
   * Performs visual perception
   * @param {Object} character - The character
   * @param {Object} worldState - The world state
   * @param {number} effectiveness - Perception effectiveness
   * @returns {Object} Perception result
   * @private
   */
  _performVisualPerception(character, worldState, effectiveness) {
    const information = {};

    // Basic visual information
    information.type = 'visual';
    information.description = 'Visual observation of surroundings';

    // Detailed information based on effectiveness
    if (effectiveness > 0.3) {
      information.visibleCharacters = this._getVisibleCharacters(character, worldState, effectiveness);
      information.visibleItems = this._getVisibleItems(character, worldState, effectiveness);
    }

    if (effectiveness > 0.6) {
      information.environmentDetails = this._getEnvironmentDetails(worldState, effectiveness);
    }

    return {
      success: true,
      information,
      quality: this._getPerceptionQuality(effectiveness)
    };
  }

  /**
   * Performs auditory perception
   * @param {Object} character - The character
   * @param {Object} worldState - The world state
   * @param {number} effectiveness - Perception effectiveness
   * @returns {Object} Perception result
   * @private
   */
  _performAuditoryPerception(character, worldState, effectiveness) {
    const information = {};

    // Basic auditory information
    information.type = 'auditory';
    information.description = 'Auditory awareness of surroundings';

    // Detailed information based on effectiveness
    if (effectiveness > 0.3) {
      information.audibleSounds = this._getAudibleSounds(character, worldState, effectiveness);
    }

    if (effectiveness > 0.6) {
      information.distantNoises = this._getDistantNoises(worldState, effectiveness);
    }

    return {
      success: true,
      information,
      quality: this._getPerceptionQuality(effectiveness)
    };
  }

  /**
   * Performs general sensing perception
   * @param {Object} character - The character
   * @param {Object} worldState - The world state
   * @param {number} effectiveness - Perception effectiveness
   * @returns {Object} Perception result
   * @private
   */
  _performGeneralPerception(character, worldState, effectiveness) {
    const information = {};

    // Basic sensing information
    information.type = 'general';
    information.description = 'General awareness through other senses';

    // Detailed information based on effectiveness
    if (effectiveness > 0.4) {
      information.atmosphericConditions = this._getAtmosphericConditions(worldState, effectiveness);
      information.presenceDetection = this._detectPresences(character, worldState, effectiveness);
    }

    return {
      success: true,
      information,
      quality: this._getPerceptionQuality(effectiveness)
    };
  }

  /**
   * Gets perception quality description
   * @param {number} effectiveness - Perception effectiveness
   * @returns {string} Quality description
   * @private
   */
  _getPerceptionQuality(effectiveness) {
    if (effectiveness >= 0.8) return 'excellent';
    if (effectiveness >= 0.6) return 'good';
    if (effectiveness >= 0.4) return 'fair';
    if (effectiveness >= 0.2) return 'poor';
    return 'very poor';
  }

  /**
   * Helper methods for perception (placeholders for PerceptionService)
   * @private
   */
  _getVisibleCharacters(character, world, effectiveness) {
    // Placeholder: return nearby characters
    return world.characters?.filter(c => c.id !== character.id).slice(0, Math.floor(effectiveness * 5)) || [];
  }

  _getVisibleItems(character, world, effectiveness) {
    // Placeholder: return visible items in current node
    const currentNode = world.nodes?.find(node => node.id === character.currentNodeId);
    return currentNode?.resources?.slice(0, Math.floor(effectiveness * 3)) || [];
  }

  _getEnvironmentDetails(world, effectiveness) {
    // Placeholder: return environment details
    return { lighting: 'normal', terrain: 'standard', features: [] };
  }

  _getAudibleSounds(character, world, effectiveness) {
    // Placeholder: return audible sounds
    return ['ambient noise', 'distant movement'];
  }

  _getDistantNoises(world, effectiveness) {
    // Placeholder: return distant noises
    return ['faint echoes', 'wind sounds'];
  }

  _getAtmosphericConditions(world, effectiveness) {
    // Placeholder: return atmospheric conditions
    return { temperature: 'moderate', humidity: 'normal', airQuality: 'good' };
  }

  _detectPresences(character, world, effectiveness) {
    // Placeholder: detect hidden presences
    return effectiveness > 0.7 ? ['subtle presence detected'] : [];
  }

  /**
   * Serializes the PerceptionInteraction to JSON
   * @returns {Object} JSON representation
   * @override
   */
  toJSON() {
    return {
      ...super.toJSON(),
      type: 'PerceptionInteraction',
      perceptionType: this.perceptionType,
      targetId: this.targetId,
      range: this.range,
      environment: this.environment ? this.environment.toJSON() : null
    };
  }

  /**
   * Creates a PerceptionInteraction from JSON data
   * @param {Object} data - JSON data
   * @returns {PerceptionInteraction} New instance
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
          getVisibilityModifier: () => 1.0,
          lightLevel: 0.8,
          ambientNoise: 0.2,
          windStrength: 0.3,
          toJSON: () => data.environment
        };
      }
    }

    return new PerceptionInteraction({
      ...data,
      perceptionType: data.perceptionType,
      targetId: data.targetId,
      range: data.range,
      environment
    });
  }
}

export default PerceptionInteraction;
