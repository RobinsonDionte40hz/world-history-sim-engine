// src/domain/services/BasicNeedsService.js

import BaseDomainService from './BaseDomainService.js';

/**
 * Service for calculating settlement need satisfaction levels and cascading effects
 * Handles food, water, shelter, goods, and services satisfaction calculations
 */
class BasicNeedsService extends BaseDomainService {
  
  // Need satisfaction thresholds for cascading effects
  static CASCADING_THRESHOLDS = {
    FOOD_THRESHOLD: 0.8,
    WATER_THRESHOLD: 0.9,
    SHELTER_THRESHOLD: 0.6
  };

  // Multipliers applied when basic needs are unmet
  static CASCADING_MULTIPLIERS = {
    FOOD_MULTIPLIER: 0.7,
    WATER_MULTIPLIER: 0.6,
    SHELTER_MULTIPLIER: 0.8
  };

  // Base consumption rates per person
  static CONSUMPTION_RATES = {
    FOOD_PER_PERSON: 2.0,      // Food units per person per turn
    WATER_PER_PERSON: 3.0,     // Water units per person per turn
    GOODS_PER_PERSON: 1.0,     // Goods units per person per turn
    SERVICES_PER_PERSON: 0.5   // Service capacity per person per turn
  };

  // Building efficiency factors
  static BUILDING_EFFICIENCY = {
    FARM: { food: 10, water: -2 },           // Farms produce food but need water
    WELL: { water: 15 },                     // Wells provide water
    AQUEDUCT: { water: 50 },                 // Aqueducts provide lots of water
    HOUSE: { shelter: 4 },                   // Houses provide shelter for 4 people
    WORKSHOP: { goods: 8 },                  // Workshops produce goods
    MARKET: { goods: 5, services: 2 },       // Markets help with goods and services
    TEMPLE: { services: 6 },                 // Temples provide services
    SCHOOL: { services: 4 },                 // Schools provide services
    HEALER: { services: 3 }                  // Healers provide services
  };

  // Economic profile constants for NPC tiers
  static ECONOMIC_PROFILES = {
    LEADER: {
      productionCapacity: 0.1, // 10% of settlement production
      consumptionMultiplier: 2.0, // Consumes 2x basic needs
      wealthAccumulation: 0.3, // Accumulates wealth 30% faster
      economicInfluence: 0.8, // High influence on settlement economy
      investmentCapacity: 5.0 // Can make large investments
    },
    SPECIALIST: {
      productionCapacity: 0.4, // 40% of settlement production
      consumptionMultiplier: 1.3, // Consumes 1.3x basic needs
      wealthAccumulation: 0.15, // Accumulates wealth 15% faster
      economicInfluence: 0.4, // Moderate influence on settlement economy
      investmentCapacity: 2.0 // Can make moderate investments
    },
    CITIZEN: {
      productionCapacity: 0.5, // 50% of settlement production
      consumptionMultiplier: 1.0, // Consumes basic needs
      wealthAccumulation: 0.05, // Accumulates wealth 5% faster
      economicInfluence: 0.1, // Low influence on settlement economy
      investmentCapacity: 0.5 // Limited investment capacity
    }
  };

  // Economic feedback loop multipliers
  static ECONOMIC_FEEDBACK = {
    PROSPERITY_BOOST: 1.2, // Prosperity increases consciousness by 20%
    POVERTY_PENALTY: 0.8, // Poverty decreases consciousness by 20%
    INVESTMENT_MULTIPLIER: 1.5, // Successful investments boost economic activity
    CRISIS_MULTIPLIER: 0.7 // Economic crises reduce economic activity
  };

  /**
   * Calculate satisfaction levels for all basic needs
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects to apply
   * @param {Object} resourceFlows - Optional resource flows from production nodes
   * @returns {Object} Need satisfaction analysis
   */
  calculateSatisfactionLevel(settlement, investmentEffects = null, resourceFlows = null) {
    try {
      this._validateSettlement(settlement);

      // Check if this node type supports economic calculations
      if (!this._hasEconomicCapabilities(settlement)) {
        return this._getNonEconomicNodeResult(settlement);
      }

      const needs = {
        food: this.calculateFoodSatisfaction(settlement, investmentEffects, resourceFlows),
        water: this.calculateWaterSatisfaction(settlement, investmentEffects, resourceFlows),
        shelter: this.calculateShelterSatisfaction(settlement, investmentEffects),
        goods: this.calculateGoodsSatisfaction(settlement, investmentEffects),
        services: this.calculateServicesSatisfaction(settlement, investmentEffects)
      };

      const cascadingEffects = this._calculateCascadingEffects(needs);
      const productionNodeEffects = this._calculateProductionNodeFailureEffects(settlement, resourceFlows);
      const overall = this._calculateOverallSatisfaction(needs, cascadingEffects, productionNodeEffects);
      const consequences = this._generateConsequences(needs, settlement, investmentEffects, productionNodeEffects);

      return {
        needs: this._clampNeedValues(needs),
        overall: BaseDomainService.clamp(overall, 0.0, 1.0),
        consequences: consequences,
        cascadingEffects: cascadingEffects,
        productionNodeEffects: productionNodeEffects,
        investmentEffects: investmentEffects || {},
        resourceFlows: resourceFlows || [],
        economicCapabilities: true
      };
    } catch (error) {
      console.error('Need satisfaction calculation failed:', error);
      return this._getDefaultSatisfactionResult();
    }
  }

  /**
   * Check if a node has economic capabilities for need satisfaction calculations
   * @param {Object} node - Node to check
   * @returns {boolean} True if node supports economic calculations
   * @private
   */
  _hasEconomicCapabilities(node) {
    // Check if node has typeProfile with economic capabilities
    if (node.typeProfile && node.typeProfile.capabilities) {
      return node.typeProfile.capabilities.hasCapability('economy');
    }

    // Fallback: check node type directly (settlement nodes have economic capabilities)
    return node.type === 'settlement';
  }

  /**
   * Get result for nodes that don't support economic calculations
   * @param {Object} node - Node that doesn't support economics
   * @returns {Object} Default result for non-economic nodes
   * @private
   */
  _getNonEconomicNodeResult(node) {
    return {
      needs: {
        food: 1.0, // No needs for non-economic nodes
        water: 1.0,
        shelter: 1.0,
        goods: 1.0,
        services: 1.0
      },
      overall: 1.0,
      consequences: [],
      cascadingEffects: {
        multiplier: 1.0,
        affectedNeeds: [],
        secondaryEffects: []
      },
      productionNodeEffects: {
        failedNodes: [],
        resourceShortages: [],
        cascadingImpact: 0.0
      },
      investmentEffects: {},
      resourceFlows: [],
      nodeType: node.type || 'unknown',
      economicCapabilities: false
    };
  }

