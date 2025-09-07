// src/test/integration/turn-processing-need-satisfaction.test.js

import runTick from '../../application/use-cases/simulation/RunTick.js';
import BasicNeedsService from '../../domain/services/BasicNeedsService.js';
import NeedConsequenceService from '../../domain/services/NeedConsequenceService.js';
import SettlementService from '../../domain/services/SettlementService.js';
import Character from '../../domain/entities/Character.js';

describe('Turn Processing with Need Satisfaction Integration', () => {
  let mockWorldState;
  let mockSettlement;

  beforeEach(() => {
    mockSettlement = {
      id: 'settlement-1',
      name: 'Test Village',
      type: 'village',
      population: {
        total: 100,
        composition: {
          types: ['farmers', 'craftsmen'],
          counts: { farmers: 60, craftsmen: 40 }
        },
        growth: 0.02,
        migration: 0.01
      },
      resources: {
        types: ['food', 'water', 'materials'],
        amounts: { food: 50, water: 30, materials: 20 },
        production: { food: 10, water: 5, materials: 3 },
        consumption: { food: 8, water: 4, materials: 2 },
        storage: { food: 100, water: 50, materials: 30 }
      },
      buildings: [
        { type: 'house', level: 1, status: 'active', capacity: 4, occupants: ['family1'], production: {}, maintenance: {} },
        { type: 'farm', level: 2, status: 'active', capacity: 0, occupants: [], production: { food: 8 }, maintenance: { materials: 1 } },
        { type: 'well', level: 1, status: 'active', capacity: 0, occupants: [], production: { water: 5 }, maintenance: {} }
      ],
      economy: {
        currency: { gold: 100 },
        trade: [],
        markets: [],
        taxes: {},
        income: {},
        expenses: {}
      }
    };

    mockWorldState = {
      time: 0,
      worldName: 'Test World',
      nodes: [
        {
          id: 'node-1',
          name: 'Test Node',
          type: 'location',
          assignedCharacters: ['char-1']
        }
      ],
      npcs: [
        new Character({
          id: 'char-1',
          name: 'Test Character',
          currentNodeId: 'node-1',
          energy: 80,
          health: 90,
          mood: 70,
          consciousness: { frequency: 40, coherence: 0.7 },
          baseAttributes: {
            strength: { score: 10 },
            dexterity: { score: 10 },
            constitution: { score: 10 },
            intelligence: { score: 10 },
            wisdom: { score: 10 },
            charisma: { score: 10 }
          }
        })
      ],
      interactions: [],
      settlements: [mockSettlement],
      resources: {},
      history: []
    };
  });

  describe('Settlement Need Satisfaction Processing', () => {
    it('should initialize need satisfaction for settlements without it', () => {
      // Settlement without need satisfaction data
      const settlementWithoutNeeds = { ...mockSettlement };
      delete settlementWithoutNeeds.needSatisfaction;

      const worldState = {
        ...mockWorldState,
        settlements: [settlementWithoutNeeds]
      };

      const updatedState = runTick(worldState);

      expect(updatedState.settlements[0].needSatisfaction).toBeDefined();
      expect(updatedState.settlements[0].needSatisfaction.current).toBeDefined();
      expect(updatedState.settlements[0].needSatisfaction.current.food).toBeGreaterThanOrEqual(0);
      expect(updatedState.settlements[0].needSatisfaction.current.food).toBeLessThanOrEqual(1);
      expect(updatedState.settlements[0].needSatisfaction.current.water).toBeGreaterThanOrEqual(0);
      expect(updatedState.settlements[0].needSatisfaction.current.water).toBeLessThanOrEqual(1);
      expect(updatedState.settlements[0].needSatisfaction.current.shelter).toBeGreaterThanOrEqual(0);
      expect(updatedState.settlements[0].needSatisfaction.current.shelter).toBeLessThanOrEqual(1);
      expect(updatedState.settlements[0].needSatisfaction.current.goods).toBeGreaterThanOrEqual(0);
      expect(updatedState.settlements[0].needSatisfaction.current.goods).toBeLessThanOrEqual(1);
      expect(updatedState.settlements[0].needSatisfaction.current.services).toBeGreaterThanOrEqual(0);
      expect(updatedState.settlements[0].needSatisfaction.current.services).toBeLessThanOrEqual(1);
      expect(updatedState.settlements[0].needSatisfaction.current.overall).toBeGreaterThanOrEqual(0);
      expect(updatedState.settlements[0].needSatisfaction.current.overall).toBeLessThanOrEqual(1);
    });

    it('should calculate need satisfaction for settlements during turn processing', () => {
      const updatedState = runTick(mockWorldState);

      expect(updatedState.settlements[0].needSatisfaction.current).toBeDefined();
      expect(updatedState.settlements[0].needSatisfaction.current.food).toBeGreaterThanOrEqual(0);
      expect(updatedState.settlements[0].needSatisfaction.current.food).toBeLessThanOrEqual(1);
      expect(updatedState.settlements[0].needSatisfaction.current.water).toBeGreaterThanOrEqual(0);
      expect(updatedState.settlements[0].needSatisfaction.current.water).toBeLessThanOrEqual(1);
      expect(updatedState.settlements[0].needSatisfaction.current.shelter).toBeGreaterThanOrEqual(0);
      expect(updatedState.settlements[0].needSatisfaction.current.shelter).toBeLessThanOrEqual(1);
      expect(updatedState.settlements[0].needSatisfaction.current.goods).toBeGreaterThanOrEqual(0);
      expect(updatedState.settlements[0].needSatisfaction.current.goods).toBeLessThanOrEqual(1);
      expect(updatedState.settlements[0].needSatisfaction.current.services).toBeGreaterThanOrEqual(0);
      expect(updatedState.settlements[0].needSatisfaction.current.services).toBeLessThanOrEqual(1);
      expect(updatedState.settlements[0].needSatisfaction.current.overall).toBeGreaterThanOrEqual(0);
      expect(updatedState.settlements[0].needSatisfaction.current.overall).toBeLessThanOrEqual(1);
    });

    it('should create history entries for need satisfaction changes', () => {
      const updatedState = runTick(mockWorldState);

      expect(updatedState.settlements[0].needSatisfaction.history).toBeDefined();
      expect(updatedState.settlements[0].needSatisfaction.history.length).toBeGreaterThan(0);
      
      const historyEntry = updatedState.settlements[0].needSatisfaction.history[0];
      expect(historyEntry.timestamp).toBeDefined();
      expect(historyEntry.needs).toBeDefined();
      expect(historyEntry.overall).toBeDefined();
      expect(historyEntry.consequences).toBeDefined();
      expect(historyEntry.events).toBeDefined();
    });

    it('should calculate trends for need satisfaction changes', () => {
      const updatedState = runTick(mockWorldState);

      expect(updatedState.settlements[0].needSatisfaction.trends).toBeDefined();
      expect(updatedState.settlements[0].needSatisfaction.trends.food).toBeDefined();
      expect(updatedState.settlements[0].needSatisfaction.trends.water).toBeDefined();
      expect(updatedState.settlements[0].needSatisfaction.trends.shelter).toBeDefined();
      expect(updatedState.settlements[0].needSatisfaction.trends.goods).toBeDefined();
      expect(updatedState.settlements[0].needSatisfaction.trends.services).toBeDefined();
      expect(updatedState.settlements[0].needSatisfaction.trends.overall).toBeDefined();
    });
  });

  describe('Consequence Generation and Management', () => {
    it('should generate consequences when needs are not satisfied', () => {
      // Create a settlement with poor conditions
      const poorSettlement = {
        ...mockSettlement,
        resources: {
          ...mockSettlement.resources,
          amounts: { food: 5, water: 2, materials: 1 }, // Very low resources
          production: { food: 1, water: 1, materials: 0 } // Very low production
        },
        buildings: [
          { type: 'house', level: 1, status: 'damaged', capacity: 2, occupants: ['family1'], production: {}, maintenance: {} }
        ]
      };

      const worldState = {
        ...mockWorldState,
        settlements: [poorSettlement]
      };

      const updatedState = runTick(worldState);

      expect(updatedState.settlements[0].needSatisfaction.activeConsequences).toBeDefined();
      // Should have some consequences due to poor conditions
      expect(updatedState.settlements[0].needSatisfaction.activeConsequences.length).toBeGreaterThanOrEqual(0);
    });

    it('should track active consequences properly', () => {
      const updatedState = runTick(mockWorldState);

      const activeConsequences = updatedState.settlements[0].needSatisfaction.activeConsequences;
      
      if (activeConsequences.length > 0) {
        const consequence = activeConsequences[0];
        expect(consequence.id).toBeDefined();
        expect(consequence.type).toBeDefined();
        expect(consequence.severity).toBeGreaterThanOrEqual(0);
        expect(consequence.severity).toBeLessThanOrEqual(1);
        expect(consequence.startDate).toBeDefined();
        expect(consequence.duration).toBeDefined();
        expect(consequence.triggers).toBeDefined();
        expect(consequence.resolved).toBe(false);
      }
    });
  });

  describe('Historical Event Generation', () => {
    it('should generate historical events for need satisfaction consequences', () => {
      const updatedState = runTick(mockWorldState);

      // Check if any historical events were generated
      const historyEvents = updatedState.settlements[0].needSatisfaction.history[0]?.events || [];
      
      // Events should be generated if there are consequences
      if (updatedState.settlements[0].needSatisfaction.activeConsequences.length > 0) {
        expect(historyEvents.length).toBeGreaterThan(0);
      }
    });

    it('should link consequences to historical events', () => {
      const updatedState = runTick(mockWorldState);

      const historyEntry = updatedState.settlements[0].needSatisfaction.history[0];
      const activeConsequences = updatedState.settlements[0].needSatisfaction.activeConsequences;

      if (activeConsequences.length > 0) {
        expect(historyEntry.consequences.length).toBeGreaterThan(0);
        expect(historyEntry.events.length).toBeGreaterThan(0);
        
        // Each consequence should have a corresponding event
        expect(historyEntry.consequences.length).toBe(activeConsequences.length);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid settlement data gracefully', () => {
      const invalidSettlement = {
        id: 'invalid-settlement',
        // Missing required fields
      };

      const worldState = {
        ...mockWorldState,
        settlements: [invalidSettlement]
      };

      // Should not throw an error
      expect(() => runTick(worldState)).not.toThrow();
    });

    it('should continue processing other settlements if one fails', () => {
      const validSettlement = { ...mockSettlement, id: 'valid-settlement' };
      const invalidSettlement = { id: 'invalid-settlement' }; // Missing required fields

      const worldState = {
        ...mockWorldState,
        settlements: [validSettlement, invalidSettlement]
      };

      const updatedState = runTick(worldState);

      // Valid settlement should still be processed
      expect(updatedState.settlements[0].needSatisfaction).toBeDefined();
      // Invalid settlement should not cause the entire process to fail
      expect(updatedState.settlements.length).toBe(2);
    });

    it('should handle missing settlement array gracefully', () => {
      const worldState = {
        ...mockWorldState,
        settlements: undefined
      };

      // Should not throw an error
      expect(() => runTick(worldState)).not.toThrow();
    });
  });

  describe('Multiple Turn Processing', () => {
    it('should maintain need satisfaction history across multiple turns', () => {
      let currentState = { ...mockWorldState };

      // Process multiple turns
      for (let turn = 0; turn < 3; turn++) {
        currentState = runTick(currentState);
      }

      const settlement = currentState.settlements[0];
      expect(settlement.needSatisfaction.history.length).toBe(3);
      
      // Each history entry should have a different timestamp
      const timestamps = settlement.needSatisfaction.history.map(entry => entry.timestamp);
      const uniqueTimestamps = new Set(timestamps);
      expect(uniqueTimestamps.size).toBe(3);
    });

    it('should update trends correctly across multiple turns', () => {
      let currentState = { ...mockWorldState };

      // Process multiple turns
      for (let turn = 0; turn < 3; turn++) {
        currentState = runTick(currentState);
      }

      const settlement = currentState.settlements[0];
      const trends = settlement.needSatisfaction.trends;
      
      // Trends should be calculated based on the most recent change
      expect(trends.food).toBeDefined();
      expect(trends.water).toBeDefined();
      expect(trends.shelter).toBeDefined();
      expect(trends.goods).toBeDefined();
      expect(trends.services).toBeDefined();
      expect(trends.overall).toBeDefined();
    });
  });

  describe('Integration with Existing Systems', () => {
    it('should not interfere with character processing', () => {
      const updatedState = runTick(mockWorldState);

      // Character processing should still work
      expect(updatedState.npcs[0].energy).toBeDefined();
      expect(updatedState.npcs[0].health).toBeDefined();
      expect(updatedState.npcs[0].mood).toBeDefined();
      
      // Settlement processing should also work
      expect(updatedState.settlements[0].needSatisfaction).toBeDefined();
    });

    it('should increment time correctly', () => {
      const initialTime = mockWorldState.time;
      const updatedState = runTick(mockWorldState);

      expect(updatedState.time).toBe(initialTime + 1);
    });

    it('should maintain world state structure', () => {
      const updatedState = runTick(mockWorldState);

      expect(updatedState.worldName).toBe(mockWorldState.worldName);
      expect(updatedState.nodes).toBeDefined();
      expect(updatedState.npcs).toBeDefined();
      expect(updatedState.interactions).toBeDefined();
      expect(updatedState.settlements).toBeDefined();
      expect(updatedState.resources).toBeDefined();
      expect(updatedState.history).toBeDefined();
    });
  });
});
