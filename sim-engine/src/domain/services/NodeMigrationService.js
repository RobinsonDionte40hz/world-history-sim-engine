// src/domain/services/NodeMigrationService.js

import { TerrainTypes } from '../../shared/constants/TerrainTypes.js';
import { ClimateTypes } from '../../shared/constants/ClimateTypes.js';
import { LightingTypes } from '../../shared/constants/LightingTypes.js';
import { ConnectionTypes } from '../../shared/constants/ConnectionTypes.js';

/**
 * NodeMigrationService handles backward compatibility by migrating old node data
 * to the new enhanced environmental format while preserving all existing functionality
 */
class NodeMigrationService {
  /**
   * Migrates an existing node to the new environmental format
   * @param {Object} oldNodeData - Original node data
   * @returns {Object} Migrated node data with environmental properties
   */
  static migrateExistingNode(oldNodeData) {
    if (!oldNodeData || typeof oldNodeData !== 'object') {
      throw new Error('Invalid node data provided for migration');
    }

    // Start with a copy of the original data to preserve all existing properties
    const migratedData = { ...oldNodeData };

    // Preserve interactions as-is (don't modify them at all)
    if (migratedData.interactions && Array.isArray(migratedData.interactions)) {
      migratedData.interactions = [...migratedData.interactions];
    }

    // Preserve customData if it exists
    if (oldNodeData.customData) {
      migratedData.customData = { ...oldNodeData.customData };
    }

    // Add default environmental properties if missing or incomplete
    if (!migratedData.environment || typeof migratedData.environment !== 'object') {
      migratedData.environment = this._createDefaultEnvironment();
    } else {
      // Merge with defaults for any missing environmental properties
      migratedData.environment = this._mergeWithDefaultEnvironment(migratedData.environment);
    }

    // Convert old connectedNodes array to new connections format
    if (migratedData.connectedNodes && Array.isArray(migratedData.connectedNodes) && 
        (!migratedData.connections || migratedData.connections.length === 0)) {
      migratedData.connections = this._convertConnectedNodesToConnections(migratedData.connectedNodes);
    }

    // Ensure connections array exists even if empty
    if (!migratedData.connections || !Array.isArray(migratedData.connections)) {
      migratedData.connections = [];
    }

    // Set default size if missing
    if (!migratedData.size || typeof migratedData.size !== 'number' || migratedData.size <= 0) {
      migratedData.size = this._getDefaultSize(migratedData.type);
    }

    // Ensure population is set
    if (!migratedData.population || typeof migratedData.population !== 'number' || migratedData.population < 0) {
      migratedData.population = 0;
    }

    // Validate that migrated data maintains existing functionality
    this._validateMigratedNode(migratedData, oldNodeData);

    return migratedData;
  }

  /**
   * Migrates an entire world's node data
   * @param {Object} worldData - World data containing nodes
   * @returns {Object} Migrated world data
   */
  static migrateWorld(worldData) {
    if (!worldData || typeof worldData !== 'object') {
      throw new Error('Invalid world data provided for migration');
    }

    const migratedWorldData = { ...worldData };

    // Migrate nodes if they exist
    if (migratedWorldData.nodes && Array.isArray(migratedWorldData.nodes)) {
      migratedWorldData.nodes = migratedWorldData.nodes.map(node => 
        this.migrateExistingNode(node)
      );
    }

    // Migrate any template nodes if they exist
    if (migratedWorldData.templates && migratedWorldData.templates.nodes && 
        Array.isArray(migratedWorldData.templates.nodes)) {
      migratedWorldData.templates.nodes = migratedWorldData.templates.nodes.map(template => ({
        ...template,
        data: this.migrateExistingNode(template.data)
      }));
    }

    return migratedWorldData;
  }

  /**
   * Creates default environmental properties
   * @private
   */
  static _createDefaultEnvironment() {
    return {
      density: 0.5,
      terrain: TerrainTypes.PLAINS,
      climate: ClimateTypes.TEMPERATE,
      lighting: LightingTypes.NORMAL,
      hazards: [],
      shelterQuality: 0.5,
      airQuality: 0.8,
      waterAvailability: 0.7,
      temperature: 15,
      humidity: 0.5,
      windStrength: 0.3
    };
  }

