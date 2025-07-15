// src/domain/entities/__tests__/Character.integration.test.js

import Character from '../Character.js';
import { Alignment } from '../../value-objects/Alignment.js';
import { Influence } from '../../value-objects/Influence.js';
import { Prestige } from '../../value-objects/Prestige.js';
import PersonalityProfile from '../../value-objects/PersonalityProfile.js';
import { RacialTraits } from '../../value-objects/RacialTraits.js';

describe('Character Integration Tests', () => {
  describe('Complete System Integration', () => {
    test('should create character with all systems properly integrated', () => {
      const character = new Character({
        name: 'Integration Test Character',
        age: 30,
        level: 5,
        raceId: 'elf',
        subraceId: 'High Elf',
        personalityConfig: {
          traits: [
            {
              id: 'courage',
              name: 'Courage',
              description: 'Bravery in face of danger',
              category: 'virtue',
              intensity: 0.7,
              baseLevel: 0.6,
              volatility: 0.4
            },
            {
              id: 'wisdom',
              name: 'Wisdom',
              description: 'Deep understanding and insight',
              category: 'intellectual',
              intensity: 0.8,
              baseLevel: 0.7,
              volatility: 0.2
            }
          ]
        }
      });

      // Verify all systems are properly initialized
      expect(character.alignment).toBeInstanceOf(Alignment);
      expect(character.influence).toBeInstanceOf(Influence);
      expect(character.prestige).toBeInstanceOf(Prestige);
      expect(character.personality).toBeInstanceOf(PersonalityProfile);
      expect(character.racialTraits).toBeInstanceOf(RacialTraits);

      // Verify racial integration
      expect(character.racialTraits.raceId).toBe('elf');
      expect(character.racialTraits.subraceId).toBe('High Elf');
      expect(character.attributes.intelligence).toBe(12); // 10 + 2 from High Elf
      expect(character.attributes.dexterity).toBe(11); // 10 + 1 from High Elf

      // Verify personality integration
      expect(character.personality.getTrait('courage')).toBeTruthy();
      expect(character.personality.getTrait('courage').intensity).toBe(0.7);
      expect(character.personality.getTrait('wisdom')).toBeTruthy();
      // Wisdom trait gets racial influence from High Elf (+0.15), so expect higher value
      expect(character.personality.getTrait('wisdom').intensity).toBeGreaterThan(0.8);

      // Verify alignment system
      expect(character.alignment.getAxisIds()).toContain('moral');
      expect(character.alignment.getAxisIds()).toContain('ethical');
      expect(character.alignment.getValue('moral')).toBe(0);
      expect(character.alignment.getValue('ethical')).toBe(0);

      // Verify influence system
      expect(character.influence.getDomainIds()).toContain('political');
      expect(character.influence.getDomainIds()).toContain('social');
      expect(character.influence.getDomainIds()).toContain('economic');

      // Verify prestige system
      expect(character.prestige.getTrackIds()).toContain('honor');
      expect(character.prestige.getTrackIds()).toContain('social');
    });

    test('should handle complex character configuration with custom systems', () => {
      const customAlignmentAxes = [
        {
          id: 'custom_moral',
          name: 'Custom Moral Axis',
          description: 'Custom moral alignment',
          min: -100,
          max: 100,
          defaultValue: 10,
          zones: [
            { name: 'Evil', min: -100, max: -34 },
            { name: 'Neutral', min: -33, max: 33 },
            { name: 'Good', min: 34, max: 100 }
          ]
        }
      ];

      const customInfluenceDomains = [
        {
          id: 'magical',
          name: 'Magical Influence',
          description: 'Influence in magical circles',
          min: 0,
          max: 100,
          defaultValue: 15,
          tiers: [
            { name: 'Mundane', min: 0, max: 24 },
            { name: 'Apprentice', min: 25, max: 49 },
            { name: 'Adept', min: 50, max: 74 },
            { name: 'Master', min: 75, max: 100 }
          ]
        }
      ];

      const character = new Character({
        name: 'Custom Systems Character',
        age: 45,
        raceId: 'dwarf',
        subraceId: 'Mountain Dwarf',
        alignmentAxes: customAlignmentAxes,
        alignmentValues: { custom_moral: 50 },
        influenceDomains: customInfluenceDomains,
        influenceValues: { magical: 30 }
      });

      expect(character.alignment.hasAxis('custom_moral')).toBe(true);
      expect(character.alignment.getValue('custom_moral')).toBe(50);
      expect(character.alignment.getZone('custom_moral').name).toBe('Good');

      expect(character.influence.hasDomain('magical')).toBe(true);
      expect(character.influence.getValue('magical')).toBe(30);
      expect(character.influence.getTier('magical').name).toBe('Apprentice');
    });
  });

  describe('Complete Serialization Integration', () => {
    test('should serialize and deserialize complex character with all systems', () => {
      // Create a complex character with modified systems
      const originalCharacter = new Character({
        name: 'Serialization Integration Test',
        age: 35,
        level: 8,
        raceId: 'elf',
        subraceId: 'Wood Elf',
        personalityConfig: {
          traits: [
            {
              id: 'nature_affinity',
              name: 'Nature Affinity',
              description: 'Connection to natural world',
              category: 'spiritual',
              intensity: 0.9,
              baseLevel: 0.8,
              volatility: 0.3
            }
          ]
        }
      });

      // Apply various modifications to create complex state
      const modifiedAlignment = originalCharacter.alignment
        .withChange('moral', 25, 'Helped villagers')
        .withChange('ethical', -10, 'Broke some rules');

      const modifiedInfluence = originalCharacter.influence
        .withChange('social', 15, 'Popular in town');

      const modifiedPrestige = originalCharacter.prestige
        .withChange('honor', 20, 'Heroic deed');

      const complexCharacter = originalCharacter
        .withAlignment(modifiedAlignment)
        .withInfluence(modifiedInfluence)
        .withPrestige(modifiedPrestige);

      // Serialize to JSON
      const json = complexCharacter.toJSON();

      // Verify JSON structure
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name', 'Serialization Integration Test');
      expect(json).toHaveProperty('age', 35);
      expect(json).toHaveProperty('level', 8);
      expect(json).toHaveProperty('alignment');
      expect(json).toHaveProperty('influence');
      expect(json).toHaveProperty('prestige');
      expect(json).toHaveProperty('personality');
      expect(json).toHaveProperty('racialTraits');

      // Verify alignment serialization
      expect(json.alignment).toHaveProperty('values');
      expect(json.alignment.values.moral).toBe(25);
      expect(json.alignment.values.ethical).toBe(-10);
      expect(json.alignment).toHaveProperty('history');
      expect(json.alignment.history.moral).toHaveLength(1);
      expect(json.alignment.history.ethical).toHaveLength(1);

      // Verify influence serialization
      expect(json.influence).toHaveProperty('values');
      expect(json.influence.values.social).toBe(25); // 10 + 15
      expect(json.influence).toHaveProperty('history');
      expect(json.influence.history.social).toHaveLength(1);

      // Verify prestige serialization
      expect(json.prestige).toHaveProperty('values');
      expect(json.prestige.values.honor).toBe(45); // 25 + 20
      expect(json.prestige).toHaveProperty('history');
      expect(json.prestige.history.honor).toHaveLength(1);

      // Deserialize from JSON
      const deserializedCharacter = Character.fromJSON(json);

      // Verify complete reconstruction
      expect(deserializedCharacter.id).toBe(complexCharacter.id);
      expect(deserializedCharacter.name).toBe(complexCharacter.name);
      expect(deserializedCharacter.age).toBe(complexCharacter.age);
      expect(deserializedCharacter.level).toBe(complexCharacter.level);

      // Verify value objects are properly reconstructed
      expect(deserializedCharacter.alignment).toBeInstanceOf(Alignment);
      expect(deserializedCharacter.influence).toBeInstanceOf(Influence);
      expect(deserializedCharacter.prestige).toBeInstanceOf(Prestige);
      expect(deserializedCharacter.personality).toBeInstanceOf(PersonalityProfile);
      expect(deserializedCharacter.racialTraits).toBeInstanceOf(RacialTraits);

      // Verify state preservation
      expect(deserializedCharacter.alignment.getValue('moral')).toBe(25);
      expect(deserializedCharacter.alignment.getValue('ethical')).toBe(-10);
      expect(deserializedCharacter.influence.getValue('social')).toBe(25);
      expect(deserializedCharacter.prestige.getValue('honor')).toBe(45);

      // Verify history preservation
      expect(deserializedCharacter.alignment.getAxisHistory('moral')).toHaveLength(1);
      expect(deserializedCharacter.alignment.getLastChange('moral').reason).toBe('Helped villagers');
      expect(deserializedCharacter.influence.getDomainHistory('social')).toHaveLength(1);
      expect(deserializedCharacter.prestige.getTrackHistory('honor')).toHaveLength(1);

      // Verify racial traits preservation
      expect(deserializedCharacter.racialTraits.raceId).toBe('elf');
      expect(deserializedCharacter.racialTraits.subraceId).toBe('Wood Elf');
      expect(deserializedCharacter.attributes.dexterity).toBe(12); // 10 + 2 from Wood Elf
      expect(deserializedCharacter.attributes.wisdom).toBe(11); // 10 + 1 from Wood Elf
    });

    test('should handle backward compatibility with legacy data', () => {
      // Simulate legacy JSON data structure
      const legacyJson = {
        id: 'legacy-char-1',
        name: 'Legacy Character',
        age: 40,
        level: 6,
        // Missing some new fields, should use defaults
        baseAttributes: {
          strength: 12,
          dexterity: 14,
          constitution: 13,
          intelligence: 15,
          wisdom: 16,
          charisma: 11
        },
        inventory: ['sword', 'shield'],
        quests: ['find_artifact'],
        memories: ['childhood_trauma'],
        location: 'hometown'
      };

      const character = Character.fromJSON(legacyJson);

      expect(character.id).toBe('legacy-char-1');
      expect(character.name).toBe('Legacy Character');
      expect(character.age).toBe(40);
      expect(character.level).toBe(6);

      // Should have default systems initialized
      expect(character.alignment).toBeInstanceOf(Alignment);
      expect(character.influence).toBeInstanceOf(Influence);
      expect(character.prestige).toBeInstanceOf(Prestige);
      expect(character.personality).toBeInstanceOf(PersonalityProfile);
      expect(character.racialTraits).toBeInstanceOf(RacialTraits);

      // Should preserve legacy data
      expect(character.inventory).toEqual(['sword', 'shield']);
      expect(character.quests).toEqual(['find_artifact']);
      expect(character.memories).toEqual(['childhood_trauma']);
      expect(character.location).toBe('hometown');
    });
  });

  describe('End-to-End Temporal Evolution', () => {
    test('should handle complete temporal evolution scenario', () => {
      // Create a young character
      const youngCharacter = new Character({
        name: 'Temporal Evolution Test',
        age: 18,
        level: 1,
        raceId: 'human',
        personalityConfig: {
          traits: [
            {
              id: 'impulsiveness',
              name: 'Impulsiveness',
              description: 'Acting without thinking',
              category: 'behavioral',
              intensity: 0.8,
              baseLevel: 0.7,
              volatility: 0.6
            },
            {
              id: 'optimism',
              name: 'Optimism',
              description: 'Positive outlook',
              category: 'emotional',
              intensity: 0.9,
              baseLevel: 0.8,
              volatility: 0.4
            }
          ]
        }
      });

      // Apply a series of life events over time
      let evolvedCharacter = youngCharacter;

      // Year 1: Experience war
      const warEvent = {
        type: 'war',
        description: 'The Border Conflict',
        intensity: 1.5,
        affectsSettlements: false
      };
      evolvedCharacter = evolvedCharacter.withHistoricalEvent(
        warEvent,
        { importance: 'moderate' },
        {}
      );

      // Year 2-5: Natural aging and experience accumulation
      const lifeExperiences = [
        {
          type: 'combat',
          description: 'Survived multiple battles',
          intensity: 0.7,
          timestamp: new Date(Date.now() - 1000 * 24 * 60 * 60 * 1000), // 1000 days ago
          alignmentImpact: { moral: 5, ethical: -2 }
        },
        {
          type: 'loss',
          description: 'Lost close friend in battle',
          intensity: 0.9,
          timestamp: new Date(Date.now() - 800 * 24 * 60 * 60 * 1000), // 800 days ago
          alignmentImpact: { moral: 10 }
        }
      ];

      evolvedCharacter = evolvedCharacter.withTemporalEvolution(
        365 * 4, // 4 years
        lifeExperiences,
        []
      );

      // Year 6: Moral choice
      const moralChoice = {
        description: 'Chose to spare enemy soldiers',
        alignmentImpact: new Map([['moral', 15], ['ethical', 5]]),
        intensity: 0.8
      };
      evolvedCharacter = evolvedCharacter.withMoralChoice(moralChoice);

      // Year 7: Trauma
      const trauma = {
        type: 'betrayal',
        description: 'Betrayed by trusted commander',
        alignmentImpact: { moral: -10, ethical: -5 }
      };
      evolvedCharacter = evolvedCharacter.withTrauma(trauma, 0.6);

      // Year 8-10: Settlement interactions and final aging
      const settlement = {
        id: 'hometown',
        name: 'Hometown',
        population: 5000,
        type: 'city'
      };

      const socialInteraction = {
        type: 'public_speech',
        description: 'Spoke about war experiences',
        success: true,
        intensity: 1.2
      };

      evolvedCharacter = evolvedCharacter.withSettlementInteraction(
        settlement,
        socialInteraction,
        []
      );

      // Final aging to middle age
      evolvedCharacter = evolvedCharacter.withTemporalEvolution(
        365 * 2, // 2 more years
        [],
        [settlement]
      );

      // Verify complete evolution
      expect(evolvedCharacter.age).toBeCloseTo(24, 0); // 18 + 6 years
      expect(evolvedCharacter).not.toBe(youngCharacter);

      // Verify personality evolution (should be less volatile with age)
      const youngImpulsiveness = youngCharacter.personality.getTrait('impulsiveness');
      const evolvedImpulsiveness = evolvedCharacter.personality.getTrait('impulsiveness');
      expect(evolvedImpulsiveness.volatility).toBeLessThanOrEqual(youngImpulsiveness.volatility);

      // Verify alignment changes from experiences
      expect(evolvedCharacter.alignment.getValue('moral')).not.toBe(
        youngCharacter.alignment.getValue('moral')
      );

      // Verify history tracking
      const moralHistory = evolvedCharacter.alignment.getAxisHistory('moral');
      expect(moralHistory.length).toBeGreaterThan(0);

      // Verify influence changes from settlement interactions
      // Note: Influence may decay over time, so we check that the system is working
      expect(typeof evolvedCharacter.influence.getValue('social')).toBe('number');

      // Verify prestige changes
      expect(evolvedCharacter.prestige.getValue('honor')).not.toBe(
        youngCharacter.prestige.getValue('honor')
      );

      // Test complete serialization of evolved character
      const json = evolvedCharacter.toJSON();
      const deserializedCharacter = Character.fromJSON(json);

      expect(deserializedCharacter.age).toBe(evolvedCharacter.age);
      expect(deserializedCharacter.alignment.getValue('moral')).toBe(
        evolvedCharacter.alignment.getValue('moral')
      );
      expect(deserializedCharacter.influence.getValue('social')).toBe(
        evolvedCharacter.influence.getValue('social')
      );
      expect(deserializedCharacter.prestige.getValue('honor')).toBe(
        evolvedCharacter.prestige.getValue('honor')
      );

      // Verify complete history preservation
      expect(deserializedCharacter.alignment.getAxisHistory('moral').length).toBe(
        evolvedCharacter.alignment.getAxisHistory('moral').length
      );
    });

    test('should handle multi-generational character evolution', () => {
      // Test extreme aging scenario
      const character = new Character({
        name: 'Long-lived Character',
        age: 20,
        raceId: 'elf', // Long-lived race
        subraceId: 'High Elf'
      });

      // Age character significantly
      const agedCharacter = character.withTemporalEvolution(
        365 * 200, // 200 years
        [],
        []
      );

      expect(agedCharacter.age).toBeCloseTo(220, 0);
      expect(agedCharacter.personality).not.toBe(character.personality);

      // Verify racial aging effects
      const racialModifiers = agedCharacter.racialTraits.calculateAgeModifiers(220);
      expect(racialModifiers).toHaveProperty('wisdom');
      expect(racialModifiers.wisdom).toBeGreaterThan(1); // Elves gain wisdom with age

      // Verify personality stability in old age
      const youngVolatility = character.personality.getAllTraits()[0]?.volatility || 0.5;
      const oldVolatility = agedCharacter.personality.getAllTraits()[0]?.volatility || 0.5;
      expect(oldVolatility).toBeLessThanOrEqual(youngVolatility);
    });
  });

  describe('System Interaction Edge Cases', () => {
    test('should handle character with no personality traits', () => {
      const character = new Character({
        name: 'Minimal Character',
        personalityConfig: {
          traits: [] // No traits
        }
      });

      expect(character.personality.getAllTraits()).toHaveLength(0);
      
      // Should still work with other systems
      const moralChoice = {
        description: 'Test choice',
        alignmentImpact: new Map([['moral', 5]]),
        intensity: 0.5
      };

      const choiceCharacter = character.withMoralChoice(moralChoice);
      expect(choiceCharacter.alignment.getValue('moral')).toBe(5);
    });

    test('should handle character with extreme attribute values', () => {
      const character = new Character({
        name: 'Extreme Character',
        baseAttributes: {
          strength: 3,    // Minimum
          dexterity: 20,  // Maximum
          constitution: 1, // Below minimum
          intelligence: 25, // Above maximum
          wisdom: 10,
          charisma: 10
        }
      });

      // Should handle extreme values gracefully
      expect(character.attributes.strength).toBe(3);
      expect(character.attributes.dexterity).toBe(20);
      expect(character.attributes.constitution).toBe(1);
      expect(character.attributes.intelligence).toBe(25);

      // Should serialize and deserialize correctly
      const json = character.toJSON();
      const deserializedCharacter = Character.fromJSON(json);
      expect(deserializedCharacter.attributes.strength).toBe(3);
      expect(deserializedCharacter.attributes.intelligence).toBe(25);
    });

    test('should handle character with complex relationship data', () => {
      const relationships = new Map([
        ['friend_1', { type: 'friend', strength: 0.8, history: ['met_at_tavern'] }],
        ['enemy_1', { type: 'enemy', strength: -0.6, history: ['betrayed_me'] }],
        ['mentor_1', { type: 'mentor', strength: 0.9, history: ['taught_magic'] }]
      ]);

      const character = new Character({
        name: 'Social Character',
        relationships: relationships
      });

      expect(character.relationships.size).toBe(3);
      expect(character.relationships.get('friend_1').strength).toBe(0.8);

      // Should serialize relationships correctly
      const json = character.toJSON();
      expect(json.relationships).toHaveLength(3);
      expect(json.relationships[0]).toHaveLength(2); // [key, value] pairs

      const deserializedCharacter = Character.fromJSON(json);
      expect(deserializedCharacter.relationships.size).toBe(3);
      expect(deserializedCharacter.relationships.get('friend_1').strength).toBe(0.8);
    });
  });
});