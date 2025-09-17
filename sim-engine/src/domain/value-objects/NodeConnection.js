// src/domain/value-objects/NodeConnection.js

import BaseValueObject from './BaseValueObject.js';
import { ConnectionTypes, isValidConnectionType, getConnectionBaseDifficulty } from '../../shared/constants/ConnectionTypes.js';
import { ValidationError } from '../../shared/types/ValueObjectTypes.js';

/**
 * NodeConnection value object represents a relationship between two nodes
 * with rich metadata including connection type, difficulty, distance, and travel conditions
 */
class NodeConnection extends BaseValueObject {
  /**
   * Creates a new NodeConnection
   * @param {Object} config - Configuration object
   * @param {string} config.targetNodeId - ID of the target node
   * @param {string} config.type - Connection type from ConnectionTypes enum
   * @param {number} config.difficulty - Travel difficulty (1-10 scale)
   * @param {number} config.distance - Abstract distance units
   * @param {boolean} config.bidirectional - Whether connection works both ways
   * @param {Array} config.conditions - Travel conditions/requirements
   * @param {Object} config.modifiers - Travel modifiers
   */
  constructor(config = {}) {
    super();

    // Validate and set target node ID
    this.targetNodeId = this._validateTargetNodeId(config.targetNodeId);

    // Validate and set connection type
    this.type = this._validateConnectionType(config.type);

    // Validate and set difficulty
    this.difficulty = this._validateDifficulty(config.difficulty);

    // Validate and set distance
    this.distance = this._validateDistance(config.distance);

    // Set bidirectional flag (defaults to true)
    this.bidirectional = config.bidirectional !== false;

    // Validate and set conditions
    this.conditions = this._validateConditions(config.conditions);

    // Validate and set modifiers
    this.modifiers = this._validateModifiers(config.modifiers);

    // Freeze the object to ensure immutability
    this.freeze();
  }

  /**
   * Validates target node ID
   * @private
   */
  _validateTargetNodeId(targetNodeId) {
    if (!targetNodeId || typeof targetNodeId !== 'string' || targetNodeId.trim() === '') {
      throw new ValidationError('targetNodeId', targetNodeId, 'Target node ID is required and must be a non-empty string');
    }
    return targetNodeId.trim();
  }

  /**
   * Validates connection type
   * @private
   */
  _validateConnectionType(type) {
    if (!type) {
      return ConnectionTypes.ROAD; // Default
    }
    
    if (!isValidConnectionType(type)) {
      return ConnectionTypes.ROAD; // Default for invalid types
    }
    
    return type;
  }

  /**
   * Validates difficulty range (1-10)
   * @private
   */
  _validateDifficulty(difficulty) {
    if (difficulty === undefined || difficulty === null) {
      return getConnectionBaseDifficulty(this.type || ConnectionTypes.ROAD);
    }
    
    if (typeof difficulty !== 'number' || difficulty < 1 || difficulty > 10 || !isFinite(difficulty) || isNaN(difficulty)) {
      return getConnectionBaseDifficulty(this.type || ConnectionTypes.ROAD);
    }
    
    return Math.round(difficulty); // Ensure integer
  }

  /**
   * Validates distance (must be positive)
   * @private
   */
  _validateDistance(distance) {
    if (distance === undefined || distance === null) {
      return 1; // Default distance
    }
    
    if (typeof distance !== 'number' || distance <= 0 || !isFinite(distance) || isNaN(distance)) {
      return 1; // Default for invalid distances
    }
    
    return Math.max(0.1, distance); // Minimum distance of 0.1
  }

  /**
   * Validates conditions array
   * @private
   */
  _validateConditions(conditions) {
    if (!Array.isArray(conditions)) {
      return [];
    }
    
    // Filter out invalid conditions and limit to 10
    return conditions
      .filter(condition => this._isValidCondition(condition))
      .slice(0, 10);
  }

  /**
   * Validates a single condition
   * @private
   */
  _isValidCondition(condition) {
    if (!condition || typeof condition !== 'object') {
      return false;
    }
    
    // Condition must have type and value
    return condition.type && 
           typeof condition.type === 'string' && 
           condition.value !== undefined;
  }

