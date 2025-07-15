// src/test/turn-counter-integration.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimulationService from '../application/use-cases/services/SimulationService.js';
import useSimulation from '../presentation/hooks/useSimulation.js';
import WorldHistorySimInterface from '../presentation/components/WorldHistorySimInterface.js';
import TurnCounter from '../presentation/components/TurnCounter.js';

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

// Test component that uses multiple turn counter displays
const MultiTurnCounterComponent = () => {
  const { currentTurn, startSimulation, stopSimulation, resetSimulation, stepSimulation } = useSimulation();
  
  return (
    <div>
      <div data-testid="header-turn-counter">
        <TurnCounter currentTurn={currentTurn} />
      </div>
      <div data-testid="sidebar-turn-counter">
        Turn: {currentTurn}
      </div>
      <div data-testid="status-turn-counter">
        Current Turn: {currentTurn}
      </div>
      <button data-testid="start-btn" onClick={startSimulation}>Start</button>
      <button data-testid="stop-btn" onClick={stopSimulation}>Stop</button>
      <button data-testid="reset-btn" onClick={resetSimulation}>Reset</button>
      <button data-testid="step-btn" onClick={stepSimulation}>Step</button>
    </div>
  );
};

describe('Turn Counter Integration Tests', () => {
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

  describe('Simulation Start/Stop/Reset with Turn Counter Updates', () => {
    test('should initialize turn counter to 0 when starting fresh simulation', async () => {
      render(<MultiTurnCounterComponent />);
      
      // Initially should show turn 0
      expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 0');
      expect(screen.getByTestId('sidebar-turn-counter')).toHaveTextContent('Turn: 0');
      expect(screen.getByTestId('status-turn-counter')).toHaveTextContent('Current Turn: 0');
    });

    test('should increment turn counter when simulation runs', async () => {
      jest.useFakeTimers();
      
      render(<MultiTurnCounterComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Fast-forward time to trigger several ticks
      act(() => {
        jest.advanceTimersByTime(3000); // 3 seconds = 3 ticks
      });
      
      await waitFor(() => {
        const headerCounter = screen.getByTestId('header-turn-counter');
        expect(headerCounter).toHaveTextContent(/Turn: [1-9]/); // Should be > 0
      });
      
      // All counters should show the same value
      const headerText = screen.getByTestId('header-turn-counter').textContent;
      const sidebarText = screen.getByTestId('sidebar-turn-counter').textContent;
      const statusText = screen.getByTestId('status-turn-counter').textContent;
      
      const turnNumber = headerText.match(/Turn: (\d+)/)[1];
      expect(sidebarText).toContain(turnNumber);
      expect(statusText).toContain(turnNumber);
      
      jest.useRealTimers();
    });

    test('should stop incrementing when simulation is paused', async () => {
      jest.useFakeTimers();
      
      render(<MultiTurnCounterComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Let it run for a bit
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      // Stop simulation
      fireEvent.click(screen.getByTestId('stop-btn'));
      
      // Get current turn value
      const turnAfterStop = screen.getByTestId('header-turn-counter').textContent;
      
      // Advance time more
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      // Turn counter should not have changed
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent(turnAfterStop);
      });
      
      jest.useRealTimers();
    });

    test('should continue from last value when restarted', async () => {
      jest.useFakeTimers();
      
      render(<MultiTurnCounterComponent />);
      
      // Start simulation and let it run
      fireEvent.click(screen.getByTestId('start-btn'));
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      // Stop simulation
      fireEvent.click(screen.getByTestId('stop-btn'));
      
      // Get the turn value after stopping
      const turnAfterStop = parseInt(screen.getByTestId('header-turn-counter').textContent.match(/Turn: (\d+)/)[1]);
      
      // Restart simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      // Should continue from where it left off
      await waitFor(() => {
        const currentTurn = parseInt(screen.getByTestId('header-turn-counter').textContent.match(/Turn: (\d+)/)[1]);
        expect(currentTurn).toBeGreaterThan(turnAfterStop);
      });
      
      jest.useRealTimers();
    });

    test('should reset turn counter to 0 when simulation is reset', async () => {
      jest.useFakeTimers();
      
      render(<MultiTurnCounterComponent />);
      
      // Start simulation and let it run
      fireEvent.click(screen.getByTestId('start-btn'));
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      // Verify turn counter is > 0
      await waitFor(() => {
        const currentTurn = parseInt(screen.getByTestId('header-turn-counter').textContent.match(/Turn: (\d+)/)[1]);
        expect(currentTurn).toBeGreaterThan(0);
      });
      
      // Reset simulation
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      // All counters should reset to 0
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('sidebar-turn-counter')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('status-turn-counter')).toHaveTextContent('Current Turn: 0');
      });
      
      jest.useRealTimers();
    });

    test('should increment turn counter by 1 when stepping manually', async () => {
      render(<MultiTurnCounterComponent />);
      
      // Initial state should be 0
      expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 0');
      
      // Step forward once
      fireEvent.click(screen.getByTestId('step-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 1');
      });
      
      // Step forward again
      fireEvent.click(screen.getByTestId('step-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 2');
      });
    });
  });

  describe('Persistence and Restoration Across Sessions', () => {
    test('should save turn counter to localStorage when simulation runs', async () => {
      jest.useFakeTimers();
      
      render(<MultiTurnCounterComponent />);
      
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
      
      // Verify the saved state contains the correct turn value
      const savedState = JSON.parse(localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1][1]);
      expect(savedState.time).toBeGreaterThan(0);
      
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
      
      render(<MultiTurnCounterComponent />);
      
      // Should restore the saved turn value
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 42');
        expect(screen.getByTestId('sidebar-turn-counter')).toHaveTextContent('Turn: 42');
        expect(screen.getByTestId('status-turn-counter')).toHaveTextContent('Current Turn: 42');
      });
    });

    test('should handle corrupted localStorage data gracefully', async () => {
      // Set corrupted data in localStorage
      localStorageMock.setItem('worldState', 'invalid json {');
      
      render(<MultiTurnCounterComponent />);
      
      // Should default to turn 0 when localStorage is corrupted
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 0');
      });
      
      // Should have cleared the corrupted data
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('worldState');
    });

    test('should handle missing localStorage data gracefully', async () => {
      // Ensure localStorage is empty
      localStorageMock.clear();
      
      render(<MultiTurnCounterComponent />);
      
      // Should default to turn 0 when no saved state exists
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 0');
      });
    });

    test('should persist turn counter updates automatically', async () => {
      jest.useFakeTimers();
      
      render(<MultiTurnCounterComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Let it run and check that localStorage is updated multiple times
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      const initialCallCount = localStorageMock.setItem.mock.calls.length;
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      // Should have made additional localStorage calls
      await waitFor(() => {
        expect(localStorageMock.setItem.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
      
      jest.useRealTimers();
    });
  });

  describe('Synchronization Between Multiple UI Components', () => {
    test('should synchronize turn counter across multiple components', async () => {
      render(<MultiTurnCounterComponent />);
      
      // Step forward to change the turn
      fireEvent.click(screen.getByTestId('step-btn'));
      
      await waitFor(() => {
        // All components should show the same turn value
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 1');
        expect(screen.getByTestId('sidebar-turn-counter')).toHaveTextContent('Turn: 1');
        expect(screen.getByTestId('status-turn-counter')).toHaveTextContent('Current Turn: 1');
      });
    });

    test('should update all components simultaneously during simulation', async () => {
      jest.useFakeTimers();
      
      render(<MultiTurnCounterComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Advance time
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      await waitFor(() => {
        // Get turn values from all components
        const headerTurn = screen.getByTestId('header-turn-counter').textContent.match(/Turn: (\d+)/)[1];
        const sidebarTurn = screen.getByTestId('sidebar-turn-counter').textContent.match(/Turn: (\d+)/)[1];
        const statusTurn = screen.getByTestId('status-turn-counter').textContent.match(/Current Turn: (\d+)/)[1];
        
        // All should be the same and > 0
        expect(headerTurn).toBe(sidebarTurn);
        expect(sidebarTurn).toBe(statusTurn);
        expect(parseInt(headerTurn)).toBeGreaterThan(0);
      });
      
      jest.useRealTimers();
    });

    test('should maintain synchronization after reset', async () => {
      jest.useFakeTimers();
      
      render(<MultiTurnCounterComponent />);
      
      // Start simulation and let it run
      fireEvent.click(screen.getByTestId('start-btn'));
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      // Reset simulation
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      // All components should reset to 0 simultaneously
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('sidebar-turn-counter')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('status-turn-counter')).toHaveTextContent('Current Turn: 0');
      });
      
      jest.useRealTimers();
    });
  });

  describe('Real-time Updates During Simulation Execution', () => {
    test('should update turn counter in real-time during simulation', async () => {
      jest.useFakeTimers();
      
      render(<MultiTurnCounterComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Check initial state
      expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 0');
      
      // Advance time by 1 second (1 tick)
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 1');
      });
      
      // Advance time by another second
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 2');
      });
      
      jest.useRealTimers();
    });

    test('should handle rapid simulation updates without UI lag', async () => {
      jest.useFakeTimers();
      
      render(<MultiTurnCounterComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Rapidly advance time
      act(() => {
        jest.advanceTimersByTime(10000); // 10 seconds = 10 ticks
      });
      
      // Should handle rapid updates gracefully
      await waitFor(() => {
        const currentTurn = parseInt(screen.getByTestId('header-turn-counter').textContent.match(/Turn: (\d+)/)[1]);
        expect(currentTurn).toBeGreaterThanOrEqual(10);
      });
      
      jest.useRealTimers();
    });

    test('should maintain accurate turn counter during long simulation runs', async () => {
      jest.useFakeTimers();
      
      render(<MultiTurnCounterComponent />);
      
      // Start simulation
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Simulate a long run
      act(() => {
        jest.advanceTimersByTime(60000); // 60 seconds = 60 ticks
      });
      
      await waitFor(() => {
        const currentTurn = parseInt(screen.getByTestId('header-turn-counter').textContent.match(/Turn: (\d+)/)[1]);
        expect(currentTurn).toBeGreaterThanOrEqual(60);
      });
      
      // Stop and verify the count is preserved
      fireEvent.click(screen.getByTestId('stop-btn'));
      
      const finalTurn = parseInt(screen.getByTestId('header-turn-counter').textContent.match(/Turn: (\d+)/)[1]);
      
      // Advance time while stopped
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      // Turn should not have changed
      await waitFor(() => {
        const unchangedTurn = parseInt(screen.getByTestId('header-turn-counter').textContent.match(/Turn: (\d+)/)[1]);
        expect(unchangedTurn).toBe(finalTurn);
      });
      
      jest.useRealTimers();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle simulation service errors gracefully', async () => {
      // Mock SimulationService to throw an error
      const originalStep = SimulationService.step;
      SimulationService.step = jest.fn(() => {
        throw new Error('Simulation error');
      });
      
      render(<MultiTurnCounterComponent />);
      
      // Try to step - should not crash
      fireEvent.click(screen.getByTestId('step-btn'));
      
      // Should still display a valid turn counter (likely 0)
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent(/Turn: \d+/);
      });
      
      // Restore original method
      SimulationService.step = originalStep;
    });

    test('should handle invalid turn values gracefully', async () => {
      // Mock SimulationService to return invalid turn
      const originalGetCurrentTurn = SimulationService.getCurrentTurn;
      SimulationService.getCurrentTurn = jest.fn(() => NaN);
      
      render(<MultiTurnCounterComponent />);
      
      // Should display fallback value
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: --');
      });
      
      // Restore original method
      SimulationService.getCurrentTurn = originalGetCurrentTurn;
    });

    test('should recover from localStorage save failures', async () => {
      jest.useFakeTimers();
      
      // Mock localStorage.setItem to fail
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });
      
      render(<MultiTurnCounterComponent />);
      
      // Start simulation - should continue working despite save failures
      fireEvent.click(screen.getByTestId('start-btn'));
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      // Turn counter should still update in UI
      await waitFor(() => {
        const currentTurn = parseInt(screen.getByTestId('header-turn-counter').textContent.match(/Turn: (\d+)/)[1]);
        expect(currentTurn).toBeGreaterThan(0);
      });
      
      // Restore original method
      localStorageMock.setItem = originalSetItem;
      jest.useRealTimers();
    });
  });

  describe('Full WorldHistorySimInterface Integration', () => {
    test('should integrate turn counter properly in full interface', async () => {
      render(<WorldHistorySimInterface />);
      
      // Should find turn counter in the interface
      await waitFor(() => {
        expect(screen.getByText(/Turn:/)).toBeInTheDocument();
      });
      
      // Should show initial turn 0
      expect(screen.getByText(/Turn: 0/)).toBeInTheDocument();
    });

    test('should update turn counter when using interface controls', async () => {
      jest.useFakeTimers();
      
      render(<WorldHistorySimInterface />);
      
      // Find and click the start button
      const startButton = screen.getByText(/Start.*Simulation/);
      fireEvent.click(startButton);
      
      // Advance time
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      // Turn counter should have updated
      await waitFor(() => {
        const turnElements = screen.getAllByText(/Turn: [1-9]/);
        expect(turnElements.length).toBeGreaterThan(0);
      });
      
      jest.useRealTimers();
    });
  });
});