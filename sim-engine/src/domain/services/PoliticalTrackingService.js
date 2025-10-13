// src/domain/services/PoliticalTrackingService.js

import BaseDomainService from './BaseDomainService.js';
import { PoliticalEvent } from '../entities/PoliticalEvent.js';
import { PoliticalRelationship } from '../value-objects/PoliticalRelationship.js';

/**
 * Service for tracking political events, relationships, and leadership changes
 * Manages political history and diplomatic relationships between settlements
 */
export class PoliticalTrackingService extends BaseDomainService {
  constructor() {
    super();
    this.politicalEvents = new Map(); // eventId -> PoliticalEvent
    this.leadershipHistory = new Map(); // settlementId -> leadership records
    this.diplomaticRelationships = new Map(); // relationshipKey -> PoliticalRelationship
  }

  /**
   * Record a leadership change event
   * @param {Object} settlement - Settlement where leadership changed
   * @param {Object} oldLeader - Previous leader (can be null)
   * @param {Object} newLeader - New leader
   * @param {string} reason - Reason for the change
   * @param {Object} metadata - Additional metadata
   * @returns {PoliticalEvent} The created political event
   */
  recordLeadershipChange(settlement, oldLeader, newLeader, reason = 'election', metadata = {}) {
    this._validateSettlement(settlement);
    this._validateCharacter(newLeader);

    // Create the political event
    const event = PoliticalEvent.createLeadershipChange(settlement, oldLeader, newLeader, reason);

    // Store the event
    this.politicalEvents.set(event.id, event);

    // Update leadership history for the settlement
    this._updateLeadershipHistory(settlement.id, {
      eventId: event.id,
      timestamp: event.timestamp,
      oldLeaderId: oldLeader?.id || null,
      newLeaderId: newLeader.id,
      reason: reason,
      tenure: oldLeader ? this._calculateTenure(settlement.id, oldLeader.id) : 0
    });

    // Update character political influence
    this._updateCharacterPoliticalInfluence(newLeader.id, 'leadership_change', event.significance);

    // Generate and store effects
    const effects = this._generateLeadershipChangeEffects(settlement, oldLeader, newLeader, reason);
    event.metadata.effects = effects;

    return event;
  }

  /**
   * Update diplomatic relationship between two settlements
   * @param {Object} settlement1 - First settlement
   * @param {Object} settlement2 - Second settlement
   * @param {string} newStatus - New diplomatic status
   * @param {string} reason - Reason for the change
   * @param {Object} metadata - Additional metadata
   * @returns {PoliticalEvent} The created political event
   */
  updateDiplomaticRelationship(settlement1, settlement2, newStatus, reason = 'negotiation', metadata = {}) {
    this._validateSettlement(settlement1);
    this._validateSettlement(settlement2);

    // Get or create the relationship
    const relationshipKey = this._getRelationshipKey(settlement1.id, settlement2.id);
    let relationship = this.diplomaticRelationships.get(relationshipKey);

    if (!relationship) {
      relationship = new PoliticalRelationship({
        settlement1Id: settlement1.id,
        settlement2Id: settlement2.id,
        status: 'neutral'
      });
    }

    const oldStatus = relationship.status;

    // Create the political event
    const event = PoliticalEvent.createDiplomaticShift(settlement1, settlement2, oldStatus, newStatus, reason);

    // Store the event
    this.politicalEvents.set(event.id, event);

    // Update the relationship
    const updatedRelationship = relationship.changeStatus(newStatus, reason, event.timestamp);
    this.diplomaticRelationships.set(relationshipKey, updatedRelationship);

    // Update trust level based on status change
    const trustChange = this._calculateTrustChange(oldStatus, newStatus);
    if (trustChange !== 0) {
      const relationshipWithTrust = updatedRelationship.updateTrust(trustChange, reason, event.timestamp);
      this.diplomaticRelationships.set(relationshipKey, relationshipWithTrust);
    }

    return event;
  }

  /**
   * Get leadership history for a settlement
   * @param {string} settlementId - Settlement ID
   * @param {Object} options - Query options
   * @returns {Array} Leadership history records
   */
  getLeadershipHistory(settlementId, options = {}) {
    const history = this.leadershipHistory.get(settlementId) || [];
    return this._filterHistoryByTimeRange(history, options.startDate, options.endDate);
  }

  /**
   * Get diplomatic history between two settlements
   * @param {string} settlement1Id - First settlement ID
   * @param {string} settlement2Id - Second settlement ID
   * @param {Object} options - Query options
   * @returns {Array} Diplomatic history records
   */
  getDiplomaticHistory(settlement1Id, settlement2Id, options = {}) {
    const relationshipKey = this._getRelationshipKey(settlement1Id, settlement2Id);
    const relationship = this.diplomaticRelationships.get(relationshipKey);

    if (!relationship) {
      return [];
    }

    return this._filterHistoryByTimeRange(relationship.statusHistory, options.startDate, options.endDate);
  }

