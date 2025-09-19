/**
 * ConsciousnessErrorHandlingService
 *
 * Comprehensive error handling and recovery system for the consciousness system.
 * Implements graceful error handling for state corruption, automatic behavioral state regeneration,
 * error logging and diagnostic reporting, and fallback mechanisms for calculation failures.
 *
 * Key Features:
 * - Graceful handling of consciousness state corruption
 * - Automatic behavioral state regeneration from corrupted/missing cache
 * - Comprehensive error logging and diagnostic reporting
 * - Fallback mechanisms for calculation failures
 * - Recovery strategies for various failure scenarios
 */

import BaseDomainService from './BaseDomainService.js';

class ConsciousnessErrorHandlingService extends BaseDomainService {
    constructor(logger = null, eventSignificanceService = null) {
        super();
        this.logger = logger;
        this.eventSignificanceService = eventSignificanceService;

        // Error categories for classification
        this.ERROR_CATEGORIES = {
            CORRUPTION: 'corruption',
            MISSING_DATA: 'missing_data',
            INVALID_PARAMETERS: 'invalid_parameters',
            CALCULATION_FAILURE: 'calculation_failure',
            CHECKPOINT_FAILURE: 'checkpoint_failure',
            MEMORY_OVERFLOW: 'memory_overflow',
            PERFORMANCE_DEGRADATION: 'performance_degradation'
        };

        // Recovery strategies
        this.RECOVERY_STRATEGIES = {
            REGENERATE_BEHAVIORAL_STATE: 'regenerate_behavioral_state',
            RESET_TO_BASELINE: 'reset_to_baseline',
            USE_FALLBACK_CALCULATION: 'use_fallback_calculation',
            RESTORE_FROM_BACKUP: 'restore_from_backup',
            ISOLATE_AND_CONTINUE: 'isolate_and_continue'
        };

        // Error severity levels
        this.SEVERITY_LEVELS = {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high',
            CRITICAL: 'critical'
        };

        // Default consciousness bounds
        this.DEFAULT_BOUNDS = {
            frequency: { min: 3.0, max: 15.0, default: 7.5 },
            coherence: { min: 0.2, max: 1.0, default: 0.7 }
        };

        // Error tracking
        this.errorHistory = [];
        this.maxErrorHistory = 100;
    }

    /**
     * Handle consciousness state corruption gracefully
     * @param {Object} character - Character with corrupted consciousness
     * @param {Object} context - Additional context for error handling
     * @returns {Object} Recovery result
     */
    handleConsciousnessCorruption(character, context = {}) {
        const errorId = this.generateErrorId();
        const startTime = Date.now();

        try {
            if (!character) {
                throw new Error('Character is required for corruption handling');
            }

            // Log the corruption error
            this.logError({
                id: errorId,
                category: this.ERROR_CATEGORIES.CORRUPTION,
                severity: this.SEVERITY_LEVELS.HIGH,
                message: 'Consciousness state corruption detected',
                characterId: character.id,
                originalState: character.consciousness,
                context
            });

            // Attempt recovery
            const recoveryResult = this.recoverFromCorruption(character, context);

            // Log recovery result
            this.logError({
                id: errorId,
                category: this.ERROR_CATEGORIES.CORRUPTION,
                severity: this.SEVERITY_LEVELS.LOW,
                message: `Corruption recovery ${recoveryResult.success ? 'successful' : 'failed'}`,
                characterId: character.id,
                recoveryResult,
                duration: Date.now() - startTime
            });

            return recoveryResult;

        } catch (error) {
            this.logError({
                id: errorId,
                category: this.ERROR_CATEGORIES.CORRUPTION,
                severity: this.SEVERITY_LEVELS.CRITICAL,
                message: `Critical error during corruption handling: ${error.message}`,
                characterId: character?.id,
                error: error.message,
                stack: error.stack,
                duration: Date.now() - startTime
            });

            // Return failure result
            return {
                success: false,
                error: error.message,
                strategy: this.RECOVERY_STRATEGIES.RESET_TO_BASELINE,
                fallbackApplied: true
            };
        }
    }

