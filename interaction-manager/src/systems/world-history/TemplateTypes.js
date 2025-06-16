import { DDAttributes } from '../../types/DDAttributes';
import { PersonalityTraits } from '../../PersonalitySystem';
import { ConsciousnessStateType } from '../../ConsciousnessSystem';
import { QuestNode } from '../../QuestSystem';
import { InfluenceRecord } from '../../InfluenceSystem';
import { PrestigeRecord } from '../../PrestigeSystem';
import { AlignmentRecord } from '../../AlignmentSystem';

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
  background: String
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
    groups: [String],
    showWhenUnavailable: Boolean,
    unavailableMessage: String
  },
  effects: {
    influenceChanges: [Object],
    prestigeChanges: [Object],
    alignmentChanges: [Object]
  },
  options: [Object]
};

// Event template type
export const EventTemplate = {
  ...BaseTemplate,
  trigger: {
    type: String,
    conditions: [Object]
  },
  conditions: [Object],
  actions: [Object],
  consequences: [Object]
};

// Group template type
export const GroupTemplate = {
  ...BaseTemplate,
  members: [String],
  roles: Object,
  hierarchy: Object,
  rules: [Object]
};

// Item template type
export const ItemTemplate = {
  ...BaseTemplate,
  type: String,
  properties: Object,
  requirements: Object,
  effects: Object
}; 