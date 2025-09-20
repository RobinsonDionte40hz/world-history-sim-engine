/**
 * ConsciousnessMonitoringService
 *
 * Specialized monitoring and analytics service for the consciousness system.
 * Provides runtime performance tracking, behavioral pattern analysis, health monitoring
 * dashboards, and alerting for performance degradation or errors.
 */

import BaseDomainService from './BaseDomainService.js';

class ConsciousnessMetrics {
    constructor() {
        this.reset();
    }

    reset() {
        this.timestamp = Date.now();
        this.performance = {
            updateCount: 0,
            averageUpdateTime: 0,
            totalUpdateTime: 0,
            maxUpdateTime: 0,
            minUpdateTime: Infinity,
            updateFrequency: 0, // updates per minute
            lastUpdateTime: 0
        };

        this.behavioral = {
            stateChanges: 0,
            significantEvents: 0,
            memoryOperations: 0,
            decisionFactors: [],
            behavioralConsistency: 1.0
        };

        this.health = {
            errorCount: 0,
            warningCount: 0,
            criticalIssues: 0,
            lastHealthCheck: Date.now(),
            systemStability: 1.0
        };

        this.analytics = {
            personalityTrends: new Map(),
            behavioralPatterns: new Map(),
            consciousnessEvolution: [],
            performanceTrends: []
        };
    }

    recordUpdate(duration, characterId, updateType) {
        this.performance.updateCount++;
        this.performance.totalUpdateTime += duration;
        this.performance.averageUpdateTime = this.performance.totalUpdateTime / this.performance.updateCount;
        this.performance.maxUpdateTime = Math.max(this.performance.maxUpdateTime, duration);
        this.performance.minUpdateTime = Math.min(this.performance.minUpdateTime, duration);
        this.performance.lastUpdateTime = Date.now();

        // Calculate update frequency (updates per minute over last 5 minutes)
        const timeWindow = 5 * 60 * 1000; // 5 minutes
        const recentUpdates = this.performance.updateCount; // Simplified - in real implementation, track timestamps
        this.performance.updateFrequency = (recentUpdates / (timeWindow / 60000));
    }

    recordBehavioralChange(changeType, characterId, significance = 0) {
        this.behavioral.stateChanges++;
        if (significance >= 0.3) {
            this.behavioral.significantEvents++;
        }
    }

    recordDecisionFactor(factor, characterId, context = {}) {
        this.behavioral.decisionFactors.push({
            factor,
            characterId,
            context,
            timestamp: Date.now()
        });

        // Keep only last 100 decision factors
        if (this.behavioral.decisionFactors.length > 100) {
            this.behavioral.decisionFactors.shift();
        }
    }

    recordError(error, characterId, severity = 'warning') {
        this.health.errorCount++;
        if (severity === 'critical') {
            this.health.criticalIssues++;
        } else if (severity === 'warning') {
            this.health.warningCount++;
        }
    }

    updateBehavioralConsistency(score) {
        // Calculate rolling average of behavioral consistency
        this.behavioral.behavioralConsistency = (this.behavioral.behavioralConsistency + score) / 2;
    }

    updateSystemStability(score) {
        this.health.systemStability = (this.health.systemStability + score) / 2;
        this.health.lastHealthCheck = Date.now();
    }

    analyzePersonalityTrends(characterId, personalityChange) {
        if (!this.analytics.personalityTrends.has(characterId)) {
            this.analytics.personalityTrends.set(characterId, []);
        }

        const trends = this.analytics.personalityTrends.get(characterId);
        trends.push({
            change: personalityChange,
            timestamp: Date.now()
        });

        // Keep only last 50 personality changes per character
        if (trends.length > 50) {
            trends.shift();
        }
    }

    recordBehavioralPattern(patternType, characterId, patternData) {
        if (!this.analytics.behavioralPatterns.has(patternType)) {
            this.analytics.behavioralPatterns.set(patternType, []);
        }

        const patterns = this.analytics.behavioralPatterns.get(patternType);
        patterns.push({
            characterId,
            data: patternData,
            timestamp: Date.now()
        });

        // Keep only last 100 patterns per type
        if (patterns.length > 100) {
            patterns.shift();
        }
    }

    getSummary() {
        return {
            timestamp: this.timestamp,
            performance: { ...this.performance },
            behavioral: { ...this.behavioral },
            health: { ...this.health },
            analytics: {
                personalityTrends: Object.fromEntries(this.analytics.personalityTrends),
                behavioralPatterns: Object.fromEntries(this.analytics.behavioralPatterns),
                consciousnessEvolution: [...this.analytics.consciousnessEvolution],
                performanceTrends: [...this.analytics.performanceTrends]
            }
        };
    }
}

class ConsciousnessMonitoringService extends BaseDomainService {
    constructor(logger = null) {
        super();
        this.logger = logger;

        // Core monitoring state
        this.isActive = false;
        this.metrics = new ConsciousnessMetrics();

        // Alert management
        this.alerts = [];
        this.alertCooldowns = new Map();
        this.customAlertRules = new Map();

        // Dashboard management
        this.dashboards = new Map();
        this.monitoringInterval = null;

        // Configuration
        this.config = {
            monitoring: {
                updateInterval: 30000, // 30 seconds
                retentionPeriod: 3600000, // 1 hour
                maxAlerts: 100
            },
            thresholds: {
                performance: {
                    maxUpdateTime: 100, // ms
                    maxUpdateFrequency: 60, // updates per minute
                    minBehavioralConsistency: 0.7
                },
                health: {
                    maxErrorRate: 0.1, // 10% error rate
                    maxCriticalIssues: 5,
                    minSystemStability: 0.8
                },
                analytics: {
                    patternDetectionThreshold: 0.3,
                    trendAnalysisWindow: 10 // number of data points
                }
            },
            alerting: {
                cooldownPeriod: 300000, // 5 minutes
                alertLevels: ['info', 'warning', 'critical'],
                escalationThreshold: 3 // Escalate after 3 similar alerts
            }
        };
    }

    /**
     * Start consciousness monitoring
     */
    startMonitoring() {
        if (this.isActive) {
            if (this.logger) {
                this.logger.warn('Consciousness monitoring is already active');
            }
            return;
        }

        this.isActive = true;
        this.metrics.reset();

        // Start periodic monitoring
        this.monitoringInterval = setInterval(() => {
            this.performMonitoringCheck();
        }, this.config.monitoring.updateInterval);

        // Initialize default dashboard
        this.createDashboard('system_health', 'System Health Dashboard');

        if (this.logger) {
            this.logger.info('Consciousness monitoring started');
        }
    }

    /**
     * Stop consciousness monitoring
     */
    stopMonitoring() {
        if (!this.isActive) {
            return;
        }

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        this.isActive = false;

        if (this.logger) {
            this.logger.info('Consciousness monitoring stopped');
        }
    }

    /**
     * Record consciousness update performance
     * @param {number} duration - Update duration in milliseconds
     * @param {string} characterId - Character being updated
     * @param {string} updateType - Type of update (event, turn, maintenance)
     */
    recordUpdate(duration, characterId, updateType) {
        if (!this.isActive) return;

        this.metrics.recordUpdate(duration, characterId, updateType);

        // Check performance thresholds
        this.checkPerformanceThresholds(duration, updateType);
    }

    /**
     * Record behavioral change
     * @param {string} changeType - Type of behavioral change
     * @param {string} characterId - Character ID
     * @param {number} significance - Significance score (0-1)
     */
    recordBehavioralChange(changeType, characterId, significance = 0) {
        if (!this.isActive) return;

        this.metrics.recordBehavioralChange(changeType, characterId, significance);

        // Analyze patterns
        this.analyzeBehavioralPatterns(changeType, characterId, significance);
    }

    /**
     * Record decision factor for analytics
     * @param {number} factor - Decision factor value
     * @param {string} characterId - Character ID
     * @param {Object} context - Decision context
     */
    recordDecisionFactor(factor, characterId, context = {}) {
        if (!this.isActive) return;

        this.metrics.recordDecisionFactor(factor, characterId, context);

        // Analyze decision patterns
        this.analyzeDecisionPatterns(factor, characterId, context);
    }

