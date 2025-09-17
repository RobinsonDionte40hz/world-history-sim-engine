// src/domain/entities/Interaction.js

const ContentInteraction = require('./interactions/ContentInteraction.js');

class Interaction extends ContentInteraction {
  constructor(config = {}) {
    super(config);

    // Add nodeId which is specific to the existing Interaction class
    this.nodeId = config.nodeId || null;  // Link to world node (from Node Types)

    // Override defaults to maintain exact backward compatibility
    if (!config.type) {
      this.type = 'dialogue';  // Original default was 'dialogue', not 'unknown'
    }
  }

  // Override meetsRequirements to maintain exact existing behavior
  meetsRequirements(character) {
    return this.requirements.every(req => {
      const attrValue = character.attributes?.[req.attr]?.score || 0;
      return attrValue >= req.min;
    });
  }

  // Override selectBranch to maintain exact existing behavior with weighted selection
  selectBranch(character) {
    if (!this.branches.length) return null;
    const validBranches = this.branches.filter(b => !b.condition || b.condition(character));
    if (!validBranches.length) return null;

    // Weighted selection inspired by resonance (from papers' R(E1,E2,t) eq)
    return weightedSelect(validBranches, branch => {
      const energyDiff = character.attributes.intelligence?.score || 10 - (branch.requiredEnergy || 10);
      const gammaFreq = character.consciousness.frequency || 40;  // 40 Hz gamma baseline
      const resonance = Math.exp(-Math.pow(energyDiff - gammaFreq, 2) / (2 * gammaFreq));
      const personalityFactor = character.personality.traits.reduce((sum, t) => sum + t.value * (branch.matchFactor || 1), 0);
      return resonance + personalityFactor + character.consciousness.coherence * 1.5;  // Coherence bonus
    });
  }

  // Override applyEffects to maintain exact existing behavior
  applyEffects(character) {
    this.effects.forEach(effect => {
      switch (effect.type) {
        case 'influence':
          character.influence.value += effect.value;
          break;
        case 'relationship':
          character.relationships.set(effect.target, (character.relationships.get(effect.target) || 0) + effect.value);
          break;
        case 'attribute':
          character.attributes[effect.target].score += effect.value;
          character.attributes[effect.target].modifier = Math.floor((character.attributes[effect.target].score - 10) / 2);  // D&D mod
          break;
        // Add more effect types as needed (e.g., 'quest', 'resource')
        default:
          console.warn(`Unknown effect type: ${effect.type}`);
          break;
      }
    });
  }

  // Override isAvailable to maintain exact existing behavior
  isAvailable(currentTick) {
    return this.repeatable || (currentTick - this.lastUsed >= this.cooldown);
  }

  // Override markUsed to maintain exact existing behavior
  markUsed(currentTick) {
    this.lastUsed = currentTick;
  }

  // Override toJSON to maintain exact existing format including nodeId
  toJSON() {
    return {
      id: this.id,
      nodeId: this.nodeId,
      name: this.name,
      description: this.description,
      type: this.type,
      requirements: this.requirements,
      branches: this.branches,
      effects: this.effects,
      participants: this.participants,
      cooldown: this.cooldown,
      repeatable: this.repeatable,
      lastUsed: this.lastUsed,
    };
  }
}

// Helper function (maintain existing weighted selection logic)
function weightedSelect(options, weightFn) {
  const totalWeight = options.reduce((sum, opt) => sum + weightFn(opt), 0);
  let rand = Math.random() * totalWeight;
  for (const opt of options) {
    rand -= weightFn(opt);
    if (rand <= 0) return opt;
  }
  return options[options.length - 1];  // Fallback
}

module.exports = Interaction;