// src/application/services/__tests__/CharacterService.test.js

import CharacterService from '../CharacterService.js';
import { ValidationError } from '../../../shared/types/ValueObjectTypes.js';

describe('CharacterService Unit Tests', () => {
  let characterService;
  let mockWorldBuilder;
  let mockAssignmentManager;

  beforeEach(() => {
    // Create mock WorldBuilder
    mockWorldBuilder = {
      addCharacter: jest.fn(),
      updateCharacter: jest.fn(),
      deleteCharacter: jest.fn(),
      getCharacter: jest.fn(),
      getAllCharacters: jest.fn(),
      searchCharacters: jest.fn(),
      validateCharacter: jest.fn(),
      getCharacterStatistics: jest.fn(),
      worldConfig: {
        nodes: [
          { id: 'node-1', name: 'Test Node 1' },
          { id: 'node-2', name: 'Test Node 2' }
        ],
        interactions: [
          { id: 'interaction-1', name: 'Test Interaction 1' },
          { id: 'interaction-2', name: 'Test Interaction 2' }
        ]
      }
    };

    // Create mock AssignmentManager
    mockAssignmentManager = {
      registerCharacter: jest.fn(),
      registerNode: jest.fn(),
      registerInteraction: jest.fn(),
      assignCharacterToNode: jest.fn(),
      unassignCharacterFromNode: jest.fn(),
      assignCharacterToInteraction: jest.fn(),
      unassignCharacterFromInteraction: jest.fn(),
      updateCharacterAssignments: jest.fn(),
      cleanupDeletedCharacter: jest.fn(),
      getCharacterAssignmentDetails: jest.fn(),
      getCharactersByNode: jest.fn(),
      getCharactersByInteraction: jest.fn(),
      getStatistics: jest.fn()
    };

    characterService = new CharacterService(mockWorldBuilder, mockAssignmentManager);
  });

  describe('Constructor', () => {
    test('should create CharacterService with valid dependencies', () => {
      expect(characterService).toBeInstanceOf(CharacterService);
      expect(characterService.worldBuilder).toBe(mockWorldBuilder);
      expect(characterService.assignmentManager).toBe(mockAssignmentManager);
    });

    test('should throw error if WorldBuilder is missing', () => {
      expect(() => new CharacterService(null, mockAssignmentManager))
        .toThrow('WorldBuilder is required');
    });

    test('should throw error if AssignmentManager is missing', () => {
      expect(() => new CharacterService(mockWorldBuilder, null))
        .toThrow('AssignmentManager is required');
    });
  });

  describe('createCharacter', () => {
    beforeEach(() => {
      mockWorldBuilder.addCharacter.mockReturnValue({ id: 'char-1' });
      mockWorldBuilder.getAllCharacters.mockReturnValue([{ id: 'char-1' }]);
      mockWorldBuilder.getCharacter.mockReturnValue({
        id: 'char-1',
        name: 'Test Character',
        age: 25
      });
      mockAssignmentManager.assignCharacterToNode.mockReturnValue(true);
      mockAssignmentManager.assignCharacterToInteraction.mockReturnValue(true);
    });

    test('should create character with basic configuration', async () => {
      const characterConfig = {
        name: 'Test Character',
        age: 25
      };

      const result = await characterService.createCharacter(characterConfig);

      expect(result.success).toBe(true);
      expect(result.character).toBeDefined();
      expect(mockWorldBuilder.addCharacter).toHaveBeenCalledWith(characterConfig);
      expect(mockAssignmentManager.registerCharacter).toHaveBeenCalledWith('char-1');
    });

    test('should create character with node assignments', async () => {
      const characterConfig = {
        name: 'Test Character',
        assignedNodes: ['node-1']
      };

      const result = await characterService.createCharacter(characterConfig);

      expect(result.success).toBe(true);
      expect(mockAssignmentManager.registerNode).toHaveBeenCalledWith('node-1');
      expect(mockAssignmentManager.assignCharacterToNode).toHaveBeenCalledWith('char-1', 'node-1');
    });

    test('should create character with interaction assignments', async () => {
      const characterConfig = {
        name: 'Test Character',
        assignedInteractions: ['interaction-1', 'interaction-2']
      };

      const result = await characterService.createCharacter(characterConfig);

      expect(result.success).toBe(true);
      expect(mockAssignmentManager.registerInteraction).toHaveBeenCalledWith('interaction-1');
      expect(mockAssignmentManager.registerInteraction).toHaveBeenCalledWith('interaction-2');
      expect(mockAssignmentManager.assignCharacterToInteraction).toHaveBeenCalledWith('char-1', 'interaction-1');
      expect(mockAssignmentManager.assignCharacterToInteraction).toHaveBeenCalledWith('char-1', 'interaction-2');
    });

    test('should handle invalid character configuration', async () => {
      await expect(characterService.createCharacter(null))
        .rejects.toThrow(ValidationError);

      await expect(characterService.createCharacter('invalid'))
        .rejects.toThrow(ValidationError);
    });

    test('should handle WorldBuilder errors', async () => {
      mockWorldBuilder.addCharacter.mockImplementation(() => {
        throw new Error('WorldBuilder error');
      });

      await expect(characterService.createCharacter({ name: 'Test' }))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('createCharacters', () => {
    beforeEach(() => {
      mockWorldBuilder.addCharacter.mockImplementation((config) => ({ id: `char-${config.name}` }));
      mockWorldBuilder.getCharacter.mockImplementation((id) => ({
        id,
        name: id.replace('char-', ''),
        age: 25
      }));
    });

    test('should create multiple characters successfully', async () => {
      const charactersConfig = [
        { name: 'Character1' },
        { name: 'Character2' }
      ];

      const result = await characterService.createCharacters(charactersConfig);

      expect(result.totalAttempted).toBe(2);
      expect(result.successes).toHaveLength(2);
      expect(result.failures).toHaveLength(0);
    });

    test('should handle mixed success and failure', async () => {
      mockWorldBuilder.addCharacter.mockImplementation((config) => {
        if (config.name === 'FailCharacter') {
          throw new Error('Creation failed');
        }
        return { id: `char-${config.name}` };
      });

      const charactersConfig = [
        { name: 'SuccessCharacter' },
        { name: 'FailCharacter' }
      ];

      const result = await characterService.createCharacters(charactersConfig);

      expect(result.totalAttempted).toBe(2);
      expect(result.successes).toHaveLength(1);
      expect(result.failures).toHaveLength(1);
    });

    test('should handle invalid input', async () => {
      await expect(characterService.createCharacters('invalid'))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('updateCharacter', () => {
    beforeEach(() => {
      mockWorldBuilder.getCharacter.mockReturnValue({
        id: 'char-1',
        name: 'Test Character',
        age: 25
      });
      mockWorldBuilder.updateCharacter.mockReturnValue(true);
      mockAssignmentManager.updateCharacterAssignments.mockReturnValue(true);
      mockAssignmentManager.assignCharacterToNode.mockReturnValue(true);
    });

    test('should update character basic properties', async () => {
      const updates = {
        name: 'Updated Character',
        age: 30
      };

      const result = await characterService.updateCharacter('char-1', updates);

      expect(result.success).toBe(true);
      expect(mockWorldBuilder.updateCharacter).toHaveBeenCalledWith('char-1', updates);
    });

    test('should update character with node assignments', async () => {
      const updates = {
        name: 'Updated Character',
        assignedNodes: ['node-1']
      };

      const result = await characterService.updateCharacter('char-1', updates);

      expect(result.success).toBe(true);
      expect(result.assignmentChanges.nodes).toEqual(['node-1']);
      expect(mockWorldBuilder.updateCharacter).toHaveBeenCalledWith('char-1', { name: 'Updated Character' });
    });

    test('should update character with interaction assignments', async () => {
      const updates = {
        assignedInteractions: ['interaction-1']
      };

      const result = await characterService.updateCharacter('char-1', updates);

      expect(result.success).toBe(true);
      expect(result.assignmentChanges.interactions).toEqual(['interaction-1']);
    });

    test('should handle non-existent character', async () => {
      mockWorldBuilder.getCharacter.mockReturnValue(null);

      await expect(characterService.updateCharacter('non-existent', { name: 'Test' }))
        .rejects.toThrow(ValidationError);
    });

    test('should handle invalid inputs', async () => {
      await expect(characterService.updateCharacter(null, { name: 'Test' }))
        .rejects.toThrow(ValidationError);

      await expect(characterService.updateCharacter('char-1', null))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('deleteCharacter', () => {
    beforeEach(() => {
      mockWorldBuilder.getCharacter.mockReturnValue({
        id: 'char-1',
        name: 'Test Character',
        age: 25
      });
      mockAssignmentManager.getCharacterAssignmentDetails.mockReturnValue({
        nodeAssignment: { nodeId: 'node-1' },
        interactionAssignments: { interactionIds: ['interaction-1'] },
        summary: { totalAssignments: 2 }
      });
    });

    test('should delete character and clean up assignments', async () => {
      const result = await characterService.deleteCharacter('char-1');

      expect(result.success).toBe(true);
      expect(result.deletedCharacterId).toBe('char-1');
      expect(result.deletedCharacterName).toBe('Test Character');
      expect(mockAssignmentManager.cleanupDeletedCharacter).toHaveBeenCalledWith('char-1');
      expect(mockWorldBuilder.deleteCharacter).toHaveBeenCalledWith('char-1');
    });

    test('should handle non-existent character', async () => {
      mockWorldBuilder.getCharacter.mockReturnValue(null);

      await expect(characterService.deleteCharacter('non-existent'))
        .rejects.toThrow(ValidationError);
    });

    test('should handle invalid character ID', async () => {
      await expect(characterService.deleteCharacter(null))
        .rejects.toThrow(ValidationError);

      await expect(characterService.deleteCharacter(''))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('getCharacter', () => {
    test('should get character with assignment details', () => {
      mockWorldBuilder.getCharacter.mockReturnValue({
        id: 'char-1',
        name: 'Test Character'
      });
      mockAssignmentManager.getCharacterAssignmentDetails.mockReturnValue({
        nodeAssignment: { nodeId: 'node-1', hasAssignment: true },
        interactionAssignments: { interactionIds: ['interaction-1'], count: 1 }
      });

      const result = characterService.getCharacter('char-1');

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Character');
      expect(result.currentAssignments).toBeDefined();
      expect(result.currentAssignments.nodeId).toBe('node-1');
      expect(result.currentAssignments.interactionIds).toEqual(['interaction-1']);
    });

    test('should return null for non-existent character', () => {
      mockWorldBuilder.getCharacter.mockReturnValue(null);

      const result = characterService.getCharacter('non-existent');

      expect(result).toBeNull();
    });

    test('should handle invalid character ID', () => {
      const result = characterService.getCharacter(null);
      expect(result).toBeNull();

      const result2 = characterService.getCharacter('');
      expect(result2).toBeNull();
    });
  });

  describe('searchCharacters', () => {
    beforeEach(() => {
      mockWorldBuilder.searchCharacters.mockReturnValue([
        { id: 'char-1', name: 'Character 1' },
        { id: 'char-2', name: 'Character 2' }
      ]);
      mockAssignmentManager.getCharacterAssignmentDetails.mockImplementation((id) => ({
        nodeAssignment: { nodeId: id === 'char-1' ? 'node-1' : null, hasAssignment: id === 'char-1' },
        interactionAssignments: { interactionIds: [], count: 0 }
      }));
    });

    test('should search characters with basic criteria', () => {
      const results = characterService.searchCharacters({ name: 'Character' });

      expect(results).toHaveLength(2);
      expect(mockWorldBuilder.searchCharacters).toHaveBeenCalledWith({ name: 'Character' });
    });

    test('should filter by node assignment status', () => {
      const results = characterService.searchCharacters({ hasNodeAssignment: true });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('char-1');
    });

    test('should filter by specific node assignment', () => {
      const results = characterService.searchCharacters({ assignedToSpecificNode: 'node-1' });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('char-1');
    });
  });

  describe('getCharactersByNode', () => {
    test('should get characters by node', () => {
      mockAssignmentManager.getCharactersByNode.mockReturnValue(['char-1', 'char-2']);
      mockWorldBuilder.getCharacter.mockImplementation((id) => ({
        id,
        name: `Character ${id}`
      }));
      mockAssignmentManager.getCharacterAssignmentDetails.mockReturnValue({
        nodeAssignment: { nodeId: 'node-1', hasAssignment: true },
        interactionAssignments: { interactionIds: [], count: 0 }
      });

      const results = characterService.getCharactersByNode('node-1');

      expect(results).toHaveLength(2);
      expect(mockAssignmentManager.getCharactersByNode).toHaveBeenCalledWith('node-1');
    });

    test('should handle invalid node ID', () => {
      const results = characterService.getCharactersByNode(null);
      expect(results).toEqual([]);

      const results2 = characterService.getCharactersByNode('');
      expect(results2).toEqual([]);
    });
  });

  describe('updateCharacterNodeAssignment', () => {
    test('should assign character to node', async () => {
      mockAssignmentManager.assignCharacterToNode.mockReturnValue(true);

      const result = await characterService.updateCharacterNodeAssignment('char-1', 'node-1');

      expect(result).toBe(true);
      expect(mockAssignmentManager.registerNode).toHaveBeenCalledWith('node-1');
      expect(mockAssignmentManager.assignCharacterToNode).toHaveBeenCalledWith('char-1', 'node-1');
    });

    test('should unassign character from node', async () => {
      mockAssignmentManager.unassignCharacterFromNode.mockReturnValue(true);

      const result = await characterService.updateCharacterNodeAssignment('char-1', null);

      expect(result).toBe(true);
      expect(mockAssignmentManager.unassignCharacterFromNode).toHaveBeenCalledWith('char-1');
    });

    test('should handle non-existent node', async () => {
      mockWorldBuilder.worldConfig.nodes = [];

      await expect(characterService.updateCharacterNodeAssignment('char-1', 'non-existent'))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('updateCharacterInteractionAssignments', () => {
    test('should update interaction assignments', async () => {
      mockAssignmentManager.updateCharacterAssignments.mockReturnValue(true);

      const result = await characterService.updateCharacterInteractionAssignments(
        'char-1', 
        ['interaction-1', 'interaction-2']
      );

      expect(result).toBe(true);
      expect(mockAssignmentManager.registerInteraction).toHaveBeenCalledWith('interaction-1');
      expect(mockAssignmentManager.registerInteraction).toHaveBeenCalledWith('interaction-2');
      expect(mockAssignmentManager.updateCharacterAssignments).toHaveBeenCalledWith('char-1', {
        interactionIds: ['interaction-1', 'interaction-2']
      });
    });

    test('should handle invalid interaction IDs', async () => {
      await expect(characterService.updateCharacterInteractionAssignments('char-1', 'invalid'))
        .rejects.toThrow(ValidationError);
    });

    test('should handle non-existent interaction', async () => {
      mockWorldBuilder.worldConfig.interactions = [];

      await expect(characterService.updateCharacterInteractionAssignments('char-1', ['non-existent']))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('validateCharacter', () => {
    test('should validate character successfully', () => {
      mockWorldBuilder.validateCharacter.mockReturnValue({
        success: true,
        errors: [],
        warnings: []
      });

      const characterData = {
        name: 'Test Character',
        assignedNodes: ['node-1'],
        assignedInteractions: ['interaction-1']
      };

      const result = characterService.validateCharacter(characterData);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect invalid assignments', () => {
      mockWorldBuilder.validateCharacter.mockReturnValue({
        success: true,
        errors: [],
        warnings: []
      });

      const characterData = {
        name: 'Test Character',
        assignedNodes: ['non-existent-node']
      };

      const result = characterService.validateCharacter(characterData);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'assignedNodes')).toBe(true);
    });

    test('should handle validation errors', () => {
      mockWorldBuilder.validateCharacter.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const result = characterService.validateCharacter({});

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('getCharacterStatistics', () => {
    test('should get enhanced statistics', () => {
      mockWorldBuilder.getCharacterStatistics.mockReturnValue({
        total: 5,
        byType: { generic: 3, detailed: 2 }
      });
      mockAssignmentManager.getStatistics.mockReturnValue({
        charactersWithNodes: 3,
        charactersWithInteractions: 4,
        averageInteractionsPerCharacter: 2.5
      });

      const stats = characterService.getCharacterStatistics();

      expect(stats.total).toBe(5);
      expect(stats.assignments).toBeDefined();
      expect(stats.assignments.charactersWithNodes).toBe(3);
      expect(stats.assignments.charactersWithInteractions).toBe(4);
      expect(stats.assignments.unassignedCharacters).toBe(2); // 5 total - 3 with nodes
    });
  });
});