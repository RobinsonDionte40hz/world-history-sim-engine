// src/domain/services/__tests__/NodeMigrationService.test.js

import NodeMigrationService from '../NodeMigrationService.js';
import { TerrainTypes } from '../../../shared/constants/TerrainTypes.js';
import { ClimateTypes } from '../../../shared/constants/ClimateTypes.js';
import { LightingTypes } from '../../../shared/constants/LightingTypes.js';
import { ConnectionTypes } from '../../../shared/constants/ConnectionTypes.js';

describe('NodeMigrationService', () => {
  describe('migrateExistingNode', () => {
    it('should migrate a basic old node with minimal properties', () => {
      const oldNode = {
        id: 'node1',
        name: 'Old Node',
        description: 'An old node',
        type: 'location'
      };

      const migrated = NodeMigrationService.migrateExistingNode(oldNode);

      // Should preserve original properties
      expect(migrated.id).toBe('node1');
      expect(migrated.name).toBe('Old Node');
      expect(migrated.description).toBe('An old node');
      expect(migrated.type).toBe('location');

      // Should add environmental properties
      expect(migrated.environment).toBeDefined();
      expect(migrated.environment.density).toBe(0.5);
      expect(migrated.environment.terrain).toBe(TerrainTypes.PLAINS);
      expect(migrated.environment.climate).toBe(ClimateTypes.TEMPERATE);
      expect(migrated.environment.lighting).toBe(LightingTypes.NORMAL);
      expect(Array.isArray(migrated.environment.hazards)).toBe(true);
      expect(migrated.environment.hazards.length).toBe(0);

      // Should add size property
      expect(migrated.size).toBe(100); // Default size

      // Should add connections array
      expect(Array.isArray(migrated.connections)).toBe(true);
      expect(migrated.connections.length).toBe(0);

      // Should set population
      expect(migrated.population).toBe(0);
    });

    it('should migrate node with connectedNodes to connections format', () => {
      const oldNode = {
        id: 'node1',
        name: 'Connected Node',
        connectedNodes: ['node2', 'node3', 'node4']
      };

      const migrated = NodeMigrationService.migrateExistingNode(oldNode);

      expect(migrated.connections).toBeDefined();
      expect(migrated.connections.length).toBe(3);
      
      migrated.connections.forEach((connection, index) => {
        expect(connection.targetNodeId).toBe(oldNode.connectedNodes[index]);
        expect(connection.type).toBe(ConnectionTypes.ROAD);
        expect(connection.difficulty).toBe(1);
        expect(connection.distance).toBe(1);
        expect(connection.bidirectional).toBe(true);
        expect(Array.isArray(connection.conditions)).toBe(true);
        expect(typeof connection.modifiers).toBe('object');
      });
    });

    it('should preserve existing connections and not convert connectedNodes', () => {
      const oldNode = {
        id: 'node1',
        name: 'Node with existing connections',
        connectedNodes: ['node2', 'node3'],
        connections: [
          {
            targetNodeId: 'node4',
            type: ConnectionTypes.MOUNTAIN_PASS,
            difficulty: 5,
            distance: 2,
            bidirectional: true,
            conditions: [],
            modifiers: {}
          }
        ]
      };

      const migrated = NodeMigrationService.migrateExistingNode(oldNode);

      // Should preserve existing connections, not convert connectedNodes
      expect(migrated.connections.length).toBe(1);
      expect(migrated.connections[0].targetNodeId).toBe('node4');
      expect(migrated.connections[0].type).toBe(ConnectionTypes.MOUNTAIN_PASS);
    });

    it('should merge partial environmental data with defaults', () => {
      const oldNode = {
        id: 'node1',
        name: 'Partial Environment Node',
        environment: {
          terrain: TerrainTypes.FOREST,
          climate: ClimateTypes.TROPICAL,
          density: 0.8
          // Missing other properties
        }
      };

      const migrated = NodeMigrationService.migrateExistingNode(oldNode);

      // Should preserve existing values
      expect(migrated.environment.terrain).toBe(TerrainTypes.FOREST);
      expect(migrated.environment.climate).toBe(ClimateTypes.TROPICAL);
      expect(migrated.environment.density).toBe(0.8);

      // Should add missing values with defaults
      expect(migrated.environment.lighting).toBe(LightingTypes.NORMAL);
      expect(migrated.environment.shelterQuality).toBe(0.5);
      expect(migrated.environment.airQuality).toBe(0.8);
      expect(migrated.environment.waterAvailability).toBe(0.7);
      expect(migrated.environment.temperature).toBe(15);
      expect(migrated.environment.humidity).toBe(0.5);
      expect(migrated.environment.windStrength).toBe(0.3);
    });

    it('should set appropriate default size based on node type', () => {
      const testCases = [
        { type: 'settlement', expectedSize: 150 },
        { type: 'city', expectedSize: 300 },
        { type: 'village', expectedSize: 80 },
        { type: 'fortress', expectedSize: 100 },
        { type: 'dungeon', expectedSize: 50 },
        { type: 'unknown_type', expectedSize: 100 }
      ];

      testCases.forEach(({ type, expectedSize }) => {
        const oldNode = {
          id: `node_${type}`,
          name: `Test ${type}`,
          type
        };

        const migrated = NodeMigrationService.migrateExistingNode(oldNode);
        expect(migrated.size).toBe(expectedSize);
      });
    });

    it('should preserve existing size if valid', () => {
      const oldNode = {
        id: 'node1',
        name: 'Node with size',
        size: 250
      };

      const migrated = NodeMigrationService.migrateExistingNode(oldNode);
      expect(migrated.size).toBe(250);
    });

    it('should fix invalid environmental values', () => {
      const oldNode = {
        id: 'node1',
        name: 'Invalid Environment Node',
        environment: {
          density: -0.5, // Invalid: below 0
          terrain: 'invalid_terrain',
          climate: 'invalid_climate',
          lighting: 'invalid_lighting',
          shelterQuality: 1.5, // Invalid: above 1
          airQuality: 'not_a_number',
          waterAvailability: null,
          temperature: 100, // Invalid: too hot
          humidity: -0.2, // Invalid: below 0
          windStrength: 2.0, // Invalid: above 1
          hazards: 'not_an_array'
        }
      };

      const migrated = NodeMigrationService.migrateExistingNode(oldNode);

      // Should fix all invalid values with defaults
      expect(migrated.environment.density).toBe(0.5);
      expect(migrated.environment.terrain).toBe(TerrainTypes.PLAINS);
      expect(migrated.environment.climate).toBe(ClimateTypes.TEMPERATE);
      expect(migrated.environment.lighting).toBe(LightingTypes.NORMAL);
      expect(migrated.environment.shelterQuality).toBe(0.5);
      expect(migrated.environment.airQuality).toBe(0.8);
      expect(migrated.environment.waterAvailability).toBe(0.7);
      expect(migrated.environment.temperature).toBe(15);
      expect(migrated.environment.humidity).toBe(0.5);
      expect(migrated.environment.windStrength).toBe(0.3);
      expect(Array.isArray(migrated.environment.hazards)).toBe(true);
      expect(migrated.environment.hazards.length).toBe(0);
    });

    it('should handle invalid connectedNodes gracefully', () => {
      const oldNode = {
        id: 'node1',
        name: 'Invalid Connected Nodes',
        connectedNodes: ['valid_node', null, '', undefined, 123, 'another_valid_node']
      };

      const migrated = NodeMigrationService.migrateExistingNode(oldNode);

      // Should only convert valid string node IDs
      expect(migrated.connections.length).toBe(2);
      expect(migrated.connections[0].targetNodeId).toBe('valid_node');
      expect(migrated.connections[1].targetNodeId).toBe('another_valid_node');
    });

    it('should throw error for invalid input', () => {
      expect(() => NodeMigrationService.migrateExistingNode(null)).toThrow('Invalid node data');
      expect(() => NodeMigrationService.migrateExistingNode(undefined)).toThrow('Invalid node data');
      expect(() => NodeMigrationService.migrateExistingNode('not an object')).toThrow('Invalid node data');
      expect(() => NodeMigrationService.migrateExistingNode(123)).toThrow('Invalid node data');
    });

    it('should preserve all original properties during migration', () => {
      const oldNode = {
        id: 'node1',
        name: 'Complex Node',
        description: 'A complex node with many properties',
        type: 'settlement',
        position: { x: 10, y: 20 },
        interactions: [{ id: 'int1', name: 'Test Interaction' }],
        resources: { gold: 100, food: 50 },
        population: 75,
        customProperty: 'custom value',
        anotherProperty: { nested: 'data' }
      };

      const migrated = NodeMigrationService.migrateExistingNode(oldNode);

      // All original properties should be preserved
      expect(migrated.id).toBe(oldNode.id);
      expect(migrated.name).toBe(oldNode.name);
      expect(migrated.description).toBe(oldNode.description);
      expect(migrated.type).toBe(oldNode.type);
      expect(migrated.position).toEqual(oldNode.position);
      expect(migrated.interactions).toEqual(oldNode.interactions);
      expect(migrated.resources).toEqual(oldNode.resources);
      expect(migrated.population).toBe(oldNode.population);
      expect(migrated.customProperty).toBe(oldNode.customProperty);
      expect(migrated.anotherProperty).toEqual(oldNode.anotherProperty);

      // New properties should be added
      expect(migrated.environment).toBeDefined();
      expect(migrated.size).toBeDefined();
      expect(migrated.connections).toBeDefined();
    });
  });

  describe('migrateWorld', () => {
    it('should migrate all nodes in world data', () => {
      const worldData = {
        id: 'world1',
        name: 'Test World',
        nodes: [
          { id: 'node1', name: 'Node 1', type: 'settlement' },
          { id: 'node2', name: 'Node 2', type: 'dungeon', connectedNodes: ['node1'] },
          { id: 'node3', name: 'Node 3', type: 'wilderness' }
        ],
        characters: [
          { id: 'char1', name: 'Character 1' }
        ]
      };

      const migrated = NodeMigrationService.migrateWorld(worldData);

      // Should preserve world properties
      expect(migrated.id).toBe('world1');
      expect(migrated.name).toBe('Test World');
      expect(migrated.characters).toEqual(worldData.characters);

      // Should migrate all nodes
      expect(migrated.nodes.length).toBe(3);
      migrated.nodes.forEach(node => {
        expect(node.environment).toBeDefined();
        expect(node.size).toBeDefined();
        expect(node.connections).toBeDefined();
      });

      // Check specific migrations
      expect(migrated.nodes[0].size).toBe(150); // settlement default
      expect(migrated.nodes[1].size).toBe(50);  // dungeon default
      expect(migrated.nodes[1].connections.length).toBe(1); // converted connectedNodes
      expect(migrated.nodes[2].size).toBe(200); // wilderness default
    });

    it('should migrate template nodes in world data', () => {
      const worldData = {
        id: 'world1',
        name: 'Test World',
        nodes: [],
        templates: {
          nodes: [
            {
              id: 'template1',
              name: 'Village Template',
              data: { id: 'village1', name: 'Template Village', type: 'village' }
            },
            {
              id: 'template2',
              name: 'Dungeon Template',
              data: { id: 'dungeon1', name: 'Template Dungeon', type: 'dungeon' }
            }
          ]
        }
      };

      const migrated = NodeMigrationService.migrateWorld(worldData);

      expect(migrated.templates.nodes.length).toBe(2);
      migrated.templates.nodes.forEach(template => {
        expect(template.data.environment).toBeDefined();
        expect(template.data.size).toBeDefined();
        expect(template.data.connections).toBeDefined();
      });

      expect(migrated.templates.nodes[0].data.size).toBe(80);  // village default
      expect(migrated.templates.nodes[1].data.size).toBe(50); // dungeon default
    });

    it('should handle world data without nodes', () => {
      const worldData = {
        id: 'world1',
        name: 'Empty World',
        characters: []
      };

      const migrated = NodeMigrationService.migrateWorld(worldData);

      expect(migrated.id).toBe('world1');
      expect(migrated.name).toBe('Empty World');
      expect(migrated.characters).toEqual([]);
    });

    it('should throw error for invalid world data', () => {
      expect(() => NodeMigrationService.migrateWorld(null)).toThrow('Invalid world data');
      expect(() => NodeMigrationService.migrateWorld(undefined)).toThrow('Invalid world data');
      expect(() => NodeMigrationService.migrateWorld('not an object')).toThrow('Invalid world data');
    });
  });

  describe('needsMigration', () => {
    it('should return true for nodes missing environmental properties', () => {
      const node = {
        id: 'node1',
        name: 'Old Node'
      };

      expect(NodeMigrationService.needsMigration(node)).toBe(true);
    });

    it('should return true for nodes with incomplete environmental properties', () => {
      const node = {
        id: 'node1',
        name: 'Partial Node',
        environment: {
          terrain: TerrainTypes.FOREST
          // Missing other properties
        }
      };

      expect(NodeMigrationService.needsMigration(node)).toBe(true);
    });

    it('should return true for nodes missing size property', () => {
      const node = {
        id: 'node1',
        name: 'No Size Node',
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

      expect(NodeMigrationService.needsMigration(node)).toBe(true);
    });

    it('should return true for nodes with old connectedNodes format', () => {
      const node = {
        id: 'node1',
        name: 'Old Format Node',
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
        },
        size: 100,
        connectedNodes: ['node2', 'node3']
      };

      expect(NodeMigrationService.needsMigration(node)).toBe(true);
    });

    it('should return false for fully migrated nodes', () => {
      const node = {
        id: 'node1',
        name: 'Migrated Node',
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
        },
        size: 100,
        connections: []
      };

      expect(NodeMigrationService.needsMigration(node)).toBe(false);
    });

    it('should return false for invalid input', () => {
      expect(NodeMigrationService.needsMigration(null)).toBe(false);
      expect(NodeMigrationService.needsMigration(undefined)).toBe(false);
      expect(NodeMigrationService.needsMigration('not an object')).toBe(false);
    });
  });

  describe('analyzeMigration', () => {
    it('should analyze what changes would be made', () => {
      const node = {
        id: 'node1',
        name: 'Analysis Node',
        connectedNodes: ['node2', 'node3']
      };

      const analysis = NodeMigrationService.analyzeMigration(node);

      expect(analysis.needsMigration).toBe(true);
      expect(analysis.changes).toContain('Add complete environmental properties');
      expect(analysis.changes).toContain('Add default size property');
      expect(analysis.changes).toContain('Convert 2 connected nodes to connection objects');
    });

    it('should identify partial environmental properties', () => {
      const node = {
        id: 'node1',
        name: 'Partial Node',
        environment: {
          terrain: TerrainTypes.FOREST,
          climate: ClimateTypes.TROPICAL
          // Missing other properties
        },
        size: 100
      };

      const analysis = NodeMigrationService.analyzeMigration(node);

      expect(analysis.needsMigration).toBe(true);
      expect(analysis.changes.some(change => change.includes('missing environmental property'))).toBe(true);
    });

    it('should return no changes for fully migrated nodes', () => {
      const node = {
        id: 'node1',
        name: 'Complete Node',
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
        },
        size: 100,
        connections: []
      };

      const analysis = NodeMigrationService.analyzeMigration(node);

      expect(analysis.needsMigration).toBe(false);
      expect(analysis.changes.length).toBe(0);
    });
  });

  describe('migrateBatch', () => {
    it('should migrate multiple nodes with progress tracking', () => {
      const nodes = [
        { id: 'node1', name: 'Node 1' },
        { id: 'node2', name: 'Node 2', connectedNodes: ['node1'] },
        { id: 'node3', name: 'Node 3', type: 'settlement' }
      ];

      const progressUpdates = [];
      const progressCallback = (progress) => {
        progressUpdates.push(progress);
      };

      const migrated = NodeMigrationService.migrateBatch(nodes, progressCallback);

      expect(migrated.length).toBe(3);
      expect(progressUpdates.length).toBe(3);

      // Check progress updates
      expect(progressUpdates[0]).toEqual({
        current: 1,
        total: 3,
        percentage: 33,
        currentNode: 'Node 1'
      });

      expect(progressUpdates[2]).toEqual({
        current: 3,
        total: 3,
        percentage: 100,
        currentNode: 'Node 3'
      });

      // Check migrations
      migrated.forEach(node => {
        expect(node.environment).toBeDefined();
        expect(node.size).toBeDefined();
        expect(node.connections).toBeDefined();
      });
    });

    it('should work without progress callback', () => {
      const nodes = [
        { id: 'node1', name: 'Node 1' },
        { id: 'node2', name: 'Node 2' }
      ];

      const migrated = NodeMigrationService.migrateBatch(nodes);

      expect(migrated.length).toBe(2);
      migrated.forEach(node => {
        expect(node.environment).toBeDefined();
        expect(node.size).toBeDefined();
        expect(node.connections).toBeDefined();
      });
    });

    it('should throw error for invalid input', () => {
      expect(() => NodeMigrationService.migrateBatch('not an array')).toThrow('Nodes must be an array');
      expect(() => NodeMigrationService.migrateBatch(null)).toThrow('Nodes must be an array');
    });

    it('should provide detailed error for failed migrations', () => {
      const nodes = [
        { id: 'node1', name: 'Valid Node' },
        null, // This will cause migration to fail
        { id: 'node3', name: 'Another Valid Node' }
      ];

      expect(() => NodeMigrationService.migrateBatch(nodes)).toThrow(/Failed to migrate node.*1/);
    });
  });

  describe('validation', () => {
    it('should validate that migration preserves original functionality', () => {
      const originalNode = {
        id: 'test_node',
        name: 'Test Node',
        description: 'A test node',
        type: 'settlement',
        position: { x: 10, y: 20 },
        interactions: [{ id: 'int1' }],
        resources: { gold: 100 },
        population: 50,
        connectedNodes: ['node2', 'node3']
      };

      const migrated = NodeMigrationService.migrateExistingNode(originalNode);

      // All original properties should be preserved exactly
      expect(migrated.id).toBe(originalNode.id);
      expect(migrated.name).toBe(originalNode.name);
      expect(migrated.description).toBe(originalNode.description);
      expect(migrated.type).toBe(originalNode.type);
      expect(migrated.position).toEqual(originalNode.position);
      expect(migrated.interactions).toEqual(originalNode.interactions);
      expect(migrated.resources).toEqual(originalNode.resources);
      expect(migrated.population).toBe(originalNode.population);

      // Connected nodes should be preserved in connections
      const connectedNodeIds = migrated.connections.map(conn => conn.targetNodeId);
      expect(connectedNodeIds).toEqual(originalNode.connectedNodes);
    });

    it('should throw validation error if original properties are modified', () => {
      // This test simulates a bug in migration that would modify original properties
      const originalValidation = NodeMigrationService._validateMigratedNode;
      
      // Mock validation to simulate a property modification
      NodeMigrationService._validateMigratedNode = (migrated, original) => {
        migrated.name = 'Modified Name'; // Simulate accidental modification
        originalValidation.call(NodeMigrationService, migrated, original);
      };

      const node = { id: 'node1', name: 'Original Name' };

      expect(() => NodeMigrationService.migrateExistingNode(node)).toThrow(/Property name was modified during migration/);

      // Restore original validation
      NodeMigrationService._validateMigratedNode = originalValidation;
    });
  });
});