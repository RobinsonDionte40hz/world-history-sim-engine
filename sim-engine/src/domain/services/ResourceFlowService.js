// src/domain/services/ResourceFlowService.js

import ResourceFlow from '../value-objects/ResourceFlow.js';
import { ValidationError } from '../../shared/types/ValueObjectTypes.js';

/**
 * Service for managing resource flows between nodes and settlements
 * Handles calculation, validation, and processing of resource transfers
 */
class ResourceFlowService {
  /**
   * Create a new ResourceFlowService
   * @param {Object} dependencies - Service dependencies
   * @param {Object} dependencies.nodeRepository - Repository for accessing nodes
   * @param {Object} dependencies.settlementRepository - Repository for accessing settlements
   * @param {Object} dependencies.economicProfileService - Service for economic calculations
   */
  constructor(dependencies = {}) {
    this.nodeRepository = dependencies.nodeRepository;
    this.settlementRepository = dependencies.settlementRepository;
    this.economicProfileService = dependencies.economicProfileService;
  }

  /**
   * Calculate resource flows for a settlement based on its needs and available resources
   * @param {string} settlementId - ID of the settlement
   * @param {Object} context - Calculation context
   * @param {Array} context.availableNodes - Available nodes for resource sourcing
   * @param {Object} context.economicConditions - Current economic conditions
   * @param {number} context.timeMultiplier - Time-based multiplier for flows
   * @returns {Array<ResourceFlow>} Array of calculated resource flows
   */
  async calculateResourceFlows(settlementId, context = {}) {
    const settlement = await this.settlementRepository.getById(settlementId);
    if (!settlement) {
      throw new ValidationError('settlementId', settlementId, 'Settlement not found');
    }

    const flows = [];
    const availableNodes = context.availableNodes || [];
    const economicConditions = context.economicConditions || {};
    const timeMultiplier = context.timeMultiplier || 1.0;

    // Calculate production flows (internal generation)
    const productionFlows = this._calculateProductionFlows(settlement, timeMultiplier);
    flows.push(...productionFlows);

    // Calculate consumption flows (internal usage)
    const consumptionFlows = this._calculateConsumptionFlows(settlement, timeMultiplier);
    flows.push(...consumptionFlows);

    // Calculate trade flows (inter-node transfers)
    const tradeFlows = await this._calculateTradeFlows(settlement, availableNodes, economicConditions);
    flows.push(...tradeFlows);

    // Calculate redistribution flows (internal balancing)
    const redistributionFlows = this._calculateRedistributionFlows(settlement, timeMultiplier);
    flows.push(...redistributionFlows);

    return flows;
  }

  /**
   * Process a resource flow, updating node/settlement resources accordingly
   * @param {ResourceFlow} flow - The resource flow to process
   * @param {Object} context - Processing context
   * @param {boolean} context.dryRun - If true, don't actually modify resources
   * @param {Object} context.economicModifiers - Economic modifiers to apply
   * @returns {Object} Processing result with updated resources and metrics
   */
  async processResourceFlow(flow, context = {}) {
    if (!(flow instanceof ResourceFlow)) {
      throw new ValidationError('flow', flow, 'Must be a ResourceFlow instance');
    }

    if (!flow.canExecute()) {
      throw new ValidationError('flow', flow, 'Flow cannot be executed');
    }

    const dryRun = context.dryRun || false;
    const economicModifiers = context.economicModifiers || {};

    // Get source and target entities
    const sourceEntity = await this._getEntityByNodeId(flow.sourceNodeId);
    const targetEntity = await this._getEntityByNodeId(flow.targetNodeId);

    if (!sourceEntity) {
      throw new ValidationError('sourceNodeId', flow.sourceNodeId, 'Source entity not found');
    }

    if (!targetEntity) {
      throw new ValidationError('targetNodeId', flow.targetNodeId, 'Target entity not found');
    }

    // Validate resource availability at source
    const availableAmount = this._getResourceAmount(sourceEntity, flow.resourceType);
    if (availableAmount < flow.effectiveAmount) {
      // Create failed flow with reason
      const failedFlow = flow.fail(`Insufficient ${flow.resourceType} at source (${availableAmount} available, ${flow.effectiveAmount} needed)`);
      return {
        success: false,
        flow: failedFlow,
        reason: 'insufficient_resources',
        availableAmount,
        requestedAmount: flow.effectiveAmount
      };
    }

    // Check target capacity
    const targetCapacity = this._getResourceCapacity(targetEntity, flow.resourceType);
    const currentAmount = this._getResourceAmount(targetEntity, flow.resourceType);
    const availableCapacity = targetCapacity - currentAmount;

    if (availableCapacity < flow.effectiveAmount) {
      const failedFlow = flow.fail(`Insufficient capacity at target (${availableCapacity} available, ${flow.effectiveAmount} needed)`);
      return {
        success: false,
        flow: failedFlow,
        reason: 'insufficient_capacity',
        availableCapacity,
        requestedAmount: flow.effectiveAmount
      };
    }

    // Apply economic modifiers to actual transfer amount
    let actualTransferred = flow.effectiveAmount;
    if (economicModifiers.efficiency) {
      actualTransferred *= economicModifiers.efficiency;
    }

    // Execute the transfer
    if (!dryRun) {
      await this._transferResource(sourceEntity, targetEntity, flow.resourceType, actualTransferred);
    }

    // Create executed flow
    const executedFlow = flow.execute(actualTransferred);

    return {
      success: true,
      flow: executedFlow,
      actualTransferred,
      sourceEntity,
      targetEntity,
      metrics: {
        efficiency: actualTransferred / flow.amount,
        capacityUtilization: actualTransferred / flow.capacity,
        economicImpact: this._calculateEconomicImpact(flow, actualTransferred, economicModifiers)
      }
    };
  }

  /**
   * Validate a resource flow against current system state
   * @param {ResourceFlow} flow - Flow to validate
   * @returns {Object} Validation result with issues and recommendations
   */
  async validateResourceFlow(flow) {
    const issues = [];
    const recommendations = [];

    // Check source entity exists
    const sourceEntity = await this._getEntityByNodeId(flow.sourceNodeId);
    if (!sourceEntity) {
      issues.push({
        type: 'error',
        field: 'sourceNodeId',
        message: `Source entity ${flow.sourceNodeId} not found`
      });
    } else {
      // Check resource availability
      const available = this._getResourceAmount(sourceEntity, flow.resourceType);
      if (available < flow.effectiveAmount) {
        issues.push({
          type: 'error',
          field: 'amount',
          message: `Insufficient ${flow.resourceType} (${available} available, ${flow.effectiveAmount} needed)`
        });
        recommendations.push({
          action: 'reduce_amount',
          suggestedAmount: Math.min(available, flow.effectiveAmount),
          reason: 'Match available resources'
        });
      }
    }

    // Check target entity exists
    const targetEntity = await this._getEntityByNodeId(flow.targetNodeId);
    if (!targetEntity) {
      issues.push({
        type: 'error',
        field: 'targetNodeId',
        message: `Target entity ${flow.targetNodeId} not found`
      });
    } else {
      // Check capacity
      const capacity = this._getResourceCapacity(targetEntity, flow.resourceType);
      const current = this._getResourceAmount(targetEntity, flow.resourceType);
      const availableCapacity = capacity - current;

      if (availableCapacity < flow.effectiveAmount) {
        issues.push({
          type: 'error',
          field: 'capacity',
          message: `Insufficient capacity (${availableCapacity} available, ${flow.effectiveAmount} needed)`
        });
        recommendations.push({
          action: 'reduce_amount',
          suggestedAmount: Math.min(availableCapacity, flow.effectiveAmount),
          reason: 'Respect capacity limits'
        });
      }
    }

    // Check flow efficiency
    if (flow.efficiency < 0.5) {
      issues.push({
        type: 'warning',
        field: 'efficiency',
        message: `Low efficiency (${(flow.efficiency * 100).toFixed(1)}%)`
      });
      recommendations.push({
        action: 'improve_infrastructure',
        reason: 'Consider upgrading transportation or storage infrastructure'
      });
    }

    return {
      isValid: issues.filter(i => i.type === 'error').length === 0,
      issues,
      recommendations,
      flow
    };
  }

  /**
   * Calculate production flows for a settlement
   * @private
   */
  _calculateProductionFlows(settlement, timeMultiplier) {
    const flows = [];

    // Get settlement's resource production capabilities
    const productionRates = settlement.getResourceProductionRates();

    Object.entries(productionRates).forEach(([resourceType, rate]) => {
      if (rate > 0) {
        const amount = rate * timeMultiplier;
        const capacity = settlement.getResourceCapacity(resourceType);

        flows.push(ResourceFlow.createProductionFlow(
          settlement.id,
          resourceType,
          amount,
          {
            capacity,
            efficiency: settlement.getProductionEfficiency(resourceType),
            metadata: {
              source: 'settlement_production',
              timeMultiplier
            }
          }
        ));
      }
    });

    return flows;
  }

  /**
   * Calculate consumption flows for a settlement
   * @private
   */
  _calculateConsumptionFlows(settlement, timeMultiplier) {
    const flows = [];

    // Get settlement's resource consumption needs
    const consumptionRates = settlement.getResourceConsumptionRates();

    Object.entries(consumptionRates).forEach(([resourceType, rate]) => {
      if (rate > 0) {
        const amount = rate * timeMultiplier;

        flows.push(new ResourceFlow({
          sourceNodeId: settlement.id,
          targetNodeId: settlement.id,
          resourceType,
          amount,
          flowType: 'redistribution', // Internal consumption
          efficiency: 1.0, // Consumption is always 100% efficient
          metadata: {
            source: 'settlement_consumption',
            timeMultiplier
          }
        }));
      }
    });

    return flows;
  }

  /**
   * Calculate trade flows with other nodes
   * @private
   */
  async _calculateTradeFlows(settlement, availableNodes, economicConditions) {
    const flows = [];

    // Get settlement's trade needs and surpluses
    const tradeNeeds = settlement.getTradeNeeds();
    const tradeSurpluses = settlement.getTradeSurpluses();

    // Find trade partners
    for (const node of availableNodes) {
      // Calculate trade flows for needs
      for (const [resourceType, needAmount] of Object.entries(tradeNeeds)) {
        const nodeSupply = node.getResourceSupply(resourceType);
        if (nodeSupply > 0) {
          const tradeAmount = Math.min(needAmount, nodeSupply);
          const distance = this._calculateNodeDistance(settlement, node);
          const efficiency = this._calculateTradeEfficiency(distance, economicConditions);

          flows.push(ResourceFlow.createTradeFlow(
            node.id,
            settlement.id,
            resourceType,
            tradeAmount,
            {
              efficiency,
              metadata: {
                distance,
                tradePartner: node.id,
                source: 'trade_need'
              }
            }
          ));
        }
      }

      // Calculate trade flows for surpluses
      for (const [resourceType, surplusAmount] of Object.entries(tradeSurpluses)) {
        const nodeDemand = node.getResourceDemand(resourceType);
        if (nodeDemand > 0) {
          const tradeAmount = Math.min(surplusAmount, nodeDemand);
          const distance = this._calculateNodeDistance(settlement, node);
          const efficiency = this._calculateTradeEfficiency(distance, economicConditions);

          flows.push(ResourceFlow.createTradeFlow(
            settlement.id,
            node.id,
            resourceType,
            tradeAmount,
            {
              efficiency,
              metadata: {
                distance,
                tradePartner: node.id,
                source: 'trade_surplus'
              }
            }
          ));
        }
      }
    }

    return flows;
  }

