/**
 * WorldBuilder Tests
 * Tests for the core world builder infrastructure with six-step flow
 */

import WorldBuilder from '../WorldBuilder';

describe('WorldBuilder', () => {
  let worldBuilder;
  let mockTemplateManager;

  beforeEach(() => {
    mockTemplateManager = {
      getTemplate: jest.fn(),
      addTemplate: jest.fn()
    };
    worldBuilder = new WorldBuilder(mockTemplateManager);
  });

  describe('Constructor', () => {
    it('should initialize with default configuration', () => {
      const builder = new WorldBuilder();
      expect(builder.currentStep).toBe(1);
      expect(builder.worldConfig.name).toBeNull();
      expect(builder.worldConfig.nodes).toEqual([]);
      expect(builder.worldConfig.interactions).toEqual([]);
      expect(builder.worldConfig.characters).toEqual([]);
      expect(builder.worldConfig.nodePopulations).toEqual({});
      expect(builder.worldConfig.isComplete).toBe(false);
      expect(builder.worldConfig.isValid).toBe(false);
    });

    it('should initialize step validation to false', () => {
      const builder = new WorldBuilder();
      for (let i = 1; i <= 6; i++) {
        expect(builder.worldConfig.stepValidation[i]).toBe(false);
      }
    });
  });

  describe('Step 1: World Properties', () => {
    it('should set world properties correctly', () => {
      worldBuilder.setWorldProperties('Test World', 'A test world for simulation');
      
      expect(worldBuilder.worldConfig.name).toBe('Test World');
      expect(worldBuilder.worldConfig.description).toBe('A test world for simulation');
      expect(worldBuilder.worldConfig.stepValidation[1]).toBe(false); // Still need rules and conditions
    });

    it('should validate world name and description', () => {
      expect(() => worldBuilder.setWorldProperties('', 'description')).toThrow('World name is required');
      expect(() => worldBuilder.setWorldProperties('name', '')).toThrow('World description is required');
      expect(() => worldBuilder.setWorldProperties(null, 'description')).toThrow('World name is required');
    });

    it('should set rules correctly', () => {
      const rules = { timeProgression: 'turn-based', maxTurns: 100 };
      worldBuilder.setRules(rules);
      
      expect(worldBuilder.worldConfig.rules).toEqual(rules);
    });

    it('should set initial conditions correctly', () => {
      const conditions = { startingResources: 1000, difficulty: 'normal' };
      worldBuilder.setInitialConditions(conditions);
      
      expect(worldBuilder.worldConfig.initialConditions).toEqual(conditions);
    });

    it('should validate step 1 when all properties are set', () => {
      worldBuilder
        .setWorldProperties('Test World', 'A test world')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 });
      
      expect(worldBuilder.worldConfig.stepValidation[1]).toBe(true);
    });
  });

  describe('Step 2: Nodes', () => {
    beforeEach(() => {
      // Complete step 1 first
      worldBuilder
        .setWorldProperties('Test World', 'A test world')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 });
    });

    it('should add nodes correctly', () => {
      const nodeConfig = {
        name: 'Test Village',
        type: 'settlement',
        description: 'A small test village',
        environmentalProperties: { climate: 'temperate' },
        resourceAvailability: { food: 'abundant' },
        culturalContext: { culture: 'farming' }
      };

      worldBuilder.addNode(nodeConfig);
      
      expect(worldBuilder.worldConfig.nodes).toHaveLength(1);
      expect(worldBuilder.worldConfig.nodes[0].name).toBe('Test Village');
      expect(worldBuilder.worldConfig.nodes[0].type).toBe('settlement');
      expect(worldBuilder.worldConfig.stepValidation[2]).toBe(true);
    });

    it('should prevent adding nodes without step 1 completion', () => {
      const incompleteBuilder = new WorldBuilder();
      const nodeConfig = {
        name: 'Test Village',
        type: 'settlement',
        description: 'A small test village'
      };

      expect(() => incompleteBuilder.addNode(nodeConfig)).toThrow('Cannot add nodes until world properties are set');
    });

    it('should validate required node fields', () => {
      expect(() => worldBuilder.addNode({})).toThrow('Node name is required');
      expect(() => worldBuilder.addNode({ name: 'Test' })).toThrow('Node type is required');
      expect(() => worldBuilder.addNode({ name: 'Test', type: 'settlement' })).toThrow('Node description is required');
    });

    it('should reject spatial coordinates in mappless system', () => {
      const nodeConfig = {
        name: 'Test Village',
        type: 'settlement',
        description: 'A small test village',
        x: 10,
        y: 20
      };

      expect(() => worldBuilder.addNode(nodeConfig)).toThrow('Spatial coordinates not allowed in mappless system');
    });

    it('should generate unique IDs for nodes', () => {
      const nodeConfig1 = { name: 'Village 1', type: 'settlement', description: 'First village' };
      const nodeConfig2 = { name: 'Village 2', type: 'settlement', description: 'Second village' };

      worldBuilder.addNode(nodeConfig1).addNode(nodeConfig2);
      
      expect(worldBuilder.worldConfig.nodes[0].id).toBeDefined();
      expect(worldBuilder.worldConfig.nodes[1].id).toBeDefined();
      expect(worldBuilder.worldConfig.nodes[0].id).not.toBe(worldBuilder.worldConfig.nodes[1].id);
    });
  });

  describe('Step 3: Interactions', () => {
    beforeEach(() => {
      // Complete steps 1-2 first
      worldBuilder
        .setWorldProperties('Test World', 'A test world')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 })
        .addNode({
          name: 'Test Village',
          type: 'settlement',
          description: 'A small test village'
        });
    });

    it('should add interactions correctly', () => {
      const interactionConfig = {
        name: 'Trade Goods',
        type: 'economic',
        requirements: { charisma: 12 },
        branches: [{ condition: 'success', outcome: 'gain_gold' }],
        effects: [{ type: 'resource', target: 'self', operation: 'add', value: 100 }],
        context: ['market', 'settlement']
      };

      worldBuilder.addInteraction(interactionConfig);
      
      expect(worldBuilder.worldConfig.interactions).toHaveLength(1);
      expect(worldBuilder.worldConfig.interactions[0].name).toBe('Trade Goods');
      expect(worldBuilder.worldConfig.interactions[0].type).toBe('economic');
      expect(worldBuilder.worldConfig.stepValidation[3]).toBe(true);
    });

    it('should prevent adding interactions without step 2 completion', () => {
      const incompleteBuilder = new WorldBuilder();
      incompleteBuilder
        .setWorldProperties('Test World', 'A test world')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 });

      const interactionConfig = {
        name: 'Trade Goods',
        type: 'economic',
        requirements: {},
        branches: [],
        effects: [],
        context: []
      };

      expect(() => incompleteBuilder.addInteraction(interactionConfig)).toThrow('Cannot add interactions until at least one node exists');
    });

    it('should validate interaction types', () => {
      const invalidInteractionConfig = {
        name: 'Invalid Interaction',
        type: 'invalid_type',
        requirements: {},
        branches: [],
        effects: [],
        context: []
      };

      expect(() => worldBuilder.addInteraction(invalidInteractionConfig)).toThrow('Invalid interaction type');
    });

    it('should validate required interaction fields', () => {
      expect(() => worldBuilder.addInteraction({})).toThrow('Interaction name is required');
      
      const partialConfig = { name: 'Test' };
      expect(() => worldBuilder.addInteraction(partialConfig)).toThrow('Interaction type is required');
    });
  });

  describe('Step 4: Characters', () => {
    beforeEach(() => {
      // Complete steps 1-3 first
      worldBuilder
        .setWorldProperties('Test World', 'A test world')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 })
        .addNode({
          name: 'Test Village',
          type: 'settlement',
          description: 'A small test village'
        })
        .addInteraction({
          name: 'Trade Goods',
          type: 'economic',
          requirements: { charisma: 12 },
          branches: [{ condition: 'success', outcome: 'gain_gold' }],
          effects: [{ type: 'resource', target: 'self', operation: 'add', value: 100 }],
          context: ['market', 'settlement']
        });
    });

    it('should add characters correctly', () => {
      const characterConfig = {
        name: 'Test Merchant',
        attributes: {
          strength: 10,
          dexterity: 12,
          constitution: 11,
          intelligence: 14,
          wisdom: 13,
          charisma: 16
        },
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id],
        personality: { trait: 'friendly' },
        consciousness: { frequency: 40 }
      };

      worldBuilder.addCharacter(characterConfig);
      
      expect(worldBuilder.worldConfig.characters).toHaveLength(1);
      expect(worldBuilder.worldConfig.characters[0].name).toBe('Test Merchant');
      expect(worldBuilder.worldConfig.characters[0].attributes.charisma).toBe(16);
      expect(worldBuilder.worldConfig.stepValidation[4]).toBe(true);
    });

    it('should prevent adding characters without steps 2-3 completion', () => {
      const incompleteBuilder = new WorldBuilder();
      incompleteBuilder
        .setWorldProperties('Test World', 'A test world')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 });

      const characterConfig = {
        name: 'Test Character',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        assignedInteractions: []
      };

      expect(() => incompleteBuilder.addCharacter(characterConfig)).toThrow('Cannot add characters until both nodes and interactions exist');
    });

    it('should validate D&D attributes', () => {
      const invalidCharacterConfig = {
        name: 'Test Character',
        attributes: { strength: 'invalid' },
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      };

      expect(() => worldBuilder.addCharacter(invalidCharacterConfig)).toThrow('Character attribute strength must be a number');
    });

    it('should validate assigned interactions exist', () => {
      const characterConfig = {
        name: 'Test Character',
        attributes: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10
        },
        assignedInteractions: ['nonexistent_interaction']
      };

      expect(() => worldBuilder.addCharacter(characterConfig)).toThrow('Assigned interaction \'nonexistent_interaction\' does not exist');
    });

    it('should require at least one assigned interaction', () => {
      const characterConfig = {
        name: 'Test Character',
        attributes: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10
        },
        assignedInteractions: []
      };

      expect(() => worldBuilder.addCharacter(characterConfig)).toThrow('Character must have at least one assigned interaction');
    });
  });

  describe('Step 5: Node Population', () => {
    beforeEach(() => {
      // Complete steps 1-4 first
      worldBuilder
        .setWorldProperties('Test World', 'A test world')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 })
        .addNode({
          name: 'Test Village',
          type: 'settlement',
          description: 'A small test village'
        })
        .addInteraction({
          name: 'Trade Goods',
          type: 'economic',
          requirements: { charisma: 12 },
          branches: [{ condition: 'success', outcome: 'gain_gold' }],
          effects: [{ type: 'resource', target: 'self', operation: 'add', value: 100 }],
          context: ['market', 'settlement']
        })
        .addCharacter({
          name: 'Test Merchant',
          attributes: {
            strength: 10,
            dexterity: 12,
            constitution: 11,
            intelligence: 14,
            wisdom: 13,
            charisma: 16
          },
          assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
        });
    });

    it('should assign characters to nodes correctly', () => {
      const nodeId = worldBuilder.worldConfig.nodes[0].id;
      const characterId = worldBuilder.worldConfig.characters[0].id;

      worldBuilder.assignCharacterToNode(characterId, nodeId);
      
      expect(worldBuilder.worldConfig.nodePopulations[nodeId]).toContain(characterId);
      expect(worldBuilder.worldConfig.stepValidation[5]).toBe(true);
    });

    it('should populate nodes with multiple characters', () => {
      const nodeId = worldBuilder.worldConfig.nodes[0].id;
      
      // Add another character
      worldBuilder.addCharacter({
        name: 'Test Guard',
        attributes: {
          strength: 16,
          dexterity: 12,
          constitution: 14,
          intelligence: 10,
          wisdom: 12,
          charisma: 10
        },
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      });

      const characterIds = worldBuilder.worldConfig.characters.map(c => c.id);
      worldBuilder.populateNode(nodeId, characterIds);
      
      expect(worldBuilder.worldConfig.nodePopulations[nodeId]).toHaveLength(2);
      expect(worldBuilder.worldConfig.stepValidation[5]).toBe(true);
    });

    it('should validate character and node existence', () => {
      expect(() => worldBuilder.assignCharacterToNode('nonexistent', 'nonexistent')).toThrow('Character \'nonexistent\' does not exist');
      
      const characterId = worldBuilder.worldConfig.characters[0].id;
      expect(() => worldBuilder.assignCharacterToNode(characterId, 'nonexistent')).toThrow('Node \'nonexistent\' does not exist');
    });
  });

  describe('Step Validation and Dependencies', () => {
    it('should enforce step dependencies', () => {
      expect(worldBuilder.canProceedToStep(1)).toBe(true);
      expect(worldBuilder.canProceedToStep(2)).toBe(false);
      expect(worldBuilder.canProceedToStep(3)).toBe(false);
      expect(worldBuilder.canProceedToStep(4)).toBe(false);
      expect(worldBuilder.canProceedToStep(5)).toBe(false);
      expect(worldBuilder.canProceedToStep(6)).toBe(false);
    });

    it('should validate individual steps', () => {
      expect(worldBuilder.validateStep(1)).toBe(false);
      
      worldBuilder
        .setWorldProperties('Test World', 'A test world')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 });
      
      expect(worldBuilder.validateStep(1)).toBe(true);
      expect(worldBuilder.canProceedToStep(2)).toBe(true);
    });
  });

  describe('Build and Validation', () => {
    it('should build complete world configuration', () => {
      // Complete all steps
      worldBuilder
        .setWorldProperties('Test World', 'A test world')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 })
        .addNode({
          name: 'Test Village',
          type: 'settlement',
          description: 'A small test village'
        })
        .addInteraction({
          name: 'Trade Goods',
          type: 'economic',
          requirements: { charisma: 12 },
          branches: [{ condition: 'success', outcome: 'gain_gold' }],
          effects: [{ type: 'resource', target: 'self', operation: 'add', value: 100 }],
          context: ['market', 'settlement']
        })
        .addCharacter({
          name: 'Test Merchant',
          attributes: {
            strength: 10,
            dexterity: 12,
            constitution: 11,
            intelligence: 14,
            wisdom: 13,
            charisma: 16
          },
          assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
        });

      const nodeId = worldBuilder.worldConfig.nodes[0].id;
      const characterId = worldBuilder.worldConfig.characters[0].id;
      worldBuilder.assignCharacterToNode(characterId, nodeId);

      // Manually validate step 6 since it depends on step 5 being complete
      worldBuilder.validateStep(6);

      const worldState = worldBuilder.build();
      
      expect(worldState.isComplete).toBe(true);
      expect(worldState.isValid).toBe(true);
      expect(worldState.builtAt).toBeDefined();
    });

    it('should validate entire world configuration', () => {
      const validation = worldBuilder.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Step 1 validation failed');
      expect(validation.completeness).toBe(0);
    });

    it('should reset world builder', () => {
      worldBuilder.setWorldProperties('Test', 'Test');
      worldBuilder.reset();
      
      expect(worldBuilder.currentStep).toBe(1);
      expect(worldBuilder.worldConfig.name).toBeNull();
      expect(worldBuilder.worldConfig.stepValidation[1]).toBe(false);
    });
  });

  describe('Template Integration', () => {
    it('should save world as template', () => {
      worldBuilder
        .setWorldProperties('Test World', 'A test world')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 });

      const template = worldBuilder.saveAsTemplate('world', 'Test Template', 'A test template');
      
      expect(mockTemplateManager.addTemplate).toHaveBeenCalledWith('worlds', expect.objectContaining({
        name: 'Test Template',
        description: 'A test template',
        type: 'world'
      }));
      expect(template.worldConfig).toBeDefined();
    });

    it('should load from template', () => {
      const mockTemplate = {
        id: 'test_template',
        worldConfig: {
          name: 'Template World',
          description: 'From template',
          rules: { timeProgression: 'turn-based' },
          initialConditions: { startingResources: 500 },
          nodes: [],
          interactions: [],
          characters: [],
          nodePopulations: {},
          stepValidation: { 1: true, 2: false, 3: false, 4: false, 5: false, 6: false }
        }
      };

      mockTemplateManager.getTemplate.mockReturnValue(mockTemplate);
      
      worldBuilder.loadFromTemplate('test_template');
      
      expect(worldBuilder.worldConfig.name).toBe('Template World');
      expect(worldBuilder.worldConfig.templateId).toBe('test_template');
      expect(worldBuilder.worldConfig.isTemplateInstance).toBe(true);
    });

    it('should add nodes from template', () => {
      // Complete step 1 first
      worldBuilder
        .setWorldProperties('Test World', 'A test world')
        .setRules({ timeProgression: 'turn-based' })
        .setInitialConditions({ startingResources: 1000 });

      const mockNodeTemplate = {
        id: 'village_template',
        name: 'Village Template',
        type: 'settlement',
        description: 'A template village',
        environmentalProperties: { climate: 'temperate' }
      };

      mockTemplateManager.getTemplate.mockReturnValue(mockNodeTemplate);
      
      worldBuilder.addNodeFromTemplate('village_template', { name: 'Custom Village' });
      
      expect(worldBuilder.worldConfig.nodes).toHaveLength(1);
      expect(worldBuilder.worldConfig.nodes[0].name).toBe('Custom Village');
      expect(worldBuilder.worldConfig.nodes[0].templateId).toBe('village_template');
    });
  });
});