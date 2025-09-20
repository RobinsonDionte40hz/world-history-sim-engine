// Base template interface that all templates extend
export const BaseTemplate = {
  id: String,
  name: String,
  description: String,
  version: String,
  tags: [String],
  metadata: Object
};

// Character template type
export const CharacterTemplate = {
  ...BaseTemplate,
  personalityTraits: [String],
  cognitiveTraits: [String],
  emotionalTendencies: [String],
  skills: [String],
  attributes: Object,
  background: String,
  race: {
    type: 'string',
    description: 'The character\'s race identifier',
    nullable: true
  },
  subrace: {
    type: 'string',
    description: 'The character\'s subrace identifier',
    nullable: true
  },
  // Consciousness configuration for character templates
  consciousness: {
    type: 'object',
    description: 'Consciousness parameters for character behavior and decision making',
    properties: {
      frequency: {
        type: 'number',
        description: 'Consciousness frequency (3.0-15.0 Hz, affects alertness and processing speed)',
        minimum: 3.0,
        maximum: 15.0,
        default: 7.0
      },
      coherence: {
        type: 'number',
        description: 'Consciousness coherence (0.2-1.0, affects stability and focus)',
        minimum: 0.2,
        maximum: 1.0,
        default: 0.5
      },
      behavioralState: {
        type: 'object',
        description: 'Pre-configured behavioral state parameters',
        properties: {
          energy: {
            type: 'number',
            description: 'Energy level (0.0-1.0, affects activity willingness)',
            minimum: 0.0,
            maximum: 1.0,
            default: 0.6
          },
          focus: {
            type: 'number',
            description: 'Focus level (0.0-1.0, affects attention and concentration)',
            minimum: 0.0,
            maximum: 1.0,
            default: 0.5
          },
          socialDrive: {
            type: 'number',
            description: 'Social drive (0.0-1.0, affects social interaction willingness)',
            minimum: 0.0,
            maximum: 1.0,
            default: 0.5
          },
          riskTolerance: {
            type: 'number',
            description: 'Risk tolerance (0.0-1.0, affects willingness to take risks)',
            minimum: 0.0,
            maximum: 1.0,
            default: 0.5
          },
          ambition: {
            type: 'number',
            description: 'Ambition level (0.0-1.0, affects goal pursuit intensity)',
            minimum: 0.0,
            maximum: 1.0,
            default: 0.5
          }
        },
        nullable: true
      },
      updateRules: {
        type: 'object',
        description: 'Custom consciousness update rules for this character type',
        properties: {
          significanceThreshold: {
            type: 'number',
            description: 'Minimum significance threshold for consciousness updates (0.0-1.0)',
            minimum: 0.0,
            maximum: 1.0,
            default: 0.3
          },
          adaptationRate: {
            type: 'number',
            description: 'Rate at which consciousness adapts to events (0.1-2.0)',
            minimum: 0.1,
            maximum: 2.0,
            default: 1.0
          },
          stabilityFactor: {
            type: 'number',
            description: 'Resistance to consciousness changes (0.1-2.0)',
            minimum: 0.1,
            maximum: 2.0,
            default: 1.0
          }
        },
        nullable: true
      }
    },
    nullable: true
  },
  // Environmental data for character templates
  assignedNode: {
    type: 'string',
    description: 'The ID of the node this character is assigned to',
    nullable: true
  },
  preferredEnvironment: {
    type: 'object',
    description: 'Environmental preferences for this character',
    properties: {
      terrain: {
        type: 'string',
        description: 'Preferred terrain type (forest, plains, mountains, etc.)'
      },
      climate: {
        type: 'string',
        description: 'Preferred climate (temperate, arctic, tropical, etc.)'
      },
      preferredLighting: {
        type: 'string',
        description: 'Preferred lighting conditions (bright, normal, dim, dark)',
        nullable: true
      },
      avoidHazards: {
        type: 'array',
        description: 'Environmental hazards this character prefers to avoid',
        items: { type: 'string' }
      }
    },
    nullable: true
  },
  environmentalAdaptations: {
    type: 'object',
    description: 'Character adaptation levels to different environments (0.0 to 1.0)',
    additionalProperties: {
      type: 'number',
      minimum: 0.0,
      maximum: 1.0
    },
    nullable: true
  }
};

