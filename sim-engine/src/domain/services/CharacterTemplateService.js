/**
 * Character Template Service
 *
 * Manages character templates with consciousness configuration support.
 * Provides predefined templates for common NPC archetypes and custom template creation.
 * Integrates consciousness parameters, behavioral states, and update rules.
 */

import BaseDomainService from './BaseDomainService.js';
import ConsciousnessUpdateService from './ConsciousnessUpdateService.js';
import BehavioralStateService from './BehavioralStateService.js';
import ConsciousnessErrorHandlingService from './ConsciousnessErrorHandlingService.js';

class CharacterTemplateService extends BaseDomainService {
    constructor(consciousnessUpdateService = null, behavioralStateService = null, logger = null, errorHandler = null) {
        super();
        this.consciousnessUpdateService = consciousnessUpdateService || new ConsciousnessUpdateService();
        this.behavioralStateService = behavioralStateService || new BehavioralStateService();
        this.logger = logger;
        this.errorHandler = errorHandler || new ConsciousnessErrorHandlingService(logger);

        // Initialize predefined consciousness templates
        this.predefinedTemplates = this._initializePredefinedTemplates();
    }

    /**
     * Initialize predefined consciousness templates for common NPC archetypes
     * @returns {Object} Predefined templates
     */
    _initializePredefinedTemplates() {
        return {
            // Warrior archetype - high energy, moderate focus, high risk tolerance
            warrior: {
                name: 'Warrior',
                description: 'A battle-hardened fighter with high energy and risk tolerance',
                consciousness: {
                    frequency: 12.0, // High beta - alert and focused
                    coherence: 0.7,  // Good mental clarity
                    behavioralState: {
                        energy: 0.9,
                        focus: 0.8,
                        socialDrive: 0.4,
                        riskTolerance: 0.9
                    },
                    updateRules: {
                        conflict: { frequency: +0.8, coherence: -0.05 },
                        social_success: { frequency: +0.1, coherence: +0.02 },
                        goal_completion: { frequency: +0.2, coherence: +0.03 }
                    }
                }
            },

            // Scholar archetype - high focus, low energy, moderate social drive
            scholar: {
                name: 'Scholar',
                description: 'An intellectual with exceptional focus and analytical mind',
                consciousness: {
                    frequency: 10.0, // Alpha-beta mix - focused concentration
                    coherence: 0.9,  // High mental clarity
                    behavioralState: {
                        energy: 0.5,
                        focus: 0.95,
                        socialDrive: 0.6,
                        riskTolerance: 0.3
                    },
                    updateRules: {
                        discovery: { frequency: +0.3, coherence: +0.08 },
                        skill_improvement: { frequency: +0.2, coherence: +0.05 },
                        goal_failure: { frequency: -0.3, coherence: -0.06 }
                    }
                }
            },

            // Merchant archetype - moderate focus, high social drive, moderate risk tolerance
            merchant: {
                name: 'Merchant',
                description: 'A shrewd trader with strong social skills and business acumen',
                consciousness: {
                    frequency: 8.5, // Alpha range - relaxed but alert
                    coherence: 0.75, // Good mental stability
                    behavioralState: {
                        energy: 0.7,
                        focus: 0.7,
                        socialDrive: 0.9,
                        riskTolerance: 0.6
                    },
                    updateRules: {
                        economic_gain: { frequency: +0.3, coherence: +0.04 },
                        economic_loss: { frequency: -0.4, coherence: -0.08 },
                        social_success: { frequency: +0.2, coherence: +0.03 }
                    }
                }
            },

            // Mystic archetype - variable frequency, high coherence, low social drive
            mystic: {
                name: 'Mystic',
                description: 'A spiritual seeker with deep insight and contemplative nature',
                consciousness: {
                    frequency: 6.0, // Theta-alpha border - meditative state
                    coherence: 0.95, // Exceptional mental clarity
                    behavioralState: {
                        energy: 0.4,
                        focus: 0.85,
                        socialDrive: 0.2,
                        riskTolerance: 0.4
                    },
                    updateRules: {
                        discovery: { frequency: +0.4, coherence: +0.1 },
                        traumatic_encounter: { frequency: -0.6, coherence: -0.05 },
                        goal_progress: { frequency: +0.1, coherence: +0.04 }
                    }
                }
            },

            // Noble archetype - high social drive, moderate focus, low risk tolerance
            noble: {
                name: 'Noble',
                description: 'An aristocratic figure with refined social skills and conservative nature',
                consciousness: {
                    frequency: 9.0, // Alpha range - composed and social
                    coherence: 0.8,  // Good mental stability
                    behavioralState: {
                        energy: 0.6,
                        focus: 0.75,
                        socialDrive: 0.95,
                        riskTolerance: 0.2
                    },
                    updateRules: {
                        social_success: { frequency: +0.2, coherence: +0.03 },
                        betrayal: { frequency: -0.9, coherence: -0.15 },
                        relationship_change: { frequency: +0.5, coherence: +0.07 }
                    }
                }
            },

            // Rogue archetype - high risk tolerance, moderate focus, variable social drive
            rogue: {
                name: 'Rogue',
                description: 'A cunning opportunist with high adaptability and risk tolerance',
                consciousness: {
                    frequency: 11.0, // High beta - quick thinking
                    coherence: 0.6,  // Moderate mental stability
                    behavioralState: {
                        energy: 0.8,
                        focus: 0.65,
                        socialDrive: 0.5,
                        riskTolerance: 0.95
                    },
                    updateRules: {
                        economic_gain: { frequency: +0.4, coherence: +0.02 },
                        conflict: { frequency: +0.6, coherence: -0.08 },
                        betrayal: { frequency: -0.5, coherence: -0.12 }
                    }
                }
            },

            // Peasant archetype - moderate everything, resilient consciousness
            peasant: {
                name: 'Peasant',
                description: 'A hardworking commoner with practical wisdom and steady nature',
                consciousness: {
                    frequency: 7.5, // Alpha baseline - balanced awareness
                    coherence: 0.65, // Moderate mental stability
                    behavioralState: {
                        energy: 0.75,
                        focus: 0.6,
                        socialDrive: 0.7,
                        riskTolerance: 0.5
                    },
                    updateRules: {
                        economic_gain: { frequency: +0.2, coherence: +0.03 },
                        economic_loss: { frequency: -0.3, coherence: -0.05 },
                        goal_completion: { frequency: +0.15, coherence: +0.02 }
                    }
                }
            }
        };
    }

