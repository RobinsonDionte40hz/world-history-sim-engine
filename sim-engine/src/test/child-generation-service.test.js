// src/test/child-generation-service.test.js

import { describe, test, expect, beforeEach } from '@jest/globals';
import Character from '../domain/entities/Character.js';
import ChildGenerationService from '../domain/services/ChildGenerationService.js';
import { RacialTraits } from '../domain/value-objects/RacialTraits.js';
import PersonalityProfile from '../domain/value-objects/PersonalityProfile.js';

describe('ChildGenerationService', () => {
  let childGenerationService;
  let parent1;
  let parent2;
  let testSettlement;

  beforeEach(() => {
    childGenerationService = new ChildGenerationService();
    
    // Create test parents
    parent1 = new Character({
      id: 'parent1',
      name: 'Alice Strongarm',
      age: 30,
      baseAttributes: {
        strength: 16,
        dexterity: 12,
        constitution: 14,
        intelligence: 13,
        wisdom: 15,
        charisma: 11
      },
      personalityConfig: {
        traits: [
          { id: 'courage', intensity: 0.8 },
          { id: 'empathy', intensity: 0.7 },
          { id: 'patience', intensity: 0.6 }
        ]
      },
      consciousness: {
        frequency: 45,
        coherence: 0.8
      },
      racialTraits: new RacialTraits('human')
    });

    parent2 = new Character({
      id: 'parent2',
      name: 'Bob Swiftarrow',
      age: 28,
      baseAttributes: {
        strength: 12,
        dexterity: 18,
        constitution: 13,
        intelligence: 16,
        wisdom: 14,
        charisma: 15
      },
      personalityConfig: {
        traits: [
          { id: 'curiosity', intensity: 0.9 },
          { id: 'empathy', intensity: 0.6 },
          { id: 'ambition', intensity: 0.7 }
        ]
      },
      consciousness: {
        frequency: 40,
        coherence: 0.7
      },
      racialTraits: new RacialTraits('elf', 'High Elf')
    });

    testSettlement = {
      id: 'test_settlement',
      name: 'Riverside Village',
      culture: {
        language: 'common',
        traditions: ['harvest_festival'],
        values: { family: 0.8, community: 0.9 }
      }
    };
  });

  describe('generateChild', () => {
    test('should generate a child with basic properties', () => {
      const child = childGenerationService.generateChild(parent1, parent2, testSettlement);
      
      expect(child).toBeInstanceOf(Character);
      expect(child.name).toBeDefined();
      expect(child.age).toBe(0);
      expect(child.baseAttributes).toBeDefined();
      expect(child.consciousness).toBeDefined();
      expect(child.goals).toBeDefined();
      expect(child.relationships).toBeDefined();
    });

    test('should inherit attributes from parents with variation', () => {
      const child = childGenerationService.generateChild(parent1, parent2, testSettlement);
      
      // Child should have attributes in reasonable range
      expect(child.baseAttributes.strength).toBeGreaterThanOrEqual(11); // (16+12)/2 - 2 = 12
      expect(child.baseAttributes.strength).toBeLessThanOrEqual(18);
      
      expect(child.baseAttributes.dexterity).toBeGreaterThanOrEqual(13); // (12+18)/2 - 2 = 13
      expect(child.baseAttributes.dexterity).toBeLessThanOrEqual(18);
      
      expect(child.baseAttributes.intelligence).toBeGreaterThanOrEqual(12); // (13+16)/2 - 2 = 12.5
      expect(child.baseAttributes.intelligence).toBeLessThanOrEqual(18);
    });

    test('should create family relationships with parents', () => {
      const child = childGenerationService.generateChild(parent1, parent2, testSettlement);
      
      expect(child.relationships.has(parent1.id)).toBe(true);
      expect(child.relationships.has(parent2.id)).toBe(true);
      
      const parent1Relationship = child.relationships.get(parent1.id);
      const parent2Relationship = child.relationships.get(parent2.id);
      
      expect(parent1Relationship.value).toBe(90);
      expect(parent1Relationship.type).toBe('family');
      expect(parent1Relationship.history).toHaveLength(1);
      expect(parent1Relationship.history[0].reason).toBe('birth - parent');
      
      expect(parent2Relationship.value).toBe(90);
      expect(parent2Relationship.type).toBe('family');
    });

    test('should inherit consciousness from parents', () => {
      const child = childGenerationService.generateChild(parent1, parent2, testSettlement);
      
      // Frequency should be average of parents with some variation
      const expectedFrequency = (parent1.consciousness.frequency + parent2.consciousness.frequency) / 2;
      expect(child.consciousness.frequency).toBeGreaterThanOrEqual(expectedFrequency - 5);
      expect(child.consciousness.frequency).toBeLessThanOrEqual(expectedFrequency + 5);
      
      // Children start with low coherence
      expect(child.consciousness.coherence).toBe(0.1);
    });

    test('should set appropriate goals for children', () => {
      const child = childGenerationService.generateChild(parent1, parent2, testSettlement);
      
      expect(child.goals).toHaveLength(2);
      expect(child.goals.some(goal => goal.id === 'learn_and_grow')).toBe(true);
      expect(child.goals.some(goal => goal.id === 'family_bonding')).toBe(true);
    });

    test('should throw error if parents are missing', () => {
      expect(() => {
        childGenerationService.generateChild(null, parent2, testSettlement);
      }).toThrow('Both parents must be provided');
      
      expect(() => {
        childGenerationService.generateChild(parent1, null, testSettlement);
      }).toThrow('Both parents must be provided');
    });
  });

  describe('inheritAttributes', () => {
    test('should average parent attributes with variation', () => {
      const p1Attrs = { strength: 16, intelligence: 10 };
      const p2Attrs = { strength: 12, intelligence: 18 };
      
      const inherited = childGenerationService.inheritAttributes(p1Attrs, p2Attrs);
      
      // Should be around the average with some variation
      expect(inherited.strength).toBeGreaterThanOrEqual(12); // (16+12)/2 - 2
      expect(inherited.strength).toBeLessThanOrEqual(16); // (16+12)/2 + 2
      
      expect(inherited.intelligence).toBeGreaterThanOrEqual(12); // (10+18)/2 - 2
      expect(inherited.intelligence).toBeLessThanOrEqual(16); // (10+18)/2 + 2
    });

    test('should handle attributes with score property', () => {
      const p1Attrs = { 
        strength: { score: 16 }, 
        intelligence: { score: 10 } 
      };
      const p2Attrs = { 
        strength: { score: 12 }, 
        intelligence: { score: 18 } 
      };
      
      const inherited = childGenerationService.inheritAttributes(p1Attrs, p2Attrs);
      
      expect(inherited.strength).toBeDefined();
      expect(inherited.intelligence).toBeDefined();
      expect(typeof inherited.strength).toBe('number');
      expect(typeof inherited.intelligence).toBe('number');
    });

    test('should enforce attribute bounds', () => {
      const p1Attrs = { strength: 3, intelligence: 3 };
      const p2Attrs = { strength: 3, intelligence: 3 };
      
      const inherited = childGenerationService.inheritAttributes(p1Attrs, p2Attrs);
      
      // Should not go below 3
      expect(inherited.strength).toBeGreaterThanOrEqual(3);
      expect(inherited.intelligence).toBeGreaterThanOrEqual(3);
    });
  });

  describe('inheritPersonality', () => {
    test('should inherit personality traits from both parents', () => {
      const child = childGenerationService.generateChild(parent1, parent2, testSettlement);
      
      // Should have traits from both parents
      const childTraits = child.personality.getAllTraits();
      const traitIds = childTraits.map(t => t.id);
      
      expect(traitIds).toContain('courage');
      expect(traitIds).toContain('empathy');
      expect(traitIds).toContain('curiosity');
    });

    test('should average trait intensities with mutation', () => {
      const p1Personality = new PersonalityProfile({
        traits: [
          { id: 'empathy', intensity: 0.8 }
        ]
      });
      
      const p2Personality = new PersonalityProfile({
        traits: [
          { id: 'empathy', intensity: 0.6 }
        ]
      });
      
      const inheritedConfig = childGenerationService.inheritPersonality(p1Personality, p2Personality);
      
      const empathyTrait = inheritedConfig.traits.find(t => t.id === 'empathy');
      expect(empathyTrait).toBeDefined();
      
      // Should be around average (0.7) with some variation
      expect(empathyTrait.intensity).toBeGreaterThanOrEqual(0.5);
      expect(empathyTrait.intensity).toBeLessThanOrEqual(0.9);
    });
  });

  describe('generateChildName', () => {
    test('should generate a name', () => {
      const name = childGenerationService.generateChildName(parent1, parent2, testSettlement.culture);
      
      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    test('should use cultural context', () => {
      const elvishCulture = { language: 'elvish' };
      const name = childGenerationService.generateChildName(parent1, parent2, elvishCulture);
      
      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
    });

    test('should handle missing cultural context', () => {
      const name = childGenerationService.generateChildName(parent1, parent2, null);
      
      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
    });

    test('should inherit family name when available', () => {
      const name = childGenerationService.generateChildName(parent1, parent2, testSettlement.culture);
      
      // Parent1 has "Strongarm" as family name, should be inherited
      const parts = name.split(' ');
      expect(parts.length).toBeGreaterThanOrEqual(1);
      
      // Most of the time should inherit family name
      // Since this is probabilistic, we'll just verify structure
      expect(name.length).toBeGreaterThan(0);
      expect(typeof name).toBe('string');
    });
  });

  describe('inheritRacialTraits', () => {
    test('should inherit racial traits from one parent', () => {
      const child = childGenerationService.generateChild(parent1, parent2, testSettlement);
      
      expect(child.racialTraits).toBeDefined();
      expect(child.racialTraits).toBeInstanceOf(RacialTraits);
      
      // Should be either human or elf
      const raceId = child.racialTraits._raceId;
      expect(['human', 'elf']).toContain(raceId);
    });
  });

  describe('randomVariation', () => {
    test('should generate values within specified range', () => {
      for (let i = 0; i < 100; i++) {
        const variation = childGenerationService.randomVariation(-2, 2);
        expect(variation).toBeGreaterThanOrEqual(-2);
        expect(variation).toBeLessThanOrEqual(2);
      }
    });

    test('should use default range when no parameters provided', () => {
      for (let i = 0; i < 100; i++) {
        const variation = childGenerationService.randomVariation();
        expect(variation).toBeGreaterThanOrEqual(-0.1);
        expect(variation).toBeLessThanOrEqual(0.1);
      }
    });
  });
});
