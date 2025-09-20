/**
 * Settlement Entity - Multi-node settlement system
 *
 * Represents a settlement that can encompass multiple interconnected nodes.
 * Development level determines the maximum number of nodes the settlement can contain.
 * Provides bonuses and effects to constituent nodes.
 */

class Settlement {
  constructor(config = {}) {
    this.id = config.id || this._generateId();
    this.name = config.name || 'Unnamed Settlement';
    this.description = config.description || '';
    this.type = config.type || 'village'; // 'village', 'town', 'city', 'kingdom', etc.

    // Multi-node settlement properties
    this.nodes = new Set(config.nodes || []); // Set of node IDs that belong to this settlement
    this.coreNodeId = config.coreNodeId || (config.nodes && config.nodes.length > 0 ? config.nodes[0] : null);
    this.nodeCapacity = config.nodeCapacity || this._calculateNodeCapacity(config.developmentLevel || 1);
    this.nodeAssignments = new Map(config.nodeAssignments || []); // nodeId -> assignment type (core, district, outpost)

    // Development and progression
    this.developmentLevel = config.developmentLevel || 1;
    this.developmentTree = config.developmentTree || {
      completedUpgrades: [],
      availableUpgrades: [],
      upgradeHistory: []
    };

    // Population and demographics (aggregated from constituent nodes)
    this.population = config.population || 0;
    this.populationCap = config.populationCap || 100;
    this.demographics = config.demographics || new Map();

    // Resources and economy (aggregated from constituent nodes)
    this.resources = config.resources || new Map([
      ['food', 0],
      ['water', 0],
      ['materials', 0],
      ['gold', 0],
      ['tools', 0]
    ]);

    // Government and leadership
    this.government = config.government || {
      type: 'council',
      leader: null,
      laws: new Set(),
      policies: new Map()
    };

    // Economy system
    this.economy = config.economy || {
      currency: 'gold',
      markets: new Map(),
      tradeRoutes: new Set(),
      taxes: { rate: 0.1, collected: 0 }
    };

    // Culture and society
    this.culture = config.culture || {
      traditions: new Set(),
      festivals: new Set(),
      language: 'common',
      religion: null,
      morale: 0.5
    };

    // Infrastructure and buildings (aggregated from constituent nodes)
    this.infrastructure = config.infrastructure || new Map([
      ['walls', 0],
      ['market', 0],
      ['temple', 0],
      ['barracks', 0],
      ['tavern', 0]
    ]);

    // Settlement-wide effects on constituent nodes
    this.settlementEffects = config.settlementEffects || {
      defenseBonus: 0,
      economyBonus: 0,
      populationCapacityBonus: 0,
      resourceProductionBonus: 0,
      culturalInfluence: 0
    };

    // Relationships and diplomacy
    this.relationships = config.relationships || new Map();

    // History and events
    this.history = config.history || [];
    this.founded = config.founded || new Date();
    this.lastUpdated = config.lastUpdated || new Date();

    // Metadata
    this.metadata = config.metadata || {};
  }

