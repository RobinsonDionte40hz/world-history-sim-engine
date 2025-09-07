// src/test/settlement-family-service-simple.test.js

import { describe, test, expect, beforeEach } from '@jest/globals';
import Character from '../domain/entities/Character.js';
import SettlementFamilyService from '../domain/services/SettlementFamilyService.js';
import { RacialTraits } from '../domain/value-objects/RacialTraits.js';

describe('SettlementFamilyService - Simplified Tests', () => {
  let settlementFamilyService;
  let mockSettlement;
  let testCharacters;

  beforeEach(() => {
    // Create service without WorldBuilder for testing
    settlementFamilyService = new SettlementFamilyService(null);
    
    // Create test characters
    testCharacters = createTestCharacters();
    
    // Create mock settlement with simulated character data
    mockSettlement = {
      id: 'test_settlement',
      name: 'Test Village',
      population: { total: testCharacters.length },
      assignedCharacters: testCharacters.map(c => c.id),
      resources: {
        amounts: { food: 120, water: 150, materials: 80 }
      },
      government: {
        type: 'council',
        laws: [{ id: 'marriage_law', description: 'Marriage regulations' }]
      },
      economy: {
        averageWealth: 200,
        averageIncome: 60
      },
      culture: {
        language: 'common',
        values: { family: 0.8 }
      },
      socialFactors: {
        happiness: 75
      },
      history: []
    };

    // Mock getSettlementCharacters method to return our test characters
    settlementFamilyService.getSettlementCharacters = () => testCharacters;
  });

  describe('Core Functionality', () => {
    test('should process family formation without errors', () => {
      const results = settlementFamilyService.processFamilyFormation(
        mockSettlement, 
        1
      );

      expect(results).toHaveProperty('marriages');
      expect(results).toHaveProperty('births');
      expect(results).toHaveProperty('populationGrowth');
      expect(results).toHaveProperty('newPopulation');
      expect(Array.isArray(results.marriages)).toBe(true);
      expect(Array.isArray(results.births)).toBe(true);
      expect(typeof results.populationGrowth).toBe('number');
    });

    test('should handle empty settlement', () => {
      const emptySettlement = {
        ...mockSettlement,
        assignedCharacters: [],
        population: { total: 0 }
      };

      // Override to return empty array
      settlementFamilyService.getSettlementCharacters = () => [];

      const results = settlementFamilyService.processFamilyFormation(
        emptySettlement, 
        1
      );

      expect(results.marriages).toHaveLength(0);
      expect(results.births).toHaveLength(0);
      expect(results.populationGrowth).toBe(0);
    });

    test('should throw error for invalid settlement', () => {
      expect(() => {
        settlementFamilyService.processFamilyFormation(null, 1);
      }).toThrow();

      expect(() => {
        settlementFamilyService.processFamilyFormation({}, 1);
      }).toThrow('Settlement must have assignedCharacters array');
    });
  });

  describe('Helper Methods', () => {
    test('getEligibleSingles should return eligible single characters', () => {
      const eligibleSingles = settlementFamilyService.getEligibleSingles(testCharacters, 18);
      
      expect(Array.isArray(eligibleSingles)).toBe(true);
      eligibleSingles.forEach(char => {
        expect(char.age).toBeGreaterThanOrEqual(18);
        expect(char.relationshipStatus || 'single').toBe('single');
        expect(char.health).toBeGreaterThan(50);
      });
    });

    test('isValidPartnerMatch should validate partner compatibility', () => {
      const char1 = testCharacters[0];
      const char2 = testCharacters[1];
      
      const isValid = settlementFamilyService.isValidPartnerMatch(char1, char2);
      expect(typeof isValid).toBe('boolean');
    });

    test('should record historical events correctly', () => {
      const initialHistoryLength = mockSettlement.history.length;
      
      settlementFamilyService.recordHistoricalEvent(
        'marriage',
        { partner1: testCharacters[0], partner2: testCharacters[1] },
        mockSettlement,
        1
      );

      expect(mockSettlement.history.length).toBe(initialHistoryLength + 1);
      expect(mockSettlement.history[mockSettlement.history.length - 1].type).toBe('marriage');
    });

    test('getFamilyFormationStats should calculate statistics', () => {
      // Add some test events to history
      mockSettlement.history = [
        { type: 'marriage', turn: 1 },
        { type: 'birth', turn: 1 },
        { type: 'marriage', turn: 2 }
      ];

      const stats = settlementFamilyService.getFamilyFormationStats(mockSettlement, 5);
      
      expect(stats).toHaveProperty('totalMarriages');
      expect(stats).toHaveProperty('totalBirths');
      expect(stats).toHaveProperty('marriageRate');
      expect(stats).toHaveProperty('birthRate');
      expect(stats.totalMarriages).toBe(2);
      expect(stats.totalBirths).toBe(1);
    });
  });

  describe('Marriage Processing', () => {
    test('should process marriage decisions for eligible singles', () => {
      const eligibleSingles = settlementFamilyService.getEligibleSingles(testCharacters, 18);
      const marriages = settlementFamilyService.processMarriageDecisions(
        eligibleSingles,
        mockSettlement,
        { marriageRate: 0.5 }
      );

      expect(Array.isArray(marriages)).toBe(true);
      marriages.forEach(marriage => {
        expect(marriage).toHaveProperty('partner1');
        expect(marriage).toHaveProperty('partner2');
        expect(marriage).toHaveProperty('compatibility');
      });
    });

    test('formalizeMarriage should update character status', () => {
      const char1 = testCharacters[0];
      const char2 = testCharacters[1];
      
      settlementFamilyService.formalizeMarriage(char1, char2, mockSettlement);
      
      expect(char1.relationshipStatus).toBe('married');
      expect(char2.relationshipStatus).toBe('married');
    });
  });

  describe('Procreation Processing', () => {
    test('should process procreation decisions for married couples', () => {
      // Set up some married couples
      testCharacters[0].relationshipStatus = 'married';
      testCharacters[1].relationshipStatus = 'married';
      testCharacters[0].spouseId = testCharacters[1].id;
      testCharacters[1].spouseId = testCharacters[0].id;

      const marriedCouples = settlementFamilyService.getMarriedCouples(testCharacters, 45);
      const births = settlementFamilyService.processProcreationDecisions(
        marriedCouples,
        mockSettlement,
        { procreationRate: 0.8 }
      );

      expect(Array.isArray(births)).toBe(true);
      births.forEach(birth => {
        expect(birth).toHaveProperty('parent1');
        expect(birth).toHaveProperty('parent2');
        expect(birth).toHaveProperty('decision');
      });
    });

    test('addChildToSettlement should update population', () => {
      const initialPopulation = mockSettlement.population.total;
      const child = new Character({
        id: 'new_child',
        name: 'Test Child',
        age: 0
      });

      settlementFamilyService.addChildToSettlement(child, mockSettlement);
      
      expect(mockSettlement.population.total).toBe(initialPopulation + 1);
      expect(mockSettlement.assignedCharacters).toContain(child.id);
    });
  });
});

