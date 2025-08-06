/**
 * WorldPersistenceService Complete Data Structure Tests
 * 
 * Tests to ensure that world data structure is always complete
 * when saving and loading, with all required fields present.
 */

import WorldPersistenceService from '../application/services/WorldPersistenceService';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true
});

describe('WorldPersistenceService - Complete Data Structure', () => {
    let service;

    beforeEach(() => {
        service = new WorldPersistenceService();
        localStorageMock.clear();
        jest.clearAllMocks();
    });

    describe('ensureCompleteWorldStructure', () => {
        test('should add missing required fields', () => {
            const incompleteWorld = {
                name: 'Test World',
                description: 'A test world'
            };

            const completeWorld = service.ensureCompleteWorldStructure(incompleteWorld);

            // Should have all required arrays
            expect(completeWorld.nodes).toEqual([]);
            expect(completeWorld.characters).toEqual([]);
            expect(completeWorld.interactions).toEqual([]);
            expect(completeWorld.encounters).toEqual([]);

            // Should have all required objects
            expect(completeWorld.rules).toEqual({});
            expect(completeWorld.initialConditions).toEqual({});
            expect(completeWorld.nodePopulations).toEqual({});

            // Should have metadata
            expect(completeWorld.id).toBeDefined();
            expect(completeWorld.version).toBeDefined();
            expect(completeWorld.lastModified).toBeDefined();
            expect(completeWorld.currentStep).toBe('world');
            expect(completeWorld.isComplete).toBe(false);
            expect(completeWorld.isValid).toBe(false);
        });

        test('should preserve existing data', () => {
            const existingWorld = {
                id: 'existing-123',
                name: 'Existing World',
                description: 'An existing world',
                nodes: [{ id: 'node1', name: 'Node 1' }],
                characters: [{ id: 'char1', name: 'Character 1' }],
                interactions: [{ id: 'int1', name: 'Interaction 1' }],
                encounters: [{ id: 'enc1', name: 'Encounter 1' }],
                rules: { timeProgression: 'manual' },
                initialConditions: { population: 1000 },
                nodePopulations: { 'node1': ['char1'] },
                currentStep: 'characters',
                isComplete: true,
                isValid: true,
                customField: 'custom value'
            };

            const completeWorld = service.ensureCompleteWorldStructure(existingWorld);

            // Should preserve all existing data
            expect(completeWorld.id).toBe('existing-123');
            expect(completeWorld.nodes).toEqual(existingWorld.nodes);
            expect(completeWorld.characters).toEqual(existingWorld.characters);
            expect(completeWorld.interactions).toEqual(existingWorld.interactions);
            expect(completeWorld.encounters).toEqual(existingWorld.encounters);
            expect(completeWorld.rules).toEqual(existingWorld.rules);
            expect(completeWorld.initialConditions).toEqual(existingWorld.initialConditions);
            expect(completeWorld.nodePopulations).toEqual(existingWorld.nodePopulations);
            expect(completeWorld.currentStep).toBe('characters');
            expect(completeWorld.isComplete).toBe(true);
            expect(completeWorld.isValid).toBe(true);
            expect(completeWorld.customField).toBe('custom value');
        });

        test('should handle invalid array fields', () => {
            const invalidWorld = {
                name: 'Test World',
                description: 'A test world',
                nodes: 'not an array',
                characters: null,
                interactions: undefined,
                encounters: 123
            };

            const completeWorld = service.ensureCompleteWorldStructure(invalidWorld);

            // Should convert invalid arrays to empty arrays
            expect(completeWorld.nodes).toEqual([]);
            expect(completeWorld.characters).toEqual([]);
            expect(completeWorld.interactions).toEqual([]);
            expect(completeWorld.encounters).toEqual([]);
        });

        test('should handle invalid object fields', () => {
            const invalidWorld = {
                name: 'Test World',
                description: 'A test world',
                rules: 'not an object',
                initialConditions: null,
                nodePopulations: []
            };

            const completeWorld = service.ensureCompleteWorldStructure(invalidWorld);

            // Should convert invalid objects to empty objects
            expect(completeWorld.rules).toEqual({});
            expect(completeWorld.initialConditions).toEqual({});
            expect(completeWorld.nodePopulations).toEqual({});
        });
    });

    describe('saveWorld with complete structure', () => {
        test('should save world with complete data structure', async () => {
            const minimalWorld = {
                name: 'Minimal World',
                description: 'A minimal world'
            };

            const savedWorld = await service.saveWorld(minimalWorld);

            // Should have all required fields
            expect(savedWorld.id).toBeDefined();
            expect(savedWorld.name).toBe('Minimal World');
            expect(savedWorld.description).toBe('A minimal world');
            expect(savedWorld.version).toBeDefined();
            expect(savedWorld.lastModified).toBeDefined();

            // Should have all required arrays
            expect(savedWorld.nodes).toEqual([]);
            expect(savedWorld.characters).toEqual([]);
            expect(savedWorld.interactions).toEqual([]);
            expect(savedWorld.encounters).toEqual([]);

            // Should have all required objects
            expect(savedWorld.rules).toEqual({});
            expect(savedWorld.initialConditions).toEqual({});
            expect(savedWorld.nodePopulations).toEqual({});

            // Should have WorldBuilder fields
            expect(savedWorld.currentStep).toBe('world');
            expect(savedWorld.isComplete).toBe(false);
            expect(savedWorld.isValid).toBe(false);
        });

        test('should preserve existing complete data when saving', async () => {
            const completeWorld = {
                id: 'complete-123',
                name: 'Complete World',
                description: 'A complete world',
                nodes: [{ id: 'node1', name: 'Node 1' }],
                characters: [{ id: 'char1', name: 'Character 1' }],
                interactions: [{ id: 'int1', name: 'Interaction 1' }],
                encounters: [{ id: 'enc1', name: 'Encounter 1' }],
                rules: { timeProgression: 'manual' },
                initialConditions: { population: 1000 },
                nodePopulations: { 'node1': ['char1'] },
                currentStep: 'simulation',
                isComplete: true,
                isValid: true
            };

            const savedWorld = await service.saveWorld(completeWorld);

            // Should preserve all existing data
            expect(savedWorld.id).toBe('complete-123');
            expect(savedWorld.nodes).toEqual(completeWorld.nodes);
            expect(savedWorld.characters).toEqual(completeWorld.characters);
            expect(savedWorld.interactions).toEqual(completeWorld.interactions);
            expect(savedWorld.encounters).toEqual(completeWorld.encounters);
            expect(savedWorld.rules).toEqual(completeWorld.rules);
            expect(savedWorld.initialConditions).toEqual(completeWorld.initialConditions);
            expect(savedWorld.nodePopulations).toEqual(completeWorld.nodePopulations);
            expect(savedWorld.currentStep).toBe('simulation');
            expect(savedWorld.isComplete).toBe(true);
            expect(savedWorld.isValid).toBe(true);
        });
    });

    describe('loadWorld with complete structure', () => {
        test('should load world with complete data structure', async () => {
            const worldId = 'test-world-123';
            const storedWorld = {
                id: worldId,
                name: 'Stored World',
                description: 'A stored world'
                // Missing many fields
            };

            // Mock localStorage to return incomplete data
            localStorageMock.getItem.mockReturnValue(JSON.stringify(storedWorld));

            const loadedWorld = await service.loadWorld(worldId);

            // Should have all required fields
            expect(loadedWorld.id).toBe(worldId);
            expect(loadedWorld.name).toBe('Stored World');
            expect(loadedWorld.description).toBe('A stored world');
            expect(loadedWorld.version).toBeDefined();
            expect(loadedWorld.lastModified).toBeDefined();

            // Should have all required arrays
            expect(loadedWorld.nodes).toEqual([]);
            expect(loadedWorld.characters).toEqual([]);
            expect(loadedWorld.interactions).toEqual([]);
            expect(loadedWorld.encounters).toEqual([]);

            // Should have all required objects
            expect(loadedWorld.rules).toEqual({});
            expect(loadedWorld.initialConditions).toEqual({});
            expect(loadedWorld.nodePopulations).toEqual({});

            // Should have WorldBuilder fields
            expect(loadedWorld.currentStep).toBe('world');
            expect(loadedWorld.isComplete).toBe(false);
            expect(loadedWorld.isValid).toBe(false);
        });

        test('should preserve existing complete data when loading', async () => {
            const worldId = 'complete-world-456';
            const completeStoredWorld = {
                id: worldId,
                name: 'Complete Stored World',
                description: 'A complete stored world',
                nodes: [{ id: 'node1', name: 'Node 1' }],
                characters: [{ id: 'char1', name: 'Character 1' }],
                interactions: [{ id: 'int1', name: 'Interaction 1' }],
                encounters: [{ id: 'enc1', name: 'Encounter 1' }],
                rules: { timeProgression: 'automatic' },
                initialConditions: { population: 2000 },
                nodePopulations: { 'node1': ['char1'] },
                currentStep: 'population',
                isComplete: true,
                isValid: true,
                customField: 'preserved'
            };

            // Mock localStorage to return complete data
            localStorageMock.getItem.mockReturnValue(JSON.stringify(completeStoredWorld));

            const loadedWorld = await service.loadWorld(worldId);

            // Should preserve all existing data
            expect(loadedWorld).toEqual(expect.objectContaining(completeStoredWorld));
            expect(loadedWorld.customField).toBe('preserved');
        });
    });

    describe('Data structure consistency', () => {
        test('should maintain consistency between save and load', async () => {
            const originalWorld = {
                name: 'Consistency Test World',
                description: 'Testing save/load consistency',
                nodes: [{ id: 'node1', name: 'Test Node' }],
                rules: { timeProgression: 'manual' }
            };

            // Save the world
            const savedWorld = await service.saveWorld(originalWorld);

            // Mock localStorage for loading
            localStorageMock.getItem.mockReturnValue(JSON.stringify(savedWorld));

            // Load the world
            const loadedWorld = await service.loadWorld(savedWorld.id);

            // Should be identical
            expect(loadedWorld).toEqual(savedWorld);

            // Should have all required fields
            expect(loadedWorld.nodes).toBeDefined();
            expect(loadedWorld.characters).toBeDefined();
            expect(loadedWorld.interactions).toBeDefined();
            expect(loadedWorld.encounters).toBeDefined();
            expect(loadedWorld.rules).toBeDefined();
            expect(loadedWorld.initialConditions).toBeDefined();
            expect(loadedWorld.nodePopulations).toBeDefined();
        });
    });
});