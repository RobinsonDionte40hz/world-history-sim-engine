import { DDAttributes, DDSkills } from '../DDAttributes';

export const InteractionTemplate = {
  id: String,
  name: String,
  description: String,
  type: String, // 'social', 'combat', 'trade', 'diplomatic', etc.
  participantTypes: [String], // Types of entities that can participate
  triggerConditions: [{
    type: String,
    conditions: Object,
    probability: Number
  }],
  attributeRequirements: {
    type: String, // 'any', 'all', 'average'
    attributes: DDAttributes, // Minimum attribute scores required
    skillChecks: [{
      skill: String,
      difficulty: Number,
      attribute: String // Governing attribute
    }]
  },
  outcomeWeights: [{
    type: String,
    conditions: Object,
    weight: Number,
    effects: Object
  }],
  relationshipEffects: [{
    type: String,
    magnitude: Number,
    conditions: Object,
    duration: Number
  }],
  resourceEffects: [{
    type: String,
    amount: Number,
    conditions: Object,
    probability: Number
  }],
  consciousnessEffects: [{
    type: String,
    magnitude: Number,
    conditions: Object,
    duration: Number
  }],
  questIntegration: {
    canGenerateQuests: Boolean,
    questTypes: [String],
    questProbability: Number,
    questRequirements: Object
  },
  influenceEffects: [{
    type: String,
    magnitude: Number,
    conditions: Object,
    targetTypes: [String]
  }],
  prestigeEffects: [{
    type: String,
    magnitude: Number,
    conditions: Object,
    visibility: Number
  }],
  alignmentEffects: [{
    axis: String,
    magnitude: Number,
    conditions: Object
  }],
  cooldown: {
    duration: Number,
    resetConditions: Object
  },
  variants: [{
    name: String,
    description: String,
    modifiers: Object
  }]
}; 