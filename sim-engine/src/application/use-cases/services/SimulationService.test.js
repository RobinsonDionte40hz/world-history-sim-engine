// src/application/use-cases/services/SimulationService.test.js

import SimulationService from './SimulationService.js';

// Mock the dependencies
jest.mock('../simulation/GenerateWorld.js', () => jest.fn());
jest.mock('../simulation/RunTick.js', () => jest.fn());
jest.mock('../history/AnalyzeHistory.js', () => jest.fn());
jest.mock('../../../domain/value-objects/Positions.js', () => jest.fn());
jest.mock('../../../domain/entities/Character.js', () => {
  return jest.fn().mockImplementation((config) => {
    const character = {
      id: config.id,
      name: config.name,
      currentNodeId: config.currentNodeId,
      attributes: config.attributes,
      personality: config.personality,
      consciousness: config.consciousness,
      assignedInteractions: config.assignedInteractions,
      skills: config.skills,
      goals: config.goals,
      energy: config.energy,
      health: config.health,
      mood: config.mood
    };
    // Allow setting currentNodeId after creation
    Object.defineProperty(character, 'currentNodeId', {
      writable: true,
      value: config.currentNodeId
    });
    return character;
  });
});

describe('SimulationService', () => {
  let service;

  beforeEach(() => {
    // Use the singleton instance but reset its state
    service = SimulationService;
    service.worldState = null;
    service.isRunning = false;
    service.tickInterval = null;
    service.onTick = null;
  });

  // Helper function to create valid mappless world config
  const createValidMapplessConfig = () => ({
    worldName: 'Test World',
    worldDescription: 'A test world for simulation',
    rules: { timeProgression: 'standard' },
    initialConditions: { season: 'spring' },
    nodes: [
      {
        id: 'node1',
        name: 'Village',
        type: 'settlement',
        description: 'A small village',
        environmentalProperties: { climate: 'temperate' },
        resourceAvailability: { food: 100 },
        culturalContext: { language: 'common' },
        assignedCharacters: ['char1']
      }
    ],
    characters: [
      {
        id: 'char1',
        name: 'Test Character',
        assignedInteractions: ['interact1'],
        attributes: {
          strength: { score: 12 },
          dexterity: { score: 14 },
          constitution: { score: 13 },
          intelligence: { score: 15 },
          wisdom: { score: 11 },
          charisma: { score: 16 }
        }
      }
    ],
    interactions: [
      {
        id: 'interact1',
        name: 'Trade Goods',
        type: 'economic',
        requirements: [],
        branches: [],
        effects: []
      }
    ]
  });

  describe('mappless world validation', () => {
    test('should validate valid mappless world config', () => {
      const config = createValidMapplessConfig();
      expect(service.validateMapplessWorldConfig(config)).toBe(true);
    });

    test('should reject config without worldName', () => {
      const config = createValidMapplessConfig();
      delete config.worldName;
      expect(service.validateMapplessWorldConfig(config)).toBe(false);
    });

    test('should reject config without nodes', () => {
      const config = createValidMapplessConfig();
      config.nodes = [];
      expect(service.validateMapplessWorldConfig(config)).toBe(false);
    });

    test('should reject config without characters', () => {
      const config = createValidMapplessConfig();
      config.characters = [];
      expect(service.validateMapplessWorldConfig(config)).toBe(false);
    });

    test('should reject config without interactions', () => {
      const config = createValidMapplessConfig();
      config.interactions = [];
      expect(service.validateMapplessWorldConfig(config)).toBe(false);
    });

    test('should reject nodes with spatial coordinates', () => {
      const config = createValidMapplessConfig();
      config.nodes[0].position = { x: 10, y: 20 };
      expect(service.validateMapplessWorldConfig(config)).toBe(false);
    });

    test('should reject characters without assigned interactions', () => {
      const config = createValidMapplessConfig();
      config.characters[0].assignedInteractions = [];
      expect(service.validateMapplessWorldConfig(config)).toBe(false);
    });

    test('should reject nodes without assigned characters', () => {
      const config = createValidMapplessConfig();
      config.nodes[0].assignedCharacters = [];
      expect(service.validateMapplessWorldConfig(config)).toBe(false);
    });
  });

  describe('mappless world processing', () => {
    test('should process valid mappless world config', () => {
      const config = createValidMapplessConfig();
      const worldState = service.processMapplessWorldState(config);

      expect(worldState.worldName).toBe('Test World');
      expect(worldState.nodes).toHaveLength(1);
      expect(worldState.npcs).toHaveLength(1);
      expect(worldState.interactions).toHaveLength(1);
      expect(worldState.time).toBe(0);
    });

    test('should assign characters to correct nodes', () => {
      const config = createValidMapplessConfig();
      const worldState = service.processMapplessWorldState(config);

      expect(worldState.npcs[0].currentNodeId).toBe('node1');
    });

    test('should initialize resources from nodes', () => {
      const config = createValidMapplessConfig();
      const worldState = service.processMapplessWorldState(config);

      expect(worldState.resources.food).toBe(100);
    });
  });

  describe('six-step validation', () => {
    test('should validate complete six-step world', () => {
      const config = createValidMapplessConfig();
      const worldState = service.processMapplessWorldState(config);
      
      const validation = service.validateSixStepCompletion(worldState);
      expect(validation.isComplete).toBe(true);
      expect(validation.missingSteps).toHaveLength(0);
    });

    test('should detect missing world properties', () => {
      const worldState = { time: 0, nodes: [], npcs: [], interactions: [] };
      const validation = service.validateSixStepCompletion(worldState);
      
      expect(validation.isComplete).toBe(false);
      expect(validation.missingSteps).toContain('Step 1: World properties incomplete');
    });

    test('should detect missing nodes', () => {
      const worldState = { 
        time: 0, 
        worldName: 'Test', 
        rules: {}, 
        nodes: [], 
        npcs: [], 
        interactions: [] 
      };
      const validation = service.validateSixStepCompletion(worldState);
      
      expect(validation.isComplete).toBe(false);
      expect(validation.missingSteps).toContain('Step 2: No nodes created');
    });
  });

  describe('canStart method', () => {
    test('should return false when no world state', () => {
      service.worldState = null;
      const result = service.canStart();
      
      expect(result.canStart).toBe(false);
      expect(result.reason).toBe('No world state initialized');
    });

    test('should return true when world is complete', () => {
      const config = createValidMapplessConfig();
      service.worldState = service.processMapplessWorldState(config);
      
      const result = service.canStart();
      expect(result.canStart).toBe(true);
      expect(result.reason).toBe('Ready to start');
    });
  });

  describe('initialize with mappless config', () => {
    test('should initialize with valid mappless config', () => {
      const config = createValidMapplessConfig();
      const worldState = service.initialize(config);

      expect(worldState).toBeDefined();
      expect(worldState.worldName).toBe('Test World');
      expect(service.worldState).toBe(worldState);
    });

    test('should throw error with invalid config', () => {
      const invalidConfig = { invalid: 'config' };
      
      expect(() => {
        service.initialize(invalidConfig);
      }).toThrow('Invalid mappless world configuration');
    });
  });

  describe('getCurrentTurn', () => {
    test('should return 0 when worldState is null', () => {
      service.worldState = null;
      expect(service.getCurrentTurn()).toBe(0);
    });

    test('should return 0 when worldState is undefined', () => {
      service.worldState = undefined;
      expect(service.getCurrentTurn()).toBe(0);
    });

    test('should return 0 when worldState.time is null', () => {
      service.worldState = { time: null };
      expect(service.getCurrentTurn()).toBe(0);
    });

    test('should return 0 when worldState.time is undefined', () => {
      service.worldState = { time: undefined };
      expect(service.getCurrentTurn()).toBe(0);
    });

    test('should return 0 when worldState.time is 0', () => {
      service.worldState = { time: 0 };
      expect(service.getCurrentTurn()).toBe(0);
    });

    test('should return correct turn number when worldState.time is positive', () => {
      service.worldState = { time: 42 };
      expect(service.getCurrentTurn()).toBe(42);
    });

    test('should return correct turn number when worldState.time is large number', () => {
      service.worldState = { time: 999999 };
      expect(service.getCurrentTurn()).toBe(999999);
    });

    test('should handle worldState with other properties correctly', () => {
      service.worldState = {
        time: 15,
        nodes: [],
        npcs: [],
        resources: {}
      };
      expect(service.getCurrentTurn()).toBe(15);
    });
  });

  describe('saveState', () => {
    test('should return false and log warning when worldState is null', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      service.worldState = null;

      const result = service.saveState();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('SimulationService: No world state to save');
      
      consoleSpy.mockRestore();
    });

    test('should return true when worldState is valid', () => {
      service.worldState = {
        time: 42,
        nodes: [],
        npcs: [],
        resources: {}
      };

      const result = service.saveState();

      expect(result).toBe(true);
    });

    test('should handle missing properties gracefully', () => {
      service.worldState = {
        time: 25
        // Missing nodes, npcs, resources
      };

      const result = service.saveState();

      expect(result).toBe(true);
    });
  });

  describe('isValidSavedState', () => {
    test('should return true for valid state', () => {
      const validState = {
        time: 42,
        nodes: [],
        npcs: [],
        resources: {}
      };

      expect(service.isValidSavedState(validState)).toBe(true);
    });

    test('should return false for null state', () => {
      expect(service.isValidSavedState(null)).toBe(false);
    });

    test('should return false for undefined state', () => {
      expect(service.isValidSavedState(undefined)).toBe(false);
    });

    test('should return false for non-object state', () => {
      expect(service.isValidSavedState('string')).toBe(false);
      expect(service.isValidSavedState(123)).toBe(false);
      expect(service.isValidSavedState([])).toBe(false);
    });

    test('should return false for invalid time values', () => {
      expect(service.isValidSavedState({ time: 'invalid', nodes: [], npcs: [], resources: {} })).toBe(false);
      expect(service.isValidSavedState({ time: -1, nodes: [], npcs: [], resources: {} })).toBe(false);
      expect(service.isValidSavedState({ time: null, nodes: [], npcs: [], resources: {} })).toBe(false);
      expect(service.isValidSavedState({ nodes: [], npcs: [], resources: {} })).toBe(false);
    });

    test('should return true for time value of 0', () => {
      const validState = {
        time: 0,
        nodes: [],
        npcs: [],
        resources: {}
      };

      expect(service.isValidSavedState(validState)).toBe(true);
    });

    test('should return false for invalid nodes', () => {
      expect(service.isValidSavedState({ time: 0, nodes: 'invalid', npcs: [], resources: {} })).toBe(false);
      expect(service.isValidSavedState({ time: 0, npcs: [], resources: {} })).toBe(false);
    });

    test('should return false for invalid npcs', () => {
      expect(service.isValidSavedState({ time: 0, nodes: [], npcs: 'invalid', resources: {} })).toBe(false);
      expect(service.isValidSavedState({ time: 0, nodes: [], resources: {} })).toBe(false);
    });

    test('should return false for invalid resources', () => {
      expect(service.isValidSavedState({ time: 0, nodes: [], npcs: [], resources: 'invalid' })).toBe(false);
      expect(service.isValidSavedState({ time: 0, nodes: [], npcs: [], resources: null })).toBe(false);
      expect(service.isValidSavedState({ time: 0, nodes: [], npcs: [] })).toBe(false);
    });
  });

  describe('loadState integration', () => {
    test('should handle the load state process without throwing errors', () => {
      // This test verifies that loadState can be called without throwing errors
      // The actual localStorage behavior is tested in the manual test
      expect(() => {
        const result = service.loadState();
        // Result can be null or an object, both are valid
        expect(result === null || typeof result === 'object').toBe(true);
      }).not.toThrow();
    });
  });

  describe('enhanced error handling for getCurrentTurn', () => {
    test('should handle invalid worldState.time types gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Test string time
      service.worldState = { time: 'invalid' };
      expect(service.getCurrentTurn()).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        'SimulationService.getCurrentTurn: worldState.time is not a number:',
        'string',
        'invalid'
      );

      // Test object time
      service.worldState = { time: {} };
      expect(service.getCurrentTurn()).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        'SimulationService.getCurrentTurn: worldState.time is not a number:',
        'object',
        {}
      );

      consoleSpy.mockRestore();
    });

    test('should handle non-finite time values', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Test NaN
      service.worldState = { time: NaN };
      expect(service.getCurrentTurn()).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        'SimulationService.getCurrentTurn: worldState.time is not finite:',
        NaN
      );

      // Test Infinity
      service.worldState = { time: Infinity };
      expect(service.getCurrentTurn()).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        'SimulationService.getCurrentTurn: worldState.time is not finite:',
        Infinity
      );

      consoleSpy.mockRestore();
    });

    test('should handle negative time values', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      service.worldState = { time: -5 };
      expect(service.getCurrentTurn()).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        'SimulationService.getCurrentTurn: worldState.time is negative:',
        -5
      );

      consoleSpy.mockRestore();
    });

    test('should handle unexpected errors in getCurrentTurn', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Create a worldState that will cause an error when accessing time
      const problematicWorldState = {};
      Object.defineProperty(problematicWorldState, 'time', {
        get() {
          throw new Error('Property access error');
        }
      });
      
      service.worldState = problematicWorldState;
      expect(service.getCurrentTurn()).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        'SimulationService.getCurrentTurn: Unexpected error getting current turn:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('persistence integration', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
    });

    test('should maintain turn counter through save/load cycle', () => {
      // Set up initial state
      service.worldState = {
        time: 123,
        nodes: [],
        npcs: [],
        resources: {}
      };

      // Save state
      const saveResult = service.saveState();
      expect(saveResult).toBe(true);

      // Verify current turn is correct
      expect(service.getCurrentTurn()).toBe(123);

      // Clear state
      const originalTime = service.worldState.time;
      service.worldState = null;
      expect(service.getCurrentTurn()).toBe(0);

      // Load state
      const loadResult = service.loadState();
      
      // Verify state was restored
      expect(loadResult).not.toBeNull();
      expect(service.getCurrentTurn()).toBe(123);
    });

    test('should save time value to localStorage correctly', () => {
      // Test different time values
      const testTimes = [0, 1, 42, 999, 123456];
      
      testTimes.forEach(timeValue => {
        service.worldState = {
          time: timeValue,
          nodes: [],
          npcs: [],
          resources: {}
        };

        service.saveState();
        
        // Verify localStorage contains the correct time value
        const savedData = JSON.parse(localStorage.getItem('worldState'));
        expect(savedData.time).toBe(timeValue);
      });
    });

    test('should restore time value from localStorage correctly', () => {
      // Test different time values
      const testTimes = [0, 1, 42, 999, 123456];
      
      testTimes.forEach(timeValue => {
        // Manually set localStorage data
        const testData = {
          time: timeValue,
          nodes: [],
          npcs: [],
          resources: {}
        };
        localStorage.setItem('worldState', JSON.stringify(testData));

        // Load state
        const loadResult = service.loadState();
        
        // Verify time was restored correctly
        expect(loadResult).not.toBeNull();
        expect(service.getCurrentTurn()).toBe(timeValue);
        expect(service.worldState.time).toBe(timeValue);
      });
    });

    test('should handle corrupted localStorage data gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Test invalid JSON
      localStorage.setItem('worldState', 'invalid json {');
      let result = service.loadState();
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'SimulationService: Failed to load state from localStorage:', 
        expect.any(Error)
      );

      // Test invalid state structure
      localStorage.setItem('worldState', JSON.stringify({ invalid: 'structure' }));
      result = service.loadState();
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'SimulationService: Invalid saved state structure, resetting to default'
      );

      // Test corrupted time value
      localStorage.setItem('worldState', JSON.stringify({
        time: 'invalid',
        nodes: [],
        npcs: [],
        resources: {}
      }));
      result = service.loadState();
      expect(result).toBeNull();

      // Verify localStorage was cleared after corruption
      expect(localStorage.getItem('worldState')).toBeNull();

      consoleSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    test('should handle missing localStorage data gracefully', () => {
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

      // Ensure localStorage is empty
      localStorage.clear();
      
      const result = service.loadState();
      
      expect(result).toBeNull();
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'SimulationService: No saved state found in localStorage'
      );

      consoleInfoSpy.mockRestore();
    });

    test('should persist turn counter across simulated browser sessions', () => {
      // Simulate first session - save state
      service.worldState = {
        time: 456,
        nodes: [{ id: 1, name: 'Test Node', position: { x: 0, y: 0 } }],
        npcs: [],
        resources: { gold: 100 }
      };
      
      const saveResult = service.saveState();
      expect(saveResult).toBe(true);

      // Simulate browser close/restart - clear service state
      service.worldState = null;
      service.isRunning = false;
      service.tickInterval = null;
      service.onTick = null;

      // Simulate second session - load state
      const loadResult = service.loadState();
      
      expect(loadResult).not.toBeNull();
      expect(service.getCurrentTurn()).toBe(456);
      expect(service.worldState.time).toBe(456);
      expect(service.worldState.nodes).toHaveLength(1);
      expect(service.worldState.resources.gold).toBe(100);
    });

    test('should handle localStorage quota exceeded gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      service.worldState = {
        time: 789,
        nodes: [],
        npcs: [],
        resources: {}
      };

      const result = service.saveState();
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'SimulationService: Failed to save state:', 
        expect.any(Error)
      );

      // Restore original localStorage
      Storage.prototype.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });

    test('should validate time value bounds correctly', () => {
      // Test edge cases for time values
      const validTimes = [0, 1, Number.MAX_SAFE_INTEGER];
      const invalidTimes = [-1, -100, NaN, Infinity, -Infinity, 'string', null, undefined];

      // Test valid times
      validTimes.forEach(timeValue => {
        const state = {
          time: timeValue,
          nodes: [],
          npcs: [],
          resources: {}
        };
        expect(service.isValidSavedState(state)).toBe(true);
      });

      // Test invalid times
      invalidTimes.forEach(timeValue => {
        const state = {
          time: timeValue,
          nodes: [],
          npcs: [],
          resources: {}
        };
        expect(service.isValidSavedState(state)).toBe(false);
      });
    });
  });
});