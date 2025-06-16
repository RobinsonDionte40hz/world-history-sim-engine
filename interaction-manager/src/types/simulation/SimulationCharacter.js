import { DDAttributes, DDSkills } from '../DDAttributes';

export const SimulationCharacter = {
  id: String,
  name: String,
  type: String,
  attributes: {
    base: DDAttributes,
    modifiers: DDAttributes,
    racialBonuses: DDAttributes,
    temporaryModifiers: [{
      attribute: String,
      value: Number,
      duration: Number,
      source: String
    }]
  },
  skills: {
    proficiencies: [String],
    levels: Object, // Map of skill names to levels
    experience: Object, // Map of skill names to experience points
    governingAttributes: Object // Map of skill names to governing attributes
  },
  inventory: {
    items: [{
      id: String,
      quantity: Number,
      equipped: Boolean,
      condition: Number
    }],
    currency: Object,
    capacity: Number,
    weight: Number
  },
  family: {
    parents: [String],
    siblings: [String],
    spouse: String,
    children: [String],
    lineage: [{
      generation: Number,
      members: [String],
      relationships: Object
    }]
  },
  residence: {
    location: String,
    type: String,
    startDate: Number,
    status: String
  },
  occupation: {
    type: String,
    level: Number,
    experience: Number,
    income: Number,
    schedule: Object
  },
  autonomousGoals: [{
    id: String,
    type: String,
    priority: Number,
    progress: Number,
    requirements: Object,
    rewards: Object,
    deadline: Number,
    status: String
  }],
  decisionMaking: {
    personality: Object,
    preferences: Object,
    riskTolerance: Number,
    adaptability: Number,
    memory: [{
      type: String,
      content: Object,
      timestamp: Number,
      importance: Number
    }]
  },
  questHistory: [{
    questId: String,
    startDate: Number,
    completionDate: Number,
    status: String,
    progress: Number,
    outcomes: Object,
    rewards: Object
  }],
  consciousness: {
    state: String,
    traits: Object,
    emotions: Object,
    beliefs: Object,
    memories: [{
      type: String,
      content: Object,
      timestamp: Number,
      importance: Number
    }],
    evolution: [{
      timestamp: Number,
      changes: Object,
      reason: String
    }]
  },
  influence: {
    domains: [{
      domain: String,
      value: Number,
      history: [{
        timestamp: Number,
        change: Number,
        reason: String
      }]
    }]
  },
  prestige: {
    value: Number,
    visibility: Number,
    history: [{
      timestamp: Number,
      change: Number,
      reason: String
    }]
  },
  alignment: {
    axes: Object,
    history: [{
      timestamp: Number,
      axis: String,
      change: Number,
      reason: String
    }]
  },
  relationships: [{
    target: String,
    type: String,
    value: Number,
    history: [{
      timestamp: Number,
      change: Number,
      reason: String
    }]
  }],
  status: {
    health: Number,
    energy: Number,
    mood: Number,
    conditions: [{
      type: String,
      duration: Number,
      effects: Object
    }]
  },
  metadata: {
    creationDate: Number,
    lastUpdate: Number,
    version: String,
    tags: [String]
  }
}; 