// src/test/turn-counter-integration-focused.test.js
// Focused integration tests for turn counter
// Updated for turn-based simulation

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimulationService from '../application/use-cases/services/SimulationService.js';
import useSimulation from '../presentation/hooks/useSimulation.js';
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

describe('Turn Counter Integration Tests - Focused (Turn-Based)', () => {
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
  });

  afterEach(() => {
    SimulationService.reset();
    jest.clearAllTimers();
  });

  describe('Turn Counter Display', () => {
    test('should display current turn correctly', async () => {
      const TestComponent = () => {
        const { currentTurn } = useSimulation(mockWorldBuilderState);
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
    });

    test('should update display when turn changes', async () => {
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
      
      // Process turn and check update
      fireEvent.click(screen.getByTestId('process-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 1');
      });
    });

    test('should handle invalid turn numbers', async () => {
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
  });

  describe('Turn Processing', () => {
    test('should process single turn', async () => {
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
            <div data-testid="can-process">{canProcessTurn ? 'true' : 'false'}</div>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Should be able to process
      await waitFor(() => {
        expect(screen.getByTestId('can-process')).toHaveTextContent('true');
      });

      // Process turn
      fireEvent.click(screen.getByTestId('process-btn'));
      
      await waitFor(() => {
        expect(SimulationService.processTurn).toHaveBeenCalledTimes(1);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 1');
      });
    });

    test('should process multiple turns', async () => {
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

  describe('Simulation Reset', () => {
    test('should reset to turn 0', async () => {
      let currentTurn = 5;
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
      
      // Should start with turn 5
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 5');
      });

      // Reset
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
    });

    test('should reset and allow processing again', async () => {
      let currentTurn = 3;
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

  describe('State Persistence', () => {
    test('should save state after processing turn', async () => {
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

    test('should load state on initialization', async () => {
      const savedState = {
        time: 15,
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
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 15');
      });
    });

    test('should handle missing saved state', async () => {
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

  describe('World Builder Integration', () => {
    test('should enable processing with valid world state', async () => {
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

    test('should prevent processing with invalid world state', async () => {
      const invalidWorldBuilderState = {
        isValid: false,
        stepValidation: [false, false, false, false, false, false, false],
        toSimulationConfig: () => null
      };

      const TestComponent = () => {
        const { canProcessTurn, isInitialized } = useSimulation(invalidWorldBuilderState);
        return (
          <div>
            <div data-testid="can-process">{canProcessTurn ? 'true' : 'false'}</div>
            <div data-testid="is-initialized">{isInitialized ? 'true' : 'false'}</div>
          </div>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('can-process')).toHaveTextContent('false');
      });
    });

    test('should handle world builder config errors', async () => {
      const faultyWorldBuilderState = {
        isValid: true,
        stepValidation: [true, true, true, true, true, true, true],
        toSimulationConfig: () => {
          throw new Error('Configuration error');
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
});
