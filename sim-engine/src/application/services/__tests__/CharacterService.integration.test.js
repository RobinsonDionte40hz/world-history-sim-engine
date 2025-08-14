// src/application/services/__tests__/CharacterService.integration.test.js

import CharacterService from '../CharacterService.js';
import WorldBuilder from '../../../domain/services/WorldBuilder.js';
import { AssignmentManager } from '../../../domain/services/AssignmentManager.js';
import { ValidationError } from '../../../shared/types/ValueObjectTypes.js';

describe('CharacterService Integration Tests', () => {
  let characterService;
  let worldBuilder;
  let assignmentManager;

  beforeEach(() => {
    // Create fresh instances for each test
    worldBuilder = new WorldBuilder();
    assignmentManager = new AssignmentManager();
    characterService = new CharacterService(worldBuilder, assignmentManager);

    // Set up a basic world for testing
    worldBuilder
      .setWorldProperties('Test World', 'A world for testing character service')
      .setRules({ timeProgression: 'manual' })
      .setInitialConditions({ startingYear: 1000 });

    // Add test nodes
    worldBuilder
      .addNode({
        id: 'test-node-1',
        name: 'Test Village',
        type: 'settlement',
        description: 'A test village'
      })
      .addNode({
        id: 'test-node-2',
        name: 'Test Forest',
        type: 'wilderness',
        description: 'A test forest'
      });

    // Add test interactions
    worldBuilder
      .addInteraction({
        id: 'test-interaction-1',
        name: 'Trade',
        type: 'economic',
        requirements: { attributes: { charisma: 10 } },
        branches: [{ id: 'success', condition: {}, text: 'Trade successful' }],
        effects: [{ type: 'resource', target: 'self', operation: 'add', value: 10 }],
        context: { location: 'settlement' }
      })
      .addInteraction({
        id: 'test-interaction-2',
        name: 'Explore',
        type: 'exploration',
        requirements: { attributes: { wisdom: 8 } },
        branches: [{ id: 'success', condition: {}, text: 'Exploration successful' }],
        effects: [{ type: 'attribute', target: 'self', operation: 'add', value: 1 }],
        context: { location: 'wilderness' }
      });

    // Register entities with AssignmentManager
    assignmentManager.registerNode('test-node-1');
    assignmentManager.registerNode('test-node-2');
    assignmentManager.registerInteraction('test-interaction-1');
    assignmentManager.registerInteraction('test-interaction-2');
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  describe('Character Creation', () => {
    test('should create character with basic configuration', async () => {
      const characterConfig = {
        name: 'Test Character',
        age: 25,
        level: 1
      };

      const result = await characterService.createCharacter(characterConfig);

      expect(result.success).toBe(true);
      expect(result.character).toBeDefined();
      expect(result.character.name).toBe('Test Character');
      expect(result.character.age).toBe(25);
      expect(result.assignments).toEqual({
        nodes: [],
        interactions: []
      });
    });

    test('should create character with node assignments', async () => {
      const characterConfig = {
        name: 'Village Merchant',
        age: 30,
        assignedNodes: ['test-node-1']
      };

      const result = await characterService.createCharacter(characterConfig);

      expect(result.success).toBe(true);
      expect(result.assignments.nodes).toEqual(['test-node-1']);

      // Verify assignment in AssignmentManager
      const nodeCharacters = assignmentManager.getCharactersByNode('test-node-1');
      expect(nodeCharacters).toContain(result.character.id);
    });

    test('should create character with interaction assignments', async () => {
      const characterConfig = {
        name: 'Forest Explorer',
        age: 28,
        assignedInteractions: ['test-interaction-1', 'test-interaction-2']
      };

      const result = await characterService.createCharacter(characterConfig);

      expect(result.success).toBe(true);
      expect(result.assignments.interactions).toEqual(['test-interaction-1', 'test-interaction-2']);

      // Verify assignments in AssignmentManager
      const characterInteractions = assignmentManager.getInteractionsByCharacter(result.character.id);
      expect(characterInteractions).toContain('test-interaction-1');
      expect(characterInteractions).toContain('test-interaction-2');
    });

    test('should create character with both node and interaction assignments', async () => {
      const characterConfig = {
        name: 'Complete Character',
        age: 35,
        assignedNodes: ['test-node-1'],
        assignedInteractions: ['test-interaction-1']
      };

      const result = await characterService.createCharacter(characterConfig);

      expect(result.success).toBe(true);
      expect(result.assignments.nodes).toEqual(['test-node-1']);
      expect(result.assignments.interactions).toEqual(['test-interaction-1']);

      // Verify both assignments
      const nodeCharacters = assignmentManager.getCharactersByNode('test-node-1');
      expect(nodeCharacters).toContain(result.character.id);

      const characterInteractions = assignmentManager.getInteractionsByCharacter(result.character.id);
      expect(characterInteractions).toContain('test-interaction-1');
    });

    test('should handle invalid character configuration', async () => {
      await expect(characterService.createCharacter(null))
        .rejects.toThrow(ValidationError);

      await expect(characterService.createCharacter('invalid'))
        .rejects.toThrow(ValidationError);
    });

    test('should handle non-existent node assignment', async () => {
      const characterConfig = {
        name: 'Invalid Assignment',
        assignedNodes: ['non-existent-node']
      };

      await expect(characterService.createCharacter(characterConfig))
        .rejects.toThrow();
    });

    test('should handle non-existent interaction assignment', async () => {
      const characterConfig = {
        name: 'Invalid Assignment',
        assignedInteractions: ['non-existent-interaction']
      };

      await expect(characterService.createCharacter(characterConfig))
        .rejects.toThrow();
    });
  });

  describe('Bulk Character Creation', () => {
    test('should create multiple characters successfully', async () => {
      const charactersConfig = [
        { name: 'Character 1', age: 25 },
        { name: 'Character 2', age: 30, assignedNodes: ['test-node-1'] },
        { name: 'Character 3', age: 35, assignedInteractions: ['test-interaction-1'] }
      ];

      const result = await characterService.createCharacters(charactersConfig);

      expect(result.totalAttempted).toBe(3);
      expect(result.successes).toHaveLength(3);
      expect(result.failures).toHaveLength(0);

      // Verify all characters were created
      const allCharacters = characterService.getAllCharacters();
      expect(allCharacters).toHaveLength(3);
    });

    test('should handle mixed success and failure in bulk creation', async () => {
      const charactersConfig = [
        { name: 'Valid Character', age: 25 },
        { name: 'Invalid Assignment', assignedNodes: ['non-existent-node'] },
        { name: 'Another Valid Character', age: 30 }
      ];

      const result = await characterService.createCharacters(charactersConfig);

      expect(result.totalAttempted).toBe(3);
      expect(result.successes).toHaveLength(2);
      expect(result.failures).toHaveLength(1);
      expect(result.failures[0].index).toBe(1);
    });
  });

  describe('Character Updates', () => {
    let testCharacterId;

    beforeEach(async () => {
      const result = await characterService.createCharacter({
        name: 'Test Character',
        age: 25,
        assignedNodes: ['test-node-1'],
        assignedInteractions: ['test-interaction-1']
      });
      testCharacterId = result.character.id;
    });

    test('should update character basic properties', async () => {
      const updates = {
        name: 'Updated Character',
        age: 30
      };

      const result = await characterService.updateCharacter(testCharacterId, updates);

      expect(result.success).toBe(true);
      expect(result.character.name).toBe('Updated Character');
      expect(result.character.age).toBe(30);
    });

    test('should update character node assignments', async () => {
      const updates = {
        assignedNodes: ['test-node-2']
      };

      const result = await characterService.updateCharacter(testCharacterId, updates);

      expect(result.success).toBe(true);
      expect(result.assignmentChanges.nodes).toEqual(['test-node-2']);

      // Verify assignment change
      const nodeCharacters1 = assignmentManager.getCharactersByNode('test-node-1');
      const nodeCharacters2 = assignmentManager.getCharactersByNode('test-node-2');
      
      expect(nodeCharacters1).not.toContain(testCharacterId);
      expect(nodeCharacters2).toContain(testCharacterId);
    });

    test('should update character interaction assignments', async () => {
      const updates = {
        assignedInteractions: ['test-interaction-2']
      };

      const result = await characterService.updateCharacter(testCharacterId, updates);

      expect(result.success).toBe(true);
      expect(result.assignmentChanges.interactions).toEqual(['test-interaction-2']);

      // Verify assignment change
      const characterInteractions = assignmentManager.getInteractionsByCharacter(testCharacterId);
      expect(characterInteractions).toEqual(['test-interaction-2']);
    });

    test('should clear node assignments when set to empty array', async () => {
      const updates = {
        assignedNodes: []
      };

      const result = await characterService.updateCharacter(testCharacterId, updates);

      expect(result.success).toBe(true);
      expect(result.assignmentChanges.nodes).toEqual([]);

      // Verify assignment cleared
      const characterNode = assignmentManager.getNodeByCharacter(testCharacterId);
      expect(characterNode).toBeNull();
    });

    test('should handle invalid character ID', async () => {
      await expect(characterService.updateCharacter('non-existent', { name: 'Test' }))
        .rejects.toThrow(ValidationError);
    });

    test('should handle invalid updates object', async () => {
      await expect(characterService.updateCharacter(testCharacterId, null))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('Character Deletion', () => {
    let testCharacterId;

    beforeEach(async () => {
      const result = await characterService.createCharacter({
        name: 'Test Character',
        age: 25,
        assignedNodes: ['test-node-1'],
        assignedInteractions: ['test-interaction-1', 'test-interaction-2']
      });
      testCharacterId = result.character.id;
    });

    test('should delete character and clean up assignments', async () => {
      const result = await characterService.deleteCharacter(testCharacterId);

      expect(result.success).toBe(true);
      expect(result.deletedCharacterId).toBe(testCharacterId);
      expect(result.deletedCharacterName).toBe('Test Character');
      expect(result.cleanedUpAssignments.nodes).toEqual(['test-node-1']);
      expect(result.cleanedUpAssignments.interactions).toEqual(['test-interaction-1', 'test-interaction-2']);
      expect(result.cleanedUpAssignments.totalCleaned).toBe(3);

      // Verify character is deleted from WorldBuilder
      const character = characterService.getCharacter(testCharacterId);
      expect(character).toBeNull();

      // Verify assignments are cleaned up
      const nodeCharacters = assignmentManager.getCharactersByNode('test-node-1');
      expect(nodeCharacters).not.toContain(testCharacterId);

      const characterInteractions = assignmentManager.getInteractionsByCharacter(testCharacterId);
      expect(characterInteractions).toEqual([]);
    });

    test('should handle non-existent character deletion', async () => {
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

  describe('Bulk Character Deletion', () => {
    let characterIds;

    beforeEach(async () => {
      const charactersConfig = [
        { name: 'Character 1', assignedNodes: ['test-node-1'] },
        { name: 'Character 2', assignedInteractions: ['test-interaction-1'] },
        { name: 'Character 3', assignedNodes: ['test-node-2'], assignedInteractions: ['test-interaction-2'] }
      ];

      const results = await characterService.createCharacters(charactersConfig);
      characterIds = results.successes.map(s => s.characterId);
    });

    test('should delete multiple characters successfully', async () => {
      const result = await characterService.deleteCharacters(characterIds);

      expect(result.totalAttempted).toBe(3);
      expect(result.successes).toHaveLength(3);
      expect(result.failures).toHaveLength(0);

      // Verify all characters are deleted
      characterIds.forEach(id => {
        const character = characterService.getCharacter(id);
        expect(character).toBeNull();
      });

      // Verify all assignments are cleaned up
      const nodeCharacters1 = assignmentManager.getCharactersByNode('test-node-1');
      const nodeCharacters2 = assignmentManager.getCharactersByNode('test-node-2');
      expect(nodeCharacters1).toHaveLength(0);
      expect(nodeCharacters2).toHaveLength(0);
    });

    test('should handle mixed success and failure in bulk deletion', async () => {
      const idsToDelete = [...characterIds, 'non-existent-id'];

      const result = await characterService.deleteCharacters(idsToDelete);

      expect(result.totalAttempted).toBe(4);
      expect(result.successes).toHaveLength(3);
      expect(result.failures).toHaveLength(1);
      expect(result.failures[0].characterId).toBe('non-existent-id');
    });
  });

  describe('Character Retrieval', () => {
    let testCharacterId;

    beforeEach(async () => {
      const result = await characterService.createCharacter({
        name: 'Test Character',
        age: 25,
        assignedNodes: ['test-node-1'],
        assignedInteractions: ['test-interaction-1']
      });
      testCharacterId = result.character.id;
    });

    test('should get character with assignment details', () => {
      const character = characterService.getCharacter(testCharacterId);

      expect(character).toBeDefined();
      expect(character.name).toBe('Test Character');
      expect(character.currentAssignments).toBeDefined();
      expect(character.currentAssignments.nodeId).toBe('test-node-1');
      expect(character.currentAssignments.interactionIds).toEqual(['test-interaction-1']);
      expect(character.currentAssignments.hasNodeAssignment).toBe(true);
      expect(character.currentAssignments.hasInteractionAssignments).toBe(true);
    });

    test('should return null for non-existent character', () => {
      const character = characterService.getCharacter('non-existent');
      expect(character).toBeNull();
    });

    test('should get all characters with assignment details', () => {
      const characters = characterService.getAllCharacters();

      expect(characters).toHaveLength(1);
      expect(characters[0].name).toBe('Test Character');
      expect(characters[0].currentAssignments).toBeDefined();
    });
  });

  describe('Character Search', () => {
    beforeEach(async () => {
      // Create test characters with various assignments
      await characterService.createCharacter({
        name: 'Village Merchant',
        age: 30,
        assignedNodes: ['test-node-1'],
        assignedInteractions: ['test-interaction-1']
      });

      await characterService.createCharacter({
        name: 'Forest Explorer',
        age: 25,
        assignedNodes: ['test-node-2'],
        assignedInteractions: ['test-interaction-2']
      });

      await characterService.createCharacter({
        name: 'Unassigned Character',
        age: 35
      });
    });

    test('should search characters by name', () => {
      const results = characterService.searchCharacters({ name: 'Merchant' });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Village Merchant');
    });

    test('should search characters by node assignment', () => {
      const results = characterService.searchCharacters({ 
        assignedToSpecificNode: 'test-node-1' 
      });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Village Merchant');
    });

    test('should search characters by interaction assignment', () => {
      const results = characterService.searchCharacters({ 
        hasSpecificInteraction: 'test-interaction-2' 
      });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Forest Explorer');
    });

    test('should search characters with node assignments', () => {
      const results = characterService.searchCharacters({ 
        hasNodeAssignment: true 
      });

      expect(results).toHaveLength(2);
      expect(results.map(c => c.name)).toContain('Village Merchant');
      expect(results.map(c => c.name)).toContain('Forest Explorer');
    });

    test('should search characters without node assignments', () => {
      const results = characterService.searchCharacters({ 
        hasNodeAssignment: false 
      });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Unassigned Character');
    });

    test('should search characters with interaction assignments', () => {
      const results = characterService.searchCharacters({ 
        hasInteractionAssignments: true 
      });

      expect(results).toHaveLength(2);
      expect(results.map(c => c.name)).toContain('Village Merchant');
      expect(results.map(c => c.name)).toContain('Forest Explorer');
    });

    test('should search characters without interaction assignments', () => {
      const results = characterService.searchCharacters({ 
        hasInteractionAssignments: false 
      });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Unassigned Character');
    });
  });

  describe('Characters by Node/Interaction', () => {
    beforeEach(async () => {
      await characterService.createCharacter({
        name: 'Character 1',
        assignedNodes: ['test-node-1'],
        assignedInteractions: ['test-interaction-1']
      });

      await characterService.createCharacter({
        name: 'Character 2',
        assignedNodes: ['test-node-1'],
        assignedInteractions: ['test-interaction-2']
      });

      await characterService.createCharacter({
        name: 'Character 3',
        assignedNodes: ['test-node-2'],
        assignedInteractions: ['test-interaction-1']
      });
    });

    test('should get characters by node', () => {
      const characters = characterService.getCharactersByNode('test-node-1');

      expect(characters).toHaveLength(2);
      expect(characters.map(c => c.name)).toContain('Character 1');
      expect(characters.map(c => c.name)).toContain('Character 2');
    });

    test('should get characters by interaction', () => {
      const characters = characterService.getCharactersByInteraction('test-interaction-1');

      expect(characters).toHaveLength(2);
      expect(characters.map(c => c.name)).toContain('Character 1');
      expect(characters.map(c => c.name)).toContain('Character 3');
    });

    test('should return empty array for non-existent node', () => {
      const characters = characterService.getCharactersByNode('non-existent');
      expect(characters).toEqual([]);
    });

    test('should return empty array for non-existent interaction', () => {
      const characters = characterService.getCharactersByInteraction('non-existent');
      expect(characters).toEqual([]);
    });
  });

  describe('Assignment Management', () => {
    let testCharacterId;

    beforeEach(async () => {
      const result = await characterService.createCharacter({
        name: 'Test Character',
        age: 25
      });
      testCharacterId = result.character.id;
    });

    test('should update character node assignment', async () => {
      const success = await characterService.updateCharacterNodeAssignment(
        testCharacterId, 
        'test-node-1'
      );

      expect(success).toBe(true);

      const nodeCharacters = assignmentManager.getCharactersByNode('test-node-1');
      expect(nodeCharacters).toContain(testCharacterId);
    });

    test('should unassign character from node', async () => {
      // First assign
      await characterService.updateCharacterNodeAssignment(testCharacterId, 'test-node-1');
      
      // Then unassign
      const success = await characterService.updateCharacterNodeAssignment(
        testCharacterId, 
        null
      );

      expect(success).toBe(true);

      const characterNode = assignmentManager.getNodeByCharacter(testCharacterId);
      expect(characterNode).toBeNull();
    });

    test('should update character interaction assignments', async () => {
      const success = await characterService.updateCharacterInteractionAssignments(
        testCharacterId, 
        ['test-interaction-1', 'test-interaction-2']
      );

      expect(success).toBe(true);

      const characterInteractions = assignmentManager.getInteractionsByCharacter(testCharacterId);
      expect(characterInteractions).toEqual(['test-interaction-1', 'test-interaction-2']);
    });

    test('should handle invalid node assignment', async () => {
      await expect(characterService.updateCharacterNodeAssignment(
        testCharacterId, 
        'non-existent-node'
      )).rejects.toThrow(ValidationError);
    });

    test('should handle invalid interaction assignment', async () => {
      await expect(characterService.updateCharacterInteractionAssignments(
        testCharacterId, 
        ['non-existent-interaction']
      )).rejects.toThrow(ValidationError);
    });
  });

  describe('Validation', () => {
    test('should validate character data', () => {
      const characterData = {
        name: 'Valid Character',
        age: 25,
        assignedNodes: ['test-node-1'],
        assignedInteractions: ['test-interaction-1']
      };

      const validation = characterService.validateCharacter(characterData);

      expect(validation.success).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect invalid node assignments', () => {
      const characterData = {
        name: 'Invalid Character',
        age: 25,
        assignedNodes: ['non-existent-node']
      };

      const validation = characterService.validateCharacter(characterData);

      expect(validation.success).toBe(false);
      expect(validation.errors.some(e => e.field === 'assignedNodes')).toBe(true);
    });

    test('should detect invalid interaction assignments', () => {
      const characterData = {
        name: 'Invalid Character',
        age: 25,
        assignedInteractions: ['non-existent-interaction']
      };

      const validation = characterService.validateCharacter(characterData);

      expect(validation.success).toBe(false);
      expect(validation.errors.some(e => e.field === 'assignedInteractions')).toBe(true);
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      await characterService.createCharacter({
        name: 'Character 1',
        assignedNodes: ['test-node-1'],
        assignedInteractions: ['test-interaction-1']
      });

      await characterService.createCharacter({
        name: 'Character 2',
        assignedInteractions: ['test-interaction-2']
      });

      await characterService.createCharacter({
        name: 'Character 3'
      });
    });

    test('should get enhanced character statistics', () => {
      const stats = characterService.getCharacterStatistics();

      expect(stats.total).toBe(3);
      expect(stats.assignments).toBeDefined();
      expect(stats.assignments.charactersWithNodes).toBe(1);
      expect(stats.assignments.charactersWithInteractions).toBe(2);
      expect(stats.assignments.unassignedCharacters).toBe(2); // 3 total - 1 with nodes
    });
  });

  describe('Error Handling', () => {
    test('should handle WorldBuilder errors gracefully', async () => {
      // Create service with invalid WorldBuilder
      const invalidWorldBuilder = {};
      const service = new CharacterService(invalidWorldBuilder, assignmentManager);

      await expect(service.createCharacter({ name: 'Test' }))
        .rejects.toThrow();
    });

    test('should handle AssignmentManager errors gracefully', async () => {
      // Create character first
      const result = await characterService.createCharacter({ name: 'Test' });
      
      // Mock AssignmentManager to throw error
      const originalMethod = assignmentManager.assignCharacterToNode;
      assignmentManager.assignCharacterToNode = jest.fn(() => {
        throw new Error('Assignment failed');
      });

      await expect(characterService.updateCharacterNodeAssignment(
        result.character.id, 
        'test-node-1'
      )).rejects.toThrow(ValidationError);

      // Restore original method
      assignmentManager.assignCharacterToNode = originalMethod;
    });
  });

  describe('Constructor Validation', () => {
    test('should require WorldBuilder', () => {
      expect(() => new CharacterService(null, assignmentManager))
        .toThrow('WorldBuilder is required');
    });

    test('should require AssignmentManager', () => {
      expect(() => new CharacterService(worldBuilder, null))
        .toThrow('AssignmentManager is required');
    });
  });
});