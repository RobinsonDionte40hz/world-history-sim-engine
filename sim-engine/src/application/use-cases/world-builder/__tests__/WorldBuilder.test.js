// src/application/use-cases/world-builder/__tests__/WorldBuilder.test.js

import WorldBuilder from '../WorldBuilder.js';
import TemplateManager from '../../../../template/TemplateManager.js';

describe('WorldBuilder', () => {
  let templateManager;
  let worldBuilder;

  beforeEach(() => {
    templateManager = new TemplateManager();
    worldBuilder = new WorldBuilder(templateManager);
  });

  describe('constructor', () => {
    it('should create a WorldBuilder with template manager', () => {
      expect(worldBuilder).toBeInstanceOf(WorldBuilder);
      expect(worldBuilder.templateManager).toBe(templateManager);
    });

    it('should throw error if no template manager provided', () => {
      expect(() => new WorldBuilder()).toThrow('TemplateManager is required for WorldBuilder');
    });

    it('should initialize with empty world config', () => {
      const config = worldBuilder.getWorldConfig();
      expect(config.dimensions).toBeNull();
      expect(config.rules).toBeNull();
      expect(config.initialConditions).toBeNull();
      expect(config.nodes).toEqual([]);
      expect(config.characters).toEqual([]);
      expect(config.interactions).toEqual([]);
      expect(config.events).toEqual([]);
      expect(config.groups).toEqual([]);
      expect(config.items).toEqual([]);
      expect(config.isComplete).toBe(false);
      expect(config.isValid).toBe(false);
    });
  });

  describe('setDimensions', () => {
    it('should set valid dimensions', () => {
      worldBuilder.setDimensions(100, 200);
      const dimensions = worldBuilder.getDimensions();
      expect(dimensions.width).toBe(100);
      expect(dimensions.height).toBe(200);
    });

    it('should set dimensions with depth', () => {
      worldBuilder.setDimensions(100, 200, 50);
      const dimensions = worldBuilder.getDimensions();
      expect(dimensions.width).toBe(100);
      expect(dimensions.height).toBe(200);
      expect(dimensions.depth).toBe(50);
    });

    it('should throw error for invalid width', () => {
      expect(() => worldBuilder.setDimensions(-1, 200)).toThrow('Width must be a positive number');
      expect(() => worldBuilder.setDimensions('invalid', 200)).toThrow('Width must be a positive number');
    });

    it('should throw error for invalid height', () => {
      expect(() => worldBuilder.setDimensions(100, -1)).toThrow('Height must be a positive number');
      expect(() => worldBuilder.setDimensions(100, 'invalid')).toThrow('Height must be a positive number');
    });

    it('should throw error for invalid depth', () => {
      expect(() => worldBuilder.setDimensions(100, 200, -1)).toThrow('Depth must be null or a positive number');
      expect(() => worldBuilder.setDimensions(100, 200, 'invalid')).toThrow('Depth must be null or a positive number');
    });
  });

  describe('setRules', () => {
    it('should set valid rules', () => {
      const rules = {
        physics: { gravity: 9.8 },
        interactions: { maxDistance: 10 },
        evolution: { mutationRate: 0.01 }
      };
      worldBuilder.setRules(rules);
      const setRules = worldBuilder.getRules();
      expect(setRules.physics).toEqual({ gravity: 9.8 });
      expect(setRules.interactions).toEqual({ maxDistance: 10 });
      expect(setRules.evolution).toEqual({ mutationRate: 0.01 });
    });

    it('should set default empty objects for missing rule categories', () => {
      worldBuilder.setRules({});
      const rules = worldBuilder.getRules();
      expect(rules.physics).toEqual({});
      expect(rules.interactions).toEqual({});
      expect(rules.evolution).toEqual({});
    });

    it('should throw error for invalid rules', () => {
      expect(() => worldBuilder.setRules(null)).toThrow('Rules must be an object');
      expect(() => worldBuilder.setRules('invalid')).toThrow('Rules must be an object');
    });
  });

  describe('setInitialConditions', () => {
    it('should set valid initial conditions', () => {
      const conditions = {
        characterCount: 10,
        resourceTypes: ['food', 'water'],
        startingResources: { food: 100, water: 50 },
        timeScale: 2
      };
      worldBuilder.setInitialConditions(conditions);
      const setConditions = worldBuilder.getInitialConditions();
      expect(setConditions.characterCount).toBe(10);
      expect(setConditions.resourceTypes).toEqual(['food', 'water']);
      expect(setConditions.startingResources).toEqual({ food: 100, water: 50 });
      expect(setConditions.timeScale).toBe(2);
    });

    it('should set default values for missing properties', () => {
      worldBuilder.setInitialConditions({});
      const conditions = worldBuilder.getInitialConditions();
      expect(conditions.characterCount).toBe(0);
      expect(conditions.resourceTypes).toEqual([]);
      expect(conditions.startingResources).toEqual({});
      expect(conditions.timeScale).toBe(1);
    });

    it('should throw error for invalid conditions', () => {
      expect(() => worldBuilder.setInitialConditions(null)).toThrow('Initial conditions must be an object');
      expect(() => worldBuilder.setInitialConditions('invalid')).toThrow('Initial conditions must be an object');
    });
  });

  describe('addNode', () => {
    it('should add a node with valid configuration', () => {
      const nodeConfig = {
        name: 'Test Node',
        type: 'location',
        position: { x: 10, y: 20 }
      };
      const node = worldBuilder.addNode(nodeConfig);
      expect(node.name).toBe('Test Node');
      expect(node.type).toBe('location');
      expect(node.id).toBeDefined();

      const nodes = worldBuilder.getNodes();
      expect(nodes).toHaveLength(1);
      expect(nodes[0]).toBe(node);
    });

    it('should throw error for invalid node configuration', () => {
      expect(() => worldBuilder.addNode(null)).toThrow('Node configuration must be an object');
      expect(() => worldBuilder.addNode('invalid')).toThrow('Node configuration must be an object');
    });
  });

  describe('addCharacter', () => {
    it('should add a character with valid configuration', () => {
      const characterConfig = {
        name: 'Test Character',
        age: 25
      };
      const character = worldBuilder.addCharacter(characterConfig);
      expect(character.name).toBe('Test Character');
      expect(character.age).toBe(25);
      expect(character.id).toBeDefined();

      const characters = worldBuilder.getCharacters();
      expect(characters).toHaveLength(1);
      expect(characters[0]).toBe(character);
    });

    it('should throw error for invalid character configuration', () => {
      expect(() => worldBuilder.addCharacter(null)).toThrow('Character configuration must be an object');
      expect(() => worldBuilder.addCharacter('invalid')).toThrow('Character configuration must be an object');
    });
  });

  describe('validation', () => {
    it('should validate empty world as invalid', () => {
      const validation = worldBuilder.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid or missing world dimensions');
      expect(validation.errors).toContain('Invalid node configuration');
    });

    it('should validate world with dimensions and nodes as valid', () => {
      worldBuilder.setDimensions(100, 100);
      worldBuilder.addNode({
        name: 'Test Node',
        position: { x: 10, y: 10 }
      });

      const validation = worldBuilder.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should calculate completeness score', () => {
      // Empty world should have low completeness
      let validation = worldBuilder.validate();
      expect(validation.completeness).toBe(0);

      // Add dimensions (20 points)
      worldBuilder.setDimensions(100, 100);
      validation = worldBuilder.validate();
      expect(validation.completeness).toBe(0.2);

      // Add nodes (30 points)
      worldBuilder.addNode({
        name: 'Test Node',
        position: { x: 10, y: 10 }
      });
      validation = worldBuilder.validate();
      expect(validation.completeness).toBe(0.5);

      // Add characters (25 points)
      worldBuilder.addCharacter({
        name: 'Test Character'
      });
      validation = worldBuilder.validate();
      expect(validation.completeness).toBe(0.75);
    });
  });

  describe('build', () => {
    it('should build valid world', () => {
      worldBuilder.setDimensions(100, 100);
      worldBuilder.addNode({
        name: 'Test Node',
        position: { x: 10, y: 10 }
      });

      const worldState = worldBuilder.build();
      expect(worldState.id).toBeDefined();
      expect(worldState.name).toBe('Generated World');
      expect(worldState.isValid).toBe(true);
      expect(worldState.dimensions).toEqual({ width: 100, height: 100 });
      expect(worldState.nodes).toHaveLength(1);
    });

    it('should throw error when building invalid world', () => {
      expect(() => worldBuilder.build()).toThrow('Cannot build invalid world');
    });
  });

  describe('reset', () => {
    it('should reset world configuration', () => {
      worldBuilder.setDimensions(100, 100);
      worldBuilder.addNode({ name: 'Test Node', position: { x: 10, y: 10 } });

      worldBuilder.reset();

      const config = worldBuilder.getWorldConfig();
      expect(config.dimensions).toBeNull();
      expect(config.nodes).toEqual([]);
      expect(config.isValid).toBe(false);
      expect(config.isComplete).toBe(false);
    });
  });

  describe('content removal', () => {
    it('should remove node by id', () => {
      const node = worldBuilder.addNode({
        name: 'Test Node',
        position: { x: 10, y: 10 }
      });

      expect(worldBuilder.getNodes()).toHaveLength(1);

      const removed = worldBuilder.removeNode(node.id);
      expect(removed).toBe(true);
      expect(worldBuilder.getNodes()).toHaveLength(0);
    });

    it('should throw error when removing non-existent node', () => {
      expect(() => worldBuilder.removeNode('non-existent')).toThrow('Node not found: non-existent');
    });

    it('should remove character by id', () => {
      const character = worldBuilder.addCharacter({
        name: 'Test Character'
      });

      expect(worldBuilder.getCharacters()).toHaveLength(1);

      const removed = worldBuilder.removeCharacter(character.id);
      expect(removed).toBe(true);
      expect(worldBuilder.getCharacters()).toHaveLength(0);
    });

    it('should throw error when removing non-existent character', () => {
      expect(() => worldBuilder.removeCharacter('non-existent')).toThrow('Character not found: non-existent');
    });
  });
});