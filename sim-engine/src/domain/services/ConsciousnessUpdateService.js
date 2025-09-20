/**
 * Consciousness Update Service
 *
 * Handles event-driven updates to NPC consciousness parameters based on significant events.
 * Implements parameter modification rules and bounds enforcement for frequency (3-15) and coherence (0.2-1.0).
 * Integrates with EventSignificanceService for threshold checking.
 */

import BaseDomainService from './BaseDomainService.js';
import EventSignificanceService from './EventSignificanceService.js';
import ConsciousnessMigrationService from './ConsciousnessMigrationService.js';
import ConsciousnessErrorHandlingService from './ConsciousnessErrorHandlingService.js';
import MemoryManagementService from './MemoryManagementService.js';

class ConsciousnessUpdateService extends BaseDomainService {
    constructor(eventSignificanceService = null, logger = null, errorHandler = null) {
        super();
        this.eventSignificanceService = eventSignificanceService || new EventSignificanceService();
        this.consciousnessMigrationService = new ConsciousnessMigrationService(logger);
        this.errorHandler = errorHandler || new ConsciousnessErrorHandlingService(logger);
        this.logger = logger;

        // Memory management service for automatic memory optimization
        this.memoryManager = new MemoryManagementService(logger, errorHandler);

        // Consciousness parameter bounds
        this.MIN_FREQUENCY = 3.0;
        this.MAX_FREQUENCY = 15.0;
        this.MIN_COHERENCE = 0.2;
        this.MAX_COHERENCE = 1.0;

        // Default consciousness parameter update rules
        this.UPDATE_RULES = {
            // Goal-related events
            'goal_completion': {
                frequency: +0.3,
                coherence: +0.05,
                description: 'Goal completion increases focus and stability'
            },
            'goal_failure': {
                frequency: -0.5,
                coherence: -0.1,
                description: 'Goal failure decreases focus and increases instability'
            },
            'goal_progress': {
                frequency: +0.1,
                coherence: +0.02,
                description: 'Goal progress slightly increases focus'
            },

            // Social interactions
            'social_success': {
                frequency: +0.2,
                coherence: +0.03,
                description: 'Positive social interactions increase social engagement'
            },
            'social_failure': {
                frequency: -0.3,
                coherence: -0.05,
                description: 'Negative social interactions decrease social engagement'
            },
            'relationship_change': {
                frequency: +0.4,
                coherence: +0.06,
                description: 'Relationship changes significantly affect social consciousness'
            },

            // Conflict and trauma
            'conflict': {
                frequency: +0.6,
                coherence: -0.1,
                description: 'Conflict increases alertness but reduces stability'
            },
            'betrayal': {
                frequency: -0.8,
                coherence: -0.15,
                description: 'Betrayal significantly damages trust and stability'
            },
            'traumatic_encounter': {
                frequency: -1.0,
                coherence: -0.2,
                description: 'Traumatic events severely impact consciousness'
            },

            // Economic events
            'economic_gain': {
                frequency: +0.2,
                coherence: +0.03,
                description: 'Economic success increases confidence'
            },
            'economic_loss': {
                frequency: -0.4,
                coherence: -0.07,
                description: 'Economic loss decreases confidence and stability'
            },

            // Life events
            'birth': {
                frequency: +0.5,
                coherence: +0.1,
                description: 'Birth of child increases purpose and stability'
            },
            'death': {
                frequency: -0.7,
                coherence: -0.12,
                description: 'Death of close one causes significant emotional impact'
            },
            'marriage': {
                frequency: +0.6,
                coherence: +0.08,
                description: 'Marriage increases social bonding and stability'
            },

            // Discovery and learning
            'discovery': {
                frequency: +0.4,
                coherence: +0.06,
                description: 'Discovery increases curiosity and mental clarity'
            },
            'skill_improvement': {
                frequency: +0.2,
                coherence: +0.04,
                description: 'Skill improvement increases confidence and focus'
            }
        };

        // Significance threshold for triggering updates
        this.SIGNIFICANCE_THRESHOLD = 0.3;
    }

