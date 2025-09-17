// src/domain/entities/interactions/SystemInteraction.js

import InteractionBase from './InteractionBase.js';

/**
 * SystemInteraction - Base class for system-level interactions
 *
 * System interactions are core engine behaviors that are always available
 * and follow strict rules. They are immutable once instantiated and integrate
 * with the Environment system for realistic environmental effects.
 */
class SystemInteraction extends InteractionBase {
  /**
   * Creates a new system interaction instance
   * @param {Object} config - Configuration object
   * @param {string} config.id - Unique identifier for the interaction
   * @param {string} config.name - Display name of the interaction
   * @param {string} config.description - Description of what the interaction does
   * @param {string} config.type - Type identifier for the interaction
   * @param {string} config.priority - Priority level ('critical', 'high', 'normal', 'low')
   * @param {number} config.baseEnergyCost - Base energy cost before environmental modifiers
   */
  constructor(config = {}) {
    // Set the type for system interactions
    const systemConfig = { ...config, type: 'system' };
    super(systemConfig);

    this.isSystemInteraction = true;
    this.priority = config.priority || 'normal';
    this.baseEnergyCost = config.baseEnergyCost || 0;

    // Allow subclasses to add properties before freezing
    this._initializeSubclassProperties(config);

    // Make the interaction immutable after creation
    Object.freeze(this);
  }

  /**
   * Hook for subclasses to initialize their own properties before freezing
   * @param {Object} config - Configuration object
   */
  _initializeSubclassProperties(config) {
    // Default implementation does nothing
    // Subclasses can override this to add their own properties
  }

  /**
   * Gets the environmental modifier for this interaction
   * @param {Object} environment - The current environment
   * @returns {number} Modifier value (typically 0.5 to 2.0)
   */
  getEnvironmentalModifier(environment) {
    // Base implementation - subclasses should override for specific environmental effects
    return 1.0;
  }

  /**
   * Calculates the total energy cost including environmental modifiers
   * @param {Object} character - The character executing the interaction
   * @param {Object} environment - The current environment
   * @returns {number} Total energy cost
   */
  getEnergyCost(character, environment) {
    const baseCost = this.baseEnergyCost;
    const environmentalModifier = this.getEnvironmentalModifier(environment);

    // Apply environmental modifier to base cost
    return Math.max(0, Math.round(baseCost * environmentalModifier));
  }

  /**
   * Determines if the interaction can be executed
   * @param {Object} character - The character attempting the interaction
   * @param {Object} worldState - Current state of the world
   * @returns {boolean} True if the interaction can be executed
   */
  canExecute(character, worldState) {
    // System interactions have basic energy requirements
    const energyCost = this.getEnergyCost(character, worldState.getCurrentEnvironment?.() || {});
    return character.energy >= energyCost;
  }

  /**
   * Executes the system interaction
   * @param {Object} character - The character executing the interaction
   * @param {Object} worldState - Current state of the world
   * @returns {Object} Result of the interaction execution
   */
  execute(character, worldState) {
    const energyCost = this.getEnergyCost(character, worldState.getCurrentEnvironment?.() || {});
    const environment = worldState.getCurrentEnvironment?.() || {};

    // Consume energy
    character.energy = Math.max(0, character.energy - energyCost);

    return {
      success: true,
      interaction: this,
      energyConsumed: energyCost,
      environmentalFactors: {
        modifier: this.getEnvironmentalModifier(environment)
      },
      logs: [`${this.name} executed successfully, consumed ${energyCost} energy`]
    };
  }

  /**
   * Checks if character meets the interaction requirements
   * @param {Object} character - The character to check
   * @returns {boolean} True if requirements are met
   */
  meetsRequirements(character) {
    // System interactions have basic requirements
    return character.energy >= this.baseEnergyCost;
  }

  /**
   * Checks if the interaction is available
   * @param {number} currentTick - Current game tick
   * @returns {boolean} True if the interaction is available
   */
  isAvailable(currentTick) {
    // System interactions are always available (no cooldown)
    return true;
  }

  /**
   * Creates a system interaction instance from serialized data
   * @param {Object} data - Serialized interaction data
   * @returns {SystemInteraction} New system interaction instance
   */
  static fromJSON(data) {
    return new this(data);
  }
}

export default SystemInteraction;
