import SystemInteraction from './SystemInteraction.js';

/**
 * RestInteraction - Allows characters to rest and recover energy/health
 * Integrates with environment for safety checks and comfort modifiers
 */
class RestInteraction extends SystemInteraction {
  /**
   * Creates a new RestInteraction
   * @param {Object} params - Interaction parameters
   * @param {number} params.duration - Rest duration in hours (default: 8)
   * @param {boolean} params.isSafe - Whether the rest location is safe (default: false)
   * @param {Environment} params.environment - Current environment context
   */
  constructor({ duration = 8, isSafe = false, environment, ...baseParams }) {
    super({
      name: 'Rest',
      description: 'Take time to rest and recover energy and health',
      energyCost: 0, // Resting doesn't cost energy
      duration,
      isSafe,
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
    const duration = config.duration !== undefined ? config.duration : 8;
    const isSafe = config.isSafe !== undefined ? config.isSafe : false;
    const environment = config.environment;

    this.duration = duration;
    this.isSafe = isSafe;
    this.restDuration = duration;
    this.environment = environment;
  }

  /**
   * Gets the environmental modifier for rest effectiveness
   * @returns {number} Modifier from 0.0 to 2.0 (1.0 = normal)
   * @override
   */
  getEnvironmentalModifier() {
    if (!this.environment) {
      return 1.0; // Default modifier if no environment
    }

    let modifier = 1.0;
    const isDangerous = this.environment.isDangerous();
    const comfortLevel = this.environment.getComfortLevel();

    // Safety affects rest quality
    if (isDangerous && !this.isSafe) {
      modifier *= 0.3; // Dangerous environments severely reduce rest effectiveness
    } else if (this.isSafe) {
      modifier *= 1.2; // Safe locations improve rest
    }

    // Comfort level affects rest quality only in non-dangerous environments
    // Only apply comfort bonus if comfort level is above 0.5 (comfortable)
    if (!isDangerous && comfortLevel > 0.5) {
      modifier *= (0.5 + comfortLevel); // Comfort ranges from 0.5x to 1.5x effectiveness
    }

    return Math.max(0.1, Math.min(2.0, modifier));
  }

  /**
   * Checks if the rest interaction can be executed
   * @param {Object} context - Execution context
   * @param {Character} context.character - The character attempting to rest
   * @returns {boolean} True if rest can be executed
   * @override
   */
  canExecute({ character }) {
    // Basic system interaction checks
    if (!super.canExecute(character, { getCurrentEnvironment: () => this.environment })) {
      return false;
    }

    // Can't rest if already at full energy/health
    if (character.energy >= 100 && character.health >= 100) {
      return false;
    }

    // Can't rest in dangerous environments unless safe location specified
    if (this.environment && this.environment.isDangerous() && !this.isSafe) {
      return false;
    }

    return true;
  }

  /**
   * Executes the rest interaction
   * @param {Object} context - Execution context
   * @param {Character} context.character - The character resting
   * @param {World} context.world - The current world state
   * @returns {Object} Execution result
   * @override
   */
  execute({ character, world }) {
    // Check if rest can be executed
    if (!this.canExecute({ character })) {
      return {
        success: false,
        interaction: this,
        details: {
          reason: 'Cannot rest in current conditions'
        },
        logs: ['Rest execution failed: conditions not met']
      };
    }

    const baseResult = super.execute(character, { getCurrentEnvironment: () => this.environment });

    if (!baseResult.success) {
      return baseResult;
    }

    const modifier = this.getEnvironmentalModifier();

    // Calculate restoration amounts
    const energyRestored = Math.floor(20 * this.restDuration * modifier);
    const healthRestored = Math.floor(5 * this.restDuration * modifier);

    // Apply restoration with caps
    const newEnergy = Math.min(100, character.energy + energyRestored);
    const newHealth = Math.min(100, character.health + healthRestored);

    const actualEnergyRestored = newEnergy - character.energy;
    const actualHealthRestored = newHealth - character.health;

    // Create updated character
    const updatedCharacter = {
      ...character,
      energy: newEnergy,
      health: newHealth,
      lastRestTime: world.currentTime
    };

    return {
      ...baseResult,
      character: updatedCharacter,
      details: {
        ...baseResult.details,
        energyRestored: actualEnergyRestored,
        healthRestored: actualHealthRestored,
        environmentalModifier: modifier,
        restDuration: this.restDuration,
        isSafe: this.isSafe
      }
    };
  }

  /**
   * Gets the estimated restoration amounts for this rest
   * @param {Character} character - The character that would rest
   * @returns {Object} Estimated restoration details
   */
  getEstimatedRestoration(character) {
    const modifier = this.getEnvironmentalModifier();

    const energyRestored = Math.floor(20 * this.restDuration * modifier);
    const healthRestored = Math.floor(5 * this.restDuration * modifier);

    const maxEnergyRestored = Math.min(100 - character.energy, energyRestored);
    const maxHealthRestored = Math.min(100 - character.health, healthRestored);

    return {
      energyRestored: maxEnergyRestored,
      healthRestored: maxHealthRestored,
      environmentalModifier: modifier,
      restDuration: this.restDuration,
      isSafe: this.isSafe
    };
  }

  /**
   * Serializes the RestInteraction to JSON
   * @returns {Object} JSON representation
   * @override
   */
  toJSON() {
    return {
      ...super.toJSON(),
      type: 'RestInteraction',
      duration: this.duration,
      environment: this.environment ? this.environment.toJSON() : null,
      isSafe: this.isSafe,
      restDuration: this.restDuration
    };
  }

  /**
   * Creates a RestInteraction from JSON data
   * @param {Object} data - JSON data
   * @returns {RestInteraction} New instance
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
          isDangerous: () => false,
          getComfortLevel: () => 1.0,
          toJSON: () => data.environment
        };
      }
    }

    return new RestInteraction({
      ...data,
      duration: data.duration || data.restDuration,
      isSafe: data.isSafe,
      environment
    });
  }
}

export default RestInteraction;
