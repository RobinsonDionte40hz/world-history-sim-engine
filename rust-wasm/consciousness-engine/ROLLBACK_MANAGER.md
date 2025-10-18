# Rollback Manager - Comprehensive Documentation

**Epic 8, Task 8.2: Comprehensive Rollback Mechanism**

## Overview

The Rollback Manager provides enterprise-grade rollback capabilities for the WASM Consciousness Engine, including circuit breaker patterns, automatic health monitoring, and graceful degradation strategies.

## 🎯 Key Features

### 1. **Circuit Breaker Pattern**
- Automatically opens on repeated failures
- Half-open state for recovery testing
- Configurable thresholds and timeouts
- Prevents cascade failures

### 2. **Health Monitoring**
- Continuous health checks (configurable interval)
- Performance baseline tracking
- Health scoring (0-100 with letter grades)
- Anomaly detection

### 3. **Automatic Rollback**
- Error rate thresholds (default: 5%)
- Latency degradation detection (default: 2x baseline)
- Consecutive failure tracking
- Severity-based responses

### 4. **Graceful Degradation**
- Partial rollback strategies
- Batch size reduction
- Feature disabling
- Canary deployments

### 5. **Recovery Management**
- Automatic recovery attempts
- Half-open testing
- Gradual re-enable (canary → full)
- Success threshold tracking

## 🚀 Quick Start

### Basic Setup

```javascript
import { ConsciousnessEngineWasm } from './ConsciousnessEngineWasm.js';
import { FeatureFlagManager } from './FeatureFlagManager.js';
import { RollbackManager } from './RollbackManager.js';

// Initialize components
const engine = new ConsciousnessEngineWasm();
await engine.initialize();

const flagManager = new FeatureFlagManager(engine);
await flagManager.initialize();

const rollbackManager = new RollbackManager(engine, flagManager);
await rollbackManager.initialize();

// Start continuous monitoring
rollbackManager.startHealthMonitoring();
```

### Recording Operations

```javascript
// After each operation
const start = performance.now();
const result = engine.calculateBehavioralState(state);
const duration = performance.now() - start;

rollbackManager.recordOperation('wasm', duration, true);
```

### Checking Health

```javascript
// Get comprehensive health report
const report = rollbackManager.getHealthReport();
console.log('Overall health:', report.overall.status);
console.log('Health score:', report.overall.score);
console.log('Circuit breaker:', report.circuitBreaker.state);
```

## 📋 API Reference

### `RollbackManager(engine, flagManager)`

Constructor that wraps ConsciousnessEngineWasm and FeatureFlagManager instances.

```javascript
const rollbackManager = new RollbackManager(engine, flagManager);
```

---

### `async initialize(config?)`

Initialize the rollback manager with optional configuration.

**Parameters**:
```javascript
{
    healthCheckInterval: number,     // Milliseconds between health checks
    alertThresholds: {
        errorRate: number,           // Max error rate (0-1)
        latencyDegradation: number,  // Max latency multiplier
        throughputDegradation: number // Min throughput multiplier
    },
    circuitBreaker: {
        failureThreshold: number,    // Failures before opening
        successThreshold: number,     // Successes before closing
        timeout: number,              // Cooldown period (ms)
        halfOpenMaxAttempts: number  // Max half-open attempts
    }
}
```

**Returns**: `Promise<boolean>` - True if initialization successful

**Example**:
```javascript
await rollbackManager.initialize({
    healthCheckInterval: 15000,  // 15 seconds
    alertThresholds: {
        errorRate: 0.03,         // 3% max
        latencyDegradation: 1.5  // 1.5x slowdown
    }
});
```

---

### `startHealthMonitoring()`

Start continuous health monitoring.

```javascript
rollbackManager.startHealthMonitoring();
```

---

### `stopHealthMonitoring()`

Stop health monitoring.

```javascript
rollbackManager.stopHealthMonitoring();
```

---

### `recordOperation(module, duration, success)`

Record an operation for health tracking.

**Parameters**:
- `module`: string - 'wasm' or 'javascript'
- `duration`: number - Operation duration in milliseconds
- `success`: boolean - Whether operation succeeded

**Example**:
```javascript
const start = performance.now();
try {
    const result = engine.calculateBehavioralState(state);
    rollbackManager.recordOperation('wasm', performance.now() - start, true);
} catch (error) {
    rollbackManager.recordOperation('wasm', performance.now() - start, false);
}
```

---

### `canUseWASM()`

Check if WASM is allowed (circuit breaker check).

**Returns**: `boolean` - True if WASM can be used

**Example**:
```javascript
if (rollbackManager.canUseWASM()) {
    // Safe to use WASM
    result = engine.calculateBehavioralState(state);
} else {
    // Circuit breaker open, use JavaScript
    engine.useFallback = true;
    result = engine.calculateBehavioralState(state);
    engine.useFallback = false;
}
```

---

### `async executeRollback(reason, severity?)`

Execute manual rollback to JavaScript.

**Parameters**:
- `reason`: string - Reason for rollback
- `severity`: string (optional) - 'low', 'medium', 'high', 'critical' (default: 'medium')

**Returns**: `Promise<boolean>` - True if rollback successful

**Example**:
```javascript
await rollbackManager.executeRollback(
    'Production incident detected',
    'critical'
);
```

---

### `async attemptRecovery()`

Attempt to recover from degraded state with canary deployment.

**Returns**: `Promise<boolean>` - True if recovery started

**Example**:
```javascript
// After resolving issues
const recovered = await rollbackManager.attemptRecovery();
if (recovered) {
    console.log('Canary deployment started (5% WASM)');
}
```

---

### `getHealthReport()`

Get comprehensive health report.

**Returns**:
```javascript
{
    timestamp: number,
    overall: {
        status: string,      // 'healthy', 'degraded', 'critical', 'failed'
        score: number,       // 0-100
        grade: string        // 'A', 'B', 'C', 'D', 'F'
    },
    modules: {
        wasm: {
            status: string,
            score: number,
            grade: string,
            metrics: {
                calls: number,
                averageLatency: number,
                errorRate: number,
                successRate: number
            },
            baseline: Object
        },
        javascript: { /* same structure */ }
    },
    circuitBreaker: {
        state: string,       // 'closed', 'open', 'half-open'
        failureCount: number,
        openedAt: number|null,
        canUseWASM: boolean
    },
    recommendations: Array<{
        priority: string,
        action: string,
        reason: string
    }>,
    recentRollbacks: Array
}
```

---

### `getRollbackAnalysis()`

Get rollback history statistics.

**Returns**:
```javascript
{
    totalRollbacks: number,
    last24Hours: number,
    last7Days: number,
    reasonBreakdown: Object,
    severityBreakdown: Object,
    meanTimeBetweenRollbacks: string,
    mostCommonReason: string,
    recentTrend: string
}
```

---

### `destroy()`

Cleanup resources (stop monitoring).

```javascript
rollbackManager.destroy();
```

## 🎭 Usage Patterns

### Pattern 1: Automatic Monitoring

```javascript
// Initialize and forget
await rollbackManager.initialize();
rollbackManager.startHealthMonitoring();

// System automatically:
// - Monitors health every 30 seconds
// - Opens circuit breaker on failures
// - Rolls back on critical issues
// - Attempts recovery when stable
```

### Pattern 2: Manual Health Checks

```javascript
// Check health on demand
const report = rollbackManager.getHealthReport();

if (report.overall.score < 70) {
    console.warn('System degraded:', report.recommendations);
    
    // Take action based on recommendations
    if (report.recommendations.some(r => r.priority === 'high')) {
        await rollbackManager.executeRollback('Low health score', 'high');
    }
}
```

### Pattern 3: Operation Recording

```javascript
// Record every operation
async function processCharacter(character) {
    const useWasm = rollbackManager.canUseWASM() && 
                    flagManager.shouldUseWASM(character.id);
    
    const start = performance.now();
    let success = true;
    let result;
    
    try {
        if (useWasm) {
            result = engine.calculateBehavioralState(character.consciousness);
            rollbackManager.recordOperation('wasm', performance.now() - start, true);
        } else {
            engine.useFallback = true;
            result = engine.calculateBehavioralState(character.consciousness);
            engine.useFallback = false;
            rollbackManager.recordOperation('javascript', performance.now() - start, true);
        }
    } catch (error) {
        success = false;
        rollbackManager.recordOperation(useWasm ? 'wasm' : 'javascript', 
                                       performance.now() - start, false);
        throw error;
    }
    
    return result;
}
```

### Pattern 4: Recovery After Incident

```javascript
// After fixing the issue
console.log('Issue resolved, attempting recovery...');

// Check if we can recover
const report = rollbackManager.getHealthReport();
if (report.circuitBreaker.state === 'open') {
    const elapsed = Date.now() - report.circuitBreaker.openedAt;
    console.log(`Circuit opened ${Math.floor(elapsed / 1000)}s ago`);
    
    // Attempt recovery
    const recovered = await rollbackManager.attemptRecovery();
    
    if (recovered) {
        console.log('Canary deployment started - monitoring closely');
        // Monitor canary for 1 hour before full rollout
    }
}
```

## 🔧 Configuration

### Default Configuration

```javascript
{
    healthCheckConfig: {
        interval: 30000,           // 30 seconds
        enabled: true,
        alertThresholds: {
            errorRate: 0.05,       // 5%
            latencyDegradation: 2.0,  // 2x slowdown
            throughputDegradation: 0.5  // 50% reduction
        }
    },
    circuitBreaker: {
        failureThreshold: 5,       // 5 failures before opening
        successThreshold: 3,        // 3 successes before closing
        timeout: 60000,             // 1 minute cooldown
        halfOpenMaxAttempts: 5     // 5 max half-open attempts
    }
}
```

### Production Configuration Example

```javascript
await rollbackManager.initialize({
    healthCheckInterval: 15000,  // Check every 15 seconds
    alertThresholds: {
        errorRate: 0.02,         // 2% threshold (strict)
        latencyDegradation: 1.5, // 1.5x threshold (sensitive)
        throughputDegradation: 0.7  // 30% reduction max
    },
    circuitBreaker: {
        failureThreshold: 3,     // Open after 3 failures (fast)
        successThreshold: 5,      // Need 5 successes (cautious)
        timeout: 120000,          // 2 minute cooldown (conservative)
        halfOpenMaxAttempts: 3   // Limited half-open attempts
    }
});
```

## 📊 Health Scoring

### Score Calculation

Health scores (0-100) are calculated based on:

1. **Error Rate** (max -50 points):
   - 0% errors: No penalty
   - 10% errors: -50 points
   - Scales linearly

2. **Latency** (max -50 points):
   - Baseline latency: No penalty
   - 2x baseline: -25 points
   - 4x baseline: -50 points
   - Scales linearly

### Letter Grades

- **A (90-100)**: Excellent health, no concerns
- **B (80-89)**: Good health, minor issues
- **C (70-79)**: Acceptable health, monitor closely
- **D (60-69)**: Poor health, consider action
- **F (<60)**: Critical health, rollback recommended

## 🔄 Circuit Breaker States

### Closed (Normal Operation)
- WASM fully operational
- Failures tracked but not blocking
- Opens after threshold failures

### Open (WASM Disabled)
- All traffic routed to JavaScript
- Cooldown period active
- Transitions to half-open after timeout

### Half-Open (Testing Recovery)
- Limited WASM operations allowed
- Success tracking active
- Closes after threshold successes
- Reopens on any failure

## 🚨 Automatic Rollback Triggers

### Trigger Conditions

1. **High Error Rate**:
   - Error rate > 5% (default)
   - Severity: High or Critical
   - Action: Immediate rollback

2. **Latency Degradation**:
   - Latency > 2x baseline (default)
   - Severity: Medium (degradation) or High (severe)
   - Action: Degradation strategy or rollback

3. **Consecutive Failures**:
   - 5+ failures: High severity rollback
   - 10+ failures: Critical severity rollback
   - Action: Immediate rollback

4. **Circuit Breaker Tripped**:
   - Failures exceed threshold
   - Action: Open circuit, disable WASM

## 📈 Rollback History

### Tracked Information

- Timestamp of rollback
- Reason and severity
- Health state at time of rollback
- Circuit breaker state
- Performance metrics

### Analysis Metrics

- Total rollbacks
- Rollbacks in last 24 hours/7 days
- Reason breakdown
- Severity breakdown
- Mean time between rollbacks
- Trend analysis

## 🧪 Testing

### Run Tests

```bash
cd rust-wasm/consciousness-engine
node test-rollback-manager.js
```

### Test Coverage

- ✅ Initialization and baseline establishment
- ✅ Health monitoring and scoring
- ✅ Circuit breaker (closed → open → half-open → closed)
- ✅ Automatic rollback triggers
- ✅ Manual rollback execution
- ✅ Recovery from degraded state
- ✅ Health report generation
- ✅ Rollback history tracking
- ✅ Consecutive failure handling
- ✅ Monitoring start/stop

## 🎓 Best Practices

### 1. Always Record Operations

```javascript
// Record every operation for accurate health tracking
rollbackManager.recordOperation(module, duration, success);
```

### 2. Start Monitoring Early

```javascript
// Start monitoring during initialization
rollbackManager.startHealthMonitoring();
```

### 3. Check Circuit Breaker Before WASM

```javascript
// Always check circuit breaker state
if (rollbackManager.canUseWASM()) {
    // Safe to use WASM
}
```

### 4. Monitor Health Regularly

```javascript
// Check health periodically
setInterval(() => {
    const report = rollbackManager.getHealthReport();
    if (report.overall.score < 80) {
        console.warn('Health declining:', report);
    }
}, 60000);
```

### 5. Document Rollbacks

```javascript
// Use descriptive rollback reasons
await rollbackManager.executeRollback(
    'API error rate exceeded 5% - Incident #1234',
    'high'
);
```

## 🔍 Troubleshooting

### Circuit Breaker Won't Close

**Symptom**: Circuit stays open despite improvements

**Investigation**:
```javascript
const report = rollbackManager.getHealthReport();
console.log('Circuit state:', report.circuitBreaker.state);
console.log('Opened at:', report.circuitBreaker.openedAt);
console.log('Consecutive successes:', rollbackManager.healthState.consecutiveSuccesses);
```

**Solution**: Record successful operations to reach success threshold (default: 3)

### Frequent Rollbacks

**Symptom**: Rollbacks happening too often

**Investigation**:
```javascript
const analysis = rollbackManager.getRollbackAnalysis();
console.log('Total rollbacks:', analysis.totalRollbacks);
console.log('Most common reason:', analysis.mostCommonReason);
console.log('Trend:', analysis.recentTrend);
```

**Solutions**:
1. Adjust thresholds (less sensitive)
2. Increase circuit breaker failure threshold
3. Investigate root cause of failures

### Health Score Always Low

**Symptom**: Health score consistently below 70

**Investigation**:
```javascript
const report = rollbackManager.getHealthReport();
console.log('WASM score:', report.modules.wasm.score);
console.log('Error rate:', report.modules.wasm.metrics.errorRate);
console.log('Average latency:', report.modules.wasm.metrics.averageLatency);
console.log('Baseline latency:', report.modules.wasm.baseline.averageLatency);
```

**Solutions**:
1. Check for WASM initialization issues
2. Verify performance baselines are accurate
3. Consider full rollback to JavaScript

## 🚀 Production Deployment

### Phase 1: Monitoring Only

```javascript
// Deploy with monitoring but no auto-rollback
await rollbackManager.initialize({
    alertThresholds: {
        errorRate: 0.10,  // High threshold (10%)
        latencyDegradation: 5.0  // Very high threshold
    }
});
rollbackManager.startHealthMonitoring();
```

### Phase 2: Conservative Rollback

```javascript
// Enable auto-rollback with conservative thresholds
await rollbackManager.initialize({
    alertThresholds: {
        errorRate: 0.05,  // 5% threshold
        latencyDegradation: 2.5  // 2.5x threshold
    },
    circuitBreaker: {
        failureThreshold: 10,  // Require more failures
        timeout: 300000  // 5 minute cooldown
    }
});
```

### Phase 3: Production Settings

```javascript
// Production-ready configuration
await rollbackManager.initialize({
    healthCheckInterval: 15000,
    alertThresholds: {
        errorRate: 0.03,  // 3% threshold
        latencyDegradation: 2.0  // 2x threshold
    },
    circuitBreaker: {
        failureThreshold: 5,
        successThreshold: 3,
        timeout: 60000
    }
});
```

## 📞 Integration with Monitoring Systems

### Example: Prometheus Metrics

```javascript
// Export metrics for Prometheus
function exportMetrics() {
    const report = rollbackManager.getHealthReport();
    const analysis = rollbackManager.getRollbackAnalysis();
    
    return {
        'wasm_health_score': report.modules.wasm.score,
        'wasm_error_rate': report.modules.wasm.metrics.errorRate,
        'wasm_latency_ms': report.modules.wasm.metrics.averageLatency,
        'circuit_breaker_state': report.circuitBreaker.state === 'closed' ? 1 : 0,
        'total_rollbacks': analysis.totalRollbacks,
        'rollbacks_24h': analysis.last24Hours
    };
}
```

### Example: Alert Webhook

```javascript
// Send alerts to external system
rollbackManager._emitAlert = function(type, data) {
    fetch('https://alerts.example.com/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, timestamp: Date.now() })
    });
};
```

---

**Version**: 1.0.0  
**Epic**: 8 - Rollback Strategy & Risk Mitigation  
**Task**: 8.2 - Create comprehensive rollback mechanism  
**Status**: ✅ Complete  
**Last Updated**: October 18, 2025
