// src/presentation/pages/HistoryPage.js

import React, { useState } from 'react';
import { useSimulationContext } from '../contexts/SimulationContext.js';

const HistoryPage = () => {
  const { analyzeHistory } = useSimulationContext();
  const [criteria, setCriteria] = useState({ limit: 10 });
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = () => {
    const result = analyzeHistory(criteria);
    setAnalysis(result);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">History Analysis</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Event Limit:
          <input
            type="number"
            value={criteria.limit}
            onChange={(e) => setCriteria({ ...criteria, limit: parseInt(e.target.value) || 10 })}
            className="ml-2 px-2 py-1 border rounded"
            min="1"
            max="100"
          />
        </label>
      </div>
      
      <button onClick={handleAnalyze} className="bg-blue-500 text-white p-2">Analyze</button>
      {analysis && (
        <div>
          <p>Total Events: {analysis.summary.totalEvents}</p>
          <ul>
            {analysis.events.map(event => (
              <li key={event.id}>{event.description}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;