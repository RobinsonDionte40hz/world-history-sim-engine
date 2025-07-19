// src/test/turn-counter-integration-turnbased.test.js
// Updated test suite for turn-based simulation

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import useSimulation from '../presentation/hooks/useSimulation.js';
import TurnCounter from '../presentation/components/TurnCounter.js';
import WorldHistorySimInterface from '../presentation/components/WorldHistorySimInterface.js';
import SimulationService from '../application/use-cases/services/SimulationService.js';

// Mock SimulationService
jest.mock('../application/use-cases/services/SimulationService.js');

// Mock localStorage
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
  value: localStorageMock,
});

describe('Turn Counter Integration Tests - Turn-Based Implementation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
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
  });

  describe('Basic Turn-Based Functionality', () => {
    test('should initialize with turn 0 when no saved state', async () => {
      const TestComponent = () => {
        const { currentTurn, isInitialized } = useSimulation();
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
        expect(screen.getByTestId('initialized')).toHaveTextContent('false');
      });
    });

    test('should process a single turn when processTurn is called', async () => {
      // Mock initialization with proper world builder state
      const mockWorldBuilderState = {
        isValid: true,
        stepValidation: [true, true, true, true, true, true, true], // All steps valid
        toSimulationConfig: () => ({
          worldName: 'Test World',
          nodes: [{ id: 'node1', name: 'Test Node' }],
          characters: [{ id: 'char1', name: 'Test Character' }],
          interactions: [{ id: 'int1', name: 'Test Interaction' }]
        })
      };

      const TestComponent = () => {
        const { currentTurn, processTurn, isInitialized, canProcessTurn } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>
            <button 
              data-testid="process-turn" 
              onClick={processTurn}
              disabled={!canProcessTurn}
            >
              Process Turn
            </button>
            <div data-testid="can-process">{canProcessTurn ? 'true' : 'false'}</div>
          </div>
        );
      };

      render(<TestComponent />);
      
      // Should be initialized and ready to process
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('can-process')).toHaveTextContent('true');
      });

      // Process a turn
      fireEvent.click(screen.getByTestId('process-turn'));

      // Should increment turn counter
      await waitFor(() => {
        expect(SimulationService.processTurn).toHaveBeenCalled();
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 1');
      });
    });
  });

  describe('Persistence Integration', () => {
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
      
      // Mock loadState to handle corruption (return null)
      SimulationService.loadState = jest.fn(() => {
        throw new Error('Invalid JSON');
      });
      
      const TestComponent = () => {
        const { currentTurn } = useSimulation();
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
      // Should default to turn 0 when localStorage is corrupted
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: 0');
      });
    });
  });

  describe('Multiple Component Synchronization', () => {
    test('should keep all components synchronized during turn processing', async () => {
      // Mock a world builder state for proper initialization
      const mockWorldBuilderState = {
        isValid: true,
        stepValidation: [true, true, true, true, true, true, true],
        toSimulationConfig: () => ({
          worldName: 'Test World',
          nodes: [{ id: 'node1', name: 'Test Node' }],
          characters: [{ id: 'char1', name: 'Test Character' }],
          interactions: [{ id: 'int1', name: 'Test Interaction' }]
        })
      };

      // Mock multiple turn processing
      let turnCount = 0;
      SimulationService.processTurn = jest.fn(() => {
        turnCount++;
        return {
          success: true,
          worldState: { time: turnCount, nodes: [], npcs: [], resources: {} },
          turnSummary: { eventsCount: 1, summary: `Turn ${turnCount} processed` }
        };
      });
      
      SimulationService.getCurrentTurn = jest.fn(() => turnCount);

      const MultiCounterComponent = () => {
        const { currentTurn, processTurn, canProcessTurn } = useSimulation(mockWorldBuilderState);
        return (
          <div>
            <div data-testid="counter-1"><TurnCounter currentTurn={currentTurn} /></div>
            <div data-testid="counter-2">Turn: {currentTurn}</div>
            <div data-testid="counter-3">Current Turn: {currentTurn}</div>
            <button 
              data-testid="process-btn" 
              onClick={processTurn}
              disabled={!canProcessTurn}
            >
              Process Turn
            </button>
          </div>
        );
      };
      
      render(<MultiCounterComponent />);
      
      // Verify initial state
      await waitFor(() => {
        expect(screen.getByTestId('counter-1')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('counter-2')).toHaveTextContent('Turn: 0');
        expect(screen.getByTestId('counter-3')).toHaveTextContent('Current Turn: 0');
      });
      
      // Process several turns
      for (let i = 1; i <= 3; i++) {
        fireEvent.click(screen.getByTestId('process-btn'));
        
        await waitFor(() => {
          expect(screen.getByTestId('counter-1')).toHaveTextContent(`Turn: ${i}`);
          expect(screen.getByTestId('counter-2')).toHaveTextContent(`Turn: ${i}`);
          expect(screen.getByTestId('counter-3')).toHaveTextContent(`Current Turn: ${i}`);
        });
      }
    });

    test('should reset all components simultaneously', async () => {
      // Setup with existing turn count
      const savedState = { time: 25, nodes: [], npcs: [], resources: {} };
      localStorageMock.setItem('worldState', JSON.stringify(savedState));
      SimulationService.loadState = jest.fn(() => savedState);
      
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
      
      // Verify initial state shows loaded turn
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

  describe('Error Handling', () => {
    test('should handle invalid turn values gracefully', async () => {
      // Mock SimulationService to return invalid turn
      SimulationService.getCurrentTurn = jest.fn(() => NaN);
      
      const TestComponent = () => {
        const { currentTurn } = useSimulation();
        return <div data-testid="turn-counter"><TurnCounter currentTurn={currentTurn} /></div>;
      };

      render(<TestComponent />);
      
      // Should display fallback value when no localStorage and getCurrentTurn returns invalid
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent('Turn: --');
      });
    });

    test('should handle simulation service errors gracefully', async () => {
      // Mock a world builder state for initialization
      const mockWorldBuilderState = {
        isValid: true,
        stepValidation: [true, true, true, true, true, true, true],
        toSimulationConfig: () => ({
          worldName: 'Test World',
          nodes: [{ id: 'node1' }],
          characters: [{ id: 'char1' }],
          interactions: [{ id: 'int1' }]
        })
      };
      
      // Mock processTurn to throw an error
      SimulationService.processTurn = jest.fn(() => {
        throw new Error('Simulation error');
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
      
      // Try to process turn - should not crash
      fireEvent.click(screen.getByTestId('process-btn'));
      
      // Should still display a valid turn counter
      await waitFor(() => {
        expect(screen.getByTestId('turn-counter')).toHaveTextContent(/Turn: \d+/);
      });
    });
  });

  describe('WorldHistorySimInterface Integration', () => {
    test('should handle interface control interactions in turn-based mode', async () => {
      render(<WorldHistorySimInterface />);
      
      // Find simulation controls - now looking for Process Turn button
      const processTurnButton = screen.getByText(/Process Turn/);
      expect(processTurnButton).toBeInTheDocument();
      
      // Button should be disabled initially (no world state)
      expect(processTurnButton).toBeDisabled();
      
      // Turn counter should still be visible
      expect(screen.getByText(/Turn:/)).toBeInTheDocument();
    });
  });
});
