// src/test/consequence-resolution-integration.test.js

import ConsequenceLifecycleManager from '../domain/services/ConsequenceLifecycleManager.js';

// Mock SimulationService for integration testing
jest.mock('../application/use-cases/services/SimulationService.js', () => {
  class MockSimulationService {
    constructor() {
      this.worldState = null;
    }

    initialize(worldData) {
      this.worldState = worldData;
      return worldData;
    }

    processTurn() {
      if (!this.worldState) return { success: false };

      // Import required services
      const BasicNeedsService = require('../domain/services/BasicNeedsService.js').default;
      const NeedConsequenceService = require('../domain/services/NeedConsequenceService.js').default;
      const ConsequenceLifecycleManager = require('../domain/services/ConsequenceLifecycleManager.js').default;
      const SettlementService = require('../domain/services/SettlementService.js').default;

      const basicNeedsService = new BasicNeedsService();
      const needConsequenceService = new NeedConsequenceService();
      const consequenceLifecycleManager = new ConsequenceLifecycleManager();
      const settlementService = new SettlementService();

      // Process settlements with need satisfaction calculations
      if (this.worldState.settlements && Array.isArray(this.worldState.settlements)) {
        this.worldState.settlements.forEach((settlement, index) => {
          try {
            // Initialize need satisfaction if not already present
            if (!settlement.needSatisfaction) {
              this.worldState.settlements[index] = settlementService.initializeNeedSatisfaction(settlement);
              settlement = this.worldState.settlements[index];
            }

            // Calculate need satisfaction for the settlement
            const satisfactionResult = basicNeedsService.calculateSatisfactionLevel(settlement);

            // Generate consequences based on need satisfaction
            const newConsequences = needConsequenceService.generateConsequences(
              satisfactionResult.needs,
              settlement
            );

            // Add new consequences to the settlement
            let updatedSettlement = consequenceLifecycleManager.addConsequencesToSettlement(
              settlement,
              newConsequences
            );

            // Process consequence lifecycle (aging, resolution, cleanup)
            const lifecycleResults = consequenceLifecycleManager.processConsequenceLifecycle(
              [updatedSettlement],
              {} // No player actions in automated processing
            );

            // Update settlement with processed consequences
            updatedSettlement = lifecycleResults.processedSettlements[0];

            // Clean up resolved/expired consequences
            const cleanupResults = consequenceLifecycleManager.cleanupResolvedConsequences(updatedSettlement);
            updatedSettlement = cleanupResults.settlement;

            // Update settlement with new need satisfaction data
            const activeConsequences = updatedSettlement.needSatisfaction?.activeConsequences || [];
            const consequenceIds = activeConsequences.map(c => c.id);
            const eventIds = activeConsequences.map(c => `consequence_${c.id}_${this.worldState.time}`);

            this.worldState.settlements[index] = settlementService.updateNeedSatisfaction(
              updatedSettlement,
              satisfactionResult,
              consequenceIds,
              eventIds
            );

          } catch (error) {
            console.error(`Error processing settlement ${settlement.name || settlement.id}:`, error);
            // Continue processing other settlements even if one fails
          }
        });
      }

      // Simulate turn processing
      this.worldState.time = (this.worldState.time || 0) + 1;

      return {
        worldState: this.worldState,
        success: true
      };
    }

    getCurrentTurn() {
      return this.worldState?.time || 0;
    }
  }

  return { default: new MockSimulationService() };
});

