// src/domain/services/SettlementInvestmentIntegrationService.js

import BaseDomainService from './BaseDomainService.js';
import BasicNeedsService from './BasicNeedsService.js';
import CharacterEconomicService from './CharacterEconomicService.js';

/**
 * Service for integrating character investments with settlement need satisfaction
 * Connects character economic activities to settlement-wide effects
 */
export default class SettlementInvestmentIntegrationService extends BaseDomainService {

  constructor() {
    super();
    this.basicNeedsService = new BasicNeedsService();
    this.characterEconomicService = new CharacterEconomicService();
  }

  /**
   * Calculate settlement need satisfaction with investment effects
   * @param {Object} settlement - Settlement to analyze
   * @param {Array} characters - Characters with investments in this settlement
   * @returns {Object} Enhanced need satisfaction analysis with investment effects
   */
  calculateInvestmentAffectedNeeds(settlement, characters = []) {
    // Validate inputs first - these errors should be thrown to caller
    this._validateSettlement(settlement);
    this._validateCharacters(characters);

    try {
      // Calculate combined investment effects from all characters
      const investmentEffects = this._calculateCombinedInvestmentEffects(settlement, characters);
      
      // Calculate need satisfaction with investment effects applied
      const needSatisfaction = this.basicNeedsService.calculateSatisfactionLevel(settlement, investmentEffects);

      // Add investment-specific analysis
      needSatisfaction.investmentAnalysis = this._generateInvestmentAnalysis(settlement, characters, investmentEffects);
      needSatisfaction.historicalEvents = this._generateInvestmentHistoricalEvents(settlement, characters, needSatisfaction);
      
      return needSatisfaction;
    } catch (error) {
      console.error('Investment-affected needs calculation failed:', error);
      return this._getDefaultResult(settlement);
    }
  }

  /**
   * Calculate combined investment effects from multiple characters
   * @param {Object} settlement - Target settlement
   * @param {Array} characters - Characters with investments
   * @returns {Object} Combined investment effects
   * @private
   */
  _calculateCombinedInvestmentEffects(settlement, characters) {
    const combinedEffects = {
      food: 1.0,
      water: 1.0,
      shelter: 1.0,
      goods: 1.0,
      services: 1.0,
      trade: 1.0,
      infrastructure: 1.0
    };

    const investorDetails = [];

    // Process each character's investments
    characters.forEach(character => {
      if (!character.investments || !Array.isArray(character.investments)) {
        return;
      }

      // Filter investments for this specific settlement and active status
      const characterInvestments = character.investments.filter(inv => 
        inv.settlementId === settlement.id && inv.status === 'active'
      );

      if (characterInvestments.length === 0) {
        return; // Skip characters with no relevant investments
      }

      // Get settlement-specific investment effects for this character
      const nestedEffects = CharacterEconomicService.calculateSettlementInvestmentEffects(
        characterInvestments,
        settlement
      );

      // Convert nested structure to flat structure expected by BasicNeedsService
      const characterEffects = this._convertNestedToFlatEffects(nestedEffects);

      if (characterInvestments.length > 0) {
        investorDetails.push({
          characterId: character.id,
          characterName: character.name,
          investments: characterInvestments,
          effects: characterEffects
        });
      }

      // Combine effects multiplicatively for overlapping investments
      Object.keys(characterEffects).forEach(needType => {
        if (combinedEffects.hasOwnProperty(needType)) {
          // Use multiplicative combination to prevent unrealistic stacking
          const currentEffect = combinedEffects[needType];
          const newEffect = characterEffects[needType];
          
          // Apply diminishing returns for multiple investments of same type
          combinedEffects[needType] = this._combineDiminishingEffects(currentEffect, newEffect);
        }
      });
    });

    // Store metadata about who invested what
    combinedEffects._metadata = {
      totalInvestors: investorDetails.length,
      investorDetails: investorDetails,
      settlementId: settlement.id
    };

    return combinedEffects;
  }

