// src/domain/entities/Skill.js

import { ValidationError } from '../../shared/types/ValueObjectTypes.js';

/**
 * Skill domain entity representing trainable skills with progression
 * Supports leveling, experience, passive bonuses, and ability unlocks
 * Integrates with character development and training systems
 */
class Skill {
  constructor(config = {}) {
    // Basic properties
    this.id = config.id || this._generateId();
    this.name = config.name || 'Unnamed Skill';
    this.description = config.description || '';
    
    // Classification
    this.category = config.category || 'general'; // combat, social, knowledge, craft, survival, magic
    this.subcategory = config.subcategory || null; // melee, diplomacy, history, smithing, etc.
    this.rarity = config.rarity || 'common'; // common, uncommon, rare, epic, legendary
    
    // Progression
    this.level = config.level || 0; // Current skill level (0-maxLevel)
    this.maxLevel = config.maxLevel || 100;
    this.experience = config.experience || 0; // Current XP
    this.experienceToNextLevel = config.experienceToNextLevel || this._calculateExpRequirement(this.level + 1);
    this.totalExperience = config.totalExperience || 0; // Cumulative XP
    
    // Experience curve
    this.experienceCurve = config.experienceCurve || 'standard'; // standard, fast, slow, custom
    this.experienceFormula = config.experienceFormula || null; // Custom formula string
    this.experienceMultiplier = config.experienceMultiplier || 1.0;
    
    // Passive benefits
    this.passiveEffects = config.passiveEffects || [];
    /*
      Effect per level:
      {
        minLevel: 1,
        type: 'attribute' | 'bonus' | 'unlock' | 'special',
        target: 'strength' | 'damage' | etc.,
        operation: 'add' | 'multiply' | 'set',
        value: number | string,
        description: 'Brief description of effect'
      }
    */
    
    // Attribute synergy
    this.primaryAttribute = config.primaryAttribute || null; // Main governing attribute
    this.secondaryAttributes = config.secondaryAttributes || []; // Supporting attributes
    this.attributeScaling = config.attributeScaling || 0.5; // How much attributes affect skill checks
    
    // Related skills (synergies)
    this.relatedSkills = config.relatedSkills || [];
    /*
      {
        skillId: 'related_skill_id',
        synergy: 0.1, // 10% of this skill's level adds to related skill checks
        description: 'How they work together'
      }
    */
    
    // Ability unlocks
    this.abilityUnlocks = config.abilityUnlocks || [];
    /*
      {
        level: 10,
        abilityId: 'special_ability_id',
        abilityName: 'Special Ability',
        description: 'Unlock special ability at level 10'
      }
    */
    
    // Requirements
    this.requirements = config.requirements || {};
    /*
      {
        level: number, // Character level
        attributes: { strength: 10 },
        skills: { athletics: 5 }, // Prerequisite skills
        race: ['human'],
        class: ['warrior'],
        trainer: false // Requires trainer to learn
      }
    */
    
    // Training
    this.trainable = config.trainable !== undefined ? config.trainable : true;
    this.trainingDifficulty = config.trainingDifficulty || 'medium'; // trivial, easy, medium, hard, extreme
    this.trainingTime = config.trainingTime || 60; // Minutes per training session
    this.trainingCost = config.trainingCost || 10; // Gold per training session
    this.selfTaught = config.selfTaught !== undefined ? config.selfTaught : true;
    this.trainerRequired = config.trainerRequired !== undefined ? config.trainerRequired : false;
    
    // Usage and practice
    this.practiceMultiplier = config.practiceMultiplier || 1.0; // XP gained from practice
    this.successBonus = config.successBonus || 1.2; // XP multiplier on successful use
    this.failurePenalty = config.failurePenalty || 0.5; // XP multiplier on failed use
    this.timesUsed = config.timesUsed || 0;
    this.successfulUses = config.successfulUses || 0;
    this.failedUses = config.failedUses || 0;
    
    // Mastery
    this.masteryThresholds = config.masteryThresholds || {
      novice: 0,
      apprentice: 20,
      journeyman: 40,
      expert: 60,
      master: 80,
      grandmaster: 95
    };
    
    // Visual and flavor
    this.icon = config.icon || '📊';
    this.color = config.color || '#4a5568';
    this.flavorText = config.flavorText || null;
    this.tags = config.tags || [];
    
    // Source and metadata
    this.source = config.source || 'training'; // racial, class, training, quest, book
    this.origin = config.origin || null;
    this.author = config.author || null;
    this.version = config.version || '1.0.0';
    this.createdAt = config.createdAt || new Date().toISOString();
    this.updatedAt = config.updatedAt || new Date().toISOString();
  }
  