  /**
   * Calculate cascading effects where unmet basic needs amplify other problems
   * @param {Object} needs - Individual need satisfaction levels
   * @returns {Object} Cascading effects information
   */
  _calculateCascadingEffects(needs) {
    let multiplier = 1.0;
    const affectedNeeds = [];

    // Critical needs create cascading problems for secondary needs
    if (needs.food < BasicNeedsService.CASCADING_THRESHOLDS.FOOD_THRESHOLD) {
      multiplier *= BasicNeedsService.CASCADING_MULTIPLIERS.FOOD_MULTIPLIER;
      affectedNeeds.push('food');
    }
    if (needs.water < BasicNeedsService.CASCADING_THRESHOLDS.WATER_THRESHOLD) {
      multiplier *= BasicNeedsService.CASCADING_MULTIPLIERS.WATER_MULTIPLIER;
      affectedNeeds.push('water');
    }
    if (needs.shelter < BasicNeedsService.CASCADING_THRESHOLDS.SHELTER_THRESHOLD) {
      multiplier *= BasicNeedsService.CASCADING_MULTIPLIERS.SHELTER_MULTIPLIER;
      affectedNeeds.push('shelter');
    }

    // Store original values for historical tracking
    const originalGoods = needs.goods;
    const originalServices = needs.services;
    
    // Apply multiplier to secondary needs (goods and services)
    needs.goods *= multiplier;
    needs.services *= multiplier;

    // Clamp secondary needs to valid range
    needs.goods = BaseDomainService.clamp(needs.goods, 0.0, 1.0);
    needs.services = BaseDomainService.clamp(needs.services, 0.0, 1.0);

    // Track which secondary needs were affected
    if (originalGoods !== needs.goods) {
      affectedNeeds.push('goods');
    }
    if (originalServices !== needs.services) {
      affectedNeeds.push('services');
    }

    return {
      multiplier,
      affectedNeeds,
      hasEffects: affectedNeeds.length > 0,
      originalValues: {
        goods: originalGoods,
        services: originalServices
      }
    };
  }

  /**
   * Calculate cascading effects from production node failures
   * @param {Object} settlement - Settlement to analyze
   * @param {Array} resourceFlows - Resource flows from production nodes
   * @returns {Object} Production node failure effects
   * @private
   */
  _calculateProductionNodeFailureEffects(settlement, resourceFlows = null) {
    const effects = {
      failedNodes: [],
      resourceShortages: [],
      cascadingImpact: 0.0
    };

    if (!resourceFlows || !Array.isArray(resourceFlows)) {
      return effects;
    }

    let totalImpact = 0.0;
    const resourceShortages = new Map();

    // Analyze each resource flow for failures
    resourceFlows.forEach(flow => {
      if (flow.status === 'failed' || flow.status === 'partial') {
        effects.failedNodes.push({
          nodeId: flow.sourceNodeId,
          resourceType: flow.resourceType,
          expectedAmount: flow.amount,
          actualAmount: flow.status === 'failed' ? 0 : flow.amount * 0.5,
          failureReason: flow.failureReason || 'unknown'
        });

        // Track resource shortages
        const currentShortage = resourceShortages.get(flow.resourceType) || 0;
        const shortageAmount = flow.status === 'failed' ? flow.amount : flow.amount * 0.5;
        resourceShortages.set(flow.resourceType, currentShortage + shortageAmount);

        // Calculate impact based on resource type importance
        const impactMultiplier = this._getResourceImpactMultiplier(flow.resourceType);
        totalImpact += (shortageAmount / this._getExpectedResourceAmount(settlement, flow.resourceType)) * impactMultiplier;
      }
    });

    // Convert resource shortages map to array
    resourceShortages.forEach((amount, resourceType) => {
      effects.resourceShortages.push({
        resourceType,
        shortageAmount: amount,
        severity: this._calculateShortageSeverity(amount, settlement, resourceType)
      });
    });

    effects.cascadingImpact = BaseDomainService.clamp(totalImpact, 0.0, 1.0);

    return effects;
  }

  /**
   * Get impact multiplier for different resource types
   * @param {string} resourceType - Type of resource
   * @returns {number} Impact multiplier
   * @private
   */
  _getResourceImpactMultiplier(resourceType) {
    const multipliers = {
      'food': 1.5,    // Food shortages have highest impact
      'water': 1.4,   // Water is critical
      'materials': 0.8, // Materials less critical
      'goods': 0.6,   // Goods can be substituted
      'services': 0.5  // Services have least immediate impact
    };
    return multipliers[resourceType] || 0.7;
  }

  /**
   * Get expected resource amount for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {string} resourceType - Type of resource
   * @returns {number} Expected amount
   * @private
   */
  _getExpectedResourceAmount(settlement, resourceType) {
    const population = settlement.population?.total || 100;
    const baseRates = BasicNeedsService.CONSUMPTION_RATES;

    switch (resourceType) {
      case 'food': return population * baseRates.FOOD_PER_PERSON;
      case 'water': return population * baseRates.WATER_PER_PERSON;
      case 'goods': return population * baseRates.GOODS_PER_PERSON;
      case 'services': return population * baseRates.SERVICES_PER_PERSON;
      default: return population * 0.5; // Default fallback
    }
  }

  /**
   * Calculate severity of a resource shortage
   * @param {number} shortageAmount - Amount of shortage
   * @param {Object} settlement - Settlement affected
   * @param {string} resourceType - Type of resource
   * @returns {string} Severity level
   * @private
   */
  _calculateShortageSeverity(shortageAmount, settlement, resourceType) {
    const expectedAmount = this._getExpectedResourceAmount(settlement, resourceType);
    const shortageRatio = shortageAmount / expectedAmount;

    if (shortageRatio >= 0.8) return 'critical';
    if (shortageRatio >= 0.6) return 'severe';
    if (shortageRatio >= 0.4) return 'moderate';
    if (shortageRatio >= 0.2) return 'mild';
    return 'minimal';
  }

  /**
   * Get severity multiplier for consequence calculations
   * @param {string} severity - Severity level
   * @returns {number} Severity multiplier
   * @private
   */
  _getSeverityMultiplier(severity) {
    const multipliers = {
      'critical': 1.0,
      'severe': 0.8,
      'moderate': 0.6,
      'mild': 0.4,
      'minimal': 0.2
    };
    return multipliers[severity] || 0.5;
  }

  /**
   * Calculate overall satisfaction from individual needs
   * @param {Object} needs - Individual need satisfaction levels
   * @param {Object} cascadingEffects - Cascading effects information
   * @returns {number} Overall satisfaction level
   */
  _calculateOverallSatisfaction(needs, cascadingEffects, productionNodeEffects = null) {
    let baseSatisfaction = (needs.food + needs.water + needs.shelter + needs.goods + needs.services) / 5;

    // Apply production node failure impact
    if (productionNodeEffects && productionNodeEffects.cascadingImpact > 0) {
      baseSatisfaction *= (1.0 - productionNodeEffects.cascadingImpact);
    }

    return BaseDomainService.clamp(baseSatisfaction, 0.0, 1.0);
  }

  /**
   * Calculate food satisfaction based on settlement resources and infrastructure
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects to apply
   * @param {Array} resourceFlows - Optional resource flows from production nodes
   * @returns {number} Food satisfaction level (0.0 - 1.0)
   */
  calculateFoodSatisfaction(settlement, investmentEffects = null, resourceFlows = null) {
    const population = settlement.population.total;
    if (population === 0) return 1.0; // No people, no needs

    let foodProduction = this._calculateFoodProduction(settlement, investmentEffects);
    const foodStorage = this._calculateFoodStorage(settlement, investmentEffects);
    const tradeAccess = this._calculateFoodTradeAccess(settlement, investmentEffects);

    // Add food from successful resource flows
    if (resourceFlows && Array.isArray(resourceFlows)) {
      const foodFlows = resourceFlows.filter(flow =>
        flow.resourceType === 'food' &&
        (flow.status === 'completed' || flow.status === 'partial')
      );
      const flowFoodAmount = foodFlows.reduce((total, flow) =>
        total + (flow.status === 'completed' ? flow.amount : flow.amount * 0.5), 0
      );
      foodProduction += flowFoodAmount;
    }

    const totalFoodAvailability = foodProduction + foodStorage + tradeAccess;
    const foodDemand = population * BasicNeedsService.CONSUMPTION_RATES.FOOD_PER_PERSON;

    const baseSatisfaction = Math.min(1.0, totalFoodAvailability / foodDemand);
    
    // Apply investment effects
    const investmentMultiplier = this._getInvestmentMultiplier(investmentEffects, 'food');
    return Math.min(1.0, baseSatisfaction * investmentMultiplier);
  }

