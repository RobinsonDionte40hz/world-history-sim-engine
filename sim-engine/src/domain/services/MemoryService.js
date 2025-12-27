// src/domain/services/MemoryService.js

class MemoryService {
  // Query memory for relevant past interactions
  queryMemory(character, criteria = {}) {
    // More flexible validation - check for required properties instead of instanceof
    if (!character || typeof character !== 'object') {
      throw new Error('Invalid character: must be an object');
    }

    // Check for required properties that a character should have
    const requiredProps = ['id', 'name', 'decisionHistory'];
    const missingProps = requiredProps.filter(prop => !(prop in character));
    if (missingProps.length > 0) {
      throw new Error(`Invalid character: missing required properties: ${missingProps.join(', ')}`);
    }

    const { interactionId, participantId, outcome, minSignificance = 0 } = criteria;
    const decisionHistory = character.decisionHistory || [];
    return decisionHistory.filter(event => {
      const matches = (
        (!interactionId || event.interactionId === interactionId) &&
        (!participantId || character.relationships.has(participantId)) &&
        (!outcome || event.outcome === outcome)
      );
      const significance = this.calculateRetentionStrength(character, event);
      return matches && significance >= minSignificance;
    });
  }

  // Calculate retention strength based on coherence and time (quantum-inspired)
  calculateRetentionStrength(character, event) {
    const coherence = character.consciousness.coherence || 0;
    const age = (Date.now() - event.timestamp) / (1000 * 60 * 60);  // Hours since event
    const baseRetention = event.outcome === 'positive' ? 0.7 : 0.3;  // Positive events linger
    // Inspired by papers' 408 fs coherence decay, scaled to hours (assume 1 hour = 1e6 fs equiv)
    const decayFactor = Math.exp(-age / (coherence * 1000 + 1));  // Higher coherence slows decay
    return Math.max(0, baseRetention * decayFactor);
  }

  // Update memory with new decision (called post-interaction)
  updateMemory(character, interactionId, outcome) {
    // More flexible validation - check for required properties instead of instanceof
    if (!character || typeof character !== 'object') {
      throw new Error('Invalid character: must be an object');
    }

    // Check for required properties that a character should have
    const requiredProps = ['id', 'name', 'decisionHistory'];
    const missingProps = requiredProps.filter(prop => !(prop in character));
    if (missingProps.length > 0) {
      throw new Error(`Invalid character: missing required properties: ${missingProps.join(', ')}`);
    }

    character.logDecision(interactionId, outcome);  // Reuse Character method
    // Optionally prune old memories (e.g., below threshold)
    const retentionThreshold = 0.1;
    const decisionHistory = character.decisionHistory || [];
    character.decisionHistory = decisionHistory.filter(event =>
      this.calculateRetentionStrength(character, event) >= retentionThreshold
    );
  }

  // Influence decision weight based on memory (e.g., avoid past failures)
  getMemoryInfluence(character, interaction) {
    const pastInteractions = this.queryMemory(character, { interactionId: interaction.id });
    if (!pastInteractions.length) return 0;

    const recentFailure = pastInteractions.some(event => event.outcome === 'negative' && 
      (Date.now() - event.timestamp) / (1000 * 60 * 60) < 24);  // Last 24 hours
    const trustScore = pastInteractions.reduce((sum, event) => 
      sum + (event.outcome === 'positive' ? 0.5 : -0.5) * this.calculateRetentionStrength(character, event), 0);

    return recentFailure ? -1 : Math.max(-0.5, Math.min(0.5, trustScore));  // -1 to 0.5 range
  }

  // Update relationship with another character based on interaction outcome
  updateRelationship(character, targetCharacterId, interactionOutcome, context = {}) {
    // More flexible validation - check for required properties instead of instanceof
    if (!character || typeof character !== 'object') {
      throw new Error('Invalid character: must be an object');
    }

    // Check for required properties that a character should have
    const requiredProps = ['id', 'name', 'relationships'];
    const missingProps = requiredProps.filter(prop => !(prop in character));
    if (missingProps.length > 0) {
      throw new Error(`Invalid character: missing required properties: ${missingProps.join(', ')}`);
    }

    if (!character.relationships) {
      character.relationships = new Map();
    }

    // Get or create relationship bond with enhanced metadata
    const currentBond = character.relationships.get(targetCharacterId) || {
      value: 0,
      type: 'neutral',
      history: [],
      firstInteraction: Date.now(),
      interactionCount: 0,
      lastInteraction: null
    };

    // Calculate bond change based on interaction outcome and context
    const bondChange = this._calculateBondChange(interactionOutcome, context);

    // Update bond value with bounds checking
    currentBond.value = Math.max(-100, Math.min(100, currentBond.value + bondChange));

    // Update metadata
    currentBond.interactionCount++;
    currentBond.lastInteraction = Date.now();

    // Create detailed history entry
    const historyEntry = {
      timestamp: Date.now(),
      change: bondChange,
      reason: context.reason || `Interaction outcome: ${interactionOutcome}`,
      interactionType: context.interactionType || 'system',
      context: context.context || 'general',
      outcome: interactionOutcome,
      encounterId: context.encounterId,
      significance: this._calculateInteractionSignificance(context)
    };

    currentBond.history.push(historyEntry);

    // Calculate relationship type with full history context
    currentBond.type = this.calculateRelationshipType(currentBond.value, currentBond.history);

    // Store updated relationship
    character.relationships.set(targetCharacterId, currentBond);

    return currentBond;
  }

  // Calculate bond change based on outcome and context
  _calculateBondChange(outcome, context) {
    let baseChange = 0;

    // Base change by outcome
    switch (outcome) {
      case 'positive':
        baseChange = 8;
        break;
      case 'neutral':
        baseChange = 1;
        break;
      case 'negative':
        baseChange = -6;
        break;
      default:
        baseChange = 0;
    }

    // Apply context modifiers
    const modifiers = {
      romantic: 1.5,
      family: 1.2,
      professional: 0.8,
      mentorship: 1.3,
      combat: 2.0,
      social: 1.0,
      economic: 0.9
    };

    const interactionType = context.interactionType || 'social';
    const modifier = modifiers[interactionType] || 1.0;

    // Apply significance modifier
    const significance = context.significance || 1.0;

    return Math.round(baseChange * modifier * significance);
  }

  // Calculate interaction significance
  _calculateInteractionSignificance(context) {
    let significance = 1.0;

    // Higher significance for major events
    if (context.encounterId) significance *= 1.5;
    if (context.isMajorEvent) significance *= 2.0;
    if (context.isPublic) significance *= 1.2;
    if (context.involvesCrowd) significance *= 1.3;

    // Lower significance for minor interactions
    if (context.isMinor) significance *= 0.7;
    if (context.isPrivate) significance *= 0.8;

    return Math.max(0.1, Math.min(3.0, significance));
  }

  // Calculate relationship type based on bond value and interaction history
  calculateRelationshipType(value, interactionHistory = []) {
    // Check for romantic relationships first (highest priority)
    if (this.hasRomanticCompatibility(interactionHistory)) {
      if (value > 85) return 'married';
      if (value > 75) return 'engaged';
      if (value > 65) return 'romantic_partner';
      if (value > 50) return 'romantic_interest';
      if (value > 30) return 'dating';
      if (value > 15) return 'flirting';
    }

    // Check for family relationships
    if (this.isFamilyRelationship(interactionHistory)) {
      if (value > 70) return 'close_family';
      if (value > 40) return 'family';
      if (value > 10) return 'distant_family';
      return 'estranged_family';
    }

    // Check for professional/business relationships
    if (this.isProfessionalRelationship(interactionHistory)) {
      if (value > 60) return 'trusted_colleague';
      if (value > 30) return 'colleague';
      if (value > 10) return 'acquaintance';
      if (value > -20) return 'neutral';
      return 'rival';
    }

    // Check for mentorship relationships
    if (this.isMentorshipRelationship(interactionHistory)) {
      if (value > 70) return 'mentor';
      if (value > 50) return 'student';
      if (value > 20) return 'apprentice';
      return 'distant_mentor';
    }

    // Default to basic relationship types
    return this.calculateBasicRelationshipType(value);
  }

  // Check if relationship has romantic compatibility based on interaction history
  hasRomanticCompatibility(interactionHistory) {
    if (!interactionHistory || interactionHistory.length === 0) return false;

    return interactionHistory.some(event =>
      event.reason && (
        event.reason.toLowerCase().includes('romantic') ||
        event.reason.toLowerCase().includes('courtship') ||
        event.reason.toLowerCase().includes('date') ||
        event.reason.toLowerCase().includes('flirt') ||
        event.reason.toLowerCase().includes('love') ||
        event.reason.toLowerCase().includes('marriage') ||
        event.reason.toLowerCase().includes('wedding') ||
        event.reason.toLowerCase().includes('proposal')
      )
    );
  }

  // Check if relationship is familial based on interaction history
  isFamilyRelationship(interactionHistory) {
    if (!interactionHistory || interactionHistory.length === 0) return false;

    return interactionHistory.some(event =>
      event.reason && (
        event.reason.toLowerCase().includes('family') ||
        event.reason.toLowerCase().includes('parent') ||
        event.reason.toLowerCase().includes('child') ||
        event.reason.toLowerCase().includes('sibling') ||
        event.reason.toLowerCase().includes('brother') ||
        event.reason.toLowerCase().includes('sister') ||
        event.reason.toLowerCase().includes('mother') ||
        event.reason.toLowerCase().includes('father') ||
        event.reason.toLowerCase().includes('grandparent') ||
        event.reason.toLowerCase().includes('cousin') ||
        event.reason.toLowerCase().includes('aunt') ||
        event.reason.toLowerCase().includes('uncle') ||
        event.reason.toLowerCase().includes('niece') ||
        event.reason.toLowerCase().includes('nephew')
      )
    );
  }

  // Check if relationship is professional/business based on interaction history
  isProfessionalRelationship(interactionHistory) {
    if (!interactionHistory || interactionHistory.length === 0) return false;

    return interactionHistory.some(event =>
      event.reason && (
        event.reason.toLowerCase().includes('business') ||
        event.reason.toLowerCase().includes('trade') ||
        event.reason.toLowerCase().includes('commerce') ||
        event.reason.toLowerCase().includes('work') ||
        event.reason.toLowerCase().includes('profession') ||
        event.reason.toLowerCase().includes('guild') ||
        event.reason.toLowerCase().includes('merchant') ||
        event.reason.toLowerCase().includes('craft') ||
        event.reason.toLowerCase().includes('service')
      )
    );
  }

  // Check if relationship is mentorship-based on interaction history
  isMentorshipRelationship(interactionHistory) {
    if (!interactionHistory || interactionHistory.length === 0) return false;

    return interactionHistory.some(event =>
      event.reason && (
        event.reason.toLowerCase().includes('teach') ||
        event.reason.toLowerCase().includes('learn') ||
        event.reason.toLowerCase().includes('mentor') ||
        event.reason.toLowerCase().includes('student') ||
        event.reason.toLowerCase().includes('apprentice') ||
        event.reason.toLowerCase().includes('master') ||
        event.reason.toLowerCase().includes('train') ||
        event.reason.toLowerCase().includes('guide') ||
        event.reason.toLowerCase().includes('instruct')
      )
    );
  }

  // Calculate basic relationship type (fallback for non-specialized relationships)
  calculateBasicRelationshipType(value) {
    if (value > 60) return 'close_friend';
    if (value > 30) return 'friend';
    if (value > 10) return 'acquaintance';
    if (value > -10) return 'neutral';
    if (value > -30) return 'dislike';
    if (value > -60) return 'enemy';
    return 'hostile';
  }

