/**
 * Large-Scale Memory Management Test
 *
 * Tests            // Perform            // Performance ass            // Performance assertions
            expect(duration).toBeLessThan(8000)            // Performance assertions
            expect(durati            // Performance assertions
            expect(duration).toBeLessThan(7000); // Should handle fragmentation efficiently
            expect(result.charactersProcessed).toBeGreaterThan(0); // Should process some characters
            expect(result.garbageCollected).toBeGreaterThan(0); // Should collect fragmented data

            console.log(`Fragmented data (${characters.length} chars) processed in ${duration.toFixed(2)}ms (${result.performance.charactersPerSecond.toFixed(1)} chars/sec, ${result.garbageCollected} items garbage collected)`);BeLessThan(6000); // Should complete in under 6 seconds
            expect(result.charactersProcessed).toBe(1000);
            expect(result.performance.charactersPerSecond).toBeGreaterThan(120); // At least 120 chars/second
            expect(result.memoriesPruned).toBeGreaterThan(0); // Should prune memories from high-load characters

            console.log(`Mixed scenarios (1000 chars) processed in ${duration.toFixed(2)}ms (${result.performance.charactersPerSecond.toFixed(1)} chars/sec, ${result.memoriesPruned} memories pruned)`);ould complete in under 8 seconds
            expect(result.charactersProcessed).toBe(1000);
            expect(result.performance.charactersPerSecond).toBeGreaterThan(100); // At least 100 chars/second
            expect(result.memoriesPruned).toBeGreaterThan(0); // Should prune some memories

            console.log(`1000 high-load characters processed in ${duration.toFixed(2)}ms (${result.performance.charactersPerSecond.toFixed(1)} chars/sec, ${result.memoriesPruned} memories pruned)`);
            expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
            expect(result.charactersProcessed).toBe(1000);
            expect(result.performance.charactersPerSecond).toBeGreaterThan(150); // At least 150 chars/second

            console.log(`1000 characters processed in ${duration.toFixed(2)}ms (${result.performance.charactersPerSecond.toFixed(1)} chars/sec)`);ss            // Performance assertions
            expect(duration).toBeLessThan(8000)            // Performance assertions
            expect(durati            // Performance assertions
            expect(duration).toBeLessThan(7000); // Should handle fragmentation efficiently
            expect(result.charactersProcessed).toBeGreaterThan(0); // Should process some characters
            expect(result.garbageCollected).toBeGreaterThan(0); // Should collect fragmented data

            console.log(`Fragmented data (${characters.length} chars) processed in ${duration.toFixed(2)}ms (${result.performance.charactersPerSecond.toFixed(1)} chars/sec, ${result.garbageCollected} items garbage collected)`);BeLessThan(6000); // Should complete in under 6 seconds
            expect(result.charactersProcessed).toBe(1000);
            expect(result.performance.charactersPerSecond).toBeGreaterThan(120); // At least 120 chars/second
            expect(result.memoriesPruned).toBeGreaterThan(0); // Should prune memories from high-load characters

            console.log(`Mixed scenarios (1000 chars) processed in ${duration.toFixed(2)}ms (${result.performance.charactersPerSecond.toFixed(1)} chars/sec, ${result.memoriesPruned} memories pruned)`);ould complete in under 8 seconds
            expect(result.charactersProcessed).toBe(1000);
            expect(result.performance.charactersPerSecond).toBeGreaterThan(100); // At least 100 chars/second
            expect(result.memoriesPruned).toBeGreaterThan(0); // Should prune some memories

            console.log(`1000 high-load characters processed in ${duration.toFixed(2)}ms (${result.performance.charactersPerSecond.toFixed(1)} chars/sec, ${result.memoriesPruned} memories pruned)`);
            expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
            expect(result.charactersProcessed).toBe(1000);
            expect(result.performance.charactersPerSecond).toBeGreaterThan(150); // At least 150 chars/second

            console.log(`1000 characters processed in ${duration.toFixed(2)}ms (${result.performance.charactersPerSecond.toFixed(1)} chars/sec)`);y management with 1000+ NPCs to verify scalability
 * and            // Performance should be relatively consistent (max should not be more than 3x min)
            expect(maxDuration).toBeLessThan(minDuration * 3);
            expect(avgDuration).toBeLessThan(3000); // Average under 3 seconds
            expect(results.length).toBe(iterations); // Verify all iterations completed

            console.log(`Sustained performance: avg ${avgDuration.toFixed(2)}ms, range ${minDuration.toFixed(2)}-${maxDuration.toFixed(2)}ms`);ormance in large-scale simulations.
 */

import MemoryManagementService from '../../services/MemoryManagementService.js';
import SignificantMemoryService from '../../services/SignificantMemoryService.js';

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

