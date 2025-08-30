import {
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
} from '../../../shared/constants/HazardTypes.js';

describe('HazardTypes', () => {
  describe('HazardTypes enum', () => {
    test('should contain all expected hazard types', () => {
      const expectedTypes = [
        'extreme_heat', 'extreme_cold', 'toxic_air', 'radiation', 'supernatural',
        'wild_animals', 'bandits', 'disease', 'altitude', 'structural_instability'
      ];
      
      expectedTypes.forEach(type => {
        expect(Object.values(HazardTypes)).toContain(type);
      });
    });

    test('should have exactly 10 hazard types', () => {
      expect(Object.keys(HazardTypes)).toHaveLength(10);
    });

    test('should have consistent key-value mapping', () => {
      Object.entries(HazardTypes).forEach(([key, value]) => {
        expect(key.toLowerCase()).toBe(value);
      });
    });
  });

  describe('HAZARD_TYPE_VALUES', () => {
    test('should contain all hazard type values', () => {
      expect(HAZARD_TYPE_VALUES).toEqual(Object.values(HazardTypes));
    });

    test('should not contain duplicates', () => {
      const uniqueValues = [...new Set(HAZARD_TYPE_VALUES)];
      expect(uniqueValues).toHaveLength(HAZARD_TYPE_VALUES.length);
    });
  });

  describe('HAZARD_DESCRIPTIONS', () => {
    test('should have descriptions for all hazard types', () => {
      HAZARD_TYPE_VALUES.forEach(hazardType => {
        expect(HAZARD_DESCRIPTIONS[hazardType]).toBeDefined();
        expect(typeof HAZARD_DESCRIPTIONS[hazardType]).toBe('string');
        expect(HAZARD_DESCRIPTIONS[hazardType].length).toBeGreaterThan(0);
      });
    });

    test('should not have extra descriptions', () => {
      const descriptionKeys = Object.keys(HAZARD_DESCRIPTIONS);
      expect(descriptionKeys).toHaveLength(HAZARD_TYPE_VALUES.length);
      
      descriptionKeys.forEach(key => {
        expect(HAZARD_TYPE_VALUES).toContain(key);
      });
    });
  });

  describe('HAZARD_CATEGORIES', () => {
    test('should categorize all hazard types', () => {
      const allCategorizedHazards = Object.values(HAZARD_CATEGORIES).flat();
      
      HAZARD_TYPE_VALUES.forEach(hazardType => {
        expect(allCategorizedHazards).toContain(hazardType);
      });
    });

    test('should not have duplicate hazards across categories', () => {
      const allCategorizedHazards = Object.values(HAZARD_CATEGORIES).flat();
      const uniqueHazards = [...new Set(allCategorizedHazards)];
      
      expect(uniqueHazards).toHaveLength(allCategorizedHazards.length);
    });

    test('should have logical category groupings', () => {
      // Environmental hazards
      expect(HAZARD_CATEGORIES.ENVIRONMENTAL).toContain(HazardTypes.EXTREME_HEAT);
      expect(HAZARD_CATEGORIES.ENVIRONMENTAL).toContain(HazardTypes.EXTREME_COLD);
      expect(HAZARD_CATEGORIES.ENVIRONMENTAL).toContain(HazardTypes.TOXIC_AIR);
      
      // Biological hazards
      expect(HAZARD_CATEGORIES.BIOLOGICAL).toContain(HazardTypes.WILD_ANIMALS);
      expect(HAZARD_CATEGORIES.BIOLOGICAL).toContain(HazardTypes.DISEASE);
      
      // Social hazards
      expect(HAZARD_CATEGORIES.SOCIAL).toContain(HazardTypes.BANDITS);
      
      // Supernatural hazards
      expect(HAZARD_CATEGORIES.SUPERNATURAL).toContain(HazardTypes.SUPERNATURAL);
      expect(HAZARD_CATEGORIES.SUPERNATURAL).toContain(HazardTypes.RADIATION);
    });
  });

  describe('HAZARD_BASE_DANGER', () => {
    test('should have danger values for all hazard types', () => {
      HAZARD_TYPE_VALUES.forEach(hazardType => {
        const danger = HAZARD_BASE_DANGER[hazardType];
        expect(danger).toBeDefined();
        expect(typeof danger).toBe('number');
        expect(danger).toBeGreaterThanOrEqual(0);
        expect(danger).toBeLessThanOrEqual(1);
      });
    });

    test('should have logical danger levels', () => {
      // Supernatural and radiation should be high danger
      expect(HAZARD_BASE_DANGER[HazardTypes.SUPERNATURAL]).toBeGreaterThan(0.5);
      expect(HAZARD_BASE_DANGER[HazardTypes.RADIATION]).toBeGreaterThan(0.4);
      
      // Altitude should be relatively low danger
      expect(HAZARD_BASE_DANGER[HazardTypes.ALTITUDE]).toBeLessThan(0.3);
      
      // Extreme temperatures should be moderate danger
      expect(HAZARD_BASE_DANGER[HazardTypes.EXTREME_HEAT]).toBeGreaterThan(0.2);
      expect(HAZARD_BASE_DANGER[HazardTypes.EXTREME_COLD]).toBeGreaterThan(0.2);
    });
  });

  describe('HAZARD_ATTRIBUTE_MODIFIERS', () => {
    test('should have attribute modifiers for all hazard types', () => {
      HAZARD_TYPE_VALUES.forEach(hazardType => {
        const modifiers = HAZARD_ATTRIBUTE_MODIFIERS[hazardType];
        expect(modifiers).toBeDefined();
        expect(typeof modifiers).toBe('object');
        expect(Object.keys(modifiers).length).toBeGreaterThan(0);
      });
    });

    test('should have logical attribute modifiers', () => {
      // Temperature hazards should affect constitution
      expect(HAZARD_ATTRIBUTE_MODIFIERS[HazardTypes.EXTREME_HEAT].constitution).toBeLessThan(0);
      expect(HAZARD_ATTRIBUTE_MODIFIERS[HazardTypes.EXTREME_COLD].constitution).toBeLessThan(0);
      
      // Toxic air should affect constitution and perception
      const toxicModifiers = HAZARD_ATTRIBUTE_MODIFIERS[HazardTypes.TOXIC_AIR];
      expect(toxicModifiers.constitution).toBeLessThan(0);
      expect(toxicModifiers.perception).toBeLessThan(0);
      
      // Wild animals should affect stealth negatively but survival positively
      const animalModifiers = HAZARD_ATTRIBUTE_MODIFIERS[HazardTypes.WILD_ANIMALS];
      expect(animalModifiers.stealth).toBeLessThan(0);
      expect(animalModifiers.survival).toBeGreaterThan(0);
      
      // Supernatural should affect wisdom and sanity
      const supernaturalModifiers = HAZARD_ATTRIBUTE_MODIFIERS[HazardTypes.SUPERNATURAL];
      expect(supernaturalModifiers.wisdom).toBeLessThan(0);
      expect(supernaturalModifiers.sanity).toBeLessThan(0);
    });

    test('should have reasonable modifier ranges', () => {
      HAZARD_TYPE_VALUES.forEach(hazardType => {
        const modifiers = HAZARD_ATTRIBUTE_MODIFIERS[hazardType];
        
        Object.values(modifiers).forEach(modifier => {
          expect(typeof modifier).toBe('number');
          expect(modifier).toBeGreaterThanOrEqual(-5);
          expect(modifier).toBeLessThanOrEqual(5);
        });
      });
    });
  });

  describe('isValidHazardType', () => {
    test('should return true for valid hazard types', () => {
      HAZARD_TYPE_VALUES.forEach(hazardType => {
        expect(isValidHazardType(hazardType)).toBe(true);
      });
    });

    test('should return false for invalid hazard types', () => {
      const invalidTypes = ['invalid', 'fire', 'water', '', null, undefined, 123];
      
      invalidTypes.forEach(invalidType => {
        expect(isValidHazardType(invalidType)).toBe(false);
      });
    });

    test('should be case sensitive', () => {
      expect(isValidHazardType('EXTREME_HEAT')).toBe(false);
      expect(isValidHazardType('Extreme_Heat')).toBe(false);
      expect(isValidHazardType('extreme_heat')).toBe(true);
    });
  });

  describe('getHazardDescription', () => {
    test('should return correct descriptions for valid hazard types', () => {
      expect(getHazardDescription(HazardTypes.EXTREME_HEAT)).toBe('Dangerously high temperatures that can cause heat exhaustion');
      expect(getHazardDescription(HazardTypes.SUPERNATURAL)).toBe('Otherworldly forces and paranormal phenomena');
      expect(getHazardDescription(HazardTypes.WILD_ANIMALS)).toBe('Dangerous creatures that may attack travelers');
    });

    test('should return empty string for invalid hazard types', () => {
      expect(getHazardDescription('invalid')).toBe('');
      expect(getHazardDescription(null)).toBe('');
      expect(getHazardDescription(undefined)).toBe('');
    });
  });

  describe('getHazardBaseDanger', () => {
    test('should return correct danger for valid hazard types', () => {
      expect(getHazardBaseDanger(HazardTypes.SUPERNATURAL)).toBe(0.6);
      expect(getHazardBaseDanger(HazardTypes.ALTITUDE)).toBe(0.2);
      expect(getHazardBaseDanger(HazardTypes.EXTREME_HEAT)).toBe(0.3);
    });

    test('should return default danger for invalid hazard types', () => {
      expect(getHazardBaseDanger('invalid')).toBe(0.1);
      expect(getHazardBaseDanger(null)).toBe(0.1);
      expect(getHazardBaseDanger(undefined)).toBe(0.1);
    });
  });

  describe('getHazardCategory', () => {
    test('should return correct category for valid hazard types', () => {
      expect(getHazardCategory(HazardTypes.EXTREME_HEAT)).toBe('environmental');
      expect(getHazardCategory(HazardTypes.WILD_ANIMALS)).toBe('biological');
      expect(getHazardCategory(HazardTypes.BANDITS)).toBe('social');
      expect(getHazardCategory(HazardTypes.SUPERNATURAL)).toBe('supernatural');
      expect(getHazardCategory(HazardTypes.STRUCTURAL_INSTABILITY)).toBe('structural');
    });

    test('should return unknown for invalid hazard types', () => {
      expect(getHazardCategory('invalid')).toBe('unknown');
      expect(getHazardCategory(null)).toBe('unknown');
      expect(getHazardCategory(undefined)).toBe('unknown');
    });
  });

  describe('completeness validation', () => {
    test('should have all required hazard types from requirements', () => {
      // Based on requirements 1.6 - environmental hazards should include various danger types
      const requiredTypes = ['extreme_heat', 'extreme_cold', 'toxic_air', 'wild_animals', 'disease'];
      
      requiredTypes.forEach(type => {
        expect(HAZARD_TYPE_VALUES).toContain(type);
      });
    });

    test('should maintain data consistency across all related objects', () => {
      // All hazard types should have corresponding data in all related objects
      HAZARD_TYPE_VALUES.forEach(hazardType => {
        expect(HAZARD_DESCRIPTIONS[hazardType]).toBeDefined();
        expect(HAZARD_BASE_DANGER[hazardType]).toBeDefined();
        expect(HAZARD_ATTRIBUTE_MODIFIERS[hazardType]).toBeDefined();
        
        // Should be in at least one category
        const category = getHazardCategory(hazardType);
        expect(category).not.toBe('unknown');
      });
    });

    test('should cover diverse hazard types', () => {
      // Should have environmental hazards
      expect(HAZARD_TYPE_VALUES).toContain('extreme_heat');
      expect(HAZARD_TYPE_VALUES).toContain('toxic_air');
      
      // Should have creature hazards
      expect(HAZARD_TYPE_VALUES).toContain('wild_animals');
      
      // Should have social hazards
      expect(HAZARD_TYPE_VALUES).toContain('bandits');
      
      // Should have supernatural hazards
      expect(HAZARD_TYPE_VALUES).toContain('supernatural');
      
      // Should have structural hazards
      expect(HAZARD_TYPE_VALUES).toContain('structural_instability');
    });

    test('should have balanced danger distribution', () => {
      const dangers = HAZARD_TYPE_VALUES.map(type => HAZARD_BASE_DANGER[type]);
      const minDanger = Math.min(...dangers);
      const maxDanger = Math.max(...dangers);
      
      // Should have range from low to high danger
      expect(minDanger).toBeLessThan(0.3);
      expect(maxDanger).toBeGreaterThan(0.5);
      
      // Should have variety in danger levels
      const uniqueDangers = [...new Set(dangers)];
      expect(uniqueDangers.length).toBeGreaterThanOrEqual(5);
    });
  });
});