// src/application/services/AssignmentManager.js

import EventEmitter from 'events';

/**
 * AssignmentManager - Manages bidirectional assignments between characters, nodes, and interactions
 * 
 * Ensures data consistency, handles cleanup, and maintains persistent state
 * for all entity relationships in the world simulation.
 */
class AssignmentManager extends EventEmitter {
  constructor() {
    super();
    
    // Bidirectional assignment maps
    this.characterToNode = new Map();        // characterId -> nodeId
    this.nodeToCharacters = new Map();       // nodeId -> Set<characterId>
    this.characterToInteractions = new Map(); // characterId -> Set<interactionId>
    this.interactionToCharacters = new Map(); // interactionId -> Set<characterId>
    
    // Track entity existence for validation
    this.knownCharacters = new Set();
    this.knownNodes = new Set();
    this.knownInteractions = new Set();
    
    // Storage key prefix
    this.storageKeyPrefix = 'worldHistorySimulator_assignments_';
    
    // Initialize from storage if available
    this.loadFromStorage();
  }

  // ==================== REGISTRATION METHODS ====================
  
  /**
   * Register a character in the system
   * @param {string} characterId - Character ID to register
   */
  registerCharacter(characterId) {
    if (!characterId) throw new Error('Character ID is required');
    this.knownCharacters.add(characterId);
    
    // Initialize maps if not present
    if (!this.characterToInteractions.has(characterId)) {
      this.characterToInteractions.set(characterId, new Set());
    }
  }

  /**
   * Register a node in the system
   * @param {string} nodeId - Node ID to register
   */
  registerNode(nodeId) {
    if (!nodeId) throw new Error('Node ID is required');
    this.knownNodes.add(nodeId);
    
    // Initialize map if not present
    if (!this.nodeToCharacters.has(nodeId)) {
      this.nodeToCharacters.set(nodeId, new Set());
    }
  }

  /**
   * Register an interaction in the system
   * @param {string} interactionId - Interaction ID to register
   */
  registerInteraction(interactionId) {
    if (!interactionId) throw new Error('Interaction ID is required');
    this.knownInteractions.add(interactionId);
    
    // Initialize map if not present
    if (!this.interactionToCharacters.has(interactionId)) {
      this.interactionToCharacters.set(interactionId, new Set());
    }
  }

  // ==================== CHARACTER-NODE ASSIGNMENTS ====================

  /**
   * Assign a character to a node
   * @param {string} characterId - Character ID
   * @param {string} nodeId - Node ID
   * @returns {boolean} Success status
   */
  assignCharacterToNode(characterId, nodeId) {
    try {
      // Validate entities exist
      if (!this.knownCharacters.has(characterId)) {
        throw new Error(`Character ${characterId} not registered`);
      }
      if (!this.knownNodes.has(nodeId)) {
        throw new Error(`Node ${nodeId} not registered`);
      }

      // Remove from previous node if assigned
      const previousNodeId = this.characterToNode.get(characterId);
      if (previousNodeId && previousNodeId !== nodeId) {
        this.unassignCharacterFromNode(characterId);
      }

      // Create bidirectional assignment
      this.characterToNode.set(characterId, nodeId);
      
      if (!this.nodeToCharacters.has(nodeId)) {
        this.nodeToCharacters.set(nodeId, new Set());
      }
      this.nodeToCharacters.get(nodeId).add(characterId);

      // Emit event
      this.emit('characterAssignedToNode', { characterId, nodeId, previousNodeId });

      // Persist changes
      this.saveToStorage();

      return true;
    } catch (error) {
      console.error('Error assigning character to node:', error);
      this.emit('assignmentError', { type: 'characterToNode', error: error.message });
      return false;
    }
  }

