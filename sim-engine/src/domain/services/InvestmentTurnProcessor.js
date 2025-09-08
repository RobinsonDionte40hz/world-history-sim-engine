// src/domain/services/InvestmentTurnProcessor.js

import BaseDomainService from './BaseDomainService.js';
import SettlementInvestmentIntegrationService from './SettlementInvestmentIntegrationService.js';

/**
 * Service for processing investment effects during turn progression
 * Integrates with TurnManager to apply investment effects each turn
 */
export default class InvestmentTurnProcessor extends BaseDomainService {

  constructor() {
    super();
    this.investmentIntegrationService = new SettlementInvestmentIntegrationService();
  }

  /**
   * Process all investment effects for the current turn
   * @param {Object} worldState - Current world state
   * @returns {Object} Updated world state with investment effects applied
   */
  processInvestmentTurn(worldState) {
    try {
      this._validateWorldState(worldState);
      
      const updatedWorldState = JSON.parse(JSON.stringify(worldState)); // Deep clone
      const turnResults = {
        investmentEvents: [],
        settlementUpdates: [],
        characterEffects: [],
        economicChanges: []
      };

      // Process each settlement with active investments
      const settlementsWithInvestments = this._findSettlementsWithInvestments(updatedWorldState);
      
      settlementsWithInvestments.forEach(({ settlement, investors }) => {
        const settlementResults = this._processSettlementInvestments(settlement, investors, updatedWorldState);
        
        // Apply results to world state
        this._applySettlementResults(updatedWorldState, settlement.id, settlementResults);
        
        // Collect turn results
        turnResults.investmentEvents.push(...settlementResults.events);
        turnResults.settlementUpdates.push(settlementResults.settlementUpdate);
        turnResults.characterEffects.push(...settlementResults.characterEffects);
        turnResults.economicChanges.push(...settlementResults.economicChanges);
      });

      // Process investment maturation and returns
      const maturationResults = this._processInvestmentMaturation(updatedWorldState);
      turnResults.investmentEvents.push(...maturationResults.events);
      turnResults.characterEffects.push(...maturationResults.characterEffects);

      // Update world economic state
      this._updateWorldEconomicState(updatedWorldState, turnResults);

      return {
        worldState: updatedWorldState,
        turnResults
      };
    } catch (error) {
      console.error('Investment turn processing failed:', error);
      return {
        worldState,
        turnResults: {
          investmentEvents: [],
          settlementUpdates: [],
          characterEffects: [],
          economicChanges: [],
          error: error.message
        }
      };
    }
  }

  /**
   * Find settlements that have active investments
   * @param {Object} worldState - World state
   * @returns {Array} Array of {settlement, investors} objects
   * @private
   */
  _findSettlementsWithInvestments(worldState) {
    const settlementInvestmentMap = new Map();

    // Group investments by settlement
    worldState.characters.forEach(character => {
      if (!character.investments) return;

      character.investments
        .filter(inv => inv.status === 'active')
        .forEach(investment => {
          const settlementId = investment.settlementId;
          
          if (!settlementInvestmentMap.has(settlementId)) {
            settlementInvestmentMap.set(settlementId, []);
          }
          
          settlementInvestmentMap.get(settlementId).push(character);
        });
    });

    // Find corresponding settlements and create result objects
    const results = [];
    for (const [settlementId, investors] of settlementInvestmentMap) {
      const settlement = worldState.settlements.find(s => s.id === settlementId);
      if (settlement) {
        results.push({ settlement, investors });
      }
    }

    return results;
  }

  /**
   * Process investments for a specific settlement
   * @param {Object} settlement - Settlement object
   * @param {Array} investors - Characters with investments in this settlement
   * @param {Object} worldState - Current world state
   * @returns {Object} Settlement processing results
   * @private
   */
  _processSettlementInvestments(settlement, investors, worldState) {
    // Calculate investment-affected needs
    const needsAnalysis = this.investmentIntegrationService.calculateInvestmentAffectedNeeds(
      settlement,
      investors
    );

    // Apply investment effects to settlement
    const updatedSettlement = this.investmentIntegrationService.applyInvestmentEffectsToSettlement(
      settlement,
      needsAnalysis.investmentEffects
    );

    // Generate character effects from investment consequences
    const characterEffects = this._generateCharacterEffectsFromInvestments(
      investors,
      needsAnalysis,
      settlement
    );

    // Generate economic changes
    const economicChanges = this._generateEconomicChanges(
      settlement,
      needsAnalysis.investmentEffects,
      needsAnalysis.investmentAnalysis
    );

    return {
      needsAnalysis,
      settlementUpdate: {
        settlementId: settlement.id,
        originalSettlement: settlement,
        updatedSettlement,
        improvementMetrics: this._calculateImprovementMetrics(settlement, updatedSettlement)
      },
      events: needsAnalysis.historicalEvents,
      characterEffects,
      economicChanges
    };
  }

  /**
   * Generate character effects from investment outcomes
   * @param {Array} investors - Investor characters
   * @param {Object} needsAnalysis - Needs analysis results
   * @param {Object} settlement - Settlement object
   * @returns {Array} Character effect objects
   * @private
   */
  _generateCharacterEffectsFromInvestments(investors, needsAnalysis, settlement) {
    const characterEffects = [];

    investors.forEach(character => {
      const characterInvestments = character.investments.filter(inv => 
        inv.settlementId === settlement.id && inv.status === 'active'
      );

      if (characterInvestments.length === 0) return;

      const effect = {
        characterId: character.id,
        source: 'investment_returns',
        effects: {}
      };

      // Calculate investment returns based on settlement performance
      const overallSatisfaction = needsAnalysis.overall;
      const investmentEffectiveness = needsAnalysis.investmentAnalysis.overallEffectiveness;

      // Generate income from investments
      const investmentIncome = this._calculateInvestmentIncome(
        characterInvestments,
        overallSatisfaction,
        investmentEffectiveness
      );

      if (investmentIncome > 0) {
        effect.effects.wealth = investmentIncome;
        effect.effects.income = investmentIncome;
      }

      // Mood effects based on investment success
      const moodModifier = this._calculateInvestmentMoodEffect(
        overallSatisfaction,
        investmentEffectiveness
      );

      if (moodModifier !== 0) {
        effect.effects.mood = moodModifier;
      }

      // Reputation effects for successful investors
      if (investmentEffectiveness > 0.7) {
        effect.effects.reputation = Math.floor(investmentEffectiveness * 10);
      }

      // Only add effect if there are actual effects
      if (Object.keys(effect.effects).length > 0) {
        characterEffects.push(effect);
      }
    });

    return characterEffects;
  }

  /**
   * Calculate investment income for a character
   * @param {Array} investments - Character's investments
   * @param {number} settlementSatisfaction - Overall settlement satisfaction
   * @param {number} effectiveness - Investment effectiveness
   * @returns {number} Income amount
   * @private
   */
  _calculateInvestmentIncome(investments, settlementSatisfaction, effectiveness) {
    let totalIncome = 0;

    investments.forEach(investment => {
      // Base return rate depends on investment type and cost
      const baseReturn = (investment.cost || 0) * 0.05; // 5% base return

      // Modify by settlement satisfaction (better settlements = better returns)
      const satisfactionMultiplier = 0.5 + (settlementSatisfaction * 1.5); // 0.5 to 2.0

      // Modify by investment effectiveness
      const effectivenessMultiplier = 0.5 + (effectiveness * 1.0); // 0.5 to 1.5

      const income = baseReturn * satisfactionMultiplier * effectivenessMultiplier;
      totalIncome += income;
    });

    return Math.round(totalIncome);
  }

  /**
   * Calculate mood effect from investment performance
   * @param {number} satisfaction - Settlement satisfaction
   * @param {number} effectiveness - Investment effectiveness
   * @returns {number} Mood modifier
   * @private
   */
  _calculateInvestmentMoodEffect(satisfaction, effectiveness) {
    const combinedPerformance = (satisfaction + effectiveness) / 2;
    
    if (combinedPerformance > 0.8) {
      return 15; // Very positive
    } else if (combinedPerformance > 0.6) {
      return 10; // Positive
    } else if (combinedPerformance > 0.4) {
      return 0; // Neutral
    } else if (combinedPerformance > 0.2) {
      return -10; // Negative
    } else {
      return -20; // Very negative
    }
  }

