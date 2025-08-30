// src/domain/entities/__tests__/Node.test.js

import Node from '../Node.js';
import Environment from '../../value-objects/Environment.js';
import NodeConnection from '../../value-objects/NodeConnection.js';
import Position from '../../value-objects/Positions.js';
import Interaction from '../Interaction.js';
import { TerrainTypes } from '../../../shared/constants/TerrainTypes.js';
import { ClimateTypes } from '../../../shared/constants/ClimateTypes.js';
import { LightingTypes } from '../../../shared/constants/LightingTypes.js';
import { ConnectionTypes } from '../../../shared/constants/ConnectionTypes.js';

describe('Node', () => {
  describe('Constructor', () => {
    it('should create a node with default values', () => {
      const node = new Node();
      
      expect(node.id).toBeDefined();
      expect(node.name).toBe('Unnamed Node');
      expect(node.description).toBe('');
      expect(node.type).toBe('location');
      expect(node.position).toBeInstanceOf(Position);
      expect(node.interactions).toEqual([]);
      expect(node.resources).toEqual({});
      expect(node.environment).toBeInstanceOf(Environment);
      expect(node.size).toBe(100);
      expect(node.population).toBe(0);
      expect(node.connections).toEqual([]);
    });

    it('should create a node with provided configuration', () => {
      const config = {
        id: 'test-node',
        name: 'Test Node',
        description: 'A test node',
        type: 'settlement',
        size: 200,
        population: 50,
        resources: { gold: 100 }
      };

      const node = new Node(config);
      
      expect(node.id).toBe('test-node');
      expect(node.name).toBe('Test Node');
      expect(node.description).toBe('A test node');
      expect(node.type).toBe('settlement');
      expect(node.size).toBe(200);
      expect(node.population).toBe(50);
      expect(node.resources).toEqual({ gold: 100 });
    });

    it('should handle Environment value object in constructor', () => {
      const environment = new Environment({
        terrain: TerrainTypes.FOREST,
        climate: ClimateTypes.TROPICAL
      });

      const node = new Node({ environment });
      
      expect(node.environment).toBe(environment);
      expect(node.environment.terrain).toBe(TerrainTypes.FOREST);
      expect(node.environment.climate).toBe(ClimateTypes.TROPICAL);
    });

    it('should handle NodeConnection objects in constructor', () => {
      const connection = new NodeConnection({
        targetNodeId: 'target-node',
        type: ConnectionTypes.ROAD
      });

      const node = new Node({ connections: [connection] });
      
      expect(node.connections).toHaveLength(1);
      expect(node.connections[0]).toBe(connection);
      expect(node.connections[0].targetNodeId).toBe('target-node');
    });

    it('should maintain backward compatibility with connectedNodes', () => {
      const node = new Node({ 
        connectedNodes: ['node1', 'node2'] 
      });
      
      expect(node.connections).toHaveLength(2);
      expect(node.connections[0].targetNodeId).toBe('node1');
      expect(node.connections[1].targetNodeId).toBe('node2');
      expect(node.getConnectedNodeIds()).toEqual(['node1', 'node2']);
    });
  });

  describe('Environmental Danger Calculation', () => {
    it('should calculate basic environmental danger', () => {
      const node = new Node({ type: 'wilderness' });
      const danger = node.getEnvironmentalDanger();
      
      expect(danger).toBeGreaterThan(0);
      expect(danger).toBeLessThanOrEqual(1);
    });

    it('should increase danger for dangerous node types', () => {
      const dungeonNode = new Node({ type: 'dungeon' });
      const settlementNode = new Node({ type: 'settlement' });
      
      expect(dungeonNode.getEnvironmentalDanger()).toBeGreaterThan(
        settlementNode.getEnvironmentalDanger()
      );
    });

    it('should increase danger for poor environmental conditions', () => {
      const badEnvironment = new Environment({
        shelterQuality: 0.1,
        airQuality: 0.2,
        waterAvailability: 0.1,
        climate: ClimateTypes.ARCTIC,
        lighting: LightingTypes.DARK
      });

      const node = new Node({ environment: badEnvironment });
      const danger = node.getEnvironmentalDanger();
      
      expect(danger).toBeGreaterThan(0.5);
    });

    it('should cap danger at 1.0', () => {
      const extremeEnvironment = new Environment({
        shelterQuality: 0,
        airQuality: 0,
        waterAvailability: 0,
        climate: ClimateTypes.ARCTIC,
        lighting: LightingTypes.DARK
      });

      const node = new Node({ 
        type: 'dungeon',
        environment: extremeEnvironment 
      });
      
      expect(node.getEnvironmentalDanger()).toBeLessThanOrEqual(1);
    });
  });

  describe('Environmental Modifiers', () => {
    it('should return environmental modifiers for interactions', () => {
      const forestEnvironment = new Environment({
        terrain: TerrainTypes.FOREST,
        lighting: LightingTypes.DIM
      });

      const node = new Node({ environment: forestEnvironment });
      const modifiers = node.getEnvironmentalModifiers('stealth');
      
      expect(typeof modifiers).toBe('object');
      expect(modifiers.stealth).toBeGreaterThan(1); // Forest bonus to stealth
    });

    it('should provide terrain-specific modifiers', () => {
      const mountainNode = new Node({
        environment: new Environment({ terrain: TerrainTypes.MOUNTAINS })
      });

      const modifiers = mountainNode.getEnvironmentalModifiers('combat');
      
      expect(modifiers.movement).toBeLessThan(1); // Mountains slow movement
      expect(modifiers.defense).toBeGreaterThan(1); // Mountains provide defense
    });

    it('should provide lighting-specific modifiers', () => {
      const darkNode = new Node({
        environment: new Environment({ lighting: LightingTypes.DARK })
      });

      const modifiers = darkNode.getEnvironmentalModifiers('stealth');
      
      expect(modifiers.visibility).toBeLessThan(1); // Dark reduces visibility
      expect(modifiers.stealth).toBeGreaterThan(1); // Dark helps stealth
    });
  });

  describe('Population Calculations', () => {
    it('should calculate population density correctly', () => {
      const node = new Node({ 
        size: 100, 
        population: 50 
      });
      
      expect(node.getPopulationDensity()).toBe(0.5);
    });

    it('should determine overcrowding correctly', () => {
      const crowdedNode = new Node({ 
        size: 100, 
        population: 90 
      });
      const normalNode = new Node({ 
        size: 100, 
        population: 50 
      });
      
      expect(crowdedNode.isOvercrowded()).toBe(true);
      expect(normalNode.isOvercrowded()).toBe(false);
    });

    it('should calculate population capacity based on environment', () => {
      const goodEnvironment = new Environment({
        shelterQuality: 1.0,
        waterAvailability: 1.0,
        climate: ClimateTypes.TEMPERATE
      });

      const badEnvironment = new Environment({
        shelterQuality: 0.3,
        waterAvailability: 0.3,
        climate: ClimateTypes.ARCTIC
      });

      const goodNode = new Node({ 
        size: 100, 
        environment: goodEnvironment 
      });
      const badNode = new Node({ 
        size: 100, 
        environment: badEnvironment 
      });
      
      expect(goodNode.getPopulationCapacity()).toBeGreaterThan(
        badNode.getPopulationCapacity()
      );
    });
  });

  describe('Connection Management', () => {
    let node;
    let connection1;
    let connection2;

    beforeEach(() => {
      node = new Node({ id: 'test-node' });
      connection1 = new NodeConnection({
        targetNodeId: 'node1',
        type: ConnectionTypes.ROAD
      });
      connection2 = new NodeConnection({
        targetNodeId: 'node2',
        type: ConnectionTypes.RIVER
      });
    });

    it('should get connection to specific node', () => {
      node.connections = [connection1, connection2];
      
      const found = node.getConnectionTo('node1');
      expect(found).toBe(connection1);
      
      const notFound = node.getConnectionTo('node3');
      expect(notFound).toBeNull();
    });

    it('should get connections by type', () => {
      node.connections = [connection1, connection2];
      
      const roadConnections = node.getConnectionsByType(ConnectionTypes.ROAD);
      expect(roadConnections).toHaveLength(1);
      expect(roadConnections[0]).toBe(connection1);
    });

    it('should get all connected node IDs', () => {
      node.connections = [connection1, connection2];
      
      const nodeIds = node.getConnectedNodeIds();
      expect(nodeIds).toEqual(['node1', 'node2']);
    });

    it('should check if connected to specific node', () => {
      node.connections = [connection1];
      
      expect(node.isConnectedTo('node1')).toBe(true);
      expect(node.isConnectedTo('node2')).toBe(false);
    });

    it('should add new connections', () => {
      expect(node.connections).toHaveLength(0);
      
      node.addConnection(connection1);
      expect(node.connections).toHaveLength(1);
      expect(node.connections[0]).toBe(connection1);
    });

    it('should not add duplicate connections', () => {
      node.addConnection(connection1);
      node.addConnection(connection1); // Try to add same connection
      
      expect(node.connections).toHaveLength(1);
    });

    it('should remove connections', () => {
      node.connections = [connection1, connection2];
      
      const removed = node.removeConnection('node1');
      expect(removed).toBe(true);
      expect(node.connections).toHaveLength(1);
      expect(node.connections[0]).toBe(connection2);
    });

    it('should return false when removing non-existent connection', () => {
      node.connections = [connection1];
      
      const removed = node.removeConnection('node3');
      expect(removed).toBe(false);
      expect(node.connections).toHaveLength(1);
    });

    it('should throw error when adding invalid connection', () => {
      expect(() => {
        node.addConnection('not-a-connection');
      }).toThrow('Connection must be a NodeConnection instance');
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const environment = new Environment({
        terrain: TerrainTypes.FOREST,
        climate: ClimateTypes.TEMPERATE
      });

      const connection = new NodeConnection({
        targetNodeId: 'target-node',
        type: ConnectionTypes.ROAD
      });

      const node = new Node({
        id: 'test-node',
        name: 'Test Node',
        environment,
        connections: [connection],
        size: 150,
        population: 75
      });

      const json = node.toJSON();
      
      expect(json.id).toBe('test-node');
      expect(json.name).toBe('Test Node');
      expect(json.size).toBe(150);
      expect(json.population).toBe(75);
      expect(json.environment).toBeDefined();
      expect(json.connections).toHaveLength(1);
      expect(json.connectedNodes).toEqual(['target-node']); // Backward compatibility
    });

    it('should deserialize from JSON correctly', () => {
      const jsonData = {
        id: 'test-node',
        name: 'Test Node',
        size: 150,
        population: 75,
        environment: {
          terrain: TerrainTypes.FOREST,
          climate: ClimateTypes.TEMPERATE,
          density: 0.6
        },
        connections: [{
          targetNodeId: 'target-node',
          type: ConnectionTypes.ROAD,
          difficulty: 2,
          distance: 1.5
        }]
      };

      const node = Node.fromJSON(jsonData);
      
      expect(node.id).toBe('test-node');
      expect(node.name).toBe('Test Node');
      expect(node.size).toBe(150);
      expect(node.population).toBe(75);
      expect(node.environment).toBeInstanceOf(Environment);
      expect(node.environment.terrain).toBe(TerrainTypes.FOREST);
      expect(node.connections).toHaveLength(1);
      expect(node.connections[0]).toBeInstanceOf(NodeConnection);
      expect(node.connections[0].targetNodeId).toBe('target-node');
    });

    it('should handle invalid JSON data', () => {
      expect(() => {
        Node.fromJSON(null);
      }).toThrow('Invalid JSON data for Node');

      expect(() => {
        Node.fromJSON('not-an-object');
      }).toThrow('Invalid JSON data for Node');
    });
  });

  describe('Legacy Methods', () => {
    it('should maintain getEnvironmentFactor method', () => {
      const environment = new Environment({ density: 0.7 });
      const node = new Node({ environment });
      
      expect(node.getEnvironmentFactor()).toBe(0.7);
    });

    it('should handle interactions correctly', () => {
      const interaction = new Interaction({
        id: 'test-interaction',
        name: 'Test Interaction'
      });

      const node = new Node({
        interactions: [interaction]
      });

      expect(node.interactions).toHaveLength(1);
      expect(node.interactions[0]).toBeInstanceOf(Interaction);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero population and size', () => {
      const node = new Node({ 
        size: 0, 
        population: 0 
      });
      
      expect(node.getPopulationDensity()).toBe(0);
      expect(node.isOvercrowded()).toBe(false);
    });

    it('should handle missing environment data gracefully', () => {
      const node = new Node({ environment: null });
      
      expect(node.environment).toBeInstanceOf(Environment);
      expect(node.getEnvironmentalDanger()).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty connections array', () => {
      const node = new Node();
      
      expect(node.getConnectedNodeIds()).toEqual([]);
      expect(node.getConnectionsByType(ConnectionTypes.ROAD)).toEqual([]);
      expect(node.getConnectionTo('any-node')).toBeNull();
      expect(node.isConnectedTo('any-node')).toBe(false);
    });
  });
});