    /**
     * Recover from consciousness state corruption
     * @param {Object} character - Character to recover
     * @param {Object} context - Recovery context
     * @returns {Object} Recovery result
     */
    recoverFromCorruption(character, context = {}) {
        // Strategy 1: Try to repair corrupted data
        if (this.attemptDataRepair(character)) {
            return {
                success: true,
                strategy: this.RECOVERY_STRATEGIES.REGENERATE_BEHAVIORAL_STATE,
                message: 'Successfully repaired corrupted consciousness data'
            };
        }

        // Strategy 2: Regenerate from partial data
        if (this.regenerateFromPartialData(character)) {
            return {
                success: true,
                strategy: this.RECOVERY_STRATEGIES.REGENERATE_BEHAVIORAL_STATE,
                message: 'Successfully regenerated from partial consciousness data'
            };
        }

        // Strategy 3: Reset to baseline values
        this.resetToBaseline(character);
        return {
            success: true,
            strategy: this.RECOVERY_STRATEGIES.RESET_TO_BASELINE,
            message: 'Reset consciousness to baseline values due to corruption'
        };
    }

    /**
     * Attempt to repair corrupted consciousness data
     * @param {Object} character - Character with potentially repairable data
     * @returns {boolean} True if repair successful
     */
    attemptDataRepair(character) {
        if (!character.consciousness) {
            character.consciousness = {};
        }

        const consciousness = character.consciousness;
        let repaired = false;

        // Repair frequency if corrupted
        if (typeof consciousness.frequency !== 'number' || isNaN(consciousness.frequency)) {
            consciousness.frequency = this.DEFAULT_BOUNDS.frequency.default;
            repaired = true;
        } else {
            // Clamp to valid bounds
            consciousness.frequency = this.clampFrequency(consciousness.frequency);
        }

        // Repair coherence if corrupted
        if (typeof consciousness.coherence !== 'number' || isNaN(consciousness.coherence)) {
            consciousness.coherence = this.DEFAULT_BOUNDS.coherence.default;
            repaired = true;
        } else {
            // Clamp to valid bounds
            consciousness.coherence = this.clampCoherence(consciousness.coherence);
        }

        // Repair behavioral state if corrupted
        if (!this.isValidBehavioralState(consciousness.behavioralState)) {
            consciousness.behavioralState = this.generateBehavioralStateFromParameters(
                consciousness.frequency,
                consciousness.coherence
            );
            repaired = true;
        }

        // Repair significant events array
        if (!Array.isArray(consciousness.significantEvents)) {
            consciousness.significantEvents = [];
            repaired = true;
        }

        // Repair last update timestamp
        if (typeof consciousness.lastUpdate !== 'number' || isNaN(consciousness.lastUpdate)) {
            consciousness.lastUpdate = Date.now();
            repaired = true;
        }

        return repaired;
    }

    /**
     * Regenerate consciousness from partial data
     * @param {Object} character - Character with partial consciousness data
     * @returns {boolean} True if regeneration successful
     */
    regenerateFromPartialData(character) {
        if (!character.consciousness) {
            character.consciousness = {};
        }

        const consciousness = character.consciousness;

        // If we have at least one valid parameter, we can regenerate
        const hasValidFrequency = typeof consciousness.frequency === 'number' &&
                                 !isNaN(consciousness.frequency) &&
                                 consciousness.frequency >= this.DEFAULT_BOUNDS.frequency.min &&
                                 consciousness.frequency <= this.DEFAULT_BOUNDS.frequency.max;

        const hasValidCoherence = typeof consciousness.coherence === 'number' &&
                                 !isNaN(consciousness.coherence) &&
                                 consciousness.coherence >= this.DEFAULT_BOUNDS.coherence.min &&
                                 consciousness.coherence <= this.DEFAULT_BOUNDS.coherence.max;

        if (hasValidFrequency || hasValidCoherence) {
            // Use available valid data, default the rest
            const frequency = hasValidFrequency ?
                consciousness.frequency : this.DEFAULT_BOUNDS.frequency.default;
            const coherence = hasValidCoherence ?
                consciousness.coherence : this.DEFAULT_BOUNDS.coherence.default;

            // Regenerate full consciousness state
            consciousness.frequency = frequency;
            consciousness.coherence = coherence;
            consciousness.behavioralState = this.generateBehavioralStateFromParameters(frequency, coherence);
            consciousness.significantEvents = consciousness.significantEvents || [];
            consciousness.lastUpdate = consciousness.lastUpdate || Date.now();

            return true;
        }

        return false;
    }

