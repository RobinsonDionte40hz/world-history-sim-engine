// src/presentation/hooks/useSimulation.test.js

import { renderHook, act } from '@testing-library/react';
import { SimulationProvider } from '../contexts/SimulationContext.js';
import useSimulation from './useSimulation.js';
import SimulationService from '../../application/use-cases/services/SimulationService.js';

// Mock the SimulationService
jest.mock('../../application/use-cases/services/SimulationService.js', () => ({
  worldState: null,
  isRunning: false,
  initialize: jest.fn(),
  getCurrentTurn: jest.fn(),
  setOnTick: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  step: jest.fn(),
  getHistoryAnalysis: jest.fn(),
  processTurn: jest.fn(),
}));

// Mock the pipeline validation service
jest.mock('../../application/services/PipelineValidationService.js', () => ({
  __esModule: true,
  default: {
    requireSimulationContext: jest.fn(),
    pushContext: jest.fn(),
    popContext: jest.fn(),
    isInContext: jest.fn(() => true),
    generateValidationToken: jest.fn(() => 'mock-token'),
    validateToken: jest.fn(() => ({ isValid: true, error: null }))
  }
}));

describe('useSimulation Hook - Manual World Building Dependency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.error mock
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('initialization without world builder state', () => {
    it('should not initialize simulation without world builder state', () => {
      const { result } = renderHook(() => useSimulation(), {
        wrapper: SimulationProvider
      });

      expect(result.current.isInitialized).toBe(false);
      expect(result.current.worldState).toBeNull();
      expect(result.current.currentTurn).toBeNull(); // Hook initializes to null, not 0
      expect(result.current.canStart).toBe(false);
      expect(SimulationService.initialize).not.toHaveBeenCalled();
    });

    it('should not initialize simulation with invalid world builder state', () => {
      const invalidWorldState = { isValid: false };
      const { result } = renderHook(() => useSimulation(invalidWorldState), {
        wrapper: SimulationProvider
      });

      expect(result.current.isInitialized).toBe(false);
      expect(result.current.worldState).toBeNull();
      expect(result.current.canStart).toBe(false);
      expect(SimulationService.initialize).not.toHaveBeenCalled();
    });

    it('should not initialize simulation with incomplete world builder state', () => {
      const incompleteWorldState = { 
        isValid: true, 
        worldConfig: {
          name: 'Test World',
          description: 'A test world',
          nodes: [],  // Missing nodes
          characters: [],
          interactions: [],
          nodePopulations: {}
        }
      };
      const { result } = renderHook(() => useSimulation(incompleteWorldState), {
        wrapper: SimulationProvider
      });

      expect(result.current.isInitialized).toBe(false);
      expect(result.current.worldState).toBeNull();
      expect(result.current.canProcessTurn).toBe(false);
      expect(SimulationService.initialize).not.toHaveBeenCalled();
    });
  });

  describe('initialization with valid world builder state', () => {
    const createValidPreparedWorldData = () => ({
      simulationMetadata: {
        source: 'WorldBuilder',
        preparedAt: new Date().toISOString(),
        version: '1.0.0'
      },
      worldProperties: {
        name: 'Test World',
        description: 'A test world'
      },
      nodes: new Map([
        ['node1', { id: 'node1', name: 'Test Node', type: 'settlement' }]
      ]),
      characters: new Map([
        ['char1', { 
          id: 'char1', 
          name: 'Test Character'
        }]
      ]),
      interactions: new Map([
        ['interaction1', { id: 'interaction1', name: 'Test Interaction', type: 'dialogue' }]
      ])
    });

    it('should initialize simulation with valid world builder state', () => {
      const preparedWorldData = createValidPreparedWorldData();
      const mockSimulationState = { time: 0, nodes: [], npcs: [] };
      SimulationService.initialize.mockReturnValue(mockSimulationState);
      SimulationService.getCurrentTurn.mockReturnValue(0);

      const { result } = renderHook(() => useSimulation(preparedWorldData, 'mock-token'), {
        wrapper: SimulationProvider
      });

      // Wait for useEffect to run
      expect(SimulationService.initialize).toHaveBeenCalledWith(preparedWorldData);
      expect(result.current.isInitialized).toBe(true);
      expect(result.current.worldState).toBe(mockSimulationState);
      expect(result.current.initializationError).toBeNull();
      expect(result.current.canProcessTurn).toBe(true);
    });

    it('should handle initialization errors gracefully', () => {
      const preparedWorldData = createValidPreparedWorldData();
      const initError = new Error('Initialization failed');
      SimulationService.initialize.mockImplementation(() => {
        throw initError;
      });

      const { result } = renderHook(() => useSimulation(preparedWorldData, 'mock-token'), {
        wrapper: SimulationProvider
      });

      expect(result.current.isInitialized).toBe(false);
      expect(result.current.worldState).toBeNull();
      expect(result.current.initializationError).toBe('Initialization failed');
      expect(result.current.canProcessTurn).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'useSimulation: Failed to initialize simulation from prepared world:',
        initError
      );
    });
  });

  describe('simulation operations with valid world state', () => {
    const createValidPreparedWorldData = () => ({
      simulationMetadata: {
        source: 'WorldBuilder',
        preparedAt: new Date().toISOString(),
        version: '1.0.0'
      },
      worldProperties: {
        name: 'Test World',
        description: 'A test world'
      },
      nodes: new Map([
        ['node1', { id: 'node1', name: 'Test Node', type: 'settlement' }]
      ]),
      characters: new Map([
        ['char1', { 
          id: 'char1', 
          name: 'Test Character'
        }]
      ]),
      interactions: new Map([
        ['interaction1', { id: 'interaction1', name: 'Test Interaction', type: 'dialogue' }]
      ])
    });

    it('should allow processing turns when properly initialized', () => {
      const preparedWorldData = createValidPreparedWorldData();
      const mockSimulationState = { time: 0, nodes: [], npcs: [] };
      SimulationService.initialize.mockReturnValue(mockSimulationState);
      SimulationService.processTurn.mockReturnValue({ 
        success: true, 
        worldState: mockSimulationState,
        turnSummary: { events: [] }
      });

      const { result } = renderHook(() => useSimulation(preparedWorldData, 'mock-token'), {
        wrapper: SimulationProvider
      });

      expect(result.current.canProcessTurn).toBe(true);
      
      act(() => {
        result.current.processTurn();
      });

      expect(SimulationService.processTurn).toHaveBeenCalled();
    });

    it('should prevent processing turns without initialization', () => {
      const { result } = renderHook(() => useSimulation(), {
        wrapper: SimulationProvider
      });

      expect(result.current.canProcessTurn).toBe(false);
      
      const turnResult = result.current.processTurn();
      expect(turnResult.success).toBe(false);
      expect(turnResult.error).toContain('not initialized');
    });

    it('should handle turn processing updates when initialized', () => {
      const preparedWorldData = createValidPreparedWorldData();
      const mockSimulationState = { time: 0, nodes: [], npcs: [] };
      
      SimulationService.initialize.mockReturnValue(mockSimulationState);
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.processTurn.mockReturnValue({
        success: true,
        worldState: { time: 1, nodes: [], npcs: [] },
        turnSummary: { events: ['Test event'] }
      });

      const { result } = renderHook(() => useSimulation(preparedWorldData, 'mock-token'), {
        wrapper: SimulationProvider
      });

      expect(result.current.currentTurn).toBeNull();

      // Process a turn
      SimulationService.getCurrentTurn.mockReturnValue(1);
      act(() => {
        result.current.processTurn();
      });

      expect(result.current.currentTurn).toBe(1);
      expect(result.current.turnSummary).toEqual({ events: ['Test event'] });
    });
  });

  describe('hook return value', () => {
    it('should include all expected properties', () => {
      const { result } = renderHook(() => useSimulation(), {
        wrapper: SimulationProvider
      });

      // Check that all expected properties are present
      expect(result.current).toHaveProperty('worldState');
      expect(result.current).toHaveProperty('isRunning');
      expect(result.current).toHaveProperty('isInitialized');
      expect(result.current).toHaveProperty('initializationError');
      expect(result.current).toHaveProperty('historyAnalysis');
      expect(result.current).toHaveProperty('currentTurn');
      expect(result.current).toHaveProperty('canProcessTurn');
      expect(result.current).toHaveProperty('processTurn');
      expect(result.current).toHaveProperty('resetSimulation');
      expect(result.current).toHaveProperty('getTurnHistory');
      expect(result.current).toHaveProperty('analyzeHistory');
      expect(result.current).toHaveProperty('initializeWorld');
      expect(result.current).toHaveProperty('turnSummary');
      expect(result.current).toHaveProperty('turnHistory');
    });
  });

  describe('cleanup', () => {
    it('should handle cleanup on unmount', () => {
      const preparedWorldData = {
        simulationMetadata: {
          source: 'WorldBuilder',
          preparedAt: new Date().toISOString(),
          version: '1.0.0'
        },
        worldProperties: {
          name: 'Test World',
          description: 'A test world'
        },
        nodes: new Map([
          ['node1', { id: 'node1', name: 'Test Node', type: 'settlement' }]
        ]),
        characters: new Map([
          ['char1', { 
            id: 'char1', 
            name: 'Test Character'
          }]
        ]),
        interactions: new Map([
          ['interaction1', { id: 'interaction1', name: 'Test Interaction', type: 'dialogue' }]
        ])
      };
      SimulationService.initialize.mockReturnValue({ time: 0, nodes: [], npcs: [] });

      const { result, unmount } = renderHook(() => useSimulation(preparedWorldData, 'mock-token'), {
        wrapper: SimulationProvider
      });

      // Verify state before unmount
      expect(result.current.isInitialized).toBe(true);

      unmount();

      // After unmount, we can't check result.current, but we can verify the hook was initialized
      expect(SimulationService.initialize).toHaveBeenCalled();
    });
  });
});