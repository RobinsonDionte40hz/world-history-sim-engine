/**
 * WorldPersistenceService - Enhanced save/load functionality for worlds and nodes
 * 
 * Provides comprehensive persistence capabilities for world data, nodes, characters,
 * interactions, and encounters with versioning, validation, and error handling.
 * 
 * Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 8.1, 8.2, 8.3, 8.4
 */

import { EventEmitter } from 'events';
import WorldBuilder from '../../domain/services/WorldBuilder';

class WorldPersistenceService extends EventEmitter {
  constructor() {
    super();
    
    this.storageKeys = {
      WORLDS: 'worldHistorySimulator_worlds',
      WORLD_PREFIX: 'worldHistorySimulator_world_',
      NODES_PREFIX: 'worldHistorySimulator_nodes_',
      CHARACTERS_PREFIX: 'worldHistorySimulator_characters_',
      INTERACTIONS_PREFIX: 'worldHistorySimulator_interactions_',
      ENCOUNTERS_PREFIX: 'worldHistorySimulator_encounters_',
      METADATA: 'worldHistorySimulator_metadata'
    };

    this.currentVersion = '1.0.0';
  }

  /**
   * Generate unique ID
   * @returns {string} Unique identifier
   */
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Validate world data structure (compatible with WorldBuilder)
   * @param {Object} worldData - World data to validate
   * @returns {Object} Validation result
   */
  validateWorldData(worldData) {
    const errors = [];
    const warnings = [];

    if (!worldData) {
      errors.push('World data is required');
      return { isValid: false, errors, warnings };
    }

    if (!worldData.name || typeof worldData.name !== 'string') {
      errors.push('World name is required and must be a string');
    }

    if (!worldData.description || typeof worldData.description !== 'string') {
      errors.push('World description is required and must be a string');
    }

    if (!worldData.id) {
      warnings.push('World ID will be auto-generated');
    }

    if (!worldData.lastModified) {
      warnings.push('Last modified timestamp will be set to current time');
    }

    // Validate WorldBuilder-specific structure
    if (worldData.nodes && !Array.isArray(worldData.nodes)) {
      errors.push('Nodes must be an array');
    }

    if (worldData.characters && !Array.isArray(worldData.characters)) {
      errors.push('Characters must be an array');
    }

    if (worldData.interactions && !Array.isArray(worldData.interactions)) {
      errors.push('Interactions must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate node data structure
   * @param {Object} nodeData - Node data to validate
   * @returns {Object} Validation result
   */
  validateNodeData(nodeData) {
    const errors = [];
    const warnings = [];

    if (!nodeData) {
      errors.push('Node data is required');
      return { isValid: false, errors, warnings };
    }

    if (!nodeData.name || typeof nodeData.name !== 'string') {
      errors.push('Node name is required and must be a string');
    }

    if (!nodeData.type || typeof nodeData.type !== 'string') {
      errors.push('Node type is required and must be a string');
    }

    if (!nodeData.id) {
      warnings.push('Node ID will be auto-generated');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Save world data to localStorage (compatible with WorldBuilder)
   * @param {Object} worldData - World data to save (can be WorldBuilder config)
   * @returns {Promise<Object>} Saved world data with generated ID
   */
  async saveWorld(worldData) {
    try {
      // If worldData is a WorldBuilder instance, extract the config
      let dataToSave = worldData;
      if (worldData && typeof worldData.worldConfig === 'object') {
        dataToSave = {
          ...worldData.worldConfig,
          currentStep: worldData.currentStep
        };
      }

      // Validate world data
      const validation = this.validateWorldData(dataToSave);
      if (!validation.isValid) {
        throw new Error(`World validation failed: ${validation.errors.join(', ')}`);
      }

      // Prepare world data for saving
      const worldToSave = {
        ...dataToSave,
        id: dataToSave.id || this.generateId(),
        lastModified: new Date().toISOString(),
        version: this.currentVersion
      };

      // Get existing worlds list
      const existingWorlds = await this.getAllWorlds();
      
      // Update or add world to list
      const worldIndex = existingWorlds.findIndex(w => w.id === worldToSave.id);
      if (worldIndex >= 0) {
        existingWorlds[worldIndex] = {
          id: worldToSave.id,
          name: worldToSave.name,
          description: worldToSave.description,
          lastModified: worldToSave.lastModified,
          version: worldToSave.version
        };
      } else {
        existingWorlds.push({
          id: worldToSave.id,
          name: worldToSave.name,
          description: worldToSave.description,
          lastModified: worldToSave.lastModified,
          version: worldToSave.version
        });
      }

      // Save world list
      localStorage.setItem(this.storageKeys.WORLDS, JSON.stringify(existingWorlds));
      
      // Save full world data
      localStorage.setItem(
        `${this.storageKeys.WORLD_PREFIX}${worldToSave.id}`,
        JSON.stringify(worldToSave)
      );

      this.emit('worldSaved', worldToSave);
      return worldToSave;

    } catch (error) {
      this.emit('saveError', { type: 'world', error: error.message });
      throw error;
    }
  }

  /**
   * Load world data from localStorage
   * @param {string} worldId - ID of world to load
   * @returns {Promise<Object>} World data
   */
  async loadWorld(worldId) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      const worldData = localStorage.getItem(`${this.storageKeys.WORLD_PREFIX}${worldId}`);
      
      if (!worldData) {
        throw new Error(`World with ID ${worldId} not found`);
      }

      const parsedWorld = JSON.parse(worldData);
      
      // Validate loaded data
      const validation = this.validateWorldData(parsedWorld);
      if (!validation.isValid) {
        console.warn('Loaded world data has validation issues:', validation.errors);
      }

      this.emit('worldLoaded', parsedWorld);
      return parsedWorld;

    } catch (error) {
      this.emit('loadError', { type: 'world', worldId, error: error.message });
      throw error;
    }
  }

  /**
   * Get all available worlds
   * @returns {Promise<Array>} Array of world metadata
   */
  async getAllWorlds() {
    try {
      const worldsData = localStorage.getItem(this.storageKeys.WORLDS);
      return worldsData ? JSON.parse(worldsData) : [];
    } catch (error) {
      console.error('Error loading worlds list:', error);
      return [];
    }
  }

  /**
   * Delete world and all associated data
   * @param {string} worldId - ID of world to delete
   * @returns {Promise<void>}
   */
  async deleteWorld(worldId) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      // Remove from worlds list
      const existingWorlds = await this.getAllWorlds();
      const updatedWorlds = existingWorlds.filter(w => w.id !== worldId);
      localStorage.setItem(this.storageKeys.WORLDS, JSON.stringify(updatedWorlds));

      // Remove world data
      localStorage.removeItem(`${this.storageKeys.WORLD_PREFIX}${worldId}`);
      
      // Remove associated data
      localStorage.removeItem(`${this.storageKeys.NODES_PREFIX}${worldId}`);
      localStorage.removeItem(`${this.storageKeys.CHARACTERS_PREFIX}${worldId}`);
      localStorage.removeItem(`${this.storageKeys.INTERACTIONS_PREFIX}${worldId}`);
      localStorage.removeItem(`${this.storageKeys.ENCOUNTERS_PREFIX}${worldId}`);

      this.emit('worldDeleted', worldId);

    } catch (error) {
      this.emit('deleteError', { type: 'world', worldId, error: error.message });
      throw error;
    }
  }

  /**
   * Save node to world
   * @param {string} worldId - ID of world to save node to
   * @param {Object} nodeData - Node data to save
   * @returns {Promise<Object>} Saved node data
   */
  async saveNode(worldId, nodeData) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      // Validate node data
      const validation = this.validateNodeData(nodeData);
      if (!validation.isValid) {
        throw new Error(`Node validation failed: ${validation.errors.join(', ')}`);
      }

      // Prepare node data for saving
      const nodeToSave = {
        ...nodeData,
        id: nodeData.id || this.generateId(),
        worldId,
        lastModified: new Date().toISOString()
      };

      // Get existing nodes for this world
      const existingNodes = await this.getWorldNodes(worldId);
      
      // Update or add node
      const nodeIndex = existingNodes.findIndex(n => n.id === nodeToSave.id);
      if (nodeIndex >= 0) {
        existingNodes[nodeIndex] = nodeToSave;
      } else {
        existingNodes.push(nodeToSave);
      }

      // Save nodes back to storage
      localStorage.setItem(
        `${this.storageKeys.NODES_PREFIX}${worldId}`,
        JSON.stringify(existingNodes)
      );

      this.emit('nodeSaved', { worldId, node: nodeToSave });
      return nodeToSave;

    } catch (error) {
      this.emit('saveError', { type: 'node', worldId, error: error.message });
      throw error;
    }
  }

  /**
   * Get all nodes for a world
   * @param {string} worldId - ID of world
   * @returns {Promise<Array>} Array of nodes
   */
  async getWorldNodes(worldId) {
    try {
      if (!worldId) {
        throw new Error('World ID is required');
      }

      const nodesData = localStorage.getItem(`${this.storageKeys.NODES_PREFIX}${worldId}`);
      return nodesData ? JSON.parse(nodesData) : [];

    } catch (error) {
      console.error('Error loading nodes:', error);
      return [];
    }
  }

  /**
   * Delete node from world
   * @param {string} worldId - ID of world
   * @param {string} nodeId - ID of node to delete
   * @returns {Promise<void>}
   */
  async deleteNode(worldId, nodeId) {
    try {
      if (!worldId || !nodeId) {
        throw new Error('World ID and Node ID are required');
      }

      const existingNodes = await this.getWorldNodes(worldId);
      const updatedNodes = existingNodes.filter(n => n.id !== nodeId);
      
      localStorage.setItem(
        `${this.storageKeys.NODES_PREFIX}${worldId}`,
        JSON.stringify(updatedNodes)
      );

      this.emit('nodeDeleted', { worldId, nodeId });

    } catch (error) {
      this.emit('deleteError', { type: 'node', worldId, nodeId, error: error.message });
      throw error;
    }
  }

  /**
   * Check if there are unsaved changes
   * @param {string} worldId - ID of world to check
   * @returns {boolean} Whether there are unsaved changes
   */
  hasUnsavedChanges(worldId) {
    // This would be implemented based on comparing current editor state
    // with saved data - for now return false as placeholder
    // TODO: Implement actual unsaved changes detection
    console.log('Checking unsaved changes for world:', worldId);
    return false;
  }

  /**
   * Export world data as JSON
   * @param {string} worldId - ID of world to export
   * @returns {Promise<Object>} Complete world data for export
   */
  async exportWorld(worldId) {
    try {
      const world = await this.loadWorld(worldId);
      const nodes = await this.getWorldNodes(worldId);
      
      return {
        world,
        nodes,
        exportedAt: new Date().toISOString(),
        version: this.currentVersion
      };

    } catch (error) {
      this.emit('exportError', { worldId, error: error.message });
      throw error;
    }
  }

  /**
   * Import world data from JSON
   * @param {Object} worldData - Complete world data to import
   * @returns {Promise<Object>} Imported world data
   */
  async importWorld(worldData) {
    try {
      if (!worldData.world) {
        throw new Error('Invalid import data: missing world data');
      }

      // Generate new ID to avoid conflicts
      const newWorldId = this.generateId();
      const worldToImport = {
        ...worldData.world,
        id: newWorldId,
        lastModified: new Date().toISOString()
      };

      // Save world
      await this.saveWorld(worldToImport);

      // Save nodes if present
      if (worldData.nodes && Array.isArray(worldData.nodes)) {
        for (const node of worldData.nodes) {
          await this.saveNode(newWorldId, {
            ...node,
            id: this.generateId(), // Generate new node ID
            worldId: newWorldId
          });
        }
      }

      this.emit('worldImported', worldToImport);
      return worldToImport;

    } catch (error) {
      this.emit('importError', { error: error.message });
      throw error;
    }
  }

  /**
   * Get storage usage statistics
   * @returns {Object} Storage usage information
   */
  getStorageStats() {
    try {
      let totalSize = 0;
      let worldCount = 0;
      let nodeCount = 0;

      for (let key in localStorage) {
        if (key.startsWith('worldHistorySimulator_')) {
          const value = localStorage.getItem(key);
          totalSize += value ? value.length : 0;
          
          if (key.startsWith(this.storageKeys.WORLD_PREFIX)) {
            worldCount++;
          } else if (key.startsWith(this.storageKeys.NODES_PREFIX)) {
            const nodes = JSON.parse(value || '[]');
            nodeCount += nodes.length;
          }
        }
      }

      return {
        totalSize,
        worldCount,
        nodeCount,
        formattedSize: this.formatBytes(totalSize)
      };

    } catch (error) {
      console.error('Error calculating storage stats:', error);
      return { totalSize: 0, worldCount: 0, nodeCount: 0, formattedSize: '0 B' };
    }
  }

  /**
   * Format bytes to human readable string
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Clear all world data (use with caution)
   * @returns {Promise<void>}
   */
  async clearAllData() {
    try {
      const keysToRemove = [];
      
      for (let key in localStorage) {
        if (key.startsWith('worldHistorySimulator_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      this.emit('allDataCleared');

    } catch (error) {
      this.emit('clearError', { error: error.message });
      throw error;
    }
  }
}

// Create singleton instance
const worldPersistenceService = new WorldPersistenceService();

export default worldPersistenceService;
export { WorldPersistenceService };