    /**
     * Reset consciousness to baseline values
     * @param {Object} character - Character to reset
     */
    resetToBaseline(character) {
        character.consciousness = {
            frequency: this.DEFAULT_BOUNDS.frequency.default,
            coherence: this.DEFAULT_BOUNDS.coherence.default,
            behavioralState: this.generateDefaultBehavioralState(),
            significantEvents: [],
            lastUpdate: Date.now(),
            updateTriggerThreshold: 0.3
        };
    }

    /**
     * Handle missing behavioral state cache
     * @param {Object} character - Character with missing behavioral state
     * @param {Object} context - Additional context
     * @returns {Object} Recovery result
     */
    handleMissingBehavioralState(character, context = {}) {
        const errorId = this.generateErrorId();

        try {
            if (!character || !character.consciousness) {
                throw new Error('Character or consciousness is required');
            }

            // Log the missing cache error
            this.logError({
                id: errorId,
                category: this.ERROR_CATEGORIES.MISSING_DATA,
                severity: this.SEVERITY_LEVELS.MEDIUM,
                message: 'Missing behavioral state cache detected',
                characterId: character.id,
                context
            });

            // Regenerate behavioral state
            const regeneratedState = this.regenerateBehavioralState(character);

            // Log successful regeneration
            this.logError({
                id: errorId,
                category: this.ERROR_CATEGORIES.MISSING_DATA,
                severity: this.SEVERITY_LEVELS.LOW,
                message: 'Successfully regenerated missing behavioral state',
                characterId: character.id,
                regeneratedState
            });

            return {
                success: true,
                regeneratedState,
                strategy: this.RECOVERY_STRATEGIES.REGENERATE_BEHAVIORAL_STATE
            };

        } catch (error) {
            this.logError({
                id: errorId,
                category: this.ERROR_CATEGORIES.MISSING_DATA,
                severity: this.SEVERITY_LEVELS.HIGH,
                message: `Failed to regenerate behavioral state: ${error.message}`,
                characterId: character?.id,
                error: error.message
            });

            return {
                success: false,
                error: error.message,
                strategy: this.RECOVERY_STRATEGIES.RESET_TO_BASELINE
            };
        }
    }

    /**
     * Regenerate behavioral state from consciousness parameters
     * @param {Object} character - Character to regenerate state for
     * @returns {Object} Regenerated behavioral state
     */
    regenerateBehavioralState(character) {
        const consciousness = character.consciousness;

        // Ensure we have valid consciousness parameters
        const frequency = this.validateFrequency(consciousness.frequency);
        const coherence = this.validateCoherence(consciousness.coherence);

        // Update consciousness with validated parameters
        consciousness.frequency = frequency;
        consciousness.coherence = coherence;

        // Generate behavioral state
        const behavioralState = this.generateBehavioralStateFromParameters(frequency, coherence);
        consciousness.behavioralState = behavioralState;

        return behavioralState;
    }

