/**
 * Simulation Interface Debug Utilities
 * 
 * Provides targeted debug functions for the WorldHistorySimInterface
 * and SimulationContext. Can be enabled/disabled via configuration.
 */

class SimulationInterfaceDebugger {
  constructor(config = {}) {
    this.enabled = config.enabled ?? (process.env.NODE_ENV === 'development');
    this.verbose = config.verbose ?? false;
    this.logPrefix = '🔧 [SimInterface Debug]';
  }

  /**
   * Enable/disable debug logging
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Enable/disable verbose logging
   */
  setVerbose(verboseMode) {
    this.verbose = verboseMode;
  }

  /**
   * Log a debug message
   */
  log(message, data = null) {
    if (!this.enabled) return;
    
    if (data) {
      console.log(`${this.logPrefix} ${message}`, data);
    } else {
      console.log(`${this.logPrefix} ${message}`);
    }
  }

  /**
   * Log verbose debug information
   */
  verboseLog(message, data = null) {
    if (!this.enabled || !this.verbose) return;
    
    if (data) {
      console.log(`${this.logPrefix} [VERBOSE] ${message}`, data);
    } else {
      console.log(`${this.logPrefix} [VERBOSE] ${message}`);
    }
  }

  /**
   * Debug simulation context state
   */
  debugSimulationContext(context) {
    if (!this.enabled) return;

    console.group(`${this.logPrefix} Simulation Context State`);
    console.log('Current Turn:', context.currentTurn);
    console.log('Is Initialized:', context.isInitialized);
    console.log('Can Process Turn:', context.canProcessTurn);
    console.log('Current Simulation State:', {
      hasState: !!context.currentSimulationState,
      time: context.currentSimulationState?.time,
      charactersCount: context.currentSimulationState?.characters?.length || context.currentSimulationState?.npcs?.length || 0,
      eventsCount: context.currentSimulationState?.events?.length || 0,
      nodesCount: context.currentSimulationState?.nodes?.length || 0
    });
    console.log('Turn History Length:', context.turnHistory?.length || 0);
    console.log('LOD Stats:', context.lodStats);
    console.log('Simulation Readiness:', context.simulationReadinessStatus);
    console.groupEnd();
  }

  /**
   * Debug world state flow
   */
  debugWorldStateFlow(activeWorldState, currentSimulationState, worldState) {
    if (!this.enabled) return;

    console.group(`${this.logPrefix} World State Flow`);
    console.log('Active World State Source:', 
      activeWorldState === currentSimulationState ? 'currentSimulationState' : 
      activeWorldState === worldState ? 'worldState prop' : 'fallback');
    
    console.log('Active World State:', {
      time: activeWorldState?.time,
      charactersCount: activeWorldState?.characters?.length || activeWorldState?.npcs?.length || 0,
      eventsCount: activeWorldState?.events?.length || 0,
      nodesCount: activeWorldState?.nodes?.length || 0,
      hasEvents: !!activeWorldState?.events,
      eventsIsArray: Array.isArray(activeWorldState?.events)
    });
    
    if (this.verbose) {
      console.log('Current Simulation State:', currentSimulationState);
      console.log('World State Prop:', worldState);
    }
    console.groupEnd();
  }

  /**
   * Debug turn processing
   */
  debugTurnProcessing(beforeState, afterState, result) {
    if (!this.enabled) return;

    console.group(`${this.logPrefix} Turn Processing`);
    console.log('Before Turn:', {
      turn: beforeState.currentTurn,
      eventsCount: beforeState.eventsCount,
      charactersCount: beforeState.charactersCount
    });
    
    console.log('After Turn:', {
      newTurn: afterState.currentTurn,
      newEventsCount: afterState.eventsCount,
      newCharactersCount: afterState.charactersCount
    });
    
    if (result && this.verbose) {
      console.log('Turn Result:', result);
    }
    console.groupEnd();
  }

  /**
   * Debug LOD (Level of Detail) system
   */
  debugLOD(lodStats, lodProcessingMetrics, lodTierTransitions) {
    if (!this.enabled) return;

    console.group(`${this.logPrefix} LOD System`);
    console.log('LOD Stats:', lodStats);
    console.log('Processing Metrics:', lodProcessingMetrics);
    if (lodTierTransitions?.length > 0) {
      console.log('Recent Tier Transitions:', lodTierTransitions.slice(-5));
    }
    console.groupEnd();
  }

  /**
   * Debug data structure consistency
   */
  debugDataStructures(worldState) {
    if (!this.enabled) return;

    console.group(`${this.logPrefix} Data Structure Consistency`);
    
    // Check characters/npcs consistency
    const characters = worldState?.characters;
    const npcs = worldState?.npcs;
    
    console.log('Characters Field:', {
      exists: !!characters,
      type: Array.isArray(characters) ? 'array' : characters instanceof Map ? 'map' : typeof characters,
      count: Array.isArray(characters) ? characters.length : characters instanceof Map ? characters.size : 0
    });
    
    console.log('NPCs Field:', {
      exists: !!npcs,
      type: Array.isArray(npcs) ? 'array' : npcs instanceof Map ? 'map' : typeof npcs,
      count: Array.isArray(npcs) ? npcs.length : npcs instanceof Map ? npcs.size : 0
    });
    
    // Check events consistency
    const events = worldState?.events;
    console.log('Events Field:', {
      exists: !!events,
      isArray: Array.isArray(events),
      count: Array.isArray(events) ? events.length : 0
    });
    
    // Check nodes consistency
    const nodes = worldState?.nodes;
    console.log('Nodes Field:', {
      exists: !!nodes,
      type: Array.isArray(nodes) ? 'array' : nodes instanceof Map ? 'map' : typeof nodes,
      count: Array.isArray(nodes) ? nodes.length : nodes instanceof Map ? nodes.size : 0
    });
    
    console.groupEnd();
  }

  /**
   * Create debug utilities for browser console
   */
  createConsoleUtilities() {
    if (!this.enabled) return;

    window.debugSimInterface = {
      enable: () => this.setEnabled(true),
      disable: () => this.setEnabled(false),
      verbose: () => this.setVerbose(true),
      quiet: () => this.setVerbose(false),
      
      // Quick state checks
      checkContext: () => {
        console.log('Checking simulation context...');
        // This would need to be called from within a component to access context
        console.log('Use debugSimInterface.checkContext() from within a React component with useSimulationContext access');
      },
      
      checkLocalStorage: () => {
        console.group('LocalStorage Check');
        const keys = Object.keys(localStorage).filter(key => 
          key.includes('world') || key.includes('simulation')
        );
        keys.forEach(key => {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            console.log(key, data);
          } catch (e) {
            console.log(key, localStorage.getItem(key));
          }
        });
        console.groupEnd();
      },
      
      checkMemory: () => {
        if (performance.memory) {
          console.log('Memory Usage:', {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
            total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
          });
        } else {
          console.log('Memory usage API not available');
        }
      }
    };

    console.log(`${this.logPrefix} Console utilities loaded. Access via window.debugSimInterface`);
  }
}

// Create default instance
export const simulationInterfaceDebugger = new SimulationInterfaceDebugger();

// Export class for custom instances
export default SimulationInterfaceDebugger;