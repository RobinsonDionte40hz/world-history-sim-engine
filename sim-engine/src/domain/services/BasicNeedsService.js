// src/domain/services/BasicNeedsService.js

import BaseDomainService from './BaseDomainService.js';

/**
 * Service for calculating settlement need satisfaction levels and cascading effects
 * Handles food, water, shelter, goods, and services satisfaction calculations
 */
export default class BasicNeedsService extends BaseDomainService {
  
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

  /**
   * Calculate satisfaction levels for all basic needs
   * @param {Object} settlement - Settlement to analyze
   * @returns {Object} Need satisfaction analysis
   */
  calculateSatisfactionLevel(settlement) {
    try {
      this._validateSettlement(settlement);
      
      const needs = {
        food: this.calculateFoodSatisfaction(settlement),
        water: this.calculateWaterSatisfaction(settlement),
        shelter: this.calculateShelterSatisfaction(settlement),
        goods: this.calculateGoodsSatisfaction(settlement),
        services: this.calculateServicesSatisfaction(settlement)
      };

      const cascadingEffects = this._calculateCascadingEffects(needs);
      const overall = this._calculateOverallSatisfaction(needs, cascadingEffects);
      const consequences = this._generateConsequences(needs, settlement);

      return {
        needs: this._clampNeedValues(needs),
        overall: BaseDomainService.clamp(overall, 0.0, 1.0),
        consequences: consequences,
        cascadingEffects: cascadingEffects
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
   * @returns {number} Food satisfaction level (0.0 - 1.0)
   */
  calculateFoodSatisfaction(settlement) {
    const population = settlement.population.total;
    if (population === 0) return 1.0; // No people, no needs

    const foodProduction = this._calculateFoodProduction(settlement);
    const foodStorage = this._calculateFoodStorage(settlement);
    const tradeAccess = this._calculateFoodTradeAccess(settlement);

    const totalFoodAvailability = foodProduction + foodStorage + tradeAccess;
    const foodDemand = population * BasicNeedsService.CONSUMPTION_RATES.FOOD_PER_PERSON;

    return Math.min(1.0, totalFoodAvailability / foodDemand);
  }

  /**
   * Calculate water satisfaction based on water sources and infrastructure
   * @param {Object} settlement - Settlement to analyze
   * @returns {number} Water satisfaction level (0.0 - 1.0)
   */
  calculateWaterSatisfaction(settlement) {
    const population = settlement.population.total;
    if (population === 0) return 1.0; // No people, no needs

    const waterSources = this._calculateWaterSources(settlement);
    const waterInfrastructure = this._calculateWaterInfrastructure(settlement);
    const waterStorage = this._calculateWaterStorage(settlement);

    const totalWaterAvailability = waterSources + waterInfrastructure + waterStorage;
    const waterDemand = population * BasicNeedsService.CONSUMPTION_RATES.WATER_PER_PERSON;

    return Math.min(1.0, totalWaterAvailability / waterDemand);
  }

  /**
   * Calculate shelter satisfaction based on housing and population density
   * @param {Object} settlement - Settlement to analyze
   * @returns {number} Shelter satisfaction level (0.0 - 1.0)
   */
  calculateShelterSatisfaction(settlement) {
    const population = settlement.population.total;
    if (population === 0) return 1.0; // No people, no needs

    const housingCapacity = this._calculateHousingCapacity(settlement);
    const housingQuality = this._calculateHousingQuality(settlement);

    const basicShelterRatio = Math.min(1.0, housingCapacity / population);
    const qualityModifier = housingQuality;

    return basicShelterRatio * qualityModifier;
  }

  /**
   * Calculate goods satisfaction based on production and trade
   * @param {Object} settlement - Settlement to analyze
   * @returns {number} Goods satisfaction level (0.0 - 1.0)
   */
  calculateGoodsSatisfaction(settlement) {
    const population = settlement.population.total;
    if (population === 0) return 1.0; // No people, no needs

    const localProduction = this._calculateGoodsProduction(settlement);
    const tradeAccess = this._calculateGoodsTradeAccess(settlement);
    const marketEfficiency = this._calculateMarketEfficiency(settlement);

    const totalGoodsAvailability = (localProduction + tradeAccess) * marketEfficiency;
    const goodsDemand = population * BasicNeedsService.CONSUMPTION_RATES.GOODS_PER_PERSON;

    return Math.min(1.0, totalGoodsAvailability / goodsDemand);
  }

  /**
   * Calculate services satisfaction based on available services and infrastructure
   * @param {Object} settlement - Settlement to analyze
   * @returns {number} Services satisfaction level (0.0 - 1.0)
   */
  calculateServicesSatisfaction(settlement) {
    const population = settlement.population.total;
    if (population === 0) return 1.0; // No people, no needs

    const healthcareCapacity = this._calculateHealthcareCapacity(settlement);
    const educationCapacity = this._calculateEducationCapacity(settlement);
    const religiousCapacity = this._calculateReligiousCapacity(settlement);
    const administrativeCapacity = this._calculateAdministrativeCapacity(settlement);

    const totalServiceCapacity = healthcareCapacity + educationCapacity + 
                                religiousCapacity + administrativeCapacity;
    const serviceDemand = population * BasicNeedsService.CONSUMPTION_RATES.SERVICES_PER_PERSON;

    return Math.min(1.0, totalServiceCapacity / serviceDemand);
  }

  // Private helper methods for calculating specific resource availability

  /**
   * Calculate food production from farms and other sources
   * @private
   */
  _calculateFoodProduction(settlement) {
    let production = 0;
    
    // Base food from resources
    if (settlement.resources && settlement.resources.amounts && settlement.resources.amounts.food) {
      production += settlement.resources.amounts.food;
    }

    // Food from buildings
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        const efficiency = BasicNeedsService.BUILDING_EFFICIENCY[building.type.toUpperCase()];
        if (efficiency && efficiency.food) {
          production += efficiency.food * (building.level || 1);
        }
      });
    }

    return Math.max(0, production);
  }

  /**
   * Calculate food storage capacity
   * @private
   */
  _calculateFoodStorage(settlement) {
    if (settlement.resources && settlement.resources.storage && settlement.resources.storage.food) {
      return settlement.resources.storage.food;
    }
    return 0;
  }

  /**
   * Calculate food access through trade
   * @private
   */
  _calculateFoodTradeAccess(settlement) {
    let tradeAccess = 0;
    
    if (settlement.economy && settlement.economy.trade) {
      settlement.economy.trade.forEach(trade => {
        if (trade.resources && trade.resources.food) {
          tradeAccess += trade.resources.food * (trade.frequency || 1);
        }
      });
    }

    return tradeAccess;
  }

  /**
   * Calculate water from natural sources
   * @private
   */
  _calculateWaterSources(settlement) {
    let waterSources = 0;
    
    // Base water from resources
    if (settlement.resources && settlement.resources.amounts && settlement.resources.amounts.water) {
      waterSources += settlement.resources.amounts.water;
    }

    // Water from territory features (rivers, lakes, etc.)
    if (settlement.territory && settlement.territory.features) {
      settlement.territory.features.forEach(feature => {
        if (feature.type === 'river') {
          waterSources += 20; // Rivers provide significant water
        } else if (feature.type === 'lake') {
          waterSources += 30; // Lakes provide more water
        } else if (feature.type === 'spring') {
          waterSources += 15; // Springs provide moderate water
        }
      });
    }

    return waterSources;
  }

  /**
   * Calculate water from infrastructure
   * @private
   */
  _calculateWaterInfrastructure(settlement) {
    let infrastructure = 0;
    
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        const efficiency = BasicNeedsService.BUILDING_EFFICIENCY[building.type.toUpperCase()];
        if (efficiency && efficiency.water) {
          infrastructure += efficiency.water * (building.level || 1);
        }
      });
    }

    return infrastructure;
  }

  /**
   * Calculate water storage capacity
   * @private
   */
  _calculateWaterStorage(settlement) {
    if (settlement.resources && settlement.resources.storage && settlement.resources.storage.water) {
      return settlement.resources.storage.water;
    }
    return 0;
  }

  /**
   * Calculate housing capacity from buildings
   * @private
   */
  _calculateHousingCapacity(settlement) {
    let capacity = 0;
    
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        const efficiency = BasicNeedsService.BUILDING_EFFICIENCY[building.type.toUpperCase()];
        if (efficiency && efficiency.shelter) {
          capacity += efficiency.shelter * (building.level || 1);
        }
      });
    }

    return capacity;
  }

  /**
   * Calculate housing quality modifier
   * @private
   */
  _calculateHousingQuality(settlement) {
    // Base quality starts at 0.8
    let quality = 0.8;
    
    if (settlement.buildings) {
      const totalBuildings = settlement.buildings.length;
      const housingBuildings = settlement.buildings.filter(b => 
        BasicNeedsService.BUILDING_EFFICIENCY[b.type.toUpperCase()]?.shelter
      );
      
      if (totalBuildings > 0) {
        // More diverse buildings improve quality
        const diversityBonus = Math.min(0.2, totalBuildings * 0.02);
        quality += diversityBonus;
        
        // Higher level buildings improve quality
        const avgLevel = settlement.buildings.reduce((sum, b) => sum + (b.level || 1), 0) / totalBuildings;
        const levelBonus = Math.min(0.2, (avgLevel - 1) * 0.1);
        quality += levelBonus;
        
        // Housing-specific buildings provide additional quality bonus
        if (housingBuildings.length > 0) {
          const housingBonus = Math.min(0.1, housingBuildings.length * 0.02);
          quality += housingBonus;
        }
      }
    }

    return BaseDomainService.clamp(quality, 0.5, 1.2);
  }

  /**
   * Calculate goods production from workshops and crafters
   * @private
   */
  _calculateGoodsProduction(settlement) {
    let production = 0;
    
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        const efficiency = BasicNeedsService.BUILDING_EFFICIENCY[building.type.toUpperCase()];
        if (efficiency && efficiency.goods) {
          production += efficiency.goods * (building.level || 1);
        }
      });
    }

    return production;
  }

  /**
   * Calculate goods access through trade
   * @private
   */
  _calculateGoodsTradeAccess(settlement) {
    let tradeAccess = 0;
    
    if (settlement.economy && settlement.economy.trade) {
      settlement.economy.trade.forEach(trade => {
        // General trade relationships provide goods access
        tradeAccess += trade.value * 0.1; // 10% of trade value becomes goods access
      });
    }

    return tradeAccess;
  }

  /**
   * Calculate market efficiency for goods distribution
   * @private
   */
  _calculateMarketEfficiency(settlement) {
    let efficiency = 0.7; // Base efficiency
    
    if (settlement.economy && settlement.economy.markets) {
      // More markets improve efficiency
      const marketBonus = Math.min(0.3, settlement.economy.markets.length * 0.1);
      efficiency += marketBonus;
    }

    return BaseDomainService.clamp(efficiency, 0.5, 1.2);
  }

  /**
   * Calculate healthcare service capacity
   * @private
   */
  _calculateHealthcareCapacity(settlement) {
    let capacity = 0;
    
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type.toLowerCase() === 'healer' || building.type.toLowerCase() === 'hospital') {
          const efficiency = BasicNeedsService.BUILDING_EFFICIENCY.HEALER;
          capacity += efficiency.services * (building.level || 1);
        }
      });
    }

    return capacity;
  }

  /**
   * Calculate education service capacity
   * @private
   */
  _calculateEducationCapacity(settlement) {
    let capacity = 0;
    
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type.toLowerCase() === 'school' || building.type.toLowerCase() === 'library') {
          const efficiency = BasicNeedsService.BUILDING_EFFICIENCY.SCHOOL;
          capacity += efficiency.services * (building.level || 1);
        }
      });
    }

    return capacity;
  }

  /**
   * Calculate religious service capacity
   * @private
   */
  _calculateReligiousCapacity(settlement) {
    let capacity = 0;
    
    if (settlement.buildings) {
      settlement.buildings.forEach(building => {
        if (building.type.toLowerCase() === 'temple' || building.type.toLowerCase() === 'shrine') {
          const efficiency = BasicNeedsService.BUILDING_EFFICIENCY.TEMPLE;
          capacity += efficiency.services * (building.level || 1);
        }
      });
    }

    return capacity;
  }

  /**
   * Calculate administrative service capacity
   * @private
   */
  _calculateAdministrativeCapacity(settlement) {
    let capacity = 0;
    
    // Government structure provides administrative capacity
    if (settlement.government && settlement.government.structure) {
      settlement.government.structure.forEach(level => {
        if (level.positions) {
          capacity += level.positions.length * 2; // Each position provides 2 units of admin capacity
        }
      });
    }

    return capacity;
  }

  // Validation and utility methods

  /**
   * Validate settlement data for need satisfaction calculations
   * @private
   */
  _validateSettlement(settlement) {
    if (!settlement) {
      throw new Error('Settlement is required');
    }
    
    // Validate basic settlement properties
    if (!settlement.id || typeof settlement.id !== 'string') {
      throw new Error('Settlement must have a valid id');
    }
    
    if (!settlement.name || typeof settlement.name !== 'string') {
      throw new Error('Settlement must have a valid name');
    }
    
    // Validate population data
    if (!settlement.population || typeof settlement.population.total !== 'number') {
      throw new Error('Settlement must have valid population data');
    }
    if (settlement.population.total < 0) {
      throw new Error('Settlement population cannot be negative');
    }
    
    // Validate resources structure (allow undefined but validate structure if present)
    if (settlement.resources) {
      this._validateSettlementResources(settlement.resources);
    }
    
    // Validate buildings structure (allow undefined but validate structure if present)
    if (settlement.buildings) {
      this._validateSettlementBuildings(settlement.buildings);
    }
    
    // Validate economy structure (allow undefined but validate structure if present)
    if (settlement.economy) {
      this._validateSettlementEconomy(settlement.economy);
    }
  }

  /**
   * Validate settlement resources structure
   * @private
   */
  _validateSettlementResources(resources) {
    if (typeof resources !== 'object') {
      throw new Error('Settlement resources must be an object');
    }
    
    // Validate amounts if present
    if (resources.amounts && typeof resources.amounts !== 'object') {
      throw new Error('Settlement resource amounts must be an object');
    }
    
    // Validate production if present
    if (resources.production && typeof resources.production !== 'object') {
      throw new Error('Settlement resource production must be an object');
    }
    
    // Validate storage if present
    if (resources.storage && typeof resources.storage !== 'object') {
      throw new Error('Settlement resource storage must be an object');
    }
  }

  /**
   * Validate settlement buildings structure
   * @private
   */
  _validateSettlementBuildings(buildings) {
    if (!Array.isArray(buildings)) {
      throw new Error('Settlement buildings must be an array');
    }
    
    buildings.forEach((building, index) => {
      if (!building || typeof building !== 'object') {
        throw new Error(`Building at index ${index} must be an object`);
      }
      
      if (!building.type || typeof building.type !== 'string') {
        throw new Error(`Building at index ${index} must have a valid type`);
      }
      
      if (building.level !== undefined && (typeof building.level !== 'number' || building.level < 1)) {
        throw new Error(`Building at index ${index} level must be a positive number`);
      }
    });
  }

  /**
   * Validate settlement economy structure
   * @private
   */
  _validateSettlementEconomy(economy) {
    if (typeof economy !== 'object') {
      throw new Error('Settlement economy must be an object');
    }
    
    // Validate trade if present
    if (economy.trade && !Array.isArray(economy.trade)) {
      throw new Error('Settlement economy trade must be an array');
    }
    
    // Validate markets if present
    if (economy.markets && !Array.isArray(economy.markets)) {
      throw new Error('Settlement economy markets must be an array');
    }
  }

  /**
   * Clamp all need values to valid range
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

  /**
   * Get resource amount safely with default fallback
   * @param {Object} resources - Resources object
   * @param {string} resourceType - Type of resource to get
   * @param {number} defaultValue - Default value if resource not found
   * @returns {number} Resource amount
   * @private
   */
  _getResourceAmount(resources, resourceType, defaultValue = 0) {
    if (!resources || !resources.amounts) {
      return defaultValue;
    }
    return typeof resources.amounts[resourceType] === 'number' ? resources.amounts[resourceType] : defaultValue;
  }

  /**
   * Get resource production safely with default fallback
   * @param {Object} resources - Resources object
   * @param {string} resourceType - Type of resource to get
   * @param {number} defaultValue - Default value if resource not found
   * @returns {number} Resource production
   * @private
   */
  _getResourceProduction(resources, resourceType, defaultValue = 0) {
    if (!resources || !resources.production) {
      return defaultValue;
    }
    return typeof resources.production[resourceType] === 'number' ? resources.production[resourceType] : defaultValue;
  }

  /**
   * Get resource storage safely with default fallback
   * @param {Object} resources - Resources object
   * @param {string} resourceType - Type of resource to get
   * @param {number} defaultValue - Default value if resource not found
   * @returns {number} Resource storage
   * @private
   */
  _getResourceStorage(resources, resourceType, defaultValue = 0) {
    if (!resources || !resources.storage) {
      return defaultValue;
    }
    return typeof resources.storage[resourceType] === 'number' ? resources.storage[resourceType] : defaultValue;
  }

  /**
   * Calculate building efficiency for a specific building type
   * @param {Object} building - Building object
   * @param {string} resourceType - Type of resource to calculate efficiency for
   * @returns {number} Building efficiency for the resource type
   * @private
   */
  _getBuildingEfficiency(building, resourceType) {
    if (!building || !building.type) {
      return 0;
    }
    
    const efficiency = BasicNeedsService.BUILDING_EFFICIENCY[building.type.toUpperCase()];
    if (!efficiency || typeof efficiency[resourceType] !== 'number') {
      return 0;
    }
    
    const level = building.level || 1;
    return efficiency[resourceType] * level;
  }

  /**
   * Calculate total building efficiency for all buildings of a type
   * @param {Array} buildings - Array of building objects
   * @param {string} buildingType - Type of building to calculate for
   * @param {string} resourceType - Type of resource to calculate efficiency for
   * @returns {number} Total efficiency for all buildings of this type
   * @private
   */
  _getTotalBuildingEfficiency(buildings, buildingType, resourceType) {
    if (!Array.isArray(buildings)) {
      return 0;
    }
    
    return buildings
      .filter(building => building.type && building.type.toLowerCase() === buildingType.toLowerCase())
      .reduce((total, building) => total + this._getBuildingEfficiency(building, resourceType), 0);
  }

  /**
   * Calculate trade access for a specific resource
   * @param {Object} economy - Economy object
   * @param {string} resourceType - Type of resource to calculate trade access for
   * @returns {number} Trade access amount
   * @private
   */
  _getTradeAccess(economy, resourceType) {
    if (!economy || !economy.trade || !Array.isArray(economy.trade)) {
      return 0;
    }
    
    return economy.trade.reduce((total, trade) => {
      if (trade.resources && typeof trade.resources[resourceType] === 'number') {
        const frequency = trade.frequency || 1;
        return total + (trade.resources[resourceType] * frequency);
      }
      return total;
    }, 0);
  }

  /**
   * Generate consequences based on need satisfaction levels
   * @param {Object} needs - Need satisfaction levels
   * @param {Object} settlement - Settlement experiencing the needs
   * @returns {Array} Array of consequence objects
   * @private
   */
  _generateConsequences(needs, settlement) {
    const consequences = [];

    // Food-related consequences
    if (needs.food < 0.3) {
      const severity = (0.3 - needs.food) / 0.3;
      consequences.push(this._createFamineConsequence(settlement, severity));
    }

    // Water-related consequences
    if (needs.water < 0.4) {
      const severity = (0.4 - needs.water) / 0.4;
      consequences.push(this._createWaterCrisisConsequence(settlement, severity));
    }

    // Shelter-related consequences
    if (needs.shelter < 0.2) {
      const severity = (0.2 - needs.shelter) / 0.2;
      consequences.push(this._createHousingCrisisConsequence(settlement, severity));
    }

    // Goods-related consequences
    if (needs.goods < 0.3) {
      const severity = (0.3 - needs.goods) / 0.3;
      consequences.push(this._createGoodsShortageConsequence(settlement, severity));
    }

    // Services-related consequences
    if (needs.services < 0.2) {
      const severity = (0.2 - needs.services) / 0.2;
      consequences.push(this._createServicesShortageConsequence(settlement, severity));
    }

    return consequences;
  }

  /**
   * Create famine consequence
   * @private
   */
  _createFamineConsequence(settlement, severity) {
    return {
      id: `famine_${settlement.id}_${Date.now()}`,
      type: 'famine',
      severity: severity,
      description: `Food shortages plague ${settlement.name}`,
      effects: {
        population: {
          growth: -0.2 * severity,
          migration: 0.3 * severity,
          mortality: 0.1 * severity
        },
        character: {
          moodModifier: -30 * severity,
          energyModifier: -20 * severity,
          healthModifier: -15 * severity,
          behaviorChanges: ['prioritize_food', 'hunt_more', 'trade_desperately'],
          interactionModifiers: {
            'hunt_animals': 1 + severity,
            'trade_food': 1 + (2 * severity),
            'social_gathering': 1 - (0.5 * severity)
          }
        },
        settlement: {
          stabilityChange: -0.4 * severity,
          economicImpact: -0.3 * severity,
          socialCohesion: -0.5 * severity
        }
      },
      duration: Math.ceil(8 * severity),
      triggers: ['successful_harvest', 'food_trade_agreement', 'population_reduction'],
      resolved: false,
      startDate: new Date()
    };
  }

  /**
   * Create water crisis consequence
   * @private
   */
  _createWaterCrisisConsequence(settlement, severity) {
    return {
      id: `water_crisis_${settlement.id}_${Date.now()}`,
      type: 'water_crisis',
      severity: severity,
      description: `Water scarcity threatens ${settlement.name}`,
      effects: {
        population: {
          growth: -0.15 * severity,
          migration: 0.25 * severity,
          mortality: 0.08 * severity
        },
        character: {
          moodModifier: -25 * severity,
          energyModifier: -15 * severity,
          healthModifier: -10 * severity,
          behaviorChanges: ['seek_water_sources', 'ration_water', 'dig_wells'],
          interactionModifiers: {
            'dig_well': 1 + (2 * severity),
            'trade_water': 1 + (3 * severity),
            'farm_crops': 1 - (0.4 * severity)
          }
        },
        settlement: {
          stabilityChange: -0.3 * severity,
          economicImpact: -0.25 * severity,
          socialCohesion: -0.2 * severity,
          buildingEfficiency: {
            'farm': 1 - (0.4 * severity),
            'brewery': 1 - (0.7 * severity)
          }
        }
      },
      duration: Math.ceil(6 * severity),
      triggers: ['build_aqueduct', 'find_water_source', 'water_trade_deal'],
      resolved: false,
      startDate: new Date()
    };
  }

  /**
   * Create housing crisis consequence
   * @private
   */
  _createHousingCrisisConsequence(settlement, severity) {
    return {
      id: `housing_crisis_${settlement.id}_${Date.now()}`,
      type: 'housing_crisis',
      severity: severity,
      description: `Overcrowding and poor housing conditions plague ${settlement.name}`,
      effects: {
        population: {
          growth: -0.1 * severity,
          migration: 0.2 * severity,
          mortality: 0.05 * severity
        },
        character: {
          moodModifier: -20 * severity,
          energyModifier: -15 * severity,
          healthModifier: -12 * severity,
          behaviorChanges: ['build_shelter', 'seek_better_housing', 'live_outdoors'],
          interactionModifiers: {
            'build_house': 1 + (1.5 * severity),
            'gather_materials': 1 + severity,
            'social_gathering': 1 - (0.3 * severity)
          }
        },
        settlement: {
          stabilityChange: -0.25 * severity,
          economicImpact: -0.15 * severity,
          socialCohesion: -0.3 * severity
        }
      },
      duration: Math.ceil(10 * severity),
      triggers: ['build_housing', 'population_reduction', 'expand_settlement'],
      resolved: false,
      startDate: new Date()
    };
  }

  /**
   * Create goods shortage consequence
   * @private
   */
  _createGoodsShortageConsequence(settlement, severity) {
    return {
      id: `goods_shortage_${settlement.id}_${Date.now()}`,
      type: 'goods_shortage',
      severity: severity,
      description: `Trade disruptions and craft shortages affect ${settlement.name}`,
      effects: {
        population: {
          growth: -0.05 * severity,
          migration: 0.1 * severity,
          mortality: 0.02 * severity
        },
        character: {
          moodModifier: -15 * severity,
          energyModifier: -10 * severity,
          healthModifier: -5 * severity,
          behaviorChanges: ['prioritize_crafting', 'seek_trade_routes', 'hoard_goods'],
          interactionModifiers: {
            'craft_items': 1 + (1.5 * severity),
            'trade_goods': 1 + (2 * severity),
            'luxury_activities': 1 - (0.6 * severity)
          }
        },
        settlement: {
          stabilityChange: -0.2 * severity,
          economicImpact: -0.4 * severity,
          socialCohesion: -0.1 * severity,
          buildingEfficiency: {
            'market': 1 - (0.5 * severity),
            'workshop': 1 + (0.2 * severity)
          }
        }
      },
      duration: Math.ceil(5 * severity),
      triggers: ['establish_trade_routes', 'build_workshops', 'craft_mastery'],
      resolved: false,
      startDate: new Date()
    };
  }

  /**
   * Create services shortage consequence
   * @private
   */
  _createServicesShortageConsequence(settlement, severity) {
    return {
      id: `services_shortage_${settlement.id}_${Date.now()}`,
      type: 'services_shortage',
      severity: severity,
      description: `Lack of education, healthcare, and spiritual guidance troubles ${settlement.name}`,
      effects: {
        population: {
          growth: -0.08 * severity,
          migration: 0.15 * severity,
          mortality: 0.03 * severity
        },
        character: {
          moodModifier: -18 * severity,
          energyModifier: -12 * severity,
          healthModifier: -8 * severity,
          behaviorChanges: ['seek_education', 'pray_more', 'help_others'],
          interactionModifiers: {
            'study': 1 + (1.2 * severity),
            'pray': 1 + (1.8 * severity),
            'social_gathering': 1 - (0.4 * severity)
          }
        },
        settlement: {
          stabilityChange: -0.15 * severity,
          economicImpact: -0.1 * severity,
          socialCohesion: -0.4 * severity,
          buildingEfficiency: {
            'temple': 1 + (0.3 * severity),
            'school': 1 + (0.2 * severity),
            'healer': 1 + (0.4 * severity)
          }
        }
      },
      duration: Math.ceil(7 * severity),
      triggers: ['build_temple', 'establish_school', 'train_healers'],
      resolved: false,
      startDate: new Date()
    };
  }

  /**
   * Get default satisfaction result for error cases
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
      }
    };
  }
}