// src/domain/services/EconomicCentralizationService.js

import { ValidationError } from '../../shared/types/ValueObjectTypes.js';

/**
 * Service for centralizing economic activities across settlements and nodes
 * Coordinates resource flows, manages inter-settlement trade, and optimizes economic efficiency
 */
class EconomicCentralizationService {
  /**
   * Create a new EconomicCentralizationService
   * @param {Object} dependencies - Service dependencies
   * @param {Object} dependencies.settlementRepository - Repository for accessing settlements
   * @param {Object} dependencies.nodeRepository - Repository for accessing nodes
   * @param {Object} dependencies.resourceFlowService - Service for managing resource flows
   * @param {Object} dependencies.economicProfileService - Service for economic calculations
   * @param {Object} dependencies.basicNeedsService - Service for basic needs calculations
   */
  constructor(dependencies = {}) {
    this.settlementRepository = dependencies.settlementRepository;
    this.nodeRepository = dependencies.nodeRepository;
    this.resourceFlowService = dependencies.resourceFlowService;
    this.economicProfileService = dependencies.economicProfileService;
    this.basicNeedsService = dependencies.basicNeedsService;
  }

  /**
   * Calculate and execute economic flows for all settlements in the system
   * @param {Object} context - Execution context
   * @param {Array} context.settlementIds - IDs of settlements to process (all if not specified)
   * @param {Object} context.economicConditions - Current economic conditions
   * @param {number} context.timeMultiplier - Time-based multiplier for flows
   * @param {boolean} context.dryRun - If true, calculate but don't execute flows
   * @returns {Object} Economic centralization results
   */
  async executeEconomicCentralization(context = {}) {
    const settlementIds = context.settlementIds || await this._getAllSettlementIds();
    const economicConditions = context.economicConditions || {};
    const timeMultiplier = context.timeMultiplier || 1.0;
    const dryRun = context.dryRun || false;

    const results = {
      settlementsProcessed: [],
      totalFlowsCalculated: 0,
      totalFlowsExecuted: 0,
      economicMetrics: {
        totalTradeVolume: 0,
        efficiencyGains: 0,
        unmetNeeds: 0,
        surplusValue: 0
      },
      errors: []
    };

    // Process each settlement
    for (const settlementId of settlementIds) {
      try {
        const settlementResult = await this._processSettlementEconomicFlows(
          settlementId,
          { economicConditions, timeMultiplier, dryRun }
        );

        results.settlementsProcessed.push(settlementResult);
        results.totalFlowsCalculated += settlementResult.flowsCalculated;
        results.totalFlowsExecuted += settlementResult.flowsExecuted;

        // Aggregate economic metrics
        Object.keys(results.economicMetrics).forEach(metric => {
          results.economicMetrics[metric] += settlementResult.metrics[metric] || 0;
        });

      } catch (error) {
        results.errors.push({
          settlementId,
          error: error.message,
          type: error.constructor.name
        });
      }
    }

    // Calculate system-wide optimizations
    if (!dryRun && results.totalFlowsExecuted > 0) {
      await this._applySystemOptimizations(results);
    }

    return results;
  }

  /**
   * Calculate resource needs for a settlement
   * @param {string} settlementId - ID of the settlement
   * @param {Object} context - Calculation context
   * @returns {Object} Resource needs analysis
   */
  async calculateSettlementResourceNeeds(settlementId, context = {}) {
    const settlement = await this.settlementRepository.getById(settlementId);
    if (!settlement) {
      throw new ValidationError('settlementId', settlementId, 'Settlement not found');
    }

    const currentResources = settlement.getResourceAmounts();
    const consumptionRates = settlement.getResourceConsumptionRates();
    const productionRates = settlement.getResourceProductionRates();

    const timeHorizon = context.timeHorizon || 30; // days
    const safetyBuffer = context.safetyBuffer || 1.2; // 20% safety buffer

    const needs = {};
    const surpluses = {};
    const deficits = {};

    // Calculate needs based on consumption and production
    Object.keys(consumptionRates).forEach(resourceType => {
      const consumption = consumptionRates[resourceType] * timeHorizon;
      const production = productionRates[resourceType] * timeHorizon;
      const current = currentResources[resourceType] || 0;

      const netNeed = (consumption * safetyBuffer) - production - current;

      if (netNeed > 0) {
        needs[resourceType] = netNeed;
        deficits[resourceType] = netNeed;
      } else if (netNeed < -10) { // Consider surplus if more than 10 units
        surpluses[resourceType] = -netNeed;
      }
    });

    // Calculate trade priorities
    const tradePriorities = this._calculateTradePriorities(needs, surpluses, settlement);

    return {
      settlementId,
      needs,
      surpluses,
      deficits,
      tradePriorities,
      timeHorizon,
      safetyBuffer,
      metrics: {
        totalDeficitValue: this._calculateResourceValue(deficits),
        totalSurplusValue: this._calculateResourceValue(surpluses),
        tradeEfficiency: this._calculateTradeEfficiency(settlement)
      }
    };
  }

