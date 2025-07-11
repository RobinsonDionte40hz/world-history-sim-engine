// src/presentation/hooks/useSimulation.js

import { useState, useEffect, useCallback } from 'react';
import SimulationService from '../../application/use-cases/services/SimulationService.js';

const useSimulation = () => {
  const [worldState, setWorldState] = useState(SimulationService.worldState || SimulationService.loadState());
  const [isRunning, setIsRunning] = useState(SimulationService.isRunning);
  const [historyAnalysis, setHistoryAnalysis] = useState(null);

  // Sync with service on mount
  useEffect(() => {
    if (!worldState) {
      SimulationService.initialize();  // Auto-init if no state
      setWorldState(SimulationService.worldState);
    }

    // Set onTick callback for real-time updates
    SimulationService.setOnTick((updatedState) => {
      setWorldState(updatedState);
    });

    // Cleanup
    return () => {
      SimulationService.setOnTick(null);  // Remove callback
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is intentional - we only want to set up the callback once

  const startSimulation = useCallback(() => {
    SimulationService.start();
    setIsRunning(true);
  }, []);

  const stopSimulation = useCallback(() => {
    SimulationService.stop();
    setIsRunning(false);
  }, []);

  const analyzeHistory = useCallback((criteria = {}) => {
    const analysis = SimulationService.getHistoryAnalysis(criteria);
    setHistoryAnalysis(analysis);
    return analysis;
  }, []);

  return {
    worldState,
    isRunning,
    historyAnalysis,
    startSimulation,
    stopSimulation,
    analyzeHistory,
  };
};

export default useSimulation;