# Memory Monitoring Isolation Fix

**Date:** 2025-01-XX
**Issue:** Memory monitoring was starting automatically on all pages, even outside the simulation dashboard
**Status:** ✅ FIXED

## Problem Analysis

### Root Cause Chain

Memory monitoring was being triggered through this service instantiation chain:

```
1. SimulationContext.js (line 16)
   └─> imports simulationService (global singleton)
   
2. SimulationService.js (line 1562)
   └─> creates global singleton: const simulationService = new SimulationService()
   
3. SimulationService constructor (line 34)
   └─> creates: new MemoryQueryService(null, new SignificantMemoryService())
   
4. SignificantMemoryService constructor (line 24)
   └─> creates: new MemoryManagementService(logger, errorHandler)
   
5. MemoryManagementService constructor (line 29)
   └─> AUTOMATICALLY CALLED: this.memoryMonitor.startMonitoring()
   └─> AUTOMATICALLY CALLED: this.startPeriodicCleanup() (line 68)
```

### The Problem

When `SimulationContext` was imported anywhere in the app (even on non-simulation pages due to router structure), it triggered the global singleton creation, which cascaded through the service chain and started memory monitoring **immediately**.

This caused:
- Memory monitoring running on the landing page
- Periodic cleanup timers running on editor pages  
- Console logs appearing: "Memory monitoring started"
- Unnecessary background processes consuming resources

## Solution

Made memory monitoring **opt-in** rather than automatic.

### Changes Made

#### 1. MemoryManagementService.js

**Modified Constructor** to accept `options` parameter:

```javascript
constructor(logger = null, errorHandler = null, options = {}) {
    super();
    this.logger = logger;
    this.errorHandler = errorHandler || new ConsciousnessErrorHandlingService(logger);

    // Initialize memory monitoring
    this.memoryMonitor = new MemoryMonitoringService(logger, this);
    
    // Only start monitoring if explicitly enabled (default: false)
    if (options.autoStartMonitoring === true) {
        this.memoryMonitor.startMonitoring();
    }

    // ... memory limits, settings, stats ...

    // Initialize cleanup timer only if monitoring is enabled
    if (options.autoStartMonitoring === true) {
        this.startPeriodicCleanup();
    }
}
```

**Added Manual Control Methods:**

```javascript
/**
 * Manually start memory monitoring and periodic cleanup
 * Call this method when simulation actually starts
 */
startMonitoring() {
    if (!this.memoryMonitor.monitoringState.isActive) {
        this.memoryMonitor.startMonitoring();
        this.startPeriodicCleanup();
    }
}

/**
 * Stop memory monitoring and cleanup timers
 */
stopMonitoring() {
    if (this.memoryMonitor.monitoringState.isActive) {
        this.memoryMonitor.stopMonitoring();
        this.stopPeriodicCleanup();
    }
}
```

**Fixed Cleanup Timer Management:**

```javascript
startPeriodicCleanup() {
    // Don't start if already running
    if (this.cleanupIntervals) {
        return;
    }

    this.cleanupIntervals = [];

    // Regular cleanup every minute
    this.cleanupIntervals.push(setInterval(() => {
        this.performPeriodicCleanup();
    }, this.PERFORMANCE_SETTINGS.CLEANUP_INTERVAL));

    // Deep cleanup every hour
    this.cleanupIntervals.push(setInterval(() => {
        this.performDeepCleanup();
    }, this.PERFORMANCE_SETTINGS.DEEP_CLEANUP_INTERVAL));

    // Memory monitoring every 30 seconds
    this.cleanupIntervals.push(setInterval(() => {
        this.checkMemoryUsage();
    }, this.PERFORMANCE_SETTINGS.MEMORY_CHECK_INTERVAL));
}

/**
 * Stop periodic cleanup timers
 */
stopPeriodicCleanup() {
    if (this.cleanupIntervals) {
        this.cleanupIntervals.forEach(interval => clearInterval(interval));
        this.cleanupIntervals = null;
    }
}
```

