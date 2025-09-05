// src/domain/services/InteractionExecutor.js

import BaseDomainService from './BaseDomainService.js';

/**
 * InteractionExecutor - Service for executing interactions with comprehensive error handling
 *
 * This service coordinates the execution of interactions, applying environmental effects,
 * managing resource consumption, and providing detailed logging and debugging information.
 * It serves as the central execution engine for both system and content interactions.
 */
export default class InteractionExecutor extends BaseDomainService {
  /**
   * Creates a new InteractionExecutor instance
   * @param {Object} config - Configuration options
   * @param {boolean} config.enableLogging - Whether to enable detailed logging (default: true)
   * @param {boolean} config.enableDebugging - Whether to enable debug information (default: false)
   * @param {boolean} config.enableEnvironmentalEffects - Whether to apply environmental effects (default: true)
   * @param {boolean} config.enableResourceTracking - Whether to track resource consumption (default: true)
   * @param {Object} config.logger - Custom logger instance (optional)
   */
  constructor(config = {}) {
    super();

    this.enableLogging = config.enableLogging !== false;
    this.enableDebugging = config.enableDebugging || false;
    this.enableEnvironmentalEffects = config.enableEnvironmentalEffects !== false;
    this.enableResourceTracking = config.enableResourceTracking !== false;
    this.logger = config.logger || console;

    // Execution statistics for monitoring
    this.executionStats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: 0
    };

