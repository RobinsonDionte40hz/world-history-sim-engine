/**
 * WorldState Test Suite
 * Tests for WorldState entity including validation, serialization, and simulation config conversion
 */

import WorldState from '../WorldState.js';
import WorldValidator from '../../services/WorldValidator.js';

// Mock WorldValidator for controlled testing
jest.mock('../../services/WorldValidator.js');

describe('WorldState', () => {
  let mockValidationResult;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock validation result
    mockValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      completeness: 0.8,
      details: {}
    };
    
    WorldValidator.validate.mockReturnValue(mockValidationResult);
  });

  describe('Constructor', () => {
    test('should create WorldState with default values', () => {
      const worldState = new WorldState();
      
      expect(worldState.id).toBeDefined();
      expect(worldState.name).toBe('Untitled World');
      expect(worldState.description).toBe('');
      expect(worldState.dimensions).toBeNull();
      expect(worldState.rules).toBeNull();
      expect(worldState.initialConditions).toBeNull();
      expect(worldState.nodes).toEqual([]);
      expect(worldState.characters).toEqual([]);
      expect(worldState.interactions).toEqual([]);
      expect(worldState.events).toEqual([]);
      expect(worldState.groups).toEqual([]);
      expect(worldState.items).toEqual([]);
      expect(worldState.isValid).toBe(true);
      expect(worldState.completeness).toBe(0.8);
      expect(worldState.createdAt).toBeInstanceOf(Date);
      expect(worldState.modifiedAt).toBeInstanceOf(Date);
      expect(worldState.version).toBe('1.0.0');
    });

    test('should create WorldState with provided configuration', () => {
      const config = {
        id: 'test-world-1',
        name: 'Test World',
        description: 'A test world',
        dimensions: { width: 100, height: 100 },
        rules: { physics: { gravity: 9.8 } },
        initialConditions: { characterCount: 5 },
        nodes: [{ id: 'node1', name: 'Test Node' }],
        characters: [{ id: 'char1', name: 'Test Character' }],
        version: '2.0.0'
      };

      const worldState = new WorldState(config);
      
      expect(worldState.id).toBe('test-world-1');
      expect(worldState.name).toBe('Test World');
      expect(worldState.description).toBe('A test world');
      expect(worldState.dimensions).toEqual({ width: 100, height: 100 });
      expect(worldState.rules).toEqual({ physics: { gravity: 9.8 } });
      expect(worldState.initialConditions).toEqual({ characterCount: 5 });
      expect(worldState.nodes).toEqual([{ id: 'node1', name: 'Test Node' }]);
      expect(worldState.characters).toEqual([{ id: 'char1', name: 'Test Character' }]);
      expect(worldState.version).toBe('2.0.0');
    });

    test('should call validate during construction', () => {
      new WorldState();
      expect(WorldValidator.validate).toHaveBeenCalledTimes(1);
    });
  });

  describe('validate', () => {
    test('should validate world configuration and update state', () => {
      const worldState = new WorldState();
      
      // Clear the constructor call
      jest.clearAllMocks();
      
      const result = worldState.validate();
      
      expect(WorldValidator.validate).toHaveBeenCalledWith({
        dimensions: worldState.dimensions,
        rules: worldState.rules,
        initialConditions: worldState.initialConditions,
        nodes: worldState.nodes,
        characters: worldState.characters,
        interactions: worldState.interactions,
        events: worldState.events,
        groups: worldState.groups,
        items: worldState.items
      });
      
      expect(result).toBe(mockValidationResult);
      expect(worldState.isValid).toBe(true);
      expect(worldState.completeness).toBe(0.8);
      expect(worldState.validationResult).toBe(mockValidationResult);
    });

    test('should handle validation errors gracefully', () => {
      WorldValidator.validate.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const worldState = new WorldState();
      
      expect(worldState.isValid).toBe(false);
      expect(worldState.completeness).toBe(0);
      expect(worldState.validationResult.errors).toContain('Validation error: Validation failed');
    });

    test('should update modifiedAt when validation runs', () => {
      const worldState = new WorldState();
      const originalModifiedAt = worldState.modifiedAt;
      
      // Wait a bit to ensure time difference
      setTimeout(() => {
        worldState.validate();
        expect(worldState.modifiedAt.getTime()).toBeGreaterThan(originalModifiedAt.getTime());
      }, 10);
    });
  });

  describe('toSimulationConfig', () => {
    test('should convert valid world to simulation config', () => {
      const worldState = new WorldState({
        dimensions: { width: 100, height: 100 },
        rules: { tickDelay: 500 },
        initialConditions: { 
          resourceTypes: ['food', 'water'],
          startingResources: { food: 100 },
          timeScale: 2
        },
        nodes: [{ id: 'node1', name: 'Test Node' }],
        characters: [{ id: 'char1', name: 'Test Character' }],
        interactions: [{ id: 'int1', name: 'Test Interaction' }],
        events: [{ id: 'event1', name: 'Test Event' }],
        groups: [{ id: 'group1', name: 'Test Group' }],
        items: [{ id: 'item1', name: 'Test Item' }]
      });

      const config = worldState.toSimulationConfig();
      
      expect(config).toEqual({
        size: { width: 100, height: 100 },
        nodeCount: 1,
        characterCount: 1,
        resourceTypes: ['food', 'water'],
        startingResources: { food: 100 },
        customNodes: [{ id: 'node1', name: 'Test Node' }],
        customCharacters: [{ id: 'char1', name: 'Test Character' }],
        customInteractions: [{ id: 'int1', name: 'Test Interaction' }],
        customEvents: [{ id: 'event1', name: 'Test Event' }],
        customGroups: [{ id: 'group1', name: 'Test Group' }],
        customItems: [{ id: 'item1', name: 'Test Item' }],
        rules: { tickDelay: 500 },
        initialConditions: { 
          resourceTypes: ['food', 'water'],
          startingResources: { food: 100 },
          timeScale: 2
        },
        timeScale: 2,
        tickDelay: 500,
        worldId: worldState.id,
        worldName: worldState.name,
        worldVersion: worldState.version
      });
    });

    test('should throw error for invalid world', () => {
      mockValidationResult.isValid = false;
      mockValidationResult.errors = ['Invalid dimensions'];
      
      const worldState = new WorldState();
      
      expect(() => worldState.toSimulationConfig()).toThrow(
        'Cannot convert invalid world to simulation config. Validation errors: Invalid dimensions'
      );
    });

    test('should handle missing optional properties', () => {
      const worldState = new WorldState({
        dimensions: { width: 50, height: 50 }
      });

      const config = worldState.toSimulationConfig();
      
      expect(config.resourceTypes).toEqual([]);
      expect(config.startingResources).toEqual({});
      expect(config.rules).toEqual({});
      expect(config.initialConditions).toEqual({});
      expect(config.timeScale).toBe(1);
      expect(config.tickDelay).toBe(1000);
    });
  });

  describe('Content Management', () => {
    let worldState;

    beforeEach(() => {
      worldState = new WorldState();
    });

    describe('addContent', () => {
      test('should add content to world', () => {
        const node = { name: 'Test Node', position: { x: 10, y: 20 } };
        
        worldState.addContent('nodes', node);
        
        expect(worldState.nodes).toHaveLength(1);
        expect(worldState.nodes[0].name).toBe('Test Node');
        expect(worldState.nodes[0].id).toBeDefined();
      });

      test('should preserve existing ID if provided', () => {
        const node = { id: 'custom-id', name: 'Test Node' };
        
        worldState.addContent('nodes', node);
        
        expect(worldState.nodes[0].id).toBe('custom-id');
      });

      test('should throw error for invalid content type', () => {
        expect(() => worldState.addContent('invalid', {})).toThrow(
          'Invalid content type: invalid'
        );
      });

      test('should throw error for invalid content', () => {
        expect(() => worldState.addContent('nodes', null)).toThrow(
          'Content must be an object'
        );
      });

      test('should trigger validation after adding content', () => {
        jest.clearAllMocks();
        
        worldState.addContent('nodes', { name: 'Test Node' });
        
        expect(WorldValidator.validate).toHaveBeenCalledTimes(1);
      });
    });

    describe('removeContent', () => {
      test('should remove content from world', () => {
        worldState.addContent('nodes', { id: 'node1', name: 'Test Node' });
        
        const removed = worldState.removeContent('nodes', 'node1');
        
        expect(removed).toBe(true);
        expect(worldState.nodes).toHaveLength(0);
      });

      test('should return false for non-existent content', () => {
        const removed = worldState.removeContent('nodes', 'non-existent');
        
        expect(removed).toBe(false);
      });

      test('should trigger validation after removing content', () => {
        worldState.addContent('nodes', { id: 'node1', name: 'Test Node' });
        jest.clearAllMocks();
        
        worldState.removeContent('nodes', 'node1');
        
        expect(WorldValidator.validate).toHaveBeenCalledTimes(1);
      });
    });

    describe('updateContent', () => {
      test('should update existing content', () => {
        worldState.addContent('nodes', { id: 'node1', name: 'Original Name' });
        
        const updated = worldState.updateContent('nodes', 'node1', { name: 'Updated Name' });
        
        expect(updated).toBe(true);
        expect(worldState.nodes[0].name).toBe('Updated Name');
      });

      test('should return false for non-existent content', () => {
        const updated = worldState.updateContent('nodes', 'non-existent', { name: 'New Name' });
        
        expect(updated).toBe(false);
      });

      test('should trigger validation after updating content', () => {
        worldState.addContent('nodes', { id: 'node1', name: 'Original Name' });
        jest.clearAllMocks();
        
        worldState.updateContent('nodes', 'node1', { name: 'Updated Name' });
        
        expect(WorldValidator.validate).toHaveBeenCalledTimes(1);
      });
    });

    describe('getContent', () => {
      test('should return all content of specified type', () => {
        worldState.addContent('nodes', { id: 'node1', name: 'Node 1' });
        worldState.addContent('nodes', { id: 'node2', name: 'Node 2' });
        
        const nodes = worldState.getContent('nodes');
        
        expect(nodes).toHaveLength(2);
        expect(nodes[0].name).toBe('Node 1');
        expect(nodes[1].name).toBe('Node 2');
      });

      test('should return specific content by ID', () => {
        worldState.addContent('nodes', { id: 'node1', name: 'Node 1' });
        worldState.addContent('nodes', { id: 'node2', name: 'Node 2' });
        
        const node = worldState.getContent('nodes', 'node1');
        
        expect(node.name).toBe('Node 1');
      });

      test('should return null for non-existent content', () => {
        const node = worldState.getContent('nodes', 'non-existent');
        
        expect(node).toBeNull();
      });

      test('should return copy of content array to prevent external modification', () => {
        worldState.addContent('nodes', { id: 'node1', name: 'Node 1' });
        
        const nodes = worldState.getContent('nodes');
        nodes.push({ id: 'external', name: 'External' });
        
        expect(worldState.nodes).toHaveLength(1);
      });
    });
  });

  describe('Update Methods', () => {
    let worldState;

    beforeEach(() => {
      worldState = new WorldState();
    });

    test('updateDimensions should update dimensions and trigger validation', () => {
      jest.clearAllMocks();
      
      const result = worldState.updateDimensions({ width: 200, height: 150 });
      
      expect(result).toBe(worldState); // Should return this for chaining
      expect(worldState.dimensions).toEqual({ width: 200, height: 150 });
      expect(WorldValidator.validate).toHaveBeenCalledTimes(1);
    });

    test('updateRules should update rules and trigger validation', () => {
      jest.clearAllMocks();
      
      const rules = { physics: { gravity: 9.8 } };
      const result = worldState.updateRules(rules);
      
      expect(result).toBe(worldState);
      expect(worldState.rules).toEqual(rules);
      expect(WorldValidator.validate).toHaveBeenCalledTimes(1);
    });

    test('updateInitialConditions should update conditions and trigger validation', () => {
      jest.clearAllMocks();
      
      const conditions = { characterCount: 10, timeScale: 2 };
      const result = worldState.updateInitialConditions(conditions);
      
      expect(result).toBe(worldState);
      expect(worldState.initialConditions).toEqual(conditions);
      expect(WorldValidator.validate).toHaveBeenCalledTimes(1);
    });

    test('update methods should throw error for invalid input', () => {
      expect(() => worldState.updateDimensions(null)).toThrow('Dimensions must be an object');
      expect(() => worldState.updateRules('invalid')).toThrow('Rules must be an object');
      expect(() => worldState.updateInitialConditions(123)).toThrow('Initial conditions must be an object');
    });
  });

  describe('getSummary', () => {
    test('should return comprehensive world summary', () => {
      const worldState = new WorldState({
        id: 'test-world',
        name: 'Test World',
        description: 'A test world',
        dimensions: { width: 100, height: 100 },
        rules: { physics: {} },
        initialConditions: { characterCount: 5 }
      });
      
      worldState.addContent('nodes', { name: 'Node 1' });
      worldState.addContent('nodes', { name: 'Node 2' });
      worldState.addContent('characters', { name: 'Character 1' });

      const summary = worldState.getSummary();
      
      expect(summary).toEqual({
        id: 'test-world',
        name: 'Test World',
        description: 'A test world',
        isValid: true,
        completeness: 80, // 0.8 * 100
        contentCounts: {
          nodes: 2,
          characters: 1,
          interactions: 0,
          events: 0,
          groups: 0,
          items: 0
        },
        hasDimensions: true,
        hasRules: true,
        hasInitialConditions: true,
        createdAt: worldState.createdAt,
        modifiedAt: worldState.modifiedAt,
        version: '1.0.0'
      });
    });
  });

  describe('Serialization', () => {
    test('toJSON should serialize world state correctly', () => {
      const worldState = new WorldState({
        id: 'test-world',
        name: 'Test World',
        dimensions: { width: 100, height: 100 }
      });
      
      worldState.addContent('nodes', { name: 'Test Node' });

      const json = worldState.toJSON();
      
      expect(json.id).toBe('test-world');
      expect(json.name).toBe('Test World');
      expect(json.dimensions).toEqual({ width: 100, height: 100 });
      expect(json.nodes).toHaveLength(1);
      expect(json.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO string format
      expect(json.modifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test('fromJSON should create WorldState from JSON data', () => {
      const jsonData = {
        id: 'test-world',
        name: 'Test World',
        dimensions: { width: 100, height: 100 },
        nodes: [{ id: 'node1', name: 'Test Node' }],
        createdAt: '2023-01-01T00:00:00.000Z',
        modifiedAt: '2023-01-01T00:00:00.000Z'
      };

      const worldState = WorldState.fromJSON(jsonData);
      
      expect(worldState).toBeInstanceOf(WorldState);
      expect(worldState.id).toBe('test-world');
      expect(worldState.name).toBe('Test World');
      expect(worldState.dimensions).toEqual({ width: 100, height: 100 });
      expect(worldState.nodes).toHaveLength(1);
      expect(worldState.createdAt).toBeInstanceOf(Date);
      expect(worldState.modifiedAt).toBeInstanceOf(Date);
    });

    test('fromJSON should throw error for invalid data', () => {
      expect(() => WorldState.fromJSON(null)).toThrow('Invalid JSON data for WorldState');
      expect(() => WorldState.fromJSON('invalid')).toThrow('Invalid JSON data for WorldState');
    });
  });

  describe('clone', () => {
    test('should create deep copy with new ID and name', () => {
      const original = new WorldState({
        name: 'Original World',
        dimensions: { width: 100, height: 100 }
      });
      
      original.addContent('nodes', { name: 'Test Node' });

      const clone = original.clone();
      
      expect(clone).toBeInstanceOf(WorldState);
      expect(clone.id).not.toBe(original.id);
      expect(clone.name).toBe('Original World (Copy)');
      expect(clone.dimensions).toEqual(original.dimensions);
      expect(clone.nodes).toHaveLength(1);
      expect(clone.nodes[0].name).toBe('Test Node');
      
      // Verify it's a deep copy
      clone.updateDimensions({ width: 200, height: 200 });
      expect(original.dimensions).toEqual({ width: 100, height: 100 });
    });
  });

  describe('Template Persistence Features', () => {
    let worldState;
    let mockTemplateManager;

    beforeEach(() => {
      worldState = new WorldState({
        name: 'Test World',
        description: 'A test world for templates',
        dimensions: { width: 100, height: 100 },
        rules: { physics: { gravity: 9.8 } },
        initialConditions: { characterCount: 5, timeScale: 2 }
      });
      
      worldState.addContent('nodes', { name: 'Test Node', position: { x: 10, y: 20 } });
      worldState.addContent('characters', { name: 'Test Character', attributes: { strength: 10 } });

      // Mock TemplateManager
      mockTemplateManager = {
        addTemplate: jest.fn(),
        getTemplate: jest.fn(),
        getAllTemplates: jest.fn()
      };
    });

    describe('toTemplate', () => {
      test('should convert world state to template format', () => {
        const template = worldState.toTemplate('My Template', 'A test template', ['fantasy', 'medieval']);
        
        expect(template.id).toMatch(/^world_template_my_template_\d+$/);
        expect(template.name).toBe('My Template');
        expect(template.description).toBe('A test template');
        expect(template.type).toBe('world');
        expect(template.version).toBe('1.0.0');
        expect(template.tags).toEqual(['world', 'custom', 'fantasy', 'medieval']);
        
        expect(template.worldConfig).toEqual({
          dimensions: { width: 100, height: 100 },
          rules: { physics: { gravity: 9.8 } },
          initialConditions: { characterCount: 5, timeScale: 2 },
          nodes: [{ name: 'Test Node', position: { x: 10, y: 20 }, id: expect.any(String) }],
          characters: [{ name: 'Test Character', attributes: { strength: 10 }, id: expect.any(String) }],
          interactions: [],
          events: [],
          groups: [],
          items: []
        });
        
        expect(template.metadata).toEqual({
          originalWorldId: worldState.id,
          originalWorldName: 'Test World',
          createdAt: expect.any(String),
          lastModified: expect.any(String),
          author: 'User',
          completeness: worldState.completeness,
          isValid: worldState.isValid,
          contentCounts: {
            nodes: 1,
            characters: 1,
            interactions: 0,
            events: 0,
            groups: 0,
            items: 0
          }
        });
        
        expect(template.customizationOptions).toEqual({
          allowDimensionChanges: true,
          allowRuleModifications: true,
          allowContentAddition: true,
          allowContentRemoval: true,
          preserveRelationships: true
        });
      });

      test('should throw error for invalid template name', () => {
        expect(() => worldState.toTemplate('', 'Description')).toThrow('Template name is required and must be a string');
        expect(() => worldState.toTemplate(null, 'Description')).toThrow('Template name is required and must be a string');
      });

      test('should throw error for invalid template description', () => {
        expect(() => worldState.toTemplate('Name', '')).toThrow('Template description is required and must be a string');
        expect(() => worldState.toTemplate('Name', null)).toThrow('Template description is required and must be a string');
      });
    });

    describe('fromTemplate', () => {
      test('should create WorldState from template', () => {
        const template = {
          id: 'test-template',
          name: 'Test Template',
          description: 'A test template',
          worldConfig: {
            dimensions: { width: 200, height: 150 },
            rules: { physics: { gravity: 10 } },
            nodes: [{ id: 'node1', name: 'Template Node' }],
            characters: [{ id: 'char1', name: 'Template Character' }]
          },
          customizationOptions: {
            allowDimensionChanges: true,
            allowRuleModifications: true,
            allowContentAddition: true,
            allowContentRemoval: true
          }
        };

        const newWorldState = WorldState.fromTemplate(template);
        
        expect(newWorldState).toBeInstanceOf(WorldState);
        expect(newWorldState.name).toBe('Test Template');
        expect(newWorldState.templateId).toBe('test-template');
        expect(newWorldState.isTemplateInstance).toBe(true);
        expect(newWorldState.dimensions).toEqual({ width: 200, height: 150 });
        expect(newWorldState.rules).toEqual({ physics: { gravity: 10 } });
        expect(newWorldState.nodes).toEqual([{ id: 'node1', name: 'Template Node' }]);
        expect(newWorldState.characters).toEqual([{ id: 'char1', name: 'Template Character' }]);
      });

      test('should apply customizations when creating from template', () => {
        const template = {
          id: 'test-template',
          name: 'Test Template',
          worldConfig: {
            dimensions: { width: 100, height: 100 },
            rules: { physics: { gravity: 9.8 } },
            nodes: [{ id: 'node1', name: 'Original Node' }]
          },
          customizationOptions: {
            allowDimensionChanges: true,
            allowRuleModifications: true,
            allowContentAddition: true
          }
        };

        const customizations = {
          name: 'Customized World',
          dimensions: { width: 300, height: 250 },
          rules: { physics: { gravity: 12 } },
          nodes: {
            add: [{ id: 'node2', name: 'Added Node' }],
            update: [{ id: 'node1', changes: { name: 'Updated Node' } }]
          }
        };

        const newWorldState = WorldState.fromTemplate(template, customizations);
        
        expect(newWorldState.name).toBe('Customized World');
        expect(newWorldState.dimensions).toEqual({ width: 300, height: 250 });
        expect(newWorldState.rules).toEqual({ physics: { gravity: 12 } });
        expect(newWorldState.nodes).toHaveLength(2);
        expect(newWorldState.nodes[0].name).toBe('Updated Node');
        expect(newWorldState.nodes[1].name).toBe('Added Node');
      });

      test('should respect customization restrictions', () => {
        const template = {
          id: 'restricted-template',
          name: 'Restricted Template',
          worldConfig: {
            dimensions: { width: 100, height: 100 },
            nodes: [{ id: 'node1', name: 'Protected Node' }]
          },
          customizationOptions: {
            allowDimensionChanges: false,
            allowContentRemoval: false
          }
        };

        const customizations = {
          dimensions: { width: 300, height: 250 },
          nodes: {
            remove: ['node1']
          }
        };

        const newWorldState = WorldState.fromTemplate(template, customizations);
        
        // Dimensions should not be changed
        expect(newWorldState.dimensions).toEqual({ width: 100, height: 100 });
        // Node should not be removed
        expect(newWorldState.nodes).toHaveLength(1);
        expect(newWorldState.nodes[0].name).toBe('Protected Node');
      });

      test('should throw error for invalid template', () => {
        expect(() => WorldState.fromTemplate(null)).toThrow('Template must be an object');
        expect(() => WorldState.fromTemplate({})).toThrow('Template must contain worldConfig');
      });
    });

    describe('saveAsTemplate', () => {
      test('should save world as template using TemplateManager', () => {
        mockTemplateManager.addTemplate.mockReturnValue(true);
        
        const template = worldState.saveAsTemplate(
          mockTemplateManager, 
          'My World Template', 
          'A saved world template',
          ['custom', 'test']
        );
        
        expect(mockTemplateManager.addTemplate).toHaveBeenCalledWith('worlds', expect.objectContaining({
          name: 'My World Template',
          description: 'A saved world template',
          tags: ['world', 'custom', 'custom', 'test']
        }));
        
        expect(template).toEqual(expect.objectContaining({
          name: 'My World Template',
          description: 'A saved world template'
        }));
      });

      test('should throw error if TemplateManager is not provided', () => {
        expect(() => worldState.saveAsTemplate(null, 'Name', 'Description')).toThrow('TemplateManager is required');
      });

      test('should handle TemplateManager errors', () => {
        mockTemplateManager.addTemplate.mockImplementation(() => {
          throw new Error('Template save failed');
        });
        
        expect(() => worldState.saveAsTemplate(mockTemplateManager, 'Name', 'Description'))
          .toThrow('Failed to save world as template: Template save failed');
      });
    });

    describe('loadFromTemplate', () => {
      test('should load world from template using TemplateManager', () => {
        const template = {
          id: 'template-123',
          name: 'Loaded Template',
          worldConfig: {
            dimensions: { width: 150, height: 150 },
            nodes: [{ id: 'node1', name: 'Loaded Node' }]
          }
        };
        
        mockTemplateManager.getTemplate.mockReturnValue(template);
        
        const loadedWorld = WorldState.loadFromTemplate(mockTemplateManager, 'template-123');
        
        expect(mockTemplateManager.getTemplate).toHaveBeenCalledWith('worlds', 'template-123');
        expect(loadedWorld).toBeInstanceOf(WorldState);
        expect(loadedWorld.name).toBe('Loaded Template');
        expect(loadedWorld.templateId).toBe('template-123');
        expect(loadedWorld.dimensions).toEqual({ width: 150, height: 150 });
      });

      test('should throw error if TemplateManager is not provided', () => {
        expect(() => WorldState.loadFromTemplate(null, 'template-id')).toThrow('TemplateManager is required');
      });

      test('should throw error if template is not found', () => {
        mockTemplateManager.getTemplate.mockReturnValue(null);
        
        expect(() => WorldState.loadFromTemplate(mockTemplateManager, 'non-existent'))
          .toThrow('World template not found: non-existent');
      });
    });

    describe('createContentTemplates', () => {
      test('should create templates from world content', () => {
        mockTemplateManager.addTemplate.mockReturnValue(true);
        
        const templates = worldState.createContentTemplates(
          mockTemplateManager,
          'nodes',
          'MyWorld',
          'Generated from my world'
        );
        
        expect(templates).toHaveLength(1);
        expect(mockTemplateManager.addTemplate).toHaveBeenCalledWith('nodes', expect.objectContaining({
          // The template gets the generated ID based on the original node ID
          id: expect.stringMatching(/^MyWorld_nodes_0_\d+$/),
          description: 'Generated from my world - nodes template',
          type: 'node',
          tags: ['node', 'custom', 'world-generated'],
          version: '1.0.0',
          metadata: expect.objectContaining({
            sourceWorldId: worldState.id,
            sourceWorldName: 'Test World',
            author: 'User',
            createdAt: expect.any(String),
            lastModified: expect.any(String)
          }),
          // The original node data should be spread into the template
          name: 'Test Node', // This comes from the original node
          position: { x: 10, y: 20 }
        }));
      });

      test('should throw error for invalid content type', () => {
        expect(() => worldState.createContentTemplates(mockTemplateManager, 'invalid', 'Name', 'Desc'))
          .toThrow('Invalid content type: invalid');
      });

      test('should throw error if no content exists', () => {
        expect(() => worldState.createContentTemplates(mockTemplateManager, 'interactions', 'Name', 'Desc'))
          .toThrow('No interactions content to create templates from');
      });
    });

    describe('serialize and deserialize', () => {
      test('should serialize world state for storage', () => {
        const serialized = worldState.serialize();
        
        expect(serialized).toEqual({
          id: worldState.id,
          name: 'Test World',
          description: 'A test world for templates',
          dimensions: { width: 100, height: 100 },
          rules: { physics: { gravity: 9.8 } },
          initialConditions: { characterCount: 5, timeScale: 2 },
          nodes: expect.any(Array),
          characters: expect.any(Array),
          interactions: [],
          events: [],
          groups: [],
          items: [],
          version: '1.0.0',
          templateId: null,
          isTemplateInstance: false,
          metadata: expect.objectContaining({
            isValid: worldState.isValid,
            completeness: worldState.completeness,
            createdAt: expect.any(String),
            modifiedAt: expect.any(String)
          })
        });
      });

      test('should serialize without metadata when requested', () => {
        const serialized = worldState.serialize(false);
        
        expect(serialized.metadata).toBeUndefined();
      });

      test('should deserialize world state from storage', () => {
        const serializedData = {
          id: 'test-world-123',
          name: 'Deserialized World',
          dimensions: { width: 200, height: 200 },
          nodes: [{ id: 'node1', name: 'Deserialized Node' }],
          metadata: {
            createdAt: '2023-01-01T00:00:00.000Z',
            modifiedAt: '2023-01-02T00:00:00.000Z',
            isValid: true,
            completeness: 0.9
          }
        };

        const deserialized = WorldState.deserialize(serializedData);
        
        expect(deserialized).toBeInstanceOf(WorldState);
        expect(deserialized.id).toBe('test-world-123');
        expect(deserialized.name).toBe('Deserialized World');
        expect(deserialized.dimensions).toEqual({ width: 200, height: 200 });
        expect(deserialized.nodes).toEqual([{ id: 'node1', name: 'Deserialized Node' }]);
        expect(deserialized.createdAt).toEqual(new Date('2023-01-01T00:00:00.000Z'));
        // Note: modifiedAt will be updated by validation during construction, so we just check it's a Date
        expect(deserialized.modifiedAt).toBeInstanceOf(Date);
      });

      test('should throw error for invalid serialized data', () => {
        expect(() => WorldState.deserialize(null)).toThrow('Invalid serialized data for WorldState');
        expect(() => WorldState.deserialize('invalid')).toThrow('Invalid serialized data for WorldState');
      });
    });

    describe('export and import', () => {
      test('should export world state to portable format', () => {
        const exported = worldState.export();
        
        expect(exported).toEqual({
          format: 'WorldState',
          version: '1.0.0',
          exportedAt: expect.any(String),
          worldState: expect.objectContaining({
            id: worldState.id,
            name: 'Test World'
          })
        });
      });

      test('should export with validation info when requested', () => {
        const exported = worldState.export({ includeValidation: true });
        
        expect(exported.validation).toBe(worldState.validationResult);
      });

      test('should export with template info when available', () => {
        worldState.templateId = 'template-123';
        worldState.isTemplateInstance = true;
        
        const exported = worldState.export({ includeTemplateInfo: true });
        
        expect(exported.templateInfo).toEqual({
          templateId: 'template-123',
          isTemplateInstance: true
        });
      });

      test('should import world state from exported data', () => {
        const exportData = {
          format: 'WorldState',
          version: '1.0.0',
          exportedAt: '2023-01-01T00:00:00.000Z',
          worldState: {
            id: 'imported-world',
            name: 'Imported World',
            dimensions: { width: 300, height: 300 }
          }
        };

        const imported = WorldState.import(exportData);
        
        expect(imported).toBeInstanceOf(WorldState);
        expect(imported.id).toBe('imported-world');
        expect(imported.name).toBe('Imported World');
        expect(imported.dimensions).toEqual({ width: 300, height: 300 });
      });

      test('should throw error for invalid export data', () => {
        expect(() => WorldState.import(null)).toThrow('Invalid export data');
        expect(() => WorldState.import({ format: 'Invalid' })).toThrow('Invalid export format');
        expect(() => WorldState.import({ format: 'WorldState' })).toThrow('Export data missing worldState');
      });
    });
  });
});