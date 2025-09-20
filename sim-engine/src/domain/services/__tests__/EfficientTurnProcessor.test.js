/**
 * Unit Tests for EfficientTurnProcessor
 *
 * Tests the core functionality of the EfficientTurnProcessor class
 * including cached state processing, significance checking, and behavior generation.
 */

import EfficientTurnProcessor from '../EfficientTurnProcessor.js';
import BehavioralStateService from '../BehavioralStateService.js';
import ConsciousnessUpdateService from '../ConsciousnessUpdateService.js';
import EventSignificanceService from '../EventSignificanceService.js';
import SignificantMemoryService from '../SignificantMemoryService.js';
import ConsciousnessCheckpointService from '../ConsciousnessCheckpointService.js';

// Mock services for testing
class MockBehavioralStateService {
    constructor() {
        this.callCount = 0;
    }

    getBehavioralModifier(character, interactionType, context = {}) {
        this.callCount++;
        return 1.5;
    }

    calculateDecisionFactor(character, interactionType, context = {}) {
        return {
            finalFactor: 1.5,
            breakdown: {
                personality: 1.0,
                consciousness: 1.2,
                memory: 1.1,
                context: 1.0,
                physical: 1.0
            }
        };
    }
}

class MockConsciousnessUpdateService {
    constructor() {
        this.callCount = 0;
        this.lastProcessedEvent = null;
    }

    processEvent(character, event, context = {}) {
        this.callCount++;
        this.lastProcessedEvent = event;
        return {
            success: true,
            updated: true,
            changes: { frequency: 0.1, coherence: 0.05 },
            significance: 0.5
        };
    }
}

class MockEventSignificanceService {
    constructor() {
        this.callCount = 0;
        this.significanceValues = new Map();
    }

    calculateEventSignificance(event, context = {}) {
        this.callCount++;
        const key = `${event.type}_${event.outcome || 'neutral'}`;
        return this.significanceValues.get(key) || 0.5;
    }

    isEventSignificant(event, context = {}) {
        return this.calculateEventSignificance(event, context) >= 0.3;
    }

    setSignificance(eventType, outcome, significance) {
        const key = `${eventType}_${outcome}`;
        this.significanceValues.set(key, significance);
    }
}

class MockSignificantMemoryService {
    constructor() {
        this.callCount = 0;
        this.memories = [];
    }

    async addMemoryIfSignificant(character, event, context = {}) {
        this.callCount++;
        const added = Math.random() > 0.5;
        if (added) {
            this.memories.push({ characterId: character.id, event, context });
        }
        return { added };
    }
}

class MockConsciousnessCheckpointService {
    constructor() {
        this.callCount = 0;
        this.checkpoints = [];
    }

    async saveCheckpoint(name, data) {
        this.callCount++;
        this.checkpoints.push({ name, data, timestamp: Date.now() });
        return { success: true };
    }
}

// Test data generators
class TestDataGenerator {
    static createTestCharacter(id = 1) {
        return {
            id: `char_${id}`,
            name: `Test Character ${id}`,
            age: 25,
            level: 1,
            lodTier: 'hero',
            assignments: {
                nodes: new Set([`node_${id}`]),
                interactions: new Set(),
                quests: new Set(),
                settlements: new Set(),
                factions: new Set(),
                investments: new Set()
            },
            personality: {
                traits: new Map([
                    ['extrovert', 0.7],
                    ['aggression', 0.3],
                    ['curiosity', 0.8]
                ]),
                getAllTraits() {
                    return [
                        { id: 'extrovert', intensity: 0.7 },
                        { id: 'aggression', intensity: 0.3 },
                        { id: 'curiosity', intensity: 0.8 }
                    ];
                }
            },
            consciousness: {
                frequency: 7.0,
                coherence: 0.5
            },
            energy: 80,
            maxEnergy: 100,
            health: 90,
            mood: 70,
            wealth: 500,
            currentNodeId: `node_${id}`,
            relationships: new Map(),
            goals: [],
            meetsPrerequisites: () => true
        };
    }

    static createTestWorldState() {
        return {
            nodes: [
                {
                    id: 'node_1',
                    name: 'Test Node',
                    environment: {
                        isDangerous: () => false,
                        season: 'spring'
                    }
                }
            ],
            interactions: [
                { id: 'social_1', type: 'social', name: 'Social Interaction' },
                { id: 'combat_1', type: 'combat', name: 'Combat Training' },
                { id: 'rest_1', type: 'rest', name: 'Rest' }
            ],
            settlements: [],
            relationships: []
        };
    }

    static createTestTurnContext() {
        return {
            timeOfDay: 'morning',
            season: 'spring',
            weather: 'sunny',
            groupSize: 5,
            hasAuthority: false,
            urgency: 'medium'
        };
    }
}