  /**
   * Generate economic changes from investments
   * @param {Object} settlement - Settlement
   * @param {Object} investmentEffects - Investment effects
   * @param {Object} investmentAnalysis - Investment analysis
   * @returns {Array} Economic change objects
   * @private
   */
  _generateEconomicChanges(settlement, investmentEffects, investmentAnalysis) {
    const changes = [];

    // Population growth from successful investments
    if (investmentAnalysis.overallEffectiveness > 0.6) {
      const growthRate = investmentAnalysis.overallEffectiveness * 0.02; // Up to 2% growth
      changes.push({
        type: 'population_growth',
        settlementId: settlement.id,
        change: growthRate,
        reason: 'investment_prosperity'
      });
    }

    // Trade volume changes
    if (investmentEffects.trade > 1.1) {
      const tradeIncrease = (investmentEffects.trade - 1.0) * 0.3; // Convert to trade volume increase
      changes.push({
        type: 'trade_volume_increase',
        settlementId: settlement.id,
        change: tradeIncrease,
        reason: 'trade_investment'
      });
    }

    // Resource production changes
    ['food', 'water', 'goods'].forEach(resourceType => {
      if (investmentEffects[resourceType] > 1.05) {
        const increase = (investmentEffects[resourceType] - 1.0) * 0.5;
        changes.push({
          type: 'resource_production_increase',
          settlementId: settlement.id,
          resourceType,
          change: increase,
          reason: `${resourceType}_investment`
        });
      }
    });

    return changes;
  }

  /**
   * Process investment maturation and lifecycle
   * @param {Object} worldState - World state
   * @returns {Object} Maturation processing results
   * @private
   */
  _processInvestmentMaturation(worldState) {
    const events = [];
    const characterEffects = [];

    worldState.characters.forEach(character => {
      if (!character.investments) return;

      character.investments.forEach(investment => {
        // Increment investment age
        investment.age = (investment.age || 0) + 1;

        // Check for investment maturation
        if (this._shouldInvestmentMature(investment)) {
          const maturationResult = this._matureInvestment(investment, character);
          
          if (maturationResult.event) {
            events.push(maturationResult.event);
          }
          
          if (maturationResult.characterEffect) {
            characterEffects.push(maturationResult.characterEffect);
          }
        }

        // Check for investment failure
        if (this._shouldInvestmentFail(investment)) {
          const failureResult = this._failInvestment(investment, character);
          
          if (failureResult.event) {
            events.push(failureResult.event);
          }
          
          if (failureResult.characterEffect) {
            characterEffects.push(failureResult.characterEffect);
          }
        }
      });
    });

    return { events, characterEffects };
  }

  /**
   * Check if investment should mature
   * @param {Object} investment - Investment object
   * @returns {boolean} Should mature
   * @private
   */
  _shouldInvestmentMature(investment) {
    const maturityAge = investment.maturityAge || 20; // Default 20 turns
    return investment.age >= maturityAge && investment.status === 'active';
  }

  /**
   * Check if investment should fail
   * @param {Object} investment - Investment object
   * @returns {boolean} Should fail
   * @private
   */
  _shouldInvestmentFail(investment) {
    // Random failure chance increases with age
    const age = investment.age || 0;
    const failureChance = Math.min(0.05, age * 0.001); // Max 5% chance
    return Math.random() < failureChance && investment.status === 'active';
  }

  /**
   * Mature an investment
   * @param {Object} investment - Investment to mature
   * @param {Object} character - Owner character
   * @returns {Object} Maturation result
   * @private
   */
  _matureInvestment(investment, character) {
    investment.status = 'matured';
    
    const event = {
      id: `investment_matured_${investment.id}_${Date.now()}`,
      type: 'investment_matured',
      description: `${character.name}'s ${investment.type} investment has reached full maturity`,
      characterId: character.id,
      investmentId: investment.id,
      settlementId: investment.settlementId
    };

    const characterEffect = {
      characterId: character.id,
      source: 'investment_maturation',
      effects: {
        wealth: investment.cost * 0.5, // 50% bonus on maturation
        experience: 10
      }
    };

    return { event, characterEffect };
  }

  /**
   * Fail an investment
   * @param {Object} investment - Investment to fail
   * @param {Object} character - Owner character
   * @returns {Object} Failure result
   * @private
   */
  _failInvestment(investment, character) {
    investment.status = 'failed';
    
    const event = {
      id: `investment_failed_${investment.id}_${Date.now()}`,
      type: 'investment_failed',
      description: `${character.name}'s ${investment.type} investment has failed`,
      characterId: character.id,
      investmentId: investment.id,
      settlementId: investment.settlementId
    };

    const characterEffect = {
      characterId: character.id,
      source: 'investment_failure',
      effects: {
        mood: -25,
        stress: 15
      }
    };

    return { event, characterEffect };
  }

  /**
   * Apply settlement processing results to world state
   * @param {Object} worldState - World state to update
   * @param {string} settlementId - Settlement ID
   * @param {Object} results - Processing results
   * @private
   */
  _applySettlementResults(worldState, settlementId, results) {
    // Update settlement in world state
    const settlementIndex = worldState.settlements.findIndex(s => s.id === settlementId);
    if (settlementIndex !== -1) {
      worldState.settlements[settlementIndex] = results.settlementUpdate.updatedSettlement;
    }

    // Apply character effects
    results.characterEffects.forEach(effect => {
      const character = worldState.characters.find(c => c.id === effect.characterId);
      if (character) {
        this._applyCharacterEffect(character, effect);
      }
    });
  }

