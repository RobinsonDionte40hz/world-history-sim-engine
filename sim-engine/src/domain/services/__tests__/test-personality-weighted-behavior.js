import EfficientTurnProcessor from '../EfficientTurnProcessor.js';

// Mock services
const mockBranchWeightingService = {
    selectWeightedBranch: jest.fn((character, branches, context, selectionMethod) => {
        // Return the first branch with a mock weight
        return {
            branch: branches[0],
            weight: 0.8,
            reason: 'personality_driven',
            selectionMethod: 'weighted_random',
            weightBreakdown: { personality: 0.6, attributes: 0.2 }
        };
    })
};

const mockBehavioralStateService = {
    getBehavioralModifier: jest.fn(() => 0.5),
    calculateDecisionFactor: jest.fn(() => ({ breakdown: 'test' }))
};

const mockConsciousnessService = {
    updateConsciousness: jest.fn(() => ({ frequency: 40, coherence: 0.8 }))
};

const mockMemoryService = {
    updateMemory: jest.fn(() => ({}))
};

describe('Personality-Weighted Behavior Generation', () => {
    let processor;

    beforeEach(() => {
        processor = new EfficientTurnProcessor(
            mockBehavioralStateService, // behavioralStateService
            mockConsciousnessService,   // consciousnessUpdateService
            null,                       // eventSignificanceService
            mockMemoryService,          // significantMemoryService
            null,                       // consciousnessCheckpointService
            null,                       // politicalTrackingService
            null,                       // resourceFlowService
            mockBranchWeightingService, // branchWeightingService
            null                        // logger
        );

        // Reset mocks
        jest.clearAllMocks();
    });

    test('should use BranchWeightingService for leader behavior generation', () => {
        const character = {
            id: 'leader-1',
            name: 'Test Leader',
            tier: 'leader',
            personality: { empathy: 0.7, aggression: 0.3 },
            attributes: { intelligence: 15, charisma: 14 },
            profession: null,
            energy: 50,
            maxEnergy: 100,
            health: 80,
            wealth: 100
        };

        const worldState = {
            nodes: [{ id: 'node-1', name: 'Test Node' }],
            interactions: []
        };

        const turnContext = { timeOfDay: 'morning' };

        const result = processor.generateBehaviorFromCachedState(character, worldState, turnContext);

        expect(mockBranchWeightingService.selectWeightedBranch).toHaveBeenCalled();
        expect(result.action).toBe('execute_interaction');
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.reasoning.selectionMethod).toBe('weighted_random');
    });

    test('should use BranchWeightingService for specialist behavior generation', () => {
        const character = {
            id: 'specialist-1',
            name: 'Test Specialist',
            tier: 'specialist',
            personality: { curiosity: 0.8, patience: 0.6 },
            attributes: { intelligence: 16, wisdom: 15 },
            profession: 'merchant',
            energy: 60,
            maxEnergy: 100,
            health: 85,
            wealth: 50
        };

        const worldState = {
            nodes: [{ id: 'node-1', name: 'Test Node' }],
            interactions: [
                {
                    id: 'research',
                    name: 'Research',
                    type: 'research',
                    description: 'Conduct scholarly research',
                    requirements: { energy: 12 },
                    effects: { knowledge: 5, energy: -8, experience: 3 }
                },
                {
                    id: 'teach',
                    name: 'Teach',
                    type: 'teaching',
                    description: 'Teach students',
                    requirements: { energy: 10 },
                    effects: { reputation: 3, energy: -6, experience: 2 }
                }
            ]
        };

        const turnContext = { timeOfDay: 'afternoon' };

        const result = processor._generateSpecialistBehavior(character, worldState, turnContext);

        expect(mockBranchWeightingService.selectWeightedBranch).toHaveBeenCalled();
        expect(result.action).toBe('execute_interaction');
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.profession).toBe('merchant');
    });

    test('should use BranchWeightingService for citizen behavior generation', () => {
        const character = {
            id: 'citizen-1',
            name: 'Test Citizen',
            tier: 'citizen',
            personality: { social: 0.7, responsibility: 0.8 },
            attributes: { constitution: 14, charisma: 12 },
            profession: null,
            energy: 40,
            maxEnergy: 100,
            health: 75,
            wealth: 20
        };

        const worldState = {
            nodes: [{ id: 'node-1', name: 'Test Node' }],
            interactions: []
        };

        const turnContext = { timeOfDay: 'evening' };

        const result = processor._generateCitizenBehavior(character, worldState, turnContext);

        expect(mockBranchWeightingService.selectWeightedBranch).toHaveBeenCalled();
        expect(result.action).toBe('execute_interaction');
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.reasoning.basicNeeds).toBeDefined();
    });

    test('should include personality metadata in branch selection', () => {
        const character = {
            id: 'test-char',
            name: 'Test Character',
            tier: 'leader',
            personality: { empathy: 0.9, aggression: 0.1 },
            attributes: { intelligence: 18, wisdom: 16 },
            consciousness: { frequency: 40, coherence: 0.85 },
            energy: 70,
            maxEnergy: 100,
            health: 90,
            wealth: 200
        };

        const worldState = {
            nodes: [{ id: 'node-1', name: 'Test Node' }],
            interactions: []
        };

        processor.generateBehaviorFromCachedState(character, worldState, {});

        const callArgs = mockBranchWeightingService.selectWeightedBranch.mock.calls[0];
        const branches = callArgs[1]; // Second argument is branches array

        expect(branches.length).toBeGreaterThan(0);
        expect(branches[0].metadata).toBeDefined();
        expect(branches[0].metadata.personalityAffinities).toBeDefined();
        expect(branches[0].metadata.attributePreference).toBeDefined();
        expect(branches[0].metadata.expectedOutcomes).toBeDefined();
    });
});