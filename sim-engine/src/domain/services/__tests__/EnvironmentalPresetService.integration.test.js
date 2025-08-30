// src/domain/services/__tests__/EnvironmentalPresetService.integration.test.js

import EnvironmentalPresetService from '../EnvironmentalPresetService.js';
import Node from '../../entities/Node.js';
import Environment from '../../value-objects/Environment.js';
import EnvironmentalHazard from '../../entities/EnvironmentalHazard.js';
import EnvironmentalCalculationService from '../EnvironmentalCalculationService.js';
import { TerrainTypes } from '../../../shared/constants/TerrainTypes.js';
import { ClimateTypes } from '../../../shared/constants/ClimateTypes.js';
import { HazardTypes } from '../../../shared/constants/HazardTypes.js';

describe('EnvironmentalPresetService Integration', () => {
  describe('Integration with Node entity', () => {
    test('should create a Node with preset-applied data', () => {
      // Apply preset to basic node data
      const nodeData = {
        name: 'Test Forest Village',
        description: 'A test village in the forest'
      };
      
      const enhancedData = EnvironmentalPresetService.applyPreset(nodeData, 'forest_village');
      
      // Create Node with enhanced data
      const node = new Node(enhancedData);
      
      expect(node.name).toBe('Test Forest Village');
      expect(node.type).toBe('settlement');
      expect(node.size).toBe(150);
      expect(node.environment).toBeInstanceOf(Environment);
      expect(node.environment.terrain).toBe(TerrainTypes.FOREST);
      expect(node.environment.climate).toBe(ClimateTypes.TEMPERATE);
    });

    test('should work with EnvironmentalCalculationService', () => {
      // Create a node with a dangerous preset
      const nodeData = EnvironmentalPresetService.applyPreset({}, 'haunted_ruins');
      const node = new Node(nodeData);
      
      // Calculate danger using the calculation service
      const danger = EnvironmentalCalculationService.calculateDanger(node);
      
      expect(danger).toBeGreaterThan(0.5); // Should be dangerous due to hazards
      expect(node.environment.hazards.length).toBe(2); // Should have supernatural and structural hazards
    });

    test('should preserve Node functionality with preset data', () => {
      // Apply preset and create node
      const nodeData = EnvironmentalPresetService.applyPreset({
        name: 'Mountain Keep'
      }, 'mountain_fortress');
      
      const node = new Node(nodeData);
      
      // Test Node methods work correctly
      expect(node.getEnvironmentalDanger()).toBeGreaterThan(0);
      expect(node.getEnvironmentalModifiers('combat')).toBeDefined();
      expect(node.getPopulationDensity()).toBe(0); // No population assigned yet
      expect(node.isOvercrowded()).toBe(false);
      
      // Test environment methods
      expect(node.environment.isHospitable()).toBe(true); // Mountain fortress should be hospitable
      expect(node.environment.hasHazardType(HazardTypes.ALTITUDE)).toBe(true);
    });
  });

  describe('Integration with Environment value object', () => {
    test('should create valid Environment from preset data', () => {
      const preset = EnvironmentalPresetService.getPreset('desert_oasis');
      const environmentData = {
        ...preset.environment,
        hazards: preset.environment.hazards.map(h => new EnvironmentalHazard(h))
      };
      
      const environment = new Environment(environmentData);
      
      expect(environment.terrain).toBe(TerrainTypes.DESERT);
      expect(environment.climate).toBe(ClimateTypes.ARID);
      expect(environment.hasHazardType(HazardTypes.EXTREME_HEAT)).toBe(true);
      expect(environment.getComfortLevel()).toBeLessThan(0.7); // Desert should be less comfortable
    });

    test('should handle preset with no hazards', () => {
      const preset = EnvironmentalPresetService.getPreset('coastal_port');
      const environmentData = {
        ...preset.environment,
        hazards: preset.environment.hazards.map(h => new EnvironmentalHazard(h))
      };
      
      const environment = new Environment(environmentData);
      
      expect(environment.hazards).toHaveLength(0);
      expect(environment.getTotalHazardDanger()).toBe(0);
      expect(environment.isHospitable()).toBe(true);
    });
  });

  describe('Custom preset workflow', () => {
    test('should create custom preset from existing Node and apply it to new Node', () => {
      // Create a node with custom environment
      const originalNode = new Node({
        name: 'Original Custom Settlement',
        type: 'settlement',
        size: 180,
        environment: {
          density: 0.75,
          terrain: TerrainTypes.PLAINS,
          climate: ClimateTypes.TEMPERATE,
          lighting: 'normal',
          hazards: [],
          shelterQuality: 0.85,
          airQuality: 0.9,
          waterAvailability: 0.8,
          temperature: 20,
          humidity: 0.5,
          windStrength: 0.2
        }
      });
      
      // Create custom preset from the node
      const customPreset = EnvironmentalPresetService.createCustomPreset(
        'Prosperous Plains Settlement',
        'A well-developed settlement on fertile plains',
        {
          type: originalNode.type,
          size: originalNode.size,
          environment: originalNode.environment
        }
      );
      
      expect(customPreset.name).toBe('Prosperous Plains Settlement');
      expect(customPreset.isCustom).toBe(true);
      expect(customPreset.environment.terrain).toBe(TerrainTypes.PLAINS);
      
      // Since we can't actually register the custom preset in the service,
      // we'll simulate applying it by manually creating the node data
      const simulatedNodeData = {
        ...customPreset.nodeProperties,
        name: 'New Settlement',
        description: customPreset.description,
        environment: customPreset.environment
      };
      
      const newNode = new Node(simulatedNodeData);
      
      expect(newNode.name).toBe('New Settlement');
      expect(newNode.type).toBe('settlement');
      expect(newNode.size).toBe(180);
      expect(newNode.environment.terrain).toBe(TerrainTypes.PLAINS);
      expect(newNode.environment.shelterQuality).toBe(0.85);
    });
  });

  describe('Preset recommendations', () => {
    test('should recommend appropriate presets for node characteristics', () => {
      const nodeData = {
        type: 'settlement',
        environment: {
          terrain: TerrainTypes.FOREST,
          climate: ClimateTypes.TEMPERATE
        }
      };
      
      const recommendations = EnvironmentalPresetService.getPresetRecommendations(nodeData);
      
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Top recommendation should be forest_village due to matching terrain and type
      const topRec = recommendations[0];
      expect(topRec.presetId).toBe('forest_village');
      expect(topRec.score).toBeGreaterThan(40); // High score for matching type and terrain
    });

    test('should handle nodes with partial environment data', () => {
      const nodeData = {
        type: 'dungeon'
      };
      
      const recommendations = EnvironmentalPresetService.getPresetRecommendations(nodeData);
      
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Should recommend haunted_ruins for dungeon type
      const dungeonRec = recommendations.find(rec => rec.presetId === 'haunted_ruins');
      expect(dungeonRec).toBeDefined();
      expect(dungeonRec.reason).toContain('dungeon type');
    });
  });

  describe('Validation integration', () => {
    test('should validate preset compatibility with existing node data', () => {
      const nodeData = {
        type: 'settlement',
        environment: {
          terrain: TerrainTypes.FOREST,
          climate: ClimateTypes.TEMPERATE
        }
      };
      
      // Compatible preset
      const compatibleResult = EnvironmentalPresetService.validatePresetCompatibility(nodeData, 'forest_village');
      expect(compatibleResult.isValid).toBe(true);
      
      // Incompatible preset
      const incompatibleResult = EnvironmentalPresetService.validatePresetCompatibility(nodeData, 'desert_oasis');
      expect(incompatibleResult.isValid).toBe(false);
      expect(incompatibleResult.errors.some(error => error.includes('terrain'))).toBe(true);
    });

    test('should validate custom preset data before creation', () => {
      const validNodeData = {
        type: 'settlement',
        environment: {
          density: 0.6,
          terrain: TerrainTypes.URBAN,
          climate: ClimateTypes.TEMPERATE,
          lighting: 'normal',
          hazards: [],
          shelterQuality: 0.8,
          airQuality: 0.7,
          waterAvailability: 0.9,
          temperature: 18,
          humidity: 0.6,
          windStrength: 0.3
        }
      };
      
      expect(() => {
        EnvironmentalPresetService.createCustomPreset(
          'Valid Urban Settlement',
          'A well-planned urban settlement',
          validNodeData
        );
      }).not.toThrow();
      
      const invalidNodeData = {
        type: 'settlement',
        environment: {
          density: 1.5, // Invalid range
          terrain: TerrainTypes.URBAN
          // Missing required properties
        }
      };
      
      expect(() => {
        EnvironmentalPresetService.createCustomPreset(
          'Invalid Settlement',
          'This should fail',
          invalidNodeData
        );
      }).toThrow();
    });
  });
});