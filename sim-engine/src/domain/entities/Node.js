// src/domain/entities/Node.js
// Enhanced Node class with environmental properties and connections

import Interaction from './Interaction.js';
import Environment from '../value-objects/Environment.js';
import NodeConnection from '../value-objects/NodeConnection.js';

class Node {
  constructor(config = {}) {
    this.id = config.id || this._generateId();
    this.name = config.name || 'Unnamed Node';
    this.description = config.description || '';
    this.type = config.type || 'location';
    
    // Mapless architecture - no spatial coordinates
    // Position is only used for legacy compatibility, not stored
    
    // Separate content interactions from system interactions
    // System interactions are generated dynamically by InteractionManager
    this.contentInteractions = Array.isArray(config.contentInteractions) ? 
      config.contentInteractions.map(i => i instanceof Interaction ? i : new Interaction(i)) : 
      [];
    
    // Migration support: if old interactions array exists, migrate to contentInteractions
    if (config.interactions && config.interactions.length > 0 && this.contentInteractions.length === 0) {
      this.contentInteractions = config.interactions.map(i => i instanceof Interaction ? i : new Interaction(i));
      console.warn(`Node ${this.id}: Migrated legacy 'interactions' to 'contentInteractions'. Consider updating save files.`);
    }
    
    // Keep legacy interactions array for backward compatibility (read-only)
    this.interactions = this.contentInteractions;
    
    this.resources = Array.isArray(config.resources) ? config.resources : [];
    
    // Enhanced environmental properties using Environment value object
    this.environment = config.environment instanceof Environment ? 
      config.environment : new Environment(config.environment || {});
    
    // Node size for population density calculations (default: 100)
    this.size = config.size || 100;
    
    // Population count
    this.population = config.population || 0;
    
    // Enhanced connection data using NodeConnection objects
    this.connections = Array.isArray(config.connections) ? 
      config.connections.map(conn => conn instanceof NodeConnection ? conn : new NodeConnection(conn)) : 
      [];
    
    // Maintain backward compatibility with connectedNodes
    if (config.connectedNodes && config.connectedNodes.length > 0 && this.connections.length === 0) {
      this.connections = config.connectedNodes.map(nodeId => 
        new NodeConnection({ targetNodeId: nodeId })
      );
    }

    // Preserve custom data if provided
    if (config.customData) {
      this.customData = { ...config.customData };
    }

    // Don't freeze in constructor to allow modifications if needed
  }

  _generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  hasInteraction(interactionId) {
    return this.contentInteractions.some(i => i.id === interactionId);
  }

  hasContentInteraction(interactionId) {
    return this.hasInteraction(interactionId);
  }

  getAvailableInteractions(character) {
    return this.contentInteractions.filter(i => 
      i.meetsRequirements && i.meetsRequirements(character) && 
      i.isAvailable && i.isAvailable(Date.now())
    );
  }

  getContentInteractions() {
    return [...this.contentInteractions];
  }

  addContentInteraction(interaction) {
    if (!(interaction instanceof Interaction)) {
      throw new Error('Interaction must be an Interaction instance');
    }
    
    if (!this.hasInteraction(interaction.id)) {
      this.contentInteractions.push(interaction);
      // Update legacy array for backward compatibility
      this.interactions = this.contentInteractions;
    }
  }

  removeContentInteraction(interactionId) {
    const initialLength = this.contentInteractions.length;
    this.contentInteractions = this.contentInteractions.filter(i => i.id !== interactionId);
    
    if (this.contentInteractions.length < initialLength) {
      // Update legacy array for backward compatibility
      this.interactions = this.contentInteractions;
      return true;
    }
    return false;
  }

  getEnvironmentFactor() {
    return this.environment.density || 0.5;
  }

  /**
   * Calculates environmental danger level for this node
   * This is a placeholder implementation until EnvironmentalCalculationService is available
   * @returns {number} Danger level from 0.0 to 1.0
   */
  getEnvironmentalDanger() {
    let danger = 0;
    
    // Base danger from node type
    const typeDanger = {
      'wilderness': 0.3,
      'dungeon': 0.6,
      'settlement': 0.1,
      'landmark': 0.2,
      'resource': 0.25,
      'sacred': 0.15
    };
    
    danger += typeDanger[this.type] || 0;
    
    // Add hazard danger
    danger += this.environment.hazards.length * 0.1;
    
    // Environmental factors
    if (this.environment.shelterQuality < 0.3) danger += 0.2;
    if (this.environment.airQuality < 0.4) danger += 0.15;
    if (this.environment.waterAvailability < 0.3) danger += 0.25;
    
    // Climate extremes
    if (this.environment.climate === 'arctic') danger += 0.2;
    if (this.environment.climate === 'arid') danger += 0.15;
    
    // Lighting conditions
    if (this.environment.lighting === 'dark') danger += 0.2;
    if (this.environment.lighting === 'dim') danger += 0.1;
    
    return Math.min(1, danger);
  }

