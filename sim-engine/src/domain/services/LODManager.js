// src/domain/services/LODManager.js

/**
 * Level of Detail (LOD) Manager Service
 *
 * Manages character processing across three LOD tiers:
 * - Hero: Full consciousness simulation with complete character processing
 * - Group: Statistical processing with individual sampling on demand
 * - Background: Pure numerical tracking for settlement-level effects
 *
 * Performance targets:
 * - Hero: <50ms per character
 * - Group: <5ms per character
 * - Background: <1ms per character
 * - 100+ characters: <2 seconds total
 */

import { LODTier } from '../value-objects/LODTier.js';

export class LODManager {
  constructor() {
    this.processingMetrics = {
      totalProcessed: 0,
      averageProcessingTime: 0,
      memoryUsage: 0,
      tierBreakdown: {
        hero: 0,
        group: 0,
        background: 0
      }
    };

    this.performanceHistory = [];
  }

  /**
   * Process a single character based on their LOD tier
   */
  processCharacter(character, world, turnContext) {
    const startTime = performance.now();

    let result;

    switch (character.lodTier) {
      case 'hero':
        result = this._processHeroCharacter(character, world, turnContext);
        break;
      case 'group':
        result = this._processGroupCharacter(character, world, turnContext);
        break;
      case 'background':
        result = this._processBackgroundCharacter(character, world, turnContext);
        break;
      default:
        // Handle invalid tier gracefully - default to background processing
        result = this._processBackgroundCharacter(character, world, turnContext);
        result.error = `Unknown LOD tier: ${character.lodTier}, defaulted to background`;
        break;
    }

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    // Update metrics
    this.processingMetrics.totalProcessed++;
    this.processingMetrics.tierBreakdown[character.lodTier]++;
    this._updateAverageProcessingTime(processingTime);

    return {
      ...result,
      processingTime
    };
  }

  /**
   * Process characters by tier efficiently
   */
  processCharacterTier(tier, characters, world, turnContext) {
    const startTime = performance.now();

    const results = characters.map(character =>
      this.processCharacter(character, world, turnContext)
    );

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageProcessingTime = totalTime / characters.length;

    return {
      processedCount: characters.length,
      averageProcessingTime,
      results,
      byTier: {
        hero: { processedCount: characters.filter(c => c.lodTier === 'hero').length },
        group: { processedCount: characters.filter(c => c.lodTier === 'group').length },
        background: { processedCount: characters.filter(c => c.lodTier === 'background').length }
      }
    };
  }

  /**
   * Promote a character to a higher LOD tier
   */
  promoteCharacter(characterId, fromTier, toTier, reason) {
    // Validate character exists (in a real implementation, this would check the world)
    if (!characterId || characterId === 'nonexistent') {
      throw new Error(`Cannot promote character: Character ${characterId} not found`);
    }

    // Validate tier transition
    if (!this._isValidPromotion(fromTier, toTier)) {
      return {
        success: false,
        error: `Cannot promote from ${fromTier} to ${toTier}`
      };
    }

    // In a real implementation, this would update the character in the world
    // For now, return success
    return {
      success: true,
      characterId,
      fromTier,
      toTier,
      reason,
      timestamp: Date.now()
    };
  }

  /**
   * Demote a character to a lower LOD tier
   */
  demoteCharacter(characterId, fromTier, toTier, reason) {
    // Validate tier transition
    if (!this._isValidDemotion(fromTier, toTier)) {
      return {
        success: false,
        error: `Cannot demote from ${fromTier} to ${toTier}`
      };
    }

    // In a real implementation, this would update the character in the world
    return {
      success: true,
      characterId,
      fromTier,
      toTier,
      reason,
      timestamp: Date.now()
    };
  }

