import { DDAttributes, DDSkills } from '../DDAttributes';

export const CharacterTemplate = {
  id: String,
  name: String,
  description: String,
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
  }
}; 