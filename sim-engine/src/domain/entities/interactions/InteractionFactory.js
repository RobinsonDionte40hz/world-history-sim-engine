import InteractionBase from './InteractionBase.js';
import SystemInteraction from './SystemInteraction.js';
import ContentInteraction from './ContentInteraction.js';
import WaitInteraction from './WaitInteraction.js';
import RestInteraction from './RestInteraction.js';
import ExamineInteraction from './ExamineInteraction.js';
import MovementInteraction from './MovementInteraction.js';
import PerceptionInteraction from './PerceptionInteraction.js';

/**
 * InteractionFactory - Factory class for creating interaction instances
 *
 * Provides centralized creation methods for all interaction types,
 * with validation, error handling, and type-based instantiation.
 */
class InteractionFactory {
  /**
   * Creates an interaction instance based on the specified type
   * @param {string} type - The type of interaction to create
   * @param {Object} config - Configuration object for the interaction
   * @returns {InteractionBase} The created interaction instance
   * @throws {Error} If the interaction type is unknown or invalid
   */
  static create(type, config = {}) {
    if (!type || typeof type !== 'string') {
      throw new Error('Interaction type must be a non-empty string');
    }

    const normalizedType = type.toLowerCase().trim();

    switch (normalizedType) {
      // System interactions
      case 'wait':
      case 'waitinteraction':
        return new WaitInteraction(config);

      case 'rest':
      case 'restinteraction':
        return new RestInteraction(config);

      case 'examine':
      case 'examineinteraction':
        return new ExamineInteraction(config);

      case 'movement':
      case 'move':
      case 'movementinteraction':
        return new MovementInteraction(config);

      case 'perception':
      case 'perceive':
      case 'perceptioninteraction':
        return new PerceptionInteraction(config);

      // Content interactions - handle custom types
      case 'content':
      case 'contentinteraction':
        return new ContentInteraction(config);

      // Custom interaction types that map to ContentInteraction
      case 'social':
      case 'socialinteraction':
        return new ContentInteraction({ ...config, type: 'social' });

      case 'observational':
      case 'observationalinteraction':
        return new ContentInteraction({ ...config, type: 'observational' });

      case 'administrative':
      case 'administrativeinteraction':
        return new ContentInteraction({ ...config, type: 'administrative' });

      case 'economic':
      case 'economicinteraction':
        return new ContentInteraction({ ...config, type: 'economic' });

      case 'labor':
      case 'laborinteraction':
        return new ContentInteraction({ ...config, type: 'labor' });

      case 'planning':
      case 'planninginteraction':
        return new ContentInteraction({ ...config, type: 'planning' });

      case 'innovation':
      case 'innovationinteraction':
        return new ContentInteraction({ ...config, type: 'innovation' });

      case 'creative':
      case 'creativeinteraction':
        return new ContentInteraction({ ...config, type: 'creative' });

      case 'analytical':
      case 'analyticalinteraction':
        return new ContentInteraction({ ...config, type: 'analytical' });

      // Base classes (for testing or advanced usage)
      case 'system':
      case 'systeminteraction':
        return new SystemInteraction(config);

      case 'base':
      case 'interactionbase':
        return new InteractionBase(config);

      default:
        throw new Error(`Unknown interaction type: ${type}. Supported types: wait, rest, examine, movement, perception, content, social, observational, administrative, economic, labor, planning, innovation, creative, analytical, system, base`);
    }
  }

  /**
   * Creates a WaitInteraction with convenience parameters
   * @param {Object} config - Configuration for the WaitInteraction
   * @returns {WaitInteraction} The created WaitInteraction instance
   */
  static createWait(config = {}) {
    return new WaitInteraction(config);
  }

  /**
   * Creates a RestInteraction with convenience parameters
   * @param {Object} config - Configuration for the RestInteraction
   * @returns {RestInteraction} The created RestInteraction instance
   */
  static createRest(config = {}) {
    return new RestInteraction(config);
  }

