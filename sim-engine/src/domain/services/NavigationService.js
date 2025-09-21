// src/domain/services/NavigationService.js

class NavigationService {
  constructor() {
    this.movementCache = new Map(); // Cache pathfinding results
  }

  /**
   * Find all possible movement options for a character
   * @param {Character} character - The character attempting to move
   * @param {Object} worldState - Current world state
   * @param {Object} perception - Character's perception data
   * @returns {Array} Array of movement options with costs and requirements
   */
  getMovementOptions(character, worldState, perception) {
    const options = [];
    const currentNode = perception.currentNode;
    
    if (!currentNode) return options;

    // Get connected nodes within movement range
    const reachableNodes = this.getReachableNodes(
      character,
      currentNode,
      worldState.nodes,
      perception
    );

    reachableNodes.forEach(({ node, path, cost, difficulty }) => {
      const canMove = this.canMoveTo(character, node, cost, difficulty);
      
      options.push({
        targetNodeId: node.id,
        targetNodeName: node.name,
        path,
        movementCost: cost,
        difficulty,
        canMove,
        requirements: this.getMovementRequirements(character, node, cost, difficulty),
        estimatedTime: this.calculateTravelTime(character, cost, difficulty)
      });
    });

    return options.sort((a, b) => a.movementCost - b.movementCost);
  }

  /**
   * Get nodes reachable in one turn
   */
  getReachableNodes(character, currentNode, allNodes, perception) {
    const reachable = [];
    const movementRange = this.calculateMovementRange(character);
    
    // Direct connections (one hop)
    const connections = this.getNodeConnections(currentNode, allNodes);
    
    connections.forEach(conn => {
      const targetNode = allNodes.find(n => n.id === conn.targetNodeId);
      if (!targetNode) return;
      
      const cost = this.calculateMovementCost(
        character,
        currentNode,
        targetNode,
        conn,
        perception.environmentalFactors
      );
      
      if (cost <= movementRange) {
        reachable.push({
          node: targetNode,
          path: [currentNode.id, targetNode.id],
          cost,
          difficulty: conn.difficulty || 1
        });
      }
    });

    // Multi-hop paths if character has high mobility
    if (character.attributes?.dexterity > 14 || (Array.isArray(character.skills) && character.skills.includes('pathfinding'))) {
      const multiHopPaths = this.findMultiHopPaths(
        character,
        currentNode,
        allNodes,
        movementRange,
        2 // Max 2 hops per turn
      );
      reachable.push(...multiHopPaths);
    }

    return reachable;
  }

  /**
   * Calculate character's movement range per turn
   */
  calculateMovementRange(character) {
    const baseMobility = 1; // Base: can move to 1 adjacent node
    
    // Dexterity bonus
    const dexBonus = character.attributes?.dexterity 
      ? Math.floor((character.attributes.dexterity - 10) / 5) * 0.25 
      : 0;
    
    // Constitution affects endurance
    const conBonus = character.attributes?.constitution
      ? Math.floor((character.attributes.constitution - 10) / 5) * 0.15
      : 0;
    
    // Energy level affects mobility
    const energyFactor = (character.energy || 50) / 100;
    
    // Consciousness coherence affects navigation ability
    const coherenceFactor = character.consciousness?.coherence || 0.5;
    
    return Math.max(0.5, baseMobility + dexBonus + conBonus) * energyFactor * (0.5 + coherenceFactor * 0.5);
  }

  /**
   * Calculate cost to move between nodes
   */
  calculateMovementCost(character, fromNode, toNode, connection, environmentalFactors) {
    let baseCost = connection.distance || 1;
    
    // Terrain difficulty
    baseCost *= connection.difficulty || 1;
    
    // Environmental conditions at origin
    if (environmentalFactors) {
      // Density makes movement harder
      baseCost *= (1 + environmentalFactors.density * 0.5);
      
      // Weather affects travel
      if (environmentalFactors.weather?.severity > 0.5) {
        baseCost *= (1 + environmentalFactors.weather.severity);
      }
      
      // Danger makes characters cautious (slower)
      if (environmentalFactors.danger > 0.5) {
        baseCost *= (1 + environmentalFactors.danger * 0.3);
      }
    }
    
    // Target node conditions
    const targetDensity = toNode.environment?.density || 0.5;
    baseCost *= (1 + targetDensity * 0.3);
    
    // Character condition affects movement
    const healthFactor = (character.health || 100) / 100;
    const energyFactor = (character.energy || 50) / 100;
    baseCost /= (healthFactor * 0.5 + energyFactor * 0.5);
    
    return baseCost;
  }