  /**
   * Calculate redistribution flows within settlement
   * @private
   */
  _calculateRedistributionFlows(settlement, timeMultiplier) {
    const flows = [];

    // Get internal resource imbalances
    const imbalances = settlement.getResourceImbalances();

    imbalances.forEach(imbalance => {
      if (imbalance.surplus > 0 && imbalance.deficit > 0) {
        const redistributionAmount = Math.min(imbalance.surplus, imbalance.deficit);

        flows.push(new ResourceFlow({
          sourceNodeId: settlement.id,
          targetNodeId: settlement.id,
          resourceType: imbalance.resourceType,
          amount: redistributionAmount * timeMultiplier,
          flowType: 'redistribution',
          efficiency: 0.9, // Internal redistribution is highly efficient
          metadata: {
            source: 'internal_redistribution',
            timeMultiplier,
            imbalance: imbalance
          }
        }));
      }
    });

    return flows;
  }

  /**
   * Get entity by node ID (could be settlement or node)
   * @private
   */
  async _getEntityByNodeId(nodeId) {
    // Try settlement first
    let entity = await this.settlementRepository?.getById(nodeId);
    if (entity) return entity;

    // Try node repository
    entity = await this.nodeRepository?.getById(nodeId);
    return entity;
  }

  /**
   * Get resource amount from entity
   * @private
   */
  _getResourceAmount(entity, resourceType) {
    if (entity.getResourceAmount) {
      return entity.getResourceAmount(resourceType);
    }
    // Fallback for basic node structure
    return entity.resources?.[resourceType] || 0;
  }

  /**
   * Get resource capacity from entity
   * @private
   */
  _getResourceCapacity(entity, resourceType) {
    if (entity.getResourceCapacity) {
      return entity.getResourceCapacity(resourceType);
    }
    // Fallback for basic node structure
    return entity.capacities?.[resourceType] || Number.MAX_SAFE_INTEGER;
  }

  /**
   * Transfer resource between entities
   * @private
   */
  async _transferResource(sourceEntity, targetEntity, resourceType, amount) {
    // Remove from source
    if (sourceEntity.removeResource) {
      await sourceEntity.removeResource(resourceType, amount);
    } else if (sourceEntity.resources) {
      sourceEntity.resources[resourceType] = Math.max(0, (sourceEntity.resources[resourceType] || 0) - amount);
    }

    // Add to target
    if (targetEntity.addResource) {
      await targetEntity.addResource(resourceType, amount);
    } else if (targetEntity.resources) {
      targetEntity.resources[resourceType] = (targetEntity.resources[resourceType] || 0) + amount;
    }
  }

  /**
   * Calculate distance between nodes (simplified)
   * @private
   */
  _calculateNodeDistance(node1, node2) {
    // Simplified distance calculation - in real implementation this would use actual coordinates
    if (node1.id === node2.id) return 0;

    // Mock distance based on ID similarity or other factors
    // In a real implementation, this would use geographic coordinates
    return Math.abs(node1.id.length - node2.id.length) + 1;
  }

  /**
   * Calculate trade efficiency based on distance and conditions
   * @private
   */
  _calculateTradeEfficiency(distance, economicConditions) {
    const baseEfficiency = 0.8;
    const distancePenalty = Math.max(0, distance - 1) * 0.1; // 10% penalty per unit distance
    const conditionModifier = economicConditions.tradeEfficiency || 0;

    return Math.max(0.1, baseEfficiency - distancePenalty + conditionModifier);
  }

  /**
   * Calculate economic impact of a resource flow
   * @private
   */
  _calculateEconomicImpact(flow, actualTransferred, economicModifiers) {
    const baseValue = actualTransferred * this._getResourceValue(flow.resourceType);
    const efficiencyBonus = flow.efficiency * baseValue * 0.1;
    const modifierBonus = (economicModifiers.value || 0) * baseValue;

    return baseValue + efficiencyBonus + modifierBonus;
  }

  /**
   * Get base value for a resource type
   * @private
   */
  _getResourceValue(resourceType) {
    const values = {
      food: 1.0,
      water: 1.2,
      materials: 2.0,
      goods: 3.0,
      energy: 2.5,
      services: 1.5
    };
    return values[resourceType] || 1.0;
  }
}

export default ResourceFlowService;