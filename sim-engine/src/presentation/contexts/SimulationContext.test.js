/**
 * SimulationContext Tests - Updated for mappless world building integration
 * 
 * Tests SimulationContext support for mappless world state.
 * Verifies template manager initialization and injection for all template types.
 * Ensures no automatic simulation startup (only manual after world completion).
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SimulationProvider, useSimulationContext } from './SimulationContext.js';

// Mock the hooks
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
    currentStepRequirements: null,
    loadTemplates: jest.fn(),
    setWorldProperties: jest.fn(),
    setRules: jest.fn(),
    setInitialConditions: jest.fn(),
    addNode: jest.fn(),
    addNodeFromTemplate: jest.fn(),
    removeNode: jest.fn(),
    addInteraction: jest.fn(),
    addInteractionFromTemplate: jest.fn(),
    removeInteraction: jest.fn(),
    addCharacter: jest.fn(),
    addCharacterFromTemplate: jest.fn(),
    removeCharacter: jest.fn(),
    assignCharacterToNode: jest.fn(),
    populateNode: jest.fn(),
    canProceedToStep: jest.fn(),
    proceedToStep: jest.fn(),
    validateCurrentStep: jest.fn(),
    saveAsTemplate: jest.fn(),
    loadFromTemplate: jest.fn(),
    validateWorld: jest.fn(),
    buildWorld: jest.fn(),
    resetBuilder: jest.fn()
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
    addTemplate: jest.fn(),
    getTemplate: jest.fn(),
    getAllTemplates: jest.fn(() => []),
    updateTemplate: jest.fn(),
    deleteTemplate: jest.fn(),
    searchTemplates: jest.fn(),
    createTemplate: jest.fn(),
    combineTemplates: jest.fn(),
    exportTemplates: jest.fn(),
    importTemplates: jest.fn(),
    createTemplateVariant: jest.fn(),
    getTemplatesByTag: jest.fn()
  }));
});

// Test component to access context
const TestComponent = () => {
  const context = useSimulationContext();
  
  return (
    <div>
      <div data-testid="template-manager">
        {context.templateManager ? 'Template Manager Available' : 'No Template Manager'}
      </div>
      <div data-testid="world-builder">
        {context.worldBuilder ? 'World Builder Available' : 'No World Builder'}
      </div>
      <div data-testid="simulation">
        {context.simulation ? 'Simulation Available' : 'No Simulation'}
      </div>
      <div data-testid="world-complete">
        {context.isWorldComplete ? 'World Complete' : 'World Incomplete'}
      </div>
      <div data-testid="can-start-simulation">
        {context.canStartSimulation ? 'Can Start Simulation' : 'Cannot Start Simulation'}
      </div>
      <div data-testid="current-step">
        Current Step: {context.worldBuilder?.currentStep || 'Unknown'}
      </div>
    </div>
  );
};

describe('SimulationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider Initialization', () => {
    it('should initialize template manager for all template types', () => {
      render(
        <SimulationProvider>
          <TestComponent />
        </SimulationProvider>
      );

      expect(screen.getByTestId('template-manager')).toHaveTextContent('Template Manager Available');
    });

    it('should initialize world builder with template manager', () => {
      render(
        <SimulationProvider>
          <TestComponent />
        </SimulationProvider>
      );

      expect(screen.getByTestId('world-builder')).toHaveTextContent('World Builder Available');
    });

    it('should initialize simulation state', () => {
      render(
        <SimulationProvider>
          <TestComponent />
        </SimulationProvider>
      );

      expect(screen.getByTestId('simulation')).toHaveTextContent('Simulation Available');
    });
  });

  describe('World Building Integration', () => {
    it('should show world as incomplete initially', () => {
      render(
        <SimulationProvider>
          <TestComponent />
        </SimulationProvider>
      );

      expect(screen.getByTestId('world-complete')).toHaveTextContent('World Incomplete');
      expect(screen.getByTestId('can-start-simulation')).toHaveTextContent('Cannot Start Simulation');
    });

    it('should show current step from world builder', () => {
      render(
        <SimulationProvider>
          <TestComponent />
        </SimulationProvider>
      );

      expect(screen.getByTestId('current-step')).toHaveTextContent('Current Step: 1');
    });
  });

  describe('Context Value Structure', () => {
    it('should provide all required context properties', () => {
      let contextValue;
      
      const TestContextValue = () => {
        contextValue = useSimulationContext();
        return <div>Test</div>;
      };

      render(
        <SimulationProvider>
          <TestContextValue />
        </SimulationProvider>
      );

      // Check template manager
      expect(contextValue.templateManager).toBeDefined();

      // Check world builder
      expect(contextValue.worldBuilder).toBeDefined();
      expect(contextValue.worldBuilder.worldConfig).toBeDefined();
      expect(contextValue.worldBuilder.currentStep).toBeDefined();

      // Check simulation
      expect(contextValue.simulation).toBeDefined();
      expect(contextValue.simulation.worldState).toBeDefined();
      expect(contextValue.simulation.isRunning).toBeDefined();

      // Check legacy compatibility properties
      expect(contextValue.worldState).toBeDefined();
      expect(contextValue.isRunning).toBeDefined();
      expect(contextValue.isInitialized).toBeDefined();
      expect(contextValue.startSimulation).toBeDefined();
      expect(contextValue.stopSimulation).toBeDefined();

      // Check world building status
      expect(contextValue.isWorldComplete).toBeDefined();
      expect(contextValue.canStartSimulation).toBeDefined();
    });
  });

  describe('Error Handling', () => {
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

  describe('Simulation Dependency on World Completion', () => {
    it('should not pass world state to simulation when world is incomplete', () => {
      const useSimulation = require('../hooks/useSimulation.js');
      
      render(
        <SimulationProvider>
          <TestComponent />
        </SimulationProvider>
      );

      // useSimulation should be called with null when world is incomplete
      expect(useSimulation).toHaveBeenCalledWith(null);
    });

    it('should pass world builder state to simulation when world is complete', () => {
      const useWorldBuilder = require('../hooks/useWorldBuilder.js');
      const useSimulation = require('../hooks/useSimulation.js');
      
      // Mock world builder to return complete state
      useWorldBuilder.mockReturnValue({
        worldConfig: { name: 'Test World' },
        currentStep: 6,
        isWorldComplete: true,
        stepValidationStatus: {
          1: true, 2: true, 3: true, 4: true, 5: true, 6: true
        },
        // ... other properties
        loadTemplates: jest.fn(),
        setWorldProperties: jest.fn(),
        buildWorld: jest.fn()
      });

      render(
        <SimulationProvider>
          <TestComponent />
        </SimulationProvider>
      );

      // useSimulation should be called with world builder state when complete
      expect(useSimulation).toHaveBeenCalledWith(
        expect.objectContaining({
          isWorldComplete: true,
          currentStep: 6
        })
      );
    });
  });
});