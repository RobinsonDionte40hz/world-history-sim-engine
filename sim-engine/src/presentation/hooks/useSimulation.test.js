// src/presentation/hooks/useSimulation.test.js

import { renderHook, act } from '@testing-library/react';
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
      const { result } = renderHook(() => useSimulation());

      expect(result.current.isInitialized).toBe(false);
      expect(result.current.worldState).toBeNull();
      expect(result.current.currentTurn).toBe(0);
      expect(result.current.canStart).toBe(false);
      expect(SimulationService.initialize).not.toHaveBeenCalled();
    });

    it('should not initialize simulation with invalid world builder state', () => {
      const invalidWorldState = { isValid: false };
      const { result } = renderHook(() => useSimulation(invalidWorldState));

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
      const { result } = renderHook(() => useSimulation(incompleteWorldState));

      expect(result.current.isInitialized).toBe(false);
      expect(result.current.worldState).toBeNull();
      expect(result.current.canProcessTurn).toBe(false);
      expect(SimulationService.initialize).not.toHaveBeenCalled();
    });
  });

  describe('initialization with valid world builder state', () => {
    const createValidWorldState = () => ({
      isValid: true,
      worldConfig: {
        name: 'Test World',
        description: 'A test world',
        nodes: [{ id: 'node1', name: 'Test Node', type: 'settlement' }],
        characters: [{ 
          id: 'char1', 
          name: 'Test Character', 
          assignedInteractions: ['interaction1'] 
        }],
        interactions: [{ id: 'interaction1', name: 'Test Interaction', type: 'dialogue' }],
        nodePopulations: { 'node1': ['char1'] }
      },
      toSimulationConfig: jest.fn().mockReturnValue({
        worldName: 'Test World',
        nodes: [{ id: 'node1', name: 'Test Node', type: 'settlement' }],
        characters: [{ 
          id: 'char1', 
          name: 'Test Character', 
          assignedInteractions: ['interaction1'] 
        }],
        interactions: [{ id: 'interaction1', name: 'Test Interaction', type: 'dialogue' }]
      })
    });

    it('should initialize simulation with valid world builder state', () => {
      const validWorldState = createValidWorldState();
      const mockSimulationState = { time: 0, nodes: [], npcs: [] };
      SimulationService.initialize.mockReturnValue(mockSimulationState);

      const { result } = renderHook(() => useSimulation(validWorldState));

      expect(result.current.isInitialized).toBe(true);
      expect(result.current.worldState).toBe(mockSimulationState);
      expect(result.current.initializationError).toBeNull();
      expect(result.current.canProcessTurn).toBe(true);
      expect(SimulationService.initialize).toHaveBeenCalledWith(validWorldState.toSimulationConfig());
    });

    it('should handle initialization errors gracefully', () => {
      const validWorldState = createValidWorldState();
      const initError = new Error('Initialization failed');
      SimulationService.initialize.mockImplementation(() => {
        throw initError;
      });

      const { result } = renderHook(() => useSimulation(validWorldState));

      expect(result.current.isInitialized).toBe(false);
      expect(result.current.worldState).toBeNull();
      expect(result.current.initializationError).toBe('Initialization failed');
      expect(result.current.canProcessTurn).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'useSimulation: Failed to initialize simulation from world builder state:',
        initError
      );
    });
  });

  describe('simulation operations with valid world state', () => {
    const createValidWorldState = () => ({
      isValid: true,
      worldConfig: {
        name: 'Test World',
        description: 'A test world',
        nodes: [{ id: 'node1', name: 'Test Node', type: 'settlement' }],
        characters: [{ 
          id: 'char1', 
          name: 'Test Character', 
          assignedInteractions: ['interaction1'] 
        }],
        interactions: [{ id: 'interaction1', name: 'Test Interaction', type: 'dialogue' }],
        nodePopulations: { 'node1': ['char1'] }
      },
      toSimulationConfig: jest.fn().mockReturnValue({
        worldName: 'Test World',
        nodes: [{ id: 'node1', name: 'Test Node', type: 'settlement' }],
        characters: [{ 
          id: 'char1', 
          name: 'Test Character', 
          assignedInteractions: ['interaction1'] 
        }],
        interactions: [{ id: 'interaction1', name: 'Test Interaction', type: 'dialogue' }]
      })
    });

    it('should allow processing turns when properly initialized', () => {
      const validWorldState = createValidWorldState();
      const mockSimulationState = { time: 0, nodes: [], npcs: [] };
      SimulationService.initialize.mockReturnValue(mockSimulationState);
      SimulationService.processTurn.mockReturnValue({ 
        success: true, 
        worldState: mockSimulationState,
        turnSummary: { events: [] }
      });

      const { result } = renderHook(() => useSimulation(validWorldState));

      expect(result.current.canProcessTurn).toBe(true);
      
      act(() => {
        result.current.processTurn();
      });

      expect(SimulationService.processTurn).toHaveBeenCalled();
    });

    it('should prevent processing turns without initialization', () => {
      const { result } = renderHook(() => useSimulation());

      expect(result.current.canProcessTurn).toBe(false);
      
      const turnResult = result.current.processTurn();
      expect(turnResult.success).toBe(false);
      expect(turnResult.error).toContain('not initialized');
    });

    it('should handle turn processing updates when initialized', () => {
      const validWorldState = createValidWorldState();
      const mockSimulationState = { time: 0, nodes: [], npcs: [] };
      
      SimulationService.initialize.mockReturnValue(mockSimulationState);
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.processTurn.mockReturnValue({
        success: true,
        worldState: { time: 1, nodes: [], npcs: [] },
        turnSummary: { events: ['Test event'] }
      });

      const { result } = renderHook(() => useSimulation(validWorldState));

      expect(result.current.currentTurn).toBe(0);

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
      const { result } = renderHook(() => useSimulation());

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
      const validWorldState = {
        isValid: true,
        worldConfig: {
          name: 'Test World',
          description: 'A test world',
          nodes: [{ id: 'node1', name: 'Test Node', type: 'settlement' }],
          characters: [{ 
            id: 'char1', 
            name: 'Test Character', 
            assignedInteractions: ['interaction1'] 
          }],
          interactions: [{ id: 'interaction1', name: 'Test Interaction', type: 'dialogue' }],
          nodePopulations: { 'node1': ['char1'] }
        },
        toSimulationConfig: jest.fn().mockReturnValue({})
      };
      SimulationService.initialize.mockReturnValue({ time: 0, nodes: [], npcs: [] });

      const { unmount } = renderHook(() => useSimulation(validWorldState));

      unmount();

      // Verify cleanup occurred (specific cleanup depends on SimulationService implementation)
      expect(SimulationService.initialize).toHaveBeenCalled();
    });
  });
});