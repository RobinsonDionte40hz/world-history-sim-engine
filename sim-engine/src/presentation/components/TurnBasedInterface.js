/**
 * TurnBasedInterface - Component for turn-based simulation control
 * 
 * Builds UI with prominent "Next Turn" button for manual progression.
 * Adds turn counter display and current simulation state.
 * Implements turn summary panel showing recent events and changes.
 * Adds pause/resume functionality and turn-by-turn review capabilities.
 * 
 * Requirements: Turn-based user interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import './TurnBasedInterface.css';

const TurnBasedInterface = ({ 
  turnManager, 
  simulationService, 
  onTurnProcessed,
  onError,
  className = ''
}) => {
  const [turnStats, setTurnStats] = useState(null);
  const [recentSummaries, setRecentSummaries] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSummary, setExpandedSummary] = useState(null);
  const [showEvents, setShowEvents] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Update statistics and summaries
  const updateState = useCallback(() => {
    if (!turnManager) return;
    
    try {
      const stats = turnManager.getCurrentStatistics();
      setTurnStats(stats);
      
      const summaries = turnManager.getRecentTurnSummaries(5);
      setRecentSummaries(summaries);
      
      if (showEvents) {
        const events = turnManager.getRecentEvents(3);
        setRecentEvents(events);
      }
    } catch (error) {
      console.error('Error updating turn state:', error);
      setError(error.message);
    }
  }, [turnManager, showEvents]);

  // Initial load and turn manager callbacks
  useEffect(() => {
    if (!turnManager) return;

    updateState();

    // Set up turn manager callbacks
    turnManager.onTurnProcessed = (turnNumber, summary) => {
      updateState();
      if (onTurnProcessed) {
        onTurnProcessed(turnNumber, summary);
      }
    };

    turnManager.onTurnStart = (turnNumber) => {
      setIsProcessing(true);
      setError(null);
    };

    turnManager.onTurnEnd = (turnNumber, summary) => {
      setIsProcessing(false);
      setExpandedSummary(turnNumber);
    };

    return () => {
      // Clean up callbacks
      if (turnManager) {
        turnManager.onTurnProcessed = null;
        turnManager.onTurnStart = null;
        turnManager.onTurnEnd = null;
      }
    };
  }, [turnManager, updateState, onTurnProcessed]);

  const handleNextTurn = async () => {
    if (!turnManager || isProcessing) return;

    try {
      setError(null);
      setIsProcessing(true);
      await turnManager.processNextTurn();
    } catch (error) {
      console.error('Error processing turn:', error);
      setError(error.message);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePause = () => {
    if (!turnManager) return;
    turnManager.pause();
    updateState();
  };

  const handleResume = () => {
    if (!turnManager) return;
    turnManager.resume();
    updateState();
  };

  const handleReset = () => {
    if (!turnManager) return;
    if (window.confirm('Are you sure you want to reset the simulation? This cannot be undone.')) {
      turnManager.reset();
      updateState();
      setError(null);
      setExpandedSummary(null);
    }
  };

  const toggleSummaryExpansion = (turnNumber) => {
    setExpandedSummary(expandedSummary === turnNumber ? null : turnNumber);
  };

  const formatEventType = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getEventIcon = (type) => {
    const iconMap = {
      character_moved: '🚶',
      character_interaction: '💬',
      economic_activity: '💰',
      resource_change: '📦',
      population_change: '👥',
      conflict: '⚔️',
      trade: '🤝',
      construction: '🏗️',
      discovery: '🔍',
      birth: '👶',
      death: '💀',
      default: '📅'
    };
    return iconMap[type] || iconMap.default;
  };

  const getChangeIcon = (changeType) => {
    const iconMap = {
      character_moved: '🚶',
      character_attribute_change: '📊',
      character_relationships_changed: '💕',
      character_added: '✨',
      character_removed: '👻',
      node_resources_changed: '📦',
      node_population_changed: '👥',
      default: '🔄'
    };
    return iconMap[changeType] || iconMap.default;
  };

  if (!turnManager || !turnStats) {
    return (
      <div className={`turn-based-interface ${className}`}>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Initializing turn-based simulation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`turn-based-interface ${className}`}>
      {/* Main control panel */}
      <div className="turn-control-panel">
        <div className="turn-info">
          <div className="turn-counter">
            <span className="turn-label">Turn</span>
            <span className="turn-number">{turnStats.currentTurn}</span>
            {turnStats.maxTurns && (
              <span className="turn-limit">of {turnStats.maxTurns}</span>
            )}
          </div>
          
          <div className="turn-status">
            {isProcessing && (
              <div className="processing-indicator">
                <div className="processing-spinner"></div>
                <span>Processing Turn...</span>
              </div>
            )}
            {turnStats.isPaused && !isProcessing && (
              <div className="paused-indicator">⏸️ Paused</div>
            )}
            {!turnStats.canContinue && (
              <div className="completed-indicator">🏁 Max Turns Reached</div>
            )}
          </div>
        </div>

        <div className="turn-controls">
          <button
            className={`next-turn-btn ${!turnStats.canContinue || isProcessing || turnStats.isPaused ? 'disabled' : ''}`}
            onClick={handleNextTurn}
            disabled={!turnStats.canContinue || isProcessing || turnStats.isPaused}
          >
            {isProcessing ? (
              <>
                <div className="btn-spinner"></div>
                Processing...
              </>
            ) : (
              <>
                <span className="btn-icon">⏭️</span>
                Next Turn
              </>
            )}
          </button>

          <div className="secondary-controls">
            {turnStats.isPaused ? (
              <button className="control-btn resume-btn" onClick={handleResume}>
                ▶️ Resume
              </button>
            ) : (
              <button className="control-btn pause-btn" onClick={handlePause}>
                ⏸️ Pause
              </button>
            )}
            
            <button className="control-btn reset-btn" onClick={handleReset}>
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="error-panel">
          <div className="error-header">
            <span className="error-icon">⚠️</span>
            <span className="error-title">Turn Processing Error</span>
          </div>
          <div className="error-message">{error}</div>
          <button className="dismiss-error-btn" onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Turn summaries */}
      {recentSummaries.length > 0 && (
        <div className="turn-summaries-section">
          <div className="section-header">
            <h3>Recent Turns</h3>
            <button 
              className="toggle-details-btn"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '👁️ Hide Details' : '👁️ Show Details'}
            </button>
          </div>

          <div className="turn-summaries">
            {recentSummaries.map((summary, index) => (
              <div 
                key={summary.turn} 
                className={`turn-summary ${expandedSummary === summary.turn ? 'expanded' : ''} ${index === 0 ? 'latest' : ''}`}
              >
                <div 
                  className="summary-header"
                  onClick={() => toggleSummaryExpansion(summary.turn)}
                >
                  <div className="summary-info">
                    <span className="summary-turn">Turn {summary.turn}</span>
                    <span className="summary-text">{summary.summary}</span>
                  </div>
                  <div className="summary-stats">
                    <span className="event-count">{summary.events.length} events</span>
                    <span className="change-count">{summary.changes.length} changes</span>
                    <span className="expand-icon">
                      {expandedSummary === summary.turn ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {expandedSummary === summary.turn && showDetails && (
                  <div className="summary-details">
                    {/* Changes */}
                    {summary.changes.length > 0 && (
                      <div className="changes-section">
                        <h5>Changes:</h5>
                        <div className="changes-list">
                          {summary.changes.map((change, changeIndex) => (
                            <div key={changeIndex} className="change-item">
                              <span className="change-icon">{getChangeIcon(change.type)}</span>
                              <span className="change-description">
                                {change.type === 'character_moved' && (
                                  `${change.character} moved from ${change.fromNode} to ${change.toNode}`
                                )}
                                {change.type === 'character_attribute_change' && (
                                  `${change.character} attributes changed`
                                )}
                                {change.type === 'character_relationships_changed' && (
                                  `${change.character} relationships ${change.change > 0 ? 'gained' : 'lost'} ${Math.abs(change.change)}`
                                )}
                                {change.type === 'node_population_changed' && (
                                  `${change.node} population ${change.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change.change)}`
                                )}
                                {change.type === 'node_resources_changed' && (
                                  `${change.node} resources updated`
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Events */}
                    {summary.events.length > 0 && (
                      <div className="events-section">
                        <h5>Events:</h5>
                        <div className="events-list">
                          {summary.events.map((event, eventIndex) => (
                            <div key={eventIndex} className="event-item">
                              <span className="event-icon">{getEventIcon(event.type)}</span>
                              <div className="event-details">
                                <span className="event-type">{formatEventType(event.type)}</span>
                                {event.description && (
                                  <span className="event-description">{event.description}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Statistics */}
                    {summary.statistics && Object.keys(summary.statistics).length > 0 && (
                      <div className="statistics-section">
                        <h5>Statistics:</h5>
                        <div className="stats-grid">
                          {Object.entries(summary.statistics).map(([key, value]) => (
                            <div key={key} className="stat-item">
                              <span className="stat-label">{formatEventType(key)}</span>
                              <span className="stat-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent events panel */}
      {showEvents && recentEvents.length > 0 && (
        <div className="recent-events-section">
          <div className="section-header">
            <h3>Recent Events</h3>
            <button 
              className="toggle-events-btn"
              onClick={() => setShowEvents(false)}
            >
              Hide Events
            </button>
          </div>

          <div className="recent-events">
            {recentEvents.map((event, index) => (
              <div key={index} className="event-entry">
                <div className="event-turn">T{event.turn}</div>
                <div className="event-icon">{getEventIcon(event.type)}</div>
                <div className="event-info">
                  <div className="event-type">{formatEventType(event.type)}</div>
                  {event.description && (
                    <div className="event-description">{event.description}</div>
                  )}
                  {event.characters && (
                    <div className="event-characters">
                      Characters: {event.characters.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show events button when hidden */}
      {!showEvents && (
        <div className="show-events-section">
          <button 
            className="show-events-btn"
            onClick={() => setShowEvents(true)}
          >
            📅 Show Recent Events
          </button>
        </div>
      )}

      {/* Simulation statistics */}
      <div className="simulation-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">History Size</span>
            <span className="stat-value">{turnStats.historySize}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Events</span>
            <span className="stat-value">{turnStats.eventCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Summaries</span>
            <span className="stat-value">{turnStats.summaryCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnBasedInterface;
