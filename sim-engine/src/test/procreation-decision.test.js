/**
 * Procreation Decision System Tests
 * 
 * Tests the new procreation decision functionality integrated into FamilyDecisionService
 */

import FamilyDecisionService from '../domain/services/FamilyDecisionService.js';

describe('Procreation Decision System', () => {
  let familyDecisionService;
  let mockSettlement;
  let mockMarriedCouple;

  beforeEach(() => {
    familyDecisionService = new FamilyDecisionService();

    // Mock settlement with good conditions for children
    mockSettlement = {
      population: {
        total: 500,
        growth: 0.02
      },
      resources: {
        amounts: {
          food: 120,
          water: 150,
          materials: 80
        }
      },
      government: {
        type: 'council',
        laws: [
          { id: 'safety', description: 'Safety regulations' },
          { id: 'trade', description: 'Trade laws' }
        ]
      },
      economy: {
        averageWealth: 200,
        averageIncome: 60
      }
    };

    // Mock ideal married couple
    mockMarriedCouple = [
      {
        id: 'spouse1',
        age: 28,
        attributes: {
          wisdom: { score: 15 },
          constitution: { score: 14 }
        },
        consciousness: {
          coherence: 0.8
        },
        personality: {
          traits: {
            empathy: 0.8,
            patience: 0.7,
            aggression: 0.2,
            loyalty: 0.9,
            curiosity: 0.6
          }
        },
        resources: {
          wealth: 300,
          income: 80,
          property: 1
        }
      },
      {
        id: 'spouse2',
        age: 26,
        attributes: {
          wisdom: { score: 13 },
          constitution: { score: 16 }
        },
        consciousness: {
          coherence: 0.7
        },
        personality: {
          traits: {
            empathy: 0.9,
            patience: 0.8,
            aggression: 0.1,
            loyalty: 0.8,
            curiosity: 0.7
          }
        },
        resources: {
          wealth: 250,
          income: 70,
          property: 0
        }
      }
    ];
  });

  describe('evaluateProcreationDecision', () => {
    test('should return positive decision for ideal couple', () => {
      const result = familyDecisionService.evaluateProcreationDecision(
        mockMarriedCouple,
        mockSettlement
      );

      expect(result.decision).toBe(true);
      expect(result.probability).toBeGreaterThan(0.6);
      expect(result.factors).toHaveProperty('economicStability');
      expect(result.factors).toHaveProperty('healthFactors');
      expect(result.factors).toHaveProperty('settlementConditions');
      expect(result.factors).toHaveProperty('personalDesire');
      expect(result.factors).toHaveProperty('ageFactors');
      expect(result.reasoning).toContain('assessment favors starting a family');
      expect(result.recommendations).toContain('Proceed with family planning');
    });

    test('should return negative decision for poor economic conditions', () => {
      // Poor economic conditions
      const poorCouple = [
        {
          ...mockMarriedCouple[0],
          resources: { wealth: 10, income: 15, property: 0 }
        },
        {
          ...mockMarriedCouple[1],
          resources: { wealth: 5, income: 10, property: 0 }
        }
      ];

      const result = familyDecisionService.evaluateProcreationDecision(
        poorCouple,
        mockSettlement
      );

      expect(result.decision).toBe(false);
      expect(result.factors.economicStability).toBeLessThan(0.3);
      expect(result.reasoning).toContain('Economic challenges');
      expect(result.recommendations).toContain('Focus on improving economic situation first');
    });

    test('should return negative decision for health concerns', () => {
      // Poor health conditions
      const unhealthyCouple = [
        {
          ...mockMarriedCouple[0],
          attributes: { wisdom: { score: 15 }, constitution: { score: 6 } },
          age: 45
        },
        {
          ...mockMarriedCouple[1],
          attributes: { wisdom: { score: 13 }, constitution: { score: 8 } },
          age: 42
        }
      ];

      const result = familyDecisionService.evaluateProcreationDecision(
        unhealthyCouple,
        mockSettlement
      );

      expect(result.decision).toBe(false);
      expect(result.factors.healthFactors).toBeLessThan(0.4);
      expect(result.factors.ageFactors).toBeLessThan(0.7);
      expect(result.reasoning).toContain('Health concerns');
      expect(result.recommendations).toContain('Address health concerns before procreation');
    });

    test('should handle missing data gracefully', () => {
      const incompleteCouple = [
        { id: 'spouse1', age: 25 },
        { id: 'spouse2', age: 27 }
      ];

      const result = familyDecisionService.evaluateProcreationDecision(
        incompleteCouple,
        {}
      );

      expect(result).toHaveProperty('decision');
      expect(result).toHaveProperty('factors');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('recommendations');
    });

    test('should throw error for invalid input', () => {
      expect(() => {
        familyDecisionService.evaluateProcreationDecision(
          [mockMarriedCouple[0]], // Only one spouse
          mockSettlement
        );
      }).toThrow('marriedCouple must be an array of exactly 2 characters');

      expect(() => {
        familyDecisionService.evaluateProcreationDecision(
          null,
          mockSettlement
        );
      }).toThrow();
    });
  });

  describe('calculateEconomicStability', () => {
    test('should calculate high stability for wealthy couple', () => {
      const result = familyDecisionService.calculateEconomicStability(
        mockMarriedCouple,
        mockSettlement
      );

      expect(result).toBeGreaterThan(0.6);
    });

    test('should calculate low stability for poor couple', () => {
      const poorCouple = [
        {
          ...mockMarriedCouple[0],
          resources: { wealth: 10, income: 15, property: 0 }
        },
        {
          ...mockMarriedCouple[1],
          resources: { wealth: 5, income: 10, property: 0 }
        }
      ];

      const result = familyDecisionService.calculateEconomicStability(
        poorCouple,
        mockSettlement
      );

      expect(result).toBeLessThan(0.4);
    });

    test('should factor in housing ownership', () => {
      const coupleWithHousing = [
        {
          ...mockMarriedCouple[0],
          resources: { wealth: 100, income: 40, property: 1 }
        },
        {
          ...mockMarriedCouple[1],
          resources: { wealth: 100, income: 40, property: 1 }
        }
      ];

      const coupleWithoutHousing = [
        {
          ...mockMarriedCouple[0],
          resources: { wealth: 100, income: 40, property: 0 }
        },
        {
          ...mockMarriedCouple[1],
          resources: { wealth: 100, income: 40, property: 0 }
        }
      ];

      const withHousing = familyDecisionService.calculateEconomicStability(
        coupleWithHousing,
        mockSettlement
      );
      const withoutHousing = familyDecisionService.calculateEconomicStability(
        coupleWithoutHousing,
        mockSettlement
      );

      expect(withHousing).toBeGreaterThan(withoutHousing);
    });
  });

  describe('calculateHealthSuitability', () => {
    test('should calculate high suitability for young healthy couple', () => {
      const result = familyDecisionService.calculateHealthSuitability(mockMarriedCouple);

      expect(result).toBeGreaterThan(0.6);
    });

    test('should calculate low suitability for old or unhealthy couple', () => {
      const unhealthyCouple = [
        {
          ...mockMarriedCouple[0],
          age: 45,
          attributes: { constitution: { score: 6 } }
        },
        {
          ...mockMarriedCouple[1],
          age: 42,
          attributes: { constitution: { score: 8 } }
        }
      ];

      const result = familyDecisionService.calculateHealthSuitability(unhealthyCouple);

      expect(result).toBeLessThan(0.5);
    });
  });

  describe('calculateAgeHealthFactor', () => {
    test('should return optimal factor for ages 18-25', () => {
      expect(familyDecisionService.calculateAgeHealthFactor(20)).toBe(1.0);
      expect(familyDecisionService.calculateAgeHealthFactor(25)).toBe(1.0);
    });

    test('should return declining factor for older ages', () => {
      expect(familyDecisionService.calculateAgeHealthFactor(35)).toBe(0.9);
      expect(familyDecisionService.calculateAgeHealthFactor(40)).toBe(0.7);
      expect(familyDecisionService.calculateAgeHealthFactor(45)).toBe(0.5);
      expect(familyDecisionService.calculateAgeHealthFactor(50)).toBe(0.3);
    });

    test('should return low factor for very young ages', () => {
      expect(familyDecisionService.calculateAgeHealthFactor(16)).toBe(0.3);
    });
  });

  describe('evaluateSettlementForChildren', () => {
    test('should evaluate good settlement conditions highly', () => {
      const result = familyDecisionService.evaluateSettlementForChildren(mockSettlement);

      expect(result).toBeGreaterThan(0.5);
    });

    test('should evaluate poor settlement conditions lowly', () => {
      const poorSettlement = {
        population: { total: 30, growth: -0.05 },
        resources: { amounts: { food: 20, water: 30, materials: 10 } },
        government: {}
      };

      const result = familyDecisionService.evaluateSettlementForChildren(poorSettlement);

      expect(result).toBeLessThan(0.5);
    });

    test('should handle missing settlement data', () => {
      const result = familyDecisionService.evaluateSettlementForChildren(null);

      expect(result).toBe(0.5);
    });
  });

  describe('calculatePersonalDesire', () => {
    test('should calculate high desire for empathetic couple', () => {
      const result = familyDecisionService.calculatePersonalDesire(mockMarriedCouple);

      expect(result).toBeGreaterThan(0.6);
    });

    test('should calculate low desire for aggressive couple', () => {
      const aggressiveCouple = [
        {
          ...mockMarriedCouple[0],
          personality: {
            traits: {
              empathy: 0.2,
              aggression: 0.9,
              patience: 0.2,
              ambition: 0.9
            }
          }
        },
        {
          ...mockMarriedCouple[1],
          personality: {
            traits: {
              empathy: 0.3,
              aggression: 0.8,
              patience: 0.3,
              ambition: 0.8
            }
          }
        }
      ];

      const result = familyDecisionService.calculatePersonalDesire(aggressiveCouple);

      expect(result).toBeLessThan(0.4);
    });

    test('should handle missing personality data', () => {
      const coupleWithoutPersonality = [
        { id: 'spouse1' },
        { id: 'spouse2' }
      ];

      const result = familyDecisionService.calculatePersonalDesire(coupleWithoutPersonality);

      expect(result).toBe(0.5); // Should default to neutral
    });
  });

  describe('calculateAgeFactors', () => {
    test('should return optimal factors for young couple', () => {
      const youngCouple = [
        { ...mockMarriedCouple[0], age: 24 },
        { ...mockMarriedCouple[1], age: 22 }
      ];

      const result = familyDecisionService.calculateAgeFactors(youngCouple);

      expect(result).toBe(1.0);
    });

    test('should return low factors for old couple', () => {
      const oldCouple = [
        { ...mockMarriedCouple[0], age: 50 },
        { ...mockMarriedCouple[1], age: 47 }
      ];

      const result = familyDecisionService.calculateAgeFactors(oldCouple);

      expect(result).toBeLessThan(0.2);
    });

    test('should use minimum age factor (conservative approach)', () => {
      const mixedAgeCouple = [
        { ...mockMarriedCouple[0], age: 25 }, // Optimal
        { ...mockMarriedCouple[1], age: 45 }  // Challenging
      ];

      const result = familyDecisionService.calculateAgeFactors(mixedAgeCouple);

      expect(result).toBe(0.3); // Should use the challenging age factor
    });
  });

  describe('calculateProcreationProbability', () => {
    test('should calculate weighted probability correctly', () => {
      const factors = {
        economicStability: 0.8,
        healthFactors: 0.9,
        settlementConditions: 0.7,
        personalDesire: 0.8,
        ageFactors: 1.0
      };

      const result = familyDecisionService.calculateProcreationProbability(factors);

      // Manual calculation: 0.8*0.25 + 0.9*0.25 + 0.7*0.20 + 0.8*0.20 + 1.0*0.10 = 0.825
      expect(result).toBeCloseTo(0.825, 2);
    });
  });

  describe('generateProcreationReasoningText', () => {
    test('should generate positive reasoning for good factors', () => {
      const goodFactors = {
        economicStability: 0.8,
        healthFactors: 0.8,
        settlementConditions: 0.8,
        personalDesire: 0.8,
        ageFactors: 0.8
      };

      const reasoning = familyDecisionService.generateProcreationReasoningText(goodFactors, true);

      expect(reasoning).toContain('strong economic stability');
      expect(reasoning).toContain('good health');
      expect(reasoning).toContain('safe environment');
      expect(reasoning).toContain('strong desire');
      expect(reasoning).toContain('favors starting a family');
    });

    test('should generate negative reasoning for poor factors', () => {
      const poorFactors = {
        economicStability: 0.3,
        healthFactors: 0.3,
        settlementConditions: 0.3,
        personalDesire: 0.3,
        ageFactors: 0.3
      };

      const reasoning = familyDecisionService.generateProcreationReasoningText(poorFactors, false);

      expect(reasoning).toContain('Economic challenges');
      expect(reasoning).toContain('Health concerns');
      expect(reasoning).toContain('not ideal for raising children');
      expect(reasoning).toContain('Limited personal desire');
      expect(reasoning).toContain('Age factors present challenges');
      expect(reasoning).toContain('suggests waiting');
    });
  });

  describe('generateProcreationRecommendations', () => {
    test('should generate positive recommendations for good decision', () => {
      const goodFactors = {
        economicStability: 0.8,
        healthFactors: 0.8,
        settlementConditions: 0.8,
        personalDesire: 0.8,
        ageFactors: 0.8
      };

      const recommendations = familyDecisionService.generateProcreationRecommendations(
        goodFactors,
        true
      );

      expect(recommendations).toContain('Proceed with family planning');
    });

    test('should generate improvement recommendations for poor decision', () => {
      const poorFactors = {
        economicStability: 0.3,
        healthFactors: 0.3,
        settlementConditions: 0.3,
        personalDesire: 0.3,
        ageFactors: 0.3
      };

      const recommendations = familyDecisionService.generateProcreationRecommendations(
        poorFactors,
        false
      );

      expect(recommendations).toContain('Consider waiting before having children');
      expect(recommendations).toContain('Focus on improving economic situation first');
      expect(recommendations).toContain('Address health concerns before procreation');
      expect(recommendations).toContain('Consider relocating to a more family-friendly settlement');
      expect(recommendations).toContain('Spend time reflecting on family goals and desires');
      expect(recommendations).toContain('Consider age-related challenges and support needs');
    });
  });

  describe('Integration with existing systems', () => {
    test('should work with existing character data structure', () => {
      // Test with realistic character data from existing tests
      const realisticCouple = [
        {
          id: 'character1',
          age: 28,
          personality: {
            traits: {
              empathy: 0.8,
              aggression: 0.2,
              patience: 0.7,
              ambition: 0.6,
              loyalty: 0.9,
              curiosity: 0.6
            }
          },
          attributes: {
            charisma: { score: 14 },
            constitution: { score: 12 },
            wisdom: { score: 13 }
          },
          social: {
            status: 'artisan',
            reputation: 75
          },
          resources: {
            wealth: 300,
            income: 80,
            property: 1
          },
          consciousness: {
            coherence: 0.7,
            selfAwareness: 0.8,
            emotionalRegulation: 0.7
          }
        },
        {
          id: 'character2',
          age: 25,
          personality: {
            traits: {
              empathy: 0.9,
              aggression: 0.1,
              patience: 0.9,
              ambition: 0.3,
              loyalty: 0.8,
              curiosity: 0.7
            }
          },
          attributes: {
            charisma: { score: 14 },
            constitution: { score: 10 },
            wisdom: { score: 16 }
          },
          social: {
            status: 'artisan',
            reputation: 70
          },
          resources: {
            wealth: 250,
            income: 70,
            property: 0
          },
          consciousness: {
            coherence: 0.7,
            selfAwareness: 0.8,
            emotionalRegulation: 0.7
          }
        }
      ];

      const result = familyDecisionService.evaluateProcreationDecision(
        realisticCouple,
        mockSettlement
      );

      expect(result).toHaveProperty('decision');
      expect(result).toHaveProperty('probability');
      expect(result).toHaveProperty('factors');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('recommendations');
      expect(typeof result.decision).toBe('boolean');
      expect(typeof result.probability).toBe('number');
      expect(result.probability).toBeGreaterThanOrEqual(0);
      expect(result.probability).toBeLessThanOrEqual(1);
    });
  });
});
