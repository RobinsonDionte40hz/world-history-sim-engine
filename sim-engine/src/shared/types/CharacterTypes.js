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
 * @property {string} id - Unique goal identifier
 * @property {string} templateId - ID of the goal template this goal is based on
 * @property {string} name - Human-readable goal name
 * @property {string} description - Goal description
 * @property {string} type - Goal type ('social', 'family', 'career', 'personal', 'exploration', etc.)
 * @property {string} category - Goal category ('aspiration', 'survival', 'achievement', 'relationship')
 * @property {string} priority - Goal priority ('low', 'medium', 'high', 'critical')
 * @property {number} progress - Progress percentage (0-100)
 * @property {number} currentStep - Current step index in the goal progression
 * @property {Array<string>} completedSteps - IDs of completed steps
 * @property {string} startedAt - ISO timestamp when goal was started
 * @property {string} lastUpdated - ISO timestamp of last update
 * @property {Array<Object>} steps - Goal progression steps
 * @property {string} status - Goal status ('active', 'completed', 'failed', 'paused')
 * @property {Object} success_conditions - Conditions for goal completion
 * @property {Object} rewards - Rewards for goal completion
 * @property {Object} consequences - Consequences for success/failure
 * @property {string} characterId - ID of character pursuing this goal
 * @property {Object} customizations - Goal-specific customizations
 * @property {Object} metadata - Additional goal metadata
 */

// Export empty object to make this a proper module
export {};