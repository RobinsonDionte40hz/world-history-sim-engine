// src/domain/entities/Node.js

import Position from './Position.js';
import Interaction from './interaction.js';

class Node {
  constructor(config = {}) {
    this.id = config.id || crypto.randomUUID();  // Unique ID for referencing
    this.name = config.name || 'Unnamed Node';
    this.description = config.description || '';
    this.type = config.type || 'location';  // e.g., 'location', 'narrative', 'decision' (from Paper2)
    this.position = new Position(config.position || {});  // Spatial data (reused from old spatial relationships)
    this.interactions = (config.interactions || []).map(i => new Interaction(i));  // Array of interactions available here
    this.resources = config.resources || {};  // e.g., { food: 50, wood: 30 }
    this.environment = config.environment || { density: 0.5 };  // Influences coherence (quantum-inspired)
    this.connectedNodes = config.connectedNodes || [];  // Array of node IDs for navigation

    // Freeze to enforce immutability where possible
    Object.freeze(this);
  }

  // Check if an interaction is available in this node
  hasInteraction(interactionId) {
    return this.interactions.some(i => i.id === interactionId);
  }

  // Get available interactions for a character (filtered by requirements)
  getAvailableInteractions(character) {
    return this.interactions.filter(i => i.meetsRequirements(character) && i.isAvailable(Date.now()));
  }

  // Quantum-inspired method: Environment factor for coherence adjustment
  getEnvironmentFactor() {
    // Simulate water shielding (papers' 0.28 nm spacing) with density
    return this.environment.density || 0.5;  // 0-1 range, higher density = better shielding
  }

  // Serialize for persistence (match old JSON format)
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      position: this.position.toJSON(),
      interactions: this.interactions.map(i => i.toJSON()),
      resources: this.resources,
      environment: this.environment,
      connectedNodes: this.connectedNodes,
    };
  }
}

export default Node;