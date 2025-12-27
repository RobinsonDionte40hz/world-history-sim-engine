// src/domain/value-objects/WorldConnection.js

import BaseValueObject from './BaseValueObject.js';
import { ValidationError } from '../../shared/types/ValueObjectTypes.js';

/**
 * Connection types for world-to-world relationships
 */
export const WorldConnectionTypes = {
  PORTAL: 'portal',                    // Direct magical/technological portal
  DIMENSIONAL_RIFT: 'dimensional-rift', // Natural dimensional barrier crossing
  TIMELINE_BRANCH: 'timeline-branch',   // Temporal connection between timelines
  PARALLEL_REALITY: 'parallel-reality', // Connection to parallel universe
  TRADE_ROUTE: 'trade-route',          // Economic/trade connection
  DIPLOMATIC: 'diplomatic',            // Political/diplomatic relationship
  CULTURAL: 'cultural',                // Cultural exchange connection
  COSMIC: 'cosmic',                    // Cosmic/celestial connection
  PLANAR: 'planar',                    // Planar boundary crossing
  DREAM: 'dream',                      // Connection through dream realm
  VOID: 'void',                        // Connection through void/space
  CUSTOM: 'custom'                     // User-defined connection type
};

/**
 * Get base traversal difficulty for connection type
 */
export const getWorldConnectionBaseDifficulty = (type) => {
  const difficulties = {
    [WorldConnectionTypes.PORTAL]: 0.2,
    [WorldConnectionTypes.DIMENSIONAL_RIFT]: 0.7,
    [WorldConnectionTypes.TIMELINE_BRANCH]: 0.8,
    [WorldConnectionTypes.PARALLEL_REALITY]: 0.6,
    [WorldConnectionTypes.TRADE_ROUTE]: 0.3,
    [WorldConnectionTypes.DIPLOMATIC]: 0.4,
    [WorldConnectionTypes.CULTURAL]: 0.3,
    [WorldConnectionTypes.COSMIC]: 0.9,
    [WorldConnectionTypes.PLANAR]: 0.7,
    [WorldConnectionTypes.DREAM]: 0.5,
    [WorldConnectionTypes.VOID]: 0.8,
    [WorldConnectionTypes.CUSTOM]: 0.5
  };
  return difficulties[type] || 0.5;
};

/**
 * Check if connection type is valid
 */
export const isValidWorldConnectionType = (type) => {
  return Object.values(WorldConnectionTypes).includes(type);
};

/**
 * WorldConnection value object represents a relationship between two worlds
 * with rich metadata including connection type, traversal difficulty, and conditions
 */
class WorldConnection extends BaseValueObject {
  /**
   * Creates a new WorldConnection
   * @param {Object} config - Configuration object
   * @param {string} config.sourceWorldId - ID of the source world
   * @param {string} config.targetWorldId - ID of the target world
   * @param {string} config.connectionType - Connection type from WorldConnectionTypes enum
   * @param {number} config.traversalDifficulty - Difficulty to traverse (0.0 to 1.0)
   * @param {boolean} config.bidirectional - Whether connection works both ways
   * @param {number} config.traversalCost - Resource/time cost to traverse
   * @param {Array} config.requirements - Requirements to use connection
   * @param {Object} config.properties - Additional connection properties
   * @param {Object} config.influence - How worlds influence each other through connection
   */
  constructor(config = {}) {
    super();

    // Validate and set world IDs
    this.sourceWorldId = this._validateWorldId(config.sourceWorldId, 'source');
    this.targetWorldId = this._validateWorldId(config.targetWorldId, 'target');

    // Validate that source and target are different
    if (this.sourceWorldId === this.targetWorldId) {
      throw new ValidationError(
        'worldIds',
        { sourceWorldId: this.sourceWorldId, targetWorldId: this.targetWorldId },
        'Source and target world IDs must be different'
      );
    }

    // Validate and set connection type
    this.connectionType = this._validateConnectionType(config.connectionType);

    // Validate and set traversal difficulty (0.0 to 1.0)
    this.traversalDifficulty = this._validateTraversalDifficulty(config.traversalDifficulty);

    // Set bidirectional flag (defaults to true)
    this.bidirectional = config.bidirectional !== false;

    // Validate and set traversal cost
    this.traversalCost = this._validateTraversalCost(config.traversalCost);

    // Validate and set requirements
    this.requirements = this._validateRequirements(config.requirements);

    // Validate and set properties
    this.properties = this._validateProperties(config.properties);

    // Validate and set influence
    this.influence = this._validateInfluence(config.influence);

    // Connection metadata
    this.createdAt = config.createdAt || Date.now();
    this.isActive = config.isActive !== false;
    this.usageCount = config.usageCount || 0;

    // Freeze the object to ensure immutability
    this.freeze();
  }

