import React, { useState, useMemo } from 'react';
import './HistoricalEventBrowser.css';

/**
 * HistoricalEventBrowser Component
 *
 * Provides a comprehensive interface for browsing and filtering historical events
 * from the simulation, including political events, general historical events,
 * and character memories.
 */
const HistoricalEventBrowser = ({
  politicalEvents = [],
  historicalEvents = [],
  memoryQueryService,
  politicalTrackingService,
  onEventSelect,
  selectedEventId,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    eventType: 'all', // all, political, historical, memory
    dateRange: {
      start: null,
      end: null
    },
    significance: {
      min: 0,
      max: 100
    },
    participants: [],
    settlements: [],
    scope: 'all' // all, local, regional, global
  });
  const [sortBy, setSortBy] = useState('timestamp'); // timestamp, significance, type
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(20);

  // Combine all events into a unified format
  const allEvents = useMemo(() => {
    const events = [];

    // Add political events
    politicalEvents.forEach(event => {
      events.push({
        ...event,
        eventCategory: 'political',
        displayType: event.type,
        searchableText: `${event.name} ${event.description} ${event.participants.map(p => p.name).join(' ')} ${event.settlements.map(s => s.name).join(' ')}`
      });
    });

    // Add historical events
    historicalEvents.forEach(event => {
      events.push({
        ...event,
        eventCategory: 'historical',
        displayType: event.type,
        searchableText: `${event.name} ${event.description} ${event.participants.map(p => p.name).join(' ')}`
      });
    });

    return events;
  }, [politicalEvents, historicalEvents]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = allEvents.filter(event => {
      // Search query filter
      if (searchQuery && !event.searchableText.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Event type filter
      if (filters.eventType !== 'all' && event.eventCategory !== filters.eventType) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start && event.timestamp < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && event.timestamp > filters.dateRange.end) {
        return false;
      }

      // Significance filter
      if (event.significance < filters.significance.min || event.significance > filters.significance.max) {
        return false;
      }

      // Participants filter
      if (filters.participants.length > 0) {
        const eventParticipantIds = event.participants.map(p => p.id);
        if (!filters.participants.some(pId => eventParticipantIds.includes(pId))) {
          return false;
        }
      }

      // Settlements filter
      if (filters.settlements.length > 0 && event.settlements) {
        const eventSettlementIds = event.settlements.map(s => s.id);
        if (!filters.settlements.some(sId => eventSettlementIds.includes(sId))) {
          return false;
        }
      }

      // Scope filter
      if (filters.scope !== 'all' && event.scope !== filters.scope) {
        return false;
      }

      return true;
    });

    // Sort events
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'significance':
          aValue = a.significance || 0;
          bValue = b.significance || 0;
          break;
        case 'type':
          aValue = a.displayType || '';
          bValue = b.displayType || '';
          break;
        case 'timestamp':
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [allEvents, searchQuery, filters, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleDateRangeChange = (start, end) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end }
    }));
    setCurrentPage(1);
  };

  const handleSignificanceChange = (min, max) => {
    setFilters(prev => ({
      ...prev,
      significance: { min, max }
    }));
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  // Handle event selection
  const handleEventClick = (event) => {
    if (onEventSelect) {
      onEventSelect(event);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get significance color
  const getSignificanceColor = (significance) => {
    if (significance >= 80) return 'high';
    if (significance >= 50) return 'medium';
    return 'low';
  };

  // Get event type icon
  const getEventTypeIcon = (eventCategory, displayType) => {
    const icons = {
      political: {
        leadership_change: '👑',
        diplomatic_shift: '🤝',
        policy_change: '📋',
        alliance_formation: '🤝',
        conflict: '⚔️'
      },
      historical: {
        battle: '⚔️',
        birth: '👶',
        death: '💀',
        marriage: '💍',
        discovery: '🔍',
        disaster: '🌪️'
      }
    };

    return icons[eventCategory]?.[displayType] || '📜';
  };

  return (
    <div className={`historical-event-browser ${className}`}>
      {/* Header */}
      <div className="browser-header">
        <h2>Historical Event Browser</h2>
        <div className="event-count">
          {filteredEvents.length} events found
        </div>
      </div>

      {/* Search and Filters */}
      <div className="browser-controls">
        {/* Search */}
        <div className="search-section">
          <input
            type="text"
            placeholder="Search events, participants, settlements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Quick Filters */}
        <div className="quick-filters">
          <select
            value={filters.eventType}
            onChange={(e) => handleFilterChange('eventType', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Event Types</option>
            <option value="political">Political Events</option>
            <option value="historical">Historical Events</option>
          </select>

          <select
            value={filters.scope}
            onChange={(e) => handleFilterChange('scope', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Scopes</option>
            <option value="local">Local</option>
            <option value="regional">Regional</option>
            <option value="global">Global</option>
          </select>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="advanced-filters-toggle">
          <button
            className="toggle-button"
            onClick={() => setFilters(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))}
          >
            {filters.showAdvanced ? 'Hide' : 'Show'} Advanced Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {filters.showAdvanced && (
        <div className="advanced-filters">
          {/* Date Range */}
          <div className="filter-group">
            <label>Date Range:</label>
            <div className="date-inputs">
              <input
                type="date"
                value={filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateRangeChange(
                  e.target.value ? new Date(e.target.value) : null,
                  filters.dateRange.end
                )}
              />
              <span>to</span>
              <input
                type="date"
                value={filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateRangeChange(
                  filters.dateRange.start,
                  e.target.value ? new Date(e.target.value) : null
                )}
              />
            </div>
          </div>

          {/* Significance Range */}
          <div className="filter-group">
            <label>Significance: {filters.significance.min} - {filters.significance.max}</label>
            <div className="significance-inputs">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.significance.min}
                onChange={(e) => handleSignificanceChange(parseInt(e.target.value), filters.significance.max)}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={filters.significance.max}
                onChange={(e) => handleSignificanceChange(filters.significance.min, parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="sort-controls">
        <span>Sort by:</span>
        <button
          className={`sort-button ${sortBy === 'timestamp' ? 'active' : ''}`}
          onClick={() => handleSort('timestamp')}
        >
          Date {sortBy === 'timestamp' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button
          className={`sort-button ${sortBy === 'significance' ? 'active' : ''}`}
          onClick={() => handleSort('significance')}
        >
          Significance {sortBy === 'significance' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button
          className={`sort-button ${sortBy === 'type' ? 'active' : ''}`}
          onClick={() => handleSort('type')}
        >
          Type {sortBy === 'type' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
      </div>

      {/* Event List */}
      <div className="event-list">
        {paginatedEvents.length === 0 ? (
          <div className="no-events">No events match the current filters.</div>
        ) : (
          paginatedEvents.map(event => (
            <div
              key={event.id}
              className={`event-item ${selectedEventId === event.id ? 'selected' : ''} ${getSignificanceColor(event.significance)}`}
              onClick={() => handleEventClick(event)}
            >
              <div className="event-header">
                <div className="event-icon">
                  {getEventTypeIcon(event.eventCategory, event.displayType)}
                </div>
                <div className="event-title">
                  <h3>{event.name}</h3>
                  <div className="event-meta">
                    <span className="event-type">{event.displayType}</span>
                    <span className="event-timestamp">{formatTimestamp(event.timestamp)}</span>
                    <span className={`event-significance significance-${getSignificanceColor(event.significance)}`}>
                      Significance: {event.significance}
                    </span>
                  </div>
                </div>
              </div>

              <div className="event-description">
                {event.description}
              </div>

              <div className="event-details">
                {event.participants && event.participants.length > 0 && (
                  <div className="event-participants">
                    <strong>Participants:</strong> {event.participants.map(p => p.name).join(', ')}
                  </div>
                )}

                {event.settlements && event.settlements.length > 0 && (
                  <div className="event-settlements">
                    <strong>Settlements:</strong> {event.settlements.map(s => s.name).join(', ')}
                  </div>
                )}

                {event.scope && (
                  <div className="event-scope">
                    <strong>Scope:</strong> {event.scope}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-button"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="page-button"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoricalEventBrowser;