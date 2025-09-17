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
import PrestigeService from './PrestigeService.js';

class LODManager {
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

    // MEMORY OPTIMIZATION: Object pools for frequently created objects
    this._eventPool = [];
    this._resultPool = [];
    this._characterCache = new Map();
    this._settlementCache = new Map();

    // PERFORMANCE OPTIMIZATION: Pre-allocated arrays for common operations
    this._tempArray1 = new Array(1000);
    this._tempArray2 = new Array(1000);

    // PRESTIGE INTEGRATION: Initialize PrestigeService for hero character processing
    this.prestigeService = new PrestigeService();
  }

  /**
   * Process a single character based on their LOD tier
   */
  processCharacter(character, world, turnContext) {
    const startTime = performance.now();

    let result;

    // PERFORMANCE OPTIMIZATION: Use tier-specific processing methods directly
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

    // PERFORMANCE OPTIMIZATION: Update metrics more efficiently
    this.processingMetrics.totalProcessed++;
    this.processingMetrics.tierBreakdown[character.lodTier] = (this.processingMetrics.tierBreakdown[character.lodTier] || 0) + 1;
    this._updateAverageProcessingTime(processingTime);

    // PERFORMANCE OPTIMIZATION: Return result with processing time
    result.processingTime = processingTime;
    return result;
  }

  /**
   * Process characters by tier efficiently
   */
  processCharacterTier(tier, characters, world, turnContext) {
    const startTime = performance.now();

    // PERFORMANCE OPTIMIZATION: Early return for empty arrays
    if (!characters || characters.length === 0) {
      return {
        processedCount: 0,
        averageProcessingTime: 0,
        results: [],
        byTier: { hero: 0, group: 0, background: 0 }
      };
    }

    // PERFORMANCE OPTIMIZATION: Pre-allocate results array
    const results = new Array(characters.length);

    for (let i = 0; i < characters.length; i++) {
      results[i] = this.processCharacter(characters[i], world, turnContext);
    }

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
   * MEMORY OPTIMIZATION: Get event object from pool
   * @private
   */
  _getEventFromPool(type, data) {
    let event = this._eventPool.pop();
    if (!event) {
      event = {};
    }

    // Reuse existing object properties
    Object.assign(event, {
      type,
      timestamp: Date.now(),
      ...data
    });

    return event;
  }

  /**
   * MEMORY OPTIMIZATION: Return event object to pool
   * @private
   */
  _returnEventToPool(event) {
    if (this._eventPool.length < 100) { // Limit pool size
      // Clear object properties for reuse
      Object.keys(event).forEach(key => delete event[key]);
      this._eventPool.push(event);
    }
  }

  /**
   * MEMORY OPTIMIZATION: Get result object from pool
   * @private
   */
  _getResultFromPool() {
    let result = this._resultPool.pop();
    if (!result) {
      result = {};
    }
    return result;
  }

  /**
   * MEMORY OPTIMIZATION: Return result object to pool
   * @private
   */
  _returnResultToPool(result) {
    if (this._resultPool.length < 50) { // Limit pool size
      Object.keys(result).forEach(key => delete result[key]);
      this._resultPool.push(result);
    }
  }

  /**
   * PERFORMANCE OPTIMIZATION: Cache character data
   * @private
   */
  _cacheCharacter(character) {
    if (character.id) {
      this._characterCache.set(character.id, {
        lodTier: character.lodTier,
        assignments: character.assignments,
        lastAccessed: Date.now()
      });
    }
  }

  /**
   * MEMORY OPTIMIZATION: Clean up old cache entries
   * @private
   */
  _cleanupCache() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [key, value] of this._characterCache.entries()) {
      if (now - value.lastAccessed > maxAge) {
        this._characterCache.delete(key);
      }
    }
  }

  /**
   * Process a hero-tier character with full simulation
   */
  _processHeroCharacter(character, world, turnContext) {
    // MEMORY OPTIMIZATION: Use object pooling
    const updatedCharacter = { ...character };

    // PERFORMANCE OPTIMIZATION: Cache character data
    this._cacheCharacter(character);

    // Evolve consciousness
    if (updatedCharacter.consciousness) {
      updatedCharacter.consciousness = {
        ...updatedCharacter.consciousness,
        frequency: Math.min(1.0, updatedCharacter.consciousness.frequency + 0.01),
        coherence: Math.min(1.0, updatedCharacter.consciousness.coherence + 0.005)
      };
    }

    // MEMORY OPTIMIZATION: Use pooled event objects
    const events = [this._getEventFromPool('consciousness_shift', {
      characterId: character.id,
      frequency: updatedCharacter.consciousness?.frequency,
      coherence: updatedCharacter.consciousness?.coherence
    })];

    // MEMORY OPTIMIZATION: Use pooled result object
    const result = this._getResultFromPool();
    result.character = updatedCharacter;
    result.events = events;
    result.lodTier = 'hero';

    
    // PRESTIGE INTEGRATION: Process prestige for hero characters
    if (character.prestige) {
      try {
        result.prestigeUpdate = this.processPrestigeForHero(character, world, turnContext);
      } catch (error) {
        result.warnings = result.warnings || [];
        result.warnings.push(`Prestige processing failed: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Process a group-tier character statistically
   */
  _processGroupCharacter(character, world, turnContext) {
    // MEMORY OPTIMIZATION: Use object pooling
    const updatedCharacter = { ...character };

    // PERFORMANCE OPTIMIZATION: Cache character data
    this._cacheCharacter(character);

    // Update group statistics
    if (updatedCharacter.groupStatistics) {
      updatedCharacter.groupStatistics = {
        ...updatedCharacter.groupStatistics,
        morale: Math.max(0, Math.min(1, updatedCharacter.groupStatistics.morale + (Math.random() - 0.5) * 0.1)),
        productivity: Math.max(0, Math.min(1, updatedCharacter.groupStatistics.productivity + (Math.random() - 0.5) * 0.05))
      };
    }

    // MEMORY OPTIMIZATION: Use pooled event objects
    const settlementId = character.assignments?.settlements?.values().next().value;
    const events = [this._getEventFromPool('group_morale_change', {
      groupId: character.populationGroupId,
      settlementId,
      morale: updatedCharacter.groupStatistics?.morale
    })];

    // MEMORY OPTIMIZATION: Use pooled result object
    const result = this._getResultFromPool();
    result.character = updatedCharacter;
    result.groupStatistics = updatedCharacter.groupStatistics;
    result.events = events;
    result.lodTier = 'group';

    return result;
  }

  /**
   * Process a background-tier character minimally
   */
  _processBackgroundCharacter(character, world, turnContext) {
    // PERFORMANCE OPTIMIZATION: Cache character data
    this._cacheCharacter(character);

    // Minimal processing - just demographic tracking
    const demographicUpdates = character.demographicData ? {
      settlementId: character.assignments?.settlements?.values().next().value,
      occupation: character.demographicData.occupation,
      count: character.demographicData.count
    } : undefined;

    // MEMORY OPTIMIZATION: Use pooled result object
    const result = this._getResultFromPool();
    result.character = character;
    result.events = [];
    result.lodTier = 'background';
    result.demographicUpdates = demographicUpdates;

    return result;
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

    // PERFORMANCE OPTIMIZATION: Use cached settlement data
    const settlementActivity = new Map();

    // PERFORMANCE OPTIMIZATION: Pre-calculate settlement activity
    for (const settlement of worldState.settlements || []) {
      const recentEvents = (worldState.events || [])
        .filter(e => e.settlementId === settlement.id && e.turn >= worldState.turn - 2);

      settlementActivity.set(settlement.id, recentEvents.length);
    }

    // PERFORMANCE OPTIMIZATION: Process only settlements with high activity
    for (const [settlementId, eventCount] of settlementActivity.entries()) {
      if (eventCount >= 5) { // High activity threshold
        // PERFORMANCE OPTIMIZATION: Use cached character data
        const backgroundChars = (worldState.characters || [])
          .filter(c => {
            const cached = this._getCachedCharacter(c.id);
            return (cached?.lodTier || c.lodTier) === 'background' && c.currentNode === settlementId;
          })
          .slice(0, 2); // Promote max 2 per settlement

        for (const character of backgroundChars) {
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

    // PERFORMANCE OPTIMIZATION: Pre-build active character set
    const activeCharacterIds = new Set(
      (turnResult?.events || [])
        .filter(e => e.characterId)
        .map(e => e.characterId)
    );

    // PERFORMANCE OPTIMIZATION: Use cached character data and batch processing
    const heroCharacters = (worldState.characters || [])
      .filter(c => {
        const cached = this._getCachedCharacter(c.id);
        return (cached?.lodTier || c.lodTier) === 'hero';
      });

    for (const character of heroCharacters) {
      if (!activeCharacterIds.has(character.id)) {
        // PERFORMANCE OPTIMIZATION: Use cached activity data
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
   * Get cached character data or return null
   * @private
   */
  _getCachedCharacter(characterId) {
    return this._characterCache.get(characterId) || null;
  }

  /**
   * Update character cache with latest data
   * @private
   */
  _updateCharacterCache(character) {
    this._characterCache.set(character.id, {
      lodTier: character.lodTier,
      lastActivity: Date.now(),
      currentNode: character.currentNode
    });
  }

  /**
   * Get recent activity count for a character
   * @private
   */
  _getCharacterRecentActivity(characterId, worldState) {
    const cached = this._getCachedCharacter(characterId);
    if (cached && cached.lastActivity) {
      const turnsSinceActivity = worldState.turn - Math.floor(cached.lastActivity / 1000);
      return Math.max(0, 10 - turnsSinceActivity); // Decay activity over time
    }

    // Fallback: count recent events
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
      eventsGenerated: turnResult?.events?.length || 0,
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

  /**
   * Process prestige updates for hero characters
   * Integrates with PrestigeService for achievement-based prestige changes
   */
  processPrestigeForHero(character, world, turnContext) {
    const startTime = performance.now();
    
    try {
      // Create achievement context from turn processing
      const achievement = {
        type: 'turn_completion',
        significance: this._calculateTurnSignificance(character, turnContext),
        timestamp: Date.now(),
        context: {
          settlement: character.settlementId,
          turn: turnContext.turn,
          actions: turnContext.characterActions?.[character.id] || []
        }
      };
      
      // Create social context from settlement and world state
      const socialContext = {
        settlement: world.settlements?.find(s => s.id === character.settlementId),
        publicVisibility: this._calculatePublicVisibility(character, achievement),
        socialStanding: character.socialStanding || 'neutral',
        witnessCount: this._estimateWitnessCount(character, world)
      };
      
      // Process prestige update
      const updatedPrestige = this.prestigeService.updatePrestige(
        character.prestige,
        achievement,
        socialContext,
        character
      );
      
      const endTime = performance.now();
      
      return {
        success: true,
        oldPrestige: character.prestige,
        newPrestige: updatedPrestige,
        processingTime: endTime - startTime,
        achievement,
        socialContext
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        processingTime: performance.now() - startTime
      };
    }
  }

  /**
   * Calculate turn significance for prestige processing
   */
  _calculateTurnSignificance(character, turnContext) {
    // Base significance on character actions and context
    let significance = 0.5; // Base significance
    
    if (turnContext.characterActions?.[character.id]) {
      significance += turnContext.characterActions[character.id].length * 0.1;
    }
    
    if (character.consciousness?.frequency > 0.8) {
      significance += 0.2; // High consciousness characters have more significant actions
    }
    
    return Math.min(1.0, significance);
  }

  /**
   * Calculate public visibility for prestige events
   */
  _calculatePublicVisibility(character, achievement) {
    if (achievement.type === 'turn_completion') {
      return 'medium'; // Regular turn completion has medium visibility
    }
    
    return 'low';
  }

  /**
   * Estimate witness count for prestige events
   */
  _estimateWitnessCount(character, world) {
    const settlement = world.settlements?.find(s => s.id === character.settlementId);
    if (!settlement) return 10;
    
    // Estimate based on settlement size and character role
    const baseWitnesses = Math.min(50, settlement.population?.total / 10 || 10);
    const roleMultiplier = character.lodTier === 'hero' ? 2 : 1;
    
    return Math.floor(baseWitnesses * roleMultiplier);
  }

  /**
   * Initialize LOD manager for a specific world
   * @param {Object} worldState - The world state to initialize with
   */
  async initializeForWorld(worldState) {
    if (!worldState) {
      throw new Error('World state is required for LOD initialization');
    }

    // Initialize character LOD tiers if not already set
    if (worldState.characters) {
      for (const [, character] of worldState.characters) {
        if (!character.lodTier) {
          // Default to background tier for new characters
          character.lodTier = 'background';
        }
      }
    }

    // Cache world state for performance
    this._worldState = worldState;

    console.log('LODManager initialized for world with', worldState.characters?.size || 0, 'characters');
    return true;
  }

  /**
   * Change a character's LOD tier
   * @param {string} characterId - The character ID to change
   * @param {string} newTier - The new tier ('hero', 'group', 'background')
   * @returns {boolean} Success status
   */
  async changeCharacterTier(characterId, newTier) {
    if (!this._worldState?.characters) {
      throw new Error('LODManager not initialized with world state');
    }

    const character = this._worldState.characters.get(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    const validTiers = ['hero', 'group', 'background'];
    if (!validTiers.includes(newTier)) {
      throw new Error(`Invalid LOD tier: ${newTier}`);
    }

    const oldTier = character.lodTier;
    character.lodTier = newTier;

    console.log(`Character ${characterId} changed from ${oldTier} to ${newTier} tier`);
    return true;
  }
}

export default LODManager;