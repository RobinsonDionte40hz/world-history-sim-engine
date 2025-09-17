/**
 * LODHistoryTimeline - Enhanced history timeline with LOD event visualization
 *
 * Displays chronological history of simulation events with LOD-specific filtering.
 * Shows LOD transitions, character activities, and settlement changes.
 * Provides interactive timeline with event details and LOD context.
 *
 * Requirements: LOD-aware history visualization for Valley of Echoes demo
 */

import React, { useState, useEffect, useMemo } from 'react';
import './LODHistoryTimeline.css';

const LODHistoryTimeline = ({
  worldState,
  className = '',
  maxEvents = 50,
  showLODEvents = true,
  showCharacterEvents = true,
  showSettlementEvents = true
}) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState('all');

  // Process and filter events
  useEffect(() => {
    if (!worldState?.events) return;

    let filteredEvents = [...worldState.events];

    // Apply type filters
    if (filter !== 'all') {
      filteredEvents = filteredEvents.filter(event => {
        switch (filter) {
          case 'lod':
            return event.type?.includes('lod');
          case 'character':
            return event.type === 'character_action' || event.type === 'consciousness_shift';
          case 'settlement':
            return event.type === 'need_satisfaction_change' || event.type === 'consequence_applied';
          case 'trade':
            return event.type === 'cross_settlement_trade';
          default:
            return true;
        }
      });
    }

    // Sort by turn and timestamp (most recent first)
    filteredEvents.sort((a, b) => {
      if (a.turn !== b.turn) return b.turn - a.turn;
      if (a.timestamp && b.timestamp) {
        return new Date(b.timestamp) - new Date(a.timestamp);
      }
      return 0;
    });

    // Limit number of events
    setEvents(filteredEvents.slice(0, maxEvents));
  }, [worldState, filter, maxEvents]);

  // Group events by turn
  const eventsByTurn = useMemo(() => {
    const grouped = {};
    events.forEach(event => {
      const turn = event.turn || 0;
      if (!grouped[turn]) {
        grouped[turn] = [];
      }
      grouped[turn].push(event);
    });
    return grouped;
  }, [events]);

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'lod_promotion': return '⬆️';
      case 'lod_demotion': return '⬇️';
      case 'character_action': return '👤';
      case 'consciousness_shift': return '🧠';
      case 'need_satisfaction_change': return '🏠';
      case 'consequence_applied': return '⚡';
      case 'cross_settlement_trade': return '🤝';
      default: return '📝';
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'lod_promotion': return '#4caf50';
      case 'lod_demotion': return '#f44336';
      case 'character_action': return '#2196f3';
      case 'consciousness_shift': return '#9c27b0';
      case 'need_satisfaction_change': return '#ff9800';
      case 'consequence_applied': return '#ff5722';
      case 'cross_settlement_trade': return '#607d8b';
      default: return '#9e9e9e';
    }
  };

  const getEventTitle = (event) => {
    switch (event.type) {
      case 'lod_promotion':
        return `${event.characterName || event.characterId} promoted to ${event.toTier}`;
      case 'lod_demotion':
        return `${event.characterName || event.characterId} demoted to ${event.toTier}`;
      case 'character_action':
        return `${event.characterName || event.characterId} performed action`;
      case 'consciousness_shift':
        return `${event.characterName || event.characterId} consciousness changed`;
      case 'need_satisfaction_change':
        return `${event.settlementName || event.settlementId} needs updated`;
      case 'consequence_applied':
        return `Consequence applied to ${event.settlementName || event.settlementId}`;
      case 'cross_settlement_trade':
        return `Trade between ${event.settlementAId} and ${event.settlementBId}`;
      default:
        return event.title || event.description || 'Unknown event';
    }
  };

  const getEventDetails = (event) => {
    const details = [];

    if (event.turn) {
      details.push(`Turn: ${event.turn}`);
    }

    if (event.timestamp) {
      const date = new Date(event.timestamp);
      details.push(`Time: ${date.toLocaleTimeString()}`);
    }

    switch (event.type) {
      case 'lod_promotion':
      case 'lod_demotion':
        details.push(`From: ${event.fromTier}`);
        details.push(`To: ${event.toTier}`);
        details.push(`Reason: ${event.reason}`);
        break;

      case 'character_action':
        if (event.interaction) {
          details.push(`Action: ${event.interaction.type}`);
        }
        if (event.outcome) {
          details.push(`Outcome: ${event.outcome}`);
        }
        break;

      case 'need_satisfaction_change':
        if (event.needs) {
          const needsStr = Object.entries(event.needs)
            .map(([need, value]) => `${need}: ${(value * 100).toFixed(0)}%`)
            .join(', ');
          details.push(`Needs: ${needsStr}`);
        }
        break;

      case 'cross_settlement_trade':
        details.push(`Volume: ${event.tradeVolume || 'Unknown'}`);
        if (event.goods) {
          details.push(`Goods: ${Array.isArray(event.goods) ? event.goods.join(', ') : event.goods}`);
        }
        break;

      default:
        // No additional details for unknown event types
        break;
    }

    if (event.description && event.description !== event.title) {
      details.push(`Description: ${event.description}`);
    }

    return details;
  };

  const filterOptions = [
    { value: 'all', label: 'All Events', count: worldState?.events?.length || 0 },
    { value: 'lod', label: 'LOD Changes', count: worldState?.events?.filter(e => e.type?.includes('lod')).length || 0 },
    { value: 'character', label: 'Character Actions', count: worldState?.events?.filter(e => e.type === 'character_action' || e.type === 'consciousness_shift').length || 0 },
    { value: 'settlement', label: 'Settlement Events', count: worldState?.events?.filter(e => e.type === 'need_satisfaction_change' || e.type === 'consequence_applied').length || 0 },
    { value: 'trade', label: 'Trade Events', count: worldState?.events?.filter(e => e.type === 'cross_settlement_trade').length || 0 }
  ];

  return (
    <div className={`lod-history-timeline ${className}`}>
      {/* Header with filters */}
      <div className="lod-timeline-header">
        <h3>LOD History Timeline</h3>
        <div className="lod-timeline-filters">
          {filterOptions.map(option => (
            <button
              key={option.value}
              className={`lod-filter-btn ${filter === option.value ? 'active' : ''}`}
              onClick={() => setFilter(option.value)}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="lod-timeline-container">
        {Object.keys(eventsByTurn).length === 0 ? (
          <div className="lod-timeline-empty">
            <span className="lod-empty-icon">📜</span>
            <p>No events to display</p>
            <p className="lod-empty-subtitle">Process some turns to see the history timeline</p>
          </div>
        ) : (
          <div className="lod-timeline">
            {Object.entries(eventsByTurn)
              .sort(([a], [b]) => parseInt(b) - parseInt(a)) // Sort turns descending
              .map(([turn, turnEvents]) => (
                <div key={turn} className="lod-turn-group">
                  <div className="lod-turn-header">
                    <span className="lod-turn-label">Turn {turn}</span>
                    <span className="lod-turn-count">{turnEvents.length} events</span>
                  </div>

                  <div className="lod-turn-events">
                    {turnEvents.map((event, index) => (
                      <div
                        key={event.id || `event-${turn}-${index}`}
                        className={`lod-timeline-event ${selectedEvent?.id === event.id ? 'selected' : ''}`}
                        onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                        style={{ borderLeftColor: getEventColor(event.type) }}
                      >
                        <div className="lod-event-header">
                          <span className="lod-event-icon">{getEventIcon(event.type)}</span>
                          <span className="lod-event-title">{getEventTitle(event)}</span>
                          <span className="lod-event-time">
                            {event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : ''}
                          </span>
                        </div>

                        {selectedEvent?.id === event.id && (
                          <div className="lod-event-details">
                            {getEventDetails(event).map((detail, idx) => (
                              <div key={idx} className="lod-event-detail">
                                {detail}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LODHistoryTimeline;