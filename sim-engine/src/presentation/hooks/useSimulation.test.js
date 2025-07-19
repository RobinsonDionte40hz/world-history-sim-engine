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

describe('useSimulation Hook - Six-Step World Dependency', () => {
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
        stepValidation: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: false }
      };
      const { result } = renderHook(() => useSimulation(incompleteWorldState));

      expect(result.current.isInitialized).toBe(false);
      expect(result.current.worldState).toBeNull();
      expect(result.current.canStart).toBe(false);
      expect(SimulationService.initialize).not.toHaveBeenCalled();
    });
  });

  describe('initialization with valid world builder state', () => {
    const createValidWorldState = () => ({
      isValid: true,
      stepValidation: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true },
      toSimulationConfig: jest.fn().mockReturnValue({
        worldName: 'Test World',
        nodes: [],
        characters: [],
        interactions: []
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
      expect(result.current.canStart).toBe(true);
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
      expect(result.current.canStart).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'useSimulation: Failed to initialize simulation from world builder state:',
        initError
      );
    });
  });

  describe('simulation operations with valid world state', () => {
    const createValidWorldState = () => ({
      isValid: true,
      stepValidation: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true },
      toSimulationConfig: jest.fn().mockReturnValue({
        worldName: 'Test World',
        nodes: [],
        characters: [],
        interactions: []
      })
    });

    it('should allow starting simulation when properly initialized', () => {
      const validWorldState = createValidWorldState();
      const mockSimulationState = { time: 0, nodes: [], npcs: [] };
      SimulationService.initialize.mockReturnValue(mockSimulationState);

      const { result } = renderHook(() => useSimulation(validWorldState));

      expect(result.current.canStart).toBe(true);
      
      act(() => {
        result.current.startSimulation();
      });

      expect(SimulationService.start).toHaveBeenCalled();
      expect(result.current.isRunning).toBe(true);
    });

    it('should prevent starting simulation without initialization', () => {
      const { result } = renderHook(() => useSimulation());

      expect(() => {
        act(() => {
          result.current.startSimulation();
        });
      }).toThrow('Cannot start simulation without valid world state');
    });

    it('should handle onTick updates when initialized', () => {
      let onTickCallback;
      const validWorldState = createValidWorldState();
      const mockSimulationState = { time: 0, nodes: [], npcs: [] };
      
      SimulationService.initialize.mockReturnValue(mockSimulationState);
      SimulationService.getCurrentTurn.mockReturnValue(0);
      SimulationService.setOnTick.mockImplementation((callback) => {
        onTickCallback = callback;
      });

      const { result } = renderHook(() => useSimulation(validWorldState));

      expect(result.current.currentTurn).toBe(0);

      // Simulate a tick that increments the turn counter
      SimulationService.getCurrentTurn.mockReturnValue(1);
      act(() => {
        onTickCallback({ time: 1 });
      });

      expect(result.current.currentTurn).toBe(1);
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
      expect(result.current).toHaveProperty('canStart');
      expect(result.current).toHaveProperty('startSimulation');
      expect(result.current).toHaveProperty('stopSimulation');
      expect(result.current).toHaveProperty('resetSimulation');
      expect(result.current).toHaveProperty('stepSimulation');
      expect(result.current).toHaveProperty('analyzeHistory');
    });
  });

  describe('cleanup', () => {
    it('should remove onTick callback on unmount', () => {
      const validWorldState = {
        isValid: true,
        stepValidation: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true },
        toSimulationConfig: jest.fn().mockReturnValue({})
      };
      SimulationService.initialize.mockReturnValue({ time: 0, nodes: [], npcs: [] });

      const { unmount } = renderHook(() => useSimulation(validWorldState));

      unmount();

      expect(SimulationService.setOnTick).toHaveBeenCalledWith(null);
    });
  });
});