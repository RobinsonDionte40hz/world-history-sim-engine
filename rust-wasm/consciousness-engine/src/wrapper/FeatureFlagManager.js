/**
 * FeatureFlagManager - Feature Flag System for WASM Consciousness Engine
 * 
 * Epic 8, Task 8.1: Implement feature flag system
 * 
 * Features:
 * - Gradual WASM rollout with percentage-based deployment
 * - A/B testing capability between JavaScript and WASM
 * - Runtime switching based on performance metrics
 * - Automatic fallback detection for WASM failures
 * - User cohort segmentation
 * - Performance monitoring and anomaly detection
 * - Configuration persistence
 * 
 * Usage:
 *   const flagManager = new FeatureFlagManager(consciousnessEngine);
 *   await flagManager.initialize();
 *   
 *   // Check if WASM should be used for this operation
 *   if (flagManager.shouldUseWASM('user123')) {
 *       result = engine.calculateBehavioralState(state);
 *   }
 */

export class FeatureFlagManager {
    constructor(consciousnessEngine) {
        this.engine = consciousnessEngine;
        this.config = this._getDefaultConfig();
        this.metrics = this._initializeMetrics();
        this.cohorts = new Map(); // userId -> cohort assignment
        this.initialized = false;
        
        // Performance thresholds for automatic switching
        this.performanceThresholds = {
            maxAverageTime: 10.0,      // 10ms max average
            maxErrorRate: 0.05,         // 5% max error rate
            minSpeedup: 1.5,            // Minimum 1.5x speedup required
            sampleSize: 100             // Minimum samples before switching
        };
        
        // Anomaly detection
        this.anomalyDetector = {
            recentErrors: [],
            recentLatencies: [],
            maxHistorySize: 1000
        };
    }

    /**
     * Initialize feature flag system
     * @param {Object} customConfig - Optional custom configuration
     * @returns {Promise<boolean>} True if initialization successful
     */
    async initialize(customConfig = null) {
        try {
            // Load configuration from storage if available
            await this._loadConfiguration();
            
            // Apply custom configuration if provided
            if (customConfig) {
                this.config = { ...this.config, ...customConfig };
            }
            
            // Initialize cohort assignments
            await this._initializeCohorts();
            
            // Start performance monitoring
            this._startPerformanceMonitoring();
            
            this.initialized = true;
            console.log('✅ Feature Flag Manager initialized');
            console.log(`   WASM enabled: ${this.config.wasmEnabled}`);
            console.log(`   Rollout percentage: ${this.config.rolloutPercentage}%`);
            console.log(`   A/B testing: ${this.config.abTestingEnabled ? 'Enabled' : 'Disabled'}`);
            
            return true;
        } catch (error) {
            console.error('❌ Feature Flag Manager initialization failed:', error);
            this.initialized = false;
            return false;
        }
    }

    /**
     * Determine if WASM should be used for this user/operation
     * @param {string} userId - User identifier (or operation ID)
     * @param {string} context - Optional context (e.g., 'batch', 'single', 'critical')
     * @returns {boolean} True if WASM should be used
     */
    shouldUseWASM(userId, context = 'default') {
        // Check if feature flag system is initialized
        if (!this.initialized) {
            console.warn('⚠️  Feature Flag Manager not initialized, using default behavior');
            return !this.engine.useFallback;
        }
        
        // Check global WASM enabled flag
        if (!this.config.wasmEnabled) {
            return false;
        }
        
        // Check if WASM failed initialization
        if (this.engine.useFallback) {
            return false;
        }
        
        // Check context-specific overrides
        if (this.config.contextOverrides && this.config.contextOverrides[context] !== undefined) {
            return this.config.contextOverrides[context];
        }
        
        // Check if A/B testing is enabled
        if (this.config.abTestingEnabled) {
            return this._abTestDecision(userId);
        }
        
        // Check rollout percentage
        return this._rolloutDecision(userId);
    }