  /**
   * Validates modifiers object
   * @private
   */
  _validateModifiers(modifiers) {
    if (!modifiers || typeof modifiers !== 'object') {
      return {};
    }
    
    const validModifiers = {};
    
    // Only allow numeric modifiers
    Object.entries(modifiers).forEach(([key, value]) => {
      if (typeof key === 'string' && typeof value === 'number' && !isNaN(value)) {
        validModifiers[key] = value;
      }
    });
    
    return validModifiers;
  }

  /**
   * Calculates travel time based on distance and difficulty
   * @param {number} baseTime - Base travel time (default: 1)
   * @returns {number} Calculated travel time
   */
  getTravelTime(baseTime = 1) {
    if (typeof baseTime !== 'number' || baseTime <= 0) {
      baseTime = 1;
    }
    
    // Travel time = base time * distance * difficulty modifier
    const difficultyModifier = this.difficulty / 5; // Scale difficulty to multiplier
    return baseTime * this.distance * difficultyModifier;
  }

  /**
   * Checks if the connection is passable given current conditions
   * @param {Object} currentConditions - Current world/character conditions
   * @returns {boolean} True if passable, false otherwise
   */
  isPassable(currentConditions = {}) {
    // If no conditions are required, connection is always passable
    if (this.conditions.length === 0) {
      return true;
    }
    
    // Check each condition
    return this.conditions.every(condition => 
      this._checkCondition(condition, currentConditions)
    );
  }

  /**
   * Checks a single condition against current conditions
   * @private
   */
  _checkCondition(condition, currentConditions) {
    const { type, value, operator = 'gte' } = condition;
    const currentValue = currentConditions[type];
    
    if (currentValue === undefined) {
      return false; // Required condition not met
    }
    
    switch (operator) {
      case 'eq':
        return currentValue === value;
      case 'ne':
        return currentValue !== value;
      case 'gt':
        return currentValue > value;
      case 'gte':
        return currentValue >= value;
      case 'lt':
        return currentValue < value;
      case 'lte':
        return currentValue <= value;
      case 'in':
        return Array.isArray(value) && value.includes(currentValue);
      case 'nin':
        return Array.isArray(value) && !value.includes(currentValue);
      default:
        return currentValue >= value; // Default to gte
    }
  }

  /**
   * Gets the effective difficulty considering modifiers
   * @param {Object} characterModifiers - Character-specific modifiers
   * @returns {number} Effective difficulty
   */
  getEffectiveDifficulty(characterModifiers = {}) {
    let effectiveDifficulty = this.difficulty;
    
    // Apply connection modifiers
    Object.entries(this.modifiers).forEach(([key, value]) => {
      if (key.includes('difficulty')) {
        effectiveDifficulty += value;
      }
    });
    
    // Apply character modifiers
    Object.entries(characterModifiers).forEach(([key, value]) => {
      if (key.includes('travel') || key.includes('movement')) {
        effectiveDifficulty *= (1 - value); // Positive modifiers reduce difficulty
      }
    });
    
    // Clamp between 1 and 10
    return Math.max(1, Math.min(10, Math.round(effectiveDifficulty)));
  }

  /**
   * Gets travel cost based on difficulty and distance
   * @param {Object} costFactors - Cost calculation factors
   * @returns {Object} Travel costs (time, energy, resources)
   */
  getTravelCost(costFactors = {}) {
    const {
      baseTimeCost = 1,
      baseEnergyCost = 1,
      baseResourceCost = 0
    } = costFactors;
    
    const difficultyMultiplier = this.difficulty / 5;
    const distanceMultiplier = this.distance;
    
    return {
      time: baseTimeCost * distanceMultiplier * difficultyMultiplier,
      energy: baseEnergyCost * difficultyMultiplier,
      resources: baseResourceCost * distanceMultiplier
    };
  }

  /**
   * Checks if this connection is the reverse of another connection
   * @param {NodeConnection} otherConnection - Connection to compare
   * @param {string} sourceNodeId - ID of the source node for this connection
   * @returns {boolean} True if connections are reverse of each other
   */
  isReverseOf(otherConnection, sourceNodeId) {
    if (!(otherConnection instanceof NodeConnection)) {
      return false;
    }
    
    // This connection goes from sourceNodeId to this.targetNodeId
    // Other connection should go from this.targetNodeId to sourceNodeId
    return otherConnection.targetNodeId === sourceNodeId && 
           this.type === otherConnection.type;
  }

