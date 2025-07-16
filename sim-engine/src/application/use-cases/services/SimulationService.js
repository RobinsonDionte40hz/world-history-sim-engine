// src/application/use-cases/services/SimulationService.js

import generateWorld from '../simulation/GenerateWorld.js';
import runTick from '../simulation/RunTick.js';
import analyzeHistory from '../history/AnalyzeHistory.js';
import Character from '../../../domain/entities/Character.js';
import Node from '../../../domain/entities/Node.js';

class SimulationService {
  constructor() {
    this.worldState = null;
    this.isRunning = false;
    this.tickInterval = null;
  }

  // Initialize or reset the simulation
  initialize(config = {}) {
    this.worldState = generateWorld(config);
    this.saveState();  // Persist initial state
    return this.worldState;
  }

  // Start the simulation loop
  start() {
    if (this.isRunning || !this.worldState) {
      throw new Error('Simulation already running or not initialized');
    }

    this.isRunning = true;
    this.tickInterval = setInterval(() => {
      try {
        const previousTime = this.worldState.time;
        const updatedState = runTick(this.worldState);

        // Validate that the tick operation succeeded and time was incremented properly
        if (!updatedState) {
          console.error('SimulationService.start: runTick returned null/undefined state');
          return; // Don't update state or increment turn counter
        }

        if (typeof updatedState.time !== 'number' || updatedState.time < previousTime) {
          console.error('SimulationService.start: Invalid time progression from', previousTime, 'to', updatedState.time);
          return; // Don't update state or increment turn counter
        }

        this.worldState = updatedState;

        // Only save state if the update was successful
        const saveSuccess = this.saveState();
        if (!saveSuccess) {
          console.warn('SimulationService.start: Failed to save state after tick', updatedState.time);
        }

        // Only trigger UI callback if everything succeeded
        if (this.onTick) {
          try {
            this.onTick(updatedState);
          } catch (callbackError) {
            console.error('SimulationService.start: Error in onTick callback:', callbackError);
            // Don't stop simulation for UI callback errors
          }
        }
      } catch (tickError) {
        console.error('SimulationService.start: Error during simulation tick:', tickError);
        console.error('SimulationService.start: Current turn counter preserved at:', this.getCurrentTurn());
        // Don't update worldState or increment turn counter on tick failure
        // Simulation continues with previous state
      }
    }, this.worldState.tickDelay || 1000);  // Default 1s, adjusted by coherence
  }

  // Stop the simulation
  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
      this.isRunning = false;
    }
  }

  // Reset the simulation to initial state
  reset() {
    this.stop(); // Stop if running
    this.worldState = null;
    localStorage.removeItem('worldState'); // Clear saved state
    this.initialize(); // Reinitialize with fresh state
    return this.worldState;
  }

  // Execute a single tick manually
  step() {
    if (!this.worldState) {
      throw new Error('Simulation not initialized');
    }
    if (this.isRunning) {
      throw new Error('Cannot step while simulation is running');
    }

    try {
      const previousTime = this.worldState.time;
      const updatedState = runTick(this.worldState);

      // Validate that the step operation succeeded and time was incremented properly
      if (!updatedState) {
        console.error('SimulationService.step: runTick returned null/undefined state');
        throw new Error('Step operation failed - invalid state returned');
      }

      if (typeof updatedState.time !== 'number' || updatedState.time < previousTime) {
        console.error('SimulationService.step: Invalid time progression from', previousTime, 'to', updatedState.time);
        throw new Error('Step operation failed - invalid time progression');
      }

      this.worldState = updatedState;

      // Only save state if the update was successful
      const saveSuccess = this.saveState();
      if (!saveSuccess) {
        console.warn('SimulationService.step: Failed to save state after step', updatedState.time);
      }

      // Only trigger UI callback if everything succeeded
      if (this.onTick) {
        try {
          this.onTick(updatedState);
        } catch (callbackError) {
          console.error('SimulationService.step: Error in onTick callback:', callbackError);
          // Don't fail the step operation for UI callback errors
        }
      }

      return this.worldState;
    } catch (stepError) {
      console.error('SimulationService.step: Error during simulation step:', stepError);
      console.error('SimulationService.step: Current turn counter preserved at:', this.getCurrentTurn());
      throw stepError; // Re-throw for caller to handle
    }
  }

  // Analyze the current history
  getHistoryAnalysis(criteria = {}) {
    return analyzeHistory(criteria);
  }

  // Update saveState to properly serialize nodes
  saveState() {
    if (!this.worldState) {
      console.warn('SimulationService: No world state to save');
      return false;
    }
    try {
      const stateToSave = {
        time: this.worldState.time || 0,
        nodes: this.worldState.nodes.map(node => node.toJSON ? node.toJSON() : node),
        npcs: this.worldState.npcs.map(npc => npc.toJSON ? npc.toJSON() : npc),
        resources: this.worldState.resources || {}
      };
      localStorage.setItem('worldState', JSON.stringify(stateToSave));
      console.log('SimulationService: State saved to localStorage');
      return true;
    } catch (error) {
      console.error('SimulationService: Failed to save state:', error);
      return false;
    }
  }

  // Update SimulationService.js loadState method
  loadState() {
    try {
      const savedStateStr = localStorage.getItem('worldState');
      if (!savedStateStr) {
        console.info('SimulationService: No saved state found in localStorage');
        return null;
      }

      const savedState = JSON.parse(savedStateStr);
      if (!this.isValidSavedState(savedState)) {
        console.warn('SimulationService: Invalid saved state structure, resetting to default');
        localStorage.removeItem('worldState');
        return null;
      }

      // Properly reconstruct nodes first
      const reconstructedNodes = Array.isArray(savedState.nodes) ? savedState.nodes.map(nodeData => {
        try {
          if (nodeData && typeof nodeData === 'object') {
            // Ensure node has an ID
            if (!nodeData.id) {
              console.warn('SimulationService: Node missing ID, generating new one');
              nodeData.id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            return Node.fromJSON(nodeData);
          }
          console.warn('SimulationService: Invalid node data, skipping:', nodeData);
          return null;
        } catch (error) {
          console.error('SimulationService: Failed to reconstruct node:', error, nodeData);
          return null;
        }
      }).filter(node => node !== null) : [];

      // Log available node IDs for debugging
      const nodeIds = reconstructedNodes.map(n => n.id);
      console.log('SimulationService: Reconstructed nodes with IDs:', nodeIds);

      // Reconstruct NPCs and validate their currentNodeId
      const reconstructedNPCs = Array.isArray(savedState.npcs) ? savedState.npcs.map(npcData => {
        try {
          if (npcData && typeof npcData === 'object') {
            // Check if NPC's currentNodeId is valid
            if (!npcData.currentNodeId || !nodeIds.includes(npcData.currentNodeId)) {
              console.warn(`SimulationService: NPC ${npcData.name} has invalid currentNodeId: ${npcData.currentNodeId}`);
              // Assign to first available node if exists
              if (reconstructedNodes.length > 0) {
                npcData.currentNodeId = reconstructedNodes[0].id;
                console.log(`SimulationService: Reassigned NPC ${npcData.name} to node ${npcData.currentNodeId}`);
              } else {
                console.error('SimulationService: No nodes available for NPC assignment');
                return null;
              }
            }
            return Character.fromJSON(npcData);
          }
          console.warn('SimulationService: Invalid NPC data, skipping:', npcData);
          return null;
        } catch (error) {
          console.error('SimulationService: Failed to reconstruct NPC:', error, npcData);
          return null;
        }
      }).filter(npc => npc !== null) : [];

      // Final validation: ensure we have at least one node if we have NPCs
      if (reconstructedNPCs.length > 0 && reconstructedNodes.length === 0) {
        console.error('SimulationService: Have NPCs but no nodes, cannot continue');
        localStorage.removeItem('worldState');
        return null;
      }

      const reconstructedState = {
        time: typeof savedState.time === 'number' ? savedState.time : 0,
        nodes: reconstructedNodes,
        npcs: reconstructedNPCs,
        resources: savedState.resources && typeof savedState.resources === 'object' ? savedState.resources : {}
      };

      this.worldState = reconstructedState;
      console.log(`SimulationService: Loaded state from localStorage with turn ${reconstructedState.time}`);
      console.log(`SimulationService: ${reconstructedNodes.length} nodes, ${reconstructedNPCs.length} NPCs`);
      return reconstructedState;
    } catch (error) {
      console.error('SimulationService: Failed to load state from localStorage:', error);
      localStorage.removeItem('worldState');
      return null;
    }
  }

  // Validate saved state structure
  isValidSavedState(state) {
    if (!state || typeof state !== 'object') {
      return false;
    }

    // Check if time is a valid number (including 0)
    if (typeof state.time !== 'number' || state.time < 0 || !Number.isFinite(state.time)) {
      return false;
    }

    // Check if required arrays exist (can be empty)
    if (!Array.isArray(state.nodes) || !Array.isArray(state.npcs)) {
      return false;
    }

    // Check if resources is an object
    if (!state.resources || typeof state.resources !== 'object') {
      return false;
    }

    return true;
  }

  // Get current turn counter from world state
  getCurrentTurn() {
    try {
      if (!this.worldState) {
        console.warn('SimulationService.getCurrentTurn: worldState is null or undefined');
        return 0;
      }

      if (this.worldState.time === null || this.worldState.time === undefined) {
        console.warn('SimulationService.getCurrentTurn: worldState.time is null or undefined');
        return 0;
      }

      if (typeof this.worldState.time !== 'number') {
        console.error('SimulationService.getCurrentTurn: worldState.time is not a number:', typeof this.worldState.time, this.worldState.time);
        return 0;
      }

      if (!Number.isFinite(this.worldState.time)) {
        console.error('SimulationService.getCurrentTurn: worldState.time is not finite:', this.worldState.time);
        return 0;
      }

      if (this.worldState.time < 0) {
        console.error('SimulationService.getCurrentTurn: worldState.time is negative:', this.worldState.time);
        return 0;
      }

      return this.worldState.time;
    } catch (error) {
      console.error('SimulationService.getCurrentTurn: Unexpected error getting current turn:', error);
      console.error('SimulationService.getCurrentTurn: worldState:', this.worldState);
      return 0;
    }
  }

  // Event handler for UI updates (optional)
  setOnTick(callback) {
    this.onTick = callback;
  }
}

const simulationService = new SimulationService();
export default simulationService;  // Singleton instance for global access