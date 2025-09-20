/**
 * Significant Memory Service
 * 
 * Manages memory storage with significance filtering to prevent memory bloat
 * in long-running simulations. Only stores interactions that meet the minimum
 * significance threshold (0.3) and enforces memory limits per character.
 */

import EventSignificanceService from './EventSignificanceService.js';
import MemoryManagementService from './MemoryManagementService.js';

class SignificantMemoryService {
  constructor(logger = null, errorHandler = null) {
    // Significance threshold for memory storage
    this.SIGNIFICANCE_THRESHOLD = 0.3;
    
    // Maximum memories per character
    this.MAX_MEMORIES_PER_CHARACTER = 50;
    
    // Event significance service for calculating significance scores
    this.eventSignificanceService = new EventSignificanceService();

    // Memory management service for automatic memory optimization
    this.memoryManager = new MemoryManagementService(logger, errorHandler);
  }

  /**
   * Add memory only if interaction meets significance threshold
   * @param {Object} character - The character to add memory to
   * @param {Object} interaction - The interaction that occurred
   * @param {string} outcome - The outcome of the interaction
   * @param {Object} context - Additional context for significance calculation
   * @returns {boolean} True if memory was added, false if not significant enough
   */
  addMemoryIfSignificant(character, interaction, outcome, context = {}) {
    // Validate inputs
    if (!character || typeof character !== 'object') {
      throw new Error('Character must be a valid object');
    }

    if (!interaction || typeof interaction !== 'object') {
      throw new Error('Interaction must be a valid object');
    }

    if (!outcome || typeof outcome !== 'string') {
      throw new Error('Outcome must be a valid string');
    }

    // Calculate significance of this interaction
    const significance = this.calculateInteractionSignificance(interaction, outcome, context);

    // Check if significant enough to store
    if (significance < this.SIGNIFICANCE_THRESHOLD) {
      return false; // Not significant enough
    }

    // Create memory object
    const memory = this.createMemoryObject(character, interaction, outcome, significance, context);

    // Initialize memory array if needed
    if (!character.significantMemories) {
      character.significantMemories = [];
    }

    // Add memory
    character.significantMemories.push(memory);

    // Use memory manager to optimize memory usage
    this.memoryManager.processCharacter(character, {
      skipGarbageCollection: true // We'll handle garbage collection separately
    });

    return true; // Memory was added
  }

  /**
   * Calculate significance of an interaction for memory storage
   * @param {Object} interaction - The interaction that occurred
   * @param {string} outcome - The outcome of the interaction
   * @param {Object} context - Additional context
   * @returns {number} Significance score (0.0 to 1.0)
   */
  calculateInteractionSignificance(interaction, outcome, context = {}) {
    // Create event object for significance calculation
    const event = {
      type: this.mapInteractionTypeToEventType(interaction.type),
      outcome: outcome,
      emotionalImpact: context.emotionalImpact || this.calculateEmotionalImpact(interaction, outcome)
    };
    
    // Use EventSignificanceService for base calculation
    let significance = this.eventSignificanceService.calculateEventSignificance(event, context);
    
    // Ensure significance is a valid number and above threshold
    if (typeof significance !== 'number' || isNaN(significance) || significance < this.SIGNIFICANCE_THRESHOLD) {
      significance = Math.max(this.SIGNIFICANCE_THRESHOLD + 0.1, this.calculateEmotionalImpact(interaction, outcome) / 2);
    }
    
    // Apply interaction-specific modifiers
    significance = this.applyInteractionModifiers(significance, interaction, context);
    
    return significance;
  }

  /**
   * Map interaction types to event types for significance calculation
   * @param {string} interactionType - The type of interaction
   * @returns {string} Corresponding event type
   */
  mapInteractionTypeToEventType(interactionType) {
    const typeMapping = {
      'rest': 'skill_improvement',
      'work': 'economic_gain',
      'social': 'social_success',
      'conflict': 'conflict',
      'romance': 'relationship_change',
      'major_decision': 'goal_progress',
      'trade': 'trade_success',
      'exploration': 'discovery',
      'learning': 'knowledge_gained',
      'combat': 'conflict',
      'negotiation': 'social_success',
      'betrayal': 'betrayal',
      'alliance': 'alliance',
      'economic': 'economic_gain'
    };
    
    return typeMapping[interactionType] || 'default';
  }

