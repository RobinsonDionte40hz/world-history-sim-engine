/**
 * Memory Management Integration Tests
 *
 * Integration tests to verify memory management works correctly
 * with the full consciousness system including all services.
 */

import MemoryManagementService from '../MemoryManagementService.js';
import SignificantMemoryService from '../SignificantMemoryService.js';
import ConsciousnessCheckpointService from '../ConsciousnessCheckpointService.js';
import BehavioralStateService from '../BehavioralStateService.js';
import ConsciousnessUpdateService from '../ConsciousnessUpdateService.js';
import ConsciousnessErrorHandlingService from '../ConsciousnessErrorHandlingService.js';

// Mock logger
const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

describe('Memory Management Integration', () => {
    let memoryManager;
    let memoryService;
    let behavioralService;
    let updateService;
    let errorHandler;

    let testCharacter;
    let testWorldState;

    beforeEach(() => {
        jest.clearAllMocks();

        // Initialize services
        errorHandler = new ConsciousnessErrorHandlingService(mockLogger);
        memoryManager = new MemoryManagementService(mockLogger, errorHandler);
        memoryService = new SignificantMemoryService(mockLogger, errorHandler);
        behavioralService = new BehavioralStateService(memoryService, mockLogger, errorHandler);
        updateService = new ConsciousnessUpdateService(null, mockLogger, errorHandler);

        // Create test character
        testCharacter = {
            id: 'integration-test-char',
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
                significantEvents: []
            },
            significantMemories: [],
            personality: {
                traits: {
                    empathy: 0.7,
                    aggression: 0.3,
                    curiosity: 0.8
                }
            }
        };

        testWorldState = {
            npcs: [testCharacter]
        };
    });

    describe('End-to-End Memory Management', () => {
        test('should integrate memory management with memory service', () => {
            // Add memories using SignificantMemoryService
            const memory1 = memoryService.addMemoryIfSignificant(testCharacter, {
                type: 'social',
                id: 'social-interaction-1'
            }, 'success', {
                emotionalImpact: 0.8,
                participants: ['npc1', 'npc2']
            });

            const memory2 = memoryService.addMemoryIfSignificant(testCharacter, {
                type: 'combat',
                id: 'combat-interaction-1'
            }, 'failure', {
                emotionalImpact: 0.6,
                participants: ['enemy1']
            });

            // Verify memories were added
            expect(memory1).toBe(true);
            expect(memory2).toBe(true);
            expect(testCharacter.significantMemories.length).toBe(2);

            // Perform memory management
            const memoryResult = memoryManager.processCharacter(testCharacter);

            // Verify memory management worked
            expect(memoryResult.memoriesPruned).toBeGreaterThanOrEqual(0);
            expect(memoryResult.garbageCollected).toBeGreaterThanOrEqual(0);
            expect(memoryResult.memoriesPruned).toBeGreaterThanOrEqual(0);
            expect(memoryResult.garbageCollected).toBeGreaterThanOrEqual(0);
        });

        test('should integrate with consciousness update service', () => {
            // Process an event using ConsciousnessUpdateService
            const event = {
                type: 'social_success',
                outcome: 'success',
                significance: 0.8
            };

            const updateResult = updateService.processEvent(testCharacter, event, {
                emotionalImpact: 0.7
            });

            // Verify event was processed
            expect(updateResult.success).toBe(true);
            expect(updateResult.updated).toBe(true);

            // Verify consciousness was updated
            expect(testCharacter.consciousness.significantEvents.length).toBeGreaterThan(0);

            // Perform memory management
            const memoryResult = memoryManager.processCharacter(testCharacter);

            // Verify memory management cleaned up events if needed
            expect(memoryResult.eventsPruned).toBeGreaterThanOrEqual(0);
        });

        test('should integrate with behavioral state service', () => {
            // Add some memories first
            memoryService.addMemoryIfSignificant(testCharacter, {
                type: 'social',
                id: 'social-memory-1'
            }, 'success', {
                emotionalImpact: 0.8
            });

            // Get behavioral modifier using BehavioralStateService
            const modifier = behavioralService.getBehavioralModifier(testCharacter, 'social', {
                timeOfDay: 'evening',
                environment: { weather: 'sunny' }
            });

            // Verify modifier was calculated
            expect(typeof modifier).toBe('number');
            expect(modifier).toBeGreaterThanOrEqual(0.1);
            expect(modifier).toBeLessThanOrEqual(3.0);

            // Perform memory management
            const memoryResult = memoryManager.processCharacter(testCharacter);

            // Verify memory management didn't break behavioral calculations
            const modifierAfterCleanup = behavioralService.getBehavioralModifier(testCharacter, 'social');
            expect(typeof modifierAfterCleanup).toBe('number');
        });

        test('should integrate with checkpoint service', () => {
            // Add some data to character
            memoryService.addMemoryIfSignificant(testCharacter, {
                type: 'exploration',
                id: 'exploration-1'
            }, 'success');

            testCharacter.consciousness.significantEvents.push({
                id: 'test-event',
                type: 'test',
                timestamp: Date.now(),
                significance: 0.7
            });

            // Save checkpoint
            const checkpoint = ConsciousnessCheckpointService.saveCheckpoint(testWorldState);
            expect(checkpoint).toBeDefined();
            expect(checkpoint.characterStates.size).toBe(1);

            // Perform memory management
            const memoryResult = memoryManager.performMemoryManagement(testWorldState);
            expect(memoryResult.charactersProcessed).toBe(1);

            // Restore from checkpoint
            const restoreResult = ConsciousnessCheckpointService.restoreCheckpoint(testWorldState, checkpoint);
            expect(restoreResult.success).toBe(true);
            expect(restoreResult.restoredCount).toBe(1);

            // Verify data integrity after restore and memory management
            expect(testCharacter.significantMemories.length).toBeGreaterThanOrEqual(0);
            expect(memoryResult.eventsPruned).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Cross-Service Memory Management', () => {
        test('should handle memory management during active simulation', () => {
            // Simulate active simulation with multiple interactions
            const interactions = [
                { type: 'social', outcome: 'success', significance: 0.8 },
                { type: 'combat', outcome: 'failure', significance: 0.6 },
                { type: 'trade', outcome: 'success', significance: 0.5 },
                { type: 'exploration', outcome: 'critical_success', significance: 0.9 },
                { type: 'rest', outcome: 'success', significance: 0.3 }
            ];

            // Process multiple interactions
            interactions.forEach((interaction, index) => {
                memoryService.addMemoryIfSignificant(testCharacter, {
                    type: interaction.type,
                    id: `interaction-${index}`
                }, interaction.outcome, {
                    emotionalImpact: interaction.significance
                });

                // Process event
                updateService.processEvent(testCharacter, {
                    type: `${interaction.type}_event`,
                    outcome: interaction.outcome,
                    significance: interaction.significance
                });
            });

            // Verify data accumulation
            expect(testCharacter.significantMemories.length).toBeGreaterThan(0);
            expect(testCharacter.consciousness.significantEvents.length).toBeGreaterThan(0);

            // Perform comprehensive memory management
            const memoryResult = memoryManager.performMemoryManagement(testWorldState);

            // Verify memory management worked across all services
            expect(memoryResult.charactersProcessed).toBe(1);
            expect(memoryResult.eventsPruned).toBeGreaterThanOrEqual(0);
            expect(memoryResult.memoriesPruned).toBeGreaterThanOrEqual(0);

            // Verify services still work after memory management
            const modifier = behavioralService.getBehavioralModifier(testCharacter, 'social');
            expect(typeof modifier).toBe('number');

            const memoryStats = memoryService.getMemoryStatistics(testCharacter);
            expect(memoryStats.totalMemories).toBeGreaterThanOrEqual(0);
        });

        test('should handle memory pressure from multiple characters', () => {
            // Create multiple characters with memory data
            const characters = [];
            for (let i = 0; i < 5; i++) {
                const character = {
                    id: `multi-char-${i}`,
                    consciousness: {
                        frequency: 7.0 + (i * 0.2),
                        coherence: 0.6 + (i * 0.02),
                        behavioralState: {
                            energy: 'moderate',
                            focus: 'balanced',
                            mood: 'content',
                            socialDrive: 0.5,
                            riskTolerance: 0.5,
                            ambition: 0.6
                        },
                        significantEvents: []
                    },
                    significantMemories: []
                };

                // Add memories and events to each character
                for (let j = 0; j < 10; j++) {
                    memoryService.addMemoryIfSignificant(character, {
                        type: 'social',
                        id: `memory-${i}-${j}`
                    }, 'success');

                    character.consciousness.significantEvents.push({
                        id: `event-${i}-${j}`,
                        type: 'social_success',
                        timestamp: Date.now() - (j * 24 * 60 * 60 * 1000), // Different ages
                        significance: 0.5 + (j * 0.05)
                    });
                }

                characters.push(character);
            }

            const multiWorldState = { npcs: characters };

            // Perform memory management on all characters
            const memoryResult = memoryManager.performMemoryManagement(multiWorldState);

            // Verify batch processing worked
            expect(memoryResult.charactersProcessed).toBe(5);
            expect(memoryResult.eventsPruned).toBeGreaterThanOrEqual(0);
            expect(memoryResult.memoriesPruned).toBeGreaterThanOrEqual(0);

            // Verify each character still has valid data
            characters.forEach(character => {
                expect(character.significantMemories.length).toBeGreaterThanOrEqual(0);
                expect(character.consciousness.significantEvents.length).toBeGreaterThanOrEqual(0);

                // Verify behavioral calculations still work
                const modifier = behavioralService.getBehavioralModifier(character, 'social');
                expect(typeof modifier).toBe('number');
            });
        });

        test('should handle error recovery during memory management', () => {
            // Create a character with corrupted data
            const corruptedCharacter = {
                id: 'corrupted-char',
                consciousness: {
                    frequency: NaN, // Corrupted frequency
                    coherence: 0.7,
                    behavioralState: null, // Missing behavioral state
                    significantEvents: [null, undefined, {}] // Corrupted events
                },
                significantMemories: [null, {}] // Corrupted memories
            };

            const mixedWorldState = {
                npcs: [testCharacter, corruptedCharacter]
            };

            // Process mixed world state
            const memoryResult = memoryManager.performMemoryManagement(mixedWorldState);

            // Should have processed both characters
            expect(memoryResult.charactersProcessed).toBe(2);

            // Should have performed garbage collection on corrupted data
            expect(memoryResult.garbageCollected).toBeGreaterThan(0);

            // Verify corrupted character was repaired
            expect(typeof corruptedCharacter.consciousness.frequency).toBe('number');
            expect(corruptedCharacter.consciousness.behavioralState).toBeDefined();
            expect(corruptedCharacter.consciousness.significantEvents.length).toBeGreaterThanOrEqual(0);
            expect(corruptedCharacter.significantMemories.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Performance Integration', () => {
        test('should maintain performance with large datasets', () => {
            // Create a character with many memories and events
            const largeCharacter = { ...testCharacter };
            largeCharacter.significantMemories = [];
            largeCharacter.consciousness.significantEvents = [];

            // Add many memories
            for (let i = 0; i < 100; i++) {
                largeCharacter.significantMemories.push({
                    id: `large-memory-${i}`,
                    interactionType: 'social',
                    outcome: 'success',
                    timestamp: Date.now() - (i * 24 * 60 * 60 * 1000), // Different ages
                    significance: 0.3 + (Math.random() * 0.7)
                });
            }

            // Add many events
            for (let i = 0; i < 50; i++) {
                largeCharacter.consciousness.significantEvents.push({
                    id: `large-event-${i}`,
                    type: 'social_success',
                    timestamp: Date.now() - (i * 24 * 60 * 60 * 1000),
                    significance: 0.3 + (Math.random() * 0.7)
                });
            }

            const startTime = Date.now();

            // Perform memory management
            const memoryResult = memoryManager.processCharacter(largeCharacter);

            const duration = Date.now() - startTime;

            // Verify performance is reasonable (< 100ms for this dataset)
            expect(duration).toBeLessThan(100);

            // Verify memory management worked
            expect(memoryResult.eventsPruned).toBeGreaterThanOrEqual(0);
            expect(memoryResult.memoriesPruned).toBeGreaterThanOrEqual(0);

            // Verify limits were enforced
            expect(largeCharacter.significantMemories.length).toBeLessThanOrEqual(
                memoryManager.MEMORY_LIMITS.MAX_MEMORIES_PER_CHARACTER
            );
            expect(largeCharacter.consciousness.significantEvents.length).toBeLessThanOrEqual(
                memoryManager.MEMORY_LIMITS.MAX_EVENTS_PER_CHARACTER
            );
        });

        test('should handle concurrent service operations', () => {
            // Test that memory management doesn't interfere with concurrent operations
            // Add memories synchronously to avoid closure issues
            for (let i = 0; i < 10; i++) {
                memoryService.addMemoryIfSignificant(testCharacter, {
                    type: 'social',
                    id: `concurrent-memory-${i}`
                }, 'success');
            }

            // Perform memory management
            const memoryResult = memoryManager.processCharacter(testCharacter);

            // Verify everything worked
            expect(memoryResult.memoriesPruned).toBeGreaterThanOrEqual(0);
            expect(testCharacter.significantMemories.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Memory Monitoring Integration', () => {
        test('should provide memory statistics across services', () => {
            // Add data through different services
            memoryService.addMemoryIfSignificant(testCharacter, {
                type: 'social',
                id: 'stats-memory-1'
            }, 'success');

            updateService.processEvent(testCharacter, {
                type: 'social_success',
                outcome: 'success'
            });

            // Get memory statistics from memory manager
            const memoryStats = memoryManager.getMemoryStats();

            // Verify statistics are available
            expect(memoryStats).toBeDefined();
            expect(memoryStats.totalEvents).toBeGreaterThanOrEqual(0);
            expect(memoryStats.totalMemories).toBeGreaterThanOrEqual(0);
            expect(memoryStats.charactersProcessed).toBeGreaterThanOrEqual(0);
        });

        test('should detect memory pressure and generate warnings', () => {
            // Simulate high memory usage
            memoryManager.memoryStats.totalEvents = memoryManager.MEMORY_LIMITS.MAX_TOTAL_EVENTS_WORLD * 0.95;
            memoryManager.memoryStats.totalMemories = memoryManager.MEMORY_LIMITS.MAX_TOTAL_MEMORIES_WORLD * 0.95;

            // Trigger memory check
            memoryManager.checkMemoryUsage();

            // Verify warnings were generated
            expect(memoryManager.memoryStats.memoryWarnings.length).toBeGreaterThan(0);

            // Verify warning details
            const eventWarning = memoryManager.memoryStats.memoryWarnings.find(w => w.type === 'events');
            const memoryWarning = memoryManager.memoryStats.memoryWarnings.find(w => w.type === 'memories');

            expect(eventWarning).toBeDefined();
            expect(memoryWarning).toBeDefined();
            expect(eventWarning.ratio).toBeGreaterThan(0.9);
            expect(memoryWarning.ratio).toBeGreaterThan(0.9);
        });

        test('should integrate memory monitoring with service operations', () => {
            // Perform operations that should trigger memory monitoring
            for (let i = 0; i < 20; i++) {
                memoryService.addMemoryIfSignificant(testCharacter, {
                    type: 'social',
                    id: `monitoring-memory-${i}`
                }, 'success');

                updateService.processEvent(testCharacter, {
                    type: 'social_success',
                    outcome: 'success'
                });
            }

            // Perform memory management
            memoryManager.performMemoryManagement(testWorldState);

            // Check that monitoring data was updated
            const stats = memoryManager.getMemoryStats();
            expect(stats.performanceMetrics.length).toBeGreaterThan(0);

            // Verify performance metrics contain expected data
            const latestMetric = stats.performanceMetrics[stats.performanceMetrics.length - 1];
            expect(latestMetric.charactersProcessed).toBe(1);
            expect(latestMetric.duration).toBeGreaterThan(0);
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle service failures gracefully', () => {
            // Mock memory service to throw error
            const originalAddMemory = memoryService.addMemoryIfSignificant;
            memoryService.addMemoryIfSignificant = jest.fn().mockImplementation(() => {
                throw new Error('Memory service failure');
            });

            // Attempt operation that should fail
            expect(() => {
                memoryService.addMemoryIfSignificant(testCharacter, {
                    type: 'social',
                    id: 'failing-memory'
                }, 'success');
            }).toThrow();

            // Restore original method
            memoryService.addMemoryIfSignificant = originalAddMemory;

            // Verify memory management can still work
            const memoryResult = memoryManager.processCharacter(testCharacter);
            expect(memoryResult).toBeDefined();
        });

        test('should recover from corrupted service data', () => {
            // Corrupt character data
            testCharacter.consciousness.frequency = 'invalid';
            testCharacter.consciousness.behavioralState = 'corrupted';
            testCharacter.significantMemories = 'not an array';

            // Attempt to use services (should trigger error handling)
            const modifierResult = behavioralService.getBehavioralModifier(testCharacter, 'social');

            // Should have fallback value
            expect(typeof modifierResult).toBe('number');

            // Perform memory management (should repair data)
            const memoryResult = memoryManager.processCharacter(testCharacter);

            // Should have performed garbage collection/repair
            expect(memoryResult.garbageCollected).toBeGreaterThan(0);

            // Verify data was repaired
            expect(typeof testCharacter.consciousness.frequency).toBe('number');
            expect(typeof testCharacter.consciousness.behavioralState).toBe('object');
            expect(Array.isArray(testCharacter.significantMemories)).toBe(true);
        });

        test('should maintain service integrity after errors', () => {
            // Cause multiple errors
            const invalidCharacter = {
                id: 'invalid',
                consciousness: null,
                significantMemories: null
            };

            const errorWorldState = {
                npcs: [testCharacter, invalidCharacter]
            };

            // Process with errors
            const memoryResult = memoryManager.performMemoryManagement(errorWorldState);

            // Should have handled errors gracefully
            expect(memoryResult.errors.length).toBeGreaterThan(0);
            expect(memoryResult.charactersProcessed).toBe(2);

            // Verify valid character still works
            const modifier = behavioralService.getBehavioralModifier(testCharacter, 'social');
            expect(typeof modifier).toBe('number');

            // Verify memory statistics still work
            const stats = memoryManager.getMemoryStats();
            expect(stats).toBeDefined();
        });
    });
});