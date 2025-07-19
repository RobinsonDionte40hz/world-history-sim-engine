/**
 * Simple SimulationContext Test
 * Basic test to verify context can be imported and used
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SimulationProvider, useSimulationContext } from './SimulationContext.js';

// Mock the hooks to avoid dependency issues
jest.mock('../hooks/useSimulation.js', () => {
  return jest.fn(() => ({
    worldState: null,
    isRunning: false,
    isInitialized: false,
    initializationError: null,
    historyAnalysis: null,
    currentTurn: 0,
    canStart: false,
    startSimulation: jest.fn(),
    stopSimulation: jest.fn(),
    resetSimulation: jest.fn(),
    stepSimulation: jest.fn(),
    analyzeHistory: jest.fn()
  }));
});

jest.mock('../hooks/useWorldBuilder.js', () => {
  return jest.fn(() => ({
    worldConfig: {
      name: null,
      description: null,
      nodes: [],
      interactions: [],
      characters: [],
      nodePopulations: {},
      stepValidation: {
        1: false, 2: false, 3: false, 4: false, 5: false, 6: false
      }
    },
    currentStep: 1,
    validationStatus: null,
    availableTemplates: {
      worlds: [],
      nodes: [],
      interactions: [],
      characters: [],
      composite: []
    },
    isLoading: false,
    error: null,
    stepValidationStatus: {
      1: false, 2: false, 3: false, 4: false, 5: false, 6: false
    },
    isWorldComplete: false,
    currentStepRequirements: null
  }));
});

jest.mock('../../template/TemplateManager.js', () => {
  return jest.fn().mockImplementation(() => ({
    templates: {
      characters: new Map(),
      nodes: new Map(),
      interactions: new Map(),
      events: new Map(),
      groups: new Map(),
      items: new Map(),
      worlds: new Map(),
      composite: new Map()
    },
    getAllTemplates: jest.fn(() => [])
  }));
});

// Test component to access context
const TestComponent = () => {
  const context = useSimulationContext();
  
  return (
    <div>
      <div data-testid="has-template-manager">
        {context.templateManager ? 'true' : 'false'}
      </div>
      <div data-testid="has-world-builder">
        {context.worldBuilder ? 'true' : 'false'}
      </div>
      <div data-testid="has-simulation">
        {context.simulation ? 'true' : 'false'}
      </div>
    </div>
  );
};

describe('SimulationContext - Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide context without crashing', () => {
    expect(() => {
      render(
        <SimulationProvider>
          <TestComponent />
        </SimulationProvider>
      );
    }).not.toThrow();
  });

  it('should provide all required context properties', () => {
    render(
      <SimulationProvider>
        <TestComponent />
      </SimulationProvider>
    );

    expect(screen.getByTestId('has-template-manager')).toHaveTextContent('true');
    expect(screen.getByTestId('has-world-builder')).toHaveTextContent('true');
    expect(screen.getByTestId('has-simulation')).toHaveTextContent('true');
  });

  it('should throw error when useSimulationContext is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSimulationContext must be used within a SimulationProvider');

    console.error = originalError;
  });
});