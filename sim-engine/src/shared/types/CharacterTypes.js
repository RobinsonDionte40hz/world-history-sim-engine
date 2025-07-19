// src/shared/types/CharacterTypes.js

/**
 * @typedef {Object} TemporaryModifier
 * @property {number} value
 * @property {number} duration - Ticks remaining
 */

/**
 * @typedef {Object} AttributeValue
 * @property {number} score
 * @property {number} modifier
 * @property {number} racialBonus
 * @property {TemporaryModifier[]} temporaryModifiers
 */

/**
 * @typedef {Object} CharacterAttributes
 * @property {AttributeValue} strength
 * @property {AttributeValue} dexterity
 * @property {AttributeValue} constitution
 * @property {AttributeValue} intelligence
 * @property {AttributeValue} wisdom
 * @property {AttributeValue} charisma
 */

/**
 * @typedef {Object} PersonalityTraits
 * @property {number} aggression
 * @property {number} curiosity
 * // Add more traits as needed
 */

/**
 * @typedef {Object} ConsciousnessState
 * @property {number} frequency - Hz
 * @property {number} coherence - 0-1
 */

/**
 * @typedef {Object} Goal
 * @property {string} id
 * @property {number} progress
 */

// Export empty object to make this a proper module
export {};