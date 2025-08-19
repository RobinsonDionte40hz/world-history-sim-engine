/**
 * WorldState - Core world state management entity
 * Manages world configuration, validation, and conversion to simulation format
 * Integrates with WorldValidator and TemplateManager for comprehensive world management
 */

import WorldValidator from '../services/WorldValidator.js';

class WorldState {
  constructor(config = {}) {
    this.id = config.id || this._generateId();
    this.name = config.name || 'Untitled World';
    this.description = config.description || '';
    
    // Core world configuration
    this.dimensions = config.dimensions || null;
    this.rules = config.rules || null;
    this.initialConditions = config.initialConditions || null;
    
    // World content
    this.nodes = config.nodes || [];
    this.characters = config.characters || [];
    this.interactions = config.interactions || [];
    this.events = config.events || [];
    this.groups = config.groups || [];
    this.items = config.items || [];
    
    // Character assignment tracking
    this.characterNodeAssignments = new Map(config.characterNodeAssignments || []);
    this.characterInteractionAssignments = new Map(config.characterInteractionAssignments || []);
    this.nodeCharacterAssignments = new Map(config.nodeCharacterAssignments || []);
    this.interactionCharacterAssignments = new Map(config.interactionCharacterAssignments || []);
    
    // State tracking
    this.isValid = false;
    this.validationResult = null;
    this.completeness = 0;
    
    // Metadata
    this.createdAt = config.createdAt || new Date();
    this.modifiedAt = config.modifiedAt || new Date();
    this.version = config.version || '1.0.0';
    this.metadata = config.metadata || {};
    
    // Template integration
    this.templateId = config.templateId || null;
    this.isTemplateInstance = config.isTemplateInstance || false;
    
    // Initialize assignment tracking from character data if not provided
    this._initializeAssignmentTracking();
    
    // Perform initial validation
    this.validate();
  }

  /**
   * Validates the current world state using WorldValidator
   * Updates isValid, validationResult, and completeness properties
   * @returns {Object} Validation result
   */
  validate() {
    try {
      this.validationResult = WorldValidator.validate(this._getValidationConfig());
      this.isValid = this.validationResult.isValid;
      this.completeness = this.validationResult.completeness;
      this.modifiedAt = new Date();
      
      return this.validationResult;
    } catch (error) {
      console.error('WorldState.validate: Error during validation:', error);
      this.validationResult = {
        isValid: false,
        errors: [`Validation error: ${error.message}`],
        warnings: [],
        completeness: 0,
        details: {}
      };
      this.isValid = false;
      this.completeness = 0;
      return this.validationResult;
    }
  }

  /**
   * @deprecated This method has been removed to enforce proper simulation pipeline.
   * Use WorldBuilder.prepareForSimulation() followed by SimulationContext.acceptPreparedWorld() instead.
   * @throws {Error} Always throws an error directing to proper pipeline
   */
  toSimulationConfig() {
    throw new Error(
      'Direct world-to-simulation conversion is no longer supported. ' +
      'Please use WorldBuilder.prepareForSimulation() to prepare your world data, ' +
      'then pass it to SimulationContext.acceptPreparedWorld() for simulation initialization.'
    );
  }

  /**
   * Updates world dimensions
   * @param {Object} dimensions - New dimensions configuration
   * @returns {WorldState} This instance for chaining
   */
  updateDimensions(dimensions) {
    if (!dimensions || typeof dimensions !== 'object') {
      throw new Error('Dimensions must be an object');
    }
    
    this.dimensions = { ...dimensions };
    this.modifiedAt = new Date();
    this.validate();
    return this;
  }

  /**
   * Updates world rules
   * @param {Object} rules - New rules configuration
   * @returns {WorldState} This instance for chaining
   */
  updateRules(rules) {
    if (!rules || typeof rules !== 'object') {
      throw new Error('Rules must be an object');
    }
    
    this.rules = { ...rules };
    this.modifiedAt = new Date();
    this.validate();
    return this;
  }

  /**
   * Updates initial conditions
   * @param {Object} initialConditions - New initial conditions
   * @returns {WorldState} This instance for chaining
   */
  updateInitialConditions(initialConditions) {
    if (!initialConditions || typeof initialConditions !== 'object') {
      throw new Error('Initial conditions must be an object');
    }
    
    this.initialConditions = { ...initialConditions };
    this.modifiedAt = new Date();
    this.validate();
    return this;
  }

  /**
   * Adds content to the world
   * @param {string} type - Content type (nodes, characters, interactions, events, groups, items)
   * @param {Object} content - Content to add
   * @returns {WorldState} This instance for chaining
   */
  addContent(type, content) {
    const validTypes = ['nodes', 'characters', 'interactions', 'events', 'groups', 'items'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid content type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }
    
    if (!content || typeof content !== 'object') {
      throw new Error('Content must be an object');
    }
    
    // Ensure content has an ID
    if (!content.id) {
      content.id = this._generateId(type.slice(0, -1)); // Remove 's' from plural
    }
    
    this[type].push(content);
    this.modifiedAt = new Date();
    this.validate();
    return this;
  }

  /**
   * Removes content from the world
   * @param {string} type - Content type
   * @param {string} id - Content ID to remove
   * @returns {boolean} True if content was removed
   */
  removeContent(type, id) {
    const validTypes = ['nodes', 'characters', 'interactions', 'events', 'groups', 'items'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid content type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }
    
    const index = this[type].findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }
    
