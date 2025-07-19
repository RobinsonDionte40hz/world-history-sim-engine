/**
 * Simple ConditionalSimulationInterface Test
 * Basic test to verify component can be imported and rendered
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConditionalSimulationInterface from './ConditionalSimulationInterface.js';

// Mock all child components to avoid dependency issues
jest.mock('./WorldBuilderInterface.js', () => {
  return function MockWorldBuilderInterface() {
    return <div data-testid="world-builder-interface">Mock World Builder</div>;
  };
});

jest.mock('../features/SimulationControl.js', () => {
  return function MockSimulationControl() {
    return <div data-testid="simulation-control">Mock Simulation Control</div>;
  };
});

jest.mock('../features/HistoryTimeline.js', () => {
  return function MockHistoryTimeline() {
    return <div data-testid="history-timeline">Mock History Timeline</div>;
  };
});

jest.mock('../features/NpcViewer.js', () => {
  return function MockNpcViewer() {
    return <div data-testid="npc-viewer">Mock NPC Viewer</div>;
  };
});

jest.mock('../features/WorldMap.js', () => {
  return function MockWorldMap() {
    return <div data-testid="world-map">Mock World Map</div>;
  };
});

describe('ConditionalSimulationInterface - Basic Tests', () => {
  const mockTemplateManager = {
    getAllTemplates: jest.fn(() => [])
  };

  it('should render without crashing when worldBuilderState is null', () => {
    expect(() => {
      render(
        <ConditionalSimulationInterface
          worldBuilderState={null}
          simulationState={null}
          templateManager={mockTemplateManager}
        />
      );
    }).not.toThrow();
    
    // Should show the "World Builder Not Available" message
    expect(screen.getByText('World Builder Not Available')).toBeInTheDocument();
    expect(screen.getByText('Please initialize the world builder to begin.')).toBeInTheDocument();
  });

  it('should render world builder interface when worldBuilderState is provided', () => {
    const mockWorldBuilderState = {
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
      }
    };

    render(
      <ConditionalSimulationInterface
        worldBuilderState={mockWorldBuilderState}
        simulationState={null}
        templateManager={mockTemplateManager}
      />
    );

    // Should render the World Builder title
    expect(screen.getByText('World Builder')).toBeInTheDocument();
    
    // Should render the mocked WorldBuilderInterface component
    expect(screen.getByTestId('world-builder-interface')).toBeInTheDocument();
  });

  it('should render simulation interface when world is complete and simulation is initialized', () => {
    const mockWorldBuilderState = {
      currentStep: 6,
      isWorldComplete: true,
      stepValidationStatus: {
        1: true, 2: true, 3: true, 4: true, 5: true, 6: true
      },
      validationStatus: {
        isValid: true,
        errors: [],
        warnings: [],
        completeness: 1.0
      }
    };

    const mockSimulationState = {
      isInitialized: true,
      worldState: {
        npcs: [{ id: '1', name: 'Test NPC' }]
      }
    };

    render(
      <ConditionalSimulationInterface
        worldBuilderState={mockWorldBuilderState}
        simulationState={mockSimulationState}
        templateManager={mockTemplateManager}
      />
    );

    // Should render simulation interface components
    expect(screen.getByTestId('simulation-control')).toBeInTheDocument();
    expect(screen.getByTestId('world-map')).toBeInTheDocument();
    expect(screen.getByTestId('npc-viewer')).toBeInTheDocument();
    expect(screen.getByTestId('history-timeline')).toBeInTheDocument();
  });
});