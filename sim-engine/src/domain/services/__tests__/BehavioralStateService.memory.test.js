/**
 * Tests for BehavioralStateService Memory Integration
 * 
 * Tests the integration between BehavioralStateService and SignificantMemoryService
 * for memory-influenced decision making.
 */

import BehavioralStateService from '../BehavioralStateService.js';
import SignificantMemoryService from '../SignificantMemoryService.js';

describe('BehavioralStateService Memory Integration', () => {
    let behavioralStateService;
    let memoryService;
    let mockCharacter;
    let mockLogger;

    beforeEach(() => {
        memoryService = new SignificantMemoryService();
        mockLogger = {
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn()
        };
        behavioralStateService = new BehavioralStateService(memoryService, mockLogger);

        // Create mock character with consciousness and personality
        mockCharacter = {
            id: 'test_character',
            consciousness: {
                behavioralState: {
                    energy: 0.7,
                    focus: 0.6,
                    mood: 0.8,
                    socialDrive: 0.5,
                    riskTolerance: 0.4,
                    ambition: 0.6
                }
            },
            personality: {
                extrovert: 0.7,
                empathy: 0.8,
                aggression: 0.3,
                curiosity: 0.6
            },
            significantMemories: [],
            currentNodeId: 'test_node'
        };
    });

    describe('Memory Modifier Calculation', () => {
        test('should return neutral modifier when no memories exist', () => {
            const modifier = behavioralStateService.getMemoryModifier(
                mockCharacter,
                'social',
                {}
            );

            expect(modifier).toBe(1.0);
        });

        test('should return neutral modifier when no relevant memories exist', () => {
            // Add irrelevant memories
            mockCharacter.significantMemories = [
                {
                    id: 'mem1',
                    interactionType: 'combat',
                    outcome: 'success',
                    significance: 0.6,
                    timestamp: Date.now() - 1000,
                    contextTags: ['combat']
                }
            ];

            const modifier = behavioralStateService.getMemoryModifier(
                mockCharacter,
                'social',
                {}
            );

            expect(modifier).toBe(1.0);
        });

        test('should increase modifier for positive memories', () => {
            mockCharacter.significantMemories = [
                {
                    id: 'mem1',
                    interactionType: 'social',
                    outcome: 'success',
                    significance: 0.8,
                    timestamp: Date.now() - 1000,
                    contextTags: ['social']
                },
                {
                    id: 'mem2',
                    interactionType: 'social',
                    outcome: 'critical_success',
                    significance: 0.9,
                    timestamp: Date.now() - 2000,
                    contextTags: ['social']
                }
            ];

            const modifier = behavioralStateService.getMemoryModifier(
                mockCharacter,
                'social',
                {}
            );

            expect(modifier).toBeGreaterThan(1.0);
            expect(modifier).toBeLessThanOrEqual(1.3);
        });

        test('should decrease modifier for negative memories', () => {
            mockCharacter.significantMemories = [
                {
                    id: 'mem1',
                    interactionType: 'social',
                    outcome: 'failure',
                    significance: 0.7,
                    timestamp: Date.now() - 1000,
                    contextTags: ['social']
                },
                {
                    id: 'mem2',
                    interactionType: 'social',
                    outcome: 'critical_failure',
                    significance: 0.8,
                    timestamp: Date.now() - 2000,
                    contextTags: ['social']
                }
            ];

            const modifier = behavioralStateService.getMemoryModifier(
                mockCharacter,
                'social',
                {}
            );

            expect(modifier).toBeLessThan(1.0);
            expect(modifier).toBeGreaterThanOrEqual(0.8);
        });

        test('should balance positive and negative memories', () => {
            mockCharacter.significantMemories = [
                {
                    id: 'mem1',
                    interactionType: 'social',
                    outcome: 'success',
                    significance: 0.8,
                    timestamp: Date.now() - 1000,
                    contextTags: ['social']
                },
                {
                    id: 'mem2',
                    interactionType: 'social',
                    outcome: 'failure',
                    significance: 0.8,
                    timestamp: Date.now() - 2000,
                    contextTags: ['social']
                }
            ];

            const modifier = behavioralStateService.getMemoryModifier(
                mockCharacter,
                'social',
                {}
            );

            // Should be close to neutral due to balanced memories
            expect(modifier).toBeCloseTo(1.0, 1);
        });

        test('should weight recent memories more heavily', () => {
            const now = Date.now();
            mockCharacter.significantMemories = [
                {
                    id: 'mem_recent',
                    interactionType: 'social',
                    outcome: 'success',
                    significance: 0.5,
                    timestamp: now - 1000, // Very recent
                    contextTags: ['social']
                },
                {
                    id: 'mem_old',
                    interactionType: 'social',
                    outcome: 'failure',
                    significance: 0.5,
                    timestamp: now - (30 * 24 * 60 * 60 * 1000), // 30 days old
                    contextTags: ['social']
                }
            ];

            const modifier = behavioralStateService.getMemoryModifier(
                mockCharacter,
                'social',
                {}
            );

            // Recent positive memory should outweigh old negative memory
            expect(modifier).toBeGreaterThan(1.0);
        });

        test('should respect memory modifier bounds', () => {
            // Test extreme positive case
            mockCharacter.significantMemories = Array.from({ length: 10 }, (_, i) => ({
                id: `mem${i}`,
                interactionType: 'social',
                outcome: 'critical_success',
                significance: 1.0,
                timestamp: Date.now() - (i * 1000),
                contextTags: ['social']
            }));

            const positiveModifier = behavioralStateService.getMemoryModifier(
                mockCharacter,
                'social',
                {}
            );

            expect(positiveModifier).toBeLessThanOrEqual(1.3);

            // Test extreme negative case
            mockCharacter.significantMemories = Array.from({ length: 10 }, (_, i) => ({
                id: `mem${i}`,
                interactionType: 'social',
                outcome: 'critical_failure',
                significance: 1.0,
                timestamp: Date.now() - (i * 1000),
                contextTags: ['social']
            }));

            const negativeModifier = behavioralStateService.getMemoryModifier(
                mockCharacter,
                'social',
                {}
            );

            expect(negativeModifier).toBeGreaterThanOrEqual(0.8);
        });
    });

    describe('Recency Weight Calculation', () => {
        test('should give full weight to very recent memories', () => {
            const recentTimestamp = Date.now() - (12 * 60 * 60 * 1000); // 12 hours ago
            const weight = behavioralStateService.calculateRecencyWeight(recentTimestamp);
            expect(weight).toBe(1.0);
        });

        test('should reduce weight for older memories', () => {
            const weekOldTimestamp = Date.now() - (7 * 24 * 60 * 60 * 1000);
            const weight = behavioralStateService.calculateRecencyWeight(weekOldTimestamp);
            expect(weight).toBeLessThan(1.0);
            expect(weight).toBeGreaterThan(0.6);
        });

        test('should give minimum weight to very old memories', () => {
            const veryOldTimestamp = Date.now() - (365 * 24 * 60 * 60 * 1000); // 1 year ago
            const weight = behavioralStateService.calculateRecencyWeight(veryOldTimestamp);
            expect(weight).toBe(0.1);
        });

        test('should have smooth decay curve', () => {
            const now = Date.now();
            const oneDayAgo = now - (24 * 60 * 60 * 1000);
            const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
            const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

            const recentWeight = behavioralStateService.calculateRecencyWeight(oneDayAgo);
            const weekWeight = behavioralStateService.calculateRecencyWeight(oneWeekAgo);
            const monthWeight = behavioralStateService.calculateRecencyWeight(oneMonthAgo);

            expect(recentWeight).toBeGreaterThan(weekWeight);
            expect(weekWeight).toBeGreaterThan(monthWeight);
        });
    });

    describe('Memory Analysis', () => {
        test('should provide detailed memory analysis', () => {
            mockCharacter.significantMemories = [
                {
                    id: 'mem1',
                    interactionType: 'social',
                    outcome: 'success',
                    significance: 0.8,
                    timestamp: Date.now() - 1000,
                    contextTags: ['social'],
                    description: 'Successful negotiation'
                },
                {
                    id: 'mem2',
                    interactionType: 'social',
                    outcome: 'failure',
                    significance: 0.6,
                    timestamp: Date.now() - 10000,
                    contextTags: ['social'],
                    description: 'Failed persuasion attempt'
                }
            ];

            const analysis = behavioralStateService.getMemoryAnalysis(
                mockCharacter,
                'social',
                {}
            );

            expect(analysis.hasMemories).toBe(true);
            expect(analysis.relevantMemories).toHaveLength(2);
            expect(analysis.memoryModifier).toBeGreaterThan(0);
            expect(analysis.analysis).toContain('relevant memories');
            expect(analysis.totalWeightedInfluence).toBeDefined();
            expect(analysis.totalWeight).toBeGreaterThan(0);
        });

        test('should handle no memories case in analysis', () => {
            const analysis = behavioralStateService.getMemoryAnalysis(
                mockCharacter,
                'social',
                {}
            );

            expect(analysis.hasMemories).toBe(true);
            expect(analysis.relevantMemories).toHaveLength(0);
            expect(analysis.memoryModifier).toBe(1.0);
            expect(analysis.analysis).toContain('No relevant memories');
        });

        test('should handle character without memory service', () => {
            const serviceWithoutMemory = new BehavioralStateService(null, mockLogger);
            const analysis = serviceWithoutMemory.getMemoryAnalysis(
                mockCharacter,
                'social',
                {}
            );

            expect(analysis.hasMemories).toBe(false);
            expect(analysis.memoryModifier).toBe(1.0);
            expect(analysis.analysis).toContain('No memories or memory service');
        });

        test('should handle character without significantMemories array', () => {
            const characterWithoutMemories = {
                ...mockCharacter,
                significantMemories: undefined
            };
            
            const analysis = behavioralStateService.getMemoryAnalysis(
                characterWithoutMemories,
                'social',
                {}
            );

            expect(analysis.hasMemories).toBe(false);
            expect(analysis.memoryModifier).toBe(1.0);
            expect(analysis.analysis).toContain('Character has no memory storage');
        });
    });

    describe('Integration with Decision Factor Calculation', () => {
        test('should include memory modifier in comprehensive decision factor', () => {
            mockCharacter.significantMemories = [
                {
                    id: 'mem1',
                    interactionType: 'social',
                    outcome: 'success',
                    significance: 0.8,
                    timestamp: Date.now() - 1000,
                    contextTags: ['social']
                }
            ];

            const decision = behavioralStateService.calculateDecisionFactor(
                mockCharacter,
                'social',
                {}
            );

            expect(decision.breakdown.memory).toBeGreaterThan(1.0);
            expect(decision.finalFactor).toBeGreaterThan(0);
            expect(decision.interactionType).toBe('social');
        });

        test('should handle memory errors gracefully in decision calculation', () => {
            // Mock memory service to throw error
            const errorMemoryService = {
                getRelevantMemories: jest.fn().mockImplementation(() => {
                    throw new Error('Memory service error');
                })
            };

            const serviceWithErrorMemory = new BehavioralStateService(errorMemoryService, mockLogger);
            
            const modifier = serviceWithErrorMemory.getMemoryModifier(
                mockCharacter,
                'social',
                {}
            );

            expect(modifier).toBe(1.0);
            expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringContaining('Error calculating memory modifier')
            );
        });
    });

    describe('Legacy Memory Format Support', () => {
        test('should handle legacy positive/negative outcome format', () => {
            mockCharacter.significantMemories = [
                {
                    id: 'mem1',
                    interactionType: 'social',
                    outcome: 'positive', // Legacy format
                    significance: 0.8,
                    timestamp: Date.now() - 1000,
                    contextTags: ['social']
                },
                {
                    id: 'mem2',
                    interactionType: 'social',
                    outcome: 'negative', // Legacy format
                    significance: 0.6,
                    timestamp: Date.now() - 2000,
                    contextTags: ['social']
                }
            ];

            const modifier = behavioralStateService.getMemoryModifier(
                mockCharacter,
                'social',
                {}
            );

            expect(modifier).toBeGreaterThan(0.8);
            expect(modifier).toBeLessThan(1.3);
        });
    });

    describe('Context-Based Memory Retrieval', () => {
        test('should consider context in memory retrieval', () => {
            mockCharacter.significantMemories = [
                {
                    id: 'mem1',
                    interactionType: 'social',
                    outcome: 'success',
                    significance: 0.8,
                    timestamp: Date.now() - 1000,
                    contextTags: ['social'],
                    location: 'tavern',
                    participants: ['npc_123']
                }
            ];

            const contextWithLocation = {
                location: 'tavern'
            };

            const contextWithParticipant = {
                participants: ['npc_123']
            };

            const modifierWithLocation = behavioralStateService.getMemoryModifier(
                mockCharacter,
                'social',
                contextWithLocation
            );

            const modifierWithParticipant = behavioralStateService.getMemoryModifier(
                mockCharacter,
                'social',
                contextWithParticipant
            );

            expect(modifierWithLocation).toBeGreaterThan(1.0);
            expect(modifierWithParticipant).toBeGreaterThan(1.0);
        });
    });

    describe('Memory Analysis Text Generation', () => {
        test('should generate appropriate analysis text for positive memories', () => {
            const memoryBreakdown = [
                {
                    influence: 0.2,
                    outcome: 'success'
                },
                {
                    influence: 0.4,
                    outcome: 'critical_success'
                }
            ];

            const analysisText = behavioralStateService.generateMemoryAnalysisText(
                memoryBreakdown,
                1.15
            );

            expect(analysisText).toContain('2 positive experiences');
            expect(analysisText).toContain('encourage this action');
        });

        test('should generate appropriate analysis text for negative memories', () => {
            const memoryBreakdown = [
                {
                    influence: -0.2,
                    outcome: 'failure'
                },
                {
                    influence: -0.4,
                    outcome: 'critical_failure'
                }
            ];

            const analysisText = behavioralStateService.generateMemoryAnalysisText(
                memoryBreakdown,
                0.85
            );

            expect(analysisText).toContain('2 negative experiences');
            expect(analysisText).toContain('discourage this action');
        });

        test('should generate appropriate analysis text for neutral impact', () => {
            const memoryBreakdown = [
                {
                    influence: 0.1,
                    outcome: 'partial_success'
                },
                {
                    influence: -0.1,
                    outcome: 'partial_failure'
                }
            ];

            const analysisText = behavioralStateService.generateMemoryAnalysisText(
                memoryBreakdown,
                1.02
            );

            expect(analysisText).toContain('minimal impact');
        });
    });
});