// src/application/use-cases/services/SimulationService.js

// Removed import of generateWorld - now using processMapplessWorldState
import runTick from '../simulation/RunTick.js';
import analyzeHistory from '../history/AnalyzeHistory.js';
import Character from '../../../domain/entities/Character.js';
import Node from '../../../domain/entities/Node.js';
import DataStructureUtils from '../../../shared/utils/DataStructureUtils.js';

class SimulationService {
  constructor() {
    this.worldState = null;
    this.isRunning = false;
    this.tickInterval = null;
    
    // Turn-based simulation properties
    this.isTurnBasedMode = true;
    this.turnHistory = [];
    this.maxTurnHistory = 100;
    this.currentTurnSummary = null;
    this.isInitialized = false; // Track initialization status
  }

  /**
   * Initialize simulation with prepared world data
   * @param {Object} preparedWorldData - World data prepared by WorldBuilder and validated by SimulationContext
   * @returns {Object} Initialized world state
   * @throws {Error} If world data is not properly prepared
   */
  initialize(preparedWorldData) {
    // Runtime validation check - ensure proper data structures
    if (!preparedWorldData || typeof preparedWorldData !== 'object') {
      throw new Error(
        'Invalid world data format. Expected prepared world data object from SimulationContext.'
      );
    }

    // Validate that this is prepared world data, not raw config
    if (!preparedWorldData.simulationMetadata) {
      throw new Error(
        'SimulationService.initialize() now requires prepared world data. ' +
        'Use WorldBuilder.prepareForSimulation() followed by SimulationContext.acceptPreparedWorld()'
      );
    }

    // Validate source
    if (preparedWorldData.simulationMetadata.source !== 'WorldBuilder' && 
        preparedWorldData.simulationMetadata.source !== 'DemoService') {
      throw new Error(
        'SimulationService.initialize() now requires prepared world data. ' +
        'Use WorldBuilder.prepareForSimulation() followed by SimulationContext.acceptPreparedWorld()'
      );
    }

    // Validate required data structures are Maps
    if (!(preparedWorldData.nodes instanceof Map)) {
      throw new Error(
        'Invalid world data structure: nodes must be a Map. ' +
        'Ensure data comes from SimulationContext.acceptPreparedWorld()'
      );
    }

    if (!(preparedWorldData.characters instanceof Map)) {
      throw new Error(
        'Invalid world data structure: characters must be a Map. ' +
        'Ensure data comes from SimulationContext.acceptPreparedWorld()'
      );
    }

    if (!(preparedWorldData.interactions instanceof Map)) {
      throw new Error(
        'Invalid world data structure: interactions must be a Map. ' +
        'Ensure data comes from SimulationContext.acceptPreparedWorld()'
      );
    }

    // Validate world properties
    if (!preparedWorldData.worldProperties || !preparedWorldData.worldProperties.name) {
      throw new Error(
        'Invalid world data: missing required world properties. ' +
        'Ensure world is properly prepared through the pipeline.'
      );
    }

    // Convert prepared data to simulation state
    this.worldState = this.processPreparedWorldData(preparedWorldData);
    this.initializeTurnHistory();
    this.saveState();  // Persist initial state
    this.isInitialized = true; // Mark as initialized after successful setup
    return this.worldState;
  }

  /**
   * Process prepared world data into simulation state
   * @private
   * @param {Object} preparedWorldData - Prepared world data with Maps and metadata
   * @returns {Object} Simulation world state
   */
  processPreparedWorldData(preparedWorldData) {
    // Validate data structure consistency first
    const validation = DataStructureUtils.validateStructureConsistency(preparedWorldData);
    if (!validation.isValid) {
      throw new Error(`Data structure inconsistency detected: ${validation.error}`);
    }

    // Ensure we have Map structure for simulation processing
    const mapData = DataStructureUtils.ensureMapStructure(preparedWorldData);

    // Validate that this looks like prepared world data
    if (!mapData.worldProperties || !mapData.worldProperties.name) {
      throw new Error('Invalid prepared world data structure: missing required worldProperties.name');
    }

    const { worldProperties, nodes, characters, interactions, settlements } = mapData;
    
    // Keep Maps for efficient lookups, but create arrays for iteration where needed
    const nodeArray = Array.from(nodes.values());
    const characterArray = Array.from(characters.values());
    const interactionArray = Array.from(interactions.values());
    const settlementArray = settlements ? Array.from(settlements.values()) : [];

    // Assign interactions to nodes based on character assignments
    nodeArray.forEach(node => {
      node.contentInteractions = [];
      
      // Find characters assigned to this node
      const nodeCharacters = characterArray.filter(char => 
        char.currentNodeId === node.id || 
        (char.assignments?.nodes && char.assignments.nodes.has(node.id))
      );
      
      // Collect all interactions from characters assigned to this node
      nodeCharacters.forEach(character => {
        if (character.assignments?.interactions) {
          const characterInteractions = interactionArray.filter(interaction =>
            character.assignments.interactions.has(interaction.id)
          );
          node.contentInteractions.push(...characterInteractions);
        }
      });
      
      // Remove duplicates
      const uniqueInteractions = node.contentInteractions.filter((interaction, index, self) =>
        index === self.findIndex(i => i.id === interaction.id)
      );
      node.contentInteractions = uniqueInteractions;
      
      console.log(`Node ${node.name} has ${node.contentInteractions.length} interactions assigned from ${nodeCharacters.length} characters`);
    });

    // Ensure all characters have valid currentNodeId assignments
    characterArray.forEach(character => {
      if (!character.currentNodeId) {
        // Try to assign from character assignments first
        if (character.assignments?.nodes?.size > 0) {
          const assignedNodeId = Array.from(character.assignments.nodes)[0];
          const nodeExists = nodeArray.some(node => node.id === assignedNodeId);
          if (nodeExists) {
            character.currentNodeId = assignedNodeId;
            console.log(`Assigned character ${character.name} to node ${assignedNodeId} from assignments`);
          }
        }
        
        // Fallback: assign to first available node
        if (!character.currentNodeId && nodeArray.length > 0) {
          character.currentNodeId = nodeArray[0].id;
          console.log(`Assigned character ${character.name} to first available node ${character.currentNodeId}`);
        }
      }
    });

    // Build simulation state
    const worldState = {
      time: 0,
      worldName: worldProperties.name,
      worldId: preparedWorldData.simulationMetadata.worldId || this._generateId(),
      nodes: nodeArray,
      npcs: characterArray,
      interactions: interactionArray,
      settlements: settlementArray,
      resources: {
        totalPopulation: characterArray.length,
        totalGold: this._calculateInitialResources(nodeArray, characterArray),
        population: characterArray.length
      },
      events: [], // Initialize events array for UI
      history: [],
      rules: worldProperties.rules || {},
      initialConditions: worldProperties.initialConditions || {},
      metadata: {
        preparedAt: preparedWorldData.simulationMetadata.preparedAt,
        source: preparedWorldData.simulationMetadata.source,
        version: '2.0.0'
      }
    };

    return worldState;
  }

