/**
 * Climate type constants for environmental system
 * Defines all available climate types for nodes
 */
const ClimateTypes = {
  ARCTIC: 'arctic',
  TEMPERATE: 'temperate',
  TROPICAL: 'tropical',
  ARID: 'arid',
  SUBTROPICAL: 'subtropical',
  CONTINENTAL: 'continental'
};

/**
 * Array of all climate type values for validation and iteration
 */
const CLIMATE_TYPE_VALUES = Object.values(ClimateTypes);

/**
 * Climate type descriptions for UI display
 */
const CLIMATE_DESCRIPTIONS = {
  [ClimateTypes.ARCTIC]: 'Extremely cold with ice and snow year-round',
  [ClimateTypes.TEMPERATE]: 'Moderate temperatures with seasonal variation',
  [ClimateTypes.TROPICAL]: 'Hot and humid with high rainfall',
  [ClimateTypes.ARID]: 'Hot and dry with minimal precipitation',
  [ClimateTypes.SUBTROPICAL]: 'Warm with mild winters and hot summers',
  [ClimateTypes.CONTINENTAL]: 'Large temperature variations between seasons'
};

/**
 * Default temperature ranges for each climate type (in Celsius)
 */
const CLIMATE_TEMPERATURE_RANGES = {
  [ClimateTypes.ARCTIC]: { min: -30, max: -5, average: -10 },
  [ClimateTypes.TEMPERATE]: { min: 5, max: 25, average: 15 },
  [ClimateTypes.TROPICAL]: { min: 20, max: 35, average: 28 },
  [ClimateTypes.ARID]: { min: 15, max: 45, average: 35 },
  [ClimateTypes.SUBTROPICAL]: { min: 10, max: 30, average: 22 },
  [ClimateTypes.CONTINENTAL]: { min: -15, max: 30, average: 8 }
};

/**
 * Validates if a given value is a valid climate type
 * @param {string} climateType - The climate type to validate
 * @returns {boolean} True if valid, false otherwise
 */
const isValidClimateType = (climateType) => {
  return CLIMATE_TYPE_VALUES.includes(climateType);
};

/**
 * Gets the description for a climate type
 * @param {string} climateType - The climate type
 * @returns {string} The description or empty string if invalid
 */
const getClimateDescription = (climateType) => {
  return CLIMATE_DESCRIPTIONS[climateType] || '';
};

/**
 * Gets the default temperature for a climate type
 * @param {string} climateType - The climate type
 * @returns {number} The average temperature or 15 if invalid
 */
const getDefaultTemperature = (climateType) => {
  const range = CLIMATE_TEMPERATURE_RANGES[climateType];
  return range ? range.average : 15;
};

export {
  ClimateTypes,
  CLIMATE_TYPE_VALUES,
  CLIMATE_DESCRIPTIONS,
  CLIMATE_TEMPERATURE_RANGES,
  isValidClimateType,
  getClimateDescription,
  getDefaultTemperature
};