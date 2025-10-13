/**
 * MemoryQueryService
 *
 * Advanced memory querying service that supports flexible memory retrieval
 * across different scopes (personal, settlement, global). Uses MemoryQuery
 * value objects for filtering and provides efficient indexing for large-scale queries.
 */

import BaseDomainService from '../services/BaseDomainService.js';
import MemoryQuery from '../valueObjects/MemoryQuery.js';

class MemoryQueryService extends BaseDomainService {
  constructor(memoryService, significantMemoryService, logger = null, errorHandler = null) {
    super();
    this.memoryService = memoryService;
    this.significantMemoryService = significantMemoryService;
    this.logger = logger;
    this.errorHandler = errorHandler;

    // Memory indexes for efficient querying
    this.characterIndex = new Map(); // characterId -> memory array
    this.settlementIndex = new Map(); // settlementId -> memory array
    this.globalIndex = []; // All memories for global queries

    // Index metadata
    this.indexMetadata = {
      lastUpdated: null,
      totalMemories: 0,
      characterCount: 0,
      settlementCount: 0
    };
  }

  /**
   * Query personal memories for a specific character
   * @param {Object} character - Character to query memories for
   * @param {MemoryQuery|Object} query - Query criteria
   * @returns {Array<Object>} Matching memories sorted by criteria
   */
  queryPersonalMemories(character, query = {}) {
    try {
      if (!character || typeof character !== 'object') {
        throw new Error('Valid character object required');
      }

      const memoryQuery = query instanceof MemoryQuery ? query : new MemoryQuery(query);
      const characterMemories = this._getCharacterMemories(character);

      if (!characterMemories || characterMemories.length === 0) {
        return [];
      }

      // Filter memories using query criteria
      const matchingMemories = characterMemories.filter(memory => memoryQuery.matches(memory));

      // Sort results
      const sortedMemories = this._sortMemories(matchingMemories, memoryQuery);

      // Apply limit
      return sortedMemories.slice(0, memoryQuery.limit);

    } catch (error) {
      this._handleError(error, 'queryPersonalMemories', { characterId: character?.id });
      return [];
    }
  }

  /**
   * Query settlement-level memories across all characters in a settlement
   * @param {Object} settlement - Settlement to query memories for
   * @param {MemoryQuery|Object} query - Query criteria
   * @returns {Array<Object>} Matching memories with character context
   */
  querySettlementHistory(settlement, query = {}) {
    try {
      if (!settlement || typeof settlement !== 'object') {
        throw new Error('Valid settlement object required');
      }

      const memoryQuery = query instanceof MemoryQuery ? query : new MemoryQuery(query);
      const settlementMemories = this._getSettlementMemories(settlement);

      if (!settlementMemories || settlementMemories.length === 0) {
        return [];
      }

      // Filter memories using query criteria
      const matchingMemories = settlementMemories.filter(memory => memoryQuery.matches(memory));

      // Sort results
      const sortedMemories = this._sortMemories(matchingMemories, memoryQuery);

      // Apply limit
      return sortedMemories.slice(0, memoryQuery.limit);

    } catch (error) {
      this._handleError(error, 'querySettlementHistory', { settlementId: settlement?.id });
      return [];
    }
  }

  /**
   * Query global memories across all characters and settlements
   * @param {MemoryQuery|Object} query - Query criteria
   * @returns {Array<Object>} Matching memories with full context
   */
  queryGlobalHistory(query = {}) {
    try {
      const memoryQuery = query instanceof MemoryQuery ? query : new MemoryQuery(query);

      if (!this.globalIndex || this.globalIndex.length === 0) {
        return [];
      }

      // Filter memories using query criteria
      const matchingMemories = this.globalIndex.filter(memory => memoryQuery.matches(memory));

      // Sort results
      const sortedMemories = this._sortMemories(matchingMemories, memoryQuery);

      // Apply limit
      return sortedMemories.slice(0, memoryQuery.limit);

    } catch (error) {
      this._handleError(error, 'queryGlobalHistory');
      return [];
    }
  }

  /**
   * Query memories by relationship context
   * @param {Object} character - Character to query relationship memories for
   * @param {string} targetCharacterId - Target character in relationship
   * @param {MemoryQuery|Object} query - Additional query criteria
   * @returns {Array<Object>} Memories involving the relationship
   */
  queryRelationshipMemories(character, targetCharacterId, query = {}) {
    try {
      if (!character || !targetCharacterId) {
        throw new Error('Character and target character ID required');
      }

      const baseQuery = {
        participants: [targetCharacterId],
        ...query
      };

      return this.queryPersonalMemories(character, baseQuery);

    } catch (error) {
      this._handleError(error, 'queryRelationshipMemories', {
        characterId: character.id,
        targetCharacterId
      });
      return [];
    }
  }

  /**
   * Query memories by interaction type patterns
   * @param {Object} character - Character to query patterns for
   * @param {string} interactionType - Type of interaction to analyze
   * @param {MemoryQuery|Object} query - Additional query criteria
   * @returns {Object} Pattern analysis with success rates and trends
   */
  queryInteractionPatterns(character, interactionType, query = {}) {
    try {
      if (!character || !interactionType) {
        throw new Error('Character and interaction type required');
      }

      const baseQuery = {
        type: [interactionType],
        ...query
      };

      const memories = this.queryPersonalMemories(character, baseQuery);

      return this._analyzeInteractionPatterns(memories, interactionType);

    } catch (error) {
      this._handleError(error, 'queryInteractionPatterns', {
        characterId: character.id,
        interactionType
      });
      return this._getEmptyPatternAnalysis(interactionType);
    }
  }

  /**
   * Query memories by emotional context
   * @param {Object} character - Character to query emotional memories for
   * @param {string} emotionType - Type of emotion ('positive', 'negative', 'traumatic', etc.)
   * @param {MemoryQuery|Object} query - Additional query criteria
   * @returns {Array<Object>} Emotionally relevant memories
   */
  queryEmotionalMemories(character, emotionType, query = {}) {
    try {
      if (!character || !emotionType) {
        throw new Error('Character and emotion type required');
      }

      // Map emotion types to memory criteria
      const emotionCriteria = this._getEmotionCriteria(emotionType);
      const baseQuery = {
        ...emotionCriteria,
        ...query
      };

      return this.queryPersonalMemories(character, baseQuery);

    } catch (error) {
      this._handleError(error, 'queryEmotionalMemories', {
        characterId: character.id,
        emotionType
      });
      return [];
    }
  }

  /**
   * Query memories by time periods
   * @param {Object} character - Character to query temporal memories for
   * @param {string} timePeriod - Time period ('recent', 'past_week', 'past_month', etc.)
   * @param {MemoryQuery|Object} query - Additional query criteria
   * @returns {Array<Object>} Memories from the specified time period
   */
  queryTemporalMemories(character, timePeriod, query = {}) {
    try {
      if (!character || !timePeriod) {
        throw new Error('Character and time period required');
      }

      const timeCriteria = this._getTimePeriodCriteria(timePeriod);
      const baseQuery = {
        timeRange: timeCriteria,
        ...query
      };

      return this.queryPersonalMemories(character, baseQuery);

    } catch (error) {
      this._handleError(error, 'queryTemporalMemories', {
        characterId: character.id,
        timePeriod
      });
      return [];
    }
  }

  /**
   * Get memory statistics for analysis
   * @param {Object} character - Character to get statistics for
   * @returns {Object} Memory statistics and insights
   */
  getMemoryStatistics(character) {
    try {
      if (!character) {
        throw new Error('Character required for memory statistics');
      }

      const memories = this._getCharacterMemories(character);

      if (!memories || memories.length === 0) {
        return this._getEmptyStatistics();
      }

      return this._calculateMemoryStatistics(memories);

    } catch (error) {
      this._handleError(error, 'getMemoryStatistics', { characterId: character.id });
      return this._getEmptyStatistics();
    }
  }