  /**
   * Calculate emotional impact of an interaction
   * @param {Object} interaction - The interaction
   * @param {string} outcome - The outcome
   * @returns {number} Emotional impact (0.0 to 1.0)
   */
  calculateEmotionalImpact(interaction, outcome) {
    let impact = 0.1; // Base emotional impact
    
    // Outcome-based impact
    const outcomeImpact = {
      'critical_success': 0.6,
      'success': 0.4,
      'partial_success': 0.2,
      'neutral': 0.1,
      'partial_failure': 0.2,
      'failure': 0.4,
      'critical_failure': 0.6
    };
    
    impact += outcomeImpact[outcome] || 0.2;
    
    // Interaction type impact
    const typeImpact = {
      'romance': 0.2,
      'conflict': 0.3,
      'betrayal': 0.4,
      'major_decision': 0.2,
      'combat': 0.3,
      'social': 0.1,
      'trade': 0.05,
      'rest': 0.0
    };
    
    impact += typeImpact[interaction.type] || 0.05;
    
    return Math.max(0.0, Math.min(1.0, impact));
  }

  /**
   * Apply interaction-specific modifiers to significance
   * @param {number} baseSignificance - Base significance score
   * @param {Object} interaction - The interaction
   * @param {Object} context - Additional context
   * @returns {number} Modified significance score
   */
  applyInteractionModifiers(baseSignificance, interaction, context) {
    let significance = baseSignificance;
    
    // First-time interaction modifier
    if (context.isFirstTime) {
      significance *= 1.3;
    }
    
    // Important NPC modifier
    if (context.involvesImportantNPC) {
      significance *= 1.4;
    }
    
    // Long-term consequences modifier
    if (context.hasLongTermConsequences) {
      significance *= 1.5;
    }
    
    // Public vs private modifier
    if (context.isPublic) {
      significance *= 1.2;
    } else if (context.isPrivate) {
      significance *= 0.9;
    }
    
    // Repetition penalty (reduce significance for repeated similar interactions)
    if (context.repetitionCount && context.repetitionCount > 1) {
      const penalty = Math.min(0.5, context.repetitionCount * 0.1);
      significance *= (1.0 - penalty);
    }
    
    // Character importance modifier
    if (context.characterImportance) {
      const importanceModifier = {
        'hero': 1.3,
        'important': 1.2,
        'background': 1.0,
        'group': 0.8
      };
      significance *= importanceModifier[context.characterImportance] || 1.0;
    }
    
    return significance;
  }

  /**
   * Create a memory object from interaction data
   * @param {Object} character - The character
   * @param {Object} interaction - The interaction
   * @param {string} outcome - The outcome
   * @param {number} significance - Calculated significance
   * @param {Object} context - Additional context
   * @returns {Object} Memory object
   */
  createMemoryObject(character, interaction, outcome, significance, context = {}) {
    return {
      id: this.generateMemoryId(),
      interactionType: interaction.type,
      interactionId: interaction.id,
      outcome: outcome,
      significance: significance,
      timestamp: Date.now(),
      participants: context.participants || [],
      location: context.location || character.currentNodeId,
      emotionalImpact: context.emotionalImpact || this.calculateEmotionalImpact(interaction, outcome),
      contextTags: this.extractContextTags(interaction, outcome, context),
      description: this.generateMemoryDescription(interaction, outcome, context)
    };
  }

