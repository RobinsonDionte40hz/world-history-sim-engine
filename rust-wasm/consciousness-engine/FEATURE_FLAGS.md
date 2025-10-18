# Feature Flag System - WASM Consciousness Engine

**Epic 8, Task 8.1: Comprehensive Feature Flag Implementation**

## Overview

The Feature Flag System provides safe, gradual rollout of the WASM Consciousness Engine with automatic monitoring, A/B testing capabilities, and rollback protection.

## 🎯 Key Features

### 1. **Gradual Rollout**
- Start with low percentage (e.g., 10%) and gradually increase
- Deterministic user assignment based on hash
- Smooth migration path from JavaScript to WASM

### 2. **A/B Testing**
- Split users into WASM and JavaScript cohorts
- Compare performance and reliability
- Make data-driven rollout decisions

### 3. **Automatic Rollback**
- Monitor error rates in real-time
- Detect performance degradation
- Automatically rollback to JavaScript on issues

### 4. **Context-Specific Overrides**
- Override behavior for specific contexts (e.g., 'critical', 'batch')
- Fine-grained control over WASM usage
- Safety controls for sensitive operations

### 5. **Performance Monitoring**
- Track operation latency
- Calculate speedup ratios
- Detect anomalies
- Generate A/B test reports

## 🚀 Quick Start

### Basic Setup

```javascript
import { ConsciousnessEngineWasm } from './ConsciousnessEngineWasm.js';
import { FeatureFlagManager } from './FeatureFlagManager.js';

// Initialize engine
const engine = new ConsciousnessEngineWasm();
await engine.initialize();

// Initialize feature flag manager
const flagManager = new FeatureFlagManager(engine);
await flagManager.initialize({
    rolloutPercentage: 10,      // Start with 10%
    wasmEnabled: true,
    autoRollback: true
});
```

### Using Feature Flags

```javascript
// Check if WASM should be used for this user
const userId = 'user_12345';

if (flagManager.shouldUseWASM(userId)) {
    // Use WASM engine
    const result = engine.calculateBehavioralState(state);
    flagManager.recordOperation(userId, 'wasm', duration, true);
} else {
    // Use JavaScript fallback
    engine.useFallback = true;
    const result = engine.calculateBehavioralState(state);
    flagManager.recordOperation(userId, 'javascript', duration, true);
    engine.useFallback = false;
}
```

## 📋 API Reference

### `FeatureFlagManager(engine)`

Constructor that wraps a ConsciousnessEngineWasm instance.

```javascript
const flagManager = new FeatureFlagManager(engine);
```

---

### `async initialize(config?)`

Initialize the feature flag system with optional configuration.

**Parameters**:
```javascript
{
    wasmEnabled: boolean,           // Enable/disable WASM globally
    rolloutPercentage: number,      // 0-100, percentage of users to use WASM
    abTestingEnabled: boolean,      // Enable A/B testing mode
    contextOverrides: object,       // Context-specific overrides
    autoRollback: boolean,          // Enable automatic rollback
    performanceMonitoring: boolean  // Enable performance tracking
}
```

**Returns**: `Promise<boolean>` - True if initialization successful

---

### `shouldUseWASM(userId, context?)`

Determine if WASM should be used for a specific user/operation.

**Parameters**:
- `userId`: string - User or operation identifier
- `context`: string (optional) - Context like 'batch', 'critical', 'experimental'

**Returns**: `boolean` - True if WASM should be used

**Example**:
```javascript
if (flagManager.shouldUseWASM('user123', 'batch')) {
    // Use WASM for batch processing
}
```

---

### `recordOperation(userId, module, duration, success, metadata?)`

Record an operation for performance monitoring.

**Parameters**:
- `userId`: string - User identifier
- `module`: string - 'wasm' or 'javascript'
- `duration`: number - Operation duration in milliseconds
- `success`: boolean - Whether operation succeeded
- `metadata`: object (optional) - Additional context

**Example**:
```javascript
const start = performance.now();
const result = engine.calculateBehavioralState(state);
const duration = performance.now() - start;

flagManager.recordOperation(
    'user123',
    'wasm',
    duration,
    true,
    { operation: 'calculateBehavioralState' }
);
```

---

### `getStatus()`

Get current feature flag status and metrics.

**Returns**:
```javascript
{
    initialized: boolean,
    config: {
        wasmEnabled: boolean,
        rolloutPercentage: number,
        abTestingEnabled: boolean,
        // ... other config
    },
    metrics: {
        wasm: {
            totalCalls: number,
            averageDuration: number,
            errorRate: number,
            // ...
        },
        javascript: { /* same structure */ }
    },
    cohorts: {
        total: number,
        wasmCohort: number,
        jsCohort: number
    },
    anomalies: { /* error and latency data */ }
}
```

---

### `async updateConfiguration(newConfig, persist?)`

Update feature flag configuration at runtime.

**Parameters**:
- `newConfig`: object - Configuration values to update
- `persist`: boolean (default: true) - Save to localStorage

**Example**:
```javascript
await flagManager.updateConfiguration({
    rolloutPercentage: 25
});
```

---

### `async forceRollback(reason)`

Immediately rollback to JavaScript for all users.

**Parameters**:
- `reason`: string - Reason for rollback (for logging)

**Example**:
```javascript
await flagManager.forceRollback('Critical bug detected in WASM module');
```

---

### `async increaseRollout(increment)`

Gradually increase WASM rollout percentage.

**Example**:
```javascript
// Increase by 10%
await flagManager.increaseRollout(10);
```

---

### `async decreaseRollout(decrement)`

Gradually decrease WASM rollout percentage.

**Example**:
```javascript
// Decrease by 10%
await flagManager.decreaseRollout(10);
```

---

### `async enableABTesting(wasmPercentage)`

Enable A/B testing mode with specified WASM cohort size.

**Example**:
```javascript
// 50% WASM, 50% JavaScript
await flagManager.enableABTesting(50);
```

---

### `async disableABTesting()`

Disable A/B testing and return to rollout mode.

---

### `getABTestResults()`

Get A/B test performance comparison.

**Returns**:
```javascript
{
    wasm: {
        calls: number,
        averageTime: string,
        errorRate: string,
        successRate: string
    },
    javascript: { /* same structure */ },
    comparison: {
        speedup: string,
        speedupMeetsThreshold: boolean,
        wasmFaster: boolean,
        recommendation: string
    }
}
```

---

### `destroy()`

Cleanup resources (stop monitoring).

## 🎭 Usage Patterns

### Pattern 1: Gradual Rollout Strategy

```javascript
// Week 1: Start with 10%
await flagManager.initialize({ rolloutPercentage: 10 });

// Week 2: Increase to 25%
await flagManager.increaseRollout(15);

// Week 3: Increase to 50%
await flagManager.increaseRollout(25);

// Week 4: Increase to 100%
await flagManager.increaseRollout(50);
```

### Pattern 2: A/B Testing Before Full Rollout

```javascript
// Enable A/B testing with 50/50 split
await flagManager.enableABTesting(50);

// Run for 1 week, collect data...

// Analyze results
const results = flagManager.getABTestResults();
console.log('Speedup:', results.comparison.speedup);
console.log('Recommendation:', results.comparison.recommendation);

// If successful, increase rollout
if (results.comparison.speedupMeetsThreshold) {
    await flagManager.disableABTesting();
    await flagManager.updateConfiguration({ rolloutPercentage: 100 });
}
```

### Pattern 3: Context-Specific Control

```javascript
// Configure context overrides
await flagManager.updateConfiguration({
    contextOverrides: {
        'critical': false,      // Critical operations always use JS
        'batch': true,          // Batch always uses WASM
        'hero_npc': true,       // Hero NPCs use WASM
        'background': false     // Background processing uses JS
    }
});

// Use in code
if (character.isHero) {
    const useWasm = flagManager.shouldUseWASM(character.id, 'hero_npc');
    // ...
} else if (isBackgroundTask) {
    const useWasm = flagManager.shouldUseWASM(taskId, 'background');
    // ...
}
```

### Pattern 4: Automatic Monitoring

```javascript
// Initialize with auto-rollback enabled
await flagManager.initialize({
    autoRollback: true,
    performanceMonitoring: true
});

// System automatically monitors:
// - Error rates (auto-rollback if > 5%)
// - Latency (auto-rollback if > 10ms average)
// - Speedup (auto-rollback if < 1.5x)

// Check status periodically
setInterval(() => {
    const status = flagManager.getStatus();
    if (!status.config.wasmEnabled) {
        console.warn('Auto-rollback triggered:', status.config.rollbackReason);
        // Alert ops team, investigate...
    }
}, 60000);
```

## 🔧 Configuration Options

### Default Configuration

```javascript
{
    wasmEnabled: true,              // Global WASM enable/disable
    rolloutPercentage: 10,          // Start conservative (10%)
    abTestingEnabled: false,        // Rollout mode by default
    contextOverrides: {},           // No overrides
    cohortStrategy: 'hash',         // Deterministic assignment
    performanceMonitoring: true,    // Track metrics
    autoRollback: true,             // Protect production
    rollbackReason: null,
    rollbackTimestamp: null
}
```

### Performance Thresholds

```javascript
{
    maxAverageTime: 10.0,      // 10ms max average latency
    maxErrorRate: 0.05,         // 5% max error rate
    minSpeedup: 1.5,            // Minimum 1.5x speedup vs JS
    sampleSize: 100             // Samples needed before decisions
}
```

## 📊 Monitoring & Metrics

### Key Metrics Tracked

1. **Call Counts**: Total WASM vs JavaScript operations
2. **Latency**: Average, median, P95, P99
3. **Error Rates**: Success/failure ratios
4. **Speedup**: WASM vs JavaScript comparison
5. **Cohort Distribution**: User assignment stability

### Accessing Metrics

```javascript
const status = flagManager.getStatus();

console.log('WASM Metrics:', status.metrics.wasm);
console.log('JS Metrics:', status.metrics.javascript);
console.log('Cohort Stats:', status.cohorts);
console.log('Recent Anomalies:', status.anomalies);
```

### A/B Test Analysis

```javascript
const abResults = flagManager.getABTestResults();

console.log('Performance Comparison:');
console.log(`  WASM: ${abResults.wasm.averageTime}ms`);
console.log(`  JS: ${abResults.javascript.averageTime}ms`);
console.log(`  Speedup: ${abResults.comparison.speedup}`);
console.log(`  Recommendation: ${abResults.comparison.recommendation}`);
```

## 🛡️ Safety Features

### 1. Automatic Rollback Triggers

The system automatically rolls back to JavaScript if:

- Error rate exceeds 5%
- Average latency exceeds 10ms
- Speedup is less than 1.5x (after 100 samples)

### 2. Graceful Degradation

- If WASM fails to initialize → automatic JavaScript fallback
- If WASM crashes during operation → catch and fallback
- Configuration errors → use safe defaults

### 3. Cohort Persistence

- User assignments are sticky (same user always gets same cohort)
- Prevents users from bouncing between implementations
- Ensures consistent experience

### 4. Manual Override

```javascript
// Emergency rollback
await flagManager.forceRollback('Production incident');

// Disable WASM globally
await flagManager.updateConfiguration({ wasmEnabled: false });
```

## 🧪 Testing

### Run Tests

```bash
cd rust-wasm/consciousness-engine
node test-feature-flags.js
```

### Test Coverage

- ✅ Initialization and configuration
- ✅ Rollout percentage control (±15% variance expected)
- ✅ A/B testing cohort assignment
- ✅ Cohort persistence (sticky users)
- ✅ Performance monitoring
- ✅ A/B test results analysis
- ✅ Runtime configuration updates
- ✅ Context-specific overrides
- ✅ Automatic rollback simulation
- ✅ Manual rollback
- ✅ Gradual rollout strategy

## 🎓 Best Practices

### 1. Start Conservative

```javascript
// Week 1: 10% rollout
await flagManager.initialize({ rolloutPercentage: 10 });
```

### 2. Monitor Closely

```javascript
// Check metrics daily
const status = flagManager.getStatus();
console.log('WASM calls:', status.metrics.wasm.totalCalls);
console.log('Error rate:', status.metrics.wasm.errorRate);
```

### 3. A/B Test First

```javascript
// Run A/B test for 1-2 weeks
await flagManager.enableABTesting(50);
// Analyze results before full rollout
const results = flagManager.getABTestResults();
```

### 4. Use Context Overrides

```javascript
// Protect critical paths
await flagManager.updateConfiguration({
    contextOverrides: {
        'save_world': false,     // Always use JS for save
        'load_world': false,     // Always use JS for load
        'turn_processing': true  // Can use WASM for turns
    }
});
```

### 5. Plan Rollback Strategy

```javascript
// Document rollback plan
if (incident) {
    await flagManager.forceRollback('Incident #1234');
    // Alert team
    // Investigate issue
    // Fix and re-enable gradually
}
```

## 📈 Deployment Timeline

### Recommended Rollout Schedule

**Week 1-2: A/B Testing**
- 50% WASM, 50% JavaScript
- Collect performance data
- Monitor error rates

**Week 3: Initial Rollout**
- Start 10% rollout
- Monitor closely
- Increase to 25% if stable

**Week 4: Expansion**
- Increase to 50%
- Continue monitoring
- Watch for anomalies

**Week 5: Near-Full Rollout**
- Increase to 75%
- Monitor performance at scale
- Prepare for 100%

**Week 6: Full Rollout**
- Increase to 100%
- Continue monitoring
- Declare victory 🎉

## 🔍 Troubleshooting

### High Error Rate

**Symptom**: Automatic rollback triggered due to errors

**Investigation**:
```javascript
const status = flagManager.getStatus();
console.log('Recent errors:', status.anomalies.recentErrors);
```

**Solutions**:
- Check WASM module version
- Verify browser compatibility
- Review error logs for patterns

### Low Speedup

**Symptom**: WASM not significantly faster than JavaScript

**Investigation**:
```javascript
const results = flagManager.getABTestResults();
console.log('Speedup:', results.comparison.speedup);
```

**Solutions**:
- Check if batch processing is used
- Verify WASM is actually being called
- Profile hot paths

### Cohort Imbalance

**Symptom**: Actual rollout differs from configured percentage

**Investigation**:
```javascript
// Test with 100 users
const testUsers = Array.from({ length: 100 }, (_, i) => `user${i}`);
let wasmCount = 0;
testUsers.forEach(u => {
    if (flagManager.shouldUseWASM(u)) wasmCount++;
});
console.log('Actual:', wasmCount, 'Expected:', config.rolloutPercentage);
```

**Note**: Hash-based assignment can have ±15% variance with small samples.

## 🚀 Next Steps

1. **Integrate with main engine**: Wrap existing ConsciousnessEngineWasm calls
2. **Set up monitoring dashboard**: Visualize metrics
3. **Configure alerts**: Notify on rollback events
4. **Document rollback procedures**: Operations runbook
5. **Plan gradual rollout**: Week-by-week schedule

---

**Version**: 1.0.0  
**Epic**: 8 - Rollback Strategy & Risk Mitigation  
**Task**: 8.1 - Implement feature flag system  
**Status**: ✅ Complete  
**Last Updated**: October 18, 2025
