// src/domain/services/EvolutionService.js

import Character from '../entities/Character.js';
import Attributes from '../value-objects/Attributes.js';

class EvolutionService {
  // Evolve a character based on an interaction outcome
  evolveFromInteraction(character, interaction, outcome) {
    if (!(character instanceof Character)) {
      throw new Error('Invalid character');
    }

    const success = outcome === 'positive';
    const coherence = character.consciousness.coherence || 0;
    const learningRate = this.calculateLearningRate(coherence, success);  // Scales evolution

    // Update attributes (D&D-style progression)
    this.updateAttributes(character, learningRate, success);

    // Update skills (placeholder; assume skill system exists or add later)
    this.updateSkills(character, learningRate, interaction.type);

    // Update relationships (based on interaction participants)
    this.updateRelationships(character, interaction, learningRate);

    // Update influence/prestige (reused from old progression systems)
    this.updateProgression(character, interaction, learningRate);
  }

  // Calculate learning rate based on coherence and success (quantum-inspired)
  calculateLearningRate(coherence, success) {
    // Inspired by papers' coherence time (408 fs) and golden ratio (φ ≈ 1.618)
    const baseRate = success ? 0.1 : 0.02;  // Higher rate for success
    const coherenceFactor = 1 + (coherence * 0.5);  // Scales with coherence (0-1 to 1-1.5)
    const goldenBoost = 1.618;  // Natural growth factor
    return baseRate * coherenceFactor * (success ? goldenBoost : 1);  // Caps at ~0.25 for success
  }

  // Update D&D attributes
  updateAttributes(character, learningRate, success) {
    const attrToImprove = this.selectAttributeToImprove(character, success);
    if (attrToImprove) {
      const current = character.attributes[attrToImprove];
      const newScore = Math.min(20, current.score + learningRate);  // Cap at 20 (D&D max)
      character.attributes = new Attributes({
        ...character.attributes.toJSON(),
        [attrToImprove]: { ...current, score: newScore, modifier: Math.floor((newScore - 10) / 2) },
      });
    }
  }

  // Select attribute to improve (e.g., based on interaction type)
  selectAttributeToImprove(character, success) {
    const mappings = {
      'dialogue': 'charisma',
      'action': 'strength',
      'trade': 'intelligence',
    };
    return success ? mappings[character.lastInteractionType] || 'wisdom' : null;  // Wisdom on failure
  }

  // Update skills (placeholder; extend with skill system later)
  updateSkills(character, learningRate, interactionType) {
    // Assume a skills object exists (e.g., character.skills)
    const skillToImprove = interactionType === 'trade' ? 'bargaining' : 'combat';
    if (character.skills && character.skills[skillToImprove]) {
      character.skills[skillToImprove].level = Math.min(20, character.skills[skillToImprove].level + learningRate);
    }
  }

  // Update relationships based on interaction
  updateRelationships(character, interaction, learningRate) {
    interaction.participants.forEach(participantId => {
      if (participantId !== character.id) {
        const currentAffinity = character.relationships.get(participantId) || 0;
        const delta = interaction.type === 'dialogue' ? learningRate * 0.5 : -learningRate * 0.5;  // Positive for dialogue, negative for conflict
        character.relationships.set(participantId, Math.max(-1, Math.min(1, currentAffinity + delta)));
      }
    });
  }

  // Update influence/prestige (reused from old progression systems)
  updateProgression(character, interaction, outcome, learningRate) {
    if (interaction.effects.some(e => e.type === 'influence')) {
      character.influence.value += learningRate * (outcome === 'positive' ? 2 : 1);
    }
    if (interaction.effects.some(e => e.type === 'prestige')) {
      character.prestige.value += learningRate * (outcome === 'positive' ? 1.5 : 0.5);
    }
  }

  // Evolve character over time (e.g., passive growth during ticks)
  evolveOverTime(character, ticksElapsed) {
    if (!(character instanceof Character)) {
      throw new Error('Invalid character');
    }

    const passiveRate = 0.01 * (character.consciousness.coherence || 0);  // Slow growth tied to coherence
    const attrToImprove = this.selectAttributeToImprove(character, true);  // Assume passive success
    if (attrToImprove) {
      const current = character.attributes[attrToImprove];
      const newScore = Math.min(20, current.score + passiveRate * ticksElapsed);
      character.attributes = new Attributes({
        ...character.attributes.toJSON(),
        [attrToImprove]: { ...current, score: newScore, modifier: Math.floor((newScore - 10) / 2) },
      });
    }
  }
}

export default EvolutionService;