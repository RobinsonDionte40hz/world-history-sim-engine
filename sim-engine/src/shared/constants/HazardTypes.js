const HazardTypes = {
  EXTREME_HEAT: 'extreme_heat',
  EXTREME_COLD: 'extreme_cold',
  TOXIC_AIR: 'toxic_air',
  RADIATION: 'radiation',
  SUPERNATURAL: 'supernatural',
  WILD_ANIMALS: 'wild_animals',
  BANDITS: 'bandits',
  DISEASE: 'disease',
  ALTITUDE: 'altitude',
  STRUCTURAL_INSTABILITY: 'structural_instability'
};

/**
 * Array of all hazard type values for validation and iteration
 */
const HAZARD_TYPE_VALUES = Object.values(HazardTypes);

/**
 * Hazard type descriptions for UI display
 */
const HAZARD_DESCRIPTIONS = {
  [HazardTypes.EXTREME_HEAT]: 'Dangerously high temperatures that can cause heat exhaustion',
  [HazardTypes.EXTREME_COLD]: 'Freezing conditions that risk hypothermia and frostbite',
  [HazardTypes.TOXIC_AIR]: 'Poisonous gases or polluted atmosphere',
  [HazardTypes.RADIATION]: 'Harmful energy emissions from magical or technological sources',
  [HazardTypes.SUPERNATURAL]: 'Otherworldly forces and paranormal phenomena',
  [HazardTypes.WILD_ANIMALS]: 'Dangerous creatures that may attack travelers',
  [HazardTypes.BANDITS]: 'Criminal groups that prey on travelers and merchants',
  [HazardTypes.DISEASE]: 'Infectious ailments that spread through the area',
  [HazardTypes.ALTITUDE]: 'High elevation effects including thin air and vertigo',
  [HazardTypes.STRUCTURAL_INSTABILITY]: 'Unstable buildings or terrain prone to collapse'
};

/**
 * Hazard categories for grouping and filtering
 */
const HAZARD_CATEGORIES = {
  ENVIRONMENTAL: [
    HazardTypes.EXTREME_HEAT,
    HazardTypes.EXTREME_COLD,
    HazardTypes.TOXIC_AIR,
    HazardTypes.ALTITUDE
  ],
  SUPERNATURAL: [
    HazardTypes.RADIATION,
    HazardTypes.SUPERNATURAL
  ],
  BIOLOGICAL: [
    HazardTypes.WILD_ANIMALS,
    HazardTypes.DISEASE
  ],
  SOCIAL: [
    HazardTypes.BANDITS
  ],
  STRUCTURAL: [
    HazardTypes.STRUCTURAL_INSTABILITY
  ]
};

/**
 * Base danger contribution for each hazard type (0.0 to 1.0)
 */
const HAZARD_BASE_DANGER = {
  [HazardTypes.EXTREME_HEAT]: 0.3,
  [HazardTypes.EXTREME_COLD]: 0.3,
  [HazardTypes.TOXIC_AIR]: 0.4,
  [HazardTypes.RADIATION]: 0.5,
  [HazardTypes.SUPERNATURAL]: 0.6,
  [HazardTypes.WILD_ANIMALS]: 0.4,
  [HazardTypes.BANDITS]: 0.5,
  [HazardTypes.DISEASE]: 0.3,
  [HazardTypes.ALTITUDE]: 0.2,
  [HazardTypes.STRUCTURAL_INSTABILITY]: 0.4
};

/**
 * Attribute modifiers applied by each hazard type
 */
const HAZARD_ATTRIBUTE_MODIFIERS = {
  [HazardTypes.EXTREME_HEAT]: { constitution: -2, endurance: -3 },
  [HazardTypes.EXTREME_COLD]: { constitution: -2, dexterity: -1 },
  [HazardTypes.TOXIC_AIR]: { constitution: -3, perception: -1 },
  [HazardTypes.RADIATION]: { constitution: -4, intelligence: -1 },
  [HazardTypes.SUPERNATURAL]: { wisdom: -2, sanity: -3 },
  [HazardTypes.WILD_ANIMALS]: { stealth: -2, survival: +1 },
  [HazardTypes.BANDITS]: { alertness: +1, trust: -2 },
  [HazardTypes.DISEASE]: { constitution: -3, social: -1 },
  [HazardTypes.ALTITUDE]: { constitution: -1, endurance: -2 },
  [HazardTypes.STRUCTURAL_INSTABILITY]: { alertness: +1, movement: -1 }
};

/**
 * Validates if a given value is a valid hazard type
 * @param {string} hazardType - The hazard type to validate
 * @returns {boolean} True if valid, false otherwise
 */
const isValidHazardType = (hazardType) => {
  return HAZARD_TYPE_VALUES.includes(hazardType);
};

/**
 * Gets the description for a hazard type
 * @param {string} hazardType - The hazard type
 * @returns {string} The description or empty string if invalid
 */
const getHazardDescription = (hazardType) => {
  return HAZARD_DESCRIPTIONS[hazardType] || '';
};

/**
 * Gets the base danger value for a hazard type
 * @param {string} hazardType - The hazard type
 * @returns {number} The base danger value (0.0-1.0) or 0.1 if invalid
 */
const getHazardBaseDanger = (hazardType) => {
  return HAZARD_BASE_DANGER[hazardType] || 0.1;
};

/**
 * Gets the category for a hazard type
 * @param {string} hazardType - The hazard type
 * @returns {string} The category name or 'unknown' if not found
 */
const getHazardCategory = (hazardType) => {
  for (const [category, hazards] of Object.entries(HAZARD_CATEGORIES)) {
    if (hazards.includes(hazardType)) {
      return category.toLowerCase();
    }
  }
  return 'unknown';
};

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
};