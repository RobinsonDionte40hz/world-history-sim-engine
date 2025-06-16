import { DDAttributes } from '../../types/DDAttributes';
import { PersonalityTraits } from '../../PersonalitySystem';
import { ConsciousnessStateType } from '../../ConsciousnessSystem';
import { QuestNode } from '../../QuestSystem';
import { InfluenceRecord } from '../../InfluenceSystem';
import { PrestigeRecord } from '../../PrestigeSystem';
import { AlignmentRecord } from '../../AlignmentSystem';

// Base template interface that all templates extend
export const BaseTemplate = {
  id: String,
  name: String,
  description: String,
  version: String,
  tags: [String],
  metadata: Object
};

// Character template that integrates with existing personality and consciousness systems
export const CharacterTemplate = {
  ...BaseTemplate,
  baseTraits: PersonalityTraits,
  attributeDistribution: {
    strength: { min: 1, max: 20, weight: 1 },
    dexterity: { min: 1, max: 20, weight: 1 },
    constitution: { min: 1, max: 20, weight: 1 },
    intelligence: { min: 1, max: 20, weight: 1 },
    wisdom: { min: 1, max: 20, weight: 1 },
    charisma: { min: 1, max: 20, weight: 1 }
  },
  skillDistribution: {
    // Skills mapped to their governing attributes
    athletics: { attribute: 'strength', weight: 1 },
    acrobatics: { attribute: 'dexterity', weight: 1 },
    // Add more skills as needed
  },
  goalTypes: [String],
  behaviorPatterns: [{
    name: String,
    conditions: Object,
    actions: [String],
    priority: Number
  }],
  culturalModifiers: [{
    name: String,
    effects: Object
  }],
  consciousnessTemplate: {
    baseState: ConsciousnessStateType,
    evolutionRules: [{
      condition: Object,
      newState: ConsciousnessStateType,
      probability: Number
    }]
  },
  questPreferences: [{
    questType: String,
    weight: Number
  }]
};

// Node template that defines locations, organizations, and events
export const NodeTemplate = {
  ...BaseTemplate,
  nodeType: String,
  possibleConnections: [String],
  baseAttributes: DDAttributes,
  influenceEffects: [InfluenceRecord],
  prestigeEffects: [PrestigeRecord],
  alignmentEffects: [AlignmentRecord],
  questNodes: [QuestNode]
};

// Interaction template that integrates with existing systems
export const InteractionTemplate = {
  ...BaseTemplate,
  participantTypes: [String],
  triggerConditions: [{
    type: String,
    value: Object
  }],
  outcomeWeights: [{
    outcome: String,
    weight: Number,
    requirements: Object
  }],
  relationshipEffects: [{
    type: String,
    magnitude: Number,
    conditions: Object
  }],
  resourceEffects: [{
    resource: String,
    amount: Number,
    conditions: Object
  }],
  attributeRequirements: {
    // D&D attribute requirements
    attributes: Object,
    skillChecks: Object
  },
  influenceEffects: [{
    type: String,
    magnitude: Number,
    conditions: Object
  }],
  prestigeEffects: [{
    type: String,
    magnitude: Number,
    conditions: Object
  }],
  alignmentEffects: [{
    type: String,
    magnitude: Number,
    conditions: Object
  }]
};

// Event template for historical events
export const EventTemplate = {
  ...BaseTemplate,
  eventType: String,
  scale: String,
  duration: Number,
  effects: [{
    type: String,
    magnitude: Number,
    conditions: Object
  }],
  prerequisites: [{
    type: String,
    value: Object
  }],
  consequences: [{
    type: String,
    probability: Number,
    effects: Object
  }]
};

// Group template for factions, families, and organizations
export const GroupTemplate = {
  ...BaseTemplate,
  groupType: String,
  hierarchy: {
    levels: [String],
    roles: Object
  },
  goals: [{
    type: String,
    priority: Number,
    conditions: Object
  }],
  attributes: {
    influence: { min: 0, max: 100, weight: 1 },
    resources: { min: 0, max: 100, weight: 1 },
    stability: { min: 0, max: 100, weight: 1 }
  },
  relationships: [{
    target: String,
    type: String,
    strength: Number
  }]
};

// Item template for weapons, artifacts, and resources
export const ItemTemplate = {
  ...BaseTemplate,
  itemType: String,
  rarity: String,
  effects: [{
    type: String,
    magnitude: Number,
    conditions: Object
  }],
  requirements: {
    attributes: Object,
    skills: Object,
    level: Number
  },
  durability: {
    current: Number,
    maximum: Number,
    decayRate: Number
  },
  value: {
    base: Number,
    modifiers: Object
  }
}; 