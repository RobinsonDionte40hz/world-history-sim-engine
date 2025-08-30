// src/domain/value-objects/Environment.js

import BaseValueObject from './BaseValueObject.js';
import { ValidationError } from '../../shared/types/ValueObjectTypes.js';
import { TerrainTypes, isValidTerrainType } from '../../shared/constants/TerrainTypes.js';
import { ClimateTypes, isValidClimateType, getDefaultTemperature } from '../../shared/constants/ClimateTypes.js';
import { LightingTypes, isValidLightingType } from '../../shared/constants/LightingTypes.js';
import { getHazardBaseDanger } from '../../shared/constants/HazardTypes.js';
import EnvironmentalHazard from '../entities/EnvironmentalHazard.js';

/**
 * Environment value object encapsulates all environmental properties for a node
 * This is an immutable value object that represents the environmental context
 * where character interactions occur.
 */
class Environment extends BaseValueObject {
  /**
   * Creates a new Environment instance
   * @param {Object} config - Configuration object
   * @param {number} [config.density=0.5] - Population/object density (0.0 to 1.0)
   * @param {string} [config.terrain=TerrainTypes.PLAINS] - Terrain type
   * @param {string} [config.climate=ClimateTypes.TEMPERATE] - Climate type
   * @param {string} [config.lighting=LightingTypes.NORMAL] - Lighting conditions
   * @param {Array<EnvironmentalHazard>} [config.hazards=[]] - Environmental hazards
   * @param {number} [config.shelterQuality=0.5] - Quality of available shelter (0.0 to 1.0)
   * @param {number} [config.airQuality=0.8] - Air quality (0.0 to 1.0)
   * @param {number} [config.waterAvailability=0.7] - Water availability (0.0 to 1.0)
   * @param {number} [config.temperature] - Temperature in Celsius (auto-calculated from climate if not provided)
   * @param {number} [config.humidity=0.5] - Humidity level (0.0 to 1.0)
   * @param {number} [config.windStrength=0.3] - Wind strength (0.0 to 1.0)
   */
  constructor(config = {}) {
    super();

    // Validate and set density
    this.density = this._validateRange('density', config.density, 0, 1, 0.5);

    // Validate and set terrain
    this.terrain = this._validateTerrain(config.terrain);

    // Validate and set climate
    this.climate = this._validateClimate(config.climate);

    // Validate and set lighting
    this.lighting = this._validateLighting(config.lighting);

    // Validate and set hazards
    this.hazards = this._validateHazards(config.hazards);

    // Validate and set shelter quality
    this.shelterQuality = this._validateRange('shelterQuality', config.shelterQuality, 0, 1, 0.5);

    // Validate and set air quality
    this.airQuality = this._validateRange('airQuality', config.airQuality, 0, 1, 0.8);

    // Validate and set water availability
    this.waterAvailability = this._validateRange('waterAvailability', config.waterAvailability, 0, 1, 0.7);

    // Set temperature (use provided or calculate default from climate)
    this.temperature = config.temperature !== undefined ? 
      this._validateTemperature(config.temperature) : 
      this._getDefaultTemperature();

    // Validate and set humidity
    this.humidity = this._validateRange('humidity', config.humidity, 0, 1, 0.5);

    // Validate and set wind strength
    this.windStrength = this._validateRange('windStrength', config.windStrength, 0, 1, 0.3);

    // Freeze the object to ensure immutability
    this.freeze();
  }

