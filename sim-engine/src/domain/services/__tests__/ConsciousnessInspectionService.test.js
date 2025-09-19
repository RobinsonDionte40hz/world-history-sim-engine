/**
 * ConsciousnessInspectionService Test Suite
 *
 * Comprehensive tests for debugging utilities, decision factor traceability,
 * significant events history display, and behavioral inconsistency detection.
 */

import ConsciousnessInspectionService from '../ConsciousnessInspectionService.js';
import BehavioralStateService from '../BehavioralStateService.js';
import SignificantMemoryService from '../SignificantMemoryService.js';
import EventSignificanceService from '../EventSignificanceService.js';

// Mock dependencies
jest.mock('../BehavioralStateService.js');
jest.mock('../SignificantMemoryService.js');
jest.mock('../EventSignificanceService.js');

describe('ConsciousnessInspectionService', () => {
    let inspectionService;
    let mockBehavioralStateService;
    let mockMemoryService;
    let mockEventSignificanceService;

    // Sample test data
    const createMockCharacter = (overrides = {}) => ({
        id: 'test-character-1',
        name: 'Test Character',
        consciousness: {
            baseFrequency: 8.5,
            baseCoherence: 0.75,
            lastUpdate: Date.now() - 1000,
            updateTriggerThreshold: 0.3,
            behavioralState: {
                energy: 'moderate',
                focus: 'balanced',
                mood: 'content',
                socialDrive: 0.6,
                riskTolerance: 0.4,
                ambition: 0.7
            },
            significantEvents: [
                {
                    type: 'social',
                    significance: 0.8,
                    timestamp: Date.now() - 3600000, // 1 hour ago
                    outcome: 'success',
                    emotionalImpact: 0.3
                },
                {
                    type: 'combat',
                    significance: 0.6,
                    timestamp: Date.now() - 1800000, // 30 minutes ago
                    outcome: 'failure',
                    emotionalImpact: -0.2
                }
            ]
        },
        significantMemories: [
            {
                interactionType: 'social',
                significance: 0.7,
                outcome: 'positive',
                timestamp: Date.now() - 7200000, // 2 hours ago
                emotionalImpact: 0.4
            },
            {
                interactionType: 'trade',
                significance: 0.5,
                outcome: 'neutral',
                timestamp: Date.now() - 3600000, // 1 hour ago
                emotionalImpact: 0.1
            }
        ],
        ...overrides
    });

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create mock instances
        mockBehavioralStateService = new BehavioralStateService();
        mockMemoryService = new SignificantMemoryService();
        mockEventSignificanceService = new EventSignificanceService();

        // Setup mock behaviors
        mockBehavioralStateService.calculateDecisionFactor.mockReturnValue(1.2);
        mockMemoryService.getRelevantMemories.mockReturnValue([]);

        // Create service instance
        inspectionService = new ConsciousnessInspectionService(
            mockBehavioralStateService,
            mockMemoryService,
            mockEventSignificanceService
        );
    });

    describe('inspectBehavioralState', () => {
        test('should return comprehensive behavioral state inspection', () => {
            const character = createMockCharacter();

            const result = inspectionService.inspectBehavioralState(character);

            expect(result).toHaveProperty('characterId', 'test-character-1');
            expect(result).toHaveProperty('characterName', 'Test Character');
            expect(result).toHaveProperty('consciousnessParameters');
            expect(result).toHaveProperty('behavioralState');
            expect(result).toHaveProperty('behavioralAnalysis');
            expect(result).toHaveProperty('recentEvents');
            expect(result).toHaveProperty('memorySummary');
            expect(result).toHaveProperty('consistencyCheck');
        });

        test('should analyze behavioral components correctly', () => {
            const character = createMockCharacter();

            const result = inspectionService.inspectBehavioralState(character);

            expect(result.behavioralAnalysis.energyLevel).toHaveProperty('interpretation');
            expect(result.behavioralAnalysis.energyLevel).toHaveProperty('implications');
            expect(result.behavioralAnalysis.focusLevel).toHaveProperty('interpretation');
            expect(result.behavioralAnalysis.moodState).toHaveProperty('interpretation');
        });

        test('should analyze numeric components correctly', () => {
            const character = createMockCharacter();

            const result = inspectionService.inspectBehavioralState(character);

            expect(result.behavioralAnalysis.socialEngagement).toHaveProperty('value', 0.6);
            expect(result.behavioralAnalysis.socialEngagement).toHaveProperty('percentile', 60);
            expect(result.behavioralAnalysis.riskProfile).toHaveProperty('interpretation');
            expect(result.behavioralAnalysis.ambitionLevel).toHaveProperty('implications');
        });

        test('should throw error for character without consciousness', () => {
            const character = { id: 'test', name: 'Test' };

            expect(() => {
                inspectionService.inspectBehavioralState(character);
            }).toThrow('Character must have consciousness system');
        });
    });

    describe('traceDecisionFactor', () => {
        test('should return detailed decision factor breakdown', () => {
            const character = createMockCharacter();
            const interactionType = 'social';
            const context = { urgency: 'high' };

            const result = inspectionService.traceDecisionFactor(character, interactionType, context);

            expect(result).toHaveProperty('characterId', 'test-character-1');
            expect(result).toHaveProperty('interactionType', 'social');
            expect(result).toHaveProperty('calculationTime');
            expect(result).toHaveProperty('finalDecisionFactor');
            expect(result).toHaveProperty('breakdown');
            expect(result).toHaveProperty('componentAnalysis');
            expect(result).toHaveProperty('recommendations');
            expect(result).toHaveProperty('relevantMemories');

            expect(mockBehavioralStateService.calculateDecisionFactor).toHaveBeenCalledWith(
                character,
                interactionType,
                context
            );
        });

        test('should generate recommendations based on decision factor', () => {
            // Mock very low decision factor
            mockBehavioralStateService.calculateDecisionFactor.mockReturnValue(0.2);

            const character = createMockCharacter();
            const result = inspectionService.traceDecisionFactor(character, 'combat', {});

            expect(result.recommendations).toContainEqual(
                expect.objectContaining({
                    type: 'low_motivation',
                    message: expect.stringContaining('low motivation')
                })
            );
        });

        test('should handle memory service integration', () => {
            const mockMemories = [
                { interactionType: 'social', significance: 0.8, outcome: 'positive' }
            ];
            mockMemoryService.getRelevantMemories.mockReturnValue(mockMemories);

            const character = createMockCharacter();
            const result = inspectionService.traceDecisionFactor(character, 'social', {});

            expect(mockMemoryService.getRelevantMemories).toHaveBeenCalledWith(
                character,
                'social',
                5
            );
            expect(result.relevantMemories).toHaveLength(1);
        });
    });

    describe('displaySignificantEventsHistory', () => {
        test('should return formatted events history with analysis', () => {
            const character = createMockCharacter();

            const result = inspectionService.displaySignificantEventsHistory(character);

            expect(result).toHaveProperty('characterId', 'test-character-1');
            expect(result).toHaveProperty('totalEvents', 2);
            expect(result).toHaveProperty('displayedEvents', 2);
            expect(result).toHaveProperty('events');
            expect(result).toHaveProperty('analysis');
            expect(result).toHaveProperty('patterns');
            expect(result).toHaveProperty('impactSummary');

            expect(result.events).toHaveLength(2);
            expect(result.events[0]).toHaveProperty('type', 'combat'); // Most recent first
            expect(result.events[0]).toHaveProperty('description');
            expect(result.events[0]).toHaveProperty('timeAgo');
        });

        test('should apply event type filter', () => {
            const character = createMockCharacter();
            const filters = { eventType: 'social' };

            const result = inspectionService.displaySignificantEventsHistory(character, 20, filters);

            expect(result.filteredEvents).toBe(1);
            expect(result.events).toHaveLength(1);
            expect(result.events[0].type).toBe('social');
        });

        test('should apply significance filter', () => {
            const character = createMockCharacter();
            const filters = { minSignificance: 0.7 };

            const result = inspectionService.displaySignificantEventsHistory(character, 20, filters);

            expect(result.filteredEvents).toBe(1);
            expect(result.events).toHaveLength(1);
            expect(result.events[0].significance).toBe(0.8);
        });

        test('should apply time range filter', () => {
            const character = createMockCharacter();
            const thirtyMinutesAgo = Date.now() - 1800000; // 30 minutes ago
            const filters = { timeRange: { start: thirtyMinutesAgo, end: Date.now() } };

            const result = inspectionService.displaySignificantEventsHistory(character, 20, filters);

            expect(result.filteredEvents).toBe(1); // Only the more recent event (30 minutes ago)
        });

        test('should limit number of events returned', () => {
            const character = createMockCharacter();
            const result = inspectionService.displaySignificantEventsHistory(character, 1);

            expect(result.displayedEvents).toBe(1);
            expect(result.events).toHaveLength(1);
        });
    });

    describe('detectBehavioralInconsistencies', () => {
        test('should return diagnostic report for healthy character', () => {
            const character = createMockCharacter();

            const result = inspectionService.detectBehavioralInconsistencies(character);

            expect(result).toHaveProperty('characterId', 'test-character-1');
            expect(result).toHaveProperty('overallHealth', 'healthy');
            expect(result).toHaveProperty('criticalIssues', 0);
            expect(result).toHaveProperty('warnings');
            expect(result).toHaveProperty('inconsistencies');
            expect(result).toHaveProperty('recommendations');
            expect(result).toHaveProperty('systemMetrics');
            expect(result).toHaveProperty('performanceIndicators');
        });

        test('should detect consciousness parameter bounds violations', () => {
            const character = createMockCharacter({
                consciousness: {
                    ...createMockCharacter().consciousness,
                    baseFrequency: 20 // Above maximum of 15
                }
            });

            const result = inspectionService.detectBehavioralInconsistencies(character);

            expect(result.overallHealth).toBe('issues_detected');
            expect(result.criticalIssues).toBeGreaterThan(0);
            expect(result.inconsistencies).toContainEqual(
                expect.objectContaining({
                    type: 'parameter_bounds',
                    parameter: 'baseFrequency'
                })
            );
        });

        test('should detect missing behavioral state', () => {
            const character = createMockCharacter({
                consciousness: {
                    baseFrequency: 8.5,
                    baseCoherence: 0.75,
                    // Missing behavioralState
                }
            });

            const result = inspectionService.detectBehavioralInconsistencies(character);

            expect(result.criticalIssues).toBeGreaterThan(0);
            expect(result.inconsistencies).toContainEqual(
                expect.objectContaining({
                    type: 'missing_behavioral_state'
                })
            );
        });

        test('should detect memory consistency issues', () => {
            const character = createMockCharacter({
                significantMemories: Array(60).fill().map((_, i) => ({
                    interactionType: 'test',
                    significance: 0.5,
                    outcome: 'neutral',
                    timestamp: Date.now() - i * 1000
                })) // 60 memories, exceeds limit of 50
            });

            const result = inspectionService.detectBehavioralInconsistencies(character);

            expect(result.warnings).toContainEqual(
                expect.objectContaining({
                    type: 'memory_limit_exceeded'
                })
            );
        });

        test('should detect invalid memory significance', () => {
            const character = createMockCharacter({
                significantMemories: [
                    {
                        interactionType: 'test',
                        significance: 1.5, // Invalid: above 1.0
                        outcome: 'neutral',
                        timestamp: Date.now()
                    }
                ]
            });

            const result = inspectionService.detectBehavioralInconsistencies(character);

            expect(result.warnings).toContainEqual(
                expect.objectContaining({
                    type: 'invalid_memory_significance'
                })
            );
        });
    });

    describe('Behavioral Component Analysis', () => {
        test('should interpret energy levels correctly', () => {
            const character = createMockCharacter({
                consciousness: {
                    ...createMockCharacter().consciousness,
                    behavioralState: { energy: 'low' }
                }
            });

            const result = inspectionService.inspectBehavioralState(character);

            expect(result.behavioralAnalysis.energyLevel.interpretation)
                .toContain('reduced activity');
            expect(result.behavioralAnalysis.energyLevel.implications)
                .toContain('Reduced interaction frequency');
        });

        test('should interpret focus levels correctly', () => {
            const character = createMockCharacter({
                consciousness: {
                    ...createMockCharacter().consciousness,
                    behavioralState: { focus: 'focused' }
                }
            });

            const result = inspectionService.inspectBehavioralState(character);

            expect(result.behavioralAnalysis.focusLevel.interpretation)
                .toContain('intense concentration');
            expect(result.behavioralAnalysis.focusLevel.implications)
                .toContain('Excellent at complex tasks');
        });

        test('should interpret mood states correctly', () => {
            const character = createMockCharacter({
                consciousness: {
                    ...createMockCharacter().consciousness,
                    behavioralState: { mood: 'excited' }
                }
            });

            const result = inspectionService.inspectBehavioralState(character);

            expect(result.behavioralAnalysis.moodState.interpretation)
                .toContain('high positive emotional energy');
            expect(result.behavioralAnalysis.moodState.implications)
                .toContain('High social engagement');
        });

        test('should interpret numeric components correctly', () => {
            const character = createMockCharacter({
                consciousness: {
                    ...createMockCharacter().consciousness,
                    behavioralState: {
                        socialDrive: 0.2, // Low
                        riskTolerance: 0.8, // High
                        ambition: 0.9 // High
                    }
                }
            });

            const result = inspectionService.inspectBehavioralState(character);

            expect(result.behavioralAnalysis.socialEngagement.interpretation)
                .toContain('Low social motivation');
            expect(result.behavioralAnalysis.riskProfile.interpretation)
                .toContain('Risk-seeking');
            expect(result.behavioralAnalysis.ambitionLevel.interpretation)
                .toContain('High ambition');
        });
    });

    describe('Event Analysis and Patterns', () => {
        test('should analyze events history correctly', () => {
            const character = createMockCharacter();

            const result = inspectionService.displaySignificantEventsHistory(character);

            expect(result.analysis).toHaveProperty('averageSignificance');
            expect(result.analysis).toHaveProperty('eventTypes');
            expect(result.analysis.eventTypes).toHaveProperty('social', 1);
            expect(result.analysis.eventTypes).toHaveProperty('combat', 1);
        });

        test('should identify repeated event patterns', () => {
            const character = createMockCharacter({
                consciousness: {
                    ...createMockCharacter().consciousness,
                    significantEvents: Array(4).fill().map((_, i) => ({
                        type: 'social',
                        significance: 0.6,
                        timestamp: Date.now() - i * 1000,
                        outcome: 'success',
                        emotionalImpact: 0.2
                    }))
                }
            });

            const result = inspectionService.displaySignificantEventsHistory(character);

            expect(result.patterns).toContainEqual(
                expect.objectContaining({
                    type: 'repeated_event_type',
                    eventType: 'social',
                    frequency: 4
                })
            );
        });

        test('should calculate event impact correctly', () => {
            const character = createMockCharacter();

            const result = inspectionService.displaySignificantEventsHistory(character);

            expect(result.impactSummary).toHaveProperty('totalSignificance');
            expect(result.impactSummary).toHaveProperty('positiveEvents', 1);
            expect(result.impactSummary).toHaveProperty('negativeEvents', 1);
            expect(result.impactSummary).toHaveProperty('neutralEvents', 0);
            expect(result.impactSummary).toHaveProperty('averageEmotionalImpact');
        });
    });

    describe('Memory Analysis', () => {
        test('should provide memory summary correctly', () => {
            const character = createMockCharacter();

            const result = inspectionService.inspectBehavioralState(character);

            expect(result.memorySummary).toHaveProperty('totalMemories', 2);
            expect(result.memorySummary).toHaveProperty('averageSignificance');
            expect(result.memorySummary).toHaveProperty('memoryTypes');
            expect(result.memorySummary.memoryTypes).toHaveProperty('social', 1);
            expect(result.memorySummary.memoryTypes).toHaveProperty('trade', 1);
            expect(result.memorySummary).toHaveProperty('recentMemories');
            expect(result.memorySummary.recentMemories).toHaveLength(2);
        });

        test('should handle empty memory list', () => {
            const character = createMockCharacter({
                significantMemories: []
            });

            const result = inspectionService.inspectBehavioralState(character);

            expect(result.memorySummary.totalMemories).toBe(0);
            expect(result.memorySummary.averageSignificance).toBe(0);
            expect(result.memorySummary.memoryTypes).toEqual({});
        });
    });

    describe('Consistency Checking', () => {
        test('should detect frequency-energy consistency issues', () => {
            const character = createMockCharacter({
                consciousness: {
                    ...createMockCharacter().consciousness,
                    baseFrequency: 12, // High frequency
                    behavioralState: {
                        ...createMockCharacter().consciousness.behavioralState,
                        energy: 'low' // Inconsistent with high frequency
                    }
                }
            });

            const result = inspectionService.inspectBehavioralState(character);

            expect(result.consistencyCheck.isConsistent).toBe(false);
            expect(result.consistencyCheck.issues).toContainEqual(
                expect.objectContaining({
                    type: 'frequency_energy_mismatch'
                })
            );
        });

        test('should detect coherence-focus consistency issues', () => {
            const character = createMockCharacter({
                consciousness: {
                    ...createMockCharacter().consciousness,
                    baseCoherence: 0.9, // High coherence
                    behavioralState: {
                        ...createMockCharacter().consciousness.behavioralState,
                        focus: 'scattered' // Inconsistent with high coherence
                    }
                }
            });

            const result = inspectionService.inspectBehavioralState(character);

            expect(result.consistencyCheck.isConsistent).toBe(false);
            expect(result.consistencyCheck.issues).toContainEqual(
                expect.objectContaining({
                    type: 'coherence_focus_mismatch'
                })
            );
        });
    });

    describe('Error Handling', () => {
        test('should handle missing consciousness gracefully', () => {
            const character = { id: 'test', name: 'Test' };

            expect(() => {
                inspectionService.inspectBehavioralState(character);
            }).toThrow('Character must have consciousness system');

            expect(() => {
                inspectionService.traceDecisionFactor(character, 'test', {});
            }).toThrow('Character must have consciousness system');

            expect(() => {
                inspectionService.displaySignificantEventsHistory(character);
            }).toThrow('Character must have consciousness system');

            expect(() => {
                inspectionService.detectBehavioralInconsistencies(character);
            }).toThrow('Character must have consciousness system');
        });

        test('should handle decision factor calculation errors', () => {
            mockBehavioralStateService.calculateDecisionFactor.mockImplementation(() => {
                throw new Error('Calculation failed');
            });

            const character = createMockCharacter();

            const result = inspectionService.detectBehavioralInconsistencies(character);

            expect(result.inconsistencies).toContainEqual(
                expect.objectContaining({
                    type: 'decision_calculation_error'
                })
            );
        });
    });

    describe('Performance and Metrics', () => {
        test('should track decision factor calculation performance', () => {
            const character = createMockCharacter();

            const result = inspectionService.traceDecisionFactor(character, 'social', {});

            expect(result).toHaveProperty('calculationTime');
            expect(typeof result.calculationTime).toBe('number');
            expect(result.calculationTime).toBeGreaterThanOrEqual(0);
        });

        test('should provide system metrics', () => {
            const character = createMockCharacter();

            const result = inspectionService.detectBehavioralInconsistencies(character);

            expect(result.systemMetrics).toHaveProperty('memoryUsage', 2);
            expect(result.systemMetrics).toHaveProperty('eventHistory', 2);
            expect(result.systemMetrics).toHaveProperty('lastUpdate');
        });

        test('should provide performance indicators', () => {
            const character = createMockCharacter();

            const result = inspectionService.detectBehavioralInconsistencies(character);

            expect(result.performanceIndicators).toHaveProperty('updateFrequency');
            expect(result.performanceIndicators).toHaveProperty('memoryEfficiency');
            expect(result.performanceIndicators).toHaveProperty('computationalLoad');
        });
    });
});
