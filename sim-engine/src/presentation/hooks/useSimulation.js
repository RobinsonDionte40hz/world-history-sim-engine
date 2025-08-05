// src/presentation/hooks/useSimulation.js

import { useState, useEffect, useCallback } from 'react';
import SimulationService from '../../application/use-cases/services/SimulationService.js';

/**
 * Check if world is ready for simulation based on content completion
 * @param {Object} worldBuilderState - World builder state
 * @returns {boolean} Whether world is ready for simulation
 */
const isWorldReadyForSimulation = (worldBuilderState) => {
  if (!worldBuilderState || !worldBuilderState.isValid) {
    return false;
  }

  // Check for manual world building completion requirements
  const config = worldBuilderState.worldConfig || worldBuilderState;
  
  // 1. World must exist with basic properties
  if (!config.name || !config.description) {
    return false;
  }

  // 2. At least one node must exist
  if (!config.nodes || config.nodes.length === 0) {
    return false;
  }

  // 3. At least one interaction must exist
  if (!config.interactions || config.interactions.length === 0) {
    return false;
  }

  // 4. At least one character must exist
  if (!config.characters || config.characters.length === 0) {
    return false;
  }

  // 5. All nodes must have at least one character assigned
  const nodePopulations = config.nodePopulations || {};
  const populatedNodes = Object.keys(nodePopulations).filter(
    nodeId => nodePopulations[nodeId] && nodePopulations[nodeId].length > 0
  );
  
  if (populatedNodes.length !== config.nodes.length) {
    return false;
  }

  // 6. All characters must have at least one interaction capability
  const charactersWithInteractions = config.characters.filter(
    character => character.assignedInteractions && character.assignedInteractions.length > 0
  );
  
  if (charactersWithInteractions.length !== config.characters.length) {
    return false;
  }

  return true;
};

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
    if (worldBuilderState && worldBuilderState.isValid && isWorldReadyForSimulation(worldBuilderState)) {
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
        
        // Save state after successful turn processing
        try {
          if (SimulationService.saveState) {
            SimulationService.saveState(result.worldState);
          }
        } catch (saveError) {
          console.warn('useSimulation: Could not save state after turn processing:', saveError);
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
    isRunning: false, // Deprecated but kept for compatibility
    isInitialized,
    initializationError,
    historyAnalysis,
    currentTurn,
    turnSummary,
    turnHistory,
    canStart: isInitialized && !!worldState, // Deprecated alias for canProcessTurn
    canProcessTurn: isInitialized && !!worldState,
    startSimulation: processTurn, // Deprecated alias for processTurn
    stopSimulation: resetSimulation, // Deprecated alias
    resetSimulation,
    stepSimulation: processTurn, // Deprecated alias for processTurn
    processTurn,
    getTurnHistory,
    analyzeHistory,
    initializeWorld
  };
};

export default useSimulation;