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
   * @returns {Object} Need satisfaction analysis
   */
  calculateSatisfactionLevel(settlement, investmentEffects = null) {
    try {
      this._validateSettlement(settlement);
      
      const needs = {
        food: this.calculateFoodSatisfaction(settlement, investmentEffects),
        water: this.calculateWaterSatisfaction(settlement, investmentEffects),
        shelter: this.calculateShelterSatisfaction(settlement, investmentEffects),
        goods: this.calculateGoodsSatisfaction(settlement, investmentEffects),
        services: this.calculateServicesSatisfaction(settlement, investmentEffects)
      };

      const cascadingEffects = this._calculateCascadingEffects(needs);
      const overall = this._calculateOverallSatisfaction(needs, cascadingEffects);
      const consequences = this._generateConsequences(needs, settlement, investmentEffects);

      return {
        needs: this._clampNeedValues(needs),
        overall: BaseDomainService.clamp(overall, 0.0, 1.0),
        consequences: consequences,
        cascadingEffects: cascadingEffects,
        investmentEffects: investmentEffects || {}
      };
    } catch (error) {
      console.error('Need satisfaction calculation failed:', error);
      return this._getDefaultSatisfactionResult();
    }
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
   * Calculate overall satisfaction from individual needs
   * @param {Object} needs - Individual need satisfaction levels
   * @param {Object} cascadingEffects - Cascading effects information
   * @returns {number} Overall satisfaction level
   */
  _calculateOverallSatisfaction(needs, cascadingEffects) {
    return (needs.food + needs.water + needs.shelter + needs.goods + needs.services) / 5;
  }

  /**
   * Calculate food satisfaction based on settlement resources and infrastructure
   * @param {Object} settlement - Settlement to analyze
   * @param {Object} investmentEffects - Optional investment effects to apply
   * @returns {number} Food satisfaction level (0.0 - 1.0)
   */
  calculateFoodSatisfaction(settlement, investmentEffects = null) {
    const population = settlement.population.total;
    if (population === 0) return 1.0; // No people, no needs

    const foodProduction = this._calculateFoodProduction(settlement, investmentEffects);
    const foodStorage = this._calculateFoodStorage(settlement, investmentEffects);
    const tradeAccess = this._calculateFoodTradeAccess(settlement, investmentEffects);

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
   * @returns {number} Water satisfaction level (0.0 - 1.0)
   */
  calculateWaterSatisfaction(settlement, investmentEffects = null) {
    const population = settlement.population.total;
    if (population === 0) return 1.0; // No people, no needs

    const waterSources = this._calculateWaterSources(settlement, investmentEffects);
    const waterInfrastructure = this._calculateWaterInfrastructure(settlement, investmentEffects);
    const waterStorage = this._calculateWaterStorage(settlement, investmentEffects);

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
}

export default BasicNeedsService;