import React, { useMemo } from 'react';
import TimelineVisualization from './TimelineVisualization';

/**
 * SettlementPoliticalTimeline Component
 *
 * Specialized timeline visualization for settlement political history,
 * focusing on leadership changes, diplomatic relationships, policy shifts,
 * and other political events that affect settlements.
 *
 * Features:
 * - Leadership change visualization with tenure periods
 * - Diplomatic relationship timeline
 * - Policy change tracking
 * - Political event significance highlighting
 * - Interactive political career exploration
 *
 * Requirements: UI-7.2, 4.5, 6.5
 */

const SettlementPoliticalTimeline = ({
  settlement,
  politicalEvents = [],
  leadershipHistory = [],
  diplomaticRelationships = [],
  timeRange = null,
  filters = {},
  onEventSelect = () => {},
  onLeadershipSelect = () => {},
  className = '',
  width = 1200,
  height = 600
}) => {

  // Process political events for the settlement
  const processedEvents = useMemo(() => {
    if (!settlement) return [];

    const events = [];

    // Add political events related to this settlement
    politicalEvents.forEach(event => {
      if (event.settlements && event.settlements.some(s => s.id === settlement.id)) {
        events.push({
          ...event,
          settlementId: settlement.id,
          settlementName: settlement.name,
          trackType: 'political_events',
          displayType: event.type,
          searchableText: `${event.name} ${event.description}`
        });
      }
    });

    // Add leadership change events
    leadershipHistory.forEach(leadership => {
      const event = {
        id: `leadership-${leadership.eventId || leadership.timestamp}`,
        type: 'leadership_change',
        name: `Leadership Change: ${leadership.newLeaderId}`,
        description: leadership.reason ?
          `New leader appointed due to: ${leadership.reason}` :
          'Leadership transition occurred',
        timestamp: leadership.timestamp,
        settlementId: settlement.id,
        settlementName: settlement.name,
        trackType: 'leadership',
        displayType: 'leadership',
        significance: 0.8, // Leadership changes are significant
        participants: [leadership.newLeaderId],
        metadata: {
          oldLeaderId: leadership.oldLeaderId,
          newLeaderId: leadership.newLeaderId,
          reason: leadership.reason,
          tenure: leadership.tenure
        },
        searchableText: `leadership change ${leadership.newLeaderId} ${leadership.reason || ''}`
      };
      events.push(event);
    });

    // Add diplomatic relationship events
    diplomaticRelationships.forEach(relationship => {
      // Add status change events from relationship history
      if (relationship.statusHistory) {
        relationship.statusHistory.forEach((statusChange, index) => {
          if (index > 0) { // Skip initial status
            const prevStatus = relationship.statusHistory[index - 1];
            const event = {
              id: `diplomatic-${relationship.settlement1Id}-${relationship.settlement2Id}-${statusChange.timestamp}`,
              type: 'diplomatic_shift',
              name: `Diplomatic Change: ${relationship.settlement1Id === settlement.id ?
                relationship.settlement2Id : relationship.settlement1Id}`,
              description: `Relationship changed from ${prevStatus.status} to ${statusChange.status}`,
              timestamp: statusChange.timestamp,
              settlementId: settlement.id,
              settlementName: settlement.name,
              trackType: 'diplomacy',
              displayType: 'diplomacy',
              significance: 0.6, // Diplomatic changes are moderately significant
              metadata: {
                otherSettlementId: relationship.settlement1Id === settlement.id ?
                  relationship.settlement2Id : relationship.settlement1Id,
                oldStatus: prevStatus.status,
                newStatus: statusChange.status,
                reason: statusChange.reason
              },
              searchableText: `diplomacy ${statusChange.status} ${statusChange.reason || ''}`
            };
            events.push(event);
          }
        });
      }
    });

    return events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [settlement, politicalEvents, leadershipHistory, diplomaticRelationships]);

  // Create specialized tracks for political timeline
  const politicalTracks = useMemo(() => [
    {
      id: 'leadership',
      label: 'Leadership Changes',
      background: '#FEF3C7', // Yellow tint for leadership
      border: '#F59E0B',
      lineColor: '#D97706'
    },
    {
      id: 'political_events',
      label: 'Political Events',
      background: '#FEE2E2', // Red tint for political events
      border: '#EF4444',
      lineColor: '#DC2626'
    },
    {
      id: 'diplomacy',
      label: 'Diplomatic Relations',
      background: '#DBEAFE', // Blue tint for diplomacy
      border: '#3B82F6',
      lineColor: '#2563EB'
    }
  ], []);

  // Group events by track
  const eventsByTrack = useMemo(() => {
    const grouped = {
      leadership: [],
      political_events: [],
      diplomacy: []
    };

    processedEvents.forEach(event => {
      if (grouped[event.trackType]) {
        grouped[event.trackType].push(event);
      }
    });

    return grouped;
  }, [processedEvents]);

  // Handle event selection with political context
  const handleEventSelect = (event) => {
    // Add settlement context to the event
    const eventWithContext = {
      ...event,
      settlementContext: {
        id: settlement.id,
        name: settlement.name,
        currentLeadership: leadershipHistory[leadershipHistory.length - 1],
        diplomaticStatus: diplomaticRelationships
      }
    };

    onEventSelect(eventWithContext);

    // Special handling for leadership events
    if (event.trackType === 'leadership') {
      onLeadershipSelect(event);
    }
  };

  // Calculate time extent for the settlement's political history
  const timeExtent = useMemo(() => {
    if (processedEvents.length === 0) {
      return [new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()];
    }

    const timestamps = processedEvents.map(e => new Date(e.timestamp));
    return [new Date(Math.min(...timestamps)), new Date(Math.max(...timestamps))];
  }, [processedEvents]);

  if (!settlement) {
    return (
      <div className={`settlement-political-timeline empty ${className}`}>
        <div className="empty-state">
          <h3>No Settlement Selected</h3>
          <p>Select a settlement to view its political timeline.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`settlement-political-timeline ${className}`}>
      {/* Settlement Header */}
      <div className="timeline-header">
        <h2>Political History: {settlement.name}</h2>
        <div className="settlement-stats">
          <span className="stat">
            <strong>{processedEvents.length}</strong> political events
          </span>
          <span className="stat">
            <strong>{leadershipHistory.length}</strong> leadership changes
          </span>
          <span className="stat">
            <strong>{diplomaticRelationships.length}</strong> diplomatic relationships
          </span>
        </div>
      </div>

      {/* Timeline Visualization */}
      <TimelineVisualization
        data={processedEvents}
        timeRange={timeRange}
        filters={filters}
        selectedTracks={['leadership', 'political_events', 'diplomacy']}
        tracks={politicalTracks}
        eventsByTrack={eventsByTrack}
        timeExtent={timeExtent}
        onEventSelect={handleEventSelect}
        width={width}
        height={height}
        className="political-timeline"
      />

      {/* Political Summary */}
      <div className="political-summary">
        <div className="summary-section">
          <h3>Current Leadership</h3>
          {leadershipHistory.length > 0 ? (
            <div className="current-leader">
              <strong>{leadershipHistory[leadershipHistory.length - 1].newLeaderId}</strong>
              <span className="tenure">
                Tenure: {leadershipHistory[leadershipHistory.length - 1].tenure || 0} days
              </span>
            </div>
          ) : (
            <p>No leadership history available</p>
          )}
        </div>

        <div className="summary-section">
          <h3>Diplomatic Overview</h3>
          {diplomaticRelationships.length > 0 ? (
            <div className="diplomatic-status">
              {diplomaticRelationships.map(rel => (
                <div key={rel.settlement1Id + rel.settlement2Id} className="relationship">
                  <span className="partner">
                    {rel.settlement1Id === settlement.id ? rel.settlement2Id : rel.settlement1Id}
                  </span>
                  <span className={`status status-${rel.status}`}>
                    {rel.status}
                  </span>
                  <span className="trust">Trust: {rel.trust || 0}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No diplomatic relationships</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettlementPoliticalTimeline;