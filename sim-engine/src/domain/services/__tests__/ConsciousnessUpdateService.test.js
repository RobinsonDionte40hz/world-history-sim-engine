/**
 * Unit Tests for ConsciousnessUpdateService
 *
 * Tests event-driven consciousness updates, parameter bounds enforcement,
 * and integration with EventSignificanceService.
 */

import ConsciousnessUpdateService from '../ConsciousnessUpdateService.js';
import EventSignificanceService from '../EventSignificanceService.js';

// Mock EventSignificanceService for testing
class MockEventSignificanceService {
    constructor() {
        this.significanceThreshold = 0.3;
        this.significanceResults = new Map();
        this.isSignificantResults = new Map();
    }

    calculateEventSignificance(event, context = {}) {
        const key = `${event.type}_${event.outcome || 'neutral'}_${context.characterImportance || 'normal'}`;
        return this.significanceResults.get(key) || 0.5;
    }

    isEventSignificant(event, context = {}) {
        const key = `${event.type}_${event.outcome || 'neutral'}_${context.characterImportance || 'normal'}`;
        return this.isSignificantResults.get(key) || false;
    }

    setSignificanceResult(eventType, outcome, importance, significance) {
        const key = `${eventType}_${outcome}_${importance}`;
        this.significanceResults.set(key, significance);
        this.isSignificantResults.set(key, significance >= this.significanceThreshold);
    }
}

// Mock Logger for testing
class MockLogger {
    constructor() {
        this.infoMessages = [];
        this.errorMessages = [];
    }

    info(message) {
        this.infoMessages.push(message);
    }

    error(message) {
        this.errorMessages.push(message);
    }
}

