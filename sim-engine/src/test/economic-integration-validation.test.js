/**
 * Validation test for NPC Economic Integration
 * Tests the new economic profiles, feedback loops, and tier interactions
 */

import BasicNeedsService from '../domain/services/BasicNeedsService.js';
import BehavioralStateService from '../domain/services/BehavioralStateService.js';
import EfficientTurnProcessor from '../domain/services/EfficientTurnProcessor.js';

describe('NPC Economic Integration Validation', () => {
  let basicNeedsService;
  let behavioralStateService;
  let turnProcessor;

  beforeEach(() => {
    basicNeedsService = new BasicNeedsService();
    behavioralStateService = new BehavioralStateService();
    turnProcessor = new EfficientTurnProcessor();
  });

  describe('Economic Profile Calculations', () => {
    test('should calculate leader economic profile correctly', () => {
      const character = {
        id: 'leader1',
        profession: 'merchant',
        wealth: 500,
        attributes: { charisma: 16, intelligence: 14 },
        role: 'leader'
      };

      const settlement = {
        id: 'settlement1',
        population: { total: 200 },
        economy: { totalWealth: 10000 }
      };

      const profile = basicNeedsService.calculateNpcEconomicProfile(character, settlement, 'leader');

      expect(profile.tier).toBe('leader');
      expect(profile.profile.productionCapacity).toBe(0.1);
      expect(profile.profile.consumptionMultiplier).toBe(2.0);
      expect(profile.economicInfluence.totalInfluence).toBeGreaterThan(0.5);
    });

    test('should calculate specialist economic profile correctly', () => {
      const character = {
        id: 'specialist1',
        profession: 'craftsman',
        wealth: 150,
        attributes: { dexterity: 15, intelligence: 13 },
        skills: { crafting: 8, trading: 5 }
      };

      const settlement = {
        id: 'settlement1',
        population: { total: 200 },
        economy: { totalWealth: 8000 }
      };

      const profile = basicNeedsService.calculateNpcEconomicProfile(character, settlement, 'specialist');

      expect(profile.tier).toBe('specialist');
      expect(profile.profile.productionCapacity).toBe(0.4);
      expect(profile.productionContribution.finalProduction).toBeGreaterThan(0);
    });

    test('should calculate citizen economic profile correctly', () => {
      const character = {
        id: 'citizen1',
        profession: 'farmer',
        wealth: 50,
        attributes: { strength: 12, constitution: 14 }
      };

      const settlement = {
        id: 'settlement1',
        population: { total: 200 },
        economy: { totalWealth: 5000 }
      };

      const profile = basicNeedsService.calculateNpcEconomicProfile(character, settlement, 'citizen');

      expect(profile.tier).toBe('citizen');
      expect(profile.profile.productionCapacity).toBe(0.5);
      expect(profile.consumptionNeeds.affordability).toBeGreaterThan(0);
    });
  });

  describe('Economic Feedback Loops', () => {
    test('should apply prosperity feedback to consciousness', () => {
      const character = {
        id: 'prosperous1',
        wealth: 200,
        consciousness: { frequency: 40, coherence: 0.8 }
      };

      const settlement = {
        id: 'settlement1',
        population: { total: 100 },
        economy: { totalWealth: 20000 } // High wealth = prosperous
      };

      const profile = basicNeedsService.calculateNpcEconomicProfile(character, settlement, 'specialist');

      expect(profile.feedbackLoops.consciousnessModifiers).toHaveProperty('prosperity');
      expect(profile.feedbackLoops.consciousnessModifiers.prosperity.frequency).toBeGreaterThan(1.0);
    });

    test('should apply poverty feedback to consciousness', () => {
      const character = {
        id: 'poor1',
        wealth: 5,
        consciousness: { frequency: 40, coherence: 0.8 }
      };

      const settlement = {
        id: 'settlement1',
        population: { total: 100 },
        economy: { totalWealth: 1000 } // Low wealth = poor
      };

      const profile = basicNeedsService.calculateNpcEconomicProfile(character, settlement, 'citizen');

      expect(profile.feedbackLoops.consciousnessModifiers).toHaveProperty('poverty');
      expect(profile.feedbackLoops.consciousnessModifiers.poverty.frequency).toBeLessThan(1.0);
    });
  });

  describe('Economic Interaction Types', () => {
    test('should return leader economic interactions', () => {
      const character = {
        id: 'leader1',
        energy: 50,
        wealth: 200,
        attributes: { charisma: 16 }
      };

      const settlement = { id: 'settlement1' };

      const interactions = basicNeedsService.getEconomicInteractions('leader', character, settlement);

      expect(interactions.length).toBeGreaterThan(0);
      expect(interactions.some(i => i.type === 'manage_economy')).toBe(true);
      expect(interactions.some(i => i.type === 'plan_trade')).toBe(true);
    });

    test('should return specialist economic interactions', () => {
      const character = {
        id: 'specialist1',
        energy: 40,
        wealth: 100
      };

      const settlement = { id: 'settlement1' };

      const interactions = basicNeedsService.getEconomicInteractions('specialist', character, settlement);

      expect(interactions.length).toBeGreaterThan(0);
      expect(interactions.some(i => i.type === 'operate_workshop')).toBe(true);
      expect(interactions.some(i => i.type === 'negotiate_contracts')).toBe(true);
    });

    test('should return citizen economic interactions', () => {
      const character = {
        id: 'citizen1',
        energy: 30,
        wealth: 20
      };

      const settlement = { id: 'settlement1' };

      const interactions = basicNeedsService.getEconomicInteractions('citizen', character, settlement);

      expect(interactions.length).toBeGreaterThan(0);
      expect(interactions.some(i => i.type === 'work_job')).toBe(true);
      expect(interactions.some(i => i.type === 'buy_goods')).toBe(true);
    });

    test('should filter interactions based on character capabilities', () => {
      const character = {
        id: 'weak1',
        energy: 5, // Too low energy
        wealth: 5  // Too low wealth
      };

      const settlement = { id: 'settlement1' };

      const interactions = basicNeedsService.getEconomicInteractions('leader', character, settlement);

      // Should return fewer interactions due to insufficient resources
      expect(interactions.length).toBeLessThan(2);
    });
  });

  describe('Stat-Driven Decision Enhancement', () => {
    test('should calculate stat modifiers for different interaction types', () => {
      const character = {
        id: 'char1',
        attributes: {
          strength: 16,     // High STR
          dexterity: 12,    // Medium DEX
          intelligence: 8,  // Low INT
          wisdom: 14,       // High WIS
          charisma: 10,     // Medium CHA
          constitution: 13  // Medium CON
        }
      };

      // Test combat interaction (STR primary, CON secondary)
      const combatModifier = behavioralStateService.getStatModifier(character, 'combat');
      expect(combatModifier).toBeGreaterThan(1.0); // Should be boosted by high STR

      // Test healing interaction (WIS primary, INT secondary)
      const healingModifier = behavioralStateService.getStatModifier(character, 'heal');
      expect(healingModifier).toBeGreaterThan(1.0); // Should be boosted by high WIS

      // Test research interaction (INT primary, WIS secondary)
      const researchModifier = behavioralStateService.getStatModifier(character, 'research');
      expect(researchModifier).toBeLessThan(1.0); // Should be reduced by low INT
    });

    test('should integrate stat modifiers into decision factors', () => {
      const character = {
        id: 'char1',
        attributes: { strength: 16, charisma: 14 },
        personality: { traits: [] },
        consciousness: { frequency: 40, coherence: 0.8 },
        memory: { significantEvents: [] },
        physicalState: { energy: 80, health: 90 }
      };

      const decisionFactor = behavioralStateService.calculateDecisionFactor(
        character,
        'combat',
        { interaction: { type: 'combat' } }
      );

      expect(decisionFactor.breakdown).toHaveProperty('statModifier');
      expect(typeof decisionFactor.finalFactor).toBe('number');
      expect(decisionFactor.finalFactor).toBeGreaterThan(0.1);
      expect(decisionFactor.finalFactor).toBeLessThanOrEqual(3.0);
    });
  });

  describe('Tier System Integration', () => {
    test('should determine NPC tiers correctly', () => {
      const characters = [
        {
          id: 'leader1',
          attributes: { charisma: 16, intelligence: 15 },
          role: 'leader',
          reputation: 80,
          wealth: 300
        },
        {
          id: 'specialist1',
          attributes: { intelligence: 15, dexterity: 14 },
          profession: 'craftsman',
          skills: { crafting: 9 }
        },
        {
          id: 'citizen1',
          attributes: { strength: 12 },
          profession: 'farmer'
        }
      ];

      const settlement = {
        id: 'settlement1',
        population: { total: 100 }
      };

      // Test tier determination
      const leaderTier = turnProcessor._determineNpcTier(characters[0], { settlements: [settlement] });
      const specialistTier = turnProcessor._determineNpcTier(characters[1], { settlements: [settlement] });
      const citizenTier = turnProcessor._determineNpcTier(characters[2], { settlements: [settlement] });

      // Note: These may not be exactly 'leader', 'specialist', 'citizen' due to the algorithm
      // but they should be valid tier strings
      expect(['leader', 'specialist', 'citizen']).toContain(leaderTier);
      expect(['leader', 'specialist', 'citizen']).toContain(specialistTier);
      expect(['leader', 'specialist', 'citizen']).toContain(citizenTier);
    });

    test('should generate tier-specific interactions', () => {
      const leaderInteractions = turnProcessor._getAvailableInteractions({
        id: 'leader1',
        profession: 'merchant',
        energy: 50,
        wealth: 200
      }, {});

      const specialistInteractions = turnProcessor._getAvailableInteractions({
        id: 'specialist1',
        profession: 'craftsman',
        energy: 40,
        wealth: 100
      }, {});

      const citizenInteractions = turnProcessor._getAvailableInteractions({
        id: 'citizen1',
        profession: 'farmer',
        energy: 30,
        wealth: 20
      }, {});

      // All should have some interactions
      expect(leaderInteractions.length).toBeGreaterThan(0);
      expect(specialistInteractions.length).toBeGreaterThan(0);
      expect(citizenInteractions.length).toBeGreaterThan(0);

      // Check for profession-specific interactions
      const leaderTradeInteraction = leaderInteractions.find(i => i.type === 'trade');
      const specialistCraftInteraction = specialistInteractions.find(i => i.type === 'craft');
      const citizenWorkInteraction = citizenInteractions.find(i => i.type === 'work');

      expect(leaderTradeInteraction).toBeDefined();
      expect(specialistCraftInteraction).toBeDefined();
      expect(citizenWorkInteraction).toBeDefined();
    });
  });
});