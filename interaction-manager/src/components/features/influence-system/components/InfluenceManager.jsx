import React from 'react';

const InfluenceManager = ({ system }) => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Influence Manager</h2>
      <p>This is a placeholder for the InfluenceManager UI.</p>
      <pre>{JSON.stringify(system, null, 2)}</pre>
    </div>
  );
};

export default InfluenceManager; 