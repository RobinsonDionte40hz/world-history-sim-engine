/**
 * Modern Debug utilities for WorldHistorySimInterface
 * 
 * Updated utilities that work with the current unified interface architecture.
 * Uses SimulationInterfaceDebugger for consistent debug patterns.
 */

import { simulationInterfaceDebugger } from '../../shared/utils/SimulationInterfaceDebug.js';

// Quick Fix Verification Checklist - Updated for current architecture
const verificationChecklist = {
  step1: 'Check that currentSimulationState is not null after turn processing',
  step2: 'Verify that turnHistory array grows after each turn',
  step3: 'Confirm that events array in worldState increases after turns',
  step4: 'Check that dashboard stats update with new values',
  step5: 'Verify debug logs are controlled via SimulationInterfaceDebugger',
  step6: 'Test that turn counter increments correctly',
  step7: 'Confirm that recent events panel shows new events',
  step8: 'Verify LOD system operates correctly with character processing'
};

// Enhanced Turn Manager - Works with current SimulationContext
const EnhancedTurnManager = ({ simulationService, currentTurn, worldState, lodStats }) => {
  return {
    getCurrentStatistics: () => {
      // Use current simulation state from context
      const freshWorldState = simulationService?.getCurrentWorldState?.() || worldState;

      const stats = {
        currentTurn: currentTurn || 0,
        maxTurns: null,
        isPaused: false,
        isProcessing: false,
        historySize: 0,
        summaryCount: 0,
        eventCount: freshWorldState?.events?.length || 0,
        canContinue: true,
        // Current architecture data
        totalPopulation: freshWorldState?.characters?.length || freshWorldState?.npcs?.length || 0,
        totalNodes: freshWorldState?.nodes?.length || 0,
        totalResources: freshWorldState?.resources?.totalGold || 0,
        // LOD stats if available
        lodStats: lodStats || { hero: 0, group: 0, background: 0, total: 0 }
      };

      simulationInterfaceDebugger.verboseLog('Enhanced turn manager stats', stats);
      return stats;
    },

    getRecentTurnSummaries: () => [],

    getRecentEvents: () => {
      const freshWorldState = simulationService?.getCurrentWorldState?.() || worldState;
      return freshWorldState?.events?.slice(-5) || [];
    }
  };
};

// Modern browser console utilities for WorldHistorySimInterface
if (typeof window !== 'undefined') {
  
  // Updated simulation context checker
  window.debugSimulationContext = () => {
    console.group('🔧 Simulation Context Debug');
    
    // Check for simulation provider in DOM
    const simProvider = document.querySelector('[data-testid="simulation-provider"]');
    console.log('Simulation Provider in DOM:', !!simProvider);
    
    // Check React DevTools
    console.log('React DevTools available:', !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
    
    // Check debug utilities
    console.log('Debug utilities loaded:', {
      simInterface: !!window.debugSimInterface,
      worldFlow: !!window.debugWorldFlow,
      namingIssue: !!window.debugNamingIssue
    });
    
    console.groupEnd();
  };

  // Enhanced localStorage debug
  window.debugSimulationStorage = () => {
    console.group('💾 Simulation Storage Debug');
    
    const keys = Object.keys(localStorage).filter(key => 
      key.includes('simulation') || 
      key.includes('world') ||
      key.includes('lod') ||
      key.includes('turn')
    );
    
    console.log(`Found ${keys.length} simulation-related keys:`);
    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        console.log(`${key}:`, data);
      } catch (e) {
        console.log(`${key}: (raw)`, localStorage.getItem(key));
      }
    });
    
    console.groupEnd();
  };

  // Component state checker for WorldHistorySimInterface
  window.debugWorldHistoryInterface = () => {
    console.group('🎮 WorldHistorySimInterface Debug');
    
    // Look for interface components
    const interfaceElements = document.querySelectorAll('[data-component*="world-history"], [data-component*="simulation"]');
    console.log('Interface elements found:', interfaceElements.length);
    
    // Check for common debug indicators
    const debugElements = document.querySelectorAll('[class*="debug"], [data-testid*="debug"]');
    console.log('Debug elements found:', debugElements.length);
    
    console.groupEnd();
  };

  // LOD system debug
  window.debugLODSystem = () => {
    console.group('📊 LOD System Debug');
    
    // Check for LOD-related data in localStorage
    const lodKeys = Object.keys(localStorage).filter(key => 
      key.includes('lod') || key.includes('tier')
    );
    
    console.log('LOD storage keys:', lodKeys);
    
    if (window.debugSimInterface) {
      console.log('Use debugSimInterface for detailed LOD debugging');
    }
    
    console.groupEnd();
  };

  // Memory and performance debug
  window.debugSimulationPerformance = () => {
    console.group('⚡ Simulation Performance Debug');
    
    if (performance.memory) {
      const memory = performance.memory;
      console.log('Memory Usage:', {
        used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
        efficiency: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100) + '%'
      });
    }
    
    // Check for event listeners (potential memory leaks)
    // Note: getEventListeners is only available in Chrome DevTools
    if (typeof window.getEventListeners === 'function') {
      const elements = document.querySelectorAll('*');
      let totalListeners = 0;
      
      elements.forEach(el => {
        try {
          const listeners = window.getEventListeners(el);
          totalListeners += Object.keys(listeners).length;
        } catch (e) {
          // getEventListeners failed
        }
      });
      
      if (totalListeners > 0) {
        console.log('Total event listeners:', totalListeners);
      }
    } else {
      console.log('getEventListeners not available (Chrome DevTools only)');
    }
    
    console.groupEnd();
  };

  console.log('🛠️ Modern debug utilities for WorldHistorySimInterface loaded:');
  console.log('- debugSimulationContext() - Check React context state');
  console.log('- debugSimulationStorage() - Check localStorage');  
  console.log('- debugWorldHistoryInterface() - Check interface elements');
  console.log('- debugLODSystem() - Check LOD system');
  console.log('- debugSimulationPerformance() - Check memory/performance');
}

// Export for use in components
export {
  verificationChecklist,
  EnhancedTurnManager
};