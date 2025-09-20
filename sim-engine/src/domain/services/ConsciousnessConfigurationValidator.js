/**
 * Consciousness Configuration Validator
 *
 * Provides comprehensive validation for consciousness configuration settings.
 * Validates configuration integrity, parameter relationships, and performance implications.
 */

import BaseDomainService from './BaseDomainService.js';

class ConsciousnessConfigurationValidator extends BaseDomainService {
    constructor(logger = null) {
        super();
        this.logger = logger;

        // Validation rule definitions
        this.validationRules = {
            // Parameter bounds validation
            parameterBounds: {
                frequency: { min: 0.1, max: 20.0, optimal: { min: 3.0, max: 15.0 } },
                coherence: { min: 0.0, max: 1.0, optimal: { min: 0.2, max: 1.0 } },
                significance: { min: 0.0, max: 1.0, optimal: { min: 0.1, max: 0.8 } },
                decisionFactor: { min: 0.01, max: 10.0, optimal: { min: 0.1, max: 3.0 } }
            },

            // Performance thresholds
            performance: {
                batchSize: { min: 10, max: 1000, optimal: { min: 50, max: 200 } },
                cacheTimeout: { min: 30000, max: 3600000, optimal: { min: 300000, max: 1800000 } },
                gcInterval: { min: 100, max: 10000, optimal: { min: 500, max: 2000 } },
                updateFrequencyLimit: { min: 1, max: 50, optimal: { min: 5, max: 15 } }
            },

            // Memory limits
            memory: {
                maxMemories: { min: 10, max: 200, optimal: { min: 30, max: 100 } },
                maxEvents: { min: 5, max: 100, optimal: { min: 10, max: 50 } },
                decayRate: { min: 0.01, max: 0.5, optimal: { min: 0.05, max: 0.2 } }
            },

            // Relationship constraints
            relationships: [
                {
                    name: 'frequency_bounds_order',
                    check: (config) => config.bounds.frequency.min < config.bounds.frequency.max,
                    message: 'Frequency minimum must be less than maximum'
                },
                {
                    name: 'coherence_bounds_order',
                    check: (config) => config.bounds.coherence.min < config.bounds.coherence.max,
                    message: 'Coherence minimum must be less than maximum'
                },
                {
                    name: 'decision_factor_bounds_order',
                    check: (config) => config.decisionFactors.min < config.decisionFactors.max,
                    message: 'Decision factor minimum must be less than maximum'
                },
                {
                    name: 'significance_threshold_consistency',
                    check: (config) => config.significance.updateThreshold >= config.significance.eventThreshold,
                    message: 'Update threshold should be greater than or equal to event threshold'
                },
                {
                    name: 'memory_limits_reasonable',
                    check: (config) => config.memory.maxMemoriesPerCharacter >= config.memory.maxEventsPerCharacter,
                    message: 'Maximum memories should be greater than or equal to maximum events'
                }
            ]
        };

        // Warning thresholds for performance implications
        this.warningThresholds = {
            highMemoryUsage: 150, // memories per character
            highUpdateFrequency: 20, // updates per character per turn
            lowSignificanceThreshold: 0.1, // may cause too many updates
            highSignificanceThreshold: 0.8, // may cause too few updates
            extremeDecisionFactors: { min: 0.05, max: 5.0 } // may cause erratic behavior
        };
    }

    /**
     * Validate complete configuration
     * @param {Object} config - Configuration to validate
     * @returns {Object} Comprehensive validation result
     */
    validateConfiguration(config) {
        const validationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            recommendations: [],
            sections: {}
        };

