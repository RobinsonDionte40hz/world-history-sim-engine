import SystemInteraction from './SystemInteraction.js';
import Environment from '../../../domain/value-objects/Environment.js';

/**
 * ExamineInteraction - Allows characters to examine objects, characters, or features
 * Integrates with Intelligence/Wisdom attributes for examination effectiveness
 */
class ExamineInteraction extends SystemInteraction {
  /**
   * Creates a new ExamineInteraction
   * @param {Object} params - Interaction parameters
   * @param {string} params.targetType - Type of target ('character', 'item', 'feature')
   * @param {string} params.targetId - ID of the target to examine
   * @param {number} params.range - Maximum range for examination (default: 5)
   * @param {Environment} params.environment - Current environment context
   */
  constructor({ targetType, targetId, range = 5, environment, ...baseParams }) {
    super({
      name: 'Examine',
      description: 'Examine an object, character, or feature to gather information',
      baseEnergyCost: 5, // Small energy cost for examination
      targetType,
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
    const targetType = config.targetType;
    const targetId = config.targetId;
    const range = config.range !== undefined ? config.range : 5;
    const environment = config.environment;

    this.targetType = targetType;
    this.targetId = targetId;
    this.range = range;
    this.environment = environment;
  }

  /**
   * Gets the environmental modifier for examination effectiveness
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

    // Lighting affects examination effectiveness
    if (env.getVisibilityModifier) {
      const lightingModifier = env.getVisibilityModifier();
      modifier *= lightingModifier;
    }

    // Weather conditions can affect examination
    if (env.humidity !== undefined && env.humidity > 0.8) {
      modifier *= 0.9; // High humidity reduces visibility
    }

    if (env.windStrength !== undefined && env.windStrength > 0.7) {
      modifier *= 0.95; // Strong winds can reduce examination effectiveness
    }

    return Math.max(0.1, Math.min(2.0, modifier));
  }

  /**
   * Calculates examination effectiveness based on character attributes
   * @param {Character} character - The character performing the examination
   * @param {Object} environment - The current environment (optional)
   * @returns {number} Effectiveness from 0.0 to 1.0
   */
  getExaminationEffectiveness(character, environment) {
    const intelligence = character.attributes?.intelligence || 10;
    const wisdom = character.attributes?.wisdom || 10;

    // Base effectiveness from Intelligence and Wisdom
    const baseEffectiveness = (intelligence + wisdom) / 40; // Max 20 total = 0.5

    // Apply environmental modifier
    const environmentalModifier = this.getEnvironmentalModifier(environment);

    // Target type affects difficulty
    let targetModifier = 1.0;
    switch (this.targetType) {
      case 'character':
        targetModifier = 0.8; // Characters are harder to examine
        break;
      case 'item':
        targetModifier = 1.0; // Items are standard difficulty
        break;
      case 'feature':
        targetModifier = 1.2; // Features are easier to examine
        break;
      default:
        targetModifier = 1.0;
    }

    const effectiveness = baseEffectiveness * environmentalModifier * targetModifier;
    return Math.max(0.0, Math.min(1.0, effectiveness));
  }

  /**
   * Checks if the examination can be executed
   * @param {Object} context - Execution context
   * @param {Character} context.character - The character attempting to examine
   * @param {World} context.world - The current world state
   * @returns {boolean} True if examination can be executed
   * @override
   */
  canExecute(character, worldState) {
    // Create worldState object for SystemInteraction compatibility
    const world = worldState;
    const worldStateObj = {
      getCurrentEnvironment: () => this.environment || {}
    };

    // Basic system interaction checks
    if (!super.canExecute(character, worldStateObj)) {
      return false;
    }

    // Must have a valid target
    if (!this.targetId || !this.targetType) {
      return false;
    }

    // Check if target exists and is within range
    return this._isTargetValid({ character, world }) && this._isTargetInRange({ character, world });
  }

  /**
   * Validates that the target exists and is examinable
   * @param {Object} context - Execution context
   * @returns {boolean} True if target is valid
   * @private
   */
  _isTargetValid({ character, world }) {
    switch (this.targetType) {
      case 'character':
        return this._isCharacterTargetValid(character, world);
      case 'item':
        return this._isItemTargetValid(character, world);
      case 'feature':
        return this._isFeatureTargetValid(world);
      default:
        return false;
    }
  }

  /**
   * Validates character target
   * @param {Character} character - The examining character
   * @param {World} world - The world state
   * @returns {boolean} True if character target is valid
   * @private
   */
  _isCharacterTargetValid(character, world) {
    // Can't examine yourself
    if (this.targetId === character.id) {
      return false;
    }

    // Check if target character exists in the world
    const targetCharacter = world.characters?.find(c => c.id === this.targetId);
    if (!targetCharacter) {
      return false;
    }

    // Characters can have items that cannot be seen/examined
    // This would be determined by character privacy settings or magical effects
    // For now, assume all characters are examinable
    return true;
  }

  /**
   * Validates item target
   * @param {Character} character - The examining character
   * @param {World} world - The world state
   * @returns {boolean} True if item target is valid
   * @private
   */
  _isItemTargetValid(character, world) {
    // Check character's inventory
    const characterItem = character.inventory?.find(item => item.id === this.targetId);
    if (characterItem) {
      return true;
    }

    // Check current node for items
    const currentNode = world.nodes?.find(node => node.id === character.currentNodeId);
    if (currentNode) {
      const nodeItem = currentNode.resources?.find(resource => resource.id === this.targetId);
      if (nodeItem) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validates feature target
   * @param {World} world - The world state
   * @returns {boolean} True if feature target is valid
   * @private
   */
  _isFeatureTargetValid(world) {
    // Features are typically node-level elements
    // This could be extended to check for specific features in the current node
    // For now, assume the feature exists if specified
    return true;
  }

  /**
   * Checks if the target is within examination range
   * @param {Object} context - Execution context
   * @returns {boolean} True if target is in range
   * @private
   */
  _isTargetInRange({ character, world }) {
    // For now, assume all targets in the same node are in range
    // This could be extended with more sophisticated range checking
    // based on node connections or spatial positioning
    return true;
  }

  /**
   * Executes the examination interaction
   * @param {Character} character - The character examining
   * @param {World} worldState - The current world state
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

    // Create worldState wrapper for SystemInteraction compatibility
    const worldStateWrapper = {
      getCurrentEnvironment: () => this.environment || {},
      ...worldState // Preserve other worldState properties
    };

    const baseResult = super.execute(character, worldStateWrapper);

    if (!baseResult.success) {
      return baseResult;
    }

    const effectiveness = this.getExaminationEffectiveness(character, this.environment);
    const examinationResult = this._performExamination(character, worldState, effectiveness);

    return {
      ...baseResult,
      details: {
        ...baseResult.details,
        targetType: this.targetType,
        targetId: this.targetId,
        effectiveness,
        examinationResult,
        environmentalModifier: this.getEnvironmentalModifier(this.environment)
      }
    };
  }

  /**
   * Performs the actual examination based on target type
   * @param {Character} character - The examining character
   * @param {World} worldState - The world state
   * @param {number} effectiveness - Examination effectiveness (0.0 to 1.0)
   * @returns {Object} Examination result data
   * @private
   */
  _performExamination(character, worldState, effectiveness) {
    switch (this.targetType) {
      case 'character':
        return this._examineCharacter(character, worldState, effectiveness);
      case 'item':
        return this._examineItem(character, worldState, effectiveness);
      case 'feature':
        return this._examineFeature(worldState, effectiveness);
      default:
        return { success: false, reason: 'Unknown target type' };
    }
  }

  /**
   * Examines a character target
   * @param {Character} character - The examining character
   * @param {World} world - The world state
   * @param {number} effectiveness - Examination effectiveness
   * @returns {Object} Examination result
   * @private
   */
  _examineCharacter(character, world, effectiveness) {
    const targetCharacter = world.characters?.find(c => c.id === this.targetId);
    if (!targetCharacter) {
      return { success: false, reason: 'Target character not found' };
    }

    const information = {};

    // Basic information always visible
    information.name = targetCharacter.name;
    information.appearance = this._getCharacterAppearance(targetCharacter, effectiveness);

    // Attribute-based information
    if (effectiveness > 0.3) {
      information.health = this._estimateHealth(targetCharacter, effectiveness);
      information.mood = this._estimateMood(targetCharacter, effectiveness);
    }

    if (effectiveness > 0.5) {
      information.equipment = this._getVisibleEquipment(targetCharacter, effectiveness);
    }

    if (effectiveness > 0.7) {
      information.personality = this._estimatePersonality(targetCharacter, effectiveness);
    }

    return {
      success: true,
      information,
      quality: this._getExaminationQuality(effectiveness)
    };
  }

  /**
   * Examines an item target
   * @param {Character} character - The examining character
   * @param {World} world - The world state
   * @param {number} effectiveness - Examination effectiveness
   * @returns {Object} Examination result
   * @private
   */
  _examineItem(character, world, effectiveness) {
    let targetItem = null;

    // Check character's inventory first
    targetItem = character.inventory?.find(item => item.id === this.targetId);

    // Check current node resources
    if (!targetItem) {
      const currentNode = world.nodes?.find(node => node.id === character.currentNodeId);
      targetItem = currentNode?.resources?.find(resource => resource.id === this.targetId);
    }

    if (!targetItem) {
      return { success: false, reason: 'Target item not found' };
    }

    const information = {};

    // Basic information
    information.name = targetItem.name || 'Unknown Item';
    information.type = targetItem.type || 'Unknown Type';

    // Detailed information based on effectiveness
    if (effectiveness > 0.3) {
      information.description = targetItem.description || 'No description available';
      information.condition = this._estimateItemCondition(targetItem, effectiveness);
    }

    if (effectiveness > 0.6) {
      information.properties = targetItem.properties || {};
      information.value = targetItem.value || 0;
    }

    return {
      success: true,
      information,
      quality: this._getExaminationQuality(effectiveness)
    };
  }

  /**
   * Examines a feature target
   * @param {World} world - The world state
   * @param {number} effectiveness - Examination effectiveness
   * @returns {Object} Examination result
   * @private
   */
  _examineFeature(world, effectiveness) {
    // For now, return basic feature information
    // This could be extended to examine specific node features
    const information = {
      name: `Feature ${this.targetId}`,
      type: 'environmental',
      description: 'A notable environmental feature'
    };

    if (effectiveness > 0.4) {
      information.details = 'Further examination reveals additional details about this feature.';
    }

    return {
      success: true,
      information,
      quality: this._getExaminationQuality(effectiveness)
    };
  }

  /**
   * Gets examination quality description
   * @param {number} effectiveness - Examination effectiveness
   * @returns {string} Quality description
   * @private
   */
  _getExaminationQuality(effectiveness) {
    if (effectiveness >= 0.8) return 'excellent';
    if (effectiveness >= 0.6) return 'good';
    if (effectiveness >= 0.4) return 'fair';
    if (effectiveness >= 0.2) return 'poor';
    return 'very poor';
  }

  /**
   * Helper methods for character examination
   * @private
   */
  _getCharacterAppearance(character, effectiveness) {
    // Simplified appearance estimation
    return `A ${character.age}-year-old ${character.racialTraits?.race || 'person'}`;
  }

  _estimateHealth(character, effectiveness) {
    // Simplified health estimation
    const healthPercent = character.health / 100;
    if (effectiveness > 0.7) {
      return healthPercent > 0.8 ? 'healthy' : healthPercent > 0.5 ? 'wounded' : 'severely injured';
    }
    return healthPercent > 0.5 ? 'seems fine' : 'appears injured';
  }

  _estimateMood(character, effectiveness) {
    // Simplified mood estimation
    const moodPercent = character.mood / 100;
    if (effectiveness > 0.7) {
      return moodPercent > 0.7 ? 'happy' : moodPercent > 0.4 ? 'neutral' : 'unhappy';
    }
    return moodPercent > 0.5 ? 'calm' : 'agitated';
  }

  _getVisibleEquipment(character, effectiveness) {
    // Simplified equipment visibility
    return character.inventory?.slice(0, Math.floor(effectiveness * 3)) || [];
  }

  _estimatePersonality(character, effectiveness) {
    // Simplified personality estimation
    return 'Personality traits not fully implemented';
  }

  _estimateItemCondition(item, effectiveness) {
    // Simplified item condition estimation
    return effectiveness > 0.7 ? 'good condition' : 'worn';
  }

  /**
   * Serializes the ExamineInteraction to JSON
   * @returns {Object} JSON representation
   * @override
   */
  toJSON() {
    return {
      ...super.toJSON(),
      type: 'ExamineInteraction',
      targetType: this.targetType,
      targetId: this.targetId,
      range: this.range,
      environment: this.environment ? this.environment.toJSON() : null
    };
  }

  /**
   * Creates an ExamineInteraction from JSON data
   * @param {Object} data - JSON data
   * @returns {ExamineInteraction} New instance
   * @static
   */
  static fromJSON(data) {
    // Reconstruct environment if present
    let environment = null;
    if (data.environment) {
      environment = Environment.fromJSON(data.environment);
    }

    return new ExamineInteraction({
      ...data,
      targetType: data.targetType,
      targetId: data.targetId,
      range: data.range,
      environment
    });
  }
}

export default ExamineInteraction;
