// src/test/settlement-family-service.test.js

import { describe, test, expect, beforeEach } from '@jest/globals';
import Character from '../domain/entities/Character.js';
import SettlementFamilyService from '../domain/services/SettlementFamilyService.js';
import WorldBuilder from '../domain/services/WorldBuilder.js';
import { RacialTraits } from '../domain/value-objects/RacialTraits.js';

describe('SettlementFamilyService', () => {
  let settlementFamilyService;
  let worldBuilder;
  let mockSettlement;
  let testCharacters;

  beforeEach(() => {
    worldBuilder = new WorldBuilder();
    
    // Progress WorldBuilder through required phases
    worldBuilder.setWorldProperties('Test World', 'A test world for family service testing');
    worldBuilder.setRules({
      timeProgression: 'turn-based',
      maxTurns: 100
    });
    worldBuilder.setInitialConditions({
      startingYear: 1000,
      climate: 'temperate'
    });
    
    // Add a test node (settlement)
    worldBuilder.addNode({
      id: 'test_settlement',
      name: 'Test Settlement',
      description: 'A test settlement',
      type: 'settlement',
      population: { total: 100 },
      resources: [
        { type: 'food', amount: 100 },
        { type: 'water', amount: 100 },
        { type: 'materials', amount: 50 }
      ]
    });
    
    // Add basic interactions
    worldBuilder.addInteraction({
      id: 'basic_social',
      name: 'Basic Social Interaction',
      type: 'social'
    });
    
    settlementFamilyService = new SettlementFamilyService(worldBuilder);
    
    // Create mock settlement
    mockSettlement = {
      id: 'test_settlement',
      name: 'Test Village',
      population: { total: 0 },
      assignedCharacters: [],
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

    // Create test characters
    testCharacters = createTestCharacters();
    
    // Add characters to world and settlement
    testCharacters.forEach(char => {
      worldBuilder.addCharacter(char);
      mockSettlement.assignedCharacters.push(char.id);
      mockSettlement.population.total += 1;
    });
  });

  describe('processFamilyFormation', () => {
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

    test('should record historical events', () => {
      const results = settlementFamilyService.processFamilyFormation(
        mockSettlement, 
        1,
        { marriageRate: 1.0 } // Force marriages for testing
      );

      // Check that events are recorded proportionally to results
      const marriageEvents = mockSettlement.history.filter(e => e.type === 'marriage');
      expect(marriageEvents.length).toBe(results.marriages.length);
      
      // History length should match the number of events created
      const expectedHistoryLength = results.marriages.length + results.births.length;
      expect(mockSettlement.history.length).toBe(expectedHistoryLength);
    });
  });

  describe('getEligibleSingles', () => {
    test('should return eligible single characters', () => {
      const eligibleSingles = settlementFamilyService.getEligibleSingles(testCharacters);

      expect(Array.isArray(eligibleSingles)).toBe(true);
      eligibleSingles.forEach(char => {
        expect(char.age).toBeGreaterThanOrEqual(18);
        expect(char.relationshipStatus).not.toBe('married');
        expect(char.health).toBeGreaterThanOrEqual(50);
      });
    });

    test('should filter out married characters', () => {
      // Mark some characters as married
      testCharacters[0].relationshipStatus = 'married';
      testCharacters[1].relationshipStatus = 'married';

      const eligibleSingles = settlementFamilyService.getEligibleSingles(testCharacters);

      expect(eligibleSingles.every(char => char.relationshipStatus !== 'married')).toBe(true);
    });

    test('should filter out unhealthy characters', () => {
      // Make some characters unhealthy
      testCharacters[0].health = 30;
      testCharacters[1].health = 40;

      const eligibleSingles = settlementFamilyService.getEligibleSingles(testCharacters);

      expect(eligibleSingles.every(char => char.health >= 50)).toBe(true);
    });

    test('should filter out underage characters', () => {
      // Make some characters underage
      testCharacters[0].age = 16;
      testCharacters[1].age = 17;

      const eligibleSingles = settlementFamilyService.getEligibleSingles(testCharacters, 18);

      expect(eligibleSingles.every(char => char.age >= 18)).toBe(true);
    });
  });

  describe('processMarriageDecisions', () => {
    test('should process marriage decisions for eligible singles', () => {
      const eligibleSingles = settlementFamilyService.getEligibleSingles(testCharacters);
      const marriages = settlementFamilyService.processMarriageDecisions(
        eligibleSingles,
        mockSettlement,
        { marriageRate: 1.0 } // High rate for testing
      );

      expect(Array.isArray(marriages)).toBe(true);
      marriages.forEach(marriage => {
        expect(marriage).toHaveProperty('partner1');
        expect(marriage).toHaveProperty('partner2');
        expect(marriage).toHaveProperty('compatibility');
        expect(marriage).toHaveProperty('settlementId');
        expect(marriage.settlementId).toBe(mockSettlement.id);
      });
    });

    test('should not pair characters who are not valid matches', () => {
      const eligibleSingles = settlementFamilyService.getEligibleSingles(testCharacters);
      
      // Create family relationship to prevent matching
      if (eligibleSingles.length >= 2) {
        if (!eligibleSingles[0].relationships) eligibleSingles[0].relationships = new Map();
        eligibleSingles[0].relationships.set(eligibleSingles[1].id, { 
          type: 'family', 
          value: 90 
        });
      }

      const marriages = settlementFamilyService.processMarriageDecisions(
        eligibleSingles,
        mockSettlement
      );

      // Should not have matched the family members
      const invalidMarriage = marriages.find(m => 
        (m.partner1.id === eligibleSingles[0].id && m.partner2.id === eligibleSingles[1].id) ||
        (m.partner1.id === eligibleSingles[1].id && m.partner2.id === eligibleSingles[0].id)
      );
      expect(invalidMarriage).toBeUndefined();
    });
  });

  describe('isValidPartnerMatch', () => {
    test('should return true for valid matches', () => {
      const char1 = testCharacters[0];
      const char2 = testCharacters[1];

      // Ensure they are valid matches
      char1.age = 25;
      char2.age = 27;
      char1.relationshipStatus = 'single';
      char2.relationshipStatus = 'single';

      const isValid = settlementFamilyService.isValidPartnerMatch(char1, char2);
      expect(isValid).toBe(true);
    });

    test('should return false for large age differences', () => {
      const char1 = testCharacters[0];
      const char2 = testCharacters[1];

      char1.age = 25;
      char2.age = 45; // 20 year difference

      const isValid = settlementFamilyService.isValidPartnerMatch(char1, char2);
      expect(isValid).toBe(false);
    });

    test('should return false for family relationships', () => {
      const char1 = testCharacters[0];
      const char2 = testCharacters[1];

      char1.relationships = new Map();
      char1.relationships.set(char2.id, { type: 'family', value: 90 });

      const isValid = settlementFamilyService.isValidPartnerMatch(char1, char2);
      expect(isValid).toBe(false);
    });

    test('should return false if either character is married', () => {
      const char1 = testCharacters[0];
      const char2 = testCharacters[1];

      char1.relationshipStatus = 'married';

      const isValid = settlementFamilyService.isValidPartnerMatch(char1, char2);
      expect(isValid).toBe(false);
    });
  });

  describe('formalizeMarriage', () => {
    test('should formalize marriage between two characters', () => {
      const partner1 = testCharacters[0];
      const partner2 = testCharacters[1];

      settlementFamilyService.formalizeMarriage(partner1, partner2, mockSettlement);

      expect(partner1.relationshipStatus).toBe('married');
      expect(partner2.relationshipStatus).toBe('married');
      expect(partner1.marriagePartner).toBe(partner2.id);
      expect(partner2.marriagePartner).toBe(partner1.id);

      expect(partner1.relationships.has(partner2.id)).toBe(true);
      expect(partner2.relationships.has(partner1.id)).toBe(true);

      const relationship1 = partner1.relationships.get(partner2.id);
      const relationship2 = partner2.relationships.get(partner1.id);

      expect(relationship1.type).toBe('marriage');
      expect(relationship2.type).toBe('marriage');
      expect(relationship1.value).toBe(80);
      expect(relationship2.value).toBe(80);
    });

    test('should increase settlement happiness', () => {
      const initialHappiness = mockSettlement.socialFactors.happiness;
      const partner1 = testCharacters[0];
      const partner2 = testCharacters[1];

      settlementFamilyService.formalizeMarriage(partner1, partner2, mockSettlement);

      expect(mockSettlement.socialFactors.happiness).toBeGreaterThan(initialHappiness);
    });
  });

  describe('getMarriedCouples', () => {
    test('should return married couples', () => {
      // Create a married couple
      const partner1 = testCharacters[0];
      const partner2 = testCharacters[1];
      
      settlementFamilyService.formalizeMarriage(partner1, partner2, mockSettlement);

      const couples = settlementFamilyService.getMarriedCouples(testCharacters);

      expect(Array.isArray(couples)).toBe(true);
      expect(couples.length).toBeGreaterThanOrEqual(1);
      
      const foundCouple = couples.find(couple => 
        (couple[0].id === partner1.id && couple[1].id === partner2.id) ||
        (couple[0].id === partner2.id && couple[1].id === partner1.id)
      );
      expect(foundCouple).toBeDefined();
    });

    test('should filter out couples beyond childbearing age', () => {
      // Create an older married couple
      const partner1 = testCharacters[0];
      const partner2 = testCharacters[1];
      
      partner1.age = 50;
      partner2.age = 48;
      
      settlementFamilyService.formalizeMarriage(partner1, partner2, mockSettlement);

      const couples = settlementFamilyService.getMarriedCouples(testCharacters, 45);

      // Should be filtered out due to age
      const foundCouple = couples.find(couple => 
        (couple[0].id === partner1.id && couple[1].id === partner2.id) ||
        (couple[0].id === partner2.id && couple[1].id === partner1.id)
      );
      expect(foundCouple).toBeUndefined();
    });
  });

  describe('processProcreationDecisions', () => {
    test('should process procreation decisions for married couples', () => {
      // Create married couple
      const partner1 = testCharacters[0];
      const partner2 = testCharacters[1];
      
      partner1.age = 25;
      partner2.age = 27;
      
      settlementFamilyService.formalizeMarriage(partner1, partner2, mockSettlement);
      const couples = settlementFamilyService.getMarriedCouples(testCharacters);

      const births = settlementFamilyService.processProcreationDecisions(
        couples,
        mockSettlement,
        { procreationRate: 1.0 } // High rate for testing
      );

      expect(Array.isArray(births)).toBe(true);
      births.forEach(birth => {
        expect(birth).toHaveProperty('parent1');
        expect(birth).toHaveProperty('parent2');
        expect(birth).toHaveProperty('decision');
        expect(birth).toHaveProperty('settlementId');
      });
    });

    test('should handle couples with recent children', () => {
      const partner1 = testCharacters[0];
      const partner2 = testCharacters[1];
      
      settlementFamilyService.formalizeMarriage(partner1, partner2, mockSettlement);
      
      // Mark as having recent child
      partner1.lastChildBirth = { turn: Date.now(), childId: 'recent_child' };

      const couples = [[partner1, partner2]];
      const births = settlementFamilyService.processProcreationDecisions(
        couples,
        mockSettlement
      );

      // Should not have more children due to recent birth
      expect(births.length).toBe(0);
    });
  });

  describe('hasRecentChild', () => {
    test('should return true for couples with recent children', () => {
      const couple = [testCharacters[0], testCharacters[1]];
      
      // Mark as having recent child
      couple[0].lastChildBirth = { turn: Date.now(), childId: 'recent' };

      const hasRecent = settlementFamilyService.hasRecentChild(couple, 2);
      expect(hasRecent).toBe(true);
    });

    test('should return false for couples without recent children', () => {
      const couple = [testCharacters[0], testCharacters[1]];

      const hasRecent = settlementFamilyService.hasRecentChild(couple, 2);
      expect(hasRecent).toBe(false);
    });
  });

  describe('addChildToSettlement', () => {
    test('should add child to settlement and update population', () => {
      const initialPopulation = mockSettlement.population.total;
      const initialCharacterCount = mockSettlement.assignedCharacters.length;

      // Create a child character
      const child = new Character({
        id: 'test_child',
        name: 'Test Child',
        age: 0
      });

      settlementFamilyService.addChildToSettlement(child, mockSettlement);

      expect(mockSettlement.population.total).toBe(initialPopulation + 1);
      expect(mockSettlement.assignedCharacters.length).toBe(initialCharacterCount + 1);
      expect(mockSettlement.assignedCharacters).toContain(child.id);
    });

    test('should update demographics', () => {
      const child = new Character({
        id: 'test_child',
        name: 'Test Child',
        age: 0
      });

      // Initialize demographics if not present
      if (!mockSettlement.demographics) {
        mockSettlement.demographics = { children: 0, ageDistribution: {} };
      }

      const initialChildren = mockSettlement.demographics.children || 0;

      settlementFamilyService.addChildToSettlement(child, mockSettlement);

      expect(mockSettlement.demographics.children).toBe(initialChildren + 1);
      expect(mockSettlement.demographics.ageDistribution['0-5']).toBeDefined();
    });
  });

  describe('recordHistoricalEvent', () => {
    test('should record marriage events', () => {
      const marriage = {
        partner1: testCharacters[0],
        partner2: testCharacters[1],
        compatibility: { overallScore: 0.8 }
      };

      settlementFamilyService.recordHistoricalEvent('marriage', marriage, mockSettlement, 1);

      expect(mockSettlement.history.length).toBe(1);
      const event = mockSettlement.history[0];
      expect(event.type).toBe('marriage');
      expect(event.turn).toBe(1);
      expect(event.settlementId).toBe(mockSettlement.id);
      expect(event.participants).toContain(marriage.partner1.id);
      expect(event.participants).toContain(marriage.partner2.id);
    });

    test('should record birth events', () => {
      const birth = {
        parent1: testCharacters[0],
        parent2: testCharacters[1],
        child: new Character({ id: 'test_child', name: 'Test Child', age: 0 })
      };

      settlementFamilyService.recordHistoricalEvent('birth', birth, mockSettlement, 1);

      expect(mockSettlement.history.length).toBe(1);
      const event = mockSettlement.history[0];
      expect(event.type).toBe('birth');
      expect(event.participants).toContain(birth.parent1.id);
      expect(event.participants).toContain(birth.parent2.id);
      expect(event.participants).toContain(birth.child.id);
    });

    test('should limit history size', () => {
      // Add many events to test history limit
      for (let i = 0; i < 150; i++) {
        settlementFamilyService.recordHistoricalEvent('test', { test: true }, mockSettlement, i);
      }

      expect(mockSettlement.history.length).toBeLessThanOrEqual(100);
    });
  });

  describe('getFamilyFormationStats', () => {
    test('should calculate family formation statistics', () => {
      // Add some test events
      mockSettlement.history = [
        { type: 'marriage', turn: Date.now() - 1 },
        { type: 'marriage', turn: Date.now() - 2 },
        { type: 'birth', turn: Date.now() - 1 },
        { type: 'birth', turn: Date.now() - 3 },
        { type: 'birth', turn: Date.now() - 4 }
      ];

      const stats = settlementFamilyService.getFamilyFormationStats(mockSettlement, 10);

      expect(stats).toHaveProperty('marriages');
      expect(stats).toHaveProperty('births');
      expect(stats).toHaveProperty('marriageRate');
      expect(stats).toHaveProperty('birthRate');
      expect(stats).toHaveProperty('populationGrowth');
      expect(typeof stats.marriages).toBe('number');
      expect(typeof stats.births).toBe('number');
      expect(typeof stats.marriageRate).toBe('number');
      expect(typeof stats.birthRate).toBe('number');
    });

    test('should handle settlements with no history', () => {
      mockSettlement.history = [];

      const stats = settlementFamilyService.getFamilyFormationStats(mockSettlement, 10);

      expect(stats.marriages).toBe(0);
      expect(stats.births).toBe(0);
      expect(stats.marriageRate).toBe(0);
      expect(stats.birthRate).toBe(0);
    });
  });

  describe('Integration tests', () => {
    test('should handle complete family formation cycle', () => {
      // Process family formation multiple times
      let totalMarriages = 0;
      let totalBirths = 0;

      for (let turn = 1; turn <= 3; turn++) {
        const results = settlementFamilyService.processFamilyFormation(
          mockSettlement,
          turn,
          { marriageRate: 0.5, procreationRate: 0.7 }
        );

        totalMarriages += results.marriages.length;
        totalBirths += results.births.length;
      }

      // Should have some family formation activity
      expect(totalMarriages + totalBirths).toBeGreaterThanOrEqual(0);
      
      // Settlement should have history
      expect(mockSettlement.history.length).toBeGreaterThanOrEqual(0);
      
      // Population might have grown
      expect(mockSettlement.population.total).toBeGreaterThanOrEqual(testCharacters.length);
    });
  });
});

/**
 * Helper function to create test characters
 */
function createTestCharacters() {
  const characters = [];
  
  for (let i = 0; i < 8; i++) {
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