describe('Large-Scale Memory Management', () => {
    let memoryManager;
    let memoryService;

    beforeEach(() => {
        jest.clearAllMocks();

        memoryManager = new MemoryManagementService(mockLogger, mockErrorHandler);
        memoryService = new SignificantMemoryService(mockLogger, mockErrorHandler);
    });

    test('should handle 1000 NPCs efficiently', () => {
        // Create 1000 characters with memory data
        const characters = [];
        for (let i = 0; i < 1000; i++) {
            const character = createTestCharacter(`large-scale-char-${i}`, 20, 30);
            characters.push(character);
        }

        const worldState = { npcs: characters };
        const startTime = performance.now();

        // Perform memory management
        const result = memoryManager.performMemoryManagement(worldState);

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Performance assertions
        expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
        expect(result.charactersProcessed).toBe(1000);
        expect(result.performance.charactersPerSecond).toBeGreaterThan(150); // At least 150 chars/second

        console.log(`1000 characters processed in ${duration.toFixed(2)}ms (${result.performance.charactersPerSecond.toFixed(1)} chars/sec)`);
    });

    test('should handle memory pressure with 1000+ NPCs and high memory load', () => {
        // Create 1000 characters with high memory load
        const characters = [];
        for (let i = 0; i < 1000; i++) {
            const character = createTestCharacter(`high-load-char-${i}`, 50, 40);
            characters.push(character);
        }

        const worldState = { npcs: characters };
        const startTime = performance.now();

        // Perform memory management
        const result = memoryManager.performMemoryManagement(worldState);

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Performance assertions
        expect(duration).toBeLessThan(8000); // Should complete in under 8 seconds
        expect(result.charactersProcessed).toBe(1000);
        expect(result.performance.charactersPerSecond).toBeGreaterThan(100); // At least 100 chars/second
        expect(result.eventsPruned).toBeGreaterThan(0); // Should prune excess events (40 > 20 limit)

        console.log(`1000 high-load characters processed in ${duration.toFixed(2)}ms (${result.performance.charactersPerSecond.toFixed(1)} chars/sec, ${result.eventsPruned} events pruned)`);
    });

    test('should maintain performance during sustained operation', () => {
        const characterCount = 500;
        const iterations = 5;
        const results = [];

        for (let iteration = 0; iteration < iterations; iteration++) {
            // Create fresh characters for each iteration
            const characters = [];
            for (let i = 0; i < characterCount; i++) {
                const character = createTestCharacter(`sustained-char-${iteration}-${i}`, 15, 20);
                characters.push(character);
            }

            const worldState = { npcs: characters };
            const startTime = performance.now();

            const result = memoryManager.performMemoryManagement(worldState);

            const endTime = performance.now();
            const duration = endTime - startTime;

            results.push({
                iteration: iteration + 1,
                duration,
                charactersPerSecond: characterCount / (duration / 1000)
            });

            console.log(`Iteration ${iteration + 1}: ${duration.toFixed(2)}ms (${results[iteration].charactersPerSecond.toFixed(1)} chars/sec)`);
            expect(result.charactersProcessed).toBe(characterCount);
        }

        // Verify performance consistency
        const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / iterations;
        const minDuration = Math.min(...results.map(r => r.duration));
        const maxDuration = Math.max(...results.map(r => r.duration));

        // Performance should be relatively consistent (max should not be more than 3x min)
        expect(maxDuration).toBeLessThan(minDuration * 3);
        expect(avgDuration).toBeLessThan(3000); // Average under 3 seconds

        console.log(`Sustained performance: avg ${avgDuration.toFixed(2)}ms, range ${minDuration.toFixed(2)}-${maxDuration.toFixed(2)}ms`);
    });

    test('should handle mixed memory scenarios with 1000+ NPCs', () => {
        // Create diverse character scenarios
        const characters = [];

        // 300 characters with low memory load
        for (let i = 0; i < 300; i++) {
            characters.push(createTestCharacter(`low-mem-${i}`, 5, 8));
        }

        // 400 characters with medium memory load
        for (let i = 0; i < 400; i++) {
            characters.push(createTestCharacter(`med-mem-${i}`, 25, 20));
        }

        // 300 characters with high memory load
        for (let i = 0; i < 300; i++) {
            characters.push(createTestCharacter(`high-mem-${i}`, 60, 50));
        }

        const worldState = { npcs: characters };
        const startTime = performance.now();

        // Perform memory management
        const result = memoryManager.performMemoryManagement(worldState);

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Performance assertions
        expect(duration).toBeLessThan(6000); // Should complete in under 6 seconds
        expect(result.charactersProcessed).toBe(1000);
        expect(result.performance.charactersPerSecond).toBeGreaterThan(120); // At least 120 chars/second
        expect(result.memoriesPruned).toBeGreaterThan(0); // Should prune memories from high-load characters

        console.log(`Mixed scenarios (1000 chars) processed in ${duration.toFixed(2)}ms (${result.performance.charactersPerSecond.toFixed(1)} chars/sec, ${result.memoriesPruned} memories pruned)`);
    });

    test('should scale memory limits appropriately for large simulations', () => {
        // Test with different world sizes
        const testSizes = [100, 500, 1000, 2000];

        for (const size of testSizes) {
            const characters = [];
            for (let i = 0; i < size; i++) {
                characters.push(createTestCharacter(`scale-test-${size}-${i}`, 10, 15));
            }

            const worldState = { npcs: characters };
            const startTime = performance.now();

            const result = memoryManager.performMemoryManagement(worldState);

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Verify scaling performance
            const expectedMaxDuration = size * 5; // Rough scaling expectation
            expect(duration).toBeLessThan(expectedMaxDuration);
            expect(result.charactersProcessed).toBe(size);

            console.log(`${size} characters: ${duration.toFixed(2)}ms (${(size / (duration / 1000)).toFixed(1)} chars/sec)`);
        }
    });

    test('should handle memory fragmentation in large simulations', () => {
        // Create characters with fragmented memory data
        const characters = [];
        for (let i = 0; i < 800; i++) {
            const character = createTestCharacter(`fragmented-${i}`, 30, 25);

            // Add some null/undefined entries to simulate fragmentation
            character.significantMemories.splice(10, 0, null, undefined);
            character.consciousness.significantEvents.splice(8, 0, null, undefined);

            // Add corrupted behavioral state to trigger garbage collection
            if (i % 2 === 0) { // Every other character
                character.consciousness.behavioralState.socialDrive = NaN;
                character.consciousness.behavioralState.riskTolerance = Infinity;
            }

            characters.push(character);
        }

        const worldState = { npcs: characters };
        const startTime = performance.now();

        // Perform memory management (should handle fragmentation)
        const result = memoryManager.performMemoryManagement(worldState);

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Performance assertions
        expect(duration).toBeLessThan(7000); // Should handle fragmentation efficiently
        expect(result.charactersProcessed).toBe(800); // Should process all 800 characters
        expect(result.garbageCollected).toBeGreaterThan(0); // Should collect fragmented data

        console.log(`Fragmented data (${characters.length} chars) processed in ${duration.toFixed(2)}ms (${result.performance.charactersPerSecond.toFixed(1)} chars/sec, ${result.garbageCollected} items garbage collected)`);
    });

    test('should maintain memory bounds in extended simulation', () => {
        // Simulate extended simulation with memory accumulation
        let characters = [];
        const simulationSteps = 10;

        for (let step = 0; step < simulationSteps; step++) {
            // Add new characters or update existing ones
            if (step === 0) {
                // Initial population
                for (let i = 0; i < 500; i++) {
                    characters.push(createTestCharacter(`extended-${i}`, 20, 15));
                }
            } else {
                // Add some new characters and update memories
                for (let i = 0; i < 50; i++) {
                    characters.push(createTestCharacter(`extended-new-${step}-${i}`, 15, 10));
                }

                // Update existing characters with new memories
                for (let i = 0; i < characters.length; i++) {
                    const char = characters[i];
                    if (Math.random() < 0.3) { // 30% chance to add memory
                        memoryService.addMemoryIfSignificant(char, {
                            type: 'social',
                            id: `step-${step}-memory`
                        }, 'success');
                    }
                }
            }

            const worldState = { npcs: characters };
            const startTime = performance.now();

            const result = memoryManager.performMemoryManagement(worldState);

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Verify performance remains acceptable
            expect(duration).toBeLessThan(4000);
            expect(result.charactersProcessed).toBe(characters.length);

            console.log(`Step ${step + 1}: ${characters.length} chars in ${duration.toFixed(2)}ms (${result.performance.charactersPerSecond.toFixed(1)} chars/sec)`);

            // Verify memory bounds are maintained
            const totalMemories = characters.reduce((sum, char) => sum + char.significantMemories.length, 0);
            const totalEvents = characters.reduce((sum, char) => sum + char.consciousness.significantEvents.length, 0);

            expect(totalMemories).toBeLessThan(memoryManager.MEMORY_LIMITS.MAX_TOTAL_MEMORIES_WORLD * 1.1); // Allow 10% buffer
            expect(totalEvents).toBeLessThan(memoryManager.MEMORY_LIMITS.MAX_TOTAL_EVENTS_WORLD * 1.1);
        }

        console.log(`Extended simulation completed: ${characters.length} final characters, memory bounds maintained`);
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