  /**
   * Get current diplomatic relationship between two settlements
   * @param {string} settlement1Id - First settlement ID
   * @param {string} settlement2Id - Second settlement ID
   * @returns {PoliticalRelationship|null} Current relationship or null if none exists
   */
  getDiplomaticRelationship(settlement1Id, settlement2Id) {
    const relationshipKey = this._getRelationshipKey(settlement1Id, settlement2Id);
    return this.diplomaticRelationships.get(relationshipKey) || null;
  }

  /**
   * Get all diplomatic relationships for a settlement
   * @param {string} settlementId - Settlement ID
   * @returns {Array} Array of PoliticalRelationship objects
   */
  getSettlementDiplomaticRelationships(settlementId) {
    const relationships = [];

    for (const relationship of this.diplomaticRelationships.values()) {
      if (relationship.settlement1Id === settlementId || relationship.settlement2Id === settlementId) {
        relationships.push(relationship);
      }
    }

    return relationships;
  }

  /**
   * Get political events with filtering options
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered political events
   */
  getPoliticalEvents(filters = {}) {
    let events = Array.from(this.politicalEvents.values());

    if (filters.type) {
      events = events.filter(event => event.type === filters.type);
    }

    if (filters.settlementId) {
      events = events.filter(event =>
        event.settlements.some(settlement => settlement.id === filters.settlementId)
      );
    }

    if (filters.participantId) {
      events = events.filter(event =>
        event.participants.some(character => character.id === filters.participantId)
      );
    }

    if (filters.minSignificance) {
      events = events.filter(event => event.significance >= filters.minSignificance);
    }

    if (filters.startDate || filters.endDate) {
      events = this._filterEventsByTimeRange(events, filters.startDate, filters.endDate);
    }

    // Sort by timestamp (most recent first)
    events.sort((a, b) => b.timestamp - a.timestamp);

    return events;
  }

  /**
   * Track political influence progression for a character
   * @param {string} characterId - Character ID
   * @param {string} eventType - Type of political event
   * @param {number} significance - Event significance
   * @private
   */
  _updateCharacterPoliticalInfluence(characterId, eventType, significance) {
    // This would integrate with a character political influence system
    // For now, we'll track it in metadata or a separate influence map
    const influenceKey = `political_influence_${characterId}`;
    const currentInfluence = this._getMetadata(influenceKey, 0);

    // Calculate influence change based on event type and significance
    const influenceChange = this._calculateInfluenceChange(eventType, significance);
    const newInfluence = Math.max(0, currentInfluence + influenceChange);

    this._setMetadata(influenceKey, newInfluence);

    // Track influence history
    const historyKey = `political_influence_history_${characterId}`;
    const history = this._getMetadata(historyKey, []);
    history.push({
      timestamp: new Date(),
      eventType: eventType,
      significance: significance,
      influenceChange: influenceChange,
      newInfluence: newInfluence
    });

    this._setMetadata(historyKey, history);
  }

  /**
   * Calculate influence change based on event type and significance
   * @param {string} eventType - Type of political event
   * @param {number} significance - Event significance
   * @returns {number} Influence change
   * @private
   */
  _calculateInfluenceChange(eventType, significance) {
    const baseChange = significance / 10; // Convert significance to influence points

    const multipliers = {
      'leadership_change': 2.0, // Becoming a leader has big impact
      'diplomatic_shift': 1.5,  // Diplomatic achievements
      'alliance_formation': 1.8, // Forming alliances
      'policy_change': 1.2,     // Policy changes
      'conflict': 0.8          // Conflicts can be negative
    };

    return baseChange * (multipliers[eventType] || 1.0);
  }

  /**
   * Calculate trust change based on diplomatic status transition
   * @param {string} oldStatus - Previous status
   * @param {string} newStatus - New status
   * @returns {number} Trust change (-50 to +50)
   * @private
   */
  _calculateTrustChange(oldStatus, newStatus) {
    const trustChanges = {
      'neutral-allied': 20,
      'neutral-hostile': -30,
      'neutral-at_war': -50,
      'allied-neutral': -10,
      'allied-hostile': -40,
      'allied-at_war': -50,
      'hostile-neutral': 15,
      'hostile-allied': 25,
      'at_war-neutral': 30,
      'at_war-allied': 40
    };

    const key = `${oldStatus}-${newStatus}`;
    return trustChanges[key] || 0;
  }

  /**
   * Update leadership history for a settlement
   * @param {string} settlementId - Settlement ID
   * @param {Object} record - Leadership change record
   * @private
   */
  _updateLeadershipHistory(settlementId, record) {
    const history = this.leadershipHistory.get(settlementId) || [];
    history.push(record);
    this.leadershipHistory.set(settlementId, history);
  }