  /**
   * Unassign a character from their current node
   * @param {string} characterId - Character ID
   * @returns {boolean} Success status
   */
  unassignCharacterFromNode(characterId) {
    try {
      const nodeId = this.characterToNode.get(characterId);
      if (!nodeId) return true; // Already unassigned

      // Remove bidirectional references
      this.characterToNode.delete(characterId);
      
      const nodeCharacters = this.nodeToCharacters.get(nodeId);
      if (nodeCharacters) {
        nodeCharacters.delete(characterId);
        
        // Clean up empty set
        if (nodeCharacters.size === 0) {
          this.nodeToCharacters.delete(nodeId);
        }
      }

      // Emit event
      this.emit('characterUnassignedFromNode', { characterId, nodeId });

      // Persist changes
      this.saveToStorage();

      return true;
    } catch (error) {
      console.error('Error unassigning character from node:', error);
      this.emit('assignmentError', { type: 'unassignCharacterFromNode', error: error.message });
      return false;
    }
  }

  /**
   * Get all characters assigned to a node
   * @param {string} nodeId - Node ID
   * @returns {Array<string>} Array of character IDs
   */
  getCharactersByNode(nodeId) {
    const characters = this.nodeToCharacters.get(nodeId);
    return characters ? Array.from(characters) : [];
  }

  /**
   * Get the node assigned to a character
   * @param {string} characterId - Character ID
   * @returns {string|null} Node ID or null
   */
  getNodeByCharacter(characterId) {
    return this.characterToNode.get(characterId) || null;
  }

  // ==================== CHARACTER-INTERACTION ASSIGNMENTS ====================

  /**
   * Assign a character to an interaction
   * @param {string} characterId - Character ID
   * @param {string} interactionId - Interaction ID
   * @returns {boolean} Success status
   */
  assignCharacterToInteraction(characterId, interactionId) {
    try {
      // Validate entities exist
      if (!this.knownCharacters.has(characterId)) {
        throw new Error(`Character ${characterId} not registered`);
      }
      if (!this.knownInteractions.has(interactionId)) {
        throw new Error(`Interaction ${interactionId} not registered`);
      }

      // Create bidirectional assignment
      if (!this.characterToInteractions.has(characterId)) {
        this.characterToInteractions.set(characterId, new Set());
      }
      this.characterToInteractions.get(characterId).add(interactionId);

      if (!this.interactionToCharacters.has(interactionId)) {
        this.interactionToCharacters.set(interactionId, new Set());
      }
      this.interactionToCharacters.get(interactionId).add(characterId);

      // Emit event
      this.emit('characterAssignedToInteraction', { characterId, interactionId });

      // Persist changes
      this.saveToStorage();

      return true;
    } catch (error) {
      console.error('Error assigning character to interaction:', error);
      this.emit('assignmentError', { type: 'characterToInteraction', error: error.message });
      return false;
    }
  }

  /**
   * Unassign a character from an interaction
   * @param {string} characterId - Character ID
   * @param {string} interactionId - Interaction ID
   * @returns {boolean} Success status
   */
  unassignCharacterFromInteraction(characterId, interactionId) {
    try {
      // Remove from character's interactions
      const characterInteractions = this.characterToInteractions.get(characterId);
      if (characterInteractions) {
        characterInteractions.delete(interactionId);
        
        // Clean up empty set
        if (characterInteractions.size === 0) {
          this.characterToInteractions.delete(characterId);
        }
      }

      // Remove from interaction's characters
      const interactionCharacters = this.interactionToCharacters.get(interactionId);
      if (interactionCharacters) {
        interactionCharacters.delete(characterId);
        
        // Clean up empty set
        if (interactionCharacters.size === 0) {
          this.interactionToCharacters.delete(interactionId);
        }
      }

      // Emit event
      this.emit('characterUnassignedFromInteraction', { characterId, interactionId });

      // Persist changes
      this.saveToStorage();

      return true;
    } catch (error) {
      console.error('Error unassigning character from interaction:', error);
      this.emit('assignmentError', { type: 'unassignCharacterFromInteraction', error: error.message });
      return false;
    }
  }

  /**
   * Get all interactions assigned to a character
   * @param {string} characterId - Character ID
   * @returns {Array<string>} Array of interaction IDs
   */
  getInteractionsByCharacter(characterId) {
    const interactions = this.characterToInteractions.get(characterId);
    return interactions ? Array.from(interactions) : [];
  }

  /**
   * Get all characters assigned to an interaction
   * @param {string} interactionId - Interaction ID
   * @returns {Array<string>} Array of character IDs
   */
  getCharactersByInteraction(interactionId) {
    const characters = this.interactionToCharacters.get(interactionId);
    return characters ? Array.from(characters) : [];
  }

  // ==================== CLEANUP METHODS ====================

  /**
   * Remove all assignments for a deleted character
   * @param {string} characterId - Character ID being deleted
   */
  cleanupDeletedCharacter(characterId) {
    console.log(`Cleaning up assignments for deleted character: ${characterId}`);

    // Remove from node assignment
    this.unassignCharacterFromNode(characterId);

    // Remove from all interaction assignments
    const interactions = this.getInteractionsByCharacter(characterId);
    interactions.forEach(interactionId => {
      this.unassignCharacterFromInteraction(characterId, interactionId);
    });

    // Remove from known characters
    this.knownCharacters.delete(characterId);

    // Emit cleanup event
    this.emit('characterCleanedUp', { characterId });

    // Persist changes
    this.saveToStorage();
  }

  /**
   * Remove all assignments for a deleted node
   * @param {string} nodeId - Node ID being deleted
   */
  cleanupDeletedNode(nodeId) {
    console.log(`Cleaning up assignments for deleted node: ${nodeId}`);

    // Get all characters at this node
    const characters = this.getCharactersByNode(nodeId);

    // Unassign each character
    characters.forEach(characterId => {
      this.characterToNode.delete(characterId);
      this.emit('characterUnassignedFromNode', { characterId, nodeId });
    });

    // Remove node mapping
    this.nodeToCharacters.delete(nodeId);

    // Remove from known nodes
    this.knownNodes.delete(nodeId);

    // Emit cleanup event
    this.emit('nodeCleanedUp', { nodeId, affectedCharacters: characters });

    // Persist changes
    this.saveToStorage();
  }

