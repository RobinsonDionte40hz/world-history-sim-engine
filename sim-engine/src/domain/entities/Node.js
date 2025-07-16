// src/domain/entities/Node.js
// Update the Node class to ensure proper serialization/deserialization

import Position from '../value-objects/Positions.js';
import Interaction from './Interaction.js';

class Node {
  constructor(config = {}) {
    this.id = config.id || this._generateId();
    this.name = config.name || 'Unnamed Node';
    this.description = config.description || '';
    this.type = config.type || 'location';
    this.position = config.position instanceof Position ? 
      config.position : new Position(config.position || {});
    
    // Ensure interactions is always an array
    this.interactions = Array.isArray(config.interactions) ? 
      config.interactions.map(i => i instanceof Interaction ? i : new Interaction(i)) : 
      [];
    
    this.resources = config.resources || {};
    this.environment = config.environment || { density: 0.5 };
    this.connectedNodes = config.connectedNodes || [];
    this.population = config.population || 0;

    // Don't freeze in constructor to allow modifications if needed
  }

  _generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  hasInteraction(interactionId) {
    return this.interactions.some(i => i.id === interactionId);
  }

  getAvailableInteractions(character) {
    return this.interactions.filter(i => 
      i.meetsRequirements && i.meetsRequirements(character) && 
      i.isAvailable && i.isAvailable(Date.now())
    );
  }

  getEnvironmentFactor() {
    return this.environment.density || 0.5;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      position: this.position.toJSON ? this.position.toJSON() : this.position,
      interactions: this.interactions.map(i => i.toJSON ? i.toJSON() : i),
      resources: this.resources,
      environment: this.environment,
      connectedNodes: this.connectedNodes,
      population: this.population
    };
  }

  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for Node');
    }
    return new Node(data);
  }
}

export default Node;