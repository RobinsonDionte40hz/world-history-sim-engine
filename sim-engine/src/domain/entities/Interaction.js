// src/domain/entities/Interaction.js

// Utility function to generate UUID with fallback for test environments
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for test environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

class Interaction {
  constructor(config = {}) {
    this.id = config.id || generateId();  // Unique ID for tracking in history
    this.nodeId = config.nodeId || null;  // Link to world node (from Node Types)
    this.name = config.name || 'Unnamed Interaction';
    this.description = config.description || '';
    this.type = config.type || 'dialogue';  // e.g., 'dialogue', 'action', 'event' (from Paper2)
    this.requirements = config.requirements || [];  // e.g., { attr: 'charisma', min: 10 }
    this.branches = config.branches || [];  // Array of branch objects (reused from old project)
    this.effects = config.effects || [];  // e.g., { type: 'influence', value: 5 }
    this.participants = config.participants || [];  // Array of character IDs involved
    this.cooldown = config.cooldown || 0;  // Ticks before reusable
    this.repeatable = config.repeatable || false;  // Can it happen again?
    this.lastUsed = config.lastUsed || 0;  // Timestamp for cooldown
  }

  // Validate if a character can perform this interaction (reuse PrerequisiteSystem if available)
  meetsRequirements(character) {
    return this.requirements.every(req => {
      const attrValue = character.attributes[req.attr]?.score || 0;
      return attrValue >= req.min;
    });
  }

  // Select a branch based on character state (for autonomy; ties to Character.calculateDecisionWeight)
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

  // Apply effects to a character (for resolution)
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

  // Check if interaction is available (cooldown check)
  isAvailable(currentTick) {
    return this.repeatable || (currentTick - this.lastUsed >= this.cooldown);
  }

  // Update last used timestamp
  markUsed(currentTick) {
    this.lastUsed = currentTick;
  }

  // Serialize for localStorage (match old JSON format)
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

// Helper function (move to shared/utils/weightedSelect.js if not existing)
function weightedSelect(options, weightFn) {
  const totalWeight = options.reduce((sum, opt) => sum + weightFn(opt), 0);
  let rand = Math.random() * totalWeight;
  for (const opt of options) {
    rand -= weightFn(opt);
    if (rand <= 0) return opt;
  }
  return options[options.length - 1];  // Fallback
}

export default Interaction;