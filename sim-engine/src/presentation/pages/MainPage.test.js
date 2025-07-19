/**
 * MainPage Tests - Updated for conditional interface with six-step progression
 * 
 * Tests MainPage integration with ConditionalSimulationInterface.
 * Verifies world builder to simulation transitions.
 * Ensures no automatic simulation startup (only manual after world completion).
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainPage from './MainPage.js';

// Mock the ConditionalSimulationInterface component
jest.mock('../components/ConditionalSimulationInterface.js', () => {
  return function MockConditionalSimulationInterface({ 
    worldBuilderState, 
    simulationState, 
    onWorldComplete, 
    templateManager 
  }) {
    return (
      <div data-testid="conditional-simulation-interface">
        <div data-testid="world-builder-state">
          World Builder: {worldBuilderState ? 'Available' : 'Not Available'}
        </div>
        <div data-testid="simulation-state">
          Simulation: {simulationState ? 'Available' : 'Not Available'}
        </div>
        <div data-testid="template-manager">
          Template Manager: {templateManager ? 'Available' : 'Not Available'}
        </div>
        <button 
          data-testid="complete-world-button"
          onClick={() => onWorldComplete && onWorldComplete({ id: 'test-world', name: 'Test World' })}
        >
          Complete World
        </button>
      </div>
    );
  };
});

// Mock the SimulationContext
jest.mock('../contexts/SimulationContext.js', () => ({
  useSimulationContext: jest.fn(() => ({
    templateManager: { 
      getAllTemplates: jest.fn(() => []),
      addTemplate: jest.fn(),
      getTemplate: jest.fn()
    },
    worldBuilder: {
      worldConfig: {
        name: null,
        description: null,
        nodes: [],
        interactions: [],
        characters: [],
        nodePopulations: {}
      },
      currentStep: 1,
      isWorldComplete: false,
      stepValidationStatus: {
        1: false, 2: false, 3: false, 4: false, 5: false, 6: false
      },
      buildWorld: jest.fn(() => ({ id: 'test-world', name: 'Test World' }))
    },
    simulation: {
      worldState: null,
      isRunning: false,
      isInitialized: false,
      canStart: false
    },
    isWorldComplete: false,
    canStartSimulation: false
  }))
}));

describe('MainPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render ConditionalSimulationInterface with proper props', () => {
      render(<MainPage />);

      expect(screen.getByTestId('conditional-simulation-interface')).toBeInTheDocument();
      expect(screen.getByTestId('world-builder-state')).toHaveTextContent('World Builder: Available');
      expect(screen.getByTestId('simulation-state')).toHaveTextContent('Simulation: Available');
      expect(screen.getByTestId('template-manager')).toHaveTextContent('Template Manager: Available');
    });

    it('should apply proper styling classes', () => {
      const { container } = render(<MainPage />);
      
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('min-h-screen', 'bg-gray-50', 'dark:bg-gray-900');
    });
  });

  describe('World Completion Handling', () => {
    it('should handle world completion callback', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      render(<MainPage />);

      const completeButton = screen.getByTestId('complete-world-button');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'MainPage: World building completed, transitioning to simulation'
        );
        expect(consoleSpy).toHaveBeenCalledWith(
          'MainPage: World state:', 
          { id: 'test-world', name: 'Test World' }
        );
      });

      consoleSpy.mockRestore();
    });

    it('should handle world completion errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock onWorldComplete to throw an error
      const MockConditionalSimulationInterfaceWithError = ({ onWorldComplete }) => (
        <div data-testid="conditional-simulation-interface">
          <button 
            data-testid="complete-world-button-error"
            onClick={() => {
              if (onWorldComplete) {
                onWorldComplete({ id: 'test-world' }).catch(() => {
                  throw new Error('World completion failed');
                });
              }
            }}
          >
            Complete World with Error
          </button>
        </div>
      );

      // Temporarily replace the mock
      jest.doMock('../components/ConditionalSimulationInterface.js', () => MockConditionalSimulationInterfaceWithError);

      render(<MainPage />);

      const errorButton = screen.getByTestId('complete-world-button-error');
      
      // This should not throw an error in the component
      expect(() => {
        fireEvent.click(errorButton);
      }).not.toThrow();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Context Integration', () => {
    it('should pass correct props from context to ConditionalSimulationInterface', () => {
      const mockContext = {
        templateManager: { id: 'template-manager' },
        worldBuilder: { id: 'world-builder', currentStep: 3 },
        simulation: { id: 'simulation', isInitialized: false },
        isWorldComplete: false,
        canStartSimulation: false
      };

      const { useSimulationContext } = require('../contexts/SimulationContext.js');
      useSimulationContext.mockReturnValue(mockContext);

      render(<MainPage />);

      // Verify the component receives the context values
      expect(screen.getByTestId('world-builder-state')).toHaveTextContent('World Builder: Available');
      expect(screen.getByTestId('simulation-state')).toHaveTextContent('Simulation: Available');
      expect(screen.getByTestId('template-manager')).toHaveTextContent('Template Manager: Available');
    });

    it('should handle missing context values gracefully', () => {
      const { useSimulationContext } = require('../contexts/SimulationContext.js');
      useSimulationContext.mockReturnValue({
        templateManager: null,
        worldBuilder: null,
        simulation: null,
        isWorldComplete: false,
        canStartSimulation: false
      });

      render(<MainPage />);

      expect(screen.getByTestId('world-builder-state')).toHaveTextContent('World Builder: Not Available');
      expect(screen.getByTestId('simulation-state')).toHaveTextContent('Simulation: Not Available');
      expect(screen.getByTestId('template-manager')).toHaveTextContent('Template Manager: Not Available');
    });
  });

  describe('No Automatic Simulation Startup', () => {
    it('should not automatically start simulation on mount', () => {
      const mockSimulation = {
        worldState: null,
        isRunning: false,
        isInitialized: false,
        canStart: false,
        startSimulation: jest.fn()
      };

      const { useSimulationContext } = require('../contexts/SimulationContext.js');
      useSimulationContext.mockReturnValue({
        templateManager: {},
        worldBuilder: { isWorldComplete: false },
        simulation: mockSimulation,
        isWorldComplete: false,
        canStartSimulation: false
      });

      render(<MainPage />);

      // Simulation should not be started automatically
      expect(mockSimulation.startSimulation).not.toHaveBeenCalled();
    });

    it('should not start simulation even when world is complete', () => {
      const mockSimulation = {
        worldState: null,
        isRunning: false,
        isInitialized: false,
        canStart: true,
        startSimulation: jest.fn()
      };

      const { useSimulationContext } = require('../contexts/SimulationContext.js');
      useSimulationContext.mockReturnValue({
        templateManager: {},
        worldBuilder: { isWorldComplete: true },
        simulation: mockSimulation,
        isWorldComplete: true,
        canStartSimulation: true
      });

      render(<MainPage />);

      // Even with complete world, simulation should not start automatically
      expect(mockSimulation.startSimulation).not.toHaveBeenCalled();
    });
  });
});