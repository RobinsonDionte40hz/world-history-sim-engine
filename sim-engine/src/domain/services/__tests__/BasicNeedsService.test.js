// src/domain/services/__tests__/BasicNeedsService.test.js

import BasicNeedsService from '../BasicNeedsService.js';

describe('BasicNeedsService', () => {
  let service;
  let mockSettlement;

  beforeEach(() => {
    service = new BasicNeedsService();
    
    // Create a basic mock settlement
    mockSettlement = {
      id: 'test-settlement',
      name: 'Test Settlement',
      population: {
        total: 100
      },
      resources: {
        amounts: {
          food: 50,
          water: 75
        },
        storage: {
          food: 25,
          water: 30
        }
      },
      buildings: [
        { id: '1', type: 'farm', level: 2 },
        { id: '2', type: 'well', level: 1 },
        { id: '3', type: 'house', level: 1 },
        { id: '4', type: 'workshop', level: 1 },
        { id: '5', type: 'temple', level: 1 }
      ],
      economy: {
        trade: [
          { resources: { food: 10 }, frequency: 2, value: 100 }
        ],
        markets: [
          { type: 'general', goods: [] }
        ]
      },
      government: {
        structure: [
          { positions: [{ title: 'Mayor' }, { title: 'Guard Captain' }] }
        ]
      },
      territory: {
        features: [
          { type: 'river' }
        ]
      }
    };
  });

  describe('calculateSatisfactionLevel', () => {
    test('should return valid satisfaction result for normal settlement', () => {
      const result = service.calculateSatisfactionLevel(mockSettlement);

      expect(result).toHaveProperty('needs');
      expect(result).toHaveProperty('overall');
      expect(result).toHaveProperty('cascadingEffects');

      // Check that all need values are between 0 and 1
      Object.values(result.needs).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });

      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(1);
    });

    test('should handle empty settlement gracefully', () => {
      const emptySettlement = {
        id: 'empty-settlement',
        name: 'Empty Settlement',
        population: { total: 0 },
        resources: {},
        buildings: []
      };

      const result = service.calculateSatisfactionLevel(emptySettlement);

      // Empty settlement should have perfect satisfaction (no needs)
      expect(result.needs.food).toBe(1.0);
      expect(result.needs.water).toBe(1.0);
      expect(result.needs.shelter).toBe(1.0);
      expect(result.needs.goods).toBe(1.0);
      expect(result.needs.services).toBe(1.0);
    });

    test('should return default result when settlement validation fails', () => {
      const result = service.calculateSatisfactionLevel(null);

      expect(result.needs.food).toBe(0.5);
      expect(result.overall).toBe(0.5);
      expect(result.cascadingEffects.hasEffects).toBe(false);
    });

    test('should return default result when population is invalid', () => {
      const invalidSettlement = {
        population: { total: 'invalid' },
        resources: {}
      };

      const result = service.calculateSatisfactionLevel(invalidSettlement);

      expect(result.needs.food).toBe(0.5);
      expect(result.overall).toBe(0.5);
    });
  });

  describe('calculateCascadingEffects', () => {
    test('should not apply cascading effects when all needs are satisfied', () => {
      const needs = {
        food: 0.9,
        water: 0.95,
        shelter: 0.8,
        goods: 0.7,
        services: 0.6
      };

      const cascadingEffects = service._calculateCascadingEffects(needs);

      // Goods and services should remain unchanged
      expect(needs.goods).toBe(0.7);
      expect(needs.services).toBe(0.6);
      expect(cascadingEffects.multiplier).toBe(1.0);
      expect(cascadingEffects.hasEffects).toBe(false);
    });

    test('should apply food cascading effect when food is below threshold', () => {
      const needs = {
        food: 0.7, // Below 0.8 threshold
        water: 0.95,
        shelter: 0.8,
        goods: 0.8,
        services: 0.8
      };

      const originalGoods = needs.goods;
      const originalServices = needs.services;

      service._calculateCascadingEffects(needs);

      // Secondary needs should be reduced by food multiplier (0.7)
      expect(needs.goods).toBeCloseTo(originalGoods * 0.7);
      expect(needs.services).toBeCloseTo(originalServices * 0.7);
    });

    test('should apply water cascading effect when water is below threshold', () => {
      const needs = {
        food: 0.9,
        water: 0.8, // Below 0.9 threshold
        shelter: 0.8,
        goods: 0.8,
        services: 0.8
      };

      const originalGoods = needs.goods;
      const originalServices = needs.services;

      service._calculateCascadingEffects(needs);

      // Secondary needs should be reduced by water multiplier (0.6)
      expect(needs.goods).toBeCloseTo(originalGoods * 0.6);
      expect(needs.services).toBeCloseTo(originalServices * 0.6);
    });

    test('should apply shelter cascading effect when shelter is below threshold', () => {
      const needs = {
        food: 0.9,
        water: 0.95,
        shelter: 0.5, // Below 0.6 threshold
        goods: 0.8,
        services: 0.8
      };

      const originalGoods = needs.goods;
      const originalServices = needs.services;

      service._calculateCascadingEffects(needs);

      // Secondary needs should be reduced by shelter multiplier (0.8)
      expect(needs.goods).toBeCloseTo(originalGoods * 0.8);
      expect(needs.services).toBeCloseTo(originalServices * 0.8);
    });

    test('should compound multiple cascading effects', () => {
      const needs = {
        food: 0.7,  // Below 0.8 threshold
        water: 0.8, // Below 0.9 threshold
        shelter: 0.5, // Below 0.6 threshold
        goods: 0.9,
        services: 0.9
      };

      const originalGoods = needs.goods;
      const originalServices = needs.services;

      service._calculateCascadingEffects(needs);

      // Should apply all three multipliers: 0.7 * 0.6 * 0.8 = 0.336
      const expectedMultiplier = 0.7 * 0.6 * 0.8;
      expect(needs.goods).toBeCloseTo(originalGoods * expectedMultiplier);
      expect(needs.services).toBeCloseTo(originalServices * expectedMultiplier);
    });

    test('should clamp secondary needs to valid range after cascading', () => {
      const needs = {
        food: 0.1, // Very low, will cause severe cascading
        water: 0.1,
        shelter: 0.1,
        goods: 0.1,
        services: 0.1
      };

      service._calculateCascadingEffects(needs);

      // Even with severe cascading, values should not go below 0
      expect(needs.goods).toBeGreaterThanOrEqual(0);
      expect(needs.services).toBeGreaterThanOrEqual(0);
      expect(needs.goods).toBeLessThanOrEqual(1);
      expect(needs.services).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateFoodSatisfaction', () => {
    test('should calculate food satisfaction from multiple sources', () => {
      const satisfaction = service.calculateFoodSatisfaction(mockSettlement);

      expect(satisfaction).toBeGreaterThan(0);
      expect(satisfaction).toBeLessThanOrEqual(1);
    });

    test('should return 1.0 for zero population', () => {
      const emptySettlement = { ...mockSettlement, population: { total: 0 } };
      const satisfaction = service.calculateFoodSatisfaction(emptySettlement);

      expect(satisfaction).toBe(1.0);
    });

    test('should include food from farms', () => {
      const settlementWithFarms = {
        ...mockSettlement,
        buildings: [
          { type: 'farm', level: 3 } // Should produce 30 food (10 * 3)
        ]
      };

      const satisfaction = service.calculateFoodSatisfaction(settlementWithFarms);
      expect(satisfaction).toBeGreaterThan(0);
    });

    test('should include food from trade', () => {
      const settlementWithTrade = {
        ...mockSettlement,
        resources: { amounts: {} }, // No base food
        buildings: [], // No farms
        economy: {
          trade: [
            { resources: { food: 50 }, frequency: 2 } // 100 food from trade
          ]
        }
      };

      const satisfaction = service.calculateFoodSatisfaction(settlementWithTrade);
      expect(satisfaction).toBeGreaterThan(0);
    });

    test('should handle missing resources gracefully', () => {
      const settlementNoResources = {
        ...mockSettlement,
        resources: undefined
      };

      const satisfaction = service.calculateFoodSatisfaction(settlementNoResources);
      expect(satisfaction).toBeGreaterThanOrEqual(0);
      expect(satisfaction).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateWaterSatisfaction', () => {
    test('should calculate water satisfaction from multiple sources', () => {
      const satisfaction = service.calculateWaterSatisfaction(mockSettlement);

      expect(satisfaction).toBeGreaterThan(0);
      expect(satisfaction).toBeLessThanOrEqual(1);
    });

    test('should include water from wells', () => {
      const settlementWithWells = {
        ...mockSettlement,
        buildings: [
          { type: 'well', level: 2 } // Should provide 30 water (15 * 2)
        ]
      };

      const satisfaction = service.calculateWaterSatisfaction(settlementWithWells);
      expect(satisfaction).toBeGreaterThan(0);
    });

    test('should include water from territory features', () => {
      const settlementWithRiver = {
        ...mockSettlement,
        resources: { amounts: {} }, // No base water
        buildings: [], // No wells
        territory: {
          features: [
            { type: 'river' }, // Should provide 20 water
            { type: 'lake' }   // Should provide 30 water
          ]
        }
      };

      const satisfaction = service.calculateWaterSatisfaction(settlementWithRiver);
      expect(satisfaction).toBeGreaterThan(0);
    });

    test('should handle aqueducts providing significant water', () => {
      const settlementWithAqueduct = {
        ...mockSettlement,
        buildings: [
          { type: 'aqueduct', level: 1 } // Should provide 50 water
        ]
      };

      const satisfaction = service.calculateWaterSatisfaction(settlementWithAqueduct);
      expect(satisfaction).toBeGreaterThan(0);
    });
  });

  describe('calculateShelterSatisfaction', () => {
    test('should calculate shelter satisfaction based on housing capacity', () => {
      const satisfaction = service.calculateShelterSatisfaction(mockSettlement);

      expect(satisfaction).toBeGreaterThan(0);
      expect(satisfaction).toBeLessThanOrEqual(1);
    });

    test('should handle overcrowding', () => {
      const overcrowdedSettlement = {
        ...mockSettlement,
        population: { total: 1000 }, // Very high population
        buildings: [
          { type: 'house', level: 1 } // Only 4 shelter capacity
        ]
      };

      const satisfaction = service.calculateShelterSatisfaction(overcrowdedSettlement);
      expect(satisfaction).toBeLessThan(0.1); // Should be very low
    });

    test('should apply quality modifiers', () => {
      const highQualitySettlement = {
        ...mockSettlement,
        population: { total: 10 }, // Small population
        buildings: [
          { type: 'house', level: 3 }, // High level housing
          { type: 'temple', level: 2 }, // Diverse buildings improve quality
          { type: 'market', level: 1 }
        ]
      };

      const satisfaction = service.calculateShelterSatisfaction(highQualitySettlement);
      expect(satisfaction).toBeGreaterThan(0.8); // Should be high due to quality
    });
  });

  describe('calculateGoodsSatisfaction', () => {
    test('should calculate goods satisfaction from production and trade', () => {
      const satisfaction = service.calculateGoodsSatisfaction(mockSettlement);

      expect(satisfaction).toBeGreaterThan(0);
      expect(satisfaction).toBeLessThanOrEqual(1);
    });

    test('should include goods from workshops', () => {
      const settlementWithWorkshops = {
        ...mockSettlement,
        buildings: [
          { type: 'workshop', level: 2 } // Should produce 16 goods (8 * 2)
        ]
      };

      const satisfaction = service.calculateGoodsSatisfaction(settlementWithWorkshops);
      expect(satisfaction).toBeGreaterThan(0);
    });

    test('should apply market efficiency', () => {
      const settlementWithMarkets = {
        ...mockSettlement,
        economy: {
          ...mockSettlement.economy,
          markets: [
            { type: 'general' },
            { type: 'specialized' }
          ]
        }
      };

      const satisfaction = service.calculateGoodsSatisfaction(settlementWithMarkets);
      expect(satisfaction).toBeGreaterThan(0);
    });
  });

  describe('calculateServicesSatisfaction', () => {
    test('should calculate services satisfaction from various service buildings', () => {
      const satisfaction = service.calculateServicesSatisfaction(mockSettlement);

      expect(satisfaction).toBeGreaterThan(0);
      expect(satisfaction).toBeLessThanOrEqual(1);
    });

    test('should include healthcare services', () => {
      const settlementWithHealthcare = {
        ...mockSettlement,
        buildings: [
          { type: 'healer', level: 2 } // Should provide 6 services (3 * 2)
        ]
      };

      const satisfaction = service.calculateServicesSatisfaction(settlementWithHealthcare);
      expect(satisfaction).toBeGreaterThan(0);
    });

    test('should include education services', () => {
      const settlementWithEducation = {
        ...mockSettlement,
        buildings: [
          { type: 'school', level: 1 } // Should provide 4 services
        ]
      };

      const satisfaction = service.calculateServicesSatisfaction(settlementWithEducation);
      expect(satisfaction).toBeGreaterThan(0);
    });

    test('should include religious services', () => {
      const settlementWithReligion = {
        ...mockSettlement,
        buildings: [
          { type: 'temple', level: 1 } // Should provide 6 services
        ]
      };

      const satisfaction = service.calculateServicesSatisfaction(settlementWithReligion);
      expect(satisfaction).toBeGreaterThan(0);
    });

    test('should include administrative services from government', () => {
      const settlementWithGov = {
        ...mockSettlement,
        government: {
          structure: [
            { positions: [{ title: 'Mayor' }, { title: 'Judge' }] }, // 4 admin capacity
            { positions: [{ title: 'Captain' }] } // 2 admin capacity
          ]
        }
      };

      const satisfaction = service.calculateServicesSatisfaction(settlementWithGov);
      expect(satisfaction).toBeGreaterThan(0);
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle negative population gracefully', () => {
      const invalidSettlement = {
        ...mockSettlement,
        population: { total: -10 }
      };

      const result = service.calculateSatisfactionLevel(invalidSettlement);
      expect(result.overall).toBe(0.5); // Should return default
    });

    test('should handle missing buildings array', () => {
      const settlementNoBuildings = {
        ...mockSettlement,
        buildings: undefined
      };

      const result = service.calculateSatisfactionLevel(settlementNoBuildings);
      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
    });

    test('should handle missing economy data', () => {
      const settlementNoEconomy = {
        ...mockSettlement,
        economy: undefined
      };

      const result = service.calculateSatisfactionLevel(settlementNoEconomy);
      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
    });

    test('should handle missing territory data', () => {
      const settlementNoTerritory = {
        ...mockSettlement,
        territory: undefined
      };

      const result = service.calculateSatisfactionLevel(settlementNoTerritory);
      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
    });

    test('should handle missing government data', () => {
      const settlementNoGov = {
        ...mockSettlement,
        government: undefined
      };

      const result = service.calculateSatisfactionLevel(settlementNoGov);
      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThanOrEqual(0);
    });
  });

  describe('constants and thresholds', () => {
    test('should have correct cascading thresholds', () => {
      expect(BasicNeedsService.CASCADING_THRESHOLDS.FOOD_THRESHOLD).toBe(0.8);
      expect(BasicNeedsService.CASCADING_THRESHOLDS.WATER_THRESHOLD).toBe(0.9);
      expect(BasicNeedsService.CASCADING_THRESHOLDS.SHELTER_THRESHOLD).toBe(0.6);
    });

    test('should have correct cascading multipliers', () => {
      expect(BasicNeedsService.CASCADING_MULTIPLIERS.FOOD_MULTIPLIER).toBe(0.7);
      expect(BasicNeedsService.CASCADING_MULTIPLIERS.WATER_MULTIPLIER).toBe(0.6);
      expect(BasicNeedsService.CASCADING_MULTIPLIERS.SHELTER_MULTIPLIER).toBe(0.8);
    });

    test('should have reasonable consumption rates', () => {
      expect(BasicNeedsService.CONSUMPTION_RATES.FOOD_PER_PERSON).toBeGreaterThan(0);
      expect(BasicNeedsService.CONSUMPTION_RATES.WATER_PER_PERSON).toBeGreaterThan(0);
      expect(BasicNeedsService.CONSUMPTION_RATES.GOODS_PER_PERSON).toBeGreaterThan(0);
      expect(BasicNeedsService.CONSUMPTION_RATES.SERVICES_PER_PERSON).toBeGreaterThan(0);
    });

    test('should have building efficiency values', () => {
      expect(BasicNeedsService.BUILDING_EFFICIENCY.FARM.food).toBeGreaterThan(0);
      expect(BasicNeedsService.BUILDING_EFFICIENCY.WELL.water).toBeGreaterThan(0);
      expect(BasicNeedsService.BUILDING_EFFICIENCY.HOUSE.shelter).toBeGreaterThan(0);
      expect(BasicNeedsService.BUILDING_EFFICIENCY.WORKSHOP.goods).toBeGreaterThan(0);
      expect(BasicNeedsService.BUILDING_EFFICIENCY.TEMPLE.services).toBeGreaterThan(0);
    });
  });

  describe('cascading effects info', () => {
    test('should provide cascading effects information', () => {
      const settlementWithLowNeeds = {
        ...mockSettlement,
        population: { total: 1000 }, // High population to create shortages
        resources: { amounts: { food: 1, water: 1 } }, // Very low resources
        buildings: []
      };

      const result = service.calculateSatisfactionLevel(settlementWithLowNeeds);

      expect(result.cascadingEffects).toBeDefined();
      expect(result.cascadingEffects.multiplier).toBeLessThan(1.0);
      expect(result.cascadingEffects.affectedNeeds.length).toBeGreaterThan(0);
      expect(result.cascadingEffects.hasEffects).toBe(true);
    });

    test('should show no cascading effects when needs are satisfied', () => {
      const wellSuppliedSettlement = {
        ...mockSettlement,
        population: { total: 10 }, // Small population
        resources: { amounts: { food: 1000, water: 1000 } }, // Abundant resources
        buildings: [
          { type: 'farm', level: 5 },
          { type: 'well', level: 5 },
          { type: 'house', level: 5 },
          { type: 'workshop', level: 5 },
          { type: 'temple', level: 5 }
        ]
      };

      const result = service.calculateSatisfactionLevel(wellSuppliedSettlement);

      expect(result.cascadingEffects.multiplier).toBe(1.0);
      expect(result.cascadingEffects.affectedNeeds.length).toBe(0);
      expect(result.cascadingEffects.hasEffects).toBe(false);
    });
  });

  describe('Data Structures and Validation', () => {
    it('should return proper data structure with all required fields', () => {
      const result = service.calculateSatisfactionLevel(mockSettlement);
      
      expect(result).toHaveProperty('needs');
      expect(result).toHaveProperty('overall');
      expect(result).toHaveProperty('consequences');
      expect(result).toHaveProperty('cascadingEffects');
      
      expect(result.needs).toHaveProperty('food');
      expect(result.needs).toHaveProperty('water');
      expect(result.needs).toHaveProperty('shelter');
      expect(result.needs).toHaveProperty('goods');
      expect(result.needs).toHaveProperty('services');
      
      expect(result.cascadingEffects).toHaveProperty('multiplier');
      expect(result.cascadingEffects).toHaveProperty('affectedNeeds');
      expect(result.cascadingEffects).toHaveProperty('hasEffects');
      expect(result.cascadingEffects).toHaveProperty('originalValues');
    });

    it('should validate settlement structure properly', () => {
      expect(() => service._validateSettlement(null)).toThrow('Settlement is required');
      expect(() => service._validateSettlement({})).toThrow('Settlement must have a valid id');
      expect(() => service._validateSettlement({ id: 'test' })).toThrow('Settlement must have a valid name');
      expect(() => service._validateSettlement({ id: 'test', name: 'Test' })).toThrow('Settlement must have valid population data');
    });

    it('should validate settlement resources structure', () => {
      const settlement = {
        id: 'test',
        name: 'Test',
        population: { total: 100 },
        resources: 'invalid'
      };
      
      expect(() => service._validateSettlement(settlement)).toThrow('Settlement resources must be an object');
    });

    it('should validate settlement buildings structure', () => {
      const settlement = {
        id: 'test',
        name: 'Test',
        population: { total: 100 },
        buildings: 'invalid'
      };
      
      expect(() => service._validateSettlement(settlement)).toThrow('Settlement buildings must be an array');
    });

    it('should validate individual building structure', () => {
      const settlement = {
        id: 'test',
        name: 'Test',
        population: { total: 100 },
        buildings: [{ type: null }]
      };
      
      expect(() => service._validateSettlement(settlement)).toThrow('Building at index 0 must have a valid type');
    });
  });

  describe('Consequence Generation', () => {
    it('should generate famine consequence when food satisfaction is low', () => {
      const lowFoodSettlement = {
        ...mockSettlement,
        resources: {
          amounts: { food: 1, water: 50 },
          storage: { food: 0, water: 20 }
        }
      };
      
      const result = service.calculateSatisfactionLevel(lowFoodSettlement);
      
      const famineConsequences = result.consequences.filter(c => c.type === 'famine');
      expect(famineConsequences).toHaveLength(1);
      expect(famineConsequences[0].severity).toBeGreaterThan(0);
      expect(famineConsequences[0].effects).toHaveProperty('population');
      expect(famineConsequences[0].effects).toHaveProperty('character');
      expect(famineConsequences[0].effects).toHaveProperty('settlement');
    });

    it('should generate water crisis consequence when water satisfaction is low', () => {
      const lowWaterSettlement = {
        ...mockSettlement,
        resources: {
          amounts: { food: 50, water: 1 },
          storage: { food: 20, water: 0 }
        }
      };
      
      const result = service.calculateSatisfactionLevel(lowWaterSettlement);
      
      const waterCrisisConsequences = result.consequences.filter(c => c.type === 'water_crisis');
      expect(waterCrisisConsequences).toHaveLength(1);
      expect(waterCrisisConsequences[0].severity).toBeGreaterThan(0);
    });

    it('should generate multiple consequences when multiple needs are low', () => {
      const crisisSettlement = {
        ...mockSettlement,
        resources: {
          amounts: { food: 1, water: 1 },
          storage: { food: 0, water: 0 }
        },
        buildings: [] // No buildings for shelter/services
      };
      
      const result = service.calculateSatisfactionLevel(crisisSettlement);
      
      expect(result.consequences.length).toBeGreaterThan(1);
      const consequenceTypes = result.consequences.map(c => c.type);
      expect(consequenceTypes).toContain('famine');
      expect(consequenceTypes).toContain('water_crisis');
    });

    it('should not generate consequences when needs are satisfied', () => {
      const prosperousSettlement = {
        ...mockSettlement,
        resources: {
          amounts: { food: 200, water: 200 },
          storage: { food: 100, water: 100 }
        },
        buildings: [
          { id: '1', type: 'farm', level: 3 },
          { id: '2', type: 'well', level: 3 },
          { id: '3', type: 'house', level: 3 },
          { id: '4', type: 'house', level: 3 },
          { id: '5', type: 'house', level: 3 },
          { id: '6', type: 'house', level: 3 },
          { id: '7', type: 'house', level: 3 },
          { id: '8', type: 'house', level: 3 },
          { id: '9', type: 'house', level: 3 },
          { id: '10', type: 'workshop', level: 3 },
          { id: '11', type: 'temple', level: 3 },
          { id: '12', type: 'school', level: 3 },
          { id: '13', type: 'healer', level: 3 },
          { id: '14', type: 'market', level: 3 }
        ]
      };
      
      const result = service.calculateSatisfactionLevel(prosperousSettlement);
      
      expect(result.consequences).toHaveLength(0);
    });
  });

  describe('Helper Methods', () => {
    it('should get resource amount safely with fallback', () => {
      expect(service._getResourceAmount(null, 'food', 10)).toBe(10);
      expect(service._getResourceAmount({}, 'food', 10)).toBe(10);
      expect(service._getResourceAmount({ amounts: {} }, 'food', 10)).toBe(10);
      expect(service._getResourceAmount({ amounts: { food: 50 } }, 'food', 10)).toBe(50);
    });

    it('should get resource production safely with fallback', () => {
      expect(service._getResourceProduction(null, 'food', 5)).toBe(5);
      expect(service._getResourceProduction({}, 'food', 5)).toBe(5);
      expect(service._getResourceProduction({ production: {} }, 'food', 5)).toBe(5);
      expect(service._getResourceProduction({ production: { food: 25 } }, 'food', 5)).toBe(25);
    });

    it('should calculate building efficiency correctly', () => {
      const farm = { type: 'farm', level: 2 };
      const efficiency = service._getBuildingEfficiency(farm, 'food');
      expect(efficiency).toBe(20); // 10 * 2
    });

    it('should calculate total building efficiency for multiple buildings', () => {
      const buildings = [
        { type: 'farm', level: 1 },
        { type: 'farm', level: 2 }
      ];
      const totalEfficiency = service._getTotalBuildingEfficiency(buildings, 'farm', 'food');
      expect(totalEfficiency).toBe(30); // 10 + 20
    });

    it('should calculate trade access correctly', () => {
      const economy = {
        trade: [
          { resources: { food: 10 }, frequency: 2 },
          { resources: { food: 5 }, frequency: 1 }
        ]
      };
      const tradeAccess = service._getTradeAccess(economy, 'food');
      expect(tradeAccess).toBe(25); // (10 * 2) + (5 * 1)
    });
  });

  describe('Enhanced Cascading Effects', () => {
    it('should track original values before applying cascading effects', () => {
      const lowFoodSettlement = {
        ...mockSettlement,
        resources: {
          amounts: { food: 5, water: 50 },
          storage: { food: 2, water: 20 }
        }
      };
      
      const result = service.calculateSatisfactionLevel(lowFoodSettlement);
      
      expect(result.cascadingEffects).toHaveProperty('originalValues');
      expect(result.cascadingEffects.originalValues).toHaveProperty('goods');
      expect(result.cascadingEffects.originalValues).toHaveProperty('services');
    });

    it('should identify affected needs in cascading effects', () => {
      const lowFoodSettlement = {
        ...mockSettlement,
        resources: {
          amounts: { food: 5, water: 50 },
          storage: { food: 2, water: 20 }
        }
      };
      
      const result = service.calculateSatisfactionLevel(lowFoodSettlement);
      
      expect(result.cascadingEffects.affectedNeeds).toContain('food');
      expect(result.cascadingEffects.hasEffects).toBe(true);
      expect(result.cascadingEffects.multiplier).toBeLessThan(1.0);
    });
  });
});