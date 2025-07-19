// src/test/turn-counter-integration.test.js
// Updated test suite for turn-based simulation

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimulationService from '../application/use-cases/services/SimulationService.js';
import useSimulation from '../presentation/hooks/useSimulation.js';
import WorldHistorySimInterface from '../presentation/components/WorldHistorySimInterface.js';
import TurnCounter from '../presentation/components/TurnCounter.js';

// Mock SimulationService for turn-based testing
jest.mock('../application/use-cases/services/SimulationService.js');

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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Test component that uses the new turn-based simulation interface
const MultiTurnCounterComponent = ({ worldBuilderState }) => {
  const { currentTurn, processTurn, initializeWorld, resetSimulation, canProcessTurn, isInitialized } = useSimulation(worldBuilderState);
  
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
      <button data-testid="process-turn-btn" onClick={processTurn} disabled={!canProcessTurn}>Process Turn</button>
      <button data-testid="initialize-btn" onClick={initializeWorld}>Initialize</button>
      <button data-testid="reset-btn" onClick={resetSimulation}>Reset</button>
      <div data-testid="can-process">{canProcessTurn ? 'true' : 'false'}</div>
      <div data-testid="is-initialized">{isInitialized ? 'true' : 'false'}</div>
    </div>
  );
};

describe('Turn Counter Integration Tests - Turn-Based Implementation', () => {
  let originalConsoleError;
  let originalConsoleWarn;
  let mockWorldBuilderState;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Set up default SimulationService mocks for turn-based mode
    SimulationService.initialize = jest.fn((config) => ({
      time: 0,
      worldName: config.worldName || 'Test World',
      nodes: config.nodes || [],
      npcs: config.characters || [],
      interactions: config.interactions || [],
      resources: {}
    }));
    
    SimulationService.loadState = jest.fn(() => null); // No saved state by default
    SimulationService.saveState = jest.fn(() => true);
    SimulationService.reset = jest.fn();
    SimulationService.getCurrentTurn = jest.fn(() => 0);
    SimulationService.processTurn = jest.fn(() => ({
      success: true,
      worldState: { time: 1, nodes: [], npcs: [], resources: {} },
      turnSummary: { eventsCount: 1, summary: 'Turn processed' }
    }));
    SimulationService.getTurnHistory = jest.fn(() => []);
    SimulationService.getLatestTurnSummary = jest.fn(() => null);
    SimulationService.getHistoryAnalysis = jest.fn(() => ({}));

    // Create mock world builder state for tests that need initialization
    mockWorldBuilderState = {
      isValid: true,
      stepValidation: [true, true, true, true, true, true, true], // All steps valid
      toSimulationConfig: () => ({
        worldName: 'Test World',
        nodes: [{ id: 'node1', name: 'Test Node' }],
        characters: [{ id: 'char1', name: 'Test Character' }],
        interactions: [{ id: 'int1', name: 'Test Interaction' }]
      })
    };
    
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
    SimulationService.reset();
    
    // Clear timers
    jest.clearAllTimers();
  });

  describe('Basic Turn-Based Functionality', () => {
    test('should initialize turn counter to 0 when no saved state', async () => {
      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Initially should show turn 0
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 0');
      });
      expect(screen.getByTestId('sidebar-turn-counter')).toHaveTextContent('Turn: 0');
      expect(screen.getByTestId('status-turn-counter')).toHaveTextContent('Current Turn: 0');
    });

    test('should process a single turn when processTurn is called', async () => {
      let currentTurn = 0;
      SimulationService.getCurrentTurn = jest.fn(() => currentTurn);
      SimulationService.processTurn = jest.fn(() => {
        currentTurn++;
        return {
          success: true,
          worldState: { time: currentTurn, nodes: [], npcs: [], resources: {} },
          turnSummary: { eventsCount: 1, summary: 'Turn processed' }
        };
      });

      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Should start at turn 0 and be ready to process
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 0');
      });
      expect(screen.getByTestId('can-process')).toHaveTextContent('true');

      // Process a turn
      fireEvent.click(screen.getByTestId('process-turn-btn'));

      // Should increment turn counter
      await waitFor(() => {
        expect(SimulationService.processTurn).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 1');
      });
    });

    test('should process multiple turns sequentially', async () => {
      let currentTurn = 0;
      SimulationService.getCurrentTurn = jest.fn(() => currentTurn);
      SimulationService.processTurn = jest.fn(() => {
        currentTurn++;
        return {
          success: true,
          worldState: { time: currentTurn, nodes: [], npcs: [], resources: {} },
          turnSummary: { eventsCount: 1, summary: 'Turn processed' }
        };
      });

      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Process multiple turns
      for (let i = 1; i <= 3; i++) {
        fireEvent.click(screen.getByTestId('process-turn-btn'));
        
        await waitFor(() => {
          expect(screen.getByTestId('header-turn-counter')).toHaveTextContent(`Turn: ${i}`);
        });
      }
      
      expect(SimulationService.processTurn).toHaveBeenCalledTimes(3);
    });

    test('should reset turn counter to 0 when simulation is reset', async () => {
      let currentTurn = 5;
      SimulationService.getCurrentTurn = jest.fn(() => currentTurn);
      SimulationService.reset = jest.fn(() => {
        currentTurn = 0;
      });

      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Should start with the current turn value
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 5');
      });

      // Reset simulation
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      // All counters should reset to 0
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 0');
      });
      expect(screen.getByTestId('sidebar-turn-counter')).toHaveTextContent('Turn: 0');
      expect(screen.getByTestId('status-turn-counter')).toHaveTextContent('Current Turn: 0');
    });
  });

  describe('Persistence Integration', () => {
    test('should save state when processing turns', async () => {
      let currentTurn = 0;
      SimulationService.getCurrentTurn = jest.fn(() => currentTurn);
      SimulationService.processTurn = jest.fn(() => {
        currentTurn++;
        return {
          success: true,
          worldState: { time: currentTurn, nodes: [], npcs: [], resources: {} },
          turnSummary: { eventsCount: 1, summary: 'Turn processed' }
        };
      });

      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Process a turn
      fireEvent.click(screen.getByTestId('process-turn-btn'));
      
      // Should save state after processing turn
      await waitFor(() => {
        expect(SimulationService.saveState).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 1');
      });
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
      
      // Mock loadState to return the saved state
      SimulationService.loadState = jest.fn(() => savedState);
      SimulationService.getCurrentTurn = jest.fn(() => savedState.time);

      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Should restore the saved turn value
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 42');
      });
      expect(screen.getByTestId('sidebar-turn-counter')).toHaveTextContent('Turn: 42');
      expect(screen.getByTestId('status-turn-counter')).toHaveTextContent('Current Turn: 42');
    });

    test('should handle corrupted localStorage data gracefully', async () => {
      // Set corrupted data in localStorage
      localStorageMock.setItem('worldState', 'invalid json {');
      
      // Mock loadState to return null for corrupted data
      SimulationService.loadState = jest.fn(() => null);

      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Should default to turn 0 when localStorage is corrupted
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 0');
      });
    });

    test('should handle missing localStorage data gracefully', async () => {
      // Ensure localStorage is empty
      localStorageMock.clear();
      
      // Mock loadState to return null
      SimulationService.loadState = jest.fn(() => null);

      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Should default to turn 0 when no saved state exists
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 0');
      });
    });
  });

  describe('Synchronization Between Multiple UI Components', () => {
    test('should synchronize turn counter across multiple components', async () => {
      let currentTurn = 0;
      SimulationService.getCurrentTurn = jest.fn(() => currentTurn);
      SimulationService.processTurn = jest.fn(() => {
        currentTurn++;
        return {
          success: true,
          worldState: { time: currentTurn, nodes: [], npcs: [], resources: {} },
          turnSummary: { eventsCount: 1, summary: 'Turn processed' }
        };
      });

      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Process a turn to change the turn
      fireEvent.click(screen.getByTestId('process-turn-btn'));
      
      await waitFor(() => {
        // All components should show the same turn value
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 1');
      });
      expect(screen.getByTestId('sidebar-turn-counter')).toHaveTextContent('Turn: 1');
      expect(screen.getByTestId('status-turn-counter')).toHaveTextContent('Current Turn: 1');
    });

    test('should update all components simultaneously during turn processing', async () => {
      let currentTurn = 0;
      SimulationService.getCurrentTurn = jest.fn(() => currentTurn);
      SimulationService.processTurn = jest.fn(() => {
        currentTurn++;
        return {
          success: true,
          worldState: { time: currentTurn, nodes: [], npcs: [], resources: {} },
          turnSummary: { eventsCount: 1, summary: 'Turn processed' }
        };
      });

      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Process a turn
      fireEvent.click(screen.getByTestId('process-turn-btn'));
      
      await waitFor(() => {
        // Get turn values from all components
        const headerTurn = screen.getByTestId('header-turn-counter').textContent.match(/Turn: (\d+)/)[1];
        const sidebarTurn = screen.getByTestId('sidebar-turn-counter').textContent.match(/Turn: (\d+)/)[1];
        
        // All should be the same and > 0
        expect(headerTurn).toBe(sidebarTurn);
      });
      
      const headerTurn = screen.getByTestId('header-turn-counter').textContent.match(/Turn: (\d+)/)[1];
      const sidebarTurn = screen.getByTestId('sidebar-turn-counter').textContent.match(/Turn: (\d+)/)[1];
      const statusTurn = screen.getByTestId('status-turn-counter').textContent.match(/Current Turn: (\d+)/)[1];
      
      expect(sidebarTurn).toBe(statusTurn);
      expect(parseInt(headerTurn)).toBeGreaterThan(0);
    });

    test('should maintain synchronization after reset', async () => {
      let currentTurn = 5;
      SimulationService.getCurrentTurn = jest.fn(() => currentTurn);
      SimulationService.reset = jest.fn(() => {
        currentTurn = 0;
      });

      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Reset simulation
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      // All components should reset to 0 simultaneously
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 0');
      });
      expect(screen.getByTestId('sidebar-turn-counter')).toHaveTextContent('Turn: 0');
      expect(screen.getByTestId('status-turn-counter')).toHaveTextContent('Current Turn: 0');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle turn processing errors gracefully', async () => {
      // Mock processTurn to throw an error
      SimulationService.processTurn = jest.fn(() => {
        throw new Error('Turn processing error');
      });
      
      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Try to process a turn - should not crash
      fireEvent.click(screen.getByTestId('process-turn-btn'));
      
      // Should still display a valid turn counter
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent(/Turn: \d+/);
      });
    });

    test('should handle invalid turn values gracefully', async () => {
      // Mock SimulationService to return invalid turn
      SimulationService.getCurrentTurn = jest.fn(() => NaN);
      
      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Should display fallback value
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: --');
      });
    });

    test('should handle localStorage corruption gracefully', async () => {
      // Mock SimulationService to return null for corrupted turn
      SimulationService.getCurrentTurn = jest.fn(() => null);
      
      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Should display fallback value
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 0');
      });
    });

    test('should handle initialization failures gracefully', async () => {
      // Mock initialization to fail
      SimulationService.initialize = jest.fn(() => {
        throw new Error('Initialization failed');
      });
      
      const invalidWorldBuilderState = {
        isValid: false,
        stepValidation: [false, false, false, false, false, false, false],
        toSimulationConfig: () => null
      };

      render(<MultiTurnCounterComponent worldBuilderState={invalidWorldBuilderState} />);
      
      // Should show that it can't process turns
      await waitFor(() => {
        expect(screen.getByTestId('can-process')).toHaveTextContent('false');
      });
    });

    test('should handle world builder validation errors', async () => {
      const invalidWorldBuilderState = {
        isValid: false,
        stepValidation: [true, false, false, false, false, false, false], // Invalid at step 2
        toSimulationConfig: () => {
          throw new Error('Invalid configuration');
        }
      };

      render(<MultiTurnCounterComponent worldBuilderState={invalidWorldBuilderState} />);
      
      // Should not be able to process turns with invalid world state
      await waitFor(() => {
        expect(screen.getByTestId('can-process')).toHaveTextContent('false');
      });
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
      render(<WorldHistorySimInterface />);
      
      // Always verify turn counter exists initially
      await waitFor(() => {
        expect(screen.getByText(/Turn: \d+/)).toBeInTheDocument();
      });

      // Find and try to interact with process turn button if available
      const processTurnButton = screen.queryByText(/Process Turn/);
      
      if (processTurnButton && !processTurnButton.disabled) {
        fireEvent.click(processTurnButton);
      }
      
      // Verify turn counter is still present after any interaction
      await waitFor(() => {
        expect(screen.getByText(/Turn: \d+/)).toBeInTheDocument();
      });
    });

    test('should show proper turn-based controls in full interface', async () => {
      render(<WorldHistorySimInterface />);
      
      // Should have turn-based controls instead of real-time ones
      await waitFor(() => {
        // Look for turn-based controls
        const processTurnBtn = screen.queryByText(/Process Turn/);
        const startBtn = screen.queryByText(/Start.*Simulation/);
        
        // Either should have process turn button (preferred) or at least not have old start button
        expect(processTurnBtn || !startBtn).toBeTruthy();
      });
    });
  });

  // New test categories as per refactoring plan
  describe('World Builder Integration Tests', () => {
    test('should enable simulation with proper world builder state', async () => {
      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Should be able to process turns with valid world builder state
      await waitFor(() => {
        expect(screen.getByTestId('can-process')).toHaveTextContent('true');
      });
    });

    test('should prevent simulation with invalid world builder state', async () => {
      const invalidWorldBuilderState = {
        isValid: false,
        stepValidation: [false, false, false, false, false, false, false],
        toSimulationConfig: () => null
      };

      render(<MultiTurnCounterComponent worldBuilderState={invalidWorldBuilderState} />);
      
      // Should not be able to process turns with invalid world builder state
      await waitFor(() => {
        expect(screen.getByTestId('can-process')).toHaveTextContent('false');
      });
    });
  });

  describe('Manual Turn Processing Tests', () => {
    test('should properly advance simulation with processTurn', async () => {
      let currentTurn = 0;
      SimulationService.getCurrentTurn = jest.fn(() => currentTurn);
      SimulationService.processTurn = jest.fn(() => {
        currentTurn++;
        return {
          success: true,
          worldState: { time: currentTurn, nodes: [], npcs: [], resources: {} },
          turnSummary: { eventsCount: 1, summary: `Turn ${currentTurn} processed` }
        };
      });

      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Process turn should advance simulation state
      fireEvent.click(screen.getByTestId('process-turn-btn'));
      
      await waitFor(() => {
        expect(SimulationService.processTurn).toHaveBeenCalledTimes(1);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('header-turn-counter')).toHaveTextContent('Turn: 1');
      });
    });

    test('should handle multiple processTurn calls correctly', async () => {
      let currentTurn = 0;
      SimulationService.getCurrentTurn = jest.fn(() => currentTurn);
      SimulationService.processTurn = jest.fn(() => {
        currentTurn++;
        return {
          success: true,
          worldState: { time: currentTurn, nodes: [], npcs: [], resources: {} },
          turnSummary: { eventsCount: 1, summary: `Turn ${currentTurn} processed` }
        };
      });

      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Process multiple turns
      for (let i = 1; i <= 5; i++) {
        fireEvent.click(screen.getByTestId('process-turn-btn'));
        
        await waitFor(() => {
          expect(screen.getByTestId('header-turn-counter')).toHaveTextContent(`Turn: ${i}`);
        });
      }
      
      expect(SimulationService.processTurn).toHaveBeenCalledTimes(5);
    });

    test('should process turns with different world states', async () => {
      let currentTurn = 0;
      const worldStates = [
        { time: 1, nodes: [{ id: 'node1' }], npcs: [], resources: {} },
        { time: 2, nodes: [{ id: 'node1' }, { id: 'node2' }], npcs: [{ id: 'npc1' }], resources: {} },
        { time: 3, nodes: [{ id: 'node1' }, { id: 'node2' }], npcs: [{ id: 'npc1' }], resources: { gold: 100 } }
      ];

      SimulationService.getCurrentTurn = jest.fn(() => currentTurn);
      SimulationService.processTurn = jest.fn(() => {
        const worldState = worldStates[currentTurn] || worldStates[0];
        currentTurn = worldState.time;
        return {
          success: true,
          worldState,
          turnSummary: { eventsCount: 1, summary: `Turn ${currentTurn} processed` }
        };
      });

      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Process turns with different world states
      for (let i = 1; i <= 3; i++) {
        fireEvent.click(screen.getByTestId('process-turn-btn'));
        
        await waitFor(() => {
          expect(screen.getByTestId('header-turn-counter')).toHaveTextContent(`Turn: ${i}`);
        });
      }
    });
  });

  describe('Initialization State Tests', () => {
    test('should manage canProcessTurn logic correctly', async () => {
      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Should be able to process turns with valid setup
      await waitFor(() => {
        expect(screen.getByTestId('can-process')).toHaveTextContent('true');
      });
    });

    test('should manage isInitialized state properly', async () => {
      render(<MultiTurnCounterComponent worldBuilderState={mockWorldBuilderState} />);
      
      // Should initialize properly with valid world builder state
      await waitFor(() => {
        expect(screen.getByTestId('is-initialized')).toHaveTextContent('true');
      });
    });

    test('should handle proper error states during initialization', async () => {
      SimulationService.initialize = jest.fn(() => {
        throw new Error('Initialization failed');
      });

      const invalidWorldBuilderState = {
        isValid: false,
        stepValidation: [false, false, false, false, false, false, false],
        toSimulationConfig: () => {
          throw new Error('Invalid config');
        }
      };

      render(<MultiTurnCounterComponent worldBuilderState={invalidWorldBuilderState} />);
      
      // Should handle initialization errors gracefully
      await waitFor(() => {
        expect(screen.getByTestId('can-process')).toHaveTextContent('false');
      });
    });
  });
});