// src/domain/services/MemoryService.js

import Character from '../entities/Character.js';

class MemoryService {
  // Query memory for relevant past interactions
  queryMemory(character, criteria = {}) {
    if (!(character instanceof Character)) {
      throw new Error('Invalid character');
    }

    const { interactionId, participantId, outcome, minSignificance = 0 } = criteria;
    return character.decisionHistory.filter(event => {
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
    if (!(character instanceof Character)) {
      throw new Error('Invalid character');
    }

    character.logDecision(interactionId, outcome);  // Reuse Character method
    // Optionally prune old memories (e.g., below threshold)
    const retentionThreshold = 0.1;
    character.decisionHistory = character.decisionHistory.filter(event =>
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
}

export default MemoryService;