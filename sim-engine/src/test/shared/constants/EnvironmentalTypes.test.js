import {
  // Terrain exports
  TerrainTypes,
  TERRAIN_TYPE_VALUES,
  isValidTerrainType,
  
  // Climate exports
  ClimateTypes,
  CLIMATE_TYPE_VALUES,
  isValidClimateType,
  
  // Lighting exports
  LightingTypes,
  LIGHTING_TYPE_VALUES,
  isValidLightingType,
  
  // Connection exports
  ConnectionTypes,
  CONNECTION_TYPE_VALUES,
  isValidConnectionType,
  
  // Hazard exports
  HazardTypes,
  HAZARD_TYPE_VALUES,
  isValidHazardType,
  
  // Utility functions
  isValidEnvironmentalType,
  getEnvironmentalTypeValues
} from '../../../shared/constants/EnvironmentalTypes.js';

describe('EnvironmentalTypes Central Export', () => {
  describe('All enum exports', () => {
    test('should export all terrain types', () => {
      expect(TerrainTypes).toBeDefined();
      expect(TERRAIN_TYPE_VALUES).toBeDefined();
      expect(isValidTerrainType).toBeDefined();
      expect(typeof isValidTerrainType).toBe('function');
    });

    test('should export all climate types', () => {
      expect(ClimateTypes).toBeDefined();
      expect(CLIMATE_TYPE_VALUES).toBeDefined();
      expect(isValidClimateType).toBeDefined();
      expect(typeof isValidClimateType).toBe('function');
    });

    test('should export all lighting types', () => {
      expect(LightingTypes).toBeDefined();
      expect(LIGHTING_TYPE_VALUES).toBeDefined();
      expect(isValidLightingType).toBeDefined();
      expect(typeof isValidLightingType).toBe('function');
    });

    test('should export all connection types', () => {
      expect(ConnectionTypes).toBeDefined();
      expect(CONNECTION_TYPE_VALUES).toBeDefined();
      expect(isValidConnectionType).toBeDefined();
      expect(typeof isValidConnectionType).toBe('function');
    });

    test('should export all hazard types', () => {
      expect(HazardTypes).toBeDefined();
      expect(HAZARD_TYPE_VALUES).toBeDefined();
      expect(isValidHazardType).toBeDefined();
      expect(typeof isValidHazardType).toBe('function');
    });
  });

  describe('isValidEnvironmentalType', () => {
    test('should validate terrain types correctly', () => {
      expect(isValidEnvironmentalType('plains', 'terrain')).toBe(true);
      expect(isValidEnvironmentalType('forest', 'terrain')).toBe(true);
      expect(isValidEnvironmentalType('invalid', 'terrain')).toBe(false);
    });

    test('should validate climate types correctly', () => {
      expect(isValidEnvironmentalType('arctic', 'climate')).toBe(true);
      expect(isValidEnvironmentalType('temperate', 'climate')).toBe(true);
      expect(isValidEnvironmentalType('invalid', 'climate')).toBe(false);
    });

    test('should validate lighting types correctly', () => {
      expect(isValidEnvironmentalType('bright', 'lighting')).toBe(true);
      expect(isValidEnvironmentalType('dark', 'lighting')).toBe(true);
      expect(isValidEnvironmentalType('invalid', 'lighting')).toBe(false);
    });

    test('should validate connection types correctly', () => {
      expect(isValidEnvironmentalType('road', 'connection')).toBe(true);
      expect(isValidEnvironmentalType('river', 'connection')).toBe(true);
      expect(isValidEnvironmentalType('invalid', 'connection')).toBe(false);
    });

    test('should validate hazard types correctly', () => {
      expect(isValidEnvironmentalType('extreme_heat', 'hazard')).toBe(true);
      expect(isValidEnvironmentalType('bandits', 'hazard')).toBe(true);
      expect(isValidEnvironmentalType('invalid', 'hazard')).toBe(false);
    });

    test('should return false for invalid categories', () => {
      expect(isValidEnvironmentalType('plains', 'invalid')).toBe(false);
      expect(isValidEnvironmentalType('plains', '')).toBe(false);
      expect(isValidEnvironmentalType('plains', null)).toBe(false);
    });
  });

  describe('getEnvironmentalTypeValues', () => {
    test('should return terrain type values', () => {
      const values = getEnvironmentalTypeValues('terrain');
      expect(values).toEqual(TERRAIN_TYPE_VALUES);
      expect(values).toContain('plains');
      expect(values).toContain('forest');
    });

    test('should return climate type values', () => {
      const values = getEnvironmentalTypeValues('climate');
      expect(values).toEqual(CLIMATE_TYPE_VALUES);
      expect(values).toContain('arctic');
      expect(values).toContain('temperate');
    });

    test('should return lighting type values', () => {
      const values = getEnvironmentalTypeValues('lighting');
      expect(values).toEqual(LIGHTING_TYPE_VALUES);
      expect(values).toContain('bright');
      expect(values).toContain('dark');
    });

    test('should return connection type values', () => {
      const values = getEnvironmentalTypeValues('connection');
      expect(values).toEqual(CONNECTION_TYPE_VALUES);
      expect(values).toContain('road');
      expect(values).toContain('river');
    });

    test('should return hazard type values', () => {
      const values = getEnvironmentalTypeValues('hazard');
      expect(values).toEqual(HAZARD_TYPE_VALUES);
      expect(values).toContain('extreme_heat');
      expect(values).toContain('bandits');
    });

    test('should return empty array for invalid categories', () => {
      expect(getEnvironmentalTypeValues('invalid')).toEqual([]);
      expect(getEnvironmentalTypeValues('')).toEqual([]);
      expect(getEnvironmentalTypeValues(null)).toEqual([]);
    });
  });

  describe('completeness validation', () => {
    test('should have all required environmental categories', () => {
      const categories = ['terrain', 'climate', 'lighting', 'connection', 'hazard'];
      
      categories.forEach(category => {
        const values = getEnvironmentalTypeValues(category);
        expect(values.length).toBeGreaterThan(0);
        
        // Test that at least one value validates correctly
        expect(isValidEnvironmentalType(values[0], category)).toBe(true);
      });
    });

    test('should maintain consistency between individual and central exports', () => {
      // Terrain consistency
      expect(getEnvironmentalTypeValues('terrain')).toEqual(TERRAIN_TYPE_VALUES);
      
      // Climate consistency
      expect(getEnvironmentalTypeValues('climate')).toEqual(CLIMATE_TYPE_VALUES);
      
      // Lighting consistency
      expect(getEnvironmentalTypeValues('lighting')).toEqual(LIGHTING_TYPE_VALUES);
      
      // Connection consistency
      expect(getEnvironmentalTypeValues('connection')).toEqual(CONNECTION_TYPE_VALUES);
      
      // Hazard consistency
      expect(getEnvironmentalTypeValues('hazard')).toEqual(HAZARD_TYPE_VALUES);
    });

    test('should provide comprehensive environmental type coverage', () => {
      // Should have sufficient variety in each category
      expect(TERRAIN_TYPE_VALUES.length).toBeGreaterThanOrEqual(8);
      expect(CLIMATE_TYPE_VALUES.length).toBeGreaterThanOrEqual(4);
      expect(LIGHTING_TYPE_VALUES.length).toBeGreaterThanOrEqual(4);
      expect(CONNECTION_TYPE_VALUES.length).toBeGreaterThanOrEqual(6);
      expect(HAZARD_TYPE_VALUES.length).toBeGreaterThanOrEqual(8);
    });
  });
});