    /**
     * Record error or issue
     * @param {Error} error - Error object
     * @param {string} characterId - Character ID (if applicable)
     * @param {string} severity - Error severity (info, warning, critical)
     */
    recordError(error, characterId = null, severity = 'warning') {
        if (!this.isActive) return;

        this.metrics.recordError(error, characterId, severity);

        // Generate alert for critical errors
        if (severity === 'critical') {
            this.generateAlert('critical', 'CONSCIOUSNESS_ERROR', {
                error: error.message,
                characterId,
                stack: error.stack
            });
        }
    }

    /**
     * Perform periodic monitoring check
     * @private
     */
    performMonitoringCheck() {
        if (!this.isActive) return;

        try {
            // Update system health metrics
            this.updateSystemHealth();

            // Analyze trends
            this.analyzeTrends();

            // Check health thresholds
            this.checkHealthThresholds();

            // Evaluate custom alert rules
            this.evaluateCustomAlertRules();

            // Auto-resolve alerts
            this.autoResolveAlerts();

            // Update dashboards
            this.updateDashboards();

            // Clean up old data
            this.cleanupOldData();

        } catch (error) {
            if (this.logger) {
                this.logger.error('Consciousness monitoring check failed:', error);
            }
        }
    }

    /**
     * Check performance thresholds and generate alerts
     * @private
     */
    checkPerformanceThresholds(duration, updateType) {
        if (duration > this.config.thresholds.performance.maxUpdateTime) {
            this.generateAlert('warning', 'SLOW_UPDATE', {
                duration,
                updateType,
                threshold: this.config.thresholds.performance.maxUpdateTime
            });
        }

        if (this.metrics.performance.updateFrequency > this.config.thresholds.performance.maxUpdateFrequency) {
            this.generateAlert('warning', 'HIGH_UPDATE_FREQUENCY', {
                frequency: this.metrics.performance.updateFrequency,
                threshold: this.config.thresholds.performance.maxUpdateFrequency
            });
        }

        if (this.metrics.behavioral.behavioralConsistency < this.config.thresholds.performance.minBehavioralConsistency) {
            this.generateAlert('info', 'LOW_BEHAVIORAL_CONSISTENCY', {
                consistency: this.metrics.behavioral.behavioralConsistency,
                threshold: this.config.thresholds.performance.minBehavioralConsistency
            });
        }
    }

    /**
     * Check health thresholds and generate alerts
     * @private
     */
    checkHealthThresholds() {
        const errorRate = this.metrics.health.errorCount / Math.max(1, this.metrics.performance.updateCount);

        if (errorRate > this.config.thresholds.health.maxErrorRate) {
            this.generateAlert('warning', 'HIGH_ERROR_RATE', {
                errorRate,
                threshold: this.config.thresholds.health.maxErrorRate
            });
        }

        if (this.metrics.health.criticalIssues > this.config.thresholds.health.maxCriticalIssues) {
            this.generateAlert('critical', 'EXCESSIVE_CRITICAL_ISSUES', {
                criticalIssues: this.metrics.health.criticalIssues,
                threshold: this.config.thresholds.health.maxCriticalIssues
            });
        }

        if (this.metrics.health.systemStability < this.config.thresholds.health.minSystemStability) {
            this.generateAlert('warning', 'LOW_SYSTEM_STABILITY', {
                stability: this.metrics.health.systemStability,
                threshold: this.config.thresholds.health.minSystemStability
            });
        }
    }

