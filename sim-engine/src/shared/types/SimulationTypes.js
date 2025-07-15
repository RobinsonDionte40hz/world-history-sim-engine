// src/shared/types/SimulationTypes.ts

export interface Character {
  id: string;
  name: string;
  location: string;
  // Add other properties as needed
}

export interface WorldState {
  time: number;
  nodes: Node[];
  npcs: Character[];
  resources: Record<string, number>;
}

export enum InteractionType {
  BATTLE = 'battle',
  TRADE = 'trade',
  DIPLOMACY = 'diplomacy',
  MIGRATION = 'migration',
  EXPLORATION = 'exploration',
  CULTURAL = 'cultural',
  OTHER = 'other'
}

export interface HistoricalEvent {
  id: string;
  timestamp: number;
  characterId: string;
  characterName: string;
  interactionId: string;
  interactionName: string;
  type: InteractionType;
  outcome: 'positive' | 'negative' | 'neutral';
  roll?: number;
  dc?: number;
  location: string;
  significance: number;
  description: string;
}

export type HistoryCriteria = {
  timeRange?: { start: number; end: number };
  characterId?: string;
  interactionType?: InteractionType;
  minSignificance?: number;
  limit?: number;
};