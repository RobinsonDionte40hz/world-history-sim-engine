/**
 * UniverseValidator - Service for validating universe configurations
 * Ensures that a universe is well-formed and ready for simulation
 * Mirrors WorldValidator pattern for universe-level validation
 */

import Universe from '../entities/Universe.js';
import WorldState from '../entities/WorldState.js';
import WorldConnection from '../value-objects/WorldConnection.js';

class UniverseValidator {
  /**
   * Validates a complete universe configuration
   * @param {Universe|Object} universeConfig - The universe configuration to validate
   * @returns {Object} Comprehensive validation result
   */
  static validate(universeConfig) {
    const errors = [];
    const warnings = [];
    const details = {};

    // Validate basic properties
    const basicResult = this.validateBasicProperties(universeConfig);
    details.basicProperties = basicResult;
    if (!basicResult.valid) {
      errors.push(...basicResult.errors);
    }
    warnings.push(...basicResult.warnings);

    // Validate worlds
    const worldsResult = this.validateWorlds(universeConfig.worlds || []);
    details.worlds = worldsResult;
    if (!worldsResult.valid) {
      errors.push(...worldsResult.errors);
    }
    warnings.push(...worldsResult.warnings);

    // Validate connections
    const connectionsResult = this.validateConnections(
      universeConfig.worldConnections || [],
      universeConfig.worlds || []
    );
    details.connections = connectionsResult;
    if (!connectionsResult.valid) {
      errors.push(...connectionsResult.errors);
    }
    warnings.push(...connectionsResult.warnings);

    // Validate universal rules
    const rulesResult = this.validateUniversalRules(universeConfig.universalRules);
    details.universalRules = rulesResult;
    if (!rulesResult.valid) {
      errors.push(...rulesResult.errors);
    }
    warnings.push(...rulesResult.warnings);

    // Calculate completeness score
    const completeness = this.calculateCompleteness(universeConfig);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness,
      details
    };
  }

  /**
   * Validates basic universe properties
   * @private
   */
  static validateBasicProperties(universeConfig) {
    const errors = [];
    const warnings = [];

    // Name validation
    if (!universeConfig.name || typeof universeConfig.name !== 'string') {
      errors.push({
        field: 'name',
        message: 'Universe name is required and must be a string'
      });
    } else if (universeConfig.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Universe name cannot be empty'
      });
    }

    // Description validation
    if (!universeConfig.description || typeof universeConfig.description !== 'string') {
      warnings.push({
        field: 'description',
        message: 'Universe description is recommended for better understanding'
      });
    }

    // Time coordination validation
    const validTimeCoordinations = ['synchronized', 'independent', 'relative'];
    if (universeConfig.timeCoordination && !validTimeCoordinations.includes(universeConfig.timeCoordination)) {
      errors.push({
        field: 'timeCoordination',
        message: `Time coordination must be one of: ${validTimeCoordinations.join(', ')}`
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates all worlds in the universe
   * @private
   */
  static validateWorlds(worlds) {
    const errors = [];
    const warnings = [];

    // Check for at least one world
    if (!Array.isArray(worlds) || worlds.length === 0) {
      warnings.push({
        field: 'worlds',
        message: 'Universe should have at least one world'
      });
      return { valid: true, errors, warnings }; // Warning, not error
    }

    // Check for duplicate world IDs
    const worldIds = new Set();
    const duplicates = [];
    
    worlds.forEach((world, index) => {
      if (!world.id) {
        errors.push({
          field: `worlds[${index}].id`,
          message: `World at index ${index} is missing an ID`
        });
        return;
      }

      if (worldIds.has(world.id)) {
        duplicates.push(world.id);
      }
      worldIds.add(world.id);
    });

    if (duplicates.length > 0) {
      errors.push({
        field: 'worlds',
        message: `Duplicate world IDs found: ${duplicates.join(', ')}`
      });
    }

    // Validate each world if it's a WorldState instance
    worlds.forEach((world, index) => {
      if (world instanceof WorldState) {
        if (world.validate && typeof world.validate === 'function') {
          const worldValidation = world.validate();
          if (!worldValidation.isValid) {
            errors.push({
              field: `worlds[${index}]`,
              message: `World "${world.name}" validation failed: ${worldValidation.errors.join(', ')}`
            });
          }
        }
      } else {
        warnings.push({
          field: `worlds[${index}]`,
          message: `World at index ${index} is not a WorldState instance`
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates world connections
   * @private
   */
  static validateConnections(connections, worlds) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(connections)) {
      errors.push({
        field: 'worldConnections',
        message: 'World connections must be an array'
      });
      return { valid: false, errors, warnings };
    }

    // Build world ID set for quick lookup
    const worldIds = new Set(worlds.map(w => w.id).filter(id => id));

    // Validate each connection
    connections.forEach((conn, index) => {
      // Check if connection is valid WorldConnection instance
      if (!(conn instanceof WorldConnection)) {
        warnings.push({
          field: `worldConnections[${index}]`,
          message: 'Connection should be a WorldConnection instance'
        });
      }

      // Validate source world exists
      if (!conn.sourceWorldId) {
        errors.push({
          field: `worldConnections[${index}].sourceWorldId`,
          message: 'Connection is missing source world ID'
        });
      } else if (!worldIds.has(conn.sourceWorldId)) {
        errors.push({
          field: `worldConnections[${index}].sourceWorldId`,
          message: `Source world ${conn.sourceWorldId} not found in universe`
        });
      }

      // Validate target world exists
      if (!conn.targetWorldId) {
        errors.push({
          field: `worldConnections[${index}].targetWorldId`,
          message: 'Connection is missing target world ID'
        });
      } else if (!worldIds.has(conn.targetWorldId)) {
        errors.push({
          field: `worldConnections[${index}].targetWorldId`,
          message: `Target world ${conn.targetWorldId} not found in universe`
        });
      }

      // Validate source and target are different
      if (conn.sourceWorldId && conn.targetWorldId && conn.sourceWorldId === conn.targetWorldId) {
        errors.push({
          field: `worldConnections[${index}]`,
          message: 'Connection source and target cannot be the same world'
        });
      }
    });

    // Check for duplicate connections
    const connectionKeys = new Set();
    const duplicateConnections = [];

    connections.forEach((conn, index) => {
      const key = `${conn.sourceWorldId}->${conn.targetWorldId}`;
      if (connectionKeys.has(key)) {
        duplicateConnections.push(key);
      }
      connectionKeys.add(key);
    });

    if (duplicateConnections.length > 0) {
      warnings.push({
        field: 'worldConnections',
        message: `Duplicate connections found: ${duplicateConnections.join(', ')}`
      });
    }

    // Check for isolated worlds (if there are multiple worlds)
    if (worlds.length > 1) {
      const connectedWorldIds = new Set();
      connections.forEach(conn => {
        connectedWorldIds.add(conn.sourceWorldId);
        connectedWorldIds.add(conn.targetWorldId);
      });

      const isolatedWorlds = worlds.filter(w => !connectedWorldIds.has(w.id));
      if (isolatedWorlds.length > 0) {
        warnings.push({
          field: 'worlds',
          message: `${isolatedWorlds.length} isolated world(s) with no connections: ${isolatedWorlds.map(w => w.name || w.id).join(', ')}`
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates universal rules
   * @private
   */
  static validateUniversalRules(universalRules) {
    const errors = [];
    const warnings = [];

    if (!universalRules) {
      warnings.push({
        field: 'universalRules',
        message: 'Universal rules are recommended for consistent cross-world behavior'
      });
      return { valid: true, errors, warnings };
    }

    if (typeof universalRules !== 'object' || Array.isArray(universalRules)) {
      errors.push({
        field: 'universalRules',
        message: 'Universal rules must be an object'
      });
      return { valid: false, errors, warnings };
    }

    return {
      valid: true,
      errors,
      warnings
    };
  }

  /**
   * Calculates universe completeness score (0-100)
   * @private
   */
  static calculateCompleteness(universeConfig) {
    let score = 0;
    const weights = {
      name: 15,
      description: 10,
      universalRules: 10,
      worlds: 30,
      worldConnections: 20,
      cosmicEvents: 10,
      timeCoordination: 5
    };

    // Name
    if (universeConfig.name && universeConfig.name.trim().length > 0) {
      score += weights.name;
    }

    // Description
    if (universeConfig.description && universeConfig.description.trim().length > 0) {
      score += weights.description;
    }

    // Universal rules
    if (universeConfig.universalRules && Object.keys(universeConfig.universalRules).length > 0) {
      score += weights.universalRules;
    }

    // Worlds
    const worlds = universeConfig.worlds || [];
    if (worlds.length > 0) {
      score += weights.worlds;
    }

    // World connections
    const connections = universeConfig.worldConnections || [];
    if (connections.length > 0) {
      score += weights.worldConnections;
    }

    // Cosmic events
    const cosmicEvents = universeConfig.cosmicEvents || [];
    if (cosmicEvents.length > 0) {
      score += weights.cosmicEvents;
    }

    // Time coordination
    if (universeConfig.timeCoordination) {
      score += weights.timeCoordination;
    }

    return Math.round(score);
  }

  /**
   * Validates a single world connection
   * @param {WorldConnection|Object} connection - Connection to validate
   * @param {Array} worlds - Array of worlds in universe
   * @returns {Object} Validation result
   */
  static validateSingleConnection(connection, worlds) {
    const errors = [];
    const warnings = [];

    if (!connection) {
      errors.push({
        field: 'connection',
        message: 'Connection is required'
      });
      return { isValid: false, errors, warnings };
    }

    const worldIds = new Set(worlds.map(w => w.id).filter(id => id));

    // Source world validation
    if (!connection.sourceWorldId) {
      errors.push({
        field: 'sourceWorldId',
        message: 'Source world ID is required'
      });
    } else if (!worldIds.has(connection.sourceWorldId)) {
      errors.push({
        field: 'sourceWorldId',
        message: `Source world ${connection.sourceWorldId} not found`
      });
    }

    // Target world validation
    if (!connection.targetWorldId) {
      errors.push({
        field: 'targetWorldId',
        message: 'Target world ID is required'
      });
    } else if (!worldIds.has(connection.targetWorldId)) {
      errors.push({
        field: 'targetWorldId',
        message: `Target world ${connection.targetWorldId} not found`
      });
    }

    // Same world validation
    if (connection.sourceWorldId && connection.targetWorldId &&
        connection.sourceWorldId === connection.targetWorldId) {
      errors.push({
        field: 'connection',
        message: 'Source and target worlds cannot be the same'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Quick validation check (for performance)
   * @param {Universe|Object} universeConfig - Universe configuration
   * @returns {boolean} True if valid
   */
  static isValid(universeConfig) {
    const result = this.validate(universeConfig);
    return result.isValid;
  }
}

export default UniverseValidator;
