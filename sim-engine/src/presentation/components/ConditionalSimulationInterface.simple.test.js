/**
 * Simple ConditionalSimulationInterface Test
 * Basic test to verify component can be imported and rendered
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

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

// Import the component after mocking dependencies
import ConditionalSimulationInterface from './ConditionalSimulationInterface.js';

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

    const { getByText } = render(
      <ConditionalSimulationInterface
        worldBuilderState={mockWorldBuilderState}
        simulationState={null}
        templateManager={mockTemplateManager}
      />
    );

    expect(getByText('World Builder')).toBeInTheDocument();
  });
});