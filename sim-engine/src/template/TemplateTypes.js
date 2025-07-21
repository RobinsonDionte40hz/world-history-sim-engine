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