  /**
   * Rebuild memory indexes for efficient querying
   * @param {Array<Object>} characters - All characters to index
   * @param {Array<Object>} settlements - All settlements to index
   * @returns {Object} Index rebuild results
   */
  rebuildIndexes(characters = [], settlements = []) {
    try {
      this.logger?.info('Rebuilding memory indexes...');

      // Clear existing indexes
      this.characterIndex.clear();
      this.settlementIndex.clear();
      this.globalIndex = [];

      let totalMemories = 0;

      // Index character memories
      for (const character of characters) {
        if (character && character.significantMemories) {
          const memories = [...character.significantMemories];
          this.characterIndex.set(character.id, memories);
          this.globalIndex.push(...memories.map(memory => ({
            ...memory,
            characterId: character.id,
            characterName: character.name
          })));
          totalMemories += memories.length;
        }
      }

      // Index settlement memories (aggregate from characters in settlements)
      for (const settlement of settlements) {
        if (settlement && settlement.characters) {
          const settlementMemories = [];

          for (const characterId of settlement.characters) {
            const characterMemories = this.characterIndex.get(characterId) || [];
            settlementMemories.push(...characterMemories.map(memory => ({
              ...memory,
              characterId,
              settlementId: settlement.id,
              settlementName: settlement.name
            })));
          }

          this.settlementIndex.set(settlement.id, settlementMemories);
        }
      }

      // Update metadata
      this.indexMetadata = {
        lastUpdated: Date.now(),
        totalMemories,
        characterCount: this.characterIndex.size,
        settlementCount: this.settlementIndex.size
      };

      this.logger?.info(`Memory indexes rebuilt: ${totalMemories} memories across ${this.characterIndex.size} characters and ${this.settlementIndex.size} settlements`);

      return {
        success: true,
        totalMemories,
        characterCount: this.characterIndex.size,
        settlementCount: this.settlementIndex.size,
        lastUpdated: this.indexMetadata.lastUpdated
      };

    } catch (error) {
      this._handleError(error, 'rebuildIndexes');
      return {
        success: false,
        error: error.message,
        totalMemories: 0,
        characterCount: 0,
        settlementCount: 0
      };
    }
  }

  /**
   * Update indexes incrementally when memories change
   * @param {string} characterId - Character whose memories changed
   * @param {Array<Object>} newMemories - Updated memory array
   */
  updateCharacterIndex(characterId, newMemories = []) {
    try {
      if (!characterId) return;

      // Update character index
      this.characterIndex.set(characterId, [...newMemories]);

      // Update global index
      this.globalIndex = this.globalIndex.filter(memory => memory.characterId !== characterId);
      this.globalIndex.push(...newMemories.map(memory => ({
        ...memory,
        characterId,
        characterName: this._getCharacterName(characterId)
      })));

      // Update settlement indexes that contain this character
      for (const [settlementId, settlementMemories] of this.settlementIndex) {
        const updatedMemories = settlementMemories.filter(memory => memory.characterId !== characterId);
        updatedMemories.push(...newMemories.map(memory => ({
          ...memory,
          characterId,
          settlementId,
          settlementName: this._getSettlementName(settlementId)
        })));
        this.settlementIndex.set(settlementId, updatedMemories);
      }

      this.indexMetadata.lastUpdated = Date.now();

    } catch (error) {
      this._handleError(error, 'updateCharacterIndex', { characterId });
    }
  }

  // Private helper methods

  _getCharacterMemories(character) {
    // Try index first, then fall back to direct access
    let memories = this.characterIndex.get(character.id);

    if (!memories && character.significantMemories) {
      memories = character.significantMemories;
    }

    return memories || [];
  }

  _getSettlementMemories(settlement) {
    // Try index first, then build from character memories
    let memories = this.settlementIndex.get(settlement.id);

    if (!memories && settlement.characters) {
      memories = [];
      for (const characterId of settlement.characters) {
        const characterMemories = this.characterIndex.get(characterId) || [];
        memories.push(...characterMemories.map(memory => ({
          ...memory,
          characterId,
          settlementId: settlement.id
        })));
      }
    }

    return memories || [];
  }

