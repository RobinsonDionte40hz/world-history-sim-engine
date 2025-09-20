/**
 * Event Significance Service
 * 
 * Calculates significance scores for events to determine if they should trigger
 * consciousness updates or be stored as memories. Uses a threshold-based system
 * where events with significance >= 0.3 are considered significant.
 */

class EventSignificanceService {
  constructor() {
    // Significance threshold for triggering consciousness updates
    this.SIGNIFICANCE_THRESHOLD = 0.3;
    
    // Base significance values for different event types
    this.EVENT_TYPE_SIGNIFICANCE = {
      // Social interactions
      'social_success': 0.4,
      'social_failure': 0.5,
      'relationship_change': 0.6,
      'conflict': 0.7,
      'betrayal': 0.8,
      'alliance': 0.6,
      
      // Economic events
      'trade_success': 0.3,
      'trade_failure': 0.4,
      'economic_gain': 0.4,
      'economic_loss': 0.5,
      'investment_success': 0.5,
      'investment_failure': 0.6,
      
      // Goal-related events
      'goal_progress': 0.3,
      'goal_completion': 0.7,
      'goal_failure': 0.6,
      'new_goal': 0.4,
      
      // Life events
      'birth': 0.8,
      'death': 0.9,
      'marriage': 0.8,
      'coming_of_age': 0.7,
      'injury': 0.6,
      'recovery': 0.5,
      
      // Political events
      'leadership_change': 0.7,
      'war_declaration': 0.8,
      'peace_treaty': 0.7,
      'exile': 0.8,
      'promotion': 0.6,
      'demotion': 0.5,
      
      // Discovery and learning
      'skill_improvement': 0.3,
      'knowledge_gained': 0.4,
      'discovery': 0.6,
      'revelation': 0.7,
      
      // Default for unknown types
      'default': 0.2
    };
    
    // Outcome modifiers that adjust base significance
    this.OUTCOME_MODIFIERS = {
      'critical_success': 1.5,
      'success': 1.2,
      'partial_success': 1.0,
      'neutral': 1.0,
      'partial_failure': 1.1,
      'failure': 1.3,
      'critical_failure': 1.6
    };
    
    // Emotional impact multipliers
    this.EMOTIONAL_IMPACT_MULTIPLIERS = {
      'minimal': 0.8,
      'low': 0.9,
      'moderate': 1.0,
      'high': 1.2,
      'extreme': 1.5
    };
  }

  /**
   * Calculate the significance score for an event
   * @param {Object} event - The event to evaluate
   * @param {string} event.type - Type of event (e.g., 'social_success', 'goal_completion')
   * @param {string} event.outcome - Outcome of the event (e.g., 'success', 'failure')
   * @param {number} event.emotionalImpact - Emotional impact score (0.0 to 1.0)
   * @param {Object} context - Additional context for significance calculation
   * @returns {number} Significance score (0.0 to 1.0+)
   */
  calculateEventSignificance(event, context = {}) {
    if (!event || typeof event !== 'object') {
      throw new Error('Event must be a valid object');
    }

    // Get base significance for event type
    const baseSignificance = this.getBaseSignificance(event.type);
    
    // Apply outcome modifier
    const outcomeModifier = this.getOutcomeModifier(event.outcome);
    
    // Apply emotional impact multiplier
    const emotionalMultiplier = this.getEmotionalImpactMultiplier(event.emotionalImpact);
    
    // Calculate base score
    let significance = baseSignificance * outcomeModifier * emotionalMultiplier;
    
    // Apply contextual modifiers
    significance = this.applyContextualModifiers(significance, event, context);
    
    // Ensure significance is within reasonable bounds (0.0 to 1.0)
    return Math.max(0.0, Math.min(1.0, significance));
  }

  /**
   * Get base significance value for an event type
   * @param {string} eventType - The type of event
   * @returns {number} Base significance value
   */
  getBaseSignificance(eventType) {
    if (!eventType || typeof eventType !== 'string') {
      return this.EVENT_TYPE_SIGNIFICANCE.default;
    }
    
    return this.EVENT_TYPE_SIGNIFICANCE[eventType.toLowerCase()] || 
           this.EVENT_TYPE_SIGNIFICANCE.default;
  }

  /**
   * Get outcome modifier for the event result
   * @param {string} outcome - The outcome of the event
   * @returns {number} Outcome modifier
   */
  getOutcomeModifier(outcome) {
    if (!outcome || typeof outcome !== 'string') {
      return this.OUTCOME_MODIFIERS.neutral;
    }
    
    return this.OUTCOME_MODIFIERS[outcome.toLowerCase()] || 
           this.OUTCOME_MODIFIERS.neutral;
  }

  /**
   * Get emotional impact multiplier
   * @param {number|string} emotionalImpact - Emotional impact (0.0-1.0 or string)
   * @returns {number} Emotional impact multiplier
   */
  getEmotionalImpactMultiplier(emotionalImpact) {
    if (typeof emotionalImpact === 'number') {
      // Convert numeric emotional impact (0.0-1.0) to multiplier
      if (emotionalImpact <= 0.2) return this.EMOTIONAL_IMPACT_MULTIPLIERS.minimal;
      if (emotionalImpact <= 0.4) return this.EMOTIONAL_IMPACT_MULTIPLIERS.low;
      if (emotionalImpact <= 0.6) return this.EMOTIONAL_IMPACT_MULTIPLIERS.moderate;
      if (emotionalImpact <= 0.8) return this.EMOTIONAL_IMPACT_MULTIPLIERS.high;
      return this.EMOTIONAL_IMPACT_MULTIPLIERS.extreme;
    }
    
    if (typeof emotionalImpact === 'string') {
      return this.EMOTIONAL_IMPACT_MULTIPLIERS[emotionalImpact.toLowerCase()] || 
             this.EMOTIONAL_IMPACT_MULTIPLIERS.moderate;
    }
    
    return this.EMOTIONAL_IMPACT_MULTIPLIERS.moderate;
  }

