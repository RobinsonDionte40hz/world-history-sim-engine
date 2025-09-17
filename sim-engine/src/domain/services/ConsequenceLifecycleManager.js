// src/domain/services/ConsequenceLifecycleManager.js

import BaseDomainService from './BaseDomainService.js';
import NeedConsequenceService from './NeedConsequenceService.js';

/**
 * Service for managing the lifecycle of need satisfaction consequences
 * Handles consequence tracking, aging, resolution detection, and cleanup
 */
class ConsequenceLifecycleManager extends BaseDomainService {

  /**
   * Initialize the consequence lifecycle manager
   */
  constructor() {
    super();
    this.needConsequenceService = new NeedConsequenceService();
    this.playerActionTracker = new PlayerActionTracker();
    this.triggerDetectionService = new TriggerDetectionService();
  }

  /**
   * Process consequence lifecycle for all settlements in a turn
   * @param {Array} settlements - Array of settlement objects
   * @param {Object} playerActions - Player actions that occurred this turn
   * @returns {Object} Processing results with resolved/expired consequences
   */
  processConsequenceLifecycle(settlements, playerActions = {}) {
    this._validateInputs(settlements);

    const results = {
      processedSettlements: [],
      resolvedConsequences: [],
      expiredConsequences: [],
      triggeredActions: [],
      summary: {
        totalActiveConsequences: 0,
        newlyResolved: 0,
        newlyExpired: 0,
        playerTriggeredResolutions: 0
      }
    };

    // Process each settlement's consequences
    settlements.forEach(settlement => {
      const settlementResults = this._processSettlementConsequences(
        settlement,
        playerActions[settlement.id] || []
      );

      results.processedSettlements.push(settlementResults.settlement);
      results.resolvedConsequences.push(...settlementResults.resolved);
      results.expiredConsequences.push(...settlementResults.expired);
      results.triggeredActions.push(...settlementResults.triggeredActions);

      // Update summary
      results.summary.totalActiveConsequences += settlementResults.activeCount;
      results.summary.newlyResolved += settlementResults.resolved.length;
      results.summary.newlyExpired += settlementResults.expired.length;
      results.summary.playerTriggeredResolutions += settlementResults.playerResolutions;
    });

    // Generate summary text
    results.summary.description = this._generateProcessingSummary(results.summary);

    return results;
  }

  /**
   * Add new consequences to a settlement
   * @param {Object} settlement - Settlement to add consequences to
   * @param {Array} newConsequences - Array of new consequence objects
   * @returns {Object} Updated settlement with new consequences
   */
  addConsequencesToSettlement(settlement, newConsequences) {
    this._validateSettlement(settlement);
    this._validateConsequences(newConsequences);

    const updatedSettlement = { ...settlement };

    // Initialize needSatisfaction if it doesn't exist
    if (!updatedSettlement.needSatisfaction) {
      updatedSettlement.needSatisfaction = {
        current: {},
        history: [],
        trends: {},
        activeConsequences: []
      };
    }

    // Initialize activeConsequences if it doesn't exist
    if (!updatedSettlement.needSatisfaction.activeConsequences) {
      updatedSettlement.needSatisfaction.activeConsequences = [];
    }

    // Add new consequences with lifecycle metadata
    const consequencesWithMetadata = newConsequences.map(consequence => ({
      ...consequence,
      lifecycle: {
        addedAt: new Date(),
        lastProcessed: new Date(),
        age: 0,
        resolutionAttempts: 0,
        playerActions: []
      }
    }));

    updatedSettlement.needSatisfaction.activeConsequences.push(...consequencesWithMetadata);

    return updatedSettlement;
  }

  /**
   * Manually resolve a consequence through player action
   * @param {Object} settlement - Settlement containing the consequence
   * @param {string} consequenceId - ID of the consequence to resolve
   * @param {string} playerAction - Description of the player action
   * @returns {Object} Updated settlement with resolved consequence
   */
  resolveConsequenceManually(settlement, consequenceId, playerAction) {
    this._validateSettlement(settlement);

    const updatedSettlement = { ...settlement };
    const consequences = updatedSettlement.needSatisfaction?.activeConsequences || [];

    const consequenceIndex = consequences.findIndex(c => c.id === consequenceId);
    if (consequenceIndex === -1) {
      throw new Error(`Consequence with ID ${consequenceId} not found`);
    }

    const consequence = consequences[consequenceIndex];

    // Ensure lifecycle object exists
    if (!consequence.lifecycle) {
      consequence.lifecycle = {
        addedAt: new Date(),
        lastProcessed: new Date(),
        age: 0,
        resolutionAttempts: 0,
        playerActions: []
      };
    }

    // Mark as resolved
    consequence.resolved = true;
    consequence.endDate = new Date();
    consequence.lifecycle.resolvedBy = 'player_action';
    consequence.lifecycle.resolvingAction = playerAction;

    // Track the player action
    this.playerActionTracker.trackAction(settlement.id, {
      type: 'consequence_resolution',
      consequenceId: consequenceId,
      consequenceType: consequence.type,
      action: playerAction,
      timestamp: new Date()
    });

    return updatedSettlement;
  }