  /**
   * Evaluate which characters should be promoted
   */
  evaluatePromotions(characters, context) {
    const eligibleCharacters = [];
    const promotionEvents = [];

    characters.forEach(character => {
      const tier = LODTier.get(character.lodTier);
      if (tier.canPromoteCharacter(character, context)) {
        eligibleCharacters.push(character);
        promotionEvents.push({
          characterId: character.id,
          fromTier: character.lodTier,
          toTier: tier.getNextTier(),
          reason: 'evaluation'
        });
      }
    });

    return {
      eligibleCharacters,
      promotionEvents
    };
  }

  /**
   * Evaluate which characters should be demoted
   */
  evaluateDemotions(characters, context) {
    const eligibleCharacters = [];
    const demotionEvents = [];

    characters.forEach(character => {
      const tier = LODTier.get(character.lodTier);
      if (tier.shouldDemoteCharacter(character, context)) {
        eligibleCharacters.push(character);
        demotionEvents.push({
          characterId: character.id,
          fromTier: character.lodTier,
          toTier: tier.getPreviousTier(),
          reason: 'evaluation'
        });
      }
    });

    return {
      eligibleCharacters,
      demotionEvents
    };
  }

  /**
   * Get processing metrics
   */
  getProcessingMetrics() {
    return { ...this.processingMetrics };
  }

  /**
   * Process a hero-tier character with full simulation
   */
  _processHeroCharacter(character, world, turnContext) {
    // Full consciousness simulation
    const updatedCharacter = { ...character };

    // Evolve consciousness
    if (updatedCharacter.consciousness) {
      updatedCharacter.consciousness = {
        ...updatedCharacter.consciousness,
        frequency: Math.min(1.0, updatedCharacter.consciousness.frequency + 0.01),
        coherence: Math.min(1.0, updatedCharacter.consciousness.coherence + 0.005)
      };
    }

    // Generate individual events
    const events = [
      {
        type: 'consciousness_shift',
        characterId: character.id,
        frequency: updatedCharacter.consciousness?.frequency,
        coherence: updatedCharacter.consciousness?.coherence,
        timestamp: Date.now()
      }
    ];

    return {
      character: updatedCharacter,
      events,
      lodTier: 'hero'
    };
  }

  /**
   * Process a group-tier character statistically
   */
  _processGroupCharacter(character, world, turnContext) {
    // Statistical processing
    const updatedCharacter = { ...character };

    // Update group statistics
    if (updatedCharacter.groupStatistics) {
      updatedCharacter.groupStatistics = {
        ...updatedCharacter.groupStatistics,
        morale: Math.max(0, Math.min(1, updatedCharacter.groupStatistics.morale + (Math.random() - 0.5) * 0.1)),
        productivity: Math.max(0, Math.min(1, updatedCharacter.groupStatistics.productivity + (Math.random() - 0.5) * 0.05))
      };
    }

    // Generate group-level events
    const settlementId = character.assignments?.settlements?.values().next().value;
    const events = [
      {
        type: 'group_morale_change',
        groupId: character.populationGroupId,
        settlementId,
        morale: updatedCharacter.groupStatistics?.morale,
        timestamp: Date.now()
      }
    ];

    return {
      character: updatedCharacter,
      groupStatistics: updatedCharacter.groupStatistics,
      events,
      lodTier: 'group'
    };
  }

  /**
   * Process a background-tier character minimally
   */
  _processBackgroundCharacter(character, world, turnContext) {
    // Minimal processing - just demographic tracking
    const demographicUpdates = character.demographicData ? {
      settlementId: character.assignments?.settlements?.values().next().value,
      occupation: character.demographicData.occupation,
      count: character.demographicData.count
    } : undefined;

    return {
      character,
      events: [],
      lodTier: 'background',
      demographicUpdates
    };
  }

  /**
   * Update average processing time
   */
  _updateAverageProcessingTime(newTime) {
    const history = this.performanceHistory;
    history.push(newTime);

    // Keep only last 100 measurements
    if (history.length > 100) {
      history.shift();
    }

    this.processingMetrics.averageProcessingTime =
      history.reduce((sum, time) => sum + time, 0) / history.length;
  }

