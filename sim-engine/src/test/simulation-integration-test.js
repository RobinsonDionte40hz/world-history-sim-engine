// src/test/simulation-integration-test.js
// Integration tests for simulation service in turn-based mode

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

describe('Simulation Integration Tests - Turn-Based Implementation', () => {
  let mockWorldBuilderState;

  beforeEach(() => {
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

  describe('Simulation Initialization', () => {
    test('should initialize simulation with valid world builder state', async () => {
      const TestComponent = () => {
        const { isInitialized, currentTurn } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="initialized">{isInitialized ? 'true' : 'false'}</div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
          </div>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('initialized')).toHaveTextContent('true');
      });
      expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
    });

    test('should fail to initialize with invalid world builder state', async () => {
      const invalidWorldBuilderState = {
        isValid: false,
        stepValidation: [false, false, false, false, false, false, false],
        toSimulationConfig: () => null
      };

      const TestComponent = () => {
        const { isInitialized, canProcessTurn } = useSimulation(invalidWorldBuilderState);
        return (
          <div>
            <div data-testid="initialized">{isInitialized ? 'true' : 'false'}</div>
            <div data-testid="can-process">{canProcessTurn ? 'true' : 'false'}</div>
          </div>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('can-process')).toHaveTextContent('false');
      });
    });

    test('should handle initialization errors gracefully', async () => {
      SimulationService.initialize = jest.fn(() => {
        throw new Error('Initialization failed');
      });

      const TestComponent = () => {
        const { isInitialized, canProcessTurn } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="initialized">{isInitialized ? 'true' : 'false'}</div>
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

  describe('Turn Processing', () => {
    test('should process turns correctly', async () => {
      let currentTurn = 0;
      SimulationService.getCurrentTurn = jest.fn(() => currentTurn);
      SimulationService.processTurn = jest.fn(() => {
        currentTurn++;
        return {
          success: true,
          worldState: { 
            time: currentTurn, 
            nodes: [{ id: 'node1', name: 'Test Node' }],
            npcs: [{ id: 'npc1', name: 'Test NPC' }],
            resources: { gold: 100 }
          },
          turnSummary: { eventsCount: 2, summary: `Turn ${currentTurn}: Events occurred` }
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

    test('should handle turn processing failures', async () => {
      SimulationService.processTurn = jest.fn(() => {
        throw new Error('Turn processing failed');
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

    test('should process multiple turns with different world states', async () => {
      let currentTurn = 0;
      const worldStates = [
        { 
          time: 1, 
          nodes: [{ id: 'node1' }], 
          npcs: [], 
          resources: {} 
        },
        { 
          time: 2, 
          nodes: [{ id: 'node1' }, { id: 'node2' }], 
          npcs: [{ id: 'npc1' }], 
          resources: { gold: 50 } 
        },
        { 
          time: 3, 
          nodes: [{ id: 'node1' }, { id: 'node2' }], 
          npcs: [{ id: 'npc1' }, { id: 'npc2' }], 
          resources: { gold: 100, food: 25 } 
        }
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
      
      // Process through all world states
      for (let i = 1; i <= 3; i++) {
        fireEvent.click(screen.getByTestId('process-btn'));
        
        await waitFor(() => {
          expect(screen.getByTestId('turn-counter')).toHaveTextContent(`Turn: ${i}`);
        });
      }
    });
  });

  describe('State Management', () => {
    test('should save and load simulation state', async () => {
      // Test saving
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

      const { unmount } = render(<TestComponent />);
      
      // Process turn to trigger save
      fireEvent.click(screen.getByTestId('process-btn'));
      
      await waitFor(() => {
        expect(SimulationService.saveState).toHaveBeenCalled();
      });

      unmount();

      // Test loading
      const savedState = {
        time: 10,
        nodes: [{ id: 'saved-node' }],
        npcs: [{ id: 'saved-npc' }],
        resources: { gold: 500 }
      };
      
      localStorageMock.setItem('worldState', JSON.stringify(savedState));
      SimulationService.loadState = jest.fn(() => savedState);
      SimulationService.getCurrentTurn = jest.fn(() => savedState.time);

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 10');
      });
    });

    test('should handle corrupted save data', async () => {
      localStorageMock.setItem('worldState', 'corrupted json data {');
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

  describe('Simulation Reset', () => {
    test('should reset simulation state', async () => {
      let currentTurn = 15;
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
      
      // Should start with turn 15
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 15');
      });

      // Reset
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      await waitFor(() => {
        expect(SimulationService.reset).toHaveBeenCalledTimes(1);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
    });

    test('should allow processing after reset', async () => {
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

  describe('Service Method Integration', () => {
    test('should call SimulationService methods correctly', async () => {
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
        const { processTurn, resetSimulation } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <button data-testid="process-btn" onClick={processTurn}>Process Turn</button>
            <button data-testid="reset-btn" onClick={resetSimulation}>Reset</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Process turn
      fireEvent.click(screen.getByTestId('process-btn'));
      
      await waitFor(() => {
        expect(SimulationService.processTurn).toHaveBeenCalledTimes(1);
      });

      // Reset
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      await waitFor(() => {
        expect(SimulationService.reset).toHaveBeenCalledTimes(1);
      });
    });

    test('should handle service method errors', async () => {
      SimulationService.processTurn = jest.fn(() => {
        throw new Error('Service error');
      });
      SimulationService.reset = jest.fn(() => {
        throw new Error('Reset error');
      });

      const TestComponent = () => {
        const { processTurn, resetSimulation, currentTurn } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <button data-testid="process-btn" onClick={processTurn}>Process Turn</button>
            <button data-testid="reset-btn" onClick={resetSimulation}>Reset</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Should not crash on service errors
      fireEvent.click(screen.getByTestId('process-btn'));
      fireEvent.click(screen.getByTestId('reset-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent(/Turn: \d+/);
      });
    });
  });
});
