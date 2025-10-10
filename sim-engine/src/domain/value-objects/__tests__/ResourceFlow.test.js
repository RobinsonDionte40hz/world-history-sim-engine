// src/domain/value-objects/__tests__/ResourceFlow.test.js

import ResourceFlow from '../ResourceFlow.js';
import { ValidationError } from '../../../shared/types/ValueObjectTypes.js';

describe('ResourceFlow', () => {
  describe('constructor', () => {
    it('should create a valid ResourceFlow with minimal config', () => {
      const flow = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food'
      });

      expect(flow.sourceNodeId).toBe('node1');
      expect(flow.targetNodeId).toBe('node2');
      expect(flow.resourceType).toBe('food');
      expect(flow.amount).toBe(0);
      expect(flow.capacity).toBe(Number.MAX_SAFE_INTEGER);
      expect(flow.flowType).toBe('production');
      expect(flow.efficiency).toBe(1.0);
      expect(flow.effectiveAmount).toBe(0);
      expect(flow.status).toBe('pending');
      expect(flow.actualTransferred).toBe(0);
      expect(Array.isArray(flow.history)).toBe(true);
    });

    it('should create a ResourceFlow with full configuration', () => {
      const config = {
        id: 'test-flow',
        sourceNodeId: 'settlement1',
        targetNodeId: 'settlement2',
        resourceType: 'materials',
        amount: 100,
        capacity: 150,
        flowType: 'trade',
        efficiency: 0.8,
        metadata: { priority: 'high' },
        timestamp: 1234567890
      };

      const flow = new ResourceFlow(config);

      expect(flow.id).toBe('test-flow');
      expect(flow.sourceNodeId).toBe('settlement1');
      expect(flow.targetNodeId).toBe('settlement2');
      expect(flow.resourceType).toBe('materials');
      expect(flow.amount).toBe(100);
      expect(flow.capacity).toBe(150);
      expect(flow.flowType).toBe('trade');
      expect(flow.efficiency).toBe(0.8);
      expect(flow.effectiveAmount).toBe(80); // 100 * 0.8
      expect(flow.metadata.priority).toBe('high');
      expect(flow.timestamp).toBe(1234567890);
    });

    it('should validate required fields', () => {
      expect(() => new ResourceFlow({})).toThrow(ValidationError);
      expect(() => new ResourceFlow({ sourceNodeId: 'node1' })).toThrow(ValidationError);
      expect(() => new ResourceFlow({ sourceNodeId: 'node1', targetNodeId: 'node2' })).toThrow(ValidationError);
    });

    it('should validate resource type', () => {
      expect(() => new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'invalid'
      })).toThrow(ValidationError);
    });

    it('should validate flow type', () => {
      expect(() => new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        flowType: 'invalid'
      })).toThrow(ValidationError);
    });

    it('should validate amount range', () => {
      expect(() => new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        amount: -1
      })).toThrow(ValidationError);
    });

    it('should validate capacity range', () => {
      expect(() => new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        capacity: -1
      })).toThrow(ValidationError);
    });

    it('should validate efficiency range', () => {
      expect(() => new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        efficiency: 1.5
      })).toThrow(ValidationError);
    });

    it('should cap effective amount by capacity', () => {
      const flow = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        amount: 100,
        capacity: 50,
        efficiency: 1.0
      });

      expect(flow.effectiveAmount).toBe(50);
    });

    it('should generate unique IDs', () => {
      const flow1 = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food'
      });

      const flow2 = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food'
      });

      expect(flow1.id).not.toBe(flow2.id);
    });
  });

  describe('execution methods', () => {
    let flow;

    beforeEach(() => {
      flow = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        amount: 100,
        efficiency: 0.8
      });
    });

    it('should execute flow successfully', () => {
      const executed = flow.execute();

      expect(executed.status).toBe('completed');
      expect(executed.actualTransferred).toBe(80); // 100 * 0.8
      expect(executed.history).toHaveLength(1);
      expect(executed.history[0].action).toBe('executed');
      expect(executed.history[0].amount).toBe(80);
    });

    it('should execute flow with custom amount', () => {
      const executed = flow.execute(50);

      expect(executed.status).toBe('completed');
      expect(executed.actualTransferred).toBe(50);
      expect(executed.history[0].amount).toBe(50);
    });

    it('should fail flow', () => {
      const failed = flow.fail('Insufficient resources');

      expect(failed.status).toBe('failed');
      expect(failed.history).toHaveLength(1);
      expect(failed.history[0].action).toBe('failed');
      expect(failed.history[0].reason).toBe('Insufficient resources');
    });

    it('should check if flow can be executed', () => {
      expect(flow.canExecute()).toBe(true);

      const executed = flow.execute();
      expect(executed.canExecute()).toBe(false);

      const failed = flow.fail();
      expect(failed.canExecute()).toBe(false);
    });
  });

  describe('flow analysis methods', () => {
    it('should calculate efficiency loss', () => {
      const flow = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        amount: 100,
        capacity: 50,
        efficiency: 1.0
      });

      expect(flow.getEfficiencyLoss()).toBe(0.5); // (100 - 50) / 100
    });

    it('should identify inter-node flows', () => {
      const interNodeFlow = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food'
      });

      const sameNodeFlow = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node1',
        resourceType: 'food'
      });

      expect(interNodeFlow.isInterNodeFlow()).toBe(true);
      expect(sameNodeFlow.isInterNodeFlow()).toBe(false);
    });

    it('should identify production flows', () => {
      const productionFlow = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node1',
        resourceType: 'food',
        flowType: 'production'
      });

      const tradeFlow = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        flowType: 'trade'
      });

      expect(productionFlow.isProductionFlow()).toBe(true);
      expect(tradeFlow.isProductionFlow()).toBe(false);
    });

    it('should get flow direction', () => {
      const interNodeFlow = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food'
      });

      const productionFlow = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node1',
        resourceType: 'food',
        flowType: 'production'
      });

      expect(interNodeFlow.getFlowDirection()).toBe('node1 -> node2');
      expect(productionFlow.getFlowDirection()).toBe('node1 -> production');
    });
  });

  describe('flow manipulation methods', () => {
    it('should create reverse flow', () => {
      const original = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        amount: 100,
        flowType: 'trade',
        efficiency: 0.8
      });

      const reverse = original.createReverseFlow();

      expect(reverse.sourceNodeId).toBe('node2');
      expect(reverse.targetNodeId).toBe('node1');
      expect(reverse.resourceType).toBe('food');
      expect(reverse.amount).toBe(80); // effective amount
      expect(reverse.flowType).toBe('trade');
      expect(reverse.efficiency).toBe(0.8);
      expect(reverse.metadata.reversed).toBe(true);
    });

    it('should merge compatible flows', () => {
      const flow1 = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        amount: 50,
        capacity: 100,
        flowType: 'trade',
        efficiency: 0.9
      });

      const flow2 = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        amount: 30,
        capacity: 100,
        flowType: 'trade',
        efficiency: 0.8
      });

      const merged = flow1.mergeWith(flow2);

      expect(merged.amount).toBe(80); // 50 + 30
      expect(merged.capacity).toBe(100);
      expect(merged.efficiency).toBe(0.8); // min of both
      expect(merged.metadata.merged).toBe(true);
      expect(merged.metadata.mergeCount).toBe(2);
    });

    it('should not merge incompatible flows', () => {
      const flow1 = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        flowType: 'trade'
      });

      const flow2 = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node3', // different target
        resourceType: 'food',
        flowType: 'trade'
      });

      expect(flow1.canMergeWith(flow2)).toBe(false);
      expect(() => flow1.mergeWith(flow2)).toThrow(ValidationError);
    });

    it('should check merge compatibility', () => {
      const flow1 = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        flowType: 'trade'
      });

      const flow2 = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        flowType: 'trade'
      });

      const executedFlow = flow1.execute();

      expect(flow1.canMergeWith(flow2)).toBe(true);
      expect(flow1.canMergeWith(executedFlow)).toBe(false);
    });
  });

  describe('metrics and serialization', () => {
    it('should provide flow metrics', () => {
      const flow = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'materials',
        amount: 100,
        capacity: 120,
        flowType: 'trade',
        efficiency: 0.9,
        timestamp: 1000000
      });

      const metrics = flow.getMetrics();

      expect(metrics.resourceType).toBe('materials');
      expect(metrics.flowType).toBe('trade');
      expect(metrics.requestedAmount).toBe(100);
      expect(metrics.effectiveAmount).toBe(90); // 100 * 0.9
      expect(metrics.efficiency).toBe(0.9);
      expect(metrics.efficiencyLoss).toBe(0.1); // (100 - 90) / 100
      expect(metrics.capacityUtilization).toBe(90 / 120);
      expect(metrics.isInterNode).toBe(true);
      expect(metrics.isProduction).toBe(false);
      expect(metrics.status).toBe('pending');
      expect(metrics.age).toBeGreaterThan(0);
    });

    it('should serialize to JSON', () => {
      const flow = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        amount: 100,
        metadata: { test: 'value' }
      });

      const json = flow.toJSON();

      expect(json.sourceNodeId).toBe('node1');
      expect(json.targetNodeId).toBe('node2');
      expect(json.resourceType).toBe('food');
      expect(json.amount).toBe(100);
      expect(json.metadata.test).toBe('value');
      expect(Array.isArray(json.history)).toBe(true);
    });

    it('should deserialize from JSON', () => {
      const original = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food',
        amount: 100
      });

      const json = original.toJSON();
      const deserialized = ResourceFlow.fromJSON(json);

      expect(deserialized.sourceNodeId).toBe(original.sourceNodeId);
      expect(deserialized.targetNodeId).toBe(original.targetNodeId);
      expect(deserialized.resourceType).toBe(original.resourceType);
      expect(deserialized.amount).toBe(original.amount);
    });
  });

  describe('static factory methods', () => {
    it('should create production flow', () => {
      const flow = ResourceFlow.createProductionFlow('node1', 'food', 100, {
        efficiency: 0.9
      });

      expect(flow.sourceNodeId).toBe('node1');
      expect(flow.targetNodeId).toBe('node1');
      expect(flow.resourceType).toBe('food');
      expect(flow.amount).toBe(100);
      expect(flow.flowType).toBe('production');
      expect(flow.efficiency).toBe(0.9);
    });

    it('should create trade flow', () => {
      const flow = ResourceFlow.createTradeFlow('node1', 'node2', 'materials', 50, {
        capacity: 60
      });

      expect(flow.sourceNodeId).toBe('node1');
      expect(flow.targetNodeId).toBe('node2');
      expect(flow.resourceType).toBe('materials');
      expect(flow.amount).toBe(50);
      expect(flow.flowType).toBe('trade');
      expect(flow.capacity).toBe(60);
    });
  });

  describe('immutability', () => {
    it('should be immutable after construction', () => {
      const flow = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food'
      });

      expect(() => { flow.amount = 200; }).toThrow();
      expect(() => { flow.metadata.test = 'modified'; }).toThrow();
    });

    it('should return new instances for state changes', () => {
      const original = new ResourceFlow({
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        resourceType: 'food'
      });

      const executed = original.execute();

      expect(original).not.toBe(executed);
      expect(original.status).toBe('pending');
      expect(executed.status).toBe('completed');
    });
  });
});