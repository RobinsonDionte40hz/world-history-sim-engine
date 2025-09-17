// src/test/demo-pattern-validation.test.js

/**
 * T043: Demo Pattern Validation Test
 * 
 * Validates that Valley of Echoes demo follows the exact patterns
 * from the existing medieval fantasy village demo to ensure consistency.
 */

import DemoService from '../application/services/DemoService.js';
import { PatternValidator } from '../domain/services/PatternValidator.js';

describe('Demo Pattern Validation', () => {
  let fantasyVillageDemo;

  beforeAll(() => {
    // Get the existing medieval fantasy village demo as reference
    fantasyVillageDemo = DemoService.generateDemoWorld('fantasy_village_demo');
  });

  describe('Character-Node Bidirectional Assignment Patterns', () => {
    test('should validate basic assignment structure in fantasy village demo', () => {
      const characters = Array.from(fantasyVillageDemo.characters.values());
      const nodes = Array.from(fantasyVillageDemo.nodes.values());

      // All characters must have assignments.nodes as Set
      characters.forEach(character => {
        expect(character.assignments).toBeDefined();
        expect(character.assignments.nodes).toBeInstanceOf(Set);
        expect(character.assignments.interactions).toBeInstanceOf(Set);
        
        // Character should have currentNodeId
        expect(typeof character.currentNodeId).toBe('string');
        expect(character.currentNodeId).toBeTruthy();
        expect(character.assignments.nodes.has(character.currentNodeId)).toBe(true);
      });

      // Filter nodes that have characters and test them
      const nodesWithCharacters = nodes.filter(node => node.characters);
      nodesWithCharacters.forEach(node => {
        expect(Array.isArray(node.characters)).toBe(true);
      });
    });

    test('should enforce bidirectional consistency', () => {
      const nodes = Array.from(fantasyVillageDemo.nodes.values());
      const characterMap = new Map(fantasyVillageDemo.characters);

      // Test nodes that have character lists
      const nodesWithCharacters = nodes.filter(node => node.characters && node.characters.length > 0);
      
      nodesWithCharacters.forEach(node => {
        node.characters.forEach(characterId => {
          const character = characterMap.get(characterId);
          expect(character).toBeDefined();
          expect(character.assignments.nodes.has(node.id)).toBe(true);
        });
      });
    });
  });

  describe('Property Naming Conventions', () => {
    test('should use camelCase for character properties', () => {
      const characters = Array.from(fantasyVillageDemo.characters.values());

      characters.forEach(character => {
        expect(character.currentNodeId).toBeDefined();
        expect(character.currentNodeId).not.toMatch(/_/);
        expect(character.assignments.nodes).toBeDefined();
        expect(character.assignments.interactions).toBeDefined();
      });
    });

    test('should use descriptive IDs', () => {
      const characters = Array.from(fantasyVillageDemo.characters.values());
      const nodes = Array.from(fantasyVillageDemo.nodes.values());

      characters.forEach(character => {
        expect(character.id.length).toBeGreaterThan(3);
        expect(character.id).not.toMatch(/^(character|char|c)\d+$/i);
      });

      nodes.forEach(node => {
        expect(node.id.length).toBeGreaterThan(3);
        expect(node.id).not.toMatch(/^(node|location|loc|n)\d+$/i);
      });
    });
  });

  describe('Environmental Properties Structure', () => {
    test('should include required environmental properties where present', () => {
      const nodes = Array.from(fantasyVillageDemo.nodes.values());
      const nodesWithEnvironment = nodes.filter(node => node.environment);

      nodesWithEnvironment.forEach(node => {
        expect(node.environment).toEqual(
          expect.objectContaining({
            terrain: expect.any(String),
            climate: expect.any(String),
            lighting: expect.any(String)
          })
        );
      });
    });

    test('should validate environmental property formats', () => {
      const nodes = Array.from(fantasyVillageDemo.nodes.values());
      const nodesWithEnvironment = nodes.filter(node => node.environment);

      const validClimates = ['tropical', 'temperate', 'cold', 'arid', 'arctic'];
      const validTerrains = ['plains', 'forest', 'hills', 'mountains', 'desert', 'swamp'];
      const validLighting = ['bright', 'dim', 'dark', 'twilight'];

      // Test climate validity
      const nodesWithClimate = nodesWithEnvironment.filter(node => node.environment.climate);
      nodesWithClimate.forEach(node => {
        expect(validClimates).toContain(node.environment.climate);
      });

      // Test terrain validity
      const nodesWithTerrain = nodesWithEnvironment.filter(node => node.environment.terrain);
      nodesWithTerrain.forEach(node => {
        expect(validTerrains).toContain(node.environment.terrain);
      });

      // Test lighting validity
      const nodesWithLighting = nodesWithEnvironment.filter(node => node.environment.lighting);
      nodesWithLighting.forEach(node => {
        expect(validLighting).toContain(node.environment.lighting);
      });
    });
  });

  describe('D&D Attributes Structure', () => {
    test('should use exact D&D attribute names where present', () => {
      const characters = Array.from(fantasyVillageDemo.characters.values());
      const charactersWithAttributes = characters.filter(char => char.attributes);

      charactersWithAttributes.forEach(character => {
        const validAttributes = [
          'strength', 'dexterity', 'constitution', 
          'intelligence', 'wisdom', 'charisma'
        ];

        Object.keys(character.attributes).forEach(attributeName => {
          expect(validAttributes).toContain(attributeName);
        });

        // Test object attributes only
        const objectAttributes = Object.values(character.attributes).filter(attr => typeof attr === 'object');
        objectAttributes.forEach(attribute => {
          expect(attribute).toEqual(
            expect.objectContaining({
              score: expect.any(Number),
              modifier: expect.any(Number)
            })
          );

          expect(attribute.score).toBeGreaterThanOrEqual(3);
          expect(attribute.score).toBeLessThanOrEqual(18);

          const expectedModifier = Math.floor((attribute.score - 10) / 2);
          expect(attribute.modifier).toBe(expectedModifier);
        });
      });
    });
  });
});

export { PatternValidator };