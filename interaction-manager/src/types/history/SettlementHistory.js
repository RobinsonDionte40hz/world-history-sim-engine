export const SettlementHistory = {
  id: String,
  name: String,
  foundingDate: Number,
  population: [{
    timestamp: Number,
    total: Number,
    composition: {
      types: [String],
      counts: Object
    },
    growth: Number,
    migration: Number
  }],
  leadership: [{
    timestamp: Number,
    leader: String,
    type: String,
    achievements: [String],
    policies: Object
  }],
  economy: [{
    timestamp: Number,
    resources: Object,
    production: Object,
    consumption: Object,
    trade: [{
      partner: String,
      resources: Object,
      value: Number
    }]
  }],
  conflicts: [{
    id: String,
    startDate: Number,
    endDate: Number,
    type: String,
    participants: [{
      id: String,
      role: String,
      outcomes: Object
    }],
    casualties: Object,
    resolution: String,
    consequences: Object
  }],
  alliances: [{
    id: String,
    startDate: Number,
    endDate: Number,
    partners: [String],
    terms: Object,
    benefits: Object,
    obligations: Object
  }],
  development: [{
    timestamp: Number,
    stage: String,
    features: [String],
    buildings: [{
      type: String,
      level: Number,
      status: String
    }],
    infrastructure: Object
  }],
  questsAvailable: [{
    timestamp: Number,
    quests: [{
      id: String,
      type: String,
      difficulty: Number,
      rewards: Object,
      requirements: Object
    }],
    completionRate: Number
  }],
  influenceDomains: [{
    domain: String,
    history: [{
      timestamp: Number,
      value: Number,
      change: Number,
      reason: String
    }],
    currentValue: Number,
    spread: Object
  }],
  prestige: {
    history: [{
      timestamp: Number,
      value: Number,
      change: Number,
      reason: String,
      visibility: Number
    }],
    currentValue: Number,
    sources: Object
  },
  alignment: {
    history: [{
      timestamp: Number,
      axis: String,
      value: Number,
      change: Number,
      reason: String
    }],
    currentValues: Object
  },
  territory: {
    history: [{
      timestamp: Number,
      size: Number,
      borders: Object,
      control: Object
    }],
    currentSize: Number,
    controlledAreas: Object
  },
  events: [{
    id: String,
    timestamp: Number,
    type: String,
    description: String,
    impact: Object,
    participants: [String]
  }],
  culture: {
    history: [{
      timestamp: Number,
      traits: Object,
      influences: Object,
      changes: Object
    }],
    currentTraits: Object,
    dominantInfluences: Object
  }
}; 