    /**
     * Handle calculation failures with fallback mechanisms
     * @param {Error} error - The calculation error
     * @param {Object} context - Context of the failed calculation
     * @returns {Object} Fallback result
     */
    handleCalculationFailure(error, context = {}) {
        const errorId = this.generateErrorId();

        try {
            // Log the calculation failure
            this.logError({
                id: errorId,
                category: this.ERROR_CATEGORIES.CALCULATION_FAILURE,
                severity: this.SEVERITY_LEVELS.MEDIUM,
                message: `Calculation failure: ${error.message}`,
                error: error.message,
                stack: error.stack,
                context
            });

            // Attempt fallback calculation
            const fallbackResult = this.attemptFallbackCalculation(context);

            // Log fallback result
            this.logError({
                id: errorId,
                category: this.ERROR_CATEGORIES.CALCULATION_FAILURE,
                severity: this.SEVERITY_LEVELS.LOW,
                message: `Fallback calculation ${fallbackResult.success ? 'successful' : 'failed'}`,
                fallbackResult
            });

            return fallbackResult;

        } catch (fallbackError) {
            this.logError({
                id: errorId,
                category: this.ERROR_CATEGORIES.CALCULATION_FAILURE,
                severity: this.SEVERITY_LEVELS.HIGH,
                message: `Fallback calculation also failed: ${fallbackError.message}`,
                originalError: error.message,
                fallbackError: fallbackError.message
            });

            return {
                success: false,
                error: fallbackError.message,
                strategy: this.RECOVERY_STRATEGIES.USE_FALLBACK_CALCULATION,
                fallbackValue: this.getNeutralFallbackValue(context.calculationType)
            };
        }
    }

    /**
     * Attempt fallback calculation based on context
     * @param {Object} context - Context of the failed calculation
     * @returns {Object} Fallback calculation result
     */
    attemptFallbackCalculation(context = {}) {
        const { calculationType, character, interactionType } = context;

        switch (calculationType) {
            case 'decision_factor':
                return this.fallbackDecisionFactorCalculation(character, interactionType);

            case 'behavioral_modifier':
                return this.fallbackBehavioralModifierCalculation(character, interactionType);

            case 'event_significance':
                return this.fallbackEventSignificanceCalculation(context.event);

            case 'memory_influence':
                return this.fallbackMemoryInfluenceCalculation(character, interactionType);

            default:
                return {
                    success: false,
                    error: `No fallback available for calculation type: ${calculationType}`,
                    fallbackValue: 1.0 // Neutral fallback
                };
        }
    }

    /**
     * Fallback decision factor calculation
     * @param {Object} character - Character for calculation
     * @param {string} interactionType - Type of interaction
     * @returns {Object} Fallback result
     */
    fallbackDecisionFactorCalculation(character, interactionType) {
        // Simple fallback based on personality traits only
        let factor = 1.0;

        if (character && character.personality) {
            const personality = character.personality;
            const traits = personality.getAllTraits ? personality.getAllTraits() : personality;

            // Apply simple personality modifiers
            if (traits.aggression > 0.7 && interactionType === 'combat') factor *= 1.3;
            if (traits.empathy > 0.7 && interactionType === 'social') factor *= 1.2;
            if (traits.cowardice > 0.7 && interactionType === 'combat') factor *= 0.7;
        }

        return {
            success: true,
            fallbackValue: Math.max(0.1, Math.min(3.0, factor)),
            strategy: 'personality-based-fallback'
        };
    }

    /**
     * Fallback behavioral modifier calculation
     * @param {Object} character - Character for calculation
     * @param {string} interactionType - Type of interaction
     * @returns {Object} Fallback result
     */
    fallbackBehavioralModifierCalculation(character, interactionType) {
        // Use simple rule-based fallback
        const fallbackModifiers = {
            'social': 1.1,
            'combat': 1.0,
            'exploration': 0.9,
            'economic': 1.0,
            'rest': 1.2
        };

        return {
            success: true,
            fallbackValue: fallbackModifiers[interactionType] || 1.0,
            strategy: 'rule-based-fallback'
        };
    }

    /**
     * Fallback event significance calculation
     * @param {Object} event - Event to calculate significance for
     * @returns {Object} Fallback result
     */
    fallbackEventSignificanceCalculation(event) {
        if (!event) {
            return { success: false, fallbackValue: 0.1 };
        }

        // Simple significance based on event type
        const typeSignificance = {
            'goal_completion': 0.8,
            'goal_failure': 0.6,
            'social_interaction': 0.4,
            'conflict': 0.7,
            'default': 0.3
        };

        const significance = typeSignificance[event.type] || typeSignificance.default;

        return {
            success: true,
            fallbackValue: significance,
            strategy: 'type-based-fallback'
        };
    }

    /**
     * Fallback memory influence calculation
     * @param {Object} character - Character for calculation
     * @param {string} interactionType - Type of interaction
     * @returns {Object} Fallback result
     */
    fallbackMemoryInfluenceCalculation(character, interactionType) {
        // Return neutral influence if memory calculation fails
        return {
            success: true,
            fallbackValue: 1.0,
            strategy: 'neutral-fallback'
        };
    }

    /**
     * Get neutral fallback value for calculation type
     * @param {string} calculationType - Type of calculation
     * @returns {number} Neutral fallback value
     */
    getNeutralFallbackValue(calculationType) {
        const neutrals = {
            'decision_factor': 1.0,
            'behavioral_modifier': 1.0,
            'event_significance': 0.3,
            'memory_influence': 1.0
        };

        return neutrals[calculationType] || 1.0;
    }

    /**
     * Log error with comprehensive diagnostic information
     * @param {Object} errorInfo - Error information to log
     */
    logError(errorInfo) {
        const errorEntry = {
            id: errorInfo.id || this.generateErrorId(),
            timestamp: Date.now(),
            category: errorInfo.category,
            severity: errorInfo.severity,
            message: errorInfo.message,
            characterId: errorInfo.characterId,
            context: errorInfo.context,
            error: errorInfo.error,
            stack: errorInfo.stack,
            recoveryResult: errorInfo.recoveryResult,
            duration: errorInfo.duration
        };

        // Add to error history
        this.errorHistory.push(errorEntry);

        // Maintain max history size
        if (this.errorHistory.length > this.maxErrorHistory) {
            this.errorHistory.shift();
        }

        // Log to external logger if available
        if (this.logger) {
            const logLevel = this.mapSeverityToLogLevel(errorInfo.severity);
            this.logger[logLevel](`[${errorInfo.category.toUpperCase()}] ${errorInfo.message}`, {
                errorId: errorEntry.id,
                characterId: errorInfo.characterId,
                context: errorInfo.context,
                error: errorInfo.error
            });
        }
    }

    /**
     * Map severity level to logger method
     * @param {string} severity - Error severity
     * @returns {string} Logger method name
     */
    mapSeverityToLogLevel(severity) {
        const mapping = {
            [this.SEVERITY_LEVELS.LOW]: 'info',
            [this.SEVERITY_LEVELS.MEDIUM]: 'warn',
            [this.SEVERITY_LEVELS.HIGH]: 'error',
            [this.SEVERITY_LEVELS.CRITICAL]: 'error'
        };

        return mapping[severity] || 'error';
    }

    /**
     * Generate unique error ID
     * @returns {string} Unique error identifier
     */
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get error diagnostics and health report
     * @returns {Object} Diagnostic report
     */
    getDiagnostics() {
        const now = Date.now();
        const lastHour = now - (60 * 60 * 1000);
        const lastDay = now - (24 * 60 * 60 * 1000);

        const recentErrors = this.errorHistory.filter(e => e.timestamp > lastHour);
        const dailyErrors = this.errorHistory.filter(e => e.timestamp > lastDay);

        // Categorize errors
        const errorCounts = {};
        Object.values(this.ERROR_CATEGORIES).forEach(category => {
            errorCounts[category] = {
                total: this.errorHistory.filter(e => e.category === category).length,
                recent: recentErrors.filter(e => e.category === category).length,
                daily: dailyErrors.filter(e => e.category === category).length
            };
        });

        // Severity breakdown
        const severityCounts = {};
        Object.values(this.SEVERITY_LEVELS).forEach(severity => {
            severityCounts[severity] = {
                total: this.errorHistory.filter(e => e.severity === severity).length,
                recent: recentErrors.filter(e => e.severity === severity).length
            };
        });

        return {
            timestamp: now,
            totalErrors: this.errorHistory.length,
            errorCounts,
            severityCounts,
            recentErrorRate: recentErrors.length,
            healthStatus: this.assessHealthStatus(recentErrors),
            recommendations: this.generateRecommendations(errorCounts, severityCounts)
        };
    }

    /**
     * Assess overall system health based on error patterns
     * @param {Array} recentErrors - Recent errors for assessment
     * @returns {string} Health status
     */
    assessHealthStatus(recentErrors) {
        const highSeverityErrors = recentErrors.filter(e =>
            e.severity === this.SEVERITY_LEVELS.HIGH ||
            e.severity === this.SEVERITY_LEVELS.CRITICAL
        );

        if (highSeverityErrors.length > 10) return 'critical';
        if (highSeverityErrors.length > 5) return 'unhealthy';
        if (recentErrors.length > 20) return 'warning';
        return 'healthy';
    }

    /**
     * Generate recommendations based on error patterns
     * @param {Object} errorCounts - Error counts by category
     * @param {Object} severityCounts - Error counts by severity
     * @returns {Array} Recommendations
     */
    generateRecommendations(errorCounts, severityCounts) {
        const recommendations = [];

        if (errorCounts.corruption?.recent > 5) {
            recommendations.push('High corruption errors detected - consider reviewing data persistence');
        }

        if (errorCounts.calculation_failure?.recent > 10) {
            recommendations.push('Frequent calculation failures - review behavioral state generation logic');
        }

        if (severityCounts.critical?.recent > 0) {
            recommendations.push('Critical errors detected - immediate investigation required');
        }

        if (errorCounts.memory_overflow?.recent > 3) {
            recommendations.push('Memory overflow issues - consider increasing memory limits or optimizing storage');
        }

        return recommendations;
    }

    /**
     * Validate consciousness parameters
     * @param {Object} consciousness - Consciousness object to validate
     * @returns {Object} Validation result
     */
    validateConsciousness(consciousness) {
        if (!consciousness) {
            return {
                isValid: false,
                errors: ['Consciousness object is required']
            };
        }

        const errors = [];

        // Validate frequency
        if (typeof consciousness.frequency !== 'number' ||
            isNaN(consciousness.frequency) ||
            consciousness.frequency < this.DEFAULT_BOUNDS.frequency.min ||
            consciousness.frequency > this.DEFAULT_BOUNDS.frequency.max) {
            errors.push(`Frequency must be between ${this.DEFAULT_BOUNDS.frequency.min} and ${this.DEFAULT_BOUNDS.frequency.max}`);
        }

        // Validate coherence
        if (typeof consciousness.coherence !== 'number' ||
            isNaN(consciousness.coherence) ||
            consciousness.coherence < this.DEFAULT_BOUNDS.coherence.min ||
            consciousness.coherence > this.DEFAULT_BOUNDS.coherence.max) {
            errors.push(`Coherence must be between ${this.DEFAULT_BOUNDS.coherence.min} and ${this.DEFAULT_BOUNDS.coherence.max}`);
        }

        // Validate behavioral state
        if (!this.isValidBehavioralState(consciousness.behavioralState)) {
            errors.push('Behavioral state is invalid or missing');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Check if behavioral state is valid
     * @param {Object} behavioralState - Behavioral state to validate
     * @returns {boolean} True if valid
     */
    isValidBehavioralState(behavioralState) {
        if (!behavioralState || typeof behavioralState !== 'object') {
            return false;
        }

        const requiredFields = ['energy', 'focus', 'mood', 'socialDrive', 'riskTolerance', 'ambition'];
        return requiredFields.every(field => behavioralState.hasOwnProperty(field));
    }

    /**
     * Validate and clamp frequency
     * @param {number} frequency - Frequency to validate
     * @returns {number} Validated frequency
     */
    validateFrequency(frequency) {
        if (typeof frequency !== 'number' || isNaN(frequency)) {
            return this.DEFAULT_BOUNDS.frequency.default;
        }
        return Math.max(this.DEFAULT_BOUNDS.frequency.min,
               Math.min(this.DEFAULT_BOUNDS.frequency.max, frequency));
    }

    /**
     * Validate and clamp coherence
     * @param {number} coherence - Coherence to validate
     * @returns {number} Validated coherence
     */
    validateCoherence(coherence) {
        if (typeof coherence !== 'number' || isNaN(coherence)) {
            return this.DEFAULT_BOUNDS.coherence.default;
        }
        return Math.max(this.DEFAULT_BOUNDS.coherence.min,
               Math.min(this.DEFAULT_BOUNDS.coherence.max, coherence));
    }

    /**
     * Clamp frequency to valid bounds
     * @param {number} frequency - Frequency to clamp
     * @returns {number} Clamped frequency
     */
    clampFrequency(frequency) {
        return Math.max(this.DEFAULT_BOUNDS.frequency.min,
               Math.min(this.DEFAULT_BOUNDS.frequency.max, frequency));
    }

    /**
     * Clamp coherence to valid bounds
     * @param {number} coherence - Coherence to clamp
     * @returns {number} Clamped coherence
     */
    clampCoherence(coherence) {
        return Math.max(this.DEFAULT_BOUNDS.coherence.min,
               Math.min(this.DEFAULT_BOUNDS.coherence.max, coherence));
    }

    /**
     * Generate default behavioral state
     * @returns {Object} Default behavioral state
     */
    generateDefaultBehavioralState() {
        return {
            energy: 'moderate',
            focus: 'balanced',
            mood: 'content',
            socialDrive: 0.6,
            riskTolerance: 0.5,
            ambition: 0.7
        };
    }

    /**
     * Generate behavioral state from consciousness parameters
     * @param {number} frequency - Consciousness frequency
     * @param {number} coherence - Consciousness coherence
     * @returns {Object} Generated behavioral state
     */
    generateBehavioralStateFromParameters(frequency, coherence) {
        return {
            energy: this.mapFrequencyToEnergy(frequency),
            focus: this.mapCoherenceToFocus(coherence),
            mood: this.calculateMoodFromState(frequency, coherence),
            socialDrive: Math.max(0, Math.min(1, (frequency - 4) / 8)),
            riskTolerance: Math.max(0, Math.min(1, (frequency - 6) / 6)),
            ambition: Math.max(0, Math.min(1, coherence * (frequency / 10)))
        };
    }

    /**
     * Map frequency to energy level
     * @param {number} frequency - Consciousness frequency
     * @returns {string} Energy level
     */
    mapFrequencyToEnergy(frequency) {
        if (frequency < 6) return 'low';
        if (frequency > 10) return 'high';
        return 'moderate';
    }

    /**
     * Map coherence to focus level
     * @param {number} coherence - Consciousness coherence
     * @returns {string} Focus level
     */
    mapCoherenceToFocus(coherence) {
        if (coherence < 0.5) return 'scattered';
        if (coherence > 0.8) return 'focused';
        return 'balanced';
    }

    /**
     * Calculate mood from frequency and coherence
     * @param {number} frequency - Consciousness frequency
     * @param {number} coherence - Consciousness coherence
     * @returns {string} Mood state
     */
    calculateMoodFromState(frequency, coherence) {
        const moodScore = (frequency / 15) + (coherence * 0.5);

        if (moodScore < 0.5) return 'depressed';
        if (moodScore < 0.75) return 'content';
        if (moodScore < 1.0) return 'optimistic';
        return 'excited';
    }

    /**
     * Clear error history
     */
    clearErrorHistory() {
        this.errorHistory = [];
    }

    /**
     * Get error history filtered by criteria
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered error history
     */
    getErrorHistory(filters = {}) {
        let filtered = [...this.errorHistory];

        if (filters.category) {
            filtered = filtered.filter(e => e.category === filters.category);
        }

        if (filters.severity) {
            filtered = filtered.filter(e => e.severity === filters.severity);
        }

        if (filters.characterId) {
            filtered = filtered.filter(e => e.characterId === filters.characterId);
        }

        if (filters.since) {
            filtered = filtered.filter(e => e.timestamp >= filters.since);
        }

        if (filters.limit) {
            filtered = filtered.slice(-filters.limit);
        }

        return filtered;
    }
}

export default ConsciousnessErrorHandlingService;