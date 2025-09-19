/**
 * Performance Monitoring Service
 *
 * Provides comprehensive performance monitoring for the consciousness system,
 * including turn processing times, update frequency tracking, computational load
 * measurement, and memory usage monitoring.
 */

class PerformanceMetrics {
    constructor() {
        this.reset();
    }

    reset() {
        this.startTime = null;
        this.endTime = null;
        this.duration = 0;
        this.memoryUsage = {
            before: 0,
            after: 0,
            delta: 0
        };
        this.computationalLoad = {
            operations: 0,
            complexity: 0,
            bottlenecks: []
        };
        this.updateFrequency = {
            totalUpdates: 0,
            timeWindow: 60000, // 1 minute
            updatesPerMinute: 0,
            lastUpdateTime: Date.now()
        };
    }

    startMeasurement() {
        this.startTime = performance.now();
        this.memoryUsage.before = this.getCurrentMemoryUsage();
    }

    endMeasurement() {
        this.endTime = performance.now();
        this.duration = this.endTime - this.startTime;
        this.memoryUsage.after = this.getCurrentMemoryUsage();
        this.memoryUsage.delta = this.memoryUsage.after - this.memoryUsage.before;
    }

    getCurrentMemoryUsage() {
        // Use Node.js process.memoryUsage() if available, otherwise estimate
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const usage = process.memoryUsage();
            return usage.heapUsed;
        }

        // Fallback: estimate based on object count (simplified)
        return 0; // Placeholder for browser environments
    }

    recordOperation(operationType, complexity = 1) {
        this.computationalLoad.operations++;
        this.computationalLoad.complexity += complexity;

        if (this.duration > 100) { // Operations taking > 100ms are potential bottlenecks
            this.computationalLoad.bottlenecks.push({
                operation: operationType,
                duration: this.duration,
                timestamp: Date.now()
            });
        }
    }

    updateFrequencyTracking() {
        this.updateFrequency.totalUpdates++;
        const now = Date.now();
        const timeDiff = now - this.updateFrequency.lastUpdateTime;

        if (timeDiff >= this.updateFrequency.timeWindow) {
            this.updateFrequency.updatesPerMinute =
                (this.updateFrequency.totalUpdates / timeDiff) * 60000;
            this.updateFrequency.lastUpdateTime = now;
            this.updateFrequency.totalUpdates = 0;
        }
    }

    getMetrics() {
        const baseMetrics = {
            duration: this.duration,
            memoryUsage: this.memoryUsage,
            computationalLoad: this.computationalLoad,
            updateFrequency: this.updateFrequency,
            timestamp: Date.now()
        };

        // Include any additional properties that have been set
        const additionalProps = {};
        if (this.operationType) additionalProps.operationType = this.operationType;
        if (this.characterId) additionalProps.characterId = this.characterId;
        if (this.updateType) additionalProps.updateType = this.updateType;
        if (this.memoryOperationType) additionalProps.memoryOperationType = this.memoryOperationType;
        if (this.memoryCount !== undefined) additionalProps.memoryCount = this.memoryCount;
        if (this.npcCount !== undefined) additionalProps.npcCount = this.npcCount;
        if (this.npcIds) additionalProps.npcIds = this.npcIds;

        return { ...baseMetrics, ...additionalProps };
    }
}

class PerformanceMonitoringService {
    constructor() {
        this.metrics = new Map(); // Store metrics by operation type
        this.history = new Map(); // Store historical metrics
        this.thresholds = {
            maxTurnProcessingTime: 1000, // 1 second
            maxMemoryDelta: 50 * 1024 * 1024, // 50MB
            maxComputationalLoad: 1000,
            minUpdateFrequency: 1, // updates per minute
            maxUpdateFrequency: 60 // updates per minute
        };
        this.alerts = [];
    }

    /**
     * Start performance monitoring for an operation
     * @param {string} operationId - Unique identifier for the operation
     * @param {string} operationType - Type of operation (e.g., 'turn_processing', 'consciousness_update')
     */
    startMonitoring(operationId, operationType) {
        if (!this.metrics.has(operationId)) {
            this.metrics.set(operationId, new PerformanceMetrics());
        }

        const metrics = this.metrics.get(operationId);
        metrics.operationType = operationType;
        metrics.startMeasurement();

        return operationId;
    }

    /**
     * End performance monitoring for an operation
     * @param {string} operationId - Operation identifier from startMonitoring
     * @param {Object} additionalData - Additional performance data to record
     */
    endMonitoring(operationId, additionalData = {}) {
        const metrics = this.metrics.get(operationId);
        if (!metrics) {
            console.warn(`No metrics found for operation: ${operationId}`);
            return null;
        }

        metrics.endMeasurement();
        metrics.updateFrequencyTracking();

        // Record additional data
        Object.assign(metrics, additionalData);

        // Store in history
        this.storeHistoricalMetrics(operationId, metrics);

        // Check for performance issues
        this.checkPerformanceThresholds(operationId, metrics);

        const result = metrics.getMetrics();
        this.metrics.delete(operationId); // Clean up

        return result;
    }

    /**
     * Monitor turn processing performance
     * @param {string} turnId - Unique turn identifier
     * @param {number} npcCount - Number of NPCs processed
     * @param {Array} npcIds - Array of NPC IDs processed
     */
    monitorTurnProcessing(turnId, npcCount, npcIds = []) {
        const operationId = this.startMonitoring(turnId, 'turn_processing');

        // Record initial metrics
        const metrics = this.metrics.get(operationId);
        metrics.npcCount = npcCount;
        metrics.npcIds = npcIds;

        return operationId;
    }

    /**
     * Monitor consciousness update performance
     * @param {string} characterId - Character ID being updated
     * @param {string} updateType - Type of update (e.g., 'event', 'turn', 'maintenance')
     */
    monitorConsciousnessUpdate(characterId, updateType) {
        const operationId = `consciousness_update_${characterId}_${Date.now()}`;
        const monitoringId = this.startMonitoring(operationId, 'consciousness_update');

        const metrics = this.metrics.get(monitoringId);
        metrics.characterId = characterId;
        metrics.updateType = updateType;

        return monitoringId;
    }

    /**
     * Monitor memory operation performance
     * @param {string} operationType - Type of memory operation
     * @param {number} memoryCount - Number of memories involved
     */
    monitorMemoryOperation(operationType, memoryCount) {
        const operationId = `memory_${operationType}_${Date.now()}`;
        const monitoringId = this.startMonitoring(operationId, 'memory_operation');

        const metrics = this.metrics.get(monitoringId);
        metrics.memoryOperationType = operationType;
        metrics.memoryCount = memoryCount;

        return monitoringId;
    }

    /**
     * Get performance summary for a time period
     * @param {number} timeWindow - Time window in milliseconds (default: 5 minutes)
     */
    getPerformanceSummary(timeWindow = 300000) {
        const now = Date.now();
        const cutoff = now - timeWindow;

        const summary = {
            timeWindow: timeWindow,
            totalOperations: 0,
            averageDuration: 0,
            maxDuration: 0,
            totalMemoryDelta: 0,
            operationBreakdown: {},
            alerts: this.alerts.filter(alert => alert.timestamp > cutoff),
            timestamp: now
        };

        let totalDuration = 0;
        let operationCount = 0;

        this.history.forEach((operationHistory, operationType) => {
            const recentMetrics = operationHistory.filter(m => m.timestamp > cutoff);

            if (recentMetrics.length > 0) {
                summary.operationBreakdown[operationType] = {
                    count: recentMetrics.length,
                    averageDuration: recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length,
                    maxDuration: Math.max(...recentMetrics.map(m => m.duration)),
                    totalMemoryDelta: recentMetrics.reduce((sum, m) => sum + m.memoryUsage.delta, 0)
                };

                summary.totalOperations += recentMetrics.length;
                totalDuration += recentMetrics.reduce((sum, m) => sum + m.duration, 0);
                summary.maxDuration = Math.max(summary.maxDuration,
                    Math.max(...recentMetrics.map(m => m.duration)));
                summary.totalMemoryDelta += recentMetrics.reduce((sum, m) => sum + m.memoryUsage.delta, 0);
                operationCount += recentMetrics.length;
            }
        });

        summary.averageDuration = operationCount > 0 ? totalDuration / operationCount : 0;

        return summary;
    }

    /**
     * Get detailed metrics for a specific operation type
     * @param {string} operationType - Type of operation to analyze
     * @param {number} limit - Maximum number of recent operations to return
     */
    getDetailedMetrics(operationType, limit = 10) {
        const operationHistory = this.history.get(operationType) || [];
        const recentMetrics = operationHistory
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);

        return {
            operationType: operationType,
            metrics: recentMetrics,
            summary: this.calculateOperationSummary(recentMetrics),
            timestamp: Date.now()
        };
    }

    /**
     * Store metrics in historical data
     * @private
     */
    storeHistoricalMetrics(operationId, metrics) {
        const operationType = metrics.operationType;
        if (!this.history.has(operationType)) {
            this.history.set(operationType, []);
        }

        const operationHistory = this.history.get(operationType);
        operationHistory.push(metrics.getMetrics());

        // Keep only last 1000 entries per operation type to prevent memory issues
        if (operationHistory.length > 1000) {
            operationHistory.shift();
        }
    }

    /**
     * Check performance against thresholds and generate alerts
     * @private
     */
    checkPerformanceThresholds(operationId, metrics) {
        const issues = [];

        if (metrics.duration > this.thresholds.maxTurnProcessingTime) {
            issues.push({
                type: 'slow_operation',
                operationId: operationId,
                duration: metrics.duration,
                threshold: this.thresholds.maxTurnProcessingTime,
                severity: 'warning'
            });
        }

        if (Math.abs(metrics.memoryUsage.delta) > this.thresholds.maxMemoryDelta) {
            issues.push({
                type: 'high_memory_usage',
                operationId: operationId,
                memoryDelta: metrics.memoryUsage.delta,
                threshold: this.thresholds.maxMemoryDelta,
                severity: 'warning'
            });
        }

        if (metrics.computationalLoad.complexity > this.thresholds.maxComputationalLoad) {
            issues.push({
                type: 'high_computational_load',
                operationId: operationId,
                complexity: metrics.computationalLoad.complexity,
                threshold: this.thresholds.maxComputationalLoad,
                severity: 'warning'
            });
        }

        if (metrics.updateFrequency.updatesPerMinute < this.thresholds.minUpdateFrequency) {
            issues.push({
                type: 'low_update_frequency',
                operationId: operationId,
                frequency: metrics.updateFrequency.updatesPerMinute,
                threshold: this.thresholds.minUpdateFrequency,
                severity: 'info'
            });
        }

        if (metrics.updateFrequency.updatesPerMinute > this.thresholds.maxUpdateFrequency) {
            issues.push({
                type: 'high_update_frequency',
                operationId: operationId,
                frequency: metrics.updateFrequency.updatesPerMinute,
                threshold: this.thresholds.maxUpdateFrequency,
                severity: 'warning'
            });
        }

        // Add alerts for any issues found
        issues.forEach(issue => {
            this.alerts.push({
                ...issue,
                timestamp: Date.now(),
                operationType: metrics.operationType
            });
        });

        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }
    }

    /**
     * Calculate summary statistics for an operation
     * @private
     */
    calculateOperationSummary(metrics) {
        if (metrics.length === 0) {
            return {
                count: 0,
                averageDuration: 0,
                maxDuration: 0,
                minDuration: 0,
                totalMemoryDelta: 0
            };
        }

        const durations = metrics.map(m => m.duration);
        const memoryDeltas = metrics.map(m => m.memoryUsage.delta);

        return {
            count: metrics.length,
            averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
            maxDuration: Math.max(...durations),
            minDuration: Math.min(...durations),
            totalMemoryDelta: memoryDeltas.reduce((sum, d) => sum + d, 0)
        };
    }

    /**
     * Get current alerts
     * @param {number} limit - Maximum number of alerts to return
     */
    getAlerts(limit = 10) {
        return this.alerts
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * Clear old historical data
     * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
     */
    clearOldData(maxAge = 3600000) {
        const cutoff = Date.now() - maxAge;

        this.history.forEach((operationHistory, operationType) => {
            const filtered = operationHistory.filter(m => m.timestamp > cutoff);
            this.history.set(operationType, filtered);
        });

        this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
    }

    /**
     * Export performance data for analysis
     */
    exportData() {
        return {
            history: Object.fromEntries(this.history),
            alerts: this.alerts,
            thresholds: this.thresholds,
            exportTimestamp: Date.now()
        };
    }

    /**
     * Reset all monitoring data
     */
    reset() {
        this.metrics.clear();
        this.history.clear();
        this.alerts = [];
    }
}

export default PerformanceMonitoringService;