  /**
   * Creates an ExamineInteraction with convenience parameters
   * @param {string} targetType - Type of target ('character', 'item', 'feature')
   * @param {string} targetId - ID of the target to examine
   * @param {Object} config - Additional configuration
   * @returns {ExamineInteraction} The created ExamineInteraction instance
   */
  static createExamine(targetType, targetId, config = {}) {
    return new ExamineInteraction({
      targetType,
      targetId,
      ...config
    });
  }

  /**
   * Creates a MovementInteraction with convenience parameters
   * @param {string} targetNodeId - ID of the target node to move to
   * @param {string} movementType - Type of movement ('walk', 'run', 'sneak')
   * @param {Object} config - Additional configuration
   * @returns {MovementInteraction} The created MovementInteraction instance
   */
  static createMovement(targetNodeId, movementType = 'walk', config = {}) {
    return new MovementInteraction({
      targetNodeId,
      movementType,
      ...config
    });
  }

  /**
   * Creates a PerceptionInteraction with convenience parameters
   * @param {string} perceptionType - Type of perception ('look', 'listen', 'sense')
   * @param {string} targetId - Optional ID of the target to perceive
   * @param {Object} config - Additional configuration
   * @returns {PerceptionInteraction} The created PerceptionInteraction instance
   */
  static createPerception(perceptionType = 'look', targetId, config = {}) {
    const perceptionConfig = { perceptionType, ...config };
    if (targetId) {
      perceptionConfig.targetId = targetId;
    }
    return new PerceptionInteraction(perceptionConfig);
  }

  /**
   * Creates a ContentInteraction with convenience parameters
   * @param {Object} config - Configuration for the ContentInteraction
   * @returns {ContentInteraction} The created ContentInteraction instance
   */
  static createContent(config = {}) {
    return new ContentInteraction(config);
  }

  /**
   * Checks if a given type is a valid interaction type
   * @param {string} type - The type to validate
   * @returns {boolean} True if the type is valid
   */
  static isValidType(type) {
    if (!type || typeof type !== 'string') {
      return false;
    }

    const normalizedType = type.toLowerCase().trim();

    return [
      'wait', 'waitinteraction',
      'rest', 'restinteraction',
      'examine', 'examineinteraction',
      'movement', 'move', 'movementinteraction',
      'perception', 'perceive', 'perceptioninteraction',
      'content', 'contentinteraction',
      'social', 'socialinteraction',
      'observational', 'observationalinteraction',
      'administrative', 'administrativeinteraction',
      'economic', 'economicinteraction',
      'labor', 'laborinteraction',
      'planning', 'planninginteraction',
      'innovation', 'innovationinteraction',
      'creative', 'creativeinteraction',
      'analytical', 'analyticalinteraction',
      'system', 'systeminteraction',
      'base', 'interactionbase'
    ].includes(normalizedType);
  }

  /**
   * Gets a list of all supported interaction types
   * @returns {string[]} Array of supported type names
   */
  static getSupportedTypes() {
    return [
      'wait', 'rest', 'examine', 'movement', 'perception', 'content',
      'social', 'observational', 'administrative', 'economic', 'labor',
      'planning', 'innovation', 'creative', 'analytical',
      'system', 'base'
    ];
  }

  /**
   * Gets a list of system interaction types
   * @returns {string[]} Array of system interaction type names
   */
  static getSystemTypes() {
    return ['wait', 'rest', 'examine', 'movement', 'perception'];
  }

  /**
   * Gets a list of content interaction types
   * @returns {string[]} Array of content interaction type names
   */
  static getContentTypes() {
    return ['content'];
  }

  /**
   * Determines if a type represents a system interaction
   * @param {string} type - The type to check
   * @returns {boolean} True if the type is a system interaction
   */
  static isSystemType(type) {
    if (!type || typeof type !== 'string') {
      return false;
    }
    return this.getSystemTypes().includes(type.toLowerCase().trim());
  }