  /**
   * Optimize inter-settlement trade flows
   * @param {Array} settlementIds - IDs of settlements to optimize trade between
   * @param {Object} context - Optimization context
   * @returns {Array} Optimized trade flows
   */
  async optimizeInterSettlementTrade(settlementIds, context = {}) {
    const settlements = await Promise.all(
      settlementIds.map(id => this.settlementRepository.getById(id))
    );

    const tradeFlows = [];
    const settlementNeeds = new Map();
    const settlementSurpluses = new Map();

    // Calculate needs and surpluses for all settlements
    for (const settlement of settlements) {
      const analysis = await this.calculateSettlementResourceNeeds(settlement.id, context);
      settlementNeeds.set(settlement.id, analysis.needs);
      settlementSurpluses.set(settlement.id, analysis.surpluses);
    }

    // Find optimal trade pairs
    for (let i = 0; i < settlements.length; i++) {
      for (let j = i + 1; j < settlements.length; j++) {
        const settlementA = settlements[i];
        const settlementB = settlements[j];

        const tradeFlowsAB = this._calculateOptimalTradeFlows(
          settlementA,
          settlementB,
          settlementNeeds.get(settlementA.id),
          settlementSurpluses.get(settlementB.id)
        );

        const tradeFlowsBA = this._calculateOptimalTradeFlows(
          settlementB,
          settlementA,
          settlementNeeds.get(settlementB.id),
          settlementSurpluses.get(settlementA.id)
        );

        tradeFlows.push(...tradeFlowsAB, ...tradeFlowsBA);
      }
    }

    // Sort by economic benefit
    tradeFlows.sort((a, b) => b.economicBenefit - a.economicBenefit);

    return tradeFlows;
  }

  /**
   * Process cascading economic effects from resource flows
   * @param {Array} executedFlows - Flows that were executed
   * @param {Object} context - Processing context
   * @returns {Object} Cascading effects analysis
   */
  async processCascadingEconomicEffects(executedFlows, context = {}) {
    const effects = {
      affectedSettlements: new Set(),
      resourcePriceChanges: {},
      economicMultipliers: {},
      secondaryFlows: [],
      longTermImpacts: {}
    };

    // Analyze direct effects
    for (const flowResult of executedFlows) {
      if (flowResult.success) {
        const flow = flowResult.flow;
        effects.affectedSettlements.add(flow.sourceNodeId);
        effects.affectedSettlements.add(flow.targetNodeId);

        // Calculate price impacts
        this._calculatePriceImpacts(flow, effects.resourcePriceChanges);

        // Calculate economic multipliers
        const multiplier = this._calculateEconomicMultiplier(flow);
        effects.economicMultipliers[flow.id] = multiplier;
      }
    }

    // Generate secondary flows based on effects
    if (context.generateSecondaryFlows) {
      effects.secondaryFlows = await this._generateSecondaryFlows(
        Array.from(effects.affectedSettlements),
        effects.resourcePriceChanges
      );
    }

    // Calculate long-term impacts
    effects.longTermImpacts = this._calculateLongTermImpacts(
      executedFlows,
      effects.resourcePriceChanges
    );

    return effects;
  }

  /**
   * Get economic dashboard data for monitoring
   * @param {Object} context - Dashboard context
   * @returns {Object} Economic dashboard data
   */
  async getEconomicDashboard(context = {}) {
    const settlementIds = context.settlementIds || await this._getAllSettlementIds();

    const dashboard = {
      systemOverview: {
        totalSettlements: settlementIds.length,
        totalTradeVolume: 0,
        averageEfficiency: 0,
        systemHealth: 'unknown'
      },
      settlementMetrics: [],
      resourceFlows: {
        activeFlows: [],
        pendingFlows: [],
        failedFlows: []
      },
      alerts: []
    };

    // Collect settlement metrics
    for (const settlementId of settlementIds) {
      try {
        const metrics = await this._getSettlementEconomicMetrics(settlementId);
        dashboard.settlementMetrics.push(metrics);

        dashboard.systemOverview.totalTradeVolume += metrics.tradeVolume;
        dashboard.systemOverview.averageEfficiency += metrics.efficiency;

      } catch (error) {
        dashboard.alerts.push({
          type: 'error',
          settlementId,
          message: `Failed to get metrics: ${error.message}`
        });
      }
    }

    // Calculate system averages
    if (dashboard.settlementMetrics.length > 0) {
      dashboard.systemOverview.averageEfficiency /= dashboard.settlementMetrics.length;
    }

    // Determine system health
    dashboard.systemOverview.systemHealth = this._calculateSystemHealth(dashboard);

    // Get recent flows
    dashboard.resourceFlows = await this._getRecentResourceFlows(context);

    return dashboard;
  }

