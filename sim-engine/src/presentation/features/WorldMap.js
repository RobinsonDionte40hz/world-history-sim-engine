// src/presentation/components/features/WorldMap.js

import React from 'react';
import SimulationService from '../../application/use-cases/services/SimulationService.js';

const WorldMap = () => {
  const worldState = SimulationService.worldState || { nodes: [], npcs: [] };

  return (
    <svg width="400" height="400" className="border">
      {worldState.nodes.map(node => (
        <circle key={node.id} cx={node.position.x * 40} cy={node.position.y * 40} r="10" fill="blue" />
      ))}
      {worldState.npcs.map(npc => (
        <circle key={npc.id} cx={npc.position.x * 40} cy={npc.position.y * 40} r="5" fill="red" />
      ))}
    </svg>
  );
};

export default WorldMap;