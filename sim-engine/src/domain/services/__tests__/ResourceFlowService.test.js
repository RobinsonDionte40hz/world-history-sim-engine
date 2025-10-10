// src/domain/services/__tests__/ResourceFlowService.test.js

import ResourceFlowService from '../ResourceFlowService.js';
import ResourceFlow from '../../value-objects/ResourceFlow.js';
import { ValidationError } from '../../../shared/types/ValueObjectTypes.js';

describe('ResourceFlowService', () => {
  let service;
  let mockNodeRepository;
  let mockSettlementRepository;
  let mockEconomicProfileService;

  beforeEach(() => {
    mockNodeRepository = {
      getById: jest.fn()
    };

    mockSettlementRepository = {
      getById: jest.fn()
    };

    mockEconomicProfileService = {
      calculateEfficiency: jest.fn()
    };

    service = new ResourceFlowService({
      nodeRepository: mockNodeRepository,
      settlementRepository: mockSettlementRepository,
      economicProfileService: mockEconomicProfileService
    });
  });

  describe('calculateResourceFlows', () => {
    it('should calculate resource flows for a settlement', async () => {
      const mockSettlement = {
        id: 'settlement1',
        getResourceProductionRates: jest.fn().mockReturnValue({
          food: 10,
          materials: 5
        }),
        getResourceConsumptionRates: jest.fn().mockReturnValue({
          food: 8,
          water: 3
        }),
        getResourceCapacity: jest.fn().mockReturnValue(100),
        getProductionEfficiency: jest.fn().mockReturnValue(0.9),
        getTradeNeeds: jest.fn().mockReturnValue({}),
        getTradeSurpluses: jest.fn().mockReturnValue({}),
        getResourceImbalances: jest.fn().mockReturnValue([])
      };

      mockSettlementRepository.getById.mockResolvedValue(mockSettlement);

      const flows = await service.calculateResourceFlows('settlement1', {
        timeMultiplier: 1.0
      });

      expect(flows).toHaveLength(4); // 2 production + 2 consumption
      expect(flows.filter(f => f.flowType === 'production')).toHaveLength(2);
      expect(flows.filter(f => f.flowType === 'redistribution')).toHaveLength(2);
    });

    it('should throw error for non-existent settlement', async () => {
      mockSettlementRepository.getById.mockResolvedValue(null);

      await expect(service.calculateResourceFlows('nonexistent'))
        .rejects.toThrow(ValidationError);
    });

    it('should include trade flows when nodes are available', async () => {
      const mockSettlement = {
        id: 'settlement1',
        getResourceProductionRates: jest.fn().mockReturnValue({}),
        getResourceConsumptionRates: jest.fn().mockReturnValue({}),
        getResourceCapacity: jest.fn().mockReturnValue(100),
        getProductionEfficiency: jest.fn().mockReturnValue(1.0),
        getTradeNeeds: jest.fn().mockReturnValue({ food: 10 }),
        getTradeSurpluses: jest.fn().mockReturnValue({ materials: 5 }),
        getResourceImbalances: jest.fn().mockReturnValue([])
      };

      const mockTradeNode = {
        id: 'node1',
        getResourceSupply: jest.fn().mockImplementation(type => type === 'food' ? 15 : 0),
        getResourceDemand: jest.fn().mockImplementation(type => type === 'materials' ? 8 : 0)
      };

      mockSettlementRepository.getById.mockResolvedValue(mockSettlement);

      const flows = await service.calculateResourceFlows('settlement1', {
        availableNodes: [mockTradeNode],
        timeMultiplier: 1.0
      });

      const tradeFlows = flows.filter(f => f.flowType === 'trade');
      expect(tradeFlows).toHaveLength(2); // One for food need, one for materials surplus
    });
  });

  describe('processResourceFlow', () => {
    let mockSourceEntity;
    let mockTargetEntity;

    beforeEach(() => {
      mockSourceEntity = {
        id: 'source1',
        getResourceAmount: jest.fn().mockReturnValue(100),
        getResourceCapacity: jest.fn().mockReturnValue(200),
        removeResource: jest.fn().mockResolvedValue()
      };

      mockTargetEntity = {
        id: 'target1',
        getResourceAmount: jest.fn().mockReturnValue(20),
        getResourceCapacity: jest.fn().mockReturnValue(100),
        addResource: jest.fn().mockResolvedValue()
      };

      mockNodeRepository.getById.mockImplementation(id => {
        if (id === 'source1') return Promise.resolve(mockSourceEntity);
        if (id === 'target1') return Promise.resolve(mockTargetEntity);
        return Promise.resolve(null);
      });
    });

    it('should successfully process a valid resource flow', async () => {
      const flow = new ResourceFlow({
        sourceNodeId: 'source1',
        targetNodeId: 'target1',
        resourceType: 'food',
        amount: 50,
        efficiency: 1.0
      });

      const result = await service.processResourceFlow(flow);

      expect(result.success).toBe(true);
      expect(result.actualTransferred).toBe(50);
      expect(result.flow.status).toBe('completed');
      expect(mockSourceEntity.removeResource).toHaveBeenCalledWith('food', 50);
      expect(mockTargetEntity.addResource).toHaveBeenCalledWith('food', 50);
    });

    it('should fail when source has insufficient resources', async () => {
      mockSourceEntity.getResourceAmount.mockReturnValue(30); // Less than needed

      const flow = new ResourceFlow({
        sourceNodeId: 'source1',
        targetNodeId: 'target1',
        resourceType: 'food',
        amount: 50
      });

      const result = await service.processResourceFlow(flow);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('insufficient_resources');
      expect(result.flow.status).toBe('failed');
    });

    it('should fail when target has insufficient capacity', async () => {
      mockTargetEntity.getResourceAmount.mockReturnValue(90);
      mockTargetEntity.getResourceCapacity.mockReturnValue(100); // Only 10 capacity left

      const flow = new ResourceFlow({
        sourceNodeId: 'source1',
        targetNodeId: 'target1',
        resourceType: 'food',
        amount: 50
      });

      const result = await service.processResourceFlow(flow);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('insufficient_capacity');
      expect(result.flow.status).toBe('failed');
    });

    it('should apply economic modifiers', async () => {
      const flow = new ResourceFlow({
        sourceNodeId: 'source1',
        targetNodeId: 'target1',
        resourceType: 'food',
        amount: 50, // Reduced to fit within available capacity (80)
        efficiency: 1.0
      });

      const result = await service.processResourceFlow(flow, {
        economicModifiers: { efficiency: 0.8 }
      });

      expect(result.actualTransferred).toBe(40); // 50 * 0.8
      expect(mockSourceEntity.removeResource).toHaveBeenCalledWith('food', 40);
      expect(mockTargetEntity.addResource).toHaveBeenCalledWith('food', 40);
    });

    it('should support dry run mode', async () => {
      const flow = new ResourceFlow({
        sourceNodeId: 'source1',
        targetNodeId: 'target1',
        resourceType: 'food',
        amount: 50
      });

      const result = await service.processResourceFlow(flow, { dryRun: true });

      expect(result.success).toBe(true);
      expect(mockSourceEntity.removeResource).not.toHaveBeenCalled();
      expect(mockTargetEntity.addResource).not.toHaveBeenCalled();
    });

    it('should throw error for invalid flow', async () => {
      await expect(service.processResourceFlow('not a flow'))
        .rejects.toThrow(ValidationError);
    });

    it('should throw error for non-executable flow', async () => {
      const executedFlow = new ResourceFlow({
        sourceNodeId: 'source1',
        targetNodeId: 'target1',
        resourceType: 'food'
      }).execute();

      await expect(service.processResourceFlow(executedFlow))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('validateResourceFlow', () => {
    let mockSourceEntity;
    let mockTargetEntity;

    beforeEach(() => {
      mockSourceEntity = {
        id: 'source1',
        getResourceAmount: jest.fn().mockReturnValue(100),
        getResourceCapacity: jest.fn().mockReturnValue(200)
      };

      mockTargetEntity = {
        id: 'target1',
        getResourceAmount: jest.fn().mockReturnValue(20),
        getResourceCapacity: jest.fn().mockReturnValue(100)
      };

      mockNodeRepository.getById.mockImplementation(id => {
        if (id === 'source1') return Promise.resolve(mockSourceEntity);
        if (id === 'target1') return Promise.resolve(mockTargetEntity);
        return Promise.resolve(null);
      });
    });

    it('should validate a correct flow', async () => {
      const flow = new ResourceFlow({
        sourceNodeId: 'source1',
        targetNodeId: 'target1',
        resourceType: 'food',
        amount: 50
      });

      const result = await service.validateResourceFlow(flow);

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.recommendations).toHaveLength(0);
    });

    it('should detect missing source entity', async () => {
      mockNodeRepository.getById.mockImplementation(id => {
        if (id === 'source1') return Promise.resolve(null);
        if (id === 'target1') return Promise.resolve(mockTargetEntity);
        return Promise.resolve(null);
      });

      const flow = new ResourceFlow({
        sourceNodeId: 'source1',
        targetNodeId: 'target1',
        resourceType: 'food',
        amount: 50
      });

      const result = await service.validateResourceFlow(flow);

      expect(result.isValid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('error');
      expect(result.issues[0].field).toBe('sourceNodeId');
    });

    it('should detect insufficient resources', async () => {
      mockSourceEntity.getResourceAmount.mockReturnValue(30);

      const flow = new ResourceFlow({
        sourceNodeId: 'source1',
        targetNodeId: 'target1',
        resourceType: 'food',
        amount: 50
      });

      const result = await service.validateResourceFlow(flow);

      expect(result.isValid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('error');
      expect(result.issues[0].field).toBe('amount');
      expect(result.recommendations).toHaveLength(1);
      expect(result.recommendations[0].action).toBe('reduce_amount');
    });

    it('should detect capacity issues', async () => {
      mockTargetEntity.getResourceAmount.mockReturnValue(90);
      mockTargetEntity.getResourceCapacity.mockReturnValue(100);

      const flow = new ResourceFlow({
        sourceNodeId: 'source1',
        targetNodeId: 'target1',
        resourceType: 'food',
        amount: 50
      });

      const result = await service.validateResourceFlow(flow);

      expect(result.isValid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('error');
      expect(result.issues[0].field).toBe('capacity');
    });

    it('should warn about low efficiency', async () => {
      const flow = new ResourceFlow({
        sourceNodeId: 'source1',
        targetNodeId: 'target1',
        resourceType: 'food',
        amount: 50,
        efficiency: 0.3
      });

      const result = await service.validateResourceFlow(flow);

      expect(result.isValid).toBe(true); // Warnings don't make it invalid
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('warning');
      expect(result.issues[0].field).toBe('efficiency');
      expect(result.recommendations).toHaveLength(1);
      expect(result.recommendations[0].action).toBe('improve_infrastructure');
    });
  });

  describe('private methods', () => {
    describe('_calculateTradeEfficiency', () => {
      it('should calculate trade efficiency based on distance', () => {
        const efficiency = service._calculateTradeEfficiency(2, {});
        expect(efficiency).toBeCloseTo(0.7, 5); // 0.8 - 0.1 (distance penalty)
      });

      it('should apply economic condition modifiers', () => {
        const efficiency = service._calculateTradeEfficiency(1, { tradeEfficiency: 0.2 });
        expect(efficiency).toBe(1.0); // 0.8 + 0.2
      });

      it('should not go below minimum efficiency', () => {
        const efficiency = service._calculateTradeEfficiency(10, {});
        expect(efficiency).toBe(0.1); // Minimum
      });
    });

    describe('_calculateEconomicImpact', () => {
      it('should calculate economic impact with base values', () => {
        const flow = new ResourceFlow({
          sourceNodeId: 'source1',
          targetNodeId: 'target1',
          resourceType: 'food',
          amount: 100,
          efficiency: 1.0
        });

        const impact = service._calculateEconomicImpact(flow, 100, {});
        expect(impact).toBe(110); // 100 * 1.0 + (1.0 * 100 * 0.1)
      });

      it('should apply economic modifiers', () => {
        const flow = new ResourceFlow({
          sourceNodeId: 'source1',
          targetNodeId: 'target1',
          resourceType: 'materials',
          amount: 100,
          efficiency: 1.0
        });

        const impact = service._calculateEconomicImpact(flow, 100, { value: 0.5 });
        expect(impact).toBe(320); // 200 + 20 + 100
      });
    });

    describe('_getResourceValue', () => {
      it('should return correct values for resource types', () => {
        expect(service._getResourceValue('food')).toBe(1.0);
        expect(service._getResourceValue('materials')).toBe(2.0);
        expect(service._getResourceValue('goods')).toBe(3.0);
        expect(service._getResourceValue('unknown')).toBe(1.0);
      });
    });
  });
});