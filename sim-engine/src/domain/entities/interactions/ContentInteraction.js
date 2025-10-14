// src/domain/entities/interactions/ContentInteraction.js

import InteractionBase from './InteractionBase.js';

// Import BranchWeightingService for personality-weighted selection
// Lazy loaded on first use to avoid module loading issues
let BranchWeightingService = null;
let branchWeightingServiceLoaded = false;

async function loadBranchWeightingService() {
  if (branchWeightingServiceLoaded) {
    return BranchWeightingService;
  }
  
  try {
    const module = await import('../../services/BranchWeightingService.js');
    BranchWeightingService = module.default;
  } catch (error) {
    // BranchWeightingService not available, will use fallback selection
    console.warn('BranchWeightingService not available, using fallback selection');
    BranchWeightingService = null;
  }
  
  branchWeightingServiceLoaded = true;
  return BranchWeightingService;
}

/**
 * ContentInteraction - Base class for user-defined content interactions
 *
 * Content interactions are flexible, customizable interactions created by users
 * or content creators. They support rich narrative content, branching logic,
 * and can be modified at runtime. Unlike system interactions, they are not
 * immutable and maintain backward compatibility with existing Interaction entities.
 */
class ContentInteraction extends InteractionBase {
  /**
   * Creates a new content interaction instance
   * @param {Object} config - Configuration object
   * @param {string} config.id - Unique identifier for the interaction
   * @param {string} config.name - Display name of the interaction
   * @param {string} config.description - Description of what the interaction does
   * @param {string} config.type - Type identifier for the interaction
   * @param {string} config.category - Category classification ('social', 'combat', 'economic', etc.)
   * @param {string} config.author - Author/creator of the interaction
   * @param {string[]} config.tags - Array of tags for organization and filtering
   * @param {Object} config.overrideFlags - Flags for special behavior overrides
   * @param {Object[]} config.requirements - Array of prerequisite requirements
   * @param {Object[]} config.branches - Array of dialogue/effect branches
   * @param {Object[]} config.effects - Array of effects to apply
   * @param {Object[]} config.participants - Array of participant IDs
   * @param {number} config.cooldown - Cooldown period in ticks
   * @param {boolean} config.repeatable - Whether the interaction can be repeated
   * @param {number} config.lastUsed - Timestamp of last use
   */
  constructor(config = {}) {
    // Preserve the original type for routine interactions
    const originalType = config.type;
    const contentConfig = { ...config, type: 'content' };
    super(contentConfig);

    this.isContentInteraction = true;
    this.category = config.category || 'general';
    this.author = config.author || 'system';
    this.tags = Array.isArray(config.tags) ? [...config.tags] : [];
    this.overrideFlags = { ...config.overrideFlags } || {};

    // Store the original type for compatibility with existing code
    this.originalType = originalType || 'content';

    // Backward compatibility properties from existing Interaction class
    this.requirements = Array.isArray(config.requirements) ? [...config.requirements] : [];
    this.branches = Array.isArray(config.branches) ? [...config.branches] : [];
    this.effects = Array.isArray(config.effects) ? [...config.effects] : [];
    this.participants = Array.isArray(config.participants) ? [...config.participants] : [];
    this.cooldown = typeof config.cooldown === 'number' ? config.cooldown : 0;
    this.repeatable = typeof config.repeatable === 'boolean' ? config.repeatable : false;
    this.lastUsed = typeof config.lastUsed === 'number' ? config.lastUsed : 0;
  }

  /**
   * Determines if the interaction can be executed by the given character
   * @param {Object} character - The character attempting the interaction
   * @param {Object} worldState - Current state of the world
   * @returns {boolean} True if the interaction can be executed
   */
  canExecute(character, worldState) {
    // Check basic requirements
    if (!this.meetsRequirements(character)) {
      return false;
    }

    // Check cooldown
    const currentTick = worldState.currentTick || worldState.time || 0;
    if (!this.isCooldownExpired(currentTick)) {
      return false;
    }

    return true;
  }

  /**
   * Executes the content interaction
   * @param {Object} character - The character executing the interaction
   * @param {Object} worldState - Current state of the world
   * @returns {Object} Result of the interaction execution
   */
  execute(character, worldState) {
    const result = {
      success: true,
      interaction: this,
      effects: [],
      branches: [],
      logs: [`${this.name} executed successfully`]
    };

    // Apply effects
    this.effects.forEach(effect => {
      const appliedEffect = this.applyEffect(character, effect);
      result.effects.push(appliedEffect);
    });

    // Update cooldown
    this.markUsed(worldState.currentTick);

    return result;
  }

  /**
   * Calculates energy cost for content interactions
   * @param {Object} character - The character executing the interaction
   * @param {Object} environment - The current environment
   * @returns {number} Energy cost (content interactions typically have minimal base cost)
   */
  getEnergyCost(character, environment) {
    // Content interactions have minimal energy cost by default
    // Can be overridden by specific implementations
    return 1;
  }