  /**
   * Calculate water satisfaction based on water sources and infrastructure
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects to apply
   * @param {Array} resourceFlows - Optional resource flows from production nodes
   * @returns {number} Water satisfaction level (0.0 - 1.0)
   */
  calculateWaterSatisfaction(settlement, investmentEffects = null, resourceFlows = null) {
    const population = settlement.population.total;
    if (population === 0) return 1.0; // No people, no needs

    let waterSources = this._calculateWaterSources(settlement, investmentEffects);
    const waterInfrastructure = this._calculateWaterInfrastructure(settlement, investmentEffects);
    const waterStorage = this._calculateWaterStorage(settlement, investmentEffects);

    // Add water from successful resource flows
    if (resourceFlows && Array.isArray(resourceFlows)) {
      const waterFlows = resourceFlows.filter(flow =>
        flow.resourceType === 'water' &&
        (flow.status === 'completed' || flow.status === 'partial')
      );
      const flowWaterAmount = waterFlows.reduce((total, flow) =>
        total + (flow.status === 'completed' ? flow.amount : flow.amount * 0.5), 0
      );
      waterSources += flowWaterAmount;
    }

    const totalWaterAvailability = waterSources + waterInfrastructure + waterStorage;
    const waterDemand = population * BasicNeedsService.CONSUMPTION_RATES.WATER_PER_PERSON;

    const baseSatisfaction = Math.min(1.0, totalWaterAvailability / waterDemand);
    
    // Apply investment effects
    const investmentMultiplier = this._getInvestmentMultiplier(investmentEffects, 'water');
    return Math.min(1.0, baseSatisfaction * investmentMultiplier);
  }

  /**
   * Calculate shelter satisfaction based on housing and population density
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects to apply
   * @returns {number} Shelter satisfaction level (0.0 - 1.0)
   */
  calculateShelterSatisfaction(settlement, investmentEffects = null) {
    const population = settlement.population.total;
    if (population === 0) return 1.0; // No people, no needs

    const housingCapacity = this._calculateHousingCapacity(settlement, investmentEffects);
    const housingQuality = this._calculateHousingQuality(settlement, investmentEffects);

    const basicShelterRatio = Math.min(1.0, housingCapacity / population);
    const qualityModifier = housingQuality;
    
    const baseSatisfaction = basicShelterRatio * qualityModifier;

    // Apply investment effects
    const investmentMultiplier = this._getInvestmentMultiplier(investmentEffects, 'shelter');
    return Math.min(1.0, baseSatisfaction * investmentMultiplier);
  }

  /**
   * Calculate goods satisfaction based on production and trade
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects to apply
   * @returns {number} Goods satisfaction level (0.0 - 1.0)
   */
  calculateGoodsSatisfaction(settlement, investmentEffects = null) {
    const population = settlement.population.total;
    if (population === 0) return 1.0; // No people, no needs

    const localProduction = this._calculateGoodsProduction(settlement, investmentEffects);
    const tradeAccess = this._calculateGoodsTradeAccess(settlement, investmentEffects);
    const marketEfficiency = this._calculateMarketEfficiency(settlement, investmentEffects);

    const totalGoodsAvailability = (localProduction + tradeAccess) * marketEfficiency;
    const goodsDemand = population * BasicNeedsService.CONSUMPTION_RATES.GOODS_PER_PERSON;

    const baseSatisfaction = Math.min(1.0, totalGoodsAvailability / goodsDemand);
    
    // Apply investment effects
    const investmentMultiplier = this._getInvestmentMultiplier(investmentEffects, 'goods');
    return Math.min(1.0, baseSatisfaction * investmentMultiplier);
  }

  /**
   * Calculate services satisfaction based on available services and infrastructure
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects to apply
   * @returns {number} Services satisfaction level (0.0 - 1.0)
   */
  calculateServicesSatisfaction(settlement, investmentEffects = null) {
    const population = settlement.population.total;
    if (population === 0) return 1.0; // No people, no needs

    const healthcareCapacity = this._calculateHealthcareCapacity(settlement, investmentEffects);
    const educationCapacity = this._calculateEducationCapacity(settlement, investmentEffects);
    const religiousCapacity = this._calculateReligiousCapacity(settlement, investmentEffects);
    const administrativeCapacity = this._calculateAdministrativeCapacity(settlement, investmentEffects);

    const totalServiceCapacity = healthcareCapacity + educationCapacity + 
                                religiousCapacity + administrativeCapacity;
    const serviceDemand = population * BasicNeedsService.CONSUMPTION_RATES.SERVICES_PER_PERSON;

    const baseSatisfaction = Math.min(1.0, totalServiceCapacity / serviceDemand);
    
    // Apply investment effects
    const investmentMultiplier = this._getInvestmentMultiplier(investmentEffects, 'services');
    return Math.min(1.0, baseSatisfaction * investmentMultiplier);
  }

  /**
   * Calculate NPC economic profile and its impact on settlement economy
   * @param {Object} character - Character to analyze
   * @param {Object} settlement - Settlement context
   * @param {string} npcTier - NPC tier (leader, specialist, citizen)
   * @returns {Object} Economic profile analysis
   */
  calculateNpcEconomicProfile(character, settlement, npcTier = 'citizen') {
    try {
      const profile = BasicNeedsService.ECONOMIC_PROFILES[npcTier.toUpperCase()] || BasicNeedsService.ECONOMIC_PROFILES.CITIZEN;
      const economicState = this._calculateEconomicState(settlement);

      // Calculate production contribution
      const productionContribution = this._calculateProductionContribution(character, profile, settlement);

      // Calculate consumption needs
      const consumptionNeeds = this._calculateConsumptionNeeds(character, profile, settlement);

      // Calculate wealth dynamics
      const wealthDynamics = this._calculateWealthDynamics(character, profile, economicState);

      // Calculate economic influence
      const economicInfluence = this._calculateEconomicInfluence(character, profile, settlement);

      // Calculate feedback loops
      const feedbackLoops = this._calculateEconomicFeedbackLoops(character, profile, economicState, settlement);

      return {
        profile: profile,
        productionContribution: productionContribution,
        consumptionNeeds: consumptionNeeds,
        wealthDynamics: wealthDynamics,
        economicInfluence: economicInfluence,
        feedbackLoops: feedbackLoops,
        economicState: economicState,
        tier: npcTier
      };

    } catch (error) {
      console.error('NPC economic profile calculation failed:', error);
      return this._getDefaultEconomicProfile();
    }
  }

  /**
   * Calculate economic state of the settlement
   * @param {Object} settlement - Settlement to analyze
   * @returns {Object} Economic state analysis
   * @private
   */
  _calculateEconomicState(settlement) {
    const economy = settlement.economy || {};

    // Calculate production vs consumption ratio
    const totalProduction = this._calculateSettlementProduction(settlement);
    const totalConsumption = this._calculateSettlementConsumption(settlement);
    const productionRatio = totalConsumption > 0 ? totalProduction / totalConsumption : 1.0;

    // Calculate wealth distribution
    const totalWealth = settlement.population?.total ? (economy.totalWealth || 0) : 0;
    const averageWealth = settlement.population?.total ? totalWealth / settlement.population.total : 0;

    // Calculate trade balance
    const tradeBalance = this._calculateTradeBalance(settlement);

    // Calculate economic health score (0-1)
    const economicHealth = this._calculateEconomicHealth(productionRatio, averageWealth, tradeBalance);

    return {
      productionRatio: productionRatio,
      totalProduction: totalProduction,
      totalConsumption: totalConsumption,
      averageWealth: averageWealth,
      tradeBalance: tradeBalance,
      economicHealth: economicHealth,
      prosperityLevel: this._getProsperityLevel(economicHealth)
    };
  }

  /**
   * Calculate production contribution of an NPC
   * @param {Object} character - Character to analyze
   * @param {Object} profile - Economic profile
   * @param {Object} settlement - Settlement context
   * @returns {Object} Production contribution analysis
   * @private
   */
  _calculateProductionContribution(character, profile, settlement) {
    let baseProduction = 0;
    const profession = character.profession || 'unemployed';

    // Base production by profession
    const professionProduction = {
      'farmer': 8,
      'craftsman': 6,
      'merchant': 4,
      'healer': 2,
      'guard': 1,
      'priest': 1,
      'teacher': 1,
      'unemployed': 0
    };

    baseProduction = professionProduction[profession] || 0;

    // Apply skill modifiers
    if (character.skills) {
      const relevantSkills = ['crafting', 'farming', 'trading', 'healing'];
      const skillBonus = relevantSkills.reduce((bonus, skill) => {
        return bonus + (character.skills[skill] || 0) * 0.1;
      }, 0);
      baseProduction *= (1 + skillBonus);
    }

    // Apply profile production capacity
    const adjustedProduction = baseProduction * profile.productionCapacity;

    // Calculate efficiency based on tools and infrastructure
    const efficiency = this._calculateProductionEfficiency(character, settlement);

    return {
      baseProduction: baseProduction,
      adjustedProduction: adjustedProduction,
      finalProduction: adjustedProduction * efficiency,
      efficiency: efficiency,
      profession: profession,
      skillContribution: character.skills ? Object.keys(character.skills).length * 0.05 : 0
    };
  }

  /**
   * Calculate consumption needs of an NPC
   * @param {Object} character - Character to analyze
   * @param {Object} profile - Economic profile
   * @param {Object} settlement - Settlement context
   * @returns {Object} Consumption needs analysis
   * @private
   */
  _calculateConsumptionNeeds(character, profile, settlement) {
    // Base consumption rates
    const baseConsumption = {
      food: 2.0,
      water: 3.0,
      goods: 1.0,
      services: 0.5
    };

    // Apply profile consumption multiplier
    const adjustedConsumption = {};
    Object.keys(baseConsumption).forEach(resource => {
      adjustedConsumption[resource] = baseConsumption[resource] * profile.consumptionMultiplier;
    });

    // Apply lifestyle modifiers
    const lifestyleModifier = this._calculateLifestyleModifier(character, settlement);
    Object.keys(adjustedConsumption).forEach(resource => {
      adjustedConsumption[resource] *= lifestyleModifier;
    });

    // Calculate total consumption cost
    const consumptionCost = this._calculateConsumptionCost(adjustedConsumption, settlement);

    return {
      baseConsumption: baseConsumption,
      adjustedConsumption: adjustedConsumption,
      lifestyleModifier: lifestyleModifier,
      totalCost: consumptionCost,
      affordability: this._calculateAffordability(character, consumptionCost)
    };
  }

  /**
   * Calculate wealth dynamics for an NPC
   * @param {Object} character - Character to analyze
   * @param {Object} profile - Economic profile
   * @param {Object} economicState - Economic state of settlement
   * @returns {Object} Wealth dynamics analysis
   * @private
   */
  _calculateWealthDynamics(character, profile, economicState) {
    const currentWealth = character.wealth || 0;
    const income = this._calculateIncome(character, profile, economicState);
    const expenses = this._calculateExpenses(character, profile, economicState);

    // Calculate net wealth change
    const netChange = income - expenses;

    // Apply wealth accumulation modifier
    const accumulationRate = profile.wealthAccumulation;
    const adjustedChange = netChange * (1 + accumulationRate);

    // Calculate wealth trend
    const wealthTrend = this._calculateWealthTrend(currentWealth, adjustedChange, economicState);

    return {
      currentWealth: currentWealth,
      income: income,
      expenses: expenses,
      netChange: netChange,
      adjustedChange: adjustedChange,
      accumulationRate: accumulationRate,
      wealthTrend: wealthTrend,
      projectedWealth: Math.max(0, currentWealth + adjustedChange)
    };
  }

  /**
   * Calculate economic influence of an NPC
   * @param {Object} character - Character to analyze
   * @param {Object} profile - Economic profile
   * @param {Object} settlement - Settlement context
   * @returns {Object} Economic influence analysis
   * @private
   */
  _calculateEconomicInfluence(character, profile, settlement) {
    const baseInfluence = profile.economicInfluence;

    // Leadership bonus
    const leadershipBonus = character.role === 'leader' ? 0.3 : 0;

    // Wealth influence
    const wealth = character.wealth || 0;
    const wealthInfluence = Math.min(0.2, wealth / 1000); // Cap at 20% for very wealthy

    // Reputation influence
    const reputationInfluence = character.reputation ? Math.min(0.1, character.reputation / 100) : 0;

    // Network influence (relationships)
    const networkInfluence = character.relationships ?
      Math.min(0.15, Object.keys(character.relationships).length * 0.02) : 0;

    const totalInfluence = baseInfluence + leadershipBonus + wealthInfluence +
                          reputationInfluence + networkInfluence;

    return {
      baseInfluence: baseInfluence,
      leadershipBonus: leadershipBonus,
      wealthInfluence: wealthInfluence,
      reputationInfluence: reputationInfluence,
      networkInfluence: networkInfluence,
      totalInfluence: Math.min(1.0, totalInfluence),
      influenceFactors: {
        canInfluenceTrade: totalInfluence > 0.3,
        canInfluencePrices: totalInfluence > 0.5,
        canInfluencePolicy: totalInfluence > 0.7,
        economicDecisions: totalInfluence > 0.4
      }
    };
  }

  /**
   * Calculate economic feedback loops affecting consciousness
   * @param {Object} character - Character to analyze
   * @param {Object} profile - Economic profile
   * @param {Object} economicState - Economic state
   * @param {Object} settlement - Settlement context
   * @returns {Object} Feedback loops analysis
   * @private
   */
  _calculateEconomicFeedbackLoops(character, profile, economicState, settlement) {
    const feedbackLoops = {
      consciousnessModifiers: {},
      behaviorModifiers: {},
      settlementEffects: {},
      cascadingImpacts: []
    };

    // Prosperity feedback loop
    if (economicState.economicHealth > 0.7) {
      feedbackLoops.consciousnessModifiers.prosperity = {
        frequency: BasicNeedsService.ECONOMIC_FEEDBACK.PROSPERITY_BOOST,
        coherence: 1.1,
        mood: 15,
        description: 'Economic prosperity boosts consciousness and mood'
      };
    }

    // Poverty feedback loop
    if (economicState.economicHealth < 0.3) {
      feedbackLoops.consciousnessModifiers.poverty = {
        frequency: BasicNeedsService.ECONOMIC_FEEDBACK.POVERTY_PENALTY,
        coherence: 0.9,
        mood: -20,
        description: 'Economic hardship reduces consciousness and increases stress'
      };
    }

    // Investment success feedback
    if (character.investmentHistory) {
      const successfulInvestments = character.investmentHistory.filter(inv => inv.success).length;
      const totalInvestments = character.investmentHistory.length;

      if (totalInvestments > 0) {
        const successRate = successfulInvestments / totalInvestments;
        if (successRate > 0.7) {
          feedbackLoops.behaviorModifiers.investment = {
            confidence: 1.3,
            riskTolerance: 1.2,
            description: 'Successful investment history increases economic confidence'
          };
        }
      }
    }

    // Settlement-level feedback
    feedbackLoops.settlementEffects = this._calculateSettlementFeedbackEffects(character, profile, economicState);

    // Cascading impacts
    feedbackLoops.cascadingImpacts = this._calculateCascadingEconomicImpacts(character, profile, economicState, settlement);

    return feedbackLoops;
  }

  /**
   * Get economic interaction types for different NPC tiers
   * @param {string} npcTier - NPC tier (leader, specialist, citizen)
   * @param {Object} character - Character context
   * @param {Object} settlement - Settlement context
   * @returns {Array} Array of economic interaction types
   */
  getEconomicInteractions(npcTier = 'citizen', character = {}, settlement = {}) {
    const interactions = [];

    switch (npcTier.toLowerCase()) {
      case 'leader':
        interactions.push(
          {
            id: 'manage_economy',
            name: 'Manage Economy',
            type: 'manage_economy',
            description: 'Oversee settlement economic policies and investments',
            requirements: { energy: 20, wealth: 100 },
            effects: { economicInfluence: 0.8, energy: -15, reputation: 5 },
            tier: 'leader',
            economicImpact: 'strategic'
          },
          {
            id: 'plan_trade',
            name: 'Plan Trade Routes',
            type: 'plan_trade',
            description: 'Establish new trade relationships and routes',
            requirements: { energy: 15, wealth: 50 },
            effects: { tradeRoutes: 1, energy: -10, wealth: 20 },
            tier: 'leader',
            economicImpact: 'expansion'
          }
        );
        break;

      case 'specialist':
        interactions.push(
          {
            id: 'operate_workshop',
            name: 'Operate Workshop',
            type: 'operate_workshop',
            description: 'Run specialized production facility',
            requirements: { energy: 18, wealth: 20 },
            effects: { production: 15, energy: -12, wealth: 8, experience: 3 },
            tier: 'specialist',
            economicImpact: 'production'
          },
          {
            id: 'negotiate_contracts',
            name: 'Negotiate Contracts',
            type: 'negotiate_contracts',
            description: 'Negotiate business deals and contracts',
            requirements: { energy: 12, charisma: 12 },
            effects: { contracts: 1, energy: -8, wealth: 15, reputation: 2 },
            tier: 'specialist',
            economicImpact: 'trade'
          }
        );
        break;

      case 'citizen':
      default:
        interactions.push(
          {
            id: 'work_job',
            name: 'Work Job',
            type: 'work_job',
            description: 'Perform daily work for income',
            requirements: { energy: 15 },
            effects: { wealth: 5, energy: -10, experience: 1 },
            tier: 'citizen',
            economicImpact: 'labor'
          },
          {
            id: 'buy_goods',
            name: 'Buy Goods',
            type: 'buy_goods',
            description: 'Purchase goods and supplies',
            requirements: { wealth: 10 },
            effects: { wealth: -8, satisfaction: 5, goods: 2 },
            tier: 'citizen',
            economicImpact: 'consumption'
          }
        );
        break;
    }

    // Filter interactions based on character capabilities
    return interactions.filter(interaction => {
      // Check energy requirements
      if (interaction.requirements.energy && character.energy < interaction.requirements.energy) {
        return false;
      }

      // Check wealth requirements
      if (interaction.requirements.wealth && (character.wealth || 0) < interaction.requirements.wealth) {
        return false;
      }

      // Check attribute requirements
      if (interaction.requirements.charisma && (character.attributes?.charisma || 0) < interaction.requirements.charisma) {
        return false;
      }

      return true;
    });
  }

  // Private helper methods for economic calculations

  /**
   * Calculate settlement production
   * @param {Object} settlement - Settlement to analyze
   * @returns {number} Total production
   * @private
   */
  _calculateSettlementProduction(settlement) {
    let production = 0;

    // Production from buildings
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        const efficiency = BasicNeedsService.BUILDING_EFFICIENCY[building.type.toUpperCase()];
        if (efficiency) {
          Object.values(efficiency).forEach(value => {
            if (typeof value === 'number' && value > 0) {
              production += value * (building.level || 1);
            }
          });
        }
      });
    }

    // Production from assigned characters
    if (settlement.assignedCharacters) {
      settlement.assignedCharacters.forEach(character => {
        if (character.profession) {
          const professionProduction = {
            'farmer': 8, 'craftsman': 6, 'merchant': 4,
            'healer': 2, 'guard': 1, 'priest': 1, 'teacher': 1
          };
          production += professionProduction[character.profession] || 0;
        }
      });
    }

    return production;
  }

  /**
   * Calculate settlement consumption
   * @param {Object} settlement - Settlement to analyze
   * @returns {number} Total consumption
   * @private
   */
  _calculateSettlementConsumption(settlement) {
    const population = settlement.population?.total || 100;
    const baseConsumption = population * (2.0 + 3.0 + 1.0 + 0.5); // food + water + goods + services

    // Apply consumption modifiers based on settlement wealth
    const wealthModifier = settlement.economy?.totalWealth ?
      Math.min(1.5, Math.max(0.8, settlement.economy.totalWealth / (population * 50))) : 1.0;

    return baseConsumption * wealthModifier;
  }

  /**
   * Calculate trade balance
   * @param {Object} settlement - Settlement to analyze
   * @returns {number} Trade balance
   * @private
   */
  _calculateTradeBalance(settlement) {
    let exports = 0;
    let imports = 0;

    if (settlement.economy?.trade) {
      settlement.economy.trade.forEach(trade => {
        if (trade.type === 'export') {
          exports += trade.value || 0;
        } else if (trade.type === 'import') {
          imports += trade.value || 0;
        }
      });
    }

    return exports - imports;
  }

  /**
   * Calculate economic health score
   * @param {number} productionRatio - Production vs consumption ratio
   * @param {number} averageWealth - Average wealth per person
   * @param {number} tradeBalance - Trade balance
   * @returns {number} Economic health score (0-1)
   * @private
   */
  _calculateEconomicHealth(productionRatio, averageWealth, tradeBalance) {
    // Normalize components to 0-1 scale
    const productionScore = Math.min(1.0, productionRatio / 2.0); // Optimal ratio is 2.0
    const wealthScore = Math.min(1.0, averageWealth / 100); // 100 is considered wealthy
    const tradeScore = Math.min(1.0, Math.max(0, (tradeBalance + 1000) / 2000)); // -1000 to +1000 range

    // Weighted average
    return (productionScore * 0.4) + (wealthScore * 0.4) + (tradeScore * 0.2);
  }

  /**
   * Get prosperity level description
   * @param {number} economicHealth - Economic health score
   * @returns {string} Prosperity level
   * @private
   */
  _getProsperityLevel(economicHealth) {
    if (economicHealth >= 0.8) return 'thriving';
    if (economicHealth >= 0.6) return 'prosperous';
    if (economicHealth >= 0.4) return 'stable';
    if (economicHealth >= 0.2) return 'struggling';
    return 'impoverished';
  }

  /**
   * Calculate production efficiency
   * @param {Object} character - Character to analyze
   * @param {Object} settlement - Settlement context
   * @returns {number} Production efficiency (0-1)
   * @private
   */
  _calculateProductionEfficiency(character, settlement) {
    let efficiency = 0.8; // Base efficiency

    // Tool quality modifier
    if (character.equipment?.tools) {
      efficiency += 0.1;
    }

    // Infrastructure modifier
    if (settlement.buildings) {
      const relevantBuildings = settlement.buildings.filter(b =>
        ['workshop', 'farm', 'market'].includes(b.type.toLowerCase())
      );
      efficiency += Math.min(0.1, relevantBuildings.length * 0.02);
    }

    // Health modifier
    const healthPercent = character.health / 100;
    efficiency *= Math.max(0.5, healthPercent);

    return Math.min(1.0, efficiency);
  }

  /**
   * Calculate lifestyle modifier
   * @param {Object} character - Character to analyze
   * @param {Object} settlement - Settlement context
   * @returns {number} Lifestyle modifier
   * @private
   */
  _calculateLifestyleModifier(character, settlement) {
    let modifier = 1.0;

    // Wealth-based modifier
    const wealth = character.wealth || 0;
    if (wealth > 200) modifier *= 1.3; // Wealthy lifestyle
    else if (wealth > 50) modifier *= 1.1; // Comfortable lifestyle
    else if (wealth < 10) modifier *= 0.9; // Poor lifestyle

    // Role-based modifier
    if (character.role === 'leader' || character.role === 'noble') {
      modifier *= 1.2;
    }

    return modifier;
  }

  /**
   * Calculate consumption cost
   * @param {Object} consumption - Consumption amounts
   * @param {Object} settlement - Settlement context
   * @returns {number} Total consumption cost
   * @private
   */
  _calculateConsumptionCost(consumption, settlement) {
    const prices = settlement.economy?.prices || {
      food: 1, water: 0.5, goods: 2, services: 3
    };

    return Object.entries(consumption).reduce((total, [resource, amount]) => {
      return total + (amount * (prices[resource] || 1));
    }, 0);
  }

  /**
   * Calculate affordability
   * @param {Object} character - Character to analyze
   * @param {number} cost - Consumption cost
   * @returns {number} Affordability ratio
   * @private
   */
  _calculateAffordability(character, cost) {
    const wealth = character.wealth || 0;
    return wealth / Math.max(cost, 1);
  }

  /**
   * Calculate income
   * @param {Object} character - Character to analyze
   * @param {Object} profile - Economic profile
   * @param {Object} economicState - Economic state
   * @returns {number} Income amount
   * @private
   */
  _calculateIncome(character, profile, economicState) {
    let income = 0;

    // Base income from profession
    const professionIncome = {
      'farmer': 8, 'craftsman': 10, 'merchant': 15,
      'healer': 12, 'guard': 6, 'priest': 5, 'teacher': 7
    };
    income += professionIncome[character.profession] || 2;

    // Economic state modifier
    income *= economicState.economicHealth;

    // Profile modifier
    income *= (1 + profile.wealthAccumulation);

    return income;
  }

  /**
   * Calculate expenses
   * @param {Object} character - Character to analyze
   * @param {Object} profile - Economic profile
   * @param {Object} economicState - Economic state
   * @returns {number} Expense amount
   * @private
   */
  _calculateExpenses(character, profile, economicState) {
    // Base expenses from consumption
    const baseExpenses = 15; // Base living expenses

    // Profile consumption modifier
    const profileExpenses = baseExpenses * profile.consumptionMultiplier;

    // Economic state modifier (higher prices in poor economies)
    const economicModifier = 2 - economicState.economicHealth; // 1.0 to 2.0 range

    return profileExpenses * economicModifier;
  }

  /**
   * Calculate wealth trend
   * @param {number} currentWealth - Current wealth
   * @param {number} change - Wealth change
   * @param {Object} economicState - Economic state
   * @returns {string} Wealth trend
   * @private
   */
  _calculateWealthTrend(currentWealth, change, economicState) {
    const changePercent = currentWealth > 0 ? (change / currentWealth) * 100 : 0;

    if (changePercent > 10) return 'increasing_rapidly';
    if (changePercent > 2) return 'increasing';
    if (changePercent > -2) return 'stable';
    if (changePercent > -10) return 'decreasing';
    return 'decreasing_rapidly';
  }

  /**
   * Calculate settlement feedback effects
   * @param {Object} character - Character to analyze
   * @param {Object} profile - Economic profile
   * @param {Object} economicState - Economic state
   * @returns {Object} Settlement effects
   * @private
   */
  _calculateSettlementFeedbackEffects(character, profile, economicState) {
    const effects = {};

    // Economic influence effects
    if (profile.economicInfluence > 0.5) {
      effects.marketInfluence = {
        priceStability: profile.economicInfluence * 0.2,
        tradeEfficiency: profile.economicInfluence * 0.15,
        description: 'High economic influence stabilizes markets'
      };
    }

    // Production contribution effects
    if (profile.productionCapacity > 0.3) {
      effects.productionBoost = {
        settlementProduction: profile.productionCapacity * 0.1,
        resourceEfficiency: profile.productionCapacity * 0.05,
        description: 'Significant production contribution boosts settlement economy'
      };
    }

    return effects;
  }

  /**
   * Calculate cascading economic impacts
   * @param {Object} character - Character to analyze
   * @param {Object} profile - Economic profile
   * @param {Object} economicState - Economic state
   * @param {Object} settlement - Settlement context
   * @returns {Array} Cascading impacts
   * @private
   */
  _calculateCascadingEconomicImpacts(character, profile, economicState, settlement) {
    const impacts = [];

    // Poverty cascade
    if (economicState.economicHealth < 0.3 && profile.economicInfluence < 0.3) {
      impacts.push({
        type: 'poverty_cascade',
        description: 'Low economic influence in poor settlement creates poverty cycle',
        effects: {
          consciousness: -0.2,
          behavior: 'desperate_economic_actions',
          settlement: 'increased_instability'
        },
        severity: (0.3 - economicState.economicHealth) * profile.economicInfluence
      });
    }

    // Prosperity cascade
    if (economicState.economicHealth > 0.7 && profile.economicInfluence > 0.6) {
      impacts.push({
        type: 'prosperity_cascade',
        description: 'High economic influence in prosperous settlement creates wealth cycle',
        effects: {
          consciousness: 0.15,
          behavior: 'confident_investments',
          settlement: 'economic_growth'
        },
        severity: economicState.economicHealth * profile.economicInfluence
      });
    }

    return impacts;
  }

  /**
   * Get default economic profile for error cases
   * @returns {Object} Default economic profile
   * @private
   */
  _getDefaultEconomicProfile() {
    return {
      profile: BasicNeedsService.ECONOMIC_PROFILES.CITIZEN,
      productionContribution: { finalProduction: 0 },
      consumptionNeeds: { totalCost: 10 },
      wealthDynamics: { netChange: 0 },
      economicInfluence: { totalInfluence: 0.1 },
      feedbackLoops: { consciousnessModifiers: {} },
      economicState: { economicHealth: 0.5, prosperityLevel: 'stable' },
      tier: 'citizen'
    };
  }

  /**
   * Validate settlement object
   * @param {Object} settlement - Settlement to validate
   * @private
   */
  _validateSettlement(settlement) {
    if (!settlement) {
      throw new Error('Settlement is required');
    }
    if (!settlement.id) {
      throw new Error('Settlement must have a valid id');
    }
    if (!settlement.name) {
      throw new Error('Settlement must have a valid name');
    }

    // Handle both population structures
    let totalPopulation = 0;

    if (settlement.population) {
      if (typeof settlement.population === 'number') {
        totalPopulation = settlement.population;
      } else if (settlement.population.total !== undefined) {
        totalPopulation = settlement.population.total;
      } else if (settlement.populationGroups?.length > 0) {
        // Calculate from population groups
        totalPopulation = settlement.populationGroups.reduce((sum, group) =>
          sum + (group.count || 0), 0
        );
      }
    }

    // Set normalized population structure
    if (!settlement.population || typeof settlement.population !== 'object') {
      settlement.population = { total: totalPopulation };
    } else if (settlement.population.total === undefined) {
      settlement.population.total = totalPopulation;
    }

    if (settlement.population.total === 0 || !Number.isFinite(settlement.population.total)) {
      console.warn(`Settlement ${settlement.id} has invalid population, using default`);
      settlement.population.total = 100; // Default population
    }

    // Ensure the population is valid for calculations
    if (!settlement.population || typeof settlement.population.total !== 'number') {
      throw new Error('Settlement must have a valid population with total count');
    }
  }

  /**
   * Calculate food production for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {number} Food production amount
   * @private
   */
  _calculateFoodProduction(settlement, investmentEffects = null) {
    let production = 0;

    // Production from buildings
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type === 'farm' || building.type === 'granary') {
          production += (building.level || 1) * 10;
        }
      });
    }

    // Production from assigned characters
    if (settlement.assignedCharacters) {
      settlement.assignedCharacters.forEach(character => {
        if (character.profession === 'farmer') {
          production += 8;
        }
      });
    }

    // Base production from settlement size
    const population = settlement.population?.total || 100;
    production += Math.floor(population / 20); // 1 food per 20 people

    return production;
  }

  /**
   * Calculate food storage capacity for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {number} Food storage capacity
   * @private
   */
  _calculateFoodStorage(settlement, investmentEffects = null) {
    let storage = 0;

    // Storage from buildings
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type === 'granary' || building.type === 'warehouse') {
          storage += (building.level || 1) * 50;
        }
      });
    }

    // Base storage
    const population = settlement.population?.total || 100;
    storage += Math.floor(population / 10); // 1 storage per 10 people

    return storage;
  }

  /**
   * Calculate food trade access for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {number} Food trade access amount
   * @private
   */
  _calculateFoodTradeAccess(settlement, investmentEffects = null) {
    let tradeAccess = 0;

    // Trade access from buildings
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type === 'market' || building.type === 'trade_post') {
          tradeAccess += (building.level || 1) * 5;
        }
      });
    }

    // Trade access from economy
    if (settlement.economy?.trade) {
      settlement.economy.trade.forEach(trade => {
        if (trade.type === 'import' && trade.resource === 'food') {
          tradeAccess += trade.amount || 0;
        }
      });
    }

    return tradeAccess;
  }

  /**
   * Calculate water sources for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {number} Water sources amount
   * @private
   */
  _calculateWaterSources(settlement, investmentEffects = null) {
    let sources = 0;

    // Natural water sources based on environment
    if (settlement.environment) {
      if (settlement.environment.hasRiver) sources += 20;
      if (settlement.environment.hasLake) sources += 15;
      if (settlement.environment.hasWell) sources += 5;
    }

    // Water from buildings
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type === 'well' || building.type === 'aqueduct') {
          sources += (building.level || 1) * 10;
        }
      });
    }

    return sources;
  }

  /**
   * Calculate water infrastructure for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {number} Water infrastructure capacity
   * @private
   */
  _calculateWaterInfrastructure(settlement, investmentEffects = null) {
    let infrastructure = 0;

    // Infrastructure from buildings
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type === 'aqueduct' || building.type === 'cistern') {
          infrastructure += (building.level || 1) * 15;
        }
      });
    }

    return infrastructure;
  }

  /**
   * Calculate water storage for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {number} Water storage capacity
   * @private
   */
  _calculateWaterStorage(settlement, investmentEffects = null) {
    let storage = 0;

    // Storage from buildings
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type === 'cistern' || building.type === 'reservoir') {
          storage += (building.level || 1) * 25;
        }
      });
    }

    return storage;
  }

  /**
   * Calculate housing capacity for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {number} Housing capacity
   * @private
   */
  _calculateHousingCapacity(settlement, investmentEffects = null) {
    let capacity = 0;

    // Housing from buildings
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type === 'house' || building.type === 'apartment') {
          capacity += (building.level || 1) * 4; // 4 people per house
        }
      });
    }

    // Base housing capacity
    const population = settlement.population?.total || 100;
    capacity += Math.floor(population / 5); // Basic housing for population

    return capacity;
  }

  /**
   * Calculate housing quality for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {number} Housing quality (0-1)
   * @private
   */
  _calculateHousingQuality(settlement, investmentEffects = null) {
    let quality = 0.5; // Base quality

    // Quality from buildings
    if (settlement.buildings) {
      const housingBuildings = settlement.buildings.filter(b =>
        b.type === 'house' || b.type === 'apartment'
      );

      if (housingBuildings.length > 0) {
        const avgLevel = housingBuildings.reduce((sum, b) => sum + (b.level || 1), 0) / housingBuildings.length;
        quality = Math.min(1.0, 0.5 + (avgLevel - 1) * 0.1);
      }
    }

    return quality;
  }

  /**
   * Calculate goods production for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {number} Goods production amount
   * @private
   */
  _calculateGoodsProduction(settlement, investmentEffects = null) {
    let production = 0;

    // Production from buildings
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type === 'workshop' || building.type === 'forge') {
          production += (building.level || 1) * 8;
        }
      });
    }

    // Production from assigned characters
    if (settlement.assignedCharacters) {
      settlement.assignedCharacters.forEach(character => {
        if (character.profession === 'craftsman' || character.profession === 'merchant') {
          production += 6;
        }
      });
    }

    return production;
  }

  /**
   * Calculate goods trade access for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {number} Goods trade access amount
   * @private
   */
  _calculateGoodsTradeAccess(settlement, investmentEffects = null) {
    let tradeAccess = 0;

    // Trade access from buildings
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type === 'market' || building.type === 'trade_post') {
          tradeAccess += (building.level || 1) * 8;
        }
      });
    }

    // Trade access from economy
    if (settlement.economy?.trade) {
      settlement.economy.trade.forEach(trade => {
        if (trade.type === 'import' && trade.resource === 'goods') {
          tradeAccess += trade.amount || 0;
        }
      });
    }

    return tradeAccess;
  }

  /**
   * Calculate market efficiency for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {number} Market efficiency (0-1)
   * @private
   */
  _calculateMarketEfficiency(settlement, investmentEffects = null) {
    let efficiency = 0.7; // Base efficiency

    // Efficiency from buildings
    if (settlement.buildings) {
      const marketBuildings = settlement.buildings.filter(b =>
        b.type === 'market' || b.type === 'trade_post'
      );

      if (marketBuildings.length > 0) {
        const avgLevel = marketBuildings.reduce((sum, b) => sum + (b.level || 1), 0) / marketBuildings.length;
        efficiency = Math.min(1.0, 0.7 + (avgLevel - 1) * 0.1);
      }
    }

    return efficiency;
  }

  /**
   * Calculate healthcare capacity for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {number} Healthcare capacity
   * @private
   */
  _calculateHealthcareCapacity(settlement, investmentEffects = null) {
    let capacity = 0;

    // Healthcare from buildings
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type === 'hospital' || building.type === 'clinic') {
          capacity += (building.level || 1) * 20;
        }
      });
    }

    // Healthcare from assigned characters
    if (settlement.assignedCharacters) {
      settlement.assignedCharacters.forEach(character => {
        if (character.profession === 'healer') {
          capacity += 10;
        }
      });
    }

    return capacity;
  }

  /**
   * Calculate education capacity for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {number} Education capacity
   * @private
   */
  _calculateEducationCapacity(settlement, investmentEffects = null) {
    let capacity = 0;

    // Education from buildings
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type === 'school' || building.type === 'library') {
          capacity += (building.level || 1) * 15;
        }
      });
    }

    // Education from assigned characters
    if (settlement.assignedCharacters) {
      settlement.assignedCharacters.forEach(character => {
        if (character.profession === 'teacher') {
          capacity += 8;
        }
      });
    }

    return capacity;
  }

  /**
   * Calculate religious capacity for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {number} Religious capacity
   * @private
   */
  _calculateReligiousCapacity(settlement, investmentEffects = null) {
    let capacity = 0;

    // Religious from buildings
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type === 'temple' || building.type === 'church') {
          capacity += (building.level || 1) * 12;
        }
      });
    }

    // Religious from assigned characters
    if (settlement.assignedCharacters) {
      settlement.assignedCharacters.forEach(character => {
        if (character.profession === 'priest') {
          capacity += 6;
        }
      });
    }

    return capacity;
  }

  /**
   * Calculate administrative capacity for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {number} Administrative capacity
   * @private
   */
  _calculateAdministrativeCapacity(settlement, investmentEffects = null) {
    let capacity = 0;

    // Administrative from buildings
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type === 'town_hall' || building.type === 'courthouse') {
          capacity += (building.level || 1) * 25;
        }
      });
    }

    // Administrative from assigned characters
    if (settlement.assignedCharacters) {
      settlement.assignedCharacters.forEach(character => {
        if (character.profession === 'administrator' || character.role === 'leader') {
          capacity += 15;
        }
      });
    }

    return capacity;
  }

  /**
   * Get investment multiplier for a specific need
   * @param {Object} investmentEffects - Investment effects
   * @param {string} needType - Type of need (food, water, shelter, goods, services)
   * @returns {number} Investment multiplier
   * @private
   */
  _getInvestmentMultiplier(investmentEffects, needType) {
    if (!investmentEffects) return 1.0;

    const effect = investmentEffects[needType];
    if (!effect) return 1.0;

    return 1.0 + (effect.multiplier || 0);
  }

  /**
   * Generate consequences based on need satisfaction levels
   * @param {Object} needs - Individual need satisfaction levels
   * @param {Object} settlement - Settlement context
   * @param {Object} investmentEffects - Optional investment effects
   * @returns {Array} Array of consequences
   * @private
   */
  _generateConsequences(needs, settlement, investmentEffects = null, productionNodeEffects = null) {
    const consequences = [];

    // Add production node failure consequences
    if (productionNodeEffects && productionNodeEffects.resourceShortages.length > 0) {
      productionNodeEffects.resourceShortages.forEach(shortage => {
        const severity = this._getSeverityMultiplier(shortage.severity);
        consequences.push({
          type: `${shortage.resourceType}_supply_disruption`,
          severity: severity,
          description: `${shortage.resourceType.charAt(0).toUpperCase() + shortage.resourceType.slice(1)} supply disrupted by production node failures`,
          effects: {
            economy: -severity * 0.2,
            productivity: -severity * 0.15,
            population: shortage.resourceType === 'food' || shortage.resourceType === 'water' ? -severity * 0.1 : 0
          },
          duration: Math.ceil(severity * 14), // Days based on severity
          timestamp: Date.now(),
          source: 'production_node_failure'
        });
      });
    }

    // Food consequences
    if (needs.food < 0.5) {
      consequences.push({
        type: 'food_shortage',
        severity: Math.max(0.1, 1.0 - needs.food),
        description: 'Food shortage affecting settlement productivity',
        effects: {
          productivity: -(1.0 - needs.food) * 0.3,
          health: -(1.0 - needs.food) * 0.2,
          mood: -(1.0 - needs.food) * 0.4
        },
        duration: Math.ceil((1.0 - needs.food) * 10), // Days
        timestamp: Date.now()
      });
    }

    // Water consequences
    if (needs.water < 0.6) {
      consequences.push({
        type: 'water_shortage',
        severity: Math.max(0.1, 1.0 - needs.water),
        description: 'Water shortage causing health and productivity issues',
        effects: {
          health: -(1.0 - needs.water) * 0.4,
          productivity: -(1.0 - needs.water) * 0.2,
          agriculture: -(1.0 - needs.water) * 0.5
        },
        duration: Math.ceil((1.0 - needs.water) * 8),
        timestamp: Date.now()
      });
    }

    // Shelter consequences
    if (needs.shelter < 0.4) {
      consequences.push({
        type: 'housing_crisis',
        severity: Math.max(0.1, 1.0 - needs.shelter),
        description: 'Housing shortage leading to overcrowding and health issues',
        effects: {
          health: -(1.0 - needs.shelter) * 0.3,
          mood: -(1.0 - needs.shelter) * 0.3,
          productivity: -(1.0 - needs.shelter) * 0.2
        },
        duration: Math.ceil((1.0 - needs.shelter) * 15),
        timestamp: Date.now()
      });
    }

    // Goods consequences
    if (needs.goods < 0.3) {
      consequences.push({
        type: 'goods_shortage',
        severity: Math.max(0.1, 1.0 - needs.goods),
        description: 'Goods shortage affecting daily life and economy',
        effects: {
          economy: -(1.0 - needs.goods) * 0.4,
          mood: -(1.0 - needs.goods) * 0.2,
          productivity: -(1.0 - needs.goods) * 0.1
        },
        duration: Math.ceil((1.0 - needs.goods) * 12),
        timestamp: Date.now()
      });
    }

    // Services consequences
    if (needs.services < 0.4) {
      consequences.push({
        type: 'services_shortage',
        severity: Math.max(0.1, 1.0 - needs.services),
        description: 'Services shortage impacting health and education',
        effects: {
          health: -(1.0 - needs.services) * 0.2,
          education: -(1.0 - needs.services) * 0.5,
          mood: -(1.0 - needs.services) * 0.2
        },
        duration: Math.ceil((1.0 - needs.services) * 10),
        timestamp: Date.now()
      });
    }

    // Positive consequences for well-satisfied needs
    if (needs.food > 0.9) {
      consequences.push({
        type: 'food_surplus',
        severity: Math.min(0.5, needs.food - 0.9),
        description: 'Food surplus boosting settlement morale and trade',
        effects: {
          mood: (needs.food - 0.9) * 0.3,
          trade: (needs.food - 0.9) * 0.2,
          population_growth: (needs.food - 0.9) * 0.1
        },
        duration: Math.ceil((needs.food - 0.9) * 20),
        timestamp: Date.now()
      });
    }

    return consequences;
  }

  /**
   * Get default satisfaction result for error cases
   * @returns {Object} Default satisfaction result
   * @private
   */
  _getDefaultSatisfactionResult() {
    return {
      needs: {
        food: 0.5,
        water: 0.5,
        shelter: 0.5,
        goods: 0.5,
        services: 0.5
      },
      overall: 0.5,
      consequences: [],
      cascadingEffects: {
        multiplier: 1.0,
        affectedNeeds: [],
        hasEffects: false,
        originalValues: {
          goods: 0.5,
          services: 0.5
        }
      },
      productionNodeEffects: {
        failedNodes: [],
        resourceShortages: [],
        cascadingImpact: 0.0
      },
      investmentEffects: {},
      resourceFlows: [],
      economicCapabilities: false
    };
  }

  /**
   * Clamp need values to valid range
   * @param {Object} needs - Need satisfaction levels
   * @returns {Object} Clamped need values
   * @private
   */
  _clampNeedValues(needs) {
    return {
      food: BaseDomainService.clamp(needs.food, 0.0, 1.0),
      water: BaseDomainService.clamp(needs.water, 0.0, 1.0),
      shelter: BaseDomainService.clamp(needs.shelter, 0.0, 1.0),
      goods: BaseDomainService.clamp(needs.goods, 0.0, 1.0),
      services: BaseDomainService.clamp(needs.services, 0.0, 1.0)
    };
  }
}

export default BasicNeedsService;