  /**
   * Generates a unique ID for the settlement
   * @private
   */
  _generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `settlement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculates node capacity based on development level
   * @param {number} developmentLevel - Current development level
   * @returns {number} Maximum number of nodes
   * @private
   */
  _calculateNodeCapacity(developmentLevel) {
    // Capacity scaling based on development level
    if (developmentLevel <= 1) return 1;      // Core only
    if (developmentLevel <= 2) return 2;      // Core + 1 district
    if (developmentLevel <= 3) return 4;      // Core + 3 districts
    if (developmentLevel <= 4) return 7;      // Core + 6 districts
    if (developmentLevel <= 5) return 11;     // Core + 10 districts

    // Level 6+: 11 + (level-5) * 5 nodes
    return 11 + (developmentLevel - 5) * 5;
  }

  /**
   * Adds a node to the settlement
   * @param {string} nodeId - ID of the node to add
   * @param {string} assignmentType - Type of assignment ('core', 'district', 'outpost')
   * @returns {boolean} True if node was added successfully
   */
  addNode(nodeId, assignmentType = 'district') {
    if (this.nodes.size >= this.nodeCapacity) {
      throw new Error(`Settlement has reached maximum node capacity of ${this.nodeCapacity}`);
    }

    if (this.nodes.has(nodeId)) {
      throw new Error(`Node ${nodeId} is already part of this settlement`);
    }

    // If this is the first node, make it the core
    if (this.nodes.size === 0) {
      assignmentType = 'core';
      this.coreNodeId = nodeId;
    }

    // If assigning as core but we already have a core, reject
    if (assignmentType === 'core' && this.coreNodeId && this.coreNodeId !== nodeId) {
      throw new Error('Settlement already has a core node');
    }

    this.nodes.add(nodeId);
    this.nodeAssignments.set(nodeId, assignmentType);

    this.lastUpdated = new Date();
    return true;
  }

  /**
   * Removes a node from the settlement
   * @param {string} nodeId - ID of the node to remove
   * @returns {boolean} True if node was removed successfully
   */
  removeNode(nodeId) {
    if (!this.nodes.has(nodeId)) {
      throw new Error(`Node ${nodeId} is not part of this settlement`);
    }

    // Cannot remove core node if there are other nodes
    if (nodeId === this.coreNodeId && this.nodes.size > 1) {
      throw new Error('Cannot remove core node while settlement has other nodes');
    }

    this.nodes.delete(nodeId);
    this.nodeAssignments.delete(nodeId);

    // If we removed the core node and there are no nodes left, clear core
    if (nodeId === this.coreNodeId && this.nodes.size === 0) {
      this.coreNodeId = null;
    }

    // If we removed the core node but there are still nodes, assign a new core
    if (nodeId === this.coreNodeId && this.nodes.size > 0) {
      const newCoreId = this.nodes.values().next().value;
      this.coreNodeId = newCoreId;
      this.nodeAssignments.set(newCoreId, 'core');
    }

    this.lastUpdated = new Date();
    return true;
  }

  /**
   * Gets the assignment type of a node
   * @param {string} nodeId - Node ID
   * @returns {string|null} Assignment type or null if not found
   */
  getNodeAssignment(nodeId) {
    return this.nodeAssignments.get(nodeId) || null;
  }

  /**
   * Gets all nodes of a specific assignment type
   * @param {string} assignmentType - Assignment type to filter by
   * @returns {Array} Array of node IDs
   */
  getNodesByAssignment(assignmentType) {
    const result = [];
    for (const [nodeId, assignment] of this.nodeAssignments) {
      if (assignment === assignmentType) {
        result.push(nodeId);
      }
    }
    return result;
  }

  /**
   * Updates the development level and recalculates node capacity
   * @param {number} newLevel - New development level
   */
  updateDevelopmentLevel(newLevel) {
    this.developmentLevel = newLevel;
    this.nodeCapacity = this._calculateNodeCapacity(newLevel);
    this.lastUpdated = new Date();
  }

  /**
   * Checks if the settlement can add more nodes
   * @returns {boolean} True if settlement can expand
   */
  canExpand() {
    return this.nodes.size < this.nodeCapacity;
  }

  /**
   * Gets the number of available node slots
   * @returns {number} Number of available slots
   */
  getAvailableNodeSlots() {
    return Math.max(0, this.nodeCapacity - this.nodes.size);
  }

  /**
   * Calculates settlement-wide bonuses based on development and infrastructure
   * @returns {Object} Settlement effects
   */
  calculateSettlementEffects() {
    const effects = {
      defenseBonus: 0,
      economyBonus: 0,
      populationCapacityBonus: 0,
      resourceProductionBonus: 0,
      culturalInfluence: 0
    };

    // Base bonuses from development level
    effects.defenseBonus = this.developmentLevel * 0.1;
    effects.economyBonus = this.developmentLevel * 0.15;
    effects.populationCapacityBonus = this.developmentLevel * 20;
    effects.resourceProductionBonus = this.developmentLevel * 0.2;
    effects.culturalInfluence = this.developmentLevel * 0.05;

    // Infrastructure bonuses
    const walls = this.infrastructure.get('walls') || 0;
    const market = this.infrastructure.get('market') || 0;
    const temple = this.infrastructure.get('temple') || 0;
    const barracks = this.infrastructure.get('barracks') || 0;

    effects.defenseBonus += walls * 0.2;
    effects.economyBonus += market * 0.3;
    effects.culturalInfluence += temple * 0.4;
    effects.defenseBonus += barracks * 0.5;

    // Node count bonuses (more nodes = more diverse settlement)
    const nodeBonus = Math.min(this.nodes.size * 0.1, 1.0); // Cap at 100% bonus
    effects.economyBonus += nodeBonus;
    effects.culturalInfluence += nodeBonus * 0.5;

    this.settlementEffects = effects;
    return effects;
  }

  /**
   * Aggregates data from constituent nodes
   * @param {Array} nodes - Array of node objects
   */
  aggregateNodeData(nodes) {
    // Reset aggregated values
    this.population = 0;
    this.resources.clear();
    this.infrastructure.clear();

    // Aggregate from constituent nodes
    for (const nodeId of this.nodes) {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      // Aggregate population
      this.population += node.population || 0;

      // Aggregate resources (simplified - in real implementation would use more complex logic)
      if (node.resources) {
        for (const [resource, amount] of Object.entries(node.resources)) {
          const current = this.resources.get(resource) || 0;
          this.resources.set(resource, current + amount);
        }
      }

      // Aggregate infrastructure from node type and properties
      if (node.type === 'settlement') {
        // Add infrastructure based on node's environmental properties
        const shelter = node.environment?.shelterQuality || 0;
        const currentWalls = this.infrastructure.get('walls') || 0;
        this.infrastructure.set('walls', currentWalls + Math.floor(shelter * 2));
      }
    }

    // Apply settlement-wide bonuses
    this.calculateSettlementEffects();

    this.lastUpdated = new Date();
  }

  /**
   * Gets settlement statistics
   * @returns {Object} Settlement statistics
   */
  getStatistics() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      developmentLevel: this.developmentLevel,
      nodeCount: this.nodes.size,
      nodeCapacity: this.nodeCapacity,
      availableSlots: this.getAvailableNodeSlots(),
      population: this.population,
      populationCap: this.populationCap,
      canExpand: this.canExpand(),
      settlementEffects: { ...this.settlementEffects },
      coreNodeId: this.coreNodeId,
      nodeAssignments: Object.fromEntries(this.nodeAssignments)
    };
  }

  /**
   * Serializes the settlement to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      nodes: Array.from(this.nodes),
      coreNodeId: this.coreNodeId,
      nodeCapacity: this.nodeCapacity,
      nodeAssignments: Array.from(this.nodeAssignments.entries()),
      developmentLevel: this.developmentLevel,
      developmentTree: this.developmentTree,
      population: this.population,
      populationCap: this.populationCap,
      demographics: Array.from(this.demographics.entries()),
      resources: Array.from(this.resources.entries()),
      government: this.government,
      economy: this.economy,
      culture: this.culture,
      infrastructure: Array.from(this.infrastructure.entries()),
      settlementEffects: this.settlementEffects,
      relationships: Array.from(this.relationships.entries()),
      history: this.history,
      founded: this.founded.toISOString(),
      lastUpdated: this.lastUpdated.toISOString(),
      metadata: this.metadata
    };
  }

  /**
   * Creates a Settlement instance from JSON data
   * @param {Object} data - JSON data
   * @returns {Settlement} New Settlement instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for Settlement');
    }

    const config = {
      ...data,
      nodes: new Set(data.nodes || []),
      nodeAssignments: new Map(data.nodeAssignments || []),
      demographics: new Map(data.demographics || []),
      resources: new Map(data.resources || []),
      infrastructure: new Map(data.infrastructure || []),
      relationships: new Map(data.relationships || []),
      founded: data.founded ? new Date(data.founded) : new Date(),
      lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date()
    };

    return new Settlement(config);
  }

  /**
   * Creates a deep copy of the settlement
   * @returns {Settlement} New Settlement instance
   */
  clone() {
    const jsonData = this.toJSON();
    jsonData.id = this._generateId();
    jsonData.name = `${this.name} (Copy)`;
    jsonData.founded = new Date().toISOString();
    jsonData.lastUpdated = new Date().toISOString();

    return Settlement.fromJSON(jsonData);
  }
}

export default Settlement;