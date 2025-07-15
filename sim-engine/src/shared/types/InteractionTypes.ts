// src/shared/types/InteractionTypes.ts

export type InteractionType = 'dialogue' | 'action' | 'event' | 'trade';

export interface InteractionRequirement {
  attr: keyof CharacterAttributes;
  min: number;
  type?: 'attribute' | 'proximity';
}

export interface InteractionBranch {
  id: string;
  text: string;
  condition?: (character: Character) => boolean;
  effects: InteractionEffect[];
  requiredEnergy?: number;  // For resonance calc
}

export interface InteractionEffect {
  type: 'influence' | 'relationship' | 'attribute' | 'resource';
  target: string;
  value: number;
}