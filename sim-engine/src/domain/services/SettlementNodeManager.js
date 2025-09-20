/**
 * Settlement Node Manager Service
 *
 * Manages the assignment of nodes to settlements, validates expansion capacity,
 * and coordinates settlement-node relationships in the multi-node settlement system.
 */

import BaseDomainService from './BaseDomainService.js';

class SettlementNodeManager extends BaseDomainService {
  constructor() {
    super();
    this.settlementNodeMap = new Map(); // settlementId -> Set of nodeIds
    this.nodeSettlementMap = new Map(); // nodeId -> settlementId
    this.expansionValidators = new Map(); // settlementId -> validator function
  }

  /**
   * Assigns a node to a settlement
   * @param {string} settlementId - ID of the settlement
   * @param {string} nodeId - ID of the node to assign
   * @param {string} role - Role of the node ('core', 'district', 'outpost')
   * @param {Object} settlement - Settlement object
   * @param {Object} node - Node object
   * @returns {Object} Assignment result
   */
  assignNodeToSettlement(settlementId, nodeId, role = 'district', settlement, node) {
    try {
      // Validate settlement exists
      if (!settlement) {
        throw new Error(`Settlement ${settlementId} not found`);
      }

      // Validate node exists
      if (!node) {
        throw new Error(`Node ${nodeId} not found`);
      }

      // Check if node is already assigned to another settlement
      if (this.nodeSettlementMap.has(nodeId)) {
        const currentSettlementId = this.nodeSettlementMap.get(nodeId);
        if (currentSettlementId !== settlementId) {
          throw new Error(`Node ${nodeId} is already assigned to settlement ${currentSettlementId}`);
        }
      }

      // Validate settlement can accept more nodes
      if (!settlement.canExpand()) {
        throw new Error(`Settlement ${settlementId} has reached maximum node capacity (${settlement.nodeCapacity})`);
      }

      // Validate role assignment
      this._validateRoleAssignment(settlement, nodeId, role);

      // Perform the assignment
      settlement.addNode(nodeId, role);
      node.assignToSettlement(settlementId, role, settlement.settlementEffects);

      // Update internal maps
      if (!this.settlementNodeMap.has(settlementId)) {
        this.settlementNodeMap.set(settlementId, new Set());
      }
      this.settlementNodeMap.get(settlementId).add(nodeId);
      this.nodeSettlementMap.set(nodeId, settlementId);

      return {
        success: true,
        message: `Node ${nodeId} assigned to settlement ${settlementId} as ${role}`,
        settlementId,
        nodeId,
        role,
        settlementCapacity: settlement.nodeCapacity,
        settlementNodeCount: settlement.nodes.size
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        settlementId,
        nodeId
      };
    }
  }

  /**
   * Removes a node from a settlement
   * @param {string} settlementId - ID of the settlement
   * @param {string} nodeId - ID of the node to remove
   * @param {Object} settlement - Settlement object
   * @param {Object} node - Node object
   * @returns {Object} Removal result
   */
  removeNodeFromSettlement(settlementId, nodeId, settlement, node) {
    try {
      // Validate settlement exists
      if (!settlement) {
        throw new Error(`Settlement ${settlementId} not found`);
      }

      // Validate node exists
      if (!node) {
        throw new Error(`Node ${nodeId} not found`);
      }

      // Check if node belongs to the settlement
      if (!settlement.nodes.has(nodeId)) {
        throw new Error(`Node ${nodeId} does not belong to settlement ${settlementId}`);
      }

      // Perform the removal
      settlement.removeNode(nodeId);
      node.removeFromSettlement();

      // Update internal maps
      if (this.settlementNodeMap.has(settlementId)) {
        this.settlementNodeMap.get(settlementId).delete(nodeId);
        if (this.settlementNodeMap.get(settlementId).size === 0) {
          this.settlementNodeMap.delete(settlementId);
        }
      }
      this.nodeSettlementMap.delete(nodeId);

      return {
        success: true,
        message: `Node ${nodeId} removed from settlement ${settlementId}`,
        settlementId,
        nodeId,
        settlementCapacity: settlement.nodeCapacity,
        settlementNodeCount: settlement.nodes.size
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        settlementId,
        nodeId
      };
    }
  }

  /**
   * Gets all nodes belonging to a settlement
   * @param {string} settlementId - ID of the settlement
   * @returns {Array} Array of node IDs
   */
  getSettlementNodes(settlementId) {
    const nodeSet = this.settlementNodeMap.get(settlementId);
    return nodeSet ? Array.from(nodeSet) : [];
  }

