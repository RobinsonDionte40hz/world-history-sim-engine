/**
 * RollbackManager - Comprehensive Rollback and Fallback System
 * 
 * Epic 8, Task 8.2: Create comprehensive rollback mechanism
 * 
 * Features:
 * - Maintain JavaScript implementation as guaranteed fallback
 * - Automatic rollback on performance regression with multiple triggers
 * - Rollback decision criteria based on health metrics
 * - Graceful degradation strategies with partial rollback
 * - Historical rollback tracking and analysis
 * - Health monitoring with alerting
 * - Circuit breaker pattern implementation
 * - Canary deployment support
 * 
 * Usage:
 *   const rollbackManager = new RollbackManager(engine, flagManager);
 *   await rollbackManager.initialize();
 *   
 *   // Continuous health monitoring
 *   rollbackManager.startHealthMonitoring();
 */

export class RollbackManager {
    constructor(engine, flagManager) {
        this.engine = engine;
        this.flagManager = flagManager;
        
        // Health monitoring state
        this.healthState = {
            overall: 'healthy',      // 'healthy', 'degraded', 'critical', 'failed'
            wasm: 'healthy',
            javascript: 'healthy',
            lastCheck: null,
            consecutiveFailures: 0,
            consecutiveSuccesses: 0
        };
        
        // Circuit breaker state
        this.circuitBreaker = {
            state: 'closed',         // 'closed', 'open', 'half-open'
            failureCount: 0,
            lastFailureTime: null,
            openedAt: null,
            halfOpenAttempts: 0,
            config: {
                failureThreshold: 5,     // Failures before opening
                successThreshold: 3,      // Successes before closing
                timeout: 60000,           // 1 minute cooldown
                halfOpenMaxAttempts: 5    // Max attempts in half-open
            }
        };
        
        // Rollback history
        this.rollbackHistory = [];
        
        // Performance baselines
        this.baselines = {
            wasm: {
                averageLatency: null,
                p95Latency: null,
                errorRate: null,
                throughput: null
            },
            javascript: {
                averageLatency: null,
                p95Latency: null,
                errorRate: null,
                throughput: null
            }
        };
        
        // Health check configuration
        this.healthCheckConfig = {
            interval: 30000,           // 30 seconds
            enabled: true,
            alertThresholds: {
                errorRate: 0.05,       // 5%
                latencyDegradation: 2.0,  // 2x slowdown
                throughputDegradation: 0.5  // 50% reduction
            }
        };
        
        // Graceful degradation strategies
        this.degradationStrategies = [
            {
                name: 'reduce_batch_size',
                trigger: 'high_latency',
                action: (context) => this._reduceBatchSize(context)
            },
            {
                name: 'disable_complex_features',
                trigger: 'memory_pressure',
                action: (context) => this._disableComplexFeatures(context)
            },
            {
                name: 'partial_rollback',
                trigger: 'moderate_errors',
                action: (context) => this._partialRollback(context)
            },
            {
                name: 'full_rollback',
                trigger: 'critical_errors',
                action: (context) => this._fullRollback(context)
            }
        ];
        
        // Monitoring interval
        this.monitoringInterval = null;
    }

    /**
     * Initialize rollback manager
     * @param {Object} config - Optional configuration
     * @returns {Promise<boolean>} True if initialization successful
     */
    async initialize(config = {}) {
        try {
            // Apply custom configuration
            if (config.healthCheckInterval) {
                this.healthCheckConfig.interval = config.healthCheckInterval;
            }
            if (config.alertThresholds) {
                this.healthCheckConfig.alertThresholds = {
                    ...this.healthCheckConfig.alertThresholds,
                    ...config.alertThresholds
                };
            }
            if (config.circuitBreaker) {
                this.circuitBreaker.config = {
                    ...this.circuitBreaker.config,
                    ...config.circuitBreaker
                };
            }
            
            // Establish performance baselines
            await this._establishBaselines();
            
            // Load rollback history from storage
            await this._loadRollbackHistory();
            
            console.log('✅ Rollback Manager initialized');
            console.log(`   Health check interval: ${this.healthCheckConfig.interval}ms`);
            console.log(`   Circuit breaker threshold: ${this.circuitBreaker.config.failureThreshold} failures`);
            console.log(`   Alert thresholds: Error ${(this.healthCheckConfig.alertThresholds.errorRate * 100).toFixed(1)}%, ` +
                       `Latency ${this.healthCheckConfig.alertThresholds.latencyDegradation}x`);
            
            return true;
        } catch (error) {
            console.error('❌ Rollback Manager initialization failed:', error);
            return false;
        }
    }

    /**
     * Start continuous health monitoring
     */
    startHealthMonitoring() {
        if (this.monitoringInterval) {
            console.warn('⚠️  Health monitoring already running');
            return;
        }
        
        console.log('🏥 Starting health monitoring...');
        
        this.monitoringInterval = setInterval(() => {
            this._performHealthCheck();
        }, this.healthCheckConfig.interval);
        
        // Perform immediate health check
        this._performHealthCheck();
    }

    /**
     * Stop health monitoring
     */
    stopHealthMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            console.log('🏥 Health monitoring stopped');
        }
    }

    /**
     * Record operation result for health tracking
     * @param {string} module - 'wasm' or 'javascript'
     * @param {number} duration - Operation duration in ms
     * @param {boolean} success - Whether operation succeeded
     */
    recordOperation(module, duration, success) {
        // Update circuit breaker
        if (module === 'wasm') {
            if (success) {
                this._recordSuccess();
            } else {
                this._recordFailure();
            }
        }
        
        // Update health state
        if (!success) {
            this.healthState.consecutiveFailures++;
            this.healthState.consecutiveSuccesses = 0;
            
            // Check if we need to take action
            if (this.healthState.consecutiveFailures >= 3) {
                this._handleConsecutiveFailures();
            }
        } else {
            this.healthState.consecutiveSuccesses++;
            this.healthState.consecutiveFailures = 0;
            
            // Check if we can recover
            if (this.healthState.consecutiveSuccesses >= 10 && 
                this.healthState.overall === 'degraded') {
                this._attemptRecovery();
            }
        }
    }

    /**
     * Check if WASM should be allowed (circuit breaker check)
     * @returns {boolean} True if WASM can be used
     */
    canUseWASM() {
        // Check circuit breaker state
        if (this.circuitBreaker.state === 'open') {
            // Check if timeout has elapsed
            const now = Date.now();
            const elapsed = now - this.circuitBreaker.openedAt;
            
            if (elapsed >= this.circuitBreaker.config.timeout) {
                // Try half-open state
                this._transitionToHalfOpen();
                return true;
            }
            
            return false;
        }
        
        if (this.circuitBreaker.state === 'half-open') {
            // Allow limited attempts
            if (this.circuitBreaker.halfOpenAttempts >= this.circuitBreaker.config.halfOpenMaxAttempts) {
                return false;
            }
            this.circuitBreaker.halfOpenAttempts++;
            return true;
        }
        
        // Circuit is closed, allow WASM
        return true;
    }

    /**
     * Execute rollback to JavaScript
     * @param {string} reason - Reason for rollback
     * @param {string} severity - 'low', 'medium', 'high', 'critical'
     * @returns {Promise<boolean>} True if rollback successful
     */
    async executeRollback(reason, severity = 'medium') {
        console.warn('⚠️  EXECUTING ROLLBACK');
        console.warn(`   Reason: ${reason}`);
        console.warn(`   Severity: ${severity}`);
        
        try {
            // Record rollback event
            const rollbackEvent = {
                timestamp: Date.now(),
                reason,
                severity,
                healthState: { ...this.healthState },
                circuitBreakerState: this.circuitBreaker.state,
                metrics: this.flagManager.getStatus().metrics
            };
            
            this.rollbackHistory.push(rollbackEvent);
            await this._saveRollbackHistory();
            
            // Open circuit breaker
            this._openCircuit();
            
            // Execute rollback via feature flag manager
            await this.flagManager.forceRollback(reason);
            
            // Update health state
            this.healthState.overall = severity === 'critical' ? 'failed' : 'degraded';
            this.healthState.wasm = 'failed';
            this.healthState.lastCheck = Date.now();
            
            // Emit alert
            this._emitAlert('rollback', {
                reason,
                severity,
                timestamp: rollbackEvent.timestamp
            });
            
            console.warn('✅ Rollback completed successfully');
            return true;
        } catch (error) {
            console.error('❌ Rollback failed:', error);
            return false;
        }
    }

    /**
     * Attempt to recover from degraded state
     * @returns {Promise<boolean>} True if recovery successful
     */
    async attemptRecovery() {
        if (this.healthState.overall === 'healthy') {
            console.log('✅ System already healthy');
            return true;
        }
        
        console.log('🔄 Attempting recovery from degraded state...');
        
        try {
            // Check if circuit breaker allows recovery
            if (this.circuitBreaker.state === 'open') {
                const elapsed = Date.now() - this.circuitBreaker.openedAt;
                if (elapsed < this.circuitBreaker.config.timeout) {
                    console.log('⏳ Circuit breaker still open, waiting for timeout');
                    return false;
                }
            }
            
            // Transition to half-open
            this._transitionToHalfOpen();
            
            // Enable WASM at low percentage (canary deployment)
            await this.flagManager.updateConfiguration({
                wasmEnabled: true,
                rolloutPercentage: 5  // Start with 5% canary
            });
            
            console.log('🕯️  Canary deployment started (5% WASM)');
            
            // Monitor canary for success
            // (In production, this would be monitored over time)
            
            return true;
        } catch (error) {
            console.error('❌ Recovery attempt failed:', error);
            return false;
        }
    }

    /**
     * Get comprehensive health report
     * @returns {Object} Health report with all metrics
     */
    getHealthReport() {
        const flagStatus = this.flagManager.getStatus();
        const wasmMetrics = flagStatus.metrics.wasm;
        const jsMetrics = flagStatus.metrics.javascript;
        
        // Calculate health scores (0-100)
        const wasmHealth = this._calculateHealthScore('wasm', wasmMetrics);
        const jsHealth = this._calculateHealthScore('javascript', jsMetrics);
        
        // Determine overall system health
        const overallHealth = this._determineOverallHealth(wasmHealth, jsHealth);
        
        return {
            timestamp: Date.now(),
            overall: {
                status: this.healthState.overall,
                score: overallHealth.score,
                grade: overallHealth.grade
            },
            modules: {
                wasm: {
                    status: this.healthState.wasm,
                    score: wasmHealth.score,
                    grade: wasmHealth.grade,
                    metrics: {
                        calls: wasmMetrics.totalCalls,
                        averageLatency: wasmMetrics.averageDuration,
                        errorRate: wasmMetrics.errorRate,
                        successRate: wasmMetrics.successCount / wasmMetrics.totalCalls || 0
                    },
                    baseline: this.baselines.wasm
                },
                javascript: {
                    status: this.healthState.javascript,
                    score: jsHealth.score,
                    grade: jsHealth.grade,
                    metrics: {
                        calls: jsMetrics.totalCalls,
                        averageLatency: jsMetrics.averageDuration,
                        errorRate: jsMetrics.errorRate,
                        successRate: jsMetrics.successCount / jsMetrics.totalCalls || 0
                    },
                    baseline: this.baselines.javascript
                }
            },
            circuitBreaker: {
                state: this.circuitBreaker.state,
                failureCount: this.circuitBreaker.failureCount,
                openedAt: this.circuitBreaker.openedAt,
                canUseWASM: this.canUseWASM()
            },
            recommendations: this._generateRecommendations(wasmHealth, jsHealth),
            recentRollbacks: this.rollbackHistory.slice(-5)
        };
    }

    /**
     * Get rollback history analysis
     * @returns {Object} Rollback statistics and patterns
     */
    getRollbackAnalysis() {
        if (this.rollbackHistory.length === 0) {
            return {
                totalRollbacks: 0,
                message: 'No rollbacks recorded'
            };
        }
        
        const rollbacks = this.rollbackHistory;
        const now = Date.now();
        
        // Calculate statistics
        const last24h = rollbacks.filter(r => now - r.timestamp < 86400000).length;
        const last7d = rollbacks.filter(r => now - r.timestamp < 604800000).length;
        
        // Group by reason
        const reasonCounts = {};
        rollbacks.forEach(r => {
            reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
        });
        
        // Group by severity
        const severityCounts = {};
        rollbacks.forEach(r => {
            severityCounts[r.severity] = (severityCounts[r.severity] || 0) + 1;
        });
        
        // Calculate mean time between rollbacks
        const mtbr = rollbacks.length > 1 
            ? (rollbacks[rollbacks.length - 1].timestamp - rollbacks[0].timestamp) / (rollbacks.length - 1)
            : null;
        
        return {
            totalRollbacks: rollbacks.length,
            last24Hours: last24h,
            last7Days: last7d,
            reasonBreakdown: reasonCounts,
            severityBreakdown: severityCounts,
            meanTimeBetweenRollbacks: mtbr ? Math.floor(mtbr / 1000) + ' seconds' : 'N/A',
            mostCommonReason: Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
            recentTrend: last24h > 2 ? '⚠️  High rollback frequency' : '✅ Normal'
        };
    }

    /**
     * Private: Perform health check
     */
    async _performHealthCheck() {
        try {
            const flagStatus = this.flagManager.getStatus();
            const wasmMetrics = flagStatus.metrics.wasm;
            const jsMetrics = flagStatus.metrics.javascript;
            
            // Check WASM health
            if (wasmMetrics.totalCalls >= 100) {
                const wasmHealth = this._assessModuleHealth('wasm', wasmMetrics);
                
                if (wasmHealth.needsRollback) {
                    await this.executeRollback(wasmHealth.reason, wasmHealth.severity);
                } else if (wasmHealth.needsDegradation) {
                    this._applyDegradationStrategy(wasmHealth.strategy);
                }
            }
            
            this.healthState.lastCheck = Date.now();
        } catch (error) {
            console.error('❌ Health check failed:', error);
        }
    }

    /**
     * Private: Assess module health
     */
    _assessModuleHealth(module, metrics) {
        const result = {
            needsRollback: false,
            needsDegradation: false,
            reason: null,
            severity: 'low',
            strategy: null
        };
        
        const baseline = this.baselines[module];
        const thresholds = this.healthCheckConfig.alertThresholds;
        
        // Check error rate
        if (metrics.errorRate > thresholds.errorRate) {
            result.needsRollback = true;
            result.reason = `High error rate: ${(metrics.errorRate * 100).toFixed(2)}%`;
            result.severity = metrics.errorRate > 0.15 ? 'critical' : 'high';
            return result;
        }
        
        // Check latency degradation
        if (baseline.averageLatency && metrics.averageDuration > baseline.averageLatency * thresholds.latencyDegradation) {
            result.needsDegradation = true;
            result.reason = `Latency degradation: ${(metrics.averageDuration / baseline.averageLatency).toFixed(2)}x baseline`;
            result.strategy = 'reduce_batch_size';
            result.severity = 'medium';
            
            // If severe degradation, rollback instead
            if (metrics.averageDuration > baseline.averageLatency * 5) {
                result.needsRollback = true;
                result.needsDegradation = false;
                result.severity = 'high';
            }
            return result;
        }
        
        return result;
    }

    /**
     * Private: Establish performance baselines
     */
    async _establishBaselines() {
        console.log('📊 Establishing performance baselines...');
        
        const testState = {
            baseFrequency: 7.5,
            baseCoherence: 0.7,
            emotionalState: 'Content'
        };
        
        // Baseline WASM
        if (!this.engine.useFallback) {
            const wasmLatencies = [];
            for (let i = 0; i < 50; i++) {
                const start = performance.now();
                this.engine.calculateBehavioralState(testState);
                wasmLatencies.push(performance.now() - start);
            }
            
            wasmLatencies.sort((a, b) => a - b);
            this.baselines.wasm = {
                averageLatency: wasmLatencies.reduce((a, b) => a + b) / wasmLatencies.length,
                p95Latency: wasmLatencies[Math.floor(wasmLatencies.length * 0.95)],
                errorRate: 0,
                throughput: 1000 / (wasmLatencies.reduce((a, b) => a + b) / wasmLatencies.length)
            };
        }
        
        // Baseline JavaScript
        this.engine.useFallback = true;
        const jsLatencies = [];
        for (let i = 0; i < 50; i++) {
            const start = performance.now();
            this.engine.calculateBehavioralState(testState);
            jsLatencies.push(performance.now() - start);
        }
        this.engine.useFallback = false;
        
        jsLatencies.sort((a, b) => a - b);
        this.baselines.javascript = {
            averageLatency: jsLatencies.reduce((a, b) => a + b) / jsLatencies.length,
            p95Latency: jsLatencies[Math.floor(jsLatencies.length * 0.95)],
            errorRate: 0,
            throughput: 1000 / (jsLatencies.reduce((a, b) => a + b) / jsLatencies.length)
        };
        
        console.log('✅ Baselines established:');
        console.log(`   WASM: ${this.baselines.wasm.averageLatency.toFixed(4)}ms avg`);
        console.log(`   JS: ${this.baselines.javascript.averageLatency.toFixed(4)}ms avg`);
    }

    /**
     * Private: Record circuit breaker success
     */
    _recordSuccess() {
        if (this.circuitBreaker.state === 'half-open') {
            const successCount = this.healthState.consecutiveSuccesses;
            
            if (successCount >= this.circuitBreaker.config.successThreshold) {
                this._closeCircuit();
            }
        }
    }

    /**
     * Private: Record circuit breaker failure
     */
    _recordFailure() {
        this.circuitBreaker.failureCount++;
        this.circuitBreaker.lastFailureTime = Date.now();
        
        if (this.circuitBreaker.state === 'closed' &&
            this.circuitBreaker.failureCount >= this.circuitBreaker.config.failureThreshold) {
            this._openCircuit();
        } else if (this.circuitBreaker.state === 'half-open') {
            this._openCircuit();
        }
    }

    /**
     * Private: Open circuit breaker
     */
    _openCircuit() {
        this.circuitBreaker.state = 'open';
        this.circuitBreaker.openedAt = Date.now();
        this.circuitBreaker.halfOpenAttempts = 0;
        
        console.warn('🔴 Circuit breaker OPEN - WASM disabled');
    }

    /**
     * Private: Transition to half-open
     */
    _transitionToHalfOpen() {
        this.circuitBreaker.state = 'half-open';
        this.circuitBreaker.halfOpenAttempts = 0;
        
        console.log('🟡 Circuit breaker HALF-OPEN - Testing WASM');
    }

    /**
     * Private: Close circuit breaker
     */
    _closeCircuit() {
        this.circuitBreaker.state = 'closed';
        this.circuitBreaker.failureCount = 0;
        this.circuitBreaker.openedAt = null;
        
        console.log('🟢 Circuit breaker CLOSED - WASM fully restored');
    }

    /**
     * Private: Handle consecutive failures
     */
    async _handleConsecutiveFailures() {
        const failures = this.healthState.consecutiveFailures;
        
        if (failures >= 10) {
            await this.executeRollback(
                `${failures} consecutive failures detected`,
                'critical'
            );
        } else if (failures >= 5) {
            await this.executeRollback(
                `${failures} consecutive failures detected`,
                'high'
            );
        } else if (failures >= 3) {
            console.warn(`⚠️  ${failures} consecutive failures - monitoring closely`);
        }
    }

    /**
     * Private: Attempt recovery
     */
    async _attemptRecovery() {
        console.log('🔄 System showing improvement, attempting recovery...');
        await this.attemptRecovery();
    }

    /**
     * Private: Calculate health score (0-100)
     */
    _calculateHealthScore(module, metrics) {
        if (metrics.totalCalls === 0) {
            return { score: 100, grade: 'A' };
        }
        
        let score = 100;
        
        // Error rate impact (max -50 points)
        score -= metrics.errorRate * 500;
        
        // Latency impact (compared to baseline)
        const baseline = this.baselines[module];
        if (baseline.averageLatency) {
            const latencyRatio = metrics.averageDuration / baseline.averageLatency;
            if (latencyRatio > 1) {
                score -= (latencyRatio - 1) * 25;  // -25 points per 2x slowdown
            }
        }
        
        score = Math.max(0, Math.min(100, score));
        
        const grade = score >= 90 ? 'A' :
                     score >= 80 ? 'B' :
                     score >= 70 ? 'C' :
                     score >= 60 ? 'D' : 'F';
        
        return { score: Math.round(score), grade };
    }

    /**
     * Private: Determine overall health
     */
    _determineOverallHealth(wasmHealth, jsHealth) {
        const avgScore = (wasmHealth.score + jsHealth.score) / 2;
        
        const grade = avgScore >= 90 ? 'A' :
                     avgScore >= 80 ? 'B' :
                     avgScore >= 70 ? 'C' :
                     avgScore >= 60 ? 'D' : 'F';
        
        return { score: Math.round(avgScore), grade };
    }

    /**
     * Private: Generate recommendations
     */
    _generateRecommendations(wasmHealth, jsHealth) {
        const recommendations = [];
        
        if (wasmHealth.score < 70) {
            recommendations.push({
                priority: 'high',
                action: 'Consider rollback to JavaScript',
                reason: `WASM health score: ${wasmHealth.score} (Grade ${wasmHealth.grade})`
            });
        }
        
        if (wasmHealth.score < 90 && wasmHealth.score >= 70) {
            recommendations.push({
                priority: 'medium',
                action: 'Monitor WASM performance closely',
                reason: `WASM health declining (Grade ${wasmHealth.grade})`
            });
        }
        
        if (this.rollbackHistory.length > 3) {
            recommendations.push({
                priority: 'high',
                action: 'Investigate recurring rollback causes',
                reason: `${this.rollbackHistory.length} rollbacks recorded`
            });
        }
        
        return recommendations;
    }

    /**
     * Private: Apply degradation strategy
     */
    _applyDegradationStrategy(strategyName) {
        const strategy = this.degradationStrategies.find(s => s.name === strategyName);
        
        if (strategy) {
            console.warn(`⚠️  Applying degradation strategy: ${strategyName}`);
            strategy.action({});
        }
    }

    /**
     * Private: Reduce batch size (degradation strategy)
     */
    _reduceBatchSize(context) {
        console.log('📉 Reducing batch size to improve performance');
        // In production, this would reduce batch processing size
    }

    /**
     * Private: Disable complex features (degradation strategy)
     */
    _disableComplexFeatures(context) {
        console.log('🔧 Disabling complex features');
        // In production, this would disable non-essential features
    }

    /**
     * Private: Partial rollback (degradation strategy)
     */
    async _partialRollback(context) {
        console.log('⚠️  Executing partial rollback (50% JavaScript)');
        await this.flagManager.updateConfiguration({ rolloutPercentage: 50 });
    }

    /**
     * Private: Full rollback (degradation strategy)
     */
    async _fullRollback(context) {
        await this.executeRollback('Critical errors detected', 'critical');
    }

    /**
     * Private: Emit alert
     */
    _emitAlert(type, data) {
        console.warn(`🚨 ALERT [${type}]:`, data);
        // In production, this would send alerts to monitoring systems
    }

    /**
     * Private: Load rollback history
     */
    async _loadRollbackHistory() {
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('wasmRollbackHistory');
                if (stored) {
                    this.rollbackHistory = JSON.parse(stored);
                }
            }
        } catch (error) {
            console.warn('⚠️  Could not load rollback history:', error.message);
        }
    }

    /**
     * Private: Save rollback history
     */
    async _saveRollbackHistory() {
        try {
            if (typeof localStorage !== 'undefined') {
                // Keep only last 100 rollbacks
                const toSave = this.rollbackHistory.slice(-100);
                localStorage.setItem('wasmRollbackHistory', JSON.stringify(toSave));
            }
        } catch (error) {
            console.error('❌ Could not save rollback history:', error);
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.stopHealthMonitoring();
    }
}
