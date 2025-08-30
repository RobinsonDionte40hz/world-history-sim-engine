// src/domain/services/__tests__/EnvironmentalPresetService.test.js

import EnvironmentalPresetService from '../EnvironmentalPresetService.js';
import EnvironmentalHazard from '../../entities/EnvironmentalHazard.js';
import Environment from '../../value-objects/Environment.js';
import { TerrainTypes } from '../../../shared/constants/TerrainTypes.js';
import { ClimateTypes } from '../../../shared/constants/ClimateTypes.js';
import { LightingTypes } from '../../../shared/constants/LightingTypes.js';
import { HazardTypes } from '../../../shared/constants/HazardTypes.js';
import { ValidationError } from '../../../shared/types/ValueObjectTypes.js';

describe('EnvironmentalPresetService', () => {
  describe('getPresets', () => {
    test('should return all available presets', () => {
      const presets = EnvironmentalPresetService.getPresets();
      
      expect(presets).toBeDefined();
      expect(typeof presets).toBe('object');
      expect(Object.keys(presets).length).toBeGreaterThan(0);
      
      // Check that all presets have required structure
      Object.values(presets).forEach(preset => {
        expect(preset).toHaveProperty('id');
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('description');
        expect(preset).toHaveProperty('category');
        expect(preset).toHaveProperty('environment');
        expect(preset).toHaveProperty('nodeProperties');
      });
    });

    test('should include expected preset types', () => {
      const presets = EnvironmentalPresetService.getPresets();
      
      expect(presets).toHaveProperty('forest_village');
      expect(presets).toHaveProperty('mountain_fortress');
      expect(presets).toHaveProperty('desert_oasis');
      expect(presets).toHaveProperty('haunted_ruins');
      expect(presets).toHaveProperty('swamp_settlement');
      expect(presets).toHaveProperty('arctic_outpost');
      expect(presets).toHaveProperty('coastal_port');
      expect(presets).toHaveProperty('underground_city');
      expect(presets).toHaveProperty('toxic_wasteland');
      expect(presets).toHaveProperty('magical_grove');
    });

    test('should have valid environmental data for all presets', () => {
      const presets = EnvironmentalPresetService.getPresets();
      
      Object.values(presets).forEach(preset => {
        const env = preset.environment;
        
        // Check required properties exist
        expect(env).toHaveProperty('density');
        expect(env).toHaveProperty('terrain');
        expect(env).toHaveProperty('climate');
        expect(env).toHaveProperty('lighting');
        expect(env).toHaveProperty('hazards');
        expect(env).toHaveProperty('shelterQuality');
        expect(env).toHaveProperty('airQuality');
        expect(env).toHaveProperty('waterAvailability');
        expect(env).toHaveProperty('temperature');
        expect(env).toHaveProperty('humidity');
        expect(env).toHaveProperty('windStrength');
        
        // Check value ranges
        expect(env.density).toBeGreaterThanOrEqual(0);
        expect(env.density).toBeLessThanOrEqual(1);
        expect(env.shelterQuality).toBeGreaterThanOrEqual(0);
        expect(env.shelterQuality).toBeLessThanOrEqual(1);
        expect(env.airQuality).toBeGreaterThanOrEqual(0);
        expect(env.airQuality).toBeLessThanOrEqual(1);
        expect(env.waterAvailability).toBeGreaterThanOrEqual(0);
        expect(env.waterAvailability).toBeLessThanOrEqual(1);
        expect(env.humidity).toBeGreaterThanOrEqual(0);
        expect(env.humidity).toBeLessThanOrEqual(1);
        expect(env.windStrength).toBeGreaterThanOrEqual(0);
        expect(env.windStrength).toBeLessThanOrEqual(1);
        expect(env.temperature).toBeGreaterThanOrEqual(-50);
        expect(env.temperature).toBeLessThanOrEqual(60);
        
        // Check enum values
        expect(Object.values(TerrainTypes)).toContain(env.terrain);
        expect(Object.values(ClimateTypes)).toContain(env.climate);
        expect(Object.values(LightingTypes)).toContain(env.lighting);
        
        // Check hazards array
        expect(Array.isArray(env.hazards)).toBe(true);
        env.hazards.forEach(hazard => {
          expect(hazard).toHaveProperty('type');
          expect(hazard).toHaveProperty('severity');
          expect(Object.values(HazardTypes)).toContain(hazard.type);
          expect(hazard.severity).toBeGreaterThanOrEqual(0);
          expect(hazard.severity).toBeLessThanOrEqual(1);
        });
      });
    });
  });

  describe('getPreset', () => {
    test('should return specific preset by ID', () => {
      const preset = EnvironmentalPresetService.getPreset('forest_village');
      
      expect(preset).toBeDefined();
      expect(preset.id).toBe('forest_village');
      expect(preset.name).toBe('Forest Village');
      expect(preset.environment.terrain).toBe(TerrainTypes.FOREST);
    });

    test('should return null for non-existent preset', () => {
      const preset = EnvironmentalPresetService.getPreset('non_existent');
      expect(preset).toBeNull();
    });
  });

  describe('getPresetsByCategory', () => {
    test('should return presets filtered by category', () => {
      const settlementPresets = EnvironmentalPresetService.getPresetsByCategory('settlement');
      
      expect(Array.isArray(settlementPresets)).toBe(true);
      expect(settlementPresets.length).toBeGreaterThan(0);
      
      settlementPresets.forEach(preset => {
        expect(preset.category).toBe('settlement');
      });
    });

    test('should return empty array for non-existent category', () => {
      const presets = EnvironmentalPresetService.getPresetsByCategory('non_existent');
      expect(presets).toEqual([]);
    });
  });

  describe('getPresetCategories', () => {
    test('should return all unique categories', () => {
      const categories = EnvironmentalPresetService.getPresetCategories();
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain('settlement');
      expect(categories).toContain('landmark');
      expect(categories).toContain('dungeon');
      expect(categories).toContain('wilderness');
      
      // Should be sorted
      const sortedCategories = [...categories].sort();
      expect(categories).toEqual(sortedCategories);
    });
  });

  describe('applyPreset', () => {
    test('should apply preset to node data successfully', () => {
      const nodeData = {
        name: 'My Village',
        description: 'A custom village'
      };
      
      const result = EnvironmentalPresetService.applyPreset(nodeData, 'forest_village');
      
      expect(result.name).toBe('My Village'); // Preserves user name
      expect(result.description).toBe('A custom village'); // Preserves user description
      expect(result.type).toBe('settlement'); // From preset
      expect(result.size).toBe(150); // From preset
      expect(result.environment).toBeDefined();
      expect(result.environment.terrain).toBe(TerrainTypes.FOREST);
      expect(result.environment.climate).toBe(ClimateTypes.TEMPERATE);
    });

    test('should use preset name and description when not provided', () => {
      const nodeData = {};
      
      const result = EnvironmentalPresetService.applyPreset(nodeData, 'forest_village');
      
      expect(result.name).toBe('Forest Village');
      expect(result.description).toBe('A peaceful settlement nestled in the woods with clean air and abundant water');
    });

    test('should create EnvironmentalHazard instances from preset hazard data', () => {
      const nodeData = {};
      
      const result = EnvironmentalPresetService.applyPreset(nodeData, 'haunted_ruins');
      
      expect(result.environment.hazards).toBeDefined();
      expect(Array.isArray(result.environment.hazards)).toBe(true);
      expect(result.environment.hazards.length).toBe(2);
      
      result.environment.hazards.forEach(hazard => {
        expect(hazard).toBeInstanceOf(EnvironmentalHazard);
      });
    });

    test('should apply overrides correctly', () => {
      const nodeData = {
        name: 'Custom Name'
      };
      
      const overrides = {
        size: 200,
        environment: {
          density: 0.9
        }
      };
      
      const result = EnvironmentalPresetService.applyPreset(nodeData, 'forest_village', overrides);
      
      expect(result.name).toBe('Custom Name');
      expect(result.size).toBe(200); // Override applied
      expect(result.environment.density).toBe(0.9); // Environment override applied
      expect(result.environment.terrain).toBe(TerrainTypes.FOREST); // Preset value preserved
    });

    test('should throw error for unknown preset', () => {
      const nodeData = {};
      
      expect(() => {
        EnvironmentalPresetService.applyPreset(nodeData, 'unknown_preset');
      }).toThrow(ValidationError);
    });
  });

  describe('createCustomPreset', () => {
    test('should create custom preset from node data', () => {
      const nodeData = {
        type: 'settlement',
        size: 120,
        environment: {
          density: 0.7,
          terrain: TerrainTypes.PLAINS,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.NORMAL,
          hazards: [],
          shelterQuality: 0.8,
          airQuality: 0.9,
          waterAvailability: 0.8,
          temperature: 18,
          humidity: 0.5,
          windStrength: 0.3
        }
      };
      
      const preset = EnvironmentalPresetService.createCustomPreset(
        'My Custom Village',
        'A custom village preset',
        nodeData,
        'custom'
      );
      
      expect(preset).toBeDefined();
      expect(preset.name).toBe('My Custom Village');
      expect(preset.description).toBe('A custom village preset');
      expect(preset.category).toBe('custom');
      expect(preset.isCustom).toBe(true);
      expect(preset.createdAt).toBeDefined();
      expect(preset.id).toMatch(/^custom_my_custom_village_/);
      
      expect(preset.environment).toEqual(nodeData.environment);
      expect(preset.nodeProperties.type).toBe('settlement');
      expect(preset.nodeProperties.size).toBe(120);
    });

    test('should handle Environment instance in node data', () => {
      const environment = new Environment({
        density: 0.6,
        terrain: TerrainTypes.FOREST,
        climate: ClimateTypes.TEMPERATE,
        lighting: LightingTypes.DIM,
        hazards: [new EnvironmentalHazard({ type: HazardTypes.WILD_ANIMALS, severity: 0.3 })],
        shelterQuality: 0.7,
        airQuality: 0.9,
        waterAvailability: 0.8,
        temperature: 15,
        humidity: 0.6,
        windStrength: 0.2
      });
      
      const nodeData = {
        type: 'settlement',
        size: 100,
        environment: environment
      };
      
      const preset = EnvironmentalPresetService.createCustomPreset(
        'Environment Instance Test',
        'Testing with Environment instance',
        nodeData
      );
      
      expect(preset.environment).toBeDefined();
      expect(preset.environment.terrain).toBe(TerrainTypes.FOREST);
      expect(preset.environment.hazards).toHaveLength(1);
      expect(preset.environment.hazards[0].type).toBe(HazardTypes.WILD_ANIMALS);
    });

    test('should use default category when not provided', () => {
      const nodeData = {
        type: 'location',
        environment: {
          density: 0.5,
          terrain: TerrainTypes.PLAINS,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.NORMAL,
          hazards: [],
          shelterQuality: 0.5,
          airQuality: 0.8,
          waterAvailability: 0.7,
          temperature: 15,
          humidity: 0.5,
          windStrength: 0.3
        }
      };
      
      const preset = EnvironmentalPresetService.createCustomPreset(
        'Test Preset',
        'Test description',
        nodeData
      );
      
      expect(preset.category).toBe('custom');
    });

    test('should throw error for invalid name', () => {
      const nodeData = {
        environment: {
          density: 0.5,
          terrain: TerrainTypes.PLAINS,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.NORMAL,
          hazards: [],
          shelterQuality: 0.5,
          airQuality: 0.8,
          waterAvailability: 0.7,
          temperature: 15,
          humidity: 0.5,
          windStrength: 0.3
        }
      };
      
      expect(() => {
        EnvironmentalPresetService.createCustomPreset('', 'Description', nodeData);
      }).toThrow(ValidationError);
      
      expect(() => {
        EnvironmentalPresetService.createCustomPreset(null, 'Description', nodeData);
      }).toThrow(ValidationError);
    });

    test('should throw error for invalid description', () => {
      const nodeData = {
        environment: {
          density: 0.5,
          terrain: TerrainTypes.PLAINS,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.NORMAL,
          hazards: [],
          shelterQuality: 0.5,
          airQuality: 0.8,
          waterAvailability: 0.7,
          temperature: 15,
          humidity: 0.5,
          windStrength: 0.3
        }
      };
      
      expect(() => {
        EnvironmentalPresetService.createCustomPreset('Name', '', nodeData);
      }).toThrow(ValidationError);
    });

    test('should throw error for missing environment data', () => {
      const nodeData = {
        type: 'location'
      };
      
      expect(() => {
        EnvironmentalPresetService.createCustomPreset('Name', 'Description', nodeData);
      }).toThrow(ValidationError);
    });
  });

  describe('validatePresetData', () => {
    test('should validate complete preset data successfully', () => {
      const validData = {
        environment: {
          density: 0.5,
          terrain: TerrainTypes.PLAINS,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.NORMAL,
          hazards: [],
          shelterQuality: 0.5,
          airQuality: 0.8,
          waterAvailability: 0.7,
          temperature: 15,
          humidity: 0.5,
          windStrength: 0.3
        }
      };
      
      expect(() => {
        EnvironmentalPresetService.validatePresetData(validData);
      }).not.toThrow();
    });

    test('should throw error for missing environment object', () => {
      const invalidData = {};
      
      expect(() => {
        EnvironmentalPresetService.validatePresetData(invalidData);
      }).toThrow(ValidationError);
    });

    test('should throw error for missing required properties', () => {
      const invalidData = {
        environment: {
          density: 0.5,
          terrain: TerrainTypes.PLAINS
          // Missing other required properties
        }
      };
      
      expect(() => {
        EnvironmentalPresetService.validatePresetData(invalidData);
      }).toThrow(ValidationError);
    });

    test('should throw error for invalid property ranges', () => {
      const invalidData = {
        environment: {
          density: 1.5, // Invalid range
          terrain: TerrainTypes.PLAINS,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.NORMAL,
          hazards: [],
          shelterQuality: 0.5,
          airQuality: 0.8,
          waterAvailability: 0.7,
          temperature: 15,
          humidity: 0.5,
          windStrength: 0.3
        }
      };
      
      expect(() => {
        EnvironmentalPresetService.validatePresetData(invalidData);
      }).toThrow(ValidationError);
    });

    test('should throw error for invalid enum values', () => {
      const invalidData = {
        environment: {
          density: 0.5,
          terrain: 'invalid_terrain',
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.NORMAL,
          hazards: [],
          shelterQuality: 0.5,
          airQuality: 0.8,
          waterAvailability: 0.7,
          temperature: 15,
          humidity: 0.5,
          windStrength: 0.3
        }
      };
      
      expect(() => {
        EnvironmentalPresetService.validatePresetData(invalidData);
      }).toThrow(ValidationError);
    });

    test('should throw error for invalid hazards array', () => {
      const invalidData = {
        environment: {
          density: 0.5,
          terrain: TerrainTypes.PLAINS,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.NORMAL,
          hazards: 'not_an_array',
          shelterQuality: 0.5,
          airQuality: 0.8,
          waterAvailability: 0.7,
          temperature: 15,
          humidity: 0.5,
          windStrength: 0.3
        }
      };
      
      expect(() => {
        EnvironmentalPresetService.validatePresetData(invalidData);
      }).toThrow(ValidationError);
    });
  });

  describe('validatePresetCompatibility', () => {
    test('should validate compatible preset application', () => {
      const nodeData = {
        type: 'settlement'
      };
      
      const result = EnvironmentalPresetService.validatePresetCompatibility(nodeData, 'forest_village');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect preset not found', () => {
      const nodeData = {};
      
      const result = EnvironmentalPresetService.validatePresetCompatibility(nodeData, 'non_existent');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Preset 'non_existent' not found");
    });

    test('should warn about potential conflicts', () => {
      const nodeData = {
        environment: {
          terrain: TerrainTypes.DESERT,
          climate: ClimateTypes.ARID
        }
      };
      
      const result = EnvironmentalPresetService.validatePresetCompatibility(nodeData, 'forest_village');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('terrain'))).toBe(true);
      expect(result.errors.some(error => error.includes('climate'))).toBe(true);
    });

    test('should handle invalid node data', () => {
      const result = EnvironmentalPresetService.validatePresetCompatibility(null, 'forest_village');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Node data must be an object');
    });
  });

  describe('getPresetRecommendations', () => {
    test('should recommend presets based on node type', () => {
      const nodeData = {
        type: 'settlement'
      };
      
      const recommendations = EnvironmentalPresetService.getPresetRecommendations(nodeData);
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.length).toBeLessThanOrEqual(5);
      
      // Should be sorted by score descending
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i].score).toBeLessThanOrEqual(recommendations[i - 1].score);
      }
      
      // All recommendations should be for settlements
      recommendations.forEach(rec => {
        expect(rec.preset.nodeProperties.type).toBe('settlement');
        expect(rec.reason).toContain('settlement type');
      });
    });

    test('should recommend presets based on environment properties', () => {
      const nodeData = {
        environment: {
          terrain: TerrainTypes.FOREST,
          climate: ClimateTypes.TEMPERATE
        }
      };
      
      const recommendations = EnvironmentalPresetService.getPresetRecommendations(nodeData);
      
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Top recommendation should match terrain and climate
      const topRec = recommendations[0];
      expect(topRec.preset.environment.terrain).toBe(TerrainTypes.FOREST);
      expect(topRec.preset.environment.climate).toBe(ClimateTypes.TEMPERATE);
      expect(topRec.reason).toContain('forest terrain');
      expect(topRec.reason).toContain('temperate climate');
    });

    test('should return empty array when no matches found', () => {
      const nodeData = {
        type: 'completely_unknown_type',
        environment: {
          terrain: 'unknown_terrain'
        }
      };
      
      const recommendations = EnvironmentalPresetService.getPresetRecommendations(nodeData);
      
      expect(recommendations).toEqual([]);
    });

    test('should limit recommendations to top 5', () => {
      const nodeData = {}; // Empty data should match many presets with low scores
      
      const recommendations = EnvironmentalPresetService.getPresetRecommendations(nodeData);
      
      expect(recommendations.length).toBeLessThanOrEqual(5);
    });
  });

  describe('_generatePresetId', () => {
    test('should generate unique IDs for different names', () => {
      const id1 = EnvironmentalPresetService._generatePresetId('Test Name 1');
      const id2 = EnvironmentalPresetService._generatePresetId('Test Name 2');
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^custom_test_name_1_/);
      expect(id2).toMatch(/^custom_test_name_2_/);
    });

    test('should sanitize special characters', () => {
      const id = EnvironmentalPresetService._generatePresetId('Test@Name#With$Special%Characters!');
      
      // The sanitized name should be "testnamewithspecialc" (truncated to 20 chars)
      expect(id).toMatch(/^custom_testnamewithspecialc_/);
    });

    test('should limit name length', () => {
      const longName = 'This is a very long name that should be truncated to fit within the limit';
      const id = EnvironmentalPresetService._generatePresetId(longName);
      
      const namePart = id.split('_')[1];
      expect(namePart.length).toBeLessThanOrEqual(20);
    });
  });
});