/**
 * useSimulation - Hook for managing simulation state
 * 
 * This hook now only accepts prepared world data that has been validated
 * and processed through the SimulationContext pipeline. Direct world builder
 * state is no longer supported to enforce proper architectural boundaries.
 * 
 * IMPORTANT: This hook must only be used within SimulationContext to maintain
 * architectural integrity. Direct usage will throw an error.
 * 
 * @param {Object} preparedWorldData - World data prepared by WorldBuilder and validated by SimulationContext
 * @param {Object} validationToken - Security token from SimulationContext
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import SimulationService from '../../application/use-cases/services/SimulationService.js';
import pipelineValidationService from '../../application/services/PipelineValidationService.js';

/**
 * Validate that the world data has been properly prepared
 * @param {Object} preparedWorldData - Prepared world data from SimulationContext
 * @returns {boolean} Whether data is valid for simulation
 */
const isPreparedWorldValid = (preparedWorldData) => {
  if (!preparedWorldData) {
    return false;
  }

  // Must have simulation metadata from preparation pipeline
  if (!preparedWorldData.simulationMetadata || 
      preparedWorldData.simulationMetadata.source !== 'WorldBuilder') {
    return false;
  }

  // Must have proper data structures
  if (!preparedWorldData.nodes || !(preparedWorldData.nodes instanceof Map)) {
    return false;
  }

  if (!preparedWorldData.characters || !(preparedWorldData.characters instanceof Map)) {
    return false;
  }

  if (!preparedWorldData.interactions || !(preparedWorldData.interactions instanceof Map)) {
    return false;
  }

  if (!preparedWorldData.worldProperties) {
    return false;
  }

  return true;
};

const useSimulation = (preparedWorldData = null, validationToken = null) => {
  // Validate that this hook is being used within SimulationContext
  try {
    pipelineValidationService.requireSimulationContext();
  } catch (error) {
    console.error('useSimulation:', error.message);
    throw new Error(
      'useSimulation hook must be used within SimulationContext. ' +
      'Direct usage is not allowed. Import and use useSimulationContext() instead.'
    );
  }
  const [worldState, setWorldState] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
  const [historyAnalysis, setHistoryAnalysis] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null); // Start with null instead of 0
  const [turnSummary, setTurnSummary] = useState(null);
  const [turnHistory, setTurnHistory] = useState([]);

  // Initialize simulation only when valid prepared world data is provided
  useEffect(() => {
    if (preparedWorldData && isPreparedWorldValid(preparedWorldData)) {
      // Validate token if provided
      if (validationToken) {
        const tokenValidation = pipelineValidationService.validateToken(preparedWorldData, validationToken);
        if (!tokenValidation.isValid) {
          console.error('useSimulation: Token validation failed:', tokenValidation.error);
          setInitializationError(tokenValidation.error);
          setIsInitialized(false);
          setWorldState(null);
          return;
        }
      }
      
      try {
        // Initialize with prepared world data
        const initializedState = SimulationService.initialize(preparedWorldData);
        setWorldState(initializedState);
        setIsInitialized(true);
        setInitializationError(null);
        
        // Update current turn from initialized state
        const turn = SimulationService.getCurrentTurn();
        setCurrentTurn(turn);
      } catch (error) {
        console.error('useSimulation: Failed to initialize simulation from prepared world:', error);
        setInitializationError(error.message);
        setIsInitialized(false);
        setWorldState(null);
      }
    } else {
      // No valid prepared world data
      setWorldState(null);
      setIsInitialized(false);
      setInitializationError(null);
      
      // Set current turn to null to show "--" in UI
      setCurrentTurn(null);
    }
  }, [preparedWorldData, validationToken]);

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

  /**
   * @deprecated Direct world initialization is no longer supported.
   * Use SimulationContext.acceptPreparedWorld() instead.
   */
  const initializeWorld = useCallback(() => {
    const error = 'Direct world initialization is no longer supported. ' +
                  'Use SimulationContext.acceptPreparedWorld() with data from WorldBuilder.prepareForSimulation()';
    setInitializationError(error);
    console.error('useSimulation:', error);
    return false;
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