  /**
   * Combine multiple investment effects with diminishing returns
   * @param {number} current - Current effect multiplier
   * @param {number} additional - Additional effect multiplier
   * @returns {number} Combined effect with diminishing returns
   * @private
   */
  _combineDiminishingEffects(current, additional) {
    // Convert multipliers to percentage gains
    const currentGain = current - 1.0;
    const additionalGain = additional - 1.0;
    
    // Apply diminishing returns (each additional investment is 70% as effective)
    const combinedGain = currentGain + (additionalGain * 0.7);
    
    // Cap maximum benefit at 50% improvement
    const cappedGain = Math.min(combinedGain, 0.5);
    
    return 1.0 + cappedGain;
  }

  /**
   * Generate investment analysis for the settlement
   * @param {Object} settlement - Settlement being analyzed
   * @param {Array} characters - Characters with investments
   * @param {Object} investmentEffects - Combined investment effects
   * @returns {Object} Investment analysis
   * @private
   */
  _generateInvestmentAnalysis(settlement, characters, investmentEffects) {
    const totalInvestments = characters.reduce((sum, char) => {
      return sum + (char.investments || []).filter(inv => 
        inv.settlementId === settlement.id && inv.status === 'active'
      ).length;
    }, 0);

    const totalInvestmentValue = characters.reduce((sum, char) => {
      return sum + (char.investments || []).filter(inv => 
        inv.settlementId === settlement.id && inv.status === 'active'
      ).reduce((invSum, inv) => invSum + (inv.value || 0), 0);
    }, 0);

    const mostImprovedNeed = this._findMostImprovedNeed(investmentEffects);
    const investmentTypes = this._categorizeInvestmentTypes(characters, settlement.id);

    return {
      totalInvestments,
      totalInvestmentValue,
      activeInvestors: investmentEffects._metadata?.totalInvestors || 0,
      mostImprovedNeed,
      investmentTypes,
      overallEffectiveness: this._calculateOverallEffectiveness(investmentEffects),
      recommendations: this._generateInvestmentRecommendations(settlement, investmentEffects)
    };
  }

  /**
   * Find which need was most improved by investments
   * @param {Object} investmentEffects - Investment effects
   * @returns {Object} Most improved need info
   * @private
   */
  _findMostImprovedNeed(investmentEffects) {
    const needTypes = ['food', 'water', 'shelter', 'goods', 'services'];
    let bestNeed = { type: 'none', improvement: 0.0 };

    needTypes.forEach(needType => {
      const improvement = investmentEffects[needType] - 1.0;
      if (improvement > bestNeed.improvement) {
        bestNeed = { type: needType, improvement };
      }
    });

    return bestNeed;
  }

  /**
   * Categorize investment types in the settlement
   * @param {Array} characters - Characters with investments
   * @param {string} settlementId - Settlement ID
   * @returns {Object} Investment type counts
   * @private
   */
  _categorizeInvestmentTypes(characters, settlementId) {
    const types = {};

    characters.forEach(character => {
      if (!character.investments) return;

      character.investments
        .filter(inv => inv.settlementId === settlementId && inv.status === 'active')
        .forEach(investment => {
          types[investment.type] = (types[investment.type] || 0) + 1;
        });
    });

    return types;
  }

  /**
   * Calculate overall investment effectiveness
   * @param {Object} investmentEffects - Investment effects
   * @returns {number} Overall effectiveness score (0.0-1.0)
   * @private
   */
  _calculateOverallEffectiveness(investmentEffects) {
    const needTypes = ['food', 'water', 'shelter', 'goods', 'services'];
    const improvements = needTypes.map(type => investmentEffects[type] - 1.0);
    const averageImprovement = improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
    
    // Convert to 0-1 scale where 0.5 improvement = 1.0 effectiveness
    return Math.min(1.0, averageImprovement * 2);
  }

  /**
   * Generate investment recommendations
   * @param {Object} settlement - Settlement
   * @param {Object} investmentEffects - Current investment effects
   * @returns {Array} Array of recommendation objects
   * @private
   */
  _generateInvestmentRecommendations(settlement, investmentEffects) {
    const recommendations = [];
    const needTypes = ['food', 'water', 'shelter', 'goods', 'services'];

    // Find areas with least investment
    needTypes.forEach(needType => {
      const currentEffect = investmentEffects[needType];
      if (currentEffect < 1.15) { // Less than 15% improvement
        recommendations.push({
          type: 'underinvested',
          needType,
          priority: this._calculateInvestmentPriority(settlement, needType),
          description: `${needType} production could benefit from additional investment`
        });
      }
    });

    // Check for overcrowding of investments
    needTypes.forEach(needType => {
      const currentEffect = investmentEffects[needType];
      if (currentEffect > 1.4) { // More than 40% improvement - diminishing returns
        recommendations.push({
          type: 'overinvested',
          needType,
          priority: 'low',
          description: `${needType} investments showing diminishing returns, consider diversifying`
        });
      }
    });

    return recommendations;
  }

