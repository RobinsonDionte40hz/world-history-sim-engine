// src/domain/entities/interactions/InteractionBase.js

/**
 * Abstract base class for all interactions in the hierarchical interaction system.
 * Provides core interface methods that all interaction types must implement.
 * This class establishes the foundation for both system and content interactions.
 */
export default class InteractionBase {
  /**
   * Creates a new interaction base instance
   * @param {Object} config - Configuration object
   * @param {string} config.id - Unique identifier for the interaction
   * @param {string} config.name - Display name of the interaction
   * @param {string} config.description - Description of what the interaction does
   * @param {string} config.type - Type identifier for the interaction
   */
  constructor(config = {}) {
    if (this.constructor === InteractionBase) {
      throw new Error('InteractionBase is an abstract class and cannot be instantiated directly');
    }

    // Handle null or undefined config
    config = config || {};

    this.id = config.id || this.generateId();
    this.name = config.name || 'Unnamed Interaction';
    this.description = config.description || '';
    this.type = config.type || 'unknown';
  }

  /**
   * Generates a unique ID for the interaction
   * @returns {string} Unique identifier
   */
  generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for test environments
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Determines if the interaction can be executed by the given character in the current world state
   * @param {Object} character - The character attempting the interaction
   * @param {Object} worldState - Current state of the world
   * @returns {boolean} True if the interaction can be executed
   * @throws {Error} If not implemented by subclass
   */
  canExecute(character, worldState) {
    throw new Error('canExecute method must be implemented by subclass');
  }

  /**
   * Executes the interaction for the given character in the current world state
   * @param {Object} character - The character executing the interaction
   * @param {Object} worldState - Current state of the world
   * @returns {Object} Result of the interaction execution
   * @throws {Error} If not implemented by subclass
   */
  execute(character, worldState) {
    throw new Error('execute method must be implemented by subclass');
  }

  /**
   * Calculates the energy cost for this interaction based on character and environment
   * @param {Object} character - The character executing the interaction
   * @param {Object} environment - The current environment
   * @returns {number} Energy cost of the interaction
   * @throws {Error} If not implemented by subclass
   */
  getEnergyCost(character, environment) {
    throw new Error('getEnergyCost method must be implemented by subclass');
  }

  /**
   * Serializes the interaction to a plain object for storage
   * @returns {Object} Serialized interaction data
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type
    };
  }

  /**
   * Creates an interaction instance from serialized data
   * @param {Object} data - Serialized interaction data
   * @returns {InteractionBase} New interaction instance
   */
  static fromJSON(data) {
    return new this(data);
  }
}
