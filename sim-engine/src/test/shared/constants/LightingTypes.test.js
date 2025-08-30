import {
  LightingTypes,
  LIGHTING_TYPE_VALUES,
  LIGHTING_DESCRIPTIONS,
  LIGHTING_INTENSITY,
  LIGHTING_VISIBILITY_MODIFIERS,
  LIGHTING_STEALTH_MODIFIERS,
  isValidLightingType,
  getLightingDescription,
  getLightingIntensity
} from '../../../shared/constants/LightingTypes.js';

describe('LightingTypes', () => {
  describe('LightingTypes enum', () => {
    test('should contain all expected lighting types', () => {
      const expectedTypes = ['bright', 'normal', 'dim', 'dark', 'magical'];
      
      expectedTypes.forEach(type => {
        expect(Object.values(LightingTypes)).toContain(type);
      });
    });

    test('should have exactly 5 lighting types', () => {
      expect(Object.keys(LightingTypes)).toHaveLength(5);
    });

    test('should have consistent key-value mapping', () => {
      Object.entries(LightingTypes).forEach(([key, value]) => {
        expect(key.toLowerCase()).toBe(value);
      });
    });
  });

  describe('LIGHTING_TYPE_VALUES', () => {
    test('should contain all lighting type values', () => {
      expect(LIGHTING_TYPE_VALUES).toEqual(Object.values(LightingTypes));
    });

    test('should not contain duplicates', () => {
      const uniqueValues = [...new Set(LIGHTING_TYPE_VALUES)];
      expect(uniqueValues).toHaveLength(LIGHTING_TYPE_VALUES.length);
    });
  });

  describe('LIGHTING_DESCRIPTIONS', () => {
    test('should have descriptions for all lighting types', () => {
      LIGHTING_TYPE_VALUES.forEach(lightingType => {
        expect(LIGHTING_DESCRIPTIONS[lightingType]).toBeDefined();
        expect(typeof LIGHTING_DESCRIPTIONS[lightingType]).toBe('string');
        expect(LIGHTING_DESCRIPTIONS[lightingType].length).toBeGreaterThan(0);
      });
    });

    test('should not have extra descriptions', () => {
      const descriptionKeys = Object.keys(LIGHTING_DESCRIPTIONS);
      expect(descriptionKeys).toHaveLength(LIGHTING_TYPE_VALUES.length);
      
      descriptionKeys.forEach(key => {
        expect(LIGHTING_TYPE_VALUES).toContain(key);
      });
    });
  });

  describe('LIGHTING_INTENSITY', () => {
    test('should have intensity values for all lighting types', () => {
      LIGHTING_TYPE_VALUES.forEach(lightingType => {
        const intensity = LIGHTING_INTENSITY[lightingType];
        expect(intensity).toBeDefined();
        expect(typeof intensity).toBe('number');
        expect(intensity).toBeGreaterThanOrEqual(0);
        expect(intensity).toBeLessThanOrEqual(1);
      });
    });

    test('should have logical intensity ordering', () => {
      // Bright should have highest intensity
      expect(LIGHTING_INTENSITY[LightingTypes.BRIGHT]).toBe(1.0);
      
      // Dark should have lowest intensity
      expect(LIGHTING_INTENSITY[LightingTypes.DARK]).toBeLessThan(0.2);
      
      // Normal should be moderate
      expect(LIGHTING_INTENSITY[LightingTypes.NORMAL]).toBeGreaterThan(0.5);
      expect(LIGHTING_INTENSITY[LightingTypes.NORMAL]).toBeLessThan(1.0);
      
      // Dim should be between dark and normal
      expect(LIGHTING_INTENSITY[LightingTypes.DIM]).toBeGreaterThan(LIGHTING_INTENSITY[LightingTypes.DARK]);
      expect(LIGHTING_INTENSITY[LightingTypes.DIM]).toBeLessThan(LIGHTING_INTENSITY[LightingTypes.NORMAL]);
    });
  });

  describe('LIGHTING_VISIBILITY_MODIFIERS', () => {
    test('should have visibility modifiers for all lighting types', () => {
      LIGHTING_TYPE_VALUES.forEach(lightingType => {
        const modifier = LIGHTING_VISIBILITY_MODIFIERS[lightingType];
        expect(modifier).toBeDefined();
        expect(typeof modifier).toBe('number');
        expect(modifier).toBeGreaterThan(0);
      });
    });

    test('should have logical visibility modifiers', () => {
      // Bright should increase visibility
      expect(LIGHTING_VISIBILITY_MODIFIERS[LightingTypes.BRIGHT]).toBeGreaterThan(1.0);
      
      // Dark should decrease visibility significantly
      expect(LIGHTING_VISIBILITY_MODIFIERS[LightingTypes.DARK]).toBeLessThan(0.5);
      
      // Normal should be baseline
      expect(LIGHTING_VISIBILITY_MODIFIERS[LightingTypes.NORMAL]).toBe(1.0);
      
      // Dim should decrease visibility moderately
      expect(LIGHTING_VISIBILITY_MODIFIERS[LightingTypes.DIM]).toBeLessThan(1.0);
      expect(LIGHTING_VISIBILITY_MODIFIERS[LightingTypes.DIM]).toBeGreaterThan(LIGHTING_VISIBILITY_MODIFIERS[LightingTypes.DARK]);
    });
  });

  describe('LIGHTING_STEALTH_MODIFIERS', () => {
    test('should have stealth modifiers for all lighting types', () => {
      LIGHTING_TYPE_VALUES.forEach(lightingType => {
        const modifier = LIGHTING_STEALTH_MODIFIERS[lightingType];
        expect(modifier).toBeDefined();
        expect(typeof modifier).toBe('number');
        expect(modifier).toBeGreaterThan(0);
      });
    });

    test('should have logical stealth modifiers', () => {
      // Dark should provide best stealth bonus
      expect(LIGHTING_STEALTH_MODIFIERS[LightingTypes.DARK]).toBeGreaterThan(1.0);
      
      // Bright should penalize stealth
      expect(LIGHTING_STEALTH_MODIFIERS[LightingTypes.BRIGHT]).toBeLessThan(1.0);
      
      // Normal should be baseline
      expect(LIGHTING_STEALTH_MODIFIERS[LightingTypes.NORMAL]).toBe(1.0);
      
      // Stealth and visibility should generally be inversely related
      expect(LIGHTING_STEALTH_MODIFIERS[LightingTypes.BRIGHT]).toBeLessThan(LIGHTING_STEALTH_MODIFIERS[LightingTypes.DARK]);
    });
  });

  describe('isValidLightingType', () => {
    test('should return true for valid lighting types', () => {
      LIGHTING_TYPE_VALUES.forEach(lightingType => {
        expect(isValidLightingType(lightingType)).toBe(true);
      });
    });

    test('should return false for invalid lighting types', () => {
      const invalidTypes = ['invalid', 'twilight', 'noon', '', null, undefined, 123];
      
      invalidTypes.forEach(invalidType => {
        expect(isValidLightingType(invalidType)).toBe(false);
      });
    });

    test('should be case sensitive', () => {
      expect(isValidLightingType('BRIGHT')).toBe(false);
      expect(isValidLightingType('Bright')).toBe(false);
      expect(isValidLightingType('bright')).toBe(true);
    });
  });

  describe('getLightingDescription', () => {
    test('should return correct descriptions for valid lighting types', () => {
      expect(getLightingDescription(LightingTypes.BRIGHT)).toBe('Well-lit with abundant natural or artificial light');
      expect(getLightingDescription(LightingTypes.NORMAL)).toBe('Standard lighting conditions');
      expect(getLightingDescription(LightingTypes.DIM)).toBe('Low light with shadows and reduced visibility');
    });

    test('should return empty string for invalid lighting types', () => {
      expect(getLightingDescription('invalid')).toBe('');
      expect(getLightingDescription(null)).toBe('');
      expect(getLightingDescription(undefined)).toBe('');
    });
  });

  describe('getLightingIntensity', () => {
    test('should return correct intensity for valid lighting types', () => {
      expect(getLightingIntensity(LightingTypes.BRIGHT)).toBe(1.0);
      expect(getLightingIntensity(LightingTypes.NORMAL)).toBe(0.7);
      expect(getLightingIntensity(LightingTypes.DIM)).toBe(0.4);
      expect(getLightingIntensity(LightingTypes.DARK)).toBe(0.1);
    });

    test('should return default intensity for invalid lighting types', () => {
      expect(getLightingIntensity('invalid')).toBe(0.7);
      expect(getLightingIntensity(null)).toBe(0.7);
      expect(getLightingIntensity(undefined)).toBe(0.7);
    });
  });

  describe('completeness validation', () => {
    test('should have all required lighting types from requirements', () => {
      // Based on requirements 1.5 - lighting conditions should include basic visibility levels
      const requiredTypes = ['bright', 'normal', 'dim', 'dark'];
      
      requiredTypes.forEach(type => {
        expect(LIGHTING_TYPE_VALUES).toContain(type);
      });
    });

    test('should maintain data consistency across all modifier objects', () => {
      // All lighting types should have corresponding data in all modifier objects
      LIGHTING_TYPE_VALUES.forEach(lightingType => {
        expect(LIGHTING_DESCRIPTIONS[lightingType]).toBeDefined();
        expect(LIGHTING_INTENSITY[lightingType]).toBeDefined();
        expect(LIGHTING_VISIBILITY_MODIFIERS[lightingType]).toBeDefined();
        expect(LIGHTING_STEALTH_MODIFIERS[lightingType]).toBeDefined();
      });
    });

    test('should have magical lighting as special case', () => {
      // Magical lighting should be included as per requirements
      expect(LIGHTING_TYPE_VALUES).toContain('magical');
      expect(LIGHTING_INTENSITY[LightingTypes.MAGICAL]).toBeGreaterThan(0.5);
    });
  });
});