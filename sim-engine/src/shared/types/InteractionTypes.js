// src/shared/types/InteractionTypes.js

/**
 * @typedef {'dialogue' | 'action' | 'event' | 'trade'} InteractionType
 */

/**
 * @typedef {Object} InteractionRequirement
 * @property {string} attr - Key of CharacterAttributes
 * @property {number} min
 * @property {'attribute' | 'proximity'} [type] - Optional type
 */

/**
 * @typedef {Object} InteractionBranch
 * @property {string} id
 * @property {string} text
 * @property {function} [condition] - Optional condition function that takes a Character
 * @property {InteractionEffect[]} effects
 * @property {number} [requiredEnergy] - Optional required energy for resonance calc
 */

/**
 * @typedef {Object} InteractionEffect
 * @property {'influence' | 'relationship' | 'attribute' | 'resource'} type
 * @property {string} target
 * @property {number} value
 */

// Export empty object to make this a proper module
export {};