// src/shared/types/SystemTypes.ts

import { SerializedMap, SerializedSet } from './ValueObjectTypes';

/**
 * Common interfaces for historical context and temporal evolution
 */
export interface HistoricalContext {
  era: string;
  year: number;
  season: string;
  culturalValues: Map<string, number>;
  politicalClimate: string;
  economicConditions: string;
}

export interface SerializedHistoricalContext {
  era: string;
  year: number;
  season: string;
  culturalValues: SerializedMap<string, number>;
  politicalClimate: string;
  economicConditions: string;
}

/**
 * Alignment System Types
 */
export interface AlignmentAxis {
  id: string;
  name: string;
  description: string;
  min: number;
  max: number;
  defaultValue: number;
  zones: AlignmentZone[];
}

export interface AlignmentZone {
  name: string;
  min: number;
  max: number;
  description: string;
  effects: ZoneEffect[];
}

export interface ZoneEffect {
  type: string;
  value: number;
  description: string;
}

export interface AlignmentChange {
  timestamp: Date;
  axisId: string;
  change: number;
  newValue: number;
  reason: string;
  historicalContext?: HistoricalContext;
}

export interface SerializedAlignmentChange {
  timestamp: string;
  axisId: string;
  change: number;
  newValue: number;
  reason: string;
  historicalContext?: SerializedHistoricalContext;
}

export interface SerializedAlignment {
  axes: SerializedMap<string, AlignmentAxis>;
  values: SerializedMap<string, number>;
  history: SerializedAlignmentChange[];
}

/**
 * Influence System Types
 */
export interface InfluenceDomain {
  id: string;
  name: string;
  description: string;
  settlementTypes: string[];
  tiers: InfluenceTier[];
}

export interface InfluenceTier {
  name: string;
  minValue: number;
  maxValue: number;
  benefits: string[];
  responsibilities: string[];
}

export interface InfluenceChange {
  timestamp: Date;
  domainId: string;
  change: number;
  newValue: number;
  reason: string;
  settlementId?: string;
}

export interface SerializedInfluenceChange {
  timestamp: string;
  domainId: string;
  change: number;
  newValue: number;
  reason: string;
  settlementId?: string;
}

export interface SerializedInfluence {
  domains: SerializedMap<string, InfluenceDomain>;
  values: SerializedMap<string, number>;
  history: SerializedInfluenceChange[];
}

/**
 * Prestige System Types
 */
export interface PrestigeTrack {
  id: string;
  name: string;
  description: string;
  category: string;
  decayRate: number;
  levels: PrestigeLevel[];
}

export interface PrestigeLevel {
  name: string;
  minValue: number;
  maxValue: number;
  socialBenefits: string[];
  politicalPower: number;
}

export interface PrestigeChange {
  timestamp: Date;
  trackId: string;
  change: number;
  newValue: number;
  reason: string;
  witnessCount?: number;
}

export interface SerializedPrestigeChange {
  timestamp: string;
  trackId: string;
  change: number;
  newValue: number;
  reason: string;
  witnessCount?: number;
}

export interface SerializedPrestige {
  tracks: SerializedMap<string, PrestigeTrack>;
  values: SerializedMap<string, number>;
  history: SerializedPrestigeChange[];
}

/**
 * Personality System Types
 */
export interface PersonalityTrait {
  id: string;
  name: string;
  description: string;
  category: string;
  intensity: number;
  baseLevel: number;
  volatility: number;
}

export interface Attribute {
  id: string;
  name: string;
  description: string;
  baseValue: number;
  modifier: number;
}

export interface EmotionalTendency {
  id: string;
  name: string;
  description: string;
  category: string;
  intensity: number;
  baseLevel: number;
  volatility: number;
}

export interface CognitiveTrait {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: number;
  adaptability: number;
}

export interface PersonalityConfig {
  traits: PersonalityTrait[];
  attributes: Attribute[];
  emotionalTendencies: EmotionalTendency[];
  cognitiveTraits: CognitiveTrait[];
}

