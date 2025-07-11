// src/application/use-cases/history/AnalyzeHistory.js

import HistoryGenerator from '../../domain/services/HistoryGenerator.js';

const analyzeHistory = (criteria = {}) => {
  const { timeRange, characterId, interactionType, minSignificance = 0, limit = 10 } = criteria;
  const events = HistoryGenerator.getEvents();

  // Filter and sort events
  const filteredEvents = events.filter(event => {
    const inTimeRange = !timeRange || (event.timestamp >= timeRange.start && event.timestamp <= timeRange.end);
    const matchesCharacter = !characterId || event.characterId === characterId;
    const matchesType = !interactionType || event.type === interactionType;
    const aboveSignificance = event.significance >= minSignificance;
    return inTimeRange && matchesCharacter && matchesType && aboveSignificance;
  }).sort((a, b) => b.timestamp - a.timestamp);  // Latest first

  // Limit results
  const limitedEvents = filteredEvents.slice(0, limit);

  // Generate summary (simple for MVP)
  const summary = {
    totalEvents: filteredEvents.length,
    significantEvents: filteredEvents.filter(e => e.significance > 0.5).length,
    topCharacters: this.getTopCharacters(filteredEvents),
    averageSignificance: filteredEvents.reduce((sum, e) => sum + e.significance, 0) / filteredEvents.length || 0,
  };

  // Generate narrative (basic concatenation)
  const narrative = this.generateNarrative(limitedEvents);

  return { events: limitedEvents, summary, narrative };
};

// Get top characters by event count (reused from old data analysis concept)
analyzeHistory.getTopCharacters = (events) => {
  const characterCounts = {};
  events.forEach(event => {
    characterCounts[event.characterId] = (characterCounts[event.characterId] || 0) + 1;
  });
  return Object.entries(characterCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, count]) => ({ id, count }));
};

// Generate a narrative from events (quantum-inspired weighting by coherence)
analyzeHistory.generateNarrative = (events) => {
  if (!events.length) return 'No significant history to report.';

  return events
    .map(event => {
      const weight = event.significance * (event.outcome === 'positive' ? 1.5 : 0.5);  // Positive events emphasized
      const descriptor = weight > 1 ? 'notably' : weight > 0.5 ? 'moderately' : 'slightly';
      return `${event.characterName} ${descriptor} ${event.outcome === 'positive' ? 'succeeded' : 'failed'} in ${event.interactionName} at ${new Date(event.timestamp).toLocaleDateString()}.`;
    })
    .join(' ');
};

export default analyzeHistory;