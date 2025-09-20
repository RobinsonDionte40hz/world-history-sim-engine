# Consciousness System Troubleshooting Guide

This guide helps diagnose and resolve common issues with the consciousness system. It covers error scenarios, debugging techniques, and step-by-step solutions for problems you may encounter.

## Table of Contents

1. [Quick Diagnosis](#quick-diagnosis)
2. [Common Error Messages](#common-error-messages)
3. [Performance Issues](#performance-issues)
4. [Behavioral Problems](#behavioral-problems)
5. [Memory Issues](#memory-issues)
6. [Integration Problems](#integration-problems)
7. [Debugging Tools](#debugging-tools)
8. [Recovery Procedures](#recovery-procedures)

## Quick Diagnosis

### System Health Check

Run this quick diagnostic to identify common issues:

```javascript
import { ConsciousnessErrorHandlingService } from '../domain/services/ConsciousnessErrorHandlingService.js';
import { PerformanceMonitoringService } from '../domain/services/PerformanceMonitoringService.js';

class ConsciousnessDiagnostician {
  constructor() {
    this.errorHandler = new ConsciousnessErrorHandlingService();
    this.performanceMonitor = new PerformanceMonitoringService();
  }

  async runFullDiagnosis(world) {
    console.log('🔍 Running consciousness system diagnosis...');

    const results = {
      characterHealth: await this.checkCharacterHealth(world.characters),
      performanceMetrics: this.checkPerformanceMetrics(),
      memoryUsage: await this.checkMemoryUsage(world.characters),
      integrationStatus: this.checkIntegrationStatus(),
      recommendations: []
    };

    // Generate recommendations
    results.recommendations = this.generateRecommendations(results);

    this.displayResults(results);
    return results;
  }

  async checkCharacterHealth(characters) {
    const issues = [];

    for (const character of characters) {
      const health = this.errorHandler.isValidCharacter(character);

      if (!health.valid) {
        issues.push({
          characterId: character.id,
          issues: health.issues,
          severity: health.severity
        });
      }
    }

    return {
      totalCharacters: characters.length,
      healthyCharacters: characters.length - issues.length,
      issues: issues,
      healthScore: ((characters.length - issues.length) / characters.length) * 100
    };
  }

  checkPerformanceMetrics() {
    const metrics = this.performanceMonitor.getMetrics();

    return {
      averageUpdateTime: metrics.averageUpdateTime,
      memoryUsage: metrics.memoryUsage,
      errorRate: metrics.errorRate,
      isPerformanceDegraded: metrics.averageUpdateTime > 100 // > 100ms average
    };
  }

  async checkMemoryUsage(characters) {
    let totalMemories = 0;
    let totalEvents = 0;
    let memoryPressure = 0;

    for (const character of characters) {
      if (character.significantMemories) {
        totalMemories += character.significantMemories.length;
      }
      if (character.consciousness?.significantEvents) {
        totalEvents += character.consciousness.significantEvents.length;
      }
    }

    // Estimate memory pressure (rough calculation)
    memoryPressure = (totalMemories * 150 + totalEvents * 200) / (characters.length * 1000);

    return {
      totalMemories,
      totalEvents,
      averageMemoriesPerCharacter: totalMemories / characters.length,
      averageEventsPerCharacter: totalEvents / characters.length,
      memoryPressure, // 0-1 scale
      isHighMemoryUsage: memoryPressure > 0.7
    };
  }

  checkIntegrationStatus() {
    const issues = [];

    // Check if required services are available
    try {
      const BehavioralStateService = require('../domain/services/BehavioralStateService.js');
      new BehavioralStateService();
    } catch (error) {
      issues.push('BehavioralStateService not available');
    }

    try {
      const EventSignificanceService = require('../domain/services/EventSignificanceService.js');
      new EventSignificanceService();
    } catch (error) {
      issues.push('EventSignificanceService not available');
    }

    return {
      servicesAvailable: issues.length === 0,
      issues: issues
    };
  }

  generateRecommendations(results) {
    const recommendations = [];

    if (results.characterHealth.healthScore < 80) {
      recommendations.push('Run character health repair (see Character Health Issues)');
    }

    if (results.performanceMetrics.isPerformanceDegraded) {
      recommendations.push('Performance is degraded - check Performance Issues section');
    }

    if (results.memoryUsage.isHighMemoryUsage) {
      recommendations.push('High memory usage detected - run memory optimization');
    }

    if (!results.integrationStatus.servicesAvailable) {
      recommendations.push('Integration issues detected - check service availability');
    }

    return recommendations;
  }

  displayResults(results) {
    console.log('\n📊 Diagnosis Results:');
    console.log(`Character Health: ${results.characterHealth.healthScore.toFixed(1)}%`);
    console.log(`Performance: ${results.performanceMetrics.isPerformanceDegraded ? '⚠️ Degraded' : '✅ Good'}`);
    console.log(`Memory Usage: ${results.memoryUsage.isHighMemoryUsage ? '⚠️ High' : '✅ Normal'}`);
    console.log(`Integration: ${results.integrationStatus.servicesAvailable ? '✅ Good' : '⚠️ Issues'}`);

    if (results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      results.recommendations.forEach(rec => console.log(`- ${rec}`));
    }
  }
}

// Quick diagnostic command
const diagnostician = new ConsciousnessDiagnostician();
diagnostician.runFullDiagnosis(world);
```

## Common Error Messages

### "Cannot read property 'behavioralState' of undefined"

**Cause:** Character consciousness is not properly initialized.

**Solutions:**
```javascript
// Solution 1: Initialize consciousness during character creation
import { EnhancedConsciousnessState } from '../domain/value-objects/EnhancedConsciousnessState.js';

function createProperCharacter(config) {
  return {
    id: config.id,
    name: config.name,
    consciousness: new EnhancedConsciousnessState({
      baseFrequency: config.frequency || 7.5,
      baseCoherence: config.coherence || 0.7
    }),
    // ... other properties
  };
}

// Solution 2: Migrate existing characters
function migrateCharacter(character) {
  if (!character.consciousness) {
    character.consciousness = new EnhancedConsciousnessState();
  } else if (!(character.consciousness instanceof EnhancedConsciousnessState)) {
    // Migrate from old format
    character.consciousness = new EnhancedConsciousnessState(character.consciousness);
  }
  return character;
}
```

### "Significance threshold must be between 0.0 and 1.0"

**Cause:** Invalid significance threshold configuration.

**Solutions:**
```javascript
import { EventSignificanceService } from '../domain/services/EventSignificanceService.js';

const significanceService = new EventSignificanceService();

// Correct usage
significanceService.setSignificanceThreshold(0.3); // Valid: 0.0 - 1.0

// Incorrect usage (will throw error)
// significanceService.setSignificanceThreshold(1.5); // Invalid: > 1.0
// significanceService.setSignificanceThreshold(-0.1); // Invalid: < 0.0
```

### "Decision factor calculation failed: behavioral state is corrupted"

**Cause:** Behavioral state data is corrupted or missing.

**Solutions:**
```javascript
import { ConsciousnessErrorHandlingService } from '../domain/services/ConsciousnessErrorHandlingService.js';

const errorHandler = new ConsciousnessErrorHandlingService();

// Solution 1: Automatic recovery
const recoveryResult = errorHandler.handleMissingBehavioralState(character, {
  source: 'decision_calculation'
});

if (!recoveryResult.success) {
  console.error('Failed to recover behavioral state');
}

// Solution 2: Manual state reconstruction
function reconstructBehavioralState(character) {
  if (!character.consciousness) {
    character.consciousness = new EnhancedConsciousnessState();
    return;
  }

  // Force regeneration of behavioral state
  character.consciousness.behavioralState =
    character.consciousness.generateBehavioralState();

  console.log('Behavioral state reconstructed for', character.name);
}
```

### "Memory service: maximum memories exceeded"

**Cause:** Character has too many memories stored.

**Solutions:**
```javascript
import { SignificantMemoryService } from '../domain/services/SignificantMemoryService.js';

const memoryService = new SignificantMemoryService();

// Solution 1: Automatic cleanup
await memoryService.performMemoryCleanup(character, {
  maxMemories: 50,
  minSignificance: 0.3
});

// Solution 2: Manual memory pruning
function pruneMemories(character, keepCount = 30) {
  if (!character.significantMemories) return;

  // Sort by significance and recency
  character.significantMemories.sort((a, b) => {
    const scoreA = a.significance * calculateRecencyWeight(a.timestamp);
    const scoreB = b.significance * calculateRecencyWeight(b.timestamp);
    return scoreB - scoreA;
  });

  // Keep only the most important memories
  character.significantMemories = character.significantMemories.slice(0, keepCount);
}

function calculateRecencyWeight(timestamp) {
  const age = Date.now() - timestamp;
  const days = age / (24 * 60 * 60 * 1000);
  return Math.exp(-days / 30); // Exponential decay
}
```

## Performance Issues

### High CPU Usage During Turn Processing

**Symptoms:**
- Turn processing takes > 2 seconds
- UI becomes unresponsive
- High CPU usage in performance monitor

**Diagnosis:**
```javascript
// Check update frequency
function analyzeUpdateFrequency(characters) {
  let totalUpdates = 0;
  let totalEvents = 0;

  characters.forEach(character => {
    if (character.consciousness) {
      totalUpdates += character.consciousness.updateCount;
      totalEvents += character.consciousness.significantEvents?.length || 0;
    }
  });

  console.log(`Average updates per character: ${totalUpdates / characters.length}`);
  console.log(`Average events per character: ${totalEvents / characters.length}`);

  if (totalUpdates / characters.length > 5) {
    console.warn('High update frequency detected - consider increasing significance threshold');
  }
}
```

**Solutions:**
```javascript
// Solution 1: Increase significance threshold
significanceService.setSignificanceThreshold(0.4); // Increase from default 0.3

// Solution 2: Implement update rate limiting
class UpdateRateLimiter {
  constructor(maxUpdatesPerTurn = 20) {
    this.maxUpdatesPerTurn = maxUpdatesPerTurn;
    this.updatesThisTurn = 0;
  }

  canUpdate(character) {
    // Allow critical updates even when limit reached
    if (this.isCriticalUpdate(character)) {
      return true;
    }
    return this.updatesThisTurn < this.maxUpdatesPerTurn;
  }

  recordUpdate() {
    this.updatesThisTurn++;
  }

  reset() {
    this.updatesThisTurn = 0;
  }

  isCriticalUpdate(character) {
    // Allow updates for major life events
    const recentEvents = character.consciousness?.significantEvents?.slice(-5) || [];
    return recentEvents.some(event =>
      ['death', 'birth', 'war_declaration'].includes(event.type)
    );
  }
}

// Solution 3: Use LOD system for background characters
lodManager.configureTiers({
  hero: { maxCharacters: 25, updateFrequency: 1 },
  population: { maxCharacters: 200, updateFrequency: 3 },
  background: { maxCharacters: 10000, updateFrequency: 10 }
});
```

### Memory Usage Growing Over Time

**Symptoms:**
- Memory usage increases with each turn
- Browser tab becomes slow or crashes
- Garbage collection runs frequently

**Diagnosis:**
```javascript
// Monitor memory growth
class MemoryLeakDetector {
  constructor() {
    this.measurements = [];
    this.maxMeasurements = 10;
  }

  recordMemoryUsage() {
    // Use performance.memory if available (Chrome)
    if (performance.memory) {
      const measurement = {
        timestamp: Date.now(),
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
      this.measurements.push(measurement);

      if (this.measurements.length > this.maxMeasurements) {
        this.measurements.shift();
      }
    }
  }

  detectLeak() {
    if (this.measurements.length < 5) return false;

    const recent = this.measurements.slice(-3);
    const older = this.measurements.slice(0, 3);

    const recentAvg = recent.reduce((sum, m) => sum + m.used, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.used, 0) / older.length;

    const growthRate = (recentAvg - olderAvg) / olderAvg;

    return growthRate > 0.1; // 10% growth indicates potential leak
  }

  getMemoryReport() {
    if (this.measurements.length === 0) return null;

    const latest = this.measurements[this.measurements.length - 1];
    const hasLeak = this.detectLeak();

    return {
      currentUsage: latest.used,
      totalHeap: latest.total,
      heapLimit: latest.limit,
      usagePercentage: (latest.used / latest.limit) * 100,
      potentialLeak: hasLeak
    };
  }
}
```

**Solutions:**
```javascript
// Solution 1: Implement regular cleanup
import { MemoryManagementService } from '../domain/services/MemoryManagementService.js';

const memoryManager = new MemoryManagementService();

// Run cleanup every 10 turns
setInterval(() => {
  memoryManager.performWorldLevelCleanup(world);
}, 10 * TURN_DURATION);

// Solution 2: Limit event history
function limitEventHistory(characters, maxEvents = 20) {
  characters.forEach(character => {
    if (character.consciousness?.significantEvents) {
      if (character.consciousness.significantEvents.length > maxEvents) {
        // Keep most recent events
        character.consciousness.significantEvents =
          character.consciousness.significantEvents.slice(-maxEvents);
      }
    }
  });
}

// Solution 3: Use object pooling for frequently created objects
class ObjectPool {
  constructor(factory, maxSize = 100) {
    this.factory = factory;
    this.pool = [];
    this.maxSize = maxSize;
  }

  acquire() {
    return this.pool.length > 0 ? this.pool.pop() : this.factory();
  }

  release(object) {
    if (this.pool.length < this.maxSize) {
      // Reset object state
      this.resetObject(object);
      this.pool.push(object);
    }
  }

  resetObject(object) {
    // Clear object properties
    Object.keys(object).forEach(key => {
      if (typeof object[key] === 'object') {
        object[key] = null;
      } else {
        delete object[key];
      }
    });
  }
}

// Create pools for common objects
const behavioralStatePool = new ObjectPool(() => ({}), 1000);
const decisionFactorPool = new ObjectPool(() => ({ finalFactor: 1.0, breakdown: {} }), 500);
```

## Behavioral Problems

### Characters Not Responding to Events

**Symptoms:**
- Characters don't change behavior after significant events
- Consciousness parameters remain static
- No behavioral state updates

**Diagnosis:**
```javascript
// Check event processing pipeline
function debugEventProcessing(character, event) {
  console.log('Debugging event processing for:', character.name);
  console.log('Event:', event);

  // Check significance calculation
  const significanceService = new EventSignificanceService();
  const significance = significanceService.calculateEventSignificance(event);
  console.log('Calculated significance:', significance);

  // Check threshold
  const threshold = significanceService.getSignificanceThreshold();
  console.log('Significance threshold:', threshold);
  console.log('Event meets threshold:', significance >= threshold);

  // Check consciousness update
  if (significance >= threshold) {
    const updateService = new ConsciousnessUpdateService();
    const result = updateService.processEvent(character, event);
    console.log('Update result:', result);
  }
}
```

**Solutions:**
```javascript
// Solution 1: Check significance threshold settings
const significanceService = new EventSignificanceService();
console.log('Current threshold:', significanceService.getSignificanceThreshold());

// Lower threshold if events are being ignored
significanceService.setSignificanceThreshold(0.2);

// Solution 2: Verify event format
function validateEventFormat(event) {
  const requiredFields = ['type', 'outcome'];
  const missingFields = requiredFields.filter(field => !event[field]);

  if (missingFields.length > 0) {
    console.error('Invalid event format. Missing fields:', missingFields);
    return false;
  }

  return true;
}

// Solution 3: Check consciousness bounds
function validateConsciousnessBounds(character) {
  const c = character.consciousness;
  if (!c) {
    console.error('Character has no consciousness');
    return false;
  }

  const issues = [];
  if (c.baseFrequency < 3 || c.baseFrequency > 15) {
    issues.push(`Invalid frequency: ${c.baseFrequency} (should be 3-15)`);
  }
  if (c.baseCoherence < 0.2 || c.baseCoherence > 1.0) {
    issues.push(`Invalid coherence: ${c.baseCoherence} (should be 0.2-1.0)`);
  }

  if (issues.length > 0) {
    console.error('Consciousness bounds issues:', issues);
    return false;
  }

  return true;
}
```

### Inconsistent Character Behavior

**Symptoms:**
- Characters behave unpredictably
- Same situations produce different outcomes
- Behavioral state doesn't match expected values

**Diagnosis:**
```javascript
// Analyze behavioral consistency
function analyzeBehavioralConsistency(character, actions) {
  const results = [];

  actions.forEach(action => {
    const behavioralService = new BehavioralStateService();
    const modifier1 = behavioralService.getBehavioralModifier(character, action.type);
    const modifier2 = behavioralService.getBehavioralModifier(character, action.type);

    const consistency = Math.abs(modifier1 - modifier2) < 0.01; // Within 1% tolerance

    results.push({
      action: action.type,
      modifier1,
      modifier2,
      consistent: consistency
    });
  });

  const inconsistentActions = results.filter(r => !r.consistent);
  console.log(`Inconsistent actions: ${inconsistentActions.length}/${results.length}`);

  return results;
}
```

**Solutions:**
```javascript
// Solution 1: Stabilize random factors
// Remove or seed random elements in behavioral calculations
Math.random = (function() {
  let seed = 12345;
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
})();

// Solution 2: Cache behavioral calculations
class BehavioralCache {
  constructor(ttl = 30000) { // 30 second cache
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(characterId, actionType, contextHash) {
    const key = `${characterId}_${actionType}_${contextHash}`;
    const entry = this.cache.get(key);

    if (entry && Date.now() - entry.timestamp < this.ttl) {
      return entry.value;
    }

    this.cache.delete(key);
    return null;
  }

  set(characterId, actionType, contextHash, value) {
    const key = `${characterId}_${actionType}_${contextHash}`;
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  createContextHash(context) {
    // Create deterministic hash of context
    return JSON.stringify(context, Object.keys(context).sort());
  }
}

// Solution 3: Validate behavioral state integrity
function validateBehavioralState(character) {
  const state = character.consciousness.getBehavioralState();
  const requiredProperties = ['energy', 'focus', 'mood', 'socialDrive', 'riskTolerance', 'ambition'];

  const missingProperties = requiredProperties.filter(prop => !(prop in state));

  if (missingProperties.length > 0) {
    console.error('Invalid behavioral state. Missing properties:', missingProperties);

    // Regenerate behavioral state
    character.consciousness.behavioralState = character.consciousness.generateBehavioralState();
    return false;
  }

  return true;
}
```

## Memory Issues

### Memories Not Influencing Decisions

**Symptoms:**
- Character behavior doesn't reflect past experiences
- Memory analysis shows no relevant memories
- Decision modifiers remain at 1.0x

**Diagnosis:**
```javascript
// Debug memory retrieval
function debugMemoryRetrieval(character, actionType) {
  const memoryService = new SignificantMemoryService();

  console.log(`Debugging memory retrieval for ${character.name}, action: ${actionType}`);

  // Check if character has memories
  console.log('Character has memories:', !!character.significantMemories);
  console.log('Memory count:', character.significantMemories?.length || 0);

  if (character.significantMemories?.length > 0) {
    // Check memory relevance
    const relevantMemories = memoryService.getRelevantMemories(character, actionType, 5);
    console.log('Relevant memories found:', relevantMemories.length);

    relevantMemories.forEach(memory => {
      console.log('- Memory:', memory.description);
      console.log('  Significance:', memory.significance);
      console.log('  Outcome:', memory.outcome);
    });
  }

  // Check behavioral calculation
  const behavioralService = new BehavioralStateService(memoryService);
  const analysis = behavioralService.getMemoryAnalysis(character, actionType);
  console.log('Memory analysis:', analysis);
}
```

**Solutions:**
```javascript
// Solution 1: Ensure memories are being stored
function ensureMemoryStorage(character, event) {
  const memoryService = new SignificantMemoryService();

  const memory = {
    type: event.type,
    outcome: event.outcome,
    significance: event.significance || 0.5,
    description: event.description || `${event.type} event`,
    timestamp: Date.now()
  };

  const stored = memoryService.addMemoryIfSignificant(character, memory);

  if (!stored) {
    console.warn('Memory not stored - significance too low:', memory.significance);
  }

  return stored;
}

// Solution 2: Fix memory relevance calculation
// Ensure interaction types match between memory storage and retrieval
const INTERACTION_TYPE_MAPPING = {
  'social_interaction': 'social',
  'combat_encounter': 'combat',
  'trade_deal': 'economic',
  'exploration_trip': 'exploration'
};

function normalizeInteractionType(type) {
  return INTERACTION_TYPE_MAPPING[type] || type;
}

// Solution 3: Initialize memory storage
function initializeMemoryStorage(character) {
  if (!character.significantMemories) {
    character.significantMemories = [];
  }

  // Ensure it's an array
  if (!Array.isArray(character.significantMemories)) {
    console.warn('significantMemories is not an array, resetting');
    character.significantMemories = [];
  }
}
```

### Memory Leaks in Memory Storage

**Symptoms:**
- Memory usage grows indefinitely
- Performance degrades over time
- Browser crashes after long sessions

**Solutions:**
```javascript
// Solution 1: Implement memory limits
const memoryService = new SignificantMemoryService();
memoryService.setMemoryLimits({
  maxMemories: 50,
  minSignificance: 0.3,
  cleanupInterval: 60 * 60 * 1000 // 1 hour
});

// Solution 2: Regular cleanup process
class MemoryCleanupManager {
  constructor() {
    this.cleanupInterval = 30 * 60 * 1000; // 30 minutes
    this.startCleanupTimer();
  }

  startCleanupTimer() {
    setInterval(() => {
      this.performGlobalMemoryCleanup();
    }, this.cleanupInterval);
  }

  async performGlobalMemoryCleanup() {
    console.log('Performing global memory cleanup...');

    // Get all characters (implementation depends on your world structure)
    const characters = getAllCharacters();

    for (const character of characters) {
      await this.cleanupCharacterMemories(character);
    }

    console.log('Memory cleanup completed');
  }

  async cleanupCharacterMemories(character) {
    if (!character.significantMemories) return;

    const memoryService = new SignificantMemoryService();

    // Remove old memories
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    character.significantMemories = character.significantMemories.filter(
      memory => memory.timestamp > oneMonthAgo
    );

    // Limit memory count
    if (character.significantMemories.length > 50) {
      character.significantMemories.sort((a, b) => b.significance - a.significance);
      character.significantMemories = character.significantMemories.slice(0, 50);
    }

    // Perform significance-based cleanup
    await memoryService.performMemoryCleanup(character, {
      maxMemories: 40,
      minSignificance: 0.4
    });
  }
}

// Solution 3: Memory usage monitoring
class MemoryMonitor {
  constructor(thresholdMB = 100) {
    this.thresholdMB = thresholdMB;
    this.checkInterval = 60000; // 1 minute
    this.startMonitoring();
  }

  startMonitoring() {
    setInterval(() => {
      this.checkMemoryUsage();
    }, this.checkInterval);
  }

  checkMemoryUsage() {
    if (performance.memory) {
      const usageMB = performance.memory.usedJSHeapSize / (1024 * 1024);

      if (usageMB > this.thresholdMB) {
        console.warn(`High memory usage detected: ${usageMB.toFixed(1)}MB`);
        this.triggerMemoryCleanup();
      }
    }
  }

  triggerMemoryCleanup() {
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }

    // Trigger application-level cleanup
    const cleanupEvent = new CustomEvent('memoryPressure');
    window.dispatchEvent(cleanupEvent);
  }
}
```

## Integration Problems

### Service Initialization Issues

**Symptoms:**
- Services throw errors on creation
- Missing dependencies
- Circular dependency errors

**Solutions:**
```javascript
// Solution 1: Proper service initialization order
function initializeConsciousnessServices() {
  const services = {};

  // Initialize base services first
  services.errorHandler = new ConsciousnessErrorHandlingService();

  // Initialize core services
  services.significanceService = new EventSignificanceService();
  services.memoryService = new SignificantMemoryService(null, services.errorHandler);

  // Initialize dependent services
  services.behavioralService = new BehavioralStateService(
    services.memoryService,
    null,
    services.errorHandler
  );

  services.updateService = new ConsciousnessUpdateService(
    services.significanceService,
    null,
    services.errorHandler
  );

  return services;
}

// Solution 2: Dependency injection container
class ServiceContainer {
  constructor() {
    this.services = new Map();
    this.factories = new Map();
  }

  register(name, factory) {
    this.factories.set(name, factory);
  }

  get(name) {
    if (!this.services.has(name)) {
      const factory = this.factories.get(name);
      if (!factory) {
        throw new Error(`Service '${name}' not registered`);
      }

      this.services.set(name, factory(this));
    }

    return this.services.get(name);
  }
}

// Register services
const container = new ServiceContainer();

container.register('errorHandler', () => new ConsciousnessErrorHandlingService());
container.register('significanceService', () => new EventSignificanceService());
container.register('memoryService', (c) => new SignificantMemoryService(null, c.get('errorHandler')));
container.register('behavioralService', (c) => new BehavioralStateService(
  c.get('memoryService'),
  null,
  c.get('errorHandler')
));

// Usage
const behavioralService = container.get('behavioralService');
```

### Version Compatibility Issues

**Symptoms:**
- Errors when upgrading consciousness system
- Old data formats cause issues
- Migration failures

**Solutions:**
```javascript
// Solution 1: Version checking and migration
import { ConsciousnessMigrationService } from '../domain/services/ConsciousnessMigrationService.js';

function checkAndMigrateConsciousnessSystem(world) {
  const migrationService = new ConsciousnessMigrationService();

  console.log('Checking consciousness system version...');

  const migrationNeeded = world.characters.some(character => {
    return character.consciousness &&
           !(character.consciousness instanceof EnhancedConsciousnessState);
  });

  if (migrationNeeded) {
    console.log('Migration needed - starting migration process...');

    const results = migrationService.migrateWorld(world);

    console.log('Migration completed:', results);

    if (results.errors.length > 0) {
      console.error('Migration errors:', results.errors);
    }
  } else {
    console.log('Consciousness system is up to date');
  }
}

// Solution 2: Backward compatibility layer
class ConsciousnessCompatibilityLayer {
  static wrapConsciousness(consciousness) {
    if (consciousness instanceof EnhancedConsciousnessState) {
      return consciousness;
    }

    // Wrap old consciousness in compatibility layer
    return new ConsciousnessWrapper(consciousness);
  }
}

class ConsciousnessWrapper {
  constructor(oldConsciousness) {
    this.oldConsciousness = oldConsciousness;
    this.enhanced = new EnhancedConsciousnessState(oldConsciousness);
  }

  // Delegate to enhanced consciousness for new methods
  getBehavioralState() {
    return this.enhanced.getBehavioralState();
  }

  updateFromEvent(event) {
    return this.enhanced.updateFromEvent(event);
  }

  // Provide backward compatibility for old methods
  get frequency() {
    return this.oldConsciousness.frequency || this.enhanced.baseFrequency;
  }

  get coherence() {
    return this.oldConsciousness.coherence || this.enhanced.baseCoherence;
  }
}
```

## Debugging Tools

### Consciousness State Inspector

```javascript
class ConsciousnessInspector {
  constructor() {
    this.inspectedCharacters = new Map();
  }

  inspectCharacter(character) {
    const inspection = {
      basicInfo: this.getBasicInfo(character),
      consciousnessState: this.getConsciousnessState(character),
      behavioralAnalysis: this.getBehavioralAnalysis(character),
      memoryAnalysis: this.getMemoryAnalysis(character),
      performanceMetrics: this.getPerformanceMetrics(character)
    };

    this.inspectedCharacters.set(character.id, inspection);
    return inspection;
  }

  getBasicInfo(character) {
    return {
      id: character.id,
      name: character.name,
      hasConsciousness: !!character.consciousness,
      consciousnessType: character.consciousness?.constructor.name,
      hasMemories: !!(character.significantMemories?.length > 0),
      memoryCount: character.significantMemories?.length || 0
    };
  }

  getConsciousnessState(character) {
    if (!character.consciousness) {
      return { error: 'No consciousness' };
    }

    const c = character.consciousness;
    return {
      baseFrequency: c.baseFrequency,
      baseCoherence: c.baseCoherence,
      currentFrequency: c.currentFrequency,
      emotionalCoherence: c.emotionalCoherence,
      lastUpdate: new Date(c.lastUpdate).toLocaleString(),
      updateCount: c.updateCount,
      significantEventsCount: c.significantEvents?.length || 0,
      updateTriggerThreshold: c.updateTriggerThreshold
    };
  }

  getBehavioralAnalysis(character) {
    if (!character.consciousness) {
      return { error: 'No consciousness' };
    }

    const behavioralService = new BehavioralStateService();
    const state = character.consciousness.getBehavioralState();

    return {
      currentState: state,
      decisionFactors: {
        social: behavioralService.getBehavioralModifier(character, 'social'),
        combat: behavioralService.getBehavioralModifier(character, 'combat'),
        exploration: behavioralService.getBehavioralModifier(character, 'exploration'),
        economic: behavioralService.getBehavioralModifier(character, 'economic')
      }
    };
  }

  getMemoryAnalysis(character) {
    const memoryService = new SignificantMemoryService();
    const behavioralService = new BehavioralStateService(memoryService);

    return {
      social: behavioralService.getMemoryAnalysis(character, 'social'),
      combat: behavioralService.getMemoryAnalysis(character, 'combat'),
      exploration: behavioralService.getMemoryAnalysis(character, 'exploration'),
      economic: behavioralService.getMemoryAnalysis(character, 'economic')
    };
  }

  getPerformanceMetrics(character) {
    if (!character.consciousness) {
      return { error: 'No consciousness' };
    }

    return character.consciousness.getPerformanceMetrics();
  }

  generateReport(characterId) {
    const inspection = this.inspectedCharacters.get(characterId);
    if (!inspection) {
      return { error: 'Character not inspected' };
    }

    return {
      timestamp: new Date().toISOString(),
      characterId,
      inspection,
      issues: this.identifyIssues(inspection),
      recommendations: this.generateRecommendations(inspection)
    };
  }

  identifyIssues(inspection) {
    const issues = [];

    if (!inspection.basicInfo.hasConsciousness) {
      issues.push('Character has no consciousness');
    }

    if (inspection.behavioralAnalysis.error) {
      issues.push('Behavioral analysis failed: ' + inspection.behavioralAnalysis.error);
    }

    if (inspection.memoryAnalysis.social?.hasMemories === false &&
        inspection.memoryAnalysis.combat?.hasMemories === false) {
      issues.push('Character has no significant memories');
    }

    const perf = inspection.performanceMetrics;
    if (perf.averageUpdateFrequency > 10) {
      issues.push('High update frequency detected');
    }

    return issues;
  }

  generateRecommendations(inspection) {
    const recommendations = [];
    const issues = this.identifyIssues(inspection);

    issues.forEach(issue => {
      switch (issue) {
        case 'Character has no consciousness':
          recommendations.push('Initialize consciousness using EnhancedConsciousnessState');
          break;
        case 'Behavioral analysis failed':
          recommendations.push('Check consciousness state integrity and regenerate if corrupted');
          break;
        case 'Character has no significant memories':
          recommendations.push('Ensure significant events are being processed and stored as memories');
          break;
        case 'High update frequency detected':
          recommendations.push('Increase significance threshold to reduce update frequency');
          break;
      }
    });

    return recommendations;
  }
}

// Usage
const inspector = new ConsciousnessInspector();
const inspection = inspector.inspectCharacter(someCharacter);
const report = inspector.generateReport(someCharacter.id);

console.log('Inspection Report:', report);
```

### Event Processing Debugger

```javascript
class EventProcessingDebugger {
  constructor() {
    this.eventLog = [];
    this.maxLogSize = 1000;
  }

  logEventProcessing(character, event, result) {
    const logEntry = {
      timestamp: Date.now(),
      characterId: character.id,
      characterName: character.name,
      event: { ...event },
      result: { ...result },
      consciousnessBefore: character.consciousness ? {
        baseFrequency: character.consciousness.baseFrequency,
        baseCoherence: character.consciousness.baseCoherence,
        updateCount: character.consciousness.updateCount
      } : null
    };

    this.eventLog.push(logEntry);

    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }
  }

  getProcessingHistory(characterId, limit = 50) {
    return this.eventLog
      .filter(entry => entry.characterId === characterId)
      .slice(-limit);
  }

  analyzeProcessingPatterns(characterId) {
    const history = this.getProcessingHistory(characterId, 100);

    const analysis = {
      totalEvents: history.length,
      successfulUpdates: history.filter(h => h.result.updated).length,
      failedUpdates: history.filter(h => !h.result.updated).length,
      averageSignificance: history.reduce((sum, h) => sum + (h.event.significance || 0), 0) / history.length,
      updateFrequency: this.calculateUpdateFrequency(history),
      commonEventTypes: this.getCommonEventTypes(history)
    };

    return analysis;
  }

  calculateUpdateFrequency(history) {
    if (history.length < 2) return 0;

    const timeSpan = history[history.length - 1].timestamp - history[0].timestamp;
    const updateCount = history.filter(h => h.result.updated).length;

    return updateCount / (timeSpan / (1000 * 60 * 60)); // Updates per hour
  }

  getCommonEventTypes(history) {
    const typeCount = history.reduce((counts, h) => {
      counts[h.event.type] = (counts[h.event.type] || 0) + 1;
      return counts;
    }, {});

    return Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }

  findProcessingAnomalies(characterId) {
    const history = this.getProcessingHistory(characterId, 200);
    const anomalies = [];

    // Check for unusual update patterns
    const recent = history.slice(-20);
    const older = history.slice(-40, -20);

    if (recent.length >= 10 && older.length >= 10) {
      const recentUpdateRate = recent.filter(h => h.result.updated).length / recent.length;
      const olderUpdateRate = older.filter(h => h.result.updated).length / older.length;

      if (recentUpdateRate > olderUpdateRate * 2) {
        anomalies.push('Sudden increase in consciousness updates');
      }
    }

    // Check for failed updates
    const recentFailures = recent.filter(h => !h.result.updated).length;
    if (recentFailures > recent.length * 0.5) {
      anomalies.push('High rate of failed consciousness updates');
    }

    return anomalies;
  }
}
```

## Recovery Procedures

### Emergency Consciousness Reset

```javascript
function performEmergencyConsciousnessReset(world) {
  console.warn('Performing emergency consciousness reset...');

  world.characters.forEach(character => {
    try {
      // Create fresh consciousness state
      character.consciousness = new EnhancedConsciousnessState({
        baseFrequency: 7.5,  // Baseline
        baseCoherence: 0.7   // Baseline
      });

      // Clear corrupted memories
      character.significantMemories = [];

      console.log(`Reset consciousness for ${character.name}`);
    } catch (error) {
      console.error(`Failed to reset consciousness for ${character.name}:`, error);
    }
  });

  console.log('Emergency reset completed');
}
```

### Data Corruption Recovery

```javascript
class DataCorruptionRecovery {
  static async recoverCorruptedWorld(world) {
    console.log('Starting data corruption recovery...');

    const recoveryStats = {
      charactersProcessed: 0,
      consciousnessRepaired: 0,
      memoriesCleaned: 0,
      errors: []
    };

    for (const character of world.characters) {
      try {
        recoveryStats.charactersProcessed++;

        // Check and repair consciousness
        if (this.needsConsciousnessRepair(character)) {
          this.repairConsciousness(character);
          recoveryStats.consciousnessRepaired++;
        }

        // Check and clean memories
        if (this.needsMemoryCleaning(character)) {
          this.cleanMemories(character);
          recoveryStats.memoriesCleaned++;
        }

      } catch (error) {
        recoveryStats.errors.push({
          characterId: character.id,
          error: error.message
        });
      }
    }

    console.log('Recovery completed:', recoveryStats);
    return recoveryStats;
  }

  static needsConsciousnessRepair(character) {
    if (!character.consciousness) return true;

    const c = character.consciousness;
    return !(
      typeof c.baseFrequency === 'number' && c.baseFrequency >= 3 && c.baseFrequency <= 15 &&
      typeof c.baseCoherence === 'number' && c.baseCoherence >= 0.2 && c.baseCoherence <= 1.0
    );
  }

  static repairConsciousness(character) {
    console.log(`Repairing consciousness for ${character.name}`);

    // Try to preserve valid parts
    const oldFrequency = character.consciousness?.baseFrequency;
    const oldCoherence = character.consciousness?.baseCoherence;

    character.consciousness = new EnhancedConsciousnessState({
      baseFrequency: (typeof oldFrequency === 'number' && oldFrequency >= 3 && oldFrequency <= 15)
        ? oldFrequency : 7.5,
      baseCoherence: (typeof oldCoherence === 'number' && oldCoherence >= 0.2 && oldCoherence <= 1.0)
        ? oldCoherence : 0.7
    });
  }

  static needsMemoryCleaning(character) {
    if (!character.significantMemories) return false;
    if (!Array.isArray(character.significantMemories)) return true;

    return character.significantMemories.some(memory =>
      !memory.type || !memory.timestamp || typeof memory.significance !== 'number'
    );
  }

  static cleanMemories(character) {
    console.log(`Cleaning memories for ${character.name}`);

    if (!Array.isArray(character.significantMemories)) {
      character.significantMemories = [];
      return;
    }

    character.significantMemories = character.significantMemories.filter(memory =>
      memory &&
      typeof memory === 'object' &&
      memory.type &&
      typeof memory.timestamp === 'number' &&
      typeof memory.significance === 'number'
    );
  }
}
```

This troubleshooting guide covers the most common issues you'll encounter with the consciousness system. If you encounter issues not covered here, the debugging tools and diagnostician class can help identify the root cause.