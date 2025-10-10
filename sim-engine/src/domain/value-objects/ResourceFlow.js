// src/domain/value-objects/ResourceFlow.js

import BaseValueObject from './BaseValueObject.js';
import { ValidationError } from '../../shared/types/ValueObjectTypes.js';

/**
 * ResourceFlow value object representing resource transfers between nodes and settlements
 * Tracks the movement of resources (food, water, materials, goods) with validation and capacity checking
 */
class ResourceFlow extends BaseValueObject {
  /**
   * Create a new ResourceFlow
   * @param {Object} config - Configuration object
   * @param {string} config.id - Unique identifier for the flow
   * @param {string} config.sourceNodeId - ID of the source node
   * @param {string} config.targetNodeId - ID of the target node
   * @param {string} config.resourceType - Type of resource ('food', 'water', 'materials', 'goods')
   * @param {number} config.amount - Amount of resource to transfer
   * @param {number} config.capacity - Maximum capacity of this flow
   * @param {string} config.flowType - Type of flow ('production', 'trade', 'tribute', 'redistribution')
   * @param {number} config.efficiency - Efficiency multiplier (0.0 to 1.0)
   * @param {Object} config.metadata - Additional flow metadata
   * @param {number} config.timestamp - When the flow was created
   */
  constructor(config = {}) {
    super();

    // Validate required fields
    this.validateRequired('sourceNodeId', config.sourceNodeId);
    this.validateRequired('targetNodeId', config.targetNodeId);
    this.validateRequired('resourceType', config.resourceType);

    // Set basic properties
    this.id = config.id || this._generateId();
    this.sourceNodeId = config.sourceNodeId;
    this.targetNodeId = config.targetNodeId;

    // Validate and set resource type
    this.resourceType = config.resourceType;
    this._validateResourceType(this.resourceType);

    // Validate and set amount
    this.amount = config.amount !== undefined ? config.amount : 0;
    this.validateRange('amount', this.amount, 0, Number.MAX_SAFE_INTEGER);

    // Validate and set capacity
    this.capacity = config.capacity !== undefined ? config.capacity : Number.MAX_SAFE_INTEGER;
    this.validateRange('capacity', this.capacity, 0, Number.MAX_SAFE_INTEGER);

    // Validate flow type
    this.flowType = config.flowType || 'production';
    this._validateFlowType(this.flowType);

    // Validate and set efficiency
    this.efficiency = config.efficiency !== undefined ? config.efficiency : 1.0;
    this.validateRange('efficiency', this.efficiency, 0.0, 1.0);

    // Set metadata and timestamp
    this.metadata = config.metadata ? { ...config.metadata } : {};
    this.timestamp = config.timestamp || Date.now();

    // Calculate effective amount (amount * efficiency, capped by capacity)
    this.effectiveAmount = Math.min(this.amount * this.efficiency, this.capacity);

    // Track flow status
    this.status = config.status || 'pending'; // 'pending', 'active', 'completed', 'failed'
    this.actualTransferred = config.actualTransferred || 0;

    // Flow history for tracking
    this.history = Array.isArray(config.history) ? [...config.history] : [];

    this.freeze();
  }

  _generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _validateFlowType(flowType) {
    const validTypes = ['production', 'trade', 'tribute', 'redistribution', 'emergency'];
    if (!validTypes.includes(flowType)) {
      throw new ValidationError('flowType', flowType, `Must be one of: ${validTypes.join(', ')}`);
    }
  }

  /**
   * Validate the resource type
   * @param {string} resourceType - The resource type to validate
   */
  _validateResourceType(resourceType) {
    const validTypes = ['food', 'water', 'materials', 'goods', 'energy', 'services'];
    if (!validTypes.includes(resourceType)) {
      throw new ValidationError('resourceType', resourceType, `Must be one of: ${validTypes.join(', ')}`);
    }
  }

  /**
   * Check if the flow can be executed (has capacity and valid amount)
   * @returns {boolean} True if the flow can be executed
   */
  canExecute() {
    return this.effectiveAmount > 0 && this.status === 'pending';
  }

  /**
   * Execute the flow and update status
   * @param {number} actualAmount - The actual amount that was transferred
   * @returns {ResourceFlow} New ResourceFlow instance with updated status
   */
  execute(actualAmount = null) {
    const transferred = actualAmount !== null ? actualAmount : this.effectiveAmount;

    const updatedConfig = {
      ...this.toJSON(),
      status: 'completed',
      actualTransferred: transferred,
      history: [
        ...this.history,
        {
          timestamp: Date.now(),
          action: 'executed',
          amount: transferred,
          efficiency: this.efficiency
        }
      ]
    };

    return new ResourceFlow(updatedConfig);
  }

  /**
   * Fail the flow and update status
   * @param {string} reason - Reason for failure
   * @returns {ResourceFlow} New ResourceFlow instance with failed status
   */
  fail(reason = 'Unknown failure') {
    const updatedConfig = {
      ...this.toJSON(),
      status: 'failed',
      history: [
        ...this.history,
        {
          timestamp: Date.now(),
          action: 'failed',
          reason: reason
        }
      ]
    };

    return new ResourceFlow(updatedConfig);
  }

  /**
   * Calculate the efficiency loss compared to ideal transfer
   * @returns {number} Efficiency loss (0.0 = perfect, higher = more loss)
   */
  getEfficiencyLoss() {
    return (this.amount - this.effectiveAmount) / Math.max(this.amount, 1);
  }

