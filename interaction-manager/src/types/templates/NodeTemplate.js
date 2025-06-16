export const NodeTemplate = {
  id: String,
  name: String,
  description: String,
  type: String, // 'settlement', 'wilderness', 'dungeon', etc.
  baseFeatures: [{
    type: String,
    description: String,
    effects: Object,
    requirements: Object
  }],
  resourcePotential: {
    types: [String],
    distribution: Object, // Weights for resource distribution
    abundance: Number, // 0-1 scale
    regeneration: Number // Rate of resource regeneration
  },
  environmentalConditions: [{
    type: String,
    severity: Number,
    effects: Object,
    seasonalVariation: Object
  }],
  settlementCapacity: {
    maxPopulation: Number,
    growthRate: Number,
    developmentStages: [{
      name: String,
      populationThreshold: Number,
      features: [String],
      requirements: Object
    }]
  },
  modifierSlots: [{
    type: String,
    maxCount: Number,
    allowedModifiers: [String]
  }],
  questPotential: {
    types: [String],
    frequency: Number,
    difficultyRange: {
      min: Number,
      max: Number
    },
    rewardScaling: Object
  },
  connections: {
    maxConnections: Number,
    connectionTypes: [String],
    distanceModifiers: Object
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
  }
}; 