export const GroupTemplate = {
  id: String,
  name: String,
  description: String,
  type: String, // 'settlement', 'kingdom', 'guild', 'faction', etc.
  structure: {
    hierarchy: [{
      level: Number,
      name: String,
      maxCount: Number,
      requirements: Object
    }],
    roles: [{
      name: String,
      description: String,
      requirements: Object,
      privileges: Object
    }]
  },
  population: {
    minSize: Number,
    maxSize: Number,
    growthRate: Number,
    composition: {
      types: [String],
      distribution: Object
    }
  },
  resources: {
    types: [String],
    production: Object,
    consumption: Object,
    storage: Object
  },
  territory: {
    maxSize: Number,
    expansionRate: Number,
    controlMechanism: String,
    borderTypes: [String]
  },
  relationships: {
    types: [String],
    formationRules: Object,
    maintenanceRules: Object,
    conflictResolution: Object
  },
  development: {
    stages: [{
      name: String,
      requirements: Object,
      features: [String],
      populationThreshold: Number
    }],
    growthFactors: Object,
    decayFactors: Object
  },
  influence: {
    domains: [String],
    spreadRate: Number,
    resistance: Number,
    modifiers: Object
  },
  prestige: {
    sources: [String],
    accumulation: Object,
    decay: Object,
    visibility: Number
  },
  alignment: {
    axes: [String],
    defaultValues: Object,
    driftRate: Number,
    stability: Number
  },
  quests: {
    generation: {
      types: [String],
      frequency: Number,
      difficultyRange: Object
    },
    rewards: {
      types: [String],
      scaling: Object
    }
  },
  events: {
    types: [String],
    frequency: Number,
    severity: Number,
    impact: Object
  },
  variants: [{
    name: String,
    description: String,
    modifiers: Object
  }]
}; 