  /**
   * Gets the settlement ID for a node
   * @param {string} nodeId - ID of the node
   * @returns {string|null} Settlement ID or null if not assigned
   */
  getNodeSettlement(nodeId) {
    return this.nodeSettlementMap.get(nodeId) || null;
  }

  /**
   * Checks if a node can be assigned to a settlement
   * @param {string} settlementId - ID of the settlement
   * @param {string} nodeId - ID of the node
   * @param {Object} settlement - Settlement object
   * @param {Object} node - Node object
   * @returns {Object} Validation result
   */
  canAssignNode(settlementId, nodeId, settlement, node) {
    const issues = [];

    // Check if settlement exists
    if (!settlement) {
      issues.push('Settlement not found');
      return { canAssign: false, issues };
    }

    // Check if node exists
    if (!node) {
      issues.push('Node not found');
      return { canAssign: false, issues };
    }

    // Check if node is already assigned to another settlement
    const currentSettlementId = this.getNodeSettlement(nodeId);
    if (currentSettlementId && currentSettlementId !== settlementId) {
      issues.push(`Node is already assigned to settlement ${currentSettlementId}`);
    }

    // Check settlement capacity
    if (!settlement.canExpand()) {
      issues.push(`Settlement has reached maximum capacity (${settlement.nodeCapacity} nodes)`);
    }

    // Check node connectivity (nodes should be connected for realistic settlements)
    const settlementNodes = this.getSettlementNodes(settlementId);
    if (settlementNodes.length > 0) {
      const isConnected = this._checkNodeConnectivity(nodeId, settlementNodes, node);
      if (!isConnected) {
        issues.push('Node is not connected to existing settlement nodes');
      }
    }

    return {
      canAssign: issues.length === 0,
      issues
    };
  }

  /**
   * Validates settlement expansion possibilities
   * @param {string} settlementId - ID of the settlement
   * @param {Object} settlement - Settlement object
   * @param {Array} allNodes - Array of all available nodes
   * @returns {Object} Expansion analysis
   */
  analyzeExpansionPossibilities(settlementId, settlement, allNodes) {
    const currentNodes = this.getSettlementNodes(settlementId);
    const availableSlots = settlement.getAvailableNodeSlots();

    if (availableSlots === 0) {
      return {
        canExpand: false,
        availableSlots: 0,
        possibleExpansions: [],
        reason: 'Settlement at maximum capacity'
      };
    }

    // Find nodes that could potentially be added
    const possibleExpansions = [];
    for (const node of allNodes) {
      // Skip nodes already in settlements
      if (this.getNodeSettlement(node.id)) {
        continue;
      }

      const validation = this.canAssignNode(settlementId, node.id, settlement, node);
      if (validation.canAssign) {
        possibleExpansions.push({
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          distance: this._calculateNodeDistance(node, currentNodes, allNodes),
          suitability: this._calculateExpansionSuitability(node, settlement)
        });
      }
    }

    // Sort by suitability and distance
    possibleExpansions.sort((a, b) => {
      if (Math.abs(a.suitability - b.suitability) > 0.1) {
        return b.suitability - a.suitability; // Higher suitability first
      }
      return a.distance - b.distance; // Closer distance first
    });

    return {
      canExpand: possibleExpansions.length > 0,
      availableSlots,
      possibleExpansions: possibleExpansions.slice(0, 10), // Top 10 options
      totalPossible: possibleExpansions.length
    };
  }

  /**
   * Updates settlement effects on all constituent nodes
   * @param {string} settlementId - ID of the settlement
   * @param {Object} settlement - Settlement object
   * @param {Array} allNodes - Array of all nodes
   * @returns {Object} Update result
   */
  updateSettlementEffects(settlementId, settlement, allNodes) {
    try {
      const settlementNodes = this.getSettlementNodes(settlementId);
      const updatedNodes = [];

      for (const nodeId of settlementNodes) {
        const node = allNodes.find(n => n.id === nodeId);
        if (node) {
          node.updateSettlementEffects(settlement.settlementEffects);
          updatedNodes.push(nodeId);
        }
      }

      return {
        success: true,
        message: `Updated settlement effects for ${updatedNodes.length} nodes`,
        settlementId,
        updatedNodes,
        effects: settlement.settlementEffects
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        settlementId
      };
    }
  }

  /**
   * Validates role assignment for a node
   * @private
   */
  _validateRoleAssignment(settlement, nodeId, role) {
    const validRoles = ['core', 'district', 'outpost'];

    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role '${role}'. Must be one of: ${validRoles.join(', ')}`);
    }

    // Core node validation
    if (role === 'core') {
      if (settlement.coreNodeId && settlement.coreNodeId !== nodeId) {
        throw new Error('Settlement already has a core node');
      }
    }

    // District/outpost validation
    if (['district', 'outpost'].includes(role)) {
      if (!settlement.coreNodeId) {
        throw new Error('Cannot assign district/outpost role: settlement has no core node');
      }
    }
  }

  /**
   * Checks if a node is connected to existing settlement nodes
   * @private
   */
  _checkNodeConnectivity(nodeId, settlementNodes, node) {
    // If this is the first node, it's automatically connected
    if (settlementNodes.length === 0) {
      return true;
    }

    // Check if node has connections to any settlement nodes
    const connectedNodeIds = node.getConnectedNodeIds();
    return settlementNodes.some(settlementNodeId => connectedNodeIds.includes(settlementNodeId));
  }

  /**
   * Calculates distance from a node to the nearest settlement node
   * @private
   */
  _calculateNodeDistance(node, settlementNodes, allNodes) {
    // Simplified distance calculation based on connection hops
    // In a real implementation, this would use actual spatial distance
    let minDistance = Infinity;

    for (const settlementNodeId of settlementNodes) {
      const settlementNode = allNodes.find(n => n.id === settlementNodeId);
      if (!settlementNode) continue;

      if (node.isConnectedTo(settlementNodeId)) {
        return 1; // Direct connection
      }

      // Check for indirect connections (simplified)
      const distance = this._calculateConnectionDistance(node, settlementNode, allNodes, new Set());
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    return minDistance === Infinity ? 10 : minDistance; // Default distance if no connection found
  }

  /**
   * Calculates connection distance between two nodes
   * @private
   */
  _calculateConnectionDistance(node1, node2, allNodes, visited = new Set()) {
    if (node1.isConnectedTo(node2.id)) {
      return 1;
    }

    visited.add(node1.id);
    let minDistance = Infinity;

    for (const connectedId of node1.getConnectedNodeIds()) {
      if (visited.has(connectedId)) continue;

      const connectedNode = allNodes.find(n => n.id === connectedId);
      if (!connectedNode) continue;

      const distance = this._calculateConnectionDistance(connectedNode, node2, allNodes, new Set(visited));
      if (distance < minDistance) {
        minDistance = distance + 1;
      }
    }

    return minDistance;
  }

  /**
   * Calculates how suitable a node is for settlement expansion
   * @private
   */
  _calculateExpansionSuitability(node, settlement) {
    let suitability = 0;

    // Environmental suitability
    if (node.environment.climate === 'temperate') suitability += 0.3;
    if (node.environment.terrain === 'plains') suitability += 0.2;
    if (node.environment.waterAvailability > 0.7) suitability += 0.2;

    // Population capacity
    const capacityRatio = node.getPopulationCapacity() / 100; // Normalize to expected capacity
    suitability += Math.min(capacityRatio * 0.2, 0.2);

    // Resource availability
    if (node.resources && node.resources.length > 0) {
      suitability += 0.1;
    }

    // Type suitability
    if (node.type === 'settlement') suitability += 0.2;
    if (node.type === 'resource') suitability += 0.1;

    // Danger penalty
    const danger = node.getEnvironmentalDanger();
    suitability -= danger * 0.1;

    return Math.max(0, Math.min(1, suitability));
  }

  /**
   * Gets statistics about settlement-node relationships
   * @returns {Object} Statistics
   */
  getStatistics() {
    const settlementStats = [];
    let totalNodes = 0;

    for (const [settlementId, nodeSet] of this.settlementNodeMap) {
      const nodeCount = nodeSet.size;
      totalNodes += nodeCount;

      settlementStats.push({
        settlementId,
        nodeCount,
        nodes: Array.from(nodeSet)
      });
    }

    return {
      totalSettlements: this.settlementNodeMap.size,
      totalAssignedNodes: totalNodes,
      settlements: settlementStats,
      averageNodesPerSettlement: this.settlementNodeMap.size > 0 ?
        totalNodes / this.settlementNodeMap.size : 0
    };
  }
}

export default SettlementNodeManager;