import React from 'react';
import NetworkGraph from './NetworkGraph';

const sampleData = {
  nodes: [
    { id: "Alice" },
    { id: "Bob" },
    { id: "Charlie" }
  ],
  links: [
    { source: "Alice", target: "Bob" },
    { source: "Bob", target: "Charlie" }
  ]
};

const RelationshipVisualizer = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Relationship Network</h2>
      <div style={{height: '600px', width: '100%'}}>
        <NetworkGraph data={sampleData} />
      </div>
    </div>
  );
};

export default RelationshipVisualizer;