  /**
   * Check if character can move to target node
   */
  canMoveTo(character, targetNode, cost, difficulty) {
    // Check energy requirement
    const energyCost = cost * 10; // Each movement point costs 10 energy
    if ((character.energy || 50) < energyCost) {
      return false;
    }
    
    // Check if difficulty is too high
    const maxDifficulty = this.getMaxTraversableDifficulty(character);
    if (difficulty > maxDifficulty) {
      return false;
    }
    
    // Check for node-specific restrictions
    if (targetNode.restricted && !this.hasAccess(character, targetNode)) {
      return false;
    }
    
    return true;
  }

  /**
   * Get maximum terrain difficulty character can traverse
   */
  getMaxTraversableDifficulty(character) {
    let maxDifficulty = 3; // Base difficulty
    
    // Strength helps with difficult terrain
    if (character.attributes?.strength > 12) {
      maxDifficulty += Math.floor((character.attributes.strength - 12) / 3);
    }
    
    // Skills help
    if (character.skills?.includes('climbing')) maxDifficulty += 2;
    if (character.skills?.includes('survival')) maxDifficulty += 1;
    
    return maxDifficulty;
  }

  /**
   * Check if character has access to restricted node
   */
  hasAccess(character, node) {
    // Check faction/alignment requirements
    if (node.requiredAlignment && character.alignment?.moral !== node.requiredAlignment) {
      return false;
    }
    
    // Check relationship requirements
    if (node.requiredRelationship) {
      const relationship = character.relationships?.get(node.ownerId);
      if (!relationship || relationship.trust < node.requiredRelationship) {
        return false;
      }
    }
    
    // Check key items
    if (node.requiredItem && !character.inventory?.includes(node.requiredItem)) {
      return false;
    }
    
    return true;
  }

  /**
   * Get movement requirements for UI display
   */
  getMovementRequirements(character, targetNode, cost, difficulty) {
    const requirements = [];
    
    const energyCost = cost * 10;
    requirements.push({
      type: 'energy',
      required: energyCost,
      current: character.energy || 50,
      met: (character.energy || 50) >= energyCost
    });
    
    if (difficulty > 1) {
      const maxDifficulty = this.getMaxTraversableDifficulty(character);
      requirements.push({
        type: 'difficulty',
        required: difficulty,
        current: maxDifficulty,
        met: difficulty <= maxDifficulty
      });
    }
    
    if (targetNode.restricted) {
      requirements.push({
        type: 'access',
        description: 'Restricted area',
        met: this.hasAccess(character, targetNode)
      });
    }
    
    return requirements;
  }

  /**
   * Calculate travel time in ticks
   */
  calculateTravelTime(character, cost, difficulty) {
    // Base time is cost in ticks
    let time = Math.ceil(cost);
    
    // High intelligence helps with navigation (reduces time)
    if (character.attributes?.intelligence > 12) {
      time *= (1 - (character.attributes.intelligence - 12) * 0.02);
    }
    
    // Difficult terrain takes longer
    time *= (1 + (difficulty - 1) * 0.5);
    
    return Math.max(1, Math.ceil(time));
  }

  /**
   * Get node connections with enhanced data
   */
  getNodeConnections(node, allNodes) {
    const connections = [];
    
    // Handle both old connectedNodes array and new connections array
    if (node.connections && Array.isArray(node.connections)) {
      // New format with rich connection data
      return node.connections;
    } else if (node.connectedNodes && Array.isArray(node.connectedNodes)) {
      // Old format - just node IDs, create basic connections
      node.connectedNodes.forEach(targetId => {
        connections.push({
          targetNodeId: targetId,
          type: 'path',
          distance: 1,
          difficulty: 1
        });
      });
    }
    
    return connections;
  }

  /**
   * Find multi-hop paths within range
   */
  findMultiHopPaths(character, startNode, allNodes, maxCost, maxHops) {
    const paths = [];
    const visited = new Set([startNode.id]);
    
    const search = (currentNode, path, totalCost, hops) => {
      if (hops >= maxHops || totalCost >= maxCost) return;
      
      const connections = this.getNodeConnections(currentNode, allNodes);
      
      connections.forEach(conn => {
        if (visited.has(conn.targetNodeId)) return;
        
        const targetNode = allNodes.find(n => n.id === conn.targetNodeId);
        if (!targetNode) return;
        
        const stepCost = this.calculateMovementCost(
          character,
          currentNode,
          targetNode,
          conn,
          {} // Simplified env factors for multi-hop
        );
        
        const newTotalCost = totalCost + stepCost;
        
        if (newTotalCost <= maxCost) {
          const newPath = [...path, targetNode.id];
          paths.push({
            node: targetNode,
            path: newPath,
            cost: newTotalCost,
            difficulty: conn.difficulty || 1
          });
          
          visited.add(targetNode.id);
          search(targetNode, newPath, newTotalCost, hops + 1);
          visited.delete(targetNode.id);
        }
      });
    };
    
    search(startNode, [startNode.id], 0, 0);
    return paths;
  }

