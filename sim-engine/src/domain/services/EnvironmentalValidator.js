// src/domain/services/EnvironmentalValidator.js

import { 
  TerrainTypes, 
  isValidTerrainType, 
  TERRAIN_TYPE_VALUES 
} from '../../shared/constants/TerrainTypes.js';
import { 
  ClimateTypes, 
  isValidClimateType, 
  CLIMATE_TYPE_VALUES 
} from '../../shared/constants/ClimateTypes.js';
import { 
  LightingTypes, 
  isValidLightingType, 
  LIGHTING_TYPE_VALUES 
} from '../../shared/constants/LightingTypes.js';
import { 
  ConnectionTypes, 
  isValidConnectionType, 
  CONNECTION_TYPE_VALUES 
} from '../../shared/constants/ConnectionTypes.js';
import { 
  HazardTypes, 
  isValidHazardType, 
  HAZARD_TYPE_VALUES,
  getHazardCategory 
} from '../../shared/constants/HazardTypes.js';

/**
 * EnvironmentalValidator service provides comprehensive validation for environmental data
 * including range validations, enum validations, logical consistency checks, and hazard combinations
 */
class EnvironmentalValidator {
  /**
   * Validates an environment object with comprehensive checks
   * @param {Object} environment - Environment object to validate
   * @param {Object} [options={}] - Validation options
   * @param {boolean} [options.strict=false] - Whether to use strict validation
   * @param {boolean} [options.warnings=true] - Whether to include warnings
   * @returns {Object} Validation result with isValid, errors, and warnings
   */
  static validateEnvironment(environment, options = {}) {
    const { warnings = true } = options;
    const errors = [];
    const warningsList = [];

    if (!environment || typeof environment !== 'object') {
      return {
        isValid: false,
        errors: ['Environment must be a valid object'],
        warnings: []
      };
    }

    // Validate density
    const densityValidation = this._validateRange(
      'density', 
      environment.density, 
      0, 
      1, 
      'Density must be between 0.0 and 1.0'
    );
    if (!densityValidation.isValid) {
      errors.push(densityValidation.error);
    }

    // Validate shelter quality
    const shelterValidation = this._validateRange(
      'shelterQuality', 
      environment.shelterQuality, 
      0, 
      1, 
      'Shelter quality must be between 0.0 and 1.0'
    );
    if (!shelterValidation.isValid) {
      errors.push(shelterValidation.error);
    }

    // Validate air quality
    const airQualityValidation = this._validateRange(
      'airQuality', 
      environment.airQuality, 
      0, 
      1, 
      'Air quality must be between 0.0 and 1.0'
    );
    if (!airQualityValidation.isValid) {
      errors.push(airQualityValidation.error);
    }

    // Validate water availability
    const waterValidation = this._validateRange(
      'waterAvailability', 
      environment.waterAvailability, 
      0, 
      1, 
      'Water availability must be between 0.0 and 1.0'
    );
    if (!waterValidation.isValid) {
      errors.push(waterValidation.error);
    }

    // Validate humidity
    const humidityValidation = this._validateRange(
      'humidity', 
      environment.humidity, 
      0, 
      1, 
      'Humidity must be between 0.0 and 1.0'
    );
    if (!humidityValidation.isValid) {
      errors.push(humidityValidation.error);
    }

    // Validate wind strength
    const windValidation = this._validateRange(
      'windStrength', 
      environment.windStrength, 
      0, 
      1, 
      'Wind strength must be between 0.0 and 1.0'
    );
    if (!windValidation.isValid) {
      errors.push(windValidation.error);
    }

    // Validate temperature
    const temperatureValidation = this._validateRange(
      'temperature', 
      environment.temperature, 
      -50, 
      60, 
      'Temperature must be between -50°C and 60°C'
    );
    if (!temperatureValidation.isValid) {
      errors.push(temperatureValidation.error);
    }

    // Validate terrain type
    if (environment.terrain !== undefined && !isValidTerrainType(environment.terrain)) {
      errors.push(`Invalid terrain type: ${environment.terrain}. Valid types: ${TERRAIN_TYPE_VALUES.join(', ')}`);
    }

    // Validate climate type
    if (environment.climate !== undefined && !isValidClimateType(environment.climate)) {
      errors.push(`Invalid climate type: ${environment.climate}. Valid types: ${CLIMATE_TYPE_VALUES.join(', ')}`);
    }

    // Validate lighting type
    if (environment.lighting !== undefined && !isValidLightingType(environment.lighting)) {
      errors.push(`Invalid lighting type: ${environment.lighting}. Valid types: ${LIGHTING_TYPE_VALUES.join(', ')}`);
    }

    // Validate hazards
    if (environment.hazards !== undefined) {
      const hazardValidation = this._validateHazards(environment.hazards);
      errors.push(...hazardValidation.errors);
      if (warnings) {
        warningsList.push(...hazardValidation.warnings);
      }
    }

    // Logical consistency checks
    if (warnings) {
      const logicalWarnings = this._validateLogicalConsistency(environment);
      warningsList.push(...logicalWarnings);
    }

    // Hazard combination validation
    if (environment.hazards && warnings) {
      const combinationWarnings = this._validateHazardCombinations(environment.hazards);
      warningsList.push(...combinationWarnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warningsList
    };
  }

  /**
   * Validates node connections array
   * @param {Array} connections - Array of connection objects to validate
   * @param {Array} [availableNodes=[]] - Array of available node IDs for reference validation
   * @param {Object} [options={}] - Validation options
   * @returns {Object} Validation result with isValid, errors, and warnings
   */
  static validateConnections(connections, availableNodes = [], options = {}) {
    const { warnings = true } = options;
    const errors = [];
    const warningsList = [];

    if (!Array.isArray(connections)) {
      return {
        isValid: false,
        errors: ['Connections must be an array'],
        warnings: []
      };
    }

    connections.forEach((connection, index) => {
      const prefix = `Connection ${index + 1}`;

      // Validate required fields
      if (!connection.targetNodeId) {
        errors.push(`${prefix}: Target node ID is required`);
      }

      // Validate connection type
      if (connection.type !== undefined && !isValidConnectionType(connection.type)) {
        errors.push(`${prefix}: Invalid connection type '${connection.type}'. Valid types: ${CONNECTION_TYPE_VALUES.join(', ')}`);
      }

      // Validate difficulty range
      if (connection.difficulty !== undefined) {
        const difficultyValidation = this._validateRange(
          'difficulty',
          connection.difficulty,
          1,
          10,
          `${prefix}: Difficulty must be between 1 and 10`
        );
        if (!difficultyValidation.isValid) {
          // Handle the case where the error message doesn't include the prefix
          const errorMessage = difficultyValidation.error.includes(prefix) ? 
            difficultyValidation.error : 
            `${prefix}: ${difficultyValidation.error}`;
          errors.push(errorMessage);
        }
      }

      // Validate distance
      if (connection.distance !== undefined) {
        const distanceValidation = this._validateRange(
          'distance',
          connection.distance,
          0.1,
          1000,
          `${prefix}: Distance must be between 0.1 and 1000`
        );
        if (!distanceValidation.isValid) {
          errors.push(distanceValidation.error);
        }
      }

      // Validate target node exists
      if (availableNodes.length > 0 && connection.targetNodeId) {
        const nodeExists = availableNodes.some(nodeId => nodeId === connection.targetNodeId);
        if (!nodeExists) {
          errors.push(`${prefix}: Target node '${connection.targetNodeId}' does not exist`);
        }
      }

      // Validate conditions array
      if (connection.conditions !== undefined && !Array.isArray(connection.conditions)) {
        errors.push(`${prefix}: Conditions must be an array`);
      }

      // Validate modifiers object
      if (connection.modifiers !== undefined && (typeof connection.modifiers !== 'object' || connection.modifiers === null)) {
        errors.push(`${prefix}: Modifiers must be an object`);
      }

      // Warnings for potential issues
      if (warnings) {
        if (connection.difficulty > 8) {
          warningsList.push(`${prefix}: Very high difficulty (${connection.difficulty}) may make travel extremely challenging`);
        }

        if (connection.distance && connection.distance > 100) {
          warningsList.push(`${prefix}: Very long distance (${connection.distance}) may result in extended travel times`);
        }

        if (connection.type === ConnectionTypes.TELEPORT && connection.difficulty > 1) {
          warningsList.push(`${prefix}: Teleport connections typically have difficulty 1`);
        }
      }
    });

    // Check for duplicate connections
    if (warnings) {
      const targetIds = connections.map(conn => conn.targetNodeId).filter(Boolean);
      const duplicates = targetIds.filter((id, index) => targetIds.indexOf(id) !== index);
      if (duplicates.length > 0) {
        warningsList.push(`Duplicate connections found to nodes: ${[...new Set(duplicates)].join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warningsList
    };
  }

  /**
   * Validates a numeric value within a specified range
   * @param {string} fieldName - Name of the field being validated
   * @param {*} value - Value to validate
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @param {string} errorMessage - Custom error message
   * @returns {Object} Validation result
   * @private
   */
  static _validateRange(fieldName, value, min, max, errorMessage) {
    if (value === undefined || value === null) {
      return { isValid: true }; // Allow undefined/null values
    }

    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return {
        isValid: false,
        error: `${fieldName} must be a valid number`
      };
    }

    if (value < min || value > max) {
      return {
        isValid: false,
        error: errorMessage || `${fieldName} must be between ${min} and ${max}`
      };
    }

    return { isValid: true };
  }

  /**
   * Validates hazards array
   * @param {Array} hazards - Hazards array to validate
   * @returns {Object} Validation result with errors and warnings
   * @private
   */
  static _validateHazards(hazards) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(hazards)) {
      return {
        errors: ['Hazards must be an array'],
        warnings: []
      };
    }

    if (hazards.length > 10) {
      warnings.push(`Large number of hazards (${hazards.length}) may impact performance. Consider limiting to 10 or fewer.`);
    }

    hazards.forEach((hazard, index) => {
      const prefix = `Hazard ${index + 1}`;

      if (!hazard || typeof hazard !== 'object') {
        errors.push(`${prefix}: Must be a valid object`);
        return;
      }

      // Validate hazard type
      if (!hazard.type) {
        errors.push(`${prefix}: Type is required`);
      } else if (!isValidHazardType(hazard.type)) {
        errors.push(`${prefix}: Invalid hazard type '${hazard.type}'. Valid types: ${HAZARD_TYPE_VALUES.join(', ')}`);
      }

      // Validate severity
      const severityValidation = this._validateRange(
        'severity',
        hazard.severity,
        0,
        1,
        `${prefix}: Severity must be between 0.0 and 1.0`
      );
      if (!severityValidation.isValid) {
        errors.push(severityValidation.error);
      }

      // Warning for very high severity
      if (hazard.severity > 0.8) {
        warnings.push(`${prefix}: Very high severity (${hazard.severity}) may make the environment extremely dangerous`);
      }
    });

    return { errors, warnings };
  }

  /**
   * Validates logical consistency between environmental properties
   * @param {Object} environment - Environment object to validate
   * @returns {Array} Array of warning messages
   * @private
   */
  static _validateLogicalConsistency(environment) {
    const warnings = [];

    // Climate and water availability consistency
    if (environment.climate === ClimateTypes.ARID && environment.waterAvailability > 0.7) {
      warnings.push('Arid climates typically have low water availability (< 0.7)');
    }

    if (environment.climate === ClimateTypes.TROPICAL && environment.waterAvailability < 0.5) {
      warnings.push('Tropical climates typically have high water availability (> 0.5)');
    }

    // Climate and humidity consistency
    if (environment.climate === ClimateTypes.ARID && environment.humidity > 0.6) {
      warnings.push('Arid climates typically have low humidity (< 0.6)');
    }

    if (environment.climate === ClimateTypes.TROPICAL && environment.humidity < 0.6) {
      warnings.push('Tropical climates typically have high humidity (> 0.6)');
    }

    // Terrain and shelter quality consistency
    if (environment.terrain === TerrainTypes.URBAN && environment.shelterQuality < 0.5) {
      warnings.push('Urban areas typically have better shelter quality (> 0.5)');
    }

    if (environment.terrain === TerrainTypes.DESERT && environment.shelterQuality > 0.6) {
      warnings.push('Desert areas typically have limited shelter quality (< 0.6)');
    }

    // Terrain and air quality consistency
    if (environment.terrain === TerrainTypes.URBAN && environment.airQuality > 0.8) {
      warnings.push('Urban areas often have reduced air quality due to pollution (< 0.8)');
    }

    if (environment.terrain === TerrainTypes.FOREST && environment.airQuality < 0.7) {
      warnings.push('Forest areas typically have good air quality (> 0.7)');
    }

    // Temperature and climate consistency
    if (environment.climate === ClimateTypes.ARCTIC && environment.temperature > 5) {
      warnings.push('Arctic climates typically have temperatures below 5°C');
    }

    if (environment.climate === ClimateTypes.TROPICAL && environment.temperature < 20) {
      warnings.push('Tropical climates typically have temperatures above 20°C');
    }

    if (environment.climate === ClimateTypes.ARID && environment.temperature < 25) {
      warnings.push('Arid climates typically have high temperatures (> 25°C)');
    }

    // Lighting and terrain consistency
    if (environment.terrain === TerrainTypes.UNDERGROUND && environment.lighting === LightingTypes.BRIGHT) {
      warnings.push('Underground areas typically have dim or dark lighting conditions');
    }

    if (environment.terrain === TerrainTypes.URBAN && environment.lighting === LightingTypes.DARK) {
      warnings.push('Urban areas typically have normal or bright lighting conditions');
    }

    // Density and terrain consistency
    if (environment.terrain === TerrainTypes.URBAN && environment.density < 0.4) {
      warnings.push('Urban areas typically have higher population density (> 0.4)');
    }

    if (environment.terrain === TerrainTypes.DESERT && environment.density > 0.3) {
      warnings.push('Desert areas typically have low population density (< 0.3)');
    }

    return warnings;
  }

  /**
   * Validates hazard combinations for potential conflicts or synergies
   * @param {Array} hazards - Array of hazard objects
   * @returns {Array} Array of warning messages
   * @private
   */
  static _validateHazardCombinations(hazards) {
    const warnings = [];

    if (!Array.isArray(hazards) || hazards.length < 2) {
      return warnings;
    }

    // Filter out null/invalid hazards before processing
    const validHazards = hazards.filter(h => h && typeof h === 'object' && h.type);
    if (validHazards.length < 2) {
      return warnings;
    }

    const hazardTypes = validHazards.map(h => h.type);

    // Check for conflicting temperature hazards
    const hasExtremeHeat = hazardTypes.includes(HazardTypes.EXTREME_HEAT);
    const hasExtremeCold = hazardTypes.includes(HazardTypes.EXTREME_COLD);
    if (hasExtremeHeat && hasExtremeCold) {
      warnings.push('Conflicting temperature hazards: extreme heat and extreme cold cannot coexist');
    }

    // Check for too many environmental hazards
    const environmentalHazards = validHazards.filter(h => 
      getHazardCategory(h.type) === 'environmental'
    );
    if (environmentalHazards.length > 3) {
      warnings.push(`High number of environmental hazards (${environmentalHazards.length}) may make the area uninhabitable`);
    }

    // Check for hazard severity combinations
    const totalSeverity = validHazards.reduce((sum, h) => sum + (h.severity || 0), 0);
    if (totalSeverity > 3.0) {
      warnings.push(`Combined hazard severity (${totalSeverity.toFixed(1)}) is extremely high and may be overwhelming`);
    }

    // Check for specific hazard combinations that amplify danger
    if (hazardTypes.includes(HazardTypes.TOXIC_AIR) && hazardTypes.includes(HazardTypes.DISEASE)) {
      warnings.push('Toxic air combined with disease creates an extremely hazardous environment');
    }

    if (hazardTypes.includes(HazardTypes.STRUCTURAL_INSTABILITY) && hazardTypes.includes(HazardTypes.WILD_ANIMALS)) {
      warnings.push('Structural instability with wild animals creates unpredictable dangers');
    }

    // Check for supernatural hazard combinations
    const supernaturalHazards = validHazards.filter(h => 
      getHazardCategory(h.type) === 'supernatural'
    );
    if (supernaturalHazards.length > 1) {
      warnings.push('Multiple supernatural hazards may create unpredictable magical interactions');
    }

    // Check for social hazards in uninhabited areas (low density)
    const socialHazards = validHazards.filter(h => 
      getHazardCategory(h.type) === 'social'
    );
    if (socialHazards.length > 0) {
      warnings.push('Social hazards (like bandits) require sufficient population or traffic to be realistic');
    }

    return warnings;
  }

  /**
   * Validates environmental consistency for a complete node
   * @param {Object} node - Node object with environmental data
   * @param {Object} [options={}] - Validation options
   * @returns {Object} Comprehensive validation result
   */
  static validateNode(node, options = {}) {
    const errors = [];
    const warnings = [];

    if (!node || typeof node !== 'object') {
      return {
        isValid: false,
        errors: ['Node must be a valid object'],
        warnings: []
      };
    }

    // Validate environment if present
    if (node.environment) {
      const envValidation = this.validateEnvironment(node.environment, options);
      errors.push(...envValidation.errors);
      warnings.push(...envValidation.warnings);
    }

    // Validate connections if present
    if (node.connections) {
      const connValidation = this.validateConnections(node.connections, [], options);
      errors.push(...connValidation.errors);
      warnings.push(...connValidation.warnings);
    }

    // Validate size if present
    if (node.size !== undefined) {
      const sizeValidation = this._validateRange(
        'size',
        node.size,
        1,
        10000,
        'Node size must be between 1 and 10000'
      );
      if (!sizeValidation.isValid) {
        errors.push(sizeValidation.error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Gets a summary of validation rules for documentation purposes
   * @returns {Object} Summary of all validation rules
   */
  static getValidationRules() {
    return {
      environment: {
        ranges: {
          density: { min: 0, max: 1 },
          shelterQuality: { min: 0, max: 1 },
          airQuality: { min: 0, max: 1 },
          waterAvailability: { min: 0, max: 1 },
          humidity: { min: 0, max: 1 },
          windStrength: { min: 0, max: 1 },
          temperature: { min: -50, max: 60 }
        },
        enums: {
          terrain: TERRAIN_TYPE_VALUES,
          climate: CLIMATE_TYPE_VALUES,
          lighting: LIGHTING_TYPE_VALUES
        },
        hazards: {
          types: HAZARD_TYPE_VALUES,
          severityRange: { min: 0, max: 1 },
          maxRecommended: 10
        }
      },
      connections: {
        ranges: {
          difficulty: { min: 1, max: 10 },
          distance: { min: 0.1, max: 1000 }
        },
        enums: {
          type: CONNECTION_TYPE_VALUES
        },
        required: ['targetNodeId']
      },
      node: {
        ranges: {
          size: { min: 1, max: 10000 }
        }
      }
    };
  }
}

export default EnvironmentalValidator;