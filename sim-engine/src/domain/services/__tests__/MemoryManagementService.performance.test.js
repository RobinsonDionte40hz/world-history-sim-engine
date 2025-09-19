/**
 * Memory Management Performance Benchmarks
 *
 * Performance benchmarks to measure memory management efficiency and identify bottlenecks.
 * Tests various scenarios including large-scale character processing, memory pruning,
 * garbage collection, and concurrent operations.
 */

import MemoryManagementService from '../../services/MemoryManagementService.js';
import SignificantMemoryService from '../../services/SignificantMemoryService.js';
import ConsciousnessUpdateService from '../../services/ConsciousnessUpdateService.js';
import BehavioralStateService from '../../services/BehavioralStateService.js';

// Mock logger for performance testing
const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Mock error handler
const mockErrorHandler = {
    handleCalculationFailure: jest.fn(),
    isValidBehavioralState: jest.fn().mockReturnValue(true)
};

describe('Memory Management Performance Benchmarks', () => {
    let memoryManager;
    let memoryService;
    let updateService;
    let behavioralService;

    beforeEach(() => {
        jest.clearAllMocks();

        // Initialize services
        memoryManager = new MemoryManagementService(mockLogger, mockErrorHandler);
        memoryService = new SignificantMemoryService(mockLogger, mockErrorHandler);
        updateService = new ConsciousnessUpdateService(null, mockLogger, mockErrorHandler);
        behavioralService = new BehavioralStateService(memoryService, mockLogger, mockErrorHandler);
    });

    describe('Large-Scale Character Processing', () => {
        test('should process 100 characters efficiently', () => {
            // Create 100 characters with memory data
            const characters = [];
            for (let i = 0; i < 100; i++) {
                const character = createTestCharacter(`perf-char-${i}`, 20, 30);
                characters.push(character);
            }

            const worldState = { npcs: characters };
            const startTime = performance.now();

            // Perform memory management
            const result = memoryManager.performMemoryManagement(worldState);

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Performance assertions
            expect(duration).toBeLessThan(500); // Should complete in under 500ms
            expect(result.charactersProcessed).toBe(100);
            expect(result.charactersPerSecond).toBeGreaterThan(100); // At least 100 chars/second

            console.log(`100 characters processed in ${duration.toFixed(2)}ms (${result.charactersPerSecond.toFixed(1)} chars/sec)`);
        });

        test('should process 500 characters efficiently', () => {
            // Create 500 characters with memory data
            const characters = [];
            for (let i = 0; i < 500; i++) {
                const character = createTestCharacter(`perf-char-${i}`, 15, 20);
                characters.push(character);
            }

            const worldState = { npcs: characters };
            const startTime = performance.now();

            // Perform memory management
            const result = memoryManager.performMemoryManagement(worldState);

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Performance assertions
            expect(duration).toBeLessThan(2000); // Should complete in under 2 seconds
            expect(result.charactersProcessed).toBe(500);
            expect(result.charactersPerSecond).toBeGreaterThan(200); // At least 200 chars/second

            console.log(`500 characters processed in ${duration.toFixed(2)}ms (${result.charactersPerSecond.toFixed(1)} chars/sec)`);
        });

        test('should handle memory pressure from 1000+ memories', () => {
            // Create character with 1000+ memories
            const character = createTestCharacter('memory-pressure-test', 1000, 500);

            const startTime = performance.now();

            // Perform memory management
            const result = memoryManager.processCharacter(character);

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Performance assertions
            expect(duration).toBeLessThan(200); // Should complete in under 200ms
            expect(result.memoriesPruned).toBeGreaterThan(0); // Should prune excess memories
            expect(character.significantMemories.length).toBeLessThanOrEqual(
                memoryManager.MEMORY_LIMITS.MAX_MEMORIES_PER_CHARACTER
            );

            console.log(`Memory pressure test completed in ${duration.toFixed(2)}ms, pruned ${result.memoriesPruned} memories`);
        });
    });

    describe('Memory Pruning Performance', () => {
        test('should prune old events efficiently', () => {
            // Create character with many old events
            const character = createTestCharacter('prune-test');
            const oldTimestamp = Date.now() - (100 * 24 * 60 * 60 * 1000); // 100 days ago

            // Add 200 old events
            for (let i = 0; i < 200; i++) {
                character.consciousness.significantEvents.push({
                    id: `old-event-${i}`,
                    type: 'test_event',
                    timestamp: oldTimestamp - (i * 60 * 60 * 1000), // Spread over time
                    significance: 0.3 + (Math.random() * 0.4)
                });
            }

            const startTime = performance.now();

            // Perform memory management
            const result = memoryManager.processCharacter(character);

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Performance assertions
            expect(duration).toBeLessThan(100); // Should complete quickly
            expect(result.eventsPruned).toBeGreaterThan(0); // Should prune old events
            expect(character.consciousness.significantEvents.length).toBeLessThan(200);

            console.log(`Event pruning completed in ${duration.toFixed(2)}ms, pruned ${result.eventsPruned} events`);
        });

        test('should prune old memories efficiently', () => {
            // Create character with many old memories
            const character = createTestCharacter('memory-prune-test');
            const oldTimestamp = Date.now() - (200 * 24 * 60 * 60 * 1000); // 200 days ago

            // Add 300 old memories
            for (let i = 0; i < 300; i++) {
                character.significantMemories.push({
                    id: `old-memory-${i}`,
                    interactionType: 'social',
                    outcome: 'success',
                    timestamp: oldTimestamp - (i * 60 * 60 * 1000),
                    significance: 0.2 + (Math.random() * 0.5)
                });
            }

            const startTime = performance.now();

            // Perform memory management
            const result = memoryManager.processCharacter(character);

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Performance assertions
            expect(duration).toBeLessThan(150); // Should complete quickly
            expect(result.memoriesPruned).toBeGreaterThan(0); // Should prune old memories
            expect(character.significantMemories.length).toBeLessThan(300);

            console.log(`Memory pruning completed in ${duration.toFixed(2)}ms, pruned ${result.memoriesPruned} memories`);
        });

        test('should handle aggressive pruning performance', () => {
            // Create character with mixed age memories
            const character = createTestCharacter('aggressive-prune-test');

            // Add mix of recent and old memories
            const now = Date.now();
            for (let i = 0; i < 150; i++) {
                const age = i < 50 ? now : now - (60 * 24 * 60 * 60 * 1000); // 50 recent, 100 old
                character.significantMemories.push({
                    id: `mixed-memory-${i}`,
                    interactionType: 'social',
                    outcome: 'success',
                    timestamp: age,
                    significance: 0.3 + (Math.random() * 0.4)
                });
            }

            const startTime = performance.now();

            // Perform aggressive memory management
            const result = memoryManager.processCharacter(character, {
                aggressiveCleanup: true
            });

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Performance assertions
            expect(duration).toBeLessThan(100); // Should complete quickly even with aggressive pruning
            expect(result.memoriesPruned).toBeGreaterThan(0);

            console.log(`Aggressive pruning completed in ${duration.toFixed(2)}ms, pruned ${result.memoriesPruned} memories`);
        });
    });

    describe('Garbage Collection Performance', () => {
        test('should perform garbage collection efficiently', () => {
            // Create character with corrupted data
            const character = createTestCharacter('gc-test');

            // Add corrupted data
            character.consciousness.significantEvents.push(null, undefined, {});
            character.significantMemories.push(null, undefined, {});

            // Corrupt behavioral state
            character.consciousness.behavioralState.energy = NaN;
            character.consciousness.behavioralState.invalidField = 'corrupted';

            const startTime = performance.now();

            // Perform memory management with garbage collection
            const result = memoryManager.processCharacter(character);

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Performance assertions
            expect(duration).toBeLessThan(50); // GC should be very fast
            expect(result.garbageCollected).toBeGreaterThan(0); // Should collect garbage

            // Verify data was cleaned
            expect(character.consciousness.significantEvents.every(e => e != null)).toBe(true);
            expect(character.significantMemories.every(m => m != null)).toBe(true);
            expect(character.consciousness.behavioralState.energy).not.toBeNaN();
            expect(character.consciousness.behavioralState.invalidField).toBeUndefined();

            console.log(`Garbage collection completed in ${duration.toFixed(2)}ms, collected ${result.garbageCollected} items`);
        });

        test('should handle large-scale garbage collection', () => {
            // Create character with lots of corrupted data
            const character = createTestCharacter('large-gc-test');

            // Add many null/undefined entries
            for (let i = 0; i < 100; i++) {
                character.consciousness.significantEvents.push(null, undefined);
                character.significantMemories.push(null, undefined);
            }

            const startTime = performance.now();

            // Perform memory management
            const result = memoryManager.processCharacter(character);

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Performance assertions
            expect(duration).toBeLessThan(100); // Should handle large GC efficiently
            expect(result.garbageCollected).toBeGreaterThan(100); // Should collect many items

            console.log(`Large-scale GC completed in ${duration.toFixed(2)}ms, collected ${result.garbageCollected} items`);
        });
    });

    describe('Concurrent Operations Performance', () => {
        test('should handle concurrent memory additions efficiently', () => {
            const character = createTestCharacter('concurrent-test');

            const startTime = performance.now();

            // Simulate concurrent memory additions
            for (let i = 0; i < 50; i++) {
                memoryService.addMemoryIfSignificant(character, {
                    type: 'social',
                    id: `concurrent-memory-${i}`
                }, 'success', {
                    emotionalImpact: 0.5
                });
            }

            const additionsTime = performance.now();

            // Perform memory management
            const result = memoryManager.processCharacter(character);

            const endTime = performance.now();
            const totalDuration = endTime - startTime;
            const managementDuration = endTime - additionsTime;

            // Performance assertions
            expect(totalDuration).toBeLessThan(200); // Total should be fast
            expect(managementDuration).toBeLessThan(50); // Management should be very fast
            expect(result.memoriesPruned).toBeGreaterThanOrEqual(0);

            console.log(`Concurrent operations: ${totalDuration.toFixed(2)}ms total, ${managementDuration.toFixed(2)}ms for management`);
        });

        test('should handle mixed service operations efficiently', () => {
            const character = createTestCharacter('mixed-ops-test');

            const startTime = performance.now();

            // Mix of different operations
            for (let i = 0; i < 25; i++) {
                // Add memory
                memoryService.addMemoryIfSignificant(character, {
                    type: 'social',
                    id: `mixed-memory-${i}`
                }, 'success');

                // Process event
                updateService.processEvent(character, {
                    type: 'social_success',
                    outcome: 'success',
                    significance: 0.6
                });

                // Calculate behavioral modifier
                behavioralService.getBehavioralModifier(character, 'social');
            }

            const operationsTime = performance.now();

            // Perform memory management
            const result = memoryManager.performMemoryManagement({ npcs: [character] });

            const endTime = performance.now();
            const totalDuration = endTime - startTime;
            const managementDuration = endTime - operationsTime;

            // Performance assertions
            expect(totalDuration).toBeLessThan(500); // Should handle mixed operations well
            expect(managementDuration).toBeLessThan(100); // Management should be fast
            expect(result.charactersProcessed).toBe(1);

            console.log(`Mixed operations: ${totalDuration.toFixed(2)}ms total, ${managementDuration.toFixed(2)}ms for management`);
        });
    });

    describe('Memory Monitoring Performance', () => {
        test('should track memory statistics efficiently', () => {
            const character = createTestCharacter('stats-test');

            // Add data
            for (let i = 0; i < 20; i++) {
                memoryService.addMemoryIfSignificant(character, {
                    type: 'social',
                    id: `stats-memory-${i}`
                }, 'success');
            }

            const startTime = performance.now();

            // Perform memory management
            memoryManager.performMemoryManagement({ npcs: [character] });

            // Get memory statistics
            const stats = memoryManager.getMemoryStats();

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Performance assertions
            expect(duration).toBeLessThan(100); // Stats should be fast
            expect(stats).toBeDefined();
            expect(stats.totalMemories).toBeGreaterThanOrEqual(0);
            expect(stats.performanceMetrics.length).toBeGreaterThan(0);

            console.log(`Memory statistics tracking completed in ${duration.toFixed(2)}ms`);
        });

        test('should handle memory warnings efficiently', () => {
            // Simulate high memory usage
            memoryManager.memoryStats.totalEvents = memoryManager.MEMORY_LIMITS.MAX_TOTAL_EVENTS_WORLD * 0.95;
            memoryManager.memoryStats.totalMemories = memoryManager.MEMORY_LIMITS.MAX_TOTAL_MEMORIES_WORLD * 0.95;

            const startTime = performance.now();

            // Trigger memory check
            memoryManager.checkMemoryUsage();

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Performance assertions
            expect(duration).toBeLessThan(10); // Memory checks should be very fast
            expect(memoryManager.memoryStats.memoryWarnings.length).toBeGreaterThan(0);

            console.log(`Memory warning check completed in ${duration.toFixed(2)}ms`);
        });
    });

    describe('Scalability Benchmarks', () => {
        test('should scale efficiently with increasing character count', () => {
            const characterCounts = [10, 50, 100, 200];
            const results = [];

            for (const count of characterCounts) {
                const characters = [];
                for (let i = 0; i < count; i++) {
                    characters.push(createTestCharacter(`scale-char-${i}`, 10, 15));
                }

                const worldState = { npcs: characters };
                const startTime = performance.now();

                const result = memoryManager.performMemoryManagement(worldState);

                const endTime = performance.now();
                const duration = endTime - startTime;

                results.push({
                    characterCount: count,
                    duration,
                    charactersPerSecond: count / (duration / 1000)
                });

                console.log(`${count} characters: ${duration.toFixed(2)}ms (${results[results.length - 1].charactersPerSecond.toFixed(1)} chars/sec)`);
                expect(result.charactersProcessed).toBe(count);
            }

            // Verify scaling efficiency
            for (let i = 1; i < results.length; i++) {
                const scalingFactor = results[i].characterCount / results[i - 1].characterCount;
                const timeIncrease = results[i].duration / results[i - 1].duration;

                // Time should scale roughly linearly (allowing some overhead)
                expect(timeIncrease).toBeLessThan(scalingFactor * 2);
            }
        });

        test('should maintain performance with memory growth', () => {
            const character = createTestCharacter('growth-test');
            const measurements = [];

            // Gradually increase memory load
            for (let load = 50; load <= 500; load += 50) {
                // Add memories to reach target load
                while (character.significantMemories.length < load) {
                    memoryService.addMemoryIfSignificant(character, {
                        type: 'social',
                        id: `growth-memory-${character.significantMemories.length}`
                    }, 'success');
                }

                const startTime = performance.now();

                // Perform memory management
                const result = memoryManager.processCharacter(character);

                const endTime = performance.now();
                const duration = endTime - startTime;

                measurements.push({
                    memoryCount: load,
                    duration,
                    memoriesPerSecond: load / (duration / 1000)
                });

                console.log(`${load} memories: ${duration.toFixed(2)}ms (${measurements[measurements.length - 1].memoriesPerSecond.toFixed(1)} mem/sec)`);
                expect(result.memoriesPruned).toBeGreaterThanOrEqual(0);
            }

            // Verify performance doesn't degrade significantly
            const firstMeasurement = measurements[0];
            const lastMeasurement = measurements[measurements.length - 1];

            // Last measurement should be within 3x of first (allowing for growth overhead)
            expect(lastMeasurement.duration).toBeLessThan(firstMeasurement.duration * 3);
        });
    });

    describe('Memory Efficiency Benchmarks', () => {
        test('should demonstrate memory pruning efficiency', () => {
            // Create character with excessive memories
            const character = createTestCharacter('efficiency-test');

            // Add far more memories than the limit
            const excessMemories = memoryManager.MEMORY_LIMITS.MAX_MEMORIES_PER_CHARACTER * 3;
            for (let i = 0; i < excessMemories; i++) {
                character.significantMemories.push({
                    id: `excess-memory-${i}`,
                    interactionType: 'social',
                    outcome: 'success',
                    timestamp: Date.now() - (i * 60 * 60 * 1000), // Different ages
                    significance: 0.3 + (Math.random() * 0.4)
                });
            }

            const initialMemoryCount = character.significantMemories.length;

            const startTime = performance.now();

            // Perform memory management
            const result = memoryManager.processCharacter(character);

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Calculate efficiency metrics
            const finalMemoryCount = character.significantMemories.length;
            const memoryReduction = initialMemoryCount - finalMemoryCount;
            const efficiency = memoryReduction / initialMemoryCount;

            // Performance assertions
            expect(duration).toBeLessThan(200); // Should be efficient
            expect(efficiency).toBeGreaterThan(0.5); // Should reduce memory significantly
            expect(finalMemoryCount).toBeLessThanOrEqual(memoryManager.MEMORY_LIMITS.MAX_MEMORIES_PER_CHARACTER);
            expect(result.memoriesPruned).toBeGreaterThan(0);

            console.log(`Memory pruning efficiency: ${duration.toFixed(2)}ms, ${(efficiency * 100).toFixed(1)}% reduction (${memoryReduction} memories pruned)`);
        });

        test('should optimize data structures efficiently', () => {
            // Create character with unoptimized data
            const character = createTestCharacter('optimization-test');

            // Add events in random order (unoptimized)
            const eventCount = 100;
            for (let i = 0; i < eventCount; i++) {
                character.consciousness.significantEvents.push({
                    id: `unordered-event-${i}`,
                    type: 'social_success',
                    timestamp: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000), // Random ages
                    significance: 0.3 + (Math.random() * 0.4)
                });
            }

            const startTime = performance.now();

            // Perform memory management (which includes optimization)
            const result = memoryManager.processCharacter(character);

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Verify optimization worked
            expect(duration).toBeLessThan(100);
            expect(character.consciousness.significantEvents.length).toBeLessThanOrEqual(eventCount);
            expect(result.eventsPruned).toBeGreaterThanOrEqual(0);

            // Check if events are sorted (optimization)
            const events = character.consciousness.significantEvents;
            let isSorted = true;
            for (let i = 0; i < events.length - 1; i++) {
                if (events[i].timestamp < events[i + 1].timestamp) {
                    isSorted = false;
                    break;
                }
            }

            // Events should be sorted by recency (newest first)
            expect(isSorted).toBe(true);

            console.log(`Data structure optimization completed in ${duration.toFixed(2)}ms`);
        });
    });
});