  /**
   * Get consequence statistics for a settlement
   * @param {Object} settlement - Settlement to analyze
   * @returns {Object} Consequence statistics
   */
  getConsequenceStatistics(settlement) {
    try {
      this._validateSettlement(settlement);

      const consequences = settlement.needSatisfaction?.activeConsequences || [];
      const now = new Date();

      const stats = {
        total: consequences.length,
        byType: {},
        bySeverity: { low: 0, medium: 0, high: 0 },
        byAge: { recent: 0, medium: 0, old: 0 },
        resolved: 0,
        expired: 0,
        averageSeverity: 0,
        oldestConsequence: null,
        newestConsequence: null
      };

      let totalSeverity = 0;

      consequences.forEach(consequence => {
        // Count by type
        stats.byType[consequence.type] = (stats.byType[consequence.type] || 0) + 1;

        // Count by severity
        if (consequence.severity < 0.33) stats.bySeverity.low++;
        else if (consequence.severity < 0.66) stats.bySeverity.medium++;
        else stats.bySeverity.high++;

        // Count by age
        const age = consequence.lifecycle?.age || 0;
        if (age < 3) stats.byAge.recent++;
        else if (age < 8) stats.byAge.medium++;
        else stats.byAge.old++;

        // Track resolved/expired
        if (consequence.resolved) stats.resolved++;
        if (this._isExpired(consequence, now)) stats.expired++;

        // Track severity
        totalSeverity += consequence.severity;

        // Track oldest/newest
        const startDate = new Date(consequence.startDate);
        if (!stats.oldestConsequence || startDate < new Date(stats.oldestConsequence.startDate)) {
          stats.oldestConsequence = consequence;
        }
        if (!stats.newestConsequence || startDate > new Date(stats.newestConsequence.startDate)) {
          stats.newestConsequence = consequence;
        }
      });

      stats.averageSeverity = consequences.length > 0 ? totalSeverity / consequences.length : 0;

      return stats;
    } catch (error) {
      console.error('Failed to get consequence statistics:', error);
      return this._getDefaultStatistics();
    }
  }

  /**
   * Clean up resolved and expired consequences from a settlement
   * @param {Object} settlement - Settlement to clean up
   * @returns {Object} Cleanup results
   */
  cleanupResolvedConsequences(settlement) {
    try {
      this._validateSettlement(settlement);

      const updatedSettlement = { ...settlement };
      const consequences = updatedSettlement.needSatisfaction?.activeConsequences || [];

      const now = new Date();
      const activeConsequences = [];
      const cleanedConsequences = [];

      consequences.forEach(consequence => {
        if (consequence.resolved || this._isExpired(consequence, now)) {
          cleanedConsequences.push({
            ...consequence,
            cleanupDate: now,
            cleanupReason: consequence.resolved ? 'resolved' : 'expired'
          });
        } else {
          activeConsequences.push(consequence);
        }
      });

      updatedSettlement.needSatisfaction.activeConsequences = activeConsequences;

      return {
        settlement: updatedSettlement,
        cleanedCount: cleanedConsequences.length,
        cleanedConsequences: cleanedConsequences
      };
    } catch (error) {
      console.error('Failed to cleanup resolved consequences:', error);
      return {
        settlement: settlement,
        cleanedCount: 0,
        cleanedConsequences: []
      };
    }
  }

  // Private methods for processing settlement consequences

  /**
   * Process consequences for a single settlement
   * @private
   */
  _processSettlementConsequences(settlement, playerActions) {
    const updatedSettlement = { ...settlement };
    const consequences = updatedSettlement.needSatisfaction?.activeConsequences || [];

    const results = {
      settlement: updatedSettlement,
      resolved: [],
      expired: [],
      triggeredActions: [],
      activeCount: 0,
      playerResolutions: 0
    };

    const now = new Date();

    consequences.forEach((consequence, index) => {
      // Age the consequence
      if (!consequence.lifecycle) {
        consequence.lifecycle = { age: 0, lastProcessed: now };
      }
      consequence.lifecycle.age = (now - new Date(consequence.startDate)) / (1000 * 60 * 60 * 24); // Age in days
      consequence.lifecycle.lastProcessed = now;

      // Check for player-triggered resolution
      const playerResolution = this._checkPlayerResolution(consequence, playerActions);
      if (playerResolution) {
        consequence.resolved = true;
        consequence.endDate = now;
        consequence.lifecycle.resolvedBy = 'player_action';
        consequence.lifecycle.resolvingAction = playerResolution.action;
        results.resolved.push(consequence);
        results.playerResolutions++;
        results.triggeredActions.push(playerResolution);
        return;
      }

      // Check for automatic resolution
      if (this.needConsequenceService.canResolveConsequence(consequence, settlement)) {
        const resolvedConsequence = this.needConsequenceService.resolveConsequence(consequence, settlement);
        results.resolved.push(resolvedConsequence);
        Object.assign(consequence, resolvedConsequence);
        return;
      }

      // Check for expiration
      if (this._isExpired(consequence, now)) {
        results.expired.push(consequence);
        return;
      }

      // Still active
      results.activeCount++;
    });

    return results;
  }