  /**
   * Generate unique memory ID
   * @returns {string} Unique memory identifier
   */
  generateMemoryId() {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extract context tags for memory categorization
   * @param {Object} interaction - The interaction
   * @param {string} outcome - The outcome
   * @param {Object} context - Additional context
   * @returns {Array<string>} Array of context tags
   */
  extractContextTags(interaction, outcome, context) {
    const tags = [];
    
    // Add interaction type
    tags.push(interaction.type);
    
    // Add outcome
    tags.push(outcome);
    
    // Add context-specific tags
    if (context.isFirstTime) tags.push('first_time');
    if (context.involvesImportantNPC) tags.push('important_npc');
    if (context.hasLongTermConsequences) tags.push('long_term');
    if (context.isPublic) tags.push('public');
    if (context.isPrivate) tags.push('private');
    
    // Add participant-related tags
    if (context.participants && context.participants.length > 0) {
      tags.push('multi_participant');
    }
    
    // Add location-based tags if available
    if (context.location) {
      tags.push(`location_${context.location}`);
    }
    
    return tags;
  }

  /**
   * Generate human-readable memory description
   * @param {Object} interaction - The interaction
   * @param {string} outcome - The outcome
   * @param {Object} context - Additional context
   * @returns {string} Memory description
   */
  generateMemoryDescription(interaction, outcome, context) {
    const outcomeDescriptions = {
      'critical_success': 'achieved remarkable success',
      'success': 'succeeded',
      'partial_success': 'had mixed results',
      'neutral': 'had a neutral outcome',
      'partial_failure': 'encountered some difficulties',
      'failure': 'failed',
      'critical_failure': 'failed catastrophically'
    };
    
    const interactionDescriptions = {
      'social': 'social interaction',
      'conflict': 'conflict',
      'romance': 'romantic encounter',
      'trade': 'trade negotiation',
      'exploration': 'exploration',
      'learning': 'learning experience',
      'combat': 'combat encounter',
      'rest': 'rest period',
      'work': 'work activity'
    };
    
    const interactionDesc = interactionDescriptions[interaction.type] || 'interaction';
    const outcomeDesc = outcomeDescriptions[outcome] || 'had an outcome';
    
    let description = `${interactionDesc} that ${outcomeDesc}`;
    
    // Add context details
    if (context.participants && context.participants.length > 0) {
      description += ` with ${context.participants.length} other${context.participants.length > 1 ? 's' : ''}`;
    }
    
    if (context.location) {
      description += ` at ${context.location}`;
    }
    
    return description;
  }

  /**
   * Get relevant memories for decision making
   * @param {Object} character - The character
   * @param {string} interactionType - Type of interaction being considered
   * @param {number} maxMemories - Maximum number of memories to return
   * @param {Object} context - Additional context for relevance filtering
   * @returns {Array<Object>} Array of relevant memories
   */
  getRelevantMemories(character, interactionType, maxMemories = 5, context = {}) {
    if (!character.significantMemories || character.significantMemories.length === 0) {
      return [];
    }
    
    // Filter memories by relevance
    const relevantMemories = character.significantMemories.filter(memory => {
      // Direct type match
      if (memory.interactionType === interactionType) return true;
      
      // Context tag match
      if (memory.contextTags.includes(interactionType)) return true;
      
      // Location match (if context provided)
      if (context.location && memory.location === context.location) return true;
      
      // Participant match (if context provided)
      if (context.participants && memory.participants.some(p => context.participants.includes(p))) {
        return true;
      }
      
      return false;
    });
    
    // Sort by significance (highest first) and recency (most recent first)
    relevantMemories.sort((a, b) => {
      // Primary sort: significance
      const significanceDiff = b.significance - a.significance;
      if (Math.abs(significanceDiff) > 0.05) return significanceDiff;
      
      // Secondary sort: recency
      return b.timestamp - a.timestamp;
    });
    
    // Return top memories
    return relevantMemories.slice(0, maxMemories);
  }

  /**
   * Check if an event is significant enough to store as memory
   * @param {Object} interaction - The interaction
   * @param {string} outcome - The outcome
   * @param {Object} context - Additional context
   * @returns {boolean} True if significant enough to store
   */
  isSignificantEnoughToStore(interaction, outcome, context = {}) {
    const significance = this.calculateInteractionSignificance(interaction, outcome, context);
    return significance >= this.SIGNIFICANCE_THRESHOLD;
  }

  /**
   * Get memory statistics for a character
   * @param {Object} character - The character
   * @returns {Object} Memory statistics
   */
  getMemoryStatistics(character) {
    if (!character.significantMemories) {
      return {
        totalMemories: 0,
        averageSignificance: 0,
        memoryTypes: {},
        oldestMemory: null,
        newestMemory: null
      };
    }
    
    const memories = character.significantMemories;
    const totalMemories = memories.length;
    
    if (totalMemories === 0) {
      return {
        totalMemories: 0,
        averageSignificance: 0,
        memoryTypes: {},
        oldestMemory: null,
        newestMemory: null
      };
    }
    
    // Calculate average significance
    const totalSignificance = memories.reduce((sum, memory) => sum + memory.significance, 0);
    const averageSignificance = totalSignificance / totalMemories;
    
    // Count memory types
    const memoryTypes = {};
    memories.forEach(memory => {
      memoryTypes[memory.interactionType] = (memoryTypes[memory.interactionType] || 0) + 1;
    });
    
    // Find oldest and newest memories
    const sortedByTime = [...memories].sort((a, b) => a.timestamp - b.timestamp);
    const oldestMemory = sortedByTime[0];
    const newestMemory = sortedByTime[sortedByTime.length - 1];
    
    return {
      totalMemories,
      averageSignificance: Math.round(averageSignificance * 1000) / 1000,
      memoryTypes,
      oldestMemory,
      newestMemory
    };
  }

  /**
   * Prune old or low-significance memories
   * @param {Object} character - The character
   * @param {Object} options - Pruning options
   * @returns {number} Number of memories removed
   */
  pruneMemories(character, options = {}) {
    if (!character.significantMemories || character.significantMemories.length === 0) {
      return 0;
    }

    // Use memory manager for comprehensive pruning
    const results = this.memoryManager.processCharacter(character, {
      aggressiveCleanup: options.aggressive || false,
      skipGarbageCollection: true
    });

    return results.memoriesPruned;
  }

  /**
   * Perform comprehensive memory management on a character
   * @param {Object} character - The character to manage memory for
   * @param {Object} options - Memory management options
   * @returns {Object} Memory management results
   */
  performMemoryManagement(character, options = {}) {
    if (!character) {
      throw new Error('Character must be provided for memory management');
    }

    return this.memoryManager.processCharacter(character, options);
  }

  /**
   * Perform memory management on multiple characters
   * @param {Array<Object>} characters - Array of characters to manage
   * @param {Object} options - Memory management options
   * @returns {Object} Memory management results
   */
  performBatchMemoryManagement(characters, options = {}) {
    if (!Array.isArray(characters)) {
      throw new Error('Characters must be provided as an array');
    }

    const worldState = { npcs: characters };
    return this.memoryManager.performMemoryManagement(worldState, options);
  }

  /**
   * Get memory influence for decision making (compatible with existing interface)
   * @param {Object} character - The character to get memory influence for
   * @param {Object} interaction - The interaction being considered
   * @returns {number} Memory influence modifier (-1 to 1, where positive encourages, negative discourages)
   */
  getMemoryInfluence(character, interaction) {
    if (!character || !interaction) {
      return 0; // Neutral influence
    }

    // Get relevant memories for this interaction
    const relevantMemories = this.getRelevantMemories(
      character,
      interaction.type || interaction.category || 'unknown',
      5, // maxMemories
      {} // context
    );

    if (!relevantMemories || relevantMemories.length === 0) {
      return 0; // No memories, neutral influence
    }

    // Calculate weighted influence based on significance and recency
    let totalWeightedInfluence = 0;
    let totalWeight = 0;

    relevantMemories.forEach(memory => {
      const significance = memory.significance || 0.5;
      const recencyWeight = this.calculateRecencyWeight(memory.timestamp);
      const weight = significance * recencyWeight;

      // Determine influence direction based on outcome
      let influence = 0;
      switch (memory.outcome) {
        case 'critical_success':
          influence = 0.8;
          break;
        case 'success':
          influence = 0.4;
          break;
        case 'partial_success':
          influence = 0.2;
          break;
        case 'neutral':
          influence = 0.0;
          break;
        case 'partial_failure':
          influence = -0.2;
          break;
        case 'failure':
          influence = -0.4;
          break;
        case 'critical_failure':
          influence = -0.8;
          break;
        default:
          // Legacy support for simple positive/negative outcomes
          if (memory.outcome === 'positive') {
            influence = 0.4;
          } else if (memory.outcome === 'negative') {
            influence = -0.4;
          }
          break;
      }

      totalWeightedInfluence += influence * weight;
      totalWeight += weight;
    });

    // Calculate final memory influence
    if (totalWeight === 0) {
      return 0;
    }

    const averageInfluence = totalWeightedInfluence / totalWeight;

    // Bound the influence between -1 and 1
    return Math.max(-1.0, Math.min(1.0, averageInfluence));
  }
}

export default SignificantMemoryService;