/**
 * Helper function to create a test character with specified memory/event counts
 * @param {string} id - Character ID
 * @param {number} memoryCount - Number of memories to add
 * @param {number} eventCount - Number of events to add
 * @returns {Object} Test character
 */
function createTestCharacter(id, memoryCount = 10, eventCount = 15) {
    const character = {
        id,
        consciousness: {
            frequency: 7.0 + (Math.random() * 2),
            coherence: 0.5 + (Math.random() * 0.3),
            behavioralState: {
                energy: 'moderate',
                focus: 'balanced',
                mood: 'content',
                socialDrive: 0.5 + (Math.random() * 0.4),
                riskTolerance: 0.4 + (Math.random() * 0.3),
                ambition: 0.5 + (Math.random() * 0.4)
            },
            significantEvents: []
        },
        significantMemories: []
    };

    // Add memories
    for (let i = 0; i < memoryCount; i++) {
        character.significantMemories.push({
            id: `memory-${id}-${i}`,
            interactionType: ['social', 'combat', 'trade', 'exploration'][Math.floor(Math.random() * 4)],
            outcome: ['success', 'failure', 'neutral'][Math.floor(Math.random() * 3)],
            timestamp: Date.now() - (Math.random() * 60 * 24 * 60 * 60 * 1000), // Random age up to 60 days
            significance: 0.2 + (Math.random() * 0.6)
        });
    }

    // Add events
    for (let i = 0; i < eventCount; i++) {
        character.consciousness.significantEvents.push({
            id: `event-${id}-${i}`,
            type: ['social_success', 'combat', 'discovery', 'economic_gain'][Math.floor(Math.random() * 4)],
            timestamp: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000), // Random age up to 30 days
            significance: 0.3 + (Math.random() * 0.5)
        });
    }

    return character;
}