describe('EfficientTurnProcessor', () => {
    let processor;
    let mockBehavioralStateService;
    let mockConsciousnessUpdateService;
    let mockEventSignificanceService;
    let mockSignificantMemoryService;
    let mockConsciousnessCheckpointService;

    beforeEach(() => {
        mockBehavioralStateService = new MockBehavioralStateService();
        mockConsciousnessUpdateService = new MockConsciousnessUpdateService();
        mockEventSignificanceService = new MockEventSignificanceService();
        mockSignificantMemoryService = new MockSignificantMemoryService();
        mockConsciousnessCheckpointService = new MockConsciousnessCheckpointService();

        processor = new EfficientTurnProcessor(
            mockBehavioralStateService,
            mockConsciousnessUpdateService,
            mockEventSignificanceService,
            mockSignificantMemoryService,
            mockConsciousnessCheckpointService
        );
    });

    describe('constructor', () => {
        test('should initialize with provided services', () => {
            expect(processor.behavioralStateService).toBe(mockBehavioralStateService);
            expect(processor.consciousnessUpdateService).toBe(mockConsciousnessUpdateService);
            expect(processor.eventSignificanceService).toBe(mockEventSignificanceService);
            expect(processor.significantMemoryService).toBe(mockSignificantMemoryService);
            expect(processor.consciousnessCheckpointService).toBe(mockConsciousnessCheckpointService);
        });

        test('should initialize with default services if not provided', () => {
            const defaultProcessor = new EfficientTurnProcessor();
            expect(defaultProcessor.behavioralStateService).toBeInstanceOf(BehavioralStateService);
            expect(defaultProcessor.consciousnessUpdateService).toBeInstanceOf(ConsciousnessUpdateService);
            expect(defaultProcessor.eventSignificanceService).toBeInstanceOf(EventSignificanceService);
            expect(defaultProcessor.significantMemoryService).toBeInstanceOf(SignificantMemoryService);
            expect(defaultProcessor.consciousnessCheckpointService).toBeInstanceOf(ConsciousnessCheckpointService);
        });

        test('should have correct default configuration', () => {
            expect(processor.significanceThreshold).toBe(0.3);
            expect(processor.maxProcessingTimePerTurn).toBe(5000);
            expect(processor.enableAutoCheckpoint).toBe(true);
            expect(processor.checkpointInterval).toBe(10);
        });
    });

    describe('processTurn', () => {
        test('should process turn for multiple characters', async () => {
            const characters = [
                TestDataGenerator.createTestCharacter(1),
                TestDataGenerator.createTestCharacter(2),
                TestDataGenerator.createTestCharacter(3)
            ];
            const worldState = TestDataGenerator.createTestWorldState();
            const turnContext = TestDataGenerator.createTestTurnContext();

            const result = await processor.processTurn(characters, worldState, turnContext);

            expect(result.processedCharacters).toBe(3);
            expect(result.performanceMetrics).toBeDefined();
            expect(result.performanceMetrics.totalProcessingTime).toBeGreaterThan(0);
            expect(result.significantEvents).toBeDefined();
        });

        test('should handle empty character array', async () => {
            const characters = [];
            const worldState = TestDataGenerator.createTestWorldState();
            const turnContext = TestDataGenerator.createTestTurnContext();

            const result = await processor.processTurn(characters, worldState, turnContext);

            expect(result.processedCharacters).toBe(0);
            expect(result.consciousnessUpdates).toBe(0);
            expect(result.memoryUpdates).toBe(0);
        });

        test('should handle invalid inputs gracefully', async () => {
            await expect(processor.processTurn(null, {}, {})).rejects.toThrow();
            await expect(processor.processTurn([], null, {})).rejects.toThrow();
        });
    });

    describe('checkForSignificantChanges', () => {
        const character = TestDataGenerator.createTestCharacter();
        const worldState = TestDataGenerator.createTestWorldState();

        test('should detect goal completion changes', () => {
            const characterWithGoal = {
                ...character,
                goals: [{ id: 'test_goal', status: 'completed' }]
            };

            const result = processor.checkForSignificantChanges(characterWithGoal, worldState, {});

            expect(result.hasChanges).toBe(true);
            expect(result.events.length).toBeGreaterThan(0);
            expect(result.events[0].type).toBe('goal_completion');
        });

        test('should detect health crisis changes', () => {
            const injuredCharacter = {
                ...character,
                health: 20 // Critical health
            };

            const result = processor.checkForSignificantChanges(injuredCharacter, worldState, {});

            expect(result.hasChanges).toBe(true);
            expect(result.events.some(e => e.type === 'health_crisis')).toBe(true);
        });

        test('should detect energy crisis changes', () => {
            const exhaustedCharacter = {
                ...character,
                energy: 10 // Critical energy
            };

            const result = processor.checkForSignificantChanges(exhaustedCharacter, worldState, {});

            expect(result.hasChanges).toBe(true);
            expect(result.events.some(e => e.type === 'energy_crisis')).toBe(true);
        });

        test('should detect environmental changes', () => {
            const dangerousWorldState = {
                ...worldState,
                nodes: [{
                    ...worldState.nodes[0],
                    environment: {
                        isDangerous: () => true,
                        season: 'winter'
                    }
                }]
            };

            const result = processor.checkForSignificantChanges(character, dangerousWorldState, {});

            expect(result.hasChanges).toBe(true);
            expect(result.events.some(e => e.type === 'environmental_change')).toBe(true);
        });

        test('should return no changes when nothing significant occurs', () => {
            const result = processor.checkForSignificantChanges(character, worldState, {});

            expect(result.hasChanges).toBe(false);
            expect(result.events).toHaveLength(0);
        });
    });

    describe('generateBehaviorFromCachedState', () => {
        const character = TestDataGenerator.createTestCharacter();
        const worldState = TestDataGenerator.createTestWorldState();
        const turnContext = TestDataGenerator.createTestTurnContext();

        test('should generate behavior using behavioral state service', () => {
            const result = processor.generateBehaviorFromCachedState(character, worldState, turnContext);

            expect(result).toBeDefined();
            expect(result.action).toBeDefined();
            expect(result.confidence).toBeDefined();
            expect(result.decisionFactor).toBeDefined();
            expect(mockBehavioralStateService.callCount).toBeGreaterThan(0);
        });

        test('should handle characters with no available interactions', () => {
            const emptyWorldState = {
                ...worldState,
                interactions: []
            };

            const result = processor.generateBehaviorFromCachedState(character, emptyWorldState, turnContext);

            expect(result.action).toBe('idle');
            expect(result.reason).toBe('no_available_interactions');
        });

        test('should return idle behavior for invalid inputs', () => {
            const result = processor.generateBehaviorFromCachedState(null, worldState, turnContext);

            expect(result.action).toBe('idle');
            expect(result.reason).toBe('behavior_generation_error');
        });
    });

    describe('significance evaluation', () => {
        test('should evaluate significant behavior results', () => {
            const character = TestDataGenerator.createTestCharacter();
            const worldState = TestDataGenerator.createTestWorldState();

            // Mock significant behavior result
            mockEventSignificanceService.setSignificance('social', 'success', 0.8);

            const behaviorResult = {
                action: 'execute_interaction',
                interaction: { id: 'social_1', type: 'social', name: 'Social Interaction' },
                confidence: 0.9,
                decisionFactor: 2.1
            };

            const result = processor._evaluateBehaviorSignificance(character, behaviorResult, worldState);

            expect(result.isSignificant).toBe(true);
            expect(result.event).toBeDefined();
            expect(result.event.type).toBe('social');
            expect(result.event.significance).toBe(0.8);
        });

        test('should not trigger for insignificant behavior', () => {
            const character = TestDataGenerator.createTestCharacter();
            const worldState = TestDataGenerator.createTestWorldState();

            // Mock insignificant behavior result
            mockEventSignificanceService.setSignificance('idle_action', 'neutral', 0.1);

            const behaviorResult = {
                action: 'idle',
                confidence: 0.3
            };

            const result = processor._evaluateBehaviorSignificance(character, behaviorResult, worldState);

            expect(result.isSignificant).toBe(false);
            expect(result.event).toBeNull();
        });
    });

    describe('performance metrics', () => {
        test('should track performance metrics correctly', async () => {
            const characters = [TestDataGenerator.createTestCharacter()];
            const worldState = TestDataGenerator.createTestWorldState();
            const turnContext = TestDataGenerator.createTestTurnContext();

            const result = await processor.processTurn(characters, worldState, turnContext);

            expect(result.performanceMetrics).toBeDefined();
            expect(result.performanceMetrics.totalProcessingTime).toBeGreaterThan(0);
            expect(result.performanceMetrics.averageTimePerCharacter).toBeGreaterThan(0);
            expect(result.performanceMetrics.processingRate).toBeGreaterThan(0);
        });

        test('should provide comprehensive performance metrics', () => {
            const metrics = processor.getPerformanceMetrics();

            expect(metrics).toBeDefined();
            expect(metrics.totalProcessingTime).toBeDefined();
            expect(metrics.charactersProcessed).toBeDefined();
            expect(metrics.consciousnessUpdates).toBeDefined();
            expect(metrics.memoryUpdates).toBeDefined();
            expect(metrics.cachedStatesUsed).toBeDefined();
            expect(metrics.turnCount).toBeDefined();
            expect(metrics.averageProcessingTime).toBeDefined();
            expect(metrics.consciousnessUpdateRate).toBeDefined();
            expect(metrics.cacheHitRate).toBeDefined();
        });

        test('should reset performance metrics', () => {
            // Add some fake metrics
            processor.performanceMetrics.totalProcessingTime = 1000;
            processor.performanceMetrics.charactersProcessed = 10;

            processor.resetPerformanceMetrics();

            expect(processor.performanceMetrics.totalProcessingTime).toBe(0);
            expect(processor.performanceMetrics.charactersProcessed).toBe(0);
        });
    });

    describe('configuration', () => {
        test('should allow configuration changes', () => {
            processor.configure({
                significanceThreshold: 0.5,
                maxProcessingTimePerTurn: 10000,
                enableAutoCheckpoint: false,
                checkpointInterval: 5
            });

            expect(processor.significanceThreshold).toBe(0.5);
            expect(processor.maxProcessingTimePerTurn).toBe(10000);
            expect(processor.enableAutoCheckpoint).toBe(false);
            expect(processor.checkpointInterval).toBe(5);
        });

        test('should handle partial configuration', () => {
            processor.configure({ significanceThreshold: 0.7 });

            expect(processor.significanceThreshold).toBe(0.7);
            expect(processor.maxProcessingTimePerTurn).toBe(5000); // Unchanged
        });
    });

    describe('error handling', () => {
        test('should handle service failures gracefully', async () => {
            // Spy on the processor's checkForSignificantChanges method and make it throw
            const originalCheckForSignificantChanges = processor.checkForSignificantChanges;
            processor.checkForSignificantChanges = jest.fn(() => {
                throw new Error('Service failure');
            });

            const characters = [{
                ...TestDataGenerator.createTestCharacter(),
                npcTier: 'leader' // Ensure leader processing path is used
            }];
            const worldState = TestDataGenerator.createTestWorldState();
            const turnContext = TestDataGenerator.createTestTurnContext();

            const result = await processor.processTurn(characters, worldState, turnContext);

            // Restore the original method
            processor.checkForSignificantChanges = originalCheckForSignificantChanges;

            expect(result.processedCharacters).toBe(1);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].error).toContain('Service failure');
        });

        test('should handle invalid character data', async () => {
            // Spy on the processor's generateBehaviorFromCachedState method and make it throw
            const originalGenerateBehavior = processor.generateBehaviorFromCachedState;
            processor.generateBehaviorFromCachedState = jest.fn(() => {
                throw new Error('Invalid character data');
            });

            const characters = [{
                ...TestDataGenerator.createTestCharacter(),
                npcTier: 'leader' // Ensure leader processing path is used
            }];
            const worldState = TestDataGenerator.createTestWorldState();
            const turnContext = TestDataGenerator.createTestTurnContext();

            const result = await processor.processTurn(characters, worldState, turnContext);

            // Restore the original method
            processor.generateBehaviorFromCachedState = originalGenerateBehavior;

            expect(result.processedCharacters).toBe(1);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].error).toContain('Invalid character data');
        });
    });

    describe('integration with consciousness system', () => {
        test('should trigger consciousness updates for significant events', async () => {
            const character = TestDataGenerator.createTestCharacter();
            const worldState = TestDataGenerator.createTestWorldState();
            const turnContext = TestDataGenerator.createTestTurnContext();

            // Set up significant event
            mockEventSignificanceService.setSignificance('goal_completion', 'success', 0.8);

            const significantCharacter = {
                ...character,
                npcTier: 'leader', // Explicitly set as leader to ensure full processing
                goals: [{ id: 'test_goal', status: 'completed' }]
            };

            const result = await processor.processTurn([significantCharacter], worldState, turnContext);

            expect(mockConsciousnessUpdateService.callCount).toBeGreaterThan(0);
            expect(result.consciousnessUpdates).toBeGreaterThan(0);
        });

        test('should update memory for significant events', async () => {
            const character = TestDataGenerator.createTestCharacter();
            const worldState = TestDataGenerator.createTestWorldState();
            const turnContext = TestDataGenerator.createTestTurnContext();

            // Set up significant event that triggers memory update
            mockEventSignificanceService.setSignificance('health_crisis', 'negative', 0.9);

            // Create a character with a significant event (health crisis)
            const significantCharacter = {
                ...character,
                npcTier: 'leader', // Explicitly set as leader to ensure full processing
                health: 15 // Critical health that triggers health_crisis event
            };

            await processor.processTurn([significantCharacter], worldState, turnContext);

            expect(mockSignificantMemoryService.callCount).toBeGreaterThan(0);
        });
    });
});