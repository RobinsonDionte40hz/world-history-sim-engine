// src/domain/services/PatternValidator.js

/**
 * Pattern validation utilities for demo consistency
 * Used by both tests and services
 */

const PatternValidator = {
  validateAssignmentPattern: (character, nodeMap) => {
    if (!character.assignments?.nodes) return false;
    
    for (const nodeId of character.assignments.nodes) {
      const node = nodeMap.get(nodeId);
      if (!node) return false;
      if (node.characters && !node.characters.includes(character.id)) {
        return false;
      }
    }
    return true;
  },

  validatePropertyNaming: (object) => {
    return Object.keys(object).every(key => 
      /^[a-z][a-zA-Z0-9]*$/.test(key)
    );
  },

  validateEnvironmentalProperties: (environment) => {
    if (!environment) return true;
    
    const required = ['terrain', 'climate', 'lighting'];
    return required.every(prop => environment[prop]);
  },

  validateDnDAttributes: (attributes) => {
    if (!attributes) return true;
    
    const validNames = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    return Object.keys(attributes).every(name => validNames.includes(name));
  },

  validateCulturalContext: (culture) => {
    if (!culture) return true;
    
    if (culture.language && typeof culture.language !== 'string') return false;
    
    if (culture.traditions) {
      if (!Array.isArray(culture.traditions)) return false;
      if (!culture.traditions.every(t => typeof t === 'string')) return false;
    }
    
    return true;
  }
};

export { PatternValidator };