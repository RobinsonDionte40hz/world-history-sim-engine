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
  },
  // New historical simulation fields
  historicalSimulation: {
    // Time period compatibility
    timePeriods: [{
      name: String,
      startYear: Number,
      endYear: Number,
      features: [String],
      modifiers: Object
    }],
    // Historical events that can occur at this node
    possibleEvents: [{
      type: String,
      triggerConditions: Object,
      probability: Number,
      effects: Object,
      historicalSignificance: Number // 0-1 scale
    }],
    // Cultural development
    culturalEvolution: {
      stages: [{
        name: String,
        requirements: Object,
        features: [String],
        influenceRadius: Number
      }],
      interactionModifiers: Object
    },
    // Population demographics
    demographics: {
      baseComposition: Object, // Initial population makeup
      migrationFactors: Object,
      culturalInfluence: Number,
      assimilationRate: Number
    },
    // Historical significance
    significance: {
      baseValue: Number,
      modifiers: [{
        type: String,
        value: Number,
        conditions: Object
      }],
      decayRate: Number
    },
    // Archaeological potential
    archaeology: {
      layers: [{
        period: String,
        artifacts: [String],
        discoveryChance: Number
      }],
      preservationFactors: Object
    },
    // Historical records
    recordKeeping: {
      types: [String], // Types of records that can be generated
      preservationChance: Number,
      detailLevel: Number // 0-1 scale
    }
  }
}; 