// src/application/services/SettlementEconomyService.js

import BasicNeedsService from '../../domain/services/BasicNeedsService.js';
import NeedConsequenceService from '../../domain/services/NeedConsequenceService.js';
import { ValidationError } from '../../shared/types/ValueObjectTypes.js';

/**
 * SettlementEconomyService - Application service for multi-settlement economic coordination
 *
 * This service orchestrates economic interactions between multiple settlements,
 * detecting regional effects and calculating migration pressures based on
 * need satisfaction levels across settlements.
 *
 * Responsibilities:
 * - Batch processing of multiple settlement need calculations
 * - Regional effect detection for settlements in crisis
 * - Settlement comparison and migration pressure calculations
 * - Economic coordination between settlements
 */
class SettlementEconomyService {
  constructor(basicNeedsService, needConsequenceService) {
    this.basicNeedsService = basicNeedsService || new BasicNeedsService();
    this.needConsequenceService = needConsequenceService || new NeedConsequenceService();
  }

  // ==================== BATCH PROCESSING ====================

  /**
   * Process need satisfaction calculations for multiple settlements
   * @param {Array} settlements - Array of settlement objects
   * @returns {Object} Batch processing results
   */
  processSettlementsBatch(settlements) {
    try {
      if (!Array.isArray(settlements)) {
        throw new ValidationError('settlements', settlements, 'Settlements must be an array');
      }

      const results = {
        processed: [],
        failed: [],
        summary: {
          totalSettlements: settlements.length,
          successful: 0,
          failed: 0,
          averageSatisfaction: 0,
          crisisCount: 0
        }
      };

      let totalSatisfaction = 0;

      for (let i = 0; i < settlements.length; i++) {
        const settlement = settlements[i];

        try {
          const satisfactionResult = this.basicNeedsService.calculateSatisfactionLevel(settlement);
          const consequences = this.needConsequenceService.generateConsequences(settlement, satisfactionResult);

          results.processed.push({
            index: i,
            settlementId: settlement.id,
            settlementName: settlement.name,
            satisfaction: satisfactionResult,
            consequences: consequences,
            isInCrisis: satisfactionResult.overall < 0.4
          });

          totalSatisfaction += satisfactionResult.overall;
          if (satisfactionResult.overall < 0.4) {
            results.summary.crisisCount++;
          }

          results.summary.successful++;

        } catch (error) {
          results.failed.push({
            index: i,
            settlementId: settlement.id || 'unknown',
            settlementName: settlement.name || 'unknown',
            error: error.message
          });

          results.summary.failed++;
        }
      }

      if (results.summary.successful > 0) {
        results.summary.averageSatisfaction = totalSatisfaction / results.summary.successful;
      }

      return results;

    } catch (error) {
      console.error('Error in batch settlement processing:', error);
      throw new ValidationError('batchProcessing', settlements, `Batch processing failed: ${error.message}`);
    }
  }

  /**
   * Process settlements with regional effect detection
   * @param {Array} settlements - Array of settlement objects
   * @param {Object} options - Processing options
   * @returns {Object} Processing results with regional effects
   */
  processSettlementsWithRegionalEffects(settlements, options = {}) {
    const batchResults = this.processSettlementsBatch(settlements);

    // Detect regional effects
    const regionalEffects = this._detectRegionalEffects(batchResults.processed);

    // Calculate migration pressures
    const migrationPressures = this._calculateMigrationPressures(batchResults.processed);

    return {
      ...batchResults,
      regionalEffects,
      migrationPressures,
      recommendations: this._generateRegionalRecommendations(regionalEffects, migrationPressures, options)
    };
  }

  // ==================== REGIONAL EFFECT DETECTION ====================

  /**
   * Detect regional effects from settlement processing results
   * @param {Array} processedSettlements - Array of processed settlement results
   * @returns {Object} Regional effects analysis
   */
  _detectRegionalEffects(processedSettlements) {
    const crisisSettlements = processedSettlements.filter(s => s.isInCrisis);
    const totalSettlements = processedSettlements.length;

    const effects = {
      hasRegionalCrisis: false,
      crisisSeverity: 'none',
      affectedSettlements: crisisSettlements.length,
      crisisPercentage: (crisisSettlements.length / totalSettlements) * 100,
      dominantNeedDeficits: this._analyzeDominantDeficits(crisisSettlements),
      regionalRisks: []
    };

    // Determine if there's a regional crisis
    if (effects.crisisPercentage >= 50) {
      effects.hasRegionalCrisis = true;
      effects.crisisSeverity = effects.crisisPercentage >= 75 ? 'severe' : 'moderate';
    }

    // Identify regional risks
    if (effects.hasRegionalCrisis) {
      effects.regionalRisks.push({
        type: 'mass_migration',
        severity: effects.crisisSeverity,
        description: `${effects.crisisPercentage.toFixed(1)}% of settlements in crisis may trigger mass migration`
      });

      if (effects.dominantNeedDeficits.includes('food')) {
        effects.regionalRisks.push({
          type: 'famine_region',
          severity: 'high',
          description: 'Multiple settlements experiencing food shortages may lead to regional famine'
        });
      }

      if (effects.dominantNeedDeficits.includes('water')) {
        effects.regionalRisks.push({
          type: 'water_crisis_region',
          severity: 'high',
          description: 'Regional water shortages may cause widespread disease and conflict'
        });
      }
    }

    return effects;
  }

