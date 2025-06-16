// Branching Interaction Manager Database Schema
// TypeScript interfaces for type safety and documentation

// ==================== CORE ENTITIES ====================

export interface Character {
  id: string;
  typeId: string;
  name: string;
  title?: string;
  description: string;
  locationId?: string;
  attributes: Record<string, any>;
  tags: string[];
  consciousness: {
    personality: PersonalityProfile;
    emotionalState: EmotionalState;
    memories: Memory[];
    beliefs: Belief[];
    goals: Goal[];
    knowledge: KnowledgeBase;
    mentalModel: MentalModel;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
}

export interface CharacterType {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  defaultAttributes?: Record<string, any>;
  behaviorPatterns?: string[];
  category: string;
  defaultPersonality?: Partial<PersonalityProfile>;
  emotionalTendencies?: EmotionalTendency[];
  cognitiveTraits?: CognitiveTrait[];
}

export interface Node {
  id: string;
  name: string;
  description: string;
  type: 'location' | 'event' | 'state' | 'checkpoint';
  coordinates?: { x: number; y: number; z?: number };
  parentNodeId?: string;
  childNodeIds: string[];
  connectedNodeIds: string[];
  attributes: {
    visibility?: 'visible' | 'hidden' | 'conditional';
    accessibility?: 'open' | 'locked' | 'conditional';
    ambiance?: string;
    [key: string]: any;
  };
  associatedInteractionIds: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    lastVisited?: string;
  };
}

export interface Interaction {
  id: string;
  title: string;
  description: string;
  content: string;
  characterId?: string;
  characterTypeId?: string;
  nodeId?: string;
  categoryId: string;
  options: InteractionOption[];
  prerequisites: PrerequisiteGroup;
  effects: InteractionEffects;
  attributes: {
    priority?: number;
    repeatable?: boolean;
    cooldown?: number;
    mood?: string;
    [key: string]: any;
  };
  consciousnessFactors?: {
    emotionalImpact?: EmotionalImpact[];
    memoryFormation?: MemoryFormationRule;
    beliefInfluence?: BeliefInfluence[];
    personalityShift?: PersonalityShift[];
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    timesTriggered: number;
    lastTriggered?: string;
  };
}

export interface InteractionOption {
  id: string;
  text: string;
  description?: string;
  nextInteractionId?: string;
  nextNodeId?: string;
  requirements?: PrerequisiteGroup;
  effects?: InteractionEffects;
  attributes?: Record<string, any>;
}

// ==================== CATEGORIZATION & ORGANIZATION ====================

export interface Category {
  id: string;
  name: string;
  description: string;
  type: 'interaction' | 'character' | 'node' | 'mixed';
  parentCategoryId?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  metadata: {
    itemCount: number;
    lastUpdated: string;
  };
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  category?: string;
  description?: string;
  usageCount: number;
}

// ==================== PROGRESSION SYSTEMS ====================

export interface InfluenceDomain {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  category: 'faction' | 'location' | 'concept' | 'other';
  parentDomainId?: string;
  conflictingDomainIds: string[];
  attributes: {
    decayRate?: number;
    maxValue?: number;
    minValue?: number;
    visibility?: 'always' | 'discovered' | 'hidden';
  };
}

export interface PrestigeTrack {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  decayRate: number;
  counterTracks: string[];
  levels: PrestigeLevel[];
  attributes: {
    visibility?: 'always' | 'discovered' | 'milestone';
    category?: string;
    maxValue?: number;
  };
}

export interface PrestigeLevel {
  id: string;
  name: string;
  threshold: number;
  description: string;
  rewards?: {
    unlockedInteractionIds?: string[];
    unlockedNodeIds?: string[];
    attributeModifiers?: Record<string, any>;
  };
}

export interface AlignmentAxis {
  id: string;
  name: string;
  description: string;
  leftLabel: string;
  rightLabel: string;
  zones: AlignmentZone[];
  defaultValue: number;
  color: string;
}

export interface AlignmentZone {
  id: string;
  name: string;
  minValue: number;
  maxValue: number;
  description: string;
  color: string;
}

// ==================== PREREQUISITES & EFFECTS ====================

export interface PrerequisiteGroup {
  groups: {
    id: string;
    logic: 'AND' | 'OR';
    prerequisites: Prerequisite[];
  }[];
  showWhenUnavailable: boolean;
  unavailableMessage?: string;
}

export interface Prerequisite {
  id: string;
  type: 'level' | 'influence' | 'prestige' | 'alignment' | 'item' | 'flag' | 'node_visited' | 'interaction_completed' | 'custom' | 'consciousness';
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'in_zone' | 'has' | 'not_has';
  value: string | number | boolean | string[];
  targetId?: string;
  description: string;
  attributes?: Record<string, any>;
  consciousnessCheck?: {
    characterId: string;
    checkType: 'emotion' | 'belief' | 'memory' | 'personality' | 'relationship' | 'knowledge';
    condition: any;
  };
}

export interface InteractionEffects {
  influenceChanges?: InfluenceChange[];
  prestigeChanges?: PrestigeChange[];
  alignmentChanges?: AlignmentChange[];
  itemChanges?: ItemChange[];
  flagChanges?: FlagChange[];
  nodeUnlocks?: string[];
  characterStateChanges?: CharacterStateChange[];
  customEffects?: CustomEffect[];
  consciousnessChanges?: ConsciousnessChange[];
}

export interface InfluenceChange {
  id: string;
  domainId: string;
  change: number;
  description: string;
  conditions?: PrerequisiteGroup;
}

export interface PrestigeChange {
  id: string;
  trackId: string;
  change: number;
  description: string;
  conditions?: PrerequisiteGroup;
}

export interface AlignmentChange {
  id: string;
  axisId: string;
  change: number;
  description: string;
  conditions?: PrerequisiteGroup;
}

export interface ItemChange {
  id: string;
  itemId: string;
  quantity: number;
  description: string;
}

export interface FlagChange {
  id: string;
  flagName: string;
  value: boolean | string | number;
  operation: 'set' | 'toggle' | 'increment' | 'decrement';
  description: string;
}

export interface CharacterStateChange {
  id: string;
  characterId: string;
  stateChanges: Record<string, any>;
  description: string;
}

export interface ConsciousnessChange {
  id: string;
  characterId: string;
  changeType: 'emotion' | 'memory' | 'belief' | 'goal' | 'personality' | 'knowledge' | 'relationship';
  change: any;
  description: string;
  permanent: boolean;
}

export interface CustomEffect {
  id: string;
  type: string;
  data: Record<string, any>;
  description: string;
}

// ... (continue with the rest of your schema as needed) ...
