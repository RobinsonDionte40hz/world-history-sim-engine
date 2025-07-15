// src/domain/value-objects/index.ts

// Export base value object foundation
export * from './BaseValueObject';

// Export new value objects
export { Alignment } from './Alignment';

// Re-export existing value objects for compatibility
export { default as PersonalitySystem } from './PersonalitySystem';
export { default as RaceSystem } from './RaceSystem';
export { default as ConsciousnessSystem } from './ConsciousnessSystem';
export { default as Attributes } from './Attributes';
export { default as Positions } from './Positions';