  /**
   * Mark a character as an enemy with a specified reason
   * @param {Object} character - Character marking the enemy
   * @param {string} targetCharacterId - Target character to mark as enemy
   * @param {string} reason - Reason for enmity
   * @param {number} severity - Severity of enmity (0-1, default 0.65 for 'enemy' level)
   * @returns {Object} Updated relationship bond
   */
  markAsEnemy(character, targetCharacterId, reason = 'Declared enemy', severity = 0.65) {
    if (!character || !character.relationships) {
      character.relationships = new Map();
    }

    const currentBond = character.relationships.get(targetCharacterId) || {
      value: 0,
      type: 'neutral',
      history: [],
      firstInteraction: Date.now(),
      lastInteraction: Date.now()
    };

    // Convert severity (0-1) to enemy range (-30 to -100)
    // severity 0.5 = -50 (enemy), 0.65 = -65 (enemy), 1.0 = -100 (hostile)
    const targetValue = -30 - (severity * 70);
    const change = targetValue - currentBond.value;

    currentBond.value = targetValue;
    currentBond.lastInteraction = Date.now();
    currentBond.history.push({
      timestamp: Date.now(),
      change: change,
      reason: reason,
      interactionType: 'hostile',
      severity: severity >= 0.8 ? 'extreme' : severity >= 0.6 ? 'major' : 'moderate'
    });

    // Recalculate relationship type
    currentBond.type = this.calculateRelationshipType(currentBond.value, currentBond.history);

    character.relationships.set(targetCharacterId, currentBond);
    return currentBond;
  }

  /**
   * Check if a character considers another as an enemy
   * @param {Object} character - Character to check
   * @param {string} targetCharacterId - Target character ID
   * @returns {boolean} True if target is considered an enemy or hostile
   */
  isEnemy(character, targetCharacterId) {
    if (!character || !character.relationships) return false;
    
    const relationship = character.relationships.get(targetCharacterId);
    if (!relationship) return false;

    return relationship.value <= -30 || 
           relationship.type === 'enemy' || 
           relationship.type === 'hostile';
  }

  /**
   * Get all enemies of a character
   * @param {Object} character - Character to get enemies for
   * @returns {Array<Object>} Array of enemy relationships with character IDs and details
   */
  getEnemies(character) {
    if (!character || !character.relationships) return [];

    const enemies = [];
    character.relationships.forEach((relationship, targetId) => {
      if (relationship.value <= -30) {
        enemies.push({
          characterId: targetId,
          relationshipValue: relationship.value,
          relationshipType: relationship.type,
          history: relationship.history,
          lastInteraction: relationship.lastInteraction
        });
      }
    });

    // Sort by hostility level (most hostile first)
    return enemies.sort((a, b) => a.relationshipValue - b.relationshipValue);
  }

  /**
   * Create or escalate a vendetta between characters
   * @param {Object} character - Character initiating vendetta
   * @param {string} targetCharacterId - Target of vendetta
   * @param {string} reason - Reason for vendetta
   * @param {Object} metadata - Additional vendetta metadata
   * @returns {Object} Updated relationship with vendetta status
   */
  createVendetta(character, targetCharacterId, reason, metadata = {}) {
    const relationship = this.markAsEnemy(character, targetCharacterId, reason, 0.9);
    
    // Add vendetta-specific metadata
    relationship.isVendetta = true;
    relationship.vendettaStartDate = Date.now();
    relationship.vendettaReason = reason;
    relationship.vendettaSeverity = metadata.severity || 'extreme';
    relationship.vendettaWitnesses = metadata.witnesses || [];
    relationship.vendettaConsequences = metadata.consequences || [];

    character.relationships.set(targetCharacterId, relationship);
    return relationship;
  }

  /**
   * Check if there's an active vendetta
   * @param {Object} character - Character to check
   * @param {string} targetCharacterId - Target character ID
   * @returns {boolean} True if active vendetta exists
   */
  hasVendetta(character, targetCharacterId) {
    if (!character || !character.relationships) return false;
    
    const relationship = character.relationships.get(targetCharacterId);
    return relationship?.isVendetta === true;
  }
}

export default MemoryService;