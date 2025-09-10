import React from 'react';
import NetworkGraph from '../components/network/NetworkGraph';
import Toolbar from '../components/network/Toolbar';
import { graphData } from '../components/network/graph-data';
import './RelationshipVisualizerPage.css';

const RelationshipVisualizerPage = () => {
  const handleExport = () => {
    console.log('Exporting graph...');
  };

  return (
    <div className="relationship-visualizer-page">
      <header className="page-header">
        <h1>Relationship Network Visualizer</h1>
      </header>
      <div className="visualizer-container">
        <Toolbar onExport={handleExport} />
        <div className="network-graph-container">
          <NetworkGraph data={graphData} />
        </div>
      </div>
    </div>
  );
};

export default RelationshipVisualizerPage;