  /**
   * Validates world ID
   * @private
   */
  _validateWorldId(worldId, type) {
    if (!worldId || typeof worldId !== 'string' || worldId.trim() === '') {
      throw new ValidationError(
        `${type}WorldId`,
        worldId,
        `${type.charAt(0).toUpperCase() + type.slice(1)} world ID is required and must be a non-empty string`
      );
    }
    return worldId.trim();
  }

  /**
   * Validates connection type
   * @private
   */
  _validateConnectionType(type) {
    if (!type) {
      return WorldConnectionTypes.PORTAL; // Default
    }
    
    if (!isValidWorldConnectionType(type)) {
      console.warn(`Invalid world connection type: ${type}. Defaulting to PORTAL.`);
      return WorldConnectionTypes.PORTAL;
    }
    
    return type;
  }

  /**
   * Validates traversal difficulty (0.0 to 1.0)
   * @private
   */
  _validateTraversalDifficulty(difficulty) {
    if (difficulty === undefined || difficulty === null) {
      return getWorldConnectionBaseDifficulty(this.connectionType || WorldConnectionTypes.PORTAL);
    }
    
    if (typeof difficulty !== 'number' || difficulty < 0 || difficulty > 1 || !isFinite(difficulty) || isNaN(difficulty)) {
      console.warn(`Invalid traversal difficulty: ${difficulty}. Using default for connection type.`);
      return getWorldConnectionBaseDifficulty(this.connectionType || WorldConnectionTypes.PORTAL);
    }
    
    return difficulty;
  }

  /**
   * Validates traversal cost
   * @private
   */
  _validateTraversalCost(cost) {
    if (cost === undefined || cost === null) {
      return 1; // Default cost
    }
    
    if (typeof cost !== 'number' || cost < 0 || !isFinite(cost) || isNaN(cost)) {
      console.warn(`Invalid traversal cost: ${cost}. Using default cost of 1.`);
      return 1;
    }
    
    return Math.max(0, cost);
  }

  /**
   * Validates requirements array
   * @private
   */
  _validateRequirements(requirements) {
    if (!Array.isArray(requirements)) {
      return [];
    }
    
    // Filter out invalid requirements and limit to 20
    return requirements
      .filter(req => this._isValidRequirement(req))
      .slice(0, 20);
  }

  /**
   * Validates a single requirement
   * @private
   */
  _isValidRequirement(requirement) {
    if (!requirement || typeof requirement !== 'object') {
      return false;
    }
    
    // Requirement must have type and condition
    return requirement.type && 
           typeof requirement.type === 'string' && 
           requirement.condition !== undefined;
  }

  /**
   * Validates properties object
   * @private
   */
  _validateProperties(properties) {
    if (!properties || typeof properties !== 'object') {
      return {};
    }
    
    // Return a clean copy
    const validProperties = {};
    
    for (const [key, value] of Object.entries(properties)) {
      if (key && typeof key === 'string' && value !== undefined) {
        validProperties[key] = value;
      }
    }
    
    return validProperties;
  }

