// src/domain/value-objects/LODTier.js

const BaseValueObject = require('./BaseValueObject.js');

/**
 * Immutable value object representing a Level of Detail (LOD) tier for character processing
 * Defines processing characteristics, promotion/demotion rules, and performance parameters
 * for the 3-tier LOD system: hero, group, background
 */
class LODTier extends BaseValueObject {
  constructor(tier, config = {}) {
    super();

    // Validate tier
    this.validateRequired('tier', tier);
    this._validateTier(tier);

    this.tier = tier;
    this.name = config.name || tier;
    this.description = config.description || this._getDefaultDescription(tier);

    // Processing Characteristics
    this.processingComplexity = config.processingComplexity || this._getDefaultComplexity(tier);
    this.memoryFootprint = config.memoryFootprint || this._getDefaultMemoryFootprint(tier);
    this.updateFrequency = config.updateFrequency || this._getDefaultUpdateFrequency(tier);

    // Promotion/Demotion Rules
    this.promotionCriteria = Object.freeze({ ...config.promotionCriteria } || {});
    this.demotionCriteria = Object.freeze({ ...config.demotionCriteria } || {});
    this.maxPopulation = config.maxPopulation || this._getDefaultMaxPopulation(tier);

    // Processing Rules (derived)
    this.fullSimulation = tier === 'hero';
    this.statisticalProcessing = tier === 'group';
    this.aggregateOnly = tier === 'background';

    // Freeze the object to ensure immutability
    this.freeze();
  }

  /**
   * Check if a character can be promoted from this tier
   */
  canPromoteCharacter(character, context = {}) {
    if (this.tier === 'background') return false;
    if (this.tier === 'hero') return false; // Already at highest tier

    // Check promotion criteria
    return Object.entries(this.promotionCriteria).every(([criterion, threshold]) => {
      return this._evaluateCriterion(character, criterion, threshold, context);
    });
  }

  /**
   * Check if a character should be demoted from this tier
   */
  shouldDemoteCharacter(character, context = {}) {
    if (this.tier === 'background') return false; // Already at lowest tier

    // Check demotion criteria
    return Object.entries(this.demotionCriteria).some(([criterion, threshold]) => {
      return this._evaluateCriterion(character, criterion, threshold, context);
    });
  }

  /**
   * Get the next higher tier for promotion
   */
  getNextTier() {
    switch (this.tier) {
      case 'background': return 'group';
      case 'group': return 'hero';
      case 'hero': return null;
      default: return null;
    }
  }

  /**
   * Get the next lower tier for demotion
   */
  getPreviousTier() {
    switch (this.tier) {
      case 'hero': return 'group';
      case 'group': return 'background';
      case 'background': return null;
      default: return null;
    }
  }

  /**
   * Get processing priority (higher = process first)
   */
  getProcessingPriority() {
    switch (this.tier) {
      case 'hero': return 3;
      case 'group': return 2;
      case 'background': return 1;
      default: return 0;
    }
  }

  /**
   * Check if this tier requires individual character instances
   */
  requiresIndividualInstances() {
    return this.tier === 'hero';
  }

  /**
   * Check if this tier supports statistical aggregation
   */
  supportsStatisticalAggregation() {
    return this.tier === 'group' || this.tier === 'background';
  }

  /**
   * Get performance metrics for this tier
   */
  getPerformanceMetrics() {
    return {
      complexity: this.processingComplexity,
      memoryPerUnit: this.memoryFootprint,
      updateFrequency: this.updateFrequency,
      maxPopulation: this.maxPopulation
    };
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      tier: this.tier,
      name: this.name,
      description: this.description,
      processingComplexity: this.processingComplexity,
      memoryFootprint: this.memoryFootprint,
      updateFrequency: this.updateFrequency,
      promotionCriteria: { ...this.promotionCriteria },
      demotionCriteria: { ...this.demotionCriteria },
      maxPopulation: this.maxPopulation,
      fullSimulation: this.fullSimulation,
      statisticalProcessing: this.statisticalProcessing,
      aggregateOnly: this.aggregateOnly
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for LODTier');
    }

