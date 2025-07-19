// src/test/turn-counter-integration-working.test.js
// Working integration tests for turn counter end-to-end flow
// Updated for turn-based simulation

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimulationService from '../application/use-cases/services/SimulationService.js';
import useSimulation from '../presentation/hooks/useSimulation.js';
import TurnCounter from '../presentation/components/TurnCounter.js';
import WorldHistorySimInterface from '../presentation/components/WorldHistorySimInterface.js';

// Mock SimulationService for turn-based behavior
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

describe('Turn Counter Integration Tests - Working Turn-Based Implementation', () => {
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

    // Create mock world builder state
    mockWorldBuilderState = {
      isValid: true,
      stepValidation: [true, true, true, true, true, true, true],
      toSimulationConfig: () => ({
        worldName: 'Test World',
        nodes: [{ id: 'node1', name: 'Test Node' }],
        characters: [{ id: 'char1', name: 'Test Character' }],
        interactions: [{ id: 'int1', name: 'Test Interaction' }]
      })
    };
    
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
    SimulationService.reset();
    
    // Clear timers
    jest.clearAllTimers();
  });

  describe('Basic Turn Counter Functionality', () => {
    test('should initialize turn counter to 0', async () => {
      const TestComponent = () => {
        const { currentTurn } = useSimulation(mockWorldBuilderState);
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
    });

    test('should display turn counter with proper formatting', async () => {
      const TestComponent = () => {
        const { currentTurn } = useSimulation(mockWorldBuilderState);
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        const turnCounter = screen.getByTestId('turn-counter');
        expect(turnCounter).toHaveTextContent(/Turn: \d+/);
      });
    });

    test('should handle turn counter state changes', async () => {
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

      const TestComponent = () => {
        const { currentTurn, processTurn, canProcessTurn, isInitialized } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <div data-testid="status">{isInitialized ? 'Initialized' : 'Not Initialized'}</div>
            <button data-testid="process-btn" onClick={processTurn} disabled={!canProcessTurn}>
              Process Turn
            </button>
            <div data-testid="can-process">{canProcessTurn ? 'true' : 'false'}</div>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Should be initialized and ready to process
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('Initialized');
      });
      expect(screen.getByTestId('can-process')).toHaveTextContent('true');

      // Process a turn
      fireEvent.click(screen.getByTestId('process-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 1');
      });
    });

    test('should handle invalid turn values gracefully', async () => {
      SimulationService.getCurrentTurn = jest.fn(() => NaN);

      const TestComponent = () => {
        const { currentTurn } = useSimulation(mockWorldBuilderState);
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: --');
      });
    });

    test('should handle null turn values gracefully', async () => {
      SimulationService.getCurrentTurn = jest.fn(() => null);

      const TestComponent = () => {
        const { currentTurn } = useSimulation(mockWorldBuilderState);
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
    });
  });

  describe('Turn Processing Tests', () => {
    test('should process single turn correctly', async () => {
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

      const TestComponent = () => {
        const { currentTurn, processTurn } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <button data-testid="process-btn" onClick={processTurn}>Process Turn</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Process turn
      fireEvent.click(screen.getByTestId('process-btn'));
      
      await waitFor(() => {
        expect(SimulationService.processTurn).toHaveBeenCalledTimes(1);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 1');
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
          turnSummary: { eventsCount: 1, summary: `Turn ${currentTurn} processed` }
        };
      });

      const TestComponent = () => {
        const { currentTurn, processTurn } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <button data-testid="process-btn" onClick={processTurn}>Process Turn</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Process 3 turns
      for (let i = 1; i <= 3; i++) {
        fireEvent.click(screen.getByTestId('process-btn'));
        
        await waitFor(() => {
          expect(screen.getByTestId('turn-counter')).toHaveTextContent(`Turn: ${i}`);
        });
      }
      
      expect(SimulationService.processTurn).toHaveBeenCalledTimes(3);
    });

    test('should handle processing errors gracefully', async () => {
      SimulationService.processTurn = jest.fn(() => {
        throw new Error('Processing failed');
      });

      const TestComponent = () => {
        const { currentTurn, processTurn } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <button data-testid="process-btn" onClick={processTurn}>Process Turn</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Should not crash when processing fails
      fireEvent.click(screen.getByTestId('process-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent(/Turn: \d+/);
      });
    });
  });

  describe('Persistence Integration Tests', () => {
    test('should restore turn counter from localStorage when available', async () => {
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

      const TestComponent = () => {
        const { currentTurn } = useSimulation(mockWorldBuilderState);
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
      // Should restore the saved turn value
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 42');
      });
    });

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

      const TestComponent = () => {
        const { currentTurn, processTurn } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <button data-testid="process-btn" onClick={processTurn}>Process Turn</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Process turn
      fireEvent.click(screen.getByTestId('process-btn'));
      
      await waitFor(() => {
        expect(SimulationService.saveState).toHaveBeenCalled();
      });
    });

    test('should handle corrupted localStorage data gracefully', async () => {
      // Set corrupted data in localStorage
      localStorageMock.setItem('worldState', 'invalid json {');
      
      // Mock loadState to return null for corrupted data
      SimulationService.loadState = jest.fn(() => null);

      const TestComponent = () => {
        const { currentTurn } = useSimulation(mockWorldBuilderState);
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
      // Should default to turn 0 when localStorage is corrupted
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
    });
  });

  describe('Reset Functionality Tests', () => {
    test('should reset turn counter to 0 when simulation is reset', async () => {
      let currentTurn = 10;
      SimulationService.getCurrentTurn = jest.fn(() => currentTurn);
      SimulationService.reset = jest.fn(() => {
        currentTurn = 0;
      });

      const TestComponent = () => {
        const { currentTurn, resetSimulation } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <button data-testid="reset-btn" onClick={resetSimulation}>Reset</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Should start with the current turn value
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 10');
      });

      // Reset simulation
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
    });

    test('should reset and allow processing again', async () => {
      let currentTurn = 5;
      SimulationService.getCurrentTurn = jest.fn(() => currentTurn);
      SimulationService.reset = jest.fn(() => {
        currentTurn = 0;
      });
      SimulationService.processTurn = jest.fn(() => {
        currentTurn++;
        return {
          success: true,
          worldState: { time: currentTurn, nodes: [], npcs: [], resources: {} },
          turnSummary: { eventsCount: 1, summary: 'Turn processed' }
        };
      });

      const TestComponent = () => {
        const { currentTurn, resetSimulation, processTurn } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <button data-testid="reset-btn" onClick={resetSimulation}>Reset</button>
            <button data-testid="process-btn" onClick={processTurn}>Process Turn</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Reset first
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });

      // Then process turn
      fireEvent.click(screen.getByTestId('process-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 1');
      });
    });
  });

  describe('Multi-Component Synchronization Tests', () => {
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

      const MultiCounterComponent = () => {
        const { currentTurn, processTurn } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="counter-1"><TurnCounter currentTurn={currentTurn} /></div>
            <div data-testid="counter-2">Turn: {currentTurn}</div>
            <div data-testid="counter-3">Current Turn: {currentTurn}</div>
            <button data-testid="process-btn" onClick={processTurn}>Process Turn</button>
          </div>
        );
      };

      render(<MultiCounterComponent />);
      
      // Process a turn
      fireEvent.click(screen.getByTestId('process-btn'));
      
      // All should update together
      await waitFor(() => {
        expect(screen.getByTestId('counter-1')).toHaveTextContent('Turn: 1');
      });
      expect(screen.getByTestId('counter-2')).toHaveTextContent('Turn: 1');
      expect(screen.getByTestId('counter-3')).toHaveTextContent('Current Turn: 1');
    });
  });

  describe('World Builder Integration Tests', () => {
    test('should enable processing with valid world builder state', async () => {
      const TestComponent = () => {
        const { canProcessTurn, isInitialized } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="can-process">{canProcessTurn ? 'true' : 'false'}</div>
            <div data-testid="is-initialized">{isInitialized ? 'true' : 'false'}</div>
          </div>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('is-initialized')).toHaveTextContent('true');
      });
      expect(screen.getByTestId('can-process')).toHaveTextContent('true');
    });

    test('should prevent processing with invalid world builder state', async () => {
      const invalidWorldBuilderState = {
        isValid: false,
        stepValidation: [false, false, false, false, false, false, false],
        toSimulationConfig: () => null
      };

      const TestComponent = () => {
        const { canProcessTurn } = useSimulation(invalidWorldBuilderState);
        return <div data-testid="can-process">{canProcessTurn ? 'true' : 'false'}</div>;
      };

      render(<TestComponent />);
      
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
    });

    test('should handle interface interactions', async () => {
      render(<WorldHistorySimInterface />);
      
      // Find any turn-related controls
      const processTurnBtn = screen.queryByText(/Process Turn/);
      
      if (processTurnBtn && !processTurnBtn.disabled) {
        fireEvent.click(processTurnBtn);
      }
      
      // Turn counter should still be present
      await waitFor(() => {
        expect(screen.getByText(/Turn: \d+/)).toBeInTheDocument();
      });
    });
  });
});
