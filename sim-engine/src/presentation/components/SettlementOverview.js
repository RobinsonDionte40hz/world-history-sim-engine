// src/presentation/components/SettlementOverview.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ManageSettlementDevelopment from '../../application/use-cases/ManageSettlementDevelopment.js';
import './SettlementOverview.css';

/**
 * SettlementOverview - Component for displaying settlement information and development
 *
 * Shows settlement details, population breakdown, development progress,
 * available upgrades, and governance information. Provides interface for
 * settlement management and development planning.
 *
 * Requirements: Multi-node settlement display for Valley of Echoes demo
 */

const SettlementOverview = ({
  settlement,
  worldState,
  className = '',
  onUpgradePurchased,
  onSettlementUpdated
}) => {
  const [availableUpgrades, setAvailableUpgrades] = useState([]);
  const [developmentProgress, setDevelopmentProgress] = useState(null);
  const [governanceImpact, setGovernanceImpact] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const manageSettlementDevelopment = useMemo(() => new ManageSettlementDevelopment(), []);

  const updateSettlementData = useCallback(async () => {
    if (!settlement) return;

    try {
      // Get available upgrades
      const upgrades = manageSettlementDevelopment.getAvailableUpgrades(
        settlement,
        settlement.resources || {},
        new Set(settlement.completedUpgrades || [])
      );
      setAvailableUpgrades(upgrades);

      // Get development progress
      const progress = manageSettlementDevelopment.getDevelopmentProgress(
        settlement,
        new Set(settlement.completedUpgrades || [])
      );
      setDevelopmentProgress(progress);

      // Get governance impact
      const governance = manageSettlementDevelopment.getGovernanceDevelopmentImpact(settlement);
      setGovernanceImpact(governance);

    } catch (error) {
      console.error('Error updating settlement data:', error);
    }
  }, [settlement, manageSettlementDevelopment]);

  // Update settlement data when settlement or world state changes
  useEffect(() => {
    updateSettlementData();
  }, [settlement, worldState, updateSettlementData]);

  const handlePurchaseUpgrade = async (upgradeId) => {
    if (!settlement || isLoading) return;

    setIsLoading(true);
    try {
      const result = manageSettlementDevelopment.purchaseUpgrade(
        settlement,
        upgradeId,
        settlement.resources || {},
        new Set(settlement.completedUpgrades || [])
      );

      // Notify parent components
      if (onUpgradePurchased) {
        onUpgradePurchased(result);
      }

      if (onSettlementUpdated) {
        onSettlementUpdated(result.settlement);
      }

      // Refresh data
      await updateSettlementData();

      console.log(`Successfully purchased upgrade: ${result.upgrade.name}`);

    } catch (error) {
      console.error('Failed to purchase upgrade:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSettlementPopulation = () => {
    if (!settlement?.assignedCharacters) return 0;
    return Array.isArray(settlement.assignedCharacters)
      ? settlement.assignedCharacters.length
      : settlement.assignedCharacters.size || 0;
  };

  const getSettlementNodes = () => {
    if (!settlement?.nodes) return [];
    return Array.isArray(settlement.nodes) ? settlement.nodes : [];
  };

  const formatResource = (value) => {
    return typeof value === 'number' ? value.toLocaleString() : value;
  };

  if (!settlement) {
    return (
      <div className={`settlement-overview ${className}`}>
        <div className="settlement-overview-empty">
          <p>No settlement selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`settlement-overview ${className}`}>
      {/* Settlement Header */}
      <div className="settlement-header">
        <h3>{settlement.name}</h3>
        <div className="settlement-type">{settlement.type}</div>
        <p className="settlement-description">{settlement.description}</p>
      </div>

      {/* Settlement Stats */}
      <div className="settlement-stats">
        <div className="stat-group">
          <div className="stat-item">
            <span className="stat-label">Population</span>
            <span className="stat-value">{getSettlementPopulation()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Nodes</span>
            <span className="stat-value">{getSettlementNodes().length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Development</span>
            <span className="stat-value">
              {developmentProgress ? `${(developmentProgress.progressRatio * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Governance Information */}
      {governanceImpact && (
        <div className="settlement-governance">
          <h4>Governance Impact</h4>
          <div className="governance-metrics">
            <div className="metric">
              <span>Economic Efficiency</span>
              <span>{(governanceImpact.economicEfficiency * 100).toFixed(0)}%</span>
            </div>
            <div className="metric">
              <span>Development Speed</span>
              <span>{(governanceImpact.developmentSpeed * 100).toFixed(0)}%</span>
            </div>
            <div className="metric">
              <span>Citizen Satisfaction</span>
              <span>{(governanceImpact.citizenSatisfaction * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Resources */}
      {settlement.resources && (
        <div className="settlement-resources">
          <h4>Resources</h4>
          <div className="resource-list">
            {Object.entries(settlement.resources).map(([resource, amount]) => (
              <div key={resource} className="resource-item">
                <span className="resource-name">{resource}</span>
                <span className="resource-amount">{formatResource(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Upgrades */}
      <div className="settlement-upgrades">
        <h4>Available Upgrades ({availableUpgrades.length})</h4>

        {availableUpgrades.length === 0 ? (
          <p className="no-upgrades">No upgrades available</p>
        ) : (
          <div className="upgrades-list">
            {availableUpgrades.slice(0, 5).map((upgrade) => (
              <div key={upgrade.id} className="upgrade-item">
                <div className="upgrade-header">
                  <h5>{upgrade.name}</h5>
                  <div className="upgrade-cost">
                    {Object.entries(upgrade.cost).map(([resource, cost]) => (
                      <span key={resource} className="cost-item">
                        {resource}: {formatResource(cost)}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="upgrade-description">{upgrade.description}</p>

                {upgrade.benefits && (
                  <div className="upgrade-benefits">
                    <strong>Benefits:</strong>
                    {Object.entries(upgrade.benefits).map(([benefit, value]) => (
                      <span key={benefit} className="benefit">
                        {benefit}: +{typeof value === 'number' ? value.toFixed(2) : value}
                      </span>
                    ))}
                  </div>
                )}

                <div className="upgrade-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handlePurchaseUpgrade(upgrade.id)}
                    disabled={!upgrade.canAfford || isLoading}
                  >
                    {isLoading ? 'Purchasing...' : 'Purchase'}
                  </button>
                  {!upgrade.canAfford && (
                    <span className="insufficient-resources">Insufficient resources</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Development Progress */}
      {developmentProgress && (
        <div className="settlement-progress">
          <h4>Development Progress</h4>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${developmentProgress.progressRatio * 100}%` }}
            />
          </div>
          <div className="progress-details">
            <span>{developmentProgress.completedCount} / {developmentProgress.totalUpgrades} upgrades completed</span>
          </div>
        </div>
      )}

      {/* Nodes Overview */}
      {getSettlementNodes().length > 0 && (
        <div className="settlement-nodes">
          <h4>Settlement Districts ({getSettlementNodes().length})</h4>
          <div className="nodes-grid">
            {getSettlementNodes().map((node, index) => (
              <div key={node.id || index} className="node-item">
                <h5>{node.name || `District ${index + 1}`}</h5>
                <div className="node-type">{node.type}</div>
                {node.environmentalProperties && (
                  <div className="node-environment">
                    <span>Climate: {node.environmentalProperties.climate}</span>
                    <span>Season: {node.environmentalProperties.season}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettlementOverview;