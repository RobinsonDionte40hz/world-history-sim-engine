/**
 * SimulationContext - Enhanced with mandatory WorldBuilder preparation pipeline dependency
 * 
 * Enforces strict separation between world building and simulation phases.
 * Only accepts worlds that have been processed through the WorldBuilder preparation pipeline.
 * Validates simulation readiness and rejects unprepared world data.
 * Provides acceptPreparedWorld() method as the exclusive entry point for simulation-ready worlds.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import TemplateManager from '../../template/TemplateManager.js';
import pipelineValidationService from '../../application/services/PipelineValidationService.js';

const SimulationContext = createContext();

export const SimulationProvider = ({ children }) => {
  // Push context on mount, pop on unmount
  useEffect(() => {
    pipelineValidationService.pushContext('SimulationContext');
    return () => {
      pipelineValidationService.popContext();
    };
  }, []);
  // Initialize template manager for template operations (read-only in simulation context)
  const [templateManager] = useState(() => new TemplateManager());
  
  // State for prepared world data (only accepts pipeline output)
  const [preparedWorldData, setPreparedWorldData] = useState(null);
  const [pipelineValidationError, setPipelineValidationError] = useState(null);
  const [simulationReadinessStatus, setSimulationReadinessStatus] = useState({
    hasPreparedWorld: false,
    isSimulationReady: false,
    lastValidated: null,
    preparedAt: null,
    source: null,
    hasValidToken: false
  });
  
  // State for simulation management (managed internally, not via useSimulation hook)
  const [simulationState, setSimulationState] = useState({
    worldState: null,
    isInitialized: false,
    initializationError: null,
    historyAnalysis: null,
    currentTurn: 0,
    turnSummary: null,
    turnHistory: [],
    canProcessTurn: false,
    initializeWorld: () => {
      throw new Error('No prepared world available. Use acceptPreparedWorld() first.');
    },
    resetSimulation: () => {
      throw new Error('No prepared world available. Use acceptPreparedWorld() first.');
    },
    processTurn: () => {
      throw new Error('No prepared world available. Use acceptPreparedWorld() first.');
    },
    getTurnHistory: () => [],
    analyzeHistory: () => null
  });
  
  // Validation function to ensure world data comes from WorldBuilder pipeline
  const validatePreparedWorld = useCallback((worldData) => {
    const errors = [];
    const warnings = [];

    // Must have simulation metadata indicating pipeline processing
    if (!worldData?.simulationMetadata) {
      errors.push('Missing simulation metadata - world was not processed through WorldBuilder pipeline');
    } else {
      const metadata = worldData.simulationMetadata;
      
      // Must be prepared by WorldBuilder
      if (metadata.source !== 'WorldBuilder') {
        errors.push(`Invalid source: ${metadata.source}. Only WorldBuilder-prepared worlds are accepted.`);
      }
      
      // Must have preparation timestamp
      if (!metadata.preparedAt) {
        errors.push('Missing preparation timestamp - world preparation is incomplete');
      }
      
      // Check if preparation is recent (within last 24 hours for safety)
      if (metadata.preparedAt) {
        const preparedTime = new Date(metadata.preparedAt);
        const now = new Date();
        const timeDiff = now - preparedTime;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          warnings.push('World was prepared more than 24 hours ago - consider re-preparing for optimal simulation');
        }
      }
    }

    // Must have simulation-optimized data structures
    if (!worldData?.nodes || !(worldData.nodes instanceof Map)) {
      errors.push('Missing or invalid nodes Map - world was not properly prepared for simulation');
    }

    if (!worldData?.characters || !(worldData.characters instanceof Map)) {
      errors.push('Missing or invalid characters Map - world was not properly prepared for simulation');
    }

    if (!worldData?.interactions || !(worldData.interactions instanceof Map)) {
      errors.push('Missing or invalid interactions Map - world was not properly prepared for simulation');
    }

    // Must have world properties
    if (!worldData?.worldProperties) {
      errors.push('Missing world properties - world foundation was not properly prepared');
    } else {
      const props = worldData.worldProperties;
      if (!props.name || !props.description) {
        errors.push('Incomplete world properties - missing name or description');
      }
    }

    // Validate data integrity
    if (worldData?.nodes && worldData?.characters) {
      let unassignedCharacters = 0;
      
      worldData.characters.forEach((character, characterId) => {
        // Check if character is assigned to valid nodes
        const characterNodes = [];
        worldData.nodes.forEach((node, nodeId) => {
          if (node.characters && node.characters.some(c => c.id === characterId)) {
            characterNodes.push(nodeId);
          }
        });
        
        if (characterNodes.length === 0) {
          unassignedCharacters++;
        }
      });
      
      if (unassignedCharacters > 0) {
        warnings.push(`${unassignedCharacters} characters are not assigned to any location`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canProceed: errors.length === 0
    };
  }, []);

  // Exclusive method to accept prepared world data from WorldBuilder pipeline
  const acceptPreparedWorld = useCallback((worldData) => {
    try {
      // Reset previous errors
      setPipelineValidationError(null);
      
      // Validate that world comes from preparation pipeline
      const validation = validatePreparedWorld(worldData);
      
      if (!validation.isValid) {
        const errorMessage = `World preparation validation failed: ${validation.errors.join('; ')}`;
        setPipelineValidationError(errorMessage);
        
        // Clear any existing prepared world data
        setPreparedWorldData(null);
        setSimulationReadinessStatus({
          hasPreparedWorld: false,
          isSimulationReady: false,
          lastValidated: new Date().toISOString(),
          preparedAt: null,
          source: null,
          hasValidToken: false
        });
        
        throw new Error(errorMessage);
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        console.warn('World preparation warnings:', validation.warnings);
      }

      // Generate validation token for this world
      // Generate validation token for the prepared world
      pipelineValidationService.generateValidationToken(
        worldData,
        worldData.simulationMetadata?.source || 'WorldBuilder'
      );

      // Accept the prepared world data 
      setPreparedWorldData(worldData);
      setSimulationReadinessStatus({
        hasPreparedWorld: true,
        isSimulationReady: true,
        lastValidated: new Date().toISOString(),
        preparedAt: worldData.simulationMetadata?.preparedAt || null,
        source: worldData.simulationMetadata?.source || 'Unknown',
        hasValidToken: true
      });

      return {
        success: true,
        warnings: validation.warnings,
        worldData
      };
      
    } catch (error) {
      setPipelineValidationError(error.message);
      throw error;
    }
  }, [validatePreparedWorld]);

  // Method to clear prepared world and reset simulation
  const clearPreparedWorld = useCallback(() => {
    setPreparedWorldData(null);
    setPipelineValidationError(null);
    setSimulationReadinessStatus({
      hasPreparedWorld: false,
      isSimulationReady: false,
      lastValidated: null,
      preparedAt: null,
      source: null,
      hasValidToken: false
    });
  }, []);
  
  // Combined context value with simulation state and preparation pipeline integration
  const contextValue = {
    // Template manager (read-only access for simulation)
    templateManager,
    
    // Prepared world data and validation
    preparedWorldData,
    pipelineValidationError,
    simulationReadinessStatus,
    
    // Pipeline methods - exclusive entry points for simulation
    acceptPreparedWorld,
    clearPreparedWorld,
    validatePreparedWorld,
    
    // Simulation state and methods (only available with prepared world)
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
    
    // Turn-based actions (only available with prepared world)
    initializeWorld: simulationState?.initializeWorld || (() => {
      throw new Error('No prepared world available. Use acceptPreparedWorld() first.');
    }),
    resetSimulation: simulationState?.resetSimulation || (() => {
      throw new Error('No prepared world available. Use acceptPreparedWorld() first.');
    }),
    processTurn: simulationState?.processTurn || (() => {
      throw new Error('No prepared world available. Use acceptPreparedWorld() first.');
    }),
    getTurnHistory: simulationState?.getTurnHistory || (() => []),
    analyzeHistory: simulationState?.analyzeHistory || (() => null),
    
    // Simulation readiness status (based on prepared world, not world builder)
    isSimulationReady: simulationReadinessStatus.isSimulationReady,
    hasPreparedWorld: simulationReadinessStatus.hasPreparedWorld,
    canInitializeSimulation: simulationReadinessStatus.isSimulationReady && !simulationState?.isInitialized
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