  /**
   * Analyze dominant need deficits across crisis settlements
   * @param {Array} crisisSettlements - Settlements in crisis
   * @returns {Array} Array of dominant deficit types
   */
  _analyzeDominantDeficits(crisisSettlements) {
    if (crisisSettlements.length === 0) return [];

    const deficitCounts = {
      food: 0,
      water: 0,
      shelter: 0,
      goods: 0,
      services: 0
    };

    crisisSettlements.forEach(settlement => {
      Object.entries(settlement.satisfaction.needs).forEach(([need, satisfaction]) => {
        if (satisfaction < 0.5) {
          deficitCounts[need]++;
        }
      });
    });

    // Return needs that are deficient in more than 50% of crisis settlements
    const threshold = crisisSettlements.length * 0.5;
    return Object.entries(deficitCounts)
      .filter(([, count]) => count > threshold)
      .map(([need]) => need);
  }

  // ==================== MIGRATION PRESSURE CALCULATIONS ====================

  /**
   * Calculate migration pressures between settlements
   * @param {Array} processedSettlements - Array of processed settlement results
   * @returns {Object} Migration pressure analysis
   */
  _calculateMigrationPressures(processedSettlements) {
    const pressures = {
      totalPressure: 0,
      settlementPressures: [],
      migrationRoutes: [],
      highRiskSettlements: []
    };

    // Calculate individual settlement migration pressures
    processedSettlements.forEach(settlement => {
      const pressure = this._calculateSettlementMigrationPressure(settlement, processedSettlements);

      pressures.settlementPressures.push({
        settlementId: settlement.settlementId,
        settlementName: settlement.settlementName,
        migrationPressure: pressure,
        isHighRisk: pressure > 0.7
      });

      pressures.totalPressure += pressure;

      if (pressure > 0.7) {
        pressures.highRiskSettlements.push(settlement.settlementId);
      }
    });

    // Calculate migration routes between settlements
    pressures.migrationRoutes = this._calculateMigrationRoutes(processedSettlements);

    return pressures;
  }

  /**
   * Calculate migration pressure for a single settlement
   * @param {Object} settlement - Processed settlement data
   * @param {Array} allSettlements - All processed settlements
   * @returns {number} Migration pressure score (0-1)
   */
  _calculateSettlementMigrationPressure(settlement, allSettlements) {
    const satisfaction = settlement.satisfaction.overall;
    const crisisMultiplier = settlement.isInCrisis ? 2.0 : 1.0;

    // Base pressure from low satisfaction
    let pressure = Math.max(0, (0.6 - satisfaction) * 2.5);

    // Factor in population size (larger settlements create more pressure)
    const populationFactor = Math.min(settlement.population?.total || 0, 1000) / 1000;
    pressure *= (0.5 + populationFactor * 0.5);

    // Apply crisis multiplier
    pressure *= crisisMultiplier;

    // Factor in available destination settlements
    const availableDestinations = allSettlements.filter(s =>
      s.settlementId !== settlement.settlementId &&
      s.satisfaction.overall > 0.7
    ).length;

    if (availableDestinations === 0) {
      pressure *= 1.5; // Increased pressure when no good destinations
    } else {
      pressure *= (1.0 - availableDestinations * 0.1); // Reduced pressure with more options
    }

    return Math.min(1.0, Math.max(0, pressure));
  }

  /**
   * Calculate potential migration routes between settlements
   * @param {Array} processedSettlements - Array of processed settlements
   * @returns {Array} Array of migration route objects
   */
  _calculateMigrationRoutes(processedSettlements) {
    const routes = [];

    // Sort settlements by satisfaction (destinations first)
    const destinations = processedSettlements
      .filter(s => s.satisfaction.overall > 0.7)
      .sort((a, b) => b.satisfaction.overall - a.satisfaction.overall);

    const sources = processedSettlements
      .filter(s => s.satisfaction.overall < 0.6)
      .sort((a, b) => a.satisfaction.overall - b.satisfaction.overall);

    // Calculate routes from sources to destinations
    sources.forEach(source => {
      destinations.forEach(destination => {
        const distance = this._calculateSettlementDistance(source.settlement, destination.settlement);
        const attractiveness = destination.satisfaction.overall - source.satisfaction.overall;
        const pressure = source.isInCrisis ? 1.5 : 1.0;

        if (attractiveness > 0.2) {
          routes.push({
            fromSettlementId: source.settlementId,
            toSettlementId: destination.settlementId,
            distance,
            attractiveness,
            migrationPressure: pressure * attractiveness,
            estimatedMigrants: Math.floor((source.settlement.population?.total || 0) * pressure * attractiveness * 0.1)
          });
        }
      });
    });

    return routes.sort((a, b) => b.migrationPressure - a.migrationPressure);
  }