/**
 * Helper function to create test characters
 */
function createTestCharacters() {
  const characters = [];
  
  for (let i = 0; i < 6; i++) {
    const character = new Character({
      id: `test_char_${i}`,
      name: `Test Character ${i}`,
      age: 20 + Math.floor(Math.random() * 15), // Ages 20-34
      baseAttributes: {
        strength: 10 + Math.floor(Math.random() * 6),
        dexterity: 10 + Math.floor(Math.random() * 6),
        constitution: 12 + Math.floor(Math.random() * 4),
        intelligence: 10 + Math.floor(Math.random() * 6),
        wisdom: 12 + Math.floor(Math.random() * 4),
        charisma: 10 + Math.floor(Math.random() * 6)
      },
      personalityConfig: {
        traits: [
          { id: 'empathy', intensity: 0.5 + Math.random() * 0.4 },
          { id: 'patience', intensity: 0.5 + Math.random() * 0.4 },
          { id: 'aggression', intensity: Math.random() * 0.4 },
          { id: 'loyalty', intensity: 0.6 + Math.random() * 0.3 }
        ]
      },
      consciousness: {
        frequency: 35 + Math.random() * 15,
        coherence: 0.5 + Math.random() * 0.3
      },
      racialTraits: new RacialTraits('human'),
      resources: {
        wealth: 100 + Math.random() * 200,
        income: 40 + Math.random() * 40,
        property: Math.random() < 0.3 ? 1 : 0
      },
      health: 70 + Math.random() * 30,
      relationshipStatus: 'single'
    });
    
    characters.push(character);
  }
  
  return characters;
}
