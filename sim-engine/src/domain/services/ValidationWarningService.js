// src/domain/services/ValidationWarningService.js

import BaseDomainService from './BaseDomainService.js';

/**
 * Service for validating data completeness and providing non-blocking warnings
 * Allows systems to continue functioning while alerting about potential issues
 */
export class ValidationWarningService extends BaseDomainService {
  constructor(logger = null) {
    super();
    this.logger = logger;
    this.warnings = new Map(); // entityId -> warnings array
    this.warningCounts = new Map(); // warningType -> count
  }

  /**
   * Validate settlement data and collect warnings
   * @param {Object} settlement - Settlement to validate
   * @returns {Array} Array of warning objects (non-blocking)
   */
  validateSettlement(settlement) {
    const warnings = [];

    if (!settlement) {
      warnings.push(this._createWarning('settlement_null', 'Settlement data is null or undefined', 'error'));
      return warnings;
    }

    // Check basic settlement properties
    if (!settlement.id) {
      warnings.push(this._createWarning('settlement_no_id', 'Settlement missing ID', 'error'));
    }

    if (!settlement.name) {
      warnings.push(this._createWarning('settlement_no_name', 'Settlement missing name', 'warning'));
    }

    // Check political data
    if (!settlement.politicalHistory || settlement.politicalHistory.length === 0) {
      warnings.push(this._createWarning('settlement_no_political_history', 'Settlement has no political history', 'info'));
    }

    if (!settlement.government) {
      warnings.push(this._createWarning('settlement_no_government', 'Settlement missing government data', 'warning'));
    } else {
      if (!settlement.government.type) {
        warnings.push(this._createWarning('settlement_no_government_type', 'Settlement government missing type', 'info'));
      }
      if (!settlement.government.leader) {
        warnings.push(this._createWarning('settlement_no_government_leader', 'Settlement government missing leader', 'info'));
      }
    }

    // Check economic data
    if (!settlement.economy) {
      warnings.push(this._createWarning('settlement_no_economy', 'Settlement missing economy data', 'warning'));
    } else {
      if (!settlement.economy.currency) {
        warnings.push(this._createWarning('settlement_no_currency', 'Settlement economy missing currency', 'info'));
      }
      if (!settlement.economy.markets || settlement.economy.markets.length === 0) {
        warnings.push(this._createWarning('settlement_no_markets', 'Settlement has no markets', 'info'));
      }
    }

    // Check cultural data
    if (!settlement.culture) {
      warnings.push(this._createWarning('settlement_no_culture', 'Settlement missing culture data', 'info'));
    } else {
      if (!settlement.culture.traditions || settlement.culture.traditions.length === 0) {
        warnings.push(this._createWarning('settlement_no_traditions', 'Settlement has no cultural traditions', 'info'));
      }
    }

    // Check population data
    if (!settlement.population) {
      warnings.push(this._createWarning('settlement_no_population', 'Settlement missing population data', 'warning'));
    } else {
      if (settlement.population.total === undefined || settlement.population.total === null) {
        warnings.push(this._createWarning('settlement_no_population_total', 'Settlement population total is undefined', 'warning'));
      }
    }

    // Store warnings for this settlement
    this._storeWarnings(settlement.id, warnings);

    return warnings;
  }

