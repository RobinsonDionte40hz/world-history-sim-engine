// src/application/services/CharacterService.js

import Character from '../../domain/entities/Character.js';
import { ValidationError } from '../../shared/types/ValueObjectTypes.js';

/**
 * CharacterService - Application service that orchestrates character operations
 * 
 * This service coordinates between WorldBuilder and AssignmentManager to provide
 * high-level character management operations with automatic assignment handling.
 * 
 * Responsibilities:
 * - Character creation with automatic assignment handling
 * - Character update operations with assignment change management
 * - Character deletion with comprehensive cleanup
 * - Character search and filtering
 * - Validation and error handling
 */
class CharacterService {
  constructor(worldBuilder, assignmentManager) {
    if (!worldBuilder) {
      throw new Error('WorldBuilder is required');
    }
    if (!assignmentManager) {
      throw new Error('AssignmentManager is required');
    }

    this.worldBuilder = worldBuilder;
    this.assignmentManager = assignmentManager;
  }

  // ==================== CHARACTER CREATION ====================

  /**
   * Create a new character with automatic assignment handling
   * @param {Object} characterConfig - Character configuration
   * @returns {Promise<Object>} Created character data
   */
  async createCharacter(characterConfig) {
    try {
      // Validate character configuration
      if (!characterConfig || typeof characterConfig !== 'object') {
        throw new ValidationError('characterConfig', characterConfig, 'Character configuration must be an object');
      }

      // Extract assignment data before creating character
      const nodeAssignments = characterConfig.assignedNodes || [];
      const interactionAssignments = characterConfig.assignedInteractions || [];

      // Create character through WorldBuilder
      const character = this.worldBuilder.addCharacter(characterConfig);
      
      // Get the character data - handle both cases where addCharacter returns the character or just creates it
      let characterData;
      if (character && character.id) {
        // WorldBuilder returned the character directly
        characterData = character;
      } else {
        // WorldBuilder created character internally, get the last one
        const allCharacters = this.worldBuilder.getAllCharacters();
        if (allCharacters && allCharacters.length > 0) {
          const lastCharacter = allCharacters[allCharacters.length - 1];
          characterData = this.worldBuilder.getCharacter(lastCharacter.id);
        } else {
          throw new Error('Failed to create character - no characters found after creation');
        }
      }

      // Register character with AssignmentManager
      this.assignmentManager.registerCharacter(characterData.id);

      // Handle node assignments
      if (nodeAssignments.length > 0) {
        await this._assignCharacterToNodes(characterData.id, nodeAssignments);
      }

      // Handle interaction assignments
      if (interactionAssignments.length > 0) {
        await this._assignInteractionsToCharacter(characterData.id, interactionAssignments);
      }

      return {
        success: true,
        character: characterData,
        assignments: {
          nodes: nodeAssignments,
          interactions: interactionAssignments
        }
      };

    } catch (error) {
      console.error('Error creating character:', error);
      throw new ValidationError('characterCreation', characterConfig, `Character creation failed: ${error.message}`);
    }
  }

  /**
   * Create multiple characters with bulk assignment handling
   * @param {Array} charactersConfig - Array of character configurations
   * @returns {Promise<Object>} Bulk creation results
   */
  async createCharacters(charactersConfig) {
    if (!Array.isArray(charactersConfig)) {
      throw new ValidationError('charactersConfig', charactersConfig, 'Characters configuration must be an array');
    }

    const results = {
      successes: [],
      failures: [],
      totalAttempted: charactersConfig.length
    };

    for (let i = 0; i < charactersConfig.length; i++) {
      const characterConfig = charactersConfig[i];
      
      try {
        const result = await this.createCharacter(characterConfig);
        results.successes.push({
          index: i,
          characterId: result.character.id,
          characterName: result.character.name,
          assignments: result.assignments
        });
      } catch (error) {
        results.failures.push({
          index: i,
          characterConfig,
          error: error.message
        });
      }
    }

    return results;
  }

  // ==================== CHARACTER UPDATES ====================

