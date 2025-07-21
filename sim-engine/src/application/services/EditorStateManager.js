/**
 * EditorStateManager - Centralized state management across all editors
 * 
 * Manages editor navigation, unsaved changes tracking, and shared state
 * between World Foundation, Node, Character, Interaction, and Encounter editors.
 * 
 * Requirements: 1.1, 1.2, 1.3, 8.1, 8.2, 8.3, 8.4
 */

import { EventEmitter } from 'events';
import WorldBuilder from '../../domain/services/WorldBuilder';

class EditorStateManager extends EventEmitter {
  constructor() {
    super();

    // Initialize WorldBuilder instance for managing world configuration
    this.worldBuilder = new WorldBuilder();

    // Editor state tracking
    this.state = {
      currentEditor: null,
      currentWorld: null,
      hasUnsavedChanges: false,
      saveStatus: 'idle', // 'idle' | 'saving' | 'saved' | 'error'
      validationErrors: [],
      navigationHistory: [],
      editorData: {
        world: null,
        nodes: {},
        characters: {},
        interactions: {},
        encounters: {}
      }
    };

    // Editor type definitions
    this.editorTypes = {
      WORLD: 'world',
      NODES: 'nodes',
      CHARACTERS: 'characters',
      INTERACTIONS: 'interactions',
      ENCOUNTERS: 'encounters'
    };

    // Bind methods to maintain context
    this.setCurrentEditor = this.setCurrentEditor.bind(this);
    this.setCurrentWorld = this.setCurrentWorld.bind(this);
    this.setUnsavedChanges = this.setUnsavedChanges.bind(this);
    this.setSaveStatus = this.setSaveStatus.bind(this);
    this.setValidationErrors = this.setValidationErrors.bind(this);
    this.updateEditorData = this.updateEditorData.bind(this);
    this.getEditorData = this.getEditorData.bind(this);
    this.canNavigateAway = this.canNavigateAway.bind(this);
    this.reset = this.reset.bind(this);
  }

  /**
   * Set the current active editor
   * @param {string} editorType - Type of editor (world, nodes, characters, etc.)
   */
  setCurrentEditor(editorType) {
    if (!Object.values(this.editorTypes).includes(editorType)) {
      throw new Error(`Invalid editor type: ${editorType}`);
    }

    const previousEditor = this.state.currentEditor;
    this.state.currentEditor = editorType;

    // Add to navigation history
    if (previousEditor && previousEditor !== editorType) {
      this.state.navigationHistory.push(previousEditor);
      // Keep history limited to last 10 entries
      if (this.state.navigationHistory.length > 10) {
        this.state.navigationHistory.shift();
      }
    }

    this.emit('editorChanged', {
      current: editorType,
      previous: previousEditor,
      history: [...this.state.navigationHistory]
    });
  }

  /**
   * Set the current world being edited
   * @param {Object} world - World object with id, name, and other properties
   */
  setCurrentWorld(world) {
    this.state.currentWorld = world;
    this.emit('worldChanged', world);
  }

  /**
   * Set unsaved changes status
   * @param {boolean} hasChanges - Whether there are unsaved changes
   */
  setUnsavedChanges(hasChanges) {
    this.state.hasUnsavedChanges = hasChanges;
    this.emit('unsavedChangesChanged', hasChanges);
  }

  /**
   * Set save status
   * @param {string} status - Save status ('idle', 'saving', 'saved', 'error')
   * @param {string} message - Optional status message
   */
  setSaveStatus(status, message = null) {
    const validStatuses = ['idle', 'saving', 'saved', 'error'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid save status: ${status}`);
    }

    this.state.saveStatus = status;
    this.emit('saveStatusChanged', { status, message, timestamp: new Date() });
  }

  /**
   * Set validation errors
   * @param {Array} errors - Array of validation error objects
   */
  setValidationErrors(errors) {
    this.state.validationErrors = errors || [];
    this.emit('validationErrorsChanged', this.state.validationErrors);
  }

  /**
   * Update editor-specific data
   * @param {string} editorType - Type of editor
   * @param {string} itemId - ID of the item being updated
   * @param {Object} data - Data to store
   */
  updateEditorData(editorType, itemId, data) {
    if (!Object.values(this.editorTypes).includes(editorType)) {
      throw new Error(`Invalid editor type: ${editorType}`);
    }

    if (editorType === this.editorTypes.WORLD) {
      this.state.editorData.world = data;

      // Update WorldBuilder with world properties
      if (data && data.name && data.description) {
        try {
          this.worldBuilder.setWorldProperties(data.name, data.description);
          if (data.rules) {
            this.worldBuilder.setRules(data.rules);
          }
          if (data.initialConditions) {
            this.worldBuilder.setInitialConditions(data.initialConditions);
          }
        } catch (error) {
          console.error('Error updating WorldBuilder:', error);
        }
      }
    } else {
      if (!this.state.editorData[editorType]) {
        this.state.editorData[editorType] = {};
      }
      this.state.editorData[editorType][itemId] = data;

      // Update WorldBuilder arrays for checklist validation
      this._syncWithWorldBuilder(editorType, itemId, data);
    }

    this.emit('editorDataChanged', { editorType, itemId, data });
  }

  /**
   * Sync editor data with WorldBuilder for checklist validation
   * @param {string} editorType - Type of editor
   * @param {string} itemId - ID of the item
   * @param {Object} data - Data to sync
   */
  _syncWithWorldBuilder(editorType, itemId, data) {
    try {
      const worldConfig = this.worldBuilder.worldConfig;

      if (editorType === this.editorTypes.NODES) {
        // Update nodes array
        const existingIndex = worldConfig.nodes.findIndex(n => n.id === itemId);
        const nodeData = { id: itemId, ...data };

        if (existingIndex >= 0) {
          worldConfig.nodes[existingIndex] = nodeData;
        } else {
          worldConfig.nodes.push(nodeData);
        }
      } else if (editorType === this.editorTypes.INTERACTIONS) {
        // Update interactions array
        const existingIndex = worldConfig.interactions.findIndex(i => i.id === itemId);
        const interactionData = { id: itemId, ...data };

        if (existingIndex >= 0) {
          worldConfig.interactions[existingIndex] = interactionData;
        } else {
          worldConfig.interactions.push(interactionData);
        }
      } else if (editorType === this.editorTypes.CHARACTERS) {
        // Update characters array
        const existingIndex = worldConfig.characters.findIndex(c => c.id === itemId);
        const characterData = { id: itemId, ...data };

        if (existingIndex >= 0) {
          worldConfig.characters[existingIndex] = characterData;
        } else {
          worldConfig.characters.push(characterData);
        }
      }
    } catch (error) {
      console.error('Error syncing with WorldBuilder:', error);
    }
  }

  /**
   * Get editor-specific data
   * @param {string} editorType - Type of editor
   * @param {string} itemId - Optional ID of specific item
   * @returns {Object} Editor data
   */
  getEditorData(editorType, itemId = null) {
    if (!Object.values(this.editorTypes).includes(editorType)) {
      throw new Error(`Invalid editor type: ${editorType}`);
    }

    if (editorType === this.editorTypes.WORLD) {
      // Return world data from WorldBuilder if available, otherwise from state
      const worldBuilderData = this.worldBuilder.worldConfig;
      if (worldBuilderData && (worldBuilderData.name || worldBuilderData.description)) {
        return {
          id: this.state.editorData.world?.id || null,
          name: worldBuilderData.name,
          description: worldBuilderData.description,
          rules: worldBuilderData.rules,
          initialConditions: worldBuilderData.initialConditions,
          ...this.state.editorData.world
        };
      }
      return this.state.editorData.world;
    }

    if (itemId) {
      return this.state.editorData[editorType]?.[itemId] || null;
    }

    return this.state.editorData[editorType] || {};
  }

  /**
   * Check if navigation away from current editor is allowed
   * @returns {boolean} Whether navigation is allowed
   */
  canNavigateAway() {
    return !this.state.hasUnsavedChanges;
  }

  /**
   * Get current state snapshot
   * @returns {Object} Current state
   */
  getState() {
    return {
      ...this.state,
      navigationHistory: [...this.state.navigationHistory],
      validationErrors: [...this.state.validationErrors],
      editorData: JSON.parse(JSON.stringify(this.state.editorData))
    };
  }

  /**
   * Check if world foundation is complete
   * @returns {boolean} Whether world foundation is saved and complete
   */
  isWorldFoundationComplete() {
    // Check basic world properties are set
    const worldConfig = this.worldBuilder.worldConfig;
    return !!(worldConfig && worldConfig.name && worldConfig.description);
  }

  /**
   * Get simulation readiness checklist
   * @returns {Object} Checklist of requirements for simulation
   */
  getSimulationChecklist() {
    const worldConfig = this.worldBuilder.worldConfig;

    return {
      worldProperties: {
        completed: !!(worldConfig.name && worldConfig.description),
        required: true,
        description: 'World must have a name and description'
      },
      hasNodes: {
        completed: worldConfig.nodes && worldConfig.nodes.length > 0,
        required: true,
        description: 'At least one node (location) must be created'
      },
      hasInteractions: {
        completed: worldConfig.interactions && worldConfig.interactions.length > 0,
        required: true,
        description: 'At least one interaction must be defined'
      },
      hasCharacters: {
        completed: worldConfig.characters && worldConfig.characters.length > 0,
        required: true,
        description: 'At least one character must be created'
      },
      charactersHaveInteractions: {
        completed: this._checkCharactersHaveInteractions(),
        required: true,
        description: 'All characters must have at least one assigned interaction'
      },
      nodesPopulated: {
        completed: this._checkNodesPopulated(),
        required: true,
        description: 'All nodes must have at least one character assigned'
      },
      worldRules: {
        completed: !!(worldConfig.rules),
        required: false,
        description: 'World rules define simulation parameters (optional)'
      },
      initialConditions: {
        completed: !!(worldConfig.initialConditions),
        required: false,
        description: 'Initial conditions set starting state (optional)'
      }
    };
  }

  /**
   * Check if simulation can be started
   * @returns {boolean} Whether all required checklist items are complete
   */
  canStartSimulation() {
    const checklist = this.getSimulationChecklist();
    return Object.values(checklist)
      .filter(item => item.required)
      .every(item => item.completed);
  }

  /**
   * Get list of missing requirements for simulation
   * @returns {Array} Array of missing requirement descriptions
   */
  getMissingRequirements() {
    const checklist = this.getSimulationChecklist();
    return Object.values(checklist)
      .filter(item => item.required && !item.completed)
      .map(item => item.description);
  }

  /**
   * Assign characters to a node
   * @param {string} nodeId - ID of the node
   * @param {Array} characterIds - Array of character IDs to assign
   */
  assignCharactersToNode(nodeId, characterIds) {
    if (!this.worldBuilder.worldConfig.nodePopulations) {
      this.worldBuilder.worldConfig.nodePopulations = {};
    }

    this.worldBuilder.worldConfig.nodePopulations[nodeId] = characterIds;
    this.emit('nodePopulationChanged', { nodeId, characterIds });
  }

  /**
   * Get characters assigned to a node
   * @param {string} nodeId - ID of the node
   * @returns {Array} Array of character IDs assigned to the node
   */
  getNodePopulation(nodeId) {
    return this.worldBuilder.worldConfig.nodePopulations?.[nodeId] || [];
  }

  /**
   * Get available editors based on current state
   * @returns {Array} Array of available editor types
   */
  getAvailableEditors() {
    const available = [this.editorTypes.WORLD];

    if (this.isWorldFoundationComplete()) {
      available.push(
        this.editorTypes.NODES,
        this.editorTypes.CHARACTERS,
        this.editorTypes.INTERACTIONS,
        this.editorTypes.ENCOUNTERS
      );
    }

    return available;
  }

  /**
   * Reset all state to initial values
   */
  reset() {
    // Reset WorldBuilder to initial state
    this.worldBuilder = new WorldBuilder();

    this.state = {
      currentEditor: null,
      currentWorld: null,
      hasUnsavedChanges: false,
      saveStatus: 'idle',
      validationErrors: [],
      navigationHistory: [],
      editorData: {
        world: null,
        nodes: {},
        characters: {},
        interactions: {},
        encounters: {}
      }
    };

    this.emit('stateReset');
  }

  /**
   * Subscribe to state changes
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  subscribe(event, callback) {
    this.on(event, callback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  // Private helper methods

  /**
   * Check if all characters have at least one interaction assigned
   * @returns {boolean} Whether all characters have interactions
   */
  _checkCharactersHaveInteractions() {
    const worldConfig = this.worldBuilder.worldConfig;
    if (!worldConfig.characters || worldConfig.characters.length === 0) {
      return false;
    }

    return worldConfig.characters.every(character =>
      character.assignedInteractions && character.assignedInteractions.length > 0
    );
  }

  /**
   * Check if all nodes have at least one character assigned
   * @returns {boolean} Whether all nodes are populated
   */
  _checkNodesPopulated() {
    const worldConfig = this.worldBuilder.worldConfig;
    if (!worldConfig.nodes || worldConfig.nodes.length === 0) {
      return false;
    }

    // Check if nodePopulations exists and covers all nodes
    if (!worldConfig.nodePopulations) {
      return false;
    }

    return worldConfig.nodes.every(node => {
      const population = worldConfig.nodePopulations[node.id];
      return population && population.length > 0;
    });
  }
}

// Create singleton instance
const editorStateManager = new EditorStateManager();

export default editorStateManager;
export { EditorStateManager };