  /**
   * Validate character data and collect warnings
   * @param {Object} character - Character to validate
   * @returns {Array} Array of warning objects (non-blocking)
   */
  validateCharacter(character) {
    const warnings = [];

    if (!character) {
      warnings.push(this._createWarning('character_null', 'Character data is null or undefined', 'error'));
      return warnings;
    }

    // Check basic character properties
    if (!character.id) {
      warnings.push(this._createWarning('character_no_id', 'Character missing ID', 'error'));
    }

    if (!character.name) {
      warnings.push(this._createWarning('character_no_name', 'Character missing name', 'warning'));
    }

    // Check personality data
    if (!character.personality) {
      warnings.push(this._createWarning('character_no_personality', 'Character missing personality data', 'warning'));
    } else {
      const personalityTraits = Object.keys(character.personality);
      if (personalityTraits.length === 0) {
        warnings.push(this._createWarning('character_empty_personality', 'Character personality is empty', 'warning'));
      } else if (personalityTraits.length < 3) {
        warnings.push(this._createWarning('character_minimal_personality', 'Character has minimal personality traits', 'info'));
      }
    }

    // Check attributes
    if (!character.attributes) {
      warnings.push(this._createWarning('character_no_attributes', 'Character missing attributes', 'warning'));
    } else {
      const attributeKeys = Object.keys(character.attributes);
      if (attributeKeys.length === 0) {
        warnings.push(this._createWarning('character_empty_attributes', 'Character attributes are empty', 'warning'));
      }
    }

    // Check consciousness
    if (!character.consciousness) {
      warnings.push(this._createWarning('character_no_consciousness', 'Character missing consciousness data', 'info'));
    }

    // Check economic profile
    if (!character.economicProfile) {
      warnings.push(this._createWarning('character_no_economic_profile', 'Character missing economic profile', 'info'));
    } else {
      if (character.economicProfile.wealth === undefined) {
        warnings.push(this._createWarning('character_no_wealth', 'Character wealth is undefined', 'info'));
      }
      if (!character.economicProfile.investments || character.economicProfile.investments.length === 0) {
        warnings.push(this._createWarning('character_no_investments', 'Character has no investments', 'info'));
      }
    }

    // Check memory data
    if (!character.significantMemories || character.significantMemories.length === 0) {
      warnings.push(this._createWarning('character_no_memories', 'Character has no significant memories', 'info'));
    }

    // Store warnings for this character
    this._storeWarnings(character.id, warnings);

    return warnings;
  }

  /**
   * Validate node data and collect warnings
   * @param {Object} node - Node to validate
   * @returns {Array} Array of warning objects (non-blocking)
   */
  validateNode(node) {
    const warnings = [];

    if (!node) {
      warnings.push(this._createWarning('node_null', 'Node data is null or undefined', 'error'));
      return warnings;
    }

    // Check basic node properties
    if (!node.id) {
      warnings.push(this._createWarning('node_no_id', 'Node missing ID', 'error'));
    }

    if (!node.name) {
      warnings.push(this._createWarning('node_no_name', 'Node missing name', 'warning'));
    }

    if (!node.type) {
      warnings.push(this._createWarning('node_no_type', 'Node missing type', 'warning'));
    }

    // Check type profile
    if (!node.typeProfile) {
      warnings.push(this._createWarning('node_no_type_profile', 'Node missing type profile - using fallback behavior', 'info'));
    } else {
      // Check type profile completeness
      if (!node.typeProfile.capabilities) {
        warnings.push(this._createWarning('node_incomplete_capabilities', 'Node type profile missing capabilities', 'info'));
      }
      if (!node.typeProfile.resourceProfile) {
        warnings.push(this._createWarning('node_incomplete_resources', 'Node type profile missing resource profile', 'info'));
      }
    }

    // Check environmental properties
    if (!node.environmentalProperties) {
      warnings.push(this._createWarning('node_no_environment', 'Node missing environmental properties', 'info'));
    }

    // Check resource availability
    if (!node.resourceAvailability) {
      warnings.push(this._createWarning('node_no_resources', 'Node missing resource availability data', 'info'));
    }

    // Store warnings for this node
    this._storeWarnings(node.id, warnings);

    return warnings;
  }