    /**
     * Generate an alert with cooldown prevention
     * @private
     */
    generateAlert(level, type, data, options = {}) {
        const now = Date.now();
        const alertKey = `${type}_${level}`;

        // Check cooldown with configurable periods
        const cooldownPeriod = options.cooldownPeriod || this.config.alerting.cooldownPeriod;
        const lastAlert = this.alertCooldowns.get(alertKey);
        if (lastAlert && (now - lastAlert) < cooldownPeriod) {
            return; // Still in cooldown
        }

        // Check for alert escalation
        const existingAlerts = this.alerts.filter(a =>
            a.type === type && !a.acknowledged
        );

        let escalatedLevel = level;
        let isEscalated = false;
        if (existingAlerts.length >= this.config.alerting.escalationThreshold) {
            // Escalate severity
            const levelOrder = ['info', 'warning', 'critical'];
            const currentIndex = levelOrder.indexOf(level);
            if (currentIndex < levelOrder.length - 1) {
                escalatedLevel = levelOrder[currentIndex + 1];
                isEscalated = true;
            } else {
                // Already at max level but still count as escalated
                isEscalated = true;
            }
        }

        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: now,
            level: escalatedLevel,
            type,
            data: {
                ...data,
                escalationCount: existingAlerts.length,
                escalated: isEscalated
            },
            acknowledged: false,
            autoResolve: options.autoResolve || false,
            resolveCondition: options.resolveCondition
        };

        this.alerts.push(alert);
        this.alertCooldowns.set(alertKey, now);

        // Keep only recent alerts
        if (this.alerts.length > this.config.monitoring.maxAlerts) {
            this.alerts.shift();
        }

        // Log alert
        if (this.logger) {
            const logMethod = this.logger[escalatedLevel] || this.logger.info;
            logMethod.call(this.logger, `Consciousness monitoring alert: ${type}`, {
                level: escalatedLevel,
                type,
                alertId: alert.id,
                data: alert.data,
                escalated: alert.data.escalated
            });
        }

        return alert;
    }

    /**
     * Enhanced alerting system with configurable thresholds and multiple alert types
     */

    /**
     * Configure alert thresholds dynamically
     * @param {Object} thresholds - New threshold configuration
     */
    configureAlertThresholds(thresholds) {
        this.config.thresholds = {
            ...this.config.thresholds,
            ...thresholds
        };

        if (this.logger) {
            this.logger.info('Alert thresholds updated', thresholds);
        }
    }

    /**
     * Add custom alert rule
     * @param {string} ruleId - Unique rule identifier
     * @param {Object} rule - Alert rule configuration
     */
    addAlertRule(ruleId, rule) {
        this.customAlertRules.set(ruleId, {
            ...rule,
            created: Date.now(),
            enabled: true
        });

        if (this.logger) {
            this.logger.info(`Custom alert rule added: ${ruleId}`, rule);
        }
    }

    /**
     * Remove custom alert rule
     * @param {string} ruleId - Rule identifier to remove
     */
    removeAlertRule(ruleId) {
        const removed = this.customAlertRules.delete(ruleId);
        if (removed && this.logger) {
            this.logger.info(`Custom alert rule removed: ${ruleId}`);
        }
        return removed;
    }

    /**
     * Evaluate custom alert rules
     * @private
     */
    evaluateCustomAlertRules() {
        this.customAlertRules.forEach((rule, ruleId) => {
            if (!rule.enabled) return;

            try {
                const shouldTrigger = this.evaluateAlertCondition(rule.condition);
                if (shouldTrigger) {
                    this.generateAlert(rule.level, `CUSTOM_${ruleId}`, {
                        ruleId,
                        condition: rule.condition,
                        message: rule.message,
                        triggeredAt: Date.now()
                    });
                }
            } catch (error) {
                if (this.logger) {
                    this.logger.error(`Error evaluating custom alert rule ${ruleId}:`, error);
                }
            }
        });
    }

    /**
     * Evaluate alert condition
     * @private
     */
    evaluateAlertCondition(condition) {
        const { metric, operator, value, timeWindow } = condition;

        // Get metric value
        const metricValue = this.getMetricValue(metric, timeWindow);

        // Evaluate condition
        switch (operator) {
            case '>':
                return metricValue > value;
            case '<':
                return metricValue < value;
            case '>=':
                return metricValue >= value;
            case '<=':
                return metricValue <= value;
            case '==':
                return metricValue === value;
            case '!=':
                return metricValue !== value;
            default:
                return false;
        }
    }

    /**
     * Get metric value for evaluation
     * @private
     */
    getMetricValue(metricPath, timeWindow = null) {
        const path = metricPath.split('.');
        let value = this.metrics;

        // Navigate to metric
        for (const segment of path) {
            if (value && typeof value === 'object') {
                value = value[segment];
            } else {
                return null;
            }
        }

        // If time window specified, get average over time window
        if (timeWindow && Array.isArray(value)) {
            const cutoff = Date.now() - timeWindow;
            const recentValues = value.filter(item =>
                item.timestamp > cutoff
            );

            if (recentValues.length === 0) return 0;

            // Calculate average based on value type
            if (recentValues[0].hasOwnProperty('factor')) {
                return recentValues.reduce((sum, item) => sum + item.factor, 0) / recentValues.length;
            } else if (recentValues[0].hasOwnProperty('duration')) {
                return recentValues.reduce((sum, item) => sum + item.duration, 0) / recentValues.length;
            }
        }

        return value;
    }

    /**
     * Auto-resolve alerts based on conditions
     * @private
     */
    autoResolveAlerts() {
        this.alerts.forEach(alert => {
            if (!alert.autoResolve || alert.acknowledged) return;

            try {
                const shouldResolve = this.evaluateAlertCondition(alert.resolveCondition);
                if (shouldResolve) {
                    alert.acknowledged = true;
                    alert.resolvedAt = Date.now();
                    alert.autoResolved = true;

                    if (this.logger) {
                        this.logger.info(`Alert auto-resolved: ${alert.id}`, {
                            type: alert.type,
                            level: alert.level
                        });
                    }
                }
            } catch (error) {
                if (this.logger) {
                    this.logger.error(`Error checking auto-resolve for alert ${alert.id}:`, error);
                }
            }
        });
    }

    /**
     * Get alert statistics
     */
    getAlertStatistics(timeWindow = 86400000) { // 24 hours default
        const cutoff = Date.now() - timeWindow;
        const recentAlerts = this.alerts.filter(a => a.timestamp > cutoff);

        const stats = {
            total: recentAlerts.length,
            byLevel: {},
            byType: {},
            acknowledged: recentAlerts.filter(a => a.acknowledged).length,
            unacknowledged: recentAlerts.filter(a => !a.acknowledged).length,
            escalated: recentAlerts.filter(a => a.data?.escalated).length,
            autoResolved: recentAlerts.filter(a => a.autoResolved).length,
            timeWindow
        };

        // Group by level
        recentAlerts.forEach(alert => {
            stats.byLevel[alert.level] = (stats.byLevel[alert.level] || 0) + 1;
            stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
        });

        return stats;
    }

    /**
     * Bulk acknowledge alerts
     * @param {string[]} alertIds - Array of alert IDs to acknowledge
     */
    bulkAcknowledgeAlerts(alertIds) {
        let acknowledged = 0;
        alertIds.forEach(id => {
            if (this.acknowledgeAlert(id)) {
                acknowledged++;
            }
        });

        if (this.logger) {
            this.logger.info(`Bulk acknowledged ${acknowledged} alerts`);
        }

        return acknowledged;
    }

    /**
     * Clear old alerts
     * @param {number} maxAge - Maximum age in milliseconds
     */
    clearOldAlerts(maxAge = 604800000) { // 7 days default
        const cutoff = Date.now() - maxAge;
        const beforeCount = this.alerts.length;

        this.alerts = this.alerts.filter(alert =>
            alert.timestamp > cutoff || !alert.acknowledged
        );

        const cleared = beforeCount - this.alerts.length;

        if (cleared > 0 && this.logger) {
            this.logger.info(`Cleared ${cleared} old alerts`);
        }

        return cleared;
    }

    /**
     * Reset monitoring state
     */
    reset() {
        this.metrics.reset();
        this.alerts = [];
        this.alertCooldowns.clear();

        if (this.logger) {
            this.logger.info('Consciousness monitoring state reset');
        }
    }

    /**
     * Export monitoring data
     */
    exportData() {
        return {
            metrics: this.metrics.getSummary(),
            alerts: this.alerts,
            dashboards: this.getAllDashboards(),
            config: this.config,
            exportTimestamp: Date.now()
        };
    }

    /**
     * Update monitoring configuration
     * @param {Object} newConfig - New configuration
     */
    updateConfiguration(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };

        if (this.logger) {
            this.logger.info('Consciousness monitoring configuration updated', newConfig);
        }
    }

    /**
     * Create a monitoring dashboard
     * @param {string} dashboardId - Dashboard identifier
     * @param {string} name - Dashboard name
     */
    createDashboard(dashboardId, name) {
        const dashboard = {
            id: dashboardId,
            name,
            created: Date.now(),
            widgets: [],
            lastUpdated: Date.now()
        };

        this.dashboards.set(dashboardId, dashboard);
        return dashboard;
    }

    /**
     * Update all dashboards with current data
     * @private
     */
    updateDashboards() {
        const summary = this.metrics.getSummary();

        this.dashboards.forEach(dashboard => {
            dashboard.lastUpdated = Date.now();
            dashboard.data = summary;
        });
    }

    /**
     * Get dashboard data
     * @param {string} dashboardId - Dashboard identifier
     */
    getDashboard(dashboardId) {
        return this.dashboards.get(dashboardId) || null;
    }

    /**
     * Get all dashboards
     */
    getAllDashboards() {
        return Array.from(this.dashboards.values());
    }

    /**
     * Get current monitoring status
     */
    getMonitoringStatus() {
        return {
            isActive: this.isActive,
            metrics: this.metrics.getSummary(),
            alerts: this.alerts,
            dashboards: this.getAllDashboards(),
            config: this.config
        };
    }

    /**
     * Get behavioral analytics
     */
    getBehavioralAnalytics(timeWindow = 3600000) { // 1 hour default
        const cutoff = Date.now() - timeWindow;

        return {
            decisionPatterns: this.analyzeDecisionPatternsForAnalytics(cutoff),
            behavioralConsistency: this.metrics.behavioral.behavioralConsistency,
            significantEvents: this.metrics.behavioral.significantEvents,
            personalityTrends: Object.fromEntries(this.metrics.analytics.personalityTrends),
            timestamp: Date.now()
        };
    }

    /**
     * Get performance analytics
     */
    getPerformanceAnalytics(timeWindow = 3600000) {
        const cutoff = Date.now() - timeWindow;

        return {
            updatePerformance: {
                averageTime: this.metrics.performance.averageUpdateTime,
                maxTime: this.metrics.performance.maxUpdateTime,
                minTime: this.metrics.performance.minUpdateTime,
                frequency: this.metrics.performance.updateFrequency,
                totalUpdates: this.metrics.performance.updateCount
            },
            trends: this.metrics.analytics.performanceTrends.filter(t => t.timestamp > cutoff),
            health: this.metrics.health,
            timestamp: Date.now()
        };
    }

    /**
     * Get active alerts
     * @param {boolean} includeAcknowledged - Include acknowledged alerts
     */
    getActiveAlerts(includeAcknowledged = false) {
        return this.alerts.filter(alert =>
            includeAcknowledged || !alert.acknowledged
        );
    }

    /**
     * Acknowledge an alert
     * @param {string} alertId - Alert ID to acknowledge
     */
    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) {
            return false;
        }

        alert.acknowledged = true;
        alert.acknowledgedAt = Date.now();

        if (this.logger) {
            this.logger.info(`Alert acknowledged: ${alertId}`, {
                type: alert.type,
                level: alert.level
            });
        }

        return true;
    }

    /**
     * Update system health metrics
     * @private
     */
    updateSystemHealth() {
        // Calculate system stability based on error rates and performance
        const errorRate = this.metrics.health.errorCount / Math.max(1, this.metrics.performance.updateCount);
        const performanceScore = Math.min(1, this.config.thresholds.performance.maxUpdateTime / Math.max(1, this.metrics.performance.averageUpdateTime));
        const stabilityScore = 1 - errorRate;

        this.metrics.updateSystemStability((performanceScore + stabilityScore) / 2);
    }

    /**
     * Analyze trends in monitoring data
     * @private
     */
    analyzeTrends() {
        // Analyze performance trends
        if (this.metrics.performance.updateCount > 10) {
            const recentUpdates = this.metrics.analytics.performanceTrends.slice(-10);
            if (recentUpdates.length >= 5) {
                const avgTime = recentUpdates.reduce((sum, t) => sum + t.averageTime, 0) / recentUpdates.length;
                const currentAvg = this.metrics.performance.averageUpdateTime;

                if (currentAvg > avgTime * 1.2) { // 20% degradation
                    this.generateAlert('warning', 'PERFORMANCE_DEGRADATION', {
                        currentAverage: currentAvg,
                        historicalAverage: avgTime,
                        degradation: ((currentAvg - avgTime) / avgTime) * 100
                    });
                }
            }
        }

        // Store current performance data for trend analysis
        this.metrics.analytics.performanceTrends.push({
            timestamp: Date.now(),
            averageTime: this.metrics.performance.averageUpdateTime,
            updateCount: this.metrics.performance.updateCount,
            errorRate: this.metrics.health.errorCount / Math.max(1, this.metrics.performance.updateCount)
        });

        // Keep only last 100 trend points
        if (this.metrics.analytics.performanceTrends.length > 100) {
            this.metrics.analytics.performanceTrends.shift();
        }
    }

    /**
     * Clean up old monitoring data
     * @private
     */
    cleanupOldData() {
        const cutoff = Date.now() - this.config.monitoring.retentionPeriod;

        // Clean up old decision factors
        this.metrics.behavioral.decisionFactors =
            this.metrics.behavioral.decisionFactors.filter(d => d.timestamp > cutoff);

        // Clean up old alerts (keep acknowledged ones for shorter time)
        this.alerts = this.alerts.filter(alert => {
            if (alert.acknowledged) {
                return alert.acknowledgedAt > (Date.now() - (this.config.monitoring.retentionPeriod / 4));
            }
            return true; // Keep unacknowledged alerts
        });
    }

    /**
     * Analyze behavioral patterns
     * @private
     */
    analyzeBehavioralPatterns(changeType, characterId, significance) {
        if (significance >= this.config.thresholds.analytics.patternDetectionThreshold) {
            this.metrics.recordBehavioralPattern(changeType, characterId, {
                significance,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Analyze decision patterns
     * @private
     */
    analyzeDecisionPatterns(factor, characterId, context) {
        // Analyze decision factor distribution
        const recentFactors = this.metrics.behavioral.decisionFactors
            .filter(d => d.characterId === characterId)
            .slice(-10) // Last 10 decisions
            .map(d => d.factor);

        if (recentFactors.length >= 5) {
            const avgFactor = recentFactors.reduce((sum, f) => sum + f, 0) / recentFactors.length;
            const variance = recentFactors.reduce((sum, f) => sum + Math.pow(f - avgFactor, 2), 0) / recentFactors.length;

            // Detect unusual decision patterns
            if (variance > 1.0) { // High variance indicates inconsistent decisions
                this.generateAlert('info', 'DECISION_INCONSISTENCY', {
                    characterId,
                    averageFactor: avgFactor,
                    variance,
                    recentDecisions: recentFactors.length
                });
            }
        }
    }

    /**
     * Analyze decision patterns for analytics
     * @private
     */
    analyzeDecisionPatternsForAnalytics(cutoff) {
        const recentDecisions = this.metrics.behavioral.decisionFactors
            .filter(d => d.timestamp > cutoff);

        const patterns = {};
        recentDecisions.forEach(decision => {
            const key = `${decision.characterId}_${Math.round(decision.factor * 10) / 10}`;
            patterns[key] = (patterns[key] || 0) + 1;
        });

        return patterns;
    }
}

export default ConsciousnessMonitoringService;