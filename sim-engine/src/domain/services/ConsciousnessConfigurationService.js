/**
 * Consciousness Configuration Service
 *
 * Provides configuration management for consciousness parameters, significance thresholds,
 * behavioral state mappings, and tuning utilities for the consciousness system.
 * Supports runtime configuration updates and validation.
 */

import BaseDomainService from './BaseDomainService.js';

class ConsciousnessConfigurationService extends BaseDomainService {
    constructor(logger = null) {
        super();
        this.logger = logger;

        // Default consciousness configuration
        this.config = {
            // Consciousness parameter bounds
            bounds: {
                frequency: {
                    min: 3.0,
                    max: 15.0,
                    default: 7.5,
                    description: 'Consciousness frequency in Hz (3-15 range)'
                },
                coherence: {
                    min: 0.2,
                    max: 1.0,
                    default: 0.7,
                    description: 'Consciousness coherence (0.2-1.0 range)'
                }
            },

            // Significance thresholds
            significance: {
                updateThreshold: 0.3,
                memoryThreshold: 0.3,
                eventThreshold: 0.2,
                description: 'Minimum significance values for triggering updates'
            },

            // Behavioral state mapping configuration
            behavioralMapping: {
                energy: {
                    low: { min: 0.0, max: 0.4, frequency: { min: 3.0, max: 6.0 } },
                    moderate: { min: 0.4, max: 0.7, frequency: { min: 6.0, max: 10.0 } },
                    high: { min: 0.7, max: 1.0, frequency: { min: 10.0, max: 15.0 } }
                },
                focus: {
                    scattered: { min: 0.0, max: 0.4, coherence: { min: 0.2, max: 0.5 } },
                    balanced: { min: 0.4, max: 0.7, coherence: { min: 0.5, max: 0.8 } },
                    focused: { min: 0.7, max: 1.0, coherence: { min: 0.8, max: 1.0 } }
                },
                mood: {
                    depressed: { min: 0.0, max: 0.3, frequency: { min: 3.0, max: 5.0 } },
                    content: { min: 0.3, max: 0.7, frequency: { min: 5.0, max: 10.0 } },
                    optimistic: { min: 0.7, max: 0.9, frequency: { min: 8.0, max: 12.0 } },
                    excited: { min: 0.9, max: 1.0, frequency: { min: 12.0, max: 15.0 } }
                }
            },

            // Decision factor bounds
            decisionFactors: {
                min: 0.1,
                max: 3.0,
                default: 1.0,
                description: 'Bounds for behavioral decision factors'
            },

            // Memory management configuration
            memory: {
                maxMemoriesPerCharacter: 50,
                maxEventsPerCharacter: 20,
                significanceDecayRate: 0.1,
                recencyWeightDecay: 0.2,
                description: 'Memory storage and decay parameters'
            },

            // Performance tuning parameters
            performance: {
                batchSize: 100,
                updateFrequencyLimit: 10, // Max updates per character per turn
                cacheTimeout: 300000, // 5 minutes in milliseconds
                garbageCollectionInterval: 1000, // Every 1000 turns
                description: 'Performance optimization parameters'
            },

            // Event type significance weights
            eventSignificanceWeights: {
                goal_completion: 0.8,
                goal_failure: 0.7,
                social_interaction_major: 0.6,
                traumatic_encounter: 1.0,
                relationship_change_major: 0.5,
                life_change_event: 0.9,
                conflict_resolution: 0.6,
                resource_gain_major: 0.4,
                resource_loss_major: 0.5,
                birth: 0.9,
                death: 0.8,
                marriage: 0.7,
                discovery: 0.6,
                skill_improvement: 0.4,
                social_success: 0.6,
                social_failure: 0.5,
                conflict: 0.7
            },

            // Consciousness update rules
            updateRules: {
                goal_completion: { frequency: +0.3, coherence: +0.05 },
                goal_failure: { frequency: -0.5, coherence: -0.1 },
                goal_progress: { frequency: +0.1, coherence: +0.02 },
                social_success: { frequency: +0.2, coherence: +0.03 },
                social_failure: { frequency: -0.3, coherence: -0.05 },
                relationship_change: { frequency: +0.4, coherence: +0.06 },
                conflict: { frequency: +0.6, coherence: -0.1 },
                betrayal: { frequency: -0.8, coherence: -0.15 },
                traumatic_encounter: { frequency: -1.0, coherence: -0.2 },
                economic_gain: { frequency: +0.2, coherence: +0.03 },
                economic_loss: { frequency: -0.4, coherence: -0.07 },
                birth: { frequency: +0.5, coherence: +0.1 },
                death: { frequency: -0.7, coherence: -0.12 },
                marriage: { frequency: +0.6, coherence: +0.08 },
                discovery: { frequency: +0.4, coherence: +0.06 },
                skill_improvement: { frequency: +0.2, coherence: +0.04 }
            }
        };

        // Configuration validation rules
        this.validationRules = {
            bounds: {
                frequency: (value) => typeof value === 'number' && value >= 0 && value <= 20,
                coherence: (value) => typeof value === 'number' && value >= 0 && value <= 1
            },
            significance: (value) => typeof value === 'number' && value >= 0 && value <= 1,
            decisionFactor: (value) => typeof value === 'number' && value >= 0.01 && value <= 10,
            memory: (value) => typeof value === 'number' && Number.isInteger(value) && value > 0,
            performance: (value) => typeof value === 'number' && Number.isInteger(value) && value > 0
        };
    }

    /**
     * Get current configuration
     * @param {string} section - Optional section to retrieve (bounds, significance, etc.)
     * @returns {Object} Configuration object or section
     */
    getConfiguration(section = null) {
        if (section) {
            return this.config[section] ? { ...this.config[section] } : null;
        }
        return JSON.parse(JSON.stringify(this.config));
    }

    /**
     * Update configuration section
     * @param {string} section - Configuration section to update
     * @param {Object} updates - Updates to apply
     * @returns {Object} Update result with validation
     */
    updateConfiguration(section, updates) {
        try {
            if (!this.config[section]) {
                return {
                    success: false,
                    errors: [`Unknown configuration section: ${section}`],
                    section,
                    updates
                };
            }

            // Validate updates
            const validationResult = this.validateConfigurationUpdates(section, updates);
            if (!validationResult.isValid) {
                return {
                    success: false,
                    errors: validationResult.errors,
                    section,
                    updates
                };
            }

            // Apply updates
            const originalConfig = { ...this.config[section] };
            this.config[section] = { ...this.config[section], ...updates };

            if (this.logger) {
                this.logger.info(`Configuration updated for section ${section}:`, updates);
            }

            return {
                success: true,
                section,
                originalConfig,
                newConfig: { ...this.config[section] },
                updates
            };

        } catch (error) {
            if (this.logger) {
                this.logger.error(`Error updating configuration: ${error.message}`);
            }

            return {
                success: false,
                error: error.message,
                errors: [error.message],
                section,
                updates
            };
        }
    }

    /**
     * Validate configuration updates
     * @param {string} section - Configuration section
     * @param {Object} updates - Updates to validate
     * @returns {Object} Validation result
     */
    validateConfigurationUpdates(section, updates) {
        const errors = [];

        switch (section) {
            case 'bounds':
                this.validateBoundsUpdates(updates, errors);
                break;
            case 'significance':
                this.validateSignificanceUpdates(updates, errors);
                break;
            case 'decisionFactors':
                this.validateDecisionFactorUpdates(updates, errors);
                break;
            case 'memory':
                this.validateMemoryUpdates(updates, errors);
                break;
            case 'performance':
                this.validatePerformanceUpdates(updates, errors);
                break;
            case 'eventSignificanceWeights':
                this.validateEventWeightUpdates(updates, errors);
                break;
            case 'updateRules':
                this.validateUpdateRuleUpdates(updates, errors);
                break;
            default:
                errors.push(`Unknown configuration section: ${section}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate bounds configuration updates
     * @param {Object} updates - Updates to validate
     * @param {Array} errors - Error array to populate
     */
    validateBoundsUpdates(updates, errors) {
        if (updates.frequency) {
            if (updates.frequency.min !== undefined && !this.validationRules.bounds.frequency(updates.frequency.min)) {
                errors.push('Frequency minimum must be a number between 0 and 20');
            }
            if (updates.frequency.max !== undefined && !this.validationRules.bounds.frequency(updates.frequency.max)) {
                errors.push('Frequency maximum must be a number between 0 and 20');
            }
            if (updates.frequency.min !== undefined && updates.frequency.max !== undefined && 
                updates.frequency.min >= updates.frequency.max) {
                errors.push('Frequency minimum must be less than maximum');
            }
        }

        if (updates.coherence) {
            if (updates.coherence.min !== undefined && !this.validationRules.bounds.coherence(updates.coherence.min)) {
                errors.push('Coherence minimum must be a number between 0 and 1');
            }
            if (updates.coherence.max !== undefined && !this.validationRules.bounds.coherence(updates.coherence.max)) {
                errors.push('Coherence maximum must be a number between 0 and 1');
            }
            if (updates.coherence.min !== undefined && updates.coherence.max !== undefined && 
                updates.coherence.min >= updates.coherence.max) {
                errors.push('Coherence minimum must be less than maximum');
            }
        }
    }

    /**
     * Validate significance configuration updates
     * @param {Object} updates - Updates to validate
     * @param {Array} errors - Error array to populate
     */
    validateSignificanceUpdates(updates, errors) {
        Object.entries(updates).forEach(([key, value]) => {
            if (key !== 'description' && !this.validationRules.significance(value)) {
                errors.push(`${key} must be a number between 0 and 1`);
            }
        });
    }

    /**
     * Validate decision factor configuration updates
     * @param {Object} updates - Updates to validate
     * @param {Array} errors - Error array to populate
     */
    validateDecisionFactorUpdates(updates, errors) {
        if (updates.min !== undefined && !this.validationRules.decisionFactor(updates.min)) {
            errors.push('Decision factor minimum must be a positive number');
        }
        if (updates.max !== undefined && !this.validationRules.decisionFactor(updates.max)) {
            errors.push('Decision factor maximum must be a positive number');
        }
        if (updates.min !== undefined && updates.max !== undefined && updates.min >= updates.max) {
            errors.push('Decision factor minimum must be less than maximum');
        }
    }

    /**
     * Validate memory configuration updates
     * @param {Object} updates - Updates to validate
     * @param {Array} errors - Error array to populate
     */
    validateMemoryUpdates(updates, errors) {
        Object.entries(updates).forEach(([key, value]) => {
            if (key.includes('max') || key.includes('Interval')) {
                if (!this.validationRules.memory(value)) {
                    errors.push(`${key} must be a positive integer`);
                }
            } else if (key.includes('Rate') || key.includes('Decay')) {
                if (!this.validationRules.significance(value)) {
                    errors.push(`${key} must be a number between 0 and 1`);
                }
            }
        });
    }

    /**
     * Validate performance configuration updates
     * @param {Object} updates - Updates to validate
     * @param {Array} errors - Error array to populate
     */
    validatePerformanceUpdates(updates, errors) {
        Object.entries(updates).forEach(([key, value]) => {
            if (key !== 'description' && !this.validationRules.performance(value)) {
                errors.push(`${key} must be a positive integer`);
            }
        });
    }

    /**
     * Validate event significance weight updates
     * @param {Object} updates - Updates to validate
     * @param {Array} errors - Error array to populate
     */
    validateEventWeightUpdates(updates, errors) {
        Object.entries(updates).forEach(([eventType, weight]) => {
            if (!this.validationRules.significance(weight)) {
                errors.push(`Event weight for ${eventType} must be a number between 0 and 1`);
            }
        });
    }

    /**
     * Validate update rule updates
     * @param {Object} updates - Updates to validate
     * @param {Array} errors - Error array to populate
     */
    validateUpdateRuleUpdates(updates, errors) {
        Object.entries(updates).forEach(([eventType, rule]) => {
            if (!rule || typeof rule !== 'object') {
                errors.push(`Update rule for ${eventType} must be an object`);
                return;
            }

            if (typeof rule.frequency !== 'number' || Math.abs(rule.frequency) > 5) {
                errors.push(`Frequency change for ${eventType} must be a number between -5 and 5`);
            }

            if (typeof rule.coherence !== 'number' || Math.abs(rule.coherence) > 1) {
                errors.push(`Coherence change for ${eventType} must be a number between -1 and 1`);
            }
        });
    }

    /**
     * Reset configuration to defaults
     * @param {string} section - Optional section to reset (resets all if not specified)
     * @returns {Object} Reset result
     */
    resetConfiguration(section = null) {
        try {
            const originalConfig = JSON.parse(JSON.stringify(this.config));

            if (section) {
                if (!this.config[section]) {
                    throw new Error(`Unknown configuration section: ${section}`);
                }

                // Reset specific section to default
                this.config[section] = this.getDefaultConfiguration()[section];

                if (this.logger) {
                    this.logger.info(`Configuration section ${section} reset to defaults`);
                }

                return {
                    success: true,
                    section,
                    originalConfig: originalConfig[section],
                    newConfig: { ...this.config[section] }
                };
            } else {
                // Reset entire configuration
                this.config = this.getDefaultConfiguration();

                if (this.logger) {
                    this.logger.info('All configuration reset to defaults');
                }

                return {
                    success: true,
                    section: 'all',
                    originalConfig,
                    newConfig: JSON.parse(JSON.stringify(this.config))
                };
            }

        } catch (error) {
            if (this.logger) {
                this.logger.error(`Error resetting configuration: ${error.message}`);
            }

            return {
                success: false,
                error: error.message,
                section
            };
        }
    }

    /**
     * Get default configuration
     * @returns {Object} Default configuration object
     */
    getDefaultConfiguration() {
        // Return a deep copy of the original default configuration
        return {
            bounds: {
                frequency: { min: 3.0, max: 15.0, default: 7.5 },
                coherence: { min: 0.2, max: 1.0, default: 0.7 }
            },
            significance: {
                updateThreshold: 0.3,
                memoryThreshold: 0.3,
                eventThreshold: 0.2
            },
            behavioralMapping: {
                energy: {
                    low: { min: 0.0, max: 0.4, frequency: { min: 3.0, max: 6.0 } },
                    moderate: { min: 0.4, max: 0.7, frequency: { min: 6.0, max: 10.0 } },
                    high: { min: 0.7, max: 1.0, frequency: { min: 10.0, max: 15.0 } }
                },
                focus: {
                    scattered: { min: 0.0, max: 0.4, coherence: { min: 0.2, max: 0.5 } },
                    balanced: { min: 0.4, max: 0.7, coherence: { min: 0.5, max: 0.8 } },
                    focused: { min: 0.7, max: 1.0, coherence: { min: 0.8, max: 1.0 } }
                },
                mood: {
                    depressed: { min: 0.0, max: 0.3, frequency: { min: 3.0, max: 5.0 } },
                    content: { min: 0.3, max: 0.7, frequency: { min: 5.0, max: 10.0 } },
                    optimistic: { min: 0.7, max: 0.9, frequency: { min: 8.0, max: 12.0 } },
                    excited: { min: 0.9, max: 1.0, frequency: { min: 12.0, max: 15.0 } }
                }
            },
            decisionFactors: { min: 0.1, max: 3.0, default: 1.0 },
            memory: {
                maxMemoriesPerCharacter: 50,
                maxEventsPerCharacter: 20,
                significanceDecayRate: 0.1,
                recencyWeightDecay: 0.2
            },
            performance: {
                batchSize: 100,
                updateFrequencyLimit: 10,
                cacheTimeout: 300000,
                garbageCollectionInterval: 1000
            },
            eventSignificanceWeights: {
                goal_completion: 0.8,
                goal_failure: 0.7,
                social_interaction_major: 0.6,
                traumatic_encounter: 1.0,
                relationship_change_major: 0.5,
                life_change_event: 0.9,
                conflict_resolution: 0.6,
                resource_gain_major: 0.4,
                resource_loss_major: 0.5,
                birth: 0.9,
                death: 0.8,
                marriage: 0.7,
                discovery: 0.6,
                skill_improvement: 0.4,
                social_success: 0.6,
                social_failure: 0.5,
                conflict: 0.7
            },
            updateRules: {
                goal_completion: { frequency: +0.3, coherence: +0.05 },
                goal_failure: { frequency: -0.5, coherence: -0.1 },
                goal_progress: { frequency: +0.1, coherence: +0.02 },
                social_success: { frequency: +0.2, coherence: +0.03 },
                social_failure: { frequency: -0.3, coherence: -0.05 },
                relationship_change: { frequency: +0.4, coherence: +0.06 },
                conflict: { frequency: +0.6, coherence: -0.1 },
                betrayal: { frequency: -0.8, coherence: -0.15 },
                traumatic_encounter: { frequency: -1.0, coherence: -0.2 },
                economic_gain: { frequency: +0.2, coherence: +0.03 },
                economic_loss: { frequency: -0.4, coherence: -0.07 },
                birth: { frequency: +0.5, coherence: +0.1 },
                death: { frequency: -0.7, coherence: -0.12 },
                marriage: { frequency: +0.6, coherence: +0.08 },
                discovery: { frequency: +0.4, coherence: +0.06 },
                skill_improvement: { frequency: +0.2, coherence: +0.04 }
            }
        };
    }

    /**
     * Export configuration to JSON
     * @param {string} section - Optional section to export
     * @returns {string} JSON string of configuration
     */
    exportConfiguration(section = null) {
        const configToExport = section ? this.config[section] : this.config;
        return JSON.stringify(configToExport, null, 2);
    }

    /**
     * Import configuration from JSON
     * @param {string} jsonConfig - JSON configuration string
     * @param {string} section - Optional section to import to
     * @returns {Object} Import result
     */
    importConfiguration(jsonConfig, section = null) {
        try {
            const parsedConfig = JSON.parse(jsonConfig);

            if (section) {
                // Import to specific section
                const validationResult = this.validateConfigurationUpdates(section, parsedConfig);
                if (!validationResult.isValid) {
                    return {
                        success: false,
                        errors: validationResult.errors,
                        section
                    };
                }

                const originalConfig = { ...this.config[section] };
                this.config[section] = parsedConfig;

                return {
                    success: true,
                    section,
                    originalConfig,
                    newConfig: { ...this.config[section] }
                };
            } else {
                // Import entire configuration
                const originalConfig = JSON.parse(JSON.stringify(this.config));
                
                // Validate each section
                const allErrors = [];
                Object.entries(parsedConfig).forEach(([sectionName, sectionConfig]) => {
                    const validationResult = this.validateConfigurationUpdates(sectionName, sectionConfig);
                    if (!validationResult.isValid) {
                        allErrors.push(...validationResult.errors.map(error => `${sectionName}: ${error}`));
                    }
                });

                if (allErrors.length > 0) {
                    return {
                        success: false,
                        errors: allErrors
                    };
                }

                this.config = parsedConfig;

                return {
                    success: true,
                    section: 'all',
                    originalConfig,
                    newConfig: JSON.parse(JSON.stringify(this.config))
                };
            }

        } catch (error) {
            return {
                success: false,
                error: `Invalid JSON: ${error.message}`
            };
        }
    }

    /**
     * Get tuning recommendations based on performance metrics
     * @param {Object} performanceMetrics - Performance data
     * @returns {Object} Tuning recommendations
     */
    getTuningRecommendations(performanceMetrics) {
        const recommendations = [];

        // Analyze turn processing time
        if (performanceMetrics.averageTurnTime > 5000) { // 5 seconds
            recommendations.push({
                type: 'performance',
                issue: 'Slow turn processing',
                recommendation: 'Reduce batch size or increase significance thresholds',
                suggestedChanges: {
                    'performance.batchSize': Math.max(50, this.config.performance.batchSize * 0.8),
                    'significance.updateThreshold': Math.min(0.5, this.config.significance.updateThreshold + 0.1)
                }
            });
        }

        // Analyze memory usage
        if (performanceMetrics.memoryUsage > 0.8) { // 80% memory usage
            recommendations.push({
                type: 'memory',
                issue: 'High memory usage',
                recommendation: 'Reduce memory limits and increase garbage collection frequency',
                suggestedChanges: {
                    'memory.maxMemoriesPerCharacter': Math.max(25, this.config.memory.maxMemoriesPerCharacter * 0.8),
                    'memory.maxEventsPerCharacter': Math.max(10, this.config.memory.maxEventsPerCharacter * 0.8),
                    'performance.garbageCollectionInterval': Math.max(500, this.config.performance.garbageCollectionInterval * 0.8)
                }
            });
        }

        // Analyze update frequency
        if (performanceMetrics.averageUpdatesPerCharacter > 8) {
            recommendations.push({
                type: 'updates',
                issue: 'Too many consciousness updates',
                recommendation: 'Increase significance thresholds to reduce update frequency',
                suggestedChanges: {
                    'significance.updateThreshold': Math.min(0.6, this.config.significance.updateThreshold + 0.1),
                    'significance.eventThreshold': Math.min(0.4, this.config.significance.eventThreshold + 0.1)
                }
            });
        }

        // Analyze behavioral consistency
        if (performanceMetrics.behavioralInconsistency > 0.3) {
            recommendations.push({
                type: 'behavior',
                issue: 'Inconsistent NPC behavior',
                recommendation: 'Reduce decision factor bounds for more stable behavior',
                suggestedChanges: {
                    'decisionFactors.max': Math.max(2.0, this.config.decisionFactors.max * 0.9),
                    'decisionFactors.min': Math.max(0.2, this.config.decisionFactors.min * 1.1)
                }
            });
        }

        return {
            recommendations,
            currentConfig: this.getConfiguration(),
            performanceMetrics,
            timestamp: Date.now()
        };
    }

    /**
     * Apply tuning recommendations
     * @param {Array} recommendations - Recommendations to apply
     * @returns {Object} Application result
     */
    applyTuningRecommendations(recommendations) {
        const results = [];
        let overallSuccess = true;

        recommendations.forEach(recommendation => {
            if (recommendation.suggestedChanges) {
                Object.entries(recommendation.suggestedChanges).forEach(([path, value]) => {
                    const [section, key] = path.split('.');
                    const updateResult = this.updateConfiguration(section, { [key]: value });
                    
                    results.push({
                        recommendation: recommendation.type,
                        path,
                        value,
                        success: updateResult.success,
                        error: updateResult.error
                    });

                    if (!updateResult.success) {
                        overallSuccess = false;
                    }
                });
            }
        });

        return {
            success: overallSuccess,
            results,
            appliedRecommendations: recommendations.length,
            timestamp: Date.now()
        };
    }

    /**
     * Get configuration summary for debugging
     * @returns {Object} Configuration summary
     */
    getConfigurationSummary() {
        return {
            bounds: {
                frequency: `${this.config.bounds.frequency.min}-${this.config.bounds.frequency.max} Hz`,
                coherence: `${this.config.bounds.coherence.min}-${this.config.bounds.coherence.max}`
            },
            thresholds: {
                update: this.config.significance.updateThreshold,
                memory: this.config.significance.memoryThreshold,
                event: this.config.significance.eventThreshold
            },
            limits: {
                memories: this.config.memory.maxMemoriesPerCharacter,
                events: this.config.memory.maxEventsPerCharacter,
                decisionFactor: `${this.config.decisionFactors.min}-${this.config.decisionFactors.max}x`
            },
            performance: {
                batchSize: this.config.performance.batchSize,
                cacheTimeout: `${this.config.performance.cacheTimeout / 1000}s`,
                gcInterval: this.config.performance.garbageCollectionInterval
            },
            eventTypes: Object.keys(this.config.eventSignificanceWeights).length,
            updateRules: Object.keys(this.config.updateRules).length
        };
    }
}

export default ConsciousnessConfigurationService;