  /**
   * Remove all assignments for a deleted interaction
   * @param {string} interactionId - Interaction ID being deleted
   */
  cleanupDeletedInteraction(interactionId) {
    console.log(`Cleaning up assignments for deleted interaction: ${interactionId}`);

    // Get all characters with this interaction
    const characters = this.getCharactersByInteraction(interactionId);

    // Unassign each character
    characters.forEach(characterId => {
      const characterInteractions = this.characterToInteractions.get(characterId);
      if (characterInteractions) {
        characterInteractions.delete(interactionId);
        
        if (characterInteractions.size === 0) {
          this.characterToInteractions.delete(characterId);
        }
      }
      
      this.emit('characterUnassignedFromInteraction', { characterId, interactionId });
    });

    // Remove interaction mapping
    this.interactionToCharacters.delete(interactionId);

    // Remove from known interactions
    this.knownInteractions.delete(interactionId);

    // Emit cleanup event
    this.emit('interactionCleanedUp', { interactionId, affectedCharacters: characters });

    // Persist changes
    this.saveToStorage();
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Assign multiple characters to a node
   * @param {Array<string>} characterIds - Array of character IDs
   * @param {string} nodeId - Node ID
   * @returns {Object} Results object with successes and failures
   */
  bulkAssignCharactersToNode(characterIds, nodeId) {
    const results = {
      successes: [],
      failures: []
    };

    characterIds.forEach(characterId => {
      const success = this.assignCharacterToNode(characterId, nodeId);
      if (success) {
        results.successes.push(characterId);
      } else {
        results.failures.push(characterId);
      }
    });

    return results;
  }

  /**
   * Assign multiple interactions to a character
   * @param {string} characterId - Character ID
   * @param {Array<string>} interactionIds - Array of interaction IDs
   * @returns {Object} Results object with successes and failures
   */
  bulkAssignInteractionsToCharacter(characterId, interactionIds) {
    const results = {
      successes: [],
      failures: []
    };

    interactionIds.forEach(interactionId => {
      const success = this.assignCharacterToInteraction(characterId, interactionId);
      if (success) {
        results.successes.push(interactionId);
      } else {
        results.failures.push(interactionId);
      }
    });

    return results;
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate all current assignments for consistency
   * @returns {Object} Validation results
   */
  validateAssignments() {
    const issues = [];

    // Check character-node bidirectional consistency
    this.characterToNode.forEach((nodeId, characterId) => {
      const nodeCharacters = this.nodeToCharacters.get(nodeId);
      if (!nodeCharacters || !nodeCharacters.has(characterId)) {
        issues.push({
          type: 'inconsistency',
          entity: 'character-node',
          message: `Character ${characterId} points to node ${nodeId}, but node doesn't reference character`
        });
      }
    });

    // Check node-character bidirectional consistency
    this.nodeToCharacters.forEach((characters, nodeId) => {
      characters.forEach(characterId => {
        const assignedNode = this.characterToNode.get(characterId);
        if (assignedNode !== nodeId) {
          issues.push({
            type: 'inconsistency',
            entity: 'node-character',
            message: `Node ${nodeId} references character ${characterId}, but character points to different node`
          });
        }
      });
    });

    // Check character-interaction bidirectional consistency
    this.characterToInteractions.forEach((interactions, characterId) => {
      interactions.forEach(interactionId => {
        const interactionCharacters = this.interactionToCharacters.get(interactionId);
        if (!interactionCharacters || !interactionCharacters.has(characterId)) {
          issues.push({
            type: 'inconsistency',
            entity: 'character-interaction',
            message: `Character ${characterId} references interaction ${interactionId}, but interaction doesn't reference character`
          });
        }
      });
    });

    // Check for orphaned references
    this.characterToNode.forEach((nodeId, characterId) => {
      if (!this.knownCharacters.has(characterId)) {
        issues.push({
          type: 'orphan',
          entity: 'character',
          message: `Assignment exists for unknown character ${characterId}`
        });
      }
      if (!this.knownNodes.has(nodeId)) {
        issues.push({
          type: 'orphan',
          entity: 'node',
          message: `Character ${characterId} assigned to unknown node ${nodeId}`
        });
      }
    });

    return {
      valid: issues.length === 0,
      issues,
      stats: this.getStatistics()
    };
  }

  /**
   * Repair inconsistent assignments
   */
  repairAssignments() {
    const validation = this.validateAssignments();
    let repaired = 0;

    validation.issues.forEach(issue => {
      if (issue.type === 'orphan') {
        // Remove orphaned assignments
        if (issue.entity === 'character') {
          const match = issue.message.match(/character (\S+)/);
          if (match) {
            const characterId = match[1];
            this.cleanupDeletedCharacter(characterId);
            repaired++;
          }
        }
      }
    });

    console.log(`Repaired ${repaired} assignment issues`);
    return repaired;
  }

  // ==================== PERSISTENCE METHODS ====================

  /**
   * Save all assignments to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        characterToNode: Array.from(this.characterToNode.entries()),
        nodeToCharacters: Array.from(this.nodeToCharacters.entries()).map(([k, v]) => [k, Array.from(v)]),
        characterToInteractions: Array.from(this.characterToInteractions.entries()).map(([k, v]) => [k, Array.from(v)]),
        interactionToCharacters: Array.from(this.interactionToCharacters.entries()).map(([k, v]) => [k, Array.from(v)]),
        knownCharacters: Array.from(this.knownCharacters),
        knownNodes: Array.from(this.knownNodes),
        knownInteractions: Array.from(this.knownInteractions),
        version: '1.0.0',
        lastSaved: new Date().toISOString()
      };

      localStorage.setItem(this.storageKeyPrefix + 'data', JSON.stringify(data));
      
      this.emit('assignmentsSaved', { timestamp: data.lastSaved });
    } catch (error) {
      console.error('Error saving assignments to storage:', error);
      this.emit('saveError', error);
    }
  }

  /**
   * Load all assignments from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKeyPrefix + 'data');
      if (!stored) return;

      const data = JSON.parse(stored);

      // Restore maps
      this.characterToNode = new Map(data.characterToNode || []);
      this.nodeToCharacters = new Map((data.nodeToCharacters || []).map(([k, v]) => [k, new Set(v)]));
      this.characterToInteractions = new Map((data.characterToInteractions || []).map(([k, v]) => [k, new Set(v)]));
      this.interactionToCharacters = new Map((data.interactionToCharacters || []).map(([k, v]) => [k, new Set(v)]));
      
      // Restore known entities
      this.knownCharacters = new Set(data.knownCharacters || []);
      this.knownNodes = new Set(data.knownNodes || []);
      this.knownInteractions = new Set(data.knownInteractions || []);

      console.log(`Loaded assignments from storage (saved: ${data.lastSaved})`);
      this.emit('assignmentsLoaded', { timestamp: data.lastSaved });
    } catch (error) {
      console.error('Error loading assignments from storage:', error);
      this.emit('loadError', error);
    }
  }

  /**
   * Clear all assignments from storage
   */
  clearStorage() {
    localStorage.removeItem(this.storageKeyPrefix + 'data');
    this.emit('storageCleared');
  }

  // ==================== QUERY METHODS ====================

  /**
   * Get complete assignment data for a character
   * @param {string} characterId - Character ID
   * @returns {Object} Assignment data
   */
  getCharacterAssignments(characterId) {
    return {
      characterId,
      node: this.getNodeByCharacter(characterId),
      interactions: this.getInteractionsByCharacter(characterId),
      exists: this.knownCharacters.has(characterId)
    };
  }

  /**
   * Get statistics about current assignments
   * @returns {Object} Statistics object
   */
  getStatistics() {
    // Count characters that actually have interactions (non-empty sets)
    const charactersWithInteractions = Array.from(this.characterToInteractions.values())
      .filter(interactionSet => interactionSet.size > 0).length;

    return {
      totalCharacters: this.knownCharacters.size,
      totalNodes: this.knownNodes.size,
      totalInteractions: this.knownInteractions.size,
      charactersWithNodes: this.characterToNode.size,
      charactersWithInteractions: charactersWithInteractions,
      nodesWithCharacters: this.nodeToCharacters.size,
      interactionsWithCharacters: this.interactionToCharacters.size,
      averageCharactersPerNode: this.nodeToCharacters.size > 0 
        ? Array.from(this.nodeToCharacters.values()).reduce((sum, set) => sum + set.size, 0) / this.nodeToCharacters.size
        : 0,
      averageInteractionsPerCharacter: charactersWithInteractions > 0
        ? Array.from(this.characterToInteractions.values()).reduce((sum, set) => sum + set.size, 0) / charactersWithInteractions
        : 0
    };
  }

  /**
   * Export all assignment data
   * @returns {Object} Complete assignment data
   */
  exportAssignments() {
    return {
      characterToNode: Object.fromEntries(this.characterToNode),
      nodeToCharacters: Object.fromEntries(
        Array.from(this.nodeToCharacters.entries()).map(([k, v]) => [k, Array.from(v)])
      ),
      characterToInteractions: Object.fromEntries(
        Array.from(this.characterToInteractions.entries()).map(([k, v]) => [k, Array.from(v)])
      ),
      interactionToCharacters: Object.fromEntries(
        Array.from(this.interactionToCharacters.entries()).map(([k, v]) => [k, Array.from(v)])
      ),
      statistics: this.getStatistics(),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import assignment data
   * @param {Object} data - Assignment data to import
   */
  importAssignments(data) {
    try {
      // Clear existing data
      this.characterToNode.clear();
      this.nodeToCharacters.clear();
      this.characterToInteractions.clear();
      this.interactionToCharacters.clear();

      // Import new data
      if (data.characterToNode) {
        this.characterToNode = new Map(Object.entries(data.characterToNode));
      }
      if (data.nodeToCharacters) {
        this.nodeToCharacters = new Map(
          Object.entries(data.nodeToCharacters).map(([k, v]) => [k, new Set(v)])
        );
      }
      if (data.characterToInteractions) {
        this.characterToInteractions = new Map(
          Object.entries(data.characterToInteractions).map(([k, v]) => [k, new Set(v)])
        );
      }
      if (data.interactionToCharacters) {
        this.interactionToCharacters = new Map(
          Object.entries(data.interactionToCharacters).map(([k, v]) => [k, new Set(v)])
        );
      }

      // Update known entities
      this.knownCharacters = new Set([
        ...this.characterToNode.keys(),
        ...this.characterToInteractions.keys()
      ]);
      this.knownNodes = new Set(this.nodeToCharacters.keys());
      this.knownInteractions = new Set(this.interactionToCharacters.keys());

      // Save to storage
      this.saveToStorage();

      this.emit('assignmentsImported', { timestamp: new Date().toISOString() });
      return true;
    } catch (error) {
      console.error('Error importing assignments:', error);
      this.emit('importError', error);
      return false;
    }
  }

  // ==================== ENHANCED ASSIGNMENT METHODS ====================

  /**
   * Update character assignments (both nodes and interactions)
   * @param {string} characterId - Character ID
   * @param {Object} assignments - New assignments
   * @param {string|null} assignments.nodeId - Node ID to assign to (null to unassign)
   * @param {Array<string>} assignments.interactionIds - Array of interaction IDs
   * @returns {boolean} Success status
   */
  updateCharacterAssignments(characterId, assignments) {
    try {
      if (!this.knownCharacters.has(characterId)) {
        throw new Error(`Character ${characterId} not registered`);
      }

      // Handle node assignment
      if (assignments.nodeId !== undefined) {
        if (assignments.nodeId === null) {
          this.unassignCharacterFromNode(characterId);
        } else {
          this.assignCharacterToNode(characterId, assignments.nodeId);
        }
      }

      // Handle interaction assignments
      if (assignments.interactionIds !== undefined) {
        // Remove all current interaction assignments
        const currentInteractions = this.getInteractionsByCharacter(characterId);
        currentInteractions.forEach(interactionId => {
          this.unassignCharacterFromInteraction(characterId, interactionId);
        });

        // Add new interaction assignments
        if (Array.isArray(assignments.interactionIds)) {
          assignments.interactionIds.forEach(interactionId => {
            this.assignCharacterToInteraction(characterId, interactionId);
          });
        }
      }

      this.emit('characterAssignmentsUpdated', { characterId, assignments });
      return true;
    } catch (error) {
      console.error('Error updating character assignments:', error);
      this.emit('assignmentError', { type: 'updateCharacterAssignments', error: error.message });
      return false;
    }
  }

  /**
   * Get comprehensive assignment information for a character
   * @param {string} characterId - Character ID
   * @returns {Object} Complete assignment information
   */
  getCharacterAssignmentDetails(characterId) {
    return {
      characterId,
      exists: this.knownCharacters.has(characterId),
      nodeAssignment: {
        nodeId: this.getNodeByCharacter(characterId),
        hasAssignment: this.characterToNode.has(characterId)
      },
      interactionAssignments: {
        interactionIds: this.getInteractionsByCharacter(characterId),
        count: this.getInteractionsByCharacter(characterId).length
      },
      summary: {
        hasNodeAssignment: this.characterToNode.has(characterId),
        hasInteractionAssignments: this.getInteractionsByCharacter(characterId).length > 0,
        totalAssignments: (this.characterToNode.has(characterId) ? 1 : 0) + this.getInteractionsByCharacter(characterId).length
      }
    };
  }

  /**
   * Validate that all assignments are consistent with current entities
   * @param {Object} worldState - Current world state to validate against
   * @returns {Object} Validation results with detailed information
   */
  validateAssignmentsAgainstWorld(worldState) {
    const issues = [];
    const stats = {
      charactersChecked: 0,
      nodesChecked: 0,
      interactionsChecked: 0,
      orphanedCharacters: 0,
      orphanedNodes: 0,
      orphanedInteractions: 0
    };

    // Get current entity IDs from world state
    const worldCharacterIds = new Set((worldState.characters || []).map(c => c.id));
    const worldNodeIds = new Set((worldState.nodes || []).map(n => n.id));
    const worldInteractionIds = new Set((worldState.interactions || []).map(i => i.id));

    // Check character assignments against world state
    this.characterToNode.forEach((nodeId, characterId) => {
      stats.charactersChecked++;
      
      if (!worldCharacterIds.has(characterId)) {
        issues.push({
          type: 'orphaned_character',
          entity: 'character',
          id: characterId,
          message: `Character ${characterId} has assignments but doesn't exist in world state`
        });
        stats.orphanedCharacters++;
      }
      
      if (!worldNodeIds.has(nodeId)) {
        issues.push({
          type: 'orphaned_node',
          entity: 'node',
          id: nodeId,
          message: `Character ${characterId} assigned to non-existent node ${nodeId}`
        });
        stats.orphanedNodes++;
      }
    });

    // Check interaction assignments
    this.characterToInteractions.forEach((interactionIds, characterId) => {
      if (!worldCharacterIds.has(characterId)) {
        issues.push({
          type: 'orphaned_character',
          entity: 'character',
          id: characterId,
          message: `Character ${characterId} has interaction assignments but doesn't exist in world state`
        });
        stats.orphanedCharacters++;
      }

      interactionIds.forEach(interactionId => {
        stats.interactionsChecked++;
        if (!worldInteractionIds.has(interactionId)) {
          issues.push({
            type: 'orphaned_interaction',
            entity: 'interaction',
            id: interactionId,
            message: `Character ${characterId} assigned to non-existent interaction ${interactionId}`
          });
          stats.orphanedInteractions++;
        }
      });
    });

    return {
      valid: issues.length === 0,
      issues,
      stats,
      summary: {
        totalIssues: issues.length,
        hasOrphanedEntities: stats.orphanedCharacters > 0 || stats.orphanedNodes > 0 || stats.orphanedInteractions > 0
      }
    };
  }

  /**
   * Synchronize assignments with world state (cleanup orphaned references)
   * @param {Object} worldState - Current world state
   * @returns {Object} Synchronization results
   */
  synchronizeWithWorldState(worldState) {
    const validation = this.validateAssignmentsAgainstWorld(worldState);
    const cleanupResults = {
      charactersRemoved: 0,
      nodesRemoved: 0,
      interactionsRemoved: 0,
      assignmentsFixed: 0
    };

    if (!validation.valid) {
      // Group issues by type for efficient cleanup
      const orphanedCharacters = new Set();
      const orphanedNodes = new Set();
      const orphanedInteractions = new Set();

      validation.issues.forEach(issue => {
        switch (issue.type) {
          case 'orphaned_character':
            orphanedCharacters.add(issue.id);
            break;
          case 'orphaned_node':
            orphanedNodes.add(issue.id);
            break;
          case 'orphaned_interaction':
            orphanedInteractions.add(issue.id);
            break;
        }
      });

      // Clean up orphaned characters
      orphanedCharacters.forEach(characterId => {
        this.cleanupDeletedCharacter(characterId);
        cleanupResults.charactersRemoved++;
      });

      // Clean up orphaned nodes
      orphanedNodes.forEach(nodeId => {
        this.cleanupDeletedNode(nodeId);
        cleanupResults.nodesRemoved++;
      });

      // Clean up orphaned interactions
      orphanedInteractions.forEach(interactionId => {
        this.cleanupDeletedInteraction(interactionId);
        cleanupResults.interactionsRemoved++;
      });

      cleanupResults.assignmentsFixed = validation.issues.length;
    }

    // Update known entities to match world state
    const worldCharacterIds = new Set((worldState.characters || []).map(c => c.id));
    const worldNodeIds = new Set((worldState.nodes || []).map(n => n.id));
    const worldInteractionIds = new Set((worldState.interactions || []).map(i => i.id));

    this.knownCharacters = worldCharacterIds;
    this.knownNodes = worldNodeIds;
    this.knownInteractions = worldInteractionIds;

    // Save updated state
    this.saveToStorage();

    this.emit('synchronizedWithWorldState', { cleanupResults, worldState });

    return {
      success: true,
      cleanupResults,
      finalValidation: this.validateAssignments()
    };
  }

  // ==================== RESET METHODS ====================

  /**
   * Clear all assignments (use with caution)
   */
  clearAllAssignments() {
    this.characterToNode.clear();
    this.nodeToCharacters.clear();
    this.characterToInteractions.clear();
    this.interactionToCharacters.clear();
    this.knownCharacters.clear();
    this.knownNodes.clear();
    this.knownInteractions.clear();

    this.clearStorage();
    this.emit('assignmentsCleared');
  }
}

// Create singleton instance
const assignmentManager = new AssignmentManager();

export default assignmentManager;
export { AssignmentManager };