    /**
     * Get a predefined consciousness template by name
     * @param {string} templateName - Name of the predefined template
     * @returns {Object|null} Template object or null if not found
     */
    getPredefinedTemplate(templateName) {
        try {
            if (!templateName || typeof templateName !== 'string') {
                throw new Error('Template name must be a non-empty string');
            }

            const template = this.predefinedTemplates[templateName.toLowerCase()];
            if (!template) {
                if (this.logger) {
                    this.logger.warn(`Predefined template '${templateName}' not found`);
                }
                return null;
            }

            // Return a deep copy to prevent modification of original
            return JSON.parse(JSON.stringify(template));

        } catch (error) {
            if (this.logger) {
                this.logger.error(`Error getting predefined template '${templateName}': ${error.message}`);
            }
            return null;
        }
    }

    /**
     * Get all predefined template names
     * @returns {Array} Array of template names
     */
    getPredefinedTemplateNames() {
        return Object.keys(this.predefinedTemplates);
    }

    /**
     * Get all predefined templates
     * @returns {Object} All predefined templates
     */
    getAllPredefinedTemplates() {
        // Return deep copies to prevent modification
        return JSON.parse(JSON.stringify(this.predefinedTemplates));
    }

    /**
     * Create a custom consciousness template
     * @param {Object} templateConfig - Template configuration
     * @returns {Object} Created template
     */
    createCustomTemplate(templateConfig) {
        try {
            if (!templateConfig || typeof templateConfig !== 'object') {
                throw new Error('Template configuration must be an object');
            }

            // Validate required fields
            if (!templateConfig.name || typeof templateConfig.name !== 'string') {
                throw new Error('Template must have a name');
            }

            // Validate consciousness configuration
            const validation = this.validateConsciousnessTemplate(templateConfig.consciousness);
            if (!validation.isValid) {
                throw new Error(`Invalid consciousness configuration: ${validation.errors.join(', ')}`);
            }

            // Create template with defaults
            const template = {
                name: templateConfig.name,
                description: templateConfig.description || `Custom template: ${templateConfig.name}`,
                consciousness: {
                    frequency: templateConfig.consciousness.frequency,
                    coherence: templateConfig.consciousness.coherence,
                    behavioralState: templateConfig.consciousness.behavioralState || this._getDefaultBehavioralState(),
                    updateRules: templateConfig.consciousness.updateRules || {}
                },
                custom: true,
                createdAt: Date.now()
            };

            if (this.logger) {
                this.logger.info(`Created custom consciousness template: ${template.name}`);
            }

            return template;

        } catch (error) {
            if (this.logger) {
                this.logger.error(`Error creating custom template: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get default behavioral state
     * @returns {Object} Default behavioral state
     */
    _getDefaultBehavioralState() {
        return {
            energy: 0.5,
            focus: 0.5,
            socialDrive: 0.5,
            riskTolerance: 0.5
        };
    }

    /**
     * Validate consciousness template configuration
     * @param {Object} consciousness - Consciousness configuration to validate
     * @returns {Object} Validation result
     */
    validateConsciousnessTemplate(consciousness) {
        if (!consciousness || typeof consciousness !== 'object') {
            return {
                isValid: false,
                errors: ['Consciousness configuration is required']
            };
        }

        const errors = [];

        // Validate frequency bounds (3-15 Hz)
        if (typeof consciousness.frequency !== 'number' ||
            consciousness.frequency < 3.0 ||
            consciousness.frequency > 15.0) {
            errors.push('Frequency must be between 3.0 and 15.0 Hz');
        }

        // Validate coherence bounds (0.2-1.0)
        if (typeof consciousness.coherence !== 'number' ||
            consciousness.coherence < 0.2 ||
            consciousness.coherence > 1.0) {
            errors.push('Coherence must be between 0.2 and 1.0');
        }

        // Validate behavioral state if provided
        if (consciousness.behavioralState) {
            const behavioralValidation = this._validateBehavioralState(consciousness.behavioralState);
            if (!behavioralValidation.isValid) {
                errors.push(...behavioralValidation.errors);
            }
        }

        // Validate update rules if provided
        if (consciousness.updateRules) {
            const rulesValidation = this._validateUpdateRules(consciousness.updateRules);
            if (!rulesValidation.isValid) {
                errors.push(...rulesValidation.errors);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate behavioral state configuration
     * @param {Object} behavioralState - Behavioral state to validate
     * @returns {Object} Validation result
     */
    _validateBehavioralState(behavioralState) {
        if (!behavioralState || typeof behavioralState !== 'object') {
            return {
                isValid: false,
                errors: ['Behavioral state must be an object']
            };
        }

        const errors = [];
        const requiredFactors = ['energy', 'focus', 'socialDrive', 'riskTolerance'];

        for (const factor of requiredFactors) {
            if (typeof behavioralState[factor] !== 'number' ||
                behavioralState[factor] < 0 ||
                behavioralState[factor] > 1) {
                errors.push(`${factor} must be a number between 0 and 1`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate update rules configuration
     * @param {Object} updateRules - Update rules to validate
     * @returns {Object} Validation result
     */
    _validateUpdateRules(updateRules) {
        if (!updateRules || typeof updateRules !== 'object') {
            return {
                isValid: true, // Update rules are optional
                errors: []
            };
        }

        const errors = [];

        for (const [eventType, rule] of Object.entries(updateRules)) {
            if (!rule || typeof rule !== 'object') {
                errors.push(`Update rule for ${eventType} must be an object`);
                continue;
            }

            if (typeof rule.frequency !== 'number') {
                errors.push(`Frequency change for ${eventType} must be a number`);
            }

            if (typeof rule.coherence !== 'number') {
                errors.push(`Coherence change for ${eventType} must be a number`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Apply consciousness template to character data
     * @param {Object} characterData - Character data to apply template to
     * @param {Object} template - Consciousness template to apply
     * @param {Object} customizations - Custom consciousness values to override template
     * @returns {Object} Updated character data with consciousness
     */
    applyConsciousnessTemplate(characterData, template, customizations = {}) {
        try {
            if (!characterData || typeof characterData !== 'object') {
                throw new Error('Character data must be an object');
            }

            if (!template || !template.consciousness) {
                throw new Error('Valid consciousness template is required');
            }

            // Create deep copy of character data
            const updatedCharacter = JSON.parse(JSON.stringify(characterData));

            // Initialize consciousness if not present
            if (!updatedCharacter.consciousness) {
                updatedCharacter.consciousness = {};
            }

            // Apply consciousness parameters from template
            updatedCharacter.consciousness.frequency = template.consciousness.frequency;
            updatedCharacter.consciousness.coherence = template.consciousness.coherence;

            // Apply behavioral state from template
            if (template.consciousness.behavioralState) {
                updatedCharacter.consciousness.behavioralState = {
                    ...template.consciousness.behavioralState
                };
            }

            // Apply update rules from template
            if (template.consciousness.updateRules) {
                updatedCharacter.consciousness.updateRules = {
                    ...template.consciousness.updateRules
                };
            }

            // Apply customizations to override template values
            if (customizations.frequency !== undefined) {
                updatedCharacter.consciousness.frequency = customizations.frequency;
            }
            if (customizations.coherence !== undefined) {
                updatedCharacter.consciousness.coherence = customizations.coherence;
            }
            if (customizations.behavioralState) {
                updatedCharacter.consciousness.behavioralState = {
                    ...updatedCharacter.consciousness.behavioralState,
                    ...customizations.behavioralState
                };
            }
            if (customizations.updateRules) {
                updatedCharacter.consciousness.updateRules = {
                    ...updatedCharacter.consciousness.updateRules,
                    ...customizations.updateRules
                };
            }

            // Mark as template-based
            updatedCharacter.templateApplied = {
                name: template.name,
                appliedAt: Date.now()
            };

            if (this.logger) {
                this.logger.info(`Applied consciousness template '${template.name}' to character`);
            }

            return updatedCharacter;

        } catch (error) {
            if (this.logger) {
                this.logger.error(`Error applying consciousness template: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Create consciousness template from existing character
     * @param {Object} character - Character to create template from
     * @param {string} templateName - Name for the new template
     * @param {string} description - Description for the template
     * @returns {Object} Created template
     */
    createTemplateFromCharacter(character, templateName, description = '') {
        try {
            if (!character || typeof character !== 'object') {
                throw new Error('Valid character object is required');
            }

            if (!character.consciousness) {
                throw new Error('Character must have consciousness configuration');
            }

            if (!templateName || typeof templateName !== 'string') {
                throw new Error('Template name must be a non-empty string');
            }

            // Extract consciousness configuration
            const consciousnessConfig = {
                frequency: character.consciousness.frequency,
                coherence: character.consciousness.coherence,
                behavioralState: character.consciousness.behavioralState || this._getDefaultBehavioralState(),
                updateRules: character.consciousness.updateRules || {}
            };

            // Validate the extracted configuration
            const validation = this.validateConsciousnessTemplate(consciousnessConfig);
            if (!validation.isValid) {
                throw new Error(`Invalid consciousness configuration: ${validation.errors.join(', ')}`);
            }

            // Create template
            const template = {
                name: templateName,
                description: description || `Template based on character consciousness pattern`,
                consciousness: consciousnessConfig,
                derivedFrom: {
                    characterId: character.id || 'unknown',
                    createdAt: Date.now()
                }
            };

            if (this.logger) {
                this.logger.info(`Created template '${templateName}' from character consciousness`);
            }

            return template;

        } catch (error) {
            if (this.logger) {
                this.logger.error(`Error creating template from character: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get template recommendations based on character attributes
     * @param {Object} characterAttributes - Character attributes for recommendation
     * @returns {Array} Array of recommended template names with scores
     */
    getTemplateRecommendations(characterAttributes) {
        try {
            if (!characterAttributes || typeof characterAttributes !== 'object') {
                return [];
            }

            const recommendations = [];

            // Analyze character attributes and match to templates
            for (const [templateName, template] of Object.entries(this.predefinedTemplates)) {
                let score = 0;
                let matchReasons = [];

                // Match based on personality traits if available
                if (characterAttributes.personality) {
                    const personalityMatch = this._calculatePersonalityMatch(
                        characterAttributes.personality,
                        templateName
                    );
                    score += personalityMatch.score;
                    matchReasons.push(...personalityMatch.reasons);
                }

                // Match based on profession/role if available
                if (characterAttributes.profession) {
                    const professionMatch = this._calculateProfessionMatch(
                        characterAttributes.profession,
                        templateName
                    );
                    score += professionMatch.score;
                    matchReasons.push(...professionMatch.reasons);
                }

                // Match based on behavioral tendencies
                if (characterAttributes.behavioralTendencies) {
                    const behavioralMatch = this._calculateBehavioralMatch(
                        characterAttributes.behavioralTendencies,
                        template
                    );
                    score += behavioralMatch.score;
                    matchReasons.push(...behavioralMatch.reasons);
                }

                if (score > 0) {
                    recommendations.push({
                        templateName,
                        score,
                        reasons: matchReasons,
                        template: JSON.parse(JSON.stringify(template))
                    });
                }
            }

            // Sort by score descending
            recommendations.sort((a, b) => b.score - a.score);

            return recommendations.slice(0, 3); // Return top 3 recommendations

        } catch (error) {
            if (this.logger) {
                this.logger.error(`Error getting template recommendations: ${error.message}`);
            }
            return [];
        }
    }

    /**
     * Calculate personality trait match with template
     * @param {Object} personality - Character personality traits
     * @param {string} templateName - Template name to match against
     * @returns {Object} Match score and reasons
     */
    _calculatePersonalityMatch(personality, templateName) {
        const templatePersonalityMap = {
            warrior: { aggression: 0.8, bravery: 0.9, caution: 0.2 },
            scholar: { curiosity: 0.9, discipline: 0.8, extrovert: 0.3 },
            merchant: { greed: 0.7, extrovert: 0.8, discipline: 0.6 },
            mystic: { curiosity: 0.8, introvert: 0.7, empathy: 0.6 },
            noble: { extrovert: 0.9, discipline: 0.7, greed: 0.4 },
            rogue: { greed: 0.8, caution: 0.3, deception: 0.7 },
            peasant: { discipline: 0.6, empathy: 0.7, curiosity: 0.5 }
        };

        const templateTraits = templatePersonalityMap[templateName];
        if (!templateTraits) {
            return { score: 0, reasons: [] };
        }

        let score = 0;
        const reasons = [];

        for (const [trait, templateValue] of Object.entries(templateTraits)) {
            const characterValue = personality[trait] || 0.5;
            const matchStrength = 1 - Math.abs(characterValue - templateValue);
            score += matchStrength * 10; // Scale to 0-10 per trait

            if (matchStrength > 0.7) {
                reasons.push(`Strong ${trait} match (${Math.round(matchStrength * 100)}%)`);
            }
        }

        return { score, reasons };
    }

    /**
     * Calculate profession match with template
     * @param {string} profession - Character profession
     * @param {string} templateName - Template name to match against
     * @returns {Object} Match score and reasons
     */
    _calculateProfessionMatch(profession, templateName) {
        const professionTemplateMap = {
            'warrior': ['warrior', 'fighter', 'soldier', 'guard'],
            'scholar': ['scholar', 'teacher', 'researcher', 'mage'],
            'merchant': ['merchant', 'trader', 'shopkeeper', 'banker'],
            'mystic': ['priest', 'druid', 'monk', 'oracle'],
            'noble': ['noble', 'lord', 'lady', 'knight'],
            'rogue': ['thief', 'assassin', 'spy', 'bandit'],
            'peasant': ['farmer', 'craftsman', 'laborer', 'servant']
        };

        const matchingProfessions = professionTemplateMap[templateName] || [];
        const professionLower = profession.toLowerCase();

        for (const matchingProf of matchingProfessions) {
            if (professionLower.includes(matchingProf) || matchingProf.includes(professionLower)) {
                return {
                    score: 20, // High score for profession match
                    reasons: [`Profession '${profession}' matches ${templateName} archetype`]
                };
            }
        }

        return { score: 0, reasons: [] };
    }

    /**
     * Calculate behavioral tendencies match with template
     * @param {Object} behavioralTendencies - Character behavioral tendencies
     * @param {Object} template - Template to match against
     * @returns {Object} Match score and reasons
     */
    _calculateBehavioralMatch(behavioralTendencies, template) {
        let score = 0;
        const reasons = [];

        const behavioralState = template.consciousness.behavioralState;

        // Compare risk tolerance
        if (behavioralTendencies.riskTolerance !== undefined) {
            const riskMatch = 1 - Math.abs(behavioralTendencies.riskTolerance - behavioralState.riskTolerance);
            score += riskMatch * 15;
            if (riskMatch > 0.7) {
                reasons.push(`Risk tolerance alignment (${Math.round(riskMatch * 100)}%)`);
            }
        }

        // Compare social drive
        if (behavioralTendencies.socialDrive !== undefined) {
            const socialMatch = 1 - Math.abs(behavioralTendencies.socialDrive - behavioralState.socialDrive);
            score += socialMatch * 15;
            if (socialMatch > 0.7) {
                reasons.push(`Social drive alignment (${Math.round(socialMatch * 100)}%)`);
            }
        }

        return { score, reasons };
    }

    /**
     * Get consciousness parameter bounds for validation
     * @returns {Object} Parameter bounds
     */
    getConsciousnessParameterBounds() {
        return {
            frequency: { min: 3.0, max: 15.0 },
            coherence: { min: 0.2, max: 1.0 },
            behavioralState: {
                energy: { min: 0, max: 1 },
                focus: { min: 0, max: 1 },
                socialDrive: { min: 0, max: 1 },
                riskTolerance: { min: 0, max: 1 }
            }
        };
    }

    /**
     * Export template to JSON format
     * @param {Object} template - Template to export
     * @returns {string} JSON string representation
     */
    exportTemplate(template) {
        try {
            if (!template || typeof template !== 'object') {
                throw new Error('Valid template object is required');
            }

            return JSON.stringify(template, null, 2);

        } catch (error) {
            if (this.logger) {
                this.logger.error(`Error exporting template: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Import template from JSON format
     * @param {string} jsonString - JSON string representation
     * @returns {Object} Imported template
     */
    importTemplate(jsonString) {
        try {
            if (!jsonString || typeof jsonString !== 'string') {
                throw new Error('Valid JSON string is required');
            }

            const template = JSON.parse(jsonString);

            // Validate imported template
            const validation = this.validateConsciousnessTemplate(template.consciousness);
            if (!validation.isValid) {
                throw new Error(`Invalid imported template: ${validation.errors.join(', ')}`);
            }

            if (this.logger) {
                this.logger.info(`Imported consciousness template: ${template.name}`);
            }

            return template;

        } catch (error) {
            if (this.logger) {
                this.logger.error(`Error importing template: ${error.message}`);
            }
            throw error;
        }
    }
}

export default CharacterTemplateService;