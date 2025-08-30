// src/domain/services/__tests__/EnvironmentalValidator.test.js

import EnvironmentalValidator from '../EnvironmentalValidator.js';
import { TerrainTypes } from '../../../shared/constants/TerrainTypes.js';
import { ClimateTypes } from '../../../shared/constants/ClimateTypes.js';
import { LightingTypes } from '../../../shared/constants/LightingTypes.js';
import { ConnectionTypes } from '../../../shared/constants/ConnectionTypes.js';
import { HazardTypes } from '../../../shared/constants/HazardTypes.js';

describe('EnvironmentalValidator', () => {
  describe('validateEnvironment', () => {
    describe('basic validation', () => {
      test('should validate a valid environment', () => {
        const environment = {
          density: 0.5,
          terrain: TerrainTypes.PLAINS,
          climate: ClimateTypes.TEMPERATE,
          lighting: LightingTypes.NORMAL,
          hazards: [],
          shelterQuality: 0.7,
          airQuality: 0.8,
          waterAvailability: 0.6,
          temperature: 20,
          humidity: 0.5,
          windStrength: 0.3
        };

        const result = EnvironmentalValidator.validateEnvironment(environment);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      test('should reject null or undefined environment', () => {
        const result1 = EnvironmentalValidator.validateEnvironment(null);
        const result2 = EnvironmentalValidator.validateEnvironment(undefined);

        expect(result1.isValid).toBe(false);
        expect(result1.errors).toContain('Environment must be a valid object');
        expect(result2.isValid).toBe(false);
        expect(result2.errors).toContain('Environment must be a valid object');
      });

      test('should reject non-object environment', () => {
        const result = EnvironmentalValidator.validateEnvironment('invalid');

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Environment must be a valid object');
      });
    });

    describe('range validation', () => {
      test('should validate density range', () => {
        const validEnvironment = { density: 0.5 };
        const invalidEnvironment1 = { density: -0.1 };
        const invalidEnvironment2 = { density: 1.1 };
        const invalidEnvironment3 = { density: 'invalid' };

        expect(EnvironmentalValidator.validateEnvironment(validEnvironment).isValid).toBe(true);
        
        const result1 = EnvironmentalValidator.validateEnvironment(invalidEnvironment1);
        expect(result1.isValid).toBe(false);
        expect(result1.errors).toContain('Density must be between 0.0 and 1.0');

        const result2 = EnvironmentalValidator.validateEnvironment(invalidEnvironment2);
        expect(result2.isValid).toBe(false);
        expect(result2.errors).toContain('Density must be between 0.0 and 1.0');

        const result3 = EnvironmentalValidator.validateEnvironment(invalidEnvironment3);
        expect(result3.isValid).toBe(false);
        expect(result3.errors).toContain('density must be a valid number');
      });

      test('should validate shelter quality range', () => {
        const validEnvironment = { shelterQuality: 0.8 };
        const invalidEnvironment = { shelterQuality: 1.5 };

        expect(EnvironmentalValidator.validateEnvironment(validEnvironment).isValid).toBe(true);
        
        const result = EnvironmentalValidator.validateEnvironment(invalidEnvironment);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Shelter quality must be between 0.0 and 1.0');
      });

      test('should validate air quality range', () => {
        const validEnvironment = { airQuality: 0.9 };
        const invalidEnvironment = { airQuality: -0.1 };

        expect(EnvironmentalValidator.validateEnvironment(validEnvironment).isValid).toBe(true);
        
        const result = EnvironmentalValidator.validateEnvironment(invalidEnvironment);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Air quality must be between 0.0 and 1.0');
      });

      test('should validate water availability range', () => {
        const validEnvironment = { waterAvailability: 0.7 };
        const invalidEnvironment = { waterAvailability: 2.0 };

        expect(EnvironmentalValidator.validateEnvironment(validEnvironment).isValid).toBe(true);
        
        const result = EnvironmentalValidator.validateEnvironment(invalidEnvironment);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Water availability must be between 0.0 and 1.0');
      });

      test('should validate humidity range', () => {
        const validEnvironment = { humidity: 0.6 };
        const invalidEnvironment = { humidity: 1.2 };

        expect(EnvironmentalValidator.validateEnvironment(validEnvironment).isValid).toBe(true);
        
        const result = EnvironmentalValidator.validateEnvironment(invalidEnvironment);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Humidity must be between 0.0 and 1.0');
      });

      test('should validate wind strength range', () => {
        const validEnvironment = { windStrength: 0.4 };
        const invalidEnvironment = { windStrength: -0.5 };

        expect(EnvironmentalValidator.validateEnvironment(validEnvironment).isValid).toBe(true);
        
        const result = EnvironmentalValidator.validateEnvironment(invalidEnvironment);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Wind strength must be between 0.0 and 1.0');
      });

      test('should validate temperature range', () => {
        const validEnvironment = { temperature: 25 };
        const invalidEnvironment1 = { temperature: -60 };
        const invalidEnvironment2 = { temperature: 70 };

        expect(EnvironmentalValidator.validateEnvironment(validEnvironment).isValid).toBe(true);
        
        const result1 = EnvironmentalValidator.validateEnvironment(invalidEnvironment1);
        expect(result1.isValid).toBe(false);
        expect(result1.errors).toContain('Temperature must be between -50°C and 60°C');

        const result2 = EnvironmentalValidator.validateEnvironment(invalidEnvironment2);
        expect(result2.isValid).toBe(false);
        expect(result2.errors).toContain('Temperature must be between -50°C and 60°C');
      });

      test('should handle special numeric values', () => {
        const invalidEnvironment1 = { density: NaN };
        const invalidEnvironment2 = { density: Infinity };
        const invalidEnvironment3 = { density: -Infinity };

        const result1 = EnvironmentalValidator.validateEnvironment(invalidEnvironment1);
        expect(result1.isValid).toBe(false);
        expect(result1.errors).toContain('density must be a valid number');

        const result2 = EnvironmentalValidator.validateEnvironment(invalidEnvironment2);
        expect(result2.isValid).toBe(false);
        expect(result2.errors).toContain('density must be a valid number');

        const result3 = EnvironmentalValidator.validateEnvironment(invalidEnvironment3);
        expect(result3.isValid).toBe(false);
        expect(result3.errors).toContain('density must be a valid number');
      });
    });

    describe('enum validation', () => {
      test('should validate terrain types', () => {
        const validEnvironment = { terrain: TerrainTypes.FOREST };
        const invalidEnvironment = { terrain: 'invalid_terrain' };

        expect(EnvironmentalValidator.validateEnvironment(validEnvironment).isValid).toBe(true);
        
        const result = EnvironmentalValidator.validateEnvironment(invalidEnvironment);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('Invalid terrain type: invalid_terrain');
      });

      test('should validate climate types', () => {
        const validEnvironment = { climate: ClimateTypes.TROPICAL };
        const invalidEnvironment = { climate: 'invalid_climate' };

        expect(EnvironmentalValidator.validateEnvironment(validEnvironment).isValid).toBe(true);
        
        const result = EnvironmentalValidator.validateEnvironment(invalidEnvironment);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('Invalid climate type: invalid_climate');
      });

      test('should validate lighting types', () => {
        const validEnvironment = { lighting: LightingTypes.DIM };
        const invalidEnvironment = { lighting: 'invalid_lighting' };

        expect(EnvironmentalValidator.validateEnvironment(validEnvironment).isValid).toBe(true);
        
        const result = EnvironmentalValidator.validateEnvironment(invalidEnvironment);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('Invalid lighting type: invalid_lighting');
      });
    });

    describe('hazard validation', () => {
      test('should validate valid hazards array', () => {
        const environment = {
          hazards: [
            { type: HazardTypes.EXTREME_HEAT, severity: 0.5 },
            { type: HazardTypes.WILD_ANIMALS, severity: 0.3 }
          ]
        };

        const result = EnvironmentalValidator.validateEnvironment(environment);
        expect(result.isValid).toBe(true);
      });

      test('should reject non-array hazards', () => {
        const environment = { hazards: 'invalid' };

        const result = EnvironmentalValidator.validateEnvironment(environment);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Hazards must be an array');
      });

      test('should validate hazard objects', () => {
        const environment = {
          hazards: [
            null,
            { type: 'invalid_type', severity: 0.5 },
            { severity: 0.5 }, // missing type
            { type: HazardTypes.DISEASE, severity: 1.5 }, // invalid severity
            { type: HazardTypes.BANDITS, severity: 'invalid' } // invalid severity type
          ]
        };

        const result = EnvironmentalValidator.validateEnvironment(environment);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Hazard 1: Must be a valid object');
        expect(result.errors.some(error => error.includes('Hazard 2: Invalid hazard type \'invalid_type\''))).toBe(true);
        expect(result.errors).toContain('Hazard 3: Type is required');
        expect(result.errors).toContain('Hazard 4: Severity must be between 0.0 and 1.0');
        expect(result.errors.some(error => error.includes('severity must be a valid number'))).toBe(true);
      });

      test('should warn about too many hazards', () => {
        const hazards = Array.from({ length: 12 }, (_, i) => ({
          type: HazardTypes.WILD_ANIMALS,
          severity: 0.1
        }));
        const environment = { hazards };

        const result = EnvironmentalValidator.validateEnvironment(environment);
        expect(result.warnings).toContain('Large number of hazards (12) may impact performance. Consider limiting to 10 or fewer.');
      });

      test('should warn about high severity hazards', () => {
        const environment = {
          hazards: [{ type: HazardTypes.RADIATION, severity: 0.9 }]
        };

        const result = EnvironmentalValidator.validateEnvironment(environment);
        expect(result.warnings).toContain('Hazard 1: Very high severity (0.9) may make the environment extremely dangerous');
      });
    });

    describe('logical consistency warnings', () => {
      test('should warn about arid climate with high water availability', () => {
        const environment = {
          climate: ClimateTypes.ARID,
          waterAvailability: 0.8
        };

        const result = EnvironmentalValidator.validateEnvironment(environment);
        expect(result.warnings).toContain('Arid climates typically have low water availability (< 0.7)');
      });

      test('should warn about tropical climate with low water availability', () => {
        const environment = {
          climate: ClimateTypes.TROPICAL,
          waterAvailability: 0.3
        };

        const result = EnvironmentalValidator.validateEnvironment(environment);
        expect(result.warnings).toContain('Tropical climates typically have high water availability (> 0.5)');
      });

      test('should warn about arid climate with high humidity', () => {
        const environment = {
          climate: ClimateTypes.ARID,
          humidity: 0.8
        };

        const result = EnvironmentalValidator.validateEnvironment(environment);
        expect(result.warnings).toContain('Arid climates typically have low humidity (< 0.6)');
      });

      test('should warn about urban terrain with low shelter quality', () => {
        const environment = {
          terrain: TerrainTypes.URBAN,
          shelterQuality: 0.3
        };

        const result = EnvironmentalValidator.validateEnvironment(environment);
        expect(result.warnings).toContain('Urban areas typically have better shelter quality (> 0.5)');
      });

      test('should warn about arctic climate with high temperature', () => {
        const environment = {
          climate: ClimateTypes.ARCTIC,
          temperature: 10
        };

        const result = EnvironmentalValidator.validateEnvironment(environment);
        expect(result.warnings).toContain('Arctic climates typically have temperatures below 5°C');
      });

      test('should warn about underground terrain with bright lighting', () => {
        const environment = {
          terrain: TerrainTypes.UNDERGROUND,
          lighting: LightingTypes.BRIGHT
        };

        const result = EnvironmentalValidator.validateEnvironment(environment);
        expect(result.warnings).toContain('Underground areas typically have dim or dark lighting conditions');
      });
    });

    describe('hazard combination warnings', () => {
      test('should warn about conflicting temperature hazards', () => {
        const environment = {
          hazards: [
            { type: HazardTypes.EXTREME_HEAT, severity: 0.5 },
            { type: HazardTypes.EXTREME_COLD, severity: 0.5 }
          ]
        };

        const result = EnvironmentalValidator.validateEnvironment(environment);
        expect(result.warnings).toContain('Conflicting temperature hazards: extreme heat and extreme cold cannot coexist');
      });

      test('should warn about high combined severity', () => {
        const environment = {
          hazards: [
            { type: HazardTypes.RADIATION, severity: 1.0 },
            { type: HazardTypes.TOXIC_AIR, severity: 1.0 },
            { type: HazardTypes.DISEASE, severity: 1.0 },
            { type: HazardTypes.WILD_ANIMALS, severity: 0.5 }
          ]
        };

        const result = EnvironmentalValidator.validateEnvironment(environment);
        expect(result.warnings).toContain('Combined hazard severity (3.5) is extremely high and may be overwhelming');
      });

      test('should warn about dangerous hazard combinations', () => {
        const environment = {
          hazards: [
            { type: HazardTypes.TOXIC_AIR, severity: 0.5 },
            { type: HazardTypes.DISEASE, severity: 0.5 }
          ]
        };

        const result = EnvironmentalValidator.validateEnvironment(environment);
        expect(result.warnings).toContain('Toxic air combined with disease creates an extremely hazardous environment');
      });
    });

    describe('options handling', () => {
      test('should disable warnings when warnings option is false', () => {
        const environment = {
          climate: ClimateTypes.ARID,
          waterAvailability: 0.8
        };

        const result = EnvironmentalValidator.validateEnvironment(environment, { warnings: false });
        expect(result.warnings).toHaveLength(0);
      });

      test('should handle strict mode', () => {
        const environment = {
          density: 0.5,
          terrain: TerrainTypes.PLAINS
        };

        const result = EnvironmentalValidator.validateEnvironment(environment, { strict: true });
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('validateConnections', () => {
    describe('basic validation', () => {
      test('should validate valid connections array', () => {
        const connections = [
          {
            targetNodeId: 'node1',
            type: ConnectionTypes.ROAD,
            difficulty: 2,
            distance: 5,
            bidirectional: true
          },
          {
            targetNodeId: 'node2',
            type: ConnectionTypes.RIVER,
            difficulty: 3,
            distance: 10
          }
        ];

        const result = EnvironmentalValidator.validateConnections(connections);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      test('should reject non-array connections', () => {
        const result = EnvironmentalValidator.validateConnections('invalid');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Connections must be an array');
      });

      test('should validate empty connections array', () => {
        const result = EnvironmentalValidator.validateConnections([]);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('connection field validation', () => {
      test('should require targetNodeId', () => {
        const connections = [{ type: ConnectionTypes.ROAD, difficulty: 1 }];

        const result = EnvironmentalValidator.validateConnections(connections);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Connection 1: Target node ID is required');
      });

      test('should validate connection type', () => {
        const connections = [
          { targetNodeId: 'node1', type: 'invalid_type', difficulty: 1 }
        ];

        const result = EnvironmentalValidator.validateConnections(connections);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('Invalid connection type \'invalid_type\'');
      });

      test('should validate difficulty range', () => {
        const connections = [
          { targetNodeId: 'node1', difficulty: 0 },
          { targetNodeId: 'node2', difficulty: 11 },
          { targetNodeId: 'node3', difficulty: 'invalid' }
        ];

        const result = EnvironmentalValidator.validateConnections(connections);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Connection 1: Difficulty must be between 1 and 10');
        expect(result.errors).toContain('Connection 2: Difficulty must be between 1 and 10');
        expect(result.errors).toContain('Connection 3: difficulty must be a valid number');
      });

      test('should validate distance range', () => {
        const connections = [
          { targetNodeId: 'node1', distance: 0 },
          { targetNodeId: 'node2', distance: 1001 }
        ];

        const result = EnvironmentalValidator.validateConnections(connections);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Connection 1: Distance must be between 0.1 and 1000');
        expect(result.errors).toContain('Connection 2: Distance must be between 0.1 and 1000');
      });

      test('should validate conditions array', () => {
        const connections = [
          { targetNodeId: 'node1', conditions: 'invalid' }
        ];

        const result = EnvironmentalValidator.validateConnections(connections);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Connection 1: Conditions must be an array');
      });

      test('should validate modifiers object', () => {
        const connections = [
          { targetNodeId: 'node1', modifiers: 'invalid' },
          { targetNodeId: 'node2', modifiers: null }
        ];

        const result = EnvironmentalValidator.validateConnections(connections);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Connection 1: Modifiers must be an object');
        expect(result.errors).toContain('Connection 2: Modifiers must be an object');
      });
    });

    describe('node reference validation', () => {
      test('should validate target node exists', () => {
        const connections = [
          { targetNodeId: 'node1', difficulty: 1 },
          { targetNodeId: 'nonexistent', difficulty: 1 }
        ];
        const availableNodes = ['node1', 'node2'];

        const result = EnvironmentalValidator.validateConnections(connections, availableNodes);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Connection 2: Target node \'nonexistent\' does not exist');
      });

      test('should skip node validation when no available nodes provided', () => {
        const connections = [
          { targetNodeId: 'nonexistent', difficulty: 1 }
        ];

        const result = EnvironmentalValidator.validateConnections(connections);
        expect(result.isValid).toBe(true);
      });
    });

    describe('warnings', () => {
      test('should warn about high difficulty', () => {
        const connections = [
          { targetNodeId: 'node1', difficulty: 9 }
        ];

        const result = EnvironmentalValidator.validateConnections(connections);
        expect(result.warnings).toContain('Connection 1: Very high difficulty (9) may make travel extremely challenging');
      });

      test('should warn about long distance', () => {
        const connections = [
          { targetNodeId: 'node1', distance: 150 }
        ];

        const result = EnvironmentalValidator.validateConnections(connections);
        expect(result.warnings).toContain('Connection 1: Very long distance (150) may result in extended travel times');
      });

      test('should warn about teleport with high difficulty', () => {
        const connections = [
          { targetNodeId: 'node1', type: ConnectionTypes.TELEPORT, difficulty: 5 }
        ];

        const result = EnvironmentalValidator.validateConnections(connections);
        expect(result.warnings).toContain('Connection 1: Teleport connections typically have difficulty 1');
      });

      test('should warn about duplicate connections', () => {
        const connections = [
          { targetNodeId: 'node1', difficulty: 1 },
          { targetNodeId: 'node1', difficulty: 2 }
        ];

        const result = EnvironmentalValidator.validateConnections(connections);
        expect(result.warnings).toContain('Duplicate connections found to nodes: node1');
      });

      test('should disable warnings when warnings option is false', () => {
        const connections = [
          { targetNodeId: 'node1', difficulty: 9 }
        ];

        const result = EnvironmentalValidator.validateConnections(connections, [], { warnings: false });
        expect(result.warnings).toHaveLength(0);
      });
    });
  });

  describe('validateNode', () => {
    test('should validate complete node with environment and connections', () => {
      const node = {
        environment: {
          density: 0.5,
          terrain: TerrainTypes.FOREST,
          climate: ClimateTypes.TEMPERATE
        },
        connections: [
          { targetNodeId: 'node1', difficulty: 2 }
        ],
        size: 100
      };

      const result = EnvironmentalValidator.validateNode(node);
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid node object', () => {
      const result = EnvironmentalValidator.validateNode(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Node must be a valid object');
    });

    test('should validate node size', () => {
      const node = { size: 0 };

      const result = EnvironmentalValidator.validateNode(node);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Node size must be between 1 and 10000');
    });

    test('should aggregate errors from environment and connections', () => {
      const node = {
        environment: {
          density: 1.5, // invalid
          terrain: 'invalid' // invalid
        },
        connections: [
          { difficulty: 0 } // invalid, missing targetNodeId
        ]
      };

      const result = EnvironmentalValidator.validateNode(node);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
    });
  });

  describe('getValidationRules', () => {
    test('should return comprehensive validation rules', () => {
      const rules = EnvironmentalValidator.getValidationRules();

      expect(rules).toHaveProperty('environment');
      expect(rules).toHaveProperty('connections');
      expect(rules).toHaveProperty('node');

      expect(rules.environment).toHaveProperty('ranges');
      expect(rules.environment).toHaveProperty('enums');
      expect(rules.environment).toHaveProperty('hazards');

      expect(rules.environment.ranges.density).toEqual({ min: 0, max: 1 });
      expect(rules.environment.ranges.temperature).toEqual({ min: -50, max: 60 });

      expect(rules.connections.ranges.difficulty).toEqual({ min: 1, max: 10 });
      expect(rules.connections.required).toContain('targetNodeId');
    });
  });

  describe('edge cases', () => {
    test('should handle undefined values gracefully', () => {
      const environment = {
        density: undefined,
        terrain: undefined,
        climate: undefined
      };

      const result = EnvironmentalValidator.validateEnvironment(environment);
      expect(result.isValid).toBe(true);
    });

    test('should handle empty objects', () => {
      const result = EnvironmentalValidator.validateEnvironment({});
      expect(result.isValid).toBe(true);
    });

    test('should handle mixed valid and invalid properties', () => {
      const environment = {
        density: 0.5, // valid
        terrain: 'invalid', // invalid
        climate: ClimateTypes.TROPICAL, // valid
        temperature: 100 // invalid
      };

      const result = EnvironmentalValidator.validateEnvironment(environment);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });
});