// src/domain/value-objects/__tests__/Environment.test.js

import Environment from '../Environment.js';
import EnvironmentalHazard from '../../entities/EnvironmentalHazard.js';
import { TerrainTypes } from '../../../shared/constants/TerrainTypes.js';
import { ClimateTypes } from '../../../shared/constants/ClimateTypes.js';
import { LightingTypes } from '../../../shared/constants/LightingTypes.js';
import { HazardTypes } from '../../../shared/constants/HazardTypes.js';
import { ValidationError } from '../../../shared/types/ValueObjectTypes.js';

describe('Environment', () => {
  describe('constructor', () => {
    it('should create environment with default values when no config provided', () => {
      const environment = new Environment();
      
      expect(environment.density).toBe(0.5);
      expect(environment.terrain).toBe(TerrainTypes.PLAINS);
      expect(environment.climate).toBe(ClimateTypes.TEMPERATE);
      expect(environment.lighting).toBe(LightingTypes.NORMAL);
      expect(environment.hazards).toEqual([]);
      expect(environment.shelterQuality).toBe(0.5);
      expect(environment.airQuality).toBe(0.8);
      expect(environment.waterAvailability).toBe(0.7);
      expect(environment.temperature).toBe(15); // Default for temperate climate
      expect(environment.humidity).toBe(0.5);
      expect(environment.windStrength).toBe(0.3);
    });

    it('should create environment with provided valid values', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.EXTREME_HEAT,
        severity: 0.6
      });

      const environment = new Environment({
        density: 0.8,
        terrain: TerrainTypes.DESERT,
        climate: ClimateTypes.ARID,
        lighting: LightingTypes.BRIGHT,
        hazards: [hazard],
        shelterQuality: 0.3,
        airQuality: 0.6,
        waterAvailability: 0.2,
        temperature: 40,
        humidity: 0.1,
        windStrength: 0.7
      });

      expect(environment.density).toBe(0.8);
      expect(environment.terrain).toBe(TerrainTypes.DESERT);
      expect(environment.climate).toBe(ClimateTypes.ARID);
      expect(environment.lighting).toBe(LightingTypes.BRIGHT);
      expect(environment.hazards).toHaveLength(1);
      expect(environment.hazards[0]).toBe(hazard);
      expect(environment.shelterQuality).toBe(0.3);
      expect(environment.airQuality).toBe(0.6);
      expect(environment.waterAvailability).toBe(0.2);
      expect(environment.temperature).toBe(40);
      expect(environment.humidity).toBe(0.1);
      expect(environment.windStrength).toBe(0.7);
    });

    it('should use default values for invalid range inputs', () => {
      const environment = new Environment({
        density: -0.5, // Invalid: below 0
        shelterQuality: 1.5, // Invalid: above 1
        airQuality: 'invalid', // Invalid: not a number
        waterAvailability: null, // Invalid: null
        humidity: undefined, // Invalid: undefined
        windStrength: 2.0 // Invalid: above 1
      });

      expect(environment.density).toBe(0.5); // Default
      expect(environment.shelterQuality).toBe(0.5); // Default
      expect(environment.airQuality).toBe(0.8); // Default
      expect(environment.waterAvailability).toBe(0.7); // Default
      expect(environment.humidity).toBe(0.5); // Default
      expect(environment.windStrength).toBe(0.3); // Default
    });

    it('should use default values for invalid enum inputs', () => {
      const environment = new Environment({
        terrain: 'invalid_terrain',
        climate: 'invalid_climate',
        lighting: 'invalid_lighting'
      });

      expect(environment.terrain).toBe(TerrainTypes.PLAINS);
      expect(environment.climate).toBe(ClimateTypes.TEMPERATE);
      expect(environment.lighting).toBe(LightingTypes.NORMAL);
    });

    it('should filter out invalid hazards and limit to 10', () => {
      const validHazard = new EnvironmentalHazard({
        type: HazardTypes.EXTREME_HEAT,
        severity: 0.5
      });

      // Create 12 hazards (should be limited to 10)
      const hazards = Array(12).fill(validHazard);
      hazards.push('invalid_hazard'); // Invalid hazard

      const environment = new Environment({
        hazards: hazards
      });

      expect(environment.hazards).toHaveLength(10);
      expect(environment.hazards.every(h => h instanceof EnvironmentalHazard)).toBe(true);
    });

    it('should use default temperature for invalid temperature values', () => {
      const environment1 = new Environment({
        climate: ClimateTypes.ARCTIC,
        temperature: -100 // Too cold
      });

      const environment2 = new Environment({
        climate: ClimateTypes.TROPICAL,
        temperature: 100 // Too hot
      });

      const environment3 = new Environment({
        climate: ClimateTypes.TEMPERATE,
        temperature: 'invalid'
      });

      expect(environment1.temperature).toBe(-10); // Arctic default
      expect(environment2.temperature).toBe(28); // Tropical default
      expect(environment3.temperature).toBe(15); // Temperate default
    });

    it('should be immutable after construction', () => {
      const environment = new Environment();
      
      expect(() => {
        environment.density = 0.9;
      }).toThrow();
      
      expect(() => {
        environment.hazards.push('new hazard');
      }).toThrow();
    });
  });

  describe('environmental query methods', () => {
    describe('isHospitable', () => {
      it('should return true for hospitable environment', () => {
        const environment = new Environment({
          shelterQuality: 0.5,
          airQuality: 0.6,
          waterAvailability: 0.5
        });

        expect(environment.isHospitable()).toBe(true);
      });

      it('should return false for inhospitable environment', () => {
        const environment1 = new Environment({
          shelterQuality: 0.2, // Too low
          airQuality: 0.6,
          waterAvailability: 0.5
        });

        const environment2 = new Environment({
          shelterQuality: 0.5,
          airQuality: 0.3, // Too low
          waterAvailability: 0.5
        });

        const environment3 = new Environment({
          shelterQuality: 0.5,
          airQuality: 0.6,
          waterAvailability: 0.2 // Too low
        });

        expect(environment1.isHospitable()).toBe(false);
        expect(environment2.isHospitable()).toBe(false);
        expect(environment3.isHospitable()).toBe(false);
      });
    });

    describe('getComfortLevel', () => {
      it('should calculate comfort level correctly for good conditions', () => {
        const environment = new Environment({
          shelterQuality: 0.9,
          airQuality: 0.9,
          waterAvailability: 0.9,
          temperature: 20,
          hazards: []
        });

        expect(environment.getComfortLevel()).toBe(0.9);
      });

      it('should reduce comfort level for hazards', () => {
        const hazard = new EnvironmentalHazard({
          type: HazardTypes.EXTREME_HEAT,
          severity: 0.5
        });

        const environment = new Environment({
          shelterQuality: 0.9,
          airQuality: 0.9,
          waterAvailability: 0.9,
          temperature: 20,
          hazards: [hazard]
        });

        expect(environment.getComfortLevel()).toBe(0.85); // 0.9 - 0.05 hazard penalty
      });

      it('should reduce comfort level for extreme temperatures', () => {
        const environment1 = new Environment({
          shelterQuality: 0.9,
          airQuality: 0.9,
          waterAvailability: 0.9,
          temperature: -15, // Moderate cold (should be 0.1 penalty)
          hazards: []
        });

        const environment2 = new Environment({
          shelterQuality: 0.9,
          airQuality: 0.9,
          waterAvailability: 0.9,
          temperature: 50, // Extreme heat (should be 0.2 penalty)
          hazards: []
        });

        expect(environment1.getComfortLevel()).toBe(0.8); // 0.9 - 0.1 temperature penalty
        expect(environment2.getComfortLevel()).toBe(0.7); // 0.9 - 0.2 temperature penalty
      });

      it('should not go below 0', () => {
        const hazards = Array(20).fill().map(() => new EnvironmentalHazard({
          type: HazardTypes.EXTREME_HEAT,
          severity: 0.5
        }));

        const environment = new Environment({
          shelterQuality: 0.1,
          airQuality: 0.1,
          waterAvailability: 0.1,
          temperature: -30,
          hazards: hazards.slice(0, 10) // Limited to 10
        });

        expect(environment.getComfortLevel()).toBe(0);
      });
    });

    describe('hasHazardType', () => {
      it('should return true when hazard type is present', () => {
        const hazard = new EnvironmentalHazard({
          type: HazardTypes.EXTREME_HEAT,
          severity: 0.5
        });

        const environment = new Environment({
          hazards: [hazard]
        });

        expect(environment.hasHazardType(HazardTypes.EXTREME_HEAT)).toBe(true);
      });

      it('should return false when hazard type is not present', () => {
        const hazard = new EnvironmentalHazard({
          type: HazardTypes.EXTREME_HEAT,
          severity: 0.5
        });

        const environment = new Environment({
          hazards: [hazard]
        });

        expect(environment.hasHazardType(HazardTypes.EXTREME_COLD)).toBe(false);
      });

      it('should return false when no hazards present', () => {
        const environment = new Environment({
          hazards: []
        });

        expect(environment.hasHazardType(HazardTypes.EXTREME_HEAT)).toBe(false);
      });
    });
  });

  describe('hazard management methods', () => {
    describe('getHazardsByType', () => {
      it('should return hazards of specified type', () => {
        const heatHazard1 = new EnvironmentalHazard({
          type: HazardTypes.EXTREME_HEAT,
          severity: 0.5
        });
        const heatHazard2 = new EnvironmentalHazard({
          type: HazardTypes.EXTREME_HEAT,
          severity: 0.7
        });
        const coldHazard = new EnvironmentalHazard({
          type: HazardTypes.EXTREME_COLD,
          severity: 0.6
        });

        const environment = new Environment({
          hazards: [heatHazard1, heatHazard2, coldHazard]
        });

        const heatHazards = environment.getHazardsByType(HazardTypes.EXTREME_HEAT);
        expect(heatHazards).toHaveLength(2);
        expect(heatHazards).toContain(heatHazard1);
        expect(heatHazards).toContain(heatHazard2);
      });

      it('should return empty array when no hazards of type exist', () => {
        const environment = new Environment({
          hazards: []
        });

        expect(environment.getHazardsByType(HazardTypes.EXTREME_HEAT)).toEqual([]);
      });
    });

    describe('getTotalHazardDanger', () => {
      it('should calculate total danger from all hazards', () => {
        const hazard1 = new EnvironmentalHazard({
          type: HazardTypes.EXTREME_HEAT,
          severity: 0.5
        });
        const hazard2 = new EnvironmentalHazard({
          type: HazardTypes.TOXIC_AIR,
          severity: 0.3
        });

        const environment = new Environment({
          hazards: [hazard1, hazard2]
        });

        const totalDanger = environment.getTotalHazardDanger();
        expect(totalDanger).toBeGreaterThan(0);
        expect(totalDanger).toBeLessThanOrEqual(1.0);
      });

      it('should cap total danger at 1.0', () => {
        const hazards = Array(10).fill().map(() => new EnvironmentalHazard({
          type: HazardTypes.EXTREME_HEAT,
          severity: 0.8
        }));

        const environment = new Environment({
          hazards: hazards
        });

        expect(environment.getTotalHazardDanger()).toBe(1.0);
      });

      it('should return 0 when no hazards present', () => {
        const environment = new Environment({
          hazards: []
        });

        expect(environment.getTotalHazardDanger()).toBe(0);
      });
    });

    describe('getMostDangerousHazard', () => {
      it('should return the most dangerous hazard', () => {
        const lowDangerHazard = new EnvironmentalHazard({
          type: HazardTypes.EXTREME_HEAT,
          severity: 0.3
        });
        const highDangerHazard = new EnvironmentalHazard({
          type: HazardTypes.TOXIC_AIR,
          severity: 0.8
        });

        const environment = new Environment({
          hazards: [lowDangerHazard, highDangerHazard]
        });

        expect(environment.getMostDangerousHazard()).toBe(highDangerHazard);
      });

      it('should return null when no hazards present', () => {
        const environment = new Environment({
          hazards: []
        });

        expect(environment.getMostDangerousHazard()).toBeNull();
      });
    });

    describe('isDangerous', () => {
      it('should return true for high hazard danger', () => {
        // Create multiple hazards to ensure total danger > 0.3
        const hazard1 = new EnvironmentalHazard({
          type: HazardTypes.EXTREME_HEAT,
          severity: 0.8
        });
        const hazard2 = new EnvironmentalHazard({
          type: HazardTypes.TOXIC_AIR,
          severity: 0.6
        });

        const environment = new Environment({
          hazards: [hazard1, hazard2],
          shelterQuality: 0.8,
          airQuality: 0.8,
          waterAvailability: 0.8,
          temperature: 20
        });

        expect(environment.isDangerous()).toBe(true);
      });

      it('should return true for inhospitable conditions', () => {
        const environment = new Environment({
          hazards: [],
          shelterQuality: 0.2, // Low shelter quality
          airQuality: 0.8,
          waterAvailability: 0.8,
          temperature: 20
        });

        expect(environment.isDangerous()).toBe(true);
      });

      it('should return true for extreme temperatures', () => {
        const environment1 = new Environment({
          hazards: [],
          shelterQuality: 0.8,
          airQuality: 0.8,
          waterAvailability: 0.8,
          temperature: -20 // Extreme cold
        });

        const environment2 = new Environment({
          hazards: [],
          shelterQuality: 0.8,
          airQuality: 0.8,
          waterAvailability: 0.8,
          temperature: 45 // Extreme heat
        });

        expect(environment1.isDangerous()).toBe(true);
        expect(environment2.isDangerous()).toBe(true);
      });

      it('should return false for safe conditions', () => {
        const environment = new Environment({
          hazards: [],
          shelterQuality: 0.8,
          airQuality: 0.8,
          waterAvailability: 0.8,
          temperature: 20
        });

        expect(environment.isDangerous()).toBe(false);
      });
    });
  });

  describe('modifier calculation methods', () => {
    describe('getVisibilityModifier', () => {
      it('should calculate visibility modifier based on lighting', () => {
        const brightEnv = new Environment({ lighting: LightingTypes.BRIGHT });
        const dimEnv = new Environment({ lighting: LightingTypes.DIM });
        const darkEnv = new Environment({ lighting: LightingTypes.DARK });
        const magicalEnv = new Environment({ lighting: LightingTypes.MAGICAL });

        expect(brightEnv.getVisibilityModifier()).toBe(1.3);
        expect(dimEnv.getVisibilityModifier()).toBe(0.8);
        expect(darkEnv.getVisibilityModifier()).toBe(0.4);
        expect(magicalEnv.getVisibilityModifier()).toBe(1.1);
      });

      it('should reduce visibility for high humidity', () => {
        const environment = new Environment({
          lighting: LightingTypes.NORMAL,
          humidity: 0.9
        });

        expect(environment.getVisibilityModifier()).toBe(0.9); // 1.0 * 0.9
      });

      it('should reduce visibility for strong winds', () => {
        const environment = new Environment({
          lighting: LightingTypes.NORMAL,
          windStrength: 0.8
        });

        expect(environment.getVisibilityModifier()).toBe(0.95); // 1.0 * 0.95
      });

      it('should cap visibility modifier between 0.1 and 2.0', () => {
        const lowVisEnv = new Environment({
          lighting: LightingTypes.DARK,
          humidity: 0.9,
          windStrength: 0.8
        });

        const highVisEnv = new Environment({
          lighting: LightingTypes.BRIGHT,
          humidity: 0.1,
          windStrength: 0.1
        });

        expect(lowVisEnv.getVisibilityModifier()).toBeGreaterThanOrEqual(0.1);
        expect(highVisEnv.getVisibilityModifier()).toBeLessThanOrEqual(2.0);
      });
    });

    describe('getMovementModifier', () => {
      it('should calculate movement modifier based on terrain', () => {
        const plainsEnv = new Environment({ terrain: TerrainTypes.PLAINS });
        const forestEnv = new Environment({ terrain: TerrainTypes.FOREST });
        const mountainEnv = new Environment({ terrain: TerrainTypes.MOUNTAINS });
        const desertEnv = new Environment({ terrain: TerrainTypes.DESERT });
        const swampEnv = new Environment({ terrain: TerrainTypes.SWAMP });
        const urbanEnv = new Environment({ terrain: TerrainTypes.URBAN });

        expect(plainsEnv.getMovementModifier()).toBe(1.2);
        expect(forestEnv.getMovementModifier()).toBe(0.8);
        expect(mountainEnv.getMovementModifier()).toBe(0.6);
        expect(desertEnv.getMovementModifier()).toBe(0.7);
        expect(swampEnv.getMovementModifier()).toBe(0.5);
        expect(urbanEnv.getMovementModifier()).toBe(1.0);
      });

      it('should reduce movement for high density', () => {
        const environment = new Environment({
          terrain: TerrainTypes.PLAINS,
          density: 0.9
        });

        expect(environment.getMovementModifier()).toBe(0.96); // 1.2 * 0.8
      });

      it('should cap movement modifier between 0.1 and 2.0', () => {
        const slowEnv = new Environment({
          terrain: TerrainTypes.SWAMP,
          density: 0.9
        });

        const fastEnv = new Environment({
          terrain: TerrainTypes.PLAINS,
          density: 0.1
        });

        expect(slowEnv.getMovementModifier()).toBeGreaterThanOrEqual(0.1);
        expect(fastEnv.getMovementModifier()).toBeLessThanOrEqual(2.0);
      });
    });

    describe('supportsActivity', () => {
      it('should support stealth in appropriate conditions', () => {
        const forestEnv = new Environment({
          terrain: TerrainTypes.FOREST,
          lighting: LightingTypes.DIM
        });

        const urbanEnv = new Environment({
          terrain: TerrainTypes.URBAN,
          lighting: LightingTypes.NORMAL
        });

        const crowdedEnv = new Environment({
          terrain: TerrainTypes.PLAINS,
          lighting: LightingTypes.NORMAL,
          density: 0.8
        });

        expect(forestEnv.supportsActivity('stealth')).toBe(true);
        expect(urbanEnv.supportsActivity('stealth')).toBe(true);
        expect(crowdedEnv.supportsActivity('stealth')).toBe(true);
      });

      it('should not support stealth in bright open areas', () => {
        const environment = new Environment({
          terrain: TerrainTypes.PLAINS,
          lighting: LightingTypes.BRIGHT,
          density: 0.2
        });

        expect(environment.supportsActivity('stealth')).toBe(false);
      });

      it('should support combat in open areas', () => {
        const environment = new Environment({
          shelterQuality: 0.5 // Not too sheltered
        });

        expect(environment.supportsActivity('combat')).toBe(true);
      });

      it('should support social activities in urban/crowded areas', () => {
        const urbanEnv = new Environment({
          terrain: TerrainTypes.URBAN
        });

        const crowdedEnv = new Environment({
          density: 0.6
        });

        expect(urbanEnv.supportsActivity('social')).toBe(true);
        expect(crowdedEnv.supportsActivity('social')).toBe(true);
      });

      it('should support survival with adequate resources', () => {
        const environment = new Environment({
          waterAvailability: 0.5,
          airQuality: 0.6
        });

        expect(environment.supportsActivity('survival')).toBe(true);
      });

      it('should return true for unknown activity types', () => {
        const environment = new Environment();

        expect(environment.supportsActivity('unknown_activity')).toBe(true);
      });
    });
  });

  describe('serialization methods', () => {
    describe('toJSON', () => {
      it('should serialize environment to JSON', () => {
        const hazard = new EnvironmentalHazard({
          type: HazardTypes.EXTREME_HEAT,
          severity: 0.5
        });

        const environment = new Environment({
          density: 0.8,
          terrain: TerrainTypes.DESERT,
          climate: ClimateTypes.ARID,
          lighting: LightingTypes.BRIGHT,
          hazards: [hazard],
          shelterQuality: 0.3,
          airQuality: 0.6,
          waterAvailability: 0.2,
          temperature: 40,
          humidity: 0.1,
          windStrength: 0.7
        });

        const json = environment.toJSON();

        expect(json.density).toBe(0.8);
        expect(json.terrain).toBe(TerrainTypes.DESERT);
        expect(json.climate).toBe(ClimateTypes.ARID);
        expect(json.lighting).toBe(LightingTypes.BRIGHT);
        expect(json.hazards).toHaveLength(1);
        expect(json.hazards[0].type).toBe(hazard.type);
        expect(json.hazards[0].severity).toBe(hazard.severity);
        expect(json.shelterQuality).toBe(0.3);
        expect(json.airQuality).toBe(0.6);
        expect(json.waterAvailability).toBe(0.2);
        expect(json.temperature).toBe(40);
        expect(json.humidity).toBe(0.1);
        expect(json.windStrength).toBe(0.7);
      });
    });

    describe('fromJSON', () => {
      it('should deserialize environment from JSON', () => {
        const hazardData = {
          type: HazardTypes.EXTREME_HEAT,
          severity: 0.5,
          description: 'Test hazard'
        };

        const jsonData = {
          density: 0.8,
          terrain: TerrainTypes.DESERT,
          climate: ClimateTypes.ARID,
          lighting: LightingTypes.BRIGHT,
          hazards: [hazardData],
          shelterQuality: 0.3,
          airQuality: 0.6,
          waterAvailability: 0.2,
          temperature: 40,
          humidity: 0.1,
          windStrength: 0.7
        };

        const environment = Environment.fromJSON(jsonData);

        expect(environment.density).toBe(0.8);
        expect(environment.terrain).toBe(TerrainTypes.DESERT);
        expect(environment.climate).toBe(ClimateTypes.ARID);
        expect(environment.lighting).toBe(LightingTypes.BRIGHT);
        expect(environment.hazards).toHaveLength(1);
        expect(environment.hazards[0]).toBeInstanceOf(EnvironmentalHazard);
        expect(environment.shelterQuality).toBe(0.3);
        expect(environment.airQuality).toBe(0.6);
        expect(environment.waterAvailability).toBe(0.2);
        expect(environment.temperature).toBe(40);
        expect(environment.humidity).toBe(0.1);
        expect(environment.windStrength).toBe(0.7);
      });

      it('should throw ValidationError for invalid JSON data', () => {
        expect(() => Environment.fromJSON(null)).toThrow(ValidationError);
        expect(() => Environment.fromJSON('invalid')).toThrow(ValidationError);
        expect(() => Environment.fromJSON(123)).toThrow(ValidationError);
      });

      it('should handle missing hazards array', () => {
        const jsonData = {
          density: 0.5,
          terrain: TerrainTypes.PLAINS
        };

        const environment = Environment.fromJSON(jsonData);
        expect(environment.hazards).toEqual([]);
      });
    });
  });

  describe('static factory methods', () => {
    describe('createDefault', () => {
      it('should create a default environment', () => {
        const environment = Environment.createDefault();

        expect(environment.density).toBe(0.5);
        expect(environment.terrain).toBe(TerrainTypes.PLAINS);
        expect(environment.climate).toBe(ClimateTypes.TEMPERATE);
        expect(environment.lighting).toBe(LightingTypes.NORMAL);
        expect(environment.hazards).toEqual([]);
        expect(environment.shelterQuality).toBe(0.5);
        expect(environment.airQuality).toBe(0.8);
        expect(environment.waterAvailability).toBe(0.7);
        expect(environment.humidity).toBe(0.5);
        expect(environment.windStrength).toBe(0.3);
      });
    });

    describe('createHostile', () => {
      it('should create a hostile environment', () => {
        const environment = Environment.createHostile();

        expect(environment.density).toBe(0.2);
        expect(environment.terrain).toBe(TerrainTypes.DESERT);
        expect(environment.climate).toBe(ClimateTypes.ARID);
        expect(environment.lighting).toBe(LightingTypes.DIM);
        expect(environment.shelterQuality).toBe(0.2);
        expect(environment.airQuality).toBe(0.5);
        expect(environment.waterAvailability).toBe(0.2);
        expect(environment.humidity).toBe(0.1);
        expect(environment.windStrength).toBe(0.7);
      });
    });

    describe('createSafe', () => {
      it('should create a safe environment', () => {
        const environment = Environment.createSafe();

        expect(environment.density).toBe(0.6);
        expect(environment.terrain).toBe(TerrainTypes.URBAN);
        expect(environment.climate).toBe(ClimateTypes.TEMPERATE);
        expect(environment.lighting).toBe(LightingTypes.BRIGHT);
        expect(environment.shelterQuality).toBe(0.9);
        expect(environment.airQuality).toBe(0.9);
        expect(environment.waterAvailability).toBe(0.9);
        expect(environment.humidity).toBe(0.5);
        expect(environment.windStrength).toBe(0.2);
      });
    });
  });

  describe('withModifications', () => {
    it('should create a new environment with modifications', () => {
      const original = new Environment({
        density: 0.5,
        terrain: TerrainTypes.PLAINS
      });

      const modified = original.withModifications({
        density: 0.8,
        terrain: TerrainTypes.FOREST
      });

      expect(original.density).toBe(0.5);
      expect(original.terrain).toBe(TerrainTypes.PLAINS);
      expect(modified.density).toBe(0.8);
      expect(modified.terrain).toBe(TerrainTypes.FOREST);
      expect(modified).not.toBe(original);
    });
  });

  describe('immutability', () => {
    it('should be immutable after construction', () => {
      const environment = new Environment();

      expect(() => {
        environment.density = 0.9;
      }).toThrow();

      expect(() => {
        environment.terrain = TerrainTypes.FOREST;
      }).toThrow();

      expect(() => {
        environment.hazards = [];
      }).toThrow();
    });

    it('should have immutable hazards array', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.EXTREME_HEAT,
        severity: 0.5
      });

      const environment = new Environment({
        hazards: [hazard]
      });

      expect(() => {
        environment.hazards.push(hazard);
      }).toThrow();

      expect(() => {
        environment.hazards[0] = null;
      }).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle extreme values gracefully', () => {
      const environment = new Environment({
        density: Number.MAX_VALUE,
        shelterQuality: -1, // Invalid negative value
        temperature: Number.NEGATIVE_INFINITY,
        humidity: Number.POSITIVE_INFINITY
      });

      expect(environment.density).toBe(0.5); // Default
      expect(environment.shelterQuality).toBe(0.5); // Default
      expect(environment.temperature).toBe(15); // Default for temperate
      expect(environment.humidity).toBe(0.5); // Default
    });

    it('should handle NaN values', () => {
      const environment = new Environment({
        density: NaN,
        shelterQuality: NaN,
        temperature: NaN
      });

      expect(environment.density).toBe(0.5); // Default
      expect(environment.shelterQuality).toBe(0.5); // Default
      expect(environment.temperature).toBe(15); // Default for temperate
    });
  });
});