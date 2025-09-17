// src/domain/services/InteractionResolver.js

import InteractionBase from '../entities/interactions/InteractionBase.js';
import Character from '../entities/Character.js';

class InteractionResolver {
  // Resolve an interaction for a character, returning outcome and applying effects
  resolve(character, interaction, branchId, worldState = {}) {
    if (!(interaction instanceof InteractionBase) || !(character instanceof Character)) {
      throw new Error('Invalid interaction or character');
    }

    // Check availability (cooldown from Interaction.js)
    if (!interaction.isAvailable(Date.now())) {
      return { success: false, outcome: 'cooldown', message: 'Interaction on cooldown' };
    }

    // Select branch (defaults to requested branchId if valid)
    const branch = interaction.branches.find(b => b.id === branchId) || interaction.selectBranch(character);
    if (!branch) {
      return { success: false, outcome: 'no_valid_branch', message: 'No valid branch available' };
    }

    // Check prerequisites (e.g., D&D attribute requirements)
    if (!interaction.meetsRequirements(character)) {
      return { success: false, outcome: 'prerequisite_failed', message: 'Requirements not met' };
    }

    // Roll for success (D&D-style d20 + modifier vs DC)
    const reqAttr = branch.requirements?.attr || 'charisma';  // Default to CHA if not specified
    const attrMod = character.attributes.getTotalModifier(reqAttr);
    const roll = Math.floor(Math.random() * 20) + 1 + attrMod;
    const dc = branch.requirements?.dc || 10;  // Default difficulty
    const success = roll >= dc;

    // Apply effects if successful
    if (success) {
      // Handle different interaction types
      if (interaction.isContentInteraction) {
        // Content interactions use applyEffect for each effect
        interaction.effects?.forEach(effect => {
          interaction.applyEffect(character, effect);
        });
        interaction.markUsed(Date.now());
      } else {
        // System interactions use execute method
        interaction.execute(character, worldState);
      }
    }

    // Log for history (to be handled by HistoryGenerator)
    return {
      success,
      outcome: success ? 'positive' : 'negative',
      roll,
      dc,
      branchId: branch.id,
      message: success ? branch.text || 'Success!' : 'Failed!',
    };
  }

  // Helper to select a branch based on character state (delegates to Interaction but adds logic)
  selectBranch(character, interaction) {
    if (!(interaction instanceof InteractionBase)) {
      throw new Error('Invalid interaction');
    }

    let branch = interaction.selectBranch ? interaction.selectBranch(character) : null;
    
    // If no branch selected, try fallback options
    if (!branch) {
      // Try to find a default branch or first available branch
      if (interaction.branches && interaction.branches.length > 0) {
        // Filter for valid branches based on conditions
        const validBranches = interaction.branches.filter(b => !b.condition || b.condition(character));
        if (validBranches.length > 0) {
          branch = validBranches[0]; // Take first valid branch
        } else {
          branch = interaction.branches[0]; // Take first branch as fallback
        }
      }
    }

    if (!branch) {
      throw new Error('No branch available for interaction');
    }

    // Additional weighting or fallback logic (e.g., random if no strong match)
    const validBranches = interaction.branches.filter(b => !b.condition || b.condition(character));
    if (validBranches.length > 1) {
      // Re-weight with consciousness and resonance (from papers' R(E1,E2,t))
      const energyProxy = character.attributes.getEnergyProxy();
      const gammaFreq = character.consciousness.frequency || 40;  // 40 Hz gamma
      return weightedSelect(validBranches, b => {
        const energyDiff = energyProxy - (b.requiredEnergy || energyProxy);
        const resonance = Math.exp(-Math.pow(energyDiff - gammaFreq, 2) / (2 * gammaFreq));
        const coherenceBonus = character.consciousness.coherence * 1.5;  // Higher coherence favors optimal
        return resonance + coherenceBonus + (character.personality.aggression * (b.type === 'combat' ? 2 : 1));
      });
    }
    return branch;
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

export default InteractionResolver;