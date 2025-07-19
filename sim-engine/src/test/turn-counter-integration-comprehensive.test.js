// src/test/turn-counter-integration-comprehensive.test.js
// Comprehensive integration tests for turn counter end-to-end flow
// Tests cover all requirements from the spec: 1.4, 2.1, 2.2, 3.3, 4.1
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

describe('Turn Counter Integration Tests - Comprehensive End-to-End Flow (Turn-Based)', () => {
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

  describe('Test 1: Turn-Based Simulation Initialization and Processing (Requirement 1.4)', () => {
    test('should initialize simulation service and turn counter correctly', async () => {
      const TestComponent = () => {
        const { currentTurn, isInitialized } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <div data-testid="status">{isInitialized ? 'Initialized' : 'Not Initialized'}</div>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Should initialize to 0 and initialized state
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
      expect(screen.getByTestId('status')).toHaveTextContent('Initialized');
    });

    test('should process turns manually and update counter', async () => {
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
            <div data-testid="can-process">{canProcessTurn ? 'Yes' : 'No'}</div>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Should be able to process turns
      await waitFor(() => {
        expect(screen.getByTestId('can-process')).toHaveTextContent('Yes');
      });

      // Process several turns
      for (let i = 1; i <= 5; i++) {
        fireEvent.click(screen.getByTestId('process-btn'));
        
        await waitFor(() => {
          expect(screen.getByTestId('turn-counter')).toHaveTextContent(`Turn: ${i}`);
        });
      }
    });

    test('should reset turn counter when simulation is reset', async () => {
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
      
      // Should start with turn 10
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 10');
      });

      // Reset should bring back to 0
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
    });
  });

  describe('Test 2: Persistence and State Recovery (Requirement 2.1)', () => {
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
      
      // Process a turn
      fireEvent.click(screen.getByTestId('process-btn'));
      
      // Should save state
      await waitFor(() => {
        expect(SimulationService.saveState).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 1');
      });
    });

    test('should restore turn counter from saved state', async () => {
      const savedState = {
        time: 25,
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
      
      // Should restore from saved state
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 25');
      });
    });

    test('should handle corrupted save data gracefully', async () => {
      localStorageMock.setItem('worldState', 'invalid json {');
      SimulationService.loadState = jest.fn(() => null);
      
      const TestComponent = () => {
        const { currentTurn } = useSimulation(mockWorldBuilderState);
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
      // Should default to 0 with corrupted data
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
    });
  });

  describe('Test 3: Multi-Component Synchronization (Requirement 2.2)', () => {
    test('should synchronize turn counter across multiple UI components', async () => {
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
      
      // All should start at 0
      await waitFor(() => {
        expect(screen.getByTestId('counter-1')).toHaveTextContent('Turn: 0');
      });
      expect(screen.getByTestId('counter-2')).toHaveTextContent('Turn: 0');
      expect(screen.getByTestId('counter-3')).toHaveTextContent('Current Turn: 0');

      // Process a turn - all should update together
      fireEvent.click(screen.getByTestId('process-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('counter-1')).toHaveTextContent('Turn: 1');
      });
      expect(screen.getByTestId('counter-2')).toHaveTextContent('Turn: 1');
      expect(screen.getByTestId('counter-3')).toHaveTextContent('Current Turn: 1');
    });

    test('should maintain synchronization during rapid turn processing', async () => {
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
      
      // Process turns rapidly
      for (let i = 1; i <= 10; i++) {
        fireEvent.click(screen.getByTestId('process-btn'));
        
        await waitFor(() => {
          expect(screen.getByTestId('counter-1')).toHaveTextContent(`Turn: ${i}`);
        });
        
        // Check synchronization
        expect(screen.getByTestId('counter-2')).toHaveTextContent(`Turn: ${i}`);
        expect(screen.getByTestId('counter-3')).toHaveTextContent(`Current Turn: ${i}`);
      }
    });

    test('should maintain synchronization after reset', async () => {
      let currentTurn = 15;
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
      
      // Should start at 15
      await waitFor(() => {
        expect(screen.getByTestId('counter-1')).toHaveTextContent('Turn: 15');
      });
      expect(screen.getByTestId('counter-2')).toHaveTextContent('Turn: 15');
      expect(screen.getByTestId('counter-3')).toHaveTextContent('Current Turn: 15');

      // Reset - all should go to 0 together
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('counter-1')).toHaveTextContent('Turn: 0');
      });
      expect(screen.getByTestId('counter-2')).toHaveTextContent('Turn: 0');
      expect(screen.getByTestId('counter-3')).toHaveTextContent('Current Turn: 0');
    });
  });

  describe('Test 4: Error Handling and Edge Cases (Requirement 3.3)', () => {
    test('should handle invalid turn values gracefully', async () => {
      SimulationService.getCurrentTurn = jest.fn(() => NaN);
      
      const TestComponent = () => {
        const { currentTurn } = useSimulation(mockWorldBuilderState);
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
      // Should show fallback for invalid turn
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
      
      // Should show fallback for null turn
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
    });

    test('should handle turn processing errors gracefully', async () => {
      SimulationService.processTurn = jest.fn(() => {
        throw new Error('Processing failed');
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
      
      // Should not crash when processing fails
      fireEvent.click(screen.getByTestId('process-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent(/Turn: \d+/);
      });
    });

    test('should handle world builder validation errors', async () => {
      const invalidWorldBuilderState = {
        isValid: false,
        stepValidation: [false, false, false, false, false, false, false],
        toSimulationConfig: () => {
          throw new Error('Invalid configuration');
        }
      };

      const TestComponent = () => {
        const { currentTurn, canProcessTurn } = useSimulation(invalidWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <div data-testid="can-process">{canProcessTurn ? 'Yes' : 'No'}</div>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Should not be able to process with invalid state
      await waitFor(() => {
        expect(screen.getByTestId('can-process')).toHaveTextContent('No');
      });
    });
  });

  describe('Test 5: Full WorldHistorySimInterface Integration (Requirement 4.1)', () => {
    test('should integrate turn counter in full interface', async () => {
      render(<WorldHistorySimInterface />);
      
      // Should have turn counter visible
      await waitFor(() => {
        expect(screen.getByText(/Turn:/)).toBeInTheDocument();
      });
    });

    test('should show proper turn-based controls', async () => {
      render(<WorldHistorySimInterface />);
      
      // Should have turn-based controls
      await waitFor(() => {
        const turnText = screen.queryByText(/Turn:/);
        expect(turnText).toBeInTheDocument();
      });
    });

    test('should handle interface interaction gracefully', async () => {
      render(<WorldHistorySimInterface />);
      
      // Find any turn-related buttons
      const processTurnBtn = screen.queryByText(/Process Turn/);
      
      if (processTurnBtn && !processTurnBtn.disabled) {
        fireEvent.click(processTurnBtn);
      }
      
      // Should still show turn counter after interaction
      await waitFor(() => {
        expect(screen.getByText(/Turn: \d+/)).toBeInTheDocument();
      });
    });
  });

  describe('Test 6: Performance and Scalability', () => {
    test('should handle high turn counts efficiently', async () => {
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
      
      // Process many turns rapidly
      const startTime = Date.now();
      for (let i = 1; i <= 100; i++) {
        fireEvent.click(screen.getByTestId('process-btn'));
      }
      
      // Check final result
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 100');
      });
      
      const endTime = Date.now();
      
      // Should complete in reasonable time (less than 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
    });

    test('should handle frequent reset operations', async () => {
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
      SimulationService.reset = jest.fn(() => {
        currentTurn = 0;
      });

      const TestComponent = () => {
        const { currentTurn, processTurn, resetSimulation } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <button data-testid="process-btn" onClick={processTurn}>Process Turn</button>
            <button data-testid="reset-btn" onClick={resetSimulation}>Reset</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Cycle through processing and resetting
      for (let cycle = 1; cycle <= 5; cycle++) {
        // Process some turns
        for (let turn = 1; turn <= 5; turn++) {
          fireEvent.click(screen.getByTestId('process-btn'));
          
          await waitFor(() => {
            expect(screen.getByTestId('turn-counter')).toHaveTextContent(`Turn: ${turn}`);
          });
        }
        
        // Reset
        fireEvent.click(screen.getByTestId('reset-btn'));
        
        await waitFor(() => {
          expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
        });
      }
    });
  });
});