  // Legacy validation method - kept for backward compatibility but deprecated
  validateMapplessWorldConfig(config) {
    console.warn(
      'validateMapplessWorldConfig is deprecated. ' +
      'Use WorldBuilder.prepareForSimulation() to prepare world data.'
    );
    return false;  // Always fail to force proper pipeline usage
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

  // Check if simulation can start (validates preparation pipeline completion)
  canStart() {
    if (!this.worldState) {
      return { canStart: false, reason: 'No world state initialized' };
    }

    // Validate preparation pipeline completion
    const validation = this.validatePipelineCompletion(this.worldState);
    return {
      canStart: validation.isComplete,
      reason: validation.isComplete ? 'Ready to start' : validation.missingPhases.join(', ')
    };
  }

  // Validate that all preparation phases are completed
  validatePipelineCompletion(worldState) {
    const missingPhases = [];

    // Phase 1: World properties
    if (!worldState.worldName || !worldState.rules) {
      missingPhases.push('Phase 1: World properties incomplete');
    }

    // Phase 2: Nodes exist
    if (!worldState.nodes || worldState.nodes.length === 0) {
      missingPhases.push('Phase 2: No nodes created');
    }

    // Phase 3: Interactions exist
    if (!worldState.interactions || worldState.interactions.length === 0) {
      missingPhases.push('Phase 3: No interactions created');
    }

    // Phase 4: Characters exist with assigned interactions
    if (!worldState.npcs || worldState.npcs.length === 0) {
      missingPhases.push('Phase 4: No characters created');
    } else {
      const charactersWithoutInteractions = worldState.npcs.filter(npc => 
        !npc.assignedInteractions || npc.assignedInteractions.length === 0
      );
      if (charactersWithoutInteractions.length > 0) {
        missingPhases.push('Phase 4: Some characters have no assigned interactions');
      }
    }

    // Phase 5: All nodes have assigned characters
    if (worldState.nodes) {
      const nodesWithoutCharacters = worldState.nodes.filter(node => 
        !node.assignedCharacters || node.assignedCharacters.length === 0
      );
      if (nodesWithoutCharacters.length > 0) {
        missingPhases.push('Phase 5: Some nodes have no assigned characters');
      }
    }

    // Phase 6: All characters are assigned to nodes
    if (worldState.npcs) {
      const charactersWithoutNodes = worldState.npcs.filter(npc => !npc.currentNodeId);
      if (charactersWithoutNodes.length > 0) {
        missingPhases.push('Phase 6: Some characters are not assigned to nodes');
      }
    }

    return {
      isComplete: missingPhases.length === 0,
      missingPhases
    };
  }

  // Start the simulation in turn-based mode (no automatic progression)
  start() {
    if (this.isRunning || !this.worldState) {
      throw new Error('Simulation already running or not initialized');
    }

    this.isRunning = true;
    console.log('Simulation started in turn-based mode. Use processTurn() to advance manually.');
    
    // Initialize turn history
    this.initializeTurnHistory();
    
    // No automatic tick interval in turn-based mode
    // Users must call processTurn() manually
    return this.worldState;
  }

  // Process a single turn manually (replaces automatic ticking)
  // Process a single turn manually (for turn-based simulation)
  processTurn() {
    if (!this.worldState) {
      throw new Error('Simulation not initialized');
    }
    // Remove the isRunning check - turn-based simulation doesn't need to be "running"

    try {
      const previousTime = this.worldState.time;
      const previousState = this.deepCloneState(this.worldState);
      
      // Track turn start
      const turnStartTime = Date.now();
      
      // Validate world state before processing
      if (typeof this.validateWorldStateIntegrity === 'function') {
        this.validateWorldStateIntegrity();
      } else {
        console.error('validateWorldStateIntegrity method not found - possible compilation issue');
        // Fallback basic validation
        if (!this.worldState) {
          throw new Error('World state is null or undefined');
        }
        if (!Array.isArray(this.worldState.nodes) || !Array.isArray(this.worldState.npcs)) {
          throw new Error('Invalid world state structure');
        }
      }
      
      // Process the turn using existing runTick logic
      const updatedState = runTick(this.worldState);

      // Validate that the turn operation succeeded
      if (!updatedState) {
        throw new Error('Turn processing failed - invalid state returned');
      }

      if (typeof updatedState.time !== 'number' || updatedState.time <= previousTime) {
        throw new Error(`Turn processing failed - invalid time progression from ${previousTime} to ${updatedState.time}`);
      }

      this.worldState = updatedState;

      // Generate turn summary
      const turnSummary = this.generateTurnSummary(
        previousState, 
        updatedState, 
        Date.now() - turnStartTime
      );
      
      this.currentTurnSummary = turnSummary;
      
      // Add to turn history
      this.addToTurnHistory(turnSummary);

      // Save state
      const saveSuccess = this.saveState();
      if (!saveSuccess) {
        console.warn(`Failed to save state after turn ${updatedState.time}`);
      }

      // Trigger UI callback if set
      if (this.onTick) {
        try {
          this.onTick(updatedState);
        } catch (callbackError) {
          console.error('Error in onTick callback:', callbackError);
        }
      }

      console.log(`Turn ${updatedState.time} processed successfully`);
      return {
        worldState: this.worldState,
        turnSummary: turnSummary,
        success: true
      };
      
    } catch (turnError) {
      console.error('Error during turn processing:', turnError);
      throw turnError;
    }
  }

  // Stop the simulation
  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    this.isRunning = false;
    console.log('Simulation stopped');
  }

