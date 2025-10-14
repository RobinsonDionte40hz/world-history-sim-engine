const LightingTypes = {
  BRIGHT: 'bright',
  NORMAL: 'normal',
  DIM: 'dim',
  DARK: 'dark',
  MAGICAL: 'magical'
};

/**
 * Array of all lighting type values for validation and iteration
 */
const LIGHTING_TYPE_VALUES = Object.values(LightingTypes);

/**
 * Lighting type descriptions for UI display
 */
const LIGHTING_DESCRIPTIONS = {
  [LightingTypes.BRIGHT]: 'Well-lit with abundant natural or artificial light',
  [LightingTypes.NORMAL]: 'Standard lighting conditions',
  [LightingTypes.DIM]: 'Low light with shadows and reduced visibility',
  [LightingTypes.DARK]: 'Very dark with minimal or no light sources',
  [LightingTypes.MAGICAL]: 'Illuminated by magical or supernatural sources'
};

/**
 * Lighting intensity values (0.0 to 1.0) for calculations
 */
const LIGHTING_INTENSITY = {
  [LightingTypes.BRIGHT]: 1.0,
  [LightingTypes.NORMAL]: 0.7,
  [LightingTypes.DIM]: 0.4,
  [LightingTypes.DARK]: 0.1,
  [LightingTypes.MAGICAL]: 0.8
};

/**
 * Visibility modifiers for different lighting conditions
 */
const LIGHTING_VISIBILITY_MODIFIERS = {
  [LightingTypes.BRIGHT]: 1.3,
  [LightingTypes.NORMAL]: 1.0,
  [LightingTypes.DIM]: 0.8,
  [LightingTypes.DARK]: 0.4,
  [LightingTypes.MAGICAL]: 1.1
};

/**
 * Stealth modifiers for different lighting conditions
 */
const LIGHTING_STEALTH_MODIFIERS = {
  [LightingTypes.BRIGHT]: 0.7,
  [LightingTypes.NORMAL]: 1.0,
  [LightingTypes.DIM]: 1.2,
  [LightingTypes.DARK]: 1.5,
  [LightingTypes.MAGICAL]: 0.9
};

/**
 * Validates if a given value is a valid lighting type
 * @param {string} lightingType - The lighting type to validate
 * @returns {boolean} True if valid, false otherwise
 */
const isValidLightingType = (lightingType) => {
  return LIGHTING_TYPE_VALUES.includes(lightingType);
};

/**
 * Gets the description for a lighting type
 * @param {string} lightingType - The lighting type
 * @returns {string} The description or empty string if invalid
 */
const getLightingDescription = (lightingType) => {
  return LIGHTING_DESCRIPTIONS[lightingType] || '';
};

/**
 * Gets the intensity value for a lighting type
 * @param {string} lightingType - The lighting type
 * @returns {number} The intensity value (0.0-1.0) or 0.7 if invalid
 */
const getLightingIntensity = (lightingType) => {
  return LIGHTING_INTENSITY[lightingType] || 0.7;
};

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
};