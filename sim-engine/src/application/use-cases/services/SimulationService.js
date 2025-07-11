// src/application/services/SimulationService.js

import generateWorld from '../use-cases/simulation/GenerateWorld.js';
import runTick from '../use-cases/simulation/RunTick.js';
import analyzeHistory from '../use-cases/history/AnalyzeHistory.js';
import Position from '../../../domain/value-objects/Positions.js';
import Character from '../../../domain/entities/Character.js';

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
      const updatedState = runTick(this.worldState);
      this.worldState = updatedState;
      this.saveState();  // Persist after each tick
      if (this.onTick) this.onTick(updatedState);  // Callback for UI
    }, this.worldState.tickDelay || 1000);  // Default 1s, adjusted by coherence
  }

  // Stop the simulation
  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.isRunning = false;
    }
  }

  // Analyze the current history
  getHistoryAnalysis(criteria = {}) {
    return analyzeHistory(criteria);
  }

  // Save state to localStorage (reused from old project)
  saveState() {
    const stateToSave = {
      time: this.worldState.time,
      nodes: this.worldState.nodes.map(node => ({ id: node.id, name: node.name, position: node.position.toJSON() })),
      npcs: this.worldState.npcs.map(npc => npc.toJSON()),
      resources: this.worldState.resources,
    };
    localStorage.setItem('worldState', JSON.stringify(stateToSave));
  }

  // Load state from localStorage
  loadState() {
    const savedState = JSON.parse(localStorage.getItem('worldState') || '{}');
    if (savedState.time !== undefined) {
      this.worldState = {
        time: savedState.time,
        nodes: savedState.nodes.map(node => ({
          id: node.id,
          name: node.name,
          position: new Position(node.position),
          interactions: [],  // Rebuild interactions if needed
        })),
        npcs: savedState.npcs.map(npc => new Character(npc)),
        resources: savedState.resources,
      };
    }
    return this.worldState;
  }

  // Event handler for UI updates (optional)
  setOnTick(callback) {
    this.onTick = callback;
  }
}

const simulationService = new SimulationService();
export default simulationService;  // Singleton instance for global access