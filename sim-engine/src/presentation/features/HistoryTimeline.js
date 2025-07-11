// src/presentation/components/features/HistoryTimeline.js

import React, { useState, useEffect } from 'react';
import analyzeHistory from '../../../application/use-cases/history/AnalyzeHistory.js';

const HistoryTimeline = () => {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const result = analyzeHistory({ limit: 20 });
    setEvents(result.events);
    setSummary(result.summary);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">History Timeline</h2>
      <p>Total Events: {summary.totalEvents} (Significant: {summary.significantEvents})</p>
      <ul className="list-disc">
        {events.map(event => (
          <li key={event.id}>
            [{new Date(event.timestamp).toLocaleString()}] {event.characterName} {event.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryTimeline;