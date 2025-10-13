// src/domain/entities/PoliticalEvent.js

/**
 * Entity representing a political event in the world simulation
 * Political events track leadership changes, diplomatic shifts, policy changes,
 * alliance formations, and conflicts between settlements and characters
 */
export class PoliticalEvent {
  constructor(config = {}) {
    // Generate ID using crypto if available, otherwise fallback to timestamp-based ID
    this.id = config.id || (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `political-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    this.type = config.type || 'generic';
    this.name = config.name || 'Unnamed Political Event';
    this.description = config.description || '';
    this.timestamp = config.timestamp || new Date();
    this.location = config.location || null;
    this.participants = config.participants || []; // Characters and settlements involved
    this.settlements = config.settlements || []; // Settlements directly affected
    this.significance = config.significance || 0; // 0-100 scale of importance
    this.scope = config.scope || 'local'; // local, regional, global
    this.effects = config.effects || []; // Political consequences
    this.metadata = config.metadata || {};

    // Type-specific properties
    this.leadershipChange = config.leadershipChange || null; // For leadership_change events
    this.diplomaticShift = config.diplomaticShift || null; // For diplomatic_shift events
    this.policyChange = config.policyChange || null; // For policy_change events
    this.allianceFormation = config.allianceFormation || null; // For alliance_formation events
    this.conflict = config.conflict || null; // For conflict events

    Object.freeze(this);
  }

  /**
   * Get the primary settlement affected by this event
   */
  getPrimarySettlement() {
    return this.settlements.length > 0 ? this.settlements[0] : null;
  }

  /**
   * Get all settlements affected by this event
   */
  getAffectedSettlements() {
    return [...this.settlements];
  }

  /**
   * Get all characters involved in this event
   */
  getInvolvedCharacters() {
    return [...this.participants];
  }

  /**
   * Calculate significance based on participants and scope
   */
  static calculateSignificance(participants = [], settlements = [], scope = 'local', effects = []) {
    let significance = 0;

    // Base significance from participant count
    significance += Math.min(participants.length * 5, 30);

    // Settlement involvement increases significance
    significance += Math.min(settlements.length * 10, 40);

    // Scope multiplier
    const scopeMultiplier = {
      'local': 1.0,
      'regional': 1.5,
      'global': 2.0
    };
    significance *= scopeMultiplier[scope] || 1.0;

    // Effects impact
    significance += Math.min(effects.length * 3, 20);

    return Math.min(Math.max(significance, 0), 100);
  }

  /**
   * Create a leadership change event
   */
  static createLeadershipChange(settlement, oldLeader, newLeader, reason = 'election') {
    const participants = [newLeader];
    if (oldLeader) participants.push(oldLeader);

    const effects = [
      {
        type: 'leadership_transition',
        settlementId: settlement.id,
        oldLeaderId: oldLeader?.id || null,
        newLeaderId: newLeader.id,
        reason: reason
      }
    ];

    const significance = this.calculateSignificance(participants, [settlement], 'local', effects);

    return new PoliticalEvent({
      type: 'leadership_change',
      name: `Leadership Change in ${settlement.name}`,
      description: `${newLeader.name} becomes leader of ${settlement.name}${oldLeader ? ` replacing ${oldLeader.name}` : ''}`,
      location: settlement.id,
      participants: participants,
      settlements: [settlement],
      significance: significance,
      scope: 'local',
      effects: effects,
      leadershipChange: {
        settlementId: settlement.id,
        oldLeaderId: oldLeader?.id || null,
        newLeaderId: newLeader.id,
        reason: reason,
        transitionType: oldLeader ? 'replacement' : 'new_appointment'
      }
    });
  }

  /**
   * Create a diplomatic shift event
   */
  static createDiplomaticShift(settlement1, settlement2, oldStatus, newStatus, reason = 'negotiation') {
    const effects = [
      {
        type: 'diplomatic_change',
        settlement1Id: settlement1.id,
        settlement2Id: settlement2.id,
        oldStatus: oldStatus,
        newStatus: newStatus,
        reason: reason
      }
    ];

    const significance = this.calculateSignificance([], [settlement1, settlement2], 'regional', effects);

    return new PoliticalEvent({
      type: 'diplomatic_shift',
      name: `Diplomatic Change: ${settlement1.name} - ${settlement2.name}`,
      description: `Diplomatic relationship between ${settlement1.name} and ${settlement2.name} changed from ${oldStatus} to ${newStatus}`,
      location: null, // Diplomatic events don't have a single location
      participants: [],
      settlements: [settlement1, settlement2],
      significance: significance,
      scope: 'regional',
      effects: effects,
      diplomaticShift: {
        settlement1Id: settlement1.id,
        settlement2Id: settlement2.id,
        oldStatus: oldStatus,
        newStatus: newStatus,
        reason: reason
      }
    });
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      description: this.description,
      timestamp: this.timestamp.toISOString(),
      location: this.location,
      participants: [...this.participants],
      settlements: [...this.settlements],
      significance: this.significance,
      scope: this.scope,
      effects: [...this.effects],
      metadata: { ...this.metadata },
      leadershipChange: this.leadershipChange,
      diplomaticShift: this.diplomaticShift,
      policyChange: this.policyChange,
      allianceFormation: this.allianceFormation,
      conflict: this.conflict
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(json) {
    return new PoliticalEvent({
      id: json.id,
      type: json.type,
      name: json.name,
      description: json.description,
      timestamp: new Date(json.timestamp),
      location: json.location,
      participants: [...(json.participants || [])],
      settlements: [...(json.settlements || [])],
      significance: json.significance,
      scope: json.scope,
      effects: [...(json.effects || [])],
      metadata: { ...(json.metadata || {}) },
      leadershipChange: json.leadershipChange,
      diplomaticShift: json.diplomaticShift,
      policyChange: json.policyChange,
      allianceFormation: json.allianceFormation,
      conflict: json.conflict
    });
  }
}