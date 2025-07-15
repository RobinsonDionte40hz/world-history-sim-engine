// src/test/turn-counter-integration-final.test.js
// Integration tests for end-to-end turn counter flow

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimulationService from '../application/use-cases/services/SimulationService.js';
import useSimulation from '../presentation/hooks/useSimulation.js';
import TurnCounter from '../presentation/components/TurnCounter.js';
import WorldHistorySimInterface from '../presentation/components/WorldHistorySimInterface.js';

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

// Simple test component that demonstrates turn counter integration
const TurnCounterTestComponent = () => {
  const { currentTurn, startSimulation, stopSimulation, resetSimulation, stepSimulation, isRunning } = useSimulation();
  
  return (
    <div>
      <div data-testid="turn-counter">
        <TurnCounter currentTurn={currentTurn} />
      </div>
      <div data-testid="turn-value">{currentTurn}</div>
      <div data-testid="status">{isRunning ? 'Running' : 'Stopped'}</div>
      <button data-testid="start-btn" onClick={startSimulation}>Start</button>
      <button data-testid="stop-btn" onClick={stopSimulation}>Stop</button>
      <button data-testid="reset-btn" onClick={resetSimulation}>Reset</button>
      <button data-testid="step-btn" onClick={stepSimulation}>Step</button>
    </div>
  );
};

