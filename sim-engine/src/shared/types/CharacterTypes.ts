// src/shared/types/CharacterTypes.ts

export interface CharacterAttributes {
  strength: AttributeValue;
  dexterity: AttributeValue;
  constitution: AttributeValue;
  intelligence: AttributeValue;
  wisdom: AttributeValue;
  charisma: AttributeValue;
}

export interface AttributeValue {
  score: number;
  modifier: number;
  racialBonus: number;
  temporaryModifiers: TemporaryModifier[];
}

export interface TemporaryModifier {
  value: number;
  duration: number;  // Ticks remaining
}

export interface PersonalityTraits {
  aggression: number;
  curiosity: number;
  // Add more traits as needed
}

export interface ConsciousnessState {
  frequency: number;  // Hz
  coherence: number;  // 0-1
}

export type Goal = {
  id: string;
  progress: number;
};