  /**
   * Validates a numeric value within a range, providing a default if invalid
   * @param {string} fieldName - Name of the field for error reporting
   * @param {*} value - Value to validate
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @param {number} defaultValue - Default value if validation fails
   * @returns {number} Validated value
   * @private
   */
  _validateRange(fieldName, value, min, max, defaultValue) {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value) || value < min || value > max) {
      return defaultValue;
    }
    return value;
  }

  /**
   * Validates terrain type
   * @param {string} terrain - Terrain type to validate
   * @returns {string} Valid terrain type
   * @private
   */
  _validateTerrain(terrain) {
    if (!terrain || !isValidTerrainType(terrain)) {
      return TerrainTypes.PLAINS;
    }
    return terrain;
  }

  /**
   * Validates climate type
   * @param {string} climate - Climate type to validate
   * @returns {string} Valid climate type
   * @private
   */
  _validateClimate(climate) {
    if (!climate || !isValidClimateType(climate)) {
      return ClimateTypes.TEMPERATE;
    }
    return climate;
  }

  /**
   * Validates lighting type
   * @param {string} lighting - Lighting type to validate
   * @returns {string} Valid lighting type
   * @private
   */
  _validateLighting(lighting) {
    if (!lighting || !isValidLightingType(lighting)) {
      return LightingTypes.NORMAL;
    }
    return lighting;
  }

  /**
   * Validates temperature value
   * @param {number} temperature - Temperature to validate
   * @returns {number} Valid temperature
   * @private
   */
  _validateTemperature(temperature) {
    if (typeof temperature !== 'number' || isNaN(temperature) || !isFinite(temperature) || temperature < -50 || temperature > 60) {
      return this._getDefaultTemperature();
    }
    return temperature;
  }

  /**
   * Validates hazards array
   * @param {Array} hazards - Hazards array to validate
   * @returns {Array<EnvironmentalHazard>} Valid hazards array
   * @private
   */
  _validateHazards(hazards) {
    if (!Array.isArray(hazards)) {
      return [];
    }
    
    return hazards
      .filter(hazard => hazard instanceof EnvironmentalHazard)
      .slice(0, 10); // Limit to 10 hazards for performance
  }

  /**
   * Gets the default temperature for the current climate
   * @returns {number} Default temperature
   * @private
   */
  _getDefaultTemperature() {
    return getDefaultTemperature(this.climate);
  }

  /**
   * Gets the base danger for a hazard type (avoiding caching issues)
   * @param {string} hazardType - The hazard type
   * @returns {number} Base danger value
   * @private
   */
  _getHazardBaseDanger(hazardType) {
    return getHazardBaseDanger(hazardType);
  }

  /**
   * Determines if the environment is hospitable for characters
   * @returns {boolean} True if environment is hospitable
   */
  isHospitable() {
    return this.shelterQuality > 0.3 && 
           this.airQuality > 0.4 && 
           this.waterAvailability > 0.3;
  }

  /**
   * Calculates the overall comfort level of the environment
   * @returns {number} Comfort level from 0.0 to 1.0
   */
  getComfortLevel() {
    const baseComfort = (this.shelterQuality + this.airQuality + this.waterAvailability) / 3;
    
    // Adjust for hazards
    const hazardPenalty = Math.min(0.5, this.hazards.length * 0.05);
    
    // Adjust for extreme temperatures
    let temperaturePenalty = 0;
    if (this.temperature < -20 || this.temperature > 45) {
      temperaturePenalty = 0.2;
    } else if (this.temperature < -10 || this.temperature > 35) {
      temperaturePenalty = 0.1;
    }
    
    return Math.max(0, baseComfort - hazardPenalty - temperaturePenalty);
  }

  /**
   * Checks if the environment has a specific hazard type
   * @param {string} hazardType - The hazard type to check for
   * @returns {boolean} True if hazard type is present
   */
  hasHazardType(hazardType) {
    return this.hazards.some(hazard => hazard.type === hazardType);
  }

  /**
   * Gets all hazards of a specific type
   * @param {string} hazardType - The hazard type to filter by
   * @returns {Array<EnvironmentalHazard>} Array of matching hazards
   */
  getHazardsByType(hazardType) {
    return this.hazards.filter(hazard => hazard.type === hazardType);
  }

  /**
   * Calculates the total danger level from all hazards
   * @returns {number} Total hazard danger level (0.0 to 1.0)
   */
  getTotalHazardDanger() {
    const totalDanger = this.hazards.reduce((sum, hazard) => {
      // Calculate danger directly to avoid caching issues with frozen objects
      const baseDanger = this._getHazardBaseDanger(hazard.type);
      const effectiveDanger = Math.min(1.0, baseDanger * hazard.severity);
      return sum + effectiveDanger;
    }, 0);
    
    return Math.min(1.0, totalDanger);
  }

  /**
   * Gets the most dangerous hazard in the environment
   * @returns {EnvironmentalHazard|null} The most dangerous hazard or null if none
   */
  getMostDangerousHazard() {
    if (this.hazards.length === 0) {
      return null;
    }
    
    return this.hazards.reduce((mostDangerous, current) => {
      const currentDanger = this._getHazardBaseDanger(current.type) * current.severity;
      const mostDangerousDanger = this._getHazardBaseDanger(mostDangerous.type) * mostDangerous.severity;
      return currentDanger > mostDangerousDanger ? current : mostDangerous;
    });
  }

  /**
   * Determines if the environment is considered dangerous
   * @returns {boolean} True if environment is dangerous
   */
  isDangerous() {
    return this.getTotalHazardDanger() > 0.3 || 
           !this.isHospitable() ||
           this.temperature < -15 || 
           this.temperature > 40;
  }

  /**
   * Gets environmental factors that affect visibility
   * @returns {number} Visibility modifier (0.0 to 2.0, where 1.0 is normal)
   */
  getVisibilityModifier() {
    let modifier = 1.0;
    
    // Lighting affects visibility
    switch (this.lighting) {
      case LightingTypes.BRIGHT:
        modifier *= 1.3;
        break;
      case LightingTypes.DIM:
        modifier *= 0.8;
        break;
      case LightingTypes.DARK:
        modifier *= 0.4;
        break;
      case LightingTypes.MAGICAL:
        modifier *= 1.1;
        break;
    }
    
    // Weather conditions affect visibility
    if (this.humidity > 0.8) {
      modifier *= 0.9; // High humidity reduces visibility
    }
    
    if (this.windStrength > 0.7) {
      modifier *= 0.95; // Strong winds can reduce visibility
    }
    
    return Math.max(0.1, Math.min(2.0, modifier));
  }

  /**
   * Gets environmental factors that affect movement
   * @returns {number} Movement modifier (0.0 to 2.0, where 1.0 is normal)
   */
  getMovementModifier() {
    let modifier = 1.0;
    
    // Terrain affects movement
    switch (this.terrain) {
      case TerrainTypes.PLAINS:
        modifier *= 1.2;
        break;
      case TerrainTypes.FOREST:
        modifier *= 0.8;
        break;
      case TerrainTypes.MOUNTAINS:
        modifier *= 0.6;
        break;
      case TerrainTypes.DESERT:
        modifier *= 0.7;
        break;
      case TerrainTypes.SWAMP:
        modifier *= 0.5;
        break;
      case TerrainTypes.URBAN:
        modifier *= 1.0;
        break;
    }
    
    // Density affects movement
    if (this.density > 0.8) {
      modifier *= 0.8; // High density slows movement
    }
    
    return Math.max(0.1, Math.min(2.0, modifier));
  }

  /**
   * Determines if the environment supports a specific activity type
   * @param {string} activityType - Type of activity (e.g., 'stealth', 'combat', 'social')
   * @returns {boolean} True if environment supports the activity
   */
  supportsActivity(activityType) {
    switch (activityType) {
      case 'stealth':
        return this.lighting !== LightingTypes.BRIGHT && 
               (this.terrain === TerrainTypes.FOREST || 
                this.terrain === TerrainTypes.URBAN ||
                this.density > 0.5);
      
      case 'combat':
        return this.shelterQuality < 0.8; // Open areas better for combat
      
      case 'social':
        return this.terrain === TerrainTypes.URBAN || 
               this.density > 0.4;
      
      case 'survival':
        return this.waterAvailability > 0.3 && 
               this.airQuality > 0.4;
      
      default:
        return true;
    }
  }

  /**
   * Creates a copy of this environment with modified properties
   * @param {Object} modifications - Properties to modify
   * @returns {Environment} New environment instance with modifications
   */
  withModifications(modifications) {
    const currentData = this.toJSON();
    return Environment.fromJSON({ ...currentData, ...modifications });
  }

  /**
   * Serializes the environment to JSON
   * @returns {Object} JSON representation of the environment
   */
  toJSON() {
    return {
      density: this.density,
      terrain: this.terrain,
      climate: this.climate,
      lighting: this.lighting,
      hazards: this.hazards.map(hazard => hazard.toJSON()),
      shelterQuality: this.shelterQuality,
      airQuality: this.airQuality,
      waterAvailability: this.waterAvailability,
      temperature: this.temperature,
      humidity: this.humidity,
      windStrength: this.windStrength
    };
  }

  /**
   * Creates an Environment from JSON data
   * @param {Object} data - JSON data to deserialize
   * @returns {Environment} New environment instance
   * @static
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('data', data, 'Invalid JSON data for Environment');
    }

    // Convert hazard data back to EnvironmentalHazard instances
    const hazards = Array.isArray(data.hazards) ? 
      data.hazards.map(hazardData => EnvironmentalHazard.fromJSON(hazardData)) : 
      [];

    return new Environment({
      density: data.density,
      terrain: data.terrain,
      climate: data.climate,
      lighting: data.lighting,
      hazards: hazards,
      shelterQuality: data.shelterQuality,
      airQuality: data.airQuality,
      waterAvailability: data.waterAvailability,
      temperature: data.temperature,
      humidity: data.humidity,
      windStrength: data.windStrength
    });
  }

  /**
   * Creates a default environment suitable for most scenarios
   * @returns {Environment} Default environment instance
   * @static
   */
  static createDefault() {
    return new Environment({
      density: 0.5,
      terrain: TerrainTypes.PLAINS,
      climate: ClimateTypes.TEMPERATE,
      lighting: LightingTypes.NORMAL,
      hazards: [],
      shelterQuality: 0.5,
      airQuality: 0.8,
      waterAvailability: 0.7,
      humidity: 0.5,
      windStrength: 0.3
    });
  }

  /**
   * Creates a hostile environment with multiple hazards
   * @returns {Environment} Hostile environment instance
   * @static
   */
  static createHostile() {
    return new Environment({
      density: 0.2,
      terrain: TerrainTypes.DESERT,
      climate: ClimateTypes.ARID,
      lighting: LightingTypes.DIM,
      hazards: [],
      shelterQuality: 0.2,
      airQuality: 0.5,
      waterAvailability: 0.2,
      humidity: 0.1,
      windStrength: 0.7
    });
  }

  /**
   * Creates a comfortable, safe environment
   * @returns {Environment} Safe environment instance
   * @static
   */
  static createSafe() {
    return new Environment({
      density: 0.6,
      terrain: TerrainTypes.URBAN,
      climate: ClimateTypes.TEMPERATE,
      lighting: LightingTypes.BRIGHT,
      hazards: [],
      shelterQuality: 0.9,
      airQuality: 0.9,
      waterAvailability: 0.9,
      humidity: 0.5,
      windStrength: 0.2
    });
  }
}

export default Environment;