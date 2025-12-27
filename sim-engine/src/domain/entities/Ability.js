// src/domain/entities/Ability.js

import { ValidationError } from '../../shared/types/ValueObjectTypes.js';

/**
 * Ability domain entity representing character abilities, spells, and special actions
 * Supports active abilities, passive abilities, and triggered abilities
 * Integrates with character attributes, skills, and resource management
 */
class Ability {
  constructor(config = {}) {
    // Basic properties
    this.id = config.id || this._generateId();
    this.name = config.name || 'Unnamed Ability';
    this.description = config.description || '';
    
    // Classification
    this.category = config.category || 'general'; // combat, utility, social, crafting, magic, special
    this.type = config.type || 'active'; // active, passive, triggered, channeled, ritual
    this.school = config.school || null; // For magic: evocation, abjuration, etc.
    this.rarity = config.rarity || 'common'; // common, uncommon, rare, epic, legendary
    
    // Activation
    this.activationType = config.activationType || 'action'; // action, bonus_action, reaction, passive, free
    this.range = config.range || { type: 'self', distance: 0 }; // self, touch, ranged, sight
    this.targeting = config.targeting || 'self'; // self, single, multiple, area, line, cone
    this.areaOfEffect = config.areaOfEffect || null; // { shape: 'sphere', size: 20 }
    
    // Costs
    this.costs = config.costs || {};
    /*
      {
        energy: 10,
        health: 5,
        mana: 15,
        resources: { gold: 10 },
        items: [{ itemId: 'spell_component', quantity: 1 }]
      }
    */
    
    // Cooldown and usage limits
    this.cooldown = config.cooldown || 0; // Turns before ability can be used again
    this.currentCooldown = config.currentCooldown || 0;
    this.maxUsesPerDay = config.maxUsesPerDay || null; // null = unlimited
    this.currentUsesToday = config.currentUsesToday || 0;
    this.chargesRequired = config.chargesRequired || null; // For items with charges
    
    // Duration
    this.duration = config.duration || 'instant'; // instant, concentration, or number of turns
    this.concentrationRequired = config.concentrationRequired || false;
    
    // Effects
    this.effects = config.effects || [];
    /*
      Effect structure:
      {
        type: 'damage' | 'healing' | 'buff' | 'debuff' | 'summon' | 'environmental' | 'special',
        target: 'self' | 'target' | 'all',
        operation: 'add' | 'multiply' | 'set' | 'roll',
        value: number | string (e.g., '2d6+4'),
        damageType: 'physical' | 'fire' | 'cold' | 'lightning' | etc.,
        attribute: null | string (which attribute to modify),
        duration: null | number (turns),
        saveType: null | string (constitution, dexterity, etc.),
        saveDC: null | number
      }
    */
    
    // Scaling
    this.scaling = config.scaling || [];
    /*
      {
        attribute: 'intelligence',
        formula: '1d6 per 2 levels',
        type: 'damage' | 'healing' | 'duration'
      }
    */
    
    // Requirements
    this.requirements = config.requirements || {};
    /*
      {
        level: number,
        attributes: { intelligence: 13 },
        skills: { arcana: 10 },
        race: ['elf'],
        class: ['wizard', 'sorcerer'],
        abilities: ['ability_id_1'], // Prerequisite abilities
        quests: ['quest_id_1']
      }
    */
    
    // Conditions
    this.conditions = config.conditions || {};
    /*
      {
        requiredState: 'combat' | 'exploration' | 'social',
        timeOfDay: ['day', 'night'],
        weather: ['clear', 'rain'],
        environment: ['indoors', 'outdoors'],
        healthThreshold: { below: 0.5 } // Triggers when below 50% health
      }
    */
    
    // Success and failure
    this.successRate = config.successRate || 1.0; // Base success rate (0.0 - 1.0)
    this.criticalChance = config.criticalChance || 0.05; // 5% default
    this.criticalMultiplier = config.criticalMultiplier || 2.0;
    this.failureEffects = config.failureEffects || []; // Effects on failure
    this.criticalEffects = config.criticalEffects || []; // Extra effects on critical success
    
    // Upgrades and progression
    this.level = config.level || 1; // Current ability level
    this.maxLevel = config.maxLevel || 10;
    this.upgradeEffects = config.upgradeEffects || {}; // Effects per level
    
    // Visual and flavor
    this.icon = config.icon || '⚡';
    this.animation = config.animation || null;
    this.soundEffect = config.soundEffect || null;
    this.visualEffect = config.visualEffect || null;
    this.flavorText = config.flavorText || null;
    this.tags = config.tags || [];
    
    // Source and metadata
    this.source = config.source || 'custom'; // racial, class, item, quest, training
    this.origin = config.origin || null; // Template or source ID
    this.learnMethod = config.learnMethod || 'automatic'; // automatic, training, quest, item
    this.trainable = config.trainable !== undefined ? config.trainable : false;
    this.author = config.author || null;
    this.version = config.version || '1.0.0';
    this.createdAt = config.createdAt || new Date().toISOString();
    this.updatedAt = config.updatedAt || new Date().toISOString();
  }
  
  /**
   * Generate unique ID for abilities
   * @private
   */
  _generateId() {
    return `ability_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Check if character meets requirements to learn/use this ability
   * @param {Character} character - The character to check
   * @returns {Object} { canUse: boolean, reasons: string[] }
   */
  canBeUsedBy(character) {
    const reasons = [];
    
    if (!this.requirements || Object.keys(this.requirements).length === 0) {
      return { canUse: true, reasons: [] };
    }
    
    // Check level requirement
    if (this.requirements.level && character.level < this.requirements.level) {
      reasons.push(`Requires level ${this.requirements.level}`);
    }
    
    // Check attribute requirements
    if (this.requirements.attributes) {
      Object.entries(this.requirements.attributes).forEach(([attr, value]) => {
        const charValue = character.attributes?.[attr] || character.baseAttributes?.[attr] || 0;
        if (charValue < value) {
          reasons.push(`Requires ${attr} ${value}`);
        }
      });
    }
    
    // Check skill requirements
    if (this.requirements.skills) {
      Object.entries(this.requirements.skills).forEach(([skill, value]) => {
        const charValue = character.skills?.[skill] || 0;
        if (charValue < value) {
          reasons.push(`Requires ${skill} ${value}`);
        }
      });
    }
    
    // Check race requirement
    if (this.requirements.race && this.requirements.race.length > 0) {
      const charRace = character.racialTraits?.raceId || character.race || 'unknown';
      if (!this.requirements.race.includes(charRace)) {
        reasons.push(`Restricted to: ${this.requirements.race.join(', ')}`);
      }
    }
    
    // Check prerequisite abilities
    if (this.requirements.abilities && this.requirements.abilities.length > 0) {
      const charAbilities = character.abilities?.map(a => a.id) || [];
      const missingAbilities = this.requirements.abilities.filter(
        reqAbility => !charAbilities.includes(reqAbility)
      );
      if (missingAbilities.length > 0) {
        reasons.push(`Requires abilities: ${missingAbilities.join(', ')}`);
      }
    }
    
    return {
      canUse: reasons.length === 0,
      reasons
    };
  }
  
  /**
   * Check if ability can be activated right now
   * @param {Character} character - The character using the ability
   * @param {Object} context - Current context (combat, location, etc.)
   * @returns {Object} { canActivate: boolean, reasons: string[] }
   */
  canActivate(character, context = {}) {
    const reasons = [];
    
    // Check if on cooldown
    if (this.currentCooldown > 0) {
      reasons.push(`On cooldown for ${this.currentCooldown} more turns`);
    }
    
    // Check daily usage limit
    if (this.maxUsesPerDay !== null && this.currentUsesToday >= this.maxUsesPerDay) {
      reasons.push(`Maximum uses per day reached (${this.maxUsesPerDay})`);
    }
    
    // Check resource costs
    if (this.costs.energy && character.energy < this.costs.energy) {
      reasons.push(`Insufficient energy (need ${this.costs.energy}, have ${character.energy})`);
    }
    
    if (this.costs.health && character.health < this.costs.health) {
      reasons.push(`Insufficient health (need ${this.costs.health}, have ${character.health})`);
    }
    
    if (this.costs.mana && character.mana && character.mana < this.costs.mana) {
      reasons.push(`Insufficient mana (need ${this.costs.mana}, have ${character.mana})`);
    }
    
    // Check condition requirements
    if (this.conditions.requiredState && context.state !== this.conditions.requiredState) {
      reasons.push(`Can only be used during ${this.conditions.requiredState}`);
    }
    
    if (this.conditions.healthThreshold) {
      const healthPercent = character.health / character.maxHealth;
      if (this.conditions.healthThreshold.below && healthPercent >= this.conditions.healthThreshold.below) {
        reasons.push(`Can only be used when health is below ${this.conditions.healthThreshold.below * 100}%`);
      }
      if (this.conditions.healthThreshold.above && healthPercent <= this.conditions.healthThreshold.above) {
        reasons.push(`Can only be used when health is above ${this.conditions.healthThreshold.above * 100}%`);
      }
    }
    
    return {
      canActivate: reasons.length === 0,
      reasons
    };
  }
  
  /**
   * Activate the ability
   * @param {Character} character - The character using the ability
   * @param {Object} targets - Target(s) of the ability
   * @param {Object} context - Additional context
   * @returns {Object} Result of activation
   */
  activate(character, targets = [], context = {}) {
    // Check if can activate
    const canUseCheck = this.canBeUsedBy(character);
    if (!canUseCheck.canUse) {
      return {
        success: false,
        reasons: canUseCheck.reasons,
        effects: []
      };
    }
    
    const canActivateCheck = this.canActivate(character, context);
    if (!canActivateCheck.canActivate) {
      return {
        success: false,
        reasons: canActivateCheck.reasons,
        effects: []
      };
    }
    
    // Apply costs
    if (this.costs.energy) character.energy -= this.costs.energy;
    if (this.costs.health) character.health -= this.costs.health;
    if (this.costs.mana && character.mana) character.mana -= this.costs.mana;
    
    // Set cooldown and increment usage
    this.currentCooldown = this.cooldown;
    this.currentUsesToday++;
    
    // Calculate success
    const roll = Math.random();
    const success = roll <= this.successRate;
    const critical = roll <= this.criticalChance;
    
    // Determine which effects to apply
    let appliedEffects = [];
    if (success) {
      appliedEffects = [...this.effects];
      if (critical) {
        appliedEffects = [...appliedEffects, ...this.criticalEffects];
      }
    } else {
      appliedEffects = this.failureEffects;
    }
    
    // Apply scaling
    const scaledEffects = this._applyScaling(appliedEffects, character);
    
    return {
      success,
      critical,
      effects: scaledEffects,
      targets,
      message: this._getActivationMessage(success, critical)
    };
  }
  
  /**
   * Apply attribute scaling to effects
   * @private
   */
  _applyScaling(effects, character) {
    if (!this.scaling || this.scaling.length === 0) {
      return effects;
    }
    
    return effects.map(effect => {
      const scaledEffect = { ...effect };
      
      this.scaling.forEach(scale => {
        if (effect.type === scale.type) {
          const attrValue = character.attributes?.[scale.attribute] || 
                           character.baseAttributes?.[scale.attribute] || 10;
          const modifier = Math.floor((attrValue - 10) / 2);
          
          // Simple scaling: add attribute modifier to value
          if (typeof scaledEffect.value === 'number') {
            scaledEffect.value += modifier;
          }
        }
      });
      
      return scaledEffect;
    });
  }
  
  /**
   * Get activation message
   * @private
   */
  _getActivationMessage(success, critical) {
    if (critical) {
      return `${this.name} - Critical Success!`;
    }
    if (success) {
      return `${this.name} activated successfully`;
    }
    return `${this.name} failed`;
  }
  
  /**
   * Reduce cooldown (called at end of turn)
   */
  tickCooldown() {
    if (this.currentCooldown > 0) {
      this.currentCooldown--;
    }
  }
  
  /**
   * Reset daily usage counter
   */
  resetDailyUses() {
    this.currentUsesToday = 0;
  }
  
  /**
   * Upgrade the ability to next level
   * @returns {Object} { success: boolean, message: string, newLevel: number }
   */
  upgrade() {
    if (this.level >= this.maxLevel) {
      return {
        success: false,
        message: 'Ability is already at max level',
        newLevel: this.level
      };
    }
    
    this.level++;
    
    // Apply upgrade effects if defined
    if (this.upgradeEffects[this.level]) {
      Object.assign(this, this.upgradeEffects[this.level]);
    }
    
    return {
      success: true,
      message: `${this.name} upgraded to level ${this.level}`,
      newLevel: this.level
    };
  }
  
  /**
   * Clone the ability
   * @returns {Ability} New ability instance
   */
  clone() {
    return new Ability({
      ...this.toJSON(),
      id: this._generateId()
    });
  }
  
  /**
   * Validate ability data
   * @returns {Object} { valid: boolean, errors: array }
   */
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim() === '') {
      errors.push('Ability name is required');
    }
    
    if (this.level < 1) {
      errors.push('Ability level must be at least 1');
    }
    
    if (this.level > this.maxLevel) {
      errors.push('Ability level cannot exceed max level');
    }
    
    if (this.cooldown < 0) {
      errors.push('Cooldown cannot be negative');
    }
    
    if (this.successRate < 0 || this.successRate > 1) {
      errors.push('Success rate must be between 0 and 1');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Serialize to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      type: this.type,
      school: this.school,
      rarity: this.rarity,
      activationType: this.activationType,
      range: { ...this.range },
      targeting: this.targeting,
      areaOfEffect: this.areaOfEffect ? { ...this.areaOfEffect } : null,
      costs: { ...this.costs },
      cooldown: this.cooldown,
      currentCooldown: this.currentCooldown,
      maxUsesPerDay: this.maxUsesPerDay,
      currentUsesToday: this.currentUsesToday,
      chargesRequired: this.chargesRequired,
      duration: this.duration,
      concentrationRequired: this.concentrationRequired,
      effects: this.effects.map(e => ({ ...e })),
      scaling: this.scaling.map(s => ({ ...s })),
      requirements: { ...this.requirements },
      conditions: { ...this.conditions },
      successRate: this.successRate,
      criticalChance: this.criticalChance,
      criticalMultiplier: this.criticalMultiplier,
      failureEffects: this.failureEffects.map(e => ({ ...e })),
      criticalEffects: this.criticalEffects.map(e => ({ ...e })),
      level: this.level,
      maxLevel: this.maxLevel,
      upgradeEffects: { ...this.upgradeEffects },
      icon: this.icon,
      animation: this.animation,
      soundEffect: this.soundEffect,
      visualEffect: this.visualEffect,
      flavorText: this.flavorText,
      tags: [...this.tags],
      source: this.source,
      origin: this.origin,
      learnMethod: this.learnMethod,
      trainable: this.trainable,
      author: this.author,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
  
  /**
   * Create Ability from JSON
   * @param {Object} data - JSON data
   * @returns {Ability} Ability instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid JSON data for Ability');
    }
    
    return new Ability(data);
  }
}

export default Ability;