  _sortMemories(memories, query) {
    const sorted = [...memories];

    sorted.sort((a, b) => {
      let aValue, bValue;

      switch (query.sortBy) {
        case 'significance':
          aValue = a.significance || 0;
          bValue = b.significance || 0;
          break;
        case 'emotionalImpact':
          aValue = a.emotionalImpact || 0;
          bValue = b.emotionalImpact || 0;
          break;
        case 'timestamp':
        default:
          aValue = a.timestamp || 0;
          bValue = b.timestamp || 0;
          break;
      }

      if (query.sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return sorted;
  }

  _analyzeInteractionPatterns(memories, interactionType) {
    if (!memories || memories.length === 0) {
      return this._getEmptyPatternAnalysis(interactionType);
    }

    const outcomes = {
      critical_success: 0,
      success: 0,
      partial_success: 0,
      neutral: 0,
      partial_failure: 0,
      failure: 0,
      critical_failure: 0
    };

    let totalSignificance = 0;
    let recentMemories = 0;
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    memories.forEach(memory => {
      if (memory.outcome && outcomes.hasOwnProperty(memory.outcome)) {
        outcomes[memory.outcome]++;
      }
      totalSignificance += memory.significance || 0;

      if (memory.timestamp > weekAgo) {
        recentMemories++;
      }
    });

    const total = memories.length;
    const successRate = (outcomes.critical_success + outcomes.success) / total;
    const averageSignificance = totalSignificance / total;

    return {
      interactionType,
      totalMemories: total,
      successRate,
      averageSignificance,
      outcomes,
      recentActivity: recentMemories,
      trend: this._calculateTrend(memories),
      recommendation: this._generateRecommendation(successRate, recentMemories, interactionType)
    };
  }

  _calculateTrend(memories) {
    if (memories.length < 2) return 'insufficient_data';

    const recent = memories.slice(0, Math.ceil(memories.length / 2));
    const older = memories.slice(Math.ceil(memories.length / 2));

    const recentSuccess = recent.filter(m => ['critical_success', 'success'].includes(m.outcome)).length / recent.length;
    const olderSuccess = older.filter(m => ['critical_success', 'success'].includes(m.outcome)).length / older.length;

    const difference = recentSuccess - olderSuccess;

    if (difference > 0.1) return 'improving';
    if (difference < -0.1) return 'declining';
    return 'stable';
  }

  _generateRecommendation(successRate, recentMemories, interactionType) {
    if (successRate > 0.7) {
      return `Strong performance in ${interactionType} - continue current approach`;
    } else if (successRate < 0.3) {
      return `Poor performance in ${interactionType} - consider alternative strategies`;
    } else if (recentMemories > 5) {
      return `Active experience in ${interactionType} - monitor for patterns`;
    } else {
      return `Limited experience in ${interactionType} - gather more data`;
    }
  }

  _getEmotionCriteria(emotionType) {
    const criteria = {
      positive: {
        outcome: ['critical_success', 'success', 'partial_success'],
        emotionalImpact: { min: 0.6 }
      },
      negative: {
        outcome: ['failure', 'critical_failure', 'partial_failure'],
        emotionalImpact: { min: 0.4 }
      },
      traumatic: {
        outcome: ['critical_failure'],
        emotionalImpact: { min: 0.8 },
        significance: { min: 0.7 }
      },
      joyful: {
        outcome: ['critical_success'],
        emotionalImpact: { min: 0.7 },
        contextTags: ['celebration', 'achievement']
      }
    };

    return criteria[emotionType] || {};
  }

  _getTimePeriodCriteria(timePeriod) {
    const now = Date.now();
    const periods = {
      recent: { start: now - (24 * 60 * 60 * 1000) }, // Last 24 hours
      past_week: { start: now - (7 * 24 * 60 * 60 * 1000) },
      past_month: { start: now - (30 * 24 * 60 * 60 * 1000) },
      past_year: { start: now - (365 * 24 * 60 * 60 * 1000) },
      ancient: { end: now - (365 * 24 * 60 * 60 * 1000) } // More than a year ago
    };

    return periods[timePeriod] || periods.recent;
  }

  _calculateMemoryStatistics(memories) {
    const stats = {
      totalMemories: memories.length,
      averageSignificance: 0,
      averageEmotionalImpact: 0,
      outcomeDistribution: {},
      typeDistribution: {},
      timeDistribution: {},
      mostSignificant: null,
      oldestMemory: null,
      newestMemory: null
    };

    if (memories.length === 0) return stats;

    let totalSignificance = 0;
    let totalEmotionalImpact = 0;

    memories.forEach(memory => {
      totalSignificance += memory.significance || 0;
      totalEmotionalImpact += memory.emotionalImpact || 0;

      // Outcome distribution
      const outcome = memory.outcome || 'unknown';
      stats.outcomeDistribution[outcome] = (stats.outcomeDistribution[outcome] || 0) + 1;

      // Type distribution
      const type = memory.interactionType || 'unknown';
      stats.typeDistribution[type] = (stats.typeDistribution[type] || 0) + 1;

      // Time distribution (rough categorization)
      const age = Date.now() - (memory.timestamp || 0);
      const timeCategory = this._categorizeMemoryAge(age);
      stats.timeDistribution[timeCategory] = (stats.timeDistribution[timeCategory] || 0) + 1;

      // Track most significant
      if (!stats.mostSignificant || (memory.significance || 0) > (stats.mostSignificant.significance || 0)) {
        stats.mostSignificant = memory;
      }

      // Track oldest/newest
      if (!stats.oldestMemory || (memory.timestamp || 0) < (stats.oldestMemory.timestamp || 0)) {
        stats.oldestMemory = memory;
      }
      if (!stats.newestMemory || (memory.timestamp || 0) > (stats.newestMemory.timestamp || 0)) {
        stats.newestMemory = memory;
      }
    });

    stats.averageSignificance = totalSignificance / memories.length;
    stats.averageEmotionalImpact = totalEmotionalImpact / memories.length;

    return stats;
  }

  _categorizeMemoryAge(ageMs) {
    const ageDays = ageMs / (24 * 60 * 60 * 1000);

    if (ageDays < 1) return 'today';
    if (ageDays < 7) return 'this_week';
    if (ageDays < 30) return 'this_month';
    if (ageDays < 365) return 'this_year';
    return 'older';
  }

  _getEmptyStatistics() {
    return {
      totalMemories: 0,
      averageSignificance: 0,
      averageEmotionalImpact: 0,
      outcomeDistribution: {},
      typeDistribution: {},
      timeDistribution: {},
      mostSignificant: null,
      oldestMemory: null,
      newestMemory: null
    };
  }

  _getEmptyPatternAnalysis(interactionType) {
    return {
      interactionType,
      totalMemories: 0,
      successRate: 0,
      averageSignificance: 0,
      outcomes: {
        critical_success: 0,
        success: 0,
        partial_success: 0,
        neutral: 0,
        partial_failure: 0,
        failure: 0,
        critical_failure: 0
      },
      recentActivity: 0,
      trend: 'insufficient_data',
      recommendation: `No experience in ${interactionType} - gather more data`
    };
  }

  _getCharacterName(characterId) {
    // This would need to be implemented to get character names for global index
    // For now, return the ID
    return characterId;
  }

  _getSettlementName(settlementId) {
    // This would need to be implemented to get settlement names
    // For now, return the ID
    return settlementId;
  }

  _handleError(error, operation, context = {}) {
    const errorMessage = `MemoryQueryService.${operation} failed: ${error.message}`;

    if (this.logger) {
      this.logger.error(errorMessage, { ...context, error: error.stack });
    }

    if (this.errorHandler) {
      this.errorHandler.handleError(error, {
        service: 'MemoryQueryService',
        operation,
        context
      });
    }
  }
}

export default MemoryQueryService;