  /**
   * Check if a consequence can be resolved by player actions
   * @private
   */
  _checkPlayerResolution(consequence, playerActions) {
    if (!playerActions || playerActions.length === 0) return null;

    for (const action of playerActions) {
      if (this.triggerDetectionService.checkPlayerActionTrigger(consequence, action)) {
        return {
          consequenceId: consequence.id,
          action: action,
          timestamp: new Date()
        };
      }
    }

    return null;
  }

  /**
   * Check if a consequence has expired
   * @private
   */
  _isExpired(consequence, currentTime) {
    if (!consequence.duration) return false;

    const startTime = new Date(consequence.startDate);
    const ageInTurns = (currentTime - startTime) / (1000 * 60 * 60 * 24); // Simplified to days

    return ageInTurns > consequence.duration;
  }

  // Validation methods

  /**
   * Validate inputs for lifecycle processing
   * @private
   */
  _validateInputs(settlements) {
    if (!Array.isArray(settlements)) {
      throw new Error('Settlements must be an array');
    }

    settlements.forEach(settlement => {
      this._validateSettlement(settlement);
    });
  }

  /**
   * Validate a settlement object
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
   * Validate consequence objects
   * @private
   */
  _validateConsequences(consequences) {
    if (!Array.isArray(consequences)) {
      throw new Error('Consequences must be an array');
    }

    consequences.forEach(consequence => {
      if (!consequence || typeof consequence !== 'object') {
        throw new Error('Consequence must be a valid object');
      }

      if (!consequence.id || typeof consequence.id !== 'string') {
        throw new Error('Consequence must have a valid id');
      }

      if (!consequence.type || typeof consequence.type !== 'string') {
        throw new Error('Consequence must have a valid type');
      }
    });
  }

  // Utility methods

  /**
   * Generate processing summary text
   * @private
   */
  _generateProcessingSummary(summary) {
    const parts = [];

    if (summary.totalActiveConsequences > 0) {
      parts.push(`${summary.totalActiveConsequences} active consequence${summary.totalActiveConsequences > 1 ? 's' : ''}`);
    }

    if (summary.newlyResolved > 0) {
      parts.push(`${summary.newlyResolved} resolved`);
    }

    if (summary.newlyExpired > 0) {
      parts.push(`${summary.newlyExpired} expired`);
    }

    if (summary.playerTriggeredResolutions > 0) {
      parts.push(`${summary.playerTriggeredResolutions} player-triggered`);
    }

    return parts.length > 0 ? parts.join(', ') : 'No consequences processed';
  }

  /**
   * Get default processing results for error cases
   * @private
   */
  _getDefaultProcessingResults() {
    return {
      processedSettlements: [],
      resolvedConsequences: [],
      expiredConsequences: [],
      triggeredActions: [],
      summary: {
        totalActiveConsequences: 0,
        newlyResolved: 0,
        newlyExpired: 0,
        playerTriggeredResolutions: 0,
        description: 'Processing failed'
      }
    };
  }

  /**
   * Get default statistics for error cases
   * @private
   */
  _getDefaultStatistics() {
    return {
      total: 0,
      byType: {},
      bySeverity: { low: 0, medium: 0, high: 0 },
      byAge: { recent: 0, medium: 0, old: 0 },
      resolved: 0,
      expired: 0,
      averageSeverity: 0,
      oldestConsequence: null,
      newestConsequence: null
    };
  }
}

/**
 * Service for tracking player actions that might resolve consequences
 */
class PlayerActionTracker {

  constructor() {
    this.actionHistory = new Map(); // settlementId -> actions array
    this.maxHistorySize = 100;
  }

  /**
   * Track a player action
   */
  trackAction(settlementId, action) {
    if (!this.actionHistory.has(settlementId)) {
      this.actionHistory.set(settlementId, []);
    }

    const actions = this.actionHistory.get(settlementId);
    actions.push(action);

    // Maintain history size
    if (actions.length > this.maxHistorySize) {
      actions.shift();
    }
  }

  /**
   * Get recent actions for a settlement
   */
  getRecentActions(settlementId, limit = 10) {
    const actions = this.actionHistory.get(settlementId) || [];
    return actions.slice(-limit);
  }