  /**
   * Gets environmental modifiers for specific interaction types
   * This is a placeholder implementation until EnvironmentalCalculationService is available
   * @param {string} interactionType - Type of interaction (e.g., 'combat', 'social', 'stealth')
   * @returns {Object} Environmental modifiers
   */
  getEnvironmentalModifiers(interactionType) {
    const modifiers = {};
    
    // Terrain modifiers
    const terrainMods = this._getTerrainModifiers(this.environment.terrain);
    Object.assign(modifiers, terrainMods);
    
    // Climate modifiers
    const climateMods = this._getClimateModifiers(this.environment.climate);
    Object.assign(modifiers, climateMods);
    
    // Lighting modifiers
    const lightingMods = this._getLightingModifiers(this.environment.lighting);
    Object.assign(modifiers, lightingMods);
    
    // Interaction-specific modifiers
    const interactionMods = this._getInteractionModifiers(interactionType);
    Object.assign(modifiers, interactionMods);
    
    return modifiers;
  }

  /**
   * Helper method for terrain modifiers
   * @private
   */
  _getTerrainModifiers(terrain) {
    const terrainModifiers = {
      'plains': { movement: 1.0, visibility: 1.2 },
      'forest': { stealth: 1.3, movement: 0.8, visibility: 0.7 },
      'mountains': { movement: 0.6, defense: 1.4, visibility: 1.5 },
      'desert': { movement: 0.7, survival: 0.6, visibility: 1.3 },
      'swamp': { movement: 0.5, disease_resistance: 0.7, stealth: 1.2 },
      'urban': { social: 1.2, information: 1.4, stealth: 0.8 }
    };
    
    return terrainModifiers[terrain] || {};
  }

  /**
   * Helper method for climate modifiers
   * @private
   */
  _getClimateModifiers(climate) {
    const climateModifiers = {
      'arctic': { 
        constitution_checks: 0.8, 
        survival: 0.7, 
        movement: 0.8 
      },
      'tropical': { 
        disease_resistance: 0.8, 
        plant_knowledge: 1.2 
      },
      'arid': { 
        survival: 0.7, 
        constitution_checks: 0.9, 
        visibility: 1.2 
      },
      'temperate': { 
        // Balanced, no significant modifiers
      }
    };
    
    return climateModifiers[climate] || {};
  }

  /**
   * Helper method for lighting modifiers
   * @private
   */
  _getLightingModifiers(lighting) {
    const lightingModifiers = {
      'bright': { visibility: 1.3, stealth: 0.7 },
      'normal': { /* no modifiers */ },
      'dim': { visibility: 0.8, stealth: 1.2 },
      'dark': { visibility: 0.4, stealth: 1.5, fear_checks: 0.8 },
      'magical': { magic_checks: 1.2, perception: 1.1 }
    };
    
    return lightingModifiers[lighting] || {};
  }

  /**
   * Helper method for interaction-specific modifiers
   * @private
   */
  _getInteractionModifiers(interactionType) {
    const modifiers = {};
    
    if (interactionType === 'combat') {
      if (this.environment.terrain === 'mountains') {
        modifiers.ranged_attacks = 1.2;
      }
      if (this.environment.lighting === 'dark') {
        modifiers.accuracy = 0.7;
      }
    }
    
    if (interactionType === 'social') {
      if (this.type === 'settlement') {
        modifiers.persuasion = 1.1;
      }
      if (this.environment.density > 0.8) {
        modifiers.intimidation = 0.8; // Harder to intimidate in crowds
      }
    }
    
    return modifiers;
  }

  /**
   * Calculates population density
   * @returns {number} Population density (population / size)
   */
  getPopulationDensity() {
    return this.population / this.size;
  }

