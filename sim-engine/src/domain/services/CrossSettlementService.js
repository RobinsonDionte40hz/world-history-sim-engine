// src/domain/services/CrossSettlementService.js

/**
 * Cross-Settlement Service
 *
 * Manages inter-settlement interactions including:
 * - Diplomacy and relationship management
 * - Trade agreements and economic interactions
 * - Conflict resolution and escalation
 * - Multi-settlement quest coordination
 *
 * Performance targets:
 * - Relationship operations: <10ms
 * - Trade calculations: <5ms
 * - Conflict resolution: <20ms
 * - Multi-settlement coordination: <50ms
 */

import BaseDomainService from './BaseDomainService.js';

export class CrossSettlementService extends BaseDomainService {
  constructor() {
    super();

    // Relationship tracking
    this.relationships = new Map(); // relationshipId -> relationship data
    this.settlementRelationships = new Map(); // settlementId -> Map of other settlement relationships

    // Trade agreements
    this.tradeAgreements = new Map(); // agreementId -> agreement data

    // Active conflicts
    this.activeConflicts = new Map(); // conflictId -> conflict data

    // Quest coordinations
    this.questCoordinations = new Map(); // coordinationId -> coordination data

    // Performance tracking
    this.performanceMetrics = {
      totalOperations: 0,
      averageOperationTime: 0,
      operationHistory: []
    };
  }