    /**
     * Record operation result for performance monitoring
     * @param {string} userId - User identifier
     * @param {string} module - 'wasm' or 'javascript'
     * @param {number} duration - Operation duration in milliseconds
     * @param {boolean} success - Whether operation succeeded
     * @param {Object} metadata - Additional metadata
     */
    recordOperation(userId, module, duration, success, metadata = {}) {
        // Update metrics
        const moduleKey = module.toLowerCase();
        if (!this.metrics[moduleKey]) {
            this.metrics[moduleKey] = this._initializeModuleMetrics();
        }
        
        this.metrics[moduleKey].totalCalls++;
        this.metrics[moduleKey].totalDuration += duration;
        this.metrics[moduleKey].averageDuration = 
            this.metrics[moduleKey].totalDuration / this.metrics[moduleKey].totalCalls;
        
        if (success) {
            this.metrics[moduleKey].successCount++;
        } else {
            this.metrics[moduleKey].failureCount++;
            this._recordAnomaly('error', { userId, module, duration, metadata });
        }
        
        this.metrics[moduleKey].errorRate = 
            this.metrics[moduleKey].failureCount / this.metrics[moduleKey].totalCalls;
        
        // Record latency for anomaly detection
        this._recordLatency(moduleKey, duration);
        
        // Check for performance degradation
        this._checkPerformanceThresholds(moduleKey);
    }

    /**
     * Get current feature flag status
     * @returns {Object} Feature flag configuration and metrics
     */
    getStatus() {
        return {
            initialized: this.initialized,
            config: { ...this.config },
            metrics: { ...this.metrics },
            cohorts: {
                total: this.cohorts.size,
                wasmCohort: Array.from(this.cohorts.values()).filter(c => c === 'wasm').length,
                jsCohort: Array.from(this.cohorts.values()).filter(c => c === 'javascript').length
            },
            thresholds: { ...this.performanceThresholds },
            anomalies: {
                recentErrors: this.anomalyDetector.recentErrors.slice(-10),
                recentLatencies: this._getLatencyStats()
            }
        };
    }

    /**
     * Update feature flag configuration at runtime
     * @param {Object} newConfig - New configuration values
     * @param {boolean} persist - Whether to persist to storage
     */
    async updateConfiguration(newConfig, persist = true) {
        const oldConfig = { ...this.config };
        
        // Update configuration
        this.config = { ...this.config, ...newConfig };
        
        // Log configuration change
        console.log('⚙️  Feature flag configuration updated:');
        Object.keys(newConfig).forEach(key => {
            if (oldConfig[key] !== newConfig[key]) {
                console.log(`   ${key}: ${oldConfig[key]} → ${newConfig[key]}`);
            }
        });
        
        // Persist if requested
        if (persist) {
            await this._saveConfiguration();
        }
        
        // If rollout percentage changed, reassign cohorts
        if (newConfig.rolloutPercentage !== undefined && 
            newConfig.rolloutPercentage !== oldConfig.rolloutPercentage) {
            await this._reassignCohorts();
        }
    }

    /**
     * Force rollback to JavaScript for all users
     * @param {string} reason - Reason for rollback
     */
    async forceRollback(reason) {
        console.warn('⚠️  FORCING ROLLBACK TO JAVASCRIPT');
        console.warn(`   Reason: ${reason}`);
        
        await this.updateConfiguration({
            wasmEnabled: false,
            rollbackReason: reason,
            rollbackTimestamp: Date.now()
        });
        
        // Record rollback event
        this.metrics.rollbacks = this.metrics.rollbacks || [];
        this.metrics.rollbacks.push({
            timestamp: Date.now(),
            reason,
            metrics: { ...this.metrics }
        });
    }

    /**
     * Gradually increase WASM rollout
     * @param {number} increment - Percentage to increase (e.g., 10 for 10%)
     */
    async increaseRollout(increment) {
        const newPercentage = Math.min(100, this.config.rolloutPercentage + increment);
        console.log(`📈 Increasing WASM rollout: ${this.config.rolloutPercentage}% → ${newPercentage}%`);
        
        await this.updateConfiguration({
            rolloutPercentage: newPercentage
        });
    }

