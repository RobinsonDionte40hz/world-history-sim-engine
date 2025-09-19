/**
 * Integration Tests for Consciousness Error Handling
 *
 * Tests the integration between ConsciousnessErrorHandlingService and other
 * consciousness system components to ensure comprehensive error recovery.
 */

import ConsciousnessErrorHandlingService from '../domain/services/ConsciousnessErrorHandlingService.js';
import BehavioralStateService from '../domain/services/BehavioralStateService.js';
import ConsciousnessUpdateService from '../domain/services/ConsciousnessUpdateService.js';
import EventSignificanceService from '../domain/services/EventSignificanceService.js';

describe('Consciousness Error Handling Integration', () => {
    let errorHandler;
    let behavioralStateService;
    let consciousnessUpdateService;
    let eventSignificanceService;
    let mockLogger;

    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        errorHandler = new ConsciousnessErrorHandlingService(mockLogger);
        eventSignificanceService = new EventSignificanceService();
        behavioralStateService = new BehavioralStateService(null, mockLogger, errorHandler);
        consciousnessUpdateService = new ConsciousnessUpdateService(eventSignificanceService, mockLogger, errorHandler);
    });

    describe('BehavioralStateService Integration', () => {
        test('should recover from missing behavioral state during modifier calculation', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: 8.0,
                    coherence: 0.7
                    // Missing behavioralState
                },
                personality: {
                    extrovert: 0.6
                }
            };

            const modifier = behavioralStateService.getBehavioralModifier(character, 'social');

            expect(modifier).toBeDefined();
            expect(typeof modifier).toBe('number');
            expect(modifier).toBeGreaterThan(0);
            expect(modifier).toBeLessThanOrEqual(3.0);

            // Should have regenerated behavioral state
            expect(character.consciousness.behavioralState).toBeDefined();
        });

        test('should handle corrupted behavioral state gracefully', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: 8.0,
                    coherence: 0.7,
                    behavioralState: {} // Corrupted - missing required fields
                }
            };

            const modifier = behavioralStateService.getBehavioralModifier(character, 'combat');

            expect(modifier).toBeDefined();
            expect(typeof modifier).toBe('number');
            expect(character.consciousness.behavioralState).toBeDefined();
            expect(character.consciousness.behavioralState.energy).toBeDefined();
        });

        test('should use fallback calculation when memory service fails', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: 8.0,
                    coherence: 0.7,
                    behavioralState: { energy: 'moderate', focus: 'balanced', mood: 'content', socialDrive: 0.6, riskTolerance: 0.5, ambition: 0.7 }
                },
                significantMemories: null // This will cause memory service to fail
            };

            // Mock memory service to throw error
            behavioralStateService.memoryService = {
                getRelevantMemories: jest.fn().mockImplementation(() => {
                    throw new Error('Memory service failure');
                })
            };

            const modifier = behavioralStateService.getBehavioralModifier(character, 'social');

            expect(modifier).toBeDefined();
            expect(typeof modifier).toBe('number');
            // Should still work with fallback
        });

        test('should handle completely missing character data', () => {
            const modifier = behavioralStateService.getBehavioralModifier(null, 'social');

            expect(modifier).toBe(1.0); // Neutral fallback
        });
    });

    describe('ConsciousnessUpdateService Integration', () => {
        test('should handle corrupted consciousness during event processing', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: NaN, // Corrupted
                    coherence: 0.7
                }
            };

            const event = {
                type: 'goal_completion',
                outcome: 'success'
            };

            const result = consciousnessUpdateService.processEvent(character, event);

            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            // Should have repaired the corrupted data
            expect(character.consciousness.frequency).toBe(7.5); // Default
        });

        test('should recover from event processing failures', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: 8.0,
                    coherence: 0.7,
                    behavioralState: { energy: 'moderate', focus: 'balanced', mood: 'content', socialDrive: 0.6, riskTolerance: 0.5, ambition: 0.7 }
                }
            };

            // Mock event significance service to throw error
            consciousnessUpdateService.eventSignificanceService = {
                isEventSignificant: jest.fn().mockImplementation(() => {
                    throw new Error('Event significance calculation failed');
                }),
                calculateEventSignificance: jest.fn().mockImplementation(() => {
                    throw new Error('Event significance calculation failed');
                })
            };

            const event = { type: 'goal_completion' };
            const result = consciousnessUpdateService.processEvent(character, event);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        test('should handle missing consciousness object', () => {
            const character = { id: 'test-char' };
            const event = { type: 'goal_completion' };

            const result = consciousnessUpdateService.processEvent(character, event);

            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(character.consciousness).toBeDefined();
        });
    });

    describe('End-to-End Error Recovery', () => {
        test('should recover from multiple corruption scenarios', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: NaN,
                    coherence: null,
                    behavioralState: null,
                    significantEvents: null
                }
            };

            // First, handle corruption
            const corruptionResult = errorHandler.handleConsciousnessCorruption(character);
            expect(corruptionResult.success).toBe(true);

            // Then test behavioral state service
            const modifier = behavioralStateService.getBehavioralModifier(character, 'social');
            expect(modifier).toBeDefined();
            expect(typeof modifier).toBe('number');

            // Then test event processing
            const event = { type: 'goal_completion', outcome: 'success' };
            const eventResult = consciousnessUpdateService.processEvent(character, event);
            expect(eventResult.success).toBe(true);
        });

        test('should maintain data integrity through error recovery', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: 8.0,
                    coherence: 0.7,
                    behavioralState: { energy: 'moderate', focus: 'balanced', mood: 'content', socialDrive: 0.6, riskTolerance: 0.5, ambition: 0.7 },
                    significantEvents: [
                        { type: 'goal_completion', significance: 0.8, timestamp: Date.now() }
                    ]
                }
            };

            // Simulate corruption
            character.consciousness.frequency = NaN;

            // Process through error handler
            const result = errorHandler.handleConsciousnessCorruption(character);

            expect(result.success).toBe(true);
            expect(character.consciousness.frequency).toBe(7.5); // Repaired
            expect(character.consciousness.coherence).toBe(0.7); // Unchanged
            expect(character.consciousness.significantEvents).toBeDefined(); // Preserved
            expect(character.consciousness.behavioralState).toBeDefined(); // Regenerated
        });
    });

    describe('Performance Under Error Conditions', () => {
        test('should handle rapid error recovery without degradation', () => {
            const characters = [];

            // Create multiple characters with various corruption scenarios
            for (let i = 0; i < 10; i++) {
                characters.push({
                    id: `char-${i}`,
                    consciousness: {
                        frequency: i % 2 === 0 ? NaN : 8.0, // Alternate corruption
                        coherence: i % 3 === 0 ? null : 0.7,
                        behavioralState: i % 4 === 0 ? {} : { energy: 'moderate', focus: 'balanced', mood: 'content', socialDrive: 0.6, riskTolerance: 0.5, ambition: 0.7 }
                    }
                });
            }

            const startTime = Date.now();

            // Process all characters through error recovery
            characters.forEach(character => {
                errorHandler.handleConsciousnessCorruption(character);
                behavioralStateService.getBehavioralModifier(character, 'social');
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete within reasonable time (under 1 second for 10 characters)
            expect(duration).toBeLessThan(1000);

            // All characters should be repaired
            characters.forEach(character => {
                expect(character.consciousness.frequency).toBeDefined();
                expect(character.consciousness.coherence).toBeDefined();
                expect(character.consciousness.behavioralState).toBeDefined();
            });
        });
    });

    describe('Error Propagation and Isolation', () => {
        test('should isolate errors to individual characters', () => {
            const characters = [
                {
                    id: 'healthy-char',
                    consciousness: {
                        frequency: 8.0,
                        coherence: 0.7,
                        behavioralState: { energy: 'moderate', focus: 'balanced', mood: 'content', socialDrive: 0.6, riskTolerance: 0.5, ambition: 0.7 }
                    }
                },
                {
                    id: 'corrupted-char',
                    consciousness: {
                        frequency: NaN,
                        coherence: null
                    }
                }
            ];

            // Process healthy character first
            const healthyModifier = behavioralStateService.getBehavioralModifier(characters[0], 'social');
            expect(healthyModifier).toBeDefined();

            // Process corrupted character
            const corruptedModifier = behavioralStateService.getBehavioralModifier(characters[1], 'social');
            expect(corruptedModifier).toBeDefined();

            // Both should work independently
            expect(characters[0].consciousness.frequency).toBe(8.0); // Unchanged
            expect(characters[1].consciousness.frequency).toBe(7.5); // Repaired
        });

        test('should not propagate memory service failures', () => {
            const character = {
                id: 'test-char',
                consciousness: {
                    frequency: 8.0,
                    coherence: 0.7,
                    behavioralState: { energy: 'moderate', focus: 'balanced', mood: 'content', socialDrive: 0.6, riskTolerance: 0.5, ambition: 0.7 }
                }
            };

            // Mock memory service to always fail
            behavioralStateService.memoryService = {
                getRelevantMemories: jest.fn().mockImplementation(() => {
                    throw new Error('Persistent memory service failure');
                })
            };

            // Should still work with fallbacks
            const modifier = behavioralStateService.getBehavioralModifier(character, 'social');
            expect(modifier).toBeDefined();
            expect(typeof modifier).toBe('number');
        });
    });

    describe('Diagnostic Integration', () => {
        test('should provide comprehensive diagnostics after errors', () => {
            // Cause various types of errors
            errorHandler.handleConsciousnessCorruption({ id: 'char1' });
            errorHandler.handleMissingBehavioralState({ id: 'char2' });

            const diagnostics = errorHandler.getDiagnostics();

            expect(diagnostics).toBeDefined();
            expect(diagnostics.totalErrors).toBeGreaterThan(0);
            expect(diagnostics.errorCounts).toBeDefined();
            expect(diagnostics.healthStatus).toBeDefined();
            expect(diagnostics.recommendations).toBeDefined();
        });

        test('should track error patterns over time', () => {
            // Simulate a series of related errors
            for (let i = 0; i < 5; i++) {
                errorHandler.handleConsciousnessCorruption({
                    id: `char-${i}`,
                    consciousness: { frequency: NaN }
                });
            }

            const diagnostics = errorHandler.getDiagnostics();
            expect(diagnostics.errorCounts.corruption.total).toBe(5);
            expect(diagnostics.recommendations.length).toBeGreaterThan(0);
        });
    });
});