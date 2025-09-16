// src/domain/services/SettlementService.js

import BaseDomainService from './BaseDomainService.js';

/**
 * Service for managing settlement need satisfaction tracking and updates
 * Extends BaseDomainService for consistent validation and error handling
 */
export default class SettlementService extends BaseDomainService {
  /**
   * Initialize need satisfaction tracking for a new settlement
   * @param {Object} settlement - Settlement object to initialize
   * @returns {Object} Settlement with initialized need satisfaction data
   */
  initializeNeedSatisfaction(settlement) {
    try {
      this._validateSettlement(settlement);

      const now = Date.now();
      const initializedSettlement = {
        ...settlement,
        needSatisfaction: {
          current: {
            food: 0.5, // Default moderate satisfaction
            water: 0.5,
            shelter: 0.5,
            goods: 0.5,
            services: 0.5,
            overall: 0.5,
            lastCalculated: now
          },
          history: [],
          trends: {
            food: 0,
            water: 0,
            shelter: 0,
            goods: 0,
            services: 0,
            overall: 0
          },
          activeConsequences: []
        }
      };

      return initializedSettlement;
    } catch (error) {
      console.error('Failed to initialize need satisfaction:', error);
      throw error;
    }
  }

  /**
   * Update settlement need satisfaction with new calculation results
   * @param {Object} settlement - Settlement to update
   * @param {NeedSatisfactionResult} satisfactionResult - New satisfaction calculation results
   * @param {string[]} consequenceIds - Array of active consequence IDs
   * @param {string[]} eventIds - Array of historical event IDs generated
   * @returns {Object} Updated settlement with new need satisfaction data
   */
  updateNeedSatisfaction(settlement, satisfactionResult, consequenceIds = [], eventIds = []) {
    try {
      this._validateSettlement(settlement);
      this._validateSatisfactionResult(satisfactionResult);

      const now = Date.now();
      const previousSatisfaction = settlement.needSatisfaction?.current;

      // Create new history entry
      const historyEntry = {
        timestamp: now,
        needs: { ...satisfactionResult.needs },
        overall: satisfactionResult.overall,
        consequences: [...consequenceIds],
        events: [...eventIds]
      };

      // Calculate trends based on previous data
      const trends = this._calculateTrends(previousSatisfaction, satisfactionResult);

      // Update active consequences
      const activeConsequences = this._updateActiveConsequences(
        settlement.needSatisfaction?.activeConsequences || [],
        satisfactionResult.consequences
      );

      const updatedSettlement = {
        ...settlement,
        needSatisfaction: {
          current: {
            food: satisfactionResult.needs.food,
            water: satisfactionResult.needs.water,
            shelter: satisfactionResult.needs.shelter,
            goods: satisfactionResult.needs.goods,
            services: satisfactionResult.needs.services,
            overall: satisfactionResult.overall,
            lastCalculated: now
          },
          history: [
            ...(settlement.needSatisfaction?.history || []),
            historyEntry
          ].slice(-100), // Keep last 100 entries
          trends,
          activeConsequences
        }
      };

      return updatedSettlement;
    } catch (error) {
      console.error('Failed to update need satisfaction:', error);
      throw error;
    }
  }

  /**
   * Get current need satisfaction levels for a settlement
   * @param {Object} settlement - Settlement to get satisfaction for
   * @returns {Object} Current need satisfaction data
   */
  getCurrentNeedSatisfaction(settlement) {
    try {
      this._validateSettlement(settlement);

      if (!settlement.needSatisfaction?.current) {
        return this._getDefaultSatisfaction();
      }

      return { ...settlement.needSatisfaction.current };
    } catch (error) {
      console.error('Failed to get current need satisfaction:', error);
      return this._getDefaultSatisfaction();
    }
  }

  /**
   * Get need satisfaction history for a settlement
   * @param {Object} settlement - Settlement to get history for
   * @param {number} [limit=50] - Maximum number of history entries to return
   * @returns {NeedSatisfactionHistory[]} Array of historical satisfaction data
   */
  getNeedSatisfactionHistory(settlement, limit = 50) {
    try {
      this._validateSettlement(settlement);

      if (!settlement.needSatisfaction?.history) {
        return [];
      }

      return settlement.needSatisfaction.history
        .slice(-limit)
        .map(entry => ({
          ...entry,
          needs: { ...entry.needs },
          consequences: [...entry.consequences],
          events: [...entry.events]
        }));
    } catch (error) {
      console.error('Failed to get need satisfaction history:', error);
      return [];
    }
  }

  /**
   * Get need satisfaction trends for a settlement
   * @param {Object} settlement - Settlement to get trends for
   * @returns {NeedSatisfactionTrends} Current trend data
   */
  getNeedSatisfactionTrends(settlement) {
    try {
      this._validateSettlement(settlement);

      if (!settlement.needSatisfaction?.trends) {
        return this._getDefaultTrends();
      }

      return { ...settlement.needSatisfaction.trends };
    } catch (error) {
      console.error('Failed to get need satisfaction trends:', error);
      return this._getDefaultTrends();
    }
  }

  /**
   * Get active consequences for a settlement
   * @param {Object} settlement - Settlement to get consequences for
   * @returns {Array} Array of active consequence objects
   */
  getActiveConsequences(settlement) {
    try {
      this._validateSettlement(settlement);

      if (!settlement.needSatisfaction?.activeConsequences) {
        return [];
      }

      return settlement.needSatisfaction.activeConsequences
        .filter(consequence => !consequence.resolved)
        .map(consequence => ({
          ...consequence,
          triggers: [...consequence.triggers]
        }));
    } catch (error) {
      console.error('Failed to get active consequences:', error);
      return [];
    }
  }

