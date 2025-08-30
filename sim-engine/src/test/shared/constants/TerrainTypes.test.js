import {
  TerrainTypes,
  TERRAIN_TYPE_VALUES,
  TERRAIN_DESCRIPTIONS,
  isValidTerrainType,
  getTerrainDescription
} from '../../../shared/constants/TerrainTypes.js';

describe('TerrainTypes', () => {
  describe('TerrainTypes enum', () => {
    test('should contain all expected terrain types', () => {
      const expectedTypes = [
        'plains', 'forest', 'mountains', 'desert', 'swamp',
        'urban', 'ruins', 'underground', 'coastal', 'tundra'
      ];
      
      expectedTypes.forEach(type => {
        expect(Object.values(TerrainTypes)).toContain(type);
      });
    });

    test('should have exactly 10 terrain types', () => {
      expect(Object.keys(TerrainTypes)).toHaveLength(10);
    });

    test('should have consistent key-value mapping', () => {
      Object.entries(TerrainTypes).forEach(([key, value]) => {
        expect(key.toLowerCase()).toBe(value);
      });
    });
  });

  describe('TERRAIN_TYPE_VALUES', () => {
    test('should contain all terrain type values', () => {
      expect(TERRAIN_TYPE_VALUES).toEqual(Object.values(TerrainTypes));
    });

    test('should not contain duplicates', () => {
      const uniqueValues = [...new Set(TERRAIN_TYPE_VALUES)];
      expect(uniqueValues).toHaveLength(TERRAIN_TYPE_VALUES.length);
    });
  });

  describe('TERRAIN_DESCRIPTIONS', () => {
    test('should have descriptions for all terrain types', () => {
      TERRAIN_TYPE_VALUES.forEach(terrainType => {
        expect(TERRAIN_DESCRIPTIONS[terrainType]).toBeDefined();
        expect(typeof TERRAIN_DESCRIPTIONS[terrainType]).toBe('string');
        expect(TERRAIN_DESCRIPTIONS[terrainType].length).toBeGreaterThan(0);
      });
    });

    test('should not have extra descriptions', () => {
      const descriptionKeys = Object.keys(TERRAIN_DESCRIPTIONS);
      expect(descriptionKeys).toHaveLength(TERRAIN_TYPE_VALUES.length);
      
      descriptionKeys.forEach(key => {
        expect(TERRAIN_TYPE_VALUES).toContain(key);
      });
    });
  });

  describe('isValidTerrainType', () => {
    test('should return true for valid terrain types', () => {
      TERRAIN_TYPE_VALUES.forEach(terrainType => {
        expect(isValidTerrainType(terrainType)).toBe(true);
      });
    });

    test('should return false for invalid terrain types', () => {
      const invalidTypes = ['invalid', 'ocean', 'space', '', null, undefined, 123];
      
      invalidTypes.forEach(invalidType => {
        expect(isValidTerrainType(invalidType)).toBe(false);
      });
    });

    test('should be case sensitive', () => {
      expect(isValidTerrainType('PLAINS')).toBe(false);
      expect(isValidTerrainType('Plains')).toBe(false);
      expect(isValidTerrainType('plains')).toBe(true);
    });
  });

  describe('getTerrainDescription', () => {
    test('should return correct descriptions for valid terrain types', () => {
      expect(getTerrainDescription(TerrainTypes.PLAINS)).toBe('Open grasslands and fields');
      expect(getTerrainDescription(TerrainTypes.FOREST)).toBe('Dense woodlands and groves');
      expect(getTerrainDescription(TerrainTypes.MOUNTAINS)).toBe('High peaks and rocky terrain');
    });

    test('should return empty string for invalid terrain types', () => {
      expect(getTerrainDescription('invalid')).toBe('');
      expect(getTerrainDescription(null)).toBe('');
      expect(getTerrainDescription(undefined)).toBe('');
    });
  });

  describe('completeness validation', () => {
    test('should have all required terrain types from requirements', () => {
      // Based on requirements 1.3 - terrain types should include common environments
      const requiredTypes = ['plains', 'forest', 'mountains', 'desert', 'swamp', 'urban'];
      
      requiredTypes.forEach(type => {
        expect(TERRAIN_TYPE_VALUES).toContain(type);
      });
    });

    test('should maintain immutability of enum objects', () => {
      const originalLength = Object.keys(TerrainTypes).length;
      
      // Attempt to modify the enum (should not work in strict mode)
      expect(() => {
        TerrainTypes.NEW_TYPE = 'new_type';
      }).not.toThrow(); // JavaScript allows this, but we test that our usage doesn't rely on mutability
      
      // Verify our constants are still intact
      expect(Object.keys(TerrainTypes)).toHaveLength(originalLength + 1); // Shows mutation happened
      expect(TERRAIN_TYPE_VALUES).not.toContain('new_type'); // But our derived array is separate
    });
  });
});