  /**
   * Merges existing environment data with defaults for missing properties
   * @private
   */
  static _mergeWithDefaultEnvironment(existingEnvironment) {
    const defaults = this._createDefaultEnvironment();
    const merged = { ...defaults, ...existingEnvironment };

    // Ensure hazards is an array
    if (!Array.isArray(merged.hazards)) {
      merged.hazards = [];
    }

    // Validate and fix any invalid values
    merged.density = this._validateRange(merged.density, 0, 1, defaults.density);
    merged.shelterQuality = this._validateRange(merged.shelterQuality, 0, 1, defaults.shelterQuality);
    merged.airQuality = this._validateRange(merged.airQuality, 0, 1, defaults.airQuality);
    merged.waterAvailability = this._validateRange(merged.waterAvailability, 0, 1, defaults.waterAvailability);
    merged.humidity = this._validateRange(merged.humidity, 0, 1, defaults.humidity);
    merged.windStrength = this._validateRange(merged.windStrength, 0, 1, defaults.windStrength);
    merged.temperature = this._validateRange(merged.temperature, -50, 60, defaults.temperature);

    // Validate enum values
    if (!Object.values(TerrainTypes).includes(merged.terrain)) {
      merged.terrain = defaults.terrain;
    }
    if (!Object.values(ClimateTypes).includes(merged.climate)) {
      merged.climate = defaults.climate;
    }
    if (!Object.values(LightingTypes).includes(merged.lighting)) {
      merged.lighting = defaults.lighting;
    }

    return merged;
  }

  /**
   * Converts old connectedNodes array to new NodeConnection objects
   * @private
   */
  static _convertConnectedNodesToConnections(connectedNodes) {
    if (!Array.isArray(connectedNodes)) {
      return [];
    }

    return connectedNodes
      .filter(nodeId => nodeId && typeof nodeId === 'string')
      .map(nodeId => ({
        targetNodeId: nodeId,
        type: ConnectionTypes.ROAD,
        difficulty: 1,
        distance: 1,
        bidirectional: true,
        conditions: [],
        modifiers: {}
      }));
  }

  /**
   * Gets default size based on node type
   * @private
   */
  static _getDefaultSize(nodeType) {
    const defaultSizes = {
      'settlement': 150,
      'city': 300,
      'village': 80,
      'town': 200,
      'fortress': 100,
      'dungeon': 50,
      'wilderness': 200,
      'landmark': 75,
      'resource': 100,
      'sacred': 60,
      'ruins': 40
    };

    return defaultSizes[nodeType] || 100;
  }

  /**
   * Validates a numeric value within a range
   * @private
   */
  static _validateRange(value, min, max, defaultValue) {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value) || value < min || value > max) {
      return defaultValue;
    }
    return value;
  }

  /**
   * Validates that the migrated node maintains all existing functionality
   * @private
   */
  static _validateMigratedNode(migratedData, originalData) {
    const errors = [];

    // Ensure all original properties are preserved
    const requiredProperties = ['id', 'name', 'description', 'type'];
    requiredProperties.forEach(prop => {
      if (originalData[prop] !== undefined && migratedData[prop] !== originalData[prop]) {
        errors.push(`Property ${prop} was modified during migration`);
      }
    });

    // Ensure customData is preserved if it existed
    if (originalData.customData !== undefined) {
      if (!migratedData.customData) {
        errors.push('customData was lost during migration');
      }
    }

    // Ensure interactions are preserved if they existed
    if (originalData.interactions && Array.isArray(originalData.interactions)) {
      if (!migratedData.interactions || !Array.isArray(migratedData.interactions)) {
        errors.push('interactions array was lost during migration');
      } else if (migratedData.interactions.length !== originalData.interactions.length) {
        errors.push('interactions count changed during migration');
      }
    }

    // Ensure environmental properties exist
    if (!migratedData.environment || typeof migratedData.environment !== 'object') {
      errors.push('Environmental properties not properly added');
    }

    // Ensure size is valid
    if (!migratedData.size || typeof migratedData.size !== 'number' || migratedData.size <= 0) {
      errors.push('Invalid size property after migration');
    }

    // Ensure connections exist
    if (!Array.isArray(migratedData.connections)) {
      errors.push('Connections array not properly created');
    }

    // If original had connectedNodes and no existing connections, ensure they're preserved in connections
    if (originalData.connectedNodes && Array.isArray(originalData.connectedNodes) && 
        (!originalData.connections || originalData.connections.length === 0)) {
      const originalNodeIds = originalData.connectedNodes.filter(id => id && typeof id === 'string');
      const migratedNodeIds = migratedData.connections.map(conn => conn.targetNodeId);
      
      originalNodeIds.forEach(nodeId => {
        if (!migratedNodeIds.includes(nodeId)) {
          errors.push(`Connected node ${nodeId} was lost during migration`);
        }
      });
    }

    if (errors.length > 0) {
      throw new Error(`Node migration validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Checks if a node needs migration
   * @param {Object} nodeData - Node data to check
   * @returns {boolean} True if migration is needed
   */
  static needsMigration(nodeData) {
    if (!nodeData || typeof nodeData !== 'object') {
      return false;
    }

    // Check if environmental properties are missing or incomplete
    if (!nodeData.environment || typeof nodeData.environment !== 'object') {
      return true;
    }

    // Check if size is missing
    if (!nodeData.size || typeof nodeData.size !== 'number') {
      return true;
    }

    // Check if using old connectedNodes format
    if (nodeData.connectedNodes && Array.isArray(nodeData.connectedNodes) && 
        (!nodeData.connections || nodeData.connections.length === 0)) {
      return true;
    }

    // Check if environmental properties are incomplete
    const requiredEnvProps = ['density', 'terrain', 'climate', 'lighting', 'shelterQuality', 
                             'airQuality', 'waterAvailability', 'temperature', 'humidity', 'windStrength'];
    
    const hasAllEnvProps = requiredEnvProps.every(prop => 
      nodeData.environment[prop] !== undefined && nodeData.environment[prop] !== null
    );

    if (!hasAllEnvProps) {
      return true;
    }

    return false;
  }

  /**
   * Performs a dry run migration to check what would be changed
   * @param {Object} nodeData - Node data to analyze
   * @returns {Object} Analysis of what would be migrated
   */
  static analyzeMigration(nodeData) {
    if (!nodeData || typeof nodeData !== 'object') {
      return { needsMigration: false, changes: [] };
    }

    const changes = [];

    // Check environmental properties
    if (!nodeData.environment || typeof nodeData.environment !== 'object') {
      changes.push('Add complete environmental properties');
    } else {
      const defaults = this._createDefaultEnvironment();
      Object.keys(defaults).forEach(prop => {
        if (nodeData.environment[prop] === undefined || nodeData.environment[prop] === null) {
          changes.push(`Add missing environmental property: ${prop}`);
        }
      });
    }

    // Check size property
    if (!nodeData.size || typeof nodeData.size !== 'number') {
      changes.push('Add default size property');
    }

    // Check connections migration
    if (nodeData.connectedNodes && Array.isArray(nodeData.connectedNodes) && 
        (!nodeData.connections || nodeData.connections.length === 0)) {
      changes.push(`Convert ${nodeData.connectedNodes.length} connected nodes to connection objects`);
    }

    return {
      needsMigration: changes.length > 0,
      changes
    };
  }

  /**
   * Migrates a batch of nodes with progress tracking
   * @param {Array} nodes - Array of node data to migrate
   * @param {Function} progressCallback - Optional progress callback
   * @returns {Array} Array of migrated nodes
   */
  static migrateBatch(nodes, progressCallback = null) {
    if (!Array.isArray(nodes)) {
      throw new Error('Nodes must be an array');
    }

    const migratedNodes = [];
    const total = nodes.length;

    nodes.forEach((node, index) => {
      try {
        const migratedNode = this.migrateExistingNode(node);
        migratedNodes.push(migratedNode);
        
        if (progressCallback && typeof progressCallback === 'function') {
          progressCallback({
            current: index + 1,
            total,
            percentage: Math.round(((index + 1) / total) * 100),
            currentNode: (node && node.name) || (node && node.id) || 'Unknown'
          });
        }
      } catch (error) {
        const nodeId = node && node.id ? node.id : index;
        throw new Error(`Failed to migrate node ${nodeId}: ${error.message}`);
      }
    });

    return migratedNodes;
  }
}

export default NodeMigrationService;