  /**
   * Checks if character meets the interaction requirements
   * @param {Object} character - The character to check
   * @returns {boolean} True if requirements are met
   */
  meetsRequirements(character) {
    return this.requirements.every(req => {
      const attrValue = character.attributes?.[req.attr]?.score || 0;
      return attrValue >= (req.min || 0);
    });
  }

  /**
   * Checks if the interaction's cooldown has expired
   * @param {number} currentTick - Current game tick
   * @returns {boolean} True if cooldown has expired
   */
  isCooldownExpired(currentTick) {
    if (this.repeatable) {
      return true;
    }
    return (currentTick - this.lastUsed) >= this.cooldown;
  }

  /**
   * Checks if the interaction is available (not on cooldown)
   * @param {number} currentTick - Current game tick
   * @returns {boolean} True if the interaction is available
   */
  isAvailable(currentTick) {
    return this.isCooldownExpired(currentTick);
  }

  /**
   * Marks the interaction as used, updating the lastUsed timestamp
   * @param {number} currentTick - Current game tick
   */
  markUsed(currentTick) {
    this.lastUsed = currentTick;
  }

  /**
   * Applies a single effect to the character
   * @param {Object} character - The character to apply the effect to
   * @param {Object} effect - The effect to apply
   * @returns {Object} Result of the effect application
   */
  applyEffect(character, effect) {
    const result = {
      type: effect.type,
      target: effect.target,
      value: effect.value,
      applied: false,
      error: null
    };

    try {
      switch (effect.type) {
        case 'influence':
          if (character.influence) {
            character.influence.value += effect.value;
            result.applied = true;
          }
          break;

        case 'relationship':
          if (character.relationships) {
            const currentValue = character.relationships.get(effect.target) || 0;
            character.relationships.set(effect.target, currentValue + effect.value);
            result.applied = true;
          }
          break;

        case 'attribute':
          if (character.attributes && character.attributes[effect.target]) {
            character.attributes[effect.target].score += effect.value;
            // Update modifier (D&D style: floor((score - 10) / 2))
            character.attributes[effect.target].modifier =
              Math.floor((character.attributes[effect.target].score - 10) / 2);
            result.applied = true;
          }
          break;

        case 'resource':
          if (character.resources && character.resources[effect.target] !== undefined) {
            character.resources[effect.target] += effect.value;
            result.applied = true;
          }
          break;

        default:
          result.error = `Unknown effect type: ${effect.type}`;
          break;
      }
    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  /**
   * Selects a branch based on character state and conditions
   * @param {Object} character - The character making the choice
   * @param {Object} context - Additional context for selection (optional)
   * @returns {Object|null} Selected branch or null if none available
   */
  async selectBranch(character, context = {}) {
    if (!this.branches.length) return null;

    const validBranches = this.branches.filter(branch =>
      !branch.condition || branch.condition(character)
    );

    if (!validBranches.length) return null;

    // Try personality-weighted selection if BranchWeightingService is available
    const WeightingService = await loadBranchWeightingService();
    if (WeightingService && character) {
      try {
        const weightingService = new WeightingService();
        const selectionResult = weightingService.selectWeightedBranch(
          character,
          validBranches,
          {
            interactionType: this.type,
            location: context.location,
            participants: context.participants,
            ...context
          }
        );

        return selectionResult ? selectionResult.branch : validBranches[0];
      } catch (error) {
        // Fall back to simple selection if weighted selection fails
        console.warn('BranchWeightingService failed, falling back to simple selection:', error.message);
      }
    }

    // Fallback: Simple selection (first valid branch)
    return validBranches[0];
  }

  /**
   * Adds a tag to the interaction
   * @param {string} tag - Tag to add
   */
  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  /**
   * Removes a tag from the interaction
   * @param {string} tag - Tag to remove
   */
  removeTag(tag) {
    const index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
    }
  }

  /**
   * Checks if the interaction has a specific tag
   * @param {string} tag - Tag to check for
   * @returns {boolean} True if the interaction has the tag
   */
  hasTag(tag) {
    return this.tags.includes(tag);
  }

  /**
   * Serializes the content interaction to a plain object
   * @returns {Object} Serialized interaction data
   */
  toJSON() {
    return {
      ...super.toJSON(),
      isContentInteraction: this.isContentInteraction,
      category: this.category,
      author: this.author,
      tags: [...this.tags],
      overrideFlags: { ...this.overrideFlags },
      requirements: [...this.requirements],
      branches: [...this.branches],
      effects: [...this.effects],
      participants: [...this.participants],
      cooldown: this.cooldown,
      repeatable: this.repeatable,
      lastUsed: this.lastUsed
    };
  }

  /**
   * Creates a content interaction instance from serialized data
   * @param {Object} data - Serialized interaction data
   * @returns {ContentInteraction} New content interaction instance
   */
  static fromJSON(data) {
    return new this(data);
  }
}

export default ContentInteraction;
export { ContentInteraction };
