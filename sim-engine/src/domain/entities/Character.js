// src/systems/character/Character.js

import ConsciousnessSystem from '../value-objects/ConsciousnessSystem.js';  // Reuse your existing
import PersonalitySystem from '../value-objects/PersonalitySystem.js';        // Reuse
import RaceSystem from '../value-objects/RaceSystem.js';                     
import AlignmentSystem from '../entities/AlignmentSystem.js';  // Adjust based on location
import InfluenceSystem from '../entities/InfluenceSystem.js';
import PrestigeSystem from '../entities/PrestigeSystem.js';
import PrerequisiteSystem from '../entities/PrerequisiteSystem.js';  // For checks

class Character {
  constructor(config = {}) {
    this.id = config.id || crypto.randomUUID();  // Unique ID for NPCs
    this.name = config.name || 'Unnamed NPC';
    this.currentNodeId = config.currentNodeId || null;  // Link to world nodes/locations

    // Reused systems as properties
    this.consciousness = new ConsciousnessSystem(config.consciousness || { frequency: 40, coherence: 0.9 });  // Default inspired by papers (40 Hz gamma)
    this.personality = new PersonalitySystem(config.personality || {});  // e.g., { aggression: 0.5 }
    this.race = new RaceSystem(config.race || {});  // If affects attributes
    this.alignment = new AlignmentSystem(config.alignment || {});  // Moral tracking
    this.influence = new InfluenceSystem(config.influence || {});  // Relationships/progression
    this.prestige = new PrestigeSystem(config.prestige || {});    // Achievements

    // D&D-style attributes (reuse flexible Record from README; add if not in Race/Personality)
    this.attributes = config.attributes || {
      strength: { score: 10, modifier: 0 },
      dexterity: { score: 10, modifier: 0 },
      constitution: { score: 10, modifier: 0 },
      intelligence: { score: 10, modifier: 0 },
      wisdom: { score: 10, modifier: 0 },
      charisma: { score: 10, modifier: 0 },
    };

    // Simulation-specific (for autonomy/history per Paper2)
    this.goals = config.goals || [];  // Array of {id: string, progress: number} from quest system
    this.relationships = new Map(config.relationships || []);  // Map<characterId, affinityNumber> (-1 to 1)
    this.decisionHistory = config.decisionHistory || [];  // Array of {timestamp, interactionId, outcome}
    this.energy = config.energy || 100;  // From old sim tick
    this.health = config.health || 100;
    this.mood = config.mood || 50;
  }

  // Method for simulation tick (extend old updateCharacter; add quantum-inspired decay)
  updateTick() {
    // Reused basic decrements from old sim
    this.energy = Math.max(0, Math.min(100, this.energy - 1));
    this.health = Math.max(0, Math.min(100, this.health));
    this.mood = Math.max(0, Math.min(100, this.mood));

    // Consciousness decay (inspired by papers' 408 fs coherence time, scaled to ticks)
    this.consciousness.coherence = Math.max(0, this.consciousness.coherence - 0.01);  // Gradual decoherence

    // Example evolution: Boost if goals progress (tie to quests)
    if (this.goals.some(g => g.progress > 0.5)) {
      this.consciousness.coherence = Math.min(1, this.consciousness.coherence + 0.05);
    }
  }

  // Decision helper (for autonomy; uses resonance eq from papers)
  calculateDecisionWeight(interaction) {
    const energyDiff = this.attributes.intelligence.score - interaction.requiredIntelligence || 0;  // Proxy E1 - E2
    const gammaFreq = this.consciousness.frequency || 40;  // ℏωγ from papers
    // Resonance eq: R = exp[-(E1 - E2 - γ)^2 / (2γ)]
    const resonance = Math.exp(-Math.pow(energyDiff - gammaFreq, 2) / (2 * gammaFreq));
    return resonance + this.personality.aggression * (interaction.type === 'combat' ? 2 : 1);  // Weighted
  }

  // Check prerequisites (reuse PrerequisiteSystem)
  meetsRequirements(interaction) {
    return PrerequisiteSystem.check(this, interaction.requirements);  // Assume static method in your system
  }

  // Log decision (for history/memory)
  logDecision(interactionId, outcome) {
    this.decisionHistory.push({ timestamp: Date.now(), interactionId, outcome });
  }

  // Serialize for localStorage (reuse old JSON format)
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      consciousness: this.consciousness.toJSON(),  // Assume systems have toJSON
      personality: this.personality.toJSON(),
      // ... other systems
      attributes: this.attributes,
      goals: this.goals,
      relationships: Array.from(this.relationships),
      decisionHistory: this.decisionHistory,
    };
  }
}

export default Character;