  /**
   * Check if this flow is between different nodes
   * @returns {boolean} True if source and target are different
   */
  isInterNodeFlow() {
    return this.sourceNodeId !== this.targetNodeId;
  }

  /**
   * Check if this flow represents production (source = target)
   * @returns {boolean} True if this is a production flow
   */
  isProductionFlow() {
    return this.sourceNodeId === this.targetNodeId && this.flowType === 'production';
  }

  /**
   * Get the flow direction as a string
   * @returns {string} Flow direction description
   */
  getFlowDirection() {
    if (this.isProductionFlow()) {
      return `${this.sourceNodeId} -> production`;
    }
    return `${this.sourceNodeId} -> ${this.targetNodeId}`;
  }

  /**
   * Create a reverse flow (opposite direction)
   * @param {Object} overrides - Properties to override in the reverse flow
   * @returns {ResourceFlow} New ResourceFlow in reverse direction
   */
  createReverseFlow(overrides = {}) {
    return new ResourceFlow({
      sourceNodeId: this.targetNodeId,
      targetNodeId: this.sourceNodeId,
      resourceType: this.resourceType,
      amount: this.actualTransferred || this.effectiveAmount,
      capacity: this.capacity,
      flowType: this.flowType,
      efficiency: this.efficiency,
      metadata: { ...this.metadata, reversed: true },
      ...overrides
    });
  }

  /**
   * Merge this flow with another compatible flow
   * @param {ResourceFlow} other - Another flow to merge with
   * @returns {ResourceFlow} New merged flow
   */
  mergeWith(other) {
    if (!this.canMergeWith(other)) {
      throw new ValidationError('merge', other, 'Flows cannot be merged - incompatible properties');
    }

    return new ResourceFlow({
      sourceNodeId: this.sourceNodeId,
      targetNodeId: this.targetNodeId,
      resourceType: this.resourceType,
      amount: this.amount + other.amount,
      capacity: Math.min(this.capacity, other.capacity),
      flowType: this.flowType,
      efficiency: Math.min(this.efficiency, other.efficiency),
      metadata: { ...this.metadata, merged: true, mergeCount: (this.metadata.mergeCount || 1) + 1 }
    });
  }

  /**
   * Check if this flow can be merged with another
   * @param {ResourceFlow} other - Flow to check compatibility with
   * @returns {boolean} True if flows can be merged
   */
  canMergeWith(other) {
    return other instanceof ResourceFlow &&
           this.sourceNodeId === other.sourceNodeId &&
           this.targetNodeId === other.targetNodeId &&
           this.resourceType === other.resourceType &&
           this.flowType === other.flowType &&
           this.status === 'pending' &&
           other.status === 'pending';
  }

  /**
   * Get flow metrics for analysis
   * @returns {Object} Flow metrics
   */
  getMetrics() {
    return {
      id: this.id,
      resourceType: this.resourceType,
      flowType: this.flowType,
      requestedAmount: this.amount,
      effectiveAmount: this.effectiveAmount,
      actualTransferred: this.actualTransferred,
      efficiency: this.efficiency,
      efficiencyLoss: this.getEfficiencyLoss(),
      capacityUtilization: this.capacity > 0 ? this.effectiveAmount / this.capacity : 0,
      isInterNode: this.isInterNodeFlow(),
      isProduction: this.isProductionFlow(),
      status: this.status,
      age: Date.now() - this.timestamp
    };
  }

  /**
   * Convert to JSON representation
   * @returns {Object} JSON-serializable object
   */
  toJSON() {
    return {
      id: this.id,
      sourceNodeId: this.sourceNodeId,
      targetNodeId: this.targetNodeId,
      resourceType: this.resourceType,
      amount: this.amount,
      capacity: this.capacity,
      flowType: this.flowType,
      efficiency: this.efficiency,
      effectiveAmount: this.effectiveAmount,
      status: this.status,
      actualTransferred: this.actualTransferred,
      metadata: { ...this.metadata },
      timestamp: this.timestamp,
      history: [...this.history]
    };
  }

  /**
   * Create ResourceFlow from JSON
   * @param {Object} data - JSON data
   * @returns {ResourceFlow} New ResourceFlow instance
   */
  static fromJSON(data) {
    return new ResourceFlow(data);
  }

  /**
   * Create a production flow (source = target)
   * @param {string} nodeId - Node ID for production
   * @param {string} resourceType - Type of resource produced
   * @param {number} amount - Amount produced
   * @param {Object} options - Additional options
   * @returns {ResourceFlow} Production flow
   */
  static createProductionFlow(nodeId, resourceType, amount, options = {}) {
    return new ResourceFlow({
      sourceNodeId: nodeId,
      targetNodeId: nodeId,
      resourceType,
      amount,
      flowType: 'production',
      ...options
    });
  }

  /**
   * Create a trade flow between nodes
   * @param {string} sourceNodeId - Source node ID
   * @param {string} targetNodeId - Target node ID
   * @param {string} resourceType - Type of resource traded
   * @param {number} amount - Amount traded
   * @param {Object} options - Additional options
   * @returns {ResourceFlow} Trade flow
   */
  static createTradeFlow(sourceNodeId, targetNodeId, resourceType, amount, options = {}) {
    return new ResourceFlow({
      sourceNodeId,
      targetNodeId,
      resourceType,
      amount,
      flowType: 'trade',
      ...options
    });
  }
}

export default ResourceFlow;