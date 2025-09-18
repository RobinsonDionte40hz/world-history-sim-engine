/**
 * LODStatusIndicator - Component for displaying Level of Detail status
 *
 * Shows real-time breakdown of characters across LOD tiers (Hero/Group/Background).
 * Displays LOD processing metrics and recent tier transitions.
 * Provides visual indicators for LOD system health and performance.
 *
 * Requirements: LOD system visualization for Valley of Echoes demo
 */

import React, { useState, useEffect } from 'react';
import './LODStatusIndicator.css';

const LODStatusIndicator = ({
  worldState,
  lodManager,
  className = ''
}) => {
  const [lodStats, setLodStats] = useState(null);
  const [recentTransitions, setRecentTransitions] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update LOD statistics
  useEffect(() => {
    if (!worldState?.characters || !lodManager) return;

    try {
      // Handle both Map and Array structures
      let characters;
      if (worldState.characters instanceof Map) {
        characters = Array.from(worldState.characters.values());
      } else if (Array.isArray(worldState.characters)) {
        characters = worldState.characters;
      } else {
        console.warn('LODStatusIndicator: characters is neither Map nor Array:', typeof worldState.characters);
        return;
      }

      // Get current LOD breakdown
      const stats = {
        hero: characters.filter(c => c.lodTier === 'hero').length,
        group: characters.filter(c => c.lodTier === 'group').length,
        background: characters.filter(c => c.lodTier === 'background').length,
        total: characters.length
      };

      setLodStats(stats);

      // Get recent LOD transitions from events
      const transitions = (worldState.events || [])
        .filter(event => event.type === 'lod_promotion' || event.type === 'lod_demotion')
        .slice(-5) // Last 5 transitions
        .reverse(); // Most recent first

      setRecentTransitions(transitions);

    } catch (error) {
      console.error('Error updating LOD stats:', error);
    }
  }, [worldState, lodManager]);

  if (!lodStats) {
    return (
      <div className={`lod-status-indicator ${className}`}>
        <div className="lod-loading">Loading LOD status...</div>
      </div>
    );
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case 'hero': return '#ff6b6b'; // Red for detailed processing
      case 'group': return '#4ecdc4'; // Teal for group processing
      case 'background': return '#95a5a6'; // Gray for background
      default: return '#bdc3c7';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'hero': return '👤';
      case 'group': return '👥';
      case 'background': return '🌍';
      default: return '❓';
    }
  };

  const getTransitionIcon = (type) => {
    return type === 'lod_promotion' ? '⬆️' : '⬇️';
  };

  return (
    <div className={`lod-status-indicator ${className}`}>
      <div
        className="lod-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="lod-title">
          <span className="lod-icon">🎯</span>
          LOD Status
        </div>
        <div className="lod-summary">
          <span className="lod-count hero">{lodStats.hero}</span>
          <span className="lod-separator">/</span>
          <span className="lod-count group">{lodStats.group}</span>
          <span className="lod-separator">/</span>
          <span className="lod-count background">{lodStats.background}</span>
          <span className="lod-expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="lod-details">
          {/* LOD Tier Breakdown */}
          <div className="lod-breakdown">
            <h4>Character Distribution</h4>
            <div className="lod-tiers">
              <div className="lod-tier" style={{ borderColor: getTierColor('hero') }}>
                <div className="lod-tier-header">
                  <span className="lod-tier-icon">{getTierIcon('hero')}</span>
                  <span className="lod-tier-name">Hero NPCs</span>
                  <span className="lod-tier-count">{lodStats.hero}</span>
                </div>
                <div className="lod-tier-desc">Full consciousness simulation</div>
                <div className="lod-tier-bar">
                  <div
                    className="lod-tier-fill"
                    style={{
                      width: `${lodStats.total > 0 ? (lodStats.hero / lodStats.total) * 100 : 0}%`,
                      backgroundColor: getTierColor('hero')
                    }}
                  />
                </div>
              </div>

              <div className="lod-tier" style={{ borderColor: getTierColor('group') }}>
                <div className="lod-tier-header">
                  <span className="lod-tier-icon">{getTierIcon('group')}</span>
                  <span className="lod-tier-name">Population Groups</span>
                  <span className="lod-tier-count">{lodStats.group}</span>
                </div>
                <div className="lod-tier-desc">Statistical modeling</div>
                <div className="lod-tier-bar">
                  <div
                    className="lod-tier-fill"
                    style={{
                      width: `${lodStats.total > 0 ? (lodStats.group / lodStats.total) * 100 : 0}%`,
                      backgroundColor: getTierColor('group')
                    }}
                  />
                </div>
              </div>

              <div className="lod-tier" style={{ borderColor: getTierColor('background') }}>
                <div className="lod-tier-header">
                  <span className="lod-tier-icon">{getTierIcon('background')}</span>
                  <span className="lod-tier-name">Background</span>
                  <span className="lod-tier-count">{lodStats.background}</span>
                </div>
                <div className="lod-tier-desc">Aggregate tracking</div>
                <div className="lod-tier-bar">
                  <div
                    className="lod-tier-fill"
                    style={{
                      width: `${lodStats.total > 0 ? (lodStats.background / lodStats.total) * 100 : 0}%`,
                      backgroundColor: getTierColor('background')
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transitions */}
          {recentTransitions.length > 0 && (
            <div className="lod-transitions">
              <h4>Recent Transitions</h4>
              <div className="lod-transition-list">
                {recentTransitions.map((transition, index) => (
                  <div key={index} className="lod-transition">
                    <span className="lod-transition-icon">
                      {getTransitionIcon(transition.type)}
                    </span>
                    <span className="lod-transition-name">
                      {transition.characterName || transition.characterId}
                    </span>
                    <span className="lod-transition-tiers">
                      {transition.fromTier} → {transition.toTier}
                    </span>
                    <span className="lod-transition-reason">
                      {transition.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="lod-performance">
            <h4>Performance</h4>
            <div className="lod-metrics">
              <div className="lod-metric">
                <span className="lod-metric-label">Total Characters:</span>
                <span className="lod-metric-value">{lodStats.total}</span>
              </div>
              <div className="lod-metric">
                <span className="lod-metric-label">Active Processing:</span>
                <span className="lod-metric-value">{lodStats.hero + lodStats.group}</span>
              </div>
              <div className="lod-metric">
                <span className="lod-metric-label">Background:</span>
                <span className="lod-metric-value">{lodStats.background}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LODStatusIndicator;