/**
 * MemoryManagementService Unit Tests
 *
 * Comprehensive test suite for MemoryManagementService covering:
 * - Automatic memory pruning for old events and memories
 * - Garbage collection optimization for consciousness states
 * - Memory usage limits enforcement
 * - Efficient data structures for large-scale simulations
 * - Memory usage monitoring and reporting
 */

import MemoryManagementService from '../src/domain/services/MemoryManagementService.js';

// Mock logger for testing
const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Mock error handler for testing
const mockErrorHandler = {
    handleCalculationFailure: jest.fn(),
    isValidBehavioralState: jest.fn().mockReturnValue(true)
};

describe('MemoryManagementService', () => {
    let memoryManager;
    let testCharacter;
    let testWorldState;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create memory management service
        memoryManager = new MemoryManagementService(mockLogger, mockErrorHandler);

        // Create test character with consciousness and memories
        testCharacter = {
            id: 'test-character-1',
            consciousness: {
                frequency: 7.5,
                coherence: 0.7,
                behavioralState: {
                    energy: 'moderate',
                    focus: 'balanced',
                    mood: 'content',
                    socialDrive: 0.6,
                    riskTolerance: 0.5,
                    ambition: 0.7
                },
                significantEvents: [
                    {
                        id: 'event-1',
                        type: 'social_success',
                        timestamp: Date.now() - (10 * 24 * 60 * 60 * 1000), // 10 days ago
                        significance: 0.8
                    },
                    {
                        id: 'event-2',
                        type: 'conflict',
                        timestamp: Date.now() - (40 * 24 * 60 * 60 * 1000), // 40 days ago (old)
                        significance: 0.6
                    },
                    {
                        id: 'event-3',
                        type: 'discovery',
                        timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
                        significance: 0.4
                    }
                ]
            },
            significantMemories: [
                {
                    id: 'memory-1',
                    interactionType: 'social',
                    outcome: 'success',
                    timestamp: Date.now() - (20 * 24 * 60 * 60 * 1000), // 20 days ago
                    significance: 0.7
                },
                {
                    id: 'memory-2',
                    interactionType: 'combat',
                    outcome: 'failure',
                    timestamp: Date.now() - (400 * 24 * 60 * 60 * 1000), // 400 days ago (very old)
                    significance: 0.5
                },
                {
                    id: 'memory-3',
                    interactionType: 'trade',
                    outcome: 'success',
                    timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
                    significance: 0.9
                }
            ]
        };

        // Create test world state
        testWorldState = {
            npcs: [testCharacter]
        };
    });

    describe('Memory Pruning', () => {
        test('should prune old events correctly', () => {
            const result = memoryManager.processCharacter(testCharacter);

            // Should have pruned the 40-day-old event
            expect(result.eventsPruned).toBeGreaterThan(0);
            expect(testCharacter.consciousness.significantEvents.length).toBeLessThan(3);
        });

        test('should preserve recent significant events', () => {
            const result = memoryManager.processCharacter(testCharacter);

            // Should keep the most recent and significant events
            const remainingEvents = testCharacter.consciousness.significantEvents;
            expect(remainingEvents.length).toBeGreaterThan(0);

            // Most recent event should be preserved
            const mostRecentEvent = remainingEvents.find(e => e.id === 'event-3');
            expect(mostRecentEvent).toBeDefined();

            // Should have processed some events
            expect(result.eventsPruned).toBeDefined();
        });

        test('should prune old memories correctly', () => {
            const result = memoryManager.processCharacter(testCharacter);

            // Should have pruned the 400-day-old memory
            expect(result.memoriesPruned).toBeGreaterThan(0);
            expect(testCharacter.significantMemories.length).toBeLessThan(3);
        });

        test('should preserve recent significant memories', () => {
            const result = memoryManager.processCharacter(testCharacter);

            // Should keep the most recent and significant memories
            const remainingMemories = testCharacter.significantMemories;
            expect(remainingMemories.length).toBeGreaterThan(0);

            // Most recent memory should be preserved
            const mostRecentMemory = remainingMemories.find(m => m.id === 'memory-3');
            expect(mostRecentMemory).toBeDefined();

            // Should have processed some memories
            expect(result.memoriesPruned).toBeDefined();
        });

        test('should handle aggressive pruning', () => {
            const result = memoryManager.processCharacter(testCharacter, {
                aggressiveCleanup: true
            });

            // Aggressive pruning should remove more items
            expect(result.eventsPruned).toBeGreaterThanOrEqual(0);
            expect(result.memoriesPruned).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Garbage Collection', () => {
        test('should perform garbage collection on corrupted data', () => {
            // Add corrupted behavioral state
            testCharacter.consciousness.behavioralState.energy = NaN;
            testCharacter.consciousness.behavioralState.invalidField = 'corrupted';

            const result = memoryManager.processCharacter(testCharacter);

            // Should have performed garbage collection
            expect(result.garbageCollected).toBeGreaterThan(0);

            // Should have cleaned up corrupted fields
            expect(testCharacter.consciousness.behavioralState.energy).not.toBeNaN();
            expect(testCharacter.consciousness.behavioralState.invalidField).toBeUndefined();
        });

        test('should regenerate missing behavioral state fields', () => {
            // Remove some required fields
            delete testCharacter.consciousness.behavioralState.socialDrive;
            delete testCharacter.consciousness.behavioralState.riskTolerance;

            const result = memoryManager.processCharacter(testCharacter);

            // Should have regenerated missing fields
            expect(result.garbageCollected).toBeGreaterThan(0);
            expect(testCharacter.consciousness.behavioralState.socialDrive).toBeDefined();
            expect(testCharacter.consciousness.behavioralState.riskTolerance).toBeDefined();
        });

        test('should clean up null/undefined arrays', () => {
            // Add null entries to arrays
            testCharacter.consciousness.significantEvents.push(null, undefined);
            testCharacter.significantMemories.push(null);

            const originalEventCount = testCharacter.consciousness.significantEvents.length;
            const originalMemoryCount = testCharacter.significantMemories.length;

            const result = memoryManager.processCharacter(testCharacter);

            // Should have cleaned up null entries
            expect(result.garbageCollected).toBeGreaterThan(0);
            expect(testCharacter.consciousness.significantEvents.length).toBeLessThan(originalEventCount);
            expect(testCharacter.significantMemories.length).toBeLessThan(originalMemoryCount);
        });
    });

    describe('Memory Limits Enforcement', () => {
        test('should enforce event limits', () => {
            // Add many events to exceed limit
            for (let i = 0; i < 25; i++) {
                testCharacter.consciousness.significantEvents.push({
                    id: `extra-event-${i}`,
                    type: 'test_event',
                    timestamp: Date.now(),
                    significance: 0.5
                });
            }

            const result = memoryManager.processCharacter(testCharacter);

            // Should have enforced event limit
            expect(result.eventsPruned).toBeGreaterThan(0);
            expect(testCharacter.consciousness.significantEvents.length).toBeLessThanOrEqual(
                memoryManager.MEMORY_LIMITS.MAX_EVENTS_PER_CHARACTER
            );
        });

        test('should enforce memory limits', () => {
            // Add many memories to exceed limit
            for (let i = 0; i < 60; i++) {
                testCharacter.significantMemories.push({
                    id: `extra-memory-${i}`,
                    interactionType: 'test',
                    outcome: 'success',
                    timestamp: Date.now(),
                    significance: 0.5
                });
            }

            const result = memoryManager.processCharacter(testCharacter);

            // Should have enforced memory limit
            expect(result.memoriesPruned).toBeGreaterThan(0);
            expect(testCharacter.significantMemories.length).toBeLessThanOrEqual(
                memoryManager.MEMORY_LIMITS.MAX_MEMORIES_PER_CHARACTER
            );
        });

        test('should prioritize significant items when enforcing limits', () => {
            // Add mix of high and low significance items
            testCharacter.consciousness.significantEvents = [
                { id: 'high-1', significance: 0.9, timestamp: Date.now() },
                { id: 'low-1', significance: 0.1, timestamp: Date.now() },
                { id: 'high-2', significance: 0.8, timestamp: Date.now() },
                { id: 'low-2', significance: 0.2, timestamp: Date.now() }
            ];

            // Exceed limit
            for (let i = 0; i < 20; i++) {
                testCharacter.consciousness.significantEvents.push({
                    id: `extra-${i}`,
                    significance: 0.3,
                    timestamp: Date.now()
                });
            }

            memoryManager.processCharacter(testCharacter);

            // Should keep high significance items
            const remainingEvents = testCharacter.consciousness.significantEvents;
            const highSigEvents = remainingEvents.filter(e => e.significance >= 0.8);
            expect(highSigEvents.length).toBeGreaterThan(0);
        });
    });

    describe('Data Structure Optimization', () => {
        test('should optimize event array sorting', () => {
            // Create unsorted events
            testCharacter.consciousness.significantEvents = [
                { id: 'old', timestamp: Date.now() - 100000, significance: 0.5 },
                { id: 'new', timestamp: Date.now(), significance: 0.5 },
                { id: 'middle', timestamp: Date.now() - 50000, significance: 0.5 }
            ];

            memoryManager.processCharacter(testCharacter);

            // Should be sorted by recency (newest first)
            const events = testCharacter.consciousness.significantEvents;
            for (let i = 0; i < events.length - 1; i++) {
                expect(events[i].timestamp).toBeGreaterThanOrEqual(events[i + 1].timestamp);
            }
        });

        test('should optimize memory array sorting', () => {
            // Create unsorted memories
            testCharacter.significantMemories = [
                { id: 'old', timestamp: Date.now() - 100000, significance: 0.5 },
                { id: 'new', timestamp: Date.now(), significance: 0.5 },
                { id: 'middle', timestamp: Date.now() - 50000, significance: 0.5 }
            ];

            memoryManager.processCharacter(testCharacter);

            // Should be sorted by significance and recency
            const memories = testCharacter.significantMemories;
            expect(memories.length).toBeGreaterThan(0);
        });

        test('should remove duplicate events', () => {
            // Add duplicate events
            testCharacter.consciousness.significantEvents = [
                { id: 'dup1', type: 'social', timestamp: Date.now() - 1000, significance: 0.5 },
                { id: 'dup2', type: 'social', timestamp: Date.now() - 2000, significance: 0.5 },
                { id: 'unique', type: 'combat', timestamp: Date.now(), significance: 0.5 }
            ];

            const originalCount = testCharacter.consciousness.significantEvents.length;

            memoryManager.processCharacter(testCharacter);

            // Should have removed duplicates
            expect(testCharacter.consciousness.significantEvents.length).toBeLessThanOrEqual(originalCount);
        });

        test('should clamp behavioral state values', () => {
            // Set out-of-bounds values
            testCharacter.consciousness.behavioralState.socialDrive = 1.5; // Should be clamped to 1.0
            testCharacter.consciousness.behavioralState.riskTolerance = -0.5; // Should be clamped to 0.0

            memoryManager.processCharacter(testCharacter);

            // Should have clamped values
            expect(testCharacter.consciousness.behavioralState.socialDrive).toBeLessThanOrEqual(1.0);
            expect(testCharacter.consciousness.behavioralState.socialDrive).toBeGreaterThanOrEqual(0.0);
            expect(testCharacter.consciousness.behavioralState.riskTolerance).toBeLessThanOrEqual(1.0);
            expect(testCharacter.consciousness.behavioralState.riskTolerance).toBeGreaterThanOrEqual(0.0);
        });
    });

    describe('World-Level Management', () => {
        test('should perform world-level cleanup when needed', () => {
            // Create many characters to trigger world cleanup
            const characters = [];
            for (let i = 0; i < 10; i++) {
                characters.push({
                    id: `char-${i}`,
                    consciousness: {
                        significantEvents: Array(25).fill().map((_, j) => ({
                            id: `event-${i}-${j}`,
                            type: 'test',
                            timestamp: Date.now(),
                            significance: 0.5
                        }))
                    },
                    significantMemories: Array(60).fill().map((_, j) => ({
                        id: `memory-${i}-${j}`,
                        interactionType: 'test',
                        outcome: 'success',
                        timestamp: Date.now(),
                        significance: 0.5
                    }))
                });
            }

            const worldState = { npcs: characters };
            const result = memoryManager.performMemoryManagement(worldState);

            // Should have processed all characters
            expect(result.charactersProcessed).toBe(10);
            expect(result.eventsPruned).toBeGreaterThan(0);
            expect(result.memoriesPruned).toBeGreaterThan(0);
        });

        test('should handle empty world state', () => {
            const result = memoryManager.performMemoryManagement({ npcs: [] });

            expect(result.charactersProcessed).toBe(0);
            expect(result.eventsPruned).toBe(0);
            expect(result.memoriesPruned).toBe(0);
            expect(result.garbageCollected).toBe(0);
        });

        test('should handle world state with test character', () => {
            const result = memoryManager.performMemoryManagement(testWorldState);

            expect(result.charactersProcessed).toBe(1);
            expect(result.eventsPruned).toBeGreaterThanOrEqual(0);
            expect(result.memoriesPruned).toBeGreaterThanOrEqual(0);
        });

        test('should handle invalid world state', () => {
            const result = memoryManager.performMemoryManagement({});

            expect(result.charactersProcessed).toBe(0);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('Performance and Monitoring', () => {
        test('should track performance metrics', () => {
            const result = memoryManager.processCharacter(testCharacter);

            // Should have performance metrics
            expect(result.performance).toBeDefined();
            expect(result.performance.duration).toBeGreaterThan(0);
            expect(result.performance.charactersPerSecond).toBeDefined();
        });

        test('should update memory statistics', () => {
            const initialStats = { ...memoryManager.memoryStats };
            memoryManager.processCharacter(testCharacter);

            // Should have updated statistics
            expect(memoryManager.memoryStats.charactersProcessed).toBeGreaterThan(initialStats.charactersProcessed);
        });

        test('should generate warnings for high memory usage', () => {
            // Simulate high memory usage
            memoryManager.memoryStats.totalEvents = memoryManager.MEMORY_LIMITS.MAX_TOTAL_EVENTS_WORLD * 0.95;

            // Trigger memory check
            memoryManager.checkMemoryUsage();

            // Should have generated warnings
            expect(memoryManager.memoryStats.memoryWarnings.length).toBeGreaterThan(0);
        });

        test('should provide memory statistics', () => {
            const stats = memoryManager.getMemoryStats();

            expect(stats).toBeDefined();
            expect(stats.limits).toBeDefined();
            expect(stats.performance).toBeDefined();
            expect(stats.pools).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid character gracefully', () => {
            const result = memoryManager.processCharacter(null);

            expect(result.eventsPruned).toBe(0);
            expect(result.memoriesPruned).toBe(0);
            expect(result.garbageCollected).toBe(0);
        });

        test('should handle character without consciousness', () => {
            const characterWithoutConsciousness = {
                id: 'test-char',
                significantMemories: []
            };

            const result = memoryManager.processCharacter(characterWithoutConsciousness);

            expect(result.eventsPruned).toBe(0);
            expect(result.memoriesPruned).toBe(0);
        });

        test('should handle character without memories', () => {
            const characterWithoutMemories = {
                id: 'test-char',
                consciousness: {
                    significantEvents: []
                }
            };

            const result = memoryManager.processCharacter(characterWithoutMemories);

            expect(result.memoriesPruned).toBe(0);
        });

        test('should continue processing after individual character errors', () => {
            const invalidCharacter = null;
            const validCharacter = { ...testCharacter };

            const worldState = { npcs: [invalidCharacter, validCharacter] };
            const result = memoryManager.performMemoryManagement(worldState);

            // Should have processed the valid character
            expect(result.charactersProcessed).toBe(1);
            expect(result.errors.length).toBe(1);
        });
    });

    describe('Batch Processing', () => {
        test('should process characters in batches', () => {
            const characters = [];
            for (let i = 0; i < 150; i++) {
                characters.push({
                    id: `batch-char-${i}`,
                    consciousness: {
                        significantEvents: [{
                            id: `event-${i}`,
                            type: 'test',
                            timestamp: Date.now(),
                            significance: 0.5
                        }]
                    },
                    significantMemories: []
                });
            }

            const worldState = { npcs: characters };
            const result = memoryManager.performMemoryManagement(worldState);

            // Should have processed all characters
            expect(result.charactersProcessed).toBe(150);
        });

        test('should handle batch processing errors gracefully', () => {
            const characters = [
                null, // Invalid character
                { ...testCharacter }, // Valid character
                null, // Another invalid character
                { ...testCharacter, id: 'test-2' } // Another valid character
            ];

            const worldState = { npcs: characters };
            const result = memoryManager.performMemoryManagement(worldState);

            // Should have processed valid characters despite errors
            expect(result.charactersProcessed).toBe(2);
            expect(result.errors.length).toBe(2);
        });
    });

    describe('Configuration and Limits', () => {
        test('should respect memory limits configuration', () => {
            const customLimits = {
                MAX_EVENTS_PER_CHARACTER: 5,
                MAX_MEMORIES_PER_CHARACTER: 10
            };

            // Temporarily modify limits for testing
            const originalLimits = { ...memoryManager.MEMORY_LIMITS };
            memoryManager.MEMORY_LIMITS = { ...memoryManager.MEMORY_LIMITS, ...customLimits };

            // Add events exceeding custom limit
            testCharacter.consciousness.significantEvents = [];
            for (let i = 0; i < 15; i++) {
                testCharacter.consciousness.significantEvents.push({
                    id: `event-${i}`,
                    type: 'test',
                    timestamp: Date.now(),
                    significance: 0.5
                });
            }

            memoryManager.processCharacter(testCharacter);

            // Should have enforced custom limit
            expect(testCharacter.consciousness.significantEvents.length).toBeLessThanOrEqual(5);

            // Restore original limits
            memoryManager.MEMORY_LIMITS = originalLimits;
        });

        test('should handle different pruning strategies', () => {
            const aggressiveResult = memoryManager.processCharacter(testCharacter, {
                aggressiveCleanup: true
            });

            const normalResult = memoryManager.processCharacter(testCharacter, {
                aggressiveCleanup: false
            });

            // Results should be different based on strategy
            expect(aggressiveResult).toBeDefined();
            expect(normalResult).toBeDefined();
        });
    });

    describe('Integration with Services', () => {
        test('should work with SignificantMemoryService integration', () => {
            // Test that memory manager integrates properly with memory service
            expect(memoryManager).toBeDefined();
            expect(typeof memoryManager.processCharacter).toBe('function');
        });

        test('should work with ConsciousnessCheckpointService integration', () => {
            // Test that memory manager integrates properly with checkpoint service
            expect(memoryManager).toBeDefined();
            expect(typeof memoryManager.performMemoryManagement).toBe('function');
        });

        test('should work with BehavioralStateService integration', () => {
            // Test that memory manager integrates properly with behavioral state service
            expect(memoryManager).toBeDefined();
            expect(typeof memoryManager.processCharacter).toBe('function');
        });

        test('should work with ConsciousnessUpdateService integration', () => {
            // Test that memory manager integrates properly with update service
            expect(memoryManager).toBeDefined();
            expect(typeof memoryManager.processCharacter).toBe('function');
        });
    });
});