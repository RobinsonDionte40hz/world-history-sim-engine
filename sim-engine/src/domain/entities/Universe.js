/**
 * Universe - Core universe entity for managing multiple worlds
 * Represents a container for multiple interconnected worlds with cross-world relationships
 * Mirrors the Node/NodeConnection pattern at the universe/world level
 */

import WorldConnection from '../value-objects/WorldConnection.js';
import WorldState from './WorldState.js';

class Universe {
  constructor(config = {}) {
    this.id = config.id || this._generateId();
    this.name = config.name || 'Untitled Universe';
    this.description = config.description || '';
    
    // Core universe configuration
    this.universalRules = config.universalRules || null;
    this.timeCoordination = config.timeCoordination || 'synchronized'; // 'synchronized' | 'independent' | 'relative'
    
    // World collection (can be WorldState instances or world IDs for lazy loading)
    this.worlds = Array.isArray(config.worlds) ? config.worlds : [];
    
    // World connections using WorldConnection value objects
    this.worldConnections = Array.isArray(config.worldConnections) ?
      config.worldConnections.map(conn => 
        conn instanceof WorldConnection ? conn : new WorldConnection(conn)
      ) : [];
    
    // Shared history across all worlds (for cross-world events)
    this.sharedHistory = config.sharedHistory || [];
    
    // Universe-level resources and effects
    this.universeResources = config.universeResources || {};
    this.cosmicEvents = config.cosmicEvents || [];
    
    // State tracking
    this.isValid = false;
    this.validationResult = null;
    
    // Metadata
    this.createdAt = config.createdAt || new Date();
    this.modifiedAt = config.modifiedAt || new Date();
    this.version = config.version || '1.0.0';
    this.metadata = config.metadata || {};
    
    // Template integration
    this.templateId = config.templateId || null;
    this.isTemplateInstance = config.isTemplateInstance || false;
  }

  _generateId(prefix = 'universe') {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `${prefix}_${crypto.randomUUID()}`;
    }
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Adds a world to the universe
   * @param {WorldState|Object} world - World to add (WorldState instance or world data)
   * @returns {Universe} This instance for chaining
   */
  addWorld(world) {
    if (!world) {
      throw new Error('World is required');
    }

    // Ensure world has an ID
    if (!world.id) {
      world.id = this._generateId('world');
    }

    // Check for duplicate world IDs
    const existingWorld = this.worlds.find(w => w.id === world.id);
    if (existingWorld) {
      throw new Error(`World with ID ${world.id} already exists in universe`);
    }

    this.worlds.push(world);
    this.modifiedAt = new Date();
    return this;
  }

  /**
   * Removes a world from the universe
   * @param {string} worldId - World ID to remove
   * @returns {boolean} True if world was removed
   */
  removeWorld(worldId) {
    const index = this.worlds.findIndex(w => w.id === worldId);
    if (index === -1) {
      return false;
    }

    // Remove all connections involving this world
    this.worldConnections = this.worldConnections.filter(conn =>
      conn.sourceWorldId !== worldId && conn.targetWorldId !== worldId
    );

    this.worlds.splice(index, 1);
    this.modifiedAt = new Date();
    return true;
  }

  /**
   * Gets a world by ID
   * @param {string} worldId - World ID
   * @returns {WorldState|Object|null} World instance or null if not found
   */
  getWorld(worldId) {
    return this.worlds.find(w => w.id === worldId) || null;
  }

  /**
   * Gets all worlds in the universe
   * @returns {Array} Array of all worlds
   */
  getWorlds() {
    return [...this.worlds];
  }