        try {
            // Validate each configuration section
            validationResult.sections.bounds = this.validateBounds(config.bounds);
            validationResult.sections.significance = this.validateSignificance(config.significance);
            validationResult.sections.decisionFactors = this.validateDecisionFactors(config.decisionFactors);
            validationResult.sections.memory = this.validateMemory(config.memory);
            validationResult.sections.performance = this.validatePerformance(config.performance);
            validationResult.sections.eventWeights = this.validateEventWeights(config.eventSignificanceWeights);
            validationResult.sections.updateRules = this.validateUpdateRules(config.updateRules);

            // Collect errors and warnings from sections
            Object.values(validationResult.sections).forEach(sectionResult => {
                if (sectionResult.errors) {
                    validationResult.errors.push(...sectionResult.errors);
                }
                if (sectionResult.warnings) {
                    validationResult.warnings.push(...sectionResult.warnings);
                }
                if (sectionResult.recommendations) {
                    validationResult.recommendations.push(...sectionResult.recommendations);
                }
            });

            // Validate cross-section relationships
            const relationshipValidation = this.validateRelationships(config);
            validationResult.errors.push(...relationshipValidation.errors);
            validationResult.warnings.push(...relationshipValidation.warnings);

            // Check performance implications
            const performanceAnalysis = this.analyzePerformanceImplications(config);
            validationResult.warnings.push(...performanceAnalysis.warnings);
            validationResult.recommendations.push(...performanceAnalysis.recommendations);

            // Set overall validity
            validationResult.isValid = validationResult.errors.length === 0;

            if (this.logger && validationResult.errors.length > 0) {
                this.logger.warn(`Configuration validation found ${validationResult.errors.length} errors`);
            }

        } catch (error) {
            validationResult.isValid = false;
            validationResult.errors.push(`Validation error: ${error.message}`);

            if (this.logger) {
                this.logger.error(`Configuration validation failed: ${error.message}`);
            }
        }

        return validationResult;
    }

    /**
     * Validate bounds configuration
     * @param {Object} bounds - Bounds configuration
     * @returns {Object} Validation result
     */
    validateBounds(bounds) {
        const result = { errors: [], warnings: [], recommendations: [] };

        if (!bounds) {
            result.errors.push('Bounds configuration is required');
            return result;
        }

        // Validate frequency bounds
        if (bounds.frequency) {
            const freq = bounds.frequency;
            const rules = this.validationRules.parameterBounds.frequency;

            if (typeof freq.min !== 'number' || freq.min < rules.min || freq.min > rules.max) {
                result.errors.push(`Frequency minimum must be between ${rules.min} and ${rules.max}`);
            }

            if (typeof freq.max !== 'number' || freq.max < rules.min || freq.max > rules.max) {
                result.errors.push(`Frequency maximum must be between ${rules.min} and ${rules.max}`);
            }

            if (freq.min >= freq.max) {
                result.errors.push('Frequency minimum must be less than maximum');
            }

            // Check optimal ranges
            if (freq.min < rules.optimal.min || freq.max > rules.optimal.max) {
                result.warnings.push(`Frequency bounds outside optimal range (${rules.optimal.min}-${rules.optimal.max})`);
            }
        }

        // Validate coherence bounds
        if (bounds.coherence) {
            const coh = bounds.coherence;
            const rules = this.validationRules.parameterBounds.coherence;

            if (typeof coh.min !== 'number' || coh.min < rules.min || coh.min > rules.max) {
                result.errors.push(`Coherence minimum must be between ${rules.min} and ${rules.max}`);
            }

            if (typeof coh.max !== 'number' || coh.max < rules.min || coh.max > rules.max) {
                result.errors.push(`Coherence maximum must be between ${rules.min} and ${rules.max}`);
            }

            if (coh.min >= coh.max) {
                result.errors.push('Coherence minimum must be less than maximum');
            }

            // Check optimal ranges
            if (coh.min < rules.optimal.min || coh.max > rules.optimal.max) {
                result.warnings.push(`Coherence bounds outside optimal range (${rules.optimal.min}-${rules.optimal.max})`);
            }
        }

        return result;
    }

    /**
     * Validate significance configuration
     * @param {Object} significance - Significance configuration
     * @returns {Object} Validation result
     */
    validateSignificance(significance) {
        const result = { errors: [], warnings: [], recommendations: [] };

        if (!significance) {
            result.errors.push('Significance configuration is required');
            return result;
        }

        const rules = this.validationRules.parameterBounds.significance;

        // Validate each threshold
        ['updateThreshold', 'memoryThreshold', 'eventThreshold'].forEach(threshold => {
            const value = significance[threshold];
            
            if (typeof value !== 'number' || value < rules.min || value > rules.max) {
                result.errors.push(`${threshold} must be between ${rules.min} and ${rules.max}`);
            } else {
                // Check for performance implications
                if (value < this.warningThresholds.lowSignificanceThreshold) {
                    result.warnings.push(`${threshold} is very low (${value}), may cause excessive updates`);
                    result.recommendations.push(`Consider increasing ${threshold} to improve performance`);
                }

                if (value > this.warningThresholds.highSignificanceThreshold) {
                    result.warnings.push(`${threshold} is very high (${value}), may cause too few updates`);
                    result.recommendations.push(`Consider decreasing ${threshold} for more responsive behavior`);
                }
            }
        });

        return result;
    }

    /**
     * Validate decision factors configuration
     * @param {Object} decisionFactors - Decision factors configuration
     * @returns {Object} Validation result
     */
    validateDecisionFactors(decisionFactors) {
        const result = { errors: [], warnings: [], recommendations: [] };

        if (!decisionFactors) {
            result.errors.push('Decision factors configuration is required');
            return result;
        }

        const rules = this.validationRules.parameterBounds.decisionFactor;

        if (typeof decisionFactors.min !== 'number' || 
            decisionFactors.min < rules.min || decisionFactors.min > rules.max) {
            result.errors.push(`Decision factor minimum must be between ${rules.min} and ${rules.max}`);
        }

        if (typeof decisionFactors.max !== 'number' || 
            decisionFactors.max < rules.min || decisionFactors.max > rules.max) {
            result.errors.push(`Decision factor maximum must be between ${rules.min} and ${rules.max}`);
        }

        if (decisionFactors.min >= decisionFactors.max) {
            result.errors.push('Decision factor minimum must be less than maximum');
        }

        // Check for extreme values that may cause erratic behavior
        const extreme = this.warningThresholds.extremeDecisionFactors;
        if (decisionFactors.min < extreme.min || decisionFactors.max > extreme.max) {
            result.warnings.push('Extreme decision factor bounds may cause erratic NPC behavior');
            result.recommendations.push('Consider using more moderate decision factor bounds for stable behavior');
        }

        return result;
    }

    /**
     * Validate memory configuration
     * @param {Object} memory - Memory configuration
     * @returns {Object} Validation result
     */
    validateMemory(memory) {
        const result = { errors: [], warnings: [], recommendations: [] };

        if (!memory) {
            result.errors.push('Memory configuration is required');
            return result;
        }

        const rules = this.validationRules.memory;

        // Validate memory limits
        if (!Number.isInteger(memory.maxMemoriesPerCharacter) || 
            memory.maxMemoriesPerCharacter < rules.maxMemories.min || 
            memory.maxMemoriesPerCharacter > rules.maxMemories.max) {
            result.errors.push(`Max memories per character must be an integer between ${rules.maxMemories.min} and ${rules.maxMemories.max}`);
        }

        if (!Number.isInteger(memory.maxEventsPerCharacter) || 
            memory.maxEventsPerCharacter < rules.maxEvents.min || 
            memory.maxEventsPerCharacter > rules.maxEvents.max) {
            result.errors.push(`Max events per character must be an integer between ${rules.maxEvents.min} and ${rules.maxEvents.max}`);
        }

        // Validate decay rates
        if (typeof memory.significanceDecayRate !== 'number' || 
            memory.significanceDecayRate < rules.decayRate.min || 
            memory.significanceDecayRate > rules.decayRate.max) {
            result.errors.push(`Significance decay rate must be between ${rules.decayRate.min} and ${rules.decayRate.max}`);
        }

        // Check for high memory usage
        if (memory.maxMemoriesPerCharacter > this.warningThresholds.highMemoryUsage) {
            result.warnings.push('High memory limit may impact performance with large NPC populations');
            result.recommendations.push('Consider reducing memory limits for better performance');
        }

        return result;
    }

    /**
     * Validate performance configuration
     * @param {Object} performance - Performance configuration
     * @returns {Object} Validation result
     */
    validatePerformance(performance) {
        const result = { errors: [], warnings: [], recommendations: [] };

        if (!performance) {
            result.errors.push('Performance configuration is required');
            return result;
        }

        const rules = this.validationRules.performance;

        // Validate batch size
        if (!Number.isInteger(performance.batchSize) || 
            performance.batchSize < rules.batchSize.min || 
            performance.batchSize > rules.batchSize.max) {
            result.errors.push(`Batch size must be an integer between ${rules.batchSize.min} and ${rules.batchSize.max}`);
        }

        // Validate cache timeout
        if (!Number.isInteger(performance.cacheTimeout) || 
            performance.cacheTimeout < rules.cacheTimeout.min || 
            performance.cacheTimeout > rules.cacheTimeout.max) {
            result.errors.push(`Cache timeout must be an integer between ${rules.cacheTimeout.min} and ${rules.cacheTimeout.max}`);
        }

        // Validate garbage collection interval
        if (!Number.isInteger(performance.garbageCollectionInterval) || 
            performance.garbageCollectionInterval < rules.gcInterval.min || 
            performance.garbageCollectionInterval > rules.gcInterval.max) {
            result.errors.push(`GC interval must be an integer between ${rules.gcInterval.min} and ${rules.gcInterval.max}`);
        }

        // Validate update frequency limit
        if (!Number.isInteger(performance.updateFrequencyLimit) || 
            performance.updateFrequencyLimit < rules.updateFrequencyLimit.min || 
            performance.updateFrequencyLimit > rules.updateFrequencyLimit.max) {
            result.errors.push(`Update frequency limit must be an integer between ${rules.updateFrequencyLimit.min} and ${rules.updateFrequencyLimit.max}`);
        }

        return result;
    }

    /**
     * Validate event significance weights
     * @param {Object} eventWeights - Event significance weights
     * @returns {Object} Validation result
     */
    validateEventWeights(eventWeights) {
        const result = { errors: [], warnings: [], recommendations: [] };

        if (!eventWeights || typeof eventWeights !== 'object') {
            result.errors.push('Event significance weights configuration is required');
            return result;
        }

        const rules = this.validationRules.parameterBounds.significance;

        Object.entries(eventWeights).forEach(([eventType, weight]) => {
            if (typeof weight !== 'number' || weight < rules.min || weight > rules.max) {
                result.errors.push(`Event weight for ${eventType} must be between ${rules.min} and ${rules.max}`);
            }
        });

        // Check for missing common event types
        const commonEventTypes = [
            'goal_completion', 'goal_failure', 'social_success', 'social_failure',
            'conflict', 'traumatic_encounter', 'economic_gain', 'economic_loss'
        ];

        const missingTypes = commonEventTypes.filter(type => !(type in eventWeights));
        if (missingTypes.length > 0) {
            result.warnings.push(`Missing weights for common event types: ${missingTypes.join(', ')}`);
            result.recommendations.push('Consider adding weights for all common event types');
        }

        return result;
    }

    /**
     * Validate consciousness update rules
     * @param {Object} updateRules - Update rules configuration
     * @returns {Object} Validation result
     */
    validateUpdateRules(updateRules) {
        const result = { errors: [], warnings: [], recommendations: [] };

        if (!updateRules || typeof updateRules !== 'object') {
            result.errors.push('Update rules configuration is required');
            return result;
        }

        Object.entries(updateRules).forEach(([eventType, rule]) => {
            if (!rule || typeof rule !== 'object') {
                result.errors.push(`Update rule for ${eventType} must be an object`);
                return;
            }

            // Validate frequency change
            if (typeof rule.frequency !== 'number' || Math.abs(rule.frequency) > 5) {
                result.errors.push(`Frequency change for ${eventType} must be between -5 and 5`);
            }

            // Validate coherence change
            if (typeof rule.coherence !== 'number' || Math.abs(rule.coherence) > 1) {
                result.errors.push(`Coherence change for ${eventType} must be between -1 and 1`);
            }

            // Check for extreme changes
            if (Math.abs(rule.frequency) > 2 || Math.abs(rule.coherence) > 0.5) {
                result.warnings.push(`Large parameter changes for ${eventType} may cause unstable behavior`);
            }
        });

        return result;
    }

    /**
     * Validate cross-section relationships
     * @param {Object} config - Complete configuration
     * @returns {Object} Validation result
     */
    validateRelationships(config) {
        const result = { errors: [], warnings: [] };

        this.validationRules.relationships.forEach(rule => {
            try {
                if (!rule.check(config)) {
                    result.errors.push(rule.message);
                }
            } catch (error) {
                result.errors.push(`Relationship validation error for ${rule.name}: ${error.message}`);
            }
        });

        return result;
    }

    /**
     * Analyze performance implications of configuration
     * @param {Object} config - Configuration to analyze
     * @returns {Object} Performance analysis
     */
    analyzePerformanceImplications(config) {
        const result = { warnings: [], recommendations: [] };

        // Analyze memory usage implications
        const memoryPerCharacter = config.memory.maxMemoriesPerCharacter + config.memory.maxEventsPerCharacter;
        if (memoryPerCharacter > 100) {
            result.warnings.push('High memory usage per character may impact performance with large populations');
            result.recommendations.push('Consider reducing memory limits or implementing more aggressive cleanup');
        }

        // Analyze update frequency implications
        const lowThreshold = config.significance.updateThreshold < 0.2;
        const highBatchSize = config.performance.batchSize > 500;
        
        if (lowThreshold && highBatchSize) {
            result.warnings.push('Combination of low significance threshold and high batch size may cause performance issues');
            result.recommendations.push('Either increase significance threshold or reduce batch size');
        }

        // Analyze cache efficiency
        const shortCacheTimeout = config.performance.cacheTimeout < 120000; // 2 minutes
        if (shortCacheTimeout) {
            result.warnings.push('Short cache timeout may reduce performance benefits of behavioral state caching');
            result.recommendations.push('Consider increasing cache timeout for better performance');
        }

        // Analyze garbage collection frequency
        const infrequentGC = config.performance.garbageCollectionInterval > 5000;
        if (infrequentGC && memoryPerCharacter > 80) {
            result.warnings.push('Infrequent garbage collection with high memory usage may cause memory bloat');
            result.recommendations.push('Increase garbage collection frequency or reduce memory limits');
        }

        return result;
    }

    /**
     * Generate configuration health report
     * @param {Object} config - Configuration to analyze
     * @returns {Object} Health report
     */
    generateHealthReport(config) {
        const validation = this.validateConfiguration(config);
        
        const healthScore = this.calculateHealthScore(validation);
        const criticalIssues = validation.errors.length;
        const warnings = validation.warnings.length;
        const recommendations = validation.recommendations.length;

        return {
            healthScore,
            status: this.getHealthStatus(healthScore),
            summary: {
                criticalIssues,
                warnings,
                recommendations,
                sectionsValidated: Object.keys(validation.sections).length
            },
            details: validation,
            timestamp: Date.now()
        };
    }

    /**
     * Calculate configuration health score
     * @param {Object} validation - Validation result
     * @returns {number} Health score (0-100)
     */
    calculateHealthScore(validation) {
        let score = 100;

        // Deduct points for errors (critical issues)
        score -= validation.errors.length * 20;

        // Deduct points for warnings
        score -= validation.warnings.length * 5;

        // Bonus points for having recommendations (shows system is analyzing)
        score += Math.min(validation.recommendations.length * 2, 10);

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Get health status based on score
     * @param {number} score - Health score
     * @returns {string} Health status
     */
    getHealthStatus(score) {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'fair';
        if (score >= 40) return 'poor';
        return 'critical';
    }

    /**
     * Get validation rule information
     * @returns {Object} Validation rules documentation
     */
    getValidationRules() {
        return {
            parameterBounds: { ...this.validationRules.parameterBounds },
            performance: { ...this.validationRules.performance },
            memory: { ...this.validationRules.memory },
            relationships: this.validationRules.relationships.map(rule => ({
                name: rule.name,
                message: rule.message
            })),
            warningThresholds: { ...this.warningThresholds }
        };
    }
}

export default ConsciousnessConfigurationValidator;