  // Private helper methods

  async _processSettlementEconomicFlows(settlementId, context) {
    const { economicConditions, timeMultiplier, dryRun } = context;

    // Calculate resource flows for this settlement
    const flows = await this.resourceFlowService.calculateResourceFlows(settlementId, {
      timeMultiplier,
      economicConditions
    });

    const result = {
      settlementId,
      flowsCalculated: flows.length,
      flowsExecuted: 0,
      metrics: {
        totalTradeVolume: 0,
        efficiencyGains: 0,
        unmetNeeds: 0,
        surplusValue: 0
      }
    };

    // Execute flows if not dry run
    if (!dryRun) {
      for (const flow of flows) {
        try {
          const flowResult = await this.resourceFlowService.processResourceFlow(flow, {
            economicModifiers: economicConditions
          });

          if (flowResult.success) {
            result.flowsExecuted++;
            result.metrics.totalTradeVolume += flowResult.actualTransferred;

            // Calculate efficiency gains
            const efficiencyGain = flowResult.metrics.efficiency - 1.0;
            result.metrics.efficiencyGains += efficiencyGain > 0 ? efficiencyGain : 0;
          }
        } catch (error) {
          // Flow execution failed - this is expected for some flows
        }
      }
    }

    return result;
  }

  async _getAllSettlementIds() {
    // This would typically query the repository for all settlement IDs
    // For now, return empty array - settlements should be specified
    return [];
  }

  _calculateTradePriorities(needs, surpluses, settlement) {
    const priorities = {};

    Object.keys(needs).forEach(resourceType => {
      const needAmount = needs[resourceType];
      const priority = this._calculateResourcePriority(resourceType, needAmount, settlement);
      priorities[resourceType] = priority;
    });

    return priorities;
  }

  _calculateResourcePriority(resourceType, amount, settlement) {
    const basePriorities = {
      food: 1.0,
      water: 1.0,
      materials: 0.7,
      goods: 0.5,
      energy: 0.8,
      services: 0.6
    };

    const basePriority = basePriorities[resourceType] || 0.5;

    // Adjust based on settlement characteristics
    const population = settlement.getPopulation?.() || 100;
    const scaleFactor = Math.min(amount / population, 1.0);

    return basePriority * (1 + scaleFactor);
  }

  _calculateResourceValue(resourceAmounts) {
    return Object.entries(resourceAmounts).reduce((total, [type, amount]) => {
      const value = this._getResourceValue(type);
      return total + (amount * value);
    }, 0);
  }

  _calculateTradeEfficiency(settlement) {
    // Simplified trade efficiency calculation
    const infrastructure = settlement.getInfrastructureLevel?.() || 1.0;
    const marketAccess = settlement.getMarketAccess?.() || 1.0;

    return Math.min(infrastructure * marketAccess, 1.0);
  }

  _calculateOptimalTradeFlows(sourceSettlement, targetSettlement, sourceNeeds, targetSurpluses) {
    const flows = [];

    Object.keys(sourceNeeds).forEach(resourceType => {
      const neededAmount = sourceNeeds[resourceType];
      const availableAmount = targetSurpluses[resourceType];

      if (availableAmount > 0 && neededAmount > 0) {
        const tradeAmount = Math.min(neededAmount, availableAmount);

        // Calculate economic benefit
        const distance = this._calculateDistance(sourceSettlement, targetSettlement);
        const efficiency = Math.max(0.1, 1.0 - (distance * 0.1));
        const economicBenefit = tradeAmount * this._getResourceValue(resourceType) * efficiency;

        flows.push({
          sourceSettlementId: sourceSettlement.id,
          targetSettlementId: targetSettlement.id,
          resourceType,
          amount: tradeAmount,
          efficiency,
          economicBenefit,
          distance
        });
      }
    });

    return flows;
  }

  _calculateDistance(settlementA, settlementB) {
    // Simplified distance calculation
    // In a real implementation, this would use actual geographic coordinates
    if (settlementA.id === settlementB.id) return 0;

    // Mock distance based on ID differences
    const idDiff = Math.abs(parseInt(settlementA.id.slice(-1) || 0) - parseInt(settlementB.id.slice(-1) || 0));
    return Math.max(1, idDiff);
  }

