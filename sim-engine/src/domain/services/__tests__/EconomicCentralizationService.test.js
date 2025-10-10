// src/domain/services/__tests__/EconomicCentralizationService.test.js

import EconomicCentralizationService from '../EconomicCentralizationService.js';
import { ValidationError } from '../../../shared/types/ValueObjectTypes.js';

describe('EconomicCentralizationService', () => {
  let service;
  let mockSettlementRepository;
  let mockNodeRepository;
  let mockResourceFlowService;
  let mockEconomicProfileService;
  let mockBasicNeedsService;

  beforeEach(() => {
    mockSettlementRepository = {
      getById: jest.fn()
    };

    mockNodeRepository = {
      getById: jest.fn()
    };

    mockResourceFlowService = {
      calculateResourceFlows: jest.fn(),
      processResourceFlow: jest.fn(),
      validateResourceFlow: jest.fn()
    };

    mockEconomicProfileService = {
      calculateEfficiency: jest.fn()
    };

    mockBasicNeedsService = {
      calculateNeeds: jest.fn()
    };

    service = new EconomicCentralizationService({
      settlementRepository: mockSettlementRepository,
      nodeRepository: mockNodeRepository,
      resourceFlowService: mockResourceFlowService,
      economicProfileService: mockEconomicProfileService,
      basicNeedsService: mockBasicNeedsService
    });
  });

  describe('executeEconomicCentralization', () => {
    it('should process economic flows for specified settlements', async () => {
      const mockSettlement = {
        id: 'settlement1',
        getResourceAmounts: jest.fn().mockReturnValue({ food: 100, water: 50 }),
        getResourceConsumptionRates: jest.fn().mockReturnValue({ food: 10, water: 5 }),
        getResourceProductionRates: jest.fn().mockReturnValue({ food: 8, materials: 3 })
      };

      mockSettlementRepository.getById.mockResolvedValue(mockSettlement);
      mockResourceFlowService.calculateResourceFlows.mockResolvedValue([
        { id: 'flow1', resourceType: 'food', amount: 10 },
        { id: 'flow2', resourceType: 'water', amount: 5 }
      ]);
      mockResourceFlowService.processResourceFlow.mockResolvedValue({
        success: true,
        actualTransferred: 10,
        metrics: { efficiency: 1.0 }
      });

      const result = await service.executeEconomicCentralization({
        settlementIds: ['settlement1'],
        timeMultiplier: 1.0
      });

      expect(result.settlementsProcessed).toHaveLength(1);
      expect(result.totalFlowsCalculated).toBe(2);
      expect(result.totalFlowsExecuted).toBe(2);
      expect(result.economicMetrics.totalTradeVolume).toBe(20);
    });

    it('should handle dry run mode', async () => {
      const mockSettlement = {
        id: 'settlement1',
        getResourceAmounts: jest.fn().mockReturnValue({ food: 100 }),
        getResourceConsumptionRates: jest.fn().mockReturnValue({ food: 10 }),
        getResourceProductionRates: jest.fn().mockReturnValue({ food: 8 })
      };

      mockSettlementRepository.getById.mockResolvedValue(mockSettlement);
      mockResourceFlowService.calculateResourceFlows.mockResolvedValue([
        { id: 'flow1', resourceType: 'food', amount: 10 }
      ]);

      const result = await service.executeEconomicCentralization({
        settlementIds: ['settlement1'],
        dryRun: true
      });

      expect(result.totalFlowsExecuted).toBe(0);
      expect(mockResourceFlowService.processResourceFlow).not.toHaveBeenCalled();
    });

    it('should handle settlement processing errors', async () => {
      // Mock the resource flow service to reject with a specific error
      mockResourceFlowService.calculateResourceFlows.mockRejectedValue(new Error('Database connection failed'));

      const result = await service.executeEconomicCentralization({
        settlementIds: ['settlement1']
      });

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].settlementId).toBe('settlement1');
      expect(result.errors[0].error).toBe('Database connection failed');
    });
  });

  describe('calculateSettlementResourceNeeds', () => {
    it('should calculate resource needs for a settlement', async () => {
      const mockSettlement = {
        id: 'settlement1',
        getResourceAmounts: jest.fn().mockReturnValue({
          food: 50,
          water: 30,
          materials: 20
        }),
        getResourceConsumptionRates: jest.fn().mockReturnValue({
          food: 10,
          water: 8,
          materials: 2
        }),
        getResourceProductionRates: jest.fn().mockReturnValue({
          food: 5,
          water: 3,
          materials: 5
        }),
        getPopulation: jest.fn().mockReturnValue(100),
        getInfrastructureLevel: jest.fn().mockReturnValue(0.8),
        getMarketAccess: jest.fn().mockReturnValue(0.9)
      };

      mockSettlementRepository.getById.mockResolvedValue(mockSettlement);

      const result = await service.calculateSettlementResourceNeeds('settlement1', {
        timeHorizon: 10,
        safetyBuffer: 1.1
      });

      expect(result.settlementId).toBe('settlement1');
      expect(result.needs.food).toBeGreaterThan(0); // 10*10*1.1 - 5*10 - 50 = 60 > 0
      expect(result.surpluses.materials).toBeGreaterThan(0); // materials production exceeds consumption
      expect(result.tradePriorities).toBeDefined();
      expect(result.metrics.totalDeficitValue).toBeGreaterThan(0);
      expect(result.metrics.tradeEfficiency).toBe(0.8 * 0.9);
    });

    it('should throw error for non-existent settlement', async () => {
      mockSettlementRepository.getById.mockResolvedValue(null);

      await expect(service.calculateSettlementResourceNeeds('nonexistent'))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('optimizeInterSettlementTrade', () => {
    it('should optimize trade flows between settlements', async () => {
      const settlementA = {
        id: 'settlementA',
        getResourceAmounts: jest.fn().mockReturnValue({ food: 20, materials: 100 }),
        getResourceConsumptionRates: jest.fn().mockReturnValue({ food: 15, materials: 5 }),
        getResourceProductionRates: jest.fn().mockReturnValue({ food: 5, materials: 20 })
      };

      const settlementB = {
        id: 'settlementB',
        getResourceAmounts: jest.fn().mockReturnValue({ food: 100, materials: 10 }),
        getResourceConsumptionRates: jest.fn().mockReturnValue({ food: 5, materials: 15 }),
        getResourceProductionRates: jest.fn().mockReturnValue({ food: 20, materials: 2 })
      };

      mockSettlementRepository.getById.mockImplementation((id) => {
        if (id === 'settlementA') return Promise.resolve(settlementA);
        if (id === 'settlementB') return Promise.resolve(settlementB);
        return Promise.resolve(null);
      });

      const tradeFlows = await service.optimizeInterSettlementTrade(['settlementA', 'settlementB']);

      expect(tradeFlows).toBeDefined();
      expect(Array.isArray(tradeFlows)).toBe(true);
      // Should find trade opportunities between settlements with complementary needs/surpluses
    });

    it('should sort trade flows by economic benefit', async () => {
      const settlementA = {
        id: 'settlementA',
        getResourceAmounts: jest.fn().mockReturnValue({ food: 10 }),
        getResourceConsumptionRates: jest.fn().mockReturnValue({ food: 10 }),
        getResourceProductionRates: jest.fn().mockReturnValue({ food: 2 })
      };

      const settlementB = {
        id: 'settlementB',
        getResourceAmounts: jest.fn().mockReturnValue({ food: 50 }),
        getResourceConsumptionRates: jest.fn().mockReturnValue({ food: 2 }),
        getResourceProductionRates: jest.fn().mockReturnValue({ food: 15 })
      };

      mockSettlementRepository.getById
        .mockResolvedValueOnce(settlementA)
        .mockResolvedValueOnce(settlementB)
        .mockResolvedValueOnce(settlementA)
        .mockResolvedValueOnce(settlementB);

      const tradeFlows = await service.optimizeInterSettlementTrade(['settlementA', 'settlementB']);

      expect(tradeFlows).toBeDefined();
      expect(Array.isArray(tradeFlows)).toBe(true);

      // Check that flows are sorted by economic benefit (highest first)
      const benefits = tradeFlows.map(flow => flow.economicBenefit || 0);
      const sortedBenefits = [...benefits].sort((a, b) => b - a);
      expect(benefits).toEqual(sortedBenefits);
    });
  });

  describe('processCascadingEconomicEffects', () => {
    it('should process cascading effects from executed flows', async () => {
      const executedFlows = [
        {
          success: true,
          flow: {
            id: 'flow1',
            sourceNodeId: 'settlementA',
            targetNodeId: 'settlementB',
            resourceType: 'food',
            flowType: 'trade',
            effectiveAmount: 50,
            actualTransferred: 50,
            efficiency: 1.0
          },
          actualTransferred: 50
        }
      ];

      const effects = await service.processCascadingEconomicEffects(executedFlows);

      expect(effects.affectedSettlements).toContain('settlementA');
      expect(effects.affectedSettlements).toContain('settlementB');
      expect(effects.resourcePriceChanges).toBeDefined();
      expect(effects.economicMultipliers).toHaveProperty('flow1');
      expect(effects.longTermImpacts).toBeDefined();
    });

    it('should generate secondary flows when requested', async () => {
      const mockSettlement = {
        id: 'settlementA',
        getResourceAmount: jest.fn().mockReturnValue(100)
      };

      mockSettlementRepository.getById.mockResolvedValue(mockSettlement);

      const executedFlows = [
        {
          success: true,
          flow: {
            id: 'flow1',
            sourceNodeId: 'settlementA',
            targetNodeId: 'settlementB',
            resourceType: 'food',
            flowType: 'trade',
            effectiveAmount: 50,
            actualTransferred: 50,
            efficiency: 1.0,
            isInterNodeFlow: () => true
          },
          actualTransferred: 50
        }
      ];

      const effects = await service.processCascadingEconomicEffects(executedFlows, {
        generateSecondaryFlows: true
      });

      expect(Array.isArray(effects.secondaryFlows)).toBe(true);
    });
  });

  describe('getEconomicDashboard', () => {
    it('should return economic dashboard data', async () => {
      const mockSettlement = {
        id: 'settlement1',
        getTradeVolume: jest.fn().mockReturnValue(1000),
        getEconomicEfficiency: jest.fn().mockReturnValue(0.85),
        getResourceBalance: jest.fn().mockReturnValue(0.2),
        getPopulation: jest.fn().mockReturnValue(500),
        getInfrastructureLevel: jest.fn().mockReturnValue(0.9)
      };

      // Mock _getAllSettlementIds to return settlement IDs
      service._getAllSettlementIds = jest.fn().mockResolvedValue(['settlement1']);
      mockSettlementRepository.getById.mockResolvedValue(mockSettlement);
      service._getRecentResourceFlows = jest.fn().mockResolvedValue({
        activeFlows: [],
        pendingFlows: [],
        failedFlows: []
      });

      const dashboard = await service.getEconomicDashboard();

      expect(dashboard.systemOverview.totalSettlements).toBe(1);
      expect(dashboard.systemOverview.totalTradeVolume).toBe(1000);
      expect(dashboard.systemOverview.averageEfficiency).toBe(0.85);
      expect(dashboard.settlementMetrics).toHaveLength(1);
      expect(dashboard.settlementMetrics[0].settlementId).toBe('settlement1');
      expect(dashboard.resourceFlows).toBeDefined();
    });

    it('should calculate system health correctly', async () => {
      service._getAllSettlementIds = jest.fn().mockResolvedValue([]);
      service._getRecentResourceFlows = jest.fn().mockResolvedValue({
        activeFlows: [],
        pendingFlows: [],
        failedFlows: []
      });

      const dashboard = await service.getEconomicDashboard();

      expect(['excellent', 'good', 'fair', 'poor']).toContain(dashboard.systemOverview.systemHealth);
    });
  });

  describe('private methods', () => {
    describe('_calculateTradePriorities', () => {
      it('should calculate trade priorities based on needs', () => {
        const settlement = {
          getPopulation: jest.fn().mockReturnValue(100)
        };

        const needs = { food: 50, water: 30, materials: 20 };
        const surpluses = { goods: 10 };

        const priorities = service._calculateTradePriorities(needs, surpluses, settlement);

        expect(priorities.food).toBeGreaterThan(priorities.materials);
        expect(priorities.food).toBeGreaterThan(0);
      });
    });

    describe('_calculateResourceValue', () => {
      it('should calculate total value of resources', () => {
        const resourceAmounts = { food: 10, materials: 5, goods: 2 };

        const value = service._calculateResourceValue(resourceAmounts);

        expect(value).toBe(10 * 1.0 + 5 * 2.0 + 2 * 3.0); // 10 + 10 + 6 = 26
      });
    });

    describe('_calculateOptimalTradeFlows', () => {
      it('should calculate optimal trade flows between settlements', () => {
        const sourceSettlement = { id: 'settlement1' };
        const targetSettlement = { id: 'settlement2' };
        const sourceNeeds = { food: 20, materials: 10 };
        const targetSurpluses = { food: 30, water: 15 };

        const flows = service._calculateOptimalTradeFlows(
          sourceSettlement,
          targetSettlement,
          sourceNeeds,
          targetSurpluses
        );

        expect(flows).toHaveLength(1); // Only food can be traded
        expect(flows[0].resourceType).toBe('food');
        expect(flows[0].amount).toBe(20); // Limited by need
        expect(flows[0].economicBenefit).toBeDefined();
        expect(typeof flows[0].economicBenefit).toBe('number');
        expect(flows[0].economicBenefit).toBeGreaterThan(0);
      });
    });

    describe('_calculateEconomicMultiplier', () => {
      it('should calculate economic multiplier for flows', () => {
        const flow = {
          efficiency: 1.2,
          effectiveAmount: 100
        };

        const multiplier = service._calculateEconomicMultiplier(flow);

        expect(multiplier).toBeGreaterThan(1.0);
        expect(multiplier).toBe(1.0 + 0.2 + Math.log10(100) * 0.1); // base + efficiency bonus + scale bonus
      });
    });

    describe('_calculateLongTermImpacts', () => {
      it('should calculate long-term economic impacts', () => {
        const executedFlows = [
          {
            success: true,
            flow: { 
              sourceNodeId: 'node1', 
              targetNodeId: 'node2',
              isInterNodeFlow: () => true 
            },
            actualTransferred: 50
          },
          {
            success: true,
            flow: { 
              sourceNodeId: 'node1', 
              targetNodeId: 'node1',
              isInterNodeFlow: () => false 
            },
            actualTransferred: 30
          }
        ];

        const priceChanges = { food: 0.1 };

        const impacts = service._calculateLongTermImpacts(executedFlows, priceChanges);

        expect(impacts.economicGrowth).toBe(8); // (50 + 30) * 0.1
        expect(impacts.tradeNetworkStrength).toBe(2.5); // 50 * 0.05
        expect(impacts.wealthDistribution).toBe(0);
      });
    });
  });
});