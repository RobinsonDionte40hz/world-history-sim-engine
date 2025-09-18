// src/presentation/components/PopulationGroupPanel.js

import React, { useState, useMemo } from 'react';
import { useLODContext } from '../contexts/LODContext.js';
import './PopulationGroupPanel.css';

/**
 * PopulationGroupPanel - Component for displaying population group statistics
 *
 * Shows statistical overview of population groups, LOD tier distribution,
 * demographic information, and group behavior patterns. Provides insights
 * into population dynamics and LOD system effectiveness.
 *
 * Requirements: Population group display for Valley of Echoes demo
 */

const PopulationGroupPanel = ({
  worldState,
  className = '',
  onGroupSelected,
  onTierChanged
}) => {
  const { changeCharacterTier } = useLODContext();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isChangingTier, setIsChangingTier] = useState(false);

  // Calculate population group statistics
  const populationStats = useMemo(() => {
    if (!worldState?.characters) return null;

    // Handle both Map and Array structures
    let characters;
    if (worldState.characters instanceof Map) {
      characters = Array.from(worldState.characters.values());
    } else if (Array.isArray(worldState.characters)) {
      characters = worldState.characters;
    } else {
      console.warn('PopulationGroupPanel: characters is neither Map nor Array:', typeof worldState.characters);
      return null;
    }

    const groups = characters.filter(c => c.isPopulationGroup || c.groupSize > 1);
    const individuals = characters.filter(c => !c.isPopulationGroup && (!c.groupSize || c.groupSize <= 1));

    // Group by LOD tier
    const tierBreakdown = {
      hero: groups.filter(c => c.lodTier === 'hero').length,
      group: groups.filter(c => c.lodTier === 'group').length,
      background: groups.filter(c => c.lodTier === 'background').length
    };

    // Calculate demographic statistics
    const totalPopulation = groups.reduce((sum, group) => sum + (group.groupSize || 1), 0);
    const averageGroupSize = groups.length > 0 ? totalPopulation / groups.length : 0;

    // Age distribution (if available)
    const ageStats = characters.reduce((stats, char) => {
      if (char.age !== undefined) {
        stats.total++;
        stats.sum += char.age;
        stats.min = Math.min(stats.min, char.age);
        stats.max = Math.max(stats.max, char.age);
      }
      return stats;
    }, { total: 0, sum: 0, min: Infinity, max: 0 });

    const averageAge = ageStats.total > 0 ? ageStats.sum / ageStats.total : 0;

    return {
      totalGroups: groups.length,
      totalIndividuals: individuals.length,
      totalPopulation: totalPopulation + individuals.length,
      averageGroupSize: Math.round(averageGroupSize * 10) / 10,
      tierBreakdown,
      ageStats: {
        average: Math.round(averageAge * 10) / 10,
        min: ageStats.min === Infinity ? 0 : ageStats.min,
        max: ageStats.max,
        total: ageStats.total
      }
    };
  }, [worldState]);

  // Get population groups
  const populationGroups = useMemo(() => {
    if (!worldState?.characters) return [];

    // Handle both Map and Array structures
    let characters;
    if (worldState.characters instanceof Map) {
      characters = Array.from(worldState.characters.values());
    } else if (Array.isArray(worldState.characters)) {
      characters = worldState.characters;
    } else {
      console.warn('PopulationGroupPanel: characters is neither Map nor Array:', typeof worldState.characters);
      return [];
    }

    return characters
      .filter(c => c.isPopulationGroup || c.groupSize > 1)
      .map(group => ({
        id: group.id,
        name: group.name || `Group ${group.id}`,
        size: group.groupSize || 1,
        lodTier: group.lodTier || 'background',
        type: group.type || 'population',
        attributes: group.attributes || {},
        location: group.location || 'Unknown',
        description: group.description || ''
      }));
  }, [worldState]);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    if (onGroupSelected) {
      onGroupSelected(group);
    }
  };

  const handleTierChange = async (groupId, newTier) => {
    if (isChangingTier) return;

    setIsChangingTier(true);
    try {
      const success = await changeCharacterTier(groupId, newTier);
      if (success && onTierChanged) {
        onTierChanged(groupId, newTier);
      }
    } catch (error) {
      console.error('Failed to change group tier:', error);
    } finally {
      setIsChangingTier(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'hero': return '#ff6b6b';
      case 'group': return '#4ecdc4';
      case 'background': return '#45b7d1';
      default: return '#95a5a6';
    }
  };

  const getTierLabel = (tier) => {
    switch (tier) {
      case 'hero': return 'Hero';
      case 'group': return 'Group';
      case 'background': return 'Background';
      default: return 'Unknown';
    }
  };

  if (!populationStats) {
    return (
      <div className={`population-group-panel ${className}`}>
        <div className="panel-loading">
          <p>Loading population data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`population-group-panel ${className}`}>
      {/* Panel Header */}
      <div className="panel-header">
        <h3>Population Groups</h3>
        <div className="population-summary">
          <span className="summary-item">
            <strong>{populationStats.totalGroups}</strong> Groups
          </span>
          <span className="summary-item">
            <strong>{populationStats.totalPopulation.toLocaleString()}</strong> Total Population
          </span>
          <span className="summary-item">
            <strong>{populationStats.averageGroupSize}</strong> Avg Group Size
          </span>
        </div>
      </div>

      {/* LOD Tier Distribution */}
      <div className="tier-distribution">
        <h4>LOD Tier Distribution</h4>
        <div className="tier-bars">
          {Object.entries(populationStats.tierBreakdown).map(([tier, count]) => {
            const percentage = populationStats.totalGroups > 0 ? (count / populationStats.totalGroups) * 100 : 0;
            return (
              <div key={tier} className="tier-bar">
                <div className="tier-label">
                  <span
                    className="tier-indicator"
                    style={{ backgroundColor: getTierColor(tier) }}
                  />
                  {getTierLabel(tier)}
                </div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getTierColor(tier)
                    }}
                  />
                </div>
                <div className="tier-count">
                  {count} ({percentage.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demographic Statistics */}
      <div className="demographic-stats">
        <h4>Demographics</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Average Age</span>
            <span className="stat-value">
              {populationStats.ageStats.average > 0 ? `${populationStats.ageStats.average} years` : 'N/A'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Age Range</span>
            <span className="stat-value">
              {populationStats.ageStats.min !== Infinity ?
                `${populationStats.ageStats.min} - ${populationStats.ageStats.max}` :
                'N/A'
              }
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Individuals</span>
            <span className="stat-value">{populationStats.totalIndividuals}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Groups</span>
            <span className="stat-value">{populationStats.totalGroups}</span>
          </div>
        </div>
      </div>

      {/* Population Groups List */}
      <div className="groups-list">
        <h4>Population Groups ({populationGroups.length})</h4>

        {populationGroups.length === 0 ? (
          <p className="no-groups">No population groups found</p>
        ) : (
          <div className="groups-container">
            {populationGroups.map((group) => (
              <div
                key={group.id}
                className={`group-item ${selectedGroup?.id === group.id ? 'selected' : ''}`}
                onClick={() => handleGroupSelect(group)}
              >
                <div className="group-header">
                  <h5>{group.name}</h5>
                  <div className="group-tier">
                    <span
                      className="tier-badge"
                      style={{ backgroundColor: getTierColor(group.lodTier) }}
                    >
                      {getTierLabel(group.lodTier)}
                    </span>
                  </div>
                </div>

                <div className="group-details">
                  <div className="group-stat">
                    <span>Size:</span>
                    <strong>{group.size}</strong>
                  </div>
                  <div className="group-stat">
                    <span>Type:</span>
                    <span>{group.type}</span>
                  </div>
                  <div className="group-stat">
                    <span>Location:</span>
                    <span>{group.location}</span>
                  </div>
                </div>

                {group.description && (
                  <p className="group-description">{group.description}</p>
                )}

                {/* Tier Change Controls */}
                <div className="tier-controls">
                  <label>Change Tier:</label>
                  <select
                    value={group.lodTier}
                    onChange={(e) => handleTierChange(group.id, e.target.value)}
                    disabled={isChangingTier}
                  >
                    <option value="background">Background</option>
                    <option value="group">Group</option>
                    <option value="hero">Hero</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Group Details */}
      {selectedGroup && (
        <div className="selected-group-details">
          <h4>Group Details: {selectedGroup.name}</h4>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">ID:</span>
              <span className="detail-value">{selectedGroup.id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Size:</span>
              <span className="detail-value">{selectedGroup.size}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">LOD Tier:</span>
              <span
                className="detail-value tier-indicator"
                style={{ backgroundColor: getTierColor(selectedGroup.lodTier) }}
              >
                {getTierLabel(selectedGroup.lodTier)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{selectedGroup.type}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Location:</span>
              <span className="detail-value">{selectedGroup.location}</span>
            </div>
          </div>

          {selectedGroup.attributes && Object.keys(selectedGroup.attributes).length > 0 && (
            <div className="group-attributes">
              <h5>Attributes</h5>
              <div className="attributes-list">
                {Object.entries(selectedGroup.attributes).map(([attr, value]) => (
                  <div key={attr} className="attribute-item">
                    <span className="attribute-name">{attr}:</span>
                    <span className="attribute-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PopulationGroupPanel;