  /**
   * Calculate investment priority for a need type
   * @param {Object} settlement - Settlement
   * @param {string} needType - Type of need
   * @returns {string} Priority level (high, medium, low)
   * @private
   */
  _calculateInvestmentPriority(settlement, needType) {
    // This is a simplified priority calculation
    // In practice, you'd want to base this on population, current satisfaction levels, etc.
    const population = settlement.population?.total || 0;
    
    if (population > 1000) {
      return 'high'; // Large settlements need all types of investment
    } else if (population > 500) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate historical events related to investments
   * @param {Object} settlement - Settlement
   * @param {Array} characters - Characters with investments
   * @param {Object} needSatisfaction - Need satisfaction results
   * @returns {Array} Array of historical event objects
   * @private
   */
  _generateInvestmentHistoricalEvents(settlement, characters, needSatisfaction) {
    const events = [];
    const investmentEffects = needSatisfaction.investmentEffects || {};
    const overallSatisfaction = needSatisfaction.overall || 0.5;

    // Economic boom events
    if (overallSatisfaction > 0.7 && Object.values(investmentEffects).some(effect => effect > 1.1)) {
      events.push({
        id: `economic_boom_${settlement.id}_${Date.now()}`,
        type: 'economic_boom',
        settlement: settlement.id,
        description: `Economic prosperity flourishes in ${settlement.name} due to successful investments`,
        impact: 'positive',
        significance: 'major',
        involvedCharacters: characters.filter(c => c.investments?.some(inv => 
          inv.settlementId === settlement.id && inv.status === 'active'
        )).map(c => c.id),
        effects: {
          populationGrowth: 0.15,
          tradeIncrease: 0.25,
          stabilityBonus: 0.2
        },
        timestamp: new Date()
      });
    }

    // Infrastructure development events
    if (investmentEffects.shelter > 1.15 || investmentEffects.water > 1.1) {
      events.push({
        id: `infrastructure_development_${settlement.id}_${Date.now()}`,
        type: 'infrastructure_development',
        settlement: settlement.id,
        description: `Major infrastructure improvements transform ${settlement.name}`,
        impact: 'positive',
        significance: 'moderate',
        involvedCharacters: characters.filter(c => c.investments?.some(inv => 
          inv.settlementId === settlement.id && inv.type === 'infrastructure'
        )).map(c => c.id),
        effects: {
          buildingEfficiency: 0.2,
          qualityOfLife: 0.15
        },
        timestamp: new Date()
      });
    }

    // Trade network expansion events
    if (investmentEffects.trade > 1.25) {
      events.push({
        id: `trade_expansion_${settlement.id}_${Date.now()}`,
        type: 'trade_expansion',
        settlement: settlement.id,
        description: `Trade networks expand from ${settlement.name} to distant markets`,
        impact: 'positive',
        significance: 'moderate',
        involvedCharacters: characters.filter(c => c.investments?.some(inv => 
          inv.settlementId === settlement.id && inv.type === 'trade_route'
        )).map(c => c.id),
        effects: {
          tradeVolume: 0.3,
          wealthIncrease: 0.2
        },
        timestamp: new Date()
      });
    }

    // Economic crisis events (when investments don't help enough)
    if (overallSatisfaction < 0.3 && Object.keys(investmentEffects).length > 0) {
      events.push({
        id: `investment_crisis_${settlement.id}_${Date.now()}`,
        type: 'investment_crisis',
        settlement: settlement.id,
        description: `Despite investments, economic hardship persists in ${settlement.name}`,
        impact: 'negative',
        significance: 'major',
        involvedCharacters: characters.filter(c => c.investments?.some(inv => 
          inv.settlementId === settlement.id
        )).map(c => c.id),
        effects: {
          investorConfidence: -0.3,
          socialUnrest: 0.2
        },
        timestamp: new Date()
      });
    }

    return events;
  }

  /**
   * Update settlement resources based on investment effects
   * @param {Object} settlement - Settlement to update
   * @param {Object} investmentEffects - Investment effects to apply
   * @returns {Object} Updated settlement with investment effects applied
   */
  applyInvestmentEffectsToSettlement(settlement, investmentEffects) {
    try {
      this._validateSettlement(settlement);
      
      const updatedSettlement = JSON.parse(JSON.stringify(settlement)); // Deep clone

      // Apply resource multipliers
      if (updatedSettlement.resources && updatedSettlement.resources.production) {
        const production = updatedSettlement.resources.production;
        
        // Apply food production effects
        if (production.food && investmentEffects.food > 1.0) {
          production.food *= investmentEffects.food;
        }
        
        // Apply water production effects
        if (production.water && investmentEffects.water > 1.0) {
          production.water *= investmentEffects.water;
        }
        
        // Apply goods production effects
        if (production.goods && investmentEffects.goods > 1.0) {
          production.goods *= investmentEffects.goods;
        }
      }

      // Apply building efficiency improvements
      if (updatedSettlement.buildings && investmentEffects.infrastructure > 1.0) {
        updatedSettlement.buildings.forEach(building => {
          // Infrastructure investments improve all building efficiency slightly
          building.efficiency = (building.efficiency || 1.0) * Math.min(1.2, investmentEffects.infrastructure);
        });
      }

      // Apply trade improvements
      if (updatedSettlement.economy && updatedSettlement.economy.trade && investmentEffects.trade > 1.0) {
        updatedSettlement.economy.trade.forEach(trade => {
          trade.efficiency = (trade.efficiency || 1.0) * Math.min(1.3, investmentEffects.trade);
        });
      }

      return updatedSettlement;
    } catch (error) {
      console.error('Failed to apply investment effects to settlement:', error);
      return settlement; // Return original if update fails
    }
  }

  /**
   * Convert nested investment effects to flat structure expected by BasicNeedsService
   * @param {Object} nestedEffects - Nested effects from CharacterEconomicService
   * @returns {Object} Flat effects structure
   * @private
   */
  _convertNestedToFlatEffects(nestedEffects) {
    const flatEffects = {};
    
    // Convert each need type from nested to flat structure
    Object.keys(nestedEffects).forEach(needType => {
      const needEffects = nestedEffects[needType];
      
      // Combine production, efficiency, and availability effects multiplicatively
      // All effects start at 1.0, so we multiply them together
      let effectValue = 1.0;
      
      if (needEffects.production && needEffects.production > 1.0) {
        effectValue *= needEffects.production;
      }
      if (needEffects.availability && needEffects.availability > 1.0) {
        effectValue *= needEffects.availability;
      }
      if (needEffects.efficiency && needEffects.efficiency > 1.0) {
        effectValue *= needEffects.efficiency;
      }
      
      flatEffects[needType] = effectValue;
    });
    
    return flatEffects;
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
      throw new Error('Settlement must have an id');
    }
    if (!settlement.name) {
      throw new Error('Settlement must have a name');
    }
    if (!settlement.population || typeof settlement.population.total !== 'number') {
      throw new Error('Settlement must have valid population data');
    }
  }

  /**
   * Validate characters array
   * @param {Array} characters - Characters to validate
   * @private
   */
  _validateCharacters(characters) {
    if (!Array.isArray(characters)) {
      throw new Error('Characters must be an array');
    }
    
    characters.forEach((character, index) => {
      if (!character.id) {
        throw new Error(`Character at index ${index} must have an id`);
      }
      if (character.investments && !Array.isArray(character.investments)) {
        throw new Error(`Character at index ${index} investments must be an array`);
      }
    });
  }

  /**
   * Get default result for error cases
   * @param {Object} settlement - Settlement
   * @returns {Object} Default result
   * @private
   */
  _getDefaultResult(settlement) {
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
        originalValues: { goods: 0.5, services: 0.5 }
      },
      investmentEffects: {},
      investmentAnalysis: {
        totalInvestments: 0,
        totalInvestmentValue: 0,
        activeInvestors: 0,
        mostImprovedNeed: { type: 'none', improvement: 0.0 },
        investmentTypes: {},
        overallEffectiveness: 0.0,
        recommendations: []
      },
      historicalEvents: []
    };
  }
}