// Node template type
export const NodeTemplate = {
  ...BaseTemplate,
  type: String,
  connections: [String],
  properties: Object,
  requirements: Object
};

// Interaction template type
export const InteractionTemplate = {
  ...BaseTemplate,
  prerequisites: {
    groups: Array,
    showWhenUnavailable: Boolean,
    unavailableMessage: String
  },
  effects: {
    influenceChanges: Array,
    prestigeChanges: Array,
    alignmentChanges: Array
  },
  options: Array
};

// Enhanced Event template type with historical simulation
export const EventTemplate = {
  ...BaseTemplate,
  // Basic event structure
  trigger: {
    type: String, // 'immediate', 'delayed', 'conditional', 'periodic'
    conditions: Object,
    probability: Number,
    cooldown: Number
  },
  conditions: [{
    type: String,
    requirements: Object,
    modifiers: Object
  }],
  actions: [{
    type: String,
    parameters: Object,
    effects: Object
  }],
  consequences: [{
    type: String,
    probability: Number,
    effects: Object
  }],
  // Historical simulation fields
  historicalSimulation: {
    // Time period compatibility
    timePeriods: [{
      name: String,
      startYear: Number,
      endYear: Number,
      modifiers: Object
    }],
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
    // Historical records
    records: {
      types: [String], // 'official', 'personal', 'cultural', 'archaeological'
      generation: {
        probability: Number,
        detailLevel: Number,
        accuracy: Number
      },
      preservation: {
        chance: Number,
        factors: Object
      }
    },
    // Historical impact
    impact: {
      immediate: {
        type: String,
        magnitude: Number,
        scope: Object
      },
      longTerm: {
        type: String,
        magnitude: Number,
        duration: Number,
        decayRate: Number
      },
      rippleEffects: [{
        type: String,
        probability: Number,
        delay: Number,
        magnitude: Number
      }]
    },
    // Historical participants
    participants: {
      types: [String], // 'individual', 'group', 'location', 'artifact'
      roles: [{
        type: String,
        requirements: Object,
        effects: Object
      }],
      relationships: [{
        type: String,
        formationRules: Object,
        duration: Number
      }]
    },
    // Historical context
    context: {
      prerequisites: [{
        type: String,
        conditions: Object
      }],
      concurrentEvents: [{
        type: String,
        relationship: String,
        influence: Number
      }],
      historicalPrecedents: [{
        type: String,
        influence: Number,
        modifiers: Object
      }]
    },
    // Historical memory
    memory: {
      types: [String], // 'personal', 'cultural', 'historical', 'mythological'
      retention: {
        baseRate: Number,
        modifiers: Object
      },
      transformation: {
        types: [String], // 'exaggeration', 'simplification', 'mythologization'
        probability: Number,
        factors: Object
      }
    }
  }
};

// Group template type
export const GroupTemplate = {
  ...BaseTemplate,
  members: [String],
  roles: Object,
  hierarchy: Object,
  rules: Array
};

// Item template type
export const ItemTemplate = {
  ...BaseTemplate,
  type: String,
  properties: Object,
  requirements: Object,
  effects: Object
};

// Encounter template type
export const EncounterTemplate = {
  ...BaseTemplate,
  type: String, // 'combat', 'social', 'exploration', 'puzzle', 'environmental'
  difficulty: String, // 'trivial', 'easy', 'medium', 'hard', 'deadly'
  challengeRating: Number,
  turnBased: {
    duration: Number,
    initiative: String, // 'random', 'attribute', 'fixed'
    timing: String, // 'immediate', 'delayed', 'conditional'
    sequencing: String // 'simultaneous', 'sequential'
  },
  triggers: Array,
  participants: Array,
  outcomes: Array,
  prerequisites: Array,
  rewards: Array,
  cooldown: Number,
  nodeRestrictions: Array,
  interactionIntegration: {
    baseInteractionId: String,
    generatedInteractions: Array,
    effectMapping: Object
  }
};

