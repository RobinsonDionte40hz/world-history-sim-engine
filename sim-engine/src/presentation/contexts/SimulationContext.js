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
import simulationService from '../../application/use-cases/services/SimulationService.js';
import LODManager from '../../domain/services/LODManager.js';
import { LODTier } from '../../domain/value-objects/LODTier.js';

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
  
  // Initialize LOD manager for level-of-detail processing
  const [lodManager] = useState(() => new LODManager());
  
  // LOD State
  const [lodStats, setLodStats] = useState({
    hero: 0,
    group: 0,
    background: 0,
    total: 0
  });
  
  const [lodTierConfigurations] = useState({
    hero: LODTier.HERO,
    group: LODTier.GROUP,
    background: LODTier.BACKGROUND
  });
  
  const [lodProcessingMetrics, setLodProcessingMetrics] = useState({
    lastTurnDuration: 0,
    averageTurnDuration: 0,
    totalProcessed: 0,
    performanceHistory: []
  });
  
  const [lodTierTransitions, setLodTierTransitions] = useState([]);
  const [isLODInitialized, setIsLODInitialized] = useState(false);
  const [isLODProcessing, setIsLODProcessing] = useState(false);
  
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
  
  // Track validation token and simulation state directly
  const [validationToken, setValidationToken] = useState(null);
  const [currentSimulationState, setCurrentSimulationState] = useState(null);
  const [worldState, setWorldState] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [turnHistory, setTurnHistory] = useState([]);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  
  // LOD Helper Functions
  const updateLODStats = useCallback((worldState) => {
    if (!worldState?.characters) return;

    const characters = Array.from(worldState.characters.values());
    const stats = {
      hero: characters.filter(c => c.lodTier === 'hero').length,
      group: characters.filter(c => c.lodTier === 'group').length,
      background: characters.filter(c => c.lodTier === 'background').length,
      total: characters.length
    };

    setLodStats(stats);
  }, []);

  const updateLODPerformanceMetrics = useCallback((duration) => {
    setLodProcessingMetrics(prev => {
      const newHistory = [...prev.performanceHistory, duration].slice(-10); // Keep last 10
      const average = newHistory.reduce((sum, d) => sum + d, 0) / newHistory.length;

      return {
        lastTurnDuration: duration,
        averageTurnDuration: average,
        totalProcessed: prev.totalProcessed + 1,
        performanceHistory: newHistory
      };
    });
  }, []);

  const recordLODTierTransitions = useCallback((oldState, newState) => {
    if (!oldState?.characters || !newState?.characters) return;

    const transitions = [];

    oldState.characters.forEach((oldChar, charId) => {
      const newChar = newState.characters.get(charId);
      if (oldChar && newChar && oldChar.lodTier !== newChar.lodTier) {
        transitions.push({
          characterId: charId,
          characterName: oldChar.name || `Character ${charId}`,
          fromTier: oldChar.lodTier,
          toTier: newChar.lodTier,
          timestamp: Date.now(),
          reason: 'automatic'
        });
      }
    });

    if (transitions.length > 0) {
      setLodTierTransitions(prev => [...prev, ...transitions].slice(-20)); // Keep last 20
    }
  }, []);

  const initializeLODSystem = useCallback(async (worldState) => {
    if (!worldState) return;

    try {
      setIsLODProcessing(true);

      // Initialize LOD manager with world state
      await lodManager.initializeForWorld(worldState);

      // Update initial statistics
      updateLODStats(worldState);

      setIsLODInitialized(true);
      console.log('LOD system initialized successfully in SimulationContext');

    } catch (error) {
      console.error('Failed to initialize LOD system:', error);
    } finally {
      setIsLODProcessing(false);
    }
  }, [lodManager, updateLODStats]);

  const processLODTurn = useCallback(async (worldState) => {
    if (!isLODInitialized || !worldState) return worldState;

    const startTime = Date.now();
    setIsLODProcessing(true);

    try {
      // Process pre-turn LOD operations
      const preTurnResult = await lodManager.processPreTurnLOD(worldState);

      // Process post-turn LOD operations
      const postTurnResult = await lodManager.processPostTurnLOD(preTurnResult);

      // Update statistics
      updateLODStats(postTurnResult);

      // Record performance metrics
      const duration = Date.now() - startTime;
      updateLODPerformanceMetrics(duration);

      // Record tier transitions
      recordLODTierTransitions(worldState, postTurnResult);

      return postTurnResult;

    } catch (error) {
      console.error('LOD turn processing failed:', error);
      return worldState;
    } finally {
      setIsLODProcessing(false);
    }
  }, [isLODInitialized, lodManager, updateLODStats, updateLODPerformanceMetrics, recordLODTierTransitions]);

  const changeCharacterLODTier = useCallback(async (characterId, newTier) => {
    if (!isLODInitialized) return false;

    try {
      const success = await lodManager.changeCharacterTier(characterId, newTier);
      if (success) {
        // Update stats after tier change
        if (worldState) {
          updateLODStats(worldState);
        }
        console.log(`Character ${characterId} moved to ${newTier} tier`);
      }
      return success;
    } catch (error) {
      console.error('Failed to change character LOD tier:', error);
      return false;
    }
  }, [isLODInitialized, lodManager, worldState, updateLODStats]);

  const getLODProcessingRecommendations = useCallback(() => {
    const recommendations = [];

    // Performance-based recommendations
    if (lodProcessingMetrics.averageTurnDuration > 100) {
      recommendations.push({
        type: 'performance',
        message: 'Consider increasing background tier population to reduce processing time',
        severity: 'warning'
      });
    }

    // Balance recommendations
    const totalChars = lodStats.total;
    if (totalChars > 0) {
      const heroRatio = lodStats.hero / totalChars;
      const groupRatio = lodStats.group / totalChars;

      if (heroRatio > 0.3) {
        recommendations.push({
          type: 'balance',
          message: 'High hero character ratio may impact performance',
          severity: 'info'
        });
      }

      if (groupRatio < 0.2) {
        recommendations.push({
          type: 'balance',
          message: 'Consider promoting more characters to group tier for better statistical processing',
          severity: 'info'
        });
      }
    }

    return recommendations;
  }, [lodProcessingMetrics, lodStats]);

  // Initialize simulation when prepared world data is available
  useEffect(() => {
    if (preparedWorldData && validationToken && !isInitialized) {
      console.log('Initializing simulation with prepared world data:', preparedWorldData);
      console.log('Validation token:', validationToken);
      try {
        const initialState = simulationService.initialize(preparedWorldData);
        setCurrentSimulationState(initialState);
        setWorldState(initialState); // Use the simulation state, not the prepared data
        setIsInitialized(true);
        setInitializationError(null);
        console.log('Simulation initialized successfully with state:', initialState);
        console.log('SimulationService internal state check:', simulationService.getCurrentWorldState());
        
        // Initialize LOD system with the initial world state
        initializeLODSystem(initialState);
      } catch (error) {
        console.error('Failed to initialize simulation:', error);
        setInitializationError(error.message);
        setIsInitialized(false);
      }
    }
  }, [preparedWorldData, validationToken, isInitialized, initializeLODSystem]);
  
  // Validation function to ensure world data comes from WorldBuilder pipeline
  const validatePreparedWorld = useCallback((worldData) => {
    const errors = [];
    const warnings = [];

    // Must have simulation metadata indicating pipeline processing
    if (!worldData?.simulationMetadata) {
      errors.push('Missing simulation metadata - world was not processed through WorldBuilder pipeline');
    } else {
      const metadata = worldData.simulationMetadata;
      
      // Must be prepared by WorldBuilder or DemoService
      if (metadata.source !== 'WorldBuilder' && metadata.source !== 'DemoService') {
        errors.push(`Invalid source: ${metadata.source}. Only WorldBuilder-prepared worlds and demo worlds are accepted.`);
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
        // Check if character has a valid currentNodeId assignment
        let hasValidAssignment = false;
        
        if (character.currentNodeId) {
          // Verify the node exists
          if (worldData.nodes.has(character.currentNodeId)) {
            hasValidAssignment = true;
          }
        } else if (character.assignments?.nodes?.size > 0) {
          // Check if any assigned nodes are valid
          for (const nodeId of character.assignments.nodes) {
            if (worldData.nodes.has(nodeId)) {
              hasValidAssignment = true;
              break;
            }
          }
        }
        
        if (!hasValidAssignment) {
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

  const resetLODSystem = useCallback(() => {
    setLodStats({ hero: 0, group: 0, background: 0, total: 0 });
    setLodProcessingMetrics({
      lastTurnDuration: 0,
      averageTurnDuration: 0,
      totalProcessed: 0,
      performanceHistory: []
    });
    setLodTierTransitions([]);
    setIsLODInitialized(false);
    setIsLODProcessing(false);

    console.log('LOD system reset');
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
      const sourceForToken = worldData.simulationMetadata?.source || 'WorldBuilder';
      
      const token = pipelineValidationService.generateValidationToken(
        worldData,
        sourceForToken
      );
      
      // Set the validation token for simulation initialization
      setValidationToken(token);

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
    setCurrentSimulationState(null);
    setWorldState(null);
    setIsInitialized(false);
    setInitializationError(null);
    setCurrentTurn(0);
    setTurnHistory([]);
    setIsProcessingTurn(false);
    setValidationToken(null);
    
    // Reset LOD system
    resetLODSystem();
    
    setSimulationReadinessStatus({
      hasPreparedWorld: false,
      isSimulationReady: false,
      lastValidated: null,
      preparedAt: null,
      source: null,
      hasValidToken: false
    });
  }, [resetLODSystem]);

  // Process turn function
  const processTurn = useCallback(async () => {
    if (!currentSimulationState || isProcessingTurn || !isInitialized) {
      console.warn('Cannot process turn: no simulation state, already processing, or not initialized');
      console.warn('State check:', { 
        hasCurrentSimulationState: !!currentSimulationState, 
        isProcessingTurn, 
        isInitialized 
      });
      return;
    }

    setIsProcessingTurn(true);
    try {
      // Process LOD pre-turn operations (currently just logging, full integration would use ProcessTurnWithLOD use case)
      await processLODTurn(currentSimulationState);
      
      // SimulationService.processTurn() uses its internal worldState, but we can pass LOD-processed state
      // Note: In a full implementation, ProcessTurnWithLOD use case would handle this integration
      const turnResult = await simulationService.processTurn();
      
      // Process LOD post-turn operations on the simulation result
      const finalWorldState = await processLODTurn(turnResult.worldState);
      
      setCurrentSimulationState(finalWorldState);
      setWorldState(finalWorldState); // Update worldState with the new simulation state
      setTurnHistory(prev => [...prev, turnResult.turnSummary || turnResult]);
      setCurrentTurn(prev => prev + 1);
      
      console.log('Turn processed successfully with LOD integration:', turnResult);
      console.log('Turn summary:', turnResult.turnSummary);
      console.log('World state events:', finalWorldState.events?.length || 0);
      
      return turnResult;
    } catch (error) {
      console.error('Error processing turn:', error);
      throw error;
    } finally {
      setIsProcessingTurn(false);
    }
  }, [currentSimulationState, isProcessingTurn, isInitialized, processLODTurn]);

  // Reset simulation function
  const resetSimulation = useCallback(() => {
    setCurrentSimulationState(null);
    setIsInitialized(false);
    setInitializationError(null);
    setCurrentTurn(0);
    setTurnHistory([]);
    setIsProcessingTurn(false);
    
    // Reset LOD system as well
    resetLODSystem();
    
    // Re-initialize if we have prepared world data
    if (preparedWorldData && validationToken) {
      try {
        const initialState = simulationService.initialize(preparedWorldData);
        setCurrentSimulationState(initialState);
        setWorldState(initialState); // Use the simulation state, not the prepared data
        setIsInitialized(true);
        console.log('Simulation reset and re-initialized');
        
        // Re-initialize LOD system
        initializeLODSystem(initialState);
      } catch (error) {
        console.error('Failed to re-initialize simulation:', error);
        setInitializationError(error.message);
      }
    }
  }, [preparedWorldData, validationToken, resetLODSystem, initializeLODSystem]);
  
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
    
    // Simulation state and methods
    worldState,
    isInitialized,
    initializationError,
    currentTurn,
    turnHistory,
    canProcessTurn: isInitialized && !isProcessingTurn && !!currentSimulationState,
    isProcessingTurn,
    
    // Turn-based actions
    processTurn,
    resetSimulation,
    getTurnHistory: () => turnHistory,
    analyzeHistory: () => turnHistory,
    
    // Simulation readiness status
    isSimulationReady: simulationReadinessStatus.isSimulationReady,
    hasPreparedWorld: simulationReadinessStatus.hasPreparedWorld,
    canInitializeSimulation: simulationReadinessStatus.isSimulationReady && !isInitialized,
    
    // LOD System Integration
    lodStats,
    lodTierConfigurations,
    lodProcessingMetrics,
    lodTierTransitions,
    isLODInitialized,
    isLODProcessing,
    
    // LOD Actions
    initializeLODSystem,
    processLODTurn,
    changeCharacterLODTier,
    getLODProcessingRecommendations,
    resetLODSystem,
    
    // LOD Manager reference (for advanced operations)
    lodManager
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