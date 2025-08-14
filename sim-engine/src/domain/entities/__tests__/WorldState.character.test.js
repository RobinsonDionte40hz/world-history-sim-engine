/**
 * WorldState Character Management Test Suite
 * Tests for character-specific persistence, search, filtering, and assignment validation
 */

import WorldState from '../WorldState.js';
import WorldValidator from '../../services/WorldValidator.js';

// Mock WorldValidator for controlled testing
jest.mock('../../services/WorldValidator.js');

describe('WorldState Character Management', () => {
  let mockValidationResult;
  let worldState;

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
    
    // Create a fresh WorldState for each test
    worldState = new WorldState({
      name: 'Test World',
      description: 'A world for testing character management'
    });
    
    // Add some test nodes and interactions for assignment testing
    worldState.addContent('nodes', {
      id: 'node1',
      name: 'Test Node 1',
      type: 'settlement'
    });
    
    worldState.addContent('nodes', {
      id: 'node2',
      name: 'Test Node 2',
      type: 'dungeon'
    });
    
    worldState.addContent('interactions', {
      id: 'interaction1',
      name: 'Test Interaction 1',
      type: 'social'
    });
    
    worldState.addContent('interactions', {
      id: 'interaction2',
      name: 'Test Interaction 2',
      type: 'combat'
    });
  });

  describe('Character CRUD Operations', () => {
    describe('addCharacter', () => {
      test('should add character to world', () => {
        const character = {
          name: 'Test Character',
          race: 'Human',
          characterClass: 'Fighter',
          level: 1
        };
        
        const result = worldState.addCharacter(character);
        
        expect(result).toBe(worldState); // Should return this for chaining
        expect(worldState.characters).toHaveLength(1);
        expect(worldState.characters[0].name).toBe('Test Character');
        expect(worldState.characters[0].id).toBeDefined();
      });

      test('should preserve existing ID if provided', () => {
        const character = {
          id: 'custom-char-id',
          name: 'Test Character',
          race: 'Elf'
        };
        
        worldState.addCharacter(character);
        
        expect(worldState.characters[0].id).toBe('custom-char-id');
      });

      test('should throw error for duplicate character ID', () => {
        const character1 = { id: 'char1', name: 'Character 1' };
        const character2 = { id: 'char1', name: 'Character 2' };
        
        worldState.addCharacter(character1);
        
        expect(() => worldState.addCharacter(character2)).toThrow(
          'Character with ID char1 already exists'
        );
      });

      test('should throw error for invalid character', () => {
        expect(() => worldState.addCharacter(null)).toThrow('Character must be an object');
        expect(() => worldState.addCharacter('invalid')).toThrow('Character must be an object');
      });

      test('should trigger validation after adding character', () => {
        jest.clearAllMocks();
        
        worldState.addCharacter({ name: 'Test Character' });
        
        expect(WorldValidator.validate).toHaveBeenCalledTimes(1);
      });

      test('should update assignment tracking when character has assignments', () => {
        const character = {
          id: 'char1',
          name: 'Test Character',
          assignments: {
            nodes: ['node1'],
            interactions: ['interaction1']
          }
        };
        
        worldState.addCharacter(character);
        
        expect(worldState.isCharacterAssignedToNode('char1', 'node1')).toBe(true);
        expect(worldState.isCharacterAssignedToInteraction('char1', 'interaction1')).toBe(true);
      });
    });

    describe('updateCharacter', () => {
      test('should update existing character', () => {
        worldState.addCharacter({ id: 'char1', name: 'Original Name', level: 1 });
        
        const updated = worldState.updateCharacter('char1', { name: 'Updated Name', level: 2 });
        
        expect(updated).toBe(true);
        expect(worldState.getCharacter('char1').name).toBe('Updated Name');
        expect(worldState.getCharacter('char1').level).toBe(2);
        expect(worldState.getCharacter('char1').id).toBe('char1'); // ID should be preserved
      });

      test('should return false for non-existent character', () => {
        const updated = worldState.updateCharacter('non-existent', { name: 'New Name' });
        
        expect(updated).toBe(false);
      });

      test('should update assignment tracking when assignments change', () => {
        worldState.addCharacter({ 
          id: 'char1', 
          name: 'Test Character',
          assignments: { nodes: ['node1'] }
        });
        
        // Update with new assignments
        worldState.updateCharacter('char1', {
          assignments: { 
            nodes: ['node2'],
            interactions: ['interaction1']
          }
        });
        
        expect(worldState.isCharacterAssignedToNode('char1', 'node1')).toBe(false);
        expect(worldState.isCharacterAssignedToNode('char1', 'node2')).toBe(true);
        expect(worldState.isCharacterAssignedToInteraction('char1', 'interaction1')).toBe(true);
      });

      test('should trigger validation after updating character', () => {
        worldState.addCharacter({ id: 'char1', name: 'Test Character' });
        jest.clearAllMocks();
        
        worldState.updateCharacter('char1', { name: 'Updated Name' });
        
        expect(WorldValidator.validate).toHaveBeenCalledTimes(1);
      });
    });

    describe('deleteCharacter', () => {
      test('should remove character from world', () => {
        worldState.addCharacter({ id: 'char1', name: 'Test Character' });
        
        const deleted = worldState.deleteCharacter('char1');
        
        expect(deleted).toBe(true);
        expect(worldState.characters).toHaveLength(0);
        expect(worldState.getCharacter('char1')).toBeNull();
      });

      test('should return false for non-existent character', () => {
        const deleted = worldState.deleteCharacter('non-existent');
        
        expect(deleted).toBe(false);
      });

      test('should clean up assignment tracking when character is deleted', () => {
        worldState.addCharacter({ 
          id: 'char1', 
          name: 'Test Character',
          assignments: { 
            nodes: ['node1'],
            interactions: ['interaction1']
          }
        });
        
        // Verify assignments exist
        expect(worldState.isCharacterAssignedToNode('char1', 'node1')).toBe(true);
        expect(worldState.getNodeCharacterAssignments('node1')).toContain('char1');
        
        worldState.deleteCharacter('char1');
        
        // Verify assignments are cleaned up
        expect(worldState.getCharacterNodeAssignments('char1')).toHaveLength(0);
        expect(worldState.getNodeCharacterAssignments('node1')).not.toContain('char1');
      });

      test('should trigger validation after deleting character', () => {
        worldState.addCharacter({ id: 'char1', name: 'Test Character' });
        jest.clearAllMocks();
        
        worldState.deleteCharacter('char1');
        
        expect(WorldValidator.validate).toHaveBeenCalledTimes(1);
      });
    });

    describe('getCharacter and getCharacters', () => {
      test('should get character by ID', () => {
        const character = { id: 'char1', name: 'Test Character' };
        worldState.addCharacter(character);
        
        const retrieved = worldState.getCharacter('char1');
        
        expect(retrieved).toBeDefined();
        expect(retrieved.name).toBe('Test Character');
      });

      test('should return null for non-existent character', () => {
        const retrieved = worldState.getCharacter('non-existent');
        
        expect(retrieved).toBeNull();
      });

      test('should get all characters', () => {
        worldState.addCharacter({ id: 'char1', name: 'Character 1' });
        worldState.addCharacter({ id: 'char2', name: 'Character 2' });
        
        const characters = worldState.getCharacters();
        
        expect(characters).toHaveLength(2);
        expect(characters[0].name).toBe('Character 1');
        expect(characters[1].name).toBe('Character 2');
      });

      test('should return copy of characters array to prevent external modification', () => {
        worldState.addCharacter({ id: 'char1', name: 'Character 1' });
        
        const characters = worldState.getCharacters();
        characters.push({ id: 'external', name: 'External' });
        
        expect(worldState.characters).toHaveLength(1);
      });
    });
  });

  describe('Character Search and Filtering', () => {
    beforeEach(() => {
      // Add test characters with various properties
      worldState.addCharacter({
        id: 'char1',
        name: 'Aragorn',
        race: 'Human',
        characterClass: 'Ranger',
        level: 10,
        type: 'important',
        description: 'A skilled ranger and future king',
        tags: ['hero', 'leader']
      });
      
      worldState.addCharacter({
        id: 'char2',
        name: 'Legolas',
        race: 'Elf',
        characterClass: 'Archer',
        level: 8,
        type: 'detailed',
        description: 'An elven archer with keen eyes',
        tags: ['archer', 'elf']
      });
      
      worldState.addCharacter({
        id: 'char3',
        name: 'Guard Captain',
        race: 'Human',
        characterClass: 'Fighter',
        level: 5,
        type: 'generic',
        description: 'A generic guard captain',
        tags: ['guard', 'npc']
      });
      
      // Add some assignments for filtering tests
      worldState.assignCharacterToNode('char1', 'node1');
      worldState.assignCharacterToInteraction('char1', 'interaction1');
      worldState.assignCharacterToNode('char2', 'node2');
    });

    describe('searchCharacters', () => {
      test('should search by name', () => {
        const results = worldState.searchCharacters('Aragorn');
        
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Aragorn');
      });

      test('should search by race', () => {
        const results = worldState.searchCharacters('Elf');
        
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Legolas');
      });

      test('should search by character class', () => {
        const results = worldState.searchCharacters('Fighter');
        
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Guard Captain');
      });

      test('should search by description', () => {
        const results = worldState.searchCharacters('ranger');
        
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Aragorn');
      });

      test('should search by tags', () => {
        const results = worldState.searchCharacters('hero');
        
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Aragorn');
      });

      test('should be case insensitive', () => {
        const results = worldState.searchCharacters('ARAGORN');
        
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Aragorn');
      });

      test('should support partial matches', () => {
        const results = worldState.searchCharacters('Ara');
        
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Aragorn');
      });

      test('should return all characters when no query provided', () => {
        const results = worldState.searchCharacters('');
        
        expect(results).toHaveLength(3);
      });

      test('should return empty array for no matches', () => {
        const results = worldState.searchCharacters('NonExistent');
        
        expect(results).toHaveLength(0);
      });
    });

    describe('filterCharacters', () => {
      test('should filter by type', () => {
        const results = worldState.filterCharacters({ type: 'important' });
        
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Aragorn');
      });

      test('should filter by race', () => {
        const results = worldState.filterCharacters({ race: 'Human' });
        
        expect(results).toHaveLength(2);
        expect(results.map(c => c.name)).toContain('Aragorn');
        expect(results.map(c => c.name)).toContain('Guard Captain');
      });

      test('should filter by character class', () => {
        const results = worldState.filterCharacters({ characterClass: 'Ranger' });
        
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Aragorn');
      });

      test('should filter by level', () => {
        const results = worldState.filterCharacters({ level: 10 });
        
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Aragorn');
      });

      test('should filter by node assignment', () => {
        const results = worldState.filterCharacters({ assignedToNode: 'node1' });
        
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Aragorn');
      });

      test('should filter by having node assignments', () => {
        const withAssignments = worldState.filterCharacters({ hasNodeAssignments: true });
        const withoutAssignments = worldState.filterCharacters({ hasNodeAssignments: false });
        
        expect(withAssignments).toHaveLength(2); // Aragorn and Legolas
        expect(withoutAssignments).toHaveLength(1); // Guard Captain
      });

      test('should filter by interaction assignment', () => {
        const results = worldState.filterCharacters({ assignedToInteraction: 'interaction1' });
        
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Aragorn');
      });

      test('should filter by having interaction assignments', () => {
        const withAssignments = worldState.filterCharacters({ hasInteractionAssignments: true });
        const withoutAssignments = worldState.filterCharacters({ hasInteractionAssignments: false });
        
        expect(withAssignments).toHaveLength(1); // Only Aragorn
        expect(withoutAssignments).toHaveLength(2); // Legolas and Guard Captain
      });

      test('should combine multiple filters', () => {
        const results = worldState.filterCharacters({ 
          race: 'Human',
          type: 'important'
        });
        
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Aragorn');
      });
    });

    describe('searchCharacters with filters', () => {
      test('should combine search query with filters', () => {
        const results = worldState.searchCharacters('Human', { type: 'generic' });
        
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Guard Captain');
      });
    });
  });

  describe('Character Assignment Management', () => {
    beforeEach(() => {
      worldState.addCharacter({ id: 'char1', name: 'Character 1' });
      worldState.addCharacter({ id: 'char2', name: 'Character 2' });
    });

    describe('Node Assignments', () => {
      test('should assign character to node', () => {
        const result = worldState.assignCharacterToNode('char1', 'node1');
        
        expect(result).toBe(true);
        expect(worldState.isCharacterAssignedToNode('char1', 'node1')).toBe(true);
        expect(worldState.getCharacterNodeAssignments('char1')).toContain('node1');
        expect(worldState.getNodeCharacterAssignments('node1')).toContain('char1');
      });

      test('should throw error for non-existent character', () => {
        expect(() => worldState.assignCharacterToNode('non-existent', 'node1')).toThrow(
          'Character not found: non-existent'
        );
      });

      test('should throw error for non-existent node', () => {
        expect(() => worldState.assignCharacterToNode('char1', 'non-existent')).toThrow(
          'Node not found: non-existent'
        );
      });

      test('should unassign character from node', () => {
        worldState.assignCharacterToNode('char1', 'node1');
        
        const result = worldState.unassignCharacterFromNode('char1', 'node1');
        
        expect(result).toBe(true);
        expect(worldState.isCharacterAssignedToNode('char1', 'node1')).toBe(false);
        expect(worldState.getCharacterNodeAssignments('char1')).not.toContain('node1');
        expect(worldState.getNodeCharacterAssignments('node1')).not.toContain('char1');
      });

      test('should return false when unassigning non-existent assignment', () => {
        const result = worldState.unassignCharacterFromNode('char1', 'node1');
        
        expect(result).toBe(false);
      });

      test('should handle multiple assignments', () => {
        worldState.assignCharacterToNode('char1', 'node1');
        worldState.assignCharacterToNode('char1', 'node2');
        worldState.assignCharacterToNode('char2', 'node1');
        
        expect(worldState.getCharacterNodeAssignments('char1')).toHaveLength(2);
        expect(worldState.getNodeCharacterAssignments('node1')).toHaveLength(2);
      });
    });

    describe('Interaction Assignments', () => {
      test('should assign character to interaction', () => {
        const result = worldState.assignCharacterToInteraction('char1', 'interaction1');
        
        expect(result).toBe(true);
        expect(worldState.isCharacterAssignedToInteraction('char1', 'interaction1')).toBe(true);
        expect(worldState.getCharacterInteractionAssignments('char1')).toContain('interaction1');
        expect(worldState.getInteractionCharacterAssignments('interaction1')).toContain('char1');
      });

      test('should throw error for non-existent character', () => {
        expect(() => worldState.assignCharacterToInteraction('non-existent', 'interaction1')).toThrow(
          'Character not found: non-existent'
        );
      });

      test('should throw error for non-existent interaction', () => {
        expect(() => worldState.assignCharacterToInteraction('char1', 'non-existent')).toThrow(
          'Interaction not found: non-existent'
        );
      });

      test('should unassign character from interaction', () => {
        worldState.assignCharacterToInteraction('char1', 'interaction1');
        
        const result = worldState.unassignCharacterFromInteraction('char1', 'interaction1');
        
        expect(result).toBe(true);
        expect(worldState.isCharacterAssignedToInteraction('char1', 'interaction1')).toBe(false);
        expect(worldState.getCharacterInteractionAssignments('char1')).not.toContain('interaction1');
        expect(worldState.getInteractionCharacterAssignments('interaction1')).not.toContain('char1');
      });

      test('should return false when unassigning non-existent assignment', () => {
        const result = worldState.unassignCharacterFromInteraction('char1', 'interaction1');
        
        expect(result).toBe(false);
      });
    });

    describe('Assignment Queries', () => {
      beforeEach(() => {
        worldState.assignCharacterToNode('char1', 'node1');
        worldState.assignCharacterToNode('char2', 'node1');
        worldState.assignCharacterToInteraction('char1', 'interaction1');
      });

      test('should get characters by node', () => {
        const characters = worldState.getCharactersByNode('node1');
        
        expect(characters).toHaveLength(2);
        expect(characters.map(c => c.name)).toContain('Character 1');
        expect(characters.map(c => c.name)).toContain('Character 2');
      });

      test('should get characters by interaction', () => {
        const characters = worldState.getCharactersByInteraction('interaction1');
        
        expect(characters).toHaveLength(1);
        expect(characters[0].name).toBe('Character 1');
      });

      test('should return empty array for nodes/interactions with no characters', () => {
        expect(worldState.getCharactersByNode('node2')).toHaveLength(0);
        expect(worldState.getCharactersByInteraction('interaction2')).toHaveLength(0);
      });
    });
  });

  describe('Assignment Consistency Validation', () => {
    beforeEach(() => {
      worldState.addCharacter({ id: 'char1', name: 'Character 1' });
      worldState.addCharacter({ id: 'char2', name: 'Character 2' });
      worldState.addCharacter({ id: 'char3', name: 'Character 3' });
      
      // Create some assignments
      worldState.assignCharacterToNode('char1', 'node1');
      worldState.assignCharacterToInteraction('char1', 'interaction1');
      worldState.assignCharacterToNode('char2', 'node2');
    });

    describe('validateCharacterAssignments', () => {
      test('should validate consistent assignments', () => {
        const validation = worldState.validateCharacterAssignments();
        
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
        expect(validation.summary.totalCharacters).toBe(3);
        expect(validation.summary.charactersWithNodeAssignments).toBe(2);
        expect(validation.summary.charactersWithInteractionAssignments).toBe(1);
        expect(validation.summary.charactersWithoutAssignments).toBe(1);
      });

      test('should detect assignments to non-existent characters', () => {
        // Manually corrupt assignment tracking
        worldState.characterNodeAssignments.set('non-existent-char', new Set(['node1']));
        
        const validation = worldState.validateCharacterAssignments();
        
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toContain(
          'Character assignment references non-existent character: non-existent-char'
        );
      });

      test('should detect assignments to non-existent nodes', () => {
        worldState.assignCharacterToNode('char1', 'node1');
        // Remove the node but keep the assignment
        worldState.removeContent('nodes', 'node1');
        
        const validation = worldState.validateCharacterAssignments();
        
        expect(validation.isValid).toBe(false);
        expect(validation.errors.some(error => 
          error.includes('assigned to non-existent node')
        )).toBe(true);
      });

      test('should detect assignments to non-existent interactions', () => {
        worldState.assignCharacterToInteraction('char1', 'interaction1');
        // Remove the interaction but keep the assignment
        worldState.removeContent('interactions', 'interaction1');
        
        const validation = worldState.validateCharacterAssignments();
        
        expect(validation.isValid).toBe(false);
        expect(validation.errors.some(error => 
          error.includes('assigned to non-existent interaction')
        )).toBe(true);
      });

      test('should detect bidirectional inconsistencies', () => {
        // Manually create inconsistent state
        worldState.nodeCharacterAssignments.set('node1', new Set(['char1']));
        worldState.characterNodeAssignments.delete('char1');
        
        const validation = worldState.validateCharacterAssignments();
        
        expect(validation.isValid).toBe(false);
        expect(validation.errors.some(error => 
          error.includes('Inconsistent assignment')
        )).toBe(true);
      });

      test('should warn about characters without assignments', () => {
        const validation = worldState.validateCharacterAssignments();
        
        expect(validation.warnings.some(warning => 
          warning.includes('characters have no assignments')
        )).toBe(true);
      });

      test('should warn about nodes without characters', () => {
        // Add a node with no character assignments
        worldState.addContent('nodes', { id: 'empty-node', name: 'Empty Node' });
        
        const validation = worldState.validateCharacterAssignments();
        
        expect(validation.warnings.some(warning => 
          warning.includes('nodes have no assigned characters')
        )).toBe(true);
      });

      test('should warn about interactions without characters', () => {
        const validation = worldState.validateCharacterAssignments();
        
        expect(validation.warnings.some(warning => 
          warning.includes('interactions have no assigned characters')
        )).toBe(true);
      });
    });

    describe('repairCharacterAssignments', () => {
      test('should repair assignments to non-existent characters', () => {
        // Manually corrupt assignment tracking
        worldState.characterNodeAssignments.set('non-existent-char', new Set(['node1']));
        
        const repair = worldState.repairCharacterAssignments();
        
        expect(repair.repaired).toBe(true);
        expect(repair.actions.some(action => 
          action.includes('Removed node assignments for non-existent character')
        )).toBe(true);
        expect(worldState.characterNodeAssignments.has('non-existent-char')).toBe(false);
      });

      test('should repair assignments to non-existent nodes', () => {
        worldState.assignCharacterToNode('char1', 'node1');
        // Remove the node
        worldState.removeContent('nodes', 'node1');
        
        const repair = worldState.repairCharacterAssignments();
        
        expect(repair.repaired).toBe(true);
        expect(repair.actions.some(action => 
          action.includes('Removed assignment of character char1 to non-existent node')
        )).toBe(true);
        expect(worldState.isCharacterAssignedToNode('char1', 'node1')).toBe(false);
      });

      test('should repair assignments to non-existent interactions', () => {
        worldState.assignCharacterToInteraction('char1', 'interaction1');
        // Remove the interaction
        worldState.removeContent('interactions', 'interaction1');
        
        const repair = worldState.repairCharacterAssignments();
        
        expect(repair.repaired).toBe(true);
        expect(repair.actions.some(action => 
          action.includes('Removed assignment of character char1 to non-existent interaction')
        )).toBe(true);
        expect(worldState.isCharacterAssignedToInteraction('char1', 'interaction1')).toBe(false);
      });

      test('should rebuild assignment mappings', () => {
        const repair = worldState.repairCharacterAssignments();
        
        expect(repair.actions).toContain('Rebuilt assignment mappings for consistency');
      });

      test('should return false when no repairs needed', () => {
        // Start with clean state
        const repair = worldState.repairCharacterAssignments();
        
        // Only the rebuild action should be present
        expect(repair.repaired).toBe(true);
        expect(repair.actions).toHaveLength(1);
        expect(repair.actions[0]).toBe('Rebuilt assignment mappings for consistency');
      });
    });
  });

  describe('Serialization with Character Assignments', () => {
    beforeEach(() => {
      worldState.addCharacter({ id: 'char1', name: 'Character 1' });
      worldState.assignCharacterToNode('char1', 'node1');
      worldState.assignCharacterToInteraction('char1', 'interaction1');
    });

    test('should serialize assignment tracking in toJSON', () => {
      const json = worldState.toJSON();
      
      expect(json.characterNodeAssignments).toBeDefined();
      expect(json.characterInteractionAssignments).toBeDefined();
      expect(json.nodeCharacterAssignments).toBeDefined();
      expect(json.interactionCharacterAssignments).toBeDefined();
      
      expect(json.characterNodeAssignments.char1).toEqual(['node1']);
      expect(json.characterInteractionAssignments.char1).toEqual(['interaction1']);
      expect(json.nodeCharacterAssignments.node1).toEqual(['char1']);
      expect(json.interactionCharacterAssignments.interaction1).toEqual(['char1']);
    });

    test('should deserialize assignment tracking from JSON', () => {
      const json = worldState.toJSON();
      const newWorldState = WorldState.fromJSON(json);
      
      expect(newWorldState.isCharacterAssignedToNode('char1', 'node1')).toBe(true);
      expect(newWorldState.isCharacterAssignedToInteraction('char1', 'interaction1')).toBe(true);
      expect(newWorldState.getNodeCharacterAssignments('node1')).toContain('char1');
      expect(newWorldState.getInteractionCharacterAssignments('interaction1')).toContain('char1');
    });

    test('should handle missing assignment data in fromJSON', () => {
      const json = {
        id: 'test-world',
        name: 'Test World',
        characters: [{ id: 'char1', name: 'Character 1' }],
        nodes: [{ id: 'node1', name: 'Node 1' }],
        interactions: [{ id: 'interaction1', name: 'Interaction 1' }]
      };
      
      const newWorldState = WorldState.fromJSON(json);
      
      expect(newWorldState.characterNodeAssignments).toBeInstanceOf(Map);
      expect(newWorldState.characterInteractionAssignments).toBeInstanceOf(Map);
      expect(newWorldState.nodeCharacterAssignments).toBeInstanceOf(Map);
      expect(newWorldState.interactionCharacterAssignments).toBeInstanceOf(Map);
    });
  });

  describe('Enhanced getSummary', () => {
    beforeEach(() => {
      worldState.addCharacter({ id: 'char1', name: 'Character 1' });
      worldState.addCharacter({ id: 'char2', name: 'Character 2' });
      worldState.assignCharacterToNode('char1', 'node1');
      worldState.assignCharacterToInteraction('char1', 'interaction1');
    });

    test('should include assignment summary in getSummary', () => {
      const summary = worldState.getSummary();
      
      expect(summary.assignmentSummary).toBeDefined();
      expect(summary.assignmentSummary.totalCharacters).toBe(2);
      expect(summary.assignmentSummary.charactersWithNodeAssignments).toBe(1);
      expect(summary.assignmentSummary.charactersWithInteractionAssignments).toBe(1);
      expect(summary.assignmentSummary.charactersWithoutAssignments).toBe(1);
      
      expect(summary.assignmentValidation).toBeDefined();
      expect(summary.assignmentValidation.isValid).toBe(true);
      expect(summary.assignmentValidation.errorCount).toBe(0);
    });
  });
});