    return new LODTier(data.tier, {
      name: data.name,
      description: data.description,
      processingComplexity: data.processingComplexity,
      memoryFootprint: data.memoryFootprint,
      updateFrequency: data.updateFrequency,
      promotionCriteria: data.promotionCriteria,
      demotionCriteria: data.demotionCriteria,
      maxPopulation: data.maxPopulation
    });
  }

  /**
   * Create predefined tier instances
   */
  static HERO = new LODTier('hero', {
    name: 'Hero NPC',
    description: 'Full consciousness simulation with complete character processing',
    processingComplexity: 'full',
    memoryFootprint: 8192, // ~8KB
    updateFrequency: 'every_turn',
    maxPopulation: 12,
    promotionCriteria: {},
    demotionCriteria: {
      inactivityTurns: 50,
      playerInteractionCount: -1
    }
  });

  static GROUP = new LODTier('group', {
    name: 'Population Group',
    description: 'Statistical processing with individual sampling on demand',
    processingComplexity: 'statistical',
    memoryFootprint: 2048, // ~2KB
    updateFrequency: 'every_turn',
    maxPopulation: 40,
    promotionCriteria: {
      playerInteractionCount: 3,
      questInvolvement: 1
    },
    demotionCriteria: {
      inactivityTurns: 20,
      playerInteractionCount: -5
    }
  });

  static BACKGROUND = new LODTier('background', {
    name: 'Background Demographics',
    description: 'Pure numerical tracking for settlement-level effects',
    processingComplexity: 'aggregate',
    memoryFootprint: 100, // ~100 bytes
    updateFrequency: 'every_few_turns',
    maxPopulation: Infinity,
    promotionCriteria: {
      settlementSignificance: 0.8,
      populationSize: 100
    },
    demotionCriteria: {}
  });

  /**
   * Get a predefined tier instance by name
   */
  static get(tierName) {
    switch (tierName) {
      case 'hero': return LODTier.HERO;
      case 'group': return LODTier.GROUP;
      case 'background': return LODTier.BACKGROUND;
      default: throw new Error(`Unknown LOD tier: ${tierName}`);
    }
  }

  /**
   * Validate the tier value
   */
  _validateTier(tier) {
    const validTiers = ['hero', 'group', 'background'];
    if (!validTiers.includes(tier)) {
      throw new Error(`Invalid LOD tier: ${tier}. Must be one of: ${validTiers.join(', ')}`);
    }
  }

  /**
   * Get default description for a tier
   */
  _getDefaultDescription(tier) {
    switch (tier) {
      case 'hero':
        return 'Full consciousness simulation with complete character processing';
      case 'group':
        return 'Statistical processing with individual sampling on demand';
      case 'background':
        return 'Pure numerical tracking for settlement-level effects';
      default:
        return '';
    }
  }

  /**
   * Get default processing complexity for a tier
   */
  _getDefaultComplexity(tier) {
    switch (tier) {
      case 'hero': return 'full';
      case 'group': return 'statistical';
      case 'background': return 'aggregate';
      default: return 'minimal';
    }
  }

  /**
   * Get default memory footprint for a tier
   */
  _getDefaultMemoryFootprint(tier) {
    switch (tier) {
      case 'hero': return 8192; // ~8KB
      case 'group': return 2048; // ~2KB
      case 'background': return 100; // ~100 bytes
      default: return 0;
    }
  }

  /**
   * Get default update frequency for a tier
   */
  _getDefaultUpdateFrequency(tier) {
    switch (tier) {
      case 'hero': return 'every_turn';
      case 'group': return 'every_turn';
      case 'background': return 'every_few_turns';
      default: return 'never';
    }
  }

  /**
   * Get default max population for a tier
   */
  _getDefaultMaxPopulation(tier) {
    switch (tier) {
      case 'hero': return 12;
      case 'group': return 40;
      case 'background': return Infinity;
      default: return 0;
    }
  }

  /**
   * Evaluate a promotion/demotion criterion against a character
   */
  _evaluateCriterion(character, criterion, threshold, context = {}) {
    // This is a simplified implementation - in practice, this would
    // evaluate various character properties and context factors
    switch (criterion) {
      case 'playerInteractionCount':
        const interactionCount = character.playerInteractionCount || 0;
        return threshold > 0 ? interactionCount >= threshold : interactionCount <= Math.abs(threshold);

      case 'inactivityTurns':
        const inactivityTurns = character.inactivityTurns || 0;
        return inactivityTurns >= threshold;

      case 'questInvolvement':
        const questCount = character.completedQuests?.length || 0;
        return questCount >= threshold;

      case 'settlementSignificance':
        // Would evaluate character's importance to settlement
        return (character.settlementSignificance || 0) >= threshold;

      case 'populationSize':
        // For background tier promotions based on group size
        return (character.groupSize || 0) >= threshold;

      default:
        // Unknown criteria default to false (no promotion/demotion)
        return false;
    }
  }
}

module.exports = { LODTier };