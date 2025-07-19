/**
 * Simple MainPage Test
 * Basic test to verify MainPage can be imported and rendered
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainPage from './MainPage.js';

// Mock the ConditionalSimulationInterface component
jest.mock('../components/ConditionalSimulationInterface.js', () => {
  return function MockConditionalSimulationInterface({ 
    worldBuilderState, 
    simulationState, 
    templateManager 
  }) {
    return (
      <div data-testid="conditional-simulation-interface">
        <div>Mock Conditional Simulation Interface</div>
        <div data-testid="world-builder-available">
          {worldBuilderState ? 'true' : 'false'}
        </div>
        <div data-testid="simulation-available">
          {simulationState ? 'true' : 'false'}
        </div>
        <div data-testid="template-manager-available">
          {templateManager ? 'true' : 'false'}
        </div>
      </div>
    );
  };
});

// Mock the SimulationContext
jest.mock('../contexts/SimulationContext.js', () => ({
  useSimulationContext: jest.fn(() => ({
    templateManager: { 
      getAllTemplates: jest.fn(() => [])
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
      }
    },
    simulation: {
      worldState: null,
      isRunning: false,
      isInitialized: false,
      canStart: false
    }
  }))
}));

describe('MainPage - Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    expect(() => {
      render(<MainPage />);
    }).not.toThrow();
  });

  it('should render ConditionalSimulationInterface with proper props', () => {
    render(<MainPage />);

    expect(screen.getByTestId('conditional-simulation-interface')).toBeInTheDocument();
    expect(screen.getByTestId('world-builder-available')).toHaveTextContent('true');
    expect(screen.getByTestId('simulation-available')).toHaveTextContent('true');
    expect(screen.getByTestId('template-manager-available')).toHaveTextContent('true');
  });

  it('should render with proper structure', () => {
    render(<MainPage />);
    
    // Test that the component renders the expected child component
    // which is a more meaningful test than checking CSS classes
    expect(screen.getByTestId('conditional-simulation-interface')).toBeInTheDocument();
  });
});