    /**
     * Gradually decrease WASM rollout
     * @param {number} decrement - Percentage to decrease (e.g., 10 for 10%)
     */
    async decreaseRollout(decrement) {
        const newPercentage = Math.max(0, this.config.rolloutPercentage - decrement);
        console.log(`📉 Decreasing WASM rollout: ${this.config.rolloutPercentage}% → ${newPercentage}%`);
        
        await this.updateConfiguration({
            rolloutPercentage: newPercentage
        });
    }

    /**
     * Enable A/B testing
     * @param {number} wasmPercentage - Percentage in WASM cohort (0-100)
     */
    async enableABTesting(wasmPercentage = 50) {
        console.log(`🔬 Enabling A/B testing: ${wasmPercentage}% WASM, ${100 - wasmPercentage}% JavaScript`);
        
        await this.updateConfiguration({
            abTestingEnabled: true,
            rolloutPercentage: wasmPercentage
        });
        
        // Reassign cohorts for A/B testing
        await this._reassignCohorts();
    }

    /**
     * Disable A/B testing and use rollout percentage
     */
    async disableABTesting() {
        console.log('🔬 Disabling A/B testing, switching to rollout mode');
        
        await this.updateConfiguration({
            abTestingEnabled: false
        });
    }

    /**
     * Get A/B test results comparison
     * @returns {Object} Comparison of WASM vs JavaScript performance
     */
    getABTestResults() {
        const wasm = this.metrics.wasm || this._initializeModuleMetrics();
        const js = this.metrics.javascript || this._initializeModuleMetrics();
        
        const speedup = js.averageDuration > 0 
            ? js.averageDuration / wasm.averageDuration 
            : 0;
        
        return {
            wasm: {
                calls: wasm.totalCalls,
                averageTime: wasm.averageDuration.toFixed(4),
                errorRate: (wasm.errorRate * 100).toFixed(2) + '%',
                successRate: ((wasm.successCount / wasm.totalCalls * 100) || 0).toFixed(2) + '%'
            },
            javascript: {
                calls: js.totalCalls,
                averageTime: js.averageDuration.toFixed(4),
                errorRate: (js.errorRate * 100).toFixed(2) + '%',
                successRate: ((js.successCount / js.totalCalls * 100) || 0).toFixed(2) + '%'
            },
            comparison: {
                speedup: speedup.toFixed(2) + 'x',
                speedupMeetsThreshold: speedup >= this.performanceThresholds.minSpeedup,
                wasmFaster: speedup > 1.0,
                recommendation: this._getRecommendation(wasm, js, speedup)
            }
        };
    }

    /**
     * Private: Get default configuration
     */
    _getDefaultConfig() {
        return {
            wasmEnabled: true,              // Global WASM enable/disable
            rolloutPercentage: 10,          // Start with 10% rollout
            abTestingEnabled: false,        // A/B testing disabled by default
            contextOverrides: {},           // Context-specific overrides
            cohortStrategy: 'hash',         // 'hash', 'random', or 'manual'
            performanceMonitoring: true,    // Enable performance monitoring
            autoRollback: true,             // Enable automatic rollback on issues
            rollbackReason: null,           // Last rollback reason
            rollbackTimestamp: null         // Last rollback time
        };
    }

    /**
     * Private: Initialize metrics
     */
    _initializeMetrics() {
        return {
            wasm: this._initializeModuleMetrics(),
            javascript: this._initializeModuleMetrics(),
            rollbacks: []
        };
    }

    /**
     * Private: Initialize module-specific metrics
     */
    _initializeModuleMetrics() {
        return {
            totalCalls: 0,
            totalDuration: 0,
            averageDuration: 0,
            successCount: 0,
            failureCount: 0,
            errorRate: 0
        };
    }

