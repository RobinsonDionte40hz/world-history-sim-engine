// src/presentation/hooks/useSimulation.js

import { useState, useEffect, useCallback } from 'react';
import SimulationService from '../../application/use-cases/services/SimulationService.js';

const useSimulation = () => {
  const [worldState, setWorldState] = useState(SimulationService.worldState || SimulationService.loadState());
  const [isRunning, setIsRunning] = useState(SimulationService.isRunning);
  const [historyAnalysis, setHistoryAnalysis] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(() => {
    try {
      const turn = SimulationService.getCurrentTurn();
      if (typeof turn !== 'number' || !Number.isFinite(turn) || turn < 0) {
        console.error('useSimulation: Invalid turn value from service:', turn);
        return 0;
      }
      return turn;
    } catch (error) {
      console.error('useSimulation: Error getting current turn during initialization:', error);
      return 0;
    }
  });

  // Sync with service on mount
  useEffect(() => {
    if (!worldState) {
      SimulationService.initialize();  // Auto-init if no state
      setWorldState(SimulationService.worldState);
    }

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

    // Cleanup
    return () => {
      SimulationService.setOnTick(null);  // Remove callback
    };
  }, [worldState]);

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
    SimulationService.start();
    setIsRunning(true);
  }, []);

  const stopSimulation = useCallback(() => {
    SimulationService.stop();
    setIsRunning(false);
  }, []);

  const resetSimulation = useCallback(() => {
    try {
      const newWorldState = SimulationService.reset();
      
      // Validate the reset state before using it
      if (!newWorldState) {
        console.error('useSimulation: resetSimulation received null/undefined state');
        setCurrentTurn(0);
        return null;
      }
      
      setWorldState(newWorldState);
      setIsRunning(false);
      
      // Get and validate the current turn after reset
      const newTurn = SimulationService.getCurrentTurn();
      if (typeof newTurn === 'number' && Number.isFinite(newTurn) && newTurn >= 0) {
        setCurrentTurn(newTurn);
      } else {
        console.error('useSimulation: Invalid turn value after reset:', newTurn);
        setCurrentTurn(0);
      }
      
      return newWorldState;
    } catch (error) {
      console.error('useSimulation: Error resetting simulation:', error);
      setCurrentTurn(0);
      setIsRunning(false);
      return null;
    }
  }, []);

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
    historyAnalysis,
    currentTurn,
    startSimulation,
    stopSimulation,
    resetSimulation,
    stepSimulation,
    analyzeHistory,
  };
};

export default useSimulation;