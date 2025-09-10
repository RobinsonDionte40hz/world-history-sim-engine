// src/presentation/components/features/HistoryTimeline.js

import React, { useState, useEffect, useMemo } from 'react';
import analyzeHistory from '../../application/use-cases/history/AnalyzeHistory.js';

const HistoryTimeline = React.memo(() => {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Add a small delay to prevent rapid re-renders from causing issues
        const result = await new Promise(resolve => {
          setTimeout(() => {
            try {
              const historyResult = analyzeHistory({ limit: 20 });
              resolve(historyResult);
            } catch (err) {
              resolve({ events: [], summary: { totalEvents: 0, significantEvents: 0 } });
            }
          }, 100);
        });
        
        if (isMounted) {
          setEvents(result.events || []);
          setSummary(result.summary || { totalEvents: 0, significantEvents: 0 });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setEvents([]);
          setSummary({ totalEvents: 0, significantEvents: 0 });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadHistory();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Memoize the rendered events list to prevent unnecessary re-renders
  const renderedEvents = useMemo(() => {
    return events.map(event => (
      <li key={event.id}>
        [{new Date(event.timestamp).toLocaleString()}] {event.characterName} {event.description}
      </li>
    ));
  }, [events]);

  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold">History Timeline</h2>
        <p className="text-gray-500">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold">History Timeline</h2>
        <p className="text-red-500">Error loading history: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">History Timeline</h2>
      <p>Total Events: {summary.totalEvents} (Significant: {summary.significantEvents})</p>
      {events.length > 0 ? (
        <ul className="list-disc">
          {renderedEvents}
        </ul>
      ) : (
        <p className="text-gray-500 mt-2">No historical events yet.</p>
      )}
    </div>
  );
});

HistoryTimeline.displayName = 'HistoryTimeline';

export default HistoryTimeline;