import { DDAttributes, DDSkills } from '../DDAttributes';

export const NPCHistory = {
  id: String,
  name: String,
  birthDate: Number,
  deathDate: Number,
  attributes: {
    history: [{
      timestamp: Number,
      attributes: DDAttributes,
      reason: String
    }],
    racialBonuses: DDAttributes,
    temporaryModifiers: [{
      attribute: String,
      value: Number,
      duration: Number,
      source: String
    }]
  },
  skills: {
    history: [{
      timestamp: Number,
      skill: String,
      level: Number,
      experience: Number,
      reason: String
    }],
    proficiencies: [String],
    specializations: [String]
  },
  personalityTraits: {
    history: [{
      timestamp: Number,
      traits: Object,
      reason: String
    }],
    currentTraits: Object
  },
  relationships: [{
    target: String,
    type: String,
    history: [{
      timestamp: Number,
      change: Number,
      reason: String
    }],
    currentValue: Number
  }],
  achievements: [{
    id: String,
    name: String,
    description: String,
    timestamp: Number,
    rewards: Object
  }],
  questsCompleted: [{
    questId: String,
    completionDate: Number,
    outcomes: Object,
    rewards: Object
  }],
  residenceHistory: [{
    location: String,
    startDate: Number,
    endDate: Number,
    reason: String
  }],
  inventory: [{
    timestamp: Number,
    items: [{
      id: String,
      quantity: Number,
      source: String
    }]
  }],
  goals: [{
    id: String,
    type: String,
    startDate: Number,
    endDate: Number,
    status: String,
    progress: Number,
    outcomes: Object
  }],
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
  consciousness: {
    history: [{
      timestamp: Number,
      state: String,
      triggers: [String],
      effects: Object
    }],
    currentState: String,
    evolution: [{
      timestamp: Number,
      changes: Object,
      reason: String
    }]
  },
  influence: {
    domains: [{
      domain: String,
      history: [{
        timestamp: Number,
        change: Number,
        reason: String
      }],
      currentValue: Number
    }]
  },
  prestige: {
    history: [{
      timestamp: Number,
      change: Number,
      reason: String,
      visibility: Number
    }],
    currentValue: Number
  },
  alignment: {
    history: [{
      timestamp: Number,
      axis: String,
      change: Number,
      reason: String
    }],
    currentValues: Object
  }
}; 