  // Reset the simulation to initial state
  reset() {
    this.stop(); // Stop if running
    this.worldState = null;
    this.turnHistory = [];
    this.currentTurnSummary = null;
    this.isInitialized = false; // Reset initialization status
    localStorage.removeItem('worldState'); // Clear saved state
    // Note: reset() no longer auto-initializes - requires valid world config
    return null;
  }

  // Execute a single tick manually (legacy method for backward compatibility)
  step() {
    console.warn('step() is deprecated. Use processTurn() instead for turn-based simulation.');
    return this.processTurn();
  }

  // Initialize turn history tracking
  initializeTurnHistory() {
    this.turnHistory = [];
    this.currentTurnSummary = null;
    
    if (this.worldState) {
      // Add initial state to history
      const initialSummary = {
        turn: this.worldState.time || 0,
        timestamp: new Date(),
        summary: 'Simulation initialized',
        events: [],
        characterActions: [],
        changes: {
          charactersChanged: 0,
          resourcesChanged: 0,
          newEvents: 0
        },
        processingTime: 0
      };
      
      this.turnHistory.push(initialSummary);
      this.currentTurnSummary = initialSummary;
    }
  }

  // Generate comprehensive turn summary
  generateTurnSummary(previousState, currentState, processingTime) {
    const summary = {
      turn: currentState.time,
      timestamp: new Date(),
      processingTime: processingTime,
      events: [],
      characterActions: [],
      changes: {
        charactersChanged: 0,
        resourcesChanged: 0,
        settlementsChanged: 0,
        newEvents: 0
      }
    };

    // Track character changes and actions
    if (previousState.npcs && currentState.npcs) {
      currentState.npcs.forEach((currentNpc, index) => {
        const previousNpc = previousState.npcs[index];
        
        if (previousNpc) {
          // Check for significant changes
          const hasChanges = this.hasSignificantCharacterChanges(previousNpc, currentNpc);
          
          if (hasChanges) {
            summary.changes.charactersChanged++;
            
            // Track character action if they performed an interaction
            if (currentNpc.lastInteractionType) {
              summary.characterActions.push({
                characterId: currentNpc.id,
                characterName: currentNpc.name,
                action: currentNpc.lastInteractionType,
                nodeId: currentNpc.currentNodeId,
                nodeName: this.getNodeName(currentNpc.currentNodeId, currentState.nodes)
              });
            }
          }
        }
      });
    }

    // Track resource changes
    if (previousState.resources && currentState.resources) {
      for (const [resourceType, currentAmount] of Object.entries(currentState.resources)) {
        const previousAmount = previousState.resources[resourceType] || 0;
        if (currentAmount !== previousAmount) {
          summary.changes.resourcesChanged++;
          summary.events.push({
            type: 'resource_change',
            resourceType,
            previousAmount,
            currentAmount,
            change: currentAmount - previousAmount
          });
        }
      }
    }

    // Track settlement changes (need satisfaction updates)
    if (previousState.settlements && currentState.settlements) {
      currentState.settlements.forEach((currentSettlement, index) => {
        const previousSettlement = previousState.settlements[index];
        
        if (previousSettlement && currentSettlement.needSatisfaction) {
          const hasNeedSatisfactionChanges = this.hasSignificantSettlementChanges(previousSettlement, currentSettlement);
          
          if (hasNeedSatisfactionChanges) {
            summary.changes.settlementsChanged++;
            
            // Track need satisfaction changes
            if (currentSettlement.needSatisfaction.current) {
              summary.events.push({
                type: 'need_satisfaction_change',
                settlementId: currentSettlement.id,
                settlementName: currentSettlement.name,
                needs: currentSettlement.needSatisfaction.current,
                trends: currentSettlement.needSatisfaction.trends,
                activeConsequences: currentSettlement.needSatisfaction.activeConsequences?.length || 0
              });
            }
          }
        }
      });
    }

    // Generate summary text
    summary.summary = this.generateSummaryText(summary);
    
    return summary;
  }

  // Check if character has significant changes worth reporting
  hasSignificantCharacterChanges(previousNpc, currentNpc) {
    // Check for interaction activity
    if (currentNpc.lastInteractionType !== previousNpc.lastInteractionType) {
      return true;
    }
    
    // Check for significant stat changes (>5 points)
    const statChanges = ['energy', 'health', 'mood'].some(stat => {
      const prev = previousNpc[stat] || 0;
      const curr = currentNpc[stat] || 0;
      return Math.abs(curr - prev) > 5;
    });
    
    return statChanges;
  }

  // Check if settlement has significant need satisfaction changes worth reporting
  hasSignificantSettlementChanges(previousSettlement, currentSettlement) {
    // Check if need satisfaction was just initialized
    if (!previousSettlement.needSatisfaction && currentSettlement.needSatisfaction) {
      return true;
    }

    // Check for significant need satisfaction changes (>0.1 points)
    if (previousSettlement.needSatisfaction?.current && currentSettlement.needSatisfaction?.current) {
      const needTypes = ['food', 'water', 'shelter', 'goods', 'services', 'overall'];
      const hasSignificantChanges = needTypes.some(need => {
        const prev = previousSettlement.needSatisfaction.current[need] || 0.5;
        const curr = currentSettlement.needSatisfaction.current[need] || 0.5;
        return Math.abs(curr - prev) > 0.1;
      });
      
      if (hasSignificantChanges) {
        return true;
      }
    }

    // Check for new consequences
    const prevConsequences = previousSettlement.needSatisfaction?.activeConsequences?.length || 0;
    const currConsequences = currentSettlement.needSatisfaction?.activeConsequences?.length || 0;
    if (currConsequences !== prevConsequences) {
      return true;
    }

    return false;
  }

  // Generate human-readable summary text
  generateSummaryText(summary) {
    const parts = [];
    
    if (summary.characterActions.length > 0) {
      const actionCount = summary.characterActions.length;
      parts.push(`${actionCount} character${actionCount > 1 ? 's' : ''} took action`);
    }
    
    if (summary.changes.resourcesChanged > 0) {
      parts.push(`${summary.changes.resourcesChanged} resource${summary.changes.resourcesChanged > 1 ? 's' : ''} changed`);
    }
    
    if (summary.changes.settlementsChanged > 0) {
      parts.push(`${summary.changes.settlementsChanged} settlement${summary.changes.settlementsChanged > 1 ? 's' : ''} had need satisfaction changes`);
    }
    
    if (parts.length === 0) {
      return 'No significant changes occurred';
    }
    
    return parts.join(', ');
  }

  // Helper to get node name by ID
  getNodeName(nodeId, nodes) {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.name : 'Unknown Node';
  }

  // Add turn summary to history with size management
  addToTurnHistory(turnSummary) {
    this.turnHistory.push(turnSummary);
    
    // Maintain history size limit
    while (this.turnHistory.length > this.maxTurnHistory) {
      this.turnHistory.shift();
    }
  }

  // Get turn history (for UI display)
  getTurnHistory(count = null) {
    if (count && count > 0) {
      return this.turnHistory.slice(-count);
    }
    return [...this.turnHistory];
  }

  // Get latest turn summary
  getLatestTurnSummary() {
    return this.currentTurnSummary;
  }

  // Deep clone state for comparison
  deepCloneState(state) {
    try {
      return JSON.parse(JSON.stringify(state));
    } catch (error) {
      console.error('Failed to clone state:', error);
      return null;
    }
  }

  // Get current world state (public accessor)
  getCurrentWorldState() {
    return this.worldState;
  }

  // Get historical events from the HistoryGenerator
  getHistoricalEvents(filters = {}) {
    try {
      const HistoryGenerator = require('../../../domain/services/HistoryGenerator.js').default;
      const historyGenerator = new HistoryGenerator();
      return historyGenerator.getEvents(filters);
    } catch (error) {
      console.error('Error retrieving historical events:', error);
      return [];
    }
  }

  // Get need satisfaction events for a specific settlement
  getNeedSatisfactionEvents(settlementId) {
    try {
      const HistoryGenerator = require('../../../domain/services/HistoryGenerator.js').default;
      const historyGenerator = new HistoryGenerator();
      return historyGenerator.getNeedSatisfactionEvents(settlementId);
    } catch (error) {
      console.error('Error retrieving need satisfaction events:', error);
      return [];
    }
  }

  // Get consequence events for a specific settlement
  getConsequenceEvents(settlementId) {
    try {
      const HistoryGenerator = require('../../../domain/services/HistoryGenerator.js').default;
      const historyGenerator = new HistoryGenerator();
      return historyGenerator.getConsequenceEvents(settlementId);
    } catch (error) {
      console.error('Error retrieving consequence events:', error);
      return [];
    }
  }

  // Get prosperity/decline events for a specific settlement
  getSettlementProsperityEvents(settlementId) {
    try {
      const HistoryGenerator = require('../../../domain/services/HistoryGenerator.js').default;
      const historyGenerator = new HistoryGenerator();
      return historyGenerator.getSettlementProsperityEvents(settlementId);
    } catch (error) {
      console.error('Error retrieving prosperity events:', error);
      return [];
    }
  }

  // Get historical event statistics
  getHistoricalEventStatistics() {
    try {
      const HistoryGenerator = require('../../../domain/services/HistoryGenerator.js').default;
      const historyGenerator = new HistoryGenerator();
      return historyGenerator.getEventStatistics();
    } catch (error) {
      console.error('Error retrieving event statistics:', error);
      return {
        total: 0,
        byType: {},
        bySeverity: {},
        bySettlement: {},
        averageSignificance: 0,
        timeRange: { earliest: null, latest: null }
      };
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
        settlements: Array.isArray(this.worldState.settlements) ? 
          this.worldState.settlements.map(settlement => settlement.toJSON ? settlement.toJSON() : settlement) : [],
        resources: this.worldState.resources || {},
        // Save turn-based simulation data
        turnHistory: this.turnHistory || [],
        currentTurnSummary: this.currentTurnSummary
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

      // Handle simple test states (nodes and npcs might not exist or be empty)
      const reconstructedNodes = Array.isArray(savedState.nodes) ? savedState.nodes.map(nodeData => {
        try {
          if (nodeData && typeof nodeData === 'object') {
            // Ensure node has an ID
            if (!nodeData.id) {
              console.warn('SimulationService: Node missing ID, generating new one');
              nodeData.id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            return Node.fromJSON ? Node.fromJSON(nodeData) : nodeData;
          }
          console.warn('SimulationService: Invalid node data, skipping:', nodeData);
          return null;
        } catch (error) {
          console.error('SimulationService: Failed to reconstruct node:', error, nodeData);
          return null;
        }
      }).filter(node => node !== null) : [];

      // Handle NPCs (might not exist or be empty for simple test states)
      const reconstructedNPCs = Array.isArray(savedState.npcs) ? savedState.npcs.map(npcData => {
        try {
          if (npcData && typeof npcData === 'object') {
            // For simple test states, don't validate currentNodeId if no nodes exist
            if (reconstructedNodes.length > 0) {
              const nodeIds = reconstructedNodes.map(n => n.id);
              // Check if NPC's currentNodeId is valid
              if (!npcData.currentNodeId || !nodeIds.includes(npcData.currentNodeId)) {
                console.warn(`SimulationService: NPC ${npcData.name} has invalid currentNodeId: ${npcData.currentNodeId}`);
                // Assign to first available node if exists
                npcData.currentNodeId = reconstructedNodes[0].id;
                console.log(`SimulationService: Reassigned NPC ${npcData.name} to node ${npcData.currentNodeId}`);
              }
            }
            return Character.fromJSON ? Character.fromJSON(npcData) : npcData;
          }
          console.warn('SimulationService: Invalid NPC data, skipping:', npcData);
          return null;
        } catch (error) {
          console.error('SimulationService: Failed to reconstruct NPC:', error, npcData);
          return null;
        }
      }).filter(npc => npc !== null) : [];

      // Handle settlements (might not exist in older save files)
      const reconstructedSettlements = Array.isArray(savedState.settlements) ? savedState.settlements : [];

      const reconstructedState = {
        time: typeof savedState.time === 'number' ? savedState.time : 0,
        worldName: savedState.worldName || '',
        worldDescription: savedState.worldDescription || '',
        rules: savedState.rules || {},
        initialConditions: savedState.initialConditions || {},
        nodes: reconstructedNodes,
        npcs: reconstructedNPCs,
        interactions: savedState.interactions || [],
        settlements: reconstructedSettlements,
        resources: savedState.resources && typeof savedState.resources === 'object' ? savedState.resources : {}
      };

      this.worldState = reconstructedState;

      // Restore turn-based simulation data
      if (Array.isArray(savedState.turnHistory)) {
        this.turnHistory = savedState.turnHistory;
      }
      if (savedState.currentTurnSummary) {
        this.currentTurnSummary = savedState.currentTurnSummary;
      }

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

  // Helper method to calculate initial resources from world data
  _calculateInitialResources(nodes, characters) {
    let totalGold = 0;
    
    // Calculate gold from nodes (settlements, resource nodes, etc.)
    nodes.forEach(node => {
      if (node.resources && node.resources.gold) {
        totalGold += node.resources.gold;
      } else if (node.type === 'settlement') {
        totalGold += 100; // Default gold for settlements
      } else if (node.type === 'resource') {
        totalGold += 50; // Default gold for resource nodes
      }
    });
    
    // Add gold from characters
    characters.forEach(character => {
      if (character.resources && character.resources.gold) {
        totalGold += character.resources.gold;
      } else {
        totalGold += 10; // Default starting gold per character
      }
    });
    
    return totalGold;
  }

  // Validate world state integrity before processing turns
  validateWorldStateIntegrity() {
    console.log('Starting world state integrity validation...');
    
    if (!this.worldState) {
      throw new Error('World state is null or undefined');
    }

    // Validate basic structure
    if (!Array.isArray(this.worldState.nodes)) {
      throw new Error('World state nodes must be an array');
    }

    if (!Array.isArray(this.worldState.npcs)) {
      throw new Error('World state npcs must be an array');
    }

    // Validate character-node relationships
    const nodeIds = new Set(this.worldState.nodes.map(node => node.id));
    const orphanedCharacters = [];

    this.worldState.npcs.forEach(character => {
      if (!character.currentNodeId) {
        // Try to assign from character assignments
        if (character.assignments?.nodes?.size > 0) {
          const assignedNodeId = Array.from(character.assignments.nodes)[0];
          if (nodeIds.has(assignedNodeId)) {
            character.currentNodeId = assignedNodeId;
            console.log(`Auto-assigned character ${character.name} to node ${assignedNodeId}`);
          } else {
            orphanedCharacters.push(character);
          }
        } else if (nodeIds.size > 0) {
          // Assign to first available node
          const firstNodeId = Array.from(nodeIds)[0];
          character.currentNodeId = firstNodeId;
          console.log(`Emergency assignment: ${character.name} assigned to node ${firstNodeId}`);
        } else {
          orphanedCharacters.push(character);
        }
      } else if (!nodeIds.has(character.currentNodeId)) {
        orphanedCharacters.push(character);
      }
    });

    if (orphanedCharacters.length > 0) {
      console.error('Characters with invalid node assignments:', orphanedCharacters.map(c => ({
        name: c.name,
        id: c.id,
        currentNodeId: c.currentNodeId
      })));
      throw new Error(`${orphanedCharacters.length} characters have invalid node assignments. Available nodes: ${Array.from(nodeIds).join(', ')}`);
    }

    // Validate time is a valid number
    if (typeof this.worldState.time !== 'number' || !Number.isFinite(this.worldState.time)) {
      console.warn('Invalid world state time, resetting to 0');
      this.worldState.time = 0;
    }

    console.log('World state integrity validated successfully');
  }
}

const simulationService = new SimulationService();
export default simulationService;  // Singleton instance for global access
