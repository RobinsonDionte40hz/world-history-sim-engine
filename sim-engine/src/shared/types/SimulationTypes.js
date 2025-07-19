// src/shared/types/SimulationTypes.js

/**
 * @typedef {Object} Character
 * @property {string} id
 * @property {string} name
 * @property {string} location
 * // Add other properties as needed
 */

/**
 * @typedef {Object} WorldState
 * @property {number} time
 * @property {Node[]} nodes
 * @property {Character[]} npcs
 * @property {Record<string, number>} resources
 */

/**
 * Interaction type constants
 */
export const InteractionType = {
  BATTLE: 'battle',
  TRADE: 'trade',
  DIPLOMACY: 'diplomacy',
  MIGRATION: 'migration',
  EXPLORATION: 'exploration',
  CULTURAL: 'cultural',
  OTHER: 'other'
};

/**
 * @typedef {Object} HistoricalEvent
 * @property {string} id
 * @property {number} timestamp
 * @property {string} characterId
 * @property {string} characterName
 * @property {string} interactionId
 * @property {string} interactionName
 * @property {string} type - One of InteractionType values
 * @property {'positive' | 'negative' | 'neutral'} outcome
 * @property {number} [roll] - Optional roll value
 * @property {number} [dc] - Optional DC value
 * @property {string} location
 * @property {number} significance
 * @property {string} description
 */

/**
 * @typedef {Object} HistoryCriteria
 * @property {Object} [timeRange] - Optional time range
 * @property {number} [timeRange.start] - Start time
 * @property {number} [timeRange.end] - End time
 * @property {string} [characterId] - Optional character ID filter
 * @property {string} [interactionType] - Optional interaction type filter
 * @property {number} [minSignificance] - Optional minimum significance filter
 * @property {number} [limit] - Optional result limit
 */