  /**
   * Creates a reverse connection for bidirectional connections
   * @param {string} sourceNodeId - ID of the source node
   * @returns {NodeConnection} Reverse connection
   */
  createReverse(sourceNodeId) {
    if (!this.bidirectional) {
      throw new Error('Cannot create reverse connection for unidirectional connection');
    }
    
    return new NodeConnection({
      targetNodeId: sourceNodeId,
      type: this.type,
      difficulty: this.difficulty,
      distance: this.distance,
      bidirectional: true,
      conditions: [...this.conditions],
      modifiers: { ...this.modifiers }
    });
  }

  /**
   * Validates the connection against available nodes
   * @param {Array} availableNodes - Array of available node IDs
   * @returns {Object} Validation result
   */
  validateConnection(availableNodes = []) {
    const errors = [];
    
    // Check if target node exists
    if (availableNodes.length > 0 && !availableNodes.includes(this.targetNodeId)) {
      errors.push(`Target node ${this.targetNodeId} does not exist`);
    }
    
    // Validate difficulty range
    if (this.difficulty < 1 || this.difficulty > 10) {
      errors.push('Difficulty must be between 1 and 10');
    }
    
    // Validate distance
    if (this.distance <= 0) {
      errors.push('Distance must be positive');
    }
    
    // Validate connection type
    if (!isValidConnectionType(this.type)) {
      errors.push(`Invalid connection type: ${this.type}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Serializes the connection to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      targetNodeId: this.targetNodeId,
      type: this.type,
      difficulty: this.difficulty,
      distance: this.distance,
      bidirectional: this.bidirectional,
      conditions: [...this.conditions],
      modifiers: { ...this.modifiers }
    };
  }

  /**
   * Creates a NodeConnection from JSON data
   * @param {Object} jsonData - JSON data
   * @returns {NodeConnection} New NodeConnection instance
   */
  static fromJSON(jsonData) {
    if (!jsonData || typeof jsonData !== 'object') {
      throw new ValidationError('jsonData', jsonData, 'JSON data must be an object');
    }
    
    return new NodeConnection(jsonData);
  }

  /**
   * Creates a default road connection
   * @param {string} targetNodeId - Target node ID
   * @returns {NodeConnection} Default connection
   */
  static createRoad(targetNodeId) {
    return new NodeConnection({
      targetNodeId,
      type: ConnectionTypes.ROAD,
      difficulty: 1,
      distance: 1,
      bidirectional: true,
      conditions: [],
      modifiers: {}
    });
  }

  /**
   * Creates a dangerous mountain pass connection
   * @param {string} targetNodeId - Target node ID
   * @returns {NodeConnection} Mountain pass connection
   */
  static createMountainPass(targetNodeId) {
    return new NodeConnection({
      targetNodeId,
      type: ConnectionTypes.MOUNTAIN_PASS,
      difficulty: 6,
      distance: 2,
      bidirectional: true,
      conditions: [
        { type: 'climbing_skill', value: 3, operator: 'gte' },
        { type: 'constitution', value: 12, operator: 'gte' }
      ],
      modifiers: {
        altitude_sickness: 0.2,
        weather_risk: 0.3
      }
    });
  }

  /**
   * Creates a magical teleport connection
   * @param {string} targetNodeId - Target node ID
   * @returns {NodeConnection} Teleport connection
   */
  static createTeleport(targetNodeId) {
    return new NodeConnection({
      targetNodeId,
      type: ConnectionTypes.TELEPORT,
      difficulty: 1,
      distance: 0.1,
      bidirectional: false, // Usually one-way
      conditions: [
        { type: 'magic_access', value: true, operator: 'eq' }
      ],
      modifiers: {
        mana_cost: 10
      }
    });
  }

  /**
   * Creates a new connection with modified properties
   * @param {Object} modifications - Properties to modify
   * @returns {NodeConnection} New connection with modifications
   */
  withModifications(modifications) {
    const currentData = this.toJSON();
    const updatedData = { ...currentData, ...modifications };
    return NodeConnection.fromJSON(updatedData);
  }
}

export default NodeConnection;