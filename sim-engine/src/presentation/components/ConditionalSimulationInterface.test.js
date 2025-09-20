/**
 * ConditionalSimulationInterface Component Tests
 *
 * NOTE: ConditionalSimulationInterface has been deprecated and now re-exports WorldHistorySimInterface.
 * These tests have been updated to reflect the current implementation.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConditionalSimulationInterface from './ConditionalSimulationInterface.js';
import { SimulationProvider } from '../contexts/SimulationContext.js';

// Mock the simulation context
jest.mock('../contexts/SimulationContext.js', () => ({
  SimulationProvider: ({ children }) => <div data-testid="simulation-provider">{children}</div>,
  useSimulationContext: () => ({
    isInitialized: true,
    currentTurn: 0,
    canProcessTurn: true,
    resetSimulation: jest.fn(),
    processTurn: jest.fn(),
    simulationReadinessStatus: { isSimulationReady: true },
    preparedWorldData: { id: 'test-world' },
    turnHistory: [],
    currentSimulationState: {
      time: 0,
      characters: [],
      nodes: [],
      events: [],
      resources: { totalGold: 0 }
    },
    worldState: {
      time: 0,
      characters: [],
      nodes: [],
      events: [],
      resources: { totalGold: 0 }
    },
    lodStats: { hero: 0, group: 0, background: 0 },
    lodProcessingMetrics: { averageTurnDuration: 100 },
    isLODInitialized: false,
    getLODProcessingRecommendations: jest.fn(() => [
      {
        type: 'performance',
        message: 'Consider increasing background tier population to reduce processing time',
        severity: 'warning'
      }
    ])
  })
}));

describe('ConditionalSimulationInterface', () => {
  const defaultProps = {
    worldState: {
      time: 0,
      characters: [],
      nodes: [],
      events: [],
      resources: { totalGold: 0 }
    },
    simulationService: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Re-export Behavior', () => {
    it('should render WorldHistorySimInterface when simulation is initialized', () => {
      render(
        <SimulationProvider>
          <ConditionalSimulationInterface {...defaultProps} />
        </SimulationProvider>
      );

      // Should render the simulation interface header
      expect(screen.getByText('World History Simulation')).toBeInTheDocument();

      // Should show turn counter
      const header = screen.getByRole('banner');
      expect(header).toHaveTextContent('Turn: 0');

      // Should show navigation tabs
      expect(screen.getByText('overview')).toBeInTheDocument();
      expect(screen.getByText('timeline')).toBeInTheDocument();
      expect(screen.getByText('statistics')).toBeInTheDocument();
      expect(screen.getByText('characters')).toBeInTheDocument();
      expect(screen.getByText('settlements')).toBeInTheDocument();
      expect(screen.getByText('relationships')).toBeInTheDocument();
    });

    it('should show Process Turn and Reset buttons', () => {
      render(
        <SimulationProvider>
          <ConditionalSimulationInterface {...defaultProps} />
        </SimulationProvider>
      );

      expect(screen.getByText('Process Turn')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should display population and resource statistics', () => {
      render(
        <SimulationProvider>
          <ConditionalSimulationInterface {...defaultProps} />
        </SimulationProvider>
      );

      expect(screen.getByText('Total Population')).toBeInTheDocument();
      expect(screen.getByText('Active NPCs')).toBeInTheDocument();
      expect(screen.getByText('Total Resources')).toBeInTheDocument();
      expect(screen.getByText('Active Settlements')).toBeInTheDocument();
    });

    it('should show LOD system status when available', () => {
      render(
        <SimulationProvider>
          <ConditionalSimulationInterface {...defaultProps} />
        </SimulationProvider>
      );

      expect(screen.getByText('LOD Performance')).toBeInTheDocument();
      expect(screen.getByText('Hero NPCs')).toBeInTheDocument();
      expect(screen.getByText('Group NPCs')).toBeInTheDocument();
      expect(screen.getByText('Background NPCs')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should allow switching between different views', async () => {
      render(
        <SimulationProvider>
          <ConditionalSimulationInterface {...defaultProps} />
        </SimulationProvider>
      );

      // Should start on overview
      expect(screen.getByText('NPC Activity & Decisions')).toBeInTheDocument();

      // Click on statistics tab
      const statisticsTab = screen.getByText('statistics');
      fireEvent.click(statisticsTab);

      // Should show statistics view
      await waitFor(() => {
        expect(screen.getByText('Level of Detail (LOD) System')).toBeInTheDocument();
      });
    });

    it('should highlight the active navigation tab', () => {
      render(
        <SimulationProvider>
          <ConditionalSimulationInterface {...defaultProps} />
        </SimulationProvider>
      );

      // Overview tab should be active (blue styling)
      const overviewTab = screen.getByText('overview');
      expect(overviewTab).toHaveClass('border-blue-600', 'text-blue-600');
    });
  });

  describe('Turn Processing', () => {
    it('should enable Process Turn button when turn can be processed', () => {
      render(
        <SimulationProvider>
          <ConditionalSimulationInterface {...defaultProps} />
        </SimulationProvider>
      );

      const processButton = screen.getByText('Process Turn');
      expect(processButton).not.toBeDisabled();
    });

    it('should show turn counter with current value', () => {
      render(
        <SimulationProvider>
          <ConditionalSimulationInterface {...defaultProps} />
        </SimulationProvider>
      );

      // Look for the turn counter in the header specifically
      const header = screen.getByRole('banner');
      expect(header).toHaveTextContent('Turn: 0');
    });
  });

  describe('Data Display', () => {
    it('should show recent events when available', () => {
      const mockWithEvents = {
        ...defaultProps,
        worldState: {
          ...defaultProps.worldState,
          events: [
            {
              turn: 1,
              type: 'interaction',
              description: 'Test event occurred',
              timestamp: new Date().toISOString(),
              significance: 5
            }
          ]
        }
      };

      // Update the mock to include events in currentSimulationState
      const originalMock = jest.requireMock('../contexts/SimulationContext.js');
      originalMock.useSimulationContext = () => ({
        isInitialized: true,
        currentTurn: 0,
        canProcessTurn: true,
        resetSimulation: jest.fn(),
        processTurn: jest.fn(),
        simulationReadinessStatus: { isSimulationReady: true },
        preparedWorldData: { id: 'test-world' },
        turnHistory: [],
        currentSimulationState: {
          time: 0,
          characters: [],
          nodes: [],
          events: [
            {
              turn: 1,
              type: 'interaction',
              description: 'Test event occurred',
              timestamp: new Date().toISOString(),
              significance: 5
            }
          ],
          resources: { totalGold: 0 }
        },
        worldState: mockWithEvents.worldState,
        lodStats: { hero: 0, group: 0, background: 0 },
        lodProcessingMetrics: { averageTurnDuration: 100 },
        isLODInitialized: false,
        getLODProcessingRecommendations: jest.fn(() => [
          {
            type: 'performance',
            message: 'Consider increasing background tier population to reduce processing time',
            severity: 'warning'
          }
        ])
      });

      render(
        <SimulationProvider>
          <ConditionalSimulationInterface {...mockWithEvents} />
        </SimulationProvider>
      );

      expect(screen.getByText('Recent Events')).toBeInTheDocument();
      expect(screen.getByText('Test event occurred')).toBeInTheDocument();
    });

    it('should handle empty world state gracefully', () => {
      const emptyProps = {
        worldState: null,
        simulationService: {}
      };

      render(
        <SimulationProvider>
          <ConditionalSimulationInterface {...emptyProps} />
        </SimulationProvider>
      );

      // Should still render without crashing
      expect(screen.getByText('World History Simulation')).toBeInTheDocument();
    });
  });
});