describe('ConsciousnessUpdateService', () => {
    let service;
    let mockEventSignificanceService;
    let mockLogger;

    beforeEach(() => {
        mockEventSignificanceService = new MockEventSignificanceService();
        mockLogger = new MockLogger();
        service = new ConsciousnessUpdateService(mockEventSignificanceService, mockLogger);
    });

    describe('constructor', () => {
        test('should initialize with provided services', () => {
            expect(service.eventSignificanceService).toBe(mockEventSignificanceService);
            expect(service.logger).toBe(mockLogger);
        });

        test('should initialize with default EventSignificanceService if not provided', () => {
            const defaultService = new ConsciousnessUpdateService();
            expect(defaultService.eventSignificanceService).toBeInstanceOf(EventSignificanceService);
            expect(defaultService.logger).toBeNull();
        });

        test('should have correct consciousness bounds', () => {
            expect(service.MIN_FREQUENCY).toBe(3.0);
            expect(service.MAX_FREQUENCY).toBe(15.0);
            expect(service.MIN_COHERENCE).toBe(0.2);
            expect(service.MAX_COHERENCE).toBe(1.0);
        });

        test('should have update rules defined', () => {
            expect(service.UPDATE_RULES).toBeDefined();
            expect(service.UPDATE_RULES.goal_completion).toBeDefined();
            expect(service.UPDATE_RULES.social_success).toBeDefined();
            expect(service.UPDATE_RULES.traumatic_encounter).toBeDefined();
        });
    });

    describe('processEvent', () => {
        const mockCharacter = {
            id: 'test-char-1',
            name: 'Test Character',
            consciousness: {
                frequency: 7.0,
                coherence: 0.5
            }
        };

        test('should not update consciousness for insignificant events', () => {
            const insignificantEvent = { type: 'minor_interaction', outcome: 'neutral' };
            mockEventSignificanceService.setSignificanceResult('minor_interaction', 'neutral', 'normal', 0.2);

            const result = service.processEvent(mockCharacter, insignificantEvent);

            expect(result.success).toBe(true);
            expect(result.updated).toBe(false);
            expect(result.reason).toBe('Event not significant enough');
            expect(result.significance).toBe(0.2);
        });

        test('should update consciousness for significant events', () => {
            const significantEvent = { type: 'goal_completion', outcome: 'success' };
            mockEventSignificanceService.setSignificanceResult('goal_completion', 'success', 'normal', 0.8);

            const originalFrequency = mockCharacter.consciousness.frequency;
            const originalCoherence = mockCharacter.consciousness.coherence;

            const result = service.processEvent(mockCharacter, significantEvent);

            expect(result.success).toBe(true);
            expect(result.updated).toBe(true);
            expect(result.changes).toBeDefined();
            expect(result.newState).toBeDefined();
            expect(mockCharacter.consciousness.frequency).toBeGreaterThan(originalFrequency);
            expect(mockCharacter.consciousness.coherence).toBeGreaterThan(originalCoherence);
        });

        test('should handle missing consciousness gracefully', () => {
            const characterWithoutConsciousness = {
                id: 'test-char-2',
                name: 'Character Without Consciousness'
            };

            const significantEvent = { type: 'goal_completion', outcome: 'success' };
            mockEventSignificanceService.setSignificanceResult('goal_completion', 'success', 'normal', 0.8);

            const result = service.processEvent(characterWithoutConsciousness, significantEvent);

            expect(result.success).toBe(true);
            expect(result.updated).toBe(true);
            expect(characterWithoutConsciousness.consciousness).toBeDefined();
            expect(characterWithoutConsciousness.consciousness.frequency).toBeGreaterThan(0);
            expect(characterWithoutConsciousness.consciousness.coherence).toBeGreaterThan(0);
        });

        test('should handle errors gracefully', () => {
            const faultyCharacter = null;
            const event = { type: 'test_event' };

            const result = service.processEvent(faultyCharacter, event);

            expect(result.success).toBe(false);
            expect(result.updated).toBe(false);
            expect(result.error).toContain('Character and event are required');
            expect(mockLogger.errorMessages.length).toBeGreaterThan(0);
        });

        test('should log successful updates', () => {
            const significantEvent = { type: 'social_success', outcome: 'success' };
            mockEventSignificanceService.setSignificanceResult('social_success', 'success', 'normal', 0.8);

            service.processEvent(mockCharacter, significantEvent);

            expect(mockLogger.infoMessages.length).toBeGreaterThan(0);
            expect(mockLogger.infoMessages[0]).toContain('Consciousness updated');
        });
    });

    describe('updateConsciousnessFromEvent', () => {
        test('should apply goal completion updates correctly', () => {
            const mockCharacter = {
                id: 'test-char-1',
                consciousness: {
                    frequency: 7.0,
                    coherence: 0.5
                }
            };

            const event = { type: 'goal_completion', outcome: 'success' };

            const result = service.updateConsciousnessFromEvent(mockCharacter, event);

            expect(result.changes.frequency.after).toBe(7.3); // 7.0 + 0.3
            expect(result.changes.coherence.after).toBe(0.55); // 0.5 + 0.05
            expect(result.changes.eventType).toBe('goal_completion');
            expect(result.changes.rule).toContain('Goal completion');
        });

        test('should apply goal failure updates correctly', () => {
            const mockCharacter = {
                id: 'test-char-1',
                consciousness: {
                    frequency: 7.0,
                    coherence: 0.5
                }
            };

            const event = { type: 'goal_failure', outcome: 'failure' };

            const result = service.updateConsciousnessFromEvent(mockCharacter, event);

            expect(result.changes.frequency.after).toBe(6.5); // 7.0 - 0.5
            expect(result.changes.coherence.after).toBe(0.4); // 0.5 - 0.1
            expect(result.changes.eventType).toBe('goal_failure');
        });

        test('should apply traumatic encounter updates correctly', () => {
            const mockCharacter = {
                id: 'test-char-1',
                consciousness: {
                    frequency: 7.0,
                    coherence: 0.5
                }
            };

            const event = { type: 'traumatic_encounter', outcome: 'failure' };

            const result = service.updateConsciousnessFromEvent(mockCharacter, event);

            expect(result.changes.frequency.after).toBe(6.0); // 7.0 - 1.0
            expect(result.changes.coherence.after).toBe(0.3); // 0.5 - 0.2
        });

        test('should apply default updates for unknown event types', () => {
            const mockCharacter = {
                id: 'test-char-1',
                consciousness: {
                    frequency: 7.0,
                    coherence: 0.5
                }
            };

            const event = { type: 'unknown_event', outcome: 'success' };

            const result = service.updateConsciousnessFromEvent(mockCharacter, event);

            expect(result.changes.frequency.after).toBe(7.1); // 7.0 + 0.1 (default positive)
            expect(result.changes.coherence.after).toBe(0.52); // 0.5 + 0.02 (default positive)
            expect(result.changes.rule).toContain('Default update');
        });

        test('should handle negative outcome defaults', () => {
            const mockCharacter = {
                id: 'test-char-1',
                consciousness: {
                    frequency: 7.0,
                    coherence: 0.5
                }
            };

            const event = { type: 'unknown_negative_event', outcome: 'failure' };

            const result = service.updateConsciousnessFromEvent(mockCharacter, event);

            expect(result.changes.frequency.after).toBe(6.8); // 7.0 - 0.2 (default negative)
            expect(result.changes.coherence.after).toBe(0.47); // 0.5 - 0.03 (default negative)
        });
    });

    describe('bounds enforcement', () => {
        test('should clamp frequency to minimum bound', () => {
            const character = {
                consciousness: {
                    frequency: 3.5,
                    coherence: 0.5
                }
            };

            const event = { type: 'traumatic_encounter' };
            service.updateConsciousnessFromEvent(character, event);

            expect(character.consciousness.frequency).toBe(3.0); // 3.5 - 1.0 = 2.5, clamped to 3.0
        });

        test('should clamp frequency to maximum bound', () => {
            const character = {
                consciousness: {
                    frequency: 14.9,
                    coherence: 0.5
                }
            };

            const event = { type: 'goal_completion' };
            service.updateConsciousnessFromEvent(character, event);

            expect(character.consciousness.frequency).toBe(15.0); // 14.9 + 0.3 = 15.2, clamped to 15.0
        });

        test('should clamp coherence to minimum bound', () => {
            const character = {
                consciousness: {
                    frequency: 7.0,
                    coherence: 0.3
                }
            };

            const event = { type: 'betrayal' };
            service.updateConsciousnessFromEvent(character, event);

            expect(character.consciousness.coherence).toBe(0.2); // 0.3 - 0.15 = 0.15, clamped to 0.2
        });

        test('should clamp coherence to maximum bound', () => {
            const character = {
                consciousness: {
                    frequency: 7.0,
                    coherence: 0.95
                }
            };

            const event = { type: 'goal_completion' };
            service.updateConsciousnessFromEvent(character, event);

            expect(character.consciousness.coherence).toBe(1.0); // 0.95 + 0.05 = 1.0, within bounds
        });
    });

    describe('clamp methods', () => {
        test('clampFrequency should enforce bounds', () => {
            expect(service.clampFrequency(2.0)).toBe(3.0);
            expect(service.clampFrequency(16.0)).toBe(15.0);
            expect(service.clampFrequency(7.0)).toBe(7.0);
        });

        test('clampCoherence should enforce bounds', () => {
            expect(service.clampCoherence(0.1)).toBe(0.2);
            expect(service.clampCoherence(1.2)).toBe(1.0);
            expect(service.clampCoherence(0.5)).toBe(0.5);
        });
    });

    describe('validateConsciousnessBounds', () => {
        test('should validate valid consciousness', () => {
            const validConsciousness = {
                frequency: 7.0,
                coherence: 0.5
            };

            const result = service.validateConsciousnessBounds(validConsciousness);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should detect frequency too low', () => {
            const invalidConsciousness = {
                frequency: 2.0,
                coherence: 0.5
            };

            const result = service.validateConsciousnessBounds(invalidConsciousness);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Frequency must be between 3 and 15');
        });

        test('should detect frequency too high', () => {
            const invalidConsciousness = {
                frequency: 16.0,
                coherence: 0.5
            };

            const result = service.validateConsciousnessBounds(invalidConsciousness);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Frequency must be between 3 and 15');
        });

        test('should detect coherence too low', () => {
            const invalidConsciousness = {
                frequency: 7.0,
                coherence: 0.1
            };

            const result = service.validateConsciousnessBounds(invalidConsciousness);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Coherence must be between 0.2 and 1.0');
        });

        test('should detect coherence too high', () => {
            const invalidConsciousness = {
                frequency: 7.0,
                coherence: 1.2
            };

            const result = service.validateConsciousnessBounds(invalidConsciousness);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Coherence must be between 0.2 and 1.0');
        });

        test('should handle missing consciousness', () => {
            const result = service.validateConsciousnessBounds(null);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Consciousness object is required');
        });
    });

    describe('getConsciousnessBounds', () => {
        test('should return correct bounds', () => {
            const bounds = service.getConsciousnessBounds();

            expect(bounds.frequency.min).toBe(3.0);
            expect(bounds.frequency.max).toBe(15.0);
            expect(bounds.coherence.min).toBe(0.2);
            expect(bounds.coherence.max).toBe(1.0);
        });
    });

    describe('update rule management', () => {
        test('should get supported event types', () => {
            const eventTypes = service.getSupportedEventTypes();
            expect(eventTypes).toHaveProperty('goal_completion');
            expect(eventTypes).toHaveProperty('social_success');
            expect(eventTypes).toHaveProperty('traumatic_encounter');
        });

        test('should set custom update rule', () => {
            const customRule = {
                frequency: 0.5,
                coherence: 0.1,
                description: 'Custom test rule'
            };

            service.setUpdateRule('custom_event', customRule);

            const eventTypes = service.getSupportedEventTypes();
            expect(eventTypes.custom_event).toEqual(customRule);
        });

        test('should reject invalid update rules', () => {
            expect(() => service.setUpdateRule('', { frequency: 0.5, coherence: 0.1 })).toThrow();
            expect(() => service.setUpdateRule('test', null)).toThrow();
            expect(() => service.setUpdateRule('test', { frequency: 'invalid', coherence: 0.1 })).toThrow();
        });
    });

    describe('significance threshold management', () => {
        test('should get default significance threshold', () => {
            expect(service.getSignificanceThreshold()).toBe(0.3);
        });

        test('should set significance threshold', () => {
            service.setSignificanceThreshold(0.5);
            expect(service.getSignificanceThreshold()).toBe(0.5);
        });

        test('should reject invalid significance thresholds', () => {
            expect(() => service.setSignificanceThreshold(-0.1)).toThrow();
            expect(() => service.setSignificanceThreshold(1.5)).toThrow();
            expect(() => service.setSignificanceThreshold('invalid')).toThrow();
        });
    });

    describe('baseline operations', () => {
        test('should reset consciousness to baseline', () => {
            const character = {
                consciousness: {
                    frequency: 12.0,
                    coherence: 0.8
                }
            };

            const result = service.resetConsciousnessToBaseline(character);

            expect(result.success).toBe(true);
            expect(result.originalState.frequency).toBe(12.0);
            expect(result.originalState.coherence).toBe(0.8);
            expect(character.consciousness.frequency).toBe(7.0);
            expect(character.consciousness.coherence).toBe(0.5);
        });

        test('should apply baseline drift', () => {
            const character = {
                consciousness: {
                    frequency: 12.0,
                    coherence: 0.8
                }
            };

            const result = service.applyBaselineDrift(character, 0.5);

            expect(result.success).toBe(true);
            expect(result.driftFactor).toBe(0.5);
            // Frequency: 12.0 + (7.0 - 12.0) * 0.5 = 12.0 - 2.5 = 9.5
            expect(character.consciousness.frequency).toBe(9.5);
            // Coherence: 0.8 + (0.5 - 0.8) * 0.5 = 0.8 - 0.15 = 0.65
            expect(character.consciousness.coherence).toBe(0.65);
        });

        test('should handle invalid drift factors', () => {
            const character = {
                consciousness: {
                    frequency: 7.0,
                    coherence: 0.5
                }
            };

            expect(() => service.applyBaselineDrift(character, -0.1)).toThrow();
            expect(() => service.applyBaselineDrift(character, 1.5)).toThrow();
            expect(() => service.applyBaselineDrift(character, 'invalid')).toThrow();
        });
    });

    describe('integration scenarios', () => {
        test('should handle complex event sequence', () => {
            const character = {
                id: 'complex-test-char',
                consciousness: {
                    frequency: 7.0,
                    coherence: 0.5
                }
            };

            // Sequence: goal completion -> social success -> minor failure
            const events = [
                { type: 'goal_completion', outcome: 'success' },
                { type: 'social_success', outcome: 'success' },
                { type: 'economic_loss', outcome: 'failure' }
            ];

            events.forEach(event => {
                mockEventSignificanceService.setSignificanceResult(event.type, event.outcome, 'normal', 0.8);
                service.processEvent(character, event);
            });

            // Should have accumulated changes
            expect(character.consciousness.frequency).toBeGreaterThan(7.0);
            expect(character.consciousness.coherence).toBeGreaterThan(0.5);
        });

        test('should handle edge case with extreme values', () => {
            const character = {
                consciousness: {
                    frequency: 14.8,
                    coherence: 0.95
                }
            };

            const event = { type: 'goal_completion', outcome: 'success' };
            mockEventSignificanceService.setSignificanceResult('goal_completion', 'success', 'normal', 0.8);

            const result = service.processEvent(character, event);

            expect(result.success).toBe(true);
            expect(character.consciousness.frequency).toBe(15.0); // Clamped to max
            expect(character.consciousness.coherence).toBe(1.0); // Clamped to max
        });

        test('should handle character with missing properties', () => {
            const incompleteCharacter = {
                id: 'incomplete-char'
                // Missing consciousness, name, etc.
            };

            const event = { type: 'goal_completion', outcome: 'success' };
            mockEventSignificanceService.setSignificanceResult('goal_completion', 'success', 'normal', 0.8);

            const result = service.processEvent(incompleteCharacter, event);

            expect(result.success).toBe(true);
            expect(result.updated).toBe(true);
            expect(incompleteCharacter.consciousness).toBeDefined();
        });
    });
});