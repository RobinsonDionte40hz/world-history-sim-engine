/**
 * TurnManager - Class for manual turn progression and turn-based simulation mechanics
 * 
 * Implements turn counter and state tracking for discrete time steps.
 * Adds manual "Next Turn" button functionality to replace automatic progression.
 * Creates turn-based event resolution system for character actions.
 * Adds turn history tracking and ability to review previous turns.
 * 
 * Requirements: Turn-based simulation control
 */

class TurnManager {
  constructor(simulationService) {
    this.simulationService = simulationService;
    this.currentTurn = 0;
    this.maxTurns = null; // null = unlimited
    this.isPaused = false;
    this.isProcessing = false;
    
    // Turn history and tracking
    this.turnHistory = [];
    this.turnSummaries = new Map();
    this.eventLog = [];
    
    // Turn settings
    this.autoSave = true;
    this.autoSaveInterval = 10; // Save every 10 turns
    this.maxHistorySize = 100; // Keep last 100 turns
    
    // Callbacks
    this.onTurnStart = null;
    this.onTurnEnd = null;
    this.onTurnProcessed = null;
    this.onMaxTurnsReached = null;
  }

  /**
   * Initializes the turn manager with world state
   * @param {Object} worldState - Initial world state
   * @param {Object} settings - Turn manager settings
   */
  initialize(worldState, settings = {}) {
    this.currentTurn = settings.startingTurn || 0;
    this.maxTurns = settings.maxTurns || null;
    this.autoSave = settings.autoSave !== undefined ? settings.autoSave : true;
    this.autoSaveInterval = settings.autoSaveInterval || 10;
    this.maxHistorySize = settings.maxHistorySize || 100;
    
    // Clear previous state
    this.turnHistory = [];
    this.turnSummaries.clear();
    this.eventLog = [];
    this.isPaused = false;
    this.isProcessing = false;
    
    // Save initial state
    this.saveTurnState(worldState, 'Initialized');
    
    console.log(`TurnManager initialized at turn ${this.currentTurn}`);
  }

  /**
   * Processes the next turn manually
   * @returns {Promise<Object>} Turn processing result
   */
  async processNextTurn() {
    if (this.isProcessing) {
      throw new Error('Turn is already being processed');
    }
    
    if (this.isPaused) {
      throw new Error('Turn processing is paused');
    }
    
    if (this.maxTurns && this.currentTurn >= this.maxTurns) {
      if (this.onMaxTurnsReached) {
        this.onMaxTurnsReached(this.currentTurn);
      }
      throw new Error(`Maximum turns reached (${this.maxTurns})`);
    }

    this.isProcessing = true;
    const turnStartTime = Date.now();
    
    try {
      // Increment turn counter
      this.currentTurn++;
      
      // Fire turn start callback
      if (this.onTurnStart) {
        this.onTurnStart(this.currentTurn);
      }
      
      console.log(`Processing turn ${this.currentTurn}...`);
      
      // Get current world state before processing
      const preProcessingState = this.simulationService.getCurrentWorldState();
      
      // Process turn through simulation service
      const turnResult = await this.simulationService.processTurn();
      
      // Get updated world state after processing
      const postProcessingState = this.simulationService.getCurrentWorldState();
      
      // Generate turn summary
      const turnSummary = this.generateTurnSummary(
        this.currentTurn,
        preProcessingState,
        postProcessingState,
        turnResult
      );
      
      // Store turn summary
      this.turnSummaries.set(this.currentTurn, turnSummary);
      
      // Add events to event log
      if (turnResult.events) {
        turnResult.events.forEach(event => {
          this.eventLog.push({
            turn: this.currentTurn,
            timestamp: new Date(),
            ...event
          });
        });
      }
      
      // Save turn state to history
      this.saveTurnState(postProcessingState, turnSummary.summary);
      
      // Auto-save if configured
      if (this.autoSave && this.currentTurn % this.autoSaveInterval === 0) {
        await this.autoSaveState();
      }
      
      // Clean up old history if needed
      this.cleanupHistory();
      
      const processingTime = Date.now() - turnStartTime;
      console.log(`Turn ${this.currentTurn} processed in ${processingTime}ms`);
      
      // Fire turn end callbacks
      if (this.onTurnEnd) {
        this.onTurnEnd(this.currentTurn, turnSummary);
      }
      
      if (this.onTurnProcessed) {
        this.onTurnProcessed(this.currentTurn, turnSummary);
      }
      
      const result = {
        turnNumber: this.currentTurn,
        summary: turnSummary,
        processingTime,
        canContinue: !this.maxTurns || this.currentTurn < this.maxTurns
      };
      
      return result;
      
    } catch (error) {
      console.error(`Error processing turn ${this.currentTurn}:`, error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Generates a summary of what happened during the turn
   * @param {number} turnNumber - Turn number
   * @param {Object} beforeState - World state before processing
   * @param {Object} afterState - World state after processing
   * @param {Object} turnResult - Result from simulation processing
   * @returns {Object} Turn summary
   */
  generateTurnSummary(turnNumber, beforeState, afterState, turnResult) {
    const summary = {
      turn: turnNumber,
      timestamp: new Date(),
      events: turnResult.events || [],
      changes: [],
      statistics: {},
      summary: ''
    };

    // Compare character states
    const characterChanges = this.compareCharacterStates(beforeState.characters, afterState.characters);
    summary.changes.push(...characterChanges);
    
    // Compare node states
    const nodeChanges = this.compareNodeStates(beforeState.nodes, afterState.nodes);
    summary.changes.push(...nodeChanges);
    
    // Calculate statistics
    summary.statistics = {
      totalEvents: turnResult.events ? turnResult.events.length : 0,
      characterInteractions: turnResult.interactions || 0,
      economicActivity: turnResult.economicActivity || 0,
      populationChanges: turnResult.populationChanges || 0,
      resourceChanges: turnResult.resourceChanges || 0
    };
    
    // Generate text summary
    summary.summary = this.generateTextSummary(summary);
    
    return summary;
  }

  /**
   * Compares character states between turns
   * @param {Array} beforeCharacters - Characters before turn
   * @param {Array} afterCharacters - Characters after turn
   * @returns {Array} Array of changes
   */
  compareCharacterStates(beforeCharacters, afterCharacters) {
    const changes = [];
    
    // Create maps for easier comparison
    const beforeMap = new Map(beforeCharacters.map(char => [char.id, char]));
    const afterMap = new Map(afterCharacters.map(char => [char.id, char]));
    
    // Check for changes in existing characters
    for (const [id, afterChar] of afterMap) {
      const beforeChar = beforeMap.get(id);
      if (beforeChar) {
        // Check for attribute changes
        if (JSON.stringify(beforeChar.attributes) !== JSON.stringify(afterChar.attributes)) {
          changes.push({
            type: 'character_attribute_change',
            character: afterChar.name,
            characterId: id,
            before: beforeChar.attributes,
            after: afterChar.attributes
          });
        }
        
        // Check for location changes
        if (beforeChar.currentNode !== afterChar.currentNode) {
          changes.push({
            type: 'character_moved',
            character: afterChar.name,
            characterId: id,
            fromNode: beforeChar.currentNode,
            toNode: afterChar.currentNode
          });
        }
        
        // Check for relationship changes
        const beforeRels = (beforeChar.relationships || []).length;
        const afterRels = (afterChar.relationships || []).length;
        if (beforeRels !== afterRels) {
          changes.push({
            type: 'character_relationships_changed',
            character: afterChar.name,
            characterId: id,
            relationshipCount: afterRels,
            change: afterRels - beforeRels
          });
        }
      }
    }
    
    // Check for new characters
    for (const [id, afterChar] of afterMap) {
      if (!beforeMap.has(id)) {
        changes.push({
          type: 'character_added',
          character: afterChar.name,
          characterId: id,
          node: afterChar.currentNode
        });
      }
    }
    
    // Check for removed characters
    for (const [id, beforeChar] of beforeMap) {
      if (!afterMap.has(id)) {
        changes.push({
          type: 'character_removed',
          character: beforeChar.name,
          characterId: id,
          lastNode: beforeChar.currentNode
        });
      }
    }
    
    return changes;
  }

  /**
   * Compares node states between turns
   * @param {Array} beforeNodes - Nodes before turn
   * @param {Array} afterNodes - Nodes after turn
   * @returns {Array} Array of changes
   */
  compareNodeStates(beforeNodes, afterNodes) {
    const changes = [];
    
    const beforeMap = new Map(beforeNodes.map(node => [node.id, node]));
    const afterMap = new Map(afterNodes.map(node => [node.id, node]));
    
    for (const [id, afterNode] of afterMap) {
      const beforeNode = beforeMap.get(id);
      if (beforeNode) {
        // Check for resource changes
        if (JSON.stringify(beforeNode.resources) !== JSON.stringify(afterNode.resources)) {
          changes.push({
            type: 'node_resources_changed',
            node: afterNode.name,
            nodeId: id,
            before: beforeNode.resources,
            after: afterNode.resources
          });
        }
        
        // Check for population changes
        const beforePop = (beforeNode.population || []).length;
        const afterPop = (afterNode.population || []).length;
        if (beforePop !== afterPop) {
          changes.push({
            type: 'node_population_changed',
            node: afterNode.name,
            nodeId: id,
            population: afterPop,
            change: afterPop - beforePop
          });
        }
      }
    }
    
    return changes;
  }

  /**
   * Generates a human-readable text summary of the turn
   * @param {Object} summary - Turn summary object
   * @returns {string} Text summary
   */
  generateTextSummary(summary) {
    const parts = [];
    
    if (summary.statistics.totalEvents > 0) {
      parts.push(`${summary.statistics.totalEvents} events occurred`);
    }
    
    if (summary.statistics.characterInteractions > 0) {
      parts.push(`${summary.statistics.characterInteractions} character interactions`);
    }
    
    const movements = summary.changes.filter(c => c.type === 'character_moved').length;
    if (movements > 0) {
      parts.push(`${movements} character movements`);
    }
    
    const resourceChanges = summary.changes.filter(c => c.type === 'node_resources_changed').length;
    if (resourceChanges > 0) {
      parts.push(`${resourceChanges} resource updates`);
    }
    
    if (parts.length === 0) {
      return 'A quiet turn with no major events';
    }
    
    return parts.join(', ') + '.';
  }

  /**
   * Saves the current turn state to history
   * @param {Object} worldState - Current world state
   * @param {string} summary - Turn summary text
   */
  saveTurnState(worldState, summary) {
    const turnState = {
      turn: this.currentTurn,
      timestamp: new Date(),
      worldState: JSON.parse(JSON.stringify(worldState)), // Deep copy
      summary
    };
    
    this.turnHistory.push(turnState);
  }

  /**
   * Gets turn summary for a specific turn
   * @param {number} turnNumber - Turn number
   * @returns {Object|null} Turn summary
   */
  getTurnSummary(turnNumber) {
    return this.turnSummaries.get(turnNumber) || null;
  }

  /**
   * Gets recent turn summaries
   * @param {number} count - Number of recent turns to get
   * @returns {Array} Array of recent turn summaries
   */
  getRecentTurnSummaries(count = 5) {
    const recentTurns = [];
    for (let i = Math.max(1, this.currentTurn - count + 1); i <= this.currentTurn; i++) {
      const summary = this.getTurnSummary(i);
      if (summary) {
        recentTurns.push(summary);
      }
    }
    return recentTurns;
  }

  /**
   * Gets events from recent turns
   * @param {number} turnCount - Number of turns to look back
   * @returns {Array} Array of events
   */
  getRecentEvents(turnCount = 5) {
    const minTurn = Math.max(1, this.currentTurn - turnCount + 1);
    return this.eventLog.filter(event => event.turn >= minTurn);
  }

  /**
   * Pauses turn processing
   */
  pause() {
    this.isPaused = true;
    console.log('Turn processing paused');
  }

  /**
   * Resumes turn processing
   */
  resume() {
    this.isPaused = false;
    console.log('Turn processing resumed');
  }

  /**
   * Resets the turn manager to initial state
   */
  reset() {
    this.currentTurn = 0;
    this.turnHistory = [];
    this.turnSummaries.clear();
    this.eventLog = [];
    this.isPaused = false;
    this.isProcessing = false;
    console.log('TurnManager reset');
  }

  /**
   * Auto-saves the current simulation state
   * @returns {Promise<void>}
   */
  async autoSaveState() {
    try {
      if (this.simulationService.saveState) {
        await this.simulationService.saveState(`auto_save_turn_${this.currentTurn}`);
        console.log(`Auto-saved state at turn ${this.currentTurn}`);
      }
    } catch (error) {
      console.warn('Auto-save failed:', error.message);
    }
  }

  /**
   * Cleans up old history entries to maintain performance
   */
  cleanupHistory() {
    if (this.turnHistory.length > this.maxHistorySize) {
      const excessCount = this.turnHistory.length - this.maxHistorySize;
      this.turnHistory.splice(0, excessCount);
      console.log(`Cleaned up ${excessCount} old turn history entries`);
    }
    
    // Clean up old turn summaries
    const oldSummaryKeys = Array.from(this.turnSummaries.keys())
      .filter(turn => turn < this.currentTurn - this.maxHistorySize);
    
    oldSummaryKeys.forEach(key => {
      this.turnSummaries.delete(key);
    });
    
    if (oldSummaryKeys.length > 0) {
      console.log(`Cleaned up ${oldSummaryKeys.length} old turn summaries`);
    }
    
    // Clean up old events
    const minEventTurn = this.currentTurn - this.maxHistorySize;
    const originalEventCount = this.eventLog.length;
    this.eventLog = this.eventLog.filter(event => event.turn >= minEventTurn);
    
    const removedEventCount = originalEventCount - this.eventLog.length;
    if (removedEventCount > 0) {
      console.log(`Cleaned up ${removedEventCount} old events`);
    }
  }

  /**
   * Gets current turn statistics
   * @returns {Object} Current statistics
   */
  getCurrentStatistics() {
    return {
      currentTurn: this.currentTurn,
      maxTurns: this.maxTurns,
      isPaused: this.isPaused,
      isProcessing: this.isProcessing,
      historySize: this.turnHistory.length,
      summaryCount: this.turnSummaries.size,
      eventCount: this.eventLog.length,
      canContinue: !this.maxTurns || this.currentTurn < this.maxTurns
    };
  }

  /**
   * Exports turn history for analysis
   * @param {number} startTurn - Start turn (optional)
   * @param {number} endTurn - End turn (optional)
   * @returns {Object} Exported turn data
   */
  exportTurnHistory(startTurn = null, endTurn = null) {
    const start = startTurn || 1;
    const end = endTurn || this.currentTurn;
    
    const summaries = [];
    for (let turn = start; turn <= end; turn++) {
      const summary = this.getTurnSummary(turn);
      if (summary) {
        summaries.push(summary);
      }
    }
    
    const events = this.eventLog.filter(event => 
      event.turn >= start && event.turn <= end
    );
    
    return {
      startTurn: start,
      endTurn: end,
      currentTurn: this.currentTurn,
      summaries,
      events,
      exportedAt: new Date()
    };
  }
}

export default TurnManager;
