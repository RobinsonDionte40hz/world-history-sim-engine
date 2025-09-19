/**
 * MemoryMonitoringService
 *
 * Service for monitoring memory usage and providing alerts when memory limits are approached.
 * Integrates with MemoryManagementService to provide real-time monitoring and early warnings.
 */

import BaseDomainService from './BaseDomainService.js';

class MemoryMonitoringService extends BaseDomainService {
    constructor(logger = null, memoryManager = null) {
        super();
        this.logger = logger;
        this.memoryManager = memoryManager;

        // Monitoring configuration
        this.MONITORING_CONFIG = {
            CHECK_INTERVAL: 30000, // 30 seconds
            WARNING_THRESHOLDS: {
                EVENTS: 0.8,    // 80% of event limit
                MEMORIES: 0.8,  // 80% of memory limit
                PROCESSING_TIME: 1000 // 1 second per batch
            },
            CRITICAL_THRESHOLDS: {
                EVENTS: 0.95,   // 95% of event limit
                MEMORIES: 0.95, // 95% of memory limit
                PROCESSING_TIME: 2000 // 2 seconds per batch
            },
            ALERT_COOLDOWN: 300000 // 5 minutes between similar alerts
        };

        // Monitoring state
        this.monitoringState = {
            isActive: false,
            lastCheck: 0,
            alerts: [],
            metrics: {
                averageProcessingTime: 0,
                peakMemoryUsage: 0,
                alertCount: 0,
                lastAlertTime: 0
            }
        };

        // Alert history to prevent spam
        this.alertHistory = new Map();
    }

    /**
     * Start memory monitoring
     */
    startMonitoring() {
        if (this.monitoringState.isActive) {
            if (this.logger) {
                this.logger.warn('Memory monitoring is already active');
            }
            return;
        }

        this.monitoringState.isActive = true;
        this.monitoringState.lastCheck = Date.now();

        // Start periodic monitoring
        this.monitoringInterval = setInterval(() => {
            this.performMonitoringCheck();
        }, this.MONITORING_CONFIG.CHECK_INTERVAL);

        if (this.logger) {
            this.logger.info('Memory monitoring started');
        }
    }

    /**
     * Stop memory monitoring
     */
    stopMonitoring() {
        if (!this.monitoringState.isActive) {
            return;
        }

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        this.monitoringState.isActive = false;

        if (this.logger) {
            this.logger.info('Memory monitoring stopped');
        }
    }

    /**
     * Perform monitoring check
     */
    performMonitoringCheck() {
        if (!this.memoryManager) {
            return;
        }

        const now = Date.now();
        this.monitoringState.lastCheck = now;

        try {
            // Get current memory statistics
            const memoryStats = this.memoryManager.getMemoryStats();

            // Check memory usage thresholds
            this.checkMemoryThresholds(memoryStats);

            // Check processing performance
            this.checkProcessingPerformance(memoryStats);

            // Update monitoring metrics
            this.updateMonitoringMetrics(memoryStats);

        } catch (error) {
            if (this.logger) {
                this.logger.error('Memory monitoring check failed:', error);
            }
        }
    }

    /**
     * Check memory usage thresholds and generate alerts
     * @param {Object} memoryStats - Current memory statistics
     */
    checkMemoryThresholds(memoryStats) {
        const limits = memoryStats.limits;

        // Check events threshold
        const eventRatio = memoryStats.totalEvents / limits.MAX_TOTAL_EVENTS_WORLD;
        if (eventRatio >= this.MONITORING_CONFIG.CRITICAL_THRESHOLDS.EVENTS) {
            this.generateAlert('CRITICAL', 'EVENT_OVERLOAD', {
                current: memoryStats.totalEvents,
                limit: limits.MAX_TOTAL_EVENTS_WORLD,
                ratio: eventRatio,
                message: `Event memory usage at ${(eventRatio * 100).toFixed(1)}% of limit (${memoryStats.totalEvents}/${limits.MAX_TOTAL_EVENTS_WORLD})`
            });
        } else if (eventRatio >= this.MONITORING_CONFIG.WARNING_THRESHOLDS.EVENTS) {
            this.generateAlert('WARNING', 'EVENT_HIGH_USAGE', {
                current: memoryStats.totalEvents,
                limit: limits.MAX_TOTAL_EVENTS_WORLD,
                ratio: eventRatio,
                message: `Event memory usage at ${(eventRatio * 100).toFixed(1)}% of limit`
            });
        }

        // Check memories threshold
        const memoryRatio = memoryStats.totalMemories / limits.MAX_TOTAL_MEMORIES_WORLD;
        if (memoryRatio >= this.MONITORING_CONFIG.CRITICAL_THRESHOLDS.MEMORIES) {
            this.generateAlert('CRITICAL', 'MEMORY_OVERLOAD', {
                current: memoryStats.totalMemories,
                limit: limits.MAX_TOTAL_MEMORIES_WORLD,
                ratio: memoryRatio,
                message: `Memory usage at ${(memoryRatio * 100).toFixed(1)}% of limit (${memoryStats.totalMemories}/${limits.MAX_TOTAL_MEMORIES_WORLD})`
            });
        } else if (memoryRatio >= this.MONITORING_CONFIG.WARNING_THRESHOLDS.MEMORIES) {
            this.generateAlert('WARNING', 'MEMORY_HIGH_USAGE', {
                current: memoryStats.totalMemories,
                limit: limits.MAX_TOTAL_MEMORIES_WORLD,
                ratio: memoryRatio,
                message: `Memory usage at ${(memoryRatio * 100).toFixed(1)}% of limit`
            });
        }
    }

    /**
     * Check processing performance and generate alerts
     * @param {Object} memoryStats - Current memory statistics
     */
    checkProcessingPerformance(memoryStats) {
        // Check recent performance metrics
        const recentMetrics = memoryStats.performanceMetrics.slice(-5); // Last 5 metrics

        if (recentMetrics.length === 0) {
            return;
        }

        // Calculate average processing time
        const avgProcessingTime = recentMetrics.reduce((sum, metric) => sum + metric.duration, 0) / recentMetrics.length;

        // Update monitoring metrics
        this.monitoringState.metrics.averageProcessingTime = avgProcessingTime;

        // Check for performance degradation
        if (avgProcessingTime >= this.MONITORING_CONFIG.CRITICAL_THRESHOLDS.PROCESSING_TIME) {
            this.generateAlert('CRITICAL', 'PERFORMANCE_DEGRADED', {
                averageProcessingTime: avgProcessingTime,
                threshold: this.MONITORING_CONFIG.CRITICAL_THRESHOLDS.PROCESSING_TIME,
                message: `Average processing time is ${(avgProcessingTime / 1000).toFixed(2)}s, exceeding critical threshold`
            });
        } else if (avgProcessingTime >= this.MONITORING_CONFIG.WARNING_THRESHOLDS.PROCESSING_TIME) {
            this.generateAlert('WARNING', 'PERFORMANCE_SLOW', {
                averageProcessingTime: avgProcessingTime,
                threshold: this.MONITORING_CONFIG.WARNING_THRESHOLDS.PROCESSING_TIME,
                message: `Average processing time is ${(avgProcessingTime / 1000).toFixed(2)}s, exceeding warning threshold`
            });
        }
    }

    /**
     * Update monitoring metrics
     * @param {Object} memoryStats - Current memory statistics
     */
    updateMonitoringMetrics(memoryStats) {
        // Update peak memory usage
        const currentTotal = memoryStats.totalEvents + memoryStats.totalMemories;
        if (currentTotal > this.monitoringState.metrics.peakMemoryUsage) {
            this.monitoringState.metrics.peakMemoryUsage = currentTotal;
        }

        // Update alert count
        this.monitoringState.metrics.alertCount = this.monitoringState.alerts.length;
    }

    /**
     * Generate an alert with cooldown prevention
     * @param {string} level - Alert level (WARNING, CRITICAL)
     * @param {string} type - Alert type
     * @param {Object} data - Alert data
     */
    generateAlert(level, type, data) {
        const now = Date.now();
        const alertKey = `${type}_${level}`;

        // Check cooldown
        const lastAlert = this.alertHistory.get(alertKey);
        if (lastAlert && (now - lastAlert) < this.MONITORING_CONFIG.ALERT_COOLDOWN) {
            return; // Still in cooldown
        }

        // Create alert
        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: now,
            level,
            type,
            data,
            acknowledged: false
        };

        // Add to alerts
        this.monitoringState.alerts.push(alert);
        this.alertHistory.set(alertKey, now);
        this.monitoringState.metrics.lastAlertTime = now;

        // Keep only recent alerts (last 100)
        if (this.monitoringState.alerts.length > 100) {
            this.monitoringState.alerts = this.monitoringState.alerts.slice(-100);
        }

        // Log alert
        if (this.logger) {
            this.logger[level.toLowerCase()](`Memory monitoring alert: ${type}`, {
                level,
                type,
                message: data.message,
                alertId: alert.id
            });
        }
    }

    /**
     * Acknowledge an alert
     * @param {string} alertId - ID of the alert to acknowledge
     * @returns {boolean} Whether the alert was found and acknowledged
     */
    acknowledgeAlert(alertId) {
        const alert = this.monitoringState.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedAt = Date.now();
            return true;
        }
        return false;
    }

    /**
     * Get current monitoring status
     * @returns {Object} Monitoring status
     */
    getMonitoringStatus() {
        const memoryStats = this.memoryManager ? this.memoryManager.getMemoryStats() : null;

        return {
            isActive: this.monitoringState.isActive,
            lastCheck: this.monitoringState.lastCheck,
            alerts: this.monitoringState.alerts,
            metrics: this.monitoringState.metrics,
            memoryStats,
            config: this.MONITORING_CONFIG
        };
    }

    /**
     * Get active alerts
     * @param {boolean} includeAcknowledged - Whether to include acknowledged alerts
     * @returns {Array} Active alerts
     */
    getActiveAlerts(includeAcknowledged = false) {
        return this.monitoringState.alerts.filter(alert =>
            includeAcknowledged || !alert.acknowledged
        );
    }

    /**
     * Clear old alerts
     * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
     */
    clearOldAlerts(maxAge = 24 * 60 * 60 * 1000) {
        const cutoff = Date.now() - maxAge;
        this.monitoringState.alerts = this.monitoringState.alerts.filter(
            alert => alert.timestamp > cutoff
        );
    }

    /**
     * Reset monitoring state
     */
    resetMonitoring() {
        this.monitoringState = {
            isActive: false,
            lastCheck: 0,
            alerts: [],
            metrics: {
                averageProcessingTime: 0,
                peakMemoryUsage: 0,
                alertCount: 0,
                lastAlertTime: 0
            }
        };

        this.alertHistory.clear();

        if (this.logger) {
            this.logger.info('Memory monitoring state reset');
        }
    }

    /**
     * Set memory manager reference
     * @param {Object} memoryManager - Memory management service
     */
    setMemoryManager(memoryManager) {
        this.memoryManager = memoryManager;
    }

    /**
     * Update monitoring configuration
     * @param {Object} config - New configuration
     */
    updateConfiguration(config) {
        this.MONITORING_CONFIG = {
            ...this.MONITORING_CONFIG,
            ...config
        };

        if (this.logger) {
            this.logger.info('Memory monitoring configuration updated', config);
        }
    }
}

export default MemoryMonitoringService;