  /**
   * Determines if the node is overcrowded
   * @param {number} threshold - Overcrowding threshold (default: 0.8)
   * @returns {boolean} True if overcrowded
   */
  isOvercrowded(threshold = 0.8) {
    return this.getPopulationDensity() > threshold;
  }

  /**
   * Calculates population capacity based on environmental factors
   * @returns {number} Maximum sustainable population
   */
  getPopulationCapacity() {
    let baseCapacity = this.size;
    
    // Environmental factors
    baseCapacity *= this.environment.shelterQuality;
    baseCapacity *= this.environment.waterAvailability;
    baseCapacity *= (1 - (this.environment.hazards.length * 0.1));
    
    // Climate adjustments
    const climateMultipliers = {
      'temperate': 1.0,
      'tropical': 0.9,
      'arid': 0.6,
      'arctic': 0.4
    };
    
    baseCapacity *= climateMultipliers[this.environment.climate] || 1.0;
    
    return Math.floor(baseCapacity);
  }

  /**
   * Gets connection to a specific node
   * @param {string} nodeId - Target node ID
   * @returns {NodeConnection|null} Connection object or null if not found
   */
  getConnectionTo(nodeId) {
    return this.connections.find(conn => conn.targetNodeId === nodeId) || null;
  }

  /**
   * Gets all connections of a specific type
   * @param {string} connectionType - Connection type to filter by
   * @returns {Array<NodeConnection>} Array of matching connections
   */
  getConnectionsByType(connectionType) {
    return this.connections.filter(conn => conn.type === connectionType);
  }

  /**
   * Gets all connected node IDs
   * @returns {Array<string>} Array of connected node IDs
   */
  getConnectedNodeIds() {
    return this.connections.map(conn => conn.targetNodeId);
  }

  /**
   * Checks if this node is connected to another node
   * @param {string} nodeId - Node ID to check
   * @returns {boolean} True if connected
   */
  isConnectedTo(nodeId) {
    return this.connections.some(conn => conn.targetNodeId === nodeId);
  }

  /**
   * Adds a new connection to this node
   * @param {NodeConnection} connection - Connection to add
   */
  addConnection(connection) {
    if (!(connection instanceof NodeConnection)) {
      throw new Error('Connection must be a NodeConnection instance');
    }
    
    // Check if connection already exists
    if (!this.isConnectedTo(connection.targetNodeId)) {
      this.connections.push(connection);
    }
  }

  /**
   * Removes a connection to a specific node
   * @param {string} nodeId - Target node ID to disconnect
   * @returns {boolean} True if connection was removed
   */
  removeConnection(nodeId) {
    const initialLength = this.connections.length;
    this.connections = this.connections.filter(conn => conn.targetNodeId !== nodeId);
    return this.connections.length < initialLength;
  }

  toJSON() {
    const json = {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      // No position in mapless architecture
      contentInteractions: this.contentInteractions.map(i => i.toJSON ? i.toJSON() : i),
      // Maintain backward compatibility - include interactions for older save files
      interactions: this.contentInteractions.map(i => i.toJSON ? i.toJSON() : i),
      resources: this.resources,
      environment: this.environment.toJSON ? this.environment.toJSON() : this.environment,
      size: this.size,
      population: this.population,
      connections: this.connections.map(conn => conn.toJSON ? conn.toJSON() : conn),
      // Maintain backward compatibility
      connectedNodes: this.getConnectedNodeIds()
    };

    // Include customData if it exists
    if (this.customData) {
      json.customData = this.customData;
    }

    return json;
  }

  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for Node');
    }
    
    // Handle environment data
    let environment = data.environment;
    if (environment && typeof environment === 'object' && !(environment instanceof Environment)) {
      environment = Environment.fromJSON(environment);
    }
    
    // Handle connections data
    let connections = data.connections;
    if (Array.isArray(connections)) {
      connections = connections.map(connData => 
        connData instanceof NodeConnection ? connData : NodeConnection.fromJSON(connData)
      );
    }
    
    // Handle interaction migration
    let contentInteractions = data.contentInteractions;
    if (!contentInteractions && data.interactions) {
      // Migrate from old format
      contentInteractions = data.interactions;
      console.warn(`Node ${data.id}: Migrating legacy 'interactions' to 'contentInteractions' during deserialization.`);
    }
    
    return new Node({
      ...data,
      environment,
      connections,
      contentInteractions
    });
  }
}

export default Node;