  /**
   * Validate interaction data and collect warnings
   * @param {Object} interaction - Interaction to validate
   * @returns {Array} Array of warning objects (non-blocking)
   */
  validateInteraction(interaction) {
    const warnings = [];

    if (!interaction) {
      warnings.push(this._createWarning('interaction_null', 'Interaction data is null or undefined', 'error'));
      return warnings;
    }

    // Check basic interaction properties
    if (!interaction.id) {
      warnings.push(this._createWarning('interaction_no_id', 'Interaction missing ID', 'error'));
    }

    if (!interaction.type) {
      warnings.push(this._createWarning('interaction_no_type', 'Interaction missing type', 'warning'));
    }

    // Check branches
    if (!interaction.branches || interaction.branches.length === 0) {
      warnings.push(this._createWarning('interaction_no_branches', 'Interaction has no branches', 'warning'));
    } else {
      // Check each branch
      interaction.branches.forEach((branch, index) => {
        if (!branch.id) {
          warnings.push(this._createWarning('branch_no_id', `Branch ${index} missing ID`, 'info'));
        }
        if (!branch.content) {
          warnings.push(this._createWarning('branch_no_content', `Branch ${index} missing content`, 'info'));
        }
      });
    }

    // Check participants
    if (!interaction.participants || interaction.participants.length === 0) {
      warnings.push(this._createWarning('interaction_no_participants', 'Interaction has no participants', 'warning'));
    }

    // Store warnings for this interaction
    this._storeWarnings(interaction.id, warnings);

    return warnings;
  }

  /**
   * Get all warnings for an entity
   * @param {string} entityId - Entity ID
   * @returns {Array} Array of warnings for the entity
   */
  getWarnings(entityId) {
    return this.warnings.get(entityId) || [];
  }

  /**
   * Get warning summary statistics
   * @returns {Object} Warning statistics
   */
  getWarningSummary() {
    const summary = {
      totalWarnings: 0,
      bySeverity: { error: 0, warning: 0, info: 0 },
      byType: {},
      entitiesWithWarnings: this.warnings.size
    };

    for (const [, entityWarnings] of this.warnings) {
      summary.totalWarnings += entityWarnings.length;

      entityWarnings.forEach(warning => {
        summary.bySeverity[warning.severity] = (summary.bySeverity[warning.severity] || 0) + 1;
        summary.byType[warning.type] = (summary.byType[warning.type] || 0) + 1;
      });
    }

    return summary;
  }

  /**
   * Clear warnings for an entity
   * @param {string} entityId - Entity ID
   */
  clearWarnings(entityId) {
    this.warnings.delete(entityId);
  }

  /**
   * Clear all warnings
   */
  clearAllWarnings() {
    this.warnings.clear();
    this.warningCounts.clear();
  }

  /**
   * Check if entity has critical warnings that should block operations
   * @param {string} entityId - Entity ID
   * @returns {boolean} True if entity has critical warnings
   */
  hasCriticalWarnings(entityId) {
    const entityWarnings = this.getWarnings(entityId);
    return entityWarnings.some(warning => warning.severity === 'error');
  }

  /**
   * Log warnings to the configured logger
   * @param {Array} warnings - Warnings to log
   * @param {string} context - Logging context
   */
  logWarnings(warnings, context = '') {
    if (!this.logger || !Array.isArray(warnings)) {
      return;
    }

    warnings.forEach(warning => {
      const message = `${context} ${warning.type}: ${warning.message}`;
      switch (warning.severity) {
        case 'error':
          this.logger.error(message);
          break;
        case 'warning':
          this.logger.warn(message);
          break;
        case 'info':
        default:
          this.logger.info(message);
          break;
      }
    });
  }

  /**
   * Create a warning object
   * @param {string} type - Warning type
   * @param {string} message - Warning message
   * @param {string} severity - Warning severity (error, warning, info)
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Warning object
   * @private
   */
  _createWarning(type, message, severity = 'warning', metadata = {}) {
    return {
      type,
      message,
      severity,
      timestamp: new Date(),
      metadata
    };
  }

  /**
   * Store warnings for an entity
   * @param {string} entityId - Entity ID
   * @param {Array} warnings - Warnings to store
   * @private
   */
  _storeWarnings(entityId, warnings) {
    if (!entityId || !Array.isArray(warnings)) {
      return;
    }

    // Update warning counts
    warnings.forEach(warning => {
      this.warningCounts.set(warning.type, (this.warningCounts.get(warning.type) || 0) + 1);
    });

    // Store warnings
    this.warnings.set(entityId, warnings);
  }
}

export default ValidationWarningService;