export interface SerializedPersonality {
  traits: SerializedMap<string, PersonalityTrait>;
  attributes: SerializedMap<string, Attribute>;
  emotionalTendencies: SerializedMap<string, EmotionalTendency>;
  cognitiveTraits: SerializedMap<string, CognitiveTrait>;
}

export interface PersonalityEvolution {
  traitChanges: Map<string, number>;
  newTraits: PersonalityTrait[];
  ageModifiers: Map<string, number>;
  experienceInfluences: ExperienceInfluence[];
}

export interface ExperienceInfluence {
  experienceType: string;
  traitId: string;
  influence: number;
  timestamp: Date;
}

/**
 * Racial System Types
 */
export interface Race {
  id: string;
  name: string;
  description: string;
  subraces: Subrace[];
  traits: RacialTrait[];
  lifespan: LifespanInfo;
}

export interface Subrace {
  name: string;
  description: string;
  attributeModifiers: Map<string, number>;
  skillModifiers: Map<string, number>;
  features: string[];
}

export interface SerializedSubrace {
  name: string;
  description: string;
  attributeModifiers: SerializedMap<string, number>;
  skillModifiers: SerializedMap<string, number>;
  features: string[];
}

export interface RacialTrait {
  name: string;
  description: string;
  effects: Map<string, number>;
}

export interface SerializedRacialTrait {
  name: string;
  description: string;
  effects: SerializedMap<string, number>;
}

export interface RacialModifiers {
  attributes: Map<string, number>;
  skills: Map<string, number>;
  features: string[];
  effects: Map<string, number>;
}

export interface SerializedRacialModifiers {
  attributes: SerializedMap<string, number>;
  skills: SerializedMap<string, number>;
  features: string[];
  effects: SerializedMap<string, number>;
}

export interface RacialFeature {
  name: string;
  description: string;
  type: 'passive' | 'active' | 'conditional';
  effects?: Map<string, number>;
}

export interface SerializedRacialFeature {
  name: string;
  description: string;
  type: 'passive' | 'active' | 'conditional';
  effects?: SerializedMap<string, number>;
}

export interface LifespanInfo {
  average: number;
  maximum: number;
}

export interface SerializedRacialTraits {
  race: Race;
  subrace: SerializedSubrace | null;
  modifiers: SerializedRacialModifiers;
  features: SerializedRacialFeature[];
}

/**
 * Character Action and Event Types
 */
export interface CharacterAction {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  characterId: string;
  context: ActionContext;
}

export interface ActionContext {
  location: string;
  participants: string[];
  circumstances: Map<string, any>;
}

export interface MoralChoice {
  id: string;
  description: string;
  alignmentImpact: Map<string, number>;
  context: HistoricalContext;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  prestigeValue: number;
  requirements: string[];
}

export interface SocialContext {
  settlement: string;
  witnesses: number;
  culturalRelevance: number;
  politicalImportance: number;
}

export interface SocialStanding {
  overall: number;
  byTrack: Map<string, number>;
  reputation: string;
  politicalInfluence: number;
}

/**
 * Settlement and World Types
 */
export interface Settlement {
  id: string;
  name: string;
  type: string;
  population: number;
  culturalValues: Map<string, number>;
  politicalStructure: string;
  economicStatus: string;
}

export interface SettlementEvent {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  settlementId: string;
  impact: Map<string, number>;
}

export interface WorldState {
  currentTime: Date;
  settlements: Settlement[];
  activeEvents: SettlementEvent[];
  globalConditions: Map<string, number>;
}

/**
 * Validation and Prerequisite Types
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface Prerequisite {
  id: string;
  type: string;
  condition: string;
  value: any;
  description: string;
}

/**
 * Character Evolution Types
 */
export interface CharacterEvolution {
  characterId: string;
  timespan: number;
  alignmentChanges: AlignmentChange[];
  influenceChanges: InfluenceChange[];
  prestigeChanges: PrestigeChange[];
  personalityEvolution: PersonalityEvolution;
}