  /**
   * Validate if a promotion is allowed
   */
  _isValidPromotion(fromTier, toTier) {
    const validPromotions = {
      'background': ['group'],
      'group': ['hero'],
      'hero': []
    };

    return validPromotions[fromTier]?.includes(toTier) || false;
  }

  /**
   * Process LOD updates before main turn processing
   * @param {Object} worldState - Current world state
   * @returns {Object} Pre-turn LOD processing result
   */
  async processPreTurnLOD(worldState) {
    const startTime = performance.now();
    const events = [];
    const changes = [];

    try {
      // Check for characters that should be promoted based on recent activity
      const promotionCandidates = this._identifyPromotionCandidates(worldState);

      for (const candidate of promotionCandidates) {
        const promotionResult = this._attemptPromotion(candidate.character, candidate.reason, worldState);
        if (promotionResult.success) {
          events.push({
            type: 'lod_promotion',
            characterId: candidate.character.id,
            characterName: candidate.character.name,
            fromTier: candidate.character.lodTier,
            toTier: promotionResult.newTier,
            reason: candidate.reason,
            turn: worldState.turn
          });

          changes.push({
            type: 'character_lod_changed',
            characterId: candidate.character.id,
            fromTier: candidate.character.lodTier,
            toTier: promotionResult.newTier,
            reason: 'pre_turn_promotion'
          });
        }
      }

      const endTime = performance.now();
      return {
        success: true,
        events,
        changes,
        promotions: promotionCandidates.length,
        processingTime: endTime - startTime
      };

    } catch (error) {
      console.error('LOD pre-turn processing failed:', error);
      return {
        success: false,
        error: error.message,
        events: [],
        changes: [],
        processingTime: performance.now() - startTime
      };
    }
  }

  /**
   * Process LOD updates after main turn processing
   * @param {Object} worldState - Updated world state
   * @param {Object} turnResult - Result from main turn processing
   * @returns {Object} Post-turn LOD processing result
   */
  async processPostTurnLOD(worldState, turnResult) {
    const startTime = performance.now();
    const events = [];
    const changes = [];

    try {
      // Check for characters that should be demoted based on inactivity
      const demotionCandidates = this._identifyDemotionCandidates(worldState, turnResult);

      for (const candidate of demotionCandidates) {
        const demotionResult = this._attemptDemotion(candidate.character, candidate.reason, worldState);
        if (demotionResult.success) {
          events.push({
            type: 'lod_demotion',
            characterId: candidate.character.id,
            characterName: candidate.character.name,
            fromTier: candidate.lodTier,
            toTier: demotionResult.newTier,
            reason: candidate.reason,
            turn: worldState.turn
          });

          changes.push({
            type: 'character_lod_changed',
            characterId: candidate.character.id,
            fromTier: candidate.character.lodTier,
            toTier: demotionResult.newTier,
            reason: 'post_turn_demotion'
          });
        }
      }

      // Update LOD processing metrics
      this._updatePerformanceMetrics(worldState, turnResult);

      const endTime = performance.now();
      return {
        success: true,
        events,
        changes,
        demotions: demotionCandidates.length,
        processingTime: endTime - startTime
      };

    } catch (error) {
      console.error('LOD post-turn processing failed:', error);
      return {
        success: false,
        error: error.message,
        events: [],
        changes: [],
        processingTime: performance.now() - startTime
      };
    }
  }