describe('Consequence Resolution Integration Tests', () => {
  let lifecycleManager;

  beforeEach(() => {
    lifecycleManager = new ConsequenceLifecycleManager();
  });

  describe('End-to-End Consequence Lifecycle', () => {
    it('should process complete consequence lifecycle in simulation', () => {
      // Create a test settlement with low need satisfaction
      const testSettlement = createTestSettlementWithLowNeeds();

      // Import required services directly
      const BasicNeedsService = require('../domain/services/BasicNeedsService.js').default;
      const NeedConsequenceService = require('../domain/services/NeedConsequenceService.js').default;
      const SettlementService = require('../domain/services/SettlementService.js').default;

      const basicNeedsService = new BasicNeedsService();
      const needConsequenceService = new NeedConsequenceService();
      const settlementService = new SettlementService();

      // Initialize need satisfaction if not already present
      let settlement = settlementService.initializeNeedSatisfaction(testSettlement);

      // Calculate need satisfaction for the settlement
      const satisfactionResult = basicNeedsService.calculateSatisfactionLevel(settlement);

      // Generate consequences based on need satisfaction
      const newConsequences = needConsequenceService.generateConsequences(
        satisfactionResult.needs,
        settlement
      );

      // Add new consequences to the settlement
      const settlementWithConsequences = lifecycleManager.addConsequencesToSettlement(
        settlement,
        newConsequences
      );

      // Verify consequences were generated
      expect(settlementWithConsequences.needSatisfaction.activeConsequences.length).toBeGreaterThan(0);

      // Verify consequences have proper lifecycle metadata
      const consequences = settlementWithConsequences.needSatisfaction.activeConsequences;
      consequences.forEach(consequence => {
        expect(consequence.lifecycle).toBeDefined();
        expect(consequence.lifecycle.addedAt).toBeInstanceOf(Date);
        expect(consequence.lifecycle.age).toBeDefined();
      });

      // Process consequence lifecycle (simulate another turn)
      const lifecycleResults = lifecycleManager.processConsequenceLifecycle([settlementWithConsequences]);

      // Consequences should have aged
      const agedSettlement = lifecycleResults.processedSettlements[0];
      const agedConsequences = agedSettlement.needSatisfaction.activeConsequences;

      // Consequences should have aged
      agedConsequences.forEach(consequence => {
        expect(consequence.lifecycle.age).toBeGreaterThan(0);
      });
    });

    it('should handle player action resolution', () => {
      const testSettlement = createTestSettlementWithLowNeeds();
      const consequenceId = 'test_famine_1';

      // Add a consequence manually
      const famineConsequence = {
        id: consequenceId,
        type: 'famine',
        severity: 0.8,
        description: 'Test famine',
        effects: {},
        duration: 10,
        triggers: ['successful_harvest', 'food_trade_agreement'],
        resolved: false,
        startDate: new Date()
      };

      testSettlement.needSatisfaction.activeConsequences = [famineConsequence];

      // Manually resolve the consequence
      const resolvedSettlement = lifecycleManager.resolveConsequenceManually(
        testSettlement,
        consequenceId,
        'Established trade agreement for food'
      );

      expect(resolvedSettlement.needSatisfaction.activeConsequences[0].resolved).toBe(true);
      expect(resolvedSettlement.needSatisfaction.activeConsequences[0].endDate).toBeInstanceOf(Date);
      expect(resolvedSettlement.needSatisfaction.activeConsequences[0].lifecycle.resolvedBy).toBe('player_action');
    });

    it('should cleanup resolved consequences', () => {
      const testSettlement = createTestSettlementWithLowNeeds();

      // Add both resolved and active consequences
      const resolvedConsequence = {
        id: 'resolved_1',
        type: 'famine',
        severity: 0.8,
        resolved: true,
        endDate: new Date(),
        startDate: new Date(),
        lifecycle: { age: 5 }
      };

      const activeConsequence = {
        id: 'active_1',
        type: 'water_crisis',
        severity: 0.7,
        resolved: false,
        startDate: new Date(),
        lifecycle: { age: 3 }
      };

      testSettlement.needSatisfaction.activeConsequences = [resolvedConsequence, activeConsequence];

      // Cleanup resolved consequences
      const cleanupResults = lifecycleManager.cleanupResolvedConsequences(testSettlement);

      expect(cleanupResults.cleanedCount).toBe(1);
      expect(cleanupResults.settlement.needSatisfaction.activeConsequences).toHaveLength(1);
      expect(cleanupResults.settlement.needSatisfaction.activeConsequences[0].id).toBe('active_1');
    });

    it('should generate consequence statistics', () => {
      const testSettlement = createTestSettlementWithLowNeeds();

      // Add multiple consequences of different types and severities
      testSettlement.needSatisfaction.activeConsequences = [
        {
          id: 'famine_1',
          type: 'famine',
          severity: 0.9,
          startDate: new Date(),
          lifecycle: { age: 2 }
        },
        {
          id: 'water_1',
          type: 'water_crisis',
          severity: 0.6,
          startDate: new Date(),
          lifecycle: { age: 5 }
        },
        {
          id: 'housing_1',
          type: 'housing_crisis',
          severity: 0.3,
          startDate: new Date(),
          lifecycle: { age: 8 }
        }
      ];

      const stats = lifecycleManager.getConsequenceStatistics(testSettlement);

      expect(stats.total).toBe(3);
      expect(stats.byType.famine).toBe(1);
      expect(stats.byType.water_crisis).toBe(1);
      expect(stats.byType.housing_crisis).toBe(1);
      expect(stats.bySeverity.high).toBe(1); // famine at 0.9
      expect(stats.bySeverity.medium).toBe(1); // water at 0.6
      expect(stats.bySeverity.low).toBe(1); // housing at 0.3
      expect(stats.byAge.recent).toBe(1); // age 2
      expect(stats.byAge.medium).toBe(1); // age 5
      expect(stats.byAge.old).toBe(1); // age 8
      expect(stats.averageSeverity).toBeCloseTo(0.6, 1);
    });

    it('should handle multiple settlements with different consequence states', () => {
      const settlement1 = createTestSettlementWithLowNeeds();
      settlement1.id = 'settlement1';
      settlement1.name = 'Town A';

      const settlement2 = createTestSettlementWithLowNeeds();
      settlement2.id = 'settlement2';
      settlement2.name = 'Town B';

      // Give settlement1 some consequences
      settlement1.needSatisfaction.activeConsequences = [
        {
          id: 'famine_s1',
          type: 'famine',
          severity: 0.8,
          startDate: new Date(),
          lifecycle: { age: 1 }
        }
      ];

      // Give settlement2 different consequences
      settlement2.needSatisfaction.activeConsequences = [
        {
          id: 'water_s2',
          type: 'water_crisis',
          severity: 0.7,
          startDate: new Date(),
          lifecycle: { age: 2 }
        },
        {
          id: 'housing_s2',
          type: 'housing_crisis',
          severity: 0.5,
          startDate: new Date(),
          lifecycle: { age: 3 }
        }
      ];

      const results = lifecycleManager.processConsequenceLifecycle([settlement1, settlement2]);

      expect(results.processedSettlements).toHaveLength(2);
      expect(results.summary.totalActiveConsequences).toBe(3);
      expect(results.summary.description).toContain('3 active consequences');
    });
  });

  describe('Consequence Resolution Triggers', () => {
    it('should resolve famine through successful harvest', () => {
      const testSettlement = createTestSettlementWithLowNeeds();

      // Create a famine consequence
      const famineConsequence = {
        id: 'famine_test',
        type: 'famine',
        severity: 0.8,
        description: 'Famine in test settlement',
        effects: {},
        duration: 10,
        triggers: ['successful_harvest', 'food_trade_agreement'],
        resolved: false,
        startDate: new Date(),
        lifecycle: { age: 0 }
      };

      testSettlement.needSatisfaction.activeConsequences = [famineConsequence];

      // Simulate player action that should resolve the famine
      const playerActions = [{
        type: 'agriculture',
        buildingType: 'farm',
        description: 'Improved farming techniques'
      }];

      const results = lifecycleManager.processConsequenceLifecycle(
        [testSettlement],
        { [testSettlement.id]: playerActions }
      );

      expect(results.resolvedConsequences).toHaveLength(1);
      expect(results.summary.playerTriggeredResolutions).toBe(1);
    });

    it('should resolve water crisis through aqueduct construction', () => {
      const testSettlement = createTestSettlementWithLowNeeds();

      const waterConsequence = {
        id: 'water_test',
        type: 'water_crisis',
        severity: 0.7,
        description: 'Water crisis in test settlement',
        effects: {},
        duration: 8,
        triggers: ['build_aqueduct', 'find_water_source'],
        resolved: false,
        startDate: new Date(),
        lifecycle: { age: 0 }
      };

      testSettlement.needSatisfaction.activeConsequences = [waterConsequence];

      const playerActions = [{
        type: 'construction',
        buildingType: 'aqueduct',
        description: 'Built aqueduct system'
      }];

      const results = lifecycleManager.processConsequenceLifecycle(
        [testSettlement],
        { [testSettlement.id]: playerActions }
      );

      expect(results.resolvedConsequences).toHaveLength(1);
      expect(results.summary.playerTriggeredResolutions).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid settlement data gracefully', () => {
      const invalidSettlements = [null, {}, { id: null }, { id: 'test', name: null }];

      invalidSettlements.forEach(invalidSettlement => {
        expect(() => {
          lifecycleManager.processConsequenceLifecycle([invalidSettlement]);
        }).toThrow();
      });
    });

    it('should handle missing need satisfaction data', () => {
      const settlementWithoutNeeds = {
        id: 'test',
        name: 'Test Settlement',
        population: { total: 100 }
        // Missing needSatisfaction
      };

      const results = lifecycleManager.processConsequenceLifecycle([settlementWithoutNeeds]);

      expect(results.processedSettlements).toHaveLength(1);
      expect(results.summary.totalActiveConsequences).toBe(0);
    });

    it('should handle empty consequence arrays', () => {
      const settlement = createTestSettlementWithLowNeeds();
      settlement.needSatisfaction.activeConsequences = [];

      const results = lifecycleManager.processConsequenceLifecycle([settlement]);

      expect(results.processedSettlements).toHaveLength(1);
      expect(results.summary.totalActiveConsequences).toBe(0);
    });
  });
});

// Helper functions for creating test data

function createTestSettlementWithLowNeeds() {
  return {
    id: 'test_settlement',
    name: 'Test Settlement',
    population: { total: 100 },
    resources: {
      amounts: { food: 10, water: 15, goods: 20 },
      production: { food: 5, water: 8 },
      storage: { food: 50, water: 30 }
    },
    buildings: [
      { id: 'farm1', type: 'farm', level: 1 },
      { id: 'well1', type: 'well', level: 1 }
    ],
    economy: {
      trade: []
    },
    needSatisfaction: {
      current: {
        food: 0.2,    // Very low - should trigger famine
        water: 0.3,   // Low - should trigger water crisis
        shelter: 0.8, // Adequate
        goods: 0.9,   // Good
        services: 0.7 // Adequate
      },
      history: [],
      trends: {},
      activeConsequences: []
    }
  };
}
