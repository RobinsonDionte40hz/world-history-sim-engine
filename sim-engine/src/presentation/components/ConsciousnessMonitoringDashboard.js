/**
 * ConsciousnessMonitoringDashboard
 *
 * React component for displaying consciousness system monitoring and analytics.
 * Provides real-time health monitoring, performance metrics, behavioral analytics,
 * and alerting for the consciousness system.
 */

import React, { useState, useEffect, useCallback } from 'react';
import './ConsciousnessMonitoringDashboard.css';

const ConsciousnessMonitoringDashboard = ({
  monitoringService,
  onClose,
  refreshInterval = 5000
}) => {
  const [monitoringData, setMonitoringData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load monitoring data
  const loadMonitoringData = useCallback(async () => {
    if (!monitoringService) {
      setError('Monitoring service not available');
      setIsLoading(false);
      return;
    }

    try {
      const data = monitoringService.getMonitoringStatus();
      setMonitoringData(data);
      setError(null);
    } catch (err) {
      setError(`Failed to load monitoring data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [monitoringService]);

  // Load data on mount and refresh interval
  useEffect(() => {
    loadMonitoringData();

    const interval = setInterval(loadMonitoringData, refreshInterval);
    return () => clearInterval(interval);
  }, [loadMonitoringData, refreshInterval]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback(async (alertId) => {
    if (!monitoringService) return;

    try {
      const success = monitoringService.acknowledgeAlert(alertId);
      if (success) {
        await loadMonitoringData(); // Refresh data
      }
    } catch (err) {
      setError(`Failed to acknowledge alert: ${err.message}`);
    }
  }, [monitoringService, loadMonitoringData]);

  // Reset monitoring
  const resetMonitoring = useCallback(async () => {
    if (!monitoringService) return;

    try {
      monitoringService.reset();
      await loadMonitoringData();
    } catch (err) {
      setError(`Failed to reset monitoring: ${err.message}`);
    }
  }, [monitoringService, loadMonitoringData]);

  if (isLoading) {
    return (
      <div className="consciousness-dashboard">
        <div className="dashboard-header">
          <h2>Consciousness System Monitor</h2>
          {onClose && (
            <button className="close-button" onClick={onClose}>×</button>
          )}
        </div>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="consciousness-dashboard">
        <div className="dashboard-header">
          <h2>Consciousness System Monitor</h2>
          {onClose && (
            <button className="close-button" onClick={onClose}>×</button>
          )}
        </div>
        <div className="dashboard-error">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={loadMonitoringData}>Retry</button>
        </div>
      </div>
    );
  }

  if (!monitoringData) {
    return (
      <div className="consciousness-dashboard">
        <div className="dashboard-header">
          <h2>Consciousness System Monitor</h2>
          {onClose && (
            <button className="close-button" onClick={onClose}>×</button>
          )}
        </div>
        <div className="dashboard-empty">
          <p>No monitoring data available</p>
        </div>
      </div>
    );
  }

  const { metrics, alerts, isActive } = monitoringData;

  return (
    <div className="consciousness-dashboard">
      <div className="dashboard-header">
        <h2>Consciousness System Monitor</h2>
        <div className="dashboard-controls">
          <div className={`status-indicator ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? '🟢 Active' : '🔴 Inactive'}
          </div>
          <button onClick={resetMonitoring} className="reset-button">
            Reset
          </button>
          <button onClick={loadMonitoringData} className="refresh-button">
            Refresh
          </button>
          {onClose && (
            <button className="close-button" onClick={onClose}>×</button>
          )}
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={selectedTab === 'overview' ? 'active' : ''}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </button>
        <button
          className={selectedTab === 'performance' ? 'active' : ''}
          onClick={() => setSelectedTab('performance')}
        >
          Performance
        </button>
        <button
          className={selectedTab === 'behavioral' ? 'active' : ''}
          onClick={() => setSelectedTab('behavioral')}
        >
          Behavioral
        </button>
        <button
          className={selectedTab === 'alerts' ? 'active' : ''}
          onClick={() => setSelectedTab('alerts')}
        >
          Alerts ({alerts.filter(a => !a.acknowledged).length})
        </button>
        <button
          className={selectedTab === 'analytics' ? 'active' : ''}
          onClick={() => setSelectedTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="dashboard-content">
        {selectedTab === 'overview' && (
          <OverviewTab metrics={metrics} alerts={alerts} />
        )}
        {selectedTab === 'performance' && (
          <PerformanceTab metrics={metrics} />
        )}
        {selectedTab === 'behavioral' && (
          <BehavioralTab metrics={metrics} />
        )}
        {selectedTab === 'alerts' && (
          <AlertsTab alerts={alerts} onAcknowledge={acknowledgeAlert} />
        )}
        {selectedTab === 'analytics' && (
          <AnalyticsTab metrics={metrics} />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ metrics, alerts }) => {
  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const criticalAlerts = activeAlerts.filter(a => a.level === 'critical');

  return (
    <div className="overview-tab">
      <div className="overview-grid">
        <div className="metric-card">
          <h3>System Health</h3>
          <div className="health-score">
            <div
              className={`health-indicator ${metrics.health.systemStability > 0.8 ? 'good' : metrics.health.systemStability > 0.6 ? 'warning' : 'critical'}`}
              style={{ width: `${metrics.health.systemStability * 100}%` }}
            ></div>
          </div>
          <p>{(metrics.health.systemStability * 100).toFixed(1)}% Stable</p>
        </div>

        <div className="metric-card">
          <h3>Performance</h3>
          <p>Avg Update: {(metrics.performance.averageUpdateTime || 0).toFixed(1)}ms</p>
          <p>Updates: {metrics.performance.updateCount}</p>
          <p>Frequency: {metrics.performance.updateFrequency.toFixed(1)}/min</p>
        </div>

        <div className="metric-card">
          <h3>Behavioral</h3>
          <p>Consistency: {(metrics.behavioral.behavioralConsistency * 100).toFixed(1)}%</p>
          <p>Changes: {metrics.behavioral.stateChanges}</p>
          <p>Significant: {metrics.behavioral.significantEvents}</p>
        </div>

        <div className="metric-card">
          <h3>Alerts</h3>
          <p className={criticalAlerts.length > 0 ? 'critical' : activeAlerts.length > 0 ? 'warning' : 'good'}>
            {criticalAlerts.length} Critical
          </p>
          <p>{activeAlerts.length} Total Active</p>
          <p>{alerts.length} Total</p>
        </div>
      </div>

      <div className="recent-alerts">
        <h3>Recent Alerts</h3>
        {activeAlerts.length === 0 ? (
          <p className="no-alerts">No active alerts</p>
        ) : (
          <div className="alerts-list">
            {activeAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className={`alert-item ${alert.level}`}>
                <span className="alert-level">{alert.level.toUpperCase()}</span>
                <span className="alert-type">{alert.type}</span>
                <span className="alert-time">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Performance Tab Component
const PerformanceTab = ({ metrics }) => {
  return (
    <div className="performance-tab">
      <div className="performance-metrics">
        <div className="metric-group">
          <h3>Update Performance</h3>
          <div className="metric-item">
            <label>Average Update Time:</label>
            <span>{(metrics.performance.averageUpdateTime || 0).toFixed(2)}ms</span>
          </div>
          <div className="metric-item">
            <label>Max Update Time:</label>
            <span>{(metrics.performance.maxUpdateTime || 0).toFixed(2)}ms</span>
          </div>
          <div className="metric-item">
            <label>Min Update Time:</label>
            <span>{(metrics.performance.minUpdateTime || Infinity).toFixed(2)}ms</span>
          </div>
          <div className="metric-item">
            <label>Total Updates:</label>
            <span>{metrics.performance.updateCount}</span>
          </div>
          <div className="metric-item">
            <label>Update Frequency:</label>
            <span>{metrics.performance.updateFrequency.toFixed(2)}/min</span>
          </div>
        </div>

        <div className="metric-group">
          <h3>System Health</h3>
          <div className="metric-item">
            <label>System Stability:</label>
            <span>{(metrics.health.systemStability * 100).toFixed(1)}%</span>
          </div>
          <div className="metric-item">
            <label>Error Count:</label>
            <span className={metrics.health.errorCount > 0 ? 'error' : ''}>
              {metrics.health.errorCount}
            </span>
          </div>
          <div className="metric-item">
            <label>Warning Count:</label>
            <span className={metrics.health.warningCount > 0 ? 'warning' : ''}>
              {metrics.health.warningCount}
            </span>
          </div>
          <div className="metric-item">
            <label>Critical Issues:</label>
            <span className={metrics.health.criticalIssues > 0 ? 'critical' : ''}>
              {metrics.health.criticalIssues}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Behavioral Tab Component
const BehavioralTab = ({ metrics }) => {
  return (
    <div className="behavioral-tab">
      <div className="behavioral-metrics">
        <div className="metric-group">
          <h3>Behavioral Metrics</h3>
          <div className="metric-item">
            <label>Behavioral Consistency:</label>
            <span>{(metrics.behavioral.behavioralConsistency * 100).toFixed(1)}%</span>
          </div>
          <div className="metric-item">
            <label>State Changes:</label>
            <span>{metrics.behavioral.stateChanges}</span>
          </div>
          <div className="metric-item">
            <label>Significant Events:</label>
            <span>{metrics.behavioral.significantEvents}</span>
          </div>
          <div className="metric-item">
            <label>Memory Operations:</label>
            <span>{metrics.behavioral.memoryOperations}</span>
          </div>
        </div>

        <div className="metric-group">
          <h3>Decision Factors</h3>
          <div className="decision-factors">
            {metrics.behavioral.decisionFactors.length === 0 ? (
              <p>No recent decision data</p>
            ) : (
              <div className="factors-list">
                {metrics.behavioral.decisionFactors.slice(-10).map((factor, index) => (
                  <div key={index} className="factor-item">
                    <span>Factor: {factor.factor.toFixed(3)}</span>
                    <span>Character: {factor.characterId}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Alerts Tab Component
const AlertsTab = ({ alerts, onAcknowledge }) => {
  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter(a => a.acknowledged);

  return (
    <div className="alerts-tab">
      <div className="alerts-section">
        <h3>Active Alerts ({activeAlerts.length})</h3>
        {activeAlerts.length === 0 ? (
          <p className="no-alerts">No active alerts</p>
        ) : (
          <div className="alerts-list">
            {activeAlerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.level}`}>
                <div className="alert-header">
                  <span className="alert-level">{alert.level.toUpperCase()}</span>
                  <span className="alert-type">{alert.type}</span>
                  <span className="alert-time">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="acknowledge-button"
                  >
                    Acknowledge
                  </button>
                </div>
                <div className="alert-data">
                  {Object.entries(alert.data).map(([key, value]) => (
                    <div key={key} className="alert-data-item">
                      <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {acknowledgedAlerts.length > 0 && (
        <div className="alerts-section">
          <h3>Acknowledged Alerts ({acknowledgedAlerts.length})</h3>
          <div className="alerts-list acknowledged">
            {acknowledgedAlerts.slice(-10).map(alert => (
              <div key={alert.id} className={`alert-item ${alert.level} acknowledged`}>
                <div className="alert-header">
                  <span className="alert-level">{alert.level.toUpperCase()}</span>
                  <span className="alert-type">{alert.type}</span>
                  <span className="alert-time">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ metrics }) => {
  return (
    <div className="analytics-tab">
      <div className="analytics-sections">
        <div className="analytics-section">
          <h3>Performance Trends</h3>
          <div className="trend-data">
            {metrics.analytics.performanceTrends.length === 0 ? (
              <p>No trend data available</p>
            ) : (
              <div className="trend-list">
                {metrics.analytics.performanceTrends.slice(-10).map((trend, index) => (
                  <div key={index} className="trend-item">
                    <span>{new Date(trend.timestamp).toLocaleTimeString()}</span>
                    <span className={`trend-${trend.trend}`}>{trend.trend}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="analytics-section">
          <h3>Consciousness Evolution</h3>
          <div className="evolution-data">
            {metrics.analytics.consciousnessEvolution.length === 0 ? (
              <p>No evolution data available</p>
            ) : (
              <div className="evolution-list">
                {metrics.analytics.consciousnessEvolution.slice(-10).map((evolution, index) => (
                  <div key={index} className="evolution-item">
                    <span>{new Date(evolution.timestamp).toLocaleTimeString()}</span>
                    <span>Trend: {evolution.trend.toFixed(3)}</span>
                    <span>Volatility: {evolution.volatility.toFixed(3)}</span>
                    <span>Avg Factor: {evolution.averageFactor.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="analytics-section">
          <h3>Behavioral Patterns</h3>
          <div className="patterns-data">
            {Object.keys(metrics.analytics.behavioralPatterns).length === 0 ? (
              <p>No pattern data available</p>
            ) : (
              <div className="patterns-list">
                {Object.entries(metrics.analytics.behavioralPatterns).map(([patternType, patterns]) => (
                  <div key={patternType} className="pattern-group">
                    <h4>{patternType} ({patterns.length})</h4>
                    <div className="pattern-items">
                      {patterns.slice(-5).map((pattern, index) => (
                        <div key={index} className="pattern-item">
                          <span>{pattern.characterId}</span>
                          <span>{new Date(pattern.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsciousnessMonitoringDashboard;