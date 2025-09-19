/**
 * Unit Tests for BehavioralStateService
 *
 * Tests decision factor calculations, interaction type mappings,
 * and bounded decision factor calculation (0.1x to 3.0x range).
 */

import BehavioralStateService from '../BehavioralStateService.js';

// Mock MemoryService for testing
class MockMemoryService {
    getRelevantMemories(character, interactionType, context) {
        // Return mock memories based on interaction type
        const mockMemories = {
            'social': [
                { outcome: 'positive', significance: 0.8 },
                { outcome: 'negative', significance: 0.3 }
            ],
            'combat': [
                { outcome: 'positive', significance: 0.6 }
            ],
            'exploration': [],
            'negative_test': [
                { outcome: 'negative', significance: 0.8 },
                { outcome: 'negative', significance: 0.6 }
            ],
            'mixed_test': [
                { outcome: 'positive', significance: 0.8 },
                { outcome: 'negative', significance: 0.6 }
            ]
        };

        return mockMemories[interactionType] || [];
    }
}

// Mock Logger for testing
class MockLogger {
    constructor() {
        this.warnings = [];
        this.errors = [];
    }

    warn(message) {
        this.warnings.push(message);
    }

    error(message) {
        this.errors.push(message);
    }
}

describe('BehavioralStateService', () => {
    let service;
    let mockMemoryService;
    let mockLogger;

    beforeEach(() => {
        mockMemoryService = new MockMemoryService();
        mockLogger = new MockLogger();
        service = new BehavioralStateService(mockMemoryService, mockLogger);
    });

    describe('constructor', () => {
        test('should initialize with default values', () => {
            const defaultService = new BehavioralStateService();
            expect(defaultService.memoryService).toBeNull();
            expect(defaultService.logger).toBeNull(); // No logger provided, defaults to null
            expect(defaultService.MIN_DECISION_FACTOR).toBe(0.1);
            expect(defaultService.MAX_DECISION_FACTOR).toBe(3.0);
        });

        test('should initialize with provided services', () => {
            expect(service.memoryService).toBe(mockMemoryService);
            expect(service.logger).toBe(mockLogger);
        });

        test('should have interaction type mappings', () => {
            expect(service.interactionTypeMappings).toBeDefined();
            expect(service.interactionTypeMappings.social).toBeDefined();
            expect(service.interactionTypeMappings.combat).toBeDefined();
            expect(service.interactionTypeMappings.exploration).toBeDefined();
        });
    });

    describe('getBehavioralModifier', () => {
        const mockCharacter = {
            personality: {
                getAllTraits: () => ({
                    extrovert: 0.8,
                    empathy: 0.7,
                    aggression: 0.3
                })
            },
            consciousness: {
                getBehavioralState: () => ({
                    energy: 0.8,
                    focus: 0.7,
                    socialDrive: 0.9,
                    riskTolerance: 0.6,
                    ambition: 0.8
                })
            },
            energy: 80,
            maxEnergy: 100,
            health: 90,
            mood: 70,
            memories: []
        };

        test('should return bounded modifier for known interaction type', () => {
            const modifier = service.getBehavioralModifier(mockCharacter, 'social');
            expect(modifier).toBeGreaterThanOrEqual(0.1);
            expect(modifier).toBeLessThanOrEqual(3.0);
            expect(typeof modifier).toBe('number');
        });

        test('should return neutral modifier for unknown interaction type', () => {
            const modifier = service.getBehavioralModifier(mockCharacter, 'unknown_type');
            expect(modifier).toBe(1.0);
            expect(mockLogger.warnings).toContain('Unknown interaction type: unknown_type, using default');
        });

        test('should handle missing character data gracefully', () => {
            const modifier = service.getBehavioralModifier({}, 'social');
            expect(modifier).toBeGreaterThanOrEqual(0.1);
            expect(modifier).toBeLessThanOrEqual(3.0);
        });

        test('should handle character without personality', () => {
            const characterWithoutPersonality = { ...mockCharacter };
            delete characterWithoutPersonality.personality;

            const modifier = service.getBehavioralModifier(characterWithoutPersonality, 'social');
            expect(modifier).toBeGreaterThanOrEqual(0.1);
            expect(modifier).toBeLessThanOrEqual(3.0);
        });

        test('should handle character without consciousness', () => {
            const characterWithoutConsciousness = { ...mockCharacter };
            delete characterWithoutConsciousness.consciousness;

            const modifier = service.getBehavioralModifier(characterWithoutConsciousness, 'social');
            expect(modifier).toBeGreaterThanOrEqual(0.1);
            expect(modifier).toBeLessThanOrEqual(3.0);
        });

        test('should handle errors gracefully', () => {
            const faultyCharacter = {
                personality: {
                    getAllTraits: () => { throw new Error('Personality error'); }
                },
                consciousness: {
                    getBehavioralState: () => ({})
                }
            };
            const modifier = service.getBehavioralModifier(faultyCharacter, 'social');
            expect(modifier).toBe(1.0);
            expect(mockLogger.errors.length).toBeGreaterThan(0);
        });
    });

    describe('getPersonalityModifier', () => {
        test('should calculate personality modifier for social interaction', () => {
            const character = {
                personality: {
                    getAllTraits: () => ({
                        extrovert: 0.8,  // Should increase social modifier
                        empathy: 0.7,    // Should increase social modifier
                        aggression: 0.2  // Should decrease social modifier
                    })
                }
            };

            const modifier = service.getPersonalityModifier(character, 'social');
            expect(modifier).toBeGreaterThan(1.0); // Should be positive due to extrovert/empathy
            expect(modifier).toBeLessThan(2.0); // Should not be extreme
        });

        test('should calculate personality modifier for combat interaction', () => {
            const character = {
                personality: {
                    getAllTraits: () => ({
                        aggression: 0.9,  // Should increase combat modifier
                        bravery: 0.8,     // Should increase combat modifier
                        cowardice: 0.2    // Should decrease combat modifier
                    })
                }
            };

            const modifier = service.getPersonalityModifier(character, 'combat');
            expect(modifier).toBeGreaterThan(1.0);
        });

        test('should return neutral modifier for unknown interaction type', () => {
            const character = {
                personality: {
                    getAllTraits: () => ({ extrovert: 0.8 })
                }
            };

            const modifier = service.getPersonalityModifier(character, 'unknown');
            expect(modifier).toBe(1.0);
        });

        test('should handle missing personality data', () => {
            const modifier = service.getPersonalityModifier({}, 'social');
            expect(modifier).toBe(1.0);
        });

        test('should handle personality without getAllTraits method', () => {
            const character = {
                personality: {
                    extrovert: 0.8,
                    empathy: 0.7
                }
            };

            const modifier = service.getPersonalityModifier(character, 'social');
            expect(modifier).toBeGreaterThan(1.0);
        });
    });

    describe('getConsciousnessModifier', () => {
        test('should calculate consciousness modifier for social interaction', () => {
            const character = {
                consciousness: {
                    getBehavioralState: () => ({
                        socialDrive: 0.9,  // Should increase social modifier
                        coherence: 0.8     // Should increase social modifier
                    })
                }
            };

            const modifier = service.getConsciousnessModifier(character, 'social');
            expect(modifier).toBeGreaterThan(1.0);
        });

        test('should handle string-based behavioral states', () => {
            const character = {
                consciousness: {
                    behavioralState: 'high'  // String-based state
                }
            };

            const modifier = service.getConsciousnessModifier(character, 'social');
            expect(typeof modifier).toBe('number');
            expect(modifier).toBeGreaterThanOrEqual(0.1);
            expect(modifier).toBeLessThanOrEqual(3.0);
        });

        test('should handle raw consciousness data', () => {
            const character = {
                consciousness: {
                    frequency: 10,  // High frequency
                    coherence: 0.8  // High coherence
                }
            };

            const modifier = service.getConsciousnessModifier(character, 'social');
            expect(typeof modifier).toBe('number');
        });

        test('should return neutral modifier for unknown interaction type', () => {
            const character = {
                consciousness: {
                    getBehavioralState: () => ({ socialDrive: 0.9 })
                }
            };

            const modifier = service.getConsciousnessModifier(character, 'unknown');
            expect(modifier).toBe(1.0);
        });

        test('should handle missing consciousness data', () => {
            const modifier = service.getConsciousnessModifier({}, 'social');
            expect(modifier).toBe(1.0);
        });
    });

    describe('getMemoryModifier', () => {
        test('should calculate positive memory modifier', () => {
            const character = {
                memories: [
                    { outcome: 'positive', significance: 0.8 },
                    { outcome: 'positive', significance: 0.6 }
                ]
            };

            const modifier = service.getMemoryModifier(character, 'social');
            expect(modifier).toBeGreaterThan(1.0); // Positive memories increase modifier
        });

        test('should calculate negative memory modifier', () => {
            const character = {
                memories: [
                    { outcome: 'negative', significance: 0.8 },
                    { outcome: 'negative', significance: 0.6 }
                ]
            };

            const modifier = service.getMemoryModifier(character, 'negative_test');
            expect(modifier).toBeLessThan(1.0); // Negative memories decrease modifier
        });

        test('should handle mixed memories', () => {
            const character = {
                memories: [
                    { outcome: 'positive', significance: 0.8 },
                    { outcome: 'negative', significance: 0.6 }
                ]
            };

            const modifier = service.getMemoryModifier(character, 'mixed_test');
            expect(modifier).toBeCloseTo(1.0, 1); // Should balance out
        });

        test('should return neutral modifier without memory service', () => {
            const serviceWithoutMemory = new BehavioralStateService();
            const modifier = serviceWithoutMemory.getMemoryModifier({}, 'social');
            expect(modifier).toBe(1.0);
        });

        test('should return neutral modifier without memories', () => {
            const modifier = service.getMemoryModifier({ memories: [] }, 'exploration');
            expect(modifier).toBe(1.0);
        });

        test('should handle memory service errors gracefully', () => {
            const faultyMemoryService = {
                getRelevantMemories: () => { throw new Error('Memory service error'); }
            };
            const serviceWithFaultyMemory = new BehavioralStateService(faultyMemoryService, mockLogger);

            const characterWithMemories = {
                memories: [{ outcome: 'positive', significance: 0.5 }]
            };
            const modifier = serviceWithFaultyMemory.getMemoryModifier(characterWithMemories, 'social');
            expect(modifier).toBe(1.0);
            expect(mockLogger.warnings.length).toBeGreaterThan(0);
        });
    });

    describe('getPhysicalStateModifier', () => {
        test('should calculate modifier for high energy character', () => {
            const character = {
                energy: 90,
                maxEnergy: 100,
                health: 95,
                mood: 80
            };

            const modifier = service.getPhysicalStateModifier(character);
            expect(modifier).toBeGreaterThan(1.0); // Good physical state should increase modifier
        });

        test('should calculate modifier for low energy character', () => {
            const character = {
                energy: 20,  // Very low energy
                maxEnergy: 100,
                health: 95,
                mood: 80
            };

            const modifier = service.getPhysicalStateModifier(character);
            expect(modifier).toBeLessThan(1.0); // Low energy should decrease modifier
        });

        test('should calculate modifier for poor health character', () => {
            const character = {
                energy: 80,
                maxEnergy: 100,
                health: 30,  // Poor health
                mood: 80
            };

            const modifier = service.getPhysicalStateModifier(character);
            expect(modifier).toBeLessThan(1.0); // Poor health should decrease modifier
        });

        test('should calculate modifier for bad mood character', () => {
            const character = {
                energy: 80,
                maxEnergy: 100,
                health: 95,
                mood: 20  // Bad mood
            };

            const modifier = service.getPhysicalStateModifier(character);
            expect(modifier).toBeLessThan(1.0); // Bad mood should decrease modifier
        });

        test('should handle missing physical state data', () => {
            const modifier = service.getPhysicalStateModifier({});
            expect(modifier).toBe(0.8); // Defaults to 0.5 energy which triggers moderately tired condition
        });
    });

    describe('clampDecisionFactor', () => {
        test('should clamp values below minimum', () => {
            const clamped = service.clampDecisionFactor(0.05);
            expect(clamped).toBe(0.1);
        });

        test('should clamp values above maximum', () => {
            const clamped = service.clampDecisionFactor(5.0);
            expect(clamped).toBe(3.0);
        });

        test('should not clamp values within bounds', () => {
            const clamped = service.clampDecisionFactor(1.5);
            expect(clamped).toBe(1.5);
        });

        test('should handle edge cases', () => {
            expect(service.clampDecisionFactor(0.1)).toBe(0.1);
            expect(service.clampDecisionFactor(3.0)).toBe(3.0);
            expect(service.clampDecisionFactor(0)).toBe(0.1);
            expect(service.clampDecisionFactor(-1)).toBe(0.1);
        });
    });

    describe('calculateDecisionFactor', () => {
        const mockCharacter = {
            personality: {
                getAllTraits: () => ({
                    extrovert: 0.8,
                    empathy: 0.7
                })
            },
            consciousness: {
                getBehavioralState: () => ({
                    socialDrive: 0.9,
                    coherence: 0.8
                })
            },
            energy: 80,
            maxEnergy: 100,
            health: 90,
            mood: 70,
            memories: []
        };

        test('should return comprehensive decision analysis', () => {
            const result = service.calculateDecisionFactor(mockCharacter, 'social');

            expect(result).toHaveProperty('finalFactor');
            expect(result).toHaveProperty('breakdown');
            expect(result).toHaveProperty('interactionType');
            expect(result).toHaveProperty('timestamp');

            expect(result.breakdown).toHaveProperty('personality');
            expect(result.breakdown).toHaveProperty('consciousness');
            expect(result.breakdown).toHaveProperty('memory');
            expect(result.breakdown).toHaveProperty('context');
            expect(result.breakdown).toHaveProperty('physical');

            expect(result.finalFactor).toBeGreaterThanOrEqual(0.1);
            expect(result.finalFactor).toBeLessThanOrEqual(3.0);
            expect(result.interactionType).toBe('social');
        });

        test('should include context modifiers when provided', () => {
            const context = {
                timeOfDay: 'evening',
                environment: { weather: 'sunny' },
                urgency: 'high'
            };

            const result = service.calculateDecisionFactor(mockCharacter, 'social', context);
            expect(result.breakdown.context).not.toBe(1.0); // Should be modified by context
        });
    });

    describe('getDecisionFactorBounds', () => {
        test('should return bounds information', () => {
            const bounds = service.getDecisionFactorBounds();

            expect(bounds).toHaveProperty('min');
            expect(bounds).toHaveProperty('max');
            expect(bounds).toHaveProperty('description');

            expect(bounds.min).toBe(0.1);
            expect(bounds.max).toBe(3.0);
            expect(bounds.description).toContain('bounded');
        });
    });

    describe('context modifiers', () => {
        describe('getTimeOfDayModifier', () => {
            test('should modify social interaction based on time of day', () => {
                expect(service.getTimeOfDayModifier('social', 'morning')).toBe(0.9);
                expect(service.getTimeOfDayModifier('social', 'afternoon')).toBe(1.1);
                expect(service.getTimeOfDayModifier('social', 'evening')).toBe(1.2);
                expect(service.getTimeOfDayModifier('social', 'night')).toBe(0.8);
            });

            test('should return neutral modifier for unknown time', () => {
                expect(service.getTimeOfDayModifier('social', 'midnight')).toBe(1.0);
            });

            test('should return neutral modifier for unknown interaction type', () => {
                expect(service.getTimeOfDayModifier('unknown', 'morning')).toBe(1.0);
            });
        });

        describe('getEnvironmentModifier', () => {
            test('should modify based on weather', () => {
                const stormyEnv = { weather: 'storm' };
                const sunnyEnv = { weather: 'sunny' };

                expect(service.getEnvironmentModifier('rest', stormyEnv)).toBe(1.2);
                expect(service.getEnvironmentModifier('exploration', stormyEnv)).toBe(0.7);
                expect(service.getEnvironmentModifier('exploration', sunnyEnv)).toBe(1.1);
            });

            test('should modify based on danger level', () => {
                const dangerousEnv = { isDangerous: true };

                expect(service.getEnvironmentModifier('combat', dangerousEnv)).toBe(1.2);
                expect(service.getEnvironmentModifier('rest', dangerousEnv)).toBe(0.8);
            });

            test('should handle unknown weather', () => {
                const unknownWeather = { weather: 'tornado' };
                expect(service.getEnvironmentModifier('social', unknownWeather)).toBe(1.0);
            });
        });

        describe('getUrgencyModifier', () => {
            test('should modify based on urgency level', () => {
                expect(service.getUrgencyModifier('social', 'low')).toBe(0.9);
                expect(service.getUrgencyModifier('social', 'medium')).toBe(1.0);
                expect(service.getUrgencyModifier('social', 'high')).toBe(1.2);
                expect(service.getUrgencyModifier('social', 'critical')).toBe(1.5);
            });

            test('should return neutral modifier for unknown urgency', () => {
                expect(service.getUrgencyModifier('social', 'unknown')).toBe(1.0);
            });
        });
    });

    describe('edge cases and error handling', () => {
        test('should handle null/undefined inputs gracefully', () => {
            expect(() => service.getBehavioralModifier(null, 'social')).not.toThrow();
            expect(() => service.getPersonalityModifier(null, 'social')).not.toThrow();
            expect(() => service.getConsciousnessModifier(null, 'social')).not.toThrow();
            expect(() => service.getMemoryModifier(null, 'social')).not.toThrow();
        });

        test('should handle malformed character objects', () => {
            const malformedCharacter = {
                personality: null,
                consciousness: null,
                energy: 'not a number'
            };

            const modifier = service.getBehavioralModifier(malformedCharacter, 'social');
            expect(typeof modifier).toBe('number');
            expect(modifier).toBeGreaterThanOrEqual(0.1);
            expect(modifier).toBeLessThanOrEqual(3.0);
        });

        test('should handle extreme personality trait values', () => {
            const extremeCharacter = {
                personality: {
                    getAllTraits: () => ({
                        extrovert: 1.0,  // Maximum
                        aggression: 0.0  // Minimum
                    })
                }
            };

            const modifier = service.getPersonalityModifier(extremeCharacter, 'social');
            expect(modifier).toBeGreaterThanOrEqual(0.1);
            expect(modifier).toBeLessThanOrEqual(3.0);
        });

        test('should handle extreme consciousness values', () => {
            const extremeCharacter = {
                consciousness: {
                    frequency: 20,  // Above maximum
                    coherence: 2.0  // Above maximum
                }
            };

            const modifier = service.getConsciousnessModifier(extremeCharacter, 'social');
            expect(modifier).toBeGreaterThanOrEqual(0.1);
            expect(modifier).toBeLessThanOrEqual(3.0);
        });
    });
});