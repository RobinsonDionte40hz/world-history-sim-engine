// src/domain/services/index.ts

// Export base domain service foundation
export * from './BaseDomainService';

// Export new services
export { default as AlignmentService } from './AlignmentService';
export { default as WorldBuilder } from './WorldBuilder';
export { default as WorldValidator } from './WorldValidator';

// Re-export existing services for compatibility
export { default as EvolutionService } from './EvolutionService';
export { default as HistoryGenerator } from './HistoryGenerator';
export { default as InteractionResolver } from './InteractionResolver';
export { default as MemoryService } from './MemoryService';
export { default as PrerequisiteValidator } from './PrerequisiteValidator';