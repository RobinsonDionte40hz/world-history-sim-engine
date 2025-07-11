// src/shared/types/InteractionTypes.ts

import { CharacterAttributes } from './CharacterTypes';

export type InteractionType = 'dialogue' | 'action' | 'event' | 'trade';

export interface InteractionRequirement {
  attr: keyof CharacterAttributes;
  min: number;
  type?: 'attribute' | 'proximity';
}

export interface InteractionBranch {
  id: string;
  text: string;
  condition?: (character: any) => boolean;  // Using any for now to avoid circular import
  effects: InteractionEffect[];
  requiredEnergy?: number;  // For resonance calc
}

export interface InteractionEffect {
  type: 'influence' | 'relationship' | 'attribute' | 'resource';
  target: string;
  value: number;
}