/**
 * Tests for ConsciousnessConfigurationValidator
 * 
 * Comprehensive test suite covering configuration validation, health reporting,
 * performance analysis, and validation rule enforcement.
 */

import ConsciousnessConfigurationValidator from '../ConsciousnessConfigurationValidator.js';
import ConsciousnessConfigurationService from '../ConsciousnessConfigurationService.js';

describe('ConsciousnessConfigurationValidator', () => {
    let validator;
    let configService;
    let mockLogger;

    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };
        validator = new ConsciousnessConfigurationValidator(mockLogger);
        configService = new ConsciousnessConfigurationService();
    });

    describe('Configuration Validation', () => {
        test('should validate complete valid configuration', () => {
            const config = configService.getConfiguration();
            const result = validator.validateConfiguration(config);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.sections).toHaveProperty('bounds');
            expect(result.sections).toHaveProperty('significance');
            expect(result.sections).toHaveProperty('decisionFactors');
        });

        test('should detect invalid frequency bounds', () => {
            const config = configService.getConfiguration();
            config.bounds.frequency.min = 25.0; // Outside valid range
            config.bounds.frequency.max = 30.0;

            const result = validator.validateConfiguration(config);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => 
                error.includes('Frequency minimum must be between')
            )).toBe(true);
        });

        test('should detect invalid coherence bounds', () => {
            const config = configService.getConfiguration();
            config.bounds.coherence.min = 1.5; // Outside valid range
            config.bounds.coherence.max = 2.0;

            const result = validator.validateConfiguration(config);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => 
                error.includes('Coherence minimum must be between')
            )).toBe(true);
        });

        test('should detect bounds order violations', () => {
            const config = configService.getConfiguration();
            config.bounds.frequency.min = 10.0;
            config.bounds.frequency.max = 5.0; // Min > Max

            const result = validator.validateConfiguration(config);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Frequency minimum must be less than maximum');
        });

        test('should detect invalid significance thresholds', () => {
            const config = configService.getConfiguration();
            config.significance.updateThreshold = 1.5; // Outside 0-1 range

            const result = validator.validateConfiguration(config);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => 
                error.includes('updateThreshold must be between')
            )).toBe(true);
        });

        test('should detect invalid decision factor bounds', () => {
            const config = configService.getConfiguration();
            config.decisionFactors.min = 5.0;
            config.decisionFactors.max = 2.0; // Min > Max

            const result = validator.validateConfiguration(config);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Decision factor minimum must be less than maximum');
        });

        test('should detect invalid memory configuration', () => {
            const config = configService.getConfiguration();
            config.memory.maxMemoriesPerCharacter = -10; // Negative value

            const result = validator.validateConfiguration(config);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => 
                error.includes('Max memories per character must be an integer')
            )).toBe(true);
        });

        test('should detect invalid performance configuration', () => {
            const config = configService.getConfiguration();
            config.performance.batchSize = 0; // Invalid batch size

            const result = validator.validateConfiguration(config);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => 
                error.includes('Batch size must be an integer')
            )).toBe(true);
        });

        test('should detect invalid event significance weights', () => {
            const config = configService.getConfiguration();
            config.eventSignificanceWeights.goal_completion = 1.5; // Outside 0-1 range

            const result = validator.validateConfiguration(config);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => 
                error.includes('Event weight for goal_completion must be between')
            )).toBe(true);
        });

        test('should detect invalid update rules', () => {
            const config = configService.getConfiguration();
            config.updateRules.goal_completion = {
                frequency: 10.0, // Too large
                coherence: 2.0   // Too large
            };

            const result = validator.validateConfiguration(config);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => 
                error.includes('Frequency change for goal_completion must be between')
            )).toBe(true);
            expect(result.errors.some(error => 
                error.includes('Coherence change for goal_completion must be between')
            )).toBe(true);
        });
    });

    describe('Bounds Validation', () => {
        test('should validate correct frequency bounds', () => {
            const bounds = {
                frequency: { min: 3.0, max: 15.0 },
                coherence: { min: 0.2, max: 1.0 }
            };

            const result = validator.validateBounds(bounds);

            expect(result.errors).toHaveLength(0);
        });

        test('should detect missing bounds configuration', () => {
            const result = validator.validateBounds(null);

            expect(result.errors).toContain('Bounds configuration is required');
        });

        test('should warn about non-optimal ranges', () => {
            const bounds = {
                frequency: { min: 1.0, max: 20.0 }, // Outside optimal range
                coherence: { min: 0.1, max: 1.0 }
            };

            const result = validator.validateBounds(bounds);

            expect(result.warnings.some(warning => 
                warning.includes('outside optimal range')
            )).toBe(true);
        });
    });

    describe('Significance Validation', () => {
        test('should validate correct significance thresholds', () => {
            const significance = {
                updateThreshold: 0.3,
                memoryThreshold: 0.3,
                eventThreshold: 0.2
            };

            const result = validator.validateSignificance(significance);

            expect(result.errors).toHaveLength(0);
        });

        test('should detect missing significance configuration', () => {
            const result = validator.validateSignificance(null);

            expect(result.errors).toContain('Significance configuration is required');
        });

        test('should warn about extreme threshold values', () => {
            const significance = {
                updateThreshold: 0.05, // Very low
                memoryThreshold: 0.9,  // Very high
                eventThreshold: 0.2
            };

            const result = validator.validateSignificance(significance);

            expect(result.warnings.some(warning => 
                warning.includes('very low')
            )).toBe(true);
            expect(result.warnings.some(warning => 
                warning.includes('very high')
            )).toBe(true);
        });
    });

    describe('Memory Validation', () => {
        test('should validate correct memory configuration', () => {
            const memory = {
                maxMemoriesPerCharacter: 50,
                maxEventsPerCharacter: 20,
                significanceDecayRate: 0.1,
                recencyWeightDecay: 0.2
            };

            const result = validator.validateMemory(memory);

            expect(result.errors).toHaveLength(0);
        });

        test('should warn about high memory limits', () => {
            const memory = {
                maxMemoriesPerCharacter: 200, // High limit
                maxEventsPerCharacter: 20,
                significanceDecayRate: 0.1,
                recencyWeightDecay: 0.2
            };

            const result = validator.validateMemory(memory);

            expect(result.warnings.some(warning => 
                warning.includes('High memory limit may impact performance')
            )).toBe(true);
        });
    });

    describe('Performance Validation', () => {
        test('should validate correct performance configuration', () => {
            const performance = {
                batchSize: 100,
                updateFrequencyLimit: 10,
                cacheTimeout: 300000,
                garbageCollectionInterval: 1000
            };

            const result = validator.validatePerformance(performance);

            expect(result.errors).toHaveLength(0);
        });

        test('should detect invalid performance values', () => {
            const performance = {
                batchSize: 0,        // Invalid
                updateFrequencyLimit: -5, // Invalid
                cacheTimeout: 10,    // Too low
                garbageCollectionInterval: 50000 // Too high
            };

            const result = validator.validatePerformance(performance);

            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('Event Weights Validation', () => {
        test('should validate correct event weights', () => {
            const eventWeights = {
                goal_completion: 0.8,
                goal_failure: 0.7,
                social_success: 0.6
            };

            const result = validator.validateEventWeights(eventWeights);

            expect(result.errors).toHaveLength(0);
        });

        test('should detect missing common event types', () => {
            const eventWeights = {
                custom_event: 0.5 // Missing common types
            };

            const result = validator.validateEventWeights(eventWeights);

            expect(result.warnings.some(warning => 
                warning.includes('Missing weights for common event types')
            )).toBe(true);
        });

        test('should detect invalid event weights', () => {
            const eventWeights = {
                goal_completion: 1.5, // Outside 0-1 range
                goal_failure: -0.2    // Negative
            };

            const result = validator.validateEventWeights(eventWeights);

            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('Update Rules Validation', () => {
        test('should validate correct update rules', () => {
            const updateRules = {
                goal_completion: { frequency: 0.3, coherence: 0.05 },
                goal_failure: { frequency: -0.5, coherence: -0.1 }
            };

            const result = validator.validateUpdateRules(updateRules);

            expect(result.errors).toHaveLength(0);
        });

        test('should detect invalid update rule structure', () => {
            const updateRules = {
                goal_completion: 'invalid', // Should be object
                goal_failure: { frequency: 'invalid' } // Should be number
            };

            const result = validator.validateUpdateRules(updateRules);

            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('should warn about extreme parameter changes', () => {
            const updateRules = {
                goal_completion: { frequency: 3.0, coherence: 0.6 } // Large changes
            };

            const result = validator.validateUpdateRules(updateRules);

            expect(result.warnings.some(warning => 
                warning.includes('Large parameter changes')
            )).toBe(true);
        });
    });

    describe('Relationship Validation', () => {
        test('should validate configuration relationships', () => {
            const config = configService.getConfiguration();
            const result = validator.validateRelationships(config);

            expect(result.errors).toHaveLength(0);
        });

        test('should detect relationship violations', () => {
            const config = configService.getConfiguration();
            config.significance.updateThreshold = 0.1;
            config.significance.eventThreshold = 0.5; // Event > Update (violation)

            const result = validator.validateRelationships(config);

            expect(result.errors.some(error => 
                error.includes('Update threshold should be greater than or equal to event threshold')
            )).toBe(true);
        });
    });

    describe('Performance Analysis', () => {
        test('should analyze performance implications', () => {
            const config = configService.getConfiguration();
            config.memory.maxMemoriesPerCharacter = 150; // High memory
            config.performance.batchSize = 600;          // High batch size
            config.significance.updateThreshold = 0.1;   // Low threshold

            const result = validator.analyzePerformanceImplications(config);

            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.recommendations.length).toBeGreaterThan(0);
        });

        test('should detect memory usage concerns', () => {
            const config = configService.getConfiguration();
            config.memory.maxMemoriesPerCharacter = 120;
            config.memory.maxEventsPerCharacter = 30;

            const result = validator.analyzePerformanceImplications(config);

            expect(result.warnings.some(warning => 
                warning.includes('High memory usage per character')
            )).toBe(true);
        });

        test('should detect cache efficiency issues', () => {
            const config = configService.getConfiguration();
            config.performance.cacheTimeout = 60000; // Short timeout

            const result = validator.analyzePerformanceImplications(config);

            expect(result.warnings.some(warning => 
                warning.includes('Short cache timeout')
            )).toBe(true);
        });

        test('should detect garbage collection issues', () => {
            const config = configService.getConfiguration();
            config.performance.garbageCollectionInterval = 8000; // Infrequent GC
            config.memory.maxMemoriesPerCharacter = 100;         // High memory

            const result = validator.analyzePerformanceImplications(config);

            expect(result.warnings.some(warning => 
                warning.includes('Infrequent garbage collection')
            )).toBe(true);
        });
    });

    describe('Health Reporting', () => {
        test('should generate health report for valid configuration', () => {
            const config = configService.getConfiguration();
            const report = validator.generateHealthReport(config);

            expect(report.healthScore).toBeGreaterThan(80);
            expect(report.status).toBe('excellent');
            expect(report.summary.criticalIssues).toBe(0);
            expect(report).toHaveProperty('timestamp');
        });

        test('should generate health report for invalid configuration', () => {
            const config = configService.getConfiguration();
            config.bounds.frequency.min = 25.0; // Invalid
            config.significance.updateThreshold = 1.5; // Invalid

            const report = validator.generateHealthReport(config);

            expect(report.healthScore).toBeLessThan(80);
            expect(report.status).not.toBe('excellent');
            expect(report.summary.criticalIssues).toBeGreaterThan(0);
        });

        test('should calculate health score correctly', () => {
            const validation = {
                errors: ['error1', 'error2'],
                warnings: ['warning1'],
                recommendations: ['rec1', 'rec2', 'rec3']
            };

            const score = validator.calculateHealthScore(validation);

            // 100 - (2 * 20) - (1 * 5) + min(3 * 2, 10) = 100 - 40 - 5 + 6 = 61
            expect(score).toBe(61);
        });

        test('should determine health status correctly', () => {
            expect(validator.getHealthStatus(95)).toBe('excellent');
            expect(validator.getHealthStatus(80)).toBe('good');
            expect(validator.getHealthStatus(65)).toBe('fair');
            expect(validator.getHealthStatus(45)).toBe('poor');
            expect(validator.getHealthStatus(25)).toBe('critical');
        });
    });

    describe('Validation Rules Documentation', () => {
        test('should provide validation rules information', () => {
            const rules = validator.getValidationRules();

            expect(rules).toHaveProperty('parameterBounds');
            expect(rules).toHaveProperty('performance');
            expect(rules).toHaveProperty('memory');
            expect(rules).toHaveProperty('relationships');
            expect(rules).toHaveProperty('warningThresholds');

            expect(Array.isArray(rules.relationships)).toBe(true);
            expect(rules.relationships.length).toBeGreaterThan(0);
        });

        test('should include all parameter bounds', () => {
            const rules = validator.getValidationRules();

            expect(rules.parameterBounds).toHaveProperty('frequency');
            expect(rules.parameterBounds).toHaveProperty('coherence');
            expect(rules.parameterBounds).toHaveProperty('significance');
            expect(rules.parameterBounds).toHaveProperty('decisionFactor');
        });

        test('should include warning thresholds', () => {
            const rules = validator.getValidationRules();

            expect(rules.warningThresholds).toHaveProperty('highMemoryUsage');
            expect(rules.warningThresholds).toHaveProperty('lowSignificanceThreshold');
            expect(rules.warningThresholds).toHaveProperty('extremeDecisionFactors');
        });
    });

    describe('Error Handling', () => {
        test('should handle validation errors gracefully', () => {
            const invalidConfig = null;
            const result = validator.validateConfiguration(invalidConfig);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('should handle relationship validation errors', () => {
            const config = { invalid: 'structure' };
            const result = validator.validateRelationships(config);

            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('should log validation warnings when logger is available', () => {
            const config = configService.getConfiguration();
            config.bounds.frequency.min = 25.0; // Invalid

            validator.validateConfiguration(config);

            expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringContaining('Configuration validation found')
            );
        });

        test('should log validation errors when they occur', () => {
            const invalidConfig = null;
            validator.validateConfiguration(invalidConfig);

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining('Configuration validation failed')
            );
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty configuration sections', () => {
            const config = {
                bounds: {},
                significance: {},
                decisionFactors: {},
                memory: {},
                performance: {},
                eventSignificanceWeights: {},
                updateRules: {}
            };

            const result = validator.validateConfiguration(config);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('should handle missing configuration sections', () => {
            const config = {
                bounds: configService.getConfiguration().bounds
                // Missing other sections
            };

            const result = validator.validateConfiguration(config);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('should handle boundary values correctly', () => {
            const config = configService.getConfiguration();
            config.bounds.frequency.min = 3.0;  // Minimum allowed
            config.bounds.frequency.max = 15.0; // Maximum allowed
            config.bounds.coherence.min = 0.2;  // Minimum allowed
            config.bounds.coherence.max = 1.0;  // Maximum allowed

            const result = validator.validateConfiguration(config);

            expect(result.isValid).toBe(true);
        });
    });
});