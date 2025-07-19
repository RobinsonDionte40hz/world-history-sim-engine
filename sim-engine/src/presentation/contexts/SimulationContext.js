/**
 * SimulationContext - Modified to support mappless world state and template manager
 * 
 * Modifies SimulationContext to support mappless world state.
 * Adds template manager initialization and injection for all template types.
 * Ensures no automatic simulation startup (only manual after world completion).
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import React, { createContext, useContext, useState } from 'react';
import useSimulation from '../hooks/useSimulation.js';
import useWorldBuilder from '../hooks/useWorldBuilder.js';
import TemplateManager from '../../template/TemplateManager.js';

const SimulationContext = createContext();

export const SimulationProvider = ({ children }) => {
  // Initialize template manager for all template types
  const [templateManager] = useState(() => new TemplateManager());
  
  // Initialize world builder with template manager
  const worldBuilderState = useWorldBuilder(templateManager);
  
  // Initialize simulation with world builder state dependency
  // Only initialize if world is complete (Step 6 validation passes)
  const worldStateForSimulation = worldBuilderState?.isWorldComplete 
    ? worldBuilderState 
    : null;
    
  const simulationState = useSimulation(worldStateForSimulation);
  
  // Combined context value with both world building and simulation state
  const contextValue = {
    // Template manager
    templateManager,
    
    // World builder state and methods
    worldBuilder: worldBuilderState,
    
    // Simulation state and methods
    simulation: simulationState,
    
    // Legacy compatibility - expose simulation properties at root level
    worldState: simulationState?.worldState || null,
    isInitialized: simulationState?.isInitialized || false,
    initializationError: simulationState?.initializationError || null,
    historyAnalysis: simulationState?.historyAnalysis || null,
    currentTurn: simulationState?.currentTurn || 0,
    turnSummary: simulationState?.turnSummary || null,
    turnHistory: simulationState?.turnHistory || [],
    canProcessTurn: simulationState?.canProcessTurn || false,
    
    // Turn-based actions
    initializeWorld: simulationState?.initializeWorld || (() => false),
    resetSimulation: simulationState?.resetSimulation || (() => false),
    processTurn: simulationState?.processTurn || (() => ({ success: false, error: 'Not available' })),
    getTurnHistory: simulationState?.getTurnHistory || (() => []),
    analyzeHistory: simulationState?.analyzeHistory || (() => null),
    
    // World building completion status
    isWorldComplete: worldBuilderState?.isWorldComplete || false,
    canInitializeSimulation: worldBuilderState?.isWorldComplete && worldBuilderState?.stepValidationStatus?.[6]
  };

  return (
    <SimulationContext.Provider value={contextValue}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulationContext = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulationContext must be used within a SimulationProvider');
  }
  return context;
};