  /**
   * Update an existing character with assignment change management
   * @param {string} characterId - ID of character to update
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated character data
   */
  async updateCharacter(characterId, updates) {
    try {
      // Validate inputs
      if (!characterId || typeof characterId !== 'string') {
        throw new ValidationError('characterId', characterId, 'Character ID must be a non-empty string');
      }

      if (!updates || typeof updates !== 'object') {
        throw new ValidationError('updates', updates, 'Updates must be an object');
      }

      // Check if character exists
      const existingCharacter = this.worldBuilder.getCharacter(characterId);
      if (!existingCharacter) {
        throw new ValidationError('characterId', characterId, 'Character not found');
      }

      // Extract assignment updates
      const nodeAssignments = updates.assignedNodes;
      const interactionAssignments = updates.assignedInteractions;

      // Remove assignment fields from character updates to avoid conflicts
      const characterUpdates = { ...updates };
      delete characterUpdates.assignedNodes;
      delete characterUpdates.assignedInteractions;

      // Update character through WorldBuilder
      this.worldBuilder.updateCharacter(characterId, characterUpdates);
      const updatedCharacter = this.worldBuilder.getCharacter(characterId);

      // Handle assignment changes if specified
      const assignmentChanges = {};

      if (nodeAssignments !== undefined) {
        await this._updateCharacterNodeAssignments(characterId, nodeAssignments);
        assignmentChanges.nodes = nodeAssignments;
      }

      if (interactionAssignments !== undefined) {
        await this._updateCharacterInteractionAssignments(characterId, interactionAssignments);
        assignmentChanges.interactions = interactionAssignments;
      }

      return {
        success: true,
        character: updatedCharacter,
        assignmentChanges
      };

    } catch (error) {
      console.error('Error updating character:', error);
      throw new ValidationError('characterUpdate', updates, `Character update failed: ${error.message}`);
    }
  }

  /**
   * Update multiple characters with bulk assignment handling
   * @param {Array} characterUpdates - Array of {characterId, updates} objects
   * @returns {Promise<Object>} Bulk update results
   */
  async updateCharacters(characterUpdates) {
    if (!Array.isArray(characterUpdates)) {
      throw new ValidationError('characterUpdates', characterUpdates, 'Character updates must be an array');
    }

    const results = {
      successes: [],
      failures: [],
      totalAttempted: characterUpdates.length
    };

    for (let i = 0; i < characterUpdates.length; i++) {
      const { characterId, updates } = characterUpdates[i];
      
      try {
        const result = await this.updateCharacter(characterId, updates);
        results.successes.push({
          index: i,
          characterId,
          assignmentChanges: result.assignmentChanges
        });
      } catch (error) {
        results.failures.push({
          index: i,
          characterId,
          updates,
          error: error.message
        });
      }
    }

    return results;
  }

  // ==================== CHARACTER DELETION ====================

  /**
   * Delete a character with comprehensive cleanup
   * @param {string} characterId - ID of character to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteCharacter(characterId) {
    try {
      // Validate input
      if (!characterId || typeof characterId !== 'string') {
        throw new ValidationError('characterId', characterId, 'Character ID must be a non-empty string');
      }

      // Check if character exists
      const existingCharacter = this.worldBuilder.getCharacter(characterId);
      if (!existingCharacter) {
        throw new ValidationError('characterId', characterId, 'Character not found');
      }

      // Get current assignments before deletion for reporting
      const currentAssignments = this.assignmentManager.getCharacterAssignmentDetails(characterId);

      // Clean up all assignments through AssignmentManager
      this.assignmentManager.cleanupDeletedCharacter(characterId);

      // Delete character through WorldBuilder
      this.worldBuilder.deleteCharacter(characterId);

      return {
        success: true,
        deletedCharacterId: characterId,
        deletedCharacterName: existingCharacter.name,
        cleanedUpAssignments: {
          nodes: currentAssignments.nodeAssignment.nodeId ? [currentAssignments.nodeAssignment.nodeId] : [],
          interactions: currentAssignments.interactionAssignments.interactionIds,
          totalCleaned: currentAssignments.summary.totalAssignments
        }
      };

    } catch (error) {
      console.error('Error deleting character:', error);
      throw new ValidationError('characterDeletion', characterId, `Character deletion failed: ${error.message}`);
    }
  }

  /**
   * Delete multiple characters with bulk cleanup
   * @param {Array} characterIds - Array of character IDs to delete
   * @returns {Promise<Object>} Bulk deletion results
   */
  async deleteCharacters(characterIds) {
    if (!Array.isArray(characterIds)) {
      throw new ValidationError('characterIds', characterIds, 'Character IDs must be an array');
    }

    const results = {
      successes: [],
      failures: [],
      totalAttempted: characterIds.length
    };

    for (let i = 0; i < characterIds.length; i++) {
      const characterId = characterIds[i];
      
      try {
        const result = await this.deleteCharacter(characterId);
        results.successes.push({
          index: i,
          characterId,
          characterName: result.deletedCharacterName,
          cleanedUpAssignments: result.cleanedUpAssignments
        });
      } catch (error) {
        results.failures.push({
          index: i,
          characterId,
          error: error.message
        });
      }
    }

    return results;
  }

