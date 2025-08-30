/**
 * Environmental Types - Central export for all environmental enums and constants
 * This file provides a single import point for all environmental type definitions
 */

// Export all terrain types
// Import individual validation functions and constants for internal use
import { isValidTerrainType, TERRAIN_TYPE_VALUES } from './TerrainTypes.js';
import { isValidClimateType, CLIMATE_TYPE_VALUES } from './ClimateTypes.js';
import { isValidLightingType, LIGHTING_TYPE_VALUES } from './LightingTypes.js';
import { isValidConnectionType, CONNECTION_TYPE_VALUES } from './ConnectionTypes.js';
import { isValidHazardType, HAZARD_TYPE_VALUES } from './HazardTypes.js';

export {
  TerrainTypes,
  TERRAIN_TYPE_VALUES,
  TERRAIN_DESCRIPTIONS,
  isValidTerrainType,
  getTerrainDescription
} from './TerrainTypes.js';

// Export all climate types
export {
  ClimateTypes,
  CLIMATE_TYPE_VALUES,
  CLIMATE_DESCRIPTIONS,
  CLIMATE_TEMPERATURE_RANGES,
  isValidClimateType,
  getClimateDescription,
  getDefaultTemperature
} from './ClimateTypes.js';

// Export all lighting types
export {
  LightingTypes,
  LIGHTING_TYPE_VALUES,
  LIGHTING_DESCRIPTIONS,
  LIGHTING_INTENSITY,
  LIGHTING_VISIBILITY_MODIFIERS,
  LIGHTING_STEALTH_MODIFIERS,
  isValidLightingType,
  getLightingDescription,
  getLightingIntensity
} from './LightingTypes.js';

// Export all connection types
export {
  ConnectionTypes,
  CONNECTION_TYPE_VALUES,
  CONNECTION_DESCRIPTIONS,
  CONNECTION_BASE_DIFFICULTY,
  CONNECTION_TIME_MULTIPLIERS,
  CONNECTION_SAFETY_MODIFIERS,
  isValidConnectionType,
  getConnectionDescription,
  getConnectionBaseDifficulty
} from './ConnectionTypes.js';

// Export all hazard types
export {
  HazardTypes,
  HAZARD_TYPE_VALUES,
  HAZARD_DESCRIPTIONS,
  HAZARD_CATEGORIES,
  HAZARD_BASE_DANGER,
  HAZARD_ATTRIBUTE_MODIFIERS,
  isValidHazardType,
  getHazardDescription,
  getHazardBaseDanger,
  getHazardCategory
} from './HazardTypes.js';

/**
 * Validates if a value is a valid environmental type of any category
 * @param {string} value - The value to validate
 * @param {string} category - The category to validate against ('terrain', 'climate', 'lighting', 'connection', 'hazard')
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidEnvironmentalType = (value, category) => {
  switch (category) {
    case 'terrain':
      return isValidTerrainType(value);
    case 'climate':
      return isValidClimateType(value);
    case 'lighting':
      return isValidLightingType(value);
    case 'connection':
      return isValidConnectionType(value);
    case 'hazard':
      return isValidHazardType(value);
    default:
      return false;
  }
};

/**
 * Gets all environmental type values for a specific category
 * @param {string} category - The category to get values for
 * @returns {string[]} Array of values or empty array if invalid category
 */
export const getEnvironmentalTypeValues = (category) => {
  switch (category) {
    case 'terrain':
      return TERRAIN_TYPE_VALUES;
    case 'climate':
      return CLIMATE_TYPE_VALUES;
    case 'lighting':
      return LIGHTING_TYPE_VALUES;
    case 'connection':
      return CONNECTION_TYPE_VALUES;
    case 'hazard':
      return HAZARD_TYPE_VALUES;
    default:
      return [];
  }
};