  /**
   * Resolve a consequence for a settlement
   * @param {Object} settlement - Settlement to update
   * @param {string} consequenceId - ID of consequence to resolve
   * @param {number} [resolutionDate] - Date when consequence was resolved (defaults to now)
   * @returns {Object} Updated settlement with resolved consequence
   */
  resolveConsequence(settlement, consequenceId, resolutionDate = Date.now()) {
    try {
      this._validateSettlement(settlement);
      const validationError = BaseDomainService.validateRequired('consequenceId', consequenceId);
      if (validationError) {
        throw new Error(validationError.message);
      }

      if (!settlement.needSatisfaction?.activeConsequences) {
        return settlement;
      }

      const updatedConsequences = settlement.needSatisfaction.activeConsequences.map(consequence => {
        if (consequence.id === consequenceId) {
          return {
            ...consequence,
            resolved: true,
            endDate: resolutionDate
          };
        }
        return consequence;
      });

      return {
        ...settlement,
        needSatisfaction: {
          ...settlement.needSatisfaction,
          activeConsequences: updatedConsequences
        }
      };
    } catch (error) {
      console.error('Failed to resolve consequence:', error);
      throw error;
    }
  }

  /**
   * Validate settlement structure for need satisfaction operations
   * @private
   */
  _validateSettlement(settlement) {
    if (!settlement || typeof settlement !== 'object') {
      throw new Error('Settlement must be a valid object');
    }

    if (!settlement.id || typeof settlement.id !== 'string') {
      throw new Error('Settlement must have a valid id');
    }

    if (!settlement.name || typeof settlement.name !== 'string') {
      throw new Error('Settlement must have a valid name');
    }
  }

  /**
   * Validate need satisfaction result structure
   * @private
   */
  _validateSatisfactionResult(satisfactionResult) {
    if (!satisfactionResult || typeof satisfactionResult !== 'object') {
      throw new Error('Satisfaction result must be a valid object');
    }

    const requiredNeeds = ['food', 'water', 'shelter', 'goods', 'services'];
    for (const need of requiredNeeds) {
      if (typeof satisfactionResult.needs?.[need] !== 'number' || 
          satisfactionResult.needs[need] < 0 || 
          satisfactionResult.needs[need] > 1) {
        throw new Error(`Need satisfaction for ${need} must be a number between 0 and 1`);
      }
    }

    if (typeof satisfactionResult.overall !== 'number' || 
        satisfactionResult.overall < 0 || 
        satisfactionResult.overall > 1) {
      throw new Error('Overall satisfaction must be a number between 0 and 1');
    }
  }

  /**
   * Calculate trends based on previous and current satisfaction data
   * @private
   */
  _calculateTrends(previousSatisfaction, currentSatisfaction) {
    const needTypes = ['food', 'water', 'shelter', 'goods', 'services'];
    const trends = {};

    for (const need of needTypes) {
      const previous = previousSatisfaction?.[need] || 0.5;
      const current = currentSatisfaction.needs[need];
      trends[need] = this._roundToPrecision(current - previous, 10);
    }

    const previousOverall = previousSatisfaction?.overall || 0.5;
    const currentOverall = currentSatisfaction.overall;
    trends.overall = this._roundToPrecision(currentOverall - previousOverall, 10);

    return trends;
  }

  /**
   * Round number to specified decimal places to avoid floating point precision issues
   * @private
   */
  _roundToPrecision(number, precision) {
    return Math.round(number * Math.pow(10, precision)) / Math.pow(10, precision);
  }

  /**
   * Update active consequences list with new consequences
   * @private
   */
  _updateActiveConsequences(existingConsequences, newConsequences) {
    const activeConsequences = [...existingConsequences];

    // Add new consequences
    for (const consequence of newConsequences) {
      const existingIndex = activeConsequences.findIndex(c => c.id === consequence.id);
      if (existingIndex >= 0) {
        // Update existing consequence
        activeConsequences[existingIndex] = {
          ...consequence,
          resolved: false
        };
      } else {
        // Add new consequence
        activeConsequences.push({
          id: consequence.id,
          type: consequence.type,
          severity: consequence.severity,
          startDate: consequence.startDate,
          duration: consequence.duration,
          triggers: consequence.triggers,
          resolved: false
        });
      }
    }

    // Remove resolved consequences that have expired
    const now = Date.now();
    return activeConsequences.filter(consequence => {
      if (consequence.resolved) {
        return false; // Remove resolved consequences
      }
      
      // Remove consequences that have exceeded their duration
      if (consequence.startDate && consequence.duration) {
        const endDate = consequence.startDate + (consequence.duration * 24 * 60 * 60 * 1000); // Convert days to ms
        return now < endDate;
      }
      
      return true;
    });
  }

  /**
   * Get default satisfaction values
   * @private
   */
  _getDefaultSatisfaction() {
    return {
      food: 0.5,
      water: 0.5,
      shelter: 0.5,
      goods: 0.5,
      services: 0.5,
      overall: 0.5,
      lastCalculated: Date.now()
    };
  }

  /**
   * Get default trend values
   * @private
   */
  _getDefaultTrends() {
    return {
      food: 0,
      water: 0,
      shelter: 0,
      goods: 0,
      services: 0,
      overall: 0
    };
  }
}
