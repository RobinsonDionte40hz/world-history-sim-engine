/**
 * MemoryQuery Value Object
 *
 * Immutable value object for memory querying criteria.
 * Supports flexible filtering by type, time, location, participants, and significance.
 * Used by MemoryQueryService for efficient memory retrieval.
 */

class MemoryQuery {
  constructor(criteria = {}) {
    // Validate input
    if (typeof criteria !== 'object' || criteria === null) {
      throw new Error('MemoryQuery criteria must be an object');
    }

    // Core filtering criteria
    this.type = this._validateType(criteria.type);
    this.timeRange = this._validateTimeRange(criteria.timeRange);
    this.location = this._validateLocation(criteria.location);
    this.participants = this._validateParticipants(criteria.participants);
    this.significance = this._validateSignificance(criteria.significance);

    // Advanced filtering
    this.outcome = this._validateOutcome(criteria.outcome);
    this.emotionalImpact = this._validateEmotionalImpact(criteria.emotionalImpact);
    this.contextTags = this._validateContextTags(criteria.contextTags);

    // Query options
    this.limit = this._validateLimit(criteria.limit);
    this.sortBy = this._validateSortBy(criteria.sortBy);
    this.sortOrder = this._validateSortOrder(criteria.sortOrder);

    // Make immutable
    Object.freeze(this);
  }

  /**
   * Validate and normalize memory type
   * @param {string|string[]} type - Memory type(s) to filter by
   * @returns {string[]|null} Normalized type array or null for all types
   */
  _validateType(type) {
    if (type === undefined || type === null) {
      return null; // No type filter
    }

    if (typeof type === 'string') {
      return [type];
    }

    if (Array.isArray(type)) {
      return type.filter(t => typeof t === 'string' && t.length > 0);
    }

    throw new Error('MemoryQuery type must be a string or array of strings');
  }

  /**
   * Validate time range criteria
   * @param {Object} timeRange - Time range with start/end timestamps
   * @returns {Object|null} Validated time range or null
   */
  _validateTimeRange(timeRange) {
    if (!timeRange) return null;

    const validated = {};

    if (timeRange.start !== undefined) {
      if (typeof timeRange.start !== 'number' || timeRange.start < 0) {
        throw new Error('Time range start must be a positive number (timestamp)');
      }
      validated.start = timeRange.start;
    }

    if (timeRange.end !== undefined) {
      if (typeof timeRange.end !== 'number' || timeRange.end < 0) {
        throw new Error('Time range end must be a positive number (timestamp)');
      }
      validated.end = timeRange.end;
    }

    if (timeRange.relative !== undefined) {
      if (typeof timeRange.relative !== 'string') {
        throw new Error('Time range relative must be a string');
      }
      validated.relative = timeRange.relative;
    }

    // Ensure start is before end if both provided
    if (validated.start && validated.end && validated.start >= validated.end) {
      throw new Error('Time range start must be before end');
    }

    return Object.keys(validated).length > 0 ? validated : null;
  }

  /**
   * Validate location criteria
   * @param {string|string[]} location - Location(s) to filter by
   * @returns {string[]|null} Validated location array or null
   */
  _validateLocation(location) {
    if (location === undefined || location === null) {
      return null;
    }

    if (typeof location === 'string') {
      return [location];
    }

    if (Array.isArray(location)) {
      return location.filter(loc => typeof loc === 'string' && loc.length > 0);
    }

    throw new Error('MemoryQuery location must be a string or array of strings');
  }

  /**
   * Validate participants criteria
   * @param {string|string[]} participants - Participant ID(s) to filter by
   * @returns {string[]|null} Validated participant array or null
   */
  _validateParticipants(participants) {
    if (participants === undefined || participants === null) {
      return null;
    }

    if (typeof participants === 'string') {
      return [participants];
    }

    if (Array.isArray(participants)) {
      return participants.filter(p => typeof p === 'string' && p.length > 0);
    }

    throw new Error('MemoryQuery participants must be a string or array of strings');
  }

  /**
   * Validate significance criteria
   * @param {Object} significance - Significance range (min/max)
   * @returns {Object|null} Validated significance range or null
   */
  _validateSignificance(significance) {
    if (!significance) return null;

    const validated = {};

    if (significance.min !== undefined) {
      if (typeof significance.min !== 'number' || significance.min < 0 || significance.min > 1) {
        throw new Error('Significance min must be a number between 0 and 1');
      }
      validated.min = significance.min;
    }

    if (significance.max !== undefined) {
      if (typeof significance.max !== 'number' || significance.max < 0 || significance.max > 1) {
        throw new Error('Significance max must be a number between 0 and 1');
      }
      validated.max = significance.max;
    }

    // Ensure min is less than max if both provided
    if (validated.min !== undefined && validated.max !== undefined && validated.min >= validated.max) {
      throw new Error('Significance min must be less than max');
    }

    return Object.keys(validated).length > 0 ? validated : null;
  }

  /**
   * Validate outcome criteria
   * @param {string|string[]} outcome - Outcome(s) to filter by
   * @returns {string[]|null} Validated outcome array or null
   */
  _validateOutcome(outcome) {
    if (outcome === undefined || outcome === null) {
      return null;
    }

    const validOutcomes = [
      'critical_success', 'success', 'partial_success', 'neutral',
      'partial_failure', 'failure', 'critical_failure', 'positive', 'negative'
    ];

    if (typeof outcome === 'string') {
      if (!validOutcomes.includes(outcome)) {
        throw new Error(`Invalid outcome: ${outcome}`);
      }
      return [outcome];
    }

    if (Array.isArray(outcome)) {
      const validated = outcome.filter(o => validOutcomes.includes(o));
      return validated.length > 0 ? validated : null;
    }

    throw new Error('MemoryQuery outcome must be a string or array of strings');
  }

  /**
   * Validate emotional impact criteria
   * @param {Object} emotionalImpact - Emotional impact range (min/max)
   * @returns {Object|null} Validated emotional impact range or null
   */
  _validateEmotionalImpact(emotionalImpact) {
    if (!emotionalImpact) return null;

    const validated = {};

    if (emotionalImpact.min !== undefined) {
      if (typeof emotionalImpact.min !== 'number' || emotionalImpact.min < 0 || emotionalImpact.min > 1) {
        throw new Error('Emotional impact min must be a number between 0 and 1');
      }
      validated.min = emotionalImpact.min;
    }

    if (emotionalImpact.max !== undefined) {
      if (typeof emotionalImpact.max !== 'number' || emotionalImpact.max < 0 || emotionalImpact.max > 1) {
        throw new Error('Emotional impact max must be a number between 0 and 1');
      }
      validated.max = emotionalImpact.max;
    }

    // Ensure min is less than max if both provided
    if (validated.min !== undefined && validated.max !== undefined && validated.min >= validated.max) {
      throw new Error('Emotional impact min must be less than max');
    }

    return Object.keys(validated).length > 0 ? validated : null;
  }

  /**
   * Validate context tags criteria
   * @param {string|string[]} contextTags - Context tag(s) to filter by
   * @returns {string[]|null} Validated context tags array or null
   */
  _validateContextTags(contextTags) {
    if (contextTags === undefined || contextTags === null) {
      return null;
    }

    if (typeof contextTags === 'string') {
      return [contextTags];
    }

    if (Array.isArray(contextTags)) {
      return contextTags.filter(tag => typeof tag === 'string' && tag.length > 0);
    }

    throw new Error('MemoryQuery contextTags must be a string or array of strings');
  }

  /**
   * Validate result limit
   * @param {number} limit - Maximum number of results
   * @returns {number} Validated limit (default 10, max 100)
   */
  _validateLimit(limit) {
    if (limit === undefined || limit === null) {
      return 10; // Default limit
    }

    if (typeof limit !== 'number' || limit <= 0 || !Number.isInteger(limit)) {
      throw new Error('MemoryQuery limit must be a positive integer');
    }

    return Math.min(limit, 100); // Cap at 100
  }

  /**
   * Validate sort field
   * @param {string} sortBy - Field to sort by
   * @returns {string} Validated sort field (default 'timestamp')
   */
  _validateSortBy(sortBy) {
    const validSortFields = ['timestamp', 'significance', 'emotionalImpact'];

    if (sortBy === undefined || sortBy === null) {
      return 'timestamp'; // Default sort
    }

    if (typeof sortBy !== 'string' || !validSortFields.includes(sortBy)) {
      throw new Error(`MemoryQuery sortBy must be one of: ${validSortFields.join(', ')}`);
    }

    return sortBy;
  }

  /**
   * Validate sort order
   * @param {string} sortOrder - Sort direction
   * @returns {string} Validated sort order (default 'desc')
   */
  _validateSortOrder(sortOrder) {
    const validOrders = ['asc', 'desc'];

    if (sortOrder === undefined || sortOrder === null) {
      return 'desc'; // Default descending (newest/most significant first)
    }

    if (typeof sortOrder !== 'string' || !validOrders.includes(sortOrder)) {
      throw new Error('MemoryQuery sortOrder must be "asc" or "desc"');
    }

    return sortOrder;
  }

