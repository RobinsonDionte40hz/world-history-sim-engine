// src/domain/services/HistoryGenerator.js

import Character from '../entities/Character.js';
import InteractionBase from '../entities/interactions/InteractionBase.js';

class HistoryGenerator {
  // Log a historical event from an interaction outcome
  logEvent(config = {}) {
    const { timestamp = Date.now(), character, interaction, outcome, roll, dc } = config;
    if (!(character instanceof Character) || !(interaction instanceof InteractionBase)) {
      throw new Error('Invalid character or interaction');
    }

    // Determine significance based on coherence and outcome
    const significance = this.calculateSignificance(character, outcome);
    if (significance < 0.1) return;  // Skip trivial events

    const event = {
      id: this.generateId(),
      timestamp,
      characterId: character.id,
      characterName: character.name,
      interactionId: interaction.id,
      interactionName: interaction.name,
      type: interaction.type || 'event',
      outcome,
      roll,
      dc,
      location: interaction.nodeId || 'Unknown',
      significance,
      description: this.generateDescription(character, interaction, outcome),
    };

    // Simulate persistence (reused from old localStorage approach)
    this.saveEvent(event);
    return event;
  }

  // Calculate event significance (inspired by quantum coherence impact)
  calculateSignificance(character, outcome) {
    const coherence = character.consciousness.coherence || 0;
    const baseImpact = outcome === 'positive' ? 0.5 : 0.2;  // Positive outcomes more significant
    // Resonance-inspired scaling: Higher coherence amplifies impact (from papers' 408 fs baseline)
    return baseImpact * (1 + coherence * 2);  // Scales 0.2-0.9 to 0.2-2.7, capped at 1 for now
  }

  // Generate a narrative description (simple for MVP)
  generateDescription(character, interaction, outcome) {
    const success = outcome === 'positive';
    const attrMod = character.attributes.getTotalModifier('charisma');  // Proxy for narrative flavor
    const descriptors = ['bravely', 'cautiously', 'cleverly', 'boldly'];
    const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];

    if (interaction.type === 'dialogue') {
      return `${character.name} ${descriptor} engaged in a ${success ? 'successful' : 'failed'} conversation about ${interaction.name} with a charisma of ${attrMod}.`;
    } else if (interaction.type === 'action') {
      return `${character.name} ${descriptor} performed a ${success ? 'successful' : 'failed'} ${interaction.name} action with a roll of ${success ? 'victory' : 'struggle'}.`;
    }
    return `${character.name} experienced a ${success ? 'notable' : 'minor'} ${interaction.name} event.`;
  }

  // Simulate saving to localStorage (reused from old project)
  saveEvent(event) {
    const events = JSON.parse(localStorage.getItem('historicalEvents') || '[]');
    events.push(event);
    localStorage.setItem('historicalEvents', JSON.stringify(events));
  }

  // Retrieve events (for analysis or UI)
  getEvents() {
    return JSON.parse(localStorage.getItem('historicalEvents') || '[]');
  }

  // Clear events (for testing)
  clearEvents() {
    localStorage.removeItem('historicalEvents');
  }

  // Generate a unique ID for events
  generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for test environments
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }
}

export default HistoryGenerator;