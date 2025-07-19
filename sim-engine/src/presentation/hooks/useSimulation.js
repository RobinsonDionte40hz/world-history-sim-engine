// src/presentation/hooks/useSimulation.js

import { useState, useEffect, useCallback } from 'react';
import SimulationService from '../../application/use-cases/services/SimulationService.js';

const useSimulation = (worldBuilderState = null) => {
  const [worldState, setWorldState] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
  const [historyAnalysis, setHistoryAnalysis] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(0);

  // Initialize simulation only when valid world builder state is provided
  useEffect(() => {
    if (worldBuilderState && worldBuilderState.isValid && worldBuilderState.stepValidation[6]) {
      try {
        // Convert world builder state to simulation config
        const simulationConfig = worldBuilderState.toSimulationConfig();
        const initializedState = SimulationService.initialize(simulationConfig);
        setWorldState(initializedState);
        setIsInitialized(true);
        setInitializationError(null);
      } catch (error) {
        console.error('useSimulation: Failed to initialize simulation from world builder state:', error);
        setInitializationError(error.message);
        setIsInitialized(false);
        setWorldState(null);
      }
    } else {
      // Clear simulation state if world builder state is invalid
      setWorldState(null);
      setIsInitialized(false);
      setInitializationError(null);
    }
  }, [worldBuilderState]);

  // Set up onTick callback when simulation is initialized
  useEffect(() => {
    if (isInitialized) {
      // Set onTick callback for real-time updates
      SimulationService.setOnTick((updatedState) => {
        try {
          // Validate the updated state before using it
          if (!updatedState) {
            console.error('useSimulation: onTick received null/undefined state');
            return;
          }

          setWorldState(updatedState);
          
          // Get and validate the current turn
          const newTurn = SimulationService.getCurrentTurn();
          if (typeof newTurn === 'number' && Number.isFinite(newTurn) && newTurn >= 0) {
            setCurrentTurn(newTurn);
          } else {
            console.error('useSimulation: Invalid turn value in onTick:', newTurn);
            // Don't update currentTurn to preserve last known good value
          }
        } catch (error) {
          console.error('useSimulation: Error in onTick callback:', error);
          console.error('useSimulation: Updated state:', updatedState);
          // Don't update currentTurn on error to preserve last known good value
        }
      });
    }

    // Cleanup
    return () => {
      SimulationService.setOnTick(null);  // Remove callback
    };
  }, [isInitialized]);

  // Update currentTurn when worldState changes
  useEffect(() => {
    try {
      const newTurn = SimulationService.getCurrentTurn();
      if (typeof newTurn === 'number' && Number.isFinite(newTurn) && newTurn >= 0) {
        setCurrentTurn(newTurn);
      } else {
        console.error('useSimulation: Invalid turn value during worldState sync:', newTurn);
        // Don't update currentTurn to preserve last known good value
      }
    } catch (error) {
      console.error('useSimulation: Error syncing current turn with world state:', error);
      console.error('useSimulation: WorldState:', worldState);
      // Don't update currentTurn on error to preserve last known good value
    }
  }, [worldState]);

  const startSimulation = useCallback(() => {
    if (!isInitialized || !worldState) {
      throw new Error('Cannot start simulation without valid world state');
    }
    SimulationService.start();
    setIsRunning(true);
  }, [isInitialized, worldState]);

  const stopSimulation = useCallback(() => {
    SimulationService.stop();
    setIsRunning(false);
  }, []);

  const resetSimulation = useCallback(() => {
    if (!isInitialized) {
      console.warn('useSimulation: Cannot reset - simulation not initialized');
      return null;
    }
    
    try {
      SimulationService.stop(); // Stop if running
      setIsRunning(false);
      setWorldState(null);
      setCurrentTurn(0);
      setIsInitialized(false);
      setInitializationError(null);
      
      return null; // Reset clears state, re-initialization requires valid world builder state
    } catch (error) {
      console.error('useSimulation: Error resetting simulation:', error);
      setCurrentTurn(0);
      setIsRunning(false);
      setIsInitialized(false);
      return null;
    }
  }, [isInitialized]);

  const stepSimulation = useCallback(() => {
    if (isRunning) {
      console.warn('useSimulation: Cannot step while simulation is running');
      return;
    }
    try {
      const updatedState = SimulationService.step();
      
      // Validate the updated state before using it
      if (!updatedState) {
        console.error('useSimulation: stepSimulation received null/undefined state');
        return;
      }
      
      setWorldState(updatedState);
      
      // Get and validate the current turn after step
      const newTurn = SimulationService.getCurrentTurn();
      if (typeof newTurn === 'number' && Number.isFinite(newTurn) && newTurn >= 0) {
        setCurrentTurn(newTurn);
      } else {
        console.error('useSimulation: Invalid turn value after step:', newTurn);
        setCurrentTurn(0);
      }
      
      return updatedState;
    } catch (error) {
      console.error('useSimulation: Error stepping simulation:', error);
      // Don't update state on step failure to preserve current state
    }
  }, [isRunning]);

  const analyzeHistory = useCallback((criteria = {}) => {
    const analysis = SimulationService.getHistoryAnalysis(criteria);
    setHistoryAnalysis(analysis);
    return analysis;
  }, []);

  return {
    worldState,
    isRunning,
    isInitialized,
    initializationError,
    historyAnalysis,
    currentTurn,
    canStart: isInitialized && !isRunning,
    startSimulation,
    stopSimulation,
    resetSimulation,
    stepSimulation,
    analyzeHistory,
  };
};

export default useSimulation;