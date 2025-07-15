// src/domain/value-objects/__tests__/RacialTraits.test.js

import { RacialTraits } from '../RacialTraits';

describe('RacialTraits Value Object', () => {
  describe('Construction', () => {
    test('should create racial traits for human', () => {
      const traits = new RacialTraits('human');
      
      expect(traits.raceId).toBe('human');
      expect(traits.race.name).toBe('Human');
      expect(traits.subraceId).toBeNull();
    });

    test('should create racial traits with subrace', () => {
      const traits = new RacialTraits('elf', 'High Elf');
      
      expect(traits.raceId).toBe('elf');
      expect(traits.subraceId).toBe('High Elf');
      expect(traits.subrace.name).toBe('High Elf');
    });

    test('should throw error for invalid race', () => {
      expect(() => new RacialTraits('invalid')).toThrow('Race with ID \'invalid\' not found');
    });

    test('should throw error for invalid subrace', () => {
      expect(() => new RacialTraits('human', 'Invalid Subrace')).toThrow('Subrace \'Invalid Subrace\' not found in race \'human\'');
    });

    test('should throw error for missing race ID', () => {
      expect(() => new RacialTraits()).toThrow('Race ID is required and must be a string');
      expect(() => new RacialTraits(null)).toThrow('Race ID is required and must be a string');
      expect(() => new RacialTraits('')).toThrow('Race ID is required and must be a string');
    });
  });

  describe('Immutability', () => {
    test('should be immutable', () => {
      const traits = new RacialTraits('human');
      
      expect(() => {
        traits.raceId = 'elf';
      }).toThrow();
      
      expect(() => {
        traits._race.name = 'Modified';
      }).toThrow();
      
      expect(Object.isFrozen(traits)).toBe(true);
    });

    test('should return frozen collections', () => {
      const traits = new RacialTraits('elf', 'High Elf');
      const features = traits.getFeatures();
      const lifespan = traits.getLifespan();
      
      expect(Object.isFrozen(features)).toBe(true);
      expect(Object.isFrozen(lifespan)).toBe(true);
    });
  });

  describe('Attribute Modifiers', () => {
    test('should return correct attribute modifiers for High Elf', () => {
      const traits = new RacialTraits('elf', 'High Elf');
      const modifiers = traits.getAttributeModifiers();
      
      expect(modifiers.get('intelligence')).toBe(2);
      expect(modifiers.get('dexterity')).toBe(1);
      expect(modifiers.get('strength')).toBeUndefined();
    });

    test('should return correct attribute modifiers for Mountain Dwarf', () => {
      const traits = new RacialTraits('dwarf', 'Mountain Dwarf');
      const modifiers = traits.getAttributeModifiers();
      
      expect(modifiers.get('strength')).toBe(2);
      expect(modifiers.get('constitution')).toBe(2);
    });

    test('should get specific attribute modifier', () => {
      const traits = new RacialTraits('elf', 'High Elf');
      
      expect(traits.getAttributeModifier('intelligence')).toBe(2);
      expect(traits.getAttributeModifier('strength')).toBe(0);
    });
  });

  describe('Skill Modifiers', () => {
    test('should return correct skill modifiers for Wood Elf', () => {
      const traits = new RacialTraits('elf', 'Wood Elf');
      const modifiers = traits.getSkillModifiers();
      
      expect(modifiers.get('nature')).toBe(2);
      expect(modifiers.get('stealth')).toBe(1);
    });

    test('should get specific skill modifier', () => {
      const traits = new RacialTraits('dwarf', 'Hill Dwarf');
      
      expect(traits.getSkillModifier('crafting')).toBe(1);
      expect(traits.getSkillModifier('survival')).toBe(1);
      expect(traits.getSkillModifier('magic')).toBe(0);
    });
  });

  describe('Features and Lifespan', () => {
    test('should return correct features for High Elf', () => {
      const traits = new RacialTraits('elf', 'High Elf');
      const features = traits.getFeatures();
      
      expect(features).toContain('Longevity');
      expect(features).toContain('Magical Affinity');
      expect(features).toContain('Arcane Affinity');
      expect(features).toContain('Long-lived');
    });

    test('should check for specific features', () => {
      const traits = new RacialTraits('dwarf', 'Mountain Dwarf');
      
      expect(traits.hasFeature('Resilience')).toBe(true);
      expect(traits.hasFeature('Stonecunning')).toBe(true);
      expect(traits.hasFeature('Arcane Affinity')).toBe(false);
    });

    test('should return correct lifespan for different races', () => {
      const humanTraits = new RacialTraits('human');
      const elfTraits = new RacialTraits('elf');
      const dwarfTraits = new RacialTraits('dwarf');
      
      expect(humanTraits.getLifespan().average).toBe(80);
      expect(elfTraits.getLifespan().average).toBe(750);
      expect(dwarfTraits.getLifespan().average).toBe(350);
    });
  });

  describe('Modifier Application', () => {
    test('should apply attribute modifiers to base attributes', () => {
      const traits = new RacialTraits('elf', 'High Elf');
      const baseAttributes = { strength: 10, intelligence: 12, dexterity: 14 };
      
      const modified = traits.applyAttributeModifiers(baseAttributes);
      
      expect(modified.strength).toBe(10); // unchanged
      expect(modified.intelligence).toBe(14); // +2
      expect(modified.dexterity).toBe(15); // +1
    });

    test('should apply skill modifiers to base skills', () => {
      const traits = new RacialTraits('dwarf', 'Mountain Dwarf');
      const baseSkills = { crafting: 5, mining: 3, magic: 2 };
      
      const modified = traits.applySkillModifiers(baseSkills);
      
      expect(modified.crafting).toBe(7); // +2
      expect(modified.mining).toBe(4); // +1
      expect(modified.magic).toBe(2); // unchanged
    });

    test('should apply bonuses to Map structures', () => {
      const traits = new RacialTraits('elf', 'High Elf');
      const attributeMap = new Map([
        ['strength', 10],
        ['intelligence', 12],
        ['dexterity', 14]
      ]);
      
      const modifiedMap = traits.applyAttributeBonuses(attributeMap);
      
      expect(modifiedMap.get('strength')).toBe(10);
      expect(modifiedMap.get('intelligence')).toBe(14);
      expect(modifiedMap.get('dexterity')).toBe(15);
    });

    test('should throw error for invalid input types', () => {
      const traits = new RacialTraits('human');
      
      expect(() => traits.applyAttributeModifiers(null)).toThrow('Base attributes must be provided as an object');
      expect(() => traits.applySkillModifiers('invalid')).toThrow('Base skills must be provided as an object');
      expect(() => traits.applyAttributeBonuses({})).toThrow('Attribute map must be a Map instance');
    });
  });

  describe('Personality and Alignment Integration', () => {
    test('should provide personality influence for different races', () => {
      const humanTraits = new RacialTraits('human');
      const elfTraits = new RacialTraits('elf', 'High Elf');
      const dwarfTraits = new RacialTraits('dwarf');
      
      const humanInfluence = humanTraits.getPersonalityInfluence();
      const elfInfluence = elfTraits.getPersonalityInfluence();
      const dwarfInfluence = dwarfTraits.getPersonalityInfluence();
      
      expect(humanInfluence.adaptability).toBe(0.1);
      expect(elfInfluence.scholarly).toBe(0.15);
      expect(dwarfInfluence.determination).toBe(0.15);
    });

    test('should provide alignment influence for different races', () => {
      const humanTraits = new RacialTraits('human');
      const elfTraits = new RacialTraits('elf', 'High Elf');
      const dwarfTraits = new RacialTraits('dwarf');
      
      const humanInfluence = humanTraits.getAlignmentInfluence();
      const elfInfluence = elfTraits.getAlignmentInfluence();
      const dwarfInfluence = dwarfTraits.getAlignmentInfluence();
      
      expect(humanInfluence.neutrality).toBe(0.05);
      expect(elfInfluence.good).toBe(0.1);
      expect(dwarfInfluence.lawful).toBe(0.15);
    });

    test('should handle subrace-specific influences', () => {
      const highElfTraits = new RacialTraits('elf', 'High Elf');
      const woodElfTraits = new RacialTraits('elf', 'Wood Elf');
      
      const highElfPersonality = highElfTraits.getPersonalityInfluence();
      const woodElfPersonality = woodElfTraits.getPersonalityInfluence();
      
      expect(highElfPersonality.scholarly).toBe(0.15);
      expect(woodElfPersonality.nature_affinity).toBe(0.2);
      
      const highElfAlignment = highElfTraits.getAlignmentInfluence();
      const woodElfAlignment = woodElfTraits.getAlignmentInfluence();
      
      expect(highElfAlignment.lawful).toBe(0.1);
      expect(woodElfAlignment.chaotic).toBe(0.15);
    });
  });

  describe('Racial Features Application', () => {
    test('should apply racial features to character capabilities', () => {
      const traits = new RacialTraits('elf', 'High Elf');
      const baseCapabilities = { skillLearningRate: 1.0 };
      
      const enhanced = traits.applyRacialFeatures(baseCapabilities);
      
      expect(enhanced.magicLearningRate).toBe(1.3);
      expect(enhanced.magicResistance).toBe(1.2);
      expect(enhanced.experienceRetention).toBe(1.2);
    });

    test('should handle empty capabilities object', () => {
      const traits = new RacialTraits('human', 'Standard');
      const enhanced = traits.applyRacialFeatures();
      
      expect(enhanced.skillLearningRate).toBe(1.1);
      expect(enhanced.goalPursuitBonus).toBe(0.1);
    });
  });

  describe('Age Modifiers', () => {
    test('should calculate age modifiers for humans', () => {
      const traits = new RacialTraits('human');
      
      const youngModifiers = traits.calculateAgeModifiers(15);
      const adultModifiers = traits.calculateAgeModifiers(30);
      const elderModifiers = traits.calculateAgeModifiers(70);
      
      expect(youngModifiers.learning).toBe(1.2);
      expect(youngModifiers.wisdom).toBe(0.7);
      
      expect(adultModifiers.learning).toBe(1.0);
      expect(adultModifiers.physical).toBe(1.0);
      
      expect(elderModifiers.wisdom).toBe(1.4);
      expect(elderModifiers.physical).toBe(0.7);
    });

    test('should calculate age modifiers for elves', () => {
      const traits = new RacialTraits('elf');
      
      const youngModifiers = traits.calculateAgeModifiers(50);
      const elderModifiers = traits.calculateAgeModifiers(600);
      
      expect(youngModifiers.learning).toBe(1.3);
      expect(elderModifiers.wisdom).toBe(1.5);
    });

    test('should calculate age modifiers for dwarves', () => {
      const traits = new RacialTraits('dwarf');
      
      const adultModifiers = traits.calculateAgeModifiers(100);
      const elderModifiers = traits.calculateAgeModifiers(300);
      
      expect(adultModifiers.crafting).toBe(1.2);
      expect(elderModifiers.crafting).toBe(1.4);
      expect(elderModifiers.wisdom).toBe(1.3);
    });

    test('should throw error for invalid age', () => {
      const traits = new RacialTraits('human');
      
      expect(() => traits.calculateAgeModifiers(-5)).toThrow('Current age must be a non-negative number');
      expect(() => traits.calculateAgeModifiers('invalid')).toThrow('Current age must be a non-negative number');
    });
  });

  describe('Immutable Operations', () => {
    test('should create new instance with different subrace', () => {
      const originalTraits = new RacialTraits('elf', 'High Elf');
      const newTraits = originalTraits.withSubrace('Wood Elf');
      
      expect(originalTraits.subraceId).toBe('High Elf');
      expect(newTraits.subraceId).toBe('Wood Elf');
      expect(originalTraits).not.toBe(newTraits);
    });

    test('should create new instance with custom modifiers', () => {
      const originalTraits = new RacialTraits('human');
      const customModifiers = {
        attributes: { strength: 1 },
        skills: { magic: 2 }
      };
      const newTraits = originalTraits.withCustomModifiers(customModifiers);
      
      expect(newTraits.getAttributeModifier('strength')).toBe(1);
      expect(newTraits.getSkillModifier('magic')).toBe(2);
      expect(originalTraits).not.toBe(newTraits);
    });
  });

  describe('Serialization', () => {
    test('should serialize to JSON correctly', () => {
      const traits = new RacialTraits('elf', 'High Elf');
      const json = traits.toJSON();
      
      expect(json.raceId).toBe('elf');
      expect(json.subraceId).toBe('High Elf');
      expect(json.attributeModifiers.intelligence).toBe(2);
      expect(json.attributeModifiers.dexterity).toBe(1);
      expect(json.features).toContain('Longevity');
      expect(json.lifespan.average).toBe(750);
    });

    test('should deserialize from JSON correctly', () => {
      const originalTraits = new RacialTraits('dwarf', 'Mountain Dwarf');
      const json = originalTraits.toJSON();
      const deserializedTraits = RacialTraits.fromJSON(json);
      
      expect(deserializedTraits.raceId).toBe(originalTraits.raceId);
      expect(deserializedTraits.subraceId).toBe(originalTraits.subraceId);
      expect(deserializedTraits.getAttributeModifier('strength')).toBe(2);
      expect(deserializedTraits.hasFeature('Stonecunning')).toBe(true);
    });

    test('should handle serialization round-trip', () => {
      const originalTraits = new RacialTraits('elf', 'Wood Elf');
      const json = originalTraits.toJSON();
      const deserializedTraits = RacialTraits.fromJSON(json);
      
      expect(deserializedTraits.equals(originalTraits)).toBe(true);
    });

    test('should throw error for invalid JSON data', () => {
      expect(() => RacialTraits.fromJSON(null)).toThrow('Invalid JSON data for RacialTraits');
      expect(() => RacialTraits.fromJSON('invalid')).toThrow('Invalid JSON data for RacialTraits');
    });
  });

  describe('Legacy Compatibility', () => {
    test('should create from RaceSystem format', () => {
      const traits = RacialTraits.fromRaceSystem('human', 'Standard');
      
      expect(traits.raceId).toBe('human');
      expect(traits.subraceId).toBe('Standard');
    });
  });

  describe('Equality and String Representation', () => {
    test('should compare equality correctly', () => {
      const traits1 = new RacialTraits('human');
      const traits2 = new RacialTraits('human');
      const traits3 = new RacialTraits('elf');
      
      expect(traits1.equals(traits2)).toBe(true);
      expect(traits1.equals(traits3)).toBe(false);
      expect(traits1.equals('not a racial traits')).toBe(false);
    });

    test('should provide meaningful string representation', () => {
      const humanTraits = new RacialTraits('human');
      const elfTraits = new RacialTraits('elf', 'High Elf');
      
      expect(humanTraits.toString()).toBe('RacialTraits { Human }');
      expect(elfTraits.toString()).toBe('RacialTraits { Elf (High Elf) }');
    });
  });

  describe('Static Methods', () => {
    test('should get all available races', () => {
      const races = RacialTraits.getAllRaces();
      
      expect(races).toHaveLength(3);
      expect(races.map(r => r.id)).toContain('human');
      expect(races.map(r => r.id)).toContain('elf');
      expect(races.map(r => r.id)).toContain('dwarf');
    });

    test('should get subraces for a specific race', () => {
      const elfSubraces = RacialTraits.getSubraces('elf');
      const humanSubraces = RacialTraits.getSubraces('human');
      
      expect(elfSubraces).toHaveLength(2);
      expect(elfSubraces.map(s => s.name)).toContain('High Elf');
      expect(elfSubraces.map(s => s.name)).toContain('Wood Elf');
      
      expect(humanSubraces).toHaveLength(1);
      expect(humanSubraces[0].name).toBe('Standard');
    });

    test('should check if race exists', () => {
      expect(RacialTraits.hasRace('human')).toBe(true);
      expect(RacialTraits.hasRace('elf')).toBe(true);
      expect(RacialTraits.hasRace('invalid')).toBe(false);
    });

    test('should return empty array for invalid race subraces', () => {
      const invalidSubraces = RacialTraits.getSubraces('invalid');
      expect(invalidSubraces).toEqual([]);
    });
  });

  describe('Trait Effects', () => {
    test('should get trait effects for different races', () => {
      const humanTraits = new RacialTraits('human');
      const elfTraits = new RacialTraits('elf');
      const dwarfTraits = new RacialTraits('dwarf');
      
      const humanEffects = humanTraits.getTraitEffects();
      const elfEffects = elfTraits.getTraitEffects();
      const dwarfEffects = dwarfTraits.getTraitEffects();
      
      expect(humanEffects.skillGainRate).toBe(1.1);
      expect(elfEffects.lifespan).toBe(2.0);
      expect(elfEffects.magicResistance).toBe(1.2);
      expect(dwarfEffects.physicalResistance).toBe(1.3);
      expect(dwarfEffects.craftingQuality).toBe(1.2);
    });
  });
});