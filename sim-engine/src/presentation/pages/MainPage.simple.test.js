/**
 * Simple MainPage Test
 * Basic test to verify MainPage can be imported and rendered
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

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

// Import the component after mocking dependencies
import MainPage from './MainPage.js';

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
    const { getByTestId } = render(<MainPage />);

    expect(getByTestId('conditional-simulation-interface')).toBeInTheDocument();
    expect(getByTestId('world-builder-available')).toHaveTextContent('true');
    expect(getByTestId('simulation-available')).toHaveTextContent('true');
    expect(getByTestId('template-manager-available')).toHaveTextContent('true');
  });

  it('should apply proper styling classes', () => {
    const { container } = render(<MainPage />);
    
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('min-h-screen', 'bg-gray-50', 'dark:bg-gray-900');
  });
});