  // ==================== CHARACTER RETRIEVAL ====================

  /**
   * Get a character by ID with assignment details
   * @param {string} characterId - Character ID
   * @returns {Object|null} Character data with assignments or null
   */
  getCharacter(characterId) {
    if (!characterId || typeof characterId !== 'string') {
      return null;
    }

    const character = this.worldBuilder.getCharacter(characterId);
    if (!character) {
      return null;
    }

    const assignmentDetails = this.assignmentManager.getCharacterAssignmentDetails(characterId);

    return {
      ...character,
      currentAssignments: {
        nodeId: assignmentDetails.nodeAssignment.nodeId,
        interactionIds: assignmentDetails.interactionAssignments.interactionIds,
        hasNodeAssignment: assignmentDetails.nodeAssignment.hasAssignment,
        hasInteractionAssignments: assignmentDetails.interactionAssignments.count > 0
      }
    };
  }

  /**
   * Get all characters with assignment details
   * @returns {Array} Array of all characters with assignments
   */
  getAllCharacters() {
    const characters = this.worldBuilder.getAllCharacters();
    
    return characters.map(character => {
      const assignmentDetails = this.assignmentManager.getCharacterAssignmentDetails(character.id);
      
      return {
        ...character,
        currentAssignments: {
          nodeId: assignmentDetails.nodeAssignment.nodeId,
          interactionIds: assignmentDetails.interactionAssignments.interactionIds,
          hasNodeAssignment: assignmentDetails.nodeAssignment.hasAssignment,
          hasInteractionAssignments: assignmentDetails.interactionAssignments.count > 0
        }
      };
    });
  }

  // ==================== CHARACTER SEARCH ====================

  /**
   * Search characters with enhanced criteria including assignments
   * @param {Object} searchCriteria - Search criteria
   * @returns {Array} Array of matching characters
   */
  searchCharacters(searchCriteria = {}) {
    // Use WorldBuilder's search as base
    let results = this.worldBuilder.searchCharacters(searchCriteria);

    // Apply assignment-based filters
    if (searchCriteria.hasNodeAssignment !== undefined) {
      results = results.filter(character => {
        const assignmentDetails = this.assignmentManager.getCharacterAssignmentDetails(character.id);
        return assignmentDetails.nodeAssignment.hasAssignment === searchCriteria.hasNodeAssignment;
      });
    }

    if (searchCriteria.hasInteractionAssignments !== undefined) {
      results = results.filter(character => {
        const assignmentDetails = this.assignmentManager.getCharacterAssignmentDetails(character.id);
        const hasInteractions = assignmentDetails.interactionAssignments.count > 0;
        return hasInteractions === searchCriteria.hasInteractionAssignments;
      });
    }

    if (searchCriteria.assignedToSpecificNode) {
      results = results.filter(character => {
        const assignmentDetails = this.assignmentManager.getCharacterAssignmentDetails(character.id);
        return assignmentDetails.nodeAssignment.nodeId === searchCriteria.assignedToSpecificNode;
      });
    }

    if (searchCriteria.hasSpecificInteraction) {
      results = results.filter(character => {
        const assignmentDetails = this.assignmentManager.getCharacterAssignmentDetails(character.id);
        return assignmentDetails.interactionAssignments.interactionIds.includes(searchCriteria.hasSpecificInteraction);
      });
    }

    // Add assignment details to results
    return results.map(character => {
      const assignmentDetails = this.assignmentManager.getCharacterAssignmentDetails(character.id);
      
      return {
        ...character,
        currentAssignments: {
          nodeId: assignmentDetails.nodeAssignment.nodeId,
          interactionIds: assignmentDetails.interactionAssignments.interactionIds,
          hasNodeAssignment: assignmentDetails.nodeAssignment.hasAssignment,
          hasInteractionAssignments: assignmentDetails.interactionAssignments.count > 0
        }
      };
    });
  }

  /**
   * Get characters by node with full details
   * @param {string} nodeId - Node ID
   * @returns {Array} Array of characters assigned to the node
   */
  getCharactersByNode(nodeId) {
    if (!nodeId || typeof nodeId !== 'string') {
      return [];
    }

    const characterIds = this.assignmentManager.getCharactersByNode(nodeId);
    
    return characterIds.map(characterId => {
      const character = this.worldBuilder.getCharacter(characterId);
      if (!character) return null;

      const assignmentDetails = this.assignmentManager.getCharacterAssignmentDetails(characterId);
      
      return {
        ...character,
        currentAssignments: {
          nodeId: assignmentDetails.nodeAssignment.nodeId,
          interactionIds: assignmentDetails.interactionAssignments.interactionIds,
          hasNodeAssignment: assignmentDetails.nodeAssignment.hasAssignment,
          hasInteractionAssignments: assignmentDetails.interactionAssignments.count > 0
        }
      };
    }).filter(Boolean);
  }

  /**
   * Get characters by interaction with full details
   * @param {string} interactionId - Interaction ID
   * @returns {Array} Array of characters assigned to the interaction
   */
  getCharactersByInteraction(interactionId) {
    if (!interactionId || typeof interactionId !== 'string') {
      return [];
    }

    const characterIds = this.assignmentManager.getCharactersByInteraction(interactionId);
    
    return characterIds.map(characterId => {
      const character = this.worldBuilder.getCharacter(characterId);
      if (!character) return null;

      const assignmentDetails = this.assignmentManager.getCharacterAssignmentDetails(characterId);
      
      return {
        ...character,
        currentAssignments: {
          nodeId: assignmentDetails.nodeAssignment.nodeId,
          interactionIds: assignmentDetails.interactionAssignments.interactionIds,
          hasNodeAssignment: assignmentDetails.nodeAssignment.hasAssignment,
          hasInteractionAssignments: assignmentDetails.interactionAssignments.count > 0
        }
      };
    }).filter(Boolean);
  }

  // ==================== ASSIGNMENT MANAGEMENT ====================

  /**
   * Update character's node assignments
   * @param {string} characterId - Character ID
   * @param {string|null} nodeId - Node ID to assign to (null to unassign)
   * @returns {Promise<boolean>} Success status
   */
  async updateCharacterNodeAssignment(characterId, nodeId) {
    try {
      if (nodeId === null) {
        return this.assignmentManager.unassignCharacterFromNode(characterId);
      } else {
        // Ensure node exists
        const node = this.worldBuilder.worldConfig.nodes.find(n => n.id === nodeId);
        if (!node) {
          throw new ValidationError('nodeId', nodeId, 'Node not found');
        }

        // Register node if not already registered
        this.assignmentManager.registerNode(nodeId);
        
        return this.assignmentManager.assignCharacterToNode(characterId, nodeId);
      }
    } catch (error) {
      console.error('Error updating character node assignment:', error);
      throw new ValidationError('nodeAssignment', { characterId, nodeId }, `Node assignment update failed: ${error.message}`);
    }
  }

  /**
   * Update character's interaction assignments
   * @param {string} characterId - Character ID
   * @param {Array} interactionIds - Array of interaction IDs
   * @returns {Promise<boolean>} Success status
   */
  async updateCharacterInteractionAssignments(characterId, interactionIds) {
    try {
      if (!Array.isArray(interactionIds)) {
        throw new ValidationError('interactionIds', interactionIds, 'Interaction IDs must be an array');
      }

      // Validate all interactions exist
      for (const interactionId of interactionIds) {
        const interaction = this.worldBuilder.worldConfig.interactions.find(i => i.id === interactionId);
        if (!interaction) {
          throw new ValidationError('interactionId', interactionId, 'Interaction not found');
        }
        
        // Register interaction if not already registered
        this.assignmentManager.registerInteraction(interactionId);
      }

      // Use AssignmentManager's update method
      return this.assignmentManager.updateCharacterAssignments(characterId, {
        interactionIds
      });
    } catch (error) {
      console.error('Error updating character interaction assignments:', error);
      throw new ValidationError('interactionAssignments', { characterId, interactionIds }, `Interaction assignments update failed: ${error.message}`);
    }
  }

  // ==================== VALIDATION ====================

  /**
   * Validate character data against world constraints
   * @param {Object} characterData - Character data to validate
   * @returns {Object} Validation result
   */
  validateCharacter(characterData) {
    try {
      // Use WorldBuilder's validation
      const worldBuilderValidation = this.worldBuilder.validateCharacter(characterData);

      // Add assignment-specific validation
      const assignmentValidation = this._validateCharacterAssignments(characterData);

      return {
        success: worldBuilderValidation.success && assignmentValidation.success,
        errors: [...worldBuilderValidation.errors, ...assignmentValidation.errors],
        warnings: [...worldBuilderValidation.warnings, ...assignmentValidation.warnings]
      };
    } catch (error) {
      return {
        success: false,
        errors: [{
          field: 'character',
          type: 'validation',
          message: `Character validation failed: ${error.message}`
        }],
        warnings: []
      };
    }
  }

  /**
   * Get character statistics with assignment information
   * @returns {Object} Enhanced character statistics
   */
  getCharacterStatistics() {
    const baseStats = this.worldBuilder.getCharacterStatistics();
    const assignmentStats = this.assignmentManager.getStatistics();

    return {
      ...baseStats,
      assignments: {
        charactersWithNodes: assignmentStats.charactersWithNodes,
        charactersWithInteractions: assignmentStats.charactersWithInteractions,
        averageInteractionsPerCharacter: assignmentStats.averageInteractionsPerCharacter,
        unassignedCharacters: baseStats.total - assignmentStats.charactersWithNodes
      }
    };
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Assign character to multiple nodes
   * @private
   */
  async _assignCharacterToNodes(characterId, nodeIds) {
    for (const nodeId of nodeIds) {
      // Ensure node exists and is registered
      const node = this.worldBuilder.worldConfig.nodes.find(n => n.id === nodeId);
      if (!node) {
        throw new ValidationError('nodeAssignment', nodeId, `Node '${nodeId}' does not exist`);
      }
      this.assignmentManager.registerNode(nodeId);
      this.assignmentManager.assignCharacterToNode(characterId, nodeId);
    }
  }

  /**
   * Assign interactions to character
   * @private
   */
  async _assignInteractionsToCharacter(characterId, interactionIds) {
    for (const interactionId of interactionIds) {
      // Ensure interaction exists and is registered
      const interaction = this.worldBuilder.worldConfig.interactions.find(i => i.id === interactionId);
      if (!interaction) {
        throw new ValidationError('interactionAssignment', interactionId, `Interaction '${interactionId}' does not exist`);
      }
      this.assignmentManager.registerInteraction(interactionId);
      this.assignmentManager.assignCharacterToInteraction(characterId, interactionId);
    }
  }

  /**
   * Update character's node assignments
   * @private
   */
  async _updateCharacterNodeAssignments(characterId, nodeIds) {
    // Handle single node assignment (current system supports one node per character)
    if (Array.isArray(nodeIds)) {
      if (nodeIds.length === 0) {
        this.assignmentManager.unassignCharacterFromNode(characterId);
      } else {
        // Assign to first node (current limitation)
        await this.updateCharacterNodeAssignment(characterId, nodeIds[0]);
      }
    } else if (nodeIds === null) {
      this.assignmentManager.unassignCharacterFromNode(characterId);
    } else {
      await this.updateCharacterNodeAssignment(characterId, nodeIds);
    }
  }

  /**
   * Update character's interaction assignments
   * @private
   */
  async _updateCharacterInteractionAssignments(characterId, interactionIds) {
    await this.updateCharacterInteractionAssignments(characterId, interactionIds);
  }

  /**
   * Validate character assignments
   * @private
   */
  _validateCharacterAssignments(characterData) {
    const errors = [];
    const warnings = [];

    // Validate node assignments
    if (characterData.assignedNodes) {
      for (const nodeId of characterData.assignedNodes) {
        const node = this.worldBuilder.worldConfig.nodes.find(n => n.id === nodeId);
        if (!node) {
          errors.push({
            field: 'assignedNodes',
            type: 'reference',
            message: `Assigned node '${nodeId}' does not exist`
          });
        }
      }
    }

    // Validate interaction assignments
    if (characterData.assignedInteractions) {
      for (const interactionId of characterData.assignedInteractions) {
        const interaction = this.worldBuilder.worldConfig.interactions.find(i => i.id === interactionId);
        if (!interaction) {
          errors.push({
            field: 'assignedInteractions',
            type: 'reference',
            message: `Assigned interaction '${interactionId}' does not exist`
          });
        }
      }
    }

    return {
      success: errors.length === 0,
      errors,
      warnings
    };
  }
}

export default CharacterService;