  /**
   * Validates influence object
   * @private
   */
  _validateInfluence(influence) {
    if (!influence || typeof influence !== 'object') {
      return {
        economic: 0,
        cultural: 0,
        political: 0,
        technological: 0
      };
    }
    
    return {
      economic: this._validateInfluenceValue(influence.economic),
      cultural: this._validateInfluenceValue(influence.cultural),
      political: this._validateInfluenceValue(influence.political),
      technological: this._validateInfluenceValue(influence.technological)
    };
  }

  /**
   * Validates a single influence value (-1.0 to 1.0)
   * @private
   */
  _validateInfluenceValue(value) {
    if (value === undefined || value === null) {
      return 0;
    }
    
    if (typeof value !== 'number' || !isFinite(value) || isNaN(value)) {
      return 0;
    }
    
    return Math.max(-1, Math.min(1, value));
  }

  /**
   * Checks if a character/entity meets requirements to traverse
   * @param {Object} entity - Entity attempting to traverse
   * @returns {boolean} Whether entity can traverse
   */
  canTraverse(entity) {
    if (!this.isActive) {
      return false;
    }

    // Check all requirements
    return this.requirements.every(req => {
      return this._checkRequirement(req, entity);
    });
  }

  /**
   * Checks a single requirement against entity
   * @private
   */
  _checkRequirement(requirement, entity) {
    switch (requirement.type) {
      case 'attribute':
        return entity.attributes && 
               entity.attributes[requirement.attribute] >= requirement.condition;
      
      case 'item':
        return entity.inventory && 
               entity.inventory.some(item => item.id === requirement.condition);
      
      case 'knowledge':
        return entity.knowledge && 
               entity.knowledge.includes(requirement.condition);
      
      case 'reputation':
        return entity.reputation >= requirement.condition;
      
      default:
        return true;
    }
  }

  /**
   * Calculate actual traversal cost for entity
   * @param {Object} entity - Entity traversing
   * @returns {number} Actual cost
   */
  calculateTraversalCost(entity) {
    let cost = this.traversalCost;

    // Apply difficulty modifier
    cost *= (1 + this.traversalDifficulty);

    // Entity-specific modifiers
    if (entity.traits?.includes('dimensional_traveler')) {
      cost *= 0.5;
    }

    return Math.max(1, Math.round(cost));
  }

  /**
   * Creates a JSON representation
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      sourceWorldId: this.sourceWorldId,
      targetWorldId: this.targetWorldId,
      connectionType: this.connectionType,
      traversalDifficulty: this.traversalDifficulty,
      bidirectional: this.bidirectional,
      traversalCost: this.traversalCost,
      requirements: this.requirements,
      properties: this.properties,
      influence: this.influence,
      createdAt: this.createdAt,
      isActive: this.isActive,
      usageCount: this.usageCount
    };
  }

  /**
   * Creates a WorldConnection from JSON
   * @param {Object} json - JSON object
   * @returns {WorldConnection} New WorldConnection instance
   */
  static fromJSON(json) {
    return new WorldConnection(json);
  }

  /**
   * Creates a reverse connection (for bidirectional connections)
   * @returns {WorldConnection} New connection with source and target swapped
   */
  createReverseConnection() {
    return new WorldConnection({
      sourceWorldId: this.targetWorldId,
      targetWorldId: this.sourceWorldId,
      connectionType: this.connectionType,
      traversalDifficulty: this.traversalDifficulty,
      bidirectional: this.bidirectional,
      traversalCost: this.traversalCost,
      requirements: this.requirements,
      properties: this.properties,
      influence: {
        economic: -this.influence.economic,
        cultural: -this.influence.cultural,
        political: -this.influence.political,
        technological: -this.influence.technological
      },
      createdAt: this.createdAt,
      isActive: this.isActive,
      usageCount: this.usageCount
    });
  }
}

export default WorldConnection;
