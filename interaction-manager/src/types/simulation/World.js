export const World = {
  id: String,
  name: String,
  description: String,
  currentTime: Number,
  timeScale: Number,
  size: {
    width: Number,
    height: Number,
    units: String
  },
  nodes: [{
    id: String,
    type: String,
    position: {
      x: Number,
      y: Number
    },
    properties: Object
  }],
  connections: [{
    id: String,
    type: String,
    source: String,
    target: String,
    properties: Object
  }],
  settlements: [{
    id: String,
    type: String,
    position: {
      x: Number,
      y: Number
    },
    properties: Object
  }],
  characters: [{
    id: String,
    type: String,
    position: {
      x: Number,
      y: Number
    },
    properties: Object
  }],
  resources: {
    types: [String],
    distribution: Object,
    regeneration: Object,
    consumption: Object
  },
  environment: {
    regions: [{
      id: String,
      type: String,
      boundaries: Object,
      properties: Object
    }],
    climate: {
      zones: [{
        id: String,
        type: String,
        boundaries: Object,
        properties: Object
      }],
      seasonalChanges: Object
    },
    features: [{
      id: String,
      type: String,
      position: {
        x: Number,
        y: Number
      },
      properties: Object
    }]
  },
  history: [{
    id: String,
    timestamp: Number,
    type: String,
    description: String,
    participants: [String],
    location: String,
    effects: Object
  }],
  events: [{
    id: String,
    type: String,
    probability: Number,
    conditions: Object,
    effects: Object,
    cooldown: Number
  }],
  quests: [{
    id: String,
    type: String,
    difficulty: Number,
    requirements: Object,
    rewards: Object,
    timeLimit: Number,
    status: String
  }],
  influence: {
    domains: [String],
    distribution: Object,
    spread: Object,
    resistance: Object
  },
  prestige: {
    sources: [String],
    distribution: Object,
    visibility: Object,
    decay: Object
  },
  alignment: {
    axes: [String],
    distribution: Object,
    stability: Object,
    drift: Object
  },
  culture: {
    traits: [String],
    distribution: Object,
    evolution: Object,
    influences: Object
  },
  relationships: [{
    id: String,
    type: String,
    participants: [String],
    value: Number,
    history: [{
      timestamp: Number,
      change: Number,
      reason: String
    }]
  }],
  metadata: {
    creationDate: Number,
    lastUpdate: Number,
    version: String,
    tags: [String],
    settings: {
      simulationSpeed: Number,
      eventFrequency: Number,
      questGeneration: Object,
      populationGrowth: Object,
      resourceRegeneration: Object
    }
  }
}; 