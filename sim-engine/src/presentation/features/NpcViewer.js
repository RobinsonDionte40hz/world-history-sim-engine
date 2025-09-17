// src/presentation/components/features/NpcViewer.js

import React from 'react';
import { User } from 'lucide-react';  // From Lucide icons

const NpcViewer = ({ npc }) => {
  if (!npc) return <div>No NPC selected</div>;

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="flex items-center text-lg font-bold"><User className="mr-2" /> {npc.name || 'Unknown NPC'}</h2>

      {/* Position */}
      {npc.position && (
        <p>Position: ({npc.position.x || 0}, {npc.position.y || 0})</p>
      )}

      {/* Consciousness */}
      {npc.consciousness && npc.consciousness.coherence !== undefined && (
        <p>Coherence: {npc.consciousness.coherence.toFixed(2)}</p>
      )}

      {/* Attributes */}
      {npc.attributes && npc.attributes.strength && (
        <p>Attributes: STR {npc.attributes.strength.score || 0} (Mod: {npc.attributes.strength.modifier || 0})</p>
      )}

      {/* Relationships */}
      {npc.relationships && npc.relationships.size > 0 && (
        <div>
          <h3 className="font-semibold mt-4 mb-2">Relationships</h3>
          <ul>
            {Array.from(npc.relationships.entries()).map(([id, affinity]) => (
              <li key={id}>Relation with {id}: {typeof affinity === 'number' ? affinity.toFixed(2) : affinity}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Goals */}
      {npc.goals && npc.goals.length > 0 && (
        <div>
          <h3 className="font-semibold mt-4 mb-2">Goals</h3>
          <ul>
            {npc.goals.map((goal, index) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        </div>
      )}

      {/* History */}
      {npc.history && npc.history.length > 0 && (
        <div>
          <h3 className="font-semibold mt-4 mb-2">Recent History</h3>
          <ul>
            {npc.history.slice(-5).map((event, index) => (
              <li key={index}>{event}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NpcViewer;