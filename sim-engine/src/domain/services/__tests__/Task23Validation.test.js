// src/domain/services/__tests__/Task23Validation.test.js

import BasicNeedsService from '../BasicNeedsService.js';
import NodeTypeCapabilities from '../../value-objects/NodeTypeCapabilities.js';

describe('Task 2.3 Validation: BasicNeedsService Node Type Differentiation', () => {

  let service;

  beforeEach(() => {
    service = new BasicNeedsService();
  });

  test('should handle settlement nodes with economic capabilities', () => {
    const settlementNode = {
      id: 'test-settlement',
      name: 'Test Settlement',
      type: 'settlement',
      typeProfile: {
        capabilities: new NodeTypeCapabilities({
          canHaveEconomy: true,
          canProduceResources: true,
          canConsumeResources: true
        })
      },
      population: { total: 100 },
      buildings: [],
      economy: {},
      territory: {}
    };

    const result = service.calculateSatisfactionLevel(settlementNode);

    expect(result).toBeDefined();
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(1);
    expect(result.needs).toBeDefined();
    expect(result.economicCapabilities).toBe(true);
  });

  test('should handle resource nodes without economic capabilities', () => {
    const resourceNode = {
      id: 'test-resource',
      name: 'Test Resource Node',
      type: 'resource',
      typeProfile: {
        capabilities: new NodeTypeCapabilities({
          canProduceResources: true,
          canHaveEconomy: false
        })
      }
    };

    const result = service.calculateSatisfactionLevel(resourceNode);

    expect(result).toBeDefined();
    expect(result.overall).toBe(1.0); // No needs for non-economic nodes
    expect(result.needs.food).toBe(1.0);
    expect(result.needs.water).toBe(1.0);
    expect(result.economicCapabilities).toBe(false);
    expect(result.nodeType).toBe('resource');
  });

  test('should fallback to type checking when no typeProfile exists', () => {
    const fallbackSettlement = {
      id: 'fallback-settlement',
      name: 'Fallback Settlement',
      type: 'settlement',
      population: { total: 100 },
      buildings: [],
      economy: {},
      territory: {}
    };

    const result = service.calculateSatisfactionLevel(fallbackSettlement);

    expect(result).toBeDefined();
    expect(result.economicCapabilities).toBe(true);
    expect(result.needs).toBeDefined();
  });

  test('should integrate resource flows into satisfaction calculations', () => {
    const settlementWithFlows = {
      id: 'settlement-with-flows',
      name: 'Settlement with Resource Flows',
      type: 'settlement',
      typeProfile: {
        capabilities: new NodeTypeCapabilities({
          canHaveEconomy: true,
          canProduceResources: true,
          canConsumeResources: true
        })
      },
      population: { total: 100 },
      buildings: [],
      economy: {},
      territory: {}
    };

    const resourceFlows = [
      {
        id: 'flow1',
        resourceType: 'food',
        amount: 50,
        sourceNodeId: 'farm-node',
        targetNodeId: 'settlement-with-flows',
        status: 'completed'
      },
      {
        id: 'flow2',
        resourceType: 'water',
        amount: 30,
        sourceNodeId: 'well-node',
        targetNodeId: 'settlement-with-flows',
        status: 'failed',
        failureReason: 'drought'
      }
    ];

    const result = service.calculateSatisfactionLevel(settlementWithFlows, null, resourceFlows);

    expect(result).toBeDefined();
    expect(result.productionNodeEffects).toBeDefined();
    expect(result.productionNodeEffects.failedNodes).toHaveLength(1);
    expect(result.productionNodeEffects.resourceShortages).toHaveLength(1);
    expect(result.resourceFlows).toHaveLength(2);
  });

  test('should calculate production node failure cascading effects', () => {
    const settlement = {
      id: 'test-settlement',
      name: 'Test Settlement',
      type: 'settlement',
      typeProfile: {
        capabilities: new NodeTypeCapabilities({
          canHaveEconomy: true
        })
      },
      population: { total: 100 },
      buildings: [],
      economy: {},
      territory: {}
    };

    const failedFlows = [
      {
        id: 'failed-flow',
        resourceType: 'food',
        amount: 200, // Large failure
        sourceNodeId: 'failed-farm',
        targetNodeId: 'test-settlement',
        status: 'failed',
        failureReason: 'drought'
      }
    ];

    const result = service.calculateSatisfactionLevel(settlement, null, failedFlows);

    expect(result.productionNodeEffects.cascadingImpact).toBeGreaterThan(0);
    expect(result.overall).toBeLessThan(1.0);
    expect(result.consequences.some(c => c.type.includes('supply_disruption'))).toBe(true);
  });
});