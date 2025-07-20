// src/presentation/hooks/useSimulation.js

import { useState, useEffect, useCallback } from 'react';
import SimulationService from '../../application/use-cases/services/SimulationService.js';

const useSimulation = (worldBuilderState = null) => {
  const [worldState, setWorldState] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
  const [historyAnalysis, setHistoryAnalysis] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null); // Start with null instead of 0
  const [turnSummary, setTurnSummary] = useState(null);
  const [turnHistory, setTurnHistory] = useState([]);

  // Initialize simulation only when valid world builder state is provided
  useEffect(() => {
    if (worldBuilderState && worldBuilderState.isValid && worldBuilderState.stepValidation && worldBuilderState.stepValidation[6]) {
      try {
        // Convert world builder state to simulation config
        const simulationConfig = worldBuilderState.toSimulationConfig();
        const initializedState = SimulationService.initialize(simulationConfig);
        setWorldState(initializedState);
        setIsInitialized(true);
        setInitializationError(null);
        
        // Update current turn from initialized state
        const turn = SimulationService.getCurrentTurn();
        setCurrentTurn(turn);
      } catch (error) {
        console.error('useSimulation: Failed to initialize simulation from world builder state:', error);
        setInitializationError(error.message);
        setIsInitialized(false);
        setWorldState(null);
      }
    } else {
      // Don't auto-load from localStorage - only initialize when world is complete
      setWorldState(null);
      setIsInitialized(false);
      setInitializationError(null);
      
      // Set current turn to null to show "--" in UI
      setCurrentTurn(null);
    }
  }, [worldBuilderState]);

  // Update currentTurn when worldState changes
  useEffect(() => {
    if (worldState) {
      try {
        const newTurn = SimulationService.getCurrentTurn();
        if (typeof newTurn === 'number' && Number.isFinite(newTurn) && newTurn >= 0) {
          setCurrentTurn(newTurn);
        } else {
          console.error('useSimulation: Invalid turn value during worldState sync:', newTurn);
          setCurrentTurn(null); // Use null for invalid values to trigger "--" display
        }
      } catch (error) {
        console.error('useSimulation: Error syncing current turn with world state:', error);
        setCurrentTurn(null); // Use null for errors to trigger "--" display
      }
    }
  }, [worldState]);

  const resetSimulation = useCallback(() => {
    try {
      SimulationService.reset(); // Clear saved state
      setWorldState(null);
      setCurrentTurn(0);
      setIsInitialized(false);
      setInitializationError(null);
      setTurnSummary(null);
      setTurnHistory([]);
      return true;
    } catch (error) {
      console.error('useSimulation: Error resetting simulation:', error);
      return false;
    }
  }, []);

  const processTurn = useCallback(() => {
    if (!isInitialized || !worldState) {
      const error = 'Cannot process turn: Simulation not initialized';
      setInitializationError(error);
      return { success: false, error };
    }
    
    try {
      const result = SimulationService.processTurn();
      
      if (result && result.success) {
        setWorldState(result.worldState);
        setTurnSummary(result.turnSummary);
        
        // Update turn counter
        const newTurn = SimulationService.getCurrentTurn();
        if (typeof newTurn === 'number' && Number.isFinite(newTurn) && newTurn >= 0) {
          setCurrentTurn(newTurn);
        }
        
        // Update turn history
        try {
          const history = SimulationService.getTurnHistory(10); // Get last 10 turns
          setTurnHistory(history || []);
        } catch (historyError) {
          console.warn('useSimulation: Could not update turn history:', historyError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('useSimulation: Error processing turn:', error);
      return { success: false, error: error.message };
    }
  }, [isInitialized, worldState]);

  // Get turn history for display
  const getTurnHistory = useCallback((count) => {
    return SimulationService.getTurnHistory(count);
  }, []);

  const analyzeHistory = useCallback((criteria = {}) => {
    const analysis = SimulationService.getHistoryAnalysis(criteria);
    setHistoryAnalysis(analysis);
    return analysis;
  }, []);

  const initializeWorld = useCallback((worldBuilderState) => {
    if (!worldBuilderState || !worldBuilderState.isValid) {
      const error = 'Cannot initialize: Invalid world builder state';
      setInitializationError(error);
      return false;
    }

    try {
      const simulationConfig = worldBuilderState.toSimulationConfig();
      const initializedState = SimulationService.initialize(simulationConfig);
      setWorldState(initializedState);
      setIsInitialized(true);
      setInitializationError(null);
      setCurrentTurn(SimulationService.getCurrentTurn());
      return true;
    } catch (error) {
      console.error('useSimulation: Failed to initialize world:', error);
      setInitializationError(error.message);
      return false;
    }
  }, []);

  return {
    worldState,
    isInitialized,
    initializationError,
    historyAnalysis,
    currentTurn,
    turnSummary,
    turnHistory,
    canProcessTurn: isInitialized && !!worldState,
    resetSimulation,
    processTurn,
    getTurnHistory,
    analyzeHistory,
    initializeWorld
  };
};

export default useSimulation;