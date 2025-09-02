/**
 * Integration tests for environmental compatibility
 * Ensures all existing functionality continues to work with enhanced Node entities
 */

import WorldBuilder from '../../domain/services/WorldBuilder.js';
import LocalStorageWorldRepository from '../../infrastructure/Persistance/LocalStorageWorldRepository.js';
import WorldValidator from '../../domain/services/WorldValidator.js';
import TemplateManager from '../../template/TemplateManager.js';
import { WorldPersistenceService } from '../../application/services/WorldPersistenceService.js';
import Node from '../../domain/entities/Node.js';
import NodeMigrationService from '../../domain/services/NodeMigrationService.js';

describe('Environmental Compatibility Integration Tests', () => {
  let worldBuilder;
  let templateManager;
  let persistenceService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    templateManager = new TemplateManager();
    worldBuilder = new WorldBuilder(templateManager);
    persistenceService = new WorldPersistenceService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('WorldBuilder Environmental Compatibility', () => {
    test('should create enhanced nodes with environmental properties', () => {
      worldBuilder.setWorldProperties('Test World', 'A test world');
      worldBuilder.setRules({ timeScale: 'days' });
      worldBuilder.setInitialConditions({ season: 'spring' });

      const nodeConfig = {
        name: 'Forest Village',
        type: 'settlement',
        description: 'A small village in the forest',
        environment: {
          terrain: 'forest',
          climate: 'temperate',
          lighting: 'normal',
          density: 0.6,
          shelterQuality: 0.8,
          waterAvailability: 0.9,
          airQuality: 0.95,
          hazards: []
        },
        size: 150,
        connections: []
      };

      expect(() => {
        worldBuilder.addNode(nodeConfig);
      }).not.toThrow();

      const nodes = worldBuilder.getAllNodes();
      expect(nodes).toHaveLength(1);
      expect(nodes[0].environment).toBeDefined();
      expect(nodes[0].size).toBe(150);
    });

    test('should handle legacy node format and migrate automatically', () => {
      worldBuilder.setWorldProperties('Test World', 'A test world');
      worldBuilder.setRules({ timeScale: 'days' });
      worldBuilder.setInitialConditions({ season: 'spring' });

      const legacyNodeConfig = {
        name: 'Old Village',
        type: 'settlement',
        description: 'A legacy village',
        resources: ['wood', 'stone'],
        capacity: 100
      };

      expect(() => {
        worldBuilder.addNode(legacyNodeConfig);
      }).not.toThrow();

      const nodes = worldBuilder.getAllNodes();
      expect(nodes).toHaveLength(1);
      
      // Should have environmental properties added during creation
      expect(nodes[0].environment).toBeDefined();
      expect(nodes[0].size).toBeDefined();
      expect(nodes[0].connections).toBeDefined();
    });

    test('should update existing nodes with environmental data', () => {
      worldBuilder.setWorldProperties('Test World', 'A test world');
      worldBuilder.setRules({ timeScale: 'days' });
      worldBuilder.setInitialConditions({ season: 'spring' });

      const nodeConfig = {
        name: 'Test Village',
        type: 'settlement',
        description: 'A test village'
      };

      worldBuilder.addNode(nodeConfig);
      const nodes = worldBuilder.getAllNodes();
      const nodeId = nodes[0].id;

      const updates = {
        environment: {
          terrain: 'plains',
          climate: 'temperate',
          lighting: 'bright',
          density: 0.4,
          shelterQuality: 0.7,
          waterAvailability: 0.8,
          airQuality: 0.9,
          hazards: []
        },
        size: 200
      };

      expect(() => {
        worldBuilder.updateNode(nodeId, updates);
      }).not.toThrow();

      const updatedNodes = worldBuilder.getAllNodes();
      expect(updatedNodes[0].environment.terrain).toBe('plains');
      expect(updatedNodes[0].size).toBe(200);
    });

    test('should migrate existing world to environmental format', () => {
      worldBuilder.setWorldProperties('Test World', 'A test world');
      worldBuilder.setRules({ timeScale: 'days' });
      worldBuilder.setInitialConditions({ season: 'spring' });

      // Add legacy nodes
      const legacyNodes = [
        { name: 'Village A', type: 'settlement', description: 'First village' },
        { name: 'Village B', type: 'settlement', description: 'Second village' },
        { name: 'Forest', type: 'wilderness', description: 'Dark forest' }
      ];

      legacyNodes.forEach(node => worldBuilder.addNode(node));

      expect(() => {
        worldBuilder.migrateNodesToEnvironmentalFormat();
      }).not.toThrow();

      const nodes = worldBuilder.getAllNodes();
      expect(nodes).toHaveLength(3);
      nodes.forEach(node => {
        expect(node.environment).toBeDefined();
        expect(node.size).toBeDefined();
        expect(node.connections).toBeDefined();
      });
    });
  });

  describe('LocalStorageWorldRepository Environmental Compatibility', () => {
    test('should serialize and deserialize enhanced nodes correctly', async () => {
      // Create a Node entity and serialize it to JSON (realistic scenario)
      const nodeEntity = new Node({
        name: 'Enhanced Village',
        type: 'settlement',
        description: 'A village with environmental data',
        environment: {
          terrain: 'forest',
          climate: 'temperate',
          lighting: 'normal',
          density: 0.6,
          shelterQuality: 0.8,
          waterAvailability: 0.9,
          airQuality: 0.95,
          hazards: []
        },
        size: 150
      });

      const worldState = {
        time: 0,
        nodes: [nodeEntity.toJSON()], // Save as JSON, not as Node entity
        npcs: [],
        resources: {}
      };

      await expect(LocalStorageWorldRepository.saveWorld(worldState)).resolves.not.toThrow();

      const loadedWorld = await LocalStorageWorldRepository.getWorld();
      expect(loadedWorld).toBeDefined();
      expect(loadedWorld.nodes).toHaveLength(1);
      
      const loadedNode = loadedWorld.nodes[0];
      expect(loadedNode).toBeInstanceOf(Node);
      expect(loadedNode.environment).toBeDefined();
      expect(loadedNode.environment.terrain).toBe('forest');
      expect(loadedNode.size).toBe(150);
    });

    test('should migrate legacy nodes during loading', async () => {
      // Manually save legacy world data
      const legacyWorldState = {
        time: 0,
        nodes: [
          {
            id: 'legacy_node_1',
            name: 'Legacy Village',
            type: 'settlement',
            description: 'A legacy village',
            position: { x: 0, y: 0 }
          }
        ],
        npcs: [],
        resources: {}
      };

      localStorage.setItem('worldState', JSON.stringify(legacyWorldState));

      const loadedWorld = await LocalStorageWorldRepository.getWorld();
      expect(loadedWorld).toBeDefined();
      expect(loadedWorld.nodes).toHaveLength(1);
      
      const loadedNode = loadedWorld.nodes[0];
      expect(loadedNode).toBeInstanceOf(Node);
      expect(loadedNode.environment).toBeDefined();
      expect(loadedNode.size).toBeDefined();
      expect(loadedNode.connections).toBeDefined();
    });

    test('should validate environmental data integrity', async () => {
      const worldState = {
        time: 0,
        nodes: [
          new Node({
            name: 'Valid Node',
            type: 'settlement',
            description: 'A valid node',
            environment: {
              terrain: 'forest',
              climate: 'temperate',
              lighting: 'normal',
              density: 0.6,
              shelterQuality: 0.8,
              waterAvailability: 0.9,
              airQuality: 0.95,
              hazards: []
            }
          }),
          {
            id: 'invalid_node',
            name: 'Invalid Node',
            type: 'settlement',
            description: 'A node with invalid environmental data',
            environment: 'invalid_environment_data'
          }
        ],
        npcs: [],
        resources: {}
      };

      await LocalStorageWorldRepository.saveWorld(worldState);

      const validationReport = await LocalStorageWorldRepository.validateEnvironmentalData();
      expect(validationReport).toBeDefined();
      expect(validationReport.totalNodes).toBe(2);
      expect(validationReport.enhancedNodes).toBe(1);
      expect(validationReport.errors.length).toBeGreaterThan(0);
    });
  });

  describe('WorldValidator Environmental Compatibility', () => {
    test('should validate enhanced nodes with environmental properties', () => {
      const enhancedNode = {
        id: 'test_node',
        name: 'Test Node',
        type: 'settlement',
        description: 'A test node with environmental data',
        environment: {
          terrain: 'forest',
          climate: 'temperate',
          lighting: 'normal',
          density: 0.6,
          shelterQuality: 0.8,
          waterAvailability: 0.9,
          airQuality: 0.95,
          hazards: []
        },
        size: 150,
        connections: []
      };

      const validation = WorldValidator.validateSingleNode(enhancedNode);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should validate enhanced Node entities', () => {
      const nodeEntity = new Node({
        name: 'Entity Node',
        type: 'settlement',
        description: 'A Node entity',
        environment: {
          terrain: 'plains',
          climate: 'temperate',
          lighting: 'bright',
          density: 0.4,
          shelterQuality: 0.7,
          waterAvailability: 0.8,
          airQuality: 0.9,
          hazards: []
        },
        size: 200
      });

      const validation = WorldValidator.validateEnhancedNode(nodeEntity);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should handle validation of legacy nodes', () => {
      const legacyNode = {
        id: 'legacy_node',
        name: 'Legacy Node',
        type: 'settlement',
        description: 'A legacy node without environmental data',
        resources: ['wood', 'stone'],
        capacity: 100
      };

      const validation = WorldValidator.validateSingleNode(legacyNode);
      expect(validation.isValid).toBe(true);
      // May have warnings about missing environmental data
    });
  });

  describe('TemplateManager Environmental Compatibility', () => {
    test('should instantiate node templates with environmental data', () => {
      const nodeTemplate = {
        id: 'forest_village_template',
        name: 'Forest Village Template',
        type: 'settlement',
        description: 'A template for forest villages',
        environment: {
          terrain: 'forest',
          climate: 'temperate',
          lighting: 'normal',
          density: 0.6,
          shelterQuality: 0.8,
          waterAvailability: 0.9,
          airQuality: 0.95,
          hazards: []
        },
        size: 150,
        tags: ['settlement', 'forest', 'environmental']
      };

      templateManager.addTemplate('nodes', nodeTemplate);

      const instantiated = templateManager.instantiateNodeTemplate('forest_village_template', {
        name: 'Customized Forest Village',
        size: 200
      });

      expect(instantiated).toBeDefined();
      expect(instantiated.name).toBe('Customized Forest Village');
      expect(instantiated.size).toBe(200);
      expect(instantiated.environment).toBeDefined();
      expect(instantiated.environment.terrain).toBe('forest');
    });

    test('should create templates with environmental data', () => {
      const nodeData = new Node({
        name: 'Sample Node',
        type: 'settlement',
        description: 'A sample node',
        environment: {
          terrain: 'mountains',
          climate: 'arctic',
          lighting: 'dim',
          density: 0.3,
          shelterQuality: 0.9,
          waterAvailability: 0.6,
          airQuality: 0.8,
          hazards: ['cold', 'avalanche']
        },
        size: 80
      });

      const template = templateManager.createNodeTemplateWithEnvironmentalData(
        nodeData.toJSON(),
        'Mountain Fortress Template',
        'A template for mountain fortresses',
        ['fortress', 'mountain', 'defensive']
      );

      expect(template).toBeDefined();
      expect(template.metadata.hasEnvironmentalData).toBe(true);
      expect(template.metadata.environmentalFeatures).toContain('terrain:mountains');
      expect(template.metadata.environmentalFeatures).toContain('climate:arctic');
      expect(template.metadata.environmentalFeatures).toContain('hazards:2');
    });

    test('should validate environmental templates', () => {
      const nodeTemplate = {
        id: 'test_template',
        name: 'Test Template',
        type: 'settlement',
        description: 'A test template',
        environment: {
          terrain: 'forest',
          climate: 'temperate',
          lighting: 'normal',
          density: 0.6,
          shelterQuality: 0.8,
          waterAvailability: 0.9,
          airQuality: 0.95,
          hazards: []
        },
        size: 150
      };

      templateManager.addTemplate('nodes', nodeTemplate);

      const validation = templateManager.validateEnvironmentalTemplate('nodes', 'test_template');
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.environmentalFeatures).toBeDefined();
    });
  });

  describe('WorldPersistenceService Environmental Compatibility', () => {
    test('should migrate world nodes to environmental format', async () => {
      // Create a world with legacy nodes
      const worldData = {
        id: 'test_world',
        name: 'Test World',
        description: 'A test world',
        nodes: [
          {
            id: 'legacy_node_1',
            name: 'Legacy Village',
            type: 'settlement',
            description: 'A legacy village'
          },
          {
            id: 'legacy_node_2',
            name: 'Legacy Forest',
            type: 'wilderness',
            description: 'A legacy forest'
          }
        ],
        characters: [],
        interactions: [],
        encounters: []
      };

      await persistenceService.saveWorld(worldData);

      const migrationResult = await persistenceService.migrateWorldNodesToEnvironmentalFormat('test_world');
      
      expect(migrationResult.totalNodes).toBe(2);
      expect(migrationResult.migratedNodes).toBe(2);
      expect(migrationResult.failedNodes).toBe(0);

      // Verify the migrated world
      const migratedWorld = await persistenceService.loadWorld('test_world');
      expect(migratedWorld.nodes).toHaveLength(2);
      migratedWorld.nodes.forEach(node => {
        expect(node.environment).toBeDefined();
        expect(node.size).toBeDefined();
        expect(node.connections).toBeDefined();
      });
    });

    test('should validate environmental data integrity', async () => {
      const worldData = {
        id: 'validation_world',
        name: 'Validation World',
        description: 'A world for validation testing',
        nodes: [
          new Node({
            name: 'Valid Node',
            type: 'settlement',
            description: 'A valid node',
            environment: {
              terrain: 'forest',
              climate: 'temperate',
              lighting: 'normal',
              density: 0.6,
              shelterQuality: 0.8,
              waterAvailability: 0.9,
              airQuality: 0.95,
              hazards: []
            }
          }).toJSON(),
          {
            id: 'legacy_node',
            name: 'Legacy Node',
            type: 'settlement',
            description: 'A legacy node'
          }
        ],
        characters: [],
        interactions: [],
        encounters: []
      };

      await persistenceService.saveWorld(worldData);

      const validationResult = await persistenceService.validateWorldEnvironmentalData('validation_world');
      
      expect(validationResult.totalNodes).toBe(2);
      expect(validationResult.enhancedNodes).toBe(1);
      expect(validationResult.legacyNodes).toBe(1);
      expect(validationResult.warnings.length).toBeGreaterThan(0);
    });

    test('should handle migration errors gracefully', async () => {
      const worldData = {
        id: 'error_world',
        name: 'Error World',
        description: 'A world with problematic nodes',
        nodes: [
          {
            // Missing required fields to trigger migration errors
            name: null,
            type: null,
            description: null
          }
        ],
        characters: [],
        interactions: [],
        encounters: []
      };

      await persistenceService.saveWorld(worldData);

      const migrationResult = await persistenceService.migrateWorldNodesToEnvironmentalFormat('error_world');
      
      expect(migrationResult.totalNodes).toBe(1);
      expect(migrationResult.failedNodes).toBeGreaterThan(0);
      expect(migrationResult.errors.length).toBeGreaterThan(0);
    });
  });

  describe('End-to-End Environmental Workflow', () => {
    test('should support complete environmental workflow', async () => {
      // 1. Create world with environmental nodes
      worldBuilder.setWorldProperties('Environmental World', 'A world with environmental features');
      worldBuilder.setRules({ timeScale: 'days', weatherSystem: true });
      worldBuilder.setInitialConditions({ season: 'spring', weather: 'clear' });

      // 2. Add nodes with environmental data
      const forestVillage = {
        name: 'Greenwood Village',
        type: 'settlement',
        description: 'A peaceful village in the forest',
        environment: {
          terrain: 'forest',
          climate: 'temperate',
          lighting: 'normal',
          density: 0.6,
          shelterQuality: 0.8,
          waterAvailability: 0.9,
          airQuality: 0.95,
          hazards: []
        },
        size: 200
      };

      const mountainFortress = {
        name: 'Ironhold Fortress',
        type: 'fortress',
        description: 'A mighty fortress in the mountains',
        environment: {
          terrain: 'mountains',
          climate: 'arctic',
          lighting: 'bright',
          density: 0.3,
          shelterQuality: 0.95,
          waterAvailability: 0.6,
          airQuality: 0.8,
          hazards: ['cold', 'avalanche']
        },
        size: 150
      };

      worldBuilder.addNode(forestVillage);
      worldBuilder.addNode(mountainFortress);

      // 3. Add characters and interactions
      worldBuilder.addInteraction({
        name: 'Trade Goods',
        type: 'economic',
        requirements: { attributes: { charisma: 12 } },
        branches: [{ condition: 'success', text: 'Trade successful' }],
        effects: { gold: '+10' },
        context: 'settlement'
      });

      worldBuilder.addCharacter({
        name: 'Forest Trader',
        attributes: { strength: 10, dexterity: 12, constitution: 11, intelligence: 14, wisdom: 13, charisma: 15 },
        assignedInteractions: []
      });

      // 4. Assign characters to nodes
      const characters = worldBuilder.getAllCharacters();
      const nodes = worldBuilder.getAllNodes();
      worldBuilder.assignCharacterToNode(characters[0].id, nodes[0].id);

      // 5. Validate world
      const validation = worldBuilder.validate();
      expect(validation.isValid).toBe(true);

      // 6. Save world
      const worldConfig = worldBuilder.worldConfig;
      const savedWorld = await persistenceService.saveWorld(worldConfig);
      expect(savedWorld).toBeDefined();

      // 7. Load and verify world
      const loadedWorld = await persistenceService.loadWorld(savedWorld.id);
      expect(loadedWorld).toBeDefined();
      expect(loadedWorld.nodes).toHaveLength(2);
      
      // 8. Verify environmental functionality
      loadedWorld.nodes.forEach(nodeData => {
        const node = Node.fromJSON(nodeData);
        expect(node.getEnvironmentalDanger()).toBeGreaterThanOrEqual(0);
        expect(node.getEnvironmentalDanger()).toBeLessThanOrEqual(1);
        expect(node.getPopulationCapacity()).toBeGreaterThan(0);
        expect(node.getEnvironmentalModifiers('combat')).toBeDefined();
      });

      // 9. Test template creation from environmental nodes
      const template = templateManager.createNodeTemplateWithEnvironmentalData(
        loadedWorld.nodes[0],
        'Forest Village Template',
        'Template based on Greenwood Village',
        ['forest', 'settlement']
      );
      expect(template).toBeDefined();
      expect(template.metadata.hasEnvironmentalData).toBe(true);

      // 10. Test template instantiation
      const instantiated = templateManager.instantiateNodeTemplate(template.id, {
        name: 'New Forest Village',
        size: 250
      });
      expect(instantiated.name).toBe('New Forest Village');
      expect(instantiated.size).toBe(250);
      expect(instantiated.environment.terrain).toBe('forest');
    });
  });
});