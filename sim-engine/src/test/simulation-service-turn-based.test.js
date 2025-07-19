// Test for SimulationService turn-based functionality
// This test verifies the new processTurn() method and turn summary generation

import SimulationService from '../application/use-cases/services/SimulationService.js';

// Mock localStorage for testing
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

// Mock console methods to reduce test noise
const originalConsole = console;
beforeEach(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  localStorageMock.clear();
});

afterEach(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Test data
const mockWorldConfig = {
  worldName: 'Test World',
  worldDescription: 'A test world for turn-based simulation',
  rules: {
    maxTurns: 100,
    turnBasedMode: true
  },
  initialConditions: {
    startingResources: 1000
  },
  nodes: [
    {
      id: 'node1',
      name: 'Test Village',
      type: 'settlement',
      description: 'A small test village',
      environmentalProperties: { climate: 'temperate' },
      resourceAvailability: { food: 100 },
      assignedCharacters: ['char1']
    }
  ],
  characters: [
    {
      id: 'char1',
      name: 'Test Character',
      attributes: {
        strength: { score: 12 },
        dexterity: { score: 14 }
      },
      assignedInteractions: ['gathering']
    }
  ],
  interactions: [
    {
      type: 'gathering',
      name: 'Gather Resources',
      description: 'Gather food and materials'
    }
  ]
};

describe('SimulationService Turn-Based Operation', () => {
  let service;

  beforeEach(() => {
    // Reset the service to ensure clean state
    service = SimulationService;
    service.reset();
  });

  afterEach(() => {
    service.stop();
    service.reset();
  });

  test('should initialize simulation in turn-based mode', () => {
    const worldState = service.initialize(mockWorldConfig);
    
    expect(worldState).toBeDefined();
    expect(worldState.time).toBe(0);
    expect(worldState.worldName).toBe('Test World');
    expect(service.isTurnBasedMode).toBe(true);
    expect(service.turnHistory).toEqual([]);
  });

  test('should start simulation in turn-based mode without automatic progression', () => {
    service.initialize(mockWorldConfig);
    const result = service.start();
    
    expect(service.isRunning).toBe(true);
    expect(service.tickInterval).toBeNull(); // No automatic tick interval
    expect(result).toBeDefined();
    expect(service.turnHistory.length).toBe(1); // Initial state recorded
  });

  test('should process single turn manually with processTurn()', async () => {
    service.initialize(mockWorldConfig);
    service.start();
    
    const initialTurn = service.getCurrentTurn();
    const result = service.processTurn();
    
    expect(result.success).toBe(true);
    expect(result.worldState).toBeDefined();
    expect(result.turnSummary).toBeDefined();
    expect(service.getCurrentTurn()).toBe(initialTurn + 1);
    
    // Check turn summary structure
    const summary = result.turnSummary;
    expect(summary.turn).toBe(initialTurn + 1);
    expect(summary.timestamp).toBeDefined();
    expect(summary.processingTime).toBeGreaterThan(0);
    expect(summary.summary).toBeDefined();
    expect(summary.events).toBeDefined();
    expect(summary.characterActions).toBeDefined();
    expect(summary.changes).toBeDefined();
  });

  test('should maintain turn history with size limit', () => {
    service.initialize(mockWorldConfig);
    service.start();
    
    // Process several turns
    for (let i = 0; i < 5; i++) {
      service.processTurn();
    }
    
    const history = service.getTurnHistory();
    expect(history.length).toBe(6); // 5 processed + 1 initial
    
    // Check that history is properly ordered
    for (let i = 1; i < history.length; i++) {
      expect(history[i].turn).toBeGreaterThan(history[i-1].turn);
    }
  });

  test('should generate meaningful turn summaries', () => {
    service.initialize(mockWorldConfig);
    service.start();
    
    const result = service.processTurn();
    const summary = result.turnSummary;
    
    expect(summary.summary).toMatch(/No significant changes|character.*took action|resource.*changed/i);
    expect(summary.changes.charactersChanged).toBeGreaterThanOrEqual(0);
    expect(summary.changes.resourcesChanged).toBeGreaterThanOrEqual(0);
  });

  test('should handle errors during turn processing gracefully', () => {
    // Initialize with invalid state
    service.worldState = null;
    
    expect(() => {
      service.processTurn();
    }).toThrow('Simulation not initialized');
  });

  test('should not allow processTurn() when simulation is not running', () => {
    service.initialize(mockWorldConfig);
    // Don't start the simulation
    
    expect(() => {
      service.processTurn();
    }).toThrow('Simulation not started');
  });

  test('should provide access to latest turn summary', () => {
    service.initialize(mockWorldConfig);
    service.start();
    
    const result = service.processTurn();
    const latestSummary = service.getLatestTurnSummary();
    
    expect(latestSummary).toEqual(result.turnSummary);
    expect(latestSummary.turn).toBe(service.getCurrentTurn());
  });

  test('should save and restore turn-based state', () => {
    service.initialize(mockWorldConfig);
    service.start();
    service.processTurn();
    
    const beforeTurn = service.getCurrentTurn();
    const beforeHistory = service.getTurnHistory();
    const beforeSummary = service.getLatestTurnSummary();
    
    service.saveState();
    service.reset();
    
    const restoredState = service.loadState();
    
    expect(restoredState).toBeDefined();
    expect(service.getCurrentTurn()).toBe(beforeTurn);
    expect(service.turnHistory).toEqual(beforeHistory);
    expect(service.currentTurnSummary).toEqual(beforeSummary);
  });

  test('should maintain backward compatibility with step() method', () => {
    service.initialize(mockWorldConfig);
    service.start();
    
    const initialTurn = service.getCurrentTurn();
    
    // step() should still work but show deprecation warning
    const result = service.step();
    
    expect(result.success).toBe(true);
    expect(service.getCurrentTurn()).toBe(initialTurn + 1);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('step() is deprecated')
    );
  });

  test('should properly reset turn-based state', () => {
    service.initialize(mockWorldConfig);
    service.start();
    service.processTurn();
    service.processTurn();
    
    expect(service.getCurrentTurn()).toBe(2);
    expect(service.turnHistory.length).toBeGreaterThan(0);
    
    service.reset();
    
    expect(service.getCurrentTurn()).toBe(0);
    expect(service.turnHistory).toEqual([]);
    expect(service.currentTurnSummary).toBeNull();
    expect(service.isRunning).toBe(false);
  });
});

console.log('Turn-based SimulationService tests defined successfully');
