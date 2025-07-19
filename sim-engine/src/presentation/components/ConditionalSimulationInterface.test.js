/**
 * ConditionalSimulationInterface Component Tests
 * 
 * Tests for six-step world validation checking and conditional rendering.
 * Verifies world builder to simulation interface transitions.
 * Tests initialization loading and error states for mappless world processing.
 * Validates step-by-step progress display when world is incomplete.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConditionalSimulationInterface from './ConditionalSimulationInterface.js';

// Mock child components
jest.mock('./WorldBuilderInterface.js', () => {
  return function MockWorldBuilderInterface({ worldBuilderState, templateManager, onValidationChange }) {
    return (
      <div data-testid="world-builder-interface">
        <div>World Builder Interface</div>
        <div>Current Step: {worldBuilderState?.currentStep || 1}</div>
        <div>Is Complete: {worldBuilderState?.isWorldComplete ? 'Yes' : 'No'}</div>
      </div>
    );
  };
});

jest.mock('../features/SimulationControl.js', () => {
  return function MockSimulationControl() {
    return <div data-testid="simulation-control">Simulation Control</div>;
  };
});

jest.mock('../features/HistoryTimeline.js', () => {
  return function MockHistoryTimeline() {
    return <div data-testid="history-timeline">History Timeline</div>;
  };
});

jest.mock('../features/NpcViewer.js', () => {
  return function MockNpcViewer({ npc }) {
    return <div data-testid="npc-viewer">NPC Viewer: {npc?.name || 'None'}</div>;
  };
});

jest.mock('../features/WorldMap.js', () => {
  return function MockWorldMap() {
    return <div data-testid="world-map">World Map</div>;
  };
});

describe('ConditionalSimulationInterface', () => {
  const mockTemplateManager = {
    getAllTemplates: jest.fn(() => [])
  };

  const createMockWorldBuilderState = (overrides = {}) => ({
    currentStep: 1,
    isWorldComplete: false,
    stepValidationStatus: {
      1: false, 2: false, 3: false, 4: false, 5: false, 6: false
    },
    validationStatus: {
      isValid: false,
      errors: [],
      warnings: [],
      completeness: 0
    },
    buildWorld: jest.fn(() => ({ id: 'test-world' })),
    ...overrides
  });

  const createMockSimulationState = (overrides = {}) => ({
    isInitialized: false,
    worldState: null,
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization and Error Handling', () => {
    it('should render error message when world builder state is not provided', () => {
      render(
        <ConditionalSimulationInterface
          worldBuilderState={null}
          simulationState={null}
          templateManager={mockTemplateManager}
        />
      );

      expect(screen.getByText('World Builder Not Available')).toBeInTheDocument();
      expect(screen.getByText('Please initialize the world builder to begin.')).toBeInTheDocument();
    });

    it('should render world builder interface when world builder state is provided', () => {
      const worldBuilderState = createMockWorldBuilderState();

      render(
        <ConditionalSimulationInterface
          worldBuilderState={worldBuilderState}
          simulationState={null}
          templateManager={mockTemplateManager}
        />
      );

      expect(screen.getByText('World Builder')).toBeInTheDocument();
      expect(screen.getByTestId('world-builder-interface')).toBeInTheDocument();
    });
  });

  describe('Step-by-Step Progress Display', () => {
    it('should display all six steps with correct status', () => {
      const worldBuilderState = createMockWorldBuilderState({
        currentStep: 3,
        stepValidationStatus: {
          1: true, 2: true, 3: false, 4: false, 5: false, 6: false
        },
        validationStatus: {
          completeness: 0.33
        }
      });

      render(
        <ConditionalSimulationInterface
          worldBuilderState={worldBuilderState}
          simulationState={null}
          templateManager={mockTemplateManager}
        />
      );

      // Check all steps are displayed
      expect(screen.getByText('Step 1: Create World')).toBeInTheDocument();
      expect(screen.getByText('Step 2: Create Nodes')).toBeInTheDocument();
      expect(screen.getByText('Step 3: Create Interactions')).toBeInTheDocument();
      expect(screen.getByText('Step 4: Create Characters')).toBeInTheDocument();
      expect(screen.getByText('Step 5: Populate Nodes')).toBeInTheDocument();
      expect(screen.getByText('Step 6: Simulation Ready')).toBeInTheDocument();

      // Check step status
      expect(screen.getAllByText('Complete')).toHaveLength(2); // Steps 1 and 2
      expect(screen.getByText('Current')).toBeInTheDocument(); // Step 3
      expect(screen.getAllByText('Pending')).toHaveLength(3); // Steps 4, 5, 6

      // Check progress bar
      expect(screen.getByText('Progress: 2/6 steps')).toBeInTheDocument();
      expect(screen.getByText('33% complete')).toBeInTheDocument();
    });

    it('should show start simulation button when all steps are complete', () => {
      const worldBuilderState = createMockWorldBuilderState({
        currentStep: 6,
        isWorldComplete: true,
        stepValidationStatus: {
          1: true, 2: true, 3: true, 4: true, 5: true, 6: true
        },
        validationStatus: {
          isValid: true,
          completeness: 1.0
        }
      });

      render(
        <ConditionalSimulationInterface
          worldBuilderState={worldBuilderState}
          simulationState={null}
          templateManager={mockTemplateManager}
        />
      );

      expect(screen.getByText('Start Simulation')).toBeInTheDocument();
      expect(screen.getByText('100% complete')).toBeInTheDocument();
    });
  });

  describe('Validation Messages', () => {
    it('should display validation errors', () => {
      const worldBuilderState = createMockWorldBuilderState({
        validationStatus: {
          errors: ['World name is required', 'At least one node is required'],
          warnings: []
        }
      });

      render(
        <ConditionalSimulationInterface
          worldBuilderState={worldBuilderState}
          simulationState={null}
          templateManager={mockTemplateManager}
        />
      );

      expect(screen.getByText('Validation Errors')).toBeInTheDocument();
      expect(screen.getByText('• World name is required')).toBeInTheDocument();
      expect(screen.getByText('• At least one node is required')).toBeInTheDocument();
    });

    it('should display validation warnings', () => {
      const worldBuilderState = createMockWorldBuilderState({
        validationStatus: {
          errors: [],
          warnings: ['Consider adding more character variety', 'Node capacity might be low']
        }
      });

      render(
        <ConditionalSimulationInterface
          worldBuilderState={worldBuilderState}
          simulationState={null}
          templateManager={mockTemplateManager}
        />
      );

      expect(screen.getByText('Warnings')).toBeInTheDocument();
      expect(screen.getByText('• Consider adding more character variety')).toBeInTheDocument();
      expect(screen.getByText('• Node capacity might be low')).toBeInTheDocument();
    });
  });

  describe('World Builder to Simulation Transition', () => {
    it('should call onWorldComplete when starting simulation', async () => {
      const mockOnWorldComplete = jest.fn();
      const worldBuilderState = createMockWorldBuilderState({
        isWorldComplete: true,
        stepValidationStatus: {
          1: true, 2: true, 3: true, 4: true, 5: true, 6: true
        },
        validationStatus: {
          isValid: true
        }
      });

      render(
        <ConditionalSimulationInterface
          worldBuilderState={worldBuilderState}
          simulationState={null}
          onWorldComplete={mockOnWorldComplete}
          templateManager={mockTemplateManager}
        />
      );

      const startButton = screen.getByText('Start Simulation');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(worldBuilderState.buildWorld).toHaveBeenCalled();
      });
      expect(mockOnWorldComplete).toHaveBeenCalledWith({ id: 'test-world' });
    });

    it('should show transition error when world building fails', async () => {
      const worldBuilderState = createMockWorldBuilderState({
        isWorldComplete: true,
        stepValidationStatus: {
          1: true, 2: true, 3: true, 4: true, 5: true, 6: true
        },
        validationStatus: {
          isValid: true
        },
        buildWorld: jest.fn(() => {
          throw new Error('Failed to build world');
        })
      });

      render(
        <ConditionalSimulationInterface
          worldBuilderState={worldBuilderState}
          simulationState={null}
          templateManager={mockTemplateManager}
        />
      );

      const startButton = screen.getByText('Start Simulation');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Transition Error')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Failed to transition to simulation: Failed to build world')).toBeInTheDocument();
    });

    it('should show loading state during transition', async () => {
      let resolveTransition;
      const transitionPromise = new Promise((resolve) => {
        resolveTransition = resolve;
      });

      const mockOnWorldComplete = jest.fn(() => transitionPromise);
      const worldBuilderState = createMockWorldBuilderState({
        isWorldComplete: true,
        stepValidationStatus: {
          1: true, 2: true, 3: true, 4: true, 5: true, 6: true
        },
        validationStatus: {
          isValid: true
        }
      });

      render(
        <ConditionalSimulationInterface
          worldBuilderState={worldBuilderState}
          simulationState={null}
          onWorldComplete={mockOnWorldComplete}
          templateManager={mockTemplateManager}
        />
      );

      const startButton = screen.getByText('Start Simulation');
      fireEvent.click(startButton);

      // Should show loading state immediately
      await waitFor(() => {
        expect(screen.getByText('Initializing Simulation...')).toBeInTheDocument();
      });

      // Resolve the transition
      resolveTransition();
    });
  });

  describe('Simulation Interface Display', () => {
    it('should render simulation interface when world is complete and simulation is initialized', () => {
      const worldBuilderState = createMockWorldBuilderState({
        isWorldComplete: true,
        stepValidationStatus: {
          1: true, 2: true, 3: true, 4: true, 5: true, 6: true
        }
      });

      const simulationState = createMockSimulationState({
        isInitialized: true,
        worldState: {
          npcs: [{ name: 'Test NPC' }]
        }
      });

      render(
        <ConditionalSimulationInterface
          worldBuilderState={worldBuilderState}
          simulationState={simulationState}
          templateManager={mockTemplateManager}
        />
      );

      // Should show simulation interface components
      expect(screen.getByText('World History Simulation')).toBeInTheDocument();
      expect(screen.getByTestId('simulation-control')).toBeInTheDocument();
      expect(screen.getByTestId('world-map')).toBeInTheDocument();
      expect(screen.getByTestId('npc-viewer')).toBeInTheDocument();
      expect(screen.getByTestId('history-timeline')).toBeInTheDocument();
      
      // Should not show world builder interface
      expect(screen.queryByTestId('world-builder-interface')).not.toBeInTheDocument();
    });

    it('should allow returning to world builder from simulation interface', async () => {
      const worldBuilderState = createMockWorldBuilderState({
        isWorldComplete: true,
        stepValidationStatus: {
          1: true, 2: true, 3: true, 4: true, 5: true, 6: true
        }
      });

      const simulationState = createMockSimulationState({
        isInitialized: true,
        worldState: {
          npcs: [{ name: 'Test NPC' }]
        }
      });

      render(
        <ConditionalSimulationInterface
          worldBuilderState={worldBuilderState}
          simulationState={simulationState}
          templateManager={mockTemplateManager}
        />
      );

      // Should be in simulation interface initially
      expect(screen.getByText('World History Simulation')).toBeInTheDocument();

      // Click edit world button
      const editButton = screen.getByText('Edit World');
      fireEvent.click(editButton);

      // Should return to world builder
      await waitFor(() => {
        expect(screen.getByText('World Builder')).toBeInTheDocument();
      });
      expect(screen.getByTestId('world-builder-interface')).toBeInTheDocument();
    });
  });

  describe('Error Prevention', () => {
    it('should not allow starting simulation when world is incomplete', () => {
      const worldBuilderState = createMockWorldBuilderState({
        currentStep: 3,
        isWorldComplete: false,
        stepValidationStatus: {
          1: true, 2: true, 3: false, 4: false, 5: false, 6: false
        }
      });

      render(
        <ConditionalSimulationInterface
          worldBuilderState={worldBuilderState}
          simulationState={null}
          templateManager={mockTemplateManager}
        />
      );

      // Start simulation button should not be present
      expect(screen.queryByText('Start Simulation')).not.toBeInTheDocument();
    });

    it('should handle missing step validation gracefully', () => {
      const worldBuilderState = createMockWorldBuilderState({
        stepValidationStatus: null
      });

      render(
        <ConditionalSimulationInterface
          worldBuilderState={worldBuilderState}
          simulationState={null}
          templateManager={mockTemplateManager}
        />
      );

      // Should still render without crashing
      expect(screen.getByText('World Builder')).toBeInTheDocument();
      expect(screen.getByText('Progress: 0/6 steps')).toBeInTheDocument();
    });
  });
});