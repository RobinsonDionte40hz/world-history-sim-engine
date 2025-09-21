/**
 * Valley of Echoes Attributes Integration Test
 *
 * Tests that Valley of Echoes characters have properly initialized attributes
 * that correctly affect decision making and interaction resolution.
 */

import DemoService from '../../application/services/DemoService.js';
import InteractionResolver from '../../domain/services/InteractionResolver.js';
import Attributes from '../../domain/value-objects/Attributes.js';
import Character from '../../domain/entities/Character.js';

describe('Valley of Echoes Attributes Integration', () => {
  let demoWorld;
  let interactionResolver;
  let heroCharacters;

  beforeAll(() => {
    // Generate the Valley of Echoes demo world
    demoWorld = DemoService.generateDemoWorld('valley_of_echoes_demo');
    interactionResolver = new InteractionResolver();

    // Extract hero characters for testing (demoWorld.characters is a Map)
    heroCharacters = Array.from(demoWorld.characters.values()).filter(char => char.lodTier === 'hero');
  });

  describe('Character Attribute Initialization', () => {
    test('should have hero characters with proper names', () => {
      const expectedNames = [
        'Elara Voss',
        'Marcus Hale', 
        'Gwenith Stone',
        'Thaddeus Iron',
        'Lord Garret Ironfist',
        'Helena Forgeheart',
        'Drake Deepvein',
        'Captain Thorne'
      ];

      const actualNames = heroCharacters.map(char => char.name).sort();
      expectedNames.sort();

      expect(actualNames).toEqual(expectedNames);
    });

    test('should convert plain attribute objects to Attributes instances', () => {
      heroCharacters.forEach(character => {
        expect(character.attributes).toBeDefined();
        expect(character.attributes).toBeInstanceOf(Attributes);
        expect(typeof character.attributes.getTotalModifier).toBe('function');
      });
    });

    test('should have valid attribute scores for Elara Voss', () => {
      const elara = heroCharacters.find(char => char.name === 'Elara Voss');
      expect(elara).toBeDefined();

      // Check that attributes are properly initialized
      expect(elara.attributes.strength.score).toBe(12);
      expect(elara.attributes.dexterity.score).toBe(14);
      expect(elara.attributes.constitution.score).toBe(13);
      expect(elara.attributes.intelligence.score).toBe(16);
      expect(elara.attributes.wisdom.score).toBe(17);
      expect(elara.attributes.charisma.score).toBe(18);

      // Check that modifiers are calculated correctly
      expect(elara.attributes.getTotalModifier('strength')).toBe(1); // +1
      expect(elara.attributes.getTotalModifier('dexterity')).toBe(2); // +2
      expect(elara.attributes.getTotalModifier('constitution')).toBe(1); // +1
      expect(elara.attributes.getTotalModifier('intelligence')).toBe(3); // +3
      expect(elara.attributes.getTotalModifier('wisdom')).toBe(3); // +3
      expect(elara.attributes.getTotalModifier('charisma')).toBe(4); // +4
    });

    test('should have valid attribute scores for Marcus Hale', () => {
      const marcus = heroCharacters.find(char => char.name === 'Marcus Hale');
      expect(marcus).toBeDefined();

      // Check that attributes are properly initialized
      expect(marcus.attributes.strength.score).toBe(14);
      expect(marcus.attributes.dexterity.score).toBe(15);
      expect(marcus.attributes.constitution.score).toBe(14);
      expect(marcus.attributes.intelligence.score).toBe(15);
      expect(marcus.attributes.wisdom.score).toBe(13);
      expect(marcus.attributes.charisma.score).toBe(17);

      // Check that modifiers are calculated correctly
      expect(marcus.attributes.getTotalModifier('strength')).toBe(2); // +2
      expect(marcus.attributes.getTotalModifier('dexterity')).toBe(2); // +2
      expect(marcus.attributes.getTotalModifier('constitution')).toBe(2); // +2
      expect(marcus.attributes.getTotalModifier('intelligence')).toBe(2); // +2
      expect(marcus.attributes.getTotalModifier('wisdom')).toBe(1); // +1
      expect(marcus.attributes.getTotalModifier('charisma')).toBe(3); // +3
    });

    test('should have valid attribute scores for Gwenith Stone', () => {
      const gwenith = heroCharacters.find(char => char.name === 'Gwenith Stone');
      expect(gwenith).toBeDefined();

      // Check that attributes are properly initialized
      expect(gwenith.attributes.strength.score).toBe(16);
      expect(gwenith.attributes.dexterity.score).toBe(13);
      expect(gwenith.attributes.constitution.score).toBe(17);
      expect(gwenith.attributes.intelligence.score).toBe(12);
      expect(gwenith.attributes.wisdom.score).toBe(15);
      expect(gwenith.attributes.charisma.score).toBe(14);

      // Check that modifiers are calculated correctly
      expect(gwenith.attributes.getTotalModifier('strength')).toBe(3); // +3
      expect(gwenith.attributes.getTotalModifier('dexterity')).toBe(1); // +1
      expect(gwenith.attributes.getTotalModifier('constitution')).toBe(3); // +3
      expect(gwenith.attributes.getTotalModifier('intelligence')).toBe(1); // +1
      expect(gwenith.attributes.getTotalModifier('wisdom')).toBe(2); // +2
      expect(gwenith.attributes.getTotalModifier('charisma')).toBe(2); // +2
    });

    test('should have valid attribute scores for Thaddeus Iron', () => {
      const thaddeus = heroCharacters.find(char => char.name === 'Thaddeus Iron');
      expect(thaddeus).toBeDefined();

      // Check that attributes are properly initialized
      expect(thaddeus.attributes.strength.score).toBe(15);
      expect(thaddeus.attributes.dexterity.score).toBe(17);
      expect(thaddeus.attributes.constitution.score).toBe(14);
      expect(thaddeus.attributes.intelligence.score).toBe(14);
      expect(thaddeus.attributes.wisdom.score).toBe(13);
      expect(thaddeus.attributes.charisma.score).toBe(15);

      // Check that modifiers are calculated correctly
      expect(thaddeus.attributes.getTotalModifier('strength')).toBe(2); // +2
      expect(thaddeus.attributes.getTotalModifier('dexterity')).toBe(3); // +3
      expect(thaddeus.attributes.getTotalModifier('constitution')).toBe(2); // +2
      expect(thaddeus.attributes.getTotalModifier('intelligence')).toBe(2); // +2
      expect(thaddeus.attributes.getTotalModifier('wisdom')).toBe(1); // +1
      expect(thaddeus.attributes.getTotalModifier('charisma')).toBe(2); // +2
    });
  });

  describe('Attribute Impact on Decision Making', () => {
    let mockInteraction;

    beforeEach(() => {
      // Create a mock interaction that requires charisma
      mockInteraction = {
        id: 'test_interaction',
        name: 'Test Social Interaction',
        type: 'social',
        isContentInteraction: true,
        isAvailable: () => true,
        meetsRequirements: () => true,
        branches: [{
          id: 'success_branch',
          requirements: { attr: 'charisma', dc: 12 },
          text: 'Success!'
        }],
        selectBranch: () => mockInteraction.branches[0],
        effects: [],
        applyEffect: () => {}, // Mock apply effect method
        markUsed: () => {} // Mock mark used method
      };
    });

    test('should use attribute modifiers in interaction resolution for Elara Voss', () => {
      const elara = heroCharacters.find(char => char.name === 'Elara Voss');
      expect(elara).toBeDefined();

      // Mock Math.random to return 0.5 for consistent testing
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.5);

      try {
        const result = interactionResolver.resolve(elara, mockInteraction, 'success_branch');

        // With charisma modifier of +4 and d20 roll of 11 (0.5 * 20 + 1),
        // total should be 11 + 4 = 15, which beats DC 12
        expect(result.success).toBe(true);
        expect(result.roll).toBe(11); // d20 roll (0.5 * 20 + 1 = 11)
        expect(result.dc).toBe(12);
      } finally {
        Math.random = originalRandom;
      }
    });

    test('should use attribute modifiers in interaction resolution for Marcus Hale', () => {
      const marcus = heroCharacters.find(char => char.name === 'Marcus Hale');
      expect(marcus).toBeDefined();

      // Mock Math.random to return 0.5 for consistent testing
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.5);

      try {
        const result = interactionResolver.resolve(marcus, mockInteraction, 'success_branch');

        // With charisma modifier of +3 and d20 roll of 11,
        // total should be 11 + 3 = 14, which beats DC 12
        expect(result.success).toBe(true);
        expect(result.roll).toBe(11);
        expect(result.dc).toBe(12);
      } finally {
        Math.random = originalRandom;
      }
    });

    test('should handle characters with low attribute modifiers', () => {
      // Create a character with low charisma for testing
      const lowCharismaChar = new Character({
        id: 'test_low_charisma',
        name: 'Test Low Charisma',
        attributes: {
          strength: { score: 8, modifier: -1 },
          dexterity: { score: 8, modifier: -1 },
          constitution: { score: 8, modifier: -1 },
          intelligence: { score: 8, modifier: -1 },
          wisdom: { score: 8, modifier: -1 },
          charisma: { score: 8, modifier: -1 }
        }
      });

      // Mock Math.random to return 0.1 (low roll)
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1);

      try {
        const result = interactionResolver.resolve(lowCharismaChar, mockInteraction, 'success_branch');

        // With charisma modifier of -1 and d20 roll of 3 (0.1 * 20 + 1 = 3),
        // total should be 3 + (-1) = 2, which fails DC 12
        expect(result.success).toBe(false);
        expect(result.roll).toBe(3);
        expect(result.dc).toBe(12);
      } finally {
        Math.random = originalRandom;
      }
    });

    test('should properly handle undefined attributes with fallback', () => {
      // Create a character with undefined attributes to test fallback
      const noAttributesChar = {
        id: 'test_no_attributes',
        name: 'Test No Attributes',
        lodTier: 'hero',
        personality: { aggression: 0.5 }
      };

      // Mock Math.random to return 0.5
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.5);

      try {
        const result = interactionResolver.resolve(noAttributesChar, mockInteraction, 'success_branch');

        // Should use default modifier of 0
        expect(result.success).toBe(false); // 11 + 0 = 11, which fails DC 12
        expect(result.roll).toBe(11);
        expect(result.dc).toBe(12);
      } finally {
        Math.random = originalRandom;
      }
    });
  });

  describe('Character Serialization and Deserialization', () => {
    test('should properly serialize and deserialize character attributes', () => {
      const elara = heroCharacters.find(char => char.name === 'Elara Voss');
      expect(elara).toBeDefined();

      // Serialize the character
      const serialized = elara.toJSON();

      // Deserialize the character
      const deserialized = Character.fromJSON(serialized);

      // Check that attributes are preserved
      expect(deserialized.attributes).toBeInstanceOf(Attributes);
      expect(deserialized.attributes.getTotalModifier('charisma')).toBe(4);
      expect(deserialized.attributes.getTotalModifier('intelligence')).toBe(3);
      expect(deserialized.attributes.getTotalModifier('wisdom')).toBe(3);
    });

    test('should maintain attribute functionality after world preparation', () => {
      // This test ensures that even after the world preparation process,
      // character attributes remain functional
      heroCharacters.forEach(character => {
        expect(character.attributes.getTotalModifier).toBeDefined();
        expect(typeof character.attributes.getTotalModifier('strength')).toBe('number');
        expect(typeof character.attributes.getTotalModifier('charisma')).toBe('number');
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    let mockInteraction;

    beforeEach(() => {
      // Create a mock interaction that requires charisma
      mockInteraction = {
        id: 'test_interaction',
        name: 'Test Social Interaction',
        type: 'social',
        isContentInteraction: true,
        isAvailable: () => true,
        meetsRequirements: () => true,
        branches: [{
          id: 'success_branch',
          requirements: { attr: 'charisma', dc: 12 },
          text: 'Success!'
        }],
        selectBranch: () => mockInteraction.branches[0],
        effects: [],
        applyEffect: () => {}, // Mock apply effect method
        markUsed: () => {} // Mock mark used method
      };
    });

    test('should handle all hero characters efficiently', () => {
      const startTime = Date.now();

      heroCharacters.forEach(character => {
        // Test that each character can resolve an interaction without errors
        const result = interactionResolver.resolve(character, mockInteraction, 'success_branch');
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('roll');
        expect(result).toHaveProperty('dc');
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1 second for 8 characters)
      expect(duration).toBeLessThan(1000);
    });

    test('should handle missing consciousness gracefully', () => {
      const characterWithoutConsciousness = heroCharacters.find(char => char.name === 'Elara Voss');

      // Remove consciousness to test fallback
      const charWithoutConsciousness = {
        ...characterWithoutConsciousness,
        consciousness: undefined
      };

      // Should not throw an error
      expect(() => {
        interactionResolver.resolve(charWithoutConsciousness, mockInteraction, 'success_branch');
      }).not.toThrow();
    });
  });
});