  /**
   * Generate unique ID for skills
   * @private
   */
  _generateId() {
    return `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Calculate experience required for a given level
   * @private
   */
  _calculateExpRequirement(level) {
    if (this.experienceFormula) {
      // Use custom formula if provided
      try {
        return eval(this.experienceFormula.replace(/level/g, level));
      } catch (e) {
        console.warn('Invalid experience formula, using standard curve');
      }
    }
    
    // Standard D&D-style curve
    const baseCurves = {
      fast: level => Math.floor(100 * Math.pow(level, 1.5)),
      standard: level => Math.floor(100 * Math.pow(level, 1.8)),
      slow: level => Math.floor(100 * Math.pow(level, 2.0)),
      custom: level => Math.floor(100 * Math.pow(level, 1.8))
    };
    
    const curve = baseCurves[this.experienceCurve] || baseCurves.standard;
    return Math.floor(curve(level) * this.experienceMultiplier);
  }
  
  /**
   * Check if character meets requirements to learn this skill
   * @param {Character} character - The character to check
   * @returns {Object} { canLearn: boolean, reasons: string[] }
   */
  canBeLearnedBy(character) {
    const reasons = [];
    
    if (!this.requirements || Object.keys(this.requirements).length === 0) {
      return { canLearn: true, reasons: [] };
    }
    
    // Check character level
    if (this.requirements.level && character.level < this.requirements.level) {
      reasons.push(`Requires character level ${this.requirements.level}`);
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
    
    // Check skill prerequisites
    if (this.requirements.skills) {
      Object.entries(this.requirements.skills).forEach(([skillName, level]) => {
        const charSkillLevel = character.skills?.[skillName]?.level || 0;
        if (charSkillLevel < level) {
          reasons.push(`Requires ${skillName} level ${level}`);
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
    
    return {
      canLearn: reasons.length === 0,
      reasons
    };
  }
  
  /**
   * Add experience to the skill
   * @param {number} amount - Experience to add
   * @param {Object} context - Context for bonuses (success, critical, etc.)
   * @returns {Object} { levelsGained: number, newLevel: number, overflow: number }
   */
  addExperience(amount, context = {}) {
    // Apply multipliers
    let finalAmount = amount * this.practiceMultiplier;
    
    if (context.success) {
      finalAmount *= this.successBonus;
    } else if (context.failure) {
      finalAmount *= this.failurePenalty;
    }
    
    if (context.critical) {
      finalAmount *= 2.0; // Double XP on critical success
    }
    
    // Apply trainer bonus if present
    if (context.hasTrainer) {
      finalAmount *= 1.5;
    }
    
    finalAmount = Math.floor(finalAmount);
    
    this.experience += finalAmount;
    this.totalExperience += finalAmount;
    
    // Check for level ups
    let levelsGained = 0;
    while (this.experience >= this.experienceToNextLevel && this.level < this.maxLevel) {
      this.experience -= this.experienceToNextLevel;
      this.level++;
      levelsGained++;
      this.experienceToNextLevel = this._calculateExpRequirement(this.level + 1);
    }
    
    // Cap experience at max level
    if (this.level >= this.maxLevel) {
      this.experience = 0;
      this.experienceToNextLevel = 0;
    }
    
    return {
      levelsGained,
      newLevel: this.level,
      experienceGained: finalAmount,
      overflow: this.experience
    };
  }
  
  /**
   * Practice the skill (gain experience from use)
   * @param {number} difficulty - Difficulty of the task (1-30)
   * @param {boolean} success - Whether the attempt succeeded
   * @param {Object} context - Additional context
   * @returns {Object} Experience result
   */
  practice(difficulty = 10, success = true, context = {}) {
    this.timesUsed++;
    if (success) {
      this.successfulUses++;
    } else {
      this.failedUses++;
    }
    
    // Base XP = difficulty * 5
    const baseExp = difficulty * 5;
    
    return this.addExperience(baseExp, { ...context, success });
  }
  
  /**
   * Train the skill (structured practice)
   * @param {number} duration - Training duration in minutes
   * @param {Object} trainer - Trainer character (optional)
   * @returns {Object} Training result
   */
  train(duration = 60, trainer = null) {
    if (!this.trainable) {
      return {
        success: false,
        message: 'This skill cannot be trained'
      };
    }
    
    if (this.trainerRequired && !trainer) {
      return {
        success: false,
        message: 'This skill requires a trainer'
      };
    }
    
    // Calculate XP based on duration and difficulty
    const sessions = Math.floor(duration / this.trainingTime);
    const baseExpPerSession = 20;
    
    const difficultyMultipliers = {
      trivial: 0.5,
      easy: 0.75,
      medium: 1.0,
      hard: 1.5,
      extreme: 2.0
    };
    
    const multiplier = difficultyMultipliers[this.trainingDifficulty] || 1.0;
    const expPerSession = baseExpPerSession * multiplier;
    const totalExp = expPerSession * sessions;
    
    const result = this.addExperience(totalExp, { 
      hasTrainer: !!trainer,
      success: true 
    });
    
    return {
      success: true,
      sessions,
      ...result,
      message: `Trained ${this.name} for ${sessions} session(s)`
    };
  }
  
  /**
   * Get current mastery level
   * @returns {string} Mastery level name
   */
  getMasteryLevel() {
    const thresholds = Object.entries(this.masteryThresholds).sort((a, b) => b[1] - a[1]);
    
    for (const [name, threshold] of thresholds) {
      if (this.level >= threshold) {
        return name;
      }
    }
    
    return 'untrained';
  }
  
  /**
   * Get active passive effects for current level
   * @returns {Array} Array of active effects
   */
  getActiveEffects() {
    return this.passiveEffects.filter(effect => this.level >= effect.minLevel);
  }
  
  /**
   * Get unlocked abilities for current level
   * @returns {Array} Array of unlocked abilities
   */
  getUnlockedAbilities() {
    return this.abilityUnlocks.filter(unlock => this.level >= unlock.level);
  }
  
  /**
   * Get skill check bonus
   * @param {Character} character - Character using the skill
   * @returns {number} Total bonus to skill checks
   */
  getSkillCheckBonus(character) {
    let bonus = this.level;
    
    // Add attribute bonus if primary attribute is defined
    if (this.primaryAttribute && character.attributes) {
      const attrValue = character.attributes[this.primaryAttribute] || 
                       character.baseAttributes?.[this.primaryAttribute] || 10;
      const attrModifier = Math.floor((attrValue - 10) / 2);
      bonus += Math.floor(attrModifier * this.attributeScaling);
    }
    
    // Add synergy bonuses from related skills
    this.relatedSkills.forEach(related => {
      const relatedSkill = character.skills?.[related.skillId];
      if (relatedSkill) {
        bonus += Math.floor(relatedSkill.level * related.synergy);
      }
    });
    
    return bonus;
  }
  
  /**
   * Perform a skill check
   * @param {number} difficulty - DC to beat (1-30)
   * @param {Character} character - Character making the check
   * @param {Object} context - Additional modifiers
   * @returns {Object} Check result
   */
  performCheck(difficulty = 10, character, context = {}) {
    const bonus = this.getSkillCheckBonus(character);
    const roll = Math.floor(Math.random() * 20) + 1; // d20
    const total = roll + bonus + (context.modifier || 0);
    
    const success = total >= difficulty;
    const critical = roll === 20;
    const criticalFailure = roll === 1;
    
    // Award experience for using the skill
    this.practice(difficulty, success, { critical });
    
    return {
      roll,
      bonus,
      total,
      difficulty,
      success: success && !criticalFailure,
      critical,
      criticalFailure,
      margin: total - difficulty
    };
  }
  
  /**
   * Reset skill to level 0
   */
  reset() {
    this.level = 0;
    this.experience = 0;
    this.experienceToNextLevel = this._calculateExpRequirement(1);
    this.totalExperience = 0;
    this.timesUsed = 0;
    this.successfulUses = 0;
    this.failedUses = 0;
  }
  
  /**
   * Clone the skill
   * @returns {Skill} New skill instance
   */
  clone() {
    return new Skill({
      ...this.toJSON(),
      id: this._generateId()
    });
  }
  
  /**
   * Validate skill data
   * @returns {Object} { valid: boolean, errors: array }
   */
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim() === '') {
      errors.push('Skill name is required');
    }
    
    if (this.level < 0) {
      errors.push('Skill level cannot be negative');
    }
    
    if (this.level > this.maxLevel) {
      errors.push('Skill level cannot exceed max level');
    }
    
    if (this.experience < 0) {
      errors.push('Experience cannot be negative');
    }
    
    if (this.practiceMultiplier < 0) {
      errors.push('Practice multiplier cannot be negative');
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
      subcategory: this.subcategory,
      rarity: this.rarity,
      level: this.level,
      maxLevel: this.maxLevel,
      experience: this.experience,
      experienceToNextLevel: this.experienceToNextLevel,
      totalExperience: this.totalExperience,
      experienceCurve: this.experienceCurve,
      experienceFormula: this.experienceFormula,
      experienceMultiplier: this.experienceMultiplier,
      passiveEffects: this.passiveEffects.map(e => ({ ...e })),
      primaryAttribute: this.primaryAttribute,
      secondaryAttributes: [...this.secondaryAttributes],
      attributeScaling: this.attributeScaling,
      relatedSkills: this.relatedSkills.map(s => ({ ...s })),
      abilityUnlocks: this.abilityUnlocks.map(u => ({ ...u })),
      requirements: { ...this.requirements },
      trainable: this.trainable,
      trainingDifficulty: this.trainingDifficulty,
      trainingTime: this.trainingTime,
      trainingCost: this.trainingCost,
      selfTaught: this.selfTaught,
      trainerRequired: this.trainerRequired,
      practiceMultiplier: this.practiceMultiplier,
      successBonus: this.successBonus,
      failurePenalty: this.failurePenalty,
      timesUsed: this.timesUsed,
      successfulUses: this.successfulUses,
      failedUses: this.failedUses,
      masteryThresholds: { ...this.masteryThresholds },
      icon: this.icon,
      color: this.color,
      flavorText: this.flavorText,
      tags: [...this.tags],
      source: this.source,
      origin: this.origin,
      author: this.author,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
  
  /**
   * Create Skill from JSON
   * @param {Object} data - JSON data
   * @returns {Skill} Skill instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid JSON data for Skill');
    }
    
    return new Skill(data);
  }
}

export default Skill;