  /**
   * Establish diplomatic relations between settlements
   */
  establishDiplomacy(settlementAId, settlementBId, relationshipType, world) {
    const startTime = performance.now();

    try {
      // Validate settlements exist
      const settlementA = world.getSettlement(settlementAId);
      const settlementB = world.getSettlement(settlementBId);

      if (!settlementA || !settlementB) {
        return {
          success: false,
          error: 'One or both settlements not found'
        };
      }

      // Create relationship ID
      const relationshipId = this._generateRelationshipId(settlementAId, settlementBId);

      // Initialize relationship data
      const relationship = {
        id: relationshipId,
        settlementA: settlementAId,
        settlementB: settlementBId,
        type: relationshipType,
        trust: 0.5, // Neutral starting trust
        tradeVolume: 0,
        conflicts: 0,
        lastInteraction: world.turn,
        established: world.turn,
        events: []
      };

      // Store relationship
      this.relationships.set(relationshipId, relationship);

      // Update settlement relationship maps
      this._updateSettlementRelationships(settlementAId, settlementBId, relationship);

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        success: true,
        relationshipId,
        settlementA: settlementAId,
        settlementB: settlementBId,
        type: relationshipType,
        trust: relationship.trust,
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update relationship status between settlements
   */
  updateRelationship(settlementAId, settlementBId, changes, reason, world) {
    const startTime = performance.now();

    try {
      const relationshipId = this._generateRelationshipId(settlementAId, settlementBId);
      const relationship = this.relationships.get(relationshipId);

      if (!relationship) {
        return {
          success: false,
          error: 'Relationship not found'
        };
      }

      const oldTrust = relationship.trust;
      const events = [];

      // Apply changes
      if (changes.trust !== undefined) {
        relationship.trust = Math.max(0, Math.min(1, changes.trust));
        events.push({
          type: 'trust_change',
          oldValue: oldTrust,
          newValue: relationship.trust,
          reason,
          timestamp: Date.now()
        });
      }

      if (changes.trade_volume !== undefined) {
        relationship.tradeVolume += changes.trade_volume;
        events.push({
          type: 'trade_volume_change',
          amount: changes.trade_volume,
          reason,
          timestamp: Date.now()
        });
      }

      relationship.lastInteraction = world.turn;
      relationship.events.push(...events);

      // Update settlement relationship maps
      this._updateSettlementRelationships(settlementAId, settlementBId, relationship);

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        success: true,
        oldTrust,
        newTrust: relationship.trust,
        events,
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get relationship status between settlements
   */
  getRelationshipStatus(settlementAId, settlementBId, world) {
    const relationshipId = this._generateRelationshipId(settlementAId, settlementBId);
    const relationship = this.relationships.get(relationshipId);

    if (!relationship) {
      return {
        exists: false,
        settlementA: settlementAId,
        settlementB: settlementBId
      };
    }

    return {
      exists: true,
      type: relationship.type,
      trust: relationship.trust,
      tradeVolume: relationship.tradeVolume,
      conflicts: relationship.conflicts,
      lastInteraction: relationship.lastInteraction,
      established: relationship.established,
      events: relationship.events.slice(-5) // Last 5 events
    };
  }

  /**
   * Negotiate trade agreement between settlements
   */
  negotiateTradeAgreement(settlementAId, settlementBId, terms, world) {
    const startTime = performance.now();

    try {
      // Validate settlements and resources
      const settlementA = world.getSettlement(settlementAId);
      const settlementB = world.getSettlement(settlementBId);

      if (!settlementA || !settlementB) {
        return {
          success: false,
          error: 'One or both settlements not found'
        };
      }

      // Validate trade terms
      if (!this._validateTradeTerms(terms, settlementA, settlementB, settlementAId, settlementBId)) {
        return {
          success: false,
          error: 'Invalid trade terms'
        };
      }

      const agreementId = this._generateAgreementId(settlementAId, settlementBId);
      const value = this.calculateTradeValue(terms);

      const agreement = {
        id: agreementId,
        settlementA: settlementAId,
        settlementB: settlementBId,
        terms,
        value,
        duration: 10, // Default 10 turns
        established: world.turn,
        status: 'active',
        executions: 0
      };

      this.tradeAgreements.set(agreementId, agreement);

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        success: true,
        agreementId,
        terms,
        value,
        duration: agreement.duration,
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute a trade agreement
   */
  executeTrade(agreementId, world) {
    const startTime = performance.now();

    try {
      const agreement = this.tradeAgreements.get(agreementId);

      if (!agreement || agreement.status !== 'active') {
        return {
          success: false,
          error: 'Agreement not found or not active'
        };
      }

      const settlementA = world.getSettlement(agreement.settlementA);
      const settlementB = world.getSettlement(agreement.settlementB);

      if (!settlementA || !settlementB) {
        return {
          success: false,
          error: 'One or both settlements not found'
        };
      }

      // Execute resource transfers
      const resourcesTransferred = {
        [agreement.settlementA]: {},
        [agreement.settlementB]: {}
      };

      // Get terms for each settlement (handle both full IDs and short names)
      const termsA = agreement.terms[agreement.settlementA] ||
                    agreement.terms[settlementA.id.split('-')[1]];
      const termsB = agreement.terms[agreement.settlementB] ||
                    agreement.terms[settlementB.id.split('-')[1]];

      // Transfer from A to B
      if (termsA) {
        Object.entries(termsA).forEach(([resource, amount]) => {
          settlementA.resources[resource] -= amount;
          settlementB.resources[resource] += amount;
          resourcesTransferred[agreement.settlementA][resource] = -amount;
          resourcesTransferred[agreement.settlementB][resource] = amount;
        });
      }

      // Transfer from B to A
      if (termsB) {
        Object.entries(termsB).forEach(([resource, amount]) => {
          settlementB.resources[resource] -= amount;
          settlementA.resources[resource] += amount;
          resourcesTransferred[agreement.settlementB][resource] = -amount;
          resourcesTransferred[agreement.settlementA][resource] = amount;
        });
      }

      agreement.executions++;
      agreement.lastExecution = world.turn;

      // Update relationship
      this.updateRelationship(
        agreement.settlementA,
        agreement.settlementB,
        { trade_volume: agreement.value },
        'trade_execution',
        world
      );

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        success: true,
        resourcesTransferred,
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate trade value
   */
  calculateTradeValue(terms) {
    const resourceValues = {
      food: 1,
      wood: 2,
      stone: 3,
      gold: 5
    };

    let totalValue = 0;

    // Calculate value of all resources in trade
    Object.values(terms).forEach(settlementTerms => {
      Object.entries(settlementTerms).forEach(([resource, amount]) => {
        const value = resourceValues[resource] || 1;
        totalValue += Math.abs(amount) * value;
      });
    });

    return totalValue;
  }

  /**
   * Evaluate conflict potential
   */
  evaluateConflict(conflictContext, world) {
    const escalationRisk = Math.min(1, conflictContext.severity * 0.8);
    const potentialImpact = this.calculateConflictImpact(conflictContext, world);

    const resolutionOptions = [
      'diplomatic_negotiation',
      'mediation',
      'resource_compensation',
      'territorial_compromise'
    ];

    const recommendedAction = escalationRisk > 0.7 ? 'immediate_mediation' :
                             escalationRisk > 0.4 ? 'diplomatic_negotiation' :
                             'monitor';

    return {
      escalationRisk,
      potentialImpact,
      resolutionOptions,
      recommendedAction
    };
  }

  /**
   * Resolve a conflict
   */
  resolveConflict(conflict, resolutionType, world) {
    const startTime = performance.now();

    try {
      const resolution = {
        success: true,
        outcome: resolutionType,
        relationshipChanges: {},
        events: []
      };

      // Calculate relationship impact based on resolution type
      let trustChange = 0;
      switch (resolutionType) {
        case 'diplomatic_negotiation':
          trustChange = 0.1;
          break;
        case 'mediation':
          trustChange = 0.05;
          break;
        case 'resource_compensation':
          trustChange = 0.15;
          break;
        case 'territorial_compromise':
          trustChange = -0.1; // Slight negative for compromise
          break;
        default:
          trustChange = 0;
      }

      // Update relationships for all involved settlements
      for (let i = 0; i < conflict.settlements.length; i++) {
        for (let j = i + 1; j < conflict.settlements.length; j++) {
          const settlementA = conflict.settlements[i];
          const settlementB = conflict.settlements[j];

          this.updateRelationship(
            settlementA,
            settlementB,
            { trust: Math.max(0, Math.min(1, this.getRelationshipStatus(settlementA, settlementB, world).trust + trustChange)) },
            `conflict_resolution_${resolutionType}`,
            world
          );

          resolution.relationshipChanges[`${settlementA}-${settlementB}`] = trustChange;
        }
      }

      resolution.events.push({
        type: 'conflict_resolved',
        conflictId: conflict.id,
        resolution: resolutionType,
        timestamp: Date.now()
      });

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        ...resolution,
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate conflict impact
   */
  calculateConflictImpact(conflict, world) {
    const baseSeverity = conflict.severity || 0.5;
    const duration = conflict.duration || 1;

    return {
      economicDamage: baseSeverity * duration * 50, // Resource loss
      populationImpact: baseSeverity * duration * 10, // Population affected
      relationshipDamage: baseSeverity * 0.3, // Trust reduction
      longTermEffects: baseSeverity > 0.7 ? 'lasting_tension' : 'temporary_strain'
    };
  }

  /**
   * Coordinate multi-settlement quest
   */
  coordinateQuest(quest, world) {
    const startTime = performance.now();

    try {
      const coordinationId = this._generateCoordinationId(quest.id);

      const coordination = {
        id: coordinationId,
        questId: quest.id,
        participants: quest.participatingSettlements,
        progressTracking: {},
        rewards: quest.rewards,
        established: world.turn,
        status: 'active'
      };

      // Initialize progress tracking for each settlement
      quest.participatingSettlements.forEach(settlementId => {
        coordination.progressTracking[settlementId] = {
          contribution: 0,
          objectives: quest.objectives.map(obj => ({ type: obj, completed: false }))
        };
      });

      this.questCoordinations.set(coordinationId, coordination);

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        success: true,
        coordinationId,
        participants: coordination.participants,
        progressTracking: coordination.progressTracking,
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Distribute quest rewards
   */
  distributeQuestRewards(coordinationId, completionData, world) {
    const startTime = performance.now();

    try {
      const coordination = this.questCoordinations.get(coordinationId);

      if (!coordination) {
        return {
          success: false,
          error: 'Quest coordination not found'
        };
      }

      // Validate world context
      if (!world || !world.getSettlement) {
        return {
          success: false,
          error: 'Invalid world context'
        };
      }

      const rewardsDistributed = [];
      const relationshipImprovements = {};

      // Distribute rewards to each participating settlement
      coordination.participants.forEach(settlementId => {
        const reward = {
          settlementId,
          trust: coordination.rewards.trust || 0,
          resources: { ...(coordination.rewards.shared_resources || {}) }
        };

        // Handle direct resource rewards (for backward compatibility)
        if (coordination.rewards.gold) {
          reward.resources.gold = (reward.resources.gold || 0) + coordination.rewards.gold;
        }

        rewardsDistributed.push(reward);

        // Update settlement resources if applicable
        const settlement = world.getSettlement(settlementId);
        if (settlement && reward.resources) {
          Object.entries(reward.resources).forEach(([resource, amount]) => {
            settlement.resources[resource] = (settlement.resources[resource] || 0) + amount;
          });
        }
      });

      // Improve relationships between all participant pairs
      const trustIncrease = coordination.rewards.trust || 0;
      for (let i = 0; i < coordination.participants.length; i++) {
        for (let j = i + 1; j < coordination.participants.length; j++) {
          const settlementA = coordination.participants[i];
          const settlementB = coordination.participants[j];

          this.updateRelationship(
            settlementA,
            settlementB,
            { trust: Math.min(1, this.getRelationshipStatus(settlementA, settlementB, world).trust + trustIncrease) },
            'quest_completion',
            world
          );

          relationshipImprovements[`${settlementA}-${settlementB}`] = trustIncrease;
        }
      }

      coordination.status = 'completed';
      coordination.completed = world.turn;

      const endTime = performance.now();
      this._updatePerformanceMetrics(endTime - startTime);

      return {
        success: true,
        rewardsDistributed,
        relationshipImprovements,
        processingTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Track quest progress
   */
  trackQuestProgress(coordinationId, world) {
    const coordination = this.questCoordinations.get(coordinationId);

    if (!coordination) {
      return {
        overallProgress: 0,
        settlementProgress: {},
        blockers: ['coordination_not_found'],
        nextMilestones: []
      };
    }

    const settlementProgress = {};
    let totalProgress = 0;

    coordination.participants.forEach(settlementId => {
      const progress = coordination.progressTracking[settlementId];
      const completedObjectives = progress.objectives.filter(obj => obj.completed).length;
      const settlementProgressPercent = completedObjectives / progress.objectives.length;

      settlementProgress[settlementId] = {
        contribution: progress.contribution,
        completedObjectives,
        totalObjectives: progress.objectives.length,
        progressPercent: settlementProgressPercent
      };

      totalProgress += settlementProgressPercent;
    });

    const overallProgress = totalProgress / coordination.participants.length;

    return {
      overallProgress,
      settlementProgress,
      blockers: [],
      nextMilestones: coordination.participants
        .map(id => coordination.progressTracking[id])
        .flatMap(progress => progress.objectives.filter(obj => !obj.completed))
        .slice(0, 3) // Next 3 milestones
    };
  }

  /**
   * Generate relationship ID
   */
  _generateRelationshipId(settlementAId, settlementBId) {
    const [first, second] = [settlementAId, settlementBId].sort();
    return `relationship-${first}-${second}`;
  }

  /**
   * Generate agreement ID
   */
  _generateAgreementId(settlementAId, settlementBId) {
    const [first, second] = [settlementAId, settlementBId].sort();
    return `agreement-${first}-${second}-${Date.now()}`;
  }

  /**
   * Generate coordination ID
   */
  _generateCoordinationId(questId) {
    return `coordination-${questId}-${Date.now()}`;
  }

  /**
   * Update settlement relationship maps
   */
  _updateSettlementRelationships(settlementAId, settlementBId, relationship) {
    // Update settlement A's relationships
    if (!this.settlementRelationships.has(settlementAId)) {
      this.settlementRelationships.set(settlementAId, new Map());
    }
    this.settlementRelationships.get(settlementAId).set(settlementBId, relationship);

    // Update settlement B's relationships
    if (!this.settlementRelationships.has(settlementBId)) {
      this.settlementRelationships.set(settlementBId, new Map());
    }
    this.settlementRelationships.get(settlementBId).set(settlementAId, relationship);
  }

  /**
   * Validate trade terms
   */
  _validateTradeTerms(terms, settlementA, settlementB, settlementAId, settlementBId) {
    const validateSettlementTerms = (settlementTerms, settlement) => {
      if (!settlementTerms || typeof settlementTerms !== 'object') return false;

      for (const [resource, amount] of Object.entries(settlementTerms)) {
        if (typeof amount !== 'number' || amount <= 0) return false;
        if (!settlement.resources[resource] || settlement.resources[resource] < amount) return false;
      }
      return true;
    };

    // Support both full settlement IDs and short names
    const termsA = terms[settlementAId] || terms[settlementA.id.split('-')[1]]; // settlement-oakwood -> oakwood
    const termsB = terms[settlementBId] || terms[settlementB.id.split('-')[1]]; // settlement-riverton -> riverton

    return validateSettlementTerms(termsA, settlementA) &&
           validateSettlementTerms(termsB, settlementB);
  }

  /**
   * Update performance metrics
   */
  _updatePerformanceMetrics(operationTime) {
    this.performanceMetrics.totalOperations++;
    this.performanceMetrics.operationHistory.push(operationTime);

    // Keep only last 100 operations
    if (this.performanceMetrics.operationHistory.length > 100) {
      this.performanceMetrics.operationHistory.shift();
    }

    this.performanceMetrics.averageOperationTime =
      this.performanceMetrics.operationHistory.reduce((sum, time) => sum + time, 0) /
      this.performanceMetrics.operationHistory.length;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }
}

export default CrossSettlementService;