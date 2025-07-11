// src/application/use-cases/simulation/GenerateWorld.js

import Character from '../../domain/entities/Character.js';
import Interaction from '../../domain/entities/Interaction.js';
import Position from '../../domain/entities/Position.js';
import Attributes from '../../domain/entities/Attributes.js';

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
      id: crypto.randomUUID(),
      name: `Node ${i + 1} - ${['Village', 'Forest', 'Hill'][i % 3]}`,
      position: new Position({
        x: Math.floor(Math.random() * size.width),
        y: Math.floor(Math.random() * size.height),
      }),
      interactions: this.generateNodeInteractions(),
    };
    worldState.nodes.push(node);
  }

  // Generate characters (reused from old Character Types)
  for (let i = 0; i < characterCount; i++) {
    const node = worldState.nodes[Math.floor(Math.random() * nodeCount)];
    const character = new Character({
      name: `NPC ${i + 1}`,
      currentNodeId: node.id,
      position: new Position({ nodeId: node.id }),  // Tie to node
      consciousness: {
        frequency: 40,  // 40 Hz gamma baseline from papers
        coherence: this.calculateInitialCoherence(node),  // Node-dependent
      },
      personality: { aggression: Math.random(), curiosity: Math.random() },  // Random traits
      attributes: new Attributes({
        strength: { score: Math.floor(Math.random() * 10) + 10 },
        dexterity: { score: Math.floor(Math.random() * 10) + 10 },
        // ... other attributes
      }),
      goals: [{ id: 'gather_resources', progress: 0 }],
    });
    worldState.npcs.push(character);
  }

  // Initialize resources (simple distribution)
  resourceTypes.forEach(resource => {
    worldState.resources[resource] = Math.floor(Math.random() * 100);
  });

  return worldState;
};

// Generate sample interactions for nodes (reused from old Interactions tab)
generateWorld.generateNodeInteractions = () => [
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
generateWorld.calculateInitialCoherence = (node) => {
  // Simulate ordered water shielding (papers' 0.28 nm spacing) with node density
  const densityFactor = Math.random() * 0.5 + 0.5;  // 0.5-1.0 (higher density = better shielding)
  const baseCoherence = 0.7;  // Default from papers' microtubule coherence
  return Math.min(1, baseCoherence * densityFactor);  // Caps at 1
};

export default generateWorld;