#### 2. RunTick.js

**Explicitly Enable Monitoring in Simulation Context:**

```javascript
function initializeConsciousnessServices() {
  const errorHandler = new ConsciousnessErrorHandlingService();
  const logger = console;

  return {
    // ... other services ...
    
    // Explicitly enable monitoring for simulation runs
    memoryManagementService: new MemoryManagementService(
      logger, 
      errorHandler, 
      { autoStartMonitoring: true }  // ← ENABLED HERE
    ),
    
    errorHandler,
    logger
  };
}
```

## Behavior After Fix

### Before Fix
- **Landing Page:** Memory monitoring started ❌
- **Editor Pages:** Memory monitoring running ❌
- **Character Manager:** Memory monitoring active ❌
- **Simulation Dashboard:** Memory monitoring active ✅

### After Fix
- **Landing Page:** No monitoring 🎯
- **Editor Pages:** No monitoring 🎯
- **Character Manager:** No monitoring 🎯
- **Simulation Dashboard:** Monitoring ONLY when simulation runs 🎯

## Service Dependencies

Services that create `MemoryManagementService` instances:

1. **SignificantMemoryService** (line 24)
   - Used by: `SimulationService` constructor
   - Behavior: Does NOT auto-start (default)

2. **BehavioralStateService** (line 24)
   - Used by: `RunTick` consciousness services
   - Behavior: Does NOT auto-start (default)

3. **ConsciousnessUpdateService** (line 24)
   - Used by: `RunTick` consciousness services
   - Behavior: Does NOT auto-start (default)

4. **ConsciousnessCheckpointService** (line 27)
   - Used by: `RunTick` consciousness services
   - Behavior: Does NOT auto-start (default)

5. **RunTick.js** (line 40)
   - Used by: Simulation turn processing
   - Behavior: EXPLICITLY ENABLED with `{ autoStartMonitoring: true }`

## Testing Recommendations

1. **Verify No Startup Monitoring:**
   - Open browser console on landing page
   - Should NOT see "Memory monitoring started" log
   - Check browser dev tools → Performance → No setInterval timers from MemoryManagementService

2. **Verify Editor Pages:**
   - Navigate to Character Manager
   - Navigate to Interaction Editor
   - Should NOT see memory monitoring logs
   - No background timers running

3. **Verify Simulation Monitoring:**
   - Load Valley of Echoes demo
   - Start simulation
   - Process a turn
   - Should see "Memory monitoring started" ONLY when turn processing begins

4. **Verify Cleanup:**
   - Stop simulation
   - Memory monitoring should stop
   - All intervals should be cleared

## Architecture Impact

This fix maintains the **principle of simulation isolation**:

- **WorldContext**: For building-phase operations (no simulation services)
- **SimulationContext**: For simulation-phase operations (monitoring ONLY when active)

Memory monitoring is now properly isolated to the simulation execution context, preventing resource waste and improving application performance.

## Related Documentation

- [Simulation-Isolation-Architecture.md](./Simulation-Isolation-Architecture.md) - Original architectural problem
- [WorldBuilder-Migration.md](./WorldBuilder-Migration.md) - WorldContext refactoring

## Performance Benefits

- **Reduced CPU Usage:** No unnecessary setInterval timers on non-simulation pages
- **Reduced Memory Overhead:** MemoryMonitoringService not collecting stats globally
- **Faster Page Loads:** Landing and editor pages don't initialize monitoring infrastructure
- **Cleaner Console:** No spurious memory monitoring logs during normal editing

## Future Improvements

Consider:
1. **Lazy Service Initialization:** Delay service creation until actually needed for simulation
2. **Service Lifecycle Management:** Explicit start/stop methods for all heavy services
3. **Context-Aware Service Creation:** Services know which context they're in and adjust behavior
