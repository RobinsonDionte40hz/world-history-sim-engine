import { DDAttributes, DDSkills } from '../DDAttributes';
import { BaseTemplate } from './BaseTemplate';
import { RaceSystem } from '../../systems/character/RaceSystem';

export class CharacterTemplate extends BaseTemplate {
  constructor(data = {}) {
    super(data);
    this.raceSystem = new RaceSystem();
    
    // Race and subrace information
    this.race = data.race || null;
    this.subrace = data.subrace || null;
    
    // Get racial modifiers if race is specified
    if (this.race) {
      const racialModifiers = this.raceSystem.getRacialModifiers(this.race, this.subrace);
      this.attributes = {
        ...this.attributes,
        ...racialModifiers.attributes
      };
      this.skills = {
        ...this.skills,
        ...racialModifiers.skills
      };
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      race: this.race,
      subrace: this.subrace,
      // ... rest of existing toJSON properties ...
    };
  }

  static fromJSON(json) {
    const template = new CharacterTemplate();
    template.race = json.race;
    template.subrace = json.subrace;
    // ... rest of existing fromJSON properties ...
    return template;
  }
}

export const CharacterTemplate = {
  id: String,
  name: String,
  description: String,
  // Race system
  race: {
    name: String,
    description: String,
    subraces: [{
      name: String,
      description: String,
      attributeModifiers: DDAttributes,
      skillModifiers: DDSkills,
      features: [String]
    }],
    traits: [{
      name: String,
      description: String,
      effects: Object
    }],
    lifespan: {
      average: Number,
      maximum: Number
    },
    culturalModifiers: [{
      type: String,
      attributeModifiers: DDAttributes,
      skillModifiers: DDSkills,
      behaviorModifiers: Object
    }]
  },
  // Enhanced personality system
  personality: {
    traits: [{
      id: String,
      name: String,
      description: String,
      category: String, // From PersonalitySystem.traitCategories
      intensity: Number, // 0-1 scale
      baseLevel: Number, // 0-1 scale
      volatility: Number, // 0-1 scale
      influence: {
        attributes: DDAttributes,
        skills: DDSkills,
        behavior: Object
      }
    }],
    cognitiveTraits: [{
      id: String,
      name: String,
      description: String,
      category: String, // From PersonalitySystem.cognitiveCategories
      complexity: Number, // 0-1 scale
      adaptability: Number, // 0-1 scale
      influence: {
        attributes: DDAttributes,
        skills: DDSkills,
        behavior: Object
      }
    }],
    emotionalTendencies: [{
      id: String,
      name: String,
      description: String,
      category: String,
      intensity: Number, // 0-1 scale
      baseLevel: Number, // 0-1 scale
      volatility: Number, // 0-1 scale
      influence: {
        attributes: DDAttributes,
        skills: DDSkills,
        behavior: Object
      }
    }],
    // Personality development
    development: {
      traitGrowth: {
        rate: Number,
        factors: Object
      },
      emotionalStability: {
        baseLevel: Number,
        recoveryRate: Number
      },
      cognitiveDevelopment: {
        rate: Number,
        complexityCap: Number
      }
    }
  },
  baseTraits: {
    personality: Object, // Personality traits from existing system
    background: String,
    culture: String,
    socialClass: String
  },
  attributes: {
    distribution: {
      type: String, // 'random', 'point_buy', 'dice_roll'
      weights: DDAttributes, // Optional weights for attribute distribution
      minScore: Number,
      maxScore: Number
    },
    racialBonuses: DDAttributes, // Optional racial attribute bonuses
  },
  skills: {
    distribution: {
      type: String, // 'random', 'weighted', 'class_based'
      weights: DDSkills, // Optional weights for skill distribution
      proficiencyCount: Number, // Number of skills to be proficient in
    },
    classSkills: [String], // List of class-specific skills
  },
  goals: {
    types: [String], // Types of goals this character can pursue
    weights: Object, // Weights for different goal types
    frequency: Number, // How often to generate new goals
  },
  behaviorPatterns: [{
    type: String,
    conditions: Object,
    actions: [String],
    weights: Object
  }],
  culturalModifiers: [{
    type: String,
    attributeModifiers: DDAttributes,
    skillModifiers: DDSkills,
    behaviorModifiers: Object
  }],
  variants: [{
    name: String,
    description: String,
    modifiers: Object
  }],
  consciousness: {
    baseState: String,
    personalityWeights: Object,
    emotionalRange: Object,
    decisionPatterns: [Object]
  },
  // Historical simulation fields
  historicalSimulation: {
    // Life cycle and aging
    lifeCycle: {
      ageStages: [{
        name: String, // 'child', 'adolescent', 'adult', 'elder'
        ageRange: {
          min: Number,
          max: Number
        },
        attributeModifiers: DDAttributes,
        skillModifiers: DDSkills,
        behaviorModifiers: Object
      }],
      agingEffects: {
        attributeDecay: Object,
        skillRetention: Object,
        wisdomGrowth: Number
      }
    },
    // Historical relationships
    relationships: {
      types: [String], // 'family', 'political', 'trade', 'military'
      formationRules: [{
        type: String,
        conditions: Object,
        probability: Number,
        duration: Number
      }],
      inheritanceRules: [{
        type: String,
        conditions: Object,
        probability: Number
      }]
    },
    // Historical achievements
    achievements: {
      types: [String],
      requirements: Object,
      effects: {
        attributeChanges: DDAttributes,
        skillChanges: DDSkills,
        influenceChanges: Object
      },
      historicalSignificance: Number
    },
    // Legacy system
    legacy: {
      types: [String], // 'dynasty', 'invention', 'discovery', 'artistic'
      requirements: Object,
      effects: {
        attributeInheritance: DDAttributes,
        skillInheritance: DDSkills,
        influenceInheritance: Object
      },
      preservationFactors: Object
    },
    // Historical memory
    memory: {
      types: [String], // 'personal', 'cultural', 'historical'
      retention: {
        personal: Number,
        cultural: Number,
        historical: Number
      },
      accuracyDecay: Number,
      influenceOnDecisions: Number
    },
    // Historical influence
    influence: {
      domains: [String],
      spreadFactors: Object,
      decayRate: Number,
      inheritanceRules: Object
    },
    // Historical events participation
    eventParticipation: {
      types: [String],
      roles: [String],
      impactFactors: Object,
      historicalRecordGeneration: {
        detailLevel: Number,
        accuracy: Number,
        preservationChance: Number
      }
    }
  }
}; 