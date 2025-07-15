// src/domain/value-objects/index.ts

// Export base value object foundation
export * from './BaseValueObject';

// Export new value objects
export { Alignment } from './Alignment';
export { Influence } from './Influence';
export { Prestige } from './Prestige';
export { PersonalityProfile } from './PersonalityProfile';
export { RacialTraits } from './RacialTraits';

// Export existing value objects
export { default as ConsciousnessSystem } from './ConsciousnessSystem';
export { default as Attributes } from './Attributes';
export { default as Positions } from './Positions';