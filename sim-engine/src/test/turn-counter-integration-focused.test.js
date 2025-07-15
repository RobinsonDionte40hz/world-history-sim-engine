// src/test/turn-counter-integration-focused.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimulationService from '../application/use-cases/services/SimulationService.js';
import useSimulation from '../presentation/hooks/useSimulation.js';
import TurnCounter from '../presentation/components/TurnCounter.js';

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
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => Object.keys(store)[index] || null)
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock the RunTick function to focus on turn counter functionality
jest.mock('../application/use-cases/simulation/RunTick.js', () => {
  return jest.fn((worldState) => {
    // Simple mock that just increments time and returns the state
    if (!worldState) {
      throw new Error('Invalid world state');
    }
    
    return {
      ...worldState,
      time: (worldState.time || 0) + 1,
      tickDelay: 1000
    };
  });
});

// Test component that uses the simulation hook
const TestTurnCounterComponent = () => {
  const { currentTurn, startSimulation, stopSimulation, resetSimulation, stepSimulation, isRunning } = useSimulation();
  
  return (
    <div>
      <div data-testid="turn-counter">
        <TurnCounter currentTurn={currentTurn} />
      </div>
      <div data-testid="turn-display">Turn: {currentTurn}</div>
      <div data-testid="status">{isRunning ? 'Running' : 'Stopped'}</div>
      <button data-testid="start-btn" onClick={startSimulation}>Start</button>
      <button data-testid="stop-btn" onClick={stopSimulation}>Stop</button>
      <button data-testid="reset-btn" onClick={resetSimulation}>Reset</button>
      <button data-testid="step-btn" onClick={stepSimulation}>Step</button>
    </div>
  );
};

describe('Turn Counter Integration Tests - Focused', () => {
  let originalConsoleError;
  let originalConsoleWarn;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Reset SimulationService state
    SimulationService.stop();
    SimulationService.worldState = null;
    
    // Suppress console errors/warnings during tests unless we're specifically testing them
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    
    // Clean up any running simulations
    SimulationService.stop();
    
    // Clear timers
    jest.clearAllTimers();
  });

  describe('Basic Turn Counter Functionality', () => {
    test('should initialize turn counter to 0', async () => {
      render(<TestTurnCounterComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('turn-display')).toHaveTextContent('Turn: 0');
      });
    });

    test('should increment turn counter when stepping manually', async () => {
      render(<TestTurnCounterComponent />);
      
      // Initial state should be 0
      expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      
      // Step forward once
      fireEvent.click(screen.getByTestId('step-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 1');
        expect(screen.getByTestId('turn-display')).toHaveTextContent('Turn: 1');
      });
      
      // Step forward again
      fireEvent.click(screen.getByTestId('step-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 2');
        expect(screen.getByTestId('turn-display')).toHaveTextContent('Turn: 2');
      });
    });

    test('should reset turn counter to 0', async () => {
      render(<TestTurnCounterComponent />);
      
      // Step forward a few times
      fireEvent.click(screen.getByTestId('step-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 1');
      });
      
      fireEvent.click(screen.getByTestId('step-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 2');
      });
      
      // Reset simulation
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('turn-display')).toHaveTextContent('Turn: 0');
      });
    });
  });

  describe('Simulation State Integration', () => {
    test('should show running status when simulation starts', async () => {
      jest.useFakeTimers();
      
      render(<TestTurnCounterComponent />);
      
      // Initially stopped
      expect(screen.getByTestId('status')).toHaveTextContent('Stopped');
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('Running');
      });
      
      jest.useRealTimers();
    });

    test('should increment turn counter during simulation', async () => {
      jest.useFakeTimers();
      
      render(<TestTurnCounterComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Fast-forward time to trigger ticks
      act(() => {
        jest.advanceTimersByTime(2000); // 2 seconds = 2 ticks
      });
      
      await waitFor(() => {
        const turnText = screen.getByTestId('turn-counter').textContent;
        const turnNumber = parseInt(turnText.match(/Turn: (\d+)/)[1]);
        expect(turnNumber).toBeGreaterThan(0);
      });
      
      jest.useRealTimers();
    });

    test('should stop incrementing when simulation is stopped', async () => {
      jest.useFakeTimers();
      
      render(<TestTurnCounterComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Let it run for a bit
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Stop simulation
      fireEvent.click(screen.getByTestId('stop-btn'));
      
      // Get current turn value
      const turnAfterStop = screen.getByTestId('turn-counter').textContent;
      
      // Advance time more
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      // Turn counter should not have changed
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent(turnAfterStop);
        expect(screen.getByTestId('status')).toHaveTextContent('Stopped');
      });
      
      jest.useRealTimers();
    });
  });

  describe('Persistence Integration', () => {
    test('should save turn counter to localStorage', async () => {
      render(<TestTurnCounterComponent />);
      
      // Step forward to change the turn
      fireEvent.click(screen.getByTestId('step-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 1');
      });
      
      // Verify localStorage was called to save state
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'worldState',
        expect.stringContaining('"time":1')
      );
    });

    test('should restore turn counter from localStorage', async () => {
      // Pre-populate localStorage with a saved state
      const savedState = {
        time: 42,
        nodes: [],
        npcs: [],
        resources: {}
      };
      localStorageMock.setItem('worldState', JSON.stringify(savedState));
      
      render(<TestTurnCounterComponent />);
      
      // Should restore the saved turn value
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 42');
        expect(screen.getByTestId('turn-display')).toHaveTextContent('Turn: 42');
      });
    });

    test('should handle corrupted localStorage gracefully', async () => {
      // Set corrupted data in localStorage
      localStorageMock.setItem('worldState', 'invalid json {');
      
      render(<TestTurnCounterComponent />);
      
      // Should default to turn 0 when localStorage is corrupted
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
      
      // Should have cleared the corrupted data
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('worldState');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid turn values gracefully', async () => {
      // Mock SimulationService to return invalid turn
      const originalGetCurrentTurn = SimulationService.getCurrentTurn;
      SimulationService.getCurrentTurn = jest.fn(() => NaN);
      
      render(<TestTurnCounterComponent />);
      
      // Should display fallback value
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: --');
      });
      
      // Restore original method
      SimulationService.getCurrentTurn = originalGetCurrentTurn;
    });

    test('should handle simulation service errors gracefully', async () => {
      // Mock SimulationService to throw an error
      const originalStep = SimulationService.step;
      SimulationService.step = jest.fn(() => {
        throw new Error('Simulation error');
      });
      
      render(<TestTurnCounterComponent />);
      
      // Try to step - should not crash
      fireEvent.click(screen.getByTestId('step-btn'));
      
      // Should still display a valid turn counter (likely 0)
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent(/Turn: \d+/);
      });
      
      // Restore original method
      SimulationService.step = originalStep;
    });
  });

  describe('Service Integration', () => {
    test('should call SimulationService methods correctly', async () => {
      const startSpy = jest.spyOn(SimulationService, 'start');
      const stopSpy = jest.spyOn(SimulationService, 'stop');
      const resetSpy = jest.spyOn(SimulationService, 'reset');
      const stepSpy = jest.spyOn(SimulationService, 'step');
      
      render(<TestTurnCounterComponent />);
      
      // Test start
      fireEvent.click(screen.getByTestId('start-btn'));
      expect(startSpy).toHaveBeenCalled();
      
      // Test stop
      fireEvent.click(screen.getByTestId('stop-btn'));
      expect(stopSpy).toHaveBeenCalled();
      
      // Test reset
      fireEvent.click(screen.getByTestId('reset-btn'));
      expect(resetSpy).toHaveBeenCalled();
      
      // Test step
      fireEvent.click(screen.getByTestId('step-btn'));
      expect(stepSpy).toHaveBeenCalled();
      
      startSpy.mockRestore();
      stopSpy.mockRestore();
      resetSpy.mockRestore();
      stepSpy.mockRestore();
    });

    test('should sync turn counter with service state', async () => {
      render(<TestTurnCounterComponent />);
      
      // Manually update service state
      SimulationService.worldState = { time: 123, nodes: [], npcs: [], resources: {} };
      
      // Step to trigger sync
      fireEvent.click(screen.getByTestId('step-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 124');
      });
    });
  });

  describe('Real-time Updates', () => {
    test('should update turn counter in real-time during simulation', async () => {
      jest.useFakeTimers();
      
      render(<TestTurnCounterComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Check initial state
      expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      
      // Advance time by 1 second (1 tick)
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 1');
      });
      
      // Advance time by another second
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 2');
      });
      
      jest.useRealTimers();
    });

    test('should handle rapid updates gracefully', async () => {
      jest.useFakeTimers();
      
      render(<TestTurnCounterComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Rapidly advance time
      act(() => {
        jest.advanceTimersByTime(5000); // 5 seconds = 5 ticks
      });
      
      // Should handle rapid updates gracefully
      await waitFor(() => {
        const turnText = screen.getByTestId('turn-counter').textContent;
        const turnNumber = parseInt(turnText.match(/Turn: (\d+)/)[1]);
        expect(turnNumber).toBeGreaterThanOrEqual(5);
      });
      
      jest.useRealTimers();
    });
  });
});