    // Error tracking
    this.errorHistory = [];
    this.maxErrorHistorySize = 100;
  }

  /**
   * Executes an interaction for a character in the given world state
   * @param {InteractionBase} interaction - The interaction to execute
   * @param {Object} character - The character executing the interaction
   * @param {WorldState} worldState - The current world state
   * @param {Object} options - Execution options
   * @param {boolean} options.skipValidation - Skip pre-execution validation (default: false)
   * @param {boolean} options.dryRun - Perform dry run without applying changes (default: false)
   * @param {Object} options.context - Additional execution context
   * @returns {Object} Execution result
   */
  async execute(interaction, character, worldState, options = {}) {
    const startTime = Date.now();
    const executionId = this._generateExecutionId();

    try {
      this._log('debug', `Starting execution ${executionId} for interaction: ${interaction?.name || 'Unknown'}`, { executionId, interactionId: interaction?.id });

      // Validate execution context
      const validationResult = this._validateExecutionContext(interaction, character, worldState, options);
      if (!validationResult.isValid) {
        throw new Error(`Execution validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Pre-execution checks
      if (!options.skipValidation) {
        const canExecute = this._canExecuteInteraction(interaction, character, worldState);
        if (!canExecute.allowed) {
          throw new Error(`Interaction cannot be executed: ${canExecute.reason}`);
        }
      }

      // Prepare execution context
      const executionContext = this._prepareExecutionContext(interaction, character, worldState, options);

      // Execute the interaction
      let result;
      if (options.dryRun) {
        result = this._simulateExecution(interaction, executionContext);
      } else {
        result = await this._performExecution(interaction, executionContext);
      }

      // Apply environmental effects if enabled
      if (this.enableEnvironmentalEffects && !options.dryRun) {
        result.environmentalEffects = this._applyEnvironmentalEffects(interaction, executionContext, result);
      }

      // Track resource consumption if enabled
      if (this.enableResourceTracking && !options.dryRun) {
        result.resourceConsumption = this._trackResourceConsumption(interaction, executionContext, result);
      }

      // Update execution statistics
      this._updateExecutionStats(startTime, true);

      // Log successful execution
      this._log('info', `Execution ${executionId} completed successfully`, {
        executionId,
        interactionId: interaction?.id,
        executionTime: Date.now() - startTime,
        success: result.success
      });

      return {
        ...result,
        executionId,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      // Update execution statistics for failure
      this._updateExecutionStats(startTime, false);

      // Track error
      this._trackError(error, executionId, interaction, character);

      // Log error
      this._log('error', `Execution ${executionId} failed: ${error.message}`, {
        executionId,
        interactionId: interaction?.id,
        error: error.message,
        stack: this.enableDebugging ? error.stack : undefined
      });

      return {
        success: false,
        executionId,
        error: error.message,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        logs: [`Execution failed: ${error.message}`]
      };
    }
  }

  /**
   * Validates the execution context before proceeding
   * @param {InteractionBase} interaction - The interaction to validate
   * @param {Object} character - The character executing
   * @param {WorldState} worldState - The world state
   * @param {Object} options - Execution options
   * @returns {Object} Validation result
   * @private
   */
  _validateExecutionContext(interaction, character, worldState, options) {
    const errors = [];

    if (!interaction) {
      errors.push('Interaction is required');
    }

    if (!character) {
      errors.push('Character is required');
    }

    if (!worldState) {
      errors.push('World state is required');
    }

    if (interaction && typeof interaction.execute !== 'function') {
      errors.push('Interaction must have an execute method');
    }

    if (character && typeof character !== 'object') {
      errors.push('Character must be an object');
    }

    if (worldState && typeof worldState !== 'object') {
      errors.push('World state must be an object');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Checks if the interaction can be executed in the current context
   * @param {InteractionBase} interaction - The interaction to check
   * @param {Object} character - The character executing
   * @param {WorldState} worldState - The world state
   * @returns {Object} Can execute result
   * @private
   */
  _canExecuteInteraction(interaction, character, worldState) {
    try {
      const canExecute = interaction.canExecute(character, worldState);
      return {
        allowed: canExecute,
        reason: canExecute ? null : 'Interaction prerequisites not met'
      };
    } catch (error) {
      return {
        allowed: false,
        reason: `Validation error: ${error.message}`
      };
    }
  }

  /**
   * Prepares the execution context with all necessary data
   * @param {InteractionBase} interaction - The interaction
   * @param {Object} character - The character
   * @param {WorldState} worldState - The world state
   * @param {Object} options - Execution options
   * @returns {Object} Execution context
   * @private
   */
  _prepareExecutionContext(interaction, character, worldState, options) {
    const environment = worldState.getCurrentEnvironment?.() || {};
    const currentNode = worldState.nodes?.find(node => node.id === character.currentNodeId);

    return {
      interaction,
      character,
      worldState,
      environment,
      currentNode,
      options,
      executionTimestamp: Date.now(),
      preExecutionState: {
        characterEnergy: character.energy,
        characterHealth: character.health,
        worldTime: worldState.currentTime
      }
    };
  }

  /**
   * Performs the actual interaction execution
   * @param {InteractionBase} interaction - The interaction to execute
   * @param {Object} executionContext - The execution context
   * @returns {Object} Execution result
   * @private
   */
  async _performExecution(interaction, executionContext) {
    try {
      // Execute the interaction
      const result = interaction.execute(executionContext.character, executionContext.worldState);

      // Ensure result has expected structure
      if (!result || typeof result !== 'object') {
        throw new Error('Interaction execution returned invalid result');
      }

      return {
        success: result.success !== false,
        ...result,
        executedAt: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Interaction execution failed: ${error.message}`);
    }
  }

  /**
   * Simulates execution without applying changes (dry run)
   * @param {InteractionBase} interaction - The interaction to simulate
   * @param {Object} executionContext - The execution context
   * @returns {Object} Simulation result
   * @private
   */
  _simulateExecution(interaction, executionContext) {
    // Create a deep copy of the character for simulation
    const simulatedCharacter = JSON.parse(JSON.stringify(executionContext.character));
    const simulatedWorldState = JSON.parse(JSON.stringify(executionContext.worldState));

    try {
      const result = interaction.execute(simulatedCharacter, simulatedWorldState);

      return {
        success: true,
        simulated: true,
        ...result,
        changes: this._calculateStateChanges(executionContext.preExecutionState, {
          characterEnergy: simulatedCharacter.energy,
          characterHealth: simulatedCharacter.health,
          worldTime: simulatedWorldState.currentTime
        })
      };
    } catch (error) {
      return {
        success: false,
        simulated: true,
        error: error.message,
        changes: {}
      };
    }
  }

  /**
   * Applies environmental effects to the execution result
   * @param {InteractionBase} interaction - The interaction
   * @param {Object} executionContext - The execution context
   * @param {Object} result - The execution result
   * @returns {Object} Environmental effects
   * @private
   */
  _applyEnvironmentalEffects(interaction, executionContext, result) {
    const effects = {
      applied: false,
      modifiers: {},
      additionalEffects: []
    };

    if (!executionContext.environment) {
      return effects;
    }

    const environment = executionContext.environment;

    // Apply comfort level effects to energy costs
    if (environment.getComfortLevel) {
      const comfortLevel = environment.getComfortLevel();
      if (comfortLevel < 0.5) {
        // Uncomfortable environment increases energy cost
        const penalty = Math.round(result.energyConsumed * (0.5 - comfortLevel));
        executionContext.character.energy = Math.max(0, executionContext.character.energy - penalty);
        effects.modifiers.comfortPenalty = penalty;
        effects.additionalEffects.push(`Comfort penalty: -${penalty} energy`);
      }
    }

    // Apply hazard effects
    if (environment.isDangerous && environment.isDangerous()) {
      const hazardDamage = Math.floor(Math.random() * 5) + 1; // 1-5 damage
      executionContext.character.health = Math.max(0, executionContext.character.health - hazardDamage);
      effects.modifiers.hazardDamage = hazardDamage;
      effects.additionalEffects.push(`Environmental hazard: -${hazardDamage} health`);
    }

    effects.applied = effects.additionalEffects.length > 0;
    return effects;
  }

  /**
   * Tracks resource consumption during execution
   * @param {InteractionBase} interaction - The interaction
   * @param {Object} executionContext - The execution context
   * @param {Object} result - The execution result
   * @returns {Object} Resource consumption tracking
   * @private
   */
  _trackResourceConsumption(interaction, executionContext, result) {
    const consumption = {
      energy: {
        before: executionContext.preExecutionState.characterEnergy,
        after: executionContext.character.energy,
        consumed: executionContext.preExecutionState.characterEnergy - executionContext.character.energy
      },
      health: {
        before: executionContext.preExecutionState.characterHealth,
        after: executionContext.character.health,
        consumed: executionContext.preExecutionState.characterHealth - executionContext.character.health
      },
      time: {
        before: executionContext.preExecutionState.worldTime,
        after: executionContext.worldState.currentTime || executionContext.preExecutionState.worldTime,
        advanced: (executionContext.worldState.currentTime || executionContext.preExecutionState.worldTime) - executionContext.preExecutionState.worldTime
      }
    };

    return consumption;
  }

  /**
   * Calculates state changes between pre and post execution
   * @param {Object} preState - Pre-execution state
   * @param {Object} postState - Post-execution state
   * @returns {Object} State changes
   * @private
   */
  _calculateStateChanges(preState, postState) {
    return {
      energyChange: postState.characterEnergy - preState.characterEnergy,
      healthChange: postState.characterHealth - preState.characterHealth,
      timeChange: postState.worldTime - preState.worldTime
    };
  }

  /**
   * Updates execution statistics
   * @param {number} startTime - Execution start time
   * @param {boolean} success - Whether execution was successful
   * @private
   */
  _updateExecutionStats(startTime, success) {
    const executionTime = Date.now() - startTime;

    this.executionStats.totalExecutions++;
    this.executionStats.lastExecutionTime = executionTime;

    if (success) {
      this.executionStats.successfulExecutions++;
    } else {
      this.executionStats.failedExecutions++;
    }

    // Update rolling average
    const totalTime = this.executionStats.averageExecutionTime * (this.executionStats.totalExecutions - 1) + executionTime;
    this.executionStats.averageExecutionTime = totalTime / this.executionStats.totalExecutions;
  }

  /**
   * Tracks execution errors
   * @param {Error} error - The error that occurred
   * @param {string} executionId - The execution ID
   * @param {InteractionBase} interaction - The interaction
   * @param {Object} character - The character
   * @private
   */
  _trackError(error, executionId, interaction, character) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      executionId,
      interactionId: interaction?.id,
      interactionName: interaction?.name,
      characterId: character?.id,
      error: error.message,
      stack: this.enableDebugging ? error.stack : undefined
    };

    this.errorHistory.push(errorEntry);

    // Maintain max history size
    if (this.errorHistory.length > this.maxErrorHistorySize) {
      this.errorHistory.shift();
    }
  }

  /**
   * Generates a unique execution ID
   * @returns {string} Execution ID
   * @private
   */
  _generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Logs messages with appropriate level
   * @param {string} level - Log level (debug, info, warn, error)
   * @param {string} message - Log message
   * @param {Object} data - Additional log data
   * @private
   */
  _log(level, message, data = {}) {
    if (!this.enableLogging) {
      return;
    }

    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data
    };

    switch (level) {
      case 'debug':
        if (this.enableDebugging) {
          this.logger.debug(JSON.stringify(logData, null, 2));
        }
        break;
      case 'info':
        this.logger.info(JSON.stringify(logData, null, 2));
        break;
      case 'warn':
        this.logger.warn(JSON.stringify(logData, null, 2));
        break;
      case 'error':
        this.logger.error(JSON.stringify(logData, null, 2));
        break;
      default:
        this.logger.log(JSON.stringify(logData, null, 2));
        break;
    }
  }

  /**
   * Gets execution statistics
   * @returns {Object} Execution statistics
   */
  getExecutionStats() {
    return { ...this.executionStats };
  }

  /**
   * Gets recent error history
   * @param {number} limit - Maximum number of errors to return
   * @returns {Array} Recent errors
   */
  getErrorHistory(limit = 10) {
    return this.errorHistory.slice(-limit);
  }

  /**
   * Clears execution statistics
   */
  clearStats() {
    this.executionStats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: 0
    };
  }

  /**
   * Clears error history
   */
  clearErrorHistory() {
    this.errorHistory = [];
  }
}
