export const Settlement = {
  id: String,
  name: String,
  type: String, // 'village', 'town', 'city', 'kingdom', etc.
  population: {
    total: Number,
    composition: {
      types: [String],
      counts: Object
    },
    growth: Number,
    migration: Number
  },
  resources: {
    types: [String],
    amounts: Object,
    production: Object,
    consumption: Object,
    storage: Object
  },
  buildings: [{
    id: String,
    type: String,
    level: Number,
    status: String,
    capacity: Number,
    occupants: [String],
    production: Object,
    maintenance: Object
  }],
  government: {
    type: String,
    leader: String,
    structure: [{
      level: Number,
      positions: [{
        title: String,
        holder: String,
        responsibilities: Object,
        authority: Object
      }]
    }],
    policies: Object,
    laws: [{
      id: String,
      description: String,
      enforcement: Number,
      penalties: Object
    }]
  },
  economy: {
    currency: Object,
    trade: [{
      partner: String,
      resources: Object,
      value: Number,
      frequency: Number
    }],
    markets: [{
      type: String,
      location: String,
      goods: [{
        type: String,
        price: Number,
        supply: Number,
        demand: Number
      }]
    }],
    taxes: Object,
    income: Object,
    expenses: Object
  },
  history: [{
    id: String,
    timestamp: Number,
    type: String,
    description: String,
    participants: [String],
    effects: Object
  }],
  availableQuests: [{
    id: String,
    type: String,
    difficulty: Number,
    requirements: Object,
    rewards: Object,
    timeLimit: Number,
    status: String
  }],
  influenceStanding: [{
    domain: String,
    value: Number,
    history: [{
      timestamp: Number,
      change: Number,
      reason: String
    }]
  }],
  prestigeFactors: [{
    type: String,
    value: Number,
    visibility: Number,
    history: [{
      timestamp: Number,
      change: Number,
      reason: String
    }]
  }],
  territory: {
    size: Number,
    borders: Object,
    control: Object,
    features: [{
      type: String,
      location: Object,
      properties: Object
    }]
  },
  culture: {
    traits: Object,
    traditions: [{
      name: String,
      description: String,
      importance: Number,
      participants: [String]
    }],
    influences: Object,
    evolution: [{
      timestamp: Number,
      changes: Object,
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
  events: [{
    id: String,
    timestamp: Number,
    type: String,
    description: String,
    impact: Object,
    participants: [String]
  }],
  metadata: {
    creationDate: Number,
    lastUpdate: Number,
    version: String,
    tags: [String]
  }
}; 