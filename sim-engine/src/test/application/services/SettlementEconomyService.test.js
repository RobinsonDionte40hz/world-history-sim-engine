// src/test/application/services/SettlementEconomyService.test.js

import SettlementEconomyService from '../../../application/services/SettlementEconomyService.js';

describe('SettlementEconomyService', () => {
  let service;
  let mockBasicNeedsService;
  let mockNeedConsequenceService;
  let mockSettlements;

  beforeEach(() => {
    // Mock console.error to avoid test output pollution
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Create mock services
    mockBasicNeedsService = {
      calculateSatisfactionLevel: jest.fn()
    };

    mockNeedConsequenceService = {
      generateConsequences: jest.fn()
    };

    // Create the service with mocks
    service = new SettlementEconomyService(mockBasicNeedsService, mockNeedConsequenceService);

    // Create mock settlements
    mockSettlements = [
      {
        id: 'settlement-1',
        name: 'Prosperous Town',
        population: { total: 500 },
        resources: { amounts: { food: 100, water: 100 } },
        buildings: [{ type: 'farm', level: 3 }, { type: 'well', level: 2 }]
      },
      {
        id: 'settlement-2',
        name: 'Struggling Village',
        population: { total: 200 },
        resources: { amounts: { food: 20, water: 30 } },
        buildings: [{ type: 'farm', level: 1 }]
      },
      {
        id: 'settlement-3',
        name: 'Crisis Settlement',
        population: { total: 100 },
        resources: { amounts: { food: 5, water: 5 } },
        buildings: []
      }
    ];
  });

  describe('processSettlementsBatch', () => {
    test('should process multiple settlements successfully', () => {
      // Mock service responses
      mockBasicNeedsService.calculateSatisfactionLevel
        .mockReturnValueOnce({
          needs: { food: 0.9, water: 0.8, shelter: 0.7, goods: 0.6, services: 0.5 },
          overall: 0.7,
          cascadingEffects: { hasEffects: false }
        })
        .mockReturnValueOnce({
          needs: { food: 0.4, water: 0.5, shelter: 0.3, goods: 0.4, services: 0.3 },
          overall: 0.38,
          cascadingEffects: { hasEffects: true }
        })
        .mockReturnValueOnce({
          needs: { food: 0.1, water: 0.2, shelter: 0.1, goods: 0.1, services: 0.1 },
          overall: 0.12,
          cascadingEffects: { hasEffects: true }
        });

      mockNeedConsequenceService.generateConsequences
        .mockReturnValue(['famine', 'unrest'])
        .mockReturnValue(['hunger', 'migration'])
        .mockReturnValue(['famine', 'disease', 'revolt']);

      const result = service.processSettlementsBatch(mockSettlements);

      expect(result.processed).toHaveLength(3);
      expect(result.failed).toHaveLength(0);
      expect(result.summary.successful).toBe(3);
      expect(result.summary.crisisCount).toBe(2);
      expect(result.summary.averageSatisfaction).toBeCloseTo(0.4, 1);
    });

    test('should handle processing failures gracefully', () => {
      mockBasicNeedsService.calculateSatisfactionLevel
        .mockImplementationOnce(() => {
          throw new Error('Processing failed');
        })
        .mockReturnValue({
          needs: { food: 0.5, water: 0.5, shelter: 0.5, goods: 0.5, services: 0.5 },
          overall: 0.5,
          cascadingEffects: { hasEffects: false }
        });

      mockNeedConsequenceService.generateConsequences.mockReturnValue([]);

      const result = service.processSettlementsBatch(mockSettlements);

      expect(result.processed).toHaveLength(2);
      expect(result.failed).toHaveLength(1);
      expect(result.summary.successful).toBe(2);
      expect(result.summary.failed).toBe(1);
    });

    test('should throw error for invalid settlements array', () => {
      expect(() => service.processSettlementsBatch(null)).toThrow('Settlements must be an array');
      expect(() => service.processSettlementsBatch('not an array')).toThrow('Settlements must be an array');
    });
  });

  describe('processSettlementsWithRegionalEffects', () => {
    test('should detect regional crisis when majority of settlements are in crisis', () => {
      mockBasicNeedsService.calculateSatisfactionLevel
        .mockReturnValue({
          needs: { food: 0.2, water: 0.2, shelter: 0.2, goods: 0.2, services: 0.2 },
          overall: 0.2,
          cascadingEffects: { hasEffects: true }
        });

      mockNeedConsequenceService.generateConsequences.mockReturnValue(['famine', 'crisis']);

      const result = service.processSettlementsWithRegionalEffects(mockSettlements);

      expect(result.regionalEffects.hasRegionalCrisis).toBe(true);
      expect(result.regionalEffects.crisisSeverity).toBe('severe');
      expect(result.regionalEffects.affectedSettlements).toBe(3);
      expect(result.regionalEffects.crisisPercentage).toBe(100);
      expect(result.recommendations).toHaveLength(2); // crisis response + migration management
    });

    test('should calculate migration pressures correctly', () => {
      mockBasicNeedsService.calculateSatisfactionLevel
        .mockReturnValueOnce({
          needs: { food: 0.9, water: 0.9, shelter: 0.8, goods: 0.7, services: 0.6 },
          overall: 0.78,
          cascadingEffects: { hasEffects: false }
        })
        .mockReturnValueOnce({
          needs: { food: 0.3, water: 0.4, shelter: 0.2, goods: 0.3, services: 0.2 },
          overall: 0.28,
          cascadingEffects: { hasEffects: true }
        })
        .mockReturnValueOnce({
          needs: { food: 0.1, water: 0.1, shelter: 0.1, goods: 0.1, services: 0.1 },
          overall: 0.1,
          cascadingEffects: { hasEffects: true }
        });

      mockNeedConsequenceService.generateConsequences.mockReturnValue([]);

      const result = service.processSettlementsWithRegionalEffects(mockSettlements);

      expect(result.migrationPressures.settlementPressures).toHaveLength(3);
      expect(result.migrationPressures.totalPressure).toBeGreaterThan(0);
      expect(result.migrationPressures.migrationRoutes).toBeDefined();
      expect(result.migrationPressures.highRiskSettlements).toHaveLength(2);
    });
  });

  describe('compareSettlements', () => {
    test('should compare settlements and provide rankings', () => {
      mockBasicNeedsService.calculateSatisfactionLevel
        .mockReturnValueOnce({
          needs: { food: 0.8, water: 0.7, shelter: 0.9, goods: 0.6, services: 0.5 },
          overall: 0.7,
          cascadingEffects: { hasEffects: false }
        })
        .mockReturnValueOnce({
          needs: { food: 0.4, water: 0.5, shelter: 0.3, goods: 0.4, services: 0.3 },
          overall: 0.38,
          cascadingEffects: { hasEffects: true }
        });

      const result = service.compareSettlements([mockSettlements[0], mockSettlements[1]]);

      expect(result.settlements).toHaveLength(2);
      expect(result.rankings.overall).toHaveLength(2);
      expect(result.rankings.overall[0].settlementId).toBe('settlement-1'); // Higher satisfaction first
      expect(result.economicGaps).toHaveLength(1);
      expect(result.tradeOpportunities).toBeDefined();
    });

    test('should throw error for insufficient settlements', () => {
      expect(() => service.compareSettlements([mockSettlements[0]])).toThrow('At least 2 settlements required');
      expect(() => service.compareSettlements([])).toThrow('At least 2 settlements required');
    });
  });

  describe('validateSettlementForEconomics', () => {
    test('should validate complete settlement successfully', () => {
      const result = service.validateSettlementForEconomics(mockSettlements[0]);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    test('should identify validation errors for invalid settlement', () => {
      const result = service.validateSettlementForEconomics(null);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Settlement must be a valid object');
    });

    test('should identify validation warnings for incomplete settlement', () => {
      const incompleteSettlement = {
        id: 'test',
        name: 'Test'
        // Missing population, resources, buildings
      };

      const result = service.validateSettlementForEconomics(incompleteSettlement);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(3); // population, resources, buildings
    });
  });

  describe('regional effect detection', () => {
    test('should identify dominant need deficits', () => {
      const crisisSettlements = [
        {
          settlementId: 'crisis-1',
          settlement: { id: 'crisis-1', name: 'Crisis Settlement 1' },
          satisfaction: {
            needs: { food: 0.2, water: 0.8, shelter: 0.3, goods: 0.4, services: 0.5 }
          },
          isInCrisis: true
        },
        {
          settlementId: 'crisis-2',
          settlement: { id: 'crisis-2', name: 'Crisis Settlement 2' },
          satisfaction: {
            needs: { food: 0.1, water: 0.9, shelter: 0.2, goods: 0.3, services: 0.4 }
          },
          isInCrisis: true
        }
      ];

      const result = service._detectRegionalEffects(crisisSettlements);

      expect(result.dominantNeedDeficits).toContain('food');
      expect(result.dominantNeedDeficits).toContain('shelter');
      expect(result.dominantNeedDeficits).not.toContain('water');
    });

    test('should generate appropriate regional risks', () => {
      const crisisSettlements = [
        {
          settlementId: 'crisis-1',
          settlement: { id: 'crisis-1', name: 'Crisis Settlement 1' },
          satisfaction: {
            needs: { food: 0.1, water: 0.9, shelter: 0.8, goods: 0.7, services: 0.6 }
          },
          isInCrisis: true
        },
        {
          settlementId: 'crisis-2',
          settlement: { id: 'crisis-2', name: 'Crisis Settlement 2' },
          satisfaction: {
            needs: { food: 0.2, water: 0.1, shelter: 0.9, goods: 0.8, services: 0.7 }
          },
          isInCrisis: true
        }
      ];

      const result = service._detectRegionalEffects(crisisSettlements);

      expect(result.regionalRisks).toHaveLength(2); // mass_migration and water_crisis_region
      expect(result.regionalRisks.some(risk => risk.type === 'water_crisis_region')).toBe(true);
    });
  });

  describe('migration route calculations', () => {
    test('should calculate migration routes between settlements', () => {
      const processedSettlements = [
        {
          settlementId: 'source-1',
          settlement: { id: 'source-1', population: { total: 200 } },
          satisfaction: { overall: 0.2 },
          isInCrisis: true
        },
        {
          settlementId: 'dest-1',
          settlement: { id: 'dest-1', population: { total: 100 } },
          satisfaction: { overall: 0.9 },
          isInCrisis: false
        }
      ];

      const routes = service._calculateMigrationRoutes(processedSettlements);

      expect(routes).toHaveLength(1);
      expect(routes[0].fromSettlementId).toBe('source-1');
      expect(routes[0].toSettlementId).toBe('dest-1');
      expect(routes[0].migrationPressure).toBeGreaterThan(0);
      expect(routes[0].estimatedMigrants).toBeGreaterThan(0);
    });

    test('should not create routes for unattractive destinations', () => {
      const processedSettlements = [
        {
          settlementId: 'source-1',
          settlement: { id: 'source-1', population: { total: 200 } },
          satisfaction: { overall: 0.8 },
          isInCrisis: false
        },
        {
          settlementId: 'dest-1',
          settlement: { id: 'dest-1', population: { total: 100 } },
          satisfaction: { overall: 0.7 },
          isInCrisis: false
        }
      ];

      const routes = service._calculateMigrationRoutes(processedSettlements);

      expect(routes).toHaveLength(0); // No significant attractiveness difference
    });
  });
});