    /**
     * Process an event and update consciousness if significant
     * @param {Object} character - Character whose consciousness to update
     * @param {Object} event - Event that occurred
     * @param {Object} context - Additional context for significance evaluation
     * @returns {Object} Update result with success status and changes
     */
    processEvent(character, event, context = {}) {
        try {
            if (!character || !event) {
                throw new Error('Character and event are required');
            }

            // Ensure character has consciousness
            if (!character.consciousness) {
                character.consciousness = {
                    frequency: 7.0, // Default alpha baseline
                    coherence: 0.5
                };
            }

            // Migrate consciousness data to latest format if needed
            const migrationResult = this.consciousnessMigrationService.migrateConsciousnessData(
                character.consciousness,
                { repairCorrupted: true }
            );

            if (migrationResult.migrated) {
                character.consciousness = migrationResult.data;
                if (this.logger) {
                    this.logger.info(`Migrated consciousness data for character ${character.id} from ${migrationResult.fromVersion} to ${migrationResult.toVersion}`);
                }
            }

            // Perform automatic memory management before processing event
            this.memoryManager.processCharacter(character, {
                skipGarbageCollection: true // We'll handle garbage collection separately
            });

            // Check if event is significant enough to trigger update
            const isSignificant = this.eventSignificanceService.isEventSignificant(event, context);

            if (!isSignificant) {
                return {
                    success: true,
                    updated: false,
                    reason: 'Event not significant enough',
                    significance: this.eventSignificanceService.calculateEventSignificance(event, context)
                };
            }

            // Update consciousness based on event
            const updateResult = this.updateConsciousnessFromEvent(character, event, context);

            // Add significant event to consciousness history
            this.addSignificantEvent(character, event, context, updateResult.significance);

            if (this.logger) {
                this.logger.info(`Consciousness updated for character ${character.id}: ${JSON.stringify(updateResult.changes)}`);
            }

            return {
                success: true,
                updated: true,
                changes: updateResult.changes,
                newState: updateResult.newState,
                significance: updateResult.significance
            };

        } catch (error) {
            // Use comprehensive error handling service
            const errorResult = this.errorHandler.handleCalculationFailure(error, {
                calculationType: 'event_processing',
                character,
                event,
                context
            });

            if (this.logger) {
                this.logger.error(`Error processing event for character ${character?.id}: ${error.message}`);
            }

            return {
                success: false,
                updated: false,
                error: error.message,
                fallbackApplied: errorResult.fallbackValue !== undefined
            };
        }
    }

    /**
     * Update consciousness parameters based on event type
     * @param {Object} character - Character to update
     * @param {Object} event - Event that triggered the update
     * @param {Object} context - Additional context
     * @returns {Object} Update result with changes and new state
     */
    updateConsciousnessFromEvent(character, event, context = {}) {
        if (!character || !character.consciousness || !event) {
            throw new Error('Character, consciousness, and event are required');
        }

        const eventType = event.type;
        const updateRule = this.UPDATE_RULES[eventType];

        if (!updateRule) {
            // Use default update for unknown event types
            return this.applyDefaultUpdate(character, event, context);
        }

        // Store original values for comparison
        const originalFrequency = character.consciousness.frequency;
        const originalCoherence = character.consciousness.coherence;

        // Apply frequency change
        let newFrequency = originalFrequency + updateRule.frequency;
        newFrequency = this.clampFrequency(newFrequency);

        // Apply coherence change
        let newCoherence = originalCoherence + updateRule.coherence;
        newCoherence = this.clampCoherence(newCoherence);

        // Update character's consciousness
        character.consciousness.frequency = newFrequency;
        character.consciousness.coherence = newCoherence;

        // Calculate significance for tracking
        const significance = this.eventSignificanceService.calculateEventSignificance(event, context);

        // Track changes
        const changes = {
            frequency: {
                before: originalFrequency,
                after: newFrequency,
                change: newFrequency - originalFrequency
            },
            coherence: {
                before: originalCoherence,
                after: newCoherence,
                change: newCoherence - originalCoherence
            },
            eventType: eventType,
            rule: updateRule.description
        };

        return {
            changes,
            newState: {
                frequency: newFrequency,
                coherence: newCoherence
            },
            significance
        };
    }

    /**
     * Apply default update for unknown event types
     * @param {Object} character - Character to update
     * @param {Object} event - Event that triggered the update
     * @param {Object} context - Additional context
     * @returns {Object} Update result
     */
    applyDefaultUpdate(character, event, context = {}) {
        const originalFrequency = character.consciousness.frequency;
        const originalCoherence = character.consciousness.coherence;

        // Default small changes based on event outcome
        let frequencyChange = 0;
        let coherenceChange = 0;

        if (event.outcome === 'positive' || event.outcome === 'success') {
            frequencyChange = +0.1;
            coherenceChange = +0.02;
        } else if (event.outcome === 'negative' || event.outcome === 'failure') {
            frequencyChange = -0.2;
            coherenceChange = -0.03;
        }

        // Apply changes with bounds checking
        const newFrequency = this.clampFrequency(originalFrequency + frequencyChange);
        const newCoherence = this.clampCoherence(originalCoherence + coherenceChange);

        // Update character
        character.consciousness.frequency = newFrequency;
        character.consciousness.coherence = newCoherence;

        const significance = this.eventSignificanceService.calculateEventSignificance(event, context);

        const changes = {
            frequency: {
                before: originalFrequency,
                after: newFrequency,
                change: newFrequency - originalFrequency
            },
            coherence: {
                before: originalCoherence,
                after: newCoherence,
                change: newCoherence - originalCoherence
            },
            eventType: event.type,
            rule: 'Default update for unknown event type'
        };

        return {
            changes,
            newState: {
                frequency: newFrequency,
                coherence: newCoherence
            },
            significance
        };
    }

