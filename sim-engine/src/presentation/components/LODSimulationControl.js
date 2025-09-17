/**
 * LODSimulationControl - Enhanced simulation control with LOD integration
 *
 * Provides turn-based simulation controls with LOD-aware processing.
 * Shows processing status, performance metrics, and LOD system health.
 * Integrates with ProcessTurnWithLOD use case for complete turn execution.
 *
 * Requirements: LOD-integrated simulation control for Valley of Echoes demo
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSimulationContext } from '../contexts/SimulationContext.js';
import processTurnWithLOD from '../../application/use-cases/simulation/ProcessTurnWithLOD.js';
import { LODManager } from '../../domain/services/LODManager.js';
import HistoryGenerator from '../../domain/services/HistoryGenerator.js';
import './LODSimulationControl.css';

const LODSimulationControl = ({
  className = '',
  onTurnProcessed,
  onError
}) => {
  const {
    worldState,
    currentTurn,
    setWorldState,
    setCurrentTurn
  } = useSimulationContext();

  const [lodManager] = useState(() => new LODManager());
  const [historyGenerator] = useState(() => new HistoryGenerator());
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTurnResult, setLastTurnResult] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState(null);

  // Process next turn with LOD integration
  const processNextTurn = useCallback(async () => {
    if (!worldState || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setProcessingStatus('Initializing LOD turn processing...');

    try {
      // Execute LOD-integrated turn processing
      setProcessingStatus('Processing pre-turn LOD phase...');
      const result = await processTurnWithLOD(worldState, lodManager, historyGenerator);

      setProcessingStatus('Updating simulation state...');

      // Update simulation state
      setWorldState(result.worldState);
      setCurrentTurn(result.worldState.turn);
      setLastTurnResult(result.turnResults);

      setProcessingStatus('Turn completed successfully');

      // Notify parent component
      if (onTurnProcessed) {
        onTurnProcessed(result);
      }

      // Clear status after a delay
      setTimeout(() => {
        setProcessingStatus('');
      }, 3000);

    } catch (error) {
      console.error('Error processing LOD turn:', error);
      setError(error.message);
      setProcessingStatus('Turn processing failed');

      if (onError) {
        onError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [worldState, lodManager, historyGenerator, setWorldState, setCurrentTurn, onTurnProcessed, onError, isProcessing]);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getProcessingPhase = () => {
    if (!processingStatus) return null;

    if (processingStatus.includes('pre-turn')) return 'Pre-turn LOD';
    if (processingStatus.includes('main turn')) return 'Main Processing';
    if (processingStatus.includes('post-turn')) return 'Post-turn LOD';
    if (processingStatus.includes('Updating')) return 'State Update';
    if (processingStatus.includes('completed')) return 'Complete';
    if (processingStatus.includes('failed')) return 'Failed';

    return 'Processing';
  };

  const getLODHealthStatus = () => {
    if (!lastTurnResult?.lodResults) return 'unknown';

    const { preTurn, postTurn } = lastTurnResult.lodResults;

    if (preTurn?.success && postTurn?.success) return 'healthy';
    if (preTurn?.success || postTurn?.success) return 'warning';
    return 'error';
  };

  const getLODHealthColor = (status) => {
    switch (status) {
      case 'healthy': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'error': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const formatProcessingTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className={`lod-simulation-control ${className}`}>
      {/* Main Control Panel */}
      <div className="lod-control-panel">
        <div className="lod-control-header">
          <h3>LOD Simulation Control</h3>
          <div className="lod-turn-info">
            <span className="lod-turn-label">Turn:</span>
            <span className="lod-turn-number">{currentTurn || 0}</span>
          </div>
        </div>

        <div className="lod-control-actions">
          <button
            className="lod-next-turn-btn"
            onClick={processNextTurn}
            disabled={!worldState || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="lod-spinner">⏳</span>
                Processing Turn...
              </>
            ) : (
              <>
                <span className="lod-play-icon">▶</span>
                Next Turn
              </>
            )}
          </button>
        </div>

        {/* Processing Status */}
        {processingStatus && (
          <div className="lod-processing-status">
            <div className="lod-status-indicator">
              <span
                className="lod-status-dot"
                style={{ backgroundColor: getLODHealthColor(getProcessingPhase() === 'Failed' ? 'error' : 'healthy') }}
              />
              <span className="lod-status-text">{processingStatus}</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="lod-error-display">
            <span className="lod-error-icon">⚠️</span>
            <span className="lod-error-text">{error}</span>
            <button
              className="lod-error-dismiss"
              onClick={() => setError(null)}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* LOD Processing Results */}
      {lastTurnResult && (
        <div className="lod-results-panel">
          <h4>Last Turn Results</h4>

          {/* Performance Metrics */}
          <div className="lod-performance-metrics">
            <div className="lod-metric">
              <span className="lod-metric-label">Total Time:</span>
              <span className="lod-metric-value">
                {formatProcessingTime(lastTurnResult.processingTime)}
              </span>
            </div>

            <div className="lod-metric">
              <span className="lod-metric-label">LOD Health:</span>
              <span
                className="lod-metric-value"
                style={{ color: getLODHealthColor(getLODHealthStatus()) }}
              >
                {getLODHealthStatus().toUpperCase()}
              </span>
            </div>
          </div>

          {/* LOD Processing Details */}
          {lastTurnResult.lodResults && (
            <div className="lod-processing-details">
              <div className="lod-phase-result">
                <span className="lod-phase-label">Pre-turn LOD:</span>
                <span className={`lod-phase-status ${lastTurnResult.lodResults.preTurn?.success ? 'success' : 'error'}`}>
                  {lastTurnResult.lodResults.preTurn?.success ? '✓' : '✗'}
                  {lastTurnResult.lodResults.preTurn?.promotions > 0 &&
                    ` (+${lastTurnResult.lodResults.preTurn.promotions})`
                  }
                </span>
              </div>

              <div className="lod-phase-result">
                <span className="lod-phase-label">Post-turn LOD:</span>
                <span className={`lod-phase-status ${lastTurnResult.lodResults.postTurn?.success ? 'success' : 'error'}`}>
                  {lastTurnResult.lodResults.postTurn?.success ? '✓' : '✗'}
                  {lastTurnResult.lodResults.postTurn?.demotions > 0 &&
                    ` (-${lastTurnResult.lodResults.postTurn.demotions})`
                  }
                </span>
              </div>
            </div>
          )}

          {/* Event Summary */}
          <div className="lod-event-summary">
            <div className="lod-event-count">
              <span className="lod-event-label">Character Events:</span>
              <span className="lod-event-value">{lastTurnResult.characterEvents?.length || 0}</span>
            </div>

            <div className="lod-event-count">
              <span className="lod-event-label">Settlement Events:</span>
              <span className="lod-event-value">{lastTurnResult.settlementEvents?.length || 0}</span>
            </div>

            <div className="lod-event-count">
              <span className="lod-event-label">Cross-Settlement:</span>
              <span className="lod-event-value">{lastTurnResult.crossSettlementEvents?.length || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LODSimulationControl;