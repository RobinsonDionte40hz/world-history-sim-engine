// src/domain/services/NeedConsequenceService.js

import BaseDomainService from './BaseDomainService.js';

/**
 * Service for generating and managing consequences from unmet settlement needs
 * Handles consequence creation, severity calculation, and resolution tracking
 */
export default class NeedConsequenceService extends BaseDomainService {
  
  // Consequence generation thresholds
  static CONSEQUENCE_THRESHOLDS = {
    FAMINE_THRESHOLD: 0.3,
    WATER_CRISIS_THRESHOLD: 0.4,
    HOUSING_CRISIS_THRESHOLD: 0.2,
    GOODS_SHORTAGE_THRESHOLD: 0.3,
    SERVICES_SHORTAGE_THRESHOLD: 0.2
  };

  // Consequence severity scaling factors
  static SEVERITY_SCALING = {
    FAMINE: { base: 0.3, max: 1.0 },
    WATER_CRISIS: { base: 0.7, max: 1.0 },
    HOUSING_CRISIS: { base: 0.4, max: 1.0 },
    GOODS_SHORTAGE: { base: 0.6, max: 1.0 },
    SERVICES_SHORTAGE: { base: 0.5, max: 1.0 }
  };

  // Consequence duration ranges (in turns)
  static CONSEQUENCE_DURATION = {
    FAMINE: { min: 5, max: 12 },
    WATER_CRISIS: { min: 4, max: 10 },
    HOUSING_CRISIS: { min: 8, max: 15 },
    GOODS_SHORTAGE: { min: 3, max: 8 },
    SERVICES_SHORTAGE: { min: 5, max: 10 }
  };

  /**
   * Generate all consequences for a settlement based on need satisfaction levels
   * @param {Object} needs - Need satisfaction levels
   * @param {Object} settlement - Settlement experiencing the needs
   * @returns {Array} Array of consequence objects
   */
  generateConsequences(needs, settlement) {
    try {
      this._validateInputs(needs, settlement);
      
      const consequences = [];

      // Generate consequences for each need type
      if (needs.food < NeedConsequenceService.CONSEQUENCE_THRESHOLDS.FAMINE_THRESHOLD) {
        consequences.push(this._generateFamineConsequence(needs, settlement));
      }

      if (needs.water < NeedConsequenceService.CONSEQUENCE_THRESHOLDS.WATER_CRISIS_THRESHOLD) {
        consequences.push(this._generateWaterCrisisConsequence(needs, settlement));
      }

      if (needs.shelter < NeedConsequenceService.CONSEQUENCE_THRESHOLDS.HOUSING_CRISIS_THRESHOLD) {
        consequences.push(this._generateHousingCrisisConsequence(needs, settlement));
      }

      if (needs.goods < NeedConsequenceService.CONSEQUENCE_THRESHOLDS.GOODS_SHORTAGE_THRESHOLD) {
        consequences.push(this._generateGoodsShortageConsequence(needs, settlement));
      }

      if (needs.services < NeedConsequenceService.CONSEQUENCE_THRESHOLDS.SERVICES_SHORTAGE_THRESHOLD) {
        consequences.push(this._generateServicesShortageConsequence(needs, settlement));
      }

      return consequences;
    } catch (error) {
      console.error('Consequence generation failed:', error);
      return [];
    }
  }

  /**
   * Calculate severity for a consequence based on need satisfaction level
   * @param {string} consequenceType - Type of consequence
   * @param {number} needSatisfaction - Current need satisfaction level
   * @returns {number} Severity level (0.0 - 1.0)
   */
  calculateSeverity(consequenceType, needSatisfaction) {
    const threshold = NeedConsequenceService.CONSEQUENCE_THRESHOLDS[`${consequenceType.toUpperCase()}_THRESHOLD`];
    const scaling = NeedConsequenceService.SEVERITY_SCALING[consequenceType.toUpperCase()];
    
    if (!threshold || !scaling) {
      throw new Error(`Invalid consequence type: ${consequenceType}`);
    }

    // If need satisfaction is above threshold, no consequence should be generated
    if (needSatisfaction >= threshold) {
      return 0.0;
    }

    // Calculate severity based on how far below threshold the need is
    const deficit = threshold - needSatisfaction;
    const maxDeficit = threshold; // Maximum possible deficit
    const severityRatio = deficit / maxDeficit;
    
    // Apply scaling factors
    const scaledSeverity = scaling.base + (severityRatio * (scaling.max - scaling.base));
    
    return BaseDomainService.clamp(scaledSeverity, 0.0, 1.0);
  }

  /**
   * Calculate duration for a consequence based on severity
   * @param {string} consequenceType - Type of consequence
   * @param {number} severity - Severity level (0.0 - 1.0)
   * @returns {number} Duration in turns
   */
  calculateDuration(consequenceType, severity) {
    const durationRange = NeedConsequenceService.CONSEQUENCE_DURATION[consequenceType.toUpperCase()];
    
    if (!durationRange) {
      throw new Error(`Invalid consequence type: ${consequenceType}`);
    }

    // Duration scales with severity
    const duration = durationRange.min + (severity * (durationRange.max - durationRange.min));
    return Math.ceil(duration);
  }

  /**
   * Check if a consequence can be resolved based on current settlement state
   * @param {Object} consequence - Consequence object to check
   * @param {Object} settlement - Current settlement state
   * @returns {boolean} Whether the consequence can be resolved
   */
  canResolveConsequence(consequence, settlement) {
    if (consequence.resolved) {
      return false;
    }

    // Check if consequence has triggers defined
    if (!consequence.triggers || !Array.isArray(consequence.triggers)) {
      return false;
    }

    // Check if any resolution triggers are met
    return consequence.triggers.some(trigger => this._checkResolutionTrigger(trigger, settlement));
  }

  /**
   * Resolve a consequence and return updated consequence object
   * @param {Object} consequence - Consequence to resolve
   * @param {Object} settlement - Settlement state
   * @returns {Object} Updated consequence object
   */
  resolveConsequence(consequence, settlement) {
    if (!this.canResolveConsequence(consequence, settlement)) {
      return consequence;
    }

    return {
      ...consequence,
      resolved: true,
      endDate: new Date()
    };
  }

  // Private methods for consequence generation

  /**
   * Generate famine consequence
   * @private
   */
  _generateFamineConsequence(needs, settlement) {
    const severity = this.calculateSeverity('FAMINE', needs.food);
    const duration = this.calculateDuration('FAMINE', severity);

    return {
      id: `famine_${settlement.id}_${Date.now()}`,
      type: 'famine',
      severity: severity,
      description: `Food shortages plague ${settlement.name}`,
      effects: this._calculateFamineEffects(severity),
      duration: duration,
      triggers: ['successful_harvest', 'food_trade_agreement', 'population_reduction'],
      resolved: false,
      startDate: new Date()
    };
  }

  /**
   * Generate water crisis consequence
   * @private
   */
  _generateWaterCrisisConsequence(needs, settlement) {
    const severity = this.calculateSeverity('WATER_CRISIS', needs.water);
    const duration = this.calculateDuration('WATER_CRISIS', severity);

    return {
      id: `water_crisis_${settlement.id}_${Date.now()}`,
      type: 'water_crisis',
      severity: severity,
      description: `Water scarcity threatens ${settlement.name}`,
      effects: this._calculateWaterCrisisEffects(severity),
      duration: duration,
      triggers: ['build_aqueduct', 'find_water_source', 'water_trade_deal'],
      resolved: false,
      startDate: new Date()
    };
  }

  /**
   * Generate housing crisis consequence
   * @private
   */
  _generateHousingCrisisConsequence(needs, settlement) {
    const severity = this.calculateSeverity('HOUSING_CRISIS', needs.shelter);
    const duration = this.calculateDuration('HOUSING_CRISIS', severity);

    return {
      id: `housing_crisis_${settlement.id}_${Date.now()}`,
      type: 'housing_crisis',
      severity: severity,
      description: `Overcrowding and poor housing conditions plague ${settlement.name}`,
      effects: this._calculateHousingCrisisEffects(severity),
      duration: duration,
      triggers: ['build_housing', 'population_reduction', 'expand_settlement'],
      resolved: false,
      startDate: new Date()
    };
  }

  /**
   * Generate goods shortage consequence
   * @private
   */
  _generateGoodsShortageConsequence(needs, settlement) {
    const severity = this.calculateSeverity('GOODS_SHORTAGE', needs.goods);
    const duration = this.calculateDuration('GOODS_SHORTAGE', severity);

    return {
      id: `goods_shortage_${settlement.id}_${Date.now()}`,
      type: 'goods_shortage',
      severity: severity,
      description: `Trade disruptions and craft shortages affect ${settlement.name}`,
      effects: this._calculateGoodsShortageEffects(severity),
      duration: duration,
      triggers: ['establish_trade_routes', 'build_workshops', 'craft_mastery'],
      resolved: false,
      startDate: new Date()
    };
  }

  /**
   * Generate services shortage consequence
   * @private
   */
  _generateServicesShortageConsequence(needs, settlement) {
    const severity = this.calculateSeverity('SERVICES_SHORTAGE', needs.services);
    const duration = this.calculateDuration('SERVICES_SHORTAGE', severity);

    return {
      id: `services_shortage_${settlement.id}_${Date.now()}`,
      type: 'services_shortage',
      severity: severity,
      description: `Lack of education, healthcare, and spiritual guidance troubles ${settlement.name}`,
      effects: this._calculateServicesShortageEffects(severity),
      duration: duration,
      triggers: ['build_temple', 'establish_school', 'train_healers'],
      resolved: false,
      startDate: new Date()
    };
  }

  // Effect calculation methods

  /**
   * Calculate famine effects based on severity
   * @private
   */
  _calculateFamineEffects(severity) {
    return {
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
    };
  }

  /**
   * Calculate water crisis effects based on severity
   * @private
   */
  _calculateWaterCrisisEffects(severity) {
    return {
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
    };
  }

  /**
   * Calculate housing crisis effects based on severity
   * @private
   */
  _calculateHousingCrisisEffects(severity) {
    return {
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
    };
  }

  /**
   * Calculate goods shortage effects based on severity
   * @private
   */
  _calculateGoodsShortageEffects(severity) {
    return {
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
    };
  }

  /**
   * Calculate services shortage effects based on severity
   * @private
   */
  _calculateServicesShortageEffects(severity) {
    return {
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
    };
  }

  // Validation and utility methods

  /**
   * Validate inputs for consequence generation
   * @private
   */
  _validateInputs(needs, settlement) {
    if (!needs || typeof needs !== 'object') {
      throw new Error('Needs must be a valid object');
    }

    if (!settlement || typeof settlement !== 'object') {
      throw new Error('Settlement must be a valid object');
    }

    if (!settlement.id || typeof settlement.id !== 'string') {
      throw new Error('Settlement must have a valid id');
    }

    if (!settlement.name || typeof settlement.name !== 'string') {
      throw new Error('Settlement must have a valid name');
    }

    // Validate need satisfaction levels
    const needTypes = ['food', 'water', 'shelter', 'goods', 'services'];
    needTypes.forEach(needType => {
      if (typeof needs[needType] !== 'number' || needs[needType] < 0 || needs[needType] > 1) {
        throw new Error(`Need satisfaction for ${needType} must be a number between 0 and 1`);
      }
    });
  }

  /**
   * Public validation method for testing
   * @param {Object} needs - Needs object to validate
   * @param {Object} settlement - Settlement object to validate
   */
  validateInputs(needs, settlement) {
    this._validateInputs(needs, settlement);
  }

  /**
   * Check if a resolution trigger is met
   * @private
   */
  _checkResolutionTrigger(trigger, settlement) {
    // This is a simplified implementation
    // In a real system, this would check actual settlement conditions
    
    switch (trigger) {
      case 'successful_harvest':
        return this._hasSuccessfulHarvest(settlement);
      case 'food_trade_agreement':
        return this._hasFoodTradeAgreement(settlement);
      case 'population_reduction':
        return this._hasPopulationReduction(settlement);
      case 'build_aqueduct':
        return this._hasAqueduct(settlement);
      case 'find_water_source':
        return this._hasWaterSource(settlement);
      case 'water_trade_deal':
        return this._hasWaterTradeDeal(settlement);
      case 'build_housing':
        return this._hasAdequateHousing(settlement);
      case 'expand_settlement':
        return this._hasExpandedSettlement(settlement);
      case 'establish_trade_routes':
        return this._hasTradeRoutes(settlement);
      case 'build_workshops':
        return this._hasWorkshops(settlement);
      case 'craft_mastery':
        return this._hasCraftMastery(settlement);
      case 'build_temple':
        return this._hasTemple(settlement);
      case 'establish_school':
        return this._hasSchool(settlement);
      case 'train_healers':
        return this._hasHealers(settlement);
      default:
        return false;
    }
  }

  // Trigger checking methods (simplified implementations)

  _hasSuccessfulHarvest(settlement) {
    return settlement.resources?.production?.food > 80;
  }

  _hasFoodTradeAgreement(settlement) {
    return settlement.economy?.trade?.some(trade => trade.resources?.food > 10);
  }

  _hasPopulationReduction(settlement) {
    return settlement.population?.total < 50;
  }

  _hasAqueduct(settlement) {
    return settlement.buildings?.some(building => building.type === 'aqueduct');
  }

  _hasWaterSource(settlement) {
    return settlement.territory?.features?.some(feature => feature.type === 'water_source');
  }

  _hasWaterTradeDeal(settlement) {
    return settlement.economy?.trade?.some(trade => trade.resources?.water > 0);
  }

  _hasAdequateHousing(settlement) {
    const housingCapacity = settlement.buildings
      ?.filter(building => building.type === 'house')
      ?.reduce((total, building) => total + (building.level || 1) * 4, 0) || 0;
    return housingCapacity >= settlement.population?.total * 0.9;
  }

  _hasExpandedSettlement(settlement) {
    return settlement.territory?.size > 100;
  }

  _hasTradeRoutes(settlement) {
    return settlement.economy?.trade?.length > 2;
  }

  _hasWorkshops(settlement) {
    return settlement.buildings?.some(building => building.type === 'workshop');
  }

  _hasCraftMastery(settlement) {
    return settlement.buildings?.some(building => building.type === 'workshop' && building.level > 2);
  }

  _hasTemple(settlement) {
    return settlement.buildings?.some(building => building.type === 'temple');
  }

  _hasSchool(settlement) {
    return settlement.buildings?.some(building => building.type === 'school');
  }

  _hasHealers(settlement) {
    return settlement.buildings?.some(building => building.type === 'healer');
  }
}
