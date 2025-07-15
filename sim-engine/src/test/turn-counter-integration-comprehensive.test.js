// src/test/turn-counter-integration-comprehensive.test.js
// Comprehensive integration tests for turn counter end-to-end flow
// Tests cover all requirements from the spec: 1.4, 2.1, 2.2, 3.3, 4.1

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

// Mock the RunTick function to provide predictable behavior for testing
jest.mock('../application/use-cases/simulation/RunTick.js', () => {
  return jest.fn((worldState) => {
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

describe('Turn Counter Integration Tests - Comprehensive End-to-End Flow', () => {
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

  describe('Test 1: Simulation Start/Stop/Reset with Turn Counter Updates (Requirement 1.4)', () => {
    test('should initialize simulation service and turn counter correctly', async () => {
      const TestComponent = () => {
        const { currentTurn, isRunning } = useSimulation();
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <div data-testid="status">{isRunning ? 'Running' : 'Stopped'}</div>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Should initialize to 0 and stopped state
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('status')).toHaveTextContent('Stopped');
      });
    });

    test('should handle simulation state transitions correctly', async () => {
      const TestComponent = () => {
        const { currentTurn, isRunning, startSimulation, stopSimulation, resetSimulation } = useSimulation();
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <div data-testid="status">{isRunning ? 'Running' : 'Stopped'}</div>
            <button data-testid="start-btn" onClick={startSimulation}>Start</button>
            <button data-testid="stop-btn" onClick={stopSimulation}>Stop</button>
            <button data-testid="reset-btn" onClick={resetSimulation}>Reset</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Test start
      fireEvent.click(screen.getByTestId('start-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('Running');
      });
      
      // Test stop
      fireEvent.click(screen.getByTestId('stop-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('Stopped');
      });
      
      // Test reset
      fireEvent.click(screen.getByTestId('reset-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('status')).toHaveTextContent('Stopped');
      });
    });

    test('should call SimulationService methods during state transitions', async () => {
      const startSpy = jest.spyOn(SimulationService, 'start');
      const stopSpy = jest.spyOn(SimulationService, 'stop');
      const resetSpy = jest.spyOn(SimulationService, 'reset');
      const stepSpy = jest.spyOn(SimulationService, 'step');
      
      const TestComponent = () => {
        const { startSimulation, stopSimulation, resetSimulation, stepSimulation } = useSimulation();
        return (
          <div>
            <button data-testid="start-btn" onClick={startSimulation}>Start</button>
            <button data-testid="stop-btn" onClick={stopSimulation}>Stop</button>
            <button data-testid="reset-btn" onClick={resetSimulation}>Reset</button>
            <button data-testid="step-btn" onClick={stepSimulation}>Step</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Test service method calls
      fireEvent.click(screen.getByTestId('start-btn'));
      expect(startSpy).toHaveBeenCalled();
      
      fireEvent.click(screen.getByTestId('stop-btn'));
      expect(stopSpy).toHaveBeenCalled();
      
      fireEvent.click(screen.getByTestId('reset-btn'));
      expect(resetSpy).toHaveBeenCalled();
      
      fireEvent.click(screen.getByTestId('step-btn'));
      expect(stepSpy).toHaveBeenCalled();
      
      startSpy.mockRestore();
      stopSpy.mockRestore();
      resetSpy.mockRestore();
      stepSpy.mockRestore();
    });
  });

  describe('Test 2: Persistence and Restoration Across Sessions (Requirements 2.1, 2.2)', () => {
    test('should save simulation state to localStorage', async () => {
      const TestComponent = () => {
        const { startSimulation } = useSimulation();
        return <button data-testid="start-btn" onClick={startSimulation}>Start</button>;
      };

      render(<TestComponent />);
      
      // Start simulation to trigger state saving
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Verify localStorage save was attempted
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'worldState',
          expect.any(String)
        );
      });
    });

    test('should restore turn counter from localStorage when available', async () => {
      // Pre-populate localStorage with a saved state
      const savedState = {
        time: 42,
        nodes: [],
        npcs: [],
        resources: {}
      };
      localStorageMock.setItem('worldState', JSON.stringify(savedState));
      
      const TestComponent = () => {
        const { currentTurn } = useSimulation();
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
      // Should restore the saved turn value
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 42');
      });
    });

    test('should handle corrupted localStorage data gracefully', async () => {
      // Set corrupted data in localStorage
      localStorageMock.setItem('worldState', 'invalid json {');
      
      const TestComponent = () => {
        const { currentTurn } = useSimulation();
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
      // Should default to turn 0 when localStorage is corrupted
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
      
      // Should have cleared the corrupted data
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('worldState');
    });

    test('should initialize to default state when no localStorage data exists', async () => {
      // Ensure localStorage is empty
      localStorageMock.clear();
      
      const TestComponent = () => {
        const { currentTurn } = useSimulation();
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
      // Should default to turn 0 when no saved state exists
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
    });
  });

  describe('Test 3: Synchronization Between Multiple UI Components (Requirement 3.3)', () => {
    test('should synchronize turn counter across multiple components', async () => {
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

    test('should maintain synchronization when state changes', async () => {
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

    test('should update all components simultaneously after reset', async () => {
      // Start with a saved state
      const savedState = {
        time: 25,
        nodes: [],
        npcs: [],
        resources: {}
      };
      localStorageMock.setItem('worldState', JSON.stringify(savedState));
      
      const MultiCounterComponent = () => {
        const { currentTurn, resetSimulation } = useSimulation();
        return (
          <div>
            <div data-testid="counter-1"><TurnCounter currentTurn={currentTurn} /></div>
            <div data-testid="counter-2">Turn: {currentTurn}</div>
            <div data-testid="counter-3">Current Turn: {currentTurn}</div>
            <button data-testid="reset-btn" onClick={resetSimulation}>Reset</button>
          </div>
        );
      };
      
      render(<MultiCounterComponent />);
      
      // Verify initial state
      await waitFor(() => {
        expect(screen.getByTestId('counter-1')).toHaveTextContent('Turn: 25');
      });
      
      // Reset simulation
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      // All components should reset to 0 simultaneously
      await waitFor(() => {
        expect(screen.getByTestId('counter-1')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('counter-2')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('counter-3')).toHaveTextContent('Current Turn: 0');
      });
    });
  });

  describe('Test 4: Real-time Updates During Simulation Execution', () => {
    test('should handle simulation timing correctly', async () => {
      jest.useFakeTimers();
      
      const TestComponent = () => {
        const { currentTurn, isRunning, startSimulation, stopSimulation } = useSimulation();
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <div data-testid="status">{isRunning ? 'Running' : 'Stopped'}</div>
            <button data-testid="start-btn" onClick={startSimulation}>Start</button>
            <button data-testid="stop-btn" onClick={stopSimulation}>Stop</button>
          </div>
        );
      };

      render(<TestComponent />);
      
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
      
      jest.useRealTimers();
    });

    test('should maintain state consistency during rapid operations', async () => {
      const TestComponent = () => {
        const { currentTurn, startSimulation, stopSimulation, resetSimulation } = useSimulation();
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <button data-testid="start-btn" onClick={startSimulation}>Start</button>
            <button data-testid="stop-btn" onClick={stopSimulation}>Stop</button>
            <button data-testid="reset-btn" onClick={resetSimulation}>Reset</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Perform rapid operations
      fireEvent.click(screen.getByTestId('start-btn'));
      fireEvent.click(screen.getByTestId('stop-btn'));
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      // Should maintain consistent state
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
    });
  });

  describe('Test 5: Full WorldHistorySimInterface Integration (Requirement 4.1)', () => {
    test('should integrate turn counter properly in full interface', async () => {
      render(<WorldHistorySimInterface />);
      
      // Should find turn counter in the interface
      await waitFor(() => {
        expect(screen.getByText(/Turn:/)).toBeInTheDocument();
      });
      
      // Should show initial turn 0
      expect(screen.getByText(/Turn: 0/)).toBeInTheDocument();
    });

    test('should maintain turn counter visibility during interface navigation', async () => {
      render(<WorldHistorySimInterface />);
      
      // Find turn counter
      await waitFor(() => {
        expect(screen.getByText(/Turn: 0/)).toBeInTheDocument();
      });
      
      // Navigate to different tabs
      const timelineTab = screen.getByText('timeline');
      fireEvent.click(timelineTab);
      
      // Turn counter should still be visible
      expect(screen.getByText(/Turn: 0/)).toBeInTheDocument();
      
      const charactersTab = screen.getByText('characters');
      fireEvent.click(charactersTab);
      
      // Turn counter should still be visible
      expect(screen.getByText(/Turn: 0/)).toBeInTheDocument();
      
      const settlementsTab = screen.getByText('settlements');
      fireEvent.click(settlementsTab);
      
      // Turn counter should still be visible
      expect(screen.getByText(/Turn: 0/)).toBeInTheDocument();
    });

    test('should handle interface control interactions', async () => {
      render(<WorldHistorySimInterface />);
      
      // Find simulation controls
      const startButton = screen.getByText(/Start.*Simulation/);
      expect(startButton).toBeInTheDocument();
      
      // Click start button
      fireEvent.click(startButton);
      
      // Should change to pause button
      await waitFor(() => {
        expect(screen.getByText(/Pause.*Simulation/)).toBeInTheDocument();
      });
      
      // Turn counter should still be visible
      expect(screen.getByText(/Turn:/)).toBeInTheDocument();
    });
  });

  describe('Test 6: Error Handling and Edge Cases', () => {
    test('should handle invalid turn values gracefully', async () => {
      // Mock SimulationService to return invalid turn
      const originalGetCurrentTurn = SimulationService.getCurrentTurn;
      SimulationService.getCurrentTurn = jest.fn(() => NaN);
      
      const TestComponent = () => {
        const { currentTurn } = useSimulation();
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
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
      
      const TestComponent = () => {
        const { currentTurn, stepSimulation } = useSimulation();
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <button data-testid="step-btn" onClick={stepSimulation}>Step</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Try to step - should not crash
      fireEvent.click(screen.getByTestId('step-btn'));
      
      // Should still display a valid turn counter
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent(/Turn: \d+/);
      });
      
      // Restore original method
      SimulationService.step = originalStep;
    });

    test('should handle various invalid turn counter values', async () => {
      const originalGetCurrentTurn = SimulationService.getCurrentTurn;
      
      // Test with null
      SimulationService.getCurrentTurn = jest.fn(() => null);
      const TestComponent1 = () => {
        const { currentTurn } = useSimulation();
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };
      render(<TestComponent1 />);
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: --');
      });
      
      // Test with undefined
      SimulationService.getCurrentTurn = jest.fn(() => undefined);
      const TestComponent2 = () => {
        const { currentTurn } = useSimulation();
        return <div data-testid="turn-counter-2"><TurnCounter currentTurn={currentTurn} /></div>;
      };
      render(<TestComponent2 />);
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter-2')).toHaveTextContent('Turn: --');
      });
      
      // Test with negative number
      SimulationService.getCurrentTurn = jest.fn(() => -5);
      const TestComponent3 = () => {
        const { currentTurn } = useSimulation();
        return <div data-testid="turn-counter-3"><TurnCounter currentTurn={currentTurn} /></div>;
      };
      render(<TestComponent3 />);
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter-3')).toHaveTextContent('Turn: --');
      });
      
      // Restore original method
      SimulationService.getCurrentTurn = originalGetCurrentTurn;
    });

    test('should continue operating despite localStorage failures', async () => {
      // Mock localStorage.setItem to fail
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const TestComponent = () => {
        const { currentTurn, startSimulation } = useSimulation();
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <button data-testid="start-btn" onClick={startSimulation}>Start</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Start simulation - should continue working despite save failures
      fireEvent.click(screen.getByTestId('start-btn'));
      
      // Turn counter should still be functional
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent(/Turn: \d+/);
      });
      
      // Restore original method
      localStorageMock.setItem = originalSetItem;
    });
  });
});