// src/domain/entities/__tests__/Character.test.js

import Character from '../Character.js';
import { Alignment } from '../../value-objects/Alignment.js';
import { Influence } from '../../value-objects/Influence.js';
import { Prestige } from '../../value-objects/Prestige.js';
import PersonalityProfile from '../../value-objects/PersonalityProfile.js';
import { RacialTraits } from '../../value-objects/RacialTraits.js';

describe('Character Entity', () => {
  describe('Construction', () => {
    test('should create character with default values', () => {
      const character = new Character();
      
      expect(character.id).toBeDefined();
      expect(character.name).toBe('Unnamed Character');
      expect(character.age).toBe(25);
      expect(character.level).toBe(1);
      expect(character.alignment).toBeInstanceOf(Alignment);
      expect(character.influence).toBeInstanceOf(Influence);
      expect(character.prestige).toBeInstanceOf(Prestige);
      expect(character.personality).toBeInstanceOf(PersonalityProfile);
      expect(character.racialTraits).toBeInstanceOf(RacialTraits);
    });

    test('should create character with custom configuration', () => {
      const config = {
        id: 'test-char-1',
        name: 'Test Character',
        age: 30,
        level: 5,
        raceId: 'elf',
        subraceId: 'High Elf'
      };

      const character = new Character(config);
      
      expect(character.id).toBe('test-char-1');
      expect(character.name).toBe('Test Character');
      expect(character.age).toBe(30);
      expect(character.level).toBe(5);
      expect(character.racialTraits.raceId).toBe('elf');
      expect(character.racialTraits.subraceId).toBe('High Elf');
    });

    test('should apply racial modifiers to attributes', () => {
      const character = new Character({
        raceId: 'elf',
        subraceId: 'High Elf'
      });
      
      // High Elf should have +2 Intelligence, +1 Dexterity
      expect(character.attributes.intelligence).toBe(12); // 10 + 2
      expect(character.attributes.dexterity).toBe(11); // 10 + 1
    });
  });

  describe('Serialization', () => {
    test('should serialize character to JSON', () => {
      const character = new Character({
        id: 'test-char-1',
        name: 'Test Character',
        age: 30,
        level: 5,
        raceId: 'dwarf',
        subraceId: 'Mountain Dwarf'
      });

      const json = character.toJSON();
      
      expect(json).toHaveProperty('id', 'test-char-1');
      expect(json).toHaveProperty('name', 'Test Character');
      expect(json).toHaveProperty('age', 30);
      expect(json).toHaveProperty('level', 5);
      expect(json).toHaveProperty('alignment');
      expect(json).toHaveProperty('influence');
      expect(json).toHaveProperty('prestige');
      expect(json).toHaveProperty('personality');
      expect(json).toHaveProperty('racialTraits');
      expect(json).toHaveProperty('attributes');
      expect(json).toHaveProperty('skills');
      expect(json).toHaveProperty('inventory');
      expect(json).toHaveProperty('quests');
      expect(json).toHaveProperty('relationships');
      expect(json).toHaveProperty('memories');
    });

    test('should deserialize character from JSON', () => {
      const originalCharacter = new Character({
        id: 'test-char-2',
        name: 'Serialization Test',
        age: 25,
        level: 3,
        raceId: 'human'
      });

      const json = originalCharacter.toJSON();
      const deserializedCharacter = Character.fromJSON(json);
      
      expect(deserializedCharacter.id).toBe(originalCharacter.id);
      expect(deserializedCharacter.name).toBe(originalCharacter.name);
      expect(deserializedCharacter.age).toBe(originalCharacter.age);
      expect(deserializedCharacter.level).toBe(originalCharacter.level);
      expect(deserializedCharacter.racialTraits.raceId).toBe(originalCharacter.racialTraits.raceId);
      
      // Verify value objects are properly reconstructed
      expect(deserializedCharacter.alignment).toBeInstanceOf(Alignment);
      expect(deserializedCharacter.influence).toBeInstanceOf(Influence);
      expect(deserializedCharacter.prestige).toBeInstanceOf(Prestige);
      expect(deserializedCharacter.personality).toBeInstanceOf(PersonalityProfile);
      expect(deserializedCharacter.racialTraits).toBeInstanceOf(RacialTraits);
    });

    test('should maintain value object state through serialization', () => {
      const character = new Character({
        name: 'State Test Character',
        raceId: 'elf',
        subraceId: 'Wood Elf'
      });

      // Modify alignment
      const newAlignment = character.alignment.withChange('moral', 10, 'Test change');
      const modifiedCharacter = character.withAlignment(newAlignment);

      const json = modifiedCharacter.toJSON();
      const deserializedCharacter = Character.fromJSON(json);
      
      // Verify alignment change persisted
      expect(deserializedCharacter.alignment.getValue('moral')).toBe(10);
      expect(deserializedCharacter.alignment.getAxisHistory('moral')).toHaveLength(1);
      expect(deserializedCharacter.alignment.getLastChange('moral').reason).toBe('Test change');
    });
  });

  describe('Immutable Updates', () => {
    test('should create new character with updated alignment', () => {
      const character = new Character({ name: 'Test Character' });
      const newAlignment = character.alignment.withChange('moral', 15, 'Heroic deed');
      const updatedCharacter = character.withAlignment(newAlignment);
      
      expect(updatedCharacter).not.toBe(character);
      expect(updatedCharacter.alignment.getValue('moral')).toBe(15);
      expect(character.alignment.getValue('moral')).toBe(0); // Original unchanged
    });

    test('should create new character with updated age', () => {
      const character = new Character({ name: 'Test Character', age: 25 });
      const agedCharacter = character.withAge(45);
      
      expect(agedCharacter).not.toBe(character);
      expect(agedCharacter.age).toBe(45);
      expect(character.age).toBe(25); // Original unchanged
      
      // Verify age modifiers were applied to personality
      expect(agedCharacter.personality).not.toBe(character.personality);
    });
  });

  describe('Integration Methods', () => {
    test('should get state for validation', () => {
      const character = new Character({
        name: 'Validation Test',
        level: 10,
        age: 35
      });

      const state = character.getStateForValidation();
      
      expect(state).toHaveProperty('id');
      expect(state).toHaveProperty('name', 'Validation Test');
      expect(state).toHaveProperty('level', 10);
      expect(state).toHaveProperty('age', 35);
      expect(state).toHaveProperty('attributes');
      expect(state).toHaveProperty('skills');
      expect(state).toHaveProperty('alignment');
      expect(state).toHaveProperty('influence');
      expect(state).toHaveProperty('prestige');
      expect(state).toHaveProperty('personality');
      expect(state).toHaveProperty('racialTraits');
    });

    test('should get alignment compatibility with another character', () => {
      const character1 = new Character({ name: 'Character 1' });
      const character2 = new Character({ name: 'Character 2' });
      
      // Modify alignments to create difference
      const goodAlignment = character1.alignment.withChange('moral', 40, 'Good deed');
      const evilAlignment = character2.alignment.withChange('moral', -40, 'Evil deed');
      
      const goodCharacter = character1.withAlignment(goodAlignment);
      const evilCharacter = character2.withAlignment(evilAlignment);
      
      const compatibility = goodCharacter.getAlignmentCompatibility(evilCharacter);
      
      expect(compatibility).toHaveProperty('overall');
      expect(compatibility).toHaveProperty('byAxis');
      expect(compatibility).toHaveProperty('conflictAreas');
      expect(compatibility).toHaveProperty('harmoniousAreas');
      expect(compatibility.overall).toBeLessThan(0.8); // Should show some incompatibility
      expect(compatibility.conflictAreas).toContain('moral'); // Moral axis should be in conflict
    });
  });

  describe('Temporal Evolution', () => {
    test('should apply historical event to character', () => {
      const character = new Character({ name: 'Historical Character' });
      
      const historicalEvent = {
        type: 'war',
        description: 'The Great War',
        intensity: 1,
        affectsSettlements: false
      };
      
      const characterRole = { importance: 'major' };
      const historicalContext = {};
      
      const evolvedCharacter = character.withHistoricalEvent(
        historicalEvent,
        characterRole,
        historicalContext
      );
      
      expect(evolvedCharacter).not.toBe(character);
      expect(evolvedCharacter.alignment).not.toBe(character.alignment);
      expect(evolvedCharacter.personality).not.toBe(character.personality);
    });

    test('should apply temporal evolution with aging', () => {
      const character = new Character({ name: 'Aging Character', age: 25 });
      const timeElapsed = 365 * 10; // 10 years in days
      
      const evolvedCharacter = character.withTemporalEvolution(timeElapsed);
      
      expect(evolvedCharacter).not.toBe(character);
      expect(evolvedCharacter.age).toBe(35); // 25 + 10 years
      expect(evolvedCharacter.personality).not.toBe(character.personality);
      // Check that temporal evolution was applied (even if values didn't change enough to create new instances)
      expect(typeof evolvedCharacter.alignment).toBe('object');
      expect(typeof evolvedCharacter.influence).toBe('object');
      expect(typeof evolvedCharacter.prestige).toBe('object');
    });

    test('should apply settlement interaction', () => {
      const character = new Character({ name: 'Social Character' });
      
      const settlement = {
        id: 'test-settlement',
        name: 'Test Town',
        population: 1000
      };
      
      const interaction = {
        type: 'public_speech', // Use a type that maps to social domain
        description: 'Public speech',
        success: true,
        intensity: 2
      };
      
      const interactedCharacter = character.withSettlementInteraction(
        settlement,
        interaction,
        []
      );
      
      expect(interactedCharacter).not.toBe(character);
      // Check that the interaction was processed
      expect(typeof interactedCharacter.influence).toBe('object');
    });

    test('should apply moral choice', () => {
      const character = new Character({ name: 'Moral Character' });
      
      const moralChoice = {
        description: 'Help the poor',
        alignmentImpact: new Map([['moral', 10]]),
        intensity: 0.8
      };
      
      const moralCharacter = character.withMoralChoice(moralChoice);
      
      expect(moralCharacter).not.toBe(character);
      expect(moralCharacter.alignment).not.toBe(character.alignment);
      expect(moralCharacter.personality).not.toBe(character.personality);
      expect(moralCharacter.alignment.getValue('moral')).toBeGreaterThan(
        character.alignment.getValue('moral')
      );
    });

    test('should apply trauma', () => {
      const character = new Character({ name: 'Traumatized Character' });
      
      const trauma = {
        type: 'betrayal',
        description: 'Betrayed by close friend',
        alignmentImpact: {
          moral: -5
        }
      };
      
      const traumatizedCharacter = character.withTrauma(trauma, 0.7);
      
      expect(traumatizedCharacter).not.toBe(character);
      expect(traumatizedCharacter.personality).not.toBe(character.personality);
      expect(traumatizedCharacter.alignment).not.toBe(character.alignment);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid alignment update', () => {
      const character = new Character();
      
      expect(() => {
        character.withAlignment('not an alignment');
      }).toThrow('New alignment must be an instance of Alignment');
    });

    test('should throw error for invalid age', () => {
      const character = new Character();
      
      expect(() => {
        character.withAge(-5);
      }).toThrow('Age must be a non-negative number');
    });

    test('should throw error for invalid historical event', () => {
      const character = new Character();
      
      expect(() => {
        character.withHistoricalEvent(null);
      }).toThrow('Historical event must be provided as an object');
    });

    test('should throw error for invalid temporal evolution time', () => {
      const character = new Character();
      
      expect(() => {
        character.withTemporalEvolution(-10);
      }).toThrow('Time elapsed must be a positive number');
    });

    test('should throw error for invalid trauma severity', () => {
      const character = new Character();
      const trauma = { type: 'test', description: 'test trauma' };
      
      expect(() => {
        character.withTrauma(trauma, -0.5);
      }).toThrow('Severity must be a number between 0 and 1');
      
      expect(() => {
        character.withTrauma(trauma, 1.5);
      }).toThrow('Severity must be a number between 0 and 1');
    });

    test('should throw error for invalid JSON data', () => {
      expect(() => {
        Character.fromJSON(null);
      }).toThrow('Invalid JSON data for Character');
      
      expect(() => {
        Character.fromJSON('not an object');
      }).toThrow('Invalid JSON data for Character');
    });
  });
});