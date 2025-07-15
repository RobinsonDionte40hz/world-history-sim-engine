// src/domain/entities/Character.js

import AlignmentManager from './AlignmentManager.js';
import InfluenceManager from './InfluenceManager.js';
import PrestigeManager from './PrestigeManager.js';
import PersonalitySystem from '../value-objects/PersonalitySystem.js';
import RaceSystem from '../value-objects/RaceSystem.js';
import PrerequisiteValidator from '../services/PrerequisiteValidator.js';
// ... existing imports

class Character {
  constructor(config = {}) {
    // ... existing properties
    this.alignment = new AlignmentManager(config.alignmentAxes || []);
    this.influence = new InfluenceManager(config.influenceDomains || []);
    this.prestige = new PrestigeManager(config.prestigeTracks || []);
    this.personality = new PersonalitySystem(config.personalityConfig || {});
    this.race = new RaceSystem(config.raceConfig || {});
    // PrerequisiteValidator is static; no instance

    // Apply race bonuses (example)
    if (this.race) {
      const modifiers = this.race.getRacialModifiers(/* subrace */);
      // Apply to attributes
    }

    Object.freeze(this);
  }

  meetsPrerequisites(interaction) {
    return PrerequisiteValidator.validatePrerequisites(interaction, this.getStateForValidation());
  }

  getStateForValidation() {
    return {
      // ... level, skills, quests, inventory, etc.
      alignment: this.alignment.playerAlignment,
      influence: this.influence.playerInfluence,
      prestige: this.prestige.playerPrestige,
    };
  }

  toJSON() {
    return {
      // ... existing
      alignmentAxes: this.alignment.axes,  // For reconstruction
      influenceDomains: this.influence.domains,
      prestigeTracks: this.prestige.tracks,
      personalityConfig: this.personality.toJSON(),
      raceConfig: this.race.toJSON(),
    };
  }

  static fromJSON(data) {
    return new Character({
      // ... existing
      alignmentAxes: data.alignmentAxes,
      influenceDomains: data.influenceDomains,
      prestigeTracks: data.prestigeTracks,
      personalityConfig: data.personalityConfig,
      raceConfig: data.raceConfig,
    });
  }
}