  /**
   * Calculate approximate distance between settlements
   * @param {Object} settlementA - First settlement
   * @param {Object} settlementB - Second settlement
   * @returns {number} Approximate distance
   */
  _calculateSettlementDistance(settlementA, settlementB) {
    // Simple distance calculation based on settlement properties
    // In a real implementation, this would use actual coordinates
    const factors = {
      sameRegion: 10,
      differentRegion: 50,
      hasTradeRoute: -20,
      hasRoad: -10
    };

    let distance = factors.differentRegion; // Default distance

    // Check for trade connections (simplified)
    const hasTradeConnection = settlementA.economy?.trade?.some(trade =>
      trade.connectedSettlementId === settlementB.id
    ) || settlementB.economy?.trade?.some(trade =>
      trade.connectedSettlementId === settlementA.id
    );

    if (hasTradeConnection) {
      distance += factors.hasTradeRoute;
    }

    return Math.max(1, distance);
  }

  // ==================== REGIONAL RECOMMENDATIONS ====================

  /**
   * Generate regional recommendations based on effects and pressures
   * @param {Object} regionalEffects - Regional effects analysis
   * @param {Object} migrationPressures - Migration pressure analysis
   * @param {Object} options - Generation options
   * @returns {Array} Array of recommendation objects
   */
  _generateRegionalRecommendations(regionalEffects, migrationPressures, options) {
    const recommendations = [];

    if (regionalEffects.hasRegionalCrisis) {
      recommendations.push({
        type: 'regional_crisis_response',
        priority: regionalEffects.crisisSeverity === 'severe' ? 'high' : 'medium',
        title: 'Regional Crisis Management',
        description: `Implement coordinated response for ${regionalEffects.affectedSettlements} settlements in crisis`,
        actions: [
          'Establish regional trade agreements',
          'Coordinate resource distribution',
          'Implement migration management policies'
        ]
      });
    }

    if (migrationPressures.highRiskSettlements.length > 0) {
      recommendations.push({
        type: 'migration_management',
        priority: 'high',
        title: 'Migration Pressure Relief',
        description: `${migrationPressures.highRiskSettlements.length} settlements at high migration risk`,
        actions: [
          'Create migration corridors to stable settlements',
          'Implement population relief programs',
          'Monitor migration routes for conflicts'
        ]
      });
    }

    if (regionalEffects.regionalRisks.length > 0) {
      regionalEffects.regionalRisks.forEach(risk => {
        recommendations.push({
          type: 'risk_mitigation',
          priority: risk.severity === 'high' ? 'high' : 'medium',
          title: `${risk.type.replace('_', ' ').toUpperCase()} Mitigation`,
          description: risk.description,
          actions: [
            'Monitor affected settlements closely',
            'Prepare contingency resources',
            'Coordinate with neighboring regions'
          ]
        });
      });
    }

    return recommendations;
  }

  // ==================== SETTLEMENT COMPARISON ====================

  /**
   * Compare settlements for economic analysis
   * @param {Array} settlements - Array of settlements to compare
   * @returns {Object} Comparison results
   */
  compareSettlements(settlements) {
    try {
      if (!Array.isArray(settlements) || settlements.length < 2) {
        throw new ValidationError('settlements', settlements, 'At least 2 settlements required for comparison');
      }

      const processed = settlements.map(settlement => ({
        settlement,
        satisfaction: this.basicNeedsService.calculateSatisfactionLevel(settlement)
      }));

      return {
        settlements: processed,
        rankings: this._rankSettlementsByNeed(processed),
        economicGaps: this._calculateEconomicGaps(processed),
        tradeOpportunities: this._identifyTradeOpportunities(processed)
      };

    } catch (error) {
      console.error('Error comparing settlements:', error);
      throw new ValidationError('settlementComparison', settlements, `Settlement comparison failed: ${error.message}`);
    }
  }

