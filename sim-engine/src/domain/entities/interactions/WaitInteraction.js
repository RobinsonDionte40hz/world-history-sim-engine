// src/domain/entities/interactions/WaitInteraction.js

const SystemInteraction = require('./SystemInteraction.js');

/**
 * WaitInteraction - A system interaction that allows characters to wait/pass time
 *
 * This is the simplest system interaction, providing a way for characters to
 * spend time without performing other actions. It has minimal energy cost and
 * is always available, making it useful for strategic timing or recovery.
 */
class WaitInteraction extends SystemInteraction {
  /**
   * Creates a new wait interaction instance
   * @param {Object} config - Configuration object
   * @param {string} config.id - Unique identifier for the interaction
   * @param {string} config.name - Display name of the interaction
   * @param {string} config.description - Description of what the interaction does
   * @param {string} config.type - Type identifier for the interaction
   * @param {string} config.priority - Priority level ('critical', 'high', 'normal', 'low')
   * @param {number} config.baseEnergyCost - Base energy cost before environmental modifiers
   * @param {number} config.duration - Duration of the wait in time units (default: 1)
   * @param {number} config.energyRecoveryRate - Energy recovery per time unit (default: 0.5)
   */
  constructor(config = {}) {
    super({
      name: 'Wait',
      description: 'Wait for a period of time, allowing time to pass',
      baseEnergyCost: 0,
      ...config
    });
  }

  /**
   * Initialize subclass-specific properties before freezing
   * @param {Object} config - Configuration object
   */
  _initializeSubclassProperties(config) {
    // Handle null or undefined config
    config = config || {};

    this.duration = (config.duration !== undefined) ? config.duration : 1;
    this.energyRecoveryRate = (config.energyRecoveryRate !== undefined) ? config.energyRecoveryRate : 0.5;
  }

  /**
   * Gets the environmental modifier for waiting
   * Waiting is minimally affected by environment - slight comfort bonus/penalty
   * @param {Object} environment - The current environment
   * @returns {number} Modifier value (typically 0.8 to 1.2)
   */
  getEnvironmentalModifier(environment) {
    if (!environment) return 1.0;

    // Comfort level affects waiting efficiency slightly
    const comfortLevel = environment.getComfortLevel ? environment.getComfortLevel() : 1.0;

    // Comfortable environments make waiting slightly more efficient (lower effective cost)
    // Uncomfortable environments make waiting slightly less efficient
    if (comfortLevel > 1.2) return 0.9; // Very comfortable - 10% cost reduction
    if (comfortLevel < 0.8) return 1.1; // Uncomfortable - 10% cost increase

    return 1.0; // Normal comfort
  }

  /**
   * Determines if the wait interaction can be executed
   * Wait is always available with minimal energy requirements
   * @param {Object} character - The character attempting the interaction
   * @param {Object} worldState - Current state of the world
   * @returns {boolean} True if the interaction can be executed
   */
  canExecute(character, worldState) {
    // Wait requires minimal energy (at least 1)
    return character.energy >= 1;
  }

  /**
   * Executes the wait interaction
   * @param {Object} character - The character executing the interaction
   * @param {Object} worldState - Current state of the world
   * @returns {Object} Result of the interaction execution
   */
  execute(character, worldState) {
    const energyCost = this.getEnergyCost(character, worldState.getCurrentEnvironment?.() || {});
    const environment = worldState.getCurrentEnvironment?.() || {};

    // Consume minimal energy
    character.energy = Math.max(0, character.energy - energyCost);

    // Calculate energy recovery during wait
    const energyRecovered = Math.round(this.energyRecoveryRate * this.duration);

    // Apply energy recovery (but don't exceed maximum)
    const maxEnergy = character.maxEnergy || 100;
    character.energy = Math.min(maxEnergy, character.energy + energyRecovered);

    // Update world time
    if (worldState.advanceTime) {
      worldState.advanceTime(this.duration);
    }

    return {
      success: true,
      interaction: this,
      energyConsumed: energyCost,
      energyRecovered: energyRecovered,
      timeAdvanced: this.duration,
      environmentalFactors: {
        modifier: this.getEnvironmentalModifier(environment),
        comfortLevel: environment.getComfortLevel ? environment.getComfortLevel() : 1.0
      },
      logs: [
        `${this.name} executed successfully`,
        `Consumed ${energyCost} energy, recovered ${energyRecovered} energy`,
        `Time advanced by ${this.duration} units`
      ]
    };
  }

  /**
   * Serializes the wait interaction to a plain object
   * @returns {Object} Serialized interaction data
   */
  toJSON() {
    return {
      ...super.toJSON(),
      duration: this.duration,
      energyRecoveryRate: this.energyRecoveryRate
    };
  }

  /**
   * Creates a wait interaction instance from serialized data
   * @param {Object} data - Serialized interaction data
   * @returns {WaitInteraction} New wait interaction instance
   */
  static fromJSON(data) {
    return new this(data);
  }
}

module.exports = WaitInteraction;
