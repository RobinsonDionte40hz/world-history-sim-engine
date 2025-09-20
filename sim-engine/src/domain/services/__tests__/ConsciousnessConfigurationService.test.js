/**
 * Tests for ConsciousnessConfigurationService
 * 
 * Comprehensive test suite covering configuration management, validation,
 * tuning utilities, and error handling for the consciousness system configuration.
 */

import ConsciousnessConfigurationService from '../ConsciousnessConfigurationService.js';

describe('ConsciousnessConfigurationService', () => {
    let configService;
    let mockLogger;

    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };
        configService = new ConsciousnessConfigurationService(mockLogger);
    });

    describe('Configuration Management', () => {
        test('should return complete configuration by default', () => {
            const config = configService.getConfiguration();
            
            expect(config).toHaveProperty('bounds');
            expect(config).toHaveProperty('significance');
            expect(config).toHaveProperty('behavioralMapping');
            expect(config).toHaveProperty('decisionFactors');
            expect(config).toHaveProperty('memory');
            expect(config).toHaveProperty('performance');
            expect(config).toHaveProperty('eventSignificanceWeights');
            expect(config).toHaveProperty('updateRules');
        });

        test('should return specific configuration section', () => {
            const boundsConfig = configService.getConfiguration('bounds');
            
            expect(boundsConfig).toHaveProperty('frequency');
            expect(boundsConfig).toHaveProperty('coherence');
            expect(boundsConfig.frequency).toHaveProperty('min');
            expect(boundsConfig.frequency).toHaveProperty('max');
            expect(boundsConfig.frequency).toHaveProperty('default');
        });

        test('should return null for unknown section', () => {
            const unknownConfig = configService.getConfiguration('unknown');
            expect(unknownConfig).toBeNull();
        });

        test('should return deep copy to prevent mutation', () => {
            const config1 = configService.getConfiguration();
            const config2 = configService.getConfiguration();
            
            config1.bounds.frequency.min = 999;
            expect(config2.bounds.frequency.min).not.toBe(999);
        });
    });

    describe('Configuration Updates', () => {
        test('should successfully update bounds configuration', () => {
            const updates = {
                frequency: { min: 4.0, max: 14.0 },
                coherence: { min: 0.3, max: 0.9 }
            };

            const result = configService.updateConfiguration('bounds', updates);

            expect(result.success).toBe(true);
            expect(result.section).toBe('bounds');
            expect(result.newConfig.frequency.min).toBe(4.0);
            expect(result.newConfig.coherence.max).toBe(0.9);
        });

        test('should successfully update significance thresholds', () => {
            const updates = {
                updateThreshold: 0.4,
                memoryThreshold: 0.35,
                eventThreshold: 0.25
            };

            const result = configService.updateConfiguration('significance', updates);

            expect(result.success).toBe(true);
            expect(result.newConfig.updateThreshold).toBe(0.4);
            expect(result.newConfig.memoryThreshold).toBe(0.35);
        });

        test('should fail to update unknown section', () => {
            const result = configService.updateConfiguration('unknown', { test: 'value' });

            expect(result.success).toBe(false);
            expect(result.errors).toContain('Unknown configuration section: unknown');
        });

        test('should validate bounds updates', () => {
            const invalidUpdates = {
                frequency: { min: 25.0, max: 30.0 } // Outside valid range
            };

            const result = configService.updateConfiguration('bounds', invalidUpdates);

            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('should validate significance updates', () => {
            const invalidUpdates = {
                updateThreshold: 1.5 // Outside 0-1 range
            };

            const result = configService.updateConfiguration('significance', invalidUpdates);

            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('should validate decision factor updates', () => {
            const invalidUpdates = {
                min: 5.0,
                max: 2.0 // Min greater than max
            };

            const result = configService.updateConfiguration('decisionFactors', invalidUpdates);

            expect(result.success).toBe(false);
            expect(result.errors).toContain('Decision factor minimum must be less than maximum');
        });

        test('should validate memory configuration updates', () => {
            const invalidUpdates = {
                maxMemoriesPerCharacter: -10 // Negative value
            };

            const result = configService.updateConfiguration('memory', invalidUpdates);

            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('should validate performance configuration updates', () => {
            const invalidUpdates = {
                batchSize: 0 // Invalid batch size
            };

            const result = configService.updateConfiguration('performance', invalidUpdates);

            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('should validate event significance weight updates', () => {
            const invalidUpdates = {
                goal_completion: 1.5 // Outside 0-1 range
            };

            const result = configService.updateConfiguration('eventSignificanceWeights', invalidUpdates);

            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('should validate update rule updates', () => {
            const invalidUpdates = {
                goal_completion: {
                    frequency: 10.0, // Too large
                    coherence: 2.0   // Too large
                }
            };

            const result = configService.updateConfiguration('updateRules', invalidUpdates);

            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('Configuration Reset', () => {
        test('should reset specific section to defaults', () => {
            // First modify the configuration
            configService.updateConfiguration('significance', { updateThreshold: 0.8 });
            
            // Then reset it
            const result = configService.resetConfiguration('significance');

            expect(result.success).toBe(true);
            expect(result.section).toBe('significance');
            expect(result.newConfig.updateThreshold).toBe(0.3); // Default value
        });

        test('should reset entire configuration to defaults', () => {
            // First modify multiple sections
            configService.updateConfiguration('significance', { updateThreshold: 0.8 });
            configService.updateConfiguration('memory', { maxMemoriesPerCharacter: 100 });
            
            // Then reset all
            const result = configService.resetConfiguration();

            expect(result.success).toBe(true);
            expect(result.section).toBe('all');
            
            const newConfig = configService.getConfiguration();
            expect(newConfig.significance.updateThreshold).toBe(0.3);
            expect(newConfig.memory.maxMemoriesPerCharacter).toBe(50);
        });

        test('should fail to reset unknown section', () => {
            const result = configService.resetConfiguration('unknown');

            expect(result.success).toBe(false);
            expect(result.error).toContain('Unknown configuration section: unknown');
        });
    });

    describe('Configuration Import/Export', () => {
        test('should export configuration as JSON', () => {
            const jsonConfig = configService.exportConfiguration();
            const parsedConfig = JSON.parse(jsonConfig);

            expect(parsedConfig).toHaveProperty('bounds');
            expect(parsedConfig).toHaveProperty('significance');
            expect(typeof jsonConfig).toBe('string');
        });

        test('should export specific section as JSON', () => {
            const jsonConfig = configService.exportConfiguration('bounds');
            const parsedConfig = JSON.parse(jsonConfig);

            expect(parsedConfig).toHaveProperty('frequency');
            expect(parsedConfig).toHaveProperty('coherence');
            expect(parsedConfig).not.toHaveProperty('significance');
        });

        test('should import valid configuration', () => {
            const configToImport = {
                updateThreshold: 0.5,
                memoryThreshold: 0.4,
                eventThreshold: 0.3
            };

            const result = configService.importConfiguration(
                JSON.stringify(configToImport),
                'significance'
            );

            expect(result.success).toBe(true);
            expect(result.section).toBe('significance');
            expect(result.newConfig.updateThreshold).toBe(0.5);
        });

        test('should fail to import invalid JSON', () => {
            const result = configService.importConfiguration('invalid json', 'significance');

            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid JSON');
        });

        test('should fail to import invalid configuration values', () => {
            const invalidConfig = {
                updateThreshold: 2.0 // Invalid value
            };

            const result = configService.importConfiguration(
                JSON.stringify(invalidConfig),
                'significance'
            );

            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('should import entire configuration', () => {
            const fullConfig = configService.getConfiguration();
            fullConfig.significance.updateThreshold = 0.6;
            fullConfig.memory.maxMemoriesPerCharacter = 75;

            const result = configService.importConfiguration(JSON.stringify(fullConfig));

            expect(result.success).toBe(true);
            expect(result.section).toBe('all');
            
            const newConfig = configService.getConfiguration();
            expect(newConfig.significance.updateThreshold).toBe(0.6);
            expect(newConfig.memory.maxMemoriesPerCharacter).toBe(75);
        });
    });

    describe('Tuning Recommendations', () => {
        test('should generate recommendations for slow turn processing', () => {
            const performanceMetrics = {
                averageTurnTime: 6000, // 6 seconds (slow)
                memoryUsage: 0.5,
                averageUpdatesPerCharacter: 5,
                behavioralInconsistency: 0.2
            };

            const recommendations = configService.getTuningRecommendations(performanceMetrics);

            expect(recommendations.recommendations.length).toBeGreaterThan(0);
            expect(recommendations.recommendations[0].type).toBe('performance');
            expect(recommendations.recommendations[0].suggestedChanges).toHaveProperty('performance.batchSize');
        });

        test('should generate recommendations for high memory usage', () => {
            const performanceMetrics = {
                averageTurnTime: 2000,
                memoryUsage: 0.9, // High memory usage
                averageUpdatesPerCharacter: 5,
                behavioralInconsistency: 0.2
            };

            const recommendations = configService.getTuningRecommendations(performanceMetrics);

            expect(recommendations.recommendations.some(r => r.type === 'memory')).toBe(true);
        });

        test('should generate recommendations for excessive updates', () => {
            const performanceMetrics = {
                averageTurnTime: 2000,
                memoryUsage: 0.5,
                averageUpdatesPerCharacter: 12, // Too many updates
                behavioralInconsistency: 0.2
            };

            const recommendations = configService.getTuningRecommendations(performanceMetrics);

            expect(recommendations.recommendations.some(r => r.type === 'updates')).toBe(true);
        });

        test('should generate recommendations for behavioral inconsistency', () => {
            const performanceMetrics = {
                averageTurnTime: 2000,
                memoryUsage: 0.5,
                averageUpdatesPerCharacter: 5,
                behavioralInconsistency: 0.4 // High inconsistency
            };

            const recommendations = configService.getTuningRecommendations(performanceMetrics);

            expect(recommendations.recommendations.some(r => r.type === 'behavior')).toBe(true);
        });

        test('should apply tuning recommendations successfully', () => {
            const recommendations = [
                {
                    type: 'performance',
                    suggestedChanges: {
                        'performance.batchSize': 80,
                        'significance.updateThreshold': 0.4
                    }
                }
            ];

            const result = configService.applyTuningRecommendations(recommendations);

            expect(result.success).toBe(true);
            expect(result.results.length).toBe(2);
            expect(result.results.every(r => r.success)).toBe(true);
            
            const newConfig = configService.getConfiguration();
            expect(newConfig.performance.batchSize).toBe(80);
            expect(newConfig.significance.updateThreshold).toBe(0.4);
        });

        test('should handle failed recommendation applications', () => {
            const recommendations = [
                {
                    type: 'invalid',
                    suggestedChanges: {
                        'unknown.setting': 'invalid'
                    }
                }
            ];

            const result = configService.applyTuningRecommendations(recommendations);

            expect(result.success).toBe(false);
            expect(result.results.some(r => !r.success)).toBe(true);
        });
    });

    describe('Configuration Summary and Analysis', () => {
        test('should generate configuration summary', () => {
            const summary = configService.getConfigurationSummary();

            expect(summary).toHaveProperty('bounds');
            expect(summary).toHaveProperty('thresholds');
            expect(summary).toHaveProperty('limits');
            expect(summary).toHaveProperty('performance');
            expect(summary).toHaveProperty('eventTypes');
            expect(summary).toHaveProperty('updateRules');

            expect(typeof summary.bounds.frequency).toBe('string');
            expect(typeof summary.eventTypes).toBe('number');
            expect(typeof summary.updateRules).toBe('number');
        });

        test('should include all key metrics in summary', () => {
            const summary = configService.getConfigurationSummary();

            expect(summary.thresholds.update).toBe(0.3);
            expect(summary.limits.memories).toBe(50);
            expect(summary.performance.batchSize).toBe(100);
            expect(summary.eventTypes).toBeGreaterThan(10);
        });
    });

    describe('Error Handling', () => {
        test('should handle configuration update errors gracefully', () => {
            const result = configService.updateConfiguration(null, {});

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        test('should handle reset errors gracefully', () => {
            // Mock an error in the reset process
            const originalConfig = configService.config;
            configService.config = null;

            const result = configService.resetConfiguration('bounds');

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();

            // Restore original config
            configService.config = originalConfig;
        });

        test('should log configuration changes when logger is available', () => {
            configService.updateConfiguration('significance', { updateThreshold: 0.5 });

            expect(mockLogger.info).toHaveBeenCalledWith(
                'Configuration updated for section significance:',
                { updateThreshold: 0.5 }
            );
        });

        test('should log errors when they occur', () => {
            configService.updateConfiguration('unknown', {});

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining('Error updating configuration')
            );
        });
    });

    describe('Default Configuration Integrity', () => {
        test('should have valid default bounds', () => {
            const config = configService.getConfiguration();

            expect(config.bounds.frequency.min).toBeLessThan(config.bounds.frequency.max);
            expect(config.bounds.coherence.min).toBeLessThan(config.bounds.coherence.max);
            expect(config.bounds.frequency.min).toBeGreaterThanOrEqual(3.0);
            expect(config.bounds.frequency.max).toBeLessThanOrEqual(15.0);
        });

        test('should have valid default significance thresholds', () => {
            const config = configService.getConfiguration();

            expect(config.significance.updateThreshold).toBeGreaterThanOrEqual(0);
            expect(config.significance.updateThreshold).toBeLessThanOrEqual(1);
            expect(config.significance.memoryThreshold).toBeGreaterThanOrEqual(0);
            expect(config.significance.memoryThreshold).toBeLessThanOrEqual(1);
        });

        test('should have valid default decision factor bounds', () => {
            const config = configService.getConfiguration();

            expect(config.decisionFactors.min).toBeLessThan(config.decisionFactors.max);
            expect(config.decisionFactors.min).toBeGreaterThan(0);
            expect(config.decisionFactors.max).toBeGreaterThan(1);
        });

        test('should have reasonable default memory limits', () => {
            const config = configService.getConfiguration();

            expect(config.memory.maxMemoriesPerCharacter).toBeGreaterThan(0);
            expect(config.memory.maxEventsPerCharacter).toBeGreaterThan(0);
            expect(config.memory.maxMemoriesPerCharacter).toBeGreaterThanOrEqual(
                config.memory.maxEventsPerCharacter
            );
        });

        test('should have valid default performance settings', () => {
            const config = configService.getConfiguration();

            expect(config.performance.batchSize).toBeGreaterThan(0);
            expect(config.performance.cacheTimeout).toBeGreaterThan(0);
            expect(config.performance.garbageCollectionInterval).toBeGreaterThan(0);
        });

        test('should have comprehensive event significance weights', () => {
            const config = configService.getConfiguration();
            const weights = config.eventSignificanceWeights;

            expect(Object.keys(weights).length).toBeGreaterThan(10);
            expect(weights).toHaveProperty('goal_completion');
            expect(weights).toHaveProperty('traumatic_encounter');
            expect(weights).toHaveProperty('social_success');

            Object.values(weights).forEach(weight => {
                expect(weight).toBeGreaterThanOrEqual(0);
                expect(weight).toBeLessThanOrEqual(1);
            });
        });

        test('should have comprehensive update rules', () => {
            const config = configService.getConfiguration();
            const rules = config.updateRules;

            expect(Object.keys(rules).length).toBeGreaterThan(10);
            expect(rules).toHaveProperty('goal_completion');
            expect(rules).toHaveProperty('traumatic_encounter');

            Object.values(rules).forEach(rule => {
                expect(rule).toHaveProperty('frequency');
                expect(rule).toHaveProperty('coherence');
                expect(typeof rule.frequency).toBe('number');
                expect(typeof rule.coherence).toBe('number');
            });
        });
    });
});