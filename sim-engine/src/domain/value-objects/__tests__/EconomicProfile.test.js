// src/domain/value-objects/__tests__/EconomicProfile.test.js

import EconomicProfile from '../EconomicProfile.js';
import { ValidationError, SerializationError } from '../../../shared/types/ValueObjectTypes.js';

describe('EconomicProfile', () => {
  describe('Construction and Validation', () => {
    test('should create a valid EconomicProfile with default values', () => {
      const profile = new EconomicProfile();
      
      expect(profile.wealth).toBe(0);
      expect(profile.passiveIncome).toBe(0);
      expect(profile.investments).toEqual([]);
      expect(profile.goals).toEqual({});
      expect(profile.history).toBeDefined();
      expect(profile.metadata).toBeDefined();
    });

    test('should create EconomicProfile with provided values', () => {
      const config = {
        wealth: 1000,
        passiveIncome: 50,
        investments: [
          {
            id: 'inv1',
            type: 'savings',
            value: 500,
            expectedReturn: 0.02,
            riskLevel: 'low'
          }
        ],
        goals: {
          wealth_target: {
            target: 5000,
            deadline: new Date('2025-12-31')
          }
        }
      };

      const profile = new EconomicProfile(config);
      
      expect(profile.wealth).toBe(1000);
      expect(profile.passiveIncome).toBe(50);
      expect(profile.investments).toHaveLength(1);
      expect(profile.investments[0].id).toBe('inv1');
      expect(profile.goals.wealth_target).toBeDefined();
    });

    test('should validate wealth bounds', () => {
      expect(() => {
        new EconomicProfile({ wealth: -100 });
      }).toThrow(ValidationError);
    });

    test('should validate passive income bounds', () => {
      expect(() => {
        new EconomicProfile({ passiveIncome: -50 });
      }).toThrow(ValidationError);
    });

    test('should validate investment structure', () => {
      expect(() => {
        new EconomicProfile({
          investments: [
            { /* missing required fields */ }
          ]
        });
      }).toThrow(ValidationError);
    });

    test('should validate investment risk levels', () => {
      expect(() => {
        new EconomicProfile({
          investments: [
            {
              id: 'inv1',
              type: 'test',
              value: 100,
              riskLevel: 'invalid_risk'
            }
          ]
        });
      }).toThrow(ValidationError);
    });

    test('should validate goal types', () => {
      expect(() => {
        new EconomicProfile({
          goals: {
            invalid_goal_type: { target: 1000 }
          }
        });
      }).toThrow(ValidationError);
    });

    test('should validate metadata values', () => {
      expect(() => {
        new EconomicProfile({
          metadata: {
            riskTolerance: 'invalid_tolerance'
          }
        });
      }).toThrow(ValidationError);
    });
  });

  describe('Getter Methods', () => {
    let profile;

    beforeEach(() => {
      profile = new EconomicProfile({
        wealth: 1000,
        investments: [
          { id: 'inv1', type: 'savings', value: 300, expectedReturn: 0.02, riskLevel: 'low' },
          { id: 'inv2', type: 'farmland', value: 500, expectedReturn: 0.15, riskLevel: 'moderate' },
          { id: 'inv3', type: 'farmland', value: 200, expectedReturn: 0.15, riskLevel: 'moderate' }
        ]
      });
    });

    test('should calculate total investment value', () => {
      expect(profile.getTotalInvestmentValue()).toBe(1000);
    });

    test('should calculate total value', () => {
      expect(profile.getTotalValue()).toBe(2000); // 1000 wealth + 1000 investments
    });

    test('should get investments by type', () => {
      const farmlandInvestments = profile.getInvestmentsByType('farmland');
      expect(farmlandInvestments).toHaveLength(2);
      expect(farmlandInvestments[0].type).toBe('farmland');
    });

    test('should calculate portfolio diversification', () => {
      const diversification = profile.getPortfolioDiversification();
      
      expect(diversification.types).toHaveLength(2); // savings and farmland
      expect(diversification.diversificationScore).toBeGreaterThan(0);
      expect(diversification.diversificationScore).toBeLessThan(1);
      
      const savingsType = diversification.types.find(t => t.type === 'savings');
      expect(savingsType.percentage).toBe(30); // 300/1000 * 100
    });

    test('should assess portfolio risk', () => {
      const risk = profile.getPortfolioRisk();
      
      expect(risk.averageRisk).toBeDefined();
      expect(risk.riskScore).toBeGreaterThan(0);
      expect(risk.riskDistribution).toBeDefined();
      expect(risk.riskDistribution.low).toBe(30); // savings portion
      expect(risk.riskDistribution.moderate).toBe(70); // farmland portion
    });

    test('should calculate expected return', () => {
      const expectedReturn = profile.getExpectedReturn();
      
      // Weighted average: (300*0.02 + 500*0.15 + 200*0.15) / 1000 = 0.111
      expect(expectedReturn).toBeCloseTo(0.111, 3);
    });
  });

  describe('Immutable Updates', () => {
    let originalProfile;

    beforeEach(() => {
      originalProfile = new EconomicProfile({
        wealth: 1000,
        passiveIncome: 50,
        investments: [
          { id: 'inv1', type: 'savings', value: 300, expectedReturn: 0.02, riskLevel: 'low' }
        ]
      });
    });

    test('should create new instance with updated wealth', () => {
      const newProfile = originalProfile.withWealth(1500);
      
      expect(newProfile).not.toBe(originalProfile);
      expect(newProfile.wealth).toBe(1500);
      expect(originalProfile.wealth).toBe(1000); // Original unchanged
    });

    test('should create new instance with updated passive income', () => {
      const newProfile = originalProfile.withPassiveIncome(75);
      
      expect(newProfile).not.toBe(originalProfile);
      expect(newProfile.passiveIncome).toBe(75);
      expect(originalProfile.passiveIncome).toBe(50);
    });

    test('should create new instance with added investment', () => {
      const newInvestment = {
        id: 'inv2',
        type: 'farmland',
        value: 400,
        expectedReturn: 0.15,
        riskLevel: 'moderate'
      };

      const newProfile = originalProfile.withInvestment(newInvestment);
      
      expect(newProfile).not.toBe(originalProfile);
      expect(newProfile.investments).toHaveLength(2);
      expect(newProfile.history.totalInvested).toBe(400);
      expect(newProfile.history.investmentCount).toBe(1);
      expect(originalProfile.investments).toHaveLength(1); // Original unchanged
    });

    test('should create new instance with removed investment', () => {
      const newProfile = originalProfile.withoutInvestment('inv1');
      
      expect(newProfile).not.toBe(originalProfile);
      expect(newProfile.investments).toHaveLength(0);
      expect(newProfile.history.totalReturns).toBe(300); // Original investment value returned
      expect(originalProfile.investments).toHaveLength(1); // Original unchanged
    });

    test('should return same instance when removing non-existent investment', () => {
      const newProfile = originalProfile.withoutInvestment('non-existent');
      
      expect(newProfile).toBe(originalProfile);
    });

    test('should create new instance with updated investment', () => {
      const updates = { value: 400, expectedReturn: 0.03 };
      const newProfile = originalProfile.withUpdatedInvestment('inv1', updates);
      
      expect(newProfile).not.toBe(originalProfile);
      expect(newProfile.investments[0].value).toBe(400);
      expect(newProfile.investments[0].expectedReturn).toBe(0.03);
      expect(originalProfile.investments[0].value).toBe(300); // Original unchanged
    });

    test('should create new instance with updated goals', () => {
      const newGoals = {
        wealth_target: {
          target: 10000,
          deadline: new Date('2026-01-01')
        }
      };

      const newProfile = originalProfile.withGoals(newGoals);
      
      expect(newProfile).not.toBe(originalProfile);
      expect(newProfile.goals.wealth_target.target).toBe(10000);
      expect(Object.keys(originalProfile.goals)).toHaveLength(0); // Original unchanged
    });

    test('should create new instance with investment returns applied', () => {
      const newProfile = originalProfile.withInvestmentReturns(100);
      
      expect(newProfile).not.toBe(originalProfile);
      expect(newProfile.wealth).toBe(1100); // 1000 + 100
      expect(newProfile.passiveIncome).toBe(60); // 50 + (100 * 0.1)
      expect(newProfile.history.totalReturns).toBe(100);
      expect(originalProfile.wealth).toBe(1000); // Original unchanged
    });
  });

  describe('Serialization', () => {
    let profile;

    beforeEach(() => {
      profile = new EconomicProfile({
        wealth: 1000,
        passiveIncome: 50,
        investments: [
          {
            id: 'inv1',
            type: 'savings',
            value: 300,
            expectedReturn: 0.02,
            riskLevel: 'low',
            maturityDate: new Date('2025-12-31')
          }
        ],
        goals: {
          wealth_target: {
            target: 5000,
            deadline: new Date('2025-06-01')
          }
        }
      });
    });

    test('should serialize to JSON correctly', () => {
      const json = profile.toJSON();
      
      expect(json).toBeDefined();
      expect(json.wealth).toBe(1000);
      expect(json.passiveIncome).toBe(50);
      expect(json.investments).toHaveLength(1);
      expect(json.investments[0].maturityDate).toBe('2025-12-31T00:00:00.000Z');
      expect(json.goals.wealth_target.deadline).toBe('2025-06-01T00:00:00.000Z');
    });

    test('should deserialize from JSON correctly', () => {
      const json = profile.toJSON();
      const deserializedProfile = EconomicProfile.fromJSON(json);
      
      expect(deserializedProfile).toBeInstanceOf(EconomicProfile);
      expect(deserializedProfile.wealth).toBe(profile.wealth);
      expect(deserializedProfile.passiveIncome).toBe(profile.passiveIncome);
      expect(deserializedProfile.investments).toHaveLength(1);
      expect(deserializedProfile.investments[0].maturityDate).toBeInstanceOf(Date);
      expect(deserializedProfile.goals.wealth_target.deadline).toBeInstanceOf(Date);
    });

    test('should handle serialization round-trip', () => {
      const json = profile.toJSON();
      const deserializedProfile = EconomicProfile.fromJSON(json);
      const jsonAgain = deserializedProfile.toJSON();
      
      expect(JSON.stringify(json)).toBe(JSON.stringify(jsonAgain));
    });

    test('should throw SerializationError for invalid JSON', () => {
      expect(() => {
        EconomicProfile.fromJSON(null);
      }).toThrow(SerializationError);

      expect(() => {
        EconomicProfile.fromJSON('invalid');
      }).toThrow(SerializationError);
    });
  });

  describe('Static Factory Methods', () => {
    test('should create default profile', () => {
      const profile = EconomicProfile.createDefault();
      
      expect(profile).toBeInstanceOf(EconomicProfile);
      expect(profile.wealth).toBe(0);
      expect(profile.passiveIncome).toBe(0);
      expect(profile.investments).toHaveLength(0);
      expect(profile.metadata.riskTolerance).toBe('moderate');
    });

    test('should create starter profile with initial wealth', () => {
      const profile = EconomicProfile.createStarter(500);
      
      expect(profile).toBeInstanceOf(EconomicProfile);
      expect(profile.wealth).toBe(500);
      expect(profile.goals.wealth_target).toBeDefined();
      expect(profile.goals.wealth_target.target).toBe(5000); // 10x initial wealth
    });

    test('should create starter profile with default wealth', () => {
      const profile = EconomicProfile.createStarter();
      
      expect(profile).toBeInstanceOf(EconomicProfile);
      expect(profile.wealth).toBe(100);
      expect(profile.goals.wealth_target.target).toBe(1000);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty investments array', () => {
      const profile = new EconomicProfile({ investments: [] });
      
      expect(profile.getTotalInvestmentValue()).toBe(0);
      expect(profile.getPortfolioDiversification().diversificationScore).toBe(0);
      expect(profile.getPortfolioRisk().averageRisk).toBe('none');
      expect(profile.getExpectedReturn()).toBe(0);
    });

    test('should handle single investment', () => {
      const profile = new EconomicProfile({
        investments: [
          { id: 'inv1', type: 'savings', value: 1000, expectedReturn: 0.02, riskLevel: 'low' }
        ]
      });
      
      expect(profile.getPortfolioDiversification().diversificationScore).toBe(0); // No diversification with one type
      expect(profile.getPortfolioRisk().averageRisk).toBe('low');
    });

    test('should handle maximum values', () => {
      const profile = new EconomicProfile({
        wealth: Number.MAX_SAFE_INTEGER,
        passiveIncome: Number.MAX_SAFE_INTEGER
      });
      
      expect(profile.wealth).toBe(Number.MAX_SAFE_INTEGER);
      expect(profile.passiveIncome).toBe(Number.MAX_SAFE_INTEGER);
    });

    test('should handle zero wealth and investments', () => {
      const profile = new EconomicProfile({
        wealth: 0,
        investments: []
      });
      
      expect(profile.getTotalValue()).toBe(0);
      expect(() => profile.toJSON()).not.toThrow();
    });
  });

  describe('Immutability', () => {
    test('should be immutable after construction', () => {
      const profile = new EconomicProfile({
        wealth: 1000,
        investments: [{ id: 'inv1', type: 'savings', value: 100 }]
      });
      
      expect(() => {
        profile.wealth = 2000;
      }).toThrow();

      expect(() => {
        profile.investments.push({ id: 'inv2', type: 'test', value: 200 });
      }).toThrow();

      expect(() => {
        profile.investments[0].value = 500;
      }).toThrow();
    });
  });
});
