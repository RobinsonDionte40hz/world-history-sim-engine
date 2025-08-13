// src/domain/entities/__tests__/Character.enhanced.test.js

import Character from '../Character.js';
import { CharacterType } from '../../value-objects/CharacterType.js';
import { ValidationError } from '../../../shared/types/ValueObjectTypes.js';

describe('Enhanced Character Entity', () => {
  describe('Character Type Integration', () => {
    test('should create character with default generic type', () => {
      const character = new Character({
        name: 'Test Character'
      });
      
      expect(character.characterType).toBeInstanceOf(CharacterType);
      expect(character.characterType.typeId).toBe('generic');
      expect(character.characterType.name).toBe('Generic NPC');
    });

    test('should create character with specific type ID', () => {
      const character = new Character({
        name: 'Test Leader',
        characterTypeId: 'leader'
      });
      
      expect(character.characterType.typeId).toBe('leader');
      expect(character.characterType.name).toBe('Leader');
      expect(character.characterType.category).toBe('leader');
    });

    test('should create character with CharacterType instance', () => {
      const customType = new CharacterType({
        typeId: 'custom',
        name: 'Custom Type',
        description: 'A custom character type'
      });

      const character = new Character({
        name: 'Custom Character',
        characterType: customType
      });
      
      expect(character.characterType).toBe(customType);
      expect(character.characterType.typeId).toBe('custom');
    });

    test('should update character type with validation', () => {
      const character = new Character({
        name: 'Test Character',
        characterTypeId: 'generic'
      });

      const leaderType = CharacterType.createPredefinedTypes().leader;
      
      // This should throw because generic character might not meet leader requirements
      expect(() => {
        character.withCharacterType(leaderType);
      }).toThrow();
    });

    test('should successfully update to compatible character type', () => {
      const character = new Character({
        name: 'Warrior Character',
        characterTypeId: 'generic',
        attributes: {
          strength: 16,
          dexterity: 14,
          constitution: 16,
          intelligence: 10,
          wisdom: 12,
          charisma: 10
        },
        skills: {
          athletics: 12,
          intimidation: 9,
          perception: 7,
          survival: 6
        },
        health: 100
      });

      const warriorType = CharacterType.createPredefinedTypes().warrior;
      const updatedCharacter = character.withCharacterType(warriorType);
      
      expect(updatedCharacter).not.toBe(character);
      expect(updatedCharacter.characterType.typeId).toBe('warrior');
    });

    test('should validate character data against type requirements', () => {
      const character = new Character({
        name: 'Test Character',
        characterTypeId: 'leader',
        health: 100
      });

      const validation = character.validateAgainstType();
      
      expect(validation.success).toBe(false);
      expect(validation.errors).toHaveLength(0); // No required fields missing, but warnings about low stats
    });
  });

  describe('Assignment Tracking', () => {
    let character;

    beforeEach(() => {
      character = new Character({
        name: 'Test Character',
        characterTypeId: 'generic'
      });
    });

    test('should initialize with empty assignments', () => {
      expect(character.assignments.nodes.size).toBe(0);
      expect(character.assignments.interactions.size).toBe(0);
      expect(character.assignments.quests.size).toBe(0);
      expect(character.assignments.settlements.size).toBe(0);
      expect(character.assignments.factions.size).toBe(0);
      expect(character.getTotalAssignmentCount()).toBe(0);
    });

    test('should assign character to node', () => {
      const assignedCharacter = character.assignToNode('node-1');
      
      expect(assignedCharacter).not.toBe(character);
      expect(assignedCharacter.isAssignedTo('nodes', 'node-1')).toBe(true);
      expect(assignedCharacter.hasAssignmentsOfType('nodes')).toBe(true);
      expect(assignedCharacter.getTotalAssignmentCount()).toBe(1);
      expect(character.getTotalAssignmentCount()).toBe(0); // Original unchanged
    });

    test('should not duplicate node assignment', () => {
      const assignedOnce = character.assignToNode('node-1');
      const assignedTwice = assignedOnce.assignToNode('node-1');
      
      expect(assignedTwice).toBe(assignedOnce); // Same instance
      expect(assignedTwice.assignments.nodes.size).toBe(1);
    });

    test('should unassign character from node', () => {
      const assignedCharacter = character.assignToNode('node-1');
      const unassignedCharacter = assignedCharacter.unassignFromNode('node-1');
      
      expect(unassignedCharacter).not.toBe(assignedCharacter);
      expect(unassignedCharacter.isAssignedTo('nodes', 'node-1')).toBe(false);
      expect(unassignedCharacter.hasAssignmentsOfType('nodes')).toBe(false);
      expect(unassignedCharacter.getTotalAssignmentCount()).toBe(0);
    });

    test('should handle unassigning non-existent node assignment', () => {
      const result = character.unassignFromNode('non-existent');
      expect(result).toBe(character); // Same instance
    });

    test('should assign character to interaction', () => {
      const assignedCharacter = character.assignToInteraction('interaction-1');
      
      expect(assignedCharacter.isAssignedTo('interactions', 'interaction-1')).toBe(true);
      expect(assignedCharacter.getTotalAssignmentCount()).toBe(1);
    });

    test('should assign character to quest', () => {
      const assignedCharacter = character.assignToQuest('quest-1');
      
      expect(assignedCharacter.isAssignedTo('quests', 'quest-1')).toBe(true);
      expect(assignedCharacter.getTotalAssignmentCount()).toBe(1);
    });

    test('should assign character to settlement', () => {
      // Use leader type which can be assigned to settlements
      const leaderCharacter = new Character({
        name: 'Leader Character',
        characterTypeId: 'leader',
        attributes: {
          intelligence: 15,
          wisdom: 16,
          charisma: 17
        },
        skills: {
          persuasion: 10
        },
        health: 100
      });

      const assignedCharacter = leaderCharacter.assignToSettlement('settlement-1');
      
      expect(assignedCharacter.isAssignedTo('settlements', 'settlement-1')).toBe(true);
      expect(assignedCharacter.getTotalAssignmentCount()).toBe(1);
    });

    test('should assign character to faction', () => {
      // Use leader type which can be assigned to factions
      const leaderCharacter = new Character({
        name: 'Leader Character',
        characterTypeId: 'leader',
        attributes: {
          intelligence: 15,
          wisdom: 16,
          charisma: 17
        },
        skills: {
          persuasion: 10
        },
        health: 100
      });

      const assignedCharacter = leaderCharacter.assignToFaction('faction-1');
      
      expect(assignedCharacter.isAssignedTo('factions', 'faction-1')).toBe(true);
      expect(assignedCharacter.getTotalAssignmentCount()).toBe(1);
    });

    test('should throw error when assigning to forbidden assignment type', () => {
      // Generic characters can't be assigned to settlements
      expect(() => {
        character.assignToSettlement('settlement-1');
      }).toThrow(ValidationError);
      
      expect(() => {
        character.assignToFaction('faction-1');
      }).toThrow(ValidationError);
    });

    test('should handle multiple assignments', () => {
      const multiAssigned = character
        .assignToNode('node-1')
        .assignToNode('node-2')
        .assignToInteraction('interaction-1')
        .assignToQuest('quest-1');
      
      expect(multiAssigned.getTotalAssignmentCount()).toBe(4);
      expect(multiAssigned.assignments.nodes.size).toBe(2);
      expect(multiAssigned.assignments.interactions.size).toBe(1);
      expect(multiAssigned.assignments.quests.size).toBe(1);
    });

    test('should clear assignments of specific type', () => {
      const multiAssigned = character
        .assignToNode('node-1')
        .assignToNode('node-2')
        .assignToInteraction('interaction-1');
      
      const clearedNodes = multiAssigned.clearAssignmentsOfType('nodes');
      
      expect(clearedNodes.assignments.nodes.size).toBe(0);
      expect(clearedNodes.assignments.interactions.size).toBe(1);
      expect(clearedNodes.getTotalAssignmentCount()).toBe(1);
    });

    test('should clear all assignments', () => {
      const multiAssigned = character
        .assignToNode('node-1')
        .assignToInteraction('interaction-1')
        .assignToQuest('quest-1');
      
      const clearedAll = multiAssigned.clearAllAssignments();
      
      expect(clearedAll.getTotalAssignmentCount()).toBe(0);
      expect(clearedAll.assignments.nodes.size).toBe(0);
      expect(clearedAll.assignments.interactions.size).toBe(0);
      expect(clearedAll.assignments.quests.size).toBe(0);
    });

    test('should get assignment summary', () => {
      const assignedCharacter = character
        .assignToNode('node-1')
        .assignToNode('node-2')
        .assignToInteraction('interaction-1');
      
      const summary = assignedCharacter.getAssignmentSummary();
      
      expect(summary.totalAssignments).toBe(3);
      expect(summary.byType.nodes).toBe(2);
      expect(summary.byType.interactions).toBe(1);
      expect(summary.byType.quests).toBe(0);
      expect(summary.nodeIds).toEqual(['node-1', 'node-2']);
      expect(summary.interactionIds).toEqual(['interaction-1']);
    });

    test('should check assignment capabilities based on character type', () => {
      const genericCharacter = new Character({ characterTypeId: 'generic' });
      const leaderCharacter = new Character({ 
        characterTypeId: 'leader',
        attributes: { intelligence: 15, wisdom: 16, charisma: 17 },
        skills: { persuasion: 10 },
        health: 100
      });
      
      expect(genericCharacter.canBeAssignedTo('node')).toBe(true);
      expect(genericCharacter.canBeAssignedTo('interaction')).toBe(true);
      expect(genericCharacter.canBeAssignedTo('settlement')).toBe(false);
      expect(genericCharacter.canBeAssignedTo('faction')).toBe(false);
      
      expect(leaderCharacter.canBeAssignedTo('settlement')).toBe(true);
      expect(leaderCharacter.canBeAssignedTo('faction')).toBe(true);
    });
  });

  describe('Serialization with New Properties', () => {
    test('should serialize character with type and assignments', () => {
      const character = new Character({
        name: 'Test Character',
        characterTypeId: 'trader',
        health: 100
      }).assignToNode('node-1').assignToInteraction('interaction-1');

      const json = character.toJSON();
      
      expect(json).toHaveProperty('characterType');
      expect(json.characterType.typeId).toBe('trader');
      expect(json).toHaveProperty('assignments');
      expect(json.assignments.nodes).toEqual(['node-1']);
      expect(json.assignments.interactions).toEqual(['interaction-1']);
      expect(json.assignments.quests).toEqual([]);
    });

    test('should deserialize character with type and assignments', () => {
      const originalCharacter = new Character({
        name: 'Serialization Test',
        characterTypeId: 'warrior',
        attributes: {
          strength: 16,
          dexterity: 14,
          constitution: 16
        },
        skills: {
          athletics: 12
        },
        health: 100
      }).assignToNode('node-1').assignToInteraction('interaction-1');

      const json = originalCharacter.toJSON();
      const deserializedCharacter = Character.fromJSON(json);
      
      expect(deserializedCharacter.name).toBe(originalCharacter.name);
      expect(deserializedCharacter.characterType.typeId).toBe('warrior');
      expect(deserializedCharacter.isAssignedTo('nodes', 'node-1')).toBe(true);
      expect(deserializedCharacter.isAssignedTo('interactions', 'interaction-1')).toBe(true);
      expect(deserializedCharacter.getTotalAssignmentCount()).toBe(2);
    });

    test('should maintain assignment state through serialization', () => {
      const character = new Character({
        name: 'Assignment Test',
        characterTypeId: 'leader',
        attributes: { intelligence: 15, wisdom: 16, charisma: 17 },
        skills: { persuasion: 10 },
        health: 100
      }).assignToSettlement('settlement-1').assignToFaction('faction-1');

      const json = character.toJSON();
      const deserializedCharacter = Character.fromJSON(json);
      
      expect(deserializedCharacter.assignments.settlements.has('settlement-1')).toBe(true);
      expect(deserializedCharacter.assignments.factions.has('faction-1')).toBe(true);
      expect(deserializedCharacter.getTotalAssignmentCount()).toBe(2);
    });
  });

  describe('Enhanced State for Validation', () => {
    test('should include character type and assignments in validation state', () => {
      const character = new Character({
        name: 'State Test Character',
        characterTypeId: 'mage',
        attributes: { intelligence: 18 },
        health: 100
      }).assignToNode('node-1');

      const state = character.getStateForValidation();
      
      expect(state).toHaveProperty('characterType', 'mage');
      expect(state).toHaveProperty('assignments');
      expect(state.assignments.totalAssignments).toBe(1);
      expect(state.assignments.byType.nodes).toBe(1);
    });
  });

  describe('Type-Based Field Requirements', () => {
    test('should respect field requirements for different character types', () => {
      const leaderType = CharacterType.createPredefinedTypes().leader;
      const requiredFields = leaderType.getRequiredFields();
      
      expect(requiredFields).toContain('name');
      expect(requiredFields).toContain('age');
      expect(requiredFields).toContain('attributes');
      expect(requiredFields).toContain('skills');
      expect(requiredFields).toContain('personality');
      expect(requiredFields).toContain('health');
    });

    test('should validate character against type-specific attribute requirements', () => {
      const warrior = new Character({
        name: 'Weak Warrior',
        characterTypeId: 'warrior',
        attributes: {
          strength: 8, // Below minimum requirement
          constitution: 10 // Below minimum requirement
        },
        health: 100
      });

      const validation = warrior.validateAgainstType();
      
      expect(validation.success).toBe(false);
      expect(validation.errors.some(err => err.field === 'attributes.strength')).toBe(true);
      expect(validation.errors.some(err => err.field === 'attributes.constitution')).toBe(true);
    });

    test('should pass validation for properly configured character', () => {
      const warrior = new Character({
        name: 'Strong Warrior',
        characterTypeId: 'warrior',
        attributes: {
          strength: 16,
          dexterity: 14,
          constitution: 16,
          intelligence: 10,
          wisdom: 12,
          charisma: 10
        },
        skills: {
          athletics: 12,
          intimidation: 9,
          perception: 7,
          survival: 6
        },
        health: 100
      });

      const validation = warrior.validateAgainstType();
      
      expect(validation.success).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid character type', () => {
      expect(() => {
        new Character().withCharacterType('not a character type');
      }).toThrow(ValidationError);
    });

    test('should throw error when assigning character to forbidden assignment type', () => {
      const character = new Character({ characterTypeId: 'generic' });
      
      expect(() => {
        character.assignToSettlement('settlement-1');
      }).toThrow(ValidationError);
    });
  });
});
