/**
 * Tests for ConsciousnessErrorHandlingService
 *
 * Comprehensive test suite covering error handling, recovery mechanisms,
 * fallback calculations, and diagnostic reporting for the consciousness system.
 */

import ConsciousnessErrorHandlingService from '../domain/services/ConsciousnessErrorHandlingService.js';

describe('ConsciousnessErrorHandlingService', () => {
    let errorHandler;
    let mockLogger;
    let mockEventSignificanceService;

    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        mockEventSignificanceService = {
            calculateEventSignificance: jest.fn()
        };

        errorHandler = new ConsciousnessErrorHandlingService(mockLogger, mockEventSignificanceService);
    });

    describe('Consciousness State Corruption Handling', () => {
        test('should handle missing consciousness object', () => {
            const character = { id: 'test-char' };

            const result = errorHandler.handleConsciousnessCorruption(character);

            expect(result.success).toBe(true);
            expect(result.strategy).toBe('reset_to_baseline');
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining('Consciousness state corruption detected')
            );
        });

        test('should repair corrupted frequency values', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: NaN,
                    coherence: 0.7,
                    behavioralState: { energy: 'moderate' }
                }
            };

            const result = errorHandler.handleConsciousnessCorruption(character);

            expect(result.success).toBe(true);
            expect(character.consciousness.frequency).toBe(7.5); // Default frequency
            expect(character.consciousness.coherence).toBe(0.7);
        });

        test('should repair corrupted coherence values', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: 8.0,
                    coherence: null,
                    behavioralState: { energy: 'moderate' }
                }
            };

            const result = errorHandler.handleConsciousnessCorruption(character);

            expect(result.success).toBe(true);
            expect(character.consciousness.frequency).toBe(8.0);
            expect(character.consciousness.coherence).toBe(0.7); // Default coherence
        });

        test('should regenerate missing behavioral state', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: 8.0,
                    coherence: 0.8
                }
            };

            const result = errorHandler.handleConsciousnessCorruption(character);

            expect(result.success).toBe(true);
            expect(character.consciousness.behavioralState).toBeDefined();
            expect(character.consciousness.behavioralState.energy).toBeDefined();
            expect(character.consciousness.behavioralState.focus).toBeDefined();
        });

        test('should clamp out-of-bounds values', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: 20, // Above max
                    coherence: -0.5, // Below min
                    behavioralState: { energy: 'moderate' }
                }
            };

            const result = errorHandler.handleConsciousnessCorruption(character);

            expect(result.success).toBe(true);
            expect(character.consciousness.frequency).toBe(15.0); // Clamped to max
            expect(character.consciousness.coherence).toBe(0.2); // Clamped to min
        });
    });

    describe('Missing Behavioral State Recovery', () => {
        test('should regenerate behavioral state from valid consciousness parameters', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: 10.0,
                    coherence: 0.9
                }
            };

            const result = errorHandler.handleMissingBehavioralState(character);

            expect(result.success).toBe(true);
            expect(result.regeneratedState).toBeDefined();
            expect(character.consciousness.behavioralState).toBeDefined();
            expect(character.consciousness.behavioralState.energy).toBe('high'); // Based on frequency 10.0
        });

        test('should handle completely missing consciousness', () => {
            const character = { id: 'test-char' };

            const result = errorHandler.handleMissingBehavioralState(character);

            expect(result.success).toBe(false);
            expect(result.strategy).toBe('reset_to_baseline');
        });

        test('should use partial valid data for regeneration', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: 12.0 // Valid frequency, missing coherence
                }
            };

            const result = errorHandler.handleMissingBehavioralState(character);

            expect(result.success).toBe(true);
            expect(character.consciousness.coherence).toBe(0.7); // Default coherence
            expect(character.consciousness.behavioralState).toBeDefined();
        });
    });

    describe('Calculation Failure Handling', () => {
        test('should provide fallback for decision factor calculation failures', () => {
            const error = new Error('Decision factor calculation failed');
            const context = {
                calculationType: 'decision_factor',
                character: { id: 'test-char' },
                interactionType: 'social'
            };

            const result = errorHandler.handleCalculationFailure(error, context);

            expect(result.success).toBe(true);
            expect(result.fallbackValue).toBeDefined();
            expect(result.strategy).toBe('personality-based-fallback');
        });

        test('should provide fallback for behavioral modifier calculation failures', () => {
            const error = new Error('Behavioral modifier calculation failed');
            const context = {
                calculationType: 'behavioral_modifier',
                character: { id: 'test-char' },
                interactionType: 'combat'
            };

            const result = errorHandler.handleCalculationFailure(error, context);

            expect(result.success).toBe(true);
            expect(result.fallbackValue).toBe(1.0); // Neutral fallback
            expect(result.strategy).toBe('rule-based-fallback');
        });

        test('should provide fallback for event significance calculation failures', () => {
            const error = new Error('Event significance calculation failed');
            const context = {
                calculationType: 'event_significance',
                event: { type: 'goal_completion' }
            };

            const result = errorHandler.handleCalculationFailure(error, context);

            expect(result.success).toBe(true);
            expect(result.fallbackValue).toBe(0.8); // Significance for goal_completion
            expect(result.strategy).toBe('type-based-fallback');
        });

        test('should provide fallback for memory influence calculation failures', () => {
            const error = new Error('Memory influence calculation failed');
            const context = {
                calculationType: 'memory_influence',
                character: { id: 'test-char' },
                interactionType: 'social'
            };

            const result = errorHandler.handleCalculationFailure(error, context);

            expect(result.success).toBe(true);
            expect(result.fallbackValue).toBe(1.0); // Neutral fallback
            expect(result.strategy).toBe('neutral-fallback');
        });

        test('should handle unknown calculation types', () => {
            const error = new Error('Unknown calculation failed');
            const context = {
                calculationType: 'unknown_calculation'
            };

            const result = errorHandler.handleCalculationFailure(error, context);

            expect(result.success).toBe(false);
            expect(result.fallbackValue).toBe(1.0); // Default neutral
        });
    });

    describe('Fallback Calculation Methods', () => {
        test('should calculate personality-based decision factor fallback', () => {
            const character = {
                personality: {
                    extrovert: 0.8,
                    empathy: 0.6
                }
            };

            const result = errorHandler.attemptFallbackCalculation({
                calculationType: 'decision_factor',
                character,
                interactionType: 'social'
            });

            expect(result.success).toBe(true);
            expect(result.fallbackValue).toBeGreaterThan(1.0); // Should be boosted by personality
        });

        test('should calculate rule-based behavioral modifier fallback', () => {
            const result = errorHandler.attemptFallbackCalculation({
                calculationType: 'behavioral_modifier',
                interactionType: 'rest'
            });

            expect(result.success).toBe(true);
            expect(result.fallbackValue).toBe(1.2); // Rest interaction modifier
        });

        test('should handle missing character in fallback calculation', () => {
            const result = errorHandler.attemptFallbackCalculation({
                calculationType: 'decision_factor',
                interactionType: 'social'
            });

            expect(result.success).toBe(true);
            expect(result.fallbackValue).toBe(1.0); // Neutral fallback
        });
    });

    describe('Error Logging and Diagnostics', () => {
        test('should log errors with comprehensive context', () => {
            const character = { id: 'test-char' };
            errorHandler.handleConsciousnessCorruption(character);

            expect(mockLogger.error).toHaveBeenCalled();
            const logCall = mockLogger.error.mock.calls[0][0];
            expect(logCall).toContain('Consciousness state corruption detected');
        });

        test('should track error history', () => {
            const character = { id: 'test-char' };
            errorHandler.handleConsciousnessCorruption(character);

            const history = errorHandler.getErrorHistory();
            expect(history.length).toBeGreaterThan(0);
            expect(history[0].category).toBe('corruption');
        });

        test('should generate diagnostic reports', () => {
            // Add some errors
            errorHandler.handleConsciousnessCorruption({ id: 'char1' });
            errorHandler.handleMissingBehavioralState({ id: 'char2' });

            const diagnostics = errorHandler.getDiagnostics();

            expect(diagnostics.totalErrors).toBeGreaterThan(0);
            expect(diagnostics.errorCounts.corruption).toBeDefined();
            expect(diagnostics.errorCounts.missing_data).toBeDefined();
            expect(diagnostics.healthStatus).toBeDefined();
        });

        test('should filter error history by criteria', () => {
            errorHandler.handleConsciousnessCorruption({ id: 'char1' });
            errorHandler.handleMissingBehavioralState({ id: 'char2' });

            const corruptionErrors = errorHandler.getErrorHistory({ category: 'corruption' });
            expect(corruptionErrors.length).toBe(1);
            expect(corruptionErrors[0].category).toBe('corruption');
        });

        test('should assess system health correctly', () => {
            // Add a high-severity error
            errorHandler.logError({
                category: 'corruption',
                severity: 'high',
                message: 'Critical corruption detected',
                characterId: 'test-char'
            });

            const diagnostics = errorHandler.getDiagnostics();
            expect(diagnostics.healthStatus).toBe('warning');
        });
    });

    describe('Parameter Validation and Bounds Checking', () => {
        test('should validate consciousness parameters', () => {
            const validConsciousness = {
                frequency: 8.0,
                coherence: 0.7,
                behavioralState: { energy: 'moderate', focus: 'balanced', mood: 'content' }
            };

            const result = errorHandler.validateConsciousness(validConsciousness);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should detect invalid frequency', () => {
            const invalidConsciousness = {
                frequency: 25, // Above max
                coherence: 0.7
            };

            const result = errorHandler.validateConsciousness(invalidConsciousness);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Frequency must be between 3 and 15');
        });

        test('should detect invalid coherence', () => {
            const invalidConsciousness = {
                frequency: 8.0,
                coherence: 1.5 // Above max
            };

            const result = errorHandler.validateConsciousness(invalidConsciousness);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Coherence must be between 0.2 and 1.0');
        });

        test('should detect invalid behavioral state', () => {
            const invalidConsciousness = {
                frequency: 8.0,
                coherence: 0.7,
                behavioralState: {} // Missing required fields
            };

            const result = errorHandler.validateConsciousness(invalidConsciousness);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Behavioral state is invalid or missing');
        });

        test('should clamp frequency to valid bounds', () => {
            expect(errorHandler.clampFrequency(20)).toBe(15.0);
            expect(errorHandler.clampFrequency(1)).toBe(3.0);
            expect(errorHandler.clampFrequency(8.0)).toBe(8.0);
        });

        test('should clamp coherence to valid bounds', () => {
            expect(errorHandler.clampCoherence(1.5)).toBe(1.0);
            expect(errorHandler.clampCoherence(0.1)).toBe(0.2);
            expect(errorHandler.clampCoherence(0.7)).toBe(0.7);
        });
    });

    describe('Behavioral State Validation and Generation', () => {
        test('should validate complete behavioral state', () => {
            const validState = {
                energy: 'moderate',
                focus: 'balanced',
                mood: 'content',
                socialDrive: 0.6,
                riskTolerance: 0.5,
                ambition: 0.7
            };

            expect(errorHandler.isValidBehavioralState(validState)).toBe(true);
        });

        test('should detect invalid behavioral state', () => {
            expect(errorHandler.isValidBehavioralState(null)).toBe(false);
            expect(errorHandler.isValidBehavioralState({})).toBe(false);
            expect(errorHandler.isValidBehavioralState({ energy: 'moderate' })).toBe(false);
        });

        test('should generate behavioral state from parameters', () => {
            const state = errorHandler.generateBehavioralStateFromParameters(10.0, 0.8);

            expect(state).toBeDefined();
            expect(state.energy).toBe('high'); // Based on frequency 10.0
            expect(state.focus).toBe('focused'); // Based on coherence 0.8
            expect(state.mood).toBeDefined();
            expect(state.socialDrive).toBeDefined();
            expect(state.riskTolerance).toBeDefined();
            expect(state.ambition).toBeDefined();
        });

        test('should generate default behavioral state', () => {
            const state = errorHandler.generateDefaultBehavioralState();

            expect(state).toBeDefined();
            expect(state.energy).toBe('moderate');
            expect(state.focus).toBe('balanced');
            expect(state.mood).toBe('content');
            expect(typeof state.socialDrive).toBe('number');
            expect(typeof state.riskTolerance).toBe('number');
            expect(typeof state.ambition).toBe('number');
        });
    });

    describe('Error Recovery Strategies', () => {
        test('should attempt data repair for corrupted consciousness', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: NaN,
                    coherence: 0.7
                }
            };

            const repaired = errorHandler.attemptDataRepair(character);

            expect(repaired).toBe(true);
            expect(character.consciousness.frequency).toBe(7.5);
            expect(character.consciousness.coherence).toBe(0.7);
        });

        test('should regenerate from partial data', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: 9.0 // Valid frequency
                }
            };

            const regenerated = errorHandler.regenerateFromPartialData(character);

            expect(regenerated).toBe(true);
            expect(character.consciousness.frequency).toBe(9.0);
            expect(character.consciousness.coherence).toBe(0.7); // Default
            expect(character.consciousness.behavioralState).toBeDefined();
        });

        test('should reset to baseline when repair fails', () => {
            const character = { id: 'test-char' };

            errorHandler.resetToBaseline(character);

            expect(character.consciousness).toBeDefined();
            expect(character.consciousness.frequency).toBe(7.5);
            expect(character.consciousness.coherence).toBe(0.7);
            expect(character.consciousness.behavioralState).toBeDefined();
            expect(character.consciousness.significantEvents).toEqual([]);
        });
    });

    describe('Integration with External Services', () => {
        test('should integrate with event significance service', () => {
            mockEventSignificanceService.calculateEventSignificance.mockReturnValue(0.8);

            const error = new Error('Test error');
            const context = {
                calculationType: 'event_significance',
                event: { type: 'goal_completion' }
            };

            const result = errorHandler.handleCalculationFailure(error, context);

            expect(mockEventSignificanceService.calculateEventSignificance).toHaveBeenCalledWith(
                { type: 'goal_completion' },
                undefined
            );
            expect(result.success).toBe(true);
        });

        test('should handle logger integration', () => {
            errorHandler.logError({
                category: 'test',
                severity: 'low',
                message: 'Test message'
            });

            expect(mockLogger.info).toHaveBeenCalled();
        });
    });

    describe('Performance and Resource Management', () => {
        test('should maintain error history within limits', () => {
            // Add more errors than the limit
            for (let i = 0; i < 150; i++) {
                errorHandler.logError({
                    category: 'test',
                    severity: 'low',
                    message: `Test error ${i}`
                });
            }

            const history = errorHandler.getErrorHistory();
            expect(history.length).toBeLessThanOrEqual(100); // Max history size
        });

        test('should clear error history', () => {
            errorHandler.logError({
                category: 'test',
                severity: 'low',
                message: 'Test error'
            });

            expect(errorHandler.getErrorHistory().length).toBeGreaterThan(0);

            errorHandler.clearErrorHistory();
            expect(errorHandler.getErrorHistory().length).toBe(0);
        });
    });
});