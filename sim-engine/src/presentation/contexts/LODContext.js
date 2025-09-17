// src/presentation/contexts/LODContext.js

import React, { createContext, useContext, useState, useCallback } from 'react';
import { LODManager } from '../../domain/services/LODManager.js';
import { LODTier } from '../../domain/value-objects/LODTier.js';

/**
 * LODContext - React Context for Level of Detail (LOD) system management
 *
 * Provides centralized state management for LOD tiers, character processing,
 * performance metrics, and tier transitions. Enables components to access
 * and manipulate LOD system state throughout the application.
 *
 * Requirements: LOD system state management for Valley of Echoes demo
 */

const LODContext = createContext();

export const LODProvider = ({ children }) => {
  // LOD Manager instance
  const [lodManager] = useState(() => new LODManager());

  // LOD State
  const [lodStats, setLodStats] = useState({
    hero: 0,
    group: 0,
    background: 0,
    total: 0
  });

  const [tierConfigurations, setTierConfigurations] = useState({
    hero: LODTier.HERO,
    group: LODTier.GROUP,
    background: LODTier.BACKGROUND
  });

  const [processingMetrics, setProcessingMetrics] = useState({
    lastTurnDuration: 0,
    averageTurnDuration: 0,
    totalProcessed: 0,
    performanceHistory: []
  });

  const [tierTransitions, setTierTransitions] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update LOD statistics
  const updateLODStats = useCallback((worldState) => {
    if (!worldState?.characters) return;

    const characters = worldState.characters;
    const stats = {
      hero: characters.filter(c => c.lodTier === 'hero').length,
      group: characters.filter(c => c.lodTier === 'group').length,
      background: characters.filter(c => c.lodTier === 'background').length,
      total: characters.length
    };

    setLodStats(stats);
  }, []);

  // Initialize LOD system
  const initializeLOD = useCallback(async (worldState) => {
    if (!worldState) return;

    try {
      setIsProcessing(true);

      // Initialize LOD manager with world state
      await lodManager.initializeForWorld(worldState);

      // Update initial statistics
      updateLODStats(worldState);

      setIsInitialized(true);
      console.log('LOD system initialized successfully');

    } catch (error) {
      console.error('Failed to initialize LOD system:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [lodManager, updateLODStats]);

  // Update performance metrics
  const updatePerformanceMetrics = useCallback((duration) => {
    setProcessingMetrics(prev => {
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

  // Record tier transitions
  const recordTierTransitions = useCallback((oldState, newState) => {
    if (!oldState?.characters || !newState?.characters) return;

    const transitions = [];

    oldState.characters.forEach((oldChar, index) => {
      const newChar = newState.characters[index];
      if (oldChar && newChar && oldChar.id === newChar.id && oldChar.lodTier !== newChar.lodTier) {
        transitions.push({
          characterId: oldChar.id,
          characterName: oldChar.name || `Character ${oldChar.id}`,
          fromTier: oldChar.lodTier,
          toTier: newChar.lodTier,
          timestamp: Date.now(),
          reason: 'automatic' // Could be expanded to include specific reasons
        });
      }
    });

    if (transitions.length > 0) {
      setTierTransitions(prev => [...prev, ...transitions].slice(-20)); // Keep last 20
    }
  }, []);

  // Process LOD for a turn
  const processLODTurn = useCallback(async (worldState) => {
    if (!isInitialized || !worldState) return worldState;

    const startTime = Date.now();
    setIsProcessing(true);

    try {
      // Process pre-turn LOD operations
      const preTurnResult = await lodManager.processPreTurnLOD(worldState);

      // Process main turn (this would be handled by ProcessTurnWithLOD use case)

      // Process post-turn LOD operations
      const postTurnResult = await lodManager.processPostTurnLOD(preTurnResult);

      // Update statistics
      updateLODStats(postTurnResult);

      // Record performance metrics
      const duration = Date.now() - startTime;
      updatePerformanceMetrics(duration);

      // Record tier transitions
      recordTierTransitions(worldState, postTurnResult);

      return postTurnResult;

    } catch (error) {
      console.error('LOD turn processing failed:', error);
      return worldState;
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized, lodManager, updateLODStats, updatePerformanceMetrics, recordTierTransitions]);

  // Manually promote/demote character
  const changeCharacterTier = useCallback(async (characterId, newTier) => {
    if (!isInitialized) return false;

    try {
      const success = await lodManager.changeCharacterTier(characterId, newTier);
      if (success) {
        // Force stats update (in real implementation, this would come from world state update)
        console.log(`Character ${characterId} moved to ${newTier} tier`);
      }
      return success;
    } catch (error) {
      console.error('Failed to change character tier:', error);
      return false;
    }
  }, [isInitialized, lodManager]);

  // Get tier configuration
  const getTierConfig = useCallback((tier) => {
    return tierConfigurations[tier] || null;
  }, [tierConfigurations]);

  // Update tier configuration
  const updateTierConfig = useCallback((tier, config) => {
    setTierConfigurations(prev => ({
      ...prev,
      [tier]: { ...prev[tier], ...config }
    }));
  }, []);

  // Get LOD processing recommendations
  const getProcessingRecommendations = useCallback(() => {
    const recommendations = [];

    // Performance-based recommendations
    if (processingMetrics.averageTurnDuration > 100) {
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
  }, [processingMetrics, lodStats]);

  // Reset LOD system
  const resetLOD = useCallback(() => {
    setLodStats({ hero: 0, group: 0, background: 0, total: 0 });
    setProcessingMetrics({
      lastTurnDuration: 0,
      averageTurnDuration: 0,
      totalProcessed: 0,
      performanceHistory: []
    });
    setTierTransitions([]);
    setIsInitialized(false);
    setIsProcessing(false);

    console.log('LOD system reset');
  }, []);

  // Context value
  const contextValue = {
    // State
    lodStats,
    tierConfigurations,
    processingMetrics,
    tierTransitions,
    isInitialized,
    isProcessing,

    // Actions
    initializeLOD,
    processLODTurn,
    changeCharacterTier,
    getTierConfig,
    updateTierConfig,
    getProcessingRecommendations,
    resetLOD,

    // LOD Manager reference (for advanced operations)
    lodManager
  };

  return (
    <LODContext.Provider value={contextValue}>
      {children}
    </LODContext.Provider>
  );
};

/**
 * Hook to use LOD context
 */
export const useLODContext = () => {
  const context = useContext(LODContext);
  if (!context) {
    throw new Error('useLODContext must be used within an LODProvider');
  }
  return context;
};

export default LODContext;