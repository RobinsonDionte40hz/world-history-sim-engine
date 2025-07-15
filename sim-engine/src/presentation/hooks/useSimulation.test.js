// src/presentation/hooks/useSimulation.test.js

import { renderHook, act } from '@testing-library/react';
import useSimulation from './useSimulation.js';
import SimulationService from '../../application/use-cases/services/SimulationService.js';

// Mock the SimulationService
jest.mock('../../application/use-cases/services/SimulationService.js', () => ({
  worldState: null,
  isRunning: false,
  loadState: jest.fn(),
  initialize: jest.fn(),
  getCurrentTurn: jest.fn(),
  setOnTick: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  getHistoryAnalysis: jest.fn(),
}));

describe('useSimulation Hook - Turn Counter Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.error mock
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('currentTurn initialization', () => {
    it('should initialize currentTurn to 0 when getCurrentTurn returns 0', () => {
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.loadState.mockReturnValue({ time: 0 });

      const { result } = renderHook(() => useSimulation());

      expect(result.current.currentTurn).toBe(0);
      expect(SimulationService.getCurrentTurn).toHaveBeenCalled();
    });

    it('should initialize currentTurn to correct value when simulation has progressed', () => {
      SimulationService.getCurrentTurn.mockReturnValue(42);
      SimulationService.loadState.mockReturnValue({ time: 42 });

      const { result } = renderHook(() => useSimulation());

      expect(result.current.currentTurn).toBe(42);
    });

    it('should handle getCurrentTurn errors during initialization', () => {
      SimulationService.getCurrentTurn.mockImplementation(() => {
        throw new Error('Service error');
      });
      SimulationService.loadState.mockReturnValue({});

      const { result } = renderHook(() => useSimulation());

      expect(result.current.currentTurn).toBe(0);
      expect(console.error).toHaveBeenCalledWith('useSimulation: Error getting current turn during initialization:', expect.any(Error));
    });
  });

  describe('currentTurn updates via onTick callback', () => {
    it('should update currentTurn when onTick callback is triggered', () => {
      let onTickCallback;
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.setOnTick.mockImplementation((callback) => {
        onTickCallback = callback;
      });
      SimulationService.loadState.mockReturnValue({ time: 0 });

      const { result } = renderHook(() => useSimulation());

      expect(result.current.currentTurn).toBe(0);

      // Simulate a tick that increments the turn counter
      SimulationService.getCurrentTurn.mockReturnValue(1);
      act(() => {
        onTickCallback({ time: 1 });
      });

      expect(result.current.currentTurn).toBe(1);
    });

    it('should handle getCurrentTurn errors in onTick callback', () => {
      let onTickCallback;
      SimulationService.getCurrentTurn.mockReturnValue(5);
      SimulationService.setOnTick.mockImplementation((callback) => {
        onTickCallback = callback;
      });
      SimulationService.loadState.mockReturnValue({ time: 5 });

      const { result } = renderHook(() => useSimulation());

      expect(result.current.currentTurn).toBe(5);

      // Simulate an error in getCurrentTurn during onTick
      SimulationService.getCurrentTurn.mockImplementation(() => {
        throw new Error('Tick error');
      });

      act(() => {
        onTickCallback({ time: 6 });
      });

      expect(result.current.currentTurn).toBe(5); // Should preserve the initial value
      expect(console.error).toHaveBeenCalledWith('useSimulation: Error in onTick callback:', expect.any(Error));
    });

    it('should update currentTurn multiple times during simulation', () => {
      let onTickCallback;
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.setOnTick.mockImplementation((callback) => {
        onTickCallback = callback;
      });
      SimulationService.loadState.mockReturnValue({ time: 0 });

      const { result } = renderHook(() => useSimulation());

      // Simulate multiple ticks
      const turns = [1, 2, 3, 4, 5];
      turns.forEach((turn) => {
        SimulationService.getCurrentTurn.mockReturnValue(turn);
        act(() => {
          onTickCallback({ time: turn });
        });
        expect(result.current.currentTurn).toBe(turn);
      });
    });
  });

  describe('currentTurn synchronization with worldState changes', () => {
    it('should sync currentTurn when worldState changes via onTick', () => {
      let onTickCallback;
      SimulationService.getCurrentTurn.mockReturnValue(10);
      SimulationService.setOnTick.mockImplementation((callback) => {
        onTickCallback = callback;
      });
      SimulationService.loadState.mockReturnValue({ time: 10 });

      const { result } = renderHook(() => useSimulation());

      expect(result.current.currentTurn).toBe(10);

      // Simulate worldState change via onTick callback
      SimulationService.getCurrentTurn.mockReturnValue(15);
      act(() => {
        onTickCallback({ time: 15 });
      });

      expect(result.current.currentTurn).toBe(15);
    });

    it('should handle sync errors gracefully during worldState updates', () => {
      let onTickCallback;
      SimulationService.getCurrentTurn.mockReturnValue(20);
      SimulationService.setOnTick.mockImplementation((callback) => {
        onTickCallback = callback;
      });
      SimulationService.loadState.mockReturnValue({ time: 20 });

      const { result } = renderHook(() => useSimulation());

      expect(result.current.currentTurn).toBe(20);

      // Simulate error during sync
      SimulationService.getCurrentTurn.mockImplementation(() => {
        throw new Error('Sync error');
      });

      act(() => {
        onTickCallback({ time: 25 });
      });

      expect(result.current.currentTurn).toBe(20); // Should preserve the initial value
      expect(console.error).toHaveBeenCalledWith('useSimulation: Error in onTick callback:', expect.any(Error));
    });
  });

  describe('hook return value', () => {
    it('should include currentTurn in the returned object', () => {
      SimulationService.getCurrentTurn.mockReturnValue(7);
      SimulationService.loadState.mockReturnValue({ time: 7 });

      const { result } = renderHook(() => useSimulation());

      expect(result.current).toHaveProperty('currentTurn');
      expect(result.current.currentTurn).toBe(7);
    });

    it('should maintain all existing hook properties', () => {
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.loadState.mockReturnValue({ time: 0 });

      const { result } = renderHook(() => useSimulation());

      // Check that all expected properties are present
      expect(result.current).toHaveProperty('worldState');
      expect(result.current).toHaveProperty('isRunning');
      expect(result.current).toHaveProperty('historyAnalysis');
      expect(result.current).toHaveProperty('currentTurn');
      expect(result.current).toHaveProperty('startSimulation');
      expect(result.current).toHaveProperty('stopSimulation');
      expect(result.current).toHaveProperty('analyzeHistory');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null worldState gracefully', () => {
      SimulationService.worldState = null;
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.loadState.mockReturnValue(null);

      const { result } = renderHook(() => useSimulation());

      expect(result.current.currentTurn).toBe(0);
    });

    it('should handle undefined worldState gracefully', () => {
      SimulationService.worldState = undefined;
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.loadState.mockReturnValue(undefined);

      const { result } = renderHook(() => useSimulation());

      expect(result.current.currentTurn).toBe(0);
    });

    it('should handle invalid world state scenarios', () => {
      SimulationService.worldState = { time: null };
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.loadState.mockReturnValue({ time: null });

      const { result } = renderHook(() => useSimulation());

      expect(result.current.currentTurn).toBe(0);
    });
  });

  describe('enhanced error handling for simulation operations', () => {
    it('should handle invalid turn values during initialization', () => {
      SimulationService.getCurrentTurn.mockReturnValue('invalid');
      SimulationService.loadState.mockReturnValue({ time: 'invalid' });

      const { result } = renderHook(() => useSimulation());

      expect(result.current.currentTurn).toBe(0);
      expect(console.error).toHaveBeenCalledWith(
        'useSimulation: Invalid turn value from service:',
        'invalid'
      );
    });

    it('should handle non-finite turn values during initialization', () => {
      SimulationService.getCurrentTurn.mockReturnValue(NaN);
      SimulationService.loadState.mockReturnValue({ time: NaN });

      const { result } = renderHook(() => useSimulation());

      expect(result.current.currentTurn).toBe(0);
      expect(console.error).toHaveBeenCalledWith(
        'useSimulation: Invalid turn value from service:',
        NaN
      );
    });

    it('should handle negative turn values during initialization', () => {
      SimulationService.getCurrentTurn.mockReturnValue(-5);
      SimulationService.loadState.mockReturnValue({ time: -5 });

      const { result } = renderHook(() => useSimulation());

      expect(result.current.currentTurn).toBe(0);
      expect(console.error).toHaveBeenCalledWith(
        'useSimulation: Invalid turn value from service:',
        -5
      );
    });

    it('should handle null/undefined updatedState in onTick callback', () => {
      let onTickCallback;
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.setOnTick.mockImplementation((callback) => {
        onTickCallback = callback;
      });
      SimulationService.loadState.mockReturnValue({ time: 0 });

      renderHook(() => useSimulation());

      // Simulate onTick with null state
      act(() => {
        onTickCallback(null);
      });

      expect(console.error).toHaveBeenCalledWith(
        'useSimulation: onTick received null/undefined state'
      );

      // Simulate onTick with undefined state
      act(() => {
        onTickCallback(undefined);
      });

      expect(console.error).toHaveBeenCalledWith(
        'useSimulation: onTick received null/undefined state'
      );
    });

    it('should handle invalid turn values in onTick callback', () => {
      let onTickCallback;
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.setOnTick.mockImplementation((callback) => {
        onTickCallback = callback;
      });
      SimulationService.loadState.mockReturnValue({ time: 0 });

      const { result } = renderHook(() => useSimulation());

      // Simulate onTick with invalid turn value
      SimulationService.getCurrentTurn.mockReturnValue('invalid');
      act(() => {
        onTickCallback({ time: 'invalid' });
      });

      expect(result.current.currentTurn).toBe(0);
      expect(console.error).toHaveBeenCalledWith(
        'useSimulation: Invalid turn value in onTick:',
        'invalid'
      );
    });

    it('should handle errors in onTick callback gracefully', () => {
      let onTickCallback;
      SimulationService.getCurrentTurn.mockReturnValue(5);
      SimulationService.setOnTick.mockImplementation((callback) => {
        onTickCallback = callback;
      });
      SimulationService.loadState.mockReturnValue({ time: 5 });

      const { result } = renderHook(() => useSimulation());

      // Mock getCurrentTurn to throw error during onTick
      SimulationService.getCurrentTurn.mockImplementation(() => {
        throw new Error('Service error in onTick');
      });

      const initialTurn = result.current.currentTurn;

      act(() => {
        onTickCallback({ time: 6 });
      });

      // Should preserve the last known good value
      expect(result.current.currentTurn).toBe(initialTurn);
      expect(console.error).toHaveBeenCalledWith(
        'useSimulation: Error in onTick callback:',
        expect.any(Error)
      );
    });
  });

  describe('simulation operation error handling', () => {
    it('should handle stepSimulation with null/undefined state', () => {
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.loadState.mockReturnValue({ time: 0 });
      SimulationService.step = jest.fn().mockReturnValue(null);

      const { result } = renderHook(() => useSimulation());

      act(() => {
        result.current.stepSimulation();
      });

      expect(console.error).toHaveBeenCalledWith(
        'useSimulation: stepSimulation received null/undefined state'
      );
    });

    it('should handle stepSimulation with invalid turn value', () => {
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.loadState.mockReturnValue({ time: 0 });
      SimulationService.step = jest.fn().mockReturnValue({ time: 1 });

      const { result } = renderHook(() => useSimulation());

      // Mock getCurrentTurn to return invalid value after step
      SimulationService.getCurrentTurn.mockReturnValue('invalid');

      act(() => {
        result.current.stepSimulation();
      });

      expect(console.error).toHaveBeenCalledWith(
        'useSimulation: Invalid turn value after step:',
        'invalid'
      );
    });

    it('should handle resetSimulation with null/undefined state', () => {
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.loadState.mockReturnValue({ time: 0 });
      SimulationService.reset = jest.fn().mockReturnValue(null);

      const { result } = renderHook(() => useSimulation());

      let resetResult;
      act(() => {
        resetResult = result.current.resetSimulation();
      });

      expect(resetResult).toBeNull();
      expect(result.current.currentTurn).toBe(0);
      expect(console.error).toHaveBeenCalledWith(
        'useSimulation: resetSimulation received null/undefined state'
      );
    });

    it('should handle resetSimulation errors gracefully', () => {
      SimulationService.getCurrentTurn.mockReturnValue(5);
      SimulationService.loadState.mockReturnValue({ time: 5 });
      SimulationService.reset = jest.fn().mockImplementation(() => {
        throw new Error('Reset error');
      });

      const { result } = renderHook(() => useSimulation());

      let resetResult;
      act(() => {
        resetResult = result.current.resetSimulation();
      });

      expect(resetResult).toBeNull();
      expect(result.current.currentTurn).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'useSimulation: Error resetting simulation:',
        expect.any(Error)
      );
    });
  });

  describe('cleanup', () => {
    it('should remove onTick callback on unmount', () => {
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.loadState.mockReturnValue({ time: 0 });

      const { unmount } = renderHook(() => useSimulation());

      unmount();

      expect(SimulationService.setOnTick).toHaveBeenCalledWith(null);
    });
  });
});