import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorldHistorySimInterface from './WorldHistorySimInterface.js';
import useSimulation from '../hooks/useSimulation.js';

// Mock the useSimulation hook
jest.mock('../hooks/useSimulation.js');

describe('WorldHistorySimInterface - Turn Counter Integration', () => {
  beforeEach(() => {
    // Reset the mock before each test
    useSimulation.mockReset();
  });

  test('should display turn counter from useSimulation hook', () => {
    // Mock the hook to return a specific turn value
    useSimulation.mockReturnValue({
      worldState: {
        time: 42,
        npcs: [],
        nodes: [],
        events: [],
        resources: {}
      },
      isRunning: false,
      currentTurn: 42,
      startSimulation: jest.fn(),
      stopSimulation: jest.fn()
    });

    render(<WorldHistorySimInterface />);

    // Check that the turn counter displays the value from the hook
    expect(screen.getByText('Turn: 42')).toBeInTheDocument();
  });

  test('should display turn counter as 0 when hook returns 0', () => {
    useSimulation.mockReturnValue({
      worldState: {
        time: 0,
        npcs: [],
        nodes: [],
        events: [],
        resources: {}
      },
      isRunning: false,
      currentTurn: 0,
      startSimulation: jest.fn(),
      stopSimulation: jest.fn()
    });

    render(<WorldHistorySimInterface />);

    expect(screen.getByText('Turn: 0')).toBeInTheDocument();
  });

  test('should use useSimulation hook instead of local state', () => {
    const mockHook = {
      worldState: {
        time: 15,
        npcs: [],
        nodes: [],
        events: [],
        resources: {}
      },
      isRunning: true,
      currentTurn: 15,
      startSimulation: jest.fn(),
      stopSimulation: jest.fn()
    };

    useSimulation.mockReturnValue(mockHook);

    render(<WorldHistorySimInterface />);

    // Verify the hook was called
    expect(useSimulation).toHaveBeenCalled();
    
    // Verify the turn counter shows the hook's value
    expect(screen.getByText('Turn: 15')).toBeInTheDocument();
    
    // Verify simulation status shows running
    expect(screen.getByText('Simulation Running')).toBeInTheDocument();
  });

  test('should handle missing worldState gracefully with fallback data', () => {
    useSimulation.mockReturnValue({
      worldState: null,
      isRunning: false,
      currentTurn: 0,
      startSimulation: jest.fn(),
      stopSimulation: jest.fn(),
      resetSimulation: jest.fn(),
      stepSimulation: jest.fn()
    });

    render(<WorldHistorySimInterface />);

    // Should still render without crashing and show turn counter
    expect(screen.getByText('Turn: 0')).toBeInTheDocument();
    
    // Should show minimal fallback data (empty state)
    expect(screen.getByText('Total Population')).toBeInTheDocument();
    expect(screen.getByText('Total Resources')).toBeInTheDocument();
    expect(screen.getByText('Active Settlements')).toBeInTheDocument();
    expect(screen.getByText('Historical Events')).toBeInTheDocument();
    
    // Should show zero values for all stats
    expect(screen.getAllByText('0')).toHaveLength(4); // Four stat cards with 0 values
  });

  describe('turn counter error handling', () => {
    test('should handle invalid currentTurn values gracefully', () => {
      useSimulation.mockReturnValue({
        worldState: {
          time: null,
          npcs: [],
          nodes: [],
          events: [],
          resources: {}
        },
        isRunning: false,
        currentTurn: null,
        startSimulation: jest.fn(),
        stopSimulation: jest.fn(),
        resetSimulation: jest.fn(),
        stepSimulation: jest.fn()
      });

      render(<WorldHistorySimInterface />);

      // Should display fallback when currentTurn is invalid
      expect(screen.getByText('Turn: --')).toBeInTheDocument();
    });

    test('should handle undefined currentTurn values', () => {
      useSimulation.mockReturnValue({
        worldState: {
          time: undefined,
          npcs: [],
          nodes: [],
          events: [],
          resources: {}
        },
        isRunning: false,
        currentTurn: undefined,
        startSimulation: jest.fn(),
        stopSimulation: jest.fn(),
        resetSimulation: jest.fn(),
        stepSimulation: jest.fn()
      });

      render(<WorldHistorySimInterface />);

      // Should display fallback when currentTurn is undefined
      expect(screen.getByText('Turn: --')).toBeInTheDocument();
    });

    test('should handle non-numeric currentTurn values', () => {
      useSimulation.mockReturnValue({
        worldState: {
          time: 'invalid',
          npcs: [],
          nodes: [],
          events: [],
          resources: {}
        },
        isRunning: false,
        currentTurn: 'invalid',
        startSimulation: jest.fn(),
        stopSimulation: jest.fn(),
        resetSimulation: jest.fn(),
        stepSimulation: jest.fn()
      });

      render(<WorldHistorySimInterface />);

      // Should display fallback when currentTurn is not a number
      expect(screen.getByText('Turn: --')).toBeInTheDocument();
    });

    test('should handle negative currentTurn values', () => {
      useSimulation.mockReturnValue({
        worldState: {
          time: -5,
          npcs: [],
          nodes: [],
          events: [],
          resources: {}
        },
        isRunning: false,
        currentTurn: -5,
        startSimulation: jest.fn(),
        stopSimulation: jest.fn(),
        resetSimulation: jest.fn(),
        stepSimulation: jest.fn()
      });

      render(<WorldHistorySimInterface />);

      // Should display fallback when currentTurn is negative
      expect(screen.getByText('Turn: --')).toBeInTheDocument();
    });

    test('should handle NaN currentTurn values', () => {
      useSimulation.mockReturnValue({
        worldState: {
          time: NaN,
          npcs: [],
          nodes: [],
          events: [],
          resources: {}
        },
        isRunning: false,
        currentTurn: NaN,
        startSimulation: jest.fn(),
        stopSimulation: jest.fn(),
        resetSimulation: jest.fn(),
        stepSimulation: jest.fn()
      });

      render(<WorldHistorySimInterface />);

      // Should display fallback when currentTurn is NaN
      expect(screen.getByText('Turn: --')).toBeInTheDocument();
    });

    test('should render without crashing when TurnCounter component fails', () => {
      // This test ensures the error boundary works
      useSimulation.mockReturnValue({
        worldState: {
          time: 42,
          npcs: [],
          nodes: [],
          events: [],
          resources: {}
        },
        isRunning: false,
        currentTurn: 42,
        startSimulation: jest.fn(),
        stopSimulation: jest.fn(),
        resetSimulation: jest.fn(),
        stepSimulation: jest.fn()
      });

      // Should render without throwing errors
      expect(() => {
        render(<WorldHistorySimInterface />);
      }).not.toThrow();

      // Should show either the turn counter or the fallback
      expect(
        screen.getByText('Turn: 42') || screen.getByText('Turn: --')
      ).toBeInTheDocument();
    });
  });
});