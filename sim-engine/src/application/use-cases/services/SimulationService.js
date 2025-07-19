// src/application/use-cases/services/SimulationService.js

// Removed import of generateWorld - now using processMapplessWorldState
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

  // Initialize or reset the simulation with mappless world configuration
  initialize(config = {}) {
    if (!this.validateMapplessWorldConfig(config)) {
      throw new Error('Invalid mappless world configuration');
    }

    this.worldState = this.processMapplessWorldState(config);
    this.saveState();  // Persist initial state
    return this.worldState;
  }

  // Validate mappless world configuration before initialization
  validateMapplessWorldConfig(config) {
    if (!config || typeof config !== 'object') {
      console.error('SimulationService: Configuration must be an object');
      return false;
    }

    // Check required properties for mappless world
    if (!config.worldName || typeof config.worldName !== 'string') {
      console.error('SimulationService: worldName is required and must be a string');
      return false;
    }

    if (!Array.isArray(config.nodes) || config.nodes.length === 0) {
      console.error('SimulationService: At least one node is required');
      return false;
    }

    if (!Array.isArray(config.characters) || config.characters.length === 0) {
      console.error('SimulationService: At least one character is required');
      return false;
    }

    if (!Array.isArray(config.interactions) || config.interactions.length === 0) {
      console.error('SimulationService: At least one interaction is required');
      return false;
    }

    // Validate nodes are mappless (no spatial coordinates)
    for (const node of config.nodes) {
      if (node.position || node.x !== undefined || node.y !== undefined) {
        console.error('SimulationService: Nodes must not contain spatial coordinates (mappless design)');
        return false;
      }
      if (!node.id || !node.name || !node.type) {
        console.error('SimulationService: Each node must have id, name, and type');
        return false;
      }
    }

    // Validate characters have assigned interactions
    for (const character of config.characters) {
      if (!character.assignedInteractions || !Array.isArray(character.assignedInteractions) || character.assignedInteractions.length === 0) {
        console.error('SimulationService: Each character must have at least one assigned interaction');
        return false;
      }
      if (!character.id || !character.name) {
        console.error('SimulationService: Each character must have id and name');
        return false;
      }
    }

    // Validate all nodes have assigned characters
    const nodeIds = new Set(config.nodes.map(n => n.id));
    const characterIds = new Set(config.characters.map(c => c.id));
    
    for (const node of config.nodes) {
      if (!node.assignedCharacters || !Array.isArray(node.assignedCharacters) || node.assignedCharacters.length === 0) {
        console.error(`SimulationService: Node '${node.name}' must have at least one assigned character`);
        return false;
      }
      
      // Validate assigned characters exist
      for (const characterId of node.assignedCharacters) {
        if (!characterIds.has(characterId)) {
          console.error(`SimulationService: Node '${node.name}' references non-existent character '${characterId}'`);
          return false;
        }
      }
    }

    return true;
  }

  // Process mappless world state for simulation
  processMapplessWorldState(config) {
    const worldState = {
      time: 0,
      worldName: config.worldName,
      worldDescription: config.worldDescription || '',
      rules: config.rules || {},
      initialConditions: config.initialConditions || {},
      nodes: [],
      npcs: [],
      interactions: config.interactions || [],
      resources: {}
    };

    // Process abstract nodes (no spatial coordinates)
    worldState.nodes = config.nodes.map(nodeConfig => {
      return {
        id: nodeConfig.id,
        name: nodeConfig.name,
        type: nodeConfig.type,
        description: nodeConfig.description || '',
        environmentalProperties: nodeConfig.environmentalProperties || {},
        resourceAvailability: nodeConfig.resourceAvailability || {},
        culturalContext: nodeConfig.culturalContext || {},
        assignedCharacters: nodeConfig.assignedCharacters || [],
        // No position or spatial coordinates - mappless design
        interactions: this.getNodeInteractions(nodeConfig, config.interactions)
      };
    });

    // Process capability-driven characters
    worldState.npcs = config.characters.map(characterConfig => {
      // Find which node this character is assigned to
      const assignedNode = config.nodes.find(node => 
        node.assignedCharacters && node.assignedCharacters.includes(characterConfig.id)
      );

      const character = new Character({
        id: characterConfig.id,
        name: characterConfig.name,
        currentNodeId: assignedNode ? assignedNode.id : null,
        attributes: characterConfig.attributes || this.generateDefaultAttributes(),
        personality: characterConfig.personality || {},
        consciousness: characterConfig.consciousness || { frequency: 40, coherence: 0.7 },
        skills: characterConfig.skills || {},
        goals: characterConfig.goals || [],
        energy: characterConfig.energy || 100,
        health: characterConfig.health || 100,
        mood: characterConfig.mood || 80
      });

      // Add assignedInteractions as a separate property since Character entity doesn't support it
      character.assignedInteractions = characterConfig.assignedInteractions || [];

      // Ensure currentNodeId is set correctly
      if (assignedNode) {
        character.currentNodeId = assignedNode.id;
      }

      return character;
    });

    // Initialize resources based on node availability
    this.initializeResourcesFromNodes(worldState);

    return worldState;
  }

  // Get interactions available at a specific node
  getNodeInteractions(nodeConfig, allInteractions) {
    return allInteractions.filter(interaction => {
      // Check if interaction is contextually appropriate for this node
      return !interaction.context || 
             !interaction.context.nodeTypes || 
             interaction.context.nodeTypes.includes(nodeConfig.type);
    });
  }

  // Generate default D&D attributes for characters
  generateDefaultAttributes() {
    return {
      strength: { score: Math.floor(Math.random() * 10) + 10 },
      dexterity: { score: Math.floor(Math.random() * 10) + 10 },
      constitution: { score: Math.floor(Math.random() * 10) + 10 },
      intelligence: { score: Math.floor(Math.random() * 10) + 10 },
      wisdom: { score: Math.floor(Math.random() * 10) + 10 },
      charisma: { score: Math.floor(Math.random() * 10) + 10 }
    };
  }

  // Initialize resources based on node resource availability
  initializeResourcesFromNodes(worldState) {
    const resourceTypes = new Set();
    
    // Collect all resource types from nodes
    worldState.nodes.forEach(node => {
      if (node.resourceAvailability) {
        Object.keys(node.resourceAvailability).forEach(resource => {
          resourceTypes.add(resource);
        });
      }
    });

    // Initialize global resource pools
    resourceTypes.forEach(resourceType => {
      worldState.resources[resourceType] = 0;
      // Sum up initial resources from all nodes
      worldState.nodes.forEach(node => {
        if (node.resourceAvailability && node.resourceAvailability[resourceType]) {
          worldState.resources[resourceType] += node.resourceAvailability[resourceType];
        }
      });
    });
  }

  // Check if simulation can start (validates six-step completion)
  canStart() {
    if (!this.worldState) {
      return { canStart: false, reason: 'No world state initialized' };
    }

    // Validate six-step completion
    const validation = this.validateSixStepCompletion(this.worldState);
    return {
      canStart: validation.isComplete,
      reason: validation.isComplete ? 'Ready to start' : validation.missingSteps.join(', ')
    };
  }

  // Validate that all six steps are completed
  validateSixStepCompletion(worldState) {
    const missingSteps = [];

    // Step 1: World properties
    if (!worldState.worldName || !worldState.rules) {
      missingSteps.push('Step 1: World properties incomplete');
    }

    // Step 2: Nodes exist
    if (!worldState.nodes || worldState.nodes.length === 0) {
      missingSteps.push('Step 2: No nodes created');
    }

    // Step 3: Interactions exist
    if (!worldState.interactions || worldState.interactions.length === 0) {
      missingSteps.push('Step 3: No interactions created');
    }

    // Step 4: Characters exist with assigned interactions
    if (!worldState.npcs || worldState.npcs.length === 0) {
      missingSteps.push('Step 4: No characters created');
    } else {
      const charactersWithoutInteractions = worldState.npcs.filter(npc => 
        !npc.assignedInteractions || npc.assignedInteractions.length === 0
      );
      if (charactersWithoutInteractions.length > 0) {
        missingSteps.push('Step 4: Some characters have no assigned interactions');
      }
    }

    // Step 5: All nodes have assigned characters
    if (worldState.nodes) {
      const nodesWithoutCharacters = worldState.nodes.filter(node => 
        !node.assignedCharacters || node.assignedCharacters.length === 0
      );
      if (nodesWithoutCharacters.length > 0) {
        missingSteps.push('Step 5: Some nodes have no assigned characters');
      }
    }

    // Step 6: All characters are assigned to nodes
    if (worldState.npcs) {
      const charactersWithoutNodes = worldState.npcs.filter(npc => !npc.currentNodeId);
      if (charactersWithoutNodes.length > 0) {
        missingSteps.push('Step 6: Some characters are not assigned to nodes');
      }
    }

    return {
      isComplete: missingSteps.length === 0,
      missingSteps
    };
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
    // Note: reset() no longer auto-initializes - requires valid world config
    return null;
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

  // Update saveState to properly serialize mappless world state
  saveState() {
    if (!this.worldState) {
      console.warn('SimulationService: No world state to save');
      return false;
    }
    try {
      const stateToSave = {
        time: this.worldState.time || 0,
        worldName: this.worldState.worldName || '',
        worldDescription: this.worldState.worldDescription || '',
        rules: this.worldState.rules || {},
        initialConditions: this.worldState.initialConditions || {},
        nodes: Array.isArray(this.worldState.nodes) ? 
          this.worldState.nodes.map(node => node.toJSON ? node.toJSON() : node) : [],
        npcs: Array.isArray(this.worldState.npcs) ? 
          this.worldState.npcs.map(npc => npc.toJSON ? npc.toJSON() : npc) : [],
        interactions: this.worldState.interactions || [],
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