// Settlement template type for need satisfaction profiles
export const SettlementTemplate = {
  ...BaseTemplate,
  type: String, // 'village', 'town', 'city', 'kingdom', etc.
  size: String, // 'small', 'medium', 'large', 'metropolis'
  economicProfile: String, // 'agrarian', 'industrial', 'commercial', 'military', 'academic'

  // Need satisfaction baseline configuration
  needSatisfactionBaseline: {
    food: {
      baseLevel: Number, // 0.0 to 1.0
      modifiers: Object, // Environmental and situational modifiers
      requirements: Object // Resource and infrastructure requirements
    },
    water: {
      baseLevel: Number,
      modifiers: Object,
      requirements: Object
    },
    shelter: {
      baseLevel: Number,
      modifiers: Object,
      requirements: Object
    },
    goods: {
      baseLevel: Number,
      modifiers: Object,
      requirements: Object
    },
    services: {
      baseLevel: Number,
      modifiers: Object,
      requirements: Object
    }
  },

  // Population configuration
  populationConfig: {
    basePopulation: Number,
    growthRate: Number,
    composition: Object,
    migrationFactors: Object
  },

  // Resource configuration
  resourceConfig: {
    initialResources: Object,
    productionRates: Object,
    consumptionRates: Object,
    storageCapacity: Object
  },

  // Building configuration
  buildingConfig: {
    requiredBuildings: [{
      type: String,
      level: Number,
      quantity: Number
    }],
    optionalBuildings: [{
      type: String,
      level: Number,
      probability: Number
    }]
  },

  // Economic configuration
  economicConfig: {
    tradePartners: [String],
    marketConfig: Object,
    taxStructure: Object
  },

  // Environmental modifiers
  environmentalModifiers: {
    terrain: Object,
    climate: Object,
    resources: Object
  },

  // Template validation rules
  validationRules: {
    minPopulation: Number,
    maxPopulation: Number,
    requiredResources: [String],
    economicConstraints: Object
  }
};

// Goal template type for character aspirations and objectives
export const GoalTemplate = {
  ...BaseTemplate,
  type: String, // 'social', 'family', 'career', 'personal', 'exploration', etc.
  category: String, // 'aspiration', 'survival', 'achievement', 'relationship'
  priority: String, // 'low', 'medium', 'high', 'critical'

  // Requirements for goal activation
  requirements: {
    age: {
      min: Number,
      max: Number
    },
    attributes: Object, // Attribute requirements (charisma: 10, etc.)
    personality: Object, // Personality trait requirements (empathy: 0.3, etc.)
    relationship_status: String, // 'single', 'dating', 'married', 'divorced', etc.
    resources: Object, // Resource requirements (housing: 1, income: 100, etc.)
    skills: [String], // Required skills
    prerequisites: [String] // IDs of prerequisite goals
  },

  // Goal progression steps
  steps: [{
    id: String,
    name: String,
    description: String,
    order: Number,
    requirements: Object, // Step-specific requirements
    actions: [String], // Required actions to complete step
    duration: Number, // Estimated time in days
    success_probability: Number // 0.0 to 1.0
  }],

  // Success conditions
  success_conditions: {
    primary: String, // Main completion condition
    secondary: [String], // Additional conditions
    time_limit: Number, // Time limit in days (optional)
    failure_conditions: [String] // Conditions that cause failure
  },

  // Rewards and consequences
  rewards: {
    experience: Number, // XP gained
    attributes: Object, // Attribute bonuses
    skills: [String], // Skills learned
    relationships: Object, // Relationship changes
    resources: Object, // Resource rewards
    reputation: Number // Reputation change
  },

  consequences: {
    success: {
      immediate: Object, // Immediate effects
      long_term: Object // Long-term effects
    },
    failure: {
      immediate: Object,
      long_term: Object
    }
  },

  // Goal metadata
  metadata: {
    ...BaseTemplate.metadata,
    difficulty: String, // 'easy', 'medium', 'hard', 'legendary'
    estimated_duration: Number, // Estimated total duration in days
    social_impact: Number, // Impact on social relationships (-1 to 1)
    economic_impact: Number, // Economic impact (-1 to 1)
    historical_significance: Number // Historical importance (0 to 1)
  }
}; 