  /**
   * Apply character effect
   * @param {Object} character - Character to update
   * @param {Object} effect - Effect to apply
   * @private
   */
  _applyCharacterEffect(character, effect) {
    Object.keys(effect.effects).forEach(effectType => {
      const value = effect.effects[effectType];
      
      switch (effectType) {
        case 'wealth':
        case 'income':
          character.wealth = (character.wealth || 0) + value;
          break;
        case 'mood':
          character.mood = Math.max(0, Math.min(100, (character.mood || 50) + value));
          break;
        case 'reputation':
          character.reputation = (character.reputation || 0) + value;
          break;
        case 'experience':
          character.experience = (character.experience || 0) + value;
          break;
        case 'stress':
          character.stress = Math.max(0, Math.min(100, (character.stress || 0) + value));
          break;
        default:
          console.warn(`Unknown character effect type: ${effectType}`);
          break;
      }
    });
  }

  /**
   * Calculate improvement metrics between settlement states
   * @param {Object} original - Original settlement
   * @param {Object} updated - Updated settlement
   * @returns {Object} Improvement metrics
   * @private
   */
  _calculateImprovementMetrics(original, updated) {
    const metrics = {};

    // Calculate resource improvements
    if (original.resources && updated.resources) {
      if (original.resources.production && updated.resources.production) {
        ['food', 'water', 'goods'].forEach(resource => {
          const originalValue = original.resources.production[resource] || 0;
          const updatedValue = updated.resources.production[resource] || 0;
          if (originalValue > 0) {
            metrics[`${resource}_improvement`] = (updatedValue - originalValue) / originalValue;
          }
        });
      }
    }

    // Calculate building efficiency improvements
    if (original.buildings && updated.buildings) {
      const originalEfficiency = original.buildings.reduce((sum, b) => sum + (b.efficiency || 1.0), 0) / original.buildings.length;
      const updatedEfficiency = updated.buildings.reduce((sum, b) => sum + (b.efficiency || 1.0), 0) / updated.buildings.length;
      
      if (originalEfficiency > 0) {
        metrics.building_efficiency_improvement = (updatedEfficiency - originalEfficiency) / originalEfficiency;
      }
    }

    return metrics;
  }

  /**
   * Update world economic state
   * @param {Object} worldState - World state to update
   * @param {Object} turnResults - Turn processing results
   * @private
   */
  _updateWorldEconomicState(worldState, turnResults) {
    // Aggregate economic changes by type
    const aggregatedChanges = {};
    
    turnResults.economicChanges.forEach(change => {
      const key = `${change.type}_${change.settlementId}`;
      if (!aggregatedChanges[key]) {
        aggregatedChanges[key] = { ...change, change: 0 };
      }
      aggregatedChanges[key].change += change.change;
    });

    // Apply aggregated changes to world state
    Object.values(aggregatedChanges).forEach(change => {
      this._applyEconomicChange(worldState, change);
    });
  }

  /**
   * Apply economic change to world state
   * @param {Object} worldState - World state
   * @param {Object} change - Economic change
   * @private
   */
  _applyEconomicChange(worldState, change) {
    const settlement = worldState.settlements.find(s => s.id === change.settlementId);
    if (!settlement) return;

    switch (change.type) {
      case 'population_growth':
        settlement.population.total = Math.round(settlement.population.total * (1 + change.change));
        break;
      case 'trade_volume_increase':
        if (settlement.economy && settlement.economy.trade) {
          settlement.economy.trade.forEach(trade => {
            trade.value = Math.round(trade.value * (1 + change.change));
          });
        }
        break;
      case 'resource_production_increase':
        if (settlement.resources && settlement.resources.production) {
          const currentValue = settlement.resources.production[change.resourceType] || 0;
          settlement.resources.production[change.resourceType] = Math.round(currentValue * (1 + change.change));
        }
        break;
      default:
        console.warn(`Unknown economic change type: ${change.type}`);
        break;
    }
  }

  /**
   * Validate world state structure
   * @param {Object} worldState - World state to validate
   * @private
   */
  _validateWorldState(worldState) {
    if (!worldState) {
      throw new Error('World state is required');
    }
    if (!Array.isArray(worldState.settlements)) {
      throw new Error('World state must have settlements array');
    }
    if (!Array.isArray(worldState.characters)) {
      throw new Error('World state must have characters array');
    }
  }
}