  /**
   * Apply contextual modifiers to significance score
   * @param {number} baseSignificance - Base significance score
   * @param {Object} event - The event object
   * @param {Object} context - Additional context
   * @returns {number} Modified significance score
   */
  applyContextualModifiers(baseSignificance, event, context) {
    let modifiedSignificance = baseSignificance;
    
    // First-time event modifier (increases significance)
    if (context.isFirstTime) {
      modifiedSignificance *= 1.3;
    }
    
    // Repeated event modifier (decreases significance)
    if (context.repetitionCount && context.repetitionCount > 1) {
      const repetitionPenalty = Math.min(0.5, context.repetitionCount * 0.1);
      modifiedSignificance *= (1.0 - repetitionPenalty);
    }
    
    // Character importance modifier
    if (context.characterImportance) {
      const importanceModifier = this.getCharacterImportanceModifier(context.characterImportance);
      modifiedSignificance *= importanceModifier;
    }
    
    // Relationship significance modifier
    if (context.relationshipStrength) {
      const relationshipModifier = this.getRelationshipModifier(context.relationshipStrength);
      modifiedSignificance *= relationshipModifier;
    }
    
    // Time-based modifier (recent events are more significant)
    if (context.timeSinceLastSimilarEvent) {
      const timeModifier = this.getTimeBasedModifier(context.timeSinceLastSimilarEvent);
      modifiedSignificance *= timeModifier;
    }
    
    return modifiedSignificance;
  }

  /**
   * Get character importance modifier
   * @param {string} importance - Character importance level
   * @returns {number} Importance modifier
   */
  getCharacterImportanceModifier(importance) {
    const modifiers = {
      'background': 0.8,
      'minor': 0.9,
      'important': 1.1,
      'major': 1.3,
      'hero': 1.5
    };
    
    return modifiers[importance.toLowerCase()] || 1.0;
  }

  /**
   * Get relationship strength modifier
   * @param {number} relationshipStrength - Relationship strength (-100 to +100)
   * @returns {number} Relationship modifier
   */
  getRelationshipModifier(relationshipStrength) {
    if (typeof relationshipStrength !== 'number') {
      return 1.0;
    }
    
    // Stronger relationships (positive or negative) increase significance
    const absStrength = Math.abs(relationshipStrength);
    if (absStrength >= 80) return 1.4;
    if (absStrength >= 60) return 1.3;
    if (absStrength >= 40) return 1.2;
    if (absStrength >= 20) return 1.1;
    return 1.0;
  }

  /**
   * Get time-based modifier for event significance
   * @param {number} timeSinceLastSimilarEvent - Time in simulation turns
   * @returns {number} Time-based modifier
   */
  getTimeBasedModifier(timeSinceLastSimilarEvent) {
    if (typeof timeSinceLastSimilarEvent !== 'number' || timeSinceLastSimilarEvent < 0) {
      return 1.0;
    }
    
    // Recent similar events reduce significance
    if (timeSinceLastSimilarEvent <= 5) return 0.7;
    if (timeSinceLastSimilarEvent <= 10) return 0.8;
    if (timeSinceLastSimilarEvent <= 20) return 0.9;
    return 1.0;
  }

  /**
   * Check if an event is significant enough to trigger consciousness updates
   * @param {Object} event - The event to check
   * @param {Object} context - Additional context
   * @returns {boolean} True if event is significant
   */
  isEventSignificant(event, context = {}) {
    const significance = this.calculateEventSignificance(event, context);
    return significance >= this.SIGNIFICANCE_THRESHOLD;
  }

  /**
   * Classify event significance level
   * @param {Object} event - The event to classify
   * @param {Object} context - Additional context
   * @returns {string} Significance level ('minimal', 'low', 'moderate', 'high', 'extreme')
   */
  classifyEventSignificance(event, context = {}) {
    const significance = this.calculateEventSignificance(event, context);
    
    if (significance < 0.2) return 'minimal';
    if (significance < 0.4) return 'low';
    if (significance < 0.6) return 'moderate';
    if (significance < 0.8) return 'high';
    return 'extreme';
  }

  /**
   * Get significance threshold for consciousness updates
   * @returns {number} Significance threshold
   */
  getSignificanceThreshold() {
    return this.SIGNIFICANCE_THRESHOLD;
  }

  /**
   * Set significance threshold for consciousness updates
   * @param {number} threshold - New threshold value (0.0 to 1.0)
   */
  setSignificanceThreshold(threshold) {
    if (typeof threshold !== 'number' || threshold < 0 || threshold > 1) {
      throw new Error('Significance threshold must be a number between 0.0 and 1.0');
    }
    
    this.SIGNIFICANCE_THRESHOLD = threshold;
  }

  /**
   * Get all supported event types and their base significance values
   * @returns {Object} Event types and their significance values
   */
  getSupportedEventTypes() {
    return { ...this.EVENT_TYPE_SIGNIFICANCE };
  }

  /**
   * Add or update event type significance
   * @param {string} eventType - The event type to add/update
   * @param {number} significance - Base significance value (0.0 to 1.0)
   */
  setEventTypeSignificance(eventType, significance) {
    if (typeof eventType !== 'string' || eventType.trim() === '') {
      throw new Error('Event type must be a non-empty string');
    }
    
    if (typeof significance !== 'number' || significance < 0 || significance > 1) {
      throw new Error('Significance must be a number between 0.0 and 1.0');
    }
    
    this.EVENT_TYPE_SIGNIFICANCE[eventType.toLowerCase()] = significance;
  }
}

export default EventSignificanceService;