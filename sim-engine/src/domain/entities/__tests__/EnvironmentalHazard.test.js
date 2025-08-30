// src/domain/entities/__tests__/EnvironmentalHazard.test.js

import EnvironmentalHazard from '../EnvironmentalHazard.js';
import { HazardTypes } from '../../../shared/constants/HazardTypes.js';
import { ValidationError } from '../../../shared/types/ValueObjectTypes.js';

describe('EnvironmentalHazard Entity', () => {
  describe('Construction', () => {
    test('should create hazard with valid configuration', () => {
      const config = {
        type: HazardTypes.EXTREME_HEAT,
        severity: 0.5,
        description: 'Scorching desert heat'
      };

      const hazard = new EnvironmentalHazard(config);

      expect(hazard.type).toBe(HazardTypes.EXTREME_HEAT);
      expect(hazard.severity).toBe(0.5);
      expect(hazard.description).toBe('Scorching desert heat');
      expect(hazard.id).toBeDefined();
      expect(hazard.id).toMatch(/^hazard_extreme_heat_/);
    });

    test('should create hazard with default description when none provided', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.TOXIC_AIR,
        severity: 0.3
      });

      expect(hazard.description).toBe('Poisonous gases or polluted atmosphere');
    });

    test('should generate unique IDs for different hazards', () => {
      const hazard1 = new EnvironmentalHazard({
        type: HazardTypes.WILD_ANIMALS,
        severity: 0.4
      });

      const hazard2 = new EnvironmentalHazard({
        type: HazardTypes.WILD_ANIMALS,
        severity: 0.4
      });

      expect(hazard1.id).not.toBe(hazard2.id);
    });

    test('should accept custom ID', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.BANDITS,
        severity: 0.6,
        id: 'custom-hazard-id'
      });

      expect(hazard.id).toBe('custom-hazard-id');
    });
  });

  describe('Validation', () => {
    test('should throw error when type is missing', () => {
      expect(() => {
        new EnvironmentalHazard({ severity: 0.5 });
      }).toThrow(ValidationError);
      expect(() => {
        new EnvironmentalHazard({ severity: 0.5 });
      }).toThrow('Hazard type is required');
    });

    test('should throw error when type is invalid', () => {
      expect(() => {
        new EnvironmentalHazard({
          type: 'invalid_hazard_type',
          severity: 0.5
        });
      }).toThrow(ValidationError);
      expect(() => {
        new EnvironmentalHazard({
          type: 'invalid_hazard_type',
          severity: 0.5
        });
      }).toThrow('Invalid hazard type: invalid_hazard_type');
    });

    test('should throw error when severity is not a number', () => {
      expect(() => {
        new EnvironmentalHazard({
          type: HazardTypes.DISEASE,
          severity: 'high'
        });
      }).toThrow(ValidationError);
      expect(() => {
        new EnvironmentalHazard({
          type: HazardTypes.DISEASE,
          severity: 'high'
        });
      }).toThrow('Severity must be a number');
    });

    test('should throw error when severity is below 0.0', () => {
      expect(() => {
        new EnvironmentalHazard({
          type: HazardTypes.ALTITUDE,
          severity: -0.1
        });
      }).toThrow(ValidationError);
      expect(() => {
        new EnvironmentalHazard({
          type: HazardTypes.ALTITUDE,
          severity: -0.1
        });
      }).toThrow('Severity must be between 0.0 and 1.0');
    });

    test('should throw error when severity is above 1.0', () => {
      expect(() => {
        new EnvironmentalHazard({
          type: HazardTypes.RADIATION,
          severity: 1.1
        });
      }).toThrow(ValidationError);
      expect(() => {
        new EnvironmentalHazard({
          type: HazardTypes.RADIATION,
          severity: 1.1
        });
      }).toThrow('Severity must be between 0.0 and 1.0');
    });

    test('should accept boundary severity values', () => {
      const hazard1 = new EnvironmentalHazard({
        type: HazardTypes.SUPERNATURAL,
        severity: 0.0
      });

      const hazard2 = new EnvironmentalHazard({
        type: HazardTypes.SUPERNATURAL,
        severity: 1.0
      });

      expect(hazard1.severity).toBe(0.0);
      expect(hazard2.severity).toBe(1.0);
    });
  });

  describe('Danger Calculations', () => {
    test('should return correct base danger for hazard type', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.SUPERNATURAL,
        severity: 0.5
      });

      expect(hazard.getBaseDanger()).toBe(0.6); // From HazardTypes constants
    });

    test('should calculate effective danger based on severity', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.EXTREME_HEAT, // Base danger: 0.3
        severity: 0.5
      });

      expect(hazard.getEffectiveDanger()).toBe(0.15); // 0.3 * 0.5
    });

    test('should cap effective danger at 1.0', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.SUPERNATURAL, // Base danger: 0.6
        severity: 1.0
      });

      expect(hazard.getEffectiveDanger()).toBe(0.6);
      expect(hazard.getEffectiveDanger()).toBeLessThanOrEqual(1.0);
    });

    test('should return zero effective danger for zero severity', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.RADIATION,
        severity: 0.0
      });

      expect(hazard.getEffectiveDanger()).toBe(0.0);
    });
  });

  describe('Category and Classification', () => {
    test('should return correct category for hazard type', () => {
      const environmentalHazard = new EnvironmentalHazard({
        type: HazardTypes.EXTREME_COLD,
        severity: 0.4
      });

      const supernaturalHazard = new EnvironmentalHazard({
        type: HazardTypes.SUPERNATURAL,
        severity: 0.7
      });

      expect(environmentalHazard.getCategory()).toBe('environmental');
      expect(supernaturalHazard.getCategory()).toBe('supernatural');
    });

    test('should correctly identify if hazard is of specific category', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.WILD_ANIMALS,
        severity: 0.5
      });

      expect(hazard.isOfCategory('biological')).toBe(true);
      expect(hazard.isOfCategory('BIOLOGICAL')).toBe(true); // Case insensitive
      expect(hazard.isOfCategory('environmental')).toBe(false);
    });

    test('should determine if hazard is dangerous', () => {
      const minorHazard = new EnvironmentalHazard({
        type: HazardTypes.ALTITUDE,
        severity: 0.3
      });

      const dangerousHazard = new EnvironmentalHazard({
        type: HazardTypes.RADIATION,
        severity: 0.8
      });

      expect(minorHazard.isDangerous()).toBe(false);
      expect(dangerousHazard.isDangerous()).toBe(true);
    });
  });

  describe('Attribute Effects', () => {
    test('should return scaled attribute modifiers based on severity', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.EXTREME_HEAT, // Base: constitution: -2, endurance: -3
        severity: 0.5
      });

      const modifiers = hazard.getAttributeModifiers();
      expect(modifiers.constitution).toBe(-1); // -2 * 0.5 = -1
      expect(modifiers.endurance).toBe(-1); // -3 * 0.5 = -1.5, rounded to -1
    });

    test('should return specific attribute effect', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.TOXIC_AIR, // Base: constitution: -3, perception: -1
        severity: 1.0
      });

      expect(hazard.getAttributeEffect('constitution')).toBe(-3);
      expect(hazard.getAttributeEffect('perception')).toBe(-1);
      expect(hazard.getAttributeEffect('strength')).toBe(0); // Not affected
    });

    test('should correctly identify which attributes are affected', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.SUPERNATURAL, // Base: wisdom: -2, sanity: -3
        severity: 0.6
      });

      expect(hazard.affectsAttribute('wisdom')).toBe(true);
      expect(hazard.affectsAttribute('sanity')).toBe(true);
      expect(hazard.affectsAttribute('strength')).toBe(false);
    });

    test('should return copy of modifiers to prevent external modification', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.WILD_ANIMALS,
        severity: 0.8
      });

      const modifiers1 = hazard.getAttributeModifiers();
      const modifiers2 = hazard.getAttributeModifiers();

      expect(modifiers1).not.toBe(modifiers2); // Different objects
      expect(modifiers1).toEqual(modifiers2); // Same content
    });
  });

  describe('Severity Descriptions', () => {
    test('should return correct severity descriptions', () => {
      const testCases = [
        { severity: 0.1, expected: 'Minor' },
        { severity: 0.3, expected: 'Moderate' },
        { severity: 0.5, expected: 'Significant' },
        { severity: 0.7, expected: 'Severe' },
        { severity: 0.9, expected: 'Extreme' }
      ];

      testCases.forEach(({ severity, expected }) => {
        const hazard = new EnvironmentalHazard({
          type: HazardTypes.DISEASE,
          severity
        });
        expect(hazard.getSeverityDescription()).toBe(expected);
      });
    });
  });

  describe('Modification Methods', () => {
    test('should update severity correctly', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.BANDITS,
        severity: 0.3
      });

      hazard.updateSeverity(0.7);
      expect(hazard.severity).toBe(0.7);
    });

    test('should validate new severity when updating', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.STRUCTURAL_INSTABILITY,
        severity: 0.4
      });

      expect(() => {
        hazard.updateSeverity(1.5);
      }).toThrow(ValidationError);
    });

    test('should update description correctly', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.EXTREME_COLD,
        severity: 0.6
      });

      hazard.updateDescription('Bitter arctic winds');
      expect(hazard.description).toBe('Bitter arctic winds');
    });

    test('should validate new description when updating', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.DISEASE,
        severity: 0.5
      });

      expect(() => {
        hazard.updateDescription(123);
      }).toThrow(ValidationError);
    });

    test('should clear cached attribute modifiers when severity changes', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.EXTREME_HEAT,
        severity: 0.5
      });

      const originalModifiers = hazard.getAttributeModifiers();
      hazard.updateSeverity(1.0);
      const newModifiers = hazard.getAttributeModifiers();

      expect(newModifiers.constitution).not.toBe(originalModifiers.constitution);
    });
  });

  describe('Cloning and Comparison', () => {
    test('should create exact clone when no modifications provided', () => {
      const original = new EnvironmentalHazard({
        type: HazardTypes.RADIATION,
        severity: 0.8,
        description: 'Magical radiation'
      });

      const clone = original.clone();

      expect(clone.type).toBe(original.type);
      expect(clone.severity).toBe(original.severity);
      expect(clone.description).toBe(original.description);
      expect(clone.id).not.toBe(original.id); // Should have different ID
    });

    test('should create modified clone when modifications provided', () => {
      const original = new EnvironmentalHazard({
        type: HazardTypes.WILD_ANIMALS,
        severity: 0.4,
        description: 'Wolves'
      });

      const clone = original.clone({
        severity: 0.8,
        description: 'Dire wolves'
      });

      expect(clone.type).toBe(original.type);
      expect(clone.severity).toBe(0.8);
      expect(clone.description).toBe('Dire wolves');
    });

    test('should correctly compare hazards for equality', () => {
      const hazard1 = new EnvironmentalHazard({
        type: HazardTypes.SUPERNATURAL,
        severity: 0.6,
        description: 'Ghostly presence'
      });

      const hazard2 = new EnvironmentalHazard({
        type: HazardTypes.SUPERNATURAL,
        severity: 0.6,
        description: 'Ghostly presence'
      });

      const hazard3 = new EnvironmentalHazard({
        type: HazardTypes.SUPERNATURAL,
        severity: 0.7,
        description: 'Ghostly presence'
      });

      expect(hazard1.equals(hazard2)).toBe(true);
      expect(hazard1.equals(hazard3)).toBe(false);
      expect(hazard1.equals(null)).toBe(false);
      expect(hazard1.equals('not a hazard')).toBe(false);
    });

    test('should handle small floating point differences in equality', () => {
      const hazard1 = new EnvironmentalHazard({
        type: HazardTypes.ALTITUDE,
        severity: 0.5
      });

      const hazard2 = new EnvironmentalHazard({
        type: HazardTypes.ALTITUDE,
        severity: 0.502 // Larger difference outside tolerance
      });

      expect(hazard1.equals(hazard2)).toBe(false);

      const hazard3 = new EnvironmentalHazard({
        type: HazardTypes.ALTITUDE,
        severity: 0.5001 // Tiny difference within tolerance
      });

      expect(hazard1.equals(hazard3)).toBe(true);
    });
  });

  describe('Serialization', () => {
    test('should serialize to JSON correctly', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.TOXIC_AIR,
        severity: 0.7,
        description: 'Poisonous fumes',
        id: 'test-hazard-id'
      });

      const json = hazard.toJSON();

      expect(json).toEqual({
        id: 'test-hazard-id',
        type: HazardTypes.TOXIC_AIR,
        severity: 0.7,
        description: 'Poisonous fumes'
      });
    });

    test('should deserialize from JSON correctly', () => {
      const jsonData = {
        id: 'test-hazard-id',
        type: HazardTypes.BANDITS,
        severity: 0.6,
        description: 'Highway robbers'
      };

      const hazard = EnvironmentalHazard.fromJSON(jsonData);

      expect(hazard.id).toBe('test-hazard-id');
      expect(hazard.type).toBe(HazardTypes.BANDITS);
      expect(hazard.severity).toBe(0.6);
      expect(hazard.description).toBe('Highway robbers');
    });

    test('should throw error when deserializing invalid JSON', () => {
      expect(() => {
        EnvironmentalHazard.fromJSON(null);
      }).toThrow(ValidationError);

      expect(() => {
        EnvironmentalHazard.fromJSON('not an object');
      }).toThrow(ValidationError);
    });

    test('should round-trip serialize and deserialize correctly', () => {
      const original = new EnvironmentalHazard({
        type: HazardTypes.STRUCTURAL_INSTABILITY,
        severity: 0.45,
        description: 'Crumbling ruins'
      });

      const json = original.toJSON();
      const restored = EnvironmentalHazard.fromJSON(json);

      expect(restored.equals(original)).toBe(true);
    });
  });

  describe('Static Factory Methods', () => {
    test('should create hazard with random severity', () => {
      const hazard = EnvironmentalHazard.createWithRandomSeverity(
        HazardTypes.EXTREME_HEAT,
        0.3,
        0.8
      );

      expect(hazard.type).toBe(HazardTypes.EXTREME_HEAT);
      expect(hazard.severity).toBeGreaterThanOrEqual(0.3);
      expect(hazard.severity).toBeLessThanOrEqual(0.8);
    });

    test('should create hazard with random severity using defaults', () => {
      const hazard = EnvironmentalHazard.createWithRandomSeverity(HazardTypes.DISEASE);

      expect(hazard.type).toBe(HazardTypes.DISEASE);
      expect(hazard.severity).toBeGreaterThanOrEqual(0.1);
      expect(hazard.severity).toBeLessThanOrEqual(0.9);
    });

    test('should create multiple hazards from configurations', () => {
      const configs = [
        { type: HazardTypes.WILD_ANIMALS, severity: 0.4 },
        { type: HazardTypes.TOXIC_AIR, severity: 0.6 },
        { type: HazardTypes.SUPERNATURAL, severity: 0.8 }
      ];

      const hazards = EnvironmentalHazard.createMultiple(configs);

      expect(hazards).toHaveLength(3);
      expect(hazards[0].type).toBe(HazardTypes.WILD_ANIMALS);
      expect(hazards[1].type).toBe(HazardTypes.TOXIC_AIR);
      expect(hazards[2].type).toBe(HazardTypes.SUPERNATURAL);
    });

    test('should throw error when creating multiple with invalid input', () => {
      expect(() => {
        EnvironmentalHazard.createMultiple('not an array');
      }).toThrow(ValidationError);
    });
  });

  describe('Edge Cases', () => {
    test('should handle all valid hazard types', () => {
      const allTypes = Object.values(HazardTypes);
      
      allTypes.forEach(type => {
        expect(() => {
          new EnvironmentalHazard({ type, severity: 0.5 });
        }).not.toThrow();
      });
    });

    test('should handle precision in severity calculations', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.RADIATION,
        severity: 0.333333
      });

      expect(hazard.severity).toBe(0.333333);
      expect(hazard.getEffectiveDanger()).toBeCloseTo(0.166667, 5);
    });

    test('should maintain immutability of returned modifier objects', () => {
      const hazard = new EnvironmentalHazard({
        type: HazardTypes.EXTREME_COLD,
        severity: 0.8
      });

      const modifiers = hazard.getAttributeModifiers();
      modifiers.constitution = 999; // Try to modify

      const modifiers2 = hazard.getAttributeModifiers();
      expect(modifiers2.constitution).not.toBe(999);
    });
  });
});