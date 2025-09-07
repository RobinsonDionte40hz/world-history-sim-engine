// src/domain/services/__tests__/NeedConsequenceService.test.js

import NeedConsequenceService from '../NeedConsequenceService.js';

describe('NeedConsequenceService', () => {
  let service;
  let mockSettlement;
  let mockNeeds;

  beforeEach(() => {
    service = new NeedConsequenceService();
    
    mockSettlement = {
      id: 'test-settlement',
      name: 'Test Settlement',
      population: { total: 100 },
      resources: {
        production: { food: 20, water: 15 },
        amounts: { food: 10, water: 5 }
      },
      buildings: [
        { type: 'farm', level: 1 },
        { type: 'well', level: 1 },
        { type: 'house', level: 1 }
      ],
      economy: {
        trade: [
          { resources: { food: 5 }, frequency: 1 }
        ]
      },
      territory: {
        size: 50,
        features: []
      }
    };

    mockNeeds = {
      food: 0.5,
      water: 0.6,
      shelter: 0.7,
      goods: 0.8,
      services: 0.9
    };
  });

  describe('Consequence Generation', () => {
    it('should generate no consequences when all needs are satisfied', () => {
      const satisfiedNeeds = {
        food: 0.8,
        water: 0.9,
        shelter: 0.7,
        goods: 0.8,
        services: 0.9
      };

      const consequences = service.generateConsequences(satisfiedNeeds, mockSettlement);
      
      expect(consequences).toHaveLength(0);
    });

    it('should generate famine consequence when food satisfaction is low', () => {
      const lowFoodNeeds = {
        ...mockNeeds,
        food: 0.2 // Below FAMINE_THRESHOLD (0.3)
      };

      const consequences = service.generateConsequences(lowFoodNeeds, mockSettlement);
      
      expect(consequences).toHaveLength(1);
      expect(consequences[0].type).toBe('famine');
      expect(consequences[0].severity).toBeGreaterThan(0);
      expect(consequences[0].description).toContain('Food shortages');
      expect(consequences[0].triggers).toContain('successful_harvest');
      expect(consequences[0].resolved).toBe(false);
    });

    it('should generate water crisis consequence when water satisfaction is low', () => {
      const lowWaterNeeds = {
        ...mockNeeds,
        water: 0.3 // Below WATER_CRISIS_THRESHOLD (0.4)
      };

      const consequences = service.generateConsequences(lowWaterNeeds, mockSettlement);
      
      expect(consequences).toHaveLength(1);
      expect(consequences[0].type).toBe('water_crisis');
      expect(consequences[0].severity).toBeGreaterThan(0);
      expect(consequences[0].description).toContain('Water scarcity');
      expect(consequences[0].triggers).toContain('build_aqueduct');
    });

    it('should generate housing crisis consequence when shelter satisfaction is low', () => {
      const lowShelterNeeds = {
        ...mockNeeds,
        shelter: 0.1 // Below HOUSING_CRISIS_THRESHOLD (0.2)
      };

      const consequences = service.generateConsequences(lowShelterNeeds, mockSettlement);
      
      expect(consequences).toHaveLength(1);
      expect(consequences[0].type).toBe('housing_crisis');
      expect(consequences[0].severity).toBeGreaterThan(0);
      expect(consequences[0].description).toContain('Overcrowding');
      expect(consequences[0].triggers).toContain('build_housing');
    });

    it('should generate goods shortage consequence when goods satisfaction is low', () => {
      const lowGoodsNeeds = {
        ...mockNeeds,
        goods: 0.2 // Below GOODS_SHORTAGE_THRESHOLD (0.3)
      };

      const consequences = service.generateConsequences(lowGoodsNeeds, mockSettlement);
      
      expect(consequences).toHaveLength(1);
      expect(consequences[0].type).toBe('goods_shortage');
      expect(consequences[0].severity).toBeGreaterThan(0);
      expect(consequences[0].description).toContain('Trade disruptions');
      expect(consequences[0].triggers).toContain('establish_trade_routes');
    });

    it('should generate services shortage consequence when services satisfaction is low', () => {
      const lowServicesNeeds = {
        ...mockNeeds,
        services: 0.1 // Below SERVICES_SHORTAGE_THRESHOLD (0.2)
      };

      const consequences = service.generateConsequences(lowServicesNeeds, mockSettlement);
      
      expect(consequences).toHaveLength(1);
      expect(consequences[0].type).toBe('services_shortage');
      expect(consequences[0].severity).toBeGreaterThan(0);
      expect(consequences[0].description).toContain('Lack of education');
      expect(consequences[0].triggers).toContain('build_temple');
    });

    it('should generate multiple consequences when multiple needs are low', () => {
      const crisisNeeds = {
        food: 0.1,
        water: 0.2,
        shelter: 0.1,
        goods: 0.1,
        services: 0.1
      };

      const consequences = service.generateConsequences(crisisNeeds, mockSettlement);
      
      expect(consequences.length).toBeGreaterThan(1);
      const consequenceTypes = consequences.map(c => c.type);
      expect(consequenceTypes).toContain('famine');
      expect(consequenceTypes).toContain('water_crisis');
      expect(consequenceTypes).toContain('housing_crisis');
      expect(consequenceTypes).toContain('goods_shortage');
      expect(consequenceTypes).toContain('services_shortage');
    });
  });

  describe('Severity Calculation', () => {
    it('should calculate famine severity correctly', () => {
      const severity = service.calculateSeverity('FAMINE', 0.1);
      expect(severity).toBeGreaterThan(0.5);
      expect(severity).toBeLessThanOrEqual(1.0);
    });

    it('should calculate water crisis severity correctly', () => {
      const severity = service.calculateSeverity('WATER_CRISIS', 0.2);
      expect(severity).toBeGreaterThan(0.3);
      expect(severity).toBeLessThanOrEqual(1.0);
    });

    it('should return zero severity when need is above threshold', () => {
      const severity = service.calculateSeverity('FAMINE', 0.5);
      expect(severity).toBe(0);
    });

    it('should throw error for invalid consequence type', () => {
      expect(() => service.calculateSeverity('INVALID_TYPE', 0.1)).toThrow('Invalid consequence type');
    });

    it('should scale severity based on deficit amount', () => {
      const lowSeverity = service.calculateSeverity('FAMINE', 0.25); // Just below threshold (0.3)
      const highSeverity = service.calculateSeverity('FAMINE', 0.05); // Much below threshold
      
      expect(highSeverity).toBeGreaterThan(lowSeverity);
      expect(lowSeverity).toBeGreaterThan(0);
      expect(highSeverity).toBeGreaterThan(0);
    });
  });

  describe('Duration Calculation', () => {
    it('should calculate famine duration correctly', () => {
      const duration = service.calculateDuration('FAMINE', 0.5);
      expect(duration).toBeGreaterThanOrEqual(5);
      expect(duration).toBeLessThanOrEqual(12);
    });

    it('should calculate water crisis duration correctly', () => {
      const duration = service.calculateDuration('WATER_CRISIS', 0.8);
      expect(duration).toBeGreaterThanOrEqual(4);
      expect(duration).toBeLessThanOrEqual(10);
    });

    it('should scale duration with severity', () => {
      const shortDuration = service.calculateDuration('FAMINE', 0.1);
      const longDuration = service.calculateDuration('FAMINE', 0.9);
      
      expect(longDuration).toBeGreaterThan(shortDuration);
    });

    it('should throw error for invalid consequence type', () => {
      expect(() => service.calculateDuration('INVALID_TYPE', 0.5)).toThrow('Invalid consequence type');
    });
  });

  describe('Consequence Resolution', () => {
    let famineConsequence;

    beforeEach(() => {
      famineConsequence = {
        id: 'famine_test_123',
        type: 'famine',
        severity: 0.5,
        description: 'Food shortages',
        effects: {},
        duration: 8,
        triggers: ['successful_harvest', 'food_trade_agreement'],
        resolved: false,
        startDate: new Date()
      };
    });

    it('should not resolve consequence when no triggers are met', () => {
      const canResolve = service.canResolveConsequence(famineConsequence, mockSettlement);
      expect(canResolve).toBe(false);
    });

    it('should resolve consequence when trigger is met', () => {
      const prosperousSettlement = {
        ...mockSettlement,
        resources: {
          production: { food: 100 }, // High food production
          amounts: { food: 50 }
        }
      };

      const canResolve = service.canResolveConsequence(famineConsequence, prosperousSettlement);
      expect(canResolve).toBe(true);
    });

    it('should not resolve already resolved consequence', () => {
      const resolvedConsequence = {
        ...famineConsequence,
        resolved: true
      };

      const canResolve = service.canResolveConsequence(resolvedConsequence, mockSettlement);
      expect(canResolve).toBe(false);
    });

    it('should resolve consequence and mark as resolved', () => {
      const prosperousSettlement = {
        ...mockSettlement,
        resources: {
          production: { food: 100 },
          amounts: { food: 50 }
        }
      };

      const resolvedConsequence = service.resolveConsequence(famineConsequence, prosperousSettlement);
      
      expect(resolvedConsequence.resolved).toBe(true);
      expect(resolvedConsequence.endDate).toBeInstanceOf(Date);
    });

    it('should not resolve consequence when triggers not met', () => {
      const unresolvedConsequence = service.resolveConsequence(famineConsequence, mockSettlement);
      
      expect(unresolvedConsequence.resolved).toBe(false);
      expect(unresolvedConsequence.endDate).toBeUndefined();
    });
  });

  describe('Effect Calculations', () => {
    it('should calculate famine effects with correct structure', () => {
      const effects = service._calculateFamineEffects(0.5);
      
      expect(effects).toHaveProperty('population');
      expect(effects).toHaveProperty('character');
      expect(effects).toHaveProperty('settlement');
      
      expect(effects.population).toHaveProperty('growth');
      expect(effects.population).toHaveProperty('migration');
      expect(effects.population).toHaveProperty('mortality');
      
      expect(effects.character).toHaveProperty('moodModifier');
      expect(effects.character).toHaveProperty('behaviorChanges');
      expect(effects.character).toHaveProperty('interactionModifiers');
    });

    it('should scale effects with severity', () => {
      const lowEffects = service._calculateFamineEffects(0.2);
      const highEffects = service._calculateFamineEffects(0.8);
      
      expect(Math.abs(highEffects.population.migration)).toBeGreaterThan(Math.abs(lowEffects.population.migration));
      expect(Math.abs(highEffects.character.moodModifier)).toBeGreaterThan(Math.abs(lowEffects.character.moodModifier));
    });

    it('should calculate water crisis effects correctly', () => {
      const effects = service._calculateWaterCrisisEffects(0.6);
      
      expect(effects.character.behaviorChanges).toContain('seek_water_sources');
      expect(effects.settlement.buildingEfficiency).toHaveProperty('farm');
      expect(effects.settlement.buildingEfficiency).toHaveProperty('brewery');
    });

    it('should calculate housing crisis effects correctly', () => {
      const effects = service._calculateHousingCrisisEffects(0.4);
      
      expect(effects.character.behaviorChanges).toContain('build_shelter');
      expect(effects.character.interactionModifiers).toHaveProperty('build_house');
    });

    it('should calculate goods shortage effects correctly', () => {
      const effects = service._calculateGoodsShortageEffects(0.7);
      
      expect(effects.character.behaviorChanges).toContain('prioritize_crafting');
      expect(effects.settlement.buildingEfficiency).toHaveProperty('market');
      expect(effects.settlement.buildingEfficiency).toHaveProperty('workshop');
    });

    it('should calculate services shortage effects correctly', () => {
      const effects = service._calculateServicesShortageEffects(0.3);
      
      expect(effects.character.behaviorChanges).toContain('seek_education');
      expect(effects.settlement.buildingEfficiency).toHaveProperty('temple');
      expect(effects.settlement.buildingEfficiency).toHaveProperty('school');
      expect(effects.settlement.buildingEfficiency).toHaveProperty('healer');
    });
  });

  describe('Trigger Checking', () => {
    it('should detect successful harvest trigger', () => {
      const prosperousSettlement = {
        ...mockSettlement,
        resources: { production: { food: 100 } }
      };

      expect(service._hasSuccessfulHarvest(prosperousSettlement)).toBe(true);
    });

    it('should detect food trade agreement trigger', () => {
      const tradingSettlement = {
        ...mockSettlement,
        economy: {
          trade: [{ resources: { food: 15 } }] // Above threshold of 10
        }
      };

      expect(service._hasFoodTradeAgreement(tradingSettlement)).toBe(true);
    });

    it('should detect aqueduct trigger', () => {
      const aqueductSettlement = {
        ...mockSettlement,
        buildings: [
          { type: 'farm', level: 1 },
          { type: 'aqueduct', level: 1 }
        ]
      };

      expect(service._hasAqueduct(aqueductSettlement)).toBe(true);
    });

    it('should detect adequate housing trigger', () => {
      const housingSettlement = {
        ...mockSettlement,
        population: { total: 40 },
        buildings: [
          { type: 'house', level: 3 }, // 3 * 4 = 12 capacity
          { type: 'house', level: 2 }, // 2 * 4 = 8 capacity
          { type: 'house', level: 1 }  // 1 * 4 = 4 capacity
        ]
        // Total capacity: 24, need 40 * 0.9 = 36, so this should fail
      };

      // Let's make it pass by reducing population or increasing housing
      housingSettlement.population.total = 20; // Need 20 * 0.9 = 18, we have 24
      expect(service._hasAdequateHousing(housingSettlement)).toBe(true);
    });

    it('should detect temple trigger', () => {
      const religiousSettlement = {
        ...mockSettlement,
        buildings: [
          { type: 'farm', level: 1 },
          { type: 'temple', level: 2 }
        ]
      };

      expect(service._hasTemple(religiousSettlement)).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should throw error for invalid needs object', () => {
      expect(() => service.validateInputs(null, mockSettlement)).toThrow('Needs must be a valid object');
      expect(() => service.validateInputs('invalid', mockSettlement)).toThrow('Needs must be a valid object');
    });

    it('should throw error for invalid settlement object', () => {
      expect(() => service.validateInputs(mockNeeds, null)).toThrow('Settlement must be a valid object');
      expect(() => service.validateInputs(mockNeeds, 'invalid')).toThrow('Settlement must be a valid object');
    });

    it('should throw error for settlement without id', () => {
      const invalidSettlement = { ...mockSettlement };
      delete invalidSettlement.id;

      expect(() => service.validateInputs(mockNeeds, invalidSettlement)).toThrow('Settlement must have a valid id');
    });

    it('should throw error for settlement without name', () => {
      const invalidSettlement = { ...mockSettlement };
      delete invalidSettlement.name;

      expect(() => service.validateInputs(mockNeeds, invalidSettlement)).toThrow('Settlement must have a valid name');
    });

    it('should throw error for invalid need satisfaction values', () => {
      const invalidNeeds = {
        ...mockNeeds,
        food: -0.1 // Invalid: below 0
      };

      expect(() => service.validateInputs(invalidNeeds, mockSettlement)).toThrow('Need satisfaction for food must be a number between 0 and 1');
    });

    it('should throw error for need satisfaction above 1', () => {
      const invalidNeeds = {
        ...mockNeeds,
        water: 1.5 // Invalid: above 1
      };

      expect(() => service.validateInputs(invalidNeeds, mockSettlement)).toThrow('Need satisfaction for water must be a number between 0 and 1');
    });
  });

  describe('Error Handling', () => {
    it('should return empty array when consequence generation fails', () => {
      const invalidNeeds = {
        food: 'invalid',
        water: 0.5,
        shelter: 0.5,
        goods: 0.5,
        services: 0.5
      };

      const consequences = service.generateConsequences(invalidNeeds, mockSettlement);
      expect(consequences).toEqual([]);
    });
  });

  describe('Constants and Configuration', () => {
    it('should have correct consequence thresholds', () => {
      expect(NeedConsequenceService.CONSEQUENCE_THRESHOLDS.FAMINE_THRESHOLD).toBe(0.3);
      expect(NeedConsequenceService.CONSEQUENCE_THRESHOLDS.WATER_CRISIS_THRESHOLD).toBe(0.4);
      expect(NeedConsequenceService.CONSEQUENCE_THRESHOLDS.HOUSING_CRISIS_THRESHOLD).toBe(0.2);
      expect(NeedConsequenceService.CONSEQUENCE_THRESHOLDS.GOODS_SHORTAGE_THRESHOLD).toBe(0.3);
      expect(NeedConsequenceService.CONSEQUENCE_THRESHOLDS.SERVICES_SHORTAGE_THRESHOLD).toBe(0.2);
    });

    it('should have correct severity scaling factors', () => {
      expect(NeedConsequenceService.SEVERITY_SCALING.FAMINE.base).toBe(0.3);
      expect(NeedConsequenceService.SEVERITY_SCALING.WATER_CRISIS.base).toBe(0.7);
      expect(NeedConsequenceService.SEVERITY_SCALING.HOUSING_CRISIS.base).toBe(0.4);
    });

    it('should have correct duration ranges', () => {
      expect(NeedConsequenceService.CONSEQUENCE_DURATION.FAMINE.min).toBe(5);
      expect(NeedConsequenceService.CONSEQUENCE_DURATION.FAMINE.max).toBe(12);
      expect(NeedConsequenceService.CONSEQUENCE_DURATION.WATER_CRISIS.min).toBe(4);
      expect(NeedConsequenceService.CONSEQUENCE_DURATION.WATER_CRISIS.max).toBe(10);
    });
  });
});