  _calculatePriceImpacts(flow, priceChanges) {
    const resourceType = flow.resourceType;
    const amount = flow.actualTransferred || flow.effectiveAmount;
    const impact = amount * 0.01; // 1% price impact per 100 units

    if (!priceChanges[resourceType]) {
      priceChanges[resourceType] = 0;
    }

    if (flow.flowType === 'trade') {
      // Trade flows can stabilize or change prices
      priceChanges[resourceType] += flow.sourceNodeId !== flow.targetNodeId ? -impact : impact;
    }
  }

  _calculateEconomicMultiplier(flow) {
    const baseMultiplier = 1.0;
    const efficiencyBonus = flow.efficiency - 1.0;
    const scaleBonus = Math.log10(Math.max(flow.effectiveAmount, 1)) * 0.1;

    return baseMultiplier + efficiencyBonus + scaleBonus;
  }

  async _generateSecondaryFlows(affectedSettlementIds, priceChanges) {
    const secondaryFlows = [];

    // Generate flows based on price changes
    for (const settlementId of affectedSettlementIds) {
      const settlement = await this.settlementRepository.getById(settlementId);
      if (!settlement) continue;

      for (const [resourceType, priceChange] of Object.entries(priceChanges)) {
        if (Math.abs(priceChange) > 0.05) { // Significant price change
          // Generate secondary flow to balance prices
          const currentAmount = settlement.getResourceAmount?.(resourceType) || 0;
          const adjustmentAmount = Math.abs(priceChange) * 10; // Scale adjustment

          if (priceChange > 0 && currentAmount > adjustmentAmount) {
            // Price too high, create outflow
            secondaryFlows.push({
              settlementId,
              resourceType,
              amount: adjustmentAmount,
              direction: 'outflow',
              reason: 'price_stabilization'
            });
          } else if (priceChange < 0 && currentAmount < adjustmentAmount * 2) {
            // Price too low, create inflow opportunity
            secondaryFlows.push({
              settlementId,
              resourceType,
              amount: adjustmentAmount,
              direction: 'inflow_opportunity',
              reason: 'price_stabilization'
            });
          }
        }
      }
    }

    return secondaryFlows;
  }

  _calculateLongTermImpacts(executedFlows, priceChanges) {
    const impacts = {
      wealthDistribution: 0,
      economicGrowth: 0,
      resourceAvailability: 0,
      tradeNetworkStrength: 0
    };

    // Calculate impacts based on flow patterns
    const successfulFlows = executedFlows.filter(f => f.success);

    successfulFlows.forEach(flowResult => {
      const flow = flowResult.flow;
      const amount = flowResult.actualTransferred;

      // Economic growth from trade
      impacts.economicGrowth += amount * 0.1;

      // Trade network strength
      if (flow.sourceNodeId !== flow.targetNodeId) {
        impacts.tradeNetworkStrength += amount * 0.05;
      }
    });

    return impacts;
  }

  async _applySystemOptimizations(results) {
    // Apply system-wide optimizations based on results
    // This could include adjusting global economic parameters,
    // redistributing resources, or implementing economic policies

    const totalEfficiency = results.economicMetrics.efficiencyGains;
    const totalTradeVolume = results.economicMetrics.totalTradeVolume;

    // Example optimization: adjust economic conditions based on performance
    if (totalEfficiency > 100 && totalTradeVolume > 1000) {
      // High efficiency and volume - could increase trade incentives
    } else if (totalEfficiency < 50 || totalTradeVolume < 100) {
      // Low efficiency or volume - could implement trade barriers or incentives
    }
  }

  async _getSettlementEconomicMetrics(settlementId) {
    const settlement = await this.settlementRepository.getById(settlementId);

    return {
      settlementId,
      tradeVolume: settlement.getTradeVolume?.() || 0,
      efficiency: settlement.getEconomicEfficiency?.() || 0.8,
      resourceBalance: settlement.getResourceBalance?.() || 0,
      population: settlement.getPopulation?.() || 0,
      infrastructure: settlement.getInfrastructureLevel?.() || 1.0
    };
  }

  _calculateSystemHealth(dashboard) {
    const { averageEfficiency, totalTradeVolume } = dashboard.systemOverview;
    const alertCount = dashboard.alerts.length;

    if (averageEfficiency > 0.8 && totalTradeVolume > 1000 && alertCount === 0) {
      return 'excellent';
    } else if (averageEfficiency > 0.6 && totalTradeVolume > 500 && alertCount <= 2) {
      return 'good';
    } else if (averageEfficiency > 0.4 || totalTradeVolume > 100) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  async _getRecentResourceFlows(context) {
    // This would typically query for recent flows
    // For now, return empty structure
    return {
      activeFlows: [],
      pendingFlows: [],
      failedFlows: []
    };
  }

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

export default EconomicCentralizationService;