  /**
   * Check if a settlement has performed a specific action recently
   */
  hasPerformedAction(settlementId, actionType, timeWindow = 30) {
    const actions = this.getRecentActions(settlementId, 50);
    const cutoffTime = new Date(Date.now() - (timeWindow * 24 * 60 * 60 * 1000));

    return actions.some(action =>
      action.type === actionType &&
      new Date(action.timestamp) > cutoffTime
    );
  }
}

/**
 * Service for detecting when consequence resolution triggers are met
 */
class TriggerDetectionService {

  /**
   * Check if a player action can resolve a consequence
   */
  checkPlayerActionTrigger(consequence, playerAction) {
    if (!consequence.triggers || !playerAction) return false;

    const actionType = playerAction.type || playerAction;

    return consequence.triggers.some(trigger =>
      this._matchesTrigger(trigger, actionType, playerAction)
    );
  }

  /**
   * Check if settlement conditions meet a resolution trigger
   */
  checkSettlementTrigger(consequence, settlement) {
    if (!consequence.triggers) return false;

    return consequence.triggers.some(trigger =>
      this._checkSettlementCondition(trigger, settlement)
    );
  }

  /**
   * Check if a trigger matches a player action
   * @private
   */
  _matchesTrigger(trigger, actionType, playerAction) {
    // Direct action matches
    if (trigger === actionType) return true;

    // Pattern matching for complex actions
    switch (trigger) {
      case 'successful_harvest':
        return actionType === 'agriculture' || actionType === 'farm_improvement';
      case 'food_trade_agreement':
        return actionType === 'trade' && playerAction.resources?.includes('food');
      case 'build_aqueduct':
        return actionType === 'construction' && playerAction.buildingType === 'aqueduct';
      case 'find_water_source':
        return actionType === 'exploration' && playerAction.discovery === 'water_source';
      case 'water_trade_deal':
        return actionType === 'trade' && playerAction.resources?.includes('water');
      case 'build_housing':
        return actionType === 'construction' && playerAction.buildingType === 'house';
      case 'expand_settlement':
        return actionType === 'expansion' || actionType === 'territory_expansion';
      case 'establish_trade_routes':
        return actionType === 'trade' && playerAction.action === 'establish_routes';
      case 'build_workshops':
        return actionType === 'construction' && playerAction.buildingType === 'workshop';
      case 'craft_mastery':
        return actionType === 'crafting' && playerAction.level > 2;
      case 'build_temple':
        return actionType === 'construction' && playerAction.buildingType === 'temple';
      case 'establish_school':
        return actionType === 'construction' && playerAction.buildingType === 'school';
      case 'train_healers':
        return actionType === 'training' && playerAction.specialty === 'healing';
      default:
        return false;
    }
  }

  /**
   * Check if settlement conditions meet a trigger
   * @private
   */
  _checkSettlementCondition(trigger, settlement) {
    // This would check actual settlement state
    // Simplified implementation - in real system would check buildings, resources, etc.
    switch (trigger) {
      case 'successful_harvest':
        return settlement.resources?.production?.food > 80;
      case 'food_trade_agreement':
        return settlement.economy?.trade?.some(trade => trade.resources?.food > 10);
      case 'population_reduction':
        return settlement.population?.total < 50;
      case 'build_aqueduct':
        return settlement.buildings?.some(building => building.type === 'aqueduct');
      case 'find_water_source':
        return settlement.territory?.features?.some(feature => feature.type === 'water_source');
      case 'water_trade_deal':
        return settlement.economy?.trade?.some(trade => trade.resources?.water > 0);
      case 'build_housing':
        return this._hasAdequateHousing(settlement);
      case 'expand_settlement':
        return settlement.territory?.size > 100;
      case 'establish_trade_routes':
        return settlement.economy?.trade?.length > 2;
      case 'build_workshops':
        return settlement.buildings?.some(building => building.type === 'workshop');
      case 'craft_mastery':
        return settlement.buildings?.some(building => building.type === 'workshop' && building.level > 2);
      case 'build_temple':
        return settlement.buildings?.some(building => building.type === 'temple');
      case 'establish_school':
        return settlement.buildings?.some(building => building.type === 'school');
      case 'train_healers':
        return settlement.buildings?.some(building => building.type === 'healer');
      default:
        return false;
    }
  }

  /**
   * Check if settlement has adequate housing
   * @private
   */
  _hasAdequateHousing(settlement) {
    const housingCapacity = settlement.buildings
      ?.filter(building => building.type === 'house')
      ?.reduce((total, building) => total + (building.level || 1) * 4, 0) || 0;
    return housingCapacity >= settlement.population?.total * 0.9;
  }
}

export default ConsequenceLifecycleManager;
