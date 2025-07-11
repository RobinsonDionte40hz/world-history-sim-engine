// src/shared/constants/SimulationConstants.js

export const SIMULATION_CONSTANTS = {
  DEFAULT_TICK_DELAY: 1000,  // ms, base tick interval
  MAX_WORLD_SIZE: { width: 100, height: 100 },  // For generation
  RESOURCE_TYPES: ['food', 'wood', 'gold'],  // From Paper2's resource distribution
  INITIAL_POPULATION: 10,  // NPCs at start
  EVENT_SIGNIFICANCE_THRESHOLD: 0.5,  // For filtering in HistoryGenerator
};