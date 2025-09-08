// src/test/investment-integration.test.js

import { describe, it, expect, beforeEach } from '@jest/globals';
import SettlementInvestmentIntegrationService from '../domain/services/SettlementInvestmentIntegrationService.js';
import BasicNeedsService from '../domain/services/BasicNeedsService.js';
import CharacterEconomicService from '../domain/services/CharacterEconomicService.js';

describe('Investment Integration System', () => {
  let integrationService;
  let basicNeedsService;
  let testSettlement;
  let testCharacters;

  beforeEach(() => {
    integrationService = new SettlementInvestmentIntegrationService();
    basicNeedsService = new BasicNeedsService();

    // Test settlement
    testSettlement = {
      id: 'settlement_1',
      name: 'Test Village',
      population: { total: 100 },
      resources: {
        amounts: { food: 50, water: 40, goods: 30 },
        production: { food: 10, water: 8, goods: 5 },
        storage: { food: 100, water: 80, goods: 60 }
      },
      buildings: [
        { type: 'farm', level: 2 },
        { type: 'well', level: 1 },
        { type: 'workshop', level: 1 },
        { type: 'house', level: 3 }
      ],
      economy: {
        trade: [
          { value: 100, resources: { food: 5 }, frequency: 2 }
        ],
        markets: [
          { type: 'general', efficiency: 1.0 }
        ]
      }
    };

    // Test characters with investments
    testCharacters = [
      {
        id: 'char_1',
        name: 'Farmer John',
        investments: [
          {
            id: 'inv_1',
            type: 'farmland',
            settlementId: 'settlement_1',
            value: 100,
            status: 'active',
            returns: { food: 5 }
          }
        ]
      },
      {
        id: 'char_2',
        name: 'Builder Mary',
        investments: [
          {
            id: 'inv_2',
            type: 'infrastructure',
            settlementId: 'settlement_1',
            value: 200,
            status: 'active',
            returns: { shelter: 3, water: 2 }
          }
        ]
      },
      {
        id: 'char_3',
        name: 'Trader Bob',
        investments: [
          {
            id: 'inv_3',
            type: 'trade_route',
            settlementId: 'settlement_1',
            value: 150,
            status: 'active',
            returns: { goods: 4 }
          }
        ]
      }
    ];
  });

  describe('Basic Investment Integration', () => {
    it('should calculate need satisfaction with investment effects', () => {
      const result = integrationService.calculateInvestmentAffectedNeeds(testSettlement, testCharacters);
      
      expect(result).toBeDefined();
      expect(result.needs).toBeDefined();
      expect(result.investmentEffects).toBeDefined();
      expect(result.investmentAnalysis).toBeDefined();
      
      // Should have investment effects for food, shelter, water, and goods
      expect(result.investmentEffects.food).toBeGreaterThan(1.0);
      expect(result.investmentEffects.shelter).toBeGreaterThan(1.0);
      expect(result.investmentEffects.water).toBeGreaterThan(1.0);
      expect(result.investmentEffects.goods).toBeGreaterThan(1.0);
    });

    it('should handle settlements without investments', () => {
      const result = integrationService.calculateInvestmentAffectedNeeds(testSettlement, []);
      
      expect(result).toBeDefined();
      expect(result.investmentAnalysis.totalInvestments).toBe(0);
      expect(result.investmentAnalysis.activeInvestors).toBe(0);
      expect(result.investmentEffects.food).toBe(1.0);
      expect(result.investmentEffects.water).toBe(1.0);
    });

    it('should calculate investment effects from CharacterEconomicService', () => {
      const farmlandInvestment = testCharacters[0].investments[0];
      const effects = CharacterEconomicService.calculateSettlementInvestmentEffects(
        [farmlandInvestment],
        testSettlement
      );
      
      expect(effects).toBeDefined();
      expect(effects.food).toBeDefined();
      expect(effects.food.production).toBeGreaterThan(1.0); // Should have food production multiplier
    });
  });

  describe('Combined Investment Effects', () => {
    it('should combine multiple character investments with diminishing returns', () => {
      // Add another character with similar investment
      const additionalCharacter = {
        id: 'char_4',
        name: 'Second Farmer',
        investments: [
          {
            id: 'inv_4',
            type: 'farmland',
            settlementId: 'settlement_1',
            value: 80,
            status: 'active',
            returns: { food: 3 }
          }
        ]
      };

      const charactersWithDuplicates = [...testCharacters, additionalCharacter];
      const result = integrationService.calculateInvestmentAffectedNeeds(testSettlement, charactersWithDuplicates);
      
      // Food effect should be increased but not doubled (diminishing returns)
      const singleInvestorResult = integrationService.calculateInvestmentAffectedNeeds(testSettlement, [testCharacters[0]]);
      
      expect(result.investmentEffects.food).toBeGreaterThan(singleInvestorResult.investmentEffects.food);
      expect(result.investmentEffects.food).toBeLessThan(singleInvestorResult.investmentEffects.food * 2);
    });

    it('should track investment metadata correctly', () => {
      const result = integrationService.calculateInvestmentAffectedNeeds(testSettlement, testCharacters);
      
      expect(result.investmentAnalysis.totalInvestments).toBe(3);
      expect(result.investmentAnalysis.activeInvestors).toBe(3);
      expect(result.investmentAnalysis.totalInvestmentValue).toBe(450); // 100 + 200 + 150
    });

    it('should categorize investment types correctly', () => {
      const result = integrationService.calculateInvestmentAffectedNeeds(testSettlement, testCharacters);
      
      expect(result.investmentAnalysis.investmentTypes.farmland).toBe(1);
      expect(result.investmentAnalysis.investmentTypes.infrastructure).toBe(1);
      expect(result.investmentAnalysis.investmentTypes.trade_route).toBe(1);
    });
  });

  describe('Investment Impact on Needs', () => {
    it('should improve food satisfaction with farm investments', () => {
      const baseResult = basicNeedsService.calculateSatisfactionLevel(testSettlement);
      const investmentResult = integrationService.calculateInvestmentAffectedNeeds(testSettlement, [testCharacters[0]]);
      
      expect(investmentResult.needs.food).toBeGreaterThan(baseResult.needs.food);
    });

    it('should improve shelter satisfaction with infrastructure investments', () => {
      const baseResult = basicNeedsService.calculateSatisfactionLevel(testSettlement);
      const investmentResult = integrationService.calculateInvestmentAffectedNeeds(testSettlement, [testCharacters[1]]);
      
      expect(investmentResult.needs.shelter).toBeGreaterThan(baseResult.needs.shelter);
    });

    it('should improve goods satisfaction with trade investments', () => {
      const baseResult = basicNeedsService.calculateSatisfactionLevel(testSettlement);
      const investmentResult = integrationService.calculateInvestmentAffectedNeeds(testSettlement, [testCharacters[2]]);
      
      expect(investmentResult.needs.goods).toBeGreaterThan(baseResult.needs.goods);
    });

    it('should apply effects to multiple needs simultaneously', () => {
      const baseResult = basicNeedsService.calculateSatisfactionLevel(testSettlement);
      const investmentResult = integrationService.calculateInvestmentAffectedNeeds(testSettlement, testCharacters);
      
      expect(investmentResult.needs.food).toBeGreaterThan(baseResult.needs.food);
      expect(investmentResult.needs.shelter).toBeGreaterThan(baseResult.needs.shelter);
      expect(investmentResult.needs.goods).toBeGreaterThan(baseResult.needs.goods);
    });
  });

  describe('Investment Consequences', () => {
    it('should generate positive consequences for successful investments', () => {
      // Create scenario with high investment effects
      const highInvestmentCharacters = testCharacters.map(char => ({
        ...char,
        investments: char.investments.map(inv => ({
          ...inv,
          value: inv.value * 3 // Larger investments
        }))
      }));

      const result = integrationService.calculateInvestmentAffectedNeeds(testSettlement, highInvestmentCharacters);
      
      const boomConsequences = result.consequences.filter(c => c.type === 'investment_boom');
      expect(boomConsequences.length).toBeGreaterThan(0);
    });

    it('should generate failure consequences when investments do not help enough', () => {
      // Create a settlement with very poor conditions
      const poorSettlement = {
        ...testSettlement,
        population: { total: 1000 }, // High population
        resources: {
          amounts: { food: 5, water: 3, goods: 2 }, // Very low resources
          production: { food: 1, water: 1, goods: 1 },
          storage: { food: 10, water: 8, goods: 5 }
        }
      };

      const result = integrationService.calculateInvestmentAffectedNeeds(poorSettlement, testCharacters);
      
      const failureConsequences = result.consequences.filter(c => c.type === 'investment_failure');
      expect(failureConsequences.length).toBeGreaterThan(0);
    });
  });

  describe('Historical Events', () => {
    it('should generate economic boom events for highly successful investments', () => {
      const result = integrationService.calculateInvestmentAffectedNeeds(testSettlement, testCharacters);
      
      // Look for positive historical events
      const positiveEvents = result.historicalEvents.filter(e => e.impact === 'positive');
      expect(positiveEvents.length).toBeGreaterThan(0);
    });

    it('should include involved characters in historical events', () => {
      const result = integrationService.calculateInvestmentAffectedNeeds(testSettlement, testCharacters);
      
      const validCharacterIds = testCharacters.map(c => c.id);
      
      result.historicalEvents.forEach(event => {
        expect(Array.isArray(event.involvedCharacters)).toBe(true);
        
        // Check that all involved characters are valid
        const allCharactersValid = event.involvedCharacters.every(charId => 
          validCharacterIds.includes(charId)
        );
        expect(allCharactersValid).toBe(true);
      });
    });
  });

  describe('Settlement Resource Updates', () => {
    it('should apply investment effects to settlement resources', () => {
      const investmentEffects = {
        food: 1.2,
        water: 1.1,
        goods: 1.15,
        infrastructure: 1.1
      };

      const updatedSettlement = integrationService.applyInvestmentEffectsToSettlement(testSettlement, investmentEffects);
      
      expect(updatedSettlement.resources.production.food).toBeGreaterThan(testSettlement.resources.production.food);
      expect(updatedSettlement.resources.production.water).toBeGreaterThan(testSettlement.resources.production.water);
      expect(updatedSettlement.resources.production.goods).toBeGreaterThan(testSettlement.resources.production.goods);
    });

    it('should improve building efficiency with infrastructure investments', () => {
      const investmentEffects = { infrastructure: 1.2 };
      const updatedSettlement = integrationService.applyInvestmentEffectsToSettlement(testSettlement, investmentEffects);
      
      updatedSettlement.buildings.forEach(building => {
        expect(building.efficiency || 1.0).toBeGreaterThanOrEqual(1.0);
      });
    });

    it('should improve trade efficiency with trade investments', () => {
      const investmentEffects = { trade: 1.25 };
      const updatedSettlement = integrationService.applyInvestmentEffectsToSettlement(testSettlement, investmentEffects);
      
      updatedSettlement.economy.trade.forEach(trade => {
        expect(trade.efficiency || 1.0).toBeGreaterThanOrEqual(1.0);
      });
    });
  });

  describe('Investment Recommendations', () => {
    it('should recommend investment in underinvested areas', () => {
      // Use only farm investment to create imbalance
      const singleInvestorResult = integrationService.calculateInvestmentAffectedNeeds(testSettlement, [testCharacters[0]]);
      
      const underinvestedRecommendations = singleInvestorResult.investmentAnalysis.recommendations.filter(
        r => r.type === 'underinvested'
      );
      
      expect(underinvestedRecommendations.length).toBeGreaterThan(0);
    });

    it('should warn about overinvestment and diminishing returns', () => {
      // Create scenario with excessive investment in one area
      const overInvestedCharacter = {
        id: 'char_over',
        name: 'Over Investor',
        investments: Array.from({ length: 5 }, (_, i) => ({
          id: `over_inv_${i}`,
          type: 'farmland',
          settlementId: 'settlement_1',
          value: 100,
          status: 'active',
          returns: { food: 10 }
        }))
      };

      const result = integrationService.calculateInvestmentAffectedNeeds(testSettlement, [overInvestedCharacter]);
      
      const overinvestedRecommendations = result.investmentAnalysis.recommendations.filter(
        r => r.type === 'overinvested'
      );
      
      expect(overinvestedRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid settlement data gracefully', () => {
      expect(() => {
        integrationService.calculateInvestmentAffectedNeeds(null, testCharacters);
      }).toThrow('Settlement is required');

      expect(() => {
        integrationService.calculateInvestmentAffectedNeeds({}, testCharacters);
      }).toThrow('Settlement must have an id');
    });

    it('should handle invalid character data gracefully', () => {
      expect(() => {
        integrationService.calculateInvestmentAffectedNeeds(testSettlement, 'not an array');
      }).toThrow('Characters must be an array');

      expect(() => {
        integrationService.calculateInvestmentAffectedNeeds(testSettlement, [{}]);
      }).toThrow('Character at index 0 must have an id');
    });

    it('should return default results on calculation failure', () => {
      // Use a valid settlement structure but with malformed data that could cause calculation errors
      const problematicSettlement = { 
        id: 'test', 
        name: 'test', 
        population: { total: 100 }, 
        resources: { 
          amounts: 'invalid', // This should cause calculation errors down the line
          production: null,
          storage: undefined
        }
      };
      const result = integrationService.calculateInvestmentAffectedNeeds(problematicSettlement, []);
      
      expect(result).toBeDefined();
      expect(result.needs).toBeDefined();
      expect(result.overall).toBe(0.5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle characters with no investments', () => {
      const charactersWithoutInvestments = [
        { id: 'char_empty', name: 'Empty' },
        { id: 'char_null', name: 'Null', investments: null },
        { id: 'char_empty_array', name: 'Empty Array', investments: [] }
      ];

      const result = integrationService.calculateInvestmentAffectedNeeds(testSettlement, charactersWithoutInvestments);
      
      expect(result.investmentAnalysis.totalInvestments).toBe(0);
      expect(result.investmentAnalysis.activeInvestors).toBe(0);
    });

    it('should handle investments in different settlements', () => {
      const mixedCharacters = [
        {
          id: 'char_mixed',
          name: 'Mixed Investor',
          investments: [
            {
              id: 'inv_wrong_settlement',
              type: 'farmland',
              settlementId: 'different_settlement',
              value: 100,
              status: 'active'
            },
            {
              id: 'inv_correct_settlement',
              type: 'infrastructure',
              settlementId: 'settlement_1',
              value: 200,
              status: 'active'
            }
          ]
        }
      ];

      const result = integrationService.calculateInvestmentAffectedNeeds(testSettlement, mixedCharacters);
      
      expect(result.investmentAnalysis.totalInvestments).toBe(1); // Only the correct settlement
      expect(result.investmentAnalysis.totalInvestmentValue).toBe(200);
    });

    it('should handle inactive investments', () => {
      const charactersWithInactiveInvestments = [
        {
          id: 'char_inactive',
          name: 'Inactive Investor',
          investments: [
            {
              id: 'inv_inactive',
              type: 'farmland',
              settlementId: 'settlement_1',
              value: 100,
              status: 'failed'
            }
          ]
        }
      ];

      const result = integrationService.calculateInvestmentAffectedNeeds(testSettlement, charactersWithInactiveInvestments);
      
      expect(result.investmentAnalysis.totalInvestments).toBe(0);
      expect(result.investmentEffects.food).toBe(1.0); // No effect from inactive investment
    });
  });
});