    /**
     * Private: A/B test decision
     */
    _abTestDecision(userId) {
        // Check if user already has cohort assignment
        if (this.cohorts.has(userId)) {
            return this.cohorts.get(userId) === 'wasm';
        }
        
        // Assign to cohort based on rollout percentage
        const shouldUseWasm = this._hashUserId(userId) < this.config.rolloutPercentage;
        this.cohorts.set(userId, shouldUseWasm ? 'wasm' : 'javascript');
        
        return shouldUseWasm;
    }

    /**
     * Private: Rollout decision
     */
    _rolloutDecision(userId) {
        // Use hash-based deterministic assignment
        return this._hashUserId(userId) < this.config.rolloutPercentage;
    }

    /**
     * Private: Hash user ID to percentage (0-100)
     */
    _hashUserId(userId) {
        // Simple hash function for deterministic user assignment
        let hash = 0;
        const str = String(userId);
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Convert to percentage (0-100)
        return Math.abs(hash) % 100;
    }

    /**
     * Private: Initialize cohorts
     */
    async _initializeCohorts() {
        // Load existing cohort assignments from storage if available
        try {
            const stored = await this._loadFromStorage('cohortAssignments');
            if (stored) {
                this.cohorts = new Map(Object.entries(stored));
            }
        } catch (error) {
            console.warn('⚠️  Could not load cohort assignments:', error.message);
        }
    }

    /**
     * Private: Reassign cohorts (when rollout percentage changes)
     */
    async _reassignCohorts() {
        console.log('🔄 Reassigning user cohorts...');
        
        // Clear existing assignments
        this.cohorts.clear();
        
        // Persist updated (empty) cohorts
        await this._saveToStorage('cohortAssignments', {});
        
        console.log('✅ Cohorts reassigned');
    }

    /**
     * Private: Record latency for anomaly detection
     */
    _recordLatency(module, duration) {
        this.anomalyDetector.recentLatencies.push({
            timestamp: Date.now(),
            module,
            duration
        });
        
        // Keep only recent history
        if (this.anomalyDetector.recentLatencies.length > this.anomalyDetector.maxHistorySize) {
            this.anomalyDetector.recentLatencies.shift();
        }
    }

    /**
     * Private: Record anomaly
     */
    _recordAnomaly(type, details) {
        this.anomalyDetector.recentErrors.push({
            timestamp: Date.now(),
            type,
            details
        });
        
        // Keep only recent history
        if (this.anomalyDetector.recentErrors.length > 100) {
            this.anomalyDetector.recentErrors.shift();
        }
    }

    /**
     * Private: Get latency statistics
     */
    _getLatencyStats() {
        const wasmLatencies = this.anomalyDetector.recentLatencies
            .filter(l => l.module === 'wasm')
            .map(l => l.duration);
        
        const jsLatencies = this.anomalyDetector.recentLatencies
            .filter(l => l.module === 'javascript')
            .map(l => l.duration);
        
        return {
            wasm: this._calculateStats(wasmLatencies),
            javascript: this._calculateStats(jsLatencies)
        };
    }

    /**
     * Private: Calculate statistics
     */
    _calculateStats(values) {
        if (values.length === 0) {
            return { count: 0, mean: 0, median: 0, p95: 0, p99: 0 };
        }
        
        const sorted = values.slice().sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);
        
        return {
            count: values.length,
            mean: sum / values.length,
            median: sorted[Math.floor(sorted.length / 2)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)]
        };
    }

    /**
     * Private: Check performance thresholds and trigger rollback if needed
     */
    _checkPerformanceThresholds(module) {
        if (!this.config.autoRollback || !this.config.performanceMonitoring) {
            return;
        }
        
        const metrics = this.metrics[module];
        
        // Check if we have enough samples
        if (metrics.totalCalls < this.performanceThresholds.sampleSize) {
            return;
        }
        
        // Check error rate
        if (metrics.errorRate > this.performanceThresholds.maxErrorRate) {
            this.forceRollback(
                `High error rate in ${module}: ${(metrics.errorRate * 100).toFixed(2)}% ` +
                `(threshold: ${(this.performanceThresholds.maxErrorRate * 100).toFixed(2)}%)`
            );
            return;
        }
        
        // Check average latency (only for WASM)
        if (module === 'wasm' && metrics.averageDuration > this.performanceThresholds.maxAverageTime) {
            this.forceRollback(
                `High latency in WASM: ${metrics.averageDuration.toFixed(2)}ms ` +
                `(threshold: ${this.performanceThresholds.maxAverageTime}ms)`
            );
            return;
        }
        
        // Check if WASM is actually faster than JavaScript (if both have data)
        if (module === 'wasm' && this.metrics.javascript.totalCalls >= this.performanceThresholds.sampleSize) {
            const speedup = this.metrics.javascript.averageDuration / metrics.averageDuration;
            
            if (speedup < this.performanceThresholds.minSpeedup) {
                this.forceRollback(
                    `WASM not meeting speedup threshold: ${speedup.toFixed(2)}x ` +
                    `(threshold: ${this.performanceThresholds.minSpeedup}x)`
                );
                return;
            }
        }
    }

    /**
     * Private: Get recommendation based on A/B test results
     */
    _getRecommendation(wasmMetrics, jsMetrics, speedup) {
        const wasmSamples = wasmMetrics.totalCalls;
        const jsSamples = jsMetrics.totalCalls;
        
        if (wasmSamples < this.performanceThresholds.sampleSize || 
            jsSamples < this.performanceThresholds.sampleSize) {
            return 'Insufficient data - continue testing';
        }
        
        if (wasmMetrics.errorRate > this.performanceThresholds.maxErrorRate) {
            return 'Rollback - high error rate';
        }
        
        if (speedup < this.performanceThresholds.minSpeedup) {
            return 'Rollback - insufficient performance improvement';
        }
        
        if (speedup >= 5.0 && wasmMetrics.errorRate < 0.01) {
            return 'Full rollout - excellent performance';
        }
        
        if (speedup >= 2.0 && wasmMetrics.errorRate < 0.02) {
            return 'Increase rollout to 50%';
        }
        
        return 'Continue gradual rollout';
    }

    /**
     * Private: Start performance monitoring
     */
    _startPerformanceMonitoring() {
        if (!this.config.performanceMonitoring) {
            return;
        }
        
        // Set up periodic monitoring (every 60 seconds)
        this.monitoringInterval = setInterval(() => {
            this._performPeriodicCheck();
        }, 60000);
    }

    /**
     * Private: Perform periodic health check
     */
    _performPeriodicCheck() {
        const status = this.getStatus();
        
        // Log status if there are any concerns
        if (status.metrics.wasm.errorRate > 0.02 || 
            status.metrics.wasm.averageDuration > 5.0) {
            console.warn('⚠️  Performance concern detected:', {
                errorRate: (status.metrics.wasm.errorRate * 100).toFixed(2) + '%',
                averageLatency: status.metrics.wasm.averageDuration.toFixed(2) + 'ms'
            });
        }
    }

    /**
     * Private: Load configuration from storage
     */
    async _loadConfiguration() {
        try {
            const stored = await this._loadFromStorage('featureFlagConfig');
            if (stored) {
                this.config = { ...this.config, ...stored };
            }
        } catch (error) {
            console.warn('⚠️  Could not load configuration:', error.message);
        }
    }

    /**
     * Private: Save configuration to storage
     */
    async _saveConfiguration() {
        try {
            await this._saveToStorage('featureFlagConfig', this.config);
        } catch (error) {
            console.error('❌ Could not save configuration:', error);
        }
    }

    /**
     * Private: Load from storage (localStorage or fallback)
     */
    async _loadFromStorage(key) {
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem(`wasmFeatureFlags_${key}`);
            return stored ? JSON.parse(stored) : null;
        }
        return null;
    }

    /**
     * Private: Save to storage (localStorage or fallback)
     */
    async _saveToStorage(key, value) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`wasmFeatureFlags_${key}`, JSON.stringify(value));
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
    }
}
