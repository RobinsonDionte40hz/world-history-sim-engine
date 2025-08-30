import {
  ClimateTypes,
  CLIMATE_TYPE_VALUES,
  CLIMATE_DESCRIPTIONS,
  CLIMATE_TEMPERATURE_RANGES,
  isValidClimateType,
  getClimateDescription,
  getDefaultTemperature
} from '../../../shared/constants/ClimateTypes.js';

describe('ClimateTypes', () => {
  describe('ClimateTypes enum', () => {
    test('should contain all expected climate types', () => {
      const expectedTypes = [
        'arctic', 'temperate', 'tropical', 'arid', 'subtropical', 'continental'
      ];
      
      expectedTypes.forEach(type => {
        expect(Object.values(ClimateTypes)).toContain(type);
      });
    });

    test('should have exactly 6 climate types', () => {
      expect(Object.keys(ClimateTypes)).toHaveLength(6);
    });

    test('should have consistent key-value mapping', () => {
      Object.entries(ClimateTypes).forEach(([key, value]) => {
        expect(key.toLowerCase()).toBe(value);
      });
    });
  });

  describe('CLIMATE_TYPE_VALUES', () => {
    test('should contain all climate type values', () => {
      expect(CLIMATE_TYPE_VALUES).toEqual(Object.values(ClimateTypes));
    });

    test('should not contain duplicates', () => {
      const uniqueValues = [...new Set(CLIMATE_TYPE_VALUES)];
      expect(uniqueValues).toHaveLength(CLIMATE_TYPE_VALUES.length);
    });
  });

  describe('CLIMATE_DESCRIPTIONS', () => {
    test('should have descriptions for all climate types', () => {
      CLIMATE_TYPE_VALUES.forEach(climateType => {
        expect(CLIMATE_DESCRIPTIONS[climateType]).toBeDefined();
        expect(typeof CLIMATE_DESCRIPTIONS[climateType]).toBe('string');
        expect(CLIMATE_DESCRIPTIONS[climateType].length).toBeGreaterThan(0);
      });
    });

    test('should not have extra descriptions', () => {
      const descriptionKeys = Object.keys(CLIMATE_DESCRIPTIONS);
      expect(descriptionKeys).toHaveLength(CLIMATE_TYPE_VALUES.length);
      
      descriptionKeys.forEach(key => {
        expect(CLIMATE_TYPE_VALUES).toContain(key);
      });
    });
  });

  describe('CLIMATE_TEMPERATURE_RANGES', () => {
    test('should have temperature ranges for all climate types', () => {
      CLIMATE_TYPE_VALUES.forEach(climateType => {
        const range = CLIMATE_TEMPERATURE_RANGES[climateType];
        expect(range).toBeDefined();
        expect(typeof range.min).toBe('number');
        expect(typeof range.max).toBe('number');
        expect(typeof range.average).toBe('number');
      });
    });

    test('should have logical temperature ranges', () => {
      CLIMATE_TYPE_VALUES.forEach(climateType => {
        const range = CLIMATE_TEMPERATURE_RANGES[climateType];
        expect(range.min).toBeLessThan(range.max);
        expect(range.average).toBeGreaterThanOrEqual(range.min);
        expect(range.average).toBeLessThanOrEqual(range.max);
      });
    });

    test('should have realistic temperature values', () => {
      // Arctic should be coldest
      expect(CLIMATE_TEMPERATURE_RANGES[ClimateTypes.ARCTIC].average).toBeLessThan(0);
      
      // Tropical should be warmest
      expect(CLIMATE_TEMPERATURE_RANGES[ClimateTypes.TROPICAL].average).toBeGreaterThan(20);
      
      // Arid should be hot
      expect(CLIMATE_TEMPERATURE_RANGES[ClimateTypes.ARID].average).toBeGreaterThan(25);
      
      // Temperate should be moderate
      const temperate = CLIMATE_TEMPERATURE_RANGES[ClimateTypes.TEMPERATE];
      expect(temperate.average).toBeGreaterThan(0);
      expect(temperate.average).toBeLessThan(25);
    });
  });

  describe('isValidClimateType', () => {
    test('should return true for valid climate types', () => {
      CLIMATE_TYPE_VALUES.forEach(climateType => {
        expect(isValidClimateType(climateType)).toBe(true);
      });
    });

    test('should return false for invalid climate types', () => {
      const invalidTypes = ['invalid', 'hot', 'cold', '', null, undefined, 123];
      
      invalidTypes.forEach(invalidType => {
        expect(isValidClimateType(invalidType)).toBe(false);
      });
    });

    test('should be case sensitive', () => {
      expect(isValidClimateType('ARCTIC')).toBe(false);
      expect(isValidClimateType('Arctic')).toBe(false);
      expect(isValidClimateType('arctic')).toBe(true);
    });
  });

  describe('getClimateDescription', () => {
    test('should return correct descriptions for valid climate types', () => {
      expect(getClimateDescription(ClimateTypes.ARCTIC)).toBe('Extremely cold with ice and snow year-round');
      expect(getClimateDescription(ClimateTypes.TEMPERATE)).toBe('Moderate temperatures with seasonal variation');
      expect(getClimateDescription(ClimateTypes.TROPICAL)).toBe('Hot and humid with high rainfall');
    });

    test('should return empty string for invalid climate types', () => {
      expect(getClimateDescription('invalid')).toBe('');
      expect(getClimateDescription(null)).toBe('');
      expect(getClimateDescription(undefined)).toBe('');
    });
  });

  describe('getDefaultTemperature', () => {
    test('should return correct temperatures for valid climate types', () => {
      expect(getDefaultTemperature(ClimateTypes.ARCTIC)).toBe(-10);
      expect(getDefaultTemperature(ClimateTypes.TEMPERATE)).toBe(15);
      expect(getDefaultTemperature(ClimateTypes.TROPICAL)).toBe(28);
      expect(getDefaultTemperature(ClimateTypes.ARID)).toBe(35);
    });

    test('should return default temperature for invalid climate types', () => {
      expect(getDefaultTemperature('invalid')).toBe(15);
      expect(getDefaultTemperature(null)).toBe(15);
      expect(getDefaultTemperature(undefined)).toBe(15);
    });
  });

  describe('completeness validation', () => {
    test('should have all required climate types from requirements', () => {
      // Based on requirements 1.4 - climate options should include major climate types
      const requiredTypes = ['arctic', 'temperate', 'tropical', 'arid'];
      
      requiredTypes.forEach(type => {
        expect(CLIMATE_TYPE_VALUES).toContain(type);
      });
    });

    test('should maintain data consistency across all related objects', () => {
      // All climate types should have corresponding data in all related objects
      CLIMATE_TYPE_VALUES.forEach(climateType => {
        expect(CLIMATE_DESCRIPTIONS[climateType]).toBeDefined();
        expect(CLIMATE_TEMPERATURE_RANGES[climateType]).toBeDefined();
      });
    });
  });
});