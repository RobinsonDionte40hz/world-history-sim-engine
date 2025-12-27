/**
 * UniverseBuilder - Core service for building and preparing a universe for simulation
 * Mirrors WorldBuilder pattern for managing multiple worlds and their connections
 * Provides fluent API for universe construction with validation
 */

import Universe from '../entities/Universe.js';
import WorldState from '../entities/WorldState.js';
import WorldConnection, { WorldConnectionTypes } from '../value-objects/WorldConnection.js';
import { ValidationError } from '../../shared/types/ValueObjectTypes.js';

class UniverseBuilder {
  constructor(templateManager = null) {
    this.templateManager = templateManager;

    // Universe configuration
    this.universeConfig = {
      // Basic properties
      name: null,
      description: null,
      universalRules: null,
      timeCoordination: 'synchronized', // 'synchronized' | 'independent' | 'relative'

      // Content
      worlds: [],
      worldConnections: [],

      // Metadata
      universeResources: {},
      cosmicEvents: [],
      sharedHistory: [],

      // State
      isComplete: false,
      isValid: false
    };
  }

  /**
   * Sets basic universe properties
   * @param {string} name - Universe name
   * @param {string} description - Universe description
   * @returns {UniverseBuilder} This instance for chaining
   */
  setUniverseProperties(name, description) {
    if (!name || typeof name !== 'string') {
      throw new Error('Universe name is required and must be a string');
    }

    if (!description || typeof description !== 'string') {
      throw new Error('Universe description is required and must be a string');
    }

    this.universeConfig.name = name;
    this.universeConfig.description = description;
    return this;
  }

  /**
   * Sets universal rules that apply across all worlds
   * @param {Object} rules - Universal rules configuration
   * @returns {UniverseBuilder} This instance for chaining
   */
  setUniversalRules(rules) {
    if (!rules || typeof rules !== 'object') {
      throw new Error('Universal rules must be an object');
    }

    this.universeConfig.universalRules = { ...rules };
    return this;
  }

  /**
   * Sets time coordination mode
   * @param {string} mode - Time coordination mode ('synchronized' | 'independent' | 'relative')
   * @returns {UniverseBuilder} This instance for chaining
   */
  setTimeCoordination(mode) {
    const validModes = ['synchronized', 'independent', 'relative'];
    if (!validModes.includes(mode)) {
      throw new Error(`Invalid time coordination mode. Must be one of: ${validModes.join(', ')}`);
    }

    this.universeConfig.timeCoordination = mode;
    return this;
  }

  /**
   * Adds a world to the universe
   * @param {WorldState|Object} world - World to add (WorldState instance or world data)
   * @returns {UniverseBuilder} This instance for chaining
   */
  addWorld(world) {
    if (!world) {
      throw new Error('World is required');
    }

    // Convert to WorldState if needed
    let worldInstance;
    if (world instanceof WorldState) {
      worldInstance = world;
    } else if (typeof world === 'object') {
      worldInstance = new WorldState(world);
    } else {
      throw new Error('World must be a WorldState instance or object');
    }

    // Ensure world has an ID
    if (!worldInstance.id) {
      worldInstance.id = this._generateId('world');
    }

    // Check for duplicate world IDs
    const existingWorld = this.universeConfig.worlds.find(w => w.id === worldInstance.id);
    if (existingWorld) {
      throw new Error(`World with ID ${worldInstance.id} already exists in universe`);
    }

    this.universeConfig.worlds.push(worldInstance);
    return this;
  }

  /**
   * Adds a world from a template
   * @param {string} templateId - Template ID
   * @param {Object} customizations - Customizations to apply
   * @returns {UniverseBuilder} This instance for chaining
   */
  addWorldFromTemplate(templateId, customizations = {}) {
    if (!this.templateManager) {
      throw new Error('TemplateManager is required for template operations');
    }

    const template = this.templateManager.getTemplate('worlds', templateId);
    if (!template) {
      throw new Error(`World template not found: ${templateId}`);
    }

    const worldConfig = {
      ...template,
      ...customizations,
      id: customizations.id || this._generateId('world'),
      templateId: templateId,
      isTemplateInstance: true
    };

    return this.addWorld(new WorldState(worldConfig));
  }

  /**
   * Imports an existing world into the universe
   * @param {WorldState} world - World to import
   * @returns {UniverseBuilder} This instance for chaining
   */
  importWorld(world) {
    if (!(world instanceof WorldState)) {
      throw new Error('Imported world must be a WorldState instance');
    }

    return this.addWorld(world);
  }

