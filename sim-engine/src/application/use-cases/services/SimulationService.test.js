// src/application/use-cases/services/SimulationService.test.js

import SimulationService from './SimulationService.js';

// Mock the dependencies
jest.mock('../simulation/GenerateWorld.js', () => jest.fn());
jest.mock('../simulation/RunTick.js', () => jest.fn());
jest.mock('../history/AnalyzeHistory.js', () => jest.fn());
jest.mock('../../../domain/value-objects/Positions.js', () => jest.fn());
jest.mock('../../../domain/entities/Character.js', () => jest.fn());

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
      expect(consoleSpy).toHaveBeenCalledWith('SimulationService: Cannot save state - worldState is null');
      
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
        'SimulationService: Failed to save state to localStorage:', 
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