  /**
   * Rank settlements by need satisfaction levels
   * @param {Array} processedSettlements - Array of processed settlement data
   * @returns {Object} Rankings by need type
   */
  _rankSettlementsByNeed(processedSettlements) {
    const rankings = {
      overall: [],
      byNeed: {
        food: [],
        water: [],
        shelter: [],
        goods: [],
        services: []
      }
    };

    // Overall ranking
    rankings.overall = processedSettlements
      .map(p => ({
        settlementId: p.settlement.id,
        settlementName: p.settlement.name,
        satisfaction: p.satisfaction.overall
      }))
      .sort((a, b) => b.satisfaction - a.satisfaction);

    // Rankings by individual needs
    Object.keys(rankings.byNeed).forEach(need => {
      rankings.byNeed[need] = processedSettlements
        .map(p => ({
          settlementId: p.settlement.id,
          settlementName: p.settlement.name,
          satisfaction: p.satisfaction.needs[need]
        }))
        .sort((a, b) => b.satisfaction - a.satisfaction);
    });

    return rankings;
  }

  /**
   * Calculate economic gaps between settlements
   * @param {Array} processedSettlements - Array of processed settlement data
   * @returns {Array} Array of economic gap objects
   */
  _calculateEconomicGaps(processedSettlements) {
    const gaps = [];

    for (let i = 0; i < processedSettlements.length; i++) {
      for (let j = i + 1; j < processedSettlements.length; j++) {
        const settlementA = processedSettlements[i];
        const settlementB = processedSettlements[j];

        const gap = {
          settlementA: {
            id: settlementA.settlement.id,
            name: settlementA.settlement.name,
            satisfaction: settlementA.satisfaction.overall
          },
          settlementB: {
            id: settlementB.settlement.id,
            name: settlementB.settlement.name,
            satisfaction: settlementB.satisfaction.overall
          },
          satisfactionGap: Math.abs(settlementA.satisfaction.overall - settlementB.satisfaction.overall),
          needGaps: {}
        };

        // Calculate gaps for individual needs
        Object.keys(settlementA.satisfaction.needs).forEach(need => {
          gap.needGaps[need] = Math.abs(
            settlementA.satisfaction.needs[need] - settlementB.satisfaction.needs[need]
          );
        });

        gaps.push(gap);
      }
    }

    return gaps.sort((a, b) => b.satisfactionGap - a.satisfactionGap);
  }

  /**
   * Identify trade opportunities between settlements
   * @param {Array} processedSettlements - Array of processed settlement data
   * @returns {Array} Array of trade opportunity objects
   */
  _identifyTradeOpportunities(processedSettlements) {
    const opportunities = [];

    processedSettlements.forEach(settlementA => {
      processedSettlements.forEach(settlementB => {
        if (settlementA.settlement.id === settlementB.settlement.id) return;

        const opportunity = {
          fromSettlement: {
            id: settlementA.settlement.id,
            name: settlementA.settlement.name
          },
          toSettlement: {
            id: settlementB.settlement.id,
            name: settlementB.settlement.name
          },
          potentialTrades: []
        };

        // Identify complementary needs
        Object.entries(settlementA.satisfaction.needs).forEach(([needA, satisfactionA]) => {
          const satisfactionB = settlementB.satisfaction.needs[needA];

          if (satisfactionA > 0.8 && satisfactionB < 0.6) {
            opportunity.potentialTrades.push({
              resource: needA,
              fromSurplus: satisfactionA,
              toDeficit: satisfactionB,
              tradeValue: (satisfactionA - satisfactionB) * 0.5
            });
          }
        });

        if (opportunity.potentialTrades.length > 0) {
          opportunities.push(opportunity);
        }
      });
    });

    return opportunities.sort((a, b) =>
      b.potentialTrades.reduce((sum, trade) => sum + trade.tradeValue, 0) -
      a.potentialTrades.reduce((sum, trade) => sum + trade.tradeValue, 0)
    );
  }

  // ==================== VALIDATION ====================

  /**
   * Validate settlement data for economic processing
   * @param {Object} settlement - Settlement to validate
   * @returns {Object} Validation result
   */
  validateSettlementForEconomics(settlement) {
    try {
      const errors = [];
      const warnings = [];

      if (!settlement || typeof settlement !== 'object') {
        errors.push('Settlement must be a valid object');
        return { success: false, errors, warnings };
      }

      if (!settlement.id) {
        errors.push('Settlement must have a valid id');
      }

      if (!settlement.name) {
        errors.push('Settlement must have a valid name');
      }

      if (!settlement.population || typeof settlement.population.total !== 'number') {
        warnings.push('Settlement population data may be incomplete');
      }

      if (!settlement.resources) {
        warnings.push('Settlement resources data is missing');
      }

      if (!Array.isArray(settlement.buildings)) {
        warnings.push('Settlement buildings data is not an array');
      }

      return {
        success: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        success: false,
        errors: [`Validation failed: ${error.message}`],
        warnings: []
      };
    }
  }
}

export default SettlementEconomyService;
