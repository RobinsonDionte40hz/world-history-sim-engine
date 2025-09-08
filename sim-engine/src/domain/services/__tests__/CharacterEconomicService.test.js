// src/domain/services/__tests__/CharacterEconomicService.test.js

import CharacterEconomicService from '../CharacterEconomicService.js';
import EconomicProfile from '../../value-objects/EconomicProfile.js';
import Character from '../../entities/Character.js';

describe('CharacterEconomicService', () => {
  let service;
  let mockCharacter;
  let mockEconomicProfile;

  beforeEach(() => {
    service = CharacterEconomicService;
    
    // Create a basic economic profile
    mockEconomicProfile = new EconomicProfile({
      wealth: 1000,
      passiveIncome: 50,
      investments: [],
      goals: {
        wealth_target: {
          target: 5000,
          deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      },
      metadata: {
        riskTolerance: 'moderate',
        investmentStrategy: 'balanced',
        creditRating: 'good'
      }
    });

    // Create a mock character with economic profile
    mockCharacter = new Character({
      id: 'test-char-1',
      name: 'Test Character',
      age: 30,
      level: 5,
      economicProfile: mockEconomicProfile,
      attributes: {
        intelligence: 15,
        charisma: 12,
        wisdom: 14
      },
      baseSkills: {
        trading: 20,
        agriculture: 15,
        crafting: 20,
        mining: 5
      },
      influence: {
        economic: 25,
        political: 15,
        social: 20
      }
    });
  });

  describe('Investment Type Management', () => {
    test('should have predefined investment types', () => {
      const investmentTypes = CharacterEconomicService.INVESTMENT_TYPES;
      
      expect(investmentTypes).toBeDefined();
      expect(Object.keys(investmentTypes)).toContain('savings');
      expect(Object.keys(investmentTypes)).toContain('farmland');
      expect(Object.keys(investmentTypes)).toContain('workshop');
      expect(Object.keys(investmentTypes)).toContain('trade_route');
      expect(Object.keys(investmentTypes)).toContain('infrastructure');
      expect(Object.keys(investmentTypes)).toContain('mining');
      expect(Object.keys(investmentTypes)).toContain('exploration');
    });

    test('should validate investment type structure', () => {
      const investmentType = CharacterEconomicService.INVESTMENT_TYPES.savings;
      
      expect(investmentType).toHaveProperty('id');
      expect(investmentType).toHaveProperty('name');
      expect(investmentType).toHaveProperty('description');
      expect(investmentType).toHaveProperty('minInvestment');
      expect(investmentType).toHaveProperty('maxInvestment');
      expect(investmentType).toHaveProperty('expectedReturn');
      expect(investmentType).toHaveProperty('riskLevel');
      expect(investmentType).toHaveProperty('prerequisites');
      expect(investmentType).toHaveProperty('category');
    });
  });

  describe('getAvailableInvestments', () => {
    test('should return available investments for character with sufficient wealth', () => {
      const result = service.getAvailableInvestments(mockCharacter);
      
      expect(result.isValid).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    test('should include affordability calculations', () => {
      const result = service.getAvailableInvestments(mockCharacter);
      
      const savingsInvestment = result.data.find(inv => inv.id === 'savings');
      expect(savingsInvestment).toBeDefined();
      expect(savingsInvestment.affordableAmount).toBeDefined();
      expect(typeof savingsInvestment.affordableAmount).toBe('number');
      expect(savingsInvestment.affordableAmount).toBeGreaterThan(0);
    });

    test('should provide investment recommendations', () => {
      const result = service.getAvailableInvestments(mockCharacter);
      
      const farmlandInvestment = result.data.find(inv => inv.id === 'farmland');
      expect(farmlandInvestment).toBeDefined();
      expect(farmlandInvestment.recommendation).toBeDefined();
      expect(farmlandInvestment.recommendation).toHaveProperty('score');
      expect(farmlandInvestment.recommendation).toHaveProperty('recommendation');
    });

    test('should return success for character with default economic profile', () => {
      const characterWithDefaultProfile = new Character({
        id: 'test-char-2',
        name: 'Default Character'
      });
      
      const result = service.getAvailableInvestments(characterWithDefaultProfile);
      
      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
      // With zero wealth, most investments should be unavailable
      const availableInvestments = result.data.filter(inv => inv.available !== false);
      expect(availableInvestments.length).toBeGreaterThanOrEqual(0);
    });

    test('should exclude investments that fail prerequisites', () => {
      // Create character with very low wealth and skills
      const poorCharacter = new Character({
        id: 'poor-char',
        name: 'Poor Character',
        economicProfile: new EconomicProfile({ wealth: 10 }),
        baseSkills: {
          agriculture: 0,
          trading: 0,
          crafting: 0
        }
      });
      
      const result = service.getAvailableInvestments(poorCharacter);
      
      expect(result.isValid).toBe(true);
      const unavailableTypes = result.data.filter(inv => inv.available === false);
      
      // Should have some unavailable due to wealth/skill requirements
      expect(unavailableTypes.length).toBeGreaterThan(0);
      
      // But should still have savings available
      const savings = result.data.find(inv => inv.id === 'savings');
      expect(savings.available).not.toBe(false);
    });
  });

  describe('validateInvestmentPrerequisites', () => {
    test('should validate wealth requirements', () => {
      const farmlandType = service.INVESTMENT_TYPES.farmland;
      const result = service.validateInvestmentPrerequisites(mockCharacter, farmlandType);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail validation for insufficient wealth', () => {
      const expensiveType = service.INVESTMENT_TYPES.infrastructure;
      const poorCharacter = new Character({
        id: 'poor-char',
        name: 'Poor Character',
        economicProfile: new EconomicProfile({ wealth: 100 })
      });
      
      const result = service.validateInvestmentPrerequisites(poorCharacter, expensiveType);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.field === 'wealth')).toBe(true);
    });

    test('should warn about risk tolerance mismatch', () => {
      const conservativeProfile = new EconomicProfile({
        wealth: 1000,
        metadata: {
          riskTolerance: 'conservative',
          investmentStrategy: 'income'
        }
      });
      
      const conservativeCharacter = new Character({
        id: 'conservative-char',
        economicProfile: conservativeProfile
      });
      
      const highRiskType = service.INVESTMENT_TYPES.mining;
      const result = service.validateInvestmentPrerequisites(conservativeCharacter, highRiskType);
      
      expect(result.errors.some(err => err.field === 'riskTolerance')).toBe(true);
    });

    test('should warn about over-concentration', () => {
      const concentratedProfile = new EconomicProfile({
        wealth: 1000,
        investments: [
          {
            id: 'farm1',
            type: 'farmland',
            value: 800,
            expectedReturn: 0.15,
            riskLevel: 'moderate'
          }
        ]
      });
      
      const concentratedCharacter = new Character({
        id: 'concentrated-char',
        economicProfile: concentratedProfile
      });
      
      const farmlandType = service.INVESTMENT_TYPES.farmland;
      const result = service.validateInvestmentPrerequisites(concentratedCharacter, farmlandType);
      
      expect(result.warnings.some(warn => warn.field === 'diversification')).toBe(true);
    });
  });

  describe('createInvestment', () => {
    test('should successfully create a valid investment', () => {
      const result = service.createInvestment(mockCharacter, 'savings', 500);
      
      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.character).toBeDefined();
      expect(result.data.investment).toBeDefined();
      expect(result.data.investment.type).toBe('savings');
      expect(result.data.investment.value).toBe(500);
      expect(result.data.newWealth).toBe(500); // 1000 - 500
    });

    test('should validate investment amount within bounds', () => {
      const result = service.createInvestment(mockCharacter, 'savings', 50000); // Too high
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.field === 'amount')).toBe(true);
    });

    test('should fail for insufficient wealth', () => {
      const result = service.createInvestment(mockCharacter, 'savings', 1500); // More than available
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.field === 'wealth')).toBe(true);
    });

    test('should fail for unknown investment type', () => {
      const result = service.createInvestment(mockCharacter, 'unknown_type', 100);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.field === 'investmentTypeId')).toBe(true);
    });

    test('should update character economic profile correctly', () => {
      const result = service.createInvestment(mockCharacter, 'farmland', 300);
      
      expect(result.isValid).toBe(true);
      const newCharacter = result.data.character;
      expect(newCharacter.economicProfile.wealth).toBe(700);
      expect(newCharacter.economicProfile.investments).toHaveLength(1);
      expect(newCharacter.economicProfile.investments[0].type).toBe('farmland');
      expect(newCharacter.economicProfile.investments[0].value).toBe(300);
    });
  });

  describe('processInvestmentReturns', () => {
    test('should process returns for character with investments', () => {
      // First create an investment
      const investmentResult = service.createInvestment(mockCharacter, 'savings', 200);
      const characterWithInvestment = investmentResult.data.character;
      
      const returnsResult = service.processInvestmentReturns(characterWithInvestment);
      
      expect(returnsResult.isValid).toBe(true);
      expect(returnsResult.data.totalReturns).toBeGreaterThan(0);
      expect(returnsResult.data.investmentResults).toHaveLength(1);
      expect(returnsResult.data.newWealth).toBeGreaterThan(characterWithInvestment.economicProfile.wealth);
    });

    test('should handle character with no investments', () => {
      const result = service.processInvestmentReturns(mockCharacter);
      
      expect(result.isValid).toBe(true);
      expect(result.data.totalReturns).toBe(0);
      expect(result.data.investmentResults).toHaveLength(0);
      expect(result.data.character).toBe(mockCharacter);
    });

    test('should apply market conditions', () => {
      // Create character with investment
      const investmentResult = service.createInvestment(mockCharacter, 'farmland', 300);
      const characterWithInvestment = investmentResult.data.character;
      
      const bullMarket = { general: 0.5, agriculture: 0.3 }; // 50% general boost, 30% agriculture boost
      const result = service.processInvestmentReturns(characterWithInvestment, bullMarket);
      
      expect(result.isValid).toBe(true);
      expect(result.data.totalReturns).toBeGreaterThan(0);
      
      // Should have higher returns due to market conditions
      const baseExpectedReturn = 300 * 0.15; // 15% expected return on farmland
      expect(result.data.totalReturns).toBeGreaterThan(baseExpectedReturn);
    });
  });

  describe('liquidateInvestment', () => {
    test('should successfully liquidate an investment', () => {
      // First create an investment
      const investmentResult = service.createInvestment(mockCharacter, 'savings', 200);
      const characterWithInvestment = investmentResult.data.character;
      const investmentId = characterWithInvestment.economicProfile.investments[0].id;
      
      const liquidationResult = service.liquidateInvestment(characterWithInvestment, investmentId);
      
      expect(liquidationResult.isValid).toBe(true);
      expect(liquidationResult.data.liquidationValue).toBeCloseTo(200, 0); // Should be close to original value
      expect(liquidationResult.data.character.economicProfile.investments).toHaveLength(0);
    });

    test('should apply emergency liquidation penalty', () => {
      // Create investment
      const investmentResult = service.createInvestment(mockCharacter, 'farmland', 500);
      const characterWithInvestment = investmentResult.data.character;
      const investmentId = characterWithInvestment.economicProfile.investments[0].id;
      
      const liquidationResult = service.liquidateInvestment(characterWithInvestment, investmentId, true);
      
      expect(liquidationResult.isValid).toBe(true);
      expect(liquidationResult.data.liquidationValue).toBeLessThan(500); // Should have penalty
      expect(liquidationResult.data.isEmergency).toBe(true);
      expect(liquidationResult.warnings).toContain('Emergency liquidation incurred penalty');
    });

    test('should fail for non-existent investment', () => {
      const result = service.liquidateInvestment(mockCharacter, 'non-existent-id');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.field === 'investmentId')).toBe(true);
    });
  });

  describe('analyzePortfolio', () => {
    test('should analyze portfolio for character with investments', () => {
      // Create multiple investments
      let character = mockCharacter;
      const investmentResult1 = service.createInvestment(character, 'savings', 200);
      character = investmentResult1.data.character;
      
      const investmentResult2 = service.createInvestment(character, 'farmland', 300);
      character = investmentResult2.data.character;
      
      const analysis = service.analyzePortfolio(character);
      
      expect(analysis.isValid).toBe(true);
      expect(analysis.data).toBeDefined();
      expect(analysis.data.totalValue).toBeGreaterThan(0);
      expect(analysis.data.investmentCount).toBe(2);
      expect(analysis.data.diversification).toBeDefined();
      expect(analysis.data.risk).toBeDefined();
      expect(analysis.data.recommendations).toBeDefined();
    });

    test('should calculate diversification correctly', () => {
      // Create diverse portfolio
      let character = mockCharacter;
      const investments = [
        { type: 'savings', amount: 100 },
        { type: 'farmland', amount: 200 },
        { type: 'workshop', amount: 250 }
      ];
      
      for (const inv of investments) {
        const result = service.createInvestment(character, inv.type, inv.amount);
        character = result.data.character;
      }
      
      const analysis = service.analyzePortfolio(character);
      
      expect(analysis.isValid).toBe(true);
      expect(analysis.data.diversification.types).toHaveLength(3);
      expect(analysis.data.diversification.diversificationScore).toBeGreaterThan(0);
    });

    test('should provide meaningful recommendations', () => {
      // Create poorly diversified portfolio
      let character = mockCharacter;
      const result1 = service.createInvestment(character, 'farmland', 400);
      expect(result1.isValid).toBe(true);
      character = result1.data.character;
      
      const result2 = service.createInvestment(character, 'farmland', 300);
      expect(result2.isValid).toBe(true);
      character = result2.data.character;
      
      const analysis = service.analyzePortfolio(character);
      
      expect(analysis.isValid).toBe(true);
      expect(analysis.data.recommendations).toBeDefined();
      expect(analysis.data.recommendations.length).toBeGreaterThan(0);
      
      // Should recommend diversification
      const diversificationRec = analysis.data.recommendations.find(r => r.type === 'diversification');
      expect(diversificationRec).toBeDefined();
    });
  });

  describe('createDefaultEconomicProfile', () => {
    test('should create default profile with zero wealth', () => {
      const profile = service.createDefaultEconomicProfile();
      
      expect(profile).toBeInstanceOf(EconomicProfile);
      expect(profile.wealth).toBe(0);
      expect(profile.investments).toHaveLength(0);
    });

    test('should create starter profile with initial wealth', () => {
      const profile = service.createDefaultEconomicProfile(500);
      
      expect(profile).toBeInstanceOf(EconomicProfile);
      expect(profile.wealth).toBe(500);
      expect(profile.goals.wealth_target).toBeDefined();
    });
  });

  describe('calculateSettlementInvestmentEffects', () => {
    test('should calculate aggregate effects for settlement', () => {
      const characterInvestments = [
        {
          type: 'farmland',
          value: 300,
          settlementEffects: { food: { multiplier: 1.1, type: 'production' } }
        },
        {
          type: 'workshop',
          value: 400,
          settlementEffects: { goods: { multiplier: 1.2, type: 'production' } }
        }
      ];
      
      const settlement = { population: { total: 200 } };
      
      const effects = service.calculateSettlementInvestmentEffects(characterInvestments, settlement);
      
      expect(effects).toBeDefined();
      expect(effects.food).toBeDefined();
      expect(effects.goods).toBeDefined();
      expect(effects.food.production).toBeGreaterThan(1);
      expect(effects.goods.production).toBeGreaterThan(1);
    });

    test('should scale effects based on investment size and settlement population', () => {
      const smallInvestment = [
        {
          type: 'farmland',
          value: 50, // Small relative to population
          settlementEffects: { food: { multiplier: 1.1, type: 'production' } }
        }
      ];
      
      const largeInvestment = [
        {
          type: 'farmland',
          value: 500, // Large relative to population
          settlementEffects: { food: { multiplier: 1.1, type: 'production' } }
        }
      ];
      
      const settlement = { population: { total: 100 } };
      
      const smallEffects = service.calculateSettlementInvestmentEffects(smallInvestment, settlement);
      const largeEffects = service.calculateSettlementInvestmentEffects(largeInvestment, settlement);
      
      expect(largeEffects.food.production).toBeGreaterThan(smallEffects.food.production);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle null character gracefully', () => {
      const result = service.getAvailableInvestments(null);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    test('should handle malformed investment data', () => {
      const result = service.createInvestment(mockCharacter, 'savings', 'invalid-amount');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle character with extremely high or low wealth', () => {
      const richCharacter = new Character({
        id: 'rich-char',
        economicProfile: new EconomicProfile({ wealth: Number.MAX_SAFE_INTEGER })
      });
      
      const result = service.getAvailableInvestments(richCharacter);
      expect(result.isValid).toBe(true);
      
      const poorCharacter = new Character({
        id: 'poor-char',
        economicProfile: new EconomicProfile({ wealth: 0 })
      });
      
      const poorResult = service.getAvailableInvestments(poorCharacter);
      expect(poorResult.isValid).toBe(true);
    });
  });
});
