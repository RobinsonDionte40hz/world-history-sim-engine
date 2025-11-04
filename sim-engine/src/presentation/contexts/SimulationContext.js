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
import StorageCleanupService from '../../application/services/StorageCleanupService.js';
import DataStructureUtils from '../../shared/utils/DataStructureUtils.js';
import LocalStorageWorldRepository from '../../infrastructure/Persistance/LocalStorageWorldRepository.js';

const SimulationContext = createContext();

// Export the context itself for conditional usage (e.g., useContext(SimulationContext))
export { SimulationContext };

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
  
  // WASM Consciousness Engine State
  const [wasmStatus, setWasmStatus] = useState({
    status: 'uninitialized', // 'uninitialized' | 'initializing' | 'initialized' | 'enabled' | 'error'
    error: null,
    isEnabled: false,
    initializationTime: null
  });
  
  // WASM engine reference (will be set after dynamic import)
  const [consciousnessEngine, setConsciousnessEngine] = useState(null);
  
  // Initialize WASM engine on mount with dynamic import
  useEffect(() => {
    const initializeWASM = async () => {
      setWasmStatus(prev => ({ ...prev, status: 'initializing' }));
      const startTime = performance.now();
      
      try {
        console.log('🚀 Loading WASM Consciousness Engine module...');
        
        // Dynamic import for bundler-target WASM
        const wasmModule = await import('@world-history-sim/consciousness-engine-wasm');
        const { ConsciousnessEngineWasm } = wasmModule;
        
        console.log('📦 WASM module loaded, creating engine instance...');
        const engine = new ConsciousnessEngineWasm();
        setConsciousnessEngine(engine);
        
        console.log('🔧 Initializing WASM engine...');
        const success = await engine.initialize();
        const initTime = performance.now() - startTime;
        
        if (success) {
          setWasmStatus({
            status: 'enabled',
            error: null,
            isEnabled: true,
            initializationTime: initTime
          });
          
          // Inject WASM engine into LODManager for batch processing
          if (lodManager.consciousnessEngine !== engine) {
            lodManager.consciousnessEngine = engine;
            lodManager.useWasmBatch = true;
            console.log('✅ LODManager configured with WASM batch processing');
          }
          
          console.log(`✅ WASM Consciousness Engine initialized successfully in ${initTime.toFixed(2)}ms`);
        } else {
          // Initialization returned false (fallback mode)
          setWasmStatus({
            status: 'initialized',
            error: 'WASM unavailable, using JavaScript fallback',
            isEnabled: false,
            initializationTime: initTime
          });
          console.log(`⚠️  WASM Consciousness Engine using JavaScript fallback (${initTime.toFixed(2)}ms)`);
        }
      } catch (error) {
        const initTime = performance.now() - startTime;
        setWasmStatus({
          status: 'error',
          error: error.message,
          isEnabled: false,
          initializationTime: initTime
        });
        console.error('❌ WASM Consciousness Engine initialization failed:', error);
      }
    };
    
    initializeWASM();
  }, [lodManager]); // Run once on mount, lodManager is stable from useState
  
  // Helper function to convert world state for dashboard consumption
  const formatWorldStateForDashboard = useCallback((rawWorldState) => {
    if (!rawWorldState) return null;
    
    try {
      // Ensure data is in Array format for dashboard consumption
      const arrayData = DataStructureUtils.ensureArrayStructure(rawWorldState);
      
      // Ensure the dashboard gets both 'characters' and 'npcs' for compatibility
      // SimulationService uses 'npcs', but dashboard might expect 'characters'
      const dashboardState = {
        ...arrayData,
        // Ensure characters field exists (fallback to npcs if needed)
        characters: arrayData.characters || arrayData.npcs || [],
        // Keep npcs for backward compatibility
        npcs: arrayData.npcs || arrayData.characters || [],
        // Ensure events array exists and persists
        events: arrayData.events || [],
        // Ensure nodes array exists
        nodes: arrayData.nodes || [],
        // Ensure time is preserved
        time: arrayData.time || 0
      };
      
      console.log('Dashboard state formatted:', {
        characters: dashboardState.characters.length,
        npcs: dashboardState.npcs.length,
        nodes: dashboardState.nodes.length,
        events: dashboardState.events.length,
        time: dashboardState.time
      });
      
      return dashboardState;
    } catch (error) {
      console.error('Error formatting world state for dashboard:', error);
      return rawWorldState; // Fallback to original state
    }
  }, []);
  
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

    // Handle both Map and Array structures
    let characters;
    if (worldState.characters instanceof Map) {
      characters = Array.from(worldState.characters.values());
    } else if (Array.isArray(worldState.characters)) {
      characters = worldState.characters;
    } else {
      console.warn('updateLODStats: characters is neither Map nor Array:', typeof worldState.characters);
      return;
    }

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

    // Handle both Map and Array structures for oldState
    let oldCharacters;
    if (oldState.characters instanceof Map) {
      oldCharacters = oldState.characters;
    } else if (Array.isArray(oldState.characters)) {
      oldCharacters = new Map(oldState.characters.map(c => [c.id, c]));
    } else {
      console.warn('recordLODTierTransitions: oldState.characters is neither Map nor Array');
      return;
    }

    // Handle both Map and Array structures for newState
    let newCharacters;
    if (newState.characters instanceof Map) {
      newCharacters = newState.characters;
    } else if (Array.isArray(newState.characters)) {
      newCharacters = new Map(newState.characters.map(c => [c.id, c]));
    } else {
      console.warn('recordLODTierTransitions: newState.characters is neither Map nor Array');
      return;
    }

    oldCharacters.forEach((oldChar, charId) => {
      const newChar = newCharacters.get(charId);
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

      // Ensure worldState has Map structure for LODManager
      const mapStructuredState = DataStructureUtils.ensureMapStructure(worldState);

      // Initialize LOD manager with Map-structured world state
      await lodManager.initializeForWorld(mapStructuredState);

      // Update initial statistics using the Map structure
      updateLODStats(mapStructuredState);

      setIsLODInitialized(true);
      console.log('LOD system initialized successfully in SimulationContext');

    } catch (error) {
      console.error('Failed to initialize LOD system:', error);
    } finally {
      setIsLODProcessing(false);
    }
  }, [lodManager, updateLODStats]);

  const processLODTurn = useCallback(async (worldState, turnResult = null) => {
    if (!isLODInitialized || !worldState) return worldState;

    const startTime = Date.now();
    setIsLODProcessing(true);

    try {
      // Process pre-turn LOD operations
      await lodManager.processPreTurnLOD(worldState);

      // Process post-turn LOD operations on the modified world state
      await lodManager.processPostTurnLOD(worldState, turnResult);

      // Update statistics using the modified world state
      updateLODStats(worldState);

      // Record performance metrics
      const duration = Date.now() - startTime;
      updateLODPerformanceMetrics(duration);

      // Record tier transitions
      recordLODTierTransitions(worldState, worldState);

      return worldState;

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
        setWorldState(formatWorldStateForDashboard(initialState)); // Use the simulation state, not the prepared data
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
  }, [preparedWorldData, validationToken, isInitialized, initializeLODSystem, formatWorldStateForDashboard]);
  
  // Add effect to sync world state with simulation state
  useEffect(() => {
    if (currentSimulationState) {
      setWorldState(formatWorldStateForDashboard(currentSimulationState));
      console.log('SimulationContext: Synced worldState with currentSimulationState');
    }
  }, [currentSimulationState, formatWorldStateForDashboard]);
  
  // Character persistence function
  const saveCharacterState = useCallback(async (worldState) => {
    if (!worldState) {
      return {
        success: false,
        error: 'No world state provided'
      };
    }

    try {
      console.log('💾 Saving character state after turn processing...');

      // Save the updated world state including characters
      await LocalStorageWorldRepository.saveWorld(worldState);

      console.log('✅ Character state saved successfully');
      console.log(`   Characters saved: ${worldState.characters?.length || 0}`);
      console.log(`   LOD Distribution: Hero=${worldState.characters?.filter(c => c.lodTier === 'hero').length || 0}, Group=${worldState.characters?.filter(c => c.lodTier === 'group').length || 0}, Background=${worldState.characters?.filter(c => c.lodTier === 'background').length || 0}`);

      return {
        success: true,
        message: `Saved ${worldState.characters?.length || 0} characters successfully`
      };

    } catch (error) {
      console.error('❌ Failed to save character state:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }, []);

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
      
      // Clear any existing localStorage state before accepting new world
      const cleanupResult = StorageCleanupService.clearWorldState();
      if (cleanupResult.success) {
        console.log('StorageCleanupService: Cleared state before accepting new prepared world:', cleanupResult.keysCleared);
      } else {
        console.warn('StorageCleanupService: Failed to clear state:', cleanupResult.error);
      }
      
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
    
    // Clear localStorage keys that might contaminate new simulations
    const cleanupResult = StorageCleanupService.clearWorldState();
    if (cleanupResult.success) {
      console.log('StorageCleanupService: Cleared state during clearPreparedWorld:', cleanupResult.keysCleared);
    } else {
      console.warn('StorageCleanupService: Failed to clear state:', cleanupResult.error);
    }
    
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
    const errors = [];
    let turnResult = null;
    let worldStateToUse = currentSimulationState;

    try {
      // Step 1: Process LOD pre-turn operations
      try {
        console.log('Processing LOD pre-turn operations... (TEMPORARILY DISABLED)');
        // TEMPORARILY DISABLED: LOD processing is demoting all hero characters
        // const preLODState = await processLODTurn(currentSimulationState);
        // console.log('Pre-turn LOD processing complete, state valid:', !!preLODState);
        // if (preLODState) {
        //   worldStateToUse = preLODState;
        // }
      } catch (lodError) {
        errors.push({ phase: 'pre_lod', error: lodError.message });
        console.warn('LOD pre-turn processing failed, continuing with original state:', lodError.message);
      }

      // Step 2: Process simulation turn
      try {
        console.log('Processing simulation turn...');
        turnResult = await simulationService.processTurn();
        console.log('Simulation turn processed - FULL RESULT:', turnResult);
        console.log('Turn result worldState:', turnResult?.worldState);
        console.log('Turn result worldState.time:', turnResult?.worldState?.time);
        console.log('Turn result worldState.events:', turnResult?.worldState?.events);

        // Handle both success and partial failure cases
        if (!turnResult) {
          throw new Error('No result returned from processTurn');
        }

        // Even on failure, if we have a worldState, use it
        if (turnResult.worldState) {
          // Continue processing with the worldState we have
          console.log('Turn result includes worldState, continuing despite errors');
          worldStateToUse = turnResult.worldState;
        } else if (!turnResult.success) {
          // Only throw if we have no worldState at all
          console.error('Turn failed with no worldState:', turnResult.error);
          throw new Error(turnResult.error || 'Turn processing failed');
        }
      } catch (simulationError) {
        errors.push({ phase: 'simulation', error: simulationError.message });
        console.error('Simulation turn processing failed:', simulationError.message);

        // Continue with current state if simulation fails
        if (!turnResult) {
          turnResult = {
            worldState: currentSimulationState,
            turnSummary: { summary: 'Turn processing failed', events: [] },
            success: false
          };
        }
      }

      // Step 3: Process LOD post-turn operations
      try {
        console.log('Processing LOD post-turn operations... (TEMPORARILY DISABLED)');
        // TEMPORARILY DISABLED: LOD processing is demoting all hero characters
        // const finalWorldState = await processLODTurn(worldStateToUse, turnResult);
        // console.log('Post-turn LOD processing complete, finalWorldState:', finalWorldState);

        // if (finalWorldState && finalWorldState.worldState) {
        //   worldStateToUse = finalWorldState.worldState;
        // }
      } catch (postLodError) {
        errors.push({ phase: 'post_lod', error: postLodError.message });
        console.warn('LOD post-turn processing failed, continuing with simulation result:', postLodError.message);
      }

      // Step 4: Persist character state
      try {
        console.log('Persisting character state after turn processing...');
        const persistenceResult = await saveCharacterState(worldStateToUse);
        if (!persistenceResult || persistenceResult.success === undefined) {
          console.warn('Character state persistence returned invalid result, assuming success');
        } else if (persistenceResult.success) {
          console.log('Character state persisted successfully:', persistenceResult.message);
        } else {
          console.warn('Character state persistence failed:', persistenceResult.error);
          errors.push({ phase: 'persistence', error: persistenceResult.error });
        }
      } catch (persistenceError) {
        errors.push({ phase: 'persistence', error: persistenceError.message });
        console.error('Character state persistence failed:', persistenceError.message);
      }

      // Step 5: Update state regardless of partial failures
      console.log('Setting currentSimulationState to:', worldStateToUse);
      setCurrentSimulationState(worldStateToUse);
      setWorldState(formatWorldStateForDashboard(worldStateToUse));
      setTurnHistory(prev => [...prev, turnResult?.turnSummary || turnResult || { summary: 'Turn processed with errors' }]);
      setCurrentTurn(prev => prev + 1);

      // Debug logging to verify data flow
      console.log('SimulationContext: Turn processed successfully');
      console.log('SimulationContext: New world state:', worldStateToUse);
      console.log('SimulationContext: Events in new state:', worldStateToUse?.events?.length || 0);
      console.log('SimulationContext: Turn summary:', turnResult?.turnSummary);

      // Return result with error information
      const hasErrors = errors.length > 0;
      return {
        ...turnResult,
        success: !hasErrors,
        partialSuccess: hasErrors && turnResult?.worldState,
        errors: errors,
        worldState: worldStateToUse
      };

    } catch (error) {
      console.error('SimulationContext: Critical error processing turn:', error);
      errors.push({ phase: 'critical', error: error.message });

      // Even on critical failure, try to maintain state
      return {
        success: false,
        error: error.message,
        errors: errors,
        worldState: currentSimulationState, // Return current state to prevent loss
        turnSummary: { summary: 'Critical turn processing failure' }
      };
    } finally {
      setIsProcessingTurn(false);
    }
  }, [currentSimulationState, isProcessingTurn, isInitialized, formatWorldStateForDashboard, saveCharacterState]);

  // Reset simulation function
  const resetSimulation = useCallback(() => {
    console.log('SimulationContext: Resetting simulation');
    
    setCurrentSimulationState(null);
    setIsInitialized(false);
    setInitializationError(null);
    setCurrentTurn(0);
    setTurnHistory([]);
    setIsProcessingTurn(false);
    
    // Reset LOD system as well
    resetLODSystem();
    
    // Clear localStorage keys that might contaminate resets
    const cleanupResult = StorageCleanupService.clearWorldState();
    if (cleanupResult.success) {
      console.log('StorageCleanupService: Cleared state during simulation reset:', cleanupResult.keysCleared);
    } else {
      console.warn('StorageCleanupService: Failed to clear state during reset:', cleanupResult.error);
    }
    
    // Re-initialize if we have prepared world data
    if (preparedWorldData && validationToken) {
      try {
        console.log('SimulationContext: Re-initializing with prepared world data');
        const initialState = simulationService.initialize(preparedWorldData);
        
        setCurrentSimulationState(initialState);
        setWorldState(formatWorldStateForDashboard(initialState)); // CRITICAL: Use the simulation state
        setIsInitialized(true);
        
        console.log('SimulationContext: Simulation reset and re-initialized');
        console.log('SimulationContext: Initial state:', initialState);
        
        // Re-initialize LOD system
        initializeLODSystem(initialState);
      } catch (error) {
        console.error('SimulationContext: Failed to re-initialize simulation:', error);
        setInitializationError(error.message);
      }
    }
  }, [preparedWorldData, validationToken, resetLODSystem, initializeLODSystem, formatWorldStateForDashboard]);
  
  // Combined context value with simulation state and preparation pipeline integration
  const contextValue = {
    // Template manager (read-only access for simulation)
    templateManager,
    
    // WASM Consciousness Engine
    consciousnessEngine,
    wasmStatus,
    isWasmEnabled: wasmStatus.isEnabled,
    
    // Prepared world data and validation
    preparedWorldData,
    pipelineValidationError,
    simulationReadinessStatus,
    
    // Pipeline methods - exclusive entry points for simulation
    acceptPreparedWorld,
    clearPreparedWorld,
    validatePreparedWorld,
    
    // Simulation state and methods
    worldState: currentSimulationState ? formatWorldStateForDashboard(currentSimulationState) : worldState, // ALWAYS use current simulation state first
    currentSimulationState, // RAW simulation state
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
    lodManager,
    
    // Legacy compatibility properties (kept for backward compatibility)
    simulation: {
      worldState: currentSimulationState ? formatWorldStateForDashboard(currentSimulationState) : worldState,
      isRunning: isProcessingTurn,
      isInitialized,
      canStart: simulationReadinessStatus.isSimulationReady && !isInitialized
    },
    isRunning: isProcessingTurn,
    startSimulation: () => console.warn('Use processTurn() instead of startSimulation()'),
    stopSimulation: () => console.warn('Use resetSimulation() instead of stopSimulation()')
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