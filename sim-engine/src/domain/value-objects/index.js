// src/domain/value-objects/index.js

// Export base value object foundation
export { BaseValueObject } from './BaseValueObject';

// Export new value objects
export { Alignment } from './Alignment';
export { CharacterType } from './CharacterType';
export { DevelopmentTree } from './DevelopmentTree';
export { LODTier } from './LODTier';
export { SettlementGovernance } from './SettlementGovernance';
export { default as EconomicProfile } from './EconomicProfile';
export { default as Environment } from './Environment';
export { default as NodeConnection } from './NodeConnection';

// Re-export existing value objects for compatibility
export { default as PersonalitySystem } from './PersonalitySystem';
export { default as RaceSystem } from './RaceSystem';
export { default as ConsciousnessSystem } from './ConsciousnessSystem';
export { default as Attributes } from './Attributes';
export { default as Positions } from './Positions';