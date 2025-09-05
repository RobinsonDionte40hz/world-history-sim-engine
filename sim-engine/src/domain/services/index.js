// src/domain/services/index.ts

// Export base domain service foundation
export * from './BaseDomainService';

// Export new services
export { default as AlignmentService } from './AlignmentService';
export { default as AssignmentManager, AssignmentManager as AssignmentManagerClass } from './AssignmentManager';
export { default as WorldBuilder } from './WorldBuilder';
export { default as WorldValidator } from './WorldValidator';
export { default as InteractionManager } from './InteractionManager';
export { default as InteractionExecutor } from './InteractionExecutor';

// Re-export existing services for compatibility
export { default as EvolutionService } from './EvolutionService';
export { default as HistoryGenerator } from './HistoryGenerator';
export { default as InteractionResolver } from './InteractionResolver';
export { default as MemoryService } from './MemoryService';
export { default as PrerequisiteValidator } from './PrerequisiteValidator';