  /**
   * Determines if a type represents a content interaction
   * @param {string} type - The type to check
   * @returns {boolean} True if the type is a content interaction
   */
  static isContentType(type) {
    if (!type || typeof type !== 'string') {
      return false;
    }
    return this.getContentTypes().includes(type.toLowerCase().trim());
  }

  /**
   * Creates an interaction from a JSON object
   * @param {Object} json - JSON representation of an interaction
   * @returns {InteractionBase} The deserialized interaction instance
   * @throws {Error} If the JSON is invalid or type is unknown
   */
  static fromJSON(json) {
    if (!json || typeof json !== 'object') {
      throw new Error('Invalid JSON: must be an object');
    }

    if (!json.type) {
      throw new Error('Invalid JSON: missing type property');
    }

    // Use the appropriate class's fromJSON method
    const type = json.type.toLowerCase();

    switch (type) {
      case 'waitinteraction':
      case 'wait':
        return WaitInteraction.fromJSON(json);
      case 'restinteraction':
      case 'rest':
        return RestInteraction.fromJSON(json);
      case 'examineinteraction':
      case 'examine':
        return ExamineInteraction.fromJSON(json);
      case 'movementinteraction':
      case 'movement':
      case 'move':
        return MovementInteraction.fromJSON(json);
      case 'perceptioninteraction':
      case 'perception':
      case 'perceive':
        return PerceptionInteraction.fromJSON(json);
      case 'contentinteraction':
      case 'content':
        return ContentInteraction.fromJSON(json);
      // Custom interaction types that map to ContentInteraction
      case 'social':
      case 'socialinteraction':
        return ContentInteraction.fromJSON(json);
      case 'observational':
      case 'observationalinteraction':
        return ContentInteraction.fromJSON(json);
      case 'administrative':
      case 'administrativeinteraction':
        return ContentInteraction.fromJSON(json);
      case 'economic':
      case 'economicinteraction':
        return ContentInteraction.fromJSON(json);
      case 'labor':
      case 'laborinteraction':
        return ContentInteraction.fromJSON(json);
      case 'planning':
      case 'planninginteraction':
        return ContentInteraction.fromJSON(json);
      case 'innovation':
      case 'innovationinteraction':
        return ContentInteraction.fromJSON(json);
      case 'creative':
      case 'creativeinteraction':
        return ContentInteraction.fromJSON(json);
      case 'analytical':
      case 'analyticalinteraction':
        return ContentInteraction.fromJSON(json);
      case 'systeminteraction':
      case 'system':
        return SystemInteraction.fromJSON(json);
      case 'interactionbase':
      case 'base':
        return InteractionBase.fromJSON(json);
      default:
        throw new Error(`Unknown interaction type in JSON: ${json.type}. Supported types: wait, rest, examine, movement, perception, content, social, observational, administrative, economic, labor, planning, innovation, creative, analytical, system, base`);
    }
  }

  /**
   * Creates multiple interactions from an array of configurations
   * @param {Array} configs - Array of {type, config} objects
   * @returns {InteractionBase[]} Array of created interaction instances
   */
  static createMultiple(configs) {
    if (!Array.isArray(configs)) {
      throw new Error('Configs must be an array');
    }

    return configs.map(({ type, config = {} }) => {
      if (!type) {
        throw new Error('Each config must have a type property');
      }
      return this.create(type, config);
    });
  }

  /**
   * Creates multiple interactions from an array of JSON objects
   * @param {Array} jsonArray - Array of JSON objects
   * @returns {InteractionBase[]} Array of deserialized interaction instances
   */
  static fromJSONArray(jsonArray) {
    if (!Array.isArray(jsonArray)) {
      throw new Error('JSON array must be an array');
    }

    return jsonArray.map(json => this.fromJSON(json));
  }
}

export default InteractionFactory;
