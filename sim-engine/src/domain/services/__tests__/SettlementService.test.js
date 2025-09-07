// src/domain/services/__tests__/SettlementService.test.js

import SettlementService from '../SettlementService.js';

describe('SettlementService', () => {
  let service;
  let mockSettlement;
  let mockSatisfactionResult;

  beforeEach(() => {
    service = new SettlementService();
    
    mockSettlement = {
      id: 'settlement-1',
      name: 'Test Village',
      population: { total: 100 },
      resources: {
        types: ['food', 'water'],
        amounts: { food: 50, water: 30 },
        production: { food: 10, water: 5 }
      },
      buildings: [
        { type: 'house', level: 1 },
        { type: 'farm', level: 2 }
      ]
    };

    mockSatisfactionResult = {
      needs: {
        food: 0.8,
        water: 0.6,
        shelter: 0.7,
        goods: 0.5,
        services: 0.4
      },
      overall: 0.6,
      consequences: [
        {
          id: 'consequence-1',
          type: 'SERVICES_SHORTAGE',
          severity: 0.3,
          startDate: Date.now(),
          duration: 5,
          triggers: ['temple_built', 'healer_hired']
        }
      ],
      cascadingEffects: {
        multiplier: 1.0,
        affectedNeeds: [],
        hasEffects: false
      }
    };
  });

  describe('Initialization', () => {
    it('should initialize need satisfaction for a new settlement', () => {
      const initializedSettlement = service.initializeNeedSatisfaction(mockSettlement);

      expect(initializedSettlement.needSatisfaction).toBeDefined();
      expect(initializedSettlement.needSatisfaction.current).toBeDefined();
      expect(initializedSettlement.needSatisfaction.current.food).toBe(0.5);
      expect(initializedSettlement.needSatisfaction.current.water).toBe(0.5);
      expect(initializedSettlement.needSatisfaction.current.shelter).toBe(0.5);
      expect(initializedSettlement.needSatisfaction.current.goods).toBe(0.5);
      expect(initializedSettlement.needSatisfaction.current.services).toBe(0.5);
      expect(initializedSettlement.needSatisfaction.current.overall).toBe(0.5);
      expect(initializedSettlement.needSatisfaction.current.lastCalculated).toBeDefined();
      expect(initializedSettlement.needSatisfaction.history).toEqual([]);
      expect(initializedSettlement.needSatisfaction.trends).toBeDefined();
      expect(initializedSettlement.needSatisfaction.activeConsequences).toEqual([]);
    });

    it('should throw error for invalid settlement during initialization', () => {
      expect(() => service.initializeNeedSatisfaction(null)).toThrow('Settlement must be a valid object');
      expect(() => service.initializeNeedSatisfaction({})).toThrow('Settlement must have a valid id');
      expect(() => service.initializeNeedSatisfaction({ id: 'test' })).toThrow('Settlement must have a valid name');
    });
  });

  describe('Need Satisfaction Updates', () => {
    it('should update need satisfaction with new calculation results', () => {
      const updatedSettlement = service.updateNeedSatisfaction(
        mockSettlement,
        mockSatisfactionResult,
        ['consequence-1'],
        ['event-1']
      );

      expect(updatedSettlement.needSatisfaction.current.food).toBe(0.8);
      expect(updatedSettlement.needSatisfaction.current.water).toBe(0.6);
      expect(updatedSettlement.needSatisfaction.current.shelter).toBe(0.7);
      expect(updatedSettlement.needSatisfaction.current.goods).toBe(0.5);
      expect(updatedSettlement.needSatisfaction.current.services).toBe(0.4);
      expect(updatedSettlement.needSatisfaction.current.overall).toBe(0.6);
      expect(updatedSettlement.needSatisfaction.current.lastCalculated).toBeDefined();
    });

    it('should create history entry when updating satisfaction', () => {
      const updatedSettlement = service.updateNeedSatisfaction(
        mockSettlement,
        mockSatisfactionResult,
        ['consequence-1'],
        ['event-1']
      );

      expect(updatedSettlement.needSatisfaction.history).toHaveLength(1);
      const historyEntry = updatedSettlement.needSatisfaction.history[0];
      expect(historyEntry.needs.food).toBe(0.8);
      expect(historyEntry.overall).toBe(0.6);
      expect(historyEntry.consequences).toEqual(['consequence-1']);
      expect(historyEntry.events).toEqual(['event-1']);
      expect(historyEntry.timestamp).toBeDefined();
    });

    it('should calculate trends when updating satisfaction', () => {
      // First update
      const firstUpdate = service.updateNeedSatisfaction(
        mockSettlement,
        mockSatisfactionResult,
        ['consequence-1'],
        ['event-1']
      );

      // Second update with different values
      const secondSatisfactionResult = {
        ...mockSatisfactionResult,
        needs: {
          food: 0.9,
          water: 0.7,
          shelter: 0.8,
          goods: 0.6,
          services: 0.5
        },
        overall: 0.7
      };

      const secondUpdate = service.updateNeedSatisfaction(
        firstUpdate,
        secondSatisfactionResult,
        ['consequence-2'],
        ['event-2']
      );

      expect(secondUpdate.needSatisfaction.trends.food).toBe(0.1); // 0.9 - 0.8
      expect(secondUpdate.needSatisfaction.trends.water).toBe(0.1); // 0.7 - 0.6
      expect(secondUpdate.needSatisfaction.trends.overall).toBe(0.1); // 0.7 - 0.6
    });

    it('should limit history to last 100 entries', () => {
      let settlement = service.initializeNeedSatisfaction(mockSettlement);
      
      // Add 105 history entries
      for (let i = 0; i < 105; i++) {
        const satisfactionResult = {
          ...mockSatisfactionResult,
          needs: {
            food: 0.5 + (i * 0.001),
            water: 0.5 + (i * 0.001),
            shelter: 0.5 + (i * 0.001),
            goods: 0.5 + (i * 0.001),
            services: 0.5 + (i * 0.001)
          },
          overall: 0.5 + (i * 0.001)
        };
        
        settlement = service.updateNeedSatisfaction(
          settlement,
          satisfactionResult,
          [`consequence-${i}`],
          [`event-${i}`]
        );
      }

      expect(settlement.needSatisfaction.history).toHaveLength(100);
    });

    it('should throw error for invalid satisfaction result', () => {
      const invalidResult = {
        needs: {
          food: 'invalid',
          water: 0.6,
          shelter: 0.7,
          goods: 0.5,
          services: 0.4
        },
        overall: 0.6
      };

      expect(() => service.updateNeedSatisfaction(mockSettlement, invalidResult))
        .toThrow('Need satisfaction for food must be a number between 0 and 1');
    });
  });

  describe('Data Retrieval', () => {
    let settlementWithData;

    beforeEach(() => {
      settlementWithData = service.updateNeedSatisfaction(
        mockSettlement,
        mockSatisfactionResult,
        ['consequence-1'],
        ['event-1']
      );
    });

    it('should get current need satisfaction', () => {
      const currentSatisfaction = service.getCurrentNeedSatisfaction(settlementWithData);

      expect(currentSatisfaction.food).toBe(0.8);
      expect(currentSatisfaction.water).toBe(0.6);
      expect(currentSatisfaction.shelter).toBe(0.7);
      expect(currentSatisfaction.goods).toBe(0.5);
      expect(currentSatisfaction.services).toBe(0.4);
      expect(currentSatisfaction.overall).toBe(0.6);
      expect(currentSatisfaction.lastCalculated).toBeDefined();
    });

    it('should return default satisfaction for settlement without need satisfaction data', () => {
      const currentSatisfaction = service.getCurrentNeedSatisfaction(mockSettlement);

      expect(currentSatisfaction.food).toBe(0.5);
      expect(currentSatisfaction.water).toBe(0.5);
      expect(currentSatisfaction.shelter).toBe(0.5);
      expect(currentSatisfaction.goods).toBe(0.5);
      expect(currentSatisfaction.services).toBe(0.5);
      expect(currentSatisfaction.overall).toBe(0.5);
    });

    it('should get need satisfaction history', () => {
      const history = service.getNeedSatisfactionHistory(settlementWithData);

      expect(history).toHaveLength(1);
      expect(history[0].needs.food).toBe(0.8);
      expect(history[0].overall).toBe(0.6);
      expect(history[0].consequences).toEqual(['consequence-1']);
      expect(history[0].events).toEqual(['event-1']);
    });

    it('should limit history entries when requested', () => {
      // Add multiple history entries
      let settlement = settlementWithData;
      for (let i = 0; i < 10; i++) {
        const satisfactionResult = {
          ...mockSatisfactionResult,
          needs: {
            food: 0.5 + (i * 0.01),
            water: 0.5 + (i * 0.01),
            shelter: 0.5 + (i * 0.01),
            goods: 0.5 + (i * 0.01),
            services: 0.5 + (i * 0.01)
          },
          overall: 0.5 + (i * 0.01)
        };
        
        settlement = service.updateNeedSatisfaction(
          settlement,
          satisfactionResult,
          [`consequence-${i}`],
          [`event-${i}`]
        );
      }

      const limitedHistory = service.getNeedSatisfactionHistory(settlement, 5);
      expect(limitedHistory).toHaveLength(5);
    });

    it('should get need satisfaction trends', () => {
      const trends = service.getNeedSatisfactionTrends(settlementWithData);

      expect(trends.food).toBe(0.3); // 0.8 - 0.5 (default)
      expect(trends.water).toBe(0.1); // 0.6 - 0.5 (default)
      expect(trends.shelter).toBe(0.2); // 0.7 - 0.5 (default)
      expect(trends.goods).toBe(0); // 0.5 - 0.5 (default)
      expect(trends.services).toBe(-0.1); // 0.4 - 0.5 (default)
      expect(trends.overall).toBe(0.1); // 0.6 - 0.5 (default)
    });

    it('should return default trends for settlement without trend data', () => {
      const trends = service.getNeedSatisfactionTrends(mockSettlement);

      expect(trends.food).toBe(0);
      expect(trends.water).toBe(0);
      expect(trends.shelter).toBe(0);
      expect(trends.goods).toBe(0);
      expect(trends.services).toBe(0);
      expect(trends.overall).toBe(0);
    });
  });

  describe('Consequence Management', () => {
    let settlementWithConsequences;

    beforeEach(() => {
      settlementWithConsequences = service.updateNeedSatisfaction(
        mockSettlement,
        mockSatisfactionResult,
        ['consequence-1'],
        ['event-1']
      );
    });

    it('should get active consequences', () => {
      const activeConsequences = service.getActiveConsequences(settlementWithConsequences);

      expect(activeConsequences).toHaveLength(1);
      expect(activeConsequences[0].id).toBe('consequence-1');
      expect(activeConsequences[0].type).toBe('SERVICES_SHORTAGE');
      expect(activeConsequences[0].severity).toBe(0.3);
      expect(activeConsequences[0].resolved).toBe(false);
    });

    it('should resolve a consequence', () => {
      const resolvedSettlement = service.resolveConsequence(
        settlementWithConsequences,
        'consequence-1'
      );

      const activeConsequences = service.getActiveConsequences(resolvedSettlement);
      expect(activeConsequences).toHaveLength(0);

      const allConsequences = resolvedSettlement.needSatisfaction.activeConsequences;
      expect(allConsequences).toHaveLength(1);
      expect(allConsequences[0].resolved).toBe(true);
      expect(allConsequences[0].endDate).toBeDefined();
    });

    it('should update existing consequences when adding new ones', () => {
      const newSatisfactionResult = {
        ...mockSatisfactionResult,
        consequences: [
          {
            id: 'consequence-1',
            type: 'SERVICES_SHORTAGE',
            severity: 0.5, // Updated severity
            startDate: Date.now(),
            duration: 7, // Updated duration
            triggers: ['temple_built', 'healer_hired', 'new_trigger']
          },
          {
            id: 'consequence-2',
            type: 'GOODS_SHORTAGE',
            severity: 0.2,
            startDate: Date.now(),
            duration: 3,
            triggers: ['market_built']
          }
        ]
      };

      const updatedSettlement = service.updateNeedSatisfaction(
        settlementWithConsequences,
        newSatisfactionResult,
        ['consequence-1', 'consequence-2'],
        ['event-2']
      );

      const activeConsequences = service.getActiveConsequences(updatedSettlement);
      expect(activeConsequences).toHaveLength(2);

      const consequence1 = activeConsequences.find(c => c.id === 'consequence-1');
      expect(consequence1.severity).toBe(0.5);
      expect(consequence1.duration).toBe(7);
      expect(consequence1.triggers).toHaveLength(3);

      const consequence2 = activeConsequences.find(c => c.id === 'consequence-2');
      expect(consequence2.type).toBe('GOODS_SHORTAGE');
      expect(consequence2.severity).toBe(0.2);
    });

    it('should remove expired consequences', () => {
      const oldConsequence = {
        id: 'old-consequence',
        type: 'FAMINE',
        severity: 0.8,
        startDate: Date.now() - (10 * 24 * 60 * 60 * 1000), // 10 days ago
        duration: 5, // Should have expired 5 days ago
        triggers: ['harvest_successful'],
        resolved: false
      };

      const settlementWithOldConsequence = {
        ...settlementWithConsequences,
        needSatisfaction: {
          ...settlementWithConsequences.needSatisfaction,
          activeConsequences: [oldConsequence]
        }
      };

      const updatedSettlement = service.updateNeedSatisfaction(
        settlementWithOldConsequence,
        mockSatisfactionResult,
        [],
        []
      );

      const activeConsequences = service.getActiveConsequences(updatedSettlement);
      expect(activeConsequences).toHaveLength(1); // Only the new consequence, old one removed
      expect(activeConsequences[0].id).toBe('consequence-1');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid settlement in getCurrentNeedSatisfaction', () => {
      const result = service.getCurrentNeedSatisfaction(null);
      expect(result.food).toBe(0.5); // Should return default
    });

    it('should handle invalid settlement in getNeedSatisfactionHistory', () => {
      const result = service.getNeedSatisfactionHistory(null);
      expect(result).toEqual([]);
    });

    it('should handle invalid settlement in getNeedSatisfactionTrends', () => {
      const result = service.getNeedSatisfactionTrends(null);
      expect(result.food).toBe(0);
    });

    it('should handle invalid settlement in getActiveConsequences', () => {
      const result = service.getActiveConsequences(null);
      expect(result).toEqual([]);
    });

    it('should throw error for invalid consequence ID in resolveConsequence', () => {
      expect(() => service.resolveConsequence(mockSettlement, null))
        .toThrow('consequenceId is required');
    });
  });

  describe('Data Integrity', () => {
    it('should not modify original settlement object', () => {
      const originalSettlement = { ...mockSettlement };
      
      service.updateNeedSatisfaction(
        mockSettlement,
        mockSatisfactionResult,
        ['consequence-1'],
        ['event-1']
      );

      expect(mockSettlement).toEqual(originalSettlement);
    });

    it('should return new objects for retrieved data', () => {
      const settlementWithData = service.updateNeedSatisfaction(
        mockSettlement,
        mockSatisfactionResult,
        ['consequence-1'],
        ['event-1']
      );

      const currentSatisfaction = service.getCurrentNeedSatisfaction(settlementWithData);
      const history = service.getNeedSatisfactionHistory(settlementWithData);
      const trends = service.getNeedSatisfactionTrends(settlementWithData);
      const consequences = service.getActiveConsequences(settlementWithData);

      // Modify retrieved data
      currentSatisfaction.food = 0.9;
      history[0].needs.food = 0.9;
      trends.food = 0.9;
      consequences[0].severity = 0.9;

      // Original data should be unchanged
      expect(settlementWithData.needSatisfaction.current.food).toBe(0.8);
      expect(settlementWithData.needSatisfaction.history[0].needs.food).toBe(0.8);
      expect(settlementWithData.needSatisfaction.trends.food).toBe(0.3);
      expect(settlementWithData.needSatisfaction.activeConsequences[0].severity).toBe(0.3);
    });
  });
});
