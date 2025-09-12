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
      dialogue: '🗨️',
      social_interaction: '👥',
      conversation: '💭',
      economic_activity: '💰',
      resource_change: '📦',
      population_change: '👥',
      conflict: '⚔️',
      trade: '🤝',
      construction: '🏗️',
      discovery: '🔍',
      birth: '👶',
      death: '💀',
      romance: '💕',
      friendship: '🤝',
      rivalry: '⚡',
      betrayal: '🗡️',
      default: '📅'
    };
    return iconMap[type] || iconMap.default;
  };

  const renderDialogueContent = (event) => {
    // Check if the event contains dialogue data
    if (event.dialogue) {
      return (
        <div className="dialogue-content">
          <div className="dialogue-bubble">
            <span className="dialogue-speaker">{event.speaker || 'Character'}:</span>
            <span className="dialogue-text">"{event.dialogue}"</span>
          </div>
          {event.response && (
            <div className="dialogue-response">
              <span className="response-speaker">{event.responseBy || 'Response'}:</span>
              <span className="response-text">"{event.response}"</span>
            </div>
          )}
        </div>
      );
    }

    // Check if the event has branches (dialogue choices)
    if (event.branches && event.branches.length > 0) {
      return (
        <div className="dialogue-branches">
          <div className="branch-label">Dialogue Options:</div>
          {event.branches.slice(0, 3).map((branch, index) => (
            <div key={index} className="dialogue-branch">
              "{branch.text || branch.description}"
              {branch.outcome && (
                <span className="branch-outcome"> → {branch.outcome}</span>
              )}
            </div>
          ))}
          {event.branches.length > 3 && (
            <div className="more-branches">...and {event.branches.length - 3} more options</div>
          )}
        </div>
      );
    }

    // Check for conversation summary
    if (event.conversationSummary) {
      return (
        <div className="conversation-summary">
          <div className="summary-label">Conversation:</div>
          <div className="summary-text">{event.conversationSummary}</div>
          {event.mood && (
            <div className="conversation-mood">Mood: {event.mood}</div>
          )}
        </div>
      );
    }

    // Check for templated text content
    if (event.template || event.resolvedText) {
      return (
        <div className="templated-dialogue">
          <div className="template-result">
            "{event.resolvedText || event.template}"
          </div>
          {event.context && (
            <div className="template-context">
              Context: {Object.keys(event.context).join(', ')}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const getChangeIcon = (changeType) => {
    const iconMap = {
      character_moved: '🚶',
      character_attribute_change: '📊',
      character_relationships_changed: '💕',
      character_emotional_change: '😊',
      character_consciousness_change: '🧠',
      character_goal_change: '🎯',
      character_added: '✨',
      character_removed: '👻',
      node_resources_changed: '📦',
      node_population_changed: '👥',
      settlement_economic_change: '💰',
      settlement_social_change: '🏛️',
      environmental_change: '🌍',
      default: '🔄'
    };
    return iconMap[changeType] || iconMap.default;
  };

  const formatChangeTitle = (changeType) => {
    const titleMap = {
      character_moved: 'Character Movement',
      character_attribute_change: 'Attribute Changes',
      character_relationships_changed: 'Relationship Shifts',
      character_emotional_change: 'Emotional State Changes',
      character_consciousness_change: 'Consciousness Evolution',
      character_goal_change: 'Goal Adjustments',
      character_added: 'New Character',
      character_removed: 'Character Departure',
      node_resources_changed: 'Resource Fluctuations',
      node_population_changed: 'Population Dynamics',
      settlement_economic_change: 'Economic Activity',
      settlement_social_change: 'Social Developments',
      environmental_change: 'Environmental Shifts'
    };
    return titleMap[changeType] || formatEventType(changeType);
  };

  const renderChangeDescription = (change) => {
    switch (change.type) {
      case 'character_moved':
        return (
          <div className="change-details">
            <span className="character-name">{change.character}</span> traveled from{' '}
            <span className="location-name">{change.fromNode}</span> to{' '}
            <span className="location-name">{change.toNode}</span>
            {change.reason && <div className="change-reason">Reason: {change.reason}</div>}
          </div>
        );
      
      case 'character_emotional_change':
        return (
          <div className="change-details">
            <span className="character-name">{change.character}</span>'s emotional state shifted
            {change.fromEmotion && change.toEmotion && (
              <div className="emotion-shift">
                {change.fromEmotion} → {change.toEmotion}
              </div>
            )}
            {change.intensity && (
              <div className="emotion-intensity">Intensity: {(change.intensity * 100).toFixed(0)}%</div>
            )}
          </div>
        );
      
      case 'character_consciousness_change':
        return (
          <div className="change-details">
            <span className="character-name">{change.character}</span>'s consciousness evolved
            {change.frequency && (
              <div className="consciousness-metrics">
                Frequency: {change.frequency.toFixed(1)} Hz
                {change.coherence && ` | Coherence: ${(change.coherence * 100).toFixed(0)}%`}
              </div>
            )}
          </div>
        );
      
      case 'character_relationships_changed':
        return (
          <div className="change-details">
            <span className="character-name">{change.character}</span> relationship dynamics
            {change.target && (
              <div className="relationship-details">
                with <span className="character-name">{change.target}</span>:{' '}
                {change.change > 0 ? 'improved' : 'deteriorated'} by {Math.abs(change.change)}
              </div>
            )}
          </div>
        );
      
      case 'settlement_economic_change':
        return (
          <div className="change-details">
            Economic activity in <span className="location-name">{change.settlement}</span>
            {change.economicData && (
              <div className="economic-metrics">
                {change.economicData.wealth && `Wealth: ${change.economicData.wealth}`}
                {change.economicData.trade && ` | Trade: ${change.economicData.trade}`}
                {change.economicData.growth && ` | Growth: ${(change.economicData.growth * 100).toFixed(1)}%`}
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="change-details">
            {change.description || `${change.type} occurred`}
            {change.magnitude && (
              <div className="change-magnitude">Magnitude: {change.magnitude}</div>
            )}
          </div>
        );
    }
  };

  const formatStatLabel = (key) => {
    const labelMap = {
      totalEvents: 'Total Events',
      characterInteractions: 'Character Interactions',
      economicActivity: 'Economic Activity',
      populationChanges: 'Population Changes',
      resourceChanges: 'Resource Changes',
      emotionalEvents: 'Emotional Events',
      consciousnessShifts: 'Consciousness Changes',
      relationshipChanges: 'Relationship Shifts',
      goalAchievements: 'Goals Achieved',
      socialEvents: 'Social Interactions',
      environmentalEffects: 'Environmental Changes'
    };
    return labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const formatStatValue = (value) => {
    if (typeof value === 'number') {
      if (value > 1000) {
        return `${(value / 1000).toFixed(1)}k`;
      }
      return value.toString();
    }
    return value;
  };

  const getStatTrend = (key, value) => {
    // This would ideally compare with previous turns
    // For now, return null - could be enhanced with historical data
    return null;
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
      {/* Information Panel Only - No Controls */}
      <div className="turn-info-panel">
        <div className="panel-header">
          <h3 className="panel-title">Simulation Status</h3>
          <div className="turn-display">
            <span className="turn-label">Turn:</span>
            <span className="turn-number">{turnStats.currentTurn}</span>
            {turnStats.maxTurns && (
              <span className="turn-limit">/ {turnStats.maxTurns}</span>
            )}
          </div>
        </div>
        
        <div className="status-indicators">
          {isProcessing && (
            <div className="status-item processing">
              <div className="status-spinner"></div>
              <span>Processing Turn...</span>
            </div>
          )}
          {turnStats.isPaused && !isProcessing && (
            <div className="status-item paused">⏸️ Simulation Paused</div>
          )}
          {!turnStats.canContinue && (
            <div className="status-item completed">🏁 Max Turns Reached</div>
          )}
          {!isProcessing && !turnStats.isPaused && turnStats.canContinue && (
            <div className="status-item active">▶️ Simulation Ready</div>
          )}
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
                    {/* Enhanced Character & World Changes */}
                    {summary.changes.length > 0 && (
                      <div className="changes-section">
                        <h5>📊 World Changes</h5>
                        <div className="changes-list">
                          {summary.changes.map((change, changeIndex) => (
                            <div key={changeIndex} className="change-item detailed">
                              <span className="change-icon">{getChangeIcon(change.type)}</span>
                              <div className="change-content">
                                <div className="change-title">{formatChangeTitle(change.type)}</div>
                                <div className="change-description">
                                  {renderChangeDescription(change)}
                                </div>
                                {change.impact && (
                                  <div className="change-impact">
                                    Impact: {change.impact}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Events with Dialogue */}
                    {summary.events.length > 0 && (
                      <div className="events-section">
                        <h5>🎭 Events & Interactions</h5>
                        <div className="events-list">
                          {summary.events.map((event, eventIndex) => (
                            <div key={eventIndex} className="event-item detailed">
                              <span className="event-icon">{getEventIcon(event.type)}</span>
                              <div className="event-content">
                                <div className="event-header">
                                  <span className="event-type">{formatEventType(event.type)}</span>
                                  {event.significance && (
                                    <span className="event-significance">
                                      ⭐ {event.significance}/10
                                    </span>
                                  )}
                                </div>
                                
                                {event.description && (
                                  <div className="event-description">{event.description}</div>
                                )}

                                {/* Dialogue Content */}
                                {renderDialogueContent(event)}

                                {/* Event Participants */}
                                {event.characters && event.characters.length > 0 && (
                                  <div className="event-participants">
                                    👥 Involved: {event.characters.join(', ')}
                                  </div>
                                )}
                                
                                {/* Event Location */}
                                {event.location && (
                                  <div className="event-location">
                                    📍 Location: {event.location}
                                  </div>
                                )}
                                
                                {/* Event Consequences */}
                                {event.consequences && (
                                  <div className="event-consequences">
                                    ⚡ Consequences: {event.consequences}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Statistics */}
                    {summary.statistics && Object.keys(summary.statistics).length > 0 && (
                      <div className="statistics-section">
                        <h5>📈 Turn Statistics</h5>
                        <div className="stats-grid enhanced">
                          {Object.entries(summary.statistics).map(([key, value]) => (
                            <div key={key} className="stat-item enhanced">
                              <div className="stat-content">
                                <span className="stat-label">{formatStatLabel(key)}</span>
                                <span className="stat-value">{formatStatValue(value)}</span>
                                {getStatTrend(key, value) && (
                                  <span className="stat-trend">{getStatTrend(key, value)}</span>
                                )}
                              </div>
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

      {/* Enhanced Recent Events Panel with Dialogue */}
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
              <div key={index} className="event-entry enhanced">
                <div className="event-header">
                  <div className="event-turn">T{event.turn}</div>
                  <div className="event-icon">{getEventIcon(event.type)}</div>
                  <div className="event-meta">
                    <div className="event-type">{formatEventType(event.type)}</div>
                    {event.significance && (
                      <div className="event-significance">⭐ {event.significance}/10</div>
                    )}
                  </div>
                </div>
                
                <div className="event-content">
                  {event.description && (
                    <div className="event-description">{event.description}</div>
                  )}
                  
                  {/* Dialogue Content in Recent Events */}
                  {renderDialogueContent(event)}
                  
                  <div className="event-details">
                    {event.characters && (
                      <div className="event-characters">
                        👥 {event.characters.join(', ')}
                      </div>
                    )}
                    {event.location && (
                      <div className="event-location">
                        📍 {event.location}
                      </div>
                    )}
                    {event.consequences && (
                      <div className="event-consequences">
                        ⚡ {event.consequences}
                      </div>
                    )}
                  </div>
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