    this[type].splice(index, 1);
    this.modifiedAt = new Date();
    this.validate();
    return true;
  }

  /**
   * Updates existing content in the world
   * @param {string} type - Content type
   * @param {string} id - Content ID to update
   * @param {Object} updates - Updates to apply
   * @returns {boolean} True if content was updated
   */
  updateContent(type, id, updates) {
    const validTypes = ['nodes', 'characters', 'interactions', 'events', 'groups', 'items'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid content type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }
    
    const index = this[type].findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }
    
    this[type][index] = { ...this[type][index], ...updates };
    this.modifiedAt = new Date();
    this.validate();
    return true;
  }

  /**
   * Gets content by type and optionally by ID
   * @param {string} type - Content type
   * @param {string} [id] - Optional content ID
   * @returns {Array|Object|null} Content array, specific content, or null
   */
  getContent(type, id = null) {
    const validTypes = ['nodes', 'characters', 'interactions', 'events', 'groups', 'items'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid content type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }
    
    if (id) {
      return this[type].find(item => item.id === id) || null;
    }
    
    return [...this[type]]; // Return copy to prevent external modification
  }

  // Character-specific persistence methods

  /**
   * Adds a character to the world with assignment tracking
   * @param {Object} character - Character to add
   * @returns {WorldState} This instance for chaining
   */
  addCharacter(character) {
    if (!character || typeof character !== 'object') {
      throw new Error('Character must be an object');
    }
    
    // Ensure character has an ID
    if (!character.id) {
      character.id = this._generateId('character');
    }
    
    // Check if character already exists
    const existingIndex = this.characters.findIndex(c => c.id === character.id);
    if (existingIndex !== -1) {
      throw new Error(`Character with ID ${character.id} already exists`);
    }
    
    this.characters.push(character);
    
    // Update assignment tracking if character has assignments
    this._updateCharacterAssignments(character);
    
    this.modifiedAt = new Date();
    this.validate();
    return this;
  }

  /**
   * Updates an existing character in the world
   * @param {string} characterId - ID of character to update
   * @param {Object} updates - Updates to apply
   * @returns {boolean} True if character was updated
   */
  updateCharacter(characterId, updates) {
    const characterIndex = this.characters.findIndex(c => c.id === characterId);
    if (characterIndex === -1) {
      return false;
    }
    
    const oldCharacter = this.characters[characterIndex];
    const updatedCharacter = { ...oldCharacter, ...updates, id: characterId };
    
    this.characters[characterIndex] = updatedCharacter;
    
    // Update assignment tracking
    this._removeCharacterFromAssignmentTracking(characterId);
    this._updateCharacterAssignments(updatedCharacter);
    
    this.modifiedAt = new Date();
    this.validate();
    return true;
  }

  /**
   * Removes a character from the world and cleans up assignments
   * @param {string} characterId - ID of character to remove
   * @returns {boolean} True if character was removed
   */
  deleteCharacter(characterId) {
    const characterIndex = this.characters.findIndex(c => c.id === characterId);
    if (characterIndex === -1) {
      return false;
    }
    
    // Remove character from array
    this.characters.splice(characterIndex, 1);
    
    // Clean up assignment tracking
    this._removeCharacterFromAssignmentTracking(characterId);
    
    this.modifiedAt = new Date();
    this.validate();
    return true;
  }

  /**
   * Gets a character by ID
   * @param {string} characterId - Character ID
   * @returns {Object|null} Character or null if not found
   */
  getCharacter(characterId) {
    return this.characters.find(c => c.id === characterId) || null;
  }

  /**
   * Gets all characters in the world
   * @returns {Array} Copy of characters array
   */
  getCharacters() {
    return [...this.characters];
  }

  /**
   * Searches characters based on query and filters
   * @param {string} [query] - Search query
   * @param {Object} [filters] - Search filters
   * @returns {Array} Filtered characters
   */
  searchCharacters(query = '', filters = {}) {
    let results = [...this.characters];
    
    // Apply text search if query provided
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      results = results.filter(character => {
        return (
          (character.name && character.name.toLowerCase().includes(searchTerm)) ||
          (character.description && character.description.toLowerCase().includes(searchTerm)) ||
          (character.race && character.race.toLowerCase().includes(searchTerm)) ||
          (character.characterClass && character.characterClass.toLowerCase().includes(searchTerm)) ||
          (character.tags && character.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
      });
    }
    
    // Apply filters
    if (filters.type) {
      results = results.filter(character => character.type === filters.type);
    }
    
    if (filters.race) {
      results = results.filter(character => character.race === filters.race);
    }
    
    if (filters.characterClass) {
      results = results.filter(character => character.characterClass === filters.characterClass);
    }
    
    if (filters.level !== undefined) {
      results = results.filter(character => character.level === filters.level);
    }
    
    if (filters.assignedToNode) {
      results = results.filter(character => 
        this.isCharacterAssignedToNode(character.id, filters.assignedToNode)
      );
    }
    
    if (filters.hasNodeAssignments !== undefined) {
      results = results.filter(character => {
        const hasAssignments = this.getCharacterNodeAssignments(character.id).length > 0;
        return filters.hasNodeAssignments ? hasAssignments : !hasAssignments;
      });
    }
    
    if (filters.assignedToInteraction) {
      results = results.filter(character => 
        this.isCharacterAssignedToInteraction(character.id, filters.assignedToInteraction)
      );
    }
    
    if (filters.hasInteractionAssignments !== undefined) {
      results = results.filter(character => {
        const hasAssignments = this.getCharacterInteractionAssignments(character.id).length > 0;
        return filters.hasInteractionAssignments ? hasAssignments : !hasAssignments;
      });
    }
    
    return results;
  }

  /**
   * Filters characters by multiple criteria
   * @param {Object} criteria - Filter criteria
   * @returns {Array} Filtered characters
   */
  filterCharacters(criteria) {
    return this.searchCharacters('', criteria);
  }

  // Character assignment management methods

  /**
   * Assigns a character to a node
   * @param {string} characterId - Character ID
   * @param {string} nodeId - Node ID
   * @returns {boolean} True if assignment was successful
   */
  assignCharacterToNode(characterId, nodeId) {
    // Validate character and node exist
    if (!this.getCharacter(characterId)) {
      throw new Error(`Character not found: ${characterId}`);
    }
    if (!this.getContent('nodes', nodeId)) {
      throw new Error(`Node not found: ${nodeId}`);
    }
    
    // Add to character -> node mapping
    if (!this.characterNodeAssignments.has(characterId)) {
      this.characterNodeAssignments.set(characterId, new Set());
    }
    this.characterNodeAssignments.get(characterId).add(nodeId);
    
    // Add to node -> character mapping
    if (!this.nodeCharacterAssignments.has(nodeId)) {
      this.nodeCharacterAssignments.set(nodeId, new Set());
    }
    this.nodeCharacterAssignments.get(nodeId).add(characterId);
    
    this.modifiedAt = new Date();
    return true;
  }

  /**
   * Unassigns a character from a node
   * @param {string} characterId - Character ID
   * @param {string} nodeId - Node ID
   * @returns {boolean} True if unassignment was successful
   */
  unassignCharacterFromNode(characterId, nodeId) {
    let changed = false;
    
    // Remove from character -> node mapping
    if (this.characterNodeAssignments.has(characterId)) {
      const nodeSet = this.characterNodeAssignments.get(characterId);
      if (nodeSet.has(nodeId)) {
        nodeSet.delete(nodeId);
        changed = true;
        
        // Clean up empty set
        if (nodeSet.size === 0) {
          this.characterNodeAssignments.delete(characterId);
        }
      }
    }
    
    // Remove from node -> character mapping
    if (this.nodeCharacterAssignments.has(nodeId)) {
      const characterSet = this.nodeCharacterAssignments.get(nodeId);
      if (characterSet.has(characterId)) {
        characterSet.delete(characterId);
        changed = true;
        
        // Clean up empty set
        if (characterSet.size === 0) {
          this.nodeCharacterAssignments.delete(nodeId);
        }
      }
    }
    
    if (changed) {
      this.modifiedAt = new Date();
    }
    
    return changed;
  }

  /**
   * Assigns a character to an interaction
   * @param {string} characterId - Character ID
   * @param {string} interactionId - Interaction ID
   * @returns {boolean} True if assignment was successful
   */
  assignCharacterToInteraction(characterId, interactionId) {
    // Validate character and interaction exist
    if (!this.getCharacter(characterId)) {
      throw new Error(`Character not found: ${characterId}`);
    }
    if (!this.getContent('interactions', interactionId)) {
      throw new Error(`Interaction not found: ${interactionId}`);
    }
    
    // Add to character -> interaction mapping
    if (!this.characterInteractionAssignments.has(characterId)) {
      this.characterInteractionAssignments.set(characterId, new Set());
    }
    this.characterInteractionAssignments.get(characterId).add(interactionId);
    
    // Add to interaction -> character mapping
    if (!this.interactionCharacterAssignments.has(interactionId)) {
      this.interactionCharacterAssignments.set(interactionId, new Set());
    }
    this.interactionCharacterAssignments.get(interactionId).add(characterId);
    
    this.modifiedAt = new Date();
    return true;
  }

  /**
   * Unassigns a character from an interaction
   * @param {string} characterId - Character ID
   * @param {string} interactionId - Interaction ID
   * @returns {boolean} True if unassignment was successful
   */
  unassignCharacterFromInteraction(characterId, interactionId) {
    let changed = false;
    
    // Remove from character -> interaction mapping
    if (this.characterInteractionAssignments.has(characterId)) {
      const interactionSet = this.characterInteractionAssignments.get(characterId);
      if (interactionSet.has(interactionId)) {
        interactionSet.delete(interactionId);
        changed = true;
        
        // Clean up empty set
        if (interactionSet.size === 0) {
          this.characterInteractionAssignments.delete(characterId);
        }
      }
    }
    
    // Remove from interaction -> character mapping
    if (this.interactionCharacterAssignments.has(interactionId)) {
      const characterSet = this.interactionCharacterAssignments.get(interactionId);
      if (characterSet.has(characterId)) {
        characterSet.delete(characterId);
        changed = true;
        
        // Clean up empty set
        if (characterSet.size === 0) {
          this.interactionCharacterAssignments.delete(interactionId);
        }
      }
    }
    
    if (changed) {
      this.modifiedAt = new Date();
    }
    
    return changed;
  }

  /**
   * Gets all node assignments for a character
   * @param {string} characterId - Character ID
   * @returns {Array} Array of node IDs
   */
  getCharacterNodeAssignments(characterId) {
    const nodeSet = this.characterNodeAssignments.get(characterId);
    return nodeSet ? Array.from(nodeSet) : [];
  }

  /**
   * Gets all interaction assignments for a character
   * @param {string} characterId - Character ID
   * @returns {Array} Array of interaction IDs
   */
  getCharacterInteractionAssignments(characterId) {
    const interactionSet = this.characterInteractionAssignments.get(characterId);
    return interactionSet ? Array.from(interactionSet) : [];
  }

  /**
   * Gets all characters assigned to a node
   * @param {string} nodeId - Node ID
   * @returns {Array} Array of character IDs
   */
  getNodeCharacterAssignments(nodeId) {
    const characterSet = this.nodeCharacterAssignments.get(nodeId);
    return characterSet ? Array.from(characterSet) : [];
  }

  /**
   * Gets all characters assigned to an interaction
   * @param {string} interactionId - Interaction ID
   * @returns {Array} Array of character IDs
   */
  getInteractionCharacterAssignments(interactionId) {
    const characterSet = this.interactionCharacterAssignments.get(interactionId);
    return characterSet ? Array.from(characterSet) : [];
  }

  /**
   * Checks if a character is assigned to a specific node
   * @param {string} characterId - Character ID
   * @param {string} nodeId - Node ID
   * @returns {boolean} True if character is assigned to node
   */
  isCharacterAssignedToNode(characterId, nodeId) {
    const nodeSet = this.characterNodeAssignments.get(characterId);
    return nodeSet ? nodeSet.has(nodeId) : false;
  }

  /**
   * Checks if a character is assigned to a specific interaction
   * @param {string} characterId - Character ID
   * @param {string} interactionId - Interaction ID
   * @returns {boolean} True if character is assigned to interaction
   */
  isCharacterAssignedToInteraction(characterId, interactionId) {
    const interactionSet = this.characterInteractionAssignments.get(characterId);
    return interactionSet ? interactionSet.has(interactionId) : false;
  }

  /**
   * Gets characters by node assignment
   * @param {string} nodeId - Node ID
   * @returns {Array} Array of character objects
   */
  getCharactersByNode(nodeId) {
    const characterIds = this.getNodeCharacterAssignments(nodeId);
    return characterIds.map(id => this.getCharacter(id)).filter(char => char !== null);
  }

  /**
   * Gets characters by interaction assignment
   * @param {string} interactionId - Interaction ID
   * @returns {Array} Array of character objects
   */
  getCharactersByInteraction(interactionId) {
    const characterIds = this.getInteractionCharacterAssignments(interactionId);
    return characterIds.map(id => this.getCharacter(id)).filter(char => char !== null);
  }

  // Assignment consistency validation methods

  /**
   * Validates all character assignments for consistency
   * @returns {Object} Validation result with errors and warnings
   */
  validateCharacterAssignments() {
    const errors = [];
    const warnings = [];
    
    // Check character -> node assignments
    for (const [characterId, nodeSet] of this.characterNodeAssignments) {
      // Verify character exists
      if (!this.getCharacter(characterId)) {
        errors.push(`Character assignment references non-existent character: ${characterId}`);
        continue;
      }
      
      // Verify all assigned nodes exist
      for (const nodeId of nodeSet) {
        if (!this.getContent('nodes', nodeId)) {
          errors.push(`Character ${characterId} assigned to non-existent node: ${nodeId}`);
        }
      }
    }
    
    // Check character -> interaction assignments
    for (const [characterId, interactionSet] of this.characterInteractionAssignments) {
      // Verify character exists
      if (!this.getCharacter(characterId)) {
        errors.push(`Character assignment references non-existent character: ${characterId}`);
        continue;
      }
      
      // Verify all assigned interactions exist
      for (const interactionId of interactionSet) {
        if (!this.getContent('interactions', interactionId)) {
          errors.push(`Character ${characterId} assigned to non-existent interaction: ${interactionId}`);
        }
      }
    }
    
    // Check node -> character assignments for consistency
    for (const [nodeId, characterSet] of this.nodeCharacterAssignments) {
      // Verify node exists
      if (!this.getContent('nodes', nodeId)) {
        errors.push(`Node assignment references non-existent node: ${nodeId}`);
        continue;
      }
      
      // Verify bidirectional consistency
      for (const characterId of characterSet) {
        if (!this.isCharacterAssignedToNode(characterId, nodeId)) {
          errors.push(`Inconsistent assignment: Node ${nodeId} references character ${characterId}, but character doesn't reference node`);
        }
      }
    }
    
    // Check interaction -> character assignments for consistency
    for (const [interactionId, characterSet] of this.interactionCharacterAssignments) {
      // Verify interaction exists
      if (!this.getContent('interactions', interactionId)) {
        errors.push(`Interaction assignment references non-existent interaction: ${interactionId}`);
        continue;
      }
      
      // Verify bidirectional consistency
      for (const characterId of characterSet) {
        if (!this.isCharacterAssignedToInteraction(characterId, interactionId)) {
          errors.push(`Inconsistent assignment: Interaction ${interactionId} references character ${characterId}, but character doesn't reference interaction`);
        }
      }
    }
    
    // Check for orphaned characters (no assignments)
    const charactersWithoutAssignments = this.characters.filter(character => {
      const hasNodeAssignments = this.getCharacterNodeAssignments(character.id).length > 0;
      const hasInteractionAssignments = this.getCharacterInteractionAssignments(character.id).length > 0;
      return !hasNodeAssignments && !hasInteractionAssignments;
    });
    
    if (charactersWithoutAssignments.length > 0) {
      warnings.push(`${charactersWithoutAssignments.length} characters have no assignments: ${charactersWithoutAssignments.map(c => c.name || c.id).join(', ')}`);
    }
    
    // Check for nodes without characters
    const nodesWithoutCharacters = this.nodes.filter(node => {
      return this.getNodeCharacterAssignments(node.id).length === 0;
    });
    
    if (nodesWithoutCharacters.length > 0) {
      warnings.push(`${nodesWithoutCharacters.length} nodes have no assigned characters: ${nodesWithoutCharacters.map(n => n.name || n.id).join(', ')}`);
    }
    
    // Check for interactions without characters
    const interactionsWithoutCharacters = this.interactions.filter(interaction => {
      return this.getInteractionCharacterAssignments(interaction.id).length === 0;
    });
    
    if (interactionsWithoutCharacters.length > 0) {
      warnings.push(`${interactionsWithoutCharacters.length} interactions have no assigned characters: ${interactionsWithoutCharacters.map(i => i.name || i.id).join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalCharacters: this.characters.length,
        charactersWithNodeAssignments: this.characterNodeAssignments.size,
        charactersWithInteractionAssignments: this.characterInteractionAssignments.size,
        charactersWithoutAssignments: charactersWithoutAssignments.length,
        nodesWithCharacters: this.nodeCharacterAssignments.size,
        nodesWithoutCharacters: nodesWithoutCharacters.length,
        interactionsWithCharacters: this.interactionCharacterAssignments.size,
        interactionsWithoutCharacters: interactionsWithoutCharacters.length
      }
    };
  }

  /**
   * Repairs inconsistent character assignments
   * @returns {Object} Repair result with actions taken
   */
  repairCharacterAssignments() {
    const repairActions = [];
    
    // Remove assignments to non-existent characters
    for (const [characterId, nodeSet] of [...this.characterNodeAssignments]) {
      if (!this.getCharacter(characterId)) {
        this.characterNodeAssignments.delete(characterId);
        repairActions.push(`Removed node assignments for non-existent character: ${characterId}`);
      }
    }
    
    for (const [characterId, interactionSet] of [...this.characterInteractionAssignments]) {
      if (!this.getCharacter(characterId)) {
        this.characterInteractionAssignments.delete(characterId);
        repairActions.push(`Removed interaction assignments for non-existent character: ${characterId}`);
      }
    }
    
    // Remove assignments to non-existent nodes/interactions
    for (const [characterId, nodeSet] of this.characterNodeAssignments) {
      const validNodes = new Set();
      for (const nodeId of nodeSet) {
        if (this.getContent('nodes', nodeId)) {
          validNodes.add(nodeId);
        } else {
          repairActions.push(`Removed assignment of character ${characterId} to non-existent node: ${nodeId}`);
        }
      }
      this.characterNodeAssignments.set(characterId, validNodes);
    }
    
    for (const [characterId, interactionSet] of this.characterInteractionAssignments) {
      const validInteractions = new Set();
      for (const interactionId of interactionSet) {
        if (this.getContent('interactions', interactionId)) {
          validInteractions.add(interactionId);
        } else {
          repairActions.push(`Removed assignment of character ${characterId} to non-existent interaction: ${interactionId}`);
        }
      }
      this.characterInteractionAssignments.set(characterId, validInteractions);
    }
    
    // Rebuild reverse mappings to ensure consistency
    this._rebuildAssignmentMappings();
    repairActions.push('Rebuilt assignment mappings for consistency');
    
    if (repairActions.length > 0) {
      this.modifiedAt = new Date();
    }
    
    return {
      repaired: repairActions.length > 0,
      actions: repairActions
    };
  }

  /**
   * Gets a summary of the world state including character assignment information
   * @returns {Object} World state summary
   */
  getSummary() {
    const assignmentValidation = this.validateCharacterAssignments();
    
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      isValid: this.isValid,
      completeness: Math.round(this.completeness * 100),
      contentCounts: {
        nodes: this.nodes.length,
        characters: this.characters.length,
        interactions: this.interactions.length,
        events: this.events.length,
        groups: this.groups.length,
        items: this.items.length
      },
      assignmentSummary: assignmentValidation.summary,
      assignmentValidation: {
        isValid: assignmentValidation.isValid,
        errorCount: assignmentValidation.errors.length,
        warningCount: assignmentValidation.warnings.length
      },
      hasDimensions: !!this.dimensions,
      hasRules: !!this.rules,
      hasInitialConditions: !!this.initialConditions,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      version: this.version
    };
  }

  /**
   * Serializes the world state to JSON
   * @returns {Object} Serializable world state
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      dimensions: this.dimensions,
      rules: this.rules,
      initialConditions: this.initialConditions,
      nodes: this.nodes.map(node => this._serializeContent(node)),
      characters: this.characters.map(character => this._serializeContent(character)),
      interactions: this.interactions.map(interaction => this._serializeContent(interaction)),
      events: this.events.map(event => this._serializeContent(event)),
      groups: this.groups.map(group => this._serializeContent(group)),
      items: this.items.map(item => this._serializeContent(item)),
      // Serialize assignment tracking
      characterNodeAssignments: this._serializeMapOfSets(this.characterNodeAssignments),
      characterInteractionAssignments: this._serializeMapOfSets(this.characterInteractionAssignments),
      nodeCharacterAssignments: this._serializeMapOfSets(this.nodeCharacterAssignments),
      interactionCharacterAssignments: this._serializeMapOfSets(this.interactionCharacterAssignments),
      isValid: this.isValid,
      validationResult: this.validationResult,
      completeness: this.completeness,
      createdAt: this.createdAt.toISOString(),
      modifiedAt: this.modifiedAt.toISOString(),
      version: this.version,
      metadata: this.metadata,
      templateId: this.templateId,
      isTemplateInstance: this.isTemplateInstance
    };
  }

  /**
   * Creates a WorldState instance from JSON data
   * @param {Object} data - JSON data
   * @returns {WorldState} New WorldState instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for WorldState');
    }
    
    const config = {
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      modifiedAt: data.modifiedAt ? new Date(data.modifiedAt) : new Date(),
      // Deserialize assignment tracking
      characterNodeAssignments: data.characterNodeAssignments ? 
        WorldState._deserializeMapOfSets(data.characterNodeAssignments) : new Map(),
      characterInteractionAssignments: data.characterInteractionAssignments ? 
        WorldState._deserializeMapOfSets(data.characterInteractionAssignments) : new Map(),
      nodeCharacterAssignments: data.nodeCharacterAssignments ? 
        WorldState._deserializeMapOfSets(data.nodeCharacterAssignments) : new Map(),
      interactionCharacterAssignments: data.interactionCharacterAssignments ? 
        WorldState._deserializeMapOfSets(data.interactionCharacterAssignments) : new Map()
    };
    
    return new WorldState(config);
  }

  /**
   * Creates a deep copy of the world state
   * @returns {WorldState} New WorldState instance
   */
  clone() {
    const jsonData = this.toJSON();
    jsonData.id = this._generateId(); // Generate new ID for clone
    jsonData.name = `${this.name} (Copy)`;
    jsonData.createdAt = new Date().toISOString();
    jsonData.modifiedAt = new Date().toISOString();
    
    return WorldState.fromJSON(jsonData);
  }

  // Template Persistence Features

  /**
   * Converts the world state to a template format
   * @param {string} templateName - Name for the template
   * @param {string} templateDescription - Description for the template
   * @param {Array} [tags] - Optional tags for the template
   * @returns {Object} World template object
   */
  toTemplate(templateName, templateDescription, tags = []) {
    if (!templateName || typeof templateName !== 'string') {
      throw new Error('Template name is required and must be a string');
    }
    
    if (!templateDescription || typeof templateDescription !== 'string') {
      throw new Error('Template description is required and must be a string');
    }

    const template = {
      id: `world_template_${templateName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      name: templateName,
      description: templateDescription,
      type: 'world',
      version: '1.0.0',
      tags: ['world', 'custom', ...tags],
      
      // World configuration data
      worldConfig: {
        dimensions: this.dimensions,
        rules: this.rules,
        initialConditions: this.initialConditions,
        nodes: this.nodes.map(node => this._serializeContent(node)),
        characters: this.characters.map(character => this._serializeContent(character)),
        interactions: this.interactions.map(interaction => this._serializeContent(interaction)),
        events: this.events.map(event => this._serializeContent(event)),
        groups: this.groups.map(group => this._serializeContent(group)),
        items: this.items.map(item => this._serializeContent(item))
      },
      
      // Template metadata
      metadata: {
        originalWorldId: this.id,
        originalWorldName: this.name,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        author: 'User',
        completeness: this.completeness,
        isValid: this.isValid,
        contentCounts: {
          nodes: this.nodes.length,
          characters: this.characters.length,
          interactions: this.interactions.length,
          events: this.events.length,
          groups: this.groups.length,
          items: this.items.length
        }
      },
      
      // Template customization options
      customizationOptions: {
        allowDimensionChanges: true,
        allowRuleModifications: true,
        allowContentAddition: true,
        allowContentRemoval: true,
        preserveRelationships: true
      }
    };

    return template;
  }

  /**
   * Creates a WorldState from a world template
   * @param {Object} template - World template object
   * @param {Object} [customizations] - Optional customizations to apply
   * @returns {WorldState} New WorldState instance
   */
  static fromTemplate(template, customizations = {}) {
    if (!template || typeof template !== 'object') {
      throw new Error('Template must be an object');
    }
    
    if (!template.worldConfig) {
      throw new Error('Template must contain worldConfig');
    }

    // Start with the template's world configuration
    let config = {
      id: customizations.id || this.prototype._generateId(),
      name: customizations.name || template.name || 'Untitled World',
      description: customizations.description || template.description || '',
      templateId: template.id,
      isTemplateInstance: true,
      ...template.worldConfig
    };

    // Apply customizations
    if (customizations.dimensions && template.customizationOptions?.allowDimensionChanges !== false) {
      config.dimensions = { ...config.dimensions, ...customizations.dimensions };
    }

    if (customizations.rules && template.customizationOptions?.allowRuleModifications !== false) {
      config.rules = { ...config.rules, ...customizations.rules };
    }

    if (customizations.initialConditions) {
      config.initialConditions = { ...config.initialConditions, ...customizations.initialConditions };
    }

    // Apply content customizations
    const contentTypes = ['nodes', 'characters', 'interactions', 'events', 'groups', 'items'];
    contentTypes.forEach(type => {
      if (customizations[type]) {
        if (customizations[type].replace && template.customizationOptions?.allowContentRemoval !== false) {
          // Replace all content of this type
          config[type] = customizations[type].replace;
        } else {
          // Add to existing content
          if (customizations[type].add && template.customizationOptions?.allowContentAddition !== false) {
            config[type] = [...(config[type] || []), ...customizations[type].add];
          }
          
          // Remove specific content
          if (customizations[type].remove && template.customizationOptions?.allowContentRemoval !== false) {
            const removeIds = new Set(customizations[type].remove);
            config[type] = (config[type] || []).filter(item => !removeIds.has(item.id));
          }
          
          // Update specific content
          if (customizations[type].update) {
            config[type] = (config[type] || []).map(item => {
              const update = customizations[type].update.find(u => u.id === item.id);
              return update ? { ...item, ...update.changes } : item;
            });
          }
        }
      }
    });

    return new WorldState(config);
  }

  /**
   * Saves the world state as a template using a TemplateManager
   * @param {Object} templateManager - TemplateManager instance
   * @param {string} templateName - Name for the template
   * @param {string} templateDescription - Description for the template
   * @param {Array} [tags] - Optional tags for the template
   * @returns {Object} Created template
   */
  saveAsTemplate(templateManager, templateName, templateDescription, tags = []) {
    if (!templateManager) {
      throw new Error('TemplateManager is required');
    }

    const template = this.toTemplate(templateName, templateDescription, tags);
    
    try {
      templateManager.addTemplate('worlds', template);
      return template;
    } catch (error) {
      throw new Error(`Failed to save world as template: ${error.message}`);
    }
  }

  /**
   * Loads a world from a template using a TemplateManager
   * @param {Object} templateManager - TemplateManager instance
   * @param {string} templateId - Template ID to load
   * @param {Object} [customizations] - Optional customizations to apply
   * @returns {WorldState} New WorldState instance
   */
  static loadFromTemplate(templateManager, templateId, customizations = {}) {
    if (!templateManager) {
      throw new Error('TemplateManager is required');
    }

    const template = templateManager.getTemplate('worlds', templateId);
    if (!template) {
      throw new Error(`World template not found: ${templateId}`);
    }

    return WorldState.fromTemplate(template, customizations);
  }

  /**
   * Creates individual content templates from world content
   * @param {Object} templateManager - TemplateManager instance
   * @param {string} contentType - Type of content to create templates from
   * @param {string} templateNamePrefix - Prefix for template names
   * @param {string} templateDescription - Description for templates
   * @returns {Array} Array of created templates
   */
  createContentTemplates(templateManager, contentType, templateNamePrefix, templateDescription) {
    const validTypes = ['nodes', 'characters', 'interactions', 'events', 'groups', 'items'];
    if (!validTypes.includes(contentType)) {
      throw new Error(`Invalid content type: ${contentType}. Must be one of: ${validTypes.join(', ')}`);
    }

    if (!templateManager) {
      throw new Error('TemplateManager is required');
    }

    const content = this[contentType];
    if (!content || content.length === 0) {
      throw new Error(`No ${contentType} content to create templates from`);
    }

    const templates = content.map((item, index) => {
      const templateId = `${templateNamePrefix}_${contentType}_${index}_${Date.now()}`;
      const serializedContent = this._serializeContent(item);
      
      const template = {
        // Content data first
        ...serializedContent,
        
        // Template properties (only override if not already present in content)
        id: templateId,
        description: `${templateDescription} - ${contentType} template`,
        type: contentType.slice(0, -1), // Remove 's' from plural
        version: '1.0.0',
        tags: [contentType.slice(0, -1), 'custom', 'world-generated'],
        
        // Template metadata
        metadata: {
          sourceWorldId: this.id,
          sourceWorldName: this.name,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          author: 'User'
        }
      };
      
      // Only set template name if content doesn't have a name
      if (!serializedContent.name) {
        template.name = `${templateNamePrefix} ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} ${index + 1}`;
      }

      try {
        templateManager.addTemplate(contentType, template);
        return template;
      } catch (error) {
        console.error(`Failed to create template for ${contentType} item:`, error);
        return null;
      }
    }).filter(template => template !== null);

    return templates;
  }

  /**
   * Serializes the world state for persistent storage
   * @param {boolean} [includeMetadata=true] - Whether to include metadata
   * @returns {Object} Serialized world state
   */
  serialize(includeMetadata = true) {
    const serialized = {
      id: this.id,
      name: this.name,
      description: this.description,
      dimensions: this.dimensions,
      rules: this.rules,
      initialConditions: this.initialConditions,
      nodes: this.nodes.map(node => this._serializeContent(node)),
      characters: this.characters.map(character => this._serializeContent(character)),
      interactions: this.interactions.map(interaction => this._serializeContent(interaction)),
      events: this.events.map(event => this._serializeContent(event)),
      groups: this.groups.map(group => this._serializeContent(group)),
      items: this.items.map(item => this._serializeContent(item)),
      version: this.version,
      templateId: this.templateId,
      isTemplateInstance: this.isTemplateInstance
    };

    if (includeMetadata) {
      serialized.metadata = {
        ...this.metadata,
        isValid: this.isValid,
        completeness: this.completeness,
        validationResult: this.validationResult,
        createdAt: this.createdAt.toISOString(),
        modifiedAt: this.modifiedAt.toISOString()
      };
    }

    return serialized;
  }

  /**
   * Deserializes world state from persistent storage
   * @param {Object} data - Serialized world state data
   * @returns {WorldState} New WorldState instance
   */
  static deserialize(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid serialized data for WorldState');
    }

    const config = {
      ...data,
      createdAt: data.metadata?.createdAt ? new Date(data.metadata.createdAt) : new Date(),
      modifiedAt: data.metadata?.modifiedAt ? new Date(data.metadata.modifiedAt) : new Date(),
      metadata: data.metadata || {}
    };

    // Remove the nested metadata to avoid duplication
    delete config.metadata.createdAt;
    delete config.metadata.modifiedAt;
    delete config.metadata.isValid;
    delete config.metadata.completeness;
    delete config.metadata.validationResult;

    return new WorldState(config);
  }

  /**
   * Exports the world state to a portable format
   * @param {Object} [options] - Export options
   * @returns {Object} Exportable world state
   */
  export(options = {}) {
    const exportData = {
      format: 'WorldState',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      worldState: this.serialize(options.includeMetadata !== false)
    };

    if (options.includeValidation) {
      exportData.validation = this.validationResult;
    }

    if (options.includeTemplateInfo && this.templateId) {
      exportData.templateInfo = {
        templateId: this.templateId,
        isTemplateInstance: this.isTemplateInstance
      };
    }

    return exportData;
  }

  /**
   * Imports a world state from exported data
   * @param {Object} exportData - Exported world state data
   * @returns {WorldState} New WorldState instance
   */
  static import(exportData) {
    if (!exportData || typeof exportData !== 'object') {
      throw new Error('Invalid export data');
    }

    if (exportData.format !== 'WorldState') {
      throw new Error('Invalid export format. Expected WorldState format.');
    }

    if (!exportData.worldState) {
      throw new Error('Export data missing worldState');
    }

    return WorldState.deserialize(exportData.worldState);
  }

  // Private helper methods

  /**
   * Generates a unique ID
   * @param {string} [prefix='world'] - ID prefix
   * @returns {string} Generated ID
   */
  _generateId(prefix = 'world') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Gets configuration object for validation
   * @returns {Object} Configuration for WorldValidator
   */
  _getValidationConfig() {
    return {
      dimensions: this.dimensions,
      rules: this.rules,
      initialConditions: this.initialConditions,
      nodes: this.nodes,
      characters: this.characters,
      interactions: this.interactions,
      events: this.events,
      groups: this.groups,
      items: this.items
    };
  }



  /**
   * Serializes content for JSON storage
   * @param {Object} content - Content to serialize
   * @returns {Object} Serialized content
   */
  _serializeContent(content) {
    if (!content) return null;
    
    // Handle objects with toJSON method
    if (typeof content.toJSON === 'function') {
      return content.toJSON();
    }
    
    // Handle plain objects
    if (typeof content === 'object') {
      const serialized = {};
      for (const [key, value] of Object.entries(content)) {
        if (value instanceof Date) {
          serialized[key] = value.toISOString();
        } else if (typeof value === 'object' && value !== null) {
          serialized[key] = this._serializeContent(value);
        } else {
          serialized[key] = value;
        }
      }
      return serialized;
    }
    
    return content;
  }

  // Character assignment helper methods

  /**
   * Initializes assignment tracking from character data
   * @private
   */
  _initializeAssignmentTracking() {
    // If assignment maps are empty but characters have assignment data, initialize from characters
    if (this.characterNodeAssignments.size === 0 && this.characterInteractionAssignments.size === 0) {
      this.characters.forEach(character => {
        this._updateCharacterAssignments(character);
      });
    }
  }

  /**
   * Updates assignment tracking for a character
   * @param {Object} character - Character object
   * @private
   */
  _updateCharacterAssignments(character) {
    if (!character || !character.id) return;
    
    // Handle node assignments
    const nodeAssignments = this._extractAssignments(character, 'nodes');
    if (nodeAssignments.length > 0) {
      this.characterNodeAssignments.set(character.id, new Set(nodeAssignments));
      
      // Update reverse mapping
      nodeAssignments.forEach(nodeId => {
        if (!this.nodeCharacterAssignments.has(nodeId)) {
          this.nodeCharacterAssignments.set(nodeId, new Set());
        }
        this.nodeCharacterAssignments.get(nodeId).add(character.id);
      });
    }
    
    // Handle interaction assignments
    const interactionAssignments = this._extractAssignments(character, 'interactions');
    if (interactionAssignments.length > 0) {
      this.characterInteractionAssignments.set(character.id, new Set(interactionAssignments));
      
      // Update reverse mapping
      interactionAssignments.forEach(interactionId => {
        if (!this.interactionCharacterAssignments.has(interactionId)) {
          this.interactionCharacterAssignments.set(interactionId, new Set());
        }
        this.interactionCharacterAssignments.get(interactionId).add(character.id);
      });
    }
  }

  /**
   * Extracts assignments from character object
   * @param {Object} character - Character object
   * @param {string} assignmentType - Type of assignment ('nodes' or 'interactions')
   * @returns {Array} Array of assignment IDs
   * @private
   */
  _extractAssignments(character, assignmentType) {
    // Try multiple possible property names for assignments
    const possibleProperties = [
      `assigned${assignmentType.charAt(0).toUpperCase() + assignmentType.slice(1)}`,
      `${assignmentType}Assignments`,
      assignmentType
    ];
    
    for (const prop of possibleProperties) {
      if (character[prop]) {
        if (Array.isArray(character[prop])) {
          return character[prop];
        } else if (character[prop] instanceof Set) {
          return Array.from(character[prop]);
        } else if (typeof character[prop] === 'object' && character[prop][assignmentType]) {
          const assignments = character[prop][assignmentType];
          return Array.isArray(assignments) ? assignments : 
                 assignments instanceof Set ? Array.from(assignments) : [];
        }
      }
    }
    
    // Check for assignments object structure
    if (character.assignments && character.assignments[assignmentType]) {
      const assignments = character.assignments[assignmentType];
      return Array.isArray(assignments) ? assignments : 
             assignments instanceof Set ? Array.from(assignments) : [];
    }
    
    return [];
  }

  /**
   * Removes a character from all assignment tracking
   * @param {string} characterId - Character ID
   * @private
   */
  _removeCharacterFromAssignmentTracking(characterId) {
    // Remove from character -> node mapping and update reverse mapping
    if (this.characterNodeAssignments.has(characterId)) {
      const nodeSet = this.characterNodeAssignments.get(characterId);
      nodeSet.forEach(nodeId => {
        if (this.nodeCharacterAssignments.has(nodeId)) {
          this.nodeCharacterAssignments.get(nodeId).delete(characterId);
          if (this.nodeCharacterAssignments.get(nodeId).size === 0) {
            this.nodeCharacterAssignments.delete(nodeId);
          }
        }
      });
      this.characterNodeAssignments.delete(characterId);
    }
    
    // Remove from character -> interaction mapping and update reverse mapping
    if (this.characterInteractionAssignments.has(characterId)) {
      const interactionSet = this.characterInteractionAssignments.get(characterId);
      interactionSet.forEach(interactionId => {
        if (this.interactionCharacterAssignments.has(interactionId)) {
          this.interactionCharacterAssignments.get(interactionId).delete(characterId);
          if (this.interactionCharacterAssignments.get(interactionId).size === 0) {
            this.interactionCharacterAssignments.delete(interactionId);
          }
        }
      });
      this.characterInteractionAssignments.delete(characterId);
    }
  }

  /**
   * Rebuilds assignment mappings for consistency
   * @private
   */
  _rebuildAssignmentMappings() {
    // Clear reverse mappings
    this.nodeCharacterAssignments.clear();
    this.interactionCharacterAssignments.clear();
    
    // Rebuild from character -> node mappings
    for (const [characterId, nodeSet] of this.characterNodeAssignments) {
      nodeSet.forEach(nodeId => {
        if (!this.nodeCharacterAssignments.has(nodeId)) {
          this.nodeCharacterAssignments.set(nodeId, new Set());
        }
        this.nodeCharacterAssignments.get(nodeId).add(characterId);
      });
    }
    
    // Rebuild from character -> interaction mappings
    for (const [characterId, interactionSet] of this.characterInteractionAssignments) {
      interactionSet.forEach(interactionId => {
        if (!this.interactionCharacterAssignments.has(interactionId)) {
          this.interactionCharacterAssignments.set(interactionId, new Set());
        }
        this.interactionCharacterAssignments.get(interactionId).add(characterId);
      });
    }
  }

  /**
   * Serializes a Map of Sets to a plain object
   * @param {Map} mapOfSets - Map containing Sets as values
   * @returns {Object} Serialized object
   * @private
   */
  _serializeMapOfSets(mapOfSets) {
    const result = {};
    for (const [key, set] of mapOfSets) {
      result[key] = Array.from(set);
    }
    return result;
  }

  /**
   * Deserializes a plain object to a Map of Sets
   * @param {Object} obj - Serialized object
   * @returns {Map} Map containing Sets as values
   * @private
   */
  static _deserializeMapOfSets(obj) {
    const result = new Map();
    for (const [key, array] of Object.entries(obj)) {
      result.set(key, new Set(array));
    }
    return result;
  }
}

export default WorldState;