  /**
   * Execute movement and update character state
   */
  executeMovement(character, targetNodeId, worldState) {
    const currentNode = worldState.nodes.find(n => n.id === character.currentNodeId);
    const targetNode = worldState.nodes.find(n => n.id === targetNodeId);
    
    if (!currentNode || !targetNode) {
      throw new Error('Invalid movement: nodes not found');
    }
    
    // Find the movement option
    const perception = { currentNode, environmentalFactors: {} }; // Simplified
    const options = this.getMovementOptions(character, worldState, perception);
    const movement = options.find(opt => opt.targetNodeId === targetNodeId);
    
    if (!movement || !movement.canMove) {
      throw new Error('Invalid movement: requirements not met');
    }
    
    // Deduct energy cost
    const energyCost = movement.movementCost * 10;
    character.energy = Math.max(0, (character.energy || 50) - energyCost);
    
    // Update character location
    const previousNodeId = character.currentNodeId;
    character.currentNodeId = targetNodeId;
    
    // Update node populations
    if (currentNode.population !== undefined) {
      currentNode.population = Math.max(0, currentNode.population - 1);
    }
    if (targetNode.population !== undefined) {
      targetNode.population += 1;
    }
    
    // Return movement result for history/logging
    return {
      characterId: character.id,
      characterName: character.name,
      from: {
        nodeId: previousNodeId,
        nodeName: currentNode.name
      },
      to: {
        nodeId: targetNodeId,
        nodeName: targetNode.name
      },
      cost: movement.movementCost,
      energySpent: energyCost,
      travelTime: movement.estimatedTime,
      timestamp: worldState.time
    };
  }

  /**
   * Find shortest path between two nodes (for AI planning)
   */
  findPath(fromNodeId, toNodeId, allNodes, character = null) {
    const cacheKey = `${fromNodeId}-${toNodeId}`;
    
    // Check cache
    if (this.movementCache.has(cacheKey)) {
      const cached = this.movementCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
        return cached.path;
      }
    }
    
    // A* pathfinding
    const path = this.aStarSearch(fromNodeId, toNodeId, allNodes, character);
    
    // Cache result
    this.movementCache.set(cacheKey, {
      path,
      timestamp: Date.now()
    });
    
    return path;
  }

  /**
   * A* pathfinding implementation
   */
  aStarSearch(startId, goalId, allNodes, character) {
    const openSet = new Map([[startId, { g: 0, f: 0, parent: null }]]);
    const closedSet = new Set();
    
    while (openSet.size > 0) {
      // Get node with lowest f score
      let currentId = null;
      let lowestF = Infinity;
      
      for (const [nodeId, data] of openSet.entries()) {
        if (data.f < lowestF) {
          lowestF = data.f;
          currentId = nodeId;
        }
      }
      
      if (currentId === goalId) {
        // Reconstruct path
        const path = [];
        let current = currentId;
        
        while (current) {
          path.unshift(current);
          const data = openSet.get(current) || closedSet[current];
          current = data?.parent;
        }
        
        return path;
      }
      
      const currentData = openSet.get(currentId);
      openSet.delete(currentId);
      closedSet[currentId] = currentData;
      
      // Check neighbors
      const currentNode = allNodes.find(n => n.id === currentId);
      if (!currentNode) continue;
      
      const connections = this.getNodeConnections(currentNode, allNodes);
      
      connections.forEach(conn => {
        const neighborId = conn.targetNodeId;
        
        if (closedSet[neighborId]) return;
        
        const tentativeG = currentData.g + (conn.distance || 1);
        
        const neighborData = openSet.get(neighborId);
        
        if (!neighborData || tentativeG < neighborData.g) {
          const h = this.heuristic(neighborId, goalId, allNodes);
          
          openSet.set(neighborId, {
            g: tentativeG,
            f: tentativeG + h,
            parent: currentId
          });
        }
      });
    }
    
    return null; // No path found
  }

  /**
   * Heuristic for A* (abstract distance)
   */
  heuristic(nodeId, goalId, allNodes) {
    // Since we're mapless, use connection count as heuristic
    // This is a rough estimate of "hops" needed
    return 1; // Simplified - could be enhanced with node metadata
  }
}

export default NavigationService;