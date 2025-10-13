// src/domain/value-objects/PoliticalRelationship.js

import { BaseValueObject } from './BaseValueObject.js';

/**
 * Value object representing the diplomatic relationship between two settlements
 * Tracks status, history, and treaty information
 */
export class PoliticalRelationship extends BaseValueObject {
  constructor(config = {}) {
    super();

    this.settlement1Id = config.settlement1Id || '';
    this.settlement2Id = config.settlement2Id || '';
    this.status = config.status || 'neutral'; // neutral, allied, hostile, at_war, trade_partner
    this.statusHistory = config.statusHistory || []; // Array of status changes with timestamps
    this.treaties = config.treaties || []; // Active treaties
    this.lastInteraction = config.lastInteraction || null; // Date of last diplomatic interaction
    this.trustLevel = config.trustLevel || 50; // 0-100 trust scale
    this.economicTies = config.economicTies || 0; // Strength of economic relationships
    this.militaryThreat = config.militaryThreat || 0; // Perceived military threat level
    this.culturalExchange = config.culturalExchange || 0; // Level of cultural exchange
    this.metadata = config.metadata || {};

    this._validate();
    Object.freeze(this);
  }

  _validate() {
    if (!this.settlement1Id || !this.settlement2Id) {
      throw new Error('PoliticalRelationship must have both settlement IDs');
    }

    if (this.settlement1Id === this.settlement2Id) {
      throw new Error('PoliticalRelationship cannot be between a settlement and itself');
    }

    const validStatuses = ['neutral', 'allied', 'hostile', 'at_war', 'trade_partner', 'vassal', 'protectorate'];
    if (!validStatuses.includes(this.status)) {
      throw new Error(`Invalid relationship status: ${this.status}`);
    }

    if (this.trustLevel < 0 || this.trustLevel > 100) {
      throw new Error('Trust level must be between 0 and 100');
    }
  }

  /**
   * Get the relationship key (consistent ordering of settlement IDs)
   */
  getRelationshipKey() {
    const ids = [this.settlement1Id, this.settlement2Id].sort();
    return `${ids[0]}-${ids[1]}`;
  }

  /**
   * Check if the relationship is positive (allied or trade partner)
   */
  isPositive() {
    return ['allied', 'trade_partner'].includes(this.status);
  }

  /**
   * Check if the relationship is hostile
   */
  isHostile() {
    return ['hostile', 'at_war'].includes(this.status);
  }

  /**
   * Check if the relationship allows trade
   */
  allowsTrade() {
    return ['allied', 'trade_partner', 'neutral'].includes(this.status);
  }

  /**
   * Get the diplomatic status description
   */
  getStatusDescription() {
    const descriptions = {
      'neutral': 'Neutral relations with no special agreements',
      'allied': 'Formal alliance with mutual defense obligations',
      'hostile': 'Hostile relations with potential for conflict',
      'at_war': 'Active state of war',
      'trade_partner': 'Trade agreement facilitating economic exchange',
      'vassal': 'Vassal state under protection',
      'protectorate': 'Protectorate under governance'
    };
    return descriptions[this.status] || 'Unknown status';
  }

  /**
   * Calculate relationship stability (0-100)
   */
  getStability() {
    let stability = 50; // Base stability

    // Trust level affects stability
    stability += (this.trustLevel - 50) * 0.5;

    // Economic ties increase stability
    stability += this.economicTies * 0.3;

    // Cultural exchange increases stability
    stability += this.culturalExchange * 0.2;

    // Hostile relationships are less stable
    if (this.isHostile()) {
      stability -= 20;
    }

    // Active treaties increase stability
    stability += this.treaties.length * 5;

    return Math.max(0, Math.min(100, stability));
  }

  /**
   * Get active treaties of a specific type
   */
  getActiveTreaties(type = null) {
    const activeTreaties = this.treaties.filter(treaty => treaty.isActive);
    return type ? activeTreaties.filter(treaty => treaty.type === type) : activeTreaties;
  }

  /**
   * Check if a specific treaty type is active
   */
  hasActiveTreaty(type) {
    return this.getActiveTreaties(type).length > 0;
  }

  /**
   * Get the most recent status change
   */
  getLastStatusChange() {
    return this.statusHistory.length > 0
      ? this.statusHistory[this.statusHistory.length - 1]
      : null;
  }

  /**
   * Create a new relationship with updated status
   */
  changeStatus(newStatus, reason = '', timestamp = new Date()) {
    const statusChange = {
      from: this.status,
      to: newStatus,
      timestamp: timestamp,
      reason: reason
    };

    return new PoliticalRelationship({
      ...this,
      status: newStatus,
      statusHistory: [...this.statusHistory, statusChange],
      lastInteraction: timestamp
    });
  }

  /**
   * Create a new relationship with updated trust level
   */
  updateTrust(change, reason = '', timestamp = new Date()) {
    const newTrust = Math.max(0, Math.min(100, this.trustLevel + change));

    return new PoliticalRelationship({
      ...this,
      trustLevel: newTrust,
      lastInteraction: timestamp,
      metadata: {
        ...this.metadata,
        lastTrustChange: {
          change: change,
          reason: reason,
          timestamp: timestamp
        }
      }
    });
  }

  /**
   * Add a treaty to the relationship
   */
  addTreaty(treaty) {
    return new PoliticalRelationship({
      ...this,
      treaties: [...this.treaties, treaty],
      lastInteraction: new Date()
    });
  }

  /**
   * Remove a treaty from the relationship
   */
  removeTreaty(treatyId) {
    return new PoliticalRelationship({
      ...this,
      treaties: this.treaties.filter(treaty => treaty.id !== treatyId),
      lastInteraction: new Date()
    });
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      settlement1Id: this.settlement1Id,
      settlement2Id: this.settlement2Id,
      status: this.status,
      statusHistory: [...this.statusHistory],
      treaties: [...this.treaties],
      lastInteraction: this.lastInteraction?.toISOString() || null,
      trustLevel: this.trustLevel,
      economicTies: this.economicTies,
      militaryThreat: this.militaryThreat,
      culturalExchange: this.culturalExchange,
      metadata: { ...this.metadata }
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(json) {
    return new PoliticalRelationship({
      settlement1Id: json.settlement1Id,
      settlement2Id: json.settlement2Id,
      status: json.status,
      statusHistory: [...(json.statusHistory || [])],
      treaties: [...(json.treaties || [])],
      lastInteraction: json.lastInteraction ? new Date(json.lastInteraction) : null,
      trustLevel: json.trustLevel,
      economicTies: json.economicTies,
      militaryThreat: json.militaryThreat,
      culturalExchange: json.culturalExchange,
      metadata: { ...(json.metadata || {}) }
    });
  }
}