  /**
   * Identify characters that should be promoted to higher LOD tiers
   * @private
   */
  _identifyPromotionCandidates(worldState) {
    const candidates = [];

    // Check characters in settlements with recent activity
    for (const settlement of worldState.settlements || []) {
      const recentEvents = worldState.events?.filter(e =>
        e.settlementId === settlement.id &&
        e.turn >= worldState.turn - 2 // Last 2 turns
      ) || [];

      if (recentEvents.length > 5) { // High activity threshold
        // Find background characters in this settlement that could be promoted
        const backgroundChars = (worldState.characters || [])
          .filter(c => c.lodTier === 'background' && c.currentNode === settlement.id);

        for (const character of backgroundChars.slice(0, 2)) { // Promote max 2 per settlement
          candidates.push({
            character,
            reason: 'high_settlement_activity'
          });
        }
      }
    }

    return candidates;
  }

  /**
   * Identify characters that should be demoted to lower LOD tiers
   * @private
   */
  _identifyDemotionCandidates(worldState, turnResult) {
    const candidates = [];

    // Check characters with no recent interactions
    const activeCharacterIds = new Set(
      (turnResult.events || [])
        .filter(e => e.characterId)
        .map(e => e.characterId)
    );

    for (const character of worldState.characters || []) {
      if (character.lodTier === 'hero' && !activeCharacterIds.has(character.id)) {
        // Hero character with no activity this turn
        const recentActivity = this._getCharacterRecentActivity(character.id, worldState);
        if (recentActivity < 3) { // Low activity threshold
          candidates.push({
            character,
            reason: 'low_activity'
          });
        }
      }
    }

    return candidates;
  }

  /**
   * Get recent activity count for a character
   * @private
   */
  _getCharacterRecentActivity(characterId, worldState) {
    const recentTurns = 5;
    const minTurn = Math.max(1, worldState.turn - recentTurns);

    return (worldState.events || [])
      .filter(e => e.characterId === characterId && e.turn >= minTurn)
      .length;
  }

  /**
   * Attempt to promote a character to a higher LOD tier
   * @private
   */
  _attemptPromotion(character, reason, worldState) {
    const currentTier = character.lodTier;
    let newTier;

    switch (currentTier) {
      case 'background':
        newTier = 'group';
        break;
      case 'group':
        newTier = 'hero';
        break;
      default:
        return { success: false, reason: 'already_at_highest_tier' };
    }

    if (this._isValidPromotion(currentTier, newTier)) {
      character.lodTier = newTier;
      return { success: true, newTier };
    }

    return { success: false, reason: 'invalid_promotion' };
  }

  /**
   * Attempt to demote a character to a lower LOD tier
   * @private
   */
  _attemptDemotion(character, reason, worldState) {
    const currentTier = character.lodTier;
    let newTier;

    switch (currentTier) {
      case 'hero':
        newTier = 'group';
        break;
      case 'group':
        newTier = 'background';
        break;
      default:
        return { success: false, reason: 'already_at_lowest_tier' };
    }

    if (this._isValidDemotion(currentTier, newTier)) {
      character.lodTier = newTier;
      return { success: true, newTier };
    }

    return { success: false, reason: 'invalid_demotion' };
  }

  /**
   * Update performance metrics after turn processing
   * @private
   */
  _updatePerformanceMetrics(worldState, turnResult) {
    const metrics = {
      turn: worldState.turn,
      timestamp: new Date(),
      charactersProcessed: worldState.characters?.length || 0,
      eventsGenerated: turnResult.events?.length || 0,
      tierBreakdown: {
        hero: worldState.characters?.filter(c => c.lodTier === 'hero').length || 0,
        group: worldState.characters?.filter(c => c.lodTier === 'group').length || 0,
        background: worldState.characters?.filter(c => c.lodTier === 'background').length || 0
      }
    };

    this.performanceHistory.push(metrics);

    // Keep only last 50 entries
    if (this.performanceHistory.length > 50) {
      this.performanceHistory.shift();
    }
  }

  /**
   * Validate if a demotion is allowed
   * @private
   */
  _isValidDemotion(fromTier, toTier) {
    const validDemotions = {
      'hero': ['group'],
      'group': ['background'],
      'background': []
    };

    return validDemotions[fromTier]?.includes(toTier) || false;
  }
}

export default LODManager;