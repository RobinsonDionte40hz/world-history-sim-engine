// src/domain/services/__tests__/WorldBuilder.character-management.test.js

import WorldBuilder from '../WorldBuilder.js';
import { CharacterType } from '../../value-objects/CharacterType.js';
import { ValidationError } from '../../../shared/types/ValueObjectTypes.js';

describe('WorldBuilder Character Management', () => {
  let worldBuilder;
  let mockTemplateManager;

  // Helper function to create a fully set up world builder ready for character operations
  const setupWorldForCharacters = () => {
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
  };

  beforeEach(() => {
    mockTemplateManager = {
      getTemplate: jest.fn(),
      addTemplate: jest.fn()
    };
    worldBuilder = new WorldBuilder(mockTemplateManager);
  });

  describe('Enhanced Character Creation', () => {
    beforeEach(() => {
      setupWorldForCharacters();
    });

    test('should create character with enhanced Character entity', () => {
      const characterConfig = {
        name: 'Enhanced Merchant',
        characterTypeId: 'trader',
        attributes: {
          strength: 10,
          dexterity: 12,
          constitution: 11,
          intelligence: 14,
          wisdom: 13,
          charisma: 16
        },
        health: 100,
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      };

      worldBuilder.addCharacter(characterConfig);
      
      expect(worldBuilder.worldConfig.characters).toHaveLength(1);
      const character = worldBuilder.worldConfig.characters[0];
      expect(character.name).toBe('Enhanced Merchant');
      expect(character.characterType.typeId).toBe('trader');
      expect(character.attributes.charisma).toBe(16);
      expect(character.health).toBe(100);
      expect(worldBuilder.worldConfig.stepValidation[4]).toBe(true);
    });

    test('should create character with CharacterType instance', () => {
      const customType = new CharacterType({
        typeId: 'custom-warrior',
        name: 'Custom Warrior',
        category: 'fighter'
      });

      const characterConfig = {
        name: 'Custom Character',
        characterType: customType,
        attributes: {
          strength: 16,
          dexterity: 14,
          constitution: 16,
          intelligence: 10,
          wisdom: 12,
          charisma: 10
        },
        health: 100,
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      };

      worldBuilder.addCharacter(characterConfig);
      
      const character = worldBuilder.worldConfig.characters[0];
      expect(character.characterType.typeId).toBe('custom-warrior');
      expect(character.characterType.name).toBe('Custom Warrior');
    });

    test('should handle legacy character format', () => {
      const legacyConfig = {
        name: 'Legacy Character',
        attributes: {
          strength: 12,
          dexterity: 14,
          constitution: 13,
          intelligence: 11,
          wisdom: 10,
          charisma: 15
        },
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id],
        personality: { trait: 'friendly' }
      };

      worldBuilder.addCharacter(legacyConfig);
      
      const character = worldBuilder.worldConfig.characters[0];
      expect(character.name).toBe('Legacy Character');
      expect(character.health).toBe(100); // Default value
      expect(character.characterType.typeId).toBe('generic'); // Default type
      expect(character.age).toBe(25); // Default age
    });

    test('should validate character against type requirements', () => {
      const invalidWarriorConfig = {
        name: 'Weak Warrior',
        characterTypeId: 'warrior',
        attributes: {
          strength: 8, // Too low for warrior type
          dexterity: 10,
          constitution: 9, // Too low for warrior type
          intelligence: 10,
          wisdom: 10,
          charisma: 10
        },
        health: 50, // Required for warrior type
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      };

      // Should still create character but with validation warnings
      expect(() => worldBuilder.addCharacter(invalidWarriorConfig)).not.toThrow();
      
      const character = worldBuilder.worldConfig.characters[0];
      expect(character.name).toBe('Weak Warrior');
    });

    test('should throw error for duplicate character ID', () => {
      const characterConfig = {
        id: 'duplicate-id',
        name: 'First Character',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        health: 100,
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      };

      worldBuilder.addCharacter(characterConfig);

      const duplicateConfig = {
        id: 'duplicate-id',
        name: 'Second Character',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        health: 100,
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      };

      expect(() => worldBuilder.addCharacter(duplicateConfig)).toThrow(ValidationError);
    });
  });

  describe('Character CRUD Operations', () => {
    beforeEach(() => {
      setupWorldForCharacters();
      
      // Add a test character
      worldBuilder.addCharacter({
        id: 'test-character-1',
        name: 'Test Merchant',
        characterTypeId: 'trader',
        attributes: {
          strength: 10,
          dexterity: 12,
          constitution: 11,
          intelligence: 14,
          wisdom: 13,
          charisma: 16
        },
        health: 100,
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      });
    });

    test('should get character by ID', () => {
      const character = worldBuilder.getCharacter('test-character-1');
      
      expect(character).not.toBeNull();
      expect(character.name).toBe('Test Merchant');
      expect(character.characterType.typeId).toBe('trader');
    });

    test('should return null for non-existent character', () => {
      const character = worldBuilder.getCharacter('non-existent');
      expect(character).toBeNull();
    });

    test('should get all characters', () => {
      const characters = worldBuilder.getAllCharacters();
      
      expect(characters).toHaveLength(1);
      expect(characters[0].name).toBe('Test Merchant');
    });

    test('should update existing character', () => {
      const updates = {
        name: 'Updated Merchant',
        age: 35,
        level: 3
      };

      worldBuilder.updateCharacter('test-character-1', updates);
      
      const character = worldBuilder.getCharacter('test-character-1');
      expect(character.name).toBe('Updated Merchant');
      expect(character.age).toBe(35);
      expect(character.level).toBe(3);
      expect(character.characterType.typeId).toBe('trader'); // Unchanged
    });

    test('should throw error when updating non-existent character', () => {
      expect(() => {
        worldBuilder.updateCharacter('non-existent', { name: 'Updated' });
      }).toThrow(ValidationError);
    });

    test('should validate updates during character update', () => {
      const invalidUpdates = {
        characterTypeId: 'warrior',
        attributes: {
          strength: 6 // Too low for warrior type
        }
      };

      expect(() => {
        worldBuilder.updateCharacter('test-character-1', invalidUpdates);
      }).toThrow(ValidationError);
    });

    test('should delete character and clean up references', () => {
      // First assign character to a node
      const nodeId = worldBuilder.worldConfig.nodes[0].id;
      worldBuilder.assignCharacterToNode('test-character-1', nodeId);
      
      // Verify character is assigned
      expect(worldBuilder.worldConfig.nodePopulations[nodeId]).toContain('test-character-1');
      
      // Delete character
      worldBuilder.deleteCharacter('test-character-1');
      
      // Verify character is removed
      expect(worldBuilder.worldConfig.characters).toHaveLength(0);
      expect(worldBuilder.getCharacter('test-character-1')).toBeNull();
      
      // Verify cleanup from node populations
      expect(worldBuilder.worldConfig.nodePopulations[nodeId]).not.toContain('test-character-1');
    });

    test('should throw error when deleting non-existent character', () => {
      expect(() => {
        worldBuilder.deleteCharacter('non-existent');
      }).toThrow(ValidationError);
    });
  });

  describe('Character Search and Filtering', () => {
    beforeEach(() => {
      setupWorldForCharacters();
      
      // Add multiple test characters
      const characters = [
        {
          id: 'char-1',
          name: 'Alice Merchant',
          characterTypeId: 'trader',
          age: 30,
          level: 5,
          attributes: { strength: 10, dexterity: 12, constitution: 11, intelligence: 14, wisdom: 13, charisma: 16 },
          health: 100,
          assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
        },
        {
          id: 'char-2',
          name: 'Bob Warrior',
          characterTypeId: 'warrior',
          age: 25,
          level: 3,
          attributes: { strength: 16, dexterity: 14, constitution: 16, intelligence: 10, wisdom: 12, charisma: 10 },
          health: 120,
          assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
        },
        {
          id: 'char-3',
          name: 'Carol Mage',
          characterTypeId: 'mage',
          age: 40,
          level: 7,
          attributes: { strength: 8, dexterity: 12, constitution: 12, intelligence: 18, wisdom: 16, charisma: 12 },
          health: 80,
          assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
        }
      ];

      characters.forEach(char => worldBuilder.addCharacter(char));
    });

    test('should search characters by name', () => {
      const results = worldBuilder.searchCharacters({ name: 'Alice' });
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Alice Merchant');
    });

    test('should search characters by partial name (case-insensitive)', () => {
      const results = worldBuilder.searchCharacters({ name: 'mer' });
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Alice Merchant');
    });

    test('should search characters by character type', () => {
      const results = worldBuilder.searchCharacters({ characterType: 'warrior' });
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Bob Warrior');
    });

    test('should search characters by age range', () => {
      const results = worldBuilder.searchCharacters({ minAge: 30, maxAge: 40 });
      
      expect(results).toHaveLength(2);
      const names = results.map(c => c.name);
      expect(names).toContain('Alice Merchant');
      expect(names).toContain('Carol Mage');
    });

    test('should search characters by level range', () => {
      const results = worldBuilder.searchCharacters({ minLevel: 5 });
      
      expect(results).toHaveLength(2);
      const names = results.map(c => c.name);
      expect(names).toContain('Alice Merchant');
      expect(names).toContain('Carol Mage');
    });

    test('should search characters by attribute values', () => {
      const results = worldBuilder.searchCharacters({
        attributes: {
          strength: { min: 15 },
          intelligence: { max: 12 }
        }
      });
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Bob Warrior');
    });

    test('should search characters by health range', () => {
      const results = worldBuilder.searchCharacters({ minHealth: 100 });
      
      expect(results).toHaveLength(2);
      const names = results.map(c => c.name);
      expect(names).toContain('Alice Merchant');
      expect(names).toContain('Bob Warrior');
    });

    test('should get characters by type', () => {
      const traders = worldBuilder.getCharactersByType('trader');
      
      expect(traders).toHaveLength(1);
      expect(traders[0].name).toBe('Alice Merchant');
    });

    test('should filter characters with custom function', () => {
      const results = worldBuilder.filterCharacters(character => 
        character.age > 35 || character.level > 6
      );
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Carol Mage');
    });

    test('should handle empty search results', () => {
      const results = worldBuilder.searchCharacters({ name: 'NonExistent' });
      expect(results).toHaveLength(0);
    });

    test('should search characters by assignment status', () => {
      // Assign one character to a node
      const nodeId = worldBuilder.worldConfig.nodes[0].id;
      worldBuilder.assignCharacterToNode('char-1', nodeId);

      // Note: The current implementation tracks assignments differently,
      // so we search by node assignment instead
      const assignedAtNode = worldBuilder.searchCharacters({ assignedToNode: nodeId });
      expect(assignedAtNode).toHaveLength(1);
      expect(assignedAtNode[0].name).toBe('Alice Merchant');
    });
  });

  describe('Character Node Assignments', () => {
    beforeEach(() => {
      setupWorldForCharacters();
      
      worldBuilder.addCharacter({
        id: 'test-char',
        name: 'Test Character',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        health: 100,
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      });
    });

    test('should get characters at specific node', () => {
      const nodeId = worldBuilder.worldConfig.nodes[0].id;
      worldBuilder.assignCharacterToNode('test-char', nodeId);
      
      const charactersAtNode = worldBuilder.getCharactersAtNode(nodeId);
      
      expect(charactersAtNode).toHaveLength(1);
      expect(charactersAtNode[0].name).toBe('Test Character');
    });

    test('should get unassigned characters', () => {
      const nodeId = worldBuilder.worldConfig.nodes[0].id;
      
      // Add another character but don't assign it
      worldBuilder.addCharacter({
        id: 'unassigned-char',
        name: 'Unassigned Character',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        health: 100,
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      });

      // Assign first character
      worldBuilder.assignCharacterToNode('test-char', nodeId);
      
      const unassigned = worldBuilder.getUnassignedCharacters();
      
      expect(unassigned).toHaveLength(1);
      expect(unassigned[0].name).toBe('Unassigned Character');
    });
  });

  describe('Character Validation', () => {
    beforeEach(() => {
      setupWorldForCharacters();
    });

    test('should validate character data', () => {
      const validCharacterData = {
        id: 'valid-char',
        name: 'Valid Character',
        characterTypeId: 'generic',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        health: 100,
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      };

      const validation = worldBuilder.validateCharacter(validCharacterData);
      
      expect(validation.success).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should catch validation errors', () => {
      const invalidCharacterData = {
        id: 'invalid-char',
        name: 'Invalid Character',
        characterTypeId: 'warrior',
        attributes: { strength: 5 }, // Missing required attributes and too low for warrior
        assignedInteractions: ['nonexistent-interaction']
      };

      const validation = worldBuilder.validateCharacter(invalidCharacterData);
      
      expect(validation.success).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(err => err.field === 'assignedInteractions')).toBe(true);
    });

    test('should warn about duplicate names', () => {
      // Add first character
      worldBuilder.addCharacter({
        id: 'first-char',
        name: 'Duplicate Name',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        health: 100,
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      });

      // Validate second character with same name
      const duplicateNameData = {
        id: 'second-char',
        name: 'Duplicate Name',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        health: 100,
        assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
      };

      const validation = worldBuilder.validateCharacter(duplicateNameData);
      
      expect(validation.success).toBe(true);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some(warn => warn.type === 'duplicate')).toBe(true);
    });
  });

  describe('Bulk Character Operations', () => {
    beforeEach(() => {
      setupWorldForCharacters();
    });

    test('should bulk add characters', () => {
      const charactersData = [
        {
          name: 'Bulk Character 1',
          attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
          health: 100,
          assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
        },
        {
          name: 'Bulk Character 2',
          attributes: { strength: 12, dexterity: 12, constitution: 12, intelligence: 12, wisdom: 12, charisma: 12 },
          health: 100,
          assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
        }
      ];

      const results = worldBuilder.bulkAddCharacters(charactersData);
      
      expect(results.totalAttempted).toBe(2);
      expect(results.successes).toHaveLength(2);
      expect(results.failures).toHaveLength(0);
      expect(worldBuilder.worldConfig.characters).toHaveLength(2);
    });

    test('should handle partial failures in bulk add', () => {
      const charactersData = [
        {
          name: 'Valid Character',
          attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
          health: 100,
          assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
        },
        {
          // Invalid character - missing name and attributes
          assignedInteractions: ['nonexistent-interaction']
        }
      ];

      const results = worldBuilder.bulkAddCharacters(charactersData);
      
      expect(results.totalAttempted).toBe(2);
      expect(results.successes).toHaveLength(1);
      expect(results.failures).toHaveLength(1);
      expect(results.failures[0].index).toBe(1);
      expect(worldBuilder.worldConfig.characters).toHaveLength(1);
    });

    test('should throw error for invalid bulk data', () => {
      expect(() => {
        worldBuilder.bulkAddCharacters('not an array');
      }).toThrow(ValidationError);
    });
  });

  describe('Character Statistics', () => {
    beforeEach(() => {
      setupWorldForCharacters();
    });

    test('should return empty statistics for no characters', () => {
      const stats = worldBuilder.getCharacterStatistics();
      
      expect(stats.total).toBe(0);
      expect(stats.byType).toEqual({});
      expect(stats.assignmentStatus.assigned).toBe(0);
      expect(stats.assignmentStatus.unassigned).toBe(0);
    });

    test('should calculate character statistics', () => {
      // Add multiple characters
      const characters = [
        {
          name: 'Trader 1',
          characterTypeId: 'trader',
          age: 30,
          level: 5,
          attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
          health: 100,
          assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
        },
        {
          name: 'Trader 2',
          characterTypeId: 'trader',
          age: 35,
          level: 7,
          attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
          health: 100,
          assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
        },
        {
          name: 'Warrior 1',
          characterTypeId: 'warrior',
          age: 25,
          level: 3,
          attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
          health: 100,
          assignedInteractions: [worldBuilder.worldConfig.interactions[0].id]
        }
      ];

      characters.forEach(char => worldBuilder.addCharacter(char));

      // Assign one character
      const nodeId = worldBuilder.worldConfig.nodes[0].id;
      worldBuilder.assignCharacterToNode(worldBuilder.worldConfig.characters[0].id, nodeId);

      const stats = worldBuilder.getCharacterStatistics();
      
      expect(stats.total).toBe(3);
      expect(stats.byType.trader).toBe(2);
      expect(stats.byType.warrior).toBe(1);
      expect(stats.assignmentStatus.assigned).toBe(1);
      expect(stats.assignmentStatus.unassigned).toBe(2);
      expect(stats.levelDistribution['0-4']).toBe(1);
      expect(stats.levelDistribution['5-9']).toBe(2);
      expect(stats.ageDistribution['20-29']).toBe(1);
      expect(stats.ageDistribution['30-39']).toBe(2);
    });
  });

  describe('Error Handling', () => {
    test('should throw validation errors for invalid inputs', () => {
      setupWorldForCharacters();

      expect(() => {
        worldBuilder.updateCharacter('', {});
      }).toThrow(ValidationError);

      expect(() => {
        worldBuilder.updateCharacter('valid-id', 'not an object');
      }).toThrow(ValidationError);

      expect(() => {
        worldBuilder.deleteCharacter('');
      }).toThrow(ValidationError);

      expect(() => {
        worldBuilder.filterCharacters('not a function');
      }).toThrow(ValidationError);
    });

    test('should handle character creation errors gracefully', () => {
      setupWorldForCharacters();

      const invalidConfig = {
        characterType: 'not a character type instance'
      };

      expect(() => {
        worldBuilder.addCharacter(invalidConfig);
      }).toThrow(ValidationError);
    });
  });
});