  /**
   * Connects two worlds with a WorldConnection
   * @param {string} sourceWorldId - Source world ID
   * @param {string} targetWorldId - Target world ID
   * @param {Object} connectionConfig - Connection configuration
   * @returns {Universe} This instance for chaining
   */
  connectWorlds(sourceWorldId, targetWorldId, connectionConfig = {}) {
    // Validate worlds exist
    const sourceWorld = this.getWorld(sourceWorldId);
    const targetWorld = this.getWorld(targetWorldId);

    if (!sourceWorld) {
      throw new Error(`Source world ${sourceWorldId} not found in universe`);
    }

    if (!targetWorld) {
      throw new Error(`Target world ${targetWorldId} not found in universe`);
    }

    // Create connection
    const connection = new WorldConnection({
      sourceWorldId,
      targetWorldId,
      ...connectionConfig
    });

    // Check for duplicate connections
    const existingConnection = this.worldConnections.find(conn =>
      conn.sourceWorldId === sourceWorldId && conn.targetWorldId === targetWorldId
    );

    if (existingConnection) {
      throw new Error(`Connection from ${sourceWorldId} to ${targetWorldId} already exists`);
    }

    this.worldConnections.push(connection);

    // Create reverse connection if bidirectional
    if (connection.bidirectional) {
      const reverseExists = this.worldConnections.find(conn =>
        conn.sourceWorldId === targetWorldId && conn.targetWorldId === sourceWorldId
      );

      if (!reverseExists) {
        this.worldConnections.push(connection.createReverseConnection());
      }
    }

    this.modifiedAt = new Date();
    return this;
  }

  /**
   * Removes a connection between two worlds
   * @param {string} sourceWorldId - Source world ID
   * @param {string} targetWorldId - Target world ID
   * @param {boolean} removeBidirectional - Whether to remove reverse connection too
   * @returns {boolean} True if connection was removed
   */
  disconnectWorlds(sourceWorldId, targetWorldId, removeBidirectional = true) {
    const index = this.worldConnections.findIndex(conn =>
      conn.sourceWorldId === sourceWorldId && conn.targetWorldId === targetWorldId
    );

    if (index === -1) {
      return false;
    }

    const connection = this.worldConnections[index];
    this.worldConnections.splice(index, 1);

    // Remove reverse connection if bidirectional
    if (removeBidirectional && connection.bidirectional) {
      const reverseIndex = this.worldConnections.findIndex(conn =>
        conn.sourceWorldId === targetWorldId && conn.targetWorldId === sourceWorldId
      );

      if (reverseIndex !== -1) {
        this.worldConnections.splice(reverseIndex, 1);
      }
    }

    this.modifiedAt = new Date();
    return true;
  }

  /**
   * Gets all connections for a specific world
   * @param {string} worldId - World ID
   * @returns {Array<WorldConnection>} Array of connections
   */
  getWorldConnections(worldId) {
    return this.worldConnections.filter(conn =>
      conn.sourceWorldId === worldId || conn.targetWorldId === worldId
    );
  }

  /**
   * Gets all worlds connected to a specific world
   * @param {string} worldId - World ID
   * @returns {Array} Array of connected worlds
   */
  getConnectedWorlds(worldId) {
    const connections = this.getWorldConnections(worldId);
    const connectedWorldIds = new Set();

    connections.forEach(conn => {
      if (conn.sourceWorldId === worldId) {
        connectedWorldIds.add(conn.targetWorldId);
      } else {
        connectedWorldIds.add(conn.sourceWorldId);
      }
    });

    return this.worlds.filter(w => connectedWorldIds.has(w.id));
  }

  /**
   * Checks if two worlds are connected
   * @param {string} worldId1 - First world ID
   * @param {string} worldId2 - Second world ID
   * @returns {boolean} True if worlds are connected
   */
  areWorldsConnected(worldId1, worldId2) {
    return this.worldConnections.some(conn =>
      (conn.sourceWorldId === worldId1 && conn.targetWorldId === worldId2) ||
      (conn.sourceWorldId === worldId2 && conn.targetWorldId === worldId1)
    );
  }

  /**
   * Gets the connection between two worlds
   * @param {string} sourceWorldId - Source world ID
   * @param {string} targetWorldId - Target world ID
   * @returns {WorldConnection|null} Connection or null if not found
   */
  getConnection(sourceWorldId, targetWorldId) {
    return this.worldConnections.find(conn =>
      conn.sourceWorldId === sourceWorldId && conn.targetWorldId === targetWorldId
    ) || null;
  }

  /**
   * Updates universe-level rules
   * @param {Object} rules - New universal rules
   * @returns {Universe} This instance for chaining
   */
  updateUniversalRules(rules) {
    if (!rules || typeof rules !== 'object') {
      throw new Error('Universal rules must be an object');
    }

    this.universalRules = { ...rules };
    this.modifiedAt = new Date();
    return this;
  }

  /**
   * Adds a cosmic event (universe-wide event)
   * @param {Object} event - Event to add
   * @returns {Universe} This instance for chaining
   */
  addCosmicEvent(event) {
    if (!event || typeof event !== 'object') {
      throw new Error('Event must be an object');
    }

    if (!event.id) {
      event.id = this._generateId('cosmic_event');
    }

    event.timestamp = event.timestamp || Date.now();
    this.cosmicEvents.push(event);
    this.modifiedAt = new Date();
    return this;
  }

  /**
   * Adds an entry to shared history
   * @param {Object} historyEntry - History entry to add
   * @returns {Universe} This instance for chaining
   */
  addToSharedHistory(historyEntry) {
    if (!historyEntry || typeof historyEntry !== 'object') {
      throw new Error('History entry must be an object');
    }

    historyEntry.timestamp = historyEntry.timestamp || Date.now();
    this.sharedHistory.push(historyEntry);
    this.modifiedAt = new Date();
    return this;
  }

  /**
   * Gets universe statistics
   * @returns {Object} Universe statistics
   */
  getStatistics() {
    return {
      totalWorlds: this.worlds.length,
      totalConnections: this.worldConnections.length,
      averageConnectionsPerWorld: this.worlds.length > 0 ?
        this.worldConnections.length / this.worlds.length : 0,
      sharedHistoryLength: this.sharedHistory.length,
      cosmicEventCount: this.cosmicEvents.length,
      timeCoordination: this.timeCoordination
    };
  }

  /**
   * Validates the universe configuration
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Check for at least one world
    if (this.worlds.length === 0) {
      warnings.push('Universe has no worlds');
    }

    // Validate all connections reference existing worlds
    this.worldConnections.forEach((conn, index) => {
      const sourceExists = this.worlds.some(w => w.id === conn.sourceWorldId);
      const targetExists = this.worlds.some(w => w.id === conn.targetWorldId);

      if (!sourceExists) {
        errors.push(`Connection ${index}: Source world ${conn.sourceWorldId} not found`);
      }

      if (!targetExists) {
        errors.push(`Connection ${index}: Target world ${conn.targetWorldId} not found`);
      }
    });

    // Check for isolated worlds
    const connectedWorldIds = new Set();
    this.worldConnections.forEach(conn => {
      connectedWorldIds.add(conn.sourceWorldId);
      connectedWorldIds.add(conn.targetWorldId);
    });

    const isolatedWorlds = this.worlds.filter(w => !connectedWorldIds.has(w.id));
    if (isolatedWorlds.length > 0 && this.worlds.length > 1) {
      warnings.push(`${isolatedWorlds.length} isolated world(s) with no connections`);
    }

    this.validationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      details: {
        worldCount: this.worlds.length,
        connectionCount: this.worldConnections.length,
        isolatedWorldCount: isolatedWorlds.length
      }
    };

    this.isValid = this.validationResult.isValid;
    return this.validationResult;
  }

  /**
   * Creates a JSON representation
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      universalRules: this.universalRules,
      timeCoordination: this.timeCoordination,
      worlds: this.worlds.map(w => w.toJSON ? w.toJSON() : w),
      worldConnections: this.worldConnections.map(conn => conn.toJSON()),
      sharedHistory: this.sharedHistory,
      universeResources: this.universeResources,
      cosmicEvents: this.cosmicEvents,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      version: this.version,
      metadata: this.metadata,
      templateId: this.templateId,
      isTemplateInstance: this.isTemplateInstance
    };
  }

  /**
   * Creates a Universe from JSON
   * @param {Object} json - JSON object
   * @returns {Universe} New Universe instance
   */
  static fromJSON(json) {
    // Convert world data back to WorldState instances if needed
    const worlds = json.worlds?.map(w => 
      w instanceof WorldState ? w : new WorldState(w)
    ) || [];

    return new Universe({
      ...json,
      worlds,
      worldConnections: json.worldConnections || []
    });
  }
}

export default Universe;
