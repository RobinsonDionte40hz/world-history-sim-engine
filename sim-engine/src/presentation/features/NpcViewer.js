// src/presentation/components/features/NpcViewer.js

import React from 'react';
import { User } from 'lucide-react';  // From Lucide icons

const NpcViewer = ({ npc }) => {
  if (!npc) return <div>No NPC selected</div>;

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="flex items-center text-lg font-bold"><User className="mr-2" /> {npc.name}</h2>
      <p>Position: ({npc.position.x}, {npc.position.y})</p>
      <p>Coherence: {npc.consciousness.coherence.toFixed(2)}</p>
      <p>Attributes: STR {npc.attributes.strength.score} (Mod: {npc.attributes.strength.modifier})</p>
      {/* Add lists for relationships, goals, history */}
      <ul>
        {npc.relationships.entries().map(([id, affinity]) => (
          <li key={id}>Relation with {id}: {affinity.toFixed(2)}</li>
        ))}
      </ul>
    </div>
  );
};

export default NpcViewer;