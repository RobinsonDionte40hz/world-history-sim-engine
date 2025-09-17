import React, { useState, useMemo } from 'react';
import { useSimulationContext } from '../contexts/SimulationContext.js';
import './CrossSettlementDiplomacy.css';

/**
 * CrossSettlementDiplomacy - Component for managing cross-settlement relations
 *
 * Displays diplomatic relationships between settlements, trade agreements,
 * alliances, conflicts, and diplomatic actions. Provides interface for
 * diplomatic negotiations and relationship management.
 *
 * Requirements: Cross-settlement diplomacy interface for Valley of Echoes demo
 */

// Helper functions for diplomatic calculations
const calculateRelationship = (settlementA, settlementB, worldState) => {
  let strength = 0.5; // Neutral starting point

  // Factor 1: Shared characters/interactions
  const sharedCharacters = getSharedCharacters(settlementA, settlementB, worldState);
  strength += sharedCharacters * 0.1;

  // Factor 2: Trade relationships
  if (hasTradeAgreement(settlementA, settlementB)) {
    strength += 0.2;
  }

  // Factor 3: Alliance status
  if (hasAlliance(settlementA, settlementB)) {
    strength += 0.3;
  }

  // Factor 4: Conflicts
  if (hasConflict(settlementA, settlementB, worldState)) {
    strength -= 0.4;
  }

  // Factor 5: Distance/proximity (simplified)
  const proximityBonus = calculateProximityBonus(settlementA, settlementB);
  strength += proximityBonus;

  return Math.max(0, Math.min(1, strength));
};

const getSharedCharacters = (settlementA, settlementB, worldState) => {
  if (!worldState?.characters) return 0;

  const settlementAChars = new Set(settlementA.assignedCharacters || []);
  const settlementBChars = new Set(settlementB.assignedCharacters || []);

  // Find intersection
  const shared = [...settlementAChars].filter(charId => settlementBChars.has(charId));
  return shared.length;
};

const hasTradeAgreement = (settlementA, settlementB) => {
  // Simplified check - in real implementation, check trade agreements in world state
  return Math.random() > 0.7; // Random for demo
};

const hasAlliance = (settlementA, settlementB) => {
  // Simplified check - in real implementation, check alliances in world state
  return Math.random() > 0.8; // Random for demo
};

const hasConflict = (settlementA, settlementB, worldState) => {
  if (!worldState?.events) return false;

  return worldState.events.some(event =>
    event.type === 'conflict' &&
    ((event.settlementA === settlementA.id && event.settlementB === settlementB.id) ||
     (event.settlementA === settlementB.id && event.settlementB === settlementA.id))
  );
};

const calculateProximityBonus = (settlementA, settlementB) => {
  // Simplified proximity calculation
  // In real implementation, use actual distance calculations
  return Math.random() * 0.1; // Small random bonus
};

const getTradeStatus = (settlementA, settlementB) => {
  if (hasTradeAgreement(settlementA, settlementB)) {
    return 'active';
  }
  return 'none';
};

const getAllianceStatus = (settlementA, settlementB) => {
  if (hasAlliance(settlementA, settlementB)) {
    return 'allied';
  }
  return 'neutral';
};

const getLastInteraction = (settlementA, settlementB, worldState) => {
  if (!worldState?.events) return null;

  const relevantEvents = worldState.events.filter(event =>
    (event.settlementA === settlementA.id && event.settlementB === settlementB.id) ||
    (event.settlementA === settlementB.id && event.settlementB === settlementA.id)
  );

  if (relevantEvents.length === 0) return null;

  const lastEvent = relevantEvents.sort((a, b) => b.timestamp - a.timestamp)[0];
  return {
    type: lastEvent.type,
    timestamp: lastEvent.timestamp,
    description: lastEvent.description || `${lastEvent.type} event`
  };
};

const CrossSettlementDiplomacy = ({
  className = '',
  onDiplomacyAction,
  onRelationshipChanged
}) => {
  const { worldState } = useSimulationContext();
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [diplomacyActions, setDiplomacyActions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate diplomatic relationships
  const diplomaticRelations = useMemo(() => {
    if (!worldState?.settlements) return [];

    const settlements = worldState.settlements;
    const relations = [];

    // Generate relationships between all settlement pairs
    for (let i = 0; i < settlements.length; i++) {
      for (let j = i + 1; j < settlements.length; j++) {
        const settlementA = settlements[i];
        const settlementB = settlements[j];

        // Calculate relationship strength based on various factors
        const relationship = calculateRelationship(settlementA, settlementB);

        relations.push({
          id: `${settlementA.id}-${settlementB.id}`,
          settlementA: {
            id: settlementA.id,
            name: settlementA.name,
            type: settlementA.type
          },
          settlementB: {
            id: settlementB.id,
            name: settlementB.name,
            type: settlementB.type
          },
          relationship,
          tradeStatus: getTradeStatus(settlementA, settlementB),
          allianceStatus: getAllianceStatus(settlementA, settlementB),
          lastInteraction: getLastInteraction(settlementA, settlementB)
        });
      }
    }

    return relations;
  }, [worldState]);

  const handleSettlementSelect = (settlement) => {
    setSelectedSettlement(settlement);
  };

  const handleDiplomacyAction = async (action, targetSettlement) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      // In real implementation, this would call a diplomacy service
      const result = await performDiplomacyAction(action, selectedSettlement, targetSettlement);

      if (onDiplomacyAction) {
        onDiplomacyAction(result);
      }

      // Update diplomacy actions history
      setDiplomacyActions(prev => [{
        id: Date.now(),
        action,
        from: selectedSettlement.name,
        to: targetSettlement.name,
        timestamp: Date.now(),
        result: result.success ? 'success' : 'failed'
      }, ...prev.slice(0, 9)]); // Keep last 10 actions

    } catch (error) {
      console.error('Diplomacy action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock diplomacy action (in real implementation, this would call a service)
  const performDiplomacyAction = async (action, fromSettlement, toSettlement) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: Math.random() > 0.3, // 70% success rate
      action,
      fromSettlement: fromSettlement.id,
      toSettlement: toSettlement.id,
      timestamp: Date.now()
    };
  };

  const getRelationshipColor = (strength) => {
    if (strength >= 0.7) return '#4CAF50'; // Green - Good
    if (strength >= 0.4) return '#FF9800'; // Orange - Neutral
    return '#F44336'; // Red - Poor
  };

  const getRelationshipLabel = (strength) => {
    if (strength >= 0.7) return 'Excellent';
    if (strength >= 0.6) return 'Good';
    if (strength >= 0.4) return 'Neutral';
    if (strength >= 0.2) return 'Poor';
    return 'Terrible';
  };

  const getTradeStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getAllianceStatusColor = (status) => {
    switch (status) {
      case 'allied': return '#2196F3';
      case 'at_war': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  if (!worldState?.settlements || worldState.settlements.length < 2) {
    return (
      <div className={`cross-settlement-diplomacy ${className}`}>
        <div className="diplomacy-empty">
          <p>Need at least 2 settlements for diplomatic relations</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`cross-settlement-diplomacy ${className}`}>
      {/* Panel Header */}
      <div className="diplomacy-header">
        <h3>Cross-Settlement Diplomacy</h3>
        <div className="diplomacy-summary">
          <span className="summary-item">
            <strong>{worldState.settlements.length}</strong> Settlements
          </span>
          <span className="summary-item">
            <strong>{diplomaticRelations.length}</strong> Relationships
          </span>
        </div>
      </div>

      {/* Settlement Selection */}
      <div className="settlement-selector">
        <h4>Select Settlement</h4>
        <div className="settlement-buttons">
          {worldState.settlements.map((settlement) => (
            <button
              key={settlement.id}
              className={`settlement-button ${selectedSettlement?.id === settlement.id ? 'selected' : ''}`}
              onClick={() => handleSettlementSelect(settlement)}
            >
              {settlement.name} ({settlement.type})
            </button>
          ))}
        </div>
      </div>

      {/* Diplomatic Relations */}
      <div className="diplomatic-relations">
        <h4>Diplomatic Relations</h4>

        {selectedSettlement ? (
          <div className="relations-for-settlement">
            <h5>Relations for {selectedSettlement.name}</h5>
            <div className="relations-list">
              {diplomaticRelations
                .filter(rel => rel.settlementA.id === selectedSettlement.id || rel.settlementB.id === selectedSettlement.id)
                .map((relation) => {
                  const otherSettlement = relation.settlementA.id === selectedSettlement.id
                    ? relation.settlementB
                    : relation.settlementA;

                  return (
                    <div key={relation.id} className="relation-item">
                      <div className="relation-header">
                        <h6>{otherSettlement.name}</h6>
                        <div className="relation-status">
                          <span
                            className="relationship-badge"
                            style={{ backgroundColor: getRelationshipColor(relation.relationship) }}
                          >
                            {getRelationshipLabel(relation.relationship)}
                          </span>
                        </div>
                      </div>

                      <div className="relation-details">
                        <div className="status-item">
                          <span>Trade:</span>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: getTradeStatusColor(relation.tradeStatus) }}
                          >
                            {relation.tradeStatus}
                          </span>
                        </div>
                        <div className="status-item">
                          <span>Alliance:</span>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: getAllianceStatusColor(relation.allianceStatus) }}
                          >
                            {relation.allianceStatus}
                          </span>
                        </div>
                      </div>

                      {relation.lastInteraction && (
                        <div className="last-interaction">
                          <span>Last Interaction:</span>
                          <span>{relation.lastInteraction.description}</span>
                          <span className="interaction-time">
                            {new Date(relation.lastInteraction.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="diplomacy-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleDiplomacyAction('propose_trade', otherSettlement)}
                          disabled={isProcessing}
                        >
                          Propose Trade
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleDiplomacyAction('propose_alliance', otherSettlement)}
                          disabled={isProcessing}
                        >
                          Propose Alliance
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDiplomacyAction('declare_war', otherSettlement)}
                          disabled={isProcessing}
                        >
                          Declare War
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <p className="select-settlement-prompt">Select a settlement to view diplomatic relations</p>
        )}
      </div>

      {/* Diplomacy Actions History */}
      {diplomacyActions.length > 0 && (
        <div className="diplomacy-history">
          <h4>Recent Diplomacy Actions</h4>
          <div className="actions-list">
            {diplomacyActions.map((action) => (
              <div key={action.id} className="action-item">
                <div className="action-header">
                  <span className="action-type">{action.action.replace('_', ' ')}</span>
                  <span className={`action-result ${action.result}`}>
                    {action.result}
                  </span>
                </div>
                <div className="action-details">
                  {action.from} → {action.to}
                </div>
                <div className="action-time">
                  {new Date(action.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diplomacy Overview */}
      <div className="diplomacy-overview">
        <h4>Diplomacy Overview</h4>
        <div className="overview-stats">
          <div className="stat-item">
            <span className="stat-label">Active Trade Agreements</span>
            <span className="stat-value">
              {diplomaticRelations.filter(r => r.tradeStatus === 'active').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Alliances</span>
            <span className="stat-value">
              {diplomaticRelations.filter(r => r.allianceStatus === 'allied').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Conflicts</span>
            <span className="stat-value">
              {diplomaticRelations.filter(r => r.allianceStatus === 'at_war').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Relationship</span>
            <span className="stat-value">
              {(diplomaticRelations.reduce((sum, r) => sum + r.relationship, 0) / diplomaticRelations.length * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossSettlementDiplomacy;