/**
 * Family Decision Service Test Suite
 * 
 * Tests for marriage compatibility evaluation, consciousness integration,
 * and family decision-making capabilities.
 */

import FamilyDecisionService from '../domain/services/FamilyDecisionService.js';

describe('Family Decision Service', () => {
  let familyDecisionService;
  let mockConsciousnessService;
  let mockEconomicService;
  let mockCulturalService;

  beforeEach(() => {
    mockConsciousnessService = {
      calculateCoherence: jest.fn(),
      assessAwareness: jest.fn()
    };

    mockEconomicService = {
      calculateWealth: jest.fn(),
      assessStability: jest.fn()
    };

    mockCulturalService = {
      evaluateAlignment: jest.fn()
    };

    familyDecisionService = new FamilyDecisionService(
      mockConsciousnessService,
      mockEconomicService,
      mockCulturalService
    );
  });

  describe('Marriage Compatibility Evaluation', () => {
    test('should evaluate high compatibility couple correctly', () => {
      const character1 = {
        id: 'char1',
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
          reputation: 75,
          connections: ['guild_master', 'neighbor1', 'friend1']
        },
        resources: {
          wealth: 300,
          income: 80,
          property: 1,
          skills: ['crafting', 'trade']
        },
        culture: {
          religion: 'nature_worship',
          values: { family: 0.8, honor: 0.7, prosperity: 0.6 },
          traditions: ['harvest_festival', 'craft_guild'],
          language: 'common'
        },
        consciousness: {
          coherence: 0.8,
          selfAwareness: 0.7,
          emotionalRegulation: 0.8,
          growthPotential: 0.7
        }
      };

      const character2 = {
        id: 'char2',
        age: 26,
        personality: {
          traits: {
            empathy: 0.7,
            aggression: 0.3,
            patience: 0.8,
            ambition: 0.5,
            loyalty: 0.8,
            curiosity: 0.7
          }
        },
        attributes: {
          charisma: { score: 12 },
          constitution: { score: 14 },
          wisdom: { score: 12 }
        },
        social: {
          status: 'artisan',
          reputation: 70,
          connections: ['guild_master', 'neighbor2', 'friend2']
        },
        resources: {
          wealth: 250,
          income: 70,
          property: 0,
          skills: ['healing', 'herbalism']
        },
        culture: {
          religion: 'nature_worship',
          values: { family: 0.9, honor: 0.6, prosperity: 0.5 },
          traditions: ['harvest_festival', 'healing_circle'],
          language: 'common'
        },
        consciousness: {
          coherence: 0.7,
          selfAwareness: 0.8,
          emotionalRegulation: 0.7,
          growthPotential: 0.8
        }
      };

      const settlement = {
        economy: {
          averageWealth: 200,
          averageIncome: 60,
          growth: 0.08
        }
      };

      const result = familyDecisionService.evaluateMarriageCompatibility(
        character1, 
        character2, 
        settlement
      );

      expect(result.compatible).toBe(true);
      expect(result.overallScore).toBeGreaterThan(0.7);
      expect(result.compatibility.personality).toBeGreaterThan(0.55);
      expect(result.compatibility.consciousness).toBeGreaterThan(0.6);
      expect(result.decisionConfidence).toBeGreaterThan(0.6);
      expect(result.recommendations).toContain('Highly compatible couple with excellent long-term prospects');
    });

    test('should identify problematic low compatibility couple', () => {
      const aggressiveCharacter = {
        id: 'aggressive',
        age: 30,
        personality: {
          traits: {
            empathy: 0.2,
            aggression: 0.9,
            patience: 0.1,
            ambition: 0.9,
            loyalty: 0.3,
            curiosity: 0.4
          }
        },
        attributes: {
          charisma: { score: 8 },
          constitution: { score: 15 },
          wisdom: { score: 8 }
        },
        social: {
          status: 'commoner',
          reputation: 30,
          connections: ['tavern_friend']
        },
        resources: {
          wealth: 50,
          income: 20,
          property: 0
        },
        culture: {
          religion: 'war_god',
          values: { strength: 0.9, family: 0.3 },
          traditions: ['warrior_rites'],
          language: 'common'
        },
        consciousness: {
          coherence: 0.3,
          selfAwareness: 0.2,
          emotionalRegulation: 0.2,
          growthPotential: 0.3
        }
      };

      const gentleCharacter = {
        id: 'gentle',
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
          reputation: 85,
          connections: ['temple_priest', 'healer_guild']
        },
        resources: {
          wealth: 200,
          income: 60,
          property: 1
        },
        culture: {
          religion: 'nature_worship',
          values: { peace: 0.9, family: 0.8 },
          traditions: ['peace_ceremony'],
          language: 'common'
        },
        consciousness: {
          coherence: 0.8,
          selfAwareness: 0.9,
          emotionalRegulation: 0.8,
          growthPotential: 0.7
        }
      };

      const settlement = {
        economy: {
          averageWealth: 200,
          averageIncome: 60,
          growth: 0.05
        }
      };

      const result = familyDecisionService.evaluateMarriageCompatibility(
        aggressiveCharacter, 
        gentleCharacter, 
        settlement
      );

      expect(result.compatible).toBe(false);
      expect(result.overallScore).toBeLessThan(0.5);
      expect(result.compatibility.personality).toBeLessThan(0.4);
      expect(result.compatibility.consciousness).toBeLessThan(0.4);
      expect(result.potentialChallenges.length).toBeGreaterThan(2);
      expect(result.recommendations).toContain('Significant challenges that require careful consideration');
    });

    test('should handle missing data gracefully', () => {
      const incompleteCharacter1 = {
        id: 'incomplete1',
        age: 25
      };

      const incompleteCharacter2 = {
        id: 'incomplete2',
        age: 27,
        personality: {
          traits: { empathy: 0.6 }
        }
      };

      const settlement = {
        economy: {}
      };

      const result = familyDecisionService.evaluateMarriageCompatibility(
        incompleteCharacter1, 
        incompleteCharacter2, 
        settlement
      );

      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThan(1);
      expect(result.compatibility).toBeDefined();
    });
  });

  describe('Personality Compatibility Calculations', () => {
    test('should reward empathy alignment', () => {
      const personality1 = {
        traits: { empathy: 0.8, aggression: 0.2, patience: 0.7 }
      };
      
      const personality2 = {
        traits: { empathy: 0.7, aggression: 0.3, patience: 0.6 }
      };

      const compatibility = familyDecisionService.calculatePersonalityCompatibility(
        personality1, 
        personality2
      );

      expect(compatibility).toBeGreaterThan(0.6);
    });

    test('should penalize high aggression combinations', () => {
      const aggressivePersonality1 = {
        traits: { empathy: 0.3, aggression: 0.9, patience: 0.2 }
      };
      
      const aggressivePersonality2 = {
        traits: { empathy: 0.2, aggression: 0.8, patience: 0.1 }
      };

      const compatibility = familyDecisionService.calculatePersonalityCompatibility(
        aggressivePersonality1, 
        aggressivePersonality2
      );

      expect(compatibility).toBeLessThan(0.45);
    });

    test('should value complementary patience', () => {
      const patientPersonality = {
        traits: { empathy: 0.6, aggression: 0.3, patience: 0.9 }
      };
      
      const impatientPersonality = {
        traits: { empathy: 0.6, aggression: 0.3, patience: 0.2 }
      };

      const compatibility = familyDecisionService.calculatePersonalityCompatibility(
        patientPersonality, 
        impatientPersonality
      );

      expect(compatibility).toBeGreaterThan(0.5);
    });
  });

  describe('Consciousness Integration', () => {
    test('should factor consciousness coherence into decision quality', () => {
      const highCoherenceChar1 = {
        consciousness: { coherence: 0.9, selfAwareness: 0.8 }
      };
      
      const highCoherenceChar2 = {
        consciousness: { coherence: 0.8, selfAwareness: 0.9 }
      };

      const decisionQuality = familyDecisionService.calculateDecisionQuality(
        highCoherenceChar1.consciousness,
        highCoherenceChar2.consciousness
      );

      expect(decisionQuality).toBeGreaterThan(0.7);
    });

    test('should reduce decision quality for low consciousness', () => {
      const lowCoherenceChar1 = {
        consciousness: { coherence: 0.2, selfAwareness: 0.3 }
      };
      
      const lowCoherenceChar2 = {
        consciousness: { coherence: 0.3, selfAwareness: 0.2 }
      };

      const decisionQuality = familyDecisionService.calculateDecisionQuality(
        lowCoherenceChar1.consciousness,
        lowCoherenceChar2.consciousness
      );

      expect(decisionQuality).toBeLessThan(0.4);
    });

    test('should calculate consciousness compatibility correctly', () => {
      const consciousness1 = {
        coherence: 0.7,
        selfAwareness: 0.8,
        emotionalRegulation: 0.6,
        growthPotential: 0.7
      };

      const consciousness2 = {
        coherence: 0.8,
        selfAwareness: 0.7,
        emotionalRegulation: 0.8,
        growthPotential: 0.6
      };

      const compatibility = familyDecisionService.calculateConsciousnessCompatibility(
        consciousness1,
        consciousness2
      );

      expect(compatibility).toBeGreaterThan(0.6);
      expect(compatibility).toBeLessThan(1);
    });
  });

  describe('Economic Compatibility', () => {
    test('should evaluate wealth adequacy correctly', () => {
      const resources1 = { wealth: 400, income: 80 };
      const resources2 = { wealth: 300, income: 70 };
      const economy = { averageWealth: 200, averageIncome: 60 };

      const compatibility = familyDecisionService.calculateEconomicCompatibility(
        resources1,
        resources2,
        economy
      );

      expect(compatibility).toBeGreaterThan(0.7);
    });

    test('should penalize extreme economic imbalance', () => {
      const wealthyResources = { wealth: 1000, income: 200 };
      const poorResources = { wealth: 10, income: 5 };
      const economy = { averageWealth: 200, averageIncome: 60 };

      const compatibility = familyDecisionService.calculateEconomicCompatibility(
        wealthyResources,
        poorResources,
        economy
      );

      expect(compatibility).toBeLessThan(0.6);
    });

    test('should reward dual income stability', () => {
      const stableResources1 = { wealth: 200, income: 60 };
      const stableResources2 = { wealth: 180, income: 55 };
      const economy = { averageWealth: 150, averageIncome: 50 };

      const compatibility = familyDecisionService.calculateEconomicCompatibility(
        stableResources1,
        stableResources2,
        economy
      );

      expect(compatibility).toBeGreaterThan(0.6);
    });
  });

  describe('Cultural Compatibility', () => {
    test('should reward same religion and values', () => {
      const culture1 = {
        religion: 'nature_worship',
        values: { family: 0.8, honor: 0.7 },
        traditions: ['harvest_festival'],
        language: 'common'
      };

      const culture2 = {
        religion: 'nature_worship',
        values: { family: 0.9, honor: 0.6 },
        traditions: ['harvest_festival', 'craft_fair'],
        language: 'common'
      };

      const compatibility = familyDecisionService.calculateCulturalCompatibility(
        culture1,
        culture2
      );

      expect(compatibility).toBeGreaterThan(0.8);
    });

    test('should handle different but compatible religions', () => {
      const culture1 = {
        religion: 'nature_worship',
        values: { peace: 0.8 },
        language: 'common'
      };

      const culture2 = {
        religion: 'druidism',
        values: { peace: 0.7 },
        language: 'common'
      };

      const compatibility = familyDecisionService.calculateCulturalCompatibility(
        culture1,
        culture2
      );

      expect(compatibility).toBeGreaterThan(0.6);
      expect(compatibility).toBeLessThan(0.9);
    });

    test('should penalize incompatible religions', () => {
      const culture1 = {
        religion: 'nature_worship',
        values: { peace: 0.8 },
        language: 'common'
      };

      const culture2 = {
        religion: 'war_god',
        values: { strength: 0.9 },
        language: 'barbarian'
      };

      const compatibility = familyDecisionService.calculateCulturalCompatibility(
        culture1,
        culture2
      );

      expect(compatibility).toBeLessThan(0.5);
    });
  });

  describe('Marriage Readiness Evaluation', () => {
    test('should evaluate high readiness correctly', () => {
      const readyCharacter = {
        age: 28,
        consciousness: {
          coherence: 0.8,
          emotionalRegulation: 0.7
        },
        personality: {
          traits: { empathy: 0.8 }
        },
        resources: {
          wealth: 300,
          income: 80
        },
        social: {
          reputation: 75
        },
        attributes: {
          charisma: { score: 14 },
          constitution: { score: 12 },
          health: 85
        }
      };

      const settlement = {
        economy: {
          averageWealth: 200,
          averageIncome: 60
        }
      };

      const result = familyDecisionService.evaluateMarriageReadiness(
        readyCharacter,
        settlement
      );

      expect(result.ready).toBe(true);
      expect(result.readiness).toBeGreaterThan(0.7);
      expect(result.recommendations).toContain('Well-prepared for marriage commitment');
    });

    test('should identify unready character correctly', () => {
      const unreadyCharacter = {
        age: 19,
        consciousness: {
          coherence: 0.3,
          emotionalRegulation: 0.2
        },
        personality: {
          traits: { empathy: 0.4 }
        },
        resources: {
          wealth: 20,
          income: 15
        },
        social: {
          reputation: 35
        },
        attributes: {
          charisma: { score: 8 },
          constitution: { score: 8 },
          health: 60
        }
      };

      const settlement = {
        economy: {
          averageWealth: 200,
          averageIncome: 60
        }
      };

      const result = familyDecisionService.evaluateMarriageReadiness(
        unreadyCharacter,
        settlement
      );

      expect(result.ready).toBe(false);
      expect(result.readiness).toBeLessThan(0.5);
      expect(result.recommendations.length).toBeGreaterThan(2);
      expect(result.recommendations).toContain('Focus on emotional development and self-awareness');
    });
  });

  describe('Timeline and Recommendations', () => {
    test('should suggest faster timeline for highly compatible couples', () => {
      const highCompatibility = {
        personality: 0.9,
        social: 0.8,
        economic: 0.8,
        cultural: 0.9,
        consciousness: 0.8
      };

      const highDecisionQuality = 0.8;

      const timeline = familyDecisionService.suggestCourtshipTimeline(
        highCompatibility,
        highDecisionQuality
      );

      expect(timeline.total).toBeLessThan(150); // Less than base timeline
      expect(timeline.courtship).toBeLessThan(90);
    });

    test('should suggest longer timeline for problematic compatibility', () => {
      const lowCompatibility = {
        personality: 0.4,
        social: 0.5,
        economic: 0.3,
        cultural: 0.4,
        consciousness: 0.3
      };

      const lowDecisionQuality = 0.3;

      const timeline = familyDecisionService.suggestCourtshipTimeline(
        lowCompatibility,
        lowDecisionQuality
      );

      expect(timeline.total).toBeGreaterThan(180); // Longer than base timeline
      expect(timeline.courtship).toBeGreaterThan(90);
    });

    test('should generate appropriate recommendations for different compatibility levels', () => {
      const moderateCompatibility = {
        personality: 0.7,
        social: 0.6,
        economic: 0.4,
        cultural: 0.7,
        consciousness: 0.6
      };

      const character1 = { id: 'char1' };
      const character2 = { id: 'char2' };

      const recommendations = familyDecisionService.generateMarriageRecommendations(
        moderateCompatibility,
        0.6,
        character1,
        character2
      );

      expect(recommendations).toContain('Good compatibility with manageable differences');
      expect(recommendations).toContain('Consider improving financial stability before marriage');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle null personality data', () => {
      const result = familyDecisionService.calculatePersonalityCompatibility(null, null);
      expect(result).toBe(0.5);
    });

    test('should handle missing consciousness data', () => {
      const result = familyDecisionService.calculateConsciousnessCompatibility(null, null);
      expect(result).toBe(0.5);
    });

    test('should handle empty resources', () => {
      const result = familyDecisionService.calculateEconomicCompatibility({}, {}, {});
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    test('should handle missing cultural data', () => {
      const result = familyDecisionService.calculateCulturalCompatibility(null, null);
      expect(result).toBe(0.7); // Neutral assumption
    });
  });
});
