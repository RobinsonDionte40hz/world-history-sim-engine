// src/infrastructure/persistence/LocalStorageWorldRepository.js

import IWorldRepository from '../../application/ports/IWorldRepository.js';
import Position from '../../domain/entities/Position.js';
import Character from '../../domain/entities/character.js';

const LocalStorageWorldRepository = {
  saveWorld: async (worldState) => {
    const stateToSave = {
      time: worldState.time,
      nodes: worldState.nodes.map(node => ({
        id: node.id,
        name: node.name,
        position: node.position.toJSON(),
      })),
      npcs: worldState.npcs.map(npc => npc.toJSON()),
      resources: worldState.resources,
    };
    localStorage.setItem('worldState', JSON.stringify(stateToSave));
    return Promise.resolve();
  },

  getWorld: async () => {
    const savedState = JSON.parse(localStorage.getItem('worldState') || '{}');
    if (savedState.time !== undefined) {
      return {
        time: savedState.time,
        nodes: savedState.nodes.map(node => ({
          id: node.id,
          name: node.name,
          position: new Position(node.position),
        })),
        npcs: savedState.npcs.map(npc => new Character(npc)),
        resources: savedState.resources,
      };
    }
    return null;
  },

  updateNode: async (node) => {
    const world = await this.getWorld();
    if (world) {
      const index = world.nodes.findIndex(n => n.id === node.id);
      if (index >= 0) world.nodes[index] = node;
      await this.saveWorld(world);
    }
    return Promise.resolve();
  },
};

export default { ...IWorldRepository, ...LocalStorageWorldRepository };