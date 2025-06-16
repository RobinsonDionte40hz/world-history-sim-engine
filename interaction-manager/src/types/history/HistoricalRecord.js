import { DDAttributes } from '../DDAttributes';

export const HistoricalRecord = {
  id: String,
  timestamp: Number,
  eventType: String,
  participants: [{
    id: String,
    type: String,
    role: String
  }],
  location: {
    id: String,
    type: String,
    coordinates: {
      x: Number,
      y: Number
    }
  },
  description: String,
  effects: [{
    type: String,
    target: String,
    magnitude: Number,
    duration: Number
  }],
  attributeChanges: [{
    entity: String,
    attributes: DDAttributes,
    reason: String
  }],
  questCompletions: [{
    questId: String,
    participants: [String],
    outcomes: Object,
    rewards: Object
  }],
  consciousnessChanges: [{
    entity: String,
    previousState: String,
    newState: String,
    triggers: [String]
  }],
  influenceChanges: [{
    entity: String,
    domain: String,
    change: Number,
    reason: String
  }],
  prestigeChanges: [{
    entity: String,
    change: Number,
    reason: String,
    visibility: Number
  }],
  alignmentChanges: [{
    entity: String,
    axis: String,
    change: Number,
    reason: String
  }],
  resourceChanges: [{
    entity: String,
    resource: String,
    change: Number,
    reason: String
  }],
  relationshipChanges: [{
    entities: [String],
    type: String,
    change: Number,
    reason: String
  }],
  metadata: {
    importance: Number,
    visibility: Number,
    tags: [String],
    relatedEvents: [String]
  }
}; 