  /**
   * Calculate tenure of a leader in a settlement
   * @param {string} settlementId - Settlement ID
   * @param {string} leaderId - Leader character ID
   * @returns {number} Tenure in days
   * @private
   */
  _calculateTenure(settlementId, leaderId) {
    const history = this.leadershipHistory.get(settlementId) || [];
    const lastLeadershipRecord = history
      .filter(record => record.newLeaderId === leaderId)
      .pop();

    if (!lastLeadershipRecord) return 0;

    const now = new Date();
    const startDate = lastLeadershipRecord.timestamp;
    const diffTime = Math.abs(now - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
  }

  /**
   * Generate effects from leadership change
   * @param {Object} settlement - Settlement
   * @param {Object} oldLeader - Old leader
   * @param {Object} newLeader - New leader
   * @param {string} reason - Change reason
   * @returns {Array} Effects array
   * @private
   */
  _generateLeadershipChangeEffects(settlement, oldLeader, newLeader, reason) {
    const effects = [
      {
        type: 'government_stability_change',
        settlementId: settlement.id,
        change: this._calculateStabilityChange(reason),
        reason: reason
      }
    ];

    // Add policy change effects if applicable
    if (reason === 'policy_disagreement' || reason === 'reform_movement') {
      effects.push({
        type: 'policy_shift',
        settlementId: settlement.id,
        newLeaderId: newLeader.id,
        expectedChanges: this._predictPolicyChanges(newLeader, oldLeader)
      });
    }

    return effects;
  }

  /**
   * Calculate government stability change based on leadership change reason
   * @param {string} reason - Change reason
   * @returns {number} Stability change (-20 to +10)
   * @private
   */
  _calculateStabilityChange(reason) {
    const stabilityChanges = {
      'election': 5,           // Democratic transitions are stable
      'succession': 0,         // Normal succession
      'resignation': -5,       // Resignations cause uncertainty
      'impeachment': -15,      // Impeachments are destabilizing
      'coup': -20,            // Coups are very destabilizing
      'death': -10,           // Sudden deaths cause instability
      'policy_disagreement': -8, // Policy conflicts reduce stability
      'reform_movement': 2     // Reforms can be stabilizing
    };

    return stabilityChanges[reason] || 0;
  }

  /**
   * Predict policy changes based on leader characteristics
   * @param {Object} newLeader - New leader
   * @param {Object} oldLeader - Old leader
   * @returns {Array} Expected policy changes
   * @private
   */
  _predictPolicyChanges(newLeader, oldLeader) {
    // This would analyze leader traits, personality, etc.
    // For now, return a placeholder
    return ['economic_policy', 'foreign_relations'];
  }

  /**
   * Get relationship key for consistent ordering
   * @param {string} id1 - First ID
   * @param {string} id2 - Second ID
   * @returns {string} Relationship key
   * @private
   */
  _getRelationshipKey(id1, id2) {
    return [id1, id2].sort().join('-');
  }

  /**
   * Filter history records by time range
   * @param {Array} history - History records
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Filtered records
   * @private
   */
  _filterHistoryByTimeRange(history, startDate, endDate) {
    return history.filter(record => {
      const recordDate = record.timestamp;
      if (startDate && recordDate < startDate) return false;
      if (endDate && recordDate > endDate) return false;
      return true;
    });
  }

  /**
   * Filter events by time range
   * @param {Array} events - Political events
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Filtered events
   * @private
   */
  _filterEventsByTimeRange(events, startDate, endDate) {
    return events.filter(event => {
      if (startDate && event.timestamp < startDate) return false;
      if (endDate && event.timestamp > endDate) return false;
      return true;
    });
  }

  /**
   * Validate settlement object
   * @param {Object} settlement - Settlement to validate
   * @private
   */
  _validateSettlement(settlement) {
    if (!settlement || !settlement.id || !settlement.name) {
      throw new Error('Invalid settlement object');
    }
  }

  /**
   * Validate character object
   * @param {Object} character - Character to validate
   * @private
   */
  _validateCharacter(character) {
    if (!character || !character.id || !character.name) {
      throw new Error('Invalid character object');
    }
  }

  /**
   * Get metadata value
   * @param {string} key - Metadata key
   * @param {*} defaultValue - Default value
   * @returns {*} Metadata value
   * @private
   */
  _getMetadata(key, defaultValue = null) {
    // In a real implementation, this would use a metadata store
    return defaultValue;
  }

  /**
   * Set metadata value
   * @param {string} key - Metadata key
   * @param {*} value - Value to set
   * @private
   */
  _setMetadata(key, value) {
    // In a real implementation, this would persist metadata
  }
}