// src/application/use-cases/simulation/GenerateWorld.js

import Character from '../../../domain/entities/Character.js';
import Interaction from '../../../domain/entities/Interaction.js';
import Position from '../../../domain/value-objects/Positions.js';

// Utility function to generate UUID with fallback for test environments
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for test environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Generate sample interactions for nodes
const generateNodeInteractions = () => [
  new Interaction({
    name: 'Trade Goods',
    type: 'dialogue',
    requirements: [{ attr: 'charisma', min: 10 }],
    branches: [{ id: 'success', text: 'Deal made', effects: [{ type: 'influence', value: 5 }] }],
  }),
  new Interaction({
    name: 'Gather Resources',
    type: 'action',
    requirements: [{ attr: 'strength', min: 12 }],
    branches: [{ id: 'success', text: 'Resources gathered', effects: [{ type: 'resource', value: 10, target: 'food' }] }],
  }),
];

// Calculate initial coherence based on node conditions (quantum-inspired)
const calculateInitialCoherence = (node) => {
  // Simulate ordered water shielding (papers' 0.28 nm spacing) with node density
  const densityFactor = Math.random() * 0.5 + 0.5;  // 0.5-1.0 (higher density = better shielding)
  const baseCoherence = 0.7;  // Default from papers' microtubule coherence
  return Math.min(1, baseCoherence * densityFactor);  // Caps at 1
};

const generateWorld = (config = {}) => {
  const {
    size = { width: 10, height: 10 },
    nodeCount = 5,
    characterCount = 10,
    resourceTypes = ['food', 'wood'],
  } = config;

  // Initialize world state
  const worldState = {
    time: 0,
    nodes: [],
    npcs: [],
    resources: {},
  };

  // Generate nodes (reused from old Node Types)
  for (let i = 0; i < nodeCount; i++) {
    const node = {
      id: generateId(),
      name: `Node ${i + 1} - ${['Village', 'Forest', 'Hill'][i % 3]}`,
      position: new Position({
        x: Math.floor(Math.random() * size.width),
        y: Math.floor(Math.random() * size.height),
      }),
      interactions: generateNodeInteractions(),
      population: Math.floor(Math.random() * 1000) + 100, // Random population 100-1100
    };
    worldState.nodes.push(node);
  }

  // Generate characters (reused from old Character Types)
  for (let i = 0; i < characterCount; i++) {
    const node = worldState.nodes[Math.floor(Math.random() * nodeCount)];
    const character = new Character({
      name: `NPC ${i + 1}`,
      currentNodeId: node.id,
      consciousness: {
        frequency: 40,  // 40 Hz gamma baseline from papers
        coherence: calculateInitialCoherence(node),  // Node-dependent
      },
      personality: { aggression: Math.random(), curiosity: Math.random() },  // Random traits
      attributes: {
        strength: { score: Math.floor(Math.random() * 10) + 10 },
        dexterity: { score: Math.floor(Math.random() * 10) + 10 },
        constitution: { score: Math.floor(Math.random() * 10) + 10 },
        intelligence: { score: Math.floor(Math.random() * 10) + 10 },
        wisdom: { score: Math.floor(Math.random() * 10) + 10 },
        charisma: { score: Math.floor(Math.random() * 10) + 10 },
      },
      goals: [{ id: 'gather_resources', progress: 0 }],
      energy: 100,
      health: 100,
      mood: 80,
    });
    worldState.npcs.push(character);
  }

  // Initialize resources (simple distribution)
  resourceTypes.forEach(resource => {
    worldState.resources[resource] = Math.floor(Math.random() * 100);
  });

  return worldState;
};

export default generateWorld;