  /**
   * Removes a world from the universe
   * @param {string} worldId - World ID to remove
   * @returns {UniverseBuilder} This instance for chaining
   */
  removeWorld(worldId) {
    const index = this.universeConfig.worlds.findIndex(w => w.id === worldId);
    if (index === -1) {
      throw new Error(`World with ID ${worldId} not found`);
    }

    // Remove all connections involving this world
    this.universeConfig.worldConnections = this.universeConfig.worldConnections.filter(conn =>
      conn.sourceWorldId !== worldId && conn.targetWorldId !== worldId
    );

    this.universeConfig.worlds.splice(index, 1);
    return this;
  }

  /**
   * Gets a world by ID
   * @param {string} worldId - World ID
   * @returns {WorldState|null} World instance or null if not found
   */
  getWorld(worldId) {
    return this.universeConfig.worlds.find(w => w.id === worldId) || null;
  }

  /**
   * Gets all worlds
   * @returns {Array<WorldState>} Array of all worlds
   */
  getAllWorlds() {
    return [...this.universeConfig.worlds];
  }

  /**
   * Connects two worlds
   * @param {string} sourceWorldId - Source world ID
   * @param {string} targetWorldId - Target world ID
   * @param {Object} connectionConfig - Connection configuration
   * @returns {UniverseBuilder} This instance for chaining
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
      connectionType: connectionConfig.connectionType || WorldConnectionTypes.PORTAL,
      ...connectionConfig
    });

    // Check for duplicate connections
    const existingConnection = this.universeConfig.worldConnections.find(conn =>
      conn.sourceWorldId === sourceWorldId && conn.targetWorldId === targetWorldId
    );

    if (existingConnection) {
      throw new Error(`Connection from ${sourceWorldId} to ${targetWorldId} already exists`);
    }

    this.universeConfig.worldConnections.push(connection);

    // Create reverse connection if bidirectional
    if (connection.bidirectional) {
      const reverseExists = this.universeConfig.worldConnections.find(conn =>
        conn.sourceWorldId === targetWorldId && conn.targetWorldId === sourceWorldId
      );

      if (!reverseExists) {
        this.universeConfig.worldConnections.push(connection.createReverseConnection());
      }
    }

    return this;
  }

  /**
   * Disconnects two worlds
   * @param {string} sourceWorldId - Source world ID
   * @param {string} targetWorldId - Target world ID
   * @param {boolean} removeBidirectional - Whether to remove reverse connection too
   * @returns {UniverseBuilder} This instance for chaining
   */
  disconnectWorlds(sourceWorldId, targetWorldId, removeBidirectional = true) {
    const index = this.universeConfig.worldConnections.findIndex(conn =>
      conn.sourceWorldId === sourceWorldId && conn.targetWorldId === targetWorldId
    );

    if (index === -1) {
      throw new Error(`Connection from ${sourceWorldId} to ${targetWorldId} not found`);
    }

    const connection = this.universeConfig.worldConnections[index];
    this.universeConfig.worldConnections.splice(index, 1);

    // Remove reverse connection if bidirectional
    if (removeBidirectional && connection.bidirectional) {
      const reverseIndex = this.universeConfig.worldConnections.findIndex(conn =>
        conn.sourceWorldId === targetWorldId && conn.targetWorldId === sourceWorldId
      );

      if (reverseIndex !== -1) {
        this.universeConfig.worldConnections.splice(reverseIndex, 1);
      }
    }

    return this;
  }

  /**
   * Gets all connections for a specific world
   * @param {string} worldId - World ID
   * @returns {Array<WorldConnection>} Array of connections
   */
  getWorldConnections(worldId) {
    return this.universeConfig.worldConnections.filter(conn =>
      conn.sourceWorldId === worldId || conn.targetWorldId === worldId
    );
  }

  /**
   * Adds a cosmic event (universe-wide event)
   * @param {Object} event - Event to add
   * @returns {UniverseBuilder} This instance for chaining
   */
  addCosmicEvent(event) {
    if (!event || typeof event !== 'object') {
      throw new Error('Event must be an object');
    }

    if (!event.id) {
      event.id = this._generateId('cosmic_event');
    }

    event.timestamp = event.timestamp || Date.now();
    this.universeConfig.cosmicEvents.push(event);
    return this;
  }

  /**
   * Sets universe-level resources
   * @param {Object} resources - Resources configuration
   * @returns {UniverseBuilder} This instance for chaining
   */
  setUniverseResources(resources) {
    if (!resources || typeof resources !== 'object') {
      throw new Error('Resources must be an object');
    }

    this.universeConfig.universeResources = { ...resources };
    return this;
  }

  /**
   * Validates the current universe configuration
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Check basic properties
    if (!this.universeConfig.name) {
      errors.push('Universe name is required');
    }

    if (!this.universeConfig.description) {
      warnings.push('Universe description is recommended');
    }

    // Check for at least one world
    if (this.universeConfig.worlds.length === 0) {
      warnings.push('Universe has no worlds');
    }

    // Validate all connections reference existing worlds
    this.universeConfig.worldConnections.forEach((conn, index) => {
      const sourceExists = this.universeConfig.worlds.some(w => w.id === conn.sourceWorldId);
      const targetExists = this.universeConfig.worlds.some(w => w.id === conn.targetWorldId);

      if (!sourceExists) {
        errors.push(`Connection ${index}: Source world ${conn.sourceWorldId} not found`);
      }

      if (!targetExists) {
        errors.push(`Connection ${index}: Target world ${conn.targetWorldId} not found`);
      }
    });

    // Check for isolated worlds
    if (this.universeConfig.worlds.length > 1) {
      const connectedWorldIds = new Set();
      this.universeConfig.worldConnections.forEach(conn => {
        connectedWorldIds.add(conn.sourceWorldId);
        connectedWorldIds.add(conn.targetWorldId);
      });

      const isolatedWorlds = this.universeConfig.worlds.filter(w => !connectedWorldIds.has(w.id));
      if (isolatedWorlds.length > 0) {
        warnings.push(`${isolatedWorlds.length} isolated world(s) with no connections`);
      }
    }

    // Validate each world
    const worldValidations = this.universeConfig.worlds.map(world => {
      if (world.validate && typeof world.validate === 'function') {
        return world.validate();
      }
      return { isValid: true, errors: [], warnings: [] };
    });

    worldValidations.forEach((validation, index) => {
      if (!validation.isValid) {
        errors.push(`World ${this.universeConfig.worlds[index].name}: ${validation.errors.join(', ')}`);
      }
    });

    const isValid = errors.length === 0;

    this.universeConfig.isValid = isValid;
    this.universeConfig.isComplete = isValid && this.universeConfig.worlds.length > 0;

    return {
      isValid,
      isComplete: this.universeConfig.isComplete,
      errors,
      warnings,
      details: {
        worldCount: this.universeConfig.worlds.length,
        connectionCount: this.universeConfig.worldConnections.length,
        cosmicEventCount: this.universeConfig.cosmicEvents.length
      }
    };
  }

  /**
   * Builds the final Universe entity
   * @returns {Universe} Constructed Universe instance
   */
  build() {
    const validation = this.validate();

    if (!validation.isValid) {
      throw new Error(`Cannot build universe with validation errors: ${validation.errors.join(', ')}`);
    }

    return new Universe({
      name: this.universeConfig.name,
      description: this.universeConfig.description,
      universalRules: this.universeConfig.universalRules,
      timeCoordination: this.universeConfig.timeCoordination,
      worlds: this.universeConfig.worlds,
      worldConnections: this.universeConfig.worldConnections,
      sharedHistory: this.universeConfig.sharedHistory,
      universeResources: this.universeConfig.universeResources,
      cosmicEvents: this.universeConfig.cosmicEvents
    });
  }

  /**
   * Creates a universe from a template
   * @param {string} templateId - Template ID
   * @param {Object} customizations - Customizations to apply
   * @returns {Universe} Constructed Universe instance
   */
  fromTemplate(templateId, customizations = {}) {
    if (!this.templateManager) {
      throw new Error('TemplateManager is required for template operations');
    }

    const template = this.templateManager.getTemplate('universes', templateId);
    if (!template) {
      throw new Error(`Universe template not found: ${templateId}`);
    }

    // Apply template configuration
    this.setUniverseProperties(
      customizations.name || template.name,
      customizations.description || template.description
    );

    if (template.universalRules) {
      this.setUniversalRules(template.universalRules);
    }

    if (template.timeCoordination) {
      this.setTimeCoordination(template.timeCoordination);
    }

    // Add worlds from template
    if (template.worlds && Array.isArray(template.worlds)) {
      template.worlds.forEach(worldData => {
        this.addWorld(worldData);
      });
    }

    // Add connections from template
    if (template.worldConnections && Array.isArray(template.worldConnections)) {
      template.worldConnections.forEach(connData => {
        this.connectWorlds(connData.sourceWorldId, connData.targetWorldId, connData);
      });
    }

    return this.build();
  }

  /**
   * Resets the builder to initial state
   * @returns {UniverseBuilder} This instance for chaining
   */
  reset() {
    this.universeConfig = {
      name: null,
      description: null,
      universalRules: null,
      timeCoordination: 'synchronized',
      worlds: [],
      worldConnections: [],
      universeResources: {},
      cosmicEvents: [],
      sharedHistory: [],
      isComplete: false,
      isValid: false
    };
    return this;
  }

  /**
   * Generates a unique ID
   * @private
   */
  _generateId(prefix = 'universe') {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `${prefix}_${crypto.randomUUID()}`;
    }
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default UniverseBuilder;