describe('Turn Counter Integration Tests - End-to-End Flow', () => {
  let originalConsoleError;
  let originalConsoleWarn;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Reset SimulationService state
    SimulationService.stop();
    SimulationService.worldState = null;
    
    // Suppress console errors/warnings during tests
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

  describe('Requirement 1.1: Turn counter initialization and increment', () => {
    test('should initialize turn counter to 0 when simulation starts fresh', async () => {
      render(<TurnCounterTestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('turn-value')).toHaveTextContent('0');
      });
    });

    test('should show simulation status correctly', async () => {
      render(<TurnCounterTestComponent />);
      
      // Initially stopped
      expect(screen.getByTestId('status')).toHaveTextContent('Stopped');
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('Running');
      });
      
      // Stop simulation
      fireEvent.click(screen.getByTestId('stop-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('Stopped');
      });
    });
  });

  describe('Requirement 1.2: Turn counter increments during simulation', () => {
    test('should increment turn counter during timed simulation', async () => {
      jest.useFakeTimers();
      
      render(<TurnCounterTestComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Fast-forward time to trigger ticks
      act(() => {
        jest.advanceTimersByTime(3000); // 3 seconds = 3 ticks
      });
      
      // The turn counter should have incremented
      await waitFor(() => {
        const turnValue = parseInt(screen.getByTestId('turn-value').textContent);
        expect(turnValue).toBeGreaterThan(0);
      });
      
      jest.useRealTimers();
    });

    test('should stop incrementing when simulation is paused', async () => {
      jest.useFakeTimers();
      
      render(<TurnCounterTestComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Let it run for a bit
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      // Stop simulation
      fireEvent.click(screen.getByTestId('stop-btn'));
      
      // Get current turn value
      const turnAfterStop = screen.getByTestId('turn-value').textContent;
      
      // Advance time more
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      // Turn counter should not have changed
      await waitFor(() => {
        expect(screen.getByTestId('turn-value')).toHaveTextContent(turnAfterStop);
      });
      
      jest.useRealTimers();
    });
  });

  describe('Requirement 1.4: Turn counter continues from last value', () => {
    test('should continue from last value when restarted', async () => {
      jest.useFakeTimers();
      
      render(<TurnCounterTestComponent />);
      
      // Start simulation and let it run
      fireEvent.click(screen.getByTestId('start-btn'));
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      // Stop simulation
      fireEvent.click(screen.getByTestId('stop-btn'));
      
      // Get the turn value after stopping
      const turnAfterStop = parseInt(screen.getByTestId('turn-value').textContent);
      
      // Restart simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      // Should continue from where it left off
      await waitFor(() => {
        const currentTurn = parseInt(screen.getByTestId('turn-value').textContent);
        expect(currentTurn).toBeGreaterThan(turnAfterStop);
      });
      
      jest.useRealTimers();
    });
  });

  describe('Requirement 2.1-2.4: Persistence across browser sessions', () => {
    test('should save turn counter to localStorage during simulation', async () => {
      jest.useFakeTimers();
      
      render(<TurnCounterTestComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Let it run for a few ticks
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      // Verify localStorage was called to save state
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'worldState',
          expect.stringContaining('"time":')
        );
      });
      
      jest.useRealTimers();
    });

    test('should restore turn counter from localStorage on component mount', async () => {
      // Pre-populate localStorage with a saved state
      const savedState = {
        time: 42,
        nodes: [],
        npcs: [],
        resources: {}
      };
      localStorageMock.setItem('worldState', JSON.stringify(savedState));
      
      render(<TurnCounterTestComponent />);
      
      // Should restore the saved turn value
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 42');
        expect(screen.getByTestId('turn-value')).toHaveTextContent('42');
      });
    });

    test('should handle corrupted localStorage data gracefully', async () => {
      // Set corrupted data in localStorage
      localStorageMock.setItem('worldState', 'invalid json {');
      
      render(<TurnCounterTestComponent />);
      
      // Should default to turn 0 when localStorage is corrupted
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
      
      // Should have cleared the corrupted data
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('worldState');
    });

    test('should initialize to 0 when no saved state exists', async () => {
      // Ensure localStorage is empty
      localStorageMock.clear();
      
      render(<TurnCounterTestComponent />);
      
      // Should default to turn 0 when no saved state exists
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
    });
  });

  describe('Requirement 3.1-3.3: Synchronization between service and UI', () => {
    test('should synchronize multiple UI components displaying turn counter', async () => {
      const MultiCounterComponent = () => {
        const { currentTurn } = useSimulation();
        return (
          <div>
            <div data-testid="counter-1"><TurnCounter currentTurn={currentTurn} /></div>
            <div data-testid="counter-2">Turn: {currentTurn}</div>
            <div data-testid="counter-3">Current Turn: {currentTurn}</div>
          </div>
        );
      };
      
      render(<MultiCounterComponent />);
      
      await waitFor(() => {
        // All components should show the same turn value
        expect(screen.getByTestId('counter-1')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('counter-2')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('counter-3')).toHaveTextContent('Current Turn: 0');
      });
    });

    test('should update all components simultaneously when turn changes', async () => {
      // Pre-populate localStorage with a saved state
      const savedState = {
        time: 15,
        nodes: [],
        npcs: [],
        resources: {}
      };
      localStorageMock.setItem('worldState', JSON.stringify(savedState));
      
      const MultiCounterComponent = () => {
        const { currentTurn } = useSimulation();
        return (
          <div>
            <div data-testid="counter-1"><TurnCounter currentTurn={currentTurn} /></div>
            <div data-testid="counter-2">Turn: {currentTurn}</div>
            <div data-testid="counter-3">Current Turn: {currentTurn}</div>
          </div>
        );
      };
      
      render(<MultiCounterComponent />);
      
      await waitFor(() => {
        // All components should show the same restored turn value
        expect(screen.getByTestId('counter-1')).toHaveTextContent('Turn: 15');
        expect(screen.getByTestId('counter-2')).toHaveTextContent('Turn: 15');
        expect(screen.getByTestId('counter-3')).toHaveTextContent('Current Turn: 15');
      });
    });
  });

  describe('Requirement 4.1: Turn counter display in simulation interface', () => {
    test('should display turn counter in WorldHistorySimInterface', async () => {
      render(<WorldHistorySimInterface />);
      
      // Should find turn counter in the interface
      await waitFor(() => {
        expect(screen.getByText(/Turn:/)).toBeInTheDocument();
      });
      
      // Should show initial turn 0
      expect(screen.getByText(/Turn: 0/)).toBeInTheDocument();
    });

    test('should maintain turn counter visibility during interface interactions', async () => {
      render(<WorldHistorySimInterface />);
      
      // Find turn counter
      await waitFor(() => {
        expect(screen.getByText(/Turn: 0/)).toBeInTheDocument();
      });
      
      // Click on different tabs to ensure turn counter remains visible
      const timelineTab = screen.getByText('timeline');
      fireEvent.click(timelineTab);
      
      // Turn counter should still be visible
      expect(screen.getByText(/Turn: 0/)).toBeInTheDocument();
      
      const charactersTab = screen.getByText('characters');
      fireEvent.click(charactersTab);
      
      // Turn counter should still be visible
      expect(screen.getByText(/Turn: 0/)).toBeInTheDocument();
    });
  });

  describe('Requirement 5.1-5.4: Error handling for turn counter operations', () => {
    test('should display fallback when turn counter state is unavailable', async () => {
      // Mock SimulationService to return invalid turn
      const originalGetCurrentTurn = SimulationService.getCurrentTurn;
      SimulationService.getCurrentTurn = jest.fn(() => NaN);
      
      render(<TurnCounterTestComponent />);
      
      // Should display fallback value
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: --');
      });
      
      // Restore original method
      SimulationService.getCurrentTurn = originalGetCurrentTurn;
    });

    test('should handle simulation failures gracefully', async () => {
      // Mock SimulationService to throw an error
      const originalStep = SimulationService.step;
      SimulationService.step = jest.fn(() => {
        throw new Error('Simulation error');
      });
      
      render(<TurnCounterTestComponent />);
      
      // Try to step - should not crash
      fireEvent.click(screen.getByTestId('step-btn'));
      
      // Should still display a valid turn counter
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent(/Turn: \d+/);
      });
      
      // Restore original method
      SimulationService.step = originalStep;
    });

    test('should continue running despite localStorage save failures', async () => {
      jest.useFakeTimers();
      
      // Mock localStorage.setItem to fail
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });
      
      render(<TurnCounterTestComponent />);
      
      // Start simulation - should continue working despite save failures
      fireEvent.click(screen.getByTestId('start-btn'));
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      // Turn counter should still update in UI
      await waitFor(() => {
        const currentTurn = parseInt(screen.getByTestId('turn-value').textContent);
        expect(currentTurn).toBeGreaterThan(0);
      });
      
      // Restore original method
      localStorageMock.setItem = originalSetItem;
      jest.useRealTimers();
    });

    test('should reset to valid state when invalid turn counter values are detected', async () => {
      // Mock SimulationService to return various invalid values
      const originalGetCurrentTurn = SimulationService.getCurrentTurn;
      
      // Test with null
      SimulationService.getCurrentTurn = jest.fn(() => null);
      render(<TurnCounterTestComponent />);
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: --');
      });
      
      // Test with undefined
      SimulationService.getCurrentTurn = jest.fn(() => undefined);
      render(<TurnCounterTestComponent />);
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: --');
      });
      
      // Test with negative number
      SimulationService.getCurrentTurn = jest.fn(() => -5);
      render(<TurnCounterTestComponent />);
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: --');
      });
      
      // Test with Infinity
      SimulationService.getCurrentTurn = jest.fn(() => Infinity);
      render(<TurnCounterTestComponent />);
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: --');
      });
      
      // Restore original method
      SimulationService.getCurrentTurn = originalGetCurrentTurn;
    });
  });

  describe('Real-time Updates During Simulation Execution', () => {
    test('should update turn counter in real-time during simulation', async () => {
      jest.useFakeTimers();
      
      render(<TurnCounterTestComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Check initial state
      expect(screen.getByTestId('turn-value')).toHaveTextContent('0');
      
      // Advance time by 1 second (1 tick)
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        const turnValue = parseInt(screen.getByTestId('turn-value').textContent);
        expect(turnValue).toBeGreaterThan(0);
      });
      
      jest.useRealTimers();
    });

    test('should handle rapid simulation updates without UI lag', async () => {
      jest.useFakeTimers();
      
      render(<TurnCounterTestComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Rapidly advance time
      act(() => {
        jest.advanceTimersByTime(10000); // 10 seconds = 10 ticks
      });
      
      // Should handle rapid updates gracefully
      await waitFor(() => {
        const turnValue = parseInt(screen.getByTestId('turn-value').textContent);
        expect(turnValue).toBeGreaterThan(0);
      });
      
      jest.useRealTimers();
    });

    test('should maintain accurate turn counter during long simulation runs', async () => {
      jest.useFakeTimers();
      
      render(<TurnCounterTestComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Simulate a long run
      act(() => {
        jest.advanceTimersByTime(60000); // 60 seconds = 60 ticks
      });
      
      await waitFor(() => {
        const turnValue = parseInt(screen.getByTestId('turn-value').textContent);
        expect(turnValue).toBeGreaterThan(0);
      });
      
      // Stop and verify the count is preserved
      fireEvent.click(screen.getByTestId('stop-btn'));
      
      const finalTurn = screen.getByTestId('turn-value').textContent;
      
      // Advance time while stopped
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      // Turn should not have changed
      await waitFor(() => {
        expect(screen.getByTestId('turn-value')).toHaveTextContent(finalTurn);
      });
      
      jest.useRealTimers();
    });
  });
});