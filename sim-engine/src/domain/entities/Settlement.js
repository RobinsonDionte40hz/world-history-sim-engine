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
  politics: {
    politicalHistory: [{
      eventId: String,
      timestamp: Number,
      type: String,
      significance: Number,
      description: String,
      participants: [String],
      effects: Object,
      metadata: Object
    }],
    diplomaticRelationships: [{
      targetSettlementId: String,
      status: String, // neutral, allied, hostile, at_war, trade_partner, vassal, protectorate
      statusHistory: [{
        timestamp: Number,
        from: String,
        to: String,
        reason: String
      }],
      treaties: [{
        id: String,
        type: String,
        startDate: Number,
        endDate: Number,
        terms: Object,
        isActive: Boolean
      }],
      trustLevel: Number, // 0-100
      economicTies: Number,
      militaryThreat: Number,
      culturalExchange: Number,
      lastInteraction: Number
    }],
    leadershipHistory: [{
      leaderId: String,
      startDate: Number,
      endDate: Number,
      tenure: Number, // in days
      reason: String, // election, succession, resignation, impeachment, coup, death
      achievements: [{
        type: String,
        description: String,
        significance: Number,
        timestamp: Number
      }],
      policies: [{
        type: String,
        description: String,
        effectiveness: Number,
        timestamp: Number
      }],
      transitions: {
        predecessorId: String,
        successorId: String,
        transitionType: String // peaceful, contested, forced
      }
    }],
    governmentEffectiveness: {
      stability: Number, // 0-100, based on leadership changes and policy success
      policySuccess: Number, // 0-100, based on implemented policies effectiveness
      publicSupport: Number, // 0-100, based on need satisfaction and events
      administrativeEfficiency: Number, // 0-100, based on building maintenance and corruption
      diplomaticStrength: Number, // 0-100, based on relationship quality
      lastCalculated: Number,
      history: [{
        timestamp: Number,
        stability: Number,
        policySuccess: Number,
        publicSupport: Number,
        administrativeEfficiency: Number,
        diplomaticStrength: Number,
        factors: Object // contributing factors
      }]
    }
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
  needSatisfaction: {
    current: {
      food: Number,
      water: Number,
      shelter: Number,
      goods: Number,
      services: Number,
      overall: Number,
      lastCalculated: Number
    },
    history: [{
      timestamp: Number,
      needs: {
        food: Number,
        water: Number,
        shelter: Number,
        goods: Number,
        services: Number
      },
      overall: Number,
      consequences: [String], // Array of consequence IDs
      events: [String] // Array of historical event IDs
    }],
    trends: {
      food: Number,
      water: Number,
      shelter: Number,
      goods: Number,
      services: Number,
      overall: Number
    },
    activeConsequences: [{
      id: String,
      type: String,
      severity: Number,
      startDate: Number,
      duration: Number,
      triggers: [String],
      resolved: Boolean
    }]
  },
  metadata: {
    creationDate: Number,
    lastUpdate: Number,
    version: String,
    tags: [String]
  }
}; 