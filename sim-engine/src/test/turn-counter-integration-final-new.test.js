// src/test/turn-counter-integration-final.test.js
// Integration tests for end-to-end turn counter flow
// Updated for turn-based simulation

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimulationService from '../application/use-cases/services/SimulationService.js';
import useSimulation from '../presentation/hooks/useSimulation.js';
import TurnCounter from '../presentation/components/TurnCounter.js';
import WorldHistorySimInterface from '../presentation/components/WorldHistorySimInterface.js';

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

describe('Turn Counter Integration Tests - Final End-to-End (Turn-Based)', () => {
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
    
    SimulationService.loadState = jest.fn(() => null);
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

  describe('Core Turn-Based Functionality', () => {
    test('should initialize simulation with turn 0', async () => {
      const TestComponent = () => {
        const { currentTurn, isInitialized } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <div data-testid="initialized">{isInitialized ? 'true' : 'false'}</div>
          </div>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
      expect(screen.getByTestId('initialized')).toHaveTextContent('true');
    });

    test('should process single turn correctly', async () => {
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
        const { currentTurn, processTurn, canProcessTurn } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <button data-testid="process-btn" onClick={processTurn} disabled={!canProcessTurn}>
              Process Turn
            </button>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Process turn
      fireEvent.click(screen.getByTestId('process-btn'));
      
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
      
      // Process 5 turns
      for (let i = 1; i <= 5; i++) {
        fireEvent.click(screen.getByTestId('process-btn'));
        
        await waitFor(() => {
          expect(screen.getByTestId('turn-counter')).toHaveTextContent(`Turn: ${i}`);
        });
      }
    });

    test('should reset simulation correctly', async () => {
      let currentTurn = 7;
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
      
      // Should start with turn 7
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 7');
      });

      // Reset
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
    });
  });

  describe('State Management and Persistence', () => {
    test('should save state after processing turns', async () => {
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

    test('should restore from saved state', async () => {
      const savedState = {
        time: 42,
        nodes: [],
        npcs: [],
        resources: {}
      };
      
      localStorageMock.setItem('worldState', JSON.stringify(savedState));
      SimulationService.loadState = jest.fn(() => savedState);
      SimulationService.getCurrentTurn = jest.fn(() => savedState.time);

      const TestComponent = () => {
        const { currentTurn } = useSimulation(mockWorldBuilderState);
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 42');
      });
    });

    test('should handle corrupted save data', async () => {
      localStorageMock.setItem('worldState', 'invalid json data');
      SimulationService.loadState = jest.fn(() => null);
      
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

  describe('Error Handling', () => {
    test('should handle invalid turn values', async () => {
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

    test('should handle null turn values', async () => {
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

    test('should handle processing errors', async () => {
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
      
      // Should not crash
      fireEvent.click(screen.getByTestId('process-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent(/Turn: \d+/);
      });
    });

    test('should handle invalid world builder state', async () => {
      const invalidWorldBuilderState = {
        isValid: false,
        stepValidation: [false, false, false, false, false, false, false],
        toSimulationConfig: () => null
      };

      const TestComponent = () => {
        const { currentTurn, canProcessTurn } = useSimulation(invalidWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <div data-testid="can-process">{canProcessTurn ? 'true' : 'false'}</div>
          </div>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('can-process')).toHaveTextContent('false');
      });
    });
  });

  describe('UI Component Synchronization', () => {
    test('should synchronize multiple turn counters', async () => {
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
      
      // Process turn
      fireEvent.click(screen.getByTestId('process-btn'));
      
      // All should update together
      await waitFor(() => {
        expect(screen.getByTestId('counter-1')).toHaveTextContent('Turn: 1');
      });
      expect(screen.getByTestId('counter-2')).toHaveTextContent('Turn: 1');
      expect(screen.getByTestId('counter-3')).toHaveTextContent('Current Turn: 1');
    });

    test('should maintain synchronization after reset', async () => {
      let currentTurn = 8;
      SimulationService.getCurrentTurn = jest.fn(() => currentTurn);
      SimulationService.reset = jest.fn(() => {
        currentTurn = 0;
      });

      const MultiCounterComponent = () => {
        const { currentTurn, resetSimulation } = useSimulation(mockWorldBuilderState);
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
      
      // Start with turn 8
      await waitFor(() => {
        expect(screen.getByTestId('counter-1')).toHaveTextContent('Turn: 8');
      });
      expect(screen.getByTestId('counter-2')).toHaveTextContent('Turn: 8');
      expect(screen.getByTestId('counter-3')).toHaveTextContent('Current Turn: 8');

      // Reset - all should go to 0
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('counter-1')).toHaveTextContent('Turn: 0');
      });
      expect(screen.getByTestId('counter-2')).toHaveTextContent('Turn: 0');
      expect(screen.getByTestId('counter-3')).toHaveTextContent('Current Turn: 0');
    });
  });

  describe('WorldHistorySimInterface Integration', () => {
    test('should display turn counter in full interface', async () => {
      render(<WorldHistorySimInterface />);
      
      await waitFor(() => {
        expect(screen.getByText(/Turn:/)).toBeInTheDocument();
      });
    });

    test('should handle interface interactions', async () => {
      render(<WorldHistorySimInterface />);
      
      // Find any process turn buttons
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

  describe('World Builder Integration', () => {
    test('should enable processing with valid world builder state', async () => {
      const TestComponent = () => {
        const { canProcessTurn } = useSimulation(mockWorldBuilderState);
        return <div data-testid="can-process">{canProcessTurn ? 'true' : 'false'}</div>;
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('can-process')).toHaveTextContent('true');
      });
    });

    test('should prevent processing with invalid world builder state', async () => {
      const invalidWorldBuilderState = {
        isValid: false,
        stepValidation: [false, true, false, true, false, true, false],
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

    test('should handle world builder configuration errors', async () => {
      const faultyWorldBuilderState = {
        isValid: true,
        stepValidation: [true, true, true, true, true, true, true],
        toSimulationConfig: () => {
          throw new Error('Config generation failed');
        }
      };

      const TestComponent = () => {
        const { currentTurn, canProcessTurn } = useSimulation(faultyWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <div data-testid="can-process">{canProcessTurn ? 'true' : 'false'}</div>
          </div>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('can-process')).toHaveTextContent('false');
      });
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle rapid turn processing efficiently', async () => {
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
      
      // Process turns rapidly
      const startTime = Date.now();
      for (let i = 1; i <= 50; i++) {
        fireEvent.click(screen.getByTestId('process-btn'));
      }
      
      // Check final result
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 50');
      });
      
      const endTime = Date.now();
      
      // Should complete quickly
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });
});
