/**
 * useWorldBuilder Hook Tests
 * 
 * Tests for core hook functionality for step-by-step progression
 * Validates state management, template operations, and step navigation
 */

import { renderHook, act } from '@testing-library/react';
import useWorldBuilder from './useWorldBuilder';

// Mock TemplateManager
const mockTemplateManager = {
  getAllTemplates: jest.fn(),
  getTemplate: jest.fn(),
  addTemplate: jest.fn()
};

describe('useWorldBuilder Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock returns
    mockTemplateManager.getAllTemplates.mockImplementation((type) => {
      switch (type) {
        case 'worlds':
          return [
            { id: 'world1', name: 'Test World', description: 'A test world' }
          ];
        case 'nodes':
          return [
            { id: 'node1', name: 'Test Node', type: 'settlement', description: 'A test node' }
          ];
        case 'interactions':
          return [
            { id: 'interaction1', name: 'Test Interaction', type: 'economic', description: 'A test interaction' }
          ];
        case 'characters':
          return [
            { id: 'character1', name: 'Test Character', description: 'A test character' }
          ];
        case 'composite':
          return [];
        default:
          return [];
      }
    });
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useWorldBuilder());

      expect(result.current.currentStep).toBe(1);
      expect(result.current.worldConfig).toBeDefined();
      expect(result.current.worldConfig.name).toBeNull();
      expect(result.current.worldConfig.nodes).toEqual([]);
      expect(result.current.worldConfig.interactions).toEqual([]);
      expect(result.current.worldConfig.characters).toEqual([]);
      expect(result.current.worldConfig.nodePopulations).toEqual({});
      expect(result.current.isWorldComplete).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load templates when templateManager is provided', async () => {
      const { result } = renderHook(() => useWorldBuilder(mockTemplateManager));

      // Wait for templates to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockTemplateManager.getAllTemplates).toHaveBeenCalledWith('worlds');
      expect(mockTemplateManager.getAllTemplates).toHaveBeenCalledWith('nodes');
      expect(mockTemplateManager.getAllTemplates).toHaveBeenCalledWith('interactions');
      expect(mockTemplateManager.getAllTemplates).toHaveBeenCalledWith('characters');
      expect(mockTemplateManager.getAllTemplates).toHaveBeenCalledWith('composite');
      
      expect(result.current.availableTemplates.worlds).toHaveLength(1);
      expect(result.current.availableTemplates.nodes).toHaveLength(1);
    });
  });

  describe('Step 1: World Properties', () => {
    it('should set world properties successfully', () => {
      const { result } = renderHook(() => useWorldBuilder());

      act(() => {
        result.current.setWorldProperties('Test World', 'A test world for simulation');
      });

      expect(result.current.worldConfig.name).toBe('Test World');
      expect(result.current.worldConfig.description).toBe('A test world for simulation');
      expect(result.current.error).toBeNull();
    });

    it('should set rules successfully', () => {
      const { result } = renderHook(() => useWorldBuilder());
      const rules = { timeProgression: 'realtime', maxPopulation: 1000 };

      act(() => {
        result.current.setRules(rules);
      });

      expect(result.current.worldConfig.rules).toEqual(rules);
      expect(result.current.error).toBeNull();
    });

    it('should set initial conditions successfully', () => {
      const { result } = renderHook(() => useWorldBuilder());
      const conditions = { startingResources: 100, difficulty: 'normal' };

      act(() => {
        result.current.setInitialConditions(conditions);
      });

      expect(result.current.worldConfig.initialConditions).toEqual(conditions);
      expect(result.current.error).toBeNull();
    });

    it('should validate step 1 when all properties are set', () => {
      const { result } = renderHook(() => useWorldBuilder());

      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
      });

      expect(result.current.stepValidationStatus[1]).toBe(true);
    });

    it('should handle errors when setting invalid properties', () => {
      const { result } = renderHook(() => useWorldBuilder());

      act(() => {
        try {
          result.current.setWorldProperties('', 'Description');
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Step 2: Nodes', () => {
    beforeEach(() => {
      // Setup world properties first
    });

    it('should add node successfully after step 1 is complete', () => {
      const { result } = renderHook(() => useWorldBuilder());

      // Complete step 1 first
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
      });

      const nodeConfig = {
        name: 'Test Village',
        type: 'settlement',
        description: 'A small village',
        environmentalProperties: { climate: 'temperate' }
      };

      act(() => {
        result.current.addNode(nodeConfig);
      });

      expect(result.current.worldConfig.nodes).toHaveLength(1);
      expect(result.current.worldConfig.nodes[0].name).toBe('Test Village');
      expect(result.current.stepValidationStatus[2]).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should prevent adding nodes before step 1 is complete', () => {
      const { result } = renderHook(() => useWorldBuilder());

      const nodeConfig = {
        name: 'Test Village',
        type: 'settlement',
        description: 'A small village'
      };

      act(() => {
        try {
          result.current.addNode(nodeConfig);
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.worldConfig.nodes).toHaveLength(0);
    });

    it('should add node from template successfully', () => {
      const { result } = renderHook(() => useWorldBuilder(mockTemplateManager));

      // Complete step 1 first
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
      });

      // Mock template
      mockTemplateManager.getTemplate.mockReturnValue({
        id: 'template1',
        name: 'Village Template',
        type: 'settlement',
        description: 'A template village',
        environmentalProperties: { climate: 'temperate' }
      });

      act(() => {
        result.current.addNodeFromTemplate('template1', { name: 'Custom Village' });
      });

      expect(result.current.worldConfig.nodes).toHaveLength(1);
      expect(result.current.worldConfig.nodes[0].name).toBe('Custom Village');
      expect(result.current.worldConfig.nodes[0].isTemplateInstance).toBe(true);
    });

    it('should remove node successfully', () => {
      const { result } = renderHook(() => useWorldBuilder());

      // Setup world and add node
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
        result.current.addNode({
          name: 'Test Village',
          type: 'settlement',
          description: 'A small village'
        });
      });

      const nodeId = result.current.worldConfig.nodes[0].id;

      act(() => {
        result.current.removeNode(nodeId);
      });

      expect(result.current.worldConfig.nodes).toHaveLength(0);
      expect(result.current.stepValidationStatus[2]).toBe(false);
    });
  });

  describe('Step 3: Interactions', () => {
    it('should add interaction successfully after step 2 is complete', () => {
      const { result } = renderHook(() => useWorldBuilder());

      // Complete steps 1-2 first
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
        result.current.addNode({
          name: 'Test Village',
          type: 'settlement',
          description: 'A small village'
        });
      });

      const interactionConfig = {
        name: 'Trade Goods',
        type: 'economic',
        requirements: { charisma: 12 },
        branches: [{ condition: 'success', text: 'Trade successful' }],
        effects: [{ type: 'resource', operation: 'add', value: 10 }],
        context: ['settlement']
      };

      act(() => {
        result.current.addInteraction(interactionConfig);
      });

      expect(result.current.worldConfig.interactions).toHaveLength(1);
      expect(result.current.worldConfig.interactions[0].name).toBe('Trade Goods');
      expect(result.current.stepValidationStatus[3]).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should prevent adding interactions before step 2 is complete', () => {
      const { result } = renderHook(() => useWorldBuilder());

      const interactionConfig = {
        name: 'Trade Goods',
        type: 'economic',
        requirements: { charisma: 12 },
        branches: [{ condition: 'success', text: 'Trade successful' }],
        effects: [{ type: 'resource', operation: 'add', value: 10 }],
        context: ['settlement']
      };

      act(() => {
        try {
          result.current.addInteraction(interactionConfig);
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.worldConfig.interactions).toHaveLength(0);
    });

    it('should add interaction from template successfully', () => {
      const { result } = renderHook(() => useWorldBuilder(mockTemplateManager));

      // Complete steps 1-2 first
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
        result.current.addNode({
          name: 'Test Village',
          type: 'settlement',
          description: 'A small village'
        });
      });

      // Mock template
      mockTemplateManager.getTemplate.mockReturnValue({
        id: 'template1',
        name: 'Trade Template',
        type: 'economic',
        requirements: { charisma: 12 },
        branches: [{ condition: 'success', text: 'Trade successful' }],
        effects: [{ type: 'resource', operation: 'add', value: 10 }],
        context: ['settlement']
      });

      act(() => {
        result.current.addInteractionFromTemplate('template1', { name: 'Custom Trade' });
      });

      expect(result.current.worldConfig.interactions).toHaveLength(1);
      expect(result.current.worldConfig.interactions[0].name).toBe('Custom Trade');
      expect(result.current.worldConfig.interactions[0].isTemplateInstance).toBe(true);
    });
  });

  describe('Step 4: Characters', () => {
    it('should add character successfully after step 3 is complete', () => {
      const { result } = renderHook(() => useWorldBuilder());

      // Complete steps 1-3 first
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
        result.current.addNode({
          name: 'Test Village',
          type: 'settlement',
          description: 'A small village'
        });
        result.current.addInteraction({
          name: 'Trade Goods',
          type: 'economic',
          requirements: { charisma: 12 },
          branches: [{ condition: 'success', text: 'Trade successful' }],
          effects: [{ type: 'resource', operation: 'add', value: 10 }],
          context: ['settlement']
        });
      });

      const interactionId = result.current.worldConfig.interactions[0].id;
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
        assignedInteractions: [interactionId],
        personality: { friendly: 0.8 },
        consciousness: { frequency: 40, coherence: 0.7 }
      };

      act(() => {
        result.current.addCharacter(characterConfig);
      });

      expect(result.current.worldConfig.characters).toHaveLength(1);
      expect(result.current.worldConfig.characters[0].name).toBe('Test Merchant');
      expect(result.current.worldConfig.characters[0].assignedInteractions).toContain(interactionId);
      expect(result.current.stepValidationStatus[4]).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should prevent adding characters with invalid interaction assignments', () => {
      const { result } = renderHook(() => useWorldBuilder());

      // Complete steps 1-3 first
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
        result.current.addNode({
          name: 'Test Village',
          type: 'settlement',
          description: 'A small village'
        });
        result.current.addInteraction({
          name: 'Trade Goods',
          type: 'economic',
          requirements: { charisma: 12 },
          branches: [{ condition: 'success', text: 'Trade successful' }],
          effects: [{ type: 'resource', operation: 'add', value: 10 }],
          context: ['settlement']
        });
      });

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
        assignedInteractions: ['nonexistent_interaction'],
        personality: { friendly: 0.8 }
      };

      act(() => {
        try {
          result.current.addCharacter(characterConfig);
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.worldConfig.characters).toHaveLength(0);
    });

    it('should add character from template successfully', () => {
      const { result } = renderHook(() => useWorldBuilder(mockTemplateManager));

      // Complete steps 1-3 first
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
        result.current.addNode({
          name: 'Test Village',
          type: 'settlement',
          description: 'A small village'
        });
        result.current.addInteraction({
          name: 'Trade Goods',
          type: 'economic',
          requirements: { charisma: 12 },
          branches: [{ condition: 'success', text: 'Trade successful' }],
          effects: [{ type: 'resource', operation: 'add', value: 10 }],
          context: ['settlement']
        });
      });

      const interactionId = result.current.worldConfig.interactions[0].id;

      // Mock template
      mockTemplateManager.getTemplate.mockReturnValue({
        id: 'template1',
        name: 'Merchant Template',
        attributes: {
          strength: 10,
          dexterity: 12,
          constitution: 11,
          intelligence: 14,
          wisdom: 13,
          charisma: 16
        },
        assignedInteractions: [interactionId],
        personality: { friendly: 0.8 },
        consciousness: { frequency: 40, coherence: 0.7 }
      });

      act(() => {
        result.current.addCharacterFromTemplate('template1', { name: 'Custom Merchant' });
      });

      expect(result.current.worldConfig.characters).toHaveLength(1);
      expect(result.current.worldConfig.characters[0].name).toBe('Custom Merchant');
      expect(result.current.worldConfig.characters[0].isTemplateInstance).toBe(true);
      expect(result.current.worldConfig.characters[0].assignedInteractions).toContain(interactionId);
    });
  });

  describe('Step 5: Node Population', () => {
    it('should assign character to node successfully', () => {
      const { result } = renderHook(() => useWorldBuilder());

      // Complete steps 1-4 first
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
        result.current.addNode({
          name: 'Test Village',
          type: 'settlement',
          description: 'A small village'
        });
        result.current.addInteraction({
          name: 'Trade Goods',
          type: 'economic',
          requirements: { charisma: 12 },
          branches: [{ condition: 'success', text: 'Trade successful' }],
          effects: [{ type: 'resource', operation: 'add', value: 10 }],
          context: ['settlement']
        });
      });

      const interactionId = result.current.worldConfig.interactions[0].id;
      
      act(() => {
        result.current.addCharacter({
          name: 'Test Merchant',
          attributes: {
            strength: 10,
            dexterity: 12,
            constitution: 11,
            intelligence: 14,
            wisdom: 13,
            charisma: 16
          },
          assignedInteractions: [interactionId]
        });
      });

      const nodeId = result.current.worldConfig.nodes[0].id;
      const characterId = result.current.worldConfig.characters[0].id;

      act(() => {
        result.current.assignCharacterToNode(characterId, nodeId);
      });

      expect(result.current.worldConfig.nodePopulations[nodeId]).toContain(characterId);
      expect(result.current.stepValidationStatus[5]).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should populate node with multiple characters', () => {
      const { result } = renderHook(() => useWorldBuilder());

      // Setup complete world
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
        result.current.addNode({
          name: 'Test Village',
          type: 'settlement',
          description: 'A small village'
        });
        result.current.addInteraction({
          name: 'Trade Goods',
          type: 'economic',
          requirements: { charisma: 12 },
          branches: [{ condition: 'success', text: 'Trade successful' }],
          effects: [{ type: 'resource', operation: 'add', value: 10 }],
          context: ['settlement']
        });
      });

      const interactionId = result.current.worldConfig.interactions[0].id;
      
      act(() => {
        result.current.addCharacter({
          name: 'Merchant 1',
          attributes: { strength: 10, dexterity: 12, constitution: 11, intelligence: 14, wisdom: 13, charisma: 16 },
          assignedInteractions: [interactionId]
        });
        result.current.addCharacter({
          name: 'Merchant 2',
          attributes: { strength: 10, dexterity: 12, constitution: 11, intelligence: 14, wisdom: 13, charisma: 16 },
          assignedInteractions: [interactionId]
        });
      });

      const nodeId = result.current.worldConfig.nodes[0].id;
      const characterIds = result.current.worldConfig.characters.map(c => c.id);

      act(() => {
        result.current.populateNode(nodeId, characterIds);
      });

      expect(result.current.worldConfig.nodePopulations[nodeId]).toHaveLength(2);
      expect(result.current.stepValidationStatus[5]).toBe(true);
    });
  });

  describe('Step Navigation', () => {
    it('should enforce step dependency validation', () => {
      const { result } = renderHook(() => useWorldBuilder());

      // Cannot proceed to step 2 without completing step 1
      expect(result.current.canProceedToStep(2)).toBe(false);

      // Complete step 1
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
      });

      // Now can proceed to step 2
      expect(result.current.canProceedToStep(2)).toBe(true);
      expect(result.current.canProceedToStep(3)).toBe(false);
    });

    it('should update current step requirements', () => {
      const { result } = renderHook(() => useWorldBuilder());

      expect(result.current.currentStepRequirements.title).toBe('Create World Properties');
      expect(result.current.currentStepRequirements.completed).toBe(false);

      // Complete step 1
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
        result.current.proceedToStep(2);
      });

      expect(result.current.currentStepRequirements.title).toBe('Create Nodes');
    });
  });

  describe('World Validation and Building', () => {
    it('should validate complete world successfully', () => {
      const { result } = renderHook(() => useWorldBuilder());

      // Build complete world
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
        result.current.addNode({
          name: 'Test Village',
          type: 'settlement',
          description: 'A small village'
        });
        result.current.addInteraction({
          name: 'Trade Goods',
          type: 'economic',
          requirements: { charisma: 12 },
          branches: [{ condition: 'success', text: 'Trade successful' }],
          effects: [{ type: 'resource', operation: 'add', value: 10 }],
          context: ['settlement']
        });
      });

      const interactionId = result.current.worldConfig.interactions[0].id;
      
      act(() => {
        result.current.addCharacter({
          name: 'Test Merchant',
          attributes: { strength: 10, dexterity: 12, constitution: 11, intelligence: 14, wisdom: 13, charisma: 16 },
          assignedInteractions: [interactionId]
        });
      });

      const nodeId = result.current.worldConfig.nodes[0].id;
      const characterId = result.current.worldConfig.characters[0].id;

      act(() => {
        result.current.assignCharacterToNode(characterId, nodeId);
      });

      let validationResult;
      act(() => {
        validationResult = result.current.validateWorld();
      });

      expect(validationResult.isValid).toBe(true);
      expect(result.current.isWorldComplete).toBe(true);
    });

    it('should build world successfully when all steps are complete', () => {
      const { result } = renderHook(() => useWorldBuilder());

      // Build complete world (same as above)
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
        result.current.addNode({
          name: 'Test Village',
          type: 'settlement',
          description: 'A small village'
        });
        result.current.addInteraction({
          name: 'Trade Goods',
          type: 'economic',
          requirements: { charisma: 12 },
          branches: [{ condition: 'success', text: 'Trade successful' }],
          effects: [{ type: 'resource', operation: 'add', value: 10 }],
          context: ['settlement']
        });
      });

      const interactionId = result.current.worldConfig.interactions[0].id;
      
      act(() => {
        result.current.addCharacter({
          name: 'Test Merchant',
          attributes: { strength: 10, dexterity: 12, constitution: 11, intelligence: 14, wisdom: 13, charisma: 16 },
          assignedInteractions: [interactionId]
        });
      });

      const nodeId = result.current.worldConfig.nodes[0].id;
      const characterId = result.current.worldConfig.characters[0].id;

      act(() => {
        result.current.assignCharacterToNode(characterId, nodeId);
      });

      let worldState;
      act(() => {
        worldState = result.current.buildWorld();
      });

      expect(worldState.isComplete).toBe(true);
      expect(worldState.isValid).toBe(true);
      expect(worldState.builtAt).toBeDefined();
    });

    it('should reset builder successfully', () => {
      const { result } = renderHook(() => useWorldBuilder());

      // Add some data
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
      });

      expect(result.current.worldConfig.name).toBe('Test World');

      // Reset
      act(() => {
        result.current.resetBuilder();
      });

      expect(result.current.worldConfig.name).toBeNull();
      expect(result.current.currentStep).toBe(1);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Template Operations', () => {
    it('should save world as template', () => {
      const { result } = renderHook(() => useWorldBuilder(mockTemplateManager));

      // Setup some world data
      act(() => {
        result.current.setWorldProperties('Test World', 'A test world');
        result.current.setRules({ timeProgression: 'realtime' });
        result.current.setInitialConditions({ startingResources: 100 });
      });

      mockTemplateManager.addTemplate.mockReturnValue({ id: 'new_template' });

      act(() => {
        result.current.saveAsTemplate('world', 'My Template', 'A custom template');
      });

      expect(mockTemplateManager.addTemplate).toHaveBeenCalledWith('worlds', expect.objectContaining({
        name: 'My Template',
        description: 'A custom template',
        type: 'world'
      }));
    });

    it('should load world from template', () => {
      const { result } = renderHook(() => useWorldBuilder(mockTemplateManager));

      const mockTemplate = {
        id: 'template1',
        worldConfig: {
          name: 'Template World',
          description: 'From template',
          rules: { timeProgression: 'realtime' },
          initialConditions: { startingResources: 100 },
          nodes: [],
          interactions: [],
          characters: [],
          nodePopulations: {},
          stepValidation: { 1: true, 2: false, 3: false, 4: false, 5: false, 6: false }
        }
      };

      mockTemplateManager.getTemplate.mockReturnValue(mockTemplate);

      act(() => {
        result.current.loadFromTemplate('template1');
      });

      expect(result.current.worldConfig.name).toBe('Template World');
      expect(result.current.worldConfig.templateId).toBe('template1');
      expect(result.current.worldConfig.isTemplateInstance).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle template loading errors gracefully', async () => {
      mockTemplateManager.getAllTemplates.mockImplementation(() => {
        throw new Error('Template loading failed');
      });

      const { result } = renderHook(() => useWorldBuilder(mockTemplateManager));

      // Wait for error to be set
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.error).toContain('Failed to load templates');
    });

    it('should clear errors when operations succeed', () => {
      const { result } = renderHook(() => useWorldBuilder());

      // Cause an error
      act(() => {
        try {
          result.current.setWorldProperties('', 'Description');
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).toBeTruthy();

      // Fix the error
      act(() => {
        result.current.setWorldProperties('Valid Name', 'Description');
      });

      expect(result.current.error).toBeNull();
    });
  });
});