  /**
   * Check if this query matches a memory
   * @param {Object} memory - Memory object to test
   * @returns {boolean} True if memory matches all criteria
   */
  matches(memory) {
    if (!memory || typeof memory !== 'object') {
      return false;
    }

    // Type filter
    if (this.type && !this.type.includes(memory.interactionType)) {
      return false;
    }

    // Time range filter
    if (this.timeRange) {
      if (this.timeRange.start && memory.timestamp < this.timeRange.start) {
        return false;
      }
      if (this.timeRange.end && memory.timestamp > this.timeRange.end) {
        return false;
      }
    }

    // Location filter
    if (this.location && !this.location.includes(memory.location)) {
      return false;
    }

    // Participants filter
    if (this.participants) {
      const memoryParticipants = memory.participants || [];
      const hasMatchingParticipant = this.participants.some(p => memoryParticipants.includes(p));
      if (!hasMatchingParticipant) {
        return false;
      }
    }

    // Significance filter
    if (this.significance) {
      const sig = memory.significance || 0;
      if (this.significance.min !== undefined && sig < this.significance.min) {
        return false;
      }
      if (this.significance.max !== undefined && sig > this.significance.max) {
        return false;
      }
    }

    // Outcome filter
    if (this.outcome && !this.outcome.includes(memory.outcome)) {
      return false;
    }

    // Emotional impact filter
    if (this.emotionalImpact) {
      const impact = memory.emotionalImpact || 0;
      if (this.emotionalImpact.min !== undefined && impact < this.emotionalImpact.min) {
        return false;
      }
      if (this.emotionalImpact.max !== undefined && impact > this.emotionalImpact.max) {
        return false;
      }
    }

    // Context tags filter
    if (this.contextTags) {
      const memoryTags = memory.contextTags || [];
      const hasMatchingTag = this.contextTags.some(tag => memoryTags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }

    return true;
  }

  /**
   * Create a new query with modified criteria
   * @param {Object} updates - Criteria updates
   * @returns {MemoryQuery} New query with updated criteria
   */
  withUpdates(updates) {
    return new MemoryQuery({ ...this, ...updates });
  }

  /**
   * Get query summary for debugging
   * @returns {Object} Query summary
   */
  getSummary() {
    return {
      type: this.type,
      timeRange: this.timeRange,
      location: this.location,
      participants: this.participants,
      significance: this.significance,
      outcome: this.outcome,
      emotionalImpact: this.emotionalImpact,
      contextTags: this.contextTags,
      limit: this.limit,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };
  }

  /**
   * Create a query for recent memories
   * @param {number} hours - Number of hours to look back
   * @param {Object} additionalCriteria - Additional filtering criteria
   * @returns {MemoryQuery} Query for recent memories
   */
  static recent(hours = 24, additionalCriteria = {}) {
    const endTime = Date.now();
    const startTime = endTime - (hours * 60 * 60 * 1000);

    return new MemoryQuery({
      timeRange: { start: startTime, end: endTime },
      ...additionalCriteria
    });
  }

  /**
   * Create a query for significant memories
   * @param {number} minSignificance - Minimum significance threshold (0-1)
   * @param {Object} additionalCriteria - Additional filtering criteria
   * @returns {MemoryQuery} Query for significant memories
   */
  static significant(minSignificance = 0.7, additionalCriteria = {}) {
    return new MemoryQuery({
      significance: { min: minSignificance },
      ...additionalCriteria
    });
  }

  /**
   * Create a query for memories involving specific participants
   * @param {string|string[]} participants - Participant IDs
   * @param {Object} additionalCriteria - Additional filtering criteria
   * @returns {MemoryQuery} Query for participant memories
   */
  static involving(participants, additionalCriteria = {}) {
    return new MemoryQuery({
      participants: Array.isArray(participants) ? participants : [participants],
      ...additionalCriteria
    });
  }

  /**
   * Create a query for memories at specific locations
   * @param {string|string[]} locations - Location identifiers
   * @param {Object} additionalCriteria - Additional filtering criteria
   * @returns {MemoryQuery} Query for location memories
   */
  static atLocation(locations, additionalCriteria = {}) {
    return new MemoryQuery({
      location: Array.isArray(locations) ? locations : [locations],
      ...additionalCriteria
    });
  }

  /**
   * Create a query for memories of specific types
   * @param {string|string[]} types - Memory types
   * @param {Object} additionalCriteria - Additional filtering criteria
   * @returns {MemoryQuery} Query for typed memories
   */
  static ofType(types, additionalCriteria = {}) {
    return new MemoryQuery({
      type: Array.isArray(types) ? types : [types],
      ...additionalCriteria
    });
  }
}

export default MemoryQuery;