    /**
     * Clamp frequency to valid bounds (3-15 Hz)
     * @param {number} frequency - Frequency value to clamp
     * @returns {number} Clamped frequency
     */
    clampFrequency(frequency) {
        return Math.max(this.MIN_FREQUENCY, Math.min(this.MAX_FREQUENCY, frequency));
    }

    /**
     * Clamp coherence to valid bounds (0.2-1.0)
     * @param {number} coherence - Coherence value to clamp
     * @returns {number} Clamped coherence
     */
    clampCoherence(coherence) {
        return Math.max(this.MIN_COHERENCE, Math.min(this.MAX_COHERENCE, coherence));
    }

    /**
     * Check if consciousness parameters are within valid bounds
     * @param {Object} consciousness - Consciousness object to validate
     * @returns {Object} Validation result
     */
    validateConsciousnessBounds(consciousness) {
        if (!consciousness) {
            return {
                isValid: false,
                errors: ['Consciousness object is required']
            };
        }

        const errors = [];

        if (typeof consciousness.frequency !== 'number' ||
            consciousness.frequency < this.MIN_FREQUENCY ||
            consciousness.frequency > this.MAX_FREQUENCY) {
            errors.push(`Frequency must be between ${this.MIN_FREQUENCY} and ${this.MAX_FREQUENCY}`);
        }

        if (typeof consciousness.coherence !== 'number' ||
            consciousness.coherence < this.MIN_COHERENCE ||
            consciousness.coherence > this.MAX_COHERENCE) {
            errors.push(`Coherence must be between ${this.MIN_COHERENCE.toFixed(1)} and ${this.MAX_COHERENCE.toFixed(1)}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Get consciousness parameter bounds
     * @returns {Object} Bounds information
     */
    getConsciousnessBounds() {
        return {
            frequency: {
                min: this.MIN_FREQUENCY,
                max: this.MAX_FREQUENCY
            },
            coherence: {
                min: this.MIN_COHERENCE,
                max: this.MAX_COHERENCE
            }
        };
    }

    /**
     * Get all supported event types and their update rules
     * @returns {Object} Event types and their update rules
     */
    getSupportedEventTypes() {
        return { ...this.UPDATE_RULES };
    }

    /**
     * Add or update an event type update rule
     * @param {string} eventType - Event type to add/update
     * @param {Object} rule - Update rule with frequency and coherence changes
     */
    setUpdateRule(eventType, rule) {
        if (!eventType || typeof eventType !== 'string') {
            throw new Error('Event type must be a non-empty string');
        }

        if (!rule || typeof rule !== 'object') {
            throw new Error('Update rule must be an object');
        }

        if (typeof rule.frequency !== 'number' || typeof rule.coherence !== 'number') {
            throw new Error('Update rule must contain numeric frequency and coherence values');
        }

        this.UPDATE_RULES[eventType] = {
            frequency: rule.frequency,
            coherence: rule.coherence,
            description: rule.description || `Custom rule for ${eventType}`
        };
    }

    /**
     * Get significance threshold for updates
     * @returns {number} Significance threshold
     */
    getSignificanceThreshold() {
        return this.SIGNIFICANCE_THRESHOLD;
    }

    /**
     * Set significance threshold for updates
     * @param {number} threshold - New threshold value
     */
    setSignificanceThreshold(threshold) {
        if (typeof threshold !== 'number' || threshold < 0 || threshold > 1) {
            throw new Error('Significance threshold must be a number between 0 and 1');
        }

        this.SIGNIFICANCE_THRESHOLD = threshold;
    }

    /**
     * Reset consciousness to baseline values
     * @param {Object} character - Character to reset
     * @returns {Object} Reset result
     */
    resetConsciousnessToBaseline(character) {
        if (!character) {
            throw new Error('Character is required');
        }

        const originalState = { ...character.consciousness };

        // Baseline values
        character.consciousness = {
            frequency: 7.0, // Alpha baseline
            coherence: 0.5
        };

        return {
            success: true,
            originalState,
            newState: { ...character.consciousness },
            reset: true
        };
    }

    /**
     * Apply gradual drift toward baseline values
     * @param {Object} character - Character to apply drift to
     * @param {number} driftFactor - How much to drift (0.0 to 1.0)
     * @returns {Object} Drift result
     */
    applyBaselineDrift(character, driftFactor = 0.1) {
        if (!character || !character.consciousness) {
            throw new Error('Character with consciousness is required');
        }

        if (typeof driftFactor !== 'number' || driftFactor < 0 || driftFactor > 1) {
            throw new Error('Drift factor must be a number between 0 and 1');
        }

        const originalFrequency = character.consciousness.frequency;
        const originalCoherence = character.consciousness.coherence;

        // Baseline values
        const baselineFrequency = 7.0;
        const baselineCoherence = 0.5;

        // Apply gradual drift
        const newFrequency = originalFrequency + (baselineFrequency - originalFrequency) * driftFactor;
        const newCoherence = originalCoherence + (baselineCoherence - originalCoherence) * driftFactor;

        // Apply bounds
        character.consciousness.frequency = this.clampFrequency(newFrequency);
        character.consciousness.coherence = this.clampCoherence(newCoherence);

        return {
            success: true,
            changes: {
                frequency: {
                    before: originalFrequency,
                    after: character.consciousness.frequency,
                    change: character.consciousness.frequency - originalFrequency
                },
                coherence: {
                    before: originalCoherence,
                    after: character.consciousness.coherence,
                    change: character.consciousness.coherence - originalCoherence
                }
            },
            driftFactor
        };
    }

    /**
     * Add a significant event to the character's consciousness history
     * @param {Object} character - Character to add event to
     * @param {Object} event - Event that was processed
     * @param {Object} context - Additional context
     * @param {number} significance - Calculated significance of the event
     */
    addSignificantEvent(character, event, context, significance) {
        if (!character.consciousness) {
            return;
        }

        // Initialize significantEvents array if it doesn't exist
        if (!character.consciousness.significantEvents) {
            character.consciousness.significantEvents = [];
        }

        // Create event record
        const eventRecord = {
            id: this.generateEventId(),
            type: event.type,
            outcome: event.outcome,
            significance: significance,
            timestamp: Date.now(),
            emotionalImpact: context.emotionalImpact || event.emotionalImpact || 0,
            changes: {
                frequency: event.frequency || 0,
                coherence: event.coherence || 0
            },
            description: this.generateEventDescription(event, context)
        };

        // Add event to history
        character.consciousness.significantEvents.push(eventRecord);

        // Limit the number of stored events to prevent memory bloat
        const maxEvents = 20; // Configurable limit
        if (character.consciousness.significantEvents.length > maxEvents) {
            // Keep most significant events
            character.consciousness.significantEvents.sort((a, b) => b.significance - a.significance);
            character.consciousness.significantEvents = character.consciousness.significantEvents.slice(0, maxEvents);
        }
    }

    /**
     * Generate unique event ID
     * @returns {string} Unique event identifier
     */
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate human-readable event description
     * @param {Object} event - The event
     * @param {Object} context - Additional context
     * @returns {string} Event description
     */
    generateEventDescription(event, context) {
        const typeDescriptions = {
            'social_success': 'successful social interaction',
            'social_failure': 'unsuccessful social interaction',
            'conflict': 'conflict situation',
            'betrayal': 'experience of betrayal',
            'goal_completion': 'goal achievement',
            'goal_failure': 'goal failure',
            'economic_gain': 'economic success',
            'economic_loss': 'economic setback',
            'birth': 'birth of child',
            'death': 'loss of life',
            'marriage': 'marriage',
            'discovery': 'important discovery',
            'skill_improvement': 'skill development'
        };

        const outcomeDescriptions = {
            'critical_success': 'with outstanding success',
            'success': 'successfully',
            'partial_success': 'with mixed results',
            'neutral': 'neutrally',
            'partial_failure': 'with some difficulties',
            'failure': 'unsuccessfully',
            'critical_failure': 'with catastrophic failure'
        };

        const typeDesc = typeDescriptions[event.type] || 'significant event';
        const outcomeDesc = outcomeDescriptions[event.outcome] || '';

        let description = `${typeDesc} ${outcomeDesc}`;

        // Add context details
        if (context.participants && context.participants.length > 0) {
            description += ` involving ${context.participants.length} other${context